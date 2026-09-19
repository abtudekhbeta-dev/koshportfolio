import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { OhlcBar } from "./types.ts";
import {
  barBucket,
  moveWatchSymbols,
  patchLastBar,
  quoteStatus,
  quoteStatusLabel,
  termBars,
  termFetchSpec,
} from "./market-data.ts";

function bar(t: number, o: number, h: number, l: number, c: number, v = 10): OhlcBar {
  return { t, o, h, l, c, v };
}

describe("quoteStatus", () => {
  it("is session only when the cash session is open and a price exists", () => {
    assert.equal(quoteStatus({ session: true, price: 100 }), "session");
    assert.equal(quoteStatusLabel("session"), "SESSION");
  });

  it("is last available after the session when a price exists", () => {
    assert.equal(quoteStatus({ session: false, price: 100 }), "last");
    assert.equal(quoteStatusLabel("last"), "LAST AVAILABLE");
  });

  it("is unavailable when there is no price", () => {
    assert.equal(quoteStatus({ session: true, price: 0 }), "off");
    assert.equal(quoteStatus({ session: false, price: null }), "off");
    assert.equal(quoteStatusLabel("off"), "UNAVAILABLE");
  });

  it("never treats a missing print as live", () => {
    assert.notEqual(quoteStatus({ session: true, price: 0 }), "session");
  });
});

describe("termFetchSpec", () => {
  it("3m fetches 1m and resamples 180s — does not invent a native 3m feed", () => {
    const s = termFetchSpec("3m");
    assert.equal(s.yahoo, "1m");
    assert.equal(s.resample, 180);
    assert.equal(s.bucketSec, 180);
  });

  it("4H fetches 60m and resamples 14400s", () => {
    const s = termFetchSpec("4H");
    assert.equal(s.yahoo, "60m");
    assert.equal(s.resample, 14400);
  });

  it("daily uses 1d raw close, not a resampled invent", () => {
    const s = termFetchSpec("D");
    assert.equal(s.yahoo, "1d");
    assert.equal(s.resample, 0);
  });
});

describe("termBars RAW OHLC", () => {
  it("3m resample keeps first open, max high, min low, last close", () => {
    const bars = [
      bar(0, 10, 12, 9, 11, 1),
      bar(60, 11, 13, 10, 12, 2),
      bar(120, 12, 14, 11, 13, 3),
    ];
    const out = termBars(bars, termFetchSpec("3m"));
    assert.equal(out.length, 1);
    assert.equal(out[0].o, 10);
    assert.equal(out[0].h, 14);
    assert.equal(out[0].l, 9);
    assert.equal(out[0].c, 13);
    assert.equal(out[0].v, 6);
    assert.equal(out[0].adj, undefined);
  });

  it("4H resample from 60m keeps raw close, never adj", () => {
    const hour = 3600;
    const bars = [
      { t: 0, o: 100, h: 102, l: 99, c: 101, v: 5, adj: 90 },
      { t: hour, o: 101, h: 110, l: 100, c: 108, v: 7, adj: 91 },
      { t: 2 * hour, o: 108, h: 109, l: 105, c: 106, v: 4, adj: 92 },
      { t: 3 * hour, o: 106, h: 107, l: 104, c: 105, v: 3, adj: 93 },
    ];
    const out = termBars(bars, termFetchSpec("4H"));
    assert.equal(out.length, 1);
    assert.equal(out[0].o, 100);
    assert.equal(out[0].h, 110);
    assert.equal(out[0].l, 99);
    assert.equal(out[0].c, 105);
    assert.equal(out[0].v, 19);
  });

  it("does not fabricate bars when resample is off", () => {
    const bars = [bar(0, 10, 11, 9, 10), bar(86400, 10, 12, 8, 11)];
    const out = termBars(bars, termFetchSpec("D"));
    assert.equal(out.length, 2);
    assert.equal(out[0].c, 10);
    assert.equal(out[1].c, 11);
  });
});

describe("patchLastBar", () => {
  const spec = termFetchSpec("5m");

  it("updates the last candle in the same bucket", () => {
    const t0 = 1_700_000_000;
    const bucket = barBucket(t0, spec);
    const bars = [bar(bucket, 100, 101, 99, 100.5)];
    const out = patchLastBar(bars, { price: 102, retrievedAt: (bucket + 60) * 1000 }, spec);
    assert.equal(out.length, 1);
    assert.equal(out[0].o, 100);
    assert.equal(out[0].h, 102);
    assert.equal(out[0].l, 99);
    assert.equal(out[0].c, 102);
    assert.equal(out[0].v, 10);
  });

  it("does not refetch-replace earlier candles", () => {
    const t0 = 1_700_000_000;
    const b0 = barBucket(t0, spec);
    const bars = [bar(b0 - spec.bucketSec, 90, 91, 89, 90), bar(b0, 100, 101, 99, 100)];
    const out = patchLastBar(bars, { price: 103, retrievedAt: (b0 + 10) * 1000 }, spec);
    assert.equal(out[0].c, 90);
    assert.equal(out[1].c, 103);
    assert.equal(out.length, 2);
  });

  it("opens a new candle when the timeframe rolls", () => {
    const t0 = 1_700_000_000;
    const b0 = barBucket(t0, spec);
    const bars = [bar(b0, 100, 101, 99, 100)];
    const later = (b0 + spec.bucketSec + 5) * 1000;
    const out = patchLastBar(bars, { price: 104, retrievedAt: later }, spec);
    assert.equal(out.length, 2);
    assert.equal(out[0].c, 100);
    assert.equal(out[1].o, 104);
    assert.equal(out[1].c, 104);
    assert.equal(out[1].v, 0);
  });

  it("ignores a missing price", () => {
    const bars = [bar(0, 10, 11, 9, 10)];
    const out = patchLastBar(bars, { price: 0 }, spec);
    assert.equal(out, bars);
  });

  it("patches a daily bar on the same IST day using raw close", () => {
    const specD = termFetchSpec("D");
    const t = Date.parse("2026-09-18T10:00:00+05:30") / 1000;
    const bars = [bar(t, 100, 105, 99, 101)];
    const later = Date.parse("2026-09-18T15:20:00+05:30");
    const out = patchLastBar(bars, { price: 108, retrievedAt: later }, specD);
    assert.equal(out.length, 1);
    assert.equal(out[0].o, 100);
    assert.equal(out[0].h, 108);
    assert.equal(out[0].c, 108);
  });
});

describe("moveWatchSymbols", () => {
  it("reorders without dropping names", () => {
    const out = moveWatchSymbols(["A", "B", "C"], 2, 0);
    assert.deepEqual(out, ["C", "A", "B"]);
  });

  it("no-ops on a bad index", () => {
    const src = ["A", "B"];
    assert.deepEqual(moveWatchSymbols(src, 9, 0), src);
  });
});
