/** Portfolio decision stats — overlap, valuation, correlation, tax clock, PEG/Graham. */

import { NIFTY50 } from "./universe.ts";
import type { Bar, Holding, HoldingRow, Sleeve } from "./types";

export function bareSym(symbol: string) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "")
    .replace(/[-_]SM$/i, "");
}

const NIFTY_SET = new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));

export function isNifty50(symbol: string) {
  return NIFTY_SET.has(bareSym(symbol));
}

export type OverlapSnap = {
  weight: number;
  count: number;
  total: number;
  inside: { symbol: string; name: string; weight: number }[];
  satellites: { symbol: string; name: string; weight: number }[];
};

export function niftyOverlap(rows: { symbol: string; name: string; weight: number; kind?: string }[]): OverlapSnap {
  const eq = rows.filter((r) => r.kind !== "commodity");
  const inside: OverlapSnap["inside"] = [];
  const satellites: OverlapSnap["satellites"] = [];
  let weight = 0;
  for (const r of eq) {
    const row = { symbol: r.symbol, name: r.name, weight: r.weight };
    if (isNifty50(r.symbol)) {
      inside.push(row);
      weight += r.weight;
    } else satellites.push(row);
  }
  inside.sort((a, b) => b.weight - a.weight);
  satellites.sort((a, b) => b.weight - a.weight);
  return { weight, count: inside.length, total: eq.length, inside, satellites };
}

export function weightedAvg<T extends { weight: number }>(
  rows: T[],
  valueOf: (r: T, i: number) => number | null | undefined,
): number | null {
  let num = 0;
  let den = 0;
  rows.forEach((r, i) => {
    const v = valueOf(r, i);
    if (v == null || !Number.isFinite(v)) return;
    num += r.weight * v;
    den += r.weight;
  });
  return den > 0 ? num / den : null;
}

export function simpleAvg(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (!xs.length) return null;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/**
 * Aggregate P/E = sum(weight) / sum(weight / P/E).
 * Equivalent to portfolio value / attributable earnings. Not a weighted average of the P/E numbers.
 */
export function aggregatePe(rows: { weight: number; pe: number | null | undefined }[]): {
  value: number | null;
  status: "derived" | "unavailable";
  methodology: string;
  missing: string[];
  period: string | null;
} {
  let wSum = 0;
  let inv = 0;
  let used = 0;
  for (const r of rows) {
    const pe = r.pe != null && Number.isFinite(r.pe) ? r.pe : null;
    if (!(r.weight > 0) || pe == null || !(pe > 0) || pe >= 400) continue;
    wSum += r.weight;
    inv += r.weight / pe;
    used += 1;
  }
  if (!(inv > 0) || used < 1) {
    return {
      value: null,
      status: "unavailable",
      methodology: "Aggregate P/E needs weights and positive constituent P/E.",
      missing: ["P/E"],
      period: null,
    };
  }
  return {
    value: wSum / inv,
    status: "derived",
    methodology: `Kosh-derived aggregate P/E from ${used} names: total weight / sum(weight / P/E). Not a weighted average of P/E.`,
    missing: [],
    period: null,
  };
}

export type MixVsNifty = {
  pe: number | null;
  weightedPe: number | null;
  niftyPe: number | null;
  roe: number | null;
  niftyRoe: number | null;
  de: number | null;
  niftyDe: number | null;
  divYield: number | null;
  niftyDiv: number | null;
  covered: number;
  niftyCovered: number;
};

export function mixVsNifty(
  rows: { symbol: string; weight: number; kind?: string }[],
  bySymbol: Map<string, { pe?: number | null; roe?: number | null; de?: number | null; divYield?: number | null }>,
  niftyRows: { symbol: string; pe?: number | null; roe?: number | null; de?: number | null; divYield?: number | null }[],
): MixVsNifty {
  const eq = rows.filter((r) => r.kind !== "commodity");
  const lookup = (r: { symbol: string }) => bySymbol.get(bareSym(r.symbol));
  const peOf = (r: { symbol: string; weight: number }) => {
    const v = lookup(r)?.pe;
    return v != null && v > 0 && v < 400 ? v : null;
  };
  const covered = eq.filter((r) => peOf(r) != null || lookup(r)?.roe != null).length;
  const n50 = niftyRows.filter((r) => isNifty50(r.symbol));
  const agg = aggregatePe(eq.map((r) => ({ weight: r.weight, pe: peOf(r) })));
  return {
    pe: agg.value,
    weightedPe: weightedAvg(eq, (r) => peOf(r)),
    niftyPe: simpleAvg(n50.map((r) => (r.pe != null && r.pe > 0 && r.pe < 400 ? r.pe : null))),
    roe: weightedAvg(eq, (r) => {
      const v = lookup(r)?.roe;
      return v != null && Number.isFinite(v) && Math.abs(v) < 200 ? v : null;
    }),
    niftyRoe: simpleAvg(n50.map((r) => r.roe)),
    de: weightedAvg(eq, (r) => {
      const v = lookup(r)?.de;
      return v != null && v >= 0 && v < 20 ? v : null;
    }),
    niftyDe: simpleAvg(n50.map((r) => (r.de != null && r.de >= 0 ? r.de : null))),
    divYield: weightedAvg(eq, (r) => {
      const v = lookup(r)?.divYield;
      return v != null && v >= 0 && v < 30 ? v : null;
    }),
    niftyDiv: simpleAvg(n50.map((r) => (r.divYield != null && r.divYield >= 0 ? r.divYield : null))),
    covered,
    niftyCovered: n50.filter((r) => (r.pe != null && r.pe > 0) || r.roe != null).length,
  };
}

export function grahamNumber(eps: number | null | undefined, book: number | null | undefined): number | null {
  if (eps == null || book == null || !(eps > 0) || !(book > 0)) return null;
  const g = Math.sqrt(22.5 * eps * book);
  return Number.isFinite(g) && g > 0 ? g : null;
}

/** P/E ÷ profit CAGR %. Only when growth is positive. */
export function pegRatio(pe: number | null | undefined, growthPct: number | null | undefined): number | null {
  if (pe == null || !(pe > 0) || pe > 400) return null;
  if (growthPct == null || !(growthPct > 0) || growthPct > 200) return null;
  const peg = pe / growthPct;
  if (!Number.isFinite(peg) || peg <= 0 || peg > 80) return null;
  return peg;
}

export function pickPeg(
  vendor: number | null | undefined,
  pe: number | null | undefined,
  cagr5: number | null | undefined,
  cagr3: number | null | undefined,
): { peg: number; via: string } | null {
  const computed = pegRatio(pe, cagr5) ?? pegRatio(pe, cagr3);
  const via = pegRatio(pe, cagr5) != null ? "5Y profit growth" : pegRatio(pe, cagr3) != null ? "3Y profit growth" : "";
  if (vendor != null && vendor > 0 && vendor < 80 && Number.isFinite(vendor)) {
    if (computed && Math.abs(Math.log(vendor / computed)) > Math.log(3)) {
      return computed && via ? { peg: computed, via } : { peg: vendor, via: "company card" };
    }
    return { peg: vendor, via: computed && via ? via : "company card" };
  }
  return computed && via ? { peg: computed, via } : null;
}

export function taxClock(date: string | null | undefined, asOf = Date.now()): {
  days: number;
  toLtcg: number;
  longTerm: boolean;
} | null {
  if (!date) return null;
  const raw = date.length === 10 ? date + "T00:00:00+05:30" : date;
  const t = Date.parse(raw);
  if (!Number.isFinite(t) || t <= 0) return null;
  const days = Math.floor((asOf - t) / 86400000);
  if (days < 0 || days > 20000) return null;
  const toLtcg = Math.max(0, 365 - days);
  return { days, toLtcg, longTerm: days >= 365 };
}

function toDayClose(bars: Bar[] | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const b of bars || []) {
    if (!b || !(b.c > 0) || !b.t) continue;
    const day = new Date((b.t + 19800) * 1000).toISOString().slice(0, 10);
    m.set(day, b.c);
  }
  return m;
}

export function corrFromBars(a: Bar[] | undefined, b: Bar[] | undefined, minDays = 60): number | null {
  const ma = toDayClose(a);
  const mb = toDayClose(b);
  const days = [...ma.keys()].filter((d) => mb.has(d)).sort();
  if (days.length < minDays + 1) return null;
  const cut = days.slice(-Math.min(days.length, 280));
  const ra: number[] = [];
  const rb: number[] = [];
  for (let i = 1; i < cut.length; i++) {
    const a0 = ma.get(cut[i - 1])!;
    const a1 = ma.get(cut[i])!;
    const b0 = mb.get(cut[i - 1])!;
    const b1 = mb.get(cut[i])!;
    if (a0 > 0 && a1 > 0 && b0 > 0 && b1 > 0) {
      ra.push(a1 / a0 - 1);
      rb.push(b1 / b0 - 1);
    }
  }
  if (ra.length < minDays) return null;
  const n = ra.length;
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < n; i++) {
    sa += ra[i];
    sb += rb[i];
  }
  const maR = sa / n;
  const mbR = sb / n;
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i++) {
    const da = ra[i] - maR;
    const db = rb[i] - mbR;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  const den = Math.sqrt(va * vb);
  if (!(den > 0)) return null;
  const c = cov / den;
  return Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null;
}

export type CorrCluster = {
  id: string;
  symbols: string[];
  names: string[];
  weight: number;
  alone?: boolean;
};

export type CorrPack = {
  symbols: string[];
  names: string[];
  weights: number[];
  matrix: (number | null)[][];
  vsNifty: (number | null)[];
  clusters: CorrCluster[];
  cap?: number;
};

export function buildCorrPack(
  rows: { symbol: string; name: string; weight: number; kind?: string }[],
  histories: Record<string, Bar[]>,
  cap = 12,
  benchBars?: Bar[],
): CorrPack {
  const list = rows
    .filter((r) => r.kind !== "commodity" && r.weight > 0)
    .filter((r) => (histories[r.symbol] || []).length >= 80)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, cap);
  const n = list.length;
  const matrix: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const c = corrFromBars(histories[list[i].symbol], histories[list[j].symbol]);
      matrix[i][j] = c;
      matrix[j][i] = c;
    }
  }
  const vsNifty = list.map((r) => (benchBars?.length ? corrFromBars(histories[r.symbol], benchBars) : null));
  const used = new Set<number>();
  const raw: CorrCluster[] = [];
  for (let i = 0; i < n; i++) {
    if (used.has(i)) continue;
    const members = [i];
    used.add(i);
    for (let j = 0; j < n; j++) {
      if (used.has(j)) continue;
      const c = matrix[i][j];
      if (c != null && c >= 0.5) {
        members.push(j);
        used.add(j);
      }
    }
    raw.push({
      id: "g" + i,
      symbols: members.map((k) => list[k].symbol),
      names: members.map((k) => list[k].name),
      weight: members.reduce((s, k) => s + list[k].weight, 0),
      alone: members.length === 1,
    });
  }
  const groups = raw.filter((c) => !c.alone).sort((a, b) => b.weight - a.weight);
  const singles = raw.filter((c) => c.alone);
  if (singles.length) {
    groups.push({
      id: "alone",
      symbols: singles.flatMap((c) => c.symbols),
      names: singles.flatMap((c) => c.names),
      weight: singles.reduce((s, c) => s + c.weight, 0),
      alone: true,
    });
  }
  return {
    symbols: list.map((r) => r.symbol),
    names: list.map((r) => r.name),
    weights: list.map((r) => r.weight),
    matrix,
    vsNifty,
    clusters: groups,
    cap,
  };
}

export function vsSectorGap(row: Pick<HoldingRow, "sector" | "periods">, sleeves: Sleeve[]) {
  const sl = sleeves.find((s) => s.sector === row.sector);
  const y1 = row.periods.y1;
  const sectorY1 = sl?.index.y1 ?? null;
  const gap = y1 != null && sectorY1 != null ? y1 - sectorY1 : null;
  return { y1, sectorY1, gap, indexName: sl?.indexName || row.sector };
}

export function addQtyForWeight(value: number, px: number, weight: number): number {
  if (!(px > 0) || !(value > 0) || !(weight > 0) || weight >= 0.95) return 0;
  return (weight * value) / ((1 - weight) * px);
}

export function mergeAddHolding(holdings: Holding[], add: Holding): Holding[] {
  const key = bareSym(add.symbol);
  let hit = false;
  const next = holdings.map((h) => {
    if (bareSym(h.symbol) !== key) return h;
    hit = true;
    return { ...h, qty: h.qty + add.qty };
  });
  return hit ? next : [...next, add];
}
