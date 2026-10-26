/** Current sector membership. Live basket when the feed answers, otherwise the last snapshot. */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadIndexBasket } from "./index-basket.server.ts";
import { NIFTY_CATALOGUE } from "./nifty-catalogue.ts";
import { annotateMembers, OFFICIAL_SECTORS } from "./rrg-sectors.ts";
import { loadRegistry, rrgDataDir } from "./rrg-read.server.ts";

export type MemberRow = { symbol: string | null; name: string; weight: number | null };

type SnapshotItem = {
  catalogueSymbol: string;
  name: string;
  source: string | null;
  benchmark: string | null;
  asOf: string | null;
  note: string | null;
  weightSum: number;
  rows: MemberRow[];
};

let snapshotCache: { at: number; items: SnapshotItem[] } | null = null;

function readSnapshot(): SnapshotItem[] {
  if (snapshotCache && Date.now() - snapshotCache.at < 60_000) return snapshotCache.items;
  const path = join(rrgDataDir(), "constituents.json");
  if (!existsSync(path)) {
    snapshotCache = { at: Date.now(), items: [] };
    return [];
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { items?: SnapshotItem[] };
  snapshotCache = { at: Date.now(), items: parsed.items || [] };
  return snapshotCache.items;
}

export async function sectorMembers(registrySymbol: string) {
  const sector = OFFICIAL_SECTORS.find((row) => row.registrySymbol === registrySymbol);
  if (!sector) return { unavailable: "That name is not an official sector on this board." };
  if (sector.klass !== "sectoral") {
    return { unavailable: `${sector.name} is thematic. It is not offered as a sector constituent list.` };
  }
  const stored = new Set(
    loadRegistry()
      .filter((row) => row.category === "stock" && (row.status === "imported" || row.status === "limited" || row.status === "stale"))
      .map((row) => row.symbol),
  );
  const snap = sector.catalogueSymbol ? readSnapshot().find((row) => row.catalogueSymbol === sector.catalogueSymbol) : undefined;
  let source = snap?.source || null;
  let asOf = snap?.asOf || null;
  let benchmark = snap?.benchmark || null;
  let note = snap?.note || null;
  let rows = snap?.rows || [];
  let feed = snap?.rows.length ? "snapshot" : "none";
  const catalogue = sector.catalogueSymbol ? NIFTY_CATALOGUE.find((row) => row.symbol === sector.catalogueSymbol) : undefined;
  if (!rows.length && catalogue) {
    try {
      const live = await loadIndexBasket(catalogue);
      if (live.rows.length) {
        source = live.source;
        asOf = live.asOf;
        benchmark = live.benchmark;
        note = live.note;
        rows = live.rows;
        feed = "live";
      }
    } catch {
      feed = "none";
    }
  }
  const annotated = annotateMembers(rows, stored);
  const unavailable = annotated.rows.length
    ? null
    : catalogue
      ? "No current constituent basket is stored for this index, and the holdings feed did not answer."
      : "No tracking-fund or weight file is linked to this index. Nothing is invented from an industry tag.";
  return {
    registrySymbol: sector.registrySymbol,
    name: sector.name,
    catalogueSymbol: sector.catalogueSymbol,
    membership: "current" as const,
    label: "Current constituents — historical price rotation",
    source,
    asOf,
    benchmark,
    note,
    feed,
    refreshedAt: snap ? "2026-10-24" : null,
    rows: annotated.rows,
    counts: {
      members: annotated.rows.length,
      stored: annotated.stored,
      missing: annotated.missing,
      unnamed: annotated.unnamed,
      duplicates: annotated.duplicates,
    },
    unavailable,
  };
}
