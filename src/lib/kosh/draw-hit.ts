import type { OhlcBar } from "./types";
import type { DrawShape } from "@/lib/store";

export type HitMode = "body" | "p0" | "p1" | "off";

const HANDLE = 12;
const LINE = 16;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function distSeg(px: number, py: number, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x0) * dx + (py - y0) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
}

export function shapePoints(
  s: DrawShape,
  src: OhlcBar[],
  xOf: (i: number) => number,
  yOf: (v: number) => number,
  left: number,
  right: number,
  plotTop: number,
  plotBot: number,
) {
  const tToX = (t: number) => {
    if (!src.length) return xOf(0);
    if (t <= src[0].t) return xOf(0);
    const last = src.length - 1;
    if (t >= src[last].t) return xOf(last);
    let lo = 0;
    let hi = last;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (src[mid].t < t) lo = mid + 1;
      else hi = mid;
    }
    const i = lo;
    if (i <= 0) return xOf(0);
    const a = src[i - 1];
    const b = src[i];
    const f = (t - a.t) / (b.t - a.t || 1);
    return xOf(i - 1) + f * (xOf(i) - xOf(i - 1));
  };
  const x0 = tToX(s.t0);
  const y0 = yOf(s.y0);
  const x1 = tToX(s.t1 ?? s.t0);
  const y1 = yOf(s.y1 ?? s.y0);
  if (s.kind === "hline") return { x0: left, y0, x1: right, y1: y0 };
  if (s.kind === "vline") return { x0, y0: plotTop, x1: x0, y1: plotBot };
  return { x0, y0, x1, y1 };
}

export function hitTest(
  shapes: DrawShape[],
  x: number,
  y: number,
  src: OhlcBar[],
  xOf: (i: number) => number,
  yOf: (v: number) => number,
  left: number,
  right: number,
  plotTop: number,
  plotBot: number,
): { id: string; mode: HitMode } | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    const p = shapePoints(s, src, xOf, yOf, left, right, plotTop, plotBot);
    if (dist(x, y, p.x0, p.y0) <= HANDLE) return { id: s.id, mode: "p0" };
    if (s.kind !== "hline" && s.kind !== "vline" && dist(x, y, p.x1, p.y1) <= HANDLE) return { id: s.id, mode: "p1" };
    if (s.kind === "hline" && dist(x, y, p.x1, p.y1) <= HANDLE) return { id: s.id, mode: "p0" };
    if (s.kind === "channel") {
      const off = s.off ?? Math.abs(s.y0) * 0.012;
      const midX = (p.x0 + p.x1) / 2;
      const midY = (yOf(s.y0 + off) + yOf((s.y1 ?? s.y0) + off)) / 2;
      if (dist(x, y, midX, midY) <= HANDLE) return { id: s.id, mode: "off" };
    }
    if (s.kind === "rect") {
      const rx = Math.min(p.x0, p.x1);
      const ry = Math.min(p.y0, p.y1);
      const rw = Math.abs(p.x1 - p.x0);
      const rh = Math.abs(p.y1 - p.y0);
      const inside = x >= rx - 2 && x <= rx + rw + 2 && y >= ry - 2 && y <= ry + rh + 2;
      const nearEdge =
        Math.abs(x - rx) <= LINE ||
        Math.abs(x - (rx + rw)) <= LINE ||
        Math.abs(y - ry) <= LINE ||
        Math.abs(y - (ry + rh)) <= LINE;
      if (inside && (nearEdge || (rw > 8 && rh > 8 && x > rx + 4 && x < rx + rw - 4 && y > ry + 4 && y < ry + rh - 4)))
        return { id: s.id, mode: "body" };
    } else if (distSeg(x, y, p.x0, p.y0, p.x1, p.y1) <= LINE) {
      return { id: s.id, mode: "body" };
    }
  }
  return null;
}

export function magnetPrice(bar: OhlcBar | undefined, price: number, on: boolean) {
  if (!on || !bar) return price;
  const pts = [bar.o, bar.h, bar.l, bar.c];
  let best = price;
  let d = Infinity;
  for (const p of pts) {
    const dd = Math.abs(p - price);
    if (dd < d) {
      d = dd;
      best = p;
    }
  }
  return best;
}

export function applyDrag(
  s: DrawShape,
  mode: HitMode,
  dt: number,
  dy: number,
  t: number,
  y: number,
): DrawShape {
  if (mode === "p0") {
    if (s.kind === "hline") return { ...s, y0: y };
    if (s.kind === "vline") return { ...s, t0: t };
    return { ...s, t0: t, y0: y };
  }
  if (mode === "p1") {
    return { ...s, t1: t, y1: y };
  }
  if (mode === "off") {
    return { ...s, off: (s.off ?? 0) + dy };
  }
  if (s.kind === "hline") return { ...s, y0: s.y0 + dy };
  if (s.kind === "vline") return { ...s, t0: s.t0 + dt, t1: (s.t1 ?? s.t0) + dt };
  return {
    ...s,
    t0: s.t0 + dt,
    y0: s.y0 + dy,
    t1: (s.t1 ?? s.t0) + dt,
    y1: (s.y1 ?? s.y0) + dy,
  };
}
