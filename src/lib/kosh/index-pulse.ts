/** Sectoral-index pulse from one verified session. Missing prints are left out of the average. */

export type PulsePoint = { name: string; pct: number };

export type IndexPulse = {
  strongest: PulsePoint;
  weakest: PulsePoint;
  advancing: number;
  declining: number;
  unchanged: number;
  total: number;
  average: number;
  gap: number;
};

export function indexPulse(rows: { name: string; pct: number | null | undefined }[]): IndexPulse | null {
  const valid: PulsePoint[] = [];
  for (const row of rows) {
    if (row.pct == null || !Number.isFinite(row.pct)) continue;
    valid.push({ name: row.name, pct: row.pct });
  }
  if (!valid.length) return null;
  const sorted = valid.slice().sort((a, b) => b.pct - a.pct);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const advancing = valid.filter((row) => row.pct > 0).length;
  const declining = valid.filter((row) => row.pct < 0).length;
  const unchanged = valid.length - advancing - declining;
  const average = valid.reduce((sum, row) => sum + row.pct, 0) / valid.length;
  return {
    strongest,
    weakest,
    advancing,
    declining,
    unchanged,
    total: valid.length,
    average,
    gap: strongest.pct - weakest.pct,
  };
}
