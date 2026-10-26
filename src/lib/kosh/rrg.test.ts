import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alignCloses, assessSeries, computeRrg, quadrantOf, wma } from "./rrg.ts";
import { ingestOfficialCsv, importBatch } from "./rrg-import.ts";

function series(start: number, values: number[], from = "2024-01-01") {
  return values.map((close, index) => {
    const date = new Date(from + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + index);
    return { date: date.toISOString().slice(0, 10), close };
  });
}

describe("rrg engine", () => {
  it("weights the newest close most heavily", () => {
    assert.equal(wma([1, 2, 3], 2, 3), (3 * 3 + 2 * 2 + 1 * 1) / 6);
    assert.equal(wma([1, 2, 3], 1, 3), null);
  });

  it("rejects duplicates and does not fill a missing day", () => {
    const aligned = alignCloses(
      [{ date: "2024-01-02", close: 10 }, { date: "2024-01-02", close: 12 }, { date: "2024-01-04", close: 11 }],
      [{ date: "2024-01-02", close: 10 }, { date: "2024-01-03", close: 10 }, { date: "2024-01-04", close: 10 }],
    );
    assert.deepEqual(aligned.rows.map((row) => row.date), ["2024-01-04"]);
    assert.ok(aligned.rejected.some((row) => row.reason.includes("duplicate")));
    assert.deepEqual(aligned.benchmarkOnly, ["2024-01-02", "2024-01-03"]);
  });

  it("sorts an out-of-order file and flags it", () => {
    const quality = assessSeries([{ date: "2024-01-03", close: 10 }, { date: "2024-01-02", close: 9 }]);
    assert.equal(quality.unsorted, true);
    assert.equal(quality.from, "2024-01-02");
  });

  it("separates a holiday from a missing weekday", () => {
    const quality = assessSeries(
      [{ date: "2024-01-02", close: 10 }, { date: "2024-01-05", close: 10 }],
      ["2024-01-03"],
    );
    assert.deepEqual(quality.holidayGaps, ["2024-01-03"]);
    assert.deepEqual(quality.weekdayGaps, ["2024-01-04"]);
  });

  it("counts an invalid close and flags a jump without changing the later close", () => {
    const rows = [{ date: "2024-01-02", close: 100 }, { date: "2024-01-03", close: 0 }, { date: "2024-01-04", close: 140 }];
    const quality = assessSeries(rows);
    assert.equal(quality.invalidCloses, 1);
    assert.equal(quality.jumps.length, 0);
    const jumped = assessSeries([{ date: "2024-01-02", close: 100 }, { date: "2024-01-03", close: 140 }]);
    assert.equal(jumped.jumps[0].date, "2024-01-03");
    assert.equal(rows[2].close, 140);
  });

  it("drops a date the benchmark does not share", () => {
    const { points } = computeRrg(
      [{ date: "2024-01-02", close: 10 }, { date: "2024-01-03", close: 11 }],
      [{ date: "2024-01-02", close: 10 }],
      { fast: 1, slow: 1, momentum: 1 },
    );
    assert.deepEqual(points.map((point) => point.date), ["2024-01-02"]);
  });

  it("returns no ratio before the slow window is full", () => {
    const { points } = computeRrg(series(0, [100, 101, 102]), series(0, [100, 100, 100]), { fast: 2, slow: 3, momentum: 1 });
    assert.equal(points[0].rsRatio, null);
    assert.equal(points[1].rsRatio, null);
    assert.ok(points[2].rsRatio != null);
    assert.equal(points[2].rsMomentum, null);
  });

  it("stays on the boundary when the instrument is the benchmark", () => {
    const prices = series(0, Array.from({ length: 40 }, () => 50));
    const { points } = computeRrg(prices, prices);
    const last = points[points.length - 1];
    assert.equal(last.rs, 100);
    assert.ok(Math.abs((last.rsRatio || 0) - 100) < 1e-8);
    assert.equal(last.quadrant, "boundary");
  });

  it("puts a constant relative rise above 100 with momentum on the boundary", () => {
    const stock = series(0, Array.from({ length: 80 }, (_, i) => 100 * 1.01 ** i));
    const bench = series(0, Array.from({ length: 80 }, () => 100));
    const last = computeRrg(stock, bench).points.at(-1);
    assert.ok((last?.rsRatio || 0) > 100);
    assert.equal(last?.quadrant, "boundary");
  });

  it("marks an accelerating relative rise as leading", () => {
    const stock = series(0, Array.from({ length: 60 }, (_, i) => (i < 40 ? 100 : 100 * 1.03 ** (i - 39))));
    const bench = series(0, Array.from({ length: 60 }, () => 100));
    const last = computeRrg(stock, bench).points.at(-1);
    assert.equal(last?.quadrant, "leading");
  });

  it("marks a rising stock that loses to a faster benchmark as lagging", () => {
    const stock = series(0, Array.from({ length: 50 }, (_, i) => 100 + i));
    const bench = series(0, Array.from({ length: 50 }, (_, i) => 100 * 1.02 ** i));
    const last = computeRrg(stock, bench).points.at(-1);
    assert.ok((last?.rsRatio || 100) < 100);
    assert.equal(last?.quadrant, "lagging");
  });

  it("marks a falling stock that starts beating a faster fall as leading", () => {
    const stock = series(0, Array.from({ length: 60 }, (_, i) => (i < 40 ? 100 - i * 0.4 : 84)));
    const bench = series(0, Array.from({ length: 60 }, (_, i) => 100 * 0.97 ** i));
    const last = computeRrg(stock, bench).points.at(-1);
    assert.ok((last?.instrument || 0) < 100);
    assert.ok((last?.benchmark || 0) < (last?.instrument || 0));
    assert.equal(last?.quadrant, "leading");
  });

  it("keeps 100 on either axis on the boundary", () => {
    assert.equal(quadrantOf(100, 101), "boundary");
    assert.equal(quadrantOf(101, 100), "boundary");
    assert.equal(quadrantOf(101, 101), "leading");
    assert.equal(quadrantOf(99, 99), "lagging");
    assert.equal(quadrantOf(99, 101), "improving");
    assert.equal(quadrantOf(101, 99), "weakening");
  });

  it("matches a hand-worked ratio and is deterministic", () => {
    const instrument = [
      { date: "2024-01-02", close: 10 },
      { date: "2024-01-03", close: 12 },
      { date: "2024-01-04", close: 15 },
      { date: "2024-01-05", close: 18 },
    ];
    const benchmark = instrument.map((row) => ({ date: row.date, close: 10 }));
    const once = computeRrg(instrument, benchmark, { fast: 2, slow: 3, momentum: 1 });
    const twice = computeRrg(instrument, benchmark, { fast: 2, slow: 3, momentum: 1 });
    assert.equal(once.points[3].rsRatio, 106.25);
    assert.equal(once.points[3].quadrant, "weakening");
    assert.deepEqual(once.points, twice.points);
  });

  it("does not let a later close change an earlier as-of result", () => {
    const instrument = series(0, [100, 110, 120, 200]);
    const benchmark = series(0, [100, 100, 100, 100]);
    const params = { fast: 1, slow: 2, momentum: 1 };
    const cut = computeRrg(instrument, benchmark, params, instrument[2].date);
    const full = computeRrg(instrument.slice(0, 3), benchmark.slice(0, 3), params);
    assert.deepEqual(cut.points, full.points);
    assert.equal(cut.points.at(-1)?.instrument, 120);
  });

  it("rejects an access-denied page and a duplicate official file", () => {
    const denied = ingestOfficialCsv({ text: "<HTML><TITLE>Access Denied</TITLE></HTML>", file: "blocked.html", url: "https://www.nseindia.com/" });
    assert.equal(denied.ok, false);
    assert.match(denied.log.errors[0], /access page/);
    const csv = "Date,Open,High,Low,Close\n02 Jan 2024,1,1,1,100\n02 Jan 2024,1,1,1,110\n";
    const dup = ingestOfficialCsv({ text: csv, file: "nifty.csv" });
    assert.equal(dup.ok, false);
    assert.match(dup.log.errors[0], /Duplicate/);
  });

  it("reads Close Price, splits an index-name file, and leaves a gap unfilled", () => {
    const stock = "Symbol,Date,Series,Prev Close,Close Price\nRELIANCE,02-Jan-2024,EQ,90,100\nRELIANCE,03-Jan-2024,EQ,100,101\nHDFCBANK,02-Jan-2024,EQ,10,11\n";
    const later = "Symbol,Date,Series,Close Price\nRELIANCE,05-Jan-2024,EQ,103\n";
    const indexes = "Index Name,Date,Open,High,Low,Close\nNIFTY 50,02 Jan 2024,1,1,1,200\nNIFTY BANK,02 Jan 2024,1,1,1,400\n";
    const batch = importBatch([
      { name: "a.csv", text: stock, sourceUrl: "https://www.nseindia.com/report-detail/eq_security" },
      { name: "b.csv", text: later },
      { name: "indexes.csv", text: indexes, sourceUrl: "https://www.niftyindices.com/reports" },
    ]);
    const reliance = batch.series.find((item) => item.symbol === "RELIANCE");
    assert.deepEqual(reliance?.rows.map((row) => row.close), [100, 101, 103]);
    assert.deepEqual(reliance?.quality.weekdayGaps, ["2024-01-04"]);
    assert.equal(batch.series.some((item) => item.symbol === "NIFTY 50"), true);
    assert.equal(batch.series.some((item) => item.symbol === "NIFTY BANK"), true);
    const clash = importBatch([
      { name: "one.csv", text: "Date,Close\n2024-01-02,100\n", symbol: "NIFTY 50" },
      { name: "two.csv", text: "Date,Close\n2024-01-02,101\n", symbol: "NIFTY 50" },
    ]);
    assert.equal(clash.series.length, 0);
    assert.match(clash.failures[0].error, /two closes/);
  });

  it("parses one Nifty Indices row without inventing the next session", () => {
    const csv = "Date,Open,High,Low,Close\n02-Jan-2024,100,101,99,100.5\n";
    const parsed = ingestOfficialCsv({ text: csv, file: "nifty.csv", retrievedAt: "2026-10-24T00:00:00Z" });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.deepEqual(parsed.rows, [{ date: "2024-01-02", close: 100.5 }]);
      assert.equal(parsed.quality.limitedHistory, true);
      assert.equal(parsed.log.checksum.length, 64);
    }
  });
});
