/** Scenario valuation — not intrinsic value. Blank when the inputs are missing. */

import { grahamNumber, pegRatio } from "./portfolio-stats.ts";
import { parsePeriod, formatFinPeriod } from "./fin-series.ts";
import type { FinPoint, Fundamentals } from "./types.ts";

export type ValueCase = {
  label: "Bear" | "Base" | "Bull";
  growth: number;
  exitPe: number;
  years: number;
  value: number;
  vsPrice: number | null;
  note: string;
};

export type ReverseVal = {
  exitPe: number | null;
  impliedCagr: number | null;
  years: number;
  discount: number;
  body: string;
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
  reverse: ReverseVal;
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
 * Removed from the product. A fixed PEG of 1.5 is not market-implied growth.
 * Reverse valuation (reverseImpliedCagr) is the supported method.
 */
export function impliedGrowthFromPe(_pe: number | null | undefined): number | null {
  return null;
}

/** What 5-year EPS CAGR today's price requires at a stated exit multiple.
 *  Discount defaults to 0 — the primary figure is undiscounted algebra.
 *  Pass a discount only for an explicitly labelled scenario. */
export function reverseImpliedCagr(
  price: number | null | undefined,
  eps: number | null | undefined,
  exitPe: number | null | undefined,
  years = YEARS,
  discount = 0,
): number | null {
  const p = num(price);
  const e = num(eps);
  const m = num(exitPe);
  if (p == null || e == null || m == null || !(p > 0) || !(e > 0) || !(m > 0)) return null;
  const rhs = (p * Math.pow(1 + discount, years)) / (e * m);
  if (!(rhs > 0)) return null;
  const g = Math.pow(rhs, 1 / years) - 1;
  if (!Number.isFinite(g) || g < -0.9 || g > 4) return null;
  return g * 100;
}

function buildReverse(price: number | null, eps: number | null, industryPe: number | null): ReverseVal {
  const years = YEARS;
  const discount = 0;
  if (price == null || !(price > 0) || eps == null || !(eps > 0)) {
    return {
      exitPe: null,
      impliedCagr: null,
      years,
      discount,
      body: "Insufficient reliable data for reverse valuation — need last price and positive EPS.",
    };
  }
  if (industryPe == null || !(industryPe > 4) || industryPe > 80) {
    return {
      exitPe: null,
      impliedCagr: null,
      years,
      discount,
      body: "Insufficient reliable data for reverse valuation — no reported industry multiple to use as the exit.",
    };
  }
  const g = reverseImpliedCagr(price, eps, industryPe);
  if (g == null) {
    return {
      exitPe: industryPe,
      impliedCagr: null,
      years,
      discount,
      body: "The reverse sum did not resolve to a usable growth rate. No figure is printed.",
    };
  }
  return {
    exitPe: industryPe,
    impliedCagr: g,
    years,
    discount,
    body: `At the reported industry multiple of ${industryPe.toFixed(0)}× as a 5-year exit, with no discount rate applied, today's price requires about ${g.toFixed(0)}% annual EPS growth. That is a mathematical requirement under those inputs — not a forecast.`,
  };
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
  const impliedGrowth = null;
  const reverse = buildReverse(price, eps, industryPe);

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
    const exitNote = ind == null ? "16× is a modelling cap — industry P/E is missing, not assumed as fact." : "exit at the reported industry multiple, capped.";
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
      mk("Bear", bearG, bearPe, `Haircut the recorded profit CAGR by 6 pp, exit at ${bearPe.toFixed(0)}×. ${exitNote}`),
      mk("Base", baseG, basePe, `Keep the recorded profit CAGR, exit at ${basePe.toFixed(0)}×. ${exitNote}`),
      mk("Bull", bullG, bullPe, `Give growth +5 pp, exit at ${bullPe.toFixed(0)}×. The 12% discount is only this optional scenario — not the reverse-valuation figure.`),
    );
  }

  const read = interpret({ price, pe, industryPe, graham, grahamGap, peg, reverse, cases, growth });

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
    reverse,
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
  reverse: ReverseVal;
  cases: ValueCase[];
  growth: number | null;
}): string {
  if (v.pe == null && !v.cases.length) {
    return "Insufficient reliable data for a valuation model. Kosh does not invent a price.";
  }
  const bits: string[] = [];
  bits.push("These cases are a scenario tool, not intrinsic value.");
  if (v.pe != null && v.industryPe != null) {
    const gap = (v.pe / v.industryPe - 1) * 100;
    if (Math.abs(gap) < 10) bits.push(`P/E is in line with the reported industry (${v.pe.toFixed(0)} vs ${v.industryPe.toFixed(0)}).`);
    else if (gap > 0) bits.push(`P/E is ${gap.toFixed(0)}% above the reported industry multiple — the price is paying up, not a bargain print.`);
    else bits.push(`P/E is ${Math.abs(gap).toFixed(0)}% below the reported industry multiple. Cheap only if earnings quality holds.`);
  } else if (v.pe != null) {
    bits.push(`Trailing P/E is ${v.pe.toFixed(1)}. Industry P/E is unavailable, so this is not a relative call.`);
  }
  if (v.reverse.impliedCagr != null) bits.push(v.reverse.body);
  if (v.peg != null) {
    bits.push(v.peg <= 1.2 ? `PEG ${v.peg.toFixed(2)} is not stretched versus recorded profit growth.` : v.peg >= 3 ? `PEG ${v.peg.toFixed(2)} is expensive versus recorded profit growth.` : `PEG ${v.peg.toFixed(2)}.`);
  }
  const base = v.cases.find((c) => c.label === "Base");
  if (base && base.vsPrice != null) {
    bits.push(
      `Under the optional base case (recorded CAGR, 12% discount labelled as a model assumption — not a company fact, 5-year exit) the implied value is ${base.vsPrice >= 0 ? "+" : ""}${base.vsPrice.toFixed(0)}% versus last price. Change the growth or the exit multiple and the number moves — it is not a buy call.`,
    );
  } else if (v.growth == null) {
    bits.push("No 3Y/5Y profit CAGR on the company card, so the three cases stay blank.");
  }
  if (v.graham != null && v.grahamGap != null) {
    bits.push(
      `Traditional Graham check: last price is ${v.grahamGap >= 0 ? "+" : ""}${v.grahamGap.toFixed(0)}% versus ₹${v.graham.toFixed(0)}. A textbook filter, not a buy call.`,
    );
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

export type ValueWord = "Cheaper" | "About right" | "Expensive" | "Not enough data";

export type PePoint = {
  period: string;
  label: string;
  year: number;
  pat: number;
  eps: number | null;
  price: number | null;
  pe: number | null;
};

export type ValRow = { label: string; value: string };

export type ValModel = {
  id: "A+" | "C" | "D";
  title: string;
  word: ValueWord;
  figure: string;
  body: string;
  rows: ValRow[];
  note: string;
};

export type ValuationModelsPack = {
  models: ValModel[];
  simple: ValModel;
  hist: PePoint[];
  graham: number | null;
  grahamGap: number | null;
};

type CloseBar = { t: number; c: number };

function wordOf(current: number | null, fair: number | null, cheaperIfLower = true): ValueWord {
  if (current == null || !(current > 0) || fair == null || !(fair > 0)) return "Not enough data";
  const ratio = cheaperIfLower ? current / fair : fair / current;
  if (ratio <= 0.85) return "Cheaper";
  if (ratio >= 1.15) return "Expensive";
  return "About right";
}

function wordByGap(payingFor: number | null, delivered: number | null): ValueWord {
  if (payingFor == null || delivered == null || !Number.isFinite(payingFor) || !Number.isFinite(delivered)) {
    return "Not enough data";
  }
  const gap = payingFor - delivered;
  if (gap >= 5) return "Expensive";
  if (gap <= -5) return "Cheaper";
  return "About right";
}

/** Last session on or before the IST month-end, within ~45 days. */
export function yearEndClose(bars: CloseBar[], year: number, month = 3): number | null {
  if (!bars.length || !Number.isFinite(year)) return null;
  const lastDay = month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;
  const end = Date.parse(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59+05:30`) / 1000;
  if (!Number.isFinite(end)) return null;
  const start = end - 45 * 86400;
  let best: number | null = null;
  for (const b of bars) {
    const px = b.c;
    if (!(px > 0)) continue;
    if (b.t > start && b.t <= end) best = px;
  }
  return best;
}

/**
 * Reconstruct year-end P/E from yearly profit and the year-end price.
 * EPS_t ≈ current EPS × (PAT_t / PAT_now). Share count is assumed roughly stable.
 * This is not a filing P/E series.
 */
export function reconstructPeHistory(input: {
  profits: FinPoint[] | null | undefined;
  currentEps: number | null | undefined;
  bars: CloseBar[] | null | undefined;
}): PePoint[] {
  const epsNow = num(input.currentEps);
  const bars = input.bars || [];
  const yearly: { period: string; pat: number; y: number; m: number }[] = [];
  for (const p of input.profits || []) {
    if (!Number.isFinite(p.value) || p.value === 0) continue;
    const parsed = parsePeriod(p.period);
    if (!parsed) continue;
    const isYear = /^\d{4}$/.test(String(p.period).trim()) || parsed.m === 3 || /^FY/i.test(String(p.period));
    if (!isYear && parsed.m !== 3) continue;
    yearly.push({ period: p.period, pat: p.value, y: parsed.y, m: parsed.m || 3 });
  }
  yearly.sort((a, b) => a.y - b.y || a.m - b.m);
  const last = yearly.at(-1);
  if (!last || !(last.pat > 0)) return [];
  const out: PePoint[] = [];
  for (const y of yearly) {
    const eps = epsNow != null && last.pat > 0 ? epsNow * (y.pat / last.pat) : null;
    const price = yearEndClose(bars, y.y, y.m || 3);
    const pe = eps != null && eps > 0 && price != null && price > 0 ? price / eps : null;
    out.push({
      period: y.period,
      label: formatFinPeriod(y.period, "year"),
      year: y.y,
      pat: y.pat,
      eps: eps != null && Number.isFinite(eps) ? eps : null,
      price,
      pe: pe != null && Number.isFinite(pe) && pe > 0 && pe < 400 ? pe : null,
    });
  }
  return out;
}

/** Residual-income P/B. g is capped below both ROE and the 12% discount. */
export function justifiedPb(roePct: number | null | undefined, gPct: number | null | undefined, rPct = 12): number | null {
  const roe = num(roePct);
  const r = num(rPct);
  if (roe == null || r == null || !(r > 0)) return null;
  const roeU = roe / 100;
  const rU = r / 100;
  const cap = Math.min(roeU, rU) - 0.01;
  if (!(cap > 0)) return null;
  let gU = num(gPct) != null ? (gPct as number) / 100 : 0;
  gU = Math.min(Math.max(gU, -0.05), cap);
  if (!(rU > gU)) return null;
  const pb = (roeU - gU) / (rU - gU);
  if (!Number.isFinite(pb) || pb <= 0 || pb > 50) return null;
  return pb;
}

function modelA(input: {
  pe: number | null;
  industryPe: number | null;
  eps: number | null;
  hist: PePoint[];
}): ValModel {
  const word = wordOf(input.pe, input.industryPe, true);
  const rows: ValRow[] = [];
  if (input.pe != null) rows.push({ label: "P/E today", value: `${input.pe.toFixed(1)}×` });
  if (input.industryPe != null) rows.push({ label: "Industry P/E", value: `${input.industryPe.toFixed(1)}×` });
  if (input.eps != null && input.eps > 0) rows.push({ label: "EPS today", value: `₹${input.eps.toFixed(1)}` });

  const currentPe = input.pe;
  const higher = [...input.hist]
    .filter((p) => p.pe != null && (currentPe == null || p.pe > currentPe + 0.4))
    .sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
  const peak = [...input.hist].filter((p) => p.pe != null).sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
  const then = higher || (peak && currentPe != null && peak.pe != null && peak.pe > currentPe ? peak : null);

  if (then && then.pe != null) {
    rows.push({ label: `P/E ${then.label}`, value: `${then.pe.toFixed(1)}×` });
    if (then.eps != null) rows.push({ label: `EPS ${then.label}`, value: `₹${then.eps.toFixed(1)}` });
  }

  const bits: string[] = [];
  if (input.pe != null && input.industryPe != null) {
    const gap = (input.pe / input.industryPe - 1) * 100;
    if (Math.abs(gap) < 10) bits.push(`P/E is in line with the reported industry (${input.pe.toFixed(0)} vs ${input.industryPe.toFixed(0)}).`);
    else if (gap > 0) bits.push(`P/E is ${gap.toFixed(0)}% above the reported industry multiple.`);
    else bits.push(`P/E is ${Math.abs(gap).toFixed(0)}% below the reported industry multiple.`);
  } else {
    bits.push("Industry P/E is not on the card, so there is no relative call.");
  }
  if (then && then.pe != null && then.eps != null && input.eps != null) {
    const epsMove = input.eps - then.eps;
    bits.push(
      `When P/E was ${then.pe.toFixed(0)}× (${then.label}), EPS was ₹${then.eps.toFixed(1)}. Today EPS is ₹${input.eps.toFixed(1)}${epsMove > 0 ? " — earnings have grown since that richer multiple" : epsMove < 0 ? " — earnings are lower than at that richer multiple" : ""}.`,
    );
  } else if (input.hist.some((p) => p.pe != null)) {
    bits.push("No earlier reconstructed year had a higher P/E than today.");
  } else {
    bits.push("A reconstructed P/E history needs yearly profit and year-end prices. Share count is assumed roughly stable — this is not a filing P/E.");
  }

  const figure =
    input.pe != null && input.industryPe != null
      ? `${input.pe.toFixed(0)}× vs ${input.industryPe.toFixed(0)}× industry`
      : input.pe != null
        ? `${input.pe.toFixed(1)}× P/E`
        : "No P/E";

  return {
    id: "A+",
    title: "P/E vs industry, EPS then vs now",
    word,
    figure,
    body: bits.join(" "),
    rows,
    note: "Reconstructed P/E uses yearly profit and the year-end price. Share count is assumed roughly stable. Not a filing series and not a buy call.",
  };
}

function modelC(input: { price: number | null; eps: number | null; industryPe: number | null; delivered: number | null }): ValModel {
  const paying = reverseImpliedCagr(input.price, input.eps, input.industryPe);
  const word = wordByGap(paying, input.delivered);
  const rows: ValRow[] = [];
  if (paying != null) rows.push({ label: "Growth the price requires", value: `${paying.toFixed(0)}% a year` });
  if (input.delivered != null) rows.push({ label: "Growth delivered", value: `${input.delivered.toFixed(0)}% a year` });
  if (input.industryPe != null) rows.push({ label: "Exit multiple used", value: `${input.industryPe.toFixed(0)}× industry` });

  let body: string;
  if (paying == null) {
    body = "Need last price, positive EPS, and a reported industry multiple to say what growth the price is already paying for.";
  } else if (input.delivered == null) {
    body = `The price requires about ${paying.toFixed(0)}% annual earnings growth over 5 years if the exit is the industry multiple and no discount rate is applied. Delivered profit CAGR is not on the card, so there is nothing to compare it with.`;
  } else {
    body = `The price requires about ${paying.toFixed(0)}% annual earnings growth over 5 years if the exit is the industry multiple. No discount rate is applied. The company has delivered ${input.delivered.toFixed(0)}% profit CAGR. That comparison is a requirement, not a forecast.`;
  }

  return {
    id: "C",
    title: "Growth the price requires",
    word: paying == null ? "Not enough data" : input.delivered == null ? "Not enough data" : word,
    figure: paying != null && input.delivered != null ? `Requires ${paying.toFixed(0)}% · delivered ${input.delivered.toFixed(0)}%` : paying != null ? `Requires ${paying.toFixed(0)}%` : "No figure",
    body,
    rows,
    note: "5-year exit at the reported industry multiple. No discount rate. Not a forecast.",
  };
}

function modelD(input: { pb: number | null; roe: number | null; growth: number | null }): ValModel {
  if (input.growth == null) {
    return {
      id: "D",
      title: "Justified P/B from ROE",
      word: "Not enough data",
      figure: "No figure",
      body: "Profit CAGR is not on the card, so this model does not assume growth is 0%.",
      rows: [
        ...(input.roe != null ? [{ label: "ROE", value: `${input.roe.toFixed(1)}%` }] : []),
        { label: "Discount (r)", value: "12% (modelling assumption)" },
        { label: "Growth used (g)", value: "Unavailable" },
      ],
      note: "Missing growth is not treated as 0%. The 12% discount is a labelled assumption, not a company fact.",
    };
  }
  const g = input.growth;
  const just = justifiedPb(input.roe, g, 12);
  const word = wordOf(input.pb, just, true);
  const rows: ValRow[] = [];
  if (input.pb != null) rows.push({ label: "P/B today", value: `${input.pb.toFixed(2)}×` });
  if (just != null) rows.push({ label: "Justified P/B", value: `${just.toFixed(2)}×` });
  if (input.roe != null) rows.push({ label: "ROE", value: `${input.roe.toFixed(1)}%` });
  rows.push({ label: "Discount (r)", value: "12% (modelling assumption)" });
  rows.push({ label: "Growth used (g)", value: `${g.toFixed(0)}% from recorded profit CAGR` });

  let body: string;
  if (input.roe == null) {
    body = "Need ROE to justify a P/B. The card does not have it.";
  } else if (just == null) {
    body = "ROE is not high enough versus the 12% discount to justify a P/B on this model.";
  } else if (input.pb == null) {
    body = `Justified P/B is ${just.toFixed(2)}× from ROE ${(input.roe).toFixed(0)}% and g ${g.toFixed(0)}% from the recorded profit CAGR. Today's P/B is not on the card.`;
  } else {
    body = `Justified P/B is ${just.toFixed(2)}× from ROE ${input.roe.toFixed(0)}% (r = 12% is a modelling assumption, not a company fact). Today's P/B is ${input.pb.toFixed(2)}×. g is ${g.toFixed(0)}% from the recorded profit CAGR.`;
  }

  return {
    id: "D",
    title: "Justified P/B from ROE",
    word: just == null || input.pb == null ? "Not enough data" : word,
    figure: just != null && input.pb != null ? `${input.pb.toFixed(2)}× vs ${just.toFixed(2)}× justified` : just != null ? `${just.toFixed(2)}× justified` : "No figure",
    body,
    rows,
    note: "P/B = (ROE − g) / (r − g) with r = 12%. g is capped below ROE and r. Not a buy call.",
  };
}

export function buildValuationModels(input: {
  price?: number | null;
  fund?: Fundamentals | null;
  bars?: CloseBar[] | null;
}): ValuationModelsPack {
  const f = input.fund || null;
  const price = num(input.price);
  const eps = num(f?.eps);
  const pe = num(f?.pe) ?? (price != null && eps != null && eps > 0 ? price / eps : null);
  const industryPe = num(f?.industryPe);
  const pb = num(f?.pb);
  const roe = num(f?.roe);
  const delivered = num(f?.profitCagr5) ?? num(f?.profitCagr3);
  const hist = reconstructPeHistory({ profits: f?.profits, currentEps: eps, bars: input.bars });
  const a = modelA({ pe, industryPe, eps, hist });
  const c = modelC({ price, eps, industryPe, delivered });
  const d = modelD({ pb, roe, growth: delivered });
  const graham = grahamNumber(eps, f?.book);
  const grahamGap = graham != null && price != null && graham > 0 ? (price / graham - 1) * 100 : null;
  return { models: [a, c, d], simple: a, hist, graham, grahamGap };
}

export type EvidenceTone = "Supportive" | "Mixed" | "Limited" | "Insufficient";

export type EvidenceItem = { label: string; value: string | null };

function pctTxt(v: number | null | undefined, digits = 1): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  return `${v.toFixed(digits)}%`;
}

/** Separate growth evidence from any required-growth figure. Missing stays unavailable. */
export function growthEvidence(f: Fundamentals | null | undefined): {
  tone: EvidenceTone;
  body: string;
  items: EvidenceItem[];
} {
  const q = f?.qProfits || [];
  let quarter: string | null = null;
  if (q.length >= 2) {
    const prev = q[q.length - 2]?.value;
    const last = q[q.length - 1]?.value;
    if (prev != null && last != null && prev !== 0 && Number.isFinite(prev) && Number.isFinite(last)) {
      quarter = `${(((last - prev) / Math.abs(prev)) * 100).toFixed(1)}% latest quarter vs the one before`;
    }
  }
  const items: EvidenceItem[] = [
    { label: "Sales CAGR 3Y", value: pctTxt(f?.salesCagr3) },
    { label: "Sales CAGR 5Y", value: null },
    { label: "Profit CAGR 3Y", value: pctTxt(f?.profitCagr3) },
    { label: "Profit CAGR 5Y", value: pctTxt(f?.profitCagr5) },
    { label: "Sales 1Y", value: pctTxt(f?.salesYoY) },
    { label: "Profit 1Y", value: pctTxt(f?.profitYoY) },
    { label: "Latest quarter profit", value: quarter },
    { label: "OPM", value: pctTxt(f?.opm) },
    { label: "ROCE", value: pctTxt(f?.roce) },
    { label: "ROE", value: pctTxt(f?.roe) },
    { label: "CFO / PAT", value: f?.cfoPat != null && Number.isFinite(f.cfoPat) ? `${f.cfoPat.toFixed(2)}×` : null },
    { label: "Debt / equity", value: f?.de != null && Number.isFinite(f.de) ? f.de.toFixed(2) : null },
    { label: "Management guidance", value: null },
  ];
  const growth = [f?.salesCagr3, f?.profitCagr3, f?.profitCagr5, f?.salesYoY, f?.profitYoY].filter(
    (n): n is number => n != null && Number.isFinite(n),
  );
  const pos = growth.filter((n) => n > 0).length;
  const neg = growth.filter((n) => n < 0).length;
  const cashWeak = f?.cfoPat != null && f.cfoPat < 0.5;
  let tone: EvidenceTone = "Insufficient";
  if (growth.length < 2) tone = "Insufficient";
  else if ((pos > 0 && neg > 0) || (cashWeak && pos > 0)) tone = "Mixed";
  else if (pos === growth.length && growth.length >= 3) tone = "Supportive";
  else tone = "Limited";
  const body =
    tone === "Insufficient"
      ? "Fewer than two growth prints are on the card. Missing growth is not treated as 0%. This is not a forecast."
      : tone === "Supportive"
        ? "The growth prints on file point the same way. Evidence only — not a forecast and not the growth the price requires."
        : tone === "Mixed"
          ? "The prints on file do not agree, or cash conversion is weak beside the growth. Evidence only — not a forecast."
          : "Only a few growth prints are on file. Not enough to call the evidence supportive. Not a forecast.";
  return { tone, body, items };
}

