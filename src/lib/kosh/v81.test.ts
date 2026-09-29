import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { researchPayload } from "./api.ts";
import { commitFund, pathIdentityAsk, researchPlan, blankFund, applyResearchToFund } from "./complete.ts";
import { displayedFields } from "./screen-contract.ts";
import { evidenceFitsMetric, validateResearch } from "./research-validate.ts";
import { sanitizeHoldings } from "./parse.ts";
import { storedSymbol } from "./sectors.ts";
import { isSkippedSymbol, resolveSymbol } from "./symbol-map.ts";
import { emptyCloud, mergeCloud } from "./cloud-state.ts";
import { observeWindow } from "./engine.ts";
import type { ResearchItem } from "./research-validate.ts";

function item(partial: Partial<ResearchItem> & Pick<ResearchItem, "metric" | "status">): ResearchItem {
  return {
    value: null,
    unit: "",
    period: "FY25",
    sourceName: "Annual report",
    sourceUrl: "https://example.com/ar",
    evidence: "Interest coverage is 8.2 times",
    methodology: "Operating profit / finance cost",
    inputs: [],
    ...partial,
  };
}

describe("v8.1 completion contract", () => {
  it("sends every requested label, not the first eight", () => {
    const missing = Array.from({ length: 12 }, (_, i) => `Metric ${i}`);
    const body = researchPayload("HDFCBANK", missing);
    assert.equal(body.research.missing.length, 12);
    assert.deepEqual(body.research.missing, missing);
  });

  it("builds the contract from the screen, including market columns", () => {
    const fields = displayedFields("all", { peg: true, interestCover: true, rsi: true });
    for (const key of ["pe", "roce", "peg", "interestCover", "ret3m", "ret1y", "offHigh", "rsi", "volRatio"]) {
      assert.equal(fields.some((f) => f.key === key), true, key);
    }
    assert.equal(fields.find((f) => f.key === "rsi")?.kind, "market");
    const vcp = displayedFields("vcp", {});
    assert.equal(vcp.some((f) => f.key === "vcpN" && f.kind === "market"), true);
    const stake = displayedFields("stake", {});
    assert.equal(stake.find((f) => f.key === "fiiDelta")?.kind, "market");
    assert.equal(stake.find((f) => f.key === "diiDelta")?.kind, "market");
  });

  it("does not ask AI for a stake change or a price-derived return", () => {
    const plan = researchPlan(blankFund("HDFCBANK"), ["FII change", "DII change", "ROE", "3M", "RSI 14"]);
    assert.equal(plan.ask.includes("FII change"), false);
    assert.equal(plan.ask.includes("DII change"), false);
    assert.equal(plan.local.includes("FII change"), true);
    assert.equal(plan.ask.includes("ROE"), true);
    assert.equal(plan.ask.includes("3M"), false);
    assert.equal(plan.ask.includes("RSI 14"), false);
  });

  it("rejects Financial Charges Coverage as Interest coverage and keeps a real interest coverage", () => {
    assert.equal(evidenceFitsMetric("Interest coverage", "Financial Charges Coverage Ratio 1.68"), false);
    assert.equal(evidenceFitsMetric("Interest coverage", "Interest coverage ratio 8.2 times"), true);
    const rejected = validateResearch(
      {
        items: [
          item({
            metric: "Interest coverage",
            status: "researched",
            value: 1.68,
            evidence: "Financial Charges Coverage Ratio stood at 1.68",
            methodology: "Financial Charges Coverage Ratio",
            sourceName: "Goodreturns",
          }),
        ],
      },
      ["Interest coverage"],
    );
    assert.equal(rejected.ok, true);
    if (!rejected.ok) return;
    assert.equal(rejected.items[0].status, "not_found");
    assert.equal(rejected.items[0].value, null);
    assert.match(rejected.items[0].evidence, /different ratio/);

    const kept = validateResearch(
      {
        items: [
          item({
            metric: "Interest coverage",
            status: "researched",
            value: 8.2,
            evidence: "Interest coverage ratio 8.2 times",
          }),
        ],
      },
      ["Interest coverage"],
    );
    assert.equal(kept.ok, true);
    if (!kept.ok) return;
    assert.equal(kept.items[0].status, "researched");
    assert.equal(kept.items[0].value, 8.2);
  });

  it("writes a researched blank into the company cache without marking it verified", () => {
    const cached = blankFund("HDFCBANK");
    cached.pe = 18;
    const incoming = applyResearchToFund(blankFund("HDFCBANK"), [
      item({ metric: "ROE", status: "researched", value: 14.2, unit: "%", evidence: "Return on equity 14.2 percent" }),
    ]);
    const saved = commitFund(cached, incoming, "HDFCBANK");
    assert.equal(saved.pe, 18);
    assert.equal(saved.roe, 14.2);
    assert.equal(saved.provenance?.fields.roe?.status, "researched");
    assert.equal(saved.provenance?.fields.roe?.rank, "ai-researched");
  });
});

describe("v8.1 symbol mapping", () => {
  it("never rewrites a canonical GMRP&UI ticker", () => {
    assert.equal(storedSymbol("GMRP&UI"), "GMRP&UI");
    assert.equal(storedSymbol("nse:gmrp&ui.NS"), "GMRP&UI");
    const rows = sanitizeHoldings([{ symbol: "GMRP&UI", name: "GMR Power", qty: 10, avg: 40, date: null }]);
    assert.equal(rows[0]?.symbol, "GMRP&UI");
  });

  it("applies a saved alias on the next import and remembers a skip", () => {
    const book = { aliases: { GMRP_UI: "GMRP&UI" }, skips: ["SKIPME"] };
    assert.equal(resolveSymbol("GMRP_UI", book), "GMRP&UI");
    assert.equal(resolveSymbol("GMRP&UI", book), "GMRP&UI");
    const rows = sanitizeHoldings([{ symbol: "GMRP_UI", name: "GMR", qty: 2, avg: 10, date: null }], book);
    assert.equal(rows[0]?.symbol, "GMRP&UI");
    assert.equal(isSkippedSymbol("SKIPME", book), true);
    assert.equal(isSkippedSymbol("NEWNAME", book), false);
  });
});

describe("v8.1 cloud quantity", () => {
  it("does not let an older local quantity replace a newer holding", () => {
    const remote = emptyCloud();
    remote.portfolios = [{
      id: "p1",
      name: "Main",
      bench: "nifty",
      updatedAt: 200,
      holdings: [{ symbol: "TCS", name: "TCS", qty: 5, avg: 10, date: "2020-01-01", updatedAt: 200 }],
      trades: [],
    }];
    const local = emptyCloud();
    local.portfolios = [{
      id: "p1",
      name: "Main",
      bench: "nifty",
      updatedAt: 100,
      holdings: [{ symbol: "TCS", name: "TCS", qty: 1, avg: 10, date: "2020-01-01", updatedAt: 100 }],
      trades: [],
    }];
    const stale = mergeCloud(local, remote);
    assert.equal(stale.doc.portfolios[0]?.holdings[0]?.qty, 5);
    local.portfolios[0].updatedAt = 300;
    local.portfolios[0].holdings[0].updatedAt = 300;
    local.portfolios[0].holdings[0].qty = 9;
    const fresh = mergeCloud(local, remote);
    assert.equal(fresh.doc.portfolios[0]?.holdings[0]?.qty, 9);
  });

  it("keeps a confirmed alias from either device", () => {
    const remote = emptyCloud();
    remote.symbolAliases = { GMRP_UI: "GMRP&UI" };
    const local = emptyCloud();
    local.symbolAliases = { OLD: "NEW" };
    const merged = mergeCloud(local, remote);
    assert.equal(merged.doc.symbolAliases.GMRP_UI, "GMRP&UI");
    assert.equal(merged.doc.symbolAliases.OLD, "NEW");
  });
});

describe("v8.1 path windows", () => {
  it("stores source and calculation, and never asks AI for a price", () => {
    const t0 = Date.UTC(2024, 0, 2) / 1000;
    const nav = [0, 40].map((d, i) => ({
      t: t0 + d * 86400,
      day: new Date((t0 + d * 86400) * 1000).toISOString().slice(0, 10),
      port: 100 + i * 10,
      bench: 100,
      covered: 1,
      names: 1,
      wAvail: 1,
    }));
    const w = observeWindow(nav, 31, "1M");
    assert.equal(w.status, "available");
    assert.equal(w.source, "Adjusted close history");
    assert.match(w.calculation || "", /Last trading session/);
    assert.ok(w.target);
    assert.ok(w.observed);
    const ask = pathIdentityAsk("GMRP_UI");
    assert.match(ask, /listed NSE or BSE symbol/);
    assert.doesNotMatch(ask, /price|return|cagr/i);
  });
});
