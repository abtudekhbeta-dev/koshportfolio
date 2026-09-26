import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AskAi } from "@/components/ask-ai";
import { CandleChart, fetchSpec } from "@/components/charts/candle-chart";
import { NavChart } from "@/components/charts/nav-chart";
import { FinancialSnapshot, OwnershipBlock } from "@/components/analysis-view";
import { SnapshotCard, ValuationModels, CoverageLine } from "@/components/kosh-snapshot";
import { AddToPortfolio } from "@/components/add-to-portfolio";
import { EnrichButton } from "@/components/enrich-button";
import { AttentionStrip } from "@/components/attention-strip";
import { LivePrice } from "@/components/live-price";
import { NewsBoard } from "@/components/news-board";
import { NoteDesk } from "@/components/note-desk";
import { StructureDesk } from "@/components/structure-desk";
import { Button } from "@/components/ui/button";
import { BenchPicker } from "@/components/bench-picker";
import { Kpi, toneOf } from "@/components/kpi";
import { apiFundamentals, apiHistory, apiMacro, apiNews, apiOhlc, apiScreener } from "@/lib/kosh/api";
import { resolveBench } from "@/lib/kosh/benchmarks";
import { businessView } from "@/lib/kosh/business";
import { dash, fmtPct, fmtPx, mixCagr, pathFromBars, riskMetrics, sliceNav, windowReturn, ytdReturn } from "@/lib/kosh/engine";
import { fmtVol, retFrom, volAvg } from "@/lib/kosh/ohlc";
import { capFromMcap, sectorOf } from "@/lib/kosh/sectors";
import { pickPeers, peerInsight } from "@/lib/kosh/peers";
import { universeName } from "@/lib/kosh/universe";
import { skillOf, pickScreenRow } from "@/lib/kosh/screens";
import { buildSnapshot } from "@/lib/kosh/snapshot";
import { fillFundamentals } from "@/lib/kosh/fund-merge";
import { buildValuationModels, earningsQualityRead } from "@/lib/kosh/valuation";
import { buildCoverage, peDiscrepancy } from "@/lib/kosh/coverage";
import { bareSymbol, isWatched, useKosh, type AlertKind } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ChartRange, DealEvent, OhlcPack } from "@/lib/kosh/types";

export const Route = createFileRoute("/s/$symbol")({ ssr: false, component: StockPage });

function StockPage() {
  const { symbol } = Route.useParams();
  const pushRecent = useKosh((s) => s.pushRecent);

  const ohlc = useQuery({
    queryKey: ["ohlc", symbol, "5y", "1d"],
    queryFn: () => apiOhlc(symbol, "5y", "1d"),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const name = ohlc.data?.name || universeName(symbol);
    pushRecent({ symbol, name });
  }, [symbol, ohlc.data?.name, pushRecent]);

  return (
    <AppShell>
      {ohlc.data?.missing ? (
        <p className="text-sm text-muted">No price series for {symbol}.</p>
      ) : ohlc.data ? (
        <StockBody symbol={symbol} pack={ohlc.data} />
      ) : ohlc.isError ? (
        <p className="text-sm text-muted">
          No prices for {symbol}. {ohlc.error.message}
        </p>
      ) : (
        <div className="kosh-page grid gap-3">
          <div className="h-16 animate-pulse rounded-lg bg-surface" />
          <div className="h-[420px] animate-pulse rounded-lg bg-surface" />
        </div>
      )}
    </AppShell>
  );
}

function StockBody({
  symbol,
  pack,
}: {
  symbol: string;
  pack: OhlcPack;
}) {
  const watch = useKosh((s) => s.watch);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const watchlists = useKosh((s) => s.watchlists);
  const activeWatchId = useKosh((s) => s.activeWatchId);
  const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
  const addAlert = useKosh((s) => s.addAlert);
  const alerts = useKosh((s) => s.alerts);
  const removeAlert = useKosh((s) => s.removeAlert);
  const watched = isWatched(symbol, watch);
  const name = pack.name || universeName(symbol);
  const bars = pack.bars;
  const px = pack.price;
  const off = pack.high52 && px ? (px / pack.high52 - 1) * 100 : null;
  const pos52 =
    pack.high52 && pack.low52 && pack.high52 > pack.low52 ? ((px - pack.low52) / (pack.high52 - pack.low52)) * 100 : 50;
  const [cmp, setCmp] = useState("");
  const [cmpGo, setCmpGo] = useState("");
  const [alertPx, setAlertPx] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");
  const [alertKind, setAlertKind] = useState<AlertKind>("price");
  const [tab, setTab] = useState<"chart" | "business" | "financials" | "news">("chart");
  const interval = useKosh((s) => s.chartPrefs.interval);

  const stats = useMemo(() => {
    const retBars = bars.map((b) => ({ ...b, c: b.adj && b.adj > 0 ? b.adj : b.c }));
    return {
      ret1w: retFrom(retBars, 7),
      ret1m: retFrom(retBars, 31),
      ret3m: retFrom(retBars, 93),
      ret1y: retFrom(retBars, 365),
      volAvg: volAvg(bars, 20),
    };
  }, [bars]);

  const news = useQuery({
    queryKey: ["news", symbol, name],
    queryFn: () => apiNews(symbol, name),
    staleTime: 10 * 60 * 1000,
  });
  const fund = useQuery({
    queryKey: ["fundamentals", symbol],
    queryFn: () => apiFundamentals(symbol),
    staleTime: 12 * 60 * 60 * 1000,
  });
  const screen = useQuery({
    queryKey: ["screener"],
    queryFn: apiScreener,
    staleTime: 10 * 60 * 1000,
  });
  const qy = fetchSpec(interval);
  const cmpQ = useQuery({
    queryKey: ["ohlc", cmpGo, qy.range, qy.interval],
    queryFn: () => apiOhlc(cmpGo, qy.range, qy.interval),
    enabled: Boolean(cmpGo),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const reads = useKosh((s) => s.skillReads);
  const listed = pack.firstTrade ? new Date(pack.firstTrade * 1000).toISOString().slice(0, 4) : "—";
  const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
  const deepSnap = useKosh((s) => s.deepFunds[bare]);
  const fundData = useMemo(() => {
    if (fund.data && deepSnap?.fund) return fillFundamentals(fund.data, deepSnap.fund);
    return fund.data || deepSnap?.fund || null;
  }, [fund.data, deepSnap]);
  const sector = sectorOf(symbol);
  const mineRow = pickScreenRow(screen.data?.rows, bare) || (screen.data?.rows || []).find((r) => r.symbol === bare);
  const snap = useMemo(
    () =>
      buildSnapshot({
        symbol: bare,
        name,
        price: px,
        fund: fundData,
        row: mineRow,
        skill: skillOf(reads, bare),
        bars: bars.map((b) => ({ t: b.t, c: b.c })),
      }),
    [bare, name, px, fundData, mineRow, reads, bars],
  );
  const models = useMemo(
    () => buildValuationModels({ price: px, fund: fundData, bars: bars.map((b) => ({ t: b.t, c: b.c })) }),
    [px, fundData, bars],
  );
  const eq = useMemo(() => earningsQualityRead(fundData), [fundData]);
  const peerPick = pickPeers(bare, screen.data?.rows || [], {
    mcapCr: fundData?.mcapCr ?? mineRow?.mcapCr,
    pe: fundData?.pe ?? mineRow?.pe,
    sector,
  });
  const peers = peerPick.rows;
  const insight = peerInsight(
    {
      pe: fundData?.pe ?? mineRow?.pe,
      roce: fundData?.roce ?? mineRow?.roce,
      salesYoY: fundData?.salesYoY ?? mineRow?.salesYoY,
      profitCagr3: fundData?.profitCagr3 ?? mineRow?.profitCagr3,
      profitYoY: fundData?.profitYoY ?? mineRow?.profitYoY,
    },
    peers,
  );
  const cov = useMemo(
    () =>
      buildCoverage({
        fund: fundData,
        row: mineRow,
        price: px,
        peerCount: peers.length,
      }),
    [fundData, mineRow, px, peers.length],
  );
  const peGap = peDiscrepancy(fundData?.pe, mineRow?.pe);
  const priceAsOf = bars.at(-1)?.t ? new Date(bars[bars.length - 1].t * 1000).toISOString().slice(0, 10) : null;
  const finPeriod = fundData?.finPeriod || fundData?.sales?.at(-1)?.period || null;
  const shPeriod = fundData?.shPeriod || fundData?.shareholding?.at(-1)?.period || null;
  const mine = alerts.filter((a) => a.symbol === bare);
  const cap = capFromMcap(fundData?.mcapCr ?? mineRow?.mcapCr, symbol);
  const card = businessView(symbol, {
    summary: fundData?.summary,
    industry: fundData?.industry,
    ceo: fundData?.ceo,
    founded: fundData?.founded,
    website: fundData?.website,
  });
  const site = fundData?.website || null;
  const host = site ? (() => { try { return new URL(site).hostname.replace(/^www\./, ""); } catch { return null; } })() : null;

  return (
    <div className="kosh-page grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-subtle">
            <Link to="/markets" className="hover:text-muted">
              Markets
            </Link>
            <span className="mx-1.5">/</span>
            {sector}
          </p>
          <div className="flex items-start gap-3">
            {host ? (
              <img
                src={`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`}
                alt=""
                width={40}
                height={40}
                className="mt-1 size-10 rounded-md bg-surface-2 object-contain"
              />
            ) : null}
            <div>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">{name}</h1>
          <p className="mt-1 text-[12px] text-muted">
            {bare} · {pack.exchange || "NSE"} · {cap} · listed {listed}
            {mineRow?.series ? ` · ${mineRow.series}` : ""}
            {mineRow?.gsm ? " · GSM" : ""}
            {site ? (
              <>
                {" · "}
                <a href={site} target="_blank" rel="noreferrer" className="text-chart hover:underline">
                  {host || "Company site"}
                </a>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[11px] text-subtle">
            Price {priceAsOf || "—"}
            {finPeriod ? ` · Financials ${finPeriod}` : " · Financials period unavailable"}
            {shPeriod ? ` · Shareholding ${shPeriod}` : " · Shareholding period unavailable"}
            {fundData?.retrievedAt
              ? ` · Card ${new Date(fundData.retrievedAt).toISOString().slice(0, 10)}`
              : ""}
            {deepSnap?.fund ? " · Full company data loaded" : ""}
          </p>
            </div>
          </div>
          <AskAi symbol={symbol} />
        </div>
        <div>
          <LivePrice symbol={symbol} initial={{ price: px, changePct: pack.changePct }} />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {watchlists.length > 1 ? (
              <select
                className="h-8 rounded-sm bg-bg-elevated px-2 text-[12px] shadow-[var(--shadow-border)]"
                value={activeWatchId}
                onChange={(e) => setActiveWatchId(e.target.value)}
                aria-label="Watch list"
              >
                {watchlists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : null}
            <Button size="sm" variant={watched ? "default" : "secondary"} onClick={() => toggleWatch(symbol)}>
              <Star className={cn("size-3.5", watched && "fill-current")} />
              {watched ? "Watching" : "Watch"}
            </Button>
            <AddToPortfolio symbol={bare} name={name} px={px} bars={bars} sector={sector} />
            <EnrichButton symbols={[bare]} />
          </div>
        </div>
      </header>

      <AttentionStrip symbols={[{ symbol: bare, name }]} title="Near-term triggers" />

      {peGap ? (
        <p className="rounded-lg bg-surface px-4 py-3 text-[13px] text-muted shadow-[var(--shadow-border)]">
          {peGap.note} Card {peGap.card.toFixed(1)} vs market print {peGap.market.toFixed(1)}.
        </p>
      ) : null}
      <SnapshotCard snap={snap} simple={models.simple} />
      <CoverageLine cov={cov} />
      <ValuationModels pack={models} fund={fundData} />

      <nav className="flex flex-wrap gap-1" role="tablist" aria-label="Stock sections">
        {(
          [
            ["chart", "Chart"],
            ["business", "Business"],
            ["financials", "Financials"],
            ["news", "News"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
            }}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-sm px-3.5 text-[14px] font-medium leading-none",
              tab === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <div id="desk">
        <NoteDesk symbol={symbol} compact={tab !== "chart"} />
      </div>

      <section className={cn("grid grid-cols-2 gap-2 lg:grid-cols-4", tab !== "chart" && "hidden")}>
        <Kpi label="Day" value={`${fmtPx(pack.dayLow)} – ${fmtPx(pack.dayHigh)}`} />
        <Kpi
          label="52-week high"
          value={fmtPx(pack.high52)}
          hint={
            off == null
              ? undefined
              : off >= -0.15
                ? "At the 52-week high"
                : `${fmtPct(Math.abs(off)).replace("+", "")} below the 52-week high`
          }
          tone={toneOf(off ?? 0)}
        />
        <Kpi label="52-week low" value={fmtPx(pack.low52)} />
        <Kpi
          label="Volume"
          value={fmtVol(pack.volume)}
          hint={stats.volAvg ? "20-day average " + fmtVol(stats.volAvg) : undefined}
        />
      </section>

      <div className={cn(tab !== "chart" && "hidden")}>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="relative h-full w-full">
            <div className="absolute inset-y-0 bg-chart/40" style={{ width: `${Math.min(100, Math.max(0, pos52))}%` }} />
            <div
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
              style={{ left: `${Math.min(100, Math.max(0, pos52))}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between font-mono text-[11px] text-subtle tabular">
          <span>{fmtPx(pack.low52)}</span>
          <span>52-week range</span>
          <span>{fmtPx(pack.high52)}</span>
        </div>
      </div>

      <section id="snapshot" className={cn("grid gap-4", tab !== "financials" && "hidden")}>
        <OwnershipBlock fund={fundData} />
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Earnings quality</h2>
          <p className="mt-1 text-[12px] text-subtle">Operating cash versus reported profit. Missing cash flow stays blank.</p>
          <div className="mt-2 text-[15px] font-semibold">{eq.tag}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{eq.body}</p>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Financials</h2>
          <p className="mt-1 text-[12px] text-subtle">Company numbers we have. Blank means missing, not a guess.</p>
          {fund.isPending ? (
            <p className="mt-3 text-sm text-muted">Loading company numbers…</p>
          ) : (
            <div className="mt-2">
              <FinancialSnapshot fund={fundData} bare price={px} />
            </div>
          )}
        </div>
      </section>

      <section id="tape" className={cn(tab !== "chart" && "hidden")}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Chart</h2>
          <div className="flex flex-wrap items-center gap-2">
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                setCmpGo(cmp.trim().toUpperCase().replace(/\.(NS|BO)$/i, ""));
              }}
            >
              <input
                className="h-8 w-28 rounded-sm bg-bg-elevated px-2 text-[12px] shadow-[var(--shadow-border)] outline-none"
                placeholder="Compare TCS"
                value={cmp}
                onChange={(e) => setCmp(e.target.value)}
              />
              <Button type="submit" size="sm" variant="secondary">
                Overlay
              </Button>
              {cmpGo ? (
                <button
                  type="button"
                  className="text-[11px] text-muted"
                  onClick={() => {
                    setCmpGo("");
                    setCmp("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </form>
          </div>
        </div>
        <CandleChart
          symbol={symbol}
          bars={bars}
          intra={false}
          compareBars={cmpQ.data && !cmpQ.data.missing ? cmpQ.data.bars : null}
          compareLabel={cmpQ.data?.name}
          high52={pack.high52}
          low52={pack.low52}
          prevClose={pack.previousClose}
        />
        <p className="mt-2 text-[12px] text-muted">
          <a
            href={`https://www.tradingview.com/chart/?symbol=NSE:${encodeURIComponent(bare)}`}
            target="_blank"
            rel="noreferrer"
            className="text-chart hover:underline"
          >
            Open in TradingView
          </a>
        </p>
      </section>

      <section className={cn(tab !== "chart" && "hidden")}>
        <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Recent returns</h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            ["1W", stats.ret1w],
            ["1M", stats.ret1m],
            ["3M", stats.ret3m],
            ["1Y", stats.ret1y],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
              <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{k}</div>
              <div className={cn("mt-1 font-mono text-lg tabular", (v as number) >= 0 ? "text-up" : "text-down")}>
                {dash(v as number, (x) => fmtPct(x))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="business" className={cn(tab !== "business" && "hidden")}>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Business</h2>
          {card.known ? (
          <div className="mt-3 grid gap-4 text-[14px] leading-relaxed">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.08em] text-chart uppercase">About</div>
              <p className="mt-1.5 whitespace-pre-line">{card.about}</p>
            </div>
            {card.products ? (
              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Products</div>
                <p className="mt-1.5">{card.products}</p>
              </div>
            ) : null}
            {card.makes ? (
              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">How it makes money</div>
                <p className="mt-1.5">{card.makes}</p>
              </div>
            ) : null}
            {card.cycle ? (
              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Cycle</div>
                <p className="mt-1.5">{card.cycle}</p>
              </div>
            ) : null}
            {card.watch.length ? (
              <div>
                <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Watch</div>
                <ul className="mt-1.5 grid gap-1.5 border-l-2 border-chart/40 pl-3">
                  {card.watch.map((w) => (
                    <li key={w} className="text-[13.5px] leading-relaxed">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          ) : (
            <div className="mt-3 grid gap-4 text-[14px] leading-relaxed">
              {card.about ? (
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-chart uppercase">Official summary</div>
                  <p className="mt-1.5 whitespace-pre-line">{card.about}</p>
                </div>
              ) : null}
              {card.industry ? (
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Industry</div>
                  <p className="mt-1.5">{card.industry}</p>
                </div>
              ) : null}
              {card.ceo ? (
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">CEO</div>
                  <p className="mt-1.5">{card.ceo}</p>
                </div>
              ) : null}
              {card.founded ? (
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Founded</div>
                  <p className="mt-1.5">{card.founded}</p>
                </div>
              ) : null}
              {!card.about && !card.industry && !card.ceo && !card.founded ? (
                <p className="text-muted">
                  No official company summary, industry, CEO or founded date. We do not invent a description of
                  the business.
                </p>
              ) : null}
            </div>
          )}
          {card.known && (card.industry || card.ceo || card.founded) ? (
            <p className="mt-3 text-[13px] text-muted">
              {[card.industry, card.ceo ? `CEO ${card.ceo}` : "", card.founded ? `Founded ${card.founded}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {site ? (
            <p className="mt-3 text-[13px]">
              <a href={site} target="_blank" rel="noreferrer" className="text-chart hover:underline">
                Official company website
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <section id="news" className={cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", tab !== "news" && "hidden")}>
        <NewsBoard
          title="News"
          items={news.data}
          loading={news.isPending}
          shareTitle={`${name} headlines`}
          extra={`${bare} · ${fmtPx(px)} ${fmtPct(pack.changePct)}`}
          alertScope={"s:" + bare}
        />
      </section>

      <section className={cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", tab !== "chart" && "hidden")}>
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Alert</h2>
        <p className="mt-1 text-[13px] text-muted">Stored in this browser. Price, day move, RSI, volume, or 52-week.</p>
        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const p = Number(alertPx);
            if (alertKind === "high52" || alertKind === "low52") {
              addAlert({ symbol: bare, name, price: alertKind === "high52" ? pack.high52 : pack.low52, dir: alertKind === "high52" ? "above" : "below", kind: alertKind });
              return;
            }
            if (!(p > 0)) return;
            addAlert({ symbol: bare, name, price: p, dir: alertDir, kind: alertKind });
            setAlertPx("");
          }}
        >
          <select
            className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]"
            value={alertKind}
            onChange={(e) => setAlertKind(e.target.value as AlertKind)}
          >
            <option value="price">Price</option>
            <option value="pct">Day %</option>
            <option value="rsi">RSI</option>
            <option value="volume">Volume ×</option>
            <option value="high52">52w high</option>
            <option value="low52">52w low</option>
          </select>
          {alertKind !== "high52" && alertKind !== "low52" ? (
            <>
              <select
                className="h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]"
                value={alertDir}
                onChange={(e) => setAlertDir(e.target.value as "above" | "below")}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <input
                className="h-8 w-28 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none"
                placeholder={
                  alertKind === "price"
                    ? String(Math.round(px))
                    : alertKind === "pct"
                      ? "3"
                      : alertKind === "rsi"
                        ? "70"
                        : "1.5"
                }
                value={alertPx}
                onChange={(e) => setAlertPx(e.target.value)}
              />
            </>
          ) : null}
          <Button type="submit" size="sm" variant="secondary">
            Pin
          </Button>
        </form>
        {mine.length ? (
          <ul className="mt-3 grid gap-1 text-[13px]">
            {mine.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-muted">
                <span>
                  {a.kind || "price"} · {a.dir} {a.kind === "price" || !a.kind ? fmtPx(a.price) : a.price}
                </span>
                <button type="button" className="text-[12px] hover:text-fg" onClick={() => removeAlert(a.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className={cn(tab !== "chart" && "hidden")}>
        <StructureDesk symbol={symbol} />
      </div>

      <div className={cn(tab !== "chart" && "hidden")}>
        <DealsBlock symbol={bare} name={name} />
      </div>

      <section id="peers" className={cn(tab !== "financials" && "hidden")}>
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
          Peers · {peerPick.line}
        </h2>
        <p className="mt-1 mb-3 text-[12px] text-subtle">
          Closest listed names in the same business, ranked by size — not the rest of the sector.
        </p>
        {insight ? <p className="mb-3 text-[13px] leading-relaxed text-fg">{insight}</p> : null}
        {screen.isPending ? (
          <p className="text-sm text-muted">Peers fill from the live screen once prices are in.</p>
        ) : peers.length ? (
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  {["Name", "Price", "Today", "P/E", "ROCE", "1Y"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {peers.map((r) => (
                  <tr key={r.symbol}>
                    <td className="px-3 py-2">
                      <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="hover:text-chart">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-mono tabular">{fmtPx(r.price)}</td>
                    <td className={cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down")}>{fmtPct(r.changePct)}</td>
                    <td className="px-3 py-2 font-mono tabular">{r.pe != null ? r.pe.toFixed(1) : "—"}</td>
                    <td className="px-3 py-2 font-mono tabular">{r.roce != null ? `${r.roce.toFixed(1)}%` : "—"}</td>
                    <td className={cn("px-3 py-2 font-mono tabular", (r.ret1y ?? 0) >= 0 ? "text-up" : "text-down")}>
                      {r.ret1y == null ? "—" : fmtPct(r.ret1y)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No other listed {peerPick.line} names on the current screen.</p>
        )}
      </section>

      <div id="versus" className={cn(tab !== "chart" && "hidden")}>
        <Versus symbol={symbol} name={name} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-lg tabular">{value}</div>
      {hint ? <div className="text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

function Versus({ symbol, name }: { symbol: string; name: string }) {
  const [benchKey, setBenchKey] = useState("nifty");
  const [range, setRange] = useState<ChartRange>("1Y");
  const bare = bareSymbol(symbol);
  const buyDate = useKosh((s) => {
    let best: string | null = null;
    for (const p of s.portfolios) {
      for (const h of p.holdings) {
        if (bareSymbol(h.symbol) !== bare) continue;
        const d = String(h.date || h.boughtAt || "").slice(0, 10);
        if (d && (!best || d < best)) best = d;
      }
    }
    return best;
  });
  const bench = resolveBench(benchKey);
  const q = useQuery({
    queryKey: ["vs", symbol, bench.symbol],
    queryFn: async () => {
      const [d, n] = await Promise.all([apiHistory(symbol, "max"), apiHistory(bench.symbol, "max")]);
      return { d, mix: pathFromBars(d.bars || [], n.bars || []) };
    },
    staleTime: 5 * 60 * 1000,
  });
  if (q.isPending) return <p className="text-sm text-muted">Loading versus {bench.name}…</p>;
  if (!q.data) return null;
  const mix = q.data.mix;
  const sliced = sliceNav(mix.nav, range);
  const risk = riskMetrics(sliced.length >= 20 ? sliced : mix.nav);
  const windows = {
    y1: windowReturn(mix.nav, 365),
    ytd: ytdReturn(mix.nav),
  };
  const cagr = mixCagr(sliced.length >= 20 ? sliced : mix.nav);
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
            {name} vs {bench.name}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Both lines start at 100 on the first day they both print in the selected window. Window CAGR{" "}
            {dash(cagr, (x) => fmtPct(x))}.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-muted">
          Benchmark
          <BenchPicker value={benchKey} onChange={setBenchKey} />
        </label>
      </div>
      <NavChart
        nav={mix.nav}
        portLabel={symbol}
        benchLabel={bench.name}
        coverage={mix.coverage}
        range={range}
        onRange={setRange}
        fromBuy={buyDate}
      />
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        Beta and alpha are Jensen’s, daily overlapping returns vs this index, Rf 6.5%, on the <b className="font-medium text-fg">{range}</b> window
        {risk.windowLabel ? ` — ${risk.windowLabel}` : ""}. Switch 1Y / 5Y / MAX on the chart to recompute.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="1Y vs index" value={dash(windows.y1.port, (x) => fmtPct(x))} hint={dash(windows.y1.bench, (x) => fmtPct(x) + " index")} />
        <Stat label="YTD" value={dash(windows.ytd.port, (x) => fmtPct(x))} />
        <Stat
          label={`Beta (${range})`}
          value={dash(risk.beta)}
          hint={risk.sessions ? `${risk.sessions} sessions from ${risk.since}` : undefined}
        />
        <Stat
          label={`Alpha (${range})`}
          value={dash(risk.alpha, (x) => fmtPct(x))}
          hint="Jensen, Rf 6.5%"
        />
      </div>
    </section>
  );
}

function dealKind(k: DealEvent["kind"]) {
  if (k === "block") return "Block";
  if (k === "insider") return "Insider";
  return "Bulk";
}

function DealsBlock({ symbol, name }: { symbol: string; name: string }) {
  const q = useQuery({ queryKey: ["macro"], queryFn: apiMacro, staleTime: 8 * 60 * 1000 });
  const bare = bareSymbol(symbol);
  const deals = (q.data?.deals || []).filter((d) => bareSymbol(d.symbol) === bare).slice(0, 16);
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Bulk / block / insider</h2>
      <p className="mt-1 text-[13px] text-muted">
        Recent large trades in {name}. Blank here means none in the latest tape, not a guess.
      </p>
      {q.isPending && !deals.length ? (
        <p className="mt-3 text-sm text-muted">Loading deals…</p>
      ) : deals.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="kosh-table w-full text-left text-[13px]">
            <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Kind</th>
                <th className="px-3 py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d, i) => (
                <tr key={d.kind + d.date + d.note.slice(0, 24) + i}>
                  <td className="px-3 py-2 font-mono tabular">{d.date}</td>
                  <td className="px-3 py-2">{dealKind(d.kind)}</td>
                  <td className="px-3 py-2 text-muted">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">No bulk, block or insider prints for this name recently.</p>
      )}
    </section>
  );
}
