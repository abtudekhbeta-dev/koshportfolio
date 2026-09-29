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
});
