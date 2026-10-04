import { istDay } from "./engine.ts";
import type { Bar } from "./types.ts";

/** Bump when the return definition changes so caches can drop stale matrices. */
export const SEASON_VERSION = 1;

export type SeasonKind = "monthly" | "quarterly";
export type Lookback = 2 | 3 | 5 | 10;
export type PeriodStatus = "calculated" | "missing" | "partial";

export type DayClose = { day: string; adj: number; raw: number; o?: number | null; h?: number | null; l?: number | null; v?: number | null };

export type PeriodCell = {
  year: number;
  period: number;
  /** Percent. Null unless status is calculated. */
  ret: number | null;
  endDay: string | null;
  prevDay: string | null;
  status: PeriodStatus;
};

export type SeasonBucket = {
  period: number;
  label: string;
  avg: number | null;
  median: number | null;
  positivePct: number | null;
  observations: number;
  benchAvg: number | null;
};

export type SeasonView = {
  version: number;
  kind: SeasonKind;
  lookback: Lookback;
  windowStart: number;
  windowEnd: number;
  includeCurrent: boolean;
  firstDay: string | null;
  lastDay: string | null;
  yearsAvailable: number;
  expected: number;
  observed: number;
  coveragePct: number | null;
  limited: boolean;
  note: string;
  buckets: SeasonBucket[];
};

export function canonSymbol(symbol: string) {
  return String(symbol || "")
    .trim()
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

export type WeightInput = { symbol: string; name?: string; weight: number };

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];

export function dayCloses(bars: Bar[] | undefined): DayClose[] {
  const m = new Map<string, DayClose>();
  for (const b of bars || []) {
    if (!(b?.t > 0) || !(b.c > 0)) continue;
    const day = /^\d{4}-\d{2}-\d{2}$/.test(String((b as Bar & { day?: string }).day || ""))
      ? String((b as Bar & { day?: string }).day)
      : istDay(b.t);
    const raw = b.raw && b.raw > 0 ? b.raw : b.c;
    const pos = (n: number | undefined) => (n != null && Number.isFinite(n) && n > 0 ? n : null);
    m.set(day, {
      day,
      adj: b.c,
      raw,
      o: pos(b.o),
      h: pos(b.h),
      l: pos(b.l),
      v: b.v != null && Number.isFinite(b.v) && b.v >= 0 ? b.v : null,
    });
  }
  return [...m.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function periodOf(kind: SeasonKind, day: string): { year: number; period: number } {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  if (kind === "monthly") return { year, period: month };
  return { year, period: Math.floor((month - 1) / 3) + 1 };
}

function shift(kind: SeasonKind, year: number, period: number, delta: number) {
  if (kind === "monthly") {
    const i = year * 12 + (period - 1) + delta;
    return { year: Math.floor(i / 12), period: (i % 12) + 1 };
  }
  const i = year * 4 + (period - 1) + delta;
  return { year: Math.floor(i / 4), period: (i % 4) + 1 };
}

function keyOf(year: number, period: number) {
  return `${year}-${period}`;
}

function inProgress(kind: SeasonKind, year: number, period: number, asOfDay: string) {
  const asOf = periodOf(kind, asOfDay);
  if (year < asOf.year) return false;
  if (year > asOf.year) return true;
  return period >= asOf.period;
}

/** Month-end and quarter-end returns from adjusted closes. Gaps stay missing. Partial periods are not a return. */
export function periodCells(days: DayClose[], kind: SeasonKind, asOfDay: string): PeriodCell[] {
  if (!days.length || !/^\d{4}-\d{2}-\d{2}$/.test(asOfDay)) return [];
  const ends = new Map<string, DayClose>();
  for (const d of days) {
    if (d.day > asOfDay) continue;
    const p = periodOf(kind, d.day);
    ends.set(keyOf(p.year, p.period), d);
  }
  if (!ends.size) return [];
  const first = periodOf(kind, days[0].day);
  const present = [...ends.keys()].map((k) => {
    const [year, period] = k.split("-").map(Number);
    return { year, period };
  });
  present.sort((a, b) => a.year - b.year || a.period - b.period);
  const last = present[present.length - 1];
  const cells: PeriodCell[] = [];
  let cursor = shift(kind, first.year, first.period, 1);
  const guard = kind === "monthly" ? 12 * 80 : 4 * 80;
  for (let n = 0; n < guard; n++) {
    if (cursor.year > last.year || (cursor.year === last.year && cursor.period > last.period)) break;
    const cur = ends.get(keyOf(cursor.year, cursor.period));
    const prevP = shift(kind, cursor.year, cursor.period, -1);
    const prev = ends.get(keyOf(prevP.year, prevP.period));
    const partial = inProgress(kind, cursor.year, cursor.period, asOfDay);
    if (!cur || !prev || !(cur.adj > 0) || !(prev.adj > 0)) {
      cells.push({
        year: cursor.year,
        period: cursor.period,
        ret: null,
        endDay: cur?.day || null,
        prevDay: prev?.day || null,
        status: partial ? "partial" : "missing",
      });
    } else if (partial) {
      cells.push({
        year: cursor.year,
        period: cursor.period,
        ret: null,
        endDay: cur.day,
        prevDay: prev.day,
        status: "partial",
      });
    } else {
      cells.push({
        year: cursor.year,
        period: cursor.period,
        ret: (cur.adj / prev.adj - 1) * 100,
        endDay: cur.day,
        prevDay: prev.day,
        status: "calculated",
      });
    }
    cursor = shift(kind, cursor.year, cursor.period, 1);
  }
  return cells;
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function average(xs: number[]): number | null {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function label(kind: SeasonKind, period: number) {
  return kind === "monthly" ? MONTH_LABELS[period - 1] || String(period) : QUARTER_LABELS[period - 1] || `Q${period}`;
}

export function windowBounds(cells: PeriodCell[], lookback: Lookback, asOfDay: string, includeCurrent: boolean) {
  const asOfYear = Number(asOfDay.slice(0, 4));
  const calculated = cells.filter((c) => c.status === "calculated");
  const years = [...new Set(calculated.map((c) => c.year))].sort((a, b) => a - b);
  const cap = includeCurrent ? asOfYear : asOfYear - 1;
  const maxEnd = years.filter((y) => y <= cap).at(-1) ?? cap;
  const first = years[0] ?? maxEnd;
  const minEnd = Math.min(maxEnd, first + lookback - 1);
  return { minEnd, maxEnd, defaultEnd: maxEnd, firstYear: first };
}

export function seasonView(
  cells: PeriodCell[],
  opts: {
    kind: SeasonKind;
    lookback: Lookback;
    windowEnd: number;
    includeCurrent: boolean;
    asOfDay: string;
    firstDay: string | null;
    lastDay: string | null;
    bench?: PeriodCell[];
  },
): SeasonView {
  const { kind, lookback } = opts;
  const bounds = windowBounds(cells, lookback, opts.asOfDay, opts.includeCurrent);
  const windowEnd = Math.min(bounds.maxEnd, Math.max(bounds.minEnd, opts.windowEnd));
  const windowStart = windowEnd - lookback + 1;
  const asOfYear = Number(opts.asOfDay.slice(0, 4));
  const inWindow = (c: PeriodCell) => {
    if (c.year < windowStart || c.year > windowEnd) return false;
    if (!opts.includeCurrent && c.year >= asOfYear) return false;
    return true;
  };
  const relevant = cells.filter(inWindow);
  const expected = relevant.filter((c) => c.status !== "partial").length;
  const observed = relevant.filter((c) => c.status === "calculated").length;
  const periods = kind === "monthly" ? 12 : 4;
  const bench = opts.bench || [];
  const buckets: SeasonBucket[] = [];
  for (let period = 1; period <= periods; period++) {
    const xs = relevant.filter((c) => c.period === period && c.status === "calculated" && c.ret != null).map((c) => c.ret as number);
    const bx = bench
      .filter((c) => inWindow(c) && c.period === period && c.status === "calculated" && c.ret != null)
      .map((c) => c.ret as number);
    const pos = xs.filter((x) => x > 0).length;
    buckets.push({
      period,
      label: label(kind, period),
      avg: average(xs),
      median: median(xs),
      positivePct: xs.length ? (pos / xs.length) * 100 : null,
      observations: xs.length,
      benchAvg: average(bx),
    });
  }
  const yearsAvailable = opts.firstDay ? Math.max(0, bounds.maxEnd - Number(opts.firstDay.slice(0, 4)) + 1) : 0;
  const limited = Boolean(opts.firstDay) && yearsAvailable < lookback;
  let note = "Seasonality reflects historical tendencies and is not a forecast or guarantee of future returns.";
  if (!cells.length) {
    note = "No historical series is available for this symbol. Nothing was estimated.";
  } else if (limited && opts.firstDay) {
    note = `${lookback}Y selected — ${yearsAvailable} year${yearsAvailable === 1 ? "" : "s"} of historical data available since ${opts.firstDay}. Earlier years were not invented.`;
  } else if (!opts.includeCurrent) {
    note = `Completed years only, through ${windowEnd}. The current year is left out so a partial year does not tilt the averages.`;
  } else {
    note = `Current year included through the last completed ${kind === "monthly" ? "month" : "quarter"}. The period still in progress is not an observation.`;
  }
  return {
    version: SEASON_VERSION,
    kind,
    lookback,
    windowStart,
    windowEnd,
    includeCurrent: opts.includeCurrent,
    firstDay: opts.firstDay,
    lastDay: opts.lastDay,
    yearsAvailable,
    expected,
    observed,
    coveragePct: expected > 0 ? (observed / expected) * 100 : null,
    limited,
    note,
    buckets,
  };
}

export type PortfolioSeason = SeasonView & {
  weightTotal: number;
  unallocated: number;
  normalized: boolean;
  namesWithHistory: number;
  names: number;
  method: string;
};

/**
 * Current weights applied to each name's own history.
 * A missing return is left out of that period. It is not zero and it is not cash.
 * Weights are not scaled to 100% unless `normalize` is set.
 */
export function portfolioSeason(
  series: { symbol: string; cells: PeriodCell[]; firstDay: string | null; lastDay: string | null }[],
  weights: WeightInput[],
  opts: {
    kind: SeasonKind;
    lookback: Lookback;
    windowEnd: number;
    includeCurrent: boolean;
    asOfDay: string;
    normalize?: boolean;
    bench?: PeriodCell[];
  },
): PortfolioSeason {
  const wmap = new Map(weights.map((w) => [canonSymbol(w.symbol), w.weight]));
  const stated = [...wmap.values()].reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const scale = opts.normalize && stated > 0 ? 100 / stated : 1;
  const byKey = new Map<string, { num: number; den: number }>();
  let namesWithHistory = 0;
  for (const s of series) {
    const sym = canonSymbol(s.symbol);
    const w = (wmap.get(sym) || 0) * scale;
    const has = s.cells.some((c) => c.status === "calculated");
    if (has) namesWithHistory += 1;
    if (!(w > 0)) continue;
    for (const c of s.cells) {
      if (c.status !== "calculated" || c.ret == null) continue;
      const k = `${c.year}-${c.period}`;
      const cur = byKey.get(k) || { num: 0, den: 0 };
      cur.num += w * c.ret;
      cur.den += w;
      byKey.set(k, cur);
    }
  }
  const cells: PeriodCell[] = [];
  for (const [k, v] of byKey) {
    const [year, period] = k.split("-").map(Number);
    if (!(v.den > 0)) continue;
    cells.push({ year, period, ret: v.num / v.den, endDay: null, prevDay: null, status: "calculated" });
  }
  const firsts = series.map((s) => s.firstDay).filter(Boolean).sort() as string[];
  const lasts = series.map((s) => s.lastDay).filter(Boolean).sort() as string[];
  const view = seasonView(cells, {
    ...opts,
    firstDay: firsts[0] || null,
    lastDay: lasts.at(-1) || null,
    bench: opts.bench,
  });
  const weightTotal = stated;
  const unallocated = Math.max(0, 100 - stated);
  const method = opts.normalize
    ? "Weights normalized to 100% for analysis. Each period uses only holdings that have a return that period. Missing history is not a zero return."
    : "Each period uses only holdings that have a return that period, at their current weights. Missing history is not a zero return and is not treated as cash.";
  let note = view.note;
  if (Math.abs(stated - 100) > 0.5 && !opts.normalize) {
    note = `Portfolio weights total ${stated.toFixed(1)}%. ${unallocated.toFixed(1)}% is currently unallocated. ${note}`;
  }
  if (series.length) {
    note = `${namesWithHistory}/${series.length} holdings have a historical return in the stored series. ${note}`;
  }
  return {
    ...view,
    note,
    weightTotal,
    unallocated,
    normalized: Boolean(opts.normalize),
    namesWithHistory,
    names: series.length,
    method,
  };
}

/** Specific completed months that are missing a close. Partial periods are not targets. */
export function recoveryTargets(
  series: { symbol: string; monthly: PeriodCell[] }[],
  windowStart: number,
  windowEnd: number,
  limit = 6,
): { symbol: string; year: number; month: number }[] {
  const out: { symbol: string; year: number; month: number }[] = [];
  for (const s of series) {
    if (out.length >= limit) break;
    if (!s.symbol) continue;
    for (const c of s.monthly) {
      if (out.length >= limit) break;
      if (c.status !== "missing" || c.period < 1 || c.period > 12) continue;
      if (c.year < windowStart || c.year > windowEnd) continue;
      out.push({ symbol: canonSymbol(s.symbol), year: c.year, month: c.period });
    }
  }
  return out;
}

/** Ask for one documented close. The caller still has to pass acceptSourcedClose. */
export function seasonCloseAsk(symbol: string, year: number, month: number) {
  const label = MONTH_LABELS[month - 1] || String(month);
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  return `official exchange closing price of ${symbol} on the last trading session of ${label} ${year}. Cite exactly one date written as YYYY-MM-DD inside ${ym}, and the closing price, only if a primary source states both. Do not estimate, interpolate, or predict.`;
}

const ESTIMATE = /\b(estimat\w*|interpolat\w*|predict\w*|guess\w*|approx\w*)\b/i;

/** A sourced close for one calendar month. Rejects estimates and dates outside that month. */
export function acceptSourcedClose(input: {
  sourceUrl?: string | null;
  sourceName?: string | null;
  evidence?: string | null;
  methodology?: string | null;
  value?: number | null;
  year: number;
  month: number;
}): { day: string; price: number } | null {
  const url = String(input.sourceUrl || "");
  if (!/^https?:\/\//i.test(url)) return null;
  if (!String(input.sourceName || "").trim()) return null;
  const evidence = String(input.evidence || "").trim();
  if (evidence.length < 8) return null;
  const blob = `${input.methodology || ""} ${evidence}`;
  if (ESTIMATE.test(blob)) return null;
  const value = Number(input.value);
  if (!(value > 0) || !Number.isFinite(value)) return null;
  const ym = `${input.year}-${String(input.month).padStart(2, "0")}`;
  const dates = blob.match(/\d{4}-\d{2}-\d{2}/g) || [];
  const inMonth = dates.filter((d) => d.startsWith(ym));
  if (inMonth.length !== 1) return null;
  return { day: inMonth[0], price: value };
}

export type PriceObs = {
  value: number;
  source: string;
  sourcePriority: number;
  sourceType: string;
};

/** Lower sourcePriority wins. A disagreement is recorded; the weaker source does not overwrite. */
export function choosePrice(existing: PriceObs | null, incoming: PriceObs): { keep: PriceObs; conflict: boolean } {
  if (!existing) return { keep: incoming, conflict: false };
  const base = existing.value > 0 ? existing.value : incoming.value;
  const differ = base > 0 && Math.abs(existing.value - incoming.value) / base > 0.005;
  if (!differ) {
    return {
      keep: incoming.sourcePriority <= existing.sourcePriority ? incoming : existing,
      conflict: false,
    };
  }
  if (incoming.sourcePriority < existing.sourcePriority) return { keep: incoming, conflict: true };
  if (incoming.sourcePriority === existing.sourcePriority && incoming.source === existing.source) {
    return { keep: incoming, conflict: true };
  }
  return { keep: existing, conflict: true };
}
