import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditTradeObjects, extractTradeLines, mergeTradeLines, parseCsv, parseHoldingsFileDetailed } from "./parse.ts";

function book(n: number) {
  const lines = ["Statement for ABCDE1234F", "", "Symbol,Side,Qty,Price,Date,Trade Id"];
  for (let i = 0; i < n; i++) {
    if (i === 25) lines.push("Symbol,Side,Qty,Price,Date,Trade Id");
    const date = i % 9 === 0 ? "02/01/2024" : i % 9 === 1 ? "02-Jan-2024" : "2024-01-02";
    const id = i % 40 === 0 ? "dup-1" : "id-" + i;
    const price = i % 11 === 0 ? "" : String(100 + (i % 5));
    lines.push(`TCS,${i % 4 === 0 ? "Sell" : "Buy"},${1 + (i % 3)},${price},${date},${id}`);
  }
  lines.push("TCS,,4,100,2024-01-02,amb-1");
  lines.push("???,Buy,1,10,not-a-date,bad-1");
  return lines.join("\n");
}

async function measure(n: number) {
  const text = book(n);
  const before = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  const rows = parseCsv(text);
  const audit = auditTradeObjects(rows);
  const trades = extractTradeLines(rows);
  const merged = mergeTradeLines([], trades);
  return {
    audit,
    trades: trades.length,
    merged: merged.length,
    ms: performance.now() - t0,
    heapMb: (process.memoryUsage().heapUsed - before) / 1e6,
    pan: text.includes("ABCDE1234F") && !JSON.stringify(trades).includes("ABCDE1234F"),
  };
}

describe("tradebook scale", () => {
  it("reads date variants, a repeated header, a blank side, and does not keep a PAN", async () => {
    const got = await measure(80);
    assert.equal(got.pan, true);
    assert.ok(got.audit.rowsRead >= 80);
    assert.ok(got.audit.ignored >= 1);
    assert.ok(got.audit.duplicates >= 1);
    assert.ok(got.audit.ambiguous >= 1);
    assert.ok(got.audit.missingPrices >= 1);
    assert.ok(got.merged < got.trades);
    const dated = extractTradeLines(parseCsv(book(3))).filter((t) => t.symbol === "TCS" && t.date);
    assert.ok(dated.some((t) => t.date === "2024-01-02"));
  });

  for (const n of [10_000, 50_000, 100_000]) {
    it(`parses ${n} trade rows without dropping the book`, { timeout: 180_000 }, async () => {
      const got = await measure(n);
      assert.ok(got.audit.accepted > n * 0.9, `accepted ${got.audit.accepted}`);
      assert.equal(got.trades, got.audit.accepted);
      assert.ok(got.merged < got.trades);
      assert.ok(got.merged > n * 0.9);
      assert.ok(got.ms < 60_000, `took ${got.ms.toFixed(0)}ms heapΔ ${got.heapMb.toFixed(1)}MB`);
      assert.equal(got.pan, true);
    });
  }

  it("parses a 10k csv file through the upload entry point", { timeout: 120_000 }, async () => {
    const file = new File([book(10_000)], "book.csv", { type: "text/csv" });
    const got = await parseHoldingsFileDetailed(file);
    assert.ok((got.trades?.length || 0) > 9_000);
    assert.ok((got.audit?.rowsRead || 0) > 10_000);
    assert.equal(JSON.stringify(got.trades).includes("ABCDE1234F"), false);
  });
});
