import { useEffect, useState, type RefObject } from "react";

function fullscreenEl() {
  return document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement || null;
}

/**
 * Browser fullscreen is the source of truth.
 * The element stays in place while the browser API is active.
 * If the API is missing or rejected, the caller may cover the page itself.
 * Do not move the element and then call requestFullscreen — that detaches it.
 */
export function useChartFullscreen(ref: RefObject<HTMLElement | null>) {
  const [native, setNative] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sync = () => setNative(Boolean(ref.current && fullscreenEl() === ref.current));
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
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
    if (fullscreenEl() === el) {
      const exit = document.exitFullscreen?.bind(document) || (document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen?.bind(document);
      if (exit) await exit().catch(() => {});
      setNative(false);
      return;
    }
    if (fallback) {
      setFallback(false);
      return;
    }
    const req =
      el.requestFullscreen?.bind(el) ||
      (el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.bind(el);
    if (!req) {
      setFallback(true);
      return;
    }
    try {
      await Promise.race([
        req(),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("fullscreen-timeout")), 800)),
      ]);
      if (fullscreenEl() === el) {
        setNative(true);
        setFallback(false);
        return;
      }
      setFallback(true);
    } catch {
      if (fullscreenEl() === el) {
        setNative(true);
        return;
      }
      setFallback(true);
    }
  }

  return { fs: native || fallback, native, fallback, toggle };
}
