export type BookHolding = { symbol: string; name: string; qty: number; avg: number | null };

export type PlottedHolding = BookHolding & { bookWeight: number | null };

/** Turns a portfolio ticker into the form the rotation registry uses. It does not invent a listing. */
export function normalizeTicker(raw: string) {
  let symbol = raw.trim().toUpperCase().replace(/\s+/g, "");
  symbol = symbol.replace(/(\.NS|\.NSE|\.BO)$/i, "");
  if (symbol.startsWith("NSE:")) symbol = symbol.slice(4);
  return symbol;
}

/**
 * Current holdings only. Duplicates are combined. The chart cap is applied here.
 * Book weight uses quantity times average cost, and is never an RRG input.
 */
export function selectHoldings(holdings: BookHolding[], cap = 24) {
  const merged = new Map<string, BookHolding>();
  let duplicates = 0;
  for (const row of holdings) {
    if (!row.qty) continue;
    const symbol = normalizeTicker(row.symbol);
    if (!symbol) continue;
    const prev = merged.get(symbol);
    if (prev) {
      duplicates += 1;
      const qty = prev.qty + row.qty;
      const cost = (prev.avg == null ? 0 : prev.avg * prev.qty) + (row.avg == null ? 0 : row.avg * row.qty);
      prev.qty = qty;
      prev.avg = prev.avg == null && row.avg == null ? null : qty ? cost / qty : null;
      if (!prev.name) prev.name = row.name;
    } else {
      merged.set(symbol, { symbol, name: row.name || symbol, qty: row.qty, avg: row.avg });
    }
  }
  const ranked = [...merged.values()].sort((a, b) => book(b) - book(a) || Math.abs(b.qty) - Math.abs(a.qty) || a.symbol.localeCompare(b.symbol));
  const total = ranked.reduce((sum, row) => sum + (row.avg == null ? 0 : Math.abs(row.qty) * row.avg), 0);
  const weighted = ranked.map((row) => ({
    ...row,
    bookWeight: total > 0 && row.avg != null ? (Math.abs(row.qty) * row.avg) / total : null,
  }));
  return { plotted: weighted.slice(0, cap), overflow: weighted.slice(cap), duplicates };
}

function book(row: BookHolding) {
  if (row.avg != null) return Math.abs(row.qty) * row.avg;
  return Math.abs(row.qty);
}
