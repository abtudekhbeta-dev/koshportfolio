import { createFileRoute, Link } from "@tanstack/react-router";
import { useBookCtx } from "@/components/book-context";
import { NavChart } from "@/components/charts/nav-chart";
import { PathStack } from "@/components/charts/path-stack";
import { MonthHeatmap } from "@/components/charts/heatmap";
import { WindowsGrid } from "@/components/windows-grid";
import { PathDesk } from "@/components/path-desk";
import { PathUpload } from "@/components/path-upload";
import { pathToChartNav } from "@/lib/kosh/path";
import { fmtInr } from "@/lib/kosh/engine";

export const Route = createFileRoute("/p/$id/path")({ component: PathPage });

function PathPage() {
  const { query, portfolio } = useBookCtx();
  const book = query.data!;
  const trades = portfolio.trades || [];
  const path = book.path;
  const hasPath = Boolean(path?.nav?.length);
  const filled = path?.filledPrices || [];
  const mixValue = book.value;
  const pathNow = path?.wealthNow || 0;
  const close =
    mixValue > 0 && pathNow > 0 ? Math.abs(pathNow - mixValue) / Math.max(mixValue, pathNow) < 0.015 : false;
  const chartNav = hasPath && path ? pathToChartNav(path) : [];

  return (
    <div className="kosh-page grid gap-8">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          The rupees you actually held after each buy and sell, marked at that day’s price. Growth is how those names
          did — extra money you added later is taken out. Same money in {book.benchName} puts those same rupees into
          the index on the same days. This mix is leftover names today; if the file is complete, today’s path and
          today’s mix are the same rupees.{" "}
          <Link to="/p/$id" params={{ id: portfolio.id }} className="text-chart hover:underline">
            Back to Overview
          </Link>
        </p>
        {hasPath ? (
          <p className="mb-3 text-[13px]">
            Today · your path <span className="font-mono tabular">{fmtInr(pathNow)}</span>
            {" · "}this mix <span className="font-mono tabular">{fmtInr(mixValue)}</span>
            {close ? (
              <span className="ml-2 text-up"> They match.</span>
            ) : (
              <span className="ml-2 text-muted"> If the file is missing a buy or sell, these will differ.</span>
            )}
          </p>
        ) : null}
        {filled.length ? (
          <p className="mb-3 rounded-sm bg-surface px-3 py-2 text-[13px] text-muted shadow-[var(--shadow-border)]">
            {filled.length} buy/sell price{filled.length === 1 ? "" : "s"} taken from that day’s close
            {filled.some((f) => f.hadTime) ? " (no time-of-day print — the close was used)" : ""}. Add prices in the
            file if you want the exact cash you paid.
          </p>
        ) : null}
        {hasPath ? (
          <NavChart
            nav={chartNav}
            portLabel="Your path"
            benchLabel={`Same money in ${book.benchName}`}
            coverage={path?.coverage}
            nowValue={pathNow}
            pathPrimary
            modes={["inr", "cum", "dd", "roll1y", "roll3m", "m", "w", "gap"]}
          />
        ) : (
          <div className="rounded-lg bg-surface p-4 text-[13px] text-muted shadow-[var(--shadow-border)]">
            Upload a dated buy/sell file below. Each line is plotted as the rupees you held that day.
          </div>
        )}
      </section>

      {hasPath && path?.windows && Object.keys(path.windows).length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Windows</h2>
          <p className="mb-3 text-[13px] text-muted">
            How the names you actually held did over each stretch, versus the same rupees in {book.benchName}. Extra
            money you added later is taken out of these percentages.
          </p>
          <WindowsGrid windows={path.windows} portLabel="Your path" benchLabel={book.benchName} />
        </section>
      ) : null}

      {hasPath && path?.snapshots?.length ? <PathStack slices={path.snapshots} /> : null}

      {hasPath && path?.months?.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Month by month</h2>
          <p className="mb-3 text-[13px] text-muted">
            How the names you held that month did. Green is up. This is not this mix taken back.
          </p>
          <MonthHeatmap months={path.months} />
        </section>
      ) : null}

      {trades.length && path ? (
        <PathDesk
          path={path}
          benchName={book.benchName}
          portfolioId={portfolio.id}
          mixRows={book.rows.map((r) => ({ symbol: r.symbol, name: r.name, qty: r.qty }))}
          mixValue={mixValue}
        />
      ) : (
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">What will show here</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Your XIRR, how the holdings did between cash-ins, same money in {book.benchName}, what you held in each
            year, closed trades, and a year-by-year table — all from the buys and sells you actually did.
          </p>
        </section>
      )}

      <PathUpload portfolioId={portfolio.id} />
    </div>
  );
}