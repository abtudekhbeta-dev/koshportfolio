import { sortTrades } from "./parse.ts";
import { baseSym } from "./sectors.ts";
import type { PathEvent, PathPoint, TradeLine } from "./types.ts";

export type EodLine = {
  symbol: string;
  name: string;
  qty: number;
  cost: number;
  /** Sells that had no shares left. Quantity was not taken below zero. */
  oversell: number;
};

export type EodBook = {
  day: string;
  lines: EodLine[];
  warnings: string[];
};

/** End-of-day quantities from the trade file. FIFO. No prices and no guessed corporate actions. */
export function eodPositions(trades: TradeLine[], day: string): EodBook {
  const warnings: string[] = [];
  const sorted = sortTrades((trades || []).filter((t) => t.date && t.date <= day && t.qty > 0 && (t.side === 1 || t.side === -1)));
  const lots = new Map<string, { qty: number; cost: number; name: string }[]>();
  const oversell = new Map<string, { qty: number; name: string }>();
  for (const t of sorted) {
    const sym = baseSym(t.symbol);
    const list = lots.get(sym) || [];
    if (t.side > 0) {
      list.push({ qty: t.qty, cost: t.price > 0 ? t.price : 0, name: t.name || sym });
      lots.set(sym, list);
      continue;
    }
    let left = t.qty;
    while (left > 1e-8 && list.length) {
      const lot = list[0];
      const take = Math.min(lot.qty, left);
      lot.qty -= take;
      left -= take;
      if (lot.qty <= 1e-8) list.shift();
    }
    if (left > 1e-6) {
      const prev = oversell.get(sym) || { qty: 0, name: t.name || sym };
      prev.qty += left;
      prev.name = t.name || prev.name;
      oversell.set(sym, prev);
    }
    lots.set(sym, list.filter((l) => l.qty > 1e-8));
  }
  const lines: EodLine[] = [];
  for (const [sym, list] of lots) {
    const qty = list.reduce((s, l) => s + l.qty, 0);
    if (!(qty > 1e-8)) continue;
    const costQty = list.reduce((s, l) => s + l.qty * (l.cost > 0 ? l.cost : 0), 0);
    const priced = list.reduce((s, l) => s + (l.cost > 0 ? l.qty : 0), 0);
    lines.push({
      symbol: sym,
      name: list[0]?.name || sym,
      qty,
      cost: priced > 0 ? costQty / priced : 0,
      oversell: 0,
    });
  }
  for (const [sym, o] of oversell) {
    warnings.push(`${o.name}: sold ${trimQty(o.qty)} more than the file had bought by ${day}. Those shares were not invented.`);
    const line = lines.find((l) => l.symbol === sym);
    if (line) line.oversell = o.qty;
    else lines.push({ symbol: sym, name: o.name, qty: 0, cost: 0, oversell: o.qty });
  }
  lines.sort((a, b) => b.qty - a.qty || a.symbol.localeCompare(b.symbol));
  if (!sorted.length) warnings.push(`No dated trade on or before ${day}.`);
  return { day, lines: lines.filter((l) => l.qty > 1e-8 || l.oversell > 0), warnings };
}

function trimQty(n: number) {
  return Number(n.toFixed(4)).toString();
}

export type RangePreset = "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "ALL" | "CUSTOM";

const SPAN: Record<string, number> = { "1M": 31, "3M": 93, "6M": 186, "1Y": 365, "3Y": 365 * 3, "5Y": 365 * 5 };

function addDays(day: string, n: number) {
  const t = Date.parse(day + "T00:00:00Z");
  if (!Number.isFinite(t)) return day;
  return new Date(t + n * 86400000).toISOString().slice(0, 10);
}

/** First session on/after start, last session on/before end. Indexed figures are not rupees. */
export function slicePath(nav: PathPoint[], preset: RangePreset, custom?: { start?: string; end?: string }) {
  const rows = [...(nav || [])].filter((p) => p.day).sort((a, b) => a.day.localeCompare(b.day));
  if (!rows.length) return { rows: [] as PathPoint[], start: null as string | null, end: null as string | null, rule: "No sessions." };
  const last = rows[rows.length - 1].day;
  const first = rows[0].day;
  let wantStart = first;
  let wantEnd = last;
  if (preset === "CUSTOM") {
    wantStart = custom?.start && custom.start > first ? custom.start : first;
    wantEnd = custom?.end && custom.end < last ? custom.end : last;
    if (wantStart > wantEnd) {
      const s = wantStart;
      wantStart = wantEnd;
      wantEnd = s;
    }
  } else if (preset !== "ALL") {
    wantStart = addDays(last, -(SPAN[preset] || 365));
  }
  const window = rows.filter((p) => p.day >= wantStart && p.day <= wantEnd);
  const used = window.length ? window : rows.filter((p) => p.day <= wantEnd).slice(-1);
  const start = used[0]?.day || null;
  const end = used[used.length - 1]?.day || null;
  return {
    rows: used,
    start,
    end,
    rule: start && end ? `Sessions from ${start} through ${end}. Start is the first session on or after the request. End is the last session on or before it.` : "No sessions in that window.",
  };
}

export function rangeStats(rows: PathPoint[]) {
  if (rows.length < 2) {
    return { twr: null as number | null, bench: null as number | null, excess: null as number | null, maxDd: null as number | null };
  }
  const a = rows[0];
  const b = rows[rows.length - 1];
  const twr = a.unit > 1e-8 ? (b.unit / a.unit - 1) * 100 : null;
  const bench = a.sameUnit != null && b.sameUnit != null && a.sameUnit > 1e-8 ? (b.sameUnit / a.sameUnit - 1) * 100 : null;
  const excess = twr != null && bench != null ? twr - bench : null;
  let peak = rows[0].unit;
  let dd = 0;
  for (const p of rows) {
    if (p.unit > peak) peak = p.unit;
    if (peak > 1e-8) dd = Math.min(dd, p.unit / peak - 1);
  }
  return { twr, bench, excess, maxDd: dd * 100 };
}

export function dayChange(rows: PathPoint[], events: PathEvent[], day: string) {
  const idx = rows.findIndex((p) => p.day === day);
  const point = idx >= 0 ? rows[idx] : null;
  const prev = idx > 0 ? rows[idx - 1] : null;
  const today = (events || []).filter((e) => e.date === day);
  const bought = today.filter((e) => e.side > 0).reduce((s, e) => s + (e.amount || 0), 0);
  const sold = today.filter((e) => e.side < 0).reduce((s, e) => s + (e.amount || 0), 0);
  const delta = point && prev ? point.wealth - prev.wealth : null;
  const priceDriven = delta == null ? null : delta - bought + sold;
  return { point, prev, today, bought, sold, delta, priceDriven };
}
