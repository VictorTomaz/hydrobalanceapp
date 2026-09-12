import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { secrets } from "base44:runtime";

const PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";
const SANDBOX_RECEIPT_IN_PRODUCTION = 21007;

async function verifyWithApple(receiptData: string, sharedSecret: string) {
  const payload = {
    "receipt-data": receiptData,
    password: sharedSecret,
    "exclude-old-transactions": true,
  };
  const call = async (url: string) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.json();
  };
  let result = await call(PRODUCTION_URL);
  if (result?.status === SANDBOX_RECEIPT_IN_PRODUCTION) {
    result = await call(SANDBOX_URL);
    result.__environment = "sandbox";
  } else {
    result.__environment = "production";
  }
  return result;
}

function findActiveSubscription(result: any, productId: string) {
  const entries: any[] = result?.latest_receipt_info ?? [];
  const now = Date.now();
  let latest: any = null;
  for (const e of entries) {
    if (e.product_id !== productId) continue;
    const expiresMs = Number(e.expires_date_ms ?? 0);
    if (!Number.isFinite(expiresMs)) continue;
    if (expiresMs > now && (!latest || expiresMs > Number(latest.expires_date_ms))) latest = e;
  }
  return latest;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const receiptData: string | undefined = body?.receiptData;
    const productId: string = body?.productId ?? "waterrest_pro_monthly";
    if (!receiptData) return Response.json({ error: "receiptData is required" }, { status: 400 });

    const sharedSecret = secrets.get("APPLE_SHARED_SECRET");
    if (!sharedSecret) {
      return Response.json({ error: "Missing APPLE_SHARED_SECRET" }, { status: 500 });
    }

    const result = await verifyWithApple(receiptData, sharedSecret);
    if (result?.status !== 0) {
      return Response.json({ error: "Invalid receipt", appleStatus: result?.status }, { status: 400 });
    }

    const profiles = await base44.entities.UserProfile.filter(
      { created_by_id: user.id }, "-created_date", 1,
    );
    const profile = profiles?.[0];
    if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

    const active = findActiveSubscription(result, productId);
    const originalTxId: string | null = active?.original_transaction_id ?? null;

    // Uma assinatura pertence a quem a comprou. O recibo do app (StoreKit 1)
    // traz TODAS as transações do Apple ID naquele aparelho — então, num
    // aparelho compartilhado (ou em testes de sandbox com várias contas Base44
    // sob o mesmo Apple ID), o usuário B pode acabar validando um recibo que
    // contém a compra do usuário A. Amarramos o original_transaction_id ao
    // primeiro perfil que o reivindica e recusamos ativar qualquer outro.
    if (active && originalTxId) {
      const claimants = await base44.entities.UserProfile.filter(
        { subscription_original_transaction_id: originalTxId }, "-created_date", 10,
      );
      const otherOwner = (claimants ?? []).find((p: any) => p.id !== profile.id);
      if (otherOwner) {
        console.warn(
          `validate-apple-receipt: original_transaction_id ${originalTxId} ja pertence ao perfil ` +
          `${otherOwner.id}; recusando ativar o perfil ${profile.id} (user ${user.id})`,
        );
        return Response.json({
          subscription_status: profile.subscription_status ?? "expired",
          environment: result.__environment,
          error: "receipt_belongs_to_another_account",
        }, { status: 409 });
      }
    }

    const status = active ? "active" : "expired";

    // Só sobrescrevemos o original_transaction_id quando temos um valor novo.
    // Se a assinatura expirou (sem entrada ativa no recibo), preservamos o
    // vínculo existente para o id não ficar "livre" para outra conta reivindicar.
    const updateData: Record<string, unknown> = {
      subscription_status: status,
      subscription_product_id: productId,
      subscription_expires_at: active ? new Date(Number(active.expires_date_ms)).toISOString() : null,
      subscription_environment: result.__environment,
    };
    if (originalTxId) updateData.subscription_original_transaction_id = originalTxId;

    await base44.entities.UserProfile.update(profile.id, updateData);

    return Response.json({
      subscription_status: status,
      expires_at: active ? new Date(Number(active.expires_date_ms)).toISOString() : null,
      environment: result.__environment,
    });
  } catch (e) {
    console.error("validate-apple-receipt failed", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
