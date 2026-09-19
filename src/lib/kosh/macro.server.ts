/** FII/DII (mrchartist) + NSE event calendar + recurring macro dates. Server-only. */

import type { DealEvent, FiidiiRow, MacroPack, ResultEvent } from "./types";
import { SCREEN_UNIVERSE, universeName } from "./universe";
import { parseIstDate } from "./dates";

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

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asFiidii(row: Record<string, unknown>): FiidiiRow {
  return {
    date: String(row.date || ""),
    fiiNet: num(row.fii_net ?? row.fiiNet),
    diiNet: num(row.dii_net ?? row.diiNet),
    fiiBuy: num(row.fii_buy ?? row.fiiBuy),
    fiiSell: num(row.fii_sell ?? row.fiiSell),
    diiBuy: num(row.dii_buy ?? row.diiBuy),
    diiSell: num(row.dii_sell ?? row.diiSell),
  };
}

async function fetchFiidii(): Promise<FiidiiRow[]> {
  try {
    const raw = await getJson("https://fii-diidata.mrchartist.com/api/history");
    const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [];
    return list
      .filter((x) => x && typeof x === "object")
      .map((x) => asFiidii(x as Record<string, unknown>))
      .filter((x) => x.date)
      .slice(0, 24);
  } catch {
    try {
      const raw = await getJson("https://fii-diidata.mrchartist.com/api/data");
      if (raw && typeof raw === "object") return [asFiidii(raw as Record<string, unknown>)].filter((x) => x.date);
    } catch {
      /* empty */
    }
    return [];
  }
}

function eventKind(purpose: string): "results" | "stock" {
  if (/financial result|earnings|result/i.test(purpose)) return "results";
  return "stock";
}

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

function iso(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function lastThursday(year: number, month0: number) {
  const d = new Date(Date.UTC(year, month0 + 1, 0));
  const day = d.getUTCDay();
  const diff = (day + 7 - 4) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function firstFriday(year: number, month0: number) {
  const d = new Date(Date.UTC(year, month0, 1));
  const add = (5 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(1 + add);
  return d;
}

function macroEvents(): ResultEvent[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const out: ResultEvent[] = [];
  for (let m = 0; m < 12; m++) {
    const yr = m + now.getUTCMonth() > 11 ? y + 1 : y;
    const mo = (now.getUTCMonth() + m) % 12;
    const exp = lastThursday(yr, mo);
    if (exp >= start) {
      out.push({
        symbol: "^NSEI",
        name: "Nifty F&O",
        date: iso(exp),
        purpose: "Monthly F&O expiry (last Thursday)",
        kind: "macro",
      });
    }
    const nfp = firstFriday(yr, mo);
    if (nfp >= start) {
      out.push({
        symbol: "^NSEI",
        name: "US payrolls",
        date: iso(nfp),
        purpose: "US non-farm payrolls (first Friday)",
        kind: "macro",
        expected: true,
      });
    }
  }
  const budget = new Date(Date.UTC(y + (now.getUTCMonth() > 1 ? 1 : 0), 1, 1));
  if (budget >= start) {
    out.push({
      symbol: "^NSEI",
      name: "Union Budget",
      date: iso(budget),
      purpose: "Union Budget (typical 1 Feb window)",
      kind: "macro",
      expected: true,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 18);
}

async function fetchResults(): Promise<ResultEvent[]> {
  const uni = new Set(SCREEN_UNIVERSE.map((x) => x.symbol.toUpperCase()));
  const board: ResultEvent[] = [];
  try {
    const raw = await getJson("https://www.nseindia.com/api/event-calendar?index=equities", {
      Referer: "https://www.nseindia.com/",
    });
    const list = Array.isArray(raw) ? raw : [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const symbol = String(o.symbol || "").toUpperCase();
      const purpose = String(o.purpose || "");
      if (!symbol || !purpose) continue;
      const kind = eventKind(purpose);
      if (kind !== "results" && !uni.has(symbol)) continue;
      const date = parseIstDate(String(o.date || ""));
      if (!date) continue;
      board.push({
        symbol,
        name: universeName(symbol) || String(o.company || symbol),
        date,
        purpose,
        kind,
      });
      if (board.length >= 48) break;
    }
  } catch {
    /* empty */
  }
  return [...board, ...macroEvents()];
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
  const hit = cache.get("v4");
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const [fiidii, results, deals] = await Promise.all([fetchFiidii(), fetchResults(), fetchDeals()]);
  const data: MacroPack = {
    fiidii,
    results,
    deals,
    asOf: new Date().toISOString(),
  };
  cache.set("v4", { at: Date.now(), data });
  return data;
}
