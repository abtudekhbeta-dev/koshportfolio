/** Live Nifty baskets from published ETF and index-fund holdings. Server-only. */

import type { CatalogueIndex } from "./nifty-catalogue.ts";
import { NIFTY_CATALOGUE } from "./nifty-catalogue.ts";
import { NIFTY50 } from "./universe.ts";
import { NIFTY500 } from "./nifty500.ts";
import { indexSnapshot } from "./index-snapshots.ts";
import {
  acceptBasket,
  benchmarkMatches,
  buildNameIndex,
  parseEtfHtml,
  parseSchemePayload,
  symbolForName,
  weightSum,
  type BasketRow,
  type ParsedBasket,
} from "./index-basket.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type IndexBasket = {
  symbol: string;
  name: string;
  rows: BasketRow[];
  weightSum: number;
  source: string | null;
  benchmark: string | null;
  asOf: string | null;
  note: string | null;
  unavailable: string | null;
};

type Tracker = {
  etf?: string[];
  fund?: string[];
  growwIndex?: string;
  queries?: string[];
  aliases?: string[];
};

const TRACKERS: Record<string, Tracker> = {
  "^NSEI": { etf: ["reliance-etf-nifty-bees"] },
  "^NSMIDCP": { etf: ["reliance-etf-junior-bees"] },
  "^CNX100": { etf: ["icici-prudential-nifty-etf-246894"] },
  "^CNX200": { etf: ["groww-nifty-etf"] },
  "^CRSLDX": { fund: ["motilal-oswal-nifty-500-index-fund-direct-growth", "sbi-nifty-500-index-fund-direct-growth"], growwIndex: "nifty-500" },
  "NIFTY_LARGEMID250.NS": { fund: ["hdfc-nifty-largemidcap-250-index-fund-direct-growth"] },
  "NIFTY_TOTAL_MKT.NS": { fund: ["groww-nifty-total-market-index-fund-direct-growth"], growwIndex: "nifty-total-market-index" },
  "^NSEBANK": { etf: ["bajaj-finserv-nifty-bank-etf", "reliance-etf-bank-bees"], queries: ["bankbees"] },
  "NIFTY_FIN_SERVICE.NS": { etf: ["mirae-asset-nifty-financial-services-etf"] },
  "^CNXFIN": { queries: ["nifty financial services 25/50", "nifty finserv 25/50"], aliases: ["Nifty Financial Services 25/50"] },
  "NIFTY_PVT_BANK.NS": { etf: ["icici-prudential-private-banks-etf"] },
  "^CNXPSUBANK": { etf: ["reliance-etf-psu-bank-bees", "groww-nifty-psu-bank-etf-ltd"] },
  "^CNXIT": { etf: ["nippon-india-etf-nifty-it"] },
  "^CNXAUTO": { etf: ["nippon-india-nifty-auto-etf-netfauto", "icici-prudential-nifty-auto-etf-iciciauto"] },
  "^CNXPHARMA": { etf: ["nippon-india-nifty-pharma-etf-netfpharma"] },
  "NIFTY_HEALTHCARE.NS": { etf: ["aditya-birla-sun-life-nifty-healthcare-etf"] },
  "^CNXFMCG": { etf: ["icici-prudential-fmcg-etf", "dsp-nifty-fmcg-etf"] },
  "NIFTY_CONSR_DURBL.NS": { queries: ["nifty consumer durables etf", "nifty consumer durables index fund"] },
  "^CNXCONSUM": { etf: ["kotak-nifty-india-consumption-etf", "icici-prudential-mutual-fund-icici-prudential-consumption-etf", "sbi-mutual-fund-sbi-etf-consumption"] },
  "^CNXENERGY": { etf: ["motilal-oswal-nifty-energy-etf-ltd", "mirae-asset-nifty-energy-etf"] },
  "NIFTY_OIL_AND_GAS.NS": { etf: ["icici-prudential-nifty-oil-gas-etf"] },
  "^CNXMETAL": { etf: ["icici-prudential-nifty-metal-etf", "groww-nifty-metal-etf"] },
  "^CNXCMDT": { etf: ["icici-prudential-nifty-commodities-etf"] },
  "^CNXREALTY": { etf: ["motilal-oswal-nifty-realty-etf", "groww-nifty-realty-etf-ltd"] },
  "^CNXINFRA": { etf: ["icici-prudential-nifty-infrastructure-etf"] },
  "NIFTY_INFRALOG.NS": { etf: ["mirae-asset-nifty-india-infrastructure-logistics-etf"] },
  "^CNXMEDIA": { queries: ["nifty media etf", "nifty media index fund"] },
  "^CNXSERVICE": { etf: ["motilal-oswal-nifty-services-sector-etf"] },
  "^CNXMNC": { etf: ["kotak-nifty-mnc-etf"] },
  "^CNXPSE": { etf: ["groww-nifty-pse-etf"] },
  "NIFTY_CPSE.NS": { etf: ["reliance-mutual-fund-cpse-etf"] },
  "NIFTY_INDIA_MFG.NS": { etf: ["mirae-asset-mutual-fund-mirae-asset-nifty-india-manufacturing-etf"] },
  "^NSEMDCP50": { etf: ["kotak-mahindra-asset-management-company-ltd-kotak-midcap-etf"] },
  "NIFTY_MIDCAP_100.NS": { etf: ["motilal-oswal-most-shares-m-etf"] },
  "NIFTYMIDCAP150.NS": { etf: ["dsp-nifty-midcap-etf", "hdfc-nifty-midcap-etf"] },
  "NIFTY_MID_SELECT.NS": { queries: ["nifty midcap select etf", "nifty midcap select index fund"] },
  "NIFTYMIDSML400.NS": { fund: ["navi-nifty-midsmallcap-400-index-fund-direct-growth"] },
  "NIFTYSMLCAP50.NS": { fund: ["axis-nifty-smallcap-50-index-fund-direct-growth"] },
  "^CNXSC": { etf: ["zerodha-nifty-smallcap-etf"] },
  "NIFTYSMLCAP250.NS": { etf: ["hdfc-nifty-smallcap-etf"] },
  "NIFTY_MICROCAP250.NS": { queries: ["nifty microcap 250 index fund", "nifty microcap 250 etf"] },
  "^CNXDIVOP": { etf: ["reliance-mf-rshares-dividend-opportunities-fund-rsdoetf"] },
  "NI15.NS": { etf: ["hdfc-nifty-growth-sectors-etf"] },
  "NIFTYALPHA50.NS": { etf: ["kotak-nifty-alpha-etf"] },
  "NIFTYALPHALOWVOL.NS": { etf: ["icici-prudential-alpha-low-vol-etf-a-scheme-under-icici-prudential-mutual-fund"] },
  "NIFTY200_ALPHA_30.NS": { etf: ["mirae-asset-nifty-alpha-etf"], queries: ["nifty 200 alpha 30 etf", "nifty 200 alpha 30 index fund"] },
  "NIFTY500_MULTICAP.NS": {
    etf: ["mirae-asset-nifty-multicap-etf"],
    fund: ["navi-nifty-500-multicap-50:25:25-index-fund-direct-growth"],
    aliases: ["Nifty 500 Multicap 50:25:25", "Nifty500 Multicap 50:25:25"],
  },
  "NIFTY500_VALUE_50.NS": { fund: ["uti-nifty-500-value-50-index-fund-direct-growth"] },
  "NIFTY100LOWVOL30.NS": { etf: ["icici-prudential-nifty-low-vol-etf", "kotak-nifty-low-vol-etf"] },
  "NIFTY100_EQL_WGT.NS": { etf: ["kotakmamc-nifty100ew-ltd", "kotak-nifty-equal-weight-etf"] },
  "LIX15.NS": { queries: ["nifty 100 liquid 15 etf", "nifty 100 liquid 15 index"] },
  "NIFTY100_ESG.NS": { etf: ["mirae-asset-esg-sector-leaders-etf"], aliases: ["Nifty 100 ESG Sector Leaders"] },
  "NIFTY_TATA_25_CAP.NS": { queries: ["nifty tata 25 cap etf", "nifty tata group 25"] },
  "NIFTY_SML250_Q50.NS": { fund: ["dsp-nifty-smallcap250-quality-50-index-fund-direct-growth"], aliases: ["Nifty Smallcap 250 Quality 50"] },
};

const OVERLAY: Record<string, { base: string; note: string }> = {
  "NIFTY50_USD.NS": {
    base: "^NSEI",
    note: "Dollar print of Nifty 50. The shares below are the Nifty 50 basket, not a second portfolio.",
  },
  "NIFTYPR2XLEV.NS": {
    base: "^NSEI",
    note: "This is a 2× daily price overlay of Nifty 50. The shares below are the Nifty 50 basket.",
  },
  "NIFTYTR2XLEV.NS": {
    base: "^NSEI",
    note: "This is a 2× daily total-return overlay of Nifty 50. The shares below are the Nifty 50 basket.",
  },
};

let nameIndex: Map<string, string> | null = null;
function stockNames() {
  // First use, not import time. The production router chunks import each other,
  // so a top-level spread of NIFTY500 throws "is not iterable" and every page 500s.
  nameIndex ??= buildNameIndex([...NIFTY500, ...NIFTY50]);
  return nameIndex;
}
const cache = new Map<string, { at: number; ttl: number; data: IndexBasket }>();
const OK_TTL = 6 * 60 * 60 * 1000;
const MISS_TTL = 10 * 60 * 1000;

function slug(id: string) {
  return /^[a-z0-9:._-]+$/i.test(id) ? id : encodeURIComponent(id);
}

async function getText(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Feed ${res.status}`);
  return res.text();
}

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Feed ${res.status}`);
  return res.json();
}

function attachSymbols(rows: BasketRow[], bySearch: Map<string, string> | null) {
  return rows.map((row) => {
    const fromSearch = row.searchId && bySearch ? bySearch.get(row.searchId) : null;
    const symbol = row.symbol || fromSearch || symbolForName(row.name, stockNames());
    return { symbol, name: row.name, weight: row.weight, sector: row.sector };
  });
}

async function growwSymbolMap(indexId: string) {
  const data = (await getJson("https://groww.in/v1/api/stocks_data/v1/company/search_id/" + slug(indexId))) as {
    childAssets?: Array<{ header?: { searchId?: string; nseScriptCode?: string } }>;
  };
  const map = new Map<string, string>();
  for (const child of data.childAssets || []) {
    const id = child.header?.searchId;
    const symbol = String(child.header?.nseScriptCode || "").trim().toUpperCase();
    if (id && symbol) map.set(id, symbol);
  }
  return map;
}

function pack(row: CatalogueIndex, parsed: ParsedBasket, note: string | null, bySearch: Map<string, string> | null = null): IndexBasket | null {
  const rows = attachSymbols(parsed.rows, bySearch);
  if (!acceptBasket(rows)) return null;
  if (!benchmarkMatches(row.name, parsed.benchmark || "", TRACKERS[row.symbol]?.aliases || [])) return null;
  return {
    symbol: row.symbol,
    name: row.name,
    rows,
    weightSum: Math.round(weightSum(rows) * 100) / 100,
    source: parsed.source,
    benchmark: parsed.benchmark,
    asOf: parsed.asOf,
    note,
    unavailable: null,
  };
}

async function fromEtf(row: CatalogueIndex, id: string, note: string | null) {
  const html = await getText("https://groww.in/etfs/" + slug(id));
  const parsed = parseEtfHtml(html);
  if (!parsed) return null;
  return pack(row, parsed, note);
}

async function fromFund(row: CatalogueIndex, id: string, note: string | null) {
  const json = await getJson("https://groww.in/v1/api/data/mf/web/v1/scheme/search/" + slug(id));
  const parsed = parseSchemePayload(json);
  if (!parsed) return null;
  const indexId = TRACKERS[row.symbol]?.growwIndex;
  let bySearch: Map<string, string> | null = null;
  if (indexId) {
    try {
      bySearch = await growwSymbolMap(indexId);
    } catch {
      bySearch = null;
    }
  }
  return pack(row, parsed, note, bySearch);
}

type Hit = { id: string; kind: "ETF" | "Scheme" };

async function searchHits(query: string): Promise<Hit[]> {
  const url =
    "https://groww.in/v1/api/search/v2/query/global/st_p_query?page=0&size=8&web=true&q=" + encodeURIComponent(query);
  const data = (await getJson(url)) as { data?: { content?: Array<{ entity_type?: string; search_id?: string }> } };
  const out: Hit[] = [];
  for (const item of data?.data?.content || []) {
    if ((item.entity_type === "ETF" || item.entity_type === "Scheme") && item.search_id) {
      out.push({ id: item.search_id, kind: item.entity_type });
    }
  }
  return out;
}

function empty(row: CatalogueIndex, unavailable: string, note: string | null = null): IndexBasket {
  return {
    symbol: row.symbol,
    name: row.name,
    rows: [],
    weightSum: 0,
    source: null,
    benchmark: null,
    asOf: null,
    note,
    unavailable,
  };
}

async function resolve(row: CatalogueIndex, note: string | null): Promise<IndexBasket> {
  if (row.family === "Volatility") {
    return empty(row, "India VIX measures expected volatility. It has no stock constituents.");
  }
  const spec = TRACKERS[row.symbol] || {};
  const tried = new Set<string>();
  const attempts: Array<{ id: string; kind: "ETF" | "Scheme" }> = [];
  for (const id of spec.etf || []) attempts.push({ id, kind: "ETF" });
  for (const id of spec.fund || []) attempts.push({ id, kind: "Scheme" });

  const queries =
    spec.queries && spec.queries.length
      ? spec.queries
      : attempts.length
        ? []
        : [`${row.name} etf`, `${row.name} index fund`];
  if (row.family === "Bonds" && !attempts.length && !spec.queries) {
    return empty(row, "This is a government-bond index. The equity holding file has no bond weights for it.");
  }

  const take = async (hit: { id: string; kind: "ETF" | "Scheme" }) => {
    const key = hit.kind + ":" + hit.id;
    if (tried.has(key)) return null;
    tried.add(key);
    try {
      return hit.kind === "ETF" ? await fromEtf(row, hit.id, note) : await fromFund(row, hit.id, note);
    } catch {
      return null;
    }
  };

  for (const hit of attempts) {
    const basket = await take(hit);
    if (basket) return basket;
  }
  let fetched = tried.size;
  for (const query of queries) {
    if (fetched >= 6) break;
    let hits: Hit[] = [];
    try {
      hits = await searchHits(query);
    } catch {
      continue;
    }
    for (const hit of hits) {
      if (fetched >= 6) break;
      fetched += 1;
      const basket = await take(hit);
      if (basket) return basket;
    }
  }
  if (row.family === "Bonds") {
    return empty(row, "This is a government-bond index. The equity holding file has no bond weights for it.");
  }
  const pinned = indexSnapshot(row.symbol);
  if (pinned) {
    const rows = pinned.rows.map((item) => ({ symbol: item.symbol, name: item.name, weight: item.weight, sector: null }));
    return {
      symbol: row.symbol,
      name: row.name,
      rows,
      weightSum: Math.round(weightSum(rows) * 100) / 100,
      source: pinned.source,
      benchmark: row.name,
      asOf: pinned.asOf,
      note: pinned.note,
      unavailable: null,
    };
  }
  return empty(
    row,
    "No published basket matched this index. A tracking ETF or index fund with full weights was not found, so nothing is drawn.",
  );
}

export async function loadIndexBasket(row: CatalogueIndex): Promise<IndexBasket> {
  const hit = cache.get(row.symbol);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;
  const overlay = OVERLAY[row.symbol];
  let data: IndexBasket;
  if (overlay) {
    const base = NIFTY_CATALOGUE.find((item) => item.symbol === overlay.base);
    data = base ? await loadIndexBasket(base) : empty(row, "Underlying Nifty 50 basket is not on the catalogue.");
    data = { ...data, symbol: row.symbol, name: row.name, note: overlay.note };
  } else {
    data = await resolve(row, null);
  }
  cache.set(row.symbol, { at: Date.now(), ttl: data.rows.length ? OK_TTL : MISS_TTL, data });
  return data;
}
