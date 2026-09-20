/** Conservative pattern hits on the bars of the selected timeframe. */

import { detectVcp } from "./vcp.ts";
import { nameSwings, swings } from "./ohlc.ts";
import type { OhlcBar } from "./types.ts";

export type PatternKind = "vcp" | "vcp-break" | "flag" | "double-top" | "double-bottom" | "triangle" | "range";
export type PatternStatus = "forming" | "reached";

export type PatternHit = {
  kind: PatternKind;
  label: string;
  note: string;
  points: { t: number; price: number }[];
  tone: "up" | "down" | "chart";
  /** Forming = structure still in play. Reached = last print has left the structure. Not a forecast. */
  status: PatternStatus;
};

const MAX = 3;

function kOf(n: number) {
  return n > 180 ? 5 : n > 80 ? 3 : 2;
}

function inside(c: number, lo: number, hi: number) {
  if (!(c > 0) || !(lo > 0) || !(hi > 0) || hi < lo) return false;
  return c >= lo * 0.99 && c <= hi * 1.01;
}

export function detectFlag(bars: OhlcBar[]): PatternHit | null {
  if (bars.length < 30) return null;
  const last = bars[bars.length - 1];
  for (const pole of [8, 10, 12, 15]) {
    if (bars.length < pole + 8) continue;
    const start = bars[bars.length - pole - 12];
    const endPole = bars[bars.length - 12];
    if (!start?.c || !endPole?.c) continue;
    const move = (endPole.c / start.c - 1) * 100;
    if (Math.abs(move) < 12) continue;
    const rest = bars.slice(-12);
    const hi = Math.max(...rest.map((b) => b.h));
    const lo = Math.min(...rest.map((b) => b.l));
    const range = ((hi - lo) / (endPole.c || 1)) * 100;
    if (range > Math.abs(move) * 0.45 || range < 2) continue;
    if (last.c > hi * 1.01 || last.c < lo * 0.99) continue;
    const up = move > 0;
    return {
      kind: "flag",
      label: up ? "Bull flag" : "Bear flag",
      note: `Pole ${move.toFixed(0)}%, then a tight ${range.toFixed(1)}% coil.`,
      points: [
        { t: start.t, price: start.c },
        { t: endPole.t, price: endPole.c },
        { t: rest[0].t, price: hi },
        { t: last.t, price: lo },
      ],
      tone: up ? "up" : "down",
      status: "forming",
    };
  }
  return null;
}

export function detectDouble(bars: OhlcBar[]): PatternHit | null {
  const named = nameSwings(swings(bars, kOf(bars.length)));
  const highs = named.filter((s) => s.kind === "H").slice(-5);
  const lows = named.filter((s) => s.kind === "L").slice(-5);
  const last = bars[bars.length - 1];
  if (highs.length >= 2) {
    const a = highs[highs.length - 2];
    const b = highs[highs.length - 1];
    if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= 0.015) {
      const trough = lows.find((l) => l.i > a.i && l.i < b.i);
      if (trough && (a.price - trough.price) / a.price >= 0.04) {
        const broken = last.c < trough.price * 0.995;
        return {
          kind: "double-top",
          label: "Double top",
          note: `Two highs near ${a.price.toFixed(0)}, trough ${trough.price.toFixed(0)}.`,
          points: [
            { t: a.t, price: a.price },
            { t: trough.t, price: trough.price },
            { t: b.t, price: b.price },
          ],
          tone: "down",
          status: broken ? "reached" : "forming",
        };
      }
    }
  }
  if (lows.length >= 2) {
    const a = lows[lows.length - 2];
    const b = lows[lows.length - 1];
    if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= 0.015) {
      const peak = highs.find((h) => h.i > a.i && h.i < b.i);
      if (peak && (peak.price - a.price) / a.price >= 0.04) {
        const broken = last.c > peak.price * 1.005;
        return {
          kind: "double-bottom",
          label: "Double bottom",
          note: `Two lows near ${a.price.toFixed(0)}, peak ${peak.price.toFixed(0)}.`,
          points: [
            { t: a.t, price: a.price },
            { t: peak.t, price: peak.price },
            { t: b.t, price: b.price },
          ],
          tone: "up",
          status: broken ? "reached" : "forming",
        };
      }
    }
  }
  return null;
}

export function detectTriangle(bars: OhlcBar[]): PatternHit | null {
  const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
  const hs = named.filter((s) => s.kind === "H");
  const ls = named.filter((s) => s.kind === "L");
  if (hs.length < 3 || ls.length < 3) return null;
  const h1 = hs[hs.length - 3].price;
  const h2 = hs[hs.length - 2].price;
  const h3 = hs[hs.length - 1].price;
  const l1 = ls[ls.length - 3].price;
  const l2 = ls[ls.length - 2].price;
  const l3 = ls[ls.length - 1].price;
  const highsDown = h1 > h2 && h2 > h3;
  const lowsUp = l1 < l2 && l2 < l3;
  const highsUp = h1 < h2 && h2 < h3;
  const lowsDown = l1 > l2 && l2 > l3;
  if (!(highsDown && lowsUp) && !(highsDown && lowsDown) && !(highsUp && lowsUp)) return null;
  const label = highsDown && lowsUp ? "Triangle" : highsDown && lowsDown ? "Descending triangle" : "Ascending triangle";
  const last = bars[bars.length - 1];
  const bandLo = Math.min(l1, l2, l3);
  const bandHi = Math.max(h1, h2, h3);
  return {
    kind: "triangle",
    label,
    note: "Swing highs and lows are converging on this timeframe.",
    points: [
      { t: hs[hs.length - 3].t, price: h1 },
      { t: hs[hs.length - 1].t, price: h3 },
      { t: ls[ls.length - 3].t, price: l1 },
      { t: ls[ls.length - 1].t, price: l3 },
    ],
    tone: "chart",
    status: inside(last.c, bandLo, bandHi) ? "forming" : "reached",
  };
}

export function detectRange(bars: OhlcBar[]): PatternHit | null {
  const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
  const hs = named.filter((s) => s.kind === "H").slice(-3);
  const ls = named.filter((s) => s.kind === "L").slice(-3);
  if (hs.length < 2 || ls.length < 2) return null;
  const hAvg = hs.reduce((s, x) => s + x.price, 0) / hs.length;
  const lAvg = ls.reduce((s, x) => s + x.price, 0) / ls.length;
  if (!(hAvg > 0) || !(lAvg > 0) || hAvg <= lAvg) return null;
  const hTight = hs.every((h) => Math.abs(h.price / hAvg - 1) <= 0.012);
  const lTight = ls.every((l) => Math.abs(l.price / lAvg - 1) <= 0.012);
  const span = ((hAvg - lAvg) / hAvg) * 100;
  if (!hTight || !lTight || span < 5 || span > 18) return null;
  const last = bars[bars.length - 1];
  return {
    kind: "range",
    label: "Range",
    note: `${span.toFixed(1)}% between ${lAvg.toFixed(0)} and ${hAvg.toFixed(0)}.`,
    points: [
      { t: hs[0].t, price: hAvg },
      { t: ls[0].t, price: lAvg },
    ],
    tone: "chart",
    status: inside(last.c, lAvg, hAvg) ? "forming" : "reached",
  };
}

export function detectPatterns(bars: OhlcBar[] | null | undefined): PatternHit[] {
  const src = (bars || []).filter((b) => b && b.c > 0);
  if (src.length < 24) return [];
  const out: PatternHit[] = [];
  const seen = new Set<PatternKind>();
  const push = (hit: PatternHit | null) => {
    if (!hit || out.length >= MAX || seen.has(hit.kind)) return;
    seen.add(hit.kind);
    out.push(hit);
  };
  const vcp = detectVcp(src);
  if (vcp?.breakout) {
    push({
      kind: "vcp-break",
      label: "VCP breakout",
      note: `${vcp.n} contractions, pivot ${vcp.pivot.toFixed(0)}. Last print is through the pivot — observed, not a forecast.`,
      points: [{ t: src[src.length - 1].t, price: vcp.pivot }],
      tone: "up",
      status: "reached",
    });
  } else if (vcp?.forming) {
    push({
      kind: "vcp",
      label: "VCP",
      note: `${vcp.n} contractions, last ${vcp.lastPct.toFixed(1)}%, pivot ${vcp.pivot.toFixed(0)}.`,
      points: [{ t: src[src.length - 1].t, price: vcp.pivot }],
      tone: "chart",
      status: "forming",
    });
  }
  push(detectFlag(src));
  push(detectDouble(src));
  if (out.length < MAX) push(detectTriangle(src));
  if (out.length < MAX) push(detectRange(src));
  return out.slice(0, MAX);
}

export function patternStatusLabel(s: PatternStatus) {
  return s === "reached" ? "Reached" : "Forming";
}
