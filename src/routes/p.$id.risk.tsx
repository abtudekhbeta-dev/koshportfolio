import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { MetricCard } from "@/components/metric";
import { StockLink } from "@/components/stock-link";
import { apiScreener } from "@/lib/kosh/api";
import { dash, fmtPct } from "@/lib/kosh/engine";
import { portfolioExposure } from "@/lib/kosh/exposure";
import { listingLabel } from "@/lib/kosh/listing";
import { sameBusinessPiles } from "@/lib/kosh/peers";
import { cn } from "@/lib/utils";
import type { CorrPack } from "@/lib/kosh/types";

export const Route = createFileRoute("/p/$id/risk")({ component: Risk });

function Risk() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const { risk, cagr, corr, rows, value } = book;
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const exposure = useMemo(() => {
    const cards = new Map((screen.data?.rows || []).map((row) => [row.symbol.toUpperCase(), row]));
    return portfolioExposure(
      rows
        .filter((row) => row.kind !== "commodity")
        .map((row) => {
          const card = cards.get(listingLabel(row.symbol));
          return {
            symbol: row.symbol,
            name: row.name,
            weight: row.weight,
            sector: row.sector || card?.sector || "Unclassified",
            cap: row.cap || "Unclassified",
            pe: card?.pe ?? null,
            pb: card?.pb ?? null,
            roe: card?.roe ?? null,
            roce: card?.roce ?? null,
            de: card?.de ?? null,
            salesCagr3: card?.salesCagr3 ?? null,
            profitCagr3: card?.profitCagr3 ?? null,
            ret1y: row.periods?.y1 ?? card?.ret1y ?? null,
          };
        }),
    );
  }, [rows, screen.data]);
  const piles = useMemo(
    () => sameBusinessPiles(rows.filter((r) => r.kind !== "commodity"), corr),
    [rows, corr],
  );
  const hiddenW = piles.reduce((s, p) => s + p.names.reduce((a, n) => a + n.weight, 0), 0);
  const items = [
    { id: "cagr", v: dash(cagr, (x) => fmtPct(x)) },
    { id: "sharpe", v: dash(risk.sharpe) },
    { id: "sortino", v: dash(risk.sortino) },
    { id: "alpha", v: dash(risk.alpha, (x) => fmtPct(x)) },
    { id: "beta", v: dash(risk.beta) },
    { id: "corr", v: dash(risk.corr) },
    { id: "vol", v: dash(risk.vol, (x) => x.toFixed(1) + "%") },
    { id: "maxDd", v: dash(risk.maxDd, (x) => x.toFixed(1) + "%") },
    { id: "upCap", v: dash(risk.upCap, (x) => (x * 100).toFixed(0) + "%") },
    { id: "downCap", v: dash(risk.downCap, (x) => (x * 100).toFixed(0) + "%") },
    { id: "info", v: dash(risk.info) },
    { id: "calmar", v: dash(risk.calmar) },
  ];

  return (
    <div className="kosh-page grid gap-6">
      <p className="text-sm leading-relaxed text-muted">
        These numbers describe the ride of today’s portfolio over the last 1 year of overlapping sessions versus the index — not a promise. A dash means the history is too short to trust; we never print a fake 0.00. Risk-free rate is 6.5%. Alpha and beta are Jensen’s, on daily returns
        {risk.windowLabel ? ` — ${risk.windowLabel}` : ""}. Hover a name, or tap ? for a longer explanation.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <MetricCard key={it.id} id={it.id} value={it.v} />
        ))}
      </div>

      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">What the book is exposed to</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          Each figure is the holding weight times that company’s number, using only names that have the number. Portfolio P/E is 1 divided by the weighted earnings yield — not an average of P/E ratios. {exposure.notes[0]}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Portfolio P/E" value={exposure.portfolioPe == null ? "—" : exposure.portfolioPe.toFixed(1)} note={`${Math.round(exposure.peCoverage * 100)}% of weight`} />
          <Mini label="Earnings yield" value={exposure.earningsYield == null ? "—" : `${exposure.earningsYield.toFixed(1)}%`} note={`${Math.round(exposure.negativeEarningsWeight * 100)}% negative earnings`} />
          <Mini label="P/B" value={exposure.pb == null ? "—" : exposure.pb.toFixed(2)} note={`${Math.round(exposure.pbCoverage * 100)}% covered`} />
          <Mini label="ROE" value={exposure.roe == null ? "—" : `${exposure.roe.toFixed(1)}%`} note={exposure.roce == null ? "ROCE missing" : `ROCE ${exposure.roce.toFixed(1)}%`} />
          <Mini label="Sales CAGR 3Y" value={exposure.salesCagr == null ? "—" : `${exposure.salesCagr.toFixed(1)}%`} note={`${Math.round(exposure.growthWeight * 100)}% growing ≥12%`} />
          <Mini label="Profit CAGR 3Y" value={exposure.profitCagr == null ? "—" : `${exposure.profitCagr.toFixed(1)}%`} note={`${Math.round(exposure.qualityWeight * 100)}% ROE≥15 and D/E≤1`} />
          <Mini label="1Y momentum" value={exposure.momentum == null ? "—" : `${exposure.momentum.toFixed(1)}%`} note="Weighted holding return" />
          <Mini label="Missing financials" value={`${Math.round(exposure.missingWeight * 100)}%`} note="No trailing P/E on the card" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Bars title="Sector" rows={exposure.sectors} />
          <Bars title="Market cap" rows={exposure.caps} />
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Largest holding {exposure.largest ? `${exposure.largest.name} ${(exposure.largest.weight * 100).toFixed(1)}%` : "—"}. Top 5 {(exposure.top5 * 100).toFixed(0)}%. Top 10 {(exposure.top10 * 100).toFixed(0)}%.
          Sector concentration (sum of squared weights) {exposure.sectorHhi == null ? "—" : exposure.sectorHhi.toFixed(2)}.
          Price under 15× {Math.round(exposure.cheapWeight * 100)}% of weight. Above 35× {Math.round(exposure.richWeight * 100)}%.
        </p>
        <p className="mt-1 text-[12px] text-subtle">{exposure.notes[1]} Volatility, beta and drawdown above use aligned daily returns. They are not restated here as factor betas.</p>
      </section>

      {piles.length ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Hidden concentration</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Names that look different on a holdings list but sit in the same business and have moved together (correlation
            ≥ 50% over the last overlapping year). Combined weight of these piles: {(hiddenW * 100).toFixed(0)}% of
            {value ? " this portfolio" : ""}. Sector labels can hide this. Statistical correlation is not identical
            economic exposure.
          </p>
          <ul className="mt-3 grid gap-3">
            {piles.map((p) => {
              const w = p.names.reduce((s, n) => s + n.weight, 0);
              return (
                <li key={p.line} className="rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
                  <div className="text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase">
                    {p.line} · {(w * 100).toFixed(0)}% · min corr {(p.minCorr * 100).toFixed(0)}%
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                    {p.names.map((n) => (
                      <StockLink key={n.symbol} symbol={n.symbol} name={`${n.name} (${(n.weight * 100).toFixed(0)}%)`} className="font-medium" />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Hidden concentration</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            No same-business pile with correlation ≥ 50% on the last year of overlapping prints. That is not a promise
            they will stay uncorrelated.
          </p>
        </section>
      )}

      {corr?.clusters?.length ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Names that move together</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Last 1 year of daily moves on the top {corr.cap || corr.symbols.length} holdings by weight
            {corr.cap && corr.symbols.length >= (corr.cap || 12) ? ` (capped at ${corr.cap})` : ""}. These are
            high-correlation groups, not a hierarchical cluster. Correlation is not the same as economic exposure.{" "}
            {corr.clusters.filter((c) => !c.alone).length || 0} group
            {corr.clusters.filter((c) => !c.alone).length === 1 ? "" : "s"} plus names that go their own way. Not a
            promise they always will.
          </p>
          <ul className="mt-3 grid gap-3">
            {corr.clusters.map((c) => (
              <li key={c.id}>
                <div className="text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase">
                  {c.alone ? "On their own" : "Move together"} · {(c.weight * 100).toFixed(0)}%
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                  {c.symbols.map((s, i) => (
                    <StockLink key={s} symbol={s} name={c.names[i]} className="font-medium" />
                  ))}
                </div>
              </li>
            ))}
          </ul>
          {corr.symbols.length >= 2 ? <CorrMatrix pack={corr} /> : null}
        </section>
      ) : null}

      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Moves that change these scores</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          The two or three material levers live on Improve Portfolio — not a dump of every name.
        </p>
        <Link to="/p/$id/improve" params={{ id: portfolio.id }} className="mt-3 inline-flex text-[13px] text-chart hover:underline">
          Open Improve Portfolio
        </Link>
      </section>
    </div>
  );
}

function corrStep(v: number | null, offDiag: boolean): { bg: string; fg: string; ring: boolean } {
  if (v == null) return { bg: "transparent", fg: "var(--color-subtle)", ring: false };
  const a = Math.abs(v);
  const ring = offDiag && a >= 0.5;
  if (v >= 0) {
    if (a >= 0.85) return { bg: "color-mix(in srgb, var(--color-chart) 88%, transparent)", fg: "var(--color-fg)", ring };
    if (a >= 0.7) return { bg: "color-mix(in srgb, var(--color-chart) 66%, transparent)", fg: "var(--color-fg)", ring };
    if (a >= 0.5) return { bg: "color-mix(in srgb, var(--color-chart) 44%, transparent)", fg: "var(--color-fg)", ring };
    if (a >= 0.3) return { bg: "color-mix(in srgb, var(--color-chart) 24%, transparent)", fg: "var(--color-muted)", ring };
    if (a >= 0.15) return { bg: "color-mix(in srgb, var(--color-chart) 10%, transparent)", fg: "var(--color-muted)", ring };
    return { bg: "transparent", fg: "var(--color-subtle)", ring };
  }
  if (a >= 0.7) return { bg: "color-mix(in srgb, var(--color-down) 78%, transparent)", fg: "var(--color-fg)", ring };
  if (a >= 0.5) return { bg: "color-mix(in srgb, var(--color-down) 56%, transparent)", fg: "var(--color-fg)", ring };
  if (a >= 0.3) return { bg: "color-mix(in srgb, var(--color-down) 32%, transparent)", fg: "var(--color-fg)", ring };
  return { bg: "color-mix(in srgb, var(--color-down) 14%, transparent)", fg: "var(--color-muted)", ring };
}

function CorrMatrix({ pack }: { pack: CorrPack }) {
  const nifty = pack.vsNifty || [];
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 text-[12px] text-muted">
        Stepped colour — not a wash. A ring means they moved together (or opposite) at least 50%. Last column is each
        name versus Nifty 50, same year.
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">
        {[
          [0.15, "15%"],
          [0.3, "30%"],
          [0.5, "50%"],
          [0.7, "70%"],
          [0.85, "85%"],
        ].map(([v, lab]) => {
          const c = corrStep(v as number, false);
          return (
            <span key={lab} className="inline-flex items-center gap-1">
              <span className="inline-block size-3 rounded-sm" style={{ background: c.bg }} />
              {lab}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block size-3 rounded-sm"
            style={{ boxShadow: "inset 0 0 0 1.5px var(--color-fg)" }}
          />
          ≥ 50%
        </span>
      </div>
      <table className="border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="p-1" />
            {pack.symbols.map((s) => (
              <th key={s} className="max-w-10 truncate p-1 text-left font-medium text-subtle" title={s}>
                {s.slice(0, 6)}
              </th>
            ))}
            <th className="p-1 text-left font-medium text-subtle" title="Correlation versus Nifty 50">
              Nifty
            </th>
          </tr>
        </thead>
        <tbody>
          {pack.symbols.map((s, i) => (
            <tr key={s}>
              <th className="sticky left-0 bg-surface p-1 text-left font-medium">
                <StockLink symbol={s} name={pack.names[i]} />
              </th>
              {pack.matrix[i].map((v, j) => {
                const c = corrStep(v, i !== j);
                return (
                  <td
                    key={j}
                    className={cn("min-w-8 p-1 text-center font-mono tabular")}
                    style={{
                      background: c.bg,
                      color: c.fg,
                      boxShadow: c.ring ? "inset 0 0 0 1.5px var(--color-fg)" : undefined,
                    }}
                    title={`${pack.symbols[i]} / ${pack.symbols[j]}: ${v == null ? "—" : v.toFixed(2)}`}
                  >
                    {v == null ? "—" : v.toFixed(2).replace("0.", ".")}
                  </td>
                );
              })}
              {(() => {
                const v = nifty[i] ?? null;
                const c = corrStep(v, v != null);
                return (
                  <td
                    className="min-w-9 p-1 text-center font-mono tabular"
                    style={{
                      background: c.bg,
                      color: c.fg,
                      boxShadow: c.ring ? "inset 0 0 0 1.5px var(--color-fg)" : undefined,
                    }}
                    title={`${s} / Nifty 50: ${v == null ? "—" : v.toFixed(2)}`}
                  >
                    {v == null ? "—" : v.toFixed(2).replace("0.", ".")}
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Mini({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-[18px]">{value}</div>
      <div className="text-[11px] text-subtle">{note}</div>
    </div>
  );
}

function Bars({ title, rows }: { title: string; rows: { label: string; weight: number }[] }) {
  return (
    <div>
      <h3 className="text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase">{title}</h3>
      <ul className="mt-2 grid gap-1.5">
        {rows.slice(0, 8).map((row) => (
          <li key={row.label}>
            <div className="flex justify-between text-[12px]">
              <span>{row.label}</span>
              <span className="font-mono">{(row.weight * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-sm bg-bg">
              <div className="h-full rounded-sm bg-chart" style={{ width: `${Math.min(100, row.weight * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
