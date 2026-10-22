/** Cash-market flow maths. Missing gross figures stay missing; they are not treated as zero. */

import type { FiidiiRow } from "./types.ts";

export type FlowPeriod = "daily" | "monthly" | "yearly";

export type FlowBucket = {
  key: string;
  label: string;
  fiiNet: number;
  diiNet: number;
  days: number;
};

export function impliedNet(buy: number, sell: number): number | null {
  if (!Number.isFinite(buy) || !Number.isFinite(sell)) return null;
  if (buy === 0 && sell === 0) return null;
  return buy - sell;
}

/** Gross is usable only when buy or sell is present and agrees with the reported net. */
export function grossOk(buy: number, sell: number, net: number, tol = 1): boolean {
  const implied = impliedNet(buy, sell);
  if (implied == null) return false;
  return Math.abs(implied - net) <= Math.max(tol, Math.abs(net) * 0.01);
}

function periodKey(date: string, period: "monthly" | "yearly"): string | null {
  const iso = date.match(/^(\d{4})-(\d{2})/);
  if (iso) return period === "yearly" ? iso[1] : `${iso[1]}-${iso[2]}`;
  const dmy = date.match(/(\d{1,2})[-\s/]([A-Za-z]{3}|\d{1,2})[-\s/](\d{4})/);
  if (!dmy) return null;
  if (period === "yearly") return dmy[3];
  const mon = dmy[2];
  if (/^\d+$/.test(mon)) return `${dmy[3]}-${mon.padStart(2, "0")}`;
  const idx = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(mon.slice(0, 3).toLowerCase());
  if (idx < 0) return null;
  return `${dmy[3]}-${String(idx + 1).padStart(2, "0")}`;
}

/** Sum of daily nets already on file. This is not an official monthly or yearly print. */
export function bucketFlows(rows: FiidiiRow[], period: "monthly" | "yearly"): FlowBucket[] {
  const map = new Map<string, FlowBucket>();
  for (const row of rows) {
    if (!row?.date || !Number.isFinite(row.fiiNet) || !Number.isFinite(row.diiNet)) continue;
    const key = periodKey(row.date, period);
    if (!key) continue;
    const cur = map.get(key) || { key, label: key, fiiNet: 0, diiNet: 0, days: 0 };
    cur.fiiNet += row.fiiNet;
    cur.diiNet += row.diiNet;
    cur.days += 1;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
}
