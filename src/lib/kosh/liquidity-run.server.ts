/** Saved liquidity scans. Kept for one reclaim life of the timeframe (10 bars), then dropped. */

import { getSql } from "@/lib/db";
import { laterCandleLikely, mergeStats, reduceScanState, runValidityMs, type ForwardStats, type LiqTimeframe } from "./liquidity";
import { claimScanLock, coordinationFromClaim, releaseScanLock, renewScanLock, saveRunIfOwned, saveRunLocal, scanLockDiagnostic, watchScanLock, SCAN_LOCK_TTL_MS, SCAN_LOCK_RENEW_MS, type RunSnapshot } from "./liquidity-lock";

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
      await sql.query(`create table if not exists liquidity_locks (
        cache_key text primary key,
        owner text not null,
        expires_at bigint not null
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

export function liquidityCacheKey(tf: string, universe: string, symbols: string[], revision = "") {
  const list = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].sort().join(",");
  return `v3|${tf}|${universe}|${revision}|${list}`;
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

const scanOwner = `scan-${process.pid}-${Math.random().toString(36).slice(2, 10)}`;

export type ScanAdmission = "database-coordinated" | "process-local-only" | "busy";

let notedLocal = false;

function noteProcessLocal() {
  if (notedLocal) return;
  notedLocal = true;
  console.warn(scanLockDiagnostic("process-local-only"));
}

/** One key across processes. Busy means another instance holds it. Process-local means the database itself failed. */
export async function tryScanLock(key: string): Promise<ScanAdmission> {
  try {
    await ensureTable();
    const sql = await getSql();
    const result = await claimScanLock(sql, key, scanOwner, Date.now(), SCAN_LOCK_TTL_MS);
    return coordinationFromClaim(result);
  } catch {
    noteProcessLocal();
    return "process-local-only";
  }
}

/** Extend the lease before it expires. Lost means this process must not write the batch. */
export async function renewHeldLock(key: string, now = Date.now()): Promise<"renewed" | "lost"> {
  const sql = await getSql();
  return renewScanLock(sql, key, scanOwner, now, SCAN_LOCK_TTL_MS);
}

export function beginScanRenewal(key: string): { lost: () => boolean; stop: () => void } {
  return watchScanLock(() => renewHeldLock(key), SCAN_LOCK_RENEW_MS);
}

export async function unlockScan(key: string): Promise<void> {
  try {
    const sql = await getSql();
    await releaseScanLock(sql, key, scanOwner);
  } catch {
    /* the expiry still frees a crashed holder */
  }
}

export async function deleteRun(key: string, admission?: ScanAdmission) {
  memory.delete(key);
  if (admission === "process-local-only") return;
  try {
    await ensureTable();
    const sql = await getSql();
    if (admission === "database-coordinated") {
      await sql.query(
        `delete from liquidity_runs
         where cache_key = $1
           and exists (
             select 1 from liquidity_locks
             where cache_key = $1 and owner = $2 and expires_at > $3
           )`,
        [key, scanOwner, Date.now()],
      );
      return;
    }
    await sql.query(`delete from liquidity_runs where cache_key = $1`, [key]);
  } catch {
    /* memory already cleared */
  }
}

function cloneRun(run: StoredRun): StoredRun {
  return { ...run, hits: run.hits.slice(), stats: run.stats.slice(), skipped: run.skipped.slice() };
}

function snapshotOf(key: string, run: StoredRun): RunSnapshot {
  return {
    key,
    cursorAt: run.cursorAt,
    universeSize: run.universeSize,
    done: run.done ? 1 : 0,
    hits: JSON.stringify(run.hits),
    stats: JSON.stringify(run.stats),
    skipped: JSON.stringify(run.skipped),
    skippedN: run.skippedN,
    scannedN: run.scannedN,
    universeNote: run.universeNote,
    timeframeNote: run.timeframeNote,
    adjusted: run.adjusted ? 1 : 0,
    newestBar: run.newestBar,
    asOf: run.asOf,
    validUntil: run.validUntil,
  };
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
  admission: ScanAdmission,
): Promise<{ ok: boolean; lost: boolean; validUntil: number; skippedN: number; scannedN: number; done: boolean }> {
  const loaded = await loadFreshRun(key, tf);
  const prev = loaded ? cloneRun(loaded) : {
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
  const progress = reduceScanState(
    { scannedN: prev.scannedN, skippedN: prev.skippedN },
    { scanned: page.scanned.length, skipped: page.skipped.length, cursor: page.cursor, universeSize: page.universeSize },
    fromCursor,
  );
  prev.scannedN = progress.scannedN;
  prev.skippedN = progress.skippedN;
  for (const row of page.scanned) {
    if (row.to != null && (prev.newestBar == null || row.to > prev.newestBar)) prev.newestBar = row.to;
  }
  const now = Date.now();
  const next: StoredRun = {
    ...prev,
    cursorAt: progress.cursorAt,
    universeSize: page.universeSize,
    done: progress.done,
    universeNote: page.universeNote || prev.universeNote,
    timeframeNote: page.timeframeNote || prev.timeframeNote,
    adjusted: prev.adjusted || page.adjusted,
    asOf: now,
    validUntil: now + runValidityMs(tf),
    newerCandle: false,
  };
  const counts = { validUntil: next.validUntil, skippedN: next.skippedN, scannedN: next.scannedN, done: next.done };
  const snap = snapshotOf(key, next);
  if (admission === "busy") {
    return { ok: false, lost: true, validUntil: loaded?.validUntil ?? 0, skippedN: loaded?.skippedN ?? 0, scannedN: loaded?.scannedN ?? 0, done: loaded?.done ?? false };
  }
  if (admission === "database-coordinated") {
    try {
      await ensureTable();
      const sql = await getSql();
      const wrote = await saveRunIfOwned(sql, scanOwner, now, snap);
      if (wrote === "lost") {
        return { ok: false, lost: true, validUntil: loaded?.validUntil ?? 0, skippedN: loaded?.skippedN ?? 0, scannedN: loaded?.scannedN ?? 0, done: loaded?.done ?? false };
      }
      memory.set(key, next);
      return { ok: true, lost: false, ...counts };
    } catch {
      noteProcessLocal();
      memory.set(key, next);
      return { ok: false, lost: false, ...counts };
    }
  }
  memory.set(key, next);
  try {
    await ensureTable();
    const sql = await getSql();
    const wrote = await saveRunLocal(sql, scanOwner, now, snap);
    if (wrote === "blocked") {
      memory.delete(key);
      const fresh = await loadFreshRun(key, tf);
      return { ok: false, lost: true, validUntil: fresh?.validUntil ?? 0, skippedN: fresh?.skippedN ?? 0, scannedN: fresh?.scannedN ?? 0, done: fresh?.done ?? false };
    }
    return { ok: true, lost: false, ...counts };
  } catch {
    return { ok: false, lost: false, ...counts };
  }
}
