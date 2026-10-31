import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankGrowth, scoreGrowthRow } from "./growth-value.ts";
import type { ScreenRow } from "./types.ts";

function row(patch: Partial<ScreenRow> & { symbol: string }): ScreenRow {
  return {
    symbol: patch.symbol,
    name: patch.name || patch.symbol,
    sector: patch.sector || "Chemicals",
    price: patch.price ?? 100,
    changePct: 0,
    high52: 120,
    low52: 80,
    offHigh: null,
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
    pe: "pe" in patch ? patch.pe ?? null : 20,
    pb: "pb" in patch ? patch.pb ?? null : 3,
    roe: "roe" in patch ? patch.roe ?? null : 18,
    de: "de" in patch ? patch.de ?? null : 0.2,
    mcapCr: patch.mcapCr ?? 10000,
    divYield: null,
    eps: 5,
    book: 30,
    salesYoY: "salesYoY" in patch ? patch.salesYoY ?? null : 12,
    profitYoY: "profitYoY" in patch ? patch.profitYoY ?? null : 15,
    promoters: null,
    roce: "roce" in patch ? patch.roce ?? null : 20,
    peg: null,
    opm: null,
    salesCagr3: "salesCagr3" in patch ? patch.salesCagr3 ?? null : 16,
    profitCagr3: "profitCagr3" in patch ? patch.profitCagr3 ?? null : 18,
    profitCagr5: patch.profitCagr5 ?? null,
    interestCover: "interestCover" in patch ? patch.interestCover ?? null : 8,
    cfoPat: "cfoPat" in patch ? patch.cfoPat ?? null : 0.9,
    pledge: patch.pledge ?? 0,
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

describe("undervalued growth", () => {
  it("uses a trailing peer median and ignores negative earnings in that median", () => {
    const universe = [
      row({ symbol: "A", pe: 10 }),
      row({ symbol: "B", pe: 20 }),
      row({ symbol: "C", pe: 30 }),
      row({ symbol: "D", pe: 40 }),
      row({ symbol: "LOSS", pe: -5 }),
    ];
    const scored = scoreGrowthRow(universe[0], universe);
    assert.equal(scored.peerPe, 25);
    assert.equal(scored.peerCount, 4);
    assert.ok((scored.discount || 0) > 0);
    const loss = scoreGrowthRow(universe[4], universe);
    assert.equal(loss.discount, null);
    assert.ok(loss.traps.some((t) => t.id === "loss"));
  });

  it("does not score a lender off P/E when P/B peers exist", () => {
    const universe = [1, 2, 3, 4].map((n) =>
      row({ symbol: "B" + n, name: "Bank " + n, sector: "Banks", pe: 8 + n, pb: n }),
    );
    const scored = scoreGrowthRow(universe[0], universe);
    assert.equal(scored.lens, "bank");
    assert.equal(scored.peerPe, null);
    assert.equal(scored.peerPb, 2.5);
  });

  it("flags a value trap when profit is falling and cash is weak", () => {
    const one = row({ symbol: "TRAP", profitYoY: -30, profitCagr3: null, cfoPat: 0.2, de: 2 });
    const scored = scoreGrowthRow(one, [one, row({ symbol: "B" }), row({ symbol: "C" }), row({ symbol: "D" }), row({ symbol: "E" })]);
    assert.ok(scored.traps.some((t) => t.id === "profit-down"));
    assert.ok(scored.traps.some((t) => t.id === "cash"));
    assert.ok(scored.traps.some((t) => t.id === "debt"));
    assert.ok(scored.parts.every((p) => p.note.length > 0));
  });

  it("leaves the score blank when too little is known", () => {
    const thin = row({
      symbol: "THIN",
      pe: null,
      pb: null,
      roe: null,
      roce: null,
      de: null,
      salesYoY: null,
      salesCagr3: null,
      profitYoY: null,
      profitCagr3: null,
      interestCover: null,
      cfoPat: null,
    });
    const scored = rankGrowth([thin])[0];
    assert.equal(scored.score, null);
  });
});
