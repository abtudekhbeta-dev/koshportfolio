/** Thin wrapper over the existing quote/OHLC poll. No second provider. */

import type { OhlcBar, Quote } from "./types.ts";
import { resample } from "./ohlc.ts";

const IST = 19800;

export type QuoteStatus = "session" | "last" | "off";

export function quoteStatus(input: {
  session: boolean;
  price?: number | null;
  retrievedAt?: number | null;
  now?: number;
}): QuoteStatus {
  if (!(Number(input.price) > 0)) return "off";
  if (input.session) return "session";
  return "last";
}

export function quoteStatusLabel(status: QuoteStatus): string {
  if (status === "session") return "SESSION · DELAYED";
  if (status === "last") return "LAST AVAILABLE";
  return "UNAVAILABLE";
}

/** Quotes are delayed. Do not describe this feed as live. */
export const MARKET_PROVIDER = {
  id: "yahoo",
  name: "Yahoo Finance",
  delay: "delayed" as const,
  note: "Delayed print. Not a licensed live Indian feed.",
};

export type TermInterval = {
  id: string;
  label: string;
  yahoo: string;
  range: string;
  intra: boolean;
  /** Seconds to resample after fetch. 0 = use the yahoo interval as-is. */
  resample: number;
  bucketSec: number;
};

/** 3m and 4H are resampled from 1m / 60m. That is not inventing prices. */
export const TERM_INTERVALS: TermInterval[] = [
  { id: "1m", label: "1m", yahoo: "1m", range: "5d", intra: true, resample: 0, bucketSec: 60 },
  { id: "3m", label: "3m", yahoo: "1m", range: "5d", intra: true, resample: 180, bucketSec: 180 },
  { id: "5m", label: "5m", yahoo: "5m", range: "5d", intra: true, resample: 0, bucketSec: 300 },
  { id: "15m", label: "15m", yahoo: "15m", range: "1mo", intra: true, resample: 0, bucketSec: 900 },
  { id: "30m", label: "30m", yahoo: "30m", range: "1mo", intra: true, resample: 0, bucketSec: 1800 },
  { id: "1H", label: "1H", yahoo: "60m", range: "3mo", intra: true, resample: 0, bucketSec: 3600 },
  { id: "4H", label: "4H", yahoo: "60m", range: "6mo", intra: true, resample: 14400, bucketSec: 14400 },
  { id: "D", label: "D", yahoo: "1d", range: "2y", intra: false, resample: 0, bucketSec: 86400 },
  { id: "W", label: "W", yahoo: "1wk", range: "5y", intra: false, resample: 0, bucketSec: 7 * 86400 },
  { id: "M", label: "M", yahoo: "1mo", range: "max", intra: false, resample: 0, bucketSec: 30 * 86400 },
];

export function termFetchSpec(id: string): TermInterval {
  return TERM_INTERVALS.find((x) => x.id === id) || TERM_INTERVALS[7];
}

export function termBars(bars: OhlcBar[], spec: TermInterval): OhlcBar[] {
  if (spec.resample > 0) return resample(bars, spec.resample);
  return bars;
}

function istParts(tSec: number) {
  const d = new Date((tSec + IST) * 1000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate(), wd: d.getUTCDay() };
}

function istDayStart(tSec: number): number {
  const { y, m, day } = istParts(tSec);
  return Date.UTC(y, m, day) / 1000 - IST;
}

function istWeekStart(tSec: number): number {
  const { y, m, day, wd } = istParts(tSec);
  const iso = wd === 0 ? 6 : wd - 1;
  return Date.UTC(y, m, day - iso) / 1000 - IST;
}

function istMonthStart(tSec: number): number {
  const { y, m } = istParts(tSec);
  return Date.UTC(y, m, 1) / 1000 - IST;
}

export function barBucket(tSec: number, spec: TermInterval): number {
  if (spec.id === "D") return istDayStart(tSec);
  if (spec.id === "W") return istWeekStart(tSec);
  if (spec.id === "M") return istMonthStart(tSec);
  return Math.floor(tSec / spec.bucketSec) * spec.bucketSec;
}

/**
 * Stamp the forming candle with the latest quote. Same bucket → patch H/L/C.
 * New bucket → append a bar. Does not invent volume. Leaves history untouched.
 */
export function patchLastBar(
  bars: OhlcBar[],
  quote: { price: number; retrievedAt?: number | null },
  spec: TermInterval,
  nowSec?: number,
): OhlcBar[] {
  const px = Number(quote.price);
  if (!(px > 0) || !bars.length) return bars;
  const tSec =
    quote.retrievedAt && quote.retrievedAt > 0 ? quote.retrievedAt / 1000 : (nowSec ?? Date.now() / 1000);
  const last = bars[bars.length - 1];
  const lastB = barBucket(last.t, spec);
  const nowB = barBucket(tSec, spec);
  if (nowB <= lastB) {
    const h = Math.max(last.h, px);
    const l = Math.min(last.l, px);
    if (last.c === px && last.h === h && last.l === l) return bars;
    const next = bars.slice();
    next[next.length - 1] = { ...last, h, l, c: px };
    return next;
  }
  return [...bars, { t: nowB, o: px, h: px, l: px, c: px, v: 0 }];
}

export function moveWatchSymbols(symbols: string[], fromIdx: number, toIdx: number): string[] {
  if (fromIdx === toIdx) return symbols;
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= symbols.length || toIdx >= symbols.length) return symbols;
  const next = symbols.slice();
  const [row] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, row);
  return next;
}

export type QuoteLike = Pick<Quote, "symbol" | "input" | "price" | "changePct" | "name" | "retrievedAt" | "error">;

export function quoteMap(quotes: Quote[] | undefined | null): Map<string, Quote> {
  const map = new Map<string, Quote>();
  if (!quotes) return map;
  for (const q of quotes) {
    const a = String(q.symbol || "")
      .replace(/\.(NS|BO)$/i, "")
      .toUpperCase();
    const b = String(q.input || "")
      .replace(/\.(NS|BO)$/i, "")
      .toUpperCase();
    if (a) map.set(a, q);
    if (b) map.set(b, q);
  }
  return map;
}
