import { useEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2, RotateCcw, Star } from "lucide-react";
import { apiOhlc } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { bollinger, ema, fmtVol, macd, rsi, sma, vwap } from "@/lib/kosh/ohlc";
import { isIstSession, istClock } from "@/lib/kosh/market-hours";
import {
  patchLastBar,
  quoteStatus,
  quoteStatusLabel,
  TERM_INTERVALS,
  termBars,
  termFetchSpec,
} from "@/lib/kosh/market-data";
import type { OhlcBar, Quote } from "@/lib/kosh/types";
import { bareSymbol, isWatched, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";
const GRID = "var(--color-border)";
const INK = "var(--color-fg)";
const MUTED = "var(--color-subtle)";
const CHART = "var(--color-chart)";
const WARN = "var(--color-warn)";
const PAD = { l: 52, r: 12, t: 10, b: 20 };
const VOL_H = 36;
const OSC_H = 44;
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

type IndFlags = { sma20: boolean; ema21: boolean; bb: boolean; vwap: boolean; rsi: boolean; macd: boolean };

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
}) {
  const spec = termFetchSpec(interval);
  const session = isIstSession();
  const ohlc = useQuery({
    queryKey: ["ohlc", symbol, spec.range, spec.yahoo],
    queryFn: () => apiOhlc(symbol, spec.range, spec.yahoo),
    enabled: Boolean(symbol),
    staleTime: spec.intra ? 15_000 : 60_000,
    refetchInterval: () => (isIstSession() ? (spec.intra ? 15_000 : 60_000) : 5 * 60_000),
    placeholderData: keepPreviousData,
  });
  const raw = ohlc.data?.bars || [];
  const hist = useMemo(() => termBars(raw, spec), [raw, spec]);
  const bars = useMemo(
    () => (quote && quote.price > 0 ? patchLastBar(hist, quote, spec) : hist),
    [hist, quote, spec],
  );
  const px = quote?.price && quote.price > 0 ? quote.price : (ohlc.data?.price || bars.at(-1)?.c || 0);
  const chg = quote?.changePct ?? ohlc.data?.changePct ?? 0;
  const status = quoteStatus({ session, price: px, retrievedAt: quote?.retrievedAt });
  const missing = Boolean(ohlc.data?.missing) || (!ohlc.isPending && bars.length < 2);
  const volMissing = bars.length > 0 && bars.every((b) => !(b.v > 0));
  const exch = /BSE|Bombay/i.test(ohlc.data?.exchange || "") ? "BSE" : "NSE";

  const watch = useKosh((s) => s.watch);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const watched = isWatched(symbol, watch);

  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 640, h: 320 });
  const [view, setView] = useState({ start: 0, count: TF_VIEW[interval] || 180 });
  const [hover, setHover] = useState<number | null>(null);
  const [fs, setFs] = useState(false);
  const [inds, setInds] = useState<IndFlags>({ sma20: false, ema21: false, bb: false, vwap: false, rsi: false, macd: false });
  const drag = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(220, r.width), h: Math.max(160, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const n = bars.length;
    const count = Math.min(n, TF_VIEW[interval] || 180);
    setView({ start: Math.max(0, n - count), count: count || 1 });
    setHover(null);
  }, [symbol, interval, bars.length]);

  const oscOn = inds.rsi || inds.macd;
  const plotH = Math.max(80, size.h - PAD.t - PAD.b - VOL_H - (oscOn ? OSC_H + 8 : 0));
  const innerW = Math.max(40, size.w - PAD.l - PAD.r);
  const shown = bars.slice(view.start, view.start + view.count);
  const n = shown.length;

  const lo0 = shown.reduce((m, b) => Math.min(m, b.l), Infinity);
  const hi0 = shown.reduce((m, b) => Math.max(m, b.h), -Infinity);
  const pad = (hi0 - lo0) * 0.04 || 1;
  const lo = Number.isFinite(lo0) ? lo0 - pad : 0;
  const hi = Number.isFinite(hi0) ? hi0 + pad : 1;
  const span = hi - lo || 1;
  const yPx = (p: number) => PAD.t + ((hi - p) / span) * plotH;
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
  const maxVol = shown.reduce((m, b) => Math.max(m, b.v || 0), 0) || 1;

  const hiIdx = hover != null && shown[hover] ? hover : n - 1;
  const cur = shown[hiIdx];

  function fit() {
    setView({ start: 0, count: Math.max(2, bars.length) });
  }
  function latest() {
    const count = Math.min(bars.length, TF_VIEW[interval] || 180);
    setView({ start: Math.max(0, bars.length - count), count });
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1.18 : 0.85;
    const nextCount = Math.max(20, Math.min(bars.length, Math.round(view.count * dir)));
    const rect = wrap.current?.getBoundingClientRect();
    const frac = rect ? Math.min(1, Math.max(0, (e.clientX - rect.left - PAD.l) / innerW)) : 0.5;
    const anchor = view.start + frac * view.count;
    const start = Math.max(0, Math.min(bars.length - nextCount, Math.round(anchor - frac * nextCount)));
    setView({ start, count: nextCount });
  }

  function idxAt(clientX: number) {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect || n < 1) return 0;
    const x = clientX - rect.left - PAD.l;
    const i = Math.floor((x / innerW) * n);
    return Math.max(0, Math.min(n - 1, i));
  }

  function poly(vals: (number | null)[], color: string) {
    const pts: string[] = [];
    vals.forEach((v, i) => {
      if (v == null || !Number.isFinite(v)) return;
      pts.push(`${xAt(i).toFixed(1)},${yPx(v).toFixed(1)}`);
    });
    if (pts.length < 2) return null;
    return <polyline fill="none" stroke={color} strokeWidth="1.2" points={pts.join(" ")} vectorEffect="nonScalingStroke" />;
  }

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => hi - (span * i) / ticks);

  return (
    <section
      data-term-chart={symbol}
      onClick={onActivate}
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-bg",
        active ? "ring-1 ring-fg/25" : "ring-1 ring-border",
      )}
    >
      <header className="flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5 sm:px-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <h2 className="truncate text-[14px] font-semibold leading-tight">{bareSymbol(symbol)}</h2>
              <span className="hidden text-[10px] tracking-[0.06em] text-subtle uppercase sm:inline">{exch}</span>
            </div>
            <p className="hidden max-w-[220px] truncate text-[11px] text-muted sm:block">{name}</p>
          </div>
          <div className="font-mono text-[15px] font-semibold tabular sm:text-[16px]">{fmtPx(px)}</div>
          <div className={cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down")}>{fmtPct(chg)}</div>
          <span
            data-status={status}
            title="Latest print Kosh has. Refreshes during the cash session. Not a guaranteed live tick."
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]",
              status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down",
            )}
          >
            {status === "session" ? `● ${quoteStatusLabel(status)} · ${istClock()}` : quoteStatusLabel(status)}
          </span>
          {owned ? <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">{owned}</span> : null}
          <button
            type="button"
            aria-label={watched ? "Remove from watch" : "Add to watch"}
            className={cn("ml-auto grid size-7 place-items-center sm:ml-0", watched ? "text-warn" : "text-muted hover:text-fg")}
            onClick={(e) => {
              e.stopPropagation();
              toggleWatch(symbol);
            }}
          >
            <Star className={cn("size-3.5", watched && "fill-current")} />
          </button>
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

      <div
        ref={wrap}
        className="relative min-h-0 flex-1 cursor-crosshair"
        onWheel={onWheel}
        onPointerDown={(e) => {
          onActivate();
          drag.current = { x: e.clientX, start: view.start };
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          setHover(idxAt(e.clientX));
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          const shift = Math.round(-dx / Math.max(4, slot));
          const start = Math.max(0, Math.min(bars.length - view.count, drag.current.start + shift));
          setView((v) => ({ ...v, start }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => setHover(null)}
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
                <text x={PAD.l - 6} y={yPx(p) + 3} textAnchor="end" fill={MUTED} fontSize="10" fontFamily="IBM Plex Mono, ui-monospace, monospace">
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
              <Osc
                xAt={xAt}
                top={PAD.t + plotH + VOL_H + 10}
                h={OSC_H}
                rsiArr={rsiArr}
                macdPack={macdPack}
              />
            ) : null}
            {cur && hover != null ? (
              <>
                <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.t} y2={PAD.t + plotH + VOL_H} stroke={MUTED} strokeDasharray="3 3" />
                <line x1={PAD.l} x2={size.w - PAD.r} y1={yPx(cur.c)} y2={yPx(cur.c)} stroke={MUTED} strokeDasharray="3 3" />
              </>
            ) : null}
          </svg>
        )}
        {cur ? (
          <div className="pointer-events-none absolute left-14 top-2 font-mono text-[11px] text-muted">
            {fmtWhen(cur.t, spec.intra)} · O {fmtPx(cur.o)} H {fmtPx(cur.h)} L {fmtPx(cur.l)} C {fmtPx(cur.c)}
            {volMissing ? " · Volume unavailable" : ` · Vol ${fmtVol(cur.v)}`}
          </div>
        ) : null}
        <div className="absolute right-2 top-2 flex gap-1">
          <IconBtn label="Fit" onClick={fit}>
            <Minimize2 className="size-3.5" />
          </IconBtn>
          <IconBtn label="Latest" onClick={latest}>
            <RotateCcw className="size-3.5" />
          </IconBtn>
          <IconBtn
            label="Fullscreen"
            onClick={() => {
              const el = wrap.current?.parentElement;
              if (!el) return;
              if (document.fullscreenElement) {
                void document.exitFullscreen();
                setFs(false);
              } else {
                void el.requestFullscreen();
                setFs(true);
              }
            }}
          >
            {fs ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </IconBtn>
        </div>
      </div>

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
        <span className="ml-auto text-[10px] text-subtle">
          {volMissing ? "Volume unavailable" : "RAW OHLC"}
        </span>
      </div>
    </section>
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

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="grid size-7 place-items-center rounded-sm bg-bg/80 text-muted hover:text-fg"
    >
      {children}
    </button>
  );
}
