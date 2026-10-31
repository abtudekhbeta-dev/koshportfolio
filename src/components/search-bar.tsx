import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { apiSearch } from "@/lib/kosh/api";
import { terminalSearch } from "@/lib/kosh/instrument-nav";
import { listingExchange, listingId, listingLabel } from "@/lib/kosh/listing";
import { NIFTY50, searchNse } from "@/lib/kosh/universe";
import { useKosh } from "@/lib/store";
import { CompanyLogo } from "@/components/company-logo";
import { canOpenStock } from "@/components/stock-link";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "screener", label: "Open Screener", to: "/screen" as const },
  { id: "compare", label: "Open Compare", to: "/compare" as const },
  { id: "watch", label: "Open Watch", to: "/watch" as const },
  { id: "markets", label: "Open Terminal", to: "/markets" as const },
  { id: "portfolios", label: "Open Portfolios", to: "/app" as const },
];

export function SearchBar({
  hint = "/",
  dense = false,
  placeholder = "Search any NSE or BSE name…",
}: {
  hint?: string;
  dense?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string; exch: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const recents = useKosh((s) => s.recents);
  const watch = useKosh((s) => s.watch);
  const portfolios = useKosh((s) => s.portfolios);
  const pushRecent = useKosh((s) => s.pushRecent);
  const timer = useRef<number>(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.clearTimeout(timer.current);
    const v = q.trim();
    if (v.length < 1) {
      setHits([]);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(() => {
      void apiSearch(v)
        .then((rows) => setHits(rows))
        .catch(() => setHits([]))
        .finally(() => setBusy(false));
    }, 160);
  }, [q, open]);

  const chartIntent = useRef(false);

  function remember(symbol: string, name?: string) {
    const id = listingId(symbol);
    pushRecent({ symbol: id, name: name || listingLabel(id) });
    setOpen(false);
    setQ("");
    return id;
  }

  function openStock(symbol: string, name?: string) {
    if (chartIntent.current) {
      chartIntent.current = false;
      openChart(symbol, name);
      return;
    }
    const id = remember(symbol, name);
    if (!canOpenStock(id)) {
      void nav({ to: "/markets", search: terminalSearch(id, name || listingLabel(id)) });
      return;
    }
    void nav({ to: "/s/$symbol", params: { symbol: id } });
  }

  function openChart(symbol: string, name?: string) {
    const id = remember(symbol, name);
    void nav({ to: "/markets", search: terminalSearch(id, name || listingLabel(id)) });
  }

  const needle = q.trim().toUpperCase();
  const nifty = !needle ? NIFTY50.slice(0, 8) : [];
  const shownHits = hits.length
    ? hits.filter((h) => !/\.KL$/i.test(h.symbol))
    : needle
      ? searchNse(q, 8).map((x) => ({ symbol: x.symbol, name: x.name, exch: "NSE" }))
      : [];
  const actions = ACTIONS.filter((a) => !needle || a.label.toUpperCase().includes(needle) || a.id.includes(needle.toLowerCase()));
  const portHits = portfolios
    .filter((p) => !needle || p.name.toUpperCase().includes(needle))
    .slice(0, needle ? 8 : 4);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-w-0 w-full items-center gap-2 rounded-sm bg-bg-elevated px-3 text-left text-muted shadow-[var(--shadow-border)] hover:text-fg",
          dense ? "h-8 text-[13px]" : "h-11 text-[14px]",
        )}
      >
        <Search className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{placeholder}</span>
        <kbd className="hidden rounded-[4px] bg-bg px-1.5 font-mono text-[10px] text-subtle sm:inline">{hint}</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="kosh-overlay absolute inset-0 bg-black/55" onClick={() => setOpen(false)} />
          <div className="kosh-search-dialog absolute left-1/2 top-[12vh] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
            <Command label="Search" shouldFilter={false}>
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="size-4 text-subtle" />
                <Command.Input
                  value={q}
                  onValueChange={setQ}
                  placeholder="Ticker or company — RELIANCE, Infosys, a BSE name, gold"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                  autoFocus
                />
              </div>
              <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
                {busy ? <div className="px-2 py-2 text-[12px] text-subtle">Looking up NSE and BSE…</div> : null}
                {shownHits.length ? (
                  <Command.Group heading={needle ? "Instruments" : "Results"}>
                    {shownHits.map((h) => (
                      <Row
                        key={h.symbol + h.exch}
                        symbol={h.symbol}
                        name={h.name}
                        exch={h.exch}
                        onOpen={openStock}
                        onChart={openChart}
                        armChart={() => {
                          chartIntent.current = true;
                        }}
                      />
                    ))}
                  </Command.Group>
                ) : null}
                {nifty.length ? (
                  <Command.Group heading="Nifty 50">
                    {nifty.map((x) => (
                      <Row key={x.symbol} symbol={x.symbol} name={x.name} exch="NSE" onOpen={openStock} onChart={openChart} armChart={() => { chartIntent.current = true; }} />
                    ))}
                  </Command.Group>
                ) : null}
                {q.trim() && !shownHits.length && !busy ? (
                  <div className="px-2 py-3 text-[13px] text-muted">No hits. Try a ticker like RELIANCE, INFY, or a BSE code.</div>
                ) : null}
                {recents.length && !q.trim() ? (
                  <Command.Group heading="Recent">
                    {recents.map((r) => (
                      <Row key={"r" + r.symbol} symbol={r.symbol} name={r.name} exch={listingExchange(r.symbol)} onOpen={openStock} onChart={openChart} armChart={() => { chartIntent.current = true; }} />
                    ))}
                  </Command.Group>
                ) : null}
                {actions.length ? (
                  <Command.Group heading="Go to">
                    {actions.map((a) => (
                      <Command.Item
                        key={a.id}
                        value={a.label}
                        onSelect={() => {
                          setOpen(false);
                          setQ("");
                          void nav({ to: a.to });
                        }}
                        className="flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-surface"
                      >
                        {a.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                {portHits.length ? (
                  <Command.Group heading="Portfolios">
                    {portHits.map((p) => (
                      <Command.Item
                        key={p.id}
                        value={"portfolio " + p.name}
                        onSelect={() => {
                          setOpen(false);
                          setQ("");
                          void nav({ to: "/p/$id", params: { id: p.id } });
                        }}
                        className="flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-surface"
                      >
                        {p.name}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                {watch.length && !q.trim() ? (
                  <Command.Group heading="Watch">
                    {watch.slice(0, 8).map((s) => (
                      <Row key={"w" + s} symbol={s} name={listingLabel(s)} exch={listingExchange(s)} onOpen={openStock} onChart={openChart} armChart={() => { chartIntent.current = true; }} />
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>
            </Command>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({
  symbol,
  name,
  exch,
  onOpen,
  onChart,
  armChart,
}: {
  symbol: string;
  name: string;
  exch?: string;
  onOpen: (s: string, n?: string) => void;
  onChart: (s: string, n?: string) => void;
  armChart: () => void;
}) {
  const id = listingId(symbol, exch);
  const label = listingLabel(id);
  const badge = listingExchange(id, exch) === "OTHER" ? exch || "" : listingExchange(id, exch);
  return (
    <Command.Item
      value={id + " " + name + " " + badge}
      onSelect={() => onOpen(id, name)}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-[13px]",
        "data-[selected=true]:bg-surface",
      )}
    >
      <CompanyLogo symbol={label} name={name} size={18} />
      <span className="shrink-0 font-medium">{label}</span>
      <span className="min-w-0 flex-1 truncate text-muted">{name}</span>
      {badge ? <span className="shrink-0 font-mono text-[10px] tracking-wide text-subtle">{badge}</span> : null}
      <button
        type="button"
        aria-label={`Open ${label} chart`}
        className="h-[18px] shrink-0 rounded-sm border border-border px-1.5 text-[11px] leading-none text-chart"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          armChart();
          onChart(id, name);
        }}
      >
        Chart
      </button>
    </Command.Item>
  );
}
