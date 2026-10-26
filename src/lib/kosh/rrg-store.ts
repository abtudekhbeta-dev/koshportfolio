import { assessSeries, type ClosePrint, type SeriesQuality } from "./rrg.ts";

export type ExtractedSeries = {
  symbol: string;
  rows: ClosePrint[];
  source: {
    dataset: string;
    url: string;
    licence: string;
    adjustment: "raw-unadjusted";
    files: { name: string; sha256: string }[];
    note: string;
  };
};

export type PublishedSeries = ExtractedSeries & { quality: SeriesQuality; missingWhilePeersTraded: string[] };

/** Publish already-extracted closes. Does not fill gaps or join two symbols. */
export function publishExtracts(extracts: ExtractedSeries[]): { series: PublishedSeries[]; failures: { symbol: string; error: string }[] } {
  const failures: { symbol: string; error: string }[] = [];
  const clean: { symbol: string; rows: ClosePrint[]; source: ExtractedSeries["source"] }[] = [];
  for (const item of extracts) {
    const byDate = new Map<string, number>();
    let conflict = "";
    for (const row of item.rows) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(row.close) || row.close <= 0) continue;
      const prior = byDate.get(row.date);
      if (prior != null && Math.abs(prior - row.close) > 1e-6) conflict = `${item.symbol} has two closes on ${row.date}.`;
      else byDate.set(row.date, row.close);
    }
    if (conflict) {
      failures.push({ symbol: item.symbol, error: conflict });
      continue;
    }
    clean.push({
      symbol: item.symbol,
      source: item.source,
      rows: [...byDate.entries()].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  }
  const peerDates = new Map<string, Set<string>>();
  for (const item of clean) {
    const key = item.source.dataset;
    const dates = peerDates.get(key) || new Set<string>();
    for (const row of item.rows) dates.add(row.date);
    peerDates.set(key, dates);
  }
  const series = clean.map((item) => {
    const own = new Set(item.rows.map((row) => row.date));
    const from = item.rows[0]?.date;
    const to = item.rows[item.rows.length - 1]?.date;
    const peers = peerDates.get(item.source.dataset) || new Set<string>();
    const missingWhilePeersTraded = [...peers].filter((date) => date >= (from || "") && date <= (to || "") && !own.has(date)).sort();
    return { ...item, quality: assessSeries(item.rows), missingWhilePeersTraded };
  });
  series.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return { series, failures };
}
