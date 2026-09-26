import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Columns2, LayoutGrid, Square } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { apiQuotes } from "@/lib/kosh/api";
import { isIstSession, istClock } from "@/lib/kosh/market-hours";
import { quoteMap, quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import type { PatternHit } from "@/lib/kosh/patterns";
import type { Quote } from "@/lib/kosh/types";
import { bareSymbol, useKosh, type DeskLayout } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TermChart } from "./term-chart";
import { WatchPane } from "./watch-pane";
import { IntelPanel } from "./intel-panel";

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

export function MarketsDesk() {
  const desk = useKosh((s) => s.desk);
  const patchDesk = useKosh((s) => s.patchDesk);
  const setDeskPane = useKosh((s) => s.setDeskPane);
  const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
  const watch = useKosh((s) => s.watch);
  const ports = useKosh((s) => s.portfolios);
  const [wide, setWide] = useState(true);
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

  return (
    <div data-markets-desk className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-2 py-1.5 sm:px-3">
        <div className="flex items-center gap-0.5 rounded-sm bg-bg-elevated p-0.5">
          {(
            [
              [1, Square, "1 chart"],
              [2, Columns2, "2 charts"],
              [4, LayoutGrid, "4 charts"],
            ] as const
          ).map(([n, Icon, label]) => (
            <button
              key={n}
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
          ))}
        </div>
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
          title="Latest print Kosh has. Refreshes during the cash session."
        >
          {tapeStatus === "session"
            ? `● ${quoteStatusLabel(tapeStatus)} · ${istClock()}`
            : quoteStatusLabel(tapeStatus)}
        </span>
      </div>

      {wide ? (
        <Group orientation="horizontal" className="min-h-0 flex-1" defaultLayout={DESK_SPLIT}>
          <Panel id="main" minSize="42%" className="min-h-0 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              <div className="h-[min(68vh,600px)] min-h-[420px] shrink-0">{workspace}</div>
              <div className="border-t border-border">{intel}</div>
            </div>
          </Panel>
          <Separator className="w-px bg-border hover:bg-fg/30" />
          <Panel id="watch" minSize="18%" className="min-h-0">
            {watchEl}
          </Panel>
        </Group>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="h-[min(42vh,320px)] min-h-[220px] shrink-0">{workspace}</div>
          <div className="min-h-[280px] border-t border-border">{watchEl}</div>
          <div className="border-t border-border">{intel}</div>
        </div>
      )}
    </div>
  );
}
