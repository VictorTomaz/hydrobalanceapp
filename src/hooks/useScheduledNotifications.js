import { useEffect } from "react";
import { showWaterReminder } from "@/lib/waterReminder";

const NOTIFICATION_ICON = "https://media.base44.com/images/public/6a654dcc789406839dc9b542/4173ae9d2_HydroBalancesocialmedialogo.png";

function firedKey(date) {
  return `hydrobalance_fired_${date}`;
}

function getFired(date) {
  try {
    return JSON.parse(localStorage.getItem(firedKey(date)) || "[]");
  } catch {
    return [];
  }
}

function markFired(date, id) {
  const fired = getFired(date);
  fired.push(id);
  localStorage.setItem(firedKey(date), JSON.stringify(fired));
}

// Fires in-app, cartoon-styled water reminders (no OS permission needed) at the
// times in profile.reminder_times, plus a wind-down browser notification at
// the user's wind-down window (which still requires Notification permission).
// Both fire only while the app is open.
export function useScheduledNotifications(profile, todayStr) {
  useEffect(() => {
    if (!profile) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const fired = getFired(todayStr);

      // In-app playful water reminders — fire regardless of OS permission.
      (profile.reminder_times || []).forEach((time, idx) => {
        const id = `water_${time}_${idx}`;
        if (time === hhmm && !fired.includes(id)) {
          markFired(todayStr, id);
          showWaterReminder();
        }
      });

      // Wind-down OS notification — still requires browser permission.
      if (
        profile.bedtime &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const [bh, bm] = profile.bedtime.split(":").map(Number);
        const bedDate = new Date(now);
        bedDate.setHours(bh, bm, 0, 0);
        bedDate.setMinutes(bedDate.getMinutes() - (profile.winddown_offset_minutes || 45));
        const windHHMM = `${String(bedDate.getHours()).padStart(2, "0")}:${String(bedDate.getMinutes()).padStart(2, "0")}`;
        const windId = `winddown_${windHHMM}`;
        if (windHHMM === hhmm && !fired.includes(windId)) {
          markFired(todayStr, windId);
          new Notification("Time to unwind 🌙", {
            body: "Let's put the phone down and ease into a calm night's sleep.",
            tag: "hydro-winddown",
            icon: NOTIFICATION_ICON,
          });
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [profile, todayStr]);
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}