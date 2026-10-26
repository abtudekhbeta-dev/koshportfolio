import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyFetchFailure,
  expectedLatestSession,
  freshnessOf,
  normalizeFlow,
  parseHistoryJson,
  parseNseCash,
  parseStrotaCsv,
  shouldRetryFlow,
  upsertFlows,
} from "./flow-ingest.ts";
import { mergeFlows } from "./market-flows.ts";

describe("cash flow ingest", () => {
  it("parses the cash csv and rejects a broken row without turning it into zero", () => {
    const parsed = parseStrotaCsv("date,fii_fpi_net_cr,dii_net_cr\n2026-10-23,887.65,3235.36\n2026-10-22,nope,1\n");
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0]?.fiiNet, 887.65);
    assert.equal(parsed.rejected, 1);
    assert.equal(normalizeFlow({ date: "2026-10-21", fiiNet: Number.NaN, diiNet: 1 }), null);
  });

  it("keeps cash nets from a history row and ignores futures columns", () => {
    const parsed = parseHistoryJson([
      { date: "30-Sep-2026", fii_buy: 100, fii_sell: 40, fii_net: 60, dii_buy: 10, dii_sell: 25, dii_net: -15, fii_idx_fut_net: 9999 },
    ]);
    assert.equal(parsed.rows[0]?.fiiNet, 60);
    assert.equal(parsed.rows[0]?.fiiBuy, 100);
    assert.equal((parsed.rows[0] as { fii_idx_fut_net?: number }).fii_idx_fut_net, undefined);
  });

  it("drops gross figures that do not match net and still keeps the net", () => {
    const row = normalizeFlow({ date: "2026-10-23", fiiNet: 10, diiNet: -4, fiiBuy: 100, fiiSell: 50, diiBuy: 1, diiSell: 1 });
    assert.equal(row?.fiiNet, 10);
    assert.equal(row?.fiiBuy, undefined);
    assert.equal(row?.diiBuy, undefined);
  });

  it("parses an NSE cash pair and ignores a futures category", () => {
    const parsed = parseNseCash([
      { category: "FII/FPI", date: "23-Oct-2026", buyValue: "100.00", sellValue: "40.00", netValue: "60.00" },
      { category: "DII", date: "23-Oct-2026", buyValue: "10.00", sellValue: "25.00", netValue: "-15.00" },
      { category: "FII FUT", date: "23-Oct-2026", netValue: "999" },
    ]);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0]?.fiiNet, 60);
    assert.equal(parsed.rows[0]?.diiNet, -15);
  });

  it("upserts a restatement and leaves the archive when the incoming list is empty", () => {
    const stored = [{ date: "2026-10-21", fiiNet: 1022.32, diiNet: 1614.32 }];
    const again = upsertFlows(stored, []);
    assert.equal(again.rows.length, 1);
    assert.equal(again.inserted, 0);
    const next = upsertFlows(stored, [
      { date: "2026-10-21", fiiNet: 1, diiNet: 2 },
      { date: "2026-10-23", fiiNet: 887.65, diiNet: 3235.36 },
    ]);
    assert.equal(next.updated, 1);
    assert.equal(next.inserted, 1);
    assert.equal(next.rows.at(-1)?.date, "2026-10-23");
  });

  it("does not fill a weekend and treats a friday print as fresh on monday morning", () => {
    const monday = new Date("2026-10-26T05:30:00Z");
    assert.equal(expectedLatestSession(monday), "2026-10-23");
    assert.equal(freshnessOf("2026-10-23", monday), "fresh");
    assert.equal(freshnessOf("2026-10-21", monday), "delayed");
    assert.equal(expectedLatestSession(new Date("2026-10-24T12:00:00Z")), "2026-10-23");
    const holiday = expectedLatestSession(new Date("2026-10-26T16:00:00Z"), ["2026-10-26"]);
    assert.equal(holiday, "2026-10-23");
  });

  it("retries a timeout once and does not retry auth or rate limits", () => {
    assert.equal(shouldRetryFlow(classifyFetchFailure(null, "TimeoutError", "timed out"), 0), true);
    assert.equal(shouldRetryFlow("timeout", 1), false);
    assert.equal(shouldRetryFlow(classifyFetchFailure(403, "", "403"), 0), false);
    assert.equal(shouldRetryFlow(classifyFetchFailure(429, "", "429"), 0), false);
    assert.equal(shouldRetryFlow(classifyFetchFailure(500, "", "500"), 0), true);
  });

  it("keeps stored rows when the live file is empty", () => {
    const merged = mergeFlows([{ date: "2026-10-21", fiiNet: 1022.32, diiNet: 1614.32 }], [], []);
    assert.equal(merged.rows.length, 1);
    assert.equal(merged.rows[0]?.fiiNet, 1022.32);
  });
});
