import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BreathingAnimation, StretchingAnimation, JournalingAnimation, GratitudeAnimation } from "./ActivityAnimations";
import { ACTIVITY_NARRATION } from "@/lib/activityNarration";
import { Volume2, VolumeX } from "lucide-react";

const ANIMATIONS = {
  breathing: BreathingAnimation,
  stretching: StretchingAnimation,
  journaling: JournalingAnimation,
  gratitude: GratitudeAnimation,
};

export default function ActivityGuideDialog({ activity, open, onOpenChange, onComplete, muted, onToggleMute }) {
  if (!activity) return null;
  const Animation = ANIMATIONS[activity.id];
  const narrationUrl = ACTIVITY_NARRATION[activity.id];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-center gap-2">
          <DialogTitle className="text-center font-heading text-xl font-extrabold text-[#3A4759] dark:text-slate-100">
            {activity.label}
          </DialogTitle>
          {narrationUrl && (
            <button
              onClick={onToggleMute}
              aria-label={muted ? "Unmute narration" : "Mute narration"}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#EDE7FA] dark:bg-slate-700 text-[#7B5FE0] dark:text-slate-300"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        {Animation && <Animation />}
        <button
          onClick={onComplete}
          className="w-full mt-2 py-3 rounded-2xl bg-[#7B5FE0] text-white font-heading font-bold shadow-md active:scale-95 transition-transform"
        >
          Mark as Done
        </button>
      </DialogContent>
    </Dialog>
  );
}