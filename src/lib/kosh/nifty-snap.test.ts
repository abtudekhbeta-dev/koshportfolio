import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NIFTY50 } from "./universe.ts";
import { _resetNiftySnapshot, getNiftySnapshot, rememberNifty } from "./nifty-snap.ts";

describe("nifty snapshot", () => {
  it("does not store a thin page and does not invent averages", () => {
    _resetNiftySnapshot();
    const thin = NIFTY50.slice(0, 8).map((x) => ({ symbol: x.symbol, pe: 20, roe: 15 }));
    assert.equal(rememberNifty(thin), null);
    assert.equal(getNiftySnapshot(), null);
  });

  it("averages a real constituent set and keeps it when a later page is thin", () => {
    _resetNiftySnapshot();
    const rows = NIFTY50.map((x, i) => ({
      symbol: x.symbol,
      pe: i === 0 ? 900 : 20,
      pb: 4,
      roe: 15,
      roce: 18,
      opm: 22,
      de: 0.4,
      divYield: 1.2,
    }));
    const snap = rememberNifty(rows);
    assert.ok(snap);
    assert.equal(snap.covered, NIFTY50.length);
    assert.ok(snap.pe != null && snap.pe < 40);
    assert.equal(snap.roce, 18);
    assert.equal(snap.opm, 22);
    rememberNifty([{ symbol: "INFY", pe: 10, roe: 10 }]);
    assert.equal(getNiftySnapshot()?.pe, snap.pe);
    _resetNiftySnapshot();
  });
});
