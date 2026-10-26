/**
 * Official Nifty sector board.
 * Sectoral names are the 34 indices on the NSE Indices sectoral menu as of the
 * 30 Sep 2026 benchmark-code list and the 15 Jun 2026 launch of 11 sector indices.
 * Infrastructure, Commodities, CPSE, India Consumption, and India Defence stay thematic.
 * A missing price history is reported. It is not replaced with another index.
 */

export type SectorClass = "sectoral" | "thematic";

export type OfficialSector = {
  name: string;
  registrySymbol: string;
  catalogueSymbol: string | null;
  klass: SectorClass;
};

export const OFFICIAL_SECTORS: OfficialSector[] = [
  { name: "Nifty Auto", registrySymbol: "NIFTY AUTO", catalogueSymbol: "^CNXAUTO", klass: "sectoral" },
  { name: "Nifty Bank", registrySymbol: "NIFTY BANK", catalogueSymbol: "^NSEBANK", klass: "sectoral" },
  { name: "Nifty Capital Goods", registrySymbol: "NIFTY CAPITAL GOODS", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Cement", registrySymbol: "NIFTY CEMENT", catalogueSymbol: "NIFTY_CEMENT.NS", klass: "sectoral" },
  { name: "Nifty Chemicals", registrySymbol: "NIFTY CHEMICALS", catalogueSymbol: "NIFTY_CHEMICALS.NS", klass: "sectoral" },
  { name: "Nifty Commercial & Transport Services", registrySymbol: "NIFTY COMMERCIAL TRANSPORT SERVICES", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Construction", registrySymbol: "NIFTY CONSTRUCTION", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Consumer Durables", registrySymbol: "NIFTY CONSUMER DURABLES", catalogueSymbol: "NIFTY_CONSR_DURBL.NS", klass: "sectoral" },
  { name: "Nifty Consumer Services", registrySymbol: "NIFTY CONSUMER SERVICES", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Financial Services", registrySymbol: "NIFTY FINANCIAL SERVICES", catalogueSymbol: "NIFTY_FIN_SERVICE.NS", klass: "sectoral" },
  { name: "Nifty Financial Services 25/50", registrySymbol: "NIFTY FINANCIAL SERVICES 25 50", catalogueSymbol: "^CNXFIN", klass: "sectoral" },
  { name: "Nifty Financial Services Ex-Bank", registrySymbol: "NIFTY FINANCIAL SERVICES EX BANK", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty FMCG", registrySymbol: "NIFTY FMCG", catalogueSymbol: "^CNXFMCG", klass: "sectoral" },
  { name: "Nifty Healthcare", registrySymbol: "NIFTY HEALTHCARE INDEX", catalogueSymbol: "NIFTY_HEALTHCARE.NS", klass: "sectoral" },
  { name: "Nifty Hospitals", registrySymbol: "NIFTY HOSPITALS", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Housing Finance", registrySymbol: "NIFTY HOUSING FINANCE", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Insurance", registrySymbol: "NIFTY INSURANCE", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty IT", registrySymbol: "NIFTY IT", catalogueSymbol: "^CNXIT", klass: "sectoral" },
  { name: "Nifty Media", registrySymbol: "NIFTY MEDIA", catalogueSymbol: "^CNXMEDIA", klass: "sectoral" },
  { name: "Nifty Metal", registrySymbol: "NIFTY METAL", catalogueSymbol: "^CNXMETAL", klass: "sectoral" },
  { name: "Nifty MidSmall Financial Services", registrySymbol: "NIFTY MIDSMALL FINANCIAL SERVICES", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty MidSmall Healthcare", registrySymbol: "NIFTY MIDSMALL HEALTHCARE", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty MidSmall IT & Telecom", registrySymbol: "NIFTY MIDSMALL IT TELECOM", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty NBFC", registrySymbol: "NIFTY NBFC", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Oil & Gas", registrySymbol: "NIFTY OIL GAS", catalogueSymbol: "NIFTY_OIL_AND_GAS.NS", klass: "sectoral" },
  { name: "Nifty Pharma", registrySymbol: "NIFTY PHARMA", catalogueSymbol: "^CNXPHARMA", klass: "sectoral" },
  { name: "Nifty Power", registrySymbol: "NIFTY POWER", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Private Bank", registrySymbol: "NIFTY PRIVATE BANK", catalogueSymbol: "NIFTY_PVT_BANK.NS", klass: "sectoral" },
  { name: "Nifty PSU Bank", registrySymbol: "NIFTY PSU BANK", catalogueSymbol: "^CNXPSUBANK", klass: "sectoral" },
  { name: "Nifty Realty", registrySymbol: "NIFTY REALTY", catalogueSymbol: "^CNXREALTY", klass: "sectoral" },
  { name: "Nifty REITs & Realty", registrySymbol: "NIFTY REITS REALTY", catalogueSymbol: "NIFTY_REITS_REALTY.NS", klass: "sectoral" },
  { name: "Nifty Retail", registrySymbol: "NIFTY RETAIL", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Telecommunications", registrySymbol: "NIFTY TELECOMMUNICATIONS", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty500 Healthcare", registrySymbol: "NIFTY500 HEALTHCARE", catalogueSymbol: null, klass: "sectoral" },
  { name: "Nifty Infrastructure", registrySymbol: "NIFTY INFRASTRUCTURE", catalogueSymbol: "^CNXINFRA", klass: "thematic" },
  { name: "Nifty Energy", registrySymbol: "NIFTY ENERGY", catalogueSymbol: "^CNXENERGY", klass: "thematic" },
  { name: "Nifty Commodities", registrySymbol: "NIFTY COMMODITIES", catalogueSymbol: "^CNXCMDT", klass: "thematic" },
  { name: "Nifty India Defence", registrySymbol: "NIFTY INDIA DEFENCE", catalogueSymbol: null, klass: "thematic" },
  { name: "Nifty CPSE", registrySymbol: "NIFTY CPSE", catalogueSymbol: "NIFTY_CPSE.NS", klass: "thematic" },
  { name: "Nifty India Consumption", registrySymbol: "NIFTY INDIA CONSUMPTION", catalogueSymbol: "^CNXCONSUM", klass: "thematic" },
];

export type SectorStatus = {
  name: string;
  registrySymbol: string;
  catalogueSymbol: string | null;
  klass: SectorClass;
  status: string;
  from: string | null;
  to: string | null;
  rows: number;
  plottable: boolean;
  reason: string | null;
};

type RegistryHit = { symbol: string; status?: string; from?: string | null; to?: string | null; rows?: number; notes?: string[] };

export function sectorBoard(registry: RegistryHit[]): SectorStatus[] {
  const bySymbol = new Map(registry.map((row) => [row.symbol, row]));
  return OFFICIAL_SECTORS.map((sector) => {
    const hit = bySymbol.get(sector.registrySymbol);
    const status = hit?.status || "missing";
    const plottable = status === "imported" || status === "limited" || status === "stale";
    return {
      ...sector,
      status,
      from: hit?.from || null,
      to: hit?.to || null,
      rows: hit?.rows || 0,
      plottable,
      reason: plottable ? null : hit?.notes?.find(Boolean) || "No stored history for this index.",
    };
  });
}

export type Member = { symbol: string; name: string; weight: number | null };

export type AnnotatedMember = Member & { history: "stored" | "missing" };

/** Current basket only. Weights are returned for display and are not an RRG input. */
export function resolveMembers(rows: Member[], cap = 24) {
  const seen = new Set<string>();
  const unique: Member[] = [];
  let duplicates = 0;
  for (const row of [...rows].sort((a, b) => (b.weight ?? -1) - (a.weight ?? -1) || a.symbol.localeCompare(b.symbol))) {
    const symbol = row.symbol.trim().toUpperCase();
    if (!symbol || seen.has(symbol)) {
      if (symbol) duplicates += 1;
      continue;
    }
    seen.add(symbol);
    unique.push({ symbol, name: row.name || symbol, weight: row.weight });
  }
  return {
    plotted: unique.slice(0, cap),
    overflow: unique.slice(cap),
    duplicates,
    membership: "current" as const,
  };
}

/** Official membership rows, deduped. History is a stored-symbol check, not an industry tag. */
export function annotateMembers(rows: { symbol: string | null; name: string; weight: number | null }[], stored: Set<string>) {
  const seen = new Set<string>();
  const unique: AnnotatedMember[] = [];
  let duplicates = 0;
  let unnamed = 0;
  for (const row of rows) {
    const symbol = String(row.symbol || "").trim().toUpperCase();
    if (!symbol) {
      unnamed += 1;
      continue;
    }
    if (seen.has(symbol)) {
      duplicates += 1;
      continue;
    }
    seen.add(symbol);
    unique.push({ symbol, name: row.name || symbol, weight: row.weight, history: stored.has(symbol) ? "stored" : "missing" });
  }
  unique.sort((a, b) => (b.weight ?? -1) - (a.weight ?? -1) || a.symbol.localeCompare(b.symbol));
  return {
    rows: unique,
    duplicates,
    unnamed,
    stored: unique.filter((row) => row.history === "stored").length,
    missing: unique.filter((row) => row.history === "missing").length,
    membership: "current" as const,
  };
}
