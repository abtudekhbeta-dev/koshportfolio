import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavChart } from "@/components/charts/nav-chart";
import { ChartSkeleton, MetricLabel } from "@/components/metric";
import { mixCagr, pathFromBars, windowReturn, ytdReturn, fmtInr, fmtPct, mergeNav, riskMetrics, dash } from "@/lib/kosh/engine";
import { apiHistory } from "@/lib/kosh/api";
import { BENCH, resolveBench } from "@/lib/kosh/benchmarks";
import { metric as defOf } from "@/lib/kosh/metrics";
import { loadBook } from "@/lib/kosh/use-book";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MixPath, NavPoint, Portfolio, RiskMetrics, WindowPair } from "@/lib/kosh/types";

export const Route = createFileRoute("/compare")({ ssr: false, component: ComparePage });

type LegType = "port" | "stock" | "bench";
type Windows = { w1: WindowPair; m1: WindowPair; m3: WindowPair; m6: WindowPair; y1: WindowPair; ytd: WindowPair };
type Leg = {
  name: string;
  value?: number;
  mix: MixPath;
  windows: Windows;
  risk: RiskMetrics;
  cagr: number | null;
};

async function loadLeg(type: LegType, opts: { portId: string; stock: string; bench: string }, ports: Portfolio[]): Promise<Leg | null> {
  if (type === "port") {
    const p = ports.find((x) => x.id === opts.portId);
    if (!p) return null;
    const book = await loadBook(p, { sleeves: false });
    return {
      name: p.name,
      value: book.value,
      windows: book.windows,
      cagr: book.cagr,
      mix: book.mix,
      risk: book.risk,
    };
  }
  const spec = type === "stock" ? { symbol: opts.stock.trim(), name: opts.stock.trim() } : resolveBench(opts.bench);
  if (!spec.symbol) return null;
  const d = await apiHistory(spec.symbol, "max");
  const mix = pathFromBars(d.bars || [], []);
  return {
    name: type === "stock" ? d.name || spec.name : spec.name,
    value: type === "stock" ? d.price : undefined,
    windows: {
      w1: windowReturn(mix.nav, 7),
      m1: windowReturn(mix.nav, 31),
      m3: windowReturn(mix.nav, 93),
      m6: windowReturn(mix.nav, 186),
      y1: windowReturn(mix.nav, 365),
      ytd: ytdReturn(mix.nav),
    },
    cagr: mixCagr(mix.nav),
    mix,
    risk: riskMetrics(mix.nav),
  };
}

const RETURN_ROWS: { id: string; pick: (l: Leg) => number | null }[] = [
  { id: "w1", pick: (l) => l.windows.w1.port },
  { id: "m1", pick: (l) => l.windows.m1.port },
  { id: "m3", pick: (l) => l.windows.m3.port },
  { id: "m6", pick: (l) => l.windows.m6.port },
  { id: "y1", pick: (l) => l.windows.y1.port },
  { id: "ytd", pick: (l) => l.windows.ytd.port },
  { id: "cagr", pick: (l) => l.cagr },
];

const RISK_ROWS: { id: string; pick: (l: Leg) => number | null; fmt: (n: number) => string }[] = [
  { id: "sharpe", pick: (l) => l.risk.sharpe, fmt: (n) => n.toFixed(2) },
  { id: "sortino", pick: (l) => l.risk.sortino, fmt: (n) => n.toFixed(2) },
  { id: "alpha", pick: (l) => l.risk.alpha, fmt: (n) => fmtPct(n) },
  { id: "beta", pick: (l) => l.risk.beta, fmt: (n) => n.toFixed(2) },
  { id: "corr", pick: (l) => l.risk.corr, fmt: (n) => n.toFixed(2) },
  { id: "vol", pick: (l) => l.risk.vol, fmt: (n) => n.toFixed(1) + "%" },
  { id: "maxDd", pick: (l) => l.risk.maxDd, fmt: (n) => n.toFixed(1) + "%" },
  { id: "upCap", pick: (l) => l.risk.upCap, fmt: (n) => (n * 100).toFixed(0) + "%" },
  { id: "downCap", pick: (l) => l.risk.downCap, fmt: (n) => (n * 100).toFixed(0) + "%" },
  { id: "info", pick: (l) => l.risk.info, fmt: (n) => n.toFixed(2) },
  { id: "calmar", pick: (l) => l.risk.calmar, fmt: (n) => n.toFixed(2) },
];

function winnerOf(a: number | null, b: number | null, better: 1 | -1 | 0): "a" | "b" | "tie" | null {
  if (better === 0) return null;
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a - b) < 1e-6) return "tie";
  if (better === 1) return a > b ? "a" : "b";
  return a < b ? "a" : "b";
}

function ToneCell({
  n,
  fmt,
  win,
  side,
}: {
  n: number | null;
  fmt: (x: number) => string;
  win: "a" | "b" | "tie" | null;
  side: "a" | "b";
}) {
  const on = win === side;
  const lose = win && win !== "tie" && win !== side;
  return (
    <td
      className={cn(
        "px-3 py-2.5 text-right font-mono tabular",
        on && "text-up",
        lose && "text-down/80",
      )}
    >
      {dash(n, fmt)}
    </td>
  );
}

function ComparePage() {
  const ports = useKosh((s) => s.portfolios);
  const [aType, setAType] = useState<LegType>("port");
  const [bType, setBType] = useState<LegType>(ports[1] ? "port" : "bench");
  const [aPort, setAPort] = useState(ports[0]?.id || "");
  const [bPort, setBPort] = useState(ports[1]?.id || ports[0]?.id || "");
  const [aStock, setAStock] = useState("RELIANCE");
  const [bStock, setBStock] = useState("TCS");
  const [bBench, setBBench] = useState("nifty");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [A, setA] = useState<Leg | null>(null);
  const [B, setB] = useState<Leg | null>(null);

  const merged: NavPoint[] = useMemo(() => (A && B ? mergeNav(A.mix.nav, B.mix.nav) : []), [A, B]);

  const score = useMemo(() => {
    if (!A || !B) return null;
    let a = 0;
    let b = 0;
    let n = 0;
    for (const row of [...RETURN_ROWS, ...RISK_ROWS]) {
      const d = defOf(row.id);
      const win = winnerOf(row.pick(A), row.pick(B), d.better);
      if (win === "a") {
        a += 1;
        n += 1;
      } else if (win === "b") {
        b += 1;
        n += 1;
      } else if (win === "tie") n += 1;
    }
    return { a, b, n };
  }, [A, B]);

  return (
    <AppShell>
      <div className="kosh-page">
        <h1 className="text-[28px] font-semibold tracking-tight">Compare</h1>
        <p className="mt-1 mb-5 max-w-2xl text-sm leading-relaxed text-muted">
          Put two portfolios, a stock, or an index side by side. Every return window and risk number is
          scored. Green is ahead, red is behind. Hover a metric, or tap ? to read what it means.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <fieldset className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <legend className="px-1 text-[11px] tracking-[0.08em] text-subtle uppercase">Left</legend>
            <Label>
              Type
              <select className="h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]" value={aType} onChange={(e) => setAType(e.target.value as LegType)}>
                <option value="port">Portfolio</option>
                <option value="stock">Stock</option>
              </select>
            </Label>
            {aType === "port" ? (
              <Label className="mt-3">
                Portfolio
                <select className="h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]" value={aPort} onChange={(e) => setAPort(e.target.value)}>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Label>
            ) : (
              <Label className="mt-3">
                Ticker
                <Input value={aStock} onChange={(e) => setAStock(e.target.value)} />
              </Label>
            )}
          </fieldset>
          <fieldset className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <legend className="px-1 text-[11px] tracking-[0.08em] text-subtle uppercase">Right</legend>
            <Label>
              Type
              <select className="h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]" value={bType} onChange={(e) => setBType(e.target.value as LegType)}>
                <option value="port">Portfolio</option>
                <option value="stock">Stock</option>
                <option value="bench">Index</option>
              </select>
            </Label>
            {bType === "port" ? (
              <Label className="mt-3">
                Portfolio
                <select className="h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]" value={bPort} onChange={(e) => setBPort(e.target.value)}>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Label>
            ) : bType === "stock" ? (
              <Label className="mt-3">
                Ticker
                <Input value={bStock} onChange={(e) => setBStock(e.target.value)} />
              </Label>
            ) : (
              <Label className="mt-3">
                Index
                <select className="h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]" value={bBench} onChange={(e) => setBBench(e.target.value)}>
                  {Object.entries(BENCH).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </Label>
            )}
          </fieldset>
        </div>
        <Button
          className="mt-4"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setErr("");
            try {
              const [left, right] = await Promise.all([
                loadLeg(aType, { portId: aPort, stock: aStock, bench: "nifty" }, ports),
                loadLeg(bType, { portId: bPort, stock: bStock, bench: bBench }, ports),
              ]);
              if (!left || !right) {
                setErr("Could not load both sides.");
                setA(null);
                setB(null);
              } else {
                setA(left);
                setB(right);
              }
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Loading history…" : "Compare"}
        </Button>
        {err ? <p className="mt-3 text-sm text-down">{err}</p> : null}
        {busy ? <div className="mt-8"><ChartSkeleton label="Aligning both histories…" /></div> : null}

        {A && B && !busy ? (
          <div className="mt-8 grid gap-6">
            {score ? (
              <div className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
                <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Verdict</div>
                <p className="mt-1 text-[15px] leading-relaxed">
                  <b>{A.name}</b> is ahead on{" "}
                  <b className={cn("font-mono tabular", score.a >= score.b ? "text-up" : "text-muted")}>{score.a}</b> checks ·{" "}
                  <b>{B.name}</b> is ahead on{" "}
                  <b className={cn("font-mono tabular", score.b > score.a ? "text-up" : "text-muted")}>{score.b}</b>
                  {score.n ? <span className="text-muted"> · of {score.n} scored metrics</span> : null}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  Returns, Sharpe, Sortino, alpha, Calmar, information ratio, and up-capture prefer higher. Volatility and
                  down-capture prefer lower. Beta and correlation are shown, not scored.
                </p>
              </div>
            ) : null}

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
                <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{A.name}</div>
                <div className="mt-1 font-mono text-[22px] font-medium tabular">{A.value ? fmtInr(A.value) : fmtPct(A.windows.y1.port)}</div>
                <div className="mt-1 text-[12px] text-muted">1Y {fmtPct(A.windows.y1.port)} · CAGR {fmtPct(A.cagr)}</div>
              </div>
              <div className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
                <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{B.name}</div>
                <div className="mt-1 font-mono text-[22px] font-medium tabular">{B.value ? fmtInr(B.value) : fmtPct(B.windows.y1.port)}</div>
                <div className="mt-1 text-[12px] text-muted">1Y {fmtPct(B.windows.y1.port)} · CAGR {fmtPct(B.cagr)}</div>
              </div>
            </div>

            <NavChart nav={merged} portLabel={A.name} benchLabel={B.name} coverage="Aligned on the same days" />

            <CompareTable title="Returns" aName={A.name} bName={B.name} rows={RETURN_ROWS.map((r) => ({ ...r, fmt: (n: number) => fmtPct(n) }))} A={A} B={B} />
            <CompareTable title="Risk" aName={A.name} bName={B.name} rows={RISK_ROWS} A={A} B={B} />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function CompareTable({
  title,
  aName,
  bName,
  rows,
  A,
  B,
}: {
  title: string;
  aName: string;
  bName: string;
  rows: { id: string; pick: (l: Leg) => number | null; fmt: (n: number) => string }[];
  A: Leg;
  B: Leg;
}) {
  return (
    <section>
      <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h2>
      <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-[13px]">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Metric</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">{aName}</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">{bName}</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Gap</th>
              <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Ahead</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const d = defOf(row.id);
              const av = row.pick(A);
              const bv = row.pick(B);
              const win = winnerOf(av, bv, d.better);
              const gap = av != null && bv != null ? av - bv : null;
              return (
                <tr key={row.id}>
                  <td className="px-3 py-2.5">
                    <MetricLabel id={row.id} />
                    <p className="mt-0.5 max-w-xs text-[11px] leading-snug text-muted">{d.short}</p>
                  </td>
                  <ToneCell n={av} fmt={row.fmt} win={win} side="a" />
                  <ToneCell n={bv} fmt={row.fmt} win={win} side="b" />
                  <td className="px-3 py-2.5 text-right font-mono tabular text-muted">
                    {gap == null ? "—" : (gap > 0 ? "+" : "") + (Math.abs(gap) >= 10 ? gap.toFixed(1) : gap.toFixed(2))}
                  </td>
                  <td className="px-3 py-2.5">
                    {win === "a" || win === "b" ? (
                      <span className="text-[12px] text-up">{win === "a" ? aName : bName}</span>
                    ) : win === "tie" ? (
                      <span className="text-[12px] text-subtle">Level</span>
                    ) : (
                      <span className="text-[12px] text-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
