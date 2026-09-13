import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { apiNote, apiOhlc, type NoteResult } from "@/lib/kosh/api";
import type { ChartFactsIn, StructureMode } from "@/lib/kosh/ai-kinds";
import { asStructure } from "@/lib/kosh/note-shape";
import { chartStructure } from "@/lib/kosh/ohlc";
import { AnalysisSkeleton, StructureView } from "@/components/analysis-view";
import { fetchSpec } from "@/components/charts/candle-chart";
import { Button } from "@/components/ui/button";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const MODES: { id: StructureMode; label: string; hint: string }[] = [
  { id: "intraday", label: "Intraday", hint: "15m" },
  { id: "swing", label: "Swing", hint: "1D" },
  { id: "positional", label: "Positional", hint: "1W" },
  { id: "chart", label: "Chart TF", hint: "Matches the chart" },
];

const MODE_TF: Record<Exclude<StructureMode, "chart">, string> = {
  intraday: "15m",
  swing: "1D",
  positional: "1W",
};

function modeTitle(mode: StructureMode, tf: string) {
  const label = MODES.find((m) => m.id === mode)?.label || "Chart TF";
  return `${label} · ${tf}`;
}

export function StructureDesk({ symbol }: { symbol: string }) {
  const chartTf = useKosh((s) => s.chartPrefs.interval);
  const [mode, setMode] = useState<StructureMode>("chart");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<NoteResult | null>(null);
  const tf = mode === "chart" ? chartTf || "1D" : MODE_TF[mode];
  const spec = fetchSpec(tf);
  const ohlc = useQuery({
    queryKey: ["ohlc", symbol, spec.range, spec.interval],
    queryFn: () => apiOhlc(symbol, spec.range, spec.interval),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
  const chart: ChartFactsIn | undefined = useMemo(() => {
    const bars = ohlc.data && !ohlc.data.missing ? ohlc.data.bars : [];
    if (bars.length < 20) return { interval: tf, lookback: tf, mode, last: ohlc.data?.price };
    const sliced = bars.slice(-320);
    const st = chartStructure(sliced.length >= 20 ? sliced : bars);
    return {
      interval: tf,
      lookback: tf,
      last: ohlc.data?.price,
      rsi: st.rsi,
      swings: st.named.map((s) => ({ label: s.label, price: s.price, t: s.t })),
      levels: st.clusters.slice(0, 8),
      mtf: st.mtf.slice(0, 6),
      mode,
    };
  }, [ohlc.data, tf, mode]);

  async function run() {
    setOpen(true);
    setBusy(true);
    try {
      const r = await apiNote({ kind: "structure", symbol, chart });
      setRes(r);
    } catch (e) {
      setRes({ ok: false, error: e instanceof Error ? e.message : "Could not run." });
    } finally {
      setBusy(false);
    }
  }

  const block = res && res.ok ? res.structureBlock || asStructure(res.text) : null;
  const header = modeTitle(mode, tf);

  return (
    <section>
      <button
        type="button"
        onClick={() => {
          if (open && block) setOpen(false);
          else void run();
        }}
        disabled={busy}
        className={cn(
          "w-full rounded-lg border-l-[4px] border-l-chart bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
          open && "ring-1 ring-chart/40",
        )}
      >
        <div className="text-[11px] font-semibold tracking-[0.14em] text-chart uppercase">Structure</div>
        <h3 className="mt-1.5 text-[20px] font-semibold tracking-tight">What is the chart doing?</h3>
        <p className="mt-1 max-w-md text-[13px] leading-snug text-muted">
          Pick a horizon. Two-word call, S/R table, HH/HL. Not a paragraph.
        </p>
        <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-sm bg-accent px-3 text-[13px] font-medium text-accent-fg">
          {busy ? "Reading…" : open ? "Hide" : "Read structure"}
          <ArrowRight className="size-3.5" />
        </span>
      </button>
      <div className="mt-2 flex flex-wrap gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            onClick={() => setMode(m.id)}
            className={cn(
              "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
              mode === m.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[12px] text-muted">{header}</p>
      {busy ? (
        <div className="mt-3">
          <AnalysisSkeleton kicker="structure" />
        </div>
      ) : null}
      {open && res && !res.ok ? <p className="mt-3 text-[13px] text-down">{res.error}</p> : null}
      {open && block ? (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{header}</div>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run()}>
              Refresh
            </Button>
          </div>
          <StructureView block={block} />
        </div>
      ) : null}
    </section>
  );
}
