import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, it } from "node:test";
import { computeRrg } from "./rrg.ts";

function load(symbol: string) {
  const raw = JSON.parse(gunzipSync(readFileSync(new URL(`../../../data/rrg/store/${symbol}.json.gz`, import.meta.url))).toString("utf8")) as {
    symbol: string;
    rows: { date: string; close: number }[];
    quality: { limitedHistory: boolean; duplicateDates: string[]; from: string; to: string };
  };
  return raw;
}

describe("stored histories are ready for the RRG engine", () => {
  it("aligns Nifty Bank and Nifty IT to Nifty 50 without filling a missing day", () => {
    const bench = load("NIFTY 50");
    const bank = load("NIFTY BANK");
    const it = load("NIFTY IT");
    assert.equal(bench.quality.limitedHistory, false);
    assert.deepEqual(bench.quality.duplicateDates, []);
    assert.ok(bench.quality.from <= "2016-10-24");
    assert.ok(bench.quality.to >= "2026-10-23");
    const bankRun = computeRrg(bank.rows, bench.rows);
    const itRun = computeRrg(it.rows, bench.rows);
    assert.ok(bankRun.points.length < bank.rows.length);
    assert.equal(bankRun.points.some((point) => point.date === "2025-02-01"), false);
    assert.ok(bankRun.points.at(-1)?.rsRatio);
    assert.ok(itRun.points.at(-1)?.rsRatio);
    assert.equal(bankRun.points.at(-1)?.benchmark, bench.rows.at(-1)?.close);
  });

  it("aligns a stock to Nifty 50 and refuses a future close in an as-of view", () => {
    const bench = load("NIFTY 50");
    const stock = load("RELIANCE");
    const full = computeRrg(stock.rows, bench.rows);
    const cut = computeRrg(stock.rows, bench.rows, undefined, "2020-03-23");
    assert.ok(full.points.length >= 2400);
    const cutDate = cut.points.at(-1)?.date || "";
    const fullDate = full.points.at(-1)?.date || "";
    assert.equal(cutDate <= "2020-03-23", true);
    assert.notEqual(cutDate, fullDate);
    assert.equal(load("TMPV").quality.limitedHistory, true);
    assert.equal(load("TMCV").quality.limitedHistory, true);
  });
});
