import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seriesScaleMode, volumePaneHeights } from "./chart-scale.ts";
import { volumeBarPx } from "./volume-scale.ts";

const volumes = [0, 125_000, 500_000, 2_000_000];
const pane = 72;
const max = 2_000_000;

function volumeSnapshot() {
  return {
    bars: volumes.map((v) => volumeBarPx(v, max, pane)),
    panes: volumePaneHeights(720, 2),
    volumeMode: seriesScaleMode("volume", true),
    oscillatorMode: seriesScaleMode("oscillator", true),
  };
}

describe("price and volume scales", () => {
  it("linear to log changes only the price mode", () => {
    const before = volumeSnapshot();
    assert.equal(seriesScaleMode("price", false), "normal");
    assert.equal(seriesScaleMode("price", true), "logarithmic");
    assert.deepEqual(volumeSnapshot(), before);
    assert.equal(before.volumeMode, "normal");
    assert.equal(before.oscillatorMode, "normal");
  });

  it("log to linear restores the price mode and leaves volume", () => {
    const onLog = volumeSnapshot();
    assert.equal(seriesScaleMode("price", true), "logarithmic");
    assert.equal(seriesScaleMode("price", false), "normal");
    assert.deepEqual(volumeSnapshot(), onLog);
  });

  it("linear to log to linear is a round trip for volume", () => {
    const linear = volumeSnapshot();
    assert.equal(seriesScaleMode("price", true), "logarithmic");
    const mid = volumeSnapshot();
    assert.equal(seriesScaleMode("price", false), "normal");
    assert.deepEqual(mid, linear);
    assert.deepEqual(volumeSnapshot(), linear);
    assert.deepEqual(linear.bars, [0, 4.5, 18, 72]);
    assert.equal(linear.panes[1], volumePaneHeights(720, 3)[1]);
  });

  it("uses the same volume heights for a low-priced and a high-priced name", () => {
    const low = [20, 24, 19].map(() => volumeBarPx(400_000, 800_000, 54));
    const high = [800, 1200, 900].map(() => volumeBarPx(400_000, 800_000, 54));
    assert.deepEqual(low, high);
    assert.equal(volumeBarPx(0, 800_000, 54), 0);
    assert.equal(seriesScaleMode("volume", true), seriesScaleMode("volume", false));
  });
});
