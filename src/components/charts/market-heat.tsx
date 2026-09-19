import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { ScreenRow } from "@/lib/kosh/types";
import { fmtPct } from "@/lib/kosh/engine";
import { heatGroups } from "@/lib/kosh/heat";
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
  const groups = heatGroups(rows, 40);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!rows.length) return <p className="text-sm text-muted">Heat fills once prices are in.</p>;
  return (
    <div className="grid gap-4">
      {groups.map((g) => {
        const expanded = g.collapseDefault ? Boolean(open[g.sector]) : true;
        return (
          <div key={g.sector}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              {g.collapseDefault ? (
                <button
                  type="button"
                  className="text-left text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase hover:text-fg"
                  onClick={() => setOpen((s) => ({ ...s, [g.sector]: !s[g.sector] }))}
                  aria-expanded={expanded}
                >
                  {g.sector}
                  <span className="ml-2 font-mono font-normal normal-case tracking-normal text-muted">
                    {g.total} names · {expanded ? "hide" : "show movers"}
                  </span>
                </button>
              ) : (
                <h3 className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{g.sector}</h3>
              )}
              <span className="font-mono text-[11px] text-muted tabular">{fmtPct(g.avg)}</span>
            </div>
            {expanded ? (
              <>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {g.rows.map((r) => (
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
                {g.hidden ? (
                  <p className="mt-1.5 text-[11px] text-subtle">Showing the {g.rows.length} largest moves · {g.hidden} more not drawn.</p>
                ) : null}
              </>
            ) : (
              <p className="text-[12px] text-muted">Collapsed. Names without a mapped sector — tap to see the biggest moves.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
