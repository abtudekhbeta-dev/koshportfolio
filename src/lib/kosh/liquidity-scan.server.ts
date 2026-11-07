/** Server scan. One shared candle fetch per symbol, then the same detector for both screeners. */

import { loadIndexBasket } from "./index-basket.server";
import {
  activeSignals,
  detectLiquidity,
  foldSession4h,
  forwardStats,
  lastBarForming,
  mergeStats,
  prepareBars,
  sessionOnly,
  type ForwardStats,
  type LiqEvent,
  type LiqTimeframe,
} from "./liquidity";
import { listedEquities } from "./master.server";
import { NIFTY_CATALOGUE } from "./nifty-catalogue";
import { deleteRun, liquidityCacheKey, loadFreshRun, mergeRun, type StoredRun } from "./liquidity-run.server";
import { fetchOhlc } from "./yahoo.server";

export type ScanUniverse = "nifty50" | "nifty100" | "nifty200" | "nifty500" | "nse" | "watch";

const INDEX: Record<string, string> = {
  nifty50: "^NSEI",
  nifty100: "^CNX100",
  nifty200: "^CNX200",
  nifty500: "^CRSLDX",
};

export const TF_SPEC: Record<LiqTimeframe, { range: string; interval: string; note: string }> = {
  "15m": { range: "1mo", interval: "15m", note: "15-minute history from Yahoo is about one month, not a multi-year tape." },
  "1H": { range: "2y", interval: "60m", note: "Hourly history from Yahoo is about two years." },
  "4H": { range: "2y", interval: "60m", note: "4-hour bars are folded from hourly prints inside 09:15–15:30 IST. The afternoon bar stops at 15:30, so it is shorter than four hours." },
  "1D": { range: "5y", interval: "1d", note: "Daily bars, up to five years. A candle is scaled when Yahoo's adjusted close differs from the raw close by more than 0.2%, so splits and dividends stay on one series." },
  "1W": { range: "10y", interval: "1wk", note: "Weekly bars, up to ten years. The current week stays Developing until it closes." },
  "1M": { range: "max", interval: "1mo", note: "Monthly bars across the Yahoo max range. The current month stays Developing until it closes." },
};

export type ScanHit = LiqEvent & { symbol: string; name: string; exchange: "NSE" | "BSE" };

export type ScanPage = {
  hits: ScanHit[];
  stats: ForwardStats[];
  scanned: { symbol: string; name: string; bars: number; from: number | null; to: number | null }[];
  skipped: { symbol: string; reason: string }[];
  cursor: number | null;
  universeSize: number;
  universeNote: string;
  timeframeNote: string;
  adjusted: boolean;
  asOf: number;
};

const books = new Map<string, { at: number; symbols: { symbol: string; name: string }[]; note: string }>();

function yahooSymbol(symbol: string) {
  const raw = symbol.trim().toUpperCase();
  if (raw.endsWith(".NS") || raw.endsWith(".BO")) return raw;
  return raw;
}

function exchangeOf(symbol: string): "NSE" | "BSE" {
  return symbol.toUpperCase().endsWith(".BO") ? "BSE" : "NSE";
}

async function universeBook(kind: ScanUniverse, explicit: string[]): Promise<{ symbols: { symbol: string; name: string }[]; note: string }> {
  if (kind === "watch") {
    const symbols = [...new Set(explicit.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 80);
    return {
      symbols: symbols.map((symbol) => ({ symbol, name: symbol.replace(/\.(NS|BO)$/i, "") })),
      note: symbols.length ? "Watchlist symbols you selected. A name is scanned only if the price history answers." : "This watchlist has no symbols.",
    };
  }
  const cached = books.get(kind);
  if (cached && Date.now() - cached.at < 6 * 60 * 60 * 1000) return cached;
  if (kind === "nse") {
    const listed = await listedEquities().catch(() => []);
    const symbols = listed
      .filter((row) => row.series === "EQ" || row.series === "BE" || row.series === "SM" || row.series === "ST")
      .map((row) => ({ symbol: row.symbol, name: row.name }));
    const note = symbols.length
      ? `NSE equity master, ${symbols.length} names. This is the full listed book we can read, scanned in batches and kept for 10 bars of the chosen timeframe. It is not a BSE list. BSE names are scanned only from a watchlist symbol that already ends in .BO.`
      : "The NSE master did not answer, so this scan has no names.";
    const book = { at: Date.now(), symbols, note };
    if (symbols.length) books.set(kind, book);
    return book;
  }
  const id = INDEX[kind];
  const row = NIFTY_CATALOGUE.find((item) => item.symbol === id);
  if (!row) return { symbols: [], note: "That index is not in the catalogue." };
  const basket = await loadIndexBasket(row);
  if (basket.unavailable || !basket.rows.length) {
    return { symbols: [], note: basket.unavailable || "No published constituent file for this index." };
  }
  const symbols = basket.rows
    .filter((item) => item.symbol)
    .map((item) => ({ symbol: item.symbol as string, name: item.name }));
  const note = `${basket.source || row.name}${basket.asOf ? `, as of ${basket.asOf}` : ""}. ${symbols.length} names with an NSE code${basket.rows.length - symbols.length ? `, ${basket.rows.length - symbols.length} without one and not scanned` : ""}. Weights are not required for this scan.`;
  const book = { at: Date.now(), symbols, note };
  books.set(kind, book);
  return book;
}

function barsFor(tf: LiqTimeframe, raw: { t: number; o: number; h: number; l: number; c: number; v: number; adj?: number }[]) {
  if (tf === "4H") return prepareBars(foldSession4h(raw), true);
  if (tf === "15m" || tf === "1H") return prepareBars(sessionOnly(raw), true);
  return prepareBars(raw, true);
}

export async function scanLiquidityPage(input: {
  timeframe: LiqTimeframe;
  universe: ScanUniverse;
  symbols?: string[];
  cursor?: number;
  batch?: number;
}): Promise<ScanPage> {
  const spec = TF_SPEC[input.timeframe];
  const book = await universeBook(input.universe, input.symbols || []);
  const cursor = Math.max(0, input.cursor || 0);
  const batch = Math.min(8, Math.max(1, input.batch || 6));
  const slice = book.symbols.slice(cursor, cursor + batch);
  const scanned: ScanPage["scanned"] = [];
  const skipped: ScanPage["skipped"] = [];
  const hits: ScanHit[] = [];
  const stats: ForwardStats[] = [];
  let adjusted = false;
  let next = 0;
  const run = async (row: { symbol: string; name: string }) => {
    try {
      const pack = await fetchOhlc(yahooSymbol(row.symbol), spec.range, spec.interval);
      if (!pack || pack.missing || pack.bars.length < 2) {
        skipped.push({ symbol: row.symbol, reason: pack?.seriesNote || "No usable price history." });
        return;
      }
      const prepared = barsFor(input.timeframe, pack.bars);
      if (prepared.adjusted) adjusted = true;
      const need = 24;
      if (prepared.bars.length < need) {
        skipped.push({ symbol: row.symbol, reason: `Only ${prepared.bars.length} candles. This timeframe needs at least ${need} for a confirmed swing.` });
        return;
      }
      const forming = lastBarForming(input.timeframe, prepared.bars[prepared.bars.length - 1].t);
      const events = detectLiquidity(prepared.bars, undefined, forming);
      const active = activeSignals(events, "both");
      for (const event of active) {
        hits.push({
          ...event,
          id: `${row.symbol}|${event.id}`,
          symbol: row.symbol.replace(/\.NS$/i, ""),
          name: pack.name || row.name,
          exchange: exchangeOf(row.symbol),
        });
      }
      stats.push(...forwardStats(events.filter((event) => event.status !== "developing"), prepared.bars));
      scanned.push({
        symbol: row.symbol,
        name: pack.name || row.name,
        bars: prepared.bars.length,
        from: prepared.bars[0]?.t ?? null,
        to: prepared.bars[prepared.bars.length - 1]?.t ?? null,
      });
    } catch {
      skipped.push({ symbol: row.symbol, reason: "The price history did not answer." });
    }
  };
  const queue = slice.slice();
  await Promise.all(
    Array.from({ length: Math.min(3, queue.length) }, async () => {
      while (queue.length) {
        const row = queue.shift();
        if (!row) return;
        await run(row);
      }
    }),
  );
  next = cursor + slice.length;
  return {
    hits,
    stats: mergeStats(stats),
    scanned,
    skipped,
    cursor: next < book.symbols.length ? next : null,
    universeSize: book.symbols.length,
    universeNote: book.note,
    timeframeNote: spec.note,
    adjusted,
    asOf: Date.now(),
  };
}

export type RecallPage = ScanPage & {
  cached: boolean;
  partial: boolean;
  keptUntil: number | null;
  newerCandle: boolean;
  saved: boolean;
  skippedN: number;
};

function fromStored(run: StoredRun): RecallPage {
  return {
    hits: run.hits as ScanHit[],
    stats: run.stats,
    scanned: [],
    skipped: run.skipped,
    cursor: run.done ? null : run.cursorAt,
    universeSize: run.universeSize,
    universeNote: run.universeNote,
    timeframeNote: run.timeframeNote,
    adjusted: run.adjusted,
    asOf: run.asOf,
    cached: true,
    partial: !run.done,
    keptUntil: run.validUntil,
    newerCandle: run.newerCandle,
    saved: true,
    skippedN: run.skippedN,
  };
}

function emptyRecall(): RecallPage {
  return {
    hits: [],
    stats: [],
    scanned: [],
    skipped: [],
    cursor: null,
    universeSize: 0,
    universeNote: "",
    timeframeNote: "",
    adjusted: false,
    asOf: 0,
    cached: false,
    partial: false,
    keptUntil: null,
    newerCandle: false,
    saved: false,
    skippedN: 0,
  };
}

/** Read a saved run, or scan the next batch and store it. A finished run is reused until 10 bars of that timeframe have passed. */
export async function scanOrRecall(input: {
  timeframe: LiqTimeframe;
  universe: ScanUniverse;
  symbols?: string[];
  cursor?: number;
  fresh?: boolean;
  mode?: "read" | "scan";
}): Promise<RecallPage> {
  const symbols = input.universe === "watch" ? input.symbols || [] : [];
  const key = liquidityCacheKey(input.timeframe, input.universe, symbols);
  if (input.mode === "read") {
    const saved = await loadFreshRun(key, input.timeframe);
    return saved ? fromStored(saved) : emptyRecall();
  }
  const cursor = Math.max(0, input.cursor || 0);
  if (input.fresh && cursor === 0) await deleteRun(key);
  else if (!input.fresh && cursor === 0) {
    const saved = await loadFreshRun(key, input.timeframe);
    if (saved?.done) return fromStored(saved);
  }
  const page = await scanLiquidityPage({
    timeframe: input.timeframe,
    universe: input.universe,
    symbols: input.symbols,
    cursor,
  });
  const stored = await mergeRun(key, input.timeframe, page, cursor);
  return {
    ...page,
    cached: false,
    partial: page.cursor != null,
    keptUntil: stored.validUntil,
    newerCandle: false,
    saved: stored.ok,
    skippedN: page.skipped.length,
  };
}
