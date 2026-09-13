import type { ChartMark, OhlcBar } from "./types";

export const LOOKBACK_SEC: Record<string, number> = {
  "1D": 1.6 * 86400,
  "5D": 5.5 * 86400,
  "1M": 32 * 86400,
  "3M": 94 * 86400,
  "6M": 186 * 86400,
  "1Y": 370 * 86400,
  "2Y": 740 * 86400,
  "3Y": 3 * 370 * 86400,
  "5Y": 5 * 370 * 86400,
  "10Y": 10 * 370 * 86400,
  MAX: Infinity,
};

export function sliceLookback(bars: OhlcBar[], lookback: string): OhlcBar[] {
  if (!bars.length) return bars;
  const last = bars[bars.length - 1].t;
  let cut: number;
  if (lookback === "YTD") {
    const d = new Date((last + 19800) * 1000);
    cut = Date.UTC(d.getUTCFullYear(), 0, 1) / 1000 - 19800;
  } else {
    const sec = LOOKBACK_SEC[lookback];
    if (sec == null || !Number.isFinite(sec)) return bars;
    cut = last - sec;
  }
  let i = 0;
  while (i < bars.length && bars[i].t < cut) i += 1;
  const out = bars.slice(Math.max(0, i - 1));
  return out.length >= 2 ? out : bars;
}

export type Swing = { t: number; price: number; kind: "H" | "L"; i: number };
export type NamedSwing = Swing & { label: "HH" | "HL" | "LH" | "LL" | "H" | "L" };

export function swings(bars: OhlcBar[], k = 4): Swing[] {
  if (bars.length < k * 2 + 3) return [];
  const out: Swing[] = [];
  for (let i = k; i < bars.length - k; i++) {
    let isH = true;
    let isL = true;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      if (bars[j].h >= bars[i].h) isH = false;
      if (bars[j].l <= bars[i].l) isL = false;
    }
    if (isH) out.push({ t: bars[i].t, price: bars[i].h, kind: "H", i });
    else if (isL) out.push({ t: bars[i].t, price: bars[i].l, kind: "L", i });
  }
  return out;
}

export function nameSwings(list: Swing[]): NamedSwing[] {
  const out: NamedSwing[] = [];
  let lastH: Swing | null = null;
  let lastL: Swing | null = null;
  for (const x of list) {
    if (x.kind === "H") {
      const label = lastH ? (x.price > lastH.price ? "HH" : "LH") : "H";
      out.push({ ...x, label });
      lastH = x;
    } else {
      const label = lastL ? (x.price > lastL.price ? "HL" : "LL") : "L";
      out.push({ ...x, label });
      lastL = x;
    }
  }
  return out;
}

export type Cluster = { price: number; n: number; labels: string[] };

export function clusterPrices(points: { price: number; label: string }[], pct = 1): Cluster[] {
  const src = [...points].filter((p) => p.price > 0).sort((a, b) => a.price - b.price);
  const out: Cluster[] = [];
  for (const p of src) {
    const hit = out.find((c) => Math.abs(c.price - p.price) / c.price <= pct / 100);
    if (hit) {
      hit.n += 1;
      hit.price = (hit.price * (hit.n - 1) + p.price) / hit.n;
      if (!hit.labels.includes(p.label)) hit.labels.push(p.label);
    } else out.push({ price: p.price, n: 1, labels: [p.label] });
  }
  return out.sort((a, b) => b.n - a.n);
}

export function lastNum(a: (number | null | undefined)[]): number | null {
  for (let i = a.length - 1; i >= 0; i--) {
    const v = a[i];
    if (v != null && Number.isFinite(v)) return v;
  }
  return null;
}

export function sma(vals: number[], n: number): (number | null)[] {
  const out: (number | null)[] = Array(vals.length).fill(null);
  if (n <= 0) return out;
  let sum = 0;
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i];
    if (i >= n) sum -= vals[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

export function ema(vals: number[], n: number): (number | null)[] {
  const out: (number | null)[] = Array(vals.length).fill(null);
  if (n <= 0 || !vals.length) return out;
  const k = 2 / (n + 1);
  let prev: number | null = null;
  for (let i = 0; i < vals.length; i++) {
    if (prev == null) {
      if (i >= n - 1) {
        let s = 0;
        for (let j = i - n + 1; j <= i; j++) s += vals[j];
        prev = s / n;
        out[i] = prev;
      }
    } else {
      prev = vals[i] * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function rsi(closes: number[], n = 14): (number | null)[] {
  const out: (number | null)[] = Array(closes.length).fill(null);
  if (closes.length < n + 1) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= n; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let ag = gain / n;
  let al = loss / n;
  out[n] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    ag = (ag * (n - 1) + g) / n;
    al = (al * (n - 1) + l) / n;
    out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return out;
}

export function macd(closes: number[], fast = 12, slow = 26, sig = 9) {
  const eFast = ema(closes, fast);
  const eSlow = ema(closes, slow);
  const line: (number | null)[] = closes.map((_, i) =>
    eFast[i] != null && eSlow[i] != null ? (eFast[i] as number) - (eSlow[i] as number) : null,
  );
  const compact = line.map((v) => v ?? 0);
  const start = line.findIndex((v) => v != null);
  const signalSrc = start >= 0 ? compact.slice(start) : [];
  const sigEma = ema(signalSrc, sig);
  const signal: (number | null)[] = line.map(() => null);
  const hist: (number | null)[] = line.map(() => null);
  for (let i = 0; i < sigEma.length; i++) {
    const idx = start + i;
    const s = sigEma[i];
    if (s == null || line[idx] == null) continue;
    signal[idx] = s;
    hist[idx] = (line[idx] as number) - s;
  }
  return { line, signal, hist };
}

export function bollinger(closes: number[], n = 20, k = 2) {
  const mid = sma(closes, n);
  const upper: (number | null)[] = Array(closes.length).fill(null);
  const lower: (number | null)[] = Array(closes.length).fill(null);
  for (let i = n - 1; i < closes.length; i++) {
    const m = mid[i];
    if (m == null) continue;
    let s = 0;
    for (let j = i - n + 1; j <= i; j++) s += (closes[j] - m) ** 2;
    const sd = Math.sqrt(s / n);
    upper[i] = m + k * sd;
    lower[i] = m - k * sd;
  }
  return { mid, upper, lower };
}

export function stoch(bars: OhlcBar[], n = 14, smooth = 3) {
  const kRaw: (number | null)[] = Array(bars.length).fill(null);
  for (let i = n - 1; i < bars.length; i++) {
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - n + 1; j <= i; j++) {
      if (bars[j].h > hi) hi = bars[j].h;
      if (bars[j].l < lo) lo = bars[j].l;
    }
    const span = hi - lo || 1e-9;
    kRaw[i] = ((bars[i].c - lo) / span) * 100;
  }
  const k = sma(
    kRaw.map((v) => v ?? 0),
    smooth,
  ).map((v, i) => (kRaw[i] == null ? null : v));
  const d = sma(
    k.map((v) => v ?? 0),
    smooth,
  ).map((v, i) => (k[i] == null ? null : v));
  return { k, d };
}

export function vwap(bars: OhlcBar[]): (number | null)[] {
  const out: (number | null)[] = Array(bars.length).fill(null);
  let pv = 0;
  let vol = 0;
  for (let i = 0; i < bars.length; i++) {
    const typical = (bars[i].h + bars[i].l + bars[i].c) / 3;
    pv += typical * (bars[i].v || 0);
    vol += bars[i].v || 0;
    out[i] = vol > 0 ? pv / vol : typical;
  }
  return out;
}

export function atr(bars: OhlcBar[], n = 14): (number | null)[] {
  const out: (number | null)[] = Array(bars.length).fill(null);
  if (bars.length < 2) return out;
  const tr: number[] = [bars[0].h - bars[0].l];
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1].c;
    tr.push(Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - prev), Math.abs(bars[i].l - prev)));
  }
  const ma = sma(tr, n);
  for (let i = 0; i < bars.length; i++) out[i] = ma[i];
  return out;
}

export function supertrend(bars: OhlcBar[], n = 10, mult = 3) {
  const a = atr(bars, n);
  const line: (number | null)[] = Array(bars.length).fill(null);
  const dir: (1 | -1 | null)[] = Array(bars.length).fill(null);
  let lastDir: 1 | -1 = 1;
  let last = 0;
  for (let i = 0; i < bars.length; i++) {
    const atrV = a[i];
    if (atrV == null) continue;
    const mid = (bars[i].h + bars[i].l) / 2;
    const upper = mid + mult * atrV;
    const lower = mid - mult * atrV;
    if (!last) {
      last = bars[i].c >= mid ? lower : upper;
      lastDir = bars[i].c >= mid ? 1 : -1;
    } else if (lastDir === 1) {
      last = Math.max(lower, last);
      if (bars[i].c < last) {
        lastDir = -1;
        last = upper;
      }
    } else {
      last = Math.min(upper, last);
      if (bars[i].c > last) {
        lastDir = 1;
        last = lower;
      }
    }
    line[i] = last;
    dir[i] = lastDir;
  }
  return { line, dir };
}

export function volumeProfile(bars: OhlcBar[], bins = 22): { price: number; vol: number }[] {
  if (!bars.length) return [];
  let hi = -Infinity;
  let lo = Infinity;
  for (const b of bars) {
    if (b.h > hi) hi = b.h;
    if (b.l < lo) lo = b.l;
  }
  if (!Number.isFinite(hi) || hi === lo) return Array.from({ length: bins }, (_, i) => ({ price: hi || 0, vol: i === 0 ? 1 : 0 }));
  const span = hi - lo || 1;
  const out = Array.from({ length: bins }, (_, i) => ({ price: lo + ((i + 0.5) / bins) * span, vol: 0 }));
  for (const b of bars) {
    const mid = (b.h + b.l) / 2;
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(((mid - lo) / span) * bins)));
    out[idx].vol += b.v || 0;
  }
  return out;
}

export function isNr7(bars: OhlcBar[]): boolean {
  if (bars.length < 7) return false;
  const last7 = bars.slice(-7);
  const ranges = last7.map((b) => b.h - b.l);
  const last = ranges[ranges.length - 1];
  return ranges.every((r) => last <= r + 1e-9);
}

export function resample(bars: OhlcBar[], bucketSec: number): OhlcBar[] {
  if (!bars.length || !(bucketSec > 0)) return bars;
  const out: OhlcBar[] = [];
  let cur: OhlcBar | null = null;
  let bucket = -1;
  for (const b of bars) {
    const k = Math.floor(b.t / bucketSec);
    if (cur && k === bucket) {
      cur.h = Math.max(cur.h, b.h);
      cur.l = Math.min(cur.l, b.l);
      cur.c = b.c;
      cur.v += b.v;
    } else {
      if (cur) out.push(cur);
      cur = { t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v };
      bucket = k;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function thinOhlc(bars: OhlcBar[], cap = 20): OhlcBar[] {
  if (bars.length <= cap) return bars;
  const step = (bars.length - 1) / (cap - 1);
  const out: OhlcBar[] = [];
  let last = -1;
  for (let i = 0; i < cap - 1; i++) {
    const idx = Math.round(i * step);
    if (idx === last) continue;
    out.push(bars[idx]);
    last = idx;
  }
  const tail = bars[bars.length - 1];
  if (out[out.length - 1] !== tail) out.push(tail);
  return out;
}

export function fmtVol(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
  if (a >= 1e5) return (n / 1e5).toFixed(2) + " L";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return n.toFixed(0);
}

export function retFrom(bars: OhlcBar[], days: number): number | null {
  if (bars.length < 2) return null;
  const last = bars[bars.length - 1];
  const cut = last.t - days * 86400;
  let first: OhlcBar | null = null;
  for (const b of bars) if (b.t <= cut) first = b;
  if (!first) {
    if (last.t - bars[0].t < days * 86400 * 0.7) return null;
    first = bars[0];
  }
  return first.c ? ((last.c / first.c - 1) * 100) : null;
}

export function volAvg(bars: OhlcBar[], n = 20): number {
  if (!bars.length) return 0;
  const src = bars.slice(-n);
  return src.reduce((s, b) => s + (b.v || 0), 0) / src.length;
}

export function lastRsi(bars: OhlcBar[], n = 14): number | null {
  return lastNum(rsi(bars.map((b) => b.c), n));
}

export function lastMacdHist(bars: OhlcBar[]): number | null {
  return lastNum(macd(bars.map((b) => b.c)).hist);
}

export function lastBbPos(bars: OhlcBar[]): number | null {
  const closes = bars.map((b) => b.c);
  const bb = bollinger(closes, 20, 2);
  const last = bars.at(-1);
  const up = lastNum(bb.upper);
  const lo = lastNum(bb.lower);
  if (!last || up == null || lo == null || up === lo) return null;
  return ((last.c - lo) / (up - lo)) * 100;
}

const IST = 19800;

function istParts(t: number) {
  const d = new Date((t + IST) * 1000);
  return {
    day: d.toISOString().slice(0, 10),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
  };
}

export function sessionOpeningRange(bars: OhlcBar[], minutes = 15): { high: number; low: number } | null {
  if (!bars.length) return null;
  const lastDay = istParts(bars[bars.length - 1].t).day;
  const openMin = 9 * 60 + 15;
  const endMin = openMin + minutes;
  let high = -Infinity;
  let low = Infinity;
  let n = 0;
  for (const b of bars) {
    const p = istParts(b.t);
    if (p.day !== lastDay) continue;
    if (p.minutes < openMin || p.minutes >= endMin) continue;
    if (b.h > high) high = b.h;
    if (b.l < low) low = b.l;
    n += 1;
  }
  if (!n || !Number.isFinite(high)) return null;
  return { high, low };
}

export function priorDayRange(bars: OhlcBar[]): { high: number; low: number } | null {
  if (bars.length < 2) return null;
  const lastDay = istParts(bars[bars.length - 1].t).day;
  let day = "";
  let high = -Infinity;
  let low = Infinity;
  for (let i = bars.length - 1; i >= 0; i--) {
    const d = istParts(bars[i].t).day;
    if (d === lastDay) continue;
    if (!day) day = d;
    if (d !== day) break;
    if (bars[i].h > high) high = bars[i].h;
    if (bars[i].l < low) low = bars[i].l;
  }
  if (!day || !Number.isFinite(high)) return null;
  return { high, low };
}

export function openingRange(bars: OhlcBar[], minutes = 15) {
  return sessionOpeningRange(bars, minutes);
}

export function chartStructure(bars: OhlcBar[]) {
  const named = nameSwings(swings(bars, bars.length > 180 ? 5 : 3));
  const recent = named.slice(-8);
  const clusters = clusterPrices(
    recent.map((s) => ({ price: s.price, label: s.label })),
    0.8,
  ).filter((c) => c.n >= 1);
  const week = resample(bars, 7 * 86400);
  const weekNamed = nameSwings(swings(week, 2));
  const mtf = clusterPrices(
    [
      ...clusters.map((c) => ({ price: c.price, label: "D" })),
      ...weekNamed.map((s) => ({ price: s.price, label: "W-" + s.label })),
    ],
    1.1,
  ).filter((c) => c.labels.some((l) => l.startsWith("W-")) && c.labels.some((l) => l === "D" || !l.startsWith("W-")));
  const last = bars.at(-1)?.c || 0;
  const support = clusters.filter((c) => c.price <= last).slice(0, 4);
  const resistance = clusters.filter((c) => c.price >= last).slice(0, 4);
  const swingMarks = recent.slice(-6);
  const marks: ChartMark[] = [
    ...swingMarks.map((s) => ({
      id: `sw-${s.t}-${s.label}`,
      kind: "swing" as const,
      price: s.price,
      t: s.t,
      label: s.label,
      tone: s.kind === "H" ? ("down" as const) : ("up" as const),
    })),
    ...clusters.slice(0, 4).map((c, i) => ({
      id: `sr-${i}-${c.price.toFixed(2)}`,
      kind: "sr" as const,
      price: c.price,
      label: c.n >= 2 ? `S/R ${c.n}` : c.price >= last ? "R" : "S",
      tone: c.price >= last ? ("down" as const) : ("up" as const),
    })),
  ];
  return { named: recent, clusters, mtf, support, resistance, marks, rsi: lastRsi(bars) };
}

/** Daily bars: prior high broken, then a pullback to that level that still holds. */
export function detectRetest(bars: OhlcBar[]): { hit: boolean; level: number | null; ath: boolean } {
  if (!bars || bars.length < 80) return { hit: false, level: null, ath: false };
  let ath = 0;
  let athI = 0;
  const cut = bars.length - 20;
  for (let i = 0; i < cut; i++) {
    if (bars[i].h > ath) {
      ath = bars[i].h;
      athI = i;
    }
  }
  if (!(ath > 0)) return { hit: false, level: null, ath: false };
  let broke = -1;
  for (let i = athI + 2; i < bars.length - 3; i++) {
    if (bars[i].c > ath * 1.002) {
      broke = i;
      break;
    }
  }
  if (broke < 0) return { hit: false, level: ath, ath: false };
  let retested = false;
  for (let i = broke + 1; i < bars.length; i++) {
    if (bars[i].l <= ath * 1.03 && bars[i].l >= ath * 0.94) retested = true;
  }
  const last = bars[bars.length - 1];
  const held = last.c >= ath * 0.97;
  const nearAth = athI < bars.length * 0.35;
  return { hit: retested && held, level: ath, ath: nearAth };
}
