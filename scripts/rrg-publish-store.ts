import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { adjustPriceReturn, repeatAdjustment, type CorporateAction } from "../src/lib/kosh/rrg-adjust.ts";
import { assessSeries, type ClosePrint } from "../src/lib/kosh/rrg.ts";

type Extract = {
  symbol: string;
  rows: ClosePrint[];
  actions?: CorporateAction[];
  breaks?: { date: string; reason: string }[];
  meta?: {
    name?: string;
    category?: string;
    sector?: string | null;
    kind?: string;
    benchmark?: boolean;
    limited?: boolean;
    membership?: string;
    returnConvention?: string;
    nonEqDates?: number;
    exchange?: string;
    board?: string;
    isin?: string | string[];
    conflictDatesDropped?: number;
    source?: {
      dataset: string;
      url: string;
      licence: string;
      adjustment: "raw-unadjusted";
      files: { name: string; sha256: string }[];
      note: string;
      closeField?: string;
    };
  };
  source?: Extract["meta"] extends infer _ ? NonNullable<Extract["meta"]>["source"] : never;
};

const extracted = process.argv[2] || "data/rrg/extracted";
const out = process.argv[3] || "data/rrg/store";
mkdirSync(out, { recursive: true });
const files = readdirSync(extracted).filter((name) => name.endsWith(".json"));
const entries = [];
const failures: { symbol: string; error: string }[] = [];
for (const name of files) {
  const raw = JSON.parse(readFileSync(join(extracted, name), "utf8")) as Extract;
  const source = raw.meta?.source || raw.source;
  if (!source || !raw.rows?.length) {
    failures.push({ symbol: raw.symbol || name, error: "Extract has no rows or source." });
    continue;
  }
  if (repeatAdjustment(source.adjustment)) {
    failures.push({ symbol: raw.symbol || name, error: `Refusing to adjust an extract already marked ${source.adjustment}.` });
    continue;
  }
  const adjusted = adjustPriceReturn(raw.rows, raw.actions || [], raw.breaks || []);
  if (adjusted.rows.length < 30) {
    failures.push({ symbol: raw.symbol, error: "Fewer than 30 closes remain after the verified break." });
    continue;
  }
  const byDate = new Map<string, number>();
  let conflict = "";
  for (const row of adjusted.rows) {
    const prior = byDate.get(row.date);
    if (prior != null && Math.abs(prior - row.close) > 1e-6) conflict = `Two closes on ${row.date}.`;
    else byDate.set(row.date, row.close);
  }
  if (conflict) {
    failures.push({ symbol: raw.symbol, error: conflict });
    continue;
  }
  const rows = [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date));
  const quality = { ...assessSeries(rows), adjustment: adjusted.basis };
  const notes = [];
  if (adjusted.applied.length) notes.push(`Price factors applied on ${adjusted.applied.map((item) => item.date).join(", ")}. The newest close is unchanged.`);
  else if ((raw.meta?.category || "stock") === "stock") notes.push("No verified split or bonus in the action file. Closes are the raw bhavcopy.");
  if (adjusted.breaks.length) notes.push(adjusted.breaks.map((item) => item.reason).join(" "));
  const unfactored = adjusted.flagged.filter((item) => !adjusted.applied.some((applied) => applied.date === item.date && applied.type.toLowerCase() === item.type.toLowerCase()));
  if (unfactored.length) notes.push(`Demerger or rights on ${unfactored.map((item) => item.date).join(", ")}. No factor was applied.`);
  if (adjusted.unexplained.length) notes.push(`${adjusted.unexplained.length} remaining day move over 25% was not adjusted.`);
  if (adjusted.dividendsIgnored) notes.push("Cash dividends are not in this price-return series.");
  if (raw.meta?.limited || quality.limitedHistory) notes.push("Limited history.");
  if (raw.meta?.conflictDatesDropped) notes.push(`${raw.meta.conflictDatesDropped} dates with two different closes were left out.`);
  if (Array.isArray(raw.meta?.isin) && raw.meta.isin.length > 1) notes.push("This symbol has more than one ISIN in the bhavcopy. It was not merged with another symbol.");
  const series = {
    symbol: raw.symbol,
    rows,
    quality,
    source,
    basis: adjusted.basis,
    dividendTreatment: "not-adjusted",
    applied: adjusted.applied,
    breaks: adjusted.breaks,
    unexplained: adjusted.unexplained.slice(0, 8),
    meta: {
      name: raw.meta?.name || raw.symbol,
      category: raw.meta?.category || "stock",
      sector: raw.meta?.sector || null,
      kind: raw.meta?.kind || "stock",
      benchmark: raw.meta?.benchmark === true,
      limited: raw.meta?.limited === true || quality.limitedHistory,
      membership: raw.meta?.membership || "",
      returnConvention: raw.meta?.category === "stock" ? adjusted.basis : "price-index",
      exchange: raw.meta?.exchange || (raw.symbol === "SENSEX" ? "BSE" : "NSE"),
      board: raw.meta?.board || null,
      isin: raw.meta?.isin || null,
      rrgReady: rows.length >= 80,
      notes,
    },
  };
  const body = JSON.stringify(series);
  writeFileSync(join(out, `${raw.symbol}.json.gz`), gzipSync(Buffer.from(body)));
  const plain = join(out, `${raw.symbol}.json`);
  if (existsSync(plain)) unlinkSync(plain);
  entries.push({ symbol: series.symbol, quality: series.quality, meta: series.meta, basis: series.basis, rowCount: series.rows.length });
}

const benchEnd = entries.find((item) => item.symbol === "NIFTY 50")?.quality.to || null;
const quarantine = existsSync("data/rrg/quarantine.json") ? JSON.parse(readFileSync("data/rrg/quarantine.json", "utf8")) : { quarantine: [], unavailable: [], blocked: [] };
const registry = [
  ...entries.map((item) => ({
    symbol: item.symbol,
    name: item.meta.name,
    category: item.meta.category,
    sector: item.meta.sector,
    kind: item.meta.kind,
    benchmark: item.meta.benchmark,
    limited: item.meta.limited,
    status: benchEnd && item.quality.to && item.quality.to < "2026-09-01" && item.meta.category === "stock" ? "stale" : item.meta.limited ? "limited" : "imported",
    from: item.quality.from,
    to: item.quality.to,
    rows: item.rowCount,
    rrgReady: item.meta.rrgReady,
    exchange: item.meta.exchange,
    board: item.meta.board,
    isin: item.meta.isin,
    basis: item.basis,
    notes: item.meta.notes,
  })),
  ...[...(quarantine.quarantine || []), ...(quarantine.unavailable || [])].map((item) => ({
    symbol: item.symbol,
    name: item.name,
    category: item.category,
    sector: item.sector || null,
    exchange: item.exchange || null,
    kind: item.category,
    benchmark: false,
    limited: false,
    status: item.status,
    from: null,
    to: null,
    rows: 0,
    basis: null,
    notes: [item.reason],
  })),
  ...(quarantine.blocked || []).map((item: { symbol: string; name: string; category: string; status: string; reason: string }) => ({
    symbol: item.symbol,
    name: item.name,
    category: item.category,
    sector: null,
    kind: "sector",
    benchmark: false,
    limited: false,
    status: item.status,
    from: null,
    to: null,
    rows: 0,
    basis: null,
    notes: [item.reason],
  })),
];
const summary = summarise(registry);
writeFileSync("data/rrg/registry.json", JSON.stringify({ generatedAt: new Date().toISOString(), basis: "price-return-split-bonus", summary, items: registry }));
const coverage = {
  generatedAt: new Date().toISOString(),
  adjustment: "price-return-split-bonus",
  dividendTreatment: "not-adjusted",
  stocks: "tejhq/indian-markets",
  indices: {
    imported: entries.filter((item) => item.meta.category === "sector").map((item) => item.symbol),
    dataset: "aswinv90/indian-market-historical-data",
    permission: "Author told the Kosh owner on 24 Oct 2026 that this project may use the data. The repository licence still requires written authorisation for commercial use; that written grant is not stored here.",
    closeField: "Close",
  },
  counts: summary,
  failures,
};
writeFileSync(join(out, "coverage.json"), JSON.stringify(coverage, null, 2));
console.log(JSON.stringify({ summary, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;

function summarise(items: { status: string; category: string; exchange?: string | null; to?: string | null; rrgReady?: boolean; rows: number }[]) {
  const count = (pick: (item: (typeof items)[number]) => string) => {
    const out: Record<string, number> = {};
    for (const item of items) {
      const key = pick(item) || "unknown";
      out[key] = (out[key] || 0) + 1;
    }
    return out;
  };
  return {
    discoverable: items.length,
    stored: items.filter((item) => item.rows > 0).length,
    rrgReady: items.filter((item) => item.rrgReady || item.rows >= 80).length,
    fresh: items.filter((item) => item.to && item.to >= "2026-09-01").length,
    unavailable: items.filter((item) => item.status === "unavailable" || item.status === "licence-blocked" || item.status === "rejected" || item.status === "quarantine").length,
    byStatus: count((item) => item.status),
    byCategory: count((item) => item.category),
    byExchange: count((item) => item.exchange || "unspecified"),
  };
}
