import { useMemo, useRef, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { cycleSort, sortEntities, sortGlyph, type SortDir } from "@/lib/kosh/kosh-table";
import { universeName } from "@/lib/kosh/universe";
import type { Quote } from "@/lib/kosh/types";
import { quoteMap } from "@/lib/kosh/market-data";
import { bareSymbol, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

type Source = { kind: "watch"; id: string } | { kind: "port"; id: string };
type SortKey = "last" | "chg" | "chgPct";

function absChange(q: Quote | undefined) {
  if (!q || !(q.price > 0) || !(q.previousClose > 0)) return null;
  return q.price - q.previousClose;
}

export function WatchPane({
  quotes,
  activeSymbol,
  owned,
  onPick,
}: {
  quotes: Quote[] | undefined;
  activeSymbol: string;
  owned: Record<string, string>;
  onPick: (symbol: string, name?: string) => void;
}) {
  const lists = useKosh((s) => s.watchlists);
  const activeId = useKosh((s) => s.activeWatchId);
  const watch = useKosh((s) => s.watch);
  const ports = useKosh((s) => s.portfolios);
  const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
  const addWatchList = useKosh((s) => s.addWatchList);
  const renameWatchList = useKosh((s) => s.renameWatchList);
  const deleteWatchList = useKosh((s) => s.deleteWatchList);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const moveWatch = useKosh((s) => s.moveWatch);
  const watchSorts = useKosh((s) => s.watchSorts);
  const setWatchSort = useKosh((s) => s.setWatchSort);
  const recents = useKosh((s) => s.recents);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [source, setSource] = useState<Source>({ kind: "watch", id: activeId });
  const [qtext, setQtext] = useState("");
  const dragFrom = useRef<number | null>(null);
  const dragging = useRef(false);
  const qmap = useMemo(() => quoteMap(quotes), [quotes]);

  const sortId = source.kind === "watch" ? source.id : "p:" + source.id;
  const saved = watchSorts[sortId];
  const sort = saved ? { key: saved.key as SortKey, dir: saved.dir as SortDir } : { key: null as SortKey | null, dir: null as SortDir };
  const port = source.kind === "port" ? ports.find((p) => p.id === source.id) : null;
  const rawRows =
    source.kind === "port"
      ? (port?.holdings || []).map((h) => bareSymbol(h.symbol)).filter(Boolean)
      : watch;

  const decorated = rawRows.map((s, i) => {
    const k = bareSymbol(s);
    const q = qmap.get(k);
    return {
      i,
      k,
      name: q?.name || universeName(k) || k,
      last: q && q.price > 0 ? q.price : null,
      chg: absChange(q),
      chgPct: q && Number.isFinite(q.changePct) ? q.changePct : null,
      q,
    };
  });

  const searched = qtext.trim()
    ? decorated.filter((r) => (r.k + " " + r.name).toLowerCase().includes(qtext.trim().toLowerCase()))
    : decorated;
  const rows = sort.key && sort.dir ? sortEntities(searched, sort.key, sort.dir) : searched;
  const customOrder = !sort.key;

  function create() {
    const n = newName.trim();
    if (!n) return;
    const id = addWatchList(n);
    setNewName("");
    setCreating(false);
    setSource({ kind: "watch", id });
  }

  function onSelectList(v: string) {
    if (v.startsWith("p:")) {
      setSource({ kind: "port", id: v.slice(2) });
      return;
    }
    setActiveWatchId(v);
    setSource({ kind: "watch", id: v });
  }

  function toggleCol(key: SortKey) {
    const next = cycleSort(sort, key);
    if (!next.key || !next.dir) setWatchSort(sortId, null);
    else setWatchSort(sortId, { key: next.key, dir: next.dir });
  }

  const selectValue = source.kind === "port" ? "p:" + source.id : source.id;

  return (
    <aside data-watch-pane className="kosh-watch flex h-full min-h-0 min-w-0 flex-col bg-bg-elevated">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">List</div>
        <select
          aria-label="List"
          value={selectValue}
          onChange={(e) => onSelectList(e.target.value)}
          className="ml-auto h-7 max-w-[58%] rounded-sm border border-border bg-surface-2 px-1.5 text-[11px]"
        >
          <optgroup label="WATCHLISTS">
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </optgroup>
          {ports.some((p) => p.holdings.length) ? (
            <optgroup label="PORTFOLIOS">
              {ports
                .filter((p) => p.holdings.length)
                .map((p) => (
                  <option key={p.id} value={"p:" + p.id}>
                    {p.name}
                  </option>
                ))}
            </optgroup>
          ) : null}
        </select>
        <button
          type="button"
          aria-label="New list"
          className="grid size-7 place-items-center text-muted hover:text-fg"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {creating ? (
        <div className="flex gap-1 border-b border-border px-2 py-1.5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
              if (e.key === "Escape") setCreating(false);
            }}
            placeholder="List name"
            className="h-8 min-w-0 flex-1 rounded-sm bg-bg px-2 text-[12px] outline-none"
          />
          <button type="button" className="h-8 px-2 text-[12px] text-fg" onClick={create}>
            Add
          </button>
        </div>
      ) : null}
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
        <input
          value={qtext}
          onChange={(e) => setQtext(e.target.value)}
          placeholder="Search"
          aria-label="Search list"
          className="h-7 min-w-0 flex-1 rounded-sm bg-bg px-2 text-[11px] outline-none"
        />
        <button
          type="button"
          className={cn("h-7 shrink-0 px-1.5 text-[10px] tracking-[0.06em] uppercase", customOrder ? "text-fg" : "text-muted hover:text-fg")}
          onClick={() => setWatchSort(sortId, null)}
        >
          Custom order
        </button>
        {source.kind === "watch" && lists.length > 1 ? (
          <button
            type="button"
            className="grid size-7 place-items-center text-muted hover:text-down"
            aria-label="Delete list"
            onClick={() => {
              const active = lists.find((l) => l.id === source.id);
              if (active && window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
            }}
          >
            <Trash2 className="size-3" />
          </button>
        ) : null}
        {source.kind === "watch" ? (
          <button
            type="button"
            className="hidden text-[10px] text-muted hover:text-fg sm:inline"
            onClick={() => {
              const active = lists.find((l) => l.id === source.id);
              if (!active) return;
              const n = window.prompt("Rename list", active.name);
              if (n?.trim()) renameWatchList(active.id, n.trim());
            }}
          >
            Rename
          </button>
        ) : null}
      </div>
      <div className="kosh-watch-head shrink-0 border-b border-border px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-subtle uppercase">
        <span />
        <div className="kosh-watch-main !py-0">
          <span>Name</span>
          <button type="button" className="text-right" onClick={() => toggleCol("last")}>
            Last {sortGlyph(sort.key === "last", sort.dir)}
          </button>
          <button type="button" className="kosh-watch-wide text-right" onClick={() => toggleCol("chg")}>
            Chg {sortGlyph(sort.key === "chg", sort.dir)}
          </button>
          <button type="button" className="kosh-watch-wide text-right" onClick={() => toggleCol("chgPct")}>
            Chg % {sortGlyph(sort.key === "chgPct", sort.dir)}
          </button>
        </div>
        <span />
      </div>
      <ul className="kosh-watch-rows min-h-0 flex-1 overflow-y-auto">
        {!rows.length ? (
          <li className="px-3 py-6 text-center text-[12px] text-muted">
            {source.kind === "port"
              ? "This list has no names yet."
              : "Search a name and pin it, or open a stock and add it to this list."}
            {source.kind === "watch" && recents.length ? (
              <ul className="mt-3 space-y-1 text-left">
                {recents.slice(0, 6).map((r) => (
                  <li key={r.symbol}>
                    <button
                      type="button"
                      className="w-full rounded-sm px-2 py-1.5 text-left text-[12px] text-fg hover:bg-surface"
                      onClick={() => onPick(r.symbol, r.name)}
                    >
                      {r.symbol}
                      <span className="ml-2 text-subtle">{r.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ) : (
          rows.map((r) => {
            const on = bareSymbol(activeSymbol) === r.k;
            const badge = owned[r.k];
            const chg = r.chgPct ?? 0;
            const tone = r.chgPct == null ? "text-muted" : r.chgPct >= 0 ? "text-up" : "text-down";
            const lastTxt = r.last != null ? fmtPx(r.last) : "—";
            const absTxt = r.chg != null ? `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}` : "—";
            const pctTxt = r.chgPct != null ? fmtPct(r.chgPct) : "";
            const canDrag = source.kind === "watch" && customOrder && !qtext.trim();
            return (
              <li
                key={r.k + r.i}
                className={cn("kosh-watch-row border-b border-border/70", on && "bg-surface")}
                draggable={canDrag}
                onDragStart={() => {
                  dragFrom.current = r.i;
                  dragging.current = true;
                }}
                onDragOver={(e) => {
                  if (!canDrag) return;
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = dragFrom.current;
                  dragFrom.current = null;
                  dragging.current = false;
                  if (from == null || from === r.i) return;
                  moveWatch(from, r.i);
                }}
                onDragEnd={() => {
                  dragFrom.current = null;
                  window.setTimeout(() => {
                    dragging.current = false;
                  }, 0);
                }}
              >
                <span
                  className={cn("kosh-watch-handle text-subtle", canDrag ? "cursor-grab" : "opacity-30")}
                  aria-hidden
                >
                  <GripVertical className="size-3.5" />
                </span>
                <button
                  type="button"
                  data-watch-row={r.k}
                  onClick={() => {
                    if (dragging.current) return;
                    onPick(r.k, r.name);
                  }}
                  className="kosh-watch-main min-w-0 text-left"
                >
                  <span className="kosh-watch-name min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold">{r.k}</span>
                      {badge ? (
                        <span className="rounded-sm bg-surface-2 px-1 py-px text-[9px] tracking-[0.04em] text-muted uppercase">
                          {badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[10px] text-subtle">{r.name}</span>
                  </span>
                  <span className="kosh-watch-last text-right">
                    <span className="block font-mono text-[13px] font-semibold tabular">{lastTxt}</span>
                    <span className={cn("kosh-watch-stack font-mono text-[11px] tabular", tone)}>
                      {absTxt}
                      {pctTxt ? ` · ${pctTxt}` : ""}
                    </span>
                  </span>
                  <span className={cn("kosh-watch-wide kosh-watch-chg text-right font-mono text-[11px] tabular", tone)}>
                    {absTxt}
                  </span>
                  <span className={cn("kosh-watch-wide kosh-watch-pct text-right font-mono text-[11px] tabular", chg >= 0 ? "text-up" : "text-down")}>
                    {pctTxt || "—"}
                  </span>
                </button>
                {source.kind === "watch" ? (
                  <span className="kosh-watch-ops flex items-center justify-end">
                    <button
                      type="button"
                      aria-label={`Remove ${r.k}`}
                      className="grid w-6 place-items-center text-subtle hover:text-down"
                      onClick={() => toggleWatch(r.k)}
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span />
                )}
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
