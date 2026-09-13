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

/** Prefer Nifty indices that actually have 10y daily bars on Yahoo.
 *  Several CNX sector tickers only return a last price — use the ETF that tracks them. */
export const SECTOR_BENCH: Record<string, BenchMeta> = {
  Financials: { symbol: "^NSEBANK", name: "Nifty Bank" },
  IT: { symbol: "^CNXIT", name: "Nifty IT" },
  Healthcare: { symbol: "^CNXPHARMA", name: "Nifty Pharma" },
  Auto: { symbol: "AUTOBEES.NS", name: "Nifty Auto ETF" },
  FMCG: { symbol: "CONSUMBEES.NS", name: "Nifty Consumption" },
  Consumer: { symbol: "CONSUMBEES.NS", name: "Nifty Consumption" },
  Energy: { symbol: "CPSEETF.NS", name: "CPSE ETF" },
  Telecom: { symbol: "^NSEI", name: "Nifty 50" },
  Materials: { symbol: "^CRSLDX", name: "Nifty 500" },
  Chemicals: { symbol: "^CRSLDX", name: "Nifty 500" },
  Industrials: { symbol: "^CRSLDX", name: "Nifty 500" },
  Realty: { symbol: "^CRSLDX", name: "Nifty 500" },
  Other: { symbol: "^NSEI", name: "Nifty 50" },
  Commodities: { symbol: "XAUINR=X", name: "Gold (INR)" },
};

export function resolveBench(key: string | undefined | null): BenchMeta {
  if (!key) return BENCH.nifty;
  if (BENCH[key]) return BENCH[key];
  const raw = key.trim();
  if (!raw) return BENCH.nifty;
  return { symbol: raw, name: raw.replace(/^\^/, "") };
}

export function allSectorBenchSymbols(): string[] {
  return [...new Set(Object.values(SECTOR_BENCH).map((s) => s.symbol))];
}
