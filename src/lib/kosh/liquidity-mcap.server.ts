/** Market-cap observations for the liquidity book. Independent of candle history. */

import { fetchListingCaps } from "./yahoo.server";
import { capIsFresh, MCAP_TTL_MS, type CapObservation } from "./liquidity-book";

export { capIsFresh, MCAP_TTL_MS };

const BUDGET = 120;

type StoredCap = CapObservation & { symbol: string };

function store(): Map<string, StoredCap> {
  const g = globalThis as { __koshListingCaps?: Map<string, StoredCap> };
  g.__koshListingCaps ??= new Map();
  return g.__koshListingCaps;
}

function failures(): Map<string, number> {
  const g = globalThis as { __koshListingCapFails?: Map<string, number> };
  g.__koshListingCapFails ??= new Map();
  return g.__koshListingCapFails;
}

export function cachedCaps(pins: string[], now = Date.now()): { ready: boolean; rows: Map<string, CapObservation>; pending: number } {
  const rows = new Map<string, CapObservation>();
  let pending = 0;
  for (const pin of pins) {
    const row = store().get(pin);
    if (!row || !capIsFresh(row.asOf, now)) {
      pending += 1;
      continue;
    }
    rows.set(pin, row);
  }
  return { ready: pending === 0, rows, pending };
}

/** Fill a limited number of missing quotes. Two failed attempts are recorded as unavailable, not as zero. */
export async function fillListingCaps(pins: string[], now = Date.now()): Promise<{ ready: boolean; rows: Map<string, CapObservation>; pending: number }> {
  const missing = pins.filter((pin) => {
    const row = store().get(pin);
    return !row || !capIsFresh(row.asOf, now);
  });
  const batch = missing.slice(0, BUDGET);
  if (batch.length) {
    try {
      const got = await fetchListingCaps(batch);
      for (const pin of batch) {
        const row = got.get(pin);
        const mcapCr = row?.mcapCr ?? null;
        store().set(pin, { symbol: pin, mcapCr, asOf: now, state: mcapCr != null ? "known" : "missing" });
        failures().delete(pin);
      }
    } catch {
      const tried = failures();
      for (const pin of batch) {
        const count = (tried.get(pin) || 0) + 1;
        tried.set(pin, count);
        if (count >= 2) store().set(pin, { symbol: pin, mcapCr: null, asOf: now, state: "unavailable" });
      }
    }
  }
  return cachedCaps(pins, now);
}
