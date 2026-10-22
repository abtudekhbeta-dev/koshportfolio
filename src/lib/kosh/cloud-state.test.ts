import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideSave, docFingerprint, emptyCloud, mergeCloud, tradeIdentity, unionCloudTrades, withListDrop, withPortfolioDrop, withSymbolDrop, withTradeDrops } from "./cloud-state.ts";
import type { TradeLine } from "./types.ts";

function port(id: string, trades: TradeLine[], updatedAt = 0) {
  return {
    id,
    name: id,
    bench: "nifty",
    holdings: [{ symbol: "TCS", name: "TCS", qty: 1, avg: 10, date: "2020-01-01" }],
    trades,
    updatedAt,
  };
}

function trade(patch: Partial<TradeLine> = {}): TradeLine {
  return { symbol: "TCS", name: "TCS", qty: 1, price: 10, date: "2020-01-01", side: 1, ...patch };
}

describe("cloud identity", () => {
  it("keeps two executions when their broker ids differ", () => {
    const a = trade({ id: "a" });
    const b = trade({ id: "b" });
    assert.notEqual(tradeIdentity(a), tradeIdentity(b));
    assert.equal(unionCloudTrades([a], [b]).length, 2);
    assert.equal(unionCloudTrades([a], [a]).length, 1);
  });

  it("does not bring a deleted portfolio back from a stale device", () => {
    const remote = emptyCloud();
    remote.portfolios = [port("p1", [trade()], 100)];
    const local = emptyCloud();
    local.portfolios = [];
    local.drops = withPortfolioDrop(undefined, "p1", 500);
    const merged = mergeCloud(local, remote);
    assert.equal(merged.doc.portfolios.length, 0);
    const again = mergeCloud(merged.doc, remote);
    assert.equal(again.doc.portfolios.length, 0);
  });

  it("does not bring a deleted trade back from a stale book", () => {
    const gone = trade({ id: "fill-1" });
    const remote = emptyCloud();
    remote.portfolios = [port("p1", [gone], 100)];
    const local = emptyCloud();
    local.portfolios = [port("p1", [], 400)];
    local.drops = withTradeDrops(undefined, [{ portfolioId: "p1", key: tradeIdentity(gone), at: 400 }]);
    const merged = mergeCloud(local, remote);
    assert.equal(merged.doc.portfolios[0]?.trades?.length, 0);
    const stale = emptyCloud();
    stale.portfolios = [port("p1", [gone], 100)];
    const twice = mergeCloud(stale, merged.doc);
    assert.equal(twice.doc.portfolios[0]?.trades?.length, 0);
  });

  it("keeps a trade edited after the delete", () => {
    const gone = trade({ id: "fill-1" });
    const remote = emptyCloud();
    remote.portfolios = [port("p1", [gone], 800)];
    const local = emptyCloud();
    local.portfolios = [port("p1", [], 400)];
    local.drops = withTradeDrops(undefined, [{ portfolioId: "p1", key: tradeIdentity(gone), at: 400 }]);
    const merged = mergeCloud(local, remote);
    assert.equal(merged.doc.portfolios[0]?.trades?.length, 1);
  });

  it("is idempotent when the same save is merged again", () => {
    const remote = emptyCloud();
    remote.portfolios = [port("p1", [])];
    const local = emptyCloud();
    local.portfolios = [port("p1", [trade()])];
    const once = mergeCloud(local, remote);
    const twice = mergeCloud(once.doc, once.doc);
    assert.equal(once.doc.portfolios[0]?.trades?.length, 1);
    assert.equal(twice.doc.portfolios[0]?.trades?.length, 1);
  });

  it("does not bring a deleted watchlist or a removed symbol back", () => {
    const remote = emptyCloud();
    remote.watchlists = [{ id: "main", name: "Main", symbols: ["TCS", "INFY"] }];
    const local = emptyCloud();
    local.watchlists = [{ id: "main", name: "Main", symbols: ["TCS"] }];
    local.drops = withSymbolDrop(withListDrop(undefined, "gone", 10), { listId: "main", symbol: "INFY", at: 10 });
    remote.watchlists.push({ id: "gone", name: "Gone", symbols: ["ITC"] });
    const merged = mergeCloud(local, remote);
    assert.equal(merged.doc.watchlists.find((w) => w.id === "gone"), undefined);
    assert.deepEqual(merged.doc.watchlists.find((w) => w.id === "main")?.symbols, ["TCS"]);
  });

  it("treats three identical saves as one revision", () => {
    const doc = emptyCloud();
    doc.mutationId = "m-1";
    doc.watchlists = [{ id: "main", name: "Main", symbols: ["TCS"] }];
    const first = decideSave(null, doc, 0);
    assert.equal(first.kind, "write");
    assert.equal(first.rev, 1);
    const stored = { ...doc, savedAt: 1 };
    const second = decideSave({ rev: 1, doc: stored }, { ...doc, savedAt: 99 }, 0);
    const third = decideSave({ rev: 1, doc: stored }, { ...doc, savedAt: 100 }, 0);
    assert.equal(second.kind, "duplicate");
    assert.equal(third.kind, "duplicate");
    if (second.kind === "duplicate") assert.equal(second.rev, 1);
    assert.equal(docFingerprint(doc), docFingerprint(stored));
  });
});
