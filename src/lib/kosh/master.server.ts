/** NSE equity master (EQUITY_L). Cached 24h. Fallback: static NSE_EQ list. Server-only. */

import { NSE_EQ } from "./nse-eq.ts";
import { registerLiveIsins } from "./names.ts";
import { classifySecurity, dedupeByIsin, parseListingDate, type Security } from "./master.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const URLS = [
  "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv",
  "https://archives.nseindia.com/content/equities/EQUITY_L.csv",
];

const TTL = 24 * 60 * 60 * 1000;
let cache: { at: number; data: Security[] } | null = null;
let inflight: Promise<Security[]> | null = null;

function fallback(): Security[] {
  return NSE_EQ.map((x) => ({
    symbol: x.symbol,
    name: x.name,
    isin: null,
    series: "EQ",
    listedOn: null,
    exchange: "NSE" as const,
    board: "main" as const,
    active: true,
    kind: "equity" as const,
  }));
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (c === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

export function parseEquityCsv(text: string): Security[] {
  const raw = text.replace(/^\uFEFF/, "").replace(/\r/g, "\n");
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toUpperCase().replace(/\s+/g, " "));
  const idx = (name: string) => headers.findIndex((h) => h === name || h.endsWith(name) || h.includes(name));
  const iSym = idx("SYMBOL");
  const iName = headers.findIndex((h) => h.includes("NAME"));
  const iSeries = headers.findIndex((h) => h.includes("SERIES"));
  const iDate = headers.findIndex((h) => h.includes("DATE OF LISTING") || h.includes("LISTING"));
  const iIsin = headers.findIndex((h) => h.includes("ISIN"));
  const iBse = headers.findIndex((h) => h === "BSE CODE" || h.includes("BSE CODE") || h === "SCRIP CODE");
  if (iSym < 0) return [];
  const rows: Security[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const symbol = String(cols[iSym] || "")
      .trim()
      .toUpperCase();
    if (!symbol || !/^[A-Z0-9][A-Z0-9.&-]{0,20}$/.test(symbol)) continue;
    const name = String(iName >= 0 ? cols[iName] : symbol).trim() || symbol;
    const series = String(iSeries >= 0 ? cols[iSeries] : "EQ")
      .trim()
      .toUpperCase() || "EQ";
    const isinRaw = String(iIsin >= 0 ? cols[iIsin] : "")
      .trim()
      .toUpperCase();
    const isin = /^IN[A-Z0-9]{10}$/.test(isinRaw) ? isinRaw : null;
    const bseRaw = String(iBse >= 0 ? cols[iBse] : "").trim();
    const bseCode = /^\d{4,7}$/.test(bseRaw) ? bseRaw : null;
    const listedOn = parseListingDate(iDate >= 0 ? cols[iDate] : "");
    const cls = classifySecurity(series, name);
    if (!cls.screener) continue;
    rows.push({
      symbol,
      name,
      isin,
      series,
      listedOn,
      exchange: "NSE",
      bseCode,
      board: cls.board,
      active: true,
      kind: cls.kind,
    });
  }
  return dedupeByIsin(rows);
}

async function downloadCsv(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/csv,text/plain,*/*",
      Referer: "https://www.nseindia.com/",
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(String(res.status));
  const text = await res.text();
  if (!/symbol/i.test(text.slice(0, 200))) throw new Error("not csv");
  return text;
}

export async function fetchEquityMaster(): Promise<Security[]> {
  if (cache && Date.now() - cache.at < TTL && cache.data.length) return cache.data;
  if (inflight) return inflight;
  inflight = (async () => {
    for (const url of URLS) {
      try {
        const text = await downloadCsv(url);
        const rows = parseEquityCsv(text);
        if (rows.length < 500) continue;
        const isins: Record<string, string> = {};
        for (const r of rows) if (r.isin) isins[r.isin] = r.symbol;
        registerLiveIsins(isins);
        cache = { at: Date.now(), data: rows };
        return rows;
      } catch {
        /* next url */
      }
    }
    const fb = fallback();
    if (!cache) cache = { at: Date.now(), data: fb };
    return cache.data.length ? cache.data : fb;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function listedEquities(): Promise<{ symbol: string; name: string; isin: string | null; series: string; listedOn: string | null; gsm: boolean }[]> {
  const rows = await fetchEquityMaster();
  return rows
    .filter((r) => r.kind === "equity")
    .map((r) => ({
      symbol: r.symbol,
      name: r.name,
      isin: r.isin,
      series: r.series,
      listedOn: r.listedOn,
      gsm: r.board === "gsm",
    }));
}

const bySym = new Map<string, Security>();
export async function lookupSecurity(symbol: string): Promise<Security | undefined> {
  const rows = await fetchEquityMaster();
  if (bySym.size !== rows.length) {
    bySym.clear();
    for (const r of rows) bySym.set(r.symbol.toUpperCase(), r);
  }
  return bySym.get(
    String(symbol || "")
      .replace(/\.(NS|BO)$/i, "")
      .toUpperCase(),
  );
}

export async function searchMaster(q: string, cap = 12): Promise<{ symbol: string; name: string }[]> {
  const n = q.trim().toUpperCase();
  if (n.length < 1) return [];
  const rows = await fetchEquityMaster();
  const starts: { symbol: string; name: string }[] = [];
  const rest: { symbol: string; name: string }[] = [];
  for (const x of rows) {
    const nameU = x.name.toUpperCase();
    if (x.symbol === n || x.symbol.startsWith(n) || (x.isin && x.isin === n)) starts.push({ symbol: x.symbol, name: x.name });
    else if (x.symbol.includes(n) || nameU.includes(n)) rest.push({ symbol: x.symbol, name: x.name });
    if (starts.length >= cap) break;
  }
  return [...starts, ...rest].slice(0, cap);
}
