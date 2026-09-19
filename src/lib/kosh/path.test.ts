import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPath, fillTradePrices, mixVsPathGaps, overlayOnMix, pathToChartNav, sortTrades } from "./path.ts";
import { buildMixPath } from "./engine.ts";
import type { Bar, NavPoint, TradeLine } from "./types.ts";

function bars(startIso: string, n: number, startPx: number, daily: number): Bar[] {
  const t0 = Date.parse(startIso + "T00:00:00Z") / 1000;
  const out: Bar[] = [];
  let px = startPx;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * 86400;
    out.push({ t, c: px, raw: px });
    px *= 1 + daily;
  }
  return out;
}

function buy(symbol: string, qty: number, price: number, date: string): TradeLine {
  return { symbol, name: symbol, qty, price, date, boughtAt: date + "T00:00:00.000Z", side: 1 };
}
function sell(symbol: string, qty: number, price: number, date: string): TradeLine {
  return { symbol, name: symbol, qty, price, date, boughtAt: date + "T00:00:00.000Z", side: -1 };
}

describe("path reconstruction", () => {
  it("marks remaining qty to each day's print", () => {
    const hx = { RELIANCE: bars("2024-01-02", 10, 100, 0.01) };
    const p = buildPath([buy("RELIANCE", 10, 100, "2024-01-02")], hx, hx.RELIANCE);
    assert.ok(p.nav.length >= 8);
    assert.equal(p.nav[0].wealth, 10 * 100);
    const last = p.nav.at(-1)!;
    const expectPx = 100 * Math.pow(1.01, 9);
    assert.ok(Math.abs(last.wealth - 10 * expectPx) < 1e-4);
    assert.equal(p.stillHeld[0]?.qty, 10);
    assert.equal(p.nBuys, 1);
    assert.equal(p.nSells, 0);
  });

  it("FIFO closed trades drop sold names from still held", () => {
    const hx = { TCS: bars("2024-01-02", 40, 100, 0) };
    const p = buildPath(
      [
        buy("TCS", 10, 100, "2024-01-02"),
        sell("TCS", 4, 150, "2024-01-20"),
        buy("INFY", 5, 200, "2024-01-03"),
        sell("INFY", 5, 210, "2024-01-10"),
      ],
      { TCS: hx.TCS, INFY: bars("2024-01-02", 40, 200, 0) },
      hx.TCS,
    );
    assert.equal(p.stillHeld.find((h) => h.symbol === "TCS")?.qty, 6);
    assert.ok(!p.stillHeld.find((h) => h.symbol === "INFY"));
    const tcs = p.closed.find((c) => c.symbol === "TCS");
    assert.equal(tcs?.qty, 4);
    assert.equal(tcs?.pnl, 4 * 50);
    const infy = p.closed.find((c) => c.symbol === "INFY");
    assert.equal(infy?.qty, 5);
  });

  it("XIRR is ~10% when a 1y hold ends 10% up", () => {
    const hx = { X: bars("2023-01-02", 370, 100, 0) };
    hx.X[hx.X.length - 1].c = 110;
    hx.X[hx.X.length - 1].raw = 110;
    const asOf = Date.parse("2024-01-07T00:00:00Z");
    const p = buildPath([buy("X", 10, 100, "2023-01-02")], hx, hx.X, asOf);
    assert.ok(p.xirr != null);
    assert.ok(Math.abs(p.xirr! - 10) < 1.5, String(p.xirr));
  });

  it("TWR ignores extra cash put in after a double", () => {
    const hx = { X: bars("2024-01-02", 20, 10, 0) };
    hx.X[5].c = 20;
    hx.X[5].raw = 20;
    for (let i = 6; i < hx.X.length; i++) {
      hx.X[i].c = 24;
      hx.X[i].raw = 24;
    }
    const p = buildPath(
      [buy("X", 100, 10, "2024-01-02"), buy("X", 100, 20, "2024-01-07")],
      hx,
      hx.X,
    );
    assert.ok(p.twr != null);
    // 10→20 = +100%, then 20→24 = +20% → 1.0 * 1.2 = 140%
    assert.ok(Math.abs(p.twr! - 140) < 8, String(p.twr));
  });

  it("same money in the index tracks rupees in on the same days", () => {
    const stock = bars("2024-01-02", 10, 50, 0);
    const nifty = bars("2024-01-02", 10, 100, 0);
    nifty[nifty.length - 1].c = 110;
    nifty[nifty.length - 1].raw = 110;
    const p = buildPath([buy("X", 20, 50, "2024-01-02")], { X: stock }, nifty);
    assert.ok(p.sameCashLast != null);
    assert.ok(Math.abs(p.sameCashLast! - 1100) < 1e-4, String(p.sameCashLast));
  });

  it("if you had never sold keeps the sold qty", () => {
    const hx = { X: bars("2024-01-02", 20, 10, 0) };
    hx.X.forEach((b) => {
      b.c = 12;
      b.raw = 12;
    });
    hx.X[0].c = 10;
    hx.X[0].raw = 10;
    const p = buildPath(
      [buy("X", 10, 10, "2024-01-02"), sell("X", 10, 11, "2024-01-10")],
      hx,
      hx.X,
    );
    assert.equal(p.wealthNow, 0);
    assert.ok(p.neverSoldLast != null && p.neverSoldLast > 0);
    assert.ok(Math.abs(p.neverSoldLast! - 10 * 12) < 1e-6);
  });

  it("Mix is unchanged when there are no trades", () => {
    const holdings = [{ symbol: "TCS", name: "TCS", qty: 8, avg: 2100, date: null }];
    const hx = { TCS: bars("2020-01-02", 40, 2000, 0.001) };
    const mix = buildMixPath(holdings, hx, hx.TCS);
    assert.ok(mix.nav.length > 10);
    assert.equal(mix.method, "current-mix");
    const p = buildPath([], hx, hx.TCS);
    assert.equal(p.nav.length, 0);
    const over = overlayOnMix(mix.nav, p.nav);
    assert.equal(over.length, mix.nav.length);
    assert.equal(over[0].port, mix.nav[0].port);
  });

  it("overlay adds path wealth onto mix days without rewriting mix", () => {
    const mix: NavPoint[] = [
      { t: 1, day: "2024-01-02", port: 100, bench: 100, covered: 1, names: 1, wAvail: 1 },
      { t: 2, day: "2024-01-03", port: 110, bench: 101, covered: 1, names: 1, wAvail: 1 },
    ];
    const over = overlayOnMix(mix, [{ t: 2, day: "2024-01-03", wealth: 5000, sameCash: 4800, unit: 100, sameUnit: 100, covered: 1, names: 1 }]);
    assert.equal(over[0].port, 100);
    assert.equal(over[1].path, 5000);
    assert.equal(over[1].sameCash, 4800);
  });

  it("sorts buys before sells on the same day", () => {
    const rows = [sell("X", 1, 10, "2024-01-02"), buy("X", 1, 10, "2024-01-02")];
    const s = sortTrades(rows);
    assert.equal(s[0].side, 1);
    assert.equal(s[1].side, -1);
  });

  it("flags Mix vs Path qty mismatches and ignores matches", () => {
    const gaps = mixVsPathGaps(
      [
        { symbol: "TCS", name: "TCS", qty: 8 },
        { symbol: "INFY", name: "Infosys", qty: 10 },
      ],
      [
        { symbol: "TCS", name: "TCS", qty: 8 },
        { symbol: "INFY", name: "Infosys", qty: 4 },
        { symbol: "ITC", name: "ITC", qty: 20 },
      ],
    );
    assert.equal(gaps.find((g) => g.symbol === "TCS"), undefined);
    assert.equal(gaps.find((g) => g.symbol === "INFY")?.note, "Qty differs");
    assert.equal(gaps.find((g) => g.symbol === "ITC")?.note, "In path, not in this mix");
  });

  it("fills a missing buy price from that day's close", () => {
    const hx = { RELIANCE: bars("2024-01-02", 10, 140, 0) };
    hx.RELIANCE[0].c = 142;
    hx.RELIANCE[0].raw = 142;
    const { trades, filled } = fillTradePrices(
      [{ symbol: "RELIANCE", name: "Reliance", qty: 10, price: 0, date: "2024-01-02", side: 1 }],
      hx,
    );
    assert.equal(trades[0].price, 142);
    assert.equal(trades[0].priceFilled, true);
    assert.equal(filled.length, 1);
    assert.equal(filled[0].method, "day-close");
  });

  it("does not overwrite a price that was in the file", () => {
    const hx = { X: bars("2024-01-02", 5, 50, 0) };
    const { trades, filled } = fillTradePrices(
      [{ symbol: "X", name: "X", qty: 2, price: 48, date: "2024-01-02", side: 1 }],
      hx,
    );
    assert.equal(trades[0].price, 48);
    assert.equal(filled.length, 0);
  });

  it("today's path rupees match live qty × last print", () => {
    const hx = { TCS: bars("2024-01-02", 20, 100, 0) };
    const p = buildPath([buy("TCS", 8, 100, "2024-01-02")], hx, hx.TCS, Date.now(), { TCS: 2100 });
    assert.equal(p.wealthNow, 8 * 2100);
    assert.equal(p.stillHeld[0]?.value, 8 * 2100);
    assert.equal(p.nav.at(-1)?.wealth, 8 * 2100);
  });

  it("a missing-price buy still marks wealth using the day's close", () => {
    const hx = { INFY: bars("2024-01-02", 8, 200, 0) };
    hx.INFY.forEach((b) => {
      b.c = 220;
      b.raw = 220;
    });
    const p = buildPath(
      [{ symbol: "INFY", name: "Infosys", qty: 10, price: 0, date: "2024-01-02", side: 1 }],
      hx,
      hx.INFY,
    );
    assert.equal(p.filledPrices.length, 1);
    assert.equal(p.stillHeld[0]?.qty, 10);
    assert.ok(p.wealthNow > 0);
    assert.equal(p.nav[0].wealth, 10 * 220);
  });

  it("unit NAV does not jump when extra cash is put in", () => {
    const hx = { X: bars("2024-01-02", 20, 10, 0) };
    const p = buildPath(
      [buy("X", 100, 10, "2024-01-02"), buy("X", 100, 10, "2024-01-10")],
      hx,
      hx.X,
    );
    const before = p.nav.find((n) => n.day >= "2024-01-09");
    const after = p.nav.find((n) => n.day >= "2024-01-10");
    assert.ok(before && after);
    assert.ok(after!.wealth > before!.wealth);
    assert.ok(Math.abs(after!.unit - before!.unit) < 1, String(after!.unit) + " vs " + before!.unit);
  });

  it("path chart nav puts rupees in port and units in portUnit", () => {
    const hx = { X: bars("2024-01-02", 12, 10, 0.01) };
    const p = buildPath([buy("X", 10, 10, "2024-01-02")], hx, hx.X);
    const nav = pathToChartNav(p);
    assert.equal(nav[0].port, p.nav[0].wealth);
    assert.equal(nav[0].portUnit, p.nav[0].unit);
    assert.ok(p.snapshots.length >= 1);
    assert.ok(p.byName.find((n) => n.symbol === "X"));
  });
});
