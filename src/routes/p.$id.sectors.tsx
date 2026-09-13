import { createFileRoute } from "@tanstack/react-router";
import { useBookCtx } from "@/components/book-context";
import { Pct } from "@/components/pct";
import { ShareRing, MiniBars } from "@/components/charts/share-ring";
import { StockLink } from "@/components/stock-link";
import { useSleeveBook } from "@/lib/kosh/use-book";

export const Route = createFileRoute("/p/$id/sectors")({ component: Sectors });

function Sectors() {
  const { query } = useBookCtx();
  const core = query.data!;
  const { book, pending } = useSleeveBook(core, true);
  const data = book || core;
  const { sleeves, value } = data;
  const ring = sleeves.map((s) => ({
    name: s.sector,
    pct: value ? (s.value / value) * 100 : 0,
  }));
  const gaps = [...sleeves]
    .map((s) => {
      const gap = s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null;
      return { s, gap };
    })
    .filter((x) => x.gap != null)
    .sort((a, b) => Math.abs(b.gap!) - Math.abs(a.gap!));

  return (
    <div className="kosh-page grid gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Each sleeve is the stocks you hold in that sector, versus the matching Nifty series (or the ETF that actually has a history).
        {pending ? " Loading index history…" : ""}
      </p>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Weight by sector</h2>
          <ShareRing items={ring} />
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">1-year vs sector index</h2>
          {gaps.length ? (
            <MiniBars
              items={gaps.slice(0, 8).map(({ s, gap }) => ({
                name: s.sector,
                value: gap || 0,
                label: (gap! >= 0 ? "+" : "") + gap!.toFixed(1) + "pp",
                tone: (gap || 0) >= 0 ? "up" : "down",
              }))}
            />
          ) : (
            <p className="text-sm text-muted">Need a year of overlap versus the sector index.</p>
          )}
        </div>
      </section>
      <div className="hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Sector</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Weight</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">1M you</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">1M index</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">1Y you</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">1Y index</th>
              <th className="px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">1Y gap</th>
              <th className="px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase">Index</th>
            </tr>
          </thead>
          <tbody>
            {sleeves.map((s) => {
              const w = value ? (s.value / value) * 100 : 0;
              const gap = s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null;
              return (
                <tr key={s.sector} className="border-b border-border/60">
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{s.sector}</div>
                    <div className="text-[11px] text-subtle">
                      {s.names} {s.names === 1 ? "stock" : "stocks"}
                      {" · "}
                      {s.symbols.map((sym, i) => (
                        <span key={sym}>
                          {i ? ", " : ""}
                          <StockLink symbol={sym} />
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular">{w.toFixed(0)}%</td>
                  <td className="px-3 py-2.5 text-right">
                    <Pct n={s.windows.m1} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Pct n={s.index.m1} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Pct n={s.windows.y1} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Pct n={s.index.y1} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Pct n={gap} digits={1} />
                  </td>
                  <td className="px-3 py-2.5 text-muted">{s.indexName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 md:hidden">
        {sleeves.map((s) => {
          const w = value ? (s.value / value) * 100 : 0;
          const gap = s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null;
          return (
            <article key={s.sector} className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium">{s.sector}</div>
                  <div className="truncate text-[11px] text-subtle">
                    {s.names} {s.names === 1 ? "stock" : "stocks"} · {s.indexName}
                  </div>
                </div>
                <div className="font-mono text-[13px] tabular">{w.toFixed(0)}%</div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <div className="text-[11px] text-subtle">1Y you</div>
                  <Pct n={s.windows.y1} />
                </div>
                <div>
                  <div className="text-[11px] text-subtle">1Y index</div>
                  <Pct n={s.index.y1} />
                </div>
                <div>
                  <div className="text-[11px] text-subtle">1M you</div>
                  <Pct n={s.windows.m1} />
                </div>
                <div>
                  <div className="text-[11px] text-subtle">1Y gap</div>
                  <Pct n={gap} digits={1} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
