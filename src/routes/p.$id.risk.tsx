import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useBookCtx } from "@/components/book-context";
import { MetricCard } from "@/components/metric";
import { StockLink } from "@/components/stock-link";
import { dash, fmtPct } from "@/lib/kosh/engine";
import { sameBusinessPiles } from "@/lib/kosh/peers";
import { cn } from "@/lib/utils";
import type { CorrPack } from "@/lib/kosh/types";

export const Route = createFileRoute("/p/$id/risk")({ component: Risk });

function Risk() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const { risk, cagr, corr, rows, value } = book;
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

      {piles.length ? (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Hidden concentration</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Names that look different on a holdings list but sit in the same business and have moved together (correlation
            ≥ 50% over the last overlapping year). Combined weight of these piles: {(hiddenW * 100).toFixed(0)}% of
            {value ? " this portfolio" : ""}. Sector labels can hide this.
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
            Last 1 year of daily moves. {corr.clusters.filter((c) => !c.alone).length || 0} group
            {corr.clusters.filter((c) => !c.alone).length === 1 ? "" : "s"} plus names that go their own way. Not a promise they always will.
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
