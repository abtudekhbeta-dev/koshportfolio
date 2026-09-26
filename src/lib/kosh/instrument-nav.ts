/** One way to open a market instrument. Indices go to Terminal via the URL so a late store reload cannot overwrite the request. */

import { BENCH } from "./benchmarks.ts";

export type InstrumentKind = "index" | "stock" | "commodity";

const INDEX_SYMBOLS = new Set(Object.values(BENCH).map((b) => b.symbol.toUpperCase()));

export function instrumentKind(symbol: string): InstrumentKind {
  const s = String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  if (s === "GOLD" || s === "SILVER") return "commodity";
  if (s.startsWith("^") || INDEX_SYMBOLS.has(s)) return "index";
  return "stock";
}

export function terminalSearch(symbol: string, name?: string) {
  const symbolOut = String(symbol || "").trim();
  const nameOut = String(name || "").trim();
  return {
    view: "terminal" as const,
    symbol: symbolOut,
    ...(nameOut ? { name: nameOut } : {}),
  };
}

export type MoveSortKey = "name" | "last" | "chg" | "chgPct";

/** Holdings today is a movement table. Value and weight are not sort keys. */
export function cleanHoldSort(
  sort: { key?: string; dir?: string } | null | undefined,
): { key: MoveSortKey; dir: "asc" | "desc" } | null {
  if (!sort) return null;
  const key = sort.key;
  const dir = sort.dir;
  if (key !== "name" && key !== "last" && key !== "chg" && key !== "chgPct") return null;
  if (dir !== "asc" && dir !== "desc") return null;
  return { key, dir };
}
