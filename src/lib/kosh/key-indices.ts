/** User key-index board. Stored in this browser only. It does not edit the catalogue. */

import { NIFTY_CATALOGUE, type CatalogueIndex } from "./nifty-catalogue.ts";

export const KEY_INDICES_KEY = "kosh-key-indices-v1";

/**
 * The default that was auto-saved before the market-cap expansion.
 * A board that still matches this list, in this order, was never edited.
 */
export const PREVIOUS_KEY_DEFAULT = [
  "^NSEI",
  "^BSESN",
  "^NSMIDCP",
  "^CNX100",
  "^CRSLDX",
  "^NSEBANK",
  "NIFTY_FIN_SERVICE.NS",
  "^CNXIT",
  "^CNXAUTO",
  "^CNXPHARMA",
  "^CNXFMCG",
  "^CNXMETAL",
  "^CNXENERGY",
  "^CNXREALTY",
  "^NSEMDCP50",
] as const;

/** Benchmarks, size segments, then the sector board. Every symbol is in the catalogue. */
export const DEFAULT_KEY_SYMBOLS = [
  "^NSEI",
  "^BSESN",
  "^NSMIDCP",
  "^CNX100",
  "^CNX200",
  "^CRSLDX",
  "NIFTY_LARGEMID250.NS",
  "NIFTY_TOTAL_MKT.NS",
  "NIFTY50_USD.NS",
  "^NSEMDCP50",
  "NIFTY_MIDCAP_100.NS",
  "NIFTYMIDCAP150.NS",
  "NIFTY_MID_SELECT.NS",
  "NIFTYSMLCAP50.NS",
  "^CNXSC",
  "NIFTYSMLCAP250.NS",
  "NIFTY_MICROCAP250.NS",
  "NIFTYMIDSML400.NS",
  "^NSEBANK",
  "NIFTY_FIN_SERVICE.NS",
  "^CNXIT",
  "^CNXAUTO",
  "^CNXPHARMA",
  "^CNXFMCG",
  "^CNXMETAL",
  "^CNXENERGY",
  "^CNXREALTY",
] as const;

const KNOWN = new Set(NIFTY_CATALOGUE.map((row) => row.symbol));

export function catalogueBySymbol(symbol: string): CatalogueIndex | null {
  return NIFTY_CATALOGUE.find((row) => row.symbol === symbol) || null;
}

function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((symbol, index) => symbol === b[index]);
}

/** Drop unknown symbols and duplicates. Order is the user's order. */
export function sanitizeKeyIndices(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_KEY_SYMBOLS];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !KNOWN.has(item) || out.includes(item)) continue;
    out.push(item);
  }
  return out;
}

export function loadKeyIndices(raw: string | null): string[] {
  if (raw == null || raw === "") return [...DEFAULT_KEY_SYMBOLS];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_KEY_SYMBOLS];
    if (parsed.every((item) => typeof item === "string") && sameOrder(parsed, PREVIOUS_KEY_DEFAULT)) {
      return [...DEFAULT_KEY_SYMBOLS];
    }
    return sanitizeKeyIndices(parsed);
  } catch {
    return [...DEFAULT_KEY_SYMBOLS];
  }
}

export function moveKey(list: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [row] = next.splice(from, 1);
  if (!row) return list;
  next.splice(to, 0, row);
  return next;
}

export const FAMILY_LABEL: Record<string, string> = {
  Strategy: "Strategy / factor",
};
