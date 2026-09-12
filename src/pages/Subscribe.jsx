import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, Check, Sparkles, Loader2 } from "lucide-react";
import Mascot from "@/components/mascot/Mascot";
import {
  SUBSCRIPTION_PRICE,
  trialDaysRemaining,
  isSubscriptionActive,
} from "@/lib/subscription";
import {
  isNativeIOS,
  initStore,
  purchase,
  restore,
  getLocalizedPrice,
} from "@/lib/storekit";

const PERKS = [
  "Unlimited daily hydration logging & streaks",
  "Full wind-down routines with audio guidance",
  "Custom wind-down activities & reminders",
  "Weekly history & progress insights",
];

export default function Subscribe() {
  const { profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Recarrega o perfil do Base44 (subscription_status já gravado pelo backend) e
  // volta pra Home via navegação SPA. NUNCA usar window.location.href aqui: o
  // reload da WebView mata o contexto JS antes dos listeners `approved` do
  // StoreKit finalizarem (transaction.finish()) as transações pendentes — foi o
  // que deixou transações presas na fila e passou a "ativar" usuários no boot.
  const refreshAndGoHome = async () => {
    try {
      const user = await base44.auth.me();
      const list = await base44.entities.UserProfile.filter(
        { created_by_id: user.id },
        "-created_date",
        1,
      );
      if (list?.[0]) setProfile(list[0]);
    } catch (e) {
      console.error("Subscribe: profile refresh failed", e);
    }
    navigate("/", { replace: true });
  };

  const daysLeft = trialDaysRemaining(profile);
  const activeSub = isSubscriptionActive(profile);
  const trialOver = !activeSub && daysLeft <= 0;

  // Preço vindo da própria App Store (moeda e formato corretos por região).
  // Cai para o valor fixo quando não é iOS nativo ou a loja ainda não respondeu.
  const [storePrice, setStorePrice] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!isNativeIOS()) return;
    let alive = true;
    initStore().then((ready) => {
      if (alive && ready) setStorePrice(getLocalizedPrice());
    });
    return () => {
      alive = false;
    };
  }, []);

  const displayPrice = storePrice ?? `$${SUBSCRIPTION_PRICE}`;

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      // purchase() agora só resolve depois da aprovação da Apple + validação do
      // recibo no backend (subscription_status = "active"). Só então voltamos,
      // para o gate reavaliar já com o status novo.
      await purchase();
      await refreshAndGoHome();
    } catch (e) {
      console.error("Subscribe: purchase failed", e);
      // Cancelamento do usuário não é erro — só volta ao estado normal do botão.
      if (e?.code !== "CANCELLED") {
        setError(e?.message || "Purchase could not be completed. Please try again.");
      }
      setLoading(false);
    }
  };

  // Exigido pela Apple: o usuário precisa conseguir restaurar uma assinatura
  // já paga (troca de aparelho, reinstalação) sem pagar de novo.
  const handleRestore = async () => {
    setRestoring(true);
    setError("");
    try {
      await restore();
      await refreshAndGoHome();
    } catch (e) {
      console.error("Subscribe: restore failed", e);
      setError("No previous subscription found on this Apple ID.");
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-[#EAF7FA] to-[#F7FBFD] dark:from-slate-900 dark:to-slate-900">
      <button
        onClick={() => navigate(-1)}
        className="self-start mb-4 inline-flex items-center gap-1 text-sm font-heading font-bold text-[#5C6B7D] dark:text-slate-300 hover:text-[#2BC4BB]"
        aria-label="Back"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Mascot percent={activeSub ? 100 : 35} size={96} />
      <h1 className="font-heading text-3xl font-extrabold text-[#3A4759] dark:text-slate-100 mt-4 mb-1 text-center">
        WaterRest Pro
      </h1>
      <p className="text-[#8A97A8] dark:text-slate-400 text-center max-w-xs mb-6">
        {activeSub
          ? "You're a Pro member — thanks for supporting WaterRest! 💙"
          : trialOver
            ? "Your 7-day free trial has ended. Subscribe to keep going."
            : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Subscribe to keep your streak going.`}
      </p>

      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_0_0_#E3EEF7] dark:shadow-none border-2 border-[#EAF2FB] dark:border-slate-700">
        <div className="flex items-end justify-center gap-1 mb-5">
          <span className="font-heading text-4xl font-extrabold text-[#3A4759] dark:text-slate-100">
            {displayPrice}
          </span>
          <span className="text-[#8A97A8] dark:text-slate-400 mb-1.5">/ month</span>
        </div>

        <ul className="space-y-2.5 mb-6">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-[#5C6B7D] dark:text-slate-300">
              <Check className="w-4 h-4 text-[#2BC4BB] mt-0.5 shrink-0" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        {activeSub ? (
          <div className="text-center text-sm font-heading font-bold text-[#2BC4BB] py-2">
            <Sparkles className="w-4 h-4 inline mr-1" /> Subscription active
          </div>
        ) : (
          <>
            <Button
              onClick={handleSubscribe}
              disabled={loading || restoring}
              className="w-full rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold text-base h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe — ${displayPrice}/mo`
              )}
            </Button>

            {/* Restaurar compras é obrigatório pela Apple para apps com assinatura. */}
            <button
              onClick={handleRestore}
              disabled={loading || restoring}
              className="w-full text-sm text-[#2BC4BB] font-medium mt-3 disabled:opacity-50"
            >
              {restoring ? "Restoring..." : "Restore purchases"}
            </button>

            <p className="text-xs text-[#8A97A8] dark:text-slate-400 text-center mt-3 leading-relaxed">
              Auto-renews monthly until cancelled. Payment is charged to your Apple ID at
              purchase confirmation. Manage or cancel anytime in your Apple ID settings.
            </p>
            {error && (
              <p className="text-sm text-red-500 text-center mt-2" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-6 text-xs text-[#8A97A8] dark:text-slate-400">
        <Droplets className="w-3.5 h-3.5 text-[#2BC4BB]" />
        Rest easy, stay hydrated.
      </div>
    </div>
  );
}