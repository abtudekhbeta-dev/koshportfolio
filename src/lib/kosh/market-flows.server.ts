/** Daily FII/FPI and DII cash nets, joined to Nifty 50 closes. Server-only. */

import { aggregate, buildDays, findAnalogues, flowVerdict, type FlowBar, type FlowFrame, type FlowVerdict } from "./market-flows.ts";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FLOW_URL = "https://strota.in/fii-dii-data.csv";
const FLOW_PAGE = "https://strota.in/fii-dii-data";
const SEED_URL = "https://raw.githubusercontent.com/MrChartist/fii-dii-data/main/data/history.json";

export type FlowPack = {
  unavailable: string | null;
  source: {
    name: string;
    url: string;
    page: string;
    note: string;
    status: "Provisional";
    retrievedAt: string;
    from: string | null;
    latest: string | null;
    sessions: number;
  };
  nifty: { symbol: "^NSEI"; source: string; missingSessions: number };
  daily: FlowBar[];
  weekly: FlowBar[];
  monthly: FlowBar[];
  verdicts: Record<FlowFrame, FlowVerdict | null>;
  analogue: { ok: false; reason: string } | { ok: true; matches: ReturnType<typeof findAnalogues> extends infer T ? T extends { ok: true } ? T["matches"] : never : never };
};

let cache: { at: number; data: FlowPack } | null = null;
/** Rebuilt when the flow file or the Nifty join changes. */
const TTL = 20 * 60 * 1000;

function istToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function seedIso(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(match[2].toLowerCase());
  if (month < 0) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function parseSeed(raw: unknown) {
  if (!Array.isArray(raw)) return [] as { date: string; fiiNet: number; diiNet: number }[];
  const out: { date: string; fiiNet: number; diiNet: number }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const date = seedIso(String(rec.date || ""));
    const fiiNet = Number(rec.fii_net);
    const diiNet = Number(rec.dii_net);
    if (!date || !Number.isFinite(fiiNet) || !Number.isFinite(diiNet)) continue;
    out.push({ date, fiiNet, diiNet });
  }
  return out;
}

async function loadPrints() {
  const retrievedAt = new Date().toISOString();
  let strota: { date: string; fiiNet: number; diiNet: number }[] = [];
  try {
    const res = await fetch(FLOW_URL, { headers: { "User-Agent": UA, Accept: "text/csv" }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(String(res.status));
    strota = parseCsv(await res.text());
  } catch {
    strota = [];
  }
  let seed: { date: string; fiiNet: number; diiNet: number }[] = [];
  try {
    const res = await fetch(SEED_URL, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
    if (res.ok) seed = parseSeed(await res.json());
  } catch {
    seed = [];
  }
  const strotaFrom = strota.slice().sort((a, b) => a.date.localeCompare(b.date))[0]?.date || null;
  const map = new Map<string, { date: string; fiiNet: number; diiNet: number }>();
  for (const row of seed) {
    if (strotaFrom && row.date >= strotaFrom) continue;
    map.set(row.date, row);
  }
  for (const row of strota) map.set(row.date, row);
  const flows = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  const seedFrom = seed.slice().sort((a, b) => a.date.localeCompare(b.date))[0]?.date || null;
  return { flows, strotaCount: strota.length, seedFrom, strotaFrom, retrievedAt };
}
function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const out: { date: string; fiiNet: number; diiNet: number }[] = [];
  for (const line of lines.slice(1)) {
    const [date, fii, dii] = line.split(",");
    const fiiNet = Number(fii);
    const diiNet = Number(dii);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!Number.isFinite(fiiNet) || !Number.isFinite(diiNet)) continue;
    out.push({ date, fiiNet, diiNet });
  }
  return out;
}

async function niftyCloses(from: string) {
  const period1 = Math.floor(new Date(from + "T00:00:00Z").getTime() / 1000) - 10 * 86400;
  const period2 = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&includePrePost=false&period1=${period1}&period2=${period2}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error("Nifty history " + res.status);
  const data = (await res.json()) as {
    chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[] }> } }> };
  };
  const result = data.chart?.result?.[0];
  const ts = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const rows: { date: string; close: number }[] = [];
  for (let i = 0; i < ts.length; i++) {
    const close = closes[i];
    if (close == null || !(close > 0)) continue;
    const date = new Date(ts[i] * 1000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    rows.push({ date, close });
  }
  const meta = result?.meta as { regularMarketPrice?: number; regularMarketTime?: number } | undefined;
  const live = meta?.regularMarketPrice;
  if (live && live > 0 && meta?.regularMarketTime) {
    const date = new Date(meta.regularMarketTime * 1000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    if (!rows.some((row) => row.date === date)) rows.push({ date, close: live });
  }
  return rows;
}

function empty(reason: string, retrievedAt: string): FlowPack {
  return {
    unavailable: reason,
    source: {
      name: "Strota daily cash-flow file",
      url: FLOW_URL,
      page: FLOW_PAGE,
      note: "NSE's own report endpoint is blocked from this server. This file republishes the provisional combined cash-market series. Gross buy and sell are not in the file.",
      status: "Provisional",
      retrievedAt,
      from: null,
      latest: null,
      sessions: 0,
    },
    nifty: { symbol: "^NSEI", source: "Yahoo Finance", missingSessions: 0 },
    daily: [],
    weekly: [],
    monthly: [],
    verdicts: { daily: null, weekly: null, monthly: null },
    analogue: { ok: false, reason: "No flow file, so no historical comparison." },
  };
}

export async function loadFlowPack(): Promise<FlowPack> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const loaded = await loadPrints();
  const { flows, retrievedAt, seedFrom, strotaFrom, strotaCount } = loaded;
  if (flows.length < 5) {
    const data = empty("The cash-flow files did not return a usable daily series.", retrievedAt);
    cache = { at: Date.now(), data };
    return data;
  }
  let index: { date: string; close: number }[] = [];
  try {
    index = await niftyCloses(flows[0].date);
  } catch {
    index = [];
  }
  const days = buildDays(flows, index);
  const today = istToday();
  const daily = aggregate(days, index, "daily", today);
  const weekly = aggregate(days, index, "weekly", today);
  const monthly = aggregate(days, index, "monthly", today);
  const last = (bars: FlowBar[]) => (bars.length ? flowVerdict(bars[bars.length - 1]) : null);
  const analogue = findAnalogues(days);
  const from = days[0]?.date || null;
  const latest = days[days.length - 1]?.date || null;
  const data: FlowPack = {
    unavailable: null,
    source: {
      name: "NSE provisional cash series",
      url: FLOW_URL,
      page: FLOW_PAGE,
      note: `Daily FII/FPI and DII net cash, ₹ crore. ${strotaCount} recent sessions are from the Strota file${strotaFrom ? ` (${strotaFrom} onward)` : ""}. Earlier sessions${seedFrom ? ` back to ${seedFrom}` : ""} are from the Mr Chartist history file of the same series. Where the two files overlap, the Strota row is kept. NSE's own report is blocked from this server, so this chart cannot go further back. NSDL FPI figures are a different series and are not mixed in. Gross buy and sell are not on every row.`,
      status: "Provisional",
      retrievedAt,
      from,
      latest,
      sessions: days.length,
    },
    nifty: { symbol: "^NSEI", source: "Yahoo Finance daily closes", missingSessions: days.filter((day) => day.nifty == null).length },
    daily,
    weekly,
    monthly,
    verdicts: { daily: last(daily), weekly: last(weekly), monthly: last(monthly) },
    analogue: analogue.ok ? analogue : { ok: false, reason: analogue.reason },
  };
  cache = { at: Date.now(), data };
  return data;
}
