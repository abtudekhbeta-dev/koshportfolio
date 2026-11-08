import { useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { fmtPx } from "@/lib/kosh/engine";
import { LIQ_FOCUS_KEY, mergeStats, type ForwardStats, type LiqEvent, type LiqFocus, type LiqTimeframe } from "@/lib/kosh/liquidity";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ChartMark, OhlcBar } from "@/lib/kosh/types";
import { LiquidityTape } from "@/components/liquidity-tape";

const CandleChart = lazy(() => import("@/components/charts/candle-chart").then((m) => ({ default: m.CandleChart })));

type Hit = LiqEvent & { symbol: string; name: string; exchange: "NSE" | "BSE" };

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

function closedBack(n: number | null) {
  if (n == null) return "Not yet";
  if (n <= 0) return "Same candle";
  if (n === 1) return "Next candle";
  return `${n} candles`;
}

function volPct(ratio: number | null) {
  if (ratio == null || !Number.isFinite(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
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
  const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
  const [pattern, setPattern] = useState<"sweep" | "failed">("sweep");
  const [tf, setTf] = useState<LiqTimeframe>("1W");
  const [direction, setDirection] = useState<"bull" | "bear" | "both">("both");
  const [status, setStatus] = useState<"developing" | "confirmed" | "potential" | "follow" | "all">("all");
  const [swing, setSwing] = useState<"both" | "single" | "equal">("both");
  const [reclaim, setReclaim] = useState<"all" | "same" | "one" | "two" | "three">("all");
  const [universe, setUniverse] = useState<(typeof UNIVERSES)[number][0]>("nifty50");
  const [listId, setListId] = useState(lists[0]?.id || "");
  const [minScore, setMinScore] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [weak, setWeak] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [stats, setStats] = useState<ForwardStats[]>([]);
  const [skipped, setSkipped] = useState<{ symbol: string; reason: string }[]>([]);
  const [skippedN, setSkippedN] = useState(0);
  const [meta, setMeta] = useState<Pick<Page, "universeSize" | "universeNote" | "timeframeNote" | "adjusted" | "asOf" | "keptUntil" | "newerCandle" | "cached"> | null>(null);
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
  const watchKey = watchSymbols.join(",");

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
    if (watchKey) params.set("symbols", watchKey);
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
  }, [tf, universe, watchKey]);

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
        if (watchSymbols.length) params.set("symbols", watchSymbols.join(","));
        const res = await fetch("/api/liquidity-scan?" + params.toString());
        const page = (await res.json()) as Page;
        if (token !== epoch.current) return;
        if (!res.ok || page.error) {
          setError(page.error || "The scan did not answer.");
          break;
        }
        if (page.locked) {
          waits += 1;
          if (waits > 20) {
            setError("Another scan of this book is still running. What finished is saved. Continue in a moment.");
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        waits = 0;
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

  const rows = hits.filter((hit) => {
    const needle = query.trim().toLowerCase();
    const floor = Number(minPrice);
    if (hit.pattern !== pattern) return false;
    if (direction !== "both" && hit.direction !== direction) return false;
    if (swing === "equal" && !hit.repeated) return false;
    if (swing === "single" && hit.repeated) return false;
    if (reclaim !== "all" && hit.reclaimKind !== reclaim) return false;
    if (hit.score < minScore) return false;
    if (hit.lowQuality && !weak) return false;
    if (Number.isFinite(floor) && floor > 0 && hit.reclaimClose != null && hit.reclaimClose < floor && hit.level < floor) return false;
    if (status === "developing" && hit.status !== "developing") return false;
    if (status === "confirmed" && !(hit.status === "confirmed" && hit.reclaimClosed)) return false;
    if (status === "follow" && !hit.followThrough) return false;
    if (status === "potential" && hit.tier !== "potential") return false;
    if (needle && !hit.symbol.toLowerCase().includes(needle) && !hit.name.toLowerCase().includes(needle)) return false;
    return true;
  });

  const groups = {
    strong: rows.filter((hit) => hit.tier === "strong" && hit.status === "confirmed"),
    potential: rows.filter((hit) => hit.tier === "potential" && hit.status !== "developing"),
    developing: rows.filter((hit) => hit.status === "developing"),
  };

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

        {advanced ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
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
              <input type="checkbox" checked={weak} onChange={(e) => setWeak(e.target.checked)} />
              Show scores under 55
            </label>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-[13px] text-muted">{error}</p> : null}
        {progress ? (
          <p className="mt-3 text-[12px] text-subtle">
            {progress.done} of {progress.size} listed.
            {meta?.universeNote ? ` ${meta.universeNote}` : ""}
            {savedKind === "partial" ? " This pass has not finished the book. What finished is saved. Continue picks up the rest." : savedKind === "done" ? " This pass finished the book that was listed." : ""}
            {meta?.keptUntil ? ` Kept until ${new Date(meta.keptUntil).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST (${LIFE[tf]}).` : ""}
            {meta?.newerCandle ? " Refresh: a newer candle may have started. This save is not the current bar." : ""}
            {meta?.timeframeNote ? ` ${meta.timeframeNote}` : ""}
          </p>
        ) : (
          <p className="mt-3 text-[12px] text-subtle">
            Nothing is scanned until you ask. Weekly is the default. All listed keeps both exchange lines unless the same ISIN is on both. A shared ticker without an ISIN is not merged. A partial BSE pull is not called complete. A name counts only after its history answers or it is explicitly skipped.
          </p>
        )}

        <Group title="Strong structure" hint="Closed reclaim and convincing structure. This is not follow-through and not a confirmed reversal." rows={status === "developing" || status === "potential" ? [] : groups.strong} selected={side?.id || ""} onOpen={openSide} onInspect={setOpen} />
        <Group title="Potential" hint="The reclaim structure is there. At least one supporting piece is weaker. Follow-through is separate." rows={status === "developing" ? [] : groups.potential} selected={side?.id || ""} onOpen={openSide} onInspect={setOpen} />
        <Group title="Developing" hint="The candle has not closed. This can disappear. It is never Strong structure." rows={status === "confirmed" || status === "potential" || status === "follow" ? [] : groups.developing} selected={side?.id || ""} onOpen={openSide} onInspect={setOpen} />

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

function Group({
  title,
  hint,
  rows,
  selected,
  onOpen,
  onInspect,
}: {
  title: string;
  hint: string;
  rows: Hit[];
  selected: string;
  onOpen: (hit: Hit) => void;
  onInspect: (hit: Hit) => void;
}) {
  const [more, setMore] = useState(40);
  const shown = rows.slice(0, more);
  return (
    <section className="mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold">{title} · {rows.length}</h3>
        <p className="text-[11px] text-subtle">{hint}</p>
      </div>
      {!rows.length ? <p className="mt-1 text-[12px] text-muted">None in this group.</p> : null}
      {shown.length ? (
        <div className="mt-1 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12px]">
            <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                <th className="py-1 pr-2">Stock</th>
                <th className="py-1 pr-2">Side</th>
                <th className="py-1 pr-2">Level</th>
                <th className="py-1 pr-2">Broke to</th>
                <th className="py-1 pr-2">Closed back</th>
                <th className="py-1 pr-2">Follow-through</th>
                <th className="py-1 pr-2" title="This bar versus the average of the previous 20 bars">Volume</th>
                <th className="py-1 pr-2">Date</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((hit) => (
                <tr key={hit.id} className={cn("border-t border-border", selected === hit.id && "bg-accent/10")}>
                  <td className="py-1.5 pr-2">
                    <button type="button" className="font-semibold hover:underline" onClick={() => onOpen(hit)}>{hit.symbol}</button>
                    <div className="max-w-[180px] truncate text-[11px] text-subtle">{hit.name} · {hit.exchange}</div>
                  </td>
                  <td className={cn("py-1.5 pr-2", hit.direction === "bull" ? "text-up" : "text-down")}>{hit.direction === "bull" ? "Bullish" : "Bearish"}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{fmtPx(hit.level)}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{fmtPx(hit.extreme)} · {hit.depthPct.toFixed(1)}%</td>
                  <td className="py-1.5 pr-2">{closedBack(hit.reclaimCandles)}</td>
                  <td className="py-1.5 pr-2">{hit.followThrough ? "Yes" : hit.reclaimClosed ? "No" : "—"}</td>
                  <td className="py-1.5 pr-2 font-mono tabular" title="Versus the previous 20 bars">{hit.volumeTrust === "neutral" ? "Split" : volPct(hit.volumeRatio)}</td>
                  <td className="py-1.5 pr-2">{when(hit.sweepT)}</td>
                  <td className="py-1.5 pr-2">{stageLabel(hit)}</td>
                  <td className="py-1.5">
                    <button type="button" className="font-mono tabular hover:underline" onClick={() => onInspect(hit)}>{hit.score}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {rows.length > shown.length ? (
        <button type="button" className="mt-1 text-[12px] text-chart" onClick={() => setMore((n) => n + 40)}>Show more</button>
      ) : null}
    </section>
  );
}
