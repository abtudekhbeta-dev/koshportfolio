import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AddHoldings } from "@/components/add-holdings";
import { MixNudge } from "@/components/mix-nudge";
import { Button } from "@/components/ui/button";
import { apiHistories, apiHistory, apiQuotes } from "@/lib/kosh/api";
import { fmtInr, fmtPct, retFromBars, saneDayPnl } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Holding, HistoryPack, Quote } from "@/lib/kosh/types";

export const Route = createFileRoute("/app")({ ssr: false, component: Home });

function quoteKey(s: string) {
  return s.toUpperCase().replace(/\.(NS|BO)$/i, "");
}

function portSnap(holdings: Holding[], quotes: Quote[]) {
  const map = new Map<string, Quote>();
  for (const q of quotes) {
    map.set(quoteKey(q.input), q);
    map.set(quoteKey(q.symbol), q);
  }
  let value = 0;
  let invested = 0;
  let knownValue = 0;
  let dayAbs = 0;
  let dayWarn: string | null = null;
  for (const h of holdings) {
    const q = map.get(quoteKey(h.symbol));
    const px = q?.price || h.avg || 0;
    const val = h.qty * px;
    value += val;
    const known = h.avg != null && h.avg > 0 && Number.isFinite(h.avg);
    if (known) {
      invested += h.qty * (h.avg as number);
      knownValue += val;
    }
    const day = saneDayPnl(val, q?.changePct || 0);
    dayAbs += day.abs;
    if (day.warn) dayWarn = day.warn;
  }
  return { value, invested, unreal: knownValue - invested, dayAbs, dayPct: value ? (dayAbs / value) * 100 : 0, dayWarn };
}

function port1y(holdings: Holding[], packs: HistoryPack[], quotes: Quote[]) {
  const map = new Map<string, HistoryPack>();
  for (const p of packs) {
    map.set(quoteKey(p.input), p);
    map.set(quoteKey(p.symbol), p);
  }
  const qmap = new Map<string, Quote>();
  for (const q of quotes) {
    qmap.set(quoteKey(q.input), q);
    qmap.set(quoteKey(q.symbol), q);
  }
  let w = 0;
  let r = 0;
  for (const h of holdings) {
    const pack = map.get(quoteKey(h.symbol));
    const ret = retFromBars(pack?.bars, 180);
    if (ret == null) continue;
    const px = qmap.get(quoteKey(h.symbol))?.price || pack?.price || h.avg || 0;
    const val = h.qty * px;
    if (!(val > 0)) continue;
    w += val;
    r += val * ret;
  }
  return w ? r / w : null;
}

function Home() {
  const ports = useKosh((s) => s.portfolios);
  const renamePortfolio = useKosh((s) => s.renamePortfolio);
  const duplicatePortfolio = useKosh((s) => s.duplicatePortfolio);
  const deletePortfolio = useKosh((s) => s.deletePortfolio);
  const navigate = useNavigate();
  const [renameId, setRenameId] = useState<string | null>(null);
  const symbols = [...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol)))];
  const quotes = useQuery({
    queryKey: ["home-quotes", symbols],
    queryFn: () => apiQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 15_000,
    refetchInterval: isIstSession() ? 20_000 : 120_000,
  });
  const hx = useQuery({
    queryKey: ["home-hx", symbols],
    queryFn: () => apiHistories(symbols.slice(0, 80), "1y"),
    enabled: symbols.length > 0,
    staleTime: 30 * 60 * 1000,
  });
  const nifty = useQuery({
    queryKey: ["hx", "^NSEI", "1y"],
    queryFn: () => apiHistory("^NSEI", "1y"),
    staleTime: 30 * 60 * 1000,
  });

  const nifty1y =
    nifty.data?.bars && nifty.data.bars.length > 2
      ? ((nifty.data.bars.at(-1)!.c / nifty.data.bars[0].c - 1) * 100)
      : null;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Portfolios</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Open a portfolio to see it versus Nifty. Add gold and silver the same way as stocks.
          </p>
        </div>
        <AddHoldings trigger={<Button>New portfolio</Button>} />
      </div>
      {ports.length ? (
        <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ports.map((p) => {
            const snap = quotes.data ? portSnap(p.holdings, quotes.data) : null;
            const port1yN = hx.data ? port1y(p.holdings, hx.data, quotes.data || []) : null;
            const gap = port1yN != null && nifty1y != null ? port1yN - nifty1y : null;
            return (
              <div key={p.id} className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-subtle uppercase">Vs Nifty · 1Y</div>
                <Link to="/p/$id" params={{ id: p.id }} className="mt-1 block font-medium hover:text-chart">
                  {p.name}
                </Link>
                <div className={cn("mt-1 font-mono text-[18px] tabular", gap == null ? "text-muted" : gap >= 0 ? "text-up" : "text-down")}>
                  {gap == null ? "—" : fmtPct(gap)}
                </div>
                <div className="text-[11px] text-subtle">
                  {port1yN != null ? `Portfolio ${fmtPct(port1yN)}` : "Need 1 year of prices"}
                  {nifty1y != null ? ` · Nifty ${fmtPct(nifty1y)}` : ""}
                </div>
                {snap ? (
                  <div className="mt-1 font-mono text-[12px] text-muted tabular">{fmtInr(snap.value)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      <div className="mb-6">
        <MixNudge where="app" />
      </div>
      <div className="grid gap-2">
        {ports.length ? (
          ports.map((p) => {
            const snap = quotes.data ? portSnap(p.holdings, quotes.data) : null;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]"
              >
                <Link to="/p/$id" params={{ id: p.id }} className="min-w-0 flex-1">
                  {renameId === p.id ? (
                    <input
                      autoFocus
                      className="w-full bg-transparent text-[16px] font-medium outline-none"
                      defaultValue={p.name}
                      onClick={(e) => e.preventDefault()}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v) renamePortfolio(p.id, v);
                        setRenameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                    />
                  ) : (
                    <div className="font-medium hover:text-chart">{p.name}</div>
                  )}
                  <div className="text-[12px] text-muted">{p.holdings.length} names</div>
                </Link>
                <div className="flex items-center gap-2">
                  {snap ? (
                    <div className="text-right">
                      <div className="font-mono text-[15px] font-medium tabular">{fmtInr(snap.value)}</div>
                      <div className={cn("font-mono text-[12px] tabular", snap.dayAbs >= 0 ? "text-up" : "text-down")}>
                        {fmtPct(snap.dayPct)} today
                      </div>
                    </div>
                  ) : quotes.isPending ? (
                    <div className="h-8 w-24 animate-pulse rounded-sm bg-surface-2" />
                  ) : null}
                  <AddHoldings portfolioId={p.id} trigger={<Button size="sm" variant="secondary">Add</Button>} />
                  <Button size="sm" variant="ghost" onClick={() => setRenameId(p.id)}>
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const id = duplicatePortfolio(p.id);
                      if (id) void navigate({ to: "/p/$id", params: { id } });
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this portfolio?")) deletePortfolio(p.id);
                    }}
                  >
                    Delete
                  </Button>
                  <Link to="/p/$id" params={{ id: p.id }} aria-label="Open">
                    <ChevronRight className="size-4 text-subtle" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg bg-surface px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-border)]">
            No portfolios yet. Create one from a broker file or add names by hand.
          </div>
        )}
      </div>
    </AppShell>
  );
}
