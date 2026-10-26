/** Strip broker identifiers before anything leaves the browser for cloud or AI. */

import type { AiFailureClass, Holding, ImportAiStatus, ImportRecord, Lot, PathPriceFact, Portfolio, TradeLine } from "./types.ts";

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

function sanitizeImport(r: ImportRecord): ImportRecord | null {
  const kinds = new Set(["holdings", "holdings-update", "holdings-replace", "path", "path-replace"]);
  if (!r || !kinds.has(r.kind)) return null;
  const ai: ImportAiStatus[] = ["not-run", "ok", "unavailable", "failed", "unconfigured"];
  const classes: AiFailureClass[] = ["unconfigured", "auth", "quota", "rate", "timeout", "malformed", "schema", "network"];
  const n = (v: number) => Math.max(0, Math.floor(Number(v) || 0));
  return {
    id: redactSensitive(String(r.id || "")).slice(0, 40),
    at: Number(r.at) || 0,
    kind: r.kind,
    filename: r.filename ? redactSensitive(r.filename).slice(0, 80) : undefined,
    rowsRead: n(r.rowsRead),
    accepted: n(r.accepted),
    ignored: n(r.ignored),
    duplicates: n(r.duplicates),
    ambiguous: n(r.ambiguous),
    missingPrices: n(r.missingPrices),
    unresolved: n(r.unresolved),
    aiStatus: ai.includes(r.aiStatus) ? r.aiStatus : "not-run",
    aiClass: r.aiClass && classes.includes(r.aiClass) ? r.aiClass : undefined,
    fallback: Boolean(r.fallback),
    applied: n(r.applied),
    note: r.note ? redactSensitive(r.note).slice(0, 180) : undefined,
    detected: r.detected != null ? n(r.detected) : undefined,
    rejected: r.rejected != null ? n(r.rejected) : undefined,
    skipped: r.skipped != null ? n(r.skipped) : undefined,
    flagged: r.flagged != null ? n(r.flagged) : undefined,
    corrections: r.corrections != null ? n(r.corrections) : undefined,
    commit: r.commit === "applied" || r.commit === "reverted" || r.commit === "empty" ? r.commit : undefined,
    affectedFrom: r.affectedFrom && /^\d{4}-\d{2}-\d{2}$/.test(r.affectedFrom) ? r.affectedFrom : undefined,
    touches: Array.isArray(r.touches)
      ? r.touches.slice(0, 80).flatMap((touch) => {
          if (!touch || (touch.op !== "add" && touch.op !== "correct")) return [];
          if ((touch.side !== 1 && touch.side !== -1) || !(touch.qty > 0)) return [];
          return [{
            op: touch.op,
            id: touch.id ? redactSensitive(String(touch.id)).slice(0, 40) : undefined,
            symbol: redactSensitive(String(touch.symbol || "")).slice(0, 24),
            date: touch.date && /^\d{4}-\d{2}-\d{2}/.test(touch.date) ? touch.date.slice(0, 10) : null,
            side: touch.side,
            qty: touch.qty,
            price: Number(touch.price) || 0,
            beforeQty: touch.beforeQty,
            beforePrice: touch.beforePrice,
            beforeSide: touch.beforeSide === 1 || touch.beforeSide === -1 ? touch.beforeSide : undefined,
          }];
        })
      : undefined,
  };
}

export function sanitizePortfolio(p: Portfolio): Portfolio {
  const imports = (p.imports || []).slice(0, 20).map(sanitizeImport).filter((r): r is ImportRecord => Boolean(r));
  return {
    id: redactSensitive(String(p.id || "")).slice(0, 40),
    name: redactSensitive(String(p.name || "Main")).slice(0, 80),
    bench: String(p.bench || "nifty").slice(0, 40),
    includeCommodities: p.includeCommodities,
    holdings: (p.holdings || []).map(sanitizeHolding),
    trades: p.trades?.map(sanitizeTrade),
    pathFacts: (p.pathFacts || []).map(sanitizeFact).filter((f): f is PathPriceFact => Boolean(f)).slice(0, 400),
    imports: imports.length ? imports : undefined,
    updatedAt: p.updatedAt,
  };
}
