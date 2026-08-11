import { DRINK_PRESETS, formatAmount } from "@/lib/hydration";
import { motion } from "framer-motion";

export default function DrinkPresets({ onLog, disabled, unit }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {DRINK_PRESETS.map((preset) => (
        <motion.button
          key={preset.label}
          whileTap={{ scale: 0.9 }}
          disabled={disabled}
          onClick={() => onLog(preset.amount_ml, preset.label)}
          className="flex flex-col items-center gap-1.5 rounded-3xl bg-white dark:bg-slate-800 dark:border-slate-700 dark:shadow-none py-4 px-2 shadow-[0_6px_0_0_#E3EEF7] border-2 border-[#EAF2FB] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
        >
          <span className="text-3xl">{preset.emoji}</span>
          <span className="font-heading font-bold text-sm text-[#3A4759] dark:text-slate-200">{preset.label}</span>
          <span className="text-xs text-[#687785] dark:text-slate-400">{formatAmount(preset.amount_ml, unit)}</span>
        </motion.button>
      ))}
    </div>
  );
}