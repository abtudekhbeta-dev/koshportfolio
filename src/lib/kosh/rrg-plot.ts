export const PLOT = { left: 58, top: 28, width: 720, height: 490 };

export type StrokePref = "thin" | "standard" | "bold";

export function trailWidth(pref: StrokePref, selected: boolean) {
  const base = pref === "thin" ? 1.8 : pref === "bold" ? 3.4 : 2.4;
  return selected ? base + 0.8 : base;
}

export type LabelSeed = { symbol: string; x: number; y: number };

/** Places ticker labels inside the plot, selected symbol first. A label with no free slot is omitted. */
export function placeLabels(points: LabelSeed[], selected: string | null) {
  const ordered = [...points].sort((a, b) => {
    if (a.symbol === selected) return -1;
    if (b.symbol === selected) return 1;
    return a.symbol.localeCompare(b.symbol);
  });
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const out: { symbol: string; x: number; y: number }[] = [];
  const right = PLOT.left + PLOT.width;
  const bottom = PLOT.top + PLOT.height;
  for (const point of ordered) {
    const w = Math.max(28, point.symbol.length * 6.4);
    const h = 12;
    const candidates = [
      { x: point.x + 8, y: point.y - 4 },
      { x: point.x + 8, y: point.y + 14 },
      { x: point.x - w - 6, y: point.y - 4 },
      { x: point.x + 8, y: point.y - 18 },
      { x: point.x - w - 6, y: point.y + 14 },
    ];
    const fit = candidates.find((box) => box.x >= PLOT.left + 2 && box.y - h >= PLOT.top + 2 && box.x + w <= right - 2 && box.y <= bottom - 2 && !placed.some((other) => overlaps(box.x, box.y - h, w, h, other)));
    if (!fit) continue;
    placed.push({ x: fit.x, y: fit.y - h, w, h });
    out.push({ symbol: point.symbol, x: fit.x, y: fit.y });
  }
  return out;
}

function overlaps(x: number, y: number, w: number, h: number, other: { x: number; y: number; w: number; h: number }) {
  return x < other.x + other.w && x + w > other.x && y < other.y + other.h && y + h > other.y;
}

export type QuadrantAnchor = { name: "LEADING" | "WEAKENING" | "LAGGING" | "IMPROVING"; x: number; y: number; anchor: "start" | "end" };

/** Corner labels inside the visible part of each quadrant. A quadrant that is off-screen is omitted. */
export function quadrantAnchors(x100: number, y100: number): QuadrantAnchor[] {
  const right = PLOT.left + PLOT.width;
  const bottom = PLOT.top + PLOT.height;
  const out: QuadrantAnchor[] = [];
  if (right - x100 > 56 && y100 - PLOT.top > 22) out.push({ name: "LEADING", x: right - 8, y: PLOT.top + 16, anchor: "end" });
  if (right - x100 > 64 && bottom - y100 > 18) out.push({ name: "WEAKENING", x: right - 8, y: bottom - 8, anchor: "end" });
  if (x100 - PLOT.left > 56 && bottom - y100 > 18) out.push({ name: "LAGGING", x: PLOT.left + 8, y: bottom - 8, anchor: "start" });
  if (x100 - PLOT.left > 64 && y100 - PLOT.top > 22) out.push({ name: "IMPROVING", x: PLOT.left + 8, y: PLOT.top + 16, anchor: "start" });
  return out;
}
