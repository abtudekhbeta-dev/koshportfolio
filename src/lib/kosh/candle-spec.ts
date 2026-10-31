/** Interval and lookback map for the candle chart. Kept out of the chart module so a page can ask for bars without downloading the chart. */

export const INTERVALS = [
  { id: "1m", yahoo: "1m", intra: true, label: "1m" },
  { id: "5m", yahoo: "5m", intra: true, label: "5m" },
  { id: "15m", yahoo: "15m", intra: true, label: "15m" },
  { id: "30m", yahoo: "30m", intra: true, label: "30m" },
  { id: "1H", yahoo: "60m", intra: true, label: "1H" },
  { id: "1D", yahoo: "1d", intra: false, label: "1D" },
  { id: "1W", yahoo: "1wk", intra: false, label: "1W" },
  { id: "1M", yahoo: "1mo", intra: false, label: "1M" },
] as const;

export const LOOKBACKS = [
  { id: "1D", range: "1d", label: "1D" },
  { id: "5D", range: "5d", label: "5D" },
  { id: "1M", range: "1mo", label: "1M" },
  { id: "3M", range: "3mo", label: "3M" },
  { id: "6M", range: "6mo", label: "6M" },
  { id: "YTD", range: "ytd", label: "YTD" },
  { id: "1Y", range: "1y", label: "1Y" },
  { id: "2Y", range: "2y", label: "2Y" },
  { id: "3Y", range: "5y", label: "3Y" },
  { id: "5Y", range: "5y", label: "5Y" },
  { id: "10Y", range: "10y", label: "10Y" },
  { id: "MAX", range: "max", label: "MAX" },
] as const;

const ALLOWED: Record<string, string[]> = {
  "1m": ["1D", "5D"],
  "5m": ["1D", "5D", "1M"],
  "15m": ["1D", "5D", "1M"],
  "30m": ["1D", "5D", "1M"],
  "1H": ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y"],
  "1D": ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "MAX"],
  "1W": ["1M", "3M", "6M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "MAX"],
  "1M": ["1Y", "2Y", "3Y", "5Y", "10Y", "MAX"],
};

export function clampLookback(interval: string, lookback: string): string {
  const allowed = ALLOWED[interval] || ALLOWED["1D"];
  if (allowed.includes(lookback)) return lookback;
  return allowed[allowed.length - 1];
}

export function intervalForLookback(interval: string, lookback: string): string {
  const allowed = ALLOWED[interval] || ALLOWED["1D"];
  if (allowed.includes(lookback)) return interval;
  if ((ALLOWED["1D"] || []).includes(lookback)) return "1D";
  if ((ALLOWED["1W"] || []).includes(lookback)) return "1W";
  if ((ALLOWED["1M"] || []).includes(lookback)) return "1M";
  return "1D";
}

export function fetchSpec(interval: string) {
  const iv = INTERVALS.find((x) => x.id === interval) || INTERVALS[5];
  const allowed = ALLOWED[interval] || ALLOWED["1D"];
  const maxLb = allowed[allowed.length - 1];
  const lk = LOOKBACKS.find((x) => x.id === maxLb) || LOOKBACKS[5];
  return { range: lk.range, interval: iv.yahoo, intra: iv.intra, intervalId: iv.id };
}

export function rangeQuery(lookback: string, interval: string) {
  const lb = clampLookback(interval, lookback);
  const spec = fetchSpec(interval);
  return { ...spec, lookback: lb };
}
