import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketHeat } from "@/components/charts/market-heat";
import { MiniBars, BreadthBar } from "@/components/charts/share-ring";
import { MacroBoard, MarketTempCard, EventCalendar } from "@/components/macro-board";
import { MixNudge } from "@/components/mix-nudge";
import { NewsBoard } from "@/components/news-board";
import { PulseDesk } from "@/components/note-desk";
import { canOpenStock } from "@/components/stock-link";
import { apiNews, apiQuotes, apiScreener, apiTape } from "@/lib/kosh/api";
import { sectorIndex } from "@/lib/kosh/benchmarks";
import { fmtInr, fmtPct, fmtPx } from "@/lib/kosh/engine";
import { overlayQuotes, pickLiveSymbols } from "@/lib/kosh/live-overlay";
import { isIstSession } from "@/lib/kosh/market-hours";
import { applyScreen, sectorPulse } from "@/lib/kosh/screens";
import { cycleSort, sortEntities, sortGlyph, type SortDir } from "@/lib/kosh/kosh-table";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

type HoldKey = "name" | "last" | "chg" | "chgPct" | "value" | "weight";
type WatchKey = "name" | "last" | "chg" | "chgPct";

function SortTh({
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
    <th className={cn("py-1 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        className={cn(
          "inline-flex w-full items-center gap-1 text-[10px] tracking-[0.06em] uppercase",
          align === "right" && "justify-end",
          on ? "text-fg" : "text-subtle",
        )}
        onClick={onClick}
      >
        {label}
        <span aria-hidden>{sortGlyph(on, on ? dir : null)}</span>
      </button>
    </th>
  );
}

export function MarketOverview() {
  const liveSession = isIstSession();
  const tape = useQuery({
    queryKey: ["tape"],
    queryFn: apiTape,
    staleTime: liveSession ? 2_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 5_000 : 60_000),
  });
  const ports = useKosh((s) => s.portfolios);
  const watchlists = useKosh((s) => s.watchlists);
  const activeWatchId = useKosh((s) => s.activeWatchId);
  const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
  const nav = useNavigate();
  const [bookId, setBookId] = useState("all");
  const [listId, setListId] = useState<string | null>(null);
  const [moreHold, setMoreHold] = useState(false);
  const [moreWatch, setMoreWatch] = useState(false);
  const watch = useKosh((s) => s.watch);
  const holdSort = useKosh((s) => s.overviewHoldSort);
  const setOverviewHoldSort = useKosh((s) => s.setOverviewHoldSort);
  const overviewWatchSorts = useKosh((s) => s.overviewWatchSorts);
  const setOverviewWatchSort = useKosh((s) => s.setOverviewWatchSort);
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
  const qBy = useMemo(() => {
    const m = new Map<string, { price: number; previousClose: number; changePct: number; name?: string }>();
    for (const q of quotes.data || []) {
      const k = q.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");
      m.set(k, q);
    }
    return m;
  }, [quotes.data]);
  const holdRows = useMemo(() => {
    const chosen = bookId === "all" ? ports : ports.filter((p) => p.id === bookId);
    const map = new Map<string, { symbol: string; name: string; qty: number }>();
    for (const p of chosen) {
      for (const h of p.holdings) {
        const k = h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");
        if (!k) continue;
        const cur = map.get(k) || { symbol: k, name: h.name || k, qty: 0 };
        cur.qty += h.qty || 0;
        if (h.name) cur.name = h.name;
        map.set(k, cur);
      }
    }
    const draft = [...map.values()].map((r) => {
      const q = qBy.get(r.symbol);
      const screenRow = liveRows.find((x) => x.symbol === r.symbol);
      const last = q && q.price > 0 ? q.price : screenRow && screenRow.price > 0 ? screenRow.price : null;
      const chg = last != null && q && q.previousClose > 0 ? last - q.previousClose : null;
      const chgPct = q && Number.isFinite(q.changePct) ? q.changePct : screenRow?.changePct ?? null;
      const value = last != null && r.qty ? last * r.qty : null;
      return { ...r, last, chg, chgPct, value };
    });
    const total = draft.reduce((s, r) => s + (r.value || 0), 0);
    return draft.map((r) => ({ ...r, weight: r.value != null && total > 0 ? (r.value / total) * 100 : null }));
  }, [bookId, ports, qBy, liveRows]);
  const sortedHold = useMemo(() => {
    if (!holdSort) return sortEntities(holdRows, "value", "desc");
    return sortEntities(holdRows, holdSort.key, holdSort.dir);
  }, [holdRows, holdSort]);
  const activeList = watchlists.find((l) => l.id === (listId || activeWatchId)) || watchlists[0];
  const watchSort = activeList ? overviewWatchSorts[activeList.id] : undefined;
  const embeddedWatch = useMemo(() => {
    const list = (activeList?.symbols || []).map((s) => {
      const k = s.toUpperCase().replace(/\.(NS|BO)$/i, "");
      const q = qBy.get(k);
      const screenRow = liveRows.find((x) => x.symbol === k);
      const last = q && q.price > 0 ? q.price : screenRow && screenRow.price > 0 ? screenRow.price : null;
      const prev = q && q.previousClose > 0 ? q.previousClose : null;
      const chg = last != null && prev != null ? last - prev : null;
      const chgPct = q && Number.isFinite(q.changePct) ? q.changePct : screenRow?.changePct ?? null;
      return { symbol: k, name: q?.name || screenRow?.name || k, last, chg, chgPct };
    });
    if (!watchSort) return list;
    return sortEntities(list, watchSort.key, watchSort.dir);
  }, [activeList, qBy, liveRows, watchSort]);
  function cycleHold(key: HoldKey) {
    const cur = holdSort ? { key: holdSort.key, dir: holdSort.dir as SortDir } : { key: null, dir: null as SortDir };
    const next = cycleSort(cur, key);
    setOverviewHoldSort(next.key && next.dir ? { key: next.key, dir: next.dir } : null);
  }
  function cycleWatch(key: WatchKey) {
    if (!activeList) return;
    const cur = watchSort ? { key: watchSort.key, dir: watchSort.dir as SortDir } : { key: null, dir: null as SortDir };
    const next = cycleSort(cur, key);
    setOverviewWatchSort(activeList.id, next.key && next.dir ? { key: next.key, dir: next.dir } : null);
  }
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
    <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-6 px-3 py-5 sm:px-4 sm:py-6">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
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
        <section className="min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your holdings today</h2>
            <select
              aria-label="Portfolio"
              value={bookId}
              onChange={(e) => {
                setBookId(e.target.value);
                setMoreHold(false);
              }}
              className="h-8 rounded-sm border border-border bg-bg px-2 text-[12px]"
            >
              <option value="all">All</option>
              {ports.filter((p) => p.holdings.length).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {sortedHold.length ? (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12px]">
                  <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
                    <tr>
                      <SortTh label="Name" on={holdSort?.key === "name"} dir={holdSort?.dir || null} onClick={() => cycleHold("name")} />
                      <SortTh label="Last" align="right" on={holdSort?.key === "last"} dir={holdSort?.dir || null} onClick={() => cycleHold("last")} />
                      <SortTh label="Chg" align="right" on={holdSort?.key === "chg"} dir={holdSort?.dir || null} onClick={() => cycleHold("chg")} />
                      <SortTh label="Chg %" align="right" on={holdSort?.key === "chgPct"} dir={holdSort?.dir || null} onClick={() => cycleHold("chgPct")} />
                      <SortTh label="Value" align="right" on={holdSort?.key === "value"} dir={holdSort?.dir || null} onClick={() => cycleHold("value")} />
                      <SortTh label="Weight" align="right" on={holdSort?.key === "weight"} dir={holdSort?.dir || null} onClick={() => cycleHold("weight")} />
                    </tr>
                  </thead>
                  <tbody>
                    {(moreHold ? sortedHold : sortedHold.slice(0, 8)).map((r) => (
                      <tr key={r.symbol} className="border-t border-border/70">
                        <td className="py-1.5">
                          <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="font-medium hover:text-chart">
                            {r.symbol}
                          </Link>
                          <span className="ml-2 text-subtle">{r.name}</span>
                        </td>
                        <td className="py-1.5 text-right font-mono tabular">{r.last != null ? fmtPx(r.last) : "—"}</td>
                        <td className={cn("py-1.5 text-right font-mono tabular", (r.chg ?? 0) >= 0 ? "text-up" : "text-down")}>
                          {r.chg == null ? "—" : `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}`}
                        </td>
                        <td className={cn("py-1.5 text-right font-mono tabular", (r.chgPct ?? 0) >= 0 ? "text-up" : "text-down")}>
                          {r.chgPct == null ? "—" : fmtPct(r.chgPct)}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular">{r.value != null ? fmtInr(r.value) : "—"}</td>
                        <td className="py-1.5 text-right font-mono tabular">{r.weight != null ? r.weight.toFixed(1) + "%" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sortedHold.length > 8 ? (
                <button type="button" className="mt-2 text-[12px] text-chart" onClick={() => setMoreHold((v) => !v)}>
                  {moreHold ? "Show less" : `Show all ${sortedHold.length} names`}
                </button>
              ) : null}
            </>
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

      {watchlists.some((l) => l.symbols.length) || embeddedWatch.length ? (
        <section className="min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Watch</h2>
            <select
              aria-label="Watchlist"
              value={activeList?.id || ""}
              onChange={(e) => {
                setListId(e.target.value);
                setMoreWatch(false);
              }}
              className="h-8 rounded-sm border border-border bg-bg px-2 text-[12px]"
            >
              {watchlists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          {embeddedWatch.length ? (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-[12px]">
                  <thead>
                    <tr>
                      <SortTh label="Name" on={watchSort?.key === "name"} dir={watchSort?.dir || null} onClick={() => cycleWatch("name")} />
                      <SortTh label="Last" align="right" on={watchSort?.key === "last"} dir={watchSort?.dir || null} onClick={() => cycleWatch("last")} />
                      <SortTh label="Chg" align="right" on={watchSort?.key === "chg"} dir={watchSort?.dir || null} onClick={() => cycleWatch("chg")} />
                      <SortTh label="Chg %" align="right" on={watchSort?.key === "chgPct"} dir={watchSort?.dir || null} onClick={() => cycleWatch("chgPct")} />
                    </tr>
                  </thead>
                  <tbody>
                    {(moreWatch ? embeddedWatch : embeddedWatch.slice(0, 8)).map((r) => (
                      <tr key={r.symbol} className="border-t border-border/70">
                        <td className="py-1.5">
                          <Link to="/s/$symbol" params={{ symbol: r.symbol }} className="font-medium hover:text-chart">
                            {r.symbol}
                          </Link>
                          <span className="ml-2 text-subtle">{r.name}</span>
                        </td>
                        <td className="py-1.5 text-right font-mono tabular">{r.last != null ? fmtPx(r.last) : "—"}</td>
                        <td className={cn("py-1.5 text-right font-mono tabular", (r.chg ?? 0) >= 0 ? "text-up" : "text-down")}>
                          {r.chg == null ? "—" : `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}`}
                        </td>
                        <td className={cn("py-1.5 text-right font-mono tabular", (r.chgPct ?? 0) >= 0 ? "text-up" : "text-down")}>
                          {r.chgPct == null ? "—" : fmtPct(r.chgPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {embeddedWatch.length > 8 ? (
                <button type="button" className="mt-2 text-[12px] text-chart" onClick={() => setMoreWatch((v) => !v)}>
                  {moreWatch ? "Show less" : `Show all ${embeddedWatch.length} names`}
                </button>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[13px] text-muted">This list is empty.</p>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Sectors</h2>
        {sectors.length ? (
          <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {sectors.slice(0, 12).map((s) => {
              const idx = sectorIndex(s.sector);
              const body = (
                <>
                  <div className="truncate text-[11px] font-medium">{s.sector}</div>
                  <div className={cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down")}>{fmtPct(s.avg)}</div>
                  <div className="truncate text-[10px] text-subtle">{idx ? idx.name : "No index"}</div>
                </>
              );
              return idx ? (
                <button
                  key={s.sector}
                  type="button"
                  className={cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20")}
                  onClick={() => {
                    setDeskSymbol(idx.symbol, idx.name);
                    void nav({ to: "/markets", search: { view: "terminal" } });
                  }}
                >
                  {body}
                </button>
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
