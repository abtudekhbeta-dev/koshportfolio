/** Database lock for one liquidity scan key. Expired rows can be taken again after a crash. */

export type LockSql = {
  query(text: string, params?: unknown[]): Promise<{ owner: string }[]>;
};

export const SCAN_LOCK_TTL_MS = 3 * 60 * 1000;

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

/** Release only the lock this owner holds. A stolen lock is left alone. */
export async function releaseScanLock(sql: LockSql, key: string, owner: string): Promise<void> {
  await sql.query(`delete from liquidity_locks where cache_key = $1 and owner = $2`, [key, owner]);
}
