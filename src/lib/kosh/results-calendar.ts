/** Indian results calendar. Dates come from exchange records. Nothing here invents a reporting day. */

import { compareIstDate, parseIstDate } from "./dates.ts";

export type ResultStatus =
  | "scheduled-confirmed"
  | "reported"
  | "postponed"
  | "cancelled"
  | "date-unavailable";

export type CalendarLink = {
  exchange: "NSE" | "BSE";
  url: string;
  label: string;
};

export type CalendarEvent = {
  symbol: string;
  name: string;
  /** Day used for sorting and the calendar grid. Empty when the exchange did not give one. */
  date: string;
  purpose: string;
  kind: "results" | "stock";
  exchange: "NSE" | "BSE";
  status: ResultStatus;
  meetingDate: string | null;
  filedAt: string | null;
  /** Original exchange timestamp, kept even when the calendar day is separate. */
  filedStamp: string | null;
  periodEnd: string | null;
  quarter: string | null;
  source: string;
  sourceUrl: string | null;
  links: CalendarLink[];
  isin: string | null;
  revised: boolean;
};

export type CalendarSourceHealth = {
  id: string;
  name: string;
  url: string;
  ok: boolean;
  count: number;
  newest: string | null;
  error: string | null;
};

export type CalendarHealth = {
  refreshedAt: string | null;
  stale: boolean;
  sources: CalendarSourceHealth[];
  limitation: string | null;
};

export type ResultsPack = {
  events: CalendarEvent[];
  health: CalendarHealth;
  asOf: string;
};

export type RawMeeting = {
  symbol: string;
  name: string;
  isin?: string | null;
  date?: string | null;
  purpose?: string | null;
  desc?: string | null;
  originalDate?: string | null;
  proposedDate?: string | null;
  attachment?: string | null;
  timestamp?: string | null;
};

export type RawFiling = {
  symbol: string;
  name: string;
  isin?: string | null;
  filedAt?: string | null;
  filedStamp?: string | null;
  periodEnd?: string | null;
  quarter?: string | null;
  url?: string | null;
  source: string;
  revised?: boolean;
  consolidated?: boolean | null;
};

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

export function istToday(asOf = new Date()): string {
  const t = new Date(asOf.getTime() + 5.5 * 60 * 60 * 1000);
  return t.toISOString().slice(0, 10);
}

function day(raw: string | null | undefined): string | null {
  return parseIstDate(raw || "");
}

/** Period end stated in a filing or a board-meeting sentence. Not a guessed announcement date. */
export function periodEndFromText(text: string): string | null {
  const s = String(text || "");
  const dated = s.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[, ]+(\d{4})\b/i,
  );
  if (dated) {
    const parsed = parseIstDate(`${dated[1]} ${dated[2]} ${dated[3]}`);
    if (parsed) return parsed;
  }
  const monthDay = s.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?[, ]+(\d{4})\b/i,
  );
  if (monthDay) {
    const parsed = parseIstDate(`${monthDay[2]} ${monthDay[1]} ${monthDay[3]}`);
    if (parsed) return parsed;
  }
  const monthYear = s.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[\s,]+(\d{4})\b/i,
  );
  if (monthYear) {
    const m = MONTHS[monthYear[1].toLowerCase()];
    const y = Number(monthYear[2]);
    if (m && y > 1990) {
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      return `${y}-${pad(m)}-${pad(last)}`;
    }
  }
  return null;
}

export function isResultsText(text: string): boolean {
  return /financial result|unaudited result|audited result|statement of (?:profit|financial)|reg(?:ulation|\.)?\s*33/i.test(text);
}

export type AnnouncementRole = "filing" | "postponed" | "cancelled" | "meeting" | "ignore";

/** Keep result filings. Drop press notes, newspaper ads, and unrelated corporate mail. */
export function announcementRole(desc: string, text: string): AnnouncementRole {
  const blob = `${desc || ""} ${text || ""}`.toLowerCase();
  const head = String(desc || "").toLowerCase().trim();
  if (/cancel/.test(blob) && /board meeting|financial result/.test(blob)) return "cancelled";
  if (/postpon|reschedul|adjourn|deferred/.test(blob) && /board meeting|financial result/.test(blob)) return "postponed";
  if (/newspaper publication|press release|investor presentation|analyst meet|earnings call|audio recording|transcript|advertisement/.test(head)) {
    return "ignore";
  }
  if (/financial result/.test(head)) return "filing";
  if (/outcome of board/.test(head) && isResultsText(blob)) return "filing";
  if (/reg(?:ulation|\.)?\s*33/.test(blob) && /result/.test(blob)) return "filing";
  if (/board meeting/.test(head) && isResultsText(blob)) return "meeting";
  return "ignore";
}

function linksFor(exchange: "NSE" | "BSE", url: string | null, label: string): CalendarLink[] {
  if (!url || !/^https:\/\//i.test(url)) return [];
  return [{ exchange, url, label }];
}

function statusFromMeeting(text: string, date: string | null): ResultStatus {
  const blob = text.toLowerCase();
  if (/cancel/.test(blob)) return "cancelled";
  if (/postpon|reschedul|adjourn|deferred/.test(blob)) return "postponed";
  if (!date) return "date-unavailable";
  return "scheduled-confirmed";
}

function meetingEvent(row: RawMeeting, exchange: "NSE" | "BSE"): CalendarEvent | null {
  const symbol = String(row.symbol || "").toUpperCase().trim();
  const text = `${row.purpose || ""} ${row.desc || ""}`;
  if (!symbol || !isResultsText(text)) return null;
  const meetingDate = day(row.date) || day(row.proposedDate);
  const original = day(row.originalDate);
  const status = statusFromMeeting(text, meetingDate);
  const shown = status === "postponed" ? day(row.proposedDate) || meetingDate || original : meetingDate || original;
  return {
    symbol,
    name: String(row.name || symbol).trim() || symbol,
    date: shown || "",
    purpose: String(row.desc || row.purpose || "Board meeting to consider financial results").trim(),
    kind: "results",
    exchange,
    status: shown ? status : "date-unavailable",
    meetingDate: original || meetingDate,
    filedAt: null,
    filedStamp: null,
    periodEnd: periodEndFromText(text),
    quarter: null,
    source: exchange === "NSE" ? "NSE board meetings" : "BSE board meetings",
    sourceUrl: row.attachment && /^https:\/\//i.test(row.attachment) ? row.attachment : null,
    links: linksFor(exchange, row.attachment || null, "Board meeting notice"),
    isin: row.isin || null,
    revised: false,
  };
}

function filingEvent(row: RawFiling, exchange: "NSE" | "BSE"): CalendarEvent | null {
  const symbol = String(row.symbol || "").toUpperCase().trim();
  if (!symbol) return null;
  const filedAt = day(row.filedAt);
  const quarter = row.quarter ? String(row.quarter).trim() : null;
  const periodEnd = day(row.periodEnd) || null;
  const stand = row.consolidated == null ? "" : row.consolidated ? "Consolidated" : "Standalone";
  const purpose = [quarter, periodEnd ? `period ended ${periodEnd}` : "", stand, row.revised ? "Revised filing" : ""]
    .filter(Boolean)
    .join(" · ");
  return {
    symbol,
    name: String(row.name || symbol).trim() || symbol,
    date: filedAt || "",
    purpose: purpose || "Financial results filing",
    kind: "results",
    exchange,
    status: "reported",
    meetingDate: null,
    filedAt,
    filedStamp: row.filedStamp || null,
    periodEnd,
    quarter,
    source: row.source,
    sourceUrl: row.url && /^https:\/\//i.test(row.url) ? row.url : null,
    links: linksFor(exchange, row.url || null, row.revised ? "Revised results filing" : "Results filing"),
    isin: row.isin || null,
    revised: Boolean(row.revised),
  };
}

function sameResult(meeting: CalendarEvent, filing: CalendarEvent): boolean {
  if (meeting.symbol !== filing.symbol || meeting.exchange !== filing.exchange) return false;
  if (meeting.periodEnd && filing.periodEnd && meeting.periodEnd.slice(0, 7) === filing.periodEnd.slice(0, 7)) return true;
  if (!meeting.meetingDate || !filing.filedAt) return false;
  const meet = Date.parse(meeting.meetingDate + "T00:00:00Z");
  const filed = Date.parse(filing.filedAt + "T00:00:00Z");
  if (!Number.isFinite(meet) || !Number.isFinite(filed)) return false;
  const gap = (filed - meet) / 86400000;
  return gap >= -1 && gap <= 10;
}

function mergePair(meeting: CalendarEvent, filing: CalendarEvent): CalendarEvent {
  const links = [...meeting.links];
  for (const link of filing.links) {
    if (!links.some((row) => row.url === link.url)) links.push(link);
  }
  return {
    ...filing,
    name: filing.name || meeting.name,
    date: filing.filedAt || meeting.date,
    purpose: filing.purpose,
    status: "reported",
    meetingDate: meeting.meetingDate,
    filedAt: filing.filedAt,
    filedStamp: filing.filedStamp,
    periodEnd: filing.periodEnd || meeting.periodEnd,
    quarter: filing.quarter || meeting.quarter,
    source: filing.source,
    sourceUrl: filing.sourceUrl || meeting.sourceUrl,
    links,
    isin: filing.isin || meeting.isin,
  };
}

function addLink(event: CalendarEvent, link: CalendarLink) {
  if (event.links.some((row) => row.url === link.url)) return;
  event.links.push(link);
}

function preferMeeting(a: CalendarEvent, b: CalendarEvent): CalendarEvent {
  const rank = (status: ResultStatus) => (status === "cancelled" || status === "postponed" ? 3 : status === "scheduled-confirmed" ? 2 : 1);
  const primary = rank(a.status) > rank(b.status) ? a : rank(b.status) > rank(a.status) ? b : a.purpose.length >= b.purpose.length ? a : b;
  const secondary = primary === a ? b : a;
  const links = [...primary.links];
  for (const link of secondary.links) {
    if (!links.some((row) => row.url === link.url)) links.push(link);
  }
  return {
    ...primary,
    links,
    sourceUrl: primary.sourceUrl || secondary.sourceUrl,
    purpose: primary.purpose.length >= secondary.purpose.length ? primary.purpose : secondary.purpose,
    periodEnd: primary.periodEnd || secondary.periodEnd,
    isin: primary.isin || secondary.isin,
    name: primary.name.length >= secondary.name.length ? primary.name : secondary.name,
  };
}

function dedupeScheduled(rows: CalendarEvent[]): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();
  for (const row of rows) {
    const key = [row.symbol, row.exchange, row.date || row.meetingDate || "none"].join("|");
    const prev = map.get(key);
    map.set(key, prev ? preferMeeting(prev, row) : row);
  }
  return [...map.values()];
}

/** One row per company, exchange, and reporting period. A filing replaces the open meeting. */
export function buildResultsCalendar(meetings: RawMeeting[], filings: RawFiling[], exchange: "NSE" | "BSE" = "NSE"): CalendarEvent[] {
  const scheduled = dedupeScheduled(meetings.map((row) => meetingEvent(row, exchange)).filter((row): row is CalendarEvent => Boolean(row)));
  const reported = filings.map((row) => filingEvent(row, exchange)).filter((row): row is CalendarEvent => Boolean(row));
  const usedFiling = new Set<number>();
  const out: CalendarEvent[] = [];
  for (const meeting of scheduled) {
    const hit = reported.findIndex((filing, index) => !usedFiling.has(index) && sameResult(meeting, filing));
    if (hit >= 0) {
      usedFiling.add(hit);
      out.push(mergePair(meeting, reported[hit]));
    } else out.push(meeting);
  }
  const byPeriod = new Map<string, CalendarEvent>();
  for (const [index, filing] of reported.entries()) {
    if (usedFiling.has(index)) continue;
    const key = [filing.symbol, filing.periodEnd || filing.filedAt || filing.quarter || "", filing.exchange].join("|");
    const prev = byPeriod.get(key);
    if (!prev) {
      byPeriod.set(key, filing);
      continue;
    }
    if (filing.revised && !prev.revised) {
      for (const link of prev.links) addLink(filing, link);
      byPeriod.set(key, filing);
    } else {
      for (const link of filing.links) addLink(prev, link);
    }
  }
  out.push(...byPeriod.values());
  return out.sort((a, b) => compareIstDate(a.date || "9999-99-99", b.date || "9999-99-99") || a.symbol.localeCompare(b.symbol));
}

export function withinRange(date: string, from: string | null, to: string | null): boolean {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function weekBounds(anchor: string, offsetWeeks = 0): { from: string; to: string } {
  const t = Date.parse(anchor + "T00:00:00Z");
  const dayNo = new Date(t).getUTCDay();
  const mondayShift = (dayNo + 6) % 7;
  const start = t + (offsetWeeks * 7 - mondayShift) * 86400000;
  const from = new Date(start).toISOString().slice(0, 10);
  const to = new Date(start + 6 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export function monthBounds(anchor: string): { from: string; to: string } {
  const [y, m] = anchor.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(last)}` };
}
