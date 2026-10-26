import { useEffect, useId, useMemo, useRef, useState } from "react";
import { panDomain, plotDomain, quadrantLabel, zoomDomain, type PlotDomain, type RrgReading } from "@/lib/kosh/rrg-frame";
import { PLOT, placeLabels, quadrantAnchors, trailWidth, type StrokePref } from "@/lib/kosh/rrg-plot";

const COLORS = ["#3dcf8e", "#7aa2ff", "#e0a06a", "#ef6e6e", "#d2a8ff", "#7ec8c3", "#c4b08a", "#9ecbff"];
const VB_W = 800;
const VB_H = 560;
const LEFT = PLOT.left;
const TOP = PLOT.top;
const PLOT_W = PLOT.width;
const PLOT_H = PLOT.height;

type Hover = { symbol: string; name: string; date: string; rsRatio: number; rsMomentum: number; quadrant: string; dx: number | null; dy: number | null };

export function RrgChart({
  readings,
  height,
  selected,
  hidden,
  showLabels = true,
  arrows = true,
  locked = false,
  stroke = "standard",
  onSelect,
}: {
  readings: RrgReading[];
  height: number | string;
  selected?: string | null;
  hidden?: string[];
  showLabels?: boolean;
  arrows?: boolean;
  locked?: boolean;
  stroke?: StrokePref;
  onSelect?: (symbol: string) => void;
}) {
  const hiddenSet = useMemo(() => new Set(hidden || []), [hidden]);
  const drawn = readings.filter((row) => row.tail.length > 0 && !hiddenSet.has(row.symbol));
  const auto = useMemo(() => plotDomain(drawn.flatMap((row) => row.tail.map((point) => ({ x: point.rsRatio, y: point.rsMomentum })))), [readings, hidden]);
  const [domain, setDomain] = useState<PlotDomain | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const drag = useRef<{ x: number; y: number; domain: PlotDomain; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const view = domain || auto;
  const clipId = useId().replace(/:/g, "");

  useEffect(() => {
    const node = svgRef.current;
    if (!node || locked) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = dataAt(node, event.clientX, event.clientY, view);
      if (!point) return;
      setDomain(zoomDomain(view, point.x, point.y, event.deltaY > 0 ? 1.12 : 0.88));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [view, locked]);

  const sx = (x: number) => LEFT + ((x - view.x0) / (view.x1 - view.x0)) * PLOT_W;
  const sy = (y: number) => TOP + (1 - (y - view.y0) / (view.y1 - view.y0)) * PLOT_H;
  const x100 = sx(100);
  const y100 = sy(100);
  const xTicks = ticks(view.x0, view.x1);
  const yTicks = ticks(view.y0, view.y1);

  return (
    <div className="rounded-sm border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="text-[12px] text-muted">RS-Ratio across · RS-Momentum up</p>
        <div className="flex gap-3 text-[12px]">
          <button type="button" className="text-muted hover:text-fg" onClick={() => setDomain(null)}>Fit</button>
          <button type="button" className="text-muted hover:text-fg" onClick={() => setDomain(centerOnReference(auto))}>Center 100</button>
          <button type="button" className="text-muted hover:text-fg" onClick={() => setDomain(null)}>Reset</button>
        </div>
      </div>
      {drawn.length === 0 ? (
        <p className="px-3 pb-4 text-[13px] text-muted">No selected series has a point on this date.</p>
      ) : (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label="Relative rotation chart"
          className="w-full touch-none"
          style={{ height }}
          onPointerDown={(event) => {
            if (locked) return;
            (event.currentTarget as SVGSVGElement).setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, domain: view, moved: false };
          }}
          onPointerMove={(event) => {
            const node = event.currentTarget;
            if (drag.current && !locked) {
              const dist = Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y);
              if (dist > 4) drag.current.moved = true;
              if (drag.current.moved) {
                const rect = node.getBoundingClientRect();
                const dx = ((event.clientX - drag.current.x) / rect.width) * VB_W;
                const dy = ((event.clientY - drag.current.y) / rect.height) * VB_H;
                const spanX = drag.current.domain.x1 - drag.current.domain.x0;
                const spanY = drag.current.domain.y1 - drag.current.domain.y0;
                setDomain(panDomain(drag.current.domain, (-dx / PLOT_W) * spanX, (dy / PLOT_H) * spanY));
              }
              return;
            }
            setHover(nearest(drawn, dataAt(node, event.clientX, event.clientY, view), view));
          }}
          onPointerUp={(event) => {
            const wasDrag = drag.current?.moved;
            drag.current = null;
            if (wasDrag || !onSelect) return;
            const hit = nearest(drawn, dataAt(event.currentTarget, event.clientX, event.clientY, view), view);
            if (hit) onSelect(hit.symbol);
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={LEFT} y={TOP} width={PLOT_W} height={PLOT_H} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
          <rect x={LEFT} y={TOP} width={PLOT_W} height={PLOT_H} fill="transparent" />
          <rect x={Math.max(LEFT, x100)} y={TOP} width={Math.max(0, LEFT + PLOT_W - Math.max(LEFT, x100))} height={Math.max(0, Math.min(TOP + PLOT_H, y100) - TOP)} fill="var(--k-up)" opacity="0.08" />
          <rect x={Math.max(LEFT, x100)} y={Math.max(TOP, y100)} width={Math.max(0, LEFT + PLOT_W - Math.max(LEFT, x100))} height={Math.max(0, TOP + PLOT_H - Math.max(TOP, y100))} fill="var(--k-warn)" opacity="0.12" />
          <rect x={LEFT} y={Math.max(TOP, y100)} width={Math.max(0, Math.min(LEFT + PLOT_W, x100) - LEFT)} height={Math.max(0, TOP + PLOT_H - Math.max(TOP, y100))} fill="var(--k-down)" opacity="0.08" />
          <rect x={LEFT} y={TOP} width={Math.max(0, Math.min(LEFT + PLOT_W, x100) - LEFT)} height={Math.max(0, Math.min(TOP + PLOT_H, y100) - TOP)} fill="var(--k-chart)" opacity="0.1" />
          {quadrantAnchors(x100, y100).map((label) => (
            <text key={label.name} x={label.x} y={label.y} textAnchor={label.anchor} fill={label.name === "LEADING" ? "var(--k-up)" : label.name === "WEAKENING" ? "var(--k-warn)" : label.name === "LAGGING" ? "var(--k-down)" : "var(--k-chart)"} fontSize="11" fontWeight="600" opacity="0.72" letterSpacing="1.4">{label.name}</text>
          ))}
          <line x1={x100} x2={x100} y1={TOP} y2={TOP + PLOT_H} stroke="var(--k-border-strong)" />
          <line x1={LEFT} x2={LEFT + PLOT_W} y1={y100} y2={y100} stroke="var(--k-border-strong)" />
          {drawn.map((row, index) => {
            const color = COLORS[index % COLORS.length] ?? "#7aa2ff";
            const hot = selected === row.symbol;
            const last = row.tail[row.tail.length - 1];
            const prev = row.tail[row.tail.length - 2];
            if (!last) return null;
            const width = trailWidth(stroke, hot);
            return (
              <g key={row.symbol} opacity={selected && !hot ? 0.45 : 1}>
                {row.tail.slice(1).map((point, pointIndex) => {
                  const from = row.tail[pointIndex];
                  if (!from) return null;
                  const fade = 0.25 + (0.75 * (pointIndex + 1)) / Math.max(1, row.tail.length - 1);
                  return (
                    <line
                      key={point.date}
                      x1={sx(from.rsRatio)}
                      y1={sy(from.rsMomentum)}
                      x2={sx(point.rsRatio)}
                      y2={sy(point.rsMomentum)}
                      stroke={color}
                      strokeWidth={width}
                      strokeOpacity={fade}
                    />
                  );
                })}
                {arrows && prev ? <polygon points={arrow(sx(prev.rsRatio), sy(prev.rsMomentum), sx(last.rsRatio), sy(last.rsMomentum))} fill={color} /> : null}
                <circle cx={sx(last.rsRatio)} cy={sy(last.rsMomentum)} r={hot ? 6.5 : 4.2} fill={color} stroke={hot ? "var(--k-fg)" : "none"} strokeWidth="1.4" />
              </g>
            );
          })}
          {showLabels ? placeLabels(drawn.flatMap((row) => {
            const last = row.tail[row.tail.length - 1];
            return last ? [{ symbol: row.symbol, x: sx(last.rsRatio), y: sy(last.rsMomentum) }] : [];
          }), selected || null).map((label) => (
            <text key={label.symbol} x={label.x} y={label.y} fill="var(--k-fg)" fontSize={label.symbol === selected ? 12 : 10} fontWeight={label.symbol === selected ? 650 : 450}>{label.symbol}</text>
          )) : null}
          </g>
          {xTicks.map((tick) => (
            <text key={`x${tick}`} x={sx(tick)} y={TOP + PLOT_H + 16} textAnchor="middle" fill="var(--k-subtle)" fontSize="10">{tick.toFixed(0)}</text>
          ))}
          {yTicks.map((tick) => (
            <text key={`y${tick}`} x={LEFT - 6} y={sy(tick) + 3} textAnchor="end" fill="var(--k-subtle)" fontSize="10">{tick.toFixed(0)}</text>
          ))}
          <text x={LEFT + PLOT_W / 2} y={VB_H - 4} textAnchor="middle" fill="var(--k-subtle)" fontSize="11">RS-Ratio</text>
          <text x="14" y={TOP + PLOT_H / 2} textAnchor="middle" fill="var(--k-subtle)" fontSize="11" transform={`rotate(-90 14 ${TOP + PLOT_H / 2})`}>RS-Momentum</text>
        </svg>
      )}
      <div className="min-h-10 border-t border-border px-3 py-2 text-[12px] text-muted">
        {hover ? (
          <span className="text-fg">
            {hover.name} · {hover.date} · RS-Ratio {hover.rsRatio.toFixed(2)}
            {hover.dx == null ? "" : ` (${hover.dx > 0 ? "+" : ""}${hover.dx.toFixed(2)})`}
            {" · "}RS-Momentum {hover.rsMomentum.toFixed(2)}
            {hover.dy == null ? "" : ` (${hover.dy > 0 ? "+" : ""}${hover.dy.toFixed(2)})`}
            {" · "}{hover.quadrant}
          </span>
        ) : locked ? "Playback holds this scale." : "Scroll to zoom. Drag to pan. Click a trail to select it."}
      </div>
    </div>
  );
}

function nearest(rows: RrgReading[], at: { x: number; y: number } | null, view: PlotDomain): Hover | null {
  if (!at) return null;
  let best: Hover | null = null;
  let bestDist = Infinity;
  for (const row of rows) {
    const last = row.tail[row.tail.length - 1];
    const prev = row.tail[row.tail.length - 2];
    for (const point of row.tail) {
      const dist = Math.hypot(point.rsRatio - at.x, point.rsMomentum - at.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = {
          symbol: row.symbol,
          name: row.name,
          date: point.date,
          rsRatio: point.rsRatio,
          rsMomentum: point.rsMomentum,
          quadrant: quadrantLabel(point.quadrant),
          dx: last && prev ? last.rsRatio - prev.rsRatio : null,
          dy: last && prev ? last.rsMomentum - prev.rsMomentum : null,
        };
      }
    }
  }
  return best && bestDist < Math.max(view.x1 - view.x0, view.y1 - view.y0) * 0.05 ? best : null;
}

function dataAt(node: SVGSVGElement, clientX: number, clientY: number, view: PlotDomain) {
  const rect = node.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = ((clientX - rect.left) / rect.width) * VB_W;
  const y = ((clientY - rect.top) / rect.height) * VB_H;
  return {
    x: view.x0 + ((x - LEFT) / PLOT_W) * (view.x1 - view.x0),
    y: view.y0 + (1 - (y - TOP) / PLOT_H) * (view.y1 - view.y0),
  };
}

function arrow(x1: number, y1: number, x2: number, y2: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;
  const a = `${x2},${y2}`;
  const b = `${x2 - size * Math.cos(angle - 0.45)},${y2 - size * Math.sin(angle - 0.45)}`;
  const c = `${x2 - size * Math.cos(angle + 0.45)},${y2 - size * Math.sin(angle + 0.45)}`;
  return `${a} ${b} ${c}`;
}

function ticks(start: number, end: number) {
  const span = end - start;
  if (!(span > 0)) return [100];
  const raw = span / 4;
  const step = raw > 20 ? 10 : raw > 8 ? 5 : raw > 3 ? 2 : 1;
  const out: number[] = [];
  for (let value = Math.ceil(start / step) * step; value <= end; value += step) out.push(value);
  if (!out.some((value) => Math.abs(value - 100) < step * 0.2)) out.push(100);
  return out;
}

function centerOnReference(domain: PlotDomain): PlotDomain {
  const rx = Math.max(domain.x1 - 100, 100 - domain.x0, 2);
  const ry = Math.max(domain.y1 - 100, 100 - domain.y0, 2);
  return { x0: 100 - rx, x1: 100 + rx, y0: 100 - ry, y1: 100 + ry };
}
