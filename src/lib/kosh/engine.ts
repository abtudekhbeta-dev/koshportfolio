/* Mix path on each stock's own daily adj close — as far back as Yahoo prints.
 * Union of IST calendar days. Last close is carried forward.
 * A name is never required to print on every date. */
import { SECTOR_BENCH } from "./benchmarks.ts";
import { capFromMcap, sectorOf } from "./sectors.ts";
import { displayName, isIsin } from "./names.ts";
import { isCommodity } from "./commodities.ts";
import type {
  Bar,
  Book,
  ChartRange,
  Holding,
  HoldingRow,
  HistoryPack,
  Insight,
  MixPath,
  MonthRow,
  NavPoint,
  Quote,
  RiskMetrics,
  Sleeve,
  WindowPair,
  RiskLever,
} from "./types";
import { buildCorrPack } from "./portfolio-stats.ts";
import { holdingReturn } from "./holding-returns.ts";

const RF = 0.065;

const IST_OFFSET = 19800;

export function istDay(unixSec: number): string {
  return new Date((unixSec + IST_OFFSET) * 1000).toISOString().slice(0, 10);
}

/** Return over the bars on file. Pass a 1y pack for a 1-year figure. */
export function retFromBars(bars: Bar[] | undefined, minDays = 200): number | null {
  if (!bars || bars.length < 2) return null;
  const last = bars[bars.length - 1];
  const first = bars[0];
  if (!(first.c > 0) || !(last.c > 0)) return null;
  const spanDays = (last.t - first.t) / 86400;
  if (spanDays < minDays) return null;
  return ((last.c / first.c) - 1) * 100;
}

function toDayMap(bars: Bar[] | undefined): Map<string, { day: string; t: number; c: number }> {
  const m = new Map<string, { day: string; t: number; c: number }>();
  for (const b of bars || []) {
    if (!b || !(b.c > 0)) continue;
    const day = istDay(b.t);
    m.set(day, { day, t: b.t, c: b.c });
  }
  return m;
}

function currentWeights(
  withHx: Holding[],
  maps: { h: Holding; m: Map<string, { day: string; t: number; c: number }> }[],
): Record<string, number> {
  const w: Record<string, number> = {};
  let sum = 0;
  for (const { h, m } of maps) {
    const last = [...m.values()].at(-1);
    const px = last?.c || 0;
    const val = (h.qty || 1) * px;
    w[h.symbol] = val;
    sum += val;
  }
  if (sum <= 0) {
    const eq = 1 / withHx.length;
    for (const { h } of maps) w[h.symbol] = eq;
    return w;
  }
  for (const k of Object.keys(w)) w[k] = w[k] / sum;
  return w;
}

/**
 * Today's weights × each name's own daily adj-close return.
 * First print of a name only seeds the previous close (no NAV jump).
 * Missing prints are forward-filled. Days covering <60% of weight are dropped.
 */
export function buildMixPath(
  holdings: Holding[],
  histories: Record<string, Bar[]>,
  benchBars: Bar[],
  fixedWeights?: Record<string, number>,
): MixPath {
  const withHx = holdings.filter((h) => (histories[h.symbol] || []).length >= 5);
  const missing = holdings
    .filter((h) => !withHx.some((x) => x.symbol === h.symbol))
    .map((h) => h.symbol);
  const used = withHx.map((h) => h.symbol);
  if (!withHx.length) {
    return {
      nav: [],
      used,
      missing,
      weights: {},
      coverage: `0/${holdings.length} stocks · 0 days`,
      method: "current-mix",
    };
  }

  const maps = withHx.map((h) => ({ h, m: toDayMap(histories[h.symbol]) }));
  let weights = currentWeights(withHx, maps);
  if (fixedWeights && Object.keys(fixedWeights).length) {
    const w: Record<string, number> = {};
    let sum = 0;
    for (const h of withHx) {
      const v = fixedWeights[h.symbol] ?? 0;
      if (v > 0) {
        w[h.symbol] = v;
        sum += v;
      }
    }
    if (sum > 0) {
      for (const k of Object.keys(w)) w[k] = w[k] / sum;
      weights = w;
    }
  }
  const benchMap = toDayMap(benchBars || []);
  const days = new Set<string>();
  for (const { m } of maps) for (const d of m.keys()) days.add(d);

  const lastPx: Record<string, number> = {};
  const prev: Record<string, number> = {};
  let navPx = 100;
  let bench0: number | null = null;
  let lastBench: number | null = null;
  const nav: NavPoint[] = [];

  for (const day of [...days].sort()) {
    let t = 0;
    let printed = 0;
    for (const { h, m } of maps) {
      const hit = m.get(day);
      if (!hit) continue;
      printed += 1;
      t = t || hit.t;
      lastPx[h.symbol] = hit.c;
    }
    if (printed === 0) continue;

    let wr = 0;
    let wAvail = 0;
    for (const { h } of maps) {
      const px = lastPx[h.symbol];
      if (!(px > 0)) continue;
      const w = weights[h.symbol] || 0;
      if (prev[h.symbol] > 0) {
        wr += w * (px / prev[h.symbol] - 1);
        wAvail += w;
      }
      prev[h.symbol] = px;
    }
    if (wAvail < 0.6) continue;

    const portR = wr / wAvail;
    navPx *= 1 + portR;
    const b = benchMap.get(day);
    if (b && b.c > 0) {
      if (!bench0) bench0 = b.c;
      lastBench = (b.c / bench0) * 100;
      t = b.t || t;
    }
    nav.push({
      t,
      day,
      port: navPx,
      bench: lastBench,
      covered: Object.keys(prev).length,
      names: withHx.length,
      wAvail,
    });
  }

  return {
    nav,
    used,
    missing,
    weights,
    coverage: `${used.length}/${holdings.length} stocks · ${nav.length} days`,
    method: "current-mix",
  };
}

export function pathFromBars(bars: Bar[], benchBars: Bar[]): MixPath {
  return buildMixPath([{ symbol: "_s", qty: 1, name: "_s", avg: null, date: null }], { _s: bars || [] }, benchBars || []);
}

const RANGE_DAYS: Record<string, number> = {
  "1M": 31,
  "3M": 93,
  "6M": 186,
  "1Y": 372,
  "2Y": 365 * 2 + 8,
  "3Y": 365 * 3 + 12,
  "5Y": 365 * 5 + 20,
  "10Y": 365 * 10 + 40,
};

export function sliceNav(nav: NavPoint[], range: ChartRange | string, span?: { from?: string; to?: string }): NavPoint[] {
  if (!nav.length) return nav;
  if (span?.from || span?.to || range === "CUSTOM") {
    const from = span?.from || "0000-01-01";
    const to = span?.to || "9999-12-31";
    const s = nav.filter((p) => p.day >= from && p.day <= to);
    return s.length >= 2 ? s : nav.slice(-2);
  }
  if (range === "MAX") return nav;
  if (range === "YTD") {
    const y = nav[nav.length - 1].day.slice(0, 4);
    const s = nav.filter((p) => p.day.startsWith(y));
    return s.length >= 2 ? s : nav.slice(-2);
  }
  const days = RANGE_DAYS[range];
  if (!days) return nav;
  const last = nav[nav.length - 1].t;
  const cut = last - days * 86400;
  const s = nav.filter((p) => p.t >= cut);
  return s.length >= 2 ? s : nav.slice(-2);
}

export function toIndexed(nav: NavPoint[]) {
  const i0 = nav.findIndex((p) => p.port > 0 && p.bench != null && p.bench > 0);
  const start = i0 >= 0 ? i0 : nav.findIndex((p) => p.port > 0);
  if (start < 0) return [];
  const origin = nav[start];
  return nav.slice(start).map((p) => ({
    ...p,
    portIdx: origin.port > 0 ? (p.port / origin.port) * 100 : 0,
    benchIdx: p.bench && origin.bench ? (p.bench / origin.bench) * 100 : null,
    dd: 0,
  }));
}

export function withDrawdown(indexed: ReturnType<typeof toIndexed>) {
  let peak = 0;
  return indexed.map((p) => {
    peak = Math.max(peak, p.portIdx);
    return { ...p, dd: peak ? ((p.portIdx - peak) / peak) * 100 : 0 };
  });
}

export function windowReturn(nav: NavPoint[], days: number): WindowPair {
  if (nav.length < 2) return { port: null, bench: null };
  const last = nav[nav.length - 1];
  const cut = last.t - days * 86400;
  let first: NavPoint | null = null;
  for (const p of nav) if (p.t <= cut) first = p;
  if (!first) {
    const span = last.t - nav[0].t;
    if (span < days * 86400 * 0.7) return { port: null, bench: null };
    first = nav[0];
  }
  const port = first.port ? (last.port / first.port - 1) * 100 : null;
  const bench = first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null;
  return { port, bench };
}

export function ytdReturn(nav: NavPoint[]): WindowPair {
  if (nav.length < 2) return { port: null, bench: null };
  const y = nav[nav.length - 1].day.slice(0, 4);
  const inYear = nav.filter((p) => p.day.startsWith(y));
  const first = inYear[0] || nav[0];
  const last = nav[nav.length - 1];
  if (last.t - first.t < 5 * 86400) return { port: null, bench: null };
  return {
    port: first.port ? (last.port / first.port - 1) * 100 : null,
    bench: first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null,
  };
}

export function mixCagr(nav: NavPoint[]): number | null {
  if (nav.length < 2) return null;
  const a = nav[0];
  const b = nav[nav.length - 1];
  const yrs = (b.t - a.t) / (365.25 * 86400);
  if (yrs < 60 / 365) return null;
  if (!(a.port > 0) || !(b.port > 0)) return null;
  return (Math.pow(b.port / a.port, 1 / yrs) - 1) * 100;
}

export function dailyRets(series: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1];
    const b = series[i];
    if (a > 0 && b > 0) r.push(b / a - 1);
  }
  return r;
}

function alignedRets(nav: NavPoint[]) {
  const pr: number[] = [];
  const br: number[] = [];
  for (let i = 1; i < nav.length; i++) {
    const a = nav[i - 1];
    const b = nav[i];
    if (a.port > 0 && b.port > 0 && a.bench != null && a.bench > 0 && b.bench != null && b.bench > 0) {
      pr.push(b.port / a.port - 1);
      br.push(b.bench / a.bench - 1);
    }
  }
  return { pr, br };
}

function avg(a: number[]) {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}
function variance(a: number[]) {
  if (a.length < 2) return 0;
  const m = avg(a);
  return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
}
function stdev(a: number[]) {
  return Math.sqrt(variance(a));
}
function covariance(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = avg(a.slice(0, n));
  const mb = avg(b.slice(0, n));
  let s = 0;
  for (let i = 0; i < n; i++) s += (a[i] - ma) * (b[i] - mb);
  return s / (n - 1);
}
function corrcoef(a: number[], b: number[]) {
  const sa = stdev(a);
  const sb = stdev(b);
  if (!sa || !sb) return null;
  return covariance(a, b) / (sa * sb);
}

const EMPTY_RISK: RiskMetrics = {
  sharpe: null,
  sortino: null,
  alpha: null,
  beta: null,
  corr: null,
  vol: null,
  maxDd: null,
  upCap: null,
  downCap: null,
  info: null,
  calmar: null,
  cagr: null,
  since: null,
  sessions: 0,
  windowLabel: "",
};

export function riskWindow(nav: NavPoint[]): { since: string | null; sessions: number; windowLabel: string } {
  const overlap = (nav || []).filter((p) => p.port > 0 && p.bench != null && p.bench > 0);
  if (overlap.length < 2) {
    const first = (nav || []).find((p) => p.port > 0);
    const last = [...(nav || [])].reverse().find((p) => p.port > 0);
    const sessions = nav?.length || 0;
    const since = first?.day || null;
    return {
      since,
      sessions,
      windowLabel: since ? `Since ${since} · ${sessions} sessions (no overlapping index)` : "",
    };
  }
  const since = overlap[0].day;
  const last = overlap[overlap.length - 1].day;
  const sessions = overlap.length;
  return {
    since,
    sessions,
    windowLabel: `Since ${since} through ${last} · ${sessions} sessions vs the index · Rf 6.5%`,
  };
}

export function riskMetrics(nav: NavPoint[]): RiskMetrics {
  const win = riskWindow(nav);
  if (!nav || nav.length < 10) return { ...EMPTY_RISK, ...win };
  const port = nav.map((p) => p.port);
  const rets = dailyRets(port);
  if (rets.length < 8) return { ...EMPTY_RISK, ...win };
  const volD = stdev(rets);
  const vol = volD * Math.sqrt(252) * 100;
  const mean = avg(rets);
  const ann = mean * 252;
  const sharpe = volD ? (ann - RF) / (volD * Math.sqrt(252)) : null;
  const down = rets.filter((x) => x < 0);
  const ds = down.length ? stdev(down) : 0;
  const sortino = ds ? (ann - RF) / (ds * Math.sqrt(252)) : null;
  const idx = withDrawdown(toIndexed(nav));
  const maxDd = Math.min(...idx.map((p) => p.dd));
  const cagr = mixCagr(nav);
  const calmar = maxDd && maxDd < 0 && cagr != null ? cagr / Math.abs(maxDd) : null;

  const { pr, br } = alignedRets(nav);
  let beta: number | null = null;
  let alpha: number | null = null;
  let corr: number | null = null;
  let upCap: number | null = null;
  let downCap: number | null = null;
  let info: number | null = null;
  if (pr.length >= 8) {
    const cov = covariance(pr, br);
    const vb = variance(br);
    beta = vb ? cov / vb : null;
    corr = corrcoef(pr, br);
    const rp = avg(pr) * 252;
    const rb = avg(br) * 252;
    alpha = beta != null ? (rp - RF - beta * (rb - RF)) * 100 : null;
    const upP: number[] = [];
    const upB: number[] = [];
    const dnP: number[] = [];
    const dnB: number[] = [];
    for (let i = 0; i < pr.length; i++) {
      if (br[i] >= 0) {
        upP.push(pr[i]);
        upB.push(br[i]);
      } else {
        dnP.push(pr[i]);
        dnB.push(br[i]);
      }
    }
    upCap = avg(upB) ? avg(upP) / avg(upB) : null;
    downCap = avg(dnB) ? avg(dnP) / avg(dnB) : null;
    const excess = pr.map((x, i) => x - br[i]);
    const te = stdev(excess) * Math.sqrt(252);
    info = te ? (avg(excess) * 252) / te : null;
  }
  return { sharpe, sortino, alpha, beta, corr, vol, maxDd, upCap, downCap, info, calmar, cagr, ...win };
}

export function monthBuckets(nav: NavPoint[]): MonthRow[] {
  const keys = [...new Set(nav.map((p) => p.day.slice(0, 7)))].sort();
  const rows: MonthRow[] = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const inMonth = nav.filter((p) => p.day.startsWith(k));
    const last = inMonth.at(-1);
    const first = i === 0 ? inMonth[0] : nav.filter((p) => p.day.startsWith(keys[i - 1])).at(-1);
    if (!first || !last || first.port <= 0) continue;
    const span = last.t - first.t;
    if (span < 8 * 86400 && i === 0) continue;
    rows.push({
      key: k,
      port: (last.port / first.port - 1) * 100,
      bench: first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null,
    });
  }
  return rows;
}

function isoWeekMonday(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const offset = (dow + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}

export function weekBuckets(nav: NavPoint[]): MonthRow[] {
  const m = new Map<string, NavPoint>();
  for (const p of nav) m.set(isoWeekMonday(p.day), p);
  const keys = [...m.keys()].sort();
  const rows: MonthRow[] = [];
  for (let i = 1; i < keys.length; i++) {
    const a = m.get(keys[i - 1])!;
    const b = m.get(keys[i])!;
    if (!a.port || !b.port) continue;
    rows.push({
      key: keys[i],
      port: (b.port / a.port - 1) * 100,
      bench: a.bench && b.bench ? (b.bench / a.bench - 1) * 100 : null,
    });
  }
  return rows;
}

export function rollingSeries(nav: NavPoint[], winDays: number): { t: number; day: string; port: number; bench: number | null }[] {
  const out: { t: number; day: string; port: number; bench: number | null }[] = [];
  let j = 0;
  for (let i = 0; i < nav.length; i++) {
    const cut = nav[i].t - winDays * 86400;
    while (j < i && nav[j].t < cut) j++;
    const start = j > 0 && nav[j].t > cut ? j - 1 : j;
    if (nav[i].t - nav[start].t < winDays * 86400 * 0.7) continue;
    if (!(nav[start].port > 0)) continue;
    const b0 = nav[start].bench;
    const b1 = nav[i].bench;
    out.push({
      t: nav[i].t,
      day: nav[i].day,
      port: (nav[i].port / nav[start].port - 1) * 100,
      bench: b0 && b1 ? (b1 / b0 - 1) * 100 : null,
    });
  }
  return out;
}

export function fmtInr(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e7) return sign + "₹" + (abs / 1e7).toFixed(2) + " Cr";
  if (abs >= 1e5) return sign + "₹" + (abs / 1e5).toFixed(2) + " L";
  return sign + "₹" + abs.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function fmtTapePx(n: number | null | undefined, unit?: string): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  const digits = n >= 1000 ? 0 : 2;
  const s = n.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return unit ? `${s} ${unit}` : s;
}

export function fmtPx(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: n >= 100 ? 2 : 2, minimumFractionDigits: 2 });
}

export function fmtPct(n: number | null | undefined, d = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = (n >= 0 ? "+" : "") + n.toFixed(d) + "%";
  return s;
}

export function dash(n: number | null | undefined, fmt: (x: number) => string = (x) => x.toFixed(2)): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return fmt(n);
}

export function saneDayPnl(value: number, changePct: number): { abs: number; pct: number } {
  if (!Number.isFinite(changePct) || Math.abs(changePct) > 25) return { abs: 0, pct: 0 };
  return { abs: value * (changePct / 100), pct: changePct };
}

export function holdingWindows(bars: Bar[]) {
  const p = pathFromBars(bars, []);
  return {
    w1: windowReturn(p.nav, 7).port,
    m1: windowReturn(p.nav, 31).port,
    m3: windowReturn(p.nav, 93).port,
    m6: windowReturn(p.nav, 186).port,
    y1: windowReturn(p.nav, 365).port,
    ytd: ytdReturn(p.nav).port,
    cagr: mixCagr(p.nav),
    sessions: p.nav.length,
  };
}

export function sectorSleeve(rows: HoldingRow[], histories: Record<string, Bar[]>) {
  const groups: Record<string, { sector: string; rows: HoldingRow[]; value: number }> = {};
  for (const r of rows) {
    const s = r.sector || "Other";
    groups[s] = groups[s] || { sector: s, rows: [], value: 0 };
    groups[s].rows.push(r);
    groups[s].value += r.value;
  }
  return Object.values(groups)
    .map((g) => {
      const sleeve = buildMixPath(
        g.rows.map((r) => ({ symbol: r.symbol, qty: r.qty, name: r.name, avg: r.avg, date: r.date })),
        Object.fromEntries(g.rows.map((r) => [r.symbol, histories[r.symbol] || []])),
        [],
      );
      return {
        sector: g.sector,
        value: g.value,
        names: g.rows.length,
        symbols: g.rows.map((r) => r.symbol),
        windows: {
          m1: windowReturn(sleeve.nav, 31).port,
          m3: windowReturn(sleeve.nav, 93).port,
          y1: windowReturn(sleeve.nav, 365).port,
          ytd: ytdReturn(sleeve.nav).port,
          cagr: mixCagr(sleeve.nav),
        },
        bench: SECTOR_BENCH[g.sector] || SECTOR_BENCH.Other,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function insights(book: Pick<Book, "holdings" | "risk" | "windows" | "coverage" | "missing">): Insight[] {
  const pts: Insight[] = [];
  const { holdings, risk, windows, coverage, missing } = book;
  const n = holdings.length;
  if (!n) return [{ title: "Empty", figure: "—", body: "Add names to see portfolio quality.", tone: "warn" }];

  const top = [...holdings].sort((a, b) => b.value - a.value)[0];
  if (top && top.weight > 0.18) {
    pts.push({
      title: "Concentration",
      figure: (top.weight * 100).toFixed(0) + "%",
      body: `${top.name || top.symbol} is the largest line. Top-name risk is real if the thesis breaks.`,
      tone: top.weight > 0.28 ? "bad" : "warn",
    });
  } else {
    pts.push({
      title: "Spread",
      figure: n + " names",
      body: "No single line dominates. Size is spread across the portfolio.",
      tone: "good",
    });
  }

  if (windows?.y1?.port != null && windows.y1.bench != null) {
    const gap = windows.y1.port - windows.y1.bench;
    pts.push({
      title: "Vs index · 1Y",
      figure: (gap >= 0 ? "+" : "") + gap.toFixed(1) + " pp",
      body:
        gap >= 0
          ? "This portfolio beat the index over the last year."
          : "This portfolio lagged Nifty. The index is the default alternative — see the gap, don’t ignore it.",
      tone: gap >= 0 ? "good" : "bad",
    });
  }

  if (risk.maxDd != null) {
    pts.push({
      title: "Max drawdown",
      figure: risk.maxDd.toFixed(1) + "%",
      body: "Worst fall from a peak on this portfolio. Buy dates not required.",
      tone: risk.maxDd < -25 ? "bad" : "warn",
    });
  }

  if (risk.downCap != null) {
    pts.push({
      title: "Down capture",
      figure: (risk.downCap * 100).toFixed(0) + "%",
      body: risk.downCap < 1 ? "Fell less than the index on down days." : "Fell more than the index on down days.",
      tone: risk.downCap < 1 ? "good" : "bad",
    });
  }

  const off = holdings.filter((h) => h.offHigh != null && h.offHigh <= -20).length;
  if (off) {
    pts.push({
      title: "Off highs",
      figure: off + " names",
      body: "≥20% below 52-week high. Check thesis, don’t average blindly.",
      tone: "warn",
    });
  }

  if (missing?.length) {
    pts.push({
      title: "Chart coverage",
      figure: coverage,
      body: "No price history for " + missing.join(", ") + ". The chart uses the rest.",
      tone: "warn",
    });
  }

  const winners = holdings.filter((h) => h.unrealPct > 0).length;
  const losers = holdings.filter((h) => h.unrealPct < 0).length;
  pts.push({
    title: "Winners / losers",
    figure: winners + " / " + losers,
    body:
      losers > winners
        ? "More names are underwater. The usual trap is holding losers hoping they come back. Check the thesis, don’t wait for even."
        : "Unrealized vs average price on current quantity.",
    tone: winners >= losers ? "good" : "warn",
  });

  return pts.slice(0, 8);
}

export function assembleBook(args: {
  holdings: Holding[];
  quotes: Record<string, Quote>;
  histories: Record<string, Bar[]>;
  packs: Record<string, HistoryPack>;
  benchSymbol: string;
  benchName: string;
  asOf?: string;
  hxRange?: string;
  includeCommodities?: boolean;
}): Book {
  const { holdings, quotes, histories, packs, benchSymbol, benchName, asOf, hxRange } = args;
  const include = args.includeCommodities !== false;
  const benchBars = packs[benchSymbol]?.bars || [];

  const rows: HoldingRow[] = holdings.map((h) => {
    const qrow = quotes[baseKey(h.symbol)] || quotes[h.symbol] || ({} as Quote);
    const px = qrow.price || h.avg || 0;
    const value = h.qty * px;
    const invested = h.avg ? h.qty * h.avg : value;
    const unreal = h.avg ? value - invested : 0;
    const unrealPct = h.avg && h.avg > 0 ? (px / h.avg - 1) * 100 : 0;
    const offHigh = qrow.high52 ? (px / qrow.high52 - 1) * 100 : null;
    const qName = qrow.name && !isIsin(qrow.name) ? qrow.name : "";
    const fileSector = h.sector && h.sector !== "Other" ? h.sector : "";
    const sector = fileSector || sectorOf(h.symbol);
    const kind = isCommodity(h.symbol) ? "commodity" : h.kind || "equity";
    return {
      ...h,
      kind,
      unit: kind === "commodity" ? "g" : h.unit || "shares",
      name: displayName({ symbol: h.symbol, name: qName || h.name }),
      resolved: qrow.symbol || h.symbol,
      px,
      value,
      invested,
      unreal,
      unrealPct,
      changePct: qrow.changePct || 0,
      high52: qrow.high52 || 0,
      offHigh,
      sector,
      cap: capFromMcap(qrow.mcapCr, h.symbol),
      weight: 0,
      periods: holdingWindows(histories[h.symbol] || []),
      vsSectorY1: null,
      sectorIndexY1: null,
      sectorIndexName: "",
      daysHeld: null,
      xirr: null,
      vsNiftyHold: null,
      vsSectorHold: null,
      contrib: null,
    };
  });

  const active = include ? rows : rows.filter((r) => r.kind !== "commodity");
  const value = active.reduce((s, r) => s + r.value, 0);
  const invested = active.reduce((s, r) => s + r.invested, 0);
  rows.forEach((r) => {
    r.weight = r.kind === "commodity" && !include ? 0 : value ? r.value / value : 0;
  });
  const dayBits = active.map((r) => saneDayPnl(r.value, r.changePct));
  const dayAbs = dayBits.reduce((s, x) => s + x.abs, 0);
  const dayPct = value ? (dayAbs / value) * 100 : 0;

  const mix = buildMixPath(
    active.map((r) => ({ symbol: r.symbol, qty: r.qty, name: r.name, avg: r.avg, date: r.date, kind: r.kind, unit: r.unit })),
    histories,
    benchBars,
  );
  const nav1y = sliceNav(mix.nav, "1Y");
  const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
  const windows = {
    w1: windowReturn(mix.nav, 7),
    m1: windowReturn(mix.nav, 31),
    m3: windowReturn(mix.nav, 93),
    m6: windowReturn(mix.nav, 186),
    y1: windowReturn(mix.nav, 365),
    ytd: ytdReturn(mix.nav),
  };
  const months = monthBuckets(mix.nav);
  const cagr = mixCagr(mix.nav);

  const sectors: Record<string, { value: number; pnl: number }> = {};
  for (const r of active) {
    sectors[r.sector] = sectors[r.sector] || { value: 0, pnl: 0 };
    sectors[r.sector].value += r.value;
    sectors[r.sector].pnl += r.unreal;
  }

  const sleeves: Sleeve[] = sectorSleeve(active, histories).map((s) => {
    const spec = s.bench;
    const bars = packs[spec.symbol]?.bars || [];
    const idx = pathFromBars(bars, []);
    return {
      sector: s.sector,
      value: s.value,
      names: s.names,
      symbols: s.symbols,
      windows: s.windows,
      indexName: spec.name,
      indexSymbol: spec.symbol,
      index: {
        m1: windowReturn(idx.nav, 31).port,
        m3: windowReturn(idx.nav, 93).port,
        y1: windowReturn(idx.nav, 365).port,
        ytd: ytdReturn(idx.nav).port,
      },
    };
  });

  for (const r of rows) {
    const sl = sleeves.find((s) => s.sector === r.sector);
    r.sectorIndexY1 = sl?.index.y1 ?? null;
    r.sectorIndexName = sl?.indexName || "";
    r.vsSectorY1 = r.periods.y1 != null && sl?.index.y1 != null ? r.periods.y1 - sl.index.y1 : null;
  }

  const niftyBars = packs["^NSEI"]?.bars || (benchSymbol === "^NSEI" ? benchBars : []);
  const totalUnreal = active.reduce((s, r) => s + r.unreal, 0);
  for (const r of rows) {
    const sl = sleeves.find((s) => s.sector === r.sector);
    const sectorBars = sl ? packs[sl.indexSymbol]?.bars : undefined;
    const hr = holdingReturn({
      date: r.date,
      boughtAt: r.boughtAt,
      avg: r.avg,
      qty: r.qty,
      px: r.px,
      value: r.value,
      unreal: r.unreal,
      unrealPct: r.unrealPct,
      bars: histories[r.symbol],
      niftyBars,
      sectorBars,
      totalUnreal,
      lots: r.lots,
    });
    r.daysHeld = hr.daysHeld;
    r.xirr = hr.xirr;
    r.vsNiftyHold = hr.vsNifty;
    r.vsSectorHold = hr.vsSector;
    r.contrib = hr.contrib;
  }

  const caps: Record<string, number> = { Large: 0, Mid: 0, Small: 0, Micro: 0 };
  for (const r of active) caps[r.cap] = (caps[r.cap] || 0) + r.value;

  const commodityValue = rows.filter((r) => r.kind === "commodity").reduce((s, r) => s + r.value, 0);
  const equityValue = rows.filter((r) => r.kind !== "commodity").reduce((s, r) => s + r.value, 0);
  const levers = riskLevers(
    active.map((r) => ({ symbol: r.symbol, qty: r.qty, name: r.name, avg: r.avg, date: r.date, kind: r.kind, unit: r.unit })),
    histories,
    benchBars,
    active,
    risk,
    cagr,
  );
  const corr = buildCorrPack(active, histories, 12, benchBars);

  return {
    rows,
    value,
    invested,
    unreal: value - invested,
    dayAbs,
    dayPct,
    mix,
    risk,
    windows,
    months,
    cagr,
    sectors,
    sleeves,
    caps,
    asOf: asOf || "",
    hxRange: hxRange || "max",
    benchName,
    benchSymbol,
    coverage: mix.coverage,
    missing: mix.missing,
    holdings: rows,
    firstDay: mix.nav[0]?.day,
    lastDay: mix.nav.at(-1)?.day,
    includeCommodities: include,
    commodityValue,
    equityValue,
    levers,
    corr,
  };
}

export function previewAdd(
  holdings: Holding[],
  histories: Record<string, Bar[]>,
  benchBars: Bar[],
  add: Holding,
  addBars: Bar[],
  weight: number,
  px: number,
): { dSharpe: number | null; dMaxDd: number | null; dVol: number | null; dCagr: number | null } | null {
  if (!(weight > 0) || !(px > 0) || !holdings.length) return null;
  const hx = { ...histories, [add.symbol]: addBars };
  const baseMix = buildMixPath(holdings, histories, benchBars);
  const baseNav = sliceNav(baseMix.nav, "1Y");
  const baseline = riskMetrics(baseNav.length >= 60 ? baseNav : baseMix.nav);
  const baseCagr = mixCagr(baseMix.nav);
  const value = holdings.reduce((s, h) => {
    const last = (histories[h.symbol] || []).at(-1)?.c || 0;
    return s + h.qty * last;
  }, 0);
  if (!(value > 0)) return null;
  const qty = (weight * value) / ((1 - weight) * px);
  if (!(qty > 0)) return null;
  const key = add.symbol;
  let hit = false;
  const next = holdings.map((h) => {
    if (h.symbol !== key) return h;
    hit = true;
    return { ...h, qty: h.qty + qty };
  });
  const merged = hit ? next : [...next, { ...add, qty }];
  const mix = buildMixPath(merged, hx, benchBars);
  const nav1y = sliceNav(mix.nav, "1Y");
  const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
  const cagr = mixCagr(mix.nav);
  return {
    dSharpe: risk.sharpe != null && baseline.sharpe != null ? risk.sharpe - baseline.sharpe : null,
    dMaxDd: risk.maxDd != null && baseline.maxDd != null ? risk.maxDd - baseline.maxDd : null,
    dVol: risk.vol != null && baseline.vol != null ? risk.vol - baseline.vol : null,
    dCagr: cagr != null && baseCagr != null ? cagr - baseCagr : null,
  };
}

function riskLevers(
  holdings: Holding[],
  histories: Record<string, Bar[]>,
  benchBars: Bar[],
  rows: HoldingRow[],
  baseline: RiskMetrics,
  baselineCagr: number | null,
): RiskLever[] {
  const top = [...rows]
    .filter((r) => r.kind !== "commodity" && r.weight > 0 && r.qty > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);
  const out: RiskLever[] = [];
  for (const r of top) {
    for (const action of ["cut", "trim", "add"] as const) {
      const next = holdings
        .map((h) => {
          if (h.symbol !== r.symbol) return h;
          if (action === "cut") return { ...h, qty: 0 };
          if (action === "trim") return { ...h, qty: h.qty * 0.5 };
          return { ...h, qty: h.qty * 1.5 };
        })
        .filter((h) => h.qty > 0);
      if (!next.length) continue;
      const mix = buildMixPath(next, histories, benchBars);
      const nav1y = sliceNav(mix.nav, "1Y");
      const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
      const cagr = mixCagr(mix.nav);
      out.push({
        symbol: r.symbol,
        name: r.name,
        weight: r.weight,
        action,
        label: action === "cut" ? "Remove" : action === "trim" ? "Halve qty" : "Add 50%",
        sharpe: risk.sharpe,
        maxDd: risk.maxDd,
        vol: risk.vol,
        cagr,
        dSharpe: risk.sharpe != null && baseline.sharpe != null ? risk.sharpe - baseline.sharpe : null,
        dMaxDd: risk.maxDd != null && baseline.maxDd != null ? risk.maxDd - baseline.maxDd : null,
        dVol: risk.vol != null && baseline.vol != null ? risk.vol - baseline.vol : null,
        dCagr: cagr != null && baselineCagr != null ? cagr - baselineCagr : null,
      });
    }
  }
  return out;
}

export function leverImproveScore(l: Pick<RiskLever, "dSharpe" | "dMaxDd" | "dVol" | "dCagr">): number {
  const sharpe = l.dSharpe ?? 0;
  const dd = l.dMaxDd ?? 0;
  const vol = -(l.dVol ?? 0);
  const cagr = l.dCagr ?? 0;
  return sharpe * 4 + dd * 0.08 + vol * 0.08 + cagr * 0.08;
}

/** One action per name — the one that lifts the scores most. Improving moves first. */
export function pickMaterialLevers(levers: RiskLever[], cap = 5): RiskLever[] {
  const material = levers.filter((l) => {
    return (
      Math.abs(l.dSharpe || 0) >= 0.08 ||
      Math.abs(l.dMaxDd || 0) >= 1.2 ||
      Math.abs(l.dVol || 0) >= 1.2 ||
      Math.abs(l.dCagr || 0) >= 1.2
    );
  });
  const best = new Map<string, RiskLever>();
  for (const l of material) {
    const prev = best.get(l.symbol);
    if (!prev || leverImproveScore(l) > leverImproveScore(prev)) best.set(l.symbol, l);
  }
  return [...best.values()].sort((a, b) => leverImproveScore(b) - leverImproveScore(a)).slice(0, cap);
}

function baseKey(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

export function mergeNav(a: NavPoint[], b: NavPoint[]): NavPoint[] {
  const mb = new Map(b.map((p) => [p.day, p]));
  const ma = new Map(a.map((p) => [p.day, p]));
  const days = [...new Set([...ma.keys(), ...mb.keys()])].sort();
  let lastA: number | null = null;
  let lastB: number | null = null;
  const out: NavPoint[] = [];
  for (const day of days) {
    const pa = ma.get(day);
    const pb = mb.get(day);
    if (pa) lastA = pa.port;
    if (pb) lastB = pb.port;
    if (lastA == null || lastB == null) continue;
    const t = pa?.t || pb?.t || 0;
    out.push({
      t,
      day,
      port: lastA,
      bench: lastB,
      covered: 2,
      names: 2,
      wAvail: 1,
    });
  }
  return out;
}

export function withSleeveIndex(book: Book, packs: HistoryPack[]): Book {
  const idx: Record<string, HistoryPack> = {};
  for (const d of packs) {
    idx[d.input] = d;
    idx[d.symbol] = d;
  }
  return {
    ...book,
    sleeves: book.sleeves.map((s) => {
      const bars = idx[s.indexSymbol]?.bars || [];
      if (!bars.length) return s;
      const path = pathFromBars(bars, []);
      return {
        ...s,
        index: {
          m1: windowReturn(path.nav, 31).port,
          m3: windowReturn(path.nav, 93).port,
          y1: windowReturn(path.nav, 365).port,
          ytd: ytdReturn(path.nav).port,
        },
      };
    }),
  };
}
