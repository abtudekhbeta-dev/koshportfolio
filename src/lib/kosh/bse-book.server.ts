import { bseRetrievalStatus } from "./liquidity-universe.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type BseRow = { symbol: string; name: string; isin?: string | null };

export type BseBook = {
  ok: boolean;
  /** True only when every requested page returned and the row count covers the reported total. */
  complete: boolean;
  rows: BseRow[];
  total: number | null;
  received: number;
  pagesFailed: number;
  fetchedAt: number;
  error?: string;
};

const TTL = 24 * 60 * 60 * 1000;
let cache: { at: number; data: BseBook } | null = null;
let inflight: Promise<BseBook> | null = null;

export function parseBseScreenerPage(data: unknown): { total: number; rows: BseRow[] } {
  const root = data as { finance?: { result?: Array<{ total?: number; quotes?: Array<Record<string, unknown>> }> } };
  const page = root?.finance?.result?.[0];
  const quotes = Array.isArray(page?.quotes) ? page.quotes : [];
  const rows: BseRow[] = [];
  for (const quote of quotes) {
    const symbol = String(quote.symbol || "").trim().toUpperCase();
    const kind = String(quote.quoteType || "EQUITY").toUpperCase();
    if (!symbol.endsWith(".BO") || kind !== "EQUITY") continue;
    const name = String(quote.shortName || quote.longName || symbol.replace(/\.BO$/, "")).trim();
    const isin = String(quote.isin || "").trim().toUpperCase();
    rows.push({ symbol, name: name || symbol, ...(isin && /^IN[A-Z0-9]{10}$/.test(isin) ? { isin } : {}) });
  }
  const total = Number(page?.total);
  return { total: Number.isFinite(total) ? total : rows.length, rows };
}

function cookieHeader(res: Response): string {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const list = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  if (list.length) return list.map((row) => row.split(";")[0]).filter(Boolean).join("; ");
  const raw = res.headers.get("set-cookie") || "";
  const match = raw.match(/[A-Za-z0-9_]+=[^;]+/);
  return match ? match[0] : "";
}

async function yahooSession(): Promise<{ cookie: string; crumb: string }> {
  const gate = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(12_000),
  }).catch((err: unknown) => {
    if (err && typeof err === "object" && "headers" in (err as Response)) return err as Response;
    throw err;
  });
  const cookie = gate instanceof Response ? cookieHeader(gate) : "";
  const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
    headers: { "User-Agent": UA, Cookie: cookie, Accept: "text/plain" },
    signal: AbortSignal.timeout(12_000),
  });
  const crumb = (await crumbRes.text()).trim();
  if (!crumbRes.ok || !crumb || crumb.includes("<") || crumb.length > 64) throw new Error("Yahoo crumb did not answer");
  return { cookie, crumb };
}

async function screenerPage(session: { cookie: string; crumb: string }, offset: number, size: number): Promise<{ total: number; rows: BseRow[] }> {
  const body = {
    size,
    offset,
    sortField: "intradaymarketcap",
    sortType: "desc",
    quoteType: "EQUITY",
    query: {
      operator: "AND",
      operands: [
        { operator: "eq", operands: ["region", "in"] },
        { operator: "eq", operands: ["exchange", "BSE"] },
      ],
    },
  };
  const url = `https://query1.finance.yahoo.com/v1/finance/screener?crumb=${encodeURIComponent(session.crumb)}&lang=en-US&region=IN&formatted=false`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      Cookie: session.cookie,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`Yahoo BSE screener ${res.status}`);
  return parseBseScreenerPage(await res.json());
}

async function loadBseBook(): Promise<BseBook> {
  const session = await yahooSession();
  const first = await screenerPage(session, 0, 250);
  const rows = new Map<string, BseRow>();
  for (const row of first.rows) rows.set(row.symbol, row);
  const total = first.total;
  const size = 250;
  const pagesWanted = Math.ceil(Math.max(0, total - first.rows.length) / size);
  const capped = pagesWanted > 40;
  const pages = Math.min(40, pagesWanted);
  let received = first.rows.length;
  let failed = 0;
  for (let i = 1; i <= pages; i++) {
    try {
      const page = await screenerPage(session, i * size, size);
      received += page.rows.length;
      for (const row of page.rows) rows.set(row.symbol, row);
      if (!page.rows.length) break;
    } catch {
      failed += 1;
      if (failed >= 3) break;
    }
  }
  const got = [...rows.values()];
  const status = bseRetrievalStatus({ received, unique: got.length, total, pagesFailed: failed, capped });
  return {
    ok: got.length > 0,
    complete: status.complete,
    rows: got,
    total,
    received,
    pagesFailed: failed,
    fetchedAt: Date.now(),
    error: status.complete ? undefined : status.note,
  };
}

export async function bseEquities(): Promise<BseBook> {
  const now = Date.now();
  if (cache && cache.data.complete && now - cache.at < TTL) return cache.data;
  if (cache && !cache.data.complete && now - cache.at < 15 * 60 * 1000) return cache.data;
  if (inflight) return inflight;
  inflight = loadBseBook()
    .then((data) => {
      if (data.ok) cache = { at: Date.now(), data };
      return data;
    })
    .catch((err: unknown) => {
      const error = err instanceof Error ? err.message : "BSE list failed";
      return { ok: false, complete: false, rows: [], total: null, received: 0, pagesFailed: 1, fetchedAt: Date.now(), error };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
