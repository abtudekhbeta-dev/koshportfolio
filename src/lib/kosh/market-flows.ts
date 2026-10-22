/** Cash-flow maths. Missing index prints stay missing. Combined net is FII + DII, not total market flow. */

export type FlowPrint = { date: string; fiiNet: number; diiNet: number };
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
  recovery: "not confirmed" | "not applicable";
};

export type Analogue = {
  end: string;
  distance: number;
  fiiNet: number;
  diiNet: number;
  indexReturn: number | null;
  forward20: number | null;
};

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

/** ₹250 crore per session is treated as flat. A real zero stays flat; a missing return does not. */
export function flowSide(net: number, sessions: number): FlowSide {
  const band = 250 * Math.max(1, sessions);
  if (net > band) return "buying";
  if (net < -band) return "selling";
  return "flat";
}

/** A move inside ±0.15% is treated as flat. A missing return is unknown, not zero. */
export function indexSide(ret: number | null): FlowVerdict["index"] {
  if (ret == null || !Number.isFinite(ret)) return "unknown";
  if (ret >= 0.15) return "up";
  if (ret <= -0.15) return "down";
  return "flat";
}

export function flowVerdict(bar: FlowBar): FlowVerdict {
  const fii = flowSide(bar.fiiNet, bar.sessions);
  const dii = flowSide(bar.diiNet, bar.sessions);
  const index = indexSide(bar.indexReturn);
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
  const text = `${bar.label}: FII/FPI ${fmtSigned(bar.fiiNet)} Cr, DII ${fmtSigned(bar.diiNet)} Cr, Nifty ${ret}. ${
    offsetting ? "The two flows offset each other. " : ""
  }This describes the window. It does not say who caused the move.`;
  return { title, text, fii, dii, index, offsetting, recovery: index === "up" && !bothSell ? "not confirmed" : "not confirmed" };
}

function fmtSigned(n: number) {
  const body = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (n > 0) return "+" + body;
  if (n < 0) return "−" + body;
  return body;
}

/**
 * Compare the latest 20-session window with earlier non-overlapping windows.
 * Features use only data up to each window's end. Forward returns are computed after that date.
 * Refuses when the file cannot support a 20-session outcome.
 */
export function findAnalogues(days: FlowDay[]): { ok: true; matches: Analogue[] } | { ok: false; reason: string } {
  if (days.length < 250) {
    return {
      ok: false,
      reason: `Not enough comparable history. This file has ${days.length} sessions. A 20-session match with a later outcome needs at least 250.`,
    };
  }
  const window = 20;
  const latestEnd = days.length - 1;
  const query = vector(days, latestEnd - window + 1, latestEnd);
  if (!query) return { ok: false, reason: "The latest window has no usable index return." };
  const matches: Analogue[] = [];
  for (let end = window - 1; end <= latestEnd - window - 20; end += window) {
    const start = end - window + 1;
    const past = vector(days, start, end);
    if (!past) continue;
    const distance = Math.hypot(query.fiiZ - past.fiiZ, query.diiZ - past.diiZ, (query.ret ?? 0) - (past.ret ?? 0));
    const later = days[end + 20];
    const now = days[end];
    const forward20 = later?.nifty && now.nifty ? ((later.nifty / now.nifty - 1) * 100) : null;
    matches.push({
      end: now.date,
      distance,
      fiiNet: past.fii,
      diiNet: past.dii,
      indexReturn: past.ret,
      forward20,
    });
  }
  matches.sort((a, b) => a.distance - b.distance);
  if (matches.length < 3) return { ok: false, reason: "Fewer than three non-overlapping windows. No analogue is shown." };
  return { ok: true, matches: matches.slice(0, 5) };
}

function vector(days: FlowDay[], start: number, end: number) {
  const slice = days.slice(start, end + 1);
  if (slice.length < 5) return null;
  const fii = slice.reduce((sum, row) => sum + row.fiiNet, 0);
  const dii = slice.reduce((sum, row) => sum + row.diiNet, 0);
  const first = slice.find((row) => row.nifty != null)?.nifty ?? null;
  const last = [...slice].reverse().find((row) => row.nifty != null)?.nifty ?? null;
  const ret = first && last ? ((last / first - 1) * 100) : null;
  const scale = Math.max(1, slice.length);
  return { fii, dii, ret, fiiZ: fii / (500 * scale), diiZ: dii / (500 * scale) };
}
