import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { parseJournalCsv } from "@/lib/kosh/journal-csv";
import { journalStats, tradePnl, type JournalTrade } from "@/lib/kosh/journal-stats";
import { listingExchange, listingId } from "@/lib/kosh/listing";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({ ssr: false, component: JournalPage });

const BEHAVIOUR = ["Early exit", "Late entry", "Overtrading", "Revenge trading"];
const EMPTY = {
  symbol: "",
  strategy: "",
  direction: "long" as "long" | "short",
  entryAt: "",
  exitAt: "",
  entryPx: "",
  exitPx: "",
  qty: "",
  stop: "",
  target: "",
  fees: "",
  taxes: "",
  slippage: "",
  timeframe: "1D",
  notes: "",
  group: "",
  chartRef: "",
  tags: "",
};

function money(n: number | null) {
  if (n == null) return "—";
  return (n < 0 ? "−" : "") + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function JournalPage() {
  const trades = useKosh((s) => s.journalTrades);
  const save = useKosh((s) => s.saveJournalTrade);
  const remove = useKosh((s) => s.removeJournalTrade);
  const ingest = useKosh((s) => s.importJournalTrades);
  const [form, setForm] = useState(EMPTY);
  const [edit, setEdit] = useState<string | null>(null);
  const [rules, setRules] = useState({ entry: null as boolean | null, stop: null as boolean | null, target: null as boolean | null });
  const [behaviour, setBehaviour] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [strategy, setStrategy] = useState("All");
  const [state, setState] = useState<"all" | "open" | "closed">("all");
  const [message, setMessage] = useState("");
  const strategies = ["All", ...new Set(trades.map((row) => row.strategy).filter(Boolean))];
  const filtered = useMemo(() => {
    const needle = q.trim().toUpperCase();
    return trades.filter((row) => {
      const closed = Boolean(row.exitAt && row.exitPx);
      if (state === "open" && closed) return false;
      if (state === "closed" && !closed) return false;
      if (strategy !== "All" && row.strategy !== strategy) return false;
      if (!needle) return true;
      return row.symbol.includes(needle) || row.name.toUpperCase().includes(needle) || row.notes.toUpperCase().includes(needle);
    });
  }, [trades, q, strategy, state]);
  const stats = useMemo(() => journalStats(filtered), [filtered]);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function load(row: JournalTrade) {
    setEdit(row.id);
    setForm({
      symbol: row.symbol,
      strategy: row.strategy,
      direction: row.direction,
      entryAt: row.entryAt ? new Date(row.entryAt).toISOString().slice(0, 16) : "",
      exitAt: row.exitAt ? new Date(row.exitAt).toISOString().slice(0, 16) : "",
      entryPx: String(row.entryPx || ""),
      exitPx: row.exitPx ? String(row.exitPx) : "",
      qty: String(row.qty || ""),
      stop: row.stop ? String(row.stop) : "",
      target: row.target ? String(row.target) : "",
      fees: String(row.fees || ""),
      taxes: String(row.taxes || ""),
      slippage: String(row.slippage || ""),
      timeframe: row.timeframe || "1D",
      notes: row.notes,
      group: row.group,
      chartRef: row.chartRef,
      tags: row.tags.join(", "),
    });
    setRules(row.rules);
    setBehaviour(row.behaviour);
  }

  return (
    <AppShell wide>
      <div className="kosh-page grid gap-4">
        <header>
          <h1 className="text-[28px] leading-none font-medium tracking-tight">Trading journal</h1>
          <p className="mt-2 max-w-3xl text-[13px] text-muted">
            Your own trades, separate from a portfolio’s Path file. Signed-in accounts sync this journal. A chart reference is a link or note — not an uploaded image.
          </p>
        </header>
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <Stat label="Realised" value={money(stats.closed ? stats.realised : null)} />
          <Stat label="Unrealised" value={money(stats.unrealised)} />
          <Stat label="Win rate" value={stats.winRate == null ? "—" : `${Math.round(stats.winRate * 100)}%`} />
          <Stat label="Expectancy" value={money(stats.expectancy)} />
          <Stat label="Profit factor" value={stats.profitFactor == null ? "—" : stats.profitFactor.toFixed(2)} />
          <Stat label="Max drawdown" value={money(stats.maxDd == null ? null : -stats.maxDd)} />
        </section>
        {stats.equity.length > 1 ? <Equity points={stats.equity} /> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{edit ? "Edit trade" : "Add trade"}</h2>
            <form
              className="mt-3 grid gap-2 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const symbol = listingId(form.symbol);
                const entryPx = Number(form.entryPx);
                const qty = Number(form.qty);
                const entryAt = Date.parse(form.entryAt);
                if (!symbol || !(entryPx > 0) || !(qty > 0) || !Number.isFinite(entryAt)) return;
                const exitPx = Number(form.exitPx);
                const exitAt = Date.parse(form.exitAt);
                save({
                  id: edit || undefined,
                  symbol,
                  exchange: listingExchange(symbol) === "BSE" ? "BSE" : "NSE",
                  name: symbol,
                  strategy: form.strategy,
                  direction: form.direction,
                  entryAt,
                  exitAt: exitPx > 0 && Number.isFinite(exitAt) ? exitAt : null,
                  entryPx,
                  exitPx: exitPx > 0 ? exitPx : null,
                  qty,
                  stop: Number(form.stop) > 0 ? Number(form.stop) : null,
                  target: Number(form.target) > 0 ? Number(form.target) : null,
                  fees: Number(form.fees) || 0,
                  taxes: Number(form.taxes) || 0,
                  slippage: Number(form.slippage) || 0,
                  timeframe: form.timeframe,
                  tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
                  notes: form.notes,
                  rules,
                  behaviour,
                  group: form.group,
                  chartRef: form.chartRef,
                });
                setForm(EMPTY);
                setEdit(null);
                setRules({ entry: null, stop: null, target: null });
                setBehaviour([]);
              }}
            >
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Symbol" aria-label="Symbol" value={form.symbol} onChange={(e) => set("symbol", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Strategy" aria-label="Strategy" value={form.strategy} onChange={(e) => set("strategy", e.target.value)} />
              <select className="h-10 rounded-sm bg-bg px-2 text-[13px]" aria-label="Direction" value={form.direction} onChange={(e) => set("direction", e.target.value === "short" ? "short" : "long")}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Timeframe" aria-label="Timeframe" value={form.timeframe} onChange={(e) => set("timeframe", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" type="datetime-local" aria-label="Entry time" value={form.entryAt} onChange={(e) => set("entryAt", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" type="datetime-local" aria-label="Exit time" value={form.exitAt} onChange={(e) => set("exitAt", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Entry price" aria-label="Entry price" value={form.entryPx} onChange={(e) => set("entryPx", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Exit price" aria-label="Exit price" value={form.exitPx} onChange={(e) => set("exitPx", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Quantity" aria-label="Quantity" value={form.qty} onChange={(e) => set("qty", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Stop" aria-label="Stop" value={form.stop} onChange={(e) => set("stop", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Target" aria-label="Target" value={form.target} onChange={(e) => set("target", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Fees" aria-label="Fees" value={form.fees} onChange={(e) => set("fees", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Taxes" aria-label="Taxes" value={form.taxes} onChange={(e) => set("taxes", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Slippage ₹" aria-label="Slippage" value={form.slippage} onChange={(e) => set("slippage", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px]" placeholder="Setup group" aria-label="Group" value={form.group} onChange={(e) => set("group", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px] sm:col-span-2" placeholder="Chart link or reference" aria-label="Chart reference" value={form.chartRef} onChange={(e) => set("chartRef", e.target.value)} />
              <input className="h-10 rounded-sm bg-bg px-3 text-[13px] sm:col-span-2" placeholder="Tags, comma separated" aria-label="Tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              <textarea className="min-h-20 rounded-sm bg-bg px-3 py-2 text-[13px] sm:col-span-2" placeholder="Notes" aria-label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              <div className="flex flex-wrap gap-2 sm:col-span-2 text-[12px]">
                {(["entry", "stop", "target"] as const).map((key) => (
                  <button key={key} type="button" className={cn("h-8 rounded-sm px-2", rules[key] ? "bg-bg-elevated text-fg" : "text-muted")} onClick={() => setRules((prev) => ({ ...prev, [key]: prev[key] === true ? false : prev[key] === false ? null : true }))}>
                    {key} rule {rules[key] == null ? "unset" : rules[key] ? "kept" : "broken"}
                  </button>
                ))}
                {BEHAVIOUR.map((tag) => (
                  <button key={tag} type="button" className={cn("h-8 rounded-sm px-2", behaviour.includes(tag) ? "bg-bg-elevated text-fg" : "text-muted")} onClick={() => setBehaviour((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))}>
                    {tag}
                  </button>
                ))}
              </div>
              <button type="submit" className="h-10 rounded-sm bg-fg px-3 text-[13px] text-bg">{edit ? "Save changes" : "Add trade"}</button>
            </form>
            <label className="mt-4 block text-[12px] text-muted">
              CSV import
              <input
                className="mt-1 block text-[13px] text-fg"
                type="file"
                accept=".csv,text/csv"
                aria-label="Import trades CSV"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const parsed = parseJournalCsv(await file.text(), trades);
                  const n = ingest(parsed.added);
                  setMessage(`${n} added, ${parsed.skipped} duplicates skipped.${parsed.errors.length ? " " + parsed.errors[0] : ""}`);
                }}
              />
            </label>
            {message ? <p className="mt-2 text-[13px] text-muted">{message}</p> : null}
          </section>
          <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
            <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">By strategy</h2>
            {!stats.byStrategy.length ? <p className="mt-2 text-[13px] text-muted">Close a trade to see this.</p> : null}
            <ul className="mt-2 grid gap-2 text-[13px]">
              {stats.byStrategy.map((row) => (
                <li key={row.key} className="flex justify-between gap-3">
                  <span>{row.key} · {row.n}{row.winRate == null ? "" : ` · ${Math.round(row.winRate * 100)}%`}</span>
                  <span className="font-mono">{money(row.pnl)}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Holding length</h2>
            <ul className="mt-2 grid gap-1 text-[13px]">
              {stats.byHolding.map((row) => (
                <li key={row.key} className="flex justify-between"><span>{row.key}</span><span className="font-mono">{money(row.pnl)}</span></li>
              ))}
            </ul>
            <Breakdown title="Instrument" rows={stats.byInstrument} />
            <Breakdown title="Timeframe" rows={stats.byTimeframe} />
            <Breakdown title="Setup group" rows={stats.byGroup} />
            <Breakdown title="Entry session" rows={stats.bySession} />
            <Breakdown title="Weekday" rows={stats.byWeekday} />
            <p className="mt-3 text-[12px] text-subtle">
              Rules kept: {money(stats.cleanPnl)}. Rules broken or tagged: {money(stats.brokenPnl)}. Average R {stats.avgR == null ? "—" : stats.avgR.toFixed(2)}. Largest win {money(stats.largestWin)}, largest loss {money(stats.largestLoss)}. Streaks {stats.streakWin} / {stats.streakLoss}. Sector and market-regime splits are not shown — the journal does not store a sector or a market label, and none is inferred.
            </p>
          </section>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="h-10 rounded-sm bg-surface px-3 text-[13px] outline-none" placeholder="Search" aria-label="Search trades" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="State" value={state} onChange={(e) => setState(e.target.value as typeof state)}>
            <option value="all">Open and closed</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="Strategy filter" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            {strategies.map((row) => (
              <option key={row}>{row}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Trade</th>
                <th className="px-3 py-2 font-medium">Entry</th>
                <th className="px-3 py-2 font-medium">Exit</th>
                <th className="px-3 py-2 font-medium">P&L</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const pnl = tradePnl(row);
                return (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Link to="/s/$symbol" params={{ symbol: row.symbol }} className="font-medium hover:text-chart">{row.symbol}</Link>
                      <div className="text-[11px] text-subtle">{row.exchange} · {row.direction} · {row.strategy || "No strategy"}{row.group ? ` · ${row.group}` : ""}</div>
                    </td>
                    <td className="px-3 py-2 font-mono">{row.entryPx} × {row.qty}<div className="text-[11px] text-subtle">{new Date(row.entryAt).toLocaleString("en-IN")}</div></td>
                    <td className="px-3 py-2 font-mono">{row.exitPx ?? "Open"}</td>
                    <td className="px-3 py-2 font-mono">{pnl.closed ? money(pnl.pnl) : "Open"}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="mr-3 text-[12px] text-muted" onClick={() => load(row)}>Edit</button>
                      <button type="button" className="text-[12px] text-muted" onClick={() => remove(row.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length ? <p className="px-3 py-4 text-[13px] text-muted">No trades in this filter.</p> : null}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
      <div className="text-[11px] tracking-[0.08em] text-subtle uppercase">{label}</div>
      <div className="mt-1 font-mono text-[18px]">{value}</div>
    </div>
  );
}

function Equity({ points }: { points: { t: number; v: number }[] }) {
  const w = 640;
  const h = 120;
  const min = Math.min(0, ...points.map((p) => p.v));
  const max = Math.max(0, ...points.map((p) => p.v));
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * (w - 8) + 4).toFixed(1)} ${(h - 8 - ((p.v - min) / span) * (h - 16)).toFixed(1)}`)
    .join(" ");
  let peak = 0;
  const dd = points.map((p) => {
    peak = Math.max(peak, p.v);
    return peak - p.v;
  });
  const ddMax = Math.max(...dd, 1);
  const ddPath = dd
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (dd.length - 1)) * (w - 8) + 4).toFixed(1)} ${(8 + (v / ddMax) * (h - 16)).toFixed(1)}`)
    .join(" ");
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Closed-trade equity and drawdown</h2>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-28 w-full" role="img" aria-label="Equity curve">
        <path d={d} fill="none" stroke="var(--color-chart)" strokeWidth="2" />
      </svg>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-16 w-full" role="img" aria-label="Drawdown from the closed-trade peak">
        <path d={ddPath} fill="none" stroke="var(--color-muted)" strokeWidth="2" />
      </svg>
      <p className="mt-1 text-[11px] text-subtle">The lower line is the drop from the peak of closed P&L only. Open trades are not on this curve.</p>
    </section>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { key: string; n: number; pnl: number }[] }) {
  if (!rows.length) return null;
  return (
    <>
      <h2 className="mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h2>
      <ul className="mt-2 grid gap-1 text-[13px]">
        {rows.map((row) => (
          <li key={row.key} className="flex justify-between gap-3">
            <span>{row.key} · {row.n}</span>
            <span className="font-mono">{money(row.pnl)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
