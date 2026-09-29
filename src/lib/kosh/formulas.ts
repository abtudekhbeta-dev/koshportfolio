/** Shared formulas. A blank input stays blank. Derived is never labeled reported. */

import { parsePeriod } from "./fin-series.ts";
import type { FinPoint, Fundamentals } from "./types.ts";
import { noteDerived } from "./evidence.ts";
import { pegRatio } from "./portfolio-stats.ts";

export type FormulaHit = {
  value: number | null;
  status: "derived" | "unavailable";
  methodology: string;
  missing: string[];
  period: string | null;
};

function finite(n: number | null | undefined): number | null {
  return n != null && Number.isFinite(n) ? n : null;
}

function monthsApart(a: { y: number; m: number }, b: { y: number; m: number }) {
  return (b.y - a.y) * 12 + (b.m - a.m);
}

/**
 * CAGR over the actual span between the latest print and the print nearest the requested horizon.
 * Does not drop non-positive years and then pretend the survivors are consecutive.
 */
export function seriesCagr(pts: FinPoint[] | null | undefined, years: number): FormulaHit {
  const rows = (pts || [])
    .map((p) => ({ ...p, parsed: parsePeriod(p.period) }))
    .filter((p) => p.parsed && Number.isFinite(p.value))
    .sort((a, b) => a.parsed!.t - b.parsed!.t);
  const methodBase = `${years}-year CAGR from annual prints.`;
  if (rows.length < 2) {
    return {
      value: null,
      status: "unavailable",
      methodology: `${methodBase} Not enough annual prints.`,
      missing: ["annual series"],
      period: null,
    };
  }
  const last = rows[rows.length - 1];
  const targetMonths = years * 12;
  let best = rows[0];
  let bestGap = Infinity;
  for (const row of rows) {
    if (row === last) continue;
    const gap = Math.abs(monthsApart(row.parsed!, last.parsed!) - targetMonths);
    if (gap < bestGap) {
      bestGap = gap;
      best = row;
    }
  }
  const spanYears = monthsApart(best.parsed!, last.parsed!) / 12;
  const period = `${best.period} → ${last.period}`;
  const between = rows.filter((row) => row.parsed!.t >= best.parsed!.t && row.parsed!.t <= last.parsed!.t);
  if (between.some((row) => !(row.value > 0))) {
    return {
      value: null,
      status: "unavailable",
      methodology: "CAGR unavailable — earnings crossed zero or a non-positive print. Those years were not dropped.",
      missing: [],
      period,
    };
  }
  if (spanYears < years * 0.75) {
    return {
      value: null,
      status: "unavailable",
      methodology: `${methodBase} The prints on file span ${spanYears.toFixed(1)} years, not ${years}. Time was not compressed.`,
      missing: [`${years} years of history`],
      period,
    };
  }
  if (!(best.value > 0) || !(last.value > 0)) {
    return {
      value: null,
      status: "unavailable",
      methodology: "CAGR unavailable — earnings crossed zero or a non-positive print.",
      missing: [],
      period,
    };
  }
  const value = (Math.pow(last.value / best.value, 1 / spanYears) - 1) * 100;
  if (!Number.isFinite(value)) {
    return { value: null, status: "unavailable", methodology: `${methodBase} Result was not a finite number.`, missing: [], period };
  }
  return {
    value,
    status: "derived",
    methodology: `Kosh-derived: (ending / beginning) ^ (1 / ${spanYears.toFixed(2)} years) − 1. Not a reported CAGR.`,
    missing: [],
    period,
  };
}

export function ratio(num: number | null, den: number | null, label: string): FormulaHit {
  const a = finite(num);
  const b = finite(den);
  if (a == null || b == null) {
    return {
      value: null,
      status: "unavailable",
      methodology: `${label} needs both inputs.`,
      missing: [a == null ? "numerator" : "denominator"].filter(Boolean),
      period: null,
    };
  }
  if (b === 0) {
    return { value: null, status: "unavailable", methodology: `${label} unavailable — denominator is zero.`, missing: [], period: null };
  }
  const value = a / b;
  return {
    value: Number.isFinite(value) ? value : null,
    status: Number.isFinite(value) ? "derived" : "unavailable",
    methodology: `Kosh-derived: ${label}. Not a reported line.`,
    missing: [],
    period: null,
  };
}

/** Latest aligned annual CFO / PAT. */
export function cfoToPat(cfo: FinPoint[] | null | undefined, profits: FinPoint[] | null | undefined): FormulaHit {
  const c = (cfo || []).filter((p) => Number.isFinite(p.value)).at(-1);
  const p = (profits || []).filter((x) => Number.isFinite(x.value)).at(-1);
  if (!c || !p) {
    return { value: null, status: "unavailable", methodology: "CFO/PAT needs both an annual cash-flow and a profit print.", missing: ["CFO or PAT"], period: null };
  }
  const same = c.period === p.period || (parsePeriod(c.period)?.t || 0) === (parsePeriod(p.period)?.t || -1);
  if (!same) {
    return {
      value: null,
      status: "unavailable",
      methodology: `CFO/PAT unavailable — periods differ (${c.period} vs ${p.period}).`,
      missing: [],
      period: null,
    };
  }
  if (p.value === 0) {
    return { value: null, status: "unavailable", methodology: "CFO/PAT unavailable — profit is zero.", missing: [], period: p.period };
  }
  const value = c.value / p.value;
  return {
    value: Number.isFinite(value) ? value : null,
    status: "derived",
    methodology: "Kosh-derived: latest annual CFO / PAT for the same period. Not a reported ratio.",
    missing: [],
    period: p.period,
  };
}

/**
 * Aggregate P/E lives in portfolio-stats so valuation and the portfolio page share one function.
 * Re-exported here so the formula engine has a single import path.
 */
export { aggregatePe } from "./portfolio-stats.ts";

const DERIVED_FROM_FILING = {
  roce: "Kosh-derived from the filing: EBIT / ending capital employed (equity + borrowings). Ending capital, not an average. Not a reported ROCE line.",
  interestCover: "Kosh-derived from the filing: (profit before tax + finance cost) / finance cost. Not a reported interest-coverage line.",
} as const;

/** Fill only blanks. Relabel filing-computed ratios as derived. Never overwrite a number already on the card. */
export function applyFormulas(fund: Fundamentals): Fundamentals {
  let out: Fundamentals = { ...fund, provenance: fund.provenance ? { ...fund.provenance, fields: { ...fund.provenance.fields } } : fund.provenance };
  const fields = { ...(out.provenance?.fields || {}) };
  const derived: Record<string, string> = {};

  for (const key of ["roce", "interestCover"] as const) {
    const cur = fields[key];
    if (out[key] == null || !cur) continue;
    if (cur.rank === "exchange-filing" || cur.rank === "kosh-derived") {
      fields[key] = {
        ...cur,
        status: "derived",
        rank: "kosh-derived",
        source: "Kosh from NSE filing",
        method: DERIVED_FROM_FILING[key],
      };
    }
  }

  const put = (key: "salesCagr3" | "profitCagr3" | "profitCagr5" | "cfoPat" | "peg" | "salesYoY" | "profitYoY", hit: FormulaHit) => {
    if (out[key] != null) return;
    if (hit.value == null) {
      fields[key] = {
        status: "unavailable",
        source: "Kosh formula",
        rank: "kosh-derived",
        method: hit.methodology,
        period: hit.period,
      };
      return;
    }
    (out as unknown as Record<string, number>)[key] = hit.value;
    derived[key] = hit.methodology;
    fields[key] = {
      status: "derived",
      source: "Kosh formula",
      rank: "kosh-derived",
      method: hit.methodology,
      period: hit.period,
    };
  };

  put("salesCagr3", seriesCagr(out.sales, 3));
  put("profitCagr3", seriesCagr(out.profits, 3));
  put("profitCagr5", seriesCagr(out.profits, 5));
  put("cfoPat", cfoToPat(out.cfo, out.profits));

  const yoy = (pts: FinPoint[] | undefined, label: string): FormulaHit => {
    if (!pts || pts.length < 2) {
      return { value: null, status: "unavailable", methodology: `${label} needs two annual prints.`, missing: [label], period: null };
    }
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    if (!(a.value > 0)) {
      return { value: null, status: "unavailable", methodology: `${label} unavailable — the prior year is not positive.`, missing: [], period: b.period };
    }
    return {
      value: ((b.value / a.value - 1) * 100),
      status: "derived",
      methodology: `Kosh-derived: ${label} from ${a.period} to ${b.period}. Not a reported growth line.`,
      missing: [],
      period: b.period,
    };
  };
  put("salesYoY", yoy(out.sales, "Sales growth"));
  put("profitYoY", yoy(out.profits, "Profit growth"));

  if (out.peg == null) {
    const via5 = pegRatio(out.pe, out.profitCagr5);
    const via3 = pegRatio(out.pe, out.profitCagr3);
    const peg = via5 ?? via3;
    const via = via5 != null ? "5Y profit CAGR" : via3 != null ? "3Y profit CAGR" : "";
    if (peg != null && via) {
      out.peg = peg;
      out.pegVia = via;
      derived.peg = `Kosh-derived: P/E ÷ ${via}. Growth period is that CAGR, not a trailing-twelve-month guess.`;
      fields.peg = { status: "derived", source: "Kosh formula", rank: "kosh-derived", method: derived.peg, period: via };
    }
  }

  out = { ...out, provenance: out.provenance ? { ...out.provenance, fields } : { at: Date.now(), searched: Boolean(fund.provenance?.searched), fields } };
  if (Object.keys(derived).length) out = noteDerived(out, derived);
  return out;
}
