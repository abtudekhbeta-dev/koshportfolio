/** Canonical instrument identity.
 *  A bare ticker and `TICKER.NS` are the NSE listing, so existing watchlists,
 *  drawings and URLs stay valid. `TICKER.BO` is a different instrument.
 */

export type ListingExchange = "NSE" | "BSE" | "OTHER";

export type SearchHit = { symbol: string; name: string; exch: string };

function clean(symbol: string): string {
  return String(symbol || "").trim().toUpperCase();
}

export function isBseListing(symbol: string, exch?: string): boolean {
  const raw = clean(symbol);
  if (raw.endsWith(".NS")) return false;
  if (raw.endsWith(".BO")) return true;
  return /\bBSE\b|BOMBAY/i.test(String(exch || ""));
}

export function listingLabel(symbol: string): string {
  return clean(symbol).replace(/\.(NS|BO)$/i, "");
}

export function listingExchange(symbol: string, exch?: string): ListingExchange {
  const raw = clean(symbol);
  if (!raw) return "OTHER";
  if (raw === "GOLD" || raw === "SILVER") return "OTHER";
  if (isBseListing(raw, exch)) return "BSE";
  if (raw.endsWith(".NS") || raw.startsWith("^")) return "NSE";
  if (/\bNSE\b|\bNSI\b|NATIONAL STOCK|INDIA/i.test(String(exch || ""))) return "NSE";
  if (!raw.includes(".") && (!exch || exch === "NSE")) return "NSE";
  return "OTHER";
}

/** Id used in URLs, watchlists, alerts and chart scope. */
export function listingId(symbol: string, exch?: string): string {
  const raw = clean(symbol);
  if (!raw) return "";
  if (raw === "GOLD" || raw === "SILVER" || raw.startsWith("^") || raw.includes("=")) return raw.replace(/\.(NS|BO)$/i, "");
  const exchange = listingExchange(raw, exch);
  const bare = listingLabel(raw);
  if (!bare) return "";
  if (exchange === "BSE") return `${bare}.BO`;
  if (exchange === "OTHER") return raw;
  return bare;
}

export function sameListing(a: string, b: string): boolean {
  return listingId(a) === listingId(b);
}

/** Yahoo symbols to try. An explicit `.BO` or `.NS` does not fall through to the other exchange. */
export function yahooCandidates(raw: string, stems: string[]): string[] {
  const s = clean(raw);
  const unique = (rows: string[]) => [...new Set(rows.filter(Boolean))];
  if (s.endsWith(".BO")) return unique([s, ...stems.map((stem) => `${stem}.BO`)]);
  if (s.endsWith(".NS")) return unique([s, ...stems.map((stem) => `${stem}.NS`)]);
  return unique(stems.flatMap((stem) => [`${stem}.NS`, `${stem}.BO`]));
}

/** Local NSE rows win on the same listing. A BSE hit is never dropped because the NSE ticker was already seen. */
export function mergeSearchQuotes(local: SearchHit[], remote: SearchHit[], cap = 16): SearchHit[] {
  const out: SearchHit[] = [];
  const seen = new Set<string>();
  const push = (row: SearchHit) => {
    const exchange = listingExchange(row.symbol, row.exch);
    const id = listingId(row.symbol, row.exch);
    const key = `${exchange}:${listingLabel(id) || id}`;
    if (!id || seen.has(key)) return;
    seen.add(key);
    out.push({
      symbol: id,
      name: String(row.name || listingLabel(id) || id).slice(0, 120),
      exch: exchange === "OTHER" ? String(row.exch || "").slice(0, 24) : exchange,
    });
  };
  for (const row of local) push({ symbol: row.symbol, name: row.name, exch: row.exch || "NSE" });
  for (const row of remote) push(row);
  return out.slice(0, Math.max(1, cap));
}
