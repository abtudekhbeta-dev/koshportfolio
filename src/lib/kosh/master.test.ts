import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifySecurity, dedupeByIsin, isScreenerEquity, parseListingDate, type Security } from "./master.ts";
import { parseEquityCsv } from "./master.server.ts";

describe("security master filters", () => {
  it("keeps EQ and BE as listed equity, including illiquid T2T", () => {
    assert.equal(classifySecurity("EQ", "Infosys Limited").screener, true);
    assert.equal(classifySecurity("BE", "Thin Print Ltd").screener, true);
    assert.equal(classifySecurity("EQ", "Infosys Limited").kind, "equity");
    assert.equal(isScreenerEquity("BE", "Illiquid Name"), true);
  });

  it("flags SME and GSM without dropping them from the equity set", () => {
    assert.equal(classifySecurity("SM", "Some SME Ltd").board, "sme");
    assert.equal(classifySecurity("SM", "Some SME Ltd").screener, true);
    assert.equal(classifySecurity("BZ", "GSM Name Ltd").board, "gsm");
    assert.equal(classifySecurity("BZ", "GSM Name Ltd").screener, true);
  });

  it("excludes ETFs, REITs, InvITs, prefs and warrants", () => {
    assert.equal(classifySecurity("EQ", "Nippon India ETF Nifty BeES").kind, "etf");
    assert.equal(classifySecurity("EQ", "Nippon India ETF Nifty BeES").screener, false);
    assert.equal(classifySecurity("IV", "Pipeline InvIT").kind, "invit");
    assert.equal(classifySecurity("RE", "Office REIT").kind, "reit");
    assert.equal(classifySecurity("P1", "Someone Preference").kind, "pref");
    assert.equal(classifySecurity("W1", "Foo Warrants").kind, "warrant");
    assert.equal(isScreenerEquity("EQ", "Foo ETF"), false);
  });

  it("dedupes dual symbols on the same ISIN, preferring EQ", () => {
    const rows: Security[] = [
      { symbol: "FOO", name: "Foo", isin: "INE123A01016", series: "BE", listedOn: null, exchange: "NSE", board: "main", active: true, kind: "equity" },
      { symbol: "FOO", name: "Foo", isin: "INE123A01016", series: "EQ", listedOn: null, exchange: "NSE", board: "main", active: true, kind: "equity" },
      { symbol: "BAR", name: "Bar", isin: "INE999A01011", series: "EQ", listedOn: null, exchange: "NSE", board: "main", active: true, kind: "equity" },
    ];
    const out = dedupeByIsin(rows);
    assert.equal(out.length, 2);
    assert.equal(out.find((x) => x.isin === "INE123A01016")?.series, "EQ");
  });

  it("parses NSE listing dates without inventing them", () => {
    assert.equal(parseListingDate("06-Jan-1995"), "1995-01-06");
    assert.equal(parseListingDate("2020-03-15"), "2020-03-15");
    assert.equal(parseListingDate(""), null);
  });
});

describe("EQUITY_L csv", () => {
  it("keeps EQ/BE, drops ETFs, and reads ISIN", () => {
    const csv = [
      "SYMBOL,NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE",
      "INFY,Infosys Limited, EQ, 08-Feb-1995, 5, 1, INE009A01021, 5",
      "THIN,Thin Print Ltd, BE, 01-Jan-2001, 10, 1, INE111A01019, 10",
      "FOOETF,Foo Nifty ETF, EQ, 01-Jan-2010, 10, 1, INF222A01010, 10",
    ].join("\n");
    const rows = parseEquityCsv(csv);
    assert.deepEqual(rows.map((r) => r.symbol).sort(), ["INFY", "THIN"]);
    assert.equal(rows.find((r) => r.symbol === "INFY")?.isin, "INE009A01021");
    assert.equal(rows.find((r) => r.symbol === "THIN")?.series, "BE");
    assert.equal(rows.find((r) => r.symbol === "INFY")?.active, true);
  });

  it("keeps GSM listed equity as active with a GSM board, not dropped", () => {
    const csv = [
      "SYMBOL,NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE",
      "GSMCO,Gsm Name Ltd, BZ, 01-Jan-2012, 10, 1, INE333A01015, 10",
    ].join("\n");
    const rows = parseEquityCsv(csv);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].board, "gsm");
    assert.equal(rows[0].active, true);
    assert.equal(rows[0].kind, "equity");
  });
});
