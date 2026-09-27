import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allowedFilingUrl, rateLimit } from "./guard.ts";

describe("rateLimit", () => {
  it("blocks the call that exceeds the window", () => {
    const key = "t-" + Math.random();
    assert.equal(rateLimit(key, 2, 60_000), true);
    assert.equal(rateLimit(key, 2, 60_000), true);
    assert.equal(rateLimit(key, 2, 60_000), false);
  });
});

describe("allowedFilingUrl", () => {
  it("accepts NSE and BSE https links only", () => {
    assert.equal(allowedFilingUrl("https://nsearchives.nseindia.com/corporate/x.xml"), true);
    assert.equal(allowedFilingUrl("https://www.bseindia.com/xml-data/corpfiling/x.xml"), true);
    assert.equal(allowedFilingUrl("http://nseindia.com/x.xml"), false);
    assert.equal(allowedFilingUrl("https://evil.example/nseindia.com"), false);
    assert.equal(allowedFilingUrl("not a url"), false);
  });
});
