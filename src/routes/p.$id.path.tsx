import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBookCtx } from "@/components/book-context";
import { PathDesk } from "@/components/path-desk";
import { PathTimeline } from "@/components/path-timeline";
import { PathUpload } from "@/components/path-upload";
import { fmtInr } from "@/lib/kosh/engine";
import { apiResearch } from "@/lib/kosh/api";
import { listedSymbolFromResearch, pathIdentityAsk, pathPriceAsk, usablePathPrice } from "@/lib/kosh/complete";
import { AIButton } from "@/components/ui/ai-button";
import { useKosh } from "@/lib/store";
import type { PathPriceFact } from "@/lib/kosh/types";

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
  const qc = useQueryClient();
  const tradeError = useKosh((s) => s.tradeError);
  const tradesReady = useKosh((s) => s.tradesReady);
  const tradeCount = useKosh((s) => s.tradeCounts[portfolio.id] || 0);
  const confirmSymbol = useKosh((s) => s.confirmSymbol);
  const rememberPathFacts = useKosh((s) => s.rememberPathFacts);
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState("");

  return (
    <div className="kosh-page grid gap-8">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          What happened after you sold. Each sale is measured from your sell price to the first session one month, three
          months, six months, and one year later.{" "}
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
                  const asks: { symbol: string; date: string }[] = [];
                  const seen = new Set((portfolio.pathFacts || []).map((f) => `${f.symbol}|${f.date}`));
                  for (const c of path?.closed || []) {
                    for (const cell of [c.after1m, c.after3m, c.after6m, c.after1y]) {
                      if (cell?.code !== "NO_HISTORICAL_DATA" || !cell.targetDate) continue;
                      const key = `${c.symbol}|${cell.targetDate}`;
                      if (seen.has(key)) continue;
                      seen.add(key);
                      asks.push({ symbol: c.symbol, date: cell.targetDate });
                      if (asks.length >= 6) break;
                    }
                    if (asks.length >= 6) break;
                  }
                  const saved: PathPriceFact[] = [];
                  for (const ask of asks) {
                    try {
                      const res = await apiResearch(ask.symbol, [pathPriceAsk(ask.symbol, ask.date)]);
                      const item = res.items?.[0];
                      const shaped = item ? { ...item, inputs: item.inputs || [] } : null;
                      const px = usablePathPrice(shaped, ask.date);
                      if (px == null || !shaped?.sourceUrl || !shaped.sourceName) {
                        notes.push(`${ask.symbol} ${ask.date}: no sourced close. Left unavailable.`);
                        continue;
                      }
                      saved.push({
                        symbol: ask.symbol,
                        date: ask.date,
                        price: px,
                        sourceName: shaped.sourceName,
                        sourceUrl: shaped.sourceUrl,
                        retrievedAt: new Date().toISOString().slice(0, 10),
                        evidence: shaped.evidence,
                      });
                      notes.push(`${ask.symbol} ${ask.date}: AI-researched · source-backed (${shaped.sourceName}).`);
                    } catch (err) {
                      notes.push(`${ask.symbol} ${ask.date}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
                    }
                  }
                  if (saved.length) rememberPathFacts(portfolio.id, saved);
                  setCheckNote(
                    notes.length
                      ? notes.join(" ")
                      : "Price history checked again. Nothing needed a model. Prices were not guessed.",
                  );
                  setChecking(false);
                })();
              }}
            >
              · Complete Path data
            </AIButton>
            <p className="max-w-xl text-[12px] leading-relaxed text-muted">
              Market history is used first. AI is only asked for an unresolved listed symbol, or for a close when that
              name has no price series. A price is kept only with a source. Nothing is estimated.
            </p>
            {checkNote ? <p className="text-[12px] text-muted">{checkNote}</p> : null}
          </div>
        ) : null}
        {!trades.length ? (
          <p className="text-[13px] text-muted">Upload a dated buy/sell file. The table below shows what the stock did after each sale.</p>
        ) : null}
      </section>

      <PathUpload portfolioId={portfolio.id} />

      {path?.nav?.length ? (
        <PathTimeline
          nav={path.nav}
          trades={trades}
          events={path.events || []}
          benchName={book.benchName}
          splitNote={path.splitNote}
        />
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
            One row per sale: your sell date, sell price, and how the stock did one month, three months, six months,
            and one year later. Open Details if you need the observed date, price, and source.
          </p>
        </section>
      )}
    </div>
  );
}