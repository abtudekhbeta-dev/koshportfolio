import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redactSensitive, sanitizeHolding, sanitizePortfolio } from "./sanitize.ts";
import type { Portfolio } from "./types.ts";

describe("cloud sanitizer", () => {
  it("strips PAN and long account numbers", () => {
    const text = redactSensitive("Holder ABCDE1234F demat 1234567890123456");
    assert.equal(text.includes("ABCDE1234F"), false);
    assert.equal(text.includes("1234567890123456"), false);
  });

  it("does not keep a broker trade id on a holding sent to the cloud", () => {
    const p: Portfolio = {
      id: "p1",
      name: "Main ABCDE1234F",
      bench: "nifty",
      holdings: [
        {
          symbol: "TCS",
          name: "Tata",
          qty: 2,
          avg: 100,
          date: "2024-01-02",
          isin: "INE467B01029",
        },
      ],
    };
    const out = sanitizePortfolio(p);
    assert.equal(out.name.includes("ABCDE1234F"), false);
    assert.equal(out.holdings[0].symbol, "TCS");
    assert.equal(out.holdings[0].isin, "INE467B01029");
    assert.equal("id" in sanitizeHolding(p.holdings[0]), false);
  });

  it("keeps an import summary and strips a PAN from the filename", () => {
    const p: Portfolio = {
      id: "p1",
      name: "Main",
      bench: "nifty",
      holdings: [],
      imports: [
        {
          id: "imp-1",
          at: 1,
          kind: "path",
          filename: "ABCDE1234F.csv",
          rowsRead: 4,
          accepted: 3,
          ignored: 1,
          duplicates: 1,
          ambiguous: 0,
          missingPrices: 0,
          unresolved: 0,
          aiStatus: "failed",
          aiClass: "quota",
          fallback: true,
          applied: 3,
          note: "parser kept the rows",
        },
      ],
    };
    const out = sanitizePortfolio(p);
    assert.equal(out.imports?.length, 1);
    assert.equal(out.imports?.[0].rowsRead, 4);
    assert.equal(out.imports?.[0].fallback, true);
    assert.equal(out.imports?.[0].filename?.includes("ABCDE1234F"), false);
  });
});
