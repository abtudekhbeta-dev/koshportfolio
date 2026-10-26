import type { OhlcBar } from "./types.ts";
import { atr, bollinger, ema, fmtVol, macd, rsi, sma } from "./ohlc.ts";
import type { LedgerInd } from "./ledger-layout.ts";

export const IST_OFFSET = 19800;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Drop bars that are not finite or not a real OHLC print. Last duplicate timestamp wins. */
export function cleanBars(input: OhlcBar[] | null | undefined): OhlcBar[] {
  const rows: OhlcBar[] = [];
  for (const bar of input || []) {
    if (!bar) continue;
    const t = Number(bar.t);
    const o = Number(bar.o);
    const h = Number(bar.h);
    const l = Number(bar.l);
    const c = Number(bar.c);
    const v = Number(bar.v);
    if (!Number.isFinite(t) || !Number.isFinite(o) || !Number.isFinite(h) || !Number.isFinite(l) || !Number.isFinite(c)) continue;
    if (!(o > 0) || !(h > 0) || !(l > 0) || !(c > 0)) continue;
    if (h < l) continue;
    if (h + 1e-8 < Math.max(o, c) || l - 1e-8 > Math.min(o, c)) continue;
    rows.push({ t, o, h, l, c, v: Number.isFinite(v) && v > 0 ? v : 0 });
  }
  rows.sort((a, b) => a.t - b.t || a.c - b.c);
  const out: OhlcBar[] = [];
  for (const bar of rows) {
    const prev = out[out.length - 1];
    if (prev && prev.t === bar.t) out[out.length - 1] = bar;
    else out.push(bar);
  }
  return out;
}

export function hasVolume(bars: OhlcBar[]): boolean {
  return bars.some((bar) => bar.v > 0);
}

/** True when the provider sent a close and nothing else. Do not pretend these are candles. */
export function ohlcCollapsed(bars: OhlcBar[]): boolean {
  if (bars.length < 2) return false;
  return bars.every((bar) => bar.o === bar.h && bar.h === bar.l && bar.l === bar.c);
}

export function istBusinessDay(t: number): { year: number; month: number; day: number } {
  const d = new Date((t + IST_OFFSET) * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function businessDayToUnix(day: { year: number; month: number; day: number }): number {
  return Date.UTC(day.year, day.month - 1, day.day) / 1000 - IST_OFFSET;
}

export function timeToUnix(time: number | string | { year: number; month: number; day: number } | null | undefined): number | null {
  if (typeof time === "number" && Number.isFinite(time)) return time;
  if (time && typeof time === "object" && "year" in time) return businessDayToUnix(time);
  return null;
}

export function fmtBarTime(t: number, intra: boolean): string {
  if (!Number.isFinite(t)) return "—";
  const d = new Date((t + IST_OFFSET) * 1000);
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (!intra) return date;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${date} ${hh}:${mm} IST`;
}

export function fmtShares(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || !(n > 0)) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr sh`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L sh`;
  return Math.round(n).toLocaleString("en-IN");
}

/**
 * Session VWAP in IST. Resets each calendar day.
 * Stays empty until that session has volume — a typical price is not a VWAP.
 */
export function sessionVwap(bars: OhlcBar[]): (number | null)[] {
  const out: (number | null)[] = Array(bars.length).fill(null);
  let day = "";
  let pv = 0;
  let vol = 0;
  for (let i = 0; i < bars.length; i++) {
    const key = istDayKey(bars[i].t);
    if (key !== day) {
      day = key;
      pv = 0;
      vol = 0;
    }
    const volume = bars[i].v;
    if (!(volume > 0)) {
      out[i] = vol > 0 ? pv / vol : null;
      continue;
    }
    const typical = (bars[i].h + bars[i].l + bars[i].c) / 3;
    pv += typical * volume;
    vol += volume;
    out[i] = pv / vol;
  }
  return out;
}

function istDayKey(t: number): string {
  const day = istBusinessDay(t);
  return `${day.year}-${day.month}-${day.day}`;
}

export function lastFinite(values: (number | null)[]): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i];
    if (value != null && Number.isFinite(value)) return value;
  }
  return null;
}

export type LegendRow = { id: string; label: string; value: string; color: string; note?: string };

export function indicatorLegend(bars: OhlcBar[], indicators: LedgerInd[], intra: boolean): LegendRow[] {
  const closes = bars.map((bar) => bar.c);
  const rows: LegendRow[] = [];
  for (const ind of indicators) {
    if (ind.hidden) continue;
    if (ind.kind === "volume") {
      const last = [...bars].reverse().find((bar) => bar.v > 0);
      rows.push({
        id: ind.id,
        label: "Volume",
        value: last ? fmtShares(last.v) : "—",
        color: ind.color,
        note: last ? undefined : "No volume in this response",
      });
      continue;
    }
    if (ind.kind === "vwap") {
      if (!intra) {
        rows.push({
          id: ind.id,
          label: "VWAP",
          value: "not drawn",
          color: ind.color,
          note: "Session VWAP needs intraday bars with volume",
        });
        continue;
      }
      rows.push({ id: ind.id, label: "VWAP", value: fmtNum(lastFinite(sessionVwap(bars))), color: ind.color });
      continue;
    }
    if (ind.kind === "sma") {
      rows.push({
        id: ind.id,
        label: `SMA ${ind.period}`,
        value: fmtNum(lastFinite(sma(closes, ind.period))),
        color: ind.color,
      });
      continue;
    }
    if (ind.kind === "ema") {
      rows.push({
        id: ind.id,
        label: `EMA ${ind.period}`,
        value: fmtNum(lastFinite(ema(closes, ind.period))),
        color: ind.color,
      });
      continue;
    }
    if (ind.kind === "bb") {
      const band = bollinger(closes, ind.period, ind.k ?? 2);
      rows.push({
        id: ind.id,
        label: `BB ${ind.period}`,
        value: fmtNum(lastFinite(band.mid)),
        color: ind.color,
      });
      continue;
    }
    if (ind.kind === "rsi") {
      rows.push({
        id: ind.id,
        label: `RSI ${ind.period}`,
        value: fmtNum(lastFinite(rsi(closes, ind.period))),
        color: ind.color,
      });
      continue;
    }
    if (ind.kind === "macd") {
      const pack = macd(closes);
      rows.push({
        id: ind.id,
        label: "MACD 12, 26, 9",
        value: fmtNum(lastFinite(pack.line)),
        color: ind.color,
      });
      continue;
    }
    if (ind.kind === "atr") {
      rows.push({
        id: ind.id,
        label: `ATR ${ind.period}`,
        value: fmtNum(lastFinite(atr(bars, ind.period))),
        color: ind.color,
      });
    }
  }
  return rows;
}

function fmtNum(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export { fmtVol };
