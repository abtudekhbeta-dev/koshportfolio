import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { atLatest, panBy, resetView, zoomAround, zoomRightEdge } from "./chart-nav.ts";
import { alignIndexed, applyHistoricalFx, adjustOhlcToBenchmark, indexTo100, indexedGap } from "./relative.ts";
import { histPush, histRedo, histUndo, histInit } from "./draw-history.ts";
import { sectorIndex } from "./benchmarks.ts";

describe("chart viewport", () => {
  it("keeps the candle under the cursor when zooming in", () => {
    const next = zoomAround({ start: 100, count: 100 }, 400, 20, true);
    assert.ok(next.count < 100);
    const before = 100 + 20;
    const frac = 20 / 100;
    const afterAnchor = next.start + Math.round(frac * next.count);
    assert.ok(Math.abs(afterAnchor - before) <= 2);
  });

  it("zoom out adds bars and stays inside the series", () => {
    const next = zoomAround({ start: 50, count: 40 }, 200, 10, false);
    assert.ok(next.count > 40);
    assert.ok(next.start >= 0);
    assert.ok(next.start + next.count <= 200);
  });

  it("pan moves history without changing the window size", () => {
    const next = panBy({ start: 40, count: 30 }, 200, -10);
    assert.equal(next.count, 30);
    assert.equal(next.start, 30);
  });

  it("button zoom keeps the right edge fixed", () => {
    const view = { start: 200, count: 100 };
    const next = zoomRightEdge(view, 400, true);
    assert.ok(next.count < view.count);
    assert.equal(next.start + next.count, view.start + view.count);
    const wider = zoomRightEdge(view, 400, false);
    assert.ok(wider.count > view.count);
    assert.equal(wider.start + wider.count, view.start + view.count);
  });

  it("reset parks the latest bars on the right edge", () => {
    const v = resetView(500, 180);
    assert.equal(v.count, 180);
    assert.equal(v.start, 320);
    assert.equal(atLatest(v, 500), true);
    assert.equal(atLatest({ start: 0, count: 180 }, 500), false);
  });
});

describe("indexed benchmark and USD", () => {
  it("rebases the first positive print to 100", () => {
    assert.deepEqual(indexTo100([0, 50, 75]), [null, 100, 150]);
  });

  it("indexes stock and benchmark together on shared days", () => {
    const stock = [
      { t: 1_700_000_000, c: 100 },
      { t: 1_700_086_400, c: 124 },
    ];
    const bench = [
      { t: 1_700_000_000, c: 200 },
      { t: 1_700_086_400, c: 224 },
    ];
    const rows = alignIndexed(stock, bench);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].stock, 100);
    assert.equal(rows[0].bench, 100);
    assert.ok(Math.abs(rows[1].stock - 124) < 0.01);
    assert.ok(Math.abs(indexedGap(rows)! - (124 - 112)) < 0.01);
  });

  it("returns nothing when the benchmark does not overlap", () => {
    assert.equal(alignIndexed([{ t: 10, c: 1 }], []).length, 0);
  });

  it("uses the historical FX print and drops days with no rate", () => {
    const bars = [
      { t: 1_700_000_000, o: 830, h: 840, l: 820, c: 830 },
      { t: 1_700_086_400, o: 900, h: 910, l: 890, c: 900 },
    ];
    const fx = [{ t: 1_700_086_400, c: 90 }];
    const out = applyHistoricalFx(bars, fx);
    assert.equal(out.missing, 1);
    assert.equal(out.bars.length, 1);
    assert.ok(Math.abs(out.bars[0].c - 10) < 0.001);
  });

  it("turns matched OHLC into one benchmark-relative series rebased at 100", () => {
    const stock = [
      { t: 1_700_000_000, o: 100, h: 110, l: 90, c: 100 },
      { t: 1_700_086_400, o: 105, h: 112, l: 100, c: 110 },
      { t: 1_701_000_000, o: 50, h: 55, l: 48, c: 52 },
    ];
    const bench = [
      { t: 1_700_000_000, o: 200, h: 206, l: 194, c: 200 },
      { t: 1_700_086_400, o: 206, h: 216, l: 200, c: 216 },
    ];
    const out = adjustOhlcToBenchmark(stock, bench, "day");
    assert.equal(out.dropped, 1);
    assert.equal(out.bars.length, 2);
    assert.ok(Math.abs(out.bars[0].c - 100) < 0.01);
    const want = (110 / 216) / (100 / 200) * 100;
    assert.ok(Math.abs(out.bars[1].c - want) < 0.05);
    assert.ok(out.bars[1].h >= out.bars[1].c && out.bars[1].l <= out.bars[1].o);
  });

  it("does not divide by a zero benchmark print", () => {
    const out = adjustOhlcToBenchmark(
      [{ t: 1_700_000_000, o: 10, h: 11, l: 9, c: 10 }],
      [{ t: 1_700_000_000, o: 0, h: 1, l: 1, c: 1 }],
      "day",
    );
    assert.equal(out.bars.length, 0);
  });
});

describe("sector index mapping", () => {
  it("uses the real sector index and refuses a generic substitute", () => {
    assert.equal(sectorIndex("IT")?.name, "Nifty IT");
    assert.equal(sectorIndex("Healthcare")?.symbol, "^CNXPHARMA");
    assert.equal(sectorIndex("Auto")?.name, "Nifty Auto");
    assert.equal(sectorIndex("Chemicals"), null);
    assert.equal(sectorIndex("Telecom"), null);
    assert.notEqual(sectorIndex("Materials")?.name, "Nifty 500");
  });
});

describe("drawing history", () => {
  it("undo restores the previous state, redo puts it back", () => {
    let h = histInit([{ id: "a" }]);
    h = histPush(h, [{ id: "a" }, { id: "b" }]);
    h = histPush(h, [{ id: "b" }]);
    const u = histUndo(h);
    assert.ok(u);
    assert.deepEqual(u!.shapes.map((s) => s.id), ["a", "b"]);
    const r = histRedo(u!.hist);
    assert.deepEqual(r!.shapes.map((s) => s.id), ["b"]);
  });
});
