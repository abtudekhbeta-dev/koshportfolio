/** Drawings are keyed to the instrument, never the chart interval. */

export function instrumentDrawKey(symbol: string): string {
  const raw = String(symbol || "").trim();
  const base = raw.includes(":") ? raw.slice(0, raw.indexOf(":")) : raw;
  return base.toUpperCase().replace(/\.(NS|BO)$/i, "");
}

/** Union interval buckets (`TCS:1D`, `TCS:1m`) into one instrument list. Same id is kept once. */
export function mergeDrawBuckets<T extends { id: string }>(raw: Record<string, T[]> | undefined): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const [key, rows] of Object.entries(raw || {})) {
    if (!rows?.length) continue;
    const sym = instrumentDrawKey(key);
    if (!sym) continue;
    const prev = out[sym] || [];
    const seen = new Set(prev.map((row) => row.id));
    const merged = prev.slice();
    for (const row of rows) {
      if (!row?.id || seen.has(row.id)) continue;
      seen.add(row.id);
      merged.push(row);
    }
    out[sym] = merged.slice(0, 80);
  }
  return out;
}

/**
 * Map an absolute bar timestamp onto the x scale.
 * Interpolates between bars and extrapolates past the loaded range using the
 * neighbouring bar spacing. Does not snap a timestamp onto a candle index.
 */
export function projectTimeToX(t: number, src: { t: number }[], xAt: (i: number) => number): number {
  if (!src.length) return xAt(0);
  if (src.length === 1) return xAt(0);
  const last = src.length - 1;
  if (t < src[0].t) {
    const dt = src[1].t - src[0].t || 1;
    return xAt(0) + ((t - src[0].t) / dt) * (xAt(1) - xAt(0));
  }
  if (t > src[last].t) {
    const dt = src[last].t - src[last - 1].t || 1;
    return xAt(last) + ((t - src[last].t) / dt) * (xAt(last) - xAt(last - 1));
  }
  let lo = 0;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (src[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const i = lo;
  if (i <= 0) return xAt(0);
  const a = src[i - 1];
  const b = src[i];
  const f = (t - a.t) / (b.t - a.t || 1);
  return xAt(i - 1) + f * (xAt(i) - xAt(i - 1));
}

/**
 * Inverse of projectTimeToX. xAt must increase with the bar index.
 * A click between candles keeps the absolute timestamp instead of the nearest bar.
 */
export function projectXToTime(x: number, src: { t: number }[], xAt: (i: number) => number): number {
  if (!src.length) return 0;
  if (src.length === 1) return src[0].t;
  const last = src.length - 1;
  const x0 = xAt(0);
  const x1 = xAt(1);
  if (x <= x0) {
    const dx = x1 - x0 || 1;
    return src[0].t + ((x - x0) / dx) * (src[1].t - src[0].t || 1);
  }
  const xLast = xAt(last);
  if (x >= xLast) {
    const dx = xLast - xAt(last - 1) || 1;
    return src[last].t + ((x - xLast) / dx) * (src[last].t - src[last - 1].t || 1);
  }
  let lo = 1;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (xAt(mid) < x) lo = mid + 1;
    else hi = mid;
  }
  const xa = xAt(lo - 1);
  const xb = xAt(lo);
  const f = (x - xa) / (xb - xa || 1);
  return src[lo - 1].t + f * (src[lo].t - src[lo - 1].t);
}
