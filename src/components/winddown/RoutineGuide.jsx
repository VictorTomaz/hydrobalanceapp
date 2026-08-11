import { motion } from "framer-motion";
import { Check, PlayCircle } from "lucide-react";
import { WINDDOWN_ACTIVITIES } from "@/lib/hydration";

const GUIDABLE_IDS = WINDDOWN_ACTIVITIES.map((a) => a.id);

export default function RoutineGuide({ activities, completedIds, onToggle, onGuide }) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const done = completedIds.includes(activity.id);
        const guidable = GUIDABLE_IDS.includes(activity.id);
        return (
          <motion.div
            key={activity.id}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center gap-4 rounded-3xl p-4 border-2 transition-all ${
              done
                ? "bg-[#EFF9F1] border-[#B8E8C8] dark:bg-emerald-950/30 dark:border-emerald-800/50"
                : "bg-white border-[#EDE7FA] dark:bg-slate-800 dark:border-slate-700"
            }`}
          >
            <button
              type="button"
              onClick={() => (guidable ? onGuide(activity) : onToggle(activity.id))}
              className="flex items-center gap-4 flex-1 text-left"
            >
              <span className="text-3xl">{activity.emoji}</span>
              <div className="flex-1">
                <div className="font-heading font-bold text-[#3A4759] dark:text-slate-200 flex items-center gap-1.5">
                  {activity.label}
                  {guidable && <PlayCircle className="w-4 h-4 text-[#7B5FE0]" />}
                </div>
                <div className="text-sm text-[#687785] dark:text-slate-400">{activity.description}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onToggle(activity.id)}
              aria-label={done ? `Mark ${activity.label} as not done` : `Mark ${activity.label} as done`}
              aria-pressed={done}
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                done ? "bg-[#7FC99E] border-[#7FC99E]" : "border-[#D8D2EB] dark:border-slate-600"
              }`}
            >
              {done && <Check className="w-4 h-4 text-white" />}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}