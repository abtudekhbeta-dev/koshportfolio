import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OhlcBar } from "./types.ts";
import {
  DEFAULT_LIQ,
  activeSignals,
  detectLiquidity,
  barsForTimeframe,
  createScanGate,
  foldSession4h,
  foldSession4hReport,
  forwardStats,
  lastBarForming,
  laterCandleLikely,
  mergeStats,
  planScanCursor,
  prepareBars,
  reduceScanState,
  replayEveryPrefix,
  replayNoLookahead,
  runValidityMs,
  scanIsComplete,
  session4hTailOpen,
  type LiqConfig,
  type LiqEvent,
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

  it("keeps a complete IST 4h slot and drops a missing hour, a weekend and a partial volume", () => {
    const midnight = Date.UTC(2024, 0, 15) / 1000 - 19800;
    const at = (hh: number, mm: number, day = 0) => midnight + day * 86400 + hh * 3600 + mm * 60;
    const full = (day: number, volume: number | null = 1) =>
      (
        [
          [9, 15, 10, 12, 9, 11],
          [10, 15, 11, 13, 10, 12],
          [11, 15, 12, 13, 11, 12],
          [12, 15, 12, 14, 11, 13],
          [13, 15, 13, 15, 12, 14],
          [14, 15, 14, 15, 13, 14],
          [15, 15, 14, 16, 13, 15],
        ] as const
      ).map(([hh, mm, o, h, l, c]) => ({ t: at(hh, mm, day), o, h, l, c, v: volume ?? 0 }));
    const raw: OhlcBar[] = [
      ...full(0),
      { t: at(16, 0), o: 15, h: 20, l: 14, c: 19, v: 1 },
      ...full(-2),
      { t: at(9, 15, 1), o: 15, h: 16, l: 14, c: 15, v: 1 },
      { t: at(10, 15, 1), o: 15, h: 16, l: 14, c: 15, v: 1 },
    ];
    const report = foldSession4hReport(raw);
    assert.equal(report.bars.length, 2);
    assert.equal(report.bars[0].o, 10);
    assert.equal(report.bars[0].h, 14);
    assert.equal(report.bars[0].c, 13);
    assert.equal(report.bars[1].o, 13);
    assert.equal(report.bars[1].c, 15);
    assert.equal(report.slots.some((slot) => slot.weekend && !slot.complete), true);
    assert.equal(report.slots.some((slot) => !slot.weekend && slot.missingHours.length > 0), true);
    const gappy = full(0).map((bar, i) => (i === 3 ? { ...bar, v: 0 } : bar));
    assert.equal(prepareBars(foldSession4h(gappy), true).bars[0].v, null);
    const nextDay = Date.UTC(2024, 0, 16, 12, 0);
    assert.equal(session4hTailOpen(full(0), nextDay), false);
    assert.equal(session4hTailOpen(raw.filter((bar) => bar.t >= at(9, 15, 1) && bar.t < at(16, 0, 1)), nextDay), true);
  });

  it("drops an incomplete afternoon and does not invent a holiday between two sessions", () => {
    const midnight = Date.UTC(2024, 0, 15) / 1000 - 19800;
    const at = (hh: number, mm: number, day = 0) => midnight + day * 86400 + hh * 3600 + mm * 60;
    const full = (day: number) =>
      (
        [
          [9, 15, 10, 12, 9, 11],
          [10, 15, 11, 13, 10, 12],
          [11, 15, 12, 13, 11, 12],
          [12, 15, 12, 14, 11, 13],
          [13, 15, 13, 15, 12, 14],
          [14, 15, 14, 15, 13, 14],
          [15, 15, 14, 16, 13, 15],
        ] as const
      ).map(([hh, mm, o, h, l, c]) => ({ t: at(hh, mm, day), o, h, l, c, v: 1 }));
    const tuesdayAfternoon = full(1).filter((bar) => {
      const sod = ((bar.t + 19800) % 86400);
      return sod < 13 * 3600 + 15 * 60 || sod === 13 * 3600 + 15 * 60 || sod === 14 * 3600 + 15 * 60;
    });
    const raw = [...full(0), ...tuesdayAfternoon, ...full(3)];
    const report = foldSession4hReport(raw);
    const wednesday = Math.floor((at(9, 15, 2) + 19800) / 86400);
    assert.equal(report.slots.some((slot) => slot.day === wednesday), false);
    assert.equal(report.slots.some((slot) => slot.slot === 1 && slot.missingHours.includes(15 * 3600 + 15 * 60)), true);
    assert.equal(report.bars.length, 5);
    assert.equal(barsForTimeframe("4H", raw).bars.length, report.bars.length);
    assert.deepEqual(
      barsForTimeframe("4H", raw).bars.map((bar) => bar.c),
      prepareBars(foldSession4h(raw), true).bars.map((bar) => bar.c),
    );
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
    const quarter = ist(2026, 11, 6, 10, 0);
    const tenMinLater = ist(2026, 11, 6, 10, 10);
    const twentyMinLater = ist(2026, 11, 6, 10, 20);
    assert.equal(lastBarForming("15m", Math.floor(quarter / 1000), tenMinLater), true);
    assert.equal(lastBarForming("15m", Math.floor(quarter / 1000), twentyMinLater), false);
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
    assert.equal(hit[0].reclaimClosed, true);
    assert.equal(hit[0].followThrough, false);
    assert.equal(none.length, 0);
    const followed = series.concat([{ t: series[series.length - 1].t + 86400, o: 95, h: 110, l: 94, c: 108, v: 1000 }]);
    const later = activeSignals(detectLiquidity(followed, cfg, false), "sweep").find((e) => e.direction === "bull");
    assert.equal(later?.reclaimClosed, true);
    assert.equal(later?.followThrough, true);
    assert.notEqual(later?.status, "developing");
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
    const bulls = stats.filter((row) => row.direction === "bull");
    assert.ok(bulls.length >= 1);
    assert.equal(
      bulls.reduce((sum, row) => sum + row.n, 0),
      events.filter((e) => e.direction === "bull" && e.status !== "developing" && e.reclaimClosed).length,
    );
    assert.ok(bulls.some((row) => (row.withForward || 0) >= 1 || (row.incomplete?.c1 || 0) >= 0));
    assert.ok(bulls.every((row) => row.quality === "strong" || row.quality === "potential"));
    const replay = replayNoLookahead(series, cfg);
    assert.equal(replay.leaks.length, 0);
    assert.ok(replay.checked >= 1);
    const walked = replayEveryPrefix(series, cfg);
    assert.equal(walked.leaks.length, 0);
    assert.ok(walked.prefixes > 5);
  });

  it("does not award volume points when volume is missing, and does not call a shallow sweep Strong", () => {
    const base = withLow(8, 90, 10).map((bar) => ({ ...bar, v: null }));
    const series = base.concat([{ t: base[base.length - 1].t + 86400, o: 101, h: 103, l: 88, c: 95, v: null }]);
    const missing = activeSignals(detectLiquidity(series, cfg, false), "sweep").find((e) => e.direction === "bull");
    assert.ok(missing);
    assert.equal(missing?.volumeKnown, false);
    assert.equal(missing?.parts.volume, 0);
    const withVol = activeSignals(
      detectLiquidity(series.map((bar, i) => ({ ...bar, v: i === series.length - 1 ? 5000 : 1000 })), cfg, false),
      "sweep",
    ).find((e) => e.direction === "bull");
    assert.ok((withVol?.parts.volume || 0) > 0);
    assert.ok((withVol?.score || 0) > (missing?.score || 0));
    const shallow = activeSignals(detectLiquidity(series, { ...cfg, strongScore: 1, minDepthAtr: 50 }, false), "sweep");
    assert.ok(shallow.length >= 1);
    assert.equal(shallow.some((e) => e.tier === "strong"), false);
  });

  it("pools forward observations instead of taking a median of medians", () => {
    const one = forwardStats([], []);
    void one;
    const left = {
      pattern: "sweep" as const,
      direction: "bull" as const,
      n: 2,
      samples: { c1: 2, c3: 0, c5: 0, c8: 0, mfe: 0, mae: 0 },
      avg: { c1: 50.5, c3: null, c5: null, c8: null },
      median: { c1: 50.5, c3: null, c5: null, c8: null, mfe: null, mae: null },
      withForward: 2,
      medianMfe: null,
      medianMae: null,
      invalidated: 0,
      capped: false,
      obs: { c1: [1, 100], c3: [], c5: [], c8: [], mfe: [1, 9], mae: [-4, -1] },
    };
    const right = {
      ...left,
      n: 1,
      samples: { ...left.samples, c1: 1, mfe: 1, mae: 1 },
      withForward: 1,
      obs: { c1: [2], c3: [], c5: [], c8: [], mfe: [3], mae: [-2] },
    };
    const merged = mergeStats([left, right]).find((row) => row.direction === "bull");
    assert.equal(merged?.samples.c1, 3);
    assert.equal(merged?.median.c1, 2);
    assert.notEqual(merged?.median.c1, 26.25);
    assert.equal(merged?.samples.mfe, 3);
    assert.equal(merged?.n, 3);
  });

  it("walks every prefix for a bearish reclaim and lets an intrabar signal disappear", () => {
    const rows: ScanBar[] = [];
    for (let i = 0; i < 16; i++) {
      rows.push({ t: 1_700_000_000 + i * 86400, o: 100, h: i === 6 ? 120 : 104, l: 99, c: 101, v: 1000 });
    }
    rows.push({ t: rows[rows.length - 1].t + 86400, o: 104, h: 130, l: 100, c: 108, v: 1000 });
    const bear = activeSignals(detectLiquidity(rows, cfg, false), "sweep").find((e) => e.direction === "bear");
    assert.ok(bear);
    assert.equal(bear?.reclaimClosed, true);
    assert.equal(bear?.followThrough, false);
    assert.equal(replayEveryPrefix(rows, cfg).leaks.length, 0);
    const base = withLow(8, 90, 8);
    const liveBar = { t: base[base.length - 1].t + 86400, o: 100, h: 101, l: 86, c: 88, v: 1000 };
    const forming = detectLiquidity(base.concat([liveBar]), cfg, true).filter((e) => e.sweepIndex === base.length);
    const closed = detectLiquidity(base.concat([liveBar]), cfg, false).filter((e) => e.sweepIndex === base.length && e.reclaimClosed);
    assert.equal(forming.some((e) => e.status === "developing"), true);
    assert.equal(closed.length, 0);
  });

  it("does not mark a book finished while a name is still unaccounted for", () => {
    assert.equal(scanIsComplete(10, 6, 4, null), true);
    assert.equal(scanIsComplete(10, 6, 3, null), false);
    assert.equal(scanIsComplete(10, 10, 0, 4), false);
    assert.deepEqual(planScanCursor({ done: false, cursorAt: 8 }, 0, false), { action: "replace-with-saved" });
    assert.deepEqual(planScanCursor({ done: false, cursorAt: 8 }, 8, false), { action: "scan", cursor: 8 });
    assert.deepEqual(planScanCursor({ done: true, cursorAt: 10 }, 0, false), { action: "use-saved" });
    assert.deepEqual(planScanCursor({ done: true, cursorAt: 10 }, 0, true), { action: "scan", cursor: 0 });
    assert.deepEqual(planScanCursor({ done: false, cursorAt: 8 }, 0, true), { action: "scan", cursor: 0 });
    const mid = reduceScanState({ scannedN: 0, skippedN: 0 }, { scanned: 3, skipped: 1, cursor: 4, universeSize: 10 }, 0);
    assert.equal(mid.done, false);
    assert.equal(mid.cursorAt, 4);
    const done = reduceScanState(mid, { scanned: 5, skipped: 1, cursor: null, universeSize: 10 }, 4);
    assert.equal(done.done, true);
    assert.equal(done.scannedN, 8);
    assert.equal(done.skippedN, 2);
    const reset = reduceScanState(done, { scanned: 1, skipped: 0, cursor: 1, universeSize: 10 }, 0);
    assert.equal(reset.scannedN, 1);
    assert.equal(reset.done, false);
  });

  it("keeps a one-candle and a three-candle reclaim, and a later false break, on their own candles", () => {
    const base = withLow(8, 90, 10);
    const add = (rows: Array<[number, number, number, number]>) =>
      base.concat(rows.map((row, i) => ({ t: base[base.length - 1].t + (i + 1) * 86400, o: row[0], h: row[1], l: row[2], c: row[3], v: 1000 })));
    const one = activeSignals(
      detectLiquidity(add([[100, 101, 86, 88], [88, 100, 87, 96]]), cfg, false),
      "sweep",
    ).find((e) => e.direction === "bull");
    assert.equal(one?.reclaimCandles, 1);
    assert.equal(one?.reclaimClosed, true);
    assert.equal(one?.followThrough, false);
    const three = activeSignals(
      detectLiquidity(
        add([
          [100, 101, 86, 88],
          [88, 90, 87, 89],
          [89, 91, 88, 90],
          [90, 100, 89, 96],
        ]),
        cfg,
        false,
      ),
      "sweep",
    ).find((e) => e.direction === "bull");
    assert.equal(three?.reclaimCandles, 3);
    assert.equal(three?.status, "confirmed");
    const highs: ScanBar[] = [];
    for (let i = 0; i < 22; i++) {
      const broke = i >= 12 && i <= 15;
      const back = i === 16;
      highs.push({
        t: 1_700_000_000 + i * 86400,
        o: 100,
        h: i === 6 ? 120 : broke ? 130 : 104,
        l: 99,
        c: broke ? 125 : back ? 110 : 101,
        v: 1000,
      });
    }
    const failed = detectLiquidity(highs, cfg, false).find((e) => e.pattern === "failed" && e.direction === "bear");
    assert.ok(failed);
    assert.equal(failed?.reclaimCandles, 4);
    assert.equal(failed?.reclaimClosed, true);
    assert.equal(replayEveryPrefix(highs, cfg).leaks.length, 0);
  });

  it("keeps equal highs together and a far high out of that zone", () => {
    const rows: ScanBar[] = [];
    for (let i = 0; i < 24; i++) {
      const high = i === 6 || i === 14;
      const far = i === 22;
      rows.push({
        t: 1_700_000_000 + i * 86400,
        o: 100,
        h: far ? 140 : high ? 110 : 104,
        l: 99,
        c: 101,
        v: 1000,
      });
    }
    rows.push({ t: rows[rows.length - 1].t + 86400, o: 104, h: 116, l: 100, c: 102, v: 1000 });
    const events = detectLiquidity(rows, { ...cfg, minAge: 3, equalPct: 0.003 }, false);
    const repeated = events.filter((e) => e.repeated && e.direction === "bear");
    assert.ok(repeated.length >= 1);
    assert.equal(repeated.some((e) => e.zoneHigh >= 140), false);
    assert.equal(replayNoLookahead(rows, { ...cfg, minAge: 3, equalPct: 0.003 }).leaks.length, 0);
  });

  it("lets a reclaim expire without follow-through, and does not need follow-through to be strong", () => {
    const base = withLow(8, 90, 10);
    const start = base[base.length - 1].t;
    const quiet = Array.from({ length: cfg.expiry + 2 }, (_, i) => ({
      t: start + (i + 2) * 86400,
      o: 100,
      h: 102,
      l: 99,
      c: 101,
      v: 1000,
    }));
    const series = base.concat([{ t: start + 86400, o: 100, h: 103, l: 86, c: 96, v: 1000 }, ...quiet]);
    const expired = detectLiquidity(series, cfg, false).find((e) => e.direction === "bull");
    assert.equal(expired?.status, "expired");
    assert.equal(expired?.followThrough, false);
    assert.equal(activeSignals(detectLiquidity(series, cfg, false), "sweep").some((e) => e.id === expired?.id), false);
    assert.equal(replayEveryPrefix(series, cfg).leaks.length, 0);
    const live = base.concat([{ t: start + 86400, o: 101, h: 103, l: 88, c: 95, v: 1000 }]);
    const strong = activeSignals(detectLiquidity(live, { ...cfg, strongScore: 1, minDepthAtr: 0.01, maxDepthAtr: 5 }, false), "sweep").find((e) => e.direction === "bull");
    assert.equal(strong?.status, "confirmed");
    assert.equal(strong?.reclaimClosed, true);
    assert.equal(strong?.followThrough, false);
    assert.equal(strong?.tier, "strong");
    const next = live.concat([{ t: start + 2 * 86400, o: 95, h: 110, l: 94, c: 108, v: 1000 }]);
    const before = detectLiquidity(live, cfg, false).find((e) => e.direction === "bull");
    const after = detectLiquidity(next, cfg, false).find((e) => e.id === before?.id);
    assert.equal(before?.followThrough, false);
    assert.equal(after?.followThrough, true);
    assert.equal(after?.confirmIndex, live.length);
  });

  it("splits strong from potential and keeps invalidation, overlap and Nifty excess apart", () => {
    const tape = Array.from({ length: 12 }, (_, i) => ({ t: 1_700_000_000 + i * 86400, o: 100, h: 110, l: 99, c: 100 + i, v: 1000 }));
    const bench = tape.map((bar) => ({ ...bar, c: 100 }));
    const row = (over: Partial<LiqEvent>): LiqEvent => ({
      id: "a",
      pattern: "sweep",
      direction: "bull",
      tier: "potential",
      status: "confirmed",
      lowQuality: false,
      level: 100,
      zoneLow: 100,
      zoneHigh: 100,
      touches: 1,
      repeated: false,
      swingIndex: 1,
      sweepIndex: 2,
      sweepT: tape[2].t,
      extreme: 90,
      depthPct: 1,
      depthAtr: 0.4,
      reclaimIndex: 2,
      reclaimT: tape[2].t,
      reclaimClose: 102,
      reclaimCandles: 0,
      reclaimKind: "same",
      volumeRatio: 1,
      volumeKnown: true,
      score: 60,
      parts: { swing: 10, sweep: 10, reclaim: 10, volume: 10, candle: 10, confirm: 0 },
      weaknesses: [],
      followThrough: false,
      reclaimClosed: true,
      confirmIndex: null,
      confirmT: null,
      invalidIndex: null,
      explanation: "",
      levelId: "L1",
      ...over,
    });
    const stats = forwardStats(
      [
        row({ id: "a", reclaimIndex: 2, sweepIndex: 2, levelId: "L1", invalidIndex: 4 }),
        row({ id: "b", reclaimIndex: 3, sweepIndex: 3, levelId: "L1" }),
        row({ id: "c", reclaimIndex: 2, sweepIndex: 2, levelId: "L2", tier: "strong" }),
      ],
      tape,
      { symbol: "RELIANCE", bench },
    );
    const potential = stats.find((item) => item.quality === "potential");
    const strong = stats.find((item) => item.quality === "strong");
    assert.ok(potential && strong);
    assert.equal(potential?.n, 2);
    assert.equal(potential?.overlapping, 1);
    assert.equal(potential?.independentN, 1);
    assert.deepEqual(potential?.symbols, ["RELIANCE"]);
    assert.equal(potential?.invalidated, 1);
    assert.equal(potential?.samples.c1, 2);
    assert.equal(potential?.samples.c3, 1);
    assert.equal(potential?.incomplete?.c8, 0);
    assert.equal(potential?.fromT, tape[2].t);
    assert.ok((potential?.excessSamples?.c1 || 0) >= 1);
    assert.equal(strong?.n, 1);
    const merged = mergeStats([
      { ...potential!, excessObs: { c1: [1, 3], c3: [], c5: [], c8: [], mfe: [], mae: [] } },
      { ...strong!, pattern: "sweep", direction: "bull", quality: "potential", excessObs: { c1: [5], c3: [], c5: [], c8: [], mfe: [], mae: [] } },
    ]).find((item) => item.quality === "potential");
    assert.equal(merged?.excessSamples?.c1, 3);
    assert.equal(merged?.excessAvg?.c1, 3);
  });

  it("does not run two scans of one book at the same time, and a failed scan does not jam the next", async () => {
    const gate = createScanGate();
    let current = 0;
    let max = 0;
    const run = () =>
      gate("book", async () => {
        current += 1;
        max = Math.max(max, current);
        await Promise.resolve();
        current -= 1;
      });
    await Promise.all([run(), run(), run()]);
    assert.equal(max, 1);
    await gate("book", async () => {
      throw new Error("interrupted");
    }).catch(() => undefined);
    let resumed = false;
    await gate("book", async () => {
      resumed = true;
    });
    assert.equal(resumed, true);
  });
});
