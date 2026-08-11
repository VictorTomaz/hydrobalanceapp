import { useMemo } from "react";
import DrawerSelect from "@/components/settings/DrawerSelect";

// Builds 30-minute 12-hour time options (5:00 AM → 11:30 PM).
// Stored values are 24h "HH:MM" so the notifications hook compares unchanged.
const TIME_OPTIONS = (() => {
  const out = [];
  for (let h = 5; h <= 23; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
      out.push({ value, label });
    }
  }
  return out;
})();

export default function ReminderTimesEditor({ times = [], onChange, triggerClassName }) {
  const slots = useMemo(() => {
    const t = [...times];
    while (t.length < 4) t.push("");
    return t.slice(0, 4);
  }, [times]);

  const update = (idx, next) => onChange(slots.map((s, i) => (i === idx ? next : s)));

  return (
    <div className="flex flex-wrap gap-2 mt-1.5">
      {slots.map((t, idx) => (
        <DrawerSelect
          key={idx}
          value={t}
          onValueChange={(v) => update(idx, v)}
          title={`Reminder ${idx + 1}`}
          options={TIME_OPTIONS}
          triggerClassName={`flex-1 min-w-[7.5rem] rounded-xl border-2 border-[#EAF2FB] dark:border-slate-700 font-bold text-[#5C6B7D] dark:text-slate-300 px-3 h-10 ${triggerClassName || ""}`}
        />
      ))}
    </div>
  );
}