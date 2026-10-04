import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Bar } from "./types.ts";
import {
  acceptSourcedClose,
  canonSymbol,
  recoveryTargets,
  seasonCloseAsk,
  average,
  choosePrice,
  dayCloses,
  median,
  periodCells,
  portfolioSeason,
  seasonView,
  windowBounds,
} from "./seasonality.ts";

function bar(day: string, adj: number, raw = adj): Bar {
  const [y, m, d] = day.split("-").map(Number);
  return { t: Date.UTC(y, m - 1, d, 10, 0, 0) / 1000, c: adj, raw };
}

function monthEnds(start: string, months: number, px0 = 100, step = 1): Bar[] {
  const [y0, m0] = start.split("-").map(Number);
  const out: Bar[] = [];
  let px = px0;
  for (let i = 0; i < months; i++) {
    const dt = new Date(Date.UTC(y0, m0 - 1 + i + 1, 0));
    const day = dt.toISOString().slice(0, 10);
    px = +(px * step).toFixed(4);
    out.push(bar(day, px));
  }
  return out;
}

describe("seasonality returns", () => {
  it("uses the last session in the month and the adjusted close", () => {
    const days = dayCloses([
      bar("2020-01-30", 90, 90),
      bar("2020-01-31", 100, 100),
      bar("2020-02-28", 110, 50),
    ]);
    const cells = periodCells(days, "monthly", "2020-03-15");
    const feb = cells.find((c) => c.year === 2020 && c.period === 2);
    assert.equal(feb?.status, "calculated");
    assert.ok(feb && Math.abs((feb.ret || 0) - 10) < 1e-9);
    assert.equal(feb?.endDay, "2020-02-28");
    assert.equal(feb?.prevDay, "2020-01-31");
  });

  it("does not turn a missing month into a zero return", () => {
    const days = dayCloses([bar("2020-01-31", 100), bar("2020-03-31", 110)]);
    const cells = periodCells(days, "monthly", "2020-04-15");
    const mar = cells.find((c) => c.period === 3);
    assert.equal(mar?.status, "missing");
    assert.equal(mar?.ret, null);
  });

  it("marks the in-progress month partial and keeps earlier months", () => {
    const days = dayCloses([bar("2026-08-31", 100), bar("2026-09-30", 110), bar("2026-10-02", 120)]);
    const cells = periodCells(days, "monthly", "2026-10-04");
    const oct = cells.find((c) => c.period === 10);
    const sep = cells.find((c) => c.period === 9);
    assert.equal(oct?.status, "partial");
    assert.equal(oct?.ret, null);
    assert.equal(sep?.status, "calculated");
  });

  it("computes a quarter from quarter-end adjusted closes", () => {
    const days = dayCloses([bar("2019-12-31", 100), bar("2020-03-31", 80)]);
    const cells = periodCells(days, "quarterly", "2020-06-01");
    const q1 = cells.find((c) => c.year === 2020 && c.period === 1);
    assert.equal(q1?.status, "calculated");
    assert.ok(q1 && Math.abs((q1.ret || 0) - -20) < 1e-9);
  });

  it("averages, medians, and counts only real observations", () => {
    const cells = [
      { year: 2020, period: 1, ret: 10, endDay: "2020-01-31", prevDay: "2019-12-31", status: "calculated" as const },
      { year: 2021, period: 1, ret: 20, endDay: "2021-01-29", prevDay: "2020-12-31", status: "calculated" as const },
      { year: 2022, period: 1, ret: -30, endDay: "2022-01-31", prevDay: "2021-12-31", status: "calculated" as const },
      { year: 2022, period: 1, ret: null, endDay: null, prevDay: null, status: "missing" as const },
    ];
    const view = seasonView(cells, {
      kind: "monthly",
      lookback: 5,
      windowEnd: 2022,
      includeCurrent: false,
      asOfDay: "2023-06-01",
      firstDay: "2019-12-31",
      lastDay: "2022-12-30",
    });
    const jan = view.buckets[0];
    assert.equal(jan.observations, 3);
    assert.ok(jan.avg != null && Math.abs(jan.avg - 0) < 1e-9);
    assert.ok(jan.median != null && Math.abs(jan.median - 10) < 1e-9);
    assert.ok(jan.positivePct != null && Math.abs(jan.positivePct - (200 / 3)) < 1e-9);
    assert.equal(median([1, 2, 3, 4]), 2.5);
    assert.equal(average([]), null);
  });

  it("leaves the current year out unless asked, and says so when history is short", () => {
    const bars = monthEnds("2018-01", 12 * 8, 100, 1.01);
    const days = dayCloses(bars);
    const cells = periodCells(days, "monthly", "2026-10-04");
    const off = seasonView(cells, {
      kind: "monthly",
      lookback: 10,
      windowEnd: 2026,
      includeCurrent: false,
      asOfDay: "2026-10-04",
      firstDay: days[0].day,
      lastDay: days.at(-1)!.day,
    });
    assert.ok(off.windowEnd < 2026);
    assert.equal(off.buckets.some((b) => b.observations > 0), true);
    assert.match(off.note, /10Y selected/);
    const on = seasonView(cells, {
      kind: "monthly",
      lookback: 2,
      windowEnd: 2026,
      includeCurrent: true,
      asOfDay: "2026-10-04",
      firstDay: days[0].day,
      lastDay: days.at(-1)!.day,
    });
    assert.match(on.note, /Current year included/);
    const bounds = windowBounds(cells, 2, "2026-10-04", false);
    assert.ok(bounds.maxEnd <= 2025);
    assert.ok(bounds.minEnd < bounds.maxEnd);
  });

  it("moves the rolling window without using years outside it", () => {
    const cells = [];
    for (let y = 2015; y <= 2024; y++) {
      cells.push({ year: y, period: 1, ret: y, endDay: `${y}-01-31`, prevDay: `${y - 1}-12-31`, status: "calculated" as const });
    }
    const early = seasonView(cells, {
      kind: "monthly",
      lookback: 2,
      windowEnd: 2016,
      includeCurrent: false,
      asOfDay: "2026-10-04",
      firstDay: "2014-12-31",
      lastDay: "2024-12-31",
    });
    assert.equal(early.windowStart, 2015);
    assert.equal(early.windowEnd, 2016);
    assert.equal(early.buckets[0].observations, 2);
    assert.ok(early.buckets[0].avg != null && early.buckets[0].avg < 2017);
  });
});

describe("portfolio seasonality", () => {
  const a = [{ year: 2022, period: 1, ret: 10, endDay: null, prevDay: null, status: "calculated" as const }];
  const b = [{ year: 2022, period: 1, ret: 20, endDay: null, prevDay: null, status: "calculated" as const }];
  const opts = {
    kind: "monthly" as const,
    lookback: 2 as const,
    windowEnd: 2022,
    includeCurrent: false,
    asOfDay: "2023-06-01",
  };

  it("weights current holdings and does not treat a missing name as zero", () => {
    const view = portfolioSeason(
      [
        { symbol: "AAA", cells: a, firstDay: "2020-01-01", lastDay: "2022-12-31" },
        { symbol: "BBB", cells: b, firstDay: "2020-01-01", lastDay: "2022-12-31" },
        { symbol: "CCC", cells: [], firstDay: null, lastDay: null },
      ],
      [
        { symbol: "AAA", weight: 50 },
        { symbol: "BBB", weight: 30 },
        { symbol: "CCC", weight: 20 },
      ],
      opts,
    );
    const jan = view.buckets[0];
    assert.ok(jan.avg != null && Math.abs(jan.avg - (50 * 10 + 30 * 20) / 80) < 1e-9);
    assert.equal(view.namesWithHistory, 2);
    assert.equal(view.names, 3);
    assert.match(view.method, /not a zero return/);
  });

  it("reports unallocated weight and can label a normalization", () => {
    const plain = portfolioSeason(
      [{ symbol: "AAA", cells: a, firstDay: "2020-01-01", lastDay: "2022-12-31" }],
      [{ symbol: "AAA", weight: 92 }],
      opts,
    );
    assert.match(plain.note, /92\.0%/);
    assert.match(plain.note, /8\.0%/);
    assert.equal(plain.normalized, false);
    const norm = portfolioSeason(
      [{ symbol: "AAA", cells: a, firstDay: "2020-01-01", lastDay: "2022-12-31" }],
      [{ symbol: "AAA", weight: 92 }],
      { ...opts, normalize: true },
    );
    assert.equal(norm.normalized, true);
    assert.match(norm.method, /normalized to 100%/);
    assert.ok(norm.buckets[0].avg != null && Math.abs(norm.buckets[0].avg - 10) < 1e-9);
  });
});

describe("sourced closes", () => {
  it("accepts one dated source and rejects estimates, missing sources, and the wrong month", () => {
    const ok = acceptSourcedClose({
      sourceUrl: "https://www.nseindia.com/example",
      sourceName: "NSE",
      evidence: "NSE close of ITC on 2024-07-03 was 412.42",
      value: 412.42,
      year: 2024,
      month: 7,
    });
    assert.deepEqual(ok, { day: "2024-07-03", price: 412.42 });
    assert.equal(
      acceptSourcedClose({
        sourceUrl: "https://www.nseindia.com/example",
        sourceName: "NSE",
        evidence: "Estimated close on 2024-07-03 was about 412",
        value: 412,
        year: 2024,
        month: 7,
      }),
      null,
    );
    assert.equal(
      acceptSourcedClose({
        sourceUrl: "https://www.nseindia.com/example",
        sourceName: "NSE",
        evidence: "Close on 2024-08-01 was 412.42",
        value: 412.42,
        year: 2024,
        month: 7,
      }),
      null,
    );
  });

  it("keeps the higher-priority price when sources disagree", () => {
    const yahoo = { value: 100, source: "yahoo", sourcePriority: 20, sourceType: "structured" };
    const ai = { value: 140, source: "ai", sourcePriority: 50, sourceType: "AI-researched" };
    const keepYahoo = choosePrice(yahoo, ai);
    assert.equal(keepYahoo.keep.source, "yahoo");
    assert.equal(keepYahoo.conflict, true);
    const upgrade = choosePrice(ai, yahoo);
    assert.equal(upgrade.keep.source, "yahoo");
    assert.equal(upgrade.conflict, true);
    const same = choosePrice(yahoo, { ...yahoo, value: 100.1 });
    assert.equal(same.conflict, false);
    const corrected = choosePrice(yahoo, { ...yahoo, value: 110 });
    assert.equal(corrected.conflict, true);
    assert.equal(corrected.keep.value, 110);
  });

  it("matches an exchange suffix and keeps an ampersand in the symbol", () => {
    assert.equal(canonSymbol("M&M.NS"), "M&M");
    assert.equal(canonSymbol("reliance.ns"), "RELIANCE");
    const view = portfolioSeason(
      [{ symbol: "M&M.NS", cells: [{ year: 2022, period: 1, ret: 4, endDay: null, prevDay: null, status: "calculated" }], firstDay: "2015-01-01", lastDay: "2022-12-31" }],
      [{ symbol: "m&m.bo", weight: 100 }],
      {
        kind: "monthly",
        lookback: 2,
        windowEnd: 2022,
        includeCurrent: false,
        asOfDay: "2023-06-01",
      },
    );
    assert.ok(view.buckets[0].avg != null && Math.abs(view.buckets[0].avg - 4) < 1e-9);
  });

  it("asks only for missing completed months inside the window", () => {
    const monthly = [
      { year: 2021, period: 1, ret: null, endDay: null, prevDay: null, status: "missing" as const },
      { year: 2022, period: 3, ret: null, endDay: null, prevDay: null, status: "missing" as const },
      { year: 2022, period: 10, ret: null, endDay: "2022-10-04", prevDay: null, status: "partial" as const },
      { year: 2024, period: 1, ret: null, endDay: null, prevDay: null, status: "missing" as const },
    ];
    const got = recoveryTargets([{ symbol: "itc.ns", monthly }], 2022, 2023, 6);
    assert.deepEqual(got, [{ symbol: "ITC", year: 2022, month: 3 }]);
    assert.match(seasonCloseAsk("ITC", 2022, 3), /2022-03/);
    assert.match(seasonCloseAsk("ITC", 2022, 3), /Do not estimate/);
  });
});
