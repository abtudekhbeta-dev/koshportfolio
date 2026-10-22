import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boardCounts, buildStockBoard, filterBoard, pageOf } from "./stock-board.ts";

const ports = [
  {
    id: "a",
    name: "Core",
    holdings: [
      { symbol: "TCS.NS", name: "TCS", qty: 2 },
      { symbol: "INFY", name: "Infosys", qty: 4 },
    ],
  },
  { id: "b", name: "Growth", holdings: [{ symbol: "tcs", name: "Tata Consultancy", qty: 1 }] },
];

describe("stock board", () => {
  it("unions holdings and the active watchlist once", () => {
    const rows = buildStockBoard({
      portfolios: ports,
      bookId: "all",
      watchSymbols: ["TCS.NS", "WIPRO"],
      quotes: [{ symbol: "TCS", price: 100, previousClose: 90, changePct: 11.11, name: "TCS" }],
      screens: [{ symbol: "INFY", price: 50, changePct: -1 }],
    });
    assert.equal(rows.length, 3);
    const tcs = rows.find((r) => r.symbol === "TCS");
    assert.equal(tcs?.qty, 3);
    assert.equal(tcs?.owned, true);
    assert.equal(tcs?.watched, true);
    assert.equal(tcs?.portfolios.length, 2);
    assert.equal(tcs?.value, 300);
    assert.equal(tcs?.source, "quote");
    assert.equal(tcs?.chg, 10);
    const infy = rows.find((r) => r.symbol === "INFY");
    assert.equal(infy?.source, "screen");
    assert.equal(infy?.chg, null);
    assert.equal(infy?.value, 200);
    const wipro = rows.find((r) => r.symbol === "WIPRO");
    assert.equal(wipro?.owned, false);
    assert.equal(wipro?.value, null);
    assert.equal(wipro?.last, null);
    const counts = boardCounts(rows);
    assert.equal(counts.all, 3);
    assert.equal(counts.owned, 2);
    assert.equal(counts.watch, 2);
  });

  it("limits ownership to the selected portfolio and does not drop the watchlist", () => {
    const rows = buildStockBoard({ portfolios: ports, bookId: "b", watchSymbols: ["WIPRO"] });
    assert.deepEqual(
      rows.map((r) => r.symbol),
      ["TCS", "WIPRO"],
    );
    assert.equal(rows.find((r) => r.symbol === "TCS")?.qty, 1);
    assert.equal(filterBoard(rows, { tab: "owned" }).length, 1);
    assert.equal(filterBoard(rows, { tab: "watch" })[0]?.symbol, "WIPRO");
    assert.equal(filterBoard(rows, { tab: "all", q: "wip" }).length, 1);
    assert.equal(filterBoard(rows, { tab: "all", membership: "both" }).length, 0);
  });

  it("pages the full set instead of dropping the tail", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ n: i }));
    const page = pageOf(rows, 2, 4);
    assert.equal(page.total, 10);
    assert.equal(page.rows.length, 4);
    assert.equal(page.from, 5);
    assert.equal(page.to, 8);
    assert.equal(pageOf(rows, 99, 4).page, 3);
  });

  it("does not pair the day's percent with a previous close from a different window", () => {
    const rows = buildStockBoard({
      portfolios: [{ id: "a", name: "Core", holdings: [{ symbol: "INFY", qty: 1 }] }],
      bookId: "all",
      watchSymbols: [],
      quotes: [{ symbol: "INFY", price: 1062.1, previousClose: 900, changePct: 4.13 }],
    });
    const infy = rows[0];
    const implied = 1062.1 - 1062.1 / 1.0413;
    assert.ok(infy.chg != null && Math.abs(infy.chg - implied) < 0.02);
    assert.equal(infy.chgPct, 4.13);
  });
});
