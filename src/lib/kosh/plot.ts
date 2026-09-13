import {
  monthBuckets,
  rollingSeries,
  sliceNav,
  toIndexed,
  weekBuckets,
  withDrawdown,
} from "./engine.ts";
import type { ChartMode, ChartRange, NavPoint } from "./types";

export type PlotRow = { day: string; port: number | null; bench: number | null };
export type PlotStyle = "area" | "line" | "step" | "bar" | "columns";

export const MIX_STROKE = "#7aa2ff";
export const BENCH_STROKE = "#9a9aa4";
export const DOWN_STROKE = "#ef6e6e";
export const GRID_STROKE = "#26262b";
export const TICK_FILL = "#6e6e76";
export const ZERO_STROKE = "#34343b";
export const SMA_STROKE = "#c4b08a";
export const PLOT_BG = "#161618";
export const UP_FILL = "#3dcf8e";

export const VW = 800;
export const VH = 300;
export const PAD = { l: 54, r: 16, t: 16, b: 28 };

export function thin(rows: PlotRow[], cap = 360): PlotRow[] {
  if (rows.length <= cap) return rows;
  const step = (rows.length - 1) / (cap - 1);
  const out: PlotRow[] = [];
  let last = -1;
  for (let i = 0; i < cap - 1; i++) {
    const idx = Math.round(i * step);
    if (idx === last) continue;
    out.push(rows[idx]);
    last = idx;
  }
  const tail = rows[rows.length - 1];
  if (out[out.length - 1] !== tail) out.push(tail);
  return out;
}

export function buildRows(
  nav: NavPoint[],
  mode: ChartMode,
  range: ChartRange,
  nowValue?: number,
): { rows: PlotRow[]; yTitle: string; bar: boolean } {
  const sliced = sliceNav(nav, range);
  if (mode === "dd") {
    const idx = withDrawdown(toIndexed(sliced));
    let bPeak = 0;
    const ddRows = idx.map((p) => {
      let bench: number | null = null;
      if (p.benchIdx != null && p.benchIdx > 0) {
        bPeak = Math.max(bPeak, p.benchIdx);
        bench = bPeak ? ((p.benchIdx - bPeak) / bPeak) * 100 : 0;
      }
      return { day: p.day, port: p.dd, bench };
    });
    return { rows: thin(ddRows), yTitle: "Drawdown %", bar: false };
  }
  if (mode === "gap") {
    const idx = toIndexed(sliced);
    return {
      rows: thin(
        idx.map((p) => ({
          day: p.day,
          port: p.benchIdx != null ? p.portIdx - p.benchIdx : null,
          bench: 0,
        })),
      ),
      yTitle: "Gap vs index pp",
      bar: false,
    };
  }
  if (mode === "roll1y" || mode === "roll3m") {
    const days = mode === "roll3m" ? 93 : 365;
    const src = sliced.length > 20 ? sliced : nav;
    const rs = rollingSeries(src, days);
    return {
      rows: thin(rs.map((p) => ({ day: p.day, port: p.port, bench: p.bench }))),
      yTitle: mode === "roll3m" ? "Rolling 3M %" : "Rolling 1Y %",
      bar: false,
    };
  }
  if (mode === "m") {
    const src = sliced.length > 10 ? sliced : nav;
    const ms = monthBuckets(src);
    return { rows: ms.map((p) => ({ day: p.key, port: p.port, bench: p.bench })), yTitle: "Month %", bar: true };
  }
  if (mode === "w") {
    const src = sliced.length > 10 ? sliced : nav;
    const ws = weekBuckets(src);
    return { rows: ws.map((p) => ({ day: p.key, port: p.port, bench: p.bench })), yTitle: "Week %", bar: true };
  }
  const idx = toIndexed(sliced);
  if (mode === "inr" && nowValue && nowValue > 0) {
    const last = [...idx].reverse().find((p) => p.portIdx > 0);
    const scale = last && last.portIdx ? nowValue / last.portIdx : nowValue / 100;
    return {
      rows: thin(
        idx.map((p) => ({
          day: p.day,
          port: p.portIdx * scale,
          bench: p.benchIdx != null ? p.benchIdx * scale : null,
        })),
      ),
      yTitle: "₹ portfolio",
      bar: false,
    };
  }
  return {
    rows: thin(idx.map((p) => ({ day: p.day, port: p.portIdx, bench: p.benchIdx }))),
    yTitle: "Indexed 100",
    bar: false,
  };
}

export function domain(rows: PlotRow[]): { lo: number; hi: number } {
  const vals: number[] = [];
  for (const r of rows) {
    if (r.port != null && Number.isFinite(r.port)) vals.push(r.port);
    if (r.bench != null && Number.isFinite(r.bench)) vals.push(r.bench);
  }
  if (!vals.length) return { lo: 0, hi: 1 };
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  if (lo === hi) {
    const pad = Math.max(Math.abs(lo) * 0.08, 1);
    return { lo: lo - pad, hi: hi + pad };
  }
  const span = hi - lo || 1;
  lo -= span * 0.1;
  hi += span * 0.1;
  return { lo, hi };
}

export function xOf(i: number, n: number) {
  const plotW = VW - PAD.l - PAD.r;
  return PAD.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
}

export function yOf(v: number, lo: number, hi: number) {
  const plotH = VH - PAD.t - PAD.b;
  return PAD.t + ((hi - v) / (hi - lo || 1)) * plotH;
}

type Pt = { x: number; y: number };

function ptsOf(rows: PlotRow[], key: "port" | "bench", lo: number, hi: number): (Pt | null)[] {
  const n = rows.length;
  return rows.map((r, i) => {
    const v = r[key];
    if (v == null || !Number.isFinite(v)) return null;
    return { x: xOf(i, n), y: yOf(v, lo, hi) };
  });
}

function segsOf(pts: (Pt | null)[]): Pt[][] {
  const segs: Pt[][] = [];
  let cur: Pt[] = [];
  for (const p of pts) {
    if (!p) {
      if (cur.length) segs.push(cur);
      cur = [];
    } else cur.push(p);
  }
  if (cur.length) segs.push(cur);
  return segs;
}

export function seriesPath(rows: PlotRow[], key: "port" | "bench", lo: number, hi: number): string {
  const n = rows.length;
  const parts: string[] = [];
  let drawing = false;
  for (let i = 0; i < n; i++) {
    const v = rows[i][key];
    if (v == null || !Number.isFinite(v)) {
      drawing = false;
      continue;
    }
    const x = xOf(i, n);
    const y = yOf(v, lo, hi);
    parts.push(`${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
    drawing = true;
  }
  return parts.join(" ");
}

function catmull(seg: Pt[]): string {
  if (!seg.length) return "";
  if (seg.length === 1) return `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
  if (seg.length === 2)
    return `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)} L${seg[1].x.toFixed(2)} ${seg[1].y.toFixed(2)}`;
  const t = 0.2;
  let d = `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
  for (let i = 0; i < seg.length - 1; i++) {
    const p0 = seg[i - 1] || seg[i];
    const p1 = seg[i];
    const p2 = seg[i + 1];
    const p3 = seg[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function smoothPath(rows: PlotRow[], key: "port" | "bench", lo: number, hi: number): string {
  return segsOf(ptsOf(rows, key, lo, hi)).map(catmull).join(" ");
}

export function stepPath(rows: PlotRow[], key: "port" | "bench", lo: number, hi: number): string {
  return segsOf(ptsOf(rows, key, lo, hi))
    .map((seg) => {
      if (!seg.length) return "";
      let d = `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
      for (let i = 1; i < seg.length; i++) {
        d += ` H${seg[i].x.toFixed(2)} V${seg[i].y.toFixed(2)}`;
      }
      return d;
    })
    .join(" ");
}

function closeArea(line: string, first: Pt | null, last: Pt | null, baseY: number): string {
  if (!line.startsWith("M") || !first || !last) return "";
  return `${line} L${last.x.toFixed(2)} ${baseY.toFixed(2)} L${first.x.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

export function areaPath(rows: PlotRow[], lo: number, hi: number): string {
  const line = seriesPath(rows, "port", lo, hi);
  const pts = ptsOf(rows, "port", lo, hi).filter((p): p is Pt => Boolean(p));
  const base = yOf(Math.min(hi, Math.max(lo, 0)), lo, hi);
  return closeArea(line, pts[0] || null, pts.at(-1) || null, base);
}

export function smoothAreaPath(rows: PlotRow[], lo: number, hi: number): string {
  const line = smoothPath(rows, "port", lo, hi);
  const pts = ptsOf(rows, "port", lo, hi).filter((p): p is Pt => Boolean(p));
  const base = yOf(lo, lo, hi);
  return closeArea(line, pts[0] || null, pts.at(-1) || null, base);
}

export function fmtTick(day: string) {
  if (/^\d{4}-\d{2}$/.test(day)) return day.slice(2);
  if (day.length >= 10) return day.slice(2);
  return day;
}

export function niceY(v: number, rupee: boolean) {
  if (!Number.isFinite(v)) return "—";
  if (rupee) {
    const a = Math.abs(v);
    const s = v < 0 ? "−" : "";
    if (a >= 1e7) return s + "₹" + (a / 1e7).toFixed(2) + " Cr";
    if (a >= 1e5) return s + "₹" + (a / 1e5).toFixed(2) + " L";
    if (a >= 1000) return s + "₹" + Math.round(a).toLocaleString("en-IN");
    return s + "₹" + a.toFixed(0);
  }
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function yTicks(lo: number, hi: number, n = 5): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(lo + ((hi - lo) * i) / (n - 1));
  return out;
}

export function countable(rows: PlotRow[], key: "port" | "bench") {
  return rows.filter((r) => r[key] != null && Number.isFinite(r[key] as number)).length;
}

export function smaRows(rows: PlotRow[], win = 21): PlotRow[] {
  const out: PlotRow[] = [];
  const q: number[] = [];
  let sum = 0;
  for (const r of rows) {
    const v = r.port;
    if (v == null || !Number.isFinite(v)) {
      out.push({ day: r.day, port: null, bench: null });
      continue;
    }
    q.push(v);
    sum += v;
    if (q.length > win) sum -= q.shift()!;
    out.push({
      day: r.day,
      port: q.length >= Math.min(8, win) ? sum / q.length : null,
      bench: null,
    });
  }
  return out;
}

export type Extreme = { i: number; v: number; ch: number; day: string };

export function extremes(rows: PlotRow[]): {
  peak: Extreme;
  trough: Extreme;
  best: Extreme;
  worst: Extreme;
} {
  const empty: Extreme = { i: -1, v: 0, ch: 0, day: "" };
  let peak = { ...empty, v: -Infinity };
  let trough = { ...empty, v: Infinity };
  let best = { ...empty, ch: -Infinity };
  let worst = { ...empty, ch: Infinity };
  let prev: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i].port;
    if (v == null || !Number.isFinite(v)) continue;
    if (v > peak.v) peak = { i, v, ch: 0, day: rows[i].day };
    if (v < trough.v) trough = { i, v, ch: 0, day: rows[i].day };
    if (prev != null && prev !== 0) {
      const ch = (v / prev - 1) * 100;
      if (ch > best.ch) best = { i, v, ch, day: rows[i].day };
      if (ch < worst.ch) worst = { i, v, ch, day: rows[i].day };
    }
    prev = v;
  }
  return { peak, trough, best, worst };
}

export function yearMarks(rows: PlotRow[]): { i: number; year: string }[] {
  const out: { i: number; year: string }[] = [];
  let last = "";
  for (let i = 0; i < rows.length; i++) {
    const y = String(rows[i].day || "").slice(0, 4);
    if (y && y !== last) {
      if (last) out.push({ i, year: y });
      last = y;
    }
  }
  return out;
}

export function sparkHeights(rows: PlotRow[], cap = 96): { h: number; pos: boolean }[] {
  const src = thin(rows, cap);
  const { lo, hi } = domain(src);
  const span = hi - lo || 1;
  return src.map((r) => ({
    h: r.port == null || !Number.isFinite(r.port) ? 0 : ((r.port - lo) / span) * 100,
    pos: (r.port ?? 0) >= 0,
  }));
}

function xmlEsc(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function paintBars(
  p: string[],
  rows: PlotRow[],
  lo: number,
  hi: number,
  mixStroke: string,
  kind: "period" | "level" | "change",
) {
  const n = rows.length;
  const bw = Math.max(1.4, ((VW - PAD.l - PAD.r) / Math.max(1, n)) * (kind === "change" ? 0.72 : 0.58));
  const zero = yOf(Math.min(hi, Math.max(lo, 0)), lo, hi);
  const floor = yOf(lo, lo, hi);
  rows.forEach((r, i) => {
    if (r.port == null || !Number.isFinite(r.port)) return;
    if (kind === "change") {
      const prev = i > 0 ? rows[i - 1].port : r.port;
      if (prev == null || !Number.isFinite(prev)) return;
      const ch = r.port - prev;
      const y1 = yOf(prev, lo, hi);
      const y2 = yOf(r.port, lo, hi);
      const top = Math.min(y1, y2);
      const h = Math.max(1.4, Math.abs(y2 - y1));
      const fill = ch >= 0 ? UP_FILL : DOWN_STROKE;
      p.push(
        `<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}" fill-opacity="0.88" rx="0.6"/>`,
      );
      return;
    }
    if (kind === "level") {
      const y1 = yOf(r.port, lo, hi);
      const h = Math.max(1.4, floor - y1);
      p.push(
        `<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${y1.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${mixStroke}" fill-opacity="0.78" rx="0.6"/>`,
      );
      return;
    }
    const y1 = yOf(r.port, lo, hi);
    const top = Math.min(zero, y1);
    const h = Math.max(1.8, Math.abs(zero - y1));
    const fill = r.port >= 0 ? mixStroke : DOWN_STROKE;
    p.push(
      `<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"/>`,
    );
  });
}

export function buildSvgDoc(args: {
  rows: PlotRow[];
  bar: boolean;
  rupee: boolean;
  mixStroke: string;
  sma?: PlotRow[];
  years?: { i: number; year: string }[];
  peak?: Extreme;
  showSma?: boolean;
  fill?: boolean;
  showBench?: boolean;
  style?: PlotStyle;
}): string {
  const { rows, bar, rupee, mixStroke } = args;
  const n = rows.length;
  const style: PlotStyle = args.style || (args.fill === false ? "line" : "area");
  const extra = args.showSma && args.sma ? args.sma : [];
  const { lo, hi } = domain(rows.concat(extra));
  const ticks = yTicks(lo, hi);
  const wantBench = args.showBench !== false;
  const showBench = wantBench && countable(rows, "bench") >= 2;
  const useBars = bar || style === "bar" || style === "columns";
  const pathFn = style === "step" ? stepPath : smoothPath;
  const portD = useBars ? "" : pathFn(rows, "port", lo, hi);
  const benchD = useBars || !showBench ? "" : pathFn(rows, "bench", lo, hi);
  const fillOn = !useBars && (style === "area" || (args.fill !== false && style !== "line" && style !== "step"));
  const fillD = fillOn ? smoothAreaPath(rows, lo, hi) : "";
  const smaD = !useBars && args.showSma && args.sma ? pathFn(args.sma, "port", lo, hi) : "";
  const xCount = Math.min(6, n);
  const xIdx = n
    ? Array.from({ length: xCount }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, xCount - 1)))
    : [];

  const p: string[] = [];
  p.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" preserveAspectRatio="none" data-kosh="plot">`,
  );
  if (fillOn) {
    p.push(`<defs>`);
    p.push(
      `<linearGradient id="koshFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${mixStroke}" stop-opacity="0.32"/><stop offset="100%" stop-color="${mixStroke}" stop-opacity="0"/></linearGradient>`,
    );
    p.push(`</defs>`);
  }
  for (const v of ticks) {
    const y = yOf(v, lo, hi);
    p.push(
      `<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${VW - PAD.r}" y2="${y.toFixed(2)}" stroke="${GRID_STROKE}" stroke-width="1"/>`,
    );
    p.push(
      `<text x="${PAD.l - 6}" y="${y.toFixed(2)}" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="end" dominant-baseline="middle">${xmlEsc(niceY(v, rupee))}</text>`,
    );
  }
  if (lo < 0 && hi > 0) {
    const y = yOf(0, lo, hi);
    p.push(
      `<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${VW - PAD.r}" y2="${y.toFixed(2)}" stroke="${ZERO_STROKE}" stroke-width="1"/>`,
    );
  }
  for (const y of args.years || []) {
    const x = xOf(y.i, n);
    p.push(
      `<text x="${x.toFixed(2)}" y="${PAD.t + 11}" fill="${TICK_FILL}" font-size="9" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${xmlEsc(y.year)}</text>`,
    );
  }
  for (const i of xIdx) {
    if (!rows[i]) continue;
    p.push(
      `<text x="${xOf(i, n).toFixed(2)}" y="${VH - 8}" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${xmlEsc(fmtTick(rows[i].day))}</text>`,
    );
  }
  if (useBars) {
    const kind = bar ? "period" : style === "bar" ? "change" : "level";
    paintBars(p, rows, lo, hi, mixStroke, kind);
  } else {
    if (fillD) p.push(`<path d="${fillD}" fill="url(#koshFill)" stroke="none"/>`);
    if (smaD.startsWith("M")) {
      p.push(
        `<path d="${smaD}" fill="none" stroke="${SMA_STROKE}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`,
      );
    }
    if (benchD.startsWith("M")) {
      p.push(
        `<path d="${benchD}" fill="none" stroke="${BENCH_STROKE}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>`,
      );
    }
    if (portD.startsWith("M")) {
      p.push(
        `<path d="${portD}" fill="none" stroke="${mixStroke}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>`,
      );
    }
    const lastI = [...rows.keys()].reverse().find((i) => rows[i].port != null && Number.isFinite(rows[i].port as number));
    if (lastI != null && rows[lastI].port != null) {
      const x = xOf(lastI, n);
      const y = yOf(rows[lastI].port as number, lo, hi);
      p.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.6" fill="${mixStroke}" stroke="#09090b" stroke-width="1.4"/>`,
      );
    }
  }
  p.push(`</svg>`);
  return p.join("");
}

export function svgDataUrl(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
