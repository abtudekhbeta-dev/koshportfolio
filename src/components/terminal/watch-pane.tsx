import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { universeName } from "@/lib/kosh/universe";
import type { Quote } from "@/lib/kosh/types";
import { quoteMap } from "@/lib/kosh/market-data";
import { bareSymbol, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
  const addWatchList = useKosh((s) => s.addWatchList);
  const renameWatchList = useKosh((s) => s.renameWatchList);
  const deleteWatchList = useKosh((s) => s.deleteWatchList);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const moveWatch = useKosh((s) => s.moveWatch);
  const recents = useKosh((s) => s.recents);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const qmap = useMemo(() => quoteMap(quotes), [quotes]);
  const active = lists.find((l) => l.id === activeId) || lists[0];

  function create() {
    const n = newName.trim();
    if (!n) return;
    addWatchList(n);
    setNewName("");
    setCreating(false);
  }

  return (
    <aside data-watch-pane className="flex h-full min-h-0 min-w-0 flex-col bg-bg-elevated">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Watchlists</div>
        <button
          type="button"
          aria-label="New list"
          className="ml-auto grid size-7 place-items-center text-muted hover:text-fg"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
        {lists.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActiveWatchId(l.id)}
            onDoubleClick={() => {
              const n = window.prompt("Rename list", l.name);
              if (n?.trim()) renameWatchList(l.id, n.trim());
            }}
            className={cn(
              "h-7 shrink-0 rounded-sm px-2 text-[12px] font-medium",
              l.id === activeId ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            {l.name}
          </button>
        ))}
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
      {active && lists.length > 1 ? (
        <div className="flex items-center justify-end px-2 pt-1">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 px-1.5 text-[11px] text-muted hover:text-down"
            onClick={() => {
              if (window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
            }}
          >
            <Trash2 className="size-3" />
            Delete list
          </button>
        </div>
      ) : null}
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {!watch.length ? (
          <li className="px-3 py-6 text-center text-[12px] text-muted">
            Search a name and pin it, or open a stock and add it to this list.
            {recents.length ? (
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
          watch.map((s, i) => {
            const k = bareSymbol(s);
            const q = qmap.get(k);
            const name = q?.name || universeName(k) || k;
            const on = bareSymbol(activeSymbol) === k;
            const chg = q?.changePct ?? 0;
            const badge = owned[k];
            return (
              <li key={k + i} className={cn("border-b border-border/70", on && "bg-surface")}>
                <div className="flex items-stretch">
                  <button
                    type="button"
                    data-watch-row={k}
                    onClick={() => onPick(k, name)}
                    className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold">{k}</span>
                        {badge ? (
                          <span className="rounded-sm bg-surface-2 px-1 py-px text-[9px] tracking-[0.04em] text-muted uppercase">
                            {badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-[10px] text-subtle">{name}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-[13px] tabular">{q ? fmtPx(q.price) : "—"}</span>
                      <span className={cn("block font-mono text-[11px] tabular", chg >= 0 ? "text-up" : "text-down")}>
                        {q ? fmtPct(chg) : ""}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-col justify-center pr-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      className="grid size-6 place-items-center text-subtle hover:text-fg disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveWatch(i, i - 1)}
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      className="grid size-6 place-items-center text-subtle hover:text-fg disabled:opacity-30"
                      disabled={i === watch.length - 1}
                      onClick={() => moveWatch(i, i + 1)}
                    >
                      <ChevronDown className="size-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${k}`}
                    className="grid w-7 place-items-center text-subtle hover:text-down"
                    onClick={() => toggleWatch(k)}
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
