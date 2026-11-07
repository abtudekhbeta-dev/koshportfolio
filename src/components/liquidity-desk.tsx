import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { fmtPx } from "@/lib/kosh/engine";
import { LIQ_FOCUS_KEY, mergeStats, type ForwardStats, type LiqEvent, type LiqFocus, type LiqTimeframe } from "@/lib/kosh/liquidity";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ChartMark } from "@/lib/kosh/types";

type Hit = LiqEvent & { symbol: string; name: string; exchange: "NSE" | "BSE" };

type Page = {
  hits: Hit[];
  stats: ForwardStats[];
  scanned: { symbol: string; bars: number; from: number | null; to: number | null }[];
  skipped: { symbol: string; reason: string }[];
  cursor: number | null;
  universeSize: number;
  universeNote: string;
  timeframeNote: string;
  adjusted: boolean;
  asOf: number;
  error?: string;
};

const TFS: LiqTimeframe[] = ["15m", "1H", "4H", "1D", "1W", "1M"];
const UNIVERSES = [
  ["nifty50", "Nifty 50"],
  ["nifty100", "Nifty 100"],
  ["nifty200", "Nifty 200"],
  ["nifty500", "Nifty 500"],
  ["nse", "NSE master"],
  ["watch", "Watchlist"],
] as const;

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
  if (tf === "4H") return { interval: "1H", lookback: "1Y", extra: " The chart opens on 1-hour because Kosh has no 4-hour frame. The prices are from the 4-hour scan." };
  if (tf === "1D") return { interval: "1D", lookback: "5Y", extra: "" };
  if (tf === "1M") return { interval: "1M", lookback: "MAX", extra: "" };
  return { interval: "1W", lookback: "10Y", extra: "" };
}

export function LiquidityDesk({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const lists = useKosh((s) => s.watchlists);
  const [pattern, setPattern] = useState<"sweep" | "failed">("sweep");
  const [tf, setTf] = useState<LiqTimeframe>("1W");
  const [direction, setDirection] = useState<"bull" | "bear" | "both">("both");
  const [status, setStatus] = useState<"developing" | "confirmed" | "potential" | "all">("all");
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
  const [meta, setMeta] = useState<Pick<Page, "universeSize" | "universeNote" | "timeframeNote" | "adjusted" | "asOf"> | null>(null);
  const [progress, setProgress] = useState<{ done: number; size: number } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Hit | null>(null);
  const stop = useRef(false);

  async function scan() {
    stop.current = false;
    setScanning(true);
    setError("");
    setHits([]);
    setStats([]);
    setSkipped([]);
    setOpen(null);
    const symbols = universe === "watch" ? (lists.find((l) => l.id === listId) || lists[0])?.symbols || [] : [];
    if (universe === "watch" && !symbols.length) {
      setScanning(false);
      setError("That watchlist is empty.");
      return;
    }
    const cap = universe === "nse" ? 18 : 600;
    let cursor = 0;
    let size = 0;
    try {
      while (!stop.current && cursor < cap) {
        const params = new URLSearchParams({ tf, universe, cursor: String(cursor) });
        if (symbols.length) params.set("symbols", symbols.join(","));
        const res = await fetch("/api/liquidity-scan?" + params.toString());
        const page = (await res.json()) as Page;
        if (!res.ok || page.error) {
          setError(page.error || "The scan did not answer.");
          break;
        }
        size = page.universeSize;
        setMeta({ universeSize: page.universeSize, universeNote: page.universeNote, timeframeNote: page.timeframeNote, adjusted: page.adjusted, asOf: page.asOf });
        setHits((cur) => {
          const ids = new Set(cur.map((hit) => hit.id));
          const next = cur.slice();
          for (const hit of page.hits) {
            if (ids.has(hit.id)) continue;
            ids.add(hit.id);
            next.push(hit);
          }
          return next;
        });
        setStats((cur) => mergeStats([...cur, ...page.stats]));
        setSkipped((cur) => [...cur, ...page.skipped]);
        const done = page.cursor ?? page.universeSize;
        setProgress({ done: Math.min(done, cap, page.universeSize), size: page.universeSize });
        if (page.cursor == null) break;
        cursor = page.cursor;
        if (universe === "nse" && cursor >= cap) break;
      }
    } catch {
      setError("The scan stopped before the history finished loading.");
    } finally {
      setScanning(false);
    }
  }

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const floor = Number(minPrice);
    return hits.filter((hit) => {
      if (hit.pattern !== pattern) return false;
      if (direction !== "both" && hit.direction !== direction) return false;
      if (swing === "equal" && !hit.repeated) return false;
      if (swing === "single" && hit.repeated) return false;
      if (reclaim !== "all" && hit.reclaimKind !== reclaim) return false;
      if (hit.score < minScore) return false;
      if (hit.lowQuality && !weak) return false;
      if (Number.isFinite(floor) && floor > 0 && hit.reclaimClose != null && hit.reclaimClose < floor && hit.level < floor) return false;
      if (status === "developing" && hit.status !== "developing") return false;
      if (status === "confirmed" && hit.status !== "confirmed") return false;
      if (status === "potential" && hit.tier !== "potential") return false;
      if (needle && !hit.symbol.toLowerCase().includes(needle) && !hit.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [hits, pattern, direction, swing, reclaim, minScore, minPrice, weak, status, query]);

  const groups = {
    strong: rows.filter((hit) => hit.tier === "strong" && hit.status === "confirmed"),
    potential: rows.filter((hit) => hit.tier === "potential" && hit.status !== "developing"),
    developing: rows.filter((hit) => hit.status === "developing"),
  };

  function openChart(hit: Hit) {
    const frame = chartFrame(tf);
    const marks: ChartMark[] = [
      { id: hit.id + "-level", kind: "sr", price: hit.level, label: hit.direction === "bull" ? "Swept low" : "Swept high", tone: "chart" },
      { id: hit.id + "-sweep", kind: "swing", price: hit.extreme, t: hit.sweepT, label: "Sweep", tone: hit.direction === "bull" ? "down" : "up" },
    ];
    if (hit.reclaimT && hit.reclaimClose != null) {
      marks.push({ id: hit.id + "-reclaim", kind: "swing", price: hit.reclaimClose, t: hit.reclaimT, label: "Reclaim", tone: hit.direction === "bull" ? "up" : "down" });
    }
    const focus: LiqFocus = {
      symbol: hit.symbol,
      interval: frame.interval,
      lookback: frame.lookback,
      t: hit.sweepT,
      note: hit.explanation + frame.extra,
      marks,
    };
    sessionStorage.setItem(LIQ_FOCUS_KEY, JSON.stringify(focus));
    void navigate({ to: "/s/$symbol", params: { symbol: hit.symbol } });
  }

  const shownStats = stats.filter((row) => row.pattern === pattern && (direction === "both" || row.direction === direction));

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button type="button" className="text-[12px] text-chart hover:underline" onClick={onBack}>
            Back to quality screens
          </button>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight">Liquidity & reversal</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            A sweep is a real break of a confirmed swing that then closes back through it. A failed break is a wider reclaim of the same kind of zone. Strong and potential are separated. A forming candle is never called confirmed.
          </p>
        </div>
        <button
          type="button"
          className="h-9 rounded-sm bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-50"
          disabled={scanning}
          onClick={() => void scan()}
        >
          {scanning ? "Scanning…" : "Scan"}
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
          <option value="confirmed">Confirmed</option>
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
          <select aria-label="Reclaim type" value={reclaim} onChange={(e) => setReclaim(e.target.value as typeof reclaim)} className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]">
            <option value="all">Any reclaim</option>
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
          {progress.done} of {progress.size} names requested.
          {universe === "nse" && progress.size > 18 ? " Only the first 18 names of the NSE master are scanned on one click, so the history feed is not flooded. This is not the whole book, and the next click starts again at the first name. Pick an index for a complete published list." : ""}
          {meta ? ` ${meta.timeframeNote}` : ""}
        </p>
      ) : (
        <p className="mt-3 text-[12px] text-subtle">Nothing is scanned until you ask. Weekly is the default. Nifty lists use the published constituent file. The NSE master does not include a separate BSE book.</p>
      )}

      <Group title="Strong" hint="Confirmed structure and convincing supporting evidence." rows={status === "developing" || status === "potential" ? [] : groups.strong} onOpen={openChart} onInspect={setOpen} />
      <Group title="Potential" hint="The structure is there. At least one supporting piece is weaker." rows={status === "developing" || status === "confirmed" ? [] : groups.potential} onOpen={openChart} onInspect={setOpen} />
      <Group title="Developing" hint="The candle has not closed. This can disappear or confirm." rows={status === "confirmed" || status === "potential" ? [] : groups.developing} onOpen={openChart} onInspect={setOpen} />

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
            <dt className="text-subtle">Sweep</dt><dd>{open.parts.sweep}/20</dd>
            <dt className="text-subtle">Reclaim</dt><dd>{open.parts.reclaim}/20</dd>
            <dt className="text-subtle">Volume</dt><dd>{open.parts.volume}/15</dd>
            <dt className="text-subtle">Candle</dt><dd>{open.parts.candle}/15</dd>
            <dt className="text-subtle">Follow-through</dt><dd>{open.parts.confirm}/10</dd>
          </dl>
          {open.weaknesses.length ? <ul className="mt-2 list-disc pl-4 text-[12px] text-muted">{open.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul> : null}
          <button type="button" className="mt-2 text-[12px] text-chart hover:underline" onClick={() => openChart(open)}>Open on the chart</button>
        </div>
      ) : null}

      {shownStats.length ? (
        <div className="mt-4">
          <h3 className="text-[13px] font-semibold">Measured after the reclaim, on this scan only</h3>
          <p className="mt-1 max-w-2xl text-[12px] text-muted">These are the later candles in the history that was just loaded, counted from the reclaim close. Lost within 8 means a later close back through the level inside that window. They are not a success rate and they are not a forecast. A small sample is a small sample. Averages are weighted by how many signals had a later close. The median columns are medians of each name’s median, not one pooled median.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="py-1 pr-3">Side</th>
                  <th className="py-1 pr-3">Signals</th>
                  <th className="py-1 pr-3">With a later close</th>
                  <th className="py-1 pr-3">+1</th>
                  <th className="py-1 pr-3">+3</th>
                  <th className="py-1 pr-3">+5</th>
                  <th className="py-1 pr-3">+8</th>
                  <th className="py-1 pr-3">Median favourable</th>
                  <th className="py-1 pr-3">Median adverse</th>
                  <th className="py-1">Lost within 8</th>
                </tr>
              </thead>
              <tbody>
                {shownStats.map((row) => (
                  <tr key={`${row.pattern}-${row.direction}-${row.n}`} className="border-t border-border font-mono tabular">
                    <td className="py-1 pr-3">{row.direction === "bull" ? "Bullish" : "Bearish"}</td>
                    <td className="py-1 pr-3">{row.n}</td>
                    <td className="py-1 pr-3">{row.withForward}</td>
                    <td className="py-1 pr-3">{num(row.avg.c1)}</td>
                    <td className="py-1 pr-3">{num(row.avg.c3)}</td>
                    <td className="py-1 pr-3">{num(row.avg.c5)}</td>
                    <td className="py-1 pr-3">{num(row.avg.c8)}</td>
                    <td className="py-1 pr-3">{num(row.medianMfe)}</td>
                    <td className="py-1 pr-3">{num(row.medianMae)}</td>
                    <td className="py-1">{row.invalidated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {meta ? (
        <p className="mt-3 text-[11px] text-subtle">
          {meta.universeNote} {meta.adjusted ? "Prices use Yahoo’s adjusted close when it differs from the raw close, so the whole candle stays on one series." : "No adjustment was needed on the candles that loaded."} {skipped.length ? `${skipped.length} names skipped.` : ""} Last batch {new Date(meta.asOf).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST.
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
  );
}

function Group({
  title,
  hint,
  rows,
  onOpen,
  onInspect,
}: {
  title: string;
  hint: string;
  rows: Hit[];
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
          <table className="w-full min-w-[880px] text-left text-[12px]">
            <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                <th className="py-1 pr-2">Stock</th>
                <th className="py-1 pr-2">Side</th>
                <th className="py-1 pr-2">Level</th>
                <th className="py-1 pr-2">Extreme</th>
                <th className="py-1 pr-2">Depth</th>
                <th className="py-1 pr-2">Reclaim</th>
                <th className="py-1 pr-2">Volume</th>
                <th className="py-1 pr-2">Date</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((hit) => (
                <tr key={hit.id} className="border-t border-border">
                  <td className="py-1.5 pr-2">
                    <button type="button" className="font-semibold hover:underline" onClick={() => onOpen(hit)}>{hit.symbol}</button>
                    <div className="max-w-[180px] truncate text-[11px] text-subtle">{hit.name} · {hit.exchange}</div>
                  </td>
                  <td className={cn("py-1.5 pr-2", hit.direction === "bull" ? "text-up" : "text-down")}>{hit.direction === "bull" ? "Bullish" : "Bearish"}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{fmtPx(hit.level)}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{fmtPx(hit.extreme)}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{hit.depthPct.toFixed(2)}%{hit.depthAtr != null ? ` · ${hit.depthAtr.toFixed(2)} ATR` : ""}</td>
                  <td className="py-1.5 pr-2">{hit.reclaimCandles == null ? "Open" : hit.reclaimCandles === 0 ? "Same" : `${hit.reclaimCandles}`}</td>
                  <td className="py-1.5 pr-2 font-mono tabular">{hit.volumeRatio == null ? "—" : `${hit.volumeRatio.toFixed(2)}×`}</td>
                  <td className="py-1.5 pr-2">{when(hit.sweepT)}</td>
                  <td className="py-1.5 pr-2">{hit.status === "developing" ? "Developing" : hit.tier === "strong" ? "Confirmed" : "Potential"}</td>
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
