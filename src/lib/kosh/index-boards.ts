/** Display groups for the index heatmap.
The quote catalogue and its `family` field stay as they are.
Energy and infrastructure stay Thematic on that field (the NSE board used by
rotation) and are shown under Sectors here, which is where a reader looks for them.
Nothing in this file adds a symbol that the catalogue does not already price.
*/

import { NIFTY_CATALOGUE, type CatalogueIndex } from "./nifty-catalogue.ts";

export const HEAT_BOARDS = [
  { id: "broad", label: "Broad market" },
  { id: "sector", label: "Sectors" },
  { id: "thematic", label: "Thematic" },
  { id: "strategy", label: "Strategy" },
] as const;

export type HeatBoardId = (typeof HEAT_BOARDS)[number]["id"];

export type HeatSpot = {
  board: HeatBoardId;
  group: string;
  groupOrder: number;
  order: number;
};

const SPOT = new Map<string, HeatSpot>();

function put(symbols: readonly string[], board: HeatBoardId, group: string, groupOrder: number) {
  symbols.forEach((symbol, order) => {
    SPOT.set(symbol, { board, group, groupOrder, order });
  });
}

put(
  ["^NSEI", "^BSESN"],
  "broad",
  "Benchmarks",
  0,
);
put(
  ["^NSMIDCP", "^CNX100", "^CNX200", "^CRSLDX", "NIFTY_LARGEMID250.NS", "NIFTY_TOTAL_MKT.NS", "NIFTY50_USD.NS"],
  "broad",
  "Large and broad",
  1,
);
put(
  ["^NSEMDCP50", "NIFTY_MIDCAP_100.NS", "NIFTYMIDCAP150.NS", "NIFTY_MID_SELECT.NS"],
  "broad",
  "Mid-cap",
  2,
);
put(["NIFTYSMLCAP50.NS", "^CNXSC", "NIFTYSMLCAP250.NS"], "broad", "Small-cap", 3);
put(["NIFTY_MICROCAP250.NS"], "broad", "Micro-cap", 4);
put(["NIFTYMIDSML400.NS"], "broad", "Cross-cap", 5);

put(["^NSEBANK", "NIFTY_PVT_BANK.NS", "^CNXPSUBANK"], "sector", "Banking", 0);
put(["NIFTY_FIN_SERVICE.NS", "^CNXFIN"], "sector", "Financial services", 1);
put(["^CNXIT"], "sector", "Information technology", 2);
put(["^CNXAUTO"], "sector", "Automobile", 3);
put(["^CNXFMCG"], "sector", "FMCG", 4);
put(["^CNXPHARMA", "NIFTY_HEALTHCARE.NS"], "sector", "Pharma and healthcare", 5);
put(["^CNXREALTY"], "sector", "Realty", 6);
put(["^CNXMETAL"], "sector", "Metal", 7);
put(["^CNXENERGY", "NIFTY_OIL_AND_GAS.NS"], "sector", "Energy", 8);
put(["^CNXINFRA", "NIFTY_INFRALOG.NS"], "sector", "Infrastructure", 9);
put(["^CNXMEDIA"], "sector", "Media", 10);
put(["NIFTY_CONSR_DURBL.NS"], "sector", "Consumer durables", 11);
put(["NIFTY_CHEMICALS.NS"], "sector", "Chemicals", 12);
put(["NIFTY_CEMENT.NS"], "sector", "Cement", 13);

put(["NIFTY_IND_DEFENCE.NS"], "thematic", "India Defence", 0);
put(["NIFTY_CAPITAL_MKT.NS"], "thematic", "Capital markets", 1);
put(["^CNXPSE", "NIFTY_CPSE.NS"], "thematic", "PSU", 2);
put(["NIFTY_INDIA_MFG.NS"], "thematic", "Manufacturing", 3);
put(["^CNXCONSUM"], "thematic", "Consumption", 4);
put(["^CNXCMDT"], "thematic", "Commodities", 5);
put(["^CNXSERVICE"], "thematic", "Services", 6);
put(["^CNXMNC"], "thematic", "MNC", 7);

put(
  [
    "^CNXDIVOP",
    "NI15.NS",
    "NIFTYALPHA50.NS",
    "NIFTYALPHALOWVOL.NS",
    "NIFTY200_ALPHA_30.NS",
    "NIFTY500_MULTICAP.NS",
    "NIFTY500_VALUE_50.NS",
    "NIFTY100LOWVOL30.NS",
    "NIFTY100_EQL_WGT.NS",
    "LIX15.NS",
    "NIFTY100_ESG.NS",
    "NIFTY_TATA_25_CAP.NS",
    "NIFTY_SML250_Q50.NS",
    "NIFTYPR2XLEV.NS",
    "NIFTYTR2XLEV.NS",
  ],
  "strategy",
  "Strategy and factor",
  0,
);
put(
  [
    "NIFTYGS4TO8YR.NS",
    "NIFTYGS8TO13YR.NS",
    "NIFTYGS10YR.NS",
    "NIFTYGS10YRCLN.NS",
    "NIFTYGS11TO15YR.NS",
    "NIFTYGS15YRPLUS.NS",
    "NIFTYGSCOMPOSITE.NS",
  ],
  "strategy",
  "Government securities",
  1,
);
put(["^INDIAVIX"], "strategy", "Volatility", 2);

export function heatSpot(symbol: string): HeatSpot | null {
  return SPOT.get(symbol) || null;
}

export type HeatGroup = {
  board: HeatBoardId;
  group: string;
  groupOrder: number;
  rows: CatalogueIndex[];
};

/** Groups in board order. Pass a board to show one category. Unknown symbols are omitted, not invented. */
export function heatGroups(rows: CatalogueIndex[], board?: HeatBoardId): HeatGroup[] {
  const map = new Map<string, HeatGroup>();
  for (const row of rows) {
    const spot = SPOT.get(row.symbol);
    if (!spot || (board && spot.board !== board)) continue;
    const key = `${spot.board}|${spot.group}`;
    const cur = map.get(key);
    if (cur) cur.rows.push(row);
    else map.set(key, { board: spot.board, group: spot.group, groupOrder: spot.groupOrder, rows: [row] });
  }
  for (const group of map.values()) {
    group.rows.sort((a, b) => (SPOT.get(a.symbol)?.order || 0) - (SPOT.get(b.symbol)?.order || 0));
  }
  const boardOrder = new Map(HEAT_BOARDS.map((item, index) => [item.id, index]));
  return [...map.values()].sort(
    (a, b) => (boardOrder.get(a.board) || 0) - (boardOrder.get(b.board) || 0) || a.groupOrder - b.groupOrder,
  );
}

/** One continuous list for a primary tab. Group order is kept; the headings are not part of the list. */
export function heatBoardRows(rows: CatalogueIndex[], board?: HeatBoardId): CatalogueIndex[] {
  return heatGroups(rows, board).flatMap((group) => group.rows);
}

export function catalogueCoverage(): { missing: string[]; extra: string[] } {
  const known = new Set(NIFTY_CATALOGUE.map((row) => row.symbol));
  const missing = NIFTY_CATALOGUE.filter((row) => !SPOT.has(row.symbol)).map((row) => row.symbol);
  const extra = [...SPOT.keys()].filter((symbol) => !known.has(symbol));
  return { missing, extra };
}

export type HeatTone = "up-strong" | "up" | "up-soft" | "flat" | "down-soft" | "down" | "down-strong";

/** Card wash from the session percentage. Missing or ~flat stays neutral. Same thresholds in both themes. */
export function heatTone(pct: number | null | undefined): HeatTone {
  if (pct == null || !Number.isFinite(pct) || Math.abs(pct) < 0.05) return "flat";
  const mag = Math.abs(pct);
  if (pct > 0) return mag >= 1.25 ? "up-strong" : mag >= 0.4 ? "up" : "up-soft";
  return mag >= 1.25 ? "down-strong" : mag >= 0.4 ? "down" : "down-soft";
}

/** Shared movement tokens. Theme colours come from --k-up / --k-down, not a second palette. */
export function heatToneClass(tone: HeatTone): string {
  if (tone === "up-strong") return "bg-up/70";
  if (tone === "up") return "bg-up/35";
  if (tone === "up-soft") return "bg-up/20";
  if (tone === "down-soft") return "bg-down/20";
  if (tone === "down") return "bg-down/35";
  if (tone === "down-strong") return "bg-down/70";
  return "bg-surface-2";
}
