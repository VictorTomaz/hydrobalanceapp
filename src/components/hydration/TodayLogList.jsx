import { Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/hydration";

export default function TodayLogList({ logs, unit, onDelete }) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="font-heading font-bold text-[#3A4759] dark:text-slate-100 mb-3">Today's Water</h2>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 border-2 border-[#EAF2FB]"
          >
            <span className="font-bold text-[#3A4759] dark:text-slate-200">{formatAmount(log.amount_ml, unit)}</span>
            <button onClick={() => onDelete(log.id)} aria-label={`Delete ${formatAmount(log.amount_ml, unit)} entry`} className="text-[#E38B8B]">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}