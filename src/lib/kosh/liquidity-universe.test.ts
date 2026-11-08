import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBseScreenerPage } from "./bse-book.server.ts";
import { bookFingerprint, bseRetrievalStatus, composeListedBook } from "./liquidity-universe.ts";

describe("listed book", () => {
  it("keeps both listings when the ISIN is missing and drops a BSE line only when the ISIN matches", () => {
    const unnamed = composeListedBook({
      nse: [
        { symbol: "RELIANCE", name: "Reliance" },
        { symbol: "INFY.NS", name: "Infosys" },
      ],
      bse: [
        { symbol: "RELIANCE.BO", name: "Reliance BSE" },
        { symbol: "BSEONLY.BO", name: "Only BSE" },
      ],
      mode: "all",
      bseReady: true,
      bseComplete: true,
    });
    assert.deepEqual(unnamed.symbols.map((row) => row.symbol), ["RELIANCE", "INFY", "RELIANCE.BO", "BSEONLY.BO"]);
    assert.equal(unnamed.tickerOnly, 1);
    assert.equal(unnamed.isinMatched, 0);
    assert.equal(unnamed.bseOnly, 1);
    assert.match(unnamed.note, /no ISIN/i);
    assert.equal(unnamed.symbols.find((row) => row.symbol === "RELIANCE.BO")?.exchange, "BSE");

    const matched = composeListedBook({
      nse: [{ symbol: "RELIANCE", name: "Reliance", isin: "INE002A01018" }],
      bse: [
        { symbol: "RELIANCE.BO", name: "Reliance BSE", isin: "INE002A01018" },
        { symbol: "BSEONLY.BO", name: "Only BSE" },
      ],
      mode: "all",
      bseReady: true,
      bseComplete: true,
    });
    assert.deepEqual(matched.symbols.map((row) => row.symbol), ["RELIANCE", "BSEONLY.BO"]);
    assert.equal(matched.isinMatched, 1);
    assert.equal(matched.tickerOnly, 0);
    assert.notEqual(matched.fingerprint, unnamed.fingerprint);

    const conflict = composeListedBook({
      nse: [{ symbol: "RELIANCE", name: "Reliance", isin: "INE002A01018" }],
      bse: [{ symbol: "RELIANCE.BO", name: "Reliance BSE", isin: "INE111A01011" }],
      mode: "all",
      bseReady: true,
      bseComplete: true,
    });
    assert.deepEqual(conflict.symbols.map((row) => row.symbol), ["RELIANCE", "RELIANCE.BO"]);
    assert.equal(conflict.isinConflict, 1);

    const bse = composeListedBook({
      nse: [{ symbol: "RELIANCE", name: "Reliance", isin: "INE002A01018" }],
      bse: [
        { symbol: "RELIANCE.BO", name: "Reliance BSE", isin: "INE002A01018" },
        { symbol: "BSEONLY.BO", name: "Only BSE" },
      ],
      mode: "bse",
      bseReady: true,
      bseComplete: true,
    });
    assert.deepEqual(bse.symbols.map((row) => row.symbol), ["RELIANCE.BO", "BSEONLY.BO"]);

    const partial = composeListedBook({
      nse: [{ symbol: "INFY", name: "Infosys" }],
      bse: [{ symbol: "BSEONLY.BO", name: "Only BSE" }],
      mode: "all",
      bseReady: true,
      bseComplete: false,
    });
    assert.equal(partial.bseComplete, false);
    assert.match(partial.note, /not complete|not the full/i);
    assert.equal(bookFingerprint(partial.symbols, "all|bse-partial|1"), partial.fingerprint);

    const down = composeListedBook({
      nse: [{ symbol: "INFY", name: "Infosys" }],
      bse: [],
      mode: "all",
      bseReady: false,
      bseError: "timeout",
    });
    assert.equal(down.symbols.length, 1);
    assert.match(down.note, /not full coverage/i);
  });

  it("does not call a short, failed, or capped BSE pull complete", () => {
    assert.equal(bseRetrievalStatus({ received: 4986, unique: 4986, total: 4986, pagesFailed: 0, capped: false }).complete, true);
    assert.equal(bseRetrievalStatus({ received: 5000, unique: 4986, total: 4986, pagesFailed: 0, capped: false }).complete, true);
    const short = bseRetrievalStatus({ received: 250, unique: 250, total: 4986, pagesFailed: 0, capped: false });
    assert.equal(short.complete, false);
    assert.match(short.note, /not the full book/i);
    const failed = bseRetrievalStatus({ received: 4986, unique: 4986, total: 4986, pagesFailed: 1, capped: false });
    assert.equal(failed.complete, false);
    const capped = bseRetrievalStatus({ received: 10000, unique: 10000, total: 12000, pagesFailed: 0, capped: true });
    assert.equal(capped.complete, false);
    const dupGap = bseRetrievalStatus({ received: 5000, unique: 4000, total: 4986, pagesFailed: 0, capped: false });
    assert.equal(dupGap.complete, false);
    assert.match(dupGap.note, /unique/i);
    assert.equal(bseRetrievalStatus({ received: 10, unique: 10, total: null, pagesFailed: 0, capped: false }).complete, false);
  });

  it("reads BSE equity lines from a screener page and keeps an ISIN only when it is present", () => {
    const page = parseBseScreenerPage({
      finance: {
        result: [
          {
            total: 2,
            quotes: [
              { symbol: "BSEONLY.BO", shortName: "Only", quoteType: "EQUITY", isin: "INE999A01019" },
              { symbol: "RELIANCE.NS", shortName: "Reliance", quoteType: "EQUITY" },
              { symbol: "GOLD.BO", shortName: "Gold", quoteType: "ETF" },
              { symbol: "NOISIN.BO", shortName: "No isin", quoteType: "EQUITY", isin: "not-an-isin" },
            ],
          },
        ],
      },
    });
    assert.equal(page.total, 2);
    assert.deepEqual(page.rows, [
      { symbol: "BSEONLY.BO", name: "Only", isin: "INE999A01019" },
      { symbol: "NOISIN.BO", name: "No isin" },
    ]);
  });
});
