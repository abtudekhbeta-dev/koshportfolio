import { useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import type { ChartMode, ChartRange, NavPoint } from "@/lib/kosh/types";
import {
  BENCH_STROKE,
  DOWN_STROKE,
  MIX_STROKE,
  PATH_STROKE,
  SAME_STROKE,
  SMA_STROKE,
  buildRows,
  buildSvgDoc,
  plotChrome,
  countable,
  domain,
  extremes,
  niceY,
  seriesPath,
  smaRows,
  yearMarks,
  type PlotKey,
  type PlotRow,
  type PlotStyle,
} from "@/lib/kosh/plot";
import { Seg } from "@/components/seg";
import { useChartFullscreen } from "@/components/charts/use-fullscreen";
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

function seriesRet(rows: PlotRow[], key: PlotKey): number | null {
  const first = rows.find((r) => {
    const v = r[key];
    return v != null && Number.isFinite(v) && v !== 0;
  });
  const last = [...rows].reverse().find((r) => {
    const v = r[key];
    return v != null && Number.isFinite(v);
  });
  if (!first || !last) return null;
  const a = first[key];
  const b = last[key];
  if (a == null || b == null || !a) return null;
  return (b / a - 1) * 100;
}

function fmtRet(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function lastOf(rows: PlotRow[], key: PlotKey): number {
  const last = [...rows].reverse().find((r) => r[key] != null && Number.isFinite(r[key] as number));
  return (last?.[key] as number) || 0;
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
  pathLabel,
  sameLabel,
  pathPrimary,
  hideBench,
  modes,
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
  pathLabel?: string;
  sameLabel?: string;
  pathPrimary?: boolean;
  hideBench?: boolean;
  modes?: ChartMode[];
}) {
  const prefs = useKosh((s) => s.navPrefs);
  const theme = useKosh((s) => s.theme);
  const patchNavPrefs = useKosh((s) => s.patchNavPrefs);
  const [mode, setMode] = useState<ChartMode>(modes?.[0] || "cum");
  const [rangeLocal, setRangeLocal] = useState<ChartRange>(rangeProp || (pathPrimary ? "MAX" : "1Y"));
  const range = rangeProp || rangeLocal;
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  function setRange(next: ChartRange) {
    setRangeLocal(next);
    onRange?.(next);
  }
  const [hover, setHover] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { fs, fallback, toggle } = useChartFullscreen(cardRef);
  const [mixOn, setMixOn] = useState(true);
  const [pathOn, setPathOn] = useState(true);
  const [sameOn, setSameOn] = useState(true);
  const [benchOn, setBenchOn] = useState(pathPrimary ? !hideBench : !hideBench && prefs.showBench);
  const smaOn = prefs.smaOn;
  const style = asStyle(prefs.style);
  const windowed = useMemo(
    () => sliceNav(nav || [], range, range === "CUSTOM" ? { from: customFrom, to: customTo } : undefined),
    [nav, range, customFrom, customTo],
  );
  const { rows, yTitle, bar } = useMemo(
    () => buildRows(windowed, mode, range === "CUSTOM" ? "MAX" : range, nowValue),
    [windowed, mode, range, nowValue],
  );
  const n = rows.length;
  const mixN = countable(rows, "port");
  const pathN = countable(rows, "path");
  const sameN = countable(rows, "sameCash");
  const benchN = countable(rows, "bench");
  const lineMode = !bar && style !== "bar" && style !== "columns";
  const showMix = (bar || mixOn) && mixN >= 2;
  const showBench = !hideBench && benchOn && benchN >= 2 && lineMode;
  const showPath = Boolean(pathLabel) && pathOn && pathN >= 2 && lineMode && (mode === "cum" || mode === "inr");
  const showSame = Boolean(sameLabel) && sameOn && sameN >= 2 && lineMode && (mode === "cum" || mode === "inr");
  const visKeys: PlotKey[] = [];
  if (showMix) visKeys.push("port");
  if (showBench) visKeys.push("bench");
  if (showPath) visKeys.push("path");
  if (showSame) visKeys.push("sameCash");
  const drawnN = visKeys.reduce((s, k) => Math.max(s, countable(rows, k)), 0);
  const mixStroke = pathPrimary ? PATH_STROKE : mode === "dd" ? DOWN_STROKE : MIX_STROKE;
  const benchStroke = pathPrimary ? SAME_STROKE : BENCH_STROKE;
  const rupee = mode === "inr";
  const fillOn = !bar && style === "area";
  const wantSma = smaOn && !bar && style !== "bar" && style !== "columns" && (mode === "cum" || mode === "inr" || mode === "gap");
  const sma = useMemo(() => (wantSma ? smaRows(rows, 21) : []), [wantSma, rows]);
  const marks = useMemo(() => yearMarks(rows), [rows]);
  const ext = useMemo(
    () => extremes(rows, pathPrimary && showPath ? "path" : showMix ? "port" : visKeys[0] || "port"),
    [rows, pathPrimary, showPath, showMix, visKeys[0]],
  );
  const stats = rangeStats(rows, rupee, yTitle);
  const pathRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "path") : null;
  const sameRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "sameCash") : null;
  const mixRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "port") : null;
  const vsSame = pathRet != null && sameRet != null ? pathRet - sameRet : null;
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
        showSma: wantSma && showMix,
        fill: fillOn && showMix,
        showBench,
        style: bar ? "bar" : style,
        showPath,
        showSame,
        showMix,
        pathPrimary,
        benchStroke,
        ...plotChrome(theme),
      }),
    [rows, bar, rupee, mixStroke, sma, marks, ext.peak, wantSma, fillOn, showBench, style, showPath, showSame, showMix, pathPrimary, benchStroke, theme],
  );
  const img = useMemo(() => svgDataUrlSafe(svg), [svg]);
  const hiRow = hover != null ? rows[hover] : rows[n - 1];
  const { lo, hi } = domain(rows, visKeys.length ? visKeys : ["port"]);

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

  function flip(which: "mix" | "path" | "same" | "bench") {
    const nextMix = which === "mix" ? !mixOn : mixOn;
    const nextPath = which === "path" ? !pathOn : pathOn;
    const nextSame = which === "same" ? !sameOn : sameOn;
    const nextBench = which === "bench" ? !benchOn : benchOn;
    const any =
      (nextMix && mixN >= 2) ||
      (nextPath && Boolean(pathLabel) && pathN >= 2) ||
      (nextSame && Boolean(sameLabel) && sameN >= 2) ||
      (nextBench && !hideBench && benchN >= 2);
    if (!any) return;
    if (which === "mix") setMixOn(nextMix);
    if (which === "path") setPathOn(nextPath);
    if (which === "same") setSameOn(nextSame);
    if (which === "bench") {
      setBenchOn(nextBench);
      if (!hideBench && !pathPrimary) patchNavPrefs({ showBench: nextBench });
    }
  }

  const card = (
    <div
      ref={cardRef}
      className={cn(
        "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
        fallback && "kosh-chart-fs",
        fs && "kosh-fs-live",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <Seg
          value={mode}
          onChange={setMode}
          options={
            modes?.length
              ? modes.map((id) => MODES.find((m) => m.id === id)).filter((m): m is (typeof MODES)[number] => Boolean(m))
              : MODES
          }
        />
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
          onClick={() => void toggle()}
          className={cn("inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", fs ? "bg-bg-elevated text-fg" : "text-muted hover:text-fg")}
        >
          {fs ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          {fs ? "Exit" : "Full"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtle">
        <span>
          {coverage ? `${coverage} · ${yTitle}` : yTitle}
          {` · ${drawnN} points drawn`}
          <span className="ml-2 text-muted">Hover a day · tap a name to show or hide</span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <SeriesChip label={portLabel} color={mixStroke} on={showMix} onClick={() => flip("mix")} />
          {hideBench ? null : (
            <SeriesChip
              label={benchLabel}
              color={benchStroke}
              on={showBench}
              dashed={pathPrimary}
              onClick={() => flip("bench")}
            />
          )}
          {pathLabel ? (
            <SeriesChip label={pathLabel} color={PATH_STROKE} on={showPath} muted onClick={() => flip("path")} />
          ) : null}
          {sameLabel ? (
            <SeriesChip label={sameLabel} color={SAME_STROKE} on={showSame} dashed onClick={() => flip("same")} />
          ) : null}
          {wantSma ? (
            <span className="inline-flex items-center gap-1.5 px-1 text-subtle">
              <span className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: SMA_STROKE }} />
              21d avg
            </span>
          ) : null}
        </span>
      </div>
      {stats ? (
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[13px] tabular">
          {pathPrimary && rupee && !pathLabel ? (
            <>
              {showMix ? (
                <span style={{ color: mixStroke }}>
                  {portLabel} {niceY(lastOf(rows, "port"), true)}
                </span>
              ) : null}
              {showBench ? (
                <span style={{ color: benchStroke }}>
                  {benchLabel} {niceY(lastOf(rows, "bench"), true)}
                </span>
              ) : null}
            </>
          ) : pathPrimary && pathLabel && (mode === "cum" || mode === "inr") ? (
            <>
              {showPath ? (
                <span style={{ color: PATH_STROKE }}>
                  {pathLabel}{" "}
                  {rupee
                    ? niceY(lastOf(rows, "path"), true)
                    : fmtRet(pathRet)}
                </span>
              ) : null}
              {showSame ? (
                <span style={{ color: SAME_STROKE }}>
                  {sameLabel}{" "}
                  {rupee ? niceY(lastOf(rows, "sameCash"), true) : fmtRet(sameRet)}
                </span>
              ) : null}
              {showMix ? (
                <span className="opacity-60" style={{ color: mixStroke }}>
                  {portLabel} {rupee ? niceY(lastOf(rows, "port"), true) : fmtRet(mixRet)}
                </span>
              ) : null}
              {vsSame != null && showPath && showSame && !rupee ? (
                <span className={vsSame >= 0 ? "text-up" : "text-down"}>
                  Vs same money {vsSame >= 0 ? "+" : ""}
                  {vsSame.toFixed(1)} pp
                </span>
              ) : null}
            </>
          ) : (
            <>
              {showMix ? (
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
              ) : null}
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
              {showMix && showBench && stats.kind === "ret" && stats.port != null && stats.bench != null ? (
                <span className={stats.port - stats.bench >= 0 ? "text-up" : "text-down"}>
                  Gap {stats.port - stats.bench >= 0 ? "+" : ""}
                  {(stats.port - stats.bench).toFixed(1)} pp
                </span>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      {yTitle.startsWith("Indexed") ? (
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-muted">
          {pathPrimary
            ? `Growth is how the names you actually held did — extra money you added later is taken out. Switch to Rupees for the rupees you held. The dashed line is the same rupees in the index on the same days.`
            : `Both lines start at 100 on ${rows.find((r) => r.port != null && r.bench != null)?.day || "the first overlapping day"} of this ${range} window — not rupee prices. If the index sits lower, this name beat it over the window. It is not a scale error. Switch 1Y / 5Y / MAX to change the window; alpha and beta use the same slice, daily Jensen vs this index, Rf 6.5%.`}
        </p>
      ) : null}

      <div
        className="kosh-plot relative mt-3 w-full"
        data-testid="kosh-nav"
        data-points={drawnN}
        data-dlen={bar ? String(n) : seriesPath(rows, visKeys[0] || "port", lo, hi).length}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {drawnN < 2 ? (
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
        {hiRow && drawnN >= 2 ? (
          <div className="pointer-events-none absolute top-2 right-2 z-10 rounded-sm bg-bg-elevated/90 px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-border)]">
            <div className="text-subtle">{hiRow.day}</div>
            {showPath ? (
              <div className="mt-0.5 font-mono tabular" style={{ color: PATH_STROKE }}>
                {pathLabel} {hiRow.path == null ? "—" : niceY(hiRow.path, rupee)}
              </div>
            ) : null}
            {showSame ? (
              <div className="font-mono tabular" style={{ color: SAME_STROKE }}>
                {sameLabel} {hiRow.sameCash == null ? "—" : niceY(hiRow.sameCash, rupee)}
              </div>
            ) : null}
            {showMix ? (
              <div
                className={cn("font-mono tabular", pathPrimary ? "mt-0.5 opacity-60" : "mt-0.5")}
                style={{ color: mixStroke }}
              >
                {portLabel} {hiRow.port == null ? "—" : niceY(hiRow.port, rupee)}
              </div>
            ) : null}
            {showBench ? (
              <div className="font-mono tabular text-muted">
                {benchLabel} {hiRow.bench == null ? "—" : niceY(hiRow.bench, rupee)}
              </div>
            ) : null}
            {showMix && showBench && hiRow.port != null && hiRow.bench != null && !rupee ? (
              <div className={hiRow.port - hiRow.bench >= 0 ? "text-up" : "text-down"}>
                {fmtChip(hiRow.port - hiRow.bench, "pp", false)}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {drawnN >= 2 && ext.peak.i >= 0 ? (
          rupee && pathPrimary ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <Highlight label="Highest" value={niceY(ext.peak.v, rupee)} hint={ext.peak.day} />
            <Highlight label="Lowest" value={niceY(ext.trough.v, rupee)} hint={ext.trough.day} />
          </div>
        ) : (
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
        )
      ) : null}
    </div>
  );
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

function SeriesChip({
  label,
  color,
  on,
  muted,
  dashed,
  onClick,
}: {
  label: string;
  color: string;
  on: boolean;
  muted?: boolean;
  dashed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? `Hide ${label}` : `Show ${label}`}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] leading-none shadow-[var(--shadow-border)]",
        on ? "bg-bg-elevated text-fg" : "text-subtle line-through decoration-subtle",
        muted && on && "opacity-70",
      )}
    >
      <span
        className="inline-block h-[3px] w-3.5 shrink-0 rounded-full"
        style={
          dashed
            ? { backgroundImage: `repeating-linear-gradient(90deg, ${on ? color : "#6e6e76"} 0 3px, transparent 3px 5px)` }
            : { background: on ? color : "#6e6e76" }
        }
      />
      {label}
    </button>
  );
}
