import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listingId, mergeSearchQuotes, sameListing, yahooCandidates } from "./listing.ts";

describe("listing identity", () => {
  it("keeps NSE bare and BSE dotted as different instruments", () => {
    assert.equal(listingId("RELIANCE"), "RELIANCE");
    assert.equal(listingId("RELIANCE.NS"), "RELIANCE");
    assert.equal(listingId("reliance.bo"), "RELIANCE.BO");
    assert.equal(listingId("RELIANCE", "BSE"), "RELIANCE.BO");
    assert.equal(sameListing("TCS", "TCS.NS"), true);
    assert.equal(sameListing("TCS", "TCS.BO"), false);
  });

  it("shows both exchanges when Yahoo returns both", () => {
    const rows = mergeSearchQuotes(
      [{ symbol: "RELIANCE", name: "Reliance Industries", exch: "NSE" }],
      [
        { symbol: "RELIANCE.NS", name: "Reliance Industries Limited", exch: "NSE" },
        { symbol: "RELIANCE.BO", name: "RELIANCE INDUSTRIES LTD", exch: "BSE" },
      ],
    );
    assert.deepEqual(
      rows.map((row) => [row.symbol, row.exch]),
      [
        ["RELIANCE", "NSE"],
        ["RELIANCE.BO", "BSE"],
      ],
    );
    assert.equal(rows[0].name, "Reliance Industries");
  });

  it("does not invent a BSE row", () => {
    const rows = mergeSearchQuotes([{ symbol: "INFY", name: "Infosys", exch: "NSE" }], []);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].exch, "NSE");
  });

  it("does not fall through to the other exchange when the suffix is explicit", () => {
    assert.deepEqual(yahooCandidates("TCS.BO", ["TCS"]), ["TCS.BO"]);
    assert.deepEqual(yahooCandidates("TCS.NS", ["TCS"]), ["TCS.NS"]);
    assert.deepEqual(yahooCandidates("TCS", ["TCS"]), ["TCS.NS", "TCS.BO"]);
  });
});
