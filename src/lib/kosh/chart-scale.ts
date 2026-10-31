/** Price scale and volume pane are separate.
Logarithmic mode is only legal for the price series. Volume and oscillators stay linear.
Pane heights do not take a price-scale argument, so linear ↔ log cannot resize volume.
*/

export type SeriesScaleKind = "price" | "volume" | "oscillator";

export function seriesScaleMode(kind: SeriesScaleKind, logPrice: boolean): "logarithmic" | "normal" {
  return kind === "price" && logPrice ? "logarithmic" : "normal";
}

/** Pixel heights for the price pane and each pane under it. Volume is pane index 1 when present. */
export function volumePaneHeights(totalPx: number, paneCount: number): number[] {
  const total = Number.isFinite(totalPx) && totalPx > 0 ? totalPx : 1;
  const count = Number.isFinite(paneCount) ? Math.max(1, Math.floor(paneCount)) : 1;
  if (count === 1) return [total];
  const sub = Math.min(108, Math.max(72, Math.floor(total * 0.16)));
  const main = Math.max(140, total - sub * (count - 1));
  return [main, ...Array.from({ length: count - 1 }, () => sub)];
}
