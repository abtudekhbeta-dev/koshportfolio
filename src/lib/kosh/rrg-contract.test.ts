import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { gunzipSync } from "node:zlib";
import { actionFactor, repeatAdjustment } from "./rrg-adjust.ts";
import { buildReading, pairTimeframe } from "./rrg-frame.ts";
import { rotationRequest } from "./rrg-note.ts";
import { loadRrgPack, loadSeries } from "./rrg-read.server.ts";
import { computeRrg, wma } from "./rrg.ts";

describe("RRG calculation contract", () => {
  it("matches a hand-worked weighted average, ratio and lag", () => {
    assert.equal(wma([100, 110, 120, 130, 140], 4, 2), (140 * 2 + 130) / 3);
    assert.equal(wma([100, 110, 120, 130, 140], 4, 3), (140 * 3 + 130 * 2 + 120) / 6);
    const closes = [100, 110, 120, 130, 140].map((close, index) => ({ date: `2024-01-0${index + 1}`, close }));
    const bench = closes.map((row) => ({ date: row.date, close: 100 }));
    const last = computeRrg(closes, bench, { fast: 2, slow: 3, momentum: 1 }).points[4];
    assert.ok(Math.abs((last?.rsRatio || 0) - 102.5) < 1e-9);
    assert.ok(Math.abs((last?.rsMomentum || 0) - 99.80263157894737) < 1e-9);
    assert.equal(last?.quadrant, "weakening");
  });

  it("does not use a later day in the same month or the same week", () => {
    const instrument = [
      { date: "2026-10-09", close: 10 },
      { date: "2026-10-23", close: 99 },
    ];
    const benchmark = [
      { date: "2026-10-09", close: 10 },
      { date: "2026-10-23", close: 10 },
    ];
    const month = pairTimeframe(instrument, benchmark, "monthly", "2026-10-09");
    assert.deepEqual(month.pairs.map((row) => row.instrument), [10]);
    const week = pairTimeframe(
      [
        { date: "2024-01-05", close: 10 },
        { date: "2024-01-08", close: 99 },
      ],
      [
        { date: "2024-01-05", close: 10 },
        { date: "2024-01-08", close: 10 },
      ],
      "weekly",
      "2024-01-05",
    );
    assert.deepEqual(week.pairs.map((row) => row.instrument), [10]);
  });

  it("withholds a coordinate when an unresolved break sits inside the slow window", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const rows = Array.from({ length: 40 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      return { date: date.toISOString().slice(0, 10), close: index === 25 ? 40 : 100 };
    });
    const bench = rows.map((row) => ({ date: row.date, close: 100 }));
    const held = buildReading({
      symbol: "GAP",
      name: "Gap",
      instrument: rows,
      benchmark: bench,
      timeframe: "daily",
      tail: 8,
      notes: [],
      limited: false,
      unresolved: [{ date: rows[25]!.date, change: 40 / 100 - 1, reason: "Unresolved" }],
    });
    assert.equal(held.rsRatio, null);
    assert.equal(held.tail.length, 0);
    assert.match(held.warnings.join(" "), /withheld/);
    const clear = buildReading({
      symbol: "GAP",
      name: "Gap",
      instrument: rows,
      benchmark: bench,
      timeframe: "daily",
      tail: 8,
      notes: [],
      limited: false,
      unresolved: [{ date: rows[2]!.date, change: -0.6, reason: "Unresolved" }],
    });
    assert.ok(clear.rsRatio != null);
  });

  it("changes the ratio when the benchmark changes and keeps the three sector readings", () => {
    const nifty = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 50", symbols: ["RELIANCE"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 4 });
    const sensex = loadRrgPack({ mode: "stock", group: "stock", benchmark: "SENSEX", symbols: ["RELIANCE"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 4 });
    assert.notEqual(nifty.readings?.[0]?.rsRatio, sensex.readings?.[0]?.rsRatio);
    assert.equal(nifty.readings?.[0]?.rsRatio, 97.89679471470224);
    const sectors = ["NIFTY BANK", "NIFTY IT", "NIFTY PHARMA"] as const;
    const expected = [101.14305203815246, 103.87453354699102, 103.90040479754055];
    sectors.forEach((symbol, index) => {
      const pack = loadRrgPack({ mode: "sector", group: "sector", benchmark: "NIFTY 50", symbols: [symbol], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 4 });
      assert.equal(pack.readings?.[0]?.rsRatio, expected[index], symbol);
    });
  });

  it("uses one path for a split-adjusted large cap, a compound split, and a withheld demerger", () => {
    const techm = loadSeries("TECHM");
    const split = techm?.rows.findIndex((row) => row.date === "2015-03-19") ?? -1;
    assert.ok(split > 0);
    const prev = techm?.rows[split - 1]?.close ?? 0;
    const ex = techm?.rows[split]?.close ?? 0;
    assert.ok(Math.abs(ex / prev - 1) < 0.03);
    assert.equal(techm?.applied?.find((item) => item.date === "2015-03-19")?.factor, 0.25);
    const titan = loadSeries("TITAN");
    assert.equal(titan?.applied?.find((item) => item.date === "2011-06-23")?.factor, 0.05);
    const reliance = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 50", symbols: ["RELIANCE", "HDFCBANK", "INFY", "ICICIBANK"], explicit: true, timeframe: "weekly", asOf: "2026-10-23", tail: 6 });
    for (const row of reliance.readings || []) {
      assert.ok(row.rsRatio != null && row.rsMomentum != null, row.symbol);
      assert.equal(row.quadrant, row.rsRatio! > 100 && row.rsMomentum! > 100 ? "leading" : row.rsRatio! > 100 ? "weakening" : row.rsMomentum! > 100 ? "improving" : "lagging");
    }
    const monthly = ["daily", "weekly", "monthly"] as const;
    for (const timeframe of monthly) {
      const pack = loadRrgPack({ mode: "stock", group: "stock", benchmark: "NIFTY 500", symbols: ["ALLCARGO"], explicit: true, timeframe, asOf: "2026-10-23", tail: 4 });
      const row = pack.readings?.[0];
      if (timeframe === "monthly") assert.equal(row?.rsRatio, null);
      else assert.ok(row?.rsRatio != null);
    }
    const request = rotationRequest({
      benchmark: "Nifty 50",
      timeframe: "weekly",
      asOf: "",
      readings: reliance.readings || [],
      cross: [],
    });
    assert.ok(!("error" in request));
    if (!("error" in request)) assert.equal(request.readings[0]?.rsRatio, reliance.readings?.[0]?.rsRatio);
  });

  it("stores no demerger factor and no factor that was read off a price step", () => {
    assert.equal(actionFactor({ date: "2025-11-12", type: "demerger", priceFactor: 0.35, factorBasis: "close-ratio", subject: "previous close" }), null);
    assert.equal(repeatAdjustment("price-return-split-bonus"), true);
    assert.equal(repeatAdjustment("raw-unadjusted"), false);
    assert.equal(repeatAdjustment(undefined), false);
    const root = join(process.cwd(), "data/rrg/store");
    const offenders: string[] = [];
    for (const name of readdirSync(root)) {
      if (!name.endsWith(".json.gz")) continue;
      const doc = JSON.parse(gunzipSync(readFileSync(join(root, name))).toString("utf8")) as {
        symbol?: string;
        applied?: { type?: string; subject?: string }[];
        meta?: { category?: string };
      };
      for (const action of doc.applied || []) {
        const type = (action.type || "").toLowerCase();
        const subject = action.subject || "";
        if (type === "demerger" || /derived from an unexplained|no exchange action was published/i.test(subject)) offenders.push(doc.symbol || name);
      }
      if (doc.meta?.category && doc.meta.category !== "stock" && (doc.applied || []).length) offenders.push(doc.symbol || name);
    }
    assert.deepEqual(offenders, []);
  });
});
