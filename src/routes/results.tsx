import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiResults, apiScreener } from "@/lib/kosh/api";
import { formatIstDate } from "@/lib/kosh/dates";
import { istToday, monthBounds, weekBounds, withinRange, type CalendarEvent, type ResultStatus } from "@/lib/kosh/results-calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({ component: ResultsPage });

const STATUSES: { id: "all" | ResultStatus; label: string }[] = [
  { id: "all", label: "Any status" },
  { id: "scheduled-confirmed", label: "Scheduled" },
  { id: "reported", label: "Reported" },
  { id: "postponed", label: "Postponed" },
  { id: "rescheduled", label: "Rescheduled" },
  { id: "cancelled", label: "Cancelled" },
  { id: "date-unavailable", label: "No date" },
];

function statusLabel(status: ResultStatus) {
  return STATUSES.find((row) => row.id === status)?.label || status;
}

function shiftDay(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + days));
  return dt.toISOString().slice(0, 10);
}

function ResultsPage() {
  const q = useQuery({ queryKey: ["results-calendar"], queryFn: apiResults, staleTime: 10 * 60 * 1000 });
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const [view, setView] = useState<"upcoming" | "reported" | "calendar" | "list">("upcoming");
  const [span, setSpan] = useState<"all" | "today" | "tomorrow" | "week" | "next" | "month" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exchange, setExchange] = useState<"all" | "NSE" | "BSE">("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]["id"]>("all");
  const [sector, setSector] = useState("All");
  const [cap, setCap] = useState("All");
  const [period, setPeriod] = useState("All");
  const [source, setSource] = useState("All");
  const [sortKey, setSortKey] = useState<"date" | "name" | "sector" | "period">("date");
  const [text, setText] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState(80);
  const today = istToday();
  const meta = useMemo(() => {
    const map = new Map<string, { sector: string; mcapCr: number | null }>();
    for (const row of screen.data?.rows || []) map.set(row.symbol.toUpperCase(), { sector: row.sector, mcapCr: row.mcapCr });
    return map;
  }, [screen.data]);
  const sectors = useMemo(() => ["All", ...new Set([...meta.values()].map((row) => row.sector).filter(Boolean))].sort(), [meta]);
  const bounds = useMemo(() => {
    if (span === "today") return { from: today, to: today };
    if (span === "tomorrow") {
      const day = shiftDay(today, 1);
      return { from: day, to: day };
    }
    if (span === "week") return weekBounds(today, 0);
    if (span === "next") return weekBounds(today, 1);
    if (span === "month") return monthBounds(today);
    if (span === "custom") return { from: from || null, to: to || null };
    return { from: null, to: null };
  }, [span, today, from, to]);
  const periods = useMemo(() => {
    const set = new Set<string>();
    for (const row of q.data?.events || []) if (row.quarter) set.add(row.quarter);
    return ["All", ...[...set].sort()];
  }, [q.data]);
  const sources = useMemo(() => ["All", ...new Set((q.data?.events || []).map((row) => row.source).filter(Boolean))], [q.data]);
  const rows = useMemo(() => {
    const needle = text.trim().toUpperCase();
    const filtered = (q.data?.events || []).filter((row) => {
      if (view === "upcoming" && row.status === "reported") return false;
      if (view === "reported" && row.status !== "reported") return false;
      if (exchange !== "all" && row.exchange !== exchange) return false;
      if (status !== "all" && row.status !== status) return false;
      if (source !== "All" && row.source !== source) return false;
      if (period !== "All" && row.quarter !== period) return false;
      if (bounds.from || bounds.to) {
        if (!withinRange(row.date, bounds.from, bounds.to)) return false;
      }
      const card = meta.get(row.symbol);
      if (sector !== "All" && (card?.sector || "Unclassified") !== sector) return false;
      if (cap !== "All") {
        const m = card?.mcapCr;
        if (m == null) return false;
        if (cap === "large" && m < 20000) return false;
        if (cap === "mid" && (m < 5000 || m >= 20000)) return false;
        if (cap === "small" && m >= 5000) return false;
      }
      if (!needle) return true;
      return row.symbol.includes(needle) || row.name.toUpperCase().includes(needle);
    });
    const copy = filtered.slice();
    copy.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) || a.symbol.localeCompare(b.symbol);
      if (sortKey === "sector") return (meta.get(a.symbol)?.sector || "").localeCompare(meta.get(b.symbol)?.sector || "") || a.symbol.localeCompare(b.symbol);
      if (sortKey === "period") return (a.periodEnd || a.quarter || "").localeCompare(b.periodEnd || b.quarter || "") || a.symbol.localeCompare(b.symbol);
      return (a.date || "9999-99-99").localeCompare(b.date || "9999-99-99") || a.symbol.localeCompare(b.symbol);
    });
    return copy;
  }, [q.data, view, exchange, status, bounds, sector, cap, text, meta, period, source, sortKey]);
  const historyBySymbol = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const row of q.data?.events || []) {
      if (row.status !== "reported") continue;
      const list = map.get(row.symbol);
      if (list) list.push(row);
      else map.set(row.symbol, [row]);
    }
    return map;
  }, [q.data]);
  useEffect(() => {
    setShown(80);
  }, [view, span, exchange, status, sector, cap, text, from, to, period, source, sortKey]);
  const visible = rows.slice(0, shown);
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const row of visible) {
      const key = row.date || "Date unavailable";
      map.set(key, [...(map.get(key) || []), row]);
    }
    return [...map.entries()];
  }, [visible]);

  return (
    <AppShell wide>
      <div className="kosh-page grid gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] leading-none font-medium tracking-tight">Results calendar</h1>
            <p className="mt-2 max-w-2xl text-[13px] text-muted">
              Board meetings that will consider results, and filings the exchange has already published. A meeting is not treated as a published result.
            </p>
          </div>
          <div className="text-[12px] text-subtle">
            {q.data?.health.refreshedAt ? `Refreshed ${new Date(q.data.health.refreshedAt).toLocaleString("en-IN")}` : "Not refreshed"}
            {q.data?.health.stale ? " · stale" : ""}
          </div>
        </header>
        {q.data?.health.limitation ? <p className="rounded-lg bg-surface px-4 py-3 text-[13px] text-muted shadow-[var(--shadow-border)]">{q.data.health.limitation}</p> : null}
        {q.data?.health.sources?.length ? (
          <ul className="flex flex-wrap gap-2 text-[12px] text-muted">
            {q.data.health.sources.map((src) => (
              <li key={src.id} className="rounded-sm bg-surface px-2 py-1 shadow-[var(--shadow-border)]">
                <a href={src.url} target="_blank" rel="noreferrer" className="hover:text-chart">
                  {src.name}
                </a>
                {src.ok ? ` · ${src.count}` : ` · failed (${src.error})`}
                {src.newest ? ` · newest ${formatIstDate(src.newest)}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["upcoming", "Upcoming"],
              ["reported", "Reported"],
              ["calendar", "Calendar"],
              ["list", "List"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setView(id)} className={cn("h-11 rounded-sm px-3 text-[13px]", view === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}>
              {label}
            </button>
          ))}
          {(
            [
              ["all", "Any date"],
              ["today", "Today"],
              ["tomorrow", "Tomorrow"],
              ["week", "This week"],
              ["next", "Next week"],
              ["month", "This month"],
              ["custom", "Custom"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setSpan(id)} className={cn("h-11 rounded-sm px-3 text-[13px]", span === id ? "bg-surface-2 text-fg" : "text-muted")}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="h-11 min-w-[12rem] flex-1 rounded-sm bg-surface px-3 text-[13px] shadow-[var(--shadow-border)] outline-none" placeholder="Company or symbol" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search results" />
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Exchange" value={exchange} onChange={(e) => setExchange(e.target.value as typeof exchange)}>
            <option value="all">NSE and BSE</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {STATUSES.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)}>
            {sectors.slice(0, 80).map((row) => (
              <option key={row}>{row}</option>
            ))}
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Market cap" value={cap} onChange={(e) => setCap(e.target.value)}>
            <option value="All">Any cap</option>
            <option value="large">Above ₹20,000 Cr</option>
            <option value="mid">₹5,000–20,000 Cr</option>
            <option value="small">Under ₹5,000 Cr</option>
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Reporting period" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((row) => (
              <option key={row} value={row}>{row === "All" ? "Any period" : row}</option>
            ))}
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Source" value={source} onChange={(e) => setSource(e.target.value)}>
            {sources.map((row) => (
              <option key={row} value={row}>{row === "All" ? "Any source" : row}</option>
            ))}
          </select>
          <select className="h-11 rounded-sm bg-surface px-2 text-[13px]" aria-label="Sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)}>
            <option value="date">Sort by date</option>
            <option value="name">Sort by company</option>
            <option value="sector">Sort by sector</option>
            <option value="period">Sort by period</option>
          </select>
          {span === "custom" ? (
            <div className="flex gap-2">
              <input type="date" aria-label="From" className="h-11 w-full rounded-sm bg-surface px-2 text-[13px]" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" aria-label="To" className="h-11 w-full rounded-sm bg-surface px-2 text-[13px]" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          ) : null}
        </div>
        {q.isPending && !rows.length ? <p className="text-sm text-muted">Loading exchange filings…</p> : null}
        {q.isError ? <p className="text-sm text-down">The calendar could not be loaded. No dates were filled in.</p> : null}
        {!q.isPending && !rows.length ? <p className="text-sm text-muted">Nothing matches. If a source failed, its error is listed above.</p> : null}
        {view === "calendar" ? (
          <div className="grid gap-3">
            {grouped.map(([day, items]) => (
              <section key={day} className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
                <h2 className="font-mono text-[12px] text-muted">{day === "Date unavailable" ? day : formatIstDate(day)}</h2>
                <ul className="mt-2 grid gap-2">
                  {items.map((row) => (
                    <EventRow key={row.symbol + row.status + row.purpose + row.date} row={row} card={meta.get(row.symbol)} open={open} setOpen={setOpen} history={historyBySymbol.get(row.symbol) || []} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Exchange</th>
                  <th className="px-3 py-2 font-medium">Meeting</th>
                  <th className="px-3 py-2 font-medium">Filed</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <EventTable key={row.symbol + row.date + row.purpose + row.status} row={row} card={meta.get(row.symbol)} history={historyBySymbol.get(row.symbol) || []} open={open} setOpen={setOpen} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > shown ? (
          <button type="button" className="h-10 justify-self-start rounded-sm bg-surface px-3 text-[13px] shadow-[var(--shadow-border)]" onClick={() => setShown((n) => n + 80)}>
            Show more ({rows.length - shown} left)
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}

function EventTable({
  row,
  card,
  history,
  open,
  setOpen,
}: {
  row: CalendarEvent;
  card?: { sector: string; mcapCr: number | null };
  history: CalendarEvent[];
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  const id = row.symbol + row.date + row.purpose;
  return (
    <>
      <tr className="border-t border-border">
        <td className="px-3 py-2">
          <button type="button" className="text-left hover:text-chart" onClick={() => setOpen(open === id ? null : id)}>
            <span className="font-medium">{row.name}</span>
            <span className="ml-2 font-mono text-[12px] text-muted">{row.symbol}</span>
          </button>
          <div className="text-[11px] text-subtle">{card?.sector || "Sector not on the screener card"}{card?.mcapCr ? ` · ₹${Math.round(card.mcapCr).toLocaleString("en-IN")} Cr` : ""}</div>
        </td>
        <td className="px-3 py-2">{row.exchange}</td>
        <td className="px-3 py-2 font-mono">{row.meetingDate ? formatIstDate(row.meetingDate) : "—"}</td>
        <td className="px-3 py-2 font-mono">{row.filedAt ? formatIstDate(row.filedAt) : "—"}{row.filedStamp ? <div className="text-[11px] text-subtle">{row.filedStamp}</div> : null}</td>
        <td className="px-3 py-2">{statusLabel(row.status)}</td>
        <td className="px-3 py-2">
          {row.sourceUrl ? (
            <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="text-chart hover:underline">{row.source}</a>
          ) : (
            row.source
          )}
        </td>
      </tr>
      {open === id ? (
        <tr className="border-t border-border bg-bg">
          <td colSpan={6} className="px-3 py-3 text-[13px] text-muted">
            <Detail row={row} history={history} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function EventRow({
  row,
  card,
  open,
  setOpen,
  history,
}: {
  row: CalendarEvent;
  card?: { sector: string; mcapCr: number | null };
  open: string | null;
  setOpen: (id: string | null) => void;
  history: CalendarEvent[];
}) {
  const id = row.symbol + row.date + row.purpose;
  return (
    <li>
      <button type="button" className="flex w-full items-baseline justify-between gap-3 text-left" onClick={() => setOpen(open === id ? null : id)}>
        <span>
          <span className="font-medium">{row.name}</span>
          <span className="ml-2 font-mono text-[12px] text-muted">{row.symbol} · {row.exchange}</span>
          <span className="ml-2 text-[12px] text-subtle">{statusLabel(row.status)}{card?.sector ? ` · ${card.sector}` : ""}</span>
        </span>
      </button>
      {open === id ? <div className="mt-2 text-[13px] text-muted"><Detail row={row} history={history} /></div> : null}
    </li>
  );
}

function Detail({ row, history }: { row: CalendarEvent; history: CalendarEvent[] }) {
  const prior = history.filter((item) => item.filedAt && item.filedAt !== row.filedAt).sort((a, b) => (b.filedAt || "").localeCompare(a.filedAt || ""));
  return (
    <div className="grid gap-2">
      <p>{row.purpose}</p>
      <p>Quarter on the filing: {row.quarter || "not stated"}. Period end: {row.periodEnd ? formatIstDate(row.periodEnd) : "not stated"}.</p>
      {(row.history || []).length > 1 ? (
        <ol className="grid gap-1">
          {(row.history || []).map((item) => (
            <li key={item.label + item.date}>
              {item.label}: {formatIstDate(item.date)} · {row.source}
            </li>
          ))}
        </ol>
      ) : null}
      <p>No date on this row was estimated from a past reporting pattern.</p>
      {row.links.length ? (
        <p className="flex flex-wrap gap-3">
          {row.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-chart hover:underline">
              {link.exchange} · {link.label}
            </a>
          ))}
          <Link to="/s/$symbol" params={{ symbol: row.symbol }} className="text-chart hover:underline">
            Stock
          </Link>
        </p>
      ) : (
        <p>No official file link was attached to this record.</p>
      )}
      {prior[0] ? <p>Previous filing in this refresh: {formatIstDate(prior[0].filedAt || "")} · {prior[0].quarter || prior[0].purpose}</p> : <p>No earlier filing for this symbol in the current refresh.</p>}
    </div>
  );
}
