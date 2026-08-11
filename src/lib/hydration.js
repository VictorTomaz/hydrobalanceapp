// Hydration goal calculation + unit helpers

export function calculateDailyGoalMl({ weight, weight_unit, activity_level }) {
  const weightKg = weight_unit === "kg" ? weight : weight * 0.453592;
  let ml = weightKg * 33; // baseline ~33ml per kg

  const activityMultiplier = { sedentary: 1, moderate: 1.12, active: 1.25 }[activity_level] || 1;
  ml *= activityMultiplier;

  return Math.round(ml / 50) * 50; // round to nearest 50ml
}

export function mlToOz(ml) {
  return ml / 29.5735;
}

export function ozToMl(oz) {
  return oz * 29.5735;
}

export function formatAmount(ml, unit) {
  if (unit === "oz") return `${Math.round(mlToOz(ml))} oz`;
  return `${Math.round(ml)} ml`;
}

export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const DRINK_PRESETS = [
  { label: "Small Glass", amount_ml: 200, emoji: "🥛" },
  { label: "Large Glass", amount_ml: 350, emoji: "🍶" },
  { label: "Bottle", amount_ml: 500, emoji: "💧" },
];

// Returns the next upcoming wind-down start time for the given bedtime/offset.
// Handles bedtimes past midnight by rolling to tomorrow once today's bedtime has passed.
export function getWinddownTarget(bedtime, offsetMinutes) {
  const [bh, bm] = bedtime.split(":").map(Number);
  const bed = new Date();
  bed.setHours(bh, bm, 0, 0);
  if (bed.getTime() < Date.now()) bed.setDate(bed.getDate() + 1);
  bed.setMinutes(bed.getMinutes() - offsetMinutes);
  return bed;
}

export const WINDDOWN_ACTIVITIES = [
  { id: "breathing", label: "Guided Breathing", emoji: "🌬️", description: "Take 5 slow, deep breaths — in for 4, out for 6." },
  { id: "stretching", label: "Light Stretching", emoji: "🧘", description: "Gently stretch your neck, shoulders, and back." },
  { id: "journaling", label: "Journaling", emoji: "📓", description: "Write down one thing on your mind before sleep." },
  { id: "gratitude", label: "Gratitude Reflection", emoji: "🌙", description: "Think of three things you're grateful for today." },
];

// Returns the list of wind-down activities a user has active, combining
// enabled defaults with any custom activities they've added.
export function getActiveActivities(profile) {
  const enabledIds = profile?.enabled_activities || WINDDOWN_ACTIVITIES.map((a) => a.id);
  const defaults = WINDDOWN_ACTIVITIES.filter((a) => enabledIds.includes(a.id));
  const custom = profile?.custom_activities || [];
  return [...defaults, ...custom];
}