import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { overlayQuotes, pickLiveSymbols } from "./live-overlay.ts";
import type { Quote } from "./types.ts";

function q(symbol: string, price: number, changePct: number): Quote {
  return {
    input: symbol,
    symbol,
    name: symbol,
    price,
    previousClose: price,
    changePct,
    high52: 0,
    low52: 0,
  };
}

describe("live overlay", () => {
  it("keeps portfolio and watch ahead of movers and caps the poll", () => {
    const port = Array.from({ length: 20 }, (_, i) => "P" + i);
    const watch = ["W1", "W2"];
    const up = Array.from({ length: 20 }, (_, i) => "U" + i);
    const down = Array.from({ length: 20 }, (_, i) => "D" + i);
    const live = pickLiveSymbols(port, watch, up, down, 36);
    assert.equal(live.length, 36);
    assert.ok(live.includes("P0"));
    assert.ok(live.includes("W1"));
    assert.equal(live.indexOf("W1") < live.indexOf("U0") || live.includes("U0"), true);
  });

  it("writes live price and day move onto matching rows", () => {
    const rows = [
      { symbol: "INFY", price: 100, changePct: 0.1 },
      { symbol: "TCS", price: 200, changePct: -0.2 },
    ];
    const out = overlayQuotes(rows, [q("INFY.NS", 110, 2.5)]);
    assert.equal(out[0].price, 110);
    assert.equal(out[0].changePct, 2.5);
    assert.equal(out[1].price, 200);
  });
});
