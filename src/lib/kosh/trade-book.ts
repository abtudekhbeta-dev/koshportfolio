import type { TradeLine } from "./types.ts";

const DB_NAME = "kosh-path";
const STORE = "books";

export type TradeBookRow = { id: string; trades: TradeLine[] };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser cannot store a large trade book."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Could not open the trade book."));
  });
}

/** Durable Path trades. A failed write must not delete the previous book. */
export async function saveTradeBook(id: string, trades: TradeLine[]): Promise<void> {
  if (!id || id === "sample") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not save the trade book."));
    tx.onabort = () => reject(tx.error || new Error("Could not save the trade book."));
    tx.objectStore(STORE).put({ id, trades } satisfies TradeBookRow);
  });
  db.close();
}

export async function loadTradeBooks(): Promise<Record<string, TradeLine[]>> {
  const db = await openDb();
  const rows = await new Promise<TradeBookRow[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []) as TradeBookRow[]);
    req.onerror = () => reject(req.error || new Error("Could not read the trade book."));
  });
  db.close();
  const out: Record<string, TradeLine[]> = {};
  for (const row of rows) {
    if (row?.id && Array.isArray(row.trades)) out[row.id] = row.trades;
  }
  return out;
}
