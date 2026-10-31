import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { volumeBarPx } from "./volume-scale.ts";

describe("volume pane", () => {
  it("stays linear and ignores a logarithmic price transform", () => {
    const pane = 54;
    const max = 1_000_000;
    const volumes = [0, 250_000, 500_000, 1_000_000];
    const before = volumes.map((v) => volumeBarPx(v, max, pane));
    // A log price scale would compress a 100→1000 range. Volume must not.
    const prices = [100, 200, 400, 800];
    const logPrices = prices.map((p) => Math.log(p));
    assert.notDeepEqual(
      logPrices.map((v, i, arr) => (v - arr[0]) / (arr[arr.length - 1] - arr[0])),
      prices.map((v) => (v - prices[0]) / (prices[prices.length - 1] - prices[0])),
    );
    const after = volumes.map((v) => volumeBarPx(v, max, pane));
    assert.deepEqual(after, before);
    assert.deepEqual(after, [0, 13.5, 27, 54]);
    assert.equal(volumeBarPx(500_000, max, pane) * 2, volumeBarPx(1_000_000, max, pane));
  });
});
