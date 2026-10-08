import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntelligenceShell } from "@/components/intelligence-shell";
import { apiTape } from "@/lib/kosh/api";
import { fmtPct, fmtTapePx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export function IntelLanding() {
  const tape = useQuery({ queryKey: ["tape"], queryFn: apiTape, staleTime: 60_000 });
  const book = useKosh((s) => s.portfolios[0]);
  const rows = tape.data || [];
  const tapeOn = isIstSession() && rows.some((t) => t.price > 0);
  const tapeLabel = quoteStatusLabel(quoteStatus({ session: isIstSession(), price: tapeOn ? 1 : rows[0]?.price }), null);

  return (
    <IntelligenceShell>
      <div className="mx-auto max-w-5xl">
        <p className="text-[12px] text-subtle">Indian investment intelligence</p>
        <h1 className="mt-1 max-w-[22ch] text-[28px] font-semibold leading-tight tracking-tight">For the book you already hold.</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          Markets, a stock read, a screener, and the evidence in a portfolio. Same engines as Classic. {tapeLabel}.
        </p>

        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[13px] font-semibold">Today’s market</h2>
            <span data-tape-status className="text-[11px] text-subtle">
              {tapeLabel}
            </span>
          </div>
          {rows.length ? (
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {rows.slice(0, 8).map((t) => (
                <li key={t.id} className="flex items-baseline justify-between gap-3 py-2 text-[13px]">
                  <span className="truncate">{t.label}</span>
                  <span className="shrink-0 font-mono tabular">
                    {t.price ? fmtTapePx(t.price, t.unit) : "—"}
                    <span className={cn("ml-3", (t.changePct || 0) >= 0 ? "text-up" : "text-down")}>
                      {t.changePct ? fmtPct(t.changePct) : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-muted">{tape.isError ? "Market tape unavailable." : "Waiting on the market tape."}</p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-[13px] font-semibold">Explore</h2>
          <div className="mt-2 grid border-y border-border sm:grid-cols-2">
            <Link to="/markets" search={{ view: "terminal" }} className="border-b border-border px-1 py-3 hover:text-chart sm:border-r">
              <div className="text-[14px] font-medium">Market terminal</div>
              <p className="mt-0.5 text-[12px] text-muted">Charts and the watch you keep.</p>
            </Link>
            <Link to="/s/$symbol" params={{ symbol: "RELIANCE" }} className="border-b border-border px-1 py-3 hover:text-chart sm:px-4">
              <div className="text-[14px] font-medium">Stock intelligence</div>
              <p className="mt-0.5 text-[12px] text-muted">Open a name. Reliance is the sample.</p>
            </Link>
            {book ? (
              <Link to="/p/$id" params={{ id: book.id }} className="border-b border-border px-1 py-3 hover:text-chart sm:border-r sm:border-b-0">
                <div className="text-[14px] font-medium">Portfolio</div>
                <p className="mt-0.5 text-[12px] text-muted">{book.name}</p>
              </Link>
            ) : (
              <Link to="/app" className="border-b border-border px-1 py-3 hover:text-chart sm:border-r sm:border-b-0">
                <div className="text-[14px] font-medium">Portfolio</div>
                <p className="mt-0.5 text-[12px] text-muted">Start a book or open the sample.</p>
              </Link>
            )}
            <Link to="/screen" className="px-1 py-3 hover:text-chart sm:px-4">
              <div className="text-[14px] font-medium">Screener</div>
              <p className="mt-0.5 text-[12px] text-muted">Quality, valuation, and growth on the numbers on file.</p>
            </Link>
          </div>
        </section>
      </div>
    </IntelligenceShell>
  );
}
