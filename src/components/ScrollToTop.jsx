import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { recordTabPath } from "@/lib/tabStack";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

// Per-tab scroll memory: pathname -> last scrollY. Lets each bottom tab
// remember where you left off when you switch away and come back.
const scrollMemory = new Map();

if (typeof window !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPath = useRef(pathname);

  // Continuously record scroll for the current route (rAF-throttled).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scrollMemory.set(prevPath.current, window.scrollY);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // On route change: capture the leaving route's scroll, then restore the
  // entering route's saved scroll — waiting for async content to load first.
  useEffect(() => {
    if (prevPath.current !== pathname) {
      scrollMemory.set(prevPath.current, window.scrollY);
      prevPath.current = pathname;
    }
    // Remember the current screen under its tab (for stack restoration).
    recordTabPath(pathname);

    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    const target = scrollMemory.get(pathname) ?? 0;
    let cancelled = false;
    const startedAt = Date.now();
    const restore = () => {
      if (cancelled) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (target <= max + 1) {
        window.scrollTo(0, target);
        return;
      }
      if (Date.now() - startedAt < 2000) {
        setTimeout(restore, 60);
      } else {
        window.scrollTo(0, target);
      }
    };
    // Defer until the entering route has mounted (after the exit animation),
    // so we scroll against the new page's height — not the leaving page's.
    const timer = setTimeout(restore, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [pathname, hash]);

  return null;
}