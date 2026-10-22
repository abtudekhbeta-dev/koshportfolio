import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useChartFullscreen } from "@/components/charts/use-fullscreen";
import { BreadthBar, MiniBars } from "@/components/charts/share-ring";
import { CompanyLogo } from "@/components/company-logo";
import { MarketHeat } from "@/components/charts/market-heat";
import { EventCalendar } from "@/components/macro-board";
import { MixNudge } from "@/components/mix-nudge";
import { NewsBoard } from "@/components/news-board";
import { PulseDesk } from "@/components/note-desk";
import { IndexHeat } from "@/components/terminal/index-heat";
import { MarketFlowsGlance } from "@/components/terminal/market-flows";
import { apiNews, apiQuotes, apiScreener, apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { instrumentKind, terminalSearch } from "@/lib/kosh/instrument-nav";
import { overlayQuotes, pickLiveSymbols } from "@/lib/kosh/live-overlay";
import { isIstSession } from "@/lib/kosh/market-hours";
import { freshestPrint, tapeFreshness } from "@/lib/kosh/market-data";
import { NIFTY_CATALOGUE } from "@/lib/kosh/nifty-catalogue";
import { sectorIndex } from "@/lib/kosh/benchmarks";
import { sortEntities, type SortDir } from "@/lib/kosh/kosh-table";
import {
  boardCounts,
  buildStockBoard,
  filterBoard,
  pageOf,
  type BoardTab,
} from "@/lib/kosh/stock-board";
import { sectorPulse, applyScreen } from "@/lib/kosh/screens";
import { bareSymbol, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/kosh/types";

const TermChart = lazy(() => import("@/components/terminal/term-chart").then((m) => ({ default: m.TermChart })));

const PAGE = 20;
type SortKey = "name" | "last" | "chg" | "chgPct";

function fmtChg(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n === 0) return "0.00";
  return (n > 0 ? "+" : "−") + fmtPx(Math.abs(n));
}

function absFromPct(price: number, pct: number) {
  if (!(price > 0) || !Number.isFinite(pct) || pct <= -100) return null;
  return price - price / (1 + pct / 100);
}

function istStamp(ms: number | null | undefined) {
  if (!ms || ms <= 0) return null;
  const d = new Date(ms + 19800 * 1000);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${mon} ${hh}:${mm} IST`;
}

export function ClassicOverview() {
  const liveSession = isIstSession();
  const ports = useKosh((s) => s.portfolios);
  const watchlists = useKosh((s) => s.watchlists);
  const activeWatchId = useKosh((s) => s.activeWatchId);
  const [bookId, setBookId] = useState("all");
  const [listId, setListId] = useState<string | null>(null);
  const [tab, setTab] = useState<BoardTab>("all");
  const [q, setQ] = useState("");
  const [dir, setDir] = useState<"any" | "up" | "down">("any");
  const [membership, setMembership] = useState<"any" | "both" | "multi" | "watch-only">("any");
  const [filters, setFilters] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "chgPct", dir: "desc" });
  const [page, setPage] = useState(1);
  const [chartSym, setChartSym] = useState<string | null>(null);
  const [interval, setInterval] = useState("D");
  const [style, setStyle] = useState<"candle" | "line">("candle");
  const [wide, setWide] = useState(true);
  const [stocksView, setStocksView] = useState<"table" | "heat">("table");
  const [chartLabel, setChartLabel] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const { fs, fallback, toggle: toggleFs } = useChartFullscreen(panelRef);
  const fsRef = useRef(false);
  fsRef.current = fs;

  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    staleTime: liveSession ? 2_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 5_000 : 60_000),
  });
  const indexQuotes = useQuery({
    queryKey: ["nifty-catalogue"],
    queryFn: () => apiQuotes(NIFTY_CATALOGUE.map((s) => s.symbol)),
    staleTime: liveSession ? 2_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 5_000 : 60_000),
  });
  const screen = useQuery({
    queryKey: ["screener"],
    queryFn: apiScreener,
    staleTime: liveSession ? 30_000 : 10 * 60_000,
    refetchInterval: () => (isIstSession() ? 60_000 : 5 * 60_000),
  });
  const screenRows = screen.data?.rows || [];
  const activeList = watchlists.find((l) => l.id === (listId || activeWatchId)) || watchlists[0];
  const membershipKey = `${bookId}|${activeList?.id || ""}|${ports
    .map((p) => p.id + ":" + p.holdings.map((h) => `${h.symbol}:${h.qty}`).join(","))
    .join(";")}|${(activeList?.symbols || []).join(",")}`;
  const universe = useMemo(
    () =>
      buildStockBoard({
        portfolios: ports.map((p) => ({ id: p.id, name: p.name, holdings: p.holdings })),
        bookId,
        watchSymbols: activeList?.symbols || [],
      }).map((r) => r.symbol),
    [membershipKey],
  );
  const [focus, setFocus] = useState<string[]>([]);
  const upSeed = useMemo(() => applyScreen(screenRows, "up").slice(0, 12), [screenRows]);
  const downSeed = useMemo(() => applyScreen(screenRows, "down").slice(0, 12), [screenRows]);
  const liveSyms = useMemo(
    () =>
      pickLiveSymbols(
        focus.length ? focus : universe.slice(0, PAGE),
        [],
        upSeed.map((r) => r.symbol),
        downSeed.map((r) => r.symbol),
        stocksView === "heat" ? 80 : 56,
      ),
    [focus.join(","), universe.join(","), upSeed, downSeed, stocksView],
  );
  const quotes = useQuery({
    queryKey: ["live-tape", liveSyms.join(",")],
    queryFn: () => apiQuotes(liveSyms),
    enabled: liveSyms.length > 0,
    staleTime: liveSession ? 1_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 3_000 : 60_000),
    placeholderData: (prev) => prev,
  });
  const priced = useMemo(
    () =>
      buildStockBoard({
        portfolios: ports.map((p) => ({ id: p.id, name: p.name, holdings: p.holdings })),
        bookId,
        watchSymbols: activeList?.symbols || [],
        screens: screenRows,
        quotes: quotes.data || [],
      }),
    [membershipKey, screenRows, quotes.data],
  );
  const filtered = useMemo(() => filterBoard(priced, { tab, q, dir, membership }), [priced, tab, q, dir, membership]);
  const sorted = useMemo(() => sortEntities(filtered, sort.key, sort.dir), [filtered, sort]);
  const view = pageOf(sorted, page, PAGE);
  const shown = view.rows;
  const pageSymbols = shown.map((r) => r.symbol);
  const quoteFocus = stocksView === "heat" ? sorted.map((r) => r.symbol).slice(0, 72) : pageSymbols;
  useEffect(() => {
    const next = quoteFocus.join(",");
    setFocus((cur) => (cur.join(",") === next ? cur : quoteFocus));
  }, [quoteFocus.join(",")]);
  const news = useQuery({
    queryKey: ["news", "NIFTY", "market"],
    queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
    staleTime: 10 * 60_000,
  });

  const counts = boardCounts(priced);
  const fresh = tapeFreshness(tape.data, isIstSession());
  const tapeBest = freshestPrint(tape.data);
  const tapeStamp = istStamp(tapeBest?.marketTime || tapeBest?.retrievedAt || null);
  const SUMMARY = [
    { id: "nifty", label: "Nifty 50" },
    { id: "sensex", label: "Sensex" },
    { id: "bank", label: "Bank Nifty" },
  ] as const;
  const tapeById = new Map((tape.data || []).map((row) => [row.id, row]));
  const breadthRows = screenRows.filter((row) => Number.isFinite(row.changePct));
  const advancing = breadthRows.filter((row) => row.changePct > 0).length;
  const unchanged = breadthRows.filter((row) => row.changePct === 0).length;
  const liveRows = useMemo(() => overlayQuotes(screenRows, quotes.data), [screenRows, quotes.data]);
  const screenSectors = useMemo(() => sectorPulse(screenRows), [screenRows]);
  const winners = overlayQuotes(upSeed, quotes.data)
    .slice()
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 8);
  const losers = overlayQuotes(downSeed, quotes.data)
    .slice()
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 8);
  const chartRow = chartSym ? priced.find((r) => r.symbol === chartSym) || null : null;
  const chartQuote: Quote | null =
    (quotes.data || []).find((q) => bareSymbol(q.symbol) === chartSym || bareSymbol(q.input) === chartSym) ||
    (indexQuotes.data || []).find((q) => bareSymbol(q.symbol) === bareSymbol(chartSym || "") || bareSymbol(q.input) === bareSymbol(chartSym || "")) ||
    null;
  const filterCount = (dir !== "any" ? 1 : 0) + (membership !== "any" ? 1 : 0);
  const indexStamp = istStamp(freshestPrint(indexQuotes.data)?.marketTime || freshestPrint(indexQuotes.data)?.retrievedAt || null);

  useEffect(() => {
    setPage(1);
  }, [tab, q, dir, membership, bookId, listId, sort.key, sort.dir]);

  useEffect(() => {
    if (!chartSym) return;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (wide) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [chartSym]);

  useEffect(() => {
    if (!chartSym) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (fsRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("[role='dialog']")) return;
      setChartSym(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chartSym]);

  function cycle(key: SortKey) {
    setSort((cur) => {
      if (cur.key !== key) return { key, dir: "desc" };
      if (cur.dir === "desc") return { key, dir: "asc" };
      return { key: "name", dir: "asc" };
    });
  }

  function openChart(symbol: string, name?: string) {
    const top = scrollRef.current?.scrollTop || 0;
    setChartLabel(name || null);
    setChartSym(symbol);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = top;
    });
  }

  return (
    <div className="mx-auto min-w-0 max-w-[1680px] overflow-x-clip px-3 py-4 sm:px-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Market Overview</h1>
          <p className="mt-1 text-[13px] text-muted">Track your portfolio and watchlist stocks with market context.</p>
        </div>
        <p className="text-right text-[11px] text-subtle" title={fresh.title}>
          {fresh.state === "last" ? "Last session" : fresh.label}
          {tapeStamp ? ` · ${tapeStamp}` : ""}
          {quotes.isFetching ? " · Refreshing quotes" : ""}
        </p>
      </header>

      <section className="mt-4 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4">
        {SUMMARY.map((item) => {
          const t = tapeById.get(item.id);
          const abs = t && t.price > 0 && Number.isFinite(t.changePct) ? absFromPct(t.price, t.changePct) : null;
          const body = (
            <>
              <div className="text-[10px] tracking-[0.08em] text-subtle uppercase">{item.label}</div>
              <div className="mt-auto pt-1 font-mono text-[16px] leading-none tabular">{t?.price ? fmtPx(t.price) : "—"}</div>
              <div className={cn("mt-1 font-mono text-[12px] leading-tight tabular", (t?.changePct || 0) >= 0 ? "text-up" : "text-down")}>
                {abs == null ? "—" : `${fmtChg(abs)} · ${fmtPct(t?.changePct || 0)}`}
              </div>
            </>
          );
          const cls = "flex h-full min-h-[4.5rem] flex-col rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]";
          return t && instrumentKind(t.symbol) === "index" ? (
            <Link key={item.id} to="/markets" search={terminalSearch(t.symbol, item.label)} className={cls} aria-label={`Open ${item.label} in Terminal`}>
              {body}
            </Link>
          ) : (
            <div key={item.id} className={cls}>
              {body}
            </div>
          );
        })}
        <div className="flex h-full min-h-[4.5rem] flex-col rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]">
          <div className="text-[10px] tracking-[0.08em] text-subtle uppercase">Market breadth</div>
          <div className="mt-auto pt-1">
            {breadthRows.length ? (
              <BreadthBar green={advancing} n={breadthRows.length} unchanged={unchanged} />
            ) : (
              <p className="text-[12px] text-muted">{screen.isError ? "Breadth unavailable." : "Waiting on the screen."}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-4">
        <IndexHeat
          quotes={indexQuotes.data || []}
          pending={indexQuotes.isPending}
          failed={indexQuotes.isError}
          stamp={indexStamp}
          live={liveSession}
          onChart={openChart}
        />
      </div>

      <section className={cn("mt-4 min-w-0", chartSym && wide && "lg:grid lg:grid-cols-[minmax(300px,48%)_minmax(0,52%)] lg:items-start", chartSym && !wide && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,40%)] lg:items-start")}>
        <div ref={scrollRef} className="min-w-0 rounded-lg bg-surface shadow-[var(--shadow-border)]">
          <div className="border-b border-border px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold">Your stocks</h2>
                <p className="text-[11px] text-subtle">One row when a name is both held and watched. The chart stays closed until you ask.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search symbol or name"
                  aria-label="Search stocks"
                  className="h-8 w-44 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)] outline-none"
                />
                <select
                  aria-label="Portfolio"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]"
                >
                  <option value="all">All portfolios</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {watchlists.length ? (
                  <select
                    aria-label="Watchlist"
                    value={activeList?.id || ""}
                    onChange={(e) => {
                      setListId(e.target.value);
                    }}
                    className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]"
                  >
                    {watchlists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button type="button" className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]" onClick={() => setFilters((v) => !v)}>
                  Filters{filterCount ? ` · ${filterCount}` : ""}
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Stock set">
                {(
                  [
                    ["all", "All stocks", counts.all],
                    ["owned", "Owned", counts.owned],
                    ["watch", "Watchlist", counts.watch],
                  ] as const
                ).map(([id, label, n]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    className={cn("h-8 rounded-sm px-2.5 text-[12px]", tab === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}
                    onClick={() => setTab(id)}
                  >
                    {label} <span className="text-subtle">{n}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-subtle">
                {stocksView === "heat"
                  ? `${sorted.length} names in this filter`
                  : view.total
                    ? `${view.from}–${view.to} of ${view.total}`
                    : "0 names"}
                {quotes.isError ? " · Quotes unavailable. Screen prices are marked." : ""}
              </p>
              <div className="ml-auto flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Stocks view">
                <button type="button" role="tab" aria-selected={stocksView === "table"} className={cn("h-7 rounded-sm px-2 text-[11px]", stocksView === "table" ? "bg-surface text-fg" : "text-muted")} onClick={() => setStocksView("table")}>
                  Table
                </button>
                <button type="button" role="tab" aria-selected={stocksView === "heat"} className={cn("h-7 rounded-sm px-2 text-[11px]", stocksView === "heat" ? "bg-surface text-fg" : "text-muted")} onClick={() => setStocksView("heat")}>
                  Heatmap
                </button>
              </div>
            </div>
            {filters ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <select aria-label="Daily change" value={dir} onChange={(e) => setDir(e.target.value as typeof dir)} className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]">
                  <option value="any">Any daily change</option>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                </select>
                <select
                  aria-label="Membership"
                  value={membership}
                  onChange={(e) => setMembership(e.target.value as typeof membership)}
                  className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]"
                >
                  <option value="any">Any membership</option>
                  <option value="both">Owned and watched</option>
                  <option value="multi">Held in 2+ portfolios</option>
                  <option value="watch-only">Watchlist only</option>
                </select>
              </div>
            ) : null}
          </div>
          {stocksView === "heat" ? (
            <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.length ? (
                sorted.map((row) => (
                  <button
                    key={row.symbol}
                    type="button"
                    onClick={() => openChart(row.symbol, row.name)}
                    className={cn(
                      "min-h-[72px] rounded-sm px-2 py-1.5 text-left transition-colors duration-300",
                      row.chgPct == null
                        ? "bg-surface-2 text-muted"
                        : row.chgPct >= 1.5
                          ? "bg-up/70 text-fg"
                          : row.chgPct > 0
                            ? "bg-up/25 text-fg"
                            : row.chgPct <= -1.5
                              ? "bg-down/70 text-fg"
                              : row.chgPct < 0
                                ? "bg-down/25 text-fg"
                                : "bg-surface-2 text-fg",
                    )}
                  >
                    <div className="truncate text-[12px] font-medium">{row.name}</div>
                    <div className="text-[10px] text-subtle">{row.symbol}</div>
                    <div className="mt-1 font-mono text-[14px] tabular">{row.chgPct == null ? "—" : fmtPct(row.chgPct)}</div>
                    <div className="font-mono text-[10px] tabular">{row.last != null ? fmtPx(row.last) : "No quote"}</div>
                  </button>
                ))
              ) : (
                <p className="col-span-full py-6 text-center text-[13px] text-muted">Nothing matches this search.</p>
              )}
            </div>
          ) : (
          <>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <Th label="Name" on={sort.key === "name"} dir={sort.dir} onClick={() => cycle("name")} />
                  <Th label="Last" align="right" on={sort.key === "last"} dir={sort.dir} onClick={() => cycle("last")} />
                  <Th label="Chg" align="right" on={sort.key === "chg"} dir={sort.dir} onClick={() => cycle("chg")} />
                  <Th label="Chg %" align="right" on={sort.key === "chgPct"} dir={sort.dir} onClick={() => cycle("chgPct")} />
                  <th className="w-16 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.symbol} className={cn("border-t border-border/70 transition-colors", chartSym === r.symbol && "bg-accent/10")}>
                    <td className="max-w-[18rem] py-2 pr-2 pl-3">
                      <span className="inline-flex items-center gap-2">
                        <CompanyLogo symbol={r.symbol} name={r.name} size={18} />
                        <span>
                          <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="font-medium hover:text-chart">
                            {r.symbol}
                          </Link>
                          <span className="ml-2 text-subtle">{r.name}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono tabular" title={r.source === "screen" ? "Screen price, not a fresh quote" : r.source === "none" ? "No quote" : undefined}>
                      {r.last != null ? fmtPx(r.last) : "—"}
                    </td>
                    <td className={cn("py-2 text-right font-mono tabular", (r.chg ?? 0) > 0 ? "text-up" : (r.chg ?? 0) < 0 ? "text-down" : "")}>{fmtChg(r.chg)}</td>
                    <td className={cn("py-2 text-right font-mono tabular", (r.chgPct ?? 0) > 0 ? "text-up" : (r.chgPct ?? 0) < 0 ? "text-down" : "")}>
                      {r.chgPct == null ? "—" : fmtPct(r.chgPct)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button type="button" className="text-[12px] text-chart hover:underline" onClick={() => openChart(r.symbol, r.name)}>
                        Chart
                      </button>
                    </td>
                  </tr>
                ))}
                {!shown.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[13px] text-muted">
                      {priced.length ? "Nothing matches this search." : "No holdings or watchlist symbols yet."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-subtle">
            <span>
              {view.total} names. Quotes cover this page first. A missing print is not zero.
            </span>
            <div className="flex gap-1">
              <button type="button" className="h-8 rounded-sm px-2 disabled:opacity-40" disabled={view.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <span className="px-1 py-2">
                {view.page} / {view.pages}
              </span>
              <button type="button" className="h-8 rounded-sm px-2 disabled:opacity-40" disabled={view.page >= view.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
          </>
          )}
        </div>

        {chartSym ? (
          <aside
            ref={panelRef}
            className={cn(
              "fixed inset-0 z-40 flex flex-col bg-bg lg:static lg:z-auto lg:ml-3 lg:h-[min(78vh,820px)] lg:overflow-hidden lg:rounded-lg lg:shadow-[var(--shadow-border)] motion-reduce:transition-none",
              fallback && "!fixed inset-0 z-[80] h-dvh max-h-none w-screen rounded-none",
            )}
            aria-label="Selected stock chart"
          >
            <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-2">
              <div className="min-w-0">
                <h2 className="truncate text-[16px] font-semibold">{chartLabel || chartRow?.name || chartSym}</h2>
                <p className="text-[11px] text-subtle">
                  {chartSym}
                  {chartRow?.last != null ? ` · ${fmtPx(chartRow.last)}` : chartQuote?.price ? ` · ${fmtPx(chartQuote.price)}` : " · No quote"}
                  {chartRow?.chgPct != null ? ` · ${fmtPct(chartRow.chgPct)}` : chartQuote && Number.isFinite(chartQuote.changePct) ? ` · ${fmtPct(chartQuote.changePct)}` : ""}
                  {chartRow?.source === "screen" ? " · Screen price, not a fresh quote" : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                <button type="button" className="hidden h-8 rounded-sm px-2 text-[11px] text-muted lg:inline" onClick={() => setWide((v) => !v)}>
                  {wide ? "Narrow" : "Wider"}
                </button>
                <button type="button" className="h-8 rounded-sm px-2 text-[11px] text-muted hover:text-fg" onClick={() => void toggleFs()}>
                  {fs ? "Exit fullscreen" : "Fullscreen"}
                </button>
                <Link to="/markets" search={terminalSearch(chartSym, chartLabel || chartRow?.name || chartSym)} className="h-8 px-2 text-[11px] text-muted hover:text-fg">
                  Open in Terminal
                </Link>
                <button ref={closeRef} type="button" className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]" onClick={() => setChartSym(null)}>
                  Close chart
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Suspense fallback={<p className="p-4 text-[13px] text-muted">Loading the chart…</p>}>
                <TermChart
                  key={chartSym}
                  symbol={chartSym}
                  name={chartLabel || chartRow?.name || chartSym}
                  interval={interval}
                  quote={chartQuote}
                  active
                  embed
                  style={style}
                  owned={chartRow?.owned ? chartRow.portfolios.map((p) => p.name).join(", ") : null}
                  onActivate={() => {}}
                  onInterval={setInterval}
                  onStyle={setStyle}
                />
              </Suspense>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-2">
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Winners</h2>
          <p className="mt-1 text-[12px] text-subtle">Largest advances on the screen, refreshed with the live tape.</p>
          {winners.length ? (
            <div className="mt-3">
              <MiniBars
                items={winners.map((r) => ({
                  name: r.symbol,
                  sub: r.name,
                  symbol: r.symbol,
                  value: r.changePct,
                  label: fmtPct(r.changePct),
                  tone: "up" as const,
                }))}
              />
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-muted">{screen.isError ? "Winners unavailable." : "Waiting on the screen."}</p>
          )}
        </section>
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Losers</h2>
          <p className="mt-1 text-[12px] text-subtle">Largest declines on the screen, same tape as Studio and Ledger.</p>
          {losers.length ? (
            <div className="mt-3">
              <MiniBars
                items={losers.map((r) => ({
                  name: r.symbol,
                  sub: r.name,
                  symbol: r.symbol,
                  value: r.changePct,
                  label: fmtPct(r.changePct),
                  tone: "down" as const,
                }))}
              />
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-muted">{screen.isError ? "Losers unavailable." : "Waiting on the screen."}</p>
          )}
        </section>
      </section>

      <MarketFlowsGlance />

      <section className="mt-6" aria-label="Sectors">
        <h2 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors</h2>
        {screenSectors.length ? (
          <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {screenSectors.slice(0, 12).map((s) => {
              const idx = sectorIndex(s.sector);
              const body = (
                <>
                  <div className="truncate text-[11px] font-medium">{s.sector}</div>
                  <div className={cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down")}>{fmtPct(s.avg)}</div>
                  <div className="truncate text-[10px] text-subtle">{idx ? idx.name : "No index"}</div>
                </>
              );
              return idx ? (
                <Link
                  key={s.sector}
                  to="/markets"
                  search={terminalSearch(idx.symbol, idx.name)}
                  aria-label={`Open ${idx.name} in Terminal`}
                  className={cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20")}
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={s.sector}
                  title="No matching sector index on file. Kosh does not substitute a different index."
                  className={cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20")}
                >
                  {body}
                </div>
              );
            })}
          </div>
        ) : null}
        {screen.isPending && !screenRows.length ? (
          <p className="text-[13px] text-muted">Loading the market heat…</p>
        ) : screen.isError && !screenRows.length ? (
          <p className="text-[13px] text-muted">Market heat unavailable.</p>
        ) : (
          <MarketHeat rows={liveRows} />
        )}
      </section>

      <div className="mt-6 grid gap-6">
        <EventCalendar />
        <PulseDesk />
        <NewsBoard title="Market headlines" items={news.data} loading={news.isPending} shareTitle="Indian market" extra="Nifty Sensex" />
        <MixNudge where="markets" />
      </div>
    </div>
  );
}

function Th({
  label,
  on,
  dir,
  align,
  onClick,
}: {
  label: string;
  on: boolean;
  dir: SortDir;
  align?: "right";
  onClick: () => void;
}) {
  return (
    <th className={cn("px-2 py-2 font-medium", align === "right" && "text-right")}>
      <button type="button" className={cn("inline-flex items-center gap-1", align === "right" && "ml-auto")} onClick={onClick} aria-pressed={on}>
        {label}
        <span aria-hidden>{on ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    </th>
  );
}
