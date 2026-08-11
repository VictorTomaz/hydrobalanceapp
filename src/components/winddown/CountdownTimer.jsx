import { useEffect, useState } from "react";
import Mascot from "@/components/mascot/Mascot";
import { getWinddownTarget } from "@/lib/hydration";

export default function CountdownTimer({ bedtime, offsetMinutes }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const target = getWinddownTarget(bedtime, offsetMinutes);
      setRemaining(Math.max(0, target.getTime() - Date.now()));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [bedtime, offsetMinutes]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Mascot percent={30} size={140} />
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100">Wind-down begins in</h2>
        <p className="text-[#687785] dark:text-slate-400 mt-1">Enjoy your evening — calm mode kicks in soon</p>
      </div>
      <div className="flex gap-3">
        {[
          { v: hours, l: "hrs" },
          { v: minutes, l: "min" },
          { v: seconds, l: "sec" },
        ].map((u) => (
          <div key={u.l} className="bg-white dark:bg-slate-800 dark:border-slate-700 dark:shadow-none rounded-3xl shadow-[0_6px_0_0_#E3E0F5] border-2 border-[#EDE7FA] px-5 py-4 min-w-[80px]">
            <div className="font-heading text-3xl font-extrabold text-[#7B5FE0]">{String(u.v).padStart(2, "0")}</div>
            <div className="text-xs text-[#687785] dark:text-slate-400 font-bold uppercase tracking-wide">{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}