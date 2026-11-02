import { useEffect, useMemo, useRef, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { HEAT_INK } from "@/lib/kosh/heat-contrast";
import { heatPaint } from "@/lib/kosh/heat-layout";
import { treemap } from "@/lib/kosh/index-basket";
import { cn } from "@/lib/utils";

export type WeightStock = {
  id: string;
  symbol: string | null;
  name: string;
  sector: string;
  weight: number;
  pct: number | null;
  price: number | null;
  changeAbs: number | null;
  dim?: boolean;
};

export function IndexWeightMap({
  stocks,
  equal,
  logos,
  onOpen,
}: {
  stocks: WeightStock[];
  equal: boolean;
  logos: boolean;
  onOpen: (symbol: string, name: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const tiles = useMemo(() => {
    if (box.w < 8 || box.h < 8) return [];
    const size = equal ? stocks.map(() => 1) : stocks.map((row) => (row.weight > 0 ? row.weight : 0));
    return treemap(size, box.w, box.h);
  }, [stocks, equal, box.w, box.h]);
  const tip = stocks.find((row) => row.id === active) || null;

  return (
    <div ref={ref} className="relative h-full min-h-0 w-full" onMouseLeave={() => setActive(null)}>
      {stocks.map((row, index) => {
        const tile = tiles[index];
        if (!tile || tile.w < 2 || tile.h < 2) return null;
        const paint = heatPaint(row.pct);
        const label = row.pct == null ? "—" : fmtPct(row.pct);
        const showLogo = logos && Boolean(row.symbol) && tile.w >= 108 && tile.h >= 78;
        const showName = tile.w >= 64 && tile.h >= 48;
        const showWeight = !equal && tile.w >= 72 && tile.h >= 58;
        return (
          <button
            key={row.id}
            type="button"
            className={cn(
              "absolute flex flex-col items-center justify-center overflow-hidden rounded-[3px] px-1 text-center leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
              row.dim && "opacity-25",
            )}
            style={{
              left: tile.x + 1,
              top: tile.y + 1,
              width: Math.max(0, tile.w - 2),
              height: Math.max(0, tile.h - 2),
              background: paint.background,
              color: paint.color,
              outlineColor: HEAT_INK,
            }}
            aria-label={`${row.symbol || row.name}, share ${row.weight > 0 ? row.weight.toFixed(2) + "%" : "unpublished"}, session ${label}`}
            onMouseEnter={() => setActive(row.id)}
            onFocus={() => setActive(row.id)}
            onPointerUp={(event) => {
              if (event.pointerType === "touch") {
                setActive(row.id);
                return;
              }
              if (event.button === 0 && row.symbol) onOpen(row.symbol, row.name);
            }}
          >
            {showLogo ? <CompanyLogo symbol={row.symbol || ""} name={row.name} size={tile.h >= 110 ? 36 : 24} /> : null}
            <div className={cn("max-w-full truncate font-semibold", tile.h >= 72 ? "text-[13px]" : "text-[11px]")}>{row.symbol || row.name}</div>
            <div className={cn("font-mono font-semibold tabular", tile.h >= 64 ? "text-[12px]" : "text-[10px]")}>{label}</div>
            {showName ? <div className="max-w-full truncate text-[10px]">{row.name}</div> : null}
            {showWeight ? <div className="font-mono text-[10px] tabular">{row.weight.toFixed(1)}%</div> : null}
          </button>
        );
      })}
      {tip ? (
        <div
          className="pointer-events-auto absolute bottom-2 left-2 z-10 max-w-[260px] rounded-md border border-border p-2.5 text-left text-[12px] shadow-lg"
          style={{ background: "#f7f9fc", color: HEAT_INK }}
          role="status"
        >
          <div className="font-semibold">{tip.symbol || tip.name}</div>
          <div className="truncate text-[11px] opacity-70">{tip.name}</div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px] tabular">
            <dt className="opacity-60">Price</dt>
            <dd>{tip.price != null ? fmtPx(tip.price) : "—"}</dd>
            <dt className="opacity-60">Session</dt>
            <dd>{tip.pct == null ? "No print" : fmtPct(tip.pct)}</dd>
            <dt className="opacity-60">Change</dt>
            <dd>{tip.changeAbs == null ? "—" : (tip.changeAbs > 0 ? "+" : "") + fmtPx(tip.changeAbs)}</dd>
            <dt className="opacity-60">Index share</dt>
            <dd>{tip.weight > 0 ? `${tip.weight.toFixed(2)}%` : "Unpublished"}</dd>
            <dt className="opacity-60">Sector</dt>
            <dd className="truncate">{tip.sector}</dd>
          </dl>
          {tip.symbol ? (
            <button type="button" className="mt-2 text-[12px] underline" onClick={() => onOpen(tip.symbol || "", tip.name)}>
              Open chart
            </button>
          ) : (
            <p className="mt-2 text-[11px] opacity-70">No NSE code for this name.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
