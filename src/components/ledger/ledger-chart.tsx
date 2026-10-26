import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  PriceScaleMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type SeriesType,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { atr, bollinger, ema, macd, rsi, sma } from "@/lib/kosh/ohlc";
import { sliceLookback } from "@/lib/kosh/ohlc";
import type { OhlcBar } from "@/lib/kosh/types";
import { FIB_RATIOS, fibPrice, hitDraw, rayEnd, type HitPart } from "@/lib/kosh/ledger-draw";
import type { DrawKind, LedgerDraw, LedgerInd } from "@/lib/kosh/ledger-layout";
import type { LedgerChartType, LedgerTool } from "@/lib/kosh/ledger-spec";
import { ledgerChrome, type LedgerTheme } from "@/lib/kosh/ledger-chrome";
import {
  fmtBarTime,
  fmtShares,
  hasVolume,
  indicatorLegend,
  istBusinessDay,
  sessionVwap,
  timeToUnix,
} from "@/lib/kosh/ledger-bars";

type Point = { t: number; time: Time; bar: OhlcBar };
type DataPoint = { t: number; p: number };
type Phase = "start" | "move" | "commit" | "cancel";

function chartTime(t: number, intra: boolean): UTCTimestamp | { year: number; month: number; day: number } {
  if (intra) return t as UTCTimestamp;
  const day = istBusinessDay(t);
  return day;
}

function toPoints(bars: OhlcBar[], intra: boolean): Point[] {
  const out: Point[] = [];
  const seen = new Set<string>();
  for (const bar of bars) {
    const time = chartTime(bar.t, intra);
    const key = typeof time === "number" ? String(time) : `${time.year}-${time.month}-${time.day}`;
    const row = { t: bar.t, time, bar };
    if (seen.has(key)) out[out.length - 1] = row;
    else {
      seen.add(key);
      out.push(row);
    }
  }
  return out;
}

function applyLookback(chart: IChartApi, bars: OhlcBar[], range: string) {
  if (!bars.length) return;
  if (range === "All") {
    chart.timeScale().fitContent();
    return;
  }
  const sliced = sliceLookback(bars, range);
  const from = Math.max(0, bars.length - sliced.length);
  chart.timeScale().setVisibleLogicalRange({ from: from - 0.5, to: bars.length + 1.5 });
}

function snapTime(bars: OhlcBar[], t: number): number {
  if (!bars.length) return t;
  let lo = 0;
  let hi = bars.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (bars[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const next = bars[Math.min(bars.length - 1, lo)];
  const prev = bars[Math.max(0, lo - 1)];
  return Math.abs(prev.t - t) <= Math.abs(next.t - t) ? prev.t : next.t;
}

function layoutPanes(chart: IChartApi, host: HTMLElement) {
  const panes = chart.panes();
  if (panes.length <= 1) return;
  const total = host.clientHeight || 1;
  const sub = Math.min(108, Math.max(72, Math.floor(total * 0.16)));
  panes[0].setHeight(Math.max(140, total - sub * (panes.length - 1)));
  for (let i = 1; i < panes.length; i++) panes[i].setHeight(sub);
}

function lineData(points: Point[], values: (number | null)[]) {
  const out: { time: Time; value: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const value = values[i];
    if (value == null || !Number.isFinite(value)) continue;
    out.push({ time: points[i].time, value });
  }
  return out;
}

function shiftDraw(origin: LedgerDraw, part: HitPart, start: DataPoint, now: DataPoint): LedgerDraw {
  const dt = now.t - start.t;
  const dp = now.p - start.p;
  if (origin.kind === "hline") return { ...origin, p0: origin.p0 + dp };
  if (origin.kind === "vline") return { ...origin, t0: origin.t0 + dt };
  if (part === "a") return { ...origin, t0: origin.t0 + dt, p0: origin.p0 + dp };
  if (part === "b" && origin.t1 != null && origin.p1 != null) return { ...origin, t1: origin.t1 + dt, p1: origin.p1 + dp };
  return {
    ...origin,
    t0: origin.t0 + dt,
    p0: origin.p0 + dp,
    ...(origin.t1 != null ? { t1: origin.t1 + dt } : {}),
    ...(origin.p1 != null ? { p1: origin.p1 + dp } : {}),
  };
}

export function LedgerChart({
  bars,
  intra,
  chartType,
  logScale,
  range,
  viewNonce,
  indicators,
  drawings,
  drawingsHidden,
  tool,
  selectedId,
  onSelect,
  onDrawings,
  onContext,
  theme,
}: {
  bars: OhlcBar[];
  intra: boolean;
  chartType: LedgerChartType;
  logScale: boolean;
  range: string;
  viewNonce: number;
  indicators: LedgerInd[];
  drawings: LedgerDraw[];
  drawingsHidden: boolean;
  tool: LedgerTool;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrawings: (next: LedgerDraw[], phase: Phase) => void;
  onContext: (info: { x: number; y: number; price: number | null; time: number | null }) => void;
  theme: LedgerTheme;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const barsRef = useRef(bars);
  const drawingsRef = useRef(drawings);
  const toolRef = useRef(tool);
  const hiddenRef = useRef(drawingsHidden);
  const intraRef = useRef(intra);
  barsRef.current = bars;
  drawingsRef.current = drawings;
  toolRef.current = tool;
  hiddenRef.current = drawingsHidden;
  intraRef.current = intra;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const chrome = ledgerChrome(theme);
  const [alive, setAlive] = useState(false);
  const [frame, setFrame] = useState(0);
  const [hover, setHover] = useState<{ t: number; o: number; h: number; l: number; c: number; v: number } | null>(null);
  const [draft, setDraft] = useState<LedgerDraw | null>(null);
  const [textAt, setTextAt] = useState<{ t: number; p: number; x: number; y: number } | null>(null);
  const dragRef = useRef<
    | { mode: "create"; kind: DrawKind; start: DataPoint; now: DataPoint; px: number }
    | { mode: "move"; part: HitPart; origin: LedgerDraw; start: DataPoint }
    | null
  >(null);
  const applied = useRef(-1);
  const points = useMemo(() => toPoints(bars, intra), [bars, intra]);
  const legend = useMemo(() => indicatorLegend(bars, indicators, intra), [bars, indicators, intra]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const paint = ledgerChrome(themeRef.current);
    const chart = createChart(host, {
      width: Math.max(10, host.clientWidth),
      height: Math.max(10, host.clientHeight),
      autoSize: false,
      layout: {
        background: { type: ColorType.Solid, color: paint.background },
        textColor: paint.text,
        fontSize: 11,
        panes: { separatorColor: paint.border, enableResize: true },
      },
      grid: { vertLines: { color: paint.grid }, horzLines: { color: paint.grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: paint.border },
      timeScale: { borderColor: paint.border, timeVisible: true, secondsVisible: false, rightOffset: 4 },
      handleScroll: { vertTouchDrag: false },
      localization: {
        locale: "en-IN",
        priceFormatter: (price: number) =>
          price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        timeFormatter: (time: Time) => {
          const unix = timeToUnix(time);
          return unix == null ? "" : fmtBarTime(unix, intraRef.current);
        },
      },
    });
    chartRef.current = chart;
    let frame = 0;
    const bump = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setFrame((n) => n + 1);
      });
    };
    const onMove = (param: MouseEventParams<Time>) => {
      const time = param.time;
      const unix = timeToUnix(time as number | { year: number; month: number; day: number } | undefined);
      if (unix == null || !param.point) {
        setHover(null);
        return;
      }
      const snapped = snapTime(barsRef.current, unix);
      const bar = barsRef.current.find((row) => row.t === snapped);
      if (!bar) {
        setHover(null);
        return;
      }
      setHover({ t: bar.t, o: bar.o, h: bar.h, l: bar.l, c: bar.c, v: bar.v });
    };
    chart.subscribeCrosshairMove(onMove);
    chart.timeScale().subscribeVisibleLogicalRangeChange(bump);
    const ro = new ResizeObserver(() => {
      chart.resize(Math.max(10, host.clientWidth), Math.max(10, host.clientHeight));
      layoutPanes(chart, host);
      bump();
    });
    ro.observe(host);
    setAlive(true);
    return () => {
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
      chart.unsubscribeCrosshairMove(onMove);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(bump);
      chart.remove();
      chartRef.current = null;
      priceRef.current = null;
      setAlive(false);
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !alive) return;
    const nav = tool === "cursor" || tool === "crosshair";
    chart.applyOptions({
      crosshair: { mode: tool === "crosshair" ? CrosshairMode.Magnet : CrosshairMode.Normal },
      handleScroll: { mouseWheel: true, pressedMouseMove: nav, horzTouchDrag: nav, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: nav, mouseWheel: true, pinch: true },
    });
  }, [tool, alive]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !alive) return;
    const paint = ledgerChrome(theme);
    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: paint.background },
        textColor: paint.text,
        panes: { separatorColor: paint.border, enableResize: true },
      },
      grid: { vertLines: { color: paint.grid }, horzLines: { color: paint.grid } },
      rightPriceScale: { borderColor: paint.border },
      timeScale: { borderColor: paint.border },
    });
  }, [theme, alive]);

  useEffect(() => {
    const chart = chartRef.current;
    const host = hostRef.current;
    if (!chart || !host || !alive) return;
    const logical = applied.current === viewNonce ? chart.timeScale().getVisibleLogicalRange() : null;
    const existing = chart.panes().flatMap((pane) => pane.getSeries());
    for (const series of existing) chart.removeSeries(series);
    priceRef.current = null;
    if (!points.length) return;
    const paint = ledgerChrome(theme);
    const volUp = theme === "light" ? "rgba(15,138,82,0.55)" : "rgba(32,185,133,0.55)";
    const volDown = theme === "light" ? "rgba(198,55,55,0.5)" : "rgba(240,100,112,0.55)";
    const scale = {
      mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
      borderColor: paint.border,
    };
    let price: ISeriesApi<SeriesType>;
    if (chartType === "bar") {
      const series = chart.addSeries(BarSeries, { upColor: paint.up, downColor: paint.down, thinBars: false });
      series.setData(points.map((p) => ({ time: p.time, open: p.bar.o, high: p.bar.h, low: p.bar.l, close: p.bar.c })));
      price = series;
    } else if (chartType === "line") {
      const series = chart.addSeries(LineSeries, { color: paint.up, lineWidth: 2, priceLineVisible: true });
      series.setData(points.map((p) => ({ time: p.time, value: p.bar.c })));
      price = series;
    } else if (chartType === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: paint.up,
        topColor: theme === "light" ? "rgba(15,138,82,0.18)" : "rgba(32,185,133,0.28)",
        bottomColor: theme === "light" ? "rgba(15,138,82,0.02)" : "rgba(32,185,133,0.02)",
        lineWidth: 2,
      });
      series.setData(points.map((p) => ({ time: p.time, value: p.bar.c })));
      price = series;
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: paint.up,
        downColor: paint.down,
        borderUpColor: paint.up,
        borderDownColor: paint.down,
        wickUpColor: paint.up,
        wickDownColor: paint.down,
      });
      series.setData(points.map((p) => ({ time: p.time, open: p.bar.o, high: p.bar.h, low: p.bar.l, close: p.bar.c })));
      price = series;
    }
    price.priceScale().applyOptions(scale);
    priceRef.current = price;
    const closes = points.map((p) => p.bar.c);
    let pane = 1;
    const visible = indicators.filter((item) => !item.hidden);
    if (visible.some((item) => item.kind === "volume") && hasVolume(points.map((p) => p.bar))) {
      const volume = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "right" }, pane);
      pane += 1;
      volume.setData(
        points.map((p) => ({
          time: p.time,
          value: p.bar.v,
          color: p.bar.c >= p.bar.o ? volUp : volDown,
        })),
      );
    }
    for (const ind of visible) {
      if (ind.kind === "sma" || ind.kind === "ema") {
        const values = ind.kind === "sma" ? sma(closes, ind.period || 20) : ema(closes, ind.period || 20);
        const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
        series.setData(lineData(points, values));
      } else if (ind.kind === "bb") {
        const band = bollinger(closes, ind.period || 20, ind.k ?? 2);
        for (const [key, width] of [
          [band.mid, 1],
          [band.upper, 1],
          [band.lower, 1],
        ] as const) {
          const series = chart.addSeries(LineSeries, {
            color: ind.color,
            lineWidth: width,
            lineStyle: key === band.mid ? LineStyle.Solid : LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          series.setData(lineData(points, key));
        }
      } else if (ind.kind === "vwap" && intra) {
        const series = chart.addSeries(LineSeries, {
          color: ind.color,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        series.setData(lineData(points, sessionVwap(points.map((p) => p.bar))));
      } else if (ind.kind === "rsi" || ind.kind === "macd" || ind.kind === "atr") {
        const index = pane;
        pane += 1;
        if (ind.kind === "rsi") {
          const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, priceScaleId: "right" }, index);
          series.setData(lineData(points, rsi(closes, ind.period || 14)));
          series.createPriceLine({ price: 70, color: paint.border, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: "" });
          series.createPriceLine({ price: 30, color: paint.border, lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: "" });
        } else if (ind.kind === "atr") {
          const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, priceScaleId: "right" }, index);
          series.setData(lineData(points, atr(points.map((p) => p.bar), ind.period || 14)));
        } else {
          const pack = macd(closes);
          const hist = chart.addSeries(HistogramSeries, { priceScaleId: "right" }, index);
          hist.setData(
            points.flatMap((p, i) => {
              const value = pack.hist[i];
              if (value == null || !Number.isFinite(value)) return [];
              return [{ time: p.time, value, color: value >= 0 ? volUp : volDown }];
            }),
          );
          const line = chart.addSeries(LineSeries, { color: "#4c8dff", lineWidth: 2, priceLineVisible: false, lastValueVisible: false, priceScaleId: "right" }, index);
          const signal = chart.addSeries(LineSeries, { color: "#e6b85c", lineWidth: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: "right" }, index);
          line.setData(lineData(points, pack.line));
          signal.setData(lineData(points, pack.signal));
        }
      }
    }
    layoutPanes(chart, host);
    if (points.length && applied.current !== viewNonce) {
      applyLookback(chart, points.map((p) => p.bar), intra ? "All" : range);
      applied.current = viewNonce;
    } else if (logical) chart.timeScale().setVisibleLogicalRange(logical);
    setFrame((n) => n + 1);
  }, [points, chartType, indicators, logScale, intra, range, viewNonce, alive, theme]);

  function paneBox() {
    const chart = chartRef.current;
    const host = hostRef.current;
    const pane = chart?.panes()[0]?.getHTMLElement();
    if (!host || !pane) return { top: 0, left: 0, width: host?.clientWidth || 0, height: host?.clientHeight || 0 };
    const paneRect = pane.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    return {
      top: paneRect.top - hostRect.top,
      left: paneRect.left - hostRect.left,
      width: paneRect.width,
      height: paneRect.height,
    };
  }

  function project(t: number, p: number) {
    const chart = chartRef.current;
    const series = priceRef.current;
    if (!chart || !series) return null;
    const box = paneBox();
    const x = chart.timeScale().timeToCoordinate(chartTime(t, intra));
    const y = series.priceToCoordinate(p);
    if (x == null || y == null) return null;
    return { x: x + box.left, y: y + box.top };
  }

  function unproject(x: number, y: number): DataPoint | null {
    const chart = chartRef.current;
    const series = priceRef.current;
    if (!chart || !series) return null;
    const box = paneBox();
    const localX = x - box.left;
    const localY = y - box.top;
    if (localX < 0 || localX > chart.timeScale().width() || localY < 0 || localY > box.height) return null;
    const time = chart.timeScale().coordinateToTime(localX);
    const price = series.coordinateToPrice(localY);
    const unix = timeToUnix(time as number | { year: number; month: number; day: number } | null);
    if (unix == null || price == null || !Number.isFinite(price)) return null;
    return { t: snapTime(barsRef.current, unix), p: price };
  }

  function eventPoint(e: React.PointerEvent | React.MouseEvent): { x: number; y: number; data: DataPoint } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const data = unproject(x, y);
    if (!data) return null;
    return { x, y, data };
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    const hitPoint = eventPoint(e);
    if (!hitPoint) return;
    const current = toolRef.current;
    if (current === "cursor") {
      if (hiddenRef.current) {
        onSelect(null);
        return;
      }
      const width = svgRef.current?.clientWidth || 0;
      const height = svgRef.current?.clientHeight || 0;
      let found: { draw: LedgerDraw; part: HitPart } | null = null;
      for (let i = drawingsRef.current.length - 1; i >= 0; i--) {
        const draw = drawingsRef.current[i];
        const part = hitDraw(draw, hitPoint.x, hitPoint.y, project, width, height);
        if (part) {
          found = { draw, part };
          break;
        }
      }
      if (!found) {
        onSelect(null);
        return;
      }
      onSelect(found.draw.id);
      if (found.draw.locked) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { mode: "move", part: found.part, origin: found.draw, start: hitPoint.data };
      onDrawings(drawingsRef.current, "start");
      return;
    }
    if (current === "crosshair") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mode: "create", kind: current, start: hitPoint.data, now: hitPoint.data, px: 0 };
    onDrawings(drawingsRef.current, "start");
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const hitPoint = eventPoint(e);
    if (!hitPoint) return;
    if (drag.mode === "create") {
      drag.now = hitPoint.data;
      drag.px = Math.hypot(hitPoint.x - (project(drag.start.t, drag.start.p)?.x || hitPoint.x), hitPoint.y - (project(drag.start.t, drag.start.p)?.y || hitPoint.y));
      if (drag.kind !== "text") setDraft(draftFrom(drag.kind, drag.start, drag.now));
      return;
    }
    const nextDraw = shiftDraw(drag.origin, drag.part, drag.start, hitPoint.data);
    onDrawings(
      drawingsRef.current.map((row) => (row.id === nextDraw.id ? nextDraw : row)),
      "move",
    );
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.mode === "move") {
      onDrawings(drawingsRef.current, "commit");
      return;
    }
    const hitPoint = eventPoint(e);
    const now = hitPoint?.data || drag.now;
    if (drag.kind === "text") {
      const at = project(now.t, now.p);
      setTextAt(at ? { t: now.t, p: now.p, x: at.x, y: at.y } : null);
      onDrawings(drawingsRef.current, "cancel");
      setDraft(null);
      return;
    }
    const min = drag.kind === "hline" || drag.kind === "vline" ? 0 : 4;
    if (drag.px < min && drag.kind !== "hline" && drag.kind !== "vline") {
      onDrawings(drawingsRef.current, "cancel");
      setDraft(null);
      return;
    }
    const row = { ...draftFrom(drag.kind, drag.start, now), id: crypto.randomUUID() };
    onDrawings([...drawingsRef.current.filter((item) => item.id !== "draft"), row], "commit");
    onSelect(row.id);
    setDraft(null);
  }

  const box = paneBox();
  const visibleDraws = drawingsHidden ? [] : drawings.filter((row) => !row.hidden);
  const painted = draft && !drawingsHidden ? [...visibleDraws, draft] : visibleDraws;
  const hoverIdx = hover ? bars.findIndex((bar) => bar.t === hover.t) : -1;
  const readout = hover || (bars.length ? { ...bars[bars.length - 1], t: bars[bars.length - 1].t } : null);

  return (
    <div className="lt-chart" data-ledger-chart data-bars={bars.length} data-chart-bg={chrome.background} style={{ background: chrome.background }}>
      <div ref={hostRef} className="lt-chart-host" />
      <svg
        ref={svgRef}
        className="lt-draw-layer"
        data-frame={frame}
        style={{ pointerEvents: "none" }}
        width="100%"
        height="100%"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          const hitPoint = eventPoint(e);
          onContext({ x: e.clientX, y: e.clientY, price: hitPoint?.data.p ?? null, time: hitPoint?.data.t ?? null });
        }}
      >
        {tool !== "cursor" && tool !== "crosshair" ? <rect x="0" y="0" width="100%" height="100%" fill="transparent" pointerEvents="all" /> : null}
        {painted.map((draw) => (
          <DrawShape
            key={draw.id}
            draw={draw}
            project={project}
            width={Math.max(box.width, 1)}
            height={alive ? box.height : 0}
            selected={draw.id === selectedId}
            activeTool={tool}
            surface={chrome.background}
            ink={chrome.text}
          />
        ))}
      </svg>
      {textAt ? (
        <form
          className="lt-text"
          style={{ left: textAt.x, top: textAt.y }}
          onSubmit={(e) => {
            e.preventDefault();
            const text = new FormData(e.currentTarget).get("note");
            const note = String(text || "").trim().slice(0, 80);
            if (note) {
              onDrawings(
                [
                  ...drawingsRef.current,
                  {
                    id: crypto.randomUUID(),
                    kind: "text",
                    t0: textAt.t,
                    p0: textAt.p,
                    text: note,
                    color: chrome.text,
                    locked: false,
                    hidden: false,
                  },
                ],
                "commit",
              );
            } else onDrawings(drawingsRef.current, "cancel");
            setTextAt(null);
          }}
        >
          <input name="note" aria-label="Annotation text" autoFocus placeholder="Note" maxLength={80} />
        </form>
      ) : null}
      <div className="lt-readout">
        {readout ? (
          <>
            <div>
              {fmtBarTime(readout.t, intra)} · O {px(readout.o)} H {px(readout.h)} L {px(readout.l)} C {px(readout.c)}
              {readout.v > 0 ? ` · Vol ${fmtShares(readout.v)}` : ""}
            </div>
            <div>
              {legend.map((row) => (
                <span key={row.id} style={{ color: row.color, marginRight: 10 }}>
                  {row.label} {hoverIdx >= 0 ? valueAt(bars, indicators.find((item) => item.id === row.id), hoverIdx, intra) : row.value}
                </span>
              ))}
            </div>
          </>
        ) : (
          <span>Crosshair</span>
        )}
      </div>
    </div>
  );
}

function valueAt(bars: OhlcBar[], ind: LedgerInd | undefined, index: number, intra: boolean): string {
  if (!ind) return "—";
  const closes = bars.map((bar) => bar.c);
  let value: number | null = null;
  if (ind.kind === "sma") value = sma(closes, ind.period || 20)[index] ?? null;
  else if (ind.kind === "ema") value = ema(closes, ind.period || 20)[index] ?? null;
  else if (ind.kind === "bb") value = bollinger(closes, ind.period || 20, ind.k ?? 2).mid[index] ?? null;
  else if (ind.kind === "vwap") value = intra ? (sessionVwap(bars)[index] ?? null) : null;
  else if (ind.kind === "rsi") value = rsi(closes, ind.period || 14)[index] ?? null;
  else if (ind.kind === "macd") value = macd(closes).line[index] ?? null;
  else if (ind.kind === "atr") value = atr(bars, ind.period || 14)[index] ?? null;
  else if (ind.kind === "volume") return fmtShares(bars[index]?.v);
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function px(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function draftFrom(kind: DrawKind, start: DataPoint, now: DataPoint): LedgerDraw {
  return {
    id: "draft",
    kind,
    t0: kind === "hline" ? start.t : start.t,
    p0: kind === "vline" ? start.p : kind === "hline" ? now.p : start.p,
    ...(kind === "hline" || kind === "vline" ? {} : { t1: now.t, p1: now.p }),
    color: "#4c8dff",
    locked: false,
    hidden: false,
  };
}

function DrawShape({
  draw,
  project,
  width,
  height,
  selected,
  activeTool,
  surface,
  ink,
}: {
  draw: LedgerDraw;
  project: (t: number, p: number) => { x: number; y: number } | null;
  width: number;
  height: number;
  selected: boolean;
  activeTool: LedgerTool;
  surface: string;
  ink: string;
}) {
  const a = project(draw.t0, draw.p0);
  if (!a || width < 2) return null;
  const b = draw.t1 != null && draw.p1 != null ? project(draw.t1, draw.p1) : null;
  const events = activeTool === "cursor" ? "stroke" : "none";
  const common = { stroke: draw.color, fill: "none", strokeWidth: selected ? 2 : 1.4, pointerEvents: events as "stroke" };
  if (draw.kind === "hline") {
    return (
      <g>
        <line x1={0} y1={a.y} x2={width} y2={a.y} {...common} />
        {selected ? <Handle x={8} y={a.y} fill={surface} /> : null}
      </g>
    );
  }
  if (draw.kind === "vline") {
    return (
      <g>
        <line x1={a.x} y1={0} x2={a.x} y2={height || 800} {...common} />
        {selected ? <Handle x={a.x} y={12} fill={surface} /> : null}
      </g>
    );
  }
  if (draw.kind === "text") {
    return (
      <g pointerEvents={activeTool === "cursor" ? "all" : "none"}>
        <text x={a.x + 4} y={a.y} fill={draw.color} fontSize="12">
          {draw.text || "Note"}
        </text>
      </g>
    );
  }
  if (!b) return null;
  if (draw.kind === "rect") {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return (
      <g>
        <rect x={x} y={y} width={Math.abs(b.x - a.x)} height={Math.abs(b.y - a.y)} {...common} fill={draw.color} fillOpacity={0.12} pointerEvents={activeTool === "cursor" ? "all" : "none"} />
        {selected ? (
          <>
            <Handle x={a.x} y={a.y} fill={surface} />
            <Handle x={b.x} y={b.y} fill={surface} />
          </>
        ) : null}
      </g>
    );
  }
  if (draw.kind === "fib" && draw.p1 != null) {
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    return (
      <g>
        {FIB_RATIOS.map((ratio) => {
          const y = project(draw.t0, fibPrice(draw.p0, draw.p1 as number, ratio))?.y;
          if (y == null) return null;
          return (
            <g key={ratio}>
              <line x1={left} y1={y} x2={right} y2={y} stroke={draw.color} strokeWidth={1} pointerEvents={events} />
              <text x={right + 4} y={y + 3} fill={draw.color} fontSize="10">
                {ratio.toFixed(3)}
              </text>
            </g>
          );
        })}
        {selected ? (
          <>
            <Handle x={a.x} y={a.y} fill={surface} />
            <Handle x={b.x} y={b.y} fill={surface} />
          </>
        ) : null}
      </g>
    );
  }
  const end = draw.kind === "ray" ? rayEnd(a.x, a.y, b.x, b.y, width, height || 800) : b;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const measure =
    draw.kind === "measure"
      ? `${(draw.p1! - draw.p0 >= 0 ? "+" : "") + (draw.p1! - draw.p0).toFixed(2)} (${draw.p0 ? (((draw.p1! - draw.p0) / draw.p0) * 100).toFixed(2) : "—"}%)`
      : "";
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} {...common} />
      {measure ? (
        <text x={midX} y={midY - 6} fill={ink} fontSize="11">
          {measure}
        </text>
      ) : null}
      {selected ? (
        <>
          <Handle x={a.x} y={a.y} fill={surface} />
          <Handle x={b.x} y={b.y} fill={surface} />
        </>
      ) : null}
    </g>
  );
}

function Handle({ x, y, fill }: { x: number; y: number; fill: string }) {
  return <rect x={x - 4} y={y - 4} width={8} height={8} fill={fill} stroke="#4c8dff" pointerEvents="all" />;
}
