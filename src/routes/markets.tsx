import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { MarketHeat } from "@/components/charts/market-heat";
import { PulseDesk } from "@/components/note-desk";
import { MacroBoard, MarketTempCard, EventCalendar } from "@/components/macro-board";
import { MixNudge } from "@/components/mix-nudge";
import { NewsBoard } from "@/components/news-board";
import { MiniBars, BreadthBar } from "@/components/charts/share-ring";
import { canOpenStock } from "@/components/stock-link";
import { apiNews, apiQuotes, apiScreener, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtPx, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { overlayQuotes, pickLiveSymbols } from "@/lib/kosh/live-overlay";
import { applyScreen, sectorPulse } from "@/lib/kosh/screens";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/markets")({ ssr: false, component: Markets });

function Markets() {
  const qc = useQueryClient();
  const liveSession = isIstSession();
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    staleTime: liveSession ? 2_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 5_000 : 60_000),
  });
  const ports = useKosh((s) => s.portfolios);
  const watch = useKosh((s) => s.watch);
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60_000 });
  const rows = screen.data?.rows || [];
  const upSeed = applyScreen(rows, "up").slice(0, 12);
  const downSeed = applyScreen(rows, "down").slice(0, 12);
  const hot = applyScreen(rows, "hot").slice(0, 6);
  const high = applyScreen(rows, "high").slice(0, 6);
  const sectors = sectorPulse(rows);
  const portSyms = [
    ...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "")))),
  ];
  const watchSyms = watch.map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, ""));
  const liveSyms = useMemo(
    () => pickLiveSymbols(portSyms, watchSyms, upSeed.map((r) => r.symbol), downSeed.map((r) => r.symbol), 36),
    [portSyms.join(","), watchSyms.join(","), upSeed.map((r) => r.symbol).join(","), downSeed.map((r) => r.symbol).join(",")],
  );
  const quotes = useQuery({
    queryKey: ["live-tape", liveSyms.join(",")],
    queryFn: () => apiQuotes(liveSyms),
    enabled: liveSyms.length > 0,
    staleTime: liveSession ? 1_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 3_000 : 60_000),
    placeholderData: (prev) => prev,
  });
  const liveRows = overlayQuotes(rows, quotes.data);
  const portRows = overlayQuotes(
    liveRows.filter((r) => portSyms.includes(r.symbol)),
    quotes.data,
  ).sort((a, b) => b.changePct - a.changePct);
  const watchRows = overlayQuotes(
    liveRows.filter((r) => watchSyms.includes(r.symbol)),
    quotes.data,
  ).sort((a, b) => b.changePct - a.changePct);
  const up = overlayQuotes(upSeed, quotes.data)
    .slice()
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 8);
  const down = overlayQuotes(downSeed, quotes.data)
    .slice()
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 8);
  const green = rows.filter((r) => r.changePct >= 0).length;
  const news = useQuery({
    queryKey: ["news", "NIFTY", "market"],
    queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
    staleTime: 10 * 60_000,
  });

  return (
    <AppShell>
      <div className="kosh-page grid gap-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Markets</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Indices, breadth, movers, and headlines. Search any listed name from the bar.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(tape.data || []).slice(0, 8).map((t) => {
            const inner = (
              <>
                <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{t.label}</div>
                <div className="mt-1 font-mono text-xl tabular">{t.price ? fmtTapePx(t.price) : "—"}</div>
                <div className={cn("font-mono text-[13px] tabular", t.changePct >= 0 ? "text-up" : "text-down")}>
                  {t.unit ? <span className="mr-1 text-[11px] text-subtle">{t.unit}</span> : null}
                  {t.changePct ? fmtPct(t.changePct) : "—"}
                </div>
              </>
            );
            return canOpenStock(t.symbol) ? (
              <Link
                key={t.id}
                to="/s/$symbol"
                params={{ symbol: t.symbol }}
                className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
              >
                {inner}
              </Link>
            ) : (
              <div key={t.id} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
                {inner}
              </div>
            );
          })}
        </section>

        <EventCalendar />

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Breadth</h2>
            <p className="mt-1 text-[13px] text-muted">
              {green}/{rows.length || "—"} advancing on this universe.
            </p>
            <div className="mt-3">
              <BreadthBar green={green} n={rows.length || 1} />
            </div>
            <div className="mt-4">
              <MarketTempCard rows={rows} focus={[...watch, ...portSyms]} />
            </div>
          </div>
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors today</h2>
            {sectors.length ? (
              <MiniBars
                items={sectors.slice(0, 8).map((s) => ({
                  name: s.sector,
                  value: s.changePct,
                  label: fmtPct(s.changePct),
                  tone: s.changePct >= 0 ? "up" : "down",
                }))}
              />
            ) : (
              <p className="text-sm text-muted">Waiting on prices.</p>
            )}
          </div>
        </section>

        {portRows.length ? (
          <section>
            <h2 className="mb-3 flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              In your portfolios
              <LiveHint live={liveSession} />
            </h2>
            <NameList rows={portRows} />
          </section>
        ) : null}

        {watchRows.length ? (
          <section>
            <h2 className="mb-3 flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              Watch
              <LiveHint live={liveSession} />
            </h2>
            <NameList rows={watchRows} />
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              Winners
              <LiveHint live={liveSession} />
            </h2>
            {screen.isPending && !up.length ? (
              <p className="mt-3 text-sm text-muted">Loading prices…</p>
            ) : (
              <div className="mt-3">
                <MiniBars
                  items={up.map((r) => ({
                    name: r.symbol,
                    sub: r.name,
                    symbol: r.symbol,
                    value: r.changePct,
                    label: fmtPct(r.changePct),
                    tone: "up",
                  }))}
                />
              </div>
            )}
          </div>
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              Losers
              <LiveHint live={liveSession} />
            </h2>
            {screen.isPending && !down.length ? (
              <p className="mt-3 text-sm text-muted">Loading prices…</p>
            ) : (
              <div className="mt-3">
                <MiniBars
                  items={down.map((r) => ({
                    name: r.symbol,
                    sub: r.name,
                    symbol: r.symbol,
                    value: r.changePct,
                    label: fmtPct(r.changePct),
                    tone: "down",
                  }))}
                />
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Board title="Volume spike" rows={hot} loading={screen.isPending} />
          <Board title="Near 52-week high" rows={high} loading={screen.isPending} />
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Heat</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-[12px] text-muted hover:text-fg"
                onClick={() => qc.invalidateQueries({ queryKey: ["screener"] })}
              >
                Refresh heat
              </button>
              <Link to="/screen" className="text-[12px] text-muted hover:text-fg">
                Open the screen
              </Link>
            </div>
          </div>
          {screen.isPending && !rows.length ? (
            <p className="text-sm text-muted">Loading prices… first pass takes a moment.</p>
          ) : (
            <MarketHeat rows={rows} />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <NewsBoard
              title="Headlines"
              items={news.data}
              loading={news.isPending}
              shareTitle="Indian market headlines"
              extra="From Markets"
              alertScope="markets"
            />
          </div>
          <PulseDesk />
        </section>

        <MixNudge where="markets" />
        <MacroBoard />
      </div>
    </AppShell>
  );
}

function LiveHint({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase",
        live ? "bg-up/15 text-up" : "bg-surface-2 text-subtle",
      )}
    >
      {live ? "Live" : "Close"}
    </span>
  );
}

function Board({
  title,
  rows,
  loading,
}: {
  title: string;
  rows: { symbol: string; name: string; price: number; changePct: number }[];
  loading: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h2>
      {loading && !rows.length ? (
        <p className="mt-3 text-sm text-muted">Loading prices… first pass takes a moment.</p>
      ) : (
        <NameList rows={rows} />
      )}
    </div>
  );
}

function NameList({ rows }: { rows: { symbol: string; name: string; price: number; changePct: number }[] }) {
  if (!rows.length) return <p className="mt-3 text-sm text-muted">Nothing here yet.</p>;
  return (
    <ul className="mt-2 grid">
      {rows.map((r) => (
        <li key={r.symbol} className="kosh-row kosh-row-stack">
          <Link
            to="/s/$symbol"
            params={{ symbol: r.symbol }}
            className="min-w-0 hover:text-chart"
          >
            <span className="font-medium">{r.symbol}</span>
            <span className="ml-2 text-[12px] text-muted">{r.name}</span>
          </Link>
          <span className="flex shrink-0 items-baseline gap-3 font-mono text-[13px] tabular">
            <span className="text-muted">{fmtPx(r.price)}</span>
            <span className={r.changePct >= 0 ? "text-up" : "text-down"}>{fmtPct(r.changePct)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
