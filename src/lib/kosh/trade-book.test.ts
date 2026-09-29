import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadTradeBooks, saveTradeBook } from "./trade-book.ts";
import type { TradeLine } from "./types.ts";

function installFakeIdb() {
  const rows = new Map<string, { id: string; trades: TradeLine[] }>();
  let created = false;
  let fail = false;
  const fake = {
    fail(next: boolean) {
      fail = next;
    },
    open() {
      const req: {
        result?: unknown;
        onupgradeneeded?: () => void;
        onsuccess?: () => void;
        onerror?: () => void;
      } = {};
      queueMicrotask(() => {
        const db = {
          objectStoreNames: { contains: () => created },
          createObjectStore() {
            created = true;
          },
          transaction() {
            const tx: { error: Error | null; oncomplete: (() => void) | null; onerror: (() => void) | null; onabort: (() => void) | null } = {
              error: null,
              oncomplete: null,
              onerror: null,
              onabort: null,
            };
            return {
              objectStore() {
                return {
                  put(row: { id: string; trades: TradeLine[] }) {
                    queueMicrotask(() => {
                      if (fail) {
                        tx.error = new Error("Could not save the trade book.");
                        tx.onabort?.();
                        return;
                      }
                      rows.set(row.id, { id: row.id, trades: row.trades });
                      tx.oncomplete?.();
                    });
                  },
                  getAll() {
                    const out: { result?: { id: string; trades: TradeLine[] }[]; onsuccess?: () => void; onerror?: () => void } = {};
                    queueMicrotask(() => {
                      out.result = [...rows.values()];
                      out.onsuccess?.();
                    });
                    return out;
                  },
                };
              },
              get oncomplete() {
                return tx.oncomplete;
              },
              set oncomplete(fn) {
                tx.oncomplete = fn;
              },
              get onerror() {
                return tx.onerror;
              },
              set onerror(fn) {
                tx.onerror = fn;
              },
              get onabort() {
                return tx.onabort;
              },
              set onabort(fn) {
                tx.onabort = fn;
              },
              get error() {
                return tx.error;
              },
            };
          },
          close() {},
        };
        req.result = db;
        if (!created) req.onupgradeneeded?.();
        req.onsuccess?.();
      });
      return req;
    },
  };
  (globalThis as { indexedDB?: unknown }).indexedDB = fake;
  return fake;
}

function line(i: number): TradeLine {
  return { symbol: "TCS", name: "TCS", qty: 1, price: 100, date: "2024-01-02", side: 1, id: "t" + i };
}

describe("path trade book", () => {
  it("keeps 100000 trades and does not replace them when a later write fails", { timeout: 60_000 }, async () => {
    const db = installFakeIdb();
    const trades = Array.from({ length: 100_000 }, (_, i) => line(i));
    await saveTradeBook("path-1", trades);
    const loaded = await loadTradeBooks();
    assert.equal(loaded["path-1"]?.length, 100_000);
    assert.equal(loaded["path-1"]?.[99_999]?.id, "t99999");
    db.fail(true);
    await assert.rejects(() => saveTradeBook("path-1", []));
    const again = await loadTradeBooks();
    assert.equal(again["path-1"]?.length, 100_000);
    await saveTradeBook("sample", trades);
    const sample = await loadTradeBooks();
    assert.equal(sample.sample, undefined);
  });
});
