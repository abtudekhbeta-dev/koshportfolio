import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildHoldingHeat, displaySector, foldHeatTail, groupHeatSectors } from "./holding-heat.ts";

describe("holding heatmap", () => {
  it("leaves a missing price out of the weights", () => {
    const model = buildHoldingHeat([
      { bookId: "a", bookName: "A", symbol: "TCS.NS", name: "TCS", qty: 10, price: 100, changePct: 1 },
      { bookId: "a", bookName: "A", symbol: "INFY.NS", name: "Infosys", qty: 10, price: null, changePct: 4 },
      { bookId: "a", bookName: "A", symbol: "RELIANCE.NS", name: "Reliance", qty: 5, price: 200, changePct: -2 },
    ]);
    assert.equal(model.complete, false);
    assert.equal(model.unpriced.length, 1);
    assert.equal(model.unpriced[0].symbol, "INFY");
    assert.equal(model.tiles.length, 2);
    assert.equal(model.totalPriced, 2000);
    assert.ok(model.tiles.every((tile) => Math.abs(tile.weightOfPriced - 50) < 1e-9));
    assert.ok(model.tiles.every((tile) => tile.weightOfBook == null));
  });

  it("does not treat a missing day move as zero", () => {
    const model = buildHoldingHeat([{ bookId: "a", bookName: "A", symbol: "TCS", name: "TCS", qty: 2, price: 100, changePct: null }]);
    assert.equal(model.complete, true);
    assert.equal(model.tiles[0].value, 200);
    assert.equal(model.tiles[0].weightOfBook, 100);
    assert.equal(model.tiles[0].dayPct, null);
    assert.equal(model.tiles[0].dayAbs, null);
  });

  it("adds the same symbol across selected books", () => {
    const model = buildHoldingHeat([
      { bookId: "a", bookName: "Core", symbol: "TCS.NS", name: "TCS", qty: 1, price: 100, changePct: 10 },
      { bookId: "b", bookName: "Satellite", symbol: "TCS", name: "Tata Consultancy", qty: 3, price: 100, changePct: 10 },
    ]);
    assert.equal(model.tiles.length, 1);
    assert.equal(model.tiles[0].value, 400);
    assert.equal(model.tiles[0].name, "Tata Consultancy");
    assert.deepEqual(model.tiles[0].books, ["Core", "Satellite"]);
    assert.ok(Math.abs((model.tiles[0].dayPct || 0) - 10) < 1e-9);
    assert.ok(Math.abs((model.tiles[0].dayAbs || 0) - 40) < 1e-9);
  });

  it("withholds the day move when one line of a symbol has no print", () => {
    const model = buildHoldingHeat([
      { bookId: "a", bookName: "A", symbol: "TCS", name: "TCS", qty: 1, price: 100, changePct: 5 },
      { bookId: "b", bookName: "B", symbol: "TCS.BO", name: "TCS", qty: 1, price: 100, changePct: null },
    ]);
    assert.equal(model.tiles.length, 1);
    assert.equal(model.tiles[0].value, 200);
    assert.equal(model.tiles[0].dayPct, null);
  });

  it("folds the tail without dropping its weight", () => {
    const rows = Array.from({ length: 14 }, (_, index) => ({
      bookId: "a",
      bookName: "A",
      symbol: `N${index}`,
      name: `Name ${index}`,
      qty: 1,
      price: index === 0 ? 50 : 10,
      changePct: 1,
    }));
    const model = buildHoldingHeat(rows);
    const shown = foldHeatTail(model.tiles, 12);
    assert.equal(shown.length, 12);
    assert.equal(shown[11].key, "others");
    const weight = shown.reduce((sum, tile) => sum + tile.weightOfPriced, 0);
    assert.ok(Math.abs(weight - 100) < 1e-6);
    assert.equal(shown[11].others?.length, 3);
  });

  it("groups sectors by summed market value and keeps the members", () => {
    const model = buildHoldingHeat([
      { bookId: "a", bookName: "A", symbol: "RELIANCE", name: "Reliance", qty: 1, price: 200, changePct: 1, sector: "Energy" },
      { bookId: "a", bookName: "A", symbol: "ONGC", name: "ONGC", qty: 1, price: 100, changePct: -1, sector: "Energy" },
      { bookId: "a", bookName: "A", symbol: "TCS", name: "TCS", qty: 1, price: 100, changePct: 2, sector: "IT" },
    ]);
    const sectors = groupHeatSectors(model.tiles);
    const energy = sectors.find((tile) => tile.name === "Energy");
    assert.equal(energy?.value, 300);
    assert.equal(energy?.members?.length, 2);
    assert.ok(Math.abs((energy?.weightOfPriced || 0) - 75) < 0.01);
    assert.ok(Math.abs(sectors.reduce((sum, tile) => sum + tile.weightOfPriced, 0) - 100) < 0.01);
  });

  it("keeps a small holding as its own tile and does not invent a sector", () => {
    const model = buildHoldingHeat([
      { bookId: "a", bookName: "A", symbol: "BIG", name: "Big", qty: 1, price: 996, changePct: 1, sector: "IT" },
      { bookId: "a", bookName: "A", symbol: "TINY", name: "Tiny", qty: 1, price: 4, changePct: -1, sector: "Other" },
    ]);
    assert.equal(model.tiles.length, 2);
    assert.ok(Math.abs((model.tiles.find((tile) => tile.symbol === "TINY")?.weightOfPriced || 0) - 0.4) < 0.01);
    assert.equal(displaySector("Other"), "Unclassified");
    assert.equal(displaySector("IT"), "IT");
    assert.equal(displaySector(""), "Unclassified");
  });
});
