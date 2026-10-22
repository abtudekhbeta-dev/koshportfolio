import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregate, buildDays, findAnalogues, flowVerdict } from "./market-flows.ts";

describe("market flows", () => {
  it("joins closes and leaves a missing print null", () => {
    const days = buildDays(
      [
        { date: "2026-06-05", fiiNet: -10, diiNet: 4 },
        { date: "2026-06-08", fiiNet: 2, diiNet: -1 },
      ],
      [{ date: "2026-06-05", close: 100 }],
    );
    assert.equal(days[0].nifty, 100);
    assert.equal(days[1].nifty, null);
  });

  it("sums a week and uses the prior close for the index return", () => {
    const days = buildDays(
      [
        { date: "2026-06-08", fiiNet: -100, diiNet: 40 },
        { date: "2026-06-09", fiiNet: -50, diiNet: 10 },
      ],
      [
        { date: "2026-06-05", close: 100 },
        { date: "2026-06-08", close: 98 },
        { date: "2026-06-09", close: 96 },
      ],
    );
    const bars = aggregate(days, [{ date: "2026-06-05", close: 100 }, { date: "2026-06-08", close: 98 }, { date: "2026-06-09", close: 96 }], "weekly", "2026-06-20");
    assert.equal(bars.length, 1);
    assert.equal(bars[0].sessions, 2);
    assert.equal(bars[0].fiiNet, -150);
    assert.equal(bars[0].partial, false);
    assert.ok(Math.abs((bars[0].indexReturn || 0) - -4) < 0.01);
  });

  it("describes offsetting flows without calling them the cause", () => {
    const verdict = flowVerdict({
      key: "2026-10-21",
      label: "2026-10-21",
      start: "2026-10-21",
      end: "2026-10-21",
      sessions: 1,
      partial: false,
      fiiNet: -4000,
      diiNet: 5000,
      indexStart: 100,
      indexEnd: 98,
      indexReturn: -2,
    });
    assert.equal(verdict.offsetting, true);
    assert.equal(verdict.fii, "selling");
    assert.equal(verdict.dii, "buying");
    assert.match(verdict.text, /does not say who caused/);
  });

  it("refuses analogues on a short file", () => {
    const days = buildDays(
      Array.from({ length: 40 }, (_, i) => ({ date: `2026-06-${String(i + 1).padStart(2, "0")}`, fiiNet: -100, diiNet: 80 })),
      [],
    );
    const found = findAnalogues(days);
    assert.equal(found.ok, false);
  });
});
