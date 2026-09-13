import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { holdingReturn } from "./holding-returns.ts";
import type { Bar } from "./types.ts";

function bars(from: string, start: number, n: number, step: number): Bar[] {
  const t0 = Date.parse(from + "T00:00:00Z") / 1000;
  const out: Bar[] = [];
  let px = start;
  for (let i = 0; i < n; i++) {
    out.push({ t: t0 + i * 86400, c: px });
    px *= 1 + step;
  }
  return out;
}

describe("holdingReturn", () => {
  it("is blank without a buy date or average", () => {
    const a = holdingReturn({ date: null, avg: 100, qty: 10, px: 120, value: 1200, unreal: 200, unrealPct: 20 });
    assert.equal(a.xirr, null);
    const b = holdingReturn({ date: "2025-01-15", avg: null, qty: 10, px: 120, value: 1200, unreal: 200, unrealPct: 20 });
    assert.equal(b.daysHeld, null);
  });

  it("counts days and beats the index when the name did more than Nifty", () => {
    const nifty = bars("2025-01-15", 100, 200, 0.0004);
    const r = holdingReturn({
      date: "2025-01-15",
      avg: 100,
      qty: 10,
      px: 130,
      value: 1300,
      unreal: 300,
      unrealPct: 30,
      niftyBars: nifty,
      totalUnreal: 1000,
      asOf: Date.parse("2025-07-15T00:00:00Z"),
    });
    assert.equal(r.daysHeld, 181);
    assert.ok(r.xirr != null && r.xirr > 0);
    assert.ok(r.vsNifty != null && r.vsNifty > 0);
    assert.equal(r.contrib, 30);
  });
});
