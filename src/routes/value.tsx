import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiScreener } from "@/lib/kosh/api";
import { rankGrowth, type GrowthRow } from "@/lib/kosh/growth-value";
import { listingExchange, listingId } from "@/lib/kosh/listing";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/value")({ ssr: false, component: ValuePage });

type SortKey = "score" | "discount" | "salesCagr3" | "profitCagr3" | "roe" | "mcapCr" | "pe";

function n(v: number | null, d = 1) {
  return v == null ? "—" : v.toFixed(d);
}

function ValuePage() {
  const q = useQuery({ queryKey: ["screener"], queryFn: apiScreener, staleTime: 10 * 60 * 1000 });
  const lists = useKosh((s) => s.watchlists);
  const [exchange, setExchange] = useState<"NSE" | "BSE" | "both">("both");
  const [sector, setSector] = useState("All");
  const [listId, setListId] = useState("all");
  const [cap, setCap] = useState("all");
  const [trap, setTrap] = useState(false);
  const [text, setText] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "score", dir: "desc" });
  const [open, setOpen] = useState<string | null>(null);
  const scored = useMemo(() => rankGrowth(q.data?.rows || []), [q.data]);
  const sectors = useMemo(() => ["All", ...new Set(scored.map((row) => row.sector).filter(Boolean))].sort(), [scored]);
  const watch = new Set((lists.find((row) => row.id === listId)?.symbols || []).map((symbol) => listingId(symbol)));
  const rows = useMemo(() => {
    const needle = text.trim().toUpperCase();
    const filtered = scored.filter((row) => {
      const ex = listingExchange(row.symbol);
      if (exchange === "NSE" && ex === "BSE") return false;
      if (exchange === "BSE" && ex !== "BSE") return false;
      if (sector !== "All" && row.sector !== sector) return false;
      if (listId !== "all" && !watch.has(listingId(row.symbol))) return false;
      if (cap === "large" && !((row.mcapCr || 0) >= 20000)) return false;
      if (cap === "mid" && !((row.mcapCr || 0) >= 5000 && (row.mcapCr || 0) < 20000)) return false;
      if (cap === "small" && !((row.mcapCr || 0) > 0 && (row.mcapCr || 0) < 5000)) return false;
      if (trap && !row.traps.length) return false;
      if (needle && !row.symbol.includes(needle) && !row.name.toUpperCase().includes(needle)) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return a.symbol.localeCompare(b.symbol);
      if (av == null) return 1;
      if (bv == null) return -1;
      return av === bv ? a.symbol.localeCompare(b.symbol) : (av - bv) * dir;
    });
  }, [scored, exchange, sector, listId, watch, cap, trap, text, sort]);

  function head(key: SortKey, label: string) {
    return (
      <th className="px-2 py-2 font-medium">
        <button
          type="button"
          className="inline-flex h-8 items-center"
          onClick={() => setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }))}
        >
          {label}
          {sort.key === key ? (sort.dir === "desc" ? " ↓" : " ↑") : ""}
        </button>
      </th>
    );
  }

  return (
    <AppShell wide>
      <div className="kosh-page grid gap-4">
        <header>
          <h1 className="text-[28px] leading-none font-medium tracking-tight">Undervalued Growth</h1>
          <p className="mt-2 max-w-3xl text-[13px] text-muted">
            Earnings growth with a discount to the same sector’s trailing median. A low P/E by itself does not qualify. The score is the weighted average of the factors that are actually on the card — not a model price.
          </p>
        </header>
        {exchange === "BSE" ? (
          <p className="rounded-lg bg-surface px-4 py-3 text-[13px] text-muted shadow-[var(--shadow-border)]">
            The screener cards are NSE listings. A BSE-only line is not in this universe, so this filter is empty on purpose.
          </p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <input className="h-10 rounded-sm bg-surface px-3 text-[13px] shadow-[var(--shadow-border)] outline-none" placeholder="Company or symbol" aria-label="Search companies" value={text} onChange={(e) => setText(e.target.value)} />
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="Exchange" value={exchange} onChange={(e) => setExchange(e.target.value as typeof exchange)}>
            <option value="both">NSE + BSE</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)}>
            {sectors.map((row) => (
              <option key={row}>{row}</option>
            ))}
          </select>
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="Market cap" value={cap} onChange={(e) => setCap(e.target.value)}>
            <option value="all">Any cap</option>
            <option value="large">Above ₹20,000 Cr</option>
            <option value="mid">₹5,000–20,000 Cr</option>
            <option value="small">Under ₹5,000 Cr</option>
          </select>
          <select className="h-10 rounded-sm bg-surface px-2 text-[13px]" aria-label="Watchlist" value={listId} onChange={(e) => setListId(e.target.value)}>
            <option value="all">All names</option>
            {lists.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
          <button type="button" className={cn("h-10 rounded-sm px-3 text-[13px]", trap ? "bg-surface-2 text-fg" : "bg-surface text-muted")} onClick={() => setTrap((v) => !v)}>
            {trap ? "Value traps only" : "Include value traps"}
          </button>
        </div>
        {q.isPending ? <p className="text-sm text-muted">Loading the screener cards…</p> : null}
        <p className="text-[12px] text-subtle">{rows.length} names. Peer medians need at least four comparable cards. Banks and NBFCs are scored on P/B and ROE, not P/E.</p>
        <div className="overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[1100px] text-left text-[13px]">
            <thead className="text-[11px] tracking-[0.06em] text-subtle uppercase">
              <tr>
                <th className="px-2 py-2 font-medium">Company</th>
                {head("mcapCr", "Cap")}
                <th className="px-2 py-2 font-medium">Price</th>
                {head("pe", "P/E")}
                <th className="px-2 py-2 font-medium">Peer P/E</th>
                {head("discount", "Discount")}
                {head("salesCagr3", "Sales 3Y")}
                {head("profitCagr3", "Profit 3Y")}
                {head("roe", "ROE")}
                <th className="px-2 py-2 font-medium">D/E</th>
                {head("score", "Score")}
                <th className="px-2 py-2 font-medium">Peers</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((row) => (
                <Body key={row.symbol} row={row} open={open === row.symbol} onOpen={() => setOpen(open === row.symbol ? null : row.symbol)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Body({ row, open, onOpen }: { row: GrowthRow; open: boolean; onOpen: () => void }) {
  return (
    <>
      <tr className="border-t border-border">
        <td className="px-2 py-2">
          <Link to="/s/$symbol" params={{ symbol: row.symbol }} className="font-medium hover:text-chart">{row.name}</Link>
          <div className="text-[11px] text-subtle">
            {row.symbol} · {listingExchange(row.symbol)} · {row.sector}
            {row.lens === "bank" ? " · lender lens" : ""}
            {row.traps.length ? ` · ${row.traps.length} trap flag${row.traps.length > 1 ? "s" : ""}` : ""}
          </div>
        </td>
        <td className="px-2 py-2 font-mono">{row.mcapCr == null ? "—" : Math.round(row.mcapCr).toLocaleString("en-IN")}</td>
        <td className="px-2 py-2 font-mono">{row.price ? row.price.toLocaleString("en-IN") : "—"}</td>
        <td className="px-2 py-2 font-mono">{n(row.pe)}</td>
        <td className="px-2 py-2 font-mono">{row.lens === "bank" ? (row.peerPb == null ? "—" : `P/B ${row.peerPb.toFixed(2)}`) : n(row.peerPe)}</td>
        <td className="px-2 py-2 font-mono">{row.discount == null ? "—" : `${(row.discount * 100).toFixed(0)}%`}</td>
        <td className="px-2 py-2 font-mono">{n(row.salesCagr3)}%</td>
        <td className="px-2 py-2 font-mono">{n(row.profitCagr3)}%</td>
        <td className="px-2 py-2 font-mono">{n(row.roe)}%</td>
        <td className="px-2 py-2 font-mono">{n(row.de, 2)}</td>
        <td className="px-2 py-2">
          <button type="button" className="font-mono" onClick={onOpen}>{row.score == null ? "—" : row.score}</button>
          {row.traps.length ? <div className="text-[11px] text-subtle">{row.traps.length} flag{row.traps.length === 1 ? "" : "s"}</div> : null}
        </td>
        <td className="px-2 py-2 font-mono">{row.peerCount}</td>
      </tr>
      {open ? (
        <tr className="border-t border-border bg-bg">
          <td colSpan={12} className="px-3 py-3 text-[13px] text-muted">
            <p>{row.peerBasis}. Weight covered by the score: {row.coveredWeight}%.</p>
            <ul className="mt-2 grid gap-1">
              {row.parts.map((part) => (
                <li key={part.id}>
                  <span className="text-fg">{part.label}</span> {part.score == null ? "not scored" : part.score} · weight {part.weight}. {part.note}
                </li>
              ))}
            </ul>
            {row.traps.length ? <p className="mt-2">Flags: {row.traps.map((item) => item.label).join("; ")}.</p> : <p className="mt-2">No value-trap flag on the figures that are present.</p>}
            <p className="mt-2">
              <Link to="/markets" search={{ view: "terminal", symbol: row.symbol, name: row.name }} className="text-chart hover:underline">Open chart</Link>
            </p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
