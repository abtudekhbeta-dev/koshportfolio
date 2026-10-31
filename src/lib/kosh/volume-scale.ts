/** Height of one volume bar in a fixed pane.

Price scale is intentionally not an argument. Linear and logarithmic price
modes must not change this number, the pane height, or the volume values.
*/
export function volumeBarPx(volume: number, maxVolume: number, panePx: number): number {
  const pane = Number.isFinite(panePx) ? Math.max(0, panePx) : 0;
  const cap = Number.isFinite(maxVolume) && maxVolume > 0 ? maxVolume : 1;
  const v = Number.isFinite(volume) && volume > 0 ? volume : 0;
  if (pane === 0 || v === 0) return 0;
  return Math.max(1, (v / cap) * pane);
}
