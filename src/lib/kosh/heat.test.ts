import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { heatGroups, isOtherSector } from "./heat.ts";
import type { ScreenRow } from "./types.ts";

function row(symbol: string, sector: string, changePct: number): ScreenRow {
  return {
    symbol,
    name: symbol,
    sector,
    price: 100,
    changePct,
    high52: 120,
    low52: 80,
    offHigh: -10,
    ret1m: null,
    ret3m: null,
    ret1y: null,
    vol: 0,
    volAvg: 0,
    volRatio: null,
    rsi: null,
    above50: null,
    above200: null,
    macdHist: null,
    bbPos: null,
    nr7: null,
    gapPct: null,
    above21: null,
    pe: null,
    pb: null,
    roe: null,
    de: null,
    mcapCr: null,
    divYield: null,
    eps: null,
    book: null,
    salesYoY: null,
    profitYoY: null,
    promoters: null,
    roce: null,
    peg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    retest: null,
    retestLevel: null,
    athRetest: null,
    fii: null,
    fiiPrev: null,
    fiiDelta: null,
    dii: null,
    diiPrev: null,
    diiDelta: null,
    shLabel: null,
    vcp: null,
    vcpBreak: null,
    vcpN: null,
    vcpLastPct: null,
    vcpDays: null,
    vcpVolX: null,
    vcpPivot: null,
  };
}

describe("heat groups", () => {
  it("collapses Other by default and caps it by |move|", () => {
    const rows = [
      row("A", "Banks", 1),
      row("B", "Other", 8),
      row("C", "Other", -0.2),
      ...Array.from({ length: 45 }, (_, i) => row("X" + i, "Other", i % 2 ? 0.1 : -0.1)),
    ];
    const g = heatGroups(rows, 40);
    const other = g.find((x) => x.sector === "Other");
    const banks = g.find((x) => x.sector === "Banks");
    assert.equal(isOtherSector("Other"), true);
    assert.equal(other?.collapseDefault, true);
    assert.equal(banks?.collapseDefault, false);
    assert.ok((other?.total || 0) > 40);
    assert.equal(other?.rows.length, 40);
    assert.equal(other?.rows[0].symbol, "B");
    assert.ok((other?.hidden || 0) > 0);
  });
});
