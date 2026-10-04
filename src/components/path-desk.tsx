import { Link } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { PathStack } from "@/components/charts/path-stack";
import { MonthHeatmap } from "@/components/charts/heatmap";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { mixVsPathGaps } from "@/lib/kosh/path";
import type { AfterSale, ClosedTrade, PathEvent, PathName, PathPack, PathSlice } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

function dayLabel(d: string) {
  const [y, m, day] = (d || "").split("-");
  if (!y || !m || !day) return d || "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mo = months[Number(m) - 1];
  return mo ? `${Number(day)} ${mo} ${y}` : d;
}

function monthLabel(key: string) {
  const [y, m] = (key || "").split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mo = months[Number(m) - 1];
  return mo ? `${mo} ${y}` : key;
}

function tone(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "text-muted";
  if (n > 0) return "text-up";
  if (n < 0) return "text-down";
  return "text-muted";
}

export function PathDesk({
  path,
  benchName,
  portfolioId,
  mixRows,
  mixValue,
}: {
  path: PathPack;
  benchName: string;
  portfolioId: string;
  mixRows?: { symbol: string; name: string; qty: number }[];
  mixValue?: number;
}) {
  if (!path.nTrades) {
    return (
      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Mix above is today’s remaining names, taken back through each stock’s history. Your path needs a buy/sell
          file with dates.{" "}
          <Link to="/p/$id/path" params={{ id: portfolioId }} className="text-chart hover:underline">
            Open Path
          </Link>
        </p>
      </section>
    );
  }
  if (!path.nav.length) {
    return (
      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {path.nUndated
            ? `${path.nUndated} line${path.nUndated === 1 ? "" : "s"} in the trade file have no date. Path needs a date on each buy and sell.`
            : "No daily prices for the names in the trade file yet."}
        </p>
      </section>
    );
  }

  const nifty = path.benchTwr;
  const vsNifty = path.twr != null && nifty != null ? path.twr - nifty : null;
  const gaps = mixRows?.length ? mixVsPathGaps(mixRows, path.stillHeld) : [];

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Performance</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          How the names you actually held did, marked at each session’s close — not the clock time on the trade. The
          holdings figure is a daily-close time-weighted path. XIRR, when shown, is money-weighted. {benchName} uses
          the same cash-flow dates where a same-money ledger exists.
          {path.nUndated ? ` ${path.nUndated} line${path.nUndated === 1 ? "" : "s"} had no date and were skipped.` : ""}
          {mixValue != null && mixValue > 0 ? ` This mix today is ${fmtInr(mixValue)}.` : ""}
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat
            label="How the holdings did"
            value={path.twr == null ? "—" : fmtPct(path.twr)}
            hint="Time-weighted. Extra cash you put in later is taken out."
            className={tone(path.twr)}
          />
          <Stat
            label="Per year"
            value={path.twrCagr == null ? "—" : fmtPct(path.twrCagr)}
            hint="Same figure, expressed as a yearly rate"
            className={tone(path.twrCagr)}
          />
          <Stat
            label={`${benchName} same days`}
            value={nifty == null ? "—" : fmtPct(nifty)}
            hint="Index over the same first-to-last stretch"
            className={tone(nifty)}
          />
          <Stat
            label="Difference"
            value={vsNifty == null ? "—" : fmtPct(vsNifty)}
            hint="Holdings minus the index, same method"
            className={tone(vsNifty)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Journey</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          How bumpy the actual holdings were — not this mix taken back.
          {path.splitNote
            ? " A corporate action may affect historical share quantities. Verify the trade file if a reconstructed holding looks wrong."
            : ""}
        </p>
        {path.risk && (path.risk.maxDd != null || path.risk.vol != null) ? (
          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat
              label="Max drop"
              value={path.risk.maxDd == null ? "—" : fmtPct(path.risk.maxDd)}
              hint="Largest fall from a previous peak of the holdings you actually had"
              className={tone(path.risk.maxDd)}
            />
            <Stat
              label="Swing"
              value={path.risk.vol == null ? "—" : fmtPct(path.risk.vol)}
              hint="How bumpy the path was, yearly"
            />
            <Stat
              label="Sharpe"
              value={path.risk.sharpe == null ? "—" : path.risk.sharpe.toFixed(2)}
              hint="Return earned relative to the bump taken. Rf 6.5%."
              className={tone(path.risk.sharpe)}
            />
            <Stat
              label="If I had held"
              value={path.neverSoldLast == null ? "—" : fmtInr(path.neverSoldLast)}
              hint={
                path.wealthNow
                  ? `Hypothetical. Path today ${fmtInr(path.wealthNow)}`
                  : "Hypothetical — purchased shares kept invested after each recorded sale"
              }
            />
          </div>
        ) : path.neverSoldLast != null ? (
          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat
              label="If I had held"
              value={fmtInr(path.neverSoldLast)}
              hint="Hypothetical. Purchased shares stay invested after the recorded sale."
            />
          </div>
        ) : null}
        {path.snapshots?.length ? <PathStack slices={path.snapshots} /> : null}
      </section>

      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Decisions</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          Which names created or destroyed value. Expand a row to see the underlying buys and sells. Post-sale movement
          is what the stock did after you sold — not a verdict.
        </p>
        {path.byName?.length ? <ByName rows={path.byName} events={path.events} closed={path.closed} /> : null}
        {path.closed.length ? <ClosedTable rows={path.closed} /> : null}
        {path.neverSoldLast != null ? (
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            If I had held ({fmtInr(path.neverSoldLast)}) keeps purchased shares invested after the recorded sale. It is a
            hypothetical, to help weigh sell decisions — not a forecast, and not after tax.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">History</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          Month by month versus {benchName}, then each year, then what you actually held at year-end.
        </p>
        {path.months?.length ? (
          <>
            <MonthTable months={path.months} benchName={benchName} />
            <div className="mt-4">
              <MonthHeatmap months={path.months} />
            </div>
          </>
        ) : null}
        {path.years.length ? <YearTable years={path.years} benchName={benchName} /> : null}
        {path.snapshots?.length ? <HeldThen slices={path.snapshots} /> : null}
        <Timeline events={path.events} />
        {gaps.length ? <GapTable gaps={gaps} /> : null}
        {path.missing.length ? (
          <p className="text-[12px] text-subtle">No price history for {path.missing.join(", ")} — those names sit out of the line.</p>
        ) : (
          <p className="text-[12px] text-subtle">{path.coverage}</p>
        )}
      </section>
    </div>
  );
}

function MonthTable({ months, benchName }: { months: PathPack["months"]; benchName: string }) {
  const rows = [...months].slice(-36).reverse();
  return (
    <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
      <table className="kosh-table w-full text-left text-[13px]">
        <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
          <tr>
            <th className="px-3 py-2 font-medium">Month</th>
            <th className="px-3 py-2 font-medium text-right">Path</th>
            <th className="px-3 py-2 font-medium text-right">{benchName}</th>
            <th className="px-3 py-2 font-medium text-right">Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const diff = m.bench != null ? m.port - m.bench : null;
            return (
              <tr key={m.key}>
                <td className="px-3 py-2">{monthLabel(m.key)}</td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(m.port))}>{fmtPct(m.port)}</td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(m.bench))}>
                  {m.bench == null ? "—" : fmtPct(m.bench)}
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(diff))}>
                  {diff == null ? "—" : fmtPct(diff)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function YearTable({ years, benchName }: { years: PathPack["years"]; benchName: string }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">By year</h3>
      <p className="mb-3 text-[12px] text-muted">
        Return is chained from the daily path, not an assumption that cash arrived mid-year. Put-in and took-out are
        the buys and sells that year — not the return.
      </p>
      <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-left text-[13px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Year</th>
              <th className="px-3 py-2 font-medium text-right">Path</th>
              <th className="px-3 py-2 font-medium text-right">{benchName}</th>
              <th className="px-3 py-2 font-medium text-right">Diff</th>
              <th className="px-3 py-2 font-medium text-right">Start</th>
              <th className="px-3 py-2 font-medium text-right">End</th>
              <th className="px-3 py-2 font-medium text-right">Put in</th>
              <th className="px-3 py-2 font-medium text-right">Took out</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const diff = y.ret != null && y.bench != null ? y.ret - y.bench : null;
              return (
                <tr key={y.year}>
                  <td className="px-3 py-2">{y.year}</td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(y.ret))}>
                    {y.ret == null ? "—" : fmtPct(y.ret)}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(y.bench))}>
                    {y.bench == null ? "—" : fmtPct(y.bench)}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(diff))}>
                    {diff == null ? "—" : fmtPct(diff)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(y.start)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(y.end)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">{y.buyIn ? fmtInr(y.buyIn) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">{y.sellOut ? fmtInr(y.sellOut) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function saleLabel(status: AfterSale["status"]) {
  if (status === "calculated") return "Calculated";
  if (status === "insufficient") return "Insufficient history";
  if (status === "ai") return "AI-researched · source-backed";
  if (status === "na") return "Not applicable";
  return "Unavailable";
}

function AfterCell({ cell, pct, note }: { cell?: AfterSale | null; pct?: number | null; note?: string | null }) {
  if (cell?.status === "calculated" && cell.pct != null && Number.isFinite(cell.pct)) {
    return (
      <>
        {fmtPct(cell.pct)}
        <div className="text-[11px] font-sans text-subtle">
          {cell.observedDate ? dayLabel(cell.observedDate) : ""}
          {cell.observedPx != null ? ` · ₹${cell.observedPx.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : ""}
        </div>
        <div className="text-[10px] font-sans text-subtle">
          Target {cell.targetDate ? dayLabel(cell.targetDate) : "—"}
          {cell.basis === "adjusted" ? " · adjusted" : ""}
        </div>
      </>
    );
  }
  if (cell) {
    return (
      <span className="text-[11px] font-sans text-subtle" title={cell.reason}>
        {saleLabel(cell.status)}
      </span>
    );
  }
  if (pct != null && Number.isFinite(pct)) return <>{fmtPct(pct)}</>;
  return <span className="text-[11px] font-sans text-subtle">{note || "Unavailable"}</span>;
}

function ClosedTable({ rows }: { rows: ClosedTrade[] }) {
  const shown = rows.length > 500 ? rows.slice(-500) : rows;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">After selling</h3>
      <p className="mb-3 text-[12px] text-muted">
        Each row is one sale. 1M, 3M, 6M and 1Y are the stock’s move from your sell price to the first session on or
        after that later date — not today’s price, and not a card above this table.
        {rows.length > shown.length ? ` Showing the latest ${shown.length} of ${rows.length} calculated sales.` : ""}
      </p>
      <div className="max-h-[32rem] overflow-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-surface text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium text-right">Qty</th>
              <th className="px-3 py-2 font-medium">Sell date</th>
              <th className="px-3 py-2 font-medium text-right">Sell price</th>
              <th className="px-3 py-2 font-medium text-right">P&L</th>
              <th className="px-3 py-2 font-medium text-right">After sell · 1M</th>
              <th className="px-3 py-2 font-medium text-right">After sell · 3M</th>
              <th className="px-3 py-2 font-medium text-right">After sell · 6M</th>
              <th className="px-3 py-2 font-medium text-right">After sell · 1Y</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c, i) => (
              <tr key={c.symbol + c.buyDate + c.sellDate + i}>
                <td className="px-3 py-2">
                  <div className="text-fg">{c.name}</div>
                  <div className="font-mono text-[11px] text-subtle">{c.symbol}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular">{c.qty}</td>
                <td className="px-3 py-2 text-muted">{dayLabel(c.sellDate)}</td>
                <td className="px-3 py-2 text-right font-mono tabular">₹{c.sellPx.toLocaleString("en-IN")}</td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.pnl))}>
                  {fmtInr(c.pnl)}
                  <div className="text-[11px]">{fmtPct(c.pnlPct)}</div>
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.after1m?.pct ?? c.post1m))}>
                  <AfterCell cell={c.after1m} pct={c.post1m} note={c.post1mNote} />
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.after3m?.pct ?? c.post3m))}>
                  <AfterCell cell={c.after3m} pct={c.post3m} note={c.post3mNote} />
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.after6m?.pct ?? c.post6m))}>
                  <AfterCell cell={c.after6m} pct={c.post6m} note={c.post6mNote} />
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.after1y?.pct ?? c.post1y))}>
                  <AfterCell cell={c.after1y} pct={c.post1y} note={c.post1yNote} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GapTable({
  gaps,
}: {
  gaps: { symbol: string; name: string; mixQty: number; pathQty: number; note: string }[];
}) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">This mix vs your path</h3>
      <p className="mb-3 text-[12px] text-muted">
        Mix is the holdings list. Path is what the trade file still holds after sells. A gap usually means a line was
        edited by hand, or the file is incomplete.
      </p>
      <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-left text-[13px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium text-right">This mix</th>
              <th className="px-3 py-2 font-medium text-right">Path</th>
              <th className="px-3 py-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((g) => (
              <tr key={g.symbol}>
                <td className="px-3 py-2">
                  {g.name}
                  <div className="font-mono text-[11px] text-subtle">{g.symbol}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular">{g.mixQty || "—"}</td>
                <td className="px-3 py-2 text-right font-mono tabular">{g.pathQty || "—"}</td>
                <td className="px-3 py-2 text-muted">{g.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeldThen({ slices }: { slices: PathSlice[] }) {
  const years = useMemo(() => {
    const last = new Map<string, PathSlice>();
    for (const s of slices) last.set(s.day.slice(0, 4), s);
    return [...last.values()].sort((a, b) => a.day.localeCompare(b.day));
  }, [slices]);
  const [year, setYear] = useState(years.at(-1)?.day.slice(0, 4) || "");
  const slice = years.find((s) => s.day.startsWith(year)) || years.at(-1);
  if (!slice) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Held that year</h3>
      <p className="mb-3 text-[12px] text-muted">
        Names you actually had at year-end — not leftover names today. Pick a year.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {years.map((s) => {
          const y = s.day.slice(0, 4);
          return (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={cn(
                "h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]",
                year === y ? "bg-surface-2 text-fg" : "bg-bg text-muted hover:text-fg",
              )}
            >
              {y}
            </button>
          );
        })}
      </div>
      <p className="mb-2 text-[12px] text-muted">
        {dayLabel(slice.day)} · {fmtInr(slice.wealth)} · {slice.parts.length} name{slice.parts.length === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-left text-[13px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium text-right">Qty</th>
              <th className="px-3 py-2 font-medium text-right">Value</th>
              <th className="px-3 py-2 font-medium text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {slice.parts.map((p) => (
              <tr key={p.symbol}>
                <td className="px-3 py-2">
                  {p.name}
                  <div className="font-mono text-[11px] text-subtle">{p.symbol}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular">{p.qty}</td>
                <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(p.value)}</td>
                <td className="px-3 py-2 text-right font-mono tabular">
                  {slice.wealth ? ((p.value / slice.wealth) * 100).toFixed(1) + "%" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ByName({ rows, events, closed }: { rows: PathName[]; events: PathEvent[]; closed: ClosedTrade[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
      <table className="kosh-table w-full text-left text-[13px]">
        <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
          <tr>
            <th className="px-3 py-2 font-medium">Stock</th>
            <th className="px-3 py-2 font-medium text-right">Bought</th>
            <th className="px-3 py-2 font-medium text-right">Sold</th>
            <th className="px-3 py-2 font-medium text-right">Still held</th>
            <th className="px-3 py-2 font-medium text-right">Realized</th>
            <th className="px-3 py-2 font-medium text-right">Open</th>
            <th className="px-3 py-2 font-medium text-right">Total P&L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const expanded = open === r.symbol;
            const lines = events.filter((e) => e.symbol === r.symbol);
            const sold = closed.filter((c) => c.symbol === r.symbol);
            return (
              <Fragment key={r.symbol}>
                <tr>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-left"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? null : r.symbol)}
                    >
                      <span className="text-fg">{r.name}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-subtle">
                        {r.symbol}
                        <span className="ml-2 text-muted">{expanded ? "Hide trades" : "Show trades"}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular">{r.bought ? fmtInr(r.bought) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">{r.sold ? fmtInr(r.sold) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">
                    {r.stillQty ? `${r.stillQty} · ${fmtInr(r.stillValue)}` : "—"}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(r.realized))}>
                    {r.realized ? fmtInr(r.realized) : "—"}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(r.unrealized))}>
                    {r.unrealized ? fmtInr(r.unrealized) : "—"}
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono tabular", tone(r.total))}>{fmtInr(r.total)}</td>
                </tr>
                {expanded ? (
                  <tr>
                    <td colSpan={7} className="bg-surface-2 px-3 py-3">
                      <ol className="grid gap-1.5">
                        {lines.map((e, i) => (
                          <li
                            key={e.date + e.side + e.qty + i}
                            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]"
                          >
                            <span className="w-28 shrink-0 font-mono text-[12px] text-subtle tabular">
                              {dayLabel(e.date)}
                            </span>
                            <span
                              className={cn(
                                "w-10 shrink-0 text-[11px] font-medium tracking-[0.06em] uppercase",
                                e.side > 0 ? "text-up" : "text-down",
                              )}
                            >
                              {e.side > 0 ? "Buy" : "Sell"}
                            </span>
                            <span className="font-mono text-[12px] text-muted tabular">
                              {e.qty} · ₹{e.price.toLocaleString("en-IN")}
                              {e.priceFilled ? " · day’s close" : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                      {sold.length ? (
                        <p className="mt-2 text-[12px] text-muted">
                          After selling:{" "}
                          {sold
                            .slice(0, 4)
                            .map((c) => {
                              const bits = [
                                c.post1m != null ? `1M ${fmtPct(c.post1m)}` : null,
                                c.post3m != null ? `3M ${fmtPct(c.post3m)}` : null,
                                c.post1y != null ? `1Y ${fmtPct(c.post1y)}` : null,
                              ].filter(Boolean);
                              return bits.length ? `${c.sellDate} ${bits.join(" · ")}` : null;
                            })
                            .filter(Boolean)
                            .join(" · ") || "no later print on file"}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-medium tabular", className)}>{value}</div>
      <p className="mt-1 text-[12px] leading-snug text-muted">{hint}</p>
    </div>
  );
}

function Timeline({ events }: { events: PathPack["events"] }) {
  if (!events.length) return null;
  const years = [...new Set(events.map((e) => e.date.slice(0, 4)))].sort();
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Buys and sells</h3>
      <p className="mb-3 text-[12px] text-muted">Each mark is a line from the trade file, in execution order.</p>
      <div className="rounded-lg bg-surface px-4 py-4 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-subtle">
          {years.map((y) => (
            <span key={y} className="font-mono tabular">
              {y}
            </span>
          ))}
        </div>
        <ol className="grid gap-1.5">
          {events.slice(0, 40).map((e, i) => (
            <li key={e.date + e.symbol + e.side + i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]">
              <span className="w-28 shrink-0 font-mono text-[12px] text-subtle tabular">{dayLabel(e.date)}</span>
              <span className={cn("w-10 shrink-0 text-[11px] font-medium tracking-[0.06em] uppercase", e.side > 0 ? "text-up" : "text-down")}>
                {e.side > 0 ? "Buy" : "Sell"}
              </span>
              <span className="min-w-0 flex-1 truncate text-fg">{e.name}</span>
              <span className="font-mono text-[12px] text-muted tabular">
                {e.qty} · ₹{e.price.toLocaleString("en-IN")}
                {e.priceFilled ? " · close" : ""}
              </span>
            </li>
          ))}
        </ol>
        {events.length > 40 ? (
          <p className="mt-2 text-[12px] text-subtle">{events.length - 40} more lines in the file.</p>
        ) : null}
      </div>
    </div>
  );
}
