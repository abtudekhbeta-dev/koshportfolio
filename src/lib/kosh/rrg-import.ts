import { createHash } from "node:crypto";
import { assessSeries, type ClosePrint, type SeriesQuality } from "./rrg.ts";

export const PARSER_VERSION = "kosh-official-csv-v1";

export type InstrumentRecord = {
  exchange: "NSE";
  symbol: string;
  name: string;
  kind: "index" | "equity";
  sector: string | null;
  active: boolean;
  listedOn: string | null;
  symbolChanges: { from: string; to: string; on: string }[];
  /** No historical membership file was obtained. Current names must not be called point-in-time. */
  membership: "not-point-in-time";
};

export type IngestLog = {
  file: string;
  url: string | null;
  retrievedAt: string;
  parser: string;
  from: string | null;
  to: string | null;
  rows: number;
  checksum: string;
  errors: string[];
};

export type IngestResult =
  | { ok: true; rows: ClosePrint[]; quality: SeriesQuality; log: IngestLog; layout: string }
  | { ok: false; error: string; log: IngestLog };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function toIso(raw: string): string | null {
  const text = raw.trim().replace(/"/g, "");
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  let match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  match = text.match(/^(\d{1,2})[/-]([A-Za-z]{3})[/-](\d{4})$/);
  if (!match) match = text.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2].toLowerCase());
  if (month < 0) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function splitCsv(line: string) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function headerIndex(header: string[], names: string[]) {
  const lower = header.map((cell) => cell.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return names.map((name) => lower.indexOf(name.toLowerCase().replace(/[^a-z0-9]/g, "")));
}

function looksLike(header: string[], names: string[]) {
  return headerIndex(header, names).every((index) => index >= 0);
}

export type ParsedGroup = { symbol: string | null; rows: ClosePrint[] };

function recognised(header: string[]) {
  return (
    (looksLike(header, ["symbol", "series", "close", "timestamp"]) && !looksLike(header, ["closeprice"])) ||
    looksLike(header, ["tckrsymb", "sctysrs", "clspric", "tradtd"]) ||
    looksLike(header, ["symbol", "series", "date", "closeprice"]) ||
    looksLike(header, ["indexname", "date", "close"]) ||
    (looksLike(header, ["date", "close"]) && !header.some((cell) => /symbol|tckrsymb/i.test(cell)))
  );
}

/** Official NSE cash bhavcopy, security-wise price file, or Nifty Indices historical CSV. Unknown layouts are rejected. */
export function parseOfficialCsv(text: string, symbol?: string): { rows: ClosePrint[]; layout: string; groups: ParsedGroup[] } | { error: string } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (/<html|access denied/i.test(text)) return { error: "The download is an access page, not a price file." };
  if (lines.length < 2) return { error: "The file has no data rows." };
  let header = splitCsv(lines[0]);
  let start = 1;
  if (!recognised(header) && lines.length >= 3 && recognised(splitCsv(lines[1]))) {
    header = splitCsv(lines[1]);
    start = 2;
  }
  if (!recognised(header)) return { error: "The header is not an NSE bhavcopy, a security-wise price file, or a Nifty Indices historical file." };
  const body = lines.slice(start).map(splitCsv);
  const bhav = headerIndex(header, ["symbol", "series", "close", "timestamp"]);
  const udiff = headerIndex(header, ["tckrsymb", "sctysrs", "clspric", "tradtd"]);
  const security = headerIndex(header, ["symbol", "series", "date", "closeprice"]);
  const indexName = headerIndex(header, ["indexname", "date", "close"]);
  const index = headerIndex(header, ["date", "close"]);
  const groups = new Map<string, ClosePrint[]>();
  const push = (key: string, date: string | null, close: number) => {
    if (!date || !Number.isFinite(close)) return;
    const list = groups.get(key) || [];
    list.push({ date, close });
    groups.set(key, list);
  };
  let layout = "";
  if (bhav.every((i) => i >= 0) && headerIndex(header, ["closeprice"])[0] < 0) {
    layout = "nse-cm-bhavcopy";
    for (const cell of body) {
      if (cell[bhav[1]] && cell[bhav[1]] !== "EQ") continue;
      if (symbol && cell[bhav[0]] !== symbol) continue;
      push(cell[bhav[0]] || symbol || "", toIso(cell[bhav[3]]), Number(cell[bhav[2]]));
    }
  } else if (udiff.every((i) => i >= 0)) {
    layout = "nse-udiff-bhavcopy";
    for (const cell of body) {
      if (cell[udiff[1]] && cell[udiff[1]] !== "EQ") continue;
      if (symbol && cell[udiff[0]] !== symbol) continue;
      push(cell[udiff[0]] || symbol || "", toIso(cell[udiff[3]]), Number(cell[udiff[2]]));
    }
  } else if (security.every((i) => i >= 0)) {
    layout = "nse-security-wise";
    for (const cell of body) {
      if (cell[security[1]] && cell[security[1]] !== "EQ") continue;
      if (symbol && cell[security[0]] !== symbol) continue;
      push(cell[security[0]] || symbol || "", toIso(cell[security[2]]), Number(cell[security[3]]));
    }
  } else if (indexName.every((i) => i >= 0)) {
    layout = "nifty-indices-historical";
    for (const cell of body) {
      const name = cell[indexName[0]];
      if (symbol && name !== symbol) continue;
      push(name, toIso(cell[indexName[1]]), Number(cell[indexName[2]]));
    }
  } else if (index.every((i) => i >= 0)) {
    layout = "nifty-indices-historical";
    for (const cell of body) push(symbol || "", toIso(cell[index[0]]), Number(cell[index[1]]));
  }
  const parsed = [...groups.entries()].map(([key, rows]) => ({ symbol: key || null, rows }));
  const rows = symbol ? parsed.find((group) => group.symbol === symbol)?.rows || [] : parsed[0]?.rows || [];
  return { rows, layout, groups: parsed };
}

export function ingestOfficialCsv(input: { text: string; file: string; url?: string | null; symbol?: string; retrievedAt?: string; holidays?: string[] }): IngestResult {
  const retrievedAt = input.retrievedAt || new Date().toISOString();
  const checksum = createHash("sha256").update(input.text).digest("hex");
  const base = { file: input.file, url: input.url ?? null, retrievedAt, parser: PARSER_VERSION, checksum };
  const parsed = parseOfficialCsv(input.text, input.symbol);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error, log: { ...base, from: null, to: null, rows: 0, errors: [parsed.error] } };
  }
  const quality = assessSeries(parsed.rows, input.holidays || []);
  const errors: string[] = [];
  if (quality.duplicateDates.length) errors.push(`Duplicate dates: ${quality.duplicateDates.join(", ")}`);
  if (quality.invalidCloses) errors.push(`${quality.invalidCloses} invalid closes`);
  if (!parsed.rows.length) errors.push("No rows for this symbol.");
  if (errors.length) {
    return { ok: false, error: errors[0], log: { ...base, from: quality.from, to: quality.to, rows: parsed.rows.length, errors } };
  }
  return { ok: true, rows: parsed.rows, quality, layout: parsed.layout, log: { ...base, from: quality.from, to: quality.to, rows: parsed.rows.length, errors } };
}

export type BatchFile = { name: string; text: string; symbol?: string; sourceUrl?: string | null; retrievedAt?: string };

export type StoredSeries = {
  symbol: string;
  rows: ClosePrint[];
  quality: SeriesQuality;
  layout: string;
  sources: IngestLog[];
};

export type BatchResult = {
  series: StoredSeries[];
  failures: { file: string; symbol: string | null; error: string }[];
};

/** Merge official files. The same date with two different closes is a failure. Gaps are left empty. */
export function importBatch(files: BatchFile[], holidays: string[] = []): BatchResult {
  const bucket = new Map<string, { rows: ClosePrint[]; layout: string; sources: IngestLog[] }>();
  const failures: BatchResult["failures"] = [];
  for (const file of files) {
    const retrievedAt = file.retrievedAt || new Date().toISOString();
    const checksum = createHash("sha256").update(file.text).digest("hex");
    const parsed = parseOfficialCsv(file.text);
    if ("error" in parsed) {
      failures.push({ file: file.name, symbol: file.symbol || null, error: parsed.error });
      continue;
    }
    if (!parsed.groups.length) {
      failures.push({ file: file.name, symbol: file.symbol || null, error: "No rows for this symbol." });
      continue;
    }
    for (const group of parsed.groups) {
      if (group.symbol && file.symbol && group.symbol !== file.symbol) continue;
      const symbol = group.symbol || file.symbol || "";
      if (!symbol) {
        failures.push({ file: file.name, symbol: null, error: "This index file has no index name. Set symbol in the manifest." });
        continue;
      }
      const log: IngestLog = {
        file: file.name,
        url: file.sourceUrl ?? null,
        retrievedAt,
        parser: PARSER_VERSION,
        from: group.rows[0]?.date || null,
        to: group.rows[group.rows.length - 1]?.date || null,
        rows: group.rows.length,
        checksum,
        errors: [],
      };
      const current = bucket.get(symbol) || { rows: [], layout: parsed.layout, sources: [] };
      current.rows.push(...group.rows);
      current.sources.push(log);
      if (current.layout !== parsed.layout) current.layout = `${current.layout}+${parsed.layout}`;
      bucket.set(symbol, current);
    }
  }
  const series: StoredSeries[] = [];
  for (const [symbol, item] of bucket) {
    const byDate = new Map<string, number>();
    let conflict = "";
    for (const row of item.rows) {
      const prior = byDate.get(row.date);
      if (prior != null && Math.abs(prior - row.close) > 1e-6) conflict = `${symbol} has two closes on ${row.date}: ${prior} and ${row.close}.`;
      else byDate.set(row.date, row.close);
    }
    if (conflict) {
      failures.push({ file: item.sources.map((source) => source.file).join(", "), symbol, error: conflict });
      continue;
    }
    const rows = [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date));
    series.push({ symbol, rows, quality: assessSeries(rows, holidays), layout: item.layout, sources: item.sources });
  }
  series.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return { series, failures };
}

export const PILOT_SYMBOLS = ["NIFTY 50", "NIFTY BANK", "NIFTY IT", "RELIANCE", "HDFCBANK", "ICICIBANK", "INFY"] as const;

export const SECTOR_UNIVERSE: InstrumentRecord[] = [
  { exchange: "NSE", symbol: "NIFTY 50", name: "Nifty 50", kind: "index", sector: null, active: true, listedOn: null, symbolChanges: [], membership: "not-point-in-time" },
  { exchange: "NSE", symbol: "NIFTY BANK", name: "Nifty Bank", kind: "index", sector: "Bank", active: true, listedOn: null, symbolChanges: [], membership: "not-point-in-time" },
  { exchange: "NSE", symbol: "NIFTY IT", name: "Nifty IT", kind: "index", sector: "IT", active: true, listedOn: null, symbolChanges: [], membership: "not-point-in-time" },
];
