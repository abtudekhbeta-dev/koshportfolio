import type { BenchMeta } from "./types";

export const BENCH: Record<string, BenchMeta> = {
  nifty: { symbol: "^NSEI", name: "Nifty 50" },
  sensex: { symbol: "^BSESN", name: "Sensex" },
  bank: { symbol: "^NSEBANK", name: "Bank Nifty" },
  fin: { symbol: "^CNXFIN", name: "Nifty Fin Service" },
  it: { symbol: "^CNXIT", name: "Nifty IT" },
  pharma: { symbol: "^CNXPHARMA", name: "Nifty Pharma" },
  auto: { symbol: "^CNXAUTO", name: "Nifty Auto" },
  fmcg: { symbol: "^CNXFMCG", name: "Nifty FMCG" },
  energy: { symbol: "^CNXENERGY", name: "Nifty Energy" },
  metal: { symbol: "^CNXMETAL", name: "Nifty Metal" },
  realty: { symbol: "^CNXREALTY", name: "Nifty Realty" },
  infra: { symbol: "^CNXINFRA", name: "Nifty Infra" },
  mid: { symbol: "^NSEMDCP50", name: "Nifty Midcap 50" },
  n100: { symbol: "^CNX100", name: "Nifty 100" },
  n500: { symbol: "^CRSLDX", name: "Nifty 500" },
};

export const TAPE: { id: string; symbol: string; label: string }[] = [
  { id: "nifty", symbol: "^NSEI", label: "NIFTY 50" },
  { id: "sensex", symbol: "^BSESN", label: "SENSEX" },
  { id: "bank", symbol: "^NSEBANK", label: "BANK NIFTY" },
  { id: "mid", symbol: "^NSEMDCP50", label: "MIDCAP 50" },
  { id: "it", symbol: "^CNXIT", label: "NIFTY IT" },
  { id: "pharma", symbol: "^CNXPHARMA", label: "NIFTY PHARMA" },
  { id: "auto", symbol: "^CNXAUTO", label: "NIFTY AUTO" },
  { id: "fmcg", symbol: "^CNXFMCG", label: "NIFTY FMCG" },
  { id: "gold", symbol: "GOLD", label: "GOLD" },
  { id: "silver", symbol: "SILVER", label: "SILVER" },
];

/** Prefer the real index. Null means we do not have that sector index — never relabel Nifty 500. */
export const SECTOR_BENCH: Record<string, BenchMeta | null> = {
  Financials: { symbol: "^NSEBANK", name: "Nifty Bank" },
  IT: { symbol: "^CNXIT", name: "Nifty IT" },
  Healthcare: { symbol: "^CNXPHARMA", name: "Nifty Pharma" },
  Auto: { symbol: "^CNXAUTO", name: "Nifty Auto" },
  FMCG: { symbol: "^CNXFMCG", name: "Nifty FMCG" },
  Consumer: { symbol: "^CNXFMCG", name: "Nifty FMCG" },
  Energy: { symbol: "^CNXENERGY", name: "Nifty Energy" },
  Metal: { symbol: "^CNXMETAL", name: "Nifty Metal" },
  Materials: { symbol: "^CNXMETAL", name: "Nifty Metal" },
  Realty: { symbol: "^CNXREALTY", name: "Nifty Realty" },
  Infra: { symbol: "^CNXINFRA", name: "Nifty Infra" },
  Telecom: null,
  Chemicals: null,
  Industrials: null,
  Other: null,
  Commodities: null,
};

export function sectorIndex(sector: string | null | undefined): BenchMeta | null {
  if (!sector) return null;
  if (sector in SECTOR_BENCH) return SECTOR_BENCH[sector];
  return null;
}

export function resolveBench(key: string | undefined | null): BenchMeta {
  if (!key) return BENCH.nifty;
  if (BENCH[key]) return BENCH[key];
  const raw = key.trim();
  if (!raw) return BENCH.nifty;
  return { symbol: raw, name: raw.replace(/^\^/, "") };
}

export function allSectorBenchSymbols(): string[] {
  return [...new Set(Object.values(SECTOR_BENCH).flatMap((s) => (s ? [s.symbol] : [])))];
}
