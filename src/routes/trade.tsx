import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CandleChart } from "@/components/charts/candle-chart";
import { JournalDesk } from "@/components/journal-desk";
import { StructureDesk } from "@/components/structure-desk";
import { Button } from "@/components/ui/button";
import { apiOhlc, apiScreener } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { fmtVol, resample } from "@/lib/kosh/ohlc";
import { applyScreen, TRADE_SCANS, type ScreenId } from "@/lib/kosh/screens";
import type { OhlcBar, ScreenRow } from "@/lib/kosh/types";
import { universeName } from "@/lib/kosh/universe";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trade")({ ssr: false, component: TradePage });

function TradePage() {
  const watch = useKosh((s) => s.watch);
  const recents = useKosh((s) => s.recents);
  const [scan, setScan] = useState<ScreenId>("breakout");
  const [pick, setPick] = useState("");
  const seed = pick || watch[0] || recents[0]?.symbol || "RELIANCE";

  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const ohlc = useQuery({
    queryKey: ["ohlc", seed, "2y", "1d"],
    queryFn: () => apiOhlc(seed, "2y", "1d"),
    staleTime: 30_000,
  });
  const daily = useQuery({
    queryKey: ["ohlc", seed, "1y", "1d"],
    queryFn: () => apiOhlc(seed, "1y", "1d"),
    staleTime: 10 * 60 * 1000,
  });

  const rows = screen.data?.rows || [];
  const hits = applyScreen(rows, scan).slice(0, 12);
  const pack = ohlc.data && !ohlc.data.missing ? ohlc.data : null;
  const name = pack?.name || universeName(seed);
  const row = rows.find((r) => r.symbol === seed.toUpperCase().replace(/\.(NS|BO)$/i, ""));

  return (
    <AppShell wide>
      <div className="kosh-page grid gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Trade</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Chart first. Timeframe is the bar size (1m to 1M). The view opens on the last stretch of bars — scroll to zoom,
            drag to pan, like TradingView. Draw on the
            chart. Click a candle to start replay. Structure, scans, and a journal for the name you pick.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <Link to="/s/$symbol" params={{ symbol: seed }} className="text-[18px] font-semibold tracking-tight hover:text-chart">
                  {name}
                </Link>
                <span className="ml-2 text-[12px] text-subtle">{seed.toUpperCase()}</span>
              </div>
              {pack ? (
                <div className="font-mono text-[15px] tabular">
                  {fmtPx(pack.price)}{" "}
                  <span className={pack.changePct >= 0 ? "text-up" : "text-down"}>{fmtPct(pack.changePct)}</span>
                </div>
              ) : null}
            </div>
            {ohlc.isPending && !pack ? (
              <div className="h-[300px] animate-pulse rounded-lg bg-surface sm:h-[420px]" />
            ) : pack ? (
              <CandleChart
                symbol={seed}
                bars={pack.bars}
                intra={false}
                high52={pack.high52}
                low52={pack.low52}
                prevClose={pack.previousClose}
              />
            ) : (
              <p className="text-sm text-muted">No series for {seed}.</p>
            )}
            <MtfStrip bars={daily.data && !daily.data.missing ? daily.data.bars : []} row={row} volume={pack?.volume || 0} />
          </div>
          <div className="grid gap-4 self-start">
            <StructureDesk symbol={seed} />
            <WatchStrip symbols={watch} rows={rows} onPick={setPick} />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Setups</h2>
          <div className="flex flex-wrap gap-1">
            {TRADE_SCANS.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.hint}
                onClick={() => setScan(s.id)}
                className={cn(
                  "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
                  scan === s.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <ScanTable rows={hits} loading={screen.isPending} active={seed} onPick={setPick} />
        </section>

        <JournalDesk symbol={seed} price={pack?.price || 0} />
      </div>
    </AppShell>
  );
}

function ScanTable({
  rows,
  loading,
  active,
  onPick,
}: {
  rows: ScreenRow[];
  loading: boolean;
  active: string;
  onPick: (s: string) => void;
}) {
  const bare = active.toUpperCase().replace(/\.(NS|BO)$/i, "");
  if (loading && !rows.length) return <p className="mt-3 text-sm text-muted">Running the scan…</p>;
  if (!rows.length) return <p className="mt-3 text-sm text-muted">Nothing matches this setup right now.</p>;
  return (
    <>
    <div className="mt-3 hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
          <tr className="border-b border-border">
            {["Name", "Last", "Day", "RSI", "Vol", "52w"].map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.symbol}
              className={cn("border-b border-border/60 last:border-0", r.symbol === bare && "bg-bg-elevated")}
            >
              <td className="px-3 py-2">
                <button type="button" className="text-left hover:text-chart" onClick={() => onPick(r.symbol)}>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-[11px] text-subtle">{r.symbol}</div>
                </button>
              </td>
              <td className="px-3 py-2 font-mono tabular">{fmtPx(r.price)}</td>
              <td className={cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>{fmtPct(r.changePct)}</td>
              <td className="px-3 py-2 font-mono tabular">{r.rsi != null ? r.rsi.toFixed(0) : "—"}</td>
              <td className="px-3 py-2 font-mono tabular">{r.volRatio != null ? r.volRatio.toFixed(1) + "×" : "—"}</td>
              <td className="px-3 py-2 font-mono tabular">{r.offHigh != null ? fmtPct(r.offHigh) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-3 grid gap-2 md:hidden">
      {rows.map((r) => (
        <button
          key={r.symbol}
          type="button"
          onClick={() => onPick(r.symbol)}
          className={cn(
            "rounded-lg bg-surface p-3 text-left shadow-[var(--shadow-border)]",
            r.symbol === bare && "ring-1 ring-fg/25",
          )}
        >
          <div className="font-medium">{r.name}</div>
          <div className="text-[11px] text-subtle">{r.symbol}</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
            <div>
              <div className="text-[11px] text-subtle">Last</div>
              <div className="font-mono tabular">{fmtPx(r.price)}</div>
            </div>
            <div>
              <div className="text-[11px] text-subtle">Day</div>
              <div className={cn("font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>{fmtPct(r.changePct)}</div>
            </div>
            <div>
              <div className="text-[11px] text-subtle">RSI</div>
              <div className="font-mono tabular">{r.rsi != null ? r.rsi.toFixed(0) : "—"}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
    </>
  );
}

function MtfStrip({ bars, row, volume }: { bars: OhlcBar[]; row?: ScreenRow; volume: number }) {
  const week = useMemo(() => resample(bars, 7 * 86400), [bars]);
  const month = useMemo(() => resample(bars, 30 * 86400), [bars]);
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <SparkCard label="Daily" bars={bars.slice(-40)} />
      <SparkCard label="Weekly" bars={week.slice(-40)} />
      <SparkCard label="Monthly" bars={month.slice(-24)} />
      <div className="rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
        <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">Volume</div>
        <div className="mt-1 font-mono text-[15px] tabular">{fmtVol(volume)}</div>
        <div className="text-[11px] text-muted">
          {row?.volRatio != null ? row.volRatio.toFixed(1) + "× 20-day avg" : "—"}
          {row?.rsi != null ? ` · RSI ${row.rsi.toFixed(0)}` : ""}
        </div>
      </div>
    </div>
  );
}

function SparkCard({ label, bars }: { label: string; bars: OhlcBar[] }) {
  const last = bars.at(-1);
  const first = bars[0];
  const ret = first?.c && last?.c ? (last.c / first.c - 1) * 100 : null;
  const w = 140;
  const h = 36;
  let d = "";
  if (bars.length > 1) {
    const lo = Math.min(...bars.map((b) => b.l));
    const hi = Math.max(...bars.map((b) => b.h));
    const span = hi - lo || 1;
    d = bars
      .map((b, i) => {
        const x = (i / (bars.length - 1)) * w;
        const y = h - ((b.c - lo) / span) * (h - 2) - 1;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }
  return (
    <div className="rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
        <div className={cn("font-mono text-[12px] tabular", (ret ?? 0) >= 0 ? "text-up" : "text-down")}>
          {ret != null ? fmtPct(ret) : "—"}
        </div>
      </div>
      {d ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-8 w-full" aria-hidden>
          <path d={d} fill="none" stroke="var(--color-chart)" strokeWidth="1.4" />
        </svg>
      ) : (
        <div className="mt-1 h-8" />
      )}
    </div>
  );
}

function WatchStrip({ symbols, rows, onPick }: { symbols: string[]; rows: ScreenRow[]; onPick: (s: string) => void }) {
  const map = new Map(rows.map((r) => [r.symbol, r]));
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Watch</h2>
      {symbols.length ? (
        <ul className="mt-2 grid gap-1">
          {symbols.slice(0, 8).map((s) => {
            const r = map.get(s.toUpperCase());
            return (
              <li key={s}>
                <button type="button" className="flex w-full items-center justify-between py-1 text-left hover:text-chart" onClick={() => onPick(s)}>
                  <span className="text-[13px]">{r?.name || universeName(s)}</span>
                  <span className={cn("font-mono text-[12px] tabular", (r?.changePct ?? 0) >= 0 ? "text-up" : "text-down")}>
                    {r ? fmtPct(r.changePct) : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted">Pin names from a stock page.</p>
      )}
      <Button asChild size="sm" variant="ghost" className="mt-2">
        <Link to="/watch">Morning board</Link>
      </Button>
    </div>
  );
}
