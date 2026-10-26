import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publishExtracts } from "./rrg-store.ts";

const source = {
  dataset: "fixture",
  url: "fixture",
  licence: "MIT",
  adjustment: "raw-unadjusted" as const,
  files: [],
  note: "fixture",
};

describe("public extract publish", () => {
  it("keeps a gap and does not join a later symbol", () => {
    const published = publishExtracts([
      { symbol: "TATAMOTORS", rows: [{ date: "2024-01-02", close: 10 }, { date: "2024-01-05", close: 11 }], source },
      { symbol: "TMPV", rows: [{ date: "2024-01-08", close: 12 }], source },
    ]);
    const motors = published.series.find((series) => series.symbol === "TATAMOTORS");
    assert.deepEqual(motors?.rows.map((row) => row.date), ["2024-01-02", "2024-01-05"]);
    assert.deepEqual(motors?.quality.weekdayGaps, ["2024-01-03", "2024-01-04"]);
    assert.equal(published.series.some((series) => series.symbol === "TMPV" && series.rows.length === 1), true);
  });

  it("rejects a symbol when the same date has two closes", () => {
    const published = publishExtracts([{ symbol: "RELIANCE", rows: [{ date: "2024-01-02", close: 10 }, { date: "2024-01-02", close: 11 }], source }]);
    assert.equal(published.series.length, 0);
    assert.match(published.failures[0].error, /two closes/);
  });
});
