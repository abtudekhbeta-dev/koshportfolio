import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OhlcBar } from "./types.ts";
import { cleanBars, indicatorLegend, istBusinessDay, ohlcCollapsed, sessionVwap } from "./ledger-bars.ts";
import { distToSeg, fibPrice, hitDraw } from "./ledger-draw.ts";
import { addIndicator, loadLedgerLayout, sanitizeLayout } from "./ledger-layout.ts";
import { clampRange, intervalSpec, rangesFor } from "./ledger-spec.ts";

function bar(t: number, o: number, h: number, l: number, c: number, v = 0): OhlcBar {
  return { t, o, h, l, c, v };
}

describe("ledger bars", () => {
  it("drops invalid prints, sorts, and keeps the last duplicate", () => {
    const bars = cleanBars([
      bar(30, 10, 12, 9, 11, 5),
      bar(10, 1, 1, 2, 1, 1),
      bar(20, 8, 9, 7, 8, -3),
      bar(20, 8, 10, 7, 9, 4),
      bar(40, Number.NaN, 1, 1, 1, 1),
      bar(50, 3, 4, 1, 9, 1),
    ]);
    assert.deepEqual(
      bars.map((row) => row.t),
      [20, 30],
    );
    assert.equal(bars[0].c, 9);
    assert.equal(bars[0].v, 4);
    assert.equal(bars[1].v, 5);
  });

  it("does not treat a close-only series as a full candle", () => {
    assert.equal(ohlcCollapsed([bar(1, 5, 5, 5, 5), bar(2, 6, 6, 6, 6)]), true);
    assert.equal(ohlcCollapsed([bar(1, 5, 6, 4, 5.5), bar(2, 6, 6, 6, 6)]), false);
  });

  it("resets session VWAP and withholds it until volume exists", () => {
    const day = 1_700_000_000;
    const next = day + 86400;
    const values = sessionVwap([
      bar(day, 10, 12, 9, 11, 0),
      bar(day + 60, 10, 12, 8, 10, 100),
      bar(next, 20, 22, 18, 20, 0),
      bar(next + 60, 20, 24, 18, 22, 50),
    ]);
    assert.equal(values[0], null);
    assert.equal(values[1], (12 + 8 + 10) / 3);
    assert.equal(values[2], null);
    assert.ok(Math.abs((values[3] as number) - (24 + 18 + 22) / 3) < 1e-9);
  });

  it("maps an evening UTC timestamp onto the IST session date", () => {
    const t = Date.UTC(2024, 0, 14, 20) / 1000;
    assert.deepEqual(istBusinessDay(t), { year: 2024, month: 1, day: 15 });
  });

  it("leaves the moving-average warmup blank", () => {
    const bars = Array.from({ length: 19 }, (_, i) => bar(i + 1, 10, 10, 10, 10, 1));
    const rows = indicatorLegend(bars, [{ id: "sma", kind: "sma", period: 20, hidden: false, color: "#e6b85c" }], false);
    assert.equal(rows[0].value, "—");
    const ready = indicatorLegend(
      [...bars, bar(20, 10, 10, 10, 10, 1)],
      [{ id: "sma", kind: "sma", period: 20, hidden: false, color: "#e6b85c" }],
      false,
    );
    assert.equal(ready[0].value, "10.00");
  });
});

describe("ledger drawings", () => {
  it("places Fibonacci 0 on the first price and 1 on the second", () => {
    assert.equal(fibPrice(100, 80, 0), 100);
    assert.equal(fibPrice(100, 80, 1), 80);
    assert.equal(fibPrice(100, 80, 0.5), 90);
  });

  it("hits a horizontal price and misses a locked-away segment", () => {
    const project = (t: number, p: number) => ({ x: t, y: 100 - p });
    const line: Parameters<typeof hitDraw>[0] = {
      id: "h",
      kind: "hline",
      t0: 10,
      p0: 40,
      color: "#4c8dff",
      locked: false,
      hidden: false,
    };
    assert.equal(hitDraw(line, 80, 60, project, 200, 120), "body");
    assert.equal(hitDraw(line, 80, 20, project, 200, 120), null);
    assert.ok(distToSeg(0, 0, 0, 0, 10, 0) < distToSeg(0, 5, 0, 0, 10, 0));
  });
});

describe("ledger layout", () => {
  it("recovers a corrupt layout instead of blocking the terminal", () => {
    const bad = loadLedgerLayout("{");
    assert.equal(bad.recovered, true);
    assert.equal(bad.layout.interval, "1D");
    assert.equal(bad.layout.symbol, "RELIANCE");
    const missing = loadLedgerLayout(null);
    assert.equal(missing.recovered, false);
  });

  it("rejects an unknown interval and an impossible intraday range", () => {
    const next = sanitizeLayout({ v: 1, interval: "2s", range: "5Y", symbol: "tcs" });
    assert.equal(next.layout.interval, "1D");
    assert.equal(next.layout.symbol, "TCS");
    assert.equal(next.recovered, true);
    assert.deepEqual(rangesFor("1m"), []);
    assert.equal(clampRange("1m", "5Y"), "All");
    assert.equal(intervalSpec("3m").resample, 180);
    assert.match(intervalSpec("3m").note || "", /resampled/);
  });

  it("does not add a second copy of a single-instance indicator", () => {
    const once = addIndicator([], "rsi");
    assert.equal(addIndicator(once, "rsi").length, 1);
    const smas = addIndicator(addIndicator([], "sma"), "sma");
    assert.deepEqual(
      smas.map((item) => item.period),
      [20, 50],
    );
  });
});
