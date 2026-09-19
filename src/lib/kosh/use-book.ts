import { useQuery } from "@tanstack/react-query";
import { apiHistories, apiQuotes } from "./api";
import { assembleBook, withSleeveIndex } from "./engine";
import { allSectorBenchSymbols, resolveBench } from "./benchmarks";
import { baseSym } from "./sectors";
import { buildPath } from "./path";
import type { Book, HistoryPack, Portfolio, Quote } from "./types";

function indexPacks(rows: HistoryPack[]) {
  const packs: Record<string, HistoryPack> = {};
  for (const d of rows) {
    packs[d.input] = d;
    packs[d.symbol] = d;
  }
  return packs;
}

function pickPack(packs: Record<string, HistoryPack>, symbol: string) {
  const stem = symbol.replace(/[-_]SM$/i, "");
  return (
    packs[symbol] ||
    packs[baseSym(symbol)] ||
    packs[stem] ||
    Object.values(packs).find((p) => {
      const a = baseSym(p.input);
      const b = baseSym(p.symbol);
      const want = baseSym(symbol);
      const alt = baseSym(stem);
      return a === want || b === want || a === alt || b === alt;
    })
  );
}

export async function loadBook(portfolio: Portfolio, opts?: { sleeves?: boolean }): Promise<Book> {
  const include = portfolio.includeCommodities !== false;
  const holdings = portfolio.holdings;
  const trades = portfolio.trades || [];
  const bench = resolveBench(portfolio.bench);
  const symbols = holdings.map((h) => h.symbol);
  const tradeSyms = trades.map((t) => t.symbol);
  const extra = opts?.sleeves === false ? [] : allSectorBenchSymbols();
  const need = [...new Set([...symbols, ...tradeSyms, bench.symbol, ...extra])];
  const quoteSyms = [...new Set([...symbols, ...tradeSyms])];
  const [quotes, histRows] = await Promise.all([
    quoteSyms.length ? apiQuotes(quoteSyms) : Promise.resolve([]),
    need.length ? apiHistories(need, "max") : Promise.resolve([]),
  ]);
  const quoteMap: Record<string, Quote> = {};
  for (const q of quotes) {
    quoteMap[baseSym(q.input)] = q;
    quoteMap[q.input] = q;
    quoteMap[q.symbol] = q;
  }
  const packs = indexPacks(histRows);
  const histories: Record<string, HistoryPack["bars"]> = {};
  for (const h of holdings) {
    const pack = pickPack(packs, h.symbol);
    histories[h.symbol] = pack?.bars || [];
    if (pack?.price && !quoteMap[baseSym(h.symbol)]?.price) {
      quoteMap[baseSym(h.symbol)] = {
        input: h.symbol,
        symbol: pack.symbol,
        name: pack.name,
        price: pack.price,
        previousClose: pack.previousClose,
        changePct: pack.changePct,
        high52: pack.high52,
        low52: pack.low52,
      };
    }
  }
  const tradeHx: Record<string, HistoryPack["bars"]> = { ...histories };
  for (const s of [...new Set(tradeSyms)]) {
    const pack = pickPack(packs, s);
    tradeHx[s] = pack?.bars || tradeHx[s] || [];
    tradeHx[baseSym(s)] = tradeHx[s];
  }
  const benchPack = pickPack(packs, bench.symbol);
  const book = assembleBook({
    holdings,
    quotes: quoteMap,
    histories,
    packs,
    benchSymbol: bench.symbol,
    benchName: bench.name,
    asOf: new Date().toISOString(),
    hxRange: "max",
    includeCommodities: include,
  });
  if (trades.length) {
    const livePx: Record<string, number> = {};
    for (const [k, q] of Object.entries(quoteMap)) {
      if (q?.price > 0) livePx[baseSym(k)] = q.price;
    }
    book.path = buildPath(trades, tradeHx, benchPack?.bars || [], Date.now(), livePx);
  }
  return book;
}

export function useBook(portfolio: Portfolio | undefined) {
  return useQuery({
    queryKey: [
      "book",
      "v12",
      portfolio?.id,
      portfolio?.bench,
      portfolio?.includeCommodities,
      portfolio?.holdings,
      portfolio?.trades,
    ],
    queryFn: () => loadBook(portfolio!, { sleeves: false }),
    enabled: Boolean(portfolio && portfolio.holdings.length),
    staleTime: 20_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useSleeveBook(book: Book | undefined, enabled: boolean) {
  const q = useQuery({
    queryKey: ["sleeve-hx"],
    queryFn: () => apiHistories(allSectorBenchSymbols(), "max"),
    enabled: Boolean(enabled && book),
    staleTime: 60 * 60 * 1000,
  });
  if (!book) return { book: undefined, pending: q.isPending };
  if (!q.data) return { book, pending: q.isPending };
  return { book: withSleeveIndex(book, q.data), pending: false };
}
