/** Server scan. One shared candle fetch per symbol, then the same detector for both screeners. */

import { loadIndexBasket } from "./index-basket.server";
import {
  activeSignals,
  barsForTimeframe,
  detectLiquidity,
  forwardStats,
  lastBarForming,
  mergeStats,
  session4hTailOpen,
  planScanCursor,
  createScanGate,
  type ForwardStats,
  type LiqEvent,
  type LiqTimeframe,
} from "./liquidity";
import { listedEquities } from "./master.server";
import { bseEquities } from "./bse-book.server";
import { composeListedBook } from "./liquidity-universe";
import { NIFTY_CATALOGUE } from "./nifty-catalogue";
import { deleteRun, liquidityCacheKey, loadFreshRun, mergeRun, tryScanLock, unlockScan, beginScanRenewal, type ScanAdmission, type StoredRun } from "./liquidity-run.server";
import { scanLockDiagnostic } from "./liquidity-lock";
import { EMPTY_MCAP, mcapActive, mcapCacheToken, selectByMcap, type CapObservation, type McapSpec } from "./liquidity-book";
import { cachedCaps, fillListingCaps } from "./liquidity-mcap.server";
import { fetchOhlc } from "./yahoo.server";

export type ScanUniverse = "nifty50" | "nifty100" | "nifty200" | "nifty500" | "all" | "nse" | "bse" | "watch" | "portfolio";

const INDEX: Record<string, string> = {
  nifty50: "^NSEI",
  nifty100: "^CNX100",
  nifty200: "^CNX200",
  nifty500: "^CRSLDX",
};

export const TF_SPEC: Record<LiqTimeframe, { range: string; interval: string; note: string }> = {
  "15m": { range: "1mo", interval: "15m", note: "15-minute history from Yahoo is about one month, not a multi-year tape." },
  "1H": { range: "2y", interval: "60m", note: "Hourly history from Yahoo is about two years." },
  "4H": { range: "2y", interval: "60m", note: "4-hour bars are folded from hourly prints inside 09:15–15:30 IST. A slot missing an expected hour, or a weekend print, is left out. The afternoon bar stops at 15:30, so it is shorter than four hours." },
  "1D": { range: "5y", interval: "1d", note: "Daily bars, up to five years. A candle is scaled when Yahoo's adjusted close differs from the raw close by more than 0.2%, so splits and dividends stay on one series." },
  "1W": { range: "10y", interval: "1wk", note: "Weekly bars, up to ten years. The current week stays Developing until it closes." },
  "1M": { range: "max", interval: "1mo", note: "Monthly bars across the Yahoo max range. The current month stays Developing until it closes." },
};

export type ScanHit = LiqEvent & { symbol: string; name: string; exchange: "NSE" | "BSE"; mcapCr?: number | null; mcapAsOf?: number | null };

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
  fingerprint: string;
};

const books = new Map<string, { at: number; symbols: { symbol: string; name: string; exchange: "NSE" | "BSE" }[]; note: string; fingerprint: string }>();
const scanGate = createScanGate();

function pinned(symbol: string, exchange: "NSE" | "BSE"): string {
  const bare = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
  return exchange === "BSE" ? `${bare}.BO` : `${bare}.NS`;
}

async function listedBook(mode: "all" | "nse" | "bse") {
  const [nse, bse] = await Promise.all([
    listedEquities().catch(() => []),
    bseEquities().catch(() => ({ ok: false as const, complete: false, rows: [] as { symbol: string; name: string }[], total: null, received: 0, pagesFailed: 1, fetchedAt: 0, error: "BSE list failed" })),
  ]);
  return composeListedBook({
    nse: nse.map((row) => ({ symbol: row.symbol, name: row.name, isin: row.isin })),
    bse: bse.ok ? bse.rows.map((row) => ({ symbol: row.symbol, name: row.name, isin: row.isin })) : [],
    mode,
    bseReady: bse.ok && bse.rows.length > 0,
    bseComplete: bse.complete === true,
    bseError: bse.ok ? bse.error : bse.error || "BSE list failed",
  });
}

async function universeBook(kind: ScanUniverse, explicit: string[]): Promise<{ symbols: { symbol: string; name: string; exchange: "NSE" | "BSE" }[]; note: string; fingerprint: string }> {
  if (kind === "watch" || kind === "portfolio") {
    const cap = kind === "portfolio" ? 400 : 80;
    const symbols = [...new Set(explicit.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, cap);
    const rows = symbols.map((symbol) => ({
      symbol: symbol.endsWith(".BO") ? symbol : symbol.replace(/\.NS$/, ""),
      name: symbol.replace(/\.(NS|BO)$/i, ""),
      exchange: symbol.endsWith(".BO") ? "BSE" as const : "NSE" as const,
    }));
    const note = kind === "portfolio"
      ? (rows.length ? `${rows.length} holdings from the portfolios you selected. A name is scanned only if the price history answers. NSE and BSE stay separate.` : "Those portfolios have no listed holdings to scan.")
      : (symbols.length ? "Watchlist symbols you selected. A name is scanned only if the price history answers. A .BO symbol stays on BSE." : "This watchlist has no symbols.");
    return {
      symbols: rows,
      note,
      fingerprint: kind === "portfolio" ? rows.map((row) => `${row.exchange}:${row.symbol}`).sort().join(",") : rows.map((row) => row.symbol).sort().join(","),
    };
  }
  const cached = books.get(kind);
  if (cached && Date.now() - cached.at < 6 * 60 * 60 * 1000) return cached;
  if (kind === "all" || kind === "nse" || kind === "bse") {
    const book = await listedBook(kind);
    const next = { at: Date.now(), symbols: book.symbols, note: book.note, fingerprint: book.fingerprint };
    if (book.symbols.length) books.set(kind, next);
    return next;
  }
  const id = INDEX[kind];
  const row = NIFTY_CATALOGUE.find((item) => item.symbol === id);
  if (!row) return { symbols: [], note: "That index is not in the catalogue.", fingerprint: "missing" };
  const basket = await loadIndexBasket(row);
  if (basket.unavailable || !basket.rows.length) {
    return { symbols: [], note: basket.unavailable || "No published constituent file for this index.", fingerprint: "empty" };
  }
  const symbols = basket.rows
    .filter((item) => item.symbol)
    .map((item) => ({ symbol: item.symbol as string, name: item.name, exchange: "NSE" as const }));
  const note = `${basket.source || row.name}${basket.asOf ? `, as of ${basket.asOf}` : ""}. ${symbols.length} names with an NSE code${basket.rows.length - symbols.length ? `, ${basket.rows.length - symbols.length} without one and not scanned` : ""}. Weights are not required for this scan.`;
  const fingerprint = `${row.symbol}|${basket.asOf || ""}|${symbols.length}`;
  const book = { at: Date.now(), symbols, note, fingerprint };
  books.set(kind, book);
  return book;
}

function barsFor(tf: LiqTimeframe, raw: { t: number; o: number; h: number; l: number; c: number; v: number; adj?: number }[]) {
  return barsForTimeframe(tf, raw);
}

type ResolvedBook = { symbols: { symbol: string; name: string; exchange: "NSE" | "BSE" }[]; note: string; fingerprint: string };

export async function scanLiquidityPage(
  input: {
    timeframe: LiqTimeframe;
    universe: ScanUniverse;
    symbols?: string[];
    cursor?: number;
    batch?: number;
  },
  resolved?: ResolvedBook,
  caps?: Map<string, CapObservation>,
): Promise<ScanPage> {
  const spec = TF_SPEC[input.timeframe];
  const book = resolved || (await universeBook(input.universe, input.symbols || []));
  const cursor = Math.max(0, input.cursor || 0);
  const batch = Math.min(8, Math.max(1, input.batch || 8));
  const slice = book.symbols.slice(cursor, cursor + batch);
  const scanned: ScanPage["scanned"] = [];
  const skipped: ScanPage["skipped"] = [];
  const hits: ScanHit[] = [];
  const stats: ForwardStats[] = [];
  let adjusted = false;
  let bench: { t: number; o: number; h: number; l: number; c: number; v: number | null }[] = [];
  try {
    const index = await fetchOhlc("^NSEI", spec.range, spec.interval);
    if (index && !index.missing && index.bars.length > 2) bench = barsFor(input.timeframe, index.bars).bars;
  } catch {
    bench = [];
  }
  let next = 0;
  const run = async (row: { symbol: string; name: string; exchange: "NSE" | "BSE" }) => {
    try {
      const yahoo = pinned(row.symbol, row.exchange);
      const pack = await fetchOhlc(yahoo, spec.range, spec.interval);
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
      const lastT = prepared.bars[prepared.bars.length - 1].t;
      const forming = lastBarForming(input.timeframe, lastT) || (input.timeframe === "4H" && session4hTailOpen(pack.bars));
      const events = detectLiquidity(prepared.bars, undefined, forming);
      const active = activeSignals(events, "both");
      const id = row.exchange === "BSE" ? row.symbol.replace(/\.NS$/i, "") : row.symbol.replace(/\.(NS|BO)$/i, "");
      const storedId = row.exchange === "BSE" && !id.endsWith(".BO") ? `${id}.BO` : id;
      const pin = pinned(row.symbol, row.exchange);
      const obs = caps?.get(pin);
      for (const event of active) {
        hits.push({
          ...event,
          id: `${storedId}|${event.id}`,
          symbol: storedId,
          name: pack.name || row.name,
          exchange: row.exchange,
          mcapCr: obs?.state === "known" ? obs.mcapCr : null,
          mcapAsOf: obs?.asOf ?? null,
        });
      }
      stats.push(...forwardStats(events.filter((event) => event.status !== "developing"), prepared.bars, { symbol: storedId, bench }));
      scanned.push({
        symbol: storedId,
        name: pack.name || row.name,
        bars: prepared.bars.length,
        from: prepared.bars[0]?.t ?? null,
        to: lastT,
      });
    } catch {
      skipped.push({ symbol: row.symbol, reason: "The price history did not answer." });
    }
  };
  const queue = slice.slice();
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
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
    timeframeNote: bench.length ? spec.note : `${spec.note} Nifty did not load, so there is no benchmark-relative column for this page.`,
    adjusted,
    asOf: Date.now(),
    fingerprint: book.fingerprint,
  };
}

export type RecallPage = ScanPage & {
  cached: boolean;
  partial: boolean;
  keptUntil: number | null;
  newerCandle: boolean;
  saved: boolean;
  skippedN: number;
  scannedN: number;
  /** Ask the client to replace its list. Set when a saved partial run is ahead of the cursor it sent. */
  replace?: boolean;
  /** Another instance holds this scan key. The saved partial run is unchanged. */
  locked?: boolean;
  /** Market-cap quotes are still loading. Candle history has not been requested. */
  preparing?: boolean;
  mcapPending?: number;
  /** Original book, before the market-cap gate. Candle history is not fetched for names outside `eligible`. */
  listed?: number;
  eligible?: number;
  mcapExcluded?: number;
  mcapMissing?: number;
  mcapUnavailable?: number;
  mcapAsOf?: number | null;
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
    scannedN: run.scannedN,
    fingerprint: "",
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
    scannedN: 0,
    fingerprint: "",
  };
}

async function lostPage(key: string, tf: LiqTimeframe): Promise<RecallPage> {
  console.warn(scanLockDiagnostic("lock-lost"));
  const saved = await loadFreshRun(key, tf);
  return saved
    ? { ...fromStored(saved), locked: true }
    : { ...emptyRecall(), locked: true, universeNote: "Another scan of this book is still running." };
}

/** Read a saved run, or scan the next batch and store it. A finished run is reused until 10 bars of that timeframe have passed, and is marked when a newer candle may have started. */
export async function scanOrRecall(input: {
  timeframe: LiqTimeframe;
  universe: ScanUniverse;
  symbols?: string[];
  cursor?: number;
  fresh?: boolean;
  mode?: "read" | "scan";
  mcap?: McapSpec;
}): Promise<RecallPage> {
  const symbols = input.universe === "watch" || input.universe === "portfolio" ? input.symbols || [] : [];
  const raw = await universeBook(input.universe, symbols);
  const spec = input.mcap || EMPTY_MCAP;
  let book = raw;
  let token = "";
  let caps: Map<string, CapObservation> | undefined;
  const census = {
    listed: raw.symbols.length,
    eligible: raw.symbols.length,
    mcapExcluded: 0,
    mcapMissing: 0,
    mcapUnavailable: 0,
    mcapAsOf: null as number | null,
  };
  if (mcapActive(spec)) {
    const pins = raw.symbols.map((row) => pinned(row.symbol, row.exchange));
    const filled = input.mode === "read" ? cachedCaps(pins) : await fillListingCaps(pins);
    if (!filled.ready) {
      return {
        ...emptyRecall(),
        preparing: true,
        listed: raw.symbols.length,
        mcapPending: filled.pending,
        universeNote: `Market cap loaded for ${pins.length - filled.pending} of ${pins.length}. Candle history has not been requested yet.`,
      };
    }
    const picked = selectByMcap(raw.symbols, filled.rows, spec, (row) => pinned(row.symbol, row.exchange));
    caps = filled.rows;
    census.eligible = picked.eligible.length;
    census.mcapExcluded = picked.excluded;
    census.mcapMissing = picked.missing;
    census.mcapUnavailable = picked.unavailable;
    census.mcapAsOf = picked.asOf;
    token = mcapCacheToken(spec, picked.eligible.map((row) => pinned(row.symbol, row.exchange)));
    const asOf = picked.asOf ? new Date(picked.asOf).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : "an unknown date";
    book = {
      symbols: picked.eligible,
      fingerprint: raw.fingerprint,
      note: `${raw.note} Market cap is the latest Yahoo quote in ₹ crore, cached for 12 hours and not treated as zero when missing. These bands are Kosh working cuts, not a SEBI classification. ${raw.symbols.length} listed, ${picked.eligible.length} eligible, ${picked.excluded} outside the filter, ${picked.missing} without a cap, ${picked.unavailable} whose quote did not answer. As of ${asOf}.`,
    };
  }
  const stamp = (page: RecallPage): RecallPage => ({ ...page, ...census });
  const key = liquidityCacheKey(input.timeframe, input.universe, symbols, book.fingerprint, token);
  if (input.mode === "read") {
    const saved = await loadFreshRun(key, input.timeframe);
    return stamp(saved ? fromStored(saved) : emptyRecall());
  }
  return scanGate(key, async () => {
    const admission = await tryScanLock(key);
    if (admission === "busy") {
      const saved = await loadFreshRun(key, input.timeframe);
      return stamp(saved
        ? { ...fromStored(saved), locked: true }
        : { ...emptyRecall(), locked: true, universeNote: "Another scan of this book is still running." });
    }
    const renewal = admission === "database-coordinated" ? beginScanRenewal(key) : null;
    try {
      return stamp(await scanBody(input, key, admission, () => renewal?.lost() ?? false, book, caps));
    } finally {
      renewal?.stop();
      if (admission === "database-coordinated") await unlockScan(key);
    }
  });
}

async function scanBody(
  input: { timeframe: LiqTimeframe; universe: ScanUniverse; symbols?: string[]; cursor?: number; fresh?: boolean },
  key: string,
  admission: ScanAdmission,
  lost: () => boolean,
  book: ResolvedBook,
  caps?: Map<string, CapObservation>,
): Promise<RecallPage> {
  let cursor = Math.max(0, input.cursor || 0);
  const saved = !input.fresh || cursor !== 0 ? await loadFreshRun(key, input.timeframe) : null;
  const plan = planScanCursor(saved, cursor, input.fresh === true);
  if (plan.action === "use-saved") return saved ? fromStored(saved) : emptyRecall();
  if (plan.action === "replace-with-saved") return saved ? { ...fromStored(saved), replace: true } : emptyRecall();
  if (lost()) return lostPage(key, input.timeframe);
  if (input.fresh && cursor === 0) await deleteRun(key, admission);
  cursor = plan.cursor;
  const page = await scanLiquidityPage({
    timeframe: input.timeframe,
    universe: input.universe,
    symbols: input.symbols,
    cursor,
  }, book, caps);
  if (lost()) return lostPage(key, input.timeframe);
  const stored = await mergeRun(key, input.timeframe, page, cursor, admission);
  if (stored.lost) return lostPage(key, input.timeframe);
  return {
    ...page,
    cached: false,
    partial: !stored.done,
    keptUntil: stored.validUntil,
    newerCandle: false,
    saved: stored.ok,
    skippedN: stored.skippedN,
    scannedN: stored.scannedN,
  };
}
