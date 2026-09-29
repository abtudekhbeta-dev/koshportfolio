import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toCrore } from "./evidence.ts";
import { cfoToPat, ratio, seriesCagr } from "./formulas.ts";
import { aggregatePe } from "./portfolio-stats.ts";

describe("series CAGR", () => {
  it("uses the real year span when every print is positive", () => {
    const hit = seriesCagr(
      [
        { period: "FY21", value: 100 },
        { period: "FY22", value: 110 },
        { period: "FY23", value: 121 },
        { period: "FY24", value: 133.1 },
      ],
      3,
    );
    assert.equal(hit.status, "derived");
    assert.ok(hit.value != null && Math.abs(hit.value - 10) < 0.2, String(hit.value));
  });

  it("does not drop a zero year and compress the span", () => {
    const hit = seriesCagr(
      [
        { period: "FY21", value: 100 },
        { period: "FY22", value: 0 },
        { period: "FY23", value: 40 },
        { period: "FY24", value: 80 },
      ],
      3,
    );
    assert.equal(hit.value, null);
    assert.match(hit.methodology, /crossed zero/);
  });

  it("refuses a short history instead of pretending it is a 5-year CAGR", () => {
    const hit = seriesCagr(
      [
        { period: "FY23", value: 100 },
        { period: "FY24", value: 110 },
      ],
      5,
    );
    assert.equal(hit.status, "unavailable");
    assert.match(hit.methodology, /not compressed/i);
  });
});

describe("ratios and aggregate P/E", () => {
  it("names the missing input instead of returning zero", () => {
    const hit = ratio(10, null, "OPM");
    assert.equal(hit.value, null);
    assert.ok(hit.missing.length > 0);
  });

  it("refuses CFO/PAT when the periods differ", () => {
    const hit = cfoToPat([{ period: "FY24", value: 50 }], [{ period: "FY23", value: 40 }]);
    assert.equal(hit.value, null);
    assert.match(hit.methodology, /periods differ/);
  });

  it("aggregate P/E is value over earnings, not the average of the P/Es", () => {
    const hit = aggregatePe([
      { weight: 50, pe: 10 },
      { weight: 50, pe: 20 },
    ]);
    assert.ok(hit.value != null);
    assert.ok(Math.abs(hit.value! - 100 / 7.5) < 1e-9);
    assert.notEqual(Number(hit.value!.toFixed(4)), 15);
  });
});

describe("unit normalisation", () => {
  it("turns ₹100 billion into ₹10,000 crore", () => {
    assert.equal(toCrore(100, "billion"), 10_000);
    assert.equal(toCrore(10000, "crore"), 10_000);
  });
});
