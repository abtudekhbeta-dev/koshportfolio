import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { historicalValuation } from "./hist-valuation.ts";

describe("historical valuation", () => {
  it("pairs year-end prices with a labelled P/E estimate and does not invent a filing series", () => {
    const pack = historicalValuation({
      price: 140,
      bars: [
        { t: Date.parse("2024-03-28T10:00:00Z"), c: 100 },
        { t: Date.parse("2025-03-28T10:00:00Z"), c: 140 },
      ],
      fund: {
        pe: 22,
        pb: 4,
        eps: 8,
        book: 40,
        industryPe: 28,
        mcapCr: 1400,
        profits: [
          { period: "2024", value: 100 },
          { period: "2025", value: 130 },
        ],
        netWorth: [
          { period: "2024", value: 300 },
          { period: "2025", value: 400 },
        ],
        sales: [
          { period: "2024", value: 500 },
          { period: "2025", value: 600 },
        ],
      },
      years: 5,
    });
    assert.equal(pack.years.length, 2);
    assert.equal(pack.years[1].profit, 130);
    assert.equal(pack.years[1].price, 140);
    assert.equal(pack.years[1].estEps, 8);
    assert.equal(pack.years[1].estPe, 17.5);
    assert.ok(Math.abs((pack.years[0].estEps || 0) - (8 * 100) / 130) < 1e-9);
    assert.ok(pack.years[0].estPe != null && pack.years[0].estPe > 0);
    assert.ok(pack.years[1].estPb != null && pack.years[1].estPb > 0);
    assert.equal(pack.years[1].estMcap, 1400);
    assert.ok(pack.years[1].estPs != null);
    assert.equal(pack.currentPe, 22);
    assert.match(pack.method, /not a filing/i);
    assert.ok(pack.missing.some((line) => /EV\/EBITDA/i.test(line)));
    assert.equal(pack.peMedian != null, true);
  });

  it("accepts chart timestamps in seconds", () => {
    const pack = historicalValuation({
      price: 140,
      bars: [{ t: Math.floor(Date.parse("2025-03-28T10:00:00Z") / 1000), c: 140 }],
      fund: {
        pe: 17.5,
        pb: null,
        eps: 8,
        book: null,
        industryPe: null,
        mcapCr: null,
        profits: [{ period: "2025", value: 130 }],
        netWorth: [],
        sales: [],
      },
      years: 5,
    });
    assert.equal(pack.years[0].price, 140);
    assert.equal(pack.years[0].estPe, 17.5);
  });

  it("leaves price and estimated P/E blank when the print is too far from the period end", () => {
    const pack = historicalValuation({
      price: 10,
      bars: [{ t: Date.parse("2020-01-02T10:00:00Z"), c: 50 }],
      fund: {
        pe: null,
        pb: null,
        eps: null,
        book: null,
        industryPe: null,
        mcapCr: null,
        profits: [{ period: "2025", value: 10 }],
        netWorth: [],
        sales: [],
      },
      years: 5,
    });
    assert.equal(pack.years[0].price, null);
    assert.equal(pack.years[0].estPe, null);
    assert.equal(pack.profitCagr, null);
  });

  it("limits the table to the selected window", () => {
    const profits = [2020, 2021, 2022, 2023, 2024, 2025].map((year) => ({ period: String(year), value: 100 + year }));
    const bars = profits.map((row) => ({ t: Date.parse(`${row.period}-03-28T10:00:00Z`), c: 100 }));
    const pack = historicalValuation({
      price: 100,
      bars,
      fund: { pe: 10, pb: null, eps: 10, book: null, industryPe: null, mcapCr: 1000, profits, netWorth: [], sales: [] },
      years: 3,
    });
    assert.equal(pack.years.length, 3);
    assert.equal(pack.years[0].label, "FY23");
    assert.equal(pack.years[2].label, "FY25");
  });
});
