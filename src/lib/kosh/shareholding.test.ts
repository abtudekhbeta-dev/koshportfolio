import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatShPeriod, sortShareholding, stakeDelta, stakeUp } from "./shareholding.ts";

describe("shareholding", () => {
  it("sorts quarters by date, not alphabet", () => {
    const rows = [
      { period: "Jun 2026", promoters: 50, fii: 18, dii: 12 },
      { period: "Dec 2025", promoters: 50, fii: 16, dii: 11 },
      { period: "Mar 2026", promoters: 50, fii: 17, dii: 11.5 },
    ];
    const s = sortShareholding(rows);
    assert.equal(s[0].period, "Dec 2025");
    assert.equal(s[2].period, "Jun 2026");
  });

  it("delta is latest minus previous, with a readable quarter pair", () => {
    const d = stakeDelta([
      { period: "Mar 2026", promoters: 50, fii: 17.2, dii: 11.0 },
      { period: "Jun 2026", promoters: 50, fii: 18.5, dii: 10.4 },
    ]);
    assert.ok(d);
    assert.equal(d!.fiiDelta?.toFixed(1), "1.3");
    assert.equal(d!.diiDelta?.toFixed(1), "-0.6");
    assert.equal(d!.label, "Jun ’26 vs Mar ’26");
    assert.equal(stakeUp(d), true);
  });

  it("drops a name with only one quarter", () => {
    assert.equal(stakeDelta([{ period: "Jun 2026", promoters: 50, fii: 18, dii: 12 }]), null);
    assert.equal(stakeUp(null), false);
  });

  it("does not count a print as a rise when FII and DII both fell", () => {
    const d = stakeDelta([
      { period: "Mar 2026", promoters: 50, fii: 20, dii: 12 },
      { period: "Jun 2026", promoters: 50, fii: 19, dii: 11 },
    ]);
    assert.equal(stakeUp(d), false);
  });

  it("formats a month", () => {
    assert.equal(formatShPeriod("Mar 2026"), "Mar ’26");
  });
});
