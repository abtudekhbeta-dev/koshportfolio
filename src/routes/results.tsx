import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiResults, apiScreener } from "@/lib/kosh/api";
import { formatIstDate } from "@/lib/kosh/dates";
import {
  istToday,
  membershipOf,
  monthBounds,
  nextMonthBounds,
  periodLabel,
  rollingBounds,
  weekBounds,
  withinRange,
  type CalendarEvent,
  type ResultStatus,
} from "@/lib/kosh/results-calendar";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({ component: ResultsPage });

const STATUS_LABEL: Record<ResultStatus, string> = {
  "scheduled-confirmed": "Confirmed",
  expected: "Expected",
  reported: "Reported",
  rescheduled: "Rescheduled",
  postponed: "Postponed",
  cancelled: "Cancelled",
  "date-unavailable": "Needs a date",
  "needs-verification": "Needs verification",
};

const STATUSES: { id: "all" | ResultStatus; label: string }[] = [
  { id: "all", label: "Any status" },
  ...(Object.keys(STATUS_LABEL) as ResultStatus[]).map((id) => ({ id, label: STATUS_LABEL[id] })),
];

type Span = "all" | "today" | "tomorrow" | "week" | "next" | "month" | "next-month" | "d30" | "d60" | "custom";
type Book = "all" | "portfolio" | "watch";

function statusLabel(status: ResultStatus) {
  return STATUS_LABEL[status] || status;
}

function ResultsPage() {
  const client = useQueryClient();
  const q = useQuery({ queryKey: ["results-calendar"], queryFn: () => apiResults(false), staleTime: 5 * 60 * 1000 });
  const screen = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const portfolios = useKosh((s) => s.portfolios);
  const watchlists = useKosh((s) => s.watchlists);
  const watch = useKosh((s) => s.watch);
  const [view, setView] = useState<"upcoming" | "reported" | "calendar">("upcoming");
  const [book, setBook] = useState<Book>("all");
  const [span, setSpan] = useState<Span>("d60");
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
  const [refreshing, setRefreshing] = useState(false);
  const today = istToday();
  const portfolioSymbols = useMemo(() => portfolios.flatMap((p) => p.holdings.map((h) => h.symbol)), [portfolios]);
  const watchSymbols = useMemo(() => [...watch, ...watchlists.flatMap((list) => list.symbols)], [watch, watchlists]);
  const meta = useMemo(() => {
    const map = new Map<string, { sector: string; mcapCr: number | null }>();
    for (const row of screen.data?.rows || []) map.set(row.symbol.toUpperCase(), { sector: row.sector, mcapCr: row.mcapCr });
    return map;
  }, [screen.data]);
  const sectors = useMemo(() => ["All", ...new Set([...meta.values()].map((row) => row.sector).filter(Boolean))].sort(), [meta]);
  const bounds = useMemo(() => {
    if (span === "today") return { from: today, to: today };
    if (span === "tomorrow") {
      const day = rollingBounds(today, 1).to;
      return { from: day, to: day };
    }
    if (span === "week") return weekBounds(today, 0);
    if (span === "next") return weekBounds(today, 1);
    if (span === "month") return monthBounds(today);
    if (span === "next-month") return nextMonthBounds(today);
    if (span === "d30") return rollingBounds(today, 30);
    if (span === "d60") return rollingBounds(today, 60);
    if (span === "custom") return { from: from || null, to: to || null };
    return { from: null, to: null };
  }, [span, today, from, to]);
  const periods = useMemo(() => {
    const set = new Set<string>();
    for (const row of q.data?.events || []) {
      const label = periodLabel(row);
      if (label !== "—") set.add(label);
    }
    return ["All", ...[...set].sort()];
  }, [q.data]);
  const sources = useMemo(() => ["All", ...new Set((q.data?.events || []).map((row) => row.source).filter(Boolean))], [q.data]);
  const rows = useMemo(() => {
    const needle = text.trim().toUpperCase();
    const filtered = (q.data?.events || []).filter((row) => {
      if (view === "upcoming" && row.status === "reported") return false;
      if (view === "reported" && row.status !== "reported") return false;
      const member = membershipOf(row.symbol, portfolioSymbols, watchSymbols);
      if (book === "portfolio" && member !== "portfolio") return false;
      if (book === "watch" && membershipOf(row.symbol, [], watchSymbols) !== "watchlist") return false;
      if (exchange !== "all" && row.exchange !== exchange) return false;
      if (status !== "all" && row.status !== status) return false;
      if (source !== "All" && row.source !== source) return false;
      if (period !== "All" && periodLabel(row) !== period) return false;
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
      if (sortKey === "period") return periodLabel(a).localeCompare(periodLabel(b)) || a.symbol.localeCompare(b.symbol);
      return (a.date || "9999-99-99").localeCompare(b.date || "9999-99-99") || a.symbol.localeCompare(b.symbol);
    });
    return copy;
  }, [q.data, view, book, exchange, status, bounds, sector, cap, text, meta, period, source, sortKey, portfolioSymbols, watchSymbols]);
  const portfolioUpcoming = useMemo(() => {
    const horizon = rollingBounds(today, 60);
    return (q.data?.events || [])
      .filter((row) => {
        if (row.status === "reported" || row.status === "cancelled") return false;
        if (membershipOf(row.symbol, portfolioSymbols, []) !== "portfolio") return false;
        return withinRange(row.date, horizon.from, horizon.to);
      })
      .slice(0, 8);
  }, [q.data, today, portfolioSymbols]);
  useEffect(() => {
    setShown(80);
  }, [view, book, span, exchange, status, sector, cap, text, from, to, period, source, sortKey]);
  const visible = rows.slice(0, shown);
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const row of visible) {
      const key = row.date || "Date unavailable";
      map.set(key, [...(map.get(key) || []), row]);
    }
    return [...map.entries()];
  }, [visible]);

  async function refresh() {
    setRefreshing(true);
    try {
      const data = await apiResults(true);
      client.setQueryData(["results-calendar"], data);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AppShell wide>
      <div className="kosh-page grid gap-3">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[28px] leading-none font-medium tracking-tight">Results calendar</h1>
          <div className="flex items-center gap-2 text-[12px] text-subtle">
            <span>{q.data?.health.refreshedAt ? `Last updated ${new Date(q.data.health.refreshedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}` : "Not updated yet"}</span>
            <button type="button" className="h-8 rounded-sm bg-surface px-2 shadow-[var(--shadow-border)]" onClick={() => void refresh()} disabled={refreshing}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>
        {portfolioSymbols.length ? (
          <section className="rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
            <h2 className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">Upcoming results — your portfolio</h2>
            {portfolioUpcoming.length ? (
              <ul className="mt-2 grid gap-1">
                {portfolioUpcoming.map((row) => (
                  <li key={row.symbol + row.date + row.purpose} className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
                    <span className="font-medium">{row.name}</span>
                    <span className="font-mono text-[12px] text-muted">{row.symbol}</span>
                    <span className="text-[12px] text-muted">{periodLabel(row)}</span>
                    <span className="font-mono text-[13px]">{row.date ? formatIstDate(row.date) : "—"}</span>
                    <span className="text-[12px]">{statusLabel(row.status)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[13px] text-muted">{q.isPending ? "Loading results…" : "No upcoming results for your holdings in the next 60 days."}</p>
            )}
          </section>
        ) : null}
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["upcoming", "Upcoming"],
              ["reported", "Reported"],
              ["calendar", "Calendar"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setView(id)} className={cn("h-8 rounded-sm px-2.5 text-[13px]", view === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}>
              {label}
            </button>
          ))}
          {(
            [
              ["all", "All companies"],
              ["portfolio", "Portfolio"],
              ["watch", "Watchlist"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setBook(id)} className={cn("h-8 rounded-sm px-2.5 text-[13px]", book === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["today", "Today"],
              ["tomorrow", "Tomorrow"],
              ["week", "This week"],
              ["next", "Next week"],
              ["month", "This month"],
              ["next-month", "Next month"],
              ["d30", "Next 30 days"],
              ["d60", "Next 60 days"],
              ["all", "Any date"],
              ["custom", "Custom"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setSpan(id)} className={cn("h-8 rounded-sm px-2.5 text-[12px]", span === id ? "bg-surface-2 text-fg" : "text-muted")}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <input className="h-8 min-w-[12rem] flex-1 rounded-sm bg-surface px-3 text-[13px] shadow-[var(--shadow-border)] outline-none" placeholder="Company or symbol" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search results" />
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Exchange" value={exchange} onChange={(e) => setExchange(e.target.value as typeof exchange)}>
            <option value="all">NSE and BSE</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {STATUSES.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)}>
            {sectors.slice(0, 80).map((row) => (
              <option key={row}>{row}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Market cap" value={cap} onChange={(e) => setCap(e.target.value)}>
            <option value="All">Any cap</option>
            <option value="large">Above ₹20,000 Cr</option>
            <option value="mid">₹5,000–20,000 Cr</option>
            <option value="small">Under ₹5,000 Cr</option>
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Reporting period" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((row) => (
              <option key={row} value={row}>{row === "All" ? "Any period" : row}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Source" value={source} onChange={(e) => setSource(e.target.value)}>
            {sources.map((row) => (
              <option key={row} value={row}>{row === "All" ? "Any source" : row}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm bg-surface px-2 text-[13px]" aria-label="Sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)}>
            <option value="date">Sort by date</option>
            <option value="name">Sort by company</option>
            <option value="sector">Sort by sector</option>
            <option value="period">Sort by period</option>
          </select>
          {span === "custom" ? (
            <div className="flex gap-1">
              <input type="date" aria-label="From" className="h-8 rounded-sm bg-surface px-2 text-[13px]" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" aria-label="To" className="h-8 rounded-sm bg-surface px-2 text-[13px]" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          ) : null}
        </div>
        {q.isPending && !rows.length ? <p className="text-sm text-muted">Loading results…</p> : null}
        {q.isError ? <p className="text-sm text-down">The calendar could not be loaded.</p> : null}
        {!q.isPending && !q.isError && !rows.length ? <p className="text-sm text-muted">Nothing matches these filters.</p> : null}
        {view === "calendar" ? (
          <div className="grid gap-2">
            {grouped.map(([day, items]) => (
              <section key={day} className="rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
                <h2 className="font-mono text-[12px] text-muted">{day === "Date unavailable" ? day : formatIstDate(day)}</h2>
                <ul className="mt-1 grid gap-1">
                  {items.map((row) => (
                    <EventLine key={row.symbol + row.status + row.purpose + row.date} row={row} member={membershipOf(row.symbol, portfolioSymbols, watchSymbols)} open={open} setOpen={setOpen} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <>
            <ul className="grid gap-1 md:hidden">
              {visible.map((row) => (
                <li key={row.symbol + row.date + row.purpose + row.status} className="rounded-md bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
                  <EventLine row={row} member={membershipOf(row.symbol, portfolioSymbols, watchSymbols)} open={open} setOpen={setOpen} />
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block">
              <table className="w-full min-w-[720px] text-left text-[13px]">
                <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Company</th>
                    <th className="px-3 py-2 font-medium">Symbol</th>
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 font-medium">Results date</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <EventTable key={row.symbol + row.date + row.purpose + row.status} row={row} member={membershipOf(row.symbol, portfolioSymbols, watchSymbols)} open={open} setOpen={setOpen} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {rows.length > shown ? (
          <button type="button" className="h-8 justify-self-start rounded-sm bg-surface px-3 text-[13px] shadow-[var(--shadow-border)]" onClick={() => setShown((n) => n + 80)}>
            Show more ({rows.length - shown} left)
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}

function MemberMark({ member }: { member: "portfolio" | "watchlist" | null }) {
  if (!member) return null;
  return <span className="ml-2 text-[10px] font-medium tracking-wide text-muted uppercase">{member === "portfolio" ? "In portfolio" : "In watchlist"}</span>;
}

function EventTable({
  row,
  member,
  open,
  setOpen,
}: {
  row: CalendarEvent;
  member: "portfolio" | "watchlist" | null;
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  const id = row.symbol + row.date + row.purpose + row.status;
  return (
    <>
      <tr className="border-t border-border">
        <td className="px-3 py-2">
          <button type="button" className="text-left hover:text-chart" onClick={() => setOpen(open === id ? null : id)}>
            <span className="font-medium">{row.name}</span>
            <MemberMark member={member} />
          </button>
        </td>
        <td className="px-3 py-2 font-mono text-[12px]">{row.symbol}</td>
        <td className="px-3 py-2">{periodLabel(row)}</td>
        <td className="px-3 py-2 font-mono text-[14px] font-medium">{row.date ? formatIstDate(row.date) : "—"}</td>
        <td className="px-3 py-2">{statusLabel(row.status)}</td>
      </tr>
      {open === id ? (
        <tr className="border-t border-border bg-bg">
          <td colSpan={5} className="px-3 py-3 text-[13px] text-muted">
            <Detail row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function EventLine({
  row,
  member,
  open,
  setOpen,
}: {
  row: CalendarEvent;
  member: "portfolio" | "watchlist" | null;
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  const id = row.symbol + row.date + row.purpose + row.status;
  return (
    <div>
      <button type="button" className="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-left" onClick={() => setOpen(open === id ? null : id)}>
        <span>
          <span className="font-medium">{row.name}</span>
          <span className="ml-2 font-mono text-[12px] text-muted">{row.symbol}</span>
          <MemberMark member={member} />
        </span>
        <span className="font-mono text-[13px] font-medium">{row.date ? formatIstDate(row.date) : "—"}</span>
        <span className="text-[12px] text-muted">{periodLabel(row)} · {statusLabel(row.status)}</span>
      </button>
      {open === id ? <div className="mt-2 text-[13px] text-muted"><Detail row={row} /></div> : null}
    </div>
  );
}

function Detail({ row }: { row: CalendarEvent }) {
  return (
    <div className="grid gap-1">
      <p>{row.name} · {periodLabel(row)}</p>
      <p>Meeting: {row.meetingDate ? formatIstDate(row.meetingDate) : "—"}</p>
      <p>Published: {row.filedAt ? formatIstDate(row.filedAt) : "—"}{row.filedStamp ? ` · ${row.filedStamp}` : ""}</p>
      <p>Status: {statusLabel(row.status)}</p>
      {(row.history || []).length ? (
        <ol className="grid gap-0.5">
          {row.history.map((item) => (
            <li key={item.label + item.date}>{item.label}: {formatIstDate(item.date)}</li>
          ))}
        </ol>
      ) : null}
      <p className="flex flex-wrap gap-3">
        {row.sourceUrl ? (
          <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="text-chart hover:underline">{row.source}</a>
        ) : (
          <span>{row.source}</span>
        )}
        {row.links.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-chart hover:underline">
            {link.label}
          </a>
        ))}
        <Link to="/s/$symbol" params={{ symbol: row.symbol }} className="text-chart hover:underline">
          Stock
        </Link>
      </p>
    </div>
  );
}
