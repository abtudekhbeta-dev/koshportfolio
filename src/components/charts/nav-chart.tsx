import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2 } from "lucide-react";
import type { ChartMode, ChartRange, NavPoint } from "@/lib/kosh/types";
import {
  BENCH_STROKE,
  DOWN_STROKE,
  MIX_STROKE,
  SMA_STROKE,
  buildRows,
  buildSvgDoc,
  countable,
  domain,
  extremes,
  niceY,
  seriesPath,
  smaRows,
  yearMarks,
  type PlotStyle,
} from "@/lib/kosh/plot";
import { Seg } from "@/components/seg";
import { cn } from "@/lib/utils";
import { sliceNav } from "@/lib/kosh/engine";
import { useKosh, type NavStyle } from "@/lib/store";

const MODES: { id: ChartMode; label: string }[] = [
  { id: "cum", label: "Growth" },
  { id: "inr", label: "Rupees" },
  { id: "roll1y", label: "Rolling 1Y" },
  { id: "roll3m", label: "Rolling 3M" },
  { id: "m", label: "Monthly" },
  { id: "w", label: "Weekly" },
  { id: "dd", label: "Drawdown" },
  { id: "gap", label: "Gap" },
];

const RANGES: { id: ChartRange; label: string }[] = [
  { id: "1M", label: "1M" },
  { id: "3M", label: "3M" },
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y" },
  { id: "MAX", label: "MAX" },
  { id: "CUSTOM", label: "Custom" },
];

const STYLES: { id: NavStyle; label: string }[] = [
  { id: "area", label: "Area" },
  { id: "line", label: "Line" },
  { id: "step", label: "Step" },
  { id: "bar", label: "Bars" },
  { id: "columns", label: "Columns" },
];

function asStyle(s: string | undefined): PlotStyle {
  if (s === "line" || s === "step" || s === "bar" || s === "columns" || s === "area") return s;
  return "area";
}

function rangeStats(rows: { port: number | null; bench: number | null }[], rupee: boolean, yTitle: string) {
  const first = rows.find((r) => r.port != null && Number.isFinite(r.port));
  const last = [...rows].reverse().find((r) => r.port != null && Number.isFinite(r.port));
  if (!first || !last || first.port == null || last.port == null) return null;
  const pctMode = /%|pp/.test(yTitle);
  if (pctMode) return { port: last.port, bench: last.bench, kind: "last" as const };
  if (rupee || yTitle.startsWith("Indexed") || yTitle.startsWith("₹")) {
    const port = first.port ? (last.port / first.port - 1) * 100 : null;
    const bench =
      first.bench && last.bench && first.bench !== 0 ? (last.bench / first.bench - 1) * 100 : null;
    return { port, bench, kind: "ret" as const };
  }
  return { port: last.port, bench: last.bench, kind: "last" as const };
}

function fmtChip(n: number, kind: "pct" | "pp" | "num", rupee: boolean) {
  if (!Number.isFinite(n)) return "—";
  if (rupee && kind === "num") return niceY(n, true);
  const sign = n >= 0 ? "+" : "";
  if (kind === "pp") return `${sign}${n.toFixed(1)} pp`;
  return `${sign}${n.toFixed(1)}%`;
}

function fmtBuyDay(d: string) {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mo = months[Number(m) - 1];
  if (!mo) return d;
  return `${Number(day)} ${mo} '${y.slice(2)}`;
}

export function NavChart({
  nav,
  portLabel = "Portfolio",
  benchLabel = "Benchmark",
  coverage,
  nowValue,
  metals,
  range: rangeProp,
  onRange,
  fromBuy,
}: {
  nav: NavPoint[];
  portLabel?: string;
  benchLabel?: string;
  coverage?: string;
  nowValue?: number;
  metals?: { present: boolean; included: boolean; onChange: (on: boolean) => void };
  range?: ChartRange;
  onRange?: (r: ChartRange) => void;
  fromBuy?: string | null;
}) {
  const prefs = useKosh((s) => s.navPrefs);
  const patchNavPrefs = useKosh((s) => s.patchNavPrefs);
  const [mode, setMode] = useState<ChartMode>("cum");
  const [rangeLocal, setRangeLocal] = useState<ChartRange>(rangeProp || "1Y");
  const range = rangeProp || rangeLocal;
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  function setRange(next: ChartRange) {
    setRangeLocal(next);
    onRange?.(next);
  }
  const [hover, setHover] = useState<number | null>(null);
  const [fs, setFs] = useState(false);
  const smaOn = prefs.smaOn;
  const style = asStyle(prefs.style);
  useEffect(() => {
    if (!fs) return;
    document.documentElement.classList.add("kosh-fs-lock");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("kosh-fs-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [fs]);
  const windowed = useMemo(
    () => sliceNav(nav || [], range, range === "CUSTOM" ? { from: customFrom, to: customTo } : undefined),
    [nav, range, customFrom, customTo],
  );
  const { rows, yTitle, bar } = useMemo(
    () => buildRows(windowed, mode, range === "CUSTOM" ? "MAX" : range, nowValue),
    [windowed, mode, range, nowValue],
  );
  const n = rows.length;
  const portN = countable(rows, "port");
  const showBench = prefs.showBench && countable(rows, "bench") >= 2 && !bar && style !== "bar" && style !== "columns";
  const mixStroke = mode === "dd" ? DOWN_STROKE : MIX_STROKE;
  const rupee = mode === "inr";
  const fillOn = !bar && style === "area";
  const wantSma = smaOn && !bar && style !== "bar" && style !== "columns" && (mode === "cum" || mode === "inr" || mode === "gap");
  const sma = useMemo(() => (wantSma ? smaRows(rows, 21) : []), [wantSma, rows]);
  const marks = useMemo(() => yearMarks(rows), [rows]);
  const ext = useMemo(() => extremes(rows), [rows]);
  const stats = rangeStats(rows, rupee, yTitle);
  const svg = useMemo(
    () =>
      buildSvgDoc({
        rows,
        bar,
        rupee,
        mixStroke,
        sma,
        years: marks,
        peak: ext.peak,
        showSma: wantSma,
        fill: fillOn,
        showBench,
        style: bar ? "bar" : style,
      }),
    [rows, bar, rupee, mixStroke, sma, marks, ext.peak, wantSma, fillOn, showBench, style],
  );
  const img = useMemo(() => svgDataUrlSafe(svg), [svg]);
  const hiRow = hover != null ? rows[hover] : rows[n - 1];
  const { lo, hi } = domain(rows);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (n < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left) / (rect.width || 1);
    const i = Math.round(Math.min(1, Math.max(0, t)) * (n - 1));
    setHover(i);
  }

  function saveChart() {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kosh-${mode}-${range}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const card = (
    <div className={cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", fs && "kosh-chart-fs")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <Seg value={mode} onChange={setMode} options={MODES} />
        <Seg value={range} onChange={setRange} options={RANGES} />
      </div>
      {fromBuy ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              setCustomFrom(fromBuy);
              setCustomTo("");
              setRange("CUSTOM");
            }}
            className={cn(
              "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
              range === "CUSTOM" && customFrom === fromBuy ? "bg-surface-2 text-fg" : "bg-bg text-muted hover:text-fg",
            )}
          >
            From buy {fmtBuyDay(fromBuy)}
          </button>
        </div>
      ) : null}
      {range === "CUSTOM" ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted">
          <label className="flex items-center gap-1.5">
            From
            <input
              type="date"
              className="h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1.5">
            To
            <input
              type="date"
              className="h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </label>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {metals?.present ? (
          <div className="inline-flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]">
            <button
              type="button"
              className={cn(
                "h-8 rounded-[6px] px-3 text-[12px] font-medium",
                !metals.included ? "bg-surface text-fg" : "text-muted",
              )}
              onClick={() => metals.onChange(false)}
            >
              Equity only
            </button>
            <button
              type="button"
              className={cn(
                "h-8 rounded-[6px] px-3 text-[12px] font-medium",
                metals.included ? "bg-surface text-fg" : "text-muted",
              )}
              onClick={() => metals.onChange(true)}
            >
              With gold & silver
            </button>
          </div>
        ) : null}
        {!bar ? (
          <>
            <Seg
              value={style}
              onChange={(id) => patchNavPrefs({ style: id, fill: id === "area" })}
              options={STYLES}
            />
            <button
              type="button"
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]",
                prefs.showBench ? "bg-bg-elevated text-fg" : "text-muted",
              )}
              onClick={() => patchNavPrefs({ showBench: !prefs.showBench })}
            >
              Index {prefs.showBench ? "on" : "off"}
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]",
                wantSma ? "bg-bg-elevated text-fg" : "text-muted",
              )}
              onClick={() => patchNavPrefs({ smaOn: !smaOn })}
            >
              21-session average {wantSma ? "on" : "off"}
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none text-muted shadow-[var(--shadow-border)] hover:text-fg"
          onClick={saveChart}
        >
          Save chart
        </button>
        <button
          type="button"
          title={fs ? "Exit fullscreen" : "Fullscreen"}
          onClick={() => setFs((s) => !s)}
          className={cn("inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", fs ? "bg-bg-elevated text-fg" : "text-muted hover:text-fg")}
        >
          {fs ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          {fs ? "Exit" : "Full"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtle">
        <span>
          {coverage ? `${coverage} · ${yTitle}` : yTitle}
          {` · ${portN} points drawn`}
          <span className="ml-2 text-muted">Hover a day for the number</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: mixStroke }} />
            {portLabel}
          </span>
          {showBench ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: BENCH_STROKE }} />
              {benchLabel}
            </span>
          ) : null}
          {wantSma ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: SMA_STROKE }} />
              21d avg
            </span>
          ) : null}
        </span>
      </div>
      {stats ? (
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[13px] tabular">
          <span style={{ color: mixStroke }}>
            {portLabel}{" "}
            {stats.kind === "ret"
              ? stats.port == null
                ? "—"
                : `${stats.port >= 0 ? "+" : ""}${stats.port.toFixed(1)}%`
              : stats.port == null
                ? "—"
                : niceY(stats.port, rupee)}
          </span>
          {showBench ? (
            <span className="text-muted">
              {benchLabel}{" "}
              {stats.kind === "ret"
                ? stats.bench == null
                  ? "—"
                  : `${stats.bench >= 0 ? "+" : ""}${stats.bench.toFixed(1)}%`
                : stats.bench == null
                  ? "—"
                  : niceY(stats.bench, rupee)}
            </span>
          ) : null}
          {stats.kind === "ret" && stats.port != null && stats.bench != null ? (
            <span className={stats.port - stats.bench >= 0 ? "text-up" : "text-down"}>
              Gap {stats.port - stats.bench >= 0 ? "+" : ""}
              {(stats.port - stats.bench).toFixed(1)} pp
            </span>
          ) : null}
        </div>
      ) : null}
      {yTitle.startsWith("Indexed") ? (
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-muted">
          Both lines start at 100 on {rows.find((r) => r.port != null && r.bench != null)?.day || "the first overlapping day"} of this {range} window — not rupee prices. If the index sits lower, this name beat it over the window. It is not a scale error. Switch 1Y / 5Y / MAX to change the window; alpha and beta use the same slice, daily Jensen vs this index, Rf 6.5%.
        </p>
      ) : null}

      <div
        className="kosh-plot relative mt-3 w-full"
        data-testid="kosh-nav"
        data-points={portN}
        data-dlen={bar ? String(n) : seriesPath(rows, "port", lo, hi).length}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {portN < 2 ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-muted">
            Not enough daily prices to draw a line yet. Check Holdings if a ticker is still unresolved.
          </div>
        ) : (
          <>
            <img
              src={img}
              alt={`${portLabel} versus ${benchLabel}`}
              width={800}
              height={300}
              className="kosh-plot-img"
              data-testid="kosh-nav-img"
              decoding="sync"
              loading="eager"
            />
            {hover != null && rows[hover] ? (
              <div
                className="kosh-plot-cross"
                style={{ left: `${(hover / Math.max(1, n - 1)) * 100}%` }}
              />
            ) : null}
          </>
        )}
        {hiRow && portN >= 2 ? (
          <div className="pointer-events-none absolute top-2 right-2 z-10 rounded-sm bg-bg-elevated/90 px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-border)]">
            <div className="text-subtle">{hiRow.day}</div>
            <div className="mt-0.5 font-mono tabular" style={{ color: mixStroke }}>
              {portLabel} {hiRow.port == null ? "—" : niceY(hiRow.port, rupee)}
            </div>
            {showBench ? (
              <div className="font-mono tabular text-muted">
                {benchLabel} {hiRow.bench == null ? "—" : niceY(hiRow.bench, rupee)}
              </div>
            ) : null}
            {hiRow.port != null && hiRow.bench != null && !rupee ? (
              <div className={hiRow.port - hiRow.bench >= 0 ? "text-up" : "text-down"}>
                {fmtChip(hiRow.port - hiRow.bench, "pp", false)}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {portN >= 2 && ext.peak.i >= 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
          <Highlight label="Peak" value={niceY(ext.peak.v, rupee)} hint={ext.peak.day} />
          <Highlight label="Trough" value={niceY(ext.trough.v, rupee)} hint={ext.trough.day} />
          <Highlight
            label="Best session"
            value={fmtChip(ext.best.ch, "pct", false)}
            hint={ext.best.day}
            tone={ext.best.ch >= 0 ? "up" : "down"}
          />
          <Highlight
            label="Worst session"
            value={fmtChip(ext.worst.ch, "pct", false)}
            hint={ext.worst.day}
            tone={ext.worst.ch >= 0 ? "up" : "down"}
          />
        </div>
      ) : null}
    </div>
  );
  if (fs && typeof document !== "undefined") return createPortal(card, document.body);
  return card;
}

function svgDataUrlSafe(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function Highlight({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-sm bg-bg px-3 py-2 shadow-[var(--shadow-border)]">
      <div className="text-[10px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-mono text-[13px] tabular",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted">{hint}</div>
    </div>
  );
}
