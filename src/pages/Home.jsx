import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProgressRing from "@/components/hydration/ProgressRing";
import DrinkPresets from "@/components/hydration/DrinkPresets";
import CustomAmountDialog from "@/components/hydration/CustomAmountDialog";
import TodayLogList from "@/components/hydration/TodayLogList";
import PullToRefresh from "@/components/hydration/PullToRefresh";
import Mascot from "@/components/mascot/Mascot";
import { todayString, formatAmount } from "@/lib/hydration";
import { requestNotificationPermission } from "@/hooks/useScheduledNotifications";
import { toast } from "@/components/ui/use-toast";
import { Bell } from "lucide-react";

export default function Home() {
  const { profile, userName } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounce, setBounce] = useState(false);
  const today = todayString();

  const fetchLogs = async () => {
    const user = await base44.auth.me();
    const todayLogs = await base44.entities.HydrationLog.filter({ created_by_id: user.id, date: today });
    setLogs(todayLogs);
  };

  useEffect(() => {
    (async () => {
      await fetchLogs();
      setLoading(false);
    })();
  }, [today]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#EAF2FB] border-t-[#7FD1D9] rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const goal = profile.daily_goal_ml || 2000;
  const percent = Math.round((totalMl / goal) * 100);
  const remaining = Math.max(0, goal - totalMl);
  const displayPercent = Math.min(100, percent);
  const needsPermission = "Notification" in window && Notification.permission === "default";

  const logDrink = async (amount_ml, drink_type) => {
    // Optimistic UI: show the entry instantly, then reconcile with the server.
    const tempId = `temp-${Date.now()}`;
    setLogs((prev) => [...prev, { id: tempId, date: today, amount_ml, drink_type }]);
    setBounce(true);
    setTimeout(() => setBounce(false), 700);
    try {
      const created = await base44.entities.HydrationLog.create({ date: today, amount_ml, drink_type });
      setLogs((prev) => prev.map((l) => (l.id === tempId ? created : l)));
    } catch (err) {
      setLogs((prev) => prev.filter((l) => l.id !== tempId));
    }
  };

  const deleteLog = (id) => {
    const target = logs.find((l) => l.id === id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    let undone = false;
    const t = toast({
      title: "Entry removed",
      description: target ? `${formatAmount(target.amount_ml, profile.unit_preference)} deleted` : undefined,
      action: (
        <button
          onClick={() => {
            undone = true;
            if (target) setLogs((prev) => [...prev, target]);
            t.dismiss();
          }}
          className="inline-flex h-8 items-center rounded-md border px-3 text-sm font-bold text-[#2BC4BB] hover:bg-[#EAF7FA]"
        >
          Undo
        </button>
      ),
    });
    // Commit the deletion after a brief grace period (cancellable via Undo).
    setTimeout(() => {
      if (!undone) base44.entities.HydrationLog.delete(id).catch(() => {});
    }, 4000);
    // Auto-dismiss the toast once the grace window has closed so they don't stack up.
    setTimeout(() => t.dismiss(), 5000);
  };

  return (
    <PullToRefresh onRefresh={fetchLogs}>
    <div className="max-w-md mx-auto px-5 pt-8 pb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Hi{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋</h1>
        {needsPermission && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center gap-1 text-xs font-bold text-[#2BC4BB] bg-[#EAF7FA] dark:bg-slate-800 rounded-full px-3 py-1.5"
          >
            <Bell className="w-3.5 h-3.5" /> Enable reminders
          </button>
        )}
      </div>
      <p className="text-[#687785] dark:text-slate-400 mb-6">
        {percent >= 100 ? "You crushed your goal today!" : `${formatAmount(remaining, profile.unit_preference)} left to reach your goal`}
      </p>

      <div className="flex justify-center mb-8">
        <ProgressRing percent={percent}>
          <div className="flex flex-col items-center">
            <Mascot percent={percent} size={90} bounce={bounce} />
            <div className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100 mt-1">{displayPercent}%{percent > 100 ? "+" : ""}</div>
            <div className="text-xs text-[#687785] dark:text-slate-400 font-bold">
              {formatAmount(totalMl, profile.unit_preference)} / {formatAmount(goal, profile.unit_preference)}
            </div>
          </div>
        </ProgressRing>
      </div>

      <div className="space-y-3">
        <DrinkPresets onLog={logDrink} unit={profile.unit_preference} />
        <CustomAmountDialog onLog={logDrink} unit={profile.unit_preference} />
      </div>

      <TodayLogList logs={logs} unit={profile.unit_preference} onDelete={deleteLog} />
    </div>
    </PullToRefresh>
  );
}