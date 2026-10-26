/**
 * Kosh RRG-inspired methodology. Not the proprietary JdK RS-Ratio.
 * Daily closes are canonical. No missing close is filled.
 *
 * RS_t = 100 * instrument_t / benchmark_t
 * RSRatio_t = 100 * WMA(RS, fast)_t / WMA(RS, slow)_t
 * RSMomentum_t = 100 * RSRatio_t / RSRatio_(t − momentum)_t
 *
 * WMA is a linear weighted average. The newest close has weight `length`.
 * A window shorter than `length` is null. A value within 1e-8 of 100 is the boundary, not a quadrant.
 */

export const RRG_FORMULA = "kosh-rrg-inspired-wma-v1";

export const RRG_PARAMS = { fast: 10, slow: 30, momentum: 10 } as const;

export type RrgParams = { fast: number; slow: number; momentum: number };

export type ClosePrint = { date: string; close: number };

export type Quadrant = "leading" | "weakening" | "lagging" | "improving" | "boundary";

export type RrgPoint = {
  date: string;
  instrument: number;
  benchmark: number;
  rs: number;
  rsRatio: number | null;
  rsMomentum: number | null;
  quadrant: Quadrant | null;
};

const BOUNDARY = 1e-8;

export function wma(values: number[], end: number, length: number): number | null {
  if (length < 1 || end < length - 1 || end >= values.length) return null;
  let weighted = 0;
  let weight = 0;
  for (let i = 0; i < length; i++) {
    const w = length - i;
    const value = values[end - i];
    if (!Number.isFinite(value)) return null;
    weighted += value * w;
    weight += w;
  }
  return weight > 0 ? weighted / weight : null;
}

export function quadrantOf(ratio: number | null, momentum: number | null): Quadrant | null {
  if (ratio == null || momentum == null || !Number.isFinite(ratio) || !Number.isFinite(momentum)) return null;
  if (Math.abs(ratio - 100) <= BOUNDARY || Math.abs(momentum - 100) <= BOUNDARY) return "boundary";
  if (ratio > 100 && momentum > 100) return "leading";
  if (ratio > 100 && momentum < 100) return "weakening";
  if (ratio < 100 && momentum > 100) return "improving";
  return "lagging";
}

export type AlignResult = {
  rows: { date: string; instrument: number; benchmark: number }[];
  instrumentOnly: string[];
  benchmarkOnly: string[];
  rejected: { date: string; reason: string }[];
};

/** Common dates only. Duplicate dates and invalid closes are rejected, never averaged or filled. */
export function alignCloses(instrument: ClosePrint[], benchmark: ClosePrint[]): AlignResult {
  const clean = (rows: ClosePrint[], side: string) => {
    const map = new Map<string, number>();
    const rejected: { date: string; reason: string }[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
        rejected.push({ date: String(row?.date ?? ""), reason: `${side} date is not YYYY-MM-DD` });
        continue;
      }
      if (seen.has(row.date)) {
        rejected.push({ date: row.date, reason: `${side} duplicate date` });
        map.delete(row.date);
        continue;
      }
      seen.add(row.date);
      if (!Number.isFinite(row.close) || row.close <= 0) {
        rejected.push({ date: row.date, reason: `${side} close is missing, zero, or negative` });
        continue;
      }
      map.set(row.date, row.close);
    }
    return { map, rejected };
  };
  const left = clean(instrument, "instrument");
  const right = clean(benchmark, "benchmark");
  const rows: AlignResult["rows"] = [];
  const instrumentOnly: string[] = [];
  for (const [date, close] of left.map) {
    const other = right.map.get(date);
    if (other == null) instrumentOnly.push(date);
    else rows.push({ date, instrument: close, benchmark: other });
  }
  const benchmarkOnly = [...right.map.keys()].filter((date) => !left.map.has(date));
  rows.sort((a, b) => a.date.localeCompare(b.date));
  instrumentOnly.sort();
  benchmarkOnly.sort();
  return { rows, instrumentOnly, benchmarkOnly, rejected: [...left.rejected, ...right.rejected] };
}

export function computeRrgPairs(
  rows: { date: string; instrument: number; benchmark: number }[],
  params: RrgParams = RRG_PARAMS,
): RrgPoint[] {
  const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const rs = ordered.map((row) => (100 * row.instrument) / row.benchmark);
  const ratios = rs.map((_, index) => {
    const fast = wma(rs, index, params.fast);
    const slow = wma(rs, index, params.slow);
    if (fast == null || slow == null || slow === 0) return null;
    return (100 * fast) / slow;
  });
  return ordered.map((row, index) => {
    const prev = index - params.momentum;
    const ratio = ratios[index] ?? null;
    const base = prev >= 0 ? ratios[prev] : null;
    const momentum = ratio == null || base == null || base === 0 ? null : (100 * ratio) / base;
    return {
      date: row.date,
      instrument: row.instrument,
      benchmark: row.benchmark,
      rs: rs[index] ?? 0,
      rsRatio: ratio,
      rsMomentum: momentum,
      quadrant: quadrantOf(ratio, momentum),
    };
  });
}

export function computeRrg(instrument: ClosePrint[], benchmark: ClosePrint[], params: RrgParams = RRG_PARAMS, asOf?: string): { points: RrgPoint[]; alignment: AlignResult } {
  const cut = asOf ? instrument.filter((row) => row.date <= asOf) : instrument;
  const bench = asOf ? benchmark.filter((row) => row.date <= asOf) : benchmark;
  const alignment = alignCloses(cut, bench);
  return { points: computeRrgPairs(alignment.rows, params), alignment };
}

export type SeriesQuality = {
  from: string | null;
  to: string | null;
  rows: number;
  duplicateDates: string[];
  unsorted: boolean;
  invalidCloses: number;
  jumps: { date: string; change: number }[];
  weekdayGaps: string[];
  holidayGaps: string[];
  spanYears: number;
  limitedHistory: boolean;
  adjustment: "raw-unadjusted" | "price-return-split-bonus";
};

function addDays(iso: string, days: number) {
  const date = new Date(iso + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isWeekend(iso: string) {
  const day = new Date(iso + "T00:00:00Z").getUTCDay();
  return day === 0 || day === 6;
}

/** Weekday gaps are missing sessions unless the caller lists them as exchange holidays. Weekends are neither. */
export function assessSeries(rows: ClosePrint[], holidays: string[] = [], jump = 0.25): SeriesQuality {
  const dates = rows.map((row) => row.date);
  const unsorted = dates.some((date, index) => index > 0 && date < dates[index - 1]);
  const ordered = rows.slice().sort((a, b) => a.date.localeCompare(b.date));
  const duplicateDates: string[] = [];
  const seen = new Set<string>();
  let invalidCloses = 0;
  const jumps: { date: string; change: number }[] = [];
  let previous: number | null = null;
  for (const row of ordered) {
    if (seen.has(row.date)) duplicateDates.push(row.date);
    seen.add(row.date);
    if (!Number.isFinite(row.close) || row.close <= 0) {
      invalidCloses += 1;
      previous = null;
      continue;
    }
    if (previous != null) {
      const change = row.close / previous - 1;
      if (Math.abs(change) > jump) jumps.push({ date: row.date, change });
    }
    previous = row.close;
  }
  const unique = [...seen].filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  const holidaySet = new Set(holidays);
  const weekdayGaps: string[] = [];
  const holidayGaps: string[] = [];
  for (let i = 1; i < unique.length; i++) {
    let cursor = addDays(unique[i - 1], 1);
    while (cursor < unique[i]) {
      if (!isWeekend(cursor)) {
        if (holidaySet.has(cursor)) holidayGaps.push(cursor);
        else weekdayGaps.push(cursor);
      }
      cursor = addDays(cursor, 1);
    }
  }
  const from = unique[0] || null;
  const to = unique[unique.length - 1] || null;
  const spanYears = from && to ? (Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / (365.25 * 86400000) : 0;
  return {
    from,
    to,
    rows: rows.length,
    duplicateDates,
    unsorted,
    invalidCloses,
    jumps,
    weekdayGaps,
    holidayGaps,
    spanYears,
    limitedHistory: spanYears < 5 || unique.length < 1200,
    adjustment: "raw-unadjusted",
  };
}
