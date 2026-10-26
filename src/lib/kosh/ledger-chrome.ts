/** Terminal chrome colours. The chart library does not follow CSS variables, so both the stylesheet and the canvas use this table. */

export type LedgerTheme = "light" | "dark";

export type LedgerChrome = {
  background: string;
  text: string;
  muted: string;
  grid: string;
  border: string;
  up: string;
  down: string;
};

export function ledgerChrome(theme: LedgerTheme): LedgerChrome {
  if (theme === "light") {
    return {
      background: "#fffdf8",
      text: "#3f3c37",
      muted: "#5e5a54",
      grid: "rgba(40, 36, 28, 0.08)",
      border: "#e2ddd2",
      up: "#0f8a52",
      down: "#c63737",
    };
  }
  return {
    background: "#0c1118",
    text: "#8793a5",
    muted: "#8793a5",
    grid: "rgba(109, 129, 155, 0.16)",
    border: "#28313e",
    up: "#20b985",
    down: "#f06470",
  };
}

export function placeMenu(
  anchor: { left: number; right: number; top: number; bottom: number },
  viewport: { width: number; height: number },
  menu: { width: number; height: number },
): { left: number; top: number; flipped: boolean } {
  const gap = 6;
  const edge = 8;
  let left = anchor.left;
  if (left + menu.width > viewport.width - edge) left = Math.max(edge, viewport.width - menu.width - edge);
  let top = anchor.bottom + gap;
  let flipped = false;
  const below = viewport.height - edge - top;
  if (below < Math.min(menu.height, 160) && anchor.top - gap - menu.height > edge) {
    top = anchor.top - gap - menu.height;
    flipped = true;
  }
  if (top < edge) top = edge;
  return { left, top, flipped };
}

export function clampWatchWidth(value: number): number {
  if (!Number.isFinite(value)) return 286;
  return Math.max(220, Math.min(480, Math.round(value)));
}
