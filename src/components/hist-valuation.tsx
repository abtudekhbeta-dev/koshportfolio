import { useMemo, useState } from "react";
import { historicalValuation } from "@/lib/kosh/hist-valuation";
import type { Fundamentals } from "@/lib/kosh/types";

function n(v: number | null, d = 1) {
  return v == null ? "—" : v.toFixed(d);
}

export function HistValuationCard({
  price,
  bars,
  fund,
}: {
  price: number | null;
  bars: { t: number; c: number }[];
  fund: Fundamentals | null | undefined;
}) {
  const [years, setYears] = useState<1 | 3 | 5 | 10>(5);
  const pack = useMemo(() => historicalValuation({ price, bars, fund: fund || null, years }), [price, bars, fund, years]);
  const priced = pack.years.filter((row) => row.estPe != null);
  const maxPe = Math.max(...priced.map((row) => row.estPe || 0), 1);
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Valuation history</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">{pack.method}</p>
        </div>
        <div className="flex gap-1">
          {([1, 3, 5, 10] as const).map((span) => (
            <button key={span} type="button" className={`h-8 rounded-sm px-2 text-[12px] ${years === span ? "bg-bg-elevated text-fg" : "text-muted"}`} onClick={() => setYears(span)}>
              {span}Y
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Trailing P/E" value={n(pack.currentPe)} hint={pack.industryPe == null ? "Industry not on the card" : `Industry ${n(pack.industryPe)}`} />
        <Metric label="Est. median P/E" value={n(pack.peMedian)} hint={pack.peLow == null ? "No estimated years" : `Range ${n(pack.peLow)}–${n(pack.peHigh)}`} />
        <Metric label="Percentile" value={pack.pePercentile == null ? "—" : `${Math.round(pack.pePercentile)}`} hint="Trailing P/E vs estimated years" />
        <Metric label="Earnings yield" value={pack.currentEarningsYield == null ? "—" : `${pack.currentEarningsYield.toFixed(1)}%`} hint={pack.currentPb == null ? "P/B unavailable" : `P/B ${n(pack.currentPb, 2)}`} />
      </div>
      <p className="mt-3 text-[13px]">{pack.read}</p>
      {pack.profitCagr != null || pack.priceCagr != null ? (
        <p className="mt-1 text-[13px] text-muted">
          Over the overlapping years: profit {pack.profitCagr == null ? "—" : `${pack.profitCagr.toFixed(1)}%`} a year, price {pack.priceCagr == null ? "—" : `${pack.priceCagr.toFixed(1)}%`} a year.
        </p>
      ) : null}
      {priced.length > 1 ? (
        <div className="mt-3 flex h-24 items-end gap-2" aria-hidden>
          {priced.map((row) => (
            <div key={row.periodEnd} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div className="w-full rounded-sm bg-chart/70" style={{ height: `${((row.estPe || 0) / maxPe) * 100}%` }} />
              <span className="text-[10px] text-subtle">{row.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="py-1 pr-3 font-medium">Year</th>
              <th className="py-1 pr-3 font-medium">Price</th>
              <th className="py-1 pr-3 font-medium">Profit ₹ Cr</th>
              <th className="py-1 pr-3 font-medium">Est. EPS</th>
              <th className="py-1 pr-3 font-medium">Est. P/E</th>
              <th className="py-1 pr-3 font-medium">Yield</th>
              <th className="py-1 pr-3 font-medium">Est. P/B</th>
              <th className="py-1 pr-3 font-medium">Est. P/S</th>
              <th className="py-1 font-medium">Profit chg</th>
            </tr>
          </thead>
          <tbody>
            {pack.years.map((row) => (
              <tr key={row.periodEnd} className="border-t border-border">
                <td className="py-1 pr-3">
                  {row.label}
                  <div className="text-[11px] text-subtle">{row.priceAsOf || "No year-end print"}</div>
                </td>
                <td className="py-1 pr-3 font-mono">{row.price == null ? "—" : row.price.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</td>
                <td className="py-1 pr-3 font-mono">{n(row.profit, 0)}</td>
                <td className="py-1 pr-3 font-mono">{n(row.estEps, 2)}</td>
                <td className="py-1 pr-3 font-mono">{n(row.estPe)}</td>
                <td className="py-1 pr-3 font-mono">{row.estEarningsYield == null ? "—" : `${row.estEarningsYield.toFixed(1)}%`}</td>
                <td className="py-1 pr-3 font-mono">{n(row.estPb, 2)}</td>
                <td className="py-1 pr-3 font-mono">{n(row.estPs, 2)}</td>
                <td className="py-1 font-mono">{row.profitYoY == null ? "—" : `${row.profitYoY.toFixed(1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!pack.years.length ? <p className="py-2 text-[13px] text-muted">No annual profit series on this card.</p> : null}
      </div>
      <ul className="mt-3 grid gap-1 text-[12px] text-subtle">
        {pack.missing.filter((line, i, all) => all.indexOf(line) === i).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-[18px]">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-subtle">{hint}</div> : null}
    </div>
  );
}
