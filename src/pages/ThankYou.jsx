import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Droplets } from "lucide-react";

// PUBLIC page — reachable by anonymous buyers returning from Wix checkout. The subscription
// grant is asynchronous (the ORDER_APPROVED webhook flips subscription_status), so we poll the
// signed-in buyer's profile for a few seconds and only then send them home; if they're not signed
// in, or it times out, we still confirm and let them head back manually.
export default function ThankYou() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("confirming"); // confirming | active | pending

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    (async () => {
      let user = null;
      try {
        user = await base44.auth.me();
      } catch (_) {
        user = null;
      }
      if (!user) {
        setStatus("pending");
        return;
      }
      const tick = async () => {
        if (cancelled) return;
        attempts += 1;
        try {
          const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
          const p = profiles?.[0];
          if (p?.subscription_status === "active") {
            if (!cancelled) setStatus("active");
            return;
          }
        } catch (_) {
          /* keep polling */
        }
        if (attempts < 10) {
          setTimeout(tick, 1500);
        } else if (!cancelled) {
          setStatus("pending");
        }
      };
      tick();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "active") {
      const t = setTimeout(() => navigate("/", { replace: true }), 900);
      return () => clearTimeout(t);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-[#EAF7FA] to-[#F7FBFD] dark:from-slate-900 dark:to-slate-900">
      <Droplets className="w-12 h-12 text-[#2BC4BB] mb-4" />
      <h1 className="font-heading text-3xl font-extrabold text-[#3A4759] dark:text-slate-100 text-center">
        Thank you! 💙
      </h1>

      {status === "active" ? (
        <div className="text-center mt-2 space-y-3">
          <p className="text-[#5C6B7D] dark:text-slate-300">
            Your WaterRest Pro subscription is active.
          </p>
          <Check className="w-6 h-6 text-[#2BC4BB] mx-auto" />
          <p className="text-sm text-[#8A97A8] dark:text-slate-400">Taking you back to the app...</p>
        </div>
      ) : status === "pending" ? (
        <div className="text-center mt-2 space-y-4">
          <p className="text-[#5C6B7D] dark:text-slate-300">
            Your payment was received — we're still confirming your subscription.
          </p>
          <p className="text-sm text-[#8A97A8] dark:text-slate-400">
            Your access will unlock shortly. If this takes more than a few minutes, try reopening the app.
          </p>
          <Button
            onClick={() => navigate("/", { replace: true })}
            className="rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold h-11"
          >
            Back to WaterRest
          </Button>
        </div>
      ) : (
        <div className="text-center mt-2 space-y-3">
          <Loader2 className="w-6 h-6 text-[#2BC4BB] mx-auto animate-spin" />
          <p className="text-[#5C6B7D] dark:text-slate-300">
            Confirming your payment...
          </p>
        </div>
      )}
    </div>
  );
}