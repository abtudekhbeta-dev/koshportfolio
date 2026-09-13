import { N500_SECTORS } from "./nse-sectors.ts";

export function baseSym(s: string): string {
  return String(s || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "")
    .replace(/-/g, "_")
    .replace(/&/g, "_");
}

const SECTORS: Record<string, string> = {
  RELIANCE: "Energy",
  ONGC: "Energy",
  NTPC: "Energy",
  POWERGRID: "Energy",
  COALINDIA: "Energy",
  IOC: "Energy",
  BPCL: "Energy",
  HINDPETRO: "Energy",
  GAIL: "Energy",
  ADANIGREEN: "Energy",
  ADANIPOWER: "Energy",
  TATAPOWER: "Energy",
  JSWENERGY: "Energy",
  NHPC: "Energy",
  OIL: "Energy",
  PETRONET: "Energy",
  IGL: "Energy",
  GUJGASLTD: "Energy",
  TCS: "IT",
  INFY: "IT",
  WIPRO: "IT",
  HCLTECH: "IT",
  TECHM: "IT",
  LTIM: "IT",
  PERSISTENT: "IT",
  COFORGE: "IT",
  MPHASIS: "IT",
  LTTS: "IT",
  OFSS: "IT",
  TATATECH: "IT",
  KPITTECH: "IT",
  CYIENT: "IT",
  HDFCBANK: "Financials",
  ICICIBANK: "Financials",
  SBIN: "Financials",
  KOTAKBANK: "Financials",
  AXISBANK: "Financials",
  INDUSINDBK: "Financials",
  BANDHANBNK: "Financials",
  FEDERALBNK: "Financials",
  IDFCFIRSTB: "Financials",
  PNB: "Financials",
  BANKBARODA: "Financials",
  CANBK: "Financials",
  UNIONBANK: "Financials",
  AUBANK: "Financials",
  BAJFINANCE: "Financials",
  BAJAJFINSV: "Financials",
  HDFCLIFE: "Financials",
  SBILIFE: "Financials",
  ICICIPRULI: "Financials",
  ICICIGI: "Financials",
  HDFCAMC: "Financials",
  PFC: "Financials",
  RECLTD: "Financials",
  CHOLAFIN: "Financials",
  MUTHOOTFIN: "Financials",
  SHRIRAMFIN: "Financials",
  LICI: "Financials",
  JIOFIN: "Financials",
  PAISALO: "Financials",
  PRUDENT: "Financials",
  LICHSGFIN: "Financials",
  POONAWALLA: "Financials",
  MANAPPURAM: "Financials",
  BHARTIARTL: "Telecom",
  IDEA: "Telecom",
  TATACOMM: "Telecom",
  INDUSTOWER: "Telecom",
  TATAMOTORS: "Auto",
  M_M: "Auto",
  MARUTI: "Auto",
  BAJAJ_AUTO: "Auto",
  HEROMOTOCO: "Auto",
  EICHERMOT: "Auto",
  TVSMOTOR: "Auto",
  MOTHERSON: "Auto",
  BOSCHLTD: "Auto",
  TIINDIA: "Auto",
  BHARATFORG: "Auto",
  BALKRISIND: "Auto",
  MRF: "Auto",
  APOLLOTYRE: "Auto",
  ASHOKLEY: "Auto",
  SONACOMS: "Auto",
  UNIMOTOR: "Auto",
  PRICOLLTD: "Auto",
  SUNPHARMA: "Healthcare",
  DRREDDY: "Healthcare",
  CIPLA: "Healthcare",
  DIVISLAB: "Healthcare",
  APOLLOHOSP: "Healthcare",
  MAXHEALTH: "Healthcare",
  TORNTPHARM: "Healthcare",
  AUROPHARMA: "Healthcare",
  LUPIN: "Healthcare",
  ALKEM: "Healthcare",
  BIOCON: "Healthcare",
  LAURUSLABS: "Healthcare",
  GLENMARK: "Healthcare",
  FORTIS: "Healthcare",
  METROPOLIS: "Healthcare",
  SYNGENE: "Healthcare",
  HINDUNILVR: "FMCG",
  ITC: "FMCG",
  NESTLEIND: "FMCG",
  BRITANNIA: "FMCG",
  TATACONSUM: "FMCG",
  DABUR: "FMCG",
  MARICO: "FMCG",
  GODREJCP: "FMCG",
  COLPAL: "FMCG",
  VBL: "FMCG",
  UNITDSPR: "FMCG",
  RADICO: "FMCG",
  TATACOFFEE: "FMCG",
  LT: "Industrials",
  BEL: "Industrials",
  SIEMENS: "Industrials",
  HAL: "Industrials",
  ABB: "Industrials",
  CGPOWER: "Industrials",
  CUMMINSIND: "Industrials",
  BHEL: "Industrials",
  POLYCAB: "Industrials",
  HAVELLS: "Industrials",
  VOLTAS: "Industrials",
  BLUESTARCO: "Industrials",
  ASTRAL: "Industrials",
  DIXON: "Industrials",
  KAYNES: "Industrials",
  ADANIENT: "Industrials",
  ADANIPORTS: "Industrials",
  CONCOR: "Industrials",
  IRFC: "Industrials",
  IRCTC: "Consumer",
  TATASTEEL: "Materials",
  HINDALCO: "Materials",
  JSWSTEEL: "Materials",
  VEDL: "Materials",
  JINDALSTEL: "Materials",
  SAIL: "Materials",
  NMDC: "Materials",
  HINDZINC: "Materials",
  NATIONALUM: "Materials",
  ULTRACEMCO: "Materials",
  SHREECEM: "Materials",
  AMBUJACEM: "Materials",
  ACC: "Materials",
  DALBHARAT: "Materials",
  JKCEMENT: "Materials",
  ASIANPAINT: "Materials",
  BERGEPAINT: "Materials",
  GRASIM: "Materials",
  PIDILITIND: "Chemicals",
  SRF: "Chemicals",
  DEEPAKNTR: "Chemicals",
  PIIND: "Chemicals",
  UPL: "Chemicals",
  SOLARINDS: "Chemicals",
  NAVINFLUOR: "Chemicals",
  AARTIIND: "Chemicals",
  PRIVISCL: "Chemicals",
  COROMANDEL: "Chemicals",
  DLF: "Realty",
  GODREJPROP: "Realty",
  PRESTIGE: "Realty",
  LODHA: "Realty",
  OBEROIRLTY: "Realty",
  PHOENIXLTD: "Realty",
  BRIGADE: "Realty",
  ZOMATO: "Consumer",
  ETERNAL: "Consumer",
  NYKAA: "Consumer",
  TRENT: "Consumer",
  DMART: "Consumer",
  TITAN: "Consumer",
  PAYTM: "Consumer",
  NAUKRI: "Consumer",
  INDIGO: "Consumer",
  PAGEIND: "Consumer",
  KALYANKJIL: "Consumer",
  CROMPTON: "Consumer",
  WHIRLPOOL: "Consumer",
  ESCORTS: "Auto",
  HSCL: "Chemicals",
  RADHIKAJWE: "Consumer",
  ATLANTAELE: "Industrials",
  STALLION: "Chemicals",
  NPST: "IT",
  POCL: "Materials",
  ALLCARGO: "Industrials",
  ACLGLOBL: "Industrials",
  AGL: "Industrials",
  WOCKPHARMA: "Healthcare",
  SHUKRAPHAR: "Healthcare",
  ESFL: "Chemicals",
  ESFL_SM: "Chemicals",
  DWARKESH: "FMCG",
  TIMEX: "Consumer",
  ADANIENSOL: "Energy",
  CDSL: "Financials",
  KOLTEPATIL: "Realty",
  NATCOPHARM: "Healthcare",
  UJJIVANSFB: "Financials",
  VMART: "Consumer",
  CANHLIFE: "Financials",
  GOLD: "Commodities",
  SILVER: "Commodities",
};

export const LARGE_CAP = new Set([
  "RELIANCE", "TCS", "HDFCBANK", "BHARTIARTL", "ICICIBANK", "SBIN", "INFY", "LICI", "ITC", "HINDUNILVR",
  "LT", "BAJFINANCE", "HCLTECH", "MARUTI", "SUNPHARMA", "KOTAKBANK", "AXISBANK", "ONGC", "NTPC", "TITAN",
  "ADANIENT", "ADANIPORTS", "POWERGRID", "ULTRACEMCO", "WIPRO", "ASIANPAINT", "BAJAJFINSV", "TATAMOTORS",
  "COALINDIA", "NESTLEIND", "JSWSTEEL", "TATASTEEL", "M_M", "TECHM", "HINDALCO", "GRASIM", "CIPLA",
  "DRREDDY", "APOLLOHOSP", "EICHERMOT", "DIVISLAB", "TATACONSUM", "BAJAJ_AUTO", "HEROMOTOCO", "BEL",
  "TRENT", "ADANIGREEN", "ADANIPOWER", "JIOFIN", "ETERNAL", "ZOMATO", "HDFCLIFE", "SBILIFE", "BPCL",
  "IOC", "HINDZINC", "VEDL", "INDIGO", "SHREECEM", "DMART", "BRITANNIA", "GODREJCP", "PIDILITIND",
  "DABUR", "HAVELLS", "SIEMENS", "ABB", "HAL", "PFC", "RECLTD", "CHOLAFIN", "TVSMOTOR", "BOSCHLTD",
  "INDUSINDBK", "BANKBARODA", "PNB", "CANBK", "SHRIRAMFIN", "ICICIGI", "ICICIPRULI", "MAXHEALTH",
  "LODHA", "DLF", "AMBUJACEM", "JINDALSTEL", "GAIL", "TATAPOWER",
  "MOTHERSON", "POLYCAB", "DIXON", "UNITDSPR", "VBL", "NAUKRI", "IRFC", "LTIM",
]);

export function sectorOf(symbol: string, yahooSector?: string): string {
  const raw = String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  const b = baseSym(symbol);
  if (SECTORS[b]) return SECTORS[b];
  if (N500_SECTORS[raw] || N500_SECTORS[b]) return N500_SECTORS[raw] || N500_SECTORS[b];
  const ys = String(yahooSector || "").toLowerCase();
  if (!ys) return "Other";
  if (/(bank|nbfc|finance|insurance|capital market|financial)/.test(ys)) return "Financials";
  if (/(it |software|tech|computer|information)/.test(ys)) return "IT";
  if (/(oil|gas|energy|power|utility)/.test(ys)) return "Energy";
  if (/(pharma|health|drug|hospital|biotech)/.test(ys)) return "Healthcare";
  if (/(auto|motor|tyre|vehicle)/.test(ys)) return "Auto";
  if (/(fmcg|consumer staple|food|beverage|tobacco)/.test(ys)) return "FMCG";
  if (/(consumer discret|retail|apparel|internet)/.test(ys)) return "Consumer";
  if (/(cement|steel|metal|mining|commodity)/.test(ys)) return "Materials";
  if (/(realty|real estate)/.test(ys)) return "Realty";
  if (/(telecom|communication)/.test(ys)) return "Telecom";
  if (/(chem|specialty)/.test(ys)) return "Chemicals";
  if (/(capital good|industrial|engineering|defence|defense)/.test(ys)) return "Industrials";
  return "Other";
}

export type CapBucket = "Large" | "Mid" | "Small" | "Micro";

export function capFromMcap(mcapCr: number | null | undefined, symbol?: string): CapBucket {
  if (mcapCr != null && Number.isFinite(mcapCr) && mcapCr > 0) {
    if (mcapCr >= 20_000) return "Large";
    if (mcapCr >= 5_000) return "Mid";
    if (mcapCr >= 500) return "Small";
    return "Micro";
  }
  if (symbol && LARGE_CAP.has(baseSym(symbol))) return "Large";
  return "Small";
}

export function capOf(symbol: string): CapBucket {
  return capFromMcap(null, symbol);
}
