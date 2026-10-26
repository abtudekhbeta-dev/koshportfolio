import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Info, MoreHorizontal, Plus, Route as PathIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AddHoldings } from "@/components/add-holdings";
import { MixNudge } from "@/components/mix-nudge";
import { PortfolioHeatmap } from "@/components/portfolio-heatmap";
import { Button } from "@/components/ui/button";
import { apiQuotes } from "@/lib/kosh/api";
import { fmtInr, fmtPct } from "@/lib/kosh/engine";
import type { HeatInput } from "@/lib/kosh/holding-heat";
import { quoteMap } from "@/lib/kosh/market-data";
import { isIstSession } from "@/lib/kosh/market-hours";
import { boardLine, combineLines, nextCombine, resolveCombine, type BoardLine, type BoardTotals } from "@/lib/kosh/portfolio-board";
import { sectorOf } from "@/lib/kosh/sectors";
import { useKosh } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Holding, Portfolio, Quote } from "@/lib/kosh/types";

export const Route = createFileRoute("/app")({ ssr: false, component: Home });

const RECENT_MS = 14 * 24 * 60 * 60 * 1000;
/** Muted blues for the allocation bar only. Not used as portfolio identity. */
const ALLOC = ["#3d6ad6", "#8ea2c4", "#5d7194", "#c3cedd", "#2f4c7a", "#6e86ab"];

function quoteKey(s: string) {
  return s.toUpperCase().replace(/\.(NS|BO)$/i, "");
}

function when(ms?: number) {
  if (!ms) return null;
  const d = new Date(ms);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function stamp(p: Portfolio) {
  return p.updatedAt || p.imports?.[0]?.at || 0;
}

function mono(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const raw = name.replace(/[^A-Za-z0-9]/g, "");
  return (raw.slice(0, 2) || "•").toUpperCase();
}

function signedInr(n: number) {
  if (n > 0) return `+${fmtInr(n)}`;
  return fmtInr(n);
}

function pnlPct(unreal: number, invested: number) {
  if (!(invested > 0) || !Number.isFinite(unreal)) return null;
  return (unreal / invested) * 100;
}

function cmpDesc(a: number | null, b: number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}

function linesFor(holdings: Holding[], quotes: Quote[]): BoardLine[] {
  const map = quoteMap(quotes);
  const out: BoardLine[] = [];
  for (const h of holdings) {
    if (!(h.qty > 0)) continue;
    const q = map.get(quoteKey(h.symbol));
    const price = q && q.price > 0 && Number.isFinite(q.price) ? q.price : null;
    const changePct = price != null && q && Number.isFinite(q.changePct) ? q.changePct : null;
    out.push(boardLine({ symbol: h.symbol, qty: h.qty, avg: h.avg, price, changePct }));
  }
  return out;
}

function Pulse({ className }: { className: string }) {
  return <span className={cn("inline-block animate-pulse rounded bg-surface-2", className)} />;
}

function Home() {
  const ports = useKosh((s) => s.portfolios);
  const combineIds = useKosh((s) => s.combineIds);
  const setCombineIds = useKosh((s) => s.setCombineIds);
  const renamePortfolio = useKosh((s) => s.renamePortfolio);
  const duplicatePortfolio = useKosh((s) => s.duplicatePortfolio);
  const deletePortfolio = useKosh((s) => s.deletePortfolio);
  const navigate = useNavigate();
  const [renameId, setRenameId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "value" | "day" | "name">("updated");
  const [filter, setFilter] = useState<"all" | "up" | "down" | "recent">("all");

  const symbols = useMemo(
    () => [...new Set(ports.flatMap((p) => p.holdings.filter((h) => h.qty > 0).map((h) => h.symbol)))].sort(),
    [ports],
  );
  const quotes = useQuery({
    queryKey: ["home-quotes", symbols],
    queryFn: () => apiQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 15_000,
    refetchInterval: isIstSession() ? 20_000 : 120_000,
  });

  const liveIds = ports.map((p) => p.id);
  const picked = resolveCombine(combineIds, liveIds);
  const pickedSet = new Set(picked);
  const ready = quotes.isSuccess && !!quotes.data;
  const totals = useMemo(() => {
    const byId = new Map<string, BoardTotals>();
    if (!quotes.data) return byId;
    for (const p of ports) byId.set(p.id, combineLines(linesFor(p.holdings, quotes.data)));
    return byId;
  }, [ports, quotes.data]);
  const combined = useMemo(() => {
    if (!quotes.data || !picked.length) return null;
    const lines = ports.filter((p) => pickedSet.has(p.id)).flatMap((p) => linesFor(p.holdings, quotes.data || []));
    return combineLines(lines);
  }, [ports, quotes.data, picked.join("|")]);
  const heatRows = useMemo(() => {
    if (!quotes.data) return [] as HeatInput[];
    const out: HeatInput[] = [];
    for (const id of picked) {
      const portfolio = ports.find((row) => row.id === id);
      if (!portfolio) continue;
      const meta = new Map(portfolio.holdings.map((holding) => [quoteKey(holding.symbol), holding]));
      for (const line of linesFor(portfolio.holdings, quotes.data)) {
        const holding = meta.get(quoteKey(line.symbol));
        out.push({
          bookId: portfolio.id,
          bookName: portfolio.name,
          symbol: line.symbol,
          name: holding?.name || line.symbol,
          qty: line.qty,
          price: line.price,
          changePct: line.changePct,
          sector: holding?.sector || sectorOf(line.symbol),
        });
      }
    }
    return out;
  }, [ports, quotes.data, picked.join("|")]);

  useEffect(() => {
    if (!menuId) return;
    function onDoc(event: MouseEvent) {
      const node = event.target as HTMLElement | null;
      if (node?.closest("[data-card-menu]")) return;
      setMenuId(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuId(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuId]);

  const needle = query.trim().toUpperCase();
  const shown = ports
    .filter((p) => {
      if (needle) {
        const hit =
          p.name.toUpperCase().includes(needle) ||
          p.holdings.some((h) => h.symbol.toUpperCase().includes(needle) || (h.name || "").toUpperCase().includes(needle));
        if (!hit) return false;
      }
      if (filter === "all") return true;
      const t = totals.get(p.id);
      if (filter === "up") return t?.dayAbs != null && t.dayAbs > 0;
      if (filter === "down") return t?.dayAbs != null && t.dayAbs < 0;
      const at = stamp(p);
      return at > 0 && Date.now() - at < RECENT_MS;
    })
    .slice()
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "updated") return stamp(b) - stamp(a);
      const ta = totals.get(a.id);
      const tb = totals.get(b.id);
      if (sort === "value") return cmpDesc(ta?.value ?? null, tb?.value ?? null);
      return cmpDesc(ta?.dayPct ?? null, tb?.dayPct ?? null);
    });

  const slices = picked
    .map((id, index) => {
      const p = ports.find((row) => row.id === id);
      const t = totals.get(id);
      const value = t && t.unpriced === 0 ? t.value : null;
      return { id, name: p?.name || "Portfolio", value, color: ALLOC[index % ALLOC.length] };
    })
    .filter((row) => row.value != null && row.value > 0);
  const allocOk = picked.length > 0 && slices.length === picked.length;
  const allocSum = allocOk ? slices.reduce((sum, row) => sum + (row.value || 0), 0) : 0;

  const notes: string[] = [];
  if (ports.length && !picked.length) notes.push("No portfolio is included. Combined figures stay blank until you select one.");
  else if (ports.length && picked.length && quotes.isPending) notes.push("Prices are loading. Missing prices are not shown as zero.");
  else if (ports.length && quotes.isError) notes.push("Prices did not load. Combined figures are withheld.");
  else if (combined) {
    if (combined.unpriced) notes.push(`${combined.unpriced} position${combined.unpriced === 1 ? "" : "s"} ha${combined.unpriced === 1 ? "s" : "ve"} no price and ${combined.unpriced === 1 ? "is" : "are"} left out of market value.`);
    if (combined.costMissing) notes.push("Invested amount and unrealised P&L are withheld until every selected position has a cost.");
    if (combined.dayMissing) notes.push(`Day change leaves out ${combined.dayMissing} priced position${combined.dayMissing === 1 ? "" : "s"} with no daily move.`);
  }
  const explain = [
    "Selection changes this summary only. Holdings are not edited.",
    picked.length === ports.length && ports.length ? "All portfolios are included. A new portfolio joins this total." : picked.length ? `${picked.length} of ${ports.length} portfolios are included. A new portfolio stays out until you select it.` : "Nothing is included.",
    "Market value sums priced positions. It is not invested capital.",
    "Unrealised P&L is market value minus cost, and only when every selected position has both.",
    "Day percent uses the combined previous value, not an average of each portfolio’s percent.",
    "Positions count every line. Unique names count a security once even if it sits in two portfolios.",
    "Books are valued in rupees. XIRR is not combined on this page.",
    ...notes,
  ].join(" ");

  function toggle(id: string) {
    setCombineIds(nextCombine(combineIds, liveIds, id));
  }

  const chips = (
    <div className="flex flex-wrap items-center gap-1.5">
      {ports.map((p) => {
        const on = pickedSet.has(p.id);
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(p.id)}
            className={cn(
              "inline-flex h-8 max-w-full items-center gap-1.5 rounded-md border px-2 text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "border-accent/40 bg-accent/10 text-fg" : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            <span className={cn("grid size-3.5 place-items-center rounded-[3px] border", on ? "border-accent bg-accent text-accent-fg" : "border-border-strong")}>
              {on ? <Check className="size-2.5" /> : null}
            </span>
            <span className="max-w-28 truncate">{p.name}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="h-8 rounded-md px-2 text-[12px] font-medium text-chart hover:bg-surface-2 disabled:opacity-40"
        disabled={combineIds == null}
        onClick={() => setCombineIds(null)}
      >
        Select all
      </button>
      <button
        type="button"
        className="h-8 rounded-md px-2 text-[12px] font-medium text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
        disabled={picked.length === 0}
        onClick={() => setCombineIds([])}
      >
        Clear
      </button>
    </div>
  );

  return (
    <AppShell wide>
      <div className="portfolio-board bg-bg px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">Portfolios</h1>
            <p className="mt-0.5 text-[13px] text-muted">Track and analyse your investments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ports.length ? <MixNudge where="app" variant="button" /> : null}
            <AddHoldings
              trigger={
                <Button type="button" className="min-h-10">
                  <Plus className="size-4" />
                  New portfolio
                </Button>
              }
            />
          </div>
        </div>

        {ports.length ? (
          <section className="rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] sm:px-4" aria-label="Combined portfolio">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold">Combined portfolio</h2>
                  <span className="text-[12px] text-muted">
                    {picked.length === 0 ? "None selected" : picked.length === ports.length ? `All ${ports.length} selected` : `${picked.length} of ${ports.length} selected`}
                  </span>
                  <button type="button" className="grid size-6 place-items-center rounded-full text-subtle hover:bg-bg hover:text-fg" title={explain} aria-label="How these totals are calculated">
                    <Info className="size-3.5" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                  <Metric
                    label="Market value"
                    hint="Quantity times the latest price. A position with no price is left out, not counted as zero."
                    value={!picked.length ? null : ready ? combined?.value ?? null : undefined}
                    pending={!!picked.length && quotes.isPending}
                    sub={
                      !picked.length || !ready || combined?.dayAbs == null || combined.dayPct == null ? (
                        picked.length && ready ? <span className="text-subtle">Day change unavailable</span> : null
                      ) : (
                        <span className={combined.dayAbs > 0 ? "text-up" : combined.dayAbs < 0 ? "text-down" : "text-muted"}>
                          <span className="sr-only">{combined.dayAbs > 0 ? "Up " : combined.dayAbs < 0 ? "Down " : "Flat "}</span>
                          {fmtPct(combined.dayPct)} ({signedInr(combined.dayAbs)})
                        </span>
                      )
                    }
                  />
                  <Metric
                    label="Invested amount"
                    hint="Quantity times average cost. Withheld if any selected position has no cost. Unrealised P&L is market value minus that cost."
                    value={!picked.length ? null : ready ? combined?.invested ?? null : undefined}
                    pending={!!picked.length && quotes.isPending}
                    sub={
                      ready && picked.length && combined?.unreal != null && combined.invested != null ? (
                        <span className={combined.unreal > 0 ? "text-up" : combined.unreal < 0 ? "text-down" : "text-muted"}>
                          Unrealised {signedInr(combined.unreal)}
                          {pnlPct(combined.unreal, combined.invested) != null ? ` (${fmtPct(pnlPct(combined.unreal, combined.invested))})` : ""}
                        </span>
                      ) : picked.length && ready ? (
                        <span className="text-subtle">Unrealised P&L withheld</span>
                      ) : null
                    }
                  />
                  <div>
                    <div className="text-[11px] text-muted">Portfolios</div>
                    <div className="mt-1 font-mono text-[20px] leading-none tabular">{picked.length} / {ports.length}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted">Positions</div>
                    <div className="mt-1 font-mono text-[20px] leading-none tabular">
                      {!picked.length || !ready ? "—" : combined?.positions ?? "—"}
                    </div>
                    {picked.length && ready && combined ? (
                      <div className="mt-1 text-[11px] text-subtle">{combined.names} unique {combined.names === 1 ? "name" : "names"}</div>
                    ) : null}
                  </div>
                </div>
                {allocOk && allocSum > 0 ? (
                  <div className="mt-3">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label="Share of combined market value">
                      {slices.map((row) => (
                        <div
                          key={row.id}
                          style={{ width: `${((row.value || 0) / allocSum) * 100}%`, background: row.color }}
                          title={`${row.name} ${(((row.value || 0) / allocSum) * 100).toFixed(1)}%`}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {slices.map((row) => (
                        <span key={row.id} className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <span className="size-1.5 rounded-full" style={{ background: row.color }} />
                          <span className="max-w-24 truncate">{row.name}</span>
                          <span className="tabular">{(((row.value || 0) / allocSum) * 100).toFixed(0)}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {notes.length ? <p className="mt-2 text-[11px] leading-snug text-subtle">{notes.join(" ")}</p> : null}
              </div>
              <div className="lg:max-w-md lg:pt-1">
                <details className="sm:hidden">
                  <summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-lg border border-border px-3 text-[13px] marker:content-none [&::-webkit-details-marker]:hidden">
                    Choose portfolios
                    <span className="text-[12px] text-muted">{picked.length} / {ports.length}</span>
                  </summary>
                  <div className="mt-2">{chips}</div>
                </details>
                <div className="hidden sm:block">{chips}</div>
              </div>
            </div>
          </section>
        ) : null}

        {ports.length ? (
          <PortfolioHeatmap
            rows={quotes.isPending && !quotes.data ? null : heatRows}
            pending={quotes.isPending && !quotes.data && symbols.length > 0}
            failed={quotes.isError}
            selectedCount={picked.length}
            portfolioCount={ports.length}
          />
        ) : null}

        {ports.length ? (
          <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search portfolio name or symbol…"
              aria-label="Search portfolios"
              className="h-9 w-full rounded-md bg-surface px-3 text-[13px] shadow-[var(--shadow-border)] outline-none lg:max-w-sm"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {(
                [
                  ["all", "All portfolios"],
                  ["up", "Positive today"],
                  ["down", "Negative today"],
                  ["recent", "Recently updated"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "h-9 shrink-0 rounded-md px-3 text-[12px] font-medium",
                    filter === id ? "bg-accent text-accent-fg" : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort portfolios"
              className="h-9 rounded-md bg-surface px-3 text-[12px] shadow-[var(--shadow-border)] lg:ml-auto"
            >
              <option value="updated">Last updated</option>
              <option value="value">Market value</option>
              <option value="day">Day change</option>
              <option value="name">Name</option>
            </select>
          </div>
        ) : null}

        <div className="mt-2.5 grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ports.length ? (
            shown.length ? (
              shown.map((p) => (
                <PortfolioCard
                  key={p.id}
                  portfolio={p}
                  totals={totals.get(p.id) || null}
                  pending={quotes.isPending}
                  failed={quotes.isError}
                  menuOpen={menuId === p.id}
                  renaming={renameId === p.id}
                  onOpen={() => void navigate({ to: "/p/$id", params: { id: p.id } })}
                  onMenu={() => setMenuId((id) => (id === p.id ? null : p.id))}
                  onRenameStart={() => {
                    setMenuId(null);
                    setRenameId(p.id);
                  }}
                  onRename={(name) => {
                    if (name) renamePortfolio(p.id, name);
                    setRenameId(null);
                  }}
                  onDuplicate={() => {
                    const suggested = `${p.name} Copy`;
                    const raw = window.prompt("Name for the copy. Holdings and settings are copied. Path history is not.", suggested);
                    if (raw == null) return;
                    const name = raw.trim();
                    if (!name) return;
                    const id = duplicatePortfolio(p.id, name);
                    if (!id) {
                      window.alert("That name is already used. Nothing was copied.");
                      return;
                    }
                    toast.success(`${name} added. Open it from the list.`);
                  }}
                  onDelete={() => {
                    if (confirm("Delete this portfolio?")) deletePortfolio(p.id);
                  }}
                />
              ))
            ) : (
              <div className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)] sm:col-span-2 xl:col-span-3">
                {filter === "recent"
                  ? "No portfolio was updated in the last 14 days."
                  : filter === "up"
                    ? quotes.isPending
                      ? "Day change is still loading."
                      : "No portfolio is up today."
                    : filter === "down"
                      ? quotes.isPending
                        ? "Day change is still loading."
                        : "No portfolio is down today."
                      : "No portfolio matches that search."}
              </div>
            )
          ) : (
            <div className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-border)] sm:col-span-2 xl:col-span-3">
              No portfolios yet. Create one from a broker file or add names by hand.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  pending,
  sub,
  hint,
}: {
  label: string;
  value: number | null | undefined;
  pending?: boolean;
  sub?: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted" title={hint}>{label}</div>
      <div className="mt-1 font-mono text-[20px] leading-none tabular sm:text-[22px]" data-metric={label}>
        {pending ? <Pulse className="h-5 w-24" /> : value == null ? "—" : fmtInr(value)}
      </div>
      <div className="mt-1 min-h-4 text-[11px] tabular">{sub}</div>
    </div>
  );
}

function PortfolioCard({
  portfolio: p,
  totals,
  pending,
  failed,
  menuOpen,
  renaming,
  onOpen,
  onMenu,
  onRenameStart,
  onRename,
  onDuplicate,
  onDelete,
}: {
  portfolio: Portfolio;
  totals: BoardTotals | null;
  pending: boolean;
  failed: boolean;
  menuOpen: boolean;
  renaming: boolean;
  onOpen: () => void;
  onMenu: () => void;
  onRenameStart: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const last = p.imports?.[0];
  const dayKnown = totals?.dayAbs != null && totals.dayPct != null;
  const unrealPct = totals?.unreal != null && totals.invested != null ? pnlPct(totals.unreal, totals.invested) : null;
  const count = totals ? totals.positions : p.holdings.filter((h) => h.qty > 0).length;
  const dayTone = !dayKnown ? "text-subtle" : totals!.dayAbs! > 0 ? "text-up" : totals!.dayAbs! < 0 ? "text-down" : "text-muted";
  return (
    <article
      data-portfolio-card={p.id}
      role="link"
      tabIndex={0}
      aria-label={`Open ${p.name}`}
      onClick={(event) => {
        const node = event.target as HTMLElement;
        if (node.closest("a, button, input, label, textarea, select")) return;
        onOpen();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen();
      }}
      className="flex cursor-pointer flex-col rounded-lg bg-surface px-3 py-3 outline-none shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted">{mono(p.name)}</span>
        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              aria-label={`Rename ${p.name}`}
              className="w-full bg-transparent text-[14px] font-semibold outline-none"
              defaultValue={p.name}
              onClick={(event) => event.stopPropagation()}
              onBlur={(event) => onRename(event.target.value.trim())}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") (event.target as HTMLInputElement).blur();
                if (event.key === "Escape") onRename("");
              }}
            />
          ) : (
            <div className="truncate text-[14px] font-semibold leading-tight">{p.name}</div>
          )}
          <p className="mt-0.5 truncate text-[11px] text-muted">
            {count} holding{count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="relative" data-card-menu onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            aria-label={`More actions for ${p.name}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="grid size-7 place-items-center rounded-md text-muted hover:bg-bg hover:text-fg"
            onClick={onMenu}
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen ? (
            <div role="menu" className="absolute right-0 z-30 mt-1 grid w-44 gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
              <AddHoldings portfolioId={p.id} intent="update" trigger={<button type="button" role="menuitem" className="h-8 rounded-md px-2 text-left text-[12px] hover:bg-bg">Update holdings</button>} />
              <AddHoldings portfolioId={p.id} trigger={<button type="button" role="menuitem" className="h-8 rounded-md px-2 text-left text-[12px] hover:bg-bg">Add holdings</button>} />
              <Link to="/p/$id/path" params={{ id: p.id }} role="menuitem" className="flex h-8 items-center rounded-md px-2 text-[12px] hover:bg-bg">
                Import path
              </Link>
              <button type="button" role="menuitem" className="h-8 rounded-md px-2 text-left text-[12px] hover:bg-bg" onClick={onRenameStart}>
                Rename
              </button>
              <button type="button" role="menuitem" className="h-8 rounded-md px-2 text-left text-[12px] text-down hover:bg-bg" onClick={onDelete}>
                Delete
              </button>
              {last ? (
                <p className="px-2 py-1 text-[10px] leading-snug text-subtle">
                  Last import {when(last.at)} · {last.accepted} accepted
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0 font-mono text-[22px] leading-none tabular">
          {pending ? <Pulse className="h-6 w-28" /> : failed || totals?.value == null ? "—" : fmtInr(totals.value)}
        </div>
        <div className={cn("shrink-0 text-right text-[12px] leading-tight tabular", dayTone)}>
          {pending ? (
            <Pulse className="h-3 w-24" />
          ) : dayKnown ? (
            <>
              <span className="sr-only">{totals!.dayAbs! > 0 ? "Up " : totals!.dayAbs! < 0 ? "Down " : "Flat "}</span>
              {signedInr(totals!.dayAbs!)}
              <span className="mt-0.5 block">{fmtPct(totals!.dayPct)}</span>
            </>
          ) : (
            "Day unavailable"
          )}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-border/80 pt-2.5">
        <div className="min-w-0 text-[11px] leading-snug text-muted">
          <div className="truncate">{totals?.invested != null ? `Invested ${fmtInr(totals.invested)}` : pending ? "Invested …" : "Cost not on file"}</div>
          <div className={cn("truncate tabular", totals?.unreal == null ? "" : totals.unreal > 0 ? "text-up" : totals.unreal < 0 ? "text-down" : "")}>
            {totals?.unreal != null ? (
              <>
                Unrealised {signedInr(totals.unreal)}
                {unrealPct != null ? ` · ${fmtPct(unrealPct)}` : ""}
              </>
            ) : pending ? (
              "Unrealised …"
            ) : (
              "Unrealised P&L withheld"
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
          <Link to="/p/$id/path" params={{ id: p.id }} title="Path" className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] text-chart hover:bg-bg">
            <PathIcon className="size-3.5" />
            Path
          </Link>
          <button
            type="button"
            title="Duplicate holdings and settings. Path history is not copied."
            className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] text-muted hover:bg-bg hover:text-fg"
            onClick={onDuplicate}
          >
            <Copy className="size-3.5" />
            Duplicate
          </button>
        </div>
      </div>
    </article>
  );
}
