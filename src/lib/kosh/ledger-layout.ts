import { clampRange, intervalSpec, type LedgerChartType, type LedgerRangeId } from "./ledger-spec.ts";
import { clampWatchWidth } from "./ledger-chrome.ts";

export const LEDGER_LAYOUT_KEY = "kosh-ledger-terminal-v1";

export type IndKind = "sma" | "ema" | "bb" | "vwap" | "rsi" | "macd" | "atr" | "volume";

export type LedgerInd = {
  id: string;
  kind: IndKind;
  period: number;
  k?: number;
  hidden: boolean;
  color: string;
};

export type DrawKind = "trend" | "ray" | "hline" | "vline" | "rect" | "fib" | "measure" | "text";

export type LedgerDraw = {
  id: string;
  kind: DrawKind;
  t0: number;
  p0: number;
  t1?: number;
  p1?: number;
  text?: string;
  color: string;
  locked: boolean;
  hidden: boolean;
};

export type LedgerLayout = {
  v: 1;
  symbol: string;
  name: string;
  interval: string;
  range: LedgerRangeId;
  chartType: LedgerChartType;
  logScale: boolean;
  watchOpen: boolean;
  indicators: LedgerInd[];
  drawings: Record<string, LedgerDraw[]>;
  drawingsHidden: boolean;
  /** Watchlist column width in pixels. Older saves omit this and keep 286. */
  watchWidth: number;
};

const COLORS = /^#[0-9a-fA-F]{6}$/;
const KINDS = new Set<IndKind>(["sma", "ema", "bb", "vwap", "rsi", "macd", "atr", "volume"]);
const DRAW_KINDS = new Set<DrawKind>(["trend", "ray", "hline", "vline", "rect", "fib", "measure", "text"]);
const CHARTS = new Set<LedgerChartType>(["candle", "bar", "line", "area"]);

export function defaultLedgerLayout(): LedgerLayout {
  return {
    v: 1,
    symbol: "RELIANCE",
    name: "Reliance Industries",
    interval: "1D",
    range: "1Y",
    chartType: "candle",
    logScale: false,
    watchOpen: true,
    indicators: [{ id: "volume", kind: "volume", period: 0, hidden: false, color: "#7f8ea3" }],
    drawings: {},
    drawingsHidden: false,
    watchWidth: 286,
  };
}

export function drawScope(symbol: string, interval: string): string {
  return `${symbol.replace(/\.(NS|BO)$/i, "").toUpperCase()}|${intervalSpec(interval).id}`;
}

export function loadLedgerLayout(raw?: string | null): { layout: LedgerLayout; recovered: boolean } {
  if (raw == null) {
    try {
      raw = typeof localStorage === "undefined" ? null : localStorage.getItem(LEDGER_LAYOUT_KEY);
    } catch {
      return { layout: defaultLedgerLayout(), recovered: false };
    }
  }
  if (!raw) return { layout: defaultLedgerLayout(), recovered: false };
  try {
    return sanitizeLayout(JSON.parse(raw));
  } catch {
    return { layout: defaultLedgerLayout(), recovered: true };
  }
}

export function saveLedgerLayout(layout: LedgerLayout): { ok: boolean } {
  try {
    localStorage.setItem(LEDGER_LAYOUT_KEY, JSON.stringify(layout));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function sanitizeLayout(input: unknown): { layout: LedgerLayout; recovered: boolean } {
  const base = defaultLedgerLayout();
  if (!input || typeof input !== "object") return { layout: base, recovered: true };
  const row = input as Partial<LedgerLayout>;
  if (row.v !== 1) return { layout: base, recovered: true };
  const interval = intervalSpec(typeof row.interval === "string" ? row.interval : "1D").id;
  const symbol = cleanSymbol(row.symbol) || base.symbol;
  const chartType = CHARTS.has(row.chartType as LedgerChartType) ? (row.chartType as LedgerChartType) : "candle";
  const indicators = Array.isArray(row.indicators) ? row.indicators.map(cleanInd).filter((item) => item != null).slice(0, 12) : base.indicators;
  const drawings: Record<string, LedgerDraw[]> = {};
  if (row.drawings && typeof row.drawings === "object") {
    for (const [key, list] of Object.entries(row.drawings)) {
      if (!Array.isArray(list) || key.length > 80) continue;
      const clean = list.map(cleanDraw).filter((item) => item != null).slice(0, 200);
      if (clean.length) drawings[key] = clean;
    }
  }
  const recovered = typeof row.interval === "string" && intervalSpec(row.interval).id !== row.interval;
  return {
    layout: {
      v: 1,
      symbol,
      name: typeof row.name === "string" && row.name.trim() ? row.name.trim().slice(0, 80) : symbol,
      interval,
      range: clampRange(interval, typeof row.range === "string" ? row.range : "1Y"),
      chartType,
      logScale: row.logScale === true,
      watchOpen: row.watchOpen !== false,
      indicators: indicators.length ? (indicators as LedgerInd[]) : base.indicators,
      drawings,
      drawingsHidden: row.drawingsHidden === true,
      watchWidth: clampWatchWidth(typeof row.watchWidth === "number" ? row.watchWidth : 286),
    },
    recovered,
  };
}

function cleanSymbol(value: unknown): string {
  const symbol = String(value || "")
    .trim()
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  if (!/^[\^A-Z0-9._=-]{1,32}$/.test(symbol)) return "";
  return symbol;
}

function cleanInd(value: unknown): LedgerInd | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<LedgerInd>;
  if (!KINDS.has(row.kind as IndKind)) return null;
  const period = Number(row.period);
  return {
    id: String(row.id || row.kind).slice(0, 40),
    kind: row.kind as IndKind,
    period: Number.isFinite(period) ? Math.max(0, Math.min(400, Math.round(period))) : 20,
    k: Number.isFinite(Number(row.k)) ? Number(row.k) : undefined,
    hidden: row.hidden === true,
    color: COLORS.test(String(row.color || "")) ? String(row.color) : "#e6b85c",
  };
}

function cleanDraw(value: unknown): LedgerDraw | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<LedgerDraw>;
  if (!DRAW_KINDS.has(row.kind as DrawKind)) return null;
  const t0 = Number(row.t0);
  const p0 = Number(row.p0);
  if (!Number.isFinite(t0) || !Number.isFinite(p0)) return null;
  const t1 = Number(row.t1);
  const p1 = Number(row.p1);
  return {
    id: String(row.id || "draw").slice(0, 40),
    kind: row.kind as DrawKind,
    t0,
    p0,
    ...(Number.isFinite(t1) ? { t1 } : {}),
    ...(Number.isFinite(p1) ? { p1 } : {}),
    ...(typeof row.text === "string" && row.text.trim() ? { text: row.text.trim().slice(0, 80) } : {}),
    color: COLORS.test(String(row.color || "")) ? String(row.color) : "#4c8dff",
    locked: row.locked === true,
    hidden: row.hidden === true,
  };
}

const SMA_PERIODS = [20, 50, 200];

export function addIndicator(indicators: LedgerInd[], kind: IndKind): LedgerInd[] {
  if (kind !== "sma" && indicators.some((item) => item.kind === kind)) return indicators;
  const period = kind === "sma" ? nextSma(indicators) : kind === "ema" ? 20 : kind === "bb" ? 20 : kind === "rsi" || kind === "atr" ? 14 : 0;
  const color =
    kind === "sma" && period === 50 ? "#7eb6ff" : kind === "sma" && period === 200 ? "#d08bff" : kind === "ema" ? "#9b8af5" : kind === "rsi" ? "#9b8af5" : kind === "volume" ? "#7f8ea3" : "#e6b85c";
  const next: LedgerInd = {
    id: `${kind}-${period || "x"}-${indicators.length + 1}`,
    kind,
    period,
    ...(kind === "bb" ? { k: 2 } : {}),
    hidden: false,
    color,
  };
  return [...indicators, next].slice(0, 12);
}

function nextSma(indicators: LedgerInd[]): number {
  const have = new Set(indicators.filter((item) => item.kind === "sma").map((item) => item.period));
  return SMA_PERIODS.find((period) => !have.has(period)) || 20;
}
