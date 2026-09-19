import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFinRows, compactCr, formatFinPeriod, fullCr } from "./fin-series.ts";

describe("formatFinPeriod", () => {
  it("names a March year-end as FY", () => {
    assert.equal(formatFinPeriod("2025-03-31", "year"), "FY25");
    assert.equal(formatFinPeriod("2020-03-31T00:00:00.000Z", "year"), "FY20");
    assert.equal(formatFinPeriod("2022", "year"), "FY22");
  });
  it("names Indian fiscal quarters from month-end dates and Groww month keys", () => {
    assert.equal(formatFinPeriod("2024-06-30", "quarter"), "Q1 FY25");
    assert.equal(formatFinPeriod("2024-09-30", "quarter"), "Q2 FY25");
    assert.equal(formatFinPeriod("2024-12-31", "quarter"), "Q3 FY25");
    assert.equal(formatFinPeriod("2025-03-31", "quarter"), "Q4 FY25");
    assert.equal(formatFinPeriod("Jun '25", "quarter"), "Q1 FY26");
    assert.equal(formatFinPeriod("Dec '25", "quarter"), "Q3 FY26");
    assert.equal(formatFinPeriod("Mar '26", "quarter"), "Q4 FY26");
    assert.equal(formatFinPeriod("30-JUN-2026", "quarter"), "Q1 FY27");
    assert.equal(formatFinPeriod("31-Mar-2026", "year"), "FY26");
  });
});

describe("compactCr / fullCr", () => {
  it("keeps thousands readable and uses L only from a lakh crore", () => {
    assert.equal(fullCr(336961), "3,36,961");
    assert.equal(compactCr(336961), "3.37L");
    assert.equal(compactCr(70792), "70,792");
    assert.equal(compactCr(100000), "1L");
    assert.equal(compactCr(-1200), "−1,200");
  });
});

describe("buildFinRows", () => {
  it("drops a trailing stub quarter of zeros and keeps real history", () => {
    const sales = [
      { period: "2024-06-30", value: 80000 },
      { period: "2024-09-30", value: 85000 },
      { period: "2024-12-31", value: 90000 },
      { period: "2025-03-31", value: 95000 },
      { period: "2025-06-30", value: 0 },
    ];
    const profits = [
      { period: "2024-06-30", value: 18000 },
      { period: "2024-09-30", value: 19000 },
      { period: "2024-12-31", value: 20000 },
      { period: "2025-03-31", value: 21000 },
      { period: "2025-06-30", value: 0 },
    ];
    const rows = buildFinRows(sales, profits, "quarter");
    assert.equal(rows[rows.length - 1].label, "Q4 FY25");
    assert.ok(!rows.some((r) => r.sales === 0 && r.profit === 0));
    assert.equal(rows[0].label, "Q1 FY25");
  });

  it("orders Groww month keys by calendar, not alphabet", () => {
    const sales = [
      { period: "Dec '25", value: 90000 },
      { period: "Jun '25", value: 80000 },
      { period: "Mar '26", value: 95000 },
      { period: "Sep '25", value: 85000 },
    ];
    const profits = sales.map((x) => ({ period: x.period, value: x.value / 5 }));
    const rows = buildFinRows(sales, profits, "quarter");
    assert.deepEqual(rows.map((r) => r.label), ["Q1 FY26", "Q2 FY26", "Q3 FY26", "Q4 FY26"]);
  });
});
