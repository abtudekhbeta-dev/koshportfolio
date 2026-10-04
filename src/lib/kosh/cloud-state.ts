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
}): CloudDoc {
  const funds: CloudDoc["deepFunds"] = {};
  for (const [sym, snap] of Object.entries(input.deepFunds || {})) {
    if (!snap?.fund) continue;
    funds[sym.slice(0, 24)] = { fund: slimFund(snap.fund), at: snap.at || 0, sources: (snap.sources || []).slice(0, 8) };
  }
  return {
    portfolios: (input.portfolios || []).filter((p) => p.id !== "sample").map((p) => sanitizePortfolio(p)),
    watchlists: (input.watchlists || []).slice(0, 20).map((w) => ({
      id: String(w.id || "").slice(0, 40),
      name: String(w.name || "List").slice(0, 40),
      symbols: (w.symbols || []).map((s) => String(s).slice(0, 24)).slice(0, 200),
    })),
    activeWatchId: String(input.activeWatchId || "main").slice(0, 40),
    customScreens: (input.customScreens || []).slice(0, 30),
    chartPrefs: {
      termHeight: input.chartPrefs?.termHeight,
      interval: input.chartPrefs?.interval,
      logScale: input.chartPrefs?.logScale,
      chartMode: input.chartPrefs?.chartMode,
      chartBench: input.chartPrefs?.chartBench,
    },
    desk: input.desk || null,
    alerts: (input.alerts || []).slice(0, 100),
    journal: (input.journal || []).slice(0, 200),
    bookNotes: input.bookNotes || {},
    deepFunds: funds,
    symbolAliases: input.symbolAliases || {},
    symbolSkips: input.symbolSkips || [],
    deviceId: input.deviceId || thisDevice(),
    savedAt: input.savedAt || Date.now(),
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
  return [t.symbol, t.date || "", t.side, t.qty, t.price, t.boughtAt || "", t.src ?? ""].join("|");
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
  return [...map.values()].slice(0, 400);
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
  const screens = [...(remote.customScreens || [])];
  const names = new Set(screens.map((s) => s.name));
  for (const s of local.customScreens || []) {
    if (!names.has(s.name)) screens.push(s);
  }
  const lists = new Map<string, CloudWatch>();
  for (const w of [...(remote.watchlists || []), ...(local.watchlists || [])]) {
    const prev = lists.get(w.id);
    if (!prev) lists.set(w.id, w);
    else {
      const symbols = [...prev.symbols];
      for (const s of w.symbols) if (!symbols.includes(s)) symbols.push(s);
      lists.set(w.id, { ...prev, symbols, name: w.name || prev.name });
    }
  }
  const localFresh = !localPorts.length && !(local.customScreens || []).length && !Object.keys(local.deepFunds || {}).length;
  const doc: CloudDoc = {
    portfolios: [...byId.values()],
    watchlists: [...lists.values()],
    activeWatchId: localFresh ? remote.activeWatchId || local.activeWatchId || "main" : local.activeWatchId || remote.activeWatchId || "main",
    customScreens: screens,
    chartPrefs: localFresh ? { ...local.chartPrefs, ...remote.chartPrefs } : { ...remote.chartPrefs, ...local.chartPrefs },
    desk: localFresh ? remote.desk || local.desk : local.desk || remote.desk,
    alerts: localFresh ? remote.alerts || [] : local.alerts?.length ? local.alerts : remote.alerts || [],
    journal: localFresh ? remote.journal || [] : local.journal?.length ? local.journal : remote.journal || [],
    bookNotes: { ...(remote.bookNotes || {}), ...(localFresh ? {} : local.bookNotes || {}) },
    deepFunds: funds,
    symbolAliases: localFresh
      ? { ...(local.symbolAliases || {}), ...(remote.symbolAliases || {}) }
      : { ...(remote.symbolAliases || {}), ...(local.symbolAliases || {}) },
    symbolSkips: [...new Set([...(remote.symbolSkips || []), ...(local.symbolSkips || [])])],
    deviceId: local.deviceId || remote.deviceId,
    savedAt: Math.max(local.savedAt || 0, remote.savedAt || 0) || Date.now(),
  };
  const dirty = JSON.stringify(doc) !== JSON.stringify(remote);
  return { doc, dirty, notes };
}
