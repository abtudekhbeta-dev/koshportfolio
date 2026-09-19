import { createFileRoute } from "@tanstack/react-router";
import { useBookCtx } from "@/components/book-context";
import { NavChart } from "@/components/charts/nav-chart";
import { MonthHeatmap } from "@/components/charts/heatmap";
import { WindowsGrid } from "@/components/windows-grid";
import { useKosh } from "@/lib/store";

export const Route = createFileRoute("/p/$id/performance")({ component: Performance });

function Performance() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
  return (
    <div className="kosh-page grid gap-8">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
          This mix vs {book.benchName}
        </h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          Blue is this portfolio as it is today, taken back through each stock’s adjusted daily prices. It is not your
          XIRR. Stocks that listed later join in when they appear — they do not erase earlier years. Growth, rupees,
          rolling returns, monthly bars, drawdown, or the gap versus the index. Buys and sells live on Path.
        </p>
        <NavChart
          nav={book.mix.nav}
          portLabel="This mix"
          benchLabel={book.benchName}
          coverage={`${book.coverage}${book.mix.missing.length ? " · skipped " + book.mix.missing.join(", ") : ""}`}
          nowValue={book.value}
          metals={
            book.commodityValue > 0
              ? {
                  present: true,
                  included: book.includeCommodities,
                  onChange: (on) => setIncludeCommodities(portfolio.id, on),
                }
              : undefined
          }
        />
      </section>
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Windows versus the index</h2>
        <p className="mb-3 text-[13px] text-muted">
          Each card is the same mix over a different length of time. Hover the name, or tap the ? for a plain-English read.
        </p>
        <WindowsGrid windows={book.windows} portLabel="This mix" benchLabel={book.benchName} />
      </section>
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Month by month</h2>
        <p className="mb-3 text-[13px] text-muted">Green months beat zero. Compare the tone across years, not one cell.</p>
        <MonthHeatmap months={book.months} />
      </section>
    </div>
  );
}
