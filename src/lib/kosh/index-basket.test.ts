import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  acceptBasket,
  benchmarkMatches,
  buildNameIndex,
  parseEtfHtml,
  parseSchemePayload,
  symbolForName,
  treemap,
  weightSum,
} from "./index-basket.ts";
import { heatPaint, packWeightRows } from "./heat-layout.ts";
import { INDEX_SNAPSHOTS } from "./index-snapshots.ts";

describe("index basket benchmark match", () => {
  it("matches a total-return print and rejects a different index", () => {
    assert.equal(benchmarkMatches("Nifty 50", "Nifty 50 TRI"), true);
    assert.equal(benchmarkMatches("Nifty 50", "NIFTY 50 Total Return Index"), true);
    assert.equal(benchmarkMatches("Nifty 50", "Nifty 50 Equal Weight TRI"), false);
    assert.equal(benchmarkMatches("Nifty 50", "Nifty 500 TRI"), false);
    assert.equal(benchmarkMatches("Nifty Bank", "Nifty PSU Bank TRI"), false);
    assert.equal(benchmarkMatches("Nifty Bank", "Nifty Bank TRI"), true);
    assert.equal(benchmarkMatches("Nifty Financial Services", "Nifty Financial Services Ex-Bank TRI"), false);
    assert.equal(benchmarkMatches("Nifty Infra", "Nifty Infrastructure TRI"), true);
    assert.equal(benchmarkMatches("Nifty Services", "Nifty Service Sector TRI"), true);
    assert.equal(benchmarkMatches("Nifty Consumption", "Nifty India New Age Consumption TRI"), false);
    assert.equal(benchmarkMatches("Nifty 100 ESG", "Nifty 100 ESG Sector Leaders TRI", ["Nifty 100 ESG Sector Leaders"]), true);
    assert.equal(benchmarkMatches("Nifty LargeMidcap 250", "NIFTY Large Midcap 250 Total Return Index"), true);
    assert.equal(benchmarkMatches("Nifty MidSmallcap 400", "NIFTY Mid Small Cap 400 Total Return Index"), true);
    assert.equal(benchmarkMatches("Nifty Smallcap 250 Quality 50", "Nifty Smallcap250 Quality 50 Total Return Index"), true);
    assert.equal(benchmarkMatches("Nifty 100 Equal Weight", "Nifty 100 Equal Weighted TRI"), true);
    assert.equal(benchmarkMatches("Nifty Infra Logistics", "Nifty India Infrastructure & Logistics TRI"), true);
    assert.equal(benchmarkMatches("Nifty Oil & Gas", "Nifty Oil & Gas TRI"), true);
  });
});

describe("index basket parsers", () => {
  it("reads ETF holdings and NSE symbols from the page payload", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
      props: {
        pageProps: {
          etfData: { header: { displayName: "Nippon India ETF Nifty IT" } },
          etfInfoData: { benchmarkIndex: "Nifty IT TRI" },
          etfHoldingsData: {
            holdings: [
              { isin: "A", holdingSharePercentage: 31.29 },
              { isin: "B", holdingSharePercentage: 19.07 },
              { isin: "C", holdingSharePercentage: 0 },
            ],
          },
          companyHeadersByIsin: {
            A: { nseScriptCode: "INFY", displayName: "Infosys", industryName: "IT" },
            B: { nseScriptCode: "TCS", displayName: "TCS" },
          },
        },
      },
    })}</script>`;
    const parsed = parseEtfHtml(html);
    assert.ok(parsed);
    assert.equal(parsed.source, "Nippon India ETF Nifty IT");
    assert.equal(parsed.benchmark, "Nifty IT TRI");
    assert.equal(parsed.rows.length, 2);
    assert.equal(parsed.rows[0]?.symbol, "INFY");
    assert.equal(parsed.rows[0]?.weight, 31.29);
    assert.equal(parsed.rows[0]?.sector, "IT");
  });

  it("keeps equity rows from an index fund and drops cash", () => {
    const parsed = parseSchemePayload({
      scheme_name: "Motilal Oswal Nifty 500 Index Fund",
      benchmark_name: "NIFTY 500 Total Return Index",
      holdings: [
        ["1", "2026-09-30", "HDFC Bank Ltd", "EQUITY", "Financial", "Equity", null, "1", "5.66", null, null, "hdfc-bank-ltd"],
        ["1", "2026-09-30", "Cash", "CASH", "Cash", "Cash", null, "1", "0.2", null, null, null],
        ["1", "2026-08-31", "Infosys Ltd", "EQUITY", "Technology", "Equity", null, "1", "2.1", null, null, "infosys-ltd"],
      ],
    });
    assert.ok(parsed);
    assert.equal(parsed.rows.length, 2);
    assert.equal(parsed.asOf, "2026-09-30");
    assert.equal(parsed.rows[0]?.name, "HDFC Bank Ltd");
    assert.equal(parsed.rows[0]?.symbol, null);
    assert.equal(symbolForName("HDFC Bank Ltd", buildNameIndex([{ symbol: "HDFCBANK", name: "HDFC Bank Ltd." }])), "HDFCBANK");
  });

  it("rejects a partial top-10 snippet", () => {
    assert.equal(acceptBasket([{ weight: 10 }, { weight: 9 }, { weight: 8 }, { weight: 7 }, { weight: 6 }]), false);
    const full = Array.from({ length: 50 }, () => ({ weight: 2 }));
    assert.equal(acceptBasket(full), true);
    assert.equal(weightSum(full), 100);
  });
});

describe("weight treemap", () => {
  it("gives equal areas to equal weights and covers the box", () => {
    const tiles = treemap([25, 25, 25, 25], 100, 80);
    assert.equal(tiles.length, 4);
    const areas = tiles.map((tile) => tile.w * tile.h);
    for (const area of areas) assert.ok(Math.abs(area - 2000) < 1);
    const cover = areas.reduce((sum, area) => sum + area, 0);
    assert.ok(Math.abs(cover - 8000) < 1);
    for (const tile of tiles) {
      assert.ok(tile.w > 0 && tile.h > 0);
      assert.ok(tile.x >= -0.01 && tile.y >= -0.01);
      assert.ok(tile.x + tile.w <= 100.01);
      assert.ok(tile.y + tile.h <= 80.01);
    }
  });

  it("sizes a heavy name larger than a light one", () => {
    const tiles = treemap([70, 20, 10], 100, 100);
    assert.ok(tiles[0].w * tiles[0].h > tiles[1].w * tiles[1].h);
    assert.ok(tiles[1].w * tiles[1].h > tiles[2].w * tiles[2].h);
  });
});

describe("weight mosaic", () => {
  it("keeps every name readable and areas in weight order", () => {
    const packed = packWeightRows([50, 30, 20], 300, 100, 40);
    assert.equal(packed.tiles.length, 3);
    for (const tile of packed.tiles) {
      assert.ok(tile.w >= 99, String(tile.w));
      assert.ok(tile.h >= 39, String(tile.h));
    }
    const area = (i: number) => {
      const tile = packed.tiles.find((row) => row.i === i)!;
      return tile.w * tile.h;
    };
    assert.ok(area(0) > area(1));
    assert.ok(area(1) > area(2));
    assert.equal(heatPaint(null).background, "#3c434a");
    assert.notEqual(heatPaint(0).background, heatPaint(2).background);
  });

  it("gives equal weights nearly equal tiles", () => {
    const packed = packWeightRows([1, 1, 1, 1], 400, 90, 48);
    const areas = packed.tiles.map((tile) => tile.w * tile.h);
    assert.ok(Math.max(...areas) - Math.min(...areas) < Math.min(...areas) * 0.15);
  });
});

describe("sector snapshots without an ETF", () => {
  it("keeps a full named basket whose weights add up", () => {
    for (const [symbol, snap] of Object.entries(INDEX_SNAPSHOTS)) {
      assert.ok(snap.rows.length >= 10, symbol);
      const symbols = snap.rows.map((row) => row.symbol);
      assert.equal(new Set(symbols).size, symbols.length, symbol);
      const sum = weightSum(snap.rows);
      assert.ok(sum > 99 && sum < 101, symbol + " " + sum);
      assert.ok(acceptBasket(snap.rows), symbol);
    }
  });
});
