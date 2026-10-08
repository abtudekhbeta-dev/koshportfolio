import { useEffect, useState } from "react";

/** Presentation only. Retired layouts migrate to Classic. */
export const APP_LAYOUTS = ["classic", "intelligence"] as const;
export type AppLayout = (typeof APP_LAYOUTS)[number];

const KEY = "kosh-layout";
const RETIRED = new Set(["terminal", "research", "compact"]);

export function normalizeLayout(v: string | null | undefined): AppLayout {
  if (v === "intelligence") return "intelligence";
  return "classic";
}

export function readLayout(): AppLayout {
  if (typeof localStorage === "undefined") return "classic";
  try {
    const v = localStorage.getItem(KEY);
    const next = normalizeLayout(v);
    if (v && (RETIRED.has(v) || (v !== "classic" && v !== "intelligence"))) {
      try {
        localStorage.setItem(KEY, "classic");
      } catch {
        /* private mode */
      }
    }
    return next;
  } catch {
    return "classic";
  }
}

export function applyLayout(layout: AppLayout) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-layout", layout);
}

export function writeLayout(layout: AppLayout) {
  applyLayout(layout);
  try {
    localStorage.setItem(KEY, layout);
  } catch {
    /* private mode */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kosh-layout"));
}

export function useAppLayout(): AppLayout {
  const [layout, setLayout] = useState<AppLayout>("classic");
  useEffect(() => {
    const sync = () => {
      const next = readLayout();
      applyLayout(next);
      setLayout(next);
    };
    sync();
    window.addEventListener("kosh-layout", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kosh-layout", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return layout;
}
