import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bookXirr, xirrFromFlows } from "./xirr.ts";

describe("XIRR", () => {
  it("finds about 10% on a one-year doubling of a 10% gain", () => {
    const t0 = Date.parse("2024-01-01T00:00:00Z");
    const t1 = Date.parse("2025-01-01T00:00:00Z");
    const rate = xirrFromFlows([
      { t: t0, v: -1000 },
      { t: t1, v: 1100 },
    ]);
    assert.ok(rate != null && Math.abs(rate - 10) < 0.5, String(rate));
  });

  it("returns null when cash flows never change sign", () => {
    const t0 = Date.parse("2024-01-01T00:00:00Z");
    const t1 = Date.parse("2025-01-01T00:00:00Z");
    assert.equal(
      xirrFromFlows([
        { t: t0, v: -100 },
        { t: t1, v: -50 },
      ]),
      null,
    );
    const book = bookXirr([{ date: "2024-01-01", qty: 1, avg: 100, px: 0, value: 0 }], true, t1);
    assert.equal(book.xirr, null);
    assert.ok(book.note);
  });
});
