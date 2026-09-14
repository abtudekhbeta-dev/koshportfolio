/** Deterministic valuation — no AI price target. Blank when the inputs are missing. */

import { grahamNumber, pegRatio } from "./portfolio-stats.ts";
import type { Fundamentals } from "./types.ts";

export type ValueCase = {
  label: "Bear" | "Base" | "Bull";
  growth: number;
  exitPe: number;
  years: number;
  value: number;
  vsPrice: number | null;
  note: string;
};

export type Valuation = {
  price: number | null;
  eps: number | null;
  pe: number | null;
  industryPe: number | null;
  graham: number | null;
  grahamGap: number | null;
  peg: number | null;
  pegVia: string | null;
  impliedGrowth: number | null;
  discount: number;
  years: number;
  cases: ValueCase[];
  missing: string[];
  read: string;
};

const DISCOUNT = 0.12;
const YEARS = 5;

function num(v: number | null | undefined) {
  return v != null && Number.isFinite(v) ? v : null;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function fwdValue(eps: number, growthPct: number, exitPe: number, years: number, discount: number) {
  const g = growthPct / 100;
  const fwd = eps * Math.pow(1 + g, years);
  const terminal = fwd * exitPe;
  return terminal / Math.pow(1 + discount, years);
}

/**
 * What the current P/E is asking in earnings growth if a 1.5 PEG were fair.
 * Not a forecast.
 */
export function impliedGrowthFromPe(pe: number | null | undefined): number | null {
  const p = num(pe);
  if (p == null || !(p > 0) || p > 400) return null;
  return p / 1.5;
}

export function buildValuation(input: {
  price?: number | null;
  fund?: Fundamentals | null;
}): Valuation {
  const f = input.fund || null;
  const price = num(input.price);
  const eps = num(f?.eps);
  const pe = num(f?.pe) ?? (price != null && eps != null && eps > 0 ? price / eps : null);
  const industryPe = num(f?.industryPe);
  const graham = grahamNumber(eps, f?.book);
  const grahamGap = graham != null && price != null && graham > 0 ? (price / graham - 1) * 100 : null;
  const peg = num(f?.peg) ?? pegRatio(pe, f?.profitCagr5) ?? pegRatio(pe, f?.profitCagr3);
  const pegVia = f?.pegVia || (pegRatio(pe, f?.profitCagr5) != null ? "5Y profit growth" : pegRatio(pe, f?.profitCagr3) != null ? "3Y profit growth" : null);
  const impliedGrowth = impliedGrowthFromPe(pe);

  const missing: string[] = [];
  if (price == null) missing.push("last price");
  if (eps == null || !(eps > 0)) missing.push("positive EPS");
  const growth = num(f?.profitCagr5) ?? num(f?.profitCagr3);
  if (growth == null) missing.push("profit CAGR (3Y or 5Y)");
  if (pe == null) missing.push("P/E");

  const cases: ValueCase[] = [];
  if (eps != null && eps > 0 && growth != null) {
    const baseG = clamp(growth, -20, 40);
    const bearG = clamp(baseG - 6, -25, 25);
    const bullG = clamp(baseG + 5, -15, 45);
    const ind = industryPe != null && industryPe > 4 && industryPe < 80 ? industryPe : null;
    const basePe = clamp(ind ?? 16, 8, 22);
    const bearPe = clamp((ind ?? 16) * 0.7, 6, 14);
    const bullPe = clamp((ind ?? 18) * 1.15, 10, 28);
    const mk = (label: ValueCase["label"], g: number, exitPe: number, note: string): ValueCase => {
      const value = fwdValue(eps, g, exitPe, YEARS, DISCOUNT);
      return {
        label,
        growth: g,
        exitPe,
        years: YEARS,
        value,
        vsPrice: price != null && price > 0 ? (value / price - 1) * 100 : null,
        note,
      };
    };
    cases.push(
      mk("Bear", bearG, bearPe, `Haircut the recorded profit CAGR by 6 pp, exit at ${bearPe.toFixed(0)}×.`),
      mk("Base", baseG, basePe, `Keep the recorded profit CAGR, exit at ${basePe.toFixed(0)}× (industry cap).`),
      mk("Bull", bullG, bullPe, `Give growth +5 pp, exit at ${bullPe.toFixed(0)}×. Still discounted at 12%.`),
    );
  }

  const read = interpret({ price, pe, industryPe, graham, grahamGap, peg, impliedGrowth, cases, growth });

  return {
    price,
    eps,
    pe,
    industryPe,
    graham,
    grahamGap,
    peg,
    pegVia,
    impliedGrowth,
    discount: DISCOUNT * 100,
    years: YEARS,
    cases,
    missing,
    read,
  };
}

function interpret(v: {
  price: number | null;
  pe: number | null;
  industryPe: number | null;
  graham: number | null;
  grahamGap: number | null;
  peg: number | null;
  impliedGrowth: number | null;
  cases: ValueCase[];
  growth: number | null;
}): string {
  if (v.pe == null && v.graham == null && !v.cases.length) {
    return "Not enough published numbers for a valuation read. Kosh does not invent a price.";
  }
  const bits: string[] = [];
  if (v.pe != null && v.industryPe != null) {
    const gap = ((v.pe / v.industryPe - 1) * 100);
    if (Math.abs(gap) < 10) bits.push(`P/E is in line with the reported industry (${v.pe.toFixed(0)} vs ${v.industryPe.toFixed(0)}).`);
    else if (gap > 0) bits.push(`P/E is ${gap.toFixed(0)}% above the reported industry multiple — the price is paying up, not a bargain print.`);
    else bits.push(`P/E is ${Math.abs(gap).toFixed(0)}% below the reported industry multiple. Cheap only if earnings quality holds.`);
  } else if (v.pe != null) {
    bits.push(`Trailing P/E is ${v.pe.toFixed(1)}. Industry P/E is unavailable, so this is not a relative call.`);
  }
  if (v.impliedGrowth != null) {
    bits.push(`At a 1.5 PEG, this multiple is asking for about ${v.impliedGrowth.toFixed(0)}% earnings growth. That is the market’s ask, not a forecast.`);
  }
  if (v.graham != null && v.grahamGap != null) {
    bits.push(
      v.grahamGap > 15
        ? `Last price sits ${v.grahamGap.toFixed(0)}% above the Graham number — a textbook ceiling, not a buy call.`
        : v.grahamGap < -15
          ? `Last price sits ${Math.abs(v.grahamGap).toFixed(0)}% below the Graham number. That is a filter, not a buy.`
          : `Last price is close to the Graham number.`,
    );
  }
  if (v.peg != null) {
    bits.push(v.peg <= 1.2 ? `PEG ${v.peg.toFixed(2)} is not stretched versus recorded profit growth.` : v.peg >= 3 ? `PEG ${v.peg.toFixed(2)} is expensive versus recorded profit growth.` : `PEG ${v.peg.toFixed(2)}.`);
  }
  const base = v.cases.find((c) => c.label === "Base");
  if (base && base.vsPrice != null) {
    bits.push(
      `Under the base case (recorded CAGR, 12% discount, 5-year exit) the implied value is ${base.vsPrice >= 0 ? "+" : ""}${base.vsPrice.toFixed(0)}% versus last price. Change the growth or the exit multiple and the number moves — it is not a buy call.`,
    );
  } else if (v.growth == null) {
    bits.push("No 3Y/5Y profit CAGR on the company card, so the three cases stay blank.");
  }
  return bits.join(" ") || "Numbers are on the card. No extra story is added.";
}

export function earningsQualityRead(f: Fundamentals | null | undefined): {
  cfoPat: number | null;
  tag: string;
  body: string;
} {
  if (!f) return { cfoPat: null, tag: "Unavailable", body: "No company card, so earnings quality is not scored." };
  const cfoPat = f.cfoPat;
  const lastCfo = f.cfo.at(-1)?.value ?? null;
  const lastPat = f.profits.at(-1)?.value ?? null;
  if (cfoPat == null && (lastCfo == null || lastPat == null)) {
    return { cfoPat: null, tag: "Unavailable", body: "Cash from operations is not on the company card. Kosh will not guess it." };
  }
  const ratio = cfoPat ?? (lastPat && lastPat !== 0 && lastCfo != null ? lastCfo / lastPat : null);
  if (ratio == null || !Number.isFinite(ratio)) {
    return { cfoPat: null, tag: "Unavailable", body: "Cash from operations is not on the company card." };
  }
  if (ratio >= 1) {
    return { cfoPat: ratio, tag: "Cash backs profit", body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Accruals are not doing the heavy lifting on this print.` };
  }
  if (ratio >= 0.7) {
    return { cfoPat: ratio, tag: "Adequate", body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Usable, not lush.` };
  }
  if (ratio >= 0.4) {
    return { cfoPat: ratio, tag: "Soft cash", body: `Operating cash is only ${ratio.toFixed(2)}× reported profit. Earnings quality needs a second look — working capital or accruals may be carrying the print.` };
  }
  return { cfoPat: ratio, tag: "Weak cash", body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Treat the earnings print as low quality until cash catches up.` };
}
