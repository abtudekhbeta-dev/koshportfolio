import { useMemo, useState } from "react";
import { IndexComposition } from "@/components/terminal/index-composition";
import { fmtPct } from "@/lib/kosh/engine";
import { INDEX_FAMILIES, NIFTY_CATALOGUE, keySectorals, type CatalogueIndex, type IndexFamily } from "@/lib/kosh/nifty-catalogue";
import type { Quote } from "@/lib/kosh/types";
import { bareSymbol } from "@/lib/store";
import { cn } from "@/lib/utils";

function tone(v: number | null) {
  if (v == null || !Number.isFinite(v)) return "bg-surface-2 text-muted";
  if (v >= 1.5) return "bg-up/70 text-fg";
  if (v >= 0.15) return "bg-up/25 text-fg";
  if (v > -0.15) return "bg-surface-2 text-fg";
  if (v > -1.5) return "bg-down/25 text-fg";
  return "bg-down/70 text-fg";
}

function IndexTile({
  row,
  pct,
  failed,
  onChart,
  onComposition,
}: {
  row: CatalogueIndex;
  pct: number | null;
  failed: boolean;
  onChart: (symbol: string, name: string) => void;
  onComposition: (row: CatalogueIndex) => void;
}) {
  const label = pct == null ? (failed ? "Quotes failed" : "No quote") : fmtPct(pct);
  const paint = row.family === "Volatility" ? "bg-surface-2 text-fg" : tone(pct);
  return (
    <div className={cn("relative h-full rounded-sm px-2 py-2", paint)}>
      <button type="button" className="flex h-full w-full min-w-0 flex-col pr-5 text-left" aria-label={`View chart, ${row.name}`} onClick={() => onChart(row.symbol, row.name)}>
        <div className="line-clamp-2 text-[11px] font-medium leading-4" title={row.name}>
          {row.name}
        </div>
        <div className="mt-auto pt-1 font-mono text-[15px] leading-none tabular">{label}</div>
      </button>
      <button
        type="button"
        className="absolute top-1 right-1 rounded-sm bg-bg/55 px-1 text-[9px] font-medium tracking-wide uppercase opacity-80 hover:opacity-100 focus-visible:opacity-100"
        aria-label={`${row.name} constituents`}
        title="Constituents by index share"
        onClick={() => onComposition(row)}
      >
        Shares
      </button>
    </div>
  );
}

export function IndexHeat({
  quotes,
  pending,
  failed,
  stamp,
  live,
  onChart,
}: {
  quotes: Quote[];
  pending: boolean;
  failed: boolean;
  stamp: string | null;
  live: boolean;
  onChart: (symbol: string, name: string) => void;
}) {
  const [mode, setMode] = useState<"key" | "all">("key");
  const [q, setQ] = useState("");
  const [family, setFamily] = useState<(typeof INDEX_FAMILIES)[number]>("All");
  const [composition, setComposition] = useState<CatalogueIndex | null>(null);
  const bySym = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const row of quotes) map.set(bareSymbol(row.symbol || row.input), row);
    return map;
  }, [quotes]);
  const list = useMemo(() => {
    const base = mode === "key" ? keySectorals() : NIFTY_CATALOGUE;
    const query = q.trim().toLowerCase();
    return base.filter((row) => {
      if (mode === "all" && family !== "All" && row.family !== family) return false;
      if (!query) return true;
      return row.name.toLowerCase().includes(query) || row.symbol.toLowerCase().includes(query);
    });
  }, [mode, q, family]);
  const grouped = mode === "all" && !q.trim() && family === "All";
  const groups = useMemo(() => {
    if (!grouped) return [{ family: null as IndexFamily | null, rows: list }];
    return INDEX_FAMILIES.filter((name): name is IndexFamily => name !== "All")
      .map((name) => ({ family: name, rows: list.filter((row) => row.family === name) }))
      .filter((group) => group.rows.length);
  }, [grouped, list]);

  function pctOf(row: CatalogueIndex) {
    const quote = bySym.get(bareSymbol(row.symbol));
    return quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
  }

  return (
    <section id="nifty-index-heat" aria-label="Nifty index heatmap">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Nifty index heatmap</h2>
          {stamp ? <span className="text-[11px] text-subtle">{live ? "Session" : "Last session"} · {stamp}</span> : null}
          {failed ? <span className="text-[11px] text-down">Quotes failed</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex rounded-sm bg-surface p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Index set">
            <button type="button" role="tab" aria-selected={mode === "key"} className={cn("h-7 rounded-sm px-2 text-[11px]", mode === "key" ? "bg-bg text-fg" : "text-muted")} onClick={() => setMode("key")}>
              Key sectoral
            </button>
            <button type="button" role="tab" aria-selected={mode === "all"} title="Every Nifty index this quote feed prices" className={cn("h-7 rounded-sm px-2 text-[11px]", mode === "all" ? "bg-bg text-fg" : "text-muted")} onClick={() => setMode("all")}>
              All indices
            </button>
          </div>
          {mode === "all" ? (
            <>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search index"
                aria-label="Search indices"
                className="h-7 w-32 max-w-full rounded-sm bg-surface px-2 text-[11px] shadow-[var(--shadow-border)] outline-none"
              />
              <select aria-label="Index family" value={family} onChange={(e) => setFamily(e.target.value as typeof family)} className="h-7 max-w-full rounded-sm bg-surface px-2 text-[11px] shadow-[var(--shadow-border)]">
                {INDEX_FAMILIES.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      </div>
      {pending && !quotes.length ? (
        <p className="text-[13px] text-muted">Loading index quotes…</p>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <div key={group.family || "flat"}>
              {group.family ? <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{group.family}</h3> : null}
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.rows.map((row) => (
                  <IndexTile key={row.symbol} row={row} pct={pctOf(row)} failed={failed} onChart={onChart} onComposition={setComposition} />
                ))}
              </div>
            </div>
          ))}
          {!list.length ? <p className="text-[13px] text-muted">No index matches that search.</p> : null}
        </div>
      )}
      {composition ? (
        <IndexComposition row={composition} onChart={onChart} onClose={() => setComposition(null)} />
      ) : null}
    </section>
  );
}
