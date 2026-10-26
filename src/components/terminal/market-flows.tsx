import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { flowBrief } from "@/lib/kosh/flow-brief";
import type { FlowBar, FlowFrame, FlowVerdict } from "@/lib/kosh/market-flows";
import type { ResearchBrief } from "@/lib/kosh/flow-research";
import { FlowDeskPanel } from "@/components/terminal/flow-desk-panel";
import { cn } from "@/lib/utils";

type FlowPack = {
  unavailable: string | null;
  source: {
    name: string;
    url: string;
    page: string;
    note: string;
    status: string;
    retrievedAt: string;
    from: string | null;
    latest: string | null;
    sessions: number;
  };
  nifty: { symbol: string; source: string; missingSessions: number; from?: string | null; to?: string | null; sessions?: number };
  coverage?: { mismatches?: number } | null;
  health?: {
    status: "fresh" | "updating" | "delayed" | "unavailable";
    latest: string | null;
    expected: string | null;
    lastSuccess: string | null;
    sourceName: string;
    failure: string | null;
  };
  daily: FlowBar[];
  weekly: FlowBar[];
  monthly: FlowBar[];
  verdicts: Record<FlowFrame, FlowVerdict | null>;
  analogue: { ok: false; reason: string } | { ok: true; matches: { end: string; distance: number; forward20: number | null }[]; note?: string };
  research?: ResearchBrief;
};

const FRAMES: { id: FlowFrame; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

function useFlows() {
  return useQuery({
    queryKey: ["market-flows"],
    queryFn: async () => {
      const res = await fetch("/api/market-flows");
      const data = (await res.json().catch(() => null)) as FlowPack | null;
      if (!res.ok || !data || !data.source) throw new Error("flows");
      return data;
    },
    retry: 2,
    staleTime: 60_000,
  });
}

function cr(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  const body = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (n > 0) return "+₹" + body + " Cr";
  if (n < 0) return "−₹" + body + " Cr";
  return "₹0 Cr";
}

function FrameSwitch({ value, onChange }: { value: FlowFrame; onChange: (frame: FlowFrame) => void }) {
  return (
    <div className="flex rounded-sm bg-surface-2 p-0.5" role="tablist" aria-label="Flow timeframe">
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          type="button"
          role="tab"
          aria-selected={value === frame.id}
          className={cn("h-7 rounded-sm px-2.5 text-[11px]", value === frame.id ? "bg-bg text-fg" : "text-muted")}
          onClick={() => onChange(frame.id)}
        >
          {frame.label}
        </button>
      ))}
    </div>
  );
}

export function MarketFlowsGlance() {
  const q = useFlows();
  const [frame, setFrame] = useState<FlowFrame>("daily");
  const [style, setStyle] = useState<ChartStyle>("combined");
  const [refreshing, setRefreshing] = useState(false);
  const pack = q.data;
  const brief = useMemo(
    () => flowBrief((pack?.daily || []).map((bar) => ({ date: bar.end, fiiNet: bar.fiiNet, diiNet: bar.diiNet, indexReturn: bar.indexReturn }))),
    [pack],
  );
  const bars = pack ? pack[frame].slice(-24) : [];
  const verdict = pack?.verdicts[frame];
  const latest = bars[bars.length - 1];
  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetch("/api/flows-refresh", { method: "POST" });
      await q.refetch();
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <section className="mt-4 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]" aria-label="Market flows">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">Market Flows & Pattern Intelligence</h2>
          <p className="mt-1 text-[12px] text-subtle">See whether institutional flows are supporting the market, and how similar setups evolved.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StyleSwitch value={style} onChange={setStyle} />
          <FrameSwitch value={frame} onChange={setFrame} />
        </div>
      </div>
      {q.isPending ? <p className="mt-3 text-[13px] text-muted">Loading the cash-flow file…</p> : null}
      {q.isError ? <p className="mt-3 text-[13px] text-down">The flow feed did not answer.</p> : null}
      {pack?.unavailable ? <p className="mt-3 text-[13px] text-muted">{pack.unavailable}</p> : null}
      {pack && !pack.unavailable ? (
        <>
          <div className="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)]">
            <FlowChart bars={bars} showIndex showFii showDii style={style} compact />
            <div>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Nifty return" value={latest?.indexReturn == null ? "—" : fmtPct(latest.indexReturn)} down={(latest?.indexReturn || 0) < 0} note={latest?.indexEnd == null ? "Close missing" : `Close ${fmtPx(latest.indexEnd)}`} />
                <Metric label="FII net" value={cr(latest?.fiiNet)} down={(latest?.fiiNet || 0) < 0} note="Net cash" />
                <Metric label="DII net" value={cr(latest?.diiNet)} down={(latest?.diiNet || 0) < 0} note="Net cash" />
                <Metric label="Flow balance" value={cr((latest?.fiiNet || 0) + (latest?.diiNet || 0))} down={!!latest && latest.fiiNet + latest.diiNet < 0} note="FII + DII · derived" />
              </div>
              {brief.facts.length ? (
                <div className="mt-2 rounded-sm bg-surface-2 px-3 py-2">
                  <div className="text-[11px] font-medium text-subtle">From the cash file</div>
                  <ul className="mt-1 space-y-1 text-[11px] leading-relaxed text-muted">
                    {brief.facts.slice(0, 3).map((fact) => (
                      <li key={fact.id}>{fact.text}</li>
                    ))}
                  </ul>
                </div>
              ) : verdict ? (
                <div className="mt-2 rounded-sm bg-surface-2 px-3 py-2">
                  <div className="text-[12px] font-medium">{verdict.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{verdict.text}</p>
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-muted">{pack.research ? "The full note ranks this month against earlier months and shows what those months did next." : pack.analogue.ok ? "Comparable windows are on the full page." : pack.analogue.reason}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-[10px] text-subtle">
              {pack.health?.status || pack.source.status} · cash {pack.source.from || "—"} to {pack.health?.latest || pack.source.latest || "—"}
              {pack.health?.expected ? ` · expected ${pack.health.expected}` : ""} · {pack.source.sessions} sessions
              {pack.health?.status === "delayed" ? " · stored rows kept, newer session missing" : ""}
              {pack.nifty.from ? ` · Nifty closes ${pack.nifty.from} to ${pack.nifty.to} (${pack.nifty.sessions}), only joined on flow dates` : ""}
            </p>
            <div className="flex gap-2">
              <button type="button" className="inline-flex h-8 items-center rounded-sm border border-border px-3 text-[12px] text-muted disabled:opacity-50" disabled={refreshing} onClick={() => void refresh()}>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <Link to="/markets/flows" className="inline-flex h-8 items-center rounded-sm bg-fg px-3 text-[12px] text-bg">
                Open full analysis
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value, down, note }: { label: string; value: string; down: boolean; note: string }) {
  return (
    <div className="rounded-sm bg-surface-2 px-2.5 py-2">
      <div className="text-[10px] text-subtle">{label}</div>
      <div className={cn("mt-1 font-mono text-[14px] tabular", value === "—" ? "text-muted" : down ? "text-down" : "text-up")}>{value}</div>
      <div className="mt-0.5 text-[10px] text-subtle">{note}</div>
    </div>
  );
}

const RANGES = [
  { id: "1M", days: 31 },
  { id: "3M", days: 92 },
  { id: "6M", days: 183 },
  { id: "1Y", days: 366 },
  { id: "3Y", days: 1100 },
  { id: "5Y", days: 1830 },
  { id: "All", days: 0 },
] as const;

export function MarketFlowsPage() {
  const q = useFlows();
  const [frame, setFrame] = useState<FlowFrame>("daily");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("3M");
  const [showIndex, setShowIndex] = useState(true);
  const [showFii, setShowFii] = useState(true);
  const [showDii, setShowDii] = useState(true);
  const [style, setStyle] = useState<ChartStyle>("combined");
  const pack = q.data;
  const bars = useMemo(() => {
    if (!pack) return [];
    const all = pack[frame];
    const picked = RANGES.find((item) => item.id === range) || RANGES[1];
    if (!picked.days || !pack.source.latest) return all;
    const cut = shift(pack.source.latest, picked.days);
    return all.filter((bar) => bar.end >= cut);
  }, [pack, frame, range]);

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-4 sm:px-4">
      <p className="text-[12px] text-subtle">
        <Link to="/markets" search={{ view: "overview" }} className="hover:text-fg">
          Market Overview
        </Link>
        <span className="mx-1.5">/</span>
        Market Flows
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Market Flows & Pattern Intelligence</h1>
          <p className="mt-1 max-w-xl text-[13px] text-muted">Whether institutional cash flows are moving with Nifty, and what this file can and cannot say about the past.</p>
        </div>
      </div>
      {q.isPending ? <p className="mt-4 text-[13px] text-muted">Loading the cash-flow file…</p> : null}
      {pack?.unavailable ? <p className="mt-4 text-[13px] text-muted">{pack.unavailable}</p> : null}
      {pack && !pack.unavailable ? (
        <>
          <p className="mt-3 text-[11px] text-subtle">
            {pack.source.status} · latest session {pack.source.latest} · retrieved {pack.source.retrievedAt.slice(0, 16).replace("T", " ")} UTC ·{" "}
            <a href={pack.source.page} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              {pack.source.name}
            </a>
          </p>
          <FlowDeskPanel daily={pack.daily} retrievedAt={pack.source.retrievedAt} sourceName={pack.source.name} />
          <details className="mt-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <summary className="cursor-pointer text-[14px] font-semibold">Longer history</summary>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold">Index and institutional flows</h2>
                <p className="mt-1 text-[11px] text-subtle">One chart. Left axis is the Nifty 50 close in index points. Right axis is net cash flow in ₹ crore. The dashed line is zero for the flows. The two units are not the same scale.</p>
              </div>
              <label className="text-[11px] text-muted">
                Range
                <select aria-label="History range" value={range} onChange={(event) => setRange(event.target.value as typeof range)} className="ml-2 h-8 rounded-sm bg-bg px-2 shadow-[var(--shadow-border)]">
                  {RANGES.map((item) => {
                    const seriesStart = pack[frame][0]?.start;
                    const seriesEnd = pack[frame][pack[frame].length - 1]?.end || pack.source.latest;
                    const covered = !item.days || (seriesStart != null && seriesEnd != null && seriesStart <= shift(seriesEnd, item.days));
                    return (
                      <option key={item.id} value={item.id} disabled={!covered}>
                        {item.id === "All" ? "All stored" : item.id}
                        {covered ? "" : " · not stored"}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <FrameSwitch value={frame} onChange={setFrame} />
              <StyleSwitch value={style} onChange={setStyle} />
            </div>
            <div className="mt-3">
              <FlowChart bars={bars} showIndex={showIndex} showFii={showFii} showDii={showDii} style={style} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
              <label><input type="checkbox" checked={showIndex} onChange={(event) => setShowIndex(event.target.checked)} /> Index</label>
              <label><input type="checkbox" checked={showFii} onChange={(event) => setShowFii(event.target.checked)} /> FII net</label>
              <label><input type="checkbox" checked={showDii} onChange={(event) => setShowDii(event.target.checked)} /> DII</label>
            </div>
            <FlowTable bars={bars} />
          </details>
          {pack.research ? <ResearchNote brief={pack.research} /> : null}
        </>
      ) : null}
    </div>
  );
}

function shift(iso: string, days: number) {
  const date = new Date(iso + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function FlowTable({ bars }: { bars: FlowBar[] }) {
  const rows = bars.slice(-12).reverse();
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <caption className="sr-only">Flow windows</caption>
        <thead className="text-[10px] tracking-wide text-subtle uppercase">
          <tr>
            <th className="py-1 pr-2 font-medium">Window</th>
            <th className="py-1 pr-2 text-right font-medium">Sessions</th>
            <th className="py-1 pr-2 text-right font-medium">Nifty return</th>
            <th className="py-1 pr-2 text-right font-medium">FII net</th>
            <th className="py-1 text-right font-medium">DII</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bar) => (
            <tr key={bar.key} className="border-t border-border">
              <td className="py-1.5 pr-2">{bar.label}</td>
              <td className="py-1.5 pr-2 text-right font-mono tabular">{bar.sessions}</td>
              <td className="py-1.5 pr-2 text-right font-mono tabular">{bar.indexReturn == null ? "—" : fmtPct(bar.indexReturn)}</td>
              <td className="py-1.5 pr-2 text-right font-mono tabular">{cr(bar.fiiNet)}</td>
              <td className="py-1.5 text-right font-mono tabular">{cr(bar.diiNet)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ChartStyle = "combined" | "line" | "bar";

function ResearchNote({ brief }: { brief: ResearchBrief }) {
  return (
    <section className="mt-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[14px] font-semibold">Earlier months</h2>
      <div className="mt-3 space-y-5">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{brief.headline}</h2>
            <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-muted">
              {brief.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">Why this matters</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{brief.regime.evidence} {brief.regime.alternative}</p>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">Trend and flows</h3>
            <p className="mt-1 text-[13px] font-medium text-fg">{brief.regime.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{brief.synthesis}</p>
            <ul className="mt-2 space-y-1 text-[13px] text-muted">
              {brief.frames.map((frame) => (
                <li key={frame.id}>{frame.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">Historical comparisons</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{brief.history.note}</p>
            {brief.history.usable ? (
              <>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="text-[10px] tracking-wide text-subtle uppercase">
                      <tr>
                        <th className="py-1 pr-2 font-medium">After the month</th>
                        <th className="py-1 pr-2 text-right font-medium">Similar months</th>
                        <th className="py-1 pr-2 text-right font-medium">Ordinary month</th>
                        <th className="py-1 text-right font-medium">Sample</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brief.history.similar.map((row, index) => {
                        const base = brief.history.baseline[index];
                        return (
                          <tr key={row.label} className="border-t border-border">
                            <td className="py-1.5 pr-2">{row.label}</td>
                            <td className="py-1.5 pr-2 text-right font-mono tabular">{row.median == null ? "—" : fmtPct(row.median)} median · {row.positiveShare == null ? "—" : `${Math.round(row.positiveShare * 100)}% up`}</td>
                            <td className="py-1.5 pr-2 text-right font-mono tabular">{base?.median == null ? "—" : fmtPct(base.median)}</td>
                            <td className="py-1.5 text-right font-mono tabular">{row.n}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted">
                  {brief.history.examples.map((example) => (
                    <li key={example.end}>
                      <span className="text-fg">{example.end}</span>
                      {example.failed ? " · later declined" : ""} · FII {cr(example.fiiNet)} · DII {cr(example.diiNet)} · month {fmtPct(example.indexReturn)}. {example.difference} Next 4 weeks {example.forward.find((item) => item.label === "4 weeks")?.returnPct == null ? "—" : fmtPct(example.forward.find((item) => item.label === "4 weeks")?.returnPct || 0)}, worst point {example.forward.find((item) => item.label === "4 weeks")?.adversePct == null ? "—" : fmtPct(example.forward.find((item) => item.label === "4 weeks")?.adversePct || 0)}.
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[12px] leading-relaxed text-subtle">{brief.history.association}</p>
              </>
            ) : null}
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">What could happen next</h3>
            <div className="mt-2 space-y-3">
              {brief.scenarios.map((scenario) => (
                <div key={scenario.name}>
                  <p className="text-[13px] font-medium text-fg">{scenario.name}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{scenario.support} {scenario.against}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-subtle">Would strengthen it: {scenario.strengthen} Would knock it out: {scenario.invalidate}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">What to watch</h3>
            <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-muted">
              {brief.watch.map((item) => (
                <li key={item.variable}>
                  <span className="text-fg">{item.variable}.</span> Now: {item.now} A change that matters: {item.change} {item.effect}
                </li>
              ))}
            </ul>
          </div>
          <details className="text-[12px] leading-relaxed text-subtle">
            <summary className="cursor-pointer text-[13px] font-semibold text-fg">Methodology</summary>
            <ul className="mt-2 space-y-1">
              {brief.method.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </div>
    </section>
  );
}

function StyleSwitch({ value, onChange }: { value: ChartStyle; onChange: (style: ChartStyle) => void }) {
  const items: { id: ChartStyle; label: string }[] = [
    { id: "combined", label: "Combined" },
    { id: "line", label: "Line" },
    { id: "bar", label: "Bar" },
  ];
  return (
    <div className="flex rounded-sm bg-surface-2 p-0.5" role="tablist" aria-label="Chart style">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={cn("h-7 rounded-sm px-2.5 text-[11px]", value === item.id ? "bg-bg text-fg" : "text-muted")}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function shortDate(iso: string) {
  const [, month, day] = iso.split("-");
  const name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1] || "";
  return `${Number(day)} ${name}`;
}

function axisTicks(min: number, max: number) {
  const mid = (min + max) / 2;
  return [max, mid, min];
}

function FlowChart({
  bars,
  showIndex,
  showFii,
  showDii,
  style,
  compact = false,
}: {
  bars: FlowBar[];
  showIndex: boolean;
  showFii: boolean;
  showDii: boolean;
  style: ChartStyle;
  compact?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const height = compact ? 220 : 320;
  const left = 46;
  const right = 58;
  const top = 14;
  const bottom = height - 26;
  const plotW = width - left - right;
  const plotH = bottom - top;
  const closes = bars.map((bar) => bar.indexEnd).filter((value): value is number => value != null && value > 0);
  const pxPad = Math.max(1, (Math.max(...closes, 1) - Math.min(...closes, 1)) * 0.08);
  const pxMin = (closes.length ? Math.min(...closes) : 0) - pxPad;
  const pxMax = (closes.length ? Math.max(...closes) : 1) + pxPad;
  const flowMax = Math.max(1, ...bars.flatMap((bar) => [showFii ? Math.abs(bar.fiiNet) : 0, showDii ? Math.abs(bar.diiNet) : 0]));
  const n = Math.max(bars.length, 1);
  const slot = plotW / n;
  const yIndex = (value: number) => top + ((pxMax - value) / Math.max(1, pxMax - pxMin)) * plotH;
  const yFlow = (value: number) => top + plotH / 2 - (value / flowMax) * (plotH / 2 - 8);
  const zero = top + plotH / 2;
  const xOf = (index: number) => left + slot * index + slot / 2;
  const lineOf = (values: (number | null)[], scale: (value: number) => number) => {
    let started = false;
    const parts: string[] = [];
    values.forEach((value, index) => {
      if (value == null) return;
      parts.push(`${started ? "L" : "M"} ${xOf(index)} ${scale(value)}`);
      started = true;
    });
    return parts.join(" ");
  };
  const indexLine = lineOf(bars.map((bar) => bar.indexEnd), yIndex);
  const fiiLine = lineOf(bars.map((bar) => bar.fiiNet), yFlow);
  const diiLine = lineOf(bars.map((bar) => bar.diiNet), yFlow);
  const ticks = [0, Math.round((n - 1) / 2), n - 1].filter((value, index, all) => all.indexOf(value) === index);
  const active = hover != null ? bars[hover] : null;
  const flowLabel = (value: number) => {
    const abs = Math.abs(value);
    const body = abs >= 1000 ? `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k` : abs.toFixed(0);
    return `${value < 0 ? "−" : ""}${body}`;
  };
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className={compact ? "h-52 w-full" : "h-72 w-full"} role="img" aria-label="Nifty and cash flows on one chart">
        {axisTicks(pxMin, pxMax).map((value) => (
          <g key={`y-${value}`}>
            <line x1={left} y1={yIndex(value)} x2={width - right} y2={yIndex(value)} stroke="var(--color-chart-grid)" />
            <text x={left - 6} y={yIndex(value) + 3} textAnchor="end" fontSize="10" fill="var(--color-subtle)">
              {Math.round(value).toLocaleString("en-IN")}
            </text>
          </g>
        ))}
        <line x1={left} y1={zero} x2={width - right} y2={zero} stroke="var(--color-border)" strokeDasharray="3 3" />
        {[flowMax, 0, -flowMax].map((value) => (
          <text key={value} x={width - right + 6} y={yFlow(value) + 3} fontSize="10" fill="var(--color-subtle)">
            {flowLabel(value)}
          </text>
        ))}
        <text x={left} y={11} fontSize="10" fill="var(--color-subtle)">
          Nifty close
        </text>
        <text x={width - right} y={11} textAnchor="end" fontSize="10" fill="var(--color-subtle)">
          ₹ crore
        </text>
        {bars.map((bar, index) => {
          const x = xOf(index);
          const bw = Math.max(1.5, Math.min(6, slot * 0.22));
          const asBars = style !== "line";
          return (
            <g key={bar.key} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)}>
              <rect x={x - slot / 2} y={top} width={slot} height={plotH} fill="transparent" />
              {asBars && showFii ? (
                <rect x={x - bw - 0.5} y={Math.min(yFlow(bar.fiiNet), zero)} width={bw} height={Math.max(1, Math.abs(yFlow(bar.fiiNet) - zero))} fill="var(--color-down)" opacity={0.8} />
              ) : null}
              {asBars && showDii ? (
                <rect x={x + 0.5} y={Math.min(yFlow(bar.diiNet), zero)} width={bw} height={Math.max(1, Math.abs(yFlow(bar.diiNet) - zero))} fill="var(--color-up)" opacity={0.8} />
              ) : null}
            </g>
          );
        })}
        {style === "line" && showFii ? <path d={fiiLine} fill="none" stroke="var(--color-down)" strokeWidth="1.6" /> : null}
        {style === "line" && showDii ? <path d={diiLine} fill="none" stroke="var(--color-up)" strokeWidth="1.6" /> : null}
        {showIndex && style !== "bar" && indexLine ? <path d={indexLine} fill="none" stroke="var(--color-chart)" strokeWidth="2" /> : null}
        {ticks.map((index) => (
          <text key={bars[index]?.key || index} x={xOf(index)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--color-subtle)">
            {bars[index] ? shortDate(bars[index].end) : ""}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-subtle">
        {style !== "bar" ? (
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-chart" /> Nifty 50 close (index points)</span>
        ) : (
          <span>Bar view is the cash flows only. The index line is off.</span>
        )}
        <span className="inline-flex items-center gap-1.5"><span className="inline-block size-2 bg-down" /> FII net (₹ Cr)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block size-2 bg-up" /> DII net (₹ Cr)</span>
      </div>
      {active ? (
        <div className="mt-1 font-mono text-[11px] text-muted tabular">
          {shortDate(active.end)}
          {active.end !== active.start ? ` · ${shortDate(active.start)} to ${shortDate(active.end)}` : ""} · close {active.indexEnd == null ? "—" : fmtPx(active.indexEnd)} · return {active.indexReturn == null ? "—" : fmtPct(active.indexReturn)} · FII {cr(active.fiiNet)} · DII {cr(active.diiNet)}
          {active.partial ? " · partial window, not a full period" : ""}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-subtle">Hover a date. The left axis is the Nifty close. The right axis is ₹ crore. Zero is the dashed line. The units are not comparable.</p>
      )}
    </div>
  );
}
