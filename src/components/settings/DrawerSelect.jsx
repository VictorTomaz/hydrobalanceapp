import { useState } from "react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";

// A bottom-sheet replacement for Radix Select, built on Vaul — avoids
// floating popovers, which behave poorly in iOS WebView wrappers.
export default function DrawerSelect({ value, onValueChange, options, triggerClassName, title }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={`no-select flex items-center justify-between gap-1 bg-white dark:bg-slate-800 ${triggerClassName || ""}`}
        >
          <span className="truncate">{selected?.label ?? value}</span>
          <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh] dark:bg-slate-900 dark:border-slate-700">
        <DrawerHeader>
          <DrawerTitle className="dark:text-slate-100">{title || "Select an option"}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-1 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onValueChange(opt.value);
                setOpen(false);
              }}
              className={`no-select w-full flex items-center justify-between rounded-xl px-4 py-3 text-left font-bold ${
                opt.value === value
                  ? "bg-[#EAF7FA] dark:bg-slate-700 text-[#2BC4BB]"
                  : "text-[#5C6B7D] dark:text-slate-300"
              }`}
            >
              {opt.label}
              {opt.value === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}