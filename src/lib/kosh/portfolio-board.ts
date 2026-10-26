/** Combined portfolio figures. Missing prices and costs stay missing. Day percent is not an average of percents. */

import { saneDayPnl } from "./engine.ts";

export type BoardLine = {
  symbol: string;
  qty: number;
  avg: number | null;
  price: number | null;
  changePct: number | null;
};

export type BoardTotals = {
  positions: number;
  names: number;
  value: number | null;
  unpriced: number;
  invested: number | null;
  costMissing: number;
  unreal: number | null;
  dayAbs: number | null;
  dayPct: number | null;
  dayMissing: number;
};

export function boardLine(input: {
  symbol: string;
  qty: number;
  avg?: number | null;
  price?: number | null;
  changePct?: number | null;
}): BoardLine {
  const price = input.price != null && input.price > 0 && Number.isFinite(input.price) ? input.price : null;
  const changePct = input.changePct != null && Number.isFinite(input.changePct) ? input.changePct : null;
  const avg = input.avg != null && input.avg > 0 && Number.isFinite(input.avg) ? input.avg : null;
  return { symbol: input.symbol, qty: input.qty, avg, price, changePct };
}

export function combineLines(lines: BoardLine[]): BoardTotals {
  const names = new Set<string>();
  let value = 0;
  let valued = 0;
  let unpriced = 0;
  let invested = 0;
  let costKnown = 0;
  let costMissing = 0;
  let dayAbs = 0;
  let dayPrev = 0;
  let dayKnown = 0;
  let dayMissing = 0;
  for (const line of lines) {
    if (!(line.qty > 0)) continue;
    names.add(line.symbol.toUpperCase().replace(/\.(NS|BO)$/i, ""));
    if (line.price == null) unpriced += 1;
    else {
      const mark = line.qty * line.price;
      value += mark;
      valued += 1;
      if (line.changePct == null) dayMissing += 1;
      else {
        const day = saneDayPnl(mark, line.changePct);
        const prev = mark - day.abs;
        if (prev > 0) {
          dayAbs += day.abs;
          dayPrev += prev;
          dayKnown += 1;
        }
      }
    }
    if (line.avg == null) costMissing += 1;
    else {
      invested += line.qty * line.avg;
      costKnown += 1;
    }
  }
  const costComplete = costMissing === 0 && costKnown > 0;
  const priceComplete = unpriced === 0 && valued > 0;
  return {
    positions: lines.filter((line) => line.qty > 0).length,
    names: names.size,
    value: valued > 0 ? value : null,
    unpriced,
    invested: costComplete ? invested : null,
    costMissing,
    unreal: costComplete && priceComplete ? value - invested : null,
    dayAbs: dayKnown > 0 ? dayAbs : null,
    dayPct: dayKnown > 0 && dayPrev > 0 ? (dayAbs / dayPrev) * 100 : null,
    dayMissing,
  };
}

/** Last shared closes, valued with quantity. Missing history returns null rather than a flat line. */
export function valueSpark(
  lines: { symbol: string; qty: number }[],
  series: { symbol: string; bars: { t: number; c: number }[] }[],
): number[] | null {
  const needed = lines.filter((line) => line.qty > 0);
  if (!needed.length) return null;
  const maps = needed.map((line) => {
    const key = line.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");
    const pack = series.find((row) => row.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "") === key);
    if (!pack?.bars?.length) return null;
    const points = new Map<number, number>();
    for (const bar of pack.bars) {
      if (bar.c > 0) points.set(bar.t, bar.c);
    }
    if (!points.size) return null;
    return { qty: line.qty, points };
  });
  if (maps.some((row) => row == null)) return null;
  const ready = maps as { qty: number; points: Map<number, number> }[];
  let times = [...ready[0].points.keys()];
  for (const row of ready.slice(1)) times = times.filter((t) => row.points.has(t));
  times.sort((a, b) => a - b);
  const last = times.slice(-24);
  if (last.length < 8) return null;
  return last.map((t) => ready.reduce((sum, row) => sum + row.qty * (row.points.get(t) || 0), 0));
}

/** null means every current portfolio. An explicit list is a subset and ignores deleted ids. */
export function resolveCombine(saved: string[] | null, liveIds: string[]): string[] {
  if (saved == null) return liveIds.slice();
  const live = new Set(liveIds);
  return saved.filter((id) => live.has(id));
}

/** Toggle one portfolio. Returns null when the result is every current portfolio, so a later book joins the total. */
export function nextCombine(saved: string[] | null, liveIds: string[], id: string): string[] | null {
  if (!liveIds.includes(id)) return saved == null ? null : saved.slice();
  const selected = new Set(resolveCombine(saved, liveIds));
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  if (selected.size === liveIds.length) return null;
  return liveIds.filter((x) => selected.has(x));
}
