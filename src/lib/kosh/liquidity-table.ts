/** Result-table sort and filters. Does not change a signal. */

import type { LiqEvent } from "./liquidity";
import { capBand, type CapBand } from "./liquidity-book.ts";

export type TableHit = LiqEvent & {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  mcapCr?: number | null;
  mcapAsOf?: number | null;
};

export type SortKey =
  | "rank"
  | "name"
  | "exchange"
  | "mcap"
  | "score"
  | "tier"
  | "pattern"
  | "direction"
  | "price"
  | "level"
  | "distance"
  | "depth"
  | "reclaim"
  | "volume"
  | "touches"
  | "date"
  | "follow";

export type SortDir = "asc" | "desc";

export type ColumnId = SortKey | "status" | "actions";

export const DEFAULT_COLUMNS: ColumnId[] = ["name", "direction", "level", "depth", "reclaim", "follow", "volume", "date", "status", "score", "actions"];

export const COLUMN_LABEL: Record<ColumnId, string> = {
  rank: "Rank",
  name: "Stock",
  exchange: "Exchange",
  mcap: "Mcap ₹ Cr",
  score: "Score",
  tier: "Strength",
  pattern: "Pattern",
  direction: "Side",
  price: "Price",
  level: "Level",
  distance: "From level",
  depth: "Sweep",
  reclaim: "Closed back",
  volume: "Volume",
  touches: "Touches",
  date: "Date",
  follow: "Follow-through",
  status: "Status",
  actions: "",
};

export const NUMERIC_COLUMNS = new Set<ColumnId>(["mcap", "score", "price", "level", "distance", "depth", "reclaim", "volume", "touches", "date"]);

export type HitFilter = {
  query: string;
  pattern: "sweep" | "failed" | "all";
  direction: "bull" | "bear" | "both";
  exchange: "NSE" | "BSE" | "all";
  tier: "strong" | "potential" | "developing" | "all";
  follow: "yes" | "no" | "all";
  reclaim: "all" | "same" | "one" | "two" | "three" | "later";
  swing: "both" | "single" | "equal";
  minScore: number;
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  cap: CapBand | "all";
  weak: boolean;
  lifecycle: "all" | "developing" | "confirmed" | "follow" | "potential";
};

export const OPEN_FILTER: HitFilter = {
  query: "",
  pattern: "all",
  direction: "both",
  exchange: "all",
  tier: "all",
  follow: "all",
  reclaim: "all",
  swing: "both",
  minScore: 0,
  minPrice: null,
  maxPrice: null,
  minVolume: null,
  cap: "all",
  weak: false,
  lifecycle: "all",
};

export function hitPrice(hit: TableHit): number | null {
  if (hit.reclaimClose != null && Number.isFinite(hit.reclaimClose)) return hit.reclaimClose;
  return null;
}

/** How far the reclaim close sits through the level. Not a live quote. */
export function distancePct(hit: TableHit): number | null {
  const px = hitPrice(hit);
  if (px == null || !(hit.level > 0)) return null;
  const raw = hit.direction === "bull" ? (px - hit.level) / hit.level : (hit.level - px) / hit.level;
  return raw * 100;
}

export function sortValue(hit: TableHit, key: SortKey): string | number | null {
  if (key === "rank") {
    const tier = hit.tier === "strong" ? 2 : hit.tier === "potential" ? 1 : 0;
    return tier * 1000 + hit.score;
  }
  if (key === "name") return `${hit.symbol} ${hit.name}`.toLowerCase();
  if (key === "exchange") return hit.exchange;
  if (key === "mcap") return hit.mcapCr != null && hit.mcapCr > 0 ? hit.mcapCr : null;
  if (key === "score") return hit.score;
  if (key === "tier") return hit.tier === "strong" ? 2 : hit.tier === "potential" ? 1 : 0;
  if (key === "pattern") return hit.pattern;
  if (key === "direction") return hit.direction;
  if (key === "price") return hitPrice(hit);
  if (key === "level") return hit.level;
  if (key === "distance") return distancePct(hit);
  if (key === "depth") return hit.depthPct;
  if (key === "reclaim") return hit.parts.reclaim;
  if (key === "volume") return hit.volumeTrust === "neutral" ? null : hit.volumeRatio;
  if (key === "touches") return hit.touches;
  if (key === "date") return hit.sweepT;
  if (key === "follow") return hit.followThrough ? 1 : 0;
  return null;
}

function missing(value: string | number | null): boolean {
  return value == null || value === "" || (typeof value === "number" && !Number.isFinite(value));
}

/** Nulls stay at the bottom in both directions. Equal values keep their original order. */
export function sortHits(rows: TableHit[], key: SortKey, dir: SortDir): TableHit[] {
  const sign = dir === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: sortValue(row, key) }))
    .sort((a, b) => {
      const am = missing(a.value);
      const bm = missing(b.value);
      if (am && bm) return a.index - b.index;
      if (am) return 1;
      if (bm) return -1;
      if (typeof a.value === "number" && typeof b.value === "number") {
        if (a.value === b.value) return a.index - b.index;
        return a.value < b.value ? -sign : sign;
      }
      const cmp = String(a.value).localeCompare(String(b.value));
      return cmp === 0 ? a.index - b.index : cmp * sign;
    })
    .map((item) => item.row);
}

export function hitMatches(hit: TableHit, filter: HitFilter): boolean {
  if (filter.pattern !== "all" && hit.pattern !== filter.pattern) return false;
  if (filter.direction !== "both" && hit.direction !== filter.direction) return false;
  if (filter.exchange !== "all" && hit.exchange !== filter.exchange) return false;
  if (filter.tier !== "all" && hit.tier !== filter.tier) return false;
  if (filter.follow === "yes" && !hit.followThrough) return false;
  if (filter.follow === "no" && hit.followThrough) return false;
  if (filter.reclaim !== "all" && hit.reclaimKind !== filter.reclaim) return false;
  if (filter.swing === "equal" && !hit.repeated) return false;
  if (filter.swing === "single" && hit.repeated) return false;
  if (hit.score < filter.minScore) return false;
  if (hit.lowQuality && !filter.weak) return false;
  const px = hitPrice(hit);
  if (filter.minPrice != null && filter.minPrice > 0 && px != null && px < filter.minPrice && hit.level < filter.minPrice) return false;
  if (filter.maxPrice != null && filter.maxPrice > 0 && px != null && px > filter.maxPrice) return false;
  if (filter.minVolume != null && (hit.volumeRatio == null || hit.volumeTrust === "neutral" || hit.volumeRatio < filter.minVolume)) return false;
  if (filter.cap !== "all") {
    const band = capBand(hit.mcapCr);
    if (band !== filter.cap) return false;
  }
  if (filter.lifecycle === "developing" && hit.status !== "developing") return false;
  if (filter.lifecycle === "confirmed" && !(hit.status === "confirmed" && hit.reclaimClosed)) return false;
  if (filter.lifecycle === "follow" && !hit.followThrough) return false;
  if (filter.lifecycle === "potential" && hit.tier !== "potential") return false;
  const needle = filter.query.trim().toLowerCase();
  if (needle && !hit.symbol.toLowerCase().includes(needle) && !hit.name.toLowerCase().includes(needle)) return false;
  return true;
}

export function filterHits(rows: TableHit[], filter: HitFilter): TableHit[] {
  return rows.filter((hit) => hitMatches(hit, filter));
}

/** Result filters only. The screener tab is not counted, so a clear state can reach zero. */
export function activeFilterCount(filter: HitFilter): number {
  let n = 0;
  if (filter.query.trim()) n += 1;
  if (filter.direction !== "both") n += 1;
  if (filter.exchange !== "all") n += 1;
  if (filter.tier !== "all") n += 1;
  if (filter.follow !== "all") n += 1;
  if (filter.reclaim !== "all") n += 1;
  if (filter.swing !== "both") n += 1;
  if (filter.minScore > 0) n += 1;
  if (filter.minPrice != null && filter.minPrice > 0) n += 1;
  if (filter.maxPrice != null && filter.maxPrice > 0) n += 1;
  if (filter.minVolume != null) n += 1;
  if (filter.cap !== "all") n += 1;
  if (filter.weak) n += 1;
  if (filter.lifecycle !== "all") n += 1;
  return n;
}

export function columnFilterActive(id: ColumnId, filter: HitFilter): boolean {
  if (id === "exchange") return filter.exchange !== "all";
  if (id === "direction") return filter.direction !== "both";
  if (id === "tier") return filter.tier !== "all";
  if (id === "follow") return filter.follow !== "all";
  if (id === "reclaim") return filter.reclaim !== "all";
  if (id === "mcap") return filter.cap !== "all";
  if (id === "score") return filter.minScore > 0;
  if (id === "price") return (filter.minPrice != null && filter.minPrice > 0) || (filter.maxPrice != null && filter.maxPrice > 0);
  if (id === "status") return filter.lifecycle !== "all";
  return false;
}

export function describeFilters(filter: HitFilter): string[] {
  const out: string[] = [];
  if (filter.query.trim()) out.push(`“${filter.query.trim()}”`);
  if (filter.exchange !== "all") out.push(filter.exchange);
  if (filter.direction === "bull") out.push("Bullish");
  if (filter.direction === "bear") out.push("Bearish");
  if (filter.tier === "strong") out.push("Strong");
  if (filter.tier === "potential") out.push("Potential");
  if (filter.tier === "developing") out.push("Developing");
  if (filter.follow === "yes") out.push("Follow-through");
  if (filter.follow === "no") out.push("No follow-through");
  if (filter.reclaim !== "all") out.push(`Close back: ${filter.reclaim}`);
  if (filter.swing === "single") out.push("Individual swing");
  if (filter.swing === "equal") out.push("Repeated swing");
  if (filter.minScore > 0) out.push(`Score ≥ ${filter.minScore}`);
  if (filter.minPrice != null && filter.minPrice > 0) out.push(`Price ≥ ${filter.minPrice}`);
  if (filter.maxPrice != null && filter.maxPrice > 0) out.push(`Price ≤ ${filter.maxPrice}`);
  if (filter.minVolume != null) out.push(`Volume ≥ ${filter.minVolume}×`);
  if (filter.cap !== "all") out.push(`${filter.cap} cap`);
  if (filter.weak) out.push("Scores under 55");
  if (filter.lifecycle === "confirmed") out.push("Reclaimed");
  if (filter.lifecycle === "follow") out.push("Follow-through status");
  if (filter.lifecycle === "developing") out.push("Developing status");
  if (filter.lifecycle === "potential") out.push("Potential status");
  return out;
}

export function csvHits(rows: TableHit[]): string {
  const head = ["Symbol", "Name", "Exchange", "McapCr", "Side", "Pattern", "Strength", "Status", "Score", "Level", "BrokeTo", "DepthPct", "ReclaimClose", "DistancePct", "ReclaimScore", "VolumeRatio", "Touches", "FollowThrough", "SweepDate"];
  const lines = [head.join(",")];
  for (const hit of rows) {
    const cells = [
      hit.symbol,
      hit.name,
      hit.exchange,
      hit.mcapCr ?? "",
      hit.direction,
      hit.pattern,
      hit.tier,
      hit.status,
      hit.score,
      hit.level,
      hit.extreme,
      hit.depthPct,
      hit.reclaimClose ?? "",
      distancePct(hit) ?? "",
      hit.parts.reclaim,
      hit.volumeTrust === "neutral" ? "" : (hit.volumeRatio ?? ""),
      hit.touches,
      hit.followThrough ? "yes" : "no",
      hit.sweepT,
    ];
    lines.push(cells.map(csvCell).join(","));
  }
  return lines.join("\n");
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export type LiqSetup = {
  id: string;
  name: string;
  pattern: "sweep" | "failed";
  tf: string;
  direction: "bull" | "bear" | "both";
  universe: string;
  listId: string;
  portfolioIds: string[];
  band: McapBandChoice;
  mcapMin: string;
  mcapMax: string;
  includeUnknown: boolean;
  filter: HitFilter;
  columns: ColumnId[];
  sortKey: SortKey;
  sortDir: SortDir;
  combined: boolean;
};

export type McapBandChoice = "all" | CapBand;

const VIEW_KEY = "kosh-liq-view";

export type LiqView = {
  columns: ColumnId[];
  sortKey: SortKey;
  sortDir: SortDir;
  setups: LiqSetup[];
  combined: boolean;
};

export function defaultView(): LiqView {
  return { columns: DEFAULT_COLUMNS.slice(), sortKey: "rank", sortDir: "desc", setups: [], combined: false };
}

export function loadLiqView(read: (key: string) => string | null): LiqView {
  try {
    const raw = read(VIEW_KEY);
    if (!raw) return defaultView();
    const parsed = JSON.parse(raw) as Partial<LiqView>;
    const base = defaultView();
    return {
      columns: Array.isArray(parsed.columns) && parsed.columns.length ? parsed.columns.filter((id): id is ColumnId => id in COLUMN_LABEL) : base.columns,
      sortKey: parsed.sortKey && parsed.sortKey in COLUMN_LABEL ? parsed.sortKey : base.sortKey,
      sortDir: parsed.sortDir === "asc" ? "asc" : "desc",
      setups: Array.isArray(parsed.setups) ? parsed.setups.slice(0, 24) : [],
      combined: parsed.combined === true,
    };
  } catch {
    return defaultView();
  }
}

export function saveLiqView(view: LiqView, write: (key: string, value: string) => void) {
  write(VIEW_KEY, JSON.stringify({ ...view, setups: view.setups.slice(0, 24) }));
}
