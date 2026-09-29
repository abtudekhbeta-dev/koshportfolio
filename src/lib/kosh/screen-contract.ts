/** Columns actually on the screener, not a hand-trimmed fundamentals subset. */

export type ScreenField = { key: string; label: string; kind: "fund" | "market" };

export const SCREEN_FUND_FIELDS: ScreenField[] = [
  { key: "pe", label: "P/E", kind: "fund" },
  { key: "pb", label: "P/B", kind: "fund" },
  { key: "roe", label: "ROE", kind: "fund" },
  { key: "roce", label: "ROCE", kind: "fund" },
  { key: "opm", label: "OPM", kind: "fund" },
  { key: "de", label: "D/E", kind: "fund" },
  { key: "promoters", label: "Promoter holding", kind: "fund" },
  { key: "mcapCr", label: "Market cap", kind: "fund" },
  { key: "salesYoY", label: "Sales growth", kind: "fund" },
  { key: "profitYoY", label: "Profit growth", kind: "fund" },
  { key: "divYield", label: "Dividend yield", kind: "fund" },
];

const EXTRA: ScreenField[] = [
  { key: "peg", label: "PEG", kind: "fund" },
  { key: "eps", label: "EPS", kind: "fund" },
  { key: "book", label: "Book value", kind: "fund" },
  { key: "interestCover", label: "Interest coverage", kind: "fund" },
  { key: "cfoPat", label: "CFO/PAT", kind: "fund" },
  { key: "pledge", label: "Pledge", kind: "fund" },
  { key: "salesCagr3", label: "Sales CAGR 3Y", kind: "fund" },
  { key: "profitCagr5", label: "Profit CAGR 5Y", kind: "fund" },
  { key: "fii", label: "FII", kind: "fund" },
  { key: "dii", label: "DII", kind: "fund" },
];

const MARKET: ScreenField[] = [
  { key: "ret3m", label: "3M", kind: "market" },
  { key: "ret1y", label: "1Y", kind: "market" },
  { key: "offHigh", label: "vs 52w high", kind: "market" },
  { key: "rsi", label: "RSI 14", kind: "market" },
  { key: "volRatio", label: "Vol vs 20d avg", kind: "market" },
];

const VCP: ScreenField[] = [
  { key: "vcpN", label: "Contractions", kind: "market" },
  { key: "vcpLastPct", label: "Last contraction", kind: "market" },
  { key: "vcpDays", label: "Days", kind: "market" },
  { key: "vcpVolX", label: "Volume multiple", kind: "market" },
  { key: "vcpPivot", label: "Pivot", kind: "market" },
  { key: "offHigh", label: "vs 52w high", kind: "market" },
  { key: "rsi", label: "RSI 14", kind: "market" },
];

/** The completion contract for the screen the user is looking at. */
export function displayedFields(id: string, cols: Record<string, boolean> = {}): ScreenField[] {
  if (id === "stake") {
    return [
      { key: "fii", label: "FII", kind: "fund" },
      { key: "fiiDelta", label: "FII change", kind: "market" },
      { key: "dii", label: "DII", kind: "fund" },
      { key: "diiDelta", label: "DII change", kind: "market" },
      { key: "ret1y", label: "1Y", kind: "market" },
    ];
  }
  if (id === "vcp" || id === "vcpbo") return VCP;
  return [...SCREEN_FUND_FIELDS, ...EXTRA.filter((c) => cols[c.key]), ...MARKET];
}

export function fundLabels(fields: ScreenField[]): string[] {
  return fields.filter((f) => f.kind === "fund").map((f) => f.label);
}

export function marketKeys(fields: ScreenField[]): string[] {
  return fields.filter((f) => f.kind === "market").map((f) => f.key);
}
