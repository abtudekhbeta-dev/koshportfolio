import { useEffect, useRef, useState } from "react";
import { BENCH } from "@/lib/kosh/benchmarks";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

const BENCH_IDS = Object.keys(BENCH);

/** One control for price, benchmark-adjusted OHLC, and USD. Not three peer buttons. */
export function AdjustMenu({ compact = false, stop = false }: { compact?: boolean; stop?: boolean }) {
  const mode = useKosh((s) => s.chartPrefs.chartMode || "price");
  const bench = useKosh((s) => s.chartPrefs.chartBench || "nifty");
  const patch = useKosh((s) => s.patchChartPrefs);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = BENCH[bench]?.name || "Nifty 50";
  const label = mode === "usd" ? "USD-adjusted" : mode === "bench" ? `Adjusted · ${name}` : "Price";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          if (stop) e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "rounded-sm font-semibold shadow-[var(--shadow-border)]",
          compact ? "h-7 px-2 text-[11px]" : "h-8 px-2.5 text-[11px]",
          mode === "price" ? "bg-bg text-muted" : "bg-surface-2 text-fg",
        )}
      >
        {label} ▾
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 z-30 mt-1 w-56 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]"
        >
          <button
            type="button"
            role="menuitem"
            className={cn("block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "price" ? "bg-surface-2" : "hover:bg-surface")}
            onClick={(e) => {
              if (stop) e.stopPropagation();
              patch({ chartMode: "price" });
              setOpen(false);
            }}
          >
            Price
          </button>
          <button
            type="button"
            role="menuitem"
            className={cn("mt-1 block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "bench" ? "bg-surface-2" : "hover:bg-surface")}
            onClick={(e) => {
              if (stop) e.stopPropagation();
              patch({ chartMode: "bench" });
            }}
          >
            Benchmark-adjusted
          </button>
          {mode === "bench" ? (
            <label className="mt-1 block px-2 pb-1 text-[11px] text-muted">
              Benchmark
              <select
                aria-label="Benchmark"
                value={BENCH[bench] ? bench : "nifty"}
                className="mt-1 h-8 w-full rounded-sm border border-border bg-bg px-2 text-[12px] text-fg"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => patch({ chartBench: e.target.value })}
              >
                {BENCH_IDS.map((id) => (
                  <option key={id} value={id}>
                    {BENCH[id].name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={cn("mt-1 block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "usd" ? "bg-surface-2" : "hover:bg-surface")}
            onClick={(e) => {
              if (stop) e.stopPropagation();
              patch({ chartMode: "usd" });
              setOpen(false);
            }}
          >
            USD-adjusted
          </button>
          <p className="mt-1 px-2 text-[10px] leading-snug text-subtle">
            Benchmark-adjusted redraws the stock’s own candles after the index. It is not a second line.
          </p>
        </div>
      ) : null}
    </div>
  );
}
