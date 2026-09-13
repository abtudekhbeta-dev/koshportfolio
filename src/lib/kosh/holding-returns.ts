/** Per-holding returns from buy date + average cost. Blank if either is missing. */

import { bookXirr } from "./xirr.ts";
import type { Bar } from "./types.ts";

export type HoldingReturn = {
  daysHeld: number | null;
  xirr: number | null;
  vsNifty: number | null;
  vsSector: number | null;
  contrib: number | null;
};

const IST = 19800;

function dayOf(unixSec: number): string {
  return new Date((unixSec + IST) * 1000).toISOString().slice(0, 10);
}

function retFromDay(bars: Bar[] | undefined, fromDay: string): number | null {
  const src = (bars || []).filter((b) => b && b.c > 0);
  if (src.length < 2) return null;
  const first = src.find((b) => dayOf(b.t) >= fromDay) || src[0];
  const last = src[src.length - 1];
  if (!first?.c || !last?.c) return null;
  if (last.t - first.t < 2 * 86400) return null;
  return (last.c / first.c - 1) * 100;
}

export function holdingReturn(input: {
  date: string | null | undefined;
  boughtAt?: string | null;
  avg: number | null | undefined;
  qty: number;
  px: number;
  value: number;
  unreal: number | null;
  unrealPct: number | null;
  bars?: Bar[];
  niftyBars?: Bar[];
  sectorBars?: Bar[];
  totalUnreal?: number;
  asOf?: number;
}): HoldingReturn {
  const empty: HoldingReturn = { daysHeld: null, xirr: null, vsNifty: null, vsSector: null, contrib: null };
  const day = String(input.date || input.boughtAt || "").slice(0, 10);
  if (!day || !input.avg || !(input.avg > 0) || !(input.qty > 0)) return empty;
  const t = Date.parse(day + (day.length === 10 ? "T00:00:00.000Z" : ""));
  if (!Number.isFinite(t)) return empty;
  const asOf = input.asOf || Date.now();
  const daysHeld = Math.max(0, Math.round((asOf - t) / 86400000));
  const x = bookXirr(
    [{ date: day, boughtAt: input.boughtAt || day, qty: input.qty, avg: input.avg, px: input.px, value: input.value }],
    true,
    asOf,
  );
  const mine = input.unrealPct;
  const nifty = retFromDay(input.niftyBars, day);
  const sector = retFromDay(input.sectorBars, day);
  const total = input.totalUnreal;
  return {
    daysHeld,
    xirr: x.xirr,
    vsNifty: mine != null && nifty != null ? mine - nifty : null,
    vsSector: mine != null && sector != null ? mine - sector : null,
    contrib:
      total != null && Number.isFinite(total) && Math.abs(total) > 1e-6 && input.unreal != null
        ? (input.unreal / total) * 100
        : null,
  };
}
