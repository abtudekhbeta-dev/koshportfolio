import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseJournalCsv } from "./journal-csv.ts";
import { journalStats, tradePnl, type JournalTrade } from "./journal-stats.ts";

function trade(patch: Partial<JournalTrade>): JournalTrade {
  return {
    id: patch.id || "1",
    symbol: patch.symbol || "INFY",
    exchange: patch.exchange || "NSE",
    name: "Infosys",
    strategy: patch.strategy || "Breakout",
    direction: patch.direction || "long",
    entryAt: patch.entryAt || Date.parse("2026-01-05T04:00:00Z"),
    exitAt: patch.exitAt === undefined ? Date.parse("2026-01-08T04:00:00Z") : patch.exitAt,
    entryPx: patch.entryPx || 100,
    exitPx: patch.exitPx === undefined ? 110 : patch.exitPx,
    qty: patch.qty || 10,
    stop: patch.stop === undefined ? 95 : patch.stop,
    target: patch.target === undefined ? 120 : patch.target,
    fees: patch.fees || 0,
    taxes: patch.taxes || 0,
    slippage: patch.slippage || 0,
    timeframe: "1D",
    tags: [],
    notes: "",
    rules: patch.rules || { entry: true, stop: true, target: true },
    behaviour: patch.behaviour || [],
    group: "",
    chartRef: "",
    importKey: "",
    updatedAt: 1,
  };
}

describe("trading journal", () => {
  it("subtracts fees and does not book an open trade as realised", () => {
    const closed = trade({ fees: 15, taxes: 5 });
    assert.equal(tradePnl(closed).pnl, 80);
    const open = trade({ exitPx: null, exitAt: null });
    assert.equal(tradePnl(open).closed, false);
    assert.equal(tradePnl(open, 90).pnl, -100);
    const stats = journalStats([closed, open], { INFY: 90 });
    assert.equal(stats.closed, 1);
    assert.equal(stats.open, 1);
    assert.equal(stats.realised, 80);
    assert.equal(stats.unrealised, -100);
    assert.ok((stats.avgR || 0) > 0);
  });

  it("separates rule-following trades from the rest", () => {
    const good = trade({ id: "a" });
    const bad = trade({ id: "b", exitPx: 90, behaviour: ["revenge"], rules: { entry: false, stop: true, target: null } });
    const stats = journalStats([good, bad]);
    assert.equal(stats.cleanPnl, 100);
    assert.equal(stats.brokenPnl, -100);
    assert.equal(stats.profitFactor, 1);
    assert.equal(stats.byStrategy[0]?.key, "Breakout");
  });

  it("skips a duplicate CSV row", () => {
    const csv = "Symbol,Exchange,Side,Qty,Entry price,Entry date,Exit price,Exit date,Fees\nINFY,NSE,BUY,10,100,2026-01-05,110,2026-01-08,15\nINFY,NSE,BUY,10,100,2026-01-05,110,2026-01-08,15\n";
    const parsed = parseJournalCsv(csv, []);
    assert.equal(parsed.added.length, 1);
    assert.equal(parsed.skipped, 1);
    assert.equal(parsed.added[0].exchange, "NSE");
    const again = parseJournalCsv(csv, parsed.added);
    assert.equal(again.added.length, 0);
    assert.equal(again.skipped, 2);
  });
});
