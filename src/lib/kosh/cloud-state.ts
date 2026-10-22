/** What leaves the browser for a signed-in account, and how two devices merge. */

import type { JournalEntry, PathPriceFact, Portfolio, TradeLine, Fundamentals, Holding } from "./types.ts";
import type { ScreenFilter } from "./screens.ts";
import { sanitizePortfolio } from "./sanitize.ts";
import { baseSym, preferSymbol } from "./sectors.ts";

export type SyncPolicy = "CLOUD_SYNC" | "LOCAL_ONLY" | "NEVER_SYNC";

export const SYNC_POLICY = {
  portfolios: "CLOUD_SYNC",
  watchlists: "CLOUD_SYNC",
  customScreens: "CLOUD_SYNC",
  chartPrefs: "CLOUD_SYNC",
  desk: "CLOUD_SYNC",
  alerts: "CLOUD_SYNC",
  journal: "CLOUD_SYNC",
  bookNotes: "CLOUD_SYNC",
  deepFunds: "CLOUD_SYNC",
  symbolAliases: "CLOUD_SYNC",
  symbolSkips: "CLOUD_SYNC",
  drawings: "LOCAL_ONLY",
  skillReads: "LOCAL_ONLY",
  recents: "LOCAL_ONLY",
  rawBrokerFiles: "NEVER_SYNC",
} as const satisfies Record<string, SyncPolicy>;

export type CloudWatch = { id: string; name: string; symbols: string[] };
export type CloudAlert = { id: string; symbol: string; name: string; price: number; dir: "above" | "below"; kind?: string };
export type CloudNote = { text: string; at: number; nRead: number; nTotal: number };
export type CloudDesk = {
  layout: 1 | 2 | 4;
  panes: { symbol: string; name: string; interval: string }[];
  syncTf: boolean;
  intelTab: string;
  activePane: number;
  style: "candle" | "line";
};

export type CloudDrop = { id: string; at: number };
export type TradeDrop = { portfolioId: string; key: string; at: number };
export type HoldingDrop = { portfolioId: string; symbol: string; at: number };
export type SymbolDrop = { listId: string; symbol: string; at: number };
export type NameDrop = { name: string; at: number };
export type CloudDrops = {
  portfolios: CloudDrop[];
  trades: TradeDrop[];
  holdings: HoldingDrop[];
  lists: CloudDrop[];
  symbols: SymbolDrop[];
  screens: NameDrop[];
  alerts: CloudDrop[];
  notes: CloudDrop[];
};

export type CloudDoc = {
  portfolios: Portfolio[];
  watchlists: CloudWatch[];
  activeWatchId: string;
  customScreens: ScreenFilter[];
  chartPrefs: { termHeight?: number; interval?: string; logScale?: boolean; chartMode?: string; chartBench?: string };
  desk: CloudDesk | null;
  alerts: CloudAlert[];
  journal: JournalEntry[];
  bookNotes: Record<string, CloudNote>;
  deepFunds: Record<string, { fund: Fundamentals; at: number; sources: string[] }>;
  symbolAliases: Record<string, string>;
  symbolSkips: string[];
  deviceId?: string;
  savedAt?: number;
  /** Client idempotency key for the last accepted save. A retry with the same key and body is not a new revision. */
  mutationId?: string;
  /** Counts that could not be stored. Empty means nothing was dropped. */
  omitted?: { watchlists?: number; screens?: number; alerts?: number; journal?: number };
  /** Deletes that must win over a stale copy of the same record. */
  drops?: CloudDrops;
};

export function emptyCloud(): CloudDoc {
  return {
    portfolios: [],
    watchlists: [],
    activeWatchId: "main",
    customScreens: [],
    chartPrefs: {},
    desk: null,
    alerts: [],
    journal: [],
    bookNotes: {},
    deepFunds: {},
    symbolAliases: {},
    symbolSkips: [],
    drops: emptyDrops(),
  };
}

function slimFund(fund: Fundamentals): Fundamentals {
  const { summary: _summary, ceo: _ceo, founded: _founded, ...rest } = fund;
  return { ...rest, summary: "", ceo: "", founded: "" };
}

export function sanitizeForCloud(input: {
  portfolios?: Portfolio[];
  watchlists?: CloudWatch[];
  activeWatchId?: string;
  customScreens?: ScreenFilter[];
  chartPrefs?: CloudDoc["chartPrefs"];
  desk?: CloudDesk | null;
  alerts?: CloudAlert[];
  journal?: JournalEntry[];
  bookNotes?: Record<string, CloudNote>;
  deepFunds?: CloudDoc["deepFunds"];
  symbolAliases?: Record<string, string>;
  symbolSkips?: string[];
  deviceId?: string;
  savedAt?: number;
  mutationId?: string;
  drops?: CloudDrops;
  cloudDrops?: CloudDrops;
}): CloudDoc {
  const funds: CloudDoc["deepFunds"] = {};
  for (const [sym, snap] of Object.entries(input.deepFunds || {})) {
    if (!snap?.fund) continue;
    funds[sym.slice(0, 24)] = { fund: slimFund(snap.fund), at: snap.at || 0, sources: (snap.sources || []).slice(0, 8) };
  }
  const lists = capped(input.watchlists || [], 100);
  const screens = capped(input.customScreens || [], 200);
  const alerts = capped(input.alerts || [], 500);
  const journal = capped(input.journal || [], 2000);
  const omitted = {
    watchlists: lists.omitted,
    screens: screens.omitted,
    alerts: alerts.omitted,
    journal: journal.omitted,
  };
  const dropped = Object.values(omitted).some((n) => n > 0);
  return {
    portfolios: (input.portfolios || []).filter((p) => p.id !== "sample").map((p) => sanitizePortfolio(p)),
    watchlists: lists.rows.map((w) => ({
      id: String(w.id || "").slice(0, 40),
      name: String(w.name || "List").slice(0, 40),
      symbols: (w.symbols || []).map((s) => String(s).slice(0, 24)).slice(0, 2000),
    })),
    activeWatchId: String(input.activeWatchId || "main").slice(0, 40),
    customScreens: screens.rows,
    chartPrefs: {
      termHeight: input.chartPrefs?.termHeight,
      interval: input.chartPrefs?.interval,
      logScale: input.chartPrefs?.logScale,
      chartMode: input.chartPrefs?.chartMode,
      chartBench: input.chartPrefs?.chartBench,
    },
    desk: input.desk || null,
    alerts: alerts.rows,
    journal: journal.rows,
    bookNotes: input.bookNotes || {},
    deepFunds: funds,
    symbolAliases: input.symbolAliases || {},
    symbolSkips: input.symbolSkips || [],
    deviceId: input.deviceId || thisDevice(),
    savedAt: input.savedAt || Date.now(),
    mutationId: input.mutationId ? String(input.mutationId).slice(0, 80) : undefined,
    omitted: dropped ? omitted : undefined,
    drops: clampDrops(input.drops || input.cloudDrops),
  };
}

function thisDevice(): string | undefined {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const key = "kosh-device";
    let id = localStorage.getItem(key);
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() || `dev-${Date.now()}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function tradeKey(t: TradeLine) {
  return tradeIdentity(t);
}

function capped<T>(rows: T[], cap: number) {
  if (rows.length <= cap) return { rows, omitted: 0 };
  return { rows: rows.slice(0, cap), omitted: rows.length - cap };
}

export function emptyDrops(): CloudDrops {
  return { portfolios: [], trades: [], holdings: [], lists: [], symbols: [], screens: [], alerts: [], notes: [] };
}

/** Broker id wins. Without one, economics plus file order identify the row. Two different ids stay two trades. */
export function tradeIdentity(t: TradeLine): string {
  const id = String(t.id || "").trim();
  if (id) return "id:" + id.slice(0, 80);
  return "k:" + [t.symbol, t.date || "", t.side, t.qty, t.price, t.boughtAt || "", t.src ?? ""].join("|");
}

function fresher<T extends { at: number }>(rows: T[], key: (row: T) => string, cap = 200): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    if (!(row.at > 0)) continue;
    const k = key(row);
    const prev = map.get(k);
    if (!prev || row.at >= prev.at) map.set(k, row);
  }
  return [...map.values()].sort((a, b) => b.at - a.at).slice(0, cap);
}

export function clampDrops(input?: Partial<CloudDrops> | null): CloudDrops {
  return {
    portfolios: fresher(input?.portfolios || [], (d) => d.id, 2000),
    trades: fresher(input?.trades || [], (d) => d.portfolioId + "|" + d.key, 2000),
    holdings: fresher(input?.holdings || [], (d) => d.portfolioId + "|" + baseSym(d.symbol), 2000),
    lists: fresher(input?.lists || [], (d) => d.id, 2000),
    symbols: fresher(input?.symbols || [], (d) => d.listId + "|" + baseSym(d.symbol), 4000),
    screens: fresher(input?.screens || [], (d) => d.name, 2000),
    alerts: fresher(input?.alerts || [], (d) => d.id, 2000),
    notes: fresher(input?.notes || [], (d) => d.id, 2000),
  };
}

export function withPortfolioDrop(drops: CloudDrops | undefined, id: string, at: number): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), portfolios: [...(drops?.portfolios || []), { id, at }] });
}

export function withTradeDrops(drops: CloudDrops | undefined, rows: TradeDrop[]): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), trades: [...(drops?.trades || []), ...rows] });
}

export function withHoldingDrop(drops: CloudDrops | undefined, row: HoldingDrop): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), holdings: [...(drops?.holdings || []), row] });
}

export function withListDrop(drops: CloudDrops | undefined, id: string, at: number): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), lists: [...(drops?.lists || []), { id, at }] });
}

export function withSymbolDrop(drops: CloudDrops | undefined, row: SymbolDrop): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), symbols: [...(drops?.symbols || []), row] });
}

export function withScreenDrop(drops: CloudDrops | undefined, name: string, at: number): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), screens: [...(drops?.screens || []), { name, at }] });
}

export function withAlertDrop(drops: CloudDrops | undefined, id: string, at: number): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), alerts: [...(drops?.alerts || []), { id, at }] });
}

export function withNoteDrop(drops: CloudDrops | undefined, id: string, at: number): CloudDrops {
  return clampDrops({ ...(drops || emptyDrops()), notes: [...(drops?.notes || []), { id, at }] });
}

/** A newer book keeps what it currently lists. A stale copy loses the deleted row. */
export function applyDrops(p: Portfolio, drops: CloudDrops | undefined): Portfolio {
  const d = drops || emptyDrops();
  const newer = (at: number) => (p.updatedAt || 0) > at;
  const deadT = new Set(d.trades.filter((x) => x.portfolioId === p.id && !newer(x.at)).map((x) => x.key));
  const deadH = d.holdings.filter((x) => x.portfolioId === p.id && !newer(x.at));
  return {
    ...p,
    trades: (p.trades || []).filter((t) => !deadT.has(tradeIdentity(t))),
    holdings: (p.holdings || []).filter((h) => {
      const hit = deadH.find((x) => baseSym(x.symbol) === baseSym(h.symbol));
      if (!hit) return true;
      return (h.updatedAt || 0) > hit.at;
    }),
  };
}

/** Union of two trade books. A failed or empty write must not erase the other side. */
export function unionCloudTrades(a: TradeLine[] | undefined, b: TradeLine[] | undefined) {
  const out: TradeLine[] = [];
  const seen = new Set<string>();
  for (const t of [...(a || []), ...(b || [])]) {
    if (!(t.qty > 0)) continue;
    const key = tradeKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function mergeTrades(a: TradeLine[] | undefined, b: TradeLine[] | undefined) {
  return unionCloudTrades(a, b);
}

function isSample(ports: Portfolio[]) {
  return ports.length === 1 && ports[0]?.id === "sample";
}

function mergeHoldingLists(remote: Holding[] | undefined, local: Holding[] | undefined): Holding[] {
  const map = new Map<string, Holding>();
  for (const h of remote || []) map.set(baseSym(h.symbol), h);
  for (const h of local || []) {
    const key = baseSym(h.symbol);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, h);
      continue;
    }
    const symbol = preferSymbol(prev.symbol, h.symbol);
    if ((h.updatedAt || 0) > (prev.updatedAt || 0)) map.set(key, { ...prev, ...h, symbol });
    else map.set(key, { ...prev, symbol });
  }
  return [...map.values()];
}

function mergeFacts(a?: PathPriceFact[], b?: PathPriceFact[]): PathPriceFact[] {
  const map = new Map<string, PathPriceFact>();
  for (const f of [...(a || []), ...(b || [])]) {
    if (!f?.date || !(f.price > 0) || !/^https?:\/\//i.test(f.sourceUrl || "")) continue;
    const key = `${f.symbol}|${f.date}`;
    if (!map.has(key)) map.set(key, f);
  }
  return [...map.values()].slice(0, 2000);
}

/** Union Path trades. A stale device must not erase a newer tradebook. */
export function mergeCloud(local: CloudDoc, remote: CloudDoc): { doc: CloudDoc; dirty: boolean; notes: string[] } {
  const notes: string[] = [];
  const localPorts = isSample(local.portfolios) ? [] : local.portfolios;
  const byId = new Map<string, Portfolio>();
  for (const p of remote.portfolios || []) byId.set(p.id, { ...p, holdings: [...(p.holdings || [])], trades: [...(p.trades || [])] });
  for (const p of localPorts) {
    const prev = byId.get(p.id);
    if (!prev) {
      byId.set(p.id, p);
      notes.push(`Kept ${p.name} from this device`);
      continue;
    }
    const trades = mergeTrades(prev.trades, p.trades);
    if ((p.trades?.length || 0) > (prev.trades?.length || 0)) notes.push(`Merged Path trades for ${p.name}`);
    const holdings = mergeHoldingLists(prev.holdings, p.holdings);
    const localNewer = (p.updatedAt || 0) >= (prev.updatedAt || 0);
    byId.set(p.id, {
      ...(localNewer ? { ...prev, ...p } : { ...p, ...prev }),
      holdings,
      trades,
      pathFacts: mergeFacts(prev.pathFacts, p.pathFacts),
      id: p.id,
    });
  }
  const funds = { ...(remote.deepFunds || {}) };
  for (const [sym, snap] of Object.entries(local.deepFunds || {})) {
    const prev = funds[sym];
    if (!prev || (snap.at || 0) >= (prev.at || 0)) funds[sym] = snap;
  }
  const localFresh = !localPorts.length && !(local.customScreens || []).length && !Object.keys(local.deepFunds || {}).length;
  const drops = clampDrops({
    portfolios: [...(local.drops?.portfolios || []), ...(remote.drops?.portfolios || [])],
    trades: [...(local.drops?.trades || []), ...(remote.drops?.trades || [])],
    holdings: [...(local.drops?.holdings || []), ...(remote.drops?.holdings || [])],
    lists: [...(local.drops?.lists || []), ...(remote.drops?.lists || [])],
    symbols: [...(local.drops?.symbols || []), ...(remote.drops?.symbols || [])],
    screens: [...(local.drops?.screens || []), ...(remote.drops?.screens || [])],
    alerts: [...(local.drops?.alerts || []), ...(remote.drops?.alerts || [])],
    notes: [...(local.drops?.notes || []), ...(remote.drops?.notes || [])],
  });
  const deadLists = new Set(drops.lists.map((d) => d.id));
  const deadSymbols = new Set(drops.symbols.map((d) => d.listId + "|" + baseSym(d.symbol)));
  const deadScreens = new Set(drops.screens.map((d) => d.name));
  const deadAlerts = new Set(drops.alerts.map((d) => d.id));
  const deadNotes = new Set(drops.notes.map((d) => d.id));
  const lists = new Map<string, CloudWatch>();
  for (const w of [...(remote.watchlists || []), ...(local.watchlists || [])]) {
    if (!w?.id || deadLists.has(w.id)) continue;
    const prev = lists.get(w.id);
    const symbols = (prev ? prev.symbols : []).concat(w.symbols || []).filter((s, i, arr) => arr.indexOf(s) === i);
    const kept = symbols.filter((s) => !deadSymbols.has(w.id + "|" + baseSym(s)));
    if (!prev) lists.set(w.id, { ...w, symbols: kept });
    else lists.set(w.id, { ...prev, symbols: kept, name: w.name || prev.name });
  }
  const screens = [...(remote.customScreens || [])];
  const names = new Set(screens.map((s) => s.name));
  for (const s of local.customScreens || []) {
    if (s?.name && !names.has(s.name)) screens.push(s);
  }
  const alerts = (localFresh ? remote.alerts || [] : local.alerts?.length ? local.alerts : remote.alerts || []).filter(
    (a) => a && !deadAlerts.has(a.id),
  );
  const journal = (localFresh ? remote.journal || [] : local.journal?.length ? local.journal : remote.journal || []).filter(
    (j) => j && !deadNotes.has(j.id),
  );
  for (const [id, p] of [...byId]) {
    const gone = drops.portfolios.find((d) => d.id === id);
    if (gone && !((p.updatedAt || 0) > gone.at)) {
      byId.delete(id);
      notes.push(`Removed ${p.name} after a delete`);
      continue;
    }
    if (gone) notes.push(`Kept ${p.name} — a newer edit beat a delete`);
    byId.set(id, applyDrops(p, drops));
  }
  const doc: CloudDoc = {
    portfolios: [...byId.values()],
    watchlists: [...lists.values()],
    activeWatchId: localFresh ? remote.activeWatchId || local.activeWatchId || "main" : local.activeWatchId || remote.activeWatchId || "main",
    customScreens: screens.filter((s) => s && !deadScreens.has(s.name)),
    chartPrefs: localFresh ? { ...local.chartPrefs, ...remote.chartPrefs } : { ...remote.chartPrefs, ...local.chartPrefs },
    desk: localFresh ? remote.desk || local.desk : local.desk || remote.desk,
    alerts,
    journal,
    bookNotes: { ...(remote.bookNotes || {}), ...(localFresh ? {} : local.bookNotes || {}) },
    deepFunds: funds,
    symbolAliases: localFresh
      ? { ...(local.symbolAliases || {}), ...(remote.symbolAliases || {}) }
      : { ...(remote.symbolAliases || {}), ...(local.symbolAliases || {}) },
    symbolSkips: [...new Set([...(remote.symbolSkips || []), ...(local.symbolSkips || [])])],
    deviceId: local.deviceId || remote.deviceId,
    savedAt: Math.max(local.savedAt || 0, remote.savedAt || 0) || Date.now(),
    drops,
  };
  const dirty = JSON.stringify(doc) !== JSON.stringify(remote);
  return { doc, dirty, notes };
}

/** Stable body for idempotency. Clock and device fields do not make a retry a new save. */
export function docFingerprint(doc: CloudDoc): string {
  const { savedAt: _saved, deviceId: _device, mutationId: _id, ...rest } = doc;
  return JSON.stringify(rest);
}

export function decideSave(
  server: { rev: number; doc: CloudDoc } | null,
  incoming: CloudDoc,
  baseRev: number,
): { kind: "duplicate"; rev: number } | { kind: "conflict"; rev: number; doc: CloudDoc } | { kind: "write"; rev: number } {
  if (
    server &&
    incoming.mutationId &&
    server.doc.mutationId === incoming.mutationId &&
    docFingerprint(server.doc) === docFingerprint(incoming)
  ) {
    return { kind: "duplicate", rev: server.rev };
  }
  if (server && server.rev !== baseRev) return { kind: "conflict", rev: server.rev, doc: server.doc };
  return { kind: "write", rev: (server?.rev || 0) + 1 };
}
