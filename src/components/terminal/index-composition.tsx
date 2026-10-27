import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HeatLegend } from "@/components/charts/stock-treemap";
import { IndexWeightMap, type WeightStock } from "@/components/charts/index-weight-map";
import { LOGO_ATTRIBUTION } from "@/components/company-logo";
import { apiQuotes } from "@/lib/kosh/api";
import type { BasketRow } from "@/lib/kosh/index-basket";
import type { CatalogueIndex } from "@/lib/kosh/nifty-catalogue";
import type { Quote } from "@/lib/kosh/types";
import { bareSymbol } from "@/lib/store";

type Basket = {
  symbol: string;
  name: string;
  rows: BasketRow[];
  weightSum: number;
  source: string | null;
  benchmark: string | null;
  asOf: string | null;
  note: string | null;
  unavailable: string | null;
};

async function loadBasket(symbol: string) {
  const res = await fetch("/api/index-constituents?symbol=" + encodeURIComponent(symbol));
  const data = (await res.json()) as Basket;
  if (!res.ok && !data.unavailable) throw new Error("Holdings feed failed");
  return data;
}

async function loadQuotes(symbols: string[]) {
  const out: Quote[] = [];
  for (let i = 0; i < symbols.length; i += 60) {
    const part = await apiQuotes(symbols.slice(i, i + 60));
    out.push(...part);
  }
  return out;
}

export function IndexComposition({
  row,
  onChart,
  onClose,
}: {
  row: CatalogueIndex;
  onChart: (symbol: string, name: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [equal, setEqual] = useState(false);
  const [logos, setLogos] = useState(true);
  const basket = useQuery({
    queryKey: ["index-basket", row.symbol],
    queryFn: () => loadBasket(row.symbol),
    staleTime: 30 * 60_000,
  });
  const symbols = useMemo(
    () => (basket.data?.rows || []).map((item) => item.symbol).filter((symbol): symbol is string => Boolean(symbol)),
    [basket.data],
  );
  const quotes = useQuery({
    queryKey: ["index-basket-quotes", row.symbol, symbols.join(",")],
    queryFn: () => loadQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 8_000,
    refetchInterval: symbols.length > 80 ? 45_000 : 8_000,
  });
  const bySym = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const quote of quotes.data || []) map.set(bareSymbol(quote.symbol || quote.input), quote);
    return map;
  }, [quotes.data]);
  const rows = basket.data?.rows || [];
  const query = q.trim().toLowerCase();
  const stocks = useMemo(() => {
    return rows.map((item, index): WeightStock => {
      const quote = item.symbol ? bySym.get(item.symbol) : undefined;
      const pct = quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
      const price = quote && quote.price > 0 ? quote.price : null;
      const changeAbs = price != null && pct != null && pct > -100 ? price - price / (1 + pct / 100) : null;
      const dim = Boolean(query) && !item.name.toLowerCase().includes(query) && !(item.symbol || "").toLowerCase().includes(query);
      return {
        id: `${item.symbol || item.name}-${index}`,
        symbol: item.symbol,
        name: item.name,
        sector: item.sector || "—",
        weight: item.weight,
        pct,
        price,
        changeAbs,
        dim,
      };
    });
  }, [rows, query, bySym]);
  const open = (symbol: string, name: string) => {
    onChart(symbol, name);
    onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const data = basket.data;
  const linked = rows.filter((item) => item.symbol).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-fg/30 sm:items-center sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-label={`${row.name} constituents`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[100dvh] w-full flex-col bg-bg sm:h-[min(92dvh,860px)] sm:max-w-6xl sm:rounded-lg sm:shadow-[var(--shadow-border)]">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold tracking-tight">{row.name}</h3>
            <p className="mt-1 text-[12px] text-muted">
              {equal ? "Equal area for every name." : "Tile area is the published share in this index."} Colour is the live session move. Other periods are not on this feed.
            </p>
          </div>
          <button type="button" className="h-8 shrink-0 rounded-sm bg-surface px-2 text-[12px]" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-2">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Find a constituent"
            aria-label="Find a constituent"
            className="h-8 w-48 max-w-full rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)] outline-none"
          />
          <button type="button" className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]" aria-pressed={equal} onClick={() => setEqual((v) => !v)}>
            {equal ? "Index weight" : "Equal size"}
          </button>
          <button type="button" className="h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]" aria-pressed={logos} onClick={() => setLogos((v) => !v)}>
            {logos ? "Hide logos" : "Show logos"}
          </button>
          <button type="button" className="h-8 rounded-sm bg-fg px-3 text-[12px] text-bg" onClick={() => open(row.symbol, row.name)}>
            View index chart
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {basket.isPending ? <p className="text-[13px] text-muted">Loading published holdings…</p> : null}
          {basket.isError ? <p className="text-[13px] text-down">The holdings feed did not answer.</p> : null}
          {data?.unavailable ? <p className="text-[13px] text-muted">{data.unavailable}</p> : null}
          {data && !data.unavailable ? (
            <>
              <p className="mb-2 text-[12px] text-muted">
                {rows.length} names
                {data.weightSum ? ` · weights ${data.weightSum.toFixed(1)}%` : ""}
                {data.asOf ? ` · ${data.asOf}` : ""}
                {data.source ? ` · ${data.source}` : ""}
                {linked < rows.length ? ` · ${rows.length - linked} without an NSE code` : ""}
              </p>
              <div className="overflow-hidden rounded-md bg-surface shadow-[var(--shadow-border)]">
                <IndexWeightMap stocks={stocks} equal={equal} logos={logos} onOpen={open} />
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
                  <HeatLegend metric="Change 1D, %" />
                  <p className="text-[10px] text-muted">{LOGO_ATTRIBUTION}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-subtle">
                The map uses the width of this panel, then grows taller until every name has room. Tile area follows the index share.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
