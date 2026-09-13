import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  lastNum,
  rsi,
  sma,
  stoch,
  thinOhlc,
  vwap,
  volumeProfile,
  isNr7,
  supertrend,
  resample,
  sliceLookback,
  nameSwings,
  swings,
} from "./ohlc.ts";
import type { OhlcBar } from "./types.ts";

function bar(i: number, c: number, v = 100): OhlcBar {
  return { t: i, o: c, h: c + 1, l: c - 1, c, v };
}

describe("ohlc", () => {
  it("sma of constants is the constant", () => {
    const s = sma([2, 2, 2, 2, 2], 3);
    assert.equal(s[2], 2);
    assert.equal(s[0], null);
  });

  it("rsi of a straight up series is high", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i);
    const r = rsi(closes, 14);
    const last = r.at(-1);
    assert.ok(last != null && last > 80);
  });

  it("thin keeps first and last", () => {
    const bars: OhlcBar[] = Array.from({ length: 400 }, (_, i) => bar(i, 10 + i));
    const t = thinOhlc(bars, 20);
    assert.ok(t.length <= 21);
    assert.equal(t[0].c, 10);
    assert.equal(t.at(-1)?.c, 10 + 399);
  });

  it("stoch of a high close is stretched", () => {
    const bars = Array.from({ length: 20 }, (_, i) => bar(i, 100 + i));
    const s = stoch(bars, 14, 3);
    const k = lastNum(s.k);
    assert.ok(k != null && k > 80);
  });

  it("vwap sits inside the session", () => {
    const bars = [bar(0, 100, 10), bar(1, 110, 10), bar(2, 90, 10)];
    const v = vwap(bars);
    const last = v.at(-1);
    assert.ok(last != null && last > 90 && last < 110);
  });

  it("volume profile bins volume across the range", () => {
    const bars = Array.from({ length: 12 }, (_, i) => bar(i, 100 + i, 50));
    const vp = volumeProfile(bars, 8);
    assert.equal(vp.length, 8);
    assert.ok(vp.some((x) => x.vol > 0));
  });

  it("nr7 is true when the last range is the tightest of 7", () => {
    const bars = Array.from({ length: 7 }, (_, i) => ({
      t: i,
      o: 10,
      h: 10 + (i === 6 ? 0.2 : 2),
      l: 10,
      c: 10.1,
      v: 1,
    }));
    assert.equal(isNr7(bars), true);
  });

  it("supertrend eventually follows a straight climb", () => {
    const bars = Array.from({ length: 40 }, (_, i) => bar(i, 100 + i * 2, 10));
    const st = supertrend(bars, 10, 3);
    assert.equal(st.dir.at(-1), 1);
  });

  it("resample reduces bar count", () => {
    const bars = Array.from({ length: 30 }, (_, i) => bar(i * 86400, 10 + i));
    const w = resample(bars, 7 * 86400);
    assert.ok(w.length < bars.length);
    assert.equal(w[0].o, 10);
  });

  it("sliceLookback cuts to the last window", () => {
    const now = 1_700_000_000;
    const bars = Array.from({ length: 40 }, (_, i) => bar(now - (39 - i) * 86400, 100 + i));
    const m = sliceLookback(bars, "1M");
    assert.ok(m.length < bars.length);
    assert.ok(m.length >= 2);
    assert.equal(m.at(-1)?.c, bars.at(-1)?.c);
  });

  it("sliceLookback YTD cuts from 1 Jan IST of the last bar", () => {
    const mar15Ist = Date.UTC(2024, 2, 14, 18, 30) / 1000;
    const bars: OhlcBar[] = Array.from({ length: 90 }, (_, i) => bar(mar15Ist - (89 - i) * 86400, 100 + i));
    const ytd = sliceLookback(bars, "YTD");
    const jan1Ist = Date.UTC(2024, 0, 1) / 1000 - 19800;
    assert.ok(ytd.length < bars.length);
    assert.ok(ytd[0].t <= jan1Ist + 86400);
    assert.ok(ytd.at(-1)?.c === bars.at(-1)?.c);
    assert.ok(ytd.every((b) => b.t >= jan1Ist - 86400));
  });
});
