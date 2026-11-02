/** NSE results pipeline. BSE is attempted and the failure is kept when the exchange refuses the request. */

import { parseIstDate } from "./dates.ts";
import {
  announcementRole,
  buildResultsCalendar,
  meetingDateFromNotice,
  periodEndFromText,
  reconcileExchanges,
  type CalendarSourceHealth,
  type RawFiling,
  type RawMeeting,
  type ResultsPack,
} from "./results-calendar.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let cache: { at: number; version: number; data: ResultsPack } | null = null;
const TTL = 5 * 60 * 1000;
const STALE_OK = 6 * 60 * 60 * 1000;
const CACHE_VERSION = 6;

function nseQueryDay(offsetDays: number): string {
  const t = new Date(Date.now() + offsetDays * 86400000 + 5.5 * 60 * 60 * 1000);
  const dd = String(t.getUTCDate()).padStart(2, "0");
  const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${t.getUTCFullYear()}`;
}

/** Upcoming meetings are announced days or weeks ahead. The undated feed is only the latest batch. */
async function pullMeetings(index: "equities" | "sme"): Promise<unknown> {
  const dated = `https://www.nseindia.com/api/corporate-board-meetings?index=${index}&from_date=${nseQueryDay(-90)}&to_date=${nseQueryDay(75)}`;
  try {
    return await getJson(dated);
  } catch {
    return await getJson(`https://www.nseindia.com/api/corporate-board-meetings?index=${index}`);
  }
}

async function pullAnnouncements(index: "equities" | "sme"): Promise<unknown> {
  const dated = `https://www.nseindia.com/api/corporate-announcements?index=${index}&from_date=${nseQueryDay(-21)}&to_date=${nseQueryDay(1)}`;
  try {
    return await getJson(dated);
  } catch {
    return await getJson(`https://www.nseindia.com/api/corporate-announcements?index=${index}`);
  }
}

function ymd(d: Date): string {
  const t = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return t.toISOString().slice(0, 10).replace(/-/g, "");
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*",
      Referer: "https://www.nseindia.com/",
    },
    signal: AbortSignal.timeout(22_000),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function listOf(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter((row) => row && typeof row === "object") as Record<string, unknown>[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown[] }).data)) {
    return (raw as { data: Record<string, unknown>[] }).data;
  }
  return [];
}

function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return v == null ? "" : String(v).trim();
}

function nseMeetings(raw: unknown): RawMeeting[] {
  return listOf(raw).map((row) => ({
    symbol: str(row, "bm_symbol"),
    name: str(row, "sm_name"),
    isin: str(row, "sm_isin") || null,
    date: str(row, "bm_date") || null,
    purpose: str(row, "bm_purpose") || null,
    desc: str(row, "bm_desc") || null,
    originalDate: str(row, "oriiginalMeetingDate") || str(row, "originalMeetingDate") || null,
    proposedDate: str(row, "proposedMeetingDate") || null,
    attachment: str(row, "attachment") || str(row, "ixbrl") || null,
    timestamp: str(row, "bm_timestamp") || null,
  }));
}

function nseFilings(raw: unknown, sourceName = "NSE financial results"): RawFiling[] {
  const out: RawFiling[] = [];
  for (const row of listOf(raw)) {
    const filed = str(row, "filingDate") || str(row, "broadCastDate");
    const day = parseIstDate(filed);
    if (!day) continue;
    out.push({
      symbol: str(row, "symbol"),
      name: str(row, "companyName"),
      isin: str(row, "isin") || null,
      filedAt: day,
      filedStamp: filed,
      periodEnd: parseIstDate(str(row, "toDate")),
      quarter: str(row, "relatingTo") || str(row, "period") || null,
      url: str(row, "xbrl") || null,
      source: sourceName,
      revised: str(row, "reInd").toUpperCase() === "Y",
      consolidated: /consolidat/i.test(str(row, "consolidated")) ? true : /standalone/i.test(str(row, "consolidated")) ? false : null,
    });
  }
  return out;
}

function nseAnnouncements(raw: unknown, sourceName = "NSE corporate announcements"): { meetings: RawMeeting[]; filings: RawFiling[] } {
  const meetings: RawMeeting[] = [];
  const filings: RawFiling[] = [];
  for (const row of listOf(raw)) {
    const desc = str(row, "desc");
    const text = str(row, "attchmntText");
    const role = announcementRole(desc, text);
    if (role === "ignore") continue;
    const symbol = str(row, "symbol");
    const name = str(row, "sm_name");
    const when = str(row, "an_dt") || str(row, "sort_date");
    const file = str(row, "attchmntFile");
    if (role === "filing") {
      filings.push({
        symbol,
        name,
        isin: str(row, "sm_isin") || null,
        filedAt: parseIstDate(when),
        filedStamp: when,
        periodEnd: periodEndFromText(text),
        quarter: null,
        url: file || null,
        source: sourceName,
        revised: /revised/i.test(desc + text),
      });
      continue;
    }
    const held = meetingDateFromNotice(`${desc} ${text}`);
    if (!held) continue;
    meetings.push({
      symbol,
      name,
      isin: str(row, "sm_isin") || null,
      date: held,
      purpose: desc,
      desc: text || desc,
      attachment: file || null,
      timestamp: when,
    });
  }
  return { meetings, filings };
}

function nseEvents(raw: unknown): RawMeeting[] {
  const out: RawMeeting[] = [];
  for (const row of listOf(raw)) {
    const purpose = str(row, "purpose");
    if (!/financial result/i.test(purpose)) continue;
    out.push({
      symbol: str(row, "symbol"),
      name: str(row, "company"),
      date: str(row, "date") || null,
      purpose,
      desc: str(row, "bm_desc") || purpose,
    });
  }
  return out;
}

function newest(rows: { filedAt?: string | null; date?: string | null }[]): string | null {
  let best: string | null = null;
  for (const row of rows) {
    const day = parseIstDate(row.filedAt || "") || parseIstDate(row.date || "") || row.filedAt || row.date || null;
    if (day && (!best || day > best)) best = day;
  }
  return best;
}

function source(
  id: string,
  name: string,
  url: string,
  ok: boolean,
  count: number,
  newestDay: string | null,
  error: string | null,
): CalendarSourceHealth {
  return { id, name, url, ok, count, newest: newestDay, error };
}

async function pull(): Promise<ResultsPack> {
  type Bucket = { meetings: RawMeeting[]; filings: RawFiling[]; health: CalendarSourceHealth };
  const boardPage = "https://www.nseindia.com/companies-listing/corporate-filings-board-meetings";
  const eventPage = "https://www.nseindia.com/companies-listing/corporate-filings-event-calendar";
  const resultsPage = "https://www.nseindia.com/companies-listing/corporate-filings-financial-results";
  const annPage = "https://www.nseindia.com/companies-listing/corporate-filings-announcements";
  const cutoff = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);

  async function bucket(id: string, name: string, url: string, run: () => Promise<Omit<Bucket, "health">>): Promise<Bucket> {
    try {
      const got = await run();
      const count = got.meetings.length + got.filings.length;
      return {
        ...got,
        health: source(id, name, url, true, count, newest([...got.filings, ...got.meetings.map((row) => ({ date: row.date }))]), null),
      };
    } catch (err) {
      return {
        meetings: [],
        filings: [],
        health: source(id, name, url, false, 0, null, err instanceof Error ? err.message : "Request failed"),
      };
    }
  }

  const jobs: (() => Promise<Bucket>)[] = [
    () =>
      bucket("nse-board", "NSE board meetings", boardPage, async () => {
        const rows = nseMeetings(await pullMeetings("equities"));
        return { meetings: rows, filings: [] };
      }),
    () =>
      bucket("nse-events", "NSE event calendar", eventPage, async () => {
        const rows = nseEvents(await getJson("https://www.nseindia.com/api/event-calendar"));
        return { meetings: rows, filings: [] };
      }),
    () =>
      bucket("nse-results", "NSE financial results", resultsPage, async () => {
        const rows = nseFilings(await getJson("https://www.nseindia.com/api/corporates-financial-results?index=equities&period=Quarterly")).filter(
          (row) => (row.filedAt || "") >= cutoff,
        );
        return { meetings: [], filings: rows };
      }),
    () =>
      bucket("nse-ann", "NSE latest announcements", annPage, async () => {
        const parsed = nseAnnouncements(await pullAnnouncements("equities"));
        return { meetings: parsed.meetings, filings: parsed.filings };
      }),
    () =>
      bucket("nse-sme-board", "NSE SME board meetings", boardPage, async () => {
        const rows = nseMeetings(await pullMeetings("sme"));
        return { meetings: rows, filings: [] };
      }),
    () =>
      bucket("nse-sme-results", "NSE SME financial results", resultsPage, async () => {
        const rows = nseFilings(
          await getJson("https://www.nseindia.com/api/corporates-financial-results?index=sme&period=Quarterly"),
          "NSE SME financial results",
        ).filter((row) => (row.filedAt || "") >= cutoff);
        return { meetings: [], filings: rows };
      }),
    () =>
      bucket("nse-sme-ann", "NSE SME latest announcements", annPage, async () => {
        const parsed = nseAnnouncements(await pullAnnouncements("sme"), "NSE SME announcements");
        return { meetings: parsed.meetings, filings: parsed.filings };
      }),
    () => pullBse(),
  ];

  const buckets: Bucket[] = new Array(jobs.length);
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor++;
      buckets[index] = await jobs[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, () => worker()));

  const meetings: RawMeeting[] = [];
  const filings: RawFiling[] = [];
  const sources: CalendarSourceHealth[] = [];
  for (const part of buckets) {
    meetings.push(...part.meetings);
    filings.push(...part.filings);
    sources.push(part.health);
  }

  return {
    events: reconcileExchanges(buildResultsCalendar(meetings, filings, "NSE")),
    health: {
      refreshedAt: new Date().toISOString(),
      stale: false,
      sources,
      limitation: null,
    },
    asOf: new Date().toISOString(),
  };
}

/** BSE is probed. Rows are not mapped until a response shape has actually been seen. */
async function pullBse(): Promise<{ meetings: RawMeeting[]; filings: RawFiling[]; health: CalendarSourceHealth }> {
  const page = "https://www.bseindia.com/corporates/Comp_Resultsnew.aspx";
  const today = new Date();
  const from = new Date(today.getTime() - 45 * 86400000);
  let error = "HTTP 403";
  try {
    const res = await fetch(
      `https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=Result&strPrevDate=${ymd(from)}&strScrip=&strSearch=P&strToDate=${ymd(today)}&strType=C&subcategory=-1`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
          Referer: "https://www.bseindia.com/corporates/ann.html",
        },
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const body = (await res.json()) as unknown;
    const rows = Array.isArray(body) ? body : body && typeof body === "object" && Array.isArray((body as { Table?: unknown[] }).Table) ? (body as { Table: unknown[] }).Table : null;
    if (!rows) throw new Error("Unrecognised BSE payload");
    if (!rows.length) throw new Error("BSE returned no result rows");
    error = "BSE responded but the row shape is not mapped";
  } catch (err) {
    error = err instanceof Error ? err.message : "Request failed";
  }
  return { meetings: [], filings: [], health: source("bse-results", "BSE financial results", page, false, 0, null, error) };
}

export async function loadResultsCalendar(opts?: { fresh?: boolean }): Promise<ResultsPack> {
  if (!opts?.fresh && cache && cache.version === CACHE_VERSION && Date.now() - cache.at < TTL) return cache.data;
  try {
    const data = await pull();
    const anyOk = data.health.sources.some((row) => row.ok && row.id !== "bse-results");
    if (!anyOk && cache) {
      return { ...cache.data, health: { ...cache.data.health, stale: true, sources: data.health.sources } };
    }
    cache = { at: Date.now(), version: CACHE_VERSION, data };
    return data;
  } catch {
    if (cache && Date.now() - cache.at < STALE_OK) {
      return {
        ...cache.data,
        health: { ...cache.data.health, stale: true, limitation: null },
      };
    }
    return {
      events: [],
      health: { refreshedAt: null, stale: true, sources: [], limitation: null },
      asOf: new Date().toISOString(),
    };
  }
}
