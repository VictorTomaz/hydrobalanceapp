// Subscription + free-trial helpers shared by the paywall and app gating.

export const TRIAL_DAYS = 7;
export const SUBSCRIPTION_PRODUCT_ID = "waterrest_pro_monthly";
export const SUBSCRIPTION_PRICE = "1.99";

// Whole days of the app-level free trial the user still has (0 once expired).
export function trialDaysRemaining(profile) {
  if (!profile?.trial_start_date) return 0;
  const start = new Date(profile.trial_start_date).getTime();
  if (Number.isNaN(start)) return 0;
  const remaining = TRIAL_DAYS - (Date.now() - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(remaining));
}

export function isTrialActive(profile) {
  return trialDaysRemaining(profile) > 0;
}

export function isSubscriptionActive(profile) {
  return profile?.subscription_status === "active";
}

// True when the user should be allowed into the app (active sub OR active trial).
export function hasAppAccess(profile) {
  return isSubscriptionActive(profile) || isTrialActive(profile);
}