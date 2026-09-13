import { Link } from "@tanstack/react-router";
import type { ScreenRow } from "@/lib/kosh/types";
import { fmtPct } from "@/lib/kosh/engine";
import { cn } from "@/lib/utils";

function heat(v: number) {
  if (v >= 3) return "bg-up text-accent-fg";
  if (v >= 1) return "bg-up/70 text-accent-fg";
  if (v >= 0.15) return "bg-up/35 text-fg";
  if (v > -0.15) return "bg-surface-2 text-muted";
  if (v > -1) return "bg-down/35 text-fg";
  if (v > -3) return "bg-down/70 text-accent-fg";
  return "bg-down text-accent-fg";
}

export function MarketHeat({ rows }: { rows: ScreenRow[] }) {
  const groups = new Map<string, ScreenRow[]>();
  for (const r of rows) {
    const g = groups.get(r.sector) || [];
    g.push(r);
    groups.set(r.sector, g);
  }
  const sectors = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (!rows.length) return <p className="text-sm text-muted">Heat fills once prices are in.</p>;
  return (
    <div className="grid gap-4">
      {sectors.map(([sector, list]) => (
        <div key={sector}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <h3 className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{sector}</h3>
            <span className="font-mono text-[11px] text-muted tabular">
              {fmtPct(list.reduce((s, r) => s + r.changePct, 0) / list.length)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list
              .slice()
              .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
              .map((r) => (
                <Link
                  key={r.symbol}
                  to="/s/$symbol"
                  params={{ symbol: r.symbol }}
                  className={cn("rounded-sm px-2 py-2 transition-transform duration-150 hover:scale-[1.01]", heat(r.changePct))}
                >
                  <div className="truncate text-[12px] font-medium">{r.symbol}</div>
                  <div className="font-mono text-[11px] tabular">{fmtPct(r.changePct)}</div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
