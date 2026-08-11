import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const LARGE_ENTRY_ML = 1500; // ~50 oz — confirm before logging this much at once

export default function CustomAmountDialog({ onLog, unit }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [confirming, setConfirming] = useState(false);

  const enteredMl = () => {
    const num = parseFloat(value);
    if (!num || num <= 0) return 0;
    return unit === "oz" ? num * 29.5735 : num;
  };

  const handleSubmit = () => {
    const ml = enteredMl();
    if (!ml) return;
    if (ml > LARGE_ENTRY_ML && !confirming) {
      setConfirming(true);
      return;
    }
    onLog(Math.round(Math.min(ml, 5000)), "custom");
    setValue("");
    setConfirming(false);
    setOpen(false);
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) {
      setConfirming(false);
      setValue("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-2xl border-2 border-dashed border-[#C8D6E5] text-[#5C6B7D] font-heading font-bold gap-2 h-12"
        >
          <Plus className="w-4 h-4" /> Custom Amount
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl dark:bg-slate-800 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#3A4759] dark:text-slate-100">Log Custom Amount</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            autoFocus
            aria-label={`Custom amount in ${unit}`}
            value={value}
            onChange={(e) => { setValue(e.target.value); setConfirming(false); }}
            placeholder={`Amount in ${unit}`}
            className="rounded-xl"
          />
          <span className="text-sm font-bold text-[#687785]">{unit}</span>
        </div>
        {confirming && (
          <p className="text-sm font-bold text-[#E0A800] bg-[#FFF8E6] dark:bg-amber-900/30 dark:text-amber-200 rounded-xl px-3 py-2">
            That's a lot for one entry — tap again to confirm.
          </p>
        )}
        <Button onClick={handleSubmit} className="rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] font-heading font-bold">
          {confirming ? "Confirm Amount 💧" : "Log It 💧"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}