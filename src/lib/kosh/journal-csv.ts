/** CSV rows for the trading journal. A repeated economic key is skipped, not doubled. */

import { journalKey, type JournalTrade } from "./journal-stats.ts";

export type CsvImport = { added: JournalTrade[]; skipped: number; errors: string[] };

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function headerIndex(headers: string[], names: string[]): number {
  const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const name of names) {
    const i = norm.indexOf(name);
    if (i >= 0) return i;
  }
  return -1;
}

function num(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(/[,₹\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function when(raw: string | undefined): number | null {
  if (!raw) return null;
  const iso = Date.parse(raw);
  if (Number.isFinite(iso)) return iso;
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (!dmy) return null;
  const year = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
  const t = new Date(year, Number(dmy[2]) - 1, Number(dmy[1]), Number(dmy[4] || 0), Number(dmy[5] || 0)).getTime();
  return Number.isFinite(t) ? t : null;
}

export function parseJournalCsv(text: string, existing: JournalTrade[], now = Date.now()): CsvImport {
  const table = splitCsv(text);
  if (table.length < 2) return { added: [], skipped: 0, errors: ["The file needs a header row and at least one trade."] };
  const head = table[0];
  const col = {
    symbol: headerIndex(head, ["symbol", "tradingsymbol", "scrip"]),
    exchange: headerIndex(head, ["exchange", "exch"]),
    side: headerIndex(head, ["side", "direction", "transactiontype", "buyorsell"]),
    qty: headerIndex(head, ["qty", "quantity"]),
    entry: headerIndex(head, ["entryprice", "entry", "price", "buyprice"]),
    exit: headerIndex(head, ["exitprice", "exit", "sellprice"]),
    entryAt: headerIndex(head, ["entrydate", "entrytime", "date", "tradedate"]),
    exitAt: headerIndex(head, ["exitdate", "exittime"]),
    fees: headerIndex(head, ["fees", "brokerage", "charges"]),
    taxes: headerIndex(head, ["taxes", "tax"]),
    strategy: headerIndex(head, ["strategy", "setup"]),
    notes: headerIndex(head, ["notes", "note"]),
    stop: headerIndex(head, ["stop", "stoploss"]),
    target: headerIndex(head, ["target"]),
  };
  if (col.symbol < 0 || col.qty < 0 || col.entry < 0 || col.entryAt < 0) {
    return { added: [], skipped: 0, errors: ["Need columns for symbol, quantity, entry price, and entry date."] };
  }
  const seen = new Set(existing.map((t) => t.importKey || journalKey(t)));
  const added: JournalTrade[] = [];
  let skipped = 0;
  const errors: string[] = [];
  for (let i = 1; i < table.length; i++) {
    const line = table[i];
    const symbol = String(line[col.symbol] || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
    const qty = num(line[col.qty]);
    const entryPx = num(line[col.entry]);
    const entryAt = when(line[col.entryAt]);
    if (!symbol || !(qty && qty > 0) || !(entryPx && entryPx > 0) || !entryAt) {
      errors.push(`Row ${i + 1} is missing a symbol, quantity, price, or date.`);
      continue;
    }
    const sideRaw = (col.side >= 0 ? line[col.side] : "BUY") || "BUY";
    const direction = /sell|short/i.test(sideRaw) && !/buy/i.test(sideRaw) ? "short" : /short/i.test(sideRaw) ? "short" : "long";
    const exchRaw = (col.exchange >= 0 ? line[col.exchange] : "") || "";
    const exchange = /bse|bo/i.test(exchRaw) ? "BSE" : /nse|ns/i.test(exchRaw) || !exchRaw ? "NSE" : "";
    const draft = { symbol, exchange: exchange as JournalTrade["exchange"], direction, entryAt, entryPx, qty } as JournalTrade;
    const importKey = journalKey(draft);
    if (seen.has(importKey)) {
      skipped += 1;
      continue;
    }
    seen.add(importKey);
    const exitPx = col.exit >= 0 ? num(line[col.exit]) : null;
    const exitAt = col.exitAt >= 0 ? when(line[col.exitAt]) : null;
    added.push({
      id: `csv-${i}-${entryAt}`,
      symbol,
      exchange: draft.exchange,
      name: symbol,
      strategy: col.strategy >= 0 ? line[col.strategy] || "" : "",
      direction,
      entryAt,
      exitAt: exitPx && exitAt ? exitAt : null,
      entryPx,
      exitPx: exitPx && exitPx > 0 ? exitPx : null,
      qty,
      stop: col.stop >= 0 ? num(line[col.stop]) : null,
      target: col.target >= 0 ? num(line[col.target]) : null,
      fees: col.fees >= 0 ? num(line[col.fees]) || 0 : 0,
      taxes: col.taxes >= 0 ? num(line[col.taxes]) || 0 : 0,
      slippage: 0,
      timeframe: "",
      tags: [],
      notes: col.notes >= 0 ? line[col.notes] || "" : "",
      rules: { entry: null, stop: null, target: null },
      behaviour: [],
      group: "",
      chartRef: "",
      importKey,
      updatedAt: now,
    });
  }
  return { added, skipped, errors: errors.slice(0, 8) };
}
