/** Deduped holdings + one watchlist for the Classic market overview. No prices are invented. */

export type BoardHolding = { symbol: string; name?: string; qty?: number };
export type BoardPort = { id: string; name: string; holdings: BoardHolding[] };
export type BoardQuote = { symbol: string; name?: string; price?: number; previousClose?: number; changePct?: number };
export type BoardScreen = { symbol: string; name?: string; price?: number; changePct?: number };

export type BoardRow = {
  symbol: string;
  name: string;
  qty: number;
  owned: boolean;
  watched: boolean;
  portfolios: { id: string; name: string; qty: number }[];
  last: number | null;
  chg: number | null;
  chgPct: number | null;
  value: number | null;
  source: "quote" | "screen" | "none";
};

export type BoardTab = "all" | "owned" | "watch";

export function boardSymbol(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "")
    .trim();
}

/** Selected portfolios' holdings, unioned with the selected watchlist. One row per symbol. */
export function buildStockBoard(input: {
  portfolios: BoardPort[];
  bookId: string;
  watchSymbols: string[];
  quotes?: BoardQuote[];
  screens?: BoardScreen[];
}): BoardRow[] {
  const books = input.bookId === "all" ? input.portfolios : input.portfolios.filter((p) => p.id === input.bookId);
  const held = new Map<string, BoardRow>();
  for (const p of books) {
    for (const h of p.holdings || []) {
      const symbol = boardSymbol(h.symbol);
      if (!symbol) continue;
      const qty = Number(h.qty) > 0 ? Number(h.qty) : 0;
      const cur = held.get(symbol);
      if (!cur) {
        held.set(symbol, {
          symbol,
          name: h.name || symbol,
          qty,
          owned: qty > 0,
          watched: false,
          portfolios: qty > 0 ? [{ id: p.id, name: p.name, qty }] : [],
          last: null,
          chg: null,
          chgPct: null,
          value: null,
          source: "none",
        });
        continue;
      }
      if (qty > 0) {
        cur.qty += qty;
        cur.owned = true;
        cur.portfolios.push({ id: p.id, name: p.name, qty });
      }
      if (h.name) cur.name = h.name;
    }
  }
  const watch = new Set((input.watchSymbols || []).map(boardSymbol).filter(Boolean));
  for (const symbol of watch) {
    const cur = held.get(symbol);
    if (cur) {
      cur.watched = true;
      continue;
    }
    held.set(symbol, {
      symbol,
      name: symbol,
      qty: 0,
      owned: false,
      watched: true,
      portfolios: [],
      last: null,
      chg: null,
      chgPct: null,
      value: null,
      source: "none",
    });
  }
  const quotes = new Map<string, BoardQuote>();
  for (const q of input.quotes || []) {
    const k = boardSymbol(q.symbol);
    if (k) quotes.set(k, q);
  }
  const screens = new Map<string, BoardScreen>();
  for (const s of input.screens || []) {
    const k = boardSymbol(s.symbol);
    if (k && !screens.has(k)) screens.set(k, s);
  }
  const rows = [...held.values()];
  for (const row of rows) {
    const q = quotes.get(row.symbol);
    const screen = screens.get(row.symbol);
    if (q?.name && row.name === row.symbol) row.name = q.name;
    else if (screen?.name && row.name === row.symbol) row.name = screen.name;
    const qPx = q && Number(q.price) > 0 ? Number(q.price) : null;
    const sPx = screen && Number(screen.price) > 0 ? Number(screen.price) : null;
    if (qPx != null) {
      row.last = qPx;
      row.source = "quote";
      const prev = Number(q?.previousClose);
      const pct = q && Number.isFinite(Number(q.changePct)) ? Number(q.changePct) : null;
      const fromPct = pct != null ? qPx - qPx / (1 + pct / 100) : null;
      const fromPrev = prev > 0 ? qPx - prev : null;
      row.chg =
        fromPct != null && fromPrev != null && Math.abs(fromPrev - fromPct) <= Math.max(0.05, Math.abs(fromPct) * 0.02)
          ? fromPrev
          : (fromPct ?? fromPrev);
      row.chgPct = pct;
    } else if (sPx != null) {
      row.last = sPx;
      row.source = "screen";
      row.chg = null;
      row.chgPct = screen && Number.isFinite(Number(screen.changePct)) ? Number(screen.changePct) : null;
    }
    row.value = row.owned && row.qty > 0 && row.last != null ? row.qty * row.last : null;
  }
  rows.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return rows;
}

export function filterBoard(
  rows: BoardRow[],
  opts: { tab: BoardTab; q?: string; dir?: "any" | "up" | "down"; membership?: "any" | "both" | "multi" | "watch-only" },
): BoardRow[] {
  const q = (opts.q || "").trim().toLowerCase();
  return rows.filter((r) => {
    if (opts.tab === "owned" && !r.owned) return false;
    if (opts.tab === "watch" && !r.watched) return false;
    if (q && !`${r.symbol} ${r.name}`.toLowerCase().includes(q)) return false;
    if (opts.dir === "up" && !(r.chgPct != null && r.chgPct >= 0)) return false;
    if (opts.dir === "down" && !(r.chgPct != null && r.chgPct < 0)) return false;
    if (opts.membership === "both" && !(r.owned && r.watched)) return false;
    if (opts.membership === "multi" && r.portfolios.length < 2) return false;
    if (opts.membership === "watch-only" && !(r.watched && !r.owned)) return false;
    return true;
  });
}

export function boardCounts(rows: BoardRow[]) {
  return {
    all: rows.length,
    owned: rows.filter((r) => r.owned).length,
    watch: rows.filter((r) => r.watched).length,
  };
}

export function pageOf<T>(rows: T[], page: number, size: number) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const safe = Math.min(Math.max(1, page), pages);
  const start = (safe - 1) * size;
  return { rows: rows.slice(start, start + size), page: safe, pages, total, from: total ? start + 1 : 0, to: Math.min(total, start + size) };
}
