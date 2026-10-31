import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { terminalSearch } from "@/lib/kosh/instrument-nav";
import { listingId } from "@/lib/kosh/listing";
import { quadrantLabel, rankByRelativeStrength, type RrgReading } from "@/lib/kosh/rrg-frame";
import { registryChartSymbol } from "@/lib/kosh/rrg-sectors";
import { cn } from "@/lib/utils";

type Key = "rank" | "symbol" | "rsRatio" | "rankChange" | "rsMomentum" | "absoluteReturn" | "relativeReturn";

export function RrgRank({
  readings,
  benchmark,
  windowLabel,
  onSelect,
  selected,
}: {
  readings: RrgReading[];
  benchmark: string;
  windowLabel: string;
  onSelect: (symbol: string) => void;
  selected: string | null;
}) {
  const [query, setQuery] = useState("");
  const [key, setKey] = useState<Key>("rank");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const ranked = useMemo(() => rankByRelativeStrength(readings), [readings]);
  const text = query.trim().toLowerCase();
  const rows = ranked.filter((row) => !text || `${row.symbol} ${row.name}`.toLowerCase().includes(text));
  const sorted = [...rows].sort((a, b) => {
    const sign = dir === "asc" ? 1 : -1;
    const av = key === "symbol" ? a.name : a[key];
    const bv = key === "symbol" ? b.name : b[key];
    if (av == null && bv == null) return a.symbol.localeCompare(b.symbol);
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sign;
    return ((av as number) - (bv as number)) * sign;
  });

  function flip(next: Key) {
    if (key === next) setDir((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setKey(next);
      setDir(next === "symbol" ? "asc" : next === "rank" ? "asc" : "desc");
    }
  }

  return (
    <section aria-label="Relative strength ranking">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[14px] font-semibold">Relative strength ranking</h2>
          <p className="max-w-3xl text-[12px] text-muted" title="Rank 1 is the highest RS-Ratio. That is Kosh's relative-strength average, not the price return. Previous rank is the prior point in this same tail. A blank previous rank means that point was missing. Rank change is previous minus current, so a positive number moved up. RS-Momentum is the momentum reading, not the rank change. The return window changes only the performance columns.">
            Versus {benchmark}. Rank is RS-Ratio, not price return. {windowLabel}
          </p>
        </div>
        <input className="h-8 rounded-sm border border-border bg-surface px-2 text-[12px]" aria-label="Filter ranking" placeholder="Filter" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[920px] text-left text-[13px]">
          <thead className="bg-surface text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <Th label="Rank" k="rank" active={key} dir={dir} onSort={flip} />
              <Th label="Name" k="symbol" active={key} dir={dir} onSort={flip} />
              <th className="px-2 py-2 font-medium">Exchange</th>
              <Th label="RS-Ratio" k="rsRatio" active={key} dir={dir} onSort={flip} />
              <th className="px-2 py-2 font-medium">Previous</th>
              <Th label="Rank change" k="rankChange" active={key} dir={dir} onSort={flip} />
              <Th label="RS-Momentum" k="rsMomentum" active={key} dir={dir} onSort={flip} />
              <Th label="Price" k="absoluteReturn" active={key} dir={dir} onSort={flip} />
              <th className="px-2 py-2 font-medium">Benchmark</th>
              <Th label="Relative" k="relativeReturn" active={key} dir={dir} onSort={flip} />
              <th className="px-2 py-2 font-medium">Chart</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.symbol} className={cn("cursor-pointer border-t border-border hover:bg-surface", selected === row.symbol && "bg-surface")} onClick={() => onSelect(row.symbol)}>
                <td className="px-2 py-2 tabular-nums">{row.rank ?? "—"}</td>
                <td className="px-2 py-2">
                  <div className="font-medium">{row.name}</div>
                  <div className="text-[11px] text-muted">{row.symbol} · {quadrantLabel(row.quadrant)}</div>
                </td>
                <td className="px-2 py-2 text-[12px]">{row.exchange || "—"}</td>
                <td className="px-2 py-2 text-right tabular-nums">{num(row.rsRatio)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{row.previousRank ?? "—"}</td>
                <td className={cn("px-2 py-2 text-right tabular-nums", row.rankChange != null && row.rankChange > 0 ? "text-up" : row.rankChange != null && row.rankChange < 0 ? "text-down" : "")}>{row.rankChange == null ? "—" : `${row.rankChange > 0 ? "+" : ""}${row.rankChange}`}</td>
                <td className="px-2 py-2 text-right tabular-nums">{num(row.rsMomentum)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{ret(row.absoluteReturn)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{ret(row.benchmarkReturn)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{ret(row.relativeReturn)}</td>
                <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                  <ChartLink symbol={row.symbol} name={row.name} exchange={row.exchange} />
                </td>
              </tr>
            ))}
            {!sorted.length ? (
              <tr>
                <td colSpan={11} className="px-2 py-4 text-muted">Nothing in this set has an RS-Ratio, or the filter matches nothing. Missing history is not filled.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ChartLink({ symbol, name, exchange }: { symbol: string; name: string; exchange?: string | null }) {
  const chart = registryChartSymbol(symbol);
  if (chart) {
    return (
      <Link to="/markets" search={terminalSearch(chart, name)} className="text-[12px] text-muted hover:text-fg">
        Open chart
      </Link>
    );
  }
  if (/\s/.test(symbol)) return <span className="text-[12px] text-subtle">—</span>;
  const id = listingId(symbol, exchange || undefined);
  return (
    <span className="flex gap-2">
      <Link to="/s/$symbol" params={{ symbol: id }} className="text-[12px] text-muted hover:text-fg">Page</Link>
      <Link to="/markets" search={terminalSearch(id, name)} className="text-[12px] text-muted hover:text-fg">Chart</Link>
    </span>
  );
}

function Th({ label, k, active, dir, onSort }: { label: string; k: Key; active: Key; dir: "asc" | "desc"; onSort: (key: Key) => void }) {
  return (
    <th className="px-2 py-2 font-medium">
      <button type="button" className={active === k ? "text-fg" : ""} onClick={() => onSort(k)}>
        {label}
        {active === k ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );
}

function num(value: number | null) {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(2);
}

function ret(value: number | null) {
  return value == null || !Number.isFinite(value) ? "—" : `${(value * 100).toFixed(1)}%`;
}
