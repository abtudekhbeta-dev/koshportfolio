import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketHeat } from "@/components/charts/market-heat";
import { MiniBars, BreadthBar } from "@/components/charts/share-ring";
import { MacroBoard, MarketTempCard, EventCalendar } from "@/components/macro-board";
import { MixNudge } from "@/components/mix-nudge";
import { NewsBoard } from "@/components/news-board";
import { PulseDesk } from "@/components/note-desk";
import { canOpenStock } from "@/components/stock-link";
import { apiNews, apiQuotes, apiScreener, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { overlayQuotes, pickLiveSymbols } from "@/lib/kosh/live-overlay";
import { isIstSession } from "@/lib/kosh/market-hours";
import { applyScreen, sectorPulse } from "@/lib/kosh/screens";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MarketOverview() {
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
    <div className="mx-auto grid max-w-6xl gap-6 px-3 py-5 sm:px-4 sm:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Indian market overview</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
            Indices, breadth, movers, and Pulse — what the cash market is doing today. Open Terminal to watch a name.
          </p>
        </div>
        <Link
          to="/markets"
          search={{ view: "terminal" }}
          className="inline-flex h-10 items-center rounded-sm bg-accent px-3.5 text-[13px] font-medium text-accent-fg"
        >
          Open Terminal →
        </Link>
      </div>

      <section>
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Indices</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {(tape.data || []).slice(0, 8).map((t) => {
            const inner = (
              <>
                <div className="text-[11px] tracking-[0.06em] text-subtle uppercase">{t.label}</div>
                <div className="mt-1 font-mono text-[18px] tabular">{t.price ? fmtPx(t.price) : "—"}</div>
                <div className={cn("font-mono text-[12px] tabular", t.changePct >= 0 ? "text-up" : "text-down")}>
                  {t.changePct ? fmtPct(t.changePct) : "—"}
                </div>
              </>
            );
            return canOpenStock(t.symbol) ? (
              <Link
                key={t.id}
                to="/s/$symbol"
                params={{ symbol: t.symbol }}
                className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
              >
                {inner}
              </Link>
            ) : (
              <div key={t.id} className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {ports.some((p) => p.holdings.length) ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your holdings today</h2>
            {ports.find((p) => p.holdings.length) ? (
              <Link
                to="/p/$id/holdings"
                params={{ id: ports.find((p) => p.holdings.length)!.id }}
                className="text-[12px] text-chart hover:underline"
              >
                View all holdings →
              </Link>
            ) : null}
          </div>
          {portRows.length ? (
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {portRows.slice(0, 8).map((r) => (
                <li key={r.symbol}>
                  <Link
                    to="/s/$symbol"
                    params={{ symbol: r.symbol }}
                    className="flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg"
                  >
                    <span className="truncate text-[13px]">{r.name || r.symbol}</span>
                    <span className={cn("ml-3 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down")}>
                      {fmtPct(r.changePct)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-muted">Waiting on last prints for the names you hold.</p>
          )}
        </section>
      ) : null}

      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Breadth</h2>
        <p className="mt-1 text-[12px] text-subtle">Advancing vs declining names on the screen. Blank if the screen has not loaded.</p>
        <div className="mt-3">
          {rows.length ? <BreadthBar green={green} n={rows.length} /> : <p className="text-[13px] text-muted">Breadth fills once the screen is in.</p>}
        </div>
        <div className="mt-4">
          <MarketTempCard rows={liveRows} focus={portSyms.length ? portSyms : watchSyms} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Winners</h2>
          <MiniBars
            items={up.map((r) => ({
              name: r.symbol,
              sub: r.name,
              symbol: r.symbol,
              value: r.changePct,
              label: fmtPct(r.changePct),
              tone: "up" as const,
            }))}
          />
        </section>
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Losers</h2>
          <MiniBars
            items={down.map((r) => ({
              name: r.symbol,
              sub: r.name,
              symbol: r.symbol,
              value: r.changePct,
              label: fmtPct(r.changePct),
              tone: "down" as const,
            }))}
          />
        </section>
      </div>

      {watchRows.length ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Watch</h2>
            <Link to="/watch" className="text-[12px] text-chart hover:underline">
              Full watch
            </Link>
          </div>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {watchRows.slice(0, 8).map((r) => (
              <li key={r.symbol}>
                <Link
                  to="/s/$symbol"
                  params={{ symbol: r.symbol }}
                  className="flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg"
                >
                  <span className="truncate text-[13px]">{r.symbol}</span>
                  <span className={cn("ml-3 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down")}>
                    {fmtPct(r.changePct)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors</h2>
        {sectors.length ? (
          <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {sectors.slice(0, 12).map((s) => (
              <div
                key={s.sector}
                className={cn(
                  "rounded-sm px-2 py-2 text-center",
                  s.avg >= 0 ? "bg-up/20" : "bg-down/20",
                )}
              >
                <div className="truncate text-[11px] font-medium">{s.sector}</div>
                <div className={cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down")}>
                  {fmtPct(s.avg)}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <MarketHeat rows={liveRows} />
      </section>

      <MacroBoard />
      <EventCalendar />
      <PulseDesk />
      <NewsBoard title="Market headlines" items={news.data} loading={news.isPending} shareTitle="Indian market" extra="Nifty Sensex" />
      <MixNudge where="markets" />
    </div>
  );
}
