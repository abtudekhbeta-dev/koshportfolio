/** Shared Nifty and portfolio heatmap fills. Text is always near-black, in both themes. */

export const HEAT_INK = "#142033";

/** Light performance fills. Strong is still clearly green or red, never a dark saturated slab. */
export const HEAT_FILL = {
  missing: "#e7eaef",
  flat: "#e3e7ee",
  upSoft: "#e5f6ec",
  upMid: "#c8edd8",
  upStrong: "#9ed9b6",
  downSoft: "#fdecec",
  downMid: "#f8d4d4",
  downStrong: "#f0b4b4",
} as const;

function channelLuminance(channel: number) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relHex(hex: string) {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG contrast ratio for two #rrggbb colours. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relHex(foreground);
  const b = relHex(background);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

export function inkForRgb(r: number, g: number, b: number): string {
  void r;
  void g;
  void b;
  return HEAT_INK;
}

type Bands = { strong: number; mid: number };

/** Same fills for every performance heatmap. Callers keep their own strong/mild cutoffs. */
export function performancePaint(pct: number | null | undefined, bands: Bands = { strong: 1.25, mid: 0.4 }): { background: string; color: string } {
  const color = HEAT_INK;
  if (pct == null || !Number.isFinite(pct)) return { background: HEAT_FILL.missing, color };
  const abs = Math.abs(pct);
  if (abs < 0.05) return { background: HEAT_FILL.flat, color };
  const up = pct > 0;
  const step = abs >= bands.strong ? "Strong" : abs >= bands.mid ? "Mid" : "Soft";
  const key = `${up ? "up" : "down"}${step}` as keyof typeof HEAT_FILL;
  return { background: HEAT_FILL[key], color };
}

/** Kept so older call sites cannot paint white ink on a performance tile. */
export function movementInk(_pct?: number | null, _strongAt = 1.25): string {
  return HEAT_INK;
}
