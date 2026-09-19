import { Link } from "@tanstack/react-router";
import type { ScreenRow } from "@/lib/kosh/types";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { universeName } from "@/lib/kosh/universe";
import { cn } from "@/lib/utils";

function flag(r: ScreenRow) {
  const bits: string[] = [];
  if (r.nr7) bits.push("NR7");
  if ((r.gapPct ?? 0) >= 1.5) bits.push("Gap");
  if (r.offHigh != null && r.offHigh >= -2) bits.push("High");
  if (r.rsi != null && r.rsi < 40) bits.push("Oversold");
  if (r.rsi != null && r.rsi > 70) bits.push("Stretched");
  if ((r.volRatio ?? 0) >= 1.5) bits.push("Volume");
  return bits.slice(0, 3);
}

export function WatchBoard({
  symbols,
  rows,
  loading,
}: {
  symbols: string[];
  rows: ScreenRow[];
  loading?: boolean;
}) {
  const map = new Map(rows.map((r) => [r.symbol.toUpperCase(), r]));
  const list = symbols.map((s) => {
    const k = s.toUpperCase().replace(/\.(NS|BO)$/i, "");
    return { symbol: k, row: map.get(k) };
  });
  if (!symbols.length) {
    return (
      <div className="rounded-lg bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]">
        Pin names from a stock page. Morning board shows last, day, RSI, volume and 52-week.
      </div>
    );
  }
  return (
    <>
    <div className="hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
      <table className="kosh-table w-full text-left text-[13px]">
        <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
          <tr>
            {["Name", "Last", "Day", "RSI 14", "Vol vs 20d avg", "vs 52w high", "Flags"].map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map(({ symbol, row }) => {
            const flags = row ? flag(row) : [];
            return (
              <tr key={symbol}>
                <td className="px-3 py-2">
                  <Link to="/s/$symbol" params={{ symbol }} className="hover:text-chart">
                    <div className="font-medium">{row?.name || universeName(symbol)}</div>
                    <div className="text-[11px] text-subtle">{symbol}</div>
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono tabular">{row ? fmtPx(row.price) : loading ? "…" : "—"}</td>
                <td className={cn("px-3 py-2 font-mono tabular", (row?.changePct ?? 0) >= 0 ? "text-up" : "text-down")}>
                  {row ? fmtPct(row.changePct) : "—"}
                </td>
                <td className="px-3 py-2 font-mono tabular">{row?.rsi != null ? row.rsi.toFixed(0) : "—"}</td>
                <td className="px-3 py-2 font-mono tabular">
                  {row?.volRatio != null ? row.volRatio.toFixed(1) + "× 20d avg" : "—"}
                </td>
                <td className={cn("px-3 py-2 font-mono tabular", (row?.offHigh ?? 0) >= -5 ? "text-up" : "text-muted")}>
                  {row?.offHigh != null ? fmtPct(row.offHigh) : "—"}
                </td>
                <td className="px-3 py-2">
                  {flags.length ? (
                    <span className="flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <span key={f} className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] tracking-[0.04em] text-muted uppercase">
                          {f}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="grid gap-2 md:hidden">
      {list.map(({ symbol, row }) => {
        const flags = row ? flag(row) : [];
        return (
          <article key={symbol} className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
            <Link to="/s/$symbol" params={{ symbol }} className="hover:text-chart">
              <div className="font-medium">{row?.name || universeName(symbol)}</div>
              <div className="text-[11px] text-subtle">{symbol}</div>
            </Link>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <div className="text-[11px] text-subtle">Last</div>
                <div className="font-mono tabular">{row ? fmtPx(row.price) : loading ? "…" : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">Day</div>
                <div className={cn("font-mono tabular", (row?.changePct ?? 0) >= 0 ? "text-up" : "text-down")}>
                  {row ? fmtPct(row.changePct) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">RSI</div>
                <div className="font-mono tabular">{row?.rsi != null ? row.rsi.toFixed(0) : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">Vol</div>
                <div className="font-mono tabular">{row?.volRatio != null ? row.volRatio.toFixed(1) + "×" : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">vs 52w</div>
                <div className="font-mono tabular">{row?.offHigh != null ? fmtPct(row.offHigh) : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">Flags</div>
                <div className="truncate text-[11px] text-muted">{flags.length ? flags.join(" · ") : "—"}</div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
    </>
  );
}
