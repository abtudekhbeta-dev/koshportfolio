import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { apiSearch } from "@/lib/kosh/api";
import { terminalSearch } from "@/lib/kosh/instrument-nav";
import { NIFTY50, searchNse } from "@/lib/kosh/universe";
import { useKosh } from "@/lib/store";
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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

  function go(symbol: string, name?: string) {
    const s = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
    pushRecent({ symbol: s, name: name || s });
    setOpen(false);
    setQ("");
    if (pathname === "/markets" || pathname.startsWith("/markets/")) {
      void nav({ to: "/markets", search: terminalSearch(s, name || s) });
      return;
    }
    void nav({ to: "/s/$symbol", params: { symbol: s } });
  }

  const needle = q.trim().toUpperCase();
  const nseHits = needle ? searchNse(q, 10) : [];
  const nifty = !needle ? NIFTY50.slice(0, 8) : [];
  const nseSyms = new Set(nseHits.map((x) => x.symbol.toUpperCase()));
  const indianHits = hits.filter((h) => {
    const bare = h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
    if (nseSyms.has(bare)) return false;
    return /\.(NS|BO)$/i.test(h.symbol) || /NSE|BSE|India/i.test(h.exch || "");
  });
  const actions = ACTIONS.filter((a) => !needle || a.label.toUpperCase().includes(needle) || a.id.includes(needle.toLowerCase()));
  const shownHits = indianHits.length
    ? indianHits
    : hits.filter((h) => {
        const bare = h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
        return !nseSyms.has(bare) && !/\.KL$/i.test(h.symbol);
      });
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
                {busy ? <div className="px-2 py-2 text-[12px] text-subtle">Looking up…</div> : null}
                {nseHits.length ? (
                  <Command.Group heading="NSE">
                    {nseHits.map((x) => (
                      <Row key={x.symbol} symbol={x.symbol} name={x.name} exch="NSE" onPick={go} />
                    ))}
                  </Command.Group>
                ) : null}
                {nifty.length ? (
                  <Command.Group heading="Nifty 50">
                    {nifty.map((x) => (
                      <Row key={x.symbol} symbol={x.symbol} name={x.name} onPick={go} />
                    ))}
                  </Command.Group>
                ) : null}
                {shownHits.length ? (
                  <Command.Group heading="NSE & BSE">
                    {shownHits.map((h) => (
                      <Row key={"y" + h.symbol} symbol={h.symbol} name={h.name} exch={h.exch} onPick={go} />
                    ))}
                  </Command.Group>
                ) : null}
                {q.trim() && !shownHits.length && !nseHits.length && !busy ? (
                  <div className="px-2 py-3 text-[13px] text-muted">No hits. Try a ticker like RELIANCE, INFY, or a BSE code.</div>
                ) : null}
                {recents.length && !q.trim() ? (
                  <Command.Group heading="Recent">
                    {recents.map((r) => (
                      <Row key={"r" + r.symbol} symbol={r.symbol} name={r.name} onPick={go} />
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
                      <Row key={"w" + s} symbol={s} name={s} onPick={go} />
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
  onPick,
}: {
  symbol: string;
  name: string;
  exch?: string;
  onPick: (s: string, n?: string) => void;
}) {
  const s = symbol.replace(/\.(NS|BO)$/i, "");
  return (
    <Command.Item
      value={s + " " + name}
      onSelect={() => onPick(s, name)}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-[13px]",
        "data-[selected=true]:bg-surface",
      )}
    >
      <span className="font-medium">{s}</span>
      <span className="ml-3 min-w-0 truncate text-muted">
        {name}
        {exch ? ` · ${exch}` : ""}
      </span>
    </Command.Item>
  );
}
