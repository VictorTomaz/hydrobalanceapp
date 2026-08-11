import { Link } from "react-router-dom";
import Mascot from "@/components/mascot/Mascot";
import { toast } from "@/components/ui/use-toast";

// Playful, cartoon-themed water reminder messages shown as in-app toasts at
// the user's reminder times. Unlike browser OS notifications, these need no
// permission and stay inside the app's playful visual style.
export const WATER_MESSAGES = [
  "Splash time! Your droplet buddy is feeling a little dry 💧",
  "Psst… your cells are thirsty. Treat them to a sip!",
  "Sip sip hooray! Time for a playful water break.",
  "Ding ding! Hydration o'clock — your body says thanks!",
  "Your hydration streak is watching… go grab a drink! 💦",
  "A little water now = a happier droplet later. Cheers!",
  "Refill time! Keep that happy hydration flowing. 🌊",
  "Quick break: pour yourself some liquid sunshine! ☀️",
  "Even little sips count — your droplet pal believes in you!",
  "Beep boop! Your internal sprinkler needs a top-up. 💧",
];

// Shows a single cartoon-styled water reminder toast with a quick link to log.
export function showWaterReminder() {
  const message =
    WATER_MESSAGES[Math.floor(Math.random() * WATER_MESSAGES.length)];

  toast({
    duration: 9000,
    className:
      "rounded-2xl border-0 bg-gradient-to-br from-[#2BC4BB] via-[#5FA8F2] to-[#7E60E6] text-white shadow-xl",
    title: (
      <div className="font-heading text-base font-bold text-white">
        💧 Time to hydrate!
      </div>
    ),
    description: (
      <div className="flex items-center gap-3 pt-1">
        <Mascot percent={55} size={42} />
        <span className="text-sm leading-snug text-white/90">{message}</span>
      </div>
    ),
    action: (
      <Link
        to="/"
        aria-label="Go to Home to log water"
        className="no-select shrink-0 self-center rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/30"
      >
        Log water 💧
      </Link>
    ),
  });
}