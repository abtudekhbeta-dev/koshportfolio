/** Last good Nifty 50 fundamental snapshot. Not rebuilt from a thin screener page. */

import { isNifty50 } from "./portfolio-stats.ts";

export type NiftySnap = {
  at: number;
  names: number;
  covered: number;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  opm: number | null;
  de: number | null;
  divYield: number | null;
};

export type NiftyRow = {
  symbol: string;
  pe?: number | null;
  pb?: number | null;
  roe?: number | null;
  roce?: number | null;
  opm?: number | null;
  de?: number | null;
  divYield?: number | null;
};

let cached: NiftySnap | null = null;

function avg(vals: (number | null | undefined)[]): number | null {
  const xs = vals.filter((v): v is number => v != null && Number.isFinite(v));
  if (!xs.length) return null;
  return xs.reduce((s, v) => s + v, 0) / xs.length;
}

/** Build a snapshot only when at least 15 Nifty 50 names have a P/E or ROE. Otherwise keep the previous one. */
export function rememberNifty(rows: NiftyRow[]): NiftySnap | null {
  const n50 = rows.filter((r) => isNifty50(r.symbol));
  const covered = n50.filter((r) => (r.pe != null && r.pe > 0) || r.roe != null).length;
  if (n50.length < 15 || covered < 15) return cached;
  cached = {
    at: Date.now(),
    names: n50.length,
    covered,
    pe: avg(n50.map((r) => (r.pe != null && r.pe > 0 && r.pe < 400 ? r.pe : null))),
    pb: avg(n50.map((r) => (r.pb != null && r.pb > 0 && r.pb < 80 ? r.pb : null))),
    roe: avg(n50.map((r) => (r.roe != null && Math.abs(r.roe) < 200 ? r.roe : null))),
    roce: avg(n50.map((r) => (r.roce != null && Math.abs(r.roce) < 200 ? r.roce : null))),
    opm: avg(n50.map((r) => (r.opm != null && r.opm > -20 && r.opm < 80 ? r.opm : null))),
    de: avg(n50.map((r) => (r.de != null && r.de >= 0 && r.de < 20 ? r.de : null))),
    divYield: avg(n50.map((r) => (r.divYield != null && r.divYield >= 0 && r.divYield < 30 ? r.divYield : null))),
  };
  return cached;
}

export function getNiftySnapshot(): NiftySnap | null {
  return cached;
}

/** Test hook. */
export function _resetNiftySnapshot() {
  cached = null;
}
