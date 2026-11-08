import { useState } from "react";
import { fmtPx } from "@/lib/kosh/engine";
import { COLUMN_LABEL, NUMERIC_COLUMNS, columnFilterActive, sortHits, type ColumnId, type HitFilter, type SortDir, type SortKey, type TableHit } from "@/lib/kosh/liquidity-table";
import { cn } from "@/lib/utils";

function when(t: number | null) {
  if (!t) return "—";
  return new Date(t * 1000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
}

function closedBack(n: number | null) {
  if (n == null) return "Not yet";
  if (n <= 0) return "Same candle";
  if (n === 1) return "Next candle";
  return `${n} candles`;
}

function volPct(hit: TableHit) {
  if (hit.volumeTrust === "neutral") return "Split";
  if (hit.volumeRatio == null || !Number.isFinite(hit.volumeRatio)) return "—";
  return `${Math.round(hit.volumeRatio * 100)}%`;
}

function stageLabel(hit: TableHit) {
  if (hit.status === "developing" || !hit.reclaimClosed) return "Developing";
  if (hit.status === "invalidated") return "Invalidated";
  if (hit.status === "expired") return "Expired";
  return "Reclaimed";
}

function cell(hit: TableHit, id: ColumnId): string {
  if (id === "name") return hit.symbol;
  if (id === "exchange") return hit.exchange;
  if (id === "mcap") return hit.mcapCr != null && hit.mcapCr > 0 ? Math.round(hit.mcapCr).toLocaleString("en-IN") : "—";
  if (id === "score") return String(hit.score);
  if (id === "tier") return hit.tier === "strong" ? "Strong" : hit.tier === "potential" ? "Potential" : "Developing";
  if (id === "pattern") return hit.pattern === "sweep" ? "Sweep" : hit.direction === "bull" ? "Failed breakdown" : "Failed breakout";
  if (id === "direction") return hit.direction === "bull" ? "Bullish" : "Bearish";
  if (id === "price") return hit.reclaimClose != null ? fmtPx(hit.reclaimClose) : "—";
  if (id === "level") return fmtPx(hit.level);
  if (id === "distance") {
    const px = hit.reclaimClose;
    if (px == null || !(hit.level > 0)) return "—";
    const raw = hit.direction === "bull" ? (px - hit.level) / hit.level : (hit.level - px) / hit.level;
    return `${raw >= 0 ? "+" : ""}${(raw * 100).toFixed(1)}%`;
  }
  if (id === "depth") return `${hit.depthPct.toFixed(1)}%`;
  if (id === "reclaim") return closedBack(hit.reclaimCandles);
  if (id === "volume") return volPct(hit);
  if (id === "touches") return String(hit.touches);
  if (id === "date") return when(hit.sweepT);
  if (id === "follow") return hit.followThrough ? "Yes" : hit.reclaimClosed ? "No" : "—";
  if (id === "status") return stageLabel(hit);
  return "";
}

export function ResultTable({
  title,
  hint,
  rows,
  columns,
  sortKey,
  sortDir,
  onSort,
  filter,
  onFilter,
  selected,
  compared,
  onOpen,
  onInspect,
  onCopy,
  onWatch,
  onPortfolio,
  onCompare,
}: {
  title: string;
  hint: string;
  rows: TableHit[];
  columns: ColumnId[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  filter: HitFilter;
  onFilter: (patch: Partial<HitFilter>) => void;
  selected: string;
  compared: string[];
  onOpen: (hit: TableHit) => void;
  onInspect: (hit: TableHit) => void;
  onCopy: (hit: TableHit) => void;
  onWatch: (hit: TableHit) => void;
  onPortfolio: (hit: TableHit) => void;
  onCompare: (hit: TableHit) => void;
}) {
  const [more, setMore] = useState(40);
  const shown = sortHits(rows, sortKey, sortDir).slice(0, more);
  const cols = columns.filter((id) => id !== "rank");
  return (
    <section className="mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold">{title} · {rows.length}</h3>
        <p className="text-[11px] text-subtle">{hint}</p>
      </div>
      {!rows.length ? <p className="mt-1 text-[12px] text-muted">None in this group.</p> : null}
      {shown.length ? (
        <div className="mt-1 max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-[12px]">
            <thead className="text-[10px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                {cols.map((id) => {
                  const numeric = NUMERIC_COLUMNS.has(id);
                  const active = sortKey === id || (sortKey === "rank" && id === "score");
                  const arrow = sortDir === "asc" ? " ↑" : " ↓";
                  return (
                    <th key={id} className={cn("sticky top-0 z-10 bg-bg py-1 pr-2 font-medium", id === "name" && "left-0 z-20", numeric && "text-right")}>
                      <span className={cn("inline-flex items-center gap-1", numeric && "float-right")}>
                        {id !== "actions" && SORTABLE.has(id) ? (
                          <button type="button" className={cn("hover:text-fg", active && "text-fg")} onClick={() => onSort(id as SortKey)}>
                            {COLUMN_LABEL[id]}{active ? arrow : ""}
                          </button>
                        ) : id !== "actions" ? (
                          <span>{COLUMN_LABEL[id]}</span>
                        ) : null}
                        <ColumnFilter id={id} filter={filter} onFilter={onFilter} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shown.map((hit) => (
                <tr key={hit.id} className={cn("border-t border-border", selected === hit.id && "bg-accent/10")}>
                  {cols.map((id) => (
                    <td key={id} className={cn("border-t border-border py-1.5 pr-2 align-top", id === "name" && "sticky left-0 bg-bg", NUMERIC_COLUMNS.has(id) && "text-right font-mono tabular", id === "direction" && (hit.direction === "bull" ? "text-up" : "text-down"))}>
                      {id === "name" ? (
                        <div>
                          <button type="button" className="font-semibold hover:underline" onClick={() => onOpen(hit)}>{hit.symbol}</button>
                          <div className="max-w-[180px] truncate text-[11px] text-subtle">{hit.name}</div>
                        </div>
                      ) : id === "score" ? (
                        <button type="button" className="font-mono tabular hover:underline" onClick={() => onInspect(hit)}>{hit.score}</button>
                      ) : id === "actions" ? (
                        <div className="flex gap-1 text-[11px] text-muted">
                          <button type="button" className="hover:text-fg" onClick={() => onCopy(hit)}>Copy</button>
                          <button type="button" className="hover:text-fg" onClick={() => onWatch(hit)}>Watch</button>
                          <button type="button" className="hover:text-fg" onClick={() => onPortfolio(hit)}>Portfolio</button>
                          <button type="button" className={cn("hover:text-fg", compared.includes(hit.id) && "text-fg")} onClick={() => onCompare(hit)}>{compared.includes(hit.id) ? "Picked" : "Compare"}</button>
                        </div>
                      ) : (
                        cell(hit, id)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {rows.length > shown.length ? (
        <button type="button" className="mt-1 text-[12px] text-chart" onClick={() => setMore((n) => n + 40)}>Show more</button>
      ) : null}
    </section>
  );
}

const SORTABLE = new Set<string>(["name", "exchange", "mcap", "score", "tier", "pattern", "direction", "price", "level", "distance", "depth", "reclaim", "volume", "touches", "date", "follow"]);

const CHOICES: Partial<Record<ColumnId, { value: string; label: string }[]>> = {
  exchange: [
    { value: "all", label: "NSE and BSE" },
    { value: "NSE", label: "NSE" },
    { value: "BSE", label: "BSE" },
  ],
  direction: [
    { value: "both", label: "Both" },
    { value: "bull", label: "Bullish" },
    { value: "bear", label: "Bearish" },
  ],
  tier: [
    { value: "all", label: "Any strength" },
    { value: "strong", label: "Strong" },
    { value: "potential", label: "Potential" },
    { value: "developing", label: "Developing" },
  ],
  pattern: [
    { value: "sweep", label: "Liquidity sweep" },
    { value: "failed", label: "Failed break" },
  ],
  follow: [
    { value: "all", label: "Any" },
    { value: "yes", label: "Follow-through" },
    { value: "no", label: "No follow-through" },
  ],
  reclaim: [
    { value: "all", label: "Any close back" },
    { value: "same", label: "Same candle" },
    { value: "one", label: "Next candle" },
    { value: "two", label: "Two candles" },
    { value: "three", label: "Three candles" },
    { value: "later", label: "Later" },
  ],
  mcap: [
    { value: "all", label: "Any band" },
    { value: "large", label: "Large" },
    { value: "mid", label: "Mid" },
    { value: "small", label: "Small" },
    { value: "micro", label: "Micro" },
    { value: "nano", label: "Nano" },
  ],
  status: [
    { value: "all", label: "Any status" },
    { value: "confirmed", label: "Reclaimed" },
    { value: "follow", label: "Follow-through" },
    { value: "potential", label: "Potential" },
    { value: "developing", label: "Developing" },
  ],
};

function currentChoice(id: ColumnId, filter: HitFilter): string {
  if (id === "exchange") return filter.exchange;
  if (id === "direction") return filter.direction;
  if (id === "tier") return filter.tier;
  if (id === "pattern") return filter.pattern;
  if (id === "follow") return filter.follow;
  if (id === "reclaim") return filter.reclaim;
  if (id === "mcap") return filter.cap;
  if (id === "status") return filter.lifecycle;
  return "";
}

function patchChoice(id: ColumnId, value: string): Partial<HitFilter> | null {
  if (id === "exchange") return { exchange: value as HitFilter["exchange"] };
  if (id === "direction") return { direction: value as HitFilter["direction"] };
  if (id === "tier") return { tier: value as HitFilter["tier"] };
  if (id === "pattern") return { pattern: value as HitFilter["pattern"] };
  if (id === "follow") return { follow: value as HitFilter["follow"] };
  if (id === "reclaim") return { reclaim: value as HitFilter["reclaim"] };
  if (id === "mcap") return { cap: value as HitFilter["cap"] };
  if (id === "status") return { lifecycle: value as HitFilter["lifecycle"] };
  return null;
}

function ColumnFilter({ id, filter, onFilter }: { id: ColumnId; filter: HitFilter; onFilter: (patch: Partial<HitFilter>) => void }) {
  const choices = CHOICES[id];
  const active = columnFilterActive(id, filter);
  if (!choices && id !== "score" && id !== "price") return null;
  return (
    <details className="relative">
      <summary aria-label={`Filter ${COLUMN_LABEL[id] || id}`} className={cn("cursor-pointer list-none text-[10px] leading-none", active ? "text-fg" : "text-subtle")}>
        {active ? "●" : "▾"}
      </summary>
      <div className="absolute right-0 z-30 mt-1 grid w-44 gap-1 rounded-sm bg-surface p-2 text-left normal-case tracking-normal text-fg shadow-[var(--shadow-border)]">
        {choices?.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={cn("rounded-sm px-1 py-0.5 text-left text-[12px] hover:bg-bg", currentChoice(id, filter) === choice.value && "text-fg")}
            onClick={() => {
              const patch = patchChoice(id, choice.value);
              if (patch) onFilter(patch);
            }}
          >
            {choice.label}
          </button>
        ))}
        {id === "score" ? (
          <label className="grid gap-1 text-[11px] text-muted">
            Minimum score
            <input
              aria-label="Minimum score"
              value={filter.minScore || ""}
              onChange={(e) => onFilter({ minScore: Number(e.target.value) || 0 })}
              className="h-7 rounded-sm bg-bg px-2 text-fg outline-none"
            />
          </label>
        ) : null}
        {id === "price" ? (
          <div className="grid gap-1 text-[11px] text-muted">
            <label className="grid gap-1">
              Minimum
              <input aria-label="Column minimum price" value={filter.minPrice ?? ""} onChange={(e) => onFilter({ minPrice: e.target.value.trim() ? Number(e.target.value) : null })} className="h-7 rounded-sm bg-bg px-2 text-fg outline-none" />
            </label>
            <label className="grid gap-1">
              Maximum
              <input aria-label="Column maximum price" value={filter.maxPrice ?? ""} onChange={(e) => onFilter({ maxPrice: e.target.value.trim() ? Number(e.target.value) : null })} className="h-7 rounded-sm bg-bg px-2 text-fg outline-none" />
            </label>
          </div>
        ) : null}
      </div>
    </details>
  );
}
