import { useMemo, useState } from "react";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { sectorOf } from "@/lib/kosh/sectors";
import type { BoardRow } from "@/lib/kosh/stock-board";
import { cn } from "@/lib/utils";

function tone(v: number | null) {
  if (v == null || !Number.isFinite(v)) return "bg-surface-2 text-muted";
  if (v >= 1.5) return "bg-up/70 text-fg";
  if (v >= 0.15) return "bg-up/25 text-fg";
  if (v > -0.15) return "bg-surface-2 text-fg";
  if (v > -1.5) return "bg-down/25 text-fg";
  return "bg-down/70 text-fg";
}

export function StockSectorHeat({
  rows,
  sectors,
  onOpen,
}: {
  rows: BoardRow[];
  sectors: Map<string, string>;
  onOpen: (symbol: string, name: string) => void;
}) {
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState<"return" | "name">("return");
  const groups = useMemo(() => {
    const map = new Map<string, BoardRow[]>();
    for (const row of rows) {
      const name = sectors.get(row.symbol) || sectorOf(row.symbol);
      const list = map.get(name) || [];
      list.push(row);
      map.set(name, list);
    }
    return [...map.entries()]
      .map(([name, list]) => {
        const priced = list.filter((row) => row.chgPct != null);
        const avg = priced.length ? priced.reduce((sum, row) => sum + (row.chgPct || 0), 0) / priced.length : null;
        const items = list.slice().sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : (b.chgPct || -999) - (a.chgPct || -999)));
        return { name, items, avg, n: list.length };
      })
      .filter((group) => sector === "All" || group.name === sector)
      .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : (b.avg || -999) - (a.avg || -999)));
  }, [rows, sectors, sector, sort]);
  const names = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) set.add(sectors.get(row.symbol) || sectorOf(row.symbol));
    return ["All", ...[...set].sort()];
  }, [rows, sectors]);

  if (!rows.length) return <p className="text-[13px] text-muted">No names in this filter.</p>;
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <select aria-label="Sector filter" value={sector} onChange={(e) => setSector(e.target.value)} className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]">
          {names.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <select aria-label="Sector sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]">
          <option value="return">Sort by return</option>
          <option value="name">Sort by name</option>
        </select>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.name} className="rounded-lg bg-surface p-2.5 shadow-[var(--shadow-border)]">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 className="text-[12px] font-semibold">{group.name}</h3>
              <span className="font-mono text-[11px] text-muted tabular">
                {group.n} {group.n === 1 ? "name" : "names"}
                {group.avg != null ? ` · avg ${fmtPct(group.avg)}` : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {group.items.map((row) => (
                <button
                  key={row.symbol}
                  type="button"
                  onClick={() => onOpen(row.symbol, row.name)}
                  className={cn("min-h-[72px] rounded-sm px-2 py-1.5 text-left", tone(row.chgPct))}
                  title={row.source === "none" ? `${row.name} has no quote` : row.name}
                >
                  <div className="truncate text-[11px] font-semibold">{row.symbol}</div>
                  <div className="truncate text-[10px] opacity-80">{row.name}</div>
                  <div className="mt-1 font-mono text-[13px] tabular">{row.chgPct == null ? "—" : fmtPct(row.chgPct)}</div>
                  <div className="font-mono text-[10px] tabular">{row.last != null ? fmtPx(row.last) : "No quote"}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
