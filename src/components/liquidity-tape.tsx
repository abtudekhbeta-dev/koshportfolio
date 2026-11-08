import { useQuery } from "@tanstack/react-query";
import { apiOhlc } from "@/lib/kosh/api";
import { foldSession4h, prepareBars, type LiqEvent } from "@/lib/kosh/liquidity";

/** The 4-hour candles the scan actually used. The stock chart has no 4-hour frame. */
export function LiquidityTape({ symbol, hit }: { symbol: string; hit: LiqEvent }) {
  const query = useQuery({
    queryKey: ["liq-tape", symbol],
    queryFn: () => apiOhlc(symbol, "2y", "60m"),
    staleTime: 60_000,
  });
  if (query.isLoading) return <p className="p-4 text-[13px] text-muted">Loading the 4-hour candles the scan used…</p>;
  if (query.isError || !query.data || query.data.missing) {
    return <p className="p-4 text-[13px] text-muted">The hourly tape did not answer, so the 4-hour structure cannot be drawn.</p>;
  }
  const bars = prepareBars(foldSession4h(query.data.bars), true).bars;
  const sweepAt = bars.findIndex((bar) => bar.t === hit.sweepT);
  const center = sweepAt >= 0 ? sweepAt : bars.length - 1;
  const slice = bars.slice(Math.max(0, center - 24), Math.min(bars.length, center + 16));
  if (slice.length < 2) return <p className="p-4 text-[13px] text-muted">Not enough 4-hour candles to draw this setup.</p>;
  const hi = Math.max(...slice.map((bar) => bar.h), hit.level, hit.extreme);
  const lo = Math.min(...slice.map((bar) => bar.l), hit.level, hit.extreme);
  const span = Math.max(1e-9, hi - lo);
  const w = 640;
  const h = 240;
  const pad = 16;
  const slot = (w - pad * 2) / slice.length;
  const y = (price: number) => pad + ((hi - price) / span) * (h - pad * 2);
  const levelY = y(hit.level);
  return (
    <div>
      <p className="px-3 pb-2 text-[12px] text-muted">
        These are the 4-hour candles folded from hourly prints inside 09:15–15:30 IST. The afternoon bar is shorter. This is the structure the scan used, not the 1-hour stock chart.
        {query.data.seriesNote ? ` ${query.data.seriesNote}` : ""}
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="4-hour candles around the signal">
        <line x1={pad} x2={w - pad} y1={levelY} y2={levelY} stroke="currentColor" strokeDasharray="3 3" opacity={0.45} />
        {slice.map((bar, i) => {
          const x = pad + i * slot + slot * 0.5;
          const up = bar.c >= bar.o;
          const color = up ? "var(--up)" : "var(--down)";
          const mark = bar.t === hit.sweepT ? "Broke" : bar.t === hit.reclaimT ? "Back" : bar.t === hit.confirmT ? "Next" : "";
          return (
            <g key={bar.t}>
              <line x1={x} x2={x} y1={y(bar.h)} y2={y(bar.l)} stroke={color} />
              <rect x={x - Math.max(1, slot * 0.28)} y={y(Math.max(bar.o, bar.c))} width={Math.max(2, slot * 0.56)} height={Math.max(1, Math.abs(y(bar.o) - y(bar.c)))} fill={color} />
              {mark ? (
                <text x={x} y={12} textAnchor="middle" fontSize="9" fill="currentColor">
                  {mark}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {sweepAt < 0 ? <p className="px-3 text-[12px] text-muted">The sweep timestamp is not on this folded tape. The marks may sit on a different hour than the scan stored.</p> : null}
    </div>
  );
}
