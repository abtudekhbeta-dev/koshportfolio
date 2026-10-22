import { useEffect, useMemo, useRef, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { heatPaint, packWeightRows } from "@/lib/kosh/heat-layout";
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
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const packed = useMemo(() => {
    const size = equal ? stocks.map(() => 1) : stocks.map((row) => row.weight);
    return packWeightRows(size, width || 720);
  }, [stocks, equal, width]);
  const byIndex = new Map(packed.tiles.map((tile) => [tile.i, tile]));
  const tip = stocks.find((row) => row.id === active) || null;

  return (
    <div ref={ref} className="relative w-full" style={{ height: Math.max(packed.height, 240) }} onMouseLeave={() => setActive(null)}>
      {stocks.map((row, index) => {
        const box = byIndex.get(index);
        if (!box || box.w < 2 || box.h < 2) return null;
        const paint = heatPaint(row.pct);
        const label = row.pct == null ? "—" : fmtPct(row.pct);
        const showLogo = logos && Boolean(row.symbol) && box.w >= 108 && box.h >= 78;
        const showWeight = box.w >= 88 && box.h >= 70;
        return (
          <button
            key={row.id}
            type="button"
            className={cn(
              "absolute flex flex-col items-center justify-center overflow-hidden rounded-[3px] px-1 text-center leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
              row.dim && "opacity-25",
            )}
            style={{
              left: box.x + 1,
              top: box.y + 1,
              width: Math.max(0, box.w - 2),
              height: Math.max(0, box.h - 2),
              background: paint.background,
              color: paint.color,
            }}
            aria-label={`${row.symbol || row.name}, share ${row.weight.toFixed(2)}%, session ${label}`}
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
            {showLogo ? <CompanyLogo symbol={row.symbol || ""} name={row.name} size={box.h >= 110 ? 36 : 24} /> : null}
            <div className={cn("max-w-full truncate font-semibold", box.h >= 80 ? "text-[13px]" : "text-[11px]")}>{row.symbol || row.name}</div>
            <div className="font-mono text-[11px] tabular">{label}</div>
            {showWeight ? <div className="font-mono text-[10px] text-white/75 tabular">{row.weight.toFixed(1)}%</div> : null}
          </button>
        );
      })}
      {tip ? (
        <div className="pointer-events-auto absolute bottom-2 left-2 z-10 max-w-[260px] rounded-md bg-[#101418]/95 p-2.5 text-left text-[12px] text-white shadow-lg" role="status">
          <div className="font-semibold">{tip.symbol || tip.name}</div>
          <div className="truncate text-[11px] text-white/70">{tip.name}</div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px] tabular">
            <dt className="text-white/60">Price</dt>
            <dd>{tip.price != null ? fmtPx(tip.price) : "—"}</dd>
            <dt className="text-white/60">Session</dt>
            <dd>{tip.pct == null ? "No print" : fmtPct(tip.pct)}</dd>
            <dt className="text-white/60">Change</dt>
            <dd>{tip.changeAbs == null ? "—" : (tip.changeAbs > 0 ? "+" : "") + fmtPx(tip.changeAbs)}</dd>
            <dt className="text-white/60">Index share</dt>
            <dd>{tip.weight.toFixed(2)}%</dd>
            <dt className="text-white/60">Sector</dt>
            <dd className="truncate">{tip.sector}</dd>
          </dl>
          {tip.symbol ? (
            <button type="button" className="mt-2 text-[12px] text-[#9ecbff] hover:underline" onClick={() => onOpen(tip.symbol || "", tip.name)}>
              Open chart
            </button>
          ) : (
            <p className="mt-2 text-[11px] text-white/60">No NSE code for this name.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
