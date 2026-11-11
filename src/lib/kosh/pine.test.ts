import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ema, rsi, sma } from "./ohlc.ts";
import { compilePine, highlightPine, matchingBracket, pineVersion, runPine, PINE_UNSUPPORTED } from "./pine.ts";
import { loadPineActive, loadPineLibrary, savePineActive, savePineLibrary } from "./pine-store.ts";
import type { OhlcBar } from "./types.ts";

function bars(n = 40): OhlcBar[] {
  const out: OhlcBar[] = [];
  for (let i = 0; i < n; i++) {
    const c = 100 + Math.sin(i / 3) * 5 + i * 0.2;
    out.push({ t: 1_700_000_000 + i * 86400, o: c - 0.4, h: c + 1, l: c - 1, c, v: 1000 + i });
  }
  return out;
}

const SMA = `//@version=5
indicator("SMA", overlay=true)
len = input.int(5, "Length")
plot(ta.sma(close, len), "SMA", color=color.teal)
`;

describe("pine subset", () => {
  it("reads the version and does not rewrite it", () => {
    assert.equal(pineVersion(SMA), 5);
    assert.equal(pineVersion("indicator(\"X\")"), null);
    const old = compilePine("//@version=4\nindicator(\"X\")\nplot(close)");
    assert.equal(old.ok, false);
    if (!old.ok) assert.match(old.errors[0].message, /v4/);
  });

  it("names the line when a function is outside the subset", () => {
    const ran = runPine(`//@version=5\nindicator("X")\nplot(request.security(syminfo.tickerid, "D", close))\n`, bars());
    assert.equal(ran.plots.length, 0);
    assert.match(ran.errors[0].message, /request/);
    assert.equal(ran.errors[0].line, 3);
    assert.equal(PINE_UNSUPPORTED.some((item) => item.includes("request.security")), true);
  });

  it("matches the terminal SMA and leaves the first lookback empty", () => {
    const series = bars();
    const ran = runPine(SMA, series);
    assert.equal(ran.errors.length, 0);
    const expect = sma(series.map((bar) => bar.c), 5);
    assert.deepEqual(ran.plots[0].values, expect);
    const prev = runPine(`//@version=5\nindicator("P", overlay=true)\nplot(close[1], "Prev")\n`, series);
    assert.equal(prev.plots[0].values[0], null);
    assert.equal(prev.plots[0].values[1], series[0].c);
  });

  it("matches RSI and a crossover on the next bar, not before", () => {
    const series = bars(50);
    const closes = series.map((bar) => bar.c);
    const ran = runPine(`//@version=5\nindicator("R", overlay=false)\nplot(ta.rsi(close, 14), "RSI")\n`, series);
    assert.deepEqual(ran.plots[0].values, rsi(closes, 14));
    const cross = runPine(`//@version=6\nindicator("C", overlay=false)\nplot(ta.crossover(ta.ema(close, 3), ta.ema(close, 8)), "Cross")\n`, series);
    const fast = ema(closes, 3);
    const slow = ema(closes, 8);
    const signal = cross.plots[0].values;
    assert.equal(signal[0], 0);
    for (let i = 1; i < series.length; i++) {
      const hit = fast[i - 1] != null && slow[i - 1] != null && fast[i] != null && slow[i] != null && (fast[i - 1] as number) <= (slow[i - 1] as number) && (fast[i] as number) > (slow[i] as number);
      assert.equal(signal[i], hit ? 1 : 0);
    }
  });

  it("changes the plot when an input changes and stops a runaway script", () => {
    const series = bars();
    const short = runPine(SMA, series, { len: 5 });
    const longer = runPine(SMA, series, { len: 8 });
    assert.notDeepEqual(short.plots[0].values, longer.plots[0].values);
    const hot = runPine(SMA, series, {}, 3);
    assert.match(hot.errors[0].message, /too much work/);
    assert.equal(hot.plots.length, 0);
  });

  it("keeps two saved scripts and the ones added to the chart", () => {
    const mem = new Map<string, string>();
    const write = (key: string, value: string) => mem.set(key, value);
    const read = (key: string) => mem.get(key) || null;
    savePineLibrary([{ id: "a", name: "SMA", source: SMA, updatedAt: "2026-01-01" }, { id: "b", name: "Other", source: "//@version=5\nindicator(\"O\")\nplot(close)\n", updatedAt: "2026-01-02" }], write);
    savePineActive(["a"], write);
    assert.equal(loadPineLibrary(read).length, 2);
    assert.deepEqual(loadPineActive(read), ["a"]);
    assert.equal(loadPineLibrary(read)[0].source.includes("ta.sma"), true);
    assert.equal(matchingBracket("plot(close)", 4), 10);
    assert.equal(highlightPine("plot(close)").some((part) => part.kind === "key"), true);
  });
});
