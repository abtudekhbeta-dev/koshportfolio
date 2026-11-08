import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBseScreenerPage } from "./bse-book.server.ts";
import { composeListedBook } from "./liquidity-universe.ts";

describe("listed book", () => {
  it("keeps BSE-only names and does not repeat a shared ticker on All listed", () => {
    const book = composeListedBook({
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
    });
    assert.deepEqual(book.symbols.map((row) => row.symbol), ["RELIANCE", "INFY", "BSEONLY.BO"]);
    assert.equal(book.bseOnly, 1);
    assert.equal(book.dualSkipped, 1);
    assert.equal(book.symbols.find((row) => row.symbol === "BSEONLY.BO")?.exchange, "BSE");
    const bse = composeListedBook({
      nse: [{ symbol: "RELIANCE", name: "Reliance" }],
      bse: [
        { symbol: "RELIANCE.BO", name: "Reliance BSE" },
        { symbol: "BSEONLY.BO", name: "Only BSE" },
      ],
      mode: "bse",
      bseReady: true,
    });
    assert.deepEqual(bse.symbols.map((row) => row.symbol), ["RELIANCE.BO", "BSEONLY.BO"]);
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

  it("reads BSE equity lines from a screener page and ignores other symbols", () => {
    const page = parseBseScreenerPage({
      finance: {
        result: [
          {
            total: 2,
            quotes: [
              { symbol: "BSEONLY.BO", shortName: "Only", quoteType: "EQUITY" },
              { symbol: "RELIANCE.NS", shortName: "Reliance", quoteType: "EQUITY" },
              { symbol: "GOLD.BO", shortName: "Gold", quoteType: "ETF" },
            ],
          },
        ],
      },
    });
    assert.equal(page.total, 2);
    assert.deepEqual(page.rows, [{ symbol: "BSEONLY.BO", name: "Only" }]);
  });
});
