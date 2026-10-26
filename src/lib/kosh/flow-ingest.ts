/** Pure cash-flow parsing, checks, and freshness. No network and no invented rows. */

import type { FlowPrint } from "./market-flows.ts";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export type FlowFailure = "timeout" | "network" | "http" | "auth" | "rate" | "quota" | "empty" | "malformed";

export type FlowHealth = {
  status: "fresh" | "updating" | "delayed" | "unavailable";
  latest: string | null;
  expected: string | null;
  lastAttempt: string | null;
  lastSuccess: string | null;
  fetched: number;
  inserted: number;
  updated: number;
  rejected: number;
  skipped: number;
  providerStatus: string;
  failure: FlowFailure | null;
  fallback: boolean;
  durationMs: number | null;
  sourceName: string;
  sourceUrl: string;
  wrote: boolean;
};

export function emptyHealth(partial?: Partial<FlowHealth>): FlowHealth {
  return {
    status: "unavailable",
    latest: null,
    expected: null,
    lastAttempt: null,
    lastSuccess: null,
    fetched: 0,
    inserted: 0,
    updated: 0,
    rejected: 0,
    skipped: 0,
    providerStatus: "not checked",
    failure: null,
    fallback: false,
    durationMs: null,
    sourceName: "Stored cash archive",
    sourceUrl: "https://strota.in/fii-dii-data.csv",
    wrote: false,
    ...partial,
  };
}

export function dmyToIso(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  const date = `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return ISO.test(date) ? date : null;
}

function numberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function grossPair(buy: unknown, sell: unknown, net: number): { buy: number; sell: number } | null {
  if (buy == null || sell == null || buy === "" || sell === "") return null;
  const left = Number(buy);
  const right = Number(sell);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  if (left === 0 && right === 0) return null;
  if (Math.abs(left - right - net) > Math.max(1, Math.abs(net) * 0.01)) return null;
  return { buy: left, sell: right };
}

/** Keep a finite net. Drop gross figures that do not reconcile. Never turns a bad parse into zero. */
export function normalizeFlow(row: Partial<FlowPrint> | null | undefined): FlowPrint | null {
  if (!row) return null;
  const date = String(row.date || "");
  if (!ISO.test(date)) return null;
  const fiiNet = Number(row.fiiNet);
  const diiNet = Number(row.diiNet);
  if (!Number.isFinite(fiiNet) || !Number.isFinite(diiNet)) return null;
  const out: FlowPrint = { date, fiiNet, diiNet };
  const fii = grossPair(row.fiiBuy, row.fiiSell, fiiNet);
  const dii = grossPair(row.diiBuy, row.diiSell, diiNet);
  if (fii) {
    out.fiiBuy = fii.buy;
    out.fiiSell = fii.sell;
  }
  if (dii) {
    out.diiBuy = dii.buy;
    out.diiSell = dii.sell;
  }
  return out;
}

export function parseStrotaCsv(text: string): { rows: FlowPrint[]; rejected: number } {
  const lines = String(text || "").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const rows: FlowPrint[] = [];
  let rejected = 0;
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const [date, fii, dii] = line.split(",");
    const row = normalizeFlow({ date: (date || "").trim(), fiiNet: Number(fii), diiNet: Number(dii) });
    if (!row) rejected += 1;
    else rows.push(row);
  }
  return { rows, rejected };
}

/** Cash columns only. Index and stock futures on the same object are ignored. */
export function parseHistoryJson(raw: unknown): { rows: FlowPrint[]; rejected: number } {
  if (!Array.isArray(raw)) return { rows: [], rejected: 0 };
  const rows: FlowPrint[] = [];
  let rejected = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      rejected += 1;
      continue;
    }
    const rec = item as Record<string, unknown>;
    const date = dmyToIso(String(rec.date || "")) || (ISO.test(String(rec.date || "")) ? String(rec.date) : null);
    const row = date
      ? normalizeFlow({
          date,
          fiiNet: Number(rec.fii_net ?? rec.fiiNet),
          diiNet: Number(rec.dii_net ?? rec.diiNet),
          fiiBuy: numberOrNull(rec.fii_buy ?? rec.fiiBuy),
          fiiSell: numberOrNull(rec.fii_sell ?? rec.fiiSell),
          diiBuy: numberOrNull(rec.dii_buy ?? rec.diiBuy),
          diiSell: numberOrNull(rec.dii_sell ?? rec.diiSell),
        })
      : null;
    if (!row) rejected += 1;
    else rows.push(row);
  }
  return { rows, rejected };
}

/** NSE cash categories only. A date needs both FII/FPI and DII. Derivatives categories are ignored. */
export function parseNseCash(raw: unknown): { rows: FlowPrint[]; rejected: number } {
  if (!Array.isArray(raw)) return { rows: [], rejected: 0 };
  const byDate = new Map<string, { fii?: { net: number; buy?: number; sell?: number }; dii?: { net: number; buy?: number; sell?: number } }>();
  let rejected = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      rejected += 1;
      continue;
    }
    const rec = item as Record<string, unknown>;
    const category = String(rec.category || "");
    const side = category === "DII" ? "dii" : category === "FII/FPI" || category === "FII" ? "fii" : "";
    const date = dmyToIso(String(rec.date || ""));
    const net = Number(String(rec.netValue ?? "").replace(/,/g, ""));
    if (!side || !date || !Number.isFinite(net)) {
      if (category && !/future|option|debt/i.test(category)) rejected += 1;
      continue;
    }
    const slot = byDate.get(date) || {};
    const buy = Number(String(rec.buyValue ?? "").replace(/,/g, ""));
    const sell = Number(String(rec.sellValue ?? "").replace(/,/g, ""));
    slot[side] = { net, buy: Number.isFinite(buy) ? buy : undefined, sell: Number.isFinite(sell) ? sell : undefined };
    byDate.set(date, slot);
  }
  const rows: FlowPrint[] = [];
  for (const [date, slot] of byDate) {
    if (slot.fii == null || slot.dii == null) {
      rejected += 1;
      continue;
    }
    const row = normalizeFlow({
      date,
      fiiNet: slot.fii.net,
      diiNet: slot.dii.net,
      fiiBuy: slot.fii.buy,
      fiiSell: slot.fii.sell,
      diiBuy: slot.dii.buy,
      diiSell: slot.dii.sell,
    });
    if (!row) rejected += 1;
    else rows.push(row);
  }
  return { rows, rejected };
}

export function upsertFlows(existing: FlowPrint[], incoming: FlowPrint[]) {
  const map = new Map<string, FlowPrint>();
  for (const row of existing) {
    const clean = normalizeFlow(row);
    if (clean) map.set(clean.date, clean);
  }
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let rejected = 0;
  for (const raw of incoming) {
    const row = normalizeFlow(raw);
    if (!row) {
      rejected += 1;
      continue;
    }
    const prev = map.get(row.date);
    if (!prev) {
      map.set(row.date, row);
      inserted += 1;
      continue;
    }
    const same =
      prev.fiiNet === row.fiiNet &&
      prev.diiNet === row.diiNet &&
      (prev.fiiBuy ?? null) === (row.fiiBuy ?? null) &&
      (prev.diiBuy ?? null) === (row.diiBuy ?? null);
    if (same) skipped += 1;
    else {
      map.set(row.date, row);
      updated += 1;
    }
  }
  const rows = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { rows, inserted, updated, skipped, rejected };
}

function istParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")), minute: Number(get("minute")) };
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Last weekday (skipping listed holidays) whose cash print should already exist. Today is expected only after 19:00 IST. */
export function expectedLatestSession(now: Date, holidays: string[] = []): string {
  const clock = istParts(now);
  const published = clock.hour > 19 || (clock.hour === 19 && clock.minute >= 0);
  let cursor = published ? clock.date : addDays(clock.date, -1);
  const closed = new Set(holidays);
  for (let i = 0; i < 12; i++) {
    const day = new Date(`${cursor}T00:00:00Z`).getUTCDay();
    if (day !== 0 && day !== 6 && !closed.has(cursor)) return cursor;
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

export function freshnessOf(latest: string | null, now: Date, holidays: string[] = []): FlowHealth["status"] {
  if (!latest) return "unavailable";
  return latest >= expectedLatestSession(now, holidays) ? "fresh" : "delayed";
}

export function classifyFetchFailure(status: number | null, name: string, message: string): FlowFailure {
  const msg = `${message || ""}`.toLowerCase();
  if (name === "TimeoutError" || name === "AbortError" || /timed out|timeout|aborted/.test(msg)) return "timeout";
  if (status === 401 || status === 403) return "auth";
  if (status === 429 || /rate limit|too many/.test(msg)) return "rate";
  if (status === 402 || /quota|credit|exhaust/.test(msg)) return "quota";
  if (status != null && status >= 500) return "http";
  if (status != null && status >= 400) return "http";
  if (/network|fetch failed|econn|socket/.test(msg)) return "network";
  return "network";
}

/** One retry for a timeout, a network drop, or a 5xx. Never for auth, quota, or rate limit. */
export function shouldRetryFlow(kind: FlowFailure, attempt: number): boolean {
  if (attempt >= 1) return false;
  return kind === "timeout" || kind === "network" || kind === "http";
}
