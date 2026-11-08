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

export type ScanBar = { t: number; o: number; h: number; l: number; c: number; v: number | null };

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
    bars.push({ t: bar.t, o, h, l, c, v });
  }
  return { bars, dropped, volumeKnown: bars.some((b) => b.v != null), adjusted: usedAdj };
}

/** Fold hourly (or finer) prints into IST session 4-hour bars. The afternoon bar ends at 15:30 and is shorter. */
export function foldSession4h(input: OhlcBar[]): OhlcBar[] {
  const prepared = prepareBars(input, true).bars;
  const groups = new Map<string, ScanBar>();
  for (const bar of prepared) {
    const { day, sod } = istParts(bar.t);
    if (sod < OPEN || sod > CLOSE) continue;
    const slot = sod < SPLIT ? 0 : 1;
    const key = `${day}:${slot}`;
    const cur = groups.get(key);
    if (!cur) groups.set(key, { ...bar });
    else {
      cur.h = Math.max(cur.h, bar.h);
      cur.l = Math.min(cur.l, bar.l);
      cur.c = bar.c;
      if (bar.v != null) cur.v = (cur.v ?? 0) + bar.v;
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.t - b.t)
    .map((b) => ({ t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v == null ? 0 : b.v }));
}

const MORNING_LAST = 12 * 3600 + 15 * 60;
const AFTER_LAST = 15 * 3600 + 15 * 60;

/** The last 4-hour slot is unfinished when the clock is still inside it, or the tape stopped before that slot's last hour and nothing followed. */
export function session4hTailOpen(input: OhlcBar[], now = Date.now()): boolean {
  const prepared = prepareBars(input, true).bars.filter((bar) => {
    const { sod } = istParts(bar.t);
    return sod >= OPEN && sod <= CLOSE;
  });
  if (!prepared.length) return false;
  const last = prepared[prepared.length - 1];
  const { day, sod } = istParts(last.t);
  const morning = sod < SPLIT;
  const slotEnd = morning ? SPLIT : CLOSE;
  const nowIst = istParts(Math.floor(now / 1000));
  if (nowIst.day === day && nowIst.sod >= OPEN && nowIst.sod <= slotEnd) return true;
  const need = morning ? MORNING_LAST : AFTER_LAST;
  const reached = prepared.some((bar) => {
    const part = istParts(bar.t);
    if (part.day !== day) return false;
    return morning ? part.sod >= need && part.sod < SPLIT : part.sod >= need && part.sod <= CLOSE;
  });
  if (reached) return false;
  const later = prepared.some((bar) => {
    const part = istParts(bar.t);
    return part.day > day || (morning && part.day === day && part.sod >= SPLIT);
  });
  return !later;
}

/** Keep prints inside the cash session. Does not invent the missing ones. */
export function sessionOnly(input: OhlcBar[]): OhlcBar[] {
  return input.filter((bar) => {
    if (!Number.isFinite(bar.t)) return false;
    const { sod } = istParts(bar.t);
    return sod >= OPEN && sod <= CLOSE;
  });
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
      id: `${seed.kind}:${seed.index}:${members.length}`,
      kind: seed.kind,
      price,
      low,
      high,
      anchor: seed.price,
      touches: members.map((m) => m.index),
      confirm: Math.max(...members.map((m) => m.confirm)),
      first: seed.index,
      last: last.index,
    });
  }
  return levels;
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
    weaknesses.push("Volume was missing, so it scored 0 and was not used as a reason to drop the setup.");
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
  const avg = volAvg(bars, sweepIndex);
  const volNow = reclaim?.v ?? sweep.v;
  const volumeRatio = avg && volNow != null ? volNow / avg : null;
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
    const eligible = Math.max(level.confirm, level.last + cfg.minAge);
    if (eligible > (forming ? bars.length - 1 : upto)) continue;
    let cursor = eligible;
    const limit = forming ? bars.length - 1 : upto;
    while (cursor <= limit) {
      if (cursor - level.first > cfg.maxLookback && cursor - level.last > cfg.maxLookback) break;
      const bar = bars[cursor];
      const penetrated = level.kind === "low" ? bar.l < level.low : bar.h > level.high;
      if (!penetrated) {
        cursor += 1;
        continue;
      }
      const sweepWindow = Math.min(limit, cursor + cfg.maxReclaim);
      const failedWindow = Math.min(limit, cursor + cfg.failedWindow);
      const sweepHit = findReclaim(bars, level, cursor, sweepWindow, forming);
      const atr = atrAt(bars, Math.max(1, cursor - 1));
      const ref = level.kind === "low" ? level.low : level.high;
      const extreme = level.kind === "low" ? bar.l : bar.h;
      const depthAtr = atr && atr > 0 ? Math.abs(extreme - ref) / atr : null;
      const deep = depthAtr != null && depthAtr > cfg.maxDepthAtr * 1.25;
      if (sweepHit && !deep) {
        const row = buildAt({
          bars,
          level,
          pattern: "sweep",
          sweepIndex: cursor,
          reclaimIndex: sweepHit.closed ? sweepHit.index : sweepHit.index,
          forming: forming && !sweepHit.closed,
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
          level,
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
      const failedHit = findReclaim(bars, level, cursor, failedWindow, forming);
      if (failedHit) {
        const row = buildAt({
          bars,
          level,
          pattern: "failed",
          sweepIndex: cursor,
          reclaimIndex: failedHit.index,
          forming: forming && !failedHit.closed,
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

function packStats(pattern: LiqPattern, direction: LiqDirection, n: number, invalidated: number, obs: ForwardObs, capped: boolean): ForwardStats {
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
  };
}

/** Forward excursion uses only candles after the reclaim. Each horizon keeps its own sample. */
export function forwardStats(events: LiqEvent[], bars: ScanBar[]): ForwardStats[] {
  const groups = new Map<string, LiqEvent[]>();
  for (const event of events) {
    if (event.status === "developing" || event.reclaimIndex == null || !event.reclaimClosed) continue;
    const key = `${event.pattern}|${event.direction}`;
    const list = groups.get(key) || [];
    list.push(event);
    groups.set(key, list);
  }
  const out: ForwardStats[] = [];
  for (const [key, list] of groups) {
    const [pattern, direction] = key.split("|") as [LiqPattern, LiqDirection];
    const obs = emptyObs();
    const capped = { on: false };
    let invalidated = 0;
    for (const event of list) {
      if (event.invalidIndex != null && event.reclaimIndex != null && event.invalidIndex - event.reclaimIndex <= 8) invalidated += 1;
      const i = event.reclaimIndex as number;
      const base = bars[i]?.c;
      if (!(base > 0)) continue;
      const sign = direction === "bull" ? 1 : -1;
      const take = (step: number, bucket: number[]) => {
        const bar = bars[i + step];
        if (!bar) return;
        pushObs(bucket, sign * ((bar.c / base - 1) * 100), capped);
      };
      take(1, obs.c1);
      take(3, obs.c3);
      take(5, obs.c5);
      take(8, obs.c8);
      let fav = 0;
      let adv = 0;
      let any = false;
      for (let k = 1; k <= 8 && i + k < bars.length; k++) {
        any = true;
        const up = ((bars[i + k].h / base - 1) * 100) * sign;
        const dn = ((bars[i + k].l / base - 1) * 100) * sign;
        fav = Math.max(fav, up, dn);
        adv = Math.min(adv, up, dn);
      }
      if (any) {
        pushObs(obs.mfe, fav, capped);
        pushObs(obs.mae, adv, capped);
      }
    }
    out.push(packStats(pattern, direction, list.length, invalidated, obs, capped.on));
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

/** Pools the individual observations. A median of per-name medians is not used. */
export function mergeStats(parts: ForwardStats[]): ForwardStats[] {
  const map = new Map<string, { pattern: LiqPattern; direction: LiqDirection; n: number; invalidated: number; obs: ForwardObs[]; capped: boolean }>();
  for (const row of parts) {
    const key = `${row.pattern}|${row.direction}`;
    const cur = map.get(key) || { pattern: row.pattern, direction: row.direction, n: 0, invalidated: 0, obs: [], capped: false };
    cur.n += row.n;
    cur.invalidated += row.invalidated;
    cur.capped = cur.capped || row.capped === true;
    if (row.obs) cur.obs.push(row.obs);
    map.set(key, cur);
  }
  return [...map.values()].map((row) => {
    const obs = concatObs(row.obs);
    const capped = row.capped || Object.values(obs).some((bucket) => bucket.length >= OBS_CAP);
    return packStats(row.pattern, row.direction, row.n, row.invalidated, obs, capped);
  });
}

export type ReplayLeak = { id: string; reason: string };

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
