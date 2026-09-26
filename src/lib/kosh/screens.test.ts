import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { skillPass, skillReadFrom, skillReadMerge, skillOf, rankMultibagger, candidateMultibagger, scoreMultibagger, SOUND_RULES, GROWTH_RULES, matchLabel, pickScreenRow, screenKey, screenRowFromQuote, mergeScreenRows, applyScreen, blankScreenRow, fillBlankScreenFund, type SkillRead } from "./screens.ts";

function read(p: Partial<SkillRead>): SkillRead {
  return {
    symbol: "X",
    name: "X",
    sector: "IT",
    fundTag: "Open question",
    fundRating: "fail",
    fundVerdict: "",
    qualTag: "Open story",
    qualPotential: "no",
    qualVerdict: "",
    at: 1,
    ...p,
  };
}

describe("skillPass", () => {
  it("missing read does not pass", () => {
    assert.equal(skillPass(null).both, false);
    assert.equal(skillPass(undefined).fund, false);
  });

  it("PE-style fail is fail until the actual skill says pass", () => {
    const r = read({ fundRating: "fail", qualPotential: "yes" });
    assert.equal(skillPass(r).both, false);
    assert.equal(skillPass(r).qual, true);
  });

  it("pass both only when fund pass and multi-bagger yes", () => {
    const r = read({ fundRating: "pass", qualPotential: "yes" });
    assert.equal(skillPass(r).both, true);
  });

  it("fund pass alone is not enough", () => {
    const r = read({ fundRating: "pass", qualPotential: "no" });
    assert.equal(skillPass(r).both, false);
    assert.equal(skillPass(r).fund, true);
  });

  it("skillReadFrom copies the same pass/fail as the stock page blocks", () => {
    const r = skillReadFrom({
      symbol: "TCS.NS",
      name: "TCS",
      sector: "IT",
      fund: {
        tag: "Cash compounder",
        rating: "pass",
        snapshot: "",
        business: "",
        industry: "",
        position: "",
        profitability: "",
        balanceSheet: "",
        valuation: "",
        growth: "",
        risks: [],
        changeMind: [],
        verdict: "Sound",
        prose: "",
      },
      qual: {
        tag: "Quiet compounder",
        potential: "yes",
        potentialLabel: "High",
        headline: "",
        allFactors: [],
        positive: [],
        combinations: [],
        catalysts: [],
        pricedIn: "",
        noise: "",
        verdict: "Yes from here",
        prose: "",
      },
    });
    assert.equal(r.symbol, "TCS");
    assert.equal(skillPass(r).both, true);
  });
});

describe("rankMultibagger", () => {
  it("drops names when a required field is blank — missing is not a pass", () => {
    const row = {
      ...blankScreenRow("X"),
      name: "X",
      sector: "IT",
      price: 100,
      changePct: 0,
      high52: 120,
      low52: 80,
      offHigh: -5,
      ret1m: 2,
      ret3m: 4,
      ret1y: 20,
      vol: 1,
      volAvg: 1,
      volRatio: 1,
      rsi: 50,
      above50: true,
      above200: true,
      macdHist: 0,
      bbPos: 50,
      nr7: false,
      gapPct: 0,
      above21: true,
      pe: 20,
      pb: 4,
      roe: 22,
      de: 0.2,
      mcapCr: 40000,
      divYield: 1,
      eps: 10,
      book: 50,
      salesYoY: 12,
      profitYoY: 40,
      promoters: 55,
      roce: 24,
      peg: null,
      opm: 18,
      salesCagr3: 20,
      profitCagr3: 40,
      profitCagr5: 18,
    };
    const out = rankMultibagger([row], SOUND_RULES, "roe");
    assert.equal(out.length, 0);
  });

  it("keeps a name only when every check is present and passes", () => {
    const row = {
      ...blankScreenRow("Z"),
      price: 100,
      pe: 18,
      promoters: 55,
      de: 0.2,
      roce: 24,
      peg: 1.1,
      opm: 18,
      salesCagr3: 20,
      profitCagr3: 40,
      profitCagr5: 18,
      salesYoY: 12,
      roe: 22,
    };
    const out = rankMultibagger([row], SOUND_RULES, "roe");
    assert.equal(out.length, 1);
    assert.equal(out[0].unchecked?.length, 0);
  });

  it("drops names that fail the numbers we have", () => {
    const row = {
      ...blankScreenRow("Y"),
      name: "Y",
      sector: "IT",
      price: 10,
      changePct: 0,
      high52: 12,
      low52: 8,
      offHigh: -5,
      ret1m: 0,
      ret3m: 0,
      ret1y: 0,
      vol: 1,
      volAvg: 1,
      volRatio: 1,
      rsi: 50,
      above50: true,
      above200: true,
      macdHist: 0,
      bbPos: 50,
      nr7: false,
      gapPct: 0,
      above21: true,
      pe: 80,
      pb: 12,
      roe: 4,
      de: 3,
      mcapCr: 2000,
      divYield: 0,
      eps: 1,
      book: 2,
      salesYoY: 1,
      profitYoY: -20,
      promoters: 20,
      roce: 5,
      peg: 8,
      opm: 2,
      salesCagr3: 2,
      profitCagr3: 1,
      profitCagr5: 1,
    };
    const out = rankMultibagger([row], SOUND_RULES, "roe");
    assert.equal(out.length, 0);
  });
});

describe("multibagger candidate vs strict", () => {
  it("shows a candidate when enough checks pass and one field is blank — missing is not a pass", () => {
    const row = {
      ...blankScreenRow("CAND"),
      price: 100,
      promoters: 55,
      de: 0.2,
      roce: 24,
      peg: 1.1,
      opm: 18,
      salesCagr3: 20,
      profitCagr3: 40,
      profitCagr5: 18,
      salesYoY: 12,
      roe: 22,
    };
    assert.equal(rankMultibagger([row], SOUND_RULES, "roe").length, 1);
    const missPeg = { ...row, peg: null };
    assert.equal(rankMultibagger([missPeg], SOUND_RULES, "roe").length, 0);
    const cand = candidateMultibagger([missPeg], SOUND_RULES, "roe");
    assert.equal(cand.length, 1);
    assert.equal(cand[0].matchKind, "candidate");
    assert.ok((cand[0].unchecked || []).some((x) => /PEG/i.test(x)));
    assert.equal(matchLabel(cand[0]), "8/9 passed · 1 unavailable");
  });

  it("fails a name that misses a required number we do have — not a candidate", () => {
    const row = {
      ...blankScreenRow("FAIL"),
      price: 10,
      promoters: 20,
      de: 3,
      roce: 5,
      peg: 8,
      opm: 2,
      salesCagr3: 2,
      profitCagr3: 1,
      profitCagr5: 1,
      salesYoY: 1,
      roe: 4,
    };
    const scored = scoreMultibagger([row], SOUND_RULES);
    assert.equal(scored[0].kind, "fail");
    assert.equal(candidateMultibagger([row], SOUND_RULES, "roe").length, 0);
  });

  it("marks unknown when almost every field is blank", () => {
    const row = { ...blankScreenRow("UNK"), price: 12 };
    const scored = scoreMultibagger([row], SOUND_RULES);
    assert.equal(scored[0].kind, "unknown");
    assert.equal(candidateMultibagger([row], SOUND_RULES, "roe").length, 0);
  });

  it("emerging compounder is strict on GROWTH_RULES", () => {
    const pass = {
      ...blankScreenRow("G"),
      price: 50,
      roe: 18,
      salesYoY: 14,
      de: 0.4,
      profitYoY: 20,
    };
    const miss = { ...pass, de: null };
    assert.equal(rankMultibagger([pass], GROWTH_RULES, "roe").length, 1);
    assert.equal(rankMultibagger([miss], GROWTH_RULES, "roe").length, 0);
    assert.equal(candidateMultibagger([miss], GROWTH_RULES, "roe").length, 1);
  });
});

describe("screen rows hydrate", () => {
  it("matches RELIANCE.NS to a RELIANCE row and ignores zero-price stubs", () => {
    const rows = [
      screenRowFromQuote({ symbol: "RELIANCE", name: "Reliance", price: 1400, changePct: 1.2, high52: 1600, low52: 1100 }),
      { ...screenRowFromQuote({ symbol: "ITC", name: "ITC", price: 0, changePct: 0 }), price: 0 },
    ];
    assert.equal(screenKey("reliance.ns"), "RELIANCE");
    assert.equal(pickScreenRow(rows, "RELIANCE.NS")?.price, 1400);
    assert.equal(pickScreenRow(rows, "ITC"), undefined);
  });

  it("fills a missing watch name from a quote without dropping priced universe rows", () => {
    const universe = [screenRowFromQuote({ symbol: "TCS", name: "TCS", price: 4000, changePct: 0.4 })];
    const extra = [screenRowFromQuote({ symbol: "KAYNES.NS", name: "Kaynes", price: 5200, changePct: -1.1, high52: 6000 })];
    const merged = mergeScreenRows(universe, extra);
    assert.equal(merged.length, 2);
    assert.equal(pickScreenRow(merged, "kaynes")?.name, "Kaynes");
    assert.ok((pickScreenRow(merged, "KAYNES")?.offHigh ?? 0) < 0);
  });

  it("fills blank ROCE and OPM from a company card and never replaces a number with a blank", () => {
    const row = blankScreenRow("INFY", "Infosys");
    const filled = fillBlankScreenFund(row, { roce: 28, opm: 24, pe: 22 });
    assert.equal(filled.roce, 28);
    assert.equal(filled.opm, 24);
    assert.equal(filled.pe, 22);
    const kept = fillBlankScreenFund({ ...filled, pe: 19 }, { pe: null, roce: null, opm: 30 });
    assert.equal(kept.pe, 19);
    assert.equal(kept.roce, 28);
    assert.equal(kept.opm, 24);
  });
});

describe("skillReadMerge", () => {
  it("keeps one side until the other arrives — skillOf waits for both tags", () => {
    const fundOnly = skillReadMerge(undefined, {
      symbol: "INFY.NS",
      name: "Infosys",
      sector: "IT",
      fund: {
        tag: "Cash compounder",
        rating: "pass",
        snapshot: "",
        business: "",
        industry: "",
        position: "",
        profitability: "",
        balanceSheet: "",
        valuation: "",
        growth: "",
        risks: [],
        changeMind: [],
        verdict: "Sound",
        prose: "",
      },
    });
    assert.equal(fundOnly.fundTag, "Cash compounder");
    assert.equal(fundOnly.qualTag, "");
    assert.equal(skillOf({ INFY: fundOnly }, "INFY"), undefined);
    const both = skillReadMerge(fundOnly, {
      symbol: "INFY",
      qual: {
        tag: "Quiet compounder",
        potential: "yes",
        potentialLabel: "High",
        headline: "",
        allFactors: [],
        positive: [],
        combinations: [],
        catalysts: [],
        pricedIn: "",
        noise: "",
        verdict: "Yes",
        prose: "",
      },
    });
    assert.ok(skillOf({ INFY: both }, "INFY"));
    assert.equal(skillOf({ INFY: both }, "INFY")?.qualTag, "Quiet compounder");
  });
});

describe("universe and missing-data screens", () => {
  it("All listed keeps unpriced names; other screens drop them", () => {
    const priced = { ...blankScreenRow("TCS"), price: 4000, mcapCr: 100000 };
    const unpriced = { ...blankScreenRow("ILLIQUID"), price: 0, depth: "name" as const };
    const all = applyScreen([priced, unpriced], "all");
    assert.equal(all.length, 2);
    assert.ok(all.some((r) => r.symbol === "ILLIQUID"));
    assert.equal(applyScreen([priced, unpriced], "up").length, 1);
  });

  it("merge prefers a full-history row over a quote-only print", () => {
    const quote = { ...blankScreenRow("TCS"), price: 10, depth: "quote" as const, pe: 20 };
    const full = { ...blankScreenRow("TCS"), price: 11, depth: "full" as const, pe: 18, rsi: 55 };
    const merged = mergeScreenRows([quote], [full]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].depth, "full");
    assert.equal(merged[0].rsi, 55);
  });
});

describe("applyScreen stake and vcp", () => {
  it("stake keeps FII or DII rise and sorts FII Δ desc", () => {
    const up = { ...blankScreenRow("A"), price: 10, fiiDelta: 0.4, diiDelta: -0.1 };
    const diiUp = { ...blankScreenRow("B"), price: 10, fiiDelta: -0.2, diiDelta: 0.3 };
    const none = { ...blankScreenRow("C"), price: 10, fiiDelta: null, diiDelta: null };
    const bothDown = { ...blankScreenRow("D"), price: 10, fiiDelta: -0.1, diiDelta: -0.2 };
    const out = applyScreen([up, diiUp, none, bothDown], "stake");
    assert.deepEqual(out.map((r) => r.symbol), ["A", "B"]);
  });

  it("vcp keeps forming names; breakout+VCP keeps the pivot break", () => {
    const forming = { ...blankScreenRow("F"), price: 10, vcp: true, vcpBreak: false, vcpLastPct: 6 };
    const brk = { ...blankScreenRow("K"), price: 10, vcp: true, vcpBreak: true, vcpDays: 3 };
    const no = { ...blankScreenRow("N"), price: 10, vcp: false, vcpBreak: false };
    assert.equal(applyScreen([forming, brk, no], "vcp")[0]?.symbol, "F");
    assert.equal(applyScreen([forming, brk, no], "vcpbo")[0]?.symbol, "K");
    assert.equal(applyScreen([forming, brk, no], "vcp").length, 1);
    assert.equal(applyScreen([forming, brk, no], "vcpbo").length, 1);
  });
});
