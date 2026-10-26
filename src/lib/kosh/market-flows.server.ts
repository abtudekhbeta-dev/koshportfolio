/** Daily cash nets joined to an independent Nifty 50 history. Server-only. The archive is the store; the 20-minute cache is only a refresh timer. */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { aggregate, buildDays, findAnalogues, flowVerdict, mergeFlows, withMonthTotals, type FlowBar, type FlowFrame, type FlowPrint, type FlowVerdict, type MonthTotal } from "./market-flows.ts";
import { buildResearch, type ResearchBrief } from "./flow-research.ts";
import { seedFlows, seedMonths, seedNifty } from "./flow-seed.ts";
import {
  classifyFetchFailure,
  emptyHealth,
  expectedLatestSession,
  freshnessOf,
  parseHistoryJson,
  parseNseCash,
  parseStrotaCsv,
  shouldRetryFlow,
  type FlowHealth,
} from "./flow-ingest.ts";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FLOW_URL = "https://strota.in/fii-dii-data.csv";
const FLOW_PAGE = "https://strota.in/fii-dii-data";
const SEED_URL = "https://raw.githubusercontent.com/MrChartist/fii-dii-data/main/data/history.json";
const NSE_URL = "https://www.nseindia.com/api/fiidiiTradeReact";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
function archivePath(name: string) {
  return [
    join(process.cwd(), "data/flows", name),
    join(HERE, "../../../data/flows", name),
    join("/workspace/data/flows", name),
  ];
}
const FLOW_ARCHIVE = archivePath("cash-archive.json")[0];
const NIFTY_ARCHIVE = archivePath("nifty-archive.json")[0];
const MONTH_ARCHIVE = archivePath("monthly-archive.json")[0];
const MONTH_URL = "https://www.moneycontrol.com/techmvc/responsive/fiidii/getFiiDiiMonthly?classic=true&data=cash";
const DEFINITION = "The on-screen label is FII. The row is the official combined FII/FPI cash category, not a legacy FII-only series. NSDL FPI investment figures are a different series and are not mixed in.";

export type FlowCoverage = {
  jointFrom: string | null;
  jointTo: string | null;
  jointSessions: number;
  niftyFrom: string | null;
  niftyTo: string | null;
  niftySessions: number;
  mismatches: number;
  nse: string;
  stored: boolean;
  definition: string;
  rights: string;
  missingContext: string[];
};

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
  coverage: FlowCoverage;
  nifty: { symbol: "^NSEI"; source: string; missingSessions: number; from: string | null; to: string | null; sessions: number };
  daily: FlowBar[];
  weekly: FlowBar[];
  monthly: FlowBar[];
  verdicts: Record<FlowFrame, FlowVerdict | null>;
  analogue: ReturnType<typeof findAnalogues>;
  research: ResearchBrief;
  health: FlowHealth;
};

let cache: { at: number; data: FlowPack } | null = null;
let health: FlowHealth = emptyHealth();
/** Rebuilt when the flow file or the Nifty join changes. A delayed archive expires sooner so the next visit retries. */
const TTL = 20 * 60 * 1000;

function readRows(paths: string[]): FlowPrint[] {
  for (const path of paths) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as { rows?: FlowPrint[] } | FlowPrint[];
      const rows = Array.isArray(raw) ? raw : raw.rows;
      if (!Array.isArray(rows)) continue;
      const clean = rows.filter((row) => row && /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.fiiNet) && Number.isFinite(row.diiNet));
      if (clean.length) return clean;
    } catch {
      /* try the next location */
    }
  }
  return [];
}

function readMonths(paths: string[]): MonthTotal[] {
  for (const path of paths) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as { rows?: MonthTotal[] };
      const clean = (raw.rows || []).filter((row) => row && /^\d{4}-\d{2}$/.test(row.month) && Number.isFinite(row.fiiNet) && Number.isFinite(row.diiNet));
      if (clean.length) return clean;
    } catch {
      /* try the next location */
    }
  }
  return [];
}

function readCloses(paths: string[]): { date: string; close: number }[] {
  for (const path of paths) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as { rows?: { date: string; close: number }[] };
      const clean = (raw.rows || []).filter((row) => row && /^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.close > 0);
      if (clean.length) return clean;
    } catch {
      /* try the next location */
    }
  }
  return [];
}

function storedFlows() {
  return mergeFlows(seedFlows, [], readRows(archivePath("cash-archive.json"))).rows;
}

function storedMonths() {
  const map = new Map(seedMonths.map((row) => [row.month, row]));
  for (const row of readMonths(archivePath("monthly-archive.json"))) map.set(row.month, row);
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function storedCloses() {
  const disk = readCloses(archivePath("nifty-archive.json"));
  return disk.length >= seedNifty.length ? disk : seedNifty;
}

function writeJson(path: string, body: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(body));
}

function istToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

async function fetchText(url: string, headers: Record<string, string>, timeout: number) {
  let last: { status: number | null; name: string; message: string } = { status: null, name: "", message: "network" };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
      if (!res.ok) {
        last = { status: res.status, name: "", message: String(res.status) };
        const kind = classifyFetchFailure(res.status, "", String(res.status));
        if (!shouldRetryFlow(kind, attempt)) return { ok: false as const, status: res.status, kind, text: "" };
        continue;
      }
      return { ok: true as const, status: res.status, text: await res.text() };
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      const message = err instanceof Error ? err.message : "network";
      last = { status: null, name, message };
      const kind = classifyFetchFailure(null, name, message);
      if (!shouldRetryFlow(kind, attempt)) return { ok: false as const, status: null, kind, text: "" };
    }
  }
  return { ok: false as const, status: last.status, kind: classifyFetchFailure(last.status, last.name, last.message), text: "" };
}

async function loadPrints() {
  const retrievedAt = new Date().toISOString();
  const [strotaRes, seedRes, nseRes] = await Promise.all([
    fetchText(FLOW_URL, { "User-Agent": UA, Accept: "text/csv" }, 15_000),
    fetchText(SEED_URL, { "User-Agent": UA, Accept: "application/json" }, 20_000),
    fetchText(NSE_URL, { "User-Agent": UA, Accept: "application/json", Referer: "https://www.nseindia.com/reports/fii-dii" }, 8_000),
  ]);
  const strotaParsed = strotaRes.ok ? parseStrotaCsv(strotaRes.text) : { rows: [] as FlowPrint[], rejected: 0 };
  let seed: FlowPrint[] = [];
  let seedRejected = 0;
  if (seedRes.ok) {
    try {
      const parsed = parseHistoryJson(JSON.parse(seedRes.text));
      seed = parsed.rows;
      seedRejected = parsed.rejected;
    } catch {
      seedRejected = 1;
    }
  }
  let official: FlowPrint[] = [];
  let nse = "blocked";
  if (nseRes.ok) {
    try {
      const parsed = parseNseCash(JSON.parse(nseRes.text));
      official = parsed.rows;
      nse = official.length ? `official cash print ${official.map((row) => row.date).join(", ")}` : "NSE returned no complete cash pair";
    } catch {
      nse = "NSE body was not the cash table";
    }
  } else {
    nse = nseRes.kind === "auth" ? `NSE HTTP ${nseRes.status || 403}` : `NSE ${nseRes.kind}`;
  }
  const strotaMap = new Map(strotaParsed.rows.map((row) => [row.date, row]));
  for (const row of official) strotaMap.set(row.date, row);
  const recent = [...strotaMap.values()];
  const failure = !strotaRes.ok && !seedRes.ok && !official.length ? strotaRes.ok ? null : strotaRes.kind : null;
  return {
    strota: recent,
    seed,
    retrievedAt,
    nse,
    rejected: strotaParsed.rejected + seedRejected,
    failure,
    fallback: !strotaRes.ok && (seed.length > 0 || official.length > 0),
    providerStatus: strotaRes.ok ? `strota ${strotaParsed.rows.length}` : `strota ${strotaRes.kind}`,
  };
}

function tryWrite(path: string, body: unknown) {
  try {
    writeJson(path, body);
    return true;
  } catch {
    return false;
  }
}

async function niftyCloses() {
  const period1 = 1167609600;
  const period2 = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&includePrePost=false&period1=${period1}&period2=${period2}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error("Nifty history " + res.status);
  const data = (await res.json()) as {
    chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[] }> }; meta?: { regularMarketPrice?: number; regularMarketTime?: number } }> };
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
  const live = result?.meta?.regularMarketPrice;
  if (live && live > 0 && result.meta?.regularMarketTime) {
    const date = new Date(result.meta.regularMarketTime * 1000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    if (!rows.some((row) => row.date === date)) rows.push({ date, close: live });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function blankCoverage(extra?: Partial<FlowCoverage>): FlowCoverage {
  return {
    jointFrom: null,
    jointTo: null,
    jointSessions: 0,
    niftyFrom: null,
    niftyTo: null,
    niftySessions: 0,
    mismatches: 0,
    nse: "not checked",
    stored: false,
    definition: DEFINITION,
    rights: "Stored rows are third-party republications of the provisional cash series, kept so a failed fetch does not wipe them. This is not an NSE licence and it is not a 10-year official archive.",
    missingContext: ["India VIX", "advance/decline breadth", "sector concentration", "USD/INR", "derivatives positioning"],
    ...extra,
  };
}

function parseMonthlyHtml(html: string): MonthTotal[] {
  const names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const out: MonthTotal[] = [];
  const seen = new Set<string>();
  for (const tr of html.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
    const text = tr.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const named = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
    const nums = [...text.matchAll(/-?[\d,]+\.\d+/g)].map((item) => Number(item[0].replace(/,/g, "")));
    if (!named || nums.length < 6) continue;
    const month = `${named[2]}-${String(names.indexOf(named[1].toLowerCase()) + 1).padStart(2, "0")}`;
    if (seen.has(month) || !Number.isFinite(nums[2]) || !Number.isFinite(nums[5])) continue;
    seen.add(month);
    out.push({ month, fiiNet: nums[2], diiNet: nums[5] });
  }
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

async function fetchMonthTotals() {
  const res = await fetch(MONTH_URL, {
    headers: { "User-Agent": UA, Accept: "text/html", Referer: "https://www.moneycontrol.com/markets/fii-dii-data/" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  const rows = parseMonthlyHtml(await res.text());
  if (rows.length < 24) throw new Error("short monthly file");
  return rows;
}

function empty(reason: string, retrievedAt: string): FlowPack {
  return {
    unavailable: reason,
    source: {
      name: "Stored cash-flow archive",
      url: FLOW_URL,
      page: FLOW_PAGE,
      note: DEFINITION,
      status: "Provisional",
      retrievedAt,
      from: null,
      latest: null,
      sessions: 0,
    },
    nifty: { symbol: "^NSEI", source: "Yahoo Finance", missingSessions: 0, from: null, to: null, sessions: 0 },
    daily: [],
    weekly: [],
    monthly: [],
    verdicts: { daily: null, weekly: null, monthly: null },
    analogue: { ok: false, reason: "No flow file, so no historical comparison." },
    research: buildResearch({ index: [], days: [], daily: [], weekly: [], monthly: [] }),
    coverage: blankCoverage(),
    health: emptyHealth({ status: "unavailable", failure: "empty", providerStatus: reason, lastAttempt: retrievedAt }),
  };
}

export async function loadFlowPack(): Promise<FlowPack> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const flows = storedFlows();
  const latest = flows[flows.length - 1]?.date || null;
  const expected = expectedLatestSession(new Date());
  if (!latest || latest < expected || !cache) {
    await Promise.race([refresh(), new Promise((resolve) => setTimeout(resolve, 14_000))]);
  }
  if (cache && (Date.now() - cache.at < TTL || (cache.data.health.latest && cache.data.health.latest >= expected))) return cache.data;
  const index = storedCloses();
  const months = storedMonths();
  if (flows.length >= 5) {
    const monthFrom = months[0]?.month;
    health = {
      ...health,
      status: freshnessOf(latest, new Date()),
      latest,
      expected,
      sourceName: "Stored cash-flow archive",
      failure: health.failure,
    };
    const data = buildPack({
      flows,
      index,
      months,
      retrievedAt: new Date().toISOString(),
      niftySource: "Stored Yahoo Finance closes",
      nse: health.providerStatus || "using stored file",
      mismatches: 0,
      note: `${DEFINITION} Served from the stored archive. Daily sessions: ${flows[0]?.date || "—"} to ${latest || "—"}. Expected session ${expected}. Monthly totals${monthFrom ? ` from ${monthFrom}` : ""} fill earlier months.`,
    });
    cache = { at: Date.now() - TTL + 60_000, data };
    return data;
  }
  return cache?.data || empty("The cash-flow files did not return a usable series, and the stored archive is empty.", new Date().toISOString());
}

function buildPack(input: {
  flows: FlowPrint[];
  index: { date: string; close: number }[];
  months: MonthTotal[];
  retrievedAt: string;
  niftySource: string;
  note: string;
  nse: string;
  mismatches: number;
}): FlowPack {
  const days = buildDays(input.flows, input.index);
  const today = istToday();
  const daily = aggregate(days, input.index, "daily", today);
  const weekly = aggregate(days, input.index, "weekly", today);
  const monthly = withMonthTotals(aggregate(days, input.index, "monthly", today), input.months, input.index, today);
  const last = (bars: FlowBar[]) => (bars.length ? flowVerdict(bars[bars.length - 1], bars) : null);
  const from = days[0]?.date || null;
  const latest = days[days.length - 1]?.date || null;
  const niftyFrom = input.index[0]?.date || null;
  const niftyTo = input.index[input.index.length - 1]?.date || null;
  const monthFrom = monthly[0]?.start || null;
  return {
    unavailable: null,
    source: {
      name: "Cash series: daily file plus monthly totals",
      url: FLOW_URL,
      page: MONTH_URL,
      note: input.note,
      status: "Provisional",
      retrievedAt: input.retrievedAt,
      from: monthFrom || from,
      latest,
      sessions: days.length,
    },
    coverage: blankCoverage({
      jointFrom: from,
      jointTo: latest,
      jointSessions: days.length,
      niftyFrom,
      niftyTo,
      niftySessions: input.index.length,
      mismatches: input.mismatches,
      nse: input.nse,
      stored: true,
    }),
    nifty: {
      symbol: "^NSEI",
      source: input.niftySource,
      missingSessions: days.filter((day) => day.nifty == null).length,
      from: niftyFrom,
      to: niftyTo,
      sessions: input.index.length,
    },
    daily,
    weekly,
    monthly,
    verdicts: { daily: last(daily), weekly: last(weekly), monthly: last(monthly) },
    analogue: findAnalogues(days),
    research: buildResearch({ index: input.index, days, daily, weekly, monthly }),
    health,
  };
}

let refreshing: Promise<void> | null = null;

async function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const started = Date.now();
    const attempt = new Date().toISOString();
    health = { ...health, status: "updating", lastAttempt: attempt };
    try {
      const loaded = await loadPrints();
      const archive = storedFlows();
      const merged = mergeFlows(archive, loaded.seed, loaded.strota);
      if (merged.rows.length < archive.length || merged.rows.length < 5) {
        health = {
          ...health,
          status: freshnessOf(archive.at(-1)?.date || null, new Date()),
          latest: archive.at(-1)?.date || null,
          expected: expectedLatestSession(new Date()),
          lastAttempt: attempt,
          failure: loaded.failure || "empty",
          providerStatus: loaded.providerStatus,
          fallback: loaded.fallback,
          durationMs: Date.now() - started,
          fetched: loaded.strota.length,
          rejected: loaded.rejected,
          wrote: false,
        };
        return;
      }
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      const before = new Map(archive.map((row) => [row.date, `${row.fiiNet}|${row.diiNet}`]));
      for (const row of merged.rows) {
        const prev = before.get(row.date);
        if (!prev) inserted += 1;
        else if (prev !== `${row.fiiNet}|${row.diiNet}`) updated += 1;
        else skipped += 1;
      }
      const wrote = tryWrite(FLOW_ARCHIVE, { updatedAt: loaded.retrievedAt, rights: "Third-party cash nets. Not an NSE bulk licence.", rows: merged.rows });
      let index = storedCloses();
      let niftySource = index.length ? "Stored Yahoo Finance closes" : "Yahoo Finance daily closes";
      try {
        const fresh = await niftyCloses();
        if (fresh.length >= index.length) {
          index = fresh;
          niftySource = "Yahoo Finance daily closes";
          tryWrite(NIFTY_ARCHIVE, { updatedAt: loaded.retrievedAt, symbol: "^NSEI", rows: fresh });
        }
      } catch {
        niftySource = index.length ? "Stored Yahoo Finance closes (live fetch failed)" : niftySource;
      }
      let months = storedMonths();
      try {
        const freshMonths = await fetchMonthTotals();
        if (freshMonths.length >= months.length) {
          months = freshMonths;
          tryWrite(MONTH_ARCHIVE, {
            updatedAt: loaded.retrievedAt,
            source: MONTH_URL,
            note: "Moneycontrol monthly cash totals. Not reconstructed daily sessions.",
            rows: freshMonths,
          });
        }
      } catch {
        /* keep the stored months */
      }
      const latest = merged.rows[merged.rows.length - 1]?.date || null;
      const expected = expectedLatestSession(new Date());
      health = {
        status: freshnessOf(latest, new Date()),
        latest,
        expected,
        lastAttempt: attempt,
        lastSuccess: loaded.retrievedAt,
        fetched: loaded.strota.length + loaded.seed.length,
        inserted,
        updated,
        rejected: loaded.rejected,
        skipped,
        providerStatus: `${loaded.providerStatus}; ${loaded.nse}`,
        failure: loaded.failure,
        fallback: loaded.fallback,
        durationMs: Date.now() - started,
        sourceName: "Strota cash CSV, with the stored archive kept on failure",
        sourceUrl: FLOW_URL,
        wrote,
      };
      tryWrite(archivePath("health.json")[0], health);
      const monthFrom = months[0]?.month;
      const note = `${DEFINITION} Daily sessions on file: ${merged.rows.length}${merged.liveFrom ? `, recent file from ${merged.liveFrom}` : ""}. Monthly cash totals${monthFrom ? ` from ${monthFrom}` : ""} are the Moneycontrol republication and are used only for months without a daily print. NSE check: ${loaded.nse}.`;
      cache = {
        at: Date.now(),
        data: buildPack({
          flows: merged.rows,
          index,
          months,
          retrievedAt: loaded.retrievedAt,
          niftySource,
          note,
          nse: loaded.nse,
          mismatches: merged.mismatches,
        }),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "refresh failed";
      health = {
        ...health,
        status: freshnessOf(health.latest, new Date()),
        lastAttempt: attempt,
        failure: classifyFetchFailure(null, err instanceof Error ? err.name : "", message),
        providerStatus: message.slice(0, 160),
        durationMs: Date.now() - started,
        wrote: false,
      };
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** Manual refresh. A second call while one is running joins that job instead of starting another. */
export async function refreshCashFlows() {
  await refresh();
  return cache?.data.health || health;
}
