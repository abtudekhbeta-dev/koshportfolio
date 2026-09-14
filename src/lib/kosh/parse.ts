import type { Holding } from "./types";
import {
  ISIN_TO_TICKER,
  TICKER_NAMES,
  displayName,
  isEquityIsin,
  isIsin,
  isMfIsin,
  normalizeSectorLabel,
} from "./names.ts";
import { baseSym } from "./sectors.ts";

const SYM_KEYS = [
  "tradingsymbol",
  "nscesymbol",
  "nsecode",
  "bsecode",
  "symbol",
  "ticker",
  "scripcode",
  "instrument",
  "stock",
  "scrip",
  "script",
  "scriptname",
  "scripname",
  "exchangesymbol",
  "companysymbol",
  "stockname",
  "companyname",
  "company",
  "securityname",
  "security",
  "name",
];

const ISIN_KEYS = ["isin", "isincode", "isinnos", "isino", "isincodeisin", "isincodeofsecurity"];

const QTY_KEYS = [
  "qty",
  "quantity",
  "netqty",
  "freeqty",
  "holdingqty",
  "availableqty",
  "closingqty",
  "balqty",
  "balanceqty",
  "netquantity",
  "quantityavailable",
  "qtyavailable",
  "shares",
  "units",
  "tqty",
  "freequantity",
  "netquantityavailable",
  "tradedqty",
  "tradeqty",
  "tradedquantity",
  "filledqty",
  "executedqty",
  "fillqty",
  "currentqty",
  "holdingquantity",
  "netholding",
  "qtyheld",
  "settledqty",
  "availablequantity",
  "qtyheldinaccount",
];

const AVG_KEYS = [
  "avg",
  "avgprice",
  "averageprice",
  "avgunitcost",
  "averageunitcost",
  "avgunitprice",
  "unitcost",
  "buyavg",
  "buyprice",
  "costprice",
  "averagecost",
  "avgcost",
  "avgcostprice",
  "averagecostprice",
  "buyavgprice",
  "netprice",
  "weightedavg",
  "wap",
  "avgprc",
  "average",
  "avgcostvalue",
  "buyaverage",
  "purchaseprice",
  "buyingprice",
  "buycost",
  "costaverage",
  "holdingavg",
  "netavg",
  "tradeprice",
  "tradedprice",
  "rate",
  "priceperunit",
  "executionprice",
  "averagebuyprice",
  "buyrate",
  "costpershare",
  "pricepershare",
];

const INVESTED_KEYS = [
  "investedvalue",
  "invested",
  "investmentvalue",
  "investment",
  "totalcost",
  "buyvalue",
  "costvalue",
  "totalinvested",
  "investvalue",
  "amountinvested",
  "totalinvestment",
  "buyamount",
];

const DATE_KEYS = [
  "date",
  "buydate",
  "tradedate",
  "purchasedate",
  "acquiredon",
  "firstbuydate",
  "transactiondate",
  "orderdate",
  "settlementdate",
  "buydateandtime",
  "tradedatetime",
  "executiontime",
  "tradetime",
  "time",
  "datetime",
  "timestamp",
  "purchasedatetime",
  "orderexecutiontime",
  "firsttransactiondate",
  "acquisitiondate",
  "avgdate",
  "holdingdate",
  "purchasedon",
  "dateofpurchase",
  "dateofacquisition",
  "acquireddate",
  "entrydate",
];

const NAME_KEYS = [
  "companyname",
  "company",
  "securityname",
  "stockname",
  "scriptname",
  "scripname",
  "script",
  "scrip",
  "name",
  "instrument",
  "stock",
];

const SECTOR_KEYS = [
  "sector",
  "industry",
  "nseindustry",
  "bseindustry",
  "industryname",
  "gics",
  "gicsector",
  "industryclassification",
  "segment",
  "basicindustry",
];

const SIDE_KEYS = [
  "side",
  "buysell",
  "buyorsell",
  "transactiontype",
  "transaction",
  "tradetype",
  "action",
  "drcr",
  "debitcredit",
  "bs",
  "ordertype",
  "type",
];
const BUYQTY_KEYS = ["buyqty", "buyquantity", "boughtqty", "purchaseqty"];
const SELLQTY_KEYS = ["sellqty", "sellquantity", "soldqty", "saleqty"];
const TYPE_KEYS = ["securitytype", "instrumenttype", "instrument", "type", "assetclass", "segmenttype"];

const SKIP_SYM =
  /^(total|grandtotal|subtotal|net|portfolio|cash|equity|summary|holdings|instrument|totalholdingsvalue|totalderivativesopenpositions)$/i;
const FUND_RE = /\b(mutual\s+fund|index\s+fund|liquid\s+fund|flexi\s*cap|\betf\b|\belss\b|direct plan)\b/i;
const SERIES_SFX = /-(T|BE|SM|EQ|BL|PP|Q|Z|TB|XT|SG|X|GC|ST|IL|BT|BZ|A|B)$/i;

const NAME_TO_TICKER: Record<string, string> = {
  RELIANCE: "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  TCS: "TCS",
  "TATA CONSULTANCY": "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  "HDFC BANK": "HDFCBANK",
  HDFCBANK: "HDFCBANK",
  INFOSYS: "INFY",
  INFY: "INFY",
  "BHARTI AIRTEL": "BHARTIARTL",
  BHARTI: "BHARTIARTL",
  AIRTEL: "BHARTIARTL",
  ITC: "ITC",
  "LARSEN AND TOUBRO": "LT",
  "L AND T": "LT",
  LT: "LT",
  "SUN PHARMA": "SUNPHARMA",
  "SUN PHARMACEUTICAL": "SUNPHARMA",
  "SUN PHARMACEUTICAL INDUSTRIES": "SUNPHARMA",
  "ICICI BANK": "ICICIBANK",
  "KOTAK MAHINDRA BANK": "KOTAKBANK",
  "KOTAK BANK": "KOTAKBANK",
  "STATE BANK OF INDIA": "SBIN",
  SBI: "SBIN",
  "AXIS BANK": "AXISBANK",
  "HCL TECHNOLOGIES": "HCLTECH",
  "HCL TECH": "HCLTECH",
  WIPRO: "WIPRO",
  "TATA MOTORS": "TATAMOTORS",
  "MARUTI SUZUKI": "MARUTI",
  MARUTI: "MARUTI",
  "HINDUSTAN UNILEVER": "HINDUNILVR",
  HUL: "HINDUNILVR",
  "BAJAJ FINANCE": "BAJFINANCE",
  "ASIAN PAINTS": "ASIANPAINT",
  NTPC: "NTPC",
  ONGC: "ONGC",
  "POWER GRID": "POWERGRID",
  POWERGRID: "POWERGRID",
  "COAL INDIA": "COALINDIA",
  "TATA STEEL": "TATASTEEL",
  "JSW STEEL": "JSWSTEEL",
  HINDALCO: "HINDALCO",
  "ULTRATECH CEMENT": "ULTRACEMCO",
  NESTLE: "NESTLEIND",
  TITAN: "TITAN",
  "ADANI ENTERPRISES": "ADANIENT",
  "ADANI PORTS": "ADANIPORTS",
  "MAHINDRA AND MAHINDRA": "M_M",
  "M AND M": "M_M",
  "TECH MAHINDRA": "TECHM",
  "DR REDDYS": "DRREDDY",
  "DR REDDY": "DRREDDY",
  CIPLA: "CIPLA",
  DIVIS: "DIVISLAB",
  "DIVIS LABORATORIES": "DIVISLAB",
  "APOLLO HOSPITALS": "APOLLOHOSP",
  "EICHER MOTORS": "EICHERMOT",
  "BAJAJ AUTO": "BAJAJ_AUTO",
  "HERO MOTOCORP": "HEROMOTOCO",
  "TATA CONSUMER": "TATACONSUM",
  "TATA POWER": "TATAPOWER",
  TATAPOWER: "TATAPOWER",
  "INDUSIND BANK": "INDUSINDBK",
  "BAJAJ FINSERV": "BAJAJFINSV",
  "HDFC LIFE": "HDFCLIFE",
  "SBI LIFE": "SBILIFE",
  GRASIM: "GRASIM",
  BEL: "BEL",
  "BHARAT ELECTRONICS": "BEL",
  TRENT: "TRENT",
  ETERNAL: "ETERNAL",
  ZOMATO: "ETERNAL",
  "ESCORTS KUBOTA": "ESCORTS",
  ESCORTS: "ESCORTS",
  "HIMADRI SPECIALITY": "HSCL",
  "HIMADRI SPECIALITY CHEMICAL": "HSCL",
  HIMADRI: "HSCL",
  "RADHIKA JEWELTECH": "RADHIKAJWE",
  RADHIKA: "RADHIKAJWE",
  "ATLANTA ELECTRICALS": "ATLANTAELE",
  ATLANTA: "ATLANTAELE",
  "PAISALO DIGITAL": "PAISALO",
  PAISALO: "PAISALO",
  "STALLION INDIA": "STALLION",
  "STALLION INDIA FLUOROCHEMICALS": "STALLION",
  "STALLION FLUOROCHEMICALS": "STALLION",
  STALLION: "STALLION",
  "CANARA HSBC": "CANHLIFE",
  "CANARA HSBC LIFE": "CANHLIFE",
  "CANARA HSBC LIFE INSURANCE": "CANHLIFE",
  "NETWORK PEOPLE": "NPST",
  "NETWORK PEOPLE SERVICES": "NPST",
  "NETWORK PEOPLE SERVICES TECHNOLOGIES": "NPST",
  NPST: "NPST",
  "DWARIKESH SUGAR": "DWARKESH",
  "DWARIKESH SUGAR INDUSTRIES": "DWARKESH",
  DWARIKESH: "DWARKESH",
  DWARKESH: "DWARKESH",
  "PONDY OXIDES": "POCL",
  "PONDY OXIDES AND CHEMICALS": "POCL",
  "ALLCARGO LOGISTICS": "ALLCARGO",
  ALLCARGO: "ALLCARGO",
  "ALLCARGO GLOBAL": "AGL",
  ACLGLOBL: "AGL",
  AGL: "AGL",
  WOCKHARDT: "WOCKPHARMA",
  "SHUKRA PHARMACEUTICALS": "SHUKRAPHAR",
  SHUKRA: "SHUKRAPHAR",
  "ESSEN SPECIALITY": "ESFL-SM",
  "ESSEN SPECIALITY FILMS": "ESFL-SM",
  ESFL: "ESFL-SM",
  "BEMCO HYDRAULICS": "BEMHY",
  BEMCO: "BEMHY",
  BEMHY: "BEMHY",
  "BEMHY-X": "BEMHY",
  "TIMEX GROUP": "TIMEX",
  "TIMEX GROUP INDIA": "TIMEX",
  TIMEX: "TIMEX",
  "ADANI ENERGY SOLUTIONS": "ADANIENSOL",
  ADANIENSOL: "ADANIENSOL",
  CDSL: "CDSL",
  "KOLTE PATIL": "KOLTEPATIL",
  KOLTEPATIL: "KOLTEPATIL",
  "NATCO PHARMA": "NATCOPHARM",
  NATCOPHARM: "NATCOPHARM",
  "UJJIVAN SMALL FINANCE": "UJJIVANSFB",
  UJJIVANSFB: "UJJIVANSFB",
  "V MART": "VMART",
  VMART: "VMART",
};

function normKey(k: string) {
  return String(k || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pick(map: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = map[k];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

function pickNonIsin(map: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = map[k];
    if (v === undefined || v === "") continue;
    if (isIsin(String(v))) continue;
    return v;
  }
  return "";
}

function num(v: unknown) {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(
    String(v)
      .replace(/[,₹\u20B9]/g, "")
      .replace(/\((.+)\)/, "-$1")
      .trim(),
  );
  return Number.isFinite(n) ? n : 0;
}

export function cleanSym(s: string) {
  return String(s)
    .trim()
    .toUpperCase()
    .replace(/^(NSE:|BSE:|IND:|NSEEQ-|BSEEQ-)/, "")
    .replace(/\.(NS|BO)$/i, "")
    .replace(SERIES_SFX, "")
    .replace(/\s+/g, "");
}

function normalizeName(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\b(THE|LTD|LIMITED|PRIVATE|PVT|PLC|INC|CORP|CORPORATION|EQUITY|NSE|BSE|COMPANY)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lookupName(s: string): string {
  const n = normalizeName(s);
  if (!n) return "";
  if (NAME_TO_TICKER[n]) return NAME_TO_TICKER[n];
  const compact = n.replace(/ /g, "");
  if (NAME_TO_TICKER[compact]) return NAME_TO_TICKER[compact];
  const keys = Object.keys(NAME_TO_TICKER).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (k.length < 5) continue;
    if (n === k || n.startsWith(k + " ") || k.startsWith(n + " ")) return NAME_TO_TICKER[k];
    const kc = k.replace(/ /g, "");
    if (kc.length >= 6 && (compact === kc || compact.startsWith(kc))) return NAME_TO_TICKER[k];
  }
  return "";
}

function excelSerialToIso(n: number): string | null {
  if (!(n > 20000 && n < 80000)) return null;
  const ms = Math.round((n - 25569) * 86400 * 1000);
  const d = new Date(ms);
  if (Number.isNaN(+d)) return null;
  return d.toISOString();
}

export function parseHoldingWhen(raw: unknown): { date: string | null; boughtAt: string | null } {
  if (raw == null || raw === "") return { date: null, boughtAt: null };
  if (raw instanceof Date && !Number.isNaN(+raw)) {
    const iso = raw.toISOString();
    return { date: iso.slice(0, 10), boughtAt: iso };
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const iso = excelSerialToIso(raw);
    if (!iso) return { date: null, boughtAt: null };
    return { date: iso.slice(0, 10), boughtAt: iso };
  }
  const s = String(raw).trim();
  if (!s) return { date: null, boughtAt: null };
  const serial = Number(s);
  if (/^\d+(\.\d+)?$/.test(s) && serial > 20000 && serial < 80000) {
    const iso = excelSerialToIso(serial);
    if (iso) return { date: iso.slice(0, 10), boughtAt: iso };
  }
  const isoTry = Date.parse(s);
  const m =
    s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/) ||
    s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    let y: number, mo: number, d: number, hh = 0, mm = 0, ss = 0;
    if (m[1].length === 4) {
      y = Number(m[1]);
      mo = Number(m[2]);
      d = Number(m[3]);
      hh = Number(m[4] || 0);
      mm = Number(m[5] || 0);
      ss = Number(m[6] || 0);
    } else {
      d = Number(m[1]);
      mo = Number(m[2]);
      y = Number(m[3]);
      if (y < 100) y += y >= 70 ? 1900 : 2000;
      hh = Number(m[4] || 0);
      mm = Number(m[5] || 0);
      ss = Number(m[6] || 0);
    }
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2100) {
      const dt = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss));
      const iso = dt.toISOString();
      return { date: iso.slice(0, 10), boughtAt: iso };
    }
  }
  if (Number.isFinite(isoTry)) {
    const iso = new Date(isoTry).toISOString();
    return { date: iso.slice(0, 10), boughtAt: iso };
  }
  const day = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return { date: day, boughtAt: day + "T00:00:00.000Z" };
  return { date: null, boughtAt: null };
}

export function guessTicker(raw: string, name?: string, isin?: string): string {
  const isinUp = String(isin || "")
    .trim()
    .toUpperCase();
  if (isEquityIsin(isinUp) && ISIN_TO_TICKER[isinUp]) return ISIN_TO_TICKER[isinUp];
  const cleaned = cleanSym(raw);
  if (isIsin(cleaned)) {
    const mapped = ISIN_TO_TICKER[cleaned] || lookupName(name || "") || lookupName(raw);
    if (mapped && !isIsin(mapped)) return mapped;
    return cleaned;
  }
  const fromName = lookupName(raw) || (name ? lookupName(name) : "") || lookupName(cleaned);
  if (fromName) return fromName;
  if (/^[A-Z][A-Z0-9._]{0,21}$/.test(cleaned) && cleaned.length <= 22 && !/LTD|LIMITED/.test(cleaned)) {
    return cleaned.replace(/\.+$/, "");
  }
  return cleaned;
}

function looksLikeHeader(cells: string[]) {
  const keys = cells.map(normKey).filter(Boolean);
  if (keys.length < 2) return false;
  const hasSym = keys.some(
    (k) =>
      SYM_KEYS.includes(k) ||
      ISIN_KEYS.includes(k) ||
      k.includes("symbol") ||
      k.includes("instrument") ||
      k.includes("scrip") ||
      k.includes("script") ||
      k === "isin" ||
      k === "stockname",
  );
  const hasQty = keys.some((k) => QTY_KEYS.includes(k) || k.includes("qty") || k.includes("quantity") || k === "shares");
  const hasSide = keys.some((k) => SIDE_KEYS.includes(k) || k.includes("buysell") || k === "side" || k === "tradetype");
  const hasBuySellQty = keys.some((k) => BUYQTY_KEYS.includes(k) || SELLQTY_KEYS.includes(k));
  return hasSym && (hasQty || hasSide || hasBuySellQty);
}

function rowToMap(hdr: string[], cells: unknown[]) {
  const map: Record<string, unknown> = {};
  hdr.forEach((h, i) => {
    if (!h) return;
    map[normKey(h)] = cells[i] ?? "";
  });
  return map;
}

function niceName(symbol: string, rawName: string) {
  const n = String(rawName || "").trim();
  if (n && !isIsin(n) && n.toUpperCase() !== symbol) return n;
  return displayName({ symbol, name: n });
}

function findIsin(map: Record<string, unknown>): string {
  const fromKey = String(pick(map, ISIN_KEYS) || "")
    .trim()
    .toUpperCase();
  if (isIsin(fromKey)) return fromKey;
  for (const v of Object.values(map)) {
    const s = String(v || "")
      .trim()
      .toUpperCase();
    if (isIsin(s)) return s;
  }
  return "";
}

function isFundRow(map: Record<string, unknown>, rawName: string, rawTicker: string, isin: string) {
  if (isMfIsin(isin)) return true;
  const typ = String(pick(map, TYPE_KEYS) || "");
  if (/mutual|\bfund\b|etf/i.test(typ) && !/equity stock|^equity$/i.test(typ)) return true;
  return FUND_RE.test(rawName) || FUND_RE.test(rawTicker);
}

function rowMap(row: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row || {})) map[normKey(k)] = v;
  return map;
}

function sideOf(map: Record<string, unknown>, qty: number): 1 | -1 | 0 {
  if (qty < 0) return -1;
  const s = String(pick(map, SIDE_KEYS) || "").toUpperCase().trim();
  if (s) {
    if (/\b(EQUITY|STOCK|MUTUAL|FUND|ETF|OPTION|FUTURE|INDEX|BOND|DEBT|COMMODITY)\b/.test(s) && !/\b(BUY|SELL)\b/.test(s)) {
      /* Security Type / Instrument Type — not a buy/sell blotter */
    } else if (/^(B|BUY|BBUY|PURCHASE|PURCHASED|BOUGHT|CREDIT|CR|IN|ADD)$/.test(s)) return 1;
    else if (/^(S|SELL|SALE|SOLD|DEBIT|DR|OUT|SQUARE)$/.test(s)) return -1;
    else if (/buy/.test(s.toLowerCase()) && !/sell/.test(s.toLowerCase())) return 1;
    else if (/sell|sale/.test(s.toLowerCase())) return -1;
  }
  const bq = num(pick(map, BUYQTY_KEYS));
  const sq = num(pick(map, SELLQTY_KEYS));
  if (bq > 0 && !(sq > 0)) return 1;
  if (sq > 0 && !(bq > 0)) return -1;
  return 0;
}

function tradeQty(map: Record<string, unknown>): { qty: number; side: 1 | -1 | 0 } {
  const bq = num(pick(map, BUYQTY_KEYS));
  const sq = num(pick(map, SELLQTY_KEYS));
  if (bq > 0 && !(sq > 0)) return { qty: bq, side: 1 };
  if (sq > 0 && !(bq > 0)) return { qty: sq, side: -1 };
  const q = num(pick(map, QTY_KEYS));
  const side = sideOf(map, q);
  return { qty: Math.abs(q), side };
}

type Trade = {
  symbol: string;
  name: string;
  qty: number;
  price: number;
  date: string | null;
  boughtAt: string | null;
  side: 1 | -1;
  isin?: string;
  sector?: string;
};

function isTradeBook(rows: Record<string, unknown>[]): boolean {
  let n = 0;
  let hits = 0;
  let both = 0;
  for (const row of rows.slice(0, 80)) {
    const map = rowMap(row);
    const rawSym = String(pickNonIsin(map, SYM_KEYS) || pickNonIsin(map, NAME_KEYS) || findIsin(map) || "");
    if (!rawSym) continue;
    n++;
    const bq = num(pick(map, BUYQTY_KEYS));
    const sq = num(pick(map, SELLQTY_KEYS));
    if (bq > 0 && sq > 0) {
      both++;
      continue;
    }
    const { qty, side } = tradeQty(map);
    if (side !== 0 && qty > 0) hits++;
  }
  if (n < 2) return false;
  if (both / n >= 0.5) return false;
  return hits / n >= 0.2;
}

function extractTrades(rows: Record<string, unknown>[]): Trade[] {
  const out: Trade[] = [];
  for (const row of rows) {
    const map = rowMap(row);
    const rawIsin = findIsin(map);
    const rawTicker = String(pickNonIsin(map, SYM_KEYS) || "");
    const rawName = String(pickNonIsin(map, NAME_KEYS) || "");
    const rawSym = rawTicker || rawName || rawIsin;
    if (!rawSym) continue;
    if (SKIP_SYM.test(normKey(rawSym))) continue;
    if (isFundRow(map, rawName, rawTicker, rawIsin)) continue;
    const { qty, side } = tradeQty(map);
    if (!(qty > 0) || side === 0) continue;
    const symbol = guessTicker(rawTicker || rawName || rawIsin, rawName, rawIsin);
    if (!symbol || SKIP_SYM.test(symbol) || isMfIsin(symbol)) continue;
    let price = num(pick(map, AVG_KEYS)) || num(pick(map, ["price", "tradeprice", "tradedprice", "rate", "ltp"]));
    const invested = num(pick(map, INVESTED_KEYS));
    if (!(price > 0) && invested > 0) price = invested / qty;
    const when = parseHoldingWhen(pick(map, DATE_KEYS));
    out.push({
      symbol,
      name: niceName(symbol, rawName || TICKER_NAMES[baseSym(symbol)] || ""),
      qty,
      price: price > 0 ? price : 0,
      date: when.date,
      boughtAt: when.boughtAt,
      side,
      isin: isEquityIsin(rawIsin) ? rawIsin : undefined,
      sector: normalizeSectorLabel(String(pick(map, SECTOR_KEYS) || "")) || undefined,
    });
  }
  return out;
}

function netTrades(trades: Trade[]): Holding[] {
  const by = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = baseSym(t.symbol);
    const list = by.get(k) || [];
    list.push(t);
    by.set(k, list);
  }
  const out: Holding[] = [];
  for (const [k, list] of by) {
    list.sort((a, b) => {
      const da = a.boughtAt || a.date || "";
      const db = b.boughtAt || b.date || "";
      return da.localeCompare(db);
    });
    const lots: { qty: number; px: number; date: string | null; boughtAt: string | null }[] = [];
    for (const t of list) {
      if (t.side > 0) {
        lots.push({ qty: t.qty, px: t.price, date: t.date, boughtAt: t.boughtAt });
        continue;
      }
      let left = t.qty;
      while (left > 1e-8 && lots.length) {
        const lot = lots[0];
        const take = Math.min(lot.qty, left);
        lot.qty -= take;
        left -= take;
        if (lot.qty <= 1e-8) lots.shift();
      }
    }
    const qty = lots.reduce((s, l) => s + l.qty, 0);
    if (!(qty > 1e-8)) continue;
    const withPx = lots.filter((l) => l.px > 0);
    const avg = withPx.length
      ? withPx.reduce((s, l) => s + l.qty * l.px, 0) / withPx.reduce((s, l) => s + l.qty, 0)
      : null;
    const firstDate = lots.map((l) => l.date).filter(Boolean).sort()[0] || null;
    const firstAt = lots.map((l) => l.boughtAt).filter(Boolean).sort()[0] || null;
    const name = list.map((t) => t.name).sort((a, b) => b.length - a.length)[0] || k;
    out.push({
      symbol: k,
      name: niceName(k, name),
      qty,
      avg: avg && avg > 0 ? avg : null,
      date: firstDate,
      boughtAt: firstAt,
      isin: list.find((t) => t.isin)?.isin,
      sector: list.find((t) => t.sector)?.sector,
      lots: lots
        .filter((l) => l.qty > 1e-8)
        .map((l) => ({
          qty: l.qty,
          avg: l.px > 0 ? l.px : avg || 0,
          date: l.date,
          boughtAt: l.boughtAt,
        })),
    });
  }
  return out;
}

export function extractHoldings(rows: Record<string, unknown>[]): Holding[] {
  if (isTradeBook(rows)) {
    const trades = extractTrades(rows);
    if (trades.length) return netTrades(trades);
  }
  const out: Holding[] = [];
  for (const row of rows) {
    const map: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row || {})) map[normKey(k)] = v;
    const rawIsin = findIsin(map);
    const rawTicker = String(pickNonIsin(map, SYM_KEYS) || "");
    const rawName = String(pickNonIsin(map, NAME_KEYS) || "");
    const rawSym = rawTicker || rawName || rawIsin;
    let qty = num(pick(map, QTY_KEYS));
    if (!(qty > 0)) {
      const bq = num(pick(map, BUYQTY_KEYS));
      const sq = num(pick(map, SELLQTY_KEYS));
      if (bq > 0 || sq > 0) qty = bq - sq;
    }
    if (!rawSym || qty <= 0) continue;
    if (SKIP_SYM.test(normKey(rawSym))) continue;
    const sectorRaw = String(pick(map, SECTOR_KEYS) || "");
    if (/unlisted|delisted/i.test(sectorRaw)) continue;
    if (isFundRow(map, rawName, rawTicker, rawIsin)) continue;
    const symbol = guessTicker(rawTicker || rawName || rawIsin, rawName, rawIsin);
    if (!symbol || SKIP_SYM.test(symbol) || isMfIsin(symbol)) continue;
    const invested = num(pick(map, INVESTED_KEYS));
    let avg = num(pick(map, AVG_KEYS));
    if (invested > 0 && qty > 0) avg = invested / qty;
    if (!(avg > 0) && isIsin(symbol) && !ISIN_TO_TICKER[symbol]) continue;
    const dateRaw = pick(map, DATE_KEYS);
    const when = parseHoldingWhen(dateRaw);
    const fileSector = normalizeSectorLabel(String(pick(map, SECTOR_KEYS) || ""));
    out.push({
      symbol,
      name: niceName(symbol, rawName || TICKER_NAMES[baseSym(symbol)] || ""),
      qty,
      avg: avg > 0 ? avg : null,
      date: when.date,
      boughtAt: when.boughtAt,
      isin: isEquityIsin(rawIsin) ? rawIsin : isEquityIsin(rawSym) ? cleanSym(rawSym) : undefined,
      sector: fileSector || undefined,
    });
  }
  const m = new Map<string, Holding>();
  for (const r of out) {
    const k = baseSym(r.symbol);
    const cur = m.get(k);
    if (!cur) m.set(k, { ...r, symbol: k, name: niceName(k, r.name) });
    else {
      const q = cur.qty + r.qty;
      const avg = cur.avg && r.avg ? (cur.avg * cur.qty + r.avg * r.qty) / q : cur.avg || r.avg;
      const name = !isIsin(r.name) && r.name.length >= (cur.name || "").length ? r.name : cur.name;
      m.set(k, {
        ...cur,
        qty: q,
        avg,
        name: niceName(k, name),
        date: cur.date && r.date ? (cur.date < r.date ? cur.date : r.date) : cur.date || r.date,
        boughtAt:
          cur.boughtAt && r.boughtAt
            ? cur.boughtAt < r.boughtAt
              ? cur.boughtAt
              : r.boughtAt
            : cur.boughtAt || r.boughtAt,
        isin: cur.isin || r.isin,
        sector: cur.sector || r.sector,
      });
    }
  }
  return [...m.values()];
}

export function parseMatrix(matrix: unknown[][]): Holding[] {
  return parseMatrixDetailed(matrix).holdings;
}

export type ParsedBook = { holdings: Holding[]; fromTrades: boolean };

function matrixToRows(matrix: unknown[][]): Record<string, unknown>[] {
  const rows = (matrix || []).map((r) => (Array.isArray(r) ? r : [r]));
  if (!rows.length) return [];
  let headerIdx = -1;
  const limit = Math.min(rows.length, 60);
  for (let i = 0; i < limit; i++) {
    const cells = rows[i].map((c) => (c == null ? "" : String(c).trim()));
    if (looksLikeHeader(cells)) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) {
    headerIdx = rows.findIndex((r) => r.some((c) => String(c || "").trim()));
    if (headerIdx < 0) return [];
  }
  const hdr = rows[headerIdx].map((c) => String(c ?? "").trim());
  const objects: Record<string, unknown>[] = [];
  for (const r of rows.slice(headerIdx + 1)) {
    if (!r.some((c) => c != null && String(c).trim() !== "")) continue;
    objects.push(rowToMap(hdr, r));
  }
  return objects;
}

export function parseMatrixDetailed(matrix: unknown[][]): ParsedBook {
  const objects = matrixToRows(matrix);
  if (!objects.length) return { holdings: [], fromTrades: false };
  const fromTrades = isTradeBook(objects);
  return { holdings: extractHoldings(objects), fromTrades };
}

function lastWins(rows: Holding[]): Holding[] {
  const m = new Map<string, Holding>();
  for (const r of rows) {
    const k = baseSym(r.symbol);
    const cur = m.get(k);
    if (!cur) {
      m.set(k, { ...r, symbol: k, name: niceName(k, r.name) });
      continue;
    }
    m.set(k, {
      ...cur,
      ...r,
      symbol: k,
      name: niceName(k, r.name || cur.name),
      qty: r.qty > 0 ? r.qty : cur.qty,
      avg: r.avg && r.avg > 0 ? r.avg : cur.avg,
      date: r.date || cur.date,
      boughtAt: r.boughtAt || cur.boughtAt,
      isin: r.isin || cur.isin,
      sector: r.sector || cur.sector,
      kind: r.kind || cur.kind,
      unit: r.unit || cur.unit,
    });
  }
  return [...m.values()];
}

/** Snapshot qty wins; trade-book dates/avg fill blanks; sold names from the blotter are not added. */
export function combineBooks(parts: ParsedBook[]): Holding[] {
  const snaps: Holding[] = [];
  const trades: Holding[] = [];
  for (const p of parts) {
    if (!p.holdings.length) continue;
    if (p.fromTrades) trades.push(...p.holdings);
    else snaps.push(...p.holdings);
  }
  const snap = lastWins(snaps);
  const trade = lastWins(trades);
  if (snap.length && trade.length) return fillHoldings(snap, trade, { dates: true, prices: true, addNew: false });
  if (snap.length) return snap;
  return trade;
}

function parseCsvText(text: string): unknown[][] {
  const raw = text.replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const delim =
    [",", "\t", ";", "|"].sort((a, b) => (lines[0].split(b).length - 1) - (lines[0].split(a).length - 1))[0] || ",";
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = !q;
      } else if (ch === delim && !q) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  return lines.map(split);
}

export function parseCsv(text: string): Record<string, unknown>[] {
  const matrix = parseCsvText(text);
  if (!matrix.length) return [];
  let headerIdx = matrix.findIndex((r) => looksLikeHeader(r.map(String)));
  if (headerIdx < 0) headerIdx = 0;
  const hdr = matrix[headerIdx].map(String);
  return matrix.slice(headerIdx + 1).map((cells) => {
    const row: Record<string, unknown> = {};
    hdr.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

export async function parseSpreadsheet(buf: ArrayBuffer): Promise<Holding[]> {
  const { holdings } = await parseSpreadsheetDetailed(buf);
  return holdings;
}

export async function parseSpreadsheetDetailed(buf: ArrayBuffer): Promise<ParsedBook> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const hits: (ParsedBook & { score: number })[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const n = name.toLowerCase();
    if (/mutual|\bmf\b|nfo|sip/.test(n) && !/equity|holding/.test(n)) continue;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true });
    const got = parseMatrixDetailed(matrix);
    if (!got.holdings.length) continue;
    let score = got.holdings.length;
    if (/holdings|equity|stock/.test(n)) score += 100;
    if (/trade|transaction|order|pnl|buy/.test(n)) score += 80;
    if (/combined|all/.test(n)) score += 10;
    hits.push({ ...got, score });
  }
  hits.sort((a, b) => a.score - b.score);
  const holdings = combineBooks(hits);
  const hasSnap = hits.some((h) => !h.fromTrades);
  return { holdings, fromTrades: Boolean(holdings.length) && !hasSnap };
}

function decodeText(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  if (u8.length >= 2 && u8[0] === 0xff && u8[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
  if (u8.length >= 2 && u8[0] === 0xfe && u8[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

export async function parseHoldingsFileDetailed(file: File): Promise<ParsedBook> {
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
    try {
      const got = await parseSpreadsheetDetailed(buf);
      if (got.holdings.length) return got;
    } catch {
      /* fall through to text */
    }
  }
  const text = decodeText(buf);
  const rows = parseCsv(text);
  const fromTrades = isTradeBook(rows);
  return { holdings: extractHoldings(rows), fromTrades };
}

export async function parseHoldingsFile(file: File): Promise<Holding[]> {
  const { holdings } = await parseHoldingsFileDetailed(file);
  return holdings;
}

export async function parseHoldingsFiles(files: File[]): Promise<{ holdings: Holding[]; errors: string[] }> {
  const parts: ParsedBook[] = [];
  const errors: string[] = [];
  for (const f of files) {
    try {
      const got = await parseHoldingsFileDetailed(f);
      if (!got.holdings.length) errors.push(f.name + " — no ticker + qty columns found");
      else parts.push(got);
    } catch (err) {
      errors.push(f.name + " — " + (err instanceof Error ? err.message : "could not read"));
    }
  }
  return { holdings: combineBooks(parts), errors };
}

export function parseVoice(text: string): Holding[] {
  const out: Holding[] = [];
  const re = /([A-Za-z][A-Za-z0-9&.-]{1,24})\s+(\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const symbol = guessTicker(m[1]);
    out.push({
      symbol,
      name: displayName({ symbol, name: m[1] }),
      qty: Number(m[2]),
      avg: null,
      date: null,
    });
  }
  return mergeHoldings([], out);
}

export function mergeHoldings(existing: Holding[], incoming: Holding[]): Holding[] {
  const map = new Map(existing.map((h) => [baseSym(h.symbol), { ...h, symbol: baseSym(h.symbol) }]));
  for (const h of incoming) {
    const k = baseSym(h.symbol);
    const cur = map.get(k);
    if (!cur) map.set(k, { ...h, symbol: k, name: displayName({ symbol: k, name: h.name }) });
    else {
      const q = cur.qty + h.qty;
      const avg = cur.avg && h.avg ? (cur.avg * cur.qty + h.avg * h.qty) / q : cur.avg || h.avg;
      const name = displayName({ symbol: k, name: h.name || cur.name });
      map.set(k, {
        ...cur,
        qty: q,
        avg,
        name,
        date: h.date || cur.date,
        boughtAt: h.boughtAt || cur.boughtAt,
        isin: h.isin || cur.isin,
        sector: h.sector || cur.sector,
        kind: h.kind || cur.kind,
        unit: h.unit || cur.unit,
        lots: [...(cur.lots || []), ...(h.lots || [])],
      });
    }
  }
  return [...map.values()];
}

function normName(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

function stemSym(s: string) {
  return baseSym(s).replace(/_(SM|X|BE|EQ|T|XT)$/i, "");
}

export type FillOpts = { dates?: boolean; prices?: boolean; addNew?: boolean };

export function classifyIncoming(existing: Holding[], incoming: Holding[]) {
  const keys = new Set(existing.map((h) => stemSym(h.symbol)));
  const names = new Set(existing.map((h) => normName(h.name)).filter(Boolean));
  const matched: Holding[] = [];
  const fresh: Holding[] = [];
  for (const h of incoming) {
    if (keys.has(stemSym(h.symbol)) || names.has(normName(h.name))) matched.push(h);
    else fresh.push(h);
  }
  return { matched, fresh };
}

/** Fill dates / avg cost on matching names. Never adds unknown tickers unless addNew. */
export function fillHoldings(existing: Holding[], incoming: Holding[], opts: FillOpts = {}): Holding[] {
  const doDates = opts.dates !== false;
  const doPrices = opts.prices !== false;
  const addNew = Boolean(opts.addNew);
  const map = new Map(existing.map((h) => [baseSym(h.symbol), { ...h, symbol: baseSym(h.symbol) }]));
  const byStem = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const h of existing) {
    const k = baseSym(h.symbol);
    byStem.set(stemSym(h.symbol), k);
    const n = normName(h.name);
    if (n) byName.set(n, k);
    byName.set(k, k);
  }
  for (const h of incoming) {
    const k = baseSym(h.symbol);
    const viaStem = byStem.get(stemSym(h.symbol));
    const viaName = byName.get(normName(h.name));
    const key = map.has(k) ? k : viaStem && map.has(viaStem) ? viaStem : viaName && map.has(viaName) ? viaName : k;
    const cur = map.get(key);
    if (!cur) {
      if (!addNew) continue;
      const next = { ...h, symbol: k, name: displayName({ symbol: k, name: h.name }) };
      map.set(k, next);
      byStem.set(stemSym(k), k);
      byName.set(normName(next.name), k);
      continue;
    }
    const cleaner =
      stemSym(h.symbol) === stemSym(cur.symbol) && h.symbol.replace(/[-_]/g, "").length <= cur.symbol.replace(/[-_]/g, "").length
        ? baseSym(h.symbol)
        : cur.symbol;
    map.set(key, {
      ...cur,
      symbol: cleaner,
      date: doDates ? cur.date || h.date : cur.date,
      boughtAt: doDates ? cur.boughtAt || h.boughtAt : cur.boughtAt,
      avg: doPrices ? (cur.avg != null && cur.avg > 0 ? cur.avg : h.avg) : cur.avg,
      isin: cur.isin || h.isin,
      name: cur.name || displayName({ symbol: cleaner, name: h.name }),
    });
  }
  return [...map.values()];
}

/** Replace qty on matches (snapshot remaining), fill blank dates/avg, add names that are not in the book. */
export function upsertHoldings(existing: Holding[], incoming: Holding[]): Holding[] {
  const withNew = fillHoldings(existing, incoming, { dates: true, prices: true, addNew: true });
  const byStem = new Map<string, Holding>();
  const byName = new Map<string, Holding>();
  for (const h of incoming) {
    byStem.set(stemSym(h.symbol), h);
    const n = normName(h.name);
    if (n) byName.set(n, h);
  }
  return withNew.map((h) => {
    const src = byStem.get(stemSym(h.symbol)) || byName.get(normName(h.name));
    if (!src || !(src.qty > 0)) return h;
    return { ...h, qty: src.qty };
  });
}

/** Strip series suffixes (BEMHY-X → BEMHY) and merge duplicates after a persist rehydrate. */
export function sanitizeHoldings(rows: Holding[]): Holding[] {
  const cleaned = (rows || []).map((h) => {
    if (h.kind === "commodity") return { ...h, symbol: String(h.symbol || "").toUpperCase() };
    const symbol = guessTicker(h.symbol, h.name, h.isin);
    return { ...h, symbol };
  });
  return mergeHoldings([], cleaned);
}

/** In-place edit of the one line. Drops remaining lots so Your XIRR follows the edited qty/date, not the old FIFO lots. */
export function applyHoldingPatch(h: Holding, patch: Partial<Holding>): Holding {
  const next: Holding = { ...h, ...patch };
  const touchesSize = "qty" in patch || "avg" in patch || "date" in patch || "boughtAt" in patch;
  if (touchesSize && !("lots" in patch) && next.lots?.length) next.lots = undefined;
  return next;
}
