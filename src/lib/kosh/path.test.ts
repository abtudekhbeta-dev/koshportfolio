import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { afterSale, buildPath, fillTradePrices, mixVsPathGaps, overlayOnMix, pathToChartNav, sortTrades } from "./path.ts";
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

  it("orders same-day trades by timestamp, sell then buy", () => {
    const rows = [
      { ...sell("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T10:00:00.000Z", src: 0 },
      { ...buy("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T14:00:00.000Z", src: 1 },
    ];
    const s = sortTrades(rows);
    assert.equal(s[0].side, -1);
    assert.equal(s[1].side, 1);
  });

  it("orders same-day trades by timestamp, buy then sell", () => {
    const rows = [
      { ...buy("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T10:00:00.000Z", src: 0 },
      { ...sell("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T14:00:00.000Z", src: 1 },
    ];
    const s = sortTrades(rows);
    assert.equal(s[0].side, 1);
    assert.equal(s[1].side, -1);
  });

  it("orders buy then sell then buy on the same day by clock", () => {
    const rows = [
      { ...buy("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T16:00:00.000Z", src: 2 },
      { ...sell("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T12:00:00.000Z", src: 1 },
      { ...buy("X", 1, 10, "2024-01-02"), boughtAt: "2024-01-02T09:00:00.000Z", src: 0 },
    ];
    const s = sortTrades(rows);
    assert.deepEqual(
      s.map((t) => t.side),
      [1, -1, 1],
    );
  });

  it("without a clock uses source row order, not buy-before-sell", () => {
    const rows = [
      { ...sell("X", 1, 10, "2024-01-02"), src: 0 },
      { ...buy("X", 1, 10, "2024-01-02"), src: 1 },
    ];
    const s = sortTrades(rows);
    assert.equal(s[0].side, -1);
    assert.equal(s[1].side, 1);
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

  it("keeps two identical executions as two trades", () => {
    const hx = { X: bars("2024-01-02", 10, 10, 0) };
    const p = buildPath(
      [buy("X", 10, 10, "2024-01-02"), buy("X", 10, 10, "2024-01-02")],
      hx,
      hx.X,
    );
    assert.equal(p.nBuys, 2);
    assert.equal(p.nTrades, 2);
    assert.equal(p.stillHeld[0]?.qty, 20);
  });

  it("TWR is unchanged by a same-day stock rotation of equal rupees", () => {
    const a = bars("2024-01-02", 20, 10, 0);
    const b = bars("2024-01-02", 20, 10, 0);
    for (let i = 8; i < b.length; i++) {
      b[i].c = 12;
      b[i].raw = 12;
    }
    const p = buildPath(
      [buy("A", 10, 10, "2024-01-02"), sell("A", 10, 10, "2024-01-08"), buy("B", 10, 10, "2024-01-08")],
      { A: a, B: b },
      a,
    );
    assert.ok(p.twr != null);
    assert.ok(Math.abs(p.twr! - 20) < 3, String(p.twr));
  });

  it("same-day rotation does not withdraw from the index sleeve", () => {
    const a = bars("2024-01-02", 12, 10, 0);
    const b = bars("2024-01-02", 12, 10, 0);
    const nifty = bars("2024-01-02", 12, 100, 0);
    nifty[nifty.length - 1].c = 110;
    nifty[nifty.length - 1].raw = 110;
    const p = buildPath(
      [buy("A", 10, 10, "2024-01-02"), sell("A", 10, 10, "2024-01-06"), buy("B", 10, 10, "2024-01-06")],
      { A: a, B: b },
      nifty,
    );
    assert.ok(p.sameCashLast != null);
    assert.ok(Math.abs(p.sameCashLast! - 110) < 1e-4, String(p.sameCashLast));
  });

  it("yearly return is chained unit TWR, not Dietz", () => {
    const hx = { X: bars("2023-12-20", 400, 100, 0) };
    for (const bar of hx.X) {
      const day = new Date(bar.t * 1000).toISOString().slice(0, 10);
      if (day >= "2024-12-01") {
        bar.c = 110;
        bar.raw = 110;
      }
    }
    const p = buildPath(
      [buy("X", 10, 100, "2023-12-20"), buy("X", 90, 100, "2024-06-03")],
      hx,
      hx.X,
    );
    const y = p.years.find((r) => r.year === "2024");
    assert.ok(y);
    assert.ok(y!.ret != null);
    assert.ok(Math.abs(y!.ret! - 10) < 2.5, "TWR should be ~10%, got " + y!.ret);
    assert.ok(Math.abs(y!.ret! - 18.18) > 3, "must not be Dietz ~18%");
  });

  it("monthly rows compare portfolio TWR to the index", () => {
    const hx = { X: bars("2024-01-02", 70, 100, 0.002) };
    const nifty = bars("2024-01-02", 70, 100, 0.001);
    const p = buildPath([buy("X", 10, 100, "2024-01-02")], hx, nifty);
    assert.ok(p.months.length >= 1);
    assert.ok(p.months.every((m) => Number.isFinite(m.port)));
    assert.ok(p.months.some((m) => m.bench != null));
  });

  it("index TWR over the path window is a price return, not stock-sale withdrawals", () => {
    const hx = { X: bars("2024-01-02", 20, 100, 0) };
    const nifty = bars("2024-01-02", 20, 100, 0);
    nifty[nifty.length - 1].c = 120;
    nifty[nifty.length - 1].raw = 120;
    const p = buildPath([buy("X", 10, 100, "2024-01-02")], { X: hx.X }, nifty);
    assert.ok(p.benchTwr != null);
    assert.ok(Math.abs(p.benchTwr! - 20) < 1.5, String(p.benchTwr));
  });

  it("grouped name P&L is realized plus unrealized, not both counted twice", () => {
    const hx = { TCS: bars("2024-01-02", 40, 100, 0) };
    hx.TCS.forEach((b, i) => {
      if (i > 20) {
        b.c = 150;
        b.raw = 150;
      }
    });
    const p = buildPath(
      [buy("TCS", 10, 100, "2024-01-02"), sell("TCS", 4, 150, "2024-01-25")],
      hx,
      hx.TCS,
    );
    const row = p.byName.find((n) => n.symbol === "TCS");
    assert.ok(row);
    assert.equal(row!.realized, 4 * 50);
    assert.ok(Math.abs(row!.unrealized - 6 * 50) < 1e-6);
    assert.ok(Math.abs(row!.total - (row!.realized + row!.unrealized)) < 1e-6);
    assert.equal(p.events.filter((e) => e.symbol === "TCS").length, 2);
  });

  it("closed trades record post-sale 1M when later prints exist", () => {
    const hx = { X: bars("2024-01-02", 80, 100, 0) };
    for (const bar of hx.X) {
      const day = new Date(bar.t * 1000).toISOString().slice(0, 10);
      if (day >= "2024-02-05") {
        bar.c = 130;
        bar.raw = 130;
      }
    }
    const p = buildPath(
      [buy("X", 10, 100, "2024-01-02"), sell("X", 10, 100, "2024-01-06")],
      hx,
      hx.X,
    );
    const c = p.closed[0];
    assert.ok(c);
    assert.ok(c.post1m != null);
    assert.ok(Math.abs(c.post1m! - 30) < 1, String(c.post1m));
    assert.equal(c.after1m?.status, "calculated");
    assert.equal(c.after1m?.targetDate, "2024-02-06");
    assert.equal(c.after1m?.observedDate, "2024-02-06");
  });

  it("never-sold stays a hypothetical leftover of purchased qty", () => {
    const hx = { X: bars("2024-01-02", 20, 10, 0) };
    hx.X.forEach((b) => {
      b.c = 12;
      b.raw = 12;
    });
    hx.X[0].c = 10;
    hx.X[0].raw = 10;
    const p = buildPath([buy("X", 10, 10, "2024-01-02"), sell("X", 10, 11, "2024-01-10")], hx, hx.X);
    assert.equal(p.wealthNow, 0);
    assert.ok(p.neverSoldLast != null && Math.abs(p.neverSoldLast! - 120) < 1e-6);
  });
});

function dayMap(rows: Record<string, number>) {
  const m = new Map<string, { t: number; c: number }>();
  for (const [day, px] of Object.entries(rows)) m.set(day, { t: Date.parse(day + "T00:00:00Z") / 1000, c: px });
  return m;
}

describe("after-sale windows", () => {
  it("uses the first session on or after a weekend target, never a session before it", () => {
    const raw = dayMap({
      "2025-01-08": 100,
      "2025-02-07": 104,
      "2025-02-10": 110,
    });
    const cell = afterSale(raw, raw, "2025-01-08", 100, 1);
    assert.equal(cell.targetDate, "2025-02-08");
    assert.equal(cell.observedDate, "2025-02-10");
    assert.equal(cell.observedPx, 110);
    assert.equal(cell.status, "calculated");
    assert.ok(cell.pct != null && Math.abs(cell.pct - 10) < 0.01);
  });

  it("is insufficient history when the window has not elapsed — not today's price", () => {
    const raw = dayMap({ "2025-01-10": 100, "2025-01-31": 140 });
    const cell = afterSale(raw, raw, "2025-01-10", 100, 1);
    assert.equal(cell.status, "insufficient");
    assert.equal(cell.pct, null);
    assert.equal(cell.observedPx, null);
    assert.equal(cell.targetDate, "2025-02-10");
  });

  it("is unavailable when no session falls within 10 days after the target", () => {
    const raw = dayMap({ "2025-01-10": 100, "2025-02-07": 105, "2025-02-25": 150 });
    const cell = afterSale(raw, raw, "2025-01-10", 100, 1);
    assert.equal(cell.status, "unavailable");
    assert.equal(cell.pct, null);
    assert.notEqual(cell.observedDate, "2025-02-07");
  });

  it("uses the adjusted ratio when a split changes raw versus adjusted", () => {
    const raw = dayMap({ "2025-01-10": 200, "2025-02-10": 110 });
    const adj = dayMap({ "2025-01-10": 100, "2025-02-10": 110 });
    const cell = afterSale(raw, adj, "2025-01-10", 100, 1);
    assert.equal(cell.status, "calculated");
    assert.equal(cell.basis, "adjusted");
    assert.ok(cell.pct != null && Math.abs(cell.pct - 10) < 0.01);
    assert.ok(cell.observedPx != null && Math.abs(cell.observedPx - 110) < 0.01);
  });

  it("is not applicable without a sell price", () => {
    const cell = afterSale(undefined, undefined, "", 0, 1);
    assert.equal(cell.status, "na");
    assert.equal(cell.pct, null);
  });
});
