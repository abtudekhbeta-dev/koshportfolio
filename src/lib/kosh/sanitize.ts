/** Strip broker identifiers before anything leaves the browser for cloud or AI. */

import type { Holding, Lot, PathPriceFact, Portfolio, TradeLine } from "./types.ts";

const PAN = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
const LONG_NUM = /\b\d{12,18}\b/g;

export function redactSensitive(text: string): string {
  return String(text || "")
    .replace(PAN, "[redacted]")
    .replace(LONG_NUM, "[redacted]");
}

function lot(l: Lot): Lot {
  return {
    qty: Number(l.qty) || 0,
    avg: l.avg,
    date: l.date || null,
    boughtAt: l.boughtAt || null,
  };
}

export function sanitizeHolding(h: Holding): Holding {
  const isin = h.isin && /^[A-Z]{2}[A-Z0-9]{10}$/.test(h.isin.toUpperCase()) ? h.isin.toUpperCase() : undefined;
  return {
    symbol: redactSensitive(h.symbol).slice(0, 32),
    name: redactSensitive(h.name || "").slice(0, 140),
    qty: Number(h.qty) || 0,
    avg: h.avg != null && Number.isFinite(h.avg) ? h.avg : null,
    date: h.date || null,
    boughtAt: h.boughtAt || null,
    isin,
    sector: h.sector ? redactSensitive(h.sector).slice(0, 40) : undefined,
    kind: h.kind,
    unit: h.unit,
    lots: h.lots?.map(lot),
  };
}

export function sanitizeTrade(t: TradeLine): TradeLine {
  return {
    symbol: redactSensitive(t.symbol).slice(0, 32),
    name: redactSensitive(t.name || "").slice(0, 140),
    qty: Number(t.qty) || 0,
    price: Number(t.price) || 0,
    date: t.date,
    boughtAt: t.boughtAt,
    side: t.side === -1 ? -1 : 1,
    isin: t.isin && /^[A-Z]{2}[A-Z0-9]{10}$/.test(t.isin.toUpperCase()) ? t.isin.toUpperCase() : undefined,
    sector: t.sector ? redactSensitive(t.sector).slice(0, 40) : undefined,
    id: undefined,
    src: t.src,
    priceFilled: t.priceFilled,
  };
}

function sanitizeFact(f: PathPriceFact): PathPriceFact | null {
  const price = Number(f.price);
  const date = String(f.date || "");
  const sourceUrl = String(f.sourceUrl || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !(price > 0) || !/^https?:\/\//i.test(sourceUrl)) return null;
  const evidence = redactSensitive(f.evidence || "").slice(0, 400);
  if (evidence.length < 8 || !evidence.includes(date)) return null;
  return {
    symbol: redactSensitive(f.symbol).slice(0, 32),
    date,
    price,
    sourceName: redactSensitive(f.sourceName || "").slice(0, 80),
    sourceUrl: sourceUrl.slice(0, 400),
    retrievedAt: String(f.retrievedAt || "").slice(0, 24),
    evidence,
  };
}

export function sanitizePortfolio(p: Portfolio): Portfolio {
  return {
    id: redactSensitive(String(p.id || "")).slice(0, 40),
    name: redactSensitive(String(p.name || "Main")).slice(0, 80),
    bench: String(p.bench || "nifty").slice(0, 40),
    includeCommodities: p.includeCommodities,
    holdings: (p.holdings || []).map(sanitizeHolding),
    trades: p.trades?.map(sanitizeTrade),
    pathFacts: (p.pathFacts || []).map(sanitizeFact).filter((f): f is PathPriceFact => Boolean(f)).slice(0, 400),
    updatedAt: p.updatedAt,
  };
}
