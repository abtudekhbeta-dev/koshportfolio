import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { combineLines, boardLine, valueSpark, resolveCombine, nextCombine } from "./portfolio-board.ts";


describe("combined portfolios", () => {
  it("sums market value and does not treat a missing price as zero", () => {
    const totals = combineLines([
      boardLine({ symbol: "TCS", qty: 10, avg: 100, price: 110, changePct: 1 }),
      boardLine({ symbol: "INFY", qty: 5, avg: 20, price: null, changePct: null }),
    ]);
    assert.equal(totals.value, 1100);
    assert.equal(totals.unpriced, 1);
    assert.equal(totals.unreal, null);
  });

  it("uses the combined previous value for the day percent, not an average of percents", () => {
    const totals = combineLines([
      boardLine({ symbol: "AAA", qty: 1, avg: 100, price: 110, changePct: 10 }),
      boardLine({ symbol: "BBB", qty: 1, avg: 100, price: 90, changePct: -10 }),
    ]);
    assert.equal(totals.dayAbs, 11 - 9);
    assert.ok(Math.abs((totals.dayPct || 0) - (2 / 198) * 100) < 1e-9);
    assert.notEqual(totals.dayPct, 0);
  });

  it("omits invested capital when any cost is missing", () => {
    const totals = combineLines([
      boardLine({ symbol: "AAA", qty: 2, avg: 50, price: 60, changePct: 0 }),
      boardLine({ symbol: "BBB", qty: 1, avg: null, price: 10, changePct: 0 }),
    ]);
    assert.equal(totals.invested, null);
    assert.equal(totals.costMissing, 1);
    assert.equal(totals.value, 130);
  });

  it("counts positions separately from unique names", () => {
    const totals = combineLines([
      boardLine({ symbol: "TCS.NS", qty: 1, avg: 1, price: 2, changePct: 0 }),
      boardLine({ symbol: "TCS", qty: 1, avg: 1, price: 2, changePct: 0 }),
    ]);
    assert.equal(totals.positions, 2);
    assert.equal(totals.names, 1);
    assert.equal(totals.unreal, 2);
  });

  it("returns no sparkline when one holding has no history", () => {
    const bars = Array.from({ length: 10 }, (_, i) => ({ t: i, c: 100 + i }));
    assert.equal(valueSpark([{ symbol: "AAA", qty: 1 }, { symbol: "BBB", qty: 1 }], [{ symbol: "AAA", bars }]), null);
    const spark = valueSpark([{ symbol: "AAA", qty: 2 }], [{ symbol: "AAA", bars }]);
    assert.equal(spark?.length, 10);
    assert.equal(spark?.[0], 200);
  });

  it("treats a missing selection as every current portfolio, including one added later", () => {
    assert.deepEqual(resolveCombine(null, ["a", "b"]), ["a", "b"]);
    assert.deepEqual(resolveCombine(["a", "gone"], ["a", "b"]), ["a"]);
    assert.deepEqual(resolveCombine([], ["a"]), []);
  });

  it("returns to all-portfolios when a toggle covers every current book", () => {
    assert.deepEqual(nextCombine(null, ["a", "b"], "b"), ["a"]);
    assert.equal(nextCombine(["a"], ["a", "b"], "b"), null);
    assert.deepEqual(nextCombine([], ["a", "b"], "a"), ["a"]);
  });
});

