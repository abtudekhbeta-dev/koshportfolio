import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildValuation, earningsQualityRead, impliedGrowthFromPe } from "./valuation.ts";
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

describe("valuation", () => {
  it("does not invent cases without EPS and growth", () => {
    const v = buildValuation({ price: 100, fund: fund({ pe: 20 }) });
    assert.equal(v.cases.length, 0);
    assert.ok(v.missing.includes("positive EPS"));
    assert.ok(v.read.length > 10);
  });

  it("builds three cases from EPS + 5Y CAGR and never calls them a target", () => {
    const v = buildValuation({
      price: 100,
      fund: fund({ eps: 8, book: 40, pe: 12.5, industryPe: 18, profitCagr5: 15, peg: 0.8 }),
    });
    assert.equal(v.cases.length, 3);
    assert.equal(v.cases[0].label, "Bear");
    assert.equal(v.cases[1].label, "Base");
    assert.equal(v.cases[2].label, "Bull");
    assert.ok(v.graham != null && v.graham > 0);
    assert.ok(!/target/i.test(v.read));
    assert.equal(v.discount, 12);
  });

  it("implied growth is PE / 1.5", () => {
    assert.equal(impliedGrowthFromPe(30), 20);
    assert.equal(impliedGrowthFromPe(null), null);
  });
});

describe("earnings quality", () => {
  it("stays unavailable without cash flow", () => {
    const r = earningsQualityRead(fund({}));
    assert.equal(r.cfoPat, null);
    assert.equal(r.tag, "Unavailable");
  });

  it("flags weak cash when CFO/PAT is low", () => {
    const r = earningsQualityRead(fund({ cfoPat: 0.3, cfo: [{ period: "2024", value: 30 }], profits: [{ period: "2024", value: 100 }] }));
    assert.equal(r.tag, "Weak cash");
    assert.ok(r.body.includes("0.30"));
  });
});
