import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { NavChart } from "@/components/charts/nav-chart";
import { PathDesk } from "@/components/path-desk";
import { PathUpload } from "@/components/path-upload";
import { fmtInr } from "@/lib/kosh/engine";
import { pathToChartNav } from "@/lib/kosh/path";
import { apiResearch } from "@/lib/kosh/api";
import { listedSymbolFromResearch, pathIdentityAsk, usablePathPrice } from "@/lib/kosh/complete";
import { AIButton } from "@/components/ui/ai-button";
import { useKosh } from "@/lib/store";

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
  const tradeError = useKosh((s) => s.tradeError);
  const tradesReady = useKosh((s) => s.tradesReady);
  const tradeCount = useKosh((s) => s.tradeCounts[portfolio.id] || 0);
  const confirmSymbol = useKosh((s) => s.confirmSymbol);
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState("");

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
        {tradeError ? <p className="mb-3 text-[13px] text-down">{tradeError}</p> : null}
        {!tradesReady && tradeCount > trades.length ? (
          <p className="mb-3 text-[13px] text-muted">Loading the saved trade book… {tradeCount.toLocaleString("en-IN")} lines.</p>
        ) : null}
        {trades.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <AIButton
              busy={checking}
              busyLabel="Checking Path…"
              onClick={() => {
                setChecking(true);
                setCheckNote("");
                const missing = (book.missing || []).filter(Boolean);
                void (async () => {
                  await qc.invalidateQueries({ queryKey: ["book"] });
                  const notes: string[] = [];
                  for (const symbol of missing) {
                    try {
                      const res = await apiResearch(symbol, [pathIdentityAsk(symbol)]);
                      const item = res.items?.[0];
                      const shaped = item ? { ...item, inputs: item.inputs || [] } : null;
                      if (usablePathPrice(shaped) != null) {
                        notes.push(`${symbol}: a price in the reply was ignored.`);
                        continue;
                      }
                      const listed = listedSymbolFromResearch(symbol, shaped);
                      const asked = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
                      if (listed && listed !== asked) {
                        confirmSymbol(symbol, listed);
                        notes.push(
                          `${symbol}: listed symbol ${listed} saved from ${item?.sourceName || "a source"}. AI-researched · source-backed. No price was stored.`,
                        );
                        continue;
                      }
                      if (item?.status === "researched") {
                        notes.push(`${symbol}: ${item.sourceName}. ${item.evidence} Confirm the listed name in the prompt. No price was stored from the model.`);
                      } else {
                        notes.push(`${symbol}: still unresolved. ${item?.evidence || "No listed symbol with a source."}`);
                      }
                    } catch (err) {
                      notes.push(`${symbol}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
                    }
                  }
                  setCheckNote(
                    missing.length
                      ? notes.join(" ")
                      : "Price history checked again. No unresolved security needed a model. Prices were not guessed.",
                  );
                  setChecking(false);
                })();
              }}
            >
              · Complete Path data
            </AIButton>
            <p className="max-w-xl text-[12px] leading-relaxed text-muted">
              Refetches market history and calculates the windows. AI is asked only for an unresolved listed symbol, never for a price or a return.
            </p>
            {checkNote ? <p className="text-[12px] text-muted">{checkNote}</p> : null}
          </div>
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