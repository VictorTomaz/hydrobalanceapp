import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplet, History, Moon, Settings } from "lucide-react";
import { getTabPath, clearTabPath } from "@/lib/tabStack";

const NAV_ITEMS = [
  { to: "/", icon: Droplet, label: "Home" },
  { to: "/history", icon: History, label: "History" },
  { to: "/winddown", icon: Moon, label: "Wind-down" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-[#EAF2FB] dark:border-slate-700 px-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 z-40">
      <div className="max-w-md mx-auto flex justify-between">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          // Active if on the exact route or any nested sub-route under it.
          const isExact = location.pathname === to;
          const active = isExact || (to !== "/" && location.pathname.startsWith(to + "/"));
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (active && !isExact) {
                  // On a deep screen of this tab: re-tap pops back to its root.
                  e.preventDefault();
                  navigate(to);
                  clearTabPath(to);
                } else if (isExact) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  // Switching to this tab: restore its last screen if we have one.
                  const stored = getTabPath(to);
                  if (stored && stored !== to) {
                    e.preventDefault();
                    navigate(stored);
                  }
                }
              }}
              className={`no-select flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors ${
                active ? "text-[#2BC4BB]" : "text-[#7B8794]"
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-bold whitespace-nowrap text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}