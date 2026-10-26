import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reconcileTrades } from "./ingest-review.ts";
import { applyIdCorrection, assessImport, duplicateGroups, revertTouches } from "./import-safety.ts";
import type { TradeLine } from "./types.ts";

function line(partial: Partial<TradeLine> & Pick<TradeLine, "symbol" | "qty" | "price" | "side">): TradeLine {
  return { name: partial.symbol, date: partial.date ?? "2026-10-21", ...partial };
}

describe("import safety", () => {
  it("warns when a file has headers but no accepted rows", () => {
    const report = assessImport({ rowsRead: 4, accepted: 0, ignored: 4, holdings: 0, trades: 0 });
    assert.equal(report.suspicious, true);
    assert.match(report.warnings.join(" "), /not accepted|no holding or trade/i);
    assert.notEqual(report.shape, "holdings-snapshot");
  });

  it("keeps repeated broker ids as duplicates and does not treat a different price as a silent overwrite", () => {
    const existing = [line({ symbol: "TCS", qty: 10, price: 100, side: 1, id: "A1" })];
    const incoming = [
      line({ symbol: "TCS", qty: 10, price: 100, side: 1, id: "A1" }),
      line({ symbol: "TCS", qty: 12, price: 110, side: 1, id: "A1" }),
    ];
    const rec = reconcileTrades(existing, incoming);
    assert.equal(rec.brokerDuplicates.length, 1);
    assert.equal(rec.conflicts.length, 1);
    assert.equal(rec.fresh.length, 0);
  });

  it("does not group same-day partial fills that differ in quantity", () => {
    const incoming = [
      line({ symbol: "INFY", qty: 5, price: 20, side: 1, date: "2026-10-21", boughtAt: "09:30" }),
      line({ symbol: "INFY", qty: 7, price: 20, side: 1, date: "2026-10-21", boughtAt: "09:31" }),
    ];
    assert.equal(duplicateGroups([], incoming).length, 0);
    const same = [
      line({ symbol: "INFY", qty: 5, price: 20, side: 1, date: "2026-10-21", boughtAt: "09:30" }),
      line({ symbol: "INFY", qty: 5, price: 20, side: 1, date: "2026-10-21", boughtAt: "09:30" }),
    ];
    assert.equal(duplicateGroups([], same).length, 1);
  });

  it("applies a same-id correction only when asked and refuses an invalid price", () => {
    const existing = [line({ symbol: "TCS", qty: 10, price: 100, side: 1, id: "A1" })];
    const bad = applyIdCorrection(existing, line({ symbol: "TCS", qty: 12, price: 0, side: 1, id: "A1" }));
    assert.equal(bad.ok, false);
    assert.equal(existing[0]?.qty, 10);
    const good = applyIdCorrection(existing, line({ symbol: "TCS", qty: 12, price: 110, side: 1, id: "A1" }));
    assert.equal(good.ok, true);
    if (good.ok) assert.equal(good.next[0]?.qty, 12);
  });

  it("undoes an added line and stops if that line was edited later", () => {
    const added = line({ symbol: "TCS", qty: 4, price: 50, side: 1, id: "N1" });
    const undone = revertTouches([added], [{ op: "add", id: "N1", symbol: "TCS", date: "2026-10-21", side: 1, qty: 4, price: 50 }]);
    assert.equal(undone.ok, true);
    if (undone.ok) assert.equal(undone.next.length, 0);
    const edited = revertTouches([{ ...added, qty: 9 }], [{ op: "add", id: "N1", symbol: "TCS", date: "2026-10-21", side: 1, qty: 4, price: 50 }]);
    assert.equal(edited.ok, false);
  });

  it("imports the same broker id twice as a duplicate, not a second fill", () => {
    const first = [line({ symbol: "RELIANCE", qty: 1, price: 10, side: 1, id: "Z" })];
    const second = reconcileTrades(first, [line({ symbol: "RELIANCE", qty: 1, price: 10, side: 1, id: "Z" })]);
    assert.equal(second.brokerDuplicates.length, 1);
    assert.equal(second.fresh.length, 0);
  });
});
