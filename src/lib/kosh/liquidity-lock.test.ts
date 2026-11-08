import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { claimScanLock, releaseScanLock, type LockSql } from "./liquidity-lock.ts";

async function db(): Promise<LockSql & { close: () => Promise<void> }> {
  const pg = new PGlite();
  await pg.exec(`create table liquidity_locks (
    cache_key text primary key,
    owner text not null,
    expires_at bigint not null
  )`);
  return {
    query: async (text, params) => (await pg.query(text, params)).rows as { owner: string }[],
    close: () => pg.close(),
  };
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
});
