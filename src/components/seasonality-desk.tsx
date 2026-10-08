import { useMemo, useState, type ButtonHTMLAttributes } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIButton } from "@/components/ui/ai-button";
import { apiResearch, apiSeasonalityAll, apiSeasonalityRecover, type SeasonSeries } from "@/lib/kosh/api";
import { fmtPct } from "@/lib/kosh/engine";
import { BENCH_STROKE, plotChrome } from "@/lib/kosh/plot";
import {
  SEASON_VERSION,
  acceptSourcedClose,
  canonSymbol,
  portfolioSeason,
  recoveryTargets,
  seasonCloseAsk,
  seasonView,
  windowBounds,
  type Lookback,
  type PeriodCell,
  type PortfolioSeason,
  type SeasonBucket,
  type SeasonKind,
} from "@/lib/kosh/seasonality";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const LOOKBACKS: Lookback[] = [2, 3, 5, 10];
const DISCLAIMER = "Seasonality reflects historical tendencies and is not a forecast or guarantee of future returns.";

type NameIn = { symbol: string; name: string; weight?: number };

function cellsOf(s: SeasonSeries, kind: SeasonKind) {
  return kind === "monthly" ? s.monthly : s.quarterly;
}

function coverage(cells: PeriodCell[]) {
  const expected = cells.filter((c) => c.status !== "partial").length;
  const observed = cells.filter((c) => c.status === "calculated").length;
  const missing = cells.filter((c) => c.status === "missing").length;
  return { expected, observed, missing, pct: expected > 0 ? (observed / expected) * 100 : null };
}

function inWindow(c: PeriodCell, start: number, end: number, includeCurrent: boolean, asOfYear: number) {
  if (c.status !== "calculated") return false;
  if (c.year < start || c.year > end) return false;
  if (!includeCurrent && c.year >= asOfYear) return false;
  return true;
}

export function SeasonalityDesk({ mode, names }: { mode: "stock" | "portfolio"; names: NameIn[] }) {
  const [kind, setKind] = useState<SeasonKind>("monthly");
  const [lookback, setLookback] = useState<Lookback>(5);
  const [includeCurrent, setIncludeCurrent] = useState(false);
  const [compare, setCompare] = useState(false);
  const [windowEnd, setWindowEnd] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState<"refresh" | "ai" | null>(null);
  const [note, setNote] = useState("");
  const qc = useQueryClient();

  const ranked = useMemo(() => {
    const seen = new Set<string>();
    const rows = [...names].sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const out: NameIn[] = [];
    for (const n of rows) {
      const key = canonSymbol(n.symbol);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(n);
    }
    return out;
  }, [names]);
  const symbols = ranked;
  const key = symbols.map((s) => canonSymbol(s.symbol)).join("|");

  const q = useQuery({
    queryKey: ["seasonality", key],
    queryFn: () => apiSeasonalityAll(symbols.map((s) => s.symbol), { benchmark: true }),
    enabled: symbols.length > 0,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const bounds = useMemo(() => {
    if (!q.data) return null;
    const cells = q.data.series.flatMap((s) => cellsOf(s, kind));
    return windowBounds(cells, lookback, q.data.asOf, includeCurrent);
  }, [q.data, kind, lookback, includeCurrent]);

  const view = useMemo(() => {
    if (!q.data || !bounds) return null;
    const end = Math.min(bounds.maxEnd, Math.max(bounds.minEnd, windowEnd ?? bounds.defaultEnd));
    const bench = compare ? (q.data.benchmark ? cellsOf(q.data.benchmark, kind) : undefined) : undefined;
    if (mode === "stock") {
      const s = q.data.series[0];
      if (!s) return null;
      return seasonView(cellsOf(s, kind), {
        kind,
        lookback,
        windowEnd: end,
        includeCurrent,
        asOfDay: q.data.asOf,
        firstDay: s.firstDay,
        lastDay: s.lastDay,
        bench,
      });
    }
    return portfolioSeason(
      q.data.series.map((s) => ({
        symbol: s.symbol,
        cells: cellsOf(s, kind),
        firstDay: s.firstDay,
        lastDay: s.lastDay,
      })),
      symbols.map((n) => ({ symbol: n.symbol, name: n.name, weight: n.weight || 0 })),
      { kind, lookback, windowEnd: end, includeCurrent, asOfDay: q.data.asOf, bench },
    );
  }, [q.data, bounds, windowEnd, compare, mode, kind, lookback, includeCurrent, symbols]);

  const asOfYear = Number(q.data?.asOf?.slice(0, 4) || 0);
  const coveredNames =
    mode === "portfolio" && view && q.data
      ? q.data.series.filter((s) => cellsOf(s, kind).some((c) => inWindow(c, view.windowStart, view.windowEnd, includeCurrent, asOfYear))).length
      : 0;
  const targets =
    view && q.data
      ? recoveryTargets(
          q.data.series.map((s) => ({ symbol: s.symbol, monthly: s.monthly })),
          view.windowStart,
          view.windowEnd,
          6,
        )
      : [];
  const pick = view ? Math.min(selected, Math.max(0, view.buckets.length - 1)) : 0;
  const bucket = view?.buckets[pick];

  async function refresh() {
    setBusy("refresh");
    setNote("");
    try {
      const data = await apiSeasonalityAll(
        symbols.map((s) => s.symbol),
        { benchmark: true, refresh: true },
      );
      qc.setQueryData(["seasonality", key], data);
      setNote("Stored history refreshed from the market source. Nothing was estimated.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not refresh history.");
    } finally {
      setBusy(null);
    }
  }

  async function recover() {
    if (!targets.length) {
      setNote("No specific missing month to look up. A history was not invented.");
      return;
    }
    setBusy("ai");
    setNote("");
    const lines: string[] = [];
    for (const t of targets) {
      try {
        const res = await apiResearch(t.symbol, [seasonCloseAsk(t.symbol, t.year, t.month)]);
        const item = res.items?.[0];
        const accepted = acceptSourcedClose({
          sourceUrl: item?.sourceUrl,
          sourceName: item?.sourceName,
          evidence: item?.evidence,
          methodology: item?.methodology,
          value: item?.value,
          year: t.year,
          month: t.month,
        });
        if (!accepted || !item?.sourceUrl || !item.sourceName) {
          lines.push(`${t.symbol} ${t.year}-${String(t.month).padStart(2, "0")}: no sourced close. Left missing.`);
          continue;
        }
        const saved = await apiSeasonalityRecover({
          symbol: t.symbol,
          year: t.year,
          month: t.month,
          value: accepted.price,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          evidence: item.evidence || "",
        });
        lines.push(
          saved.ok
            ? `${t.symbol} ${accepted.day}: stored from ${item.sourceName}. A market print still outranks it.`
            : `${t.symbol}: ${saved.reason}`,
        );
      } catch (err) {
        lines.push(`${t.symbol}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
      }
    }
    setNote(lines.join(" "));
    await qc.invalidateQueries({ queryKey: ["seasonality", key] });
    setBusy(null);
  }

  if (!symbols.length) {
    return (
      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Seasonality</h2>
        <p className="mt-2 text-[13px] text-muted">Add holdings to see how this portfolio has tended to behave by month and quarter.</p>
      </section>
    );
  }

  const portView: PortfolioSeason | null = mode === "portfolio" && view ? (view as PortfolioSeason) : null;
  const end = view?.windowEnd ?? bounds?.defaultEnd ?? 0;

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Seasonality</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
          {mode === "portfolio"
            ? "Based on current portfolio holdings and current weights. This is not a reconstruction of what the portfolio held in past years."
            : "Average historical return by calendar period, from adjusted closes. Not a forecast."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label="Period">
          <Chip on={kind === "monthly"} onClick={() => setKind("monthly")}>
            Monthly
          </Chip>
          <Chip on={kind === "quarterly"} onClick={() => setKind("quarterly")}>
            Quarterly
          </Chip>
        </div>
        <div className="flex gap-1" role="group" aria-label="Lookback">
          {LOOKBACKS.map((n) => (
            <Chip key={n} on={lookback === n} onClick={() => setLookback(n)} aria-pressed={lookback === n}>
              {n}Y
            </Chip>
          ))}
        </div>
      </div>

      <div className="max-w-xl">
        <div className="mb-1 flex items-baseline justify-between gap-3 text-[12px] text-muted">
          <span>Historical window</span>
          <span className="font-mono tabular text-fg">
            {view ? `${view.windowStart}–${view.windowEnd}` : "—"}
          </span>
        </div>
        <input
          type="range"
          min={bounds?.minEnd ?? 0}
          max={bounds?.maxEnd ?? 0}
          step={1}
          value={end}
          disabled={!bounds || bounds.minEnd >= bounds.maxEnd}
          aria-label="Historical window end year"
          aria-valuetext={view ? `${view.windowStart} to ${view.windowEnd}` : "Loading"}
          onChange={(e) => setWindowEnd(Number(e.target.value))}
          className="h-8 w-full cursor-pointer accent-chart disabled:cursor-default disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeCurrent} onChange={(e) => setIncludeCurrent(e.target.checked)} />
          Include current year
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          Compare with Nifty 50
        </label>
      </div>

      {q.isPending ? <p className="text-[13px] text-muted">Reading stored history. The window slider will not download it again.</p> : null}
      {q.isError ? (
        <p className="text-[13px] text-down">
          {q.error instanceof Error ? q.error.message : "History could not be read."}{" "}
          <button type="button" className="text-chart underline" onClick={() => void q.refetch()}>
            Retry
          </button>
        </p>
      ) : null}

      {view ? (
        <>
          <SeasonChart buckets={view.buckets} selected={pick} onSelect={setSelected} compare={compare} />
          {bucket ? <BucketRead bucket={bucket} compare={compare} kind={kind} /> : null}
          <p className="max-w-2xl text-[13px] leading-relaxed text-muted">{view.note}</p>
          <p className="text-[13px] text-fg">{DISCLAIMER}</p>
          <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Coverage" value={view.coveragePct == null ? "—" : `${view.coveragePct.toFixed(0)}%`} hint={`${view.observed} of ${view.expected} periods`} />
            <Stat label="First close" value={view.firstDay || "—"} hint={view.lastDay ? `through ${view.lastDay}` : "No series"} />
            <Stat label="Years in store" value={String(view.yearsAvailable)} hint={`${lookback}Y selected`} />
            <Stat label="Method" value={`v${SEASON_VERSION}`} hint="Adjusted month-end and quarter-end" />
          </dl>
          {portView ? (
            <p className="max-w-2xl text-[13px] leading-relaxed text-muted">
              {coveredNames}/{q.data?.series.length || 0} holdings have a return inside {view.windowStart}–{view.windowEnd}. {portView.method}
            </p>
          ) : null}
          {compare && !q.data?.benchmark?.monthly.length ? (
            <p className="text-[13px] text-muted">Nifty 50 history was not available. The comparison was not invented.</p>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-sm px-2.5 text-[13px] text-muted shadow-[var(--shadow-border)] hover:text-fg disabled:opacity-40"
          disabled={busy != null}
          onClick={() => void refresh()}
        >
          {busy === "refresh" ? "Refreshing…" : "Refresh stored history"}
        </button>
        <AIButton busy={busy === "ai"} busyLabel="Checking sources…" disabled={!targets.length || busy != null} onClick={() => void recover()}>
          · Look up missing closes
        </AIButton>
        <p className="max-w-xl text-[12px] leading-relaxed text-muted">
          {!view
            ? "History is still loading. AI is not asked until you request a specific missing month."
            : targets.length
              ? `Up to ${targets.length} missing month-end close${targets.length === 1 ? "" : "s"} can be checked. A price is kept only with a source.`
              : "No specific missing month in this window. A 10-year history is not invented."}
        </p>
      </div>
      {note ? <p className="text-[12px] leading-relaxed text-muted">{note}</p> : null}

      {q.data ? <DataHealth rows={q.data.series} version={q.data.version} /> : null}
    </section>
  );
}

function Chip({
  on,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { on: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-sm px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart",
        on ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
      <div className="text-[11px] tracking-[0.06em] text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-[15px] tabular">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

function BucketRead({ bucket, compare, kind }: { bucket: SeasonBucket; compare: boolean; kind: SeasonKind }) {
  const n = bucket.observations;
  const pos = n && bucket.positivePct != null ? Math.round((bucket.positivePct / 100) * n) : 0;
  const unit = kind === "monthly" ? bucket.label : bucket.label;
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]" aria-live="polite">
      <h3 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{unit}</h3>
      {n === 0 ? (
        <p className="mt-2 text-[13px] text-muted">No completed observations in this window. A missing period is not shown as zero.</p>
      ) : (
        <dl className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div>
            <dt className="text-[11px] text-subtle uppercase">Average</dt>
            <dd className={cn("font-mono text-lg tabular", (bucket.avg || 0) >= 0 ? "text-up" : "text-down")}>{fmtPct(bucket.avg)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-subtle uppercase">Median</dt>
            <dd className={cn("font-mono text-lg tabular", (bucket.median || 0) >= 0 ? "text-up" : "text-down")}>{fmtPct(bucket.median)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-subtle uppercase">Positive periods</dt>
            <dd className="font-mono text-lg tabular">
              {pos} of {n}
              <span className="ml-1 text-[13px] text-muted">{bucket.positivePct == null ? "" : `(${bucket.positivePct.toFixed(0)}%)`}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-subtle uppercase">Observations</dt>
            <dd className="font-mono text-lg tabular">{n}</dd>
          </div>
        </dl>
      )}
      {compare ? (
        <p className="mt-2 text-[12px] text-muted">
          Nifty 50 average {bucket.benchAvg == null ? "not available for this period" : fmtPct(bucket.benchAvg)}. Secondary. Same method.
        </p>
      ) : null}
    </div>
  );
}

function SeasonChart({
  buckets,
  selected,
  onSelect,
  compare,
}: {
  buckets: SeasonBucket[];
  selected: number;
  onSelect: (i: number) => void;
  compare: boolean;
}) {
  const theme = useKosh((s) => s.theme);
  const chrome = plotChrome(theme);
  const W = 720;
  const H = 232;
  const PL = 46;
  const PR = 10;
  const PT = 12;
  const PB = 28;
  const vals = buckets.flatMap((b) => [b.avg, compare ? b.benchAvg : null].filter((n): n is number => n != null && Number.isFinite(n)));
  let lo = Math.min(0, ...vals);
  let hi = Math.max(0, ...vals);
  if (!(hi > lo)) {
    lo = -1;
    hi = 1;
  }
  const pad = (hi - lo) * 0.14;
  lo -= pad;
  hi += pad;
  const yOf = (v: number) => PT + ((hi - v) / (hi - lo)) * (H - PT - PB);
  const zero = yOf(0);
  const n = buckets.length || 1;
  const slot = (W - PL - PR) / n;
  const bw = Math.max(6, slot * 0.62);
  const step = (hi - lo) > 40 ? 10 : (hi - lo) > 16 ? 5 : (hi - lo) > 8 ? 2 : 1;
  const marks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-6 && marks.length < 6; v += step) marks.push(Math.round(v * 100) / 100);

  return (
    <div className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-subtle">
        <span>Average return</span>
        {compare ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-3.5" style={{ background: BENCH_STROKE }} />
            Nifty 50
          </span>
        ) : null}
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label="Seasonality averages">
          {marks.map((v) => (
            <g key={v}>
              <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke={v === 0 ? chrome.zeroStroke : chrome.gridStroke} strokeWidth={v === 0 ? 1.25 : 1} />
              <text x={PL - 6} y={yOf(v)} fill={chrome.tickFill} fontSize="10" fontFamily="IBM Plex Mono, ui-monospace, monospace" textAnchor="end" dominantBaseline="middle">
                {v > 0 ? `+${v}` : v}%
              </text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const cx = PL + slot * i + slot / 2;
            if (b.avg == null) return null;
            const y = yOf(b.avg);
            const top = Math.min(y, zero);
            const h = Math.max(1.5, Math.abs(zero - y));
            const up = b.avg >= 0;
            return (
              <rect
                key={b.label}
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={h}
                rx={1}
                fill={up ? "var(--k-up)" : "var(--k-down)"}
                fillOpacity={selected === i ? 1 : 0.82}
                stroke={selected === i ? "var(--k-fg)" : "none"}
                strokeWidth={selected === i ? 1.25 : 0}
              />
            );
          })}
          {compare
            ? buckets.map((b, i) => {
                if (b.benchAvg == null) return null;
                const cx = PL + slot * i + slot / 2;
                const y = yOf(b.benchAvg);
                return <line key={`b-${b.label}`} x1={cx - bw / 2} x2={cx + bw / 2} y1={y} y2={y} stroke={BENCH_STROKE} strokeWidth={2} />;
              })
            : null}
          {buckets.map((b, i) => (
            <text
              key={`l-${b.label}`}
              x={PL + slot * i + slot / 2}
              y={H - 8}
              fill={chrome.tickFill}
              fontSize="10"
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              textAnchor="middle"
            >
              {b.label}
            </text>
          ))}
        </svg>
        <div className="absolute inset-0" style={{ left: `${(PL / W) * 100}%`, right: `${(PR / W) * 100}%`, top: `${(PT / H) * 100}%`, bottom: `${(PB / H) * 100}%` }}>
          <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {buckets.map((b, i) => {
              const pos = b.observations && b.positivePct != null ? Math.round((b.positivePct / 100) * b.observations) : 0;
              const label =
                b.avg == null
                  ? `${b.label}, no observations. Not shown as zero.`
                  : `${b.label}, average ${fmtPct(b.avg)}, median ${fmtPct(b.median)}, positive ${pos} of ${b.observations}`;
              return (
                <button
                  key={b.label}
                  type="button"
                  aria-pressed={selected === i}
                  aria-label={label}
                  onMouseEnter={() => onSelect(i)}
                  onFocus={() => onSelect(i)}
                  onClick={() => onSelect(i)}
                  className="h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-chart"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataHealth({ rows, version }: { rows: SeasonSeries[]; version: number }) {
  return (
    <details className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <summary className="cursor-pointer text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Data health</summary>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        Daily adjusted closes stored in Kosh. Method v{version}. A direct market print outranks an AI-researched close. Conflicts stay on record and are not averaged away.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="kosh-table w-full text-left text-[12px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-2 py-1.5 font-medium">Symbol</th>
              <th className="px-2 py-1.5 font-medium">First</th>
              <th className="px-2 py-1.5 font-medium">Last</th>
              <th className="px-2 py-1.5 font-medium text-right">Sessions</th>
              <th className="px-2 py-1.5 font-medium text-right">Months</th>
              <th className="px-2 py-1.5 font-medium text-right">AI</th>
              <th className="px-2 py-1.5 font-medium text-right">Conflicts</th>
              <th className="px-2 py-1.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const m = coverage(r.monthly);
              return (
                <tr key={r.symbol}>
                  <td className="px-2 py-1.5 font-mono">{r.symbol}</td>
                  <td className="px-2 py-1.5 font-mono">{r.firstDay || "—"}</td>
                  <td className="px-2 py-1.5 font-mono">{r.lastDay || "—"}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular">{r.sessions}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular">
                    {m.observed}/{m.expected}
                    {m.missing ? ` · ${m.missing} missing` : ""}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular">{r.aiDays || 0}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular">{r.conflicts || 0}</td>
                  <td className="px-2 py-1.5 text-muted">{r.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.some((r) => r.note) ? (
        <ul className="mt-3 grid gap-1 text-[12px] text-muted">
          {rows.filter((r) => r.note).map((r) => (
            <li key={r.symbol}>
              <span className="font-mono text-fg">{r.symbol}</span> — {r.note}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
