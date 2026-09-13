import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { MarketHeat } from "@/components/charts/market-heat";
import { PulseDesk } from "@/components/note-desk";
import { MacroBoard, MarketTempCard, EventCalendar } from "@/components/macro-board";
import { MixNudge } from "@/components/mix-nudge";
import { NewsBoard } from "@/components/news-board";
import { MiniBars, BreadthBar } from "@/components/charts/share-ring";
import { canOpenStock } from "@/components/stock-link";
import { apiNews, apiScreener, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtPx, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { applyScreen, sectorPulse } from "@/lib/kosh/screens";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/markets")({ ssr: false, component: Markets });

function Markets() {
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    staleTime: isIstSession() ? 2_500 : 30_000,
    refetchInterval: isIstSession() ? 5_000 : 60_000,
  });
  const ports = useKosh((s) => s.portfolios);
  const watch = useKosh((s) => s.watch);
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60_000 });
  const rows = screen.data?.rows || [];
  const up = applyScreen(rows, "up").slice(0, 8);
  const down = applyScreen(rows, "down").slice(0, 8);
  const hot = applyScreen(rows, "hot").slice(0, 6);
  const high = applyScreen(rows, "high").slice(0, 6);
  const sectors = sectorPulse(rows);
  const portSyms = [
    ...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "")))),
  ];
  const portRows = rows.filter((r) => portSyms.includes(r.symbol)).sort((a, b) => b.changePct - a.changePct);
  const watchRows = rows.filter((r) => watch.includes(r.symbol)).sort((a, b) => b.changePct - a.changePct);
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
            <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">In your portfolios</h2>
            <NameList rows={portRows} />
          </section>
        ) : null}

        {watchRows.length ? (
          <section>
            <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Watch</h2>
            <NameList rows={watchRows} />
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Winners</h2>
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
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Losers</h2>
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
            <Link to="/screen" className="text-[12px] text-muted hover:text-fg">
              Open the screen
            </Link>
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
    <ul className="mt-2 grid gap-0.5">
      {rows.map((r) => (
        <li key={r.symbol}>
          <Link
            to="/s/$symbol"
            params={{ symbol: r.symbol }}
            className="flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg"
          >
            <span className="min-w-0">
              <span className="font-medium">{r.symbol}</span>
              <span className="ml-2 truncate text-[12px] text-muted">{r.name}</span>
            </span>
            <span className="flex items-baseline gap-3 font-mono text-[13px] tabular">
              <span className="text-muted">{fmtPx(r.price)}</span>
              <span className={r.changePct >= 0 ? "text-up" : "text-down"}>{fmtPct(r.changePct)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
