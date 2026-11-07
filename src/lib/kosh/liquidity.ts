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
  expiry: 30,
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
  score: number;
  parts: { swing: number; sweep: number; reclaim: number; volume: number; candle: number; confirm: number };
  weaknesses: string[];
  confirmIndex: number | null;
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
  n: number;
  withForward: number;
  avg: { c1: number | null; c3: number | null; c5: number | null; c8: number | null };
  medianMfe: number | null;
  medianMae: number | null;
  invalidated: number;
};

const IST = 19800;
const OPEN = 9 * 3600 + 15 * 60;
const CLOSE = 15 * 3600 + 30 * 60;
const SPLIT = 13 * 3600 + 15 * 60;

function istParts(t: number) {
  const shifted = t + IST;
  const day = Math.floor(shifted / 86400);
  return { day, sod: shifted - day * 86400 };
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
      if (bar.v != null) cur.v = (cur.v || 0) + bar.v;
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.t - b.t)
    .map((b) => ({ t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v || 0 }));
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
  confirmed: boolean;
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

  let volume = 8;
  if (input.volRatio == null) {
    weaknesses.push("Volume was not on this series, so it was not used as a reason to drop the setup.");
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
  const confirm = input.confirmed ? 10 : 0;
  if (!input.confirmed) weaknesses.push("Price has not yet broken the reclaim candle.");
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
}): string {
  const side = event.direction === "bull" ? "low" : "high";
  const verb = event.direction === "bull" ? "under" : "over";
  const back = event.direction === "bull" ? "back above" : "back below";
  const kind = event.pattern === "sweep" ? "liquidity sweep" : "failed break";
  const depth = event.depthAtr != null ? `${event.depthPct.toFixed(2)}% (${event.depthAtr.toFixed(2)} ATR)` : `${event.depthPct.toFixed(2)}%`;
  const reclaim =
    event.status === "developing"
      ? "The reclaim is not confirmed because that candle has not closed."
      : event.reclaimCandles == null
        ? "No completed reclaim."
        : event.reclaimCandles === 0
          ? "The same candle reclaimed the level."
          : `Reclaim took ${event.reclaimCandles} candle${event.reclaimCandles === 1 ? "" : "s"}.`;
  return `${event.touches} swing ${side}${event.touches === 1 ? "" : "s"} near ${event.level.toFixed(2)}. Price went ${verb} it to ${event.extreme.toFixed(2)} (${depth}) and then ${event.status === "developing" ? "is trading back through it" : `closed ${back}`}. ${reclaim} Classed as a ${event.tier} ${kind}. This score ranks the evidence. It is not a probability of profit.`;
}

type Built = Omit<LiqEvent, "tier" | "lowQuality" | "explanation" | "status"> & { status: LiqStatus };

function classify(row: Built, cfg: LiqConfig): LiqEvent {
  const shallow = row.weaknesses.some((w) => w.startsWith("The sweep is shallower"));
  const deep = row.weaknesses.some((w) => w.includes("breakdown"));
  let tier: LiqTier = "potential";
  let lowQuality = false;
  if (row.status === "developing") tier = "developing";
  else if (row.status === "confirmed" && row.score >= cfg.strongScore && !deep) tier = "strong";
  else if (row.score >= cfg.potentialScore || (shallow && row.score >= 40 && !deep)) tier = "potential";
  else {
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
  const range = reclaim ? Math.max(1e-9, reclaim.h - reclaim.l) : 1;
  const body = reclaim ? Math.abs(reclaim.c - reclaim.o) / range : 0;
  const closePos = reclaim
    ? direction === "bull"
      ? (reclaim.c - reclaim.l) / range
      : (reclaim.h - reclaim.c) / range
    : 0;
  let confirmIndex: number | null = null;
  if (closedReclaim && reclaimIndex != null) {
    const gate = direction === "bull" ? bars[reclaimIndex].h : bars[reclaimIndex].l;
    for (let k = reclaimIndex + 1; k <= upto; k++) {
      if (forming && k === bars.length - 1) break;
      if (direction === "bull" && bars[k].h > gate) {
        confirmIndex = k;
        break;
      }
      if (direction === "bear" && bars[k].l < gate) {
        confirmIndex = k;
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
    confirmed: confirmIndex != null,
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
    score: scored.score,
    parts: scored.parts,
    weaknesses: scored.weaknesses,
    confirmIndex,
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

/** Forward excursion uses only candles after the reclaim. It is a measurement, not a forecast. */
export function forwardStats(events: LiqEvent[], bars: ScanBar[]): ForwardStats[] {
  const groups = new Map<string, LiqEvent[]>();
  for (const event of events) {
    if (event.status === "developing" || event.reclaimIndex == null) continue;
    const key = `${event.pattern}|${event.direction}`;
    const list = groups.get(key) || [];
    list.push(event);
    groups.set(key, list);
  }
  const out: ForwardStats[] = [];
  for (const [key, list] of groups) {
    const [pattern, direction] = key.split("|") as [LiqPattern, LiqDirection];
    const c1: number[] = [];
    const c3: number[] = [];
    const c5: number[] = [];
    const c8: number[] = [];
    const mfe: number[] = [];
    const mae: number[] = [];
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
        bucket.push(sign * ((bar.c / base - 1) * 100));
      };
      take(1, c1);
      take(3, c3);
      take(5, c5);
      take(8, c8);
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
        mfe.push(fav);
        mae.push(adv);
      }
    }
    out.push({
      pattern,
      direction,
      n: list.length,
      withForward: c1.length,
      avg: { c1: avg(c1), c3: avg(c3), c5: avg(c5), c8: avg(c8) },
      medianMfe: median(mfe),
      medianMae: median(mae),
      invalidated,
    });
  }
  return out;
}

export function mergeStats(parts: ForwardStats[]): ForwardStats[] {
  const map = new Map<string, { pattern: LiqPattern; direction: LiqDirection; n: number; withForward: number; invalidated: number; c1: number; c1n: number; c3: number; c3n: number; c5: number; c5n: number; c8: number; c8n: number; mfe: number[]; mae: number[] }>();
  for (const row of parts) {
    const key = `${row.pattern}|${row.direction}`;
    const cur = map.get(key) || { pattern: row.pattern, direction: row.direction, n: 0, withForward: 0, invalidated: 0, c1: 0, c1n: 0, c3: 0, c3n: 0, c5: 0, c5n: 0, c8: 0, c8n: 0, mfe: [], mae: [] };
    cur.n += row.n;
    cur.withForward += row.withForward;
    cur.invalidated += row.invalidated;
    const w = Math.max(1, row.withForward);
    if (row.avg.c1 != null) { cur.c1 += row.avg.c1 * w; cur.c1n += w; }
    if (row.avg.c3 != null) { cur.c3 += row.avg.c3 * w; cur.c3n += w; }
    if (row.avg.c5 != null) { cur.c5 += row.avg.c5 * w; cur.c5n += w; }
    if (row.avg.c8 != null) { cur.c8 += row.avg.c8 * w; cur.c8n += w; }
    if (row.medianMfe != null) cur.mfe.push(row.medianMfe);
    if (row.medianMae != null) cur.mae.push(row.medianMae);
    map.set(key, cur);
  }
  return [...map.values()].map((row) => ({
    pattern: row.pattern,
    direction: row.direction,
    n: row.n,
    withForward: row.withForward,
    invalidated: row.invalidated,
    avg: {
      c1: row.c1n ? row.c1 / row.c1n : null,
      c3: row.c3n ? row.c3 / row.c3n : null,
      c5: row.c5n ? row.c5 / row.c5n : null,
      c8: row.c8n ? row.c8 / row.c8n : null,
    },
    medianMfe: median(row.mfe),
    medianMae: median(row.mae),
  }));
}
