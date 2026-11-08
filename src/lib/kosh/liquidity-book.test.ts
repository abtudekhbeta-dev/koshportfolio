import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scanIsComplete } from "./liquidity.ts";
import {
  capBand,
  capIsFresh,
  hashPins,
  liquidityCacheKey,
  MCAP_TTL_MS,
  mcapActive,
  mcapCacheToken,
  parseCr,
  passesMcap,
  portfolioScanBook,
  selectByMcap,
  type CapObservation,
  type McapSpec,
} from "./liquidity-book.ts";

const known = (mcapCr: number): CapObservation => ({ mcapCr, asOf: 1_700_000_000_000, state: "known" });

describe("market cap gate", () => {
  it("uses Kosh bands and does not treat a missing cap as zero", () => {
    assert.equal(capBand(25_000), "large");
    assert.equal(capBand(20_000), "large");
    assert.equal(capBand(5_000), "mid");
    assert.equal(capBand(500), "small");
    assert.equal(capBand(50), "micro");
    assert.equal(capBand(49), "nano");
    assert.equal(capBand(0), null);
    assert.equal(capBand(null), null);
    const spec: McapSpec = { band: "small", minCr: null, maxCr: null, includeUnknown: false };
    assert.equal(passesMcap({ mcapCr: null, asOf: 1, state: "missing" }, spec), false);
    assert.equal(passesMcap({ mcapCr: null, asOf: 1, state: "unavailable" }, spec), false);
    assert.equal(passesMcap(known(800), spec), true);
    assert.equal(passesMcap(known(40), spec), false);
  });

  it("supports a minimum only, a maximum only, and a custom range", () => {
    const minOnly: McapSpec = { band: "all", minCr: 1_000, maxCr: null, includeUnknown: false };
    const maxOnly: McapSpec = { band: "all", minCr: null, maxCr: 1_000, includeUnknown: false };
    assert.equal(passesMcap(known(1_000), minOnly), true);
    assert.equal(passesMcap(known(999), minOnly), false);
    assert.equal(passesMcap(known(1_000), maxOnly), true);
    assert.equal(passesMcap(known(1_001), maxOnly), false);
    const range: McapSpec = { band: "all", minCr: 500, maxCr: 5_000, includeUnknown: false };
    assert.equal(passesMcap(known(500), range), true);
    assert.equal(passesMcap(known(5_000), range), true);
    assert.equal(passesMcap(known(499), range), false);
    assert.equal(passesMcap(known(5_001), range), false);
    assert.equal(mcapActive({ band: "all", minCr: null, maxCr: null, includeUnknown: false }), false);
  });

  it("filters the book before anything is scanned and counts missing caps apart from exclusions", () => {
    const rows = [
      { symbol: "BIG" },
      { symbol: "MID" },
      { symbol: "SMALL" },
      { symbol: "TINY" },
      { symbol: "NONE" },
      { symbol: "DOWN" },
    ];
    const caps = new Map<string, CapObservation>([
      ["BIG.NS", known(30_000)],
      ["MID.NS", known(8_000)],
      ["SMALL.NS", known(900)],
      ["TINY.NS", known(20)],
      ["NONE.NS", { mcapCr: null, asOf: 10, state: "missing" }],
      ["DOWN.NS", { mcapCr: null, asOf: 9, state: "unavailable" }],
    ]);
    const spec: McapSpec = { band: "small", minCr: null, maxCr: null, includeUnknown: false };
    const picked = selectByMcap(rows, caps, spec, (row) => `${row.symbol}.NS`);
    assert.deepEqual(picked.eligible.map((row) => row.symbol), ["SMALL"]);
    assert.equal(picked.excluded, 3);
    assert.equal(picked.missing, 1);
    assert.equal(picked.unavailable, 1);
    assert.equal(picked.asOf, 9);
    const withUnknown = selectByMcap(rows, caps, { ...spec, includeUnknown: true }, (row) => `${row.symbol}.NS`);
    assert.deepEqual(withUnknown.eligible.map((row) => row.symbol), ["SMALL", "NONE", "DOWN"]);
  });

  it("changes the scan key when eligibility changes and leaves an unfiltered key alone", () => {
    const plain = liquidityCacheKey("1W", "nse", [], "book");
    assert.equal(plain, "v3|1W|nse|book|");
    const small = mcapCacheToken({ band: "small", minCr: null, maxCr: null, includeUnknown: false }, ["AAA.NS", "BBB.NS"]);
    const other = mcapCacheToken({ band: "small", minCr: null, maxCr: null, includeUnknown: false }, ["AAA.NS"]);
    assert.notEqual(small, other);
    assert.equal(liquidityCacheKey("1W", "nse", [], "book", small).startsWith(plain + "|"), true);
    assert.equal(mcapCacheToken({ band: "all", minCr: null, maxCr: null, includeUnknown: true }, ["AAA.NS"]), "");
    assert.equal(hashPins(["b.NS", "a.NS"]), hashPins(["A.NS", "B.NS"]));
  });

  it("keeps NSE and BSE apart, drops duplicate holdings, and names what cannot be scanned", () => {
    const book = portfolioScanBook([
      { symbol: "RELIANCE", name: "Reliance" },
      { symbol: "RELIANCE.NS", name: "Reliance NSE" },
      { symbol: "RELIANCE.BO", name: "Reliance BSE" },
      { symbol: "TCS", name: "TCS" },
      { symbol: "GOLD", name: "Gold", kind: "commodity" },
      { symbol: "^NSEI", name: "Nifty" },
    ]);
    assert.deepEqual(book.rows.map((row) => `${row.exchange}:${row.symbol}`), ["NSE:RELIANCE", "BSE:RELIANCE.BO", "NSE:TCS"]);
    assert.equal(book.unmapped.length, 2);
    assert.equal(portfolioScanBook([]).rows.length, 0);
    assert.equal(parseCr("1,000"), 1000);
    assert.equal(parseCr(""), null);
  });

  it("changes the scan key when portfolio membership changes, and a filtered finish is not the full book", () => {
    const before = liquidityCacheKey("1W", "portfolio", ["RELIANCE", "TCS"], "ports");
    const after = liquidityCacheKey("1W", "portfolio", ["RELIANCE", "TCS", "INFY"], "ports");
    assert.notEqual(before, after);
    const listed = 100;
    const eligible = 8;
    assert.equal(scanIsComplete(eligible, 8, 0, null), true);
    assert.equal(scanIsComplete(listed, 8, 0, null), false);
    assert.equal(capIsFresh(1_000, 1_000 + MCAP_TTL_MS), true);
    assert.equal(capIsFresh(1_000, 1_000 + MCAP_TTL_MS + 1), false);
    assert.equal(capIsFresh(null, 1_000), false);
  });
});
