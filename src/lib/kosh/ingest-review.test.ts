import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeTradeLines, upsertHoldings } from "./parse.ts";
import {
  acceptProposals,
  applyDate,
  applySide,
  applySymbol,
  classifyAiFailure,
  deriveGross,
  grossValue,
  holdingsDiff,
  makeImportRecord,
  parseAiBody,
  reconcileTrades,
  reviewPayload,
  shouldRetryAi,
  tradeComposite,
  tradesToCommit,
  validateProposal,
} from "./ingest-review.ts";
import type { Holding, TradeLine } from "./types.ts";

const h = (symbol: string, qty: number, avg: number | null = 10, name = symbol): Holding => ({
  symbol,
  name,
  qty,
  avg,
  date: "2024-01-02",
});

const t = (p: Partial<TradeLine> & Pick<TradeLine, "symbol" | "qty" | "price" | "side">): TradeLine => ({
  name: p.symbol,
  date: "2024-01-02",
  ...p,
});

describe("gross value stays deterministic", () => {
  it("multiplies quantity and price and refuses a bad input", () => {
    assert.equal(grossValue(100, 250), 25000);
    assert.equal(grossValue(0, 250), null);
    assert.equal(grossValue(10, -1), null);
  });

  it("does not pick a side when the stated gross disagrees", () => {
    const ok = deriveGross(100, 250, 25000);
    assert.equal(ok.conflict, false);
    assert.equal(ok.gross, 25000);
    assert.equal(ok.derived, false);
    const missing = deriveGross(100, 250, null);
    assert.equal(missing.derived, true);
    assert.equal(missing.gross, 25000);
    const clash = deriveGross(100, 250, 1000);
    assert.equal(clash.conflict, true);
    assert.equal(clash.gross, null);
  });
});

describe("holdings diff", () => {
  it("keeps a name that the file does not mention", () => {
    const diff = holdingsDiff([h("TCS", 8, 2100), h("INFY", 5, 1400)], [h("TCS", 6, 2100)]);
    assert.equal(diff.missingFromFile.length, 1);
    assert.equal(diff.missingFromFile[0].symbol, "INFY");
    assert.equal(diff.changed[0].beforeQty, 8);
    assert.equal(diff.changed[0].afterQty, 6);
    assert.equal(diff.fresh.length, 0);
    const kept = upsertHoldings([h("TCS", 8, 2100), h("INFY", 5, 1400)], [h("TCS", 6, 2100)]);
    assert.equal(kept.find((x) => x.symbol === "INFY")?.qty, 5);
    assert.equal(kept.find((x) => x.symbol === "TCS")?.qty, 6);
  });

  it("flags a new name, a cost change, and two rows for one symbol", () => {
    const diff = holdingsDiff(
      [h("TCS", 8, 100)],
      [h("TCS", 8, 120), h("TCS", 9, 120), h("RELIANCE", 1, 50, "Reliance")],
    );
    assert.equal(diff.fresh.length, 1);
    assert.equal(diff.fresh[0].symbol, "RELIANCE");
    assert.equal(diff.ambiguous.length, 1);
    assert.equal(diff.changed.some((c) => c.cost && c.symbol === "TCS"), true);
  });

  it("marks a quantity jump above half as large", () => {
    const diff = holdingsDiff([h("TCS", 10)], [h("TCS", 2)]);
    assert.equal(diff.changed[0].large, true);
  });
});

describe("path reconciliation", () => {
  it("does not treat date and symbol as an identity", () => {
    const a = t({ symbol: "TCS", qty: 8, price: 100, side: 1 });
    const b = t({ symbol: "TCS", qty: 3, price: 100, side: 1 });
    assert.notEqual(tradeComposite(a), tradeComposite(b));
    const rec = reconcileTrades([a], [b]);
    assert.equal(rec.fresh.length, 1);
    assert.equal(rec.ambiguous.length, 0);
    assert.equal(rec.brokerDuplicates.length, 0);
  });

  it("flags an identical fill with no broker id and still keeps it unless confirmed", () => {
    const a = t({ symbol: "TCS", qty: 8, price: 2100, side: 1 });
    const b = t({ symbol: "TCS", qty: 8, price: 2100, side: 1 });
    const rec = reconcileTrades([a], [b]);
    assert.equal(rec.ambiguous.length, 1);
    assert.equal(rec.brokerDuplicates.length, 0);
    assert.equal(tradesToCommit([b], [a], false).length, 1);
    assert.equal(tradesToCommit([b], [a], true).length, 0);
    const merged = mergeTradeLines([a], [b]);
    assert.equal(merged.length, 2);
  });

  it("skips a repeated broker id and does not overwrite a conflicting one", () => {
    const a = t({ symbol: "TCS", qty: 8, price: 100, side: 1, id: "T1" });
    const same = t({ symbol: "TCS", qty: 8, price: 100, side: 1, id: "T1" });
    const clash = t({ symbol: "TCS", qty: 9, price: 100, side: 1, id: "T1" });
    const neu = t({ symbol: "INFY", qty: 1, price: 10, side: 1, id: "T2" });
    const rec = reconcileTrades([a], [same, clash, neu]);
    assert.equal(rec.brokerDuplicates.length, 1);
    assert.equal(rec.conflicts.length, 1);
    assert.equal(rec.fresh.length, 1);
    const commit = tradesToCommit([same, clash, neu], [a], false);
    assert.deepEqual(commit.map((x) => x.id), ["T2"]);
  });

  it("does not delete a path line that the file omits", () => {
    const old = t({ symbol: "INFY", qty: 4, price: 10, side: 1, id: "KEEP" });
    const inc = t({ symbol: "TCS", qty: 1, price: 10, side: 1, id: "NEW" });
    const rec = reconcileTrades([old], [inc]);
    assert.equal(rec.fresh.length, 1);
    assert.equal("missing" in rec, false);
  });
});

describe("AI proposals", () => {
  it("accepts a symbol only when that ticker is in the source row", () => {
    const src = "Reliance Industries RELIANCE 10 2500";
    const ok = validateProposal(src, { kind: "symbol", row: 0, field: "symbol", from: "Reliance", to: "RELIANCE", reason: "header" });
    assert.equal(ok.ok, true);
    const invented = validateProposal(src, { kind: "symbol", row: 0, field: "symbol", from: "Reliance", to: "TCS", reason: "guess" });
    assert.equal(invented.ok, false);
  });

  it("rejects a proposal that tries to set quantity or price", () => {
    const src = "RELIANCE 10 2500";
    const bad = validateProposal(src, { kind: "symbol", row: 0, field: "symbol", from: "RELIANCE", to: "RELIANCE", qty: 10, price: 2500 });
    assert.equal(bad.ok, false);
    const field = validateProposal(src, { kind: "symbol", row: 0, field: "qty", from: "10", to: "RELIANCE" });
    assert.equal(field.ok, false);
  });

  it("rejects an ambiguous date and a side the row does not say", () => {
    const amb = validateProposal("01/02/2024 RELIANCE", { kind: "date", row: 0, field: "date", from: "01/02/2024", to: "2024-02-01" });
    assert.equal(amb.ok, false);
    const clear = validateProposal("31/01/2024 RELIANCE", { kind: "date", row: 0, field: "date", from: "31/01/2024", to: "2024-01-31" });
    assert.equal(clear.ok, true);
    const side = validateProposal("RELIANCE bought 10", { kind: "side", row: 0, field: "side", from: "", to: "sell" });
    assert.equal(side.ok, false);
    const buy = validateProposal("RELIANCE bought 10", { kind: "side", row: 0, field: "side", from: "bought", to: "buy" });
    assert.equal(buy.ok, true);
  });

  it("drops invalid items from a partial reply and ignores calculated fields", () => {
    const sources = ["Reliance Industries RELIANCE"];
    const parsed = parseAiBody('note {"proposals":[{"kind":"symbol","row":0,"field":"symbol","from":"Reliance","to":"RELIANCE"},{"kind":"symbol","row":0,"to":"TCS","qty":5}]}');
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const got = acceptProposals(sources, parsed.proposals);
    assert.equal(got.proposals.length, 1);
    assert.equal(got.rejected, 1);
    assert.equal(applySymbol("Reliance", got.proposals[0], sources[0]), "RELIANCE");
    assert.equal(applySymbol("INFY", got.proposals[0], sources[0]), "INFY");
  });

  it("does not apply a date or a side that fails a second check", () => {
    const src = "31/01/2024 bought RELIANCE";
    const date = { kind: "date" as const, row: 0, field: "date", from: "31/01/2024", to: "2024-01-31", reason: "" };
    assert.equal(applyDate(null, date, src), "2024-01-31");
    assert.equal(applyDate("2020-01-01", { ...date, to: "2024-02-01" }, src), "2020-01-01");
    const side = { kind: "side" as const, row: 0, field: "side", from: "bought", to: "buy", reason: "" };
    assert.equal(applySide(-1, side, src), 1);
    assert.equal(applySide(1, { ...side, to: "sell" }, src), 1);
  });

  it("classifies provider failures and retries only a timeout or a network error once", () => {
    assert.equal(classifyAiFailure({ status: 429, message: "Too many" }), "rate");
    assert.equal(classifyAiFailure({ status: 401, message: "invalid api key" }), "auth");
    assert.equal(classifyAiFailure({ status: 402, message: "credits exhausted" }), "quota");
    assert.equal(classifyAiFailure({ name: "AbortError", message: "aborted" }), "timeout");
    assert.equal(classifyAiFailure({ message: "Unexpected token" }), "malformed");
    assert.equal(classifyAiFailure({ message: "proposal schema" }), "schema");
    assert.equal(shouldRetryAi("timeout", false), true);
    assert.equal(shouldRetryAi("timeout", true), false);
    assert.equal(shouldRetryAi("rate", false), false);
    assert.equal(shouldRetryAi("auth", false), false);
    assert.equal(shouldRetryAi("quota", false), false);
    const empty = parseAiBody({ ok: true });
    assert.equal(empty.ok, false);
    if (!empty.ok) assert.equal(empty.aiClass, "schema");
    const junk = parseAiBody("not json");
    assert.equal(junk.ok, false);
  });

  it("redacts a long account number out of the review sample and the import note", () => {
    const sample = reviewPayload({
      filename: "book-1234567890123456.csv",
      headers: ["Symbol"],
      rows: [["ABCDE1234F", "10"]],
      holdings: [{ symbol: "TCS", name: "Tata", qty: 2, avg: 100, date: "2024-01-02" }],
    });
    assert.equal(JSON.stringify(sample).includes("1234567890123456"), false);
    assert.equal(JSON.stringify(sample).includes("ABCDE1234F"), false);
    const rec = makeImportRecord({
      kind: "holdings",
      filename: "ABCDE1234F.csv",
      rowsRead: 3,
      accepted: 2,
      ignored: 1,
      duplicates: 0,
      ambiguous: 1,
      missingPrices: 0,
      unresolved: 0,
      aiStatus: "failed",
      aiClass: "quota",
      fallback: true,
      applied: 2,
      note: "parser kept the rows",
    });
    assert.equal(rec.filename?.includes("ABCDE1234F"), false);
    assert.equal(rec.fallback, true);
    assert.equal(rec.aiClass, "quota");
    assert.equal(rec.rowsRead, 3);
  });
});
