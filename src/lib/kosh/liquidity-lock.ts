/** Database lock for one liquidity scan key. Expired rows can be taken again after a crash. */

export type LockSql = {
  query(text: string, params?: unknown[]): Promise<{ owner?: string; cache_key?: string }[]>;
};

export const SCAN_LOCK_TTL_MS = 3 * 60 * 1000;
/** Renew well inside the lease. A missed renewal must expire before the next one is due. */
export const SCAN_LOCK_RENEW_MS = 60 * 1000;

export type ScanCoordination = "database-coordinated" | "process-local-only" | "lock-lost" | "busy";

/** Map a claim result. Unavailable is this process only — other instances are not excluded. */
export function coordinationFromClaim(result: "acquired" | "busy" | "unavailable"): Exclude<ScanCoordination, "lock-lost"> {
  if (result === "acquired") return "database-coordinated";
  if (result === "busy") return "busy";
  return "process-local-only";
}

/** Server log line. Not for the scan page. */
export function scanLockDiagnostic(state: ScanCoordination): string {
  if (state === "database-coordinated") return "Liquidity scan is database-coordinated for this book.";
  if (state === "process-local-only") return "Liquidity scan lock unavailable; this process only. Other instances are not excluded.";
  if (state === "lock-lost") return "Liquidity scan lock lost; this batch was not saved.";
  return "Liquidity scan lock is held by another owner.";
}

export async function claimScanLock(
  sql: LockSql,
  key: string,
  owner: string,
  now = Date.now(),
  ttlMs = SCAN_LOCK_TTL_MS,
): Promise<"acquired" | "busy"> {
  const rows = await sql.query(
    `insert into liquidity_locks (cache_key, owner, expires_at)
     values ($1, $2, $3)
     on conflict (cache_key) do update
       set owner = excluded.owner, expires_at = excluded.expires_at
       where liquidity_locks.expires_at <= $4 or liquidity_locks.owner = $2
     returning owner`,
    [key, owner, now + ttlMs, now],
  );
  return rows[0]?.owner === owner ? "acquired" : "busy";
}

/**
 * Extend a lease this owner still holds. A zero-row update means the lock expired
 * or another owner took it. This does not insert a row and does not take a lock back.
 */
export async function renewScanLock(
  sql: LockSql,
  key: string,
  owner: string,
  now = Date.now(),
  ttlMs = SCAN_LOCK_TTL_MS,
): Promise<"renewed" | "lost"> {
  const rows = await sql.query(
    `update liquidity_locks
       set expires_at = $3
     where cache_key = $1 and owner = $2 and expires_at > $4
     returning owner`,
    [key, owner, now + ttlMs, now],
  );
  return rows[0]?.owner === owner ? "renewed" : "lost";
}

/** Release only the lock this owner holds. A stolen lock is left alone. */
export async function releaseScanLock(sql: LockSql, key: string, owner: string): Promise<void> {
  await sql.query(`delete from liquidity_locks where cache_key = $1 and owner = $2`, [key, owner]);
}

export type RunSnapshot = {
  key: string;
  cursorAt: number;
  universeSize: number;
  done: number;
  hits: string;
  stats: string;
  skipped: string;
  skippedN: number;
  scannedN: number;
  universeNote: string;
  timeframeNote: string;
  adjusted: number;
  newestBar: number | null;
  asOf: number;
  validUntil: number;
};

const RUN_INSERT = `cache_key, cursor_at, universe_size, done, hits, stats, skipped, skipped_n, scanned_n,
         universe_note, timeframe_note, adjusted, newest_bar, as_of, valid_until`;

const RUN_SELECT = `$1, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17`;

const RUN_UPDATE = `cursor_at = excluded.cursor_at,
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
         valid_until = excluded.valid_until`;

function runParams(row: RunSnapshot, owner: string, now: number): unknown[] {
  return [
    row.key,
    owner,
    now,
    row.cursorAt,
    row.universeSize,
    row.done,
    row.hits,
    row.stats,
    row.skipped,
    row.skippedN,
    row.scannedN,
    row.universeNote,
    row.timeframeNote,
    row.adjusted,
    row.newestBar,
    row.asOf,
    row.validUntil,
  ];
}

/**
 * Insert or replace the saved run only while this owner holds an unexpired lock.
 * The lock row is locked in the same statement as the write, so a takeover cannot land between the check and the save.
 */
export async function saveRunIfOwned(sql: LockSql, owner: string, now: number, row: RunSnapshot): Promise<"saved" | "lost"> {
  const rows = await sql.query(
    `with held as (
       select cache_key from liquidity_locks
       where cache_key = $1 and owner = $2 and expires_at > $3
       for update
     )
     insert into liquidity_runs (${RUN_INSERT})
     select ${RUN_SELECT}
     from held
     on conflict (cache_key) do update set
       ${RUN_UPDATE}
     where exists (
       select 1 from liquidity_locks
       where liquidity_locks.cache_key = liquidity_runs.cache_key
         and liquidity_locks.owner = $2
         and liquidity_locks.expires_at > $3
     )
     returning cache_key`,
    runParams(row, owner, now),
  );
  return rows.length > 0 ? "saved" : "lost";
}

/**
 * Process-local save. Refuses when a different owner holds a live lock.
 * Used only after the database could not coordinate the scan.
 */
export async function saveRunLocal(sql: LockSql, owner: string, now: number, row: RunSnapshot): Promise<"saved" | "blocked"> {
  const rows = await sql.query(
    `with open as (
       select 1 as ok
       where not exists (
         select 1 from liquidity_locks
         where cache_key = $1 and owner <> $2 and expires_at > $3
       )
     )
     insert into liquidity_runs (${RUN_INSERT})
     select ${RUN_SELECT}
     from open
     on conflict (cache_key) do update set
       ${RUN_UPDATE}
     where not exists (
       select 1 from liquidity_locks
       where liquidity_locks.cache_key = liquidity_runs.cache_key
         and liquidity_locks.owner <> $2
         and liquidity_locks.expires_at > $3
     )
     returning cache_key`,
    runParams(row, owner, now),
  );
  return rows.length > 0 ? "saved" : "blocked";
}

/** Call renew on an interval. A thrown renew is not proof the lock moved; the save checks again. */
export function watchScanLock(
  renew: () => Promise<"renewed" | "lost">,
  intervalMs = SCAN_LOCK_RENEW_MS,
): { lost: () => boolean; stop: () => void } {
  let lost = false;
  const timer = setInterval(() => {
    void renew()
      .then((result) => {
        if (result === "lost") lost = true;
      })
      .catch(() => {
        /* the following save still has to prove ownership */
      });
  }, intervalMs);
  timer.unref?.();
  return {
    lost: () => lost,
    stop: () => clearInterval(timer),
  };
}
