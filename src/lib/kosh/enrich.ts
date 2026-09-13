import { apiSearch } from "./api";
import { displayName, isIsin, TICKER_NAMES } from "./names";
import { guessTicker } from "./parse";
import type { Holding } from "./types";

function nseTicker(symbol: string) {
  return symbol.replace(/\.(NS|BO)$/i, "").replace(/-/g, "_").toUpperCase();
}

function knownTicker(symbol: string) {
  const b = nseTicker(symbol);
  return Boolean(TICKER_NAMES[b]) || (b.length <= 15 && /^[A-Z][A-Z0-9_]{0,14}$/.test(b) && !isIsin(b));
}

async function lookup(q: string): Promise<{ symbol: string; name: string } | null> {
  const hits = await apiSearch(q);
  const best =
    hits.find((x) => /\.NS$/i.test(x.symbol)) ||
    hits.find((x) => /\.BO$/i.test(x.symbol)) ||
    hits[0];
  if (!best?.symbol) return null;
  return { symbol: nseTicker(best.symbol), name: best.name || "" };
}

/** Turn ISINs / company-only rows into NSE tickers and real names. Never drop avg cost. */
export async function enrichHoldings(holdings: Holding[]): Promise<Holding[]> {
  return Promise.all(
    holdings.map(async (h) => {
      const named = { ...h, name: displayName(h) };
      const long = h.symbol.length > 15 || /LTD|LIMITED|FLUORO|INDUSTRIES/.test(h.symbol);
      const needs = isIsin(h.symbol) || isIsin(h.name) || long || (!knownTicker(h.symbol) && Boolean(h.isin || h.name));
      if (!needs) return named;
      const queries = [h.isin, isIsin(h.symbol) ? h.symbol : "", h.name, named.name, long ? h.symbol : ""].filter(
        (x, i, arr) => x && arr.indexOf(x) === i,
      ) as string[];
      for (const q of queries) {
        try {
          const hit = await lookup(q);
          if (!hit) continue;
          const symbol = guessTicker(hit.symbol, hit.name, h.isin || undefined);
          if (isIsin(symbol) || symbol.length > 15) continue;
          return {
            ...named,
            symbol,
            name: hit.name || displayName({ symbol, name: h.name }),
            isin: h.isin || (isIsin(h.symbol) ? h.symbol : h.isin),
            avg: h.avg,
            qty: h.qty,
          };
        } catch {
          /* next query */
        }
      }
      return named;
    }),
  );
}