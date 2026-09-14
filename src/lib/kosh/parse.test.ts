import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyHoldingPatch,
  extractHoldings,
  fillHoldings,
  guessTicker,
  mergeHoldings,
  parseCsv,
  parseMatrix,
  parseSpreadsheet,
  sanitizeHoldings,
  upsertHoldings,
} from "./parse.ts";

describe("guessTicker", () => {
  it("maps company names and ISINs", () => {
    assert.equal(guessTicker("Reliance Industries Ltd"), "RELIANCE");
    assert.equal(guessTicker("HDFC Bank"), "HDFCBANK");
    assert.equal(guessTicker("INE002A01018", "Reliance"), "RELIANCE");
    assert.equal(guessTicker("RELIANCE"), "RELIANCE");
    assert.equal(guessTicker("NSE:INFY"), "INFY");
    assert.equal(guessTicker("Stallion India Fluorochemicals Ltd"), "STALLION");
    assert.equal(guessTicker("Network People Services Technologies Ltd"), "NPST");
    assert.equal(guessTicker("Dwarikesh Sugar Industries Ltd"), "DWARKESH");
    assert.equal(guessTicker("STALLION-T"), "STALLION");
    assert.equal(guessTicker("BEMHY-X"), "BEMHY");
    assert.equal(guessTicker("Bemco Hydraulics"), "BEMHY");
    assert.equal(guessTicker("Escorts Kubota Ltd", "", "INE042A01014"), "ESCORTS");
  });
});

describe("extractHoldings", () => {
  it("reads a clean csv-shaped table", () => {
    const rows = parseCsv("Symbol,Quantity,AvgPrice\nRELIANCE,20,1100\nTCS,8,2100\n");
    const h = extractHoldings(rows);
    assert.equal(h.length, 2);
    assert.equal(h[0].symbol, "RELIANCE");
    assert.equal(h[0].qty, 20);
    assert.equal(h[0].avg, 1100);
  });

  it("skips Zerodha title rows and reads Avg. cost", () => {
    const csv = [
      "Holdings as on 29-08-2026",
      "",
      "Instrument,Qty.,Avg. cost,LTP,Invested,Cur. val,P&L",
      "RELIANCE,20,1100,1280,22000,25600,3600",
      "TCS,8,2100,2340,16800,18720,1920",
      "Total,28,,,38800,44320,5520",
    ].join("\n");
    const h = extractHoldings(parseCsv(csv));
    assert.equal(h.length, 2);
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.avg, 1100);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 8);
  });

  it("reads Groww-style company names", () => {
    const matrix = [
      ["Stock Name", "Qty", "Avg. Price"],
      ["Reliance Industries Ltd", 20, 1100],
      ["Infosys Limited", 15, 1050],
    ];
    const h = parseMatrix(matrix);
    assert.deepEqual(
      h.map((x) => x.symbol).sort(),
      ["INFY", "RELIANCE"],
    );
  });

  it("reads Upstox trading symbol + net qty", () => {
    const matrix = [
      ["Trading Symbol", "ISIN", "Net Qty", "Average Price"],
      ["HDFCBANK", "INE040A01034", 25, 650],
      ["ITC", "INE154A01025", 80, 250],
    ];
    const h = parseMatrix(matrix);
    assert.equal(h.length, 2);
    assert.equal(h.find((x) => x.symbol === "HDFCBANK")?.qty, 25);
    assert.equal(h.find((x) => x.symbol === "ITC")?.avg, 250);
  });

  it("maps ISINs to tickers and never shows ISIN as the name", () => {
    const matrix = [
      ["ISIN", "Quantity", "Avg Price", "Sector"],
      ["INE002A01018", 20, 1100, "Energy"],
      ["INE467B01029", 8, 2100, "Information Technology"],
    ];
    const h = parseMatrix(matrix);
    assert.equal(h.length, 2);
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.qty, 20);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 8);
    assert.ok(h.every((x) => !/^INE/.test(x.symbol)));
    assert.ok(h.every((x) => x.name && !/^INE/.test(x.name)));
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.sector, "Energy");
    assert.equal(h.find((x) => x.symbol === "TCS")?.sector, "IT");
  });

  it("prefers trading symbol over ISIN when both exist", () => {
    const matrix = [
      ["Trading Symbol", "ISIN", "Net Qty", "Average Price", "Company"],
      ["HDFCBANK", "INE040A01034", 25, 650, "HDFC Bank Limited"],
    ];
    const h = parseMatrix(matrix);
    assert.equal(h[0].symbol, "HDFCBANK");
    assert.equal(h[0].isin, "INE040A01034");
    assert.match(h[0].name, /HDFC/i);
  });

  it("merges duplicate lots", () => {
    const h = mergeHoldings(
      [{ symbol: "RELIANCE", name: "R", qty: 10, avg: 1000, date: null }],
      [{ symbol: "RELIANCE", name: "R", qty: 10, avg: 1200, date: null }],
    );
    assert.equal(h[0].qty, 20);
    assert.equal(h[0].avg, 1100);
  });
});

describe("xlsx workbook", () => {
  it("finds the holdings sheet under a title row", async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const aoa = [
      ["Zerodha Console"],
      ["Holdings as on 29 Aug 2026"],
      [],
      ["Instrument", "Qty.", "Avg. cost", "ISIN"],
      ["RELIANCE", 20, 1100, "INE002A01018"],
      ["BHARTIARTL", 30, 1500, "INE397D01024"],
      ["Total", 50, "", ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Holdings");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Notes"], ["ignore me"]]), "Cover");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const h = await parseSpreadsheet(buf);
    assert.equal(h.length, 2);
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.qty, 20);
    assert.equal(h.find((x) => x.symbol === "BHARTIARTL")?.avg, 1500);
  });

  it("reads Angel-style Script Name + Avg Unit Cost and never keeps an ISIN as ticker", async () => {
    const { readFileSync } = await import("node:fs");
    const buf = readFileSync("/workspace/attachments/Portfolio_Holdings_XO47I_20260829.xlsx");
    const h = await parseSpreadsheet(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    assert.equal(h.length, 16);
    const escorts = h.find((x) => x.symbol === "ESCORTS");
    assert.ok(escorts, "Escorts should resolve from ISIN/name");
    assert.ok(escorts!.avg && escorts!.avg > 3000, "avg unit cost should parse");
    assert.match(escorts!.name, /Escorts/i);
    assert.ok(h.every((x) => !/^INE/.test(x.symbol)));
    assert.ok(h.every((x) => x.avg && x.avg > 0));
    assert.equal(h.find((x) => x.symbol === "STALLION")?.qty, 444);
    assert.equal(h.find((x) => x.symbol === "NPST")?.qty, 60);
    assert.equal(h.find((x) => x.symbol === "DWARKESH")?.qty, 1050);
    assert.ok(h.find((x) => x.symbol === "AGL" || x.symbol === "ACLGLOBL"));
    assert.ok(h.find((x) => x.symbol === "ESFL-SM" || x.symbol === "ESFL_SM" || x.symbol === "ESFL"));
    assert.ok(h.every((x) => x.symbol.length <= 15 && !/LTD|LIMITED/.test(x.symbol)));
    const invested = h.reduce((s, x) => s + x.qty * (x.avg || 0), 0);
    assert.ok(Math.abs(invested - 1244499.8) < 1, `invested ${invested} should match the file`);
  });

  it("reads a Combined broker book, skips mutual funds, strips -T series", async () => {
    const { readFileSync } = await import("node:fs");
    const buf = readFileSync("/workspace/attachments/holdings-FTV396 2.xlsx");
    const h = await parseSpreadsheet(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    assert.ok(!h.some((x) => /FUND/i.test(x.symbol) || /FUND/i.test(x.name)));
    assert.ok(!h.some((x) => /^INE/.test(x.symbol)));
    const stallion = h.find((x) => x.symbol === "STALLION" || x.symbol.startsWith("STALLION"));
    assert.equal(stallion?.symbol, "STALLION");
    const tcs = h.find((x) => x.symbol === "TCS");
    assert.equal(tcs?.avg, 2641.55);
    assert.equal(tcs?.qty, 8);
    const paisalo = h.find((x) => x.symbol === "PAISALO");
    assert.ok(paisalo && paisalo.avg === 31.62);
    assert.equal(h.length, 17);
  });
});

describe("fillHoldings", () => {
  it("fills dates and avg on a match without adding qty", () => {
    const existing = [{ symbol: "TCS", name: "Tata Consultancy", qty: 8, avg: null, date: null }];
    const incoming = [{ symbol: "TCS", name: "TCS", qty: 8, avg: 2641, date: "2024-01-15" }];
    const out = fillHoldings(existing, incoming);
    assert.equal(out.length, 1);
    assert.equal(out[0].qty, 8);
    assert.equal(out[0].avg, 2641);
    assert.equal(out[0].date, "2024-01-15");
  });

  it("matches on company name when tickers differ in form", () => {
    const existing = [{ symbol: "RELIANCE", name: "Reliance Industries Ltd", qty: 2, avg: 1200, date: null }];
    const incoming = [{ symbol: "RELIANCE", name: "Reliance Industries", qty: 99, avg: null, date: "2023-06-01", boughtAt: "2023-06-01T10:00:00+05:30" }];
    const out = fillHoldings(existing, incoming);
    assert.equal(out.length, 1);
    assert.equal(out[0].qty, 2);
    assert.equal(out[0].avg, 1200);
    assert.equal(out[0].date, "2023-06-01");
  });

  it("adds a new name that was not in the book", () => {
    const existing = [{ symbol: "TCS", name: "TCS", qty: 1, avg: 1, date: null }];
    const incoming = [{ symbol: "INFY", name: "Infosys", qty: 4, avg: 1400, date: "2022-01-01" }];
    const out = fillHoldings(existing, incoming, { addNew: true });
    assert.equal(out.length, 2);
    assert.ok(out.find((x) => x.symbol === "INFY")?.qty === 4);
  });

  it("does not add sold or extra names when filling dates", () => {
    const existing = [{ symbol: "TCS", name: "TCS", qty: 8, avg: null, date: null }];
    const incoming = [
      { symbol: "TCS", name: "TCS", qty: 8, avg: 2641, date: "2024-01-15" },
      { symbol: "INFY", name: "Infosys", qty: 4, avg: 1400, date: "2022-01-01" },
    ];
    const out = fillHoldings(existing, incoming, { dates: true, prices: true });
    assert.equal(out.length, 1);
    assert.equal(out[0].symbol, "TCS");
    assert.equal(out[0].date, "2024-01-15");
    assert.equal(out[0].avg, 2641);
  });
});

describe("trade book netting", () => {
  it("nets buys and sells and drops sold-out names", () => {
    const rows = [
      { Symbol: "TCS", Side: "BUY", Qty: 10, "Avg Price": 3000, Date: "2023-01-10" },
      { Symbol: "TCS", Side: "SELL", Qty: 4, "Avg Price": 3500, Date: "2023-06-01" },
      { Symbol: "INFY", Side: "BUY", Qty: 5, "Avg Price": 1400, Date: "2023-02-01" },
      { Symbol: "INFY", Side: "SELL", Qty: 5, "Avg Price": 1500, Date: "2023-08-01" },
      { Symbol: "BEMHY-X", Side: "BUY", Qty: 20, "Avg Price": 800, Date: "2024-03-01" },
    ];
    const h = extractHoldings(rows);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 6);
    assert.ok(!h.find((x) => x.symbol === "INFY"));
    const bem = h.find((x) => x.symbol === "BEMHY");
    assert.ok(bem);
    assert.equal(bem!.qty, 20);
    assert.equal(bem!.date, "2024-03-01");
  });

  it("uses remaining lots for average after a partial exit", () => {
    const rows = [
      { Symbol: "TCS", "Buy/Sell": "BUY", Quantity: 10, Price: 100, Date: "2022-01-01" },
      { Symbol: "TCS", "Buy/Sell": "BUY", Quantity: 10, Price: 200, Date: "2023-01-01" },
      { Symbol: "TCS", "Buy/Sell": "SELL", Quantity: 10, Price: 300, Date: "2023-06-01" },
    ];
    const h = extractHoldings(rows);
    assert.equal(h.length, 1);
    assert.equal(h[0].qty, 10);
    assert.equal(h[0].avg, 200);
    assert.equal(h[0].date, "2023-01-01");
    assert.ok(h[0].lots && h[0].lots.length === 1);
    assert.equal(h[0].lots![0].avg, 200);
    assert.equal(h[0].lots![0].qty, 10);
  });

  it("drops remaining lots when the line is edited by hand", () => {
    const h = {
      symbol: "TCS",
      name: "TCS",
      qty: 10,
      avg: 200,
      date: "2023-01-01",
      lots: [{ qty: 10, avg: 200, date: "2023-01-01" }],
    };
    const edited = applyHoldingPatch(h, { qty: 12 });
    assert.equal(edited.qty, 12);
    assert.equal(edited.lots, undefined);
    const keep = applyHoldingPatch(h, { name: "Tata Consultancy" });
    assert.equal(keep.lots?.length, 1);
  });

  it("does not treat a holdings snapshot with Security Type = EQUITY as a trade book", () => {
    const rows = [
      { "Script Name": "TCS", Type: "EQUITY STOCK", Quantity: 8, "Avg Unit Cost": 2100 },
      { "Script Name": "Reliance Industries Ltd", Type: "EQUITY STOCK", Quantity: 20, "Avg Unit Cost": 1100 },
    ];
    const h = extractHoldings(rows);
    assert.equal(h.length, 2);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 8);
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.qty, 20);
  });

  it("nets buy qty and sell qty on the same snapshot row", () => {
    const rows = [
      { Symbol: "TCS", "Buy Qty": 10, "Sell Qty": 4, "Avg Price": 3000, Date: "2023-01-10" },
      { Symbol: "INFY", "Buy Qty": 5, "Sell Qty": 5, "Avg Price": 1400 },
    ];
    const h = extractHoldings(rows);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 6);
    assert.ok(!h.find((x) => x.symbol === "INFY"));
  });
});

describe("workbook mix", () => {
  it("overlays trade dates onto a holdings snapshot and does not add sold names", async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Instrument", "Qty.", "Avg. cost"],
        ["TCS", 8, 2100],
        ["RELIANCE", 20, 1100],
      ]),
      "Holdings",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Symbol", "Side", "Qty", "Price", "Date"],
        ["TCS", "BUY", 10, 2000, "2023-01-10"],
        ["TCS", "SELL", 2, 2500, "2023-06-01"],
        ["INFY", "BUY", 5, 1400, "2023-02-01"],
        ["INFY", "SELL", 5, 1500, "2023-08-01"],
      ]),
      "Tradebook",
    );
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const h = await parseSpreadsheet(buf);
    assert.equal(h.find((x) => x.symbol === "TCS")?.qty, 8);
    assert.equal(h.find((x) => x.symbol === "TCS")?.date, "2023-01-10");
    assert.equal(h.find((x) => x.symbol === "TCS")?.avg, 2100);
    assert.equal(h.find((x) => x.symbol === "RELIANCE")?.qty, 20);
    assert.ok(!h.find((x) => x.symbol === "INFY"));
  });
});

describe("upsert and sanitize", () => {
  it("replaces qty on a match instead of adding", () => {
    const existing = [{ symbol: "TCS", name: "TCS", qty: 8, avg: 2100, date: null }];
    const incoming = [{ symbol: "TCS", name: "TCS", qty: 6, avg: null, date: "2023-01-10" }];
    const out = upsertHoldings(existing, incoming);
    assert.equal(out.length, 1);
    assert.equal(out[0].qty, 6);
    assert.equal(out[0].avg, 2100);
    assert.equal(out[0].date, "2023-01-10");
  });

  it("strips a stored BEMHY-X series suffix", () => {
    const out = sanitizeHoldings([
      { symbol: "BEMHY-X", name: "Bemco Hydraulics", qty: 20, avg: 800, date: "2024-03-01" },
    ]);
    assert.equal(out[0].symbol, "BEMHY");
    assert.equal(out[0].qty, 20);
  });
});
