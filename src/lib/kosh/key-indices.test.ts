import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_KEY_SYMBOLS, loadKeyIndices, moveKey, sanitizeKeyIndices } from "./key-indices.ts";
import { NIFTY_CATALOGUE } from "./nifty-catalogue.ts";

describe("key indices", () => {
  it("keeps the default inside the catalogue and drops an unknown symbol", () => {
    for (const symbol of DEFAULT_KEY_SYMBOLS) {
      assert.ok(NIFTY_CATALOGUE.some((row) => row.symbol === symbol), symbol);
    }
    const saved = sanitizeKeyIndices(["^NSEI", "NOT_AN_INDEX", "^NSEI", "^CNXIT"]);
    assert.deepEqual(saved, ["^NSEI", "^CNXIT"]);
    assert.deepEqual(loadKeyIndices(null), [...DEFAULT_KEY_SYMBOLS]);
    assert.deepEqual(loadKeyIndices("[]"), []);
    assert.deepEqual(loadKeyIndices("{"), [...DEFAULT_KEY_SYMBOLS]);
  });

  it("reorders without duplicating or dropping", () => {
    const next = moveKey(["A", "B", "C"], 0, 2);
    assert.deepEqual(next, ["B", "C", "A"]);
    assert.deepEqual(moveKey(["A"], 0, 5), ["A"]);
  });
});
