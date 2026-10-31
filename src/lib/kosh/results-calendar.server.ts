/** NSE results pipeline. BSE is attempted and the failure is kept when the exchange refuses the request. */

import { parseIstDate } from "./dates.ts";
import {
  announcementRole,
  buildResultsCalendar,
  periodEndFromText,
  type CalendarSourceHealth,
  type RawFiling,
  type RawMeeting,
  type ResultsPack,
} from "./results-calendar.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let cache: { at: number; version: number; data: ResultsPack } | null = null;
const TTL = 10 * 60 * 1000;
const STALE_OK = 6 * 60 * 60 * 1000;
const CACHE_VERSION = 2;

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

function nseFilings(raw: unknown): RawFiling[] {
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
      source: "NSE financial results",
      revised: str(row, "reInd").toUpperCase() === "Y",
      consolidated: /consolidat/i.test(str(row, "consolidated")) ? true : /standalone/i.test(str(row, "consolidated")) ? false : null,
    });
  }
  return out;
}

function nseAnnouncements(raw: unknown): { meetings: RawMeeting[]; filings: RawFiling[] } {
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
        source: "NSE corporate announcements",
        revised: /revised/i.test(desc + text),
      });
      continue;
    }
    meetings.push({
      symbol,
      name,
      isin: str(row, "sm_isin") || null,
      date: parseIstDate(when),
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
  const sources: CalendarSourceHealth[] = [];
  const meetings: RawMeeting[] = [];
  const filings: RawFiling[] = [];

  try {
    const raw = await getJson("https://www.nseindia.com/api/corporate-board-meetings?index=equities");
    const rows = nseMeetings(raw);
    meetings.push(...rows);
    sources.push(
      source(
        "nse-board",
        "NSE board meetings",
        "https://www.nseindia.com/companies-listing/corporate-filings-board-meetings",
        true,
        rows.length,
        newest(rows.map((row) => ({ date: row.date }))),
        null,
      ),
    );
  } catch (err) {
    sources.push(
      source(
        "nse-board",
        "NSE board meetings",
        "https://www.nseindia.com/companies-listing/corporate-filings-board-meetings",
        false,
        0,
        null,
        err instanceof Error ? err.message : "Request failed",
      ),
    );
  }

  try {
    const raw = await getJson("https://www.nseindia.com/api/event-calendar");
    const rows = nseEvents(raw);
    meetings.push(...rows);
    sources.push(
      source(
        "nse-events",
        "NSE event calendar",
        "https://www.nseindia.com/companies-listing/corporate-filings-event-calendar",
        true,
        rows.length,
        newest(rows.map((row) => ({ date: row.date }))),
        null,
      ),
    );
  } catch (err) {
    sources.push(
      source(
        "nse-events",
        "NSE event calendar",
        "https://www.nseindia.com/companies-listing/corporate-filings-event-calendar",
        false,
        0,
        null,
        err instanceof Error ? err.message : "Request failed",
      ),
    );
  }

  try {
    const raw = await getJson("https://www.nseindia.com/api/corporates-financial-results?index=equities&period=Quarterly");
    const rows = nseFilings(raw);
    const cutoff = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);
    const recent = rows.filter((row) => (row.filedAt || "") >= cutoff);
    filings.push(...recent);
    sources.push(
      source(
        "nse-results",
        "NSE financial results",
        "https://www.nseindia.com/companies-listing/corporate-filings-financial-results",
        true,
        recent.length,
        newest(rows),
        null,
      ),
    );
  } catch (err) {
    sources.push(
      source(
        "nse-results",
        "NSE financial results",
        "https://www.nseindia.com/companies-listing/corporate-filings-financial-results",
        false,
        0,
        null,
        err instanceof Error ? err.message : "Request failed",
      ),
    );
  }

  try {
    const raw = await getJson("https://www.nseindia.com/api/corporate-announcements?index=equities");
    const parsed = nseAnnouncements(raw);
    meetings.push(...parsed.meetings);
    filings.push(...parsed.filings);
    sources.push(
      source(
        "nse-ann",
        "NSE latest announcements",
        "https://www.nseindia.com/companies-listing/corporate-filings-announcements",
        true,
        parsed.filings.length + parsed.meetings.length,
        newest(parsed.filings),
        null,
      ),
    );
  } catch (err) {
    sources.push(
      source(
        "nse-ann",
        "NSE latest announcements",
        "https://www.nseindia.com/companies-listing/corporate-filings-announcements",
        false,
        0,
        null,
        err instanceof Error ? err.message : "Request failed",
      ),
    );
  }

  let bseError = "HTTP 403";
  const today = new Date();
  const from = new Date(today.getTime() - 45 * 86400000);
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
    bseError = "";
  } catch (err) {
    bseError = err instanceof Error ? err.message : "Request failed";
  }
  sources.push(
    source(
      "bse-results",
      "BSE financial results",
      "https://www.bseindia.com/corporates/Comp_Resultsnew.aspx",
      !bseError,
      0,
      null,
      bseError || null,
    ),
  );

  const events = buildResultsCalendar(meetings, filings, "NSE");
  const resultsFeed = sources.find((row) => row.id === "nse-results");
  const limitation = [
    bseError
      ? "BSE’s results API did not respond (" + bseError + "). Dual-listed names are shown from the NSE filing only. BSE-only names are absent — no BSE date was filled in."
      : "",
    resultsFeed?.newest ? "Newest date on the NSE financial-results file: " + resultsFeed.newest + "." : "",
    "The dated NSE announcement archive does not answer in time. Filings are taken from the latest announcement batch and the financial-results file, so an older filing that has left that batch can still look scheduled.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    events,
    health: {
      refreshedAt: new Date().toISOString(),
      stale: false,
      sources,
      limitation: limitation || null,
    },
    asOf: new Date().toISOString(),
  };
}

export async function loadResultsCalendar(): Promise<ResultsPack> {
  if (cache && cache.version === CACHE_VERSION && Date.now() - cache.at < TTL) return cache.data;
  try {
    const data = await pull();
    const anyOk = data.health.sources.some((row) => row.ok && row.id !== "bse-results");
    if (!anyOk && cache) {
      return { ...cache.data, health: { ...cache.data.health, stale: true, sources: data.health.sources } };
    }
    cache = { at: Date.now(), version: CACHE_VERSION, data };
    return data;
  } catch (err) {
    if (cache && Date.now() - cache.at < STALE_OK) {
      return {
        ...cache.data,
        health: {
          ...cache.data.health,
          stale: true,
          limitation: "Showing the last successful refresh. A new pull failed: " + (err instanceof Error ? err.message : "unknown"),
        },
      };
    }
    return {
      events: [],
      health: {
        refreshedAt: null,
        stale: true,
        sources: [],
        limitation: "The results sources did not respond. No dates were invented.",
      },
      asOf: new Date().toISOString(),
    };
  }
}
