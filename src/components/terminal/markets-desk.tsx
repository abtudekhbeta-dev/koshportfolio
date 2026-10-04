import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Columns2, LayoutGrid, Maximize2, Minimize2, Square } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { apiQuotes } from "@/lib/kosh/api";
import { isIstSession, istClock } from "@/lib/kosh/market-hours";
import { MARKET_PROVIDER, quoteMap, quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import type { PatternHit } from "@/lib/kosh/patterns";
import type { Quote } from "@/lib/kosh/types";
import { bareSymbol, useKosh, type DeskLayout } from "@/lib/store";
import { TERM_HEIGHT, snapTermHeight, termHeightName } from "@/lib/kosh/term-height";
import { useAppLayout } from "@/lib/layout-mode";
import { Tooltip } from "@/components/ui/tooltip";
import { useChartFullscreen } from "@/components/charts/use-fullscreen";
import { cn } from "@/lib/utils";
import { TermChart } from "./term-chart";
import { WatchPane } from "./watch-pane";
import { IntelPanel, INTEL_TABS } from "./intel-panel";

const DESK_SPLIT = { main: 74, watch: 26 };

function ownedNotes(
  ports: { holdings: { symbol: string; qty: number }[] }[],
  quotes: Quote[] | undefined,
): Record<string, { badge: string; line: string }> {
  const qmap = quoteMap(quotes);
  const out: Record<string, { badge: string; line: string }> = {};
  for (const p of ports) {
    let total = 0;
    const vals: { k: string; v: number }[] = [];
    for (const h of p.holdings) {
      const k = bareSymbol(h.symbol);
      if (!k) continue;
      const px = qmap.get(k)?.price || 0;
      const v = (h.qty || 0) * px;
      vals.push({ k, v });
      if (v > 0) total += v;
    }
    for (const row of vals) {
      if (total > 0 && row.v > 0) {
        const w = (row.v / total) * 100;
        out[row.k] = {
          badge: `Owned · ${w.toFixed(1)}%`,
          line: `You own this stock · ${w.toFixed(1)}% portfolio weight.`,
        };
      } else if (!out[row.k]) {
        out[row.k] = { badge: "Owned", line: "You own this stock." };
      }
    }
  }
  return out;
}

const marketsRoute = getRouteApi("/markets");

export function MarketsDesk() {
  const { symbol: focusSymbol, name: focusName } = marketsRoute.useSearch();
  const desk = useKosh((s) => s.desk);
  const patchDesk = useKosh((s) => s.patchDesk);
  const setDeskPane = useKosh((s) => s.setDeskPane);
  const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
  const termHeight = snapTermHeight(useKosh((s) => s.chartPrefs.termHeight || TERM_HEIGHT.standard));
  const appLayout = useAppLayout();
  const deskSplit =
    appLayout === "terminal" ? { main: 82, watch: 18 } : appLayout === "research" ? { main: 62, watch: 38 } : DESK_SPLIT;
  const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
  const watch = useKosh((s) => s.watch);
  const ports = useKosh((s) => s.portfolios);
  const [wide, setWide] = useState(true);
  const [watchOpen, setWatchOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const deskRef = useRef<HTMLDivElement>(null);
  const { fs, fallback, toggle: toggleFs } = useChartFullscreen(deskRef);
  const [hits, setHits] = useState<PatternHit[]>([]);
  const onHits = useCallback((next: PatternHit[]) => {
    setHits((prev) => {
      if (prev === next) return prev;
      if (prev.length === 0 && next.length === 0) return prev;
      if (
        prev.length === next.length &&
        prev.every(
          (h, i) =>
            h.kind === next[i]?.kind &&
            h.label === next[i]?.label &&
            h.status === next[i]?.status &&
            h.note === next[i]?.note,
        )
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const fn = () => setWide(m.matches);
    fn();
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!focusSymbol) return;
    let cancel = false;
    const apply = () => {
      if (!cancel) setDeskSymbol(focusSymbol, focusName || focusSymbol);
    };
    if (useKosh.persist.hasHydrated()) apply();
    const unsub = useKosh.persist.onFinishHydration(apply);
    return () => {
      cancel = true;
      unsub();
    };
  }, [focusSymbol, focusName, setDeskSymbol]);

  const layout: DeskLayout = wide ? desk.layout : 1;
  const visible = desk.panes.slice(0, layout);
  const liveSyms = useMemo(() => {
    const s = new Set<string>();
    for (const p of visible) s.add(bareSymbol(p.symbol));
    for (const w of watch) s.add(bareSymbol(w));
    for (const p of ports) {
      for (const h of p.holdings) s.add(bareSymbol(h.symbol));
    }
    return [...s].filter(Boolean).slice(0, 48);
  }, [visible.map((p) => p.symbol).join(","), watch.join(","), ports.map((p) => p.holdings.map((h) => h.symbol).join(",")).join("|")]);

  const session = isIstSession();
  const quotesQ = useQuery({
    queryKey: ["term-quotes", liveSyms.join(",")],
    queryFn: () => apiQuotes(liveSyms),
    enabled: liveSyms.length > 0,
    staleTime: session ? 1_500 : 30_000,
    refetchInterval: () => (isIstSession() ? 3_000 : 60_000),
    placeholderData: (prev) => prev,
  });
  const qmap = useMemo(() => quoteMap(quotesQ.data), [quotesQ.data]);
  const notes = useMemo(() => ownedNotes(ports, quotesQ.data), [ports, quotesQ.data]);
  const active = desk.panes[desk.activePane] || desk.panes[0];
  const activeQ = qmap.get(bareSymbol(active.symbol));
  const tapeStatus = quoteStatus({
    session,
    price: activeQ?.price || quotesQ.data?.find((q) => q.price > 0)?.price || 0,
  });

  const workspace = (
    <div className="flex h-full min-h-0 min-w-0">
      <div
        className={cn(
          "grid h-full min-h-0 min-w-0 flex-1 auto-rows-fr gap-px bg-border",
          layout === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        )}
      >
        {visible.map((pane, i) => (
          <TermChart
            key={pane.symbol + "-" + i}
            symbol={pane.symbol}
            name={pane.name}
            interval={pane.interval}
            quote={qmap.get(bareSymbol(pane.symbol))}
            active={desk.activePane === i}
            style={desk.style}
            owned={notes[bareSymbol(pane.symbol)]?.badge || null}
            onActivate={() => patchDesk({ activePane: i as 0 | 1 | 2 | 3 })}
            onInterval={(id) => setDeskPane(i, { interval: id })}
            onStyle={(next) => patchDesk({ style: next })}
            onPatterns={desk.activePane === i ? onHits : undefined}
          />
        ))}
      </div>
    </div>
  );

  const watchEl = (
    <WatchPane
      quotes={quotesQ.data}
      activeSymbol={active.symbol}
      owned={Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, v.badge]))}
      onPick={(symbol, name) => {
        setDeskSymbol(symbol, name);
      }}
    />
  );

  const intel = (
    <IntelPanel
      symbol={active.symbol}
      name={active.name}
      quote={activeQ}
      owned={notes[bareSymbol(active.symbol)]?.line || null}
      tab={desk.intelTab}
      onTab={(id) => patchDesk({ intelTab: id })}
      patterns={hits}
    />
  );

  const chartBox = (
    <div
      className={cn("min-h-0 shrink-0", fs && "min-h-[240px] flex-1")}
      style={fs ? undefined : { height: termHeight, maxHeight: "calc(100% - 2.75rem)" }}
      data-term-height={termHeight}
    >
      {workspace}
    </div>
  );

  const tabRow = (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-border px-2" data-term-tabs>
      {INTEL_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          data-term-tab={t.id}
          aria-pressed={detailsOpen && desk.intelTab === t.id}
          onClick={() => {
            if (detailsOpen && desk.intelTab === t.id) setDetailsOpen(false);
            else {
              patchDesk({ intelTab: t.id });
              setDetailsOpen(true);
            }
          }}
          className={cn(
            "h-10 shrink-0 px-2.5 text-[12px] font-medium",
            detailsOpen && desk.intelTab === t.id ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const mainCol = (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden" data-term-workspace>
      {chartBox}
      {tabRow}
      {detailsOpen ? (
        <div
          data-term-details
          className="absolute inset-x-0 bottom-10 z-20 max-h-[min(420px,46%)] overflow-y-auto border-t border-border bg-bg shadow-[var(--shadow-border)]"
        >
          {intel}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      ref={deskRef}
      data-markets-desk
      data-term-fs={fs ? "1" : "0"}
      className={cn("flex min-h-0 flex-1 flex-col bg-bg", fs && "h-dvh", fallback && "kosh-term-fs")}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-2 py-1.5 sm:px-3">
        <div className="flex items-center gap-0.5 rounded-sm bg-bg-elevated p-0.5">
          {(
            [
              [1, Square, "1 chart"],
              [2, Columns2, "2 charts"],
              [4, LayoutGrid, "4 charts"],
            ] as const
          ).map(([n, Icon, label]) => (
            <Tooltip key={n} content={label}>
              <button
                type="button"
                data-layout={n}
                disabled={!wide && n !== 1}
                aria-label={label}
                onClick={() => patchDesk({ layout: n, activePane: n === 1 ? 0 : desk.activePane < n ? desk.activePane : 0 })}
                className={cn(
                  "grid size-8 place-items-center rounded-[6px]",
                  layout === n ? "bg-surface text-fg" : "text-muted hover:text-fg",
                  !wide && n !== 1 && "opacity-40",
                )}
              >
                <Icon className="size-3.5" />
              </button>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center gap-0.5 rounded-sm bg-bg-elevated p-0.5" role="group" aria-label="Chart height">
          {(
            [
              ["compact", "S", TERM_HEIGHT.compact],
              ["standard", "M", TERM_HEIGHT.standard],
              ["tall", "L", TERM_HEIGHT.tall],
            ] as const
          ).map(([name, label, px]) => (
            <button
              key={name}
              type="button"
              aria-label={`${name} chart height`}
              aria-pressed={termHeightName(termHeight) === name}
              disabled={fs}
              onClick={() => patchChartPrefs({ termHeight: px })}
              className={cn(
                "h-8 min-w-8 rounded-[6px] px-2 text-[11px] font-medium",
                termHeightName(termHeight) === name ? "bg-surface text-fg" : "text-muted hover:text-fg",
                fs && "opacity-40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Tooltip content={watchOpen ? "Close watchlist" : "Open watchlist"}>
          <button
            type="button"
            aria-label={watchOpen ? "Close watchlist" : "Open watchlist"}
            onClick={() => setWatchOpen((v) => !v)}
            className={cn(
              "h-8 rounded-sm px-2 text-[11px] font-medium",
              watchOpen ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            Watchlist
          </button>
        </Tooltip>
        <button
          type="button"
          data-sync-tf
          onClick={() => patchDesk({ syncTf: !desk.syncTf })}
          className={cn(
            "h-8 rounded-sm px-2 text-[11px] font-medium",
            desk.syncTf ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
          )}
        >
          Sync TF
        </button>
        <button
          type="button"
          onClick={() => patchDesk({ style: desk.style === "candle" ? "line" : "candle" })}
          className="h-8 rounded-sm px-2 text-[11px] font-medium text-muted hover:text-fg"
        >
          {desk.style === "candle" ? "Candles" : "Line"}
        </button>
        <span
          data-session-chip
          className={cn(
            "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]",
            tapeStatus === "session" ? "bg-up/15 text-up" : tapeStatus === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down",
          )}
          title={`${MARKET_PROVIDER.note} ${MARKET_PROVIDER.name}.`}
        >
          {tapeStatus === "session"
            ? `● ${quoteStatusLabel(tapeStatus, activeQ?.delayMin)} · ${istClock()}`
            : quoteStatusLabel(tapeStatus, activeQ?.delayMin)}
        </span>
        <Tooltip content={fs ? "Exit fullscreen" : "Fullscreen"}>
          <button
            type="button"
            aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
            data-term-fullscreen
            onClick={() => void toggleFs()}
            className="ml-auto grid size-8 place-items-center rounded-sm text-muted hover:text-fg"
          >
            {fs ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </Tooltip>
      </div>

      {wide && watchOpen ? (
        <Group key={appLayout} orientation="horizontal" className="min-h-0 flex-1" defaultLayout={deskSplit}>
          <Panel id="main" minSize="42%" className="min-h-0 overflow-hidden">
            {mainCol}
          </Panel>
          <Separator className="w-px bg-border hover:bg-fg/30" />
          <Panel id="watch" minSize="18%" className="min-h-0 overflow-hidden">
            {watchEl}
          </Panel>
        </Group>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {mainCol}
          {!wide && watchOpen ? <div className="min-h-[280px] border-t border-border">{watchEl}</div> : null}
        </div>
      )}
    </div>
  );
}
