/** Overlay a live quote print onto screener / list rows. */

import type { Quote } from "./types.ts";

export function bareLive(symbol: string) {
  return String(symbol || "")
    .replace(/\.(NS|BO)$/i, "")
    .trim()
    .toUpperCase();
}

/** Portfolio + watch first, then movers. Cap so the quote poll stays snappy. */
export function pickLiveSymbols(
  port: string[],
  watch: string[],
  up: string[],
  down: string[],
  cap = 36,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    const k = bareLive(s);
    if (!k || seen.has(k) || out.length >= cap) return;
    seen.add(k);
    out.push(k);
  };
  for (const s of port) push(s);
  for (const s of watch) push(s);
  for (const s of up) push(s);
  for (const s of down) push(s);
  return out;
}

export function overlayQuotes<T extends { symbol: string; price: number; changePct: number }>(
  rows: T[],
  quotes: Quote[] | undefined | null,
): T[] {
  if (!quotes?.length) return rows;
  const map = new Map<string, Quote>();
  for (const q of quotes) {
    if (!(q.price > 0) || q.error) continue;
    map.set(bareLive(q.symbol), q);
    map.set(bareLive(q.input), q);
  }
  return rows.map((r) => {
    const q = map.get(bareLive(r.symbol));
    if (!q) return r;
    return { ...r, price: q.price, changePct: q.changePct };
  });
}
