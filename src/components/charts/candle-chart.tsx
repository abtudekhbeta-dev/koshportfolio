import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { ChartMark, OhlcBar } from "@/lib/kosh/types";
import {
  atr,
  bollinger,
  chartStructure,
  ema,
  fmtVol,
  lastNum,
  macd,
  rsi,
  sma,
  stoch,
  supertrend,
  vwap,
  volumeProfile,
  priorDayRange,
  sessionOpeningRange,
} from "@/lib/kosh/ohlc";
import { detectPatterns, patternStatusLabel, type PatternHit } from "@/lib/kosh/patterns";
import { applyDrag, hitTest, magnetPrice, type HitMode } from "@/lib/kosh/draw-hit";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { apiOhlc } from "@/lib/kosh/api";
import { Seg } from "@/components/seg";
import { cn } from "@/lib/utils";
import { bareSymbol, drawKey, newDrawId, useKosh, type DrawKind, type DrawShape } from "@/lib/store";
import {
  Minus,
  MoveRight,
  Square,
  Spline,
  Layers,
  Undo2,
  Trash2,
  MousePointer2,
  Maximize2,
  Minimize2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Columns2,
  Play,
  Pause,
  Magnet,
  Crosshair,
} from "lucide-react";

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";
const GRID = "var(--color-border)";
const TICK = "var(--color-subtle)";
const MA20 = "var(--color-chart)";
const MA50 = "var(--color-warn)";
const MA200 = "var(--color-chart-bench)";
const CMP = "var(--color-warn)";
const INK = "var(--color-fg)";
const ACCENT = "var(--color-accent)";
const VW = 900;
const PAD = { l: 12, r: 58, t: 12, b: 22 };
const VOL_H = 64;
/** Visible bars by timeframe — pan/zoom for more, like TradingView. */
const TF_VIEW: Record<string, number> = {
  "1m": 375,
  "5m": 375,
  "15m": 260,
  "30m": 260,
  "1H": 250,
  "1D": 252,
  "1W": 156,
  "1M": 120,
};
const OSC_H = 52;
const FIBS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const EMPTY_BARS: OhlcBar[] = [];

export type ChartStyle = "candle" | "bar" | "line" | "area";
export type IndId = "ma20" | "ma50" | "ma200" | "bb" | "ema21" | "vwap" | "rsi" | "macd" | "stoch" | "atr" | "supertrend" | "vp";
export type ToolId = "pan" | DrawKind;

function nice(v: number) {
  if (!Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1000) return v.toFixed(0);
  if (a >= 100) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

function fmtT(t: number, intra: boolean) {
  const d = new Date((t + 19800) * 1000);
  const y = String(d.getUTCFullYear()).slice(2);
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (!intra) return `${y}-${m}-${day}`;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}-${m} ${hh}:${mm}`;
}

function alignCompare(src: OhlcBar[], cmp: OhlcBar[]) {
  if (!cmp.length) return src.map(() => null as number | null);
  let j = 0;
  let last: number | null = null;
  return src.map((b) => {
    while (j < cmp.length && cmp[j].t <= b.t) {
      last = cmp[j].c;
      j += 1;
    }
    return last;
  });
}

type Layout = {
  n: number;
  xOf: (i: number) => number;
  yOf: (v: number) => number;
  vOf: (y: number) => number;
  iOf: (x: number) => number;
  plotTop: number;
  plotBot: number;
  left: number;
  right: number;
  vw: number;
  vh: number;
  src: OhlcBar[];
  rel: boolean;
  base: number;
};

function tToX(t: number, src: OhlcBar[], xOf: (i: number) => number): number {
  if (!src.length) return xOf(0);
  if (t <= src[0].t) return xOf(0);
  const last = src.length - 1;
  if (t >= src[last].t) return xOf(last);
  let lo = 0;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (src[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const i = lo;
  if (i <= 0) return xOf(0);
  const a = src[i - 1];
  const b = src[i];
  const f = (t - a.t) / (b.t - a.t || 1);
  return xOf(i - 1) + f * (xOf(i) - xOf(i - 1));
}

function PlotSvg({
  src,
  style,
  inds,
  intra,
  logScale,
  compare,
  measure,
  vh,
  volOn,
  levels,
  showLevels,
  sessionLevels,
}: {
  src: OhlcBar[];
  style: ChartStyle;
  inds: Record<IndId, boolean>;
  intra: boolean;
  logScale: boolean;
  compare: (number | null)[];
  measure: [number, number] | null;
  vh: number;
  volOn: boolean;
  levels?: { high52?: number; low52?: number; prev?: number };
  showLevels?: boolean;
  sessionLevels?: { orH?: number; orL?: number; pdh?: number; pdl?: number };
}) {
  const n = src.length;
  const closes = src.map((b) => b.c);
  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const e21 = ema(closes, 21);
  const bb = bollinger(closes, 20, 2);
  const vw = vwap(src);
  const rsis = rsi(closes, 14);
  const mac = macd(closes);
  const sto = stoch(src);
  const showRsi = inds.rsi;
  const showMacd = inds.macd;
  const showSto = inds.stoch;
  const showAtr = Boolean(inds.atr);
  const oscN = (showRsi ? 1 : 0) + (showMacd ? 1 : 0) + (showSto ? 1 : 0) + (showAtr ? 1 : 0);
  const volH = volOn ? VOL_H : 0;
  const plotH = vh - PAD.t - PAD.b - volH - oscN * OSC_H;
  const volTop = PAD.t + plotH;
  let oscTop = volTop + VOL_H;
  const rsiTop = showRsi ? oscTop : 0;
  if (showRsi) oscTop += OSC_H;
  const macdTop = showMacd ? oscTop : 0;
  if (showMacd) oscTop += OSC_H;
  const stoTop = showSto ? oscTop : 0;
  if (showSto) oscTop += OSC_H;
  const atrTop = showAtr ? oscTop : 0;
  const atrVals = showAtr ? atr(src) : [];
  const st = inds.supertrend ? supertrend(src) : null;
  const vpBins = inds.vp ? volumeProfile(src, 22) : [];
  const maxVp = Math.max(...vpBins.map((x) => x.vol), 1);

  const rel = compare.some((x) => x != null);
  const base = src[0]?.c || 1;
  const cmpBase = compare.find((x) => x != null && x > 0) || 1;
  const yVal = (v: number) => (rel ? (v / base - 1) * 100 : v);

  let hi = -Infinity;
  let lo = Infinity;
  const consider = (v: number | null | undefined) => {
    if (v == null || !Number.isFinite(v) || (v <= 0 && logScale && !rel)) return;
    const y = rel ? yVal(v) : v;
    if (y > hi) hi = y;
    if (y < lo) lo = y;
  };
  for (const b of src) {
    consider(b.h);
    consider(b.l);
    consider(b.c);
  }
  if (inds.ma20) ma20.forEach((v) => consider(v ?? undefined));
  if (inds.ma50) ma50.forEach((v) => consider(v ?? undefined));
  if (inds.ma200) ma200.forEach((v) => consider(v ?? undefined));
  if (rel) compare.forEach((v) => v != null && v > 0 && consider(base * (v / cmpBase)));
  if (!Number.isFinite(hi) || !Number.isFinite(lo) || hi === lo) {
    hi = rel ? 2 : src[n - 1]?.c || 1;
    lo = rel ? -2 : hi * 0.98;
  }
  const span = hi - lo || 1;
  const pad = span * 0.06;
  const yHi = hi + pad;
  const yLo = lo - pad;
  const maxV = Math.max(...src.map((b) => b.v), 1);
  const useLog = logScale && !rel && yLo > 0;
  const ly = (v: number) => (useLog ? Math.log(Math.max(v, 1e-9)) : v);
  const yTop = ly(yHi);
  const yBot = ly(yLo);

  function xOf(i: number) {
    const w = VW - PAD.l - PAD.r;
    return PAD.l + (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  }
  function yOf(v: number) {
    const lv = ly(rel ? yVal(v) : v);
    return PAD.t + ((yTop - lv) / (yTop - yBot || 1)) * plotH;
  }
  function linePath(vals: (number | null)[], map = (v: number) => v) {
    const parts: string[] = [];
    let drawing = false;
    for (let i = 0; i < n; i++) {
      const v = vals[i];
      if (v == null || !Number.isFinite(v)) {
        drawing = false;
        continue;
      }
      parts.push(`${drawing ? "L" : "M"}${xOf(i).toFixed(1)} ${yOf(map(v)).toFixed(1)}`);
      drawing = true;
    }
    return parts.join(" ");
  }

  const closePath = linePath(closes);
  const areaPath = closePath
    ? `${closePath} L${xOf(n - 1).toFixed(1)} ${yOf(rel ? base * (1 + yLo / 100) : yLo).toFixed(1)} L${xOf(0).toFixed(1)} ${yOf(rel ? base * (1 + yLo / 100) : yLo).toFixed(1)} Z`
    : "";

  const yTicks = [0, 1, 2, 3, 4].map((i) => {
    const raw = yLo + ((yHi - yLo) * i) / 4;
    return rel ? base * (1 + raw / 100) : raw;
  });
  const xCount = Math.min(6, n);
  const xIdx = n ? Array.from({ length: xCount }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, xCount - 1))) : [];
  const bw = Math.max(1.2, ((VW - PAD.l - PAD.r) / Math.max(1, n)) * 0.7);
  const last = src[n - 1];
  const upLast = last && last.c >= last.o;

  function oscPath(vals: (number | null)[], top: number, loB: number, hiB: number) {
    const parts: string[] = [];
    let drawing = false;
    for (let i = 0; i < n; i++) {
      const v = vals[i];
      if (v == null) {
        drawing = false;
        continue;
      }
      const y = top + ((hiB - v) / (hiB - loB || 1)) * (OSC_H - 8);
      parts.push(`${drawing ? "L" : "M"}${xOf(i).toFixed(1)} ${y.toFixed(1)}`);
      drawing = true;
    }
    return parts.join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${VW} ${vh}`}
      width="100%"
      height={vh}
      preserveAspectRatio="none"
      className="kosh-candle-svg"
      data-points={n}
    >
      <rect x="0" y="0" width={VW} height={vh} fill="var(--color-surface)" />
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} y1={yOf(v)} x2={VW - PAD.r} y2={yOf(v)} stroke={GRID} strokeWidth="1" />
          <text
            x={VW - PAD.r + 6}
            y={yOf(v)}
            fill={TICK}
            fontSize="10"
            fontFamily="IBM Plex Mono, ui-monospace, monospace"
            textAnchor="start"
            dominantBaseline="middle"
          >
            {rel ? (yVal(v) >= 0 ? "+" : "") + yVal(v).toFixed(1) + "%" : nice(v)}
          </text>
        </g>
      ))}
      {xIdx.map((i) => (
        <text
          key={src[i].t}
          x={xOf(i)}
          y={vh - 6}
          fill={TICK}
          fontSize="10"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          textAnchor="middle"
        >
          {fmtT(src[i].t, intra)}
        </text>
      ))}

      {style === "area" && areaPath ? <path d={areaPath} fill={upLast ? UP : DOWN} fillOpacity="0.14" stroke="none" /> : null}
      {style === "line" || style === "area" ? (
        <path d={closePath} fill="none" stroke={upLast ? UP : DOWN} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="nonScalingStroke" />
      ) : null}

      {style === "candle" || style === "bar"
        ? src.map((b, i) => {
            const up = b.c >= b.o;
            const color = up ? UP : DOWN;
            const x = xOf(i);
            const yH = yOf(b.h);
            const yL = yOf(b.l);
            const yO = yOf(b.o);
            const yC = yOf(b.c);
            const top = Math.min(yO, yC);
            const h = Math.max(1.2, Math.abs(yC - yO));
            if (style === "bar") {
              return (
                <g key={b.t}>
                  <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth="1.4" vectorEffect="nonScalingStroke" />
                  <line x1={x - bw / 2} y1={yO} x2={x} y2={yO} stroke={color} strokeWidth="1.4" vectorEffect="nonScalingStroke" />
                  <line x1={x} y1={yC} x2={x + bw / 2} y2={yC} stroke={color} strokeWidth="1.4" vectorEffect="nonScalingStroke" />
                </g>
              );
            }
            return (
              <g key={b.t}>
                <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth="1.2" vectorEffect="nonScalingStroke" />
                <rect x={x - bw / 2} y={top} width={bw} height={h} fill={color} />
              </g>
            );
          })
        : null}

      {volOn
        ? src.map((b, i) => {
            const h = Math.max(1, (b.v / maxV) * (VOL_H - 10));
            return (
              <rect
                key={"v" + b.t}
                x={xOf(i) - bw / 2}
                y={volTop + (VOL_H - 10) - h}
                width={bw}
                height={h}
                fill={b.c >= b.o ? UP : DOWN}
                opacity="0.35"
              />
            );
          })
        : null}

      {inds.bb && bb.upper.some((x) => x != null) ? (
        <>
          <path d={linePath(bb.upper)} fill="none" stroke={MA20} strokeOpacity="0.35" strokeWidth="1" />
          <path d={linePath(bb.lower)} fill="none" stroke={MA20} strokeOpacity="0.35" strokeWidth="1" />
        </>
      ) : null}
      {inds.ma20 ? <path d={linePath(ma20)} fill="none" stroke={MA20} strokeWidth="1.4" vectorEffect="nonScalingStroke" /> : null}
      {inds.ma50 ? <path d={linePath(ma50)} fill="none" stroke={MA50} strokeWidth="1.4" vectorEffect="nonScalingStroke" /> : null}
      {inds.ma200 ? <path d={linePath(ma200)} fill="none" stroke={MA200} strokeWidth="1.6" vectorEffect="nonScalingStroke" /> : null}
      {inds.ema21 ? <path d={linePath(e21)} fill="none" stroke={DOWN} strokeWidth="1.3" strokeDasharray="4 3" vectorEffect="nonScalingStroke" /> : null}
      {inds.vwap ? <path d={linePath(vw)} fill="none" stroke={MA50} strokeWidth="1.3" vectorEffect="nonScalingStroke" /> : null}
      {rel ? <path d={linePath(compare, (v) => base * (v / cmpBase))} fill="none" stroke={CMP} strokeWidth="1.6" vectorEffect="nonScalingStroke" /> : null}

      {measure ? (
        <g>
          <line x1={xOf(measure[0])} y1={yOf(src[measure[0]].c)} x2={xOf(measure[1])} y2={yOf(src[measure[1]].c)} stroke={INK} strokeWidth="1.2" strokeDasharray="4 3" />
          <circle cx={xOf(measure[0])} cy={yOf(src[measure[0]].c)} r="3" fill={INK} />
          <circle cx={xOf(measure[1])} cy={yOf(src[measure[1]].c)} r="3" fill={INK} />
        </g>
      ) : null}

      {showRsi
        ? [30, 50, 70].map((lv) => {
            const y = rsiTop + ((100 - lv) / 100) * (OSC_H - 8);
            return <line key={lv} x1={PAD.l} y1={y} x2={VW - PAD.r} y2={y} stroke={GRID} strokeWidth="1" />;
          })
        : null}
      {showRsi ? <path d={oscPath(rsis, rsiTop, 0, 100)} fill="none" stroke={MA20} strokeWidth="1.4" vectorEffect="nonScalingStroke" /> : null}

      {showMacd
        ? src.map((_, i) => {
            const h = mac.hist[i];
            if (h == null) return null;
            const mag = Math.max(...mac.hist.map((x) => Math.abs(x || 0)), 0.01);
            const mid = macdTop + (OSC_H - 8) / 2;
            const hh = (h / mag) * ((OSC_H - 12) / 2);
            return (
              <rect
                key={"mh" + i}
                x={xOf(i) - bw / 2}
                y={hh >= 0 ? mid - hh : mid}
                width={bw}
                height={Math.max(1, Math.abs(hh))}
                fill={h >= 0 ? UP : DOWN}
                opacity="0.45"
              />
            );
          })
        : null}
      {showMacd ? <path d={oscPath(mac.line, macdTop, -(lastNum(mac.line.map((x) => Math.abs(x || 0))) || 1), lastNum(mac.line.map((x) => Math.abs(x || 0))) || 1)} fill="none" stroke={MA20} strokeWidth="1.2" /> : null}

      {showSto ? <path d={oscPath(sto.k, stoTop, 0, 100)} fill="none" stroke={MA20} strokeWidth="1.3" /> : null}
      {showSto ? <path d={oscPath(sto.d, stoTop, 0, 100)} fill="none" stroke={MA50} strokeWidth="1.2" /> : null}

      {last ? (
        <g>
          <circle cx={xOf(n - 1)} cy={yOf(last.c)} r="3.2" fill={upLast ? UP : DOWN} stroke="var(--color-bg)" strokeWidth="1.2" />
          {!rel ? (
            <>
              <rect
                x={VW - PAD.r}
                y={yOf(last.c) - 8}
                width="52"
                height="16"
                fill={upLast ? UP : DOWN}
              />
              <text
                x={VW - PAD.r + 4}
                y={yOf(last.c) + 3}
                fill="var(--color-accent-fg)"
                fontSize="10"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
              >
                {nice(last.c)}
              </text>
            </>
          ) : null}
        </g>
      ) : null}

      {!rel && showLevels
        ? (
            [
              { v: levels?.high52, label: "52w H", color: DOWN },
              { v: levels?.low52, label: "52w L", color: UP },
              { v: levels?.prev, label: "Prev", color: TICK },
            ]
              .filter((x): x is { v: number; label: string; color: string } => x.v != null && x.v > 0)
              .filter((x) => x.v <= yHi * 1.04 && x.v >= yLo * 0.96)
              .map((x) => (
                <g key={x.label}>
                  <line
                    x1={PAD.l}
                    y1={yOf(x.v)}
                    x2={VW - PAD.r}
                    y2={yOf(x.v)}
                    stroke={x.color}
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    strokeOpacity="0.75"
                    vectorEffect="nonScalingStroke"
                  />
                  <text
                    x={VW - PAD.r + 4}
                    y={yOf(x.v)}
                    fill={x.color}
                    fontSize="9"
                    fontFamily="IBM Plex Mono, ui-monospace, monospace"
                    dominantBaseline="middle"
                  >
                    {x.label}
                  </text>
                </g>
              ))
          )
        : null}

      {st
        ? src.map((b, i) => {
            if (i === 0 || st.line[i] == null || st.line[i - 1] == null) return null;
            return (
              <line
                key={"st" + b.t}
                x1={xOf(i - 1)}
                y1={yOf(st.line[i - 1] as number)}
                x2={xOf(i)}
                y2={yOf(st.line[i] as number)}
                stroke={st.dir[i] === 1 ? UP : DOWN}
                strokeWidth="1.4"
                vectorEffect="nonScalingStroke"
              />
            );
          })
        : null}

      {vpBins.map((bin) => {
        const w = (bin.vol / maxVp) * 64;
        return (
          <rect
            key={"vp" + bin.price}
            x={VW - PAD.r - w}
            y={yOf(bin.price) - 2}
            width={w}
            height="4"
            fill={MA20}
            opacity="0.28"
          />
        );
      })}

      {showAtr
        ? (() => {
            const hiA = Math.max(...atrVals.map((x) => x || 0), 0.01);
            return <path d={oscPath(atrVals, atrTop, 0, hiA)} fill="none" stroke={MA50} strokeWidth="1.3" vectorEffect="nonScalingStroke" />;
          })()
        : null}

      {!rel && sessionLevels
        ? (
            [
              { v: sessionLevels.orH, label: "ORH", color: ACCENT },
              { v: sessionLevels.orL, label: "ORL", color: ACCENT },
              { v: sessionLevels.pdh, label: "PDH", color: MA50 },
              { v: sessionLevels.pdl, label: "PDL", color: MA50 },
            ]
              .filter((x): x is { v: number; label: string; color: string } => x.v != null && x.v > 0)
              .filter((x) => x.v <= yHi * 1.04 && x.v >= yLo * 0.96)
              .map((x) => (
                <g key={x.label}>
                  <line
                    x1={PAD.l}
                    y1={yOf(x.v)}
                    x2={VW - PAD.r}
                    y2={yOf(x.v)}
                    stroke={x.color}
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    strokeOpacity="0.8"
                    vectorEffect="nonScalingStroke"
                  />
                  <text
                    x={VW - PAD.r + 4}
                    y={yOf(x.v)}
                    fill={x.color}
                    fontSize="9"
                    fontFamily="IBM Plex Mono, ui-monospace, monospace"
                    dominantBaseline="middle"
                  >
                    {x.label}
                  </text>
                </g>
              ))
          )
        : null}
    </svg>
  );
}

const MemoPlot = memo(PlotSvg);

function ShapeSvg({
  s,
  src,
  xOf,
  yOf,
  right,
  selected,
}: {
  s: DrawShape;
  src: OhlcBar[];
  xOf: (i: number) => number;
  yOf: (v: number) => number;
  right: number;
  selected?: boolean;
}) {
  const x0 = tToX(s.t0, src, xOf);
  const y0 = yOf(s.y0);
  const x1 = tToX(s.t1 ?? s.t0, src, xOf);
  const y1 = yOf(s.y1 ?? s.y0);
  const stroke = selected ? "var(--color-fg)" : ACCENT;
  const w = selected ? 1.8 : 1.2;
  const handles = selected ? (
    <g>
      <rect x={x0 - 4} y={y0 - 4} width="8" height="8" fill="var(--color-bg)" stroke={stroke} strokeWidth="1.2" />
      {s.kind !== "hline" && s.kind !== "vline" ? (
        <rect x={x1 - 4} y={y1 - 4} width="8" height="8" fill="var(--color-bg)" stroke={stroke} strokeWidth="1.2" />
      ) : null}
    </g>
  ) : null;
  if (s.kind === "hline") {
    return (
      <g>
        <line x1={PAD.l} y1={y0} x2={right} y2={y0} stroke={stroke} strokeWidth={w} vectorEffect="nonScalingStroke" />
        <text
          x={right + 4}
          y={y0}
          fill={stroke}
          fontSize="9"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          dominantBaseline="middle"
        >
          {nice(s.y0)}
        </text>
        {selected ? (
          <>
            <rect x={PAD.l - 4} y={y0 - 4} width="8" height="8" fill="var(--color-bg)" stroke={stroke} strokeWidth="1.2" />
            <rect x={right - 4} y={y0 - 4} width="8" height="8" fill="var(--color-bg)" stroke={stroke} strokeWidth="1.2" />
          </>
        ) : null}
      </g>
    );
  }
  if (s.kind === "vline") {
    return (
      <g>
        <line x1={x0} y1={0} x2={x0} y2={2000} stroke={stroke} strokeWidth={w} vectorEffect="nonScalingStroke" />
        {handles}
      </g>
    );
  }
  if (s.kind === "long" || s.kind === "short") {
    const color = s.kind === "long" ? UP : DOWN;
    return (
      <g>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={selected ? 1.8 : 1.5} vectorEffect="nonScalingStroke" />
        <circle cx={x0} cy={y0} r="3" fill={color} />
        <circle cx={x1} cy={y1} r="3" fill={color} />
        <text x={x1 + 4} y={y1 - 4} fill={color} fontSize="10" fontFamily="IBM Plex Sans, system-ui, sans-serif">
          {s.kind === "long" ? "Long" : "Short"} {nice(s.y0)} → {nice(s.y1 ?? s.y0)}
        </text>
        {handles}
      </g>
    );
  }
  if (s.kind === "channel") {
    const off = s.off ?? Math.abs(s.y0) * 0.012;
    const y0b = yOf(s.y0 + off);
    const y1b = yOf((s.y1 ?? s.y0) + off);
    return (
      <g>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth={w} vectorEffect="nonScalingStroke" />
        <line x1={x0} y1={y0b} x2={x1} y2={y1b} stroke={stroke} strokeWidth={w} vectorEffect="nonScalingStroke" />
        <polygon
          points={`${x0},${y0} ${x1},${y1} ${x1},${y1b} ${x0},${y0b}`}
          fill={ACCENT}
          fillOpacity="0.08"
          stroke="none"
        />
        {handles}
        {selected ? (
          <rect
            x={(x0 + x1) / 2 - 4}
            y={(y0b + y1b) / 2 - 4}
            width="8"
            height="8"
            fill="var(--color-bg)"
            stroke={stroke}
            strokeWidth="1.2"
          />
        ) : null}
      </g>
    );
  }
  if (s.kind === "trend") {
    return (
      <g>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth={selected ? 1.7 : 1.3} vectorEffect="nonScalingStroke" />
        {handles}
      </g>
    );
  }
  if (s.kind === "ray") {
    const dx = x1 - x0 || 0.001;
    const m = (y1 - y0) / dx;
    const xEnd = dx >= 0 ? right : PAD.l;
    const yEnd = y0 + m * (xEnd - x0);
    return (
      <g>
        <line x1={x0} y1={y0} x2={xEnd} y2={yEnd} stroke={stroke} strokeWidth={selected ? 1.7 : 1.3} vectorEffect="nonScalingStroke" />
        {handles}
      </g>
    );
  }
  if (s.kind === "rect") {
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    return (
      <g>
        <rect
          x={x}
          y={y}
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
  const hi = Math.max(s.y0, s.y1 ?? s.y0);
  const lo = Math.min(s.y0, s.y1 ?? s.y0);
  const span = hi - lo || 1;
  return (
    <g>
      {FIBS.map((f) => {
        const px = hi - span * f;
        const y = yOf(px);
        return (
          <g key={f}>
            <line x1={PAD.l} y1={y} x2={right} y2={y} stroke={stroke} strokeOpacity={f === 0 || f === 1 ? 0.95 : 0.55} strokeWidth="1" />
            <text x={PAD.l + 4} y={y - 3} fill={stroke} fontSize="9" fontFamily="IBM Plex Mono, ui-monospace, monospace">
              {(f * 100).toFixed(1)} {nice(px)}
            </text>
          </g>
        );
      })}
      {handles}
    </g>
  );
}

function MarksSvg({
  marks,
  src,
  xOf,
  yOf,
  right,
}: {
  marks: ChartMark[];
  src: OhlcBar[];
  xOf: (i: number) => number;
  yOf: (v: number) => number;
  right: number;
}) {
  return (
    <g>
      {marks.map((m) => {
        const y = yOf(m.price);
        const color = m.tone === "up" ? UP : m.tone === "down" ? DOWN : m.tone === "muted" ? TICK : ACCENT;
        if (m.kind === "sr") {
          return (
            <g key={m.id}>
              <line
                x1={PAD.l}
                y1={y}
                x2={right}
                y2={y}
                stroke={color}
                strokeWidth="1"
                strokeDasharray="3 5"
                strokeOpacity="0.7"
                vectorEffect="nonScalingStroke"
              />
              <text
                x={PAD.l + 4}
                y={y - 3}
                fill={color}
                fontSize="9"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
              >
                {m.label} {nice(m.price)}
              </text>
            </g>
          );
        }
        const x = m.t != null ? tToX(m.t, src, xOf) : PAD.l;
        return (
          <g key={m.id}>
            <circle cx={x} cy={y} r="3" fill={color} fillOpacity="0.9" />
            <text
              x={x + 5}
              y={y - 5}
              fill={color}
              fontSize="9"
              fontFamily="IBM Plex Sans, system-ui, sans-serif"
            >
              {m.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PatternSvg({
  hits,
  src,
  xOf,
  yOf,
  intervalId,
}: {
  hits: PatternHit[];
  src: OhlcBar[];
  xOf: (i: number) => number;
  yOf: (v: number) => number;
  intervalId: string;
}) {
  const color = (t: PatternHit["tone"]) => (t === "up" ? UP : t === "down" ? DOWN : ACCENT);
  return (
    <g>
      <text
        x={PAD.l + 4}
        y={PAD.t + 12}
        fill={TICK}
        fontSize="10"
        fontFamily="IBM Plex Sans, system-ui, sans-serif"
      >
        {`Patterns on ${intervalId} · last ${src.length} bars`}
      </text>
      {hits.map((h, i) => {
        const pts = h.points
          .map((p) => `${tToX(p.t, src, xOf).toFixed(1)},${yOf(p.price).toFixed(1)}`)
          .join(" ");
        const last = h.points[h.points.length - 1];
        const x = last ? tToX(last.t, src, xOf) : PAD.l;
        const y = last ? yOf(last.price) : PAD.t;
        const c = color(h.tone);
        return (
          <g key={h.kind + String(i)}>
            {h.points.length >= 2 ? (
              <polyline
                points={pts}
                fill="none"
                stroke={c}
                strokeWidth="1.4"
                strokeDasharray="4 3"
                vectorEffect="nonScalingStroke"
              />
            ) : last ? (
              <line
                x1={PAD.l}
                y1={yOf(last.price)}
                x2={VW - PAD.r}
                y2={yOf(last.price)}
                stroke={c}
                strokeWidth="1"
                strokeDasharray="5 4"
                strokeOpacity="0.8"
                vectorEffect="nonScalingStroke"
              />
            ) : null}
            <text
              x={x + 6}
              y={y - 6}
              fill={c}
              fontSize="10"
              fontFamily="IBM Plex Sans, system-ui, sans-serif"
            >
              {h.label} · {patternStatusLabel(h.status)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function CandleChart({
  bars,
  intra = false,
  compareBars,
  compareLabel,
  symbol,
  high52,
  low52,
  prevClose,
}: {
  bars: OhlcBar[];
  intra?: boolean;
  compareBars?: OhlcBar[] | null;
  compareLabel?: string;
  symbol?: string;
  high52?: number;
  low52?: number;
  prevClose?: number;
}) {
  const prefs = useKosh((s) => s.chartPrefs);
  const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
  const setDrawings = useKosh((s) => s.setDrawings);
  const style = prefs.style;
  const inds = prefs.inds;
  const logScale = prefs.logScale;
  const volOn = prefs.volOn;
  const showLevels = prefs.showLevels === true;
  const sessionOn = prefs.sessionOn !== false;
  const intervalId = prefs.interval;
  const lookback = clampLookback(intervalId, prefs.lookback);
  const spec = fetchSpec(intervalId);
  const queryClient = useQueryClient();
  const live = useQuery({
    queryKey: ["ohlc", symbol || "", spec.range, spec.interval],
    queryFn: () => apiOhlc(symbol || "", spec.range, spec.interval),
    enabled: Boolean(symbol),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    if (!symbol) return;
    const near: Record<string, string[]> = {
      "1m": ["5m"],
      "5m": ["1m", "15m"],
      "15m": ["5m", "30m", "1H"],
      "30m": ["15m", "1H"],
      "1H": ["15m", "1D"],
      "1D": ["1H", "1W"],
      "1W": ["1D", "1M"],
      "1M": ["1W", "1D"],
    };
    for (const id of near[intervalId] || []) {
      const s = fetchSpec(id);
      void queryClient.prefetchQuery({
        queryKey: ["ohlc", symbol, s.range, s.interval],
        queryFn: () => apiOhlc(symbol, s.range, s.interval),
        staleTime: 60_000,
      });
    }
  }, [symbol, intervalId, queryClient]);
  const specRef = useRef(spec);
  if (!live.isPlaceholderData) specRef.current = spec;
  const activeSpec = specRef.current;
  const horizon = (live.data && !live.data.missing && live.data.bars?.length ? live.data.bars : bars) || EMPTY_BARS;
  const chartIntra = live.data && !live.data.missing && live.data.bars?.length ? activeSpec.intra : intra;
  const updating = Boolean(symbol) && live.isFetching;
  const [measureOn, setMeasureOn] = useState(false);
  const [measure, setMeasure] = useState<[number, number] | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [view, setView] = useState({ start: 0, count: 0 });
  const [tool, setTool] = useState<ToolId>("pan");
  const [toolLock, setToolLock] = useState(false);
  const [draft, setDraft] = useState<DrawShape | null>(null);
  const [fs, setFs] = useState(false);
  const [fsH, setFsH] = useState(640);
  const [replayOn, setReplayOn] = useState(false);
  const [replayEnd, setReplayEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replayPick, setReplayPick] = useState(false);
  const magnet = prefs.magnet === true;
  const structOn = prefs.structOn === true;
  const patternsOn = prefs.patternsOn === true;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [layoutGen, setLayoutGen] = useState(0);
  const [openMenu, setOpenMenu] = useState<null | "ind" | "ov">(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const key = symbol ? drawKey(symbol, intervalId) : "";
  const [shapes, setShapes] = useState<DrawShape[]>(() => (key ? useKosh.getState().drawings[key] || [] : []));
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const vLine = useRef<HTMLDivElement>(null);
  const hLine = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const read = useRef<HTMLDivElement>(null);
  const layout = useRef<Layout | null>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const shapeDrag = useRef<{ id: string; mode: HitMode; t: number; y: number; orig: DrawShape } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const cmpHorizon = compareBars || EMPTY_BARS;
  const full = horizon;
  const nAll = full.length;
  const count = view.count > 0 ? Math.min(view.count, nAll) : nAll;
  const start = Math.max(0, Math.min(Math.max(0, nAll - count), view.start));
  const sliceEnd = replayOn ? Math.max(8, Math.min(nAll, replayEnd || nAll)) : start + count;
  const sliceStart = replayOn ? 0 : start;
  const src = useMemo(() => full.slice(sliceStart, sliceEnd), [full, sliceStart, sliceEnd]);
  const compare = useMemo(() => alignCompare(src, cmpHorizon), [src, cmpHorizon]);
  const oscN = (inds.rsi ? 1 : 0) + (inds.macd ? 1 : 0) + (inds.stoch ? 1 : 0) + (inds.atr ? 1 : 0);
  const volH = volOn ? VOL_H : 0;
  const baseH = fs ? fsH : narrow ? 300 : 420;
  const vh = baseH + oscN * OSC_H;
  const last = src[src.length - 1];
  const atrLast = lastNum(atr(src));
  const viewRet = src[0]?.c && last?.c ? (last.c / src[0].c - 1) * 100 : null;
  const barSig = full.length ? `${full[0]?.t}:${full[full.length - 1]?.t}:${full.length}` : "0";
  const structure = useMemo(() => (structOn && src.length >= 20 ? chartStructure(src) : null), [src, structOn]);
  const patterns = useMemo(() => (patternsOn && src.length >= 24 ? detectPatterns(src) : []), [src, patternsOn]);

  useEffect(() => {
    const go = () => setNarrow(window.innerWidth < 640);
    go();
    window.addEventListener("resize", go);
    return () => window.removeEventListener("resize", go);
  }, []);

  useEffect(() => {
    const vis = Math.min(TF_VIEW[intervalId] || 252, nAll || 0);
    setView({ start: Math.max(0, (nAll || 0) - vis), count: vis });
    setMeasure(null);
    setPending(null);
    setDraft(null);
    setReplayOn(false);
    setPlaying(false);
    setReplayEnd(nAll);
  }, [barSig, nAll, intervalId]);

  useEffect(() => {
    if (!playing || !replayOn) return;
    const id = window.setInterval(() => {
      setReplayEnd((i) => {
        const next = i + Math.max(1, Math.round(nAll / 180));
        if (next >= nAll) {
          setPlaying(false);
          return nAll;
        }
        return next;
      });
    }, 160);
    return () => window.clearInterval(id);
  }, [playing, replayOn, nAll]);

  useEffect(() => {
    setShapes(key ? useKosh.getState().drawings[key] || [] : []);
    setDraft(null);
  }, [key]);

  useEffect(() => {
    if (!fs) return;
    const go = () => setFsH(Math.max(480, window.innerHeight - 170));
    go();
    window.addEventListener("resize", go);
    document.documentElement.classList.add("kosh-fs-lock");
    return () => {
      window.removeEventListener("resize", go);
      document.documentElement.classList.remove("kosh-fs-lock");
    };
  }, [fs]);

  function saveChart() {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${bareSymbol(symbol || "chart")}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function finishTool() {
    if (!toolLock) {
      setTool("pan");
      setToolLock(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tagName = (e.target as HTMLElement | null)?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          commit(shapes.filter((s) => s.id !== selectedId));
          setSelectedId(null);
        }
        return;
      }
      if (e.key !== "Escape") return;
      if (draft) {
        setDraft(null);
        return;
      }
      if (selectedId) {
        setSelectedId(null);
        return;
      }
      if (fs) {
        setFs(false);
        return;
      }
      if (tool !== "pan") {
        setTool("pan");
        setToolLock(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, fs, tool, selectedId, shapes]);

  function commit(next: DrawShape[]) {
    setShapes(next);
    if (key) setDrawings(key, next);
  }

  useEffect(() => {
    const n = src.length;
    const plotH = vh - PAD.t - PAD.b - volH - oscN * OSC_H;
    const rel = compare.some((x) => x != null);
    const base = src[0]?.c || 1;
    let hi = -Infinity;
    let lo = Infinity;
    for (const b of src) {
      if (b.h > hi) hi = b.h;
      if (b.l < lo) lo = b.l;
    }
    if (!Number.isFinite(hi)) {
      hi = last?.c || 1;
      lo = hi * 0.98;
    }
    const yHi = hi + (hi - lo) * 0.06;
    const yLo = lo - (hi - lo) * 0.06;
    const useLog = logScale && !rel && yLo > 0;
    const ly = (v: number) => (useLog ? Math.log(Math.max(v, 1e-9)) : v);
    const yTop = ly(rel ? (yHi / base - 1) * 100 : yHi);
    const yBot = ly(rel ? (yLo / base - 1) * 100 : yLo);
    layout.current = {
      n,
      src,
      rel,
      base,
      vw: VW,
      vh,
      left: PAD.l,
      right: VW - PAD.r,
      plotTop: PAD.t,
      plotBot: PAD.t + plotH,
      xOf: (i) => PAD.l + (n <= 1 ? (VW - PAD.l - PAD.r) / 2 : (i / (n - 1)) * (VW - PAD.l - PAD.r)),
      yOf: (v) => {
        const mapped = rel ? (v / base - 1) * 100 : v;
        const lv = ly(mapped);
        return PAD.t + ((yTop - lv) / (yTop - yBot || 1)) * plotH;
      },
      vOf: (y) => {
        const t = (y - PAD.t) / (plotH || 1);
        const lv = yTop - t * (yTop - yBot);
        const raw = useLog ? Math.exp(lv) : lv;
        return rel ? base * (1 + raw / 100) : raw;
      },
      iOf: (x) => {
        const t = (x - PAD.l) / (VW - PAD.l - PAD.r);
        return Math.round(Math.min(1, Math.max(0, t)) * Math.max(0, n - 1));
      },
    };
    setLayoutGen((g) => g + 1);
  }, [src, vh, oscN, logScale, compare, last, volH]);

  function svgXY(e: { clientX: number; clientY: number }) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / (r.width || 1)) * VW,
      y: ((e.clientY - r.top) / (r.height || 1)) * vh,
    };
  }

  function paint(i: number, yPx: number) {
    const L = layout.current;
    if (!L || !src[i]) return;
    const xPct = (L.xOf(i) / VW) * 100;
    const yPct = (Math.min(L.plotBot, Math.max(L.plotTop, yPx)) / vh) * 100;
    if (vLine.current) vLine.current.style.left = xPct + "%";
    if (hLine.current) hLine.current.style.top = yPct + "%";
    if (tag.current) {
      tag.current.style.top = yPct + "%";
      tag.current.textContent = nice(L.vOf(yPx));
    }
    const b = src[i];
    if (read.current) {
      const ch = b.o ? (((b.c - b.o) / b.o) * 100).toFixed(2) + "%" : "";
      read.current.textContent = `${fmtT(b.t, chartIntra)}   O ${nice(b.o)}  H ${nice(b.h)}  L ${nice(b.l)}  C ${nice(b.c)}  ${ch}  Vol ${fmtVol(b.v)}`;
    }
  }

  function snapY(i: number, y: number) {
    const L = layout.current;
    if (!L) return y;
    const raw = L.vOf(y);
    return magnetPrice(src[i], raw, magnet);
  }

  function onMove(e: React.PointerEvent) {
    const L = layout.current;
    if (!L) return;
    const { x, y } = svgXY(e);
    const i = L.iOf(x);
    const price = snapY(i, y);
    if (shapeDrag.current) {
      const d = shapeDrag.current;
      const dt = (src[i]?.t || d.t) - d.t;
      const dy = price - d.y;
      setShapes((list) => list.map((s) => (s.id === d.id ? applyDrag(d.orig, d.mode, dt, dy, src[i]?.t || d.orig.t0, price) : s)));
      return;
    }
    if (draft && src[i]) {
      setDraft({ ...draft, t1: src[i].t, y1: price });
    }
    if (drag.current && e.buttons && tool === "pan") {
      const dx = e.clientX - drag.current.x;
      const barW = (wrapRef.current?.getBoundingClientRect().width || 900) / Math.max(1, L.n);
      const shift = Math.round(-dx / Math.max(4, barW));
      if (shift) {
        drag.current.moved = true;
        const next = Math.max(0, Math.min(nAll - count, drag.current.start + shift));
        if (next !== viewRef.current.start) setView({ start: next, count });
      }
      return;
    }
    if (tool === "pan" && !shapeDrag.current) {
      const hit = hitTest(shapes, x, y, src, L.xOf, L.yOf, L.left, L.right, L.plotTop, L.plotBot);
      (e.currentTarget as HTMLElement).style.cursor = hit ? (hit.mode === "body" ? "move" : "grab") : "crosshair";
    }
    paint(i, y);
  }

  function onDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const L = layout.current;
    if (!L) return;
    const { x, y } = svgXY(e);
    if (tool === "pan" && !replayPick) {
      const hit = hitTest(shapes, x, y, src, L.xOf, L.yOf, L.left, L.right, L.plotTop, L.plotBot);
      if (hit) {
        const orig = shapes.find((s) => s.id === hit.id);
        if (orig) {
          const i = L.iOf(x);
          shapeDrag.current = { id: hit.id, mode: hit.mode, t: src[i]?.t || orig.t0, y: snapY(i, y), orig };
          setSelectedId(hit.id);
          drag.current = { x: e.clientX, start, moved: false };
          return;
        }
      }
      setSelectedId(null);
      drag.current = { x: e.clientX, start, moved: false };
    }
  }

  function onUp(e: React.PointerEvent) {
    const L = layout.current;
    const d = drag.current;
    const sd = shapeDrag.current;
    drag.current = null;
    shapeDrag.current = null;
    if (!L) return;
    const { x, y } = svgXY(e);
    const i = L.iOf(x);
    const bar = src[i];
    const price = snapY(i, y);

    if (sd) {
      const t = bar?.t || sd.t;
      const p = Number.isFinite(price) ? price : sd.y;
      const next = shapes.map((s) =>
        s.id === sd.id ? applyDrag(sd.orig, sd.mode, t - sd.t, p - sd.y, t, p) : s,
      );
      commit(next);
      return;
    }

    if (!bar) return;

    if (replayOn && (replayPick || !playing)) {
      if (!d || !d.moved) {
        setReplayEnd(Math.max(8, i + 1));
        setReplayPick(false);
        setPlaying(false);
      }
      return;
    }

    if (tool !== "pan") {
      if (tool === "hline" || tool === "vline") {
        const id = newDrawId();
        setShapes((s) => {
          const next: DrawShape[] = [...s, { id, kind: tool, t0: bar.t, y0: price }];
          if (key) setDrawings(key, next);
          return next;
        });
        setSelectedId(id);
        finishTool();
        return;
      }
      if (!draft) {
        setDraft({ id: newDrawId(), kind: tool, t0: bar.t, y0: price, t1: bar.t, y1: price });
        return;
      }
      setShapes((s) => {
        const next = [...s, { ...draft, t1: bar.t, y1: price }];
        if (key) setDrawings(key, next);
        return next;
      });
      setSelectedId(draft.id);
      setDraft(null);
      finishTool();
      return;
    }

    if (!d || d.moved || !measureOn) return;
    if (pending == null) {
      setPending(i);
      setMeasure(null);
    } else {
      setMeasure([pending, i]);
      setPending(null);
    }
  }

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (nAll < 30) return;
      const { x } = svgXY(e);
      const L = layout.current;
      const t = L ? (x - PAD.l) / (VW - PAD.l - PAD.r) : 0.5;
      const cur = count || nAll;
      const nextCount = Math.max(20, Math.min(nAll, Math.round(cur * (e.deltaY > 0 ? 1.18 : 0.82))));
      const center = start + t * cur;
      const nextStart = Math.max(0, Math.min(nAll - nextCount, Math.round(center - t * nextCount)));
      setView({ start: nextStart, count: nextCount });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [nAll, count, start, vh]);

  useEffect(() => {
    if (!openMenu) return;
    const on = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [openMenu]);

  function toggle(id: IndId) {
    patchChartPrefs({ inds: { [id]: !inds[id] } });
  }

  const L = layout.current;
  void layoutGen;

  if (src.length < 2) {
    const loading = Boolean(symbol) && (live.isPending || live.isFetching);
    return (
      <div className="rounded-lg bg-surface p-3 sm:p-4 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase" title="Bar size — 1 minute to 1 month">
              Timeframe
            </span>
            <IntervalBar
              value={intervalId}
              onChange={(id) => patchChartPrefs({ interval: id, lookback: clampLookback(id, lookback) })}
            />
          </label>
        </div>
        <div
          className="mt-3 grid h-[300px] place-items-center text-sm text-muted sm:h-[420px]"
          data-testid="kosh-candle"
          data-lookback={lookback}
          data-interval={intervalId}
          data-points="0"
        >
          {loading ? "Updating candles…" : "Not enough prints to draw this range."}
        </div>
      </div>
    );
  }

  const measTxt =
    measure && src[measure[0]] && src[measure[1]]
      ? (() => {
          const a = src[measure[0]];
          const b = src[measure[1]];
          const pct = a.c ? ((b.c / a.c - 1) * 100).toFixed(2) : "—";
          return `${fmtPx(a.c)} → ${fmtPx(b.c)}  ${pct}%`;
        })()
      : null;

  const tools: { id: ToolId; label: string; icon: typeof Minus }[] = [
    { id: "pan", label: "Pan", icon: MousePointer2 },
    { id: "trend", label: "Trend", icon: Spline },
    { id: "hline", label: "H-line", icon: Minus },
    { id: "vline", label: "V-line", icon: Minus },
    { id: "ray", label: "Ray", icon: MoveRight },
    { id: "rect", label: "Rect", icon: Square },
    { id: "fib", label: "Fib", icon: Layers },
    { id: "long", label: "Long", icon: ArrowUpRight },
    { id: "short", label: "Short", icon: ArrowDownRight },
    { id: "channel", label: "Channel", icon: Columns2 },
  ];

  const card = (
    <div className={cn("rounded-lg bg-surface p-3 sm:p-4 shadow-[var(--shadow-border)]", fs && "kosh-chart-fs")}>
      <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase" title="Bar size — 1 minute to 1 month">
              Timeframe
            </span>
            <IntervalBar
              value={intervalId}
              onChange={(id) => patchChartPrefs({ interval: id, lookback: clampLookback(id, lookback) })}
            />
          </label>
        </div>
        <Seg
          value={style}
          onChange={(id) => patchChartPrefs({ style: id as ChartStyle })}
          options={[
            { id: "candle", label: "Candles" },
            { id: "bar", label: "Bars" },
            { id: "line", label: "Line" },
            { id: "area", label: "Area" },
          ]}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-1.5" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "ind" ? null : "ind"))}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]",
                openMenu === "ind" || Object.values(inds).some(Boolean)
                  ? "bg-chart/15 text-fg"
                  : "bg-bg text-muted",
              )}
            >
              Indicators
            </button>
            {openMenu === "ind" ? (
              <div className="absolute z-20 mt-1 flex max-w-[min(100vw,28rem)] flex-wrap gap-1 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]">
          {(
            [
              ["ma20", "MA20"],
              ["ma50", "MA50"],
              ["ma200", "MA200"],
              ["ema21", "EMA21"],
              ["bb", "BB"],
              ["vwap", "VWAP"],
              ["rsi", "RSI"],
              ["macd", "MACD"],
              ["stoch", "Stoch"],
              ["atr", "ATR"],
              ["supertrend", "ST"],
              ["vp", "VP"],
            ] as [IndId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]",
                inds[id] ? "bg-surface-2 text-fg" : "bg-bg text-muted",
              )}
            >
              {label}
            </button>
          ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            aria-pressed={logScale}
            aria-label={logScale ? "Log scale on" : "Switch to log scale"}
            onClick={() => patchChartPrefs({ logScale: !logScale })}
            className={cn(
              "h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]",
              logScale ? "bg-surface-2 text-fg" : "bg-bg text-muted",
            )}
          >
            Log
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "ov" ? null : "ov"))}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]",
                openMenu === "ov" ? "bg-chart/15 text-fg" : "bg-bg text-muted",
              )}
            >
              Overlays
            </button>
            {openMenu === "ov" ? (
              <div className="absolute z-20 mt-1 flex flex-wrap gap-1 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]">
          <button
            type="button"
            onClick={() => patchChartPrefs({ volOn: !volOn })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", volOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            Volume
          </button>
          <button
            type="button"
            onClick={() => patchChartPrefs({ logScale: !logScale })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", logScale ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            Log scale
          </button>
          <button
            type="button"
            onClick={() => patchChartPrefs({ showLevels: !showLevels })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", showLevels ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            52-week high/low
          </button>
          <button
            type="button"
            onClick={() => patchChartPrefs({ sessionOn: !sessionOn })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", sessionOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            Session
          </button>
          <button
            type="button"
            onClick={() => patchChartPrefs({ structOn: !structOn })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", structOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            HH/HL
          </button>
          <button
            type="button"
            onClick={() => patchChartPrefs({ patternsOn: !patternsOn })}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", patternsOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            Patterns
          </button>
          <button
            type="button"
            title="Magnet to open / high / low / close"
            onClick={() => patchChartPrefs({ magnet: !magnet })}
            className={cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", magnet ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            <Magnet className="size-3.5" />
            Magnet
          </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMeasureOn((s) => !s);
              setMeasure(null);
              setPending(null);
              setTool("pan");
              setToolLock(false);
            }}
            className={cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", measureOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            Measure
          </button>
          <button
            type="button"
            onClick={() => {
              setView({ start: 0, count: 0 });
              setReplayOn(false);
              setPlaying(false);
              setReplayEnd(nAll);
            }}
            className="h-8 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              if (!replayOn) {
                setReplayOn(true);
                setReplayPick(true);
                setPlaying(false);
                setReplayEnd(nAll);
              } else {
                setReplayOn(false);
                setReplayPick(false);
                setPlaying(false);
                setReplayEnd(nAll);
              }
            }}
            className={cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", replayOn ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            <Crosshair className="size-3.5" />
            Replay
          </button>
          {replayOn ? (
            <button
              type="button"
              onClick={() => {
                if (playing) setPlaying(false);
                else {
                  if (replayEnd >= nAll) setReplayEnd(Math.max(8, Math.round(nAll * 0.25)));
                  setReplayPick(false);
                  setPlaying(true);
                }
              }}
              className={cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", playing ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {playing ? "Pause" : "Play"}
            </button>
          ) : null}
          <button
            type="button"
            title="Save chart"
            onClick={saveChart}
            className="inline-flex h-8 items-center rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]"
          >
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            title={fs ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => setFs((s) => !s)}
            className={cn("inline-flex h-8 items-center rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", fs ? "bg-surface-2 text-fg" : "bg-bg text-muted")}
          >
            {fs ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {tools.map((t) => {
          const Icon = t.icon;
          const on = tool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              title={t.id === "pan" ? "Pan" : on && toolLock ? "Locked — stays after each draw" : "Click once to draw · double-click to keep"}
              onClick={() => {
                setTool(t.id);
                setDraft(null);
                setToolLock(false);
                if (t.id !== "pan") setMeasureOn(false);
              }}
              onDoubleClick={() => {
                setTool(t.id);
                setToolLock(t.id !== "pan");
                setDraft(null);
                if (t.id !== "pan") setMeasureOn(false);
              }}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]",
                on ? "bg-surface-2 text-fg" : "bg-bg text-muted",
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
              {on && toolLock && t.id !== "pan" ? <span className="size-1.5 rounded-full bg-chart" /> : null}
            </button>
          );
        })}
        <button
          type="button"
          title="Undo last drawing"
          disabled={!shapes.length && !draft}
          onClick={() => {
            if (draft) setDraft(null);
            else commit(shapes.slice(0, -1));
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
        <button
          type="button"
          title="Clear drawings"
          disabled={!shapes.length}
          onClick={() => {
            commit([]);
            setDraft(null);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40"
        >
          <Trash2 className="size-3.5" />
          Clear
        </button>
        <button
          type="button"
          title="Delete selected drawing"
          disabled={!selectedId}
          onClick={() => {
            if (!selectedId) return;
            commit(shapes.filter((s) => s.id !== selectedId));
            setSelectedId(null);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
        {selectedId && shapes.find((s) => s.id === selectedId)?.kind === "hline" ? (
          <label className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2 text-[11px] text-muted shadow-[var(--shadow-border)]">
            Price
            <input
              key={selectedId + String(shapes.find((s) => s.id === selectedId)?.y0)}
              type="text"
              inputMode="decimal"
              defaultValue={nice(shapes.find((s) => s.id === selectedId)!.y0)}
              className="h-7 w-[4.5rem] bg-transparent font-mono text-[12px] text-fg tabular outline-none"
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (!Number.isFinite(v)) return;
                commit(shapes.map((s) => (s.id === selectedId ? { ...s, y0: v } : s)));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          </label>
        ) : null}
        <span className="text-[11px] text-subtle">
          {replayOn && (replayPick || !playing)
            ? "Click a candle to set the start, then Play."
            : tool === "pan"
              ? selectedId
                ? "Drag the drawing or a handle. Delete to remove."
                : "Click a drawing to edit · scroll to zoom · drag to pan"
              : toolLock
                ? "Stays selected. Esc or Pan to leave."
                : tool === "hline"
                  ? "Click once to pin a price"
                  : "Two clicks, then back to pan. Double-click the tool to keep it."}
        </span>
      </div>
      <div ref={read} className="mt-2 min-h-4 font-mono text-[11px] text-muted tabular">
        {last ? `${fmtT(last.t, chartIntra)}   O ${nice(last.o)}  H ${nice(last.h)}  L ${nice(last.l)}  C ${nice(last.c)}  Vol ${fmtVol(last.v)}` : ""}
      </div>
      {updating ? <div className="mt-1 text-[11px] text-muted">Updating candles…</div> : null}
      {measTxt ? <div className="mt-1 font-mono text-[11px] text-fg tabular">{measTxt}</div> : null}
      {compareLabel && compare.some((x) => x != null) ? (
        <div className="mt-1 text-[11px] text-warn">Overlaid vs {compareLabel} (both as % from the first print in view)</div>
      ) : null}

      <div
        ref={wrapRef}
        className="kosh-candle relative mt-2 w-full"
        style={{ height: vh }}
        data-testid="kosh-candle"
        data-lookback={lookback}
        data-interval={intervalId}
        data-points={String(src.length)}
      >
        <MemoPlot
          src={src}
          style={style}
          inds={inds}
          intra={chartIntra}
          logScale={logScale}
          compare={compare}
          measure={measure}
          vh={vh}
          volOn={volOn}
          levels={{ high52, low52, prev: prevClose }}
          showLevels={showLevels}
          sessionLevels={
            sessionOn
              ? (() => {
                  const or = chartIntra ? sessionOpeningRange(src, 15) : null;
                  const pd = chartIntra
                    ? priorDayRange(src)
                    : src.length >= 2
                      ? { high: src[src.length - 2].h, low: src[src.length - 2].l }
                      : null;
                  return {
                    orH: or?.high,
                    orL: or?.low,
                    pdh: pd?.high,
                    pdl: pd?.low,
                  };
                })()
              : undefined
          }
        />
        {L && (shapes.length || draft || structure?.marks.length || patternsOn) ? (
          <svg viewBox={`0 0 ${VW} ${vh}`} width="100%" height={vh} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-[3]">
            {structure?.marks.length ? (
              <MarksSvg marks={structure.marks} src={src} xOf={L.xOf} yOf={L.yOf} right={L.right} />
            ) : null}
            {patternsOn ? (
              <PatternSvg hits={patterns} src={src} xOf={L.xOf} yOf={L.yOf} intervalId={intervalId} />
            ) : null}
            {shapes.map((s) => (
              <ShapeSvg key={s.id} s={s} src={src} xOf={L.xOf} yOf={L.yOf} right={L.right} selected={s.id === selectedId} />
            ))}
            {draft ? <ShapeSvg s={draft} src={src} xOf={L.xOf} yOf={L.yOf} right={L.right} /> : null}
          </svg>
        ) : null}
        {replayOn && (replayPick || !playing) ? (
          <div className="pointer-events-none absolute top-2 left-1/2 z-[6] -translate-x-1/2 rounded-sm bg-bg-elevated px-2 py-1 text-[11px] text-fg shadow-[var(--shadow-border)]">
            Click the chart where replay should start
          </div>
        ) : null}
        <div ref={vLine} className="kosh-cross-v" />
        <div ref={hLine} className="kosh-cross-h" />
        <div ref={tag} className="kosh-px-tag" />
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 touch-none"
          style={{ cursor: tool === "pan" ? (selectedId ? "move" : "crosshair") : "cell" }}
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => {
            if (vLine.current) vLine.current.style.left = "-9px";
            if (hLine.current) hLine.current.style.top = "-9px";
          }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-subtle">
        <span className="font-mono tabular">
          {src.length} prints{count && count < nAll ? ` · window of ${nAll}` : ""}
        </span>
        {last ? <span className="font-mono tabular text-fg">{fmtPx(last.c)}</span> : null}
        {viewRet != null ? (
          <span className={cn("font-mono tabular", viewRet >= 0 ? "text-up" : "text-down")}>{fmtPct(viewRet)} in view</span>
        ) : null}
        {atrLast ? <span className="font-mono tabular">ATR14 {nice(atrLast)}</span> : null}
        <span>IST</span>
        {fs ? <span>Esc to exit</span> : null}
        {shapes.length ? <span>{shapes.length} drawing{shapes.length === 1 ? "" : "s"} saved</span> : null}
        {selectedId ? <span>Selected · Delete to remove</span> : null}
        {structure?.clusters.length ? (
          <span className="flex flex-wrap gap-1.5">
            {structure.clusters.slice(0, 4).map((c) => (
              <span key={c.price} className="rounded-sm bg-bg px-1.5 py-0.5 font-mono tabular shadow-[var(--shadow-border)]">
                {c.price >= (last?.c || 0) ? "R" : "S"} {nice(c.price)}
              </span>
            ))}
          </span>
        ) : null}
        <span className="font-mono tabular">{intervalId}</span>
      </div>
    </div>
  );
  if (fs && typeof document !== "undefined") return createPortal(card, document.body);
  return card;
}

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

export function IntervalBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return <Seg value={value} onChange={onChange} options={INTERVALS.map((x) => ({ id: x.id, label: x.label }))} />;
}

export function LookbackBar({
  value,
  onChange,
}: {
  interval?: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Seg
      value={value}
      onChange={onChange}
      options={LOOKBACKS.map((x) => ({ id: x.id, label: x.label }))}
    />
  );
}

export function RangeBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Seg
      value={value}
      onChange={onChange}
      options={LOOKBACKS.map((x) => ({ id: x.id, label: x.label }))}
    />
  );
}

export const RANGE_QUERY: Record<string, { range: string; interval: string; intra: boolean }> = {
  "1D": { range: "1d", interval: "5m", intra: true },
  "5D": { range: "5d", interval: "15m", intra: true },
  "1H": { range: "1mo", interval: "60m", intra: true },
  "1M": { range: "1mo", interval: "1d", intra: false },
  "3M": { range: "3mo", interval: "1d", intra: false },
  "6M": { range: "6mo", interval: "1d", intra: false },
  "1Y": { range: "1y", interval: "1d", intra: false },
  "1W": { range: "2y", interval: "1wk", intra: false },
  "5Y": { range: "5y", interval: "1wk", intra: false },
  MAX: { range: "max", interval: "1wk", intra: false },
};
