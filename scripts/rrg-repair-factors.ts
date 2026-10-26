/**
 * Repair stored price factors.
 * A bonus and a face-value split named in the same action are compounded.
 * A factor whose subject says it was read off the closes is removed.
 * Nothing is inferred from the size of a gap.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { compoundFromSubject, inferredFactorSubject } from "../src/lib/kosh/rrg-adjust.ts";
import { assessSeries, type ClosePrint } from "../src/lib/kosh/rrg.ts";

type Applied = { date: string; type: string; factor: number; subject?: string };
type Series = {
  symbol: string;
  rows: ClosePrint[];
  quality?: Record<string, unknown>;
  applied?: Applied[];
  unexplained?: { date: string; change: number }[];
  unresolved?: { date: string; change: number; reason: string }[];
  meta?: { notes?: string[]; category?: string };
  [key: string]: unknown;
};

const root = join(process.cwd(), "data/rrg/store");
const changed: { symbol: string; notes: string[] }[] = [];

for (const name of readdirSync(root)) {
  if (!name.endsWith(".json.gz")) continue;
  const path = join(root, name);
  const series = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) as Series;
  const applied = series.applied || [];
  if (!applied.length) continue;
  const rows = series.rows;
  let touched = false;
  const kept: Applied[] = [];
  const unresolved: { date: string; change: number; reason: string }[] = [];
  for (const action of applied) {
    const subject = action.subject || "";
    const demerger = action.type.toLowerCase() === "demerger";
    if (demerger || inferredFactorSubject(subject)) {
      scaleBefore(rows, action.date, 1 / action.factor);
      const change = gap(rows, action.date);
      if (change != null && Math.abs(change) >= 0.4) {
        unresolved.push({
          date: action.date,
          change,
          reason: demerger ? "Demerger recorded. The close-to-close ratio was not used as a factor." : "The stored factor was taken from the price step. It was removed.",
        });
      }
      touched = true;
      continue;
    }
    const compound = compoundFromSubject(subject);
    if (compound && Math.abs(action.factor - compound.combined) > 1e-6) {
      const extra = compound.combined / action.factor;
      const before = gap(rows, action.date);
      const after = before == null ? null : (1 + before) / extra - 1;
      if (extra > 0 && extra < 1 && before != null && after != null && Math.abs(after) < Math.abs(before)) {
        scaleBefore(rows, action.date, extra);
        kept.push({ ...action, factor: compound.combined, subject: `${subject} Compounded bonus and face-value ratios.` });
        touched = true;
        continue;
      }
    }
    kept.push(action);
  }
  if (!touched) continue;
  const quality = assessSeries(rows);
  const oldNotes = series.meta?.notes || [];
  const notes = rebuildNotes(kept, unresolved, quality.jumps, oldNotes);
  series.rows = rows;
  series.applied = kept;
  series.unresolved = unresolved;
  series.unexplained = quality.jumps.slice(0, 8);
  series.quality = { ...series.quality, ...quality, adjustment: "price-return-split-bonus" };
  if (series.meta) series.meta.notes = notes;
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(series))));
  changed.push({ symbol: series.symbol, notes });
}

const registryPath = join(process.cwd(), "data/rrg/registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8")) as { items: { symbol: string; notes?: string[] }[] };
const bySymbol = new Map(changed.map((item) => [item.symbol, item.notes]));
for (const item of registry.items) {
  const notes = bySymbol.get(item.symbol);
  if (notes) item.notes = notes;
}
writeFileSync(registryPath, JSON.stringify(registry));
console.log(JSON.stringify({ repaired: changed.length, symbols: changed.map((item) => item.symbol).sort() }, null, 2));

function scaleBefore(rows: ClosePrint[], date: string, factor: number) {
  for (const row of rows) {
    if (row.date < date) row.close *= factor;
  }
}

function gap(rows: ClosePrint[], date: string) {
  const index = rows.findIndex((row) => row.date === date);
  if (index <= 0) return null;
  const prev = rows[index - 1]?.close ?? 0;
  const close = rows[index]?.close ?? 0;
  if (prev <= 0) return null;
  return close / prev - 1;
}

function rebuildNotes(
  applied: Applied[],
  unresolved: { date: string }[],
  jumps: { date: string }[],
  oldNotes: string[],
) {
  const notes: string[] = [];
  if (applied.length) notes.push(`Split and bonus factors applied on ${applied.map((item) => item.date).join(", ")}. The newest close is unchanged.`);
  if (unresolved.length) notes.push(`Unresolved corporate action on ${unresolved.map((item) => item.date).join(", ")}. No factor was applied. A close-to-close ratio is not a factor.`);
  if (jumps.length) notes.push(`${jumps.length} remaining day move over 25% was not adjusted.`);
  for (const line of oldNotes) {
    if (/dividend|more than one ISIN|Limited history|two different closes|not merged/i.test(line) && !notes.includes(line)) notes.push(line);
  }
  return notes;
}
