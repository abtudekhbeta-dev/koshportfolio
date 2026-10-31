import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiQuotes, apiSearch } from "@/lib/kosh/api";
import { fmtPct, fmtPx } from "@/lib/kosh/engine";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteMap } from "@/lib/kosh/market-data";
import { universeName } from "@/lib/kosh/universe";
import { listingExchange, listingId, listingLabel } from "@/lib/kosh/listing";
import { useKosh } from "@/lib/store";
import { CompanyLogo } from "@/components/company-logo";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Source = { kind: "watch"; id: string } | { kind: "book"; id: string };

function moveText(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const body = Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n > 0) return `+${body}`;
  if (n < 0) return `-${body}`;
  return body;
}

export function LedgerWatch({
  active,
  open,
  onPick,
  onMenu,
}: {
  active: string;
  open: boolean;
  onPick: (symbol: string, name?: string) => void;
  onMenu: (info: { x: number; y: number; symbol: string; name: string; price: number | null }) => void;
}) {
  const lists = useKosh((s) => s.watchlists);
  const activeId = useKosh((s) => s.activeWatchId);
  const watch = useKosh((s) => s.watch);
  const ports = useKosh((s) => s.portfolios);
  const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
  const toggleWatch = useKosh((s) => s.toggleWatch);
  const moveWatch = useKosh((s) => s.moveWatch);
  const [override, setOverride] = useState<Source | null>(null);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<"none" | "last" | "pct">("none");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<{ symbol: string; name: string; exch: string }[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const bookFallback = ports.find((port) => port.holdings.length);
  const source: Source =
    override ||
    (watch.length ? { kind: "watch", id: activeId } : bookFallback ? { kind: "book", id: bookFallback.id } : { kind: "watch", id: activeId });

  const book = source.kind === "book" ? ports.find((row) => row.id === source.id) : null;
  const symbols = useMemo(() => {
    const raw =
      source.kind === "book"
        ? (book?.holdings || []).map((holding) => listingId(holding.symbol))
        : source.id === activeId
          ? watch
          : lists.find((list) => list.id === source.id)?.symbols || [];
    const out: string[] = [];
    for (const symbol of raw) {
      const id = listingId(symbol);
      if (id && !out.includes(id)) out.push(id);
    }
    return out;
  }, [source, book, watch, lists, activeId]);

  const quotes = useQuery({
    queryKey: ["ledger-watch", symbols.join(",")],
    queryFn: () => apiQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 10_000,
    refetchInterval: isIstSession() ? 20_000 : 120_000,
  });
  const map = useMemo(() => quoteMap(quotes.data), [quotes.data]);
  const needle = filter.trim().toLowerCase();
  const rows = symbols
    .map((symbol, index) => {
      const quote = map.get(symbol);
      const price = quote && quote.price > 0 ? quote.price : null;
      const prev = quote && quote.previousClose > 0 ? quote.previousClose : null;
      const pct = quote && prev != null && Number.isFinite(quote.changePct) ? quote.changePct : null;
      return {
        index,
        symbol,
        name: quote?.name || universeName(symbol) || symbol,
        price,
        move: price != null && prev != null ? price - prev : null,
        pct,
        missing: quote?.error,
      };
    })
    .filter((row) => !needle || `${row.symbol} ${row.name}`.toLowerCase().includes(needle));
  if (sort === "last") rows.sort((a, b) => (b.price || -1) - (a.price || -1));
  if (sort === "pct") rows.sort((a, b) => (b.pct || -999) - (a.pct || -999));

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 1) {
      setHits([]);
      return;
    }
    try {
      const found = await apiSearch(value.trim());
      setHits(found.slice(0, 6).map((row) => ({ symbol: row.symbol, name: row.name, exch: row.exch })));
    } catch {
      setHits([]);
    }
  }

  return (
    <aside className={cn("lt-watch", open && "on")} data-ledger-watch>
      <div className="lt-watch-head">
        <select
          aria-label="Watchlist"
          value={source.kind === "watch" ? `w:${source.id}` : `b:${source.id}`}
          onChange={(e) => {
            const [kind, id] = e.target.value.split(":");
            if (kind === "w") {
              setOverride({ kind: "watch", id });
              setActiveWatchId(id);
            } else setOverride({ kind: "book", id });
          }}
        >
          {lists.map((list) => (
            <option key={list.id} value={`w:${list.id}`}>
              {list.name}
            </option>
          ))}
          {ports.map((port) => (
            <option key={port.id} value={`b:${port.id}`}>
              {port.name}
            </option>
          ))}
        </select>
        <span className="lt-muted">{symbols.length}</span>
      </div>
      <div style={{ position: "relative", padding: "8px 8px 0" }}>
        <input
          aria-label="Filter or add a symbol"
          placeholder="Filter or add…"
          value={query || filter}
          onChange={(e) => {
            const value = e.target.value;
            setFilter(value);
            void search(value);
          }}
        />
        {hits.length ? (
          <div className="lt-hits" style={{ position: "absolute", left: 8, right: 8 }}>
            {hits.map((hit) => (
              <button
                key={hit.symbol}
                type="button"
                onClick={() => {
                  if (source.kind === "watch" && !symbols.includes(hit.symbol)) toggleWatch(hit.symbol);
                  onPick(hit.symbol, hit.name);
                  setHits([]);
                  setQuery("");
                  setFilter("");
                }}
              >
                <b>{listingLabel(hit.symbol)}</b>
                <span className="lt-muted">{hit.exch || listingExchange(hit.symbol)}</span>
                <span className="lt-muted">{hit.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="lt-cols">
        <span>Symbol</span>
        <button type="button" onClick={() => setSort(sort === "last" ? "none" : "last")}>
          Last
        </button>
        <span>Chg</span>
        <button type="button" onClick={() => setSort(sort === "pct" ? "none" : "pct")}>
          Chg%
        </button>
      </div>
      <div className="lt-watch-scroll">
        {quotes.isPending && symbols.length ? <p className="lt-note">Loading quotes…</p> : null}
        {!symbols.length ? <p className="lt-note">This list is empty. Search above to add a symbol.</p> : null}
        {symbols.length && !rows.length ? <p className="lt-note">No names match that filter.</p> : null}
        {quotes.isError ? <p className="lt-note">Quotes did not load. Symbols stay on the list.</p> : null}
        {rows.map((row) => (
          <Tooltip key={row.symbol} content={`${row.name || row.symbol} · ${row.symbol}`}>
            <button
              type="button"
              className="lt-watch-row"
              aria-current={row.symbol === active}
              aria-label={`${row.symbol}${row.name ? `, ${row.name}` : ""}`}
              draggable={source.kind === "watch" && sort === "none" && !needle}
              onDragStart={() => setDragFrom(row.index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom == null || source.kind !== "watch") return;
                moveWatch(dragFrom, row.index);
                setDragFrom(null);
              }}
              onClick={() => onPick(row.symbol, row.name)}
              onContextMenu={(e) => {
                e.preventDefault();
                onMenu({ x: e.clientX, y: e.clientY, symbol: row.symbol, name: row.name, price: row.price });
              }}
            >
            <span className="lt-sym">
              <CompanyLogo symbol={row.symbol} name={row.name} size={18} />
              <em>{listingLabel(row.symbol)}</em>
              {listingExchange(row.symbol) === "BSE" ? <span className="lt-muted">BSE</span> : null}
            </span>
            <span>{row.price == null ? "—" : fmtPx(row.price)}</span>
            <span className={row.move == null || row.move === 0 ? "lt-muted" : row.move > 0 ? "lt-up" : "lt-down"}>{moveText(row.move)}</span>
            <span className={row.pct == null || row.pct === 0 ? "lt-muted" : row.pct > 0 ? "lt-up" : "lt-down"}>
              {row.pct == null ? "—" : fmtPct(row.pct)}
            </span>
          </button>
          </Tooltip>
        ))}
      </div>
      <p className="lt-note">Quotes are the same Yahoo feed as the rest of Kosh. A dash means the price was not in the response.</p>
    </aside>
  );
}
