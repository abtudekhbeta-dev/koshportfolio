import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage, peDiscrepancy } from "./coverage.ts";
import type { Fundamentals } from "./types.ts";

function fund(p: Partial<Fundamentals>): Fundamentals {
  return {
    symbol: "X",
    searchId: "x",
    name: "X",
    industry: "",
    ceo: "",
    founded: "",
    summary: "",
    mcapCr: null,
    pe: null,
    pb: null,
    roe: null,
    de: null,
    divYield: null,
    eps: null,
    book: null,
    face: null,
    industryPe: null,
    salesYoY: null,
    profitYoY: null,
    sales: [],
    profits: [],
    qSales: [],
    qProfits: [],
    netWorth: [],
    qNetWorth: [],
    shareholding: [],
    promoters: null,
    fii: null,
    dii: null,
    roce: null,
    peg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    website: null,
    interestCover: null,
    ebitda: [],
    cfo: [],
    qCfo: [],
    cfoPat: null,
    ...p,
  };
}

describe("data coverage", () => {
  it("does not invent cash-flow or historical P/E buckets", () => {
    const c = buildCoverage({
      price: 100,
      fund: fund({
        pe: 18,
        roce: 22,
        promoters: 55,
        salesYoY: 12,
        sales: [{ period: "2024", value: 100 }, { period: "2025", value: 120 }],
      }),
      peerCount: 3,
    });
    assert.equal(c.buckets.find((b) => b.id === "cash"), undefined);
    assert.equal(c.buckets.find((b) => b.id === "histVal"), undefined);
    assert.ok(c.nOk >= 5);
    assert.equal(c.buckets.find((b) => b.id === "financials")?.ok, true);
    assert.equal(c.nAll, 6);
  });

  it("marks insufficient when almost nothing is on file", () => {
    const c = buildCoverage({ price: null, fund: null, peerCount: 0 });
    assert.equal(c.level, "insufficient");
    assert.equal(c.nOk, 0);
  });

  it("is partial when only a few buckets exist", () => {
    const c = buildCoverage({
      price: 100,
      fund: fund({ pe: 18, roce: 22, promoters: 51 }),
      peerCount: 0,
    });
    assert.equal(c.level, "partial");
    assert.equal(c.buckets.find((b) => b.id === "cash"), undefined);
    assert.equal(c.buckets.find((b) => b.id === "histVal"), undefined);
  });

  it("has no cash-flow bucket even when CFO printed — that print lives on earnings quality", () => {
    const c = buildCoverage({
      price: 10,
      fund: fund({ cfoPat: 1.1, cfo: [{ period: "2024", value: 80 }] }),
      peerCount: 0,
    });
    assert.equal(c.buckets.find((b) => b.id === "cash"), undefined);
    assert.equal(c.buckets.find((b) => b.id === "price")?.ok, true);
  });
});

describe("P/E discrepancy", () => {
  it("stays quiet when the two prints agree", () => {
    assert.equal(peDiscrepancy(18, 18.4), null);
    assert.equal(peDiscrepancy(24.2, 25.9), null);
    assert.equal(peDiscrepancy(null, 20), null);
  });

  it("flags a material gap without picking a silent winner", () => {
    const d = peDiscrepancy(12, 22);
    assert.ok(d);
    assert.equal(d?.metric, "P/E");
    assert.ok(d?.note.includes("differs"));
  });
});
