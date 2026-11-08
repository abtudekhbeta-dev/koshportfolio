/** BSE equity lines from Yahoo's screener. Cached. Not a fabricated list. */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type BseRow = { symbol: string; name: string };

export type BseBook = {
  ok: boolean;
  rows: BseRow[];
  total: number | null;
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
    rows.push({ symbol, name: name || symbol });
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
  const pages = Math.min(40, Math.ceil(Math.max(0, total - first.rows.length) / size));
  let failed = 0;
  for (let i = 1; i <= pages; i++) {
    try {
      const page = await screenerPage(session, i * size, size);
      for (const row of page.rows) rows.set(row.symbol, row);
      if (!page.rows.length) break;
    } catch {
      failed += 1;
      if (failed >= 3) break;
    }
  }
  const got = [...rows.values()];
  const short = total > 0 && got.length + 25 < total;
  return {
    ok: got.length > 0,
    rows: got,
    total,
    error: short ? `Yahoo reported ${total} BSE equities and ${got.length} lines came back` : undefined,
  };
}

export async function bseEquities(): Promise<BseBook> {
  if (cache && Date.now() - cache.at < TTL && cache.data.ok) return cache.data;
  if (inflight) return inflight;
  inflight = loadBseBook()
    .then((data) => {
      if (data.ok) cache = { at: Date.now(), data };
      return data;
    })
    .catch((err: unknown) => {
      const error = err instanceof Error ? err.message : "BSE list failed";
      return { ok: false, rows: [], total: null, error };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
