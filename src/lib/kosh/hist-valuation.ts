/** Year-end price next to that year's reported profit, plus a labelled valuation estimate.

Historical P/E is not a filing series. Past EPS is today's EPS scaled by profit,
and the share count is assumed roughly stable. See reconstructPeHistory.
*/

import { parsePeriod } from "./fin-series.ts";
import type { FinPoint, Fundamentals } from "./types.ts";
import { reconstructPeHistory, yearEndClose } from "./valuation.ts";

export type HistYear = {
  label: string;
  periodEnd: string;
  price: number | null;
  priceAsOf: string | null;
  profit: number | null;
  netWorth: number | null;
  sales: number | null;
  profitYoY: number | null;
  priceYoY: number | null;
  estEps: number | null;
  /** Calculated estimate. Null when the inputs are missing. Not a filing P/E. */
  estPe: number | null;
  estEarningsYield: number | null;
  estPb: number | null;
  estMcap: number | null;
  estPs: number | null;
};

export type HistValuation = {
  years: HistYear[];
  currentPe: number | null;
  currentPb: number | null;
  currentEarningsYield: number | null;
  industryPe: number | null;
  peAvg: number | null;
  peMedian: number | null;
  peLow: number | null;
  peHigh: number | null;
  pePercentile: number | null;
  profitCagr: number | null;
  priceCagr: number | null;
  read: string;
  method: string;
  missing: string[];
};

function num(v: number | null | undefined): number | null {
  return v != null && Number.isFinite(v) ? v : null;
}

function seconds(t: number): number {
  return t > 1e12 ? t / 1000 : t;
}

function endIso(period: string): string | null {
  const p = parsePeriod(period);
  if (!p) return null;
  const last = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  const m = p.m < 10 ? "0" + p.m : String(p.m);
  const d = last < 10 ? "0" + last : String(last);
  return `${p.y}-${m}-${d}`;
}

function labelOf(period: string): string {
  const p = parsePeriod(period);
  if (!p) return period;
  return `FY${String(p.y).slice(-2)}`;
}

function yoy(curr: number | null, prev: number | null): number | null {
  if (curr == null || prev == null || !(prev > 0)) return null;
  return (curr / prev - 1) * 100;
}

function cagr(first: number | null, last: number | null, years: number): number | null {
  if (first == null || last == null || !(first > 0) || !(last > 0) || years <= 0) return null;
  const g = Math.pow(last / first, 1 / years) - 1;
  return Number.isFinite(g) ? g * 100 : null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function matchValue(rows: FinPoint[], year: number, month: number): number | null {
  for (const row of rows) {
    const p = parsePeriod(row.period);
    if (p && p.y === year && (p.m === month || /^\d{4}$/.test(String(row.period).trim()))) {
      return num(row.value);
    }
  }
  return null;
}

function yearEndPrint(bars: { t: number; c: number }[], year: number, month: number): { price: number; asOf: string } | null {
  const price = yearEndClose(bars, year, month);
  if (price == null) return null;
  const lastDay = month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;
  const end = Date.parse(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59+05:30`) / 1000;
  const start = end - 45 * 86400;
  let best: { t: number; c: number } | null = null;
  for (const bar of bars) {
    if (!(bar.c > 0) || bar.t <= start || bar.t > end) continue;
    if (!best || bar.t >= best.t) best = bar;
  }
  const asOf = best ? new Date(best.t * 1000 + 5.5 * 3600000).toISOString().slice(0, 10) : "";
  return { price, asOf };
}

export function historicalValuation(input: {
  price: number | null;
  bars: { t: number; c: number }[];
  fund: Pick<Fundamentals, "pe" | "pb" | "eps" | "book" | "industryPe" | "profits" | "netWorth" | "sales" | "mcapCr"> | null;
  years: 1 | 3 | 5 | 10;
}): HistValuation {
  const missing: string[] = [];
  const pe = num(input.fund?.pe);
  const pb = num(input.fund?.pb);
  const industryPe = num(input.fund?.industryPe);
  const epsNow = num(input.fund?.eps);
  const bookNow = num(input.fund?.book);
  const mcapNow = num(input.fund?.mcapCr);
  const spot = num(input.price);
  const bars = [...(input.bars || [])]
    .map((bar) => ({ t: seconds(bar.t), c: bar.c }))
    .filter((bar) => bar.c > 0 && Number.isFinite(bar.t))
    .sort((a, b) => a.t - b.t);

  const profits = [...(input.fund?.profits || [])].filter((row) => num(row.value) != null);
  const worthRows = input.fund?.netWorth || [];
  const salesRows = input.fund?.sales || [];
  const points = profits
    .map((row) => {
      const parsed = parsePeriod(row.period);
      const periodEnd = parsed ? endIso(row.period) : null;
      return parsed && periodEnd ? { period: row.period, periodEnd, y: parsed.y, m: parsed.m, profit: num(row.value) } : null;
    })
    .filter((row): row is { period: string; periodEnd: string; y: number; m: number; profit: number | null } => Boolean(row))
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));

  const hist = reconstructPeHistory({ profits: input.fund?.profits, currentEps: epsNow, bars });
  const peByYear = new Map(hist.map((row) => [row.year, row]));
  const lastWorth = [...worthRows]
    .map((row) => ({ p: parsePeriod(row.period), value: num(row.value) }))
    .filter((row) => row.p && row.value != null && row.value > 0)
    .sort((a, b) => (a.p!.y - b.p!.y) || (a.p!.m - b.p!.m))
    .at(-1);
  const lastBar = bars.at(-1);
  const mcapOk = mcapNow != null && mcapNow > 0 && spot != null && spot > 0 && lastBar != null && Math.abs(lastBar.c / spot - 1) < 0.03;

  const built: HistYear[] = points.map((row, i) => {
    const print = yearEndPrint(bars, row.y, row.m || 3);
    const prev = i > 0 ? points[i - 1] : null;
    const prevPrint = prev ? yearEndPrint(bars, prev.y, prev.m || 3) : null;
    const est = peByYear.get(row.y);
    const estPe = est?.pe ?? null;
    const nw = matchValue(worthRows, row.y, row.m);
    const sales = matchValue(salesRows, row.y, row.m);
    let estPb: number | null = null;
    if (bookNow != null && bookNow > 0 && nw != null && nw > 0 && lastWorth?.value && print) {
      const bookThen = bookNow * (nw / lastWorth.value);
      if (bookThen > 0) {
        const ratio = print.price / bookThen;
        estPb = ratio > 0 && ratio < 80 ? ratio : null;
      }
    }
    const estMcap = mcapOk && print ? (mcapNow as number) * (print.price / (spot as number)) : null;
    const estPs = estMcap != null && sales != null && sales > 0 ? estMcap / sales : null;
    return {
      label: labelOf(row.period),
      periodEnd: row.periodEnd,
      price: print?.price ?? null,
      priceAsOf: print?.asOf || null,
      profit: row.profit,
      netWorth: nw,
      sales,
      profitYoY: yoy(row.profit, prev?.profit ?? null),
      priceYoY: yoy(print?.price ?? null, prevPrint?.price ?? null),
      estEps: est?.eps ?? null,
      estPe,
      estEarningsYield: estPe != null && estPe > 0 ? (1 / estPe) * 100 : null,
      estPb,
      estMcap,
      estPs,
    };
  });

  const window = input.years >= built.length ? built : built.slice(built.length - input.years);
  const pes = window.map((row) => row.estPe).filter((v): v is number => v != null && v > 0);
  const peAvg = pes.length ? pes.reduce((s, n) => s + n, 0) / pes.length : null;
  const peMedian = median(pes);
  const peLow = pes.length ? Math.min(...pes) : null;
  const peHigh = pes.length ? Math.max(...pes) : null;
  const pePercentile = pe != null && pe > 0 && pes.length >= 3 ? (pes.filter((v) => v <= pe).length / pes.length) * 100 : null;

  if (!points.length) missing.push("No annual profit series on the company card, so there is no year to value.");
  if (!bars.length) missing.push("No daily price history, so year-end prices and estimated multiples are blank.");
  if (epsNow == null || !(epsNow > 0)) missing.push("Today’s EPS is missing, so estimated historical P/E stays blank.");
  if (built.some((row) => row.profit != null && row.profit > 0 && row.estPe == null)) {
    missing.push("Some years have no estimated P/E: profit was not positive, or no price printed within 45 days of the period end.");
  }
  if (!window.some((row) => row.estPb != null)) {
    missing.push("Estimated historical P/B needs today’s book value and a positive net-worth series. It is blank when either is missing.");
  }
  if (!mcapOk) missing.push("Estimated market cap and P/S stay blank unless today’s market cap and the last price in this series agree.");
  missing.push("EV/EBITDA history is not shown. There is no dated enterprise value on the card.");
  missing.push("Estimated P/E is calculated, not a filing multiple. Past EPS is today’s EPS scaled by that year’s profit over the latest profit. Share count is assumed roughly stable.");

  const first = window.find((row) => row.profit != null && row.price != null);
  const last = [...window].reverse().find((row) => row.profit != null && row.price != null);
  const span = first && last ? Math.max(1, Number(last.periodEnd.slice(0, 4)) - Number(first.periodEnd.slice(0, 4))) : 0;
  const profitCagr = first && last && first !== last ? cagr(first.profit, last.profit, span) : null;
  const priceCagr = first && last && first !== last ? cagr(first.price, last.price, span) : null;
  const peStart = window.find((row) => row.estPe != null)?.estPe ?? null;
  const peEnd = [...window].reverse().find((row) => row.estPe != null)?.estPe ?? null;

  let read = "Not enough overlapping profit and price history to compare growth with valuation.";
  if (peStart != null && peEnd != null && peStart !== peEnd && profitCagr != null) {
    const richer = peEnd > peStart * 1.1;
    const cheaper = peEnd < peStart * 0.9;
    if (profitCagr < 0 && cheaper) read = "Estimated P/E is lower than at the start of this window while reported profit fell. A lower multiple beside weaker profit is not the same as a bargain.";
    else if (profitCagr > 0 && richer && priceCagr != null && priceCagr > profitCagr + 3) read = "Estimated P/E is higher than at the start of this window, and the share price outpaced reported profit. The multiple expanded; that is not a judgement that the premium is justified.";
    else if (profitCagr > 0 && cheaper) read = "Reported profit grew over this window while the estimated P/E is lower than at the start. That is a calculated comparison, not a filing history.";
    else if (profitCagr > 0 && !richer && !cheaper) read = "Reported profit grew and the estimated P/E finished close to where this window started.";
    else read = "Estimated P/E changed over this window. Read it next to the profit change in the table, not as a filing series.";
  } else if (profitCagr != null && priceCagr != null) {
    if (priceCagr > profitCagr + 3) read = "The share price rose faster than reported annual profit. Estimated P/E is incomplete for this window, so the multiple itself is not measured.";
    else if (profitCagr > priceCagr + 3) read = "Reported annual profit grew faster than the share price. Estimated P/E is incomplete for this window, so the multiple itself is not measured.";
    else read = "Reported annual profit and the share price grew at a similar pace. Estimated P/E is incomplete for this window.";
  }

  return {
    years: window,
    currentPe: pe != null && pe > 0 ? pe : null,
    currentPb: pb != null && pb > 0 ? pb : null,
    currentEarningsYield: pe != null && pe > 0 ? (1 / pe) * 100 : null,
    industryPe: industryPe != null && industryPe > 0 ? industryPe : null,
    peAvg,
    peMedian,
    peLow,
    peHigh,
    pePercentile,
    profitCagr,
    priceCagr,
    read,
    method: "Calculated estimate. Not a filing P/E. Share count is assumed roughly stable, so a split or a large issue makes the older years less reliable.",
    missing,
  };
}
