import { useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LIQ_FOCUS_KEY, mergeStats, type ForwardStats, type LiqEvent, type LiqFocus, type LiqTimeframe } from "@/lib/kosh/liquidity";
import { portfolioScanBook, parseCr, type CapBand } from "@/lib/kosh/liquidity-book";
import { activeFilterCount, COLUMN_LABEL, csvHits, describeFilters, filterHits, loadLiqView, OPEN_FILTER, saveLiqView, sortHits, type HitFilter, type LiqSetup, type LiqView, type SortKey } from "@/lib/kosh/liquidity-table";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ChartMark, OhlcBar } from "@/lib/kosh/types";
import { LiquidityTape } from "@/components/liquidity-tape";
import { ResultTable } from "@/components/liquidity-results";

const CandleChart = lazy(() => import("@/components/charts/candle-chart").then((m) => ({ default: m.CandleChart })));

type Hit = LiqEvent & { symbol: string; name: string; exchange: "NSE" | "BSE"; mcapCr?: number | null; mcapAsOf?: number | null };

type Page = {
  hits: Hit[];
  stats: ForwardStats[];
  skipped: { symbol: string; reason: string }[];
  cursor: number | null;
  universeSize: number;
  universeNote: string;
  timeframeNote: string;
  adjusted: boolean;
  asOf: number;
  cached?: boolean;
  partial?: boolean;
  keptUntil?: number | null;
  newerCandle?: boolean;
  saved?: boolean;
  skippedN?: number;
  scannedN?: number;
  replace?: boolean;
  locked?: boolean;
  preparing?: boolean;
  listed?: number;
  eligible?: number;
  mcapExcluded?: number;
  mcapMissing?: number;
  mcapUnavailable?: number;
  mcapAsOf?: number | null;
  mcapPending?: number;
  error?: string;
};

const TFS: LiqTimeframe[] = ["15m", "1H", "4H", "1D", "1W", "1M"];
const UNIVERSES = [
  ["all", "All listed"],
  ["nse", "NSE"],
  ["bse", "BSE"],
  ["nifty50", "Nifty 50"],
  ["nifty100", "Nifty 100"],
  ["nifty200", "Nifty 200"],
  ["nifty500", "Nifty 500"],
  ["watch", "Watchlist"],
  ["portfolio", "Portfolio"],
] as const;

const LIFE: Record<LiqTimeframe, string> = {
  "15m": "10 fifteen-minute bars",
  "1H": "10 hourly bars",
  "4H": "10 four-hour bars",
  "1D": "10 daily bars",
  "1W": "10 weekly bars",
  "1M": "10 monthly bars",
};

function when(t: number | null) {
  if (!t) return "—";
  return new Date(t * 1000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
}

function num(n: number | null, digits = 2) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function chartFrame(tf: LiqTimeframe): { interval: string; lookback: string; extra: string } {
  if (tf === "15m") return { interval: "15m", lookback: "1M", extra: "" };
  if (tf === "1H") return { interval: "1H", lookback: "1Y", extra: "" };
  if (tf === "4H") return { interval: "1H", lookback: "1Y", extra: " The stock page has no 4-hour frame. The panel beside this list draws the folded 4-hour candles the scan used." };
  if (tf === "1D") return { interval: "1D", lookback: "5Y", extra: "" };
  if (tf === "1M") return { interval: "1M", lookback: "MAX", extra: "" };
  return { interval: "1W", lookback: "10Y", extra: "" };
}

function marksFor(hit: Hit): ChartMark[] {
  const marks: ChartMark[] = [
    { id: hit.id + "-level", kind: "sr", price: hit.level, label: "Level", tone: "chart" },
    { id: hit.id + "-sweep", kind: "swing", price: hit.extreme, t: hit.sweepT, label: "Broke to", tone: hit.direction === "bull" ? "down" : "up" },
  ];
  if (hit.reclaimT && hit.reclaimClose != null) {
    marks.push({ id: hit.id + "-reclaim", kind: "swing", price: hit.reclaimClose, t: hit.reclaimT, label: "Closed back", tone: hit.direction === "bull" ? "up" : "down" });
  }
  return marks;
}

function stageLabel(hit: Hit) {
  if (hit.status === "developing" || !hit.reclaimClosed) return "Developing";
  return "Reclaimed";
}

export function LiquidityDesk({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const lists = useKosh((s) => s.watchlists);
  const portfolios = useKosh((s) => s.portfolios);
  const addHoldings = useKosh((s) => s.addHoldings);
  const addToWatchList = useKosh((s) => s.addToWatchList);
  const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
  const [pattern, setPattern] = useState<"sweep" | "failed">("sweep");
  const [tf, setTf] = useState<LiqTimeframe>("1W");
  const [direction, setDirection] = useState<"bull" | "bear" | "both">("both");
  const [status, setStatus] = useState<"developing" | "confirmed" | "potential" | "follow" | "all">("all");
  const [swing, setSwing] = useState<"both" | "single" | "equal">("both");
  const [reclaim, setReclaim] = useState<"all" | "same" | "one" | "two" | "three" | "later">("all");
  const [universe, setUniverse] = useState<(typeof UNIVERSES)[number][0]>("nifty50");
  const [listId, setListId] = useState(lists[0]?.id || "");
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);
  const [band, setBand] = useState<"all" | CapBand>("all");
  const [resultCap, setResultCap] = useState<"all" | CapBand>("all");
  const [mcapMin, setMcapMin] = useState("");
  const [mcapMax, setMcapMax] = useState("");
  const [includeUnknown, setIncludeUnknown] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [exchange, setExchange] = useState<"all" | "NSE" | "BSE">("all");
  const [tier, setTier] = useState<"all" | "strong" | "potential" | "developing">("all");
  const [follow, setFollow] = useState<"all" | "yes" | "no">("all");
  const [highVolume, setHighVolume] = useState(false);
  const [view, setView] = useState<LiqView>({ columns: ["name", "direction", "level", "depth", "reclaim", "follow", "volume", "date", "status", "score", "actions"], sortKey: "rank", sortDir: "desc", setups: [], combined: false });
  const [viewReady, setViewReady] = useState(false);
  const [setupName, setSetupName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [compare, setCompare] = useState<string[]>([]);
  const [phase, setPhase] = useState("");
  const [actionFor, setActionFor] = useState<{ hit: Hit; kind: "watch" | "portfolio"; dest: string } | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [weak, setWeak] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [stats, setStats] = useState<ForwardStats[]>([]);
  const [skipped, setSkipped] = useState<{ symbol: string; reason: string }[]>([]);
  const [skippedN, setSkippedN] = useState(0);
  const [meta, setMeta] = useState<(Pick<Page, "universeSize" | "universeNote" | "timeframeNote" | "adjusted" | "asOf" | "keptUntil" | "newerCandle" | "cached" | "listed" | "eligible" | "mcapExcluded" | "mcapMissing" | "mcapUnavailable" | "mcapAsOf" | "mcapPending">) | null>(null);
  const [progress, setProgress] = useState<{ done: number; size: number } | null>(null);
  const [savedKind, setSavedKind] = useState<"none" | "partial" | "done">("none");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Hit | null>(null);
  const [side, setSide] = useState<Hit | null>(null);
  const stop = useRef(false);
  const resume = useRef(0);
  const epoch = useRef(0);
  const savedPrefs = useRef<{ interval: string; lookback: string } | null>(null);

  const watchSymbols = universe === "watch" ? (lists.find((l) => l.id === listId) || lists[0])?.symbols || [] : [];
  const selectedPorts = portfolios.filter((port) => portfolioIds.includes(port.id));
  const portBook = portfolioScanBook(selectedPorts.flatMap((port) => (port.holdings || []).map((row) => ({ symbol: row.symbol, name: row.name, kind: row.kind }))));
  const symbolKey = universe === "watch" ? watchSymbols.join(",") : universe === "portfolio" ? portBook.rows.map((row) => row.symbol).join(",") : "";
  const resultFilter: HitFilter = {
    ...OPEN_FILTER,
    query,
    pattern,
    direction,
    exchange,
    tier,
    follow,
    reclaim,
    swing,
    minScore: Number.isFinite(minScore) ? minScore : 0,
    minPrice: parseCr(minPrice),
    maxPrice: parseCr(maxPrice),
    minVolume: highVolume ? 1.5 : null,
    cap: resultCap,
    weak,
    lifecycle: status,
  };
  const filterCount = activeFilterCount(resultFilter);
  const filterNotes = describeFilters(resultFilter);

  function take(page: Page, how: "replace" | "add") {
    if (page.error) {
      setError(page.error);
      return;
    }
    setMeta({
      universeSize: page.universeSize,
      universeNote: page.universeNote,
      timeframeNote: page.timeframeNote,
      adjusted: page.adjusted,
      asOf: page.asOf,
      keptUntil: page.keptUntil ?? null,
      newerCandle: page.newerCandle,
      cached: page.cached,
      listed: page.listed,
      eligible: page.eligible,
      mcapExcluded: page.mcapExcluded,
      mcapMissing: page.mcapMissing,
      mcapUnavailable: page.mcapUnavailable,
      mcapAsOf: page.mcapAsOf,
      mcapPending: page.mcapPending,
    });
    if (how === "replace") {
      setHits(page.hits || []);
      setStats(page.stats || []);
      setSkipped(page.skipped || []);
      setSkippedN(page.skippedN || page.skipped?.length || 0);
    } else {
      setHits((cur) => {
        const ids = new Set(cur.map((hit) => hit.id));
        const next = cur.slice();
        for (const hit of page.hits || []) {
          if (ids.has(hit.id)) continue;
          ids.add(hit.id);
          next.push(hit);
        }
        return next;
      });
      setStats((cur) => mergeStats([...cur, ...(page.stats || [])]));
      setSkipped((cur) => [...cur, ...(page.skipped || [])]);
      setSkippedN((n) => n + (page.skipped?.length || 0));
    }
    if (page.universeSize) {
      const accounted = (page.scannedN || 0) + (page.skippedN || 0);
      const cursorDone = page.cursor == null ? page.universeSize : page.cursor;
      const walked = page.scannedN != null ? accounted : cursorDone;
      setProgress({ done: Math.min(walked, page.universeSize), size: page.universeSize });
      resume.current = page.cursor ?? page.universeSize;
    } else {
      setProgress(null);
      resume.current = 0;
    }
    if (!page.universeSize && !(page.hits || []).length) setSavedKind("none");
    else if (page.cursor != null || page.partial) setSavedKind("partial");
    else setSavedKind("done");
  }

  useEffect(() => {
    const token = ++epoch.current;
    stop.current = true;
    setHits([]);
    setStats([]);
    setSkipped([]);
    setSkippedN(0);
    setMeta(null);
    setProgress(null);
    setSavedKind("none");
    setError("");
    setSide(null);
    const params = new URLSearchParams({ tf, universe, mode: "read" });
    if (symbolKey) params.set("symbols", symbolKey);
    if (band !== "all") params.set("cap", band);
    if (mcapMin) params.set("mcapMin", mcapMin);
    if (mcapMax) params.set("mcapMax", mcapMax);
    if (includeUnknown) params.set("unknown", "1");
    void fetch("/api/liquidity-scan?" + params.toString())
      .then((res) => res.json() as Promise<Page>)
      .then((page) => {
        if (token !== epoch.current) return;
        if (page.hits?.length || page.partial || page.universeSize) take(page, "replace");
      })
      .catch(() => {});
    return () => {
      stop.current = true;
    };
    // take is recreated each render; the scan identity is the timeframe and the book.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf, universe, symbolKey, band, mcapMin, mcapMax, includeUnknown]);

  useEffect(() => {
    return () => {
      if (savedPrefs.current) patchChartPrefs(savedPrefs.current);
    };
  }, [patchChartPrefs]);

  async function scan(fresh: boolean) {
    const token = ++epoch.current;
    stop.current = false;
    setScanning(true);
    setError("");
    if (fresh) {
      setHits([]);
      setStats([]);
      setSkipped([]);
      setSkippedN(0);
      setOpen(null);
      resume.current = 0;
    }
    if (universe === "watch" && !watchSymbols.length) {
      setScanning(false);
      setError("That watchlist is empty.");
      return;
    }
    if (universe === "portfolio" && !portBook.rows.length) {
      setScanning(false);
      setError(selectedPorts.length ? "Those portfolios have no NSE or BSE holdings to scan." : "Select a portfolio first.");
      return;
    }
    let cursor = fresh ? 0 : resume.current;
    let first = true;
    let waits = 0;
    try {
      while (!stop.current && cursor < 20000) {
        const params = new URLSearchParams({
          tf,
          universe,
          mode: "scan",
          cursor: String(cursor),
          fresh: fresh && first ? "1" : "0",
        });
        if (symbolKey) params.set("symbols", symbolKey);
        if (band !== "all") params.set("cap", band);
        if (mcapMin) params.set("mcapMin", mcapMin);
        if (mcapMax) params.set("mcapMax", mcapMax);
        if (includeUnknown) params.set("unknown", "1");
        const res = await fetch("/api/liquidity-scan?" + params.toString());
        const page = (await res.json()) as Page;
        if (token !== epoch.current) return;
        if (!res.ok || page.error) {
          setError(page.error || "The scan did not answer.");
          break;
        }
        if (page.preparing) {
          setMeta((cur) => ({
            universeSize: cur?.universeSize || 0,
            universeNote: page.universeNote,
            timeframeNote: cur?.timeframeNote || "",
            adjusted: cur?.adjusted || false,
            asOf: cur?.asOf || 0,
            keptUntil: cur?.keptUntil ?? null,
            newerCandle: cur?.newerCandle,
            cached: cur?.cached,
            listed: page.listed,
            eligible: page.eligible,
            mcapPending: page.mcapPending,
          }));
          setPhase(`Loading market cap, ${page.mcapPending ?? 0} of ${page.listed ?? 0} still to check. Candle history has not been requested.`);
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        if (page.locked) {
          waits += 1;
          setPhase("Waiting for another scan of this book.");
          if (waits > 20) {
            setError("Another scan of this book is still running. What finished is saved. Continue in a moment.");
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        waits = 0;
        setPhase("");
        if (page.cached && page.cursor == null) {
          take(page, "replace");
          break;
        }
        take(page, page.replace ? "replace" : "add");
        if (page.cursor == null) break;
        cursor = page.cursor;
        first = false;
      }
    } catch {
      if (token === epoch.current) setError("The scan stopped before the history finished loading. What finished is saved. Continue to pick it up.");
    } finally {
      if (token === epoch.current) setScanning(false);
    }
  }

  const rows = sortHits(filterHits(hits, resultFilter), view.sortKey, view.sortDir);

  const groups = {
    strong: view.combined ? [] : rows.filter((hit) => hit.tier === "strong" && hit.status === "confirmed"),
    potential: view.combined ? [] : rows.filter((hit) => hit.tier === "potential" && hit.status !== "developing"),
    developing: view.combined ? [] : rows.filter((hit) => hit.status === "developing"),
  };

  useEffect(() => {
    if (!lists.some((list) => list.id === listId)) setListId(lists[0]?.id || "");
  }, [lists, listId]);

  useEffect(() => {
    setPortfolioIds((cur) => {
      const next = cur.filter((id) => portfolios.some((port) => port.id === id));
      return next.length === cur.length ? cur : next;
    });
  }, [portfolios]);

  function patchFilter(patch: Partial<HitFilter>) {
    if (patch.query != null) setQuery(patch.query);
    if (patch.pattern === "sweep" || patch.pattern === "failed") setPattern(patch.pattern);
    if (patch.direction) setDirection(patch.direction);
    if (patch.exchange) setExchange(patch.exchange);
    if (patch.tier) setTier(patch.tier);
    if (patch.follow) setFollow(patch.follow);
    if (patch.reclaim) setReclaim(patch.reclaim);
    if (patch.swing) setSwing(patch.swing);
    if (patch.cap) setResultCap(patch.cap);
    if (patch.minScore != null) setMinScore(patch.minScore);
    if ("minPrice" in patch) setMinPrice(patch.minPrice == null ? "" : String(patch.minPrice));
    if ("maxPrice" in patch) setMaxPrice(patch.maxPrice == null ? "" : String(patch.maxPrice));
    if (patch.minVolume != null) setHighVolume(true);
    if (patch.minVolume === null) setHighVolume(false);
    if (patch.weak != null) setWeak(patch.weak);
    if (patch.lifecycle) setStatus(patch.lifecycle);
  }

  function clearResultFilters() {
    setQuery("");
    setExchange("all");
    setTier("all");
    setFollow("all");
    setHighVolume(false);
    setMinScore(0);
    setMinPrice("");
    setMaxPrice("");
    setWeak(false);
    setSwing("both");
    setReclaim("all");
    setStatus("all");
    setResultCap("all");
    setDirection("both");
  }

  useEffect(() => {
    setView(loadLiqView((key) => window.localStorage.getItem(key)));
    setViewReady(true);
  }, []);

  useEffect(() => {
    if (!viewReady) return;
    saveLiqView(view, (key, value) => window.localStorage.setItem(key, value));
  }, [view, viewReady]);

  function onSort(key: SortKey) {
    setView((cur) => ({ ...cur, sortKey: key, sortDir: cur.sortKey === key && cur.sortDir === "desc" ? "asc" : "desc" }));
  }

  function closeSide() {
    if (savedPrefs.current) {
      patchChartPrefs(savedPrefs.current);
      savedPrefs.current = null;
    }
    setSide(null);
  }

  function openSide(hit: Hit) {
    if (tf !== "4H") {
      const frame = chartFrame(tf);
      if (!savedPrefs.current) {
        const prefs = useKosh.getState().chartPrefs;
        savedPrefs.current = { interval: prefs.interval, lookback: prefs.lookback };
      }
      patchChartPrefs({ interval: frame.interval, lookback: frame.lookback });
    }
    setSide(hit);
  }

  function openFull(hit: Hit) {
    const frame = chartFrame(tf);
    const focus: LiqFocus = {
      symbol: hit.symbol,
      interval: frame.interval,
      lookback: frame.lookback,
      t: hit.sweepT,
      note: hit.explanation + frame.extra,
      marks: marksFor(hit),
    };
    sessionStorage.setItem(LIQ_FOCUS_KEY, JSON.stringify(focus));
    if (savedPrefs.current) {
      patchChartPrefs(savedPrefs.current);
      savedPrefs.current = null;
    }
    void navigate({ to: "/s/$symbol", params: { symbol: hit.symbol } });
  }

  const shownStats = stats.filter((row) => row.pattern === pattern && (direction === "both" || row.direction === direction));
  const sampleFrom = shownStats.reduce<number | null>((min, row) => (row.fromT != null && (min == null || row.fromT < min) ? row.fromT : min), null);
  const sampleTo = shownStats.reduce<number | null>((max, row) => (row.toT != null && (max == null || row.toT > max) ? row.toT : max), null);
  const frame = chartFrame(tf);

  return (
    <div className={cn("mt-4", side && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,44%)] lg:items-start lg:gap-3")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <button type="button" className="text-[12px] text-chart hover:underline" onClick={onBack}>
              Back to quality screens
            </button>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">Liquidity & reversal</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-muted">
              A sweep is a real break of a confirmed swing that then closes back through it. A failed break is the wider version of that same test. A listed call drops after 10 bars, or sooner if price closes back through the level. No AI.
            </p>
          </div>
          <button
            type="button"
            className="h-9 rounded-sm bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-50"
            disabled={scanning}
            onClick={() => void scan(savedKind !== "partial")}
          >
            {scanning ? "Scanning…" : savedKind === "partial" ? "Continue" : meta?.newerCandle ? "Refresh" : savedKind === "done" ? "Scan again" : "Scan"}
          </button>
        </div>

        <div className="mt-3 flex gap-1" role="tablist" aria-label="Liquidity screen">
          {(
            [
              ["sweep", "Liquidity sweep & reclaim"],
              ["failed", "Failed breakdown / breakout"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={pattern === id}
              className={cn("h-8 rounded-sm px-2.5 text-[12px]", pattern === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}
              onClick={() => setPattern(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-sm bg-surface p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Timeframe">
            {TFS.map((id) => (
              <button key={id} type="button" className={cn("h-7 rounded-sm px-2 text-[12px]", tf === id ? "bg-bg text-fg" : "text-muted")} onClick={() => setTf(id)}>
                {id}
              </button>
            ))}
          </div>
          <select aria-label="Direction" value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)} className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]">
            <option value="both">Bullish and bearish</option>
            <option value="bull">Bullish</option>
            <option value="bear">Bearish</option>
          </select>
          <select aria-label="Signal status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]">
            <option value="all">All statuses</option>
            <option value="confirmed">Reclaimed</option>
            <option value="follow">Follow-through</option>
            <option value="potential">Potential</option>
            <option value="developing">Developing</option>
          </select>
          <select aria-label="Universe" value={universe} onChange={(e) => setUniverse(e.target.value as typeof universe)} className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]">
            {UNIVERSES.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          {universe === "watch" ? (
            <select aria-label="Watchlist" value={listId} onChange={(e) => setListId(e.target.value)} className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]">
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          ) : null}
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a name" aria-label="Find a result" className="h-8 w-36 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)] outline-none" />
          <button type="button" className="h-8 px-2 text-[12px] text-muted" onClick={() => setAdvanced((v) => !v)}>
            {advanced ? "Hide filters" : "More filters"}
          </button>
          {scanning ? (
            <button type="button" className="h-8 px-2 text-[12px] text-down" onClick={() => { stop.current = true; }}>
              Stop
            </button>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
          <select aria-label="Market cap band" value={band} onChange={(e) => setBand(e.target.value as typeof band)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
            <option value="all">All market caps</option>
            <option value="large">Large cap</option>
            <option value="mid">Mid cap</option>
            <option value="small">Small cap</option>
            <option value="micro">Micro cap</option>
            <option value="nano">Nano cap</option>
          </select>
          <label className="flex items-center gap-1 text-muted">
            Min ₹ Cr
            <input aria-label="Minimum market cap" value={mcapMin} onChange={(e) => setMcapMin(e.target.value)} className="h-8 w-20 rounded-sm bg-surface px-2 text-fg shadow-[var(--shadow-border)] outline-none" />
          </label>
          <label className="flex items-center gap-1 text-muted">
            Max ₹ Cr
            <input aria-label="Maximum market cap" value={mcapMax} onChange={(e) => setMcapMax(e.target.value)} className="h-8 w-20 rounded-sm bg-surface px-2 text-fg shadow-[var(--shadow-border)] outline-none" />
          </label>
          <label className="flex items-center gap-1 text-muted">
            <input type="checkbox" checked={includeUnknown} onChange={(e) => setIncludeUnknown(e.target.checked)} />
            Include unknown cap
          </label>
          <select aria-label="Shown exchange" value={exchange} onChange={(e) => setExchange(e.target.value as typeof exchange)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
            <option value="all">Show NSE and BSE</option>
            <option value="NSE">Show NSE rows</option>
            <option value="BSE">Show BSE rows</option>
          </select>
        </div>

        {universe === "portfolio" ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <button type="button" className="h-7 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]" onClick={() => setPortfolioIds(portfolios.map((port) => port.id))}>Select all</button>
            <button type="button" className="h-7 px-2 text-muted" onClick={() => setPortfolioIds([])}>None</button>
            {!portfolios.length ? <span className="text-muted">No portfolios in Kosh yet.</span> : null}
            {portfolios.map((port) => (
              <label key={port.id} className="flex items-center gap-1 text-muted">
                <input
                  type="checkbox"
                  checked={portfolioIds.includes(port.id)}
                  onChange={(e) => setPortfolioIds((cur) => e.target.checked ? [...cur, port.id] : cur.filter((id) => id !== port.id))}
                />
                {port.name}{port.holdings?.length ? "" : " (empty)"}
              </label>
            ))}
            <span className="text-subtle">{portBook.rows.length} unique listings{portBook.rows.length > 400 ? " · first 400 are scanned" : ""}{portBook.unmapped.length ? ` · ${portBook.unmapped.length} not mapped` : ""}</span>
          </div>
        ) : null}
        {universe === "portfolio" && selectedPorts.length > 0 && selectedPorts.every((port) => !(port.holdings || []).length) ? (
          <p className="mt-1 text-[12px] text-muted">Those portfolios are empty.</p>
        ) : null}
        {universe === "portfolio" && portBook.unmapped.length ? (
          <p className="mt-1 text-[11px] text-subtle">{portBook.unmapped.slice(0, 6).map((row) => `${row.symbol}: ${row.reason}`).join(" · ")}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px]">
          {([
            ["Strong only", () => { setTier("strong"); setStatus("confirmed"); }],
            ["Bullish", () => setDirection("bull")],
            ["Bearish", () => setDirection("bear")],
            ["Follow-through", () => setFollow("yes")],
            ["Small cap", () => setBand("small")],
            ["Large cap", () => setBand("large")],
            ["High volume", () => setHighVolume(true)],
          ] as const).map(([label, apply]) => (
            <button key={label} type="button" className="h-7 rounded-sm bg-surface px-2 text-muted shadow-[var(--shadow-border)]" onClick={apply}>{label}</button>
          ))}
          <button type="button" className="h-7 px-2 text-muted" onClick={clearResultFilters}>Clear filters{filterCount ? ` (${filterCount})` : ""}</button>
          {filterNotes.length ? <span className="text-subtle">{filterNotes.join(" · ")}</span> : null}
          <button type="button" className="h-7 px-2 text-muted" onClick={() => setView((cur) => ({ ...cur, combined: !cur.combined }))}>{view.combined ? "Grouped" : "One list"}</button>
          <button type="button" className="h-7 px-2 text-muted" onClick={() => {
            const blob = new Blob([csvHits(rows)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "kosh-liquidity.csv";
            link.click();
            URL.revokeObjectURL(url);
          }}>Export shown</button>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-sm bg-surface px-2 py-1 text-muted shadow-[var(--shadow-border)]">Columns</summary>
            <div className="absolute z-30 mt-1 grid w-44 gap-1 rounded-sm bg-surface p-2 shadow-[var(--shadow-border)]">
              {(["name", "exchange", "mcap", "direction", "pattern", "tier", "price", "level", "distance", "depth", "reclaim", "volume", "touches", "follow", "date", "status", "score", "actions"] as const).map((id) => (
                <label key={id} className="flex items-center gap-1">
                  <input type="checkbox" checked={view.columns.includes(id)} onChange={(e) => setView((cur) => ({ ...cur, columns: e.target.checked ? [...cur.columns, id] : cur.columns.filter((col) => col !== id) }))} />
                  {id === "actions" ? "Actions" : COLUMN_LABEL[id]}
                </label>
              ))}
            </div>
          </details>
        </div>

        {advanced ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <select aria-label="Strength" value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
              <option value="all">Any strength</option>
              <option value="strong">Strong</option>
              <option value="potential">Potential</option>
              <option value="developing">Developing</option>
            </select>
            <select aria-label="Follow-through" value={follow} onChange={(e) => setFollow(e.target.value as typeof follow)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
              <option value="all">Any follow-through</option>
              <option value="yes">Follow-through</option>
              <option value="no">No follow-through</option>
            </select>
            <select aria-label="Swing type" value={swing} onChange={(e) => setSwing(e.target.value as typeof swing)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
              <option value="both">Individual and repeated</option>
              <option value="single">Individual swing</option>
              <option value="equal">Equal / repeated</option>
            </select>
            <select aria-label="Closed back" value={reclaim} onChange={(e) => setReclaim(e.target.value as typeof reclaim)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
              <option value="all">Any close back</option>
              <option value="same">Same candle</option>
              <option value="one">Next candle</option>
              <option value="two">Two candles</option>
              <option value="three">Three candles</option>
              <option value="later">Later</option>
            </select>
            <label className="flex items-center gap-1 text-muted">
              Min score
              <input aria-label="Minimum quality score" value={minScore} onChange={(e) => setMinScore(Number(e.target.value) || 0)} className="h-8 w-16 rounded-sm bg-surface px-2 text-fg shadow-[var(--shadow-border)] outline-none" />
            </label>
            <label className="flex items-center gap-1 text-muted">
              Min price
              <input aria-label="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-8 w-20 rounded-sm bg-surface px-2 text-fg shadow-[var(--shadow-border)] outline-none" />
            </label>
            <label className="flex items-center gap-1 text-muted">
              Max price
              <input aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-8 w-20 rounded-sm bg-surface px-2 text-fg shadow-[var(--shadow-border)] outline-none" />
            </label>
            <label className="flex items-center gap-1 text-muted">
              <input type="checkbox" checked={weak} onChange={(e) => setWeak(e.target.checked)} />
              Show scores under 55
            </label>
            <input value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Save this setup" aria-label="Setup name" className="h-8 w-40 rounded-sm bg-surface px-2 outline-none shadow-[var(--shadow-border)]" />
            <button type="button" className="h-8 px-2 text-muted" onClick={() => {
              const name = setupName.trim();
              if (!name) return;
              const setup: LiqSetup = {
                id: `${Date.now()}`,
                name,
                pattern,
                tf,
                direction,
                universe,
                listId,
                portfolioIds,
                band,
                mcapMin,
                mcapMax,
                includeUnknown,
                filter: resultFilter,
                columns: view.columns,
                sortKey: view.sortKey,
                sortDir: view.sortDir,
                combined: view.combined,
              };
              setView((cur) => ({ ...cur, setups: [setup, ...cur.setups.filter((row) => row.name !== name)].slice(0, 24) }));
              setSetupName("");
            }}>Save</button>
          </div>
        ) : null}

        {view.setups.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[12px]">
            {view.setups.map((setup) => (
              <span key={setup.id} className="inline-flex items-center gap-1 rounded-sm bg-surface px-2 py-1 shadow-[var(--shadow-border)]">
                {renaming === setup.id ? (
                  <input
                    aria-label={`Rename ${setup.name}`}
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      const name = renameTo.trim();
                      if (!name) return;
                      setView((cur) => ({ ...cur, setups: cur.setups.map((row) => row.id === setup.id ? { ...row, name } : row) }));
                      setRenaming(null);
                    }}
                    className="h-6 w-36 bg-transparent outline-none"
                  />
                ) : (
                  <button type="button" onClick={() => {
                    const known = new Set(portfolios.map((port) => port.id));
                    const wanted = setup.portfolioIds || [];
                    const missing = wanted.filter((id) => !known.has(id));
                    setPattern(setup.pattern);
                    setTf(setup.tf as LiqTimeframe);
                    setDirection(setup.direction);
                    setUniverse(setup.universe as typeof universe);
                    setListId(setup.listId);
                    setPortfolioIds(wanted.filter((id) => known.has(id)));
                    setBand(setup.band);
                    setMcapMin(setup.mcapMin);
                    setMcapMax(setup.mcapMax);
                    setIncludeUnknown(setup.includeUnknown);
                    setQuery(setup.filter?.query || "");
                    setExchange(setup.filter?.exchange || "all");
                    setTier(setup.filter?.tier || "all");
                    setFollow(setup.filter?.follow || "all");
                    setReclaim(setup.filter?.reclaim || "all");
                    setSwing(setup.filter?.swing || "both");
                    setMinScore(setup.filter?.minScore || 0);
                    setMinPrice(setup.filter?.minPrice == null ? "" : String(setup.filter.minPrice));
                    setMaxPrice(setup.filter?.maxPrice == null ? "" : String(setup.filter.maxPrice));
                    setWeak(Boolean(setup.filter?.weak));
                    setStatus(setup.filter?.lifecycle || "all");
                    setHighVolume(setup.filter?.minVolume != null);
                    setResultCap(setup.filter?.cap || "all");
                    setView((cur) => ({ ...cur, columns: setup.columns?.length ? setup.columns : cur.columns, sortKey: setup.sortKey || cur.sortKey, sortDir: setup.sortDir || cur.sortDir, combined: setup.combined }));
                    setError(missing.length ? "A saved portfolio is no longer in Kosh. The rest of this setup was restored. Run the scan when you want fresh results." : "");
                  }}>{setup.name}</button>
                )}
                <button type="button" className="text-subtle" onClick={() => { setRenaming(setup.id); setRenameTo(setup.name); }}>Rename</button>
                <button type="button" aria-label={`Delete ${setup.name}`} className="text-subtle" onClick={() => setView((cur) => ({ ...cur, setups: cur.setups.filter((row) => row.id !== setup.id) }))}>×</button>
              </span>
            ))}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-[13px] text-muted">{error}</p> : null}
        <p className="mt-3 text-[12px] text-subtle">
          {phase.startsWith("Waiting") ? "Waiting for another scan. " : scanning && savedKind === "partial" ? "Resuming a saved scan. " : scanning ? "In progress. " : savedKind === "partial" ? "Partially completed. " : savedKind === "done" && (band !== "all" || mcapMin || mcapMax) ? "Completed for the eligible names only. This is not a full-universe scan. " : savedKind === "done" ? "Completed. " : "Not started. "}
          {phase && !phase.startsWith("Waiting") ? `${phase} ` : ""}
          {meta?.listed != null ? `${meta.listed} in the universe. ` : ""}
          {meta?.mcapPending ? "" : band !== "all" || mcapMin || mcapMax
            ? `${meta?.eligible ?? "—"} eligible after market cap, ${meta?.mcapExcluded ?? 0} excluded, ${meta?.mcapMissing ?? 0} without a cap, ${meta?.mcapUnavailable ?? 0} whose quote did not answer. `
            : "No market-cap filter. "}
          {meta?.mcapAsOf ? `Caps as of ${new Date(meta.mcapAsOf).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}. ` : ""}
          {progress ? `${progress.done} of ${progress.size} eligible names scanned. ` : ""}
          {rows.length} of {hits.length} signals after filters. {tf}.
          {meta?.universeNote ? ` ${meta.universeNote}` : " Nothing is scanned until you ask. A market-cap band is applied before candle history is fetched. Bands are Kosh working cuts (large from ₹20,000 Cr, mid from ₹5,000 Cr, small from ₹500 Cr, micro from ₹50 Cr, nano below that), not a SEBI classification. Missing caps are not treated as zero."}
          {savedKind === "partial" ? " What finished is saved. Continue picks up the rest. This is not a finished full-universe scan." : ""}
          {meta?.keptUntil ? ` Kept until ${new Date(meta.keptUntil).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST (${LIFE[tf]}).` : ""}
          {meta?.newerCandle ? " A newer candle may have started." : ""}
        </p>

        {view.combined ? (
          <ResultTable title="All signals" hint="Strong, Potential and Developing in one list. A higher score is not a probability." rows={rows} columns={view.columns} sortKey={view.sortKey} sortDir={view.sortDir} onSort={onSort} filter={resultFilter} onFilter={patchFilter} selected={side?.id || ""} compared={compare} onOpen={openSide} onInspect={setOpen} onCopy={(hit) => void navigator.clipboard?.writeText(hit.symbol)} onWatch={(hit) => setActionFor({ hit, kind: "watch", dest: lists[0]?.id || "" })} onPortfolio={(hit) => setActionFor({ hit, kind: "portfolio", dest: portfolios[0]?.id || "" })} onCompare={(hit) => setCompare((cur) => cur.includes(hit.id) ? cur.filter((id) => id !== hit.id) : [...cur, hit.id].slice(0, 4))} />
        ) : (
          <>
            <ResultTable title="Strong structure" hint="Closed reclaim and convincing structure. Not follow-through and not a confirmed reversal." rows={status === "developing" || status === "potential" || tier === "potential" || tier === "developing" ? [] : groups.strong} columns={view.columns} sortKey={view.sortKey} sortDir={view.sortDir} onSort={onSort} filter={resultFilter} onFilter={patchFilter} selected={side?.id || ""} compared={compare} onOpen={openSide} onInspect={setOpen} onCopy={(hit) => void navigator.clipboard?.writeText(hit.symbol)} onWatch={(hit) => setActionFor({ hit, kind: "watch", dest: lists[0]?.id || "" })} onPortfolio={(hit) => setActionFor({ hit, kind: "portfolio", dest: portfolios[0]?.id || "" })} onCompare={(hit) => setCompare((cur) => cur.includes(hit.id) ? cur.filter((id) => id !== hit.id) : [...cur, hit.id].slice(0, 4))} />
            <ResultTable title="Potential" hint="The reclaim structure is there. At least one supporting piece is weaker." rows={status === "developing" || tier === "strong" || tier === "developing" ? [] : groups.potential} columns={view.columns} sortKey={view.sortKey} sortDir={view.sortDir} onSort={onSort} filter={resultFilter} onFilter={patchFilter} selected={side?.id || ""} compared={compare} onOpen={openSide} onInspect={setOpen} onCopy={(hit) => void navigator.clipboard?.writeText(hit.symbol)} onWatch={(hit) => setActionFor({ hit, kind: "watch", dest: lists[0]?.id || "" })} onPortfolio={(hit) => setActionFor({ hit, kind: "portfolio", dest: portfolios[0]?.id || "" })} onCompare={(hit) => setCompare((cur) => cur.includes(hit.id) ? cur.filter((id) => id !== hit.id) : [...cur, hit.id].slice(0, 4))} />
            <ResultTable title="Developing" hint="The candle has not closed. This can disappear. It is never Strong structure." rows={status === "confirmed" || status === "potential" || status === "follow" || tier === "strong" || tier === "potential" ? [] : groups.developing} columns={view.columns} sortKey={view.sortKey} sortDir={view.sortDir} onSort={onSort} filter={resultFilter} onFilter={patchFilter} selected={side?.id || ""} compared={compare} onOpen={openSide} onInspect={setOpen} onCopy={(hit) => void navigator.clipboard?.writeText(hit.symbol)} onWatch={(hit) => setActionFor({ hit, kind: "watch", dest: lists[0]?.id || "" })} onPortfolio={(hit) => setActionFor({ hit, kind: "portfolio", dest: portfolios[0]?.id || "" })} onCompare={(hit) => setCompare((cur) => cur.includes(hit.id) ? cur.filter((id) => id !== hit.id) : [...cur, hit.id].slice(0, 4))} />
          </>
        )}

        {compare.length > 1 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="py-1 pr-3">Stock</th>
                  <th className="py-1 pr-3">Mcap</th>
                  <th className="py-1 pr-3">Score</th>
                  <th className="py-1 pr-3">Sweep</th>
                  <th className="py-1 pr-3">Reclaim</th>
                  <th className="py-1 pr-3">Volume</th>
                  <th className="py-1 pr-3">Follow-through</th>
                  <th className="py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {hits.filter((hit) => compare.includes(hit.id)).map((hit) => (
                  <tr key={hit.id} className="border-t border-border font-mono tabular">
                    <td className="py-1 pr-3 font-sans">{hit.symbol}</td>
                    <td className="py-1 pr-3">{hit.mcapCr != null ? Math.round(hit.mcapCr).toLocaleString("en-IN") : "—"}</td>
                    <td className="py-1 pr-3">{hit.score} · {hit.parts.swing}/{hit.parts.sweep}/{hit.parts.reclaim}/{hit.parts.volume}/{hit.parts.candle}/{hit.parts.confirm}</td>
                    <td className="py-1 pr-3">{hit.depthPct.toFixed(1)}%</td>
                    <td className="py-1 pr-3">{hit.parts.reclaim}</td>
                    <td className="py-1 pr-3">{hit.volumeTrust === "neutral" ? "Split" : hit.volumeRatio == null ? "—" : `${Math.round(hit.volumeRatio * 100)}%`}</td>
                    <td className="py-1 pr-3">{hit.followThrough ? "Yes" : "No"}</td>
                    <td className="py-1">{when(hit.sweepT)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {actionFor ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-muted">{actionFor.kind === "watch" ? "Add to watchlist" : "Record 1 unit only if this ticker is not already held"} · {actionFor.hit.symbol}. This does not place an order and does not change an existing quantity.</span>
            <select aria-label="Destination" value={actionFor.dest} onChange={(e) => setActionFor({ ...actionFor, dest: e.target.value })} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
              {(actionFor.kind === "watch" ? lists : portfolios).map((row) => (
                <option key={row.id} value={row.id}>{row.name}</option>
              ))}
            </select>
            <button type="button" className="h-8 rounded-sm bg-accent px-2 text-accent-fg" onClick={() => {
              if (actionFor.kind === "watch") addToWatchList(actionFor.dest, actionFor.hit.symbol);
              else {
                const port = portfolios.find((row) => row.id === actionFor.dest);
                const bare = actionFor.hit.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
                const exists = (port?.holdings || []).some((row) => row.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase() === bare);
                if (exists) setError("That ticker is already in the portfolio. The quantity was left unchanged.");
                else addHoldings(actionFor.dest, [{ symbol: actionFor.hit.symbol, name: actionFor.hit.name, qty: 1, avg: actionFor.hit.reclaimClose, date: null }]);
              }
              setActionFor(null);
            }}>Add</button>
            <button type="button" className="h-8 px-2 text-muted" onClick={() => setActionFor(null)}>Cancel</button>
          </div>
        ) : null}

        {open ? (
          <div className="mt-3 rounded-md bg-surface p-3 text-[13px] shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{open.symbol} · {open.tier}</h3>
                <p className="mt-1 text-muted">{open.explanation}</p>
              </div>
              <button type="button" className="text-[12px] text-muted" onClick={() => setOpen(null)}>Close</button>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[12px] tabular sm:grid-cols-3">
              <dt className="text-subtle">Swing</dt><dd>{open.parts.swing}/20</dd>
              <dt className="text-subtle">Break</dt><dd>{open.parts.sweep}/20</dd>
              <dt className="text-subtle">Closed back</dt><dd>{open.reclaimClosed ? "Yes" : "Not closed"} · {open.parts.reclaim}/20</dd>
              <dt className="text-subtle">Volume</dt><dd>{open.volumeTrust === "neutral" ? "Not used · split" : open.volumeKnown ? `${open.parts.volume}/15` : "Not on the tape"}</dd>
              <dt className="text-subtle">Candle</dt><dd>{open.parts.candle}/15</dd>
              <dt className="text-subtle">Follow-through</dt><dd>{open.followThrough ? "Yes" : "No"} · {open.parts.confirm}/10</dd>
            </dl>
            {open.weaknesses.length ? <ul className="mt-2 list-disc pl-4 text-[12px] text-muted">{open.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul> : null}
            <button type="button" className="mt-2 text-[12px] text-chart hover:underline" onClick={() => openSide(open)}>Show the chart beside the list</button>
          </div>
        ) : null}

        {shownStats.length ? (
          <div className="mt-4">
            <h3 className="text-[13px] font-semibold">Measured after the close back, on this scan only</h3>
            <p className="mt-1 max-w-2xl text-[12px] text-muted">Measured on the loaded {tf} bars after the close back{sampleFrom ? `, from ${when(sampleFrom)} to ${when(sampleTo)} IST` : ""}. Strong structure and Potential are separate. Each horizon has its own sample. Names is how many securities contributed. Overlap is a later signal on a level that already had one. First-only keeps the earliest signal on that level. Excess is the signed return minus Nifty only where both bars existed. A missing Nifty bar is unmatched, not a zero excess. Incomplete means the tape ended first. Invalidated paths are not averaged in. This is not a prediction, and a synthetic test is not this sample.</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12px]">
                <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
                  <tr>
                    <th className="py-1 pr-3">Quality</th>
                    <th className="py-1 pr-3">Side</th>
                    <th className="py-1 pr-3">Signals</th>
                    <th className="py-1 pr-3">Names</th>
                    <th className="py-1 pr-3">+1</th>
                    <th className="py-1 pr-3">+3</th>
                    <th className="py-1 pr-3">+5</th>
                    <th className="py-1 pr-3">+8</th>
                    <th className="py-1 pr-3">Median favourable</th>
                    <th className="py-1 pr-3">Median adverse</th>
                    <th className="py-1 pr-3">Excess +1</th>
                    <th className="py-1 pr-3">First-only +1</th>
                    <th className="py-1">Invalidated</th>
                  </tr>
                </thead>
                <tbody>
                  {shownStats.map((row) => (
                    <tr key={`${row.pattern}-${row.direction}-${row.quality || "all"}-${row.n}`} className="border-t border-border font-mono tabular">
                      <td className="py-1 pr-3">{row.quality === "strong" ? "Strong structure" : row.quality === "potential" ? "Potential" : "—"}</td>
                      <td className="py-1 pr-3">{row.direction === "bull" ? "Bullish" : "Bearish"}</td>
                      <td className="py-1 pr-3">{row.n}{row.overlapping ? ` (${row.overlapping} overlap)` : ""}{row.independentN != null ? ` / ${row.independentN} first` : ""}</td>
                      <td className="py-1 pr-3">{row.symbols?.length || "—"}</td>
                      <td className="py-1 pr-3">{num(row.avg.c1)} <span className="text-subtle">n={row.samples?.c1 ?? row.withForward}</span></td>
                      <td className="py-1 pr-3">{num(row.avg.c3)} <span className="text-subtle">n={row.samples?.c3 ?? "—"}</span></td>
                      <td className="py-1 pr-3">{num(row.avg.c5)} <span className="text-subtle">n={row.samples?.c5 ?? "—"}</span></td>
                      <td className="py-1 pr-3">{num(row.avg.c8)} <span className="text-subtle">n={row.samples?.c8 ?? "—"}</span></td>
                      <td className="py-1 pr-3">{num(row.medianMfe)}</td>
                      <td className="py-1 pr-3">{num(row.medianMae)}</td>
                      <td className="py-1 pr-3">{num(row.excessAvg?.c1 ?? null)} <span className="text-subtle">n={row.benchMatched?.c1 ?? row.excessSamples?.c1 ?? 0}{row.benchUnmatched?.c1 ? ` · ${row.benchUnmatched.c1} unmatched` : ""}</span></td>
                      <td className="py-1 pr-3">{num(row.indepMedian?.c1 ?? null)} <span className="text-subtle">n={row.independentN ?? 0}</span></td>
                      <td className="py-1">{row.invalidated}{row.incomplete?.c8 ? ` · ${row.incomplete.c8} short of 8` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {meta?.asOf ? (
          <p className="mt-3 text-[11px] text-subtle">
            {meta.universeNote} {skippedN ? `${skippedN} names had no usable history and were not treated as scanned.` : "No names were skipped in what has loaded."} {savedKind !== "done" && progress ? "The book is not finished." : ""} {meta.adjusted ? "Prices use Yahoo’s adjusted close when it differs from the raw close, so the whole candle stays on one series." : "No adjustment was needed on the candles that loaded."} {meta.cached ? "Opened from the saved run." : ""} {meta.newerCandle ? "A newer candle may have started, so this save is not the current bar." : ""}
          </p>
        ) : null}
        {skipped.length ? (
          <details className="mt-1 text-[12px] text-muted">
            <summary>Skipped names</summary>
            <ul className="mt-1 max-h-40 overflow-auto">
              {skipped.slice(0, 40).map((row) => (
                <li key={row.symbol + row.reason}>{row.symbol}: {row.reason}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      {side ? (
        <aside
          className="fixed inset-0 z-40 flex flex-col bg-bg lg:static lg:z-auto lg:h-[min(78vh,820px)] lg:overflow-hidden lg:rounded-lg lg:shadow-[var(--shadow-border)]"
          aria-label="Selected stock chart"
        >
          <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-2">
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold">{side.name}</h2>
              <p className="text-[11px] text-subtle">{side.symbol} · {side.exchange} · {tf === "4H" ? "4H folded from 1H" : tf} · {stageLabel(side)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" className="h-8 px-2 text-[11px] text-muted hover:text-fg" onClick={() => openFull(side)}>
                Full page
              </button>
              <button type="button" className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]" onClick={closeSide}>
                Close chart
              </button>
            </div>
          </div>
          <p className="px-3 py-2 text-[12px] text-muted">{side.explanation}{tf === "4H" ? "" : frame.extra} The marks are not saved into your drawings.</p>
          <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
            {tf === "4H" ? (
              <LiquidityTape symbol={side.symbol} hit={side} />
            ) : (
              <Suspense fallback={<p className="p-4 text-[13px] text-muted">Loading the chart…</p>}>
                <CandleChart
                  key={`${side.symbol}-${frame.interval}`}
                  symbol={side.symbol}
                  bars={[] as OhlcBar[]}
                  focus={{ t: side.sweepT, marks: marksFor(side), note: side.explanation }}
                />
              </Suspense>
            )}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
