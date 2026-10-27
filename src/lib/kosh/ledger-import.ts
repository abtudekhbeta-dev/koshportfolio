/** Versioned drawing import. Coordinates are copied from the source. Nothing is estimated. */

import type { DrawKind, LedgerDraw } from "./ledger-layout.ts";
import { drawScope } from "./ledger-layout.ts";
import { intervalSpec } from "./ledger-spec.ts";

export const KOSH_IMPORT_SCHEMA = "kosh-drawings";
export const IMPORT_UNDO_KEY = "kosh-ledger-import-undo-v1";

const DRAW_KINDS = new Set<DrawKind>(["trend", "ray", "hline", "vline", "rect", "fib", "measure", "text"]);
const TWO_POINT = new Set<DrawKind>(["trend", "ray", "rect", "fib", "measure"]);
const COLOR = /^#[0-9a-fA-F]{6}$/;

const TV_KIND: Record<string, DrawKind> = {
  LineToolTrendLine: "trend",
  LineToolRay: "ray",
  LineToolHorzLine: "hline",
  LineToolHorzRay: "hline",
  LineToolVertLine: "vline",
  LineToolRectangle: "rect",
  LineToolFibRetracement: "fib",
  LineToolText: "text",
  LineToolNote: "text",
  LineToolComment: "text",
};

export type ImportAnchor = { t: number; p: number };

export type ImportStatus = "exact" | "converted" | "needs-review" | "unsupported";

export type ReviewedObject = {
  status: ImportStatus;
  symbol: string;
  scope: string;
  reason: string;
  fingerprint: string;
  draw?: LedgerDraw;
};

export type SymbolRow = {
  raw: string;
  symbol: string;
  exchange: string;
  status: "resolved" | "needs-review";
  reason: string;
};

export type ImportPreview = {
  symbols: SymbolRow[];
  objects: ReviewedObject[];
  chartNote: string;
};

export type ImportUndo = {
  v: 1;
  at: number;
  drawings: Record<string, LedgerDraw[]>;
};

export function classifyTvUrl(input: string): { kind: "watchlist" | "chart"; href: string } | { error: string } {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { error: "That is not a web address." };
  }
  if (url.protocol !== "https:") return { error: "Only https TradingView links are accepted." };
  if (url.username || url.password) return { error: "Links with a username or password are rejected." };
  const host = url.hostname.toLowerCase();
  if (host !== "www.tradingview.com" && host !== "tradingview.com") {
    return { error: "Only www.tradingview.com links are accepted." };
  }
  const path = url.pathname.replace(/\/+$/, "");
  if (/^\/watchlists\/\d+$/.test(path)) return { kind: "watchlist", href: `https://www.tradingview.com${path}/` };
  if (/^\/chart\/[A-Za-z0-9]+$/.test(path)) return { kind: "chart", href: `https://www.tradingview.com${path}/` };
  return { error: "Use a shared watchlist or chart link. Other TradingView pages are not fetched." };
}

export function parseSharedWatchlist(html: string): { name: string; symbols: string[] } | null {
  const blocks = html.match(/<script type="application\/prs\.init-data\+json">([\s\S]*?)<\/script>/g) || [];
  for (const block of blocks) {
    const body = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    try {
      const data = JSON.parse(body) as { sharedWatchlist?: { list?: { name?: string; symbols?: unknown } } };
      const symbols = data.sharedWatchlist?.list?.symbols;
      if (!Array.isArray(symbols)) continue;
      const rows = symbols.filter((item): item is string => typeof item === "string" && !item.startsWith("###"));
      return { name: String(data.sharedWatchlist?.list?.name || "Watchlist").slice(0, 80), symbols: rows.slice(0, 500) };
    } catch {
      /* next block */
    }
  }
  return null;
}

export function parseSharedChart(html: string): { symbols: string[]; drawingObjects: number; note: string } {
  const symbols = [...html.matchAll(/"symbol":"((?:NSE|BSE):[^"]+)"/g)].map((match) => match[1]);
  const unique = [...new Set(symbols)].slice(0, 20);
  const drawingObjects = (html.match(/"type":"LineTool[A-Za-z]+"/g) || []).length;
  return {
    symbols: unique,
    drawingObjects,
    note: drawingObjects
      ? "The public page included drawing objects. They still have to pass coordinate checks before they are saved."
      : "This public chart page did not include drawing objects. A chart link is not a drawing export. Use a Kosh or TradingView layout JSON file for lines and Fibonacci levels.",
  };
}

export function parseSymbolToken(raw: string): SymbolRow {
  const text = String(raw || "").trim();
  const parts = text.split(":");
  const exchange = parts.length > 1 ? parts[0].toUpperCase() : "";
  const body = (parts.length > 1 ? parts.slice(1).join(":") : text).replace(/\.(NS|BO)$/i, "").toUpperCase();
  if (!body || body.startsWith("###")) {
    return { raw: text, symbol: "", exchange, status: "needs-review", reason: "This row is a section label, not a symbol." };
  }
  if (!/^[\^A-Z0-9._=-]{1,32}$/.test(body)) {
    return { raw: text, symbol: body.slice(0, 32), exchange, status: "needs-review", reason: "Kosh could not match this symbol without guessing a rename." };
  }
  if (exchange === "BSE") {
    return {
      raw: text,
      symbol: body,
      exchange,
      status: "needs-review",
      reason: "BSE listing was not treated as the NSE ticker. Confirm the instrument before adding it.",
    };
  }
  return { raw: text, symbol: body, exchange: exchange || "NSE", status: "resolved", reason: exchange ? `Taken from the ${exchange} prefix.` : "Used as written." };
}

type RawAnchor = { t?: number; p?: number; converted?: boolean };

function readUnix(value: unknown): { t: number; converted: boolean } | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n > 1e12 && n < 4e15) return { t: Math.round(n / 1000), converted: true };
  if (n > 1e8 && n < 4e10) return { t: Math.round(n), converted: false };
  return null;
}

function readPoint(value: unknown): RawAnchor | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const price = Number(row.price ?? row.p);
  const time = readUnix(row.time_t ?? row.time ?? row.t);
  if (!Number.isFinite(price) || !time) return null;
  return { t: time.t, p: price, converted: time.converted };
}

function fingerprint(kind: string, anchors: ImportAnchor[], text = ""): string {
  const bits = anchors.map((anchor) => `${Math.round(anchor.t)}|${anchor.p.toFixed(6)}`);
  return [kind, ...bits, text.trim()].join("|");
}

function asDraw(kind: DrawKind, anchors: ImportAnchor[], extra: { color?: string; text?: string; locked?: boolean; id?: string; width?: number }): LedgerDraw | null {
  const first = anchors[0];
  if (!first) return null;
  const second = anchors[1];
  if (TWO_POINT.has(kind) && !second) return null;
  const width = Number(extra.width);
  return {
    id: String(extra.id || cryptoId()).slice(0, 40),
    kind,
    t0: first.t,
    p0: first.p,
    ...(second ? { t1: second.t, p1: second.p } : {}),
    ...(extra.text ? { text: extra.text.slice(0, 80) } : {}),
    color: extra.color && COLOR.test(extra.color) ? extra.color : "#4c8dff",
    ...(Number.isFinite(width) ? { width: Math.max(1, Math.min(6, Math.round(width))) } : {}),
    locked: extra.locked === true,
    hidden: false,
  };
}

function cryptoId(): string {
  return `imp-${Math.random().toString(36).slice(2, 10)}`;
}

function reviewObject(input: {
  kind: string;
  anchors: RawAnchor[];
  symbol: string;
  interval?: string;
  color?: string;
  text?: string;
  locked?: boolean;
  id?: string;
  visible?: boolean;
  assignBare?: string;
  width?: number;
}): ReviewedObject {
  const mapped = DRAW_KINDS.has(input.kind as DrawKind) ? (input.kind as DrawKind) : TV_KIND[input.kind];
  const symbolRow = input.symbol ? parseSymbolToken(input.symbol) : null;
  const symbol = symbolRow?.status === "resolved" ? symbolRow.symbol : input.assignBare && !input.symbol ? input.assignBare : "";
  const scope = symbol ? drawScope(symbol, intervalSpec(input.interval || "1D").id) : "";
  const complete = input.anchors.filter((row): row is ImportAnchor & { t: number; p: number } => row.t != null && row.p != null);
  const convertedTime = input.anchors.some((row) => row.converted);
  const fp = fingerprint(mapped || input.kind, complete, input.text || "");
  if (!mapped) {
    return { status: "unsupported", symbol, scope, reason: `${input.kind || "Object"} has no faithful Kosh drawing type.`, fingerprint: fp };
  }
  if (input.visible === false) {
    return { status: "needs-review", symbol, scope, reason: "The source marked this object hidden. It was not imported.", fingerprint: fp };
  }
  if (!symbol) {
    return {
      status: "needs-review",
      symbol: "",
      scope: "",
      reason: input.symbol ? `Symbol ${input.symbol} was not mapped.` : "The object has no instrument, so it was not assigned to another chart.",
      fingerprint: fp,
    };
  }
  const need = TWO_POINT.has(mapped) ? 2 : 1;
  if (complete.length < need) {
    return { status: "needs-review", symbol, scope, reason: "An anchor time or price was missing. The point was not guessed.", fingerprint: fp };
  }
  const draw = asDraw(mapped, complete.slice(0, need), input);
  if (!draw) {
    return { status: "needs-review", symbol, scope, reason: "The anchors could not be stored.", fingerprint: fp };
  }
  const assigned = Boolean(input.assignBare && !input.symbol);
  if (convertedTime || assigned) {
    return {
      status: "converted",
      symbol,
      scope,
      reason: assigned ? "Assigned to the open chart because the file had no instrument." : "A millisecond timestamp was converted to Unix seconds. The calendar day was not shifted.",
      fingerprint: fp,
      draw,
    };
  }
  return { status: "exact", symbol, scope, reason: "Time and price were copied from the source.", fingerprint: fp, draw };
}

export function previewKoshFile(raw: unknown, assignBare = ""): ImportPreview {
  if (!raw || typeof raw !== "object") {
    return { symbols: [], objects: [], chartNote: "The file was not an object." };
  }
  const row = raw as { schema?: string; version?: number; objects?: unknown; symbols?: unknown };
  if (row.schema !== KOSH_IMPORT_SCHEMA || row.version !== 1) {
    return { symbols: [], objects: [], chartNote: "This file is not kosh-drawings version 1." };
  }
  if (!Array.isArray(row.objects) || row.objects.length > 2000) {
    return { symbols: [], objects: [], chartNote: "The object list is missing or larger than 2,000." };
  }
  const symbols = Array.isArray(row.symbols) ? row.symbols.filter((item): item is string => typeof item === "string").slice(0, 500).map(parseSymbolToken) : [];
  const objects = row.objects.map((item) => {
    const obj = item as Record<string, unknown>;
    const anchors = Array.isArray(obj.anchors) ? obj.anchors.map(readPoint).filter((point): point is RawAnchor => point != null) : [];
    return reviewObject({
      kind: String(obj.kind || ""),
      anchors,
      symbol: String(obj.symbol || ""),
      interval: typeof obj.interval === "string" ? obj.interval : "1D",
      color: typeof obj.color === "string" ? obj.color : undefined,
      text: typeof obj.text === "string" ? obj.text : undefined,
      locked: obj.locked === true,
      width: Number.isFinite(Number(obj.width)) ? Number(obj.width) : undefined,
      id: typeof obj.id === "string" ? obj.id : undefined,
      visible: obj.visible !== false,
      assignBare,
    });
  });
  return { symbols, objects, chartNote: "Kosh drawing file." };
}

export function previewTradingViewState(raw: unknown, assignBare = ""): ImportPreview {
  const sources = findSources(raw);
  if (!sources) return { symbols: [], objects: [], chartNote: "No sources array was found. Chart data CSV is not a drawing file." };
  const objects = sources.slice(0, 2000).map((item) => {
    const row = item as Record<string, unknown>;
    const state = row.state && typeof row.state === "object" ? (row.state as Record<string, unknown>) : {};
    const points = Array.isArray(row.points) ? row.points : Array.isArray(state.points) ? state.points : [];
    const anchors = points.map(readPoint).filter((point): point is RawAnchor => point != null);
    const dropped = points.length - anchors.length;
    const reviewed = reviewObject({
      kind: String(row.type || ""),
      anchors,
      symbol: String(state.symbol || row.symbol || ""),
      interval: typeof state.interval === "string" ? state.interval : typeof row.interval === "string" ? row.interval : "1D",
      color: typeof state.linecolor === "string" ? state.linecolor : typeof state.color === "string" ? state.color : undefined,
      text: typeof state.text === "string" ? state.text : undefined,
      locked: state.frozen === true,
      width: Number.isFinite(Number(state.linewidth)) ? Number(state.linewidth) : undefined,
      id: typeof row.id === "string" ? row.id : undefined,
      visible: state.visible !== false,
      assignBare,
    });
    if (dropped > 0 && reviewed.status !== "unsupported") {
      return { ...reviewed, status: "needs-review" as const, draw: undefined, reason: "A point was missing a time or a price, so the drawing was not shortened." };
    }
    if (String(row.type || "") === "MainSeries" || String(row.type || "") === "Study") {
      return { ...reviewed, status: "unsupported" as const, draw: undefined, reason: "Price series and studies are not drawings." };
    }
    return reviewed;
  });
  const symbols = [
    ...new Set(objects.map((item) => item.symbol).filter(Boolean)),
  ].map((symbol) => parseSymbolToken(symbol));
  return {
    symbols,
    objects: objects.filter((item) => item.reason !== "Price series and studies are not drawings."),
    chartNote: "TradingView layout state. Only objects with a known tool name and numeric anchors are imported.",
  };
}

function findSources(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (Array.isArray(row.sources)) return row.sources;
  if (row.charts && typeof row.charts === "object") {
    const charts = row.charts as Record<string, unknown>;
    for (const chart of Object.values(charts)) {
      const panes = (chart as { panes?: { sources?: unknown[] }[] })?.panes;
      if (!Array.isArray(panes)) continue;
      const sources = panes.flatMap((pane) => (Array.isArray(pane.sources) ? pane.sources : []));
      if (sources.length) return sources;
    }
  }
  return null;
}

export function previewImport(raw: unknown, assignBare = ""): ImportPreview {
  if (raw && typeof raw === "object" && (raw as { schema?: string }).schema === KOSH_IMPORT_SCHEMA) return previewKoshFile(raw, assignBare);
  return previewTradingViewState(raw, assignBare);
}

export function applyImport(input: {
  current: Record<string, LedgerDraw[]>;
  objects: ReviewedObject[];
  mode: "add" | "replace";
  replaceScopes?: string[];
}): { next: Record<string, LedgerDraw[]>; added: number; duplicates: number; replacedScopes: string[] } {
  const next: Record<string, LedgerDraw[]> = {};
  for (const [key, list] of Object.entries(input.current)) next[key] = list.slice();
  const replace = new Set(input.mode === "replace" ? input.replaceScopes || [] : []);
  for (const scope of replace) delete next[scope];
  let added = 0;
  let duplicates = 0;
  for (const item of input.objects) {
    if (!item.draw || !item.scope) continue;
    if (item.status !== "exact" && item.status !== "converted") continue;
    const have = next[item.scope] || [];
    const seen = new Set(have.map((draw) => fingerprint(draw.kind, drawAnchors(draw), draw.text || "")));
    const fp = fingerprint(item.draw.kind, drawAnchors(item.draw), item.draw.text || "");
    if (seen.has(fp)) {
      duplicates += 1;
      continue;
    }
    next[item.scope] = [...have, item.draw];
    added += 1;
  }
  return { next, added, duplicates, replacedScopes: [...replace] };
}

function drawAnchors(draw: LedgerDraw): ImportAnchor[] {
  const anchors = [{ t: draw.t0, p: draw.p0 }];
  if (draw.t1 != null && draw.p1 != null) anchors.push({ t: draw.t1, p: draw.p1 });
  return anchors;
}

export function importCounts(preview: ImportPreview) {
  const count = (status: ImportStatus) => preview.objects.filter((item) => item.status === status).length;
  const withDrawings = new Set(preview.objects.filter((item) => item.draw).map((item) => item.symbol)).size;
  return {
    symbols: preview.symbols.length,
    resolved: preview.symbols.filter((item) => item.status === "resolved").length,
    reviewSymbols: preview.symbols.filter((item) => item.status === "needs-review").length,
    withDrawings,
    exact: count("exact"),
    converted: count("converted"),
    review: count("needs-review"),
    unsupported: count("unsupported"),
  };
}

export function saveImportUndo(drawings: Record<string, LedgerDraw[]>): boolean {
  try {
    const payload: ImportUndo = { v: 1, at: Date.now(), drawings };
    localStorage.setItem(IMPORT_UNDO_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadImportUndo(): ImportUndo | null {
  try {
    const raw = localStorage.getItem(IMPORT_UNDO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImportUndo;
    if (parsed?.v !== 1 || !parsed.drawings || typeof parsed.drawings !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}
