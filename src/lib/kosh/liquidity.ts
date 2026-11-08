/** Liquidity sweep and failed-breakout detection. No look-ahead: a swing is usable only after its right-hand candles have closed. */

import type { ChartMark, OhlcBar } from "./types";

export type LiqTimeframe = "15m" | "1H" | "4H" | "1D" | "1W" | "1M";
export type LiqDirection = "bull" | "bear";
export type LiqPattern = "sweep" | "failed";
export type LiqTier = "strong" | "potential" | "developing";
export type LiqStatus = "developing" | "confirmed" | "invalidated" | "expired";
export type ReclaimKind = "same" | "one" | "two" | "three" | "later";

export type LiqConfig = {
  left: number;
  right: number;
  minAge: number;
  maxLookback: number;
  maxReclaim: number;
  failedWindow: number;
  minDepthAtr: number;
  maxDepthAtr: number;
  equalPct: number;
  equalAtr: number;
  strongScore: number;
  potentialScore: number;
  expiry: number;
};

export const DEFAULT_LIQ: LiqConfig = {
  left: 5,
  right: 3,
  minAge: 8,
  maxLookback: 100,
  maxReclaim: 3,
  failedWindow: 6,
  minDepthAtr: 0.05,
  maxDepthAtr: 1.5,
  equalPct: 0.0025,
  equalAtr: 0.2,
  strongScore: 75,
  potentialScore: 55,
  expiry: 10,
};

export type ScanBar = { t: number; o: number; h: number; l: number; c: number; v: number | null; scale?: number };

export type LiqEvent = {
  id: string;
  pattern: LiqPattern;
  direction: LiqDirection;
  tier: LiqTier;
  status: LiqStatus;
  lowQuality: boolean;
  level: number;
  zoneLow: number;
  zoneHigh: number;
  touches: number;
  repeated: boolean;
  swingIndex: number;
  sweepIndex: number;
  sweepT: number;
  extreme: number;
  depthPct: number;
  depthAtr: number | null;
  reclaimIndex: number | null;
  reclaimT: number | null;
  reclaimClose: number | null;
  reclaimCandles: number | null;
  reclaimKind: ReclaimKind | null;
  volumeRatio: number | null;
  /** False when the tape had no volume. The score then gives volume 0, it does not invent a midpoint. */
  volumeKnown: boolean;
  /** known: comparable volume. missing: no print. neutral: a split-sized adjustment sits in the window, so volume scored 0. */
  volumeTrust?: "known" | "missing" | "neutral";
  score: number;
  parts: { swing: number; sweep: number; reclaim: number; volume: number; candle: number; confirm: number };
  weaknesses: string[];
  /** A later candle traded beyond the reclaim candle. This is not the reclaim itself. */
  followThrough: boolean;
  /** The reclaim candle has closed back through the level. */
  reclaimClosed: boolean;
  confirmIndex: number | null;
  confirmT: number | null;
  invalidIndex: number | null;
  explanation: string;
  levelId: string;
};

export const LIQ_FOCUS_KEY = "kosh-liquidity-focus";

export type LiqFocus = {
  symbol: string;
  interval: string;
  lookback: string;
  t: number;
  note: string;
  marks: ChartMark[];
};

export type ForwardStats = {
  pattern: LiqPattern;
  direction: LiqDirection;
  /** Signals in this pattern and direction, including ones with no later candle. */
  n: number;
  /** How many observations exist at each horizon. These counts are not interchangeable. */
  samples: { c1: number; c3: number; c5: number; c8: number; mfe: number; mae: number };
  avg: { c1: number | null; c3: number | null; c5: number | null; c8: number | null };
  median: { c1: number | null; c3: number | null; c5: number | null; c8: number | null; mfe: number | null; mae: number | null };
  /** Same as samples.c1. Kept so older readers still see a sample size. */
  withForward: number;
  medianMfe: number | null;
  medianMae: number | null;
  invalidated: number;
  /** True when a horizon was cut at OBS_CAP. The median is then pooled only up to that cap. */
  capped: boolean;
  obs: ForwardObs;
  /** Strong and Potential are separate. Absent on an older saved row. */
  quality?: "strong" | "potential";
  symbols?: string[];
  /** Horizons the tape did not reach, and that were not already invalidated. */
  incomplete?: { c1: number; c3: number; c5: number; c8: number };
  overlapping?: number;
  independentN?: number;
  fromT?: number | null;
  toT?: number | null;
  excessAvg?: { c1: number | null; c3: number | null; c5: number | null; c8: number | null };
  excessSamples?: { c1: number; c3: number; c5: number; c8: number };
  /** Stock observations that found a Nifty bar at that horizon. Not the stock sample. */
  benchMatched?: { c1: number; c3: number; c5: number; c8: number };
  /** Stock observations with no Nifty bar. These are not a zero excess return. */
  benchUnmatched?: { c1: number; c3: number; c5: number; c8: number };
  /** Individual excess observations, so a merged book does not drop the benchmark column. */
  excessObs?: ForwardObs;
  /** Median of the earliest signal on each level. A robustness check, not the headline sample. */
  indepMedian?: { c1: number | null; c3: number | null; c5: number | null; c8: number | null };
  /** Earliest signal per level. A robustness check, not the headline sample. */
  indepObs?: ForwardObs;
};

export type ForwardObs = { c1: number[]; c3: number[]; c5: number[]; c8: number[]; mfe: number[]; mae: number[] };

export const OBS_CAP = 12000;

export function emptyObs(): ForwardObs {
  return { c1: [], c3: [], c5: [], c8: [], mfe: [], mae: [] };
}

const IST = 19800;
const OPEN = 9 * 3600 + 15 * 60;
const CLOSE = 15 * 3600 + 30 * 60;
const SPLIT = 13 * 3600 + 15 * 60;

function istParts(t: number) {
  const shifted = t + IST;
  const day = Math.floor(shifted / 86400);
  return { day, sod: shifted - day * 86400 };
}

/** A listed call stays for this many closed bars after the close back through the level. */
export const RECLAIM_LIFE = 10;

/** How long a saved scan is worth keeping: one reclaim life of this timeframe. */
export function runValidityMs(tf: LiqTimeframe): number {
  const bar =
    tf === "15m" ? 15 * 60_000
    : tf === "1H" ? 60 * 60_000
    : tf === "4H" ? 4 * 60 * 60_000
    : tf === "1D" ? 24 * 60 * 60_000
    : tf === "1W" ? 7 * 24 * 60 * 60_000
    : 30 * 24 * 60 * 60_000;
  return RECLAIM_LIFE * bar;
}

/** True when a later candle of this timeframe may have started since `barT`. Weekends are not a new daily candle. */
export function laterCandleLikely(tf: LiqTimeframe, barT: number | null, now = Date.now()): boolean {
  if (barT == null || !Number.isFinite(barT)) return false;
  const nowSec = Math.floor(now / 1000);
  const bar = istParts(barT);
  const cur = istParts(nowSec);
  if (tf === "1M") {
    const a = new Date((barT + IST) * 1000);
    const b = new Date((nowSec + IST) * 1000);
    return b.getUTCFullYear() > a.getUTCFullYear() || (b.getUTCFullYear() === a.getUTCFullYear() && b.getUTCMonth() > a.getUTCMonth());
  }
  if (tf === "1W") return Math.floor((cur.day + 3) / 7) > Math.floor((bar.day + 3) / 7);
  if (tf === "1D") {
    if (cur.day <= bar.day) return false;
    const weekday = new Date((nowSec + IST) * 1000).getUTCDay();
    if (weekday === 0 || weekday === 6) return cur.day - bar.day >= 3;
    return cur.sod >= OPEN || cur.day - bar.day >= 2;
  }
  if (tf === "4H") return nowSec - barT >= 3 * 60 * 60;
  if (tf === "1H") return nowSec - barT >= 60 * 60;
  return nowSec - barT >= 15 * 60;
}

/** The last candle is still forming when its period contains now. A closed session is not treated as live. */
export function lastBarForming(tf: LiqTimeframe, lastT: number, now = Date.now()): boolean {
  const nowSec = Math.floor(now / 1000);
  const nowIst = istParts(nowSec);
  const barIst = istParts(lastT);
  if (tf === "1M") {
    const a = new Date((lastT + IST) * 1000);
    const b = new Date((nowSec + IST) * 1000);
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
  }
  if (tf === "1W") {
    if (Math.floor((barIst.day + 3) / 7) !== Math.floor((nowIst.day + 3) / 7)) return false;
    const weekday = new Date((nowSec + IST) * 1000).getUTCDay();
    if (weekday === 0 || weekday === 6) return false;
    if (weekday === 5 && nowIst.sod > CLOSE) return false;
    return true;
  }
  if (tf === "1D") return barIst.day === nowIst.day && nowIst.sod <= CLOSE;
  if (barIst.day !== nowIst.day) return false;
  if (tf === "15m") return nowSec - lastT < 15 * 60 && nowSec >= lastT;
  if (tf === "1H") return nowSec - lastT < 60 * 60 && nowSec >= lastT;
  if (tf === "4H") {
    const slotEnd = barIst.sod < SPLIT ? SPLIT : CLOSE;
    return nowIst.sod >= barIst.sod && nowIst.sod <= slotEnd;
  }
  return false;
}

/** Drop impossible OHLC, duplicate timestamps, and negative volume. Missing volume stays missing, not zero. */
export function prepareBars(input: OhlcBar[], adjusted = true): { bars: ScanBar[]; dropped: number; volumeKnown: boolean; adjusted: boolean } {
  const byTime = new Map<number, OhlcBar>();
  let dropped = 0;
  for (const bar of input) {
    if (!bar || !Number.isFinite(bar.t) || !(bar.c > 0)) {
      dropped += 1;
      continue;
    }
    byTime.set(bar.t, bar);
  }
  const ordered = [...byTime.values()].sort((a, b) => a.t - b.t);
  const bars: ScanBar[] = [];
  let usedAdj = false;
  for (const bar of ordered) {
    const rawO = bar.o > 0 ? bar.o : bar.c;
    const rawH = bar.h;
    const rawL = bar.l;
    if (!(rawH >= rawL) || rawH + 1e-8 < Math.max(rawO, bar.c) || rawL > Math.min(rawO, bar.c) + 1e-8) {
      dropped += 1;
      continue;
    }
    const scale = adjusted && bar.adj != null && bar.adj > 0 && bar.c > 0 && Math.abs(bar.adj - bar.c) / bar.c > 0.002 ? bar.adj / bar.c : 1;
    if (scale !== 1) usedAdj = true;
    const c = bar.c * scale;
    const o = (bar.o > 0 ? bar.o : bar.c) * scale;
    const h = Math.max(bar.h > 0 ? bar.h * scale : c, o, c);
    const lRaw = (bar.l > 0 ? bar.l : c) * scale;
    const l = Math.min(lRaw, o, c);
    if (!(h + 1e-8 >= Math.max(o, c, l)) || !(l <= Math.min(o, c, h) + 1e-8) || !(h >= l)) {
      dropped += 1;
      continue;
    }
    const v = Number.isFinite(bar.v) && bar.v > 0 ? bar.v : null;
    bars.push({ t: bar.t, o, h, l, c, v, scale });
  }
  return { bars, dropped, volumeKnown: bars.some((b) => b.v != null), adjusted: usedAdj };
}

/** Fold hourly prints into IST session slots. A slot is kept only when every expected hour is present. Weekend prints are ignored. Missing volume on any hour leaves the slot volume missing. */
export type SlotAudit = {
  day: number;
  slot: 0 | 1;
  t: number;
  expected: number;
  present: number;
  missingHours: number[];
  complete: boolean;
  weekend: boolean;
  volumeKnown: boolean;
};

type FoldedBar = OhlcBar & { scale?: number };

const MORNING_HOURS = [9 * 3600 + 15 * 60, 10 * 3600 + 15 * 60, 11 * 3600 + 15 * 60, 12 * 3600 + 15 * 60];
const AFTER_HOURS = [13 * 3600 + 15 * 60, 14 * 3600 + 15 * 60, 15 * 3600 + 15 * 60];

function istWeekday(day: number): number {
  return new Date(day * 86400000).getUTCDay();
}

export function foldSession4hReport(input: OhlcBar[]): { bars: FoldedBar[]; slots: SlotAudit[] } {
  const prepared = prepareBars(input, true).bars;
  type Bucket = { t: number; o: number; h: number; l: number; c: number; hours: Map<number, number | null>; scales: number[]; weekend: boolean };
  const groups = new Map<string, Bucket>();
  for (const bar of prepared) {
    const { day, sod } = istParts(bar.t);
    if (sod < OPEN || sod > CLOSE) continue;
    const hours = sod < SPLIT ? MORNING_HOURS : AFTER_HOURS;
    const hour = hours.find((start) => sod >= start && sod < start + 3600);
    if (hour == null) continue;
    const slot = sod < SPLIT ? 0 : 1;
    const key = `${day}:${slot}`;
    const weekend = istWeekday(day) === 0 || istWeekday(day) === 6;
    const cur = groups.get(key);
    if (!cur) {
      groups.set(key, { t: bar.t, o: bar.o, h: bar.h, l: bar.l, c: bar.c, hours: new Map([[hour, bar.v]]), scales: [bar.scale ?? 1], weekend });
    } else {
      cur.h = Math.max(cur.h, bar.h);
      cur.l = Math.min(cur.l, bar.l);
      cur.c = bar.c;
      const prev = cur.hours.get(hour);
      cur.hours.set(hour, prev == null ? bar.v : bar.v == null ? null : prev + bar.v);
      cur.scales.push(bar.scale ?? 1);
    }
  }
  const slots: SlotAudit[] = [];
  const bars: FoldedBar[] = [];
  for (const [key, bucket] of [...groups.entries()].sort((a, b) => a[1].t - b[1].t)) {
    const slot = Number(key.split(":")[1]) as 0 | 1;
    const expectedHours = slot === 0 ? MORNING_HOURS : AFTER_HOURS;
    const missingHours = expectedHours.filter((hour) => !bucket.hours.has(hour));
    const volumes = [...bucket.hours.values()];
    const volumeKnown = volumes.length > 0 && volumes.every((v) => v != null);
    const scaleBase = bucket.scales[0] ?? 1;
    const mixedScale = bucket.scales.some((scale) => !(scale > 0) || Math.abs(scale - scaleBase) / scaleBase > 0.08);
    const complete = !bucket.weekend && missingHours.length === 0;
    const day = Number(key.split(":")[0]);
    slots.push({
      day,
      slot,
      t: bucket.t,
      expected: expectedHours.length,
      present: expectedHours.length - missingHours.length,
      missingHours,
      complete,
      weekend: bucket.weekend,
      volumeKnown,
    });
    if (!complete) continue;
    const volume = volumeKnown && !mixedScale ? volumes.reduce<number>((sum, v) => sum + (v || 0), 0) : 0;
    bars.push({ t: bucket.t, o: bucket.o, h: bucket.h, l: bucket.l, c: bucket.c, v: volume, scale: mixedScale ? Number.NaN : scaleBase });
  }
  return { bars, slots };
}

export function foldSession4h(input: OhlcBar[]): OhlcBar[] {
  return foldSession4hReport(input).bars;
}

/** True only while the clock is still inside the last completed 4-hour slot. An older incomplete slot is missing data, not a live bar. */
export function session4hTailOpen(input: OhlcBar[], now = Date.now()): boolean {
  const last = foldSession4hReport(input).bars.at(-1);
  if (!last) return false;
  return lastBarForming("4H", last.t, now);
}

/** Keep prints inside the cash session. Does not invent the missing ones. */
export function sessionOnly(input: OhlcBar[]): OhlcBar[] {
  return input.filter((bar) => {
    if (!Number.isFinite(bar.t)) return false;
    const { sod } = istParts(bar.t);
    return sod >= OPEN && sod <= CLOSE;
  });
}

/** The candle series the detector uses. The 4-hour chart must call this same function. */
export function barsForTimeframe(tf: LiqTimeframe, raw: OhlcBar[]) {
  if (tf === "4H") {
    const folded = foldSession4hReport(raw).bars;
    const bars: ScanBar[] = folded.map((bar) => ({
      t: bar.t,
      o: bar.o,
      h: bar.h,
      l: bar.l,
      c: bar.c,
      v: bar.v > 0 ? bar.v : null,
      scale: bar.scale,
    }));
    return {
      bars,
      dropped: 0,
      volumeKnown: bars.some((bar) => bar.v != null),
      adjusted: bars.some((bar) => bar.scale != null && Number.isFinite(bar.scale) && Math.abs(bar.scale - 1) > 0.002),
    };
  }
  if (tf === "15m" || tf === "1H") return prepareBars(sessionOnly(raw), true);
  return prepareBars(raw, true);
}

function atrAt(bars: ScanBar[], index: number, n = 14): number | null {
  if (index < 1) return null;
  const start = Math.max(1, index - n + 1);
  let sum = 0;
  let count = 0;
  for (let i = start; i <= index; i++) {
    const prev = bars[i - 1].c;
    const tr = Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - prev), Math.abs(bars[i].l - prev));
    sum += tr;
    count += 1;
  }
  return count ? sum / count : null;
}

function volAvg(bars: ScanBar[], index: number, n = 20): number | null {
  let sum = 0;
  let count = 0;
  for (let i = Math.max(0, index - n); i < index; i++) {
    if (bars[i].v != null) {
      sum += bars[i].v as number;
      count += 1;
    }
  }
  return count ? sum / count : null;
}

/** Volume across a split is not comparable. A missing print stays missing. Nothing is invented. */
export function volumeWindowTrust(bars: ScanBar[], from: number, to: number): "known" | "missing" | "neutral" {
  let base: number | null = null;
  let any = false;
  for (let i = Math.max(0, from); i <= to && i < bars.length; i++) {
    const bar = bars[i];
    if (!bar) continue;
    if (bar.v != null) any = true;
    const scale = bar.scale ?? 1;
    if (!Number.isFinite(scale) || !(scale > 0)) return "neutral";
    if (base == null) base = scale;
    else if (Math.abs(scale - base) / base > 0.08) return "neutral";
  }
  return any ? "known" : "missing";
}

type Swing = { index: number; price: number; kind: "low" | "high"; confirm: number };

function swings(bars: ScanBar[], left: number, right: number, upto: number): Swing[] {
  const out: Swing[] = [];
  for (let i = left; i <= upto - right; i++) {
    let low = true;
    let high = true;
    for (let k = i - left; k <= i + right; k++) {
      if (k === i) continue;
      if (bars[k].l <= bars[i].l) low = false;
      if (bars[k].h >= bars[i].h) high = false;
    }
    if (low) out.push({ index: i, price: bars[i].l, kind: "low", confirm: i + right });
    if (high) out.push({ index: i, price: bars[i].h, kind: "high", confirm: i + right });
  }
  return out;
}

type Level = {
  id: string;
  kind: "low" | "high";
  price: number;
  low: number;
  high: number;
  anchor: number;
  touches: number[];
  confirm: number;
  first: number;
  last: number;
  members: Swing[];
};

function cluster(list: Swing[], bars: ScanBar[], cfg: LiqConfig): Level[] {
  const sorted = list.slice().sort((a, b) => a.index - b.index);
  const used = new Set<number>();
  const levels: Level[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    const seed = sorted[i];
    const members = [seed];
    used.add(i);
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      const next = sorted[j];
      if (next.kind !== seed.kind) continue;
      if (next.index - members[members.length - 1].index < cfg.right) continue;
      const atr = atrAt(bars, next.index) || 0;
      const pct = Math.abs(next.price - seed.price) / seed.price;
      const atrPct = atr > 0 ? (cfg.equalAtr * atr) / seed.price : 0;
      const tol = Math.min(0.0035, Math.max(cfg.equalPct, atrPct));
      if (pct <= tol) {
        members.push(next);
        used.add(j);
      }
    }
    const prices = members.map((m) => m.price);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const price = prices.reduce((s, n) => s + n, 0) / prices.length;
    const last = members[members.length - 1];
    levels.push({
      id: `${seed.kind}:${seed.index}`,
      kind: seed.kind,
      price,
      low,
      high,
      anchor: seed.price,
      touches: members.map((m) => m.index),
      confirm: Math.max(...members.map((m) => m.confirm)),
      first: seed.index,
      last: last.index,
      members,
    });
  }
  return levels;
}

/** Level as it stood once `asOf` had closed. A later equal swing does not rewrite an earlier sweep. */
function levelAsOf(level: Level, asOf: number): Level {
  const members = level.members.filter((member) => member.confirm <= asOf);
  const used = members.length ? members : level.members.slice(0, 1);
  const prices = used.map((member) => member.price);
  const last = used[used.length - 1];
  return {
    ...level,
    id: `${level.kind}:${used[0].index}`,
    price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    low: Math.min(...prices),
    high: Math.max(...prices),
    anchor: used[0].price,
    touches: used.map((member) => member.index),
    confirm: Math.max(...used.map((member) => member.confirm)),
    first: used[0].index,
    last: last.index,
    members: used,
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function reclaimKind(candles: number): ReclaimKind {
  if (candles <= 0) return "same";
  if (candles === 1) return "one";
  if (candles === 2) return "two";
  if (candles === 3) return "three";
  return "later";
}

function scoreEvent(input: {
  age: number;
  touches: number;
  prominence: number;
  depthAtr: number | null;
  candles: number;
  body: number;
  closePos: number;
  volRatio: number | null;
  volumeNeutral?: boolean;
  followThrough: boolean;
  cfg: LiqConfig;
}): { score: number; parts: LiqEvent["parts"]; weaknesses: string[] } {
  const weaknesses: string[] = [];
  const ageScore = clamp(input.age / 20, 0, 1);
  const touchScore = input.touches >= 3 ? 1 : input.touches === 2 ? 0.75 : 0.45;
  const promScore = clamp(input.prominence / 2, 0, 1);
  const swing = Math.round(20 * (0.4 * ageScore + 0.3 * touchScore + 0.3 * promScore));
  if (input.age < 12) weaknesses.push("The swing is relatively young.");
  if (input.touches < 2) weaknesses.push("The level was touched once, not a repeated pool.");

  let sweep = 10;
  if (input.depthAtr == null) {
    sweep = 8;
    weaknesses.push("ATR was not ready, so sweep depth is only a percentage.");
  } else if (input.depthAtr < input.cfg.minDepthAtr) {
    sweep = Math.round(20 * clamp(input.depthAtr / input.cfg.minDepthAtr, 0, 1) * 0.55);
    weaknesses.push("The sweep is shallower than the usual ATR band.");
  } else if (input.depthAtr > input.cfg.maxDepthAtr) {
    sweep = Math.max(2, Math.round(20 * (input.cfg.maxDepthAtr / input.depthAtr)));
    weaknesses.push("The penetration is deep enough to look like a breakdown, not a sweep.");
  } else {
    const mid = (input.cfg.minDepthAtr + input.cfg.maxDepthAtr) / 2;
    const dist = Math.abs(input.depthAtr - mid) / mid;
    sweep = Math.round(20 * (1 - clamp(dist, 0, 1) * 0.45));
  }

  const speed = input.candles <= 0 ? 1 : input.candles === 1 ? 0.85 : input.candles === 2 ? 0.7 : input.candles === 3 ? 0.55 : 0.4;
  const reclaim = Math.round(20 * (0.55 * speed + 0.25 * clamp(input.body, 0, 1) + 0.2 * clamp(input.closePos, 0, 1)));
  if (input.candles >= 3) weaknesses.push("The reclaim took several candles.");
  if (input.body < 0.4) weaknesses.push("The reclaim candle body is modest.");

  let volume = 0;
  if (input.volRatio == null) {
    weaknesses.push(
      input.volumeNeutral
        ? "A split-sized corporate action sits in the volume window. Yahoo does not give split-adjusted volume, so volume scored 0 instead of a made-up ratio."
        : "Volume was missing, so it scored 0 and was not used as a reason to drop the setup.",
    );
  } else if (input.volRatio >= 1.4) volume = 15;
  else if (input.volRatio >= 1) volume = 12;
  else if (input.volRatio >= 0.7) {
    volume = 8;
    weaknesses.push("Volume was below the recent average.");
  } else {
    volume = 4;
    weaknesses.push("Volume was well below the recent average.");
  }

  const candle = Math.round(15 * (0.5 * clamp(input.body, 0, 1) + 0.5 * clamp(input.closePos, 0, 1)));
  const confirm = input.followThrough ? 10 : 0;
  if (!input.followThrough) weaknesses.push("No later candle has traded through the reclaim candle. That is follow-through, separate from the close back.");
  const parts = { swing, sweep, reclaim, volume, candle, confirm };
  const score = swing + sweep + reclaim + volume + candle + confirm;
  return { score, parts, weaknesses };
}

function explain(event: {
  direction: LiqDirection;
  pattern: LiqPattern;
  touches: number;
  level: number;
  extreme: number;
  depthPct: number;
  depthAtr: number | null;
  reclaimCandles: number | null;
  status: LiqStatus;
  tier: LiqTier;
  reclaimClosed: boolean;
  followThrough: boolean;
}): string {
  const side = event.direction === "bull" ? "low" : "high";
  const verb = event.direction === "bull" ? "under" : "over";
  const back = event.direction === "bull" ? "back above" : "back below";
  const kind = event.pattern === "sweep" ? "liquidity sweep" : "failed break";
  const depth = event.depthAtr != null ? `${event.depthPct.toFixed(2)}% (${event.depthAtr.toFixed(2)} ATR)` : `${event.depthPct.toFixed(2)}%`;
  const reclaim =
    !event.reclaimClosed
      ? "The close back is not confirmed because that candle has not closed."
      : event.reclaimCandles == null
        ? "No completed close back."
        : event.reclaimCandles === 0
          ? "The same candle closed back through the level."
          : `The close back took ${event.reclaimCandles} candle${event.reclaimCandles === 1 ? "" : "s"}.`;
  const follow = event.followThrough
    ? "A later candle then traded through that reclaim candle. That follow-through is separate from the close back."
    : "No later candle has traded through the reclaim candle yet.";
  return `${event.touches} swing ${side}${event.touches === 1 ? "" : "s"} near ${event.level.toFixed(2)}. Price went ${verb} it to ${event.extreme.toFixed(2)} (${depth}) and then ${event.reclaimClosed ? `closed ${back}` : "is trading back through it"}. ${reclaim} ${follow} Classed as a ${event.tier} ${kind}. This score ranks the evidence. It is not a probability of profit.`;
}

type Built = Omit<LiqEvent, "tier" | "lowQuality" | "explanation" | "status"> & { status: LiqStatus };

function classify(row: Built, cfg: LiqConfig): LiqEvent {
  const depth = row.depthAtr;
  const shallow = depth != null && depth < cfg.minDepthAtr;
  const deep = depth != null && depth > cfg.maxDepthAtr * 1.25;
  let tier: LiqTier = "potential";
  let lowQuality = false;
  const reclaimed = row.status === "confirmed" && row.reclaimClosed;
  if (row.status === "invalidated" || row.status === "expired") {
    tier = "potential";
    lowQuality = true;
  } else if (row.status === "developing" || !row.reclaimClosed) tier = "developing";
  else if (reclaimed && row.score >= cfg.strongScore && depth != null && !shallow && !deep) tier = "strong";
  else if (row.score < cfg.potentialScore && !shallow) {
    tier = "potential";
    lowQuality = true;
  }
  const explanation = explain({
    direction: row.direction,
    pattern: row.pattern,
    touches: row.touches,
    level: row.level,
    extreme: row.extreme,
    depthPct: row.depthPct,
    depthAtr: row.depthAtr,
    reclaimCandles: row.reclaimCandles,
    status: row.status,
    tier,
    reclaimClosed: row.reclaimClosed,
    followThrough: row.followThrough,
  });
  return { ...row, tier, lowQuality, explanation };
}

function prominence(bars: ScanBar[], level: Level, from: number, to: number): number {
  let best = 0;
  const atr = atrAt(bars, to) || 0;
  for (let i = from; i <= to; i++) {
    const dist = level.kind === "low" ? bars[i].h - level.price : level.price - bars[i].l;
    if (atr > 0) best = Math.max(best, dist / atr);
  }
  return best;
}

function buildAt(args: {
  bars: ScanBar[];
  level: Level;
  pattern: LiqPattern;
  sweepIndex: number;
  reclaimIndex: number | null;
  forming: boolean;
  upto: number;
  cfg: LiqConfig;
}): Built | null {
  const { bars, level, pattern, sweepIndex, reclaimIndex, forming, upto, cfg } = args;
  const direction: LiqDirection = level.kind === "low" ? "bull" : "bear";
  const sweep = bars[sweepIndex];
  const extreme = direction === "bull" ? sweep.l : sweep.h;
  const ref = direction === "bull" ? level.low : level.high;
  const depth = direction === "bull" ? ref - extreme : extreme - ref;
  if (!(depth > 0)) return null;
  const atr = atrAt(bars, Math.max(1, sweepIndex - 1));
  const depthAtr = atr && atr > 0 ? depth / atr : null;
  const depthPct = ref > 0 ? (depth / ref) * 100 : 0;
  const reclaim = reclaimIndex != null ? bars[reclaimIndex] : null;
  const candles = reclaimIndex != null ? reclaimIndex - sweepIndex : null;
  const closedReclaim = reclaimIndex != null && (!forming || reclaimIndex < bars.length - 1);
  const developing = !closedReclaim;
  if (pattern === "sweep" && depthAtr != null && depthAtr > cfg.maxDepthAtr * 1.25) return null;
  const trust = volumeWindowTrust(bars, Math.max(0, sweepIndex - 20), reclaimIndex ?? sweepIndex);
  const avg = volAvg(bars, sweepIndex);
  const volNow = reclaim?.v ?? sweep.v;
  const volumeRatio = trust === "known" && avg && volNow != null ? volNow / avg : null;
  const volumeKnown = volumeRatio != null;
  const range = reclaim ? Math.max(1e-9, reclaim.h - reclaim.l) : 1;
  const body = reclaim ? Math.abs(reclaim.c - reclaim.o) / range : 0;
  const closePos = reclaim
    ? direction === "bull"
      ? (reclaim.c - reclaim.l) / range
      : (reclaim.h - reclaim.c) / range
    : 0;
  let confirmIndex: number | null = null;
  let confirmT: number | null = null;
  if (closedReclaim && reclaimIndex != null) {
    const gate = direction === "bull" ? bars[reclaimIndex].h : bars[reclaimIndex].l;
    for (let k = reclaimIndex + 1; k <= upto; k++) {
      if (forming && k === bars.length - 1) break;
      if (direction === "bull" && bars[k].h > gate) {
        confirmIndex = k;
        confirmT = bars[k].t;
        break;
      }
      if (direction === "bear" && bars[k].l < gate) {
        confirmIndex = k;
        confirmT = bars[k].t;
        break;
      }
    }
  }
  let invalidIndex: number | null = null;
  if (closedReclaim && reclaimIndex != null) {
    for (let k = reclaimIndex + 1; k <= upto; k++) {
      if (forming && k === bars.length - 1) break;
      if (direction === "bull" && bars[k].c < level.price) {
        invalidIndex = k;
        break;
      }
      if (direction === "bear" && bars[k].c > level.price) {
        invalidIndex = k;
        break;
      }
    }
  }
  const age = sweepIndex - level.last;
  const scored = scoreEvent({
    age,
    touches: level.touches.length,
    prominence: prominence(bars, level, level.last, sweepIndex),
    depthAtr,
    candles: candles ?? cfg.maxReclaim,
    body,
    closePos,
    volRatio: volumeRatio,
    volumeNeutral: trust === "neutral",
    followThrough: confirmIndex != null,
    cfg,
  });
  let status: LiqStatus = developing ? "developing" : "confirmed";
  if (!developing && invalidIndex != null) status = "invalidated";
  else if (!developing && reclaimIndex != null && upto - reclaimIndex > cfg.expiry) status = "expired";
  const id = `${pattern}|${direction}|${level.id}|${sweep.t}`;
  return {
    id,
    pattern,
    direction,
    status,
    level: level.price,
    zoneLow: level.low,
    zoneHigh: level.high,
    touches: level.touches.length,
    repeated: level.touches.length >= 2,
    swingIndex: level.last,
    sweepIndex,
    sweepT: sweep.t,
    extreme,
    depthPct,
    depthAtr,
    reclaimIndex,
    reclaimT: reclaim?.t ?? null,
    reclaimClose: reclaim?.c ?? null,
    reclaimCandles: candles,
    reclaimKind: candles == null ? null : reclaimKind(candles),
    volumeRatio,
    volumeKnown,
    volumeTrust: trust,
    score: scored.score,
    parts: scored.parts,
    weaknesses: scored.weaknesses,
    followThrough: confirmIndex != null,
    reclaimClosed: closedReclaim,
    confirmIndex,
    confirmT,
    invalidIndex,
    levelId: level.id,
  };
}

function findReclaim(bars: ScanBar[], level: Level, from: number, to: number, forming: boolean): { index: number; closed: boolean } | null {
  const bull = level.kind === "low";
  for (let j = from; j <= to; j++) {
    const back = bull ? bars[j].c > level.price : bars[j].c < level.price;
    if (!back) continue;
    const closed = !forming || j < bars.length - 1;
    return { index: j, closed };
  }
  return null;
}

/** One forward pass. Swings at index i exist only once i+right has closed. */
export function detectLiquidity(bars: ScanBar[], cfg: LiqConfig = DEFAULT_LIQ, forming = false): LiqEvent[] {
  if (bars.length < cfg.left + cfg.right + 2) return [];
  const upto = forming ? bars.length - 2 : bars.length - 1;
  if (upto < cfg.left + cfg.right) return [];
  const pivots = swings(bars, cfg.left, cfg.right, upto);
  const levels = cluster(pivots, bars, cfg);
  const events: LiqEvent[] = [];
  for (const level of levels) {
    if (!level.members.length) continue;
    const opened = levelAsOf(level, level.members[0].confirm);
    let cursor = Math.max(opened.confirm, opened.last + cfg.minAge);
    const limit = forming ? bars.length - 1 : upto;
    if (cursor > limit) continue;
    while (cursor <= limit) {
      const seen = levelAsOf(level, cursor);
      const ready = Math.max(seen.confirm, seen.last + cfg.minAge);
      if (cursor < ready) {
        cursor += 1;
        continue;
      }
      if (cursor - seen.first > cfg.maxLookback && cursor - seen.last > cfg.maxLookback) break;
      const bar = bars[cursor];
      const penetrated = seen.kind === "low" ? bar.l < seen.low : bar.h > seen.high;
      if (!penetrated) {
        cursor += 1;
        continue;
      }
      const sweepWindow = Math.min(limit, cursor + cfg.maxReclaim);
      const failedWindow = Math.min(limit, cursor + cfg.failedWindow);
      const sweepHit = findReclaim(bars, seen, cursor, sweepWindow, forming);
      const atr = atrAt(bars, Math.max(1, cursor - 1));
      const ref = seen.kind === "low" ? seen.low : seen.high;
      const extreme = seen.kind === "low" ? bar.l : bar.h;
      const depthAtr = atr && atr > 0 ? Math.abs(extreme - ref) / atr : null;
      const deep = depthAtr != null && depthAtr > cfg.maxDepthAtr * 1.25;
      if (sweepHit && !deep) {
        const row = buildAt({
          bars,
          level: seen,
          pattern: "sweep",
          sweepIndex: cursor,
          reclaimIndex: sweepHit.index,
          forming,
          upto: limit,
          cfg,
        });
        if (row) events.push(classify({ ...row, status: sweepHit.closed ? row.status : "developing" }, cfg));
        cursor = (sweepHit.index || cursor) + cfg.minAge;
        continue;
      }
      if (!sweepHit && forming && cursor === bars.length - 1) {
        const row = buildAt({
          bars,
          level: seen,
          pattern: deep ? "failed" : "sweep",
          sweepIndex: cursor,
          reclaimIndex: null,
          forming: true,
          upto: limit,
          cfg,
        });
        if (row) events.push(classify({ ...row, status: "developing" }, cfg));
        break;
      }
      const failedHit = findReclaim(bars, seen, cursor, failedWindow, forming);
      if (failedHit) {
        const row = buildAt({
          bars,
          level: seen,
          pattern: "failed",
          sweepIndex: cursor,
          reclaimIndex: failedHit.index,
          forming,
          upto: limit,
          cfg,
        });
        if (row) events.push(classify({ ...row, status: failedHit.closed ? row.status : "developing" }, cfg));
        cursor = failedHit.index + cfg.minAge;
        continue;
      }
      cursor = sweepWindow + 1;
    }
  }
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

export function activeSignals(events: LiqEvent[], pattern: LiqPattern | "both"): LiqEvent[] {
  const wanted = events.filter((event) => (pattern === "both" ? true : event.pattern === pattern) && event.status !== "invalidated" && event.status !== "expired");
  const byLevel = new Map<string, LiqEvent>();
  for (const event of wanted) {
    const key = `${event.pattern}|${event.levelId}`;
    const prev = byLevel.get(key);
    if (!prev || event.sweepIndex >= prev.sweepIndex) byLevel.set(key, event);
  }
  return [...byLevel.values()].sort((a, b) => b.score - a.score || b.sweepT - a.sweepT);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

function pushObs(bucket: number[], value: number, capped: { on: boolean }) {
  if (bucket.length >= OBS_CAP) {
    capped.on = true;
    return;
  }
  bucket.push(value);
}

function emptyIncomplete() {
  return { c1: 0, c3: 0, c5: 0, c8: 0 };
}

function packStats(
  pattern: LiqPattern,
  direction: LiqDirection,
  n: number,
  invalidated: number,
  obs: ForwardObs,
  capped: boolean,
  extra?: Partial<Pick<ForwardStats, "quality" | "symbols" | "incomplete" | "overlapping" | "independentN" | "fromT" | "toT" | "excessAvg" | "excessSamples">>,
): ForwardStats {
  const samples = {
    c1: obs.c1.length,
    c3: obs.c3.length,
    c5: obs.c5.length,
    c8: obs.c8.length,
    mfe: obs.mfe.length,
    mae: obs.mae.length,
  };
  const medianRow = {
    c1: median(obs.c1),
    c3: median(obs.c3),
    c5: median(obs.c5),
    c8: median(obs.c8),
    mfe: median(obs.mfe),
    mae: median(obs.mae),
  };
  return {
    pattern,
    direction,
    n,
    samples,
    avg: { c1: avg(obs.c1), c3: avg(obs.c3), c5: avg(obs.c5), c8: avg(obs.c8) },
    median: medianRow,
    withForward: samples.c1,
    medianMfe: medianRow.mfe,
    medianMae: medianRow.mae,
    invalidated,
    capped,
    obs,
    quality: extra?.quality,
    symbols: extra?.symbols,
    incomplete: extra?.incomplete,
    overlapping: extra?.overlapping,
    independentN: extra?.independentN,
    fromT: extra?.fromT,
    toT: extra?.toT,
    excessAvg: extra?.excessAvg,
    excessSamples: extra?.excessSamples,
  };
}

function nearestBench(bench: ScanBar[], t: number, slack: number): ScanBar | null {
  let best: ScanBar | null = null;
  let gap = slack + 1;
  for (const bar of bench) {
    const d = Math.abs(bar.t - t);
    if (d < gap) {
      gap = d;
      best = bar;
    }
  }
  return gap <= slack ? best : null;
}

/** Forward excursion uses only candles after the reclaim. Each horizon keeps its own sample. Strong and Potential are not pooled together. */
export function forwardStats(events: LiqEvent[], bars: ScanBar[], opts?: { symbol?: string; bench?: ScanBar[] }): ForwardStats[] {
  const groups = new Map<string, LiqEvent[]>();
  for (const event of events) {
    if (event.status === "developing" || event.reclaimIndex == null || !event.reclaimClosed) continue;
    const quality = event.tier === "strong" ? "strong" : "potential";
    const key = `${event.pattern}|${event.direction}|${quality}`;
    const list = groups.get(key) || [];
    list.push(event);
    groups.set(key, list);
  }
  const slack = bars.length > 2 ? Math.max(1, bars[1].t - bars[0].t) : 86400;
  const out: ForwardStats[] = [];
  for (const [key, list] of groups) {
    const [pattern, direction, quality] = key.split("|") as [LiqPattern, LiqDirection, "strong" | "potential"];
    const obs = emptyObs();
    const indep = emptyObs();
    const excess = emptyObs();
    const capped = { on: false };
    const incomplete = emptyIncomplete();
    const benchMatched = emptyIncomplete();
    const benchUnmatched = emptyIncomplete();
    let invalidated = 0;
    let fromT: number | null = null;
    let toT: number | null = null;
    const firstByLevel = new Map<string, LiqEvent>();
    for (const event of list) {
      const prev = firstByLevel.get(event.levelId);
      if (!prev || event.sweepIndex < prev.sweepIndex) firstByLevel.set(event.levelId, event);
    }
    const overlapping = list.length - firstByLevel.size;
    for (const event of list) {
      if (event.invalidIndex != null && event.reclaimIndex != null && event.invalidIndex > event.reclaimIndex) invalidated += 1;
      const i = event.reclaimIndex as number;
      const base = bars[i]?.c;
      if (!(base > 0)) continue;
      if (fromT == null || bars[i].t < fromT) fromT = bars[i].t;
      const sign = direction === "bull" ? 1 : -1;
      const independent = firstByLevel.get(event.levelId) === event;
      const take = (step: number, bucket: number[], indepBucket: number[], hole: keyof typeof incomplete, excessBucket: number[]) => {
        if (event.invalidIndex != null && event.invalidIndex <= i + step) return;
        const bar = bars[i + step];
        if (!bar) {
          incomplete[hole] += 1;
          return;
        }
        if (toT == null || bar.t > toT) toT = bar.t;
        const stock = sign * ((bar.c / base - 1) * 100);
        pushObs(bucket, stock, capped);
        if (independent) pushObs(indepBucket, stock, capped);
        const b0 = opts?.bench ? nearestBench(opts.bench, bars[i].t, slack) : null;
        const b1 = opts?.bench ? nearestBench(opts.bench, bar.t, slack) : null;
        if (b0 && b1 && b0.c > 0 && b1.c > 0) {
          pushObs(excessBucket, stock - sign * ((b1.c / b0.c - 1) * 100), capped);
          benchMatched[hole] += 1;
        } else benchUnmatched[hole] += 1;
      };
      take(1, obs.c1, indep.c1, "c1", excess.c1);
      take(3, obs.c3, indep.c3, "c3", excess.c3);
      take(5, obs.c5, indep.c5, "c5", excess.c5);
      take(8, obs.c8, indep.c8, "c8", excess.c8);
      let fav = 0;
      let adv = 0;
      let any = false;
      const blocked = event.invalidIndex != null;
      for (let k = 1; k <= 8 && i + k < bars.length; k++) {
        if (blocked && event.invalidIndex != null && event.invalidIndex <= i + k) break;
        any = true;
        const up = ((bars[i + k].h / base - 1) * 100) * sign;
        const dn = ((bars[i + k].l / base - 1) * 100) * sign;
        fav = Math.max(fav, up, dn);
        adv = Math.min(adv, up, dn);
      }
      if (any) {
        pushObs(obs.mfe, fav, capped);
        pushObs(obs.mae, adv, capped);
        if (independent) {
          pushObs(indep.mfe, fav, capped);
          pushObs(indep.mae, adv, capped);
        }
      }
    }
    const row = packStats(pattern, direction, list.length, invalidated, obs, capped.on, {
      quality,
      symbols: opts?.symbol ? [opts.symbol] : [],
      incomplete,
      overlapping,
      independentN: firstByLevel.size,
      fromT,
      toT,
      excessAvg: { c1: avg(excess.c1), c3: avg(excess.c3), c5: avg(excess.c5), c8: avg(excess.c8) },
      excessSamples: { c1: excess.c1.length, c3: excess.c3.length, c5: excess.c5.length, c8: excess.c8.length },
    });
    row.indepObs = indep;
    row.excessObs = excess;
    row.benchMatched = benchMatched;
    row.benchUnmatched = benchUnmatched;
    row.indepMedian = { c1: median(indep.c1), c3: median(indep.c3), c5: median(indep.c5), c8: median(indep.c8) };
    out.push(row);
  }
  return out;
}

function concatObs(parts: ForwardObs[]): ForwardObs {
  const out = emptyObs();
  const capped = { on: false };
  for (const part of parts) {
    for (const key of ["c1", "c3", "c5", "c8", "mfe", "mae"] as const) {
      for (const value of part[key] || []) pushObs(out[key], value, capped);
    }
  }
  return out;
}

/** Pools the individual observations. A median of per-name medians is not used. Strong and Potential stay apart. */
export function mergeStats(parts: ForwardStats[]): ForwardStats[] {
  const map = new Map<string, { pattern: LiqPattern; direction: LiqDirection; quality?: "strong" | "potential"; n: number; invalidated: number; obs: ForwardObs[]; indep: ForwardObs[]; capped: boolean; symbols: Set<string>; incomplete: { c1: number; c3: number; c5: number; c8: number }; overlapping: number; independentN: number; fromT: number | null; toT: number | null; excess: ForwardObs[]; benchMatched: { c1: number; c3: number; c5: number; c8: number }; benchUnmatched: { c1: number; c3: number; c5: number; c8: number } }>();
  for (const row of parts) {
    const key = `${row.pattern}|${row.direction}|${row.quality || "all"}`;
    const cur = map.get(key) || {
      pattern: row.pattern,
      direction: row.direction,
      quality: row.quality,
      n: 0,
      invalidated: 0,
      obs: [],
      indep: [],
      capped: false,
      symbols: new Set<string>(),
      incomplete: emptyIncomplete(),
      overlapping: 0,
      independentN: 0,
      fromT: null,
      toT: null,
      excess: [],
      benchMatched: emptyIncomplete(),
      benchUnmatched: emptyIncomplete(),
    };
    cur.n += row.n;
    cur.invalidated += row.invalidated;
    cur.capped = cur.capped || row.capped === true;
    cur.overlapping += row.overlapping || 0;
    cur.independentN += row.independentN || 0;
    if (row.incomplete) {
      cur.incomplete.c1 += row.incomplete.c1;
      cur.incomplete.c3 += row.incomplete.c3;
      cur.incomplete.c5 += row.incomplete.c5;
      cur.incomplete.c8 += row.incomplete.c8;
    }
    if (row.benchMatched) {
      cur.benchMatched.c1 += row.benchMatched.c1;
      cur.benchMatched.c3 += row.benchMatched.c3;
      cur.benchMatched.c5 += row.benchMatched.c5;
      cur.benchMatched.c8 += row.benchMatched.c8;
    }
    if (row.benchUnmatched) {
      cur.benchUnmatched.c1 += row.benchUnmatched.c1;
      cur.benchUnmatched.c3 += row.benchUnmatched.c3;
      cur.benchUnmatched.c5 += row.benchUnmatched.c5;
      cur.benchUnmatched.c8 += row.benchUnmatched.c8;
    }
    if (row.fromT != null && (cur.fromT == null || row.fromT < cur.fromT)) cur.fromT = row.fromT;
    if (row.toT != null && (cur.toT == null || row.toT > cur.toT)) cur.toT = row.toT;
    for (const symbol of row.symbols || []) cur.symbols.add(symbol);
    if (row.obs) cur.obs.push(row.obs);
    if (row.indepObs) cur.indep.push(row.indepObs);
    if (row.excessObs) cur.excess.push(row.excessObs);
    map.set(key, cur);
  }
  return [...map.values()].map((row) => {
    const obs = concatObs(row.obs);
    const capped = row.capped || Object.values(obs).some((bucket) => bucket.length >= OBS_CAP);
    const packed = packStats(row.pattern, row.direction, row.n, row.invalidated, obs, capped, {
      quality: row.quality,
      symbols: [...row.symbols],
      incomplete: row.incomplete,
      overlapping: row.overlapping,
      independentN: row.independentN,
      fromT: row.fromT,
      toT: row.toT,
    });
    packed.indepObs = concatObs(row.indep);
    const excess = concatObs(row.excess);
    packed.excessObs = excess;
    packed.excessAvg = { c1: avg(excess.c1), c3: avg(excess.c3), c5: avg(excess.c5), c8: avg(excess.c8) };
    packed.excessSamples = { c1: excess.c1.length, c3: excess.c3.length, c5: excess.c5.length, c8: excess.c8.length };
    packed.benchMatched = row.benchMatched;
    packed.benchUnmatched = row.benchUnmatched;
    packed.indepMedian = { c1: median(packed.indepObs.c1), c3: median(packed.indepObs.c3), c5: median(packed.indepObs.c5), c8: median(packed.indepObs.c8) };
    return packed;
  });
}

export type ReplayLeak = { id: string; reason: string };
export type ReplayGone = { id: string; reason: string };

/** Why an id that was present on one prefix is absent on the next. */
export function disappearedEvents(prev: LiqEvent[], next: LiqEvent[]): ReplayGone[] {
  const ids = new Set(next.map((event) => event.id));
  const gone: ReplayGone[] = [];
  for (const event of prev) {
    if (ids.has(event.id)) continue;
    const moved = next.find((row) => row.sweepT === event.sweepT && row.direction === event.direction && row.pattern === event.pattern);
    let reason: string;
    if (!event.reclaimClosed || event.status === "developing") {
      reason = "The unfinished signal dropped once that candle closed without a reclaim.";
    } else if (moved && moved.level !== event.level) {
      reason = "A later swing joined the level and the historical price was rewritten under a new id.";
    } else if (moved) {
      reason = "The same sweep came back under a different id.";
    } else {
      reason = "A signal that had already closed was missing on the next prefix.";
    }
    gone.push({ id: event.id, reason });
  }
  return gone;
}

/**
 * Walk the tape forward. A swing, a closed reclaim, and a follow-through may each appear
 * only on a prefix that already contains the candle that made them true.
 */
export function replayNoLookahead(bars: ScanBar[], cfg: LiqConfig = DEFAULT_LIQ): { checked: number; leaks: ReplayLeak[] } {
  const leaks: ReplayLeak[] = [];
  const full = detectLiquidity(bars, cfg, false);
  let checked = 0;
  for (const event of full) {
    if (event.reclaimIndex == null) continue;
    checked += 1;
    const beforeSwing = detectLiquidity(bars.slice(0, event.swingIndex + cfg.right), cfg, false);
    if (beforeSwing.some((row) => row.id === event.id)) {
      leaks.push({ id: event.id, reason: "signal appeared before the swing's right-hand candles closed" });
    }
    const beforeReclaim = detectLiquidity(bars.slice(0, event.reclaimIndex), cfg, false);
    if (beforeReclaim.some((row) => row.id === event.id && row.reclaimClosed)) {
      leaks.push({ id: event.id, reason: "closed reclaim appeared before the reclaim candle" });
    }
    if (event.confirmIndex != null) {
      const beforeFollow = detectLiquidity(bars.slice(0, event.confirmIndex), cfg, false);
      const row = beforeFollow.find((item) => item.id === event.id);
      if (row?.followThrough) leaks.push({ id: event.id, reason: "follow-through appeared before its candle" });
      const atFollow = detectLiquidity(bars.slice(0, event.confirmIndex + 1), cfg, false).find((item) => item.id === event.id);
      if (event.followThrough && atFollow && !atFollow.followThrough) {
        leaks.push({ id: event.id, reason: "follow-through missing on the candle that should have produced it" });
      }
    }
    const atReclaim = detectLiquidity(bars.slice(0, event.reclaimIndex + 1), cfg, false).find((row) => row.id === event.id);
    if (event.reclaimClosed && event.status !== "developing" && atReclaim && !atReclaim.reclaimClosed && event.confirmIndex == null) {
      leaks.push({ id: event.id, reason: "reclaim did not close on its own candle" });
    }
  }
  return { checked, leaks };
}

/**
 * Every closed prefix, not only the candles that ended up inside a signal.
 * A forming read of the same prefix must not close a reclaim or a follow-through on the live bar.
 */
export function replayEveryPrefix(bars: ScanBar[], cfg: LiqConfig = DEFAULT_LIQ): { prefixes: number; leaks: ReplayLeak[]; gone: ReplayGone[] } {
  const leaks: ReplayLeak[] = [];
  const gone: ReplayGone[] = [];
  const prior = new Map<string, LiqEvent>();
  const start = Math.min(bars.length, cfg.left + cfg.right);
  for (let end = start; end < bars.length; end++) {
    const prefix = bars.slice(0, end + 1);
    const closed = detectLiquidity(prefix, cfg, false);
    const live = detectLiquidity(prefix, cfg, true);
    const lost = disappearedEvents([...prior.values()], closed);
    for (const row of lost) {
      gone.push(row);
      const prev = prior.get(row.id);
      if (prev && prev.reclaimClosed && prev.status !== "developing") leaks.push(row);
      prior.delete(row.id);
    }
    for (const event of closed) {
      if (event.swingIndex + cfg.right > end) leaks.push({ id: event.id, reason: "swing used before its right-hand candles closed" });
      if (event.reclaimClosed && (event.reclaimIndex == null || event.reclaimIndex > end)) leaks.push({ id: event.id, reason: "reclaim closed after the prefix" });
      if (event.followThrough && (event.confirmIndex == null || event.confirmIndex > end)) leaks.push({ id: event.id, reason: "follow-through used a future candle" });
      if (event.invalidIndex != null && event.invalidIndex > end) leaks.push({ id: event.id, reason: "invalidation used a future candle" });
      if (event.status === "expired" && event.reclaimIndex != null && end - event.reclaimIndex <= cfg.expiry) {
        leaks.push({ id: event.id, reason: "expired before the reclaim life had elapsed" });
      }
      const prev = prior.get(event.id);
      if (prev) {
        if (prev.extreme !== event.extreme || prev.sweepIndex !== event.sweepIndex || prev.level !== event.level) {
          leaks.push({ id: event.id, reason: "a later candle rewrote the sweep" });
        }
        if (prev.reclaimClosed && prev.reclaimIndex !== event.reclaimIndex) leaks.push({ id: event.id, reason: "a later candle rewrote the reclaim" });
        if (prev.followThrough && event.confirmIndex !== prev.confirmIndex) leaks.push({ id: event.id, reason: "follow-through moved after it had already printed" });
      }
      prior.set(event.id, event);
    }
    for (const event of live) {
      if (event.reclaimIndex === end && event.reclaimClosed) leaks.push({ id: event.id, reason: "the live bar was treated as a closed reclaim" });
      if (event.confirmIndex === end && event.followThrough) leaks.push({ id: event.id, reason: "the live bar was treated as follow-through" });
    }
  }
  return { prefixes: Math.max(0, bars.length - start), leaks, gone };
}

export type ScanCursorPlan = { action: "scan"; cursor: number } | { action: "use-saved" } | { action: "replace-with-saved" };

/** Where the next batch starts. A stored cursor wins over a client that is behind. */
export function planScanCursor(
  saved: { done: boolean; cursorAt: number } | null,
  requested: number,
  fresh: boolean,
): ScanCursorPlan {
  if (fresh && requested === 0) return { action: "scan", cursor: 0 };
  if (!saved) return { action: "scan", cursor: Math.max(0, requested) };
  if (saved.done && requested === 0 && !fresh) return { action: "use-saved" };
  if (!saved.done && requested < saved.cursorAt) return { action: "replace-with-saved" };
  if (!saved.done) return { action: "scan", cursor: saved.cursorAt };
  return { action: "scan", cursor: Math.max(0, requested) };
}

/** Finished only when every listed name was scanned or explicitly skipped. */
export function scanIsComplete(universeSize: number, scannedN: number, skippedN: number, cursor: number | null): boolean {
  if (cursor != null) return false;
  if (universeSize <= 0) return scannedN + skippedN === 0;
  return scannedN + skippedN >= universeSize;
}

export type ScanProgress = { scannedN: number; skippedN: number; cursorAt: number; done: boolean };

/** Apply one page onto a saved cursor. A fresh page (from 0) replaces the counts. A later page must not mark the book finished early. */
export function reduceScanState(
  prev: { scannedN: number; skippedN: number },
  page: { scanned: number; skipped: number; cursor: number | null; universeSize: number },
  fromCursor: number,
): ScanProgress {
  const scannedN = (fromCursor === 0 ? 0 : prev.scannedN) + page.scanned;
  const skippedN = (fromCursor === 0 ? 0 : prev.skippedN) + page.skipped;
  return {
    scannedN,
    skippedN,
    cursorAt: page.cursor ?? page.universeSize,
    done: scanIsComplete(page.universeSize, scannedN, skippedN, page.cursor),
  };
}

/** One scan of a cache key at a time. A thrown scan still lets the next one start. */
export function createScanGate() {
  const tails = new Map<string, Promise<unknown>>();
  return function withGate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const prev = tails.get(key) ?? Promise.resolve();
    const run = prev.then(fn, fn);
    tails.set(key, run.then(() => undefined, () => undefined));
    return run;
  };
}
