import { useEffect, useState } from "react";

export const APP_LAYOUTS = ["classic", "terminal", "research", "compact"] as const;
export type AppLayout = (typeof APP_LAYOUTS)[number];

const KEY = "kosh-layout";

export function isAppLayout(v: string | null | undefined): v is AppLayout {
  return v === "classic" || v === "terminal" || v === "research" || v === "compact";
}

export function readLayout(): AppLayout {
  if (typeof localStorage === "undefined") return "classic";
  try {
    const v = localStorage.getItem(KEY);
    return isAppLayout(v) ? v : "classic";
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
