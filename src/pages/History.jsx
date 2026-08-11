import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatAmount } from "@/lib/hydration";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import moment from "moment";

export default function History() {
  const { profile } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [winddownLogs, setWinddownLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const all = await base44.entities.HydrationLog.filter({ created_by_id: user.id }, "-date", 500);
      const winddown = await base44.entities.WindDownLog.filter({ created_by_id: user.id }, "-date", 500);
      setLogs(all);
      setWinddownLogs(winddown);
      setLoading(false);
    })();
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#EAF2FB] border-t-[#2BC4BB] rounded-full animate-spin"></div>
      </div>
    );
  }

  const byDay = {};
  logs.forEach((log) => {
    byDay[log.date] = (byDay[log.date] || 0) + log.amount_ml;
  });

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const date = moment().subtract(6 - i, "days").format("YYYY-MM-DD");
    return {
      date,
      label: moment(date).format("ddd"),
      total: byDay[date] || 0,
      goalMet: (byDay[date] || 0) >= profile.daily_goal_ml,
    };
  });

  // Count consecutive met days up to yesterday, then add today only if already met —
  // so an un-met "today" doesn't zero out a streak built over prior days.
  let streak = 0;
  for (let i = last7.length - 2; i >= 0; i--) {
    if (last7[i].goalMet) streak++;
    else break;
  }
  if (last7[last7.length - 1].goalMet) streak++;

  const hasHydrationThisWeek = last7.some((d) => d.total > 0);
  const chartMax = Math.max(profile.daily_goal_ml || 0, ...last7.map((d) => d.total));

  const winddownByDay = {};
  winddownLogs.forEach((log) => {
    winddownByDay[log.date] = log.completed;
  });

  const winddownLast7 = Array.from({ length: 7 }).map((_, i) => {
    const date = moment().subtract(6 - i, "days").format("YYYY-MM-DD");
    return { date, completed: !!winddownByDay[date] };
  });

  const winddownCompletedCount = winddownLast7.filter((d) => d.completed).length;

  let winddownStreak = 0;
  for (let i = winddownLast7.length - 2; i >= 0; i--) {
    if (winddownLast7[i].completed) winddownStreak++;
    else break;
  }
  if (winddownLast7[winddownLast7.length - 1].completed) winddownStreak++;

  return (
    <div className="max-w-md mx-auto px-5 pt-8">
      <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Your Progress</h1>
      <p className="text-[#687785] dark:text-slate-400 mb-6">Keep the streak alive 🌊</p>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-[0_6px_0_0_#E3EEF7] dark:shadow-none border-2 border-[#EAF2FB] dark:border-slate-700 mb-5">
        <span className="font-heading font-bold text-[#3A4759] dark:text-slate-100 block mb-3">Weekly Summary</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F4FAFB] dark:bg-slate-700 p-3 text-center">
            <div className="text-xl">💧</div>
            {streak > 0 ? (
              <div className="font-heading font-bold text-[#3A4759] dark:text-slate-100">🔥 {streak} day{streak === 1 ? "" : "s"}</div>
            ) : (
              <div className="font-heading font-bold text-[#687785] dark:text-slate-400">No streak yet</div>
            )}
            <div className="text-xs text-[#687785] dark:text-slate-400">Hydration streak</div>
          </div>
          <div className="rounded-2xl bg-[#F4FAFB] dark:bg-slate-700 p-3 text-center">
            <div className="text-xl">🌙</div>
            {winddownStreak > 0 ? (
              <div className="font-heading font-bold text-[#3A4759] dark:text-slate-100">🔥 {winddownStreak} day{winddownStreak === 1 ? "" : "s"}</div>
            ) : (
              <div className="font-heading font-bold text-[#687785] dark:text-slate-400">No streak yet</div>
            )}
            <div className="text-xs text-[#687785] dark:text-slate-400">Wind-down streak</div>
          </div>
        </div>
        <p className="text-xs text-[#687785] dark:text-slate-400 text-center mt-3">
          Wind-down completed {winddownCompletedCount}/7 days this week
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-[0_6px_0_0_#E3EEF7] dark:shadow-none border-2 border-[#EAF2FB] dark:border-slate-700 mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading font-bold text-[#3A4759] dark:text-slate-100">This Week</span>
          {streak > 0 && <span className="text-sm font-bold text-[#7FC99E]">🔥 {streak} day streak</span>}
        </div>
        {hasHydrationThisWeek ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#687785", fontSize: 12 }} />
              <YAxis hide domain={[0, chartMax]} />
              <ReferenceLine y={profile.daily_goal_ml} stroke="#7FC99E" strokeDasharray="4 4" />
              <Tooltip
                formatter={(v) => formatAmount(v, profile.unit_preference)}
                contentStyle={{ borderRadius: 12, border: "2px solid #EAF2FB" }}
              />
              <Bar dataKey="total" radius={[8, 8, 8, 8]} fill="#2BC4BB" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">💧</div>
            <p className="font-heading font-bold text-[#5C6B7D] dark:text-slate-200">No logs this week yet</p>
            <p className="text-sm text-[#687785] dark:text-slate-400">Log your first drink to start your streak!</p>
          </div>
        )}
      </div>

      <h2 className="font-heading font-bold text-[#3A4759] dark:text-slate-100 mb-2">Daily Log</h2>
      <div className="space-y-2">
        {last7.slice().reverse().map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border-2 border-[#EAF2FB] dark:border-slate-700"
          >
            <span className="font-bold text-[#5C6B7D] dark:text-slate-300">{moment(day.date).format("MMM D, ddd")}</span>
            <span className={`font-heading font-bold ${day.goalMet ? "text-[#7FC99E]" : "text-[#687785] dark:text-slate-400"}`}>
              {formatAmount(day.total, profile.unit_preference)} {day.goalMet && "✓"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}