import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assembleBook,
  buildMixPath,
  mixCagr,
  riskMetrics,
  saneDayPnl,
  sliceNav,
  toIndexed,
  windowReturn,
  fmtInr,
  fmtPct,
  fmtTapePx,
  dash,
  mergeNav,
  retFromBars,
  pickMaterialLevers,
  leverImproveScore,
} from "./engine.ts";
import { deriveMetal, etfToGramPrice, parseGrowwMcx, parseGrowwLive, parseGrowwExpiryPaths, pickMostActive, pickMcxSpot, gramToMcx, mcxToGram } from "./commodities.ts";
import { sharePct, diiPct } from "./fundamentals.server.ts";
import type { Bar, Holding, RiskLever } from "./types.ts";
import {
  grahamNumber,
  pegRatio,
  niftyOverlap,
  corrFromBars,
  taxClock,
  buildCorrPack,
} from "./portfolio-stats.ts";

function bars(startDayOffset: number, n: number, startPx: number, daily: number): Bar[] {
  const out: Bar[] = [];
  let px = startPx;
  const t0 = Date.UTC(2024, 0, 2) / 1000;
  for (let i = 0; i < n; i++) {
    out.push({ t: t0 + (startDayOffset + i) * 86400, c: px });
    px *= 1 + daily;
  }
  return out;
}

describe("current-mix path", () => {
  it("does not require every ticker on every date (union, not inner join)", () => {
    const a: Holding[] = [
      { symbol: "A", name: "A", qty: 1, avg: 100, date: null },
      { symbol: "B", name: "B", qty: 1, avg: 100, date: null },
    ];
    const hx = {
      A: bars(0, 40, 100, 0.001),
      B: bars(10, 20, 50, 0.002),
    };
    const mix = buildMixPath(a, hx, []);
    assert.equal(mix.method, "current-mix");
    assert.ok(mix.nav.length > 20, "union of days should keep the longer calendar");
    assert.deepEqual(mix.missing, []);
    const days = new Set(mix.nav.map((p) => p.day));
    assert.equal(days.size, mix.nav.length);
  });

  it("skips a dead ticker instead of wiping the series", () => {
    const h: Holding[] = [
      { symbol: "LIVE", name: "LIVE", qty: 10, avg: 100, date: null },
      { symbol: "DEAD", name: "DEAD", qty: 10, avg: 100, date: null },
    ];
    const mix = buildMixPath(h, { LIVE: bars(0, 30, 100, 0.002), DEAD: [] }, []);
    assert.deepEqual(mix.missing, ["DEAD"]);
    assert.ok(mix.nav.length >= 10);
    assert.match(mix.coverage, /1\/2 stocks/);
  });

  it("first listing of a name does not jump NAV", () => {
    const h: Holding[] = [
      { symbol: "A", name: "A", qty: 1, avg: null, date: null },
      { symbol: "B", name: "B", qty: 1, avg: null, date: null },
    ];
    const hx = {
      A: bars(0, 20, 100, 0),
      B: bars(10, 10, 100, 0),
    };
    const mix = buildMixPath(h, hx, []);
    for (const p of mix.nav) {
      assert.ok(Math.abs(p.port - 100) < 1e-6, "flat names must keep NAV at 100");
    }
  });

  it("uses current (last-price) weights", () => {
    const h: Holding[] = [
      { symbol: "A", name: "A", qty: 1, avg: null, date: null },
      { symbol: "B", name: "B", qty: 1, avg: null, date: null },
    ];
    const hx = {
      A: bars(0, 15, 100, 0),
      B: bars(0, 15, 300, 0),
    };
    const mix = buildMixPath(h, hx, []);
    assert.ok(Math.abs(mix.weights.A - 0.25) < 1e-9);
    assert.ok(Math.abs(mix.weights.B - 0.75) < 1e-9);
  });

  it("carries the benchmark forward so the last mix day still has an index print", () => {
    const h: Holding[] = [{ symbol: "A", name: "A", qty: 1, avg: null, date: null }];
    const stock = bars(0, 12, 100, 0.001);
    const bench = stock.slice(0, -2);
    const mix = buildMixPath(h, { A: stock }, bench);
    const last = mix.nav.at(-1);
    assert.ok(last && last.bench != null && last.bench > 0);
    const y = windowReturn(mix.nav, 7);
    assert.ok(y.bench != null);
  });
});

describe("windows and risk", () => {
  it("MAX is the full series, not a 800-day cap", () => {
    const h: Holding[] = [{ symbol: "A", name: "A", qty: 1, avg: null, date: null }];
    const mix = buildMixPath(h, { A: bars(0, 1200, 100, 0.0004) }, []);
    const max = sliceNav(mix.nav, "MAX");
    assert.equal(max.length, mix.nav.length);
    const y1 = sliceNav(mix.nav, "1Y");
    assert.ok(y1.length < max.length);
  });

  it("windowReturn is null when history is too short", () => {
    const h: Holding[] = [{ symbol: "A", name: "A", qty: 1, avg: null, date: null }];
    const mix = buildMixPath(h, { A: bars(0, 20, 100, 0.001) }, []);
    const y1 = windowReturn(mix.nav, 365);
    assert.equal(y1.port, null);
  });

  it("CAGR of doubling in one year is ~100%", () => {
    const t0 = Date.UTC(2020, 0, 2) / 1000;
    const nav = [
      { t: t0, day: "2020-01-02", port: 100, bench: 100, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 365.25 * 86400, day: "2021-01-02", port: 200, bench: 110, covered: 1, names: 1, wAvail: 1 },
    ];
    const c = mixCagr(nav);
    assert.ok(c != null);
    assert.ok(Math.abs(c - 100) < 0.2);
  });

  it("Sharpe / vol print null on a short series, never 0", () => {
    const nav = Array.from({ length: 4 }, (_, i) => ({
      t: 1_700_000_000 + i * 86400,
      day: "2024-01-0" + (i + 1),
      port: 100 + i,
      bench: 100,
      covered: 1,
      names: 1,
      wAvail: 1,
    }));
    const r = riskMetrics(nav);
    assert.equal(r.sharpe, null);
    assert.equal(r.vol, null);
  });

  it("toIndexed rebases port and bench from the first overlapping day", () => {
    const t0 = Date.UTC(2015, 0, 2) / 1000;
    const nav = [
      { t: t0, day: "2015-01-02", port: 400, bench: null, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 86400, day: "2015-01-03", port: 420, bench: null, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 2 * 86400, day: "2015-01-04", port: 440, bench: 100, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 3 * 86400, day: "2015-01-05", port: 462, bench: 105, covered: 1, names: 1, wAvail: 1 },
    ];
    const idx = toIndexed(nav);
    assert.equal(idx[0].day, "2015-01-04");
    assert.ok(Math.abs(idx[0].portIdx - 100) < 1e-9);
    assert.ok(Math.abs((idx[0].benchIdx || 0) - 100) < 1e-9);
    assert.ok(Math.abs(idx[1].portIdx - 105) < 1e-6);
    assert.ok(Math.abs((idx[1].benchIdx || 0) - 105) < 1e-6);
  });

  it("riskMetrics labels the overlapping window", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const nav = Array.from({ length: 40 }, (_, i) => {
      const d = new Date(Date.UTC(2024, 0, 2 + i));
      return {
        t: t0 + i * 86400,
        day: d.toISOString().slice(0, 10),
        port: 100 * Math.pow(1.001, i),
        bench: 100 * Math.pow(1.0008, i),
        covered: 1,
        names: 1,
        wAvail: 1,
      };
    });
    const r = riskMetrics(nav);
    assert.ok(r.since);
    assert.ok(r.sessions >= 20);
    assert.ok(/Since/.test(r.windowLabel));
    assert.ok(r.beta != null);
  });

  it("saneDayPnl ignores a single-name move above 25%", () => {
    assert.deepEqual(saneDayPnl(10000, 40), { abs: 0, pct: 0 });
    const ok = saneDayPnl(10000, 2);
    assert.equal(ok.abs, 200);
  });
});

describe("formatters", () => {
  it("formats INR and percent, dashes nulls", () => {
    assert.equal(fmtInr(2_50_000), "₹2.50 L");
    assert.equal(fmtInr(3_20_00_000), "₹3.20 Cr");
    assert.equal(fmtPct(1.234), "+1.23%");
    assert.equal(fmtPct(-2), "-2.00%");
    assert.equal(dash(null), "—");
  });
});

describe("mergeNav", () => {
  it("forward-fills so both legs stay on the chart", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const a = [
      { t: t0, day: "2024-01-02", port: 100, bench: null, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 86400, day: "2024-01-03", port: 110, bench: null, covered: 1, names: 1, wAvail: 1 },
    ];
    const b = [
      { t: t0 + 86400, day: "2024-01-03", port: 90, bench: null, covered: 1, names: 1, wAvail: 1 },
      { t: t0 + 2 * 86400, day: "2024-01-04", port: 95, bench: null, covered: 1, names: 1, wAvail: 1 },
    ];
    const m = mergeNav(a, b);
    assert.ok(m.length >= 2);
    assert.ok(m.every((p) => p.port > 0 && p.bench != null && p.bench > 0));
  });
});

describe("commodities", () => {
  it("fills grams from invested and a close", () => {
    const d = deriveMetal({ invested: 74120, close: 7412 });
    assert.equal(d.ok, true);
    if (d.ok) {
      assert.ok(Math.abs(d.qty - 10) < 1e-6);
      assert.ok(Math.abs(d.avg - 7412) < 1e-6);
    }
  });

  it("fills price from qty and invested", () => {
    const d = deriveMetal({ qty: 5, invested: 25000 });
    assert.equal(d.ok, true);
    if (d.ok) assert.equal(d.avg, 5000);
  });

  it("scales Indian gold ETFs to ₹/g and leaves silver ETFs as ₹/g", () => {
    assert.equal(etfToGramPrice("GOLD", 127.32), 12732);
    assert.equal(etfToGramPrice("GOLD", 12800), 12800);
    assert.equal(etfToGramPrice("SILVER", 223.21), 223.21);
  });

  it("converts MCX display units to grams and back", () => {
    assert.equal(gramToMcx("GOLD", 15446), 154460);
    assert.equal(mcxToGram("GOLD", 154460), 15446);
    assert.equal(Math.round(gramToMcx("SILVER", 240.121)), 240121);
    assert.ok(Math.abs(mcxToGram("SILVER", 240121) - 240.121) < 1e-9);
    assert.equal(fmtTapePx(154456, "₹/10g"), "1,54,456 ₹/10g");
    assert.equal(fmtTapePx(233977, "₹/kg"), "2,33,977 ₹/kg");
  });

  it("parses Groww MCX gold and silver spots without Mini contracts", () => {
    const html =
      `"spotPrice":154456,"displayName":"Gold Mini","lastDayClosePrice":155946,"baseUnderlyingSearchId":"mcx_goldm"},{"symbol":"GOLD","spotPrice":154456,"displayName":"Gold","lastDayClosePrice":156281,"baseUnderlyingSearchId":"mcx_gold"},{"spotPrice":233977,"displayName":"Silver","lastDayClosePrice":236704,"baseUnderlyingSearchId":"mcx_silver"}`;
    const g = parseGrowwMcx(html, "Gold");
    const s = parseGrowwMcx(html, "Silver");
    assert.ok(g);
    assert.equal(g?.display, 154456);
    assert.equal(g?.prev, 156281);
    assert.ok(s);
    assert.equal(s?.display, 233977);
  });

  it("uses list Silver, never Mini or a far-month future", () => {
    const list = { display: 233977, prev: 236704 };
    const mini = { display: 237000, prev: 238184, volume: 99_000, oi: 1, expiry: "2026-08-31", name: "SILVERM 31 Aug Fut" };
    const far = { display: 240250, prev: 241000, volume: 50_000, oi: 1, expiry: "2026-12-04", name: "SILVER 4 Dec Fut" };
    const near = { display: 233977, prev: 236704, volume: 120, oi: 1, expiry: "2026-09-04", name: "SILVER 4 Sep Fut" };
    const hit = pickMcxSpot("SILVER", list, [mini, far, near]);
    assert.equal(hit?.display, 233977);
    const noList = pickMcxSpot("SILVER", null, [mini, far, near]);
    assert.equal(noList?.display, 233977);
    const miniOnly = pickMcxSpot("SILVER", null, [mini]);
    assert.equal(miniOnly, null);
  });

  it("picks the most-active MCX month, not the expiring near month", () => {
    const sep = parseGrowwLive(
      `"companyShortName":"SILVER 4 Sep Fut","expiryDate":"2026-09-04","livePriceDetails":{"symbol":"1","open":233383,"high":236800,"low":232501,"close":236704,"ltp":233977,"volume":134550,"openInterest":4005}`,
    );
    const dec = parseGrowwLive(
      `"companyShortName":"SILVER 4 Dec Fut","expiryDate":"2026-12-04","livePriceDetails":{"symbol":"2","open":241000,"high":243000,"low":239000,"close":242444,"ltp":240250,"volume":244140,"openInterest":9835}`,
    );
    assert.equal(sep?.display, 233977);
    assert.equal(dec?.display, 240250);
    const pick = pickMostActive([sep, dec]);
    assert.equal(pick?.display, 240250);
    assert.match(pick?.name || "", /Dec/i);
  });

  it("reads other MCX months from a Groww futures page", () => {
    const html = `href="/commodities/futures/mcx_silver/mcx_silver04dec26fut" "searchId":"mcx_silver04dec26fut" href="/commodities/futures/mcx_silver/mcx_silverm30nov26fut"`;
    const paths = parseGrowwExpiryPaths(html, "SILVER");
    assert.ok(paths.includes("/commodities/futures/mcx_silver/mcx_silver04dec26fut"));
    assert.equal(paths.some((p) => p.includes("silverm")), false);
  });

  it("drops gold from mix when includeCommodities is false but keeps the holding", () => {
    const holdings = [
      { symbol: "A", name: "A", qty: 1, avg: 100, date: null },
      { symbol: "GOLD", name: "Gold", qty: 10, avg: 5000, date: null, kind: "commodity" as const, unit: "g" as const },
    ];
    const hxA = bars(0, 30, 100, 0.001);
    const hxG = bars(0, 30, 5000, 0.002);
    const q = {
      input: "A",
      symbol: "A",
      name: "A",
      price: 110,
      previousClose: 100,
      changePct: 1,
      high52: 120,
      low52: 90,
    };
    const gq = { ...q, input: "GOLD", symbol: "GOLD", name: "Gold", price: 6000, high52: 7000, low52: 4000 };
    const book = assembleBook({
      holdings,
      quotes: { A: q, GOLD: gq },
      histories: { A: hxA, GOLD: hxG },
      packs: {},
      benchSymbol: "^NSEI",
      benchName: "Nifty 50",
      includeCommodities: false,
    });
    assert.ok(book.corr);
    assert.equal(book.corr.matrix.length, book.corr.symbols.length);
    assert.equal(book.includeCommodities, false);
    assert.ok(book.rows.some((r) => r.symbol === "GOLD"));
    assert.equal(book.mix.used.includes("GOLD"), false);
    assert.ok(book.commodityValue > 0);
    assert.ok(Math.abs(book.value - book.equityValue) < 1e-6);
  });
});

describe("shareholding parse", () => {
  it("sums nested promoter buckets used by Groww", () => {
    const sh = {
      promoters: { individual: { percent: 50.4808 }, government: { percent: 0 }, corporation: { percent: 0 } },
      mutualFunds: { percent: 10.1062 },
      otherDomesticInstitutions: { insurance: { percent: 11.082 }, otherFirms: { percent: 0 } },
      foreignInstitutions: { percent: 17.1961 },
    };
    assert.equal(Number(sharePct(sh.promoters)?.toFixed(1)), 50.5);
    assert.equal(Number(sharePct(sh.foreignInstitutions)?.toFixed(1)), 17.2);
    assert.equal(Number(diiPct(sh)?.toFixed(1)), 21.2);
  });
});

describe("file sector then ticker", () => {
  it("prefers the sector from the file when the holding has one", () => {
    const holdings: Holding[] = [{ symbol: "TCS", name: "TCS", qty: 1, avg: 100, date: null, sector: "Healthcare" }];
    const q = {
      input: "TCS",
      symbol: "TCS",
      name: "TCS",
      price: 110,
      previousClose: 100,
      changePct: 1,
      high52: 120,
      low52: 90,
      mcapCr: 800_000,
    };
    const book = assembleBook({
      holdings,
      quotes: { TCS: q },
      histories: { TCS: bars(0, 20, 110, 0) },
      packs: {},
      benchSymbol: "^NSEI",
      benchName: "Nifty 50",
    });
    assert.equal(book.rows[0].sector, "Healthcare");
    assert.equal(book.rows[0].cap, "Large");
  });

  it("fills sector from the ticker when the file has none", () => {
    const holdings: Holding[] = [{ symbol: "TCS", name: "TCS", qty: 1, avg: 100, date: null }];
    const q = {
      input: "TCS",
      symbol: "TCS",
      name: "TCS",
      price: 110,
      previousClose: 100,
      changePct: 1,
      high52: 120,
      low52: 90,
    };
    const book = assembleBook({
      holdings,
      quotes: { TCS: q },
      histories: { TCS: bars(0, 20, 110, 0) },
      packs: {},
      benchSymbol: "^NSEI",
      benchName: "Nifty 50",
    });
    assert.equal(book.rows[0].sector, "IT");
  });
});

describe("retFromBars", () => {
  it("returns the pack return when the span is long enough", () => {
    const b = bars(0, 250, 100, 0.001);
    const n = retFromBars(b, 180);
    assert.ok(n != null);
    assert.ok(Math.abs(n! - ((b.at(-1)!.c / b[0].c - 1) * 100)) < 1e-9);
  });

  it("returns null when history is too short", () => {
    const b = bars(0, 10, 100, 0.01);
    assert.equal(retFromBars(b, 180), null);
  });
});

describe("pickMaterialLevers", () => {
  const base = {
    sharpe: 1,
    maxDd: -10,
    vol: 12,
    cagr: 10,
  };

  it("picks the improving action per name and ranks it first", () => {
    const levers: RiskLever[] = [
      {
        symbol: "A",
        name: "A",
        weight: 0.25,
        action: "cut",
        label: "Remove",
        ...base,
        dSharpe: -0.3,
        dMaxDd: -4,
        dVol: 2,
        dCagr: -3,
      },
      {
        symbol: "A",
        name: "A",
        weight: 0.25,
        action: "add",
        label: "Add 50%",
        ...base,
        sharpe: 1.4,
        dSharpe: 0.22,
        dMaxDd: 2,
        dVol: -1,
        dCagr: 2,
      },
      {
        symbol: "B",
        name: "B",
        weight: 0.12,
        action: "cut",
        label: "Remove",
        ...base,
        dSharpe: 0.12,
        dMaxDd: 1.5,
        dVol: -1.4,
        dCagr: 1.3,
      },
    ];
    const got = pickMaterialLevers(levers, 4);
    assert.equal(got[0].symbol, "A");
    assert.equal(got[0].action, "add");
    assert.ok(leverImproveScore(got[0]) >= leverImproveScore(got[1]));
    assert.equal(got.filter((x) => x.symbol === "A").length, 1);
  });
});

describe("portfolio stats", () => {
  it("graham number is sqrt(22.5 × EPS × book)", () => {
    assert.equal(grahamNumber(10, 100), 150);
    assert.equal(grahamNumber(-1, 100), null);
    assert.equal(grahamNumber(10, 0), null);
    assert.equal(grahamNumber(null, 100), null);
  });

  it("PEG is P/E over positive profit growth only", () => {
    assert.equal(pegRatio(20, 10), 2);
    assert.equal(pegRatio(20, 0), null);
    assert.equal(pegRatio(20, -5), null);
    assert.equal(pegRatio(0, 10), null);
  });

  it("nifty overlap splits index names from satellites", () => {
    const ov = niftyOverlap([
      { symbol: "RELIANCE", name: "Reliance", weight: 0.6 },
      { symbol: "FOOBARX", name: "Sat", weight: 0.4 },
    ]);
    assert.equal(ov.count, 1);
    assert.equal(ov.total, 2);
    assert.ok(Math.abs(ov.weight - 0.6) < 1e-9);
    assert.equal(ov.satellites[0].symbol, "FOOBARX");
    assert.equal(ov.inside[0].symbol, "RELIANCE");
  });

  it("corrFromBars is near 1 for the same daily path and near -1 for the inverse", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const wave = (n: number, start: number, sign: number): Bar[] => {
      const out: Bar[] = [];
      let px = start;
      for (let i = 0; i < n; i++) {
        out.push({ t: t0 + i * 86400, c: px });
        px *= 1 + sign * (Math.sin(i / 5) * 0.012 + Math.sin(i / 13) * 0.007);
      }
      return out;
    };
    const a = wave(120, 100, 1);
    const same = wave(120, 50, 1);
    const opp = wave(120, 50, -1);
    const c1 = corrFromBars(a, same);
    const c2 = corrFromBars(a, opp);
    assert.ok(c1 != null && c1 > 0.99, String(c1));
    assert.ok(c2 != null && c2 < -0.99, String(c2));
  });

  it("tax clock is quiet days-held and days to 12-month", () => {
    const asOf = Date.parse("2026-09-07T00:00:00+05:30");
    const long = taxClock("2024-09-07", asOf);
    assert.ok(long);
    assert.equal(long!.longTerm, true);
    assert.equal(long!.toLtcg, 0);
    const short = taxClock("2026-06-07", asOf);
    assert.ok(short);
    assert.equal(short!.longTerm, false);
    assert.equal(short!.days, 92);
    assert.equal(short!.toLtcg, 273);
    assert.equal(taxClock(null, asOf), null);
  });

  it("buildCorrPack returns a square matrix", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const wave = (sign: number, start: number): Bar[] => {
      const out: Bar[] = [];
      let px = start;
      for (let i = 0; i < 100; i++) {
        out.push({ t: t0 + i * 86400, c: px });
        px *= 1 + sign * (Math.sin(i / 5) * 0.012 + Math.sin(i / 13) * 0.007);
      }
      return out;
    };
    const hx = { A: wave(1, 100), B: wave(1, 80), C: wave(-1, 40) };
    const pack = buildCorrPack(
      [
        { symbol: "A", name: "A", weight: 0.4 },
        { symbol: "B", name: "B", weight: 0.35 },
        { symbol: "C", name: "C", weight: 0.25 },
      ],
      hx,
    );
    assert.equal(pack.symbols.length, 3);
    assert.equal(pack.matrix.length, 3);
    assert.equal(pack.matrix[0][0], 1);
    assert.ok((pack.matrix[0][1] || 0) > 0.9, String(pack.matrix[0][1]));
    assert.ok((pack.matrix[0][2] || 0) < -0.9, String(pack.matrix[0][2]));
    assert.equal(pack.vsNifty.length, 3);
    assert.ok(pack.vsNifty.every((v) => v == null));
    const vs = buildCorrPack(
      [
        { symbol: "A", name: "A", weight: 0.4 },
        { symbol: "B", name: "B", weight: 0.35 },
        { symbol: "C", name: "C", weight: 0.25 },
      ],
      hx,
      12,
      hx.A,
    );
    assert.ok((vs.vsNifty[0] || 0) > 0.99, String(vs.vsNifty[0]));
    assert.ok((vs.vsNifty[1] || 0) > 0.9, String(vs.vsNifty[1]));
    assert.ok((vs.vsNifty[2] || 0) < -0.9, String(vs.vsNifty[2]));
  });
});
