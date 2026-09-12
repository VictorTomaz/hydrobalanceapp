// StoreKit / In-App Purchase para iOS, via cordova-plugin-purchase.
//
// O gate de acesso continua sendo UserProfile.subscription_status no Base44 — o que muda
// é a origem: antes vinha do webhook da Wix, agora vem da validação do recibo da Apple.
//
// Fluxo:
//   1. initStore() registra o produto e os listeners (uma vez, no boot do app nativo)
//   2. purchase() abre a folha de pagamento da Apple
//   3. ao aprovar, o recibo vai para a function `validate-apple-receipt` do Base44,
//      que confirma com a Apple e grava subscription_status = "active"
//   4. finish() encerra a transação só depois da confirmação do servidor

import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { SUBSCRIPTION_PRODUCT_ID } from '@/lib/subscription';

let store = null;
let initialized = false;
let initPromise = null;

// Ponte entre o evento assíncrono `approved` do plugin e a Promise devolvida por
// purchase(): `offer.order()` resolve quando o pedido é ENVIADO, não quando a
// Apple aprova. A confirmação real (e a validação do recibo no backend) só
// acontece no listener `approved`. Sem esta ponte, quem chama purchase() navega
// antes de subscription_status virar "active".
let pendingOrder = null;

function settlePendingOrder(kind, value) {
  if (!pendingOrder) return;
  const { resolve, reject, timer } = pendingOrder;
  clearTimeout(timer);
  pendingOrder = null;
  if (kind === 'resolve') resolve(value);
  else reject(value);
}

// O plugin expõe CdvPurchase no escopo global depois que o Capacitor carrega os plugins Cordova.
function getStore() {
  if (typeof window === 'undefined') return null;
  return window.CdvPurchase?.store ?? null;
}

export function isNativeIOS() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * Inicializa a loja. Seguro chamar várias vezes — só executa uma vez.
 * Fora do iOS nativo é um no-op, então o app web continua funcionando.
 */
export function initStore({ onStatusChange } = {}) {
  if (!isNativeIOS()) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    const start = () => {
      store = getStore();
      if (!store) {
        console.warn('[storekit] CdvPurchase indisponível');
        resolve(false);
        return;
      }

      const { ProductType, Platform, LogLevel } = window.CdvPurchase;
      store.verbosity = LogLevel.WARNING;

      store.register([
        {
          id: SUBSCRIPTION_PRODUCT_ID,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.APPLE_APPSTORE,
        },
      ]);

      // A Apple aprovou a compra: agora validamos no nosso backend.
      store.when().approved(async (transaction) => {
        try {
          await syncReceipt();
          transaction.finish();
          onStatusChange?.('active');
          settlePendingOrder('resolve', 'active');
        } catch (e) {
          // NÃO damos finish: sem confirmação do servidor a transação fica pendente
          // e o plugin tenta de novo no próximo boot, evitando cobrança sem acesso.
          console.error('[storekit] validação falhou, transação mantida pendente', e);
          onStatusChange?.('error');
          settlePendingOrder('reject', e instanceof Error ? e : new Error(String(e)));
        }
      });

      store.error((err) => {
        console.error('[storekit] erro', err?.code, err?.message);
        // Só liberamos purchase() em erros que de fato encerram a compra
        // (cancelamento ou pagamento recusado). Erros transitórios de refresh/rede
        // são ignorados aqui — o timeout ou o listener `approved` decidem.
        const EC = window.CdvPurchase?.ErrorCode ?? {};
        const fatal = new Set(
          [EC.PAYMENT_CANCELLED, EC.PAYMENT_NOT_ALLOWED, EC.PAYMENT_INVALID, EC.PURCHASE].filter((c) => c != null),
        );
        if (!fatal.has(err?.code)) return;
        if (err?.code === EC.PAYMENT_CANCELLED) {
          settlePendingOrder('reject', Object.assign(new Error('Purchase cancelled.'), { code: 'CANCELLED' }));
        } else {
          settlePendingOrder('reject', new Error(err?.message || 'Purchase failed.'));
        }
      });

      store.initialize([Platform.APPLE_APPSTORE]).then(() => {
        initialized = true;
        resolve(true);
      }).catch((e) => {
        console.error('[storekit] initialize falhou', e);
        resolve(false);
      });
    };

    if (getStore()) start();
    else document.addEventListener('deviceready', start, { once: true });
  });

  return initPromise;
}

/** Produto registrado, já com preço localizado vindo da App Store. */
export function getProduct() {
  const s = store ?? getStore();
  if (!s) return null;
  const { Platform } = window.CdvPurchase;
  return s.get(SUBSCRIPTION_PRODUCT_ID, Platform.APPLE_APPSTORE) ?? null;
}

/** Preço formatado pela Apple (respeita moeda e região do usuário). */
export function getLocalizedPrice() {
  const p = getProduct();
  return p?.pricing?.price ?? p?.offers?.[0]?.pricingPhases?.[0]?.price ?? null;
}

/**
 * Abre a folha de pagamento da Apple e só resolve quando a compra foi aprovada
 * pela Apple E o recibo já foi validado no backend (subscription_status = "active").
 * Rejeita em cancelamento, erro de pagamento, falha de validação ou timeout.
 */
export async function purchase() {
  if (!initialized) await initStore();
  const product = getProduct();
  if (!product) throw new Error('Produto indisponível na App Store.');
  const offer = product.getOffer();
  if (!offer) throw new Error('Nenhuma oferta disponível para este produto.');

  if (pendingOrder) throw new Error('Já existe uma compra em andamento.');

  return new Promise((resolve, reject) => {
    pendingOrder = {
      resolve,
      reject,
      // Sandbox é lento: já observamos ~55s só até o recibo aparecer, mais o
      // round-trip de validação no backend. Damos folga, mas não penduramos pra sempre.
      timer: setTimeout(() => {
        settlePendingOrder(
          'reject',
          new Error('A confirmação da compra demorou demais. Se você foi cobrado, reabra o app ou use "Restore purchases".'),
        );
      }, 120000),
    };

    // order() resolve quando o pedido é ENVIADO; o resultado real chega pelos
    // listeners `approved`/`error`. Em erro imediato (ex.: oferta inválida),
    // rejeitamos aqui. v13 pode resolver com um IError em vez de rejeitar.
    Promise.resolve(offer.order())
      .then((maybeErr) => {
        if (maybeErr && (maybeErr.isError || maybeErr.code || maybeErr.message)) {
          settlePendingOrder('reject', new Error(maybeErr.message || 'Não foi possível iniciar a compra.'));
        }
      })
      .catch((e) => {
        settlePendingOrder('reject', e instanceof Error ? e : new Error(String(e)));
      });
  });
}

/** Restaurar compras — obrigatório pela diretriz 3.1.1 da Apple. */
export async function restore() {
  if (!initialized) await initStore();
  const s = store ?? getStore();
  if (!s) throw new Error('Loja indisponível.');
  await s.restorePurchases();
  return syncReceipt();
}

/**
 * Envia o recibo do app para o backend validar com a Apple e atualizar o perfil.
 * Retorna o subscription_status resultante.
 */
export async function syncReceipt() {
  const s = store ?? getStore();
  const receipts = s?.localReceipts ?? [];
  const appleReceipt = receipts.find((r) => r.platform === window.CdvPurchase.Platform.APPLE_APPSTORE);
  const receiptData = appleReceipt?.nativeData?.appStoreReceipt ?? null;

  if (!receiptData) throw new Error('Recibo da App Store não disponível.');

  const res = await base44.functions.invoke('validate-apple-receipt', {
    receiptData,
    productId: SUBSCRIPTION_PRODUCT_ID,
  });

  const status = res?.data?.subscription_status ?? res?.subscription_status;
  if (status !== 'active') throw new Error('Assinatura não confirmada pelo servidor.');
  return status;
}
