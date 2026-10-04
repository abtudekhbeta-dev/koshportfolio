/** SkillEngine — wrap fund/qual markdown, extract approved labels, validate, cache keys.
 *  Does not rewrite skill-docs. Parser + contract only. */

export const FUND_SKILL_ID = "2ce5b3ca20a078a93f616258e9abb21a";
export const QUAL_SKILL_ID = "5c920931dd356a8f67ecfd21271fc017";

export const SKILL_ENGINE_VERSION = "2";
export const SKILL_PROVIDER = "xai";
export const SKILL_MODEL = "grok-4.5";
export const SKILL_SOURCE_METHOD = "search1";
export const SKILL_CACHE_PREFIX = "v23";

export const FUND_VERDICTS = [
  "High-Conviction Multi-Bagger Candidate",
  "Quality Compounder",
  "Speculative Multi-Bagger",
  "Fair Value Compounder",
  "Limited Asymmetry",
  "Avoid",
] as const;

export const QUAL_POTENTIAL = [
  "High Potential Multi-bagger",
  "Moderate to High Potential",
  "Moderate Potential",
  "Low / Speculative Potential",
  "Not Attractive on Qualitative Factors",
] as const;

export const QUAL_FINANCIAL = ["Financially Strong", "Acceptable", "Mixed", "Weak"] as const;

export const QUAL_FACTORS = [
  "Capacity & Expansion",
  "Product / Business Mix",
  "Order Book & Demand Visibility",
  "Structural / Thematic Tailwinds",
  "Management & Corporate Actions",
  "Operating Leverage & Inflection",
  "Market Positioning",
] as const;

export const QUAL_STYLES = ["Consistent Compounder", "Turnaround-Inflection", "Mixed"] as const;

export type FundVerdict = (typeof FUND_VERDICTS)[number];
export type QualPotential = (typeof QUAL_POTENTIAL)[number];
export type QualFinancial = (typeof QUAL_FINANCIAL)[number];
export type SkillStatus = "Not started" | "Running" | "Done" | "Invalid" | "Failed" | "Timed out" | "Rate limited";

export const SKILL_STATUSES: SkillStatus[] = [
  "Not started",
  "Running",
  "Done",
  "Invalid",
  "Failed",
  "Timed out",
  "Rate limited",
];

const FUND_PASS: ReadonlySet<string> = new Set([
  "High-Conviction Multi-Bagger Candidate",
  "Quality Compounder",
  "Fair Value Compounder",
]);

const QUAL_YES: ReadonlySet<string> = new Set(["High Potential Multi-bagger", "Moderate to High Potential"]);

const FUND_SECTIONS = [
  { id: "thesis", re: /thesis\s*\+?\s*key fundamentals/i },
  { id: "integrated", re: /integrated fundamental analysis/i },
  { id: "business", re: /business\s*\+?\s*compounding engine/i },
  { id: "changes", re: /what changes the story|changes the story\s*\+?\s*valuation/i },
  { id: "governance", re: /governance\s*\+?\s*risks/i },
  { id: "scorecard", re: /scorecard\s*\+?\s*final verdict|final verdict/i },
] as const;

const QUAL_SECTIONS = [
  { id: "snapshot", re: /financial snapshot/i },
  { id: "factors", re: /factor check/i },
  { id: "positive", re: /key positive factors/i },
  { id: "combos", re: /powerful combinations present/i },
  { id: "style", re: /style note/i },
  { id: "verdict", re: /\bverdict\b/i },
  { id: "rationale", re: /\brationale\b/i },
] as const;

export type SkillValidation = {
  ok: boolean;
  missing: string[];
  verdict: string;
  reason: string;
};

export type FundExtract = {
  approvedVerdict: string;
  score: number | null;
  stars: string;
  thesis: string;
  keyConstraint: string;
  finalCase: string;
  finalWeakness: string;
  changeMind: string;
};

export type QualExtract = {
  approvedVerdict: string;
  potentialLabel: string;
  financialClassification: string;
  factorStatuses: { name: string; status: string; note: string }[];
  style: string;
  rationale: string;
};

function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9/+ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lastIndexNorm(hay: string, needle: string) {
  const h = fold(hay);
  const n = fold(needle);
  if (!n) return -1;
  return h.lastIndexOf(n);
}

/** Pick the approved label that appears last in `text`. Prefer the scorecard/verdict slice. */
function lastApproved(text: string, labels: readonly string[], slice?: string): string {
  const body = slice && slice.length > 40 ? slice : text;
  let best = "";
  let bestAt = -1;
  for (const lab of labels) {
    const at = lastIndexNorm(body, lab);
    if (at > bestAt) {
      bestAt = at;
      best = lab;
    }
  }
  if (best) return best;
  if (slice && slice !== text) return lastApproved(text, labels);
  return "";
}

function scorecardSlice(text: string) {
  const m = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?(?:SCORECARD\s*\+?\s*FINAL VERDICT|Final verdict|Investment verdict)[\s\S]*$/i);
  return m ? m[0] : "";
}

function qualVerdictSlice(text: string) {
  const m = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?Verdict(?:\*{0,2})?\s*:?[\s\S]*?(?=\n(?:#{1,4}\s+|\*{0,2}Rationale)|\s*$)/i);
  if (m) return m[0];
  const tail = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?Rationale[\s\S]*$/i);
  const before = tail ? text.slice(0, text.length - tail[0].length) : text;
  const last = before.match(/(?:#{0,4}\s*)?(?:\*{0,2})?Verdict[\s\S]*$/i);
  return last ? last[0] : "";
}

const FUND_NEAR: [RegExp, FundVerdict][] = [
  [/high[-\s]?conviction(?:\s+multi[-\s]?bagger)?/i, "High-Conviction Multi-Bagger Candidate"],
  [/quality compounder/i, "Quality Compounder"],
  [/speculative multi[-\s]?bagger/i, "Speculative Multi-Bagger"],
  [/fair value compounder/i, "Fair Value Compounder"],
  [/limited asymmetry/i, "Limited Asymmetry"],
  [/(?:^|\n|\*| )\s*avoid\b/i, "Avoid"],
];

const QUAL_NEAR: [RegExp, QualPotential][] = [
  [/high potential multi[-\s]?bagger/i, "High Potential Multi-bagger"],
  [/moderate to high potential/i, "Moderate to High Potential"],
  [/low\s*\/\s*speculative potential|low or speculative|speculative potential/i, "Low / Speculative Potential"],
  [/not attractive on qualitative/i, "Not Attractive on Qualitative Factors"],
  [/moderate potential/i, "Moderate Potential"],
];

function nearMap(text: string, pairs: [RegExp, string][]): string {
  let best = "";
  let bestAt = -1;
  for (const [re, lab] of pairs) {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    const g = new RegExp(re.source, flags);
    let m: RegExpExecArray | null;
    while ((m = g.exec(text))) {
      if (m.index >= bestAt) {
        bestAt = m.index;
        best = lab;
      }
    }
  }
  return best;
}

export function extractFundVerdict(text: string): string {
  const slice = scorecardSlice(text);
  const exact = lastApproved(text, FUND_VERDICTS, slice);
  if (exact) return exact;
  const near = nearMap(slice || text, FUND_NEAR);
  return near;
}

export function extractQualPotential(text: string): string {
  const slice = qualVerdictSlice(text);
  const exact = lastApproved(text, QUAL_POTENTIAL, slice || undefined);
  if (exact) return exact;
  return nearMap(slice || text, QUAL_NEAR);
}

export function extractQualFinancial(text: string): string {
  const m = text.match(/financial snapshot[\s\S]{0,400}/i);
  const window = m ? m[0] : text.slice(0, 1200);
  const exact = lastApproved(window, QUAL_FINANCIAL);
  if (exact) return exact;
  if (/financially strong/i.test(window)) return "Financially Strong";
  if (/\bacceptable\b/i.test(window)) return "Acceptable";
  if (/\bmixed\b/i.test(window)) return "Mixed";
  if (/\bweak\b/i.test(window)) return "Weak";
  return "";
}

function headingChunk(text: string, names: string[]) {
  const alt = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const re = new RegExp(
    `(?:^|\\n)(?:#{1,4}\\s*|(?:\\*\\*|__)?)(?:\\d+\\)\\s*)?(?:${alt})(?:\\*\\*|__)?\\s*[:.\\-–]?\\s*\\n+([\\s\\S]*?)(?=\\n(?:#{1,4}\\s+|\\*\\*[A-Z]|###\\s*\\d))`,
    "i",
  );
  const m = text.match(re);
  if (m) return m[1].trim();
  const line = new RegExp(`(?:${alt})\\s*[:\\-–]\\s*([^\\n]+)`, "i");
  const l = text.match(line);
  return l ? l[1].trim() : "";
}

export function extractFundFields(text: string): FundExtract {
  const approvedVerdict = extractFundVerdict(text);
  const thesisBlock = headingChunk(text, ["THESIS + KEY FUNDAMENTALS", "Thesis + Key Fundamentals", "Thesis"]);
  const thesis = (thesisBlock || text)
    .split(/\n+/)
    .map((s) => s.replace(/^[\s*•-]+/, "").trim())
    .filter((s) => s && !/^#{1,4}\s/.test(s))
    .slice(0, 4)
    .join(" ")
    .slice(0, 600);
  const scoreM =
    text.match(/(?:weighted\s+)?score\s*[:*]+\s*(\d+(?:\.\d+)?)/i) ||
    text.match(/(\d(?:\.\d)?)\s*\/\s*10/) ||
    text.match(/\b(\d(?:\.\d)?)\/10\b/);
  const score = scoreM ? Number(scoreM[1]) : null;
  const starsM = text.match(/([★☆⭐]{1,5})/) || text.match(/(\d)\s*(?:\/\s*5)?\s*stars?/i);
  const stars = starsM ? starsM[1] : "";
  const keyConstraint =
    (text.match(/(?:biggest constraint|key constraint|the constraint)\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() || "";
  const finalCase =
    (text.match(/(?:the case)\s*[:\-–]\s*([^\n]+(?:\n(?![A-Z#*]).*)?)/i) || [])[1]?.trim() ||
    headingChunk(text, ["The case"]);
  const finalWeakness =
    (text.match(/(?:the weakness)\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() || headingChunk(text, ["The weakness"]);
  const changeMind =
    headingChunk(text, ["What would change my view", "What would change this read", "What would change this"]) ||
    (text.match(/(?:what would change (?:my view|this read|this))\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() ||
    "";
  return {
    approvedVerdict,
    score: score != null && Number.isFinite(score) ? score : null,
    stars,
    thesis: thesis.slice(0, 600),
    keyConstraint: keyConstraint.slice(0, 280),
    finalCase: String(finalCase || "").slice(0, 400),
    finalWeakness: String(finalWeakness || "").slice(0, 400),
    changeMind: String(changeMind || "").slice(0, 400),
  };
}

export function extractQualFields(text: string): QualExtract {
  const potentialLabel = extractQualPotential(text);
  const financialClassification = extractQualFinancial(text);
  const factorStatuses = QUAL_FACTORS.map((name) => {
    const re = new RegExp(
      `\\*{0,2}\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\*{0,2}\\s*[:\\-–]\\s*\\*{0,2}\\s*(Strong|Moderate|Weak|Not Present)\\b\\s*(?:[\\-–—:]\\s*)?([^\\n]*)`,
      "i",
    );
    const m = text.match(re);
    let status = "";
    if (m) {
      const raw = m[1].toLowerCase();
      status = raw === "not present" ? "Not Present" : raw.slice(0, 1).toUpperCase() + raw.slice(1);
    }
    return {
      name,
      status,
      note: m ? m[2].trim() : "",
    };
  });
  const styleM = text.match(/style note\s*[:\-–*]+\s*([^\n]+)/i);
  let style = "";
  const styleBlob = styleM ? styleM[1] : text;
  for (const s of QUAL_STYLES) {
    if (new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(styleBlob)) {
      style = s;
      break;
    }
  }
  const rationale =
    headingChunk(text, ["Rationale"]).slice(0, 800) ||
    (text.match(/\*{0,2}Rationale\*{0,2}\s*[:\-–]?\s*\n+([\s\S]+)/i) || [])[1]?.trim().slice(0, 800) ||
    "";
  return {
    approvedVerdict: potentialLabel,
    potentialLabel,
    financialClassification,
    factorStatuses,
    style,
    rationale,
  };
}

function isStub(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return true;
  if (/^(researching|looking up|searching|i am researching|let me research)\b/i.test(compact)) return true;
  if (/\bfor the catalyst framework\.?\s*$/i.test(compact) && compact.length < 900) return true;
  return false;
}

export function validateFund(text: string): SkillValidation {
  const t = String(text || "").trim();
  const missing: string[] = [];
  if (!t || t.replace(/\s+/g, " ").length < 400) missing.push("length");
  if (isStub(t)) missing.push("stub");
  for (const s of FUND_SECTIONS) {
    if (!s.re.test(t)) missing.push(s.id);
  }
  const verdict = extractFundVerdict(t);
  if (!verdict) missing.push("verdict");
  const lines = t.split(/\n/).filter((x) => x.trim()).length;
  if (lines < 6) missing.push("lines");
  const ok = missing.length === 0;
  return {
    ok,
    missing,
    verdict,
    reason: ok ? "" : missing.includes("verdict") ? "No approved final verdict" : `Missing ${missing.join(", ")}`,
  };
}

export function validateQual(text: string): SkillValidation {
  const t = String(text || "").trim();
  const missing: string[] = [];
  if (!t || t.replace(/\s+/g, " ").length < 400) missing.push("length");
  if (isStub(t)) missing.push("stub");
  for (const s of QUAL_SECTIONS) {
    if (!s.re.test(t)) missing.push(s.id);
  }
  const verdict = extractQualPotential(t);
  if (!verdict) missing.push("verdict");
  const fin = extractQualFinancial(t);
  if (!fin) missing.push("financial");
  const lines = t.split(/\n/).filter((x) => x.trim()).length;
  if (lines < 6) missing.push("lines");
  const ok = missing.length === 0;
  return {
    ok,
    missing,
    verdict,
    reason: ok ? "" : missing.includes("verdict") ? "No approved qualitative verdict" : `Missing ${missing.join(", ")}`,
  };
}

export function fundRatingOf(verdict: string): "pass" | "fail" {
  return FUND_PASS.has(verdict) ? "pass" : "fail";
}

export function qualPotentialOf(label: string): "yes" | "no" {
  return QUAL_YES.has(label) ? "yes" : "no";
}

export function isTerminalStatus(s: string | undefined) {
  return s === "Failed" || s === "Invalid" || s === "Timed out" || s === "Rate limited" || s === "Done";
}

export function classifySkillError(msg: string): SkillStatus {
  const m = String(msg || "");
  if (/429|Busy right now|Too many reads|rate.?limit/i.test(m)) return "Rate limited";
  if (/timeout|abort|504|Gateway|took too long/i.test(m)) return "Timed out";
  if (/did not finish|malformed|invalid|no approved/i.test(m)) return "Invalid";
  return "Failed";
}

export function skillCacheKey(input: {
  kind: string;
  symbol?: string;
  date: string;
  extra?: string;
}) {
  const kind = input.kind;
  if (kind === "fund") {
    return `${SKILL_CACHE_PREFIX}:fund:${FUND_SKILL_ID}:${SKILL_ENGINE_VERSION}:${SKILL_PROVIDER}:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${String(input.symbol || "").toUpperCase()}:${input.date}`;
  }
  if (kind === "qual") {
    return `${SKILL_CACHE_PREFIX}:qual:${QUAL_SKILL_ID}:${SKILL_ENGINE_VERSION}:${SKILL_PROVIDER}:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${String(input.symbol || "").toUpperCase()}:${input.date}`;
  }
  if (kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") {
    return `${SKILL_CACHE_PREFIX}:${kind}:${SKILL_ENGINE_VERSION}:${SKILL_PROVIDER}:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${input.extra || input.symbol || ""}:${input.date}`;
  }
  return `${SKILL_CACHE_PREFIX}:${kind}:${input.extra || input.symbol || ""}:${input.date}`;
}

export function correctivePrompt(kind: "fund" | "qual", missing: string[]) {
  const need =
    kind === "fund"
      ? "THESIS + KEY FUNDAMENTALS; INTEGRATED FUNDAMENTAL ANALYSIS; BUSINESS + COMPOUNDING ENGINE; WHAT CHANGES THE STORY + VALUATION; GOVERNANCE + RISKS; SCORECARD + FINAL VERDICT. Final verdict must be exactly one of: High-Conviction Multi-Bagger Candidate / Quality Compounder / Speculative Multi-Bagger / Fair Value Compounder / Limited Asymmetry / Avoid."
      : "Financial Snapshot (with Financially Strong / Acceptable / Mixed / Weak); Factor Check (all seven factors); Key Positive Factors; Powerful Combinations Present; Style Note; Verdict (exactly one approved qualitative label); Rationale.";
  const miss = missing.length ? ` Missing from the last reply: ${missing.join(", ")}.` : "";
  return `Write the COMPLETE analysis now. Do not describe research. Do not write a one-line status. Include every required heading and a Final verdict. ${need}${miss}`;
}
