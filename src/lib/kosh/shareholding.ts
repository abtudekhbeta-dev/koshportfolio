/** Latest vs previous quarter FII / DII stake. Reported shareholding, not daily FPI flow. */

import { parsePeriod } from "./fin-series.ts";
import type { ShPoint } from "./types.ts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type StakeDelta = {
  fii: number | null;
  fiiPrev: number | null;
  fiiDelta: number | null;
  dii: number | null;
  diiPrev: number | null;
  diiDelta: number | null;
  from: string;
  to: string;
  label: string;
};

export function formatShPeriod(period: string): string {
  const p = parsePeriod(period);
  if (!p) return String(period || "").slice(0, 12);
  const mon = MONTHS[p.m - 1] || "";
  return `${mon} ’${String(p.y).slice(-2)}`;
}

export function sortShareholding(rows: ShPoint[]): ShPoint[] {
  return [...(rows || [])].sort((a, b) => {
    const pa = parsePeriod(a.period);
    const pb = parsePeriod(b.period);
    if (!pa && !pb) return String(a.period).localeCompare(String(b.period));
    if (!pa) return 1;
    if (!pb) return -1;
    return pa.t - pb.t;
  });
}

function delta(prev: number | null, last: number | null): number | null {
  if (prev == null || last == null || !Number.isFinite(prev) || !Number.isFinite(last)) return null;
  return last - prev;
}

export function stakeDelta(rows: ShPoint[] | null | undefined): StakeDelta | null {
  const sorted = sortShareholding((rows || []).filter((r) => r && (r.fii != null || r.dii != null)));
  if (sorted.length < 2) return null;
  const prev = sorted[sorted.length - 2];
  const last = sorted[sorted.length - 1];
  const from = formatShPeriod(prev.period);
  const to = formatShPeriod(last.period);
  if (from === to) return null;
  return {
    fii: last.fii,
    fiiPrev: prev.fii,
    fiiDelta: delta(prev.fii, last.fii),
    dii: last.dii,
    diiPrev: prev.dii,
    diiDelta: delta(prev.dii, last.dii),
    from,
    to,
    label: `${to} vs ${from}`,
  };
}

export function stakeUp(d: StakeDelta | null): boolean {
  if (!d) return false;
  return (d.fiiDelta != null && d.fiiDelta > 0) || (d.diiDelta != null && d.diiDelta > 0);
}
