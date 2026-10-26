/**
 * Publish Yahoo sector extracts into the RRG store and patch registry rows in place.
 * Does not rewrite authorised series and does not rebuild the stock registry.
 */
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { assessSeries, type ClosePrint } from "../src/lib/kosh/rrg.ts";

const extracted = "data/rrg/extracted-yahoo";
const store = "data/rrg/store";
const registryPath = "data/rrg/registry.json";
const PROTECTED = new Set(["NIFTY 50", "NIFTY BANK", "NIFTY IT", "NIFTY PHARMA", "NIFTY 100", "NIFTY 200", "NIFTY 500", "SENSEX", "NIFTY MIDCAP 50", "INDIA VIX"]);

type Extract = {
  symbol: string;
  rows: ClosePrint[];
  source: Record<string, unknown>;
  meta: { name: string; category: string; kind: string; benchmark: boolean; membership: string; returnConvention: string; exchange: string };
};

const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
  generatedAt: string;
  basis: string;
  summary: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
};

const published: string[] = [];
for (const name of readdirSync(extracted)) {
  if (!name.endsWith(".json") || name.startsWith("_")) continue;
  const raw = JSON.parse(readFileSync(join(extracted, name), "utf8")) as Extract;
  if (PROTECTED.has(raw.symbol)) {
    console.log("skip protected", raw.symbol);
    continue;
  }
  const byDate = new Map<string, number>();
  for (const row of raw.rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !(row.close > 0)) continue;
    byDate.set(row.date, row.close);
  }
  const rows = [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date));
  const quality = { ...assessSeries(rows), adjustment: "raw-unadjusted" as const };
  const limited = quality.limitedHistory;
  const notes = [
    "Price index from the Yahoo daily chart. No split or bonus factor was applied.",
    "Validated only by exact reproduction of the authorised Nifty 50, Bank, IT, and Pharma closes on the same endpoint. This symbol itself has no second authorised file in the store.",
  ];
  if (limited) notes.push("Limited history.");
  const series = {
    symbol: raw.symbol,
    rows,
    quality,
    source: raw.source,
    basis: "price-index",
    dividendTreatment: "not-adjusted",
    applied: [],
    breaks: [],
    unexplained: [],
    meta: {
      ...raw.meta,
      limited,
      rrgReady: rows.length >= 80,
      notes,
      sector: null,
      board: null,
      isin: null,
    },
  };
  writeFileSync(join(store, `${raw.symbol}.json.gz`), gzipSync(Buffer.from(JSON.stringify(series))));
  const plain = join(store, `${raw.symbol}.json`);
  if (existsSync(plain)) unlinkSync(plain);
  const status = limited ? "limited" : "imported";
  const item = registry.items.find((row) => row.symbol === raw.symbol);
  const next = {
    symbol: raw.symbol,
    name: raw.meta.name,
    category: "sector",
    sector: null,
    kind: "sector",
    benchmark: false,
    limited,
    status,
    from: quality.from,
    to: quality.to,
    rows: rows.length,
    rrgReady: rows.length >= 80,
    exchange: "NSE",
    board: null,
    isin: null,
    basis: "price-index",
    notes,
  };
  if (item) Object.assign(item, next);
  else registry.items.push(next);
  published.push(`${raw.symbol} ${quality.from} ${quality.to} ${rows.length} ${status}`);
}

const GAP =
  "Official Nifty sectoral index. No daily history is stored. On 24 Oct 2026 the Yahoo chart for this name returned a last price or no symbol, not a daily series. NSE index files returned 403. A GPL-3 parquet, where one exists, was not imported and no other index was substituted.";

const gaps = [
  "NIFTY MEDIA",
  "NIFTY PRIVATE BANK",
  "NIFTY FINANCIAL SERVICES 25 50",
  "NIFTY HEALTHCARE INDEX",
  "NIFTY OIL GAS",
  "NIFTY CONSUMER DURABLES",
  "NIFTY CEMENT",
  "NIFTY CHEMICALS",
  "NIFTY CAPITAL GOODS",
  "NIFTY POWER",
  "NIFTY NBFC",
  "NIFTY INSURANCE",
  "NIFTY HOSPITALS",
  "NIFTY HOUSING FINANCE",
  "NIFTY RETAIL",
  "NIFTY CONSTRUCTION",
  "NIFTY TELECOMMUNICATIONS",
  "NIFTY CONSUMER SERVICES",
  "NIFTY COMMERCIAL TRANSPORT SERVICES",
  "NIFTY FINANCIAL SERVICES EX BANK",
  "NIFTY MIDSMALL FINANCIAL SERVICES",
  "NIFTY MIDSMALL HEALTHCARE",
  "NIFTY MIDSMALL IT TELECOM",
  "NIFTY500 HEALTHCARE",
  "NIFTY REITS REALTY",
];
for (const symbol of gaps) {
  const item = registry.items.find((row) => row.symbol === symbol);
  if (!item || item.status === "imported" || item.status === "limited") continue;
  item.status = "unavailable";
  item.category = "sector";
  item.notes = [GAP];
}

function count(items: Array<Record<string, unknown>>, pick: (item: Record<string, unknown>) => string) {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = pick(item) || "unknown";
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}
const items = registry.items;
registry.generatedAt = new Date().toISOString();
registry.summary = {
  discoverable: items.length,
  stored: items.filter((item) => Number(item.rows) > 0).length,
  rrgReady: items.filter((item) => item.rrgReady === true || Number(item.rows) >= 80).length,
  fresh: items.filter((item) => typeof item.to === "string" && item.to >= "2026-09-01").length,
  unavailable: items.filter((item) => ["unavailable", "licence-blocked", "rejected", "quarantine"].includes(String(item.status))).length,
  byStatus: count(items, (item) => String(item.status)),
  byCategory: count(items, (item) => String(item.category)),
  byExchange: count(items, (item) => String(item.exchange || "unspecified")),
};
writeFileSync(registryPath, JSON.stringify(registry));
console.log(published.join("\n"));
console.log("summary", JSON.stringify(registry.summary));
