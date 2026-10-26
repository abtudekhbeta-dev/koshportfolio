import { buildReading, interpret, RRG_METHOD, type CrossReading, type RrgReading, type Timeframe, type UnresolvedBreak } from "./rrg-frame.ts";
import { RRG_BENCHMARKS, RRG_UNIVERSE, resolveSymbols } from "./rrg-universe.ts";
import type { ClosePrint } from "./rrg.ts";

export type StoredRrg = {
  symbol: string;
  rows: ClosePrint[];
  quality?: { limitedHistory?: boolean; weekdayGaps?: string[]; from?: string | null; to?: string | null; adjustment?: string };
  basis?: string;
  dividendTreatment?: string;
  applied?: { date: string; type: string; factor: number; subject?: string }[];
  unresolved?: UnresolvedBreak[];
  meta?: { name?: string; category?: string; sector?: string | null; limited?: boolean; notes?: string[]; benchmark?: boolean };
  source?: { dataset?: string; url?: string; licence?: string; note?: string };
};

export type RegistryRow = {
  symbol: string;
  name: string;
  category: string;
  sector: string | null;
  exchange?: string | null;
  kind: string;
  benchmark: boolean;
  limited: boolean;
  status: string;
  from: string | null;
  to: string | null;
  rows: number;
  basis?: string | null;
  notes?: string[];
};

export type RrgLibrary = {
  registry: RegistryRow[];
  get(symbol: string): StoredRrg | undefined;
};

export type RrgQuery = {
  mode: "sector" | "stock";
  group?: "sector" | "size" | "broad" | "stock";
  benchmark: string;
  symbols: string[];
  explicit?: boolean;
  timeframe: Timeframe;
  asOf?: string;
  tail: number;
};

const DEFAULT_STOCKS = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY"];
const SELECT_CAP = 24;

/** Exact symbol, then case-insensitive symbol, then a unique display name. Never maps one listing onto another. */
export function canonicalSymbol(input: string, registry: { symbol: string; name: string }[]) {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  const exact = registry.find((item) => item.symbol === trimmed);
  if (exact) return exact.symbol;
  const folded = trimmed.toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const bySymbol = registry.find((item) => item.symbol.toUpperCase() === folded);
  if (bySymbol) return bySymbol.symbol;
  const named = registry.filter((item) => item.name.toLowerCase() === trimmed.toLowerCase());
  if (named.length === 1) return named[0]!.symbol;
  return trimmed;
}

export function libraryFromMap(store: Map<string, StoredRrg>): RrgLibrary {
  return {
    registry: RRG_UNIVERSE.map((item) => ({
      symbol: item.symbol,
      name: item.name,
      category: item.kind === "sector" ? "sector" : item.kind === "stock" ? "stock" : "broad",
      sector: null,
      kind: item.kind,
      benchmark: (RRG_BENCHMARKS as readonly string[]).includes(item.symbol),
      limited: item.limited,
      status: store.has(item.symbol) ? "imported" : "unavailable",
      from: null,
      to: null,
      rows: store.get(item.symbol)?.rows.length || 0,
      notes: item.notes,
    })),
    get: (symbol) => store.get(symbol),
  };
}

export function buildPack(source: Map<string, StoredRrg> | RrgLibrary, query: RrgQuery) {
  const library = source instanceof Map ? libraryFromMap(source) : source;
  const benchmarkSymbol = canonicalSymbol(query.benchmark, library.registry);
  const benchmarkMeta = library.registry.find((item) => item.symbol === benchmarkSymbol);
  if (!benchmarkMeta) return { error: "That benchmark is not in the validated store." };
  if (benchmarkMeta.symbol === "INDIA VIX" || benchmarkMeta.category === "volatility") {
    return { error: "India VIX is not a price benchmark. Choose a price index." };
  }
  if (!benchmarkMeta.benchmark) return { error: `${benchmarkMeta.name} is not a price benchmark.` };
  if (benchmarkMeta.status === "unavailable" || benchmarkMeta.status === "licence-blocked" || benchmarkMeta.status === "rejected") {
    const why = benchmarkMeta.notes?.find(Boolean) || benchmarkMeta.status;
    return { error: `${benchmarkMeta.name} cannot be used as a benchmark (${why}).` };
  }
  const benchmark = library.get(benchmarkMeta.symbol);
  if (!benchmark?.rows.length) {
    return { error: `${benchmarkMeta.name} is registered but its history file could not be read.` };
  }
  const group = query.group || (query.mode === "stock" ? "stock" : "sector");
  const allowed = library.registry.filter((item) => {
    if (item.symbol === benchmarkMeta.symbol) return false;
    if (item.status !== "imported" && item.status !== "limited" && item.status !== "stale") return false;
    return group === "stock" ? item.category === "stock" : item.category === group;
  });
  const requestedRaw = query.explicit ? query.symbols : query.symbols.length ? query.symbols : query.mode === "stock" ? DEFAULT_STOCKS : allowed.map((item) => item.symbol);
  const requested = requestedRaw.map((symbol) => canonicalSymbol(symbol, library.registry));
  const resolved = resolveSymbols(requested, allowed.map((item) => item.symbol));
  if (resolved.ok.length > SELECT_CAP) {
    return { error: `Select at most ${SELECT_CAP} series at once.` };
  }
  const readings = resolved.ok.flatMap((symbol) => {
    const stored = library.get(symbol);
    const meta = allowed.find((item) => item.symbol === symbol);
    if (!stored?.rows.length || !meta) return [];
    return [readingFor(meta, stored, benchmark.rows, query)];
  });
  const cross: CrossReading[] = readings.map((row) => {
    const meta = allowed.find((item) => item.symbol === row.symbol)!;
    const stored = library.get(row.symbol)!;
    return {
      symbol: row.symbol,
      name: row.name,
      daily: buildReading(args(meta, stored.rows, benchmark.rows, "daily", query)).quadrant,
      weekly: buildReading(args(meta, stored.rows, benchmark.rows, "weekly", query)).quadrant,
      monthly: buildReading(args(meta, stored.rows, benchmark.rows, "monthly", query)).quadrant,
    };
  });
  const benchRows = query.asOf ? benchmark.rows.filter((row) => row.date <= query.asOf!) : benchmark.rows;
  return {
    error: null as string | null,
    formula: RRG_METHOD.formula,
    method: {
      ...RRG_METHOD,
      adjustment:
        "Indices use the published price index. Stocks use a price-return series. A published split or bonus ratio is applied once, backward, at the time the series is stored, and is not applied again when the chart is drawn. A bonus and a face-value split on the same action are one factor, the product of the two ratios. A demerger is left unchanged unless a published ratio is on file. A ratio taken from two closes is not used. Cash dividends are not removed. This is not the proprietary StockCharts or JdK formula.",
    },
    mode: query.mode,
    group,
    benchmark: { symbol: benchmarkMeta.symbol, name: benchmarkMeta.name, close: benchRows.at(-1)?.close ?? null, asOf: benchRows.at(-1)?.date ?? null, basis: benchmark.basis || "price-index" },
    range: { from: benchmark.rows[0]?.date ?? null, to: benchmark.rows.at(-1)?.date ?? null },
    sessions: benchmark.rows.map((row) => row.date),
    available: group === "stock" ? [] : allowed.map((item) => ({ symbol: item.symbol, name: item.name, limited: item.limited, status: item.status })),
    missing: resolved.missing,
    readings,
    notes: interpret(readings, cross),
    cross,
    provenance: {
      stocks: "tejhq/indian-markets",
      indices: "aswinv90/indian-market-historical-data",
      permission: "The index author agreed, on 24 Oct 2026, that Kosh may use the files. The repository licence still requires written authorisation for commercial use. That written grant is not in this repository. NSEDATA4ME is GPL-3 and was not imported.",
      note: "Current Nifty 500 names as of 2026-08-31. Not point-in-time membership.",
    },
  };
}

function readingFor(meta: RegistryRow, stored: StoredRrg, benchmark: ClosePrint[], query: RrgQuery): RrgReading {
  const gaps = stored.quality?.weekdayGaps?.length;
  const notes = [...(stored.meta?.notes || meta.notes || [])];
  if (gaps) notes.push(`${gaps} weekdays in the stored span have no close. They were not filled.`);
  if (meta.status === "stale") notes.push(`Series ends ${meta.to}. It is not filled forward to the benchmark.`);
  return buildReading({
    ...args(meta, stored.rows, benchmark, query.timeframe, query),
    notes,
    limited: meta.limited || stored.quality?.limitedHistory === true || meta.status === "limited",
    unresolved: stored.unresolved,
  });
}

function args(meta: { symbol: string; name: string; limited: boolean }, instrument: ClosePrint[], benchmark: ClosePrint[], timeframe: Timeframe, query: RrgQuery) {
  return {
    symbol: meta.symbol,
    name: meta.name,
    instrument,
    benchmark,
    timeframe,
    asOf: query.asOf,
    tail: query.tail,
    notes: [] as string[],
    limited: meta.limited,
  };
}
