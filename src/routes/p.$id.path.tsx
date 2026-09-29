import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { NavChart } from "@/components/charts/nav-chart";
import { PathDesk } from "@/components/path-desk";
import { PathUpload } from "@/components/path-upload";
import { observeWindow, observeYtd, observeCagr, fmtInr, fmtPct } from "@/lib/kosh/engine";
import { pathToChartNav } from "@/lib/kosh/path";
import type { NavPoint } from "@/lib/kosh/types";

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
  const qc = useQueryClient();
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState("");
  const windows = hasPath && path ? pathWindows(path.nav) : [];

  return (
    <div className="kosh-page grid gap-8">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          What you actually owned after each buy and sell, marked at that day’s price. Growth is how those names did —
          extra money you added later is taken out. {book.benchName} is the same stretch, same method. This mix is
          leftover names today; if the file is complete, today’s path and today’s mix are the same rupees.{" "}
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
            {filled.some((f) => f.hadTime) ? " (no time-of-day print — the close was used)" : ""}. Execution price
            unavailable; historical closing price used. Add prices in the file if you want the exact cash you paid.
          </p>
        ) : null}
        {trades.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={checking}
              className="h-8 rounded-sm bg-surface px-2.5 text-[13px] font-medium shadow-[var(--shadow-border)] disabled:opacity-50"
              onClick={() => {
                setChecking(true);
                setCheckNote("");
                void qc.invalidateQueries({ queryKey: ["book"] }).finally(() => {
                  setChecking(false);
                  const missing = path?.missing || [];
                  setCheckNote(
                    missing.length
                      ? `Price history checked again. Still missing a print for ${missing.join(", ")}. Prices were not guessed.`
                      : "Price history checked again. No prices were guessed.",
                  );
                });
              }}
            >
              {checking ? "Checking price history…" : "Complete missing Path data"}
            </button>
            <p className="text-[12px] text-muted">Refetches market history. A model is not asked for prices or returns.</p>
            {checkNote ? <p className="text-[12px] text-muted">{checkNote}</p> : null}
          </div>
        ) : null}
        {windows.length ? (
          <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {windows.map((w) => (
              <li key={w.label} className="rounded-sm bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
                <div className="text-[11px] tracking-[0.06em] text-subtle uppercase">{w.label}</div>
                <div className="font-mono text-[14px] tabular">{w.obs.pct == null ? "Unavailable" : fmtPct(w.obs.pct)}</div>
                <div className="text-[11px] text-muted">
                  {w.obs.status === "available"
                    ? `Target ${w.obs.target} · observed ${w.obs.observed}`
                    : w.obs.reason}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {hasPath ? (
          <NavChart
            nav={chartNav}
            portLabel="Your path"
            benchLabel={`${book.benchName} same stretch`}
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
            How the holdings did versus {book.benchName}, the journey (drops and mix over time), which names created or
            destroyed value — including what the stock did after you sold — and month-by-month history. All from the
            buys and sells you actually did.
          </p>
        </section>
      )}

      <PathUpload portfolioId={portfolio.id} />
    </div>
  );
}

function pathWindows(nav: { t: number; day: string; wealth: number }[]) {
  const asNav: NavPoint[] = nav.map((p) => ({
    t: p.t,
    day: p.day,
    port: p.wealth,
    bench: null,
    covered: 1,
    names: 1,
    wAvail: 1,
  }));
  return [
    ...[
      ["1W", 7],
      ["1M", 31],
      ["3M", 93],
      ["6M", 186],
      ["1Y", 365],
    ].map(([label, days]) => ({ label: String(label), obs: observeWindow(asNav, Number(days), String(label)) })),
    { label: "YTD", obs: observeYtd(asNav) },
    { label: "CAGR", obs: observeCagr(asNav) },
  ];
}