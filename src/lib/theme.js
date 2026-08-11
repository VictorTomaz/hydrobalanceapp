// Light / Dark / System theme preference, persisted in localStorage.
const STORAGE_KEY = "hydrobalance-theme";
export const THEME_OPTIONS = ["system", "light", "dark"];

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme() {
  const pref = localStorage.getItem(STORAGE_KEY);
  return THEME_OPTIONS.includes(pref) ? pref : "system";
}

export function applyTheme(pref) {
  const dark = pref === "dark" || (pref === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

export function setTheme(pref) {
  localStorage.setItem(STORAGE_KEY, pref);
  applyTheme(pref);
}

// Apply the stored preference and keep "system" in sync with OS changes.
export function initTheme() {
  applyTheme(getStoredTheme());
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    if (getStoredTheme() === "system") applyTheme("system");
  });
}