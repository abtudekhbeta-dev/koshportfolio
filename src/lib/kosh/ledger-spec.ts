/** Ledger chart intervals Yahoo Finance can actually return. 3m and 4H are resampled. */

export type LedgerInterval = {
  id: string;
  label: string;
  yahoo: string;
  /** Provider window. Intraday history cannot be stretched past this. */
  yahooRange: string;
  intra: boolean;
  resample: number;
  /** Shown when the bars are not a native provider interval. */
  note?: string;
};

export const LEDGER_INTERVALS: LedgerInterval[] = [
  { id: "1m", label: "1m", yahoo: "1m", yahooRange: "5d", intra: true, resample: 0 },
  {
    id: "3m",
    label: "3m",
    yahoo: "1m",
    yahooRange: "5d",
    intra: true,
    resample: 180,
    note: "3-minute bars are resampled from 1-minute bars. Yahoo does not serve a native 3-minute series.",
  },
  { id: "5m", label: "5m", yahoo: "5m", yahooRange: "5d", intra: true, resample: 0 },
  { id: "15m", label: "15m", yahoo: "15m", yahooRange: "1mo", intra: true, resample: 0 },
  { id: "30m", label: "30m", yahoo: "30m", yahooRange: "1mo", intra: true, resample: 0 },
  { id: "1H", label: "1H", yahoo: "60m", yahooRange: "3mo", intra: true, resample: 0 },
  {
    id: "4H",
    label: "4H",
    yahoo: "60m",
    yahooRange: "6mo",
    intra: true,
    resample: 14400,
    note: "4-hour bars are resampled from 1-hour bars. Yahoo does not serve a native 4-hour series.",
  },
  { id: "1D", label: "1D", yahoo: "1d", yahooRange: "max", intra: false, resample: 0 },
  { id: "1W", label: "1W", yahoo: "1wk", yahooRange: "max", intra: false, resample: 0 },
  { id: "1M", label: "1M", yahoo: "1mo", yahooRange: "max", intra: false, resample: 0 },
];

export const LEDGER_RANGES = [
  { id: "1M", label: "1M" },
  { id: "3M", label: "3M" },
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y" },
  { id: "5Y", label: "5Y" },
  { id: "All", label: "All" },
] as const;

export type LedgerRangeId = (typeof LEDGER_RANGES)[number]["id"];

export type LedgerChartType = "candle" | "bar" | "line" | "area";

export type LedgerTool =
  | "cursor"
  | "crosshair"
  | "trend"
  | "ray"
  | "hline"
  | "vline"
  | "rect"
  | "fib"
  | "measure"
  | "text";

export function intervalSpec(id: string): LedgerInterval {
  return LEDGER_INTERVALS.find((row) => row.id === id) || LEDGER_INTERVALS.find((row) => row.id === "1D")!;
}

/** Date-range shortcuts apply only where the fetch already holds that history. */
export function rangesFor(intervalId: string): LedgerRangeId[] {
  const spec = intervalSpec(intervalId);
  if (spec.intra) return [];
  if (spec.id === "1M") return ["1Y", "5Y", "All"];
  if (spec.id === "1W") return ["6M", "1Y", "5Y", "All"];
  return ["1M", "3M", "6M", "YTD", "1Y", "5Y", "All"];
}

export function clampRange(intervalId: string, range: string): LedgerRangeId {
  const allowed = rangesFor(intervalId);
  if (allowed.includes(range as LedgerRangeId)) return range as LedgerRangeId;
  if (allowed.includes("1Y")) return "1Y";
  return allowed[allowed.length - 1] || "All";
}

export function intradayWindow(spec: LedgerInterval): string {
  if (spec.id === "1m" || spec.id === "3m" || spec.id === "5m") return "about 5 sessions";
  if (spec.id === "15m" || spec.id === "30m") return "about 1 month";
  if (spec.id === "1H") return "about 3 months";
  if (spec.id === "4H") return "about 6 months";
  return "the provider window";
}
