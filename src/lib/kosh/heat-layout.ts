import { performancePaint } from "./heat-contrast.ts";

/** Readable weight mosaic. Area follows index share; height grows so every name fits. */

export type PxBox = { i: number; x: number; y: number; w: number; h: number };

export function packWeightRows(
  weights: number[],
  width: number,
  minW = 96,
  minH = 56,
): { height: number; tiles: PxBox[]; floored: number } {
  const widthPx = Math.max(160, Math.floor(width));
  const cellW = Math.min(minW, widthPx);
  const items = weights
    .map((weight, i) => ({ i, weight: weight > 0 ? weight : 0 }))
    .filter((row) => row.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  if (!items.length) return { height: 0, tiles: [], floored: 0 };
  const sum = items.reduce((total, row) => total + row.weight, 0);
  const fits = (row: { weight: number }[]) => {
    const rowWeight = row.reduce((total, item) => total + item.weight, 0);
    return row.every((item) => (item.weight / rowWeight) * widthPx >= cellW - 0.5);
  };
  const rows: { i: number; weight: number }[][] = [];
  let current: { i: number; weight: number }[] = [];
  for (const item of items) {
    if (!current.length) {
      current = [item];
      continue;
    }
    if (fits(current.concat(item))) current = current.concat(item);
    else {
      rows.push(current);
      current = [item];
    }
  }
  if (current.length) rows.push(current);
  if (rows.length >= 2 && rows[rows.length - 1].length === 1) {
    const merged = rows[rows.length - 2].concat(rows[rows.length - 1]);
    const rowWeight = merged.reduce((total, item) => total + item.weight, 0);
    const ok = merged.every((item) => (item.weight / rowWeight) * widthPx >= Math.min(72, widthPx));
    if (ok) rows.splice(rows.length - 2, 2, merged);
  }
  const fracs = rows.map((row) => row.reduce((total, item) => total + item.weight, 0) / sum);
  const minFrac = Math.min(...fracs);
  const needed = minH / Math.max(minFrac, 1e-6);
  const cap = Math.max(720, widthPx * 1.45, rows.length * minH);
  const canvas = Math.min(needed, cap);
  const tiles: PxBox[] = [];
  let y = 0;
  let floored = 0;
  rows.forEach((row, index) => {
    const raw = fracs[index] * canvas;
    const h = Math.max(minH, raw);
    if (h > raw + 0.5) floored += row.length;
    const rowWeight = row.reduce((total, item) => total + item.weight, 0);
    let x = 0;
    row.forEach((item, itemIndex) => {
      const w = itemIndex === row.length - 1 ? widthPx - x : (item.weight / rowWeight) * widthPx;
      tiles.push({ i: item.i, x, y, w: Math.max(0, w), h });
      x += w;
    });
    y += h;
  });
  return { height: y, tiles, floored };
}

/** Light green, light red, or neutral. Ink is always near-black. Null is missing data, not a real zero. */
export function heatPaint(pct: number | null): { background: string; color: string } {
  return performancePaint(pct, { strong: 1.25, mid: 0.4 });
}
