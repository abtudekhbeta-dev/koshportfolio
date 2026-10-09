import { o as __toESM } from "../_runtime.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as unionCloudTrades, b as withTradeDrops, f as preferSymbol, g as tradeIdentity, h as storedSymbol, i as capFromMcap, m as sectorOf, r as baseSym, s as emptyDrops, t as applyDrops, v as withHoldingDrop, y as withPortfolioDrop } from "./cloud-state-D4x-c1e5.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { g as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { tt as router_exports } from "./router-CP-LXn6m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/benchmarks--s3uDiGj.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/** Display names and ISIN → NSE ticker. Never show an ISIN as the stock name. */
function isEquityIsin(s) {
	return /^INE[A-Z0-9]{9}$/i.test(String(s || "").trim());
}
function isMfIsin(s) {
	return /^INF[A-Z0-9]{9}$/i.test(String(s || "").trim());
}
function isIsin(s) {
	return isEquityIsin(s) || isMfIsin(s);
}
var TICKER_NAMES = {
	RELIANCE: "Reliance Industries",
	TCS: "Tata Consultancy Services",
	HDFCBANK: "HDFC Bank",
	INFY: "Infosys",
	BHARTIARTL: "Bharti Airtel",
	ITC: "ITC",
	LT: "Larsen & Toubro",
	SUNPHARMA: "Sun Pharma",
	ICICIBANK: "ICICI Bank",
	KOTAKBANK: "Kotak Mahindra Bank",
	SBIN: "State Bank of India",
	AXISBANK: "Axis Bank",
	HCLTECH: "HCL Technologies",
	WIPRO: "Wipro",
	TATAMOTORS: "Tata Motors",
	MARUTI: "Maruti Suzuki",
	HINDUNILVR: "Hindustan Unilever",
	BAJFINANCE: "Bajaj Finance",
	ASIANPAINT: "Asian Paints",
	NTPC: "NTPC",
	ONGC: "ONGC",
	POWERGRID: "Power Grid",
	COALINDIA: "Coal India",
	TATASTEEL: "Tata Steel",
	JSWSTEEL: "JSW Steel",
	HINDALCO: "Hindalco",
	ULTRACEMCO: "UltraTech Cement",
	NESTLEIND: "Nestlé India",
	TITAN: "Titan",
	ADANIENT: "Adani Enterprises",
	ADANIPORTS: "Adani Ports",
	M_M: "Mahindra & Mahindra",
	TECHM: "Tech Mahindra",
	DRREDDY: "Dr. Reddy's",
	CIPLA: "Cipla",
	DIVISLAB: "Divi's Laboratories",
	APOLLOHOSP: "Apollo Hospitals",
	EICHERMOT: "Eicher Motors",
	BAJAJ_AUTO: "Bajaj Auto",
	HEROMOTOCO: "Hero MotoCorp",
	TATACONSUM: "Tata Consumer",
	TATAPOWER: "Tata Power",
	INDUSINDBK: "IndusInd Bank",
	BAJAJFINSV: "Bajaj Finserv",
	HDFCLIFE: "HDFC Life",
	SBILIFE: "SBI Life",
	GRASIM: "Grasim",
	BEL: "Bharat Electronics",
	TRENT: "Trent",
	ETERNAL: "Eternal (Zomato)",
	ZOMATO: "Eternal (Zomato)",
	BPCL: "BPCL",
	IOC: "IOC",
	HINDPETRO: "HPCL",
	GAIL: "GAIL",
	ADANIGREEN: "Adani Green",
	ADANIPOWER: "Adani Power",
	JSWENERGY: "JSW Energy",
	LICI: "LIC",
	JIOFIN: "Jio Financial",
	DMART: "Avenue Supermarts",
	NYKAA: "Nykaa",
	INDIGO: "InterGlobe Aviation",
	PIDILITIND: "Pidilite",
	DLF: "DLF",
	LODHA: "Macrotech (Lodha)",
	GODREJCP: "Godrej Consumer",
	BRITANNIA: "Britannia",
	MARICO: "Marico",
	DABUR: "Dabur",
	VBL: "Varun Beverages",
	HAL: "Hindustan Aeronautics",
	SIEMENS: "Siemens",
	ABB: "ABB India",
	PFC: "PFC",
	RECLTD: "REC",
	CHOLAFIN: "Cholamandalam",
	SHRIRAMFIN: "Shriram Finance",
	TVSMOTOR: "TVS Motor",
	MOTHERSON: "Samvardhana Motherson",
	POLYCAB: "Polycab",
	DIXON: "Dixon Technologies",
	MAXHEALTH: "Max Healthcare",
	LTIM: "LTIMindtree",
	PERSISTENT: "Persistent",
	COFORGE: "Coforge",
	IRFC: "IRFC",
	IRCTC: "IRCTC",
	VEDL: "Vedanta",
	HINDZINC: "Hindustan Zinc",
	JINDALSTEL: "Jindal Steel",
	SAIL: "SAIL",
	NMDC: "NMDC",
	SHREECEM: "Shree Cement",
	AMBUJACEM: "Ambuja Cements",
	ACC: "ACC",
	BANKBARODA: "Bank of Baroda",
	PNB: "Punjab National Bank",
	CANBK: "Canara Bank",
	UNIONBANK: "Union Bank",
	ICICIGI: "ICICI Lombard",
	ICICIPRULI: "ICICI Prudential Life",
	HDFCAMC: "HDFC AMC",
	NAUKRI: "Info Edge",
	PAYTM: "Paytm",
	UNITDSPR: "United Spirits",
	COLPAL: "Colgate-Palmolive",
	GODREJPROP: "Godrej Properties",
	PRESTIGE: "Prestige Estates",
	PHOENIXLTD: "Phoenix Mills",
	PAGEIND: "Page Industries",
	KALYANKJIL: "Kalyan Jewellers",
	BOSCHLTD: "Bosch",
	ASHOKLEY: "Ashok Leyland",
	MRF: "MRF",
	APOLLOTYRE: "Apollo Tyres",
	TORNTPHARM: "Torrent Pharma",
	AUROPHARMA: "Aurobindo Pharma",
	LUPIN: "Lupin",
	ALKEM: "Alkem",
	BIOCON: "Biocon",
	FORTIS: "Fortis Healthcare",
	IDEA: "Vodafone Idea",
	TATACOMM: "Tata Communications",
	INDUSTOWER: "Indus Towers",
	ESCORTS: "Escorts Kubota",
	HSCL: "Himadri Speciality",
	RADHIKAJWE: "Radhika Jeweltech",
	ATLANTAELE: "Atlanta Electricals",
	PAISALO: "Paisalo Digital",
	STALLION: "Stallion India",
	NPST: "Network People",
	POCL: "Pondy Oxides",
	ALLCARGO: "Allcargo Logistics",
	AGL: "Allcargo Global",
	ACLGLOBL: "Allcargo Global",
	WOCKPHARMA: "Wockhardt",
	SHUKRAPHAR: "Shukra Pharmaceuticals",
	ESFL: "Essen Speciality Films",
	ESFL_SM: "Essen Speciality Films",
	BEMHY: "Bemco Hydraulics",
	DWARKESH: "Dwarikesh Sugar",
	TIMEX: "Timex Group",
	ADANIENSOL: "Adani Energy Solutions",
	CDSL: "CDSL",
	KOLTEPATIL: "Kolte-Patil",
	NATCOPHARM: "Natco Pharma",
	UJJIVANSFB: "Ujjivan Small Finance",
	VMART: "V-Mart",
	CANHLIFE: "Canara HSBC Life",
	GOLD: "Gold",
	SILVER: "Silver"
};
var ISIN_TO_TICKER = {
	INE002A01018: "RELIANCE",
	INE467B01029: "TCS",
	INE040A01034: "HDFCBANK",
	INE009A01021: "INFY",
	INE397D01024: "BHARTIARTL",
	INE154A01025: "ITC",
	INE018A01030: "LT",
	INE044A01036: "SUNPHARMA",
	INE090A01021: "ICICIBANK",
	INE237A01028: "KOTAKBANK",
	INE062A01020: "SBIN",
	INE238A01034: "AXISBANK",
	INE860A01027: "HCLTECH",
	INE075A01022: "WIPRO",
	INE155A01022: "TATAMOTORS",
	INE585B01010: "MARUTI",
	INE030A01027: "HINDUNILVR",
	INE296A01024: "BAJFINANCE",
	INE021A01026: "ASIANPAINT",
	INE733E01010: "NTPC",
	INE213A01029: "ONGC",
	INE752E01010: "POWERGRID",
	INE522F01014: "COALINDIA",
	INE081A01020: "TATASTEEL",
	INE019A01038: "JSWSTEEL",
	INE038A01020: "HINDALCO",
	INE481G01011: "ULTRACEMCO",
	INE239A01024: "NESTLEIND",
	INE280A01028: "TITAN",
	INE423A01024: "ADANIENT",
	INE423A01023: "ADANIENT",
	INE742F01042: "ADANIPORTS",
	INE101A01026: "M_M",
	INE669C01036: "TECHM",
	INE089A01023: "DRREDDY",
	INE059A01026: "CIPLA",
	INE361B01024: "DIVISLAB",
	INE437A01024: "APOLLOHOSP",
	INE066A01021: "EICHERMOT",
	INE917I01010: "BAJAJ_AUTO",
	INE158A01026: "HEROMOTOCO",
	INE192A01025: "TATACONSUM",
	INE245A01021: "TATAPOWER",
	INE095A01012: "INDUSINDBK",
	INE918I01018: "BAJAJFINSV",
	INE918I01026: "BAJAJFINSV",
	INE795G01014: "HDFCLIFE",
	INE123W01016: "SBILIFE",
	INE047A01021: "GRASIM",
	INE263A01024: "BEL",
	INE849A01020: "TRENT",
	INE758T01015: "ETERNAL",
	INE029A01011: "BPCL",
	INE242A01010: "IOC",
	INE094A01015: "HINDPETRO",
	INE129A01019: "GAIL",
	INE364U01010: "ADANIGREEN",
	INE814H01011: "ADANIPOWER",
	INE121E01018: "JSWENERGY",
	INE115A01023: "LICI",
	INE121A01024: "JIOFIN",
	INE270A01011: "DMART",
	INE388Y01029: "NYKAA",
	INE646L01027: "INDIGO",
	INE318A01026: "PIDILITIND",
	INE271C01023: "DLF",
	INE093I01010: "LODHA",
	INE102D01011: "GODREJCP",
	INE216A01030: "BRITANNIA",
	INE196A01026: "MARICO",
	INE016A01026: "DABUR",
	INE200M01013: "VBL",
	INE066F01012: "HAL",
	INE003A01024: "SIEMENS",
	INE117A01022: "ABB",
	INE134E01011: "PFC",
	INE020B01018: "RECLTD",
	INE121A01016: "CHOLAFIN",
	INE721A01013: "SHRIRAMFIN",
	INE494B01023: "TVSMOTOR",
	INE775A01035: "MOTHERSON",
	INE455K01017: "POLYCAB",
	INE935N01020: "DIXON",
	INE027H01010: "MAXHEALTH",
	INE214T01019: "LTIM",
	INE262H01013: "PERSISTENT",
	INE591G01017: "COFORGE",
	INE053F01010: "IRFC",
	INE335Y01012: "IRCTC",
	INE205A01025: "VEDL",
	INE267A01025: "HINDZINC",
	INE749A01030: "JINDALSTEL",
	INE114A01011: "SAIL",
	INE584A01023: "NMDC",
	INE070A01015: "SHREECEM",
	INE079A01024: "AMBUJACEM",
	INE012A01025: "ACC",
	INE028A01039: "BANKBARODA",
	INE160A01022: "PNB",
	INE476A01014: "CANBK",
	INE692A01016: "UNIONBANK",
	INE765G01017: "ICICIGI",
	INE726G01019: "ICICIPRULI",
	INE127D01025: "HDFCAMC",
	INE663F01024: "NAUKRI",
	INE818H01021: "PAYTM",
	INE854D01016: "UNITDSPR",
	INE259A01022: "COLPAL",
	INE484J01027: "GODREJPROP",
	INE811K01011: "PRESTIGE",
	INE211B01021: "PHOENIXLTD",
	INE761H01022: "PAGEIND",
	INE303R01014: "KALYANKJIL",
	INE323A01026: "BOSCHLTD",
	INE208A01029: "ASHOKLEY",
	INE883A01011: "MRF",
	INE438A01022: "APOLLOTYRE",
	INE685A01028: "TORNTPHARM",
	INE406A01037: "AUROPHARMA",
	INE326A01037: "LUPIN",
	INE540L01014: "ALKEM",
	INE376G01013: "BIOCON",
	INE061F01011: "FORTIS",
	INE669E01016: "IDEA",
	INE151A01013: "TATACOMM",
	INE121J01017: "INDUSTOWER",
	INE481Y01014: "ZOMATO",
	INE042A01014: "ESCORTS",
	INE019C01026: "HSCL",
	INE583V01021: "RADHIKAJWE",
	INE0Z4F01028: "ATLANTAELE",
	INE420C01059: "PAISALO",
	INE0RYC01010: "STALLION",
	INE0FFK01017: "NPST",
	INE063E01061: "POCL",
	INE418H01029: "ALLCARGO",
	INE049B01025: "WOCKPHARMA",
	INE551C01044: "SHUKRAPHAR",
	INE0ITO01014: "ESFL-SM",
	INE366A01041: "DWARKESH",
	INE064A01026: "TIMEX",
	INE931S01010: "ADANIENSOL",
	INE736A01011: "CDSL",
	INE094I01018: "KOLTEPATIL",
	INE987B01026: "NATCOPHARM",
	INE551W01018: "UJJIVANSFB",
	INE665J01013: "VMART",
	INE01TY01017: "CANHLIFE",
	INE1YPB01014: "AGL"
};
var LIVE_ISIN = {};
/** Overlay from the live NSE master. Does not replace the static map. */
function registerLiveIsins(map) {
	for (const [k, v] of Object.entries(map || {})) {
		const isin = String(k || "").trim().toUpperCase();
		const tick = String(v || "").trim().toUpperCase();
		if (/^IN[A-Z0-9]{10}$/.test(isin) && tick) LIVE_ISIN[isin] = tick;
	}
}
function tickerFromIsin(isin) {
	const k = String(isin || "").trim().toUpperCase();
	if (!k) return void 0;
	return LIVE_ISIN[k] || ISIN_TO_TICKER[k];
}
/** NSE Yahoo symbols that differ from the broker ticker. */
var YF_ALIAS = {
	ACLGLOBL: "AGL",
	ESFL: "ESFL-SM",
	ESFL_SM: "ESFL-SM",
	BEMHY_X: "BEMHY",
	"BEMHY-X": "BEMHY"
};
function tickerName(symbol) {
	return TICKER_NAMES[String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "").replace(/-/g, "_")] || "";
}
function displayName(h) {
	const raw = String(h.name || "").trim();
	if (raw && !isIsin(raw) && raw.toUpperCase() !== h.symbol.toUpperCase() && raw.length > 1) return tidyCompany(raw);
	return tickerName(h.symbol) || (isIsin(h.symbol) ? "Unknown stock" : h.symbol);
}
function tidyCompany(s) {
	return s.replace(/\s+/g, " ").replace(/\b(equity|nse|bse)\b/gi, "").replace(/\s+/g, " ").trim();
}
function normalizeSectorLabel(raw) {
	const s = String(raw || "").trim();
	if (!s) return null;
	const k = s.toLowerCase();
	if (/(bank|nbfc|finance|insurance|capital market|financial)/.test(k)) return "Financials";
	if (/(it\b|software|tech|computer|information)/.test(k)) return "IT";
	if (/(oil|gas|energy|power|utility)/.test(k)) return "Energy";
	if (/(pharma|health|drug|hospital|biotech)/.test(k)) return "Healthcare";
	if (/(auto|motor|tyre|vehicle)/.test(k)) return "Auto";
	if (/(fmcg|consumer staple|food|beverage|tobacco)/.test(k)) return "FMCG";
	if (/(consumer discret|retail|apparel|internet|e-?comm)/.test(k)) return "Consumer";
	if (/(jewel|diamond|watch|retail|apparel)/.test(k)) return "Consumer";
	if (/(cement|steel|metal|mining|commodity)/.test(k)) return "Materials";
	if (/(realty|real estate)/.test(k)) return "Realty";
	if (/(telecom|communication)/.test(k)) return "Telecom";
	if (/(chem|specialty|carbon|fluor|plastic)/.test(k)) return "Chemicals";
	if (/(capital good|industrial|engineering|defence|defense|logistics|shipping|transformer|electrical)/.test(k)) return "Industrials";
	if (/(sugar|agro|food)/.test(k)) return "FMCG";
	if (/(tractor)/.test(k)) return "Auto";
	if (/^[A-Za-z][A-Za-z /&-]{2,24}$/.test(s)) return s.replace(/\b\w/g, (c) => c.toUpperCase());
	return null;
}
var BENCH$1 = {
	nifty: {
		symbol: "^NSEI",
		name: "Nifty 50"
	},
	sensex: {
		symbol: "^BSESN",
		name: "Sensex"
	},
	bank: {
		symbol: "^NSEBANK",
		name: "Bank Nifty"
	},
	fin: {
		symbol: "^CNXFIN",
		name: "Nifty Fin Service"
	},
	it: {
		symbol: "^CNXIT",
		name: "Nifty IT"
	},
	pharma: {
		symbol: "^CNXPHARMA",
		name: "Nifty Pharma"
	},
	auto: {
		symbol: "^CNXAUTO",
		name: "Nifty Auto"
	},
	fmcg: {
		symbol: "^CNXFMCG",
		name: "Nifty FMCG"
	},
	energy: {
		symbol: "^CNXENERGY",
		name: "Nifty Energy"
	},
	metal: {
		symbol: "^CNXMETAL",
		name: "Nifty Metal"
	},
	realty: {
		symbol: "^CNXREALTY",
		name: "Nifty Realty"
	},
	infra: {
		symbol: "^CNXINFRA",
		name: "Nifty Infra"
	},
	mid: {
		symbol: "^NSEMDCP50",
		name: "Nifty Midcap 50"
	},
	n100: {
		symbol: "^CNX100",
		name: "Nifty 100"
	},
	n500: {
		symbol: "^CRSLDX",
		name: "Nifty 500"
	}
};
var TAPE = [
	{
		id: "nifty",
		symbol: "^NSEI",
		label: "NIFTY 50"
	},
	{
		id: "sensex",
		symbol: "^BSESN",
		label: "SENSEX"
	},
	{
		id: "bank",
		symbol: "^NSEBANK",
		label: "BANK NIFTY"
	},
	{
		id: "mid",
		symbol: "^NSEMDCP50",
		label: "MIDCAP 50"
	},
	{
		id: "it",
		symbol: "^CNXIT",
		label: "NIFTY IT"
	},
	{
		id: "pharma",
		symbol: "^CNXPHARMA",
		label: "NIFTY PHARMA"
	},
	{
		id: "auto",
		symbol: "^CNXAUTO",
		label: "NIFTY AUTO"
	},
	{
		id: "fmcg",
		symbol: "^CNXFMCG",
		label: "NIFTY FMCG"
	},
	{
		id: "gold",
		symbol: "GOLD",
		label: "GOLD"
	},
	{
		id: "silver",
		symbol: "SILVER",
		label: "SILVER"
	}
];
/** Prefer the real index. Null means we do not have that sector index — never relabel Nifty 500. */
var SECTOR_BENCH = {
	Financials: {
		symbol: "^NSEBANK",
		name: "Nifty Bank"
	},
	IT: {
		symbol: "^CNXIT",
		name: "Nifty IT"
	},
	Healthcare: {
		symbol: "^CNXPHARMA",
		name: "Nifty Pharma"
	},
	Auto: {
		symbol: "^CNXAUTO",
		name: "Nifty Auto"
	},
	FMCG: {
		symbol: "^CNXFMCG",
		name: "Nifty FMCG"
	},
	Consumer: {
		symbol: "^CNXFMCG",
		name: "Nifty FMCG"
	},
	Energy: {
		symbol: "^CNXENERGY",
		name: "Nifty Energy"
	},
	Metal: {
		symbol: "^CNXMETAL",
		name: "Nifty Metal"
	},
	Materials: {
		symbol: "^CNXMETAL",
		name: "Nifty Metal"
	},
	Realty: {
		symbol: "^CNXREALTY",
		name: "Nifty Realty"
	},
	Infra: {
		symbol: "^CNXINFRA",
		name: "Nifty Infra"
	},
	Telecom: null,
	Chemicals: null,
	Industrials: null,
	Other: null,
	Commodities: null
};
function sectorIndex(sector) {
	if (!sector) return null;
	if (sector in SECTOR_BENCH) return SECTOR_BENCH[sector];
	return null;
}
function resolveBench(key) {
	if (!key) return BENCH$1.nifty;
	if (BENCH$1[key]) return BENCH$1[key];
	const raw = key.trim();
	if (!raw) return BENCH$1.nifty;
	return {
		symbol: raw,
		name: raw.replace(/^\^/, "")
	};
}
function allSectorBenchSymbols() {
	return [...new Set(Object.values(SECTOR_BENCH).flatMap((s) => s ? [s.symbol] : []))];
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/parse-CENCN28m.js
/** Confirmed mapping wins. Otherwise the stored spelling is kept, including `&`. */
function resolveSymbol(raw, book) {
	const stored = storedSymbol(raw);
	if (!book) return stored;
	const alias = book.aliases[stored] || book.aliases[baseSym(stored)];
	return alias ? storedSymbol(alias) : stored;
}
var SYM_KEYS = [
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
	"name"
];
var ISIN_KEYS = [
	"isin",
	"isincode",
	"isinnos",
	"isino",
	"isincodeisin",
	"isincodeofsecurity"
];
var QTY_KEYS = [
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
	"qtyheldinaccount"
];
var AVG_KEYS = [
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
	"pricepershare"
];
var INVESTED_KEYS = [
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
	"buyamount"
];
var DATE_KEYS = [
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
	"entrydate"
];
var NAME_KEYS = [
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
	"stock"
];
var SECTOR_KEYS = [
	"sector",
	"industry",
	"nseindustry",
	"bseindustry",
	"industryname",
	"gics",
	"gicsector",
	"industryclassification",
	"segment",
	"basicindustry"
];
var TRADE_ID_KEYS = [
	"tradeid",
	"tradeno",
	"tradenumber",
	"tradeidentifier",
	"traderef",
	"executionid",
	"execid",
	"executionno",
	"fillid",
	"fillno",
	"orderid",
	"orderno",
	"ordernumber",
	"exchangeorderid",
	"exchorderid",
	"exchordid",
	"uniqueid",
	"transactionid",
	"txnid",
	"dealid",
	"tradeuid",
	"id"
];
var SIDE_KEYS = [
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
	"type"
];
var BUYQTY_KEYS = [
	"buyqty",
	"buyquantity",
	"boughtqty",
	"purchaseqty"
];
var SELLQTY_KEYS = [
	"sellqty",
	"sellquantity",
	"soldqty",
	"saleqty"
];
var TYPE_KEYS = [
	"securitytype",
	"instrumenttype",
	"instrument",
	"type",
	"assetclass",
	"segmenttype"
];
var SKIP_SYM = /^(total|grandtotal|subtotal|net|portfolio|cash|equity|summary|holdings|instrument|totalholdingsvalue|totalderivativesopenpositions)$/i;
var FUND_RE = /\b(mutual\s+fund|index\s+fund|liquid\s+fund|flexi\s*cap|\betf\b|\belss\b|direct plan)\b/i;
var SERIES_SFX = /-(T|BE|SM|EQ|BL|PP|Q|Z|TB|XT|SG|X|GC|ST|IL|BT|BZ|A|B)$/i;
var NAME_TO_TICKER = {
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
	VMART: "VMART"
};
function normKey(k) {
	return String(k || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function pick(map, keys) {
	for (const k of keys) {
		const v = map[k];
		if (v !== void 0 && v !== "") return v;
	}
	return "";
}
function pickNonIsin(map, keys) {
	for (const k of keys) {
		const v = map[k];
		if (v === void 0 || v === "") continue;
		if (isIsin(String(v))) continue;
		return v;
	}
	return "";
}
function num(v) {
	if (v == null || v === "") return 0;
	if (typeof v === "number" && Number.isFinite(v)) return v;
	const n = Number(String(v).replace(/[,₹\u20B9]/g, "").replace(/\((.+)\)/, "-$1").trim());
	return Number.isFinite(n) ? n : 0;
}
function cleanSym(s) {
	return String(s).trim().toUpperCase().replace(/^(NSE:|BSE:|IND:|NSEEQ-|BSEEQ-)/, "").replace(/\.(NS|BO)$/i, "").replace(SERIES_SFX, "").replace(/\s+/g, "");
}
function normalizeName(s) {
	return String(s || "").toUpperCase().replace(/&/g, " AND ").replace(/[^A-Z0-9]+/g, " ").replace(/\b(THE|LTD|LIMITED|PRIVATE|PVT|PLC|INC|CORP|CORPORATION|EQUITY|NSE|BSE|COMPANY)\b/g, " ").replace(/\s+/g, " ").trim();
}
function lookupName(s) {
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
function excelSerialToIso(n) {
	if (!(n > 2e4 && n < 8e4)) return null;
	const ms = Math.round((n - 25569) * 86400 * 1e3);
	const d = new Date(ms);
	if (Number.isNaN(+d)) return null;
	return d.toISOString();
}
function parseHoldingWhen(raw) {
	if (raw == null || raw === "") return {
		date: null,
		boughtAt: null
	};
	if (raw instanceof Date && !Number.isNaN(+raw)) {
		const iso = raw.toISOString();
		return {
			date: iso.slice(0, 10),
			boughtAt: iso
		};
	}
	if (typeof raw === "number" && Number.isFinite(raw)) {
		const iso = excelSerialToIso(raw);
		if (!iso) return {
			date: null,
			boughtAt: null
		};
		return {
			date: iso.slice(0, 10),
			boughtAt: iso
		};
	}
	const s = String(raw).trim();
	if (!s) return {
		date: null,
		boughtAt: null
	};
	const serial = Number(s);
	if (/^\d+(\.\d+)?$/.test(s) && serial > 2e4 && serial < 8e4) {
		const iso = excelSerialToIso(serial);
		if (iso) return {
			date: iso.slice(0, 10),
			boughtAt: iso
		};
	}
	const isoTry = Date.parse(s);
	const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/) || s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
	if (m) {
		let y, mo, d, hh = 0, mm = 0, ss = 0;
		if (m[1].length === 4) {
			y = Number(m[1]);
			mo = Number(m[2]);
			d = Number(m[3]);
			hh = Number(m[4] || 0);
			mm = Number(m[5] || 0);
			ss = Number(m[6] || 0);
		} else {
			let dayN = Number(m[1]);
			let monthN = Number(m[2]);
			y = Number(m[3]);
			if (y < 100) y += y >= 70 ? 1900 : 2e3;
			if (dayN > 12 && monthN <= 12) {} else if (monthN > 12 && dayN <= 12) {
				const swap = dayN;
				dayN = monthN;
				monthN = swap;
			} else if (dayN > 12 && monthN > 12) return {
				date: null,
				boughtAt: null
			};
			d = dayN;
			mo = monthN;
			hh = Number(m[4] || 0);
			mm = Number(m[5] || 0);
			ss = Number(m[6] || 0);
		}
		if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2100) {
			const dt = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss));
			if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return {
				date: null,
				boughtAt: null
			};
			const iso = dt.toISOString();
			return {
				date: iso.slice(0, 10),
				boughtAt: iso
			};
		}
		return {
			date: null,
			boughtAt: null
		};
	}
	if (Number.isFinite(isoTry)) {
		const iso = new Date(isoTry).toISOString();
		return {
			date: iso.slice(0, 10),
			boughtAt: iso
		};
	}
	const day = s.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return {
		date: day,
		boughtAt: day + "T00:00:00.000Z"
	};
	return {
		date: null,
		boughtAt: null
	};
}
function guessTicker(raw, name, isin) {
	const isinUp = String(isin || "").trim().toUpperCase();
	if (isEquityIsin(isinUp)) {
		const mapped = tickerFromIsin(isinUp);
		if (mapped) return mapped;
	}
	const cleaned = cleanSym(raw);
	if (isIsin(cleaned)) {
		const mapped = tickerFromIsin(cleaned) || lookupName(name || "") || lookupName(raw);
		if (mapped && !isIsin(mapped)) return mapped;
		return cleaned;
	}
	const fromName = lookupName(raw) || (name ? lookupName(name) : "") || lookupName(cleaned);
	if (fromName) return fromName;
	if (/^[A-Z][A-Z0-9.&_-]{0,21}$/.test(cleaned) && cleaned.length <= 22 && !/LTD|LIMITED/.test(cleaned)) return cleaned.replace(/\.+$/, "");
	return cleaned;
}
function looksLikeHeader(cells) {
	const keys = cells.map(normKey).filter(Boolean);
	if (keys.length < 2) return false;
	const hasSym = keys.some((k) => SYM_KEYS.includes(k) || ISIN_KEYS.includes(k) || k.includes("symbol") || k.includes("instrument") || k.includes("scrip") || k.includes("script") || k === "isin" || k === "stockname");
	const hasQty = keys.some((k) => QTY_KEYS.includes(k) || k.includes("qty") || k.includes("quantity") || k === "shares");
	const hasSide = keys.some((k) => SIDE_KEYS.includes(k) || k.includes("buysell") || k === "side" || k === "tradetype");
	const hasBuySellQty = keys.some((k) => BUYQTY_KEYS.includes(k) || SELLQTY_KEYS.includes(k));
	return hasSym && (hasQty || hasSide || hasBuySellQty);
}
function rowToMap(hdr, cells) {
	const map = {};
	hdr.forEach((h, i) => {
		if (!h) return;
		map[normKey(h)] = cells[i] ?? "";
	});
	return map;
}
function niceName(symbol, rawName) {
	const n = String(rawName || "").trim();
	if (n && !isIsin(n) && n.toUpperCase() !== symbol) return n;
	return displayName({
		symbol,
		name: n
	});
}
function findIsin(map) {
	const fromKey = String(pick(map, ISIN_KEYS) || "").trim().toUpperCase();
	if (isIsin(fromKey)) return fromKey;
	for (const v of Object.values(map)) {
		const s = String(v || "").trim().toUpperCase();
		if (isIsin(s)) return s;
	}
	return "";
}
function isFundRow(map, rawName, rawTicker, isin) {
	if (isMfIsin(isin)) return true;
	const typ = String(pick(map, TYPE_KEYS) || "");
	if (/mutual|\bfund\b|etf/i.test(typ) && !/equity stock|^equity$/i.test(typ)) return true;
	return FUND_RE.test(rawName) || FUND_RE.test(rawTicker);
}
function rowMap(row) {
	const map = {};
	for (const [k, v] of Object.entries(row || {})) map[normKey(k)] = v;
	return map;
}
function sideOf(map, qty) {
	const s = String(pick(map, SIDE_KEYS) || "").toUpperCase().trim();
	if (s) {
		if (/\b(EQUITY|STOCK|MUTUAL|FUND|ETF|OPTION|FUTURE|INDEX|BOND|DEBT|COMMODITY)\b/.test(s) && !/\b(BUY|SELL)\b/.test(s)) {} else if (/^(B|BUY|BBUY|PURCHASE|PURCHASED|BOUGHT|CREDIT|CR|IN|ADD)$/.test(s)) return 1;
		else if (/^(S|SELL|SALE|SOLD|DEBIT|DR|OUT|SQUARE)$/.test(s)) return -1;
		else if (/buy/.test(s.toLowerCase()) && !/sell/.test(s.toLowerCase())) return 1;
		else if (/sell|sale/.test(s.toLowerCase())) return -1;
		else if (!/^(CNC|MIS|NRML|DELIVERY|INTRADAY|MARGIN|LIMIT|MARKET|SL|SL-M)$/.test(s)) return 0;
	}
	if (qty < 0) return -1;
	const bq = num(pick(map, BUYQTY_KEYS));
	const sq = num(pick(map, SELLQTY_KEYS));
	if (bq > 0 && !(sq > 0)) return 1;
	if (sq > 0 && !(bq > 0)) return -1;
	return 0;
}
function tradeQty(map) {
	const bq = num(pick(map, BUYQTY_KEYS));
	const sq = num(pick(map, SELLQTY_KEYS));
	if (bq > 0 && !(sq > 0)) return {
		qty: bq,
		side: 1
	};
	if (sq > 0 && !(bq > 0)) return {
		qty: sq,
		side: -1
	};
	const q = num(pick(map, QTY_KEYS));
	const side = sideOf(map, q);
	return {
		qty: Math.abs(q),
		side
	};
}
function pickTradeId(map) {
	for (const k of TRADE_ID_KEYS) {
		const v = String(pick(map, [k]) || "").trim();
		if (!v) continue;
		if (isIsin(v)) continue;
		if (/^(buy|sell|equity|trade|stock)$/i.test(v)) continue;
		return v;
	}
}
function tradeHasClock(t) {
	const s = t.boughtAt || "";
	if (!/T\d{2}:\d{2}/.test(s)) return false;
	return !/T00:00:00/.test(s);
}
function tradeMs(t) {
	const s = t.boughtAt || t.date;
	const n = s ? Date.parse(s) : NaN;
	return Number.isFinite(n) ? n : 0;
}
/** Date, then clock if both have one, then original file row. Never force buys first. */
function sortTrades(trades) {
	return [...trades || []].map((t, i) => ({
		t,
		i
	})).sort((A, B) => {
		const a = A.t;
		const b = B.t;
		const da = a.date || "";
		const db = b.date || "";
		if (da !== db) return da.localeCompare(db);
		if (tradeHasClock(a) && tradeHasClock(b)) {
			const d = tradeMs(a) - tradeMs(b);
			if (d) return d;
		}
		const sa = a.src ?? A.i;
		const sb = b.src ?? B.i;
		if (sa !== sb) return sa - sb;
		return A.i - B.i;
	}).map((x) => x.t);
}
function isTradeBook(rows) {
	let n = 0;
	let hits = 0;
	let both = 0;
	for (const row of rows.slice(0, 80)) {
		const map = rowMap(row);
		if (!String(pickNonIsin(map, SYM_KEYS) || pickNonIsin(map, NAME_KEYS) || findIsin(map) || "")) continue;
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
	if (both / n >= .5) return false;
	return hits / n >= .2;
}
function extractTrades(rows) {
	const out = [];
	let src = 0;
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
		let price = num(pick(map, AVG_KEYS)) || num(pick(map, [
			"price",
			"tradeprice",
			"tradedprice",
			"rate",
			"ltp"
		]));
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
			isin: isEquityIsin(rawIsin) ? rawIsin : void 0,
			sector: normalizeSectorLabel(String(pick(map, SECTOR_KEYS) || "")) || void 0,
			id: pickTradeId(map),
			src: src++
		});
	}
	return out;
}
function extractTradeLines(rows) {
	return extractTrades(rows).map((t) => ({
		symbol: t.symbol,
		name: t.name,
		qty: t.qty,
		price: t.price,
		date: t.date,
		boughtAt: t.boughtAt,
		side: t.side,
		isin: t.isin,
		sector: t.sector,
		id: t.id,
		src: t.src
	}));
}
function netTrades(trades) {
	const by = /* @__PURE__ */ new Map();
	for (const t of trades) {
		const k = baseSym(t.symbol);
		const list = by.get(k) || [];
		list.push(t);
		by.set(k, list);
	}
	const out = [];
	for (const [k, list] of by) {
		const ordered = sortTrades(list);
		const lots = [];
		for (const t of ordered) {
			if (t.side > 0) {
				lots.push({
					qty: t.qty,
					px: t.price,
					date: t.date,
					boughtAt: t.boughtAt
				});
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
		const avg = withPx.length ? withPx.reduce((s, l) => s + l.qty * l.px, 0) / withPx.reduce((s, l) => s + l.qty, 0) : null;
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
			lots: lots.filter((l) => l.qty > 1e-8).map((l) => ({
				qty: l.qty,
				avg: l.px > 0 ? l.px : avg || 0,
				date: l.date,
				boughtAt: l.boughtAt
			}))
		});
	}
	return out;
}
function extractHoldings(rows) {
	if (isTradeBook(rows)) {
		const trades = extractTrades(rows);
		if (trades.length) return netTrades(trades);
	}
	const out = [];
	for (const row of rows) {
		const map = {};
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
		if (!(avg > 0) && isIsin(symbol) && !tickerFromIsin(symbol)) continue;
		const when = parseHoldingWhen(pick(map, DATE_KEYS));
		const fileSector = normalizeSectorLabel(String(pick(map, SECTOR_KEYS) || ""));
		out.push({
			symbol,
			name: niceName(symbol, rawName || TICKER_NAMES[baseSym(symbol)] || ""),
			qty,
			avg: avg > 0 ? avg : null,
			date: when.date,
			boughtAt: when.boughtAt,
			isin: isEquityIsin(rawIsin) ? rawIsin : isEquityIsin(rawSym) ? cleanSym(rawSym) : void 0,
			sector: fileSector || void 0
		});
	}
	const m = /* @__PURE__ */ new Map();
	for (const r of out) {
		const k = baseSym(r.symbol);
		const cur = m.get(k);
		if (!cur) m.set(k, {
			...r,
			symbol: k,
			name: niceName(k, r.name)
		});
		else {
			const q = cur.qty + r.qty;
			const avg = cur.avg && r.avg ? (cur.avg * cur.qty + r.avg * r.qty) / q : cur.avg || r.avg;
			const name = !isIsin(r.name) && r.name.length >= (cur.name || "").length ? r.name : cur.name;
			m.set(k, {
				...cur,
				qty: q,
				avg,
				name: niceName(k, name),
				date: cur.date && r.date ? cur.date < r.date ? cur.date : r.date : cur.date || r.date,
				boughtAt: cur.boughtAt && r.boughtAt ? cur.boughtAt < r.boughtAt ? cur.boughtAt : r.boughtAt : cur.boughtAt || r.boughtAt,
				isin: cur.isin || r.isin,
				sector: cur.sector || r.sector
			});
		}
	}
	return [...m.values()];
}
function matrixToRows(matrix) {
	const rows = (matrix || []).map((r) => Array.isArray(r) ? r : [r]);
	if (!rows.length) return [];
	const cellsOf = (r) => r.map((c) => c == null ? "" : String(c).trim());
	let header = null;
	let sawHeader = false;
	const objects = [];
	for (const r of rows) {
		const cells = cellsOf(r);
		if (!cells.some(Boolean)) continue;
		if (looksLikeHeader(cells)) {
			if (header && cells.map(normKey).join("|") === header.map(normKey).join("|")) continue;
			header = cells;
			sawHeader = true;
			continue;
		}
		if (!header) continue;
		objects.push(rowToMap(header, r));
	}
	if (sawHeader) return objects;
	let headerIdx = rows.findIndex((r) => r.some((c) => String(c || "").trim()));
	if (headerIdx < 0) return [];
	const hdr = rows[headerIdx].map((c) => String(c ?? "").trim());
	const fallback = [];
	for (const r of rows.slice(headerIdx + 1)) {
		if (!r.some((c) => c != null && String(c).trim() !== "")) continue;
		if (cellsOf(r).map(normKey).join("|") === hdr.map(normKey).join("|")) continue;
		fallback.push(rowToMap(hdr, r));
	}
	return fallback;
}
function parseMatrixDetailed(matrix) {
	const objects = matrixToRows(matrix);
	if (!objects.length) return {
		holdings: [],
		fromTrades: false,
		trades: [],
		audit: emptyAudit()
	};
	const fromTrades = isTradeBook(objects);
	const trades = fromTrades ? extractTradeLines(objects) : [];
	return {
		holdings: extractHoldings(objects),
		fromTrades,
		trades,
		audit: auditTradeObjects(objects)
	};
}
function lastWins(rows) {
	const m = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const k = baseSym(r.symbol);
		const cur = m.get(k);
		if (!cur) {
			m.set(k, {
				...r,
				symbol: k,
				name: niceName(k, r.name)
			});
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
			unit: r.unit || cur.unit
		});
	}
	return [...m.values()];
}
/** Snapshot qty wins; trade-book dates/avg fill blanks; sold names from the blotter are not added. */
function combineBooks(parts) {
	const snaps = [];
	const trades = [];
	for (const p of parts) {
		if (!p.holdings.length) continue;
		if (p.fromTrades) trades.push(...p.holdings);
		else snaps.push(...p.holdings);
	}
	const snap = lastWins(snaps);
	const trade = lastWins(trades);
	if (snap.length && trade.length) return fillHoldings(snap, trade, {
		dates: true,
		prices: true,
		addNew: false
	});
	if (snap.length) return snap;
	return trade;
}
function parseCsvText(text) {
	const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length);
	if (!lines.length) return [];
	const cands = [
		",",
		"	",
		";",
		"|"
	];
	let delim = ",";
	let best = -1;
	for (const d of cands) {
		const useful = lines.slice(0, 40).map((line) => {
			let n = 0;
			let q = false;
			for (let i = 0; i < line.length; i++) {
				const ch = line[i];
				if (ch === "\"") q = !q;
				else if (ch === d && !q) n++;
			}
			return n;
		}).filter((n) => n > 0);
		if (!useful.length) continue;
		const mode = useful.sort((a, b) => a - b)[Math.floor(useful.length / 2)];
		const score = useful.filter((n) => n === mode).length * mode;
		if (score > best) {
			best = score;
			delim = d;
		}
	}
	const split = (line) => {
		const out = [];
		let cur = "";
		let q = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === "\"") {
				if (q && line[i + 1] === "\"") {
					cur += "\"";
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
function parseCsv(text) {
	return matrixToRows(parseCsvText(text));
}
async function parseSpreadsheetDetailed(buf) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.r);
	const wb = XLSX.read(buf, {
		type: "array",
		cellDates: true
	});
	const hits = [];
	for (const name of wb.SheetNames) {
		const sheet = wb.Sheets[name];
		if (!sheet) continue;
		const n = name.toLowerCase();
		if (/mutual|\bmf\b|nfo|sip/.test(n) && !/equity|holding|trade|transaction/.test(n)) continue;
		const got = parseMatrixDetailed(XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			defval: "",
			raw: true
		}));
		if (!got.holdings.length && !(got.trades || []).length) continue;
		let score = got.holdings.length;
		if (/holdings|equity|stock/.test(n)) score += 100;
		if (/trade|transaction|order|pnl|buy/.test(n)) score += 80;
		if (/combined|all/.test(n)) score += 10;
		hits.push({
			...got,
			score
		});
	}
	hits.sort((a, b) => a.score - b.score);
	const holdings = combineBooks(hits);
	const hasSnap = hits.some((h) => !h.fromTrades);
	const trades = mergeTradeLines([], hits.flatMap((h) => h.trades || []));
	return {
		holdings,
		fromTrades: Boolean(holdings.length) && !hasSnap,
		trades,
		audit: sumAudits(hits.map((h) => h.audit))
	};
}
function decodeText(buf) {
	const u8 = new Uint8Array(buf);
	if (u8.length >= 2 && u8[0] === 255 && u8[1] === 254) return new TextDecoder("utf-16le").decode(buf);
	if (u8.length >= 2 && u8[0] === 254 && u8[1] === 255) return new TextDecoder("utf-16be").decode(buf);
	return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}
async function parseHoldingsFileDetailed(file) {
	const name = file.name.toLowerCase();
	const buf = await file.arrayBuffer();
	if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) try {
		const got = await parseSpreadsheetDetailed(buf);
		if (got.holdings.length || (got.trades || []).length) return got;
	} catch {}
	const rows = parseCsv(decodeText(buf));
	const fromTrades = isTradeBook(rows);
	return {
		holdings: extractHoldings(rows),
		fromTrades,
		trades: fromTrades ? extractTradeLines(rows) : [],
		audit: auditTradeObjects(rows)
	};
}
async function parseHoldingsFiles(files) {
	const parts = [];
	const errors = [];
	for (const f of files) try {
		const got = await parseHoldingsFileDetailed(f);
		if (!got.holdings.length && !got.trades?.length) errors.push(f.name + " — no ticker + qty columns found");
		else parts.push(got);
	} catch (err) {
		errors.push(f.name + " — " + (err instanceof Error ? err.message : "could not read"));
	}
	return {
		holdings: combineBooks(parts),
		trades: mergeTradeLines([], parts.flatMap((p) => p.trades || [])),
		errors,
		audit: sumAudits(parts.map((p) => p.audit))
	};
}
function parseVoice(text) {
	const out = [];
	const re = /([A-Za-z][A-Za-z0-9&.-]{1,24})\s+(\d+(?:\.\d+)?)/g;
	let m;
	while (m = re.exec(text)) {
		const symbol = guessTicker(m[1]);
		out.push({
			symbol,
			name: displayName({
				symbol,
				name: m[1]
			}),
			qty: Number(m[2]),
			avg: null,
			date: null
		});
	}
	return mergeHoldings([], out);
}
function mergeHoldings(existing, incoming) {
	const map = /* @__PURE__ */ new Map();
	for (const h of [...existing, ...incoming]) {
		const stored = storedSymbol(h.symbol);
		const k = baseSym(stored);
		const cur = map.get(k);
		if (!cur) {
			map.set(k, {
				...h,
				symbol: stored,
				name: displayName({
					symbol: stored,
					name: h.name
				})
			});
			continue;
		}
		const q = cur.qty + h.qty;
		const avg = cur.avg && h.avg ? (cur.avg * cur.qty + h.avg * h.qty) / q : cur.avg || h.avg;
		const symbol = preferSymbol(cur.symbol, stored);
		map.set(k, {
			...cur,
			symbol,
			qty: q,
			avg,
			name: displayName({
				symbol,
				name: h.name || cur.name
			}),
			date: h.date || cur.date,
			boughtAt: h.boughtAt || cur.boughtAt,
			isin: h.isin || cur.isin,
			sector: h.sector || cur.sector,
			kind: h.kind || cur.kind,
			unit: h.unit || cur.unit,
			lots: [...cur.lots || [], ...h.lots || []],
			updatedAt: Math.max(cur.updatedAt || 0, h.updatedAt || 0) || void 0
		});
	}
	return [...map.values()];
}
function tradeBrokerId(t) {
	return String(t.id || "").trim() || "";
}
function asTradeLine(t) {
	const id = tradeBrokerId(t) || void 0;
	return {
		...t,
		symbol: storedSymbol(t.symbol),
		name: t.name || t.symbol,
		qty: t.qty,
		price: t.price > 0 ? t.price : 0,
		date: t.date || null,
		side: t.side,
		id,
		src: t.src,
		priceFilled: t.priceFilled || void 0
	};
}
/** Keep every execution. Skip only when both rows share the same broker trade id. */
function mergeTradeLines(existing, incoming) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const t of [...existing || [], ...incoming || []]) {
		if (!(t.qty > 0) || t.side !== 1 && t.side !== -1) continue;
		const row = asTradeLine(t);
		if (row.id) {
			if (seen.has(row.id)) continue;
			seen.add(row.id);
		}
		out.push(row);
	}
	return sortTrades(out);
}
function emptyAudit() {
	return {
		rowsRead: 0,
		accepted: 0,
		ignored: 0,
		duplicates: 0,
		ambiguous: 0,
		missingPrices: 0,
		unresolved: 0
	};
}
function sumAudits(parts) {
	const out = emptyAudit();
	for (const p of parts) {
		if (!p) continue;
		out.rowsRead += p.rowsRead;
		out.accepted += p.accepted;
		out.ignored += p.ignored;
		out.duplicates += p.duplicates;
		out.ambiguous += p.ambiguous;
		out.missingPrices += p.missingPrices;
		out.unresolved += p.unresolved;
	}
	return out;
}
function rowHasText(row) {
	return Object.values(row).some((v) => String(v ?? "").trim() !== "");
}
/** Counts what the trade parser kept, skipped, duplicated, or could not price. Does not drop rows by itself. */
function auditTradeObjects(rows) {
	const source = (rows || []).filter(rowHasText);
	const trades = extractTradeLines(source);
	const ids = /* @__PURE__ */ new Map();
	let missingPrices = 0;
	let unresolved = 0;
	for (const t of trades) {
		if (!(t.price > 0)) missingPrices += 1;
		if (!/^[A-Z][A-Z0-9.&-]{0,20}$/.test(t.symbol)) unresolved += 1;
		if (t.id) ids.set(t.id, (ids.get(t.id) || 0) + 1);
	}
	let duplicates = 0;
	for (const n of ids.values()) if (n > 1) duplicates += n - 1;
	let ambiguous = 0;
	for (const row of source) {
		const map = rowMap(row);
		if (!String(pickNonIsin(map, SYM_KEYS) || pickNonIsin(map, NAME_KEYS) || "")) continue;
		const { qty, side } = tradeQty(map);
		if (qty > 0 && side === 0) ambiguous += 1;
	}
	const accepted = trades.length;
	return {
		rowsRead: source.length,
		accepted,
		ignored: Math.max(0, source.length - accepted),
		duplicates,
		ambiguous,
		missingPrices,
		unresolved
	};
}
/** Honest notes for Path upload: undated, missing price, zero qty. */
function auditTradeLines(trades) {
	const out = [];
	for (const t of trades || []) {
		const who = t.name || t.symbol || "A line";
		if (!(t.qty > 0)) out.push(`${who} — zero quantity`);
		if (!(t.price > 0) && t.date) out.push(`${who} on ${t.date} — no price in the file. We will use that day’s close.`);
		else if (!(t.price > 0)) out.push(`${who} — no price`);
		if (!t.date) out.push(`${who} — no date (sits out of the path line)`);
	}
	return out;
}
function sanitizeTrades(rows) {
	if (!rows?.length) return [];
	return mergeTradeLines([], rows.map((t) => ({
		...t,
		symbol: guessTicker(t.symbol, t.name, t.isin),
		name: t.name || t.symbol,
		qty: Number(t.qty) || 0,
		price: Number(t.price) || 0,
		side: t.side === -1 ? -1 : 1,
		date: t.date || null,
		id: t.id ? String(t.id).trim() : void 0,
		src: t.src
	})));
}
function normName(s) {
	return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}
function stemSym(s) {
	return baseSym(s).replace(/_(SM|X|BE|EQ|T|XT)$/i, "");
}
function classifyIncoming(existing, incoming) {
	const keys = new Set(existing.map((h) => stemSym(h.symbol)));
	const names = new Set(existing.map((h) => normName(h.name)).filter(Boolean));
	const matched = [];
	const fresh = [];
	for (const h of incoming) if (keys.has(stemSym(h.symbol)) || names.has(normName(h.name))) matched.push(h);
	else fresh.push(h);
	return {
		matched,
		fresh
	};
}
/** Fill dates / avg cost on matching names. Never adds unknown tickers unless addNew. */
function fillHoldings(existing, incoming, opts = {}) {
	const doDates = opts.dates !== false;
	const doPrices = opts.prices !== false;
	const addNew = Boolean(opts.addNew);
	const map = new Map(existing.map((h) => [baseSym(h.symbol), {
		...h,
		symbol: storedSymbol(h.symbol)
	}]));
	const byStem = /* @__PURE__ */ new Map();
	const byName = /* @__PURE__ */ new Map();
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
			const next = {
				...h,
				symbol: storedSymbol(h.symbol),
				name: displayName({
					symbol: storedSymbol(h.symbol),
					name: h.name
				})
			};
			map.set(k, next);
			byStem.set(stemSym(k), k);
			byName.set(normName(next.name), k);
			continue;
		}
		const symbol = preferSymbol(cur.symbol, storedSymbol(h.symbol));
		map.set(key, {
			...cur,
			symbol,
			date: doDates ? cur.date || h.date : cur.date,
			boughtAt: doDates ? cur.boughtAt || h.boughtAt : cur.boughtAt,
			avg: doPrices ? cur.avg != null && cur.avg > 0 ? cur.avg : h.avg : cur.avg,
			isin: cur.isin || h.isin,
			name: cur.name || displayName({
				symbol,
				name: h.name
			})
		});
	}
	return [...map.values()];
}
/** Replace qty on matches (snapshot remaining), fill blank dates/avg, add names that are not in the book. */
function upsertHoldings(existing, incoming) {
	const withNew = fillHoldings(existing, incoming, {
		dates: true,
		prices: true,
		addNew: true
	});
	const byStem = /* @__PURE__ */ new Map();
	const byName = /* @__PURE__ */ new Map();
	for (const h of incoming) {
		byStem.set(stemSym(h.symbol), h);
		const n = normName(h.name);
		if (n) byName.set(n, h);
	}
	return withNew.map((h) => {
		const src = byStem.get(stemSym(h.symbol)) || byName.get(normName(h.name));
		if (!src || !(src.qty > 0)) return h;
		return {
			...h,
			qty: src.qty
		};
	});
}
/** Strip series suffixes and apply a confirmed alias. Never turn GMRP&UI into GMRP_UI. */
function sanitizeHoldings(rows, book) {
	return mergeHoldings([], (rows || []).map((h) => {
		if (h.kind === "commodity") return {
			...h,
			symbol: String(h.symbol || "").toUpperCase()
		};
		const symbol = resolveSymbol(guessTicker(h.symbol, h.name, h.isin), book);
		return {
			...h,
			symbol
		};
	}));
}
/** In-place edit of the one line. Drops remaining lots so Your XIRR follows the edited qty/date, not the old FIFO lots. */
function applyHoldingPatch(h, patch) {
	const next = {
		...h,
		...patch
	};
	if (("qty" in patch || "avg" in patch || "date" in patch || "boughtAt" in patch) && !("lots" in patch) && next.lots?.length) next.lots = void 0;
	return next;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/store-DI8DNRvC.js
var SAMPLE_HOLDINGS = [
	{
		symbol: "RELIANCE",
		name: "Reliance Industries",
		qty: 20,
		avg: 1100,
		date: "2020-03-23"
	},
	{
		symbol: "TCS",
		name: "Tata Consultancy Services",
		qty: 8,
		avg: 2100,
		date: "2019-08-16"
	},
	{
		symbol: "HDFCBANK",
		name: "HDFC Bank",
		qty: 25,
		avg: 650,
		date: "2020-04-07"
	},
	{
		symbol: "INFY",
		name: "Infosys",
		qty: 15,
		avg: 1050,
		date: "2018-10-15"
	},
	{
		symbol: "BHARTIARTL",
		name: "Bharti Airtel",
		qty: 30,
		avg: 1500,
		date: "2021-01-18"
	},
	{
		symbol: "ITC",
		name: "ITC",
		qty: 80,
		avg: 220,
		date: "2019-01-14"
	},
	{
		symbol: "LT",
		name: "Larsen & Toubro",
		qty: 6,
		avg: 3600,
		date: "2022-02-07"
	},
	{
		symbol: "SUNPHARMA",
		name: "Sun Pharma",
		qty: 10,
		avg: 1650,
		date: "2021-06-14"
	}
];
function t(symbol, name, qty, price, date, side) {
	return {
		symbol,
		name,
		qty,
		price,
		date,
		boughtAt: date + "T00:00:00.000Z",
		side
	};
}
var SAMPLE_TRADES = [
	t("INFY", "Infosys", 15, 1050, "2018-10-15", 1),
	t("ITC", "ITC", 100, 220, "2019-01-14", 1),
	t("TCS", "Tata Consultancy Services", 8, 2100, "2019-08-16", 1),
	t("RELIANCE", "Reliance Industries", 20, 1100, "2020-03-23", 1),
	t("HDFCBANK", "HDFC Bank", 25, 650, "2020-04-07", 1),
	t("BHARTIARTL", "Bharti Airtel", 30, 1500, "2021-01-18", 1),
	t("SUNPHARMA", "Sun Pharma", 10, 1650, "2021-06-14", 1),
	t("LT", "Larsen & Toubro", 6, 3600, "2022-02-07", 1),
	t("ITC", "ITC", 20, 430, "2024-06-03", -1)
];
function samplePortfolio() {
	return {
		id: "sample",
		name: "Sample · core",
		holdings: SAMPLE_HOLDINGS,
		bench: "nifty",
		includeCommodities: true,
		trades: SAMPLE_TRADES
	};
}
function swings(bars, k = 4) {
	if (bars.length < k * 2 + 3) return [];
	const out = [];
	for (let i = k; i < bars.length - k; i++) {
		let isH = true;
		let isL = true;
		for (let j = i - k; j <= i + k; j++) {
			if (j === i) continue;
			if (bars[j].h >= bars[i].h) isH = false;
			if (bars[j].l <= bars[i].l) isL = false;
		}
		if (isH) out.push({
			t: bars[i].t,
			price: bars[i].h,
			kind: "H",
			i
		});
		else if (isL) out.push({
			t: bars[i].t,
			price: bars[i].l,
			kind: "L",
			i
		});
	}
	return out;
}
function nameSwings(list) {
	const out = [];
	let lastH = null;
	let lastL = null;
	for (const x of list) if (x.kind === "H") {
		const label = lastH ? x.price > lastH.price ? "HH" : "LH" : "H";
		out.push({
			...x,
			label
		});
		lastH = x;
	} else {
		const label = lastL ? x.price > lastL.price ? "HL" : "LL" : "L";
		out.push({
			...x,
			label
		});
		lastL = x;
	}
	return out;
}
function clusterPrices(points, pct = 1) {
	const src = [...points].filter((p) => p.price > 0).sort((a, b) => a.price - b.price);
	const out = [];
	for (const p of src) {
		const hit = out.find((c) => Math.abs(c.price - p.price) / c.price <= pct / 100);
		if (hit) {
			hit.n += 1;
			hit.price = (hit.price * (hit.n - 1) + p.price) / hit.n;
			if (!hit.labels.includes(p.label)) hit.labels.push(p.label);
		} else out.push({
			price: p.price,
			n: 1,
			labels: [p.label]
		});
	}
	return out.sort((a, b) => b.n - a.n);
}
function lastNum(a) {
	for (let i = a.length - 1; i >= 0; i--) {
		const v = a[i];
		if (v != null && Number.isFinite(v)) return v;
	}
	return null;
}
function sma(vals, n) {
	const out = Array(vals.length).fill(null);
	if (n <= 0) return out;
	let sum = 0;
	for (let i = 0; i < vals.length; i++) {
		sum += vals[i];
		if (i >= n) sum -= vals[i - n];
		if (i >= n - 1) out[i] = sum / n;
	}
	return out;
}
function ema(vals, n) {
	const out = Array(vals.length).fill(null);
	if (n <= 0 || !vals.length) return out;
	const k = 2 / (n + 1);
	let prev = null;
	for (let i = 0; i < vals.length; i++) if (prev == null) {
		if (i >= n - 1) {
			let s = 0;
			for (let j = i - n + 1; j <= i; j++) s += vals[j];
			prev = s / n;
			out[i] = prev;
		}
	} else {
		prev = vals[i] * k + prev * (1 - k);
		out[i] = prev;
	}
	return out;
}
function rsi(closes, n = 14) {
	const out = Array(closes.length).fill(null);
	if (closes.length < n + 1) return out;
	let gain = 0;
	let loss = 0;
	for (let i = 1; i <= n; i++) {
		const d = closes[i] - closes[i - 1];
		if (d >= 0) gain += d;
		else loss -= d;
	}
	let ag = gain / n;
	let al = loss / n;
	out[n] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
	for (let i = n + 1; i < closes.length; i++) {
		const d = closes[i] - closes[i - 1];
		const g = d > 0 ? d : 0;
		const l = d < 0 ? -d : 0;
		ag = (ag * (n - 1) + g) / n;
		al = (al * (n - 1) + l) / n;
		out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
	}
	return out;
}
function macd(closes, fast = 12, slow = 26, sig = 9) {
	const eFast = ema(closes, fast);
	const eSlow = ema(closes, slow);
	const line = closes.map((_, i) => eFast[i] != null && eSlow[i] != null ? eFast[i] - eSlow[i] : null);
	const compact = line.map((v) => v ?? 0);
	const start = line.findIndex((v) => v != null);
	const sigEma = ema(start >= 0 ? compact.slice(start) : [], sig);
	const signal = line.map(() => null);
	const hist = line.map(() => null);
	for (let i = 0; i < sigEma.length; i++) {
		const idx = start + i;
		const s = sigEma[i];
		if (s == null || line[idx] == null) continue;
		signal[idx] = s;
		hist[idx] = line[idx] - s;
	}
	return {
		line,
		signal,
		hist
	};
}
function bollinger(closes, n = 20, k = 2) {
	const mid = sma(closes, n);
	const upper = Array(closes.length).fill(null);
	const lower = Array(closes.length).fill(null);
	for (let i = n - 1; i < closes.length; i++) {
		const m = mid[i];
		if (m == null) continue;
		let s = 0;
		for (let j = i - n + 1; j <= i; j++) s += (closes[j] - m) ** 2;
		const sd = Math.sqrt(s / n);
		upper[i] = m + k * sd;
		lower[i] = m - k * sd;
	}
	return {
		mid,
		upper,
		lower
	};
}
function stoch(bars, n = 14, smooth = 3) {
	const kRaw = Array(bars.length).fill(null);
	for (let i = n - 1; i < bars.length; i++) {
		let hi = -Infinity;
		let lo = Infinity;
		for (let j = i - n + 1; j <= i; j++) {
			if (bars[j].h > hi) hi = bars[j].h;
			if (bars[j].l < lo) lo = bars[j].l;
		}
		const span = hi - lo || 1e-9;
		kRaw[i] = (bars[i].c - lo) / span * 100;
	}
	const k = sma(kRaw.map((v) => v ?? 0), smooth).map((v, i) => kRaw[i] == null ? null : v);
	return {
		k,
		d: sma(k.map((v) => v ?? 0), smooth).map((v, i) => k[i] == null ? null : v)
	};
}
function vwap(bars) {
	const out = Array(bars.length).fill(null);
	let pv = 0;
	let vol = 0;
	for (let i = 0; i < bars.length; i++) {
		const typical = (bars[i].h + bars[i].l + bars[i].c) / 3;
		pv += typical * (bars[i].v || 0);
		vol += bars[i].v || 0;
		out[i] = vol > 0 ? pv / vol : typical;
	}
	return out;
}
function atr(bars, n = 14) {
	const out = Array(bars.length).fill(null);
	if (bars.length < 2) return out;
	const tr = [bars[0].h - bars[0].l];
	for (let i = 1; i < bars.length; i++) {
		const prev = bars[i - 1].c;
		tr.push(Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - prev), Math.abs(bars[i].l - prev)));
	}
	const ma = sma(tr, n);
	for (let i = 0; i < bars.length; i++) out[i] = ma[i];
	return out;
}
function supertrend(bars, n = 10, mult = 3) {
	const a = atr(bars, n);
	const line = Array(bars.length).fill(null);
	const dir = Array(bars.length).fill(null);
	let lastDir = 1;
	let last = 0;
	for (let i = 0; i < bars.length; i++) {
		const atrV = a[i];
		if (atrV == null) continue;
		const mid = (bars[i].h + bars[i].l) / 2;
		const upper = mid + mult * atrV;
		const lower = mid - mult * atrV;
		if (!last) {
			last = bars[i].c >= mid ? lower : upper;
			lastDir = bars[i].c >= mid ? 1 : -1;
		} else if (lastDir === 1) {
			last = Math.max(lower, last);
			if (bars[i].c < last) {
				lastDir = -1;
				last = upper;
			}
		} else {
			last = Math.min(upper, last);
			if (bars[i].c > last) {
				lastDir = 1;
				last = lower;
			}
		}
		line[i] = last;
		dir[i] = lastDir;
	}
	return {
		line,
		dir
	};
}
function volumeProfile(bars, bins = 22) {
	if (!bars.length) return [];
	let hi = -Infinity;
	let lo = Infinity;
	for (const b of bars) {
		if (b.h > hi) hi = b.h;
		if (b.l < lo) lo = b.l;
	}
	if (!Number.isFinite(hi) || hi === lo) return Array.from({ length: bins }, (_, i) => ({
		price: hi || 0,
		vol: i === 0 ? 1 : 0
	}));
	const span = hi - lo || 1;
	const out = Array.from({ length: bins }, (_, i) => ({
		price: lo + (i + .5) / bins * span,
		vol: 0
	}));
	for (const b of bars) {
		const mid = (b.h + b.l) / 2;
		const idx = Math.min(bins - 1, Math.max(0, Math.floor((mid - lo) / span * bins)));
		out[idx].vol += b.v || 0;
	}
	return out;
}
function isNr7(bars) {
	if (bars.length < 7) return false;
	const ranges = bars.slice(-7).map((b) => b.h - b.l);
	const last = ranges[ranges.length - 1];
	return ranges.every((r) => last <= r + 1e-9);
}
function resample(bars, bucketSec) {
	if (!bars.length || !(bucketSec > 0)) return bars;
	const out = [];
	let cur = null;
	let bucket = -1;
	for (const b of bars) {
		const k = Math.floor(b.t / bucketSec);
		if (cur && k === bucket) {
			cur.h = Math.max(cur.h, b.h);
			cur.l = Math.min(cur.l, b.l);
			cur.c = b.c;
			cur.v += b.v;
		} else {
			if (cur) out.push(cur);
			cur = {
				t: b.t,
				o: b.o,
				h: b.h,
				l: b.l,
				c: b.c,
				v: b.v
			};
			bucket = k;
		}
	}
	if (cur) out.push(cur);
	return out;
}
function fmtVol(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const a = Math.abs(n);
	if (a >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
	if (a >= 1e5) return (n / 1e5).toFixed(2) + " L";
	if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
	return n.toFixed(0);
}
function retFrom(bars, days) {
	if (bars.length < 2) return null;
	const last = bars[bars.length - 1];
	const cut = last.t - days * 86400;
	let first = null;
	for (const b of bars) if (b.t <= cut) first = b;
	if (!first) {
		if (last.t - bars[0].t < days * 86400 * .7) return null;
		first = bars[0];
	}
	return first.c ? (last.c / first.c - 1) * 100 : null;
}
function volAvg(bars, n = 20) {
	if (!bars.length) return 0;
	const src = bars.slice(-n);
	return src.reduce((s, b) => s + (b.v || 0), 0) / src.length;
}
function lastRsi(bars, n = 14) {
	return lastNum(rsi(bars.map((b) => b.c), n));
}
function lastMacdHist(bars) {
	return lastNum(macd(bars.map((b) => b.c)).hist);
}
function lastBbPos(bars) {
	const bb = bollinger(bars.map((b) => b.c), 20, 2);
	const last = bars.at(-1);
	const up = lastNum(bb.upper);
	const lo = lastNum(bb.lower);
	if (!last || up == null || lo == null || up === lo) return null;
	return (last.c - lo) / (up - lo) * 100;
}
var IST$1 = 19800;
function istParts$1(t) {
	const d = /* @__PURE__ */ new Date((t + IST$1) * 1e3);
	return {
		day: d.toISOString().slice(0, 10),
		minutes: d.getUTCHours() * 60 + d.getUTCMinutes()
	};
}
function sessionOpeningRange(bars, minutes = 15) {
	if (!bars.length) return null;
	const lastDay = istParts$1(bars[bars.length - 1].t).day;
	const openMin = 555;
	const endMin = openMin + minutes;
	let high = -Infinity;
	let low = Infinity;
	let n = 0;
	for (const b of bars) {
		const p = istParts$1(b.t);
		if (p.day !== lastDay) continue;
		if (p.minutes < openMin || p.minutes >= endMin) continue;
		if (b.h > high) high = b.h;
		if (b.l < low) low = b.l;
		n += 1;
	}
	if (!n || !Number.isFinite(high)) return null;
	return {
		high,
		low
	};
}
function priorDayRange(bars) {
	if (bars.length < 2) return null;
	const lastDay = istParts$1(bars[bars.length - 1].t).day;
	let day = "";
	let high = -Infinity;
	let low = Infinity;
	for (let i = bars.length - 1; i >= 0; i--) {
		const d = istParts$1(bars[i].t).day;
		if (d === lastDay) continue;
		if (!day) day = d;
		if (d !== day) break;
		if (bars[i].h > high) high = bars[i].h;
		if (bars[i].l < low) low = bars[i].l;
	}
	if (!day || !Number.isFinite(high)) return null;
	return {
		high,
		low
	};
}
function chartStructure(bars) {
	const recent = nameSwings(swings(bars, bars.length > 180 ? 5 : 3)).slice(-8);
	const clusters = clusterPrices(recent.map((s) => ({
		price: s.price,
		label: s.label
	})), .8).filter((c) => c.n >= 1);
	const weekNamed = nameSwings(swings(resample(bars, 604800), 2));
	const mtf = clusterPrices([...clusters.map((c) => ({
		price: c.price,
		label: "D"
	})), ...weekNamed.map((s) => ({
		price: s.price,
		label: "W-" + s.label
	}))], 1.1).filter((c) => c.labels.some((l) => l.startsWith("W-")) && c.labels.some((l) => l === "D" || !l.startsWith("W-")));
	const last = bars.at(-1)?.c || 0;
	return {
		named: recent,
		clusters,
		mtf,
		support: clusters.filter((c) => c.price <= last).slice(0, 4),
		resistance: clusters.filter((c) => c.price >= last).slice(0, 4),
		marks: [...recent.slice(-6).map((s) => ({
			id: `sw-${s.t}-${s.label}`,
			kind: "swing",
			price: s.price,
			t: s.t,
			label: s.label,
			tone: s.kind === "H" ? "down" : "up"
		})), ...clusters.slice(0, 4).map((c, i) => ({
			id: `sr-${i}-${c.price.toFixed(2)}`,
			kind: "sr",
			price: c.price,
			label: c.n >= 2 ? `S/R ${c.n}` : c.price >= last ? "R" : "S",
			tone: c.price >= last ? "down" : "up"
		}))],
		rsi: lastRsi(bars)
	};
}
/** Daily bars: prior high broken, then a pullback to that level that still holds. */
function detectRetest(bars) {
	if (!bars || bars.length < 80) return {
		hit: false,
		level: null,
		ath: false
	};
	let ath = 0;
	let athI = 0;
	const cut = bars.length - 20;
	for (let i = 0; i < cut; i++) if (bars[i].h > ath) {
		ath = bars[i].h;
		athI = i;
	}
	if (!(ath > 0)) return {
		hit: false,
		level: null,
		ath: false
	};
	let broke = -1;
	for (let i = athI + 2; i < bars.length - 3; i++) if (bars[i].c > ath * 1.002) {
		broke = i;
		break;
	}
	if (broke < 0) return {
		hit: false,
		level: ath,
		ath: false
	};
	let retested = false;
	for (let i = broke + 1; i < bars.length; i++) if (bars[i].l <= ath * 1.03 && bars[i].l >= ath * .94) retested = true;
	const held = bars[bars.length - 1].c >= ath * .97;
	const nearAth = athI < bars.length * .35;
	return {
		hit: retested && held,
		level: ath,
		ath: nearAth
	};
}
var IST$2 = 19800;
function quoteStatus(input) {
	if (!(Number(input.price) > 0)) return "off";
	if (input.session) return "session";
	return "last";
}
function quoteStatusLabel(status, delayMin) {
	if (status === "session") {
		if (delayMin === 0) return "SESSION · LIVE";
		return "SESSION · DELAYED";
	}
	if (status === "last") return "LAST AVAILABLE";
	return "UNAVAILABLE";
}
/**
* Yahoo chart `exchangeDataDelayedBy`. 0 = live. Small numbers are minutes.
* Values above 180 are seconds (15 minutes is often 900). Missing stays null.
*/
function delayMinutesFromMeta(raw) {
	if (raw == null || raw === "") return null;
	const n = Number(raw);
	if (!Number.isFinite(n) || n < 0) return null;
	if (n === 0) return 0;
	if (n > 180) return Math.round(n / 60);
	return Math.round(n);
}
/** Quotes are delayed. Do not describe this feed as live. */
var MARKET_PROVIDER = {
	id: "yahoo",
	name: "Yahoo Finance",
	delay: "delayed",
	note: "Delayed print. Not a licensed live Indian feed."
};
/** 3m and 4H are resampled from 1m / 60m. That is not inventing prices. */
var TERM_INTERVALS = [
	{
		id: "1m",
		label: "1m",
		yahoo: "1m",
		range: "5d",
		intra: true,
		resample: 0,
		bucketSec: 60
	},
	{
		id: "3m",
		label: "3m",
		yahoo: "1m",
		range: "5d",
		intra: true,
		resample: 180,
		bucketSec: 180
	},
	{
		id: "5m",
		label: "5m",
		yahoo: "5m",
		range: "5d",
		intra: true,
		resample: 0,
		bucketSec: 300
	},
	{
		id: "15m",
		label: "15m",
		yahoo: "15m",
		range: "1mo",
		intra: true,
		resample: 0,
		bucketSec: 900
	},
	{
		id: "30m",
		label: "30m",
		yahoo: "30m",
		range: "1mo",
		intra: true,
		resample: 0,
		bucketSec: 1800
	},
	{
		id: "1H",
		label: "1H",
		yahoo: "60m",
		range: "3mo",
		intra: true,
		resample: 0,
		bucketSec: 3600
	},
	{
		id: "4H",
		label: "4H",
		yahoo: "60m",
		range: "6mo",
		intra: true,
		resample: 14400,
		bucketSec: 14400
	},
	{
		id: "D",
		label: "D",
		yahoo: "1d",
		range: "2y",
		intra: false,
		resample: 0,
		bucketSec: 86400
	},
	{
		id: "W",
		label: "W",
		yahoo: "1wk",
		range: "5y",
		intra: false,
		resample: 0,
		bucketSec: 604800
	},
	{
		id: "M",
		label: "M",
		yahoo: "1mo",
		range: "max",
		intra: false,
		resample: 0,
		bucketSec: 2592e3
	}
];
function termFetchSpec(id) {
	return TERM_INTERVALS.find((x) => x.id === id) || TERM_INTERVALS[7];
}
function termBars(bars, spec) {
	if (spec.resample > 0) return resample(bars, spec.resample);
	return bars;
}
function istParts(tSec) {
	const d = /* @__PURE__ */ new Date((tSec + IST$2) * 1e3);
	return {
		y: d.getUTCFullYear(),
		m: d.getUTCMonth(),
		day: d.getUTCDate(),
		wd: d.getUTCDay()
	};
}
function istDayStart(tSec) {
	const { y, m, day } = istParts(tSec);
	return Date.UTC(y, m, day) / 1e3 - IST$2;
}
function istWeekStart(tSec) {
	const { y, m, day, wd } = istParts(tSec);
	const iso = wd === 0 ? 6 : wd - 1;
	return Date.UTC(y, m, day - iso) / 1e3 - IST$2;
}
function istMonthStart(tSec) {
	const { y, m } = istParts(tSec);
	return Date.UTC(y, m, 1) / 1e3 - IST$2;
}
function barBucket(tSec, spec) {
	if (spec.id === "D") return istDayStart(tSec);
	if (spec.id === "W") return istWeekStart(tSec);
	if (spec.id === "M") return istMonthStart(tSec);
	return Math.floor(tSec / spec.bucketSec) * spec.bucketSec;
}
/**
* Stamp the forming candle with the latest quote. Same bucket → patch H/L/C.
* New bucket → append a bar. Does not invent volume. Leaves history untouched.
*/
function patchLastBar(bars, quote, spec, nowSec) {
	const px = Number(quote.price);
	if (!(px > 0) || !bars.length) return bars;
	const tSec = quote.retrievedAt && quote.retrievedAt > 0 ? quote.retrievedAt / 1e3 : nowSec ?? Date.now() / 1e3;
	const last = bars[bars.length - 1];
	const lastB = barBucket(last.t, spec);
	const nowB = barBucket(tSec, spec);
	if (nowB <= lastB) {
		const h = Math.max(last.h, px);
		const l = Math.min(last.l, px);
		if (last.c === px && last.h === h && last.l === l) return bars;
		const next = bars.slice();
		next[next.length - 1] = {
			...last,
			h,
			l,
			c: px
		};
		return next;
	}
	return [...bars, {
		t: nowB,
		o: px,
		h: px,
		l: px,
		c: px,
		v: 0
	}];
}
function moveWatchSymbols(symbols, fromIdx, toIdx) {
	if (fromIdx === toIdx) return symbols;
	if (fromIdx < 0 || toIdx < 0 || fromIdx >= symbols.length || toIdx >= symbols.length) return symbols;
	const next = symbols.slice();
	const [row] = next.splice(fromIdx, 1);
	next.splice(toIdx, 0, row);
	return next;
}
function quoteMap(quotes) {
	const map = /* @__PURE__ */ new Map();
	if (!quotes) return map;
	for (const q of quotes) {
		const a = String(q.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
		const b = String(q.input || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
		if (a) map.set(a, q);
		if (b) map.set(b, q);
	}
	return map;
}
/** Fixed Terminal chart heights. No freeform drag — that fights trackpad scroll. */
var TERM_HEIGHT = {
	compact: 420,
	standard: 560,
	tall: 720
};
var CHOICES = [
	TERM_HEIGHT.compact,
	TERM_HEIGHT.standard,
	TERM_HEIGHT.tall
];
function snapTermHeight(n) {
	const v = Number(n);
	if (!Number.isFinite(v)) return TERM_HEIGHT.standard;
	return CHOICES.reduce((best, x) => Math.abs(x - v) < Math.abs(best - v) ? x : best);
}
function termHeightName(n) {
	const h = snapTermHeight(n);
	if (h === TERM_HEIGHT.compact) return "compact";
	if (h === TERM_HEIGHT.tall) return "tall";
	return "standard";
}
/** One way to open a market instrument. Indices go to Terminal via the URL so a late store reload cannot overwrite the request. */
var INDEX_SYMBOLS = new Set(Object.values(BENCH$1).map((b) => b.symbol.toUpperCase()));
function instrumentKind(symbol) {
	const s = String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
	if (s === "GOLD" || s === "SILVER") return "commodity";
	if (s.startsWith("^") || INDEX_SYMBOLS.has(s)) return "index";
	return "stock";
}
function terminalSearch(symbol, name) {
	const symbolOut = String(symbol || "").trim();
	const nameOut = String(name || "").trim();
	return {
		view: "terminal",
		symbol: symbolOut,
		...nameOut ? { name: nameOut } : {}
	};
}
/** Holdings today is a movement table. Value and weight are not sort keys. */
function cleanHoldSort(sort) {
	if (!sort) return null;
	const key = sort.key;
	const dir = sort.dir;
	if (key !== "name" && key !== "last" && key !== "chg" && key !== "chgPct") return null;
	if (dir !== "asc" && dir !== "desc") return null;
	return {
		key,
		dir
	};
}
var DB_NAME = "kosh-path";
var STORE = "books";
function openDb() {
	return new Promise((resolve, reject) => {
		if (typeof indexedDB === "undefined") {
			reject(/* @__PURE__ */ new Error("This browser cannot store a large trade book."));
			return;
		}
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error || /* @__PURE__ */ new Error("Could not open the trade book."));
	});
}
/** Durable Path trades. A failed write must not delete the previous book. */
async function saveTradeBook(id, trades) {
	if (!id || id === "sample") return;
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error || /* @__PURE__ */ new Error("Could not save the trade book."));
		tx.onabort = () => reject(tx.error || /* @__PURE__ */ new Error("Could not save the trade book."));
		tx.objectStore(STORE).put({
			id,
			trades
		});
	});
	db.close();
}
async function loadTradeBooks() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => reject(req.error || /* @__PURE__ */ new Error("Could not read the trade book."));
	});
	db.close();
	const out = {};
	for (const row of rows) if (row?.id && Array.isArray(row.trades)) out[row.id] = row.trades;
	return out;
}
var ICON_IDS = [
	"k-path",
	"bowl",
	"twin",
	"ledger",
	"coin",
	"fold"
];
var DEFAULT_INDS = {
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
	vp: false
};
var DEFAULT_CHART_PREFS = {
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
	drawOpen: true,
	chartMode: "price",
	chartBench: "nifty",
	chartHeight: 580,
	termHeight: 520,
	rev: 5
};
var DEFAULT_NAV_PREFS = {
	style: "area",
	fill: true,
	smaOn: false,
	showBench: true
};
function uid() {
	return Math.random().toString(36).slice(2, 10);
}
function bareSymbol(s) {
	return String(s || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
}
function drawKey(symbol, interval) {
	return `${bareSymbol(symbol)}:${interval || "1D"}`;
}
function newDrawId() {
	return uid();
}
function migrateDrawings(raw) {
	const out = {};
	for (const [k, v] of Object.entries(raw || {})) {
		if (!v?.length) continue;
		if (k.includes(":")) out[k] = v;
		else out[`${bareSymbol(k)}:1D`] = v;
	}
	return out;
}
var DEFAULT_PANES = [
	{
		symbol: "RELIANCE",
		name: "Reliance Industries",
		interval: "D"
	},
	{
		symbol: "^NSEI",
		name: "Nifty 50",
		interval: "D"
	},
	{
		symbol: "TCS",
		name: "Tata Consultancy",
		interval: "D"
	},
	{
		symbol: "HDFCBANK",
		name: "HDFC Bank",
		interval: "D"
	}
];
var DEFAULT_DESK = {
	layout: 1,
	panes: DEFAULT_PANES,
	syncTf: false,
	intelTab: "overview",
	activePane: 0,
	style: "candle"
};
var TERM_IDS = new Set(TERM_INTERVALS.map((x) => x.id));
function clampPaneIndex(n) {
	if (n === 1 || n === 2 || n === 3) return n;
	return 0;
}
function sanitizePane(raw, fallback) {
	const symbol = bareSymbol(raw?.symbol || "") || fallback.symbol;
	const interval = raw?.interval && TERM_IDS.has(raw.interval) ? raw.interval : fallback.interval;
	return {
		symbol,
		name: String(raw?.name || fallback.name).slice(0, 80),
		interval
	};
}
function sanitizeDesk(raw) {
	const panes = [
		sanitizePane(raw?.panes?.[0], DEFAULT_PANES[0]),
		sanitizePane(raw?.panes?.[1], DEFAULT_PANES[1]),
		sanitizePane(raw?.panes?.[2], DEFAULT_PANES[2]),
		sanitizePane(raw?.panes?.[3], DEFAULT_PANES[3])
	];
	return {
		layout: raw?.layout === 2 || raw?.layout === 4 ? raw.layout : 1,
		panes,
		syncTf: Boolean(raw?.syncTf),
		intelTab: String(raw?.intelTab || "overview").slice(0, 24),
		activePane: clampPaneIndex(Number(raw?.activePane) || 0),
		style: raw?.style === "line" ? "line" : "candle"
	};
}
function isWatched(symbol, list) {
	const n = bareSymbol(symbol);
	return list.some((x) => bareSymbol(x) === n);
}
function defaultWatchlists(symbols = []) {
	return [
		{
			id: "main",
			name: "Main",
			symbols: symbols.map(bareSymbol).filter(Boolean)
		},
		{
			id: "trade",
			name: "Trade",
			symbols: []
		},
		{
			id: "long",
			name: "Long-term",
			symbols: []
		}
	];
}
function withDefaultLists(lists, watch = []) {
	if (!lists.length) return defaultWatchlists(watch);
	if (lists.length >= 2) return lists;
	const haveId = new Set(lists.map((l) => l.id));
	const haveName = new Set(lists.map((l) => l.name.toLowerCase()));
	const extras = defaultWatchlists().filter((d) => d.id !== "main" && !haveId.has(d.id) && !haveName.has(d.name.toLowerCase()));
	return extras.length ? [...lists, ...extras] : lists;
}
function bookFrom(s) {
	return {
		aliases: s.symbolAliases || {},
		skips: s.symbolSkips || []
	};
}
function saveBook(id, trades) {
	saveTradeBook(id, trades).catch(() => {
		useKosh.setState({ tradeError: "The trade book could not be saved. It is still open and the previous save was not wiped." });
	});
}
var useKosh = create()(persist((set, get) => ({
	portfolios: [samplePortfolio()],
	iconId: "k-path",
	theme: "dark",
	watch: [],
	watchlists: defaultWatchlists(),
	activeWatchId: "main",
	desk: DEFAULT_DESK,
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
	chartPrefs: {
		...DEFAULT_CHART_PREFS,
		inds: { ...DEFAULT_INDS }
	},
	navPrefs: { ...DEFAULT_NAV_PREFS },
	watchSorts: {},
	overviewHoldSort: null,
	overviewWatchSorts: {},
	deepFunds: {},
	symbolAliases: {},
	symbolSkips: [],
	cloudDrops: emptyDrops(),
	tradeCounts: {},
	tradeError: null,
	tradesReady: false,
	hydrate: (ports) => {
		if (ports.length) set({ portfolios: ports.map((p) => ({
			...p,
			holdings: sanitizeHoldings(p.holdings || [], bookFrom(get())),
			trades: sanitizeTrades(p.trades)
		})) });
	},
	setIconId: (iconId) => set({ iconId }),
	setTheme: (theme) => set({ theme }),
	addPortfolio: (name, holdings = [], bench = "nifty", trades = []) => {
		const id = uid();
		set({ portfolios: [{
			id,
			name: name || "Main",
			holdings: sanitizeHoldings(holdings, bookFrom(get())),
			bench,
			includeCommodities: true,
			trades: sanitizeTrades(trades)
		}, ...get().portfolios] });
		return id;
	},
	renamePortfolio: (id, name) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		name
	} : p) }),
	duplicatePortfolio: (id) => {
		const p = get().portfolios.find((x) => x.id === id);
		if (!p) return null;
		return get().addPortfolio(`${p.name} copy`, p.holdings, p.bench, p.trades);
	},
	deletePortfolio: (id) => {
		const at = Date.now();
		set({
			portfolios: get().portfolios.filter((p) => p.id !== id),
			cloudDrops: withPortfolioDrop(get().cloudDrops, id, at)
		});
	},
	setBench: (id, bench) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		bench
	} : p) }),
	setIncludeCommodities: (id, on) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		includeCommodities: on
	} : p) }),
	addHoldings: (id, incoming) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		holdings: mergeHoldings(p.holdings, sanitizeHoldings(incoming, bookFrom(get()))),
		updatedAt: Date.now()
	} : p) }),
	fillHoldings: (id, incoming, opts) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		holdings: fillHoldings(sanitizeHoldings(p.holdings, bookFrom(get())), incoming, opts),
		updatedAt: Date.now()
	} : p) }),
	upsertHoldings: (id, incoming) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		holdings: upsertHoldings(sanitizeHoldings(p.holdings, bookFrom(get())), incoming),
		updatedAt: Date.now()
	} : p) }),
	updateHolding: (id, symbol, patch) => set({ portfolios: get().portfolios.map((p) => p.id === id ? {
		...p,
		updatedAt: Date.now(),
		holdings: p.holdings.map((h) => h.symbol === symbol ? applyHoldingPatch({
			...h,
			updatedAt: Date.now()
		}, patch) : h)
	} : p) }),
	removeHolding: (id, symbol) => {
		const at = Date.now();
		set({
			cloudDrops: withHoldingDrop(get().cloudDrops, {
				portfolioId: id,
				symbol,
				at
			}),
			portfolios: get().portfolios.map((p) => p.id === id ? {
				...p,
				updatedAt: at,
				holdings: p.holdings.filter((h) => h.symbol !== symbol)
			} : p)
		});
	},
	replaceHoldings: (id, holdings) => {
		const prev = get().portfolios.find((p) => p.id === id);
		const nextSyms = new Set((holdings || []).map((h) => h.symbol));
		const at = Date.now();
		let drops = get().cloudDrops;
		for (const h of prev?.holdings || []) if (!nextSyms.has(h.symbol)) drops = withHoldingDrop(drops, {
			portfolioId: id,
			symbol: h.symbol,
			at
		});
		set({
			cloudDrops: drops,
			portfolios: get().portfolios.map((p) => p.id === id ? {
				...p,
				holdings,
				updatedAt: at
			} : p)
		});
	},
	setTrades: (id, trades) => {
		const prev = get().portfolios.find((p) => p.id === id);
		const next = sanitizeTrades(trades);
		const nextKeys = new Set(next.map((t) => tradeIdentity(t)));
		const at = Date.now();
		const removed = (prev?.trades || []).map((t) => tradeIdentity(t)).filter((key) => !nextKeys.has(key)).map((key) => ({
			portfolioId: id,
			key,
			at
		}));
		set({
			tradeError: null,
			tradeCounts: {
				...get().tradeCounts,
				[id]: next.length
			},
			cloudDrops: removed.length ? withTradeDrops(get().cloudDrops, removed) : get().cloudDrops,
			portfolios: get().portfolios.map((p) => p.id === id ? {
				...p,
				trades: next,
				updatedAt: at
			} : p)
		});
		saveBook(id, next);
	},
	mergeTrades: (id, trades) => {
		const portfolios = get().portfolios.map((p) => p.id === id ? {
			...p,
			trades: mergeTradeLines(p.trades || [], sanitizeTrades(trades)),
			updatedAt: Date.now()
		} : p);
		const next = portfolios.find((p) => p.id === id)?.trades || [];
		set({
			portfolios,
			tradeError: null,
			tradeCounts: {
				...get().tradeCounts,
				[id]: next.length
			}
		});
		saveBook(id, next);
	},
	rememberPathFacts: (id, facts) => {
		if (!id || !facts?.length) return;
		set({ portfolios: get().portfolios.map((p) => {
			if (p.id !== id) return p;
			const map = new Map((p.pathFacts || []).map((f) => [`${f.symbol}|${f.date}`, f]));
			for (const f of facts) {
				if (!f?.date || !(f.price > 0) || !/^https?:\/\//i.test(f.sourceUrl || "")) continue;
				map.set(`${f.symbol}|${f.date}`, f);
			}
			return {
				...p,
				pathFacts: [...map.values()].slice(0, 400),
				updatedAt: Date.now()
			};
		}) });
	},
	setDeepFund: (symbol, snap) => set({ deepFunds: {
		...get().deepFunds,
		[bareSymbol(symbol)]: snap
	} }),
	setDeepFunds: (rows) => set({ deepFunds: {
		...get().deepFunds,
		...rows
	} }),
	applyCloud: (doc) => {
		const lists = withDefaultLists(doc.watchlists?.length ? doc.watchlists : get().watchlists, get().watch);
		const activeWatchId = lists.some((l) => l.id === doc.activeWatchId) ? doc.activeWatchId : lists[0].id;
		const watch = (lists.find((l) => l.id === activeWatchId) || lists[0]).symbols;
		const portfolios = doc.portfolios?.length ? doc.portfolios.map((p) => ({
			...p,
			holdings: sanitizeHoldings(p.holdings || [], bookFrom(doc)),
			trades: sanitizeTrades(p.trades)
		})) : get().portfolios;
		const tradeCounts = { ...get().tradeCounts };
		for (const p of portfolios) tradeCounts[p.id] = Math.max(tradeCounts[p.id] || 0, p.trades?.length || 0);
		set({
			portfolios,
			tradeCounts,
			symbolAliases: doc.symbolAliases || get().symbolAliases,
			symbolSkips: doc.symbolSkips || get().symbolSkips,
			watchlists: lists,
			activeWatchId,
			watch,
			customScreens: doc.customScreens || get().customScreens,
			desk: doc.desk ? sanitizeDesk(doc.desk) : get().desk,
			chartPrefs: {
				...get().chartPrefs,
				...doc.chartPrefs,
				termHeight: snapTermHeight(doc.chartPrefs?.termHeight ?? get().chartPrefs.termHeight),
				inds: get().chartPrefs.inds
			},
			alerts: doc.alerts || get().alerts,
			journal: doc.journal || get().journal,
			bookNotes: doc.bookNotes || get().bookNotes,
			deepFunds: doc.deepFunds || get().deepFunds,
			cloudDrops: doc.drops || get().cloudDrops || emptyDrops()
		});
		const incoming = portfolios.filter((p) => p.id !== "sample");
		(async () => {
			try {
				const books = await loadTradeBooks();
				const merged = incoming.map((p) => {
					const trades = applyDrops({
						...p,
						trades: unionCloudTrades(books[p.id], p.trades)
					}, useKosh.getState().cloudDrops).trades;
					return trades?.length || p.trades?.length ? {
						...p,
						trades: trades || []
					} : p;
				});
				if (merged.some((p, i) => (p.trades?.length || 0) !== (incoming[i]?.trades?.length || 0))) useKosh.setState((s) => ({
					portfolios: s.portfolios.map((p) => merged.find((m) => m.id === p.id) || p),
					tradeCounts: {
						...s.tradeCounts,
						...Object.fromEntries(merged.map((p) => [p.id, p.trades?.length || s.tradeCounts[p.id] || 0]))
					}
				}));
				for (const p of merged) if (p.trades?.length) await saveTradeBook(p.id, p.trades);
			} catch {
				useKosh.setState({ tradeError: "The trade book could not be saved. It is still open and the previous save was not wiped." });
			}
		})();
	},
	toggleWatch: (symbol) => {
		const n = bareSymbol(symbol);
		const id = get().activeWatchId;
		const next = (get().watchlists.length ? get().watchlists : defaultWatchlists(get().watch)).map((l) => {
			if (l.id !== id) return l;
			const cur = l.symbols.map(bareSymbol);
			return {
				...l,
				symbols: cur.includes(n) ? cur.filter((x) => x !== n) : [n, ...cur].slice(0, 80)
			};
		});
		const active = next.find((l) => l.id === id) || next[0];
		set({
			watchlists: next,
			watch: active?.symbols || [],
			activeWatchId: active?.id || id
		});
	},
	addWatchList: (name) => {
		const id = uid();
		const lists = get().watchlists.length ? get().watchlists : defaultWatchlists(get().watch);
		const row = {
			id,
			name: (name || "List").slice(0, 32),
			symbols: []
		};
		set({
			watchlists: [...lists, row].slice(0, 12),
			activeWatchId: id,
			watch: []
		});
		return id;
	},
	renameWatchList: (id, name) => set({ watchlists: get().watchlists.map((l) => l.id === id ? {
		...l,
		name: name.slice(0, 32)
	} : l) }),
	deleteWatchList: (id) => {
		const lists = get().watchlists.filter((l) => l.id !== id);
		const next = lists.length ? lists : defaultWatchlists();
		const active = next.find((l) => l.id === get().activeWatchId) || next[0];
		set({
			watchlists: next,
			activeWatchId: active.id,
			watch: active.symbols
		});
	},
	setActiveWatchId: (id) => {
		const active = get().watchlists.find((l) => l.id === id);
		if (!active) return;
		set({
			activeWatchId: id,
			watch: active.symbols
		});
	},
	moveWatch: (fromIdx, toIdx) => {
		const id = get().activeWatchId;
		const next = get().watchlists.map((l) => l.id === id ? {
			...l,
			symbols: moveWatchSymbols(l.symbols, fromIdx, toIdx)
		} : l);
		set({
			watchlists: next,
			watch: next.find((l) => l.id === id)?.symbols || []
		});
	},
	setDesk: (d) => set({ desk: sanitizeDesk(d) }),
	patchDesk: (p) => set({ desk: sanitizeDesk({
		...get().desk,
		...p,
		panes: p.panes || get().desk.panes
	}) }),
	setDeskSymbol: (symbol, name) => {
		const n = bareSymbol(symbol);
		if (!n) return;
		const desk = get().desk;
		const i = desk.activePane;
		const panes = desk.panes.map((pane, idx) => idx === i ? {
			...pane,
			symbol: n,
			name: name || pane.name
		} : pane);
		set({ desk: {
			...desk,
			panes
		} });
	},
	setDeskPane: (index, patch) => {
		const desk = get().desk;
		const i = clampPaneIndex(index);
		const panes = desk.panes.map((pane, idx) => idx === i ? sanitizePane({
			...pane,
			...patch
		}, pane) : pane);
		let next = {
			...desk,
			panes,
			activePane: i
		};
		if (desk.syncTf && patch.interval) next = {
			...next,
			panes: panes.map((pane) => ({
				...pane,
				interval: patch.interval
			}))
		};
		set({ desk: sanitizeDesk(next) });
	},
	pushRecent: (r) => {
		const n = bareSymbol(r.symbol);
		const rest = get().recents.filter((x) => bareSymbol(x.symbol) !== n);
		set({ recents: [{
			symbol: n,
			name: r.name
		}, ...rest].slice(0, 12) });
	},
	addAlert: (a) => set({ alerts: [{
		...a,
		id: uid(),
		symbol: bareSymbol(a.symbol),
		kind: a.kind || "price"
	}, ...get().alerts].slice(0, 40) }),
	removeAlert: (id) => set({ alerts: (get().alerts || []).filter((x) => x.id !== id) }),
	addJournal: (e) => set({ journal: [{
		id: uid(),
		symbol: bareSymbol(e.symbol),
		note: String(e.note || "").slice(0, 400),
		setup: String(e.setup || "").slice(0, 80),
		price: Number(e.price) || 0,
		at: e.at || Date.now()
	}, ...get().journal].slice(0, 80) }),
	removeJournal: (id) => set({ journal: (get().journal || []).filter((x) => x.id !== id) }),
	setDrawings: (symbol, shapes) => set({ drawings: {
		...get().drawings,
		[symbol.includes(":") ? symbol : drawKey(symbol, "1D")]: shapes.slice(0, 80)
	} }),
	saveCustomScreen: (f) => set({ customScreens: [f, ...get().customScreens.filter((x) => x.name !== f.name)].slice(0, 20) }),
	removeCustomScreen: (name) => set({ customScreens: get().customScreens.filter((x) => x.name !== name) }),
	setSkillRead: (r) => set({ skillReads: {
		...get().skillReads,
		[bareSymbol(r.symbol)]: r
	} }),
	setSkillReads: (rows) => set({ skillReads: {
		...get().skillReads,
		...Object.fromEntries(rows.map((r) => [bareSymbol(r.symbol), r]))
	} }),
	setBookNote: (portfolioId, note) => set({ bookNotes: {
		...get().bookNotes,
		[portfolioId]: note
	} }),
	setImproveRun: (improveRun) => set({ improveRun }),
	setQualitySeed: (names) => set({ qualitySeed: names.map(bareSymbol).filter(Boolean).slice(0, 6) }),
	setTourDone: (tourDone) => set({ tourDone }),
	patchChartPrefs: (p) => set((s) => ({ chartPrefs: {
		...s.chartPrefs,
		...p,
		inds: p.inds ? {
			...s.chartPrefs.inds,
			...p.inds
		} : s.chartPrefs.inds,
		chartHeight: Math.max(360, Math.min(900, p.chartHeight ?? s.chartPrefs.chartHeight ?? 580)),
		termHeight: snapTermHeight(p.termHeight ?? s.chartPrefs.termHeight ?? 560),
		chartBench: p.chartBench ? p.chartBench : s.chartPrefs.chartBench
	} })),
	patchNavPrefs: (p) => set((s) => ({ navPrefs: {
		...s.navPrefs,
		...p
	} })),
	setWatchSort: (id, sort) => set((s) => {
		const next = { ...s.watchSorts };
		if (!sort) delete next[id];
		else next[id] = sort;
		return { watchSorts: next };
	}),
	setOverviewHoldSort: (sort) => set({ overviewHoldSort: sort }),
	setOverviewWatchSort: (id, sort) => set((s) => {
		const next = { ...s.overviewWatchSorts };
		if (!sort) delete next[id];
		else next[id] = sort;
		return { overviewWatchSorts: next };
	}),
	confirmSymbol: (from, to, name) => {
		const target = storedSymbol(to);
		const source = storedSymbol(from);
		if (!target || !source) return;
		const aliases = {
			...get().symbolAliases,
			[source]: target,
			[baseSym(source)]: target
		};
		const portfolios = get().portfolios.map((p) => ({
			...p,
			updatedAt: Date.now(),
			holdings: p.holdings.map((h) => h.symbol === source || baseSym(h.symbol) === baseSym(source) ? {
				...h,
				symbol: target,
				name: name || h.name,
				updatedAt: Date.now()
			} : h),
			trades: (p.trades || []).map((t) => t.symbol === source || baseSym(t.symbol) === baseSym(source) ? {
				...t,
				symbol: target,
				name: name || t.name
			} : t)
		}));
		set({
			symbolAliases: aliases,
			symbolSkips: get().symbolSkips.filter((s) => s !== source && s !== baseSym(source)),
			portfolios
		});
		for (const p of portfolios) saveBook(p.id, p.trades || []);
	},
	skipSymbol: (symbol) => {
		const key = storedSymbol(symbol);
		if (!key || get().symbolSkips.includes(key)) return;
		set({ symbolSkips: [...get().symbolSkips, key] });
	}
}), {
	name: "kosh-v2",
	partialize: (state) => {
		const { tradeError: _tradeError, tradesReady: _tradesReady, ...rest } = state;
		return {
			...rest,
			portfolios: state.portfolios.map((p) => ({
				...p,
				trades: []
			}))
		};
	},
	onRehydrateStorage: () => (state) => {
		const seeded = state?.portfolios || [];
		(async () => {
			try {
				const books = await loadTradeBooks();
				for (const p of seeded) if (p.id !== "sample" && p.trades?.length && !books[p.id]?.length) await saveTradeBook(p.id, p.trades);
				const again = await loadTradeBooks();
				useKosh.setState((s) => ({
					tradesReady: true,
					tradeError: null,
					portfolios: s.portfolios.map((p) => {
						const extra = again[p.id];
						if (!extra?.length) return p;
						if (p.trades?.length) return p;
						return {
							...p,
							trades: sanitizeTrades(extra)
						};
					}),
					tradeCounts: {
						...s.tradeCounts,
						...Object.fromEntries(Object.entries(again).map(([id, rows]) => [id, rows.length]))
					}
				}));
			} catch {
				useKosh.setState({
					tradesReady: true,
					tradeError: "Could not read the saved trade book. Nothing was cleared."
				});
			}
		})();
	},
	merge: (persisted, current) => {
		const p = persisted || {};
		const watchlists = withDefaultLists(p.watchlists && p.watchlists.length ? p.watchlists : defaultWatchlists(p.watch || []), p.watch || []);
		const activeWatchId = p.activeWatchId && watchlists.some((l) => l.id === p.activeWatchId) ? p.activeWatchId : watchlists[0].id;
		const watch = (watchlists.find((l) => l.id === activeWatchId) || watchlists[0]).symbols;
		return {
			...current,
			...p,
			theme: p.theme === "light" ? "light" : "dark",
			watch,
			watchlists,
			activeWatchId,
			desk: sanitizeDesk(p.desk),
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
				const old = p.chartPrefs || {};
				const migrated = (old.rev ?? 0) >= 3;
				return {
					...DEFAULT_CHART_PREFS,
					...old,
					inds: {
						...DEFAULT_INDS,
						...old.inds || {}
					},
					logScale: migrated ? Boolean(old.logScale) : true,
					showLevels: old.showLevels === true,
					magnet: old.magnet === true,
					structOn: old.structOn === true,
					patternsOn: old.patternsOn === true,
					drawOpen: old.drawOpen !== false,
					chartMode: old.chartMode === "bench" || old.chartMode === "usd" ? old.chartMode : "price",
					chartBench: old.chartBench || "nifty",
					chartHeight: Math.max(360, Math.min(900, old.chartHeight || 580)),
					termHeight: snapTermHeight(old.termHeight || 560),
					rev: 5
				};
			})(),
			navPrefs: {
				...DEFAULT_NAV_PREFS,
				...p.navPrefs || {}
			},
			watchSorts: p.watchSorts || {},
			overviewHoldSort: cleanHoldSort(p.overviewHoldSort),
			overviewWatchSorts: p.overviewWatchSorts || {},
			deepFunds: p.deepFunds || {},
			symbolAliases: p.symbolAliases || {},
			symbolSkips: p.symbolSkips || [],
			cloudDrops: p.cloudDrops || emptyDrops(),
			tradeCounts: p.tradeCounts || {},
			tradeError: null,
			tradesReady: false,
			portfolios: (p.portfolios?.length ? p.portfolios : current.portfolios).map((port) => ({
				...port,
				holdings: sanitizeHoldings(port.holdings || [], {
					aliases: p.symbolAliases || {},
					skips: p.symbolSkips || []
				}),
				trades: sanitizeTrades(port.trades?.length ? port.trades : port.id === "sample" ? SAMPLE_TRADES : [])
			}))
		};
	}
}));
function usePortfolio(id) {
	return useKosh((s) => s.portfolios.find((p) => p.id === id));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/button-CSWqOBwS.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "bg-transparent text-muted hover:text-fg hover:bg-surface",
			danger: "bg-down/15 text-down hover:bg-down/25"
		},
		size: {
			default: "h-10 px-3.5",
			sm: "h-8 px-2.5 text-[13px]",
			lg: "h-11 px-4",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/universe-DHW93x99.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Nifty 500 constituents. Screener universe. Auto-generated 2026-08-31. Do not hand-edit. */
var NIFTY500 = [
	{
		symbol: "360ONE",
		name: "360 ONE WAM Ltd."
	},
	{
		symbol: "3MINDIA",
		name: "3M India Ltd."
	},
	{
		symbol: "ABB",
		name: "ABB India Ltd."
	},
	{
		symbol: "ACC",
		name: "ACC Ltd."
	},
	{
		symbol: "ACMESOLAR",
		name: "ACME Solar Holdings Ltd."
	},
	{
		symbol: "AIAENG",
		name: "AIA Engineering Ltd."
	},
	{
		symbol: "APLAPOLLO",
		name: "APL Apollo Tubes Ltd."
	},
	{
		symbol: "AUBANK",
		name: "AU Small Finance Bank Ltd."
	},
	{
		symbol: "AWL",
		name: "AWL Agri Business Ltd."
	},
	{
		symbol: "AADHARHFC",
		name: "Aadhar Housing Finance Ltd."
	},
	{
		symbol: "AARTIIND",
		name: "Aarti Industries Ltd."
	},
	{
		symbol: "AAVAS",
		name: "Aavas Financiers Ltd."
	},
	{
		symbol: "ABBOTINDIA",
		name: "Abbott India Ltd."
	},
	{
		symbol: "ACE",
		name: "Action Construction Equipment Ltd."
	},
	{
		symbol: "ACUTAAS",
		name: "Acutaas Chemicals Ltd."
	},
	{
		symbol: "ADANIENSOL",
		name: "Adani Energy Solutions Ltd."
	},
	{
		symbol: "ADANIENT",
		name: "Adani Enterprises Ltd."
	},
	{
		symbol: "ADANIGREEN",
		name: "Adani Green Energy Ltd."
	},
	{
		symbol: "ADANIPORTS",
		name: "Adani Ports and Special Economic Zone Ltd."
	},
	{
		symbol: "ADANIPOWER",
		name: "Adani Power Ltd."
	},
	{
		symbol: "ATGL",
		name: "Adani Total Gas Ltd."
	},
	{
		symbol: "ABCAPITAL",
		name: "Aditya Birla Capital Ltd."
	},
	{
		symbol: "ABFRL",
		name: "Aditya Birla Fashion and Retail Ltd."
	},
	{
		symbol: "ABLBL",
		name: "Aditya Birla Lifestyle Brands Ltd."
	},
	{
		symbol: "ABREL",
		name: "Aditya Birla Real Estate Ltd."
	},
	{
		symbol: "ABSLAMC",
		name: "Aditya Birla Sun Life AMC Ltd."
	},
	{
		symbol: "CPPLUS",
		name: "Aditya Infotech Ltd."
	},
	{
		symbol: "AEGISLOG",
		name: "Aegis Logistics Ltd."
	},
	{
		symbol: "AEGISVOPAK",
		name: "Aegis Vopak Terminals Ltd."
	},
	{
		symbol: "AFCONS",
		name: "Afcons Infrastructure Ltd."
	},
	{
		symbol: "AFFLE",
		name: "Affle 3i Ltd."
	},
	{
		symbol: "AJANTPHARM",
		name: "Ajanta Pharmaceuticals Ltd."
	},
	{
		symbol: "ALKEM",
		name: "Alkem Laboratories Ltd."
	},
	{
		symbol: "ABDL",
		name: "Allied Blenders and Distillers Ltd."
	},
	{
		symbol: "ARE&M",
		name: "Amara Raja Energy & Mobility Ltd."
	},
	{
		symbol: "AMBER",
		name: "Amber Enterprises India Ltd."
	},
	{
		symbol: "AMBUJACEM",
		name: "Ambuja Cements Ltd."
	},
	{
		symbol: "ANANDRATHI",
		name: "Anand Rathi Wealth Ltd."
	},
	{
		symbol: "ANANTRAJ",
		name: "Anant Raj Ltd."
	},
	{
		symbol: "ANGELONE",
		name: "Angel One Ltd."
	},
	{
		symbol: "ANTHEM",
		name: "Anthem Biosciences Ltd."
	},
	{
		symbol: "ANURAS",
		name: "Anupam Rasayan India Ltd."
	},
	{
		symbol: "APARINDS",
		name: "Apar Industries Ltd."
	},
	{
		symbol: "APOLLOHOSP",
		name: "Apollo Hospitals Enterprise Ltd."
	},
	{
		symbol: "APOLLOTYRE",
		name: "Apollo Tyres Ltd."
	},
	{
		symbol: "APTUS",
		name: "Aptus Value Housing Finance India Ltd."
	},
	{
		symbol: "ASAHIINDIA",
		name: "Asahi India Glass Ltd."
	},
	{
		symbol: "ASHOKLEY",
		name: "Ashok Leyland Ltd."
	},
	{
		symbol: "ASIANPAINT",
		name: "Asian Paints Ltd."
	},
	{
		symbol: "ASTERDM",
		name: "Aster DM Quality Care Ltd."
	},
	{
		symbol: "ASTRAL",
		name: "Astral Ltd."
	},
	{
		symbol: "ATHERENERG",
		name: "Ather Energy Ltd."
	},
	{
		symbol: "ATUL",
		name: "Atul Ltd."
	},
	{
		symbol: "AUROPHARMA",
		name: "Aurobindo Pharma Ltd."
	},
	{
		symbol: "AIIL",
		name: "Authum Investment & Infrastructure Ltd."
	},
	{
		symbol: "DMART",
		name: "Avenue Supermarts Ltd."
	},
	{
		symbol: "AXISBANK",
		name: "Axis Bank Ltd."
	},
	{
		symbol: "BEML",
		name: "BEML Ltd."
	},
	{
		symbol: "BLS",
		name: "BLS International Services Ltd."
	},
	{
		symbol: "BSE",
		name: "BSE Ltd."
	},
	{
		symbol: "BAJAJ-AUTO",
		name: "Bajaj Auto Ltd."
	},
	{
		symbol: "BAJFINANCE",
		name: "Bajaj Finance Ltd."
	},
	{
		symbol: "BAJAJFINSV",
		name: "Bajaj Finserv Ltd."
	},
	{
		symbol: "BAJAJHLDNG",
		name: "Bajaj Holdings & Investment Ltd."
	},
	{
		symbol: "BAJAJHFL",
		name: "Bajaj Housing Finance Ltd."
	},
	{
		symbol: "BALKRISIND",
		name: "Balkrishna Industries Ltd."
	},
	{
		symbol: "BALRAMCHIN",
		name: "Balrampur Chini Mills Ltd."
	},
	{
		symbol: "BANDHANBNK",
		name: "Bandhan Bank Ltd."
	},
	{
		symbol: "BANKBARODA",
		name: "Bank of Baroda"
	},
	{
		symbol: "BANKINDIA",
		name: "Bank of India"
	},
	{
		symbol: "MAHABANK",
		name: "Bank of Maharashtra"
	},
	{
		symbol: "BATAINDIA",
		name: "Bata India Ltd."
	},
	{
		symbol: "BAYERCROP",
		name: "Bayer Cropscience Ltd."
	},
	{
		symbol: "BELRISE",
		name: "Belrise Industries Ltd."
	},
	{
		symbol: "BERGEPAINT",
		name: "Berger Paints India Ltd."
	},
	{
		symbol: "BDL",
		name: "Bharat Dynamics Ltd."
	},
	{
		symbol: "BEL",
		name: "Bharat Electronics Ltd."
	},
	{
		symbol: "BHARATFORG",
		name: "Bharat Forge Ltd."
	},
	{
		symbol: "BHEL",
		name: "Bharat Heavy Electricals Ltd."
	},
	{
		symbol: "BPCL",
		name: "Bharat Petroleum Corporation Ltd."
	},
	{
		symbol: "BHARTIARTL",
		name: "Bharti Airtel Ltd."
	},
	{
		symbol: "BHARTIHEXA",
		name: "Bharti Hexacom Ltd."
	},
	{
		symbol: "BIKAJI",
		name: "Bikaji Foods International Ltd."
	},
	{
		symbol: "GROWW",
		name: "Billionbrains Garage Ventures Ltd."
	},
	{
		symbol: "BIOCON",
		name: "Biocon Ltd."
	},
	{
		symbol: "BSOFT",
		name: "Birlasoft Ltd."
	},
	{
		symbol: "BLUEDART",
		name: "Blue Dart Express Ltd."
	},
	{
		symbol: "BLUEJET",
		name: "Blue Jet Healthcare Ltd."
	},
	{
		symbol: "BLUESTARCO",
		name: "Blue Star Ltd."
	},
	{
		symbol: "BBTC",
		name: "Bombay Burmah Trading Corporation Ltd."
	},
	{
		symbol: "BOSCHLTD",
		name: "Bosch Ltd."
	},
	{
		symbol: "FIRSTCRY",
		name: "Brainbees Solutions Ltd."
	},
	{
		symbol: "BRIGADE",
		name: "Brigade Enterprises Ltd."
	},
	{
		symbol: "BRITANNIA",
		name: "Britannia Industries Ltd."
	},
	{
		symbol: "MAPMYINDIA",
		name: "C.E. Info Systems Ltd."
	},
	{
		symbol: "CCL",
		name: "CCL Products (I) Ltd."
	},
	{
		symbol: "CESC",
		name: "CESC Ltd."
	},
	{
		symbol: "CGPOWER",
		name: "CG Power and Industrial Solutions Ltd."
	},
	{
		symbol: "CIEINDIA",
		name: "CIE Automotive India Ltd."
	},
	{
		symbol: "CRISIL",
		name: "CRISIL Ltd."
	},
	{
		symbol: "CANFINHOME",
		name: "Can Fin Homes Ltd."
	},
	{
		symbol: "CANBK",
		name: "Canara Bank"
	},
	{
		symbol: "CANHLIFE",
		name: "Canara HSBC Life Insurance Company Ltd."
	},
	{
		symbol: "CAPLIPOINT",
		name: "Caplin Point Laboratories Ltd."
	},
	{
		symbol: "CGCL",
		name: "Capri Global Capital Ltd."
	},
	{
		symbol: "CARBORUNIV",
		name: "Carborundum Universal Ltd."
	},
	{
		symbol: "CARTRADE",
		name: "Cartrade Tech Ltd."
	},
	{
		symbol: "CASTROLIND",
		name: "Castrol India Ltd."
	},
	{
		symbol: "CEATLTD",
		name: "Ceat Ltd."
	},
	{
		symbol: "CEMPRO",
		name: "Cemindia Projects Ltd."
	},
	{
		symbol: "CENTRALBK",
		name: "Central Bank of India"
	},
	{
		symbol: "CDSL",
		name: "Central Depository Services (India) Ltd."
	},
	{
		symbol: "CHALET",
		name: "Chalet Hotels Ltd."
	},
	{
		symbol: "CHAMBLFERT",
		name: "Chambal Fertilizers & Chemicals Ltd."
	},
	{
		symbol: "CHENNPETRO",
		name: "Chennai Petroleum Corporation Ltd."
	},
	{
		symbol: "CHOICEIN",
		name: "Choice International Ltd."
	},
	{
		symbol: "CHOLAHLDNG",
		name: "Cholamandalam Financial Holdings Ltd."
	},
	{
		symbol: "CHOLAFIN",
		name: "Cholamandalam Investment and Finance Company Ltd."
	},
	{
		symbol: "CIPLA",
		name: "Cipla Ltd."
	},
	{
		symbol: "CUB",
		name: "City Union Bank Ltd."
	},
	{
		symbol: "CLEAN",
		name: "Clean Science and Technology Ltd."
	},
	{
		symbol: "COALINDIA",
		name: "Coal India Ltd."
	},
	{
		symbol: "COCHINSHIP",
		name: "Cochin Shipyard Ltd."
	},
	{
		symbol: "COFORGE",
		name: "Coforge Ltd."
	},
	{
		symbol: "COHANCE",
		name: "Cohance Lifesciences Ltd."
	},
	{
		symbol: "COLPAL",
		name: "Colgate Palmolive (India) Ltd."
	},
	{
		symbol: "CAMS",
		name: "Computer Age Management Services Ltd."
	},
	{
		symbol: "CONCORDBIO",
		name: "Concord Biotech Ltd."
	},
	{
		symbol: "CONCOR",
		name: "Container Corporation of India Ltd."
	},
	{
		symbol: "COROMANDEL",
		name: "Coromandel International Ltd."
	},
	{
		symbol: "CRAFTSMAN",
		name: "Craftsman Automation Ltd."
	},
	{
		symbol: "CREDITACC",
		name: "CreditAccess Grameen Ltd."
	},
	{
		symbol: "CROMPTON",
		name: "Crompton Greaves Consumer Electricals Ltd."
	},
	{
		symbol: "CUMMINSIND",
		name: "Cummins India Ltd."
	},
	{
		symbol: "CYIENT",
		name: "Cyient Ltd."
	},
	{
		symbol: "DCMSHRIRAM",
		name: "DCM Shriram Ltd."
	},
	{
		symbol: "DLF",
		name: "DLF Ltd."
	},
	{
		symbol: "DOMS",
		name: "DOMS Industries Ltd."
	},
	{
		symbol: "DABUR",
		name: "Dabur India Ltd."
	},
	{
		symbol: "DALBHARAT",
		name: "Dalmia Bharat Ltd."
	},
	{
		symbol: "DATAPATTNS",
		name: "Data Patterns (India) Ltd."
	},
	{
		symbol: "DEEPAKFERT",
		name: "Deepak Fertilisers & Petrochemicals Corp. Ltd."
	},
	{
		symbol: "DEEPAKNTR",
		name: "Deepak Nitrite Ltd."
	},
	{
		symbol: "DELHIVERY",
		name: "Delhivery Ltd."
	},
	{
		symbol: "DEVYANI",
		name: "Devyani International Ltd."
	},
	{
		symbol: "DIVISLAB",
		name: "Divi's Laboratories Ltd."
	},
	{
		symbol: "DIXON",
		name: "Dixon Technologies (India) Ltd."
	},
	{
		symbol: "LALPATHLAB",
		name: "Dr. Lal Path Labs Ltd."
	},
	{
		symbol: "DRREDDY",
		name: "Dr. Reddy's Laboratories Ltd."
	},
	{
		symbol: "EIDPARRY",
		name: "E.I.D. Parry (India) Ltd."
	},
	{
		symbol: "EIHOTEL",
		name: "EIH Ltd."
	},
	{
		symbol: "EICHERMOT",
		name: "Eicher Motors Ltd."
	},
	{
		symbol: "ELECON",
		name: "Elecon Engineering Co. Ltd."
	},
	{
		symbol: "ELGIEQUIP",
		name: "Elgi Equipments Ltd."
	},
	{
		symbol: "EMAMILTD",
		name: "Emami Ltd."
	},
	{
		symbol: "EMCURE",
		name: "Emcure Pharmaceuticals Ltd."
	},
	{
		symbol: "EMMVEE",
		name: "Emmvee Photovoltaic Power Ltd."
	},
	{
		symbol: "ENDURANCE",
		name: "Endurance Technologies Ltd."
	},
	{
		symbol: "ENGINERSIN",
		name: "Engineers India Ltd."
	},
	{
		symbol: "ERIS",
		name: "Eris Lifesciences Ltd."
	},
	{
		symbol: "ESCORTS",
		name: "Escorts Kubota Ltd."
	},
	{
		symbol: "ETERNAL",
		name: "Eternal Ltd."
	},
	{
		symbol: "EXIDEIND",
		name: "Exide Industries Ltd."
	},
	{
		symbol: "NYKAA",
		name: "FSN E-Commerce Ventures Ltd."
	},
	{
		symbol: "FEDERALBNK",
		name: "Federal Bank Ltd."
	},
	{
		symbol: "FACT",
		name: "Fertilisers and Chemicals Travancore Ltd."
	},
	{
		symbol: "FINCABLES",
		name: "Finolex Cables Ltd."
	},
	{
		symbol: "FSL",
		name: "Firstsource Solutions Ltd."
	},
	{
		symbol: "FIVESTAR",
		name: "Five-Star Business Finance Ltd."
	},
	{
		symbol: "FORCEMOT",
		name: "Force Motors Ltd."
	},
	{
		symbol: "FORTIS",
		name: "Fortis Healthcare Ltd."
	},
	{
		symbol: "GAIL",
		name: "GAIL (India) Ltd."
	},
	{
		symbol: "GVT&D",
		name: "GE Vernova T&D India Ltd."
	},
	{
		symbol: "GMRAIRPORT",
		name: "GMR Airports Ltd."
	},
	{
		symbol: "GABRIEL",
		name: "Gabriel India Ltd."
	},
	{
		symbol: "GALLANTT",
		name: "Gallantt Ispat Ltd."
	},
	{
		symbol: "GRSE",
		name: "Garden Reach Shipbuilders & Engineers Ltd."
	},
	{
		symbol: "GICRE",
		name: "General Insurance Corporation of India"
	},
	{
		symbol: "GILLETTE",
		name: "Gillette India Ltd."
	},
	{
		symbol: "GLAND",
		name: "Gland Pharma Ltd."
	},
	{
		symbol: "GLAXO",
		name: "Glaxosmithkline Pharmaceuticals Ltd."
	},
	{
		symbol: "GLENMARK",
		name: "Glenmark Pharmaceuticals Ltd."
	},
	{
		symbol: "MEDANTA",
		name: "Global Health Ltd."
	},
	{
		symbol: "GODIGIT",
		name: "Go Digit General Insurance Ltd."
	},
	{
		symbol: "GPIL",
		name: "Godawari Power & Ispat Ltd."
	},
	{
		symbol: "GODFRYPHLP",
		name: "Godfrey Phillips India Ltd."
	},
	{
		symbol: "GODREJCP",
		name: "Godrej Consumer Products Ltd."
	},
	{
		symbol: "GODREJIND",
		name: "Godrej Industries Ltd."
	},
	{
		symbol: "GODREJPROP",
		name: "Godrej Properties Ltd."
	},
	{
		symbol: "GRANULES",
		name: "Granules India Ltd."
	},
	{
		symbol: "GRAPHITE",
		name: "Graphite India Ltd."
	},
	{
		symbol: "GRASIM",
		name: "Grasim Industries Ltd."
	},
	{
		symbol: "GRAVITA",
		name: "Gravita India Ltd."
	},
	{
		symbol: "GESHIP",
		name: "Great Eastern Shipping Co. Ltd."
	},
	{
		symbol: "FLUOROCHEM",
		name: "Gujarat Fluorochemicals Ltd."
	},
	{
		symbol: "GMDCLTD",
		name: "Gujarat Mineral Development Corporation Ltd."
	},
	{
		symbol: "HEG",
		name: "H.E.G. Ltd."
	},
	{
		symbol: "HBLENGINE",
		name: "HBL Engineering Ltd."
	},
	{
		symbol: "HCLTECH",
		name: "HCL Technologies Ltd."
	},
	{
		symbol: "HDBFS",
		name: "HDB Financial Services Ltd."
	},
	{
		symbol: "HDFCAMC",
		name: "HDFC Asset Management Company Ltd."
	},
	{
		symbol: "HDFCBANK",
		name: "HDFC Bank Ltd."
	},
	{
		symbol: "HDFCLIFE",
		name: "HDFC Life Insurance Company Ltd."
	},
	{
		symbol: "HFCL",
		name: "HFCL Ltd."
	},
	{
		symbol: "HAVELLS",
		name: "Havells India Ltd."
	},
	{
		symbol: "HEROMOTOCO",
		name: "Hero MotoCorp Ltd."
	},
	{
		symbol: "HEXT",
		name: "Hexaware Technologies Ltd."
	},
	{
		symbol: "HSCL",
		name: "Himadri Speciality Chemical Ltd."
	},
	{
		symbol: "HINDALCO",
		name: "Hindalco Industries Ltd."
	},
	{
		symbol: "HAL",
		name: "Hindustan Aeronautics Ltd."
	},
	{
		symbol: "HINDCOPPER",
		name: "Hindustan Copper Ltd."
	},
	{
		symbol: "HINDPETRO",
		name: "Hindustan Petroleum Corporation Ltd."
	},
	{
		symbol: "HINDUNILVR",
		name: "Hindustan Unilever Ltd."
	},
	{
		symbol: "HINDZINC",
		name: "Hindustan Zinc Ltd."
	},
	{
		symbol: "POWERINDIA",
		name: "Hitachi Energy India Ltd."
	},
	{
		symbol: "HOMEFIRST",
		name: "Home First Finance Company India Ltd."
	},
	{
		symbol: "HONASA",
		name: "Honasa Consumer Ltd."
	},
	{
		symbol: "HONAUT",
		name: "Honeywell Automation India Ltd."
	},
	{
		symbol: "HUDCO",
		name: "Housing & Urban Development Corporation Ltd."
	},
	{
		symbol: "HYUNDAI",
		name: "Hyundai Motor India Ltd."
	},
	{
		symbol: "ICICIBANK",
		name: "ICICI Bank Ltd."
	},
	{
		symbol: "ICICIGI",
		name: "ICICI Lombard General Insurance Company Ltd."
	},
	{
		symbol: "ICICIAMC",
		name: "ICICI Prudential Asset Management Company Ltd."
	},
	{
		symbol: "ICICIPRULI",
		name: "ICICI Prudential Life Insurance Company Ltd."
	},
	{
		symbol: "IDBI",
		name: "IDBI Bank Ltd."
	},
	{
		symbol: "IDFCFIRSTB",
		name: "IDFC First Bank Ltd."
	},
	{
		symbol: "IFCI",
		name: "IFCI Ltd."
	},
	{
		symbol: "IIFL",
		name: "IIFL Finance Ltd."
	},
	{
		symbol: "IRB",
		name: "IRB Infrastructure Developers Ltd."
	},
	{
		symbol: "IRCON",
		name: "IRCON International Ltd."
	},
	{
		symbol: "ITCHOTELS",
		name: "ITC Hotels Ltd."
	},
	{
		symbol: "ITC",
		name: "ITC Ltd."
	},
	{
		symbol: "ITI",
		name: "ITI Ltd."
	},
	{
		symbol: "INDGN",
		name: "Indegene Ltd."
	},
	{
		symbol: "INDIACEM",
		name: "India Cements Ltd."
	},
	{
		symbol: "INDIAMART",
		name: "Indiamart Intermesh Ltd."
	},
	{
		symbol: "INDIANB",
		name: "Indian Bank"
	},
	{
		symbol: "IEX",
		name: "Indian Energy Exchange Ltd."
	},
	{
		symbol: "INDHOTEL",
		name: "Indian Hotels Co. Ltd."
	},
	{
		symbol: "IOC",
		name: "Indian Oil Corporation Ltd."
	},
	{
		symbol: "IOB",
		name: "Indian Overseas Bank"
	},
	{
		symbol: "IRCTC",
		name: "Indian Railway Catering And Tourism Corporation Ltd."
	},
	{
		symbol: "IRFC",
		name: "Indian Railway Finance Corporation Ltd."
	},
	{
		symbol: "IREDA",
		name: "Indian Renewable Energy Development Agency Ltd."
	},
	{
		symbol: "IGL",
		name: "Indraprastha Gas Ltd."
	},
	{
		symbol: "INDUSTOWER",
		name: "Indus Towers Ltd."
	},
	{
		symbol: "INDUSINDBK",
		name: "IndusInd Bank Ltd."
	},
	{
		symbol: "NAUKRI",
		name: "Info Edge (India) Ltd."
	},
	{
		symbol: "INFY",
		name: "Infosys Ltd."
	},
	{
		symbol: "INOXWIND",
		name: "Inox Wind Ltd."
	},
	{
		symbol: "INTELLECT",
		name: "Intellect Design Arena Ltd."
	},
	{
		symbol: "INDIGO",
		name: "InterGlobe Aviation Ltd."
	},
	{
		symbol: "IGIL",
		name: "International Gemological Institute Ltd."
	},
	{
		symbol: "IKS",
		name: "Inventurus Knowledge Solutions Ltd."
	},
	{
		symbol: "IPCALAB",
		name: "Ipca Laboratories Ltd."
	},
	{
		symbol: "JKCEMENT",
		name: "J.K. Cement Ltd."
	},
	{
		symbol: "JBMA",
		name: "JBM Auto Ltd."
	},
	{
		symbol: "JKTYRE",
		name: "JK Tyre & Industries Ltd."
	},
	{
		symbol: "JMFINANCIL",
		name: "JM Financial Ltd."
	},
	{
		symbol: "JSWCEMENT",
		name: "JSW Cement Ltd."
	},
	{
		symbol: "JSWDULUX",
		name: "JSW Dulux Ltd."
	},
	{
		symbol: "JSWENERGY",
		name: "JSW Energy Ltd."
	},
	{
		symbol: "JSWINFRA",
		name: "JSW Infrastructure Ltd."
	},
	{
		symbol: "JSWSTEEL",
		name: "JSW Steel Ltd."
	},
	{
		symbol: "JAINREC",
		name: "Jain Resource Recycling Ltd."
	},
	{
		symbol: "JPPOWER",
		name: "Jaiprakash Power Ventures Ltd."
	},
	{
		symbol: "J&KBANK",
		name: "Jammu & Kashmir Bank Ltd."
	},
	{
		symbol: "JINDALSAW",
		name: "Jindal Saw Ltd."
	},
	{
		symbol: "JSL",
		name: "Jindal Stainless Ltd."
	},
	{
		symbol: "JINDALSTEL",
		name: "Jindal Steel Ltd."
	},
	{
		symbol: "JIOFIN",
		name: "Jio Financial Services Ltd."
	},
	{
		symbol: "JUBLFOOD",
		name: "Jubilant Foodworks Ltd."
	},
	{
		symbol: "JUBLINGREA",
		name: "Jubilant Ingrevia Ltd."
	},
	{
		symbol: "JUBLPHARMA",
		name: "Jubilant Pharmova Ltd."
	},
	{
		symbol: "JWL",
		name: "Jupiter Wagons Ltd."
	},
	{
		symbol: "JYOTICNC",
		name: "Jyoti CNC Automation Ltd."
	},
	{
		symbol: "KPRMILL",
		name: "K.P.R. Mill Ltd."
	},
	{
		symbol: "KEI",
		name: "KEI Industries Ltd."
	},
	{
		symbol: "KPITTECH",
		name: "KPIT Technologies Ltd."
	},
	{
		symbol: "KAJARIACER",
		name: "Kajaria Ceramics Ltd."
	},
	{
		symbol: "KPIL",
		name: "Kalpataru Projects International Ltd."
	},
	{
		symbol: "KALYANKJIL",
		name: "Kalyan Jewellers India Ltd."
	},
	{
		symbol: "KARURVYSYA",
		name: "Karur Vysya Bank Ltd."
	},
	{
		symbol: "KAYNES",
		name: "Kaynes Technology India Ltd."
	},
	{
		symbol: "KEC",
		name: "Kec International Ltd."
	},
	{
		symbol: "KFINTECH",
		name: "Kfin Technologies Ltd."
	},
	{
		symbol: "KIRLOSENG",
		name: "Kirloskar Oil Eng Ltd."
	},
	{
		symbol: "KOTAKBANK",
		name: "Kotak Mahindra Bank Ltd."
	},
	{
		symbol: "KIMS",
		name: "Krishna Institute of Medical Sciences Ltd."
	},
	{
		symbol: "LTF",
		name: "L&T Finance Ltd."
	},
	{
		symbol: "LTTS",
		name: "L&T Technology Services Ltd."
	},
	{
		symbol: "LGEINDIA",
		name: "LG Electronics India Ltd."
	},
	{
		symbol: "LICHSGFIN",
		name: "LIC Housing Finance Ltd."
	},
	{
		symbol: "LTFOODS",
		name: "LT Foods Ltd."
	},
	{
		symbol: "LTM",
		name: "LTM Ltd."
	},
	{
		symbol: "LT",
		name: "Larsen & Toubro Ltd."
	},
	{
		symbol: "LATENTVIEW",
		name: "Latent View Analytics Ltd."
	},
	{
		symbol: "LAURUSLABS",
		name: "Laurus Labs Ltd."
	},
	{
		symbol: "THELEELA",
		name: "Leela Palaces Hotels & Resorts Ltd."
	},
	{
		symbol: "LEMONTREE",
		name: "Lemon Tree Hotels Ltd."
	},
	{
		symbol: "LENSKART",
		name: "Lenskart Solutions Ltd."
	},
	{
		symbol: "LICI",
		name: "Life Insurance Corporation of India"
	},
	{
		symbol: "LINDEINDIA",
		name: "Linde India Ltd."
	},
	{
		symbol: "LLOYDSME",
		name: "Lloyds Metals And Energy Ltd."
	},
	{
		symbol: "LODHA",
		name: "Lodha Developers Ltd."
	},
	{
		symbol: "LUPIN",
		name: "Lupin Ltd."
	},
	{
		symbol: "MMTC",
		name: "MMTC Ltd."
	},
	{
		symbol: "MRF",
		name: "MRF Ltd."
	},
	{
		symbol: "MGL",
		name: "Mahanagar Gas Ltd."
	},
	{
		symbol: "M&MFIN",
		name: "Mahindra & Mahindra Financial Services Ltd."
	},
	{
		symbol: "M&M",
		name: "Mahindra & Mahindra Ltd."
	},
	{
		symbol: "MANAPPURAM",
		name: "Manappuram Finance Ltd."
	},
	{
		symbol: "MRPL",
		name: "Mangalore Refinery & Petrochemicals Ltd."
	},
	{
		symbol: "MANKIND",
		name: "Mankind Pharma Ltd."
	},
	{
		symbol: "MARICO",
		name: "Marico Ltd."
	},
	{
		symbol: "MARUTI",
		name: "Maruti Suzuki India Ltd."
	},
	{
		symbol: "MFSL",
		name: "Max Financial Services Ltd."
	},
	{
		symbol: "MAXHEALTH",
		name: "Max Healthcare Institute Ltd."
	},
	{
		symbol: "MAZDOCK",
		name: "Mazagoan Dock Shipbuilders Ltd."
	},
	{
		symbol: "MEESHO",
		name: "Meesho Ltd."
	},
	{
		symbol: "MINDACORP",
		name: "Minda Corporation Ltd."
	},
	{
		symbol: "MSUMI",
		name: "Motherson Sumi Wiring India Ltd."
	},
	{
		symbol: "MOTILALOFS",
		name: "Motilal Oswal Financial Services Ltd."
	},
	{
		symbol: "MPHASIS",
		name: "MphasiS Ltd."
	},
	{
		symbol: "MCX",
		name: "Multi Commodity Exchange of India Ltd."
	},
	{
		symbol: "MUTHOOTFIN",
		name: "Muthoot Finance Ltd."
	},
	{
		symbol: "NATCOPHARM",
		name: "NATCO Pharma Ltd."
	},
	{
		symbol: "NBCC",
		name: "NBCC (India) Ltd."
	},
	{
		symbol: "NCC",
		name: "NCC Ltd."
	},
	{
		symbol: "NHPC",
		name: "NHPC Ltd."
	},
	{
		symbol: "NLCINDIA",
		name: "NLC India Ltd."
	},
	{
		symbol: "NMDC",
		name: "NMDC Ltd."
	},
	{
		symbol: "NSLNISP",
		name: "NMDC Steel Ltd."
	},
	{
		symbol: "NTPCGREEN",
		name: "NTPC Green Energy Ltd."
	},
	{
		symbol: "NTPC",
		name: "NTPC Ltd."
	},
	{
		symbol: "NH",
		name: "Narayana Hrudayalaya Ltd."
	},
	{
		symbol: "NATIONALUM",
		name: "National Aluminium Co. Ltd."
	},
	{
		symbol: "NAVA",
		name: "Nava Ltd."
	},
	{
		symbol: "NAVINFLUOR",
		name: "Navin Fluorine International Ltd."
	},
	{
		symbol: "NESTLEIND",
		name: "Nestle India Ltd."
	},
	{
		symbol: "NETWEB",
		name: "Netweb Technologies India Ltd."
	},
	{
		symbol: "NEULANDLAB",
		name: "Neuland Laboratories Ltd."
	},
	{
		symbol: "NEWGEN",
		name: "Newgen Software Technologies Ltd."
	},
	{
		symbol: "NAM-INDIA",
		name: "Nippon Life India Asset Management Ltd."
	},
	{
		symbol: "NIVABUPA",
		name: "Niva Bupa Health Insurance Company Ltd."
	},
	{
		symbol: "NUVAMA",
		name: "Nuvama Wealth Management Ltd."
	},
	{
		symbol: "NUVOCO",
		name: "Nuvoco Vistas Corporation Ltd."
	},
	{
		symbol: "OBEROIRLTY",
		name: "Oberoi Realty Ltd."
	},
	{
		symbol: "ONGC",
		name: "Oil & Natural Gas Corporation Ltd."
	},
	{
		symbol: "OIL",
		name: "Oil India Ltd."
	},
	{
		symbol: "OLAELEC",
		name: "Ola Electric Mobility Ltd."
	},
	{
		symbol: "OLECTRA",
		name: "Olectra Greentech Ltd."
	},
	{
		symbol: "PAYTM",
		name: "One 97 Communications Ltd."
	},
	{
		symbol: "ONESOURCE",
		name: "Onesource Specialty Pharma Ltd."
	},
	{
		symbol: "OFSS",
		name: "Oracle Financial Services Software Ltd."
	},
	{
		symbol: "POLICYBZR",
		name: "PB Fintech Ltd."
	},
	{
		symbol: "PCBL",
		name: "PCBL Chemical Ltd."
	},
	{
		symbol: "PGEL",
		name: "PG Electroplast Ltd."
	},
	{
		symbol: "PIIND",
		name: "PI Industries Ltd."
	},
	{
		symbol: "PNBHOUSING",
		name: "PNB Housing Finance Ltd."
	},
	{
		symbol: "PTCIL",
		name: "PTC Industries Ltd."
	},
	{
		symbol: "PVRINOX",
		name: "PVR INOX Ltd."
	},
	{
		symbol: "PAGEIND",
		name: "Page Industries Ltd."
	},
	{
		symbol: "PARADEEP",
		name: "Paradeep Phosphates Ltd."
	},
	{
		symbol: "PATANJALI",
		name: "Patanjali Foods Ltd."
	},
	{
		symbol: "PERSISTENT",
		name: "Persistent Systems Ltd."
	},
	{
		symbol: "PETRONET",
		name: "Petronet LNG Ltd."
	},
	{
		symbol: "PFIZER",
		name: "Pfizer Ltd."
	},
	{
		symbol: "PHOENIXLTD",
		name: "Phoenix Mills Ltd."
	},
	{
		symbol: "PWL",
		name: "Physicswallah Ltd."
	},
	{
		symbol: "PIDILITIND",
		name: "Pidilite Industries Ltd."
	},
	{
		symbol: "PINELABS",
		name: "Pine Labs Ltd."
	},
	{
		symbol: "PIRAMALFIN",
		name: "Piramal Finance Ltd."
	},
	{
		symbol: "PPLPHARMA",
		name: "Piramal Pharma Ltd."
	},
	{
		symbol: "POLYMED",
		name: "Poly Medicure Ltd."
	},
	{
		symbol: "POLYCAB",
		name: "Polycab India Ltd."
	},
	{
		symbol: "POONAWALLA",
		name: "Poonawalla Fincorp Ltd."
	},
	{
		symbol: "PFC",
		name: "Power Finance Corporation Ltd."
	},
	{
		symbol: "POWERGRID",
		name: "Power Grid Corporation of India Ltd."
	},
	{
		symbol: "PREMIERENE",
		name: "Premier Energies Ltd."
	},
	{
		symbol: "PRESTIGE",
		name: "Prestige Estates Projects Ltd."
	},
	{
		symbol: "PFOCUS",
		name: "Prime Focus Ltd."
	},
	{
		symbol: "PNB",
		name: "Punjab National Bank"
	},
	{
		symbol: "RRKABEL",
		name: "R R Kabel Ltd."
	},
	{
		symbol: "RBLBANK",
		name: "RBL Bank Ltd."
	},
	{
		symbol: "RECLTD",
		name: "REC Ltd."
	},
	{
		symbol: "RHIM",
		name: "RHI MAGNESITA INDIA LTD."
	},
	{
		symbol: "RITES",
		name: "RITES Ltd."
	},
	{
		symbol: "RADICO",
		name: "Radico Khaitan Ltd"
	},
	{
		symbol: "RVNL",
		name: "Rail Vikas Nigam Ltd."
	},
	{
		symbol: "RAILTEL",
		name: "Railtel Corporation Of India Ltd."
	},
	{
		symbol: "RAINBOW",
		name: "Rainbow Childrens Medicare Ltd."
	},
	{
		symbol: "RKFORGE",
		name: "Ramkrishna Forgings Ltd."
	},
	{
		symbol: "REDINGTON",
		name: "Redington Ltd."
	},
	{
		symbol: "RELIANCE",
		name: "Reliance Industries Ltd."
	},
	{
		symbol: "RPOWER",
		name: "Reliance Power Ltd."
	},
	{
		symbol: "SBFC",
		name: "SBFC Finance Ltd."
	},
	{
		symbol: "SBICARD",
		name: "SBI Cards and Payment Services Ltd."
	},
	{
		symbol: "SBILIFE",
		name: "SBI Life Insurance Company Ltd."
	},
	{
		symbol: "SJVN",
		name: "SJVN Ltd."
	},
	{
		symbol: "SRF",
		name: "SRF Ltd."
	},
	{
		symbol: "SAGILITY",
		name: "Sagility Ltd."
	},
	{
		symbol: "SAILIFE",
		name: "Sai Life Sciences Ltd."
	},
	{
		symbol: "SAMMAANCAP",
		name: "Sammaan Capital Ltd."
	},
	{
		symbol: "MOTHERSON",
		name: "Samvardhana Motherson International Ltd."
	},
	{
		symbol: "SAPPHIRE",
		name: "Sapphire Foods India Ltd."
	},
	{
		symbol: "SARDAEN",
		name: "Sarda Energy and Minerals Ltd."
	},
	{
		symbol: "SAREGAMA",
		name: "Saregama India Ltd"
	},
	{
		symbol: "SCHAEFFLER",
		name: "Schaeffler India Ltd."
	},
	{
		symbol: "SCHNEIDER",
		name: "Schneider Electric Infrastructure Ltd."
	},
	{
		symbol: "SCI",
		name: "Shipping Corporation of India Ltd."
	},
	{
		symbol: "SHREECEM",
		name: "Shree Cement Ltd."
	},
	{
		symbol: "SHRIRAMFIN",
		name: "Shriram Finance Ltd."
	},
	{
		symbol: "SHYAMMETL",
		name: "Shyam Metalics and Energy Ltd."
	},
	{
		symbol: "ENRIN",
		name: "Siemens Energy India Ltd."
	},
	{
		symbol: "SIEMENS",
		name: "Siemens Ltd."
	},
	{
		symbol: "SIGNATURE",
		name: "Signatureglobal (India) Ltd."
	},
	{
		symbol: "SOBHA",
		name: "Sobha Ltd."
	},
	{
		symbol: "SOLARINDS",
		name: "Solar Industries India Ltd."
	},
	{
		symbol: "SONACOMS",
		name: "Sona BLW Precision Forgings Ltd."
	},
	{
		symbol: "SONATSOFTW",
		name: "Sonata Software Ltd."
	},
	{
		symbol: "STARHEALTH",
		name: "Star Health and Allied Insurance Company Ltd."
	},
	{
		symbol: "SBIN",
		name: "State Bank of India"
	},
	{
		symbol: "SAIL",
		name: "Steel Authority of India Ltd."
	},
	{
		symbol: "SUMICHEM",
		name: "Sumitomo Chemical India Ltd."
	},
	{
		symbol: "SUNPHARMA",
		name: "Sun Pharmaceutical Industries Ltd."
	},
	{
		symbol: "SUNTV",
		name: "Sun TV Network Ltd."
	},
	{
		symbol: "SUNDARMFIN",
		name: "Sundaram Finance Ltd."
	},
	{
		symbol: "SUPREMEIND",
		name: "Supreme Industries Ltd."
	},
	{
		symbol: "SPLPETRO",
		name: "Supreme Petrochem Ltd."
	},
	{
		symbol: "SUZLON",
		name: "Suzlon Energy Ltd."
	},
	{
		symbol: "SWANCORP",
		name: "Swan Corp Ltd."
	},
	{
		symbol: "SWIGGY",
		name: "Swiggy Ltd."
	},
	{
		symbol: "SYNGENE",
		name: "Syngene International Ltd."
	},
	{
		symbol: "SYRMA",
		name: "Syrma SGS Technology Ltd."
	},
	{
		symbol: "TBOTEK",
		name: "TBO Tek Ltd."
	},
	{
		symbol: "TVSMOTOR",
		name: "TVS Motor Company Ltd."
	},
	{
		symbol: "TATACAP",
		name: "Tata Capital Ltd."
	},
	{
		symbol: "TATACHEM",
		name: "Tata Chemicals Ltd."
	},
	{
		symbol: "TATACOMM",
		name: "Tata Communications Ltd."
	},
	{
		symbol: "TCS",
		name: "Tata Consultancy Services Ltd."
	},
	{
		symbol: "TATACONSUM",
		name: "Tata Consumer Products Ltd."
	},
	{
		symbol: "TATAELXSI",
		name: "Tata Elxsi Ltd."
	},
	{
		symbol: "TATAINVEST",
		name: "Tata Investment Corporation Ltd."
	},
	{
		symbol: "TMCV",
		name: "Tata Motors Ltd."
	},
	{
		symbol: "TMPV",
		name: "Tata Motors Passenger Vehicles Ltd."
	},
	{
		symbol: "TATAPOWER",
		name: "Tata Power Co. Ltd."
	},
	{
		symbol: "TATASTEEL",
		name: "Tata Steel Ltd."
	},
	{
		symbol: "TATATECH",
		name: "Tata Technologies Ltd."
	},
	{
		symbol: "TTML",
		name: "Tata Teleservices (Maharashtra) Ltd."
	},
	{
		symbol: "TECHM",
		name: "Tech Mahindra Ltd."
	},
	{
		symbol: "TECHNOE",
		name: "Techno Electric & Engineering Company Ltd."
	},
	{
		symbol: "TEGA",
		name: "Tega Industries Ltd."
	},
	{
		symbol: "TEJASNET",
		name: "Tejas Networks Ltd."
	},
	{
		symbol: "TENNIND",
		name: "Tenneco Clean Air India Ltd."
	},
	{
		symbol: "NIACL",
		name: "The New India Assurance Company Ltd."
	},
	{
		symbol: "RAMCOCEM",
		name: "The Ramco Cements Ltd."
	},
	{
		symbol: "THERMAX",
		name: "Thermax Ltd."
	},
	{
		symbol: "TIMKEN",
		name: "Timken India Ltd."
	},
	{
		symbol: "TITAGARH",
		name: "Titagarh Rail Systems Ltd."
	},
	{
		symbol: "TITAN",
		name: "Titan Company Ltd."
	},
	{
		symbol: "TORNTPHARM",
		name: "Torrent Pharmaceuticals Ltd."
	},
	{
		symbol: "TORNTPOWER",
		name: "Torrent Power Ltd."
	},
	{
		symbol: "TARIL",
		name: "Transformers And Rectifiers (India) Ltd."
	},
	{
		symbol: "TRAVELFOOD",
		name: "Travel Food Services Ltd."
	},
	{
		symbol: "TRENT",
		name: "Trent Ltd."
	},
	{
		symbol: "TRIDENT",
		name: "Trident Ltd."
	},
	{
		symbol: "TRITURBINE",
		name: "Triveni Turbine Ltd."
	},
	{
		symbol: "TIINDIA",
		name: "Tube Investments of India Ltd."
	},
	{
		symbol: "UCOBANK",
		name: "UCO Bank"
	},
	{
		symbol: "UNOMINDA",
		name: "UNO Minda Ltd."
	},
	{
		symbol: "UPL",
		name: "UPL Ltd."
	},
	{
		symbol: "UTIAMC",
		name: "UTI Asset Management Company Ltd."
	},
	{
		symbol: "ULTRACEMCO",
		name: "UltraTech Cement Ltd."
	},
	{
		symbol: "UNIONBANK",
		name: "Union Bank of India"
	},
	{
		symbol: "UBL",
		name: "United Breweries Ltd."
	},
	{
		symbol: "UNITDSPR",
		name: "United Spirits Ltd."
	},
	{
		symbol: "URBANCO",
		name: "Urban Company Ltd."
	},
	{
		symbol: "USHAMART",
		name: "Usha Martin Ltd."
	},
	{
		symbol: "VTL",
		name: "Vardhman Textiles Ltd."
	},
	{
		symbol: "VBL",
		name: "Varun Beverages Ltd."
	},
	{
		symbol: "VEDL",
		name: "Vedanta Ltd."
	},
	{
		symbol: "VIJAYA",
		name: "Vijaya Diagnostic Centre Ltd."
	},
	{
		symbol: "VMM",
		name: "Vishal Mega Mart Ltd."
	},
	{
		symbol: "IDEA",
		name: "Vodafone Idea Ltd."
	},
	{
		symbol: "VOLTAS",
		name: "Voltas Ltd."
	},
	{
		symbol: "WAAREEENER",
		name: "Waaree Energies Ltd."
	},
	{
		symbol: "WELCORP",
		name: "Welspun Corp Ltd."
	},
	{
		symbol: "WELSPUNLIV",
		name: "Welspun Living Ltd."
	},
	{
		symbol: "WHIRLPOOL",
		name: "Whirlpool of India Ltd."
	},
	{
		symbol: "WIPRO",
		name: "Wipro Ltd."
	},
	{
		symbol: "WOCKPHARMA",
		name: "Wockhardt Ltd."
	},
	{
		symbol: "YESBANK",
		name: "Yes Bank Ltd."
	},
	{
		symbol: "ZFCVINDIA",
		name: "ZF Commercial Vehicle Control Systems India Ltd."
	},
	{
		symbol: "ZEEL",
		name: "Zee Entertainment Enterprises Ltd."
	},
	{
		symbol: "ZENTEC",
		name: "Zen Technologies Ltd."
	},
	{
		symbol: "ZENSARTECH",
		name: "Zensar Technolgies Ltd."
	},
	{
		symbol: "ZYDUSLIFE",
		name: "Zydus Lifesciences Ltd."
	},
	{
		symbol: "ZYDUSWELL",
		name: "Zydus Wellness Ltd."
	},
	{
		symbol: "ECLERX",
		name: "eClerx Services Ltd."
	}
];
/** Every NSE EQ series name. For search and coverage. Auto-generated 2026-08-31. Do not hand-edit. */
var NSE_EQ = [
	{
		symbol: "20MICRONS",
		name: "20 Microns Limited"
	},
	{
		symbol: "21STCENMGM",
		name: "21st Century Management Services Limited"
	},
	{
		symbol: "360ONE",
		name: "360 ONE WAM LIMITED"
	},
	{
		symbol: "3BBLACKBIO",
		name: "3B Blackbio Dx Limited"
	},
	{
		symbol: "3MINDIA",
		name: "3M India Limited"
	},
	{
		symbol: "3PLAND",
		name: "3P Land Holdings Limited"
	},
	{
		symbol: "5PAISA",
		name: "5Paisa Capital Limited"
	},
	{
		symbol: "63MOONS",
		name: "63 moons technologies limited"
	},
	{
		symbol: "A2ZINFRA",
		name: "A2Z Infra Engineering Limited"
	},
	{
		symbol: "AAATECH",
		name: "AAA Technologies Limited"
	},
	{
		symbol: "AADHARHFC",
		name: "Aadhar Housing Finance Limited"
	},
	{
		symbol: "AAKASH",
		name: "Aakash Exploration Services Limited"
	},
	{
		symbol: "AAREYDRUGS",
		name: "Aarey Drugs & Pharmaceuticals Limited"
	},
	{
		symbol: "AARON",
		name: "Aaron Industries Limited"
	},
	{
		symbol: "AARTIDRUGS",
		name: "Aarti Drugs Limited"
	},
	{
		symbol: "AARTIIND",
		name: "Aarti Industries Limited"
	},
	{
		symbol: "AARTIPHARM",
		name: "Aarti Pharmalabs Limited"
	},
	{
		symbol: "AARVI",
		name: "Aarvi Encon Limited"
	},
	{
		symbol: "AASTHA",
		name: "Aastha Spintex Limited"
	},
	{
		symbol: "AAVAS",
		name: "Aavas Financiers Limited"
	},
	{
		symbol: "ABANSENT",
		name: "Abans Enterprises Limited"
	},
	{
		symbol: "ABB",
		name: "ABB India Limited"
	},
	{
		symbol: "ABBOTINDIA",
		name: "Abbott India Limited"
	},
	{
		symbol: "ABCAPITAL",
		name: "Aditya Birla Capital Limited"
	},
	{
		symbol: "ABCOTS",
		name: "A B Cotspin India Limited"
	},
	{
		symbol: "ABDL",
		name: "Allied Blenders and Distillers Limited"
	},
	{
		symbol: "ABFRL",
		name: "Aditya Birla Fashion and Retail Limited"
	},
	{
		symbol: "ABLBL",
		name: "Aditya Birla Lifestyle Brands Limited"
	},
	{
		symbol: "ABMKNO",
		name: "ABM Knowledgeware Limited"
	},
	{
		symbol: "ABREL",
		name: "Aditya Birla Real Estate Limited"
	},
	{
		symbol: "ABSLAMC",
		name: "Aditya Birla Sun Life AMC Limited"
	},
	{
		symbol: "ACC",
		name: "ACC Limited"
	},
	{
		symbol: "ACCELYA",
		name: "Accelya Solutions India Limited"
	},
	{
		symbol: "ACE",
		name: "Action Construction Equipment Limited"
	},
	{
		symbol: "ACEINTEG",
		name: "Ace Integrated Solutions Limited"
	},
	{
		symbol: "ACGL",
		name: "Automobile Corporation of Goa Limited"
	},
	{
		symbol: "ACI",
		name: "Archean Chemical Industries Limited"
	},
	{
		symbol: "ACL",
		name: "Andhra Cements Limited"
	},
	{
		symbol: "ACMESOLAR",
		name: "Acme Solar Holdings Limited"
	},
	{
		symbol: "ACUTAAS",
		name: "Acutaas Chemicals Limited"
	},
	{
		symbol: "ADANIENSOL",
		name: "Adani Energy Solutions Limited"
	},
	{
		symbol: "ADANIENT",
		name: "Adani Enterprises Limited"
	},
	{
		symbol: "ADANIGREEN",
		name: "Adani Green Energy Limited"
	},
	{
		symbol: "ADANIPORTS",
		name: "Adani Ports and Special Economic Zone Limited"
	},
	{
		symbol: "ADANIPOWER",
		name: "Adani Power Limited"
	},
	{
		symbol: "ADDIND",
		name: "Addi Industries Limited"
	},
	{
		symbol: "ADFFOODS",
		name: "ADF Foods Limited"
	},
	{
		symbol: "ADL",
		name: "Archidply Decor Limited"
	},
	{
		symbol: "ADOR",
		name: "Ador Welding Limited"
	},
	{
		symbol: "ADROITINFO",
		name: "Adroit Infotech Limited"
	},
	{
		symbol: "ADSL",
		name: "Allied Digital Services Limited"
	},
	{
		symbol: "ADVAIT",
		name: "Advait Energy Transitions Limited"
	},
	{
		symbol: "ADVANCE",
		name: "Advance Agrolife Limited"
	},
	{
		symbol: "ADVANIHOTR",
		name: "Advani Hotels & Resorts (India) Limited"
	},
	{
		symbol: "ADVENTHTL",
		name: "Advent Hotels International Limited"
	},
	{
		symbol: "ADVENZYMES",
		name: "Advanced Enzyme Technologies Limited"
	},
	{
		symbol: "ADVIKCA",
		name: "Advik Capital Limited"
	},
	{
		symbol: "AEGISLOG",
		name: "Aegis Logistics Limited"
	},
	{
		symbol: "AEGISVOPAK",
		name: "Aegis Vopak Terminals Limited"
	},
	{
		symbol: "AEPL",
		name: "Artemis Electricals and Projects Limited"
	},
	{
		symbol: "AEQUS",
		name: "Aequs Limited"
	},
	{
		symbol: "AEROENTER",
		name: "Aeroflex Enterprises Limited"
	},
	{
		symbol: "AEROFLEX",
		name: "Aeroflex Industries Limited"
	},
	{
		symbol: "AERONEU",
		name: "Aeroflex Neu Limited"
	},
	{
		symbol: "AEROPLANE",
		name: "Amir Chand Jagdish Kumar (Exports) Limited"
	},
	{
		symbol: "AETHER",
		name: "Aether Industries Limited"
	},
	{
		symbol: "AFCONS",
		name: "Afcons Infrastructure Limited"
	},
	{
		symbol: "AFFLE",
		name: "Affle 3i Limited"
	},
	{
		symbol: "AFFORDABLE",
		name: "Affordable Robotic & Automation Limited"
	},
	{
		symbol: "AFIL",
		name: "Akme Fintrade (India) Limited"
	},
	{
		symbol: "AFSL",
		name: "Abans Financial Services Limited"
	},
	{
		symbol: "AGARIND",
		name: "Agarwal Industrial Corporation Limited"
	},
	{
		symbol: "AGARWALEYE",
		name: "Dr. Agarwal's Health Care Limited"
	},
	{
		symbol: "AGI",
		name: "AGI Greenpac Limited"
	},
	{
		symbol: "AGIIL",
		name: "Agi Infra Limited"
	},
	{
		symbol: "AGL",
		name: "Allcargo Global Limited"
	},
	{
		symbol: "AGRITECH",
		name: "Agri-Tech (India) Limited"
	},
	{
		symbol: "AGROPHOS",
		name: "Agro Phos India Limited"
	},
	{
		symbol: "AHCL",
		name: "Anlon Healthcare Limited"
	},
	{
		symbol: "AHLADA",
		name: "Ahlada Engineers Limited"
	},
	{
		symbol: "AHLEAST",
		name: "Asian Hotels (East) Limited"
	},
	{
		symbol: "AHLUCONT",
		name: "Ahluwalia Contracts (India) Limited"
	},
	{
		symbol: "AIAENG",
		name: "AIA Engineering Limited"
	},
	{
		symbol: "AIIL",
		name: "Authum Investment & Infrastructure Limited"
	},
	{
		symbol: "AIRAN",
		name: "Airan Limited"
	},
	{
		symbol: "AIROLAM",
		name: "Airo Lam limited"
	},
	{
		symbol: "AJANTPHARM",
		name: "Ajanta Pharma Limited"
	},
	{
		symbol: "AJAXENGG",
		name: "Ajax Engineering Limited"
	},
	{
		symbol: "AJMERA",
		name: "Ajmera Realty & Infra India Limited"
	},
	{
		symbol: "AJOONI",
		name: "Ajooni Biotech Limited"
	},
	{
		symbol: "AKASH",
		name: "Akash Infra-Projects Limited"
	},
	{
		symbol: "AKCAPIT",
		name: "AK Capital Services Limited"
	},
	{
		symbol: "AKG",
		name: "Akg Exim Limited"
	},
	{
		symbol: "AKI",
		name: "AKI India Limited"
	},
	{
		symbol: "AKSHAR",
		name: "Akshar Spintex Limited"
	},
	{
		symbol: "AKUMS",
		name: "Akums Drugs and Pharmaceuticals Limited"
	},
	{
		symbol: "ALANKIT",
		name: "Alankit Limited"
	},
	{
		symbol: "ALBERTDAVD",
		name: "Albert David Limited"
	},
	{
		symbol: "ALEMBICLTD",
		name: "Alembic Limited"
	},
	{
		symbol: "ALFREDHE",
		name: "Alfred Herbert India Limited"
	},
	{
		symbol: "ALGOQUANT",
		name: "Algoquant Fintech Limited"
	},
	{
		symbol: "ALICON",
		name: "Alicon Castalloy Limited"
	},
	{
		symbol: "ALIVUS",
		name: "Alivus Life Sciences Limited"
	},
	{
		symbol: "ALKEM",
		name: "Alkem Laboratories Limited"
	},
	{
		symbol: "ALKYLAMINE",
		name: "Alkyl Amines Chemicals Limited"
	},
	{
		symbol: "ALLCARGO",
		name: "Allcargo Logistics Limited"
	},
	{
		symbol: "ALLDIGI",
		name: "Alldigi Tech Limited"
	},
	{
		symbol: "ALLTIME",
		name: "All Time Plastics Limited"
	},
	{
		symbol: "ALMONDZ",
		name: "Almondz Global Securities Limited"
	},
	{
		symbol: "ALOKINDS",
		name: "Alok Industries Limited"
	},
	{
		symbol: "ALPA",
		name: "Alpa Laboratories Limited"
	},
	{
		symbol: "ALPINETEX",
		name: "Alpine Texworld Limited"
	},
	{
		symbol: "ALUFLUOR",
		name: "Alufluoride Limited"
	},
	{
		symbol: "AMAGI",
		name: "Amagi Media Labs Limited"
	},
	{
		symbol: "AMAL",
		name: "Amal Limited"
	},
	{
		symbol: "AMARJOTHI",
		name: "Amarjothi Spinning Mills Limited"
	},
	{
		symbol: "AMBER",
		name: "Amber Enterprises India Limited"
	},
	{
		symbol: "AMBICAAGAR",
		name: "Ambica Agarbathies & Aroma industries Limited"
	},
	{
		symbol: "AMBIKCO",
		name: "Ambika Cotton Mills Limited"
	},
	{
		symbol: "AMBUJACEM",
		name: "Ambuja Cements Limited"
	},
	{
		symbol: "AMDIND",
		name: "AMD Industries Limited"
	},
	{
		symbol: "AMJLAND",
		name: "Amj Land Holdings Limited"
	},
	{
		symbol: "AMNPLST",
		name: "Amines & Plasticizers Limited"
	},
	{
		symbol: "AMRUTANJAN",
		name: "Amrutanjan Health Care Limited"
	},
	{
		symbol: "ANANDRATHI",
		name: "Anand Rathi Wealth Limited"
	},
	{
		symbol: "ANANTRAJ",
		name: "Anant Raj Limited"
	},
	{
		symbol: "ANDHRAPAP",
		name: "ANDHRA PAPER LIMITED"
	},
	{
		symbol: "ANDHRSUGAR",
		name: "The Andhra Sugars Limited"
	},
	{
		symbol: "ANDREWYU",
		name: "Andrew Yule & Company Limited"
	},
	{
		symbol: "ANGELONE",
		name: "Angel One Limited"
	},
	{
		symbol: "ANIKINDS",
		name: "Anik Industries Limited"
	},
	{
		symbol: "ANMOL",
		name: "Anmol India Limited"
	},
	{
		symbol: "ANNAPURNA",
		name: "Annapurna Swadisht Limited"
	},
	{
		symbol: "ANSALBU",
		name: "Ansal Buildwell Limited"
	},
	{
		symbol: "ANTELOPUS",
		name: "Antelopus Selan Energy Limited"
	},
	{
		symbol: "ANTGRAPHIC",
		name: "Antarctica Limited"
	},
	{
		symbol: "ANTHEM",
		name: "Anthem Biosciences Limited"
	},
	{
		symbol: "ANUHPHR",
		name: "Anuh Pharma Limited"
	},
	{
		symbol: "ANUP",
		name: "The Anup Engineering Limited"
	},
	{
		symbol: "ANURAS",
		name: "Anupam Rasayan India Limited"
	},
	{
		symbol: "APARINDS",
		name: "Apar Industries Limited"
	},
	{
		symbol: "APCL",
		name: "Anjani Portland Cement Limited"
	},
	{
		symbol: "APCOTEXIND",
		name: "Apcotex Industries Limited"
	},
	{
		symbol: "APEX",
		name: "Apex Frozen Foods Limited"
	},
	{
		symbol: "APLAPOLLO",
		name: "APL Apollo Tubes Limited"
	},
	{
		symbol: "APLLTD",
		name: "Alembic Pharmaceuticals Limited"
	},
	{
		symbol: "APOLLO",
		name: "Apollo Micro Systems Limited"
	},
	{
		symbol: "APOLLOHOSP",
		name: "Apollo Hospitals Enterprise Limited"
	},
	{
		symbol: "APOLLOPIPE",
		name: "Apollo Pipes Limited"
	},
	{
		symbol: "APOLLOTYRE",
		name: "Apollo Tyres Limited"
	},
	{
		symbol: "APOLSINHOT",
		name: "Apollo Sindoori Hotels Limited"
	},
	{
		symbol: "APOORVA",
		name: "Apoorva Leasing Finance and Investment Company Limited"
	},
	{
		symbol: "APTUS",
		name: "Aptus Value Housing Finance India Limited"
	},
	{
		symbol: "AQYLON",
		name: "Aqylon Nexus Limited"
	},
	{
		symbol: "ARCHIDPLY",
		name: "Archidply Industries Limited"
	},
	{
		symbol: "ARCHIES",
		name: "Archies Limited"
	},
	{
		symbol: "ARCL",
		name: "ARCL Organics Limited"
	},
	{
		symbol: "ARDEE",
		name: "Ardee Industries Limited"
	},
	{
		symbol: "ARE&M",
		name: "Amara Raja Energy & Mobility Limited"
	},
	{
		symbol: "ARENTERP",
		name: "Rajdarshan Industries Limited"
	},
	{
		symbol: "ARFIN",
		name: "Arfin India Limited"
	},
	{
		symbol: "ARIES",
		name: "Aries Agro Limited"
	},
	{
		symbol: "ARIHANT",
		name: "Arihant Foundations & Housing Limited"
	},
	{
		symbol: "ARIHANTCAP",
		name: "Arihant Capital Markets Limited"
	},
	{
		symbol: "ARIHANTSUP",
		name: "Arihant Superstructures Limited"
	},
	{
		symbol: "ARIS",
		name: "Arisinfra Solutions Limited"
	},
	{
		symbol: "ARKADE",
		name: "Arkade Developers Limited"
	},
	{
		symbol: "ARMANFIN",
		name: "Arman Financial Services Limited"
	},
	{
		symbol: "AROGRANITE",
		name: "Aro Granite Industries Limited"
	},
	{
		symbol: "ARSSBL",
		name: "Anand Rathi Share and Stock Brokers Limited"
	},
	{
		symbol: "ARTEMISMED",
		name: "Artemis Medicare Services Limited"
	},
	{
		symbol: "ARTNIRMAN",
		name: "Art Nirman Limited"
	},
	{
		symbol: "ARVEE",
		name: "Arvee Laboratories (India) Limited"
	},
	{
		symbol: "ARVIND",
		name: "Arvind Limited"
	},
	{
		symbol: "ARVINDFASN",
		name: "Arvind Fashions Limited"
	},
	{
		symbol: "ARVSMART",
		name: "Arvind SmartSpaces Limited"
	},
	{
		symbol: "ARYAMAN",
		name: "Aryaman Financial Services Limited"
	},
	{
		symbol: "ASAHIINDIA",
		name: "Asahi India Glass Limited"
	},
	{
		symbol: "ASAL",
		name: "Automotive Stampings and Assemblies Limited"
	},
	{
		symbol: "ASALCBR",
		name: "Associated Alcohols & Breweries Ltd."
	},
	{
		symbol: "ASHAPURMIN",
		name: "Ashapura Minechem Limited"
	},
	{
		symbol: "ASHIANA",
		name: "Ashiana Housing Limited"
	},
	{
		symbol: "ASHIMASYN",
		name: "Ashima Limited"
	},
	{
		symbol: "ASHOKA",
		name: "Ashoka Buildcon Limited"
	},
	{
		symbol: "ASHOKAMET",
		name: "Ashoka Metcast Limited"
	},
	{
		symbol: "ASHOKLEY",
		name: "Ashok Leyland Limited"
	},
	{
		symbol: "ASIANENE",
		name: "Asian Energy Services Limited"
	},
	{
		symbol: "ASIANHOTNR",
		name: "Asian Hotels (North) Limited"
	},
	{
		symbol: "ASIANPAINT",
		name: "Asian Paints Limited"
	},
	{
		symbol: "ASIANTILES",
		name: "Asian Granito India Limited"
	},
	{
		symbol: "ASIANTNE",
		name: "Asian Tea & Exports Limited"
	},
	{
		symbol: "ASKAUTOLTD",
		name: "ASK Automotive Limited"
	},
	{
		symbol: "ASPINWALL",
		name: "Aspinwall and Company Limited"
	},
	{
		symbol: "ASSAMENT",
		name: "Assam Entrade Limited"
	},
	{
		symbol: "ASTAR",
		name: "Asian Star Company Limited"
	},
	{
		symbol: "ASTEC",
		name: "Astec LifeSciences Limited"
	},
	{
		symbol: "ASTERDM",
		name: "Aster DM Quality Care Limited"
	},
	{
		symbol: "ASTRAL",
		name: "Astral Limited"
	},
	{
		symbol: "ASTRAMICRO",
		name: "Astra Microwave Products Limited"
	},
	{
		symbol: "ASTRAZEN",
		name: "AstraZeneca Pharma India Limited"
	},
	{
		symbol: "ATALREAL",
		name: "Atal Realtech Limited"
	},
	{
		symbol: "ATAM",
		name: "Atam Valves Limited"
	},
	{
		symbol: "ATGL",
		name: "Adani Total Gas Limited"
	},
	{
		symbol: "ATHERENERG",
		name: "Ather Energy Limited"
	},
	{
		symbol: "ATL",
		name: "Allcargo Terminals Limited"
	},
	{
		symbol: "ATLANTAA",
		name: "ATLANTAA LIMITED"
	},
	{
		symbol: "ATLANTAELE",
		name: "Atlanta Electricals Limited"
	},
	{
		symbol: "ATLASCYCLE",
		name: "Atlas Cycles (Haryana) Limited"
	},
	{
		symbol: "ATUL",
		name: "Atul Limited"
	},
	{
		symbol: "ATULAUTO",
		name: "Atul Auto Limited"
	},
	{
		symbol: "AUBANK",
		name: "AU Small Finance Bank Limited"
	},
	{
		symbol: "AUGMONT",
		name: "Augmont Enterprises Limited"
	},
	{
		symbol: "AURIONPRO",
		name: "Aurionpro Solutions Limited"
	},
	{
		symbol: "AUROPHARMA",
		name: "Aurobindo Pharma Limited"
	},
	{
		symbol: "AURUM",
		name: "Aurum PropTech Limited"
	},
	{
		symbol: "AURUS",
		name: "AURUS GEM CORPORATION LIMITED"
	},
	{
		symbol: "AUSOMENT",
		name: "Ausom Enterprise Limited"
	},
	{
		symbol: "AUSTENG",
		name: "Austin Engineering Company  Limited"
	},
	{
		symbol: "AUTOAXLES",
		name: "Automotive Axles Limited"
	},
	{
		symbol: "AUTOIND",
		name: "Autoline Industries Limited"
	},
	{
		symbol: "AVADHSUGAR",
		name: "Avadh Sugar & Energy Limited"
	},
	{
		symbol: "AVALON",
		name: "Avalon Technologies Limited"
	},
	{
		symbol: "AVANCE",
		name: "Avance Technologies Limited"
	},
	{
		symbol: "AVANTEL",
		name: "Avantel Limited"
	},
	{
		symbol: "AVANTIFEED",
		name: "Avanti Feeds Limited"
	},
	{
		symbol: "AVL",
		name: "Aditya Vision Limited"
	},
	{
		symbol: "AVONMORE",
		name: "Avonmore Capital & Management Services Limited"
	},
	{
		symbol: "AVROIND",
		name: "AVRO INDIA LIMITED"
	},
	{
		symbol: "AVTNPL",
		name: "AVT Natural Products Limited"
	},
	{
		symbol: "AWFIS",
		name: "Awfis Space Solutions Limited"
	},
	{
		symbol: "AWHCL",
		name: "Antony Waste Handling Cell Limited"
	},
	{
		symbol: "AWL",
		name: "AWL Agri Business Limited"
	},
	{
		symbol: "AXISBANK",
		name: "Axis Bank Limited"
	},
	{
		symbol: "AXISCADES",
		name: "AXISCADES Technologies Limited"
	},
	{
		symbol: "AXITA",
		name: "Axita Cotton Limited"
	},
	{
		symbol: "AXTEL",
		name: "Axtel Industries Limited"
	},
	{
		symbol: "AYE",
		name: "Aye Finance Limited"
	},
	{
		symbol: "AYMSYNTEX",
		name: "AYM Syntex Limited"
	},
	{
		symbol: "AZAD",
		name: "Azad Engineering Limited"
	},
	{
		symbol: "AZADIND",
		name: "Azad India Mobility Limited"
	},
	{
		symbol: "BAGFILMS",
		name: "B.A.G Films and Media Limited"
	},
	{
		symbol: "BAIDFIN",
		name: "Baid Finserv Limited"
	},
	{
		symbol: "BAJAJ-AUTO",
		name: "Bajaj Auto Limited"
	},
	{
		symbol: "BAJAJCON",
		name: "Bajaj Consumer Care Limited"
	},
	{
		symbol: "BAJAJELEC",
		name: "Bajaj Electricals Limited"
	},
	{
		symbol: "BAJAJFINSV",
		name: "Bajaj Finserv Limited"
	},
	{
		symbol: "BAJAJHCARE",
		name: "Bajaj Healthcare Limited"
	},
	{
		symbol: "BAJAJHFL",
		name: "Bajaj Housing Finance Limited"
	},
	{
		symbol: "BAJAJHIND",
		name: "Bajaj Hindusthan Sugar Limited"
	},
	{
		symbol: "BAJAJHLDNG",
		name: "Bajaj Holdings & Investment Limited"
	},
	{
		symbol: "BAJAJINDEF",
		name: "Indef Manufacturing Limited"
	},
	{
		symbol: "BAJAJST",
		name: "Bajaj Steel Industries Limited"
	},
	{
		symbol: "BAJEL",
		name: "Bajel Projects Limited"
	},
	{
		symbol: "BAJFINANCE",
		name: "Bajaj Finance Limited"
	},
	{
		symbol: "BALAJEE",
		name: "Shree Tirupati Balajee Agro Trading Company Limited"
	},
	{
		symbol: "BALAJITELE",
		name: "Balaji Telefilms Limited"
	},
	{
		symbol: "BALAMINES",
		name: "Balaji Amines Limited"
	},
	{
		symbol: "BALAXI",
		name: "BALAXI PHARMACEUTICALS LIMITED"
	},
	{
		symbol: "BALKRISHNA",
		name: "Balkrishna Paper Mills Limited"
	},
	{
		symbol: "BALKRISIND",
		name: "Balkrishna Industries Limited"
	},
	{
		symbol: "BALMLAWRIE",
		name: "Balmer Lawrie & Company Limited"
	},
	{
		symbol: "BALPHARMA",
		name: "Bal Pharma Limited"
	},
	{
		symbol: "BALRAMCHIN",
		name: "Balrampur Chini Mills Limited"
	},
	{
		symbol: "BALUFORGE",
		name: "Balu Forge Industries Limited"
	},
	{
		symbol: "BANARBEADS",
		name: "Banaras Beads Limited"
	},
	{
		symbol: "BANARISUG",
		name: "Bannari Amman Sugars Limited"
	},
	{
		symbol: "BANCOINDIA",
		name: "Banco Products (I) Limited"
	},
	{
		symbol: "BANDHANBNK",
		name: "Bandhan Bank Limited"
	},
	{
		symbol: "BANG",
		name: "Bang Overseas Limited"
	},
	{
		symbol: "BANKA",
		name: "Banka BioLoo Limited"
	},
	{
		symbol: "BANKBARODA",
		name: "Bank of Baroda"
	},
	{
		symbol: "BANKINDIA",
		name: "Bank of India"
	},
	{
		symbol: "BANSALWIRE",
		name: "Bansal Wire Industries Limited"
	},
	{
		symbol: "BANSWRAS",
		name: "Banswara Syntex Limited"
	},
	{
		symbol: "BASF",
		name: "BASF India Limited"
	},
	{
		symbol: "BATAINDIA",
		name: "Bata India Limited"
	},
	{
		symbol: "BATLIBOI",
		name: "Batliboi Limited"
	},
	{
		symbol: "BAYERCROP",
		name: "Bayer Cropscience Limited"
	},
	{
		symbol: "BBL",
		name: "Bharat Bijlee Limited"
	},
	{
		symbol: "BBOX",
		name: "Black Box Limited"
	},
	{
		symbol: "BBTC",
		name: "The Bombay Burmah Trading Corporation Limited"
	},
	{
		symbol: "BBTCL",
		name: "B&B Triplewall Containers Limited"
	},
	{
		symbol: "BCG",
		name: "Brightcom Group Limited"
	},
	{
		symbol: "BCLIND",
		name: "Bcl Industries Limited"
	},
	{
		symbol: "BCONCEPTS",
		name: "Brand Concepts Limited"
	},
	{
		symbol: "BCPL",
		name: "BCPL Railway Infrastructure Limited"
	},
	{
		symbol: "BDL",
		name: "Bharat Dynamics Limited"
	},
	{
		symbol: "BEARDSELL",
		name: "Beardsell Limited"
	},
	{
		symbol: "BECTORFOOD",
		name: "Mrs. Bectors Food Specialities Limited"
	},
	{
		symbol: "BEDMUTHA",
		name: "Bedmutha Industries Limited"
	},
	{
		symbol: "BEEKAY",
		name: "Beekay Steel Industries Limited"
	},
	{
		symbol: "BEL",
		name: "Bharat Electronics Limited"
	},
	{
		symbol: "BELLACASA",
		name: "Bella Casa Fashion & Retail Limited"
	},
	{
		symbol: "BELRISE",
		name: "Belrise Industries Limited"
	},
	{
		symbol: "BEML",
		name: "BEML Limited"
	},
	{
		symbol: "BENARAS",
		name: "Benares Hotels Limited"
	},
	{
		symbol: "BENGALASM",
		name: "Bengal & Assam Company Limited"
	},
	{
		symbol: "BEPL",
		name: "Bhansali Engineering Polymers Limited"
	},
	{
		symbol: "BERGEPAINT",
		name: "Berger Paints (I) Limited"
	},
	{
		symbol: "BESTAGRO",
		name: "Best Agrolife Limited"
	},
	{
		symbol: "BETA",
		name: "Beta Drugs Limited"
	},
	{
		symbol: "BFINVEST",
		name: "BF Investment Limited"
	},
	{
		symbol: "BFUTILITIE",
		name: "BF Utilities Limited"
	},
	{
		symbol: "BHAGCHEM",
		name: "Bhagiradha Chemicals & Industries Limited"
	},
	{
		symbol: "BHAGYANGR",
		name: "Bhagyanagar India Limited"
	},
	{
		symbol: "BHANDARI",
		name: "Bhandari Hosiery Exports Limited"
	},
	{
		symbol: "BHARATCOAL",
		name: "Bharat Coking Coal Limited"
	},
	{
		symbol: "BHARATFORG",
		name: "Bharat Forge Limited"
	},
	{
		symbol: "BHARATRAS",
		name: "Bharat Rasayan Limited"
	},
	{
		symbol: "BHARATSE",
		name: "Bharat Seats Limited"
	},
	{
		symbol: "BHARATWIRE",
		name: "Bharat Wire Ropes Limited"
	},
	{
		symbol: "BHARTIARTL",
		name: "Bharti Airtel Limited"
	},
	{
		symbol: "BHARTIHEXA",
		name: "Bharti Hexacom Limited"
	},
	{
		symbol: "BHEL",
		name: "Bharat Heavy Electricals Limited"
	},
	{
		symbol: "BIGBLOC",
		name: "Bigbloc Construction Limited"
	},
	{
		symbol: "BIKAJI",
		name: "Bikaji Foods International Limited"
	},
	{
		symbol: "BIL",
		name: "Bhartiya International Limited"
	},
	{
		symbol: "BIMETAL",
		name: "Bimetal Bearings Limited"
	},
	{
		symbol: "BIOCON",
		name: "Biocon Limited"
	},
	{
		symbol: "BIOFILCHEM",
		name: "Biofil Chemicals & Pharmaceuticals Limited"
	},
	{
		symbol: "BIRLACORPN",
		name: "Birla Corporation Limited"
	},
	{
		symbol: "BIRLAMONEY",
		name: "Aditya Birla Money Limited"
	},
	{
		symbol: "BIRLANU",
		name: "BirlaNu Limited"
	},
	{
		symbol: "BIRLAPREC",
		name: "Birla Precision Technologies Limited"
	},
	{
		symbol: "BLACKBUCK",
		name: "BLACKBUCK LIMITED"
	},
	{
		symbol: "BLAL",
		name: "BEML Land Assets Limited"
	},
	{
		symbol: "BLBLIMITED",
		name: "BLB Limited"
	},
	{
		symbol: "BLEL",
		name: "Behari Lal Engineering Limited"
	},
	{
		symbol: "BLIL",
		name: "Balmer Lawrie Investments Limited"
	},
	{
		symbol: "BLKASHYAP",
		name: "B. L. Kashyap and Sons Limited"
	},
	{
		symbol: "BLS",
		name: "BLS International Services Limited"
	},
	{
		symbol: "BLSE",
		name: "BLS E-Services Limited"
	},
	{
		symbol: "BLUECHIP",
		name: "Blue Chip India Limited"
	},
	{
		symbol: "BLUECLOUDS",
		name: "Blue Cloud Softech Solutions Limited"
	},
	{
		symbol: "BLUEDART",
		name: "Blue Dart Express Limited"
	},
	{
		symbol: "BLUEJET",
		name: "Blue Jet Healthcare Limited"
	},
	{
		symbol: "BLUESTARCO",
		name: "Blue Star Limited"
	},
	{
		symbol: "BLUESTONE",
		name: "BlueStone Jewellery and Lifestyle Limited"
	},
	{
		symbol: "BLUSPRING",
		name: "Bluspring Enterprises Limited"
	},
	{
		symbol: "BMWVENTLTD",
		name: "BMW Ventures Limited"
	},
	{
		symbol: "BNAGROCHEM",
		name: "BN Agrochem Limited"
	},
	{
		symbol: "BODALCHEM",
		name: "Bodal Chemicals Limited"
	},
	{
		symbol: "BOHRAIND",
		name: "Bohra Industries Limited"
	},
	{
		symbol: "BOMDYEING",
		name: "Bombay Dyeing & Mfg Company Limited"
	},
	{
		symbol: "BONLON",
		name: "Bonlon Industries Limited"
	},
	{
		symbol: "BORANA",
		name: "Borana Weaves Limited"
	},
	{
		symbol: "BOROLTD",
		name: "Borosil Limited"
	},
	{
		symbol: "BORORENEW",
		name: "BOROSIL RENEWABLES LIMITED"
	},
	{
		symbol: "BOROSCI",
		name: "Borosil Scientific Limited"
	},
	{
		symbol: "BOSCH-HCIL",
		name: "BOSCH HOME COMFORT INDIA LIMITED"
	},
	{
		symbol: "BOSCHLTD",
		name: "Bosch Limited"
	},
	{
		symbol: "BPCL",
		name: "Bharat Petroleum Corporation Limited"
	},
	{
		symbol: "BPL",
		name: "BPL Limited"
	},
	{
		symbol: "BPLPHARMA",
		name: "Bharat Parenterals Limited"
	},
	{
		symbol: "BRAHMINFRA",
		name: "Brahmaputra Infrastructure Limited"
	},
	{
		symbol: "BRIGADE",
		name: "Brigade Enterprises Limited"
	},
	{
		symbol: "BRIGHOTEL",
		name: "Brigade Hotel Ventures Limited"
	},
	{
		symbol: "BRIGHTBR",
		name: "Bright Brothers Limited"
	},
	{
		symbol: "BRITANNIA",
		name: "Britannia Industries Limited"
	},
	{
		symbol: "BRNL",
		name: "Bharat Road Network Limited"
	},
	{
		symbol: "BSE",
		name: "BSE Limited"
	},
	{
		symbol: "BSHSL",
		name: "Bombay Super Hybrid Seeds Limited"
	},
	{
		symbol: "BSL",
		name: "BSL Limited"
	},
	{
		symbol: "BSOFT",
		name: "BIRLASOFT LIMITED"
	},
	{
		symbol: "BTML",
		name: "Bodhi Tree Multimedia Limited"
	},
	{
		symbol: "BUILDPRO",
		name: "Shankara Buildpro Limited"
	},
	{
		symbol: "BURNPUR",
		name: "Burnpur Cement Limited"
	},
	{
		symbol: "BUTTERFLY",
		name: "Butterfly Gandhimathi Appliances Limited"
	},
	{
		symbol: "BVCL",
		name: "Barak Valley Cements Limited"
	},
	{
		symbol: "CALSOFT",
		name: "California Software Company Limited"
	},
	{
		symbol: "CAMLINFINE",
		name: "Camlin Fine Sciences Limited"
	},
	{
		symbol: "CAMPUS",
		name: "Campus Activewear Limited"
	},
	{
		symbol: "CAMS",
		name: "Computer Age Management Services Limited"
	},
	{
		symbol: "CANBK",
		name: "Canara Bank"
	},
	{
		symbol: "CANFINHOME",
		name: "Can Fin Homes Limited"
	},
	{
		symbol: "CANHLIFE",
		name: "Canara HSBC Life Insurance Company Limited"
	},
	{
		symbol: "CANTABIL",
		name: "Cantabil Retail India Limited"
	},
	{
		symbol: "CAPACITE",
		name: "Capacit'e Infraprojects Limited"
	},
	{
		symbol: "CAPILLARY",
		name: "Capillary Technologies India Limited"
	},
	{
		symbol: "CAPITALSFB",
		name: "Capital Small Finance Bank Limited"
	},
	{
		symbol: "CAPLIPOINT",
		name: "Caplin Point Laboratories Limited"
	},
	{
		symbol: "CARBORUNIV",
		name: "Carborundum Universal Limited"
	},
	{
		symbol: "CARERATING",
		name: "CARE Ratings Limited"
	},
	{
		symbol: "CARRARO",
		name: "Carraro India Limited"
	},
	{
		symbol: "CARTRADE",
		name: "Cartrade Tech Limited"
	},
	{
		symbol: "CARYSIL",
		name: "CARYSIL LIMITED"
	},
	{
		symbol: "CASTROLIND",
		name: "Castrol India Limited"
	},
	{
		symbol: "CCAVENUE",
		name: "AvenuesAI Limited"
	},
	{
		symbol: "CCCL",
		name: "Consolidated Construction Consortium Limited"
	},
	{
		symbol: "CCHHL",
		name: "Country Club Hospitality & Holidays Limited"
	},
	{
		symbol: "CCL",
		name: "CCL Products (India) Limited"
	},
	{
		symbol: "CDSL",
		name: "Central Depository Services (India) Limited"
	},
	{
		symbol: "CEATLTD",
		name: "CEAT Limited"
	},
	{
		symbol: "CEIGALL",
		name: "Ceigall India Limited"
	},
	{
		symbol: "CEINSYS",
		name: "Ceinsys Tech Limited"
	},
	{
		symbol: "CELEBRITY",
		name: "Celebrity Fashions Limited"
	},
	{
		symbol: "CELLO",
		name: "Cello World Limited"
	},
	{
		symbol: "CEMPRO",
		name: "Cemindia Projects Limited"
	},
	{
		symbol: "CENTENKA",
		name: "Century Enka Limited"
	},
	{
		symbol: "CENTEXT",
		name: "Century Extrusions Limited"
	},
	{
		symbol: "CENTRALBK",
		name: "Central Bank of India"
	},
	{
		symbol: "CENTRUM",
		name: "Centrum Capital Limited"
	},
	{
		symbol: "CENTUM",
		name: "Centum Electronics Limited"
	},
	{
		symbol: "CENTURYPLY",
		name: "Century Plyboards (India) Limited"
	},
	{
		symbol: "CERA",
		name: "Cera Sanitaryware Limited"
	},
	{
		symbol: "CESC",
		name: "CESC Limited"
	},
	{
		symbol: "CEWATER",
		name: "Concord Enviro Systems Limited"
	},
	{
		symbol: "CFEL",
		name: "Confidence Futuristic Energetech Limited"
	},
	{
		symbol: "CGCL",
		name: "Capri Global Capital Limited"
	},
	{
		symbol: "CGPOWER",
		name: "CG Power and Industrial Solutions Limited"
	},
	{
		symbol: "CGVAK",
		name: "CG Vak Software & Exports Limited"
	},
	{
		symbol: "CHALET",
		name: "Chalet Hotels Limited"
	},
	{
		symbol: "CHAMBLFERT",
		name: "Chambal Fertilizers & Chemicals Limited"
	},
	{
		symbol: "CHEMBOND",
		name: "Chembond Material Technologies Limited"
	},
	{
		symbol: "CHEMCRUX",
		name: "Chemcrux Enterprises Limited"
	},
	{
		symbol: "CHEMFAB",
		name: "Chemfab Alkalis Limited"
	},
	{
		symbol: "CHEMPLASTS",
		name: "Chemplast Sanmar Limited"
	},
	{
		symbol: "CHENNPETRO",
		name: "Chennai Petroleum Corporation Limited"
	},
	{
		symbol: "CHEVIOT",
		name: "Cheviot Company Limited"
	},
	{
		symbol: "CHOICEIN",
		name: "Choice International Limited"
	},
	{
		symbol: "CHOLAFIN",
		name: "Cholamandalam Investment and Finance Company Limited"
	},
	{
		symbol: "CHOLAHLDNG",
		name: "Cholamandalam Financial Holdings Limited"
	},
	{
		symbol: "CIEINDIA",
		name: "CIE Automotive India Limited"
	},
	{
		symbol: "CIFL",
		name: "Capital India Finance Limited"
	},
	{
		symbol: "CINELINE",
		name: "Cineline India Limited"
	},
	{
		symbol: "CINEVISTA",
		name: "Cinevista Limited"
	},
	{
		symbol: "CIPLA",
		name: "Cipla Limited"
	},
	{
		symbol: "CLEAN",
		name: "Clean Science and Technology Limited"
	},
	{
		symbol: "CLEANMAX",
		name: "Clean Max Enviro Energy Solutions Limited"
	},
	{
		symbol: "CLSEL",
		name: "Chaman Lal Setia Exports Limited"
	},
	{
		symbol: "CMLL",
		name: "Caliber Mining and Logistics Limited"
	},
	{
		symbol: "CMPDI",
		name: "Central Mine Planning & Design Institute Limited"
	},
	{
		symbol: "CMRGREEN",
		name: "CMR Green Technologies Limited"
	},
	{
		symbol: "CMSINFO",
		name: "CMS Info Systems Limited"
	},
	{
		symbol: "CNL",
		name: "Creative Newtech Limited"
	},
	{
		symbol: "COALINDIA",
		name: "Coal India Limited"
	},
	{
		symbol: "COASTCORP",
		name: "Coastal Corporation Limited"
	},
	{
		symbol: "COCHINSHIP",
		name: "Cochin Shipyard Limited"
	},
	{
		symbol: "COCKERILL",
		name: "John Cockerill India Limited"
	},
	{
		symbol: "COFORGE",
		name: "Coforge Limited"
	},
	{
		symbol: "COHANCE",
		name: "Cohance Lifesciences Limited"
	},
	{
		symbol: "COLPAL",
		name: "Colgate Palmolive (India) Limited"
	},
	{
		symbol: "COMFINTE",
		name: "Comfort Intech Limited"
	},
	{
		symbol: "COMPEAU",
		name: "Competent Automobiles Company Limited"
	},
	{
		symbol: "COMPUSOFT",
		name: "Compucom Software Limited"
	},
	{
		symbol: "COMSYN",
		name: "Commercial Syn Bags Limited"
	},
	{
		symbol: "CONCOR",
		name: "Container Corporation of India Limited"
	},
	{
		symbol: "CONCORDBIO",
		name: "Concord Biotech Limited"
	},
	{
		symbol: "CONFIPET",
		name: "Confidence Petroleum India Limited"
	},
	{
		symbol: "CONTROLPR",
		name: "Control Print Limited"
	},
	{
		symbol: "CORALFINAC",
		name: "Coral India Finance & Housing Limited"
	},
	{
		symbol: "CORDELIA",
		name: "Waterways Leisure Tourism Limited"
	},
	{
		symbol: "CORDSCABLE",
		name: "Cords Cable Industries Limited"
	},
	{
		symbol: "COROMANDEL",
		name: "Coromandel International Limited"
	},
	{
		symbol: "CORONA",
		name: "CORONA Remedies Limited"
	},
	{
		symbol: "COSMOFIRST",
		name: "COSMO FIRST LIMITED"
	},
	{
		symbol: "CPCAP",
		name: "CP Capital Limited"
	},
	{
		symbol: "CPEDU",
		name: "Career Point Edutech Limited"
	},
	{
		symbol: "CPL",
		name: "Captain Polyplast Limited"
	},
	{
		symbol: "CPPLUS",
		name: "Aditya Infotech Limited"
	},
	{
		symbol: "CRAFTSMAN",
		name: "Craftsman Automation Limited"
	},
	{
		symbol: "CRAMC",
		name: "Canara Robeco Asset Management Company Limited"
	},
	{
		symbol: "CRAVATEX",
		name: "Cravatex Limited"
	},
	{
		symbol: "CREATIVEYE",
		name: "Creative Eye Limited"
	},
	{
		symbol: "CREDITACC",
		name: "CREDITACCESS GRAMEEN LIMITED"
	},
	{
		symbol: "CREST",
		name: "Crest Ventures Limited"
	},
	{
		symbol: "CRISIL",
		name: "Crisil Limited"
	},
	{
		symbol: "CRIZAC",
		name: "Crizac Limited"
	},
	{
		symbol: "CROMPTON",
		name: "Crompton Greaves Consumer Electricals Limited"
	},
	{
		symbol: "CROWN",
		name: "Crown Lifters Limited"
	},
	{
		symbol: "CSBBANK",
		name: "CSB Bank Limited"
	},
	{
		symbol: "CSLFINANCE",
		name: "CSL Finance Limited"
	},
	{
		symbol: "CSM",
		name: "CSM Technologies Limited"
	},
	{
		symbol: "CUB",
		name: "City Union Bank Limited"
	},
	{
		symbol: "CUBEXTUB",
		name: "Cubex Tubings Limited"
	},
	{
		symbol: "CUMMINSIND",
		name: "Cummins India Limited"
	},
	{
		symbol: "CUPID",
		name: "Cupid Limited"
	},
	{
		symbol: "CURAA",
		name: "Cura Technologies Limited"
	},
	{
		symbol: "CYBERMEDIA",
		name: "Cyber Media (India) Limited"
	},
	{
		symbol: "CYIENT",
		name: "Cyient Limited"
	},
	{
		symbol: "CYIENTDLM",
		name: "Cyient DLM Limited"
	},
	{
		symbol: "DABUR",
		name: "Dabur India Limited"
	},
	{
		symbol: "DAICHI",
		name: "Dai-Ichi Karkaria Limited"
	},
	{
		symbol: "DALBHARAT",
		name: "Dalmia Bharat Limited"
	},
	{
		symbol: "DALMIASUG",
		name: "Dalmia Bharat Sugar and Industries Limited"
	},
	{
		symbol: "DAMCAPITAL",
		name: "Dam Capital Advisors Limited"
	},
	{
		symbol: "DANGEE",
		name: "Dangee Dums Limited"
	},
	{
		symbol: "DATAMATICS",
		name: "Datamatics Global Services Limited"
	},
	{
		symbol: "DATAPATTNS",
		name: "Data Patterns (India) Limited"
	},
	{
		symbol: "DAVANGERE",
		name: "Davangere Sugar Company Limited"
	},
	{
		symbol: "DBCORP",
		name: "D.B.Corp Limited"
	},
	{
		symbol: "DBL",
		name: "Dilip Buildcon Limited"
	},
	{
		symbol: "DBOL",
		name: "Dhampur Bio Organics Limited"
	},
	{
		symbol: "DBREALTY",
		name: "Valor Estate Limited"
	},
	{
		symbol: "DCAL",
		name: "Dishman Carbogen Amcis Limited"
	},
	{
		symbol: "DCBBANK",
		name: "DCB Bank Limited"
	},
	{
		symbol: "DCI",
		name: "Dc Infotech And Communication Limited"
	},
	{
		symbol: "DCMFINSERV",
		name: "DCM Financial Services Limited"
	},
	{
		symbol: "DCMNVL",
		name: "DCM Nouvelle Limited"
	},
	{
		symbol: "DCMSHRIRAM",
		name: "DCM Shriram Limited"
	},
	{
		symbol: "DCMSIL",
		name: "DCM Shriram International Limited"
	},
	{
		symbol: "DCMSRIND",
		name: "DCM Shriram Industries Limited"
	},
	{
		symbol: "DCW",
		name: "DCW Limited"
	},
	{
		symbol: "DCXINDIA",
		name: "DCX Systems Limited"
	},
	{
		symbol: "DDEVPLSTIK",
		name: "Ddev Plastiks Industries Limited"
	},
	{
		symbol: "DECCANCE",
		name: "Deccan Cements Limited"
	},
	{
		symbol: "DECNGOLD",
		name: "Deccan Gold Mines Limited"
	},
	{
		symbol: "DEEDEV",
		name: "DEE Development Engineers Limited"
	},
	{
		symbol: "DEEP",
		name: "Deep Polymers Limited"
	},
	{
		symbol: "DEEPAKFERT",
		name: "Deepak Fertilizers and Petrochemicals Corporation Limited"
	},
	{
		symbol: "DEEPAKNTR",
		name: "Deepak Nitrite Limited"
	},
	{
		symbol: "DEEPINDS",
		name: "Deep Industries Limited"
	},
	{
		symbol: "DELHIVERY",
		name: "Delhivery Limited"
	},
	{
		symbol: "DELTACORP",
		name: "Delta Corp Limited"
	},
	{
		symbol: "DELTAMAGNT",
		name: "Delta Manufacturing Limited"
	},
	{
		symbol: "DEN",
		name: "Den Networks Limited"
	},
	{
		symbol: "DENORA",
		name: "De Nora India Limited"
	},
	{
		symbol: "DENTA",
		name: "Denta Water and Infra Solutions Limited"
	},
	{
		symbol: "DEVIT",
		name: "Dev Information Technology Limited"
	},
	{
		symbol: "DEVX",
		name: "Dev Accelerator Limited"
	},
	{
		symbol: "DEVYANI",
		name: "Devyani International Limited"
	},
	{
		symbol: "DGCONTENT",
		name: "Digicontent Limited"
	},
	{
		symbol: "DHAMPURSUG",
		name: "Dhampur Sugar Mills Limited"
	},
	{
		symbol: "DHANBANK",
		name: "Dhanlaxmi Bank Limited"
	},
	{
		symbol: "DHANUKA",
		name: "Dhanuka Agritech Limited"
	},
	{
		symbol: "DHARMAJ",
		name: "Dharmaj Crop Guard Limited"
	},
	{
		symbol: "DHATRE",
		name: "Dhatre Udyog Limited"
	},
	{
		symbol: "DHOOTTRANS",
		name: "Dhoot Transmission Limited"
	},
	{
		symbol: "DHRUV",
		name: "Dhruv Consultancy Services Limited"
	},
	{
		symbol: "DHUNINV",
		name: "Dhunseri Investments Limited"
	},
	{
		symbol: "DIAMINESQ",
		name: "Diamines & Chemicals Limited"
	},
	{
		symbol: "DIAMONDYD",
		name: "Prataap Snacks Limited"
	},
	{
		symbol: "DICIND",
		name: "DIC India Limited"
	},
	{
		symbol: "DIFFNKG",
		name: "Diffusion Engineers Limited"
	},
	{
		symbol: "DIGIDRIVE",
		name: "Digidrive Distributors Limited"
	},
	{
		symbol: "DIGISPICE",
		name: "DiGiSPICE Technologies Limited"
	},
	{
		symbol: "DIGITIDE",
		name: "Digitide Solutions Limited"
	},
	{
		symbol: "DIGJAMLMTD",
		name: "Digjam Limited"
	},
	{
		symbol: "DISAQ",
		name: "Disa India Limited"
	},
	{
		symbol: "DISHTV",
		name: "Dish TV India Limited"
	},
	{
		symbol: "DIVGIITTS",
		name: "Divgi Torqtransfer Systems Limited"
	},
	{
		symbol: "DIVISLAB",
		name: "Divi's Laboratories Limited"
	},
	{
		symbol: "DIXON",
		name: "Dixon Technologies (India) Limited"
	},
	{
		symbol: "DJML",
		name: "DJ Mediaprint & Logistics Limited"
	},
	{
		symbol: "DLF",
		name: "DLF Limited"
	},
	{
		symbol: "DLINKINDIA",
		name: "D-Link (India) Limited"
	},
	{
		symbol: "DMART",
		name: "Avenue Supermarts Limited"
	},
	{
		symbol: "DMCC",
		name: "DMCC SPECIALITY CHEMICALS LIMITED"
	},
	{
		symbol: "DNAMEDIA",
		name: "Diligent Media Corporation Limited"
	},
	{
		symbol: "DODLA",
		name: "Dodla Dairy Limited"
	},
	{
		symbol: "DOLATALGO",
		name: "Dolat Algotech Limited"
	},
	{
		symbol: "DOLLAR",
		name: "Dollar Industries Limited"
	},
	{
		symbol: "DOLPHIN",
		name: "Dolphin Offshore Enterprises (India) Limited"
	},
	{
		symbol: "DOMS",
		name: "DOMS Industries Limited"
	},
	{
		symbol: "DONEAR",
		name: "Donear Industries Limited"
	},
	{
		symbol: "DPABHUSHAN",
		name: "D. P. Abhushan Limited"
	},
	{
		symbol: "DRAGARWQ",
		name: "Dr Agarwals Eye Hospital Limited"
	},
	{
		symbol: "DRCSYSTEMS",
		name: "DRC Systems India Limited"
	},
	{
		symbol: "DREAMFOLKS",
		name: "Dreamfolks Services Limited"
	},
	{
		symbol: "DREDGECORP",
		name: "Dredging Corporation of India Limited"
	},
	{
		symbol: "DRREDDY",
		name: "Dr. Reddy's Laboratories Limited"
	},
	{
		symbol: "DSSL",
		name: "Dynacons Systems & Solutions Limited"
	},
	{
		symbol: "DTIL",
		name: "Dhunseri Tea & Industries Limited"
	},
	{
		symbol: "DUCON",
		name: "Ducon Infratechnologies Limited"
	},
	{
		symbol: "DVL",
		name: "Dhunseri Ventures Limited"
	},
	{
		symbol: "DWARKESH",
		name: "Dwarikesh Sugar Industries Limited"
	},
	{
		symbol: "DYCL",
		name: "Dynamic Cables Limited"
	},
	{
		symbol: "DYNAMATECH",
		name: "Dynamatic Technologies Limited"
	},
	{
		symbol: "DYNPRO",
		name: "Dynemic Products Limited"
	},
	{
		symbol: "EASEMYTRIP",
		name: "Easy Trip Planners Limited"
	},
	{
		symbol: "EASTWEST",
		name: "East West Freight Carriers Limited"
	},
	{
		symbol: "EBGNG",
		name: "GNG Electronics Limited"
	},
	{
		symbol: "EBIX",
		name: "EBIX Limited"
	},
	{
		symbol: "ECLERX",
		name: "eClerx Services Limited"
	},
	{
		symbol: "ECORECO",
		name: "Eco Recycling Limited"
	},
	{
		symbol: "ECOSMOBLTY",
		name: "Ecos (India) Mobility & Hospitality Limited"
	},
	{
		symbol: "EDELWEISS",
		name: "Edelweiss Financial Services Limited"
	},
	{
		symbol: "EFCIL",
		name: "EFC (I) Limited"
	},
	{
		symbol: "EICHERMOT",
		name: "Eicher Motors Limited"
	},
	{
		symbol: "EIDPARRY",
		name: "EID Parry India Limited"
	},
	{
		symbol: "EIEL",
		name: "Enviro Infra Engineers Limited"
	},
	{
		symbol: "EIHAHOTELS",
		name: "EIH Associated Hotels Limited"
	},
	{
		symbol: "EIHOTEL",
		name: "EIH Limited"
	},
	{
		symbol: "EIMCOELECO",
		name: "Eimco Elecon (India) Limited"
	},
	{
		symbol: "EKC",
		name: "Everest Kanto Cylinder Limited"
	},
	{
		symbol: "EKI",
		name: "EKI Energy Services Limited"
	},
	{
		symbol: "ELANTAS",
		name: "Elantas Beck India Limited"
	},
	{
		symbol: "ELCIDIN",
		name: "EL CID Investments Limited"
	},
	{
		symbol: "ELDEHSG",
		name: "Eldeco Housing And Industries Limited"
	},
	{
		symbol: "ELECON",
		name: "Elecon Engineering Company Limited"
	},
	{
		symbol: "ELECTCAST",
		name: "Electrosteel Castings Limited"
	},
	{
		symbol: "ELECTHERM",
		name: "Electrotherm (India) Limited"
	},
	{
		symbol: "ELGIEQUIP",
		name: "Elgi Equipments Limited"
	},
	{
		symbol: "ELGIRUBCO",
		name: "Elgi Rubber Company Limited"
	},
	{
		symbol: "ELIN",
		name: "Elin Electronics Limited"
	},
	{
		symbol: "ELITECON",
		name: "Elitecon International Limited"
	},
	{
		symbol: "ELLEN",
		name: "Ellenbarrie Industrial Gases Limited"
	},
	{
		symbol: "ELPROINTL",
		name: "Elpro International Limited"
	},
	{
		symbol: "EMAMILTD",
		name: "Emami Limited"
	},
	{
		symbol: "EMAMIREAL",
		name: "Emami Realty Limited"
	},
	{
		symbol: "EMBDL",
		name: "Embassy Developments Limited"
	},
	{
		symbol: "EMCURE",
		name: "Emcure Pharmaceuticals Limited"
	},
	{
		symbol: "EMIL",
		name: "Electronics Mart India Limited"
	},
	{
		symbol: "EMKAY",
		name: "Emkay Global Financial Services Limited"
	},
	{
		symbol: "EMMVEE",
		name: "Emmvee Photovoltaic Power Limited"
	},
	{
		symbol: "EMPIND",
		name: "Empire Industries Limited"
	},
	{
		symbol: "EMPOWER",
		name: "Empower India Limited"
	},
	{
		symbol: "EMSLIMITED",
		name: "EMS Limited"
	},
	{
		symbol: "EMUDHRA",
		name: "eMudhra Limited"
	},
	{
		symbol: "ENDURANCE",
		name: "Endurance Technologies Limited"
	},
	{
		symbol: "ENERGYDEV",
		name: "Energy Development Company Limited"
	},
	{
		symbol: "ENGINERSIN",
		name: "Engineers India Limited"
	},
	{
		symbol: "ENIL",
		name: "Entertainment Network (India) Limited"
	},
	{
		symbol: "ENKEIWHEL",
		name: "Enkei Wheels (India) Limited"
	},
	{
		symbol: "ENRIN",
		name: "Siemens Energy India Limited"
	},
	{
		symbol: "ENTERO",
		name: "Entero Healthcare Solutions Limited"
	},
	{
		symbol: "EPACK",
		name: "EPACK Durable Limited"
	},
	{
		symbol: "EPACKPEB",
		name: "EPack Prefab Technologies Limited"
	},
	{
		symbol: "EPIGRAL",
		name: "Epigral Limited"
	},
	{
		symbol: "EPL",
		name: "EPL Limited"
	},
	{
		symbol: "EQUITASBNK",
		name: "Equitas Small Finance Bank Limited"
	},
	{
		symbol: "ERIS",
		name: "Eris Lifesciences Limited"
	},
	{
		symbol: "ESABINDIA",
		name: "Esab India Limited"
	},
	{
		symbol: "ESCORTS",
		name: "Escorts Kubota Limited"
	},
	{
		symbol: "ESSARSHPNG",
		name: "Essar Shipping Limited"
	},
	{
		symbol: "ESSENTIA",
		name: "Integra Essentia Limited"
	},
	{
		symbol: "ESTER",
		name: "Ester Industries Limited"
	},
	{
		symbol: "ETERNAL",
		name: "ETERNAL LIMITED"
	},
	{
		symbol: "ETHOSLTD",
		name: "Ethos Limited"
	},
	{
		symbol: "EUREKAFORB",
		name: "Eureka Forbes Limited"
	},
	{
		symbol: "EUROBOND",
		name: "Euro Panel Products Limited"
	},
	{
		symbol: "EUROPRATIK",
		name: "Euro Pratik Sales Limited"
	},
	{
		symbol: "EVEREADY",
		name: "Eveready Industries India Limited"
	},
	{
		symbol: "EXCELINDUS",
		name: "Excel Industries Limited"
	},
	{
		symbol: "EXCELSOFT",
		name: "Excelsoft Technologies Limited"
	},
	{
		symbol: "EXICOM",
		name: "Exicom Tele-Systems Limited"
	},
	{
		symbol: "EXIDEIND",
		name: "Exide Industries Limited"
	},
	{
		symbol: "EXPLEOSOL",
		name: "Expleo Solutions Limited"
	},
	{
		symbol: "EXXARO",
		name: "Exxaro Tiles Limited"
	},
	{
		symbol: "FABTECH",
		name: "Fabtech Technologies Limited"
	},
	{
		symbol: "FACT",
		name: "Fertilizers and Chemicals Travancore Limited"
	},
	{
		symbol: "FAZE3Q",
		name: "Faze Three Limited"
	},
	{
		symbol: "FCL",
		name: "Fineotex Chemical Limited"
	},
	{
		symbol: "FCSSOFT",
		name: "FCS Software Solutions Limited"
	},
	{
		symbol: "FDC",
		name: "FDC Limited"
	},
	{
		symbol: "FEDDERSHOL",
		name: "Fedders Holding Limited"
	},
	{
		symbol: "FEDERALBNK",
		name: "The Federal Bank  Limited"
	},
	{
		symbol: "FEDFINA",
		name: "Fedbank Financial Services Limited"
	},
	{
		symbol: "FERMENTA",
		name: "Fermenta Biotech Limited"
	},
	{
		symbol: "FIBERWEB",
		name: "Fiberweb (India) Limited"
	},
	{
		symbol: "FIEMIND",
		name: "Fiem Industries Limited"
	},
	{
		symbol: "FILATEX",
		name: "Filatex India Limited"
	},
	{
		symbol: "FILATFASH",
		name: "Filatex Fashions Limited"
	},
	{
		symbol: "FINCABLES",
		name: "Finolex Cables Limited"
	},
	{
		symbol: "FINEORG",
		name: "Fine Organic Industries Limited"
	},
	{
		symbol: "FINKURVE",
		name: "Finkurve Financial Services Limited"
	},
	{
		symbol: "FINOPB",
		name: "Fino Payments Bank Limited"
	},
	{
		symbol: "FINPIPE",
		name: "Finolex Industries Limited"
	},
	{
		symbol: "FIRSTCRY",
		name: "Brainbees Solutions Limited"
	},
	{
		symbol: "FISCHER",
		name: "Fischer Medical Ventures Limited"
	},
	{
		symbol: "FIVESTAR",
		name: "Five-Star Business Finance Limited"
	},
	{
		symbol: "FLAIR",
		name: "Flair Writing Industries Limited"
	},
	{
		symbol: "FLUOROCHEM",
		name: "Gujarat Fluorochemicals Limited"
	},
	{
		symbol: "FMGOETZE",
		name: "Federal-Mogul Goetze (India) Limited."
	},
	{
		symbol: "FMNL",
		name: "Future Market Networks Limited"
	},
	{
		symbol: "FOODSIN",
		name: "Foods & Inns Limited"
	},
	{
		symbol: "FORCEMOT",
		name: "FORCE MOTORS LTD"
	},
	{
		symbol: "FORTIS",
		name: "Fortis Healthcare Limited"
	},
	{
		symbol: "FOSECOIND",
		name: "Foseco India Limited"
	},
	{
		symbol: "FRACTAL",
		name: "Fractal Analytics Limited"
	},
	{
		symbol: "FREDUN",
		name: "Fredun Pharmaceuticals Limited"
	},
	{
		symbol: "FRONTSP",
		name: "Frontier Springs Limited"
	},
	{
		symbol: "FSL",
		name: "Firstsource Solutions Limited"
	},
	{
		symbol: "FUSION",
		name: "Fusion Finance Limited"
	},
	{
		symbol: "GABRIEL",
		name: "Gabriel India Limited"
	},
	{
		symbol: "GAEL",
		name: "Gujarat Ambuja Exports Limited"
	},
	{
		symbol: "GAIL",
		name: "GAIL (India) Limited"
	},
	{
		symbol: "GAJA",
		name: "Gaja Alternative Asset Management Limited"
	},
	{
		symbol: "GALAPREC",
		name: "Gala Precision Engineering Limited"
	},
	{
		symbol: "GALAXYSURF",
		name: "Galaxy Surfactants Limited"
	},
	{
		symbol: "GALLANTT",
		name: "Gallantt Ispat Limited"
	},
	{
		symbol: "GANDHAR",
		name: "Gandhar Oil Refinery (India) Limited"
	},
	{
		symbol: "GANDHITUBE",
		name: "Gandhi Special Tubes Limited"
	},
	{
		symbol: "GANECOS",
		name: "Ganesha Ecosphere Limited"
	},
	{
		symbol: "GANESHCP",
		name: "Ganesh Consumer Products Limited"
	},
	{
		symbol: "GANESHHOU",
		name: "GANESH HOUSING LIMITED"
	},
	{
		symbol: "GANGAFORGE",
		name: "Ganga Forging Limited"
	},
	{
		symbol: "GANGESSECU",
		name: "Ganges Securities Limited"
	},
	{
		symbol: "GARFIBRES",
		name: "Garware Technical Fibres Limited"
	},
	{
		symbol: "GARUDA",
		name: "Garuda Construction and Engineering Limited"
	},
	{
		symbol: "GATEWAY",
		name: "Gateway Distriparks Limited"
	},
	{
		symbol: "GAYAHWS",
		name: "Gayatri Highways Limited"
	},
	{
		symbol: "GAYAPROJ",
		name: "Gayatri Projects Limited"
	},
	{
		symbol: "GCSL",
		name: "Gretex Corporate Services Limited"
	},
	{
		symbol: "GEEKAYWIRE",
		name: "Geekay Wires Limited"
	},
	{
		symbol: "GEMAROMA",
		name: "Gem Aromatics Limited"
	},
	{
		symbol: "GENCON",
		name: "Generic Engineering Construction and Projects Limited"
	},
	{
		symbol: "GENESYS",
		name: "Genesys International Corporation Limited"
	},
	{
		symbol: "GENUSPAPER",
		name: "Genus Paper & Boards Limited"
	},
	{
		symbol: "GENUSPOWER",
		name: "Genus Power Infrastructures Limited"
	},
	{
		symbol: "GEOJITFSL",
		name: "Geojit Financial Services Limited"
	},
	{
		symbol: "GESHIP",
		name: "The Great Eastern Shipping Company Limited"
	},
	{
		symbol: "GFLLIMITED",
		name: "GFL Limited"
	},
	{
		symbol: "GHCL",
		name: "GHCL Limited"
	},
	{
		symbol: "GHCLTEXTIL",
		name: "GHCL Textiles Limited"
	},
	{
		symbol: "GICHSGFIN",
		name: "GIC Housing Finance Limited"
	},
	{
		symbol: "GICL",
		name: "Globe International Carriers Limited"
	},
	{
		symbol: "GICRE",
		name: "General Insurance Corporation of India"
	},
	{
		symbol: "GILLANDERS",
		name: "Gillanders Arbuthnot & Company Limited"
	},
	{
		symbol: "GILLETTE",
		name: "Gillette India Limited"
	},
	{
		symbol: "GIPCL",
		name: "Gujarat Industries Power Company Limited"
	},
	{
		symbol: "GKB",
		name: "GKB Ophthalmics Limited"
	},
	{
		symbol: "GKENERGY",
		name: "GK Energy Limited"
	},
	{
		symbol: "GKSL",
		name: "Gujarat Kidney And Super Speciality Limited"
	},
	{
		symbol: "GKWLIMITED",
		name: "GKW Limited"
	},
	{
		symbol: "GLAND",
		name: "Gland Pharma Limited"
	},
	{
		symbol: "GLAXO",
		name: "GlaxoSmithKline Pharmaceuticals Limited"
	},
	{
		symbol: "GLENMARK",
		name: "Glenmark Pharmaceuticals Limited"
	},
	{
		symbol: "GLFL",
		name: "Gujarat Lease Financing Limited"
	},
	{
		symbol: "GLOBAL",
		name: "Global Education Limited"
	},
	{
		symbol: "GLOBALE",
		name: "Globale Tessile Limited"
	},
	{
		symbol: "GLOBALVECT",
		name: "Global Vectra Helicorp Limited"
	},
	{
		symbol: "GLOBE",
		name: "GLOBE ENTERPRISES (INDIA) LIMITED"
	},
	{
		symbol: "GLOBECIVIL",
		name: "Globe Civil Projects Limited"
	},
	{
		symbol: "GLOBUSSPR",
		name: "Globus Spirits Limited"
	},
	{
		symbol: "GLOSTERLTD",
		name: "Gloster Limited"
	},
	{
		symbol: "GLOTTIS",
		name: "Glottis Limited"
	},
	{
		symbol: "GMBREW",
		name: "GM Breweries Limited"
	},
	{
		symbol: "GMDCLTD",
		name: "Gujarat Mineral Development Corporation Limited"
	},
	{
		symbol: "GMMPFAUDLR",
		name: "GMM Pfaudler Limited"
	},
	{
		symbol: "GMRAIRPORT",
		name: "GMR AIRPORTS LIMITED"
	},
	{
		symbol: "GMRP&UI",
		name: "GMR Power and Urban Infra Limited"
	},
	{
		symbol: "GNA",
		name: "GNA Axles Limited"
	},
	{
		symbol: "GNFC",
		name: "Gujarat Narmada Valley Fertilizers and Chemicals Limited"
	},
	{
		symbol: "GNRL",
		name: "Gujarat Natural Resources Limited"
	},
	{
		symbol: "GOACARBON",
		name: "Goa Carbon Limited"
	},
	{
		symbol: "GOCLCORP",
		name: "GOCL Corporation Limited"
	},
	{
		symbol: "GOCOLORS",
		name: "Go Fashion (India) Limited"
	},
	{
		symbol: "GODAVARIB",
		name: "Godavari Biorefineries Limited"
	},
	{
		symbol: "GODFRYPHLP",
		name: "Godfrey Phillips India Limited"
	},
	{
		symbol: "GODIGIT",
		name: "Go Digit General Insurance Limited"
	},
	{
		symbol: "GODREJAGRO",
		name: "Godrej Agrovet Limited"
	},
	{
		symbol: "GODREJCP",
		name: "Godrej Consumer Products Limited"
	},
	{
		symbol: "GODREJIND",
		name: "Godrej Industries Limited"
	},
	{
		symbol: "GODREJPROP",
		name: "Godrej Properties Limited"
	},
	{
		symbol: "GOKEX",
		name: "Gokaldas Exports Limited"
	},
	{
		symbol: "GOKUL",
		name: "Gokul Refoils and Solvent Limited"
	},
	{
		symbol: "GOKULAGRO",
		name: "Gokul Agro Resources Limited"
	},
	{
		symbol: "GOLDIAM",
		name: "Goldiam International Limited"
	},
	{
		symbol: "GOODLUCK",
		name: "Goodluck India Limited"
	},
	{
		symbol: "GOODYEAR",
		name: "Goodyear India Limited"
	},
	{
		symbol: "GOPAL",
		name: "Gopal Snacks Limited"
	},
	{
		symbol: "GOYALALUM",
		name: "Goyal Aluminiums Limited"
	},
	{
		symbol: "GPIL",
		name: "Godawari Power And Ispat limited"
	},
	{
		symbol: "GPPL",
		name: "Gujarat Pipavav Port Limited"
	},
	{
		symbol: "GPTHEALTH",
		name: "GPT Healthcare Limited"
	},
	{
		symbol: "GPTINFRA",
		name: "GPT Infraprojects Limited"
	},
	{
		symbol: "GRADIENTE",
		name: "Gradiente Infotainment Limited"
	},
	{
		symbol: "GRANDOAK",
		name: "Grand Oak Canyons Distillery Limited"
	},
	{
		symbol: "GRANULES",
		name: "Granules India Limited"
	},
	{
		symbol: "GRAPHITE",
		name: "Graphite India Limited"
	},
	{
		symbol: "GRASIM",
		name: "Grasim Industries Limited"
	},
	{
		symbol: "GRAUWEIL",
		name: "Grauer & Weil India Limited"
	},
	{
		symbol: "GRAVISSHO",
		name: "Graviss Hospitality Limited"
	},
	{
		symbol: "GRAVITA",
		name: "Gravita India Limited"
	},
	{
		symbol: "GREAVESCOT",
		name: "Greaves Cotton Limited"
	},
	{
		symbol: "GREENLAM",
		name: "Greenlam Industries Limited"
	},
	{
		symbol: "GREENPANEL",
		name: "Greenpanel Industries Limited"
	},
	{
		symbol: "GREENPLY",
		name: "Greenply Industries Limited"
	},
	{
		symbol: "GREENPOWER",
		name: "Orient Green Power Company Limited"
	},
	{
		symbol: "GRINDWELL",
		name: "Grindwell Norton Limited"
	},
	{
		symbol: "GRINFRA",
		name: "G R Infraprojects Limited"
	},
	{
		symbol: "GRMOVER",
		name: "GRM Overseas Limited"
	},
	{
		symbol: "GROBTEA",
		name: "The Grob Tea Company Limited"
	},
	{
		symbol: "GROWW",
		name: "Billionbrains Garage Ventures Limited"
	},
	{
		symbol: "GRPLTD",
		name: "GRP Limited"
	},
	{
		symbol: "GRSE",
		name: "Garden Reach Shipbuilders & Engineers Limited"
	},
	{
		symbol: "GRWRHITECH",
		name: "Garware Hi-Tech Films Limited"
	},
	{
		symbol: "GSFC",
		name: "Gujarat State Fertilizers & Chemicals Limited"
	},
	{
		symbol: "GSLSU",
		name: "Global Surfaces Limited"
	},
	{
		symbol: "GSPCROP",
		name: "GSP Crop Science Limited"
	},
	{
		symbol: "GSS",
		name: "GSS Infotech Limited"
	},
	{
		symbol: "GTL",
		name: "GTL Limited"
	},
	{
		symbol: "GTLINFRA",
		name: "GTL Infrastructure Limited"
	},
	{
		symbol: "GTPL",
		name: "GTPL Hathway Limited"
	},
	{
		symbol: "GUFICBIO",
		name: "Gufic Biosciences Limited"
	},
	{
		symbol: "GUJALKALI",
		name: "Gujarat Alkalies and Chemicals Limited"
	},
	{
		symbol: "GUJAPOLLO",
		name: "Gujarat Apollo Industries Limited"
	},
	{
		symbol: "GUJENERGY",
		name: "GUJARAT ENERGY LIMITED"
	},
	{
		symbol: "GUJRAFFIA",
		name: "Gujarat Raffia Industries Limited"
	},
	{
		symbol: "GUJTHEM",
		name: "Gujarat Themis Biosyn Limited"
	},
	{
		symbol: "GULFOILLUB",
		name: "Gulf Oil Lubricants India Limited"
	},
	{
		symbol: "GULPOLY",
		name: "Gulshan Polyols Limited"
	},
	{
		symbol: "GVPIL",
		name: "GE Power India Limited"
	},
	{
		symbol: "GVPTECH",
		name: "GVP Infotech Limited"
	},
	{
		symbol: "GVT&D",
		name: "GE Vernova T&D India Limited"
	},
	{
		symbol: "GYFTR",
		name: "Gyftr Limited"
	},
	{
		symbol: "HAL",
		name: "Hindustan Aeronautics Limited"
	},
	{
		symbol: "HALDER",
		name: "Halder Venture Limited"
	},
	{
		symbol: "HALEOSLABS",
		name: "HALEOS LABS LIMITED"
	},
	{
		symbol: "HAMPTON",
		name: "Hampton Sky Realty Limited"
	},
	{
		symbol: "HAPPSTMNDS",
		name: "Happiest Minds Technologies Limited"
	},
	{
		symbol: "HAPPYFORGE",
		name: "Happy Forgings Limited"
	},
	{
		symbol: "HARDWYN",
		name: "Hardwyn India Limited"
	},
	{
		symbol: "HARIOMPIPE",
		name: "Hariom Pipe Industries Limited"
	},
	{
		symbol: "HARRMALAYA",
		name: "Harrisons  Malayalam Limited"
	},
	{
		symbol: "HARSHA",
		name: "Harsha Engineers International Limited"
	},
	{
		symbol: "HATHWAY",
		name: "Hathway Cable & Datacom Limited"
	},
	{
		symbol: "HATSUN",
		name: "Hatsun Agro Product Limited"
	},
	{
		symbol: "HAVELLS",
		name: "Havells India Limited"
	},
	{
		symbol: "HAVISHA",
		name: "Sri Havisha Hospitality and Infrastructure Limited"
	},
	{
		symbol: "HAWKINCOOK",
		name: "Hawkins Cookers Limited"
	},
	{
		symbol: "HAZOOR",
		name: "Hazoor Multi Projects Limited"
	},
	{
		symbol: "HBESD",
		name: "HB Estate Developers Limited"
	},
	{
		symbol: "HBLENGINE",
		name: "HBL Engineering Limited"
	},
	{
		symbol: "HBPOR",
		name: "HB Portfolio Limited"
	},
	{
		symbol: "HBSL",
		name: "HB Stockholdings Limited"
	},
	{
		symbol: "HCC",
		name: "Hindustan Construction Company Limited"
	},
	{
		symbol: "HCG",
		name: "Healthcare Global Enterprises Limited"
	},
	{
		symbol: "HCL-INSYS",
		name: "HCL Infosystems Limited"
	},
	{
		symbol: "HCLTECH",
		name: "HCL Technologies Limited"
	},
	{
		symbol: "HDBFS",
		name: "HDB Financial Services Limited"
	},
	{
		symbol: "HDFCAMC",
		name: "HDFC Asset Management Company Limited"
	},
	{
		symbol: "HDFCBANK",
		name: "HDFC Bank Limited"
	},
	{
		symbol: "HDFCLIFE",
		name: "HDFC Life Insurance Company Limited"
	},
	{
		symbol: "HEADSUP",
		name: "Heads UP Ventures Limited"
	},
	{
		symbol: "HEALTHX",
		name: "Health X Platform Limited"
	},
	{
		symbol: "HECPROJECT",
		name: "HEC Infra Projects Limited"
	},
	{
		symbol: "HEG",
		name: "HEG Limited"
	},
	{
		symbol: "HEIDELBERG",
		name: "HeidelbergCement India Limited"
	},
	{
		symbol: "HEMIPROP",
		name: "Hemisphere Properties India Limited"
	},
	{
		symbol: "HERANBA",
		name: "Heranba Industries Limited"
	},
	{
		symbol: "HERITGFOOD",
		name: "Heritage Foods Limited"
	},
	{
		symbol: "HEROMOTOCO",
		name: "Hero MotoCorp Limited"
	},
	{
		symbol: "HESTERBIO",
		name: "Hester Biosciences Limited"
	},
	{
		symbol: "HEXATRADEX",
		name: "Hexa Tradex Limited"
	},
	{
		symbol: "HEXT",
		name: "Hexaware Technologies Limited"
	},
	{
		symbol: "HFCL",
		name: "HFCL Limited"
	},
	{
		symbol: "HGINFRA",
		name: "H.G. Infra Engineering Limited"
	},
	{
		symbol: "HGM",
		name: "HandsOn Global Management (HGM) Limited"
	},
	{
		symbol: "HGS",
		name: "Hinduja Global Solutions Limited"
	},
	{
		symbol: "HIKAL",
		name: "Hikal Limited"
	},
	{
		symbol: "HILINFRA",
		name: "Highway Infrastructure Limited"
	},
	{
		symbol: "HILTON",
		name: "Hilton Metal Forging Limited"
	},
	{
		symbol: "HIMATSEIDE",
		name: "Himatsingka Seide Limited"
	},
	{
		symbol: "HINDADH",
		name: "Hindustan Adhesives Limited"
	},
	{
		symbol: "HINDALCO",
		name: "Hindalco Industries Limited"
	},
	{
		symbol: "HINDALUMI",
		name: "Hind Aluminium Industries Limited"
	},
	{
		symbol: "HINDCOMPOS",
		name: "Hindustan Composites Limited"
	},
	{
		symbol: "HINDCON",
		name: "Hindcon Chemicals Limited"
	},
	{
		symbol: "HINDCOPPER",
		name: "Hindustan Copper Limited"
	},
	{
		symbol: "HINDOILEXP",
		name: "Hindustan Oil Exploration Company Limited"
	},
	{
		symbol: "HINDPETRO",
		name: "Hindustan Petroleum Corporation Limited"
	},
	{
		symbol: "HINDUNILVR",
		name: "Hindustan Unilever Limited"
	},
	{
		symbol: "HINDWAREAP",
		name: "Hindware Home Innovation Limited"
	},
	{
		symbol: "HINDZINC",
		name: "Hindustan Zinc Limited"
	},
	{
		symbol: "HIRECT",
		name: "Hirect Limited"
	},
	{
		symbol: "HISARMETAL",
		name: "Hisar Metal Industries Limited"
	},
	{
		symbol: "HITECH",
		name: "Hi-Tech Pipes Limited"
	},
	{
		symbol: "HLEGLAS",
		name: "HLE Glascoat Limited"
	},
	{
		symbol: "HLVLTD",
		name: "HLV LIMITED"
	},
	{
		symbol: "HMAAGRO",
		name: "HMA Agro Industries Limited"
	},
	{
		symbol: "HNDFDS",
		name: "Hindustan Foods Limited"
	},
	{
		symbol: "HOMEFIRST",
		name: "Home First Finance Company India Limited"
	},
	{
		symbol: "HONASA",
		name: "Honasa Consumer Limited"
	},
	{
		symbol: "HONAUT",
		name: "Honeywell Automation India Limited"
	},
	{
		symbol: "HONDAPOWER",
		name: "Honda India Power Products Limited"
	},
	{
		symbol: "HORIZONIND",
		name: "Horizon Industrial Parks Limited"
	},
	{
		symbol: "HPAL",
		name: "HP Adhesives Limited"
	},
	{
		symbol: "HPIL",
		name: "Hindprakash Industries Limited"
	},
	{
		symbol: "HPL",
		name: "HPL Electric & Power Limited"
	},
	{
		symbol: "HRYNSHP",
		name: "Hariyana Ship Breakers Limited"
	},
	{
		symbol: "HSCL",
		name: "Himadri Speciality Chemical Limited"
	},
	{
		symbol: "HTMEDIA",
		name: "HT Media Limited"
	},
	{
		symbol: "HUBTOWN",
		name: "Hubtown Limited"
	},
	{
		symbol: "HUDCO",
		name: "Housing & Urban Development Corporation Limited"
	},
	{
		symbol: "HUHTAMAKI",
		name: "Huhtamaki India Limited"
	},
	{
		symbol: "HYUNDAI",
		name: "Hyundai Motor India Limited"
	},
	{
		symbol: "IBULLSLTD",
		name: "Indiabulls Limited"
	},
	{
		symbol: "ICDSLTD",
		name: "ICDS Limited"
	},
	{
		symbol: "ICEMAKE",
		name: "Ice Make Refrigeration Limited"
	},
	{
		symbol: "ICICIAMC",
		name: "ICICI Prudential Asset Management Company Limited"
	},
	{
		symbol: "ICICIBANK",
		name: "ICICI Bank Limited"
	},
	{
		symbol: "ICICIGI",
		name: "ICICI Lombard General Insurance Company Limited"
	},
	{
		symbol: "ICICIPRULI",
		name: "ICICI Prudential Life Insurance Company Limited"
	},
	{
		symbol: "ICIL",
		name: "Indo Count Industries Limited"
	},
	{
		symbol: "ICRA",
		name: "ICRA Limited"
	},
	{
		symbol: "IDBI",
		name: "IDBI Bank Limited"
	},
	{
		symbol: "IDEA",
		name: "Vodafone Idea Limited"
	},
	{
		symbol: "IDEAFORGE",
		name: "Ideaforge Technology Limited"
	},
	{
		symbol: "IDFCFIRSTB",
		name: "IDFC First Bank Limited"
	},
	{
		symbol: "IEX",
		name: "Indian Energy Exchange Limited"
	},
	{
		symbol: "IFBAGRO",
		name: "IFB Agro Industries Limited"
	},
	{
		symbol: "IFBIND",
		name: "IFB Industries Limited"
	},
	{
		symbol: "IFCI",
		name: "IFCI Limited"
	},
	{
		symbol: "IFGLEXPOR",
		name: "IFGL Refractories Limited"
	},
	{
		symbol: "IGARASHI",
		name: "Igarashi Motors India Limited"
	},
	{
		symbol: "IGCL",
		name: "Indogulf Cropsciences Limited"
	},
	{
		symbol: "IGIL",
		name: "International Gemological Institute Limited"
	},
	{
		symbol: "IGL",
		name: "Indraprastha Gas Limited"
	},
	{
		symbol: "IGPL",
		name: "IG Petrochemicals Limited"
	},
	{
		symbol: "IIFL",
		name: "IIFL Finance Limited"
	},
	{
		symbol: "IIFLCAPS",
		name: "IIFL Capital Services Limited"
	},
	{
		symbol: "IITL",
		name: "Industrial Investment Trust Limited"
	},
	{
		symbol: "IKIO",
		name: "IKIO Technologies Limited"
	},
	{
		symbol: "IKS",
		name: "Inventurus Knowledge Solutions Limited"
	},
	{
		symbol: "IMAGICAA",
		name: "Imagicaaworld Entertainment Limited"
	},
	{
		symbol: "IMFA",
		name: "Indian Metals & Ferro Alloys Limited"
	},
	{
		symbol: "IMPAL",
		name: "India Motor Parts and Accessories Limited"
	},
	{
		symbol: "INA",
		name: "Insolation Energy Limited"
	},
	{
		symbol: "INCREDIBLE",
		name: "INCREDIBLE INDUSTRIES LIMITED"
	},
	{
		symbol: "INDBANK",
		name: "Indbank Merchant Banking Services Limited"
	},
	{
		symbol: "INDGN",
		name: "Indegene Limited"
	},
	{
		symbol: "INDHOTEL",
		name: "The Indian Hotels Company Limited"
	},
	{
		symbol: "INDIACEM",
		name: "The India Cements Limited"
	},
	{
		symbol: "INDIAGLYCO",
		name: "India Glycols Limited"
	},
	{
		symbol: "INDIAMART",
		name: "Indiamart Intermesh Limited"
	},
	{
		symbol: "INDIANB",
		name: "Indian Bank"
	},
	{
		symbol: "INDIANCARD",
		name: "Indian Card Clothing Company Limited"
	},
	{
		symbol: "INDIANHUME",
		name: "Indian Hume Pipe Company Limited"
	},
	{
		symbol: "INDIASHLTR",
		name: "India Shelter Finance Corporation Limited"
	},
	{
		symbol: "INDIGO",
		name: "InterGlobe Aviation Limited"
	},
	{
		symbol: "INDIGOPNTS",
		name: "Indigo Paints Limited"
	},
	{
		symbol: "INDIQUBE",
		name: "Indiqube Spaces Limited"
	},
	{
		symbol: "INDNIPPON",
		name: "India Nippon Electricals Limited"
	},
	{
		symbol: "INDOBORAX",
		name: "Indo Borax & Chemicals Limited"
	},
	{
		symbol: "INDOCO",
		name: "Indoco Remedies Limited"
	},
	{
		symbol: "INDOFARM",
		name: "Indo Farm Equipment Limited"
	},
	{
		symbol: "INDOKEM",
		name: "Indokem Limited"
	},
	{
		symbol: "INDOMIM",
		name: "INDO-MIM Limited"
	},
	{
		symbol: "INDORAMA",
		name: "Indo Rama Synthetics (India) Limited"
	},
	{
		symbol: "INDOSTAR",
		name: "IndoStar Capital Finance Limited"
	},
	{
		symbol: "INDOTECH",
		name: "Indo Tech Transformers Limited"
	},
	{
		symbol: "INDOTHAI",
		name: "Indo Thai Securities Limited"
	},
	{
		symbol: "INDOUS",
		name: "Indo Us Biotech Limited"
	},
	{
		symbol: "INDOWIND",
		name: "Indowind Energy Limited"
	},
	{
		symbol: "INDPRUD",
		name: "Industrial & Prudential Investment Company Limited"
	},
	{
		symbol: "INDRAMEDCO",
		name: "Indraprastha Medical Corporation Limited"
	},
	{
		symbol: "INDSWFTLAB",
		name: "Ind-Swift Laboratories Limited"
	},
	{
		symbol: "INDTERRAIN",
		name: "Indian Terrain Fashions Limited"
	},
	{
		symbol: "INDUSINDBK",
		name: "IndusInd Bank Limited"
	},
	{
		symbol: "INDUSTOWER",
		name: "Indus Towers Limited"
	},
	{
		symbol: "INFOBEAN",
		name: "InfoBeans Technologies Limited"
	},
	{
		symbol: "INFOMEDIA",
		name: "Infomedia Press Limited"
	},
	{
		symbol: "INFY",
		name: "Infosys Limited"
	},
	{
		symbol: "INGERRAND",
		name: "Ingersoll Rand (India) Limited"
	},
	{
		symbol: "INNOVACAP",
		name: "Innova Captab Limited"
	},
	{
		symbol: "INNOVANA",
		name: "Innovana Thinklabs Limited"
	},
	{
		symbol: "INNOVISION",
		name: "Innovision Limited"
	},
	{
		symbol: "INOXGREEN",
		name: "Inox Green Energy Services Limited"
	},
	{
		symbol: "INOXINDIA",
		name: "INOX India Limited"
	},
	{
		symbol: "INOXWIND",
		name: "Inox Wind Limited"
	},
	{
		symbol: "INSECTICID",
		name: "Insecticides (India) Limited"
	},
	{
		symbol: "INSPIRISYS",
		name: "Inspirisys Solutions Limited"
	},
	{
		symbol: "INTELLECT",
		name: "Intellect Design Arena Limited"
	},
	{
		symbol: "INTENTECH",
		name: "Intense Technologies Limited"
	},
	{
		symbol: "INTERARCH",
		name: "Interarch Building Solutions Limited"
	},
	{
		symbol: "INTLCONV",
		name: "International Conveyors Limited"
	},
	{
		symbol: "INVENTURE",
		name: "Inventure Growth & Securities Limited"
	},
	{
		symbol: "IOB",
		name: "Indian Overseas Bank"
	},
	{
		symbol: "IOC",
		name: "Indian Oil Corporation Limited"
	},
	{
		symbol: "IOLCP",
		name: "IOL Chemicals and Pharmaceuticals Limited"
	},
	{
		symbol: "IONEXCHANG",
		name: "ION Exchange (India) Limited"
	},
	{
		symbol: "IPCALAB",
		name: "IPCA Laboratories Limited"
	},
	{
		symbol: "IPL",
		name: "India Pesticides Limited"
	},
	{
		symbol: "IPRINGLTD",
		name: "IP Rings Limited"
	},
	{
		symbol: "IRB",
		name: "IRB Infrastructure Developers Limited"
	},
	{
		symbol: "IRCON",
		name: "Ircon International Limited"
	},
	{
		symbol: "IRCTC",
		name: "Indian Railway Catering And Tourism Corporation Limited"
	},
	{
		symbol: "IREDA",
		name: "Indian Renewable Energy Development Agency Limited"
	},
	{
		symbol: "IRFC",
		name: "Indian Railway Finance Corporation Limited"
	},
	{
		symbol: "IRIS",
		name: "IRIS RegTech Solutions Limited"
	},
	{
		symbol: "IRISDOREME",
		name: "Iris Clothings Limited"
	},
	{
		symbol: "IRMENERGY",
		name: "IRM Energy Limited"
	},
	{
		symbol: "ISFT",
		name: "Intrasoft Technologies Limited"
	},
	{
		symbol: "ISGEC",
		name: "Isgec Heavy Engineering Limited"
	},
	{
		symbol: "ISHANCH",
		name: "Ishan Dyes and Chemicals Limited"
	},
	{
		symbol: "ISTLTD",
		name: "I S T Limited"
	},
	{
		symbol: "ITC",
		name: "ITC Limited"
	},
	{
		symbol: "ITCHOTELS",
		name: "ITC Hotels Limited"
	},
	{
		symbol: "ITDC",
		name: "India Tourism Development Corporation Limited"
	},
	{
		symbol: "ITI",
		name: "ITI Limited"
	},
	{
		symbol: "ITL",
		name: "ITL Industries Limited"
	},
	{
		symbol: "IVALUE",
		name: "Ivalue Infosolutions Limited"
	},
	{
		symbol: "IVC",
		name: "IL&FS Investment Managers Limited"
	},
	{
		symbol: "IWP",
		name: "The Indian Wood Products Company Limited"
	},
	{
		symbol: "IXIGO",
		name: "Le Travenues Technology Limited"
	},
	{
		symbol: "IZMO",
		name: "IZMO Limited"
	},
	{
		symbol: "J&KBANK",
		name: "The Jammu & Kashmir Bank Limited"
	},
	{
		symbol: "JAGRAN",
		name: "Jagran Prakashan Limited"
	},
	{
		symbol: "JAGSNPHARM",
		name: "Jagsonpal Pharmaceuticals Limited"
	},
	{
		symbol: "JAIBALAJI",
		name: "Jai Balaji Industries Limited"
	},
	{
		symbol: "JAICORPLTD",
		name: "Jai Corp Limited"
	},
	{
		symbol: "JAINREC",
		name: "Jain Resource Recycling Limited"
	},
	{
		symbol: "JAIPURKURT",
		name: "Nandani Creation Limited"
	},
	{
		symbol: "JAMNAAUTO",
		name: "Jamna Auto Industries Limited"
	},
	{
		symbol: "JARO",
		name: "Jaro Institute of Technology Management and Research Limited"
	},
	{
		symbol: "JASH",
		name: "Jash Engineering Limited"
	},
	{
		symbol: "JAYAGROGN",
		name: "Jayant Agro Organics Limited"
	},
	{
		symbol: "JAYBARMARU",
		name: "Jay Bharat Maruti Limited"
	},
	{
		symbol: "JAYKAY",
		name: "Jaykay Enterprises Limited"
	},
	{
		symbol: "JAYNECOIND",
		name: "Jayaswal Neco Industries Limited"
	},
	{
		symbol: "JAYSREETEA",
		name: "Jayshree Tea & Industries Limited"
	},
	{
		symbol: "JBMA",
		name: "JBM Auto Limited"
	},
	{
		symbol: "JENBURPH",
		name: "Jenburkt Pharmaceuticals Limited"
	},
	{
		symbol: "JETFREIGHT",
		name: "Jet Freight Logistics Limited"
	},
	{
		symbol: "JGCHEM",
		name: "J.G.Chemicals Limited"
	},
	{
		symbol: "JHS",
		name: "JHS Svendgaard Laboratories Limited"
	},
	{
		symbol: "JINDALPHOT",
		name: "Jindal Photo Limited"
	},
	{
		symbol: "JINDALPOLY",
		name: "Jindal Poly Films Limited"
	},
	{
		symbol: "JINDALSAW",
		name: "Jindal Saw Limited"
	},
	{
		symbol: "JINDALSTEL",
		name: "JINDAL STEEL LIMITED"
	},
	{
		symbol: "JINDRILL",
		name: "Jindal Drilling And Industries Limited"
	},
	{
		symbol: "JINDWORLD",
		name: "Jindal Worldwide Limited"
	},
	{
		symbol: "JIOFIN",
		name: "Jio Financial Services Limited"
	},
	{
		symbol: "JISLDVREQS",
		name: "Jain Irrigation Systems Limited"
	},
	{
		symbol: "JISLJALEQS",
		name: "Jain Irrigation Systems Limited"
	},
	{
		symbol: "JITFINFRA",
		name: "JITF Infralogistics Limited"
	},
	{
		symbol: "JKCEMENT",
		name: "JK Cement Limited"
	},
	{
		symbol: "JKIL",
		name: "J.Kumar Infraprojects Limited"
	},
	{
		symbol: "JKIPL",
		name: "Jinkushal Industries Limited"
	},
	{
		symbol: "JKLAKSHMI",
		name: "JK Lakshmi Cement Limited"
	},
	{
		symbol: "JKPAPER",
		name: "JK Paper Limited"
	},
	{
		symbol: "JKTYRE",
		name: "JK Tyre & Industries Limited"
	},
	{
		symbol: "JLHL",
		name: "Jupiter Life Line Hospitals Limited"
	},
	{
		symbol: "JMA",
		name: "Jullundur Motor Agency (Delhi) Limited"
	},
	{
		symbol: "JMFINANCIL",
		name: "JM Financial Limited"
	},
	{
		symbol: "JNKINDIA",
		name: "JNK India Limited"
	},
	{
		symbol: "JNPR",
		name: "Juniper Green Energy Limited"
	},
	{
		symbol: "JPOLYINVST",
		name: "Jindal Poly Investment and Finance Company Limited"
	},
	{
		symbol: "JPPOWER",
		name: "Jaiprakash Power Ventures Limited"
	},
	{
		symbol: "JSFB",
		name: "Jana Small Finance Bank Limited"
	},
	{
		symbol: "JSL",
		name: "Jindal Stainless Limited"
	},
	{
		symbol: "JSLL",
		name: "Jeena Sikho Lifecare Limited"
	},
	{
		symbol: "JSWCEMENT",
		name: "JSW Cement Limited"
	},
	{
		symbol: "JSWDULUX",
		name: "JSW Dulux Limited"
	},
	{
		symbol: "JSWENERGY",
		name: "JSW Energy Limited"
	},
	{
		symbol: "JSWHL",
		name: "JSW Holdings Limited"
	},
	{
		symbol: "JSWINFRA",
		name: "JSW Infrastructure Limited"
	},
	{
		symbol: "JSWSTEEL",
		name: "JSW Steel Limited"
	},
	{
		symbol: "JTEKTINDIA",
		name: "Jtekt India Limited"
	},
	{
		symbol: "JTLIND",
		name: "JTL INDUSTRIES LIMITED"
	},
	{
		symbol: "JUBLCPL",
		name: "Jubilant Agri and Consumer Products Limited"
	},
	{
		symbol: "JUBLFOOD",
		name: "Jubilant Foodworks Limited"
	},
	{
		symbol: "JUBLINGREA",
		name: "Jubilant Ingrevia Limited"
	},
	{
		symbol: "JUBLPHARMA",
		name: "Jubilant Pharmova Limited"
	},
	{
		symbol: "JUNIPER",
		name: "Juniper Hotels Limited"
	},
	{
		symbol: "JUSTDIAL",
		name: "Just Dial Limited"
	},
	{
		symbol: "JWL",
		name: "Jupiter Wagons Limited"
	},
	{
		symbol: "JYOTHYLAB",
		name: "Jyothy Labs Limited"
	},
	{
		symbol: "JYOTICNC",
		name: "Jyoti CNC Automation Limited"
	},
	{
		symbol: "JYOTIRES",
		name: "Jyoti Resins & Adhesives Limited"
	},
	{
		symbol: "JYOTISTRUC",
		name: "Jyoti Structures Limited"
	},
	{
		symbol: "KABRAEXTRU",
		name: "Kabra Extrusion Technik Limited"
	},
	{
		symbol: "KAJARIACER",
		name: "Kajaria Ceramics Limited"
	},
	{
		symbol: "KAKATCEM",
		name: "Kakatiya Cement Sugar & Industries Limited"
	},
	{
		symbol: "KALAMANDIR",
		name: "Sai Silks (Kalamandir) Limited"
	},
	{
		symbol: "KALPATARU",
		name: "Kalpataru Limited"
	},
	{
		symbol: "KALYANIFRG",
		name: "Kalyani Forge Limited"
	},
	{
		symbol: "KALYANKJIL",
		name: "Kalyan Jewellers India Limited"
	},
	{
		symbol: "KAMAHOLD",
		name: "Kama Holdings Limited"
	},
	{
		symbol: "KAMANWALA",
		name: "Kamanwala Housing Construction Limited"
	},
	{
		symbol: "KAMATHOTEL",
		name: "Kamat Hotels (I) Limited"
	},
	{
		symbol: "KAMOPAINTS",
		name: "Kamdhenu Ventures Limited"
	},
	{
		symbol: "KANANIIND",
		name: "Kanani Industries Limited"
	},
	{
		symbol: "KANCHI",
		name: "Kanchi Karpooram Limited"
	},
	{
		symbol: "KANCOTEA",
		name: "Kanco Tea & Industries Limited"
	},
	{
		symbol: "KANPRPLA",
		name: "Kanpur Plastipack Limited"
	},
	{
		symbol: "KANSAINER",
		name: "Kansai Nerolac Paints Limited"
	},
	{
		symbol: "KAPSTON",
		name: "Kapston Services Limited"
	},
	{
		symbol: "KARMAENG",
		name: "Karma Energy Limited"
	},
	{
		symbol: "KARURVYSYA",
		name: "Karur Vysya Bank Limited"
	},
	{
		symbol: "KAVDEFENCE",
		name: "Kavveri Defence & Wireless Technologies Limited"
	},
	{
		symbol: "KAYNES",
		name: "Kaynes Technology India Limited"
	},
	{
		symbol: "KCP",
		name: "KCP Limited"
	},
	{
		symbol: "KDDL",
		name: "KDDL Limited"
	},
	{
		symbol: "KEC",
		name: "KEC International Limited"
	},
	{
		symbol: "KECL",
		name: "Kirloskar Electric Company Limited"
	},
	{
		symbol: "KEEPLEARN",
		name: "DSJ Keep Learning Limited"
	},
	{
		symbol: "KEI",
		name: "KEI Industries Limited"
	},
	{
		symbol: "KELLTONTEC",
		name: "Kellton Tech Solutions Limited"
	},
	{
		symbol: "KENNAMET",
		name: "Kennametal India Limited"
	},
	{
		symbol: "KERNEX",
		name: "Kernex Microsystems (India) Limited"
	},
	{
		symbol: "KEYFINSERV",
		name: "Keynote Financial Services Limited"
	},
	{
		symbol: "KFINTECH",
		name: "Kfin Technologies Limited"
	},
	{
		symbol: "KHAICHEM",
		name: "Khaitan Chemicals & Fertilizers Limited"
	},
	{
		symbol: "KHAITANLTD",
		name: "Khaitan (India) Limited"
	},
	{
		symbol: "KHANDSE",
		name: "Khandwala Securities Limited"
	},
	{
		symbol: "KICL",
		name: "Kalyani Investment Company Limited"
	},
	{
		symbol: "KIMS",
		name: "Krishna Institute of Medical Sciences Limited"
	},
	{
		symbol: "KINGFA",
		name: "Kingfa Science & Technology (India) Limited"
	},
	{
		symbol: "KIOCL",
		name: "KIOCL Limited"
	},
	{
		symbol: "KIRANVYPAR",
		name: "Kiran Vyapar Limited"
	},
	{
		symbol: "KIRIINDUS",
		name: "Kiri Industries Limited"
	},
	{
		symbol: "KIRLFER",
		name: "Kirloskar Ferrous Industries Limited"
	},
	{
		symbol: "KIRLOSBROS",
		name: "Kirloskar Brothers Limited"
	},
	{
		symbol: "KIRLOSENG",
		name: "Kirloskar Oil Engines Limited"
	},
	{
		symbol: "KIRLOSIND",
		name: "Kirloskar Industries Limited"
	},
	{
		symbol: "KIRLPNU",
		name: "Kirloskar Pneumatic Company Limited"
	},
	{
		symbol: "KISSHT",
		name: "OnEMI Technology Solutions Limited"
	},
	{
		symbol: "KITEX",
		name: "Kitex Garments Limited"
	},
	{
		symbol: "KJMCFIN",
		name: "KJMC Financial Services Limited"
	},
	{
		symbol: "KKCL",
		name: "Kewal Kiran Clothing Limited"
	},
	{
		symbol: "KLBRENG-B",
		name: "Kilburn Engineering Limited"
	},
	{
		symbol: "KMCSHIL",
		name: "K M C Speciality Hospitals (India) Limited"
	},
	{
		symbol: "KMEW",
		name: "Knowledge Marine & Engineering Works Limited"
	},
	{
		symbol: "KMSUGAR",
		name: "K.M.Sugar Mills Limited"
	},
	{
		symbol: "KNACK",
		name: "Knack Packaging Limited"
	},
	{
		symbol: "KNAGRI",
		name: "KN Agri Resources Limited"
	},
	{
		symbol: "KNRCON",
		name: "KNR Constructions Limited"
	},
	{
		symbol: "KOHINOOR",
		name: "Kohinoor Foods Limited"
	},
	{
		symbol: "KOKUYOCMLN",
		name: "Kokuyo Camlin Limited"
	},
	{
		symbol: "KOLTEPATIL",
		name: "Kolte - Patil Developers Limited"
	},
	{
		symbol: "KOPRAN",
		name: "Kopran Limited"
	},
	{
		symbol: "KOTAKBANK",
		name: "Kotak Mahindra Bank Limited"
	},
	{
		symbol: "KOTHARIPET",
		name: "Kothari Petrochemicals Limited"
	},
	{
		symbol: "KOTHARIPRO",
		name: "Kothari Products Limited"
	},
	{
		symbol: "KOTIC",
		name: "Kothari Industrial Corporation Limited"
	},
	{
		symbol: "KOVAI",
		name: "Kovai Medical Center & Hospital Limited"
	},
	{
		symbol: "KPEL",
		name: "K.P. Energy Limited"
	},
	{
		symbol: "KPIGREEN",
		name: "KPI Green Energy Limited"
	},
	{
		symbol: "KPIL",
		name: "Kalpataru Projects International Limited"
	},
	{
		symbol: "KPITTECH",
		name: "KPIT Technologies Limited"
	},
	{
		symbol: "KPL",
		name: "Kwality Pharmaceuticals Limited"
	},
	{
		symbol: "KPRMILL",
		name: "K.P.R. Mill Limited"
	},
	{
		symbol: "KRBL",
		name: "KRBL Limited"
	},
	{
		symbol: "KREBSBIO",
		name: "Krebs Biochemicals and Industries Limited"
	},
	{
		symbol: "KRISHANA",
		name: "Krishana Phoschem Limited"
	},
	{
		symbol: "KRISHIVAL",
		name: "Krishival Foods Limited"
	},
	{
		symbol: "KRISHNADEF",
		name: "Krishna Defence And Allied Industries Limited"
	},
	{
		symbol: "KRITI",
		name: "Kriti Industries (India) Limited"
	},
	{
		symbol: "KRITIKA",
		name: "Kritika Wires Limited"
	},
	{
		symbol: "KRITINUT",
		name: "Kriti Nutrients Limited"
	},
	{
		symbol: "KRN",
		name: "KRN Heat Exchanger and Refrigeration Limited"
	},
	{
		symbol: "KROSS",
		name: "Kross Limited"
	},
	{
		symbol: "KRSNAA",
		name: "Krsnaa Diagnostics Limited"
	},
	{
		symbol: "KRYSTAL",
		name: "Krystal Integrated Services Limited"
	},
	{
		symbol: "KSB",
		name: "Ksb Limited"
	},
	{
		symbol: "KSCL",
		name: "Kaveri Seed Company Limited"
	},
	{
		symbol: "KSE",
		name: "KSE Limited"
	},
	{
		symbol: "KSHINTL",
		name: "KSH International Limited"
	},
	{
		symbol: "KSHITIJPOL",
		name: "Kshitij Polyline Limited"
	},
	{
		symbol: "KSL",
		name: "Kalyani Steels Limited"
	},
	{
		symbol: "KSOLVES",
		name: "Ksolves India Limited"
	},
	{
		symbol: "KSR",
		name: "KSR Footwear Limited"
	},
	{
		symbol: "KTKBANK",
		name: "The Karnataka Bank Limited"
	},
	{
		symbol: "KUANTUM",
		name: "Kuantum Papers Limited"
	},
	{
		symbol: "KUSUMGAR",
		name: "Kusumgar Limited"
	},
	{
		symbol: "KWIL",
		name: "Kwality Wall's (India) Limited"
	},
	{
		symbol: "LADDERUP",
		name: "Ladderup Finance Limited"
	},
	{
		symbol: "LAGNAM",
		name: "Lagnam Spintex Limited"
	},
	{
		symbol: "LAHOTIOV",
		name: "Lahoti Overseas Limited"
	},
	{
		symbol: "LAKSHMIMIL",
		name: "Lakshmi Mills Company Limited"
	},
	{
		symbol: "LAL",
		name: "Lorenzini Apparels Limited"
	},
	{
		symbol: "LALITHAA",
		name: "Lalithaa Jewellery Mart Limited"
	},
	{
		symbol: "LALPATHLAB",
		name: "Dr. Lal Path Labs Ltd."
	},
	{
		symbol: "LAMBODHARA",
		name: "Lambodhara Textiles Limited"
	},
	{
		symbol: "LANCER",
		name: "Lancer Container Lines Limited"
	},
	{
		symbol: "LANCORHOL",
		name: "Lancor Holdings Limited"
	},
	{
		symbol: "LANDMARK",
		name: "Landmark Cars Limited"
	},
	{
		symbol: "LANDSMILL",
		name: "Landsmill Green Limited"
	},
	{
		symbol: "LAOPALA",
		name: "La Opala RG Limited"
	},
	{
		symbol: "LASA",
		name: "Lasa Supergenerics Limited"
	},
	{
		symbol: "LASERPOWER",
		name: "Laser Power & Infra Limited"
	},
	{
		symbol: "LATENTVIEW",
		name: "Latent View Analytics Limited"
	},
	{
		symbol: "LATTEYS",
		name: "Latteys Industries Limited"
	},
	{
		symbol: "LAURUSLABS",
		name: "Laurus Labs Limited"
	},
	{
		symbol: "LAXMICOT",
		name: "Laxmi Cotspin Limited"
	},
	{
		symbol: "LAXMIDENTL",
		name: "Laxmi Dental Limited"
	},
	{
		symbol: "LAXMIINDIA",
		name: "Laxmi India Finance Limited"
	},
	{
		symbol: "LCCINFOTEC",
		name: "LCC Infotech Limited"
	},
	{
		symbol: "LCL",
		name: "Lohia Corp Limited"
	},
	{
		symbol: "LEAPIND",
		name: "LEAP India Limited"
	},
	{
		symbol: "LEENEE",
		name: "Lee & Nee Softwares Exports Limited"
	},
	{
		symbol: "LEMERITE",
		name: "Le Merite Exports Limited"
	},
	{
		symbol: "LEMONTREE",
		name: "Lemon Tree Hotels Limited"
	},
	{
		symbol: "LENSKART",
		name: "Lenskart Solutions Limited"
	},
	{
		symbol: "LEXUS",
		name: "Lexus Granito (India) Limited"
	},
	{
		symbol: "LFIC",
		name: "Lakshmi Finance & Industrial Corporation Limited"
	},
	{
		symbol: "LGBBROSLTD",
		name: "LG Balakrishnan & Bros Limited"
	},
	{
		symbol: "LGEINDIA",
		name: "LG Electronics India Limited"
	},
	{
		symbol: "LGHL",
		name: "Laxmi Goldorna House Limited"
	},
	{
		symbol: "LIBAS",
		name: "Libas Consumer Products Limited"
	},
	{
		symbol: "LIBERTSHOE",
		name: "Liberty Shoes Limited"
	},
	{
		symbol: "LICHSGFIN",
		name: "LIC Housing Finance Limited"
	},
	{
		symbol: "LICI",
		name: "Life Insurance Corporation Of India"
	},
	{
		symbol: "LIKHITHA",
		name: "Likhitha Infrastructure Limited"
	},
	{
		symbol: "LINC",
		name: "Linc Limited"
	},
	{
		symbol: "LINCOLN",
		name: "Lincoln Pharmaceuticals Limited"
	},
	{
		symbol: "LINDEINDIA",
		name: "Linde India Limited"
	},
	{
		symbol: "LKPSEC",
		name: "LKP Securities Limited"
	},
	{
		symbol: "LLOYDSENGG",
		name: "LLOYDS ENGINEERING WORKS LIMITED"
	},
	{
		symbol: "LLOYDSENT",
		name: "Lloyds Enterprises Limited"
	},
	{
		symbol: "LLOYDSME",
		name: "Lloyds Metals And Energy Limited"
	},
	{
		symbol: "LMW",
		name: "LMW Limited"
	},
	{
		symbol: "LODHA",
		name: "Lodha Developers Limited"
	},
	{
		symbol: "LOKESHMACH",
		name: "Lokesh Machines Limited"
	},
	{
		symbol: "LORDSCHLO",
		name: "Lords Chloro Alkali Limited"
	},
	{
		symbol: "LOTUSCHO",
		name: "Lotus Chocolate Company Limited"
	},
	{
		symbol: "LOTUSEYE",
		name: "Lotus Eye Hospital and Institute Limited"
	},
	{
		symbol: "LOVABLE",
		name: "Lovable Lingerie Limited"
	},
	{
		symbol: "LOYALTEX",
		name: "Loyal Textile Mills Limited"
	},
	{
		symbol: "LPDC",
		name: "Landmark Property Development Company Limited"
	},
	{
		symbol: "LT",
		name: "Larsen & Toubro Limited"
	},
	{
		symbol: "LTF",
		name: "L&T Finance Limited"
	},
	{
		symbol: "LTFOODS",
		name: "LT Foods Limited"
	},
	{
		symbol: "LTM",
		name: "LTM Limited"
	},
	{
		symbol: "LTTS",
		name: "L&T Technology Services Limited"
	},
	{
		symbol: "LUMAXIND",
		name: "Lumax Industries Limited"
	},
	{
		symbol: "LUMAXTECH",
		name: "Lumax Auto Technologies Limited"
	},
	{
		symbol: "LUPIN",
		name: "Lupin Limited"
	},
	{
		symbol: "LUXIND",
		name: "Lux Industries Limited"
	},
	{
		symbol: "LXCHEM",
		name: "Laxmi Organic Industries Limited"
	},
	{
		symbol: "M&M",
		name: "Mahindra & Mahindra Limited"
	},
	{
		symbol: "M&MFIN",
		name: "Mahindra & Mahindra Financial Services Limited"
	},
	{
		symbol: "MAANALU",
		name: "Maan Aluminium Limited"
	},
	{
		symbol: "MACPOWER",
		name: "Macpower CNC Machines Limited"
	},
	{
		symbol: "MADHAV",
		name: "Madhav Marbles and Granites Limited"
	},
	{
		symbol: "MADHAVIPL",
		name: "Madhav Infra Projects Limited"
	},
	{
		symbol: "MADRASFERT",
		name: "Madras Fertilizers Limited"
	},
	{
		symbol: "MAFATIND",
		name: "Mafatlal Industries Limited"
	},
	{
		symbol: "MAGADSUGAR",
		name: "Magadh Sugar & Energy Limited"
	},
	{
		symbol: "MAGNUM",
		name: "Magnum Ventures Limited"
	},
	{
		symbol: "MAHABANK",
		name: "Bank of Maharashtra"
	},
	{
		symbol: "MAHAPEXLTD",
		name: "Maha Rashtra Apex Corporation Limited"
	},
	{
		symbol: "MAHEPC",
		name: "Mahindra EPC Irrigation Limited"
	},
	{
		symbol: "MAHLIFE",
		name: "Mahindra Lifespace Developers Limited"
	},
	{
		symbol: "MAHLOG",
		name: "Mahindra Logistics Limited"
	},
	{
		symbol: "MAHSCOOTER",
		name: "Maharashtra Scooters Limited"
	},
	{
		symbol: "MAHSEAMLES",
		name: "Maharashtra Seamless Limited"
	},
	{
		symbol: "MAITHANALL",
		name: "Maithan Alloys Limited"
	},
	{
		symbol: "MAKERSL",
		name: "Makers Laboratories Limited"
	},
	{
		symbol: "MALLCOM",
		name: "Mallcom (India) Limited"
	},
	{
		symbol: "MALUPAPER",
		name: "Malu Paper Mills Limited"
	},
	{
		symbol: "MAMATA",
		name: "Mamata Machinery Limited"
	},
	{
		symbol: "MANAKALUCO",
		name: "Manaksia Aluminium Company Limited"
	},
	{
		symbol: "MANAKCOAT",
		name: "Manaksia Coated Metals & Industries Limited"
	},
	{
		symbol: "MANAKSIA",
		name: "Manaksia Limited"
	},
	{
		symbol: "MANAKSTEEL",
		name: "Manaksia Steels Limited"
	},
	{
		symbol: "MANALIPETC",
		name: "Manali Petrochemicals Limited"
	},
	{
		symbol: "MANAPPURAM",
		name: "Manappuram Finance Limited"
	},
	{
		symbol: "MANBA",
		name: "Manba Finance Limited"
	},
	{
		symbol: "MANBRO",
		name: "Manbro Industries Limited"
	},
	{
		symbol: "MANCREDIT",
		name: "Mangal Credit and Fincorp Limited"
	},
	{
		symbol: "MANGALAM",
		name: "Mangalam Drugs And Organics Limited"
	},
	{
		symbol: "MANGLMCEM",
		name: "Mangalam Cement Limited"
	},
	{
		symbol: "MANINDS",
		name: "Man Industries (India) Limited"
	},
	{
		symbol: "MANINFRA",
		name: "Man Infraconstruction Limited"
	},
	{
		symbol: "MANIPALHOS",
		name: "Manipal Health Enterprises Limited"
	},
	{
		symbol: "MANKIND",
		name: "Mankind Pharma Limited"
	},
	{
		symbol: "MANOMAY",
		name: "Manomay Tex India Limited"
	},
	{
		symbol: "MANORAMA",
		name: "Manorama Industries Limited"
	},
	{
		symbol: "MANORG",
		name: "Mangalam Organics Limited"
	},
	{
		symbol: "MANYAVAR",
		name: "Vedant Fashions Limited"
	},
	{
		symbol: "MAPMYINDIA",
		name: "C.E. Info Systems Limited"
	},
	{
		symbol: "MARALOVER",
		name: "Maral Overseas Limited"
	},
	{
		symbol: "MARATHON",
		name: "Marathon Nextgen Realty Limited"
	},
	{
		symbol: "MARICO",
		name: "Marico Limited"
	},
	{
		symbol: "MARINE",
		name: "Marine Electricals (India) Limited"
	},
	{
		symbol: "MARKOLINES",
		name: "Markolines Pavement Technologies Limited"
	},
	{
		symbol: "MARKSANS",
		name: "Marksans Pharma Limited"
	},
	{
		symbol: "MARSONS",
		name: "Marsons Limited"
	},
	{
		symbol: "MARUTI",
		name: "Maruti Suzuki India Limited"
	},
	{
		symbol: "MASFIN",
		name: "MAS Financial Services Limited"
	},
	{
		symbol: "MASKINVEST",
		name: "Mask Investments Limited"
	},
	{
		symbol: "MASTEK",
		name: "Mastek Limited"
	},
	{
		symbol: "MASTERTR",
		name: "Master Trust Limited"
	},
	{
		symbol: "MATRIMONY",
		name: "Matrimony.Com Limited"
	},
	{
		symbol: "MAWANASUG",
		name: "Mawana Sugars Limited"
	},
	{
		symbol: "MAXESTATES",
		name: "Max Estates Limited"
	},
	{
		symbol: "MAXHEALTH",
		name: "Max Healthcare Institute Limited"
	},
	{
		symbol: "MAXIND",
		name: "Max India Limited"
	},
	{
		symbol: "MAYURUNIQ",
		name: "Mayur Uniquoters Ltd"
	},
	{
		symbol: "MAZDOCK",
		name: "Mazagon Dock Shipbuilders Limited"
	},
	{
		symbol: "MBAPL",
		name: "Madhya Bharat Agro Products Limited"
	},
	{
		symbol: "MBEL",
		name: "M & B Engineering Limited"
	},
	{
		symbol: "MBLINFRA",
		name: "MBL Infrastructure Limited"
	},
	{
		symbol: "MCCHRLS-B",
		name: "Mac Charles India Limited"
	},
	{
		symbol: "MCL",
		name: "M TEK COPPER LIMITED"
	},
	{
		symbol: "MCLEODRUSS",
		name: "Mcleod Russel India Limited"
	},
	{
		symbol: "MCLOUD",
		name: "Magellanic Cloud Limited"
	},
	{
		symbol: "MCX",
		name: "Multi Commodity Exchange of India Limited"
	},
	{
		symbol: "MEDANTA",
		name: "Global Health Limited"
	},
	{
		symbol: "MEDIASSIST",
		name: "Medi Assist Healthcare Services Limited"
	},
	{
		symbol: "MEDICAMEQ",
		name: "Medicamen Biotech Limited"
	},
	{
		symbol: "MEDICAPQ",
		name: "Medi Caps Limited"
	},
	{
		symbol: "MEDICO",
		name: "Medico Remedies Limited"
	},
	{
		symbol: "MEDPLUS",
		name: "Medplus Health Services Limited"
	},
	{
		symbol: "MEESHO",
		name: "Meesho Limited"
	},
	{
		symbol: "MEGASTAR",
		name: "Megastar Foods Limited"
	},
	{
		symbol: "MEIL",
		name: "Mangal Electrical Industries Limited"
	},
	{
		symbol: "MENNPIS",
		name: "Menon Pistons Limited"
	},
	{
		symbol: "MERCANTILE",
		name: "Mercantile Ventures Limited"
	},
	{
		symbol: "MERCURYEV",
		name: "Mercury Ev-Tech Limited"
	},
	{
		symbol: "METROBRAND",
		name: "Metro Brands Limited"
	},
	{
		symbol: "METROGLOBL",
		name: "Metroglobal Limited"
	},
	{
		symbol: "METROPOLIS",
		name: "Metropolis Healthcare Limited"
	},
	{
		symbol: "MFML",
		name: "Mahalaxmi Fabric Mills Limited"
	},
	{
		symbol: "MFSL",
		name: "Max Financial Services Limited"
	},
	{
		symbol: "MGL",
		name: "Mahanagar Gas Limited"
	},
	{
		symbol: "MHRIL",
		name: "Mahindra Holidays & Resorts India Limited"
	},
	{
		symbol: "MIDHANI",
		name: "Mishra Dhatu Nigam Limited"
	},
	{
		symbol: "MIDWESTLTD",
		name: "Midwest Limited"
	},
	{
		symbol: "MIIL",
		name: "Meghna Infracon Infrastructure Limited"
	},
	{
		symbol: "MILKYMIST",
		name: "Milky Mist Dairy Food Limited"
	},
	{
		symbol: "MINDACORP",
		name: "Minda Corporation Limited"
	},
	{
		symbol: "MINDTECK",
		name: "Mindteck (India) Limited"
	},
	{
		symbol: "MIRZAINT",
		name: "Mirza International Limited"
	},
	{
		symbol: "MITTAL",
		name: "Mittal Life Style Limited"
	},
	{
		symbol: "MKEXIM",
		name: "M.K. Exim (India) Limited"
	},
	{
		symbol: "MKPL",
		name: "M K Proteins Limited"
	},
	{
		symbol: "MLKFOOD",
		name: "Milkfood Limited"
	},
	{
		symbol: "MMFL",
		name: "MM Forgings Limited"
	},
	{
		symbol: "MMP",
		name: "MMP Industries Limited"
	},
	{
		symbol: "MMTC",
		name: "MMTC Limited"
	},
	{
		symbol: "MMWL",
		name: "Media Matrix Worldwide Limited"
	},
	{
		symbol: "MOBIKWIK",
		name: "One Mobikwik Systems Limited"
	},
	{
		symbol: "MODINATUR",
		name: "Modi Naturals Limited"
	},
	{
		symbol: "MODIRUBBER",
		name: "Modi Rubber Limited"
	},
	{
		symbol: "MODIS",
		name: "Modis Navnirman Limited"
	},
	{
		symbol: "MODISONLTD",
		name: "MODISON LIMITED"
	},
	{
		symbol: "MODTHREAD",
		name: "Modern Threads (India) Limited"
	},
	{
		symbol: "MOHITE",
		name: "Mohite Industries Limited"
	},
	{
		symbol: "MOHITIND",
		name: "Mohit Industries Limited"
	},
	{
		symbol: "MOIL",
		name: "MOIL Limited"
	},
	{
		symbol: "MOKSH",
		name: "Moksh Ornaments Limited"
	},
	{
		symbol: "MOL",
		name: "Meghmani Organics Limited"
	},
	{
		symbol: "MOLBIO",
		name: "Molbio Diagnostics Limited"
	},
	{
		symbol: "MOLDTKPAC",
		name: "Mold-Tek Packaging Limited"
	},
	{
		symbol: "MONARCH",
		name: "Monarch Networth Capital Limited"
	},
	{
		symbol: "MONEYBOXX",
		name: "Moneyboxx Finance Limited"
	},
	{
		symbol: "MONTECARLO",
		name: "Monte Carlo Fashions Limited"
	},
	{
		symbol: "MOREPENLAB",
		name: "Morepen Laboratories Limited"
	},
	{
		symbol: "MOSCHIP",
		name: "Moschip Technologies Limited"
	},
	{
		symbol: "MOTHERSON",
		name: "Samvardhana Motherson International Limited"
	},
	{
		symbol: "MOTILALOFS",
		name: "Motilal Oswal Financial Services Limited"
	},
	{
		symbol: "MOTISONS",
		name: "Motisons Jewellers Limited"
	},
	{
		symbol: "MPHASIS",
		name: "MphasiS Limited"
	},
	{
		symbol: "MPSLTD",
		name: "MPS Limited"
	},
	{
		symbol: "MRF",
		name: "MRF Limited"
	},
	{
		symbol: "MRPL",
		name: "Mangalore Refinery and Petrochemicals Limited"
	},
	{
		symbol: "MSL",
		name: "Mangalam Seeds Limited"
	},
	{
		symbol: "MSPL",
		name: "MSP Steel & Power Limited"
	},
	{
		symbol: "MSTCLTD",
		name: "Mstc Limited"
	},
	{
		symbol: "MSUMI",
		name: "Motherson Sumi Wiring India Limited"
	},
	{
		symbol: "MTNL",
		name: "Mahanagar Telephone Nigam Limited"
	},
	{
		symbol: "MUFIN",
		name: "Mufin Green Finance Limited"
	},
	{
		symbol: "MUFTI",
		name: "Credo Brands Marketing Limited"
	},
	{
		symbol: "MUKANDLTD",
		name: "Mukand Limited"
	},
	{
		symbol: "MUKESHB",
		name: "Mukesh Babu Financial Services Limited"
	},
	{
		symbol: "MUKKA",
		name: "Mukka Proteins Limited"
	},
	{
		symbol: "MUNJALAU",
		name: "Munjal Auto Industries Limited"
	},
	{
		symbol: "MUNJALSHOW",
		name: "Munjal Showa Limited"
	},
	{
		symbol: "MURUDCERA",
		name: "Murudeshwar Ceramics Limited"
	},
	{
		symbol: "MUTHOOTCAP",
		name: "Muthoot Capital Services Limited"
	},
	{
		symbol: "MUTHOOTFIN",
		name: "Muthoot Finance Limited"
	},
	{
		symbol: "MUTHOOTMF",
		name: "Muthoot Microfin Limited"
	},
	{
		symbol: "MVELECTRO",
		name: "MV Electrosystems Limited"
	},
	{
		symbol: "MVGJL",
		name: "Manoj Vaibhav Gems N Jewellers Limited"
	},
	{
		symbol: "MWL",
		name: "Mangalam Worldwide Limited"
	},
	{
		symbol: "NACLIND",
		name: "NACL Industries Limited"
	},
	{
		symbol: "NAGREEKCAP",
		name: "Nagreeka Capital & Infrastructure Limited"
	},
	{
		symbol: "NAGREEKEXP",
		name: "Nagreeka Exports Limited"
	},
	{
		symbol: "NAHARCAP",
		name: "Nahar Capital and Financial Services Limited"
	},
	{
		symbol: "NAHARINDUS",
		name: "Nahar Industrial Enterprises Limited"
	},
	{
		symbol: "NAHARPOLY",
		name: "Nahar Poly Films Limited"
	},
	{
		symbol: "NAHARSPING",
		name: "Nahar Spinning Mills Limited"
	},
	{
		symbol: "NAM-INDIA",
		name: "Nippon Life India Asset Management Limited"
	},
	{
		symbol: "NARMADA",
		name: "Narmada Agrobase Limited"
	},
	{
		symbol: "NATCAPSUQ",
		name: "Natural Capsules Limited"
	},
	{
		symbol: "NATCOPHARM",
		name: "Natco Pharma Limited"
	},
	{
		symbol: "NATHBIOGEN",
		name: "Nath Bio-Genes (India) Limited"
	},
	{
		symbol: "NATIONALUM",
		name: "National Aluminium Company Limited"
	},
	{
		symbol: "NATIONSTD",
		name: "National Standard (India) Limited"
	},
	{
		symbol: "NAUKRI",
		name: "Info Edge (India) Limited"
	},
	{
		symbol: "NAVA",
		name: "NAVA LIMITED"
	},
	{
		symbol: "NAVINFLUOR",
		name: "Navin Fluorine International Limited"
	},
	{
		symbol: "NAVKARCORP",
		name: "Navkar Corporation Limited"
	},
	{
		symbol: "NAVNETEDUL",
		name: "Navneet Education Limited"
	},
	{
		symbol: "NAZARA",
		name: "Nazara Technologies Limited"
	},
	{
		symbol: "NBCC",
		name: "NBCC (India) Limited"
	},
	{
		symbol: "NBIFIN",
		name: "N. B. I. Industrial Finance Company Limited"
	},
	{
		symbol: "NCC",
		name: "NCC Limited"
	},
	{
		symbol: "NCLIND",
		name: "NCL Industries Limited"
	},
	{
		symbol: "NDGL",
		name: "Naga Dhunseri Group Limited"
	},
	{
		symbol: "NDL",
		name: "Nandan Denim Limited"
	},
	{
		symbol: "NDLVENTURE",
		name: "NDL Ventures Limited"
	},
	{
		symbol: "NDRAUTO",
		name: "Ndr Auto Components Limited"
	},
	{
		symbol: "NDTV",
		name: "New Delhi Television Limited"
	},
	{
		symbol: "NEAGI",
		name: "Neelamalai Agro Industries Limited"
	},
	{
		symbol: "NECLIFE",
		name: "Nectar Lifesciences Limited"
	},
	{
		symbol: "NELCAST",
		name: "Nelcast Limited"
	},
	{
		symbol: "NELCO",
		name: "NELCO Limited"
	},
	{
		symbol: "NEOGEN",
		name: "Neogen Chemicals Limited"
	},
	{
		symbol: "NEPHROPLUS",
		name: "Nephrocare Health Services Limited"
	},
	{
		symbol: "NESCO",
		name: "Nesco Limited"
	},
	{
		symbol: "NESTLEIND",
		name: "Nestle India Limited"
	},
	{
		symbol: "NETWEB",
		name: "Netweb Technologies India Limited"
	},
	{
		symbol: "NETWORK18",
		name: "Network18 Media & Investments Limited"
	},
	{
		symbol: "NEULANDLAB",
		name: "Neuland Laboratories Limited"
	},
	{
		symbol: "NEWGEN",
		name: "Newgen Software Technologies Limited"
	},
	{
		symbol: "NEXTMEDIA",
		name: "Next Mediaworks Limited"
	},
	{
		symbol: "NFL",
		name: "National Fertilizers Limited"
	},
	{
		symbol: "NGIL",
		name: "Nakoda Group of Industries Limited"
	},
	{
		symbol: "NGLFINE",
		name: "NGL Fine-Chem Limited"
	},
	{
		symbol: "NH",
		name: "Narayana Hrudayalaya Ltd."
	},
	{
		symbol: "NHPC",
		name: "NHPC Limited"
	},
	{
		symbol: "NIACL",
		name: "The New India Assurance Company Limited"
	},
	{
		symbol: "NIBE",
		name: "NIBE Limited"
	},
	{
		symbol: "NIBL",
		name: "NRB Industrial Bearings Limited"
	},
	{
		symbol: "NICCOPAR",
		name: "Nicco Parks & Resorts Limited"
	},
	{
		symbol: "NIITLTD",
		name: "NIIT Limited"
	},
	{
		symbol: "NIITMTS",
		name: "NIIT Learning Systems Limited"
	},
	{
		symbol: "NILAINFRA",
		name: "Nila Infrastructures Limited"
	},
	{
		symbol: "NILASPACES",
		name: "Nila Spaces Limited"
	},
	{
		symbol: "NILE",
		name: "Nile Limited"
	},
	{
		symbol: "NILKAMAL",
		name: "Nilkamal Limited"
	},
	{
		symbol: "NIMBSPROJ",
		name: "Nimbus Projects Limited"
	},
	{
		symbol: "NINSYS",
		name: "NINtec Systems Limited"
	},
	{
		symbol: "NIPPOBATRY",
		name: "Indo-National Limited"
	},
	{
		symbol: "NIRAJ",
		name: "Niraj Cement Structurals Limited"
	},
	{
		symbol: "NIRAJISPAT",
		name: "Niraj Ispat Industries Limited"
	},
	{
		symbol: "NIRLON",
		name: "Nirlon Limited"
	},
	{
		symbol: "NITCO",
		name: "Nitco Limited"
	},
	{
		symbol: "NITINSPIN",
		name: "Nitin Spinners Limited"
	},
	{
		symbol: "NITIRAJ",
		name: "Nitiraj Engineers Limited"
	},
	{
		symbol: "NITTAGELA",
		name: "Nitta Gelatin India Limited"
	},
	{
		symbol: "NIVABUPA",
		name: "Niva Bupa Health Insurance Company Limited"
	},
	{
		symbol: "NKIND",
		name: "NK Industries Limited"
	},
	{
		symbol: "NLCINDIA",
		name: "NLC India Limited"
	},
	{
		symbol: "NMDC",
		name: "NMDC Limited"
	},
	{
		symbol: "NOCIL",
		name: "NOCIL Limited"
	},
	{
		symbol: "NOIDATOLL",
		name: "Noida Toll Bridge Company Limited"
	},
	{
		symbol: "NORBTEAEXP",
		name: "Norben Tea & Exports Limited"
	},
	{
		symbol: "NORTHARC",
		name: "Northern Arc Capital Limited"
	},
	{
		symbol: "NOVARTIND",
		name: "Novartis India Limited"
	},
	{
		symbol: "NPST",
		name: "Network People Services Technologies Limited"
	},
	{
		symbol: "NRAIL",
		name: "N R Agarwal Industries Limited"
	},
	{
		symbol: "NRBBEARING",
		name: "NRB Bearing Limited"
	},
	{
		symbol: "NSIL",
		name: "Nalwa Sons Investments Limited"
	},
	{
		symbol: "NSLNISP",
		name: "NMDC Steel Limited"
	},
	{
		symbol: "NTCIND",
		name: "NTC Industries Limited"
	},
	{
		symbol: "NTPC",
		name: "NTPC Limited"
	},
	{
		symbol: "NTPCGREEN",
		name: "NTPC Green Energy Limited"
	},
	{
		symbol: "NUCLEUS",
		name: "Nucleus Software Exports Limited"
	},
	{
		symbol: "NUVAMA",
		name: "Nuvama Wealth Management Limited"
	},
	{
		symbol: "NUVOCO",
		name: "Nuvoco Vistas Corporation Limited"
	},
	{
		symbol: "NYKAA",
		name: "FSN E-Commerce Ventures Limited"
	},
	{
		symbol: "OAL",
		name: "Oriental Aromatics Limited"
	},
	{
		symbol: "OBCL",
		name: "OBCL Limited"
	},
	{
		symbol: "OBEROIRLTY",
		name: "Oberoi Realty Limited"
	},
	{
		symbol: "ODIGMA",
		name: "Odigma Consultancy Solutions Limited"
	},
	{
		symbol: "ODYCORP",
		name: "Odyssey Corporation Limited"
	},
	{
		symbol: "OFSS",
		name: "Oracle Financial Services Software Limited"
	},
	{
		symbol: "OIL",
		name: "Oil India Limited"
	},
	{
		symbol: "OLAELEC",
		name: "Ola Electric Mobility Limited"
	},
	{
		symbol: "OLECTRA",
		name: "Olectra Greentech Limited"
	},
	{
		symbol: "OMAXAUTO",
		name: "Omax Autos Limited"
	},
	{
		symbol: "OMAXE",
		name: "Omaxe Limited"
	},
	{
		symbol: "OMINFRAL",
		name: "OM INFRA LIMITED"
	},
	{
		symbol: "OMNI",
		name: "Omnitech Engineering Limited"
	},
	{
		symbol: "OMPOWER",
		name: "Om Power Transmission Limited"
	},
	{
		symbol: "ONEGLOBAL",
		name: "One Global Service Provider Limited"
	},
	{
		symbol: "ONEPOINT",
		name: "One Point One Solutions Limited"
	},
	{
		symbol: "ONESOURCE",
		name: "Onesource Specialty Pharma Limited"
	},
	{
		symbol: "ONGC",
		name: "Oil & Natural Gas Corporation Limited"
	},
	{
		symbol: "ONIDA",
		name: "Onida Electronics Limited"
	},
	{
		symbol: "ONIXSOLAR",
		name: "Onix Solar Energy Limited"
	},
	{
		symbol: "ONWARDTEC",
		name: "Onward Technologies Limited"
	},
	{
		symbol: "OPTIEMUS",
		name: "Optiemus Infracom Limited"
	},
	{
		symbol: "OPTIFIN",
		name: "Optimus Finance Limited"
	},
	{
		symbol: "ORCHASP",
		name: "Orchasp Limited"
	},
	{
		symbol: "ORCHPHARMA",
		name: "Orchid Pharma Limited"
	},
	{
		symbol: "ORICONENT",
		name: "Oricon Enterprises Limited"
	},
	{
		symbol: "ORIENTALTL",
		name: "Oriental Trimex Limited"
	},
	{
		symbol: "ORIENTBELL",
		name: "Orient Bell Limited"
	},
	{
		symbol: "ORIENTCEM",
		name: "Orient Cement Limited"
	},
	{
		symbol: "ORIENTCER",
		name: "ORIENT CERATECH LIMITED"
	},
	{
		symbol: "ORIENTELEC",
		name: "Orient Electric Limited"
	},
	{
		symbol: "ORIENTHOT",
		name: "Oriental Hotels Limited"
	},
	{
		symbol: "ORIENTPPR",
		name: "Orient Paper & Industries Limited"
	},
	{
		symbol: "ORIENTTECH",
		name: "Orient Technologies Limited"
	},
	{
		symbol: "ORIRAIL",
		name: "Oriental Rail Infrastructure Limited"
	},
	{
		symbol: "ORISSAMINE",
		name: "The Orissa Minerals Development Company Limited"
	},
	{
		symbol: "ORKLAINDIA",
		name: "Orkla India Limited"
	},
	{
		symbol: "ORTINGLOBE",
		name: "ORTIN GLOBAL LIMITED"
	},
	{
		symbol: "OSWALAGRO",
		name: "Oswal Agro Mills Limited"
	},
	{
		symbol: "OSWALGREEN",
		name: "Oswal Greentech Limited"
	},
	{
		symbol: "OSWALPUMPS",
		name: "Oswal Pumps Limited"
	},
	{
		symbol: "OSWALSEEDS",
		name: "ShreeOswal Seeds And Chemicals Limited"
	},
	{
		symbol: "PACEDIGITK",
		name: "Pace Digitek Limited"
	},
	{
		symbol: "PACIFICI",
		name: "Pacific Industries Limited"
	},
	{
		symbol: "PAGEIND",
		name: "Page Industries Limited"
	},
	{
		symbol: "PAISALO",
		name: "Paisalo Digital Limited"
	},
	{
		symbol: "PAKKA",
		name: "PAKKA LIMITED"
	},
	{
		symbol: "PALASHSECU",
		name: "Palash Securities Limited"
	},
	{
		symbol: "PANACEABIO",
		name: "Panacea Biotec Limited"
	},
	{
		symbol: "PANAMAPET",
		name: "Panama Petrochem Limited"
	},
	{
		symbol: "PANCHMAHQ",
		name: "Panchmahal Steel Limited"
	},
	{
		symbol: "PANORAMA",
		name: "Panorama Studios International Limited"
	},
	{
		symbol: "PANSARI",
		name: "Pansari Developers Limited"
	},
	{
		symbol: "PAR",
		name: "Par Drugs And Chemicals Limited"
	},
	{
		symbol: "PARACABLES",
		name: "Paramount Communications Limited"
	},
	{
		symbol: "PARADEEP",
		name: "Paradeep Phosphates Limited"
	},
	{
		symbol: "PARAGMILK",
		name: "Parag Milk Foods Limited"
	},
	{
		symbol: "PARAS",
		name: "Paras Defence and Space Technologies Limited"
	},
	{
		symbol: "PARASPETRO",
		name: "Paras Petrofils Limited"
	},
	{
		symbol: "PARKHOSPS",
		name: "Park Medi World Limited"
	},
	{
		symbol: "PARKHOTELS",
		name: "Apeejay Surrendra Park Hotels Limited"
	},
	{
		symbol: "PARNAXLAB",
		name: "Parnax Lab Limited"
	},
	{
		symbol: "PASHUPATI",
		name: "Pashupati Cotspin Limited"
	},
	{
		symbol: "PATANJALI",
		name: "Patanjali Foods Limited"
	},
	{
		symbol: "PATELENG",
		name: "Patel Engineering Limited"
	},
	{
		symbol: "PATELRMART",
		name: "Patel Retail Limited"
	},
	{
		symbol: "PAUSHAKLTD",
		name: "Paushak Limited"
	},
	{
		symbol: "PAVNAIND",
		name: "Pavna Industries Limited"
	},
	{
		symbol: "PAYTM",
		name: "One 97 Communications Limited"
	},
	{
		symbol: "PBMPOLY",
		name: "PBM Polytex Limited"
	},
	{
		symbol: "PCBL",
		name: "PCBL Chemical Limited"
	},
	{
		symbol: "PCJEWELLER",
		name: "PC Jeweller Limited"
	},
	{
		symbol: "PDMJEPAPER",
		name: "Pudumjee Paper Products Limited"
	},
	{
		symbol: "PDSL",
		name: "PDS Limited"
	},
	{
		symbol: "PEARLPOLY",
		name: "Pearl Polymers Limited"
	},
	{
		symbol: "PENIND",
		name: "Pennar Industries Limited"
	},
	{
		symbol: "PERMAGN",
		name: "Permanent Magnets Limited"
	},
	{
		symbol: "PERSISTENT",
		name: "Persistent Systems Limited"
	},
	{
		symbol: "PETRONET",
		name: "Petronet LNG Limited"
	},
	{
		symbol: "PFC",
		name: "Power Finance Corporation Limited"
	},
	{
		symbol: "PFIZER",
		name: "Pfizer Limited"
	},
	{
		symbol: "PFOCUS",
		name: "Prime Focus Limited"
	},
	{
		symbol: "PFS",
		name: "PTC India Financial Services Limited"
	},
	{
		symbol: "PGEL",
		name: "PG Electroplast Limited"
	},
	{
		symbol: "PGHH",
		name: "Procter & Gamble Hygiene and Health Care Limited"
	},
	{
		symbol: "PGHL",
		name: "Procter & Gamble Health Limited"
	},
	{
		symbol: "PGIL",
		name: "Pearl Global Industries Limited"
	},
	{
		symbol: "PHOENIXLTD",
		name: "The Phoenix Mills Limited"
	},
	{
		symbol: "PHOENXINTL",
		name: "Phoenix International Limited"
	},
	{
		symbol: "PICCADIL",
		name: "Piccadily Agro Industries Limited"
	},
	{
		symbol: "PIDILITIND",
		name: "Pidilite Industries Limited"
	},
	{
		symbol: "PIGL",
		name: "Power & Instrumentation (Gujarat) Limited"
	},
	{
		symbol: "PIIND",
		name: "PI Industries Limited"
	},
	{
		symbol: "PILANIINVS",
		name: "Pilani Investment and Industries Corporation Limited"
	},
	{
		symbol: "PILITA",
		name: "PIL ITALICA LIFESTYLE LIMITED"
	},
	{
		symbol: "PINELABS",
		name: "Pine Labs Limited"
	},
	{
		symbol: "PIONEEREMB",
		name: "Pioneer Embroideries Limited"
	},
	{
		symbol: "PIRAMALFIN",
		name: "Piramal Finance Limited"
	},
	{
		symbol: "PITTIENG",
		name: "Pitti Engineering Limited"
	},
	{
		symbol: "PIXTRANS",
		name: "Pix Transmissions Limited"
	},
	{
		symbol: "PKTEA",
		name: "The Peria Karamalai Tea & Produce Company Limited"
	},
	{
		symbol: "PLASTIBLEN",
		name: "Plastiblends India Limited"
	},
	{
		symbol: "PLATIND",
		name: "Platinum Industries Limited"
	},
	{
		symbol: "PLAZACABLE",
		name: "Plaza Wires Limited"
	},
	{
		symbol: "PML",
		name: "Paul Merchants Limited"
	},
	{
		symbol: "PNB",
		name: "Punjab National Bank"
	},
	{
		symbol: "PNBGILTS",
		name: "PNB Gilts Limited"
	},
	{
		symbol: "PNBHOUSING",
		name: "PNB Housing Finance Limited"
	},
	{
		symbol: "PNC",
		name: "Pritish Nandy Communications Limited"
	},
	{
		symbol: "PNCINFRA",
		name: "PNC Infratech Limited"
	},
	{
		symbol: "PNGJL",
		name: "P N Gadgil Jewellers Limited"
	},
	{
		symbol: "PNGSREVA",
		name: "PNGS Reva Diamond Jewellery Limited"
	},
	{
		symbol: "POCL",
		name: "Pondy Oxides & Chemicals Limited"
	},
	{
		symbol: "PODDARMENT",
		name: "Poddar Pigments Limited"
	},
	{
		symbol: "POEL",
		name: "POCL Enterprises Limited"
	},
	{
		symbol: "POKARNA",
		name: "Pokarna Limited"
	},
	{
		symbol: "POLICYBZR",
		name: "PB Fintech Limited"
	},
	{
		symbol: "POLYCAB",
		name: "Polycab India Limited"
	},
	{
		symbol: "POLYMED",
		name: "Poly Medicure Limited"
	},
	{
		symbol: "POLYPLEX",
		name: "Polyplex Corporation Limited"
	},
	{
		symbol: "POLYSPIN",
		name: "Polyspin Exports Limited"
	},
	{
		symbol: "PONNIERODE",
		name: "Ponni Sugars (Erode) Limited"
	},
	{
		symbol: "POONAWALLA",
		name: "Poonawalla Fincorp Limited"
	},
	{
		symbol: "POWERGRID",
		name: "Power Grid Corporation of India Limited"
	},
	{
		symbol: "POWERICA",
		name: "Powerica Limited"
	},
	{
		symbol: "POWERINDIA",
		name: "Hitachi Energy India Limited"
	},
	{
		symbol: "POWERMECH",
		name: "Power Mech Projects Limited"
	},
	{
		symbol: "PPLPHARMA",
		name: "Piramal Pharma Limited"
	},
	{
		symbol: "PRABHA",
		name: "Prabha Energy Limited"
	},
	{
		symbol: "PRAENG",
		name: "Prajay Engineers Syndicate Limited"
	},
	{
		symbol: "PRAJIND",
		name: "Praj Industries Limited"
	},
	{
		symbol: "PRAKASH",
		name: "Prakash Industries Limited"
	},
	{
		symbol: "PRAKASHSTL",
		name: "Prakash Steelage Limited"
	},
	{
		symbol: "PRAVEG",
		name: "Praveg Limited"
	},
	{
		symbol: "PRAXIS",
		name: "Praxis Home Retail Limited"
	},
	{
		symbol: "PRECAM",
		name: "Precision Camshafts Limited"
	},
	{
		symbol: "PRECOT",
		name: "Precot Limited"
	},
	{
		symbol: "PRECWIRE",
		name: "Precision Wires India Limited"
	},
	{
		symbol: "PREMCO",
		name: "Premco Global Limited"
	},
	{
		symbol: "PREMEXPLN",
		name: "Premier Explosives Limited"
	},
	{
		symbol: "PREMIERENE",
		name: "Premier Energies Limited"
	},
	{
		symbol: "PREMIERPOL",
		name: "Premier Polyfilm Limited"
	},
	{
		symbol: "PRESTIGE",
		name: "Prestige Estates Projects Limited"
	},
	{
		symbol: "PRICOLLTD",
		name: "Pricol Limited"
	},
	{
		symbol: "PRIMESECU",
		name: "Prime Securities Limited"
	},
	{
		symbol: "PRIMO",
		name: "Primo Chemicals Limited"
	},
	{
		symbol: "PRINCEPIPE",
		name: "Prince Pipes And Fittings Limited"
	},
	{
		symbol: "PRISMX",
		name: "Prismx Global Ventures Limited"
	},
	{
		symbol: "PRIVISCL",
		name: "Privi Speciality Chemicals Limited"
	},
	{
		symbol: "PROSTARM",
		name: "Prostarm Info Systems Limited"
	},
	{
		symbol: "PROTEAN",
		name: "Protean eGov Technologies Limited"
	},
	{
		symbol: "PROZONER",
		name: "Prozone Realty Limited"
	},
	{
		symbol: "PRSMJOHNSN",
		name: "Prism Johnson Limited"
	},
	{
		symbol: "PRUDENT",
		name: "Prudent Corporate Advisory Services Limited"
	},
	{
		symbol: "PSB",
		name: "Punjab & Sind Bank"
	},
	{
		symbol: "PSPPROJECT",
		name: "PSP Projects Limited"
	},
	{
		symbol: "PTC",
		name: "PTC India Limited"
	},
	{
		symbol: "PTCIL",
		name: "PTC Industries Limited"
	},
	{
		symbol: "PTL",
		name: "PTL Enterprises Limited"
	},
	{
		symbol: "PUNJABCHEM",
		name: "Punjab Chemicals & Crop Protection Limited"
	},
	{
		symbol: "PURVA",
		name: "Puravankara Limited"
	},
	{
		symbol: "PVP",
		name: "PVP Ventures Limited"
	},
	{
		symbol: "PVRINOX",
		name: "PVR INOX Limited"
	},
	{
		symbol: "PVSL",
		name: "Popular Vehicles and Services Limited"
	},
	{
		symbol: "PWL",
		name: "Physicswallah Limited"
	},
	{
		symbol: "PYRAMID",
		name: "Pyramid Technoplast Limited"
	},
	{
		symbol: "QPOWER",
		name: "Quality Power Electrical Equipments Limited"
	},
	{
		symbol: "QUADFUTURE",
		name: "Quadrant Future Tek Limited"
	},
	{
		symbol: "QUESS",
		name: "Quess Corp Limited"
	},
	{
		symbol: "QUINT",
		name: "Quint Digital Limited"
	},
	{
		symbol: "RACE",
		name: "Race Eco Chain Limited"
	},
	{
		symbol: "RACLGEAR",
		name: "RACL Geartech Limited"
	},
	{
		symbol: "RADAAN",
		name: "Radaan Mediaworks India Limited"
	},
	{
		symbol: "RADHIKAJWE",
		name: "Radhika Jeweltech Limited"
	},
	{
		symbol: "RADIANTCMS",
		name: "Radiant Cash Management Services Limited"
	},
	{
		symbol: "RADICO",
		name: "Radico Khaitan Limited"
	},
	{
		symbol: "RADIOCITY",
		name: "Music Broadcast Limited"
	},
	{
		symbol: "RAILTEL",
		name: "Railtel Corporation Of India Limited"
	},
	{
		symbol: "RAIN",
		name: "Rain Industries Limited"
	},
	{
		symbol: "RAINBOW",
		name: "Rainbow Childrens Medicare Limited"
	},
	{
		symbol: "RAJMET",
		name: "Rajnandini Metal Limited"
	},
	{
		symbol: "RAJPALAYAM",
		name: "Rajapalayam Mills Limited"
	},
	{
		symbol: "RAJRATAN",
		name: "Rajratan Global Wire Limited"
	},
	{
		symbol: "RAJSREESUG",
		name: "Rajshree Sugars & Chemicals Limited"
	},
	{
		symbol: "RAJTV",
		name: "Raj Television Network Limited"
	},
	{
		symbol: "RALLIS",
		name: "Rallis India Limited"
	},
	{
		symbol: "RAMANEWS",
		name: "Shree Rama Newsprint Limited"
	},
	{
		symbol: "RAMAPHO",
		name: "Rama Phosphates Limited"
	},
	{
		symbol: "RAMBHAJO",
		name: "Advit Jewels Limited"
	},
	{
		symbol: "RAMCOCEM",
		name: "The Ramco Cements Limited"
	},
	{
		symbol: "RAMCOIND",
		name: "Ramco Industries Limited"
	},
	{
		symbol: "RAMCOSYS",
		name: "Ramco Systems Limited"
	},
	{
		symbol: "RAMKY",
		name: "Ramky Infrastructure Limited"
	},
	{
		symbol: "RAMRAT",
		name: "Ram Ratna Wires Limited"
	},
	{
		symbol: "RANASUG",
		name: "Rana Sugars Limited"
	},
	{
		symbol: "RANEHOLDIN",
		name: "Rane Holdings Limited"
	},
	{
		symbol: "RATEGAIN",
		name: "Rategain Travel Technologies Limited"
	},
	{
		symbol: "RATNAMANI",
		name: "Ratnamani Metals & Tubes Limited"
	},
	{
		symbol: "RATNAVEER",
		name: "Ratnaveer Precision Engineering Limited"
	},
	{
		symbol: "RAYMOND",
		name: "Raymond Limited"
	},
	{
		symbol: "RAYMONDLSL",
		name: "Raymond Lifestyle Limited"
	},
	{
		symbol: "RAYMONDREL",
		name: "Raymond Realty Limited"
	},
	{
		symbol: "RBA",
		name: "Restaurant Brands Asia Limited"
	},
	{
		symbol: "RBLBANK",
		name: "RBL Bank Limited"
	},
	{
		symbol: "RBZJEWEL",
		name: "RBZ Jewellers Limited"
	},
	{
		symbol: "RCF",
		name: "Rashtriya Chemicals and Fertilizers Limited"
	},
	{
		symbol: "RECLTD",
		name: "REC Limited"
	},
	{
		symbol: "REDINGTON",
		name: "Redington Limited"
	},
	{
		symbol: "REDTAPE",
		name: "Redtape Limited"
	},
	{
		symbol: "REFEX",
		name: "Refex Industries Limited"
	},
	{
		symbol: "REGAAL",
		name: "Regaal Resources Limited"
	},
	{
		symbol: "REGENCERAM",
		name: "Regency Ceramics Limited"
	},
	{
		symbol: "RELAXO",
		name: "Relaxo Footwears Limited"
	},
	{
		symbol: "RELCHEMQ",
		name: "Reliance Chemotex Industries Limited"
	},
	{
		symbol: "RELIABLE",
		name: "Reliable Data Services Limited"
	},
	{
		symbol: "RELIANCE",
		name: "Reliance Industries Limited"
	},
	{
		symbol: "RELIGARE",
		name: "Religare Enterprises Limited"
	},
	{
		symbol: "RELTD",
		name: "Ravindra Energy Limited"
	},
	{
		symbol: "REMSONSIND",
		name: "Remsons Industries Limited"
	},
	{
		symbol: "RENUKA",
		name: "Shree Renuka Sugars Limited"
	},
	{
		symbol: "REPCOHOME",
		name: "Repco Home Finance Limited"
	},
	{
		symbol: "REPRO",
		name: "Repro India Limited"
	},
	{
		symbol: "RESPONIND",
		name: "Responsive Industries Limited"
	},
	{
		symbol: "RETAIL",
		name: "JHS Svendgaard Retail Ventures Limited"
	},
	{
		symbol: "RGL",
		name: "Renaissance Global Limited"
	},
	{
		symbol: "RHETAN",
		name: "Rhetan TMT Limited"
	},
	{
		symbol: "RHIM",
		name: "RHI MAGNESITA INDIA LIMITED"
	},
	{
		symbol: "RHL",
		name: "Robust Hotels Limited"
	},
	{
		symbol: "RICOAUTO",
		name: "Rico Auto Industries Limited"
	},
	{
		symbol: "RIIL",
		name: "Reliance Industrial Infrastructure Limited"
	},
	{
		symbol: "RIR",
		name: "RIR Power Electronics Limited"
	},
	{
		symbol: "RISHABH",
		name: "Rishabh Instruments Limited"
	},
	{
		symbol: "RITCO",
		name: "Ritco Logistics Limited"
	},
	{
		symbol: "RITES",
		name: "RITES Limited"
	},
	{
		symbol: "RKDL",
		name: "Ravi Kumar Distilleries Limited"
	},
	{
		symbol: "RKEC",
		name: "RKEC Projects Limited"
	},
	{
		symbol: "RKFORGE",
		name: "Ramkrishna Forgings Limited"
	},
	{
		symbol: "RKSWAMY",
		name: "R K Swamy Limited"
	},
	{
		symbol: "RMC",
		name: "RMC Switchgears Limited"
	},
	{
		symbol: "RML",
		name: "Rane (Madras) Limited"
	},
	{
		symbol: "RNBDENIMS",
		name: "R&B Denims Limited"
	},
	{
		symbol: "ROHLTD",
		name: "Royal Orchid Hotels Limited"
	},
	{
		symbol: "ROLEXRINGS",
		name: "Rolex Rings Limited"
	},
	{
		symbol: "ROML",
		name: "Raj Oil Mills Limited"
	},
	{
		symbol: "ROSSARI",
		name: "Rossari Biotech Limited"
	},
	{
		symbol: "ROSSELLIND",
		name: "Rossell India Limited"
	},
	{
		symbol: "ROSSTECH",
		name: "Rossell Techsys Limited"
	},
	{
		symbol: "ROTO",
		name: "Roto Pumps Limited"
	},
	{
		symbol: "ROUTE",
		name: "ROUTE MOBILE LIMITED"
	},
	{
		symbol: "RPEL",
		name: "Raghav Productivity Enhancers Limited"
	},
	{
		symbol: "RPGLIFE",
		name: "RPG Life Sciences Limited"
	},
	{
		symbol: "RPOWER",
		name: "Reliance Power Limited"
	},
	{
		symbol: "RPPINFRA",
		name: "R.P.P. Infra Projects Limited"
	},
	{
		symbol: "RPSGVENT",
		name: "RPSG VENTURES LIMITED"
	},
	{
		symbol: "RPTECH",
		name: "Rashi Peripherals Limited"
	},
	{
		symbol: "RRECL",
		name: "RDB Real Estate Constructions Limited"
	},
	{
		symbol: "RRIL",
		name: "RRIL Limited"
	},
	{
		symbol: "RRKABEL",
		name: "R R Kabel Limited"
	},
	{
		symbol: "RSL",
		name: "Rajputana Stainless Limited"
	},
	{
		symbol: "RSSOFTWARE",
		name: "R. S. Software (India) Limited"
	},
	{
		symbol: "RSYSTEMS",
		name: "R Systems International Limited"
	},
	{
		symbol: "RTNINDIA",
		name: "RattanIndia Enterprises Limited"
	},
	{
		symbol: "RTNPOWER",
		name: "RattanIndia Power Limited"
	},
	{
		symbol: "RTSPOWR",
		name: "RTS Power Corporation Limited"
	},
	{
		symbol: "RUBFILA",
		name: "Rubfila International Limited"
	},
	{
		symbol: "RUBICON",
		name: "Rubicon Research Limited"
	},
	{
		symbol: "RUCHINFRA",
		name: "Ruchi Infrastructure Limited"
	},
	{
		symbol: "RUCHIRA",
		name: "Ruchira Papers Limited"
	},
	{
		symbol: "RUDRA",
		name: "Rudra Global Infra Products Limited"
	},
	{
		symbol: "RUPA",
		name: "Rupa & Company Limited"
	},
	{
		symbol: "RUSHIL",
		name: "Rushil Decor Limited"
	},
	{
		symbol: "RUSTOMJEE",
		name: "Keystone Realtors Limited"
	},
	{
		symbol: "RVHL",
		name: "Ravinder Heights Limited"
	},
	{
		symbol: "RVNL",
		name: "Rail Vikas Nigam Limited"
	},
	{
		symbol: "RVTH",
		name: "Revathi Equipment India Limited"
	},
	{
		symbol: "S&SPOWER",
		name: "S&S Power Switchgears Limited"
	},
	{
		symbol: "SAATVIKGL",
		name: "Saatvik Green Energy Limited"
	},
	{
		symbol: "SAB",
		name: "SAB Industries Limited"
	},
	{
		symbol: "SADBHAV",
		name: "Sadbhav Engineering Limited"
	},
	{
		symbol: "SAFARI",
		name: "Safari Industries (India) Limited"
	},
	{
		symbol: "SAGARDEEP",
		name: "Sagardeep Alloys Limited"
	},
	{
		symbol: "SAGCEM",
		name: "Sagar Cements Limited"
	},
	{
		symbol: "SAGILITY",
		name: "SAGILITY LIMITED"
	},
	{
		symbol: "SAHLIBHFI",
		name: "Shalibhadra Finance Limited"
	},
	{
		symbol: "SAHYADRI",
		name: "Sahyadri Industries Limited"
	},
	{
		symbol: "SAICAPI",
		name: "Sai Capital Limited"
	},
	{
		symbol: "SAIL",
		name: "Steel Authority of India Limited"
	},
	{
		symbol: "SAILIFE",
		name: "Sai Life Sciences Limited"
	},
	{
		symbol: "SAIPARENT",
		name: "Sai Parenterals Limited"
	},
	{
		symbol: "SAKAR",
		name: "Sakar Healthcare Limited"
	},
	{
		symbol: "SAKHTISUG",
		name: "Sakthi Sugars Limited"
	},
	{
		symbol: "SAKSOFT",
		name: "Saksoft Limited"
	},
	{
		symbol: "SAKUMA",
		name: "Sakuma Exports Limited"
	},
	{
		symbol: "SALASAR",
		name: "Salasar Techno Engineering Limited"
	},
	{
		symbol: "SALONA",
		name: "Salona Cotspin Limited"
	},
	{
		symbol: "SALSTEEL",
		name: "S.A.L. Steel Limited"
	},
	{
		symbol: "SALZERELEC",
		name: "Salzer Electronics Limited"
	},
	{
		symbol: "SAMBANDAM",
		name: "Sambandam Spinning Mills Limited"
	},
	{
		symbol: "SAMBHAAV",
		name: "Sambhaav Media Limited"
	},
	{
		symbol: "SAMBHV",
		name: "Sambhv Steel Tubes Limited"
	},
	{
		symbol: "SAMHI",
		name: "Samhi Hotels Limited"
	},
	{
		symbol: "SAMMAANCAP",
		name: "Sammaan Capital Limited"
	},
	{
		symbol: "SAMPANN",
		name: "Sampann Utpadan India Limited"
	},
	{
		symbol: "SANATHAN",
		name: "Sanathan Textiles Limited"
	},
	{
		symbol: "SANDESH",
		name: "The Sandesh Limited"
	},
	{
		symbol: "SANDHAR",
		name: "Sandhar Technologies Limited"
	},
	{
		symbol: "SANDUMA",
		name: "Sandur Manganese & Iron Ores Limited"
	},
	{
		symbol: "SANGAMIND",
		name: "Sangam (India) Limited"
	},
	{
		symbol: "SANGHVIMOV",
		name: "Sanghvi Movers Limited"
	},
	{
		symbol: "SANOFI",
		name: "Sanofi India Limited"
	},
	{
		symbol: "SANOFICONR",
		name: "Sanofi Consumer Healthcare India Limited"
	},
	{
		symbol: "SANSERA",
		name: "Sansera Engineering Limited"
	},
	{
		symbol: "SANSTAR",
		name: "Sanstar Limited"
	},
	{
		symbol: "SAPPHIRE",
		name: "Sapphire Foods India Limited"
	},
	{
		symbol: "SAPPL",
		name: "Shree Ajit Pulp & Paper Limited"
	},
	{
		symbol: "SARDAEN",
		name: "Sarda Energy & Minerals Limited"
	},
	{
		symbol: "SAREGAMA",
		name: "Saregama India Limited"
	},
	{
		symbol: "SARLAPOLY",
		name: "Sarla Performance Fibers Limited"
	},
	{
		symbol: "SARVESHWAR",
		name: "Sarveshwar Foods Limited"
	},
	{
		symbol: "SASKEN",
		name: "Sasken Technologies Limited"
	},
	{
		symbol: "SATIA",
		name: "Satia Industries Limited"
	},
	{
		symbol: "SATIN",
		name: "Satin Creditcare Network Limited"
	},
	{
		symbol: "SAURASHCEM",
		name: "Saurashtra Cement Limited"
	},
	{
		symbol: "SAYAJIHOTL",
		name: "Sayaji Hotels Limited"
	},
	{
		symbol: "SAYAJIIND",
		name: "Sayaji Industries Limited"
	},
	{
		symbol: "SBC",
		name: "SBC Exports Limited"
	},
	{
		symbol: "SBCL",
		name: "Shivalik Bimetal Controls Limited"
	},
	{
		symbol: "SBFC",
		name: "SBFC Finance Limited"
	},
	{
		symbol: "SBGLP",
		name: "Suratwwala Business Group Limited"
	},
	{
		symbol: "SBICARD",
		name: "SBI Cards and Payment Services Limited"
	},
	{
		symbol: "SBIFUNDS",
		name: "SBI Funds Management Limited"
	},
	{
		symbol: "SBILIFE",
		name: "SBI Life Insurance Company Limited"
	},
	{
		symbol: "SBIN",
		name: "State Bank of India"
	},
	{
		symbol: "SCHAEFFLER",
		name: "Schaeffler India Limited"
	},
	{
		symbol: "SCHAND",
		name: "S Chand And Company Limited"
	},
	{
		symbol: "SCHNEIDER",
		name: "Schneider Electric Infrastructure Limited"
	},
	{
		symbol: "SCI",
		name: "Shipping Corporation Of India Limited"
	},
	{
		symbol: "SCILAL",
		name: "Shipping Corporation of India Land and Assets Limited"
	},
	{
		symbol: "SCODATUBES",
		name: "Scoda Tubes Limited"
	},
	{
		symbol: "SDBL",
		name: "Som Distilleries & Breweries Limited"
	},
	{
		symbol: "SEAMECLTD",
		name: "Seamec Limited"
	},
	{
		symbol: "SECMARK",
		name: "SecMark Consultancy Limited"
	},
	{
		symbol: "SECURKLOUD",
		name: "SECUREKLOUD TECHNOLOGIES LIMITED"
	},
	{
		symbol: "SEDEMAC",
		name: "SEDEMAC Mechatronics Limited"
	},
	{
		symbol: "SEIL",
		name: "Shanti Educational Initiatives Limited"
	},
	{
		symbol: "SEJALLTD",
		name: "Sejal Glass Limited"
	},
	{
		symbol: "SEKURITIND",
		name: "Saint Gobain Sekurit India Limited"
	},
	{
		symbol: "SELMC",
		name: "SEL Manufacturing Company Limited"
	},
	{
		symbol: "SEMAC",
		name: "Semac Construction Limited"
	},
	{
		symbol: "SENCO",
		name: "Senco Gold Limited"
	},
	{
		symbol: "SENORES",
		name: "Senores Pharmaceuticals Limited"
	},
	{
		symbol: "SEPC",
		name: "SEPC Limited"
	},
	{
		symbol: "SERVOTECH",
		name: "Servotech Renewable Power System Limited"
	},
	{
		symbol: "SESHAPAPER",
		name: "Seshasayee Paper and Boards Limited"
	},
	{
		symbol: "SETL",
		name: "Standard Engineering Technology Limited"
	},
	{
		symbol: "SFL",
		name: "Sheela Foam Limited"
	},
	{
		symbol: "SGFIN",
		name: "SG Finserve Limited"
	},
	{
		symbol: "SGIL",
		name: "Synergy Green Industries Limited"
	},
	{
		symbol: "SGL",
		name: "STL Global Limited"
	},
	{
		symbol: "SGLRES",
		name: "SGL Resources Limited"
	},
	{
		symbol: "SGMART",
		name: "SG Mart Limited"
	},
	{
		symbol: "SGRL",
		name: "Shree Ganesh Remedies Limited"
	},
	{
		symbol: "SHADOWFAX",
		name: "Shadowfax Technologies Limited"
	},
	{
		symbol: "SHAH",
		name: "Shah Metacorp Limited"
	},
	{
		symbol: "SHAHALLOYS",
		name: "Shah Alloys Limited"
	},
	{
		symbol: "SHAILY",
		name: "Shaily Engineering Plastics Limited"
	},
	{
		symbol: "SHAKTIPUMP",
		name: "Shakti Pumps (India) Limited"
	},
	{
		symbol: "SHALBY",
		name: "Shalby Limited"
	},
	{
		symbol: "SHANKARA",
		name: "Shankara Building Products Limited"
	},
	{
		symbol: "SHANKESH",
		name: "Shankesh Jewellers Limited"
	},
	{
		symbol: "SHANTI",
		name: "Shanti Overseas (India) Limited"
	},
	{
		symbol: "SHANTIGEAR",
		name: "Shanthi Gears Limited"
	},
	{
		symbol: "SHANTIGOLD",
		name: "Shanti Gold International Limited"
	},
	{
		symbol: "SHARDACROP",
		name: "Sharda Cropchem Limited"
	},
	{
		symbol: "SHARDAMOTR",
		name: "Sharda Motor Industries Limited"
	},
	{
		symbol: "SHAREINDIA",
		name: "Share India Securities Limited"
	},
	{
		symbol: "SHBAJRG",
		name: "Shri Bajrang Alliance Limited"
	},
	{
		symbol: "SHERVANI",
		name: "Shervani Industrial Syndicate Limited"
	},
	{
		symbol: "SHILCTECH",
		name: "Shilchar Technologies Limited"
	},
	{
		symbol: "SHILGRAVQ",
		name: "Shilp Gravures Limited"
	},
	{
		symbol: "SHILPAMED",
		name: "Shilpa Medicare Limited"
	},
	{
		symbol: "SHINDL",
		name: "Sharat Industries Limited"
	},
	{
		symbol: "SHIPROCKET",
		name: "Shiprocket Limited"
	},
	{
		symbol: "SHIVAAGRO",
		name: "Shiva Global Agro Industries Limited"
	},
	{
		symbol: "SHIVACEM",
		name: "Shiva Cement Limited"
	},
	{
		symbol: "SHIVAMAUTO",
		name: "Shivam Autotech Limited"
	},
	{
		symbol: "SHIVAMILLS",
		name: "Shiva Mills Limited"
	},
	{
		symbol: "SHIVATEX",
		name: "Shiva Texyarn Limited"
	},
	{
		symbol: "SHIVAUM",
		name: "Shiv Aum Steels Limited"
	},
	{
		symbol: "SHK",
		name: "S H Kelkar and Company Limited"
	},
	{
		symbol: "SHOPERSTOP",
		name: "Shoppers Stop Limited"
	},
	{
		symbol: "SHRADDHA",
		name: "Shraddha Prime Projects Limited"
	},
	{
		symbol: "SHRADHA",
		name: "Shradha Realty Limited"
	},
	{
		symbol: "SHREDIGCEM",
		name: "Shree Digvijay Cement Co.Ltd"
	},
	{
		symbol: "SHREECEM",
		name: "SHREE CEMENT LIMITED"
	},
	{
		symbol: "SHREEJISPG",
		name: "Shreeji Shipping Global Limited"
	},
	{
		symbol: "SHREEPUSHK",
		name: "Shree Pushkar Chemicals & Fertilisers Limited"
	},
	{
		symbol: "SHREERAMA",
		name: "Shree Rama Multi-Tech Limited"
	},
	{
		symbol: "SHREYANIND",
		name: "Shreyans Industries Limited"
	},
	{
		symbol: "SHRIKRISH",
		name: "Shri Krishna Devcon Limited"
	},
	{
		symbol: "SHRINGARMS",
		name: "Shringar House of Mangalsutra Limited"
	},
	{
		symbol: "SHRIPISTON",
		name: "SPR Auto Technologies Limited"
	},
	{
		symbol: "SHRIRAMFIN",
		name: "Shriram Finance Limited"
	},
	{
		symbol: "SHRIRAMPPS",
		name: "Shriram Properties Limited"
	},
	{
		symbol: "SHRJAGP",
		name: "Shri Jagdamba Polymers Limited"
	},
	{
		symbol: "SHUKRAPHAR",
		name: "Shukra Pharmaceuticals Limited"
	},
	{
		symbol: "SHYAMMETL",
		name: "Shyam Metalics and Energy Limited"
	},
	{
		symbol: "SHYAMTEL",
		name: "Shyam Telecom Limited"
	},
	{
		symbol: "SICAGEN",
		name: "Sicagen India Limited"
	},
	{
		symbol: "SIEL",
		name: "Superior Industrial Enterprises Limited"
	},
	{
		symbol: "SIEMENS",
		name: "Siemens Limited"
	},
	{
		symbol: "SIGACHI",
		name: "Sigachi Industries Limited"
	},
	{
		symbol: "SIGMA",
		name: "Sigma Solve Limited"
	},
	{
		symbol: "SIGNATURE",
		name: "Signatureglobal (India) Limited"
	},
	{
		symbol: "SIGNPOST",
		name: "Signpost India Limited"
	},
	{
		symbol: "SIKA",
		name: "Sika Interplant Systems Limited"
	},
	{
		symbol: "SIL",
		name: "Standard Industries Limited"
	},
	{
		symbol: "SILGO",
		name: "Silgo Retail Limited"
	},
	{
		symbol: "SILINV",
		name: "SIL Investments Limited"
	},
	{
		symbol: "SILLYMONKS",
		name: "Silly Monks Entertainment Limited"
	},
	{
		symbol: "SILVERTUC",
		name: "Silver Touch Technologies Limited"
	},
	{
		symbol: "SIMPLEXINF",
		name: "Simplex Infrastructures Limited"
	},
	{
		symbol: "SIMPLXREA",
		name: "Simplex Realty Limited"
	},
	{
		symbol: "SINCLAIR",
		name: "Sinclairs Hotels Limited"
	},
	{
		symbol: "SINDHUTRAD",
		name: "Sindhu Trade Links Limited"
	},
	{
		symbol: "SINGERIND",
		name: "Singer India Limited"
	},
	{
		symbol: "SINTERCOM",
		name: "Sintercom India Limited"
	},
	{
		symbol: "SIRCA",
		name: "Sirca Paints India Limited"
	},
	{
		symbol: "SIS",
		name: "SIS LIMITED"
	},
	{
		symbol: "SIYSIL",
		name: "Siyaram Silk Mills Limited"
	},
	{
		symbol: "SJS",
		name: "S.J.S. Enterprises Limited"
	},
	{
		symbol: "SJVN",
		name: "SJVN Limited"
	},
	{
		symbol: "SKFINDIA",
		name: "SKF India Limited"
	},
	{
		symbol: "SKFINDUS",
		name: "SKF India (Industrial) Limited"
	},
	{
		symbol: "SKIPPER",
		name: "Skipper Limited"
	},
	{
		symbol: "SKMEGGPROD",
		name: "SKM Egg Products Export (India) Limited"
	},
	{
		symbol: "SKYGOLD",
		name: "SKY GOLD AND DIAMONDS LIMITED"
	},
	{
		symbol: "SMARTWORKS",
		name: "Smartworks Coworking Spaces Limited"
	},
	{
		symbol: "SMCGLOBAL",
		name: "SMC Global Securities Limited"
	},
	{
		symbol: "SMLMAH",
		name: "SML Mahindra Limited"
	},
	{
		symbol: "SMLT",
		name: "Sarthak Metals Limited"
	},
	{
		symbol: "SMSPHARMA",
		name: "SMS Pharmaceuticals Limited"
	},
	{
		symbol: "SNOWMAN",
		name: "Snowman Logistics Limited"
	},
	{
		symbol: "SOBHA",
		name: "Sobha Limited"
	},
	{
		symbol: "SOFTTECH",
		name: "Softtech Engineers Limited"
	},
	{
		symbol: "SOLARA",
		name: "Solara Active Pharma Sciences Limited"
	},
	{
		symbol: "SOLARINDS",
		name: "Solar Industries India Limited"
	},
	{
		symbol: "SOLARWORLD",
		name: "Solarworld Energy Solutions Limited"
	},
	{
		symbol: "SOLEX",
		name: "Solex Energy Limited"
	},
	{
		symbol: "SOMANYCERA",
		name: "Somany Ceramics Limited"
	},
	{
		symbol: "SOMATEX",
		name: "Soma Textiles & Industries Limited"
	},
	{
		symbol: "SOMICONVEY",
		name: "Somi Conveyor Beltings Limited"
	},
	{
		symbol: "SONACOMS",
		name: "Sona BLW Precision Forgings Limited"
	},
	{
		symbol: "SONAL",
		name: "Sonal Mercantile Limited"
	},
	{
		symbol: "SONAMLTD",
		name: "SONAM LIMITED"
	},
	{
		symbol: "SONATSOFTW",
		name: "Sonata Software Limited"
	},
	{
		symbol: "SOTL",
		name: "Savita Oil Technologies Limited"
	},
	{
		symbol: "SOUTHBANK",
		name: "The South Indian Bank Limited"
	},
	{
		symbol: "SOUTHWEST",
		name: "South West Pinnacle Exploration Limited"
	},
	{
		symbol: "SPAL",
		name: "S. P. Apparels Limited"
	},
	{
		symbol: "SPANDANA",
		name: "Spandana Sphoorty Financial Limited"
	},
	{
		symbol: "SPARC",
		name: "Sun Pharma Advanced Research Company Limited"
	},
	{
		symbol: "SPCENET",
		name: "Spacenet Enterprises India Limited"
	},
	{
		symbol: "SPELS",
		name: "SPEL Semiconductor Limited"
	},
	{
		symbol: "SPENCERS",
		name: "Spencer's Retail Limited"
	},
	{
		symbol: "SPIC",
		name: "Southern Petrochemicals Industries Corporation  Limited"
	},
	{
		symbol: "SPLIL",
		name: "SPL Industries Limited"
	},
	{
		symbol: "SPLPETRO",
		name: "Supreme Petrochem Limited"
	},
	{
		symbol: "SPMLINFRA",
		name: "SPML Infra Limited"
	},
	{
		symbol: "SPORTKING",
		name: "Sportking India Limited"
	},
	{
		symbol: "SRD",
		name: "Shankar Lal Rampal Dye-Chem Limited"
	},
	{
		symbol: "SREEL",
		name: "Sreeleathers Limited"
	},
	{
		symbol: "SRF",
		name: "SRF Limited"
	},
	{
		symbol: "SRGHFL",
		name: "SRG Housing Finance Limited"
	},
	{
		symbol: "SRHHYPOLTD",
		name: "Sree Rayalaseema Hi-Strength Hypo Limited"
	},
	{
		symbol: "SRIKPRIND",
		name: "Sri KPR Industries Limited"
	},
	{
		symbol: "SRM",
		name: "SRM Contractors Limited"
	},
	{
		symbol: "SRTL",
		name: "Shree Ram Twistex Limited"
	},
	{
		symbol: "SSDL",
		name: "Saraswati Saree Depot Limited"
	},
	{
		symbol: "SSWL",
		name: "Steel Strips Wheels Limited"
	},
	{
		symbol: "STANLEY",
		name: "Stanley Lifestyles Limited"
	},
	{
		symbol: "STAR",
		name: "Strides Pharma Science Limited"
	},
	{
		symbol: "STARCEMENT",
		name: "Star Cement Limited"
	},
	{
		symbol: "STARHEALTH",
		name: "Star Health and Allied Insurance Company Limited"
	},
	{
		symbol: "STARPAPER",
		name: "Star Paper Mills Limited"
	},
	{
		symbol: "STARTECK",
		name: "Starteck Finance Limited"
	},
	{
		symbol: "STCINDIA",
		name: "The State Trading Corporation of India Limited"
	},
	{
		symbol: "STEELCAS",
		name: "Steelcast Limited"
	},
	{
		symbol: "STEELCITY",
		name: "Steel City Securities Limited"
	},
	{
		symbol: "STEELXIND",
		name: "STEEL EXCHANGE INDIA LIMITED"
	},
	{
		symbol: "STEL",
		name: "Stel Holdings Limited"
	},
	{
		symbol: "STLNETWORK",
		name: "STL Networks Limited"
	},
	{
		symbol: "STLSTRINF",
		name: "Steel Strips Infrastructures Limited"
	},
	{
		symbol: "STOVEKRAFT",
		name: "Stove Kraft Limited"
	},
	{
		symbol: "STUDDS",
		name: "Studds Accessories Limited"
	},
	{
		symbol: "STYL",
		name: "Seshaasai Technologies Limited"
	},
	{
		symbol: "STYLAMIND",
		name: "Stylam Industries Limited"
	},
	{
		symbol: "STYLEBAAZA",
		name: "Baazar Style Retail Limited"
	},
	{
		symbol: "STYRENIX",
		name: "Styrenix Performance Materials Limited"
	},
	{
		symbol: "SUBEXLTD",
		name: "Subex Limited"
	},
	{
		symbol: "SUBROS",
		name: "Subros Limited"
	},
	{
		symbol: "SUDARCOLOR",
		name: "Sudarshan Colorants India Limited"
	},
	{
		symbol: "SUDARSCHEM",
		name: "Sudarshan Chemical Industries Limited"
	},
	{
		symbol: "SUDEEPPHRM",
		name: "Sudeep Pharma Limited"
	},
	{
		symbol: "SUKHJITS",
		name: "Sukhjit Starch & Chemicals Limited"
	},
	{
		symbol: "SULA",
		name: "Sula Vineyards Limited"
	},
	{
		symbol: "SUMEDHA",
		name: "Sumedha Fiscal Services Limited"
	},
	{
		symbol: "SUMEETINDS",
		name: "Sumeet Industries Limited"
	},
	{
		symbol: "SUMICHEM",
		name: "Sumitomo Chemical India Limited"
	},
	{
		symbol: "SUMIT",
		name: "Sumit Woods Limited"
	},
	{
		symbol: "SUMMITSEC",
		name: "Summit Securities Limited"
	},
	{
		symbol: "SUNCLAY",
		name: "Sundaram Clayton Limited"
	},
	{
		symbol: "SUNDARAM",
		name: "Sundaram Multi Pap Limited"
	},
	{
		symbol: "SUNDARMFIN",
		name: "Sundaram Finance Limited"
	},
	{
		symbol: "SUNDRMFAST",
		name: "Sundram Fasteners Limited"
	},
	{
		symbol: "SUNDROP",
		name: "Sundrop Brands Limited"
	},
	{
		symbol: "SUNFLAG",
		name: "Sunflag Iron And Steel Company Limited"
	},
	{
		symbol: "SUNLOC",
		name: "Sunil Healthcare Limited"
	},
	{
		symbol: "SUNPHARMA",
		name: "Sun Pharmaceutical Industries Limited"
	},
	{
		symbol: "SUNRAKSHAK",
		name: "Sunrakshakk Industries India Limited"
	},
	{
		symbol: "SUNSHIEL",
		name: "Sunshield Chemicals Limited"
	},
	{
		symbol: "SUNSHINE",
		name: "Sunshine Pictures Limited"
	},
	{
		symbol: "SUNTECK",
		name: "Sunteck Realty Limited"
	},
	{
		symbol: "SUNTV",
		name: "Sun TV Network Limited"
	},
	{
		symbol: "SUPERHOUSE",
		name: "Superhouse Limited"
	},
	{
		symbol: "SUPRAJIT",
		name: "Suprajit Engineering Limited"
	},
	{
		symbol: "SUPREME",
		name: "Supreme Holdings & Hospitality (India) Limited"
	},
	{
		symbol: "SUPREMEIND",
		name: "Supreme Industries Limited"
	},
	{
		symbol: "SUPREMEINF",
		name: "Supreme Infrastructure India Limited"
	},
	{
		symbol: "SUPRIYA",
		name: "Supriya Lifescience Limited"
	},
	{
		symbol: "SURAJEST",
		name: "Suraj Estate Developers Limited"
	},
	{
		symbol: "SURAJLTD",
		name: "Suraj Limited"
	},
	{
		symbol: "SURAKSHA",
		name: "Suraksha Diagnostic Limited"
	},
	{
		symbol: "SURANASOL",
		name: "Surana Solar Limited"
	},
	{
		symbol: "SURANAT&P",
		name: "Surana Telecom and Power Limited"
	},
	{
		symbol: "SURYALA",
		name: "Suryalata Spinning Mills Limited"
	},
	{
		symbol: "SURYALAXMI",
		name: "Suryalakshmi Cotton Mills Limited"
	},
	{
		symbol: "SURYAROSNI",
		name: "Surya Roshni Limited"
	},
	{
		symbol: "SURYODAY",
		name: "Suryoday Small Finance Bank Limited"
	},
	{
		symbol: "SUVEN",
		name: "Suven Life Sciences Limited"
	},
	{
		symbol: "SUVIDHAA",
		name: "Suvidhaa Infoserve Limited"
	},
	{
		symbol: "SUYOG",
		name: "Suyog Telematics Limited"
	},
	{
		symbol: "SUZLON",
		name: "Suzlon Energy Limited"
	},
	{
		symbol: "SVGLOBAL",
		name: "S V Global Mill Limited"
	},
	{
		symbol: "SVPGLOB",
		name: "SVP GLOBAL TEXTILES LIMITED"
	},
	{
		symbol: "SWANCORP",
		name: "SWAN CORP LIMITED"
	},
	{
		symbol: "SWARAJENG",
		name: "Swaraj Engines Limited"
	},
	{
		symbol: "SWARNSAR",
		name: "Swarnsarita Jewels India Limited"
	},
	{
		symbol: "SWELECTES",
		name: "Swelect Energy Systems Limited"
	},
	{
		symbol: "SWIGGY",
		name: "Swiggy Limited"
	},
	{
		symbol: "SWISSMLTRY",
		name: "Swiss Military Consumer Goods Limited"
	},
	{
		symbol: "SWSOLAR",
		name: "Sterling and Wilson Renewable Energy Limited"
	},
	{
		symbol: "SYMPHONY",
		name: "Symphony Limited"
	},
	{
		symbol: "SYNCOMF",
		name: "Syncom Formulations (India) Limited"
	},
	{
		symbol: "SYNGENE",
		name: "Syngene International Limited"
	},
	{
		symbol: "SYRMA",
		name: "Syrma SGS Technology Limited"
	},
	{
		symbol: "TAALTECH",
		name: "Taal Tech Limited"
	},
	{
		symbol: "TAINWALCHM",
		name: "Tainwala Chemical and Plastic (I) Limited"
	},
	{
		symbol: "TAJGVK",
		name: "Taj GVK Hotels & Resorts Limited"
	},
	{
		symbol: "TAKE",
		name: "TAKE Limited"
	},
	{
		symbol: "TALBROAUTO",
		name: "Talbros Automotive Components Limited"
	},
	{
		symbol: "TANAA",
		name: "Taneja Aerospace & Aviation Limited"
	},
	{
		symbol: "TANLA",
		name: "Tanla Platforms Limited"
	},
	{
		symbol: "TARACHAND",
		name: "Tara Chand InfraLogistic Solutions Limited"
	},
	{
		symbol: "TARAPUR",
		name: "Tarapur Transformers Limited"
	},
	{
		symbol: "TARC",
		name: "TARC Limited"
	},
	{
		symbol: "TARIL",
		name: "Transformers And Rectifiers (India) Limited"
	},
	{
		symbol: "TARMAT",
		name: "Tarmat Limited"
	},
	{
		symbol: "TARSONS",
		name: "Tarsons Products Limited"
	},
	{
		symbol: "TASTYBITE",
		name: "Tasty Bite Eatables Limited"
	},
	{
		symbol: "TATACAP",
		name: "Tata Capital Limited"
	},
	{
		symbol: "TATACHEM",
		name: "Tata Chemicals Limited"
	},
	{
		symbol: "TATACOMM",
		name: "Tata Communications Limited"
	},
	{
		symbol: "TATACONSUM",
		name: "TATA CONSUMER PRODUCTS LIMITED"
	},
	{
		symbol: "TATAELXSI",
		name: "Tata Elxsi Limited"
	},
	{
		symbol: "TATAINVEST",
		name: "Tata Investment Corporation Limited"
	},
	{
		symbol: "TATAPOWER",
		name: "Tata Power Company Limited"
	},
	{
		symbol: "TATASTEEL",
		name: "Tata Steel Limited"
	},
	{
		symbol: "TATATECH",
		name: "Tata Technologies Limited"
	},
	{
		symbol: "TATVA",
		name: "Tatva Chintan Pharma Chem Limited"
	},
	{
		symbol: "TBOTEK",
		name: "TBO Tek Limited"
	},
	{
		symbol: "TBZ",
		name: "Tribhovandas Bhimji Zaveri Limited"
	},
	{
		symbol: "TCC",
		name: "TCC Concept Limited"
	},
	{
		symbol: "TCI",
		name: "Transport Corporation of India Limited"
	},
	{
		symbol: "TCIEXP",
		name: "TCI Express Limited"
	},
	{
		symbol: "TCPLPACK",
		name: "TCPL Packaging Limited"
	},
	{
		symbol: "TCS",
		name: "Tata Consultancy Services Limited"
	},
	{
		symbol: "TDPOWERSYS",
		name: "TD Power Systems Limited"
	},
	{
		symbol: "TEAMGTY",
		name: "Team India Guaranty Limited"
	},
	{
		symbol: "TEAMLEASE",
		name: "Teamlease Services Limited"
	},
	{
		symbol: "TECHM",
		name: "Tech Mahindra Limited"
	},
	{
		symbol: "TECHNOCRAF",
		name: "Technocraft Ventures Limited"
	},
	{
		symbol: "TECHNOE",
		name: "Techno Electric & Engineering Company Limited"
	},
	{
		symbol: "TECHNVISN",
		name: "TechNVision Ventures Limited"
	},
	{
		symbol: "TECILCHEM",
		name: "TECIL Chemicals and Hydro Power Limited"
	},
	{
		symbol: "TEGA",
		name: "Tega Industries Limited"
	},
	{
		symbol: "TEJASNET",
		name: "Tejas Networks Limited"
	},
	{
		symbol: "TEMBO",
		name: "Tembo Global Industries Limited"
	},
	{
		symbol: "TEMPSENS",
		name: "Tempsens Instruments (India) Limited"
	},
	{
		symbol: "TENNIND",
		name: "Tenneco Clean Air India Limited"
	},
	{
		symbol: "TERAI",
		name: "Terai Tea Company Limited"
	},
	{
		symbol: "TERASOFT",
		name: "Tera Software Limited"
	},
	{
		symbol: "TEXINFRA",
		name: "Texmaco Infrastructure & Holdings Limited"
	},
	{
		symbol: "TEXMOPIPES",
		name: "Texmo Pipes and Products Limited"
	},
	{
		symbol: "TEXRAIL",
		name: "Texmaco Rail & Engineering Limited"
	},
	{
		symbol: "TFCILTD",
		name: "Tourism Finance Corporation of India Limited"
	},
	{
		symbol: "TFL",
		name: "Transwarranty Finance Limited"
	},
	{
		symbol: "TGBHOTELS",
		name: "TGB Banquets And Hotels Limited"
	},
	{
		symbol: "TGVSL",
		name: "TGV Sraac Limited"
	},
	{
		symbol: "THAKDEV",
		name: "Thakkers Developers Limited"
	},
	{
		symbol: "THANGAMAYL",
		name: "Thangamayil Jewellery Limited"
	},
	{
		symbol: "THEINVEST",
		name: "The Investment Trust Of India Limited"
	},
	{
		symbol: "THEJO",
		name: "Thejo Engineering Limited"
	},
	{
		symbol: "THELEELA",
		name: "Leela Palaces Hotels & Resorts Limited"
	},
	{
		symbol: "THEMISMED",
		name: "Themis Medicare Limited"
	},
	{
		symbol: "THERMAX",
		name: "Thermax Limited"
	},
	{
		symbol: "THOMASCOOK",
		name: "Thomas Cook  (India)  Limited"
	},
	{
		symbol: "THOMASCOTT",
		name: "Thomas Scott (India) Limited"
	},
	{
		symbol: "THYROCARE",
		name: "Thyrocare Technologies Limited"
	},
	{
		symbol: "TI",
		name: "Tilaknagar Industries Limited"
	},
	{
		symbol: "TIGERLOGS",
		name: "Tiger Logistics (India) Limited"
	},
	{
		symbol: "TIIL",
		name: "Technocraft Industries (India) Limited"
	},
	{
		symbol: "TIINDIA",
		name: "Tube Investments of India Limited"
	},
	{
		symbol: "TIJARIA",
		name: "Tijaria Polypipes Limited"
	},
	{
		symbol: "TIMETECHNO",
		name: "Time Technoplast Limited"
	},
	{
		symbol: "TIMEX",
		name: "Timex Group India Limited"
	},
	{
		symbol: "TIMKEN",
		name: "Timken India Limited"
	},
	{
		symbol: "TINNARUBR",
		name: "Tinna Rubber and Infrastructure Limited"
	},
	{
		symbol: "TIPSFILMS",
		name: "Tips Films Limited"
	},
	{
		symbol: "TIPSMUSIC",
		name: "Tips Music Limited"
	},
	{
		symbol: "TIRUMALCHM",
		name: "Thirumalai Chemicals Limited"
	},
	{
		symbol: "TITAGARH",
		name: "TITAGARH RAIL SYSTEMS LIMITED"
	},
	{
		symbol: "TITAN",
		name: "Titan Company Limited"
	},
	{
		symbol: "TMB",
		name: "Tamilnad Mercantile Bank Limited"
	},
	{
		symbol: "TMCV",
		name: "Tata Motors Limited"
	},
	{
		symbol: "TMPV",
		name: "Tata Motors Passenger Vehicles Limited"
	},
	{
		symbol: "TNPETRO",
		name: "Tamilnadu PetroProducts Limited"
	},
	{
		symbol: "TNPL",
		name: "Tamil Nadu Newsprint & Papers Limited"
	},
	{
		symbol: "TNTELE",
		name: "Tamilnadu Telecommunication Limited"
	},
	{
		symbol: "TOKYOPLAST",
		name: "Tokyo Plast International Limited"
	},
	{
		symbol: "TOLINS",
		name: "Tolins Tyres Limited"
	},
	{
		symbol: "TORNTPHARM",
		name: "Torrent Pharmaceuticals Limited"
	},
	{
		symbol: "TORNTPOWER",
		name: "Torrent Power Limited"
	},
	{
		symbol: "TOTAL",
		name: "Total Transport Systems Limited"
	},
	{
		symbol: "TOUCHWOOD",
		name: "Touchwood Entertainment Limited"
	},
	{
		symbol: "TOYAMSL",
		name: "Toyam Sports Limited"
	},
	{
		symbol: "TPLPLASTEH",
		name: "TPL Plastech Limited"
	},
	{
		symbol: "TRACXN",
		name: "Tracxn Technologies Limited"
	},
	{
		symbol: "TRANSCOR",
		name: "Transcorp International Limited"
	},
	{
		symbol: "TRANSRAILL",
		name: "Transrail Lighting Limited"
	},
	{
		symbol: "TRAVELFOOD",
		name: "Travel Food Services Limited"
	},
	{
		symbol: "TREEHOUSE",
		name: "Tree House Education & Accessories Limited"
	},
	{
		symbol: "TREJHARA",
		name: "TREJHARA SOLUTIONS LIMITED"
	},
	{
		symbol: "TREL",
		name: "Transindia Real Estate Limited"
	},
	{
		symbol: "TRENT",
		name: "Trent Limited"
	},
	{
		symbol: "TRF",
		name: "TRF Limited"
	},
	{
		symbol: "TRIDENT",
		name: "Trident Limited"
	},
	{
		symbol: "TRIGYN",
		name: "Trigyn Technologies Limited"
	},
	{
		symbol: "TRITONV",
		name: "Triton Valves Limited"
	},
	{
		symbol: "TRITURBINE",
		name: "Triveni Turbine Limited"
	},
	{
		symbol: "TRIVENI",
		name: "Triveni Engineering & Industries Limited"
	},
	{
		symbol: "TRU",
		name: "TruCap Finance Limited"
	},
	{
		symbol: "TRUALT",
		name: "TruAlt Bioenergy Limited"
	},
	{
		symbol: "TSFINV",
		name: "TSF INVESTMENTS LIMITED"
	},
	{
		symbol: "TTKHLTCARE",
		name: "TTK Healthcare Limited"
	},
	{
		symbol: "TTKPRESTIG",
		name: "TTK Prestige Limited"
	},
	{
		symbol: "TTL",
		name: "T T Limited"
	},
	{
		symbol: "TTML",
		name: "Tata Teleservices (Maharashtra) Limited"
	},
	{
		symbol: "TURTLEMINT",
		name: "Turtlemint Fintech Solutions Limited"
	},
	{
		symbol: "TUTIALKA",
		name: "Tuticorin Alkali Chemicals & Fertilizers Limited"
	},
	{
		symbol: "TVSELECT",
		name: "TVS Electronics Limited"
	},
	{
		symbol: "TVSHLTD",
		name: "TVS Holdings Limited"
	},
	{
		symbol: "TVSMOTOR",
		name: "TVS Motor Company Limited"
	},
	{
		symbol: "TVSSCS",
		name: "TVS Supply Chain Solutions Limited"
	},
	{
		symbol: "TVSSRICHAK",
		name: "TVS Srichakra Limited"
	},
	{
		symbol: "TVTODAY",
		name: "TV Today Network Limited"
	},
	{
		symbol: "UBL",
		name: "United Breweries Limited"
	},
	{
		symbol: "UCOBANK",
		name: "UCO Bank"
	},
	{
		symbol: "UDAYJEW",
		name: "Uday Jewellery Industries Limited"
	},
	{
		symbol: "UDS",
		name: "Updater Services Limited"
	},
	{
		symbol: "UEL",
		name: "Ujaas Energy Limited"
	},
	{
		symbol: "UFLEX",
		name: "UFLEX Limited"
	},
	{
		symbol: "UFO",
		name: "UFO Moviez India Limited"
	},
	{
		symbol: "UGARSUGAR",
		name: "The Ugar Sugar Works Limited"
	},
	{
		symbol: "UGROCAP",
		name: "Ugro Capital Limited"
	},
	{
		symbol: "UJJIVANSFB",
		name: "Ujjivan Small Finance Bank Limited"
	},
	{
		symbol: "ULTRACEMCO",
		name: "UltraTech Cement Limited"
	},
	{
		symbol: "ULTRAMAR",
		name: "Ultramarine & Pigments Limited"
	},
	{
		symbol: "UMESLTD",
		name: "Usha Martin Education & Solutions Limited"
	},
	{
		symbol: "UMIYA-MRO",
		name: "UMIYA BUILDCON LIMITED"
	},
	{
		symbol: "UNICHEMLAB",
		name: "Unichem Laboratories Limited"
	},
	{
		symbol: "UNIECOM",
		name: "Unicommerce Esolutions Limited"
	},
	{
		symbol: "UNIENTER",
		name: "Uniphos Enterprises Limited"
	},
	{
		symbol: "UNIINFO",
		name: "Uniinfo Telecom Services Limited"
	},
	{
		symbol: "UNIMECH",
		name: "Unimech Aerospace and Manufacturing Limited"
	},
	{
		symbol: "UNIONBANK",
		name: "Union Bank of India"
	},
	{
		symbol: "UNIPARTS",
		name: "Uniparts India Limited"
	},
	{
		symbol: "UNITDSPR",
		name: "United Spirits Limited"
	},
	{
		symbol: "UNITECH",
		name: "Unitech Limited"
	},
	{
		symbol: "UNITEDPOLY",
		name: "United Polyfab Gujarat Limited"
	},
	{
		symbol: "UNITEDTEA",
		name: "The United Nilgiri Tea Estates Company Limited"
	},
	{
		symbol: "UNIVCABLES",
		name: "Universal Cables Limited"
	},
	{
		symbol: "UNOMINDA",
		name: "UNO Minda Limited"
	},
	{
		symbol: "UPHOT",
		name: "U P Hotels Limited"
	},
	{
		symbol: "UPL",
		name: "UPL Limited"
	},
	{
		symbol: "URBANCO",
		name: "Urban Company Limited"
	},
	{
		symbol: "URJA",
		name: "Urja Global Limited"
	},
	{
		symbol: "USHAMART",
		name: "Usha Martin Limited"
	},
	{
		symbol: "USK",
		name: "Udayshivakumar Infra Limited"
	},
	{
		symbol: "UTIAMC",
		name: "UTI Asset Management Company Limited"
	},
	{
		symbol: "UTKARSHBNK",
		name: "Utkarsh Small Finance Bank Limited"
	},
	{
		symbol: "UTLSOLAR",
		name: "Fujiyama Power Systems Limited"
	},
	{
		symbol: "UTTAMSUGAR",
		name: "Uttam Sugar Mills Limited"
	},
	{
		symbol: "V2RETAIL",
		name: "V2 Retail Limited"
	},
	{
		symbol: "VADILALIND",
		name: "Vadilal Industries Limited"
	},
	{
		symbol: "VADILENT",
		name: "Vadilal Enterprises Limited"
	},
	{
		symbol: "VAIBHAVGBL",
		name: "Vaibhav Global Limited"
	},
	{
		symbol: "VAISHALI",
		name: "Vaishali Pharma Limited"
	},
	{
		symbol: "VAKRANGEE",
		name: "Vakrangee Limited"
	},
	{
		symbol: "VAML",
		name: "Vedanta Aluminium Metal Limited"
	},
	{
		symbol: "VARDMNPOLY",
		name: "Vardhman Polytex Limited"
	},
	{
		symbol: "VARROC",
		name: "Varroc Engineering Limited"
	},
	{
		symbol: "VASCONEQ",
		name: "Vascon Engineers Limited"
	},
	{
		symbol: "VASUPRADA",
		name: "Shri Vasuprada Plantations Limited"
	},
	{
		symbol: "VASWANI",
		name: "Vaswani Industries Limited"
	},
	{
		symbol: "VBL",
		name: "Varun Beverages Limited"
	},
	{
		symbol: "VEDAVAAG",
		name: "VEDAVAAG Systems Limited"
	},
	{
		symbol: "VEDL",
		name: "Vedanta Limited"
	},
	{
		symbol: "VEDPOWER",
		name: "Vedanta Power Limited"
	},
	{
		symbol: "VEEDOL",
		name: "Veedol Corporation Limited"
	},
	{
		symbol: "VENKEYS",
		name: "Venky's (India) Limited"
	},
	{
		symbol: "VENTIVE",
		name: "Ventive Hospitality Limited"
	},
	{
		symbol: "VENUSPIPES",
		name: "Venus Pipes & Tubes Limited"
	},
	{
		symbol: "VERANDA",
		name: "Veranda Learning Solutions Limited"
	},
	{
		symbol: "VERTOZ",
		name: "Vertoz Limited"
	},
	{
		symbol: "VESUVIUS",
		name: "Vesuvius India Limited"
	},
	{
		symbol: "VGCL",
		name: "Vibrant Global Capital Limited"
	},
	{
		symbol: "VGL",
		name: "VARVEE GLOBAL LIMITED"
	},
	{
		symbol: "VGUARD",
		name: "V-Guard Industries Limited"
	},
	{
		symbol: "VHL",
		name: "Vardhman Holdings Limited"
	},
	{
		symbol: "VIDHIING",
		name: "Vidhi Specialty Food Ingredients Limited"
	},
	{
		symbol: "VIDYAWIRES",
		name: "Vidya Wires Limited"
	},
	{
		symbol: "VIJAYA",
		name: "Vijaya Diagnostic Centre Limited"
	},
	{
		symbol: "VIJSOLX",
		name: "Vijay Solvex Limited"
	},
	{
		symbol: "VIKASECO",
		name: "Vikas EcoTech Limited"
	},
	{
		symbol: "VIKASLIFE",
		name: "Vikas Lifecare Limited"
	},
	{
		symbol: "VIKRAMSOLR",
		name: "Vikram Solar Limited"
	},
	{
		symbol: "VIKRAN",
		name: "Vikran Engineering Limited"
	},
	{
		symbol: "VIMTALABS",
		name: "Vimta Labs Limited"
	},
	{
		symbol: "VINATIORGA",
		name: "Vinati Organics Limited"
	},
	{
		symbol: "VINCOFE",
		name: "Vintage Coffee And Beverages Limited"
	},
	{
		symbol: "VINDHYATEL",
		name: "Vindhya Telelinks Limited"
	},
	{
		symbol: "VINEETLAB",
		name: "Vineet Laboratories Limited"
	},
	{
		symbol: "VINNY",
		name: "Vinny Overseas Limited"
	},
	{
		symbol: "VINYLINDIA",
		name: "Vinyl Chemicals (India) Limited"
	},
	{
		symbol: "VIPCLOTHNG",
		name: "VIP Clothing Limited"
	},
	{
		symbol: "VIPIND",
		name: "VIP Industries Limited"
	},
	{
		symbol: "VIRAT",
		name: "Virat Industries Limited"
	},
	{
		symbol: "VIRINCHI",
		name: "Virinchi Limited"
	},
	{
		symbol: "VIRTUALG",
		name: "Virtual Global Education Limited"
	},
	{
		symbol: "VISACHROME",
		name: "VISA Chrome Limited"
	},
	{
		symbol: "VISAKAIND",
		name: "Visaka Industries Limited"
	},
	{
		symbol: "VISHAL",
		name: "Vishal Fabrics Limited"
	},
	{
		symbol: "VISHNU",
		name: "Vishnu Chemicals Limited"
	},
	{
		symbol: "VISHWARAJ",
		name: "Vishwaraj Sugar Industries Limited"
	},
	{
		symbol: "VISL",
		name: "Vedanta Iron and Steel Limited"
	},
	{
		symbol: "VITAL",
		name: "Vital Chemtech Limited"
	},
	{
		symbol: "VIVIDHA",
		name: "Visagar Polytex Limited"
	},
	{
		symbol: "VIVOBIOT",
		name: "Vivo Bio Tech Limited"
	},
	{
		symbol: "VIYASH",
		name: "Viyash Scientific Limited"
	},
	{
		symbol: "VLSFINANCE",
		name: "VLS Finance Limited"
	},
	{
		symbol: "VMART",
		name: "V-Mart Retail Limited"
	},
	{
		symbol: "VMM",
		name: "Vishal Mega Mart Limited"
	},
	{
		symbol: "VMSTMT",
		name: "VMS TMT Limited"
	},
	{
		symbol: "VOEPL",
		name: "Virtuoso Optoelectronics Limited"
	},
	{
		symbol: "VOGL",
		name: "Vedanta Oil and Gas Limited"
	},
	{
		symbol: "VOITHPAPR",
		name: "Voith Paper Fabrics India Limited"
	},
	{
		symbol: "VOLTAMP",
		name: "Voltamp Transformers Limited"
	},
	{
		symbol: "VOLTAS",
		name: "Voltas Limited"
	},
	{
		symbol: "VPRPL",
		name: "Vishnu Prakash R Punglia Limited"
	},
	{
		symbol: "VRAJ",
		name: "Vraj Iron and Steel Limited"
	},
	{
		symbol: "VRLLOG",
		name: "VRL Logistics Limited"
	},
	{
		symbol: "VSSL",
		name: "Vardhman Special Steels Limited"
	},
	{
		symbol: "VSTIND",
		name: "VST Industries Limited"
	},
	{
		symbol: "VSTL",
		name: "Vibhor Steel Tubes Limited"
	},
	{
		symbol: "VSTTILLERS",
		name: "V.S.T Tillers Tractors Limited"
	},
	{
		symbol: "VTL",
		name: "Vardhman Textiles Limited"
	},
	{
		symbol: "VTMLTD",
		name: "VTM Limited"
	},
	{
		symbol: "WAAREEENER",
		name: "Waaree Energies Limited"
	},
	{
		symbol: "WAAREEINDO",
		name: "Indosolar Limited"
	},
	{
		symbol: "WAAREERTL",
		name: "Waaree Renewable Technologies Limited"
	},
	{
		symbol: "WABAG",
		name: "VA Tech Wabag Limited"
	},
	{
		symbol: "WAKEFIT",
		name: "Wakefit Innovations Limited"
	},
	{
		symbol: "WALCHANNAG",
		name: "Walchandnagar Industries Limited"
	},
	{
		symbol: "WANBURY",
		name: "Wanbury Limited"
	},
	{
		symbol: "WARDINMOBI",
		name: "Wardwizard Innovations & Mobility Limited"
	},
	{
		symbol: "WATERBASE",
		name: "Waterbase Limited"
	},
	{
		symbol: "WCIL",
		name: "Western Carriers (India) Limited"
	},
	{
		symbol: "WEALTH",
		name: "Wealth First Portfolio Managers Limited"
	},
	{
		symbol: "WEBELSOLAR",
		name: "Websol Energy System Limited"
	},
	{
		symbol: "WEIZMANIND",
		name: "Weizmann Limited"
	},
	{
		symbol: "WEL",
		name: "Wonder Electricals Limited"
	},
	{
		symbol: "WELCORP",
		name: "Welspun Corp Limited"
	},
	{
		symbol: "WELENT",
		name: "Welspun Enterprises Limited"
	},
	{
		symbol: "WELSPLSOL",
		name: "Welspun Specialty Solutions Limited"
	},
	{
		symbol: "WELSPUNLIV",
		name: "Welspun Living Limited"
	},
	{
		symbol: "WENDT",
		name: "Wendt (India) Limited"
	},
	{
		symbol: "WESTLIFE",
		name: "WESTLIFE FOODWORLD LIMITED"
	},
	{
		symbol: "WEWIN",
		name: "WE WIN LIMITED"
	},
	{
		symbol: "WEWORK",
		name: "WeWork India Management Limited"
	},
	{
		symbol: "WHBRADY",
		name: "WH Brady & Company Limited"
	},
	{
		symbol: "WHEELS",
		name: "Wheels India Limited"
	},
	{
		symbol: "WHIRLPOOL",
		name: "Whirlpool of India Limited"
	},
	{
		symbol: "WILLAMAGOR",
		name: "Williamson Magor & Company Limited"
	},
	{
		symbol: "WINDLAS",
		name: "Windlas Biotech Limited"
	},
	{
		symbol: "WINDMACHIN",
		name: "Windsor Machines Limited"
	},
	{
		symbol: "WIPL",
		name: "The Western India Plywoods Limited"
	},
	{
		symbol: "WIPRO",
		name: "Wipro Limited"
	},
	{
		symbol: "WOCKPHARMA",
		name: "Wockhardt Limited"
	},
	{
		symbol: "WONDERLA",
		name: "Wonderla Holidays Limited"
	},
	{
		symbol: "WORTHPERI",
		name: "Worth Peripherals Limited"
	},
	{
		symbol: "WPIL",
		name: "WPIL Limited"
	},
	{
		symbol: "WSI",
		name: "W S Industries (I) Limited"
	},
	{
		symbol: "WSTCSTPAPR",
		name: "West Coast Paper Mills Limited"
	},
	{
		symbol: "XCHANGING",
		name: "Xchanging Solutions Limited"
	},
	{
		symbol: "XELPMOC",
		name: "Xelpmoc Design And Tech Limited"
	},
	{
		symbol: "XPROINDIA",
		name: "Xpro India Limited"
	},
	{
		symbol: "XTGLOBAL",
		name: "Xtglobal Infotech Limited"
	},
	{
		symbol: "XTRANET",
		name: "Xtranet Technologies Limited"
	},
	{
		symbol: "YASHO",
		name: "Yasho Industries Limited"
	},
	{
		symbol: "YATHARTH",
		name: "Yatharth Hospital & Trauma Care Services Limited"
	},
	{
		symbol: "YATRA",
		name: "Yatra Online Limited"
	},
	{
		symbol: "YESBANK",
		name: "Yes Bank Limited"
	},
	{
		symbol: "YOGI",
		name: "Yogi Limited"
	},
	{
		symbol: "YUKEN",
		name: "Yuken India Limited"
	},
	{
		symbol: "ZAGGLE",
		name: "Zaggle Prepaid Ocean Services Limited"
	},
	{
		symbol: "ZEEL",
		name: "Zee Entertainment Enterprises Limited"
	},
	{
		symbol: "ZEEMEDIA",
		name: "Zee Media Corporation Limited"
	},
	{
		symbol: "ZENITHEXPO",
		name: "Zenith Exports Limited"
	},
	{
		symbol: "ZENITHSTL",
		name: "Zenith Steel Pipes & Industries Limited"
	},
	{
		symbol: "ZENSARTECH",
		name: "Zensar Technologies Limited"
	},
	{
		symbol: "ZENTEC",
		name: "Zen Technologies Limited"
	},
	{
		symbol: "ZFCVINDIA",
		name: "ZF Commercial Vehicle Control Systems India Limited"
	},
	{
		symbol: "ZFSTEERING",
		name: "ZF Steering Gear (India) Limited"
	},
	{
		symbol: "ZIMLAB",
		name: "Zim Laboratories Limited"
	},
	{
		symbol: "ZODIAC",
		name: "Zodiac Energy Limited"
	},
	{
		symbol: "ZODIACLOTH",
		name: "Zodiac Clothing Company Limited"
	},
	{
		symbol: "ZOTA",
		name: "Zota Health Care LImited"
	},
	{
		symbol: "ZSARACOM",
		name: "Saraswati Commercial India Limited"
	},
	{
		symbol: "ZUARI",
		name: "Zuari Agro Chemicals Limited"
	},
	{
		symbol: "ZUARIIND",
		name: "ZUARI INDUSTRIES LIMITED"
	},
	{
		symbol: "ZYDUSLIFE",
		name: "Zydus Lifesciences Limited"
	},
	{
		symbol: "ZYDUSWELL",
		name: "Zydus Wellness Limited"
	}
];
/** NSE names: Nifty 50 for tape, Nifty 500 for full history, all EQ for the screener. */
var NIFTY50 = [
	{
		symbol: "ADANIENT",
		name: "Adani Enterprises"
	},
	{
		symbol: "ADANIPORTS",
		name: "Adani Ports"
	},
	{
		symbol: "APOLLOHOSP",
		name: "Apollo Hospitals"
	},
	{
		symbol: "ASIANPAINT",
		name: "Asian Paints"
	},
	{
		symbol: "AXISBANK",
		name: "Axis Bank"
	},
	{
		symbol: "BAJAJ-AUTO",
		name: "Bajaj Auto"
	},
	{
		symbol: "BAJFINANCE",
		name: "Bajaj Finance"
	},
	{
		symbol: "BAJAJFINSV",
		name: "Bajaj Finserv"
	},
	{
		symbol: "BEL",
		name: "Bharat Electronics"
	},
	{
		symbol: "BHARTIARTL",
		name: "Bharti Airtel"
	},
	{
		symbol: "CIPLA",
		name: "Cipla"
	},
	{
		symbol: "COALINDIA",
		name: "Coal India"
	},
	{
		symbol: "DRREDDY",
		name: "Dr Reddy's"
	},
	{
		symbol: "EICHERMOT",
		name: "Eicher Motors"
	},
	{
		symbol: "ETERNAL",
		name: "Eternal"
	},
	{
		symbol: "GRASIM",
		name: "Grasim"
	},
	{
		symbol: "HCLTECH",
		name: "HCL Tech"
	},
	{
		symbol: "HDFCBANK",
		name: "HDFC Bank"
	},
	{
		symbol: "HDFCLIFE",
		name: "HDFC Life"
	},
	{
		symbol: "HEROMOTOCO",
		name: "Hero MotoCorp"
	},
	{
		symbol: "HINDALCO",
		name: "Hindalco"
	},
	{
		symbol: "HINDUNILVR",
		name: "Hindustan Unilever"
	},
	{
		symbol: "ICICIBANK",
		name: "ICICI Bank"
	},
	{
		symbol: "INDUSINDBK",
		name: "IndusInd Bank"
	},
	{
		symbol: "INFY",
		name: "Infosys"
	},
	{
		symbol: "ITC",
		name: "ITC"
	},
	{
		symbol: "JIOFIN",
		name: "Jio Financial"
	},
	{
		symbol: "JSWSTEEL",
		name: "JSW Steel"
	},
	{
		symbol: "KOTAKBANK",
		name: "Kotak Mahindra Bank"
	},
	{
		symbol: "LT",
		name: "Larsen & Toubro"
	},
	{
		symbol: "M&M",
		name: "Mahindra & Mahindra"
	},
	{
		symbol: "MARUTI",
		name: "Maruti Suzuki"
	},
	{
		symbol: "NESTLEIND",
		name: "Nestlé India"
	},
	{
		symbol: "NTPC",
		name: "NTPC"
	},
	{
		symbol: "ONGC",
		name: "ONGC"
	},
	{
		symbol: "POWERGRID",
		name: "Power Grid"
	},
	{
		symbol: "RELIANCE",
		name: "Reliance Industries"
	},
	{
		symbol: "SBILIFE",
		name: "SBI Life"
	},
	{
		symbol: "SBIN",
		name: "State Bank of India"
	},
	{
		symbol: "SHRIRAMFIN",
		name: "Shriram Finance"
	},
	{
		symbol: "SUNPHARMA",
		name: "Sun Pharma"
	},
	{
		symbol: "TATACONSUM",
		name: "Tata Consumer"
	},
	{
		symbol: "TATAMOTORS",
		name: "Tata Motors"
	},
	{
		symbol: "TATASTEEL",
		name: "Tata Steel"
	},
	{
		symbol: "TCS",
		name: "TCS"
	},
	{
		symbol: "TECHM",
		name: "Tech Mahindra"
	},
	{
		symbol: "TITAN",
		name: "Titan"
	},
	{
		symbol: "TRENT",
		name: "Trent"
	},
	{
		symbol: "ULTRACEMCO",
		name: "UltraTech Cement"
	},
	{
		symbol: "WIPRO",
		name: "Wipro"
	}
];
var NIFTY_EXTRA = [
	{
		symbol: "DMART",
		name: "DMart"
	},
	{
		symbol: "PIDILITIND",
		name: "Pidilite"
	},
	{
		symbol: "GODREJCP",
		name: "Godrej Consumer"
	},
	{
		symbol: "BRITANNIA",
		name: "Britannia"
	},
	{
		symbol: "DABUR",
		name: "Dabur"
	},
	{
		symbol: "DIVISLAB",
		name: "Divi's Lab"
	},
	{
		symbol: "LUPIN",
		name: "Lupin"
	},
	{
		symbol: "AUROPHARMA",
		name: "Aurobindo"
	},
	{
		symbol: "TVSMOTOR",
		name: "TVS Motor"
	},
	{
		symbol: "BAJAJHLDNG",
		name: "Bajaj Holdings"
	},
	{
		symbol: "IRFC",
		name: "IRFC"
	},
	{
		symbol: "PFC",
		name: "PFC"
	},
	{
		symbol: "RECLTD",
		name: "REC"
	},
	{
		symbol: "LICI",
		name: "LIC"
	},
	{
		symbol: "MAXHEALTH",
		name: "Max Healthcare"
	},
	{
		symbol: "POLYCAB",
		name: "Polycab"
	},
	{
		symbol: "DIXON",
		name: "Dixon"
	},
	{
		symbol: "PERSISTENT",
		name: "Persistent"
	},
	{
		symbol: "COFORGE",
		name: "Coforge"
	},
	{
		symbol: "LTIM",
		name: "LTIMindtree"
	}
];
var NIFTY_LIQUID = [
	{
		symbol: "ABB",
		name: "ABB India"
	},
	{
		symbol: "ADANIGREEN",
		name: "Adani Green"
	},
	{
		symbol: "ADANIPOWER",
		name: "Adani Power"
	},
	{
		symbol: "ALKEM",
		name: "Alkem"
	},
	{
		symbol: "AMBUJACEM",
		name: "Ambuja Cements"
	},
	{
		symbol: "ASHOKLEY",
		name: "Ashok Leyland"
	},
	{
		symbol: "ASTRAL",
		name: "Astral"
	},
	{
		symbol: "AUBANK",
		name: "AU Small Finance"
	},
	{
		symbol: "BANDHANBNK",
		name: "Bandhan Bank"
	},
	{
		symbol: "BANKBARODA",
		name: "Bank of Baroda"
	},
	{
		symbol: "BERGEPAINT",
		name: "Berger Paints"
	},
	{
		symbol: "BHEL",
		name: "BHEL"
	},
	{
		symbol: "BIOCON",
		name: "Biocon"
	},
	{
		symbol: "BLUESTARCO",
		name: "Blue Star"
	},
	{
		symbol: "BOSCHLTD",
		name: "Bosch"
	},
	{
		symbol: "BPCL",
		name: "BPCL"
	},
	{
		symbol: "CANBK",
		name: "Canara Bank"
	},
	{
		symbol: "CGPOWER",
		name: "CG Power"
	},
	{
		symbol: "CHOLAFIN",
		name: "Cholamandalam"
	},
	{
		symbol: "COLPAL",
		name: "Colgate"
	},
	{
		symbol: "CONCOR",
		name: "Concor"
	},
	{
		symbol: "CUMMINSIND",
		name: "Cummins India"
	},
	{
		symbol: "DALBHARAT",
		name: "Dalmia Bharat"
	},
	{
		symbol: "DLF",
		name: "DLF"
	},
	{
		symbol: "EXIDEIND",
		name: "Exide"
	},
	{
		symbol: "FEDERALBNK",
		name: "Federal Bank"
	},
	{
		symbol: "FORTIS",
		name: "Fortis"
	},
	{
		symbol: "GAIL",
		name: "GAIL"
	},
	{
		symbol: "GLENMARK",
		name: "Glenmark"
	},
	{
		symbol: "GODREJPROP",
		name: "Godrej Properties"
	},
	{
		symbol: "HAL",
		name: "HAL"
	},
	{
		symbol: "HAVELLS",
		name: "Havells"
	},
	{
		symbol: "HDFCAMC",
		name: "HDFC AMC"
	},
	{
		symbol: "HINDPETRO",
		name: "HPCL"
	},
	{
		symbol: "HINDZINC",
		name: "Hindustan Zinc"
	},
	{
		symbol: "ICICIGI",
		name: "ICICI Lombard"
	},
	{
		symbol: "ICICIPRULI",
		name: "ICICI Prudential Life"
	},
	{
		symbol: "IEX",
		name: "IEX"
	},
	{
		symbol: "IGL",
		name: "IGL"
	},
	{
		symbol: "INDIGO",
		name: "InterGlobe Aviation"
	},
	{
		symbol: "INDHOTEL",
		name: "Indian Hotels"
	},
	{
		symbol: "INDUSTOWER",
		name: "Indus Towers"
	},
	{
		symbol: "IOC",
		name: "IOC"
	},
	{
		symbol: "IRCTC",
		name: "IRCTC"
	},
	{
		symbol: "JINDALSTEL",
		name: "Jindal Steel"
	},
	{
		symbol: "JSWENERGY",
		name: "JSW Energy"
	},
	{
		symbol: "JUBLFOOD",
		name: "Jubilant FoodWorks"
	},
	{
		symbol: "KALYANKJIL",
		name: "Kalyan Jewellers"
	},
	{
		symbol: "KPITTECH",
		name: "KPIT"
	},
	{
		symbol: "LAURUSLABS",
		name: "Laurus Labs"
	},
	{
		symbol: "LICHSGFIN",
		name: "LIC Housing"
	},
	{
		symbol: "LODHA",
		name: "Macrotech"
	},
	{
		symbol: "LTTS",
		name: "L&T Technology"
	},
	{
		symbol: "MARICO",
		name: "Marico"
	},
	{
		symbol: "MOTHERSON",
		name: "Samvardhana Motherson"
	},
	{
		symbol: "MPHASIS",
		name: "Mphasis"
	},
	{
		symbol: "MRF",
		name: "MRF"
	},
	{
		symbol: "MUTHOOTFIN",
		name: "Muthoot Finance"
	},
	{
		symbol: "NAUKRI",
		name: "Info Edge"
	},
	{
		symbol: "NHPC",
		name: "NHPC"
	},
	{
		symbol: "NMDC",
		name: "NMDC"
	},
	{
		symbol: "NYKAA",
		name: "Nykaa"
	},
	{
		symbol: "OBEROIRLTY",
		name: "Oberoi Realty"
	},
	{
		symbol: "OFSS",
		name: "Oracle Financial"
	},
	{
		symbol: "OIL",
		name: "Oil India"
	},
	{
		symbol: "PAGEIND",
		name: "Page Industries"
	},
	{
		symbol: "PEL",
		name: "Piramal Enterprises"
	},
	{
		symbol: "PETRONET",
		name: "Petronet LNG"
	},
	{
		symbol: "PIIND",
		name: "PI Industries"
	},
	{
		symbol: "PNB",
		name: "PNB"
	},
	{
		symbol: "POLICYBZR",
		name: "PB Fintech"
	},
	{
		symbol: "PRESTIGE",
		name: "Prestige Estates"
	},
	{
		symbol: "SAIL",
		name: "SAIL"
	},
	{
		symbol: "SBICARD",
		name: "SBI Card"
	},
	{
		symbol: "SHREECEM",
		name: "Shree Cement"
	},
	{
		symbol: "SIEMENS",
		name: "Siemens"
	},
	{
		symbol: "SOLARINDS",
		name: "Solar Industries"
	},
	{
		symbol: "SRF",
		name: "SRF"
	},
	{
		symbol: "SUPREMEIND",
		name: "Supreme Industries"
	},
	{
		symbol: "SYNGENE",
		name: "Syngene"
	},
	{
		symbol: "TATACHEM",
		name: "Tata Chemicals"
	},
	{
		symbol: "TATACOMM",
		name: "Tata Communications"
	},
	{
		symbol: "TATAELXSI",
		name: "Tata Elxsi"
	},
	{
		symbol: "TATAPOWER",
		name: "Tata Power"
	},
	{
		symbol: "TATATECH",
		name: "Tata Technologies"
	},
	{
		symbol: "TIINDIA",
		name: "Tube Investments"
	},
	{
		symbol: "TORNTPHARM",
		name: "Torrent Pharma"
	},
	{
		symbol: "UNIONBANK",
		name: "Union Bank"
	},
	{
		symbol: "UNITDSPR",
		name: "United Spirits"
	},
	{
		symbol: "UPL",
		name: "UPL"
	},
	{
		symbol: "VBL",
		name: "Varun Beverages"
	},
	{
		symbol: "VEDL",
		name: "Vedanta"
	},
	{
		symbol: "VOLTAS",
		name: "Voltas"
	},
	{
		symbol: "YESBANK",
		name: "Yes Bank"
	},
	{
		symbol: "ZYDUSLIFE",
		name: "Zydus Lifesciences"
	}
];
var DEEP_UNIVERSE = NIFTY500;
var SCREEN_UNIVERSE = NSE_EQ;
var NAME_MAP = /* @__PURE__ */ new Map();
for (const x of NSE_EQ) NAME_MAP.set(x.symbol, x.name);
for (const x of NIFTY500) NAME_MAP.set(x.symbol, x.name);
for (const x of NIFTY50) NAME_MAP.set(x.symbol, x.name);
for (const x of NIFTY_EXTRA) NAME_MAP.set(x.symbol, x.name);
for (const x of NIFTY_LIQUID) NAME_MAP.set(x.symbol, x.name);
function universeName(symbol) {
	const b = String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
	return NAME_MAP.get(b) || b;
}
function isListedSymbol(symbol) {
	const b = String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
	if (!b || b.startsWith("^")) return false;
	return NAME_MAP.has(b);
}
function searchNse(q, cap = 12) {
	const n = q.trim().toUpperCase();
	if (n.length < 1) return [];
	const starts = [];
	const rest = [];
	for (const x of NSE_EQ) {
		const nameU = x.name.toUpperCase();
		if (x.symbol === n || x.symbol.startsWith(n)) starts.push(x);
		else if (x.symbol.includes(n) || nameU.includes(n)) rest.push(x);
		if (starts.length >= cap) break;
	}
	return [...starts, ...rest].slice(0, cap);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/engine-D_ElcA-r.js
/** Physical gold / silver.
*  Holdings quantity is grams. Live value comes from MCX:
*  Gold displayed ₹/10g, Silver displayed ₹/kg.
*  Internal quote used for value is always ₹/g. */
var TROY_OZ_G = 31.1034768;
var METALS = {
	GOLD: {
		symbol: "GOLD",
		name: "Gold",
		unit: "g",
		displayG: 10,
		displayLabel: "₹/10g",
		yfInr: "XAUINR=X",
		yfUsd: "GC=F",
		etfs: [
			"GOLDBEES.NS",
			"SETFGOLD.NS",
			"GOLD1.NS"
		],
		growwName: "Gold",
		growwFut: "mcx_gold",
		growwMini: "mcx_goldm"
	},
	SILVER: {
		symbol: "SILVER",
		name: "Silver",
		unit: "g",
		displayG: 1e3,
		displayLabel: "₹/kg",
		yfInr: "XAGINR=X",
		yfUsd: "SI=F",
		etfs: [
			"SILVERBEES.NS",
			"SBISILVER.NS",
			"SILVERIETF.NS"
		],
		growwName: "Silver",
		growwFut: "mcx_silver",
		growwMini: "mcx_silverm"
	}
};
function metalKey(symbol) {
	const b = String(symbol || "").trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
	if (b === "GOLD" || b === "XAU" || b === "XAUINR" || b === "XAUINR=X" || b === "GOLDBEES") return "GOLD";
	if (b === "SILVER" || b === "XAG" || b === "XAGINR" || b === "XAGINR=X" || b === "SILVERBEES") return "SILVER";
	return null;
}
function isCommodity(symbol) {
	return metalKey(symbol) != null;
}
/** Indian gold ETFs are 0.01 g units (~₹100–₹400). Silver ETFs are ~1 g. Fallback only. */
function etfToGramPrice(kind, px) {
	if (!(px > 0)) return 0;
	if (kind === "GOLD") {
		if (px >= 2e3) return px;
		return px * 100;
	}
	return px;
}
/** MCX display: gold ₹/10g, silver ₹/kg. */
function gramToMcx(kind, gram) {
	if (!(gram > 0)) return 0;
	return gram * METALS[kind].displayG;
}
function mcxToGram(kind, display) {
	if (!(display > 0)) return 0;
	return display / METALS[kind].displayG;
}
function parseGrowwMcx(html, name) {
	const re = new RegExp(`"spotPrice":(\\d+(?:\\.\\d+)?),"displayName":"${name}"[^\\}]{0,160}"lastDayClosePrice":(\\d+(?:\\.\\d+)?)`);
	const m = html.match(re);
	if (!m) return null;
	const display = Number(m[1]);
	const prev = Number(m[2]);
	if (!(display > 1e3)) return null;
	return {
		display,
		prev: prev > 0 ? prev : display
	};
}
/** Live print on a Groww MCX futures page, including volume so we can pick the active month. */
function parseGrowwLive(html) {
	const block = html.match(/"livePriceDetails":\{[^}]+\}/);
	const src = block ? block[0] : html;
	const ltp = Number(src.match(/"ltp":(\d+(?:\.\d+)?)/)?.[1] || 0);
	const close = Number(src.match(/"close":(\d+(?:\.\d+)?)/)?.[1] || 0);
	if (!(ltp > 1e3)) return null;
	const volume = Number(src.match(/"volume":(\d+)/)?.[1] || 0);
	const oi = Number(src.match(/"openInterest":(\d+)/)?.[1] || 0);
	const expiry = html.match(/"expiryDate":"(\d{4}-\d{2}-\d{2})"/)?.[1] || "";
	const name = html.match(/"companyShortName":"([^"]+)"/)?.[1] || html.match(/"displayName":"([^"]+Fut)"/)?.[1] || "";
	return {
		display: ltp,
		prev: close > 0 ? close : ltp,
		volume,
		oi,
		expiry,
		name
	};
}
function isMiniName(name, kind) {
	const n = String(name || "").toLowerCase();
	if (kind === "GOLD") return /goldm|mini|guinea|petal|\bten\b/.test(n);
	return /silverm|mini|mic|silver100|silverg/.test(n);
}
/** Headline MCX print: Groww list Gold / Silver (matches ET / Moneycontrol), never Mini, never a far month when the list is present. */
function pickMcxSpot(kind, list, futures) {
	if (list && list.display > 1e3) return {
		display: list.display,
		prev: list.prev
	};
	const main = futures.filter((x) => Boolean(x && x.display > 1e3 && !isMiniName(x.name, kind)));
	main.sort((a, b) => (a.expiry || "9999").localeCompare(b.expiry || "9999"));
	const hit = main[0];
	return hit ? {
		display: hit.display,
		prev: hit.prev
	} : null;
}
function formatGrams(n) {
	if (!Number.isFinite(n) || n <= 0) return "—";
	if (n >= 1e3) return (n / 1e3).toFixed(3) + " kg";
	const d = n >= 100 ? 1 : n >= 10 ? 2 : 3;
	return n.toLocaleString("en-IN", {
		maximumFractionDigits: d,
		minimumFractionDigits: 0
	}) + " g";
}
/** Fill the missing of grams / ₹/g / total from live or that day's close. Avg is always ₹/g. */
function deriveMetal(input) {
	const qIn = input.qty && input.qty > 0 ? input.qty : 0;
	const aIn = input.avg && input.avg > 0 ? input.avg : 0;
	const iIn = input.invested && input.invested > 0 ? input.invested : 0;
	const close = input.close && input.close > 0 ? input.close : 0;
	const live = input.live && input.live > 0 ? input.live : 0;
	let avg = aIn;
	let src = aIn ? "typed ₹/g" : "";
	if (!avg && close) {
		avg = close;
		src = "close on buy date";
	}
	if (!avg && qIn && iIn) {
		avg = iIn / qIn;
		src = "invested ÷ grams";
	}
	if (!avg && live) {
		avg = live;
		src = "live MCX";
	}
	if (!avg) return {
		ok: false,
		error: "Need a price — type ₹/g or pick a buy date"
	};
	let qty = qIn;
	if (!qty && iIn) qty = iIn / avg;
	if (!qty) return {
		ok: false,
		error: "Need grams or total rupees"
	};
	return {
		ok: true,
		qty,
		avg,
		invested: qty * avg,
		filledFrom: src
	};
}
/** Portfolio decision stats — overlap, valuation, correlation, tax clock, PEG/Graham. */
function bareSym(symbol) {
	return String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "").replace(/[-_]SM$/i, "");
}
var niftySet = null;
function niftySymbols() {
	niftySet ??= new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));
	return niftySet;
}
function isNifty50(symbol) {
	return niftySymbols().has(bareSym(symbol));
}
function niftyOverlap(rows) {
	const eq = rows.filter((r) => r.kind !== "commodity");
	const inside = [];
	const satellites = [];
	let weight = 0;
	for (const r of eq) {
		const row = {
			symbol: r.symbol,
			name: r.name,
			weight: r.weight
		};
		if (isNifty50(r.symbol)) {
			inside.push(row);
			weight += r.weight;
		} else satellites.push(row);
	}
	inside.sort((a, b) => b.weight - a.weight);
	satellites.sort((a, b) => b.weight - a.weight);
	return {
		weight,
		count: inside.length,
		total: eq.length,
		inside,
		satellites
	};
}
function weightedAvg(rows, valueOf) {
	let num = 0;
	let den = 0;
	rows.forEach((r, i) => {
		const v = valueOf(r, i);
		if (v == null || !Number.isFinite(v)) return;
		num += r.weight * v;
		den += r.weight;
	});
	return den > 0 ? num / den : null;
}
function simpleAvg(values) {
	const xs = values.filter((v) => v != null && Number.isFinite(v));
	if (!xs.length) return null;
	return xs.reduce((s, x) => s + x, 0) / xs.length;
}
/**
* Aggregate P/E = sum(weight) / sum(weight / P/E).
* Equivalent to portfolio value / attributable earnings. Not a weighted average of the P/E numbers.
*/
function aggregatePe(rows) {
	let wSum = 0;
	let inv = 0;
	let used = 0;
	for (const r of rows) {
		const pe = r.pe != null && Number.isFinite(r.pe) ? r.pe : null;
		if (!(r.weight > 0) || pe == null || !(pe > 0) || pe >= 400) continue;
		wSum += r.weight;
		inv += r.weight / pe;
		used += 1;
	}
	if (!(inv > 0) || used < 1) return {
		value: null,
		status: "unavailable",
		methodology: "Aggregate P/E needs weights and positive constituent P/E.",
		missing: ["P/E"],
		period: null
	};
	return {
		value: wSum / inv,
		status: "derived",
		methodology: `Kosh-derived aggregate P/E from ${used} names: total weight / sum(weight / P/E). Not a weighted average of P/E.`,
		missing: [],
		period: null
	};
}
function mixVsNifty(rows, bySymbol, niftyRows) {
	const eq = rows.filter((r) => r.kind !== "commodity");
	const lookup = (r) => bySymbol.get(bareSym(r.symbol));
	const peOf = (r) => {
		const v = lookup(r)?.pe;
		return v != null && v > 0 && v < 400 ? v : null;
	};
	const covered = eq.filter((r) => peOf(r) != null || lookup(r)?.roe != null).length;
	const n50 = niftyRows.filter((r) => isNifty50(r.symbol));
	return {
		pe: aggregatePe(eq.map((r) => ({
			weight: r.weight,
			pe: peOf(r)
		}))).value,
		weightedPe: weightedAvg(eq, (r) => peOf(r)),
		niftyPe: simpleAvg(n50.map((r) => r.pe != null && r.pe > 0 && r.pe < 400 ? r.pe : null)),
		roe: weightedAvg(eq, (r) => {
			const v = lookup(r)?.roe;
			return v != null && Number.isFinite(v) && Math.abs(v) < 200 ? v : null;
		}),
		niftyRoe: simpleAvg(n50.map((r) => r.roe)),
		de: weightedAvg(eq, (r) => {
			const v = lookup(r)?.de;
			return v != null && v >= 0 && v < 20 ? v : null;
		}),
		niftyDe: simpleAvg(n50.map((r) => r.de != null && r.de >= 0 ? r.de : null)),
		divYield: weightedAvg(eq, (r) => {
			const v = lookup(r)?.divYield;
			return v != null && v >= 0 && v < 30 ? v : null;
		}),
		niftyDiv: simpleAvg(n50.map((r) => r.divYield != null && r.divYield >= 0 ? r.divYield : null)),
		covered,
		niftyCovered: n50.filter((r) => r.pe != null && r.pe > 0 || r.roe != null).length
	};
}
function grahamNumber(eps, book) {
	if (eps == null || book == null || !(eps > 0) || !(book > 0)) return null;
	const g = Math.sqrt(22.5 * eps * book);
	return Number.isFinite(g) && g > 0 ? g : null;
}
/** P/E ÷ profit CAGR %. Only when growth is positive. */
function pegRatio(pe, growthPct) {
	if (pe == null || !(pe > 0) || pe > 400) return null;
	if (growthPct == null || !(growthPct > 0) || growthPct > 200) return null;
	const peg = pe / growthPct;
	if (!Number.isFinite(peg) || peg <= 0 || peg > 80) return null;
	return peg;
}
function taxClock(date, asOf = Date.now()) {
	if (!date) return null;
	const raw = date.length === 10 ? date + "T00:00:00+05:30" : date;
	const t = Date.parse(raw);
	if (!Number.isFinite(t) || t <= 0) return null;
	const days = Math.floor((asOf - t) / 864e5);
	if (days < 0 || days > 2e4) return null;
	return {
		days,
		toLtcg: Math.max(0, 365 - days),
		longTerm: days >= 365
	};
}
function toDayClose(bars) {
	const m = /* @__PURE__ */ new Map();
	for (const b of bars || []) {
		if (!b || !(b.c > 0) || !b.t) continue;
		const day = (/* @__PURE__ */ new Date((b.t + 19800) * 1e3)).toISOString().slice(0, 10);
		m.set(day, b.c);
	}
	return m;
}
function corrFromBars(a, b, minDays = 60) {
	const ma = toDayClose(a);
	const mb = toDayClose(b);
	const days = [...ma.keys()].filter((d) => mb.has(d)).sort();
	if (days.length < minDays + 1) return null;
	const cut = days.slice(-Math.min(days.length, 280));
	const ra = [];
	const rb = [];
	for (let i = 1; i < cut.length; i++) {
		const a0 = ma.get(cut[i - 1]);
		const a1 = ma.get(cut[i]);
		const b0 = mb.get(cut[i - 1]);
		const b1 = mb.get(cut[i]);
		if (a0 > 0 && a1 > 0 && b0 > 0 && b1 > 0) {
			ra.push(a1 / a0 - 1);
			rb.push(b1 / b0 - 1);
		}
	}
	if (ra.length < minDays) return null;
	const n = ra.length;
	let sa = 0;
	let sb = 0;
	for (let i = 0; i < n; i++) {
		sa += ra[i];
		sb += rb[i];
	}
	const maR = sa / n;
	const mbR = sb / n;
	let cov = 0;
	let va = 0;
	let vb = 0;
	for (let i = 0; i < n; i++) {
		const da = ra[i] - maR;
		const db = rb[i] - mbR;
		cov += da * db;
		va += da * da;
		vb += db * db;
	}
	const den = Math.sqrt(va * vb);
	if (!(den > 0)) return null;
	const c = cov / den;
	return Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null;
}
function buildCorrPack(rows, histories, cap = 12, benchBars) {
	const list = rows.filter((r) => r.kind !== "commodity" && r.weight > 0).filter((r) => (histories[r.symbol] || []).length >= 80).sort((a, b) => b.weight - a.weight).slice(0, cap);
	const n = list.length;
	const matrix = Array.from({ length: n }, () => Array(n).fill(null));
	for (let i = 0; i < n; i++) {
		matrix[i][i] = 1;
		for (let j = i + 1; j < n; j++) {
			const c = corrFromBars(histories[list[i].symbol], histories[list[j].symbol]);
			matrix[i][j] = c;
			matrix[j][i] = c;
		}
	}
	const vsNifty = list.map((r) => benchBars?.length ? corrFromBars(histories[r.symbol], benchBars) : null);
	const used = /* @__PURE__ */ new Set();
	const raw = [];
	for (let i = 0; i < n; i++) {
		if (used.has(i)) continue;
		const members = [i];
		used.add(i);
		for (let j = 0; j < n; j++) {
			if (used.has(j)) continue;
			const c = matrix[i][j];
			if (c != null && c >= .5) {
				members.push(j);
				used.add(j);
			}
		}
		raw.push({
			id: "g" + i,
			symbols: members.map((k) => list[k].symbol),
			names: members.map((k) => list[k].name),
			weight: members.reduce((s, k) => s + list[k].weight, 0),
			alone: members.length === 1
		});
	}
	const groups = raw.filter((c) => !c.alone).sort((a, b) => b.weight - a.weight);
	const singles = raw.filter((c) => c.alone);
	if (singles.length) groups.push({
		id: "alone",
		symbols: singles.flatMap((c) => c.symbols),
		names: singles.flatMap((c) => c.names),
		weight: singles.reduce((s, c) => s + c.weight, 0),
		alone: true
	});
	return {
		symbols: list.map((r) => r.symbol),
		names: list.map((r) => r.name),
		weights: list.map((r) => r.weight),
		matrix,
		vsNifty,
		clusters: groups,
		cap
	};
}
function solve(flows) {
	if (flows.length < 2) return {
		rate: null,
		note: "XIRR unavailable — not enough cash flows."
	};
	const sorted = [...flows].sort((a, b) => a.t - b.t);
	const t0 = sorted[0].t;
	const yr = (t) => (t - t0) / 315576e5;
	const npv = (r) => sorted.reduce((s, f) => s + f.v / Math.pow(1 + r, yr(f.t)), 0);
	const pos = sorted.some((f) => f.v > 0);
	const neg = sorted.some((f) => f.v < 0);
	if (!pos || !neg) return {
		rate: null,
		note: "XIRR unavailable — cash flows do not change sign."
	};
	const newton = () => {
		let r = .1;
		for (let i = 0; i < 60; i++) {
			const y = npv(r);
			const d = (npv(r + 1e-6) - y) / 1e-6;
			if (!Number.isFinite(y) || !Number.isFinite(d) || Math.abs(d) < 1e-12) return null;
			const next = r - y / d;
			if (!Number.isFinite(next) || next <= -.9 || next > 10) return null;
			if (Math.abs(next - r) < 1e-8) return Math.abs(npv(next)) < 1 ? next : null;
			r = next;
		}
		return Math.abs(npv(r)) < 1 ? r : null;
	};
	const bisect = (lo0, hi0) => {
		let lo = lo0;
		let hi = hi0;
		let flo = npv(lo);
		let fhi = npv(hi);
		if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
		for (let i = 0; i < 80; i++) {
			const mid = (lo + hi) / 2;
			const fm = npv(mid);
			if (!Number.isFinite(fm)) return null;
			if (Math.abs(fm) < 1e-6 || hi - lo < 1e-8) return mid;
			if (flo * fm <= 0) {
				hi = mid;
				fhi = fm;
			} else {
				lo = mid;
				flo = fm;
			}
		}
		return (lo + hi) / 2;
	};
	const a = newton();
	const b = bisect(-.9, 5);
	if (a != null && b != null && Math.abs(a - b) > .02) {
		const c = bisect(Math.min(a, b) + .05, 8);
		if (c != null && Math.abs(c - a) > .02 && Math.abs(c - b) > .02) return {
			rate: null,
			note: "XIRR ambiguous / multiple solutions."
		};
	}
	const pick = a ?? b;
	if (pick == null || !Number.isFinite(pick)) return {
		rate: null,
		note: "XIRR unavailable — no root in range."
	};
	return {
		rate: pick * 100,
		note: null
	};
}
/** Annualised XIRR from dated cash flows (negative = money out). Null if there is no sign change or the root is ambiguous. */
function xirrFromFlows(flows) {
	return solve(flows).rate;
}
function bookXirr(lines, datedOnly, asOf = Date.now()) {
	let datedValue = 0;
	let missingValue = 0;
	let nDated = 0;
	let nMissing = 0;
	const flows = [];
	let from = null;
	for (const l of lines) {
		const parts = l.lots && l.lots.length ? l.lots.map((lot) => ({
			date: lot.date,
			boughtAt: lot.boughtAt || lot.date,
			qty: lot.qty,
			avg: lot.avg,
			px: l.px,
			value: lot.qty * (l.px || 0)
		})) : [l];
		for (const p of parts) {
			const val = p.value || p.qty * (p.px || 0);
			const when = p.boughtAt || p.date;
			if (when && p.avg != null && p.avg > 0 && p.qty > 0) {
				const t = Date.parse(when);
				if (Number.isFinite(t)) {
					datedValue += val;
					nDated += 1;
					flows.push({
						t,
						v: -(p.avg * p.qty)
					});
					const day = when.slice(0, 10);
					if (!from || day < from) from = day;
					continue;
				}
			}
			missingValue += val;
			nMissing += 1;
		}
	}
	if (datedOnly) {} else if (nMissing && !datedOnly) {}
	if (flows.length && datedValue > 0) flows.push({
		t: asOf,
		v: datedValue
	});
	const solved = solve(flows);
	return {
		xirr: solved.rate,
		note: solved.note,
		datedValue,
		missingValue,
		from,
		nDated,
		nMissing
	};
}
/** Per-holding returns from buy date + average cost. Blank if either is missing. */
var IST = 19800;
function dayOf(unixSec) {
	return (/* @__PURE__ */ new Date((unixSec + IST) * 1e3)).toISOString().slice(0, 10);
}
function retFromDay(bars, fromDay) {
	const src = (bars || []).filter((b) => b && b.c > 0);
	if (src.length < 2) return null;
	const first = src.find((b) => dayOf(b.t) >= fromDay) || src[0];
	const last = src[src.length - 1];
	if (!first?.c || !last?.c) return null;
	if (last.t - first.t < 172800) return null;
	return (last.c / first.c - 1) * 100;
}
function holdingReturn(input) {
	const empty = {
		daysHeld: null,
		xirr: null,
		vsNifty: null,
		vsSector: null,
		contrib: null
	};
	const earliest = (input.lots || []).map((l) => String(l.date || l.boughtAt || "").slice(0, 10)).filter(Boolean).sort()[0] || String(input.date || input.boughtAt || "").slice(0, 10);
	if (!earliest || !input.avg || !(input.avg > 0) || !(input.qty > 0)) return empty;
	const t = Date.parse(earliest + (earliest.length === 10 ? "T00:00:00.000Z" : ""));
	if (!Number.isFinite(t)) return empty;
	const asOf = input.asOf || Date.now();
	const daysHeld = Math.max(0, Math.round((asOf - t) / 864e5));
	const x = bookXirr([{
		date: earliest,
		boughtAt: input.boughtAt || earliest,
		qty: input.qty,
		avg: input.avg,
		px: input.px,
		value: input.value,
		lots: input.lots
	}], true, asOf);
	const mine = input.unrealPct;
	const nifty = retFromDay(input.niftyBars, earliest);
	const sector = retFromDay(input.sectorBars, earliest);
	const total = input.totalUnreal;
	return {
		daysHeld,
		xirr: x.xirr,
		vsNifty: mine != null && nifty != null ? mine - nifty : null,
		vsSector: mine != null && sector != null ? mine - sector : null,
		contrib: total != null && Number.isFinite(total) && Math.abs(total) > 1e-6 && input.unreal != null ? input.unreal / total * 100 : null
	};
}
var RF = .065;
/** Square root of the mean squared shortfall versus a daily target, over every day. */
function downsideDeviation(rets, dailyTarget = RF / 252) {
	if (!rets.length) return 0;
	let sum = 0;
	for (const r of rets) {
		const d = Math.min(r - dailyTarget, 0);
		sum += d * d;
	}
	return Math.sqrt(sum / rets.length);
}
var IST_OFFSET = 19800;
function istDay(unixSec) {
	return (/* @__PURE__ */ new Date((unixSec + IST_OFFSET) * 1e3)).toISOString().slice(0, 10);
}
/** Return over the bars on file. Pass a 1y pack for a 1-year figure. */
function retFromBars(bars, minDays = 200) {
	if (!bars || bars.length < 2) return null;
	const last = bars[bars.length - 1];
	const first = bars[0];
	if (!(first.c > 0) || !(last.c > 0)) return null;
	if ((last.t - first.t) / 86400 < minDays) return null;
	return (last.c / first.c - 1) * 100;
}
function toDayMap(bars) {
	const m = /* @__PURE__ */ new Map();
	for (const b of bars || []) {
		if (!b || !(b.c > 0)) continue;
		const day = istDay(b.t);
		m.set(day, {
			day,
			t: b.t,
			c: b.c
		});
	}
	return m;
}
function currentWeights(withHx, maps) {
	const w = {};
	let sum = 0;
	for (const { h, m } of maps) {
		const px = [...m.values()].at(-1)?.c || 0;
		const val = (h.qty || 1) * px;
		w[h.symbol] = val;
		sum += val;
	}
	if (sum <= 0) {
		const eq = 1 / withHx.length;
		for (const { h } of maps) w[h.symbol] = eq;
		return w;
	}
	for (const k of Object.keys(w)) w[k] = w[k] / sum;
	return w;
}
/**
* Today's weights × each name's own daily adj-close return.
* First print of a name only seeds the previous close (no NAV jump).
* Missing prints are forward-filled. Days covering <60% of weight are dropped.
*/
function buildMixPath(holdings, histories, benchBars, fixedWeights) {
	const withHx = holdings.filter((h) => (histories[h.symbol] || []).length >= 5);
	const missing = holdings.filter((h) => !withHx.some((x) => x.symbol === h.symbol)).map((h) => h.symbol);
	const used = withHx.map((h) => h.symbol);
	if (!withHx.length) return {
		nav: [],
		used,
		missing,
		weights: {},
		coverage: `0/${holdings.length} stocks · 0 days`,
		method: "current-mix"
	};
	const maps = withHx.map((h) => ({
		h,
		m: toDayMap(histories[h.symbol])
	}));
	let weights = currentWeights(withHx, maps);
	if (fixedWeights && Object.keys(fixedWeights).length) {
		const w = {};
		let sum = 0;
		for (const h of withHx) {
			const v = fixedWeights[h.symbol] ?? 0;
			if (v > 0) {
				w[h.symbol] = v;
				sum += v;
			}
		}
		if (sum > 0) {
			for (const k of Object.keys(w)) w[k] = w[k] / sum;
			weights = w;
		}
	}
	const benchMap = toDayMap(benchBars || []);
	const days = /* @__PURE__ */ new Set();
	for (const { m } of maps) for (const d of m.keys()) days.add(d);
	const lastPx = {};
	const prev = {};
	let navPx = 100;
	let bench0 = null;
	let lastBench = null;
	const nav = [];
	for (const day of [...days].sort()) {
		let t = 0;
		let printed = 0;
		for (const { h, m } of maps) {
			const hit = m.get(day);
			if (!hit) continue;
			printed += 1;
			t = t || hit.t;
			lastPx[h.symbol] = hit.c;
		}
		if (printed === 0) continue;
		let wr = 0;
		let wAvail = 0;
		for (const { h } of maps) {
			const px = lastPx[h.symbol];
			if (!(px > 0)) continue;
			const w = weights[h.symbol] || 0;
			if (prev[h.symbol] > 0) {
				wr += w * (px / prev[h.symbol] - 1);
				wAvail += w;
			}
			prev[h.symbol] = px;
		}
		if (wAvail < .6) continue;
		const portR = wr / wAvail;
		navPx *= 1 + portR;
		const b = benchMap.get(day);
		if (b && b.c > 0) {
			if (!bench0) bench0 = b.c;
			lastBench = b.c / bench0 * 100;
			t = b.t || t;
		}
		nav.push({
			t,
			day,
			port: navPx,
			bench: lastBench,
			covered: Object.keys(prev).length,
			names: withHx.length,
			wAvail
		});
	}
	return {
		nav,
		used,
		missing,
		weights,
		coverage: `${used.length}/${holdings.length} stocks · ${nav.length} days`,
		method: "current-mix"
	};
}
function pathFromBars(bars, benchBars) {
	return buildMixPath([{
		symbol: "_s",
		qty: 1,
		name: "_s",
		avg: null,
		date: null
	}], { _s: bars || [] }, benchBars || []);
}
var RANGE_DAYS = {
	"1M": 31,
	"3M": 93,
	"6M": 186,
	"1Y": 372,
	"2Y": 738,
	"3Y": 1107,
	"5Y": 1845,
	"10Y": 3690
};
function sliceNav(nav, range, span) {
	if (!nav.length) return nav;
	if (span?.from || span?.to || range === "CUSTOM") {
		const from = span?.from || "0000-01-01";
		const to = span?.to || "9999-12-31";
		const s = nav.filter((p) => p.day >= from && p.day <= to);
		return s.length >= 2 ? s : nav.slice(-2);
	}
	if (range === "MAX") return nav;
	if (range === "YTD") {
		const y = nav[nav.length - 1].day.slice(0, 4);
		const s = nav.filter((p) => p.day.startsWith(y));
		return s.length >= 2 ? s : nav.slice(-2);
	}
	const days = RANGE_DAYS[range];
	if (!days) return nav;
	const cut = nav[nav.length - 1].t - days * 86400;
	const s = nav.filter((p) => p.t >= cut);
	return s.length >= 2 ? s : nav.slice(-2);
}
function toIndexed(nav) {
	const i0 = nav.findIndex((p) => p.port > 0 && p.bench != null && p.bench > 0);
	const start = i0 >= 0 ? i0 : nav.findIndex((p) => p.port > 0);
	if (start < 0) return [];
	const origin = nav[start];
	return nav.slice(start).map((p) => ({
		...p,
		portIdx: origin.port > 0 ? p.port / origin.port * 100 : 0,
		benchIdx: p.bench && origin.bench ? p.bench / origin.bench * 100 : null,
		dd: 0
	}));
}
function withDrawdown(indexed) {
	let peak = 0;
	return indexed.map((p) => {
		peak = Math.max(peak, p.portIdx);
		return {
			...p,
			dd: peak ? (p.portIdx - peak) / peak * 100 : 0
		};
	});
}
function dayFromUnix(t) {
	return (/* @__PURE__ */ new Date(t * 1e3)).toISOString().slice(0, 10);
}
var WINDOW_SOURCE = "Adjusted close history";
var WINDOW_CALC = "Last trading session at or before the target date, versus the latest session. A later start is not borrowed.";
function unavailable(reason, target, observed = null) {
	return {
		pct: null,
		target,
		observed,
		status: "unavailable",
		reason,
		source: WINDOW_SOURCE,
		calculation: WINDOW_CALC
	};
}
/** Calendar window. Uses the last session at or before the target. Does not borrow a later start date. */
function observeWindow(nav, days, label) {
	if (!nav || nav.length < 2) return unavailable(`insufficient price history for ${label}`, null);
	const last = nav[nav.length - 1];
	const targetSec = last.t - days * 86400;
	const target = dayFromUnix(targetSec);
	let first = null;
	for (const p of nav) if (p.t <= targetSec) first = p;
	if (!first) return unavailable(`insufficient price history for ${label}`, target);
	if (targetSec - first.t > 1036800) return unavailable(`${label}: no trading session within 12 days of ${target}`, target, first.day);
	const pct = first.port > 0 && last.port > 0 ? (last.port / first.port - 1) * 100 : null;
	if (pct == null) return unavailable(`${label}: price was not usable`, target, first.day);
	return {
		pct,
		target,
		observed: first.day,
		status: "available",
		reason: null,
		source: WINDOW_SOURCE,
		calculation: WINDOW_CALC
	};
}
function windowReturn(nav, days) {
	const obs = observeWindow(nav, days, "window");
	if (obs.status !== "available") return {
		port: null,
		bench: null
	};
	const last = nav[nav.length - 1];
	const targetSec = last.t - days * 86400;
	let first = null;
	for (const p of nav) if (p.t <= targetSec) first = p;
	if (!first || !(first.port > 0)) return {
		port: null,
		bench: null
	};
	const bench = first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null;
	return {
		port: obs.pct,
		bench
	};
}
function ytdReturn(nav) {
	if (nav.length < 2) return {
		port: null,
		bench: null
	};
	const y = nav[nav.length - 1].day.slice(0, 4);
	const first = nav.filter((p) => p.day.startsWith(y))[0] || nav[0];
	const last = nav[nav.length - 1];
	if (last.t - first.t < 432e3) return {
		port: null,
		bench: null
	};
	return {
		port: first.port ? (last.port / first.port - 1) * 100 : null,
		bench: first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null
	};
}
function mixCagr(nav) {
	if (nav.length < 2) return null;
	const a = nav[0];
	const b = nav[nav.length - 1];
	const yrs = (b.t - a.t) / 31557600;
	if (yrs < 60 / 365) return null;
	if (!(a.port > 0) || !(b.port > 0)) return null;
	return (Math.pow(b.port / a.port, 1 / yrs) - 1) * 100;
}
function dailyRets(series) {
	const r = [];
	for (let i = 1; i < series.length; i++) {
		const a = series[i - 1];
		const b = series[i];
		if (a > 0 && b > 0) r.push(b / a - 1);
	}
	return r;
}
function alignedRets(nav) {
	const pr = [];
	const br = [];
	for (let i = 1; i < nav.length; i++) {
		const a = nav[i - 1];
		const b = nav[i];
		if (a.port > 0 && b.port > 0 && a.bench != null && a.bench > 0 && b.bench != null && b.bench > 0) {
			pr.push(b.port / a.port - 1);
			br.push(b.bench / a.bench - 1);
		}
	}
	return {
		pr,
		br
	};
}
function avg(a) {
	return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}
function variance(a) {
	if (a.length < 2) return 0;
	const m = avg(a);
	return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
}
function stdev(a) {
	return Math.sqrt(variance(a));
}
function covariance(a, b) {
	const n = Math.min(a.length, b.length);
	if (n < 2) return 0;
	const ma = avg(a.slice(0, n));
	const mb = avg(b.slice(0, n));
	let s = 0;
	for (let i = 0; i < n; i++) s += (a[i] - ma) * (b[i] - mb);
	return s / (n - 1);
}
function corrcoef(a, b) {
	const sa = stdev(a);
	const sb = stdev(b);
	if (!sa || !sb) return null;
	return covariance(a, b) / (sa * sb);
}
var EMPTY_RISK = {
	sharpe: null,
	sortino: null,
	alpha: null,
	beta: null,
	corr: null,
	vol: null,
	maxDd: null,
	upCap: null,
	downCap: null,
	info: null,
	calmar: null,
	cagr: null,
	since: null,
	sessions: 0,
	windowLabel: ""
};
function riskWindow(nav) {
	const overlap = (nav || []).filter((p) => p.port > 0 && p.bench != null && p.bench > 0);
	if (overlap.length < 2) {
		const first = (nav || []).find((p) => p.port > 0);
		[...nav || []].reverse().find((p) => p.port > 0);
		const sessions = nav?.length || 0;
		const since = first?.day || null;
		return {
			since,
			sessions,
			windowLabel: since ? `Since ${since} · ${sessions} sessions (no overlapping index)` : ""
		};
	}
	const since = overlap[0].day;
	const last = overlap[overlap.length - 1].day;
	const sessions = overlap.length;
	return {
		since,
		sessions,
		windowLabel: `Since ${since} through ${last} · ${sessions} sessions vs the index · Rf 6.5%`
	};
}
function riskMetrics(nav) {
	const win = riskWindow(nav);
	if (!nav || nav.length < 10) return {
		...EMPTY_RISK,
		...win
	};
	const rets = dailyRets(nav.map((p) => p.port));
	if (rets.length < 8) return {
		...EMPTY_RISK,
		...win
	};
	const volD = stdev(rets);
	const vol = volD * Math.sqrt(252) * 100;
	const ann = avg(rets) * 252;
	const sharpe = volD ? (ann - RF) / (volD * Math.sqrt(252)) : null;
	const ds = downsideDeviation(rets, RF / 252);
	const sortino = ds > 0 ? (ann - RF) / (ds * Math.sqrt(252)) : null;
	const idx = withDrawdown(toIndexed(nav));
	const maxDd = Math.min(...idx.map((p) => p.dd));
	const cagr = mixCagr(nav);
	const calmar = maxDd && maxDd < 0 && cagr != null ? cagr / Math.abs(maxDd) : null;
	const { pr, br } = alignedRets(nav);
	let beta = null;
	let alpha = null;
	let corr = null;
	let upCap = null;
	let downCap = null;
	let info = null;
	if (pr.length >= 8) {
		const cov = covariance(pr, br);
		const vb = variance(br);
		beta = vb ? cov / vb : null;
		corr = corrcoef(pr, br);
		const rp = avg(pr) * 252;
		const rb = avg(br) * 252;
		alpha = beta != null ? (rp - RF - beta * (rb - RF)) * 100 : null;
		const upP = [];
		const upB = [];
		const dnP = [];
		const dnB = [];
		for (let i = 0; i < pr.length; i++) if (br[i] >= 0) {
			upP.push(pr[i]);
			upB.push(br[i]);
		} else {
			dnP.push(pr[i]);
			dnB.push(br[i]);
		}
		upCap = upB.length && avg(upB) ? avg(upP) / avg(upB) : null;
		downCap = dnB.length && avg(dnB) ? avg(dnP) / avg(dnB) : null;
		const excess = pr.map((x, i) => x - br[i]);
		const te = stdev(excess) * Math.sqrt(252);
		info = te ? avg(excess) * 252 / te : null;
	}
	return {
		sharpe,
		sortino,
		alpha,
		beta,
		corr,
		vol,
		maxDd,
		upCap,
		downCap,
		info,
		calmar,
		cagr,
		...win
	};
}
function monthBuckets(nav) {
	const keys = [...new Set(nav.map((p) => p.day.slice(0, 7)))].sort();
	const rows = [];
	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];
		const inMonth = nav.filter((p) => p.day.startsWith(k));
		const last = inMonth.at(-1);
		const first = i === 0 ? inMonth[0] : nav.filter((p) => p.day.startsWith(keys[i - 1])).at(-1);
		if (!first || !last || first.port <= 0) continue;
		if (last.t - first.t < 691200 && i === 0) continue;
		rows.push({
			key: k,
			port: (last.port / first.port - 1) * 100,
			bench: first.bench && last.bench ? (last.bench / first.bench - 1) * 100 : null
		});
	}
	return rows;
}
function isoWeekMonday(day) {
	const [y, m, d] = day.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	const offset = (dt.getUTCDay() + 6) % 7;
	dt.setUTCDate(dt.getUTCDate() - offset);
	return dt.toISOString().slice(0, 10);
}
function weekBuckets(nav) {
	const m = /* @__PURE__ */ new Map();
	for (const p of nav) m.set(isoWeekMonday(p.day), p);
	const keys = [...m.keys()].sort();
	const rows = [];
	for (let i = 1; i < keys.length; i++) {
		const a = m.get(keys[i - 1]);
		const b = m.get(keys[i]);
		if (!a.port || !b.port) continue;
		rows.push({
			key: keys[i],
			port: (b.port / a.port - 1) * 100,
			bench: a.bench && b.bench ? (b.bench / a.bench - 1) * 100 : null
		});
	}
	return rows;
}
function rollingSeries(nav, winDays) {
	const out = [];
	let j = 0;
	for (let i = 0; i < nav.length; i++) {
		const cut = nav[i].t - winDays * 86400;
		while (j < i && nav[j].t < cut) j++;
		const start = j > 0 && nav[j].t > cut ? j - 1 : j;
		if (nav[i].t - nav[start].t < winDays * 86400 * .7) continue;
		if (!(nav[start].port > 0)) continue;
		const b0 = nav[start].bench;
		const b1 = nav[i].bench;
		out.push({
			t: nav[i].t,
			day: nav[i].day,
			port: (nav[i].port / nav[start].port - 1) * 100,
			bench: b0 && b1 ? (b1 / b0 - 1) * 100 : null
		});
	}
	return out;
}
function fmtInr(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const sign = n < 0 ? "−" : "";
	if (abs >= 1e7) return sign + "₹" + (abs / 1e7).toFixed(2) + " Cr";
	if (abs >= 1e5) return sign + "₹" + (abs / 1e5).toFixed(2) + " L";
	return sign + "₹" + abs.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function fmtTapePx(n, unit) {
	if (n == null || !Number.isFinite(n) || n <= 0) return "—";
	const digits = n >= 1e3 ? 0 : 2;
	const s = n.toLocaleString("en-IN", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
	return unit ? `${s} ${unit}` : s;
}
function fmtPx(n) {
	if (n == null || !Number.isFinite(n) || n <= 0) return "—";
	return n.toLocaleString("en-IN", {
		maximumFractionDigits: n >= 100 ? 2 : 2,
		minimumFractionDigits: 2
	});
}
function fmtPct(n, d = 2) {
	if (n == null || !Number.isFinite(n)) return "—";
	return (n >= 0 ? "+" : "") + n.toFixed(d) + "%";
}
function dash(n, fmt = (x) => x.toFixed(2)) {
	if (n == null || !Number.isFinite(n)) return "—";
	return fmt(n);
}
function saneDayPnl(value, changePct) {
	if (!Number.isFinite(changePct) || !Number.isFinite(value)) return {
		abs: 0,
		pct: 0,
		warn: "Day move unavailable"
	};
	const warn = Math.abs(changePct) > 25 ? "Large move kept. Check for a split, bonus, or a bad print." : null;
	return {
		abs: value * (changePct / 100),
		pct: changePct,
		warn
	};
}
function holdingWindows(bars) {
	const p = pathFromBars(bars, []);
	return {
		w1: windowReturn(p.nav, 7).port,
		m1: windowReturn(p.nav, 31).port,
		m3: windowReturn(p.nav, 93).port,
		m6: windowReturn(p.nav, 186).port,
		y1: windowReturn(p.nav, 365).port,
		ytd: ytdReturn(p.nav).port,
		cagr: mixCagr(p.nav),
		sessions: p.nav.length
	};
}
function sectorSleeve(rows, histories) {
	const groups = {};
	for (const r of rows) {
		const s = r.sector || "Other";
		groups[s] = groups[s] || {
			sector: s,
			rows: [],
			value: 0
		};
		groups[s].rows.push(r);
		groups[s].value += r.value;
	}
	return Object.values(groups).map((g) => {
		const sleeve = buildMixPath(g.rows.map((r) => ({
			symbol: r.symbol,
			qty: r.qty,
			name: r.name,
			avg: r.avg,
			date: r.date
		})), Object.fromEntries(g.rows.map((r) => [r.symbol, histories[r.symbol] || []])), []);
		return {
			sector: g.sector,
			value: g.value,
			names: g.rows.length,
			symbols: g.rows.map((r) => r.symbol),
			windows: {
				m1: windowReturn(sleeve.nav, 31).port,
				m3: windowReturn(sleeve.nav, 93).port,
				y1: windowReturn(sleeve.nav, 365).port,
				ytd: ytdReturn(sleeve.nav).port,
				cagr: mixCagr(sleeve.nav)
			},
			bench: SECTOR_BENCH[g.sector] ?? null
		};
	}).sort((a, b) => b.value - a.value);
}
function insights(book) {
	const pts = [];
	const { holdings, risk, windows, coverage, missing } = book;
	const n = holdings.length;
	if (!n) return [{
		title: "Empty",
		figure: "—",
		body: "Add names to see portfolio quality.",
		tone: "warn"
	}];
	const top = [...holdings].sort((a, b) => b.value - a.value)[0];
	if (top && top.weight > .18) pts.push({
		title: "Concentration",
		figure: (top.weight * 100).toFixed(0) + "%",
		body: `${top.name || top.symbol} is the largest line. Top-name risk is real if the thesis breaks.`,
		tone: top.weight > .28 ? "bad" : "warn"
	});
	else pts.push({
		title: "Spread",
		figure: n + " names",
		body: "No single line dominates. Size is spread across the portfolio.",
		tone: "good"
	});
	if (windows?.y1?.port != null && windows.y1.bench != null) {
		const gap = windows.y1.port - windows.y1.bench;
		pts.push({
			title: "Vs index · 1Y",
			figure: (gap >= 0 ? "+" : "") + gap.toFixed(1) + " pp",
			body: gap >= 0 ? "This portfolio beat the index over the last year." : "This portfolio lagged Nifty. The index is the default alternative — see the gap, don’t ignore it.",
			tone: gap >= 0 ? "good" : "bad"
		});
	}
	if (risk.maxDd != null) pts.push({
		title: "Max drawdown",
		figure: risk.maxDd.toFixed(1) + "%",
		body: "Worst fall from a peak on this portfolio. Buy dates not required.",
		tone: risk.maxDd < -25 ? "bad" : "warn"
	});
	if (risk.downCap != null) pts.push({
		title: "Down capture",
		figure: (risk.downCap * 100).toFixed(0) + "%",
		body: risk.downCap < 1 ? "Fell less than the index on down days." : "Fell more than the index on down days.",
		tone: risk.downCap < 1 ? "good" : "bad"
	});
	const off = holdings.filter((h) => h.offHigh != null && h.offHigh <= -20).length;
	if (off) pts.push({
		title: "Off highs",
		figure: off + " names",
		body: "≥20% below 52-week high. Check thesis, don’t average blindly.",
		tone: "warn"
	});
	if (missing?.length) pts.push({
		title: "Chart coverage",
		figure: coverage,
		body: "No price history for " + missing.join(", ") + ". The chart uses the rest.",
		tone: "warn"
	});
	const winners = holdings.filter((h) => h.unrealPct > 0).length;
	const losers = holdings.filter((h) => h.unrealPct < 0).length;
	pts.push({
		title: "Winners / losers",
		figure: winners + " / " + losers,
		body: losers > winners ? "More names are underwater. The usual trap is holding losers hoping they come back. Check the thesis, don’t wait for even." : "Unrealized vs average price on current quantity.",
		tone: winners >= losers ? "good" : "warn"
	});
	return pts.slice(0, 8);
}
function assembleBook(args) {
	const { holdings, quotes, histories, packs, benchSymbol, benchName, asOf, hxRange } = args;
	const include = args.includeCommodities !== false;
	const benchBars = packs[benchSymbol]?.bars || [];
	const rows = holdings.map((h) => {
		const qrow = quotes[baseKey(h.symbol)] || quotes[h.symbol] || {};
		const px = qrow.price || h.avg || 0;
		const value = h.qty * px;
		const costKnown = h.avg != null && h.avg > 0 && Number.isFinite(h.avg);
		const invested = costKnown ? h.qty * h.avg : 0;
		const unreal = costKnown ? value - invested : 0;
		const unrealPct = costKnown && h.avg ? (px / h.avg - 1) * 100 : 0;
		const offHigh = qrow.high52 ? (px / qrow.high52 - 1) * 100 : null;
		const qName = qrow.name && !isIsin(qrow.name) ? qrow.name : "";
		const sector = (h.sector && h.sector !== "Other" ? h.sector : "") || sectorOf(h.symbol);
		const kind = isCommodity(h.symbol) ? "commodity" : h.kind || "equity";
		return {
			...h,
			kind,
			unit: kind === "commodity" ? "g" : h.unit || "shares",
			name: displayName({
				symbol: h.symbol,
				name: qName || h.name
			}),
			resolved: qrow.symbol || h.symbol,
			px,
			value,
			invested,
			unreal,
			unrealPct,
			costKnown,
			changePct: qrow.changePct || 0,
			high52: qrow.high52 || 0,
			offHigh,
			sector,
			cap: capFromMcap(qrow.mcapCr, h.symbol),
			weight: 0,
			periods: holdingWindows(histories[h.symbol] || []),
			vsSectorY1: null,
			sectorIndexY1: null,
			sectorIndexName: "",
			daysHeld: null,
			xirr: null,
			vsNiftyHold: null,
			vsSectorHold: null,
			contrib: null
		};
	});
	const active = include ? rows : rows.filter((r) => r.kind !== "commodity");
	const value = active.reduce((s, r) => s + r.value, 0);
	const invested = active.reduce((s, r) => s + (r.costKnown ? r.invested : 0), 0);
	const unreal = active.reduce((s, r) => s + (r.costKnown ? r.unreal : 0), 0);
	const costMissing = active.filter((r) => !r.costKnown).length;
	rows.forEach((r) => {
		r.weight = r.kind === "commodity" && !include ? 0 : value ? r.value / value : 0;
	});
	const dayBits = active.map((r) => saneDayPnl(r.value, r.changePct));
	const dayAbs = dayBits.reduce((s, x) => s + x.abs, 0);
	const dayPct = value ? dayAbs / value * 100 : 0;
	const dayWarn = dayBits.find((x) => x.warn)?.warn || null;
	const mix = buildMixPath(active.map((r) => ({
		symbol: r.symbol,
		qty: r.qty,
		name: r.name,
		avg: r.avg,
		date: r.date,
		kind: r.kind,
		unit: r.unit
	})), histories, benchBars);
	const nav1y = sliceNav(mix.nav, "1Y");
	const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
	const windows = {
		w1: windowReturn(mix.nav, 7),
		m1: windowReturn(mix.nav, 31),
		m3: windowReturn(mix.nav, 93),
		m6: windowReturn(mix.nav, 186),
		y1: windowReturn(mix.nav, 365),
		ytd: ytdReturn(mix.nav)
	};
	const months = monthBuckets(mix.nav);
	const cagr = mixCagr(mix.nav);
	const sectors = {};
	for (const r of active) {
		sectors[r.sector] = sectors[r.sector] || {
			value: 0,
			pnl: 0
		};
		sectors[r.sector].value += r.value;
		sectors[r.sector].pnl += r.unreal;
	}
	const sleeves = sectorSleeve(active, histories).map((s) => {
		const spec = s.bench;
		if (!spec) return {
			sector: s.sector,
			value: s.value,
			names: s.names,
			symbols: s.symbols,
			windows: s.windows,
			indexName: "Benchmark unavailable",
			indexSymbol: "",
			index: {
				m1: null,
				m3: null,
				y1: null,
				ytd: null
			}
		};
		const idx = pathFromBars(packs[spec.symbol]?.bars || [], []);
		return {
			sector: s.sector,
			value: s.value,
			names: s.names,
			symbols: s.symbols,
			windows: s.windows,
			indexName: spec.name,
			indexSymbol: spec.symbol,
			index: {
				m1: windowReturn(idx.nav, 31).port,
				m3: windowReturn(idx.nav, 93).port,
				y1: windowReturn(idx.nav, 365).port,
				ytd: ytdReturn(idx.nav).port
			}
		};
	});
	for (const r of rows) {
		const sl = sleeves.find((s) => s.sector === r.sector);
		r.sectorIndexY1 = sl?.index.y1 ?? null;
		r.sectorIndexName = sl?.indexName || "";
		r.vsSectorY1 = r.periods.y1 != null && sl?.index.y1 != null ? r.periods.y1 - sl.index.y1 : null;
	}
	const niftyBars = packs["^NSEI"]?.bars || (benchSymbol === "^NSEI" ? benchBars : []);
	const totalUnreal = active.reduce((s, r) => s + r.unreal, 0);
	for (const r of rows) {
		const sl = sleeves.find((s) => s.sector === r.sector);
		const sectorBars = sl ? packs[sl.indexSymbol]?.bars : void 0;
		const hr = holdingReturn({
			date: r.date,
			boughtAt: r.boughtAt,
			avg: r.avg,
			qty: r.qty,
			px: r.px,
			value: r.value,
			unreal: r.unreal,
			unrealPct: r.unrealPct,
			bars: histories[r.symbol],
			niftyBars,
			sectorBars,
			totalUnreal,
			lots: r.lots
		});
		r.daysHeld = hr.daysHeld;
		r.xirr = hr.xirr;
		r.vsNiftyHold = hr.vsNifty;
		r.vsSectorHold = hr.vsSector;
		r.contrib = hr.contrib;
	}
	const caps = {
		Large: 0,
		Mid: 0,
		Small: 0,
		Micro: 0
	};
	for (const r of active) caps[r.cap] = (caps[r.cap] || 0) + r.value;
	const commodityValue = rows.filter((r) => r.kind === "commodity").reduce((s, r) => s + r.value, 0);
	const equityValue = rows.filter((r) => r.kind !== "commodity").reduce((s, r) => s + r.value, 0);
	const levers = riskLevers(active.map((r) => ({
		symbol: r.symbol,
		qty: r.qty,
		name: r.name,
		avg: r.avg,
		date: r.date,
		kind: r.kind,
		unit: r.unit
	})), histories, benchBars, active, risk, cagr);
	const corr = buildCorrPack(active, histories, 12, benchBars);
	return {
		rows,
		value,
		invested,
		unreal,
		costMissing,
		dayAbs,
		dayPct,
		dayWarn,
		mix,
		risk,
		windows,
		months,
		cagr,
		sectors,
		sleeves,
		caps,
		asOf: asOf || "",
		hxRange: hxRange || "max",
		benchName,
		benchSymbol,
		coverage: mix.coverage,
		missing: mix.missing,
		holdings: rows,
		firstDay: mix.nav[0]?.day,
		lastDay: mix.nav.at(-1)?.day,
		includeCommodities: include,
		commodityValue,
		equityValue,
		levers,
		corr,
		path: null
	};
}
function previewAdd(holdings, histories, benchBars, add, addBars, weight, px) {
	if (!(weight > 0) || !(px > 0) || !holdings.length) return null;
	const hx = {
		...histories,
		[add.symbol]: addBars
	};
	const baseMix = buildMixPath(holdings, histories, benchBars);
	const baseNav = sliceNav(baseMix.nav, "1Y");
	const baseline = riskMetrics(baseNav.length >= 60 ? baseNav : baseMix.nav);
	const baseCagr = mixCagr(baseMix.nav);
	const value = holdings.reduce((s, h) => {
		const last = (histories[h.symbol] || []).at(-1)?.c || 0;
		return s + h.qty * last;
	}, 0);
	if (!(value > 0)) return null;
	const qty = weight * value / ((1 - weight) * px);
	if (!(qty > 0)) return null;
	const key = add.symbol;
	let hit = false;
	const next = holdings.map((h) => {
		if (h.symbol !== key) return h;
		hit = true;
		return {
			...h,
			qty: h.qty + qty
		};
	});
	const mix = buildMixPath(hit ? next : [...next, {
		...add,
		qty
	}], hx, benchBars);
	const nav1y = sliceNav(mix.nav, "1Y");
	const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
	const cagr = mixCagr(mix.nav);
	return {
		dSharpe: risk.sharpe != null && baseline.sharpe != null ? risk.sharpe - baseline.sharpe : null,
		dMaxDd: risk.maxDd != null && baseline.maxDd != null ? risk.maxDd - baseline.maxDd : null,
		dVol: risk.vol != null && baseline.vol != null ? risk.vol - baseline.vol : null,
		dCagr: cagr != null && baseCagr != null ? cagr - baseCagr : null
	};
}
function riskLevers(holdings, histories, benchBars, rows, baseline, baselineCagr) {
	const top = [...rows].filter((r) => r.kind !== "commodity" && r.weight > 0 && r.qty > 0).sort((a, b) => b.weight - a.weight).slice(0, 8);
	const out = [];
	for (const r of top) for (const action of [
		"cut",
		"trim",
		"add"
	]) {
		const next = holdings.map((h) => {
			if (h.symbol !== r.symbol) return h;
			if (action === "cut") return {
				...h,
				qty: 0
			};
			if (action === "trim") return {
				...h,
				qty: h.qty * .5
			};
			return {
				...h,
				qty: h.qty * 1.5
			};
		}).filter((h) => h.qty > 0);
		if (!next.length) continue;
		const mix = buildMixPath(next, histories, benchBars);
		const nav1y = sliceNav(mix.nav, "1Y");
		const risk = riskMetrics(nav1y.length >= 60 ? nav1y : mix.nav);
		const cagr = mixCagr(mix.nav);
		out.push({
			symbol: r.symbol,
			name: r.name,
			weight: r.weight,
			action,
			label: action === "cut" ? "Remove" : action === "trim" ? "Halve qty" : "Add 50%",
			sharpe: risk.sharpe,
			maxDd: risk.maxDd,
			vol: risk.vol,
			cagr,
			dSharpe: risk.sharpe != null && baseline.sharpe != null ? risk.sharpe - baseline.sharpe : null,
			dMaxDd: risk.maxDd != null && baseline.maxDd != null ? risk.maxDd - baseline.maxDd : null,
			dVol: risk.vol != null && baseline.vol != null ? risk.vol - baseline.vol : null,
			dCagr: cagr != null && baselineCagr != null ? cagr - baselineCagr : null
		});
	}
	return out;
}
function leverImproveScore(l) {
	const sharpe = l.dSharpe ?? 0;
	const dd = l.dMaxDd ?? 0;
	const vol = -(l.dVol ?? 0);
	const cagr = l.dCagr ?? 0;
	return sharpe * 4 + dd * .08 + vol * .08 + cagr * .08;
}
/** One action per name — the one that lifts the scores most. Improving moves first. */
function pickMaterialLevers(levers, cap = 5) {
	const material = levers.filter((l) => {
		return Math.abs(l.dSharpe || 0) >= .08 || Math.abs(l.dMaxDd || 0) >= 1.2 || Math.abs(l.dVol || 0) >= 1.2 || Math.abs(l.dCagr || 0) >= 1.2;
	});
	const best = /* @__PURE__ */ new Map();
	for (const l of material) {
		const prev = best.get(l.symbol);
		if (!prev || leverImproveScore(l) > leverImproveScore(prev)) best.set(l.symbol, l);
	}
	return [...best.values()].sort((a, b) => leverImproveScore(b) - leverImproveScore(a)).slice(0, cap);
}
function baseKey(s) {
	return String(s || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
}
function mergeNav(a, b) {
	const mb = new Map(b.map((p) => [p.day, p]));
	const ma = new Map(a.map((p) => [p.day, p]));
	const days = [.../* @__PURE__ */ new Set([...ma.keys(), ...mb.keys()])].sort();
	let lastA = null;
	let lastB = null;
	const out = [];
	for (const day of days) {
		const pa = ma.get(day);
		const pb = mb.get(day);
		if (pa) lastA = pa.port;
		if (pb) lastB = pb.port;
		if (lastA == null || lastB == null) continue;
		const t = pa?.t || pb?.t || 0;
		out.push({
			t,
			day,
			port: lastA,
			bench: lastB,
			covered: 2,
			names: 2,
			wAvail: 1
		});
	}
	return out;
}
function withSleeveIndex(book, packs) {
	const idx = {};
	for (const d of packs) {
		idx[d.input] = d;
		idx[d.symbol] = d;
	}
	return {
		...book,
		sleeves: book.sleeves.map((s) => {
			const bars = idx[s.indexSymbol]?.bars || [];
			if (!bars.length) return s;
			const path = pathFromBars(bars, []);
			return {
				...s,
				index: {
					m1: windowReturn(path.nav, 31).port,
					m3: windowReturn(path.nav, 93).port,
					y1: windowReturn(path.nav, 365).port,
					ytd: ytdReturn(path.nav).port
				}
			};
		})
	};
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/mark-CES55ZYk.js
var TILE = "#09090b";
var INK = "#f2f2f4";
var LINE = "#7aa2ff";
var ICON_META = [
	{
		id: "k-path",
		title: "K-path",
		blurb: "A K with the portfolio line underneath. Closest to the current mark."
	},
	{
		id: "bowl",
		title: "Kosh",
		blurb: "A simple vessel — kosh as a place you keep the portfolio."
	},
	{
		id: "twin",
		title: "Two lines",
		blurb: "Portfolio vs the index. The whole product in one glyph."
	},
	{
		id: "ledger",
		title: "Ledger",
		blurb: "Three bars and a tick. A holdings snapshot, not a trade blotter."
	},
	{
		id: "coin",
		title: "Coin K",
		blurb: "A round stamp with K. Reads at 16px and on a home screen."
	},
	{
		id: "fold",
		title: "Fold",
		blurb: "A page corner and a rising path. The chart is the document."
	}
];
function IconMark({ id, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": true,
		suppressHydrationWarning: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				fill: TILE
			}),
			id === "k-path" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M9 7h3.15v8.15L19.7 7H23l-8.15 9.25L23.2 25h-3.45l-7.6-8.7V25H9V7z",
				fill: INK
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M7 24.5c4.2-3.2 7.8-2.1 12.4-6.4 2.6-2.4 5.2-5.8 7.1-8.6",
				fill: "none",
				stroke: LINE,
				strokeWidth: "1.35",
				strokeLinecap: "round"
			})] }) : null,
			id === "bowl" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 12.5c0 6.2 3.4 11 8 11s8-4.8 8-11",
					fill: "none",
					stroke: INK,
					strokeWidth: "2.1",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 12.5h16",
					fill: "none",
					stroke: INK,
					strokeWidth: "1.6",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M10 18c2.2 3.4 4.1 4.6 6 4.6 1.9 0 3.8-1.2 6-4.6",
					fill: "none",
					stroke: LINE,
					strokeWidth: "1.5",
					strokeLinecap: "round"
				})
			] }) : null,
			id === "twin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 22 11 16 15 18 21 10 26 12",
				fill: "none",
				stroke: LINE,
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 24 12 20 16 21 22 15 26 17",
				fill: "none",
				stroke: INK,
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})] }) : null,
			id === "ledger" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 10h16",
					stroke: INK,
					strokeWidth: "2",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 16h11",
					stroke: INK,
					strokeWidth: "2",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 22h8",
					stroke: INK,
					strokeWidth: "2",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M19 20.5 21.2 23 26 16",
					fill: "none",
					stroke: LINE,
					strokeWidth: "1.8",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			] }) : null,
			id === "coin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "9.2",
				fill: "none",
				stroke: INK,
				strokeWidth: "1.8"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.2 10.4h2.4v5.2L20 10.4h2.4l-6.1 6.9 6.3 7.3h-2.55l-5.45-6.3v6.3h-2.4V10.4z",
				fill: LINE
			})] }) : null,
			id === "fold" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M9 8h10l5 5v11H9V8z",
					fill: "none",
					stroke: INK,
					strokeWidth: "1.7",
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M19 8v5h5",
					fill: "none",
					stroke: INK,
					strokeWidth: "1.5",
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M11 22 15 16 18 18 22 12",
					fill: "none",
					stroke: LINE,
					strokeWidth: "1.7",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			] }) : null
		]
	});
}
function Mark({ className }) {
	const id = useKosh((s) => s.iconId) || "k-path";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMark, {
		id,
		className
	});
}
function IconHydrate() {
	const id = useKosh((s) => s.iconId) || "k-path";
	(0, import_react.useEffect)(() => {
		const href = `/icon-options/${id}.svg`;
		document.querySelectorAll("link[rel=\"icon\"]").forEach((el) => {
			el.href = href;
		});
	}, [id]);
	return null;
}
function BrandLink({ to = "/", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("inline-flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[15px] font-semibold tracking-[0.04em]",
			children: "Kosh"
		})]
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/input-CX2K4_fw.js
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-10 w-full rounded-sm bg-bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/label-i5zU_9JN.js
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("grid gap-1.5 text-[12px] font-medium text-muted", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/seg-Bpuyi82H.js
function Seg({ value, onChange, options, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex flex-wrap gap-0.5 rounded-sm bg-bg-elevated p-0.5 shadow-[var(--shadow-border)]", className),
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(o.id),
			className: cn("inline-flex h-8 items-center justify-center rounded-[6px] px-2.5 text-[12px] font-medium leading-none transition-colors duration-150", value === o.id ? "bg-surface text-fg" : "text-muted hover:text-fg"),
			children: o.label
		}, o.id))
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/hero-mix-SmVZT1Vl.js
var MIX = [
	100,
	101.4,
	99.2,
	103.8,
	107.6,
	106.1,
	111.4,
	117.8,
	114.6,
	121.2,
	118.9,
	126.4,
	130.1,
	127.8,
	134.6,
	141.2,
	138.4,
	146.1,
	152.4,
	149.6,
	157.2,
	162.8,
	159.4,
	166.2
];
var BENCH = [
	100,
	100.8,
	98.4,
	101.9,
	104.6,
	103.4,
	107.2,
	110.8,
	108.6,
	113.4,
	112.1,
	116.6,
	119.4,
	117.2,
	121.8,
	125.6,
	123.4,
	128.2,
	132.4,
	130.1,
	134.8,
	138.2,
	135.8,
	140.6
];
function toPath(vals, w, h) {
	const min = 90;
	const n = vals.length;
	return vals.map((v, i) => {
		const x = i / (n - 1) * w;
		const y = h - (v - min) / 82 * h;
		return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
}
function Count({ to, suffix = "", digits = 1 }) {
	const [n, setN] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setN(to);
			return;
		}
		const t0 = performance.now();
		let raf = 0;
		const tick = (t) => {
			const p = Math.min(1, (t - t0) / 1100);
			const e = 1 - Math.pow(1 - p, 3);
			setN(to * e);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [to]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "tabular font-mono",
		children: [n.toFixed(digits), suffix]
	});
}
function HeroMix() {
	const mix = (0, import_react.useMemo)(() => toPath(MIX, 640, 220), []);
	const bench = (0, import_react.useMemo)(() => toPath(BENCH, 640, 220), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: "A sample portfolio versus Nifty 50"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-[13px] text-muted",
					children: "What your holdings path looks like — open a portfolio for yours"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 text-[12px] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-[3px] w-3.5 rounded-full bg-chart" }),
							"You ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									to: 66.2,
									suffix: "%"
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-[3px] w-3.5 rounded-full bg-chart-bench" }),
							"Nifty ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									to: 40.6,
									suffix: "%"
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 640 220",
				className: "h-[180px] w-full sm:h-[210px]",
				role: "img",
				"aria-label": "Sample portfolio beating Nifty 50 over ten years",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "koshFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#7aa2ff",
							stopOpacity: "0.28"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#7aa2ff",
							stopOpacity: "0"
						})]
					}) }),
					[
						0,
						55,
						110,
						165,
						220
					].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						y1: y,
						x2: "640",
						y2: y,
						stroke: "currentColor",
						className: "text-border",
						strokeWidth: "1"
					}, y)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `${mix} L640,220 L0,220 Z`,
						fill: "url(#koshFill)",
						className: "kosh-fade"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: bench,
						fill: "none",
						stroke: "#9a9aa4",
						strokeWidth: "1.7",
						strokeDasharray: "5 4",
						className: "kosh-draw kosh-draw-bench"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: mix,
						fill: "none",
						stroke: "#7aa2ff",
						strokeWidth: "2.3",
						strokeLinecap: "round",
						className: "kosh-draw kosh-draw-mix"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-3 gap-2 text-[12px]",
				children: [
					["Coverage", "8/8 names"],
					["Sessions", "2,480"],
					["1Y gap", "+8.1 pp"]
				].map(([k, v], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "kosh-rise rounded-lg bg-bg-elevated px-3 py-2.5",
					style: { animationDelay: `${180 + i * 80}ms` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 font-mono text-fg tabular",
						children: v
					})]
				}, k))
			})
		]
	});
}
var SLEEVES = [
	{
		name: "Financials",
		pct: 32
	},
	{
		name: "Telecom",
		pct: 22
	},
	{
		name: "IT",
		pct: 18
	},
	{
		name: "Energy",
		pct: 12
	},
	{
		name: "Healthcare",
		pct: 9
	},
	{
		name: "FMCG",
		pct: 7
	}
];
function HeroSleeves() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[28px] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
			children: "Where the money sits"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-2.5",
			children: SLEEVES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[92px_1fr_36px] items-center gap-2 text-[12px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-muted",
						children: s.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 overflow-hidden rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "kosh-bar h-full rounded-full bg-chart",
							style: {
								width: `${s.pct}%`,
								animationDelay: `${220 + i * 70}ms`
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right font-mono tabular text-subtle",
						children: [s.pct, "%"]
					})
				]
			}, s.name))
		})]
	});
}
//#endregion
export { withDrawdown as $, usePortfolio as $t, mcxToGram as A, lastNum as At, pegRatio as B, retFrom as Bt, formatGrams as C, ema as Ct, isCommodity as D, isWatched as Dt, insights as E, isNr7 as Et, monthBuckets as F, patchLastBar as Ft, riskMetrics as G, stoch as Gt, pickMcxSpot as H, sessionOpeningRange as Ht, niftyOverlap as I, priorDayRange as It, sliceNav as J, termBars as Jt, rollingSeries as K, supertrend as Kt, parseGrowwLive as L, quoteMap as Lt, metalKey as M, macd as Mt, mixCagr as N, nameSwings as Nt, isNifty50 as O, lastBbPos as Ot, mixVsNifty as P, newDrawId as Pt, windowReturn as Q, useKosh as Qt, parseGrowwMcx as R, quoteStatus as Rt, fmtTapePx as S, tickerName as Sn, drawKey as St, gramToMcx as T, instrumentKind as Tt, previewAdd as U, sma as Ut, pickMaterialLevers as V, rsi as Vt, retFromBars as W, snapTermHeight as Wt, toIndexed as X, termHeightName as Xt, taxClock as Y, termFetchSpec as Yt, weekBuckets as Z, terminalSearch as Zt, deriveMetal as _, displayName as _n, bareSymbol as _t, Label as a, guessTicker as an, NIFTY500 as at, fmtPct as b, resolveBench as bn, delayMinutesFromMeta as bt, ICON_META as c, sortTrades as cn, isListedSymbol as ct, METALS as d, BENCH$1 as dn, Button as dt, volAvg as en, withSleeveIndex as et, TROY_OZ_G as f, TAPE as fn, ICON_IDS as ft, dash as g, cn as gn, atr as gt, bookXirr as h, allSectorBenchSymbols as hn, TERM_INTERVALS as ht, Seg as i, classifyIncoming as in, NIFTY50 as it, mergeNav as j, lastRsi as jt, istDay as k, lastMacdHist as kt, IconHydrate as l, tradeHasClock as ln, searchNse as lt, bareSym as m, YF_ALIAS as mn, TERM_HEIGHT as mt, HeroMix as n, vwap as nn, ytdReturn as nt, Input as o, parseHoldingsFiles as on, NSE_EQ as ot, assembleBook as p, TICKER_NAMES as pn, MARKET_PROVIDER as pt, saneDayPnl as q, swings as qt, HeroSleeves as r, auditTradeLines as rn, DEEP_UNIVERSE as rt, BrandLink as s, parseVoice as sn, SCREEN_UNIVERSE as st, router_exports as t, volumeProfile as tn, xirrFromFlows as tt, IconMark as u, tradeMs as un, universeName as ut, etfToGramPrice as v, isIsin as vn, bollinger as vt, grahamNumber as w, fmtVol as wt, fmtPx as x, sectorIndex as xn, detectRetest as xt, fmtInr as y, registerLiveIsins as yn, chartStructure as yt, pathFromBars as z, quoteStatusLabel as zt };
