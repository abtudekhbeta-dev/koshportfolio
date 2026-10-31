import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { portfolioExposure, type ExposureHolding } from "./exposure.ts";

function row(patch: Partial<ExposureHolding>): ExposureHolding {
  return {
    symbol: patch.symbol || "AAA",
    name: patch.name || patch.symbol || "AAA",
    weight: patch.weight ?? 0,
    sector: patch.sector || "IT",
    cap: patch.cap || "Large",
    pe: patch.pe === undefined ? 20 : patch.pe,
    pb: patch.pb === undefined ? 4 : patch.pb,
    roe: patch.roe === undefined ? 18 : patch.roe,
    roce: patch.roce === undefined ? 16 : patch.roce,
    de: patch.de === undefined ? 0.2 : patch.de,
    salesCagr3: patch.salesCagr3 === undefined ? 15 : patch.salesCagr3,
    profitCagr3: patch.profitCagr3 === undefined ? 12 : patch.profitCagr3,
    ret1y: patch.ret1y === undefined ? 10 : patch.ret1y,
  };
}

describe("portfolio exposure", () => {
  it("uses earnings yield instead of an average of P/E ratios", () => {
    const pack = portfolioExposure([
      row({ symbol: "A", weight: 50, pe: 10 }),
      row({ symbol: "B", weight: 50, pe: 30 }),
    ]);
    assert.ok(Math.abs((pack.portfolioPe || 0) - 15) < 0.01);
    assert.equal(pack.peCoverage, 1);
  });

  it("excludes negative earnings and reports the missing weight", () => {
    const pack = portfolioExposure([
      row({ symbol: "A", weight: 25, pe: 10 }),
      row({ symbol: "B", weight: 25, pe: -4 }),
      row({ symbol: "C", weight: 50, pe: null }),
    ]);
    assert.equal(pack.portfolioPe != null && pack.portfolioPe > 0, true);
    assert.ok(Math.abs(pack.negativeEarningsWeight - 0.25) < 1e-9);
    assert.ok(Math.abs(pack.missingWeight - 0.5) < 1e-9);
    assert.ok(pack.peCoverage < 0.3);
  });

  it("reconciles top weights to the holdings", () => {
    const pack = portfolioExposure([
      row({ symbol: "A", weight: 40 }),
      row({ symbol: "B", weight: 30 }),
      row({ symbol: "C", weight: 20 }),
      row({ symbol: "D", weight: 10 }),
    ]);
    assert.equal(pack.largest?.symbol, "A");
    assert.ok(Math.abs(pack.top1 - 0.4) < 1e-9);
    assert.ok(Math.abs(pack.top5 - 1) < 1e-9);
    assert.equal(pack.sectors[0]?.label, "IT");
  });
});
