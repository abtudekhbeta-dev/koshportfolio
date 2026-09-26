/** Indexed-to-100 and USD adjustment. Missing inputs stay missing — no invented series. */

export type Px = { t: number; c: number };

export function istDay(tSec: number): number {
  return Math.floor((tSec + 19800) / 86400);
}

/** Rebase the first positive print in the visible slice to 100. */
export function indexTo100(values: (number | null | undefined)[]): (number | null)[] {
  const i0 = values.findIndex((v) => v != null && v > 0);
  if (i0 < 0) return values.map(() => null);
  const base = values[i0] as number;
  return values.map((v, i) => (i < i0 || v == null || !(v > 0) ? null : (v / base) * 100));
}

export type IndexedPair = { t: number; stock: number; bench: number };

/** Overlapping days only. Both series start at 100 on the first shared print. */
export function alignIndexed(stock: Px[], bench: Px[]): IndexedPair[] {
  const bmap = new Map<number, number>();
  for (const b of bench) {
    if (b.c > 0) bmap.set(istDay(b.t), b.c);
  }
  const pairs: { t: number; s: number; b: number }[] = [];
  for (const s of stock) {
    const bv = bmap.get(istDay(s.t));
    if (s.c > 0 && bv) pairs.push({ t: s.t, s: s.c, b: bv });
  }
  if (pairs.length < 2) return [];
  const s0 = pairs[0].s;
  const b0 = pairs[0].b;
  return pairs.map((p) => ({ t: p.t, stock: (p.s / s0) * 100, bench: (p.b / b0) * 100 }));
}

/** Percentage-point gap on an indexed pair: 124 vs 112 → +12. Not a signal. */
export function indexedGap(rows: { stock: number; bench: number }[]): number | null {
  if (rows.length < 2) return null;
  const z = rows[rows.length - 1];
  const gap = z.stock - z.bench;
  return Number.isFinite(gap) ? gap : null;
}

export type FxBar = { t: number; o: number; h: number; l: number; c: number };

/**
 * Divide each OHLC by the USD/INR print on or before that day.
 * Does not stamp today's rate onto history. Bars with no prior FX are dropped.
 */
export function applyHistoricalFx<T extends FxBar>(bars: T[], fx: Px[]): { bars: T[]; missing: number } {
  const sorted = fx
    .filter((f) => f.c > 0)
    .map((f) => [istDay(f.t), f.c] as const)
    .sort((a, b) => a[0] - b[0]);
  function rate(day: number): number | null {
    let hit: number | null = null;
    for (const [d, c] of sorted) {
      if (d <= day) hit = c;
      else break;
    }
    return hit;
  }
  const out: T[] = [];
  let missing = 0;
  for (const b of bars) {
    const r = rate(istDay(b.t));
    if (!r) {
      missing += 1;
      continue;
    }
    out.push({ ...b, o: b.o / r, h: b.h / r, l: b.l / r, c: b.c / r });
  }
  return { bars: out, missing };
}
