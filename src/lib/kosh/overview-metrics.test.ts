import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bucketFlows, grossOk, impliedNet } from "./flows.ts";
import { indexPulse } from "./index-pulse.ts";
import { NIFTY_CATALOGUE, keySectorals } from "./nifty-catalogue.ts";

describe("index pulse", () => {
  it("uses only finite sectoral returns from the same snapshot", () => {
    const pulse = indexPulse([
      { name: "IT", pct: 5 },
      { name: "Pharma", pct: -1 },
      { name: "Auto", pct: null },
      { name: "Bank", pct: 0 },
    ]);
    assert.ok(pulse);
    assert.equal(pulse.strongest.name, "IT");
    assert.equal(pulse.weakest.name, "Pharma");
    assert.equal(pulse.advancing, 1);
    assert.equal(pulse.declining, 1);
    assert.equal(pulse.unchanged, 1);
    assert.equal(pulse.total, 3);
    assert.equal(pulse.gap, 6);
    assert.ok(Math.abs(pulse.average - 4 / 3) < 1e-9);
  });

  it("returns null when every index is missing", () => {
    assert.equal(indexPulse([{ name: "IT", pct: null }]), null);
  });
});

describe("flows", () => {
  it("does not treat a blank gross pair as a zero print", () => {
    assert.equal(impliedNet(0, 0), null);
    assert.equal(grossOk(0, 0, 120), false);
    assert.equal(grossOk(500, 380, 120), true);
    assert.equal(impliedNet(500, 380), 120);
  });

  it("sums daily nets into a month without inventing an official print", () => {
    const buckets = bucketFlows(
      [
        { date: "2026-10-13", fiiNet: 10, diiNet: -4, fiiBuy: 0, fiiSell: 0, diiBuy: 0, diiSell: 0 },
        { date: "13-Oct-2026", fiiNet: 5, diiNet: 1, fiiBuy: 0, fiiSell: 0, diiBuy: 0, diiSell: 0 },
        { date: "2026-09-30", fiiNet: -2, diiNet: 3, fiiBuy: 0, fiiSell: 0, diiBuy: 0, diiSell: 0 },
      ],
      "monthly",
    );
    assert.equal(buckets[0].key, "2026-10");
    assert.equal(buckets[0].fiiNet, 15);
    assert.equal(buckets[0].diiNet, -3);
    assert.equal(buckets[0].days, 2);
    assert.equal(buckets[1].fiiNet, -2);
  });
});

describe("nifty catalogue", () => {
  it("keeps only feed-priced indices and does not relabel FinServ as Financial Services", () => {
    const symbols = NIFTY_CATALOGUE.map((row) => row.symbol);
    assert.equal(new Set(symbols).size, symbols.length);
    assert.equal(NIFTY_CATALOGUE.length, 65);
    assert.equal(keySectorals().length, 25);
    assert.ok(keySectorals().every((row) => row.family === "Sectoral"));
    assert.ok(NIFTY_CATALOGUE.every((row) => row.symbol.startsWith("^") || row.symbol.endsWith(".NS")));
    assert.equal(NIFTY_CATALOGUE.find((row) => row.symbol === "^CNXFIN")?.name, "Nifty FinServ 25/50");
    assert.equal(NIFTY_CATALOGUE.find((row) => row.symbol === "NIFTY_FIN_SERVICE.NS")?.name, "Nifty Financial Services");
    assert.equal(NIFTY_CATALOGUE.find((row) => row.symbol === "^INDIAVIX")?.family, "Volatility");
    assert.ok(NIFTY_CATALOGUE.filter((row) => row.family === "Bonds").every((row) => !row.key));
    assert.equal(NIFTY_CATALOGUE.some((row) => /NV20|NSEDIV|ETF|BEES/i.test(`${row.symbol} ${row.name}`)), false);
  });
});
