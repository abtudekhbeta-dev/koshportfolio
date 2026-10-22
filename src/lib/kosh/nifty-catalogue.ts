/**
 * Nifty indices Yahoo chart meta actually priced on 2026-10-14
 * (regularMarketPrice > 0 and a finite regularMarketChangePercent).
 * This is every Nifty index that feed returned, not a guessed NSE list.
 * Left out on purpose: NV20.NS is the Kotak Nifty 50 Value 20 ETF, and
 * ^NSEDIV is dividend points with a zero session change.
 */
export const NIFTY_CATALOGUE_VERSION = "2026-10-14";

export type IndexFamily = "Broad market" | "Sectoral" | "Mid / small cap" | "Strategy" | "Bonds" | "Volatility";

export type CatalogueIndex = {
  symbol: string;
  name: string;
  family: IndexFamily;
  /** Default sectoral board. Size, strategy, bonds, and VIX stay on All. */
  key?: boolean;
};

export const NIFTY_CATALOGUE: CatalogueIndex[] = [
  { symbol: "^NSEI", name: "Nifty 50", family: "Broad market" },
  { symbol: "^NSMIDCP", name: "Nifty Next 50", family: "Broad market" },
  { symbol: "^CNX100", name: "Nifty 100", family: "Broad market" },
  { symbol: "^CNX200", name: "Nifty 200", family: "Broad market" },
  { symbol: "^CRSLDX", name: "Nifty 500", family: "Broad market" },
  { symbol: "NIFTY_LARGEMID250.NS", name: "Nifty LargeMidcap 250", family: "Broad market" },
  { symbol: "NIFTY_TOTAL_MKT.NS", name: "Nifty Total Market", family: "Broad market" },
  { symbol: "NIFTY50_USD.NS", name: "Nifty 50 USD", family: "Broad market" },

  { symbol: "^NSEBANK", name: "Nifty Bank", family: "Sectoral", key: true },
  { symbol: "NIFTY_FIN_SERVICE.NS", name: "Nifty Financial Services", family: "Sectoral", key: true },
  { symbol: "^CNXFIN", name: "Nifty FinServ 25/50", family: "Sectoral", key: true },
  { symbol: "NIFTY_PVT_BANK.NS", name: "Nifty Private Bank", family: "Sectoral", key: true },
  { symbol: "^CNXPSUBANK", name: "Nifty PSU Bank", family: "Sectoral", key: true },
  { symbol: "^CNXIT", name: "Nifty IT", family: "Sectoral", key: true },
  { symbol: "^CNXAUTO", name: "Nifty Auto", family: "Sectoral", key: true },
  { symbol: "^CNXPHARMA", name: "Nifty Pharma", family: "Sectoral", key: true },
  { symbol: "NIFTY_HEALTHCARE.NS", name: "Nifty Healthcare", family: "Sectoral", key: true },
  { symbol: "^CNXFMCG", name: "Nifty FMCG", family: "Sectoral", key: true },
  { symbol: "NIFTY_CONSR_DURBL.NS", name: "Nifty Consumer Durables", family: "Sectoral", key: true },
  { symbol: "^CNXCONSUM", name: "Nifty Consumption", family: "Sectoral", key: true },
  { symbol: "^CNXENERGY", name: "Nifty Energy", family: "Sectoral", key: true },
  { symbol: "NIFTY_OIL_AND_GAS.NS", name: "Nifty Oil & Gas", family: "Sectoral", key: true },
  { symbol: "^CNXMETAL", name: "Nifty Metal", family: "Sectoral", key: true },
  { symbol: "^CNXCMDT", name: "Nifty Commodities", family: "Sectoral", key: true },
  { symbol: "^CNXREALTY", name: "Nifty Realty", family: "Sectoral", key: true },
  { symbol: "^CNXINFRA", name: "Nifty Infra", family: "Sectoral", key: true },
  { symbol: "NIFTY_INFRALOG.NS", name: "Nifty Infra Logistics", family: "Sectoral", key: true },
  { symbol: "^CNXMEDIA", name: "Nifty Media", family: "Sectoral", key: true },
  { symbol: "^CNXSERVICE", name: "Nifty Services", family: "Sectoral", key: true },
  { symbol: "^CNXMNC", name: "Nifty MNC", family: "Sectoral", key: true },
  { symbol: "^CNXPSE", name: "Nifty PSE", family: "Sectoral", key: true },
  { symbol: "NIFTY_CPSE.NS", name: "Nifty CPSE", family: "Sectoral", key: true },
  { symbol: "NIFTY_INDIA_MFG.NS", name: "Nifty India Manufacturing", family: "Sectoral", key: true },

  { symbol: "^NSEMDCP50", name: "Nifty Midcap 50", family: "Mid / small cap" },
  { symbol: "NIFTY_MIDCAP_100.NS", name: "Nifty Midcap 100", family: "Mid / small cap" },
  { symbol: "NIFTYMIDCAP150.NS", name: "Nifty Midcap 150", family: "Mid / small cap" },
  { symbol: "NIFTY_MID_SELECT.NS", name: "Nifty Midcap Select", family: "Mid / small cap" },
  { symbol: "NIFTYMIDSML400.NS", name: "Nifty MidSmallcap 400", family: "Mid / small cap" },
  { symbol: "NIFTYSMLCAP50.NS", name: "Nifty Smallcap 50", family: "Mid / small cap" },
  { symbol: "^CNXSC", name: "Nifty Smallcap 100", family: "Mid / small cap" },
  { symbol: "NIFTYSMLCAP250.NS", name: "Nifty Smallcap 250", family: "Mid / small cap" },
  { symbol: "NIFTY_MICROCAP250.NS", name: "Nifty Microcap 250", family: "Mid / small cap" },

  { symbol: "^CNXDIVOP", name: "Nifty Dividend Opportunities 50", family: "Strategy" },
  { symbol: "NI15.NS", name: "Nifty Growth Sectors 15", family: "Strategy" },
  { symbol: "NIFTYALPHA50.NS", name: "Nifty Alpha 50", family: "Strategy" },
  { symbol: "NIFTYALPHALOWVOL.NS", name: "Nifty Alpha Low Volatility 30", family: "Strategy" },
  { symbol: "NIFTY200_ALPHA_30.NS", name: "Nifty 200 Alpha 30", family: "Strategy" },
  { symbol: "NIFTY500_MULTICAP.NS", name: "Nifty 500 Multicap", family: "Strategy" },
  { symbol: "NIFTY500_VALUE_50.NS", name: "Nifty 500 Value 50", family: "Strategy" },
  { symbol: "NIFTY100LOWVOL30.NS", name: "Nifty 100 Low Volatility 30", family: "Strategy" },
  { symbol: "NIFTY100_EQL_WGT.NS", name: "Nifty 100 Equal Weight", family: "Strategy" },
  { symbol: "LIX15.NS", name: "Nifty 100 Liquid 15", family: "Strategy" },
  { symbol: "NIFTY100_ESG.NS", name: "Nifty 100 ESG", family: "Strategy" },
  { symbol: "NIFTY_TATA_25_CAP.NS", name: "Nifty Tata 25 Cap", family: "Strategy" },
  { symbol: "NIFTY_SML250_Q50.NS", name: "Nifty Smallcap 250 Quality 50", family: "Strategy" },
  { symbol: "NIFTYPR2XLEV.NS", name: "Nifty 50 PR 2x", family: "Strategy" },
  { symbol: "NIFTYTR2XLEV.NS", name: "Nifty 50 TR 2x", family: "Strategy" },

  { symbol: "NIFTYGS4TO8YR.NS", name: "Nifty GS 4-8Y", family: "Bonds" },
  { symbol: "NIFTYGS8TO13YR.NS", name: "Nifty GS 8-13Y", family: "Bonds" },
  { symbol: "NIFTYGS10YR.NS", name: "Nifty GS 10Y", family: "Bonds" },
  { symbol: "NIFTYGS10YRCLN.NS", name: "Nifty GS 10Y Clean", family: "Bonds" },
  { symbol: "NIFTYGS11TO15YR.NS", name: "Nifty GS 11-15Y", family: "Bonds" },
  { symbol: "NIFTYGS15YRPLUS.NS", name: "Nifty GS 15Y+", family: "Bonds" },
  { symbol: "NIFTYGSCOMPOSITE.NS", name: "Nifty GS Composite", family: "Bonds" },

  { symbol: "^INDIAVIX", name: "India VIX", family: "Volatility" },
];

export const INDEX_FAMILIES: Array<IndexFamily | "All"> = [
  "All",
  "Broad market",
  "Sectoral",
  "Mid / small cap",
  "Strategy",
  "Bonds",
  "Volatility",
];

export function keySectorals(): CatalogueIndex[] {
  return NIFTY_CATALOGUE.filter((row) => row.key);
}
