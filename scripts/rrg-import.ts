import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { gunzipSync } from "node:zlib";
import { importBatch, type BatchFile } from "../src/lib/kosh/rrg-import.ts";

const args = process.argv.slice(2);
const inbox = value(args, "--inbox") || "data/rrg/inbox";
const out = value(args, "--out") || "data/rrg/store";

const manifest = readManifest(join(inbox, "manifest.json"));
const files: BatchFile[] = [];
for (const name of readdirSync(inbox)) {
  if (name === "manifest.json") continue;
  const path = join(inbox, name);
  const entry = manifest.get(name);
  if (name.endsWith(".csv")) files.push(file(name, readFileSync(path, "utf8"), entry));
  else if (name.endsWith(".gz")) files.push(file(name, gunzipSync(readFileSync(path)).toString("utf8"), entry));
  else if (name.endsWith(".zip")) {
    const listing = execFileSync("unzip", ["-Z1", path], { encoding: "utf8" }).trim().split(/\r?\n/).filter((item) => item.endsWith(".csv"));
    for (const inner of listing) {
      const text = execFileSync("unzip", ["-p", path, inner], { encoding: "utf8" });
      files.push(file(`${name}:${inner}`, text, entry));
    }
  }
}
const result = importBatch(files);
mkdirSync(out, { recursive: true });
for (const series of result.series) {
  writeFileSync(join(out, `${series.symbol.replace(/\s+/g, "_")}.json`), JSON.stringify(series, null, 2));
}
const coverage = {
  generatedAt: new Date().toISOString(),
  inbox,
  note: "Closes are the values in the files you supplied. Missing sessions are not filled. No instrument is verified until you inspect these rows.",
  series: result.series.map((series) => ({
    symbol: series.symbol,
    rows: series.rows.length,
    from: series.quality.from,
    to: series.quality.to,
    spanYears: Number(series.quality.spanYears.toFixed(2)),
    limitedHistory: series.quality.limitedHistory,
    weekdayGaps: series.quality.weekdayGaps.length,
    invalidCloses: series.quality.invalidCloses,
    jumps: series.quality.jumps.length,
    layout: series.layout,
    files: [...new Set(series.sources.map((source) => source.file))],
  })),
  failures: result.failures,
};
writeFileSync(join(out, "coverage.json"), JSON.stringify(coverage, null, 2));
console.log(JSON.stringify(coverage, null, 2));
if (result.failures.length) process.exitCode = 1;

function value(list: string[], flag: string) {
  const index = list.indexOf(flag);
  return index >= 0 ? list[index + 1] : "";
}

function readManifest(path: string) {
  const map = new Map<string, { symbol?: string; sourceUrl?: string; retrievedAt?: string }>();
  try {
    const body = JSON.parse(readFileSync(path, "utf8")) as { files?: { file: string; symbol?: string; sourceUrl?: string; retrievedAt?: string }[] };
    for (const item of body.files || []) map.set(basename(item.file), item);
  } catch {
    /* A manifest is required only for index files that do not name themselves. */
  }
  return map;
}

function file(name: string, text: string, entry?: { symbol?: string; sourceUrl?: string; retrievedAt?: string }): BatchFile {
  return { name, text, symbol: entry?.symbol, sourceUrl: entry?.sourceUrl, retrievedAt: entry?.retrievedAt };
}
