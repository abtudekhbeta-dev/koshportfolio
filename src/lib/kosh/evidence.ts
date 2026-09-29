/** One verified-fact layer. Numbers are selected, derived, or marked missing — never invented. */

import type { FinPoint, Fundamentals } from "./types.ts";
import { mergeFinSeries } from "./fund-merge.ts";
import type { FactProvenance, FactStatus, SourceRank } from "./fact-types.ts";

export type FieldGroup = "financials" | "valuation" | "quality" | "ownership";

export type FieldLine = {
  id: string;
  label: string;
  group: FieldGroup;
  status: FactStatus;
  value: number | null;
  unit: string;
  period: string | null;
  sourceName: string;
  methodology: string;
  reason?: string;
  alt?: number | null;
  altSource?: string | null;
};

export type FieldReport = {
  lines: FieldLine[];
  counts: Record<FactStatus, number>;
};

type NumKey =
  | "pe"
  | "pb"
  | "roe"
  | "de"
  | "divYield"
  | "eps"
  | "book"
  | "salesYoY"
  | "profitYoY"
  | "promoters"
  | "fii"
  | "dii"
  | "roce"
  | "peg"
  | "opm"
  | "salesCagr3"
  | "profitCagr3"
  | "profitCagr5"
  | "interestCover"
  | "cfoPat"
  | "pledge"
  | "face";

type Spec = {
  id: string;
  label: string;
  group: FieldGroup;
  unit: string;
  key?: NumKey;
  series?: "sales" | "profits" | "cfo" | "ebitda";
  definition: string;
};

export const FACT_FIELDS: Spec[] = [
  { id: "revenue", label: "Revenue", group: "financials", unit: "₹ Cr", series: "sales", definition: "Revenue from operations." },
  { id: "pat", label: "PAT", group: "financials", unit: "₹ Cr", series: "profits", definition: "Profit attributable to owners." },
  { id: "cfo", label: "CFO", group: "financials", unit: "₹ Cr", series: "cfo", definition: "Cash from operating activities." },
  { id: "ebitda", label: "EBITDA", group: "financials", unit: "₹ Cr", series: "ebitda", definition: "EBITDA when the filing states it." },
  { id: "eps", label: "EPS", group: "financials", unit: "₹", key: "eps", definition: "Basic earnings per share." },
  { id: "opm", label: "OPM", group: "quality", unit: "%", key: "opm", definition: "Operating margin. Reported, or operating profit / revenue when derived." },
  { id: "roe", label: "ROE", group: "quality", unit: "%", key: "roe", definition: "Return on equity." },
  { id: "roce", label: "ROCE", group: "quality", unit: "%", key: "roce", definition: "Return on capital employed. Reported, or EBIT / capital employed when derived." },
  { id: "de", label: "D/E", group: "quality", unit: "x", key: "de", definition: "Debt / equity." },
  { id: "interestCover", label: "Interest coverage", group: "quality", unit: "x", key: "interestCover", definition: "Operating profit / finance cost, when both are on the filing." },
  { id: "cfoPat", label: "CFO/PAT", group: "quality", unit: "x", key: "cfoPat", definition: "Operating cash flow divided by PAT for the latest comparable annual period." },
  { id: "salesCagr3", label: "Sales CAGR 3Y", group: "financials", unit: "%", key: "salesCagr3", definition: "Three-year sales CAGR from annual revenue points." },
  { id: "profitCagr3", label: "Profit CAGR 3Y", group: "financials", unit: "%", key: "profitCagr3", definition: "Three-year profit CAGR." },
  { id: "profitCagr5", label: "Profit CAGR 5Y", group: "financials", unit: "%", key: "profitCagr5", definition: "Five-year profit CAGR." },
  { id: "pe", label: "P/E", group: "valuation", unit: "x", key: "pe", definition: "Trailing price / earnings from the company card." },
  { id: "pb", label: "P/B", group: "valuation", unit: "x", key: "pb", definition: "Price / book." },
  { id: "peg", label: "PEG", group: "valuation", unit: "x", key: "peg", definition: "P/E divided by profit CAGR. Period is the growth window used." },
  { id: "book", label: "Book value", group: "valuation", unit: "₹", key: "book", definition: "Book value per share." },
  { id: "divYield", label: "Dividend yield", group: "valuation", unit: "%", key: "divYield", definition: "Dividend yield." },
  { id: "promoters", label: "Promoter holding", group: "ownership", unit: "%", key: "promoters", definition: "Promoter and promoter group, % of equity." },
  { id: "fii", label: "FII", group: "ownership", unit: "%", key: "fii", definition: "Foreign institutional holding." },
  { id: "dii", label: "DII", group: "ownership", unit: "%", key: "dii", definition: "Domestic institutional holding." },
  { id: "pledge", label: "Pledge", group: "ownership", unit: "%", key: "pledge", definition: "Promoter shares pledged, % of equity." },
];

const ACCOUNTING = new Set<NumKey>([
  "de",
  "eps",
  "opm",
  "roce",
  "interestCover",
  "salesYoY",
  "profitYoY",
  "salesCagr3",
  "profitCagr3",
  "profitCagr5",
  "promoters",
  "fii",
  "dii",
  "pledge",
  "face",
  "cfoPat",
]);

const SERIES: ("sales" | "profits" | "cfo" | "ebitda" | "qSales" | "qProfits" | "qCfo" | "netWorth" | "qNetWorth")[] = [
  "sales",
  "profits",
  "cfo",
  "ebitda",
  "qSales",
  "qProfits",
  "qCfo",
  "netWorth",
  "qNetWorth",
];

export const SOURCE_RANK: Record<SourceRank, number> = {
  "company-filing": 1,
  "exchange-filing": 2,
  "annual-report": 3,
  presentation: 4,
  "structured-provider": 5,
  secondary: 6,
  "kosh-derived": 7,
  unknown: 8,
};

function finite(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function close(a: number, b: number) {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / scale <= 0.015 || Math.abs(a - b) < 0.05;
}

/** ₹ crore is the house unit for statement totals. Do not compare before this. */
export function toCrore(value: number, unit: string): number | null {
  if (!Number.isFinite(value)) return null;
  const u = unit.toLowerCase();
  if (/crore|\bcr\b/.test(u)) return value;
  if (/billion|\bbn\b/.test(u)) return value * 100;
  if (/million|\bmn\b/.test(u)) return value / 10;
  if (Math.abs(value) >= 1e7) return value / 1e7;
  return value;
}

export type FactCandidate = {
  value: number;
  source: string;
  rank: SourceRank;
  period?: string | null;
  method?: string;
  derived?: boolean;
};

export function reconcileCandidates(cands: FactCandidate[]): {
  value: number | null;
  status: FactStatus;
  source: string;
  rank: SourceRank;
  method: string;
  period: string | null;
  alt: number | null;
  altSource: string | null;
  reason?: string;
} {
  const rows = cands.filter((c) => Number.isFinite(c.value));
  if (!rows.length) {
    return {
      value: null,
      status: "unavailable",
      source: "",
      rank: "unknown",
      method: "",
      period: null,
      alt: null,
      altSource: null,
      reason: "Not found in supported sources.",
    };
  }
  const ranked = [...rows].sort((a, b) => SOURCE_RANK[a.rank] - SOURCE_RANK[b.rank]);
  const best = ranked[0];
  const rest = ranked.slice(1).filter((c) => !close(c.value, best.value));
  const derivedOnly = best.derived || best.rank === "kosh-derived";
  const status: FactStatus = rest.length ? "conflicting" : derivedOnly ? "derived" : "verified";
  return {
    value: best.value,
    status,
    source: best.source,
    rank: best.rank,
    method: best.method || (derivedOnly ? "Kosh-derived." : "Selected by source hierarchy."),
    period: best.period || null,
    alt: rest[0]?.value ?? null,
    altSource: rest[0]?.source ?? null,
  };
}

function preferFiling(filing?: FinPoint[] | null, card?: FinPoint[] | null) {
  if (!filing?.length) return card || [];
  return mergeFinSeries(filing, card || []);
}

function setField(map: Record<string, FactProvenance>, id: string, row: FactProvenance) {
  map[id] = row;
}

/**
 * Accounting facts prefer the exchange filing over the company card when both exist.
 * Market multiples stay on the card. Series for the same period follow the same rule.
 * Disagreeing values are kept as alternatives — not averaged, not dropped silently.
 */
export function reconcileFundamentals(
  base: Fundamentals,
  extra: Partial<Fundamentals>,
  names: { card?: string; filing?: string } = {},
): Fundamentals {
  const cardName = names.card || "Company card";
  const filingName = names.filing || "NSE filing";
  const out: Fundamentals = { ...base };
  for (const k of SERIES) {
    const filing = extra[k] as FinPoint[] | undefined;
    const card = base[k] as FinPoint[] | undefined;
    (out as Record<string, unknown>)[k] = preferFiling(filing, card);
  }
  const fields: Record<string, FactProvenance> = {};

  const market = ["pe", "pb", "roe", "divYield", "book", "mcapCr"] as const;
  for (const key of market) {
    const b = finite(base[key]);
    const e = finite(extra[key]);
    const chosen = b ?? e;
    out[key] = chosen;
    if (chosen == null) continue;
    const fromFiling = b == null && e != null;
    setField(fields, key, {
      status: "verified",
      source: fromFiling ? filingName : cardName,
      rank: fromFiling ? "exchange-filing" : "structured-provider",
      method: fromFiling ? "Filing print. The company card had no value." : "Structured provider. Market multiple, not a filing line.",
      period: fromFiling ? extra.finPeriod || null : base.finPeriod || null,
    });
  }

  for (const key of ACCOUNTING) {
    const b = finite(base[key as keyof Fundamentals]);
    const e = finite(extra[key as keyof Fundamentals]);
    const picked = reconcileCandidates([
      ...(b == null ? [] : [{ value: b, source: cardName, rank: "structured-provider" as const, period: base.finPeriod }]),
      ...(e == null ? [] : [{ value: e, source: filingName, rank: "exchange-filing" as const, period: extra.finPeriod || extra.shPeriod }]),
    ]);
    (out as Record<string, unknown>)[key] = picked.value;
    if (picked.value == null && b == null && e == null) continue;
    setField(fields, key, {
      status: picked.status,
      source: picked.source,
      rank: picked.rank,
      method: picked.method,
      period: picked.period,
      alt: picked.alt,
      altSource: picked.altSource,
      reason: picked.reason,
    });
  }

  const textKeys = ["industry", "ceo", "founded", "summary", "website"] as const;
  for (const k of textKeys) {
    if (!out[k] && extra[k]) (out as Record<string, unknown>)[k] = extra[k];
  }
  if (!out.finPeriod && extra.finPeriod) out.finPeriod = extra.finPeriod;
  if (extra.finPeriod && extra.sales?.length) out.finPeriod = extra.finPeriod;
  if (!out.shPeriod && extra.shPeriod) out.shPeriod = extra.shPeriod;
  if (extra.shareholding?.length) out.shareholding = extra.shareholding;

  for (const spec of FACT_FIELDS) {
    if (!spec.series) continue;
    const chosen = lastOf(out[spec.series]);
    if (chosen == null) continue;
    const filingV = lastOf(extra[spec.series]);
    const cardV = lastOf(base[spec.series]);
    const fromFiling = filingV != null && close(filingV, chosen);
    const alt = fromFiling && cardV != null && !close(cardV, chosen) ? cardV : null;
    setField(fields, spec.id, {
      status: alt != null ? "conflicting" : "verified",
      source: fromFiling ? filingName : cardName,
      rank: fromFiling ? "exchange-filing" : "structured-provider",
      method: alt != null ? "Exchange filing selected. Company card differs for the latest period." : fromFiling ? "Exchange filing." : "Company card.",
      period: out[spec.series]?.at(-1)?.period || null,
      alt,
      altSource: alt != null ? cardName : null,
    });
  }

  out.provenance = { searched: true, at: Date.now(), fields };
  return out;
}

export function noteDerived(fund: Fundamentals, notes: Partial<Record<string, string>>): Fundamentals {
  const fields = { ...(fund.provenance?.fields || {}) };
  for (const [id, method] of Object.entries(notes)) {
    if (!method) continue;
    const prev = fields[id];
    fields[id] = {
      status: prev?.status === "conflicting" ? "conflicting" : "derived",
      source: "Kosh",
      rank: "kosh-derived",
      method,
      period: fund.finPeriod || prev?.period || null,
      alt: prev?.alt,
      altSource: prev?.altSource,
    };
  }
  return { ...fund, provenance: { searched: fund.provenance?.searched === true, at: Date.now(), fields } };
}

export function stampCard(fund: Fundamentals): Fundamentals {
  if (fund.provenance?.searched) return fund;
  const fields: Record<string, FactProvenance> = { ...(fund.provenance?.fields || {}) };
  for (const spec of FACT_FIELDS) {
    if (fields[spec.id] || fields[spec.key || ""]) continue;
    const id = spec.key || spec.id;
    const value = spec.series ? lastOf(fund[spec.series]) : finite(fund[spec.key as keyof Fundamentals]);
    if (value == null) continue;
    fields[id] = {
      status: "verified",
      source: "Company card",
      rank: "structured-provider",
      method: "Structured provider. Not yet reconciled against an exchange filing.",
      period: spec.group === "ownership" ? fund.shPeriod || null : fund.finPeriod || null,
    };
  }
  return { ...fund, provenance: { searched: false, at: fund.retrievedAt || null, fields } };
}

function lastOf(pts?: FinPoint[] | null) {
  const hit = (pts || []).filter((p) => Number.isFinite(p.value)).at(-1);
  return hit ? hit.value : null;
}

function periodOf(fund: Fundamentals, spec: Spec) {
  if (spec.series) return fund[spec.series]?.at(-1)?.period || fund.finPeriod || null;
  if (spec.group === "ownership") return fund.shPeriod || null;
  return fund.finPeriod || null;
}

function valueOf(fund: Fundamentals, spec: Spec): number | null {
  if (spec.series) return lastOf(fund[spec.series]);
  if (!spec.key) return null;
  return finite(fund[spec.key]);
}

export function buildFieldReport(fund: Fundamentals | null | undefined): FieldReport {
  const counts: Record<FactStatus, number> = {
    verified: 0,
    derived: 0,
    researched: 0,
    conflicting: 0,
    unavailable: 0,
    not_applicable: 0,
  };
  const lines: FieldLine[] = FACT_FIELDS.map((spec) => {
    const id = spec.key || spec.id;
    const meta = fund?.provenance?.fields?.[id] || fund?.provenance?.fields?.[spec.id];
    const value = fund ? valueOf(fund, spec) : null;
    let status: FactStatus = value == null ? "unavailable" : meta?.status || "verified";
    if (value == null) status = "unavailable";
    counts[status] += 1;
    const missing = status === "unavailable";
    return {
      id: spec.id,
      label: spec.label,
      group: spec.group,
      status,
      value,
      unit: spec.unit,
      period: fund ? periodOf(fund, spec) : null,
      sourceName: missing ? "" : meta?.source || "Company card",
      methodology: missing
        ? meta?.reason || "Not found in supported sources."
        : meta?.method || spec.definition,
      reason: missing ? meta?.reason || "Not found in supported sources." : undefined,
      alt: meta?.alt,
      altSource: meta?.altSource,
    };
  });
  return { lines, counts };
}

export function missingFieldLabels(fund: Fundamentals | null | undefined) {
  return buildFieldReport(fund)
    .lines.filter((l) => l.status === "unavailable")
    .map((l) => l.label);
}

const UNSUPPORTED: { re: RegExp; metric: string; closest: string; accept: RegExp }[] = [
  { re: /free cash flow yield|fcf yield/i, metric: "Free cash flow yield", closest: "CFO/PAT", accept: /cfo\s*\/\s*pat instead/i },
  { re: /ev\s*\/\s*ebitda|enterprise value/i, metric: "EV/EBITDA", closest: "P/E", accept: /p\/e instead/i },
  { re: /dividend payout/i, metric: "Dividend payout", closest: "Dividend yield", accept: /dividend yield instead/i },
  { re: /interest coverage ratio/i, metric: "Interest coverage", closest: "Interest coverage", accept: /^$/ },
  { re: /return on capital employed/i, metric: "ROCE", closest: "ROCE", accept: /^$/ },
];

/** Interest coverage and ROCE are supported under shorter names — do not flag those phrases. */
const SUPPORTED_PHRASE = /interest coverage ratio|return on capital employed/i;

export function screenMetricGap(prompt: string): { metric: string; closest: string; message: string } | null {
  const text = String(prompt || "");
  if (!text.trim()) return null;
  for (const row of UNSUPPORTED) {
    if (SUPPORTED_PHRASE.test(row.re.source) && row.metric !== "Free cash flow yield") continue;
    if (row.metric === "Interest coverage" || row.metric === "ROCE") continue;
    if (!row.re.test(text)) continue;
    if (row.accept.test(text)) continue;
    return {
      metric: row.metric,
      closest: row.closest,
      message: `${row.metric} is not currently a supported screening field. Closest available: ${row.closest}. Use ${row.closest} instead?`,
    };
  }
  return null;
}
