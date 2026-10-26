import type { ClosePrint } from "./rrg.ts";

/** A verified corporate action. A close-to-close price ratio is not a factor. */
export type CorporateAction = {
  date: string;
  type: string;
  ratioNum?: number | null;
  ratioDen?: number | null;
  faceFrom?: number | null;
  faceTo?: number | null;
  /**
   * A published adjustment ratio, such as an exchange factor.
   * Ignored unless factorBasis is "published-ratio".
   * Never set this from the two session closes.
   */
  priceFactor?: number | null;
  factorBasis?: "published-ratio" | "close-ratio" | null;
  subject?: string | null;
};

/**
 * Predecessor series that must not cross a demerger when the action is recorded
 * on the successor symbol. This is not an inferred price factor.
 */
export const VERIFIED_IDENTITY_BREAKS: { symbol: string; date: string; reason: string }[] = [
  {
    symbol: "TATAMOTORS",
    date: "2025-10-14",
    reason: "A demerger is recorded on TMPV on 2025-10-14. No factor is applied. Tata Motors closes on and after that date are left out of its analytical series.",
  },
];

export type AppliedFactor = { date: string; type: string; factor: number; subject: string };

export type AdjustResult = {
  rows: ClosePrint[];
  applied: AppliedFactor[];
  dividendsIgnored: number;
  rightsIgnored: string[];
  breaks: { date: string; reason: string }[];
  flagged: { date: string; type: string; subject: string }[];
  unexplained: { date: string; change: number }[];
  basis: "price-return-split-bonus";
};

const INFERRED = /derived from an unexplained|no exchange action was published|previous close/i;

/** True when the text itself says the factor was read off the price jump. */
export function inferredFactorSubject(subject: string | null | undefined) {
  return INFERRED.test(subject || "");
}

/** True when the extract was already adjusted and must not be adjusted again. */
export function repeatAdjustment(adjustment: string | null | undefined) {
  return Boolean(adjustment && adjustment !== "raw-unadjusted");
}

export function bonusRatio(action: CorporateAction): number | null {
  const num = action.ratioNum ?? null;
  const den = action.ratioDen ?? null;
  if (num == null || den == null || num <= 0 || den <= 0) return null;
  return 1 / (1 + num / den);
}

export function faceRatio(action: CorporateAction): number | null {
  const from = action.faceFrom ?? null;
  const to = action.faceTo ?? null;
  if (from == null || to == null || from <= 0 || to <= 0 || from === to) return null;
  return to / from;
}

/**
 * Bonus N:M and a face-value split on the same action are one economic event.
 * The stored factor is the product. Either piece alone leaves a gap.
 * A subject that admits the factor was inferred from the closes contributes nothing.
 */
export function actionFactor(action: CorporateAction): number | null {
  if (inferredFactorSubject(action.subject)) return null;
  const type = action.type.toLowerCase();
  const explicit = action.priceFactor ?? null;
  if ((type === "demerger" || type === "rights") && action.factorBasis === "published-ratio" && explicit != null && explicit > 0 && explicit < 1) {
    return explicit;
  }
  if (type !== "bonus" && type !== "split") return null;
  const bonus = bonusRatio(action);
  const face = faceRatio(action);
  if (bonus != null && face != null) return bonus * face;
  if (type === "bonus") return bonus;
  return face ?? bonus;
}

const BONUS_TEXT = /bonus\s+(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/i;
const FACE_TEXT = /from\s+rs\.?\s*(\d+(?:\.\d+)?).{0,80}?to\s+(?:rs\.?|re\.?)\s*(\d+(?:\.\d+)?)/i;

/** Recover a compound bonus and face split from the action sentence when the fields were already collapsed. */
export function compoundFromSubject(subject: string | null | undefined): { bonus: number; face: number; combined: number } | null {
  if (!subject || inferredFactorSubject(subject)) return null;
  const bonus = BONUS_TEXT.exec(subject);
  const face = FACE_TEXT.exec(subject);
  if (!bonus || !face) return null;
  const bonusFactor = 1 / (1 + Number(bonus[1]) / Number(bonus[2]));
  const faceFactor = Number(face[2]) / Number(face[1]);
  if (!(bonusFactor > 0 && bonusFactor < 1 && faceFactor > 0 && faceFactor < 1)) return null;
  return { bonus: bonusFactor, face: faceFactor, combined: bonusFactor * faceFactor };
}

/**
 * Backward price-return adjustment. The newest close is unchanged.
 * Cash dividends are not adjusted, so the series stays comparable with a price index.
 * A demerger or rights issue is flagged and left unchanged unless it carries a published ratio.
 * That ratio is not read from the two session closes.
 */
export function adjustPriceReturn(rows: ClosePrint[], actions: CorporateAction[], breaks: { date: string; reason: string }[] = []): AdjustResult {
  const ordered = [...rows].filter((row) => Number.isFinite(row.close) && row.close > 0).sort((a, b) => a.date.localeCompare(b.date));
  const usedBreaks: { date: string; reason: string }[] = [];
  let kept = ordered;
  for (const point of [...breaks].sort((a, b) => a.date.localeCompare(b.date))) {
    const before = kept.some((row) => row.date < point.date);
    const after = kept.some((row) => row.date >= point.date);
    if (before && after) {
      kept = kept.filter((row) => row.date < point.date);
      usedBreaks.push(point);
    }
  }
  const flagged = actions
    .filter((action) => ["demerger", "rights", "merger"].includes(action.type.toLowerCase()) || inferredFactorSubject(action.subject))
    .map((action) => ({ date: action.date, type: action.type, subject: action.subject || "" }));
  const applied: AppliedFactor[] = [];
  const seen = new Set<string>();
  const factors = actions
    .map((action) => ({ action, factor: actionFactor(action) }))
    .filter((item): item is { action: CorporateAction; factor: number } => item.factor != null && item.factor > 0 && item.factor !== 1)
    .sort((a, b) => b.action.date.localeCompare(a.action.date));
  const adjusted = kept.map((row) => ({ date: row.date, close: row.close }));
  for (const item of factors) {
    const key = `${item.action.date}:${item.action.type}:${item.factor}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let touched = false;
    for (const row of adjusted) {
      if (row.date < item.action.date) {
        row.close *= item.factor;
        touched = true;
      }
    }
    if (touched) applied.push({ date: item.action.date, type: item.action.type, factor: item.factor, subject: item.action.subject || "" });
  }
  const unexplained: { date: string; change: number }[] = [];
  for (let i = 1; i < adjusted.length; i++) {
    const prev = adjusted[i - 1]?.close ?? 0;
    const close = adjusted[i]?.close ?? 0;
    if (prev <= 0) continue;
    const change = close / prev - 1;
    if (Math.abs(change) > 0.25) unexplained.push({ date: adjusted[i]!.date, change });
  }
  return {
    rows: adjusted,
    applied,
    dividendsIgnored: actions.filter((action) => action.type.toLowerCase() === "dividend").length,
    rightsIgnored: actions.filter((action) => action.type.toLowerCase() === "rights").map((action) => action.date),
    breaks: usedBreaks,
    flagged,
    unexplained,
    basis: "price-return-split-bonus",
  };
}
