import { useEffect, useState, type RefObject } from "react";

/**
 * Browser fullscreen is the source of truth.
 * Do not move the element (no portal) after requestFullscreen — that detaches it.
 * If the API is missing or rejected, a CSS fallback covers the page instead.
 */
export function useChartFullscreen(ref: RefObject<HTMLElement | null>) {
  const [native, setNative] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sync = () => {
      const el = ref.current;
      setNative(Boolean(el && document.fullscreenElement === el));
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [ref]);

  useEffect(() => {
    if (!fallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFallback(false);
    };
    document.documentElement.classList.add("kosh-fs-lock");
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("kosh-fs-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [fallback]);

  async function toggle() {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (fallback) {
      setFallback(false);
      return;
    }
    if (typeof el.requestFullscreen !== "function") {
      setFallback(true);
      return;
    }
    try {
      await el.requestFullscreen();
    } catch {
      setFallback(true);
    }
  }

  return { fs: native || fallback, native, fallback, toggle };
}
