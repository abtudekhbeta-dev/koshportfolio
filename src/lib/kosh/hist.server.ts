import { getSql } from "@/lib/db";
import { resolveHistory } from "./yahoo.server.ts";
import { choosePrice, canonSymbol, dayCloses, periodCells, type DayClose, type PeriodCell } from "./seasonality.ts";
import { istDay } from "./engine.ts";
import type { Bar } from "./types.ts";

const YAHOO_PRIORITY = 20;
const AI_PRIORITY = 50;
const FRESH_MS = 18 * 60 * 60 * 1000;

export type StoredSeries = {
  symbol: string;
  days: DayClose[];
  monthly: PeriodCell[];
  quarterly: PeriodCell[];
  source: string;
  note: string;
  aiDays: number;
  conflicts: number;
};

type Row = {
  day: string | Date;
  adj_close: number | string;
  raw_close: number | string | null;
  source: string;
  source_priority: number | string;
  source_type: string;
};

function canon(symbol: string) {
  return canonSymbol(symbol);
}

function exchangeOf(symbol: string) {
  return /\.BO$/i.test(symbol) ? "BSE" : "NSE";
}

function dayText(v: string | Date) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function asOfDay(now = new Date()) {
  return new Date(now.getTime() + 19800 * 1000).toISOString().slice(0, 10);
}

async function readRows(symbol: string): Promise<Row[]> {
  const sql = await getSql();
  return sql.query<Row>(
    `select day, adj_close, raw_close, source, source_priority, source_type
     from hist_prices where symbol = $1 order by day`,
    [canon(symbol)],
  );
}

function rowsToDays(rows: Row[]): DayClose[] {
  return rows
    .map((r) => ({
      day: dayText(r.day),
      adj: Number(r.adj_close),
      raw: Number(r.raw_close) > 0 ? Number(r.raw_close) : Number(r.adj_close),
    }))
    .filter((d) => d.day && d.adj > 0);
}

async function writeDays(
  symbol: string,
  exchange: string,
  days: DayClose[],
  meta: { source: string; sourcePriority: number; sourceType: string; sourceUrl?: string | null; sourceTitle?: string | null; evidence?: string | null },
  existing: Row[],
) {
  const have = new Map(existing.map((r) => [dayText(r.day), r]));
  const sql = await getSql();
  const pending: DayClose[] = [];
  for (const d of days) {
    const prev = have.get(d.day);
    const incoming = {
      value: d.adj,
      source: meta.source,
      sourcePriority: meta.sourcePriority,
      sourceType: meta.sourceType,
    };
    const choice = choosePrice(
      prev
        ? {
            value: Number(prev.adj_close),
            source: prev.source,
            sourcePriority: Number(prev.source_priority),
            sourceType: prev.source_type,
          }
        : null,
      incoming,
    );
    if (choice.conflict && prev) {
      await sql.query(
        `insert into hist_conflicts (symbol, exchange, day, kept_value, other_value, kept_source, other_source, note)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          canon(symbol),
          exchange,
          d.day,
          choice.keep.value,
          choice.keep.source === meta.source ? Number(prev.adj_close) : d.adj,
          choice.keep.source,
          choice.keep.source === meta.source ? prev.source : meta.source,
          "Sources disagree by more than 0.5%. Higher-priority source kept.",
        ],
      );
    }
    if (!prev || choice.keep.source === meta.source) pending.push({ ...d, adj: choice.keep.value });
  }
  const chunk = 200;
  for (let i = 0; i < pending.length; i += chunk) {
    const slice = pending.slice(i, i + chunk);
    const values: unknown[] = [];
    const groups = slice.map((d, n) => {
      const b = n * 16;
      values.push(
        canon(symbol),
        exchange,
        d.day,
        d.o ?? null,
        d.h ?? null,
        d.l ?? null,
        d.raw,
        d.adj,
        d.v ?? null,
        d.raw,
        meta.source,
        meta.sourcePriority,
        meta.sourceType,
        meta.sourceUrl || null,
        meta.sourceTitle || null,
        meta.evidence || null,
      );
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11},$${b + 12},$${b + 13},$${b + 14},$${b + 15},$${b + 16},now(),'accepted')`;
    });
    await sql.query(
      `insert into hist_prices
        (symbol, exchange, day, open, high, low, close, adj_close, volume, raw_close, source, source_priority, source_type, source_url, source_title, evidence, retrieved_at, quality)
       values ${groups.join(",")}
       on conflict (symbol, exchange, day) do update set
         open = excluded.open,
         high = excluded.high,
         low = excluded.low,
         close = excluded.close,
         adj_close = excluded.adj_close,
         volume = excluded.volume,
         raw_close = excluded.raw_close,
         source = excluded.source,
         source_priority = excluded.source_priority,
         source_type = excluded.source_type,
         source_url = excluded.source_url,
         source_title = excluded.source_title,
         evidence = excluded.evidence,
         retrieved_at = now(),
         quality = excluded.quality
       where hist_prices.source_priority >= excluded.source_priority`,
      values,
    );
  }
}

function yahooDays(bars: Bar[]): DayClose[] {
  return dayCloses(bars);
}

function fresh(days: DayClose[], asOf: string) {
  const last = days.at(-1)?.day;
  if (!last) return false;
  const end = Date.parse(asOf + "T00:00:00Z");
  const got = Date.parse(last + "T00:00:00Z");
  return Number.isFinite(end) && Number.isFinite(got) && end - got < 10 * 86400000 && end - got >= 0;
}

const memory = new Map<string, { at: number; series: StoredSeries }>();

export async function ensureSeries(symbol: string, refresh = false): Promise<StoredSeries> {
  const key = canon(symbol);
  const hit = memory.get(key);
  if (!refresh && hit && Date.now() - hit.at < FRESH_MS) return hit.series;
  const asOf = asOfDay();
  let note = "";
  let source = "kosh-db";
  let rows: Row[] = [];
  try {
    rows = await readRows(key);
  } catch (err) {
    note = err instanceof Error ? err.message : "Historical store unavailable.";
  }
  let days = rowsToDays(rows);
  const stale = refresh || !fresh(days, asOf);
  if (stale) {
    try {
      const pack = await resolveHistory(symbol, "max");
      const incoming = pack?.bars?.length ? yahooDays(pack.bars as Bar[]) : [];
      if (incoming.length) {
        try {
          await writeDays(symbol, exchangeOf(symbol), incoming, {
            source: "yahoo",
            sourcePriority: YAHOO_PRIORITY,
            sourceType: "structured",
            sourceUrl: "https://finance.yahoo.com/quote/" + encodeURIComponent(pack?.symbol || symbol),
            sourceTitle: "Yahoo Finance chart",
          }, rows);
          rows = await readRows(key);
          days = rowsToDays(rows);
          source = rows.some((r) => r.source_type === "AI-researched") ? "kosh-db+yahoo" : "yahoo";
          note = note ? note : "Stored after a market-source refresh.";
        } catch {
          days = incoming.length > days.length ? incoming : days;
          source = days === incoming ? "yahoo" : "kosh-db";
          note = "Market source responded. The historical store did not accept the write, so this read is not durable.";
        }
      } else if (!days.length) {
        source = "none";
        note = "No historical series from the stored database or the market source. Nothing was estimated.";
      } else {
        source = "kosh-db";
        note = "Market source returned nothing new. Showing stored history.";
      }
    } catch {
      if (!days.length) {
        source = "none";
        note = "Market source failed and nothing is stored for this symbol. Nothing was estimated.";
      } else {
        source = "kosh-db";
        note = "Market source failed. Showing stored history.";
      }
    }
  } else {
    source = rows.some((r) => r.source_type === "AI-researched") ? "kosh-db" : "kosh-db";
    note = "Stored history.";
  }
  const aiDays = rows.filter((r) => r.source_type === "AI-researched").length;
  const conflicts = await conflictCount(key);
  const series: StoredSeries = {
    symbol: key,
    days,
    monthly: periodCells(days, "monthly", asOf),
    quarterly: periodCells(days, "quarterly", asOf),
    source,
    note,
    aiDays,
    conflicts,
  };
  memory.set(key, { at: Date.now(), series });
  return series;
}

async function conflictCount(symbol: string) {
  try {
    const sql = await getSql();
    const rows = await sql.query<{ n: number | string }>(`select count(*) as n from hist_conflicts where symbol = $1`, [
      canon(symbol),
    ]);
    return Number(rows[0]?.n || 0);
  } catch {
    return 0;
  }
}

export async function ensureMany(symbols: string[], refresh = false): Promise<StoredSeries[]> {
  const out: StoredSeries[] = [];
  let i = 0;
  const list = [...new Set(symbols.map(canon).filter(Boolean))].slice(0, 30);
  async function worker() {
    while (i < list.length) {
      const n = i++;
      out[n] = await ensureSeries(list[n], refresh);
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, list.length) }, worker));
  return out.filter(Boolean);
}

export async function persistSourcedClose(input: {
  symbol: string;
  day: string;
  price: number;
  sourceUrl: string;
  sourceName: string;
  evidence: string;
}): Promise<{ ok: boolean; reason: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day) || !(input.price > 0)) return { ok: false, reason: "Date or price is not usable." };
  if (!/^https?:\/\//i.test(input.sourceUrl)) return { ok: false, reason: "Source URL is missing." };
  try {
    const rows = await readRows(input.symbol);
    await writeDays(
      input.symbol,
      exchangeOf(input.symbol),
      [{ day: input.day, adj: input.price, raw: input.price }],
      {
        source: input.sourceName,
        sourcePriority: AI_PRIORITY,
        sourceType: "AI-researched",
        sourceUrl: input.sourceUrl,
        sourceTitle: input.sourceName,
        evidence: input.evidence,
      },
      rows,
    );
    memory.delete(canon(input.symbol));
    return { ok: true, reason: "Stored. A direct market print still outranks this close." };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Could not store the close." };
  }
}

export function seriesBounds(days: DayClose[]) {
  return { firstDay: days[0]?.day || null, lastDay: days.at(-1)?.day || null };
}

export function yahooStamp(t: number) {
  return istDay(t);
}
