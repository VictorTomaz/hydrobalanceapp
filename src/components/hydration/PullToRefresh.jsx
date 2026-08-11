import { useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

// Lightweight pull-to-refresh: only activates when the page is scrolled to
// the very top, so normal scrolling is untouched.
export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    setPull(diff > 0 ? Math.min(diff * 0.5, 90) : 0);
  };

  const handleTouchEnd = async () => {
    if (pull > THRESHOLD && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPull(0);
    startY.current = null;
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex justify-center items-center overflow-hidden transition-all"
        style={{ height: refreshing ? 40 : pull }}
      >
        <RefreshCw
          className={`w-5 h-5 text-[#2BC4BB] ${refreshing ? "animate-spin" : ""}`}
          style={{ opacity: refreshing ? 1 : Math.min(pull / THRESHOLD, 1) }}
        />
      </div>
      {children}
    </div>
  );
}