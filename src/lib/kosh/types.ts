export type ChartMark = {
  id: string;
  kind: "sr" | "swing";
  price: number;
  t?: number;
  label: string;
  tone?: "up" | "down" | "muted" | "chart";
};

export type ScanName = {
  symbol: string;
  name: string;
  fundTag: string;
  qualTag: string;
  pass: "fund" | "qual" | "both" | "neither";
  why: string;
};

export type Bar = { t: number; c: number; raw?: number };

export type OhlcBar = { t: number; o: number; h: number; l: number; c: number; v: number; adj?: number };

export type Quote = {
  input: string;
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  changePct: number;
  high52: number;
  low52: number;
  mcapCr?: number | null;
  preMarket?: number | null;
  error?: string;
  /** Unix ms when this print was fetched. Missing on older cached rows. */
  retrievedAt?: number;
};

export type HistoryPack = {
  input: string;
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  changePct: number;
  high52: number;
  low52: number;
  first: number | null;
  last: number | null;
  sessions: number;
  bars: Bar[];
  missing: boolean;
};

export type OhlcPack = {
  input: string;
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  changePct: number;
  high52: number;
  low52: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  currency: string;
  exchange: string;
  firstTrade: number | null;
  bars: OhlcBar[];
  missing: boolean;
  mcapCr?: number | null;
};

export type TapeRow = { id: string; symbol: string; label: string; price: number; changePct: number; unit?: string };

/** One buy that still sits in a holding. Kept when a trade file is imported. */
export type Lot = {
  qty: number;
  avg: number;
  date: string | null;
  boughtAt?: string | null;
};

export type Holding = {
  symbol: string;
  name: string;
  qty: number;
  avg: number | null;
  date: string | null;
  boughtAt?: string | null;
  isin?: string;
  sector?: string;
  kind?: "equity" | "commodity";
  unit?: string;
  lots?: Lot[];
};

/** One dated buy or sell from a trade file. side 1 = buy, -1 = sell. */
export type TradeLine = {
  symbol: string;
  name: string;
  qty: number;
  price: number;
  date: string | null;
  boughtAt?: string | null;
  side: 1 | -1;
  isin?: string;
  sector?: string;
  /** Broker trade/execution id when the file has one. */
  id?: string;
  /** Original file-row order. Same-day tiebreak when there is no clock. */
  src?: number;
  /** Set when the file had no price and we used that day’s close. */
  priceFilled?: boolean;
};

export type Portfolio = {
  id: string;
  name: string;
  holdings: Holding[];
  bench: string;
  includeCommodities?: boolean;
  trades?: TradeLine[];
};

export type NavPoint = {
  t: number;
  day: string;
  port: number;
  bench: number | null;
  covered: number;
  names: number;
  wAvail: number;
  /** Your path wealth in rupees (or indexed later). Only set when a trade file exists. */
  path?: number | null;
  /** Same rupees into the index on the same days. */
  sameCash?: number | null;
  /** Cash-flow-stripped index (~100 start). Used for Growth / drawdown / rolling. */
  portUnit?: number | null;
  benchUnit?: number | null;
  pathUnit?: number | null;
};

export type MixPath = {
  nav: NavPoint[];
  used: string[];
  missing: string[];
  weights: Record<string, number>;
  coverage: string;
  method: string;
};

export type PathPoint = {
  t: number;
  day: string;
  wealth: number;
  sameCash: number | null;
  /** Time-weighted unit value, 100 on the first day. Ignores extra cash you put in later. */
  unit: number;
  sameUnit: number | null;
  covered: number;
  names: number;
};

export type PathSlicePart = {
  symbol: string;
  name: string;
  qty: number;
  value: number;
};

/** What you actually held on a day (month-end snapshots). */
export type PathSlice = {
  day: string;
  wealth: number;
  parts: PathSlicePart[];
};

/** One name across the whole file — buys, sells, still held. */
export type PathName = {
  symbol: string;
  name: string;
  bought: number;
  sold: number;
  realized: number;
  stillQty: number;
  stillValue: number;
  unrealized: number;
  total: number;
};

export type ClosedTrade = {
  symbol: string;
  name: string;
  qty: number;
  buyDate: string;
  sellDate: string;
  buyPx: number;
  sellPx: number;
  pnl: number;
  pnlPct: number;
  days: number;
  /** Percent move of the stock after the sell. Null when the window is not usable. */
  post1m?: number | null;
  post3m?: number | null;
  post1y?: number | null;
  post1mNote?: string | null;
  post3mNote?: string | null;
  post1yNote?: string | null;
};

export type PathYear = {
  year: string;
  start: number;
  end: number;
  ret: number | null;
  /** Index TWR that same year, same method. */
  bench?: number | null;
  buys: number;
  sells: number;
  buyIn: number;
  sellOut: number;
};

export type BuyAdded = {
  symbol: string;
  name: string;
  qty: number;
  date: string;
  price: number;
  invested: number;
  remainingQty: number;
  valueNow: number;
  pnl: number;
};

export type PathEvent = {
  date: string;
  side: 1 | -1;
  symbol: string;
  name: string;
  qty: number;
  price: number;
  amount: number;
  priceFilled?: boolean;
};

export type PathHeld = {
  symbol: string;
  name: string;
  qty: number;
  avg: number;
  value: number;
};

export type FilledPrice = {
  symbol: string;
  name: string;
  date: string;
  price: number;
  sessionDay: string;
  method: "day-close";
  hadTime: boolean;
};

/** Point-in-time reconstruction from the trade file. Not the current mix. */
export type PathPack = {
  nav: PathPoint[];
  xirr: number | null;
  twr: number | null;
  twrCagr: number | null;
  /** Index price return over the same first→last path days. */
  benchTwr: number | null;
  sameCashLast: number | null;
  sameCashXirr: number | null;
  wealthNow: number;
  from: string | null;
  to: string | null;
  closed: ClosedTrade[];
  stillHeld: PathHeld[];
  neverSoldLast: number | null;
  contrib: BuyAdded[];
  years: PathYear[];
  events: PathEvent[];
  missing: string[];
  used: string[];
  coverage: string;
  nTrades: number;
  nBuys: number;
  nSells: number;
  nUndated: number;
  splitNote: boolean;
  filledPrices: FilledPrice[];
  snapshots: PathSlice[];
  byName: PathName[];
  windows: Record<string, WindowPair>;
  months: MonthRow[];
  risk: RiskMetrics | null;
};


export type WindowPair = { port: number | null; bench: number | null };

export type MonthRow = { key: string; port: number; bench: number | null };

export type RiskMetrics = {
  sharpe: number | null;
  sortino: number | null;
  alpha: number | null;
  beta: number | null;
  corr: number | null;
  vol: number | null;
  maxDd: number | null;
  upCap: number | null;
  downCap: number | null;
  info: number | null;
  calmar: number | null;
  cagr: number | null;
  since: string | null;
  sessions: number;
  windowLabel: string;
};

export type RiskLever = {
  symbol: string;
  name: string;
  weight: number;
  action: "cut" | "trim" | "add";
  label: string;
  sharpe: number | null;
  maxDd: number | null;
  vol: number | null;
  cagr: number | null;
  dSharpe: number | null;
  dMaxDd: number | null;
  dVol: number | null;
  dCagr: number | null;
};

export type HoldingWindows = {
  w1: number | null;
  m1: number | null;
  m3: number | null;
  m6: number | null;
  y1: number | null;
  ytd: number | null;
  cagr: number | null;
  sessions: number;
};

export type HoldingRow = Holding & {
  resolved: string;
  px: number;
  value: number;
  invested: number;
  unreal: number;
  unrealPct: number;
  /** False when average cost is missing. Those rupees are not treated as zero profit. */
  costKnown?: boolean;
  changePct: number;
  high52: number;
  offHigh: number | null;
  sector: string;
  cap: string;
  weight: number;
  periods: HoldingWindows;
  kind: "equity" | "commodity";
  unit: string;
  vsSectorY1?: number | null;
  sectorIndexY1?: number | null;
  sectorIndexName?: string;
  daysHeld?: number | null;
  xirr?: number | null;
  vsNiftyHold?: number | null;
  vsSectorHold?: number | null;
  contrib?: number | null;
};

export type CorrCluster = {
  id: string;
  symbols: string[];
  names: string[];
  weight: number;
  alone?: boolean;
};

export type CorrPack = {
  symbols: string[];
  names: string[];
  weights: number[];
  matrix: (number | null)[][];
  vsNifty: (number | null)[];
  clusters: CorrCluster[];
  /** How many names by weight were actually scored. */
  cap?: number;
};

export type Sleeve = {
  sector: string;
  value: number;
  names: number;
  symbols: string[];
  windows: { m1: number | null; m3: number | null; y1: number | null; ytd: number | null; cagr: number | null };
  indexName: string;
  indexSymbol: string;
  index: { m1: number | null; m3: number | null; y1: number | null; ytd: number | null };
};

export type Insight = { title: string; figure: string; body: string; tone: "good" | "warn" | "bad" };

export type Book = {
  rows: HoldingRow[];
  holdings: HoldingRow[];
  value: number;
  invested: number;
  unreal: number;
  /** Names in the active book with no average cost. Excluded from invested and unrealised. */
  costMissing?: number;
  dayAbs: number;
  dayPct: number;
  /** Set when a large day move was kept instead of being zeroed. */
  dayWarn?: string | null;
  mix: MixPath;
  risk: RiskMetrics;
  windows: { w1: WindowPair; m1: WindowPair; m3: WindowPair; m6: WindowPair; y1: WindowPair; ytd: WindowPair };
  months: MonthRow[];
  cagr: number | null;
  sectors: Record<string, { value: number; pnl: number }>;
  sleeves: Sleeve[];
  caps: Record<string, number>;
  asOf: string;
  hxRange: string;
  benchName: string;
  benchSymbol: string;
  coverage: string;
  missing: string[];
  firstDay?: string;
  lastDay?: string;
  includeCommodities: boolean;
  commodityValue: number;
  equityValue: number;
  levers: RiskLever[];
  corr: CorrPack;
  path?: PathPack | null;
};

export type ChartRange = "1M" | "3M" | "6M" | "YTD" | "1Y" | "2Y" | "3Y" | "5Y" | "10Y" | "MAX" | "CUSTOM";
export type ChartMode = "cum" | "inr" | "roll1y" | "roll3m" | "m" | "w" | "dd" | "gap";

export type BenchMeta = { symbol: string; name: string };

export type FinPoint = { period: string; value: number };
export type ShPoint = { period: string; promoters: number | null; fii: number | null; dii: number | null };

export type Fundamentals = {
  symbol: string;
  searchId: string;
  name: string;
  industry: string;
  ceo: string;
  founded: string;
  summary: string;
  mcapCr: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  de: number | null;
  divYield: number | null;
  eps: number | null;
  book: number | null;
  face: number | null;
  industryPe: number | null;
  salesYoY: number | null;
  profitYoY: number | null;
  sales: FinPoint[];
  profits: FinPoint[];
  qSales: FinPoint[];
  qProfits: FinPoint[];
  netWorth: FinPoint[];
  qNetWorth: FinPoint[];
  shareholding: ShPoint[];
  promoters: number | null;
  fii: number | null;
  dii: number | null;
  roce: number | null;
  peg: number | null;
  /** Forward P/E printed on a free company card. Hidden in UI when missing — never invented. */
  forwardPe?: number | null;
  forwardEps?: number | null;
  forwardPeg?: number | null;
  opm: number | null;
  salesCagr3: number | null;
  profitCagr3: number | null;
  profitCagr5: number | null;
  website: string | null;
  interestCover: number | null;
  pegVia?: string | null;
  ebitda: FinPoint[];
  cfo: FinPoint[];
  qCfo: FinPoint[];
  cfoPat: number | null;
  /** Last yearly sales period on the card, if any. */
  finPeriod?: string | null;
  /** Latest shareholding period label. */
  shPeriod?: string | null;
  retrievedAt?: number | null;
  /** Promoter shares pledged, as % of total equity. Blank if the filing has no number. */
  pledge?: number | null;
  /** Field-level source, period, and conflict. Missing means the number has not been reconciled. */
  provenance?: import("./fact-types.ts").Provenance;
};

export type ScreenRow = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  high52: number;
  low52: number;
  offHigh: number | null;
  ret1m: number | null;
  ret3m: number | null;
  ret1y: number | null;
  vol: number;
  volAvg: number;
  volRatio: number | null;
  rsi: number | null;
  above50: boolean | null;
  above200: boolean | null;
  macdHist: number | null;
  bbPos: number | null;
  nr7: boolean | null;
  gapPct: number | null;
  above21: boolean | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  de: number | null;
  mcapCr: number | null;
  divYield: number | null;
  eps: number | null;
  book: number | null;
  salesYoY: number | null;
  profitYoY: number | null;
  promoters: number | null;
  roce: number | null;
  peg: number | null;
  opm: number | null;
  salesCagr3: number | null;
  profitCagr3: number | null;
  profitCagr5: number | null;
  interestCover?: number | null;
  cfoPat?: number | null;
  pledge?: number | null;
  retest: boolean | null;
  retestLevel: number | null;
  athRetest: boolean | null;
  fii: number | null;
  fiiPrev: number | null;
  fiiDelta: number | null;
  dii: number | null;
  diiPrev: number | null;
  diiDelta: number | null;
  shLabel: string | null;
  vcp: boolean | null;
  vcpBreak: boolean | null;
  vcpN: number | null;
  vcpLastPct: number | null;
  vcpDays: number | null;
  vcpVolX: number | null;
  vcpPivot: number | null;
  /** full = daily history + company card; quote = live print only; name = listed, no print yet */
  depth?: "full" | "quote" | "name";
  thin?: boolean | null;
  /** Set on ranked multibagger screens */
  passCount?: number;
  missed?: string[];
  unchecked?: string[];
  matchKind?: "strict" | "candidate" | "fail" | "unknown";
  isin?: string | null;
  series?: string | null;
  listedOn?: string | null;
  gsm?: boolean | null;
};

export type NewsItem = {
  title: string;
  publisher: string;
  link: string;
  ts: number;
  material?: "high" | "medium" | "low";
};
export type WikiCard = { title: string; extract: string; url: string };

export type JournalEntry = {
  id: string;
  symbol: string;
  note: string;
  setup: string;
  price: number;
  at: number;
};

export type FiidiiRow = {
  date: string;
  fiiNet: number;
  diiNet: number;
  fiiBuy: number;
  fiiSell: number;
  diiBuy: number;
  diiSell: number;
};

export type ResultEvent = {
  symbol: string;
  name: string;
  date: string;
  purpose: string;
  kind: "results" | "stock" | "macro";
  /** Official date is not on file — the day is a calendar convention or a typical window. */
  expected?: boolean;
};

export type DealEvent = {
  symbol: string;
  name: string;
  date: string;
  kind: "bulk" | "block" | "insider";
  note: string;
};

export type MacroPack = { fiidii: FiidiiRow[]; results: ResultEvent[]; deals: DealEvent[]; asOf: string };

export type ChartFacts = {
  interval: string;
  lookback: string;
  last: number;
  rsi: number | null;
  swings: { label: string; price: number; t: number }[];
  levels: { price: number; n: number; labels: string[] }[];
  mtf: { price: number; n: number; labels: string[] }[];
};
