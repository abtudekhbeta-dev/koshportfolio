/** Alert checks against the latest quote or screener row. They do not run when Kosh is closed. */

import type { Quote, ScreenRow } from "./types.ts";

export type AlertKind = "price" | "pct" | "rsi" | "volume" | "high52" | "low52" | "ma";
export type AlertStatus = "active" | "paused" | "triggered" | "expired";

export type AlertRule = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  dir: "above" | "below";
  kind?: AlertKind;
  exchange?: "NSE" | "BSE" | "OTHER";
  timeframe?: string;
  createdAt?: number;
  expiresAt?: number | null;
  status?: AlertStatus;
  triggeredAt?: number | null;
  history?: { at: number; note: string }[];
  /** Previous MA state, so a cross is a change between checks rather than the current side. */
  lastAbove?: boolean | null;
  ackAt?: number | null;
};

export type AlertCheck = {
  hit: boolean;
  detail: string;
  memory?: boolean | null;
  expired?: boolean;
};

export function alertDetail(a: AlertRule): string {
  const kind = a.kind || "price";
  if (kind === "price") return `${a.dir} ${a.price}`;
  if (kind === "pct") return a.dir === "above" ? `day ≥ ${a.price}%` : `day ≤ −${Math.abs(a.price)}%`;
  if (kind === "rsi") return `RSI ${a.dir} ${a.price}`;
  if (kind === "volume") return `volume ≥ ${a.price}×`;
  if (kind === "high52") return "at 52-week high";
  if (kind === "low52") return "at 52-week low";
  if (kind === "ma") return `cross ${a.dir} ${a.price >= 150 ? "200" : "50"}-day`;
  return kind;
}

export function evaluateAlert(a: AlertRule, quote: Quote | undefined, row: ScreenRow | undefined, now = Date.now()): AlertCheck {
  const status = a.status || "active";
  if (status === "paused" || status === "triggered") return { hit: false, detail: alertDetail(a) };
  if (a.expiresAt && now > a.expiresAt) return { hit: false, detail: alertDetail(a), expired: true };
  const kind = a.kind || "price";
  const px = quote?.price ?? 0;
  if (kind === "price") {
    if (!(px > 0)) return { hit: false, detail: alertDetail(a) };
    const hit = a.dir === "above" ? px >= a.price : px <= a.price;
    return { hit, detail: alertDetail(a) };
  }
  if (kind === "pct") {
    const ch = quote?.changePct;
    if (ch == null || !Number.isFinite(ch)) return { hit: false, detail: alertDetail(a) };
    const hit = a.dir === "above" ? ch >= a.price : ch <= -Math.abs(a.price);
    return { hit, detail: alertDetail(a) };
  }
  if (kind === "rsi") {
    const r = row?.rsi;
    if (r == null) return { hit: false, detail: alertDetail(a) };
    return { hit: a.dir === "above" ? r >= a.price : r <= a.price, detail: alertDetail(a) };
  }
  if (kind === "volume") {
    const v = row?.volRatio;
    if (v == null) return { hit: false, detail: alertDetail(a) };
    return { hit: v >= a.price, detail: alertDetail(a) };
  }
  if (kind === "high52") {
    return { hit: px > 0 && (quote?.high52 ?? 0) > 0 && px >= (quote?.high52 || 0) * 0.995, detail: alertDetail(a) };
  }
  if (kind === "low52") {
    return { hit: px > 0 && (quote?.low52 ?? 0) > 0 && px <= (quote?.low52 || 0) * 1.005, detail: alertDetail(a) };
  }
  const above = a.price >= 150 ? row?.above200 : row?.above50;
  if (above == null) return { hit: false, detail: alertDetail(a) };
  if (a.lastAbove == null) return { hit: false, detail: alertDetail(a), memory: above };
  const hit = a.dir === "above" ? !a.lastAbove && above : a.lastAbove && !above;
  return { hit, detail: alertDetail(a), memory: above };
}
