/** Saved liquidity scans. Kept for one reclaim life of the timeframe (10 bars), then dropped. */

import { getSql } from "@/lib/db";
import { laterCandleLikely, mergeStats, runValidityMs, type ForwardStats, type LiqTimeframe } from "./liquidity";

export type StoredHit = Record<string, unknown> & { id: string };

export type StoredRun = {
  cursorAt: number;
  universeSize: number;
  done: boolean;
  hits: StoredHit[];
  stats: ForwardStats[];
  skipped: { symbol: string; reason: string }[];
  skippedN: number;
  scannedN: number;
  universeNote: string;
  timeframeNote: string;
  adjusted: boolean;
  newestBar: number | null;
  asOf: number;
  validUntil: number;
  newerCandle: boolean;
};

const memory = new Map<string, StoredRun>();
let tableReady: Promise<void> | null = null;

function asArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function ensureTable() {
  tableReady ??= getSql()
    .then(async (sql) => {
      await sql.query(`create table if not exists liquidity_runs (
        cache_key text primary key,
        cursor_at integer not null default 0,
        universe_size integer not null default 0,
        done integer not null default 0,
        hits text not null default '[]',
        stats text not null default '[]',
        skipped text not null default '[]',
        skipped_n integer not null default 0,
        scanned_n integer not null default 0,
        universe_note text not null default '',
        timeframe_note text not null default '',
        adjusted integer not null default 0,
        newest_bar bigint,
        as_of bigint not null,
        valid_until bigint not null
      )`);
    })
    .catch((err) => {
      tableReady = null;
      throw err;
    });
  await tableReady;
}

function rowToRun(row: {
  cursor_at: number;
  universe_size: number;
  done: number;
  hits: string;
  stats: string;
  skipped: string;
  skipped_n: number;
  scanned_n: number;
  universe_note: string;
  timeframe_note: string;
  adjusted: number;
  newest_bar: number | null;
  as_of: number | string;
  valid_until: number | string;
}, tf: LiqTimeframe): StoredRun {
  const asOf = Number(row.as_of);
  const validUntil = Number(row.valid_until);
  const newest = row.newest_bar == null ? null : Number(row.newest_bar);
  return {
    cursorAt: Number(row.cursor_at) || 0,
    universeSize: Number(row.universe_size) || 0,
    done: Number(row.done) === 1,
    hits: asArray<StoredHit>(row.hits, []),
    stats: asArray<ForwardStats>(row.stats, []),
    skipped: asArray(row.skipped, []),
    skippedN: Number(row.skipped_n) || 0,
    scannedN: Number(row.scanned_n) || 0,
    universeNote: row.universe_note || "",
    timeframeNote: row.timeframe_note || "",
    adjusted: Number(row.adjusted) === 1,
    newestBar: newest,
    asOf,
    validUntil,
    newerCandle: laterCandleLikely(tf, newest),
  };
}

export function liquidityCacheKey(tf: string, universe: string, symbols: string[]) {
  const list = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].sort().join(",");
  return `${tf}|${universe}|${list}`;
}

export async function loadFreshRun(key: string, tf: LiqTimeframe): Promise<StoredRun | null> {
  const now = Date.now();
  try {
    await ensureTable();
    const sql = await getSql();
    const rows = await sql.query<{
      cursor_at: number;
      universe_size: number;
      done: number;
      hits: string;
      stats: string;
      skipped: string;
      skipped_n: number;
      scanned_n: number;
      universe_note: string;
      timeframe_note: string;
      adjusted: number;
      newest_bar: number | null;
      as_of: number;
      valid_until: number;
    }>(`select * from liquidity_runs where cache_key = $1`, [key]);
    const row = rows[0];
    if (row && Number(row.valid_until) > now) {
      const run = rowToRun(row, tf);
      memory.set(key, run);
      return run;
    }
  } catch {
    /* use the in-process copy */
  }
  const mem = memory.get(key);
  if (!mem || mem.validUntil <= now) return null;
  return { ...mem, newerCandle: laterCandleLikely(tf, mem.newestBar) };
}

export async function deleteRun(key: string) {
  memory.delete(key);
  try {
    await ensureTable();
    const sql = await getSql();
    await sql.query(`delete from liquidity_runs where cache_key = $1`, [key]);
  } catch {
    /* memory already cleared */
  }
}

export async function mergeRun(
  key: string,
  tf: LiqTimeframe,
  page: {
    hits: StoredHit[];
    stats: ForwardStats[];
    skipped: { symbol: string; reason: string }[];
    scanned: { to: number | null }[];
    cursor: number | null;
    universeSize: number;
    universeNote: string;
    timeframeNote: string;
    adjusted: boolean;
  },
  fromCursor: number,
): Promise<{ ok: boolean; validUntil: number }> {
  const prev = (await loadFreshRun(key, tf)) || {
    cursorAt: 0,
    universeSize: page.universeSize,
    done: false,
    hits: [] as StoredHit[],
    stats: [] as ForwardStats[],
    skipped: [] as { symbol: string; reason: string }[],
    skippedN: 0,
    scannedN: 0,
    universeNote: "",
    timeframeNote: "",
    adjusted: false,
    newestBar: null as number | null,
    asOf: 0,
    validUntil: 0,
    newerCandle: false,
  };
  if (fromCursor === 0) {
    prev.hits = [];
    prev.stats = [];
    prev.skipped = [];
    prev.skippedN = 0;
    prev.scannedN = 0;
    prev.newestBar = null;
    prev.adjusted = false;
  }
  const seen = new Set(prev.hits.map((hit) => hit.id));
  for (const hit of page.hits) {
    if (!hit.id || seen.has(hit.id)) continue;
    seen.add(hit.id);
    prev.hits.push(hit);
  }
  prev.stats = mergeStats([...prev.stats, ...page.stats]);
  prev.skipped = prev.skipped.concat(page.skipped).slice(0, 200);
  prev.skippedN += page.skipped.length;
  prev.scannedN += page.scanned.length;
  for (const row of page.scanned) {
    if (row.to != null && (prev.newestBar == null || row.to > prev.newestBar)) prev.newestBar = row.to;
  }
  const now = Date.now();
  const next: StoredRun = {
    ...prev,
    cursorAt: page.cursor ?? page.universeSize,
    universeSize: page.universeSize,
    done: page.cursor == null,
    universeNote: page.universeNote || prev.universeNote,
    timeframeNote: page.timeframeNote || prev.timeframeNote,
    adjusted: prev.adjusted || page.adjusted,
    asOf: now,
    validUntil: now + runValidityMs(tf),
    newerCandle: false,
  };
  memory.set(key, next);
  try {
    await ensureTable();
    const sql = await getSql();
    await sql.query(
      `insert into liquidity_runs (
         cache_key, cursor_at, universe_size, done, hits, stats, skipped, skipped_n, scanned_n,
         universe_note, timeframe_note, adjusted, newest_bar, as_of, valid_until
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       on conflict (cache_key) do update set
         cursor_at = excluded.cursor_at,
         universe_size = excluded.universe_size,
         done = excluded.done,
         hits = excluded.hits,
         stats = excluded.stats,
         skipped = excluded.skipped,
         skipped_n = excluded.skipped_n,
         scanned_n = excluded.scanned_n,
         universe_note = excluded.universe_note,
         timeframe_note = excluded.timeframe_note,
         adjusted = excluded.adjusted,
         newest_bar = excluded.newest_bar,
         as_of = excluded.as_of,
         valid_until = excluded.valid_until`,
      [
        key,
        next.cursorAt,
        next.universeSize,
        next.done ? 1 : 0,
        JSON.stringify(next.hits),
        JSON.stringify(next.stats),
        JSON.stringify(next.skipped),
        next.skippedN,
        next.scannedN,
        next.universeNote,
        next.timeframeNote,
        next.adjusted ? 1 : 0,
        next.newestBar,
        next.asOf,
        next.validUntil,
      ],
    );
    return { ok: true, validUntil: next.validUntil };
  } catch {
    return { ok: false, validUntil: next.validUntil };
  }
}
