/** Cash-market FII/DII from the flow archive, plus NSE events. Server-only. */

import type { DealEvent, FiidiiRow, MacroPack, ResultEvent } from "./types";
import { loadResultsCalendar } from "./results-calendar.server";
import { istToday, shiftDay } from "./results-calendar";
import { universeName } from "./universe";
import { parseIstDate } from "./dates";
import { loadFlowPack } from "./market-flows.server";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const cache = new Map<string, { at: number; data: MacroPack }>();
const TTL = 8 * 60 * 1000;

async function getJson(url: string, extra: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json", ...extra },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

async function fetchFiidii(): Promise<{ rows: FiidiiRow[]; flow: MacroPack["flow"] }> {
  try {
    const pack = await loadFlowPack();
    const rows = [...pack.daily]
      .reverse()
      .filter((bar) => bar.end && Number.isFinite(bar.fiiNet) && Number.isFinite(bar.diiNet))
      .slice(0, 1400)
      .map((bar) => ({ date: bar.end, fiiNet: bar.fiiNet, diiNet: bar.diiNet, fiiBuy: 0, fiiSell: 0, diiBuy: 0, diiSell: 0 }));
    const health = pack.health;
    return {
      rows,
      flow: {
        status: health?.status || (rows.length ? "delayed" : "unavailable"),
        latest: health?.latest || rows[0]?.date || null,
        expected: health?.expected || null,
        refreshedAt: health?.lastSuccess || pack.source.retrievedAt,
        source: health?.sourceName || pack.source.name,
        sourceUrl: health?.sourceUrl || pack.source.url,
        warning:
          health?.status === "delayed"
            ? `Latest cash session on file is ${health.latest || "missing"}. Expected ${health.expected || "a later session"}. Older rows are unchanged.`
            : health?.failure
              ? `Last refresh did not replace the stored rows (${health.failure}).`
              : null,
      },
    };
  } catch {
    return { rows: [], flow: { status: "unavailable", latest: null, expected: null, refreshedAt: null, source: "Stored cash archive", sourceUrl: "", warning: "The cash file could not be read. No figures were filled in." } };
  }
}

async function fetchResults(): Promise<{ events: ResultEvent[]; calendar: MacroPack["calendar"] }> {
  const pack = await loadResultsCalendar();
  const today = istToday();
  const horizon = shiftDay(today, 14);
  const forward = pack.events.filter((row) => row.date >= today && row.date <= horizon);
  const events: ResultEvent[] = forward.map((row) => ({
    symbol: row.symbol,
    name: row.name,
    date: row.date,
    purpose: row.purpose,
    kind: row.kind,
    exchange: row.exchange,
    status: row.status,
    meetingDate: row.meetingDate,
    filedAt: row.filedAt,
    source: row.source,
    sourceUrl: row.sourceUrl,
    quarter: row.quarter,
    expected: row.status === "expected" ? true : undefined,
  }));
  return {
    events,
    calendar: {
      refreshedAt: pack.health.refreshedAt,
      stale: pack.health.stale,
      limitation: pack.health.limitation,
      failures: pack.health.sources.filter((row) => !row.ok).map((row) => `${row.name}: ${row.error || "failed"}`),
    },
  };
}

let nseCookies = "";
let nseCookieAt = 0;

async function nseSession(): Promise<string> {
  if (nseCookies && Date.now() - nseCookieAt < 8 * 60 * 1000) return nseCookies;
  try {
    const res = await fetch("https://www.nseindia.com/", {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    const parts =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : [res.headers.get("set-cookie") || ""];
    nseCookies = parts.filter(Boolean).map((c) => c.split(";")[0]).join("; ");
    nseCookieAt = Date.now();
  } catch {
    nseCookies = nseCookies || "";
  }
  return nseCookies;
}

async function nseJson(path: string): Promise<unknown> {
  const cookie = await nseSession();
  const res = await fetch("https://www.nseindia.com" + path, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json,text/plain,*/*",
      Referer: "https://www.nseindia.com/",
      Cookie: cookie,
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function dealDate(raw: unknown): string {
  return parseIstDate(String(raw || "").trim()) || "";
}

async function fetchDeals(): Promise<DealEvent[]> {
  const out: DealEvent[] = [];
  try {
    const raw = await nseJson("/api/snapshot-capital-market-largedeal");
    const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const bulk = (obj.BULK_DEALS || obj.bulkDeals || obj.data || []) as unknown[];
    const list = Array.isArray(bulk) ? bulk : [];
    for (const item of list.slice(0, 40)) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const symbol = String(o.symbol || o.nseSymbol || "").toUpperCase();
      if (!symbol) continue;
      const qty = o.qty || o.quantity || "";
      const side = String(o.buySell || o.dealType || o.clientName || "");
      out.push({
        symbol,
        name: universeName(symbol) || String(o.name || symbol),
        date: dealDate(o.date || o.dealDate || o.timestamp),
        kind: /block/i.test(String(o.dealType || o.type || "")) ? "block" : "bulk",
        note: [side, qty ? String(qty) + " shares" : ""].filter(Boolean).join(" · ") || "Large deal",
      });
    }
  } catch {
    /* empty */
  }
  try {
    const raw = await nseJson("/api/corporates-pit?index=equities");
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown[] }).data)
        ? (raw as { data: unknown[] }).data
        : [];
    for (const item of list.slice(0, 30)) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const symbol = String(o.symbol || o.nseSymbol || "").toUpperCase();
      if (!symbol) continue;
      const who = String(o.acqName || o.personName || o.tdpTransactionType || "Insider");
      const sec = String(o.secAcq || o.secVal || "");
      out.push({
        symbol,
        name: universeName(symbol) || symbol,
        date: dealDate(o.date || o.broadcastdate || o.timestamp),
        kind: "insider",
        note: [who, sec].filter(Boolean).join(" · ") || "Insider trade",
      });
    }
  } catch {
    /* empty */
  }
  const seen = new Set<string>();
  return out.filter((d) => {
    const k = d.kind + d.symbol + d.date + d.note.slice(0, 20);
    if (seen.has(k) || !d.date) return false;
    seen.add(k);
    return true;
  }).slice(0, 48);
}

export async function fetchMacro(): Promise<MacroPack> {
  const hit = cache.get("v6");
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const [flows, results, deals] = await Promise.all([fetchFiidii(), fetchResults(), fetchDeals()]);
  const data: MacroPack = {
    fiidii: flows.rows,
    flow: flows.flow,
    results: results.events,
    deals,
    asOf: new Date().toISOString(),
    calendar: results.calendar,
  };
  cache.set("v6", { at: Date.now(), data });
  return data;
}
