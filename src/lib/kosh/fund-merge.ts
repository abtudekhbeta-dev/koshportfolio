import type { FinPoint, Fundamentals, ShPoint } from "./types.ts";
import { parsePeriod } from "./fin-series.ts";
import { sortShareholding } from "./shareholding.ts";

function isBlankNum(v: number | null | undefined) {
  return v == null || !Number.isFinite(v);
}

function seriesKey(period: string) {
  const p = parsePeriod(period);
  return p ? String(p.t) : String(period || "").trim().toLowerCase();
}

function byPeriod(a: { period: string }, b: { period: string }) {
  const pa = parsePeriod(a.period);
  const pb = parsePeriod(b.period);
  if (pa && pb) return pa.t - pb.t;
  if (pa) return -1;
  if (pb) return 1;
  return String(a.period).localeCompare(String(b.period));
}

/** Union two series. The live (first) number wins on the same period; extra only fills blanks. */
export function mergeFinSeries(cur?: FinPoint[] | null, extra?: FinPoint[] | null): FinPoint[] {
  if (!extra?.length) return cur || [];
  if (!cur?.length) return extra.filter((p) => p?.period && Number.isFinite(p.value));
  const m = new Map<string, FinPoint>();
  for (const p of extra) {
    if (!p?.period || !Number.isFinite(p.value)) continue;
    m.set(seriesKey(p.period), { period: p.period, value: p.value });
  }
  for (const p of cur) {
    if (!p?.period || !Number.isFinite(p.value)) continue;
    m.set(seriesKey(p.period), { period: p.period, value: p.value });
  }
  return [...m.values()].sort(byPeriod);
}

export function mergeShareholding(cur?: ShPoint[] | null, extra?: ShPoint[] | null): ShPoint[] {
  if (!extra?.length) return cur || [];
  if (!cur?.length) return sortShareholding(extra.filter((p) => p?.period));
  const m = new Map<string, ShPoint>();
  for (const p of extra) {
    if (!p?.period) continue;
    m.set(seriesKey(p.period), { ...p });
  }
  for (const p of cur) {
    if (!p?.period) continue;
    const k = seriesKey(p.period);
    const had = m.get(k);
    if (!had) {
      m.set(k, { ...p });
      continue;
    }
    m.set(k, {
      period: p.period || had.period,
      promoters: p.promoters ?? had.promoters,
      fii: p.fii ?? had.fii,
      dii: p.dii ?? had.dii,
    });
  }
  return sortShareholding([...m.values()]);
}

function laterPeriod(a?: string | null, b?: string | null) {
  const pa = a ? parsePeriod(a) : null;
  const pb = b ? parsePeriod(b) : null;
  if (!pa && !pb) return a || b || null;
  if (!pa) return b || null;
  if (!pb) return a || null;
  return pb.t >= pa.t ? b || a : a || b;
}

/** Fill blanks on the company card. Never overwrite a number that is already on file. */
export function fillFundamentals(base: Fundamentals, extra: Partial<Fundamentals>): Fundamentals {
  const out: Fundamentals = { ...base };
  const takeNum = <K extends keyof Fundamentals>(k: K, v: Fundamentals[K] | undefined) => {
    if (typeof v === "number" && Number.isFinite(v) && isBlankNum(out[k] as number)) {
      (out as Record<string, unknown>)[k as string] = v;
    }
  };
  const takeStr = <K extends keyof Fundamentals>(k: K, v: Fundamentals[K] | undefined) => {
    if (typeof v === "string" && v && !out[k]) (out as Record<string, unknown>)[k as string] = v;
  };
  takeNum("mcapCr", extra.mcapCr as number | undefined);
  takeNum("pe", extra.pe as number | undefined);
  takeNum("pb", extra.pb as number | undefined);
  takeNum("roe", extra.roe as number | undefined);
  takeNum("de", extra.de as number | undefined);
  takeNum("divYield", extra.divYield as number | undefined);
  takeNum("eps", extra.eps as number | undefined);
  takeNum("book", extra.book as number | undefined);
  takeNum("face", extra.face as number | undefined);
  takeNum("industryPe", extra.industryPe as number | undefined);
  takeNum("salesYoY", extra.salesYoY as number | undefined);
  takeNum("profitYoY", extra.profitYoY as number | undefined);
  takeNum("promoters", extra.promoters as number | undefined);
  takeNum("fii", extra.fii as number | undefined);
  takeNum("dii", extra.dii as number | undefined);
  takeNum("roce", extra.roce as number | undefined);
  takeNum("peg", extra.peg as number | undefined);
  takeNum("forwardPe", extra.forwardPe as number | undefined);
  takeNum("forwardEps", extra.forwardEps as number | undefined);
  takeNum("forwardPeg", extra.forwardPeg as number | undefined);
  takeNum("opm", extra.opm as number | undefined);
  takeNum("interestCover", extra.interestCover as number | undefined);
  takeNum("pledge", extra.pledge as number | undefined);
  takeNum("cfoPat", extra.cfoPat as number | undefined);
  takeNum("salesCagr3", extra.salesCagr3 as number | undefined);
  takeNum("profitCagr3", extra.profitCagr3 as number | undefined);
  takeNum("profitCagr5", extra.profitCagr5 as number | undefined);
  takeStr("industry", extra.industry as string | undefined);
  takeStr("ceo", extra.ceo as string | undefined);
  takeStr("founded", extra.founded as string | undefined);
  takeStr("summary", extra.summary as string | undefined);
  const fin = laterPeriod(out.finPeriod, extra.finPeriod);
  if (fin) out.finPeriod = fin;
  const sh = laterPeriod(out.shPeriod, extra.shPeriod);
  if (sh) out.shPeriod = sh;
  out.sales = mergeFinSeries(out.sales, extra.sales);
  out.profits = mergeFinSeries(out.profits, extra.profits);
  out.qSales = mergeFinSeries(out.qSales, extra.qSales);
  out.qProfits = mergeFinSeries(out.qProfits, extra.qProfits);
  out.netWorth = mergeFinSeries(out.netWorth, extra.netWorth);
  out.qNetWorth = mergeFinSeries(out.qNetWorth, extra.qNetWorth);
  out.ebitda = mergeFinSeries(out.ebitda, extra.ebitda);
  out.cfo = mergeFinSeries(out.cfo, extra.cfo);
  out.qCfo = mergeFinSeries(out.qCfo, extra.qCfo);
  out.shareholding = mergeShareholding(out.shareholding, extra.shareholding);
  return out;
}
