/** Period return from verified index closes. Timestamps are unix seconds. */

export type IndexReturnState = "ok" | "no-history" | "short-history" | "no-quote" | "failed";

export function lookbackReturn(
  bars: { t: number; c: number }[] | undefined,
  days: number,
): { pct: number | null; state: Exclude<IndexReturnState, "no-quote" | "failed"> } {
  const rows = (bars || []).filter((b) => b && b.c > 0 && b.t > 0).sort((a, b) => a.t - b.t);
  if (rows.length < 2) return { pct: null, state: "no-history" };
  const last = rows[rows.length - 1];
  const boundary = last.t - days * 86400;
  let prev: { t: number; c: number } | null = null;
  for (const row of rows) {
    if (row.t <= boundary) prev = row;
    else break;
  }
  if (!prev || !(prev.c > 0) || prev.t === last.t) return { pct: null, state: "short-history" };
  return { pct: ((last.c - prev.c) / prev.c) * 100, state: "ok" };
}

export function indexReturnLabel(state: IndexReturnState): string {
  if (state === "no-history") return "No daily history";
  if (state === "short-history") return "Not enough history";
  if (state === "no-quote") return "No quote";
  if (state === "failed") return "History failed";
  return "";
}
