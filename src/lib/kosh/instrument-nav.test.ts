import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanHoldSort, instrumentKind, terminalSearch } from "./instrument-nav.ts";

describe("instrument navigation", () => {
  it("treats caret indices as indices, not stocks", () => {
    assert.equal(instrumentKind("^NSEI"), "index");
    assert.equal(instrumentKind("^NSEBANK"), "index");
    assert.equal(instrumentKind("^CNXIT"), "index");
    assert.equal(instrumentKind("RELIANCE"), "stock");
    assert.equal(instrumentKind("GOLD"), "commodity");
  });

  it("puts the requested symbol in the Terminal address", () => {
    const q = terminalSearch("^NSEI", "Nifty 50");
    assert.equal(q.view, "terminal");
    assert.equal(q.symbol, "^NSEI");
    assert.equal(q.name, "Nifty 50");
  });

  it("drops value and weight from the holdings sort", () => {
    assert.equal(cleanHoldSort({ key: "value", dir: "desc" }), null);
    assert.equal(cleanHoldSort({ key: "weight", dir: "asc" }), null);
    assert.deepEqual(cleanHoldSort({ key: "chgPct", dir: "desc" }), { key: "chgPct", dir: "desc" });
    assert.deepEqual(cleanHoldSort(null), null);
  });
});
