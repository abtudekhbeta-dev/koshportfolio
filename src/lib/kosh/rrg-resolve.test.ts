import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { gzipSync } from "node:zlib";
import { canonicalSymbol } from "./rrg-pack.ts";
import { loadRegistry, loadRrgPack, loadSeries } from "./rrg-read.server.ts";

const LABELS: [string, string, boolean][] = [
  ["Nifty 50", "NIFTY 50", true],
  ["Nifty 100", "NIFTY 100", true],
  ["Nifty 200", "NIFTY 200", true],
  ["Nifty 500", "NIFTY 500", true],
  ["Nifty Bank", "NIFTY BANK", true],
  ["Nifty IT", "NIFTY IT", true],
  ["Nifty Pharma", "NIFTY PHARMA", true],
  ["Nifty Midcap 50", "NIFTY MIDCAP 50", true],
  ["Sensex", "SENSEX", true],
  ["India VIX", "INDIA VIX", false],
];

const STOCKS = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY"];

function finite(value: number | null) {
  assert.equal(typeof value, "number");
  assert.equal(Number.isFinite(value), true);
}

describe("rotation store resolution", () => {
  it("resolves every reported index by its label and its stored key", () => {
    const registry = loadRegistry();
    for (const [label, symbol, benchmark] of LABELS) {
      assert.equal(canonicalSymbol(label, registry), symbol);
      assert.equal(canonicalSymbol(symbol, registry), symbol);
      assert.equal(canonicalSymbol(symbol.toLowerCase().replace(/ /g, "_"), registry), symbol);
      const row = registry.find((item) => item.symbol === symbol);
      assert.ok(row, symbol);
      assert.equal(row?.benchmark, benchmark);
      const stored = loadSeries(symbol);
      assert.ok(stored && stored.rows.length > 80, `${symbol} history`);
      assert.equal(stored?.symbol, symbol);
      assert.equal(stored?.rows.at(-1)?.date, "2026-10-23");
    }
    const nse = loadSeries("RELIANCE");
    const bse = loadSeries("BSE:RELIANCE");
    assert.equal(bse?.symbol, "BSE:RELIANCE");
    assert.notEqual(bse?.rows.length, nse?.rows.length);
  });

  it("plots the screenshot selection against Nifty Bank on the Saturday as-of date", () => {
    const pack = loadRrgPack({
      mode: "stock",
      group: "stock",
      benchmark: "Nifty Bank",
      symbols: STOCKS,
      explicit: true,
      timeframe: "daily",
      asOf: "2026-10-24",
      tail: 20,
    });
    if (pack.error || !pack.readings) throw new Error(pack.error || "no readings");
    assert.equal(pack.benchmark.symbol, "NIFTY BANK");
    assert.equal(pack.benchmark.asOf, "2026-10-23");
    assert.equal(pack.sessions.includes("2026-10-23"), true);
    assert.equal(pack.sessions.at(-1), "2026-10-23");
    assert.equal(pack.readings.length, 4);
    assert.deepEqual(pack.missing, []);
    for (const row of pack.readings) {
      assert.equal(STOCKS.includes(row.symbol), true);
      assert.equal(row.tail.length, 20);
      assert.equal(row.asOf, "2026-10-23");
      finite(row.rsRatio);
      finite(row.rsMomentum);
      assert.equal(row.tail.every((point) => Number.isFinite(point.rsRatio) && Number.isFinite(point.rsMomentum)), true);
    }
  });

  it("plots those stocks against every price benchmark, and the sector indices against Nifty 50", () => {
    for (const [, symbol, benchmark] of LABELS) {
      if (!benchmark || symbol === "NIFTY 50") continue;
      const pack = loadRrgPack({
        mode: "stock",
        group: "stock",
        benchmark: symbol,
        symbols: STOCKS,
        explicit: true,
        timeframe: "weekly",
        asOf: "2026-10-24",
        tail: 12,
      });
      if (pack.error || !pack.readings) throw new Error(`${symbol}: ${pack.error || "no readings"}`);
      assert.equal(pack.readings.length, 4, symbol);
      assert.equal(pack.readings.every((row) => row.tail.length === 12 && Number.isFinite(row.rsRatio)), true);
    }
    const sectors = loadRrgPack({
      mode: "sector",
      group: "sector",
      benchmark: "NIFTY 50",
      symbols: ["NIFTY BANK", "NIFTY IT"],
      explicit: true,
      timeframe: "monthly",
      asOf: "2026-10-23",
      tail: 10,
    });
    if (sectors.error || !sectors.readings) throw new Error(sectors.error || "no sector readings");
    assert.equal(sectors.readings.length, 2);
    const broad = loadRrgPack({
      mode: "sector",
      group: "broad",
      benchmark: "NIFTY 50",
      symbols: ["NIFTY 100", "NIFTY 500", "SENSEX"],
      explicit: true,
      timeframe: "daily",
      tail: 8,
    });
    if (broad.error || !broad.readings) throw new Error(broad.error || "no broad readings");
    assert.equal(broad.readings.length, 3);
  });

  it("refuses India VIX as a benchmark and does not call a present file missing", () => {
    const refused = loadRrgPack({
      mode: "sector",
      benchmark: "India VIX",
      symbols: ["NIFTY 50"],
      explicit: true,
      timeframe: "daily",
      tail: 8,
    });
    assert.match(refused.error || "", /not a price benchmark/);
    assert.equal(loadSeries("INDIA VIX")!.rows.length > 80, true);
    const unknown = loadRrgPack({
      mode: "stock",
      benchmark: "NOT A REAL INDEX",
      symbols: STOCKS,
      explicit: true,
      timeframe: "daily",
      tail: 8,
    });
    assert.match(unknown.error || "", /not in the validated store/);
  });

  it("reports a registered benchmark whose compressed file is absent, and still reads a stale file", () => {
    const dir = mkdtempSync(join(tmpdir(), "rrg-fixture-"));
    const previous = process.env.RRG_DATA_DIR;
    try {
      mkdirSync(join(dir, "store"));
      writeFileSync(join(dir, "registry.json"), JSON.stringify({
        items: [
          { symbol: "NIFTY BANK", name: "Nifty Bank", category: "sector", sector: "Bank", kind: "sector", benchmark: true, limited: false, status: "imported", from: "2024-01-01", to: "2024-01-03", rows: 3, notes: [] },
          { symbol: "RELIANCE", name: "Reliance Industries", category: "stock", sector: null, kind: "stock", benchmark: false, limited: false, status: "stale", from: "2024-01-01", to: "2024-01-03", rows: 3, notes: ["Series ends 2024-01-03."] },
        ],
      }));
      process.env.RRG_DATA_DIR = dir;
      const missing = loadRrgPack({ mode: "stock", benchmark: "Nifty Bank", symbols: ["RELIANCE"], explicit: true, timeframe: "daily", tail: 4 });
      assert.match(missing.error || "", /history file could not be read/);
      assert.doesNotMatch(missing.error || "", /not in the validated store/);
      const rows = [{ date: "2024-01-01", close: 100 }, { date: "2024-01-02", close: 101 }, { date: "2024-01-03", close: 102 }];
      writeFileSync(join(dir, "store", "NIFTY BANK.json.gz"), gzipSync(Buffer.from(JSON.stringify({ symbol: "NIFTY BANK", rows }))));
      writeFileSync(join(dir, "store", "RELIANCE.json.gz"), gzipSync(Buffer.from(JSON.stringify({ symbol: "RELIANCE", rows }))));
      const stale = loadRrgPack({ mode: "stock", benchmark: "NIFTY BANK", symbols: ["RELIANCE"], explicit: true, timeframe: "daily", asOf: "2026-10-24", tail: 4 });
      if (stale.error || !stale.readings) throw new Error(stale.error || "no stale reading");
      assert.equal(stale.benchmark.asOf, "2024-01-03");
      assert.equal(stale.readings[0]?.symbol, "RELIANCE");
      assert.match(stale.readings[0]?.warnings.join(" ") || "", /2024-01-03/);
    } finally {
      if (previous == null) delete process.env.RRG_DATA_DIR;
      else process.env.RRG_DATA_DIR = previous;
      loadRegistry();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
