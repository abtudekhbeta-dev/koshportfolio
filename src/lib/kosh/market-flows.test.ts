import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregate, buildDays, findAnalogues, flowVerdict, mergeFlows, withMonthTotals } from "./market-flows.ts";
import { buildResearch } from "./flow-research.ts";

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
    assert.equal(bars[0].indexEnd, 96);
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
    assert.match(verdict.text, /\bFII\b/);
    assert.doesNotMatch(verdict.text, /FII\/FPI/);
    assert.equal(verdict.provisional, true);
  });

  it("refuses analogues on a short file", () => {
    const days = buildDays(
      Array.from({ length: 40 }, (_, i) => ({ date: `2026-06-${String(i + 1).padStart(2, "0")}`, fiiNet: -100, diiNet: 80 })),
      [],
    );
    const found = findAnalogues(days);
    assert.equal(found.ok, false);
  });

  it("keeps the recent row, counts a disagreement, and does not invent a missing day", () => {
    const merged = mergeFlows(
      [{ date: "2026-01-14", fiiNet: 10, diiNet: 20 }],
      [
        { date: "2026-06-04", fiiNet: 1, diiNet: 1 },
        { date: "2026-06-05", fiiNet: 100, diiNet: 100 },
      ],
      [{ date: "2026-06-05", fiiNet: 5, diiNet: 6 }],
    );
    assert.equal(merged.mismatches, 1);
    assert.equal(merged.rows.find((row) => row.date === "2026-06-05")?.fiiNet, 5);
    assert.equal(merged.rows.find((row) => row.date === "2026-06-04")?.fiiNet, 1);
    assert.equal(merged.rows.find((row) => row.date === "2026-01-14")?.fiiNet, 10);
    assert.equal(merged.rows.some((row) => row.date === "2026-06-06"), false);
  });

  it("skips a window whose index close is missing instead of treating it as zero", () => {
    const days = buildDays(
      Array.from({ length: 260 }, (_, i) => ({ date: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`, fiiNet: i % 2 ? -100 : 80, diiNet: 40 })),
      [],
    );
    const dated = days.map((day, i) => ({ ...day, date: `2024-${String(Math.floor(i / 28) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`, nifty: i < 20 ? null : 20000 + i }));
    const found = findAnalogues(dated);
    if (found.ok) {
      assert.ok(found.matches.every((match) => match.indexReturn !== 0 || match.forward20 !== 0));
      assert.ok(found.note.includes("not a probability"));
    } else {
      assert.match(found.reason, /missing an index close|Not enough/);
    }
  });

  it("keeps a daily month and does not invent sessions for an older month total", () => {
    const daily = aggregate(
      buildDays([{ date: "2026-10-21", fiiNet: 10, diiNet: 20 }], [{ date: "2026-10-20", close: 100 }, { date: "2026-10-21", close: 101 }]),
      [{ date: "2026-10-20", close: 100 }, { date: "2026-10-21", close: 101 }],
      "monthly",
      "2026-10-22",
    );
    const bars = withMonthTotals(
      daily,
      [
        { month: "2026-10", fiiNet: 999, diiNet: 999 },
        { month: "2007-04", fiiNet: 1734.54, diiNet: 857.66 },
      ],
      [],
      "2026-10-22",
    );
    assert.equal(bars.find((bar) => bar.key === "2026-10")?.fiiNet, 10);
    const old = bars.find((bar) => bar.key === "2007-04");
    assert.equal(old?.fiiNet, 1734.54);
    assert.equal(old?.sessions, 0);
    assert.equal(old?.indexReturn, null);
  });

  it("does not treat the latest month as one of its own precedents", () => {
    const index = Array.from({ length: 1400 }, (_, i) => {
      const date = new Date(Date.UTC(2016, 0, 1 + i));
      return { date: date.toISOString().slice(0, 10), close: 8000 + i };
    });
    const monthly = Array.from({ length: 48 }, (_, i) => {
      const end = index[250 + i * 20].date;
      return {
        key: end.slice(0, 7),
        label: end,
        start: end,
        end,
        sessions: 0,
        partial: false,
        fiiNet: i === 47 ? -50000 : -1000 + (i % 5) * 200,
        diiNet: i === 47 ? 48000 : 800,
        indexStart: 100,
        indexEnd: 110,
        indexReturn: i === 47 ? 0.4 : 0.6,
      };
    });
    const brief = buildResearch({ index, days: [], daily: [], weekly: [], monthly });
    assert.equal(brief.history.usable, true);
    assert.equal(brief.history.examples.some((example) => example.end === monthly[47].end), false);
    assert.match(brief.headline, /Foreign selling/);
  });
});
