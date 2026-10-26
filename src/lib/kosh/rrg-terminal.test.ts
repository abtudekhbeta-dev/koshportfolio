import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectHoldings } from "./rrg-holdings.ts";
import { classifyVerdicts, keepIfSameBenchmark, parseRotationNote, rotationRequest, upstreamFailure } from "./rrg-note.ts";
import { PLOT, placeLabels, quadrantAnchors, trailWidth } from "./rrg-plot.ts";
import { loadRrgPack, loadSeries } from "./rrg-read.server.ts";
import { RRG_PRIMARY_BENCHMARKS } from "./rrg-universe.ts";

describe("rotation terminal helpers", () => {
  it("offers the four primary benchmarks and calculates each against Reliance", () => {
    assert.deepEqual(RRG_PRIMARY_BENCHMARKS.map((item) => item.symbol), ["NIFTY 50", "SENSEX", "NIFTY 500", "NIFTY BANK"]);
    const ratios = RRG_PRIMARY_BENCHMARKS.map((item) => {
      const pack = loadRrgPack({ mode: "stock", benchmark: item.symbol, symbols: ["RELIANCE"], explicit: true, timeframe: "daily", asOf: "2026-10-24", tail: 4 });
      assert.equal(pack.error, null);
      if (pack.error || !pack.readings?.[0] || !pack.benchmark) throw new Error(item.symbol);
      assert.equal(pack.benchmark.symbol, item.symbol);
      assert.equal(pack.benchmark.asOf, "2026-10-23");
      return pack.readings[0].rsRatio;
    });
    assert.equal(new Set(ratios).size, ratios.length);
  });

  it("does not keep a chart from a different benchmark", () => {
    assert.equal(keepIfSameBenchmark(["rrg", "stock", "stock", "NIFTY 50"], "NIFTY 50"), true);
    assert.equal(keepIfSameBenchmark(["rrg", "stock", "stock", "NIFTY 50"], "SENSEX"), false);
  });

  it("resolves current holdings without changing quantities into rotation inputs", () => {
    const picked = selectHoldings([
      { symbol: "reliance.ns", name: "Reliance", qty: 2, avg: 100 },
      { symbol: "RELIANCE", name: "Reliance", qty: 3, avg: 200 },
      { symbol: "INFY.BO", name: "Infosys", qty: 1, avg: null },
      { symbol: "HDFCBANK", name: "HDFC", qty: 10, avg: 50 },
    ], 2);
    assert.equal(picked.duplicates, 1);
    assert.equal(picked.plotted[0]?.symbol, "RELIANCE");
    assert.equal(picked.plotted[0]?.qty, 5);
    assert.equal(picked.plotted.length, 2);
    assert.equal(picked.overflow.length, 1);
    assert.ok((picked.plotted[0]?.bookWeight || 0) > 0);
    assert.equal(picked.plotted.find((row) => row.symbol === "INFY.BO")?.bookWeight ?? picked.overflow.find((row) => row.symbol === "INFY")?.bookWeight, null);
  });

  it("builds a historical request from the snapshot and rejects an empty one", () => {
    const request = rotationRequest({
      benchmark: "Nifty 50",
      timeframe: "daily",
      asOf: "2020-01-15",
      readings: [{
        symbol: "RELIANCE",
        name: "Reliance",
        asOf: "2020-01-15",
        quadrant: "improving",
        previousQuadrant: "lagging",
        rsRatio: 99,
        rsMomentum: 101,
        relativeReturn: 0.01,
        absoluteReturn: -0.02,
        direction: "RS-Ratio rose and RS-Momentum rose.",
        tail: [
          { date: "2020-01-14", rsRatio: 98, rsMomentum: 100, quadrant: "lagging" },
          { date: "2020-01-15", rsRatio: 99, rsMomentum: 101, quadrant: "improving" },
        ],
      }],
      cross: [{ symbol: "RELIANCE", daily: "improving", weekly: "lagging", monthly: null }],
    });
    assert.equal("error" in request, false);
    if ("error" in request) return;
    assert.equal(request.historical, true);
    assert.equal(request.asOf, "2020-01-15");
    assert.equal(request.readings[0]?.date, "2020-01-15");
    assert.equal(request.readings[0]?.daily, "improving");
    const empty = rotationRequest({ benchmark: "Nifty 50", timeframe: "daily", asOf: "2020-01-15", readings: [], cross: [] });
    assert.equal("error" in empty, true);
  });

  it("accepts a partial note and names a rate limit", () => {
    const note = parseRotationNote(JSON.stringify({ overview: "Two names lead.", leading: "", lagging: "One lags." }));
    assert.equal(note.ok, true);
    if (note.ok) assert.equal(note.note.leading, undefined);
    assert.equal(parseRotationNote("not json").ok, false);
    assert.equal(upstreamFailure(429).status, 429);
    assert.match(upstreamFailure(401).error, /rejected/);
  });

  it("keeps labels inside the plot and makes the selected trail thicker", () => {
    const labels = placeLabels([
      { symbol: "RELIANCE", x: PLOT.left + 40, y: PLOT.top + 40 },
      { symbol: "HDFCBANK", x: PLOT.left + 42, y: PLOT.top + 42 },
      { symbol: "INFY", x: PLOT.left + PLOT.width - 4, y: PLOT.top + 8 },
    ], "HDFCBANK");
    assert.equal(labels[0]?.symbol, "HDFCBANK");
    for (const label of labels) {
      assert.ok(label.x >= PLOT.left);
      assert.ok(label.y <= PLOT.top + PLOT.height);
    }
    assert.ok(trailWidth("standard", true) > trailWidth("standard", false));
    assert.ok(trailWidth("bold", false) > trailWidth("thin", true));
  });

  it("names every quadrant inside the plot when 100 is in view", () => {
    const labels = quadrantAnchors(PLOT.left + PLOT.width / 2, PLOT.top + PLOT.height / 2);
    assert.deepEqual(labels.map((label) => label.name), ["LEADING", "WEAKENING", "LAGGING", "IMPROVING"]);
    const leading = labels[0]!;
    const improving = labels[3]!;
    assert.ok(leading.x > improving.x);
    assert.ok(leading.y < labels[1]!.y);
  });

  it("does not call every leader good or every laggard bad", () => {
    const tail = (ratio: number, momentum: number, previousRatio: number, previousMomentum: number, quadrant: string) => [
      { quadrant, rsRatio: previousRatio, rsMomentum: previousMomentum },
      { quadrant, rsRatio: previousRatio, rsMomentum: previousMomentum },
      { quadrant, rsRatio: previousRatio, rsMomentum: previousMomentum },
      { quadrant, rsRatio: ratio, rsMomentum: momentum },
    ];
    const cross = [
      { symbol: "LEAD", daily: "leading", weekly: "leading", monthly: "leading" },
      { symbol: "FADE", daily: "weakening", weekly: "leading", monthly: "leading" },
      { symbol: "LAG", daily: "lagging", weekly: "lagging", monthly: "lagging" },
      { symbol: "TURN", daily: "improving", weekly: "lagging", monthly: "lagging" },
    ];
    const rows = classifyVerdicts([
      { symbol: "LEAD", name: "Lead", quadrant: "leading", rsRatio: 104, rsMomentum: 103, relativeReturn: 0.02, absoluteReturn: 0.01, asOf: "2020-06-01", tail: tail(104, 103, 103, 102, "leading") },
      { symbol: "FADE", name: "Fade", quadrant: "leading", rsRatio: 104, rsMomentum: 101, relativeReturn: 0.01, absoluteReturn: 0, asOf: "2020-06-01", tail: tail(104, 101, 105, 104, "leading") },
      { symbol: "LAG", name: "Lag", quadrant: "lagging", rsRatio: 96, rsMomentum: 97, relativeReturn: -0.03, absoluteReturn: -0.02, asOf: "2020-06-01", tail: tail(96, 97, 97, 98, "lagging") },
      { symbol: "TURN", name: "Turn", quadrant: "lagging", rsRatio: 96, rsMomentum: 99, relativeReturn: -0.01, absoluteReturn: 0.01, asOf: "2020-06-01", tail: tail(96, 99, 95, 96, "lagging") },
    ], cross);
    assert.equal(rows.find((row) => row.symbol === "LEAD")?.verdict, "good");
    assert.equal(rows.find((row) => row.symbol === "FADE")?.verdict, "mixed");
    assert.equal(rows.find((row) => row.symbol === "LAG")?.verdict, "bad");
    assert.equal(rows.find((row) => row.symbol === "TURN")?.verdict, "mixed");
    assert.equal(rows.every((row) => row.asOf === "2020-06-01"), true);
  });

  it("uses the adjusted Reliance series and does not apply the bonus factor twice", () => {
    const series = loadSeries("RELIANCE");
    assert.ok(series);
    if (!series) return;
    assert.equal(series.basis, "price-return-split-bonus");
    assert.equal(series.dividendTreatment, "not-adjusted");
    assert.equal(series.quality?.adjustment, "price-return-split-bonus");
    assert.equal(series.applied?.some((item) => item.date === "2024-10-28" && item.factor === 0.5), true);
    const before = series.rows.find((row) => row.date === "2024-10-25")?.close;
    const on = series.rows.find((row) => row.date === "2024-10-28")?.close;
    assert.equal(before, 1327.85);
    assert.ok(before && on && Math.abs(on / before - 1) < 0.25);
  });
});
