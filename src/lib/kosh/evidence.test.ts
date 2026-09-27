import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFieldReport, reconcileCandidates, reconcileFundamentals, screenMetricGap, toCrore } from "./evidence.ts";
import type { Fundamentals } from "./types.ts";

function fund(p: Partial<Fundamentals> = {}): Fundamentals {
  return {
    symbol: "X",
    searchId: "x",
    name: "X",
    industry: "",
    ceo: "",
    founded: "",
    summary: "",
    mcapCr: null,
    pe: 18,
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
    sales: [{ period: "Mar 2024", value: 100 }],
    profits: [],
    qSales: [],
    qProfits: [],
    netWorth: [],
    qNetWorth: [],
    shareholding: [],
    promoters: 50,
    fii: null,
    dii: null,
    roce: 22.4,
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

describe("toCrore", () => {
  it("treats ₹100 billion and ₹10,000 crore as the same unit", () => {
    const a = toCrore(10000, "crore");
    const b = toCrore(100, "INR billion");
    assert.equal(a, 10000);
    assert.equal(b, 10000);
  });

  it("scales raw rupees above one crore", () => {
    assert.equal(toCrore(1e9, "INR"), 100);
  });
});

describe("reconcileCandidates", () => {
  it("picks the filing over the card when they disagree and keeps the alternative", () => {
    const got = reconcileCandidates([
      { value: 22.4, source: "Company card", rank: "structured-provider" },
      { value: 22.8, source: "NSE filing", rank: "exchange-filing" },
    ]);
    assert.equal(got.value, 22.8);
    assert.equal(got.status, "conflicting");
    assert.equal(got.alt, 22.4);
    assert.equal(got.source, "NSE filing");
  });

  it("does not treat a missing value as zero", () => {
    const got = reconcileCandidates([]);
    assert.equal(got.value, null);
    assert.equal(got.status, "unavailable");
  });
});

describe("reconcileFundamentals", () => {
  it("lets the filing win on ROCE and keeps card P/E", () => {
    const out = reconcileFundamentals(fund({ roce: 22.4, pe: 18 }), {
      roce: 22.8,
      pe: 99,
      opm: 18.2,
      sales: [
        { period: "Mar 2023", value: 80 },
        { period: "Mar 2024", value: 111 },
      ],
    });
    assert.equal(out.roce, 22.8);
    assert.equal(out.pe, 18);
    assert.equal(out.opm, 18.2);
    assert.equal(out.sales.find((p) => p.period === "Mar 2024")?.value, 111);
    assert.equal(out.sales.find((p) => p.period === "Mar 2023")?.value, 80);
    assert.equal(out.provenance?.fields.roce?.status, "conflicting");
    assert.equal(out.provenance?.fields.roce?.alt, 22.4);
  });
});

describe("buildFieldReport", () => {
  it("lists missing metrics instead of calling them covered", () => {
    const report = buildFieldReport(fund());
    const roce = report.lines.find((l) => l.id === "roce");
    const cover = report.lines.find((l) => l.id === "interestCover");
    assert.equal(roce?.status, "verified");
    assert.equal(cover?.status, "unavailable");
    assert.match(cover?.reason || "", /Not found/);
    assert.ok(report.counts.unavailable > 0);
  });
});

describe("screenMetricGap", () => {
  it("refuses a silent substitute for free cash flow yield", () => {
    const gap = screenMetricGap("free cash flow yield above 5");
    assert.ok(gap);
    assert.match(gap!.message, /not currently a supported/);
    assert.match(gap!.message, /CFO\/PAT/);
  });

  it("accepts an explicit closest-field choice", () => {
    assert.equal(screenMetricGap("free cash flow yield — use CFO/PAT instead"), null);
  });

  it("does not flag a supported ROCE screen", () => {
    assert.equal(screenMetricGap("ROCE above 15 and debt under 1"), null);
  });
});
