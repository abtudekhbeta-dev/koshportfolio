/** Mark Minervini VCP: contracting pullbacks after an uptrend, then a pivot. Daily bars. */

import { swings, volAvg, type Swing } from "./ohlc.ts";
import type { OhlcBar } from "./types.ts";

export type VcpHit = {
  forming: boolean;
  breakout: boolean;
  n: number;
  lastPct: number;
  days: number;
  volX: number | null;
  pivot: number;
};

type Contraction = { high: Swing; low: Swing; pct: number; vol: number };

function avgVol(bars: OhlcBar[], fromI: number, toI: number): number {
  const a = Math.max(0, Math.min(fromI, toI));
  const b = Math.min(bars.length - 1, Math.max(fromI, toI));
  if (b < a) return 0;
  let s = 0;
  let n = 0;
  for (let i = a; i <= b; i++) {
    s += bars[i].v || 0;
    n += 1;
  }
  return n ? s / n : 0;
}

function contractionsOf(bars: OhlcBar[], sw: Swing[]): Contraction[] {
  const out: Contraction[] = [];
  for (let i = 0; i < sw.length - 1; i++) {
    const h = sw[i];
    if (h.kind !== "H") continue;
    const low = sw.slice(i + 1).find((x) => x.kind === "L" && x.i > h.i);
    if (!low || !(h.price > 0)) continue;
    const pct = ((h.price - low.price) / h.price) * 100;
    if (!(pct > 1.2) || pct > 45) continue;
    out.push({ high: h, low, pct, vol: avgVol(bars, h.i, low.i) });
  }
  return out;
}

function shrinking(list: Contraction[]): boolean {
  if (list.length < 2) return false;
  for (let i = 1; i < list.length; i++) {
    if (list[i].pct > list[i - 1].pct * 0.92) return false;
  }
  return true;
}

export function detectVcp(bars: OhlcBar[] | null | undefined): VcpHit | null {
  const src = (bars || []).filter((b) => b && b.h > 0 && b.l > 0 && b.c > 0);
  if (src.length < 80) return null;
  const window = src.slice(-200);
  const sw = swings(window, window.length > 140 ? 4 : 3);
  if (sw.length < 5) return null;

  const all = contractionsOf(window, sw);
  if (all.length < 2) return null;

  // Last 2–4 contractions that sit after a prior uptrend.
  let best: Contraction[] | null = null;
  for (let n = 4; n >= 2; n--) {
    if (all.length < n) continue;
    const slice = all.slice(all.length - n);
    if (!shrinking(slice)) continue;
    if (slice[slice.length - 1].pct > 12.5) continue;
    best = slice;
    break;
  }
  if (!best) return null;

  const first = best[0];
  const lastC = best[best.length - 1];
  const pivot = Math.max(...best.map((c) => c.high.price));
  const leftI = first.high.i;
  if (leftI < 25) return null;

  const pre = window.slice(Math.max(0, leftI - 120), leftI);
  let preLow = Infinity;
  for (const b of pre) if (b.l < preLow) preLow = b.l;
  if (!(preLow > 0) || (first.high.price / preLow - 1) * 100 < 18) return null;

  let baseLow = Infinity;
  for (let i = first.high.i; i < window.length; i++) if (window[i].l < baseLow) baseLow = window[i].l;
  const depth = ((pivot - baseLow) / pivot) * 100;
  if (depth < 7 || depth > 42) return null;

  const earlyVol = best.slice(0, Math.max(1, best.length - 1)).reduce((s, c) => s + c.vol, 0) / Math.max(1, best.length - 1);
  if (earlyVol > 0 && lastC.vol > earlyVol * 1.15) return null;

  const last = window[window.length - 1];
  const avg50 = volAvg(window, 50) || volAvg(window, 20);
  const volX = avg50 > 0 ? last.v / avg50 : null;
  const lastT = last.t;
  const pivotBar = window[best.reduce((a, c) => (c.high.price >= a.high.price ? c : a)).high.i];
  const days = Math.max(0, Math.round((lastT - pivotBar.t) / 86400));
  const near = last.c >= pivot * 0.92 && last.c <= pivot * 1.012;
  const broke = (() => {
    const cut = window.slice(-12);
    return cut.some((b) => b.c > pivot && (avg50 <= 0 || b.v >= avg50 * 1.35));
  })();
  const forming = near && !broke && last.c <= pivot * 1.012;
  const breakout = broke && last.c >= pivot * 0.995;
  if (!forming && !breakout) return null;
  return {
    forming,
    breakout,
    n: best.length,
    lastPct: lastC.pct,
    days,
    volX,
    pivot,
  };
}

export type VcpState = "calculated" | "insufficient" | "unavailable" | "na";

/** Separate "no series", "too few bars", and "enough bars, not a VCP". */
export function classifyVcp(bars: OhlcBar[] | null | undefined): { state: VcpState; hit: VcpHit | null } {
  if (!bars || bars.length === 0) return { state: "unavailable", hit: null };
  const src = bars.filter((b) => b && b.h > 0 && b.l > 0 && b.c > 0);
  if (!src.length) return { state: "unavailable", hit: null };
  if (src.length < 80) return { state: "insufficient", hit: null };
  const hit = detectVcp(src);
  if (!hit) return { state: "na", hit: null };
  return { state: "calculated", hit };
}
