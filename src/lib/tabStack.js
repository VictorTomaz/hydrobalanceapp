// Per-tab navigation stack memory for the bottom tab bar.
// Each bottom tab remembers the deepest screen the user was on, so switching
// away to another tab and coming back restores that screen instead of the
// tab root. Re-tapping the active tab still pops back to its root.

const TAB_ROOTS = ["/history", "/winddown", "/settings"]; // "/" handled separately
const tabStack = new Map();

// Returns the tab root (e.g. "/winddown") a path belongs to, or null if it is
// not under any tab (login, onboarding, pagenotfound, etc.).
export function tabForPath(path) {
  if (path === "/") return "/";
  for (const root of TAB_ROOTS) {
    if (path === root || path.startsWith(root + "/")) return root;
  }
  return null;
}

// Records the current pathname under the tab it belongs to.
export function recordTabPath(path) {
  const root = tabForPath(path);
  if (root) tabStack.set(root, path);
}

// Returns the stored deep screen for a tab root, falling back to the root.
export function getTabPath(root) {
  return tabStack.get(root) || root;
}

// Clears a tab's stored screen (used when popping back to root via re-tap).
export function clearTabPath(root) {
  tabStack.delete(root);
}