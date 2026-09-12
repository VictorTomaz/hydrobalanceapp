import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/layout/BottomNav";
import { useScheduledNotifications } from "@/hooks/useScheduledNotifications";
import { todayString } from "@/lib/hydration";
import { hasAppAccess } from "@/lib/subscription";

export default function AppLayout() {
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch the profile once when the layout mounts. Routing changes no longer
  // trigger a full-screen spinner — the profile is stable for the session.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      const fetched = profiles[0] || null;
      if (mounted) {
        setProfile(fetched);
        setUserName(user.full_name || "");
        setLoading(false);
      }
      // Lazy migration: grant a 7-day trial start to existing onboarded profiles that predate subscriptions.
      if (fetched && fetched.onboarding_completed && !fetched.trial_start_date) {
        try {
          const updated = await base44.entities.UserProfile.update(fetched.id, {
            trial_start_date: new Date().toISOString(),
          });
          if (mounted) setProfile(updated);
        } catch (_) {
          /* non-fatal */
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Lightweight onboarding redirect: runs only after the profile resolves,
  // never on every navigation, so transitions stay smooth. A brand-new user
  // has no profile record at all — send them to onboarding to create one
  // (otherwise Home hangs on its "no profile" loading spinner forever).
  useEffect(() => {
    if (loading) return;
    if (location.pathname === "/onboarding") return;
    const needsOnboarding = !profile || !profile.onboarding_completed;
    if (needsOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [profile, loading, location.pathname, navigate]);

  // Subscription gating: after onboarding, the whole app requires either an active subscription
  // or an active 7-day trial. Allow /subscribe and /settings so the user can subscribe or reach
  // account actions even while paywalled.
  useEffect(() => {
    if (loading) return;
    const allowedWithoutSub = ["/onboarding", "/subscribe", "/settings"];
    if (allowedWithoutSub.includes(location.pathname)) return;
    if (!profile || !profile.onboarding_completed) return;
    if (!hasAppAccess(profile)) {
      navigate("/subscribe", { replace: true });
    }
  }, [profile, loading, location.pathname, navigate]);

  useScheduledNotifications(profile, todayString());

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F7FBFD] dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-[#EAF2FB] border-t-[#2BC4BB] rounded-full animate-spin"></div>
      </div>
    );
  }

  const showNav = location.pathname !== "/onboarding";

  return (
    <div className="min-h-screen bg-[#F7FBFD] dark:bg-slate-900">
      <div className={`pt-[env(safe-area-inset-top,32px)] ${showNav ? "pb-24" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Outlet context={{ profile, setProfile, userName }} />
          </motion.div>
        </AnimatePresence>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}