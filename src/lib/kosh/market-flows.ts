/** Cash-flow maths. Missing index prints stay missing. Combined net is FII + DII, not total market flow. */

export type FlowPrint = {
  date: string;
  fiiNet: number;
  diiNet: number;
  fiiBuy?: number | null;
  fiiSell?: number | null;
  diiBuy?: number | null;
  diiSell?: number | null;
};
export type IndexPrint = { date: string; close: number };

export type FlowDay = FlowPrint & { nifty: number | null };

export type FlowFrame = "daily" | "weekly" | "monthly";

export type FlowBar = {
  key: string;
  label: string;
  start: string;
  end: string;
  sessions: number;
  partial: boolean;
  fiiNet: number;
  diiNet: number;
  indexStart: number | null;
  indexEnd: number | null;
  /** Percent from the prior close to the last close in the bucket. Null if either print is missing. */
  indexReturn: number | null;
};

export type FlowSide = "buying" | "selling" | "flat";

export type FlowVerdict = {
  title: string;
  text: string;
  fii: FlowSide;
  dii: FlowSide;
  index: "up" | "down" | "flat" | "unknown";
  offsetting: boolean;
  recovery: "not confirmed";
  /** True when the sample is too short for a rank, so the fixed band is used. */
  provisional: boolean;
};

export type Analogue = {
  start: string;
  end: string;
  distance: number;
  fiiNet: number;
  diiNet: number;
  indexReturn: number | null;
  forward20: number | null;
};

import { normalizeFlow } from "./flow-ingest.ts";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function buildDays(flows: FlowPrint[], index: IndexPrint[]): FlowDay[] {
  const px = new Map<string, number>();
  for (const row of index) {
    if (ISO.test(row.date) && Number.isFinite(row.close) && row.close > 0) px.set(row.date, row.close);
  }
  const seen = new Set<string>();
  const days: FlowDay[] = [];
  for (const row of flows) {
    if (!ISO.test(row.date) || seen.has(row.date)) continue;
    if (!Number.isFinite(row.fiiNet) || !Number.isFinite(row.diiNet)) continue;
    seen.add(row.date);
    const close = px.get(row.date);
    days.push({ date: row.date, fiiNet: row.fiiNet, diiNet: row.diiNet, nifty: close ?? null });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

export function weekKey(iso: string): string {
  const date = new Date(iso + "T00:00:00Z");
  const day = date.getUTCDay() || 7;
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function bucketKey(date: string, frame: FlowFrame): string {
  if (frame === "daily") return date;
  if (frame === "weekly") return weekKey(date);
  return date.slice(0, 7);
}

function bucketLabel(key: string, frame: FlowFrame, partial: boolean): string {
  const base = frame === "monthly" ? key : key;
  return partial ? `${base} · partial` : base;
}

export function aggregate(days: FlowDay[], index: IndexPrint[], frame: FlowFrame, today: string): FlowBar[] {
  const px = index
    .filter((row) => ISO.test(row.date) && Number.isFinite(row.close) && row.close > 0)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const groups = new Map<string, FlowDay[]>();
  for (const day of days) {
    const key = bucketKey(day.date, frame);
    const list = groups.get(key) || [];
    list.push(day);
    groups.set(key, list);
  }
  const todayKey = ISO.test(today) ? bucketKey(today, frame) : "";
  const bars: FlowBar[] = [];
  for (const [key, rows] of groups) {
    rows.sort((a, b) => a.date.localeCompare(b.date));
    const start = rows[0].date;
    const end = rows[rows.length - 1].date;
    let prior: number | null = null;
    let endPx: number | null = null;
    for (const print of px) {
      if (print.date < start) prior = print.close;
      if (print.date >= start && print.date <= end) endPx = print.close;
    }
    const partial = frame !== "daily" && key === todayKey;
    bars.push({
      key,
      label: bucketLabel(key, frame, partial),
      start,
      end,
      sessions: rows.length,
      partial,
      fiiNet: rows.reduce((sum, row) => sum + row.fiiNet, 0),
      diiNet: rows.reduce((sum, row) => sum + row.diiNet, 0),
      indexStart: prior,
      indexEnd: endPx,
      indexReturn: prior != null && endPx != null && prior > 0 ? ((endPx / prior - 1) * 100) : null,
    });
  }
  return bars.sort((a, b) => a.start.localeCompare(b.start));
}

export type MonthTotal = { month: string; fiiNet: number; diiNet: number };

function monthLastDay(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, mon, 0));
  return date.toISOString().slice(0, 10);
}

/**
 * Published month totals fill months that have no daily sessions.
 * A month already built from daily prints is left alone. No daily rows are invented.
 */
export function withMonthTotals(dailyBars: FlowBar[], totals: MonthTotal[], index: IndexPrint[], today: string): FlowBar[] {
  const have = new Set(dailyBars.map((bar) => bar.key));
  const px = index
    .filter((row) => ISO.test(row.date) && row.close > 0)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const todayMonth = ISO.test(today) ? today.slice(0, 7) : "";
  const extra: FlowBar[] = [];
  for (const row of totals) {
    if (!/^\d{4}-\d{2}$/.test(row.month) || have.has(row.month)) continue;
    if (!Number.isFinite(row.fiiNet) || !Number.isFinite(row.diiNet)) continue;
    const start = `${row.month}-01`;
    const end = monthLastDay(row.month);
    let prior: number | null = null;
    let endPx: number | null = null;
    for (const print of px) {
      if (print.date < start) prior = print.close;
      if (print.date >= start && print.date <= end) endPx = print.close;
    }
    const partial = row.month === todayMonth;
    extra.push({
      key: row.month,
      label: partial ? `${row.month} · partial` : row.month,
      start,
      end: partial ? today : end,
      sessions: 0,
      partial,
      fiiNet: row.fiiNet,
      diiNet: row.diiNet,
      indexStart: prior,
      indexEnd: endPx,
      indexReturn: prior != null && endPx != null && prior > 0 ? ((endPx / prior - 1) * 100) : null,
    });
  }
  return [...dailyBars, ...extra].sort((a, b) => a.start.localeCompare(b.start));
}

/** ₹250 crore per session is a provisional flat band. A rank is used once 60 windows exist. */
export function flowSide(net: number, sessions: number): FlowSide {
  const band = sessions === 0 ? 5000 : 250 * Math.max(1, sessions);
  if (net > band) return "buying";
  if (net < -band) return "selling";
  return "flat";
}

function rankSide(value: number, sample: number[]): FlowSide | null {
  if (sample.length < 60) return null;
  const below = sample.filter((item) => item < value).length;
  const rank = below / sample.length;
  if (rank >= 0.8) return "buying";
  if (rank <= 0.2) return "selling";
  return "flat";
}

function rankIndex(ret: number, sample: number[]): FlowVerdict["index"] | null {
  if (sample.length < 60) return null;
  const below = sample.filter((item) => item < ret).length;
  const rank = below / sample.length;
  if (rank >= 0.8) return "up";
  if (rank <= 0.2) return "down";
  return "flat";
}

/** A move inside ±0.15% is flat. A missing return is unknown, not zero. */
export function indexSide(ret: number | null): FlowVerdict["index"] {
  if (ret == null || !Number.isFinite(ret)) return "unknown";
  if (ret >= 0.15) return "up";
  if (ret <= -0.15) return "down";
  return "flat";
}

export function flowVerdict(bar: FlowBar, peers: FlowBar[] = []): FlowVerdict {
  const comparable = peers.filter((peer) => !peer.partial && peer.sessions === bar.sessions && peer.key !== bar.key);
  const fiiRank = rankSide(bar.fiiNet, comparable.map((peer) => peer.fiiNet));
  const diiRank = rankSide(bar.diiNet, comparable.map((peer) => peer.diiNet));
  const returns = comparable.map((peer) => peer.indexReturn).filter((value): value is number => value != null && Number.isFinite(value));
  const indexRank = bar.indexReturn == null ? null : rankIndex(bar.indexReturn, returns);
  const provisional = fiiRank == null || diiRank == null;
  const fii = fiiRank || flowSide(bar.fiiNet, bar.sessions);
  const dii = diiRank || flowSide(bar.diiNet, bar.sessions);
  const index = bar.indexReturn == null ? "unknown" : indexRank || indexSide(bar.indexReturn);
  const offsetting = (fii === "selling" && dii === "buying") || (fii === "buying" && dii === "selling");
  const bothBuy = fii === "buying" && dii === "buying";
  const bothSell = fii === "selling" && dii === "selling";
  let title = "Flows and the index do not tell one story";
  if (offsetting && fii === "selling" && index === "down") title = "Domestic buying is cushioning foreign selling";
  else if (offsetting && fii === "selling" && index === "up") title = "Domestic buying is offsetting foreign selling, and the index is up";
  else if (offsetting && fii === "buying" && index === "down") title = "Foreign buying is offset by domestic selling, and the index is down";
  else if (bothBuy && index === "up") title = "Both sets of institutions are buying with the index";
  else if (bothSell && index === "down") title = "Both sets of institutions are selling with the index";
  else if (bothBuy && index === "down") title = "Institutions are buying, but the index is still down";
  else if (bothSell && index === "up") title = "Institutions are selling, but the index is up";
  else if (bothBuy && index === "flat") title = "Both sets of institutions bought. The index barely moved";
  else if (bothSell && index === "flat") title = "Both sets of institutions sold. The index barely moved";
  else if (index === "unknown") title = "Flow print is in. The index return for this window is missing";
  const ret = bar.indexReturn == null ? "no index return" : `${bar.indexReturn >= 0 ? "+" : ""}${bar.indexReturn.toFixed(1)}%`;
  const method = bar.sessions === 0
    ? "This row is a published month total. The sessions inside the month are not in the file, so none were invented."
    : provisional
      ? "The buy/sell labels use a provisional band of ₹250 crore a session and ±0.15% on the index. The stored sample is too short to rank this window."
      : `The labels are ranks against ${comparable.length} stored windows of the same length. A top or bottom fifth is called buying, selling, up or down. This is not a forecast.`;
  const text = `${bar.label}: FII ${fmtSigned(bar.fiiNet)} Cr, DII ${fmtSigned(bar.diiNet)} Cr, Nifty ${ret}. ${
    offsetting ? "The two flows offset each other. " : ""
  }${method} This describes the window. It does not say who caused the move.`;
  return { title, text, fii, dii, index, offsetting, recovery: "not confirmed", provisional };
}

function fmtSigned(n: number) {
  const body = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (n > 0) return "+" + body;
  if (n < 0) return "−" + body;
  return body;
}

/** Recent rows win. The seed fills only dates before that file. The archive fills gaps and is kept when a live fetch fails. Missing dates stay missing. */
export function mergeFlows(archive: FlowPrint[], seed: FlowPrint[], recent: FlowPrint[]) {
  const clean = (rows: FlowPrint[]) => {
    const map = new Map<string, FlowPrint>();
    for (const row of rows) {
      const kept = normalizeFlow(row);
      if (kept) map.set(kept.date, kept);
    }
    return map;
  };
  const stored = clean(archive);
  const older = clean(seed);
  const live = clean(recent);
  const liveDates = [...live.keys()].sort();
  const liveFrom = liveDates[0] || null;
  let mismatches = 0;
  if (liveFrom) {
    for (const [date, row] of older) {
      const current = live.get(date);
      if (!current) continue;
      if (Math.abs(current.fiiNet - row.fiiNet) > 5 || Math.abs(current.diiNet - row.diiNet) > 5) mismatches += 1;
    }
  }
  const map = new Map<string, FlowPrint>();
  for (const [date, row] of stored) map.set(date, row);
  for (const [date, row] of older) {
    if (liveFrom && date >= liveFrom) continue;
    map.set(date, row);
  }
  for (const [date, row] of live) map.set(date, row);
  const rows = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { rows, mismatches, liveFrom };
}

/**
 * Latest 20-session window against earlier non-overlapping windows.
 * A window with a missing index close is skipped. Missing returns are never treated as zero.
 * Scaling uses only windows that ended before the current one.
 * Refuses below 250 sessions. A match is a description, not a probability.
 */
export function findAnalogues(days: FlowDay[]): { ok: true; matches: Analogue[]; note: string } | { ok: false; reason: string } {
  if (days.length < 250) {
    return {
      ok: false,
      reason: `Not enough comparable history. This file has ${days.length} cash sessions. A 20-session match with a later outcome needs at least 250, and this archive does not have it. No analogue is shown.`,
    };
  }
  const window = 20;
  const built: Array<{ start: number; end: number; fii: number; dii: number; ret: number }> = [];
  for (let end = window - 1; end < days.length; end += window) {
    const slice = days.slice(end - window + 1, end + 1);
    const first = slice[0]?.nifty;
    const last = slice[slice.length - 1]?.nifty;
    if (first == null || last == null || !(first > 0) || !(last > 0)) continue;
    built.push({
      start: end - window + 1,
      end,
      fii: slice.reduce((sum, row) => sum + row.fiiNet, 0),
      dii: slice.reduce((sum, row) => sum + row.diiNet, 0),
      ret: (last / first - 1) * 100,
    });
  }
  if (built.length < 8) return { ok: false, reason: "Too many windows are missing an index close. No analogue is shown." };
  const query = built[built.length - 1];
  const history = built.filter((item) => item.end <= query.start - window);
  if (history.length < 5) return { ok: false, reason: "Fewer than five completed windows sit before the latest one. No analogue is shown." };
  const scale = (key: "fii" | "dii" | "ret") => {
    const values = history.map((item) => item[key]).slice().sort((a, b) => a - b);
    const mid = values[Math.floor(values.length / 2)];
    const abs = values.map((value) => Math.abs(value - mid)).sort((a, b) => a - b);
    const mad = abs[Math.floor(abs.length / 2)] || 1;
    return { mid, mad };
  };
  const fiiScale = scale("fii");
  const diiScale = scale("dii");
  const retScale = scale("ret");
  const z = (value: number, band: { mid: number; mad: number }) => (value - band.mid) / band.mad;
  const qz = { fii: z(query.fii, fiiScale), dii: z(query.dii, diiScale), ret: z(query.ret, retScale) };
  const matches: Analogue[] = history.map((item) => {
    const distance = Math.hypot(qz.fii - z(item.fii, fiiScale), qz.dii - z(item.dii, diiScale), qz.ret - z(item.ret, retScale));
    const now = days[item.end];
    const later = days[item.end + window];
    const forward20 = later?.nifty && now?.nifty ? ((later.nifty / now.nifty - 1) * 100) : null;
    return {
      start: days[item.start].date,
      end: now.date,
      distance,
      fiiNet: item.fii,
      diiNet: item.dii,
      indexReturn: item.ret,
      forward20,
    };
  });
  matches.sort((a, b) => a.distance - b.distance);
  return {
    ok: true,
    matches: matches.slice(0, 8),
    note: "Nearest non-overlapping windows, scaled only on earlier history. Forward returns include losses. No hit rate has been tested, so this is not a probability.",
  };
}
