import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { adjustPriceReturn } from "./rrg-adjust.ts";
import { buildReading, pairTimeframe } from "./rrg-frame.ts";
import { loadRegistry, loadRrgPack, loadSeries } from "./rrg-read.server.ts";
import { OFFICIAL_SECTORS, annotateMembers, resolveMembers, sectorBoard } from "./rrg-sectors.ts";

const PLOTTABLE = ["NIFTY AUTO", "NIFTY BANK", "NIFTY FINANCIAL SERVICES", "NIFTY FMCG", "NIFTY IT", "NIFTY METAL", "NIFTY PHARMA", "NIFTY PSU BANK", "NIFTY REALTY"];

describe("sector board and stock calculation audit", () => {
  it("lists every official sector once and only plots indices that are actually stored", () => {
    const board = sectorBoard(loadRegistry());
    const sectoral = board.filter((row) => row.klass === "sectoral");
    const symbols = OFFICIAL_SECTORS.map((row) => row.registrySymbol);
    assert.equal(new Set(symbols).size, symbols.length);
    assert.equal(sectoral.length, 34);
    assert.deepEqual(sectoral.filter((row) => row.plottable).map((row) => row.registrySymbol).sort(), [...PLOTTABLE].sort());
    assert.equal(sectoral.find((row) => row.registrySymbol === "NIFTY CEMENT")?.plottable, false);
    assert.match(sectoral.find((row) => row.registrySymbol === "NIFTY CEMENT")?.reason || "", /No daily history/);
    assert.equal(board.find((row) => row.registrySymbol === "NIFTY INDIA DEFENCE")?.klass, "thematic");
    assert.equal(board.find((row) => row.registrySymbol === "NIFTY INFRASTRUCTURE")?.klass, "thematic");
    assert.equal(board.find((row) => row.registrySymbol === "NIFTY COMMODITIES")?.klass, "thematic");
    assert.equal(board.find((row) => row.registrySymbol === "NIFTY ENERGY")?.klass, "thematic");
    assert.equal(board.find((row) => row.registrySymbol === "NIFTY ENERGY")?.plottable, true);
  });

  it("keeps current membership separate from weights and the chart cap", () => {
    const picked = resolveMembers([
      { symbol: "infy", name: "Infosys", weight: 10 },
      { symbol: "INFY", name: "Infosys", weight: 10 },
      { symbol: "TCS", name: "TCS", weight: 20 },
      { symbol: "WIPRO", name: "Wipro", weight: null },
    ], 2);
    assert.equal(picked.duplicates, 1);
    assert.deepEqual(picked.plotted.map((row) => row.symbol), ["TCS", "INFY"]);
    assert.deepEqual(picked.overflow.map((row) => row.symbol), ["WIPRO"]);
    assert.equal(picked.membership, "current");
    const named = annotateMembers([
      { symbol: "TCS", name: "TCS", weight: 20 },
      { symbol: "TCS", name: "TCS", weight: 20 },
      { symbol: null, name: "Unnamed", weight: 1 },
      { symbol: "NEWCO", name: "New", weight: 1 },
    ], new Set(["TCS"]));
    assert.equal(named.duplicates, 1);
    assert.equal(named.unnamed, 1);
    assert.equal(named.stored, 1);
    assert.equal(named.missing, 1);
  });

  it("uses one calculation for an index series and a stock series with the same closes", () => {
    const closes = Array.from({ length: 80 }, (_, index) => ({ date: `2024-01-${String((index % 27) + 1).padStart(2, "0")}`, close: 100 + index }));
    const bench = closes.map((row, index) => ({ date: row.date, close: 1000 + index * 0.4 }));
    const unique = [...new Map(closes.map((row) => [row.date, row])).values()].sort((a, b) => a.date.localeCompare(b.date));
    const uniqueBench = [...new Map(bench.map((row) => [row.date, row])).values()].sort((a, b) => a.date.localeCompare(b.date));
    const asIndex = buildReading({ symbol: "INDEX", name: "Index", instrument: unique, benchmark: uniqueBench, timeframe: "daily", tail: 4, notes: [], limited: false });
    const asStock = buildReading({ symbol: "STOCK", name: "Stock", instrument: unique, benchmark: uniqueBench, timeframe: "daily", tail: 4, notes: [], limited: false });
    assert.equal(asIndex.rsRatio, asStock.rsRatio);
    assert.equal(asIndex.rsMomentum, asStock.rsMomentum);
    assert.equal(asIndex.quadrant, asStock.quadrant);
  });

  it("freezes the three stored sector readings and shows a bonus changes a stock reading", () => {
    const expected = {
      "NIFTY BANK": { ratio: 101.14305203815246, momentum: 100.11138635665971, quadrant: "leading" },
      "NIFTY IT": { ratio: 103.87453354699102, momentum: 103.84187177873572, quadrant: "leading" },
      "NIFTY PHARMA": { ratio: 103.90040479754055, momentum: 99.4806014754173, quadrant: "weakening" },
    };
    for (const [symbol, want] of Object.entries(expected)) {
      const pack = loadRrgPack({ mode: "sector", group: "sector", benchmark: "NIFTY 50", symbols: [symbol], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 8 });
      const row = pack.readings?.[0];
      assert.ok(row);
      assert.equal(row?.rsRatio, want.ratio);
      assert.equal(row?.rsMomentum, want.momentum);
      assert.equal(row?.quadrant, want.quadrant);
    }
    const dates = ["2024-10-24", "2024-10-25", "2024-10-28", "2024-10-29"];
    const raw = dates.map((date, index) => ({ date, close: index < 2 ? 2000 : 1000 + index }));
    const bench = dates.map((date, index) => ({ date, close: 1000 + index }));
    const adjusted = adjustPriceReturn(raw, [{ date: "2024-10-28", type: "bonus", ratioNum: 1, ratioDen: 1 }]);
    const rawRs = (100 * raw[0]!.close) / bench[0]!.close;
    const adjustedRs = (100 * adjusted.rows[0]!.close) / bench[0]!.close;
    assert.equal(adjusted.applied[0]?.factor, 0.5);
    assert.equal(adjusted.rows.at(-1)?.close, raw.at(-1)?.close);
    assert.notEqual(rawRs, adjustedRs);
  });

  it("keeps the current stock tail on the same path and does not refill missing weeks", () => {
    const reliance = loadSeries("RELIANCE");
    const nifty = loadSeries("NIFTY 50");
    assert.ok(reliance && nifty);
    const reading = buildReading({
      symbol: "RELIANCE",
      name: "Reliance",
      instrument: reliance.rows,
      benchmark: nifty.rows,
      timeframe: "weekly",
      asOf: "2026-10-23",
      tail: 8,
      notes: [],
      limited: false,
    });
    assert.equal(reading.rsRatio, 97.89679471470224);
    assert.equal(reading.rsMomentum, 100.68531014855711);
    assert.equal(reading.quadrant, "improving");
    const paired = pairTimeframe(reliance.rows, nifty.rows, "weekly", "2026-10-23");
    const mismatches = paired.pairs.filter((row) => row.date !== row.benchmarkDate).length;
    assert.equal(mismatches, 11);
    assert.equal(paired.pairs.length, 877);
    assert.equal(reliance.applied?.length, 2);
    const sensex = loadRrgPack({ mode: "sector", group: "sector", benchmark: "SENSEX", symbols: ["NIFTY BANK"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 4 });
    assert.equal(sensex.readings?.[0]?.rsRatio, 100.87511382779299);
    assert.notEqual(sensex.readings?.[0]?.rsRatio, 101.14305203815246);
  });

  it("stores constituent baskets without duplicate symbols", () => {
    const file = JSON.parse(readFileSync(new URL("../../../data/rrg/constituents.json", import.meta.url), "utf8")) as {
      items: { catalogueSymbol: string; rows: { symbol: string }[] }[];
    };
    const psu = file.items.find((row) => row.catalogueSymbol === "^CNXPSUBANK");
    const bank = file.items.find((row) => row.catalogueSymbol === "^NSEBANK");
    assert.ok(bank && bank.rows.length >= 10);
    assert.equal(psu?.rows.some((row) => row.symbol === "ALLCARGO"), false);
    for (const item of file.items) {
      const symbols = item.rows.map((row) => row.symbol).filter(Boolean);
      assert.equal(new Set(symbols).size, symbols.length, item.catalogueSymbol);
    }
  });

  it("does not apply the Allcargo close-to-close ratio and leaves the sector path unchanged", () => {
    const pack = loadRrgPack({
      mode: "stock",
      group: "stock",
      benchmark: "NIFTY 500",
      symbols: ["ALLCARGO"],
      explicit: true,
      timeframe: "monthly",
      asOf: "2026-10-23",
      tail: 30,
    });
    const row = pack.readings?.[0];
    assert.equal(row?.close, 9.25);
    assert.equal(pack.benchmark && "close" in pack.benchmark ? pack.benchmark.close : null, 21427.599609375);
    assert.equal(row?.rsRatio, null);
    assert.equal(row?.rsMomentum, null);
    assert.equal(row?.quadrant, null);
    assert.match(row?.warnings.join(" ") || "", /2025-11-12/);
    assert.match(row?.warnings.join(" ") || "", /withheld/);
    const shorter = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 500", symbols: ["ALLCARGO"], explicit: true, timeframe: "monthly", asOf: "2026-10-23", tail: 29 });
    assert.equal(shorter.readings?.[0]?.rsRatio, null);
    const stored = loadSeries("ALLCARGO");
    const ex = stored?.rows.find((point) => point.date === "2025-11-11");
    assert.equal(ex?.close, 33.87);
    assert.equal(stored?.applied?.some((item) => item.type === "demerger"), false);
    const daily = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 500", symbols: ["ALLCARGO"], explicit: true, timeframe: "daily", asOf: "2026-10-23", tail: 4 });
    const weekly = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 500", symbols: ["ALLCARGO"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 4 });
    assert.equal(daily.readings?.[0]?.quadrant, "improving");
    assert.equal(weekly.readings?.[0]?.quadrant, "leading");
    assert.equal(daily.readings?.[0]?.rsRatio, 97.69221684151829);
    assert.equal(weekly.readings?.[0]?.rsRatio, 108.81155242147962);
    const bank = loadRrgPack({ mode: "sector", group: "sector", benchmark: "NIFTY 50", symbols: ["NIFTY BANK"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 8 });
    assert.equal(bank.readings?.[0]?.rsRatio, 101.14305203815246);
  });
});
