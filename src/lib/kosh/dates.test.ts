import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareIstDate, formatIstDate, formatIstShort, parseIstDate } from "./dates.ts";

describe("parseIstDate", () => {
  it("reads NSE 18-Sep-2026 and ISO the same way", () => {
    assert.equal(parseIstDate("18-Sep-2026"), "2026-09-18");
    assert.equal(parseIstDate("2026-09-18"), "2026-09-18");
    assert.equal(parseIstDate("18/09/2026"), "2026-09-18");
    assert.equal(parseIstDate("18 Sep 2026"), "2026-09-18");
  });

  it("completes a truncated 18-Sep-202 when the year prefix matches", () => {
    assert.equal(parseIstDate("18-Sep-202", new Date("2026-09-18T10:00:00+05:30")), "2026-09-18");
  });

  it("does not invent a day from junk", () => {
    assert.equal(parseIstDate(""), null);
    assert.equal(parseIstDate("soon"), null);
    assert.equal(parseIstDate("32-Sep-2026"), null);
  });

  it("formats and sorts by the real day, not the string", () => {
    assert.equal(formatIstDate("18-Sep-2026"), "18 Sep 2026");
    assert.equal(formatIstShort("2026-09-18"), "18 Sep");
    assert.ok(compareIstDate("18-Sep-2026", "2026-09-01") > 0);
    assert.ok(compareIstDate("01-Feb-2027", "18-Sep-2026") > 0);
  });
});
