import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/layout/BottomNav";
import { useScheduledNotifications } from "@/hooks/useScheduledNotifications";
import { todayString } from "@/lib/hydration";

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
      if (mounted) {
        setProfile(profiles[0] || null);
        setUserName(user.full_name || "");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Lightweight onboarding redirect: runs only after the profile resolves,
  // never on every navigation, so transitions stay smooth.
  useEffect(() => {
    if (profile && !profile.onboarding_completed && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [profile, location.pathname, navigate]);

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