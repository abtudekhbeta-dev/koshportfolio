import { useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { heatPaint } from "@/lib/kosh/heat-layout";
import type { Tile } from "@/lib/kosh/index-basket";
import { cn } from "@/lib/utils";

export type MapStock = {
  id: string;
  symbol: string | null;
  name: string;
  sector: string;
  box: Tile;
  pct: number | null;
  price: number | null;
  changeAbs: number | null;
  mcapCr: number | null;
  weight: number | null;
  metric: string;
};

function fmtCr(n: number | null) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 100_000) return (n / 100_000).toFixed(2) + " Lakh Cr";
  if (n >= 100) return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
  return n.toFixed(0) + " Cr";
}

export function StockTreemap({
  stocks,
  sectors,
  logos,
  onOpen,
  onZoom,
  className,
}: {
  stocks: MapStock[];
  sectors?: { name: string; box: Tile }[];
  logos: boolean;
  onOpen: (symbol: string, name: string) => void;
  onZoom?: (sector: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const tip = stocks.find((row) => row.id === active) || null;

  return (
    <div className={cn("relative h-full w-full", className)} onMouseLeave={() => setActive(null)}>
      {sectors?.map((sector) =>
        sector.box.w < 6 || sector.box.h < 6 ? null : (
          <button
            key={sector.name}
            type="button"
            className="absolute z-[1] truncate px-1 text-left text-[10px] font-semibold tracking-wide text-white/80 uppercase hover:text-white"
            style={{ left: `${sector.box.x}%`, top: `${sector.box.y}%`, width: `${sector.box.w}%`, height: 16 }}
            onClick={() => onZoom?.(sector.name)}
          >
            {sector.name}
          </button>
        ),
      )}
      {stocks.map((row) => {
        const paint = heatPaint(row.pct);
        const wide = row.box.w >= 8 && row.box.h >= 14;
        const named = row.box.w >= 4.5 && row.box.h >= 8;
        const logo = logos && row.symbol && row.box.w >= 5 && row.box.h >= 10;
        const label = row.pct == null ? "—" : fmtPct(row.pct);
        return (
          <button
            key={row.id}
            type="button"
            className="absolute z-[2] flex flex-col items-center justify-center overflow-hidden rounded-[2px] px-1 text-center leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
            style={{
              left: `calc(${row.box.x}% + 1px)`,
              top: `calc(${row.box.y}% + 1px)`,
              width: `calc(${row.box.w}% - 2px)`,
              height: `calc(${row.box.h}% - 2px)`,
              background: paint.background,
              color: paint.color,
            }}
            aria-label={`${row.symbol || row.name}, ${row.metric} ${label}`}
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
            {logo ? <CompanyLogo symbol={row.symbol || ""} name={row.name} size={wide ? 36 : 22} /> : null}
            {named ? <div className={cn("max-w-full truncate font-semibold", wide ? "mt-1 text-[13px]" : "text-[10px]")}>{row.symbol || row.name}</div> : null}
            {named && row.box.h >= 12 ? <div className={cn("font-mono tabular", wide ? "text-[13px]" : "text-[10px]")}>{label}</div> : null}
          </button>
        );
      })}
      {tip ? (
        <div className="pointer-events-auto absolute bottom-2 left-2 z-10 max-w-[260px] rounded-md bg-[#101418]/95 p-2.5 text-left text-[12px] text-white shadow-lg" role="status">
          <div className="flex items-center gap-2">
            {logos && tip.symbol ? <CompanyLogo symbol={tip.symbol} name={tip.name} size={22} /> : null}
            <div className="min-w-0">
              <div className="truncate font-semibold">{tip.symbol || tip.name}</div>
              <div className="truncate text-[11px] text-white/70">{tip.name}</div>
            </div>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px] tabular">
            <dt className="text-white/60">Price</dt>
            <dd>{tip.price != null ? fmtPx(tip.price) : "—"}</dd>
            <dt className="text-white/60">{tip.metric}</dt>
            <dd>{tip.pct == null ? "No print" : fmtPct(tip.pct)}</dd>
            <dt className="text-white/60">Change</dt>
            <dd>{tip.changeAbs == null ? "—" : (tip.changeAbs > 0 ? "+" : "") + fmtPx(tip.changeAbs)}</dd>
            <dt className="text-white/60">Mkt cap</dt>
            <dd>{fmtCr(tip.mcapCr)}</dd>
            <dt className="text-white/60">Index share</dt>
            <dd>{tip.weight == null ? "—" : tip.weight.toFixed(2) + "%"}</dd>
            <dt className="text-white/60">Sector</dt>
            <dd className="truncate">{tip.sector || "—"}</dd>
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

export function HeatLegend({ metric }: { metric: string }) {
  const steps = [-2.5, -0.8, 0, 0.8, 2.5];
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/70" aria-hidden>
      <span>{metric}</span>
      {steps.map((step) => (
        <span key={step} className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-[2px]" style={{ background: heatPaint(step).background }} />
          {step > 0 ? "+" : ""}
          {step.toFixed(1)}%
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="size-2.5 rounded-[2px]" style={{ background: heatPaint(null).background }} />
        No print
      </span>
    </div>
  );
}
