/** Structured Quality / Spark / Pulse / mix blocks. Client-safe. */

export type QualityBlock = {
  headline: string;
  business: string;
  industry: string;
  moat: string;
  price: string[];
  cycle: string;
  changeMind: string[];
  risks: string[];
};

export type SparkBlock = {
  headline: string;
  today: string;
  headlines: string[];
  catalysts: string[];
  pricedIn: string;
  noise: string;
};

export type PulseBlock = {
  headline: string;
  market: string;
  breadth: string;
  names: string[];
  headlines: string[];
  watch: string[];
};

export type MixBlock = {
  headline: string;
  mix: string;
  concentration: string[];
  largeWeights: string[];
  vsIndex: string;
  risks: string[];
};

export type HoldingBlock = {
  symbol: string;
  quality: QualityBlock | null;
  spark: SparkBlock | null;
  qualityText: string;
  sparkText: string;
};

export type FundBlock = {
  tag: string;
  rating: "pass" | "fail";
  snapshot: string;
  business: string;
  industry: string;
  position: string;
  profitability: string;
  balanceSheet: string;
  valuation: string;
  growth: string;
  risks: string[];
  changeMind: string[];
  verdict: string;
  prose: string;
};

export type QualFactor = {
  name: string;
  status: "positive" | "watch" | "negative" | "neutral";
  note: string;
};

export type QualBlock = {
  tag: string;
  potential: "yes" | "no";
  potentialLabel: string;
  headline: string;
  allFactors: QualFactor[];
  positive: string[];
  combinations: string[];
  catalysts: string[];
  pricedIn: string;
  noise: string;
  verdict: string;
  prose: string;
};

export type LevelRow = { price: number; note: string };
export type SwingRow = { label: string; price: number };

export type StructureBlock = {
  tag: string;
  bias: "up" | "down" | "range";
  setup: string;
  levels: string[];
  support: LevelRow[];
  resistance: LevelRow[];
  swings: SwingRow[];
  mtf: string[];
  invalidation: string;
  verdict: string;
};

function twoWords(raw: string) {
  const w = raw
    .replace(/\btape\b/gi, "session")
    .replace(/[.,/#!$%^&*;:{}=_`~()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  if (!w.length) return "";
  if (w.length <= 2) return w.map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
  return w.join(" ").slice(0, 48);
}

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function list(v: unknown, cap = 6): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter((x) => x.length >= 4).slice(0, cap);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function paras(text: string) {
  return text
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function stripTrailingJson(text: string) {
  const t = String(text || "").trim();
  if (!t) return "";
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  let body = t;
  if (fence) body = t.replace(fence[0], "").trim();
  const start = body.lastIndexOf("\n{");
  if (start > 80) {
    const maybe = body.slice(start + 1).trim();
    try {
      JSON.parse(maybe);
      return body.slice(0, start).trim();
    } catch {
      /* keep */
    }
  }
  if (body.startsWith("{")) {
    try {
      JSON.parse(body);
      return "";
    } catch {
      return body;
    }
  }
  return body;
}

function headingBlock(text: string, names: string[]) {
  const alt = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const re = new RegExp(
    `(?:^|\\n)(?:#{1,4}\\s*|(?:\\*\\*|__)?)(?:${alt})(?:\\*\\*|__)?\\s*[:.\\-–]?\\s*\\n+([\\s\\S]*?)(?=\\n(?:#{1,4}\\s+|\\*\\*[A-Z]))`,
    "i",
  );
  const m = text.match(re);
  if (m) return m[1].trim();
  const line = new RegExp(`(?:${alt})\\s*[:\\-–]\\s*([^\\n]+)`, "i");
  const l = text.match(line);
  return l ? l[1].trim() : "";
}

function potentialLabelOf(raw: string): string {
  const m = raw.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|none|unlikely|yes|no)/i);
  if (m) {
    const s = m[1].toLowerCase();
    if (s === "medium") return "Moderate";
    if (s === "yes") return "High";
    if (s === "no" || s === "none") return "Unlikely";
    return s.slice(0, 1).toUpperCase() + s.slice(1);
  }
  const m2 = raw.match(/\b(high|moderate|low|unlikely)\s+multi-?bagger/i);
  if (m2) return m2[1].slice(0, 1).toUpperCase() + m2[1].slice(1).toLowerCase();
  return "";
}

export function asQuality(v: unknown): QualityBlock | null {
  if (!v) return null;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return null;
    const bits = paras(t);
    return {
      headline: bits[0]?.slice(0, 180) || "Quality",
      business: bits.slice(0, 2).join(" "),
      industry: bits[2] || "",
      moat: bits[3] || "",
      price: bits.slice(4, 7),
      cycle: bits[7] || "",
      changeMind: bits.slice(8, 10),
      risks: bits.slice(-2),
    };
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const price = list(o.price).length ? list(o.price) : list(o.onPrice);
  const block: QualityBlock = {
    headline: str(o.headline).slice(0, 180),
    business: str(o.business),
    industry: str(o.industry),
    moat: str(o.moat) || str(o.position),
    price,
    cycle: str(o.cycle),
    changeMind: list(o.changeMind).length ? list(o.changeMind) : list(o.change_mind),
    risks: list(o.risks),
  };
  if (
    !block.headline &&
    !block.business &&
    !block.industry &&
    !block.moat &&
    !block.price.length &&
    !block.cycle &&
    !block.changeMind.length &&
    !block.risks.length
  )
    return null;
  return block;
}

export function asSpark(v: unknown): SparkBlock | null {
  if (!v) return null;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return null;
    const bits = paras(t);
    return {
      headline: bits[0]?.slice(0, 180) || "Spark",
      today: bits.slice(0, 2).join(" "),
      headlines: bits.slice(2, 5),
      catalysts: bits.slice(5, 8),
      pricedIn: bits[8] || "",
      noise: bits.at(-1) || "",
    };
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const block: SparkBlock = {
    headline: str(o.headline).slice(0, 180),
    today: str(o.today),
    headlines: list(o.headlines),
    catalysts: list(o.catalysts),
    pricedIn: str(o.pricedIn) || str(o.priced_in) || str(o.pricedin),
    noise: str(o.noise),
  };
  if (!block.headline && !block.today && !block.headlines.length && !block.catalysts.length && !block.pricedIn && !block.noise)
    return null;
  return block;
}

export function asPulse(v: unknown): PulseBlock | null {
  if (!v || typeof v !== "object") {
    if (typeof v === "string" && v.trim()) {
      const bits = paras(v);
      return {
        headline: bits[0]?.slice(0, 180) || "Pulse",
        market: bits[1] || bits[0] || "",
        breadth: bits[2] || "",
        names: bits.slice(3, 7),
        headlines: bits.slice(7, 10),
        watch: bits.slice(-3),
      };
    }
    return null;
  }
  const o = v as Record<string, unknown>;
  return {
    headline: str(o.headline).slice(0, 180),
    market: str(o.market),
    breadth: str(o.breadth),
    names: list(o.names, 8),
    headlines: list(o.headlines, 6),
    watch: list(o.watch, 5),
  };
}

export function asMix(v: unknown): MixBlock | null {
  if (!v || typeof v !== "object") {
    if (typeof v === "string" && v.trim()) {
      const bits = paras(v);
      return {
        headline: bits[0]?.slice(0, 180) || "This portfolio",
        mix: bits.slice(0, 2).join(" "),
        concentration: bits.slice(2, 5),
        largeWeights: bits.slice(5, 8),
        vsIndex: bits[8] || "",
        risks: bits.slice(-2),
      };
    }
    return null;
  }
  const o = v as Record<string, unknown>;
  return {
    headline: str(o.headline).slice(0, 180),
    mix: str(o.mix),
    concentration: list(o.concentration),
    largeWeights: list(o.largeWeights).length ? list(o.largeWeights) : list(o.large_weights),
    vsIndex: str(o.vsIndex) || str(o.vs_index),
    risks: list(o.risks),
  };
}

export function qualityText(b: QualityBlock) {
  return [
    b.headline,
    b.business,
    b.industry,
    b.moat,
    b.price.join(" "),
    b.cycle,
    b.changeMind.join(" "),
    b.risks.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export function sparkText(b: SparkBlock) {
  return [b.headline, b.today, b.headlines.join(" "), b.catalysts.join(" "), b.pricedIn, b.noise]
    .filter(Boolean)
    .join("\n");
}

function ratingOf(v: unknown): "pass" | "fail" {
  const s = str(v).toLowerCase();
  if (!s) return "fail";
  if (/(not sound|structurally weak|franchise is weak|failing|avoid this)/.test(s)) return "fail";
  if (/(sound|healthy|solid|compounder|constructive|durable|strong franchise|well-capital)/.test(s)) return "pass";
  if (/(^|\b)(pass|passed)\b/.test(s) && !/(fail|failing)/.test(s)) return "pass";
  return "fail";
}

function potentialOf(v: unknown, label?: string): "yes" | "no" {
  const lab = (label || "").toLowerCase();
  if (lab === "high" || lab === "moderate") return "yes";
  if (lab === "low" || lab === "unlikely") return "no";
  const s = str(v).toLowerCase();
  if (!s) return "no";
  if (s === "yes" || s === "pass" || s === "high" || s === "moderate") return "yes";
  if (/(multi-?bagger potential\s*[:\-–]\s*(high|moderate))/.test(s)) return "yes";
  if (/(multi-?bagger)/.test(s) && !/(no |not |fail|fading|unlikely|low potential)/.test(s)) return "yes";
  return "no";
}

function statusOf(v: unknown): QualFactor["status"] {
  const s = str(v).toLowerCase();
  if (s === "positive" || s === "pos" || s === "good" || s === "up") return "positive";
  if (s === "negative" || s === "neg" || s === "bad" || s === "down") return "negative";
  if (s === "watch" || s === "caution" || s === "mixed") return "watch";
  return "neutral";
}

export function asFund(v: unknown): FundBlock | null {
  if (!v) return null;
  if (typeof v === "string") {
    const t = stripTrailingJson(v);
    if (!t) return null;
    const bits = paras(t);
    const verdict = headingBlock(t, ["Final verdict", "Verdict", "Investment verdict"]) || bits.at(-1) || bits[0] || "";
    return {
      tag: twoWords(bits[0] || "Open question") || "Open question",
      rating: ratingOf(verdict),
      snapshot: headingBlock(t, ["Company", "Snapshot"]) || bits[0] || "",
      business: headingBlock(t, ["Business"]) || bits[1] || bits[0] || "",
      industry: headingBlock(t, ["Industry position", "Industry"]) || bits[2] || "",
      position: headingBlock(t, ["Industry position", "Position", "Moat"]) || bits[3] || "",
      profitability: headingBlock(t, ["Profitability"]) || bits[4] || "",
      balanceSheet: headingBlock(t, ["Balance sheet"]) || bits[5] || "",
      valuation: headingBlock(t, ["Valuation"]) || bits[6] || "",
      growth: headingBlock(t, ["Growth"]) || bits[7] || "",
      risks: list(headingBlock(t, ["Risks"]).split(/\n+/).filter(Boolean), 4).length
        ? list(headingBlock(t, ["Risks"]).split(/\n+/), 4)
        : bits.slice(8, 11),
      changeMind: list(headingBlock(t, ["What would change this read", "What would change this"]).split(/\n+/), 3),
      verdict,
      prose: t,
    };
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const verdict = str(o.verdict) || str(o.headline);
  const prose = str(o.prose) || "";
  const block: FundBlock = {
    tag: twoWords(str(o.tag) || str(o.verdict) || str(o.headline) || "Open question") || "Open question",
    rating: o.rating != null ? ratingOf(o.rating ?? o.call ?? o.pass) : ratingOf(verdict),
    snapshot: str(o.snapshot) || str(o.company),
    business: str(o.business),
    industry: str(o.industry),
    position: str(o.position) || str(o.moat),
    profitability: str(o.profitability),
    balanceSheet: str(o.balanceSheet) || str(o.balance_sheet),
    valuation: str(o.valuation),
    growth: str(o.growth),
    risks: list(o.risks, 4),
    changeMind: (list(o.changeMind).length ? list(o.changeMind) : list(o.change_mind)).slice(0, 3),
    verdict,
    prose,
  };
  if (!block.snapshot && !block.business && !block.verdict && !block.valuation && !block.prose) return null;
  return block;
}

export function asQual(v: unknown): QualBlock | null {
  if (!v) return null;
  if (typeof v === "string") {
    const t = stripTrailingJson(v);
    if (!t) return null;
    const bits = paras(t);
    const label = potentialLabelOf(t);
    const verdict = headingBlock(t, ["Final verdict", "Verdict"]) || bits.at(-1) || "";
    return {
      tag: twoWords(bits[0] || "Open story"),
      potential: potentialOf(t, label),
      potentialLabel: label,
      headline: bits[0]?.slice(0, 220) || "Qualitative",
      allFactors: [],
      positive: bits.slice(1, 4),
      combinations: bits.slice(4, 6),
      catalysts: bits.slice(6, 8),
      pricedIn: headingBlock(t, ["Already in the price", "Priced in"]) || bits[8] || "",
      noise: headingBlock(t, ["Noise"]) || bits[9] || "",
      verdict,
      prose: t,
    };
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const rawFactors = Array.isArray(o.allFactors) ? o.allFactors : Array.isArray(o.all_factors) ? o.all_factors : [];
  const allFactors: QualFactor[] = rawFactors
    .map((item) => {
      if (typeof item === "string") return { name: item.slice(0, 48), status: "neutral" as const, note: item };
      if (!item || typeof item !== "object") return null;
      const f = item as Record<string, unknown>;
      const name = str(f.name) || str(f.factor);
      if (!name) return null;
      return { name: name.slice(0, 48), status: statusOf(f.status || f.tone), note: str(f.note) || str(f.why) };
    })
    .filter((x): x is QualFactor => Boolean(x))
    .slice(0, 16);
  const prose = str(o.prose);
  const label = str(o.potentialLabel) || potentialLabelOf(prose || str(o.verdict) || str(o.headline) || str(o.potential));
  const block: QualBlock = {
    tag: twoWords(str(o.tag) || str(o.headline) || str(o.verdict) || "Open story"),
    potential: potentialOf(o.potential ?? o.multibagger ?? o.multiBagger ?? prose, label),
    potentialLabel: label,
    headline: str(o.headline).slice(0, 220),
    allFactors,
    positive: (list(o.positive, 4).length ? list(o.positive, 4) : list(o.positiveFactors, 4)).slice(0, 4),
    combinations: list(o.combinations, 3),
    catalysts: list(o.catalysts, 3),
    pricedIn: str(o.pricedIn) || str(o.priced_in),
    noise: str(o.noise),
    verdict: str(o.verdict),
    prose,
  };
  if (
    !block.headline &&
    !block.allFactors.length &&
    !block.positive.length &&
    !block.combinations.length &&
    !block.verdict &&
    !block.prose
  )
    return null;
  return block;
}

/** True only when the model actually wrote the skill — not a research stub. */
export function skillOutputReady(kind: "fund" | "qual", text: string): boolean {
  const t = String(text || "").trim();
  if (!t) return false;
  const compact = t.replace(/\s+/g, " ");
  if (compact.length < 400) return false;
  if (/^(researching|looking up|searching|i am researching|let me research)\b/i.test(compact)) return false;
  if (/\bfor the catalyst framework\.?\s*$/i.test(compact) && compact.length < 900) return false;
  if (!/final verdict|investment verdict|\*\*verdict\*\*|^#{1,3}\s*verdict\b|\*\*Verdict:\*\*/im.test(t)) return false;
  const lines = t.split(/\n/).filter((x) => x.trim()).length;
  if (lines < 6) return false;
  return true;
}

export function fundText(b: FundBlock) {
  if (b.prose && b.prose.length > 80) return b.prose;
  return [
    b.tag,
    b.verdict,
    b.snapshot,
    b.business,
    b.industry,
    b.position,
    b.profitability,
    b.balanceSheet,
    b.valuation,
    b.growth,
    b.risks.join(" "),
    b.changeMind.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export function qualText(b: QualBlock) {
  if (b.prose && b.prose.length > 80) return b.prose;
  return [
    b.tag,
    b.headline,
    b.potentialLabel ? `Multi-bagger potential: ${b.potentialLabel}` : "",
    b.verdict,
    b.positive.join(" "),
    b.combinations.join(" "),
    b.catalysts.join(" "),
    b.pricedIn,
    b.noise,
  ]
    .filter(Boolean)
    .join("\n");
}

export function asStructure(v: unknown): StructureBlock | null {
  if (!v) return null;
  const biasOf = (raw: string): StructureBlock["bias"] => {
    const s = raw.toLowerCase();
    if (s.includes("down") || s.includes("bear") || s.includes("weak")) return "down";
    if (s.includes("range") || s.includes("side") || s.includes("chop")) return "range";
    if (s.includes("up") || s.includes("bull") || s.includes("long")) return "up";
    return "range";
  };
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return null;
    const bits = paras(t);
    return {
      tag: twoWords(bits[0] || "Open structure"),
      bias: biasOf(bits[1] || bits[0] || ""),
      setup: bits.slice(1, 3).join(" "),
      levels: bits.slice(3, 6),
      support: [],
      resistance: [],
      swings: [],
      mtf: [],
      invalidation: bits[6] || "",
      verdict: bits.at(-1) || "",
    };
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const levelRows = (raw: unknown): LevelRow[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (typeof item === "string") {
          const n = Number(item.replace(/[^\d.]/g, ""));
          return n > 0 ? { price: n, note: item } : null;
        }
        if (!item || typeof item !== "object") return null;
        const r = item as Record<string, unknown>;
        const price = Number(r.price || r.level || 0);
        const note = str(r.note) || str(r.label) || (price ? String(price) : "");
        if (!(price > 0) && !note) return null;
        return { price, note };
      })
      .filter((x): x is LevelRow => Boolean(x))
      .slice(0, 6);
  };
  const swingRows = (raw: unknown): SwingRow[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (typeof item === "string") return { label: item.slice(0, 8), price: 0 };
        if (!item || typeof item !== "object") return null;
        const r = item as Record<string, unknown>;
        return { label: str(r.label) || str(r.kind) || "H", price: Number(r.price) || 0 };
      })
      .filter((x): x is SwingRow => Boolean(x))
      .slice(0, 10);
  };
  const block: StructureBlock = {
    tag: twoWords(str(o.tag) || str(o.headline) || str(o.verdict) || "Open structure"),
    bias: biasOf(str(o.bias) || str(o.direction) || str(o.tag)),
    setup: str(o.setup) || str(o.read),
    levels: list(o.levels, 6),
    support: levelRows(o.support),
    resistance: levelRows(o.resistance),
    swings: swingRows(o.swings),
    mtf: list(o.mtf, 6).length ? list(o.mtf, 6) : list(o.confluence, 6),
    invalidation: str(o.invalidation) || str(o.invalid),
    verdict: str(o.verdict) || str(o.headline),
  };
  if (!block.tag && !block.setup && !block.verdict) return null;
  return block;
}

export function structureText(b: StructureBlock) {
  return [
    b.tag,
    b.bias,
    b.setup,
    b.levels.join(" "),
    b.support.map((x) => x.note || String(x.price)).join(" "),
    b.resistance.map((x) => x.note || String(x.price)).join(" "),
    b.swings.map((x) => x.label).join(" "),
    b.mtf.join(" "),
    b.invalidation,
    b.verdict,
  ]
    .filter(Boolean)
    .join("\n");
}
