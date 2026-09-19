import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Holding, Portfolio, JournalEntry, TradeLine, Fundamentals } from "@/lib/kosh/types";
import { applyHoldingPatch, fillHoldings, mergeHoldings, mergeTradeLines, sanitizeHoldings, sanitizeTrades, upsertHoldings, type FillOpts } from "@/lib/kosh/parse";
import { samplePortfolio, SAMPLE_TRADES } from "@/lib/kosh/sample";
import type { ScreenFilter, SkillRead } from "@/lib/kosh/screens";

export type IconId = "k-path" | "bowl" | "twin" | "ledger" | "coin" | "fold";
export const ICON_IDS: IconId[] = ["k-path", "bowl", "twin", "ledger", "coin", "fold"];

export type ThemeId = "dark" | "light";
export type BookNoteSnap = { text: string; at: number; nRead: number; nTotal: number };
export type ImproveRun = {
  portfolioId: string;
  done: number;
  total: number;
  name: string;
  stage: "verdict" | "scan" | "refresh";
  skill?: string;
  error?: string;
};
export type DrawKind = "hline" | "trend" | "ray" | "xline" | "rect" | "fib" | "vline" | "long" | "short" | "channel" | "label";
export type DrawShape = {
  id: string;
  kind: DrawKind;
  t0: number;
  y0: number;
  t1?: number;
  y1?: number;
  off?: number;
  label?: string;
};

export type AlertKind = "price" | "pct" | "rsi" | "volume" | "high52" | "low52";
export type AlertRule = { id: string; symbol: string; name: string; price: number; dir: "above" | "below"; kind?: AlertKind };
export type Recent = { symbol: string; name: string };

export type CandleStyle = "candle" | "bar" | "line" | "area";
export type IndId = "ma20" | "ma50" | "ma200" | "bb" | "ema21" | "vwap" | "rsi" | "macd" | "stoch" | "atr" | "supertrend" | "vp";
export type IndFlags = Record<IndId, boolean>;

export const DEFAULT_INDS: IndFlags = {
  ma20: false,
  ma50: false,
  ma200: false,
  bb: false,
  ema21: false,
  vwap: false,
  rsi: false,
  macd: false,
  stoch: false,
  atr: false,
  supertrend: false,
  vp: false,
};

export type ChartPrefs = {
  style: CandleStyle;
  inds: IndFlags;
  volOn: boolean;
  logScale: boolean;
  showLevels: boolean;
  sessionOn: boolean;
  interval: string;
  lookback: string;
  magnet: boolean;
  structOn: boolean;
  patternsOn: boolean;
  rev: number;
};

export const DEFAULT_CHART_PREFS: ChartPrefs = {
  style: "candle",
  inds: { ...DEFAULT_INDS },
  volOn: true,
  logScale: true,
  showLevels: false,
  sessionOn: true,
  interval: "1D",
  lookback: "1Y",
  magnet: false,
  structOn: false,
  patternsOn: false,
  rev: 3,
};

export type NavStyle = "area" | "line" | "step" | "bar" | "columns";
export type NavPrefs = {
  style: NavStyle;
  fill: boolean;
  smaOn: boolean;
  showBench: boolean;
};

export const DEFAULT_NAV_PREFS: NavPrefs = {
  style: "area",
  fill: true,
  smaOn: false,
  showBench: true,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function bareSymbol(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

export function drawKey(symbol: string, interval: string) {
  return `${bareSymbol(symbol)}:${interval || "1D"}`;
}

export function newDrawId() {
  return uid();
}

function migrateDrawings(raw: Record<string, DrawShape[]> | undefined): Record<string, DrawShape[]> {
  const out: Record<string, DrawShape[]> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (!v?.length) continue;
    if (k.includes(":")) out[k] = v;
    else out[`${bareSymbol(k)}:1D`] = v;
  }
  return out;
}

export type WatchList = { id: string; name: string; symbols: string[] };

export function isWatched(symbol: string, list: string[]) {
  const n = bareSymbol(symbol);
  return list.some((x) => bareSymbol(x) === n);
}

function defaultWatchlists(symbols: string[] = []): WatchList[] {
  const main = symbols.map(bareSymbol).filter(Boolean);
  return [
    { id: "main", name: "Main", symbols: main },
    { id: "trade", name: "Trade", symbols: [] },
    { id: "long", name: "Long-term", symbols: [] },
  ];
}

function withDefaultLists(lists: WatchList[], watch: string[] = []): WatchList[] {
  if (!lists.length) return defaultWatchlists(watch);
  if (lists.length >= 2) return lists;
  const haveId = new Set(lists.map((l) => l.id));
  const haveName = new Set(lists.map((l) => l.name.toLowerCase()));
  const extras = defaultWatchlists().filter(
    (d) => d.id !== "main" && !haveId.has(d.id) && !haveName.has(d.name.toLowerCase()),
  );
  return extras.length ? [...lists, ...extras] : lists;
}

export type DeepFundSnap = { fund: Fundamentals; at: number; sources: string[] };

type KoshState = {
  portfolios: Portfolio[];
  iconId: IconId;
  theme: ThemeId;
  watch: string[];
  watchlists: WatchList[];
  activeWatchId: string;
  recents: Recent[];
  alerts: AlertRule[];
  journal: JournalEntry[];
  drawings: Record<string, DrawShape[]>;
  customScreens: ScreenFilter[];
  skillReads: Record<string, SkillRead>;
  bookNotes: Record<string, BookNoteSnap>;
  improveRun: ImproveRun | null;
  qualitySeed: string[];
  tourDone: boolean;
  chartPrefs: ChartPrefs;
  navPrefs: NavPrefs;
  deepFunds: Record<string, DeepFundSnap>;
  hydrate: (ports: Portfolio[]) => void;
  setIconId: (id: IconId) => void;
  setTheme: (t: ThemeId) => void;
  addPortfolio: (name: string, holdings?: Holding[], bench?: string, trades?: TradeLine[]) => string;
  renamePortfolio: (id: string, name: string) => void;
  duplicatePortfolio: (id: string) => string | null;
  deletePortfolio: (id: string) => void;
  setBench: (id: string, bench: string) => void;
  setIncludeCommodities: (id: string, on: boolean) => void;
  addHoldings: (id: string, incoming: Holding[]) => void;
  fillHoldings: (id: string, incoming: Holding[], opts?: FillOpts) => void;
  upsertHoldings: (id: string, incoming: Holding[]) => void;
  updateHolding: (id: string, symbol: string, patch: Partial<Holding>) => void;
  removeHolding: (id: string, symbol: string) => void;
  replaceHoldings: (id: string, holdings: Holding[]) => void;
  setTrades: (id: string, trades: TradeLine[]) => void;
  mergeTrades: (id: string, trades: TradeLine[]) => void;
  setDeepFund: (symbol: string, snap: DeepFundSnap) => void;
  setDeepFunds: (rows: Record<string, DeepFundSnap>) => void;
  toggleWatch: (symbol: string) => void;
  addWatchList: (name: string) => string;
  renameWatchList: (id: string, name: string) => void;
  deleteWatchList: (id: string) => void;
  setActiveWatchId: (id: string) => void;
  pushRecent: (r: Recent) => void;
  addAlert: (a: Omit<AlertRule, "id">) => void;
  removeAlert: (id: string) => void;
  addJournal: (e: Omit<JournalEntry, "id" | "at"> & { at?: number }) => void;
  removeJournal: (id: string) => void;
  setDrawings: (symbol: string, shapes: DrawShape[]) => void;
  saveCustomScreen: (f: ScreenFilter) => void;
  removeCustomScreen: (name: string) => void;
  setSkillRead: (r: SkillRead) => void;
  setSkillReads: (rows: SkillRead[]) => void;
  setBookNote: (portfolioId: string, note: BookNoteSnap) => void;
  setImproveRun: (run: ImproveRun | null) => void;
  setQualitySeed: (names: string[]) => void;
  setTourDone: (on: boolean) => void;
  patchChartPrefs: (p: Omit<Partial<ChartPrefs>, "inds"> & { inds?: Partial<IndFlags> }) => void;
  patchNavPrefs: (p: Partial<NavPrefs>) => void;
};

export const useKosh = create<KoshState>()(
  persist(
    (set, get) => ({
      portfolios: [samplePortfolio()],
      iconId: "k-path",
      theme: "dark",
      watch: [],
      watchlists: defaultWatchlists(),
      activeWatchId: "main",
      recents: [],
      alerts: [],
      journal: [],
      drawings: {},
      customScreens: [],
      skillReads: {},
      bookNotes: {},
      improveRun: null,
      qualitySeed: [],
      tourDone: false,
      chartPrefs: { ...DEFAULT_CHART_PREFS, inds: { ...DEFAULT_INDS } },
      navPrefs: { ...DEFAULT_NAV_PREFS },
      deepFunds: {},
      hydrate: (ports) => {
        if (ports.length)
          set({
            portfolios: ports.map((p) => ({
              ...p,
              holdings: sanitizeHoldings(p.holdings || []),
              trades: sanitizeTrades(p.trades),
            })),
          });
      },
      setIconId: (iconId) => set({ iconId }),
      setTheme: (theme) => set({ theme }),
      addPortfolio: (name, holdings = [], bench = "nifty", trades = []) => {
        const id = uid();
        set({
          portfolios: [
            {
              id,
              name: name || "Main",
              holdings: sanitizeHoldings(holdings),
              bench,
              includeCommodities: true,
              trades: sanitizeTrades(trades),
            },
            ...get().portfolios,
          ],
        });
        return id;
      },
      renamePortfolio: (id, name) =>
        set({ portfolios: get().portfolios.map((p) => (p.id === id ? { ...p, name } : p)) }),
      duplicatePortfolio: (id) => {
        const p = get().portfolios.find((x) => x.id === id);
        if (!p) return null;
        return get().addPortfolio(`${p.name} copy`, p.holdings, p.bench, p.trades);
      },
      deletePortfolio: (id) => set({ portfolios: get().portfolios.filter((p) => p.id !== id) }),
      setBench: (id, bench) =>
        set({ portfolios: get().portfolios.map((p) => (p.id === id ? { ...p, bench } : p)) }),
      setIncludeCommodities: (id, on) =>
        set({
          portfolios: get().portfolios.map((p) => (p.id === id ? { ...p, includeCommodities: on } : p)),
        }),
      addHoldings: (id, incoming) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id ? { ...p, holdings: mergeHoldings(p.holdings, sanitizeHoldings(incoming)) } : p,
          ),
        }),
      fillHoldings: (id, incoming, opts) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id ? { ...p, holdings: fillHoldings(sanitizeHoldings(p.holdings), incoming, opts) } : p,
          ),
        }),
      upsertHoldings: (id, incoming) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id ? { ...p, holdings: upsertHoldings(sanitizeHoldings(p.holdings), incoming) } : p,
          ),
        }),
      updateHolding: (id, symbol, patch) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id
              ? { ...p, holdings: p.holdings.map((h) => (h.symbol === symbol ? applyHoldingPatch(h, patch) : h)) }
              : p,
          ),
        }),
      removeHolding: (id, symbol) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id ? { ...p, holdings: p.holdings.filter((h) => h.symbol !== symbol) } : p,
          ),
        }),
      replaceHoldings: (id, holdings) =>
        set({ portfolios: get().portfolios.map((p) => (p.id === id ? { ...p, holdings } : p)) }),
      setTrades: (id, trades) =>
        set({
          portfolios: get().portfolios.map((p) => (p.id === id ? { ...p, trades: sanitizeTrades(trades) } : p)),
        }),
      mergeTrades: (id, trades) =>
        set({
          portfolios: get().portfolios.map((p) =>
            p.id === id ? { ...p, trades: mergeTradeLines(p.trades || [], sanitizeTrades(trades)) } : p,
          ),
        }),
      setDeepFund: (symbol, snap) =>
        set({
          deepFunds: { ...get().deepFunds, [bareSymbol(symbol)]: snap },
        }),
      setDeepFunds: (rows) =>
        set({
          deepFunds: { ...get().deepFunds, ...rows },
        }),
      toggleWatch: (symbol) => {
        const n = bareSymbol(symbol);
        const id = get().activeWatchId;
        const lists = get().watchlists.length ? get().watchlists : defaultWatchlists(get().watch);
        const next = lists.map((l) => {
          if (l.id !== id) return l;
          const cur = l.symbols.map(bareSymbol);
          return { ...l, symbols: cur.includes(n) ? cur.filter((x) => x !== n) : [n, ...cur].slice(0, 80) };
        });
        const active = next.find((l) => l.id === id) || next[0];
        set({ watchlists: next, watch: active?.symbols || [], activeWatchId: active?.id || id });
      },
      addWatchList: (name) => {
        const id = uid();
        const lists = get().watchlists.length ? get().watchlists : defaultWatchlists(get().watch);
        const row: WatchList = { id, name: (name || "List").slice(0, 32), symbols: [] };
        set({ watchlists: [...lists, row].slice(0, 12), activeWatchId: id, watch: [] });
        return id;
      },
      renameWatchList: (id, name) =>
        set({
          watchlists: get().watchlists.map((l) => (l.id === id ? { ...l, name: name.slice(0, 32) } : l)),
        }),
      deleteWatchList: (id) => {
        const lists = get().watchlists.filter((l) => l.id !== id);
        const next = lists.length ? lists : defaultWatchlists();
        const active = next.find((l) => l.id === get().activeWatchId) || next[0];
        set({ watchlists: next, activeWatchId: active.id, watch: active.symbols });
      },
      setActiveWatchId: (id) => {
        const lists = get().watchlists;
        const active = lists.find((l) => l.id === id);
        if (!active) return;
        set({ activeWatchId: id, watch: active.symbols });
      },
      pushRecent: (r) => {
        const n = bareSymbol(r.symbol);
        const rest = get().recents.filter((x) => bareSymbol(x.symbol) !== n);
        set({ recents: [{ symbol: n, name: r.name }, ...rest].slice(0, 12) });
      },
      addAlert: (a) =>
        set({
          alerts: [{ ...a, id: uid(), symbol: bareSymbol(a.symbol), kind: a.kind || "price" }, ...get().alerts].slice(0, 40),
        }),
      removeAlert: (id) => set({ alerts: (get().alerts || []).filter((x) => x.id !== id) }),
      addJournal: (e) =>
        set({
          journal: [
            {
              id: uid(),
              symbol: bareSymbol(e.symbol),
              note: String(e.note || "").slice(0, 400),
              setup: String(e.setup || "").slice(0, 80),
              price: Number(e.price) || 0,
              at: e.at || Date.now(),
            },
            ...get().journal,
          ].slice(0, 80),
        }),
      removeJournal: (id) => set({ journal: (get().journal || []).filter((x) => x.id !== id) }),
      setDrawings: (symbol, shapes) =>
        set({ drawings: { ...get().drawings, [symbol.includes(":") ? symbol : drawKey(symbol, "1D")]: shapes.slice(0, 80) } }),
      saveCustomScreen: (f) =>
        set({
          customScreens: [f, ...get().customScreens.filter((x) => x.name !== f.name)].slice(0, 20),
        }),
      removeCustomScreen: (name) =>
        set({ customScreens: get().customScreens.filter((x) => x.name !== name) }),
      setSkillRead: (r) =>
        set({ skillReads: { ...get().skillReads, [bareSymbol(r.symbol)]: r } }),
      setSkillReads: (rows) =>
        set({
          skillReads: {
            ...get().skillReads,
            ...Object.fromEntries(rows.map((r) => [bareSymbol(r.symbol), r])),
          },
        }),
      setBookNote: (portfolioId, note) =>
        set({ bookNotes: { ...get().bookNotes, [portfolioId]: note } }),
      setImproveRun: (improveRun) => set({ improveRun }),
      setQualitySeed: (names) =>
        set({ qualitySeed: names.map(bareSymbol).filter(Boolean).slice(0, 6) }),
      setTourDone: (tourDone) => set({ tourDone }),
      patchChartPrefs: (p) =>
        set((s) => ({
          chartPrefs: {
            ...s.chartPrefs,
            ...p,
            inds: p.inds ? { ...s.chartPrefs.inds, ...p.inds } : s.chartPrefs.inds,
          },
        })),
      patchNavPrefs: (p) => set((s) => ({ navPrefs: { ...s.navPrefs, ...p } })),
    }),
    {
      name: "kosh-v2",
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<KoshState>;
        const watchlists = withDefaultLists(
          p.watchlists && p.watchlists.length ? p.watchlists : defaultWatchlists(p.watch || []),
          p.watch || [],
        );
        const activeWatchId =
          p.activeWatchId && watchlists.some((l) => l.id === p.activeWatchId)
            ? p.activeWatchId
            : watchlists[0].id;
        const watch = (watchlists.find((l) => l.id === activeWatchId) || watchlists[0]).symbols;
        return {
          ...current,
          ...p,
          theme: p.theme === "light" ? "light" : "dark",
          watch,
          watchlists,
          activeWatchId,
          recents: p.recents || [],
          alerts: p.alerts || [],
          journal: p.journal || [],
          drawings: migrateDrawings(p.drawings),
          customScreens: p.customScreens || [],
          skillReads: p.skillReads || {},
          bookNotes: p.bookNotes || {},
          improveRun: null,
          qualitySeed: p.qualitySeed || [],
          tourDone: Boolean(p.tourDone),
          chartPrefs: (() => {
            const old = (p.chartPrefs || {}) as Partial<ChartPrefs>;
            const migrated = (old.rev ?? 0) >= 3;
            return {
              ...DEFAULT_CHART_PREFS,
              ...old,
              inds: { ...DEFAULT_INDS, ...(old.inds || {}) },
              logScale: migrated ? Boolean(old.logScale) : true,
              showLevels: old.showLevels === true,
              magnet: old.magnet === true,
              structOn: old.structOn === true,
              patternsOn: old.patternsOn === true,
              rev: 3,
            };
          })(),
          navPrefs: { ...DEFAULT_NAV_PREFS, ...(p.navPrefs || {}) },
          deepFunds: p.deepFunds || {},
          portfolios: (p.portfolios?.length ? p.portfolios : current.portfolios).map((port) => ({
            ...port,
            holdings: sanitizeHoldings(port.holdings || []),
            trades: sanitizeTrades(
              port.trades?.length ? port.trades : port.id === "sample" ? SAMPLE_TRADES : [],
            ),
          })),
        };
      },
    },
  ),
);

export function usePortfolio(id: string | undefined) {
  return useKosh((s) => s.portfolios.find((p) => p.id === id));
}
