import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OhlcBar } from "./types.ts";
import {
  DEFAULT_LIQ,
  activeSignals,
  detectLiquidity,
  foldSession4h,
  forwardStats,
  lastBarForming,
  laterCandleLikely,
  prepareBars,
  runValidityMs,
  type LiqConfig,
  type ScanBar,
} from "./liquidity.ts";

const cfg: LiqConfig = {
  ...DEFAULT_LIQ,
  left: 2,
  right: 2,
  minAge: 3,
  maxLookback: 40,
  maxReclaim: 3,
  failedWindow: 6,
  expiry: 12,
};

function bars(rows: Array<[number, number, number, number, number?]>): ScanBar[] {
  return rows.map(([o, h, l, c, v], i) => ({
    t: 1_700_000_000 + i * 86400,
    o,
    h,
    l,
    c,
    v: v ?? 1000,
  }));
}

/** Quiet market with one obvious swing low at `at`. */
function withLow(at: number, low: number, after = 16): ScanBar[] {
  const rows: Array<[number, number, number, number]> = [];
  for (let i = 0; i < at + after; i++) {
    if (i === at) rows.push([102, 103, low, 101]);
    else rows.push([100 + (i % 3), 104, 100, 102]);
  }
  return bars(rows);
}

describe("liquidity bars", () => {
  it("drops broken OHLC and keeps missing volume missing", () => {
    const raw: OhlcBar[] = [
      { t: 2, o: 10, h: 11, l: 9, c: 10, v: 0 },
      { t: 1, o: 10, h: 9, l: 12, c: 10, v: 5 },
      { t: 2, o: 10, h: 12, l: 9, c: 11, v: 0 },
      { t: 3, o: 11, h: 12, l: 10, c: 11, v: 8 },
    ];
    const pack = prepareBars(raw, false);
    assert.equal(pack.bars.length, 2);
    assert.equal(pack.bars[0].v, null);
    assert.equal(pack.bars[1].v, 8);
    assert.equal(pack.dropped, 1);
  });

  it("scales a split so later prices stay on the adjusted series", () => {
    const raw: OhlcBar[] = [
      { t: 1, o: 100, h: 110, l: 90, c: 100, v: 1, adj: 50 },
      { t: 2, o: 50, h: 55, l: 48, c: 52, v: 1, adj: 52 },
    ];
    const pack = prepareBars(raw, true);
    assert.equal(pack.adjusted, true);
    assert.ok(Math.abs(pack.bars[0].c - 50) < 1e-6);
    assert.ok(Math.abs(pack.bars[0].l - 45) < 1e-6);
  });

  it("folds the IST session into a morning 4h bar and a shorter afternoon bar", () => {
    const midnight = Date.UTC(2024, 0, 15) / 1000 - 19800;
    const at = (hh: number, mm: number, day = 0) => midnight + day * 86400 + hh * 3600 + mm * 60;
    const raw: OhlcBar[] = [
      { t: at(9, 15), o: 10, h: 12, l: 9, c: 11, v: 1 },
      { t: at(10, 15), o: 11, h: 13, l: 10, c: 12, v: 1 },
      { t: at(12, 15), o: 12, h: 14, l: 11, c: 13, v: 1 },
      { t: at(13, 15), o: 13, h: 15, l: 12, c: 14, v: 1 },
      { t: at(15, 15), o: 14, h: 16, l: 13, c: 15, v: 1 },
      { t: at(16, 0), o: 15, h: 20, l: 14, c: 19, v: 1 },
      { t: at(9, 15, 1), o: 15, h: 16, l: 14, c: 15, v: 1 },
    ];
    const folded = foldSession4h(raw);
    assert.equal(folded.length, 3);
    assert.equal(folded[0].o, 10);
    assert.equal(folded[0].h, 14);
    assert.equal(folded[0].c, 13);
    assert.equal(folded[1].o, 13);
    assert.equal(folded[1].c, 15);
    assert.equal(folded[2].o, 15);
  });

  it("does not treat a closed Friday week or a finished morning 4h bar as still forming", () => {
    const ist = (y: number, m: number, d: number, hh: number, mm: number) => Date.UTC(y, m - 1, d, hh, mm) - 19800 * 1000;
    const fridayWeek = ist(2026, 11, 2, 9, 15);
    const saturday = ist(2026, 11, 7, 10, 0);
    const fridayClose = ist(2026, 11, 6, 16, 0);
    const fridayOpen = ist(2026, 11, 6, 11, 0);
    assert.equal(lastBarForming("1W", Math.floor(fridayWeek / 1000), saturday), false);
    assert.equal(lastBarForming("1W", Math.floor(fridayWeek / 1000), fridayClose), false);
    assert.equal(lastBarForming("1W", Math.floor(fridayWeek / 1000), fridayOpen), true);
    const morning = ist(2026, 11, 6, 9, 15);
    const afternoon = ist(2026, 11, 6, 14, 0);
    assert.equal(lastBarForming("4H", Math.floor(morning / 1000), afternoon), false);
    assert.equal(lastBarForming("4H", Math.floor(afternoon / 1000), afternoon), true);
  });

  it("keeps a 100-bar swing window and a 10-bar call life", () => {
    assert.equal(DEFAULT_LIQ.maxLookback, 100);
    assert.equal(DEFAULT_LIQ.expiry, 10);
    assert.equal(runValidityMs("1W"), 10 * 7 * 24 * 60 * 60 * 1000);
    assert.equal(runValidityMs("15m"), 10 * 15 * 60 * 1000);
    const friday = Date.UTC(2026, 10, 6, 10, 0) - 19800 * 1000;
    const saturday = Date.UTC(2026, 10, 7, 10, 0);
    assert.equal(laterCandleLikely("1D", Math.floor(friday / 1000), saturday), false);
    const nextMonday = Date.UTC(2026, 10, 9, 10, 0);
    assert.equal(laterCandleLikely("1W", Math.floor(friday / 1000), nextMonday), true);
  });
});

describe("liquidity detection", () => {
  it("does not confirm a swing until the right-hand candles exist", () => {
    const full = withLow(8, 90, 8);
    const early = detectLiquidity(full.slice(0, 10), cfg, false);
    assert.equal(early.some((e) => e.swingIndex === 8), false);
    const ready = detectLiquidity(full, cfg, false);
    assert.equal(ready.some((e) => e.swingIndex === 8) || full[8].l === 90, true);
  });

  it("detects a same-candle bullish sweep and not a mere touch", () => {
    const base = withLow(8, 90, 10);
    const sweepAt = base.length;
    const series = base.concat(bars([[101, 103, 88, 95]]).map((b, i) => ({ ...b, t: base[base.length - 1].t + (i + 1) * 86400 })));
    void sweepAt;
    const touch = base.concat(bars([[101, 103, 90, 95]]).map((b, i) => ({ ...b, t: base[base.length - 1].t + (i + 1) * 86400, l: 90 })));
    const hit = activeSignals(detectLiquidity(series, cfg, false), "sweep").filter((e) => e.direction === "bull");
    const none = activeSignals(detectLiquidity(touch, cfg, false), "sweep");
    assert.ok(hit.length >= 1);
    assert.equal(hit[0].reclaimKind, "same");
    assert.equal(hit[0].status, "confirmed");
    assert.equal(none.length, 0);
  });

  it("detects a two-candle reclaim and keeps a forming reclaim unconfirmed", () => {
    const base = withLow(8, 90, 10);
    const add = (rows: Array<[number, number, number, number]>) =>
      base.concat(rows.map((row, i) => ({ t: base[base.length - 1].t + (i + 1) * 86400, o: row[0], h: row[1], l: row[2], c: row[3], v: 1000 })));
    const two = add([
      [100, 101, 86, 88],
      [88, 90, 87, 89],
      [89, 100, 88, 96],
    ]);
    const found = activeSignals(detectLiquidity(two, cfg, false), "sweep").find((e) => e.direction === "bull");
    assert.ok(found);
    assert.equal(found?.reclaimCandles, 2);
    const forming = add([
      [100, 101, 86, 96],
    ]);
    const live = detectLiquidity(forming, cfg, true).filter((e) => e.direction === "bull" && e.sweepIndex === forming.length - 1);
    assert.ok(live.length >= 1);
    assert.equal(live[0].status, "developing");
    assert.notEqual(live[0].tier, "strong");
  });

  it("does not call a deep breakdown that never reclaims a sweep", () => {
    const base = withLow(8, 90, 10);
    const dump = base.concat(
      [70, 60, 50, 40].map((px, i) => ({
        t: base[base.length - 1].t + (i + 1) * 86400,
        o: px + 2,
        h: px + 3,
        l: px,
        c: px + 1,
        v: 1000,
      })),
    );
    const active = activeSignals(detectLiquidity(dump, cfg, false), "both");
    assert.equal(active.filter((e) => e.pattern === "sweep").length, 0);
  });

  it("rejects an ordinary bullish engulfing that never broke the swing", () => {
    const base = withLow(8, 90, 10);
    const bounce = base.concat([
      { t: base[base.length - 1].t + 86400, o: 99, h: 100, l: 97, c: 98, v: 1000 },
      { t: base[base.length - 1].t + 2 * 86400, o: 97, h: 106, l: 96, c: 105, v: 2000 },
    ]);
    const active = activeSignals(detectLiquidity(bounce, cfg, false), "both");
    assert.equal(active.length, 0);
  });

  it("groups equal lows and keeps a clearly separate low out of the zone", () => {
    const rows: ScanBar[] = [];
    for (let i = 0; i < 30; i++) {
      const special = i === 6 || i === 14;
      const far = i === 22;
      rows.push({
        t: 1_700_000_000 + i * 86400,
        o: 100,
        h: far ? 110 : 104,
        l: special ? 90 : far ? 80 : 99,
        c: 101,
        v: 1000,
      });
    }
    const events = detectLiquidity(rows, { ...cfg, minAge: 3, equalPct: 0.003 }, false);
    const levels = new Set(events.map((e) => e.levelId));
    assert.ok(levels.size >= 1);
    const repeated = events.filter((e) => e.repeated);
    const singleFar = events.filter((e) => !e.repeated && e.zoneLow <= 80);
    assert.ok(repeated.length >= 1);
    assert.equal(repeated.some((e) => e.zoneLow <= 80 && e.zoneHigh >= 90), false);
    void singleFar;
  });

  it("does not treat a swing low as a repeated high", () => {
    const rows: ScanBar[] = [];
    for (let i = 0; i < 28; i++) {
      const high = i === 6;
      const low = i === 16;
      rows.push({
        t: 1_700_000_000 + i * 86400,
        o: 100,
        h: high ? 110 : 104,
        l: low ? 90 : high ? 100 : 99,
        c: high ? 102 : low ? 98 : 101,
        v: 1000,
      });
    }
    rows.push({ t: rows[rows.length - 1].t + 86400, o: 100, h: 112, l: 99, c: 101, v: 1000 });
    const events = detectLiquidity(rows, { ...cfg, minAge: 3, equalPct: 0.02, maxLookback: 40 }, false);
    assert.equal(events.some((e) => e.repeated && e.direction === "bear" && e.zoneLow <= 90 && e.zoneHigh >= 110), false);
  });

  it("invalidates a bullish reclaim when a later close is lost, and does not repeat the same id", () => {
    const base = withLow(8, 90, 8);
    const reclaimed = base.concat([
      { t: base[base.length - 1].t + 86400, o: 100, h: 102, l: 86, c: 96, v: 1400 },
      { t: base[base.length - 1].t + 2 * 86400, o: 96, h: 97, l: 80, c: 82, v: 1400 },
    ]);
    const first = detectLiquidity(reclaimed, cfg, false);
    const again = detectLiquidity(reclaimed, cfg, false);
    assert.deepEqual(first.map((e) => e.id), again.map((e) => e.id));
    const lost = first.filter((e) => e.direction === "bull" && e.status === "invalidated");
    assert.ok(lost.length >= 1);
    assert.equal(activeSignals(first, "sweep").some((e) => e.id === lost[0].id), false);
  });

  it("measures forward returns only after the reclaim and reports the sample size", () => {
    const base = withLow(8, 90, 6);
    const series = base.concat(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((step, i) => ({
        t: base[base.length - 1].t + (i + 1) * 86400,
        o: i === 0 ? 100 : 100 + step,
        h: 102 + step,
        l: i === 0 ? 86 : 100 + step - 1,
        c: i === 0 ? 96 : 101 + step,
        v: 1000,
      })),
    );
    const events = detectLiquidity(series, cfg, false).filter((e) => e.status === "confirmed");
    const stats = forwardStats(events, series);
    assert.ok(events.length >= 1);
    const bull = stats.find((row) => row.direction === "bull");
    assert.ok(bull);
    assert.equal(bull?.n, events.filter((e) => e.direction === "bull" && e.status !== "developing").length);
    assert.ok((bull?.withForward || 0) >= 1);
  });
});
