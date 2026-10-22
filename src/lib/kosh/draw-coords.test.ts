import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { instrumentDrawKey, mergeDrawBuckets, projectTimeToX, projectXToTime } from "./draw-coords.ts";
import { lookbackReturn } from "./index-return.ts";

describe("instrument drawings", () => {
  it("ignores the timeframe in the storage key", () => {
    assert.equal(instrumentDrawKey("tcs.ns"), instrumentDrawKey("TCS.NS"));
    assert.equal(instrumentDrawKey("TCS:1m"), "TCS");
    assert.equal(instrumentDrawKey("TCS:1D"), instrumentDrawKey("TCS:1W"));
  });

  it("merges interval buckets without changing anchors or duplicating ids", () => {
    const merged = mergeDrawBuckets({
      "TCS:1D": [{ id: "a", t0: 100, y0: 10 }],
      "TCS:1m": [
        { id: "a", t0: 999, y0: 1 },
        { id: "b", t0: 200, y0: 20 },
      ],
      "INFY:5m": [{ id: "c", t0: 300, y0: 30 }],
    });
    assert.deepEqual(merged.TCS.map((s) => s.id), ["a", "b"]);
    assert.equal(merged.TCS[0].t0, 100);
    assert.equal(merged.TCS[0].y0, 10);
    assert.equal(merged.INFY[0].t0, 300);
  });

  it("projects a timestamp between bars and past the loaded range without snapping", () => {
    const src = [{ t: 100 }, { t: 200 }, { t: 300 }];
    const xAt = (i: number) => i * 10;
    assert.equal(projectTimeToX(150, src, xAt), 5);
    assert.equal(projectTimeToX(50, src, xAt), -5);
    assert.equal(projectTimeToX(350, src, xAt), 25);
    assert.equal(projectTimeToX(200, src, xAt), 10);
  });

  it("keeps the same timestamp and price when the timeframe changes", () => {
    const anchors = [{ id: "a", t0: 1_700_000_000, y0: 412.25, t1: 1_700_086_400, y1: 430.5 }];
    const drawings: Record<string, typeof anchors> = {};
    const save = (symbol: string, shapes: typeof anchors) => {
      drawings[instrumentDrawKey(symbol)] = shapes;
    };
    save("TCS.NS", anchors);
    const loaded = drawings[instrumentDrawKey("TCS:1D")];
    assert.equal(loaded, drawings[instrumentDrawKey("TCS:1m")]);
    assert.equal(loaded[0].t0, anchors[0].t0);
    assert.equal(loaded[0].y0, anchors[0].y0);
    assert.equal(loaded[0].t1, anchors[0].t1);
    assert.equal(loaded[0].y1, anchors[0].y1);
    const xAt = (i: number) => i * 10;
    const src = [{ t: 100 }, { t: 200 }, { t: 300 }];
    const uneven = [{ t: 100 }, { t: 250 }, { t: 300 }];
    const x = projectTimeToX(180, uneven, xAt);
    assert.ok(Math.abs(projectXToTime(x, uneven, xAt) - 180) < 1e-6);
    assert.equal(projectXToTime(projectTimeToX(50, src, xAt), src, xAt), 50);
    assert.equal(projectXToTime(projectTimeToX(350, src, xAt), src, xAt), 350);
  });
});

describe("index lookback", () => {
  const day = 86400;
  const bars = [
    { t: 10 * day, c: 100 },
    { t: 12 * day, c: 110 },
    { t: 40 * day, c: 150 },
  ];

  it("uses the close at or before the calendar boundary, skipping a holiday gap", () => {
    const hit = lookbackReturn(bars, 30);
    assert.equal(hit.state, "ok");
    assert.ok(Math.abs((hit.pct || 0) - 50) < 1e-9);
  });

  it("uses the close on the boundary when that session exists", () => {
    const hit = lookbackReturn(bars, 28);
    assert.equal(hit.state, "ok");
    assert.ok(Math.abs((hit.pct || 0) - ((150 - 110) / 110) * 100) < 1e-9);
  });

  it("drops invalid candles instead of treating them as a close", () => {
    const hit = lookbackReturn(
      [
        { t: 10 * day, c: 100 },
        { t: 12 * day, c: 0 },
        { t: 40 * day, c: 150 },
      ],
      30,
    );
    assert.equal(hit.state, "ok");
    assert.ok(Math.abs((hit.pct || 0) - 50) < 1e-9);
  });

  it("says when history does not reach the boundary", () => {
    assert.equal(lookbackReturn(bars, 400).state, "short-history");
    assert.equal(lookbackReturn([{ t: day, c: 1 }], 7).state, "no-history");
  });
});
