import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fmtPct } from "@/lib/kosh/engine";
import type { FlowBar, FlowFrame, FlowVerdict } from "@/lib/kosh/market-flows";
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
  nifty: { symbol: string; source: string; missingSessions: number };
  daily: FlowBar[];
  weekly: FlowBar[];
  monthly: FlowBar[];
  verdicts: Record<FlowFrame, FlowVerdict | null>;
  analogue: { ok: false; reason: string } | { ok: true; matches: { end: string; distance: number; forward20: number | null }[] };
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
      if (!res.ok) throw new Error("flows");
      return (await res.json()) as FlowPack;
    },
    staleTime: 10 * 60_000,
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
  const pack = q.data;
  const bars = pack ? pack[frame].slice(-24) : [];
  const verdict = pack?.verdicts[frame];
  const latest = bars[bars.length - 1];
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
                <Metric label="Index return" value={latest?.indexReturn == null ? "—" : fmtPct(latest.indexReturn)} down={(latest?.indexReturn || 0) < 0} note="This window" />
                <Metric label="FII/FPI net" value={cr(latest?.fiiNet)} down={(latest?.fiiNet || 0) < 0} note="Net cash" />
                <Metric label="DII net" value={cr(latest?.diiNet)} down={(latest?.diiNet || 0) < 0} note="Net cash" />
                <Metric label="Flow balance" value={cr((latest?.fiiNet || 0) + (latest?.diiNet || 0))} down={!!latest && latest.fiiNet + latest.diiNet < 0} note="FII + DII · derived" />
              </div>
              {verdict ? (
                <div className="mt-2 rounded-sm bg-surface-2 px-3 py-2">
                  <div className="text-[12px] font-medium">{verdict.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{verdict.text}</p>
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-muted">{pack.analogue.ok ? "Comparable windows are on the full page." : pack.analogue.reason}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-[10px] text-subtle">
              {pack.source.status} · {pack.source.latest || "no date"} · {pack.source.sessions} sessions from {pack.source.from || "—"}
            </p>
            <Link to="/markets/flows" className="inline-flex h-8 items-center rounded-sm bg-fg px-3 text-[12px] text-bg">
              Open full analysis
            </Link>
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
  { id: "Max", days: 0 },
] as const;

export function MarketFlowsPage() {
  const q = useFlows();
  const [frame, setFrame] = useState<FlowFrame>("daily");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("3M");
  const [showIndex, setShowIndex] = useState(true);
  const [showFii, setShowFii] = useState(true);
  const [showDii, setShowDii] = useState(true);
  const [style, setStyle] = useState<ChartStyle>("combined");
  const [mode, setMode] = useState<"kosh" | "ai">("kosh");
  const [note, setNote] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const pack = q.data;
  const bars = useMemo(() => {
    if (!pack) return [];
    const all = pack[frame];
    const picked = RANGES.find((item) => item.id === range) || RANGES[1];
    if (!picked.days || !pack.source.latest) return all;
    const cut = shift(pack.source.latest, picked.days);
    return all.filter((bar) => bar.end >= cut);
  }, [pack, frame, range]);
  const latest = bars[bars.length - 1];
  const verdict = pack?.verdicts[frame];

  async function ask() {
    setAsking(true);
    setNoteError(null);
    try {
      const res = await fetch("/api/market-flows", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      if (!data.ok || !data.text) setNoteError(data.error || "The model did not answer.");
      else setNote(data.text);
    } catch {
      setNoteError("The model did not answer.");
    } finally {
      setAsking(false);
    }
  }

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
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Metric label="Nifty 50 · return" value={latest?.indexReturn == null ? "—" : fmtPct(latest.indexReturn)} down={(latest?.indexReturn || 0) < 0} note={latest?.label || "Window"} />
            <Metric label="FII/FPI · net cash" value={cr(latest?.fiiNet)} down={(latest?.fiiNet || 0) < 0} note={`${latest?.sessions || 0} sessions summed`} />
            <Metric label="DII · net cash" value={cr(latest?.diiNet)} down={(latest?.diiNet || 0) < 0} note="Sum of daily nets" />
            <Metric label="Combined net" value={cr((latest?.fiiNet || 0) + (latest?.diiNet || 0))} down={!!latest && latest.fiiNet + latest.diiNet < 0} note="Derived sum, not total market flow" />
          </div>
          <section className="mt-3 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold">Index and institutional flows</h2>
                <p className="mt-1 text-[11px] text-subtle">One chart. Left axis is Nifty rebased to 100. Right axis is net cash flow in ₹ crore. The axes are labelled so the two units are not read as one scale.</p>
              </div>
              <label className="text-[11px] text-muted">
                Range
                <select aria-label="History range" value={range} onChange={(event) => setRange(event.target.value as typeof range)} className="ml-2 h-8 rounded-sm bg-bg px-2 shadow-[var(--shadow-border)]">
                  {RANGES.map((item) => {
                    const covered = !item.days || (pack.source.from != null && pack.source.latest != null && pack.source.from <= shift(pack.source.latest, item.days));
                    return (
                      <option key={item.id} value={item.id} disabled={!covered}>
                        {item.id}
                        {covered ? "" : " · not in file"}
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
              <label><input type="checkbox" checked={showFii} onChange={(event) => setShowFii(event.target.checked)} /> FII/FPI</label>
              <label><input type="checkbox" checked={showDii} onChange={(event) => setShowDii(event.target.checked)} /> DII</label>
            </div>
            <FlowTable bars={bars} />
          </section>
          <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
            <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="flex gap-1">
                <button type="button" className={cn("h-8 rounded-sm px-2 text-[12px]", mode === "kosh" ? "bg-fg text-bg" : "bg-surface-2")} onClick={() => setMode("kosh")}>
                  Kosh analysis
                </button>
                <button type="button" className={cn("h-8 rounded-sm px-2 text-[12px]", mode === "ai" ? "bg-fg text-bg" : "bg-surface-2")} onClick={() => setMode("ai")}>
                  AI note
                </button>
              </div>
              {mode === "kosh" && verdict ? (
                <div className="mt-3 text-[13px] leading-relaxed text-muted">
                  <p className="font-medium text-fg">{verdict.title}</p>
                  <p className="mt-2">{verdict.text}</p>
                  <p className="mt-2">Foreign flow is {verdict.fii}. Domestic flow is {verdict.dii}. The index window is {verdict.index}. A recovery is not confirmed from this window alone.</p>
                </div>
              ) : null}
              {mode === "ai" ? (
                <div className="mt-3">
                  <p className="text-[13px] text-muted">Grok only sees the figures already on this page. It does not run until you ask.</p>
                  <button type="button" className="mt-2 h-8 rounded-sm bg-fg px-3 text-[12px] text-bg" disabled={asking} onClick={() => void ask()}>
                    {asking ? "Reading the file…" : "Ask for a note"}
                  </button>
                  {noteError ? <p className="mt-2 text-[13px] text-down">{noteError}</p> : null}
                  {note ? <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-fg">{note}</p> : null}
                </div>
              ) : null}
            </div>
            <aside className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
              <h2 className="text-[13px] font-semibold">Historical context</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{pack.analogue.ok ? `${pack.analogue.matches.length} non-overlapping windows.` : pack.analogue.reason}</p>
              <h2 className="mt-4 text-[13px] font-semibold">Data</h2>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-[12px]">
                <dt className="text-subtle">Latest session</dt>
                <dd>{pack.source.latest}</dd>
                <dt className="text-subtle">Coverage</dt>
                <dd>{pack.source.from} – {pack.source.latest}</dd>
                <dt className="text-subtle">Status</dt>
                <dd>{pack.source.status}</dd>
                <dt className="text-subtle">Nifty gaps</dt>
                <dd>{pack.nifty.missingSessions}</dd>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-subtle">{pack.source.note}</p>
            </aside>
          </section>
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
            <th className="py-1 pr-2 text-right font-medium">Nifty</th>
            <th className="py-1 pr-2 text-right font-medium">FII/FPI</th>
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
  const indexed = useMemo(() => {
    const base = bars.find((bar) => bar.indexEnd != null)?.indexEnd || null;
    return bars.map((bar) => (base && bar.indexEnd ? (bar.indexEnd / base) * 100 : null));
  }, [bars]);
  const idxVals = indexed.filter((value): value is number => value != null);
  const idxPad = Math.max(0.4, (Math.max(...idxVals, 100) - Math.min(...idxVals, 100)) * 0.08);
  const idxMin = Math.min(...idxVals, 100) - idxPad;
  const idxMax = Math.max(...idxVals, 100) + idxPad;
  const flowMax = Math.max(1, ...bars.flatMap((bar) => [showFii ? Math.abs(bar.fiiNet) : 0, showDii ? Math.abs(bar.diiNet) : 0]));
  const n = Math.max(bars.length, 1);
  const slot = plotW / n;
  const yIndex = (value: number) => top + ((idxMax - value) / Math.max(0.01, idxMax - idxMin)) * plotH;
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
  const indexLine = lineOf(indexed, yIndex);
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
        {axisTicks(idxMin, idxMax).map((value) => (
          <g key={`y-${value}`}>
            <line x1={left} y1={yIndex(value)} x2={width - right} y2={yIndex(value)} stroke="var(--color-chart-grid)" />
            <text x={left - 6} y={yIndex(value) + 3} textAnchor="end" fontSize="10" fill="var(--color-subtle)">
              {value.toFixed(0)}
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
          Index = 100
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
              {style === "bar" && showIndex && indexed[index] != null ? (
                <rect x={x - 0.6} y={Math.min(yIndex(indexed[index] as number), yIndex(100))} width={1.2} height={Math.max(1, Math.abs(yIndex(indexed[index] as number) - yIndex(100)))} fill="var(--color-chart)" />
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
        <span>Left · Nifty, start = 100</span>
        <span className="text-down">FII/FPI net</span>
        <span className="text-up">DII net</span>
      </div>
      {active ? (
        <div className="mt-1 font-mono text-[11px] text-muted tabular">
          {shortDate(active.end)}
          {active.end !== active.start ? ` · ${shortDate(active.start)} to ${shortDate(active.end)}` : ""} · Nifty {active.indexReturn == null ? "—" : fmtPct(active.indexReturn)} · FII {cr(active.fiiNet)} · DII {cr(active.diiNet)}
          {active.partial ? " · partial" : ""}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-subtle">Hover a date. Index and flows share this chart, not the same unit.</p>
      )}
    </div>
  );
}
