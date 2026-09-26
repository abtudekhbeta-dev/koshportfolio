/** Viewport math for cursor-anchored zoom, pan, reset, and latest. Pure — no DOM. */

export type Viewport = { start: number; count: number };

export function zoomAround(
  view: Viewport,
  nAll: number,
  anchorIndex: number,
  zoomIn: boolean,
  minCount = 20,
): Viewport {
  if (nAll < 1) return { start: 0, count: 1 };
  const factor = zoomIn ? 0.82 : 1.18;
  const nextCount = Math.max(Math.min(minCount, nAll), Math.min(nAll, Math.round(Math.max(1, view.count) * factor)));
  const anchor = Math.max(0, Math.min(view.count, anchorIndex));
  const frac = view.count <= 1 ? 0 : anchor / view.count;
  const center = view.start + anchor;
  const nextStart = Math.max(0, Math.min(nAll - nextCount, Math.round(center - frac * nextCount)));
  return { start: nextStart, count: nextCount };
}

export function panBy(view: Viewport, nAll: number, deltaBars: number): Viewport {
  const count = Math.max(1, Math.min(view.count, nAll || 1));
  const start = Math.max(0, Math.min(Math.max(0, nAll - count), view.start + deltaBars));
  return { start, count };
}

/** Default window: latest bars at the right edge. Does not wipe drawings or indicators. */
export function resetView(nAll: number, preferred: number): Viewport {
  const count = Math.min(Math.max(1, nAll), Math.max(1, preferred));
  return { start: Math.max(0, nAll - count), count };
}

export function atLatest(view: Viewport, nAll: number): boolean {
  if (nAll <= 0) return true;
  return view.start + view.count >= nAll;
}
