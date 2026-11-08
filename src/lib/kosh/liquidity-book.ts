/** Portfolio books and market-cap gates for the liquidity scan. Bands are Kosh working cuts, not a SEBI classification. */

import { listingExchange, listingId, listingLabel } from "./listing.ts";

export type CapBand = "large" | "mid" | "small" | "micro" | "nano";

export type McapSpec = {
  band: CapBand | "all";
  minCr: number | null;
  maxCr: number | null;
  includeUnknown: boolean;
};

export type CapObservation = {
  mcapCr: number | null;
  asOf: number | null;
  /** known: a positive ₹ crore figure. missing: the quote had no cap. unavailable: the quote did not answer. */
  state: "known" | "missing" | "unavailable";
};

export type BookName = { symbol: string; name: string; exchange: "NSE" | "BSE" };

export type HoldingLine = { symbol: string; name?: string; kind?: string };

export const EMPTY_MCAP: McapSpec = { band: "all", minCr: null, maxCr: null, includeUnknown: false };

/** Same large / mid / small cuts as the portfolio page. Micro and nano split the old “under ₹500 Cr” bucket. Not SEBI. */
export function capBand(mcapCr: number | null | undefined): CapBand | null {
  if (mcapCr == null || !Number.isFinite(mcapCr) || mcapCr <= 0) return null;
  if (mcapCr >= 20_000) return "large";
  if (mcapCr >= 5_000) return "mid";
  if (mcapCr >= 500) return "small";
  if (mcapCr >= 50) return "micro";
  return "nano";
}

export function mcapActive(spec: McapSpec): boolean {
  return spec.band !== "all" || spec.minCr != null || spec.maxCr != null;
}

export function passesMcap(obs: CapObservation | undefined, spec: McapSpec): boolean {
  if (!mcapActive(spec)) return true;
  if (!obs || obs.state !== "known" || obs.mcapCr == null) return spec.includeUnknown;
  if (spec.band !== "all" && capBand(obs.mcapCr) !== spec.band) return false;
  if (spec.minCr != null && obs.mcapCr < spec.minCr) return false;
  if (spec.maxCr != null && obs.mcapCr > spec.maxCr) return false;
  return true;
}

export function selectByMcap<T extends { symbol: string }>(
  rows: T[],
  caps: Map<string, CapObservation>,
  spec: McapSpec,
  pin: (row: T) => string,
): { eligible: T[]; excluded: number; missing: number; unavailable: number; asOf: number | null } {
  if (!mcapActive(spec)) {
    return { eligible: rows.slice(), excluded: 0, missing: 0, unavailable: 0, asOf: null };
  }
  const eligible: T[] = [];
  let excluded = 0;
  let missing = 0;
  let unavailable = 0;
  let asOf: number | null = null;
  for (const row of rows) {
    const obs = caps.get(pin(row));
    if (obs?.asOf != null && (asOf == null || obs.asOf < asOf)) asOf = obs.asOf;
    if (!obs || obs.state === "unavailable") unavailable += 1;
    else if (obs.state === "missing" || obs.mcapCr == null) missing += 1;
    if (passesMcap(obs, spec)) eligible.push(row);
    else if (obs && obs.state === "known") excluded += 1;
  }
  return { eligible, excluded, missing, unavailable, asOf };
}

/** Short token so a different eligible set cannot reuse another scan. Empty when the filter is off. */
export function mcapCacheToken(spec: McapSpec, eligiblePins: string[]): string {
  if (!mcapActive(spec)) return "";
  const min = spec.minCr == null ? "" : String(spec.minCr);
  const max = spec.maxCr == null ? "" : String(spec.maxCr);
  return `cap:${spec.band}|min:${min}|max:${max}|unk:${spec.includeUnknown ? 1 : 0}|elig:${hashPins(eligiblePins)}`;
}

export function hashPins(pins: string[]): string {
  let h = 2166136261;
  const sorted = pins.map((pin) => pin.trim().toUpperCase()).filter(Boolean).sort();
  for (const pin of sorted) {
    for (let i = 0; i < pin.length; i++) {
      h ^= pin.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 124;
  }
  return (h >>> 0).toString(36);
}

export type PortfolioBook = {
  rows: BookName[];
  unmapped: { symbol: string; name: string; reason: string }[];
};

/** One scan list from the selected portfolios. NSE and BSE stay separate. Commodities and indexes are named, not scanned. */
export function portfolioScanBook(holdings: HoldingLine[]): PortfolioBook {
  const rows: BookName[] = [];
  const seen = new Set<string>();
  const unmapped: PortfolioBook["unmapped"] = [];
  for (const row of holdings) {
    const raw = String(row.symbol || "").trim();
    const name = String(row.name || raw).trim() || raw;
    if (!raw) continue;
    if (row.kind === "commodity" || raw === "GOLD" || raw === "SILVER" || raw.startsWith("^") || raw.includes("=")) {
      unmapped.push({ symbol: raw, name, reason: raw.startsWith("^") ? "Indexes are not scanned." : "Commodity holdings are not scanned." });
      continue;
    }
    const exchange = listingExchange(raw);
    if (exchange === "OTHER") {
      unmapped.push({ symbol: raw, name, reason: "No NSE or BSE listing on this holding." });
      continue;
    }
    const id = listingId(raw);
    if (!id) {
      unmapped.push({ symbol: raw, name, reason: "No NSE or BSE listing on this holding." });
      continue;
    }
    const key = `${exchange}:${listingLabel(id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ symbol: id, name, exchange });
  }
  return { rows, unmapped };
}

export function parseCr(raw: string): number | null {
  const text = raw.trim().replace(/,/g, "");
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** A cap older than 12 hours is stale. A missing observation is not fresh. */
export const MCAP_TTL_MS = 12 * 60 * 60 * 1000;

export function capIsFresh(asOf: number | null, now = Date.now(), ttlMs = MCAP_TTL_MS): boolean {
  return asOf != null && Number.isFinite(asOf) && now - asOf <= ttlMs && now >= asOf;
}

/** Scan identity. Symbols are sorted. A market-cap token is appended only when the filter is on. */
export function liquidityCacheKey(tf: string, universe: string, symbols: string[], revision = "", filter = "") {
  const list = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].sort().join(",");
  const base = `v3|${tf}|${universe}|${revision}|${list}`;
  return filter ? `${base}|${filter}` : base;
}
