/** Fixed Terminal chart heights. No freeform drag — that fights trackpad scroll. */

export const TERM_HEIGHT = {
  compact: 420,
  standard: 560,
  tall: 720,
} as const;

export type TermHeightName = keyof typeof TERM_HEIGHT;

const CHOICES = [TERM_HEIGHT.compact, TERM_HEIGHT.standard, TERM_HEIGHT.tall] as const;

export function snapTermHeight(n: number | null | undefined): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return TERM_HEIGHT.standard;
  return CHOICES.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best));
}

export function termHeightName(n: number | null | undefined): TermHeightName {
  const h = snapTermHeight(n);
  if (h === TERM_HEIGHT.compact) return "compact";
  if (h === TERM_HEIGHT.tall) return "tall";
  return "standard";
}
