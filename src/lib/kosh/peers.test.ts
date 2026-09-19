import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { peerLineOf, pickPeers, sameBusinessPiles, peerInsight } from "./peers.ts";
import type { ScreenRow } from "./types.ts";

function row(symbol: string, extra: Partial<ScreenRow> = {}): ScreenRow {
  return {
    symbol,
    name: symbol,
    sector: extra.sector || "Financials",
    price: 100,
    changePct: 0,
    high52: 0,
    low52: 0,
    offHigh: null,
    ret1m: extra.ret1m ?? 20,
    ret3m: null,
    ret1y: null,
    vol: 0,
    volAvg: 0,
    volRatio: null,
    rsi: null,
    above50: null,
    above200: null,
    macdHist: null,
    bbPos: null,
    nr7: null,
    gapPct: null,
    above21: null,
    pe: extra.pe ?? 20,
    pb: null,
    roe: null,
    de: null,
    mcapCr: extra.mcapCr ?? 50_000,
    divYield: null,
    eps: null,
    book: null,
    salesYoY: null,
    profitYoY: null,
    promoters: null,
    roce: null,
    peg: null,
    opm: null,
    salesCagr3: null,
    profitCagr3: null,
    profitCagr5: null,
    retest: null,
    retestLevel: null,
    athRetest: null,
    fii: null,
    fiiPrev: null,
    fiiDelta: null,
    dii: null,
    diiPrev: null,
    diiDelta: null,
    shLabel: null,
    vcp: null,
    vcpBreak: null,
    vcpN: null,
    vcpLastPct: null,
    vcpDays: null,
    vcpVolX: null,
    vcpPivot: null,
    ...extra,
  };
}

describe("pickPeers", () => {
  it("maps a private bank to the private-bank line", () => {
    assert.equal(peerLineOf("HDFCBANK")?.id, "pvt-bank");
    assert.equal(peerLineOf("ICICIBANK.NS")?.id, "pvt-bank");
  });

  it("does not treat an NBFC as a peer of a private bank even if 1M return is hotter", () => {
    const rows = [
      row("HDFCBANK", { mcapCr: 1_200_000, pe: 20, ret1m: 1 }),
      row("ICICIBANK", { mcapCr: 900_000, pe: 18, ret1m: 2 }),
      row("KOTAKBANK", { mcapCr: 350_000, pe: 22, ret1m: 0 }),
      row("CUB", { mcapCr: 18_000, pe: 14, ret1m: 50, sector: "Financials" }),
      row("BAJFINANCE", { mcapCr: 550_000, pe: 30, ret1m: 40, sector: "Financials" }),
      row("SBIN", { mcapCr: 700_000, pe: 10, ret1m: 15, sector: "Financials" }),
    ];
    const out = pickPeers("HDFCBANK", rows, { mcapCr: 1_200_000, pe: 20, sector: "Financials" });
    const names = out.rows.map((r) => r.symbol);
    assert.equal(out.line, "Private banks");
    assert.equal(names[0], "ICICIBANK");
    assert.ok(names.indexOf("ICICIBANK") < names.indexOf("CUB"));
    assert.ok(!names.includes("BAJFINANCE"));
    assert.ok(!names.includes("SBIN"));
    assert.ok(!names.includes("HDFCBANK"));
  });

  it("picks paint names for Asian Paints, not steel in Materials", () => {
    const rows = [
      row("ASIANPAINT", { sector: "Materials", mcapCr: 280_000, ret1m: 1 }),
      row("BERGEPAINT", { sector: "Materials", mcapCr: 70_000, ret1m: 2 }),
      row("TATASTEEL", { sector: "Materials", mcapCr: 200_000, ret1m: 25 }),
      row("ULTRACEMCO", { sector: "Materials", mcapCr: 300_000, ret1m: 8 }),
    ];
    const out = pickPeers("ASIANPAINT", rows, { mcapCr: 280_000, sector: "Materials" });
    const names = out.rows.map((r) => r.symbol);
    assert.equal(out.line, "Paints");
    assert.ok(names.includes("BERGEPAINT"));
    assert.ok(!names.includes("TATASTEEL"));
    assert.ok(!names.includes("ULTRACEMCO"));
  });

  it("ranks IT services by size, not the 1-month bounce", () => {
    const rows = [
      row("TCS", { sector: "IT", mcapCr: 1_400_000, ret1m: 1 }),
      row("INFY", { sector: "IT", mcapCr: 700_000, ret1m: 2 }),
      row("AFFLE", { sector: "IT", mcapCr: 25_000, ret1m: 40 }),
      row("WIPRO", { sector: "IT", mcapCr: 280_000, ret1m: 3 }),
    ];
    const out = pickPeers("TCS", rows, { mcapCr: 1_400_000, sector: "IT" });
    const names = out.rows.map((r) => r.symbol);
    assert.equal(out.line, "IT services");
    assert.equal(names[0], "INFY");
    assert.ok(!names.includes("AFFLE"));
  });

  it("does not pad a known line with the rest of the sector", () => {
    const rows = [
      row("ASIANPAINT", { sector: "Materials", mcapCr: 280_000 }),
      row("BERGEPAINT", { sector: "Materials", mcapCr: 70_000 }),
      row("RANDOMCHEM", { sector: "Materials", mcapCr: 90_000 }),
    ];
    const out = pickPeers("ASIANPAINT", rows, { mcapCr: 280_000, sector: "Materials" });
    assert.deepEqual(out.rows.map((r) => r.symbol), ["BERGEPAINT"]);
  });

  it("keeps Reliance with oil marketers, not power generators in Energy", () => {
    const rows = [
      row("RELIANCE", { sector: "Energy", mcapCr: 1_800_000 }),
      row("IOC", { sector: "Energy", mcapCr: 200_000 }),
      row("BPCL", { sector: "Energy", mcapCr: 150_000 }),
      row("NTPC", { sector: "Energy", mcapCr: 400_000, ret1m: 40 }),
      row("POWERGRID", { sector: "Energy", mcapCr: 300_000 }),
    ];
    const out = pickPeers("RELIANCE", rows, { mcapCr: 1_800_000, sector: "Energy" });
    const names = out.rows.map((r) => r.symbol);
    assert.equal(out.line, "Oil marketing / refining");
    assert.ok(names.includes("IOC"));
    assert.ok(names.includes("BPCL"));
    assert.ok(!names.includes("NTPC"));
    assert.ok(!names.includes("POWERGRID"));
  });
});

describe("sameBusinessPiles", () => {
  it("needs the same line AND corr ≥ 50%", () => {
    const rows = [
      { symbol: "HDFCBANK", name: "HDFC Bank", weight: 0.2 },
      { symbol: "ICICIBANK", name: "ICICI Bank", weight: 0.15 },
      { symbol: "ASIANPAINT", name: "Asian Paints", weight: 0.1 },
    ];
    const high = sameBusinessPiles(rows, {
      symbols: ["HDFCBANK", "ICICIBANK", "ASIANPAINT"],
      matrix: [
        [1, 0.72, 0.81],
        [0.72, 1, 0.2],
        [0.81, 0.2, 1],
      ],
    });
    assert.equal(high.length, 1);
    assert.equal(high[0].line, "Private banks");
    assert.deepEqual(high[0].names.map((n) => n.symbol), ["HDFCBANK", "ICICIBANK"]);

    const low = sameBusinessPiles(rows, {
      symbols: ["HDFCBANK", "ICICIBANK", "ASIANPAINT"],
      matrix: [
        [1, 0.2, 0.81],
        [0.2, 1, 0.1],
        [0.81, 0.1, 1],
      ],
    });
    assert.equal(low.length, 0);
  });

  it("returns nothing without a corr pack", () => {
    assert.deepEqual(
      sameBusinessPiles([{ symbol: "HDFCBANK", name: "HDFC Bank", weight: 0.2 }]),
      [],
    );
  });
});

describe("peer insight", () => {
  it("stays silent without PE + ROCE + growth on both sides", () => {
    assert.equal(peerInsight({ pe: 20 }, [{ pe: 18, roce: 22, salesYoY: 12 }]), null);
    assert.equal(peerInsight({ pe: 20, roce: 22, salesYoY: 10 }, [{ pe: 18 }]), null);
  });

  it("states the premium versus the business line when the numbers exist", () => {
    const text = peerInsight(
      { pe: 40, roce: 30, salesYoY: 18 },
      [
        { pe: 20, roce: 20, salesYoY: 10 },
        { pe: 22, roce: 18, salesYoY: 8 },
      ],
    );
    assert.ok(text);
    assert.ok(/paying/i.test(text || ""));
    assert.ok(/ROCE/i.test(text || ""));
    assert.ok(!/undervalued/i.test(text || ""));
  });
});
