import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { createScanGate } from "./liquidity.ts";
import {
  claimScanLock,
  coordinationFromClaim,
  releaseScanLock,
  renewScanLock,
  saveRunIfOwned,
  saveRunLocal,
  scanLockDiagnostic,
  watchScanLock,
  type LockSql,
  type RunSnapshot,
} from "./liquidity-lock.ts";

async function db(): Promise<LockSql & { close: () => Promise<void> }> {
  const pg = new PGlite();
  await pg.exec(`create table liquidity_locks (
    cache_key text primary key,
    owner text not null,
    expires_at bigint not null
  )`);
  await pg.exec(`create table liquidity_runs (
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
  return {
    query: async (text, params) => (await pg.query(text, params)).rows as { owner?: string; cache_key?: string }[],
    close: () => pg.close(),
  };
}

function client(sql: LockSql): LockSql {
  return { query: (text, params) => sql.query(text, params) };
}

function snap(key: string, cursorAt: number): RunSnapshot {
  return {
    key,
    cursorAt,
    universeSize: 40,
    done: 0,
    hits: "[]",
    stats: "[]",
    skipped: "[]",
    skippedN: 0,
    scannedN: cursorAt,
    universeNote: "",
    timeframeNote: "",
    adjusted: 0,
    newestBar: null,
    asOf: 1,
    validUntil: 2,
  };
}

async function savedCursor(sql: LockSql, key: string): Promise<number | null> {
  const rows = await sql.query(`select cursor_at from liquidity_runs where cache_key = $1`, [key]);
  const cursor = (rows[0] as { cursor_at?: number } | undefined)?.cursor_at;
  return cursor == null ? null : Number(cursor);
}

async function lockOwner(sql: LockSql, key: string): Promise<{ owner: string; expiresAt: number } | null> {
  const rows = await sql.query(`select owner, expires_at from liquidity_locks where cache_key = $1`, [key]);
  const row = rows[0] as { owner?: string; expires_at?: number | string } | undefined;
  if (!row?.owner) return null;
  return { owner: row.owner, expiresAt: Number(row.expires_at) };
}

describe("scan lock", () => {
  it("blocks a second instance, expires after a crash, and does not release someone else's lock", async () => {
    const sql = await db();
    const key = "v3|1D|nifty50|book|";
    assert.equal(await claimScanLock(sql, key, "a", 1_000, 500), "acquired");
    assert.equal(await claimScanLock(sql, key, "b", 1_200, 500), "busy");
    assert.equal(await claimScanLock(sql, "other", "a", 1_000, 500), "acquired");
    assert.equal(await claimScanLock(sql, "other", "a", 1_200, 500), "acquired");
    assert.equal(await claimScanLock(sql, "other", "b", 1_400, 500), "busy");
    assert.equal(await claimScanLock(sql, key, "b", 1_600, 500), "acquired");
    await releaseScanLock(sql, key, "a");
    assert.equal(await claimScanLock(sql, key, "c", 1_700, 500), "busy");
    await releaseScanLock(sql, key, "b");
    assert.equal(await claimScanLock(sql, key, "c", 1_800, 500), "acquired");
    await sql.close();
  });

  it("keeps the second owner out past the original expiry while the lease is renewed", async () => {
    const sql = await db();
    const a = client(sql);
    const b = client(sql);
    const key = "v3|1D|book|";
    assert.equal(await claimScanLock(a, key, "a", 1_000, 500), "acquired");
    assert.equal(await claimScanLock(b, key, "b", 1_400, 500), "busy");
    assert.equal(await renewScanLock(a, key, "a", 1_400, 500), "renewed");
    assert.equal((await lockOwner(sql, key))?.expiresAt, 1_900);
    assert.equal(await claimScanLock(b, key, "b", 1_600, 500), "busy");
    assert.equal(await saveRunIfOwned(a, "a", 1_600, snap(key, 5)), "saved");
    assert.equal(await savedCursor(sql, key), 5);
    assert.equal(await claimScanLock(b, key, "b", 1_900, 500), "acquired");
    await sql.close();
  });

  it("lets the lease expire without renewal, then refuses the old owner's renew, release and save", async () => {
    const sql = await db();
    const a = client(sql);
    const b = client(sql);
    const key = "v3|4H|book|";
    assert.equal(await claimScanLock(a, key, "a", 1_000, 500), "acquired");
    assert.equal(await saveRunIfOwned(a, "a", 1_100, snap(key, 4)), "saved");
    assert.equal(await saveRunIfOwned(a, "a", 1_600, snap(key, 8)), "lost");
    assert.equal(await savedCursor(sql, key), 4);
    assert.equal(await claimScanLock(b, key, "b", 1_600, 500), "acquired");
    assert.equal(await saveRunIfOwned(b, "b", 1_700, snap(key, 9)), "saved");
    assert.equal(await renewScanLock(a, key, "a", 1_800, 500), "lost");
    assert.equal(await saveRunIfOwned(a, "a", 1_800, snap(key, 15)), "lost");
    const before = await lockOwner(sql, key);
    await releaseScanLock(a, key, "a");
    const after = await lockOwner(sql, key);
    assert.deepEqual(after, before);
    assert.equal(after?.owner, "b");
    assert.equal(await savedCursor(sql, key), 9);
    assert.equal(await claimScanLock(client(sql), key, "c", 1_900, 500), "busy");
    await sql.close();
  });

  it("does not revive a missing lock on renewal", async () => {
    const sql = await db();
    assert.equal(await renewScanLock(sql, "gone", "a", 1_000, 500), "lost");
    assert.equal(await lockOwner(sql, "gone"), null);
    await sql.close();
  });

  it("allows two keys to be held at the same time", async () => {
    const sql = await db();
    const a = client(sql);
    const b = client(sql);
    const [first, second] = await Promise.all([
      claimScanLock(a, "key-1", "a", 1_000, 500),
      claimScanLock(b, "key-2", "b", 1_000, 500),
    ]);
    assert.equal(first, "acquired");
    assert.equal(second, "acquired");
    const [again, other] = await Promise.all([
      claimScanLock(a, "same", "a", 1_000, 500),
      claimScanLock(b, "same", "b", 1_000, 500),
    ]);
    assert.equal([again, other].sort().join(","), "acquired,busy");
    await sql.close();
  });

  it("labels a database outage as process-local and still serializes that process", async () => {
    assert.equal(coordinationFromClaim("unavailable"), "process-local-only");
    assert.equal(coordinationFromClaim("acquired"), "database-coordinated");
    assert.match(scanLockDiagnostic("process-local-only"), /this process only/);
    assert.match(scanLockDiagnostic("process-local-only"), /not excluded/);
    assert.doesNotMatch(scanLockDiagnostic("process-local-only"), /sql|relation|ECONN/i);
    const gate = createScanGate();
    let inside = 0;
    let overlap = 0;
    const run = () =>
      gate("book", async () => {
        inside += 1;
        if (inside > 1) overlap += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
        inside -= 1;
      });
    await Promise.all([run(), run()]);
    assert.equal(overlap, 0);
  });

  it("does not let a process-local save overwrite a live owner", async () => {
    const sql = await db();
    const key = "v3|1W|book|";
    assert.equal(await claimScanLock(sql, key, "b", 1_000, 500), "acquired");
    assert.equal(await saveRunIfOwned(sql, "b", 1_100, snap(key, 3)), "saved");
    assert.equal(await saveRunLocal(sql, "a", 1_200, snap(key, 11)), "blocked");
    assert.equal(await savedCursor(sql, key), 3);
    await sql.close();
  });

  it("records lost ownership from the renewal watcher and stops cleanly", async () => {
    let calls = 0;
    const watch = watchScanLock(async () => {
      calls += 1;
      return calls < 3 ? "renewed" : "lost";
    }, 15);
    const started = Date.now();
    while (!watch.lost() && Date.now() - started < 500) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    watch.stop();
    assert.equal(watch.lost(), true);
    assert.ok(calls >= 3);
  });
});
