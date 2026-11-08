import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LiqEvent } from "./liquidity.ts";
import { activeFilterCount, columnFilterActive, csvHits, describeFilters, filterHits, loadLiqView, OPEN_FILTER, saveLiqView, sortHits, type HitFilter, type TableHit } from "./liquidity-table.ts";

function hit(patch: Partial<TableHit> & Pick<TableHit, "id" | "symbol" | "score">): TableHit {
  const base = {
    pattern: "sweep" as const,
    direction: "bull" as const,
    tier: "potential" as const,
    status: "confirmed" as const,
    lowQuality: false,
    level: 100,
    zoneLow: 100,
    zoneHigh: 100,
    touches: 1,
    repeated: false,
    swingIndex: 1,
    sweepIndex: 2,
    sweepT: 1_700_000_000,
    extreme: 99,
    depthPct: 1,
    depthAtr: 0.4,
    reclaimIndex: 3,
    reclaimT: 1_700_000_100,
    reclaimClose: 101,
    reclaimCandles: 1,
    reclaimKind: "one" as const,
    volumeRatio: 1.2,
    volumeKnown: true,
    parts: { swing: 10, sweep: 10, reclaim: 10, volume: 8, candle: 8, confirm: 0 },
    weaknesses: [],
    followThrough: false,
    reclaimClosed: true,
    confirmIndex: null,
    confirmT: null,
    invalidIndex: null,
    explanation: "",
    levelId: "low:1",
  } satisfies Omit<LiqEvent, "id" | "score">;
  return { name: patch.name || patch.symbol, exchange: "NSE" as const, ...base, ...patch };
}

describe("liquidity table", () => {
  it("sorts numbers as numbers, keeps nulls at the bottom, and stays stable", () => {
    const rows = [
      hit({ id: "a", symbol: "AAA", score: 10, mcapCr: 100 }),
      hit({ id: "b", symbol: "BBB", score: 2, mcapCr: null }),
      hit({ id: "c", symbol: "CCC", score: 30, mcapCr: 20 }),
      hit({ id: "d", symbol: "DDD", score: 10, mcapCr: 5 }),
    ];
    const byScore = sortHits(rows, "score", "asc").map((row) => row.id);
    assert.deepEqual(byScore, ["b", "a", "d", "c"]);
    const caps = sortHits(rows, "mcap", "desc").map((row) => row.id);
    assert.deepEqual(caps, ["a", "c", "d", "b"]);
    const capsAsc = sortHits(rows, "mcap", "asc").map((row) => row.id);
    assert.equal(capsAsc.at(-1), "b");
    assert.deepEqual(sortHits(rows, "name", "asc").map((row) => row.symbol), ["AAA", "BBB", "CCC", "DDD"]);
    const depths = [
      hit({ id: "low", symbol: "LOW", score: 10, depthPct: 2 }),
      hit({ id: "high", symbol: "HIGH", score: 10, depthPct: 10 }),
      hit({ id: "none", symbol: "NONE", score: 10, depthPct: Number.NaN }),
    ];
    assert.deepEqual(sortHits(depths, "depth", "asc").map((row) => row.id), ["low", "high", "none"]);
    for (const key of ["exchange", "tier", "pattern", "direction", "price", "level", "distance", "reclaim", "volume", "touches", "date", "follow"] as const) {
      assert.equal(sortHits(rows, key, "desc").length, rows.length);
    }
  });

  it("applies several filters at once and can clear them", () => {
    const rows = [
      hit({ id: "a", symbol: "RELIANCE", name: "Reliance", score: 80, tier: "strong", direction: "bull", exchange: "NSE", followThrough: true }),
      hit({ id: "b", symbol: "TCS", name: "TCS", score: 40, tier: "potential", direction: "bear", exchange: "BSE", lowQuality: true }),
      hit({ id: "c", symbol: "INFY", name: "Infosys", score: 70, tier: "strong", direction: "bull", exchange: "NSE" }),
    ];
    const filter: HitFilter = { ...OPEN_FILTER, pattern: "sweep", direction: "bull", exchange: "NSE", tier: "strong", minScore: 75, follow: "yes" };
    assert.deepEqual(filterHits(rows, filter).map((row) => row.id), ["a"]);
    assert.equal(filterHits(rows, { ...filter, query: "info" }).length, 0);
    assert.equal(filterHits(rows, { ...OPEN_FILTER, weak: true }).length, 3);
    assert.equal(filterHits(rows, { ...OPEN_FILTER, weak: false, minScore: 0 }).some((row) => row.id === "b"), false);
  });

  it("exports the filtered rows and remembers column choices", () => {
    const rows = [hit({ id: "a", symbol: "AAA", name: "A, Ltd", score: 80, mcapCr: 10 })];
    const csv = csvHits(rows);
    assert.match(csv, /Symbol,Name/);
    assert.match(csv, /"A, Ltd"/);
    const mem = new Map<string, string>();
    saveLiqView({ columns: ["name", "score"], sortKey: "score", sortDir: "asc", setups: [], combined: true }, (key, value) => mem.set(key, value));
    const loaded = loadLiqView((key) => mem.get(key) || null);
    assert.deepEqual(loaded.columns, ["name", "score"]);
    assert.equal(loaded.sortKey, "score");
    assert.equal(loaded.sortDir, "asc");
    assert.equal(loaded.combined, true);
  });

  it("counts active result filters without treating a sort change as a filter reset", () => {
    const filter: HitFilter = { ...OPEN_FILTER, exchange: "NSE", minScore: 60, cap: "small", direction: "bull" };
    assert.equal(activeFilterCount(OPEN_FILTER), 0);
    assert.equal(activeFilterCount(filter), 4);
    assert.equal(columnFilterActive("exchange", filter), true);
    assert.equal(columnFilterActive("mcap", filter), true);
    assert.equal(columnFilterActive("score", OPEN_FILTER), false);
    assert.equal(columnFilterActive("pattern", filter), false);
    const described = describeFilters(filter);
    assert.equal(described.includes("NSE"), true);
    assert.equal(described.includes("Score ≥ 60"), true);
    const rows = [
      hit({ id: "a", symbol: "AAA", score: 10 }),
      hit({ id: "b", symbol: "BBB", score: 20 }),
    ];
    const asc = sortHits(rows, "score", "asc").map((row) => row.id);
    const desc = sortHits(rows, "score", "desc").map((row) => row.id);
    assert.deepEqual(asc, ["a", "b"]);
    assert.deepEqual(desc, ["b", "a"]);
    assert.equal(activeFilterCount(filter), 4);
  });
});
