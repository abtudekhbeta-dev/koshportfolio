import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildValuation, buildValuationModels, earningsQualityRead, impliedGrowthFromPe, justifiedPb, reconstructPeHistory, reverseImpliedCagr, yearEndClose } from "./valuation.ts";
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
    assert.ok(/insufficient/i.test(v.read) || v.read.length > 10);
    assert.equal(v.reverse.impliedCagr, null);
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
    assert.ok(/scenario/i.test(v.read));
    assert.equal(v.discount, 12);
    assert.ok(!/market'?s ask/i.test(v.read));
  });

  it("implied growth helper is PE / 1.5 and is not presented as a fact", () => {
    assert.equal(impliedGrowthFromPe(30), 20);
    assert.equal(impliedGrowthFromPe(null), null);
    const v = buildValuation({ price: 100, fund: fund({ eps: 5, pe: 20, profitCagr5: 10, industryPe: 18 }) });
    assert.ok(!/1\.5 PEG/i.test(v.read));
  });

  it("reverse valuation needs industry multiple — no invented exit", () => {
    const none = buildValuation({ price: 100, fund: fund({ eps: 8, profitCagr5: 12 }) });
    assert.equal(none.reverse.impliedCagr, null);
    assert.ok(/industry/i.test(none.reverse.body));
    const v = buildValuation({ price: 100, fund: fund({ eps: 8, industryPe: 16, profitCagr5: 12 }) });
    assert.ok(v.reverse.impliedCagr != null);
    assert.equal(v.reverse.exitPe, 16);
  });

  it("reverseImpliedCagr is algebra, not a forecast", () => {
    const g = reverseImpliedCagr(100, 5, 16, 5, 0.12);
    assert.ok(g != null && Number.isFinite(g));
    assert.equal(reverseImpliedCagr(100, null, 16), null);
    assert.equal(reverseImpliedCagr(100, 5, null), null);
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

function sec(iso: string) {
  return Math.floor(Date.parse(iso) / 1000);
}

describe("reconstructed P/E", () => {
  it("scales EPS by PAT and uses the year-end price", () => {
    const bars = [
      { t: sec("2022-03-31T15:00:00+05:30"), c: 200 },
      { t: sec("2023-03-30T15:00:00+05:30"), c: 450 },
      { t: sec("2024-03-28T15:00:00+05:30"), c: 400 },
    ];
    const hist = reconstructPeHistory({
      profits: [
        { period: "2022", value: 100 },
        { period: "2023", value: 150 },
        { period: "2024", value: 200 },
      ],
      currentEps: 20,
      bars,
    });
    assert.equal(hist.length, 3);
    const y22 = hist.find((p) => p.year === 2022);
    const y23 = hist.find((p) => p.year === 2023);
    const y24 = hist.find((p) => p.year === 2024);
    assert.equal(y24?.eps, 20);
    assert.equal(y23?.eps, 15);
    assert.equal(y22?.eps, 10);
    assert.equal(y23?.pe, 30);
    assert.equal(y24?.pe, 20);
    assert.equal(yearEndClose(bars, 2023, 3), 450);
  });

  it("stays blank without profits or EPS rather than inventing a series", () => {
    assert.equal(reconstructPeHistory({ profits: [], currentEps: 10, bars: [] }).length, 0);
    assert.ok(reconstructPeHistory({ profits: [{ period: "2024", value: 100 }], currentEps: null, bars: [] })[0].pe == null);
  });
});

describe("A+ / C / D models", () => {
  it("A+ is Cheaper when P/E is well below industry and never says undervalued", () => {
    const bars = [
      { t: sec("2023-03-30T15:00:00+05:30"), c: 450 },
      { t: sec("2024-03-28T15:00:00+05:30"), c: 400 },
    ];
    const pack = buildValuationModels({
      price: 400,
      bars,
      fund: fund({
        pe: 20,
        industryPe: 28,
        eps: 20,
        pb: 4,
        roe: 18,
        profitCagr5: 12,
        profits: [
          { period: "2023", value: 150 },
          { period: "2024", value: 200 },
        ],
      }),
    });
    const a = pack.models.find((m) => m.id === "A+");
    const c = pack.models.find((m) => m.id === "C");
    const d = pack.models.find((m) => m.id === "D");
    assert.equal(a?.word, "Cheaper");
    assert.ok(a?.body.includes("EPS"));
    assert.ok(pack.simple.body.includes("When P/E was"));
    assert.ok(c);
    assert.ok(d);
    for (const m of pack.models) {
      assert.ok(!/undervalued|overvalued|buy call to/i.test(m.body + m.word + m.title));
      assert.ok(["Cheaper", "About right", "Expensive", "Not enough data"].includes(m.word));
    }
  });

  it("C is Expensive when the price is paying for more growth than delivered", () => {
    const pack = buildValuationModels({
      price: 400,
      fund: fund({ eps: 8, industryPe: 16, profitCagr5: 4, pe: 50 }),
    });
    const c = pack.models.find((m) => m.id === "C")!;
    assert.equal(c.word, "Expensive");
    assert.ok(/paying for/i.test(c.body));
    assert.ok(/delivered/i.test(c.body));
  });

  it("D uses justified P/B from ROE and stays blank without ROE", () => {
    assert.ok(justifiedPb(18, 0, 12) != null);
    const none = buildValuationModels({ price: 100, fund: fund({ pb: 3 }) });
    assert.equal(none.models.find((m) => m.id === "D")?.word, "Not enough data");
    const pack = buildValuationModels({
      price: 100,
      fund: fund({ pb: 4, roe: 18, profitCagr5: 0 }),
    });
    const d = pack.models.find((m) => m.id === "D")!;
    assert.equal(d.word, "Expensive");
    assert.ok(/justified/i.test(d.body));
    assert.ok(!/undervalued/i.test(d.body));
  });

  it("C is Not enough data without an industry multiple", () => {
    const pack = buildValuationModels({ price: 100, fund: fund({ eps: 8, profitCagr5: 12 }) });
    assert.equal(pack.models.find((m) => m.id === "C")?.word, "Not enough data");
  });
});
