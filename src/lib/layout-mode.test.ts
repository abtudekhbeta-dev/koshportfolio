import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeLayout } from "./layout-mode.ts";

describe("layout preference", () => {
  it("keeps classic, studio and ledger, and retires intelligence", () => {
    assert.equal(normalizeLayout("classic"), "classic");
    assert.equal(normalizeLayout("intelligence"), "studio");
    assert.equal(normalizeLayout("studio"), "studio");
    assert.equal(normalizeLayout("ledger"), "ledger");
    assert.equal(normalizeLayout("terminal"), "classic");
    assert.equal(normalizeLayout("research"), "classic");
    assert.equal(normalizeLayout("compact"), "classic");
    assert.equal(normalizeLayout(null), "classic");
    assert.equal(normalizeLayout("nope"), "classic");
  });
});
