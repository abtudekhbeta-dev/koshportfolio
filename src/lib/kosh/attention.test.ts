import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAttention, withinDays } from "./attention.ts";

describe("near-term triggers dates", () => {
  it("treats NSE 18-Sep-2026 as that IST day", () => {
    const asOf = Date.parse("2026-09-16T10:00:00+05:30");
    assert.equal(withinDays("18-Sep-2026", 7, asOf), true);
    assert.equal(withinDays("01-Sep-2026", 7, asOf), false);
    assert.equal(withinDays("2026-09-18", 7, asOf), true);
  });

  it("carries Expected from a guessed result date", () => {
    const today = new Date().toISOString().slice(0, 10);
    const items = buildAttention({
      symbols: [{ symbol: "INFY", name: "Infosys", weight: 0.1 }],
      results: [
        {
          symbol: "INFY",
          name: "Infosys",
          date: today,
          purpose: "Financial Results",
          kind: "results",
          expected: true,
        },
      ],
      days: 7,
    });
    const hit = items.find((x) => x.symbol === "INFY");
    assert.ok(hit);
    assert.equal(hit?.expected, true);
  });
});
