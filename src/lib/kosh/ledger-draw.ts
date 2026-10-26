import type { LedgerDraw } from "./ledger-layout.ts";

export const FIB_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;

/** 0 sits on the first anchor and 1 on the second. */
export function fibPrice(p0: number, p1: number, ratio: number): number {
  return p0 + (p1 - p0) * ratio;
}

export function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function rayEnd(ax: number, ay: number, bx: number, by: number, width: number, height: number): { x: number; y: number } {
  const dx = bx - ax;
  const dy = by - ay;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return { x: bx, y: by };
  const targetX = dx >= 0 ? width : 0;
  if (Math.abs(dx) < 0.01) return { x: ax, y: dy >= 0 ? height : 0 };
  const y = ay + ((targetX - ax) * dy) / dx;
  if (y >= -20 && y <= height + 20) return { x: targetX, y };
  const targetY = dy >= 0 ? height : 0;
  const x = ax + ((targetY - ay) * dx) / (dy || 1);
  return { x, y: targetY };
}

export type HitPart = "body" | "a" | "b";

export function hitDraw(
  draw: LedgerDraw,
  px: number,
  py: number,
  project: (t: number, p: number) => { x: number; y: number } | null,
  width: number,
  height: number,
): HitPart | null {
  if (draw.hidden) return null;
  const a = project(draw.t0, draw.p0);
  if (!a) return null;
  if (Math.hypot(px - a.x, py - a.y) <= 7) return "a";
  const b = draw.t1 != null && draw.p1 != null ? project(draw.t1, draw.p1) : null;
  if (b && Math.hypot(px - b.x, py - b.y) <= 7) return "b";
  if (draw.kind === "hline") return Math.abs(py - a.y) <= 6 ? "body" : null;
  if (draw.kind === "vline") return Math.abs(px - a.x) <= 6 ? "body" : null;
  if (draw.kind === "text") return Math.hypot(px - a.x, py - a.y) <= 14 ? "body" : null;
  if (!b) return null;
  if (draw.kind === "rect") {
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);
    const inside = px >= left && px <= right && py >= top && py <= bottom;
    const near = px >= left - 6 && px <= right + 6 && py >= top - 6 && py <= bottom + 6 && !inside;
    return inside || near ? "body" : null;
  }
  if (draw.kind === "fib") {
    for (const ratio of FIB_RATIOS) {
      const y = project(draw.t0, fibPrice(draw.p0, draw.p1 as number, ratio))?.y;
      if (y != null && Math.abs(py - y) <= 5 && px >= Math.min(a.x, b.x) - 4 && px <= Math.max(a.x, b.x) + 4) return "body";
    }
    return null;
  }
  const end = draw.kind === "ray" ? rayEnd(a.x, a.y, b.x, b.y, width, height) : b;
  return distToSeg(px, py, a.x, a.y, end.x, end.y) <= 6 ? "body" : null;
}
