import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateAlert, type AlertRule } from "./alerts.ts";
import type { Quote, ScreenRow } from "./types.ts";

function rule(patch: Partial<AlertRule>): AlertRule {
  return { id: "1", symbol: "INFY", name: "Infosys", price: 100, dir: "above", ...patch };
}

describe("alerts", () => {
  it("fires a price cross once and ignores a paused or expired rule", () => {
    const quote = { price: 110 } as Quote;
    assert.equal(evaluateAlert(rule({ price: 100, dir: "above" }), quote, undefined).hit, true);
    assert.equal(evaluateAlert(rule({ price: 100, dir: "below" }), quote, undefined).hit, false);
    assert.equal(evaluateAlert(rule({ status: "paused" }), quote, undefined).hit, false);
    assert.equal(evaluateAlert(rule({ expiresAt: 1_000 }), quote, undefined, 5_000).expired, true);
  });

  it("treats a moving-average cross as a change of side, not the current side", () => {
    const row = { above50: true } as ScreenRow;
    const first = evaluateAlert(rule({ kind: "ma", price: 50, dir: "above" }), undefined, row);
    assert.equal(first.hit, false);
    assert.equal(first.memory, true);
    const cross = evaluateAlert(rule({ kind: "ma", price: 50, dir: "above", lastAbove: false }), undefined, row);
    assert.equal(cross.hit, true);
  });

  it("keeps the NSE symbol it was given", () => {
    const hit = evaluateAlert(rule({ symbol: "RELIANCE", exchange: "NSE", kind: "pct", price: 2, dir: "above" }), { price: 10, changePct: 2.4 } as Quote, undefined);
    assert.equal(hit.hit, true);
    assert.equal(rule({ symbol: "TCS.BO", exchange: "BSE" }).symbol, "TCS.BO");
  });
});
