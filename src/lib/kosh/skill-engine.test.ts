import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractFundVerdict,
  extractQualPotential,
  extractQualFinancial,
  extractFundFields,
  extractQualFields,
  validateFund,
  validateQual,
  skillCacheKey,
  fundRatingOf,
  qualPotentialOf,
  SKILL_CACHE_PREFIX,
  SKILL_ENGINE_VERSION,
  classifySkillError,
} from "./skill-engine.ts";

const FUND_OK = `
### 1) THESIS + KEY FUNDAMENTALS

Reliance compounds through energy, retail and digital. Score: 6.4. Stars: ★★★☆☆
Biggest constraint: refining and petrochem cycle still swings cash.

### 2) INTEGRATED FUNDAMENTAL ANALYSIS

🟢 Growth Quality — Strong. Retail and Jio still add customers.
🟡 Cash Quality — Mixed. Capex remains heavy versus free cash.
Key Numbers → Collective Read → Implication for the next five years.

### 3) BUSINESS + COMPOUNDING ENGINE

Driver | Financial Evidence | Durability/Runway | Implication
Retail | SSS growth on file | Multi-year | Mix shift toward consumer cash

### 4) WHAT CHANGES THE STORY + VALUATION

Catalyst | Timing | Earnings/Economic Impact | Confidence
New energy | 12–36M | Optionality | Medium
Market is pricing: a quality conglomerate, not a high-conviction multi-bagger.
What must go right: retail margins and cleaner energy cash.

### 5) GOVERNANCE + RISKS

Governance state: Watch
Risk | Likelihood | Thesis Impact | Monitor
Cycle | Medium | Cash | Quarterly EBIT

### 6) SCORECARD + FINAL VERDICT

Weighted score 6.4 / 10.

Quality Compounder

The case: a wide consumer and digital franchise with real cash engines.
The weakness: energy still dominates capital.
What would change my view: a clean, lasting step-up in return on capital without more leverage.
`;

const QUAL_OK = `
**Stock: Demo Co**

**Financial Snapshot:**
**Financially Strong**
- ROCE above the 20% mark on the latest filing
- Debt / Equity below 0.5

**Factor Check:**
- **Capacity & Expansion:** Strong — new plant commissioned
- **Product / Business Mix:** Moderate — mix still commodity-heavy
- **Order Book & Demand Visibility:** Strong — two-year book
- **Structural / Thematic Tailwinds:** Moderate — grid spend
- **Management & Corporate Actions:** Strong — promoter buying
- **Operating Leverage & Inflection:** Moderate — utilisation climbing
- **Market Positioning:** Moderate — #3 in the niche

**Key Positive Factors:**
Capacity, order book, management.

**Powerful Combinations Present:**
Yes. New Capacity + Clear Numerical Guidance.

**Style Note:**
Turnaround-Inflection

**Verdict:**
Moderate to High Potential

**Rationale:**
Financials support the thesis. Capacity and order book can lift earnings over 2–5 years if utilisation holds. Execution is the watch item. Not a prediction.
`;

describe("extractFundVerdict", () => {
  it("reads the approved label from SCORECARD + FINAL VERDICT, not the first paragraph", () => {
    const v = extractFundVerdict(FUND_OK);
    assert.equal(v, "Quality Compounder");
  });

  it("does not treat the first heading as the verdict", () => {
    const text = `High growth story in retail.\n\n### 1) THESIS + KEY FUNDAMENTALS\nA long thesis.\n\n### 6) SCORECARD + FINAL VERDICT\nAvoid\nThe case: none.`;
    assert.equal(extractFundVerdict(text), "Avoid");
  });

  it("maps a near-match only through the explicit table", () => {
    const text = `### 6) SCORECARD + FINAL VERDICT\nHigh conviction multi bagger from here.\n`;
    assert.equal(extractFundVerdict(text), "High-Conviction Multi-Bagger Candidate");
  });
});

describe("extractQual", () => {
  it("reads potential from Verdict and financial class from Snapshot", () => {
    assert.equal(extractQualPotential(QUAL_OK), "Moderate to High Potential");
    assert.equal(extractQualFinancial(QUAL_OK), "Financially Strong");
  });

  it("does not confuse financial class with potential", () => {
    assert.notEqual(extractQualPotential(QUAL_OK), extractQualFinancial(QUAL_OK));
  });
});

describe("validateFund / validateQual", () => {
  it("accepts a six-block fund write-up with an approved verdict", () => {
    const v = validateFund(FUND_OK);
    assert.equal(v.ok, true);
    assert.equal(v.verdict, "Quality Compounder");
  });

  it("rejects a first-paragraph stub", () => {
    const v = validateFund("Researching the company from primary filings now.");
    assert.equal(v.ok, false);
  });

  it("rejects a long essay with no approved verdict and no sections", () => {
    const v = validateFund(
      "This is a large Indian company with many segments. ".repeat(40) + "It looks fine from here.",
    );
    assert.equal(v.ok, false);
    assert.ok(v.missing.includes("verdict") || v.missing.includes("thesis"));
  });

  it("accepts a seven-section qualitative write-up", () => {
    const v = validateQual(QUAL_OK);
    assert.equal(v.ok, true);
    assert.equal(v.verdict, "Moderate to High Potential");
  });

  it("rejects qualitative output missing Verdict", () => {
    const v = validateQual(QUAL_OK.replace("**Verdict:**", "**Notes:**").replace("Moderate to High Potential", "looks ok"));
    assert.equal(v.ok, false);
  });
});

describe("extractFundFields", () => {
  it("pulls score, thesis, constraint, case, weakness, change-mind", () => {
    const f = extractFundFields(FUND_OK);
    assert.equal(f.approvedVerdict, "Quality Compounder");
    assert.equal(f.score, 6.4);
    assert.ok(/retail|digital|energy/i.test(f.thesis));
    assert.ok(/cycle/i.test(f.keyConstraint));
    assert.ok(f.finalCase.length > 10);
    assert.ok(f.changeMind.length > 8);
  });
});

describe("extractQualFields", () => {
  it("pulls factor statuses and style", () => {
    const q = extractQualFields(QUAL_OK);
    assert.equal(q.style, "Turnaround-Inflection");
    assert.equal(q.factorStatuses.length, 7);
    assert.equal(q.factorStatuses[0].status.toLowerCase(), "strong");
    assert.ok(q.rationale.length > 20 || /utilisation|capacity|order/i.test(q.rationale + q.factorStatuses.map((f) => f.note).join(" ")));
  });
});

describe("skillCacheKey", () => {
  it("includes engine version, provider, model, source methodology, symbol, date", () => {
    const k = skillCacheKey({ kind: "fund", symbol: "RELIANCE", date: "2026-09-20" });
    assert.ok(k.startsWith(SKILL_CACHE_PREFIX + ":fund:"));
    assert.ok(k.includes(SKILL_ENGINE_VERSION));
    assert.ok(k.includes("xai"));
    assert.ok(k.includes("grok-4.5"));
    assert.ok(k.includes("search1"));
    assert.ok(k.includes("RELIANCE"));
    assert.ok(k.includes("2026-09-20"));
  });

  it("changes when the engine version is part of the key", () => {
    const a = skillCacheKey({ kind: "qual", symbol: "TCS", date: "2026-09-20" });
    assert.ok(a.includes(SKILL_ENGINE_VERSION));
    assert.notEqual(a, skillCacheKey({ kind: "fund", symbol: "TCS", date: "2026-09-20" }));
  });
});

describe("rating helpers", () => {
  it("pass/fail from approved labels, not first-paragraph tags", () => {
    assert.equal(fundRatingOf("Quality Compounder"), "pass");
    assert.equal(fundRatingOf("Fair Value Compounder"), "pass");
    assert.equal(fundRatingOf("High-Conviction Multi-Bagger Candidate"), "pass");
    assert.equal(fundRatingOf("Speculative Multi-Bagger"), "fail");
    assert.equal(fundRatingOf("Limited Asymmetry"), "fail");
    assert.equal(fundRatingOf("Avoid"), "fail");
    assert.equal(qualPotentialOf("High Potential Multi-bagger"), "yes");
    assert.equal(qualPotentialOf("Moderate to High Potential"), "yes");
    assert.equal(qualPotentialOf("Moderate Potential"), "no");
    assert.equal(qualPotentialOf("Not Attractive on Qualitative Factors"), "no");
  });
});

describe("classifySkillError", () => {
  it("maps transport errors to statuses", () => {
    assert.equal(classifySkillError("Busy right now. Wait a minute and retry."), "Rate limited");
    assert.equal(classifySkillError("The analysis took too long. Retry."), "Timed out");
    assert.equal(classifySkillError("The analysis did not finish. Retry."), "Invalid");
    assert.equal(classifySkillError("boom"), "Failed");
  });
});
