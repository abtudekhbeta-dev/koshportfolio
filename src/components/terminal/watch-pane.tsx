import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { universeName } from "@/lib/kosh/universe";
import type { Quote } from "@/lib/kosh/types";
import { quoteMap } from "@/lib/kosh/market-data";
import { bareSymbol, useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

type Source = { kind: "watch"; id: string } | { kind: "port"; id: string };

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
  const recents = useKosh((s) => s.recents);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [source, setSource] = useState<Source>({ kind: "watch", id: activeId });
  const qmap = useMemo(() => quoteMap(quotes), [quotes]);

  const port = source.kind === "port" ? ports.find((p) => p.id === source.id) : null;
  const rows =
    source.kind === "port"
      ? (port?.holdings || []).map((h) => bareSymbol(h.symbol)).filter(Boolean)
      : watch;

  function create() {
    const n = newName.trim();
    if (!n) return;
    const id = addWatchList(n);
    setNewName("");
    setCreating(false);
    setSource({ kind: "watch", id });
  }

  function portDay(id: string) {
    const p = ports.find((x) => x.id === id);
    if (!p) return null;
    let total = 0;
    let weighted = 0;
    let n = 0;
    for (const h of p.holdings) {
      const q = qmap.get(bareSymbol(h.symbol));
      if (!q || !(q.price > 0)) continue;
      const v = (h.qty || 0) * q.price;
      total += v;
      weighted += v * (q.changePct || 0);
      n += 1;
    }
    if (!n || !(total > 0)) return null;
    return { pct: weighted / total, value: total };
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
            onClick={() => {
              setActiveWatchId(l.id);
              setSource({ kind: "watch", id: l.id });
            }}
            onDoubleClick={() => {
              const n = window.prompt("Rename list", l.name);
              if (n?.trim()) renameWatchList(l.id, n.trim());
            }}
            className={cn(
              "h-7 shrink-0 rounded-sm px-2 text-[12px] font-medium",
              source.kind === "watch" && l.id === source.id ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            {l.name}
          </button>
        ))}
      </div>
      {ports.some((p) => p.holdings.length) ? (
        <div className="shrink-0 border-b border-border px-2 py-1.5">
          <div className="px-1 text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">Portfolios</div>
          <div className="mt-1 flex flex-col gap-0.5">
            {ports
              .filter((p) => p.holdings.length)
              .map((p) => {
                const day = portDay(p.id);
                const on = source.kind === "port" && source.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSource({ kind: "port", id: p.id })}
                    className={cn(
                      "flex h-8 items-center justify-between rounded-sm px-2 text-left text-[12px]",
                      on ? "bg-surface text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    {day ? (
                      <span className={cn("ml-2 font-mono tabular", day.pct >= 0 ? "text-up" : "text-down")}>
                        {fmtPct(day.pct)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}
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
      {source.kind === "watch" && lists.length > 1 ? (
        <div className="flex items-center justify-end px-2 pt-1">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 px-1.5 text-[11px] text-muted hover:text-down"
            onClick={() => {
              const active = lists.find((l) => l.id === source.id);
              if (active && window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
            }}
          >
            <Trash2 className="size-3" />
            Delete list
          </button>
        </div>
      ) : null}
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {!rows.length ? (
          <li className="px-3 py-6 text-center text-[12px] text-muted">
            {source.kind === "port"
              ? "This mix has no names yet."
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
          rows.map((s, i) => {
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
                  {source.kind === "watch" ? (
                    <>
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
                          disabled={i === rows.length - 1}
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
                    </>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
