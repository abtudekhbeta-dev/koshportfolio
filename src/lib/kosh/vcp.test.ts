import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectVcp } from "./vcp.ts";
import type { OhlcBar } from "./types.ts";

function bar(i: number, o: number, h: number, l: number, c: number, v: number): OhlcBar {
  return { t: 1_700_000_000 + i * 86400, o, h, l, c, v };
}

/** Rise, then 3 shrinking pullbacks, volume drying, close under the pivot. */
function formingVcp(): OhlcBar[] {
  const out: OhlcBar[] = [];
  let i = 0;
  let px = 100;
  for (; i < 50; i++) {
    px *= 1.008;
    out.push(bar(i, px * 0.995, px * 1.01, px * 0.99, px, 2_000_000));
  }
  const stages: { n: number; drop: number; bounce: number; vol: number }[] = [
    { n: 14, drop: 0.86, bounce: 0.985, vol: 1_600_000 },
    { n: 11, drop: 0.91, bounce: 0.99, vol: 1_100_000 },
    { n: 8, drop: 0.95, bounce: 0.995, vol: 700_000 },
  ];
  for (const s of stages) {
    const peak = px;
    for (let k = 0; k < s.n; k++) {
      const t = k / (s.n - 1);
      const c = peak * (1 - (1 - s.drop) * t);
      px = c;
      out.push(bar(i++, c * 0.998, Math.max(c * 1.008, c), c * 0.992, c, s.vol));
    }
    const low = px;
    const high = peak * s.bounce;
    for (let k = 0; k < s.n; k++) {
      const t = k / (s.n - 1);
      const c = low + (high - low) * t;
      px = c;
      out.push(bar(i++, c * 0.998, Math.max(c * 1.006, c), c * 0.994, c, s.vol * 0.9));
    }
  }
  for (let k = 0; k < 6; k++) {
    out.push(bar(i++, px * 0.998, px * 1.004, px * 0.996, px, 550_000));
  }
  return out;
}

describe("detectVcp", () => {
  it("flags a contracting base after an uptrend as forming, not a breakout", () => {
    const hit = detectVcp(formingVcp());
    assert.ok(hit, "expected a VCP");
    assert.equal(hit!.forming, true);
    assert.equal(hit!.breakout, false);
    assert.ok(hit!.n >= 2);
    assert.ok(hit!.lastPct <= 12.5);
  });

  it("flags a volume break of the pivot as breakout + VCP", () => {
    const src = formingVcp();
    const base = detectVcp(src);
    assert.ok(base);
    const last = src[src.length - 1];
    src.push(
      bar(
        src.length,
        last.c,
        base!.pivot * 1.03,
        last.c * 0.99,
        base!.pivot * 1.02,
        Math.max((last.v || 500_000) * 5, 4_000_000),
      ),
    );
    const hit = detectVcp(src);
    assert.ok(hit);
    assert.equal(hit!.breakout, true);
  });

  it("rejects chop with no prior trend", () => {
    const out: OhlcBar[] = [];
    for (let i = 0; i < 120; i++) {
      const c = 100 + Math.sin(i / 3) * 2;
      out.push(bar(i, c, c + 1, c - 1, c, 1_000_000));
    }
    assert.equal(detectVcp(out), null);
  });

  it("rejects a deep 50% base", () => {
    const out: OhlcBar[] = [];
    let px = 100;
    for (let i = 0; i < 40; i++) {
      px *= 1.01;
      out.push(bar(i, px, px * 1.01, px * 0.99, px, 2_000_000));
    }
    for (let i = 40; i < 90; i++) {
      px *= 0.985;
      out.push(bar(i, px, px * 1.01, px * 0.99, px, 2_000_000));
    }
    for (let i = 90; i < 120; i++) {
      out.push(bar(i, px, px * 1.01, px * 0.99, px, 1_000_000));
    }
    assert.equal(detectVcp(out), null);
  });
});
