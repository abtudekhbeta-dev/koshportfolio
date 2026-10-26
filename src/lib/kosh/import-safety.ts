/** Import completeness, duplicate groups, same-id corrections, and a guarded undo. No prices are invented. */

import type { TradeLine } from "./types.ts";
import { tradeComposite } from "./ingest-review.ts";

export type ImportShape = "holdings-snapshot" | "tradebook" | "incremental" | "mixed" | "unknown";

export type Completeness = {
  shape: ImportShape;
  suspicious: boolean;
  warnings: string[];
};

export function assessImport(input: {
  rowsRead: number;
  accepted: number;
  ignored: number;
  holdings: number;
  trades: number;
  errors?: string[];
  sheets?: number;
  sheetsUsed?: number;
}): Completeness {
  const warnings: string[] = [];
  const rowsRead = Math.max(0, input.rowsRead);
  const accepted = Math.max(0, input.accepted);
  const ignored = Math.max(0, input.ignored);
  let shape: ImportShape = "unknown";
  if (input.holdings > 0 && input.trades > 0) shape = "mixed";
  else if (input.trades > 0 && rowsRead > input.trades && input.trades < 8) shape = "incremental";
  else if (input.trades > 0) shape = "tradebook";
  else if (input.holdings > 0) shape = "holdings-snapshot";
  if (rowsRead === 0 && accepted === 0) warnings.push("The file has no data rows. It was not treated as a complete snapshot.");
  if (rowsRead > 0 && accepted === 0 && input.holdings === 0 && input.trades === 0) {
    warnings.push("Headers were found but no holding or trade rows were accepted. Nothing will be written.");
  }
  if (rowsRead >= 8 && ignored >= 5 && ignored / rowsRead >= 0.25) {
    warnings.push(`${ignored} of ${rowsRead} rows were not accepted. Review the file before treating this as complete.`);
  }
  if ((input.sheets || 0) > 1 && (input.sheetsUsed || 0) > 0 && (input.sheetsUsed || 0) < (input.sheets || 0)) {
    warnings.push(`${(input.sheets || 0) - (input.sheetsUsed || 0)} worksheet(s) had no usable equity rows and were left out.`);
  }
  for (const error of input.errors || []) {
    if (/no ticker|could not read|unsupported/i.test(error)) warnings.push(error);
  }
  return { shape, suspicious: warnings.length > 0, warnings: warnings.slice(0, 8) };
}

export type DuplicateGroup = {
  key: string;
  reason: string;
  exact: boolean;
  rows: TradeLine[];
};

/** Same symbol and day is not enough. Exact means side, clock, quantity, and price also match, and there is no broker id. */
export function duplicateGroups(existing: TradeLine[], incoming: TradeLine[]): DuplicateGroup[] {
  const buckets = new Map<string, TradeLine[]>();
  const prior = new Map<string, number>();
  for (const row of existing || []) {
    if (String(row.id || "").trim()) continue;
    const key = tradeComposite(row);
    prior.set(key, (prior.get(key) || 0) + 1);
  }
  for (const row of incoming || []) {
    if (String(row.id || "").trim()) continue;
    if (!(row.qty > 0)) continue;
    const key = tradeComposite(row);
    const list = buckets.get(key) || [];
    list.push(row);
    buckets.set(key, list);
  }
  const groups: DuplicateGroup[] = [];
  for (const [key, rows] of buckets) {
    const copies = rows.length + (prior.get(key) || 0);
    if (copies < 2) continue;
    groups.push({
      key,
      exact: true,
      reason: prior.get(key) ? "Same symbol, side, time, quantity, and price as a line already on the path, and neither has a broker id." : "Repeated fill in this file with no broker id.",
      rows,
    });
  }
  return groups.slice(0, 12);
}

export function applyIdCorrection(existing: TradeLine[], incoming: TradeLine): { ok: true; next: TradeLine[] } | { ok: false; reason: string } {
  const id = String(incoming.id || "").trim();
  if (!id) return { ok: false, reason: "No broker id on the incoming row." };
  if (!(incoming.qty > 0) || !(incoming.price > 0) || (incoming.side !== 1 && incoming.side !== -1)) {
    return { ok: false, reason: "The incoming quantity, price, or side is not a valid fill." };
  }
  const index = (existing || []).findIndex((row) => String(row.id || "").trim() === id);
  if (index < 0) return { ok: false, reason: "That broker id is not on the path." };
  const next = existing.slice();
  const prev = existing[index]!;
  next[index] = {
    ...prev,
    symbol: incoming.symbol || prev.symbol,
    name: incoming.name || prev.name,
    qty: incoming.qty,
    price: incoming.price,
    side: incoming.side,
    date: incoming.date,
    boughtAt: incoming.boughtAt ?? prev.boughtAt,
  };
  return { ok: true, next };
}

export type ImportTouch = {
  op: "add" | "correct";
  id?: string;
  symbol: string;
  date: string | null;
  side: 1 | -1;
  qty: number;
  price: number;
  beforeQty?: number;
  beforePrice?: number;
  beforeSide?: 1 | -1;
};

function sameFill(row: TradeLine, touch: ImportTouch) {
  return row.symbol === touch.symbol && row.date === touch.date && row.side === touch.side && row.qty === touch.qty && row.price === touch.price;
}

/** Undo only rows that still match what this import wrote. A later edit is reported, not overwritten. */
export function revertTouches(trades: TradeLine[], touches: ImportTouch[]): { ok: true; next: TradeLine[] } | { ok: false; conflicts: string[] } {
  if (!touches.length) return { ok: false, conflicts: ["This import did not keep an undo list."] };
  const next = [...(trades || [])];
  const conflicts: string[] = [];
  const used = new Set<number>();
  for (const touch of [...touches].reverse()) {
    const index = next.findIndex((row, i) => {
      if (used.has(i)) return false;
      if (touch.id && String(row.id || "") === touch.id) return true;
      return !touch.id && sameFill(row, touch);
    });
    if (index < 0) {
      conflicts.push(`${touch.symbol} ${touch.date || "undated"} is no longer on the path.`);
      continue;
    }
    const row = next[index]!;
    if (touch.op === "add") {
      if (!sameFill(row, touch)) {
        conflicts.push(`${touch.symbol} changed after import (${row.qty} @ ${row.price}). It was left in place.`);
        continue;
      }
      used.add(index);
      next.splice(index, 1);
      continue;
    }
    if (row.qty !== touch.qty || row.price !== touch.price || row.side !== touch.side) {
      conflicts.push(`${touch.symbol} no longer matches the correction. It was left in place.`);
      continue;
    }
    if (touch.beforeQty == null || touch.beforePrice == null || (touch.beforeSide !== 1 && touch.beforeSide !== -1)) {
      conflicts.push(`${touch.symbol} has no stored previous values.`);
      continue;
    }
    next[index] = { ...row, qty: touch.beforeQty, price: touch.beforePrice, side: touch.beforeSide };
    used.add(index);
  }
  if (conflicts.length) return { ok: false, conflicts };
  return { ok: true, next };
}
