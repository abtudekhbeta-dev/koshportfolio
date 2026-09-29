/** One completion plan: formulas first, then source research for whatever is still blank. */

import { applyFormulas, cfoToPat, seriesCagr } from "./formulas.ts";
import { fillFundamentals } from "./fund-merge.ts";
import { parsePeriod } from "./fin-series.ts";
import type { FactProvenance } from "./fact-types.ts";
import type { FinPoint, Fundamentals } from "./types.ts";
import type { ResearchItem } from "./research-validate.ts";

export type Gap = { key: string; label: string; reason: string };

const SCALAR: Record<string, keyof Fundamentals> = {
  pe: "pe",
  "p/e": "pe",
  pb: "pb",
  "p/b": "pb",
  roe: "roe",
  roce: "roce",
  opm: "opm",
  "operating margin": "opm",
  de: "de",
  "d/e": "de",
  "debt/equity": "de",
  "div yield": "divYield",
  "dividend yield": "divYield",
  promoters: "promoters",
  "promoter holding": "promoters",
  mcap: "mcapCr",
  "market cap": "mcapCr",
  "sales 1y": "salesYoY",
  "sales growth": "salesYoY",
  "profit 1y": "profitYoY",
  "profit growth": "profitYoY",
  peg: "peg",
  eps: "eps",
  book: "book",
  "book value": "book",
  "interest coverage": "interestCover",
  "int. cover": "interestCover",
  "cfo/pat": "cfoPat",
  pledge: "pledge",
  "sales cagr 3y": "salesCagr3",
  "sales 3y": "salesCagr3",
  "profit cagr 3y": "profitCagr3",
  "profit cagr 5y": "profitCagr5",
  "profit 5y": "profitCagr5",
  fii: "fii",
  dii: "dii",
};

const SERIES_ASK: Record<string, string> = {
  sales: "annual sales history",
  profits: "annual profit history",
  cfo: "annual cash from operations",
};

const SERIES_LABEL: Record<string, "sales" | "profits" | "cfo"> = {
  revenue: "sales",
  "revenue from operations": "sales",
  sales: "sales",
  pat: "profits",
  profit: "profits",
  "net profit": "profits",
  cfo: "cfo",
  "cash from operations": "cfo",
};

const ASK_LABEL: Record<string, string> = {
  pe: "P/E",
  pb: "P/B",
  roe: "ROE",
  roce: "ROCE",
  opm: "OPM",
  de: "D/E",
  divYield: "Dividend yield",
  promoters: "Promoter holding",
  mcapCr: "Market cap",
  eps: "EPS",
  book: "Book value",
  interestCover: "Interest coverage",
  pledge: "Pledge",
  fii: "FII",
  dii: "DII",
  peg: "PEG",
};

/** Derived outputs. If the inputs exist, do not ask AI for the output. */
const DERIVED: Record<string, (keyof Fundamentals)[]> = {
  salesYoY: ["sales"],
  profitYoY: ["profits"],
  salesCagr3: ["sales"],
  profitCagr3: ["profits"],
  profitCagr5: ["profits"],
  cfoPat: ["cfo", "profits"],
  peg: ["pe", "profitCagr5"],
};

export const SCREEN_FUND_FIELDS: { key: string; label: string }[] = [
  { key: "pe", label: "P/E" },
  { key: "pb", label: "P/B" },
  { key: "roe", label: "ROE" },
  { key: "roce", label: "ROCE" },
  { key: "opm", label: "OPM" },
  { key: "de", label: "D/E" },
  { key: "promoters", label: "Promoter holding" },
  { key: "mcapCr", label: "Market cap" },
  { key: "salesYoY", label: "Sales growth" },
  { key: "profitYoY", label: "Profit growth" },
  { key: "divYield", label: "Dividend yield" },
];

export function blankFund(symbol: string): Fundamentals {
  const empty: number | null = null;
  return {
    symbol,
    searchId: "",
    name: symbol,
    industry: "",
    ceo: "",
    founded: "",
    summary: "",
    mcapCr: empty,
    pe: empty,
    pb: empty,
    roe: empty,
    de: empty,
    divYield: empty,
    eps: empty,
    book: empty,
    face: empty,
    industryPe: empty,
    salesYoY: empty,
    profitYoY: empty,
    sales: [],
    profits: [],
    qSales: [],
    qProfits: [],
    netWorth: [],
    qNetWorth: [],
    shareholding: [],
    promoters: empty,
    fii: empty,
    dii: empty,
    roce: empty,
    peg: empty,
    opm: empty,
    salesCagr3: empty,
    profitCagr3: empty,
    profitCagr5: empty,
    website: null,
    interestCover: empty,
    ebitda: [],
    cfo: [],
    qCfo: [],
    cfoPat: empty,
    pledge: empty,
    provenance: { searched: false, at: Date.now(), fields: {} },
  };
}

export function fieldKey(label: string): keyof Fundamentals | null {
  const k = label.trim().toLowerCase();
  if (SCALAR[k]) return SCALAR[k];
  for (const [name, key] of Object.entries(SCALAR)) {
    if (k.includes(name)) return key;
  }
  return null;
}

function seriesReady(pts: FinPoint[] | undefined, min: number) {
  return (pts || []).filter((p) => p && Number.isFinite(p.value)).length >= min;
}

function yoyReady(pts: FinPoint[] | undefined) {
  if (!pts || pts.length < 2) return false;
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  return a.value > 0 && Number.isFinite(b.value);
}

/** True only when the formula engine can actually produce the number. A short series is not enough. */
function canDerive(fund: Fundamentals, key: string): boolean {
  if (key === "salesCagr3") return seriesCagr(fund.sales, 3).value != null;
  if (key === "profitCagr3") return seriesCagr(fund.profits, 3).value != null;
  if (key === "profitCagr5") return seriesCagr(fund.profits, 5).value != null;
  if (key === "salesYoY") return yoyReady(fund.sales);
  if (key === "profitYoY") return yoyReady(fund.profits);
  if (key === "cfoPat") return cfoToPat(fund.cfo, fund.profits).value != null;
  if (key === "peg") {
    const g = seriesCagr(fund.profits, 5).value ?? seriesCagr(fund.profits, 3).value;
    return fund.pe != null && fund.pe > 0 && g != null && g > 0;
  }
  return false;
}

function rawAsks(fund: Fundamentals, key: string, ask: Set<string>) {
  const needs = DERIVED[key];
  if (!needs) {
    if (SERIES_ASK[key]) {
      if (!seriesReady(fund[key as "sales"], 1)) ask.add(SERIES_ASK[key]);
      return;
    }
    const cur = fund[key as keyof Fundamentals];
    if (typeof cur === "number" && Number.isFinite(cur)) return;
    ask.add(ASK_LABEL[key] || key);
    return;
  }
  if (canDerive(fund, key)) return;
  if (needs.length === 1 && SERIES_ASK[needs[0]]) {
    ask.add(SERIES_ASK[needs[0]]);
    return;
  }
  for (const n of needs) rawAsks(fund, String(n), ask);
}

/** Labels still blank on the displayed columns. A blank is not a pass. */
export function missingDisplayed(
  row: Record<string, unknown>,
  fields: { key: string; label: string }[],
): { key: string; label: string }[] {
  return fields.filter((f) => {
    const v = row[f.key];
    return !(typeof v === "number" && Number.isFinite(v));
  });
}

/**
 * What to ask a source for. Derived metrics with inputs on file are local.
 * A short series is not treated as enough for a 5-year CAGR.
 * Missing CAGR asks for the annual series, not a made-up growth rate.
 */
export function researchPlan(fund: Fundamentals, missing: string[]): { ask: string[]; local: string[] } {
  const ask = new Set<string>();
  const local: string[] = [];
  for (const label of missing) {
    const seriesName = SERIES_LABEL[label.trim().toLowerCase()];
    if (seriesName) {
      if (!seriesReady(fund[seriesName], 1)) ask.add(SERIES_ASK[seriesName]);
      continue;
    }
    if (/^(fii|dii) change$/i.test(label.trim())) {
      local.push(label);
      continue;
    }
    if (/^(3m|1y|rsi 14|vol vs 20d avg|vs 52w high|contractions|last contraction|volume multiple|pivot)$/i.test(label.trim())) {
      local.push(label);
      continue;
    }
    const key = fieldKey(label);
    if (!key) {
      ask.add(label);
      continue;
    }
    if (DERIVED[String(key)]) {
      if (canDerive(fund, String(key))) local.push(label);
      else rawAsks(fund, String(key), ask);
      continue;
    }
    const cur = fund[key];
    if (typeof cur === "number" && Number.isFinite(cur)) continue;
    if (Array.isArray(cur) && cur.length) continue;
    ask.add(label);
  }
  return { ask: [...ask], local };
}

export const RESEARCH_BATCH = 24;

/** Every requested metric is attempted. The server cap is a batch, not a silent drop. */
export function researchBatches(asks: string[], size = RESEARCH_BATCH): string[][] {
  const clean = [...new Set(asks.map((s) => s.trim()).filter(Boolean))];
  const out: string[][] = [];
  const n = Math.max(1, size);
  for (let i = 0; i < clean.length; i += n) out.push(clean.slice(i, i + n));
  return out;
}

const SCALAR_KEYS = [
  "mcapCr",
  "pe",
  "pb",
  "roe",
  "de",
  "divYield",
  "eps",
  "book",
  "promoters",
  "fii",
  "dii",
  "roce",
  "peg",
  "opm",
  "interestCover",
  "pledge",
  "cfoPat",
  "salesCagr3",
  "profitCagr3",
  "profitCagr5",
  "salesYoY",
  "profitYoY",
] as const;

/**
 * Filing/card numbers win. A previously researched fact fills a blank and keeps its status.
 * A researched label is never left on a number that came from the card.
 */
export function seedCompletion(
  existing: Fundamentals | null | undefined,
  fetched: Fundamentals | null | undefined,
  symbol: string,
): Fundamentals {
  const base: Fundamentals = fetched
    ? { ...blankFund(symbol), ...fetched, symbol: fetched.symbol || symbol }
    : existing
      ? { ...existing, symbol: existing.symbol || symbol }
      : blankFund(symbol);
  if (!existing || !fetched) return applyFormulas(base);
  const merged = fillFundamentals(base, existing);
  const fields: Record<string, FactProvenance> = { ...(existing.provenance?.fields || {}) };
  for (const [k, meta] of Object.entries(base.provenance?.fields || {})) fields[k] = meta;
  for (const key of SCALAR_KEYS) {
    const baseVal = base[key];
    const baseHas = typeof baseVal === "number" && Number.isFinite(baseVal);
    if (!baseHas) continue;
    const meta = fields[key];
    if (meta?.rank === "ai-researched" && !base.provenance?.fields?.[key]) {
      fields[key] = {
        status: "verified",
        source: "Company record",
        rank: "structured-provider",
        method: "Already on the company record. Research was not used for this number.",
        period: base.finPeriod || null,
      };
    }
  }
  merged.provenance = {
    searched: Boolean(existing.provenance?.searched || base.provenance?.searched),
    at: Date.now(),
    fields,
  };
  return applyFormulas(merged);
}

function seriesOfMetric(metric: string): "sales" | "profits" | "cfo" | null {
  const m = metric.toLowerCase().trim();
  if (SERIES_LABEL[m]) return SERIES_LABEL[m];
  if (/annual sales|revenue history|sales history|revenue from operations|sales cagr|revenue cagr/.test(m)) return "sales";
  if (/annual profit|profit history|pat history|net profit|profit cagr/.test(m)) return "profits";
  if (/cash from operations|operating cash|cfo history/.test(m)) return "cfo";
  return null;
}

function pointsFrom(item: ResearchItem): FinPoint[] {
  const pts = item.inputs
    .map((row) => {
      const period = periodOf(row.name);
      return period ? { period, value: row.value } : null;
    })
    .filter((x): x is FinPoint => Boolean(x));
  if (item.status === "researched" && item.value != null && !/cagr/i.test(item.metric)) {
    const period = periodOf(item.period || "");
    if (period) pts.push({ period, value: item.value });
  }
  return pts;
}

function periodOf(name: string): string | null {
  const s = String(name || "").trim();
  if (/^FY\s*\d{2,4}$/i.test(s) || /^\d{4}$/.test(s) || /[A-Za-z]{3}.*\d{2,4}/.test(s)) return s;
  return null;
}

function stamp(fields: Record<string, FactProvenance>, key: string, item: ResearchItem, method: string) {
  fields[key] = {
    status: "researched",
    source: item.sourceName || "Source-backed research",
    rank: "ai-researched",
    method,
    period: item.period,
    reason: item.evidence,
  };
}

/** Write source-backed facts onto blanks only. Never overwrite a number. Never mark them verified. */
export function applyResearchToFund(fund: Fundamentals, items: ResearchItem[]): Fundamentals {
  const out: Fundamentals = {
    ...fund,
    sales: [...(fund.sales || [])],
    profits: [...(fund.profits || [])],
    cfo: [...(fund.cfo || [])],
    provenance: {
      searched: true,
      at: Date.now(),
      fields: { ...(fund.provenance?.fields || {}) },
    },
  };
  const fields = out.provenance!.fields;
  const pushSeries = (key: "sales" | "profits" | "cfo", pts: FinPoint[]) => {
    const have = new Set(out[key].map((p) => p.period));
    for (const p of pts) {
      if (!p.period || have.has(p.period) || !Number.isFinite(p.value)) continue;
      out[key].push(p);
      have.add(p.period);
    }
  };
  for (const item of items) {
    const seriesKey = seriesOfMetric(item.metric);
    if (seriesKey && (item.status === "inputs_only" || item.status === "researched")) {
      const pts = pointsFrom(item);
      if (pts.length) {
        pushSeries(seriesKey, pts);
        fields[seriesKey] = {
          status: "researched",
          source: item.sourceName || "Source-backed research",
          rank: "ai-researched",
          method: "Annual observations from a cited source. CAGR is calculated by Kosh, not by the model.",
          period: pts.at(-1)?.period || item.period,
          reason: item.evidence,
        };
      }
      continue;
    }
    const key = fieldKey(item.metric);
    if (item.status === "conflicting") {
      if (key && !DERIVED[String(key)]) {
        const cur = out[key];
        if (!(typeof cur === "number" && Number.isFinite(cur))) {
          fields[String(key)] = {
            status: "conflicting",
            source: item.sourceName || "Research",
            rank: "ai-researched",
            method: item.evidence,
            period: item.period,
            reason: item.evidence || "Sources disagree. Kosh did not average them.",
            alt: item.value,
          };
        }
      }
      continue;
    }
    if (item.status !== "researched" || item.value == null) {
      if (key && item.status === "not_found") {
        fields[String(key)] = {
          status: "unavailable",
          source: item.sourceName || "Research",
          rank: "ai-researched",
          method: item.evidence || "Not found in the sources checked.",
          period: item.period,
          reason: item.evidence || "Not found in the sources checked.",
        };
      }
      continue;
    }
    if (!key || DERIVED[String(key)]) continue;
    const cur = out[key];
    if (typeof cur === "number" && Number.isFinite(cur)) continue;
    if (typeof cur === "number" || cur == null) {
      (out as unknown as Record<string, number>)[key as string] = item.value;
      stamp(fields, String(key), item, `${item.evidence} Not a reported filing ingested by Kosh.`);
    }
  }
  const byT = (a: FinPoint, b: FinPoint) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0);
  out.sales.sort(byT);
  out.profits.sort(byT);
  out.cfo.sort(byT);
  return applyFormulas(out);
}

export function explainGaps(fund: Fundamentals, missing: string[]): Gap[] {
  const gaps: Gap[] = [];
  for (const label of missing) {
    const seriesName = SERIES_LABEL[label.trim().toLowerCase()];
    if (seriesName) {
      if (seriesReady(fund[seriesName], 1)) continue;
      const meta = fund.provenance?.fields?.[seriesName];
      gaps.push({
        key: seriesName,
        label,
        reason: meta?.reason || meta?.method || "Unavailable — no supported source returned this field.",
      });
      continue;
    }
    const key = fieldKey(label);
    if (!key) {
      gaps.push({ key: label, label, reason: "This field is not on the company record." });
      continue;
    }
    const cur = fund[key];
    if (typeof cur === "number" && Number.isFinite(cur)) continue;
    if (Array.isArray(cur) && cur.length) continue;
    const meta = fund.provenance?.fields?.[String(key)];
    gaps.push({
      key: String(key),
      label,
      reason: meta?.reason || meta?.method || "Unavailable — no supported source returned this field.",
    });
  }
  return gaps;
}

/** Path prices come from the market history, never from a model reply. */
export function usablePathPrice(_item: ResearchItem | null): number | null {
  return null;
}

/** What a model may be asked when a Path name did not match a listed ticker. Never a price or a return. */
export function pathIdentityAsk(symbol: string): string {
  return `listed NSE or BSE symbol for ${symbol}`;
}

/**
 * Server company cache. Numbers already on file win.
 * Incoming researched facts fill blanks and keep AI-researched provenance.
 */
export function commitFund(
  cached: Fundamentals | null | undefined,
  incoming: Fundamentals,
  symbol: string,
): Fundamentals {
  if (!cached) return applyFormulas({ ...incoming, symbol: incoming.symbol || symbol });
  return seedCompletion(incoming, cached, symbol);
}
export async function pool<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const n = Math.max(1, Math.min(concurrency, items.length || 1));
  async function run() {
    while (next < items.length) {
      const idx = next++;
      out[idx] = await worker(items[idx], idx);
    }
  }
  if (!items.length) return [];
  await Promise.all(Array.from({ length: n }, () => run()));
  return out;
}
