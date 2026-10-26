import { RRG_FORMULA, RRG_PARAMS, computeRrgPairs, type ClosePrint, type Quadrant, type RrgPoint } from "./rrg.ts";

export type Timeframe = "daily" | "weekly" | "monthly";

export const RETURN_WINDOW: Record<Timeframe, number> = { daily: 63, weekly: 13, monthly: 6 };

const QUADRANT_LABEL: Record<Quadrant, string> = {
  leading: "Leading",
  weakening: "Weakening",
  lagging: "Lagging",
  improving: "Improving",
  boundary: "On the 100 boundary",
};

export function quadrantLabel(value: Quadrant | null) {
  return value ? QUADRANT_LABEL[value] : "Not enough history";
}

export type UnresolvedBreak = { date: string; change: number; reason: string };

/** A move this large is not treated as an ordinary session. It withholds the average that contains it. */
export const UNRESOLVED_BREAK = 0.4;

export function breakInside(breaks: UnresolvedBreak[] | undefined, from: string | null, to: string | null) {
  if (!from || !to) return null;
  return (breaks || []).find((item) => item.date >= from && item.date <= to && Math.abs(item.change) >= UNRESOLVED_BREAK) || null;
}

/** Last daily close in each ISO week or calendar month. Weeks and months are not filled. */
export function aggregateCloses(rows: ClosePrint[], timeframe: Timeframe): { period: string; date: string; close: number }[] {
  const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  if (timeframe === "daily") return ordered.map((row) => ({ period: row.date, date: row.date, close: row.close }));
  const buckets = new Map<string, { period: string; date: string; close: number }>();
  for (const row of ordered) {
    const period = timeframe === "weekly" ? isoWeek(row.date) : row.date.slice(0, 7);
    buckets.set(period, { period, date: row.date, close: row.close });
  }
  return [...buckets.values()];
}

export function isoWeek(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export type PairedBar = { date: string; period: string; instrument: number; benchmark: number; benchmarkDate: string };

/**
 * Cut both series at as-of, aggregate each one, then join on the period.
 * A period with only one side is dropped. No close is invented.
 * The point date is the instrument's last session in the period.
 */
export function pairTimeframe(instrument: ClosePrint[], benchmark: ClosePrint[], timeframe: Timeframe, asOf?: string): { pairs: PairedBar[]; instrumentOnly: string[]; benchmarkOnly: string[] } {
  const left = aggregateCloses(asOf ? instrument.filter((row) => row.date <= asOf) : instrument, timeframe);
  const right = aggregateCloses(asOf ? benchmark.filter((row) => row.date <= asOf) : benchmark, timeframe);
  const bench = new Map(right.map((row) => [row.period, row]));
  const own = new Set(left.map((row) => row.period));
  const pairs: PairedBar[] = [];
  const instrumentOnly: string[] = [];
  for (const row of left) {
    const other = bench.get(row.period);
    if (!other) instrumentOnly.push(row.date);
    else pairs.push({ date: row.date, period: row.period, instrument: row.close, benchmark: other.close, benchmarkDate: other.date });
  }
  const benchmarkOnly = right.filter((row) => !own.has(row.period)).map((row) => row.date);
  return { pairs, instrumentOnly, benchmarkOnly };
}

export type RrgReading = {
  symbol: string;
  name: string;
  quadrant: Quadrant | null;
  previousQuadrant: Quadrant | null;
  rsRatio: number | null;
  rsMomentum: number | null;
  distance: number | null;
  direction: string;
  close: number | null;
  benchmarkClose: number | null;
  asOf: string | null;
  absoluteReturn: number | null;
  relativeReturn: number | null;
  returnFrom: string | null;
  returnTo: string | null;
  tail: { date: string; rsRatio: number; rsMomentum: number; quadrant: Quadrant | null }[];
  aligned: number;
  droppedInstrument: number;
  droppedBenchmark: number;
  warnings: string[];
};

export function buildReading(input: {
  symbol: string;
  name: string;
  instrument: ClosePrint[];
  benchmark: ClosePrint[];
  timeframe: Timeframe;
  asOf?: string;
  tail: number;
  notes: string[];
  limited: boolean;
  unresolved?: UnresolvedBreak[];
}): RrgReading {
  const paired = pairTimeframe(input.instrument, input.benchmark, input.timeframe, input.asOf);
  const points = computeRrgPairs(
    paired.pairs.map((row) => ({ date: row.date, instrument: row.instrument, benchmark: row.benchmark })),
  );
  const ready = points.filter((point) => point.rsRatio != null && point.rsMomentum != null);
  const last = ready.at(-1) || null;
  const prev = ready.at(-2) || null;
  const end = paired.pairs.at(-1) || null;
  const span = Math.min(RETURN_WINDOW[input.timeframe], Math.max(0, paired.pairs.length - 1));
  const start = span > 0 ? paired.pairs[paired.pairs.length - 1 - span] : null;
  const warnings = [...input.notes];
  if (input.limited) warnings.unshift("Limited history. Do not treat this tail as a long-run rotation.");
  if (!last) warnings.push(`This timeframe needs ${RRG_PARAMS.slow} bars before RS-Ratio exists. None were filled.`);
  else if (ready.length < input.tail) warnings.push(`The tail has ${ready.length} points, fewer than the ${input.tail} requested.`);
  if (paired.instrumentOnly.length) warnings.push(`${paired.instrumentOnly.length} periods were dropped because the benchmark did not trade then.`);
  const absoluteReturn = end && start ? end.instrument / start.instrument - 1 : null;
  const benchmarkReturn = end && start ? end.benchmark / start.benchmark - 1 : null;
  const windowStart = paired.pairs[Math.max(0, paired.pairs.length - RRG_PARAMS.slow)]?.date ?? null;
  const held = breakInside(input.unresolved, windowStart, end?.date ?? null);
  const returnHeld = breakInside(input.unresolved, start?.date ?? null, end?.date ?? null);
  if (held) {
    warnings.push(`Unresolved price break on ${held.date} (${(held.change * 100).toFixed(1)}%). No published adjustment factor is on file, so this RS-Ratio is withheld.`);
  }
  return {
    symbol: input.symbol,
    name: input.name,
    quadrant: held ? null : last?.quadrant ?? null,
    previousQuadrant: held ? null : prev?.quadrant ?? null,
    rsRatio: held ? null : last?.rsRatio ?? null,
    rsMomentum: held ? null : last?.rsMomentum ?? null,
    distance: held || last?.rsRatio == null || last.rsMomentum == null ? null : Math.hypot(last.rsRatio - 100, last.rsMomentum - 100),
    direction: held ? "The coordinate is withheld because an unresolved price break sits inside the slow average." : directionOf(prev, last),
    close: end?.instrument ?? null,
    benchmarkClose: end?.benchmark ?? null,
    asOf: end?.date ?? null,
    absoluteReturn: returnHeld ? null : absoluteReturn,
    relativeReturn: returnHeld ? null : absoluteReturn != null && benchmarkReturn != null ? absoluteReturn - benchmarkReturn : null,
    returnFrom: start?.date ?? null,
    returnTo: end?.date ?? null,
    tail: held ? [] : ready.slice(-input.tail).map((point) => ({
      date: point.date,
      rsRatio: point.rsRatio as number,
      rsMomentum: point.rsMomentum as number,
      quadrant: point.quadrant,
    })),
    aligned: paired.pairs.length,
    droppedInstrument: paired.instrumentOnly.length,
    droppedBenchmark: paired.benchmarkOnly.length,
    warnings,
  };
}

export function directionOf(prev: RrgPoint | { rsRatio: number | null; rsMomentum: number | null } | null, last: RrgPoint | { rsRatio: number | null; rsMomentum: number | null } | null) {
  if (!prev || !last || prev.rsRatio == null || prev.rsMomentum == null || last.rsRatio == null || last.rsMomentum == null) {
    return "Not enough points to judge a move.";
  }
  const dx = last.rsRatio - prev.rsRatio;
  const dy = last.rsMomentum - prev.rsMomentum;
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return "Little change since the previous point.";
  const x = dx > 0.05 ? "RS-Ratio rose" : dx < -0.05 ? "RS-Ratio fell" : "RS-Ratio was almost unchanged";
  const y = dy > 0.05 ? "RS-Momentum rose" : dy < -0.05 ? "RS-Momentum fell" : "RS-Momentum was almost unchanged";
  return `${x} and ${y}.`;
}

export type SortKey = "symbol" | "absoluteReturn" | "relativeReturn" | "rsRatio" | "rsMomentum" | "distance" | "quadrant";

const QUADRANT_ORDER: Record<string, number> = { leading: 0, weakening: 1, improving: 2, lagging: 3, boundary: 4 };

export function sortReadings<T extends RrgReading>(rows: T[], key: SortKey, direction: "asc" | "desc") {
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = key === "symbol" ? a.name : key === "quadrant" ? QUADRANT_ORDER[a.quadrant || ""] ?? 9 : a[key];
    const bv = key === "symbol" ? b.name : key === "quadrant" ? QUADRANT_ORDER[b.quadrant || ""] ?? 9 : b[key];
    if (av == null && bv == null) return a.symbol.localeCompare(b.symbol);
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sign;
    return ((av as number) - (bv as number)) * sign;
  });
}

export function filterReadings<T extends RrgReading>(rows: T[], quadrant: Quadrant | "all", query: string) {
  const text = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (quadrant !== "all" && row.quadrant !== quadrant) return false;
    if (!text) return true;
    return row.symbol.toLowerCase().includes(text) || row.name.toLowerCase().includes(text);
  });
}

export type CrossReading = { symbol: string; name: string; daily: Quadrant | null; weekly: Quadrant | null; monthly: Quadrant | null };

export function interpret(rows: RrgReading[], cross: CrossReading[]) {
  const notes: string[] = [];
  const ready = rows.filter((row) => row.quadrant);
  if (!ready.length) {
    notes.push("No selected series has a full window on this timeframe. Missing bars were not filled.");
    return notes;
  }
  for (const quadrant of ["leading", "weakening", "lagging", "improving", "boundary"] as const) {
    const names = ready.filter((row) => row.quadrant === quadrant).map((row) => row.name);
    if (names.length) notes.push(`${quadrantLabel(quadrant)}: ${names.join(", ")}.`);
  }
  for (const row of ready) {
    if (row.previousQuadrant && row.previousQuadrant !== row.quadrant) {
      notes.push(`${row.name} moved from ${quadrantLabel(row.previousQuadrant)} to ${quadrantLabel(row.quadrant)} on ${row.asOf}. That is a change in this calculation, not an instruction to trade.`);
    }
    if (row.absoluteReturn != null && row.absoluteReturn < 0 && row.quadrant === "leading") {
      notes.push(`${row.name} leads on a relative basis while its own price is down ${pct(row.absoluteReturn)} from ${row.returnFrom} to ${row.returnTo}.`);
    }
    if (row.absoluteReturn != null && row.absoluteReturn > 0 && row.quadrant === "lagging") {
      notes.push(`${row.name} is lagging the benchmark even though its own price is up ${pct(row.absoluteReturn)} from ${row.returnFrom} to ${row.returnTo}.`);
    }
  }
  for (const row of cross) {
    const parts = [row.daily, row.weekly, row.monthly];
    if (parts.every((part) => part == null)) continue;
    const text = `daily ${quadrantLabel(row.daily)}, weekly ${quadrantLabel(row.weekly)}, monthly ${quadrantLabel(row.monthly)}`;
    if (row.daily && row.daily === row.weekly && row.daily === row.monthly) notes.push(`${row.name} is ${quadrantLabel(row.daily)} on daily, weekly, and monthly.`);
    else notes.push(`${row.name} does not agree across timeframes: ${text}.`);
  }
  return notes;
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export type RotationBrief = {
  leaders: string[];
  emerging: string[];
  fading: string[];
  laggards: string[];
  transitions: string[];
  aligned: string[];
  split: string[];
  contrasts: string[];
};

/** Observations from the calculated points. Nothing here is a trade instruction. */
export function rotationBrief(rows: RrgReading[], cross: CrossReading[]): RotationBrief {
  const ready = rows.filter((row) => row.quadrant && row.rsRatio != null && row.rsMomentum != null);
  const by = (quadrant: Quadrant) => ready.filter((row) => row.quadrant === quadrant);
  const rank = (list: RrgReading[], key: "rsRatio" | "rsMomentum") =>
    [...list].sort((a, b) => (b[key] as number) - (a[key] as number)).map((row) => row.name);
  const transitions = ready
    .filter((row) => row.previousQuadrant && row.previousQuadrant !== row.quadrant)
    .map((row) => `${row.name} moved from ${quadrantLabel(row.previousQuadrant)} to ${quadrantLabel(row.quadrant)} on ${row.asOf}.`);
  const contrasts = ready.flatMap((row) => {
    if (row.absoluteReturn == null) return [];
    if (row.quadrant === "leading" && row.absoluteReturn < 0) {
      return [`${row.name} is leading the benchmark while its own price is down ${pct(row.absoluteReturn)} from ${row.returnFrom} to ${row.returnTo}.`];
    }
    if (row.quadrant === "lagging" && row.absoluteReturn > 0) {
      return [`${row.name} is lagging the benchmark even though its own price is up ${pct(row.absoluteReturn)} from ${row.returnFrom} to ${row.returnTo}.`];
    }
    return [];
  });
  const aligned: string[] = [];
  const split: string[] = [];
  for (const row of cross) {
    if (!row.daily || !row.weekly || !row.monthly) continue;
    if (row.daily === row.weekly && row.weekly === row.monthly) aligned.push(`${row.name} is ${quadrantLabel(row.daily)} on daily, weekly, and monthly.`);
    else split.push(`${row.name}: daily ${quadrantLabel(row.daily)}, weekly ${quadrantLabel(row.weekly)}, monthly ${quadrantLabel(row.monthly)}.`);
  }
  return {
    leaders: rank(by("leading"), "rsRatio"),
    emerging: rank(by("improving"), "rsMomentum"),
    fading: rank(by("weakening"), "rsRatio"),
    laggards: rank(by("lagging"), "rsMomentum"),
    transitions,
    aligned,
    split,
    contrasts,
  };
}

export type PlotDomain = { x0: number; x1: number; y0: number; y1: number };

export function plotDomain(points: { x: number; y: number }[]): PlotDomain {
  const xs = [100, ...points.map((point) => point.x)];
  const ys = [100, ...points.map((point) => point.y)];
  let x0 = Math.min(...xs);
  let x1 = Math.max(...xs);
  let y0 = Math.min(...ys);
  let y1 = Math.max(...ys);
  if (x1 - x0 < 4) {
    const mid = (x0 + x1) / 2;
    x0 = mid - 2;
    x1 = mid + 2;
  }
  if (y1 - y0 < 4) {
    const mid = (y0 + y1) / 2;
    y0 = mid - 2;
    y1 = mid + 2;
  }
  const px = (x1 - x0) * 0.12;
  const py = (y1 - y0) * 0.12;
  return { x0: x0 - px, x1: x1 + px, y0: y0 - py, y1: y1 + py };
}

export function zoomDomain(domain: PlotDomain, x: number, y: number, factor: number): PlotDomain {
  const next = clampFactor(factor);
  return {
    x0: x - (x - domain.x0) * next,
    x1: x + (domain.x1 - x) * next,
    y0: y - (y - domain.y0) * next,
    y1: y + (domain.y1 - y) * next,
  };
}

export function panDomain(domain: PlotDomain, dx: number, dy: number): PlotDomain {
  return { x0: domain.x0 + dx, x1: domain.x1 + dx, y0: domain.y0 + dy, y1: domain.y1 + dy };
}

function clampFactor(factor: number) {
  return Math.min(1.4, Math.max(0.6, factor));
}

export function rrgLayout(width: number) {
  const narrow = width < 760;
  return { chartHeight: narrow ? 360 : 520, stacked: narrow };
}

export function viewState(input: { pending: boolean; error: boolean; selected: number }) {
  if (input.pending) return "loading";
  if (input.error) return "error";
  if (input.selected < 1) return "empty";
  return "ready";
}

export const RRG_METHOD = {
  formula: RRG_FORMULA,
  params: RRG_PARAMS,
  weekly: "Last daily close in each ISO week. A week with no print is skipped.",
  monthly: "Last daily close in each calendar month. A month with no print is skipped.",
  returns: "Absolute return is the price change over the last 63 daily, 13 weekly, or 6 monthly bars. Relative return is that change minus the benchmark's change over the same bars.",
  boundary: "A value within 1e-8 of 100 stays on the boundary and is not placed in a quadrant.",
  adjustment: "Price return. A published split or bonus is adjusted backward once. A bonus and a face-value split on the same action are multiplied. Cash dividends are not. A close-to-close ratio is not a factor. A price index is not a total-return index.",
};
