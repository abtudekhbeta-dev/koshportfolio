import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { IndexComposition } from "@/components/terminal/index-composition";
import { fmtPct } from "@/lib/kosh/engine";
import { terminalSearch } from "@/lib/kosh/instrument-nav";
import { DEFAULT_KEY_SYMBOLS, FAMILY_LABEL, KEY_INDICES_KEY, catalogueBySymbol, loadKeyIndices, moveKey } from "@/lib/kosh/key-indices";
import { INDEX_FAMILIES, NIFTY_CATALOGUE, type CatalogueIndex, type IndexFamily } from "@/lib/kosh/nifty-catalogue";
import type { Quote } from "@/lib/kosh/types";
import { bareSymbol } from "@/lib/store";
import { cn } from "@/lib/utils";

function money(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexTile({
  row,
  quote,
  failed,
  onChart,
  onComposition,
}: {
  row: CatalogueIndex;
  quote: Quote | null;
  failed: boolean;
  onChart: (symbol: string, name: string) => void;
  onComposition: (row: CatalogueIndex) => void;
}) {
  const price = quote && quote.price > 0 ? quote.price : null;
  const pct = price != null && quote && Number.isFinite(quote.changePct) ? quote.changePct : null;
  const status = price == null ? (failed ? "Unavailable" : "No quote") : null;
  return (
    <div className="relative flex h-full min-h-[96px] flex-col rounded-lg border border-border bg-surface px-3 py-3">
      <button type="button" className="flex h-full w-full min-w-0 flex-col pr-10 text-left" aria-label={`Open ${row.name} in Terminal`} onClick={() => onChart(row.symbol, row.name)}>
        <div className="line-clamp-2 text-[12px] font-medium leading-4 text-fg" title={row.name}>
          {row.name}
        </div>
        <div className="mt-auto pt-3 font-mono text-[18px] leading-none font-medium tabular">{status || money(price as number)}</div>
        <div className={cn("mt-2 font-mono text-[12px] leading-none tabular", status || pct == null ? "text-muted" : pct >= 0 ? "text-up" : "text-down")}>
          {status ? "" : pct == null ? "—" : fmtPct(pct)}
        </div>
      </button>
        <button
        type="button"
        className="absolute top-0 right-0 grid size-11 place-items-center text-[10px] font-medium tracking-wide text-muted uppercase"
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
  const navigate = useNavigate();
  const [mode, setMode] = useState<"key" | "all">("key");
  const [editing, setEditing] = useState(false);
  const [keys, setKeys] = useState<string[]>([...DEFAULT_KEY_SYMBOLS]);
  const [ready, setReady] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [addQ, setAddQ] = useState("");
  const [family, setFamily] = useState<(typeof INDEX_FAMILIES)[number]>("All");
  const [composition, setComposition] = useState<CatalogueIndex | null>(null);
  useEffect(() => {
    setKeys(loadKeyIndices(window.localStorage.getItem(KEY_INDICES_KEY)));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY_INDICES_KEY, JSON.stringify(keys));
  }, [keys, ready]);
  const bySym = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const row of quotes) map.set(bareSymbol(row.symbol || row.input), row);
    return map;
  }, [quotes]);
  const keyRows = useMemo(
    () => keys.map((symbol) => catalogueBySymbol(symbol)).filter((row): row is CatalogueIndex => Boolean(row)),
    [keys],
  );
  const list = useMemo(() => {
    const base = mode === "key" ? keyRows : NIFTY_CATALOGUE;
    const query = q.trim().toLowerCase();
    return base.filter((row) => {
      if (mode === "all" && family !== "All" && row.family !== family) return false;
      if (!query) return true;
      return row.name.toLowerCase().includes(query) || row.symbol.toLowerCase().includes(query);
    });
  }, [mode, q, family, keyRows]);
  const grouped = mode === "all" && !q.trim() && family === "All";
  const groups = useMemo(() => {
    if (!grouped) return [{ family: null as IndexFamily | null, rows: list }];
    return INDEX_FAMILIES.filter((name): name is IndexFamily => name !== "All")
      .map((name) => ({ family: name, rows: list.filter((row) => row.family === name) }))
      .filter((group) => group.rows.length);
  }, [grouped, list]);
  const addable = useMemo(() => {
    const query = addQ.trim().toLowerCase();
    if (!query) return [];
    return NIFTY_CATALOGUE.filter((row) => !keys.includes(row.symbol) && (row.name.toLowerCase().includes(query) || row.symbol.toLowerCase().includes(query))).slice(0, 8);
  }, [addQ, keys]);

  function openTerminal(symbol: string, name: string) {
    void navigate({ to: "/markets", search: terminalSearch(symbol, name) });
  }

  function quoteOf(row: CatalogueIndex) {
    return bySym.get(bareSymbol(row.symbol)) || null;
  }

  return (
    <section id="nifty-index-heat" aria-label="Index heatmap">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Index heatmap</h2>
          {stamp ? <span className="text-[11px] text-subtle">{live ? "Session" : "Last session"} · {stamp}</span> : null}
          {failed ? <span className="text-[11px] text-down">Quotes failed</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex rounded-sm bg-surface p-0.5 shadow-[var(--shadow-border)]" role="tablist" aria-label="Index set">
            <button type="button" role="tab" aria-selected={mode === "key"} className={cn("h-7 rounded-sm px-2 text-[11px]", mode === "key" ? "bg-bg text-fg" : "text-muted")} onClick={() => setMode("key")}>
              My key indices
            </button>
            <button type="button" role="tab" aria-selected={mode === "all"} title="Every index this quote feed prices" className={cn("h-7 rounded-sm px-2 text-[11px]", mode === "all" ? "bg-bg text-fg" : "text-muted")} onClick={() => setMode("all")}>
              All indices
            </button>
          </div>
          {mode === "key" ? (
            <button type="button" className="h-7 rounded-sm bg-surface px-2 text-[11px] shadow-[var(--shadow-border)]" aria-pressed={editing} onClick={() => setEditing((open) => !open)}>
              {editing ? "Done" : "Edit"}
            </button>
          ) : (
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
                  <option key={name} value={name}>{FAMILY_LABEL[name] || name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      {mode === "key" && editing ? (
        <div className="mb-2 rounded-sm bg-surface px-2 py-2 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted">Drag a row, or use the arrows. This board is saved in this browser. It does not change the catalogue.</p>
            <button type="button" className="h-7 rounded-sm px-2 text-[11px] text-muted" onClick={() => setKeys([...DEFAULT_KEY_SYMBOLS])}>
              Restore default
            </button>
          </div>
          <ul className="mt-2 grid gap-1">
            {keyRows.map((row, index) => (
              <li
                key={row.symbol}
                draggable
                onDragStart={() => setDrag(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (drag == null) return;
                  setKeys((current) => moveKey(current, drag, index));
                  setDrag(null);
                }}
                className="flex items-center gap-1 rounded-sm bg-bg px-1 py-1"
              >
                <span className="cursor-grab px-1 text-[11px] text-subtle" aria-hidden>≡</span>
                <span className="min-w-0 flex-1 truncate text-[12px]">{row.name}</span>
                <span className="text-[10px] text-subtle">{FAMILY_LABEL[row.family] || row.family}</span>
                <button type="button" className="h-6 px-1 text-[11px]" aria-label={`Move ${row.name} up`} disabled={index === 0} onClick={() => setKeys((current) => moveKey(current, index, index - 1))}>Up</button>
                <button type="button" className="h-6 px-1 text-[11px]" aria-label={`Move ${row.name} down`} disabled={index === keyRows.length - 1} onClick={() => setKeys((current) => moveKey(current, index, index + 1))}>Down</button>
                <button type="button" className="h-6 px-1 text-[11px] text-down" aria-label={`Remove ${row.name}`} onClick={() => setKeys((current) => current.filter((symbol) => symbol !== row.symbol))}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <input
              value={addQ}
              onChange={(event) => setAddQ(event.target.value)}
              placeholder="Add an index"
              aria-label="Add an index"
              className="h-7 w-40 rounded-sm bg-bg px-2 text-[11px] shadow-[var(--shadow-border)] outline-none"
            />
            {addable.map((row) => (
              <button key={row.symbol} type="button" className="h-7 rounded-sm bg-bg px-2 text-[11px]" onClick={() => { setKeys((current) => current.includes(row.symbol) ? current : [...current, row.symbol]); setAddQ(""); }}>
                Add {row.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {pending && !quotes.length ? (
        <p className="text-[13px] text-muted">Loading index quotes…</p>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <div key={group.family || "flat"}>
              {group.family ? <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{FAMILY_LABEL[group.family] || group.family}</h3> : null}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.rows.map((row) => (
                  <IndexTile key={row.symbol} row={row} quote={quoteOf(row)} failed={failed} onChart={openTerminal} onComposition={setComposition} />
                ))}
              </div>
            </div>
          ))}
          {!list.length ? <p className="text-[13px] text-muted">{mode === "key" ? "No key indices yet. Edit the board to add some." : "No index matches that search."}</p> : null}
        </div>
      )}
      {composition ? (
        <IndexComposition row={composition} onChart={onChart} onClose={() => setComposition(null)} />
      ) : null}
    </section>
  );
}
