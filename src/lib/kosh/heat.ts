/** Sector heat groups. "Other" is a catch-all — collapse and cap it. */

import type { ScreenRow } from "./types.ts";

export type HeatGroup = {
  sector: string;
  rows: ScreenRow[];
  total: number;
  hidden: number;
  collapseDefault: boolean;
  avg: number;
};

export function isOtherSector(sector: string) {
  return /^other$/i.test(String(sector || "").trim());
}

/** Cap the Other bucket by |day move| so the page is not a wall of unnamed names. */
export function heatGroups(rows: ScreenRow[], otherCap = 40): HeatGroup[] {
  const groups = new Map<string, ScreenRow[]>();
  for (const r of rows) {
    const key = r.sector || "Other";
    const g = groups.get(key) || [];
    g.push(r);
    groups.set(key, g);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sector, list]) => {
      const sorted = list.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
      const other = isOtherSector(sector);
      const shown = other ? sorted.slice(0, otherCap) : sorted;
      const avg = list.length ? list.reduce((s, r) => s + r.changePct, 0) / list.length : 0;
      return {
        sector,
        rows: shown,
        total: list.length,
        hidden: Math.max(0, list.length - shown.length),
        collapseDefault: other,
        avg,
      };
    });
}
