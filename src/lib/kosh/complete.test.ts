import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyScreen, blankScreenRow, fillBlankScreenFund } from "./screens.ts";
import {
  applyResearchToFund,
  blankFund,
  missingDisplayed,
  pool,
  researchBatches,
  researchPlan,
  SCREEN_FUND_FIELDS,
  seedCompletion,
  usablePathPrice,
} from "./complete.ts";
import { mergeCloud, sanitizeForCloud, emptyCloud } from "./cloud-state.ts";
import { snapTermHeight, TERM_HEIGHT } from "./term-height.ts";
import { observeCagr, observeWindow, observeYtd } from "./engine.ts";
import type { ResearchItem } from "./research-validate.ts";

function item(partial: Partial<ResearchItem> & Pick<ResearchItem, "metric" | "status">): ResearchItem {
  return {
    value: null,
    unit: "",
    period: "FY26",
    sourceName: "Annual report",
    sourceUrl: "https://example.com/ar",
    evidence: "Revenue from operations 100",
    methodology: "quoted",
    inputs: [],
    ...partial,
  };
}

describe("completion plan", () => {
  it("processes every symbol, not a silent first-N cap", async () => {
    const symbols = Array.from({ length: 10 }, (_, i) => "S" + i);
    const seen: string[] = [];
    const out = await pool(symbols, 2, async (s) => {
      seen.push(s);
      return s;
    });
    assert.equal(out.length, 10);
    assert.deepEqual(seen.sort(), symbols.sort());
  });

  it("does not ask AI for a CAGR when the annual series is already on file", () => {
    const fund = blankFund("TCS");
    fund.sales = [
      { period: "FY22", value: 100 },
      { period: "FY23", value: 110 },
      { period: "FY24", value: 121 },
      { period: "FY25", value: 133 },
    ];
    const plan = researchPlan(fund, ["Sales CAGR 3Y", "Sales growth", "ROE"]);
    assert.equal(plan.local.includes("Sales CAGR 3Y"), true);
    assert.equal(plan.ask.includes("Sales CAGR 3Y"), false);
    assert.equal(plan.ask.includes("ROE"), true);
  });

  it("asks for annual sales, not a guessed CAGR, when history is missing", () => {
    const plan = researchPlan(blankFund("INFY"), ["Sales CAGR 3Y", "Profit CAGR 5Y", "CFO/PAT"]);
    assert.ok(plan.ask.includes("annual sales history"));
    assert.ok(plan.ask.includes("annual profit history"));
    assert.ok(plan.ask.includes("annual cash from operations"));
    assert.equal(plan.ask.includes("Sales CAGR 3Y"), false);
  });

  it("persists a source-backed fact as researched and the screen can use it", () => {
    const fund = applyResearchToFund(blankFund("TCS"), [
      item({ metric: "ROE", status: "researched", value: 28, unit: "%" }),
      item({ metric: "D/E", status: "researched", value: 0.2, unit: "x" }),
    ]);
    assert.equal(fund.roe, 28);
    assert.equal(fund.provenance?.fields.roe?.status, "researched");
    assert.notEqual(fund.provenance?.fields.roe?.status, "verified");
    const again = applyResearchToFund(fund, []);
    assert.equal(again.roe, 28);
    const row = fillBlankScreenFund(blankScreenRow("TCS"), fund);
    row.price = 100;
    assert.equal(row.roe, 28);
    const passed = applyScreen([row], "quality").some((r) => r.symbol === "TCS");
    assert.equal(passed, true);
  });

  it("calculates CAGR from sourced annual inputs and does not keep a model CAGR", () => {
    const fund = applyResearchToFund(blankFund("INFY"), [
      item({
        metric: "annual sales history",
        status: "inputs_only",
        value: null,
        inputs: [
          { name: "FY22", value: 100, unit: "Cr" },
          { name: "FY23", value: 110, unit: "Cr" },
          { name: "FY24", value: 121, unit: "Cr" },
          { name: "FY25", value: 133.1, unit: "Cr" },
        ],
      }),
      item({ metric: "Sales CAGR 3Y", status: "researched", value: 99, unit: "%" }),
    ]);
    assert.ok(fund.sales.length >= 4);
    assert.notEqual(fund.salesCagr3, 99);
    assert.ok(fund.salesCagr3 != null && Math.abs(fund.salesCagr3 - 10) < 1);
    assert.equal(fund.provenance?.fields.salesCagr3?.status, "derived");
  });

  it("counts only displayed blanks", () => {
    const row = { pe: 12, pb: null, roe: 20 };
    const gaps = missingDisplayed(row, SCREEN_FUND_FIELDS);
    assert.ok(gaps.some((g) => g.key === "pb"));
    assert.equal(gaps.some((g) => g.key === "pe"), false);
  });

  it("asks for a longer profit history when two years cannot make a 5Y CAGR", () => {
    const fund = blankFund("INFY");
    fund.profits = [
      { period: "FY24", value: 100 },
      { period: "FY25", value: 110 },
    ];
    const plan = researchPlan(fund, ["Profit CAGR 5Y", "Profit CAGR 3Y"]);
    assert.equal(plan.local.length, 0);
    assert.ok(plan.ask.includes("annual profit history"));
    assert.equal(plan.ask.includes("Profit CAGR 5Y"), false);
  });

  it("does not ask for PEG when P/E and a 5Y profit series are already on file", () => {
    const fund = blankFund("TCS");
    fund.pe = 20;
    fund.profits = [10, 12, 14, 16, 18, 22].map((value, i) => ({ period: `FY${20 + i}`, value }));
    const plan = researchPlan(fund, ["PEG", "Profit CAGR 5Y"]);
    assert.equal(plan.local.includes("PEG"), true);
    assert.equal(plan.local.includes("Profit CAGR 5Y"), true);
    assert.equal(plan.ask.length, 0);
  });

  it("plans every displayed blank, including CAGR inputs, with no silent field cap", () => {
    const labels = ["P/E", "ROE", "ROCE", "OPM", "Sales CAGR 3Y", "Profit CAGR 5Y", "CFO/PAT", "D/E"];
    const plan = researchPlan(blankFund("WIPRO"), labels);
    for (const label of ["P/E", "ROE", "ROCE", "OPM", "D/E", "annual sales history", "annual profit history", "annual cash from operations"]) {
      assert.equal(plan.ask.includes(label), true, label);
    }
    assert.equal(plan.ask.includes("Sales CAGR 3Y"), false);
    assert.equal(plan.ask.includes("Profit CAGR 5Y"), false);
    assert.equal(plan.ask.includes("CFO/PAT"), false);
    assert.equal(researchBatches(plan.ask).flat().length, plan.ask.length);
  });

  it("keeps going past the server batch size instead of dropping metrics", () => {
    const asks = Array.from({ length: 30 }, (_, i) => "M" + i);
    const batches = researchBatches(asks);
    assert.equal(batches.length, 2);
    assert.equal(batches.flat().length, 30);
  });

  it("keeps a researched fact when the card is blank and does not let research replace the card", () => {
    const saved = applyResearchToFund(blankFund("TCS"), [
      item({ metric: "ROE", status: "researched", value: 28, unit: "%" }),
      item({ metric: "P/E", status: "researched", value: 99, unit: "x" }),
    ]);
    const card = blankFund("TCS");
    card.pe = 22;
    const merged = seedCompletion(saved, card, "TCS");
    assert.equal(merged.roe, 28);
    assert.equal(merged.provenance?.fields.roe?.status, "researched");
    assert.equal(merged.pe, 22);
    assert.notEqual(merged.provenance?.fields.pe?.status, "researched");
  });

  it("does not average a conflicting research reply into the company record", () => {
    const fund = applyResearchToFund(blankFund("INFY"), [
      item({ metric: "ROE", status: "conflicting", value: 40, unit: "%" }),
    ]);
    assert.equal(fund.roe, null);
    assert.equal(fund.provenance?.fields.roe?.status, "conflicting");
  });

  it("refuses to use an AI reply as a path price", () => {
    assert.equal(
      usablePathPrice(item({ metric: "close on 2024-01-02", status: "researched", value: 100 })),
      null,
    );
  });
});

describe("cloud merge", () => {
  it("keeps Path trades that the other device has and does not double them", () => {
    const remote = emptyCloud();
    remote.portfolios = [{ id: "p1", name: "Main", bench: "nifty", holdings: [{ symbol: "TCS", name: "TCS", qty: 1, avg: 10, date: "2020-01-01" }], trades: [] }];
    const local = emptyCloud();
    local.portfolios = [{
      id: "p1",
      name: "Main",
      bench: "nifty",
      holdings: [{ symbol: "TCS", name: "TCS", qty: 1, avg: 10, date: "2020-01-01" }],
      trades: [{ symbol: "TCS", name: "TCS", qty: 1, price: 10, date: "2020-01-01", side: 1 }],
    }];
    const once = mergeCloud(local, remote);
    assert.equal(once.doc.portfolios[0].trades?.length, 1);
    const twice = mergeCloud(sanitizeForCloud({ portfolios: once.doc.portfolios }), once.doc);
    assert.equal(twice.doc.portfolios[0].trades?.length, 1);
  });

  it("a fresh device keeps the saved terminal height and path", () => {
    const remote = emptyCloud();
    remote.chartPrefs = { termHeight: 720 };
    remote.portfolios = [{
      id: "p1",
      name: "Main",
      bench: "nifty",
      holdings: [{ symbol: "TCS", name: "TCS", qty: 2, avg: 10, date: "2020-01-01" }],
      trades: [{ symbol: "TCS", name: "TCS", qty: 2, price: 10, date: "2020-01-01", side: 1 }],
    }];
    const fresh = emptyCloud();
    const merged = mergeCloud(fresh, remote);
    assert.equal(merged.doc.chartPrefs.termHeight, 720);
    assert.equal(merged.doc.portfolios[0].trades?.length, 1);
  });
});

describe("terminal height", () => {
  it("snaps freeform values onto Compact, Standard, or Tall", () => {
    assert.equal(snapTermHeight(520), TERM_HEIGHT.standard);
    assert.equal(snapTermHeight(430), TERM_HEIGHT.compact);
    assert.equal(snapTermHeight(700), TERM_HEIGHT.tall);
  });
});

describe("path windows", () => {
  it("says 1Y is unavailable when the history is shorter than a year", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const nav = [0, 10, 20].map((d, i) => ({
      t: t0 + d * 86400,
      day: new Date((t0 + d * 86400) * 1000).toISOString().slice(0, 10),
      port: 100 + i,
      bench: 100,
      covered: 1,
      names: 1,
      wAvail: 1,
    }));
    const y = observeWindow(nav, 365, "1Y");
    assert.equal(y.status, "unavailable");
    assert.match(y.reason || "", /insufficient price history/);
    const w = observeWindow(nav, 7, "1W");
    assert.equal(w.status, "available");
    assert.ok(w.observed);
    assert.ok(w.target);
  });

  it("reports YTD and CAGR with the dates that were actually used", () => {
    const t0 = Date.UTC(2025, 0, 2) / 1000;
    const nav = [0, 20, 40].map((d, i) => ({
      t: t0 + d * 86400,
      day: new Date((t0 + d * 86400) * 1000).toISOString().slice(0, 10),
      port: 100 + i * 10,
      bench: 100,
      covered: 1,
      names: 1,
      wAvail: 1,
    }));
    const ytd = observeYtd(nav);
    assert.equal(ytd.status, "available");
    assert.equal(ytd.target, "2025-01-01");
    assert.equal(ytd.observed, "2025-01-02");
    const cagr = observeCagr(nav);
    assert.equal(cagr.status, "unavailable");
    assert.match(cagr.reason || "", /shorter than about two months/);
    assert.equal(cagr.target, "2025-01-02");
    assert.equal(cagr.observed, nav.at(-1)?.day);
  });
});
