import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateCloses, buildReading, filterReadings, interpret, isoWeek, pairTimeframe, plotDomain, rotationBrief, rrgLayout, sortReadings, viewState, zoomDomain, type RrgReading } from "./rrg-frame.ts";
import { buildPack } from "./rrg-pack.ts";
import { loadRrgPack } from "./rrg-read.server.ts";
import { resolveSymbols } from "./rrg-universe.ts";
import type { ClosePrint } from "./rrg.ts";

function days(start: string, count: number, closeAt: (index: number) => number): ClosePrint[] {
  const rows: ClosePrint[] = [];
  const date = new Date(`${start}T00:00:00Z`);
  for (let i = 0; i < count; i++) {
    rows.push({ date: date.toISOString().slice(0, 10), close: closeAt(i) });
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return rows;
}

describe("RRG timeframe and readings", () => {
  it("keeps the last close of a week and does not fill a missing week", () => {
    assert.equal(isoWeek("2024-01-05"), isoWeek("2024-01-01"));
    assert.notEqual(isoWeek("2024-01-08"), isoWeek("2024-01-05"));
    const rows = [
      { date: "2024-01-01", close: 10 },
      { date: "2024-01-05", close: 12 },
      { date: "2024-01-15", close: 14 },
    ];
    const weekly = aggregateCloses(rows, "weekly");
    assert.equal(weekly.length, 2);
    assert.equal(weekly[0]?.close, 12);
    assert.equal(weekly[1]?.date, "2024-01-15");
    const monthly = aggregateCloses(rows, "monthly");
    assert.equal(monthly.length, 1);
    assert.equal(monthly[0]?.close, 14);
  });

  it("does not let a later week change an earlier as-of bar", () => {
    const instrument = [
      { date: "2024-01-05", close: 10 },
      { date: "2024-01-08", close: 99 },
    ];
    const benchmark = [
      { date: "2024-01-05", close: 10 },
      { date: "2024-01-08", close: 10 },
    ];
    const cut = pairTimeframe(instrument, benchmark, "weekly", "2024-01-05");
    const full = pairTimeframe(instrument, benchmark, "weekly");
    assert.deepEqual(cut.pairs.map((row) => row.instrument), [10]);
    assert.deepEqual(full.pairs.map((row) => row.instrument), [10, 99]);
  });

  it("leaves an exact 100 reading on the boundary", () => {
    const flat = days("2024-01-01", 80, () => 50);
    const reading = buildReading({
      symbol: "FLAT",
      name: "Flat",
      instrument: flat,
      benchmark: flat,
      timeframe: "daily",
      tail: 5,
      notes: [],
      limited: false,
    });
    assert.equal(reading.quadrant, "boundary");
    assert.equal(reading.rsRatio, 100);
    assert.equal(reading.rsMomentum, 100);
  });

  it("sorts and filters calculated fields, including nulls last", () => {
    const rows = [
      reading("A", "lagging", 90),
      reading("B", null, null),
      reading("C", "leading", 110),
    ];
    assert.deepEqual(sortReadings(rows, "rsRatio", "desc").map((row) => row.symbol), ["C", "A", "B"]);
    assert.deepEqual(filterReadings(rows, "leading", "").map((row) => row.symbol), ["C"]);
    assert.deepEqual(filterReadings(rows, "all", "alpha").map((row) => row.symbol), []);
  });

  it("says when price and relative rank disagree, and does not give a trade instruction", () => {
    const row = reading("NIFTY IT", "leading", 110);
    row.absoluteReturn = -0.04;
    row.name = "Nifty IT";
    row.returnFrom = "2026-07-01";
    row.returnTo = "2026-10-23";
    const notes = interpret([row], [{ symbol: "NIFTY IT", name: "Nifty IT", daily: "leading", weekly: "lagging", monthly: null }]);
    assert.match(notes.join(" "), /relative basis while its own price is down/);
    assert.match(notes.join(" "), /does not agree across timeframes/);
    assert.doesNotMatch(notes.join(" "), /buy|sell|clockwise|guaranteed/i);
  });

  it("rejects a symbol that is not in the validated list", () => {
    const resolved = resolveSymbols(["RELIANCE", "NOTREAL", "RELIANCE"], ["RELIANCE", "INFY"]);
    assert.deepEqual(resolved.ok, ["RELIANCE"]);
    assert.deepEqual(resolved.missing, ["NOTREAL"]);
  });

  it("keeps 100 inside the plot and changes layout on a narrow screen", () => {
    const domain = plotDomain([{ x: 130, y: 140 }]);
    assert.ok(domain.x0 < 100 && domain.x1 > 100);
    assert.ok(domain.y0 < 100 && domain.y1 > 100);
    const zoomed = zoomDomain(domain, 100, 100, 0.8);
    assert.ok(zoomed.x1 - zoomed.x0 < domain.x1 - domain.x0);
    assert.equal(rrgLayout(390).stacked, true);
    assert.equal(rrgLayout(1200).stacked, false);
    assert.equal(viewState({ pending: true, error: false, selected: 2 }), "loading");
    assert.equal(viewState({ pending: false, error: true, selected: 2 }), "error");
    assert.equal(viewState({ pending: false, error: false, selected: 0 }), "empty");
  });
});

describe("stored RRG pack", () => {
  it("reads the validated store without merging Tata Motors successors", () => {
    const pack = loadRrgPack({
      mode: "sector",
      benchmark: "NIFTY 50",
      symbols: ["NIFTY BANK", "NIFTY IT"],
      explicit: true,
      timeframe: "daily",
      tail: 8,
    });
    if (pack.error || !pack.readings) throw new Error(pack.error || "no readings");
    assert.equal(pack.readings.length, 2);
    assert.equal(pack.readings[0]?.tail.length, 8);
    assert.ok(pack.readings.every((row) => row.rsRatio != null && row.asOf === "2026-10-23"));
    const cut = loadRrgPack({
      mode: "stock",
      benchmark: "NIFTY 50",
      symbols: ["TATAMOTORS", "TMPV", "TMCV", "NOTREAL"],
      explicit: true,
      timeframe: "monthly",
      asOf: "2026-10-23",
      tail: 6,
    });
    if (cut.error || !cut.readings || !cut.missing) throw new Error(cut.error || "no readings");
    const tata = cut.readings.find((row) => row.symbol === "TATAMOTORS");
    const passenger = cut.readings.find((row) => row.symbol === "TMPV");
    assert.equal(tata?.asOf != null && tata.asOf <= "2025-10-23", true);
    assert.match(tata?.warnings.join(" ") || "", /demerger/);
    assert.equal(passenger?.quadrant, null);
    assert.match(passenger?.warnings.join(" ") || "", /Limited history/);
    assert.deepEqual(cut.missing, ["NOTREAL"]);
    const empty = buildPack(new Map(), {
      mode: "sector",
      benchmark: "NIFTY 50",
      symbols: [],
      explicit: true,
      timeframe: "daily",
      tail: 4,
    });
    assert.match(empty.error || "", /cannot be used as a benchmark/);
  });
});

describe("rotation brief", () => {
  it("ranks by quadrant and ratio, not by distance from 100", () => {
    const rows = [
      reading("A", "leading", 110),
      reading("B", "leading", 101),
      { ...reading("C", "lagging", 90), absoluteReturn: 0.04 },
      { ...reading("D", "improving", 98), previousQuadrant: "lagging" as const, rsMomentum: 103 },
    ];
    const brief = rotationBrief(rows, [
      { symbol: "A", name: "A", daily: "leading", weekly: "leading", monthly: "leading" },
      { symbol: "B", name: "B", daily: "leading", weekly: "weakening", monthly: "leading" },
    ]);
    assert.deepEqual(brief.leaders, ["A", "B"]);
    assert.deepEqual(brief.emerging, ["D"]);
    assert.match(brief.transitions[0] || "", /D moved from Lagging to Improving/);
    assert.match(brief.contrasts[0] || "", /C is lagging/);
    assert.equal(brief.aligned.length, 1);
    assert.equal(brief.split.length, 1);
  });
});

function reading(symbol: string, quadrant: RrgReading["quadrant"], ratio: number | null): RrgReading {
  return {
    symbol,
    name: symbol,
    quadrant,
    previousQuadrant: null,
    rsRatio: ratio,
    rsMomentum: ratio,
    distance: ratio == null ? null : Math.abs(ratio - 100),
    direction: "Little change since the previous point.",
    close: 1,
    benchmarkClose: 1,
    asOf: "2026-10-23",
    absoluteReturn: 0.01,
    relativeReturn: 0,
    returnFrom: "2026-01-01",
    returnTo: "2026-10-23",
    tail: [],
    aligned: 1,
    droppedInstrument: 0,
    droppedBenchmark: 0,
    warnings: [],
  };
}
