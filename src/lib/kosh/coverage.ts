/** Data coverage — missing stays missing. Never treat a blank as a pass. */

import type { Fundamentals, ScreenRow } from "./types.ts";

export type CoverageLevel = "covered" | "partial" | "insufficient";

export type CoverageBucket = {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
};

export type CoverageCard = {
  level: CoverageLevel;
  pct: number;
  nOk: number;
  nAll: number;
  buckets: CoverageBucket[];
};

function hasNum(v: number | null | undefined) {
  return v != null && Number.isFinite(v);
}

function hasSeries(pts: { value: number }[] | undefined, n = 2) {
  return (pts || []).filter((p) => Number.isFinite(p.value)).length >= n;
}

export function buildCoverage(input: {
  fund?: Fundamentals | null;
  row?: ScreenRow | null;
  price?: number | null;
  peerCount?: number;
}): CoverageCard {
  const f = input.fund || null;
  const row = input.row || null;
  const px = input.price ?? row?.price ?? null;

  const buckets: CoverageBucket[] = [
    {
      id: "price",
      label: "Price",
      ok: px != null && px > 0,
      hint: "Last exchange print. Blank means we could not price this name.",
    },
    {
      id: "financials",
      label: "Financials",
      ok: hasSeries(f?.sales) || hasNum(f?.salesYoY) || hasNum(row?.salesYoY),
      hint: "Revenue and profit from the company card. Blank is missing, not zero.",
    },
    {
      id: "ownership",
      label: "Ownership",
      ok: hasNum(f?.promoters) || hasNum(row?.promoters),
      hint: "Latest promoter / FII / DII print. Promoter pledge is filled from the shareholding filing when present.",
    },
    {
      id: "valuation",
      label: "Valuation",
      ok: hasNum(f?.pe) || hasNum(row?.pe),
      hint: "Trailing P/E on the company card. Industry P/E is separate.",
    },
    {
      id: "quality",
      label: "Quality",
      ok: hasNum(f?.roce) || hasNum(row?.roce) || (hasNum(f?.roe || row?.roe) && hasNum(f?.de ?? row?.de)),
      hint: "ROCE, or ROE plus debt/equity, from the company card.",
    },
    {
      id: "peers",
      label: "Peer data",
      ok: (input.peerCount ?? 0) >= 2,
      hint: "Curated business-line peers with a live print. Sector padding is not used.",
    },
  ];

  const nOk = buckets.filter((b) => b.ok).length;
  const nAll = buckets.length;
  const pct = Math.round((nOk / nAll) * 100);
  const level: CoverageLevel = pct >= 75 ? "covered" : pct >= 40 ? "partial" : "insufficient";
  return { level, pct, nOk, nAll, buckets };
}

export function coverageLabel(level: CoverageLevel) {
  if (level === "covered") return "Covered";
  if (level === "partial") return "Partial";
  return "Insufficient";
}

/** Material P/E disagreement between the company card and the market print. */
export function peDiscrepancy(card: number | null | undefined, market: number | null | undefined) {
  const a = card != null && Number.isFinite(card) && card > 0 ? card : null;
  const b = market != null && Number.isFinite(market) && market > 0 ? market : null;
  if (a == null || b == null) return null;
  const rel = Math.abs(a - b) / Math.min(a, b);
  if (rel < 0.2 || Math.abs(a - b) < 5) return null;
  return {
    metric: "P/E",
    card: a,
    market: b,
    note: "P/E differs between the company card and the market print. The card is used for screens.",
  };
}
