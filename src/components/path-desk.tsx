import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import { mixVsPathGaps } from "@/lib/kosh/path";
import type { PathPack, PathSlice } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

function dayLabel(d: string) {
  const [y, m, day] = (d || "").split("-");
  if (!y || !m || !day) return d || "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mo = months[Number(m) - 1];
  return mo ? `${Number(day)} ${mo} ${y}` : d;
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

  const vsSame =
    path.wealthNow > 0 && path.sameCashLast
      ? ((path.wealthNow / path.sameCashLast - 1) * 100)
      : null;
  const gaps = mixRows?.length ? mixVsPathGaps(mixRows, path.stillHeld) : [];

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Your path</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">
          What you actually held after each buy and sell, marked at that day’s price. Same money in {benchName} is those
          rupees in the index on the same days. Dividends are included only if they are in the file.
          {path.splitNote
            ? " A split or bonus after a buy, if the extra shares are not in the file, understates later wealth on this line."
            : ""}
          {path.nUndated ? ` ${path.nUndated} line${path.nUndated === 1 ? "" : "s"} had no date and were skipped.` : ""}
          {path.filledPrices.length
            ? ` ${path.filledPrices.length} price${path.filledPrices.length === 1 ? "" : "s"} were taken from that day’s close — add prices in the file for exact cash-in.`
            : ""}
          {mixValue != null && mixValue > 0 ? ` This mix today is ${fmtInr(mixValue)}.` : ""}
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat
            label="Your XIRR"
            value={path.xirr == null ? "—" : fmtPct(path.xirr)}
            hint="Money in and out, including sells, then today’s remaining value"
            className={tone(path.xirr)}
          />
          <Stat
            label="How the holdings did"
            value={path.twrCagr == null ? "—" : fmtPct(path.twrCagr)}
            hint="Per year, after taking out extra money you added later"
            className={tone(path.twrCagr)}
          />
          <Stat
            label={`Same money in ${benchName}`}
            value={path.sameCashLast == null ? "—" : fmtInr(path.sameCashLast)}
            hint={
              vsSame == null
                ? "Rupees in on the same days"
                : `Your path ${fmtInr(path.wealthNow)} · ${vsSame >= 0 ? "ahead" : "behind"} ${fmtPct(Math.abs(vsSame))}`
            }
            className={tone(vsSame)}
          />
          <Stat
            label="If you had never sold"
            value={path.neverSoldLast == null ? "—" : fmtInr(path.neverSoldLast)}
            hint={path.wealthNow ? `Today with sells ${fmtInr(path.wealthNow)}` : "Buys only, still marked today"}
          />
        </div>
        {path.risk && (path.risk.maxDd != null || path.risk.vol != null) ? (
          <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Max drop" value={path.risk.maxDd == null ? "—" : fmtPct(path.risk.maxDd)} hint="Deepest fall of the holdings you actually had" className={tone(path.risk.maxDd)} />
            <Stat label="Swing" value={path.risk.vol == null ? "—" : fmtPct(path.risk.vol)} hint="How bumpy the actual path was, yearly" />
            <Stat label="Sharpe" value={path.risk.sharpe == null ? "—" : path.risk.sharpe.toFixed(2)} hint="Return per unit of bump, Rf 6.5%" className={tone(path.risk.sharpe)} />
            <Stat
              label="Vs the index"
              value={path.risk.alpha == null ? "—" : `${path.risk.alpha >= 0 ? "+" : ""}${path.risk.alpha.toFixed(1)} pp`}
              hint="Yearly extra versus the same rupees in the index"
              className={tone(path.risk.alpha)}
            />
          </div>
        ) : null}
      </section>

      <Timeline events={path.events} />

      {path.snapshots?.length ? <HeldThen slices={path.snapshots} /> : null}

      {path.byName?.length ? <ByName rows={path.byName} /> : null}

      {path.closed.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Closed trades</h2>
          <p className="mb-3 text-[12px] text-muted">Matched first-in, first-out from the file. Not a broker contract note.</p>
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium text-right">Qty</th>
                  <th className="px-3 py-2 font-medium">Bought</th>
                  <th className="px-3 py-2 font-medium">Sold</th>
                  <th className="px-3 py-2 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {path.closed.slice(0, 24).map((c, i) => (
                  <tr key={c.symbol + c.buyDate + c.sellDate + i}>
                    <td className="px-3 py-2">
                      <div className="text-fg">{c.name}</div>
                      <div className="font-mono text-[11px] text-subtle">{c.symbol}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular">{c.qty}</td>
                    <td className="px-3 py-2 text-muted">
                      {dayLabel(c.buyDate)} · ₹{c.buyPx.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {dayLabel(c.sellDate)} · ₹{c.sellPx.toLocaleString("en-IN")}
                    </td>
                    <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.pnl))}>
                      {fmtInr(c.pnl)}
                      <div className="text-[11px]">{fmtPct(c.pnlPct)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {path.stillHeld.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Still held</h2>
          <p className="mb-3 text-[12px] text-muted">What the trade file still has after sells — Mix uses the holdings list, which can differ if you edited a line by hand.</p>
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium text-right">Qty</th>
                  <th className="px-3 py-2 font-medium text-right">Avg</th>
                  <th className="px-3 py-2 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {path.stillHeld.map((h) => (
                  <tr key={h.symbol}>
                    <td className="px-3 py-2">
                      {h.name}
                      <div className="font-mono text-[11px] text-subtle">{h.symbol}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular">{h.qty}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{h.avg ? `₹${h.avg.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(h.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {gaps.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">This mix vs your path</h2>
          <p className="mb-3 text-[12px] text-muted">
            Mix is the holdings list. Path is what the trade file still holds after sells. A gap usually means a line was edited by hand, or the file is incomplete.
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
        </section>
      ) : null}

      {path.contrib.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">What each buy added</h2>
          <p className="mb-3 text-[12px] text-muted">Remaining piece of each buy after later sells, marked today.</p>
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Buy</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium text-right">Still held</th>
                  <th className="px-3 py-2 font-medium text-right">Cost</th>
                  <th className="px-3 py-2 font-medium text-right">Now</th>
                </tr>
              </thead>
              <tbody>
                {path.contrib.slice(0, 20).map((c, i) => (
                  <tr key={c.symbol + c.date + i}>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-muted">{dayLabel(c.date)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{c.remainingQty}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(c.invested)}</td>
                    <td className={cn("px-3 py-2 text-right font-mono tabular", tone(c.pnl))}>
                      {fmtInr(c.valueNow)}
                      <div className="text-[11px]">{fmtInr(c.pnl)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {path.years.length ? (
        <section>
          <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">By year</h2>
          <p className="mb-3 text-[12px] text-muted">Start and end rupees that year. Return takes out money you put in or took out.</p>
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="kosh-table w-full text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Year</th>
                  <th className="px-3 py-2 font-medium text-right">Start</th>
                  <th className="px-3 py-2 font-medium text-right">End</th>
                  <th className="px-3 py-2 font-medium text-right">Return</th>
                  <th className="px-3 py-2 font-medium text-right">Put in</th>
                  <th className="px-3 py-2 font-medium text-right">Took out</th>
                </tr>
              </thead>
              <tbody>
                {path.years.map((y) => (
                  <tr key={y.year}>
                    <td className="px-3 py-2">{y.year}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(y.start)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{fmtInr(y.end)}</td>
                    <td className={cn("px-3 py-2 text-right font-mono tabular", tone(y.ret))}>
                      {y.ret == null ? "—" : fmtPct(y.ret)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular">{y.buyIn ? fmtInr(y.buyIn) : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono tabular">{y.sellOut ? fmtInr(y.sellOut) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 grid gap-1.5">
            {path.years.map((y) => {
              const mag = Math.min(100, Math.abs(y.ret ?? 0));
              return (
                <li key={y.year + "-bar"} className="kosh-row text-[13px]">
                  <span className="w-12 shrink-0 font-mono tabular text-muted">{y.year}</span>
                  <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-full", (y.ret ?? 0) >= 0 ? "bg-up/70" : "bg-down/70")}
                      style={{ width: `${mag}%` }}
                    />
                  </span>
                  <span className={cn("w-16 shrink-0 text-right font-mono tabular", tone(y.ret))}>
                    {y.ret == null ? "—" : fmtPct(y.ret)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {path.missing.length ? (
        <p className="text-[12px] text-subtle">No price history for {path.missing.join(", ")} — those names sit out of the line.</p>
      ) : (
        <p className="text-[12px] text-subtle">{path.coverage}</p>
      )}
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
    <section>
      <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Held that year</h2>
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
    </section>
  );
}

function ByName({ rows }: { rows: PathPack["byName"] }) {
  return (
    <section>
      <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Each name on the path</h2>
      <p className="mb-3 text-[12px] text-muted">
        Buys, sells, and what is still held — including names you no longer have. This mix only lists leftover names.
      </p>
      <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
        <table className="kosh-table w-full text-left text-[13px]">
          <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium text-right">Put in</th>
              <th className="px-3 py-2 font-medium text-right">Took out</th>
              <th className="px-3 py-2 font-medium text-right">Still held</th>
              <th className="px-3 py-2 font-medium text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol}>
                <td className="px-3 py-2">
                  {r.name}
                  <div className="font-mono text-[11px] text-subtle">{r.symbol}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular">{r.bought ? fmtInr(r.bought) : "—"}</td>
                <td className="px-3 py-2 text-right font-mono tabular">{r.sold ? fmtInr(r.sold) : "—"}</td>
                <td className="px-3 py-2 text-right font-mono tabular">
                  {r.stillQty ? `${r.stillQty} · ${fmtInr(r.stillValue)}` : "—"}
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular", tone(r.total))}>
                  {fmtInr(r.total)}
                  <div className="text-[11px] text-muted">
                    {r.realized ? `closed ${fmtInr(r.realized)}` : ""}
                    {r.realized && r.unrealized ? " · " : ""}
                    {r.unrealized ? `open ${fmtInr(r.unrealized)}` : ""}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
    <section>
      <h2 className="mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Buys and sells</h2>
      <p className="mb-3 text-[12px] text-muted">Each mark is a line from the trade file, in order.</p>
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
              </span>
            </li>
          ))}
        </ol>
        {events.length > 40 ? (
          <p className="mt-2 text-[12px] text-subtle">{events.length - 40} more lines in the file.</p>
        ) : null}
      </div>
    </section>
  );
}