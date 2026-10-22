/** One way to open a market instrument. Indices go to Terminal via the URL so a late store reload cannot overwrite the request. */

import { BENCH } from "./benchmarks.ts";
import { NIFTY_CATALOGUE } from "./nifty-catalogue.ts";

export type InstrumentKind = "index" | "stock" | "commodity";

let indexSymbols: Set<string> | null = null;
function indexSymbolSet() {
  // Same rule as niftySymbols(): do not read imported arrays while the module is loading.
  indexSymbols ??= new Set(
    [...Object.values(BENCH).map((b) => b.symbol), ...NIFTY_CATALOGUE.map((row) => row.symbol)].map((s) =>
      s.toUpperCase().replace(/\.(NS|BO)$/i, ""),
    ),
  );
  return indexSymbols;
}

export function instrumentKind(symbol: string): InstrumentKind {
  const s = String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  if (s === "GOLD" || s === "SILVER") return "commodity";
  if (s.startsWith("^") || indexSymbolSet().has(s)) return "index";
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
