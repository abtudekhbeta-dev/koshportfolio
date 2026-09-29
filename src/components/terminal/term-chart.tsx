import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Columns2,
  Crosshair,
  Layers,
  Minimize2,
  Minus,
  MousePointer2,
  MoveRight,
  Plus,
  RotateCcw,
  Spline,
  Square,
  Star,
  Trash2,
  Undo2,
  UnfoldVertical,
} from "lucide-react";
import { apiOhlc } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { panBy, zoomAround, zoomRightEdge, atLatest } from "@/lib/kosh/chart-nav";
import { adjustOhlcToBenchmark, applyHistoricalFx } from "@/lib/kosh/relative";
import { histInit, histPush, histRedo, histUndo, type DrawHist } from "@/lib/kosh/draw-history";
import { resolveBench } from "@/lib/kosh/benchmarks";
import { AdjustMenu } from "@/components/charts/adjust-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { bollinger, ema, fmtVol, macd, rsi, sma, vwap } from "@/lib/kosh/ohlc";
import { isIstSession, istClock } from "@/lib/kosh/market-hours";
import { applyDrag, channelOffFromThird, hitTest, positionMetrics, type HitMode } from "@/lib/kosh/draw-hit";
import { detectPatterns, patternStatusLabel, type PatternHit } from "@/lib/kosh/patterns";
import {
  patchLastBar,
  quoteStatus,
  quoteStatusLabel,
  TERM_INTERVALS,
  termBars,
  termFetchSpec,
} from "@/lib/kosh/market-data";
import type { OhlcBar, Quote } from "@/lib/kosh/types";
import { bareSymbol, drawKey, isWatched, newDrawId, useKosh, type DrawKind, type DrawShape } from "@/lib/store";
import { cn } from "@/lib/utils";

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";
const GRID = "var(--color-chart-grid)";
const INK = "var(--color-fg)";
const MUTED = "var(--color-subtle)";
const CHART = "var(--color-chart)";
const WARN = "var(--color-warn)";
const ACCENT = "var(--color-accent)";
const PAD = { l: 10, r: 58, t: 10, b: 20 };
const VOL_H = 36;
const OSC_H = 44;
const FIBS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const TF_VIEW: Record<string, number> = {
  "1m": 180,
  "3m": 160,
  "5m": 160,
  "15m": 140,
  "30m": 140,
  "1H": 160,
  "4H": 120,
  D: 180,
  W: 130,
  M: 90,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtWhen(tSec: number, intra: boolean) {
  const d = new Date((tSec + 19800) * 1000);
  const day = d.getUTCDate();
  const mon = MONTHS[d.getUTCMonth()];
  const yy = d.getUTCFullYear();
  if (!intra) return `${day} ${mon} ${yy}`;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${hh}:${mm}`;
}

function drawIv(id: string) {
  if (id === "D") return "1D";
  if (id === "W") return "1W";
  if (id === "M") return "1M";
  return id;
}

const EMPTY_SHAPES: DrawShape[] = [];
const EMPTY_PATTERNS: PatternHit[] = [];
const EMPTY_BARS: OhlcBar[] = [];

type IndFlags = { sma20: boolean; ema21: boolean; bb: boolean; vwap: boolean; rsi: boolean; macd: boolean };
type ToolId = "pan" | "crosshair" | DrawKind;

const TOOLS: { id: ToolId; label: string; icon: typeof Minus }[] = [
  { id: "pan", label: "Select", icon: MousePointer2 },
  { id: "crosshair", label: "Crosshair", icon: Crosshair },
  { id: "trend", label: "Trend", icon: Spline },
  { id: "hline", label: "H-line", icon: Minus },
  { id: "ray", label: "Ray", icon: MoveRight },
  { id: "vline", label: "V-line", icon: UnfoldVertical },
  { id: "rect", label: "Rect", icon: Square },
  { id: "channel", label: "Channel", icon: Columns2 },
  { id: "fib", label: "Fib", icon: Layers },
  { id: "long", label: "Long", icon: ArrowUpRight },
  { id: "short", label: "Short", icon: ArrowDownRight },
];

export function TermChart({
  symbol,
  name,
  interval,
  quote,
  active,
  style,
  owned,
  onActivate,
  onInterval,
  onStyle,
  onPatterns,
}: {
  symbol: string;
  name: string;
  interval: string;
  quote?: Quote | null;
  active?: boolean;
  style: "candle" | "line";
  owned?: string | null;
  onActivate: () => void;
  onInterval: (id: string) => void;
  onStyle?: (style: "candle" | "line") => void;
  onPatterns?: (hits: PatternHit[]) => void;
}) {
  const spec = useMemo(() => termFetchSpec(interval), [interval]);
  const session = isIstSession();
  const ohlc = useQuery({
    queryKey: ["ohlc", symbol, spec.range, spec.yahoo],
    queryFn: () => apiOhlc(symbol, spec.range, spec.yahoo),
    enabled: Boolean(symbol),
    staleTime: spec.intra ? 15_000 : 60_000,
    refetchInterval: () => (isIstSession() ? (spec.intra ? 15_000 : 60_000) : 5 * 60_000),
    placeholderData: keepPreviousData,
  });
  const raw = ohlc.data?.bars || EMPTY_BARS;
  const hist = useMemo(() => termBars(raw, spec), [raw, spec]);
  const priceBars = useMemo(
    () => (quote && quote.price > 0 ? patchLastBar(hist, quote, spec) : hist),
    [hist, quote, spec],
  );
  const chartMode = useKosh((s) => s.chartPrefs.chartMode || "price");
  const chartBench = useKosh((s) => s.chartPrefs.chartBench || "nifty");
  const benchMeta = resolveBench(chartBench);
  const benchQ = useQuery({
    queryKey: ["ohlc", benchMeta.symbol, spec.range, spec.yahoo],
    queryFn: () => apiOhlc(benchMeta.symbol, spec.range, spec.yahoo),
    enabled: chartMode === "bench" && Boolean(symbol),
    staleTime: 60_000,
  });
  const fxQ = useQuery({
    queryKey: ["ohlc", "INR=X", spec.intra ? "6mo" : spec.range, "1d"],
    queryFn: () => apiOhlc("INR=X", spec.intra ? "6mo" : spec.range, "1d"),
    enabled: chartMode === "usd",
    staleTime: 60_000,
  });
  const usdPack = useMemo(
    () => (chartMode === "usd" ? applyHistoricalFx(priceBars, fxQ.data?.bars || []) : null),
    [chartMode, priceBars, fxQ.data],
  );
  const bars = useMemo(() => {
    if (chartMode === "usd" && usdPack && usdPack.bars.length >= 2) return usdPack.bars;
    return priceBars;
  }, [chartMode, priceBars, usdPack]);
  const px = quote?.price && quote.price > 0 ? quote.price : (ohlc.data?.price || bars.at(-1)?.c || 0);
  const chg = quote?.changePct ?? ohlc.data?.changePct ?? 0;
  const status = quoteStatus({ session, price: px, retrievedAt: quote?.retrievedAt });
  const missing = Boolean(ohlc.data?.missing) || (!ohlc.isPending && bars.length < 2);
  const volMissing = bars.length > 0 && bars.every((b) => !(b.v > 0));
  const exch = /BSE|Bombay/i.test(ohlc.data?.exchange || "") ? "BSE" : "NSE";

  const watch = useKosh((s) => s.watch);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const watched = isWatched(symbol, watch);
  const logScale = useKosh((s) => s.chartPrefs.logScale);
  const patternsOn = useKosh((s) => s.chartPrefs.patternsOn === true);
  const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
  const drawings = useKosh((s) => s.drawings);
  const setDrawings = useKosh((s) => s.setDrawings);
  const dKey = drawKey(symbol, drawIv(interval));
  const shapes = drawings[dKey] || EMPTY_SHAPES;

  const wrap = useRef<HTMLDivElement>(null);
  const hoverRaf = useRef(0);
  const vLine = useRef<HTMLDivElement>(null);
  const hLine = useRef<HTMLDivElement>(null);
  const priceTag = useRef<HTMLDivElement>(null);
  const dateTag = useRef<HTMLDivElement>(null);
  const ohlcRead = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 640, h: 320 });
  const [view, setView] = useState({ start: 0, count: TF_VIEW[interval] || 180 });
  const [inds, setInds] = useState<IndFlags>({ sma20: false, ema21: false, bb: false, vwap: false, rsi: false, macd: false });
  const [tool, setTool] = useState<ToolId>("pan");
  const drawOpen = useKosh((s) => s.chartPrefs.drawOpen !== false);
  const [draft, setDraft] = useState<DrawShape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const move = useRef<{ id: string; mode: HitMode; x: number; y: number; t: number; py: number } | null>(null);
  const clicks = useRef(0);
  const histDraw = useRef<DrawHist<DrawShape>>(histInit([]));
  useEffect(() => {
    histDraw.current = histInit(drawings[dKey] || EMPTY_SHAPES);
  }, [dKey]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.max(220, r.width);
      const h = Math.max(160, r.height);
      setSize((prev) => (Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5 ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const n = bars.length;
    const count = Math.min(n, TF_VIEW[interval] || 180);
    setView({ start: Math.max(0, n - count), count: count || 1 });
    setDraft(null);
  }, [symbol, interval, bars.length]);

  const oscOn = inds.rsi || inds.macd;
  const plotH = Math.max(80, size.h - PAD.t - PAD.b - VOL_H - (oscOn ? OSC_H + 8 : 0));
  const innerW = Math.max(40, size.w - PAD.l - PAD.r);
  const sliced = useMemo(
    () => bars.slice(view.start, view.start + view.count),
    [bars, view.start, view.count],
  );
  const benchPack = useMemo(
    () =>
      chartMode === "bench"
        ? adjustOhlcToBenchmark(sliced, benchQ.data?.bars || [], spec.intra ? "time" : "day")
        : null,
    [chartMode, sliced, benchQ.data, spec.intra],
  );
  const shown = benchPack && benchPack.bars.length >= 2 ? benchPack.bars : sliced;
  const n = shown.length;

  const lo0 = shown.reduce((m, b) => Math.min(m, b.l), Infinity);
  const hi0 = shown.reduce((m, b) => Math.max(m, b.h), -Infinity);
  const pad = (hi0 - lo0) * 0.04 || 1;
  const lo = Number.isFinite(lo0) ? Math.max(0.0001, lo0 - pad) : 0.0001;
  const hi = Number.isFinite(hi0) ? hi0 + pad : 1;
  const span = hi - lo || 1;
  const useLog = logScale && lo > 0 && hi > 0 && hi > lo;
  const yPx = (p: number) => {
    const v = p > 0 ? p : lo;
    if (useLog) {
      const lLo = Math.log(lo);
      const lHi = Math.log(hi);
      return PAD.t + ((lHi - Math.log(Math.max(v, lo))) / (lHi - lLo || 1)) * plotH;
    }
    return PAD.t + ((hi - p) / span) * plotH;
  };
  const yInv = (y: number) => {
    const t = (y - PAD.t) / (plotH || 1);
    if (useLog) {
      const lLo = Math.log(lo);
      const lHi = Math.log(hi);
      return Math.exp(lHi - t * (lHi - lLo));
    }
    return hi - t * span;
  };
  const xAt = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i + 0.5) * (innerW / n));
  const slot = n ? innerW / n : 8;
  const cw = Math.max(1, Math.min(9, slot * 0.62));

  const closes = shown.map((b) => b.c);
  const sma20 = inds.sma20 ? sma(closes, 20) : null;
  const ema21 = inds.ema21 ? ema(closes, 21) : null;
  const bb = inds.bb ? bollinger(closes, 20, 2) : null;
  const vw = inds.vwap && spec.intra ? vwap(shown) : null;
  const rsiArr = inds.rsi ? rsi(closes, 14) : null;
  const macdPack = inds.macd ? macd(closes) : null;
  const maxVol = Math.max(...shown.map((b) => b.v || 0), 1);

  const patterns = useMemo(
    () => (patternsOn && shown.length >= 24 ? detectPatterns(shown) : EMPTY_PATTERNS),
    [shown, patternsOn],
  );
  useEffect(() => {
    if (!active || !onPatterns) return;
    onPatterns(patterns);
  }, [active, patterns, onPatterns]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    if (useLog) {
      const lLo = Math.log10(lo);
      const lHi = Math.log10(hi);
      const step = (lHi - lLo) / 4;
      for (let i = 0; i <= 4; i++) ticks.push(Math.pow(10, lLo + step * i));
      return ticks;
    }
    for (let i = 0; i <= 4; i++) ticks.push(lo + (span * i) / 4);
    return ticks;
  }, [lo, hi, span, useLog]);

  function idxAt(clientX: number) {
    const r = wrap.current?.getBoundingClientRect();
    if (!r || n < 1) return 0;
    const x = clientX - r.left;
    const i = Math.round((x - PAD.l) / (innerW / n) - 0.5);
    return Math.max(0, Math.min(n - 1, i));
  }
  function xyAt(clientX: number, clientY: number) {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0, i: 0, t: shown[0]?.t || 0, p: lo };
    const x = clientX - r.left;
    const y = clientY - r.top;
    const i = idxAt(clientX);
    const bar = shown[i];
    return { x, y, i, t: bar?.t || 0, p: yInv(y) };
  }

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const zoomGesture = e.ctrlKey || e.metaKey;
      if (!zoomGesture && !e.shiftKey) return;
      e.preventDefault();
      if (bars.length < 20) return;
      if (e.shiftKey) {
        const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
        const step = Math.max(1, Math.round(view.count * 0.08)) * dir;
        setView(panBy(view, bars.length, step));
        return;
      }
      const i = idxAt(e.clientX);
      setView(zoomAround(view, bars.length, i, e.deltaY < 0));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [bars, view]);

  function fit() {
    setView({ start: 0, count: Math.max(1, bars.length) });
  }
  function latest() {
    const count = Math.min(bars.length, TF_VIEW[interval] || 180);
    setView({ start: Math.max(0, bars.length - count), count });
  }
  const onLatest = atLatest(view, bars.length);
  function save(next: DrawShape[]) {
    histDraw.current = histPush(histDraw.current, next);
    setDrawings(dKey, next);
  }
  function undoDraw() {
    const u = histUndo(histDraw.current);
    if (!u) return;
    histDraw.current = u.hist;
    setDrawings(dKey, u.shapes);
    setSelectedId(null);
  }
  function redoDraw() {
    const u = histRedo(histDraw.current);
    if (!u) return;
    histDraw.current = u.hist;
    setDrawings(dKey, u.shapes);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        save(shapes.filter((s) => s.id !== selectedId));
        setSelectedId(null);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (draft) {
          setDraft(null);
          clicks.current = 0;
          return;
        }
        if (selectedId) {
          setSelectedId(null);
          return;
        }
        setTool("pan");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redoDraw();
        else undoDraw();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, selectedId, shapes, dKey]);

  const last = shown[n - 1];
  const lastUp = last && last.c >= last.o;

  function readText(b: (typeof shown)[number]) {
    return `${fmtWhen(b.t, spec.intra)} · O ${fmtPx(b.o)} H ${fmtPx(b.h)} L ${fmtPx(b.l)} C ${fmtPx(b.c)}${volMissing ? " · Volume unavailable" : ` · Vol ${fmtVol(b.v)}`}`;
  }
  function paintHover(i: number, y: number) {
    const bar = shown[i];
    if (!bar) return;
    const x = xAt(i);
    const price = yInv(y);
    if (vLine.current) {
      vLine.current.style.display = "block";
      vLine.current.style.left = `${x}px`;
    }
    if (hLine.current) {
      hLine.current.style.display = "block";
      hLine.current.style.top = `${y}px`;
    }
    if (priceTag.current) {
      priceTag.current.style.display = "block";
      priceTag.current.style.top = `${y}px`;
      priceTag.current.textContent = price >= 100 ? price.toFixed(1) : price.toFixed(2);
    }
    if (dateTag.current) {
      dateTag.current.style.display = "block";
      dateTag.current.style.left = `${x}px`;
      dateTag.current.textContent = fmtWhen(bar.t, spec.intra);
    }
    if (ohlcRead.current) ohlcRead.current.textContent = readText(bar);
  }
  function hideHover() {
    if (vLine.current) vLine.current.style.display = "none";
    if (hLine.current) hLine.current.style.display = "none";
    if (priceTag.current) priceTag.current.style.display = "none";
    if (dateTag.current) dateTag.current.style.display = "none";
    if (ohlcRead.current && last) ohlcRead.current.textContent = readText(last);
  }

  useEffect(() => {
    if (ohlcRead.current && last) ohlcRead.current.textContent = `${fmtWhen(last.t, spec.intra)} · O ${fmtPx(last.o)} H ${fmtPx(last.h)} L ${fmtPx(last.l)} C ${fmtPx(last.c)}`;
  }, [last, spec.intra]);

  function poly(vals: (number | null)[], color: string) {
    const pts: string[] = [];
    vals.forEach((v, i) => {
      if (v == null || !(v > 0)) return;
      pts.push(`${xAt(i).toFixed(1)},${yPx(v).toFixed(1)}`);
    });
    if (pts.length < 2) return null;
    return <polyline fill="none" stroke={color} strokeWidth="1.2" points={pts.join(" ")} />;
  }

  const card = (
    <section
      data-term-chart
      data-active={active ? "1" : "0"}
      onClick={onActivate}
      className={cn("flex h-full min-h-0 min-w-0 flex-col bg-bg", active && "ring-1 ring-inset ring-accent/50")}
    >
      <header className="flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h2 className="truncate text-[15px] font-semibold">{bareSymbol(symbol)}</h2>
          <span className="hidden text-[10px] text-subtle sm:inline">{exch}</span>
          <span className="hidden min-w-0 truncate text-[11px] text-muted lg:inline">{name}</span>
          <span className="font-mono text-[15px] tabular">{fmtPx(px)}</span>
          <span className={cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down")}>{fmtPct(chg)}</span>
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]",
              status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down",
            )}
            title="Latest print Kosh has. Refreshes during the cash session."
          >
            {status === "session" ? `● ${quoteStatusLabel(status)} · ${istClock()}` : quoteStatusLabel(status)}
          </span>
          {owned ? <span className="hidden rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted lg:inline">{owned}</span> : null}
          <Tooltip content={watched ? "Remove from watch" : "Add to watch"}>
            <button
              type="button"
              aria-label={watched ? "Remove from watch" : "Add to watch"}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(symbol);
              }}
              className={cn("grid size-7 place-items-center", watched ? "text-warn" : "text-subtle hover:text-fg")}
            >
              <Star className={cn("size-3.5", watched && "fill-current")} />
            </button>
          </Tooltip>
        </div>
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
          {TERM_INTERVALS.map((t) => (
            <button
              key={t.id}
              type="button"
              data-tf={t.id}
              onClick={(e) => {
                e.stopPropagation();
                onInterval(t.id);
              }}
              className={cn(
                "h-7 min-w-7 shrink-0 rounded-sm px-1.5 text-[11px] font-medium",
                t.id === interval ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-2 py-1">
        <button
          type="button"
          className={cn("h-7 rounded-sm px-2 text-[11px] font-medium", style === "candle" ? "bg-surface-2 text-fg" : "text-muted hover:text-fg")}
          onClick={(e) => {
            e.stopPropagation();
            onStyle?.(style === "candle" ? "line" : "candle");
          }}
        >
          {style === "candle" ? "Candle" : "Line"}
        </button>
        <button
          type="button"
          aria-pressed={useLog}
          onClick={(e) => {
            e.stopPropagation();
            patchChartPrefs({ logScale: !logScale });
          }}
          className={cn("h-7 rounded-sm px-2 text-[11px] font-semibold", logScale ? "bg-surface-2 text-fg" : "text-muted hover:text-fg")}
        >
          Log
        </button>
        <AdjustMenu compact stop />
        <button
          type="button"
          aria-pressed={patternsOn}
          aria-label="Pattern overlay"
          onClick={(e) => {
            e.stopPropagation();
            patchChartPrefs({ patternsOn: !patternsOn });
          }}
          className={cn("h-7 rounded-sm px-2 text-[11px] font-medium", patternsOn ? "bg-surface-2 text-fg" : "text-muted hover:text-fg")}
        >
          Patterns
        </button>
        <button
          type="button"
          aria-expanded={drawOpen}
          aria-label="Drawing tools"
          onClick={(e) => {
            e.stopPropagation();
            patchChartPrefs({ drawOpen: !drawOpen });
          }}
          className={cn("h-7 rounded-sm px-2 text-[11px] font-medium", drawOpen || (tool !== "pan" && tool !== "crosshair") ? "bg-surface-2 text-fg" : "text-muted hover:text-fg")}
        >
          Draw
        </button>
        {drawOpen ? (
          <div className="flex flex-wrap items-center gap-0.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Tooltip key={t.id} content={t.label}>
                  <button
                    type="button"
                    aria-label={t.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTool(t.id);
                      setDraft(null);
                      clicks.current = 0;
                    }}
                    className={cn(
                      "grid size-7 place-items-center rounded-sm",
                      tool === t.id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </button>
                </Tooltip>
              );
            })}
            <Tooltip content="Undo drawing">
              <button
                type="button"
                aria-label="Undo drawing"
                className="grid size-7 place-items-center text-muted hover:text-fg"
                onClick={(e) => {
                  e.stopPropagation();
                  undoDraw();
                }}
              >
                <Undo2 className="size-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Redo drawing">
              <button
                type="button"
                aria-label="Redo drawing"
                className="grid size-7 place-items-center text-muted hover:text-fg"
                onClick={(e) => {
                  e.stopPropagation();
                  redoDraw();
                }}
              >
                <RotateCcw className="size-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Delete selected drawing">
              <button
                type="button"
                aria-label="Delete selected drawing"
                className="grid size-7 place-items-center text-muted hover:text-down"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedId) {
                    save(shapes.filter((s) => s.id !== selectedId));
                    setSelectedId(null);
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Clear drawings">
              <button
                type="button"
                aria-label="Clear drawings"
                className="grid size-7 place-items-center text-muted hover:text-down"
                onClick={(e) => {
                  e.stopPropagation();
                  save([]);
                  setDraft(null);
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </Tooltip>
          </div>
        ) : null}
        <span className="ml-auto text-[10px] text-subtle">
          {chartMode === "bench"
            ? benchPack && benchPack.bars.length >= 2
              ? `${benchMeta.name} adjusted candles · first close in view = 100 · not a second line`
              : benchQ.isPending
                ? `Loading ${benchMeta.name}…`
                : `${benchMeta.name} unavailable · price scale unchanged`
            : chartMode === "usd"
              ? usdPack && usdPack.bars.length >= 2
                ? "USD · historical USD/INR · not today's rate on old bars"
                : "USD/INR history unavailable"
              : useLog
                ? "Log scale"
                : "Linear"}
          {chartMode === "price" ? " · RAW OHLC" : ""}
        </span>
      </div>

      <div
        ref={wrap}
        className={cn("relative min-h-0 flex-1", tool === "pan" || tool === "crosshair" ? "cursor-crosshair" : "cursor-cell")}
        onPointerDown={(e) => {
          onActivate();
          const pt = xyAt(e.clientX, e.clientY);
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          if (tool === "pan" || tool === "crosshair") {
            const hit = hitTest(shapes, pt.x, pt.y, shown, xAt, yPx, PAD.l, size.w - PAD.r, PAD.t, PAD.t + plotH);
            if (hit) {
              setSelectedId(hit.id);
              move.current = { id: hit.id, mode: hit.mode, x: pt.x, y: pt.y, t: pt.t, py: pt.p };
              return;
            }
            setSelectedId(null);
            if (tool === "pan") drag.current = { x: e.clientX, start: view.start };
            return;
          }
          if (!draft) {
            clicks.current = 1;
            setDraft({ id: newDrawId(), kind: tool, t0: pt.t, y0: pt.p, t1: pt.t, y1: pt.p });
            return;
          }
          if (draft.kind === "channel" && clicks.current === 1) {
            clicks.current = 2;
            setDraft({ ...draft, t1: pt.t, y1: pt.p });
            return;
          }
          if (draft.kind === "channel" && clicks.current >= 2) {
            const done: DrawShape = { ...draft, off: channelOffFromThird(draft, pt.t, pt.p) };
            save([...shapes, done]);
            setSelectedId(done.id);
            setDraft(null);
            clicks.current = 0;
            setTool("pan");
            return;
          }
          if ((draft.kind === "long" || draft.kind === "short") && clicks.current === 1) {
            clicks.current = 2;
            setDraft({ ...draft, y2: pt.p, t1: pt.t });
            return;
          }
          if ((draft.kind === "long" || draft.kind === "short") && clicks.current >= 2) {
            const done: DrawShape = { ...draft, t1: pt.t, y1: pt.p };
            save([...shapes, done]);
            setSelectedId(done.id);
            setDraft(null);
            clicks.current = 0;
            setTool("pan");
            return;
          }
          const done: DrawShape = { ...draft, t1: pt.t, y1: pt.p };
          save([...shapes, done]);
          setSelectedId(done.id);
          setDraft(null);
          clicks.current = 0;
          setTool("pan");
        }}
        onPointerMove={(e) => {
          const pt = xyAt(e.clientX, e.clientY);
          if (hoverRaf.current) cancelAnimationFrame(hoverRaf.current);
          const ii = pt.i;
          const yy = pt.y;
          hoverRaf.current = requestAnimationFrame(() => paintHover(ii, yy));
          if (move.current) {
            const cur = shapes.find((s) => s.id === move.current!.id);
            if (!cur) return;
            const next = applyDrag(cur, move.current.mode, pt.t - move.current.t, pt.p - move.current.py, pt.t, pt.p);
            save(shapes.map((s) => (s.id === next.id ? next : s)));
            move.current = { ...move.current, t: pt.t, py: pt.p, x: pt.x, y: pt.y };
            return;
          }
          if (draft) {
            if (draft.kind === "channel" && clicks.current >= 2) {
              setDraft({ ...draft, off: channelOffFromThird(draft, pt.t, pt.p) });
              return;
            }
            if ((draft.kind === "long" || draft.kind === "short") && clicks.current >= 2) {
              setDraft({ ...draft, t1: pt.t, y1: pt.p });
              return;
            }
            if ((draft.kind === "long" || draft.kind === "short") && clicks.current === 1) {
              setDraft({ ...draft, y2: pt.p, t1: pt.t });
              return;
            }
            setDraft({ ...draft, t1: pt.t, y1: pt.p });
            return;
          }
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          const shift = Math.round(-dx / Math.max(4, slot));
          const start = Math.max(0, Math.min(bars.length - view.count, drag.current.start + shift));
          setView((v) => ({ ...v, start }));
        }}
        onPointerUp={() => {
          drag.current = null;
          move.current = null;
        }}
        onPointerLeave={() => hideHover()}
      >
        {ohlc.isPending && !bars.length ? (
          <div className="absolute inset-0 animate-pulse bg-surface/40" />
        ) : missing ? (
          <p className="absolute inset-0 grid place-items-center px-4 text-center text-[13px] text-muted">
            No candles for {bareSymbol(symbol)} on {interval}. Kosh does not invent bars.
          </p>
        ) : (
          <svg width={size.w} height={size.h} className="block h-full w-full">
            {yTicks.map((p, i) => (
              <g key={i}>
                <line x1={PAD.l} x2={size.w - PAD.r} y1={yPx(p)} y2={yPx(p)} stroke={GRID} strokeWidth="1" />
                <text
                  x={size.w - PAD.r + 6}
                  y={yPx(p) + 3}
                  textAnchor="start"
                  fill={MUTED}
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                >
                  {p >= 100 ? p.toFixed(0) : p.toFixed(2)}
                </text>
              </g>
            ))}
            {bb
              ? [
                  poly(bb.upper, "color-mix(in srgb, var(--color-chart) 55%, transparent)"),
                  poly(bb.mid, CHART),
                  poly(bb.lower, "color-mix(in srgb, var(--color-chart) 55%, transparent)"),
                ]
              : null}
            {sma20 ? poly(sma20, CHART) : null}
            {ema21 ? poly(ema21, WARN) : null}
            {vw ? poly(vw, WARN) : null}
            {style === "line"
              ? poly(closes, CHART)
              : shown.map((b, i) => {
                  const up = b.c >= b.o;
                  const color = up ? UP : DOWN;
                  const x = xAt(i);
                  const y1 = yPx(Math.max(b.o, b.c));
                  const y2 = yPx(Math.min(b.o, b.c));
                  const body = Math.max(1, y2 - y1);
                  return (
                    <g key={b.t}>
                      <line x1={x} x2={x} y1={yPx(b.h)} y2={yPx(b.l)} stroke={color} strokeWidth="1" />
                      <rect x={x - cw / 2} y={y1} width={cw} height={body} fill={color} />
                    </g>
                  );
                })}
            {shown.map((b, i) => {
              const vh = ((b.v || 0) / maxVol) * (VOL_H - 4);
              const x = xAt(i);
              const y = PAD.t + plotH + 6 + (VOL_H - 4 - vh);
              return (
                <rect
                  key={"v" + b.t}
                  x={x - cw / 2}
                  y={y}
                  width={cw}
                  height={Math.max(1, vh)}
                  fill={b.c >= b.o ? UP : DOWN}
                  opacity="0.35"
                />
              );
            })}
            {oscOn ? (
              <Osc xAt={xAt} top={PAD.t + plotH + VOL_H + 10} h={OSC_H} rsiArr={rsiArr} macdPack={macdPack} />
            ) : null}
            {patternsOn
              ? patterns.map((h, i) => (
                  <PatternOverlay key={h.kind + i} hit={h} src={shown} xAt={xAt} yPx={yPx} right={size.w - PAD.r} />
                ))
              : null}
            {shapes.map((s) => (
              <ShapeDraw key={s.id} s={s} src={shown} xAt={xAt} yPx={yPx} right={size.w - PAD.r} selected={s.id === selectedId} />
            ))}
            {draft ? <ShapeDraw s={draft} src={shown} xAt={xAt} yPx={yPx} right={size.w - PAD.r} /> : null}
            {last ? (
              <g>
                <circle cx={xAt(n - 1)} cy={yPx(last.c)} r="3" fill={lastUp ? UP : DOWN} stroke="var(--color-bg)" />
                <rect
                  x={size.w - PAD.r}
                  y={yPx(last.c) - 8}
                  width="52"
                  height="16"
                  fill={lastUp ? UP : DOWN}
                />
                <text
                  x={size.w - PAD.r + 4}
                  y={yPx(last.c) + 3}
                  fill="var(--color-accent-fg)"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                >
                  {last.c >= 100 ? last.c.toFixed(0) : last.c.toFixed(2)}
                </text>
              </g>
            ) : null}
          </svg>
        )}
        <div ref={ohlcRead} className="pointer-events-none absolute left-3 top-2 z-[6] font-mono text-[11px] text-muted" />
        <div ref={vLine} className="kosh-cross-v" style={{ display: "none", bottom: 0 }} />
        <div ref={hLine} className="kosh-cross-h" style={{ display: "none", left: PAD.l, right: PAD.r }} />
        <div ref={priceTag} className="kosh-px-tag" style={{ display: "none" }} />
        <div ref={dateTag} className="kosh-date-tag" style={{ display: "none" }} />
      </div>

      <div className="flex shrink-0 items-center gap-1 border-t border-border px-2 py-1" data-testid="chart-nav">
        <IconBtn label="Zoom out" onClick={() => setView(zoomRightEdge(view, bars.length, false))}>
          <Minus className="size-3.5" />
        </IconBtn>
        <IconBtn label="Zoom in" onClick={() => setView(zoomRightEdge(view, bars.length, true))}>
          <Plus className="size-3.5" />
        </IconBtn>
        <IconBtn
          label="Go to latest"
          disabled={onLatest}
          onClick={latest}
        >
          <MoveRight className="size-3.5" />
        </IconBtn>
        <IconBtn label="Reset view" onClick={latest}>
          <RotateCcw className="size-3.5" />
        </IconBtn>
        <IconBtn label="Fit chart" onClick={fit}>
          <Minimize2 className="size-3.5" />
        </IconBtn>
      </div>

      {patternsOn && patterns.length ? (
        <div className="shrink-0 border-t border-border px-2 py-1 text-[11px] text-muted">
          {patterns.map((h) => `${h.label} · ${patternStatusLabel(h.status)}`).join(" · ")}
          <span className="ml-2 text-subtle">Observed on this timeframe — not a forecast.</span>
        </div>
      ) : null}

      <div className="flex shrink-0 flex-wrap items-center gap-1 border-t border-border px-2 py-1">
        {(
          [
            { id: "sma20" as const, label: "SMA 20" },
            { id: "ema21" as const, label: "EMA 21" },
            { id: "bb" as const, label: "BB" },
            ...(spec.intra ? [{ id: "vwap" as const, label: "VWAP" }] : []),
            { id: "rsi" as const, label: "RSI" },
            { id: "macd" as const, label: "MACD" },
          ] satisfies { id: keyof IndFlags; label: string }[]
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setInds((s) => ({ ...s, [chip.id]: !s[chip.id] }))}
            className={cn(
              "h-6 rounded-sm px-1.5 text-[10px] font-medium tracking-[0.04em]",
              inds[chip.id] ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {chip.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-subtle">{volMissing ? "Volume unavailable" : "RAW OHLC"}</span>
      </div>
    </section>
  );
  return card;
}

function tToX(t: number, src: OhlcBar[], xAt: (i: number) => number) {
  if (!src.length) return xAt(0);
  if (t <= src[0].t) return xAt(0);
  const last = src.length - 1;
  if (t >= src[last].t) return xAt(last);
  let lo = 0;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (src[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const i = lo;
  if (i <= 0) return xAt(0);
  const a = src[i - 1];
  const b = src[i];
  const f = (t - a.t) / (b.t - a.t || 1);
  return xAt(i - 1) + f * (xAt(i) - xAt(i - 1));
}

function PatternOverlay({
  hit,
  src,
  xAt,
  yPx,
  right,
}: {
  hit: PatternHit;
  src: OhlcBar[];
  xAt: (i: number) => number;
  yPx: (v: number) => number;
  right: number;
}) {
  const c = hit.tone === "up" ? UP : hit.tone === "down" ? DOWN : ACCENT;
  const last = hit.points[hit.points.length - 1];
  const pts = hit.points.map((p) => `${tToX(p.t, src, xAt).toFixed(1)},${yPx(p.price).toFixed(1)}`).join(" ");
  return (
    <g>
      {hit.points.length >= 2 ? (
        <polyline points={pts} fill="none" stroke={c} strokeWidth="1.3" strokeDasharray="4 3" />
      ) : last ? (
        <line x1={PAD.l} x2={right} y1={yPx(last.price)} y2={yPx(last.price)} stroke={c} strokeDasharray="5 4" />
      ) : null}
      {last ? (
        <text x={tToX(last.t, src, xAt) + 4} y={yPx(last.price) - 6} fill={c} fontSize="10">
          {hit.label} · {patternStatusLabel(hit.status)}
        </text>
      ) : null}
    </g>
  );
}

function ShapeDraw({
  s,
  src,
  xAt,
  yPx,
  right,
  selected,
}: {
  s: DrawShape;
  src: OhlcBar[];
  xAt: (i: number) => number;
  yPx: (v: number) => number;
  right: number;
  selected?: boolean;
}) {
  const x0 = tToX(s.t0, src, xAt);
  const y0 = yPx(s.y0);
  const x1 = tToX(s.t1 ?? s.t0, src, xAt);
  const y1 = yPx(s.y1 ?? s.y0);
  const stroke = selected ? INK : ACCENT;
  const w = selected ? 1.8 : 1.2;
  const handles = selected ? (
    <g>
      <rect x={x0 - 3} y={y0 - 3} width="6" height="6" fill="var(--color-bg)" stroke={stroke} />
      {s.kind !== "hline" ? <rect x={x1 - 3} y={y1 - 3} width="6" height="6" fill="var(--color-bg)" stroke={stroke} /> : null}
    </g>
  ) : null;
  if (s.kind === "hline") {
    return (
      <g>
        <line x1={PAD.l} y1={y0} x2={right} y2={y0} stroke={stroke} strokeWidth={w} />
        <text x={right + 4} y={y0 + 3} fill={stroke} fontSize="9">
          {fmtPx(s.y0)}
        </text>
        {handles}
      </g>
    );
  }
  if (s.kind === "vline") {
    return (
      <g>
        <line x1={x0} y1={PAD.t} x2={x0} y2={PAD.t + 4000} stroke={stroke} strokeWidth={w} />
        {handles}
      </g>
    );
  }
  if (s.kind === "long" || s.kind === "short") {
    const color = s.kind === "long" ? UP : DOWN;
    const m = positionMetrics(s);
    const yStop = yPx(m.stop);
    const yEntry = y0;
    const yTarget = y1;
    const top = Math.min(yStop, yEntry, yTarget);
    const left = Math.min(x0, x1);
    const width = Math.max(36, Math.abs(x1 - x0));
    const riskTop = Math.min(yEntry, yStop);
    const riskH = Math.abs(yEntry - yStop);
    const rewTop = Math.min(yEntry, yTarget);
    const rewH = Math.abs(yEntry - yTarget);
    return (
      <g>
        <rect x={left} y={rewTop} width={width} height={Math.max(2, rewH)} fill={color} fillOpacity="0.12" />
        <rect x={left} y={riskTop} width={width} height={Math.max(2, riskH)} fill={DOWN} fillOpacity="0.18" />
        <line x1={left} x2={left + width} y1={yEntry} y2={yEntry} stroke={INK} strokeWidth={w} />
        <line x1={left} x2={left + width} y1={yStop} y2={yStop} stroke={DOWN} strokeWidth={w} />
        <line x1={left} x2={left + width} y1={yTarget} y2={yTarget} stroke={UP} strokeWidth={w} />
        <text x={left + width + 4} y={top + 10} fill={color} fontSize="9">
          {s.kind === "long" ? "Long" : "Short"} · measurement
        </text>
        <text x={left + width + 4} y={top + 22} fill={MUTED} fontSize="9">
          {m.valid
            ? `R:R ${m.rr != null ? m.rr.toFixed(2) : "—"} · risk ${m.riskPct.toFixed(1)}% · reward ${m.rewardPct.toFixed(1)}%`
            : "Invalid levels — not a measurement"}
        </text>
        <text x={left + 4} y={yEntry - 3} fill={INK} fontSize="8">
          Entry {fmtPx(m.entry)}
        </text>
        <text x={left + 4} y={yStop - 3} fill={DOWN} fontSize="8">
          Stop {fmtPx(m.stop)}
        </text>
        <text x={left + 4} y={yTarget - 3} fill={UP} fontSize="8">
          Target {fmtPx(m.target)}
        </text>
        {selected ? (
          <g>
            <rect x={left + width / 2 - 3} y={yEntry - 3} width="6" height="6" fill="var(--color-bg)" stroke={stroke} />
            <rect x={left + width / 2 - 3} y={yTarget - 3} width="6" height="6" fill="var(--color-bg)" stroke={stroke} />
            <rect x={left + width / 2 - 3} y={yStop - 3} width="6" height="6" fill="var(--color-bg)" stroke={stroke} />
          </g>
        ) : null}
      </g>
    );
  }
  if (s.kind === "channel") {
    const off = s.off;
    return (
      <g>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth={w} />
        {off != null ? (
          <>
            <line x1={x0} y1={yPx(s.y0 + off)} x2={x1} y2={yPx((s.y1 ?? s.y0) + off)} stroke={stroke} strokeWidth={w} />
            <polygon
              points={`${x0},${y0} ${x1},${y1} ${x1},${yPx((s.y1 ?? s.y0) + off)} ${x0},${yPx(s.y0 + off)}`}
              fill={ACCENT}
              fillOpacity="0.06"
              stroke="none"
            />
          </>
        ) : null}
        {handles}
        {selected && off != null ? (
          <rect
            x={(x0 + x1) / 2 - 3}
            y={(yPx(s.y0 + off) + yPx((s.y1 ?? s.y0) + off)) / 2 - 3}
            width="6"
            height="6"
            fill="var(--color-bg)"
            stroke={stroke}
          />
        ) : null}
      </g>
    );
  }
  if (s.kind === "ray") {
    const dx = x1 - x0 || 0.001;
    const m = (y1 - y0) / dx;
    const xEnd = dx >= 0 ? right : PAD.l;
    return (
      <g>
        <line x1={x0} y1={y0} x2={xEnd} y2={y0 + m * (xEnd - x0)} stroke={stroke} strokeWidth={w} />
        {handles}
      </g>
    );
  }
  if (s.kind === "rect") {
    return (
      <g>
        <rect
          x={Math.min(x0, x1)}
          y={Math.min(y0, y1)}
          width={Math.max(2, Math.abs(x1 - x0))}
          height={Math.max(2, Math.abs(y1 - y0))}
          fill={ACCENT}
          fillOpacity="0.08"
          stroke={stroke}
          strokeWidth={w}
        />
        {handles}
      </g>
    );
  }
  if (s.kind === "fib") {
    const hiP = Math.max(s.y0, s.y1 ?? s.y0);
    const loP = Math.min(s.y0, s.y1 ?? s.y0);
    const sp = hiP - loP || 1;
    return (
      <g>
        {FIBS.map((f) => {
          const px = hiP - sp * f;
          return (
            <g key={f}>
              <line x1={PAD.l} x2={right} y1={yPx(px)} y2={yPx(px)} stroke={stroke} strokeOpacity={f === 0 || f === 1 ? 0.95 : 0.5} />
              <text x={PAD.l + 4} y={yPx(px) - 2} fill={stroke} fontSize="9">
                {(f * 100).toFixed(1)}
              </text>
            </g>
          );
        })}
        {handles}
      </g>
    );
  }
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth={w} />
      {handles}
    </g>
  );
}

function Osc({
  xAt,
  top,
  h,
  rsiArr,
  macdPack,
}: {
  xAt: (i: number) => number;
  top: number;
  h: number;
  rsiArr: (number | null)[] | null;
  macdPack: { line: (number | null)[]; signal: (number | null)[]; hist: (number | null)[] } | null;
}) {
  function line(vals: (number | null)[], lo: number, hi: number, color: string) {
    const span = hi - lo || 1;
    const pts: string[] = [];
    vals.forEach((v, i) => {
      if (v == null) return;
      const y = top + ((hi - v) / span) * h;
      pts.push(`${xAt(i).toFixed(1)},${y.toFixed(1)}`);
    });
    if (pts.length < 2) return null;
    return <polyline fill="none" stroke={color} strokeWidth="1.1" points={pts.join(" ")} />;
  }
  return (
    <g>
      <line x1={PAD.l} x2={PAD.l + 4000} y1={top} y2={top} stroke={GRID} />
      {rsiArr ? line(rsiArr, 0, 100, CHART) : null}
      {macdPack ? line(macdPack.line, -4, 4, CHART) : null}
      {macdPack ? line(macdPack.signal, -4, 4, WARN) : null}
    </g>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const btn = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={cn("grid size-7 place-items-center rounded-sm bg-bg/80 text-muted hover:text-fg disabled:opacity-40")}
    >
      {children}
    </button>
  );
  return <Tooltip content={label}>{disabled ? <span className="inline-flex">{btn}</span> : btn}</Tooltip>;
}
