import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eodPositions, rangeStats, slicePath } from "./ledger.ts";
import type { PathPoint, TradeLine } from "./types.ts";

function t(side: 1 | -1, qty: number, date: string, price = 100, src?: number): TradeLine {
  return { symbol: "INFY", name: "Infosys", qty, price, date, side, src };
}

function point(day: string, unit: number, wealth: number, same = unit): PathPoint {
  return { t: 0, day, wealth, sameCash: wealth, unit, sameUnit: same, covered: 1, names: 1 };
}

describe("end-of-day ledger", () => {
  it("buys, partial sells, and a full exit then a reopen", () => {
    const trades = [t(1, 10, "2024-01-02", 100, 1), t(-1, 4, "2024-01-03", 110, 2), t(-1, 6, "2024-01-04", 120, 3), t(1, 2, "2024-01-08", 90, 4)];
    assert.equal(eodPositions(trades, "2024-01-02").lines[0]?.qty, 10);
    assert.equal(eodPositions(trades, "2024-01-03").lines[0]?.qty, 6);
    assert.equal(eodPositions(trades, "2024-01-04").lines.filter((l) => l.qty > 0).length, 0);
    assert.equal(eodPositions(trades, "2024-01-08").lines[0]?.qty, 2);
  });

  it("uses FIFO and does not invent shares when a sell is larger than the book", () => {
    const book = eodPositions([t(1, 5, "2024-01-02", 10, 1), t(1, 5, "2024-01-02", 30, 2), t(-1, 12, "2024-01-03", 20, 3)], "2024-01-03");
    assert.equal(book.lines.find((l) => l.qty > 0), undefined);
    assert.match(book.warnings.join(" "), /sold 2 more/);
  });

  it("same-day sells follow file order, not a guessed clock", () => {
    const book = eodPositions([t(1, 10, "2024-01-02", 10, 1), t(-1, 3, "2024-01-02", 11, 2)], "2024-01-02");
    assert.equal(book.lines[0]?.qty, 7);
  });

  it("slices a custom window on session dates and keeps indexed return separate from rupees", () => {
    const nav = [point("2024-01-02", 100, 1000), point("2024-02-01", 110, 1500), point("2024-03-01", 90, 1200, 105)];
    const sliced = slicePath(nav, "CUSTOM", { start: "2024-01-15", end: "2024-03-15" });
    assert.equal(sliced.start, "2024-02-01");
    assert.equal(sliced.end, "2024-03-01");
    const stats = rangeStats(sliced.rows);
    assert.ok(stats.twr != null && Math.abs(stats.twr - ((90 / 110 - 1) * 100)) < 1e-6);
    assert.ok(stats.bench != null && Math.abs(stats.bench - ((105 / 110 - 1) * 100)) < 1e-6);
    assert.ok(stats.maxDd != null && stats.maxDd < 0);
  });
});
