import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as useNavigate, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, w as useRouter, x as Link, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { a as emptyCloud, c as getSql, d as sanitizeForCloud, f as sectorOf, i as capOf, l as mergeCloud, t as authMiddleware } from "./cloud-state-Cn-qMj7l.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as auth, t as GROK_PROVIDERS } from "./server-BhKl5bfJ.mjs";
import { i as TriangleAlert, o as Sun, v as Moon } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { A as mcxToGram, B as pegRatio, Bt as retFrom, Ct as ema, Et as isNr7, H as pickMcxSpot, L as parseGrowwLive, M as metalKey, O as isNifty50, Ot as lastBbPos, Qt as useKosh, R as parseGrowwMcx, Sn as tickerName, Ut as sma, a as Label, at as NIFTY500, b as fmtPct, bt as delayMinutesFromMeta, d as METALS, dt as Button, en as volAvg, f as TROY_OZ_G, fn as TAPE, gn as cn, i as Seg, it as NIFTY50, jt as lastRsi, k as istDay, kt as lastMacdHist, l as IconHydrate, lt as searchNse, mn as YF_ALIAS, n as HeroMix, o as Input, ot as NSE_EQ, pn as TICKER_NAMES, pt as MARKET_PROVIDER, qt as swings, rt as DEEP_UNIVERSE, s as BrandLink, st as SCREEN_UNIVERSE, ut as universeName, v as etfToGramPrice, wt as fmtVol, x as fmtPx, xt as detectRetest, yn as registerLiveIsins } from "./router-DhekK0Gr2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fin-series-BRUZDehW.js
var MONTHS$2 = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var MON$1 = {
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	may: 5,
	jun: 6,
	jul: 7,
	aug: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dec: 12
};
function year2(n) {
	return n < 100 ? n >= 70 ? 1900 + n : 2e3 + n : n;
}
function parsePeriod(period) {
	const s = String(period || "").trim();
	const iso = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
	if (iso) {
		const y = Number(iso[1]);
		const m = Number(iso[2]);
		return {
			y,
			m,
			t: y * 100 + m
		};
	}
	if (/^\d{4}$/.test(s)) {
		const y = Number(s);
		return {
			y,
			m: 3,
			t: y * 100 + 3
		};
	}
	const fy = s.match(/^FY\s*['’′]?(\d{2}|\d{4})$/i);
	if (fy) {
		const y = year2(Number(fy[1]));
		return {
			y,
			m: 3,
			t: y * 100 + 3
		};
	}
	const mon = s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*['’′\-]?\s*(\d{2}|\d{4})$/i);
	if (mon) {
		const m = MON$1[mon[1].slice(0, 3).toLowerCase()];
		const y = year2(Number(mon[2]));
		return {
			y,
			m,
			t: y * 100 + m
		};
	}
	const nse = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[a-z]*\.?[-/ ](\d{2}|\d{4})$/);
	if (nse) {
		const m = MON$1[nse[2].slice(0, 3).toLowerCase()];
		const y = year2(Number(nse[3]));
		if (m) return {
			y,
			m,
			t: y * 100 + m
		};
	}
	const q = s.match(/^Q([1-4])\s*FY\s*['’′]?(\d{2}|\d{4})$/i);
	if (q) {
		const qi = Number(q[1]);
		const fyY = year2(Number(q[2]));
		const m = qi === 1 ? 6 : qi === 2 ? 9 : qi === 3 ? 12 : 3;
		const y = qi === 4 ? fyY : fyY - 1;
		return {
			y,
			m,
			t: y * 100 + m
		};
	}
	return null;
}
function formatFinPeriod(period, kind = "year") {
	const p = parsePeriod(period);
	if (!p) return String(period || "").slice(0, 12);
	const yy = String(p.y).slice(-2);
	if (kind === "year") return `FY${yy}`;
	if (p.m === 6) return `Q1 FY${String(p.y + 1).slice(-2)}`;
	if (p.m === 9) return `Q2 FY${String(p.y + 1).slice(-2)}`;
	if (p.m === 12) return `Q3 FY${String(p.y + 1).slice(-2)}`;
	if (p.m === 3) return `Q4 FY${yy}`;
	return `${MONTHS$2[p.m - 1] || p.m} ${yy}`;
}
function formatFinMonth(period) {
	const p = parsePeriod(period);
	if (!p) return String(period || "").slice(0, 12);
	if (String(period).trim().match(/^\d{4}$/)) return `Mar ${p.y}`;
	return `${MONTHS$2[p.m - 1] || p.m} ${p.y}`;
}
function fullCr(n) {
	if (!Number.isFinite(n)) return "—";
	const sign = n < 0 ? "−" : "";
	const a = Math.abs(n);
	const digits = a >= 100 || a === Math.round(a) ? 0 : a >= 10 ? 1 : 2;
	return sign + a.toLocaleString("en-IN", { maximumFractionDigits: digits });
}
/** Compact ₹ crore for axis / bar labels. L = lakh crore. */
function compactCr(n) {
	if (!Number.isFinite(n)) return "—";
	const sign = n < 0 ? "−" : "";
	const a = Math.abs(n);
	if (a === 0) return "0";
	if (a >= 1e5) {
		const x = a / 1e5;
		const d = x >= 10 ? 1 : 2;
		return sign + x.toFixed(d).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1") + "L";
	}
	if (a >= 100) return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 0 });
	if (a >= 10) return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 1 });
	return sign + a.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function present(v) {
	return v != null && Number.isFinite(v);
}
function empty(v) {
	return !present(v) || v === 0;
}
function periodRank(period) {
	const p = parsePeriod(period);
	return p ? p.t : Number.POSITIVE_INFINITY;
}
function buildFinRows(sales, profits, kind, n = 6) {
	const sMap = new Map(sales.map((x) => [x.period, x.value]));
	const pMap = new Map(profits.map((x) => [x.period, x.value]));
	const rows = [.../* @__PURE__ */ new Set([...sales.map((x) => x.period), ...profits.map((x) => x.period)])].sort((a, b) => periodRank(a) - periodRank(b) || a.localeCompare(b)).map((period) => {
		const s = sMap.has(period) ? sMap.get(period) : null;
		const p = pMap.has(period) ? pMap.get(period) : null;
		return {
			period,
			label: formatFinPeriod(period, kind),
			sales: present(s) ? s : null,
			profit: present(p) ? p : null
		};
	});
	while (rows.length && empty(rows[rows.length - 1].sales) && empty(rows[rows.length - 1].profit)) rows.pop();
	return rows.slice(-n);
}
function crTicks(lo, hi, n = 5) {
	if (!(Number.isFinite(lo) && Number.isFinite(hi))) return [0];
	if (hi === lo) hi = lo + 1;
	const raw = (hi - lo) / Math.max(1, n - 1);
	const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
	const step = [
		1,
		2,
		2.5,
		5,
		10
	].map((x) => x * mag).find((x) => x >= raw) || raw;
	const start = Math.floor(lo / step) * step;
	const out = [];
	for (let v = start; v <= hi + step * .01; v += step) out.push(v);
	return out.length ? out : [0, hi];
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/evidence-B_GIjJxw.js
/** Latest vs previous quarter FII / DII stake. Reported shareholding, not daily FPI flow. */
var MONTHS$1 = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function formatShPeriod(period) {
	const p = parsePeriod(period);
	if (!p) return String(period || "").slice(0, 12);
	return `${MONTHS$1[p.m - 1] || ""} ’${String(p.y).slice(-2)}`;
}
function sortShareholding(rows) {
	return [...rows || []].sort((a, b) => {
		const pa = parsePeriod(a.period);
		const pb = parsePeriod(b.period);
		if (!pa && !pb) return String(a.period).localeCompare(String(b.period));
		if (!pa) return 1;
		if (!pb) return -1;
		return pa.t - pb.t;
	});
}
function delta(prev, last) {
	if (prev == null || last == null || !Number.isFinite(prev) || !Number.isFinite(last)) return null;
	return last - prev;
}
function stakeDelta(rows) {
	const sorted = sortShareholding((rows || []).filter((r) => r && (r.fii != null || r.dii != null)));
	if (sorted.length < 2) return null;
	const prev = sorted[sorted.length - 2];
	const last = sorted[sorted.length - 1];
	const from = formatShPeriod(prev.period);
	const to = formatShPeriod(last.period);
	if (from === to) return null;
	return {
		fii: last.fii,
		fiiPrev: prev.fii,
		fiiDelta: delta(prev.fii, last.fii),
		dii: last.dii,
		diiPrev: prev.dii,
		diiDelta: delta(prev.dii, last.dii),
		from,
		to,
		label: `${to} vs ${from}`
	};
}
function isBlankNum(v) {
	return v == null || !Number.isFinite(v);
}
function seriesKey(period) {
	const p = parsePeriod(period);
	return p ? String(p.t) : String(period || "").trim().toLowerCase();
}
function byPeriod(a, b) {
	const pa = parsePeriod(a.period);
	const pb = parsePeriod(b.period);
	if (pa && pb) return pa.t - pb.t;
	if (pa) return -1;
	if (pb) return 1;
	return String(a.period).localeCompare(String(b.period));
}
/** Union two series. The live (first) number wins on the same period; extra only fills blanks. */
function mergeFinSeries(cur, extra) {
	if (!extra?.length) return cur || [];
	if (!cur?.length) return extra.filter((p) => p?.period && Number.isFinite(p.value));
	const m = /* @__PURE__ */ new Map();
	for (const p of extra) {
		if (!p?.period || !Number.isFinite(p.value)) continue;
		m.set(seriesKey(p.period), {
			period: p.period,
			value: p.value
		});
	}
	for (const p of cur) {
		if (!p?.period || !Number.isFinite(p.value)) continue;
		m.set(seriesKey(p.period), {
			period: p.period,
			value: p.value
		});
	}
	return [...m.values()].sort(byPeriod);
}
function mergeShareholding(cur, extra) {
	if (!extra?.length) return cur || [];
	if (!cur?.length) return sortShareholding(extra.filter((p) => p?.period));
	const m = /* @__PURE__ */ new Map();
	for (const p of extra) {
		if (!p?.period) continue;
		m.set(seriesKey(p.period), { ...p });
	}
	for (const p of cur) {
		if (!p?.period) continue;
		const k = seriesKey(p.period);
		const had = m.get(k);
		if (!had) {
			m.set(k, { ...p });
			continue;
		}
		m.set(k, {
			period: p.period || had.period,
			promoters: p.promoters ?? had.promoters,
			fii: p.fii ?? had.fii,
			dii: p.dii ?? had.dii
		});
	}
	return sortShareholding([...m.values()]);
}
function laterPeriod(a, b) {
	const pa = a ? parsePeriod(a) : null;
	const pb = b ? parsePeriod(b) : null;
	if (!pa && !pb) return a || b || null;
	if (!pa) return b || null;
	if (!pb) return a || null;
	return pb.t >= pa.t ? b || a : a || b;
}
/** Fill blanks on the company card. Never overwrite a number that is already on file. */
function fillFundamentals(base, extra) {
	const out = { ...base };
	const takeNum = (k, v) => {
		if (typeof v === "number" && Number.isFinite(v) && isBlankNum(out[k])) out[k] = v;
	};
	const takeStr = (k, v) => {
		if (typeof v === "string" && v && !out[k]) out[k] = v;
	};
	takeNum("mcapCr", extra.mcapCr);
	takeNum("pe", extra.pe);
	takeNum("pb", extra.pb);
	takeNum("roe", extra.roe);
	takeNum("de", extra.de);
	takeNum("divYield", extra.divYield);
	takeNum("eps", extra.eps);
	takeNum("book", extra.book);
	takeNum("face", extra.face);
	takeNum("industryPe", extra.industryPe);
	takeNum("salesYoY", extra.salesYoY);
	takeNum("profitYoY", extra.profitYoY);
	takeNum("promoters", extra.promoters);
	takeNum("fii", extra.fii);
	takeNum("dii", extra.dii);
	takeNum("roce", extra.roce);
	takeNum("peg", extra.peg);
	takeNum("forwardPe", extra.forwardPe);
	takeNum("forwardEps", extra.forwardEps);
	takeNum("forwardPeg", extra.forwardPeg);
	takeNum("opm", extra.opm);
	takeNum("interestCover", extra.interestCover);
	takeNum("pledge", extra.pledge);
	takeNum("cfoPat", extra.cfoPat);
	takeNum("salesCagr3", extra.salesCagr3);
	takeNum("profitCagr3", extra.profitCagr3);
	takeNum("profitCagr5", extra.profitCagr5);
	takeStr("industry", extra.industry);
	takeStr("ceo", extra.ceo);
	takeStr("founded", extra.founded);
	takeStr("summary", extra.summary);
	const fin = laterPeriod(out.finPeriod, extra.finPeriod);
	if (fin) out.finPeriod = fin;
	const sh = laterPeriod(out.shPeriod, extra.shPeriod);
	if (sh) out.shPeriod = sh;
	out.sales = mergeFinSeries(out.sales, extra.sales);
	out.profits = mergeFinSeries(out.profits, extra.profits);
	out.qSales = mergeFinSeries(out.qSales, extra.qSales);
	out.qProfits = mergeFinSeries(out.qProfits, extra.qProfits);
	out.netWorth = mergeFinSeries(out.netWorth, extra.netWorth);
	out.qNetWorth = mergeFinSeries(out.qNetWorth, extra.qNetWorth);
	out.ebitda = mergeFinSeries(out.ebitda, extra.ebitda);
	out.cfo = mergeFinSeries(out.cfo, extra.cfo);
	out.qCfo = mergeFinSeries(out.qCfo, extra.qCfo);
	out.shareholding = mergeShareholding(out.shareholding, extra.shareholding);
	return out;
}
var FACT_FIELDS = [
	{
		id: "revenue",
		label: "Revenue",
		group: "financials",
		unit: "₹ Cr",
		series: "sales",
		definition: "Revenue from operations."
	},
	{
		id: "pat",
		label: "PAT",
		group: "financials",
		unit: "₹ Cr",
		series: "profits",
		definition: "Profit attributable to owners."
	},
	{
		id: "cfo",
		label: "CFO",
		group: "financials",
		unit: "₹ Cr",
		series: "cfo",
		definition: "Cash from operating activities."
	},
	{
		id: "ebitda",
		label: "EBITDA",
		group: "financials",
		unit: "₹ Cr",
		series: "ebitda",
		definition: "EBITDA when the filing states it."
	},
	{
		id: "eps",
		label: "EPS",
		group: "financials",
		unit: "₹",
		key: "eps",
		definition: "Basic earnings per share."
	},
	{
		id: "opm",
		label: "OPM",
		group: "quality",
		unit: "%",
		key: "opm",
		definition: "Operating margin. Reported, or operating profit / revenue when derived."
	},
	{
		id: "roe",
		label: "ROE",
		group: "quality",
		unit: "%",
		key: "roe",
		definition: "Return on equity."
	},
	{
		id: "roce",
		label: "ROCE",
		group: "quality",
		unit: "%",
		key: "roce",
		definition: "Return on capital employed. Reported, or EBIT / capital employed when derived."
	},
	{
		id: "de",
		label: "D/E",
		group: "quality",
		unit: "x",
		key: "de",
		definition: "Debt / equity."
	},
	{
		id: "interestCover",
		label: "Interest coverage",
		group: "quality",
		unit: "x",
		key: "interestCover",
		definition: "Operating profit / finance cost, when both are on the filing."
	},
	{
		id: "cfoPat",
		label: "CFO/PAT",
		group: "quality",
		unit: "x",
		key: "cfoPat",
		definition: "Operating cash flow divided by PAT for the latest comparable annual period."
	},
	{
		id: "salesCagr3",
		label: "Sales CAGR 3Y",
		group: "financials",
		unit: "%",
		key: "salesCagr3",
		definition: "Three-year sales CAGR from annual revenue points."
	},
	{
		id: "profitCagr3",
		label: "Profit CAGR 3Y",
		group: "financials",
		unit: "%",
		key: "profitCagr3",
		definition: "Three-year profit CAGR."
	},
	{
		id: "profitCagr5",
		label: "Profit CAGR 5Y",
		group: "financials",
		unit: "%",
		key: "profitCagr5",
		definition: "Five-year profit CAGR."
	},
	{
		id: "pe",
		label: "P/E",
		group: "valuation",
		unit: "x",
		key: "pe",
		definition: "Trailing price / earnings from the company card."
	},
	{
		id: "pb",
		label: "P/B",
		group: "valuation",
		unit: "x",
		key: "pb",
		definition: "Price / book."
	},
	{
		id: "peg",
		label: "PEG",
		group: "valuation",
		unit: "x",
		key: "peg",
		definition: "P/E divided by profit CAGR. Period is the growth window used."
	},
	{
		id: "book",
		label: "Book value",
		group: "valuation",
		unit: "₹",
		key: "book",
		definition: "Book value per share."
	},
	{
		id: "divYield",
		label: "Dividend yield",
		group: "valuation",
		unit: "%",
		key: "divYield",
		definition: "Dividend yield."
	},
	{
		id: "promoters",
		label: "Promoter holding",
		group: "ownership",
		unit: "%",
		key: "promoters",
		definition: "Promoter and promoter group, % of equity."
	},
	{
		id: "fii",
		label: "FII",
		group: "ownership",
		unit: "%",
		key: "fii",
		definition: "Foreign institutional holding."
	},
	{
		id: "dii",
		label: "DII",
		group: "ownership",
		unit: "%",
		key: "dii",
		definition: "Domestic institutional holding."
	},
	{
		id: "pledge",
		label: "Pledge",
		group: "ownership",
		unit: "%",
		key: "pledge",
		definition: "Promoter shares pledged, % of equity."
	}
];
var ACCOUNTING = /* @__PURE__ */ new Set([
	"de",
	"eps",
	"opm",
	"roce",
	"interestCover",
	"salesYoY",
	"profitYoY",
	"salesCagr3",
	"profitCagr3",
	"profitCagr5",
	"promoters",
	"fii",
	"dii",
	"pledge",
	"face",
	"cfoPat"
]);
var SERIES = [
	"sales",
	"profits",
	"cfo",
	"ebitda",
	"qSales",
	"qProfits",
	"qCfo",
	"netWorth",
	"qNetWorth"
];
var SOURCE_RANK = {
	"company-filing": 1,
	"exchange-filing": 2,
	"annual-report": 3,
	presentation: 4,
	"structured-provider": 5,
	secondary: 6,
	"kosh-derived": 7,
	"ai-researched": 8,
	unknown: 9
};
function finite(v) {
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function close(a, b) {
	const scale = Math.max(Math.abs(a), Math.abs(b), 1e-9);
	return Math.abs(a - b) / scale <= .015 || Math.abs(a - b) < .05;
}
function reconcileCandidates(cands) {
	const rows = cands.filter((c) => Number.isFinite(c.value));
	if (!rows.length) return {
		value: null,
		status: "unavailable",
		source: "",
		rank: "unknown",
		method: "",
		period: null,
		alt: null,
		altSource: null,
		reason: "Not found in supported sources."
	};
	const ranked = [...rows].sort((a, b) => SOURCE_RANK[a.rank] - SOURCE_RANK[b.rank]);
	const best = ranked[0];
	const rest = ranked.slice(1).filter((c) => !close(c.value, best.value));
	const derivedOnly = best.derived || best.rank === "kosh-derived";
	const status = rest.length ? "conflicting" : derivedOnly ? "derived" : "verified";
	return {
		value: best.value,
		status,
		source: best.source,
		rank: best.rank,
		method: best.method || (derivedOnly ? "Kosh-derived." : "Selected by source hierarchy."),
		period: best.period || null,
		alt: rest[0]?.value ?? null,
		altSource: rest[0]?.source ?? null
	};
}
function preferFiling(filing, card) {
	if (!filing?.length) return card || [];
	return mergeFinSeries(filing, card || []);
}
function setField(map, id, row) {
	map[id] = row;
}
/**
* Accounting facts prefer the exchange filing over the company card when both exist.
* Market multiples stay on the card. Series for the same period follow the same rule.
* Disagreeing values are kept as alternatives — not averaged, not dropped silently.
*/
function reconcileFundamentals(base, extra, names = {}) {
	const cardName = names.card || "Company card";
	const filingName = names.filing || "NSE filing";
	const out = { ...base };
	for (const k of SERIES) {
		const filing = extra[k];
		const card = base[k];
		out[k] = preferFiling(filing, card);
	}
	const fields = {};
	for (const key of [
		"pe",
		"pb",
		"roe",
		"divYield",
		"book",
		"mcapCr"
	]) {
		const b = finite(base[key]);
		const e = finite(extra[key]);
		const chosen = b ?? e;
		out[key] = chosen;
		if (chosen == null) continue;
		const fromFiling = b == null && e != null;
		setField(fields, key, {
			status: "verified",
			source: fromFiling ? filingName : cardName,
			rank: fromFiling ? "exchange-filing" : "structured-provider",
			method: fromFiling ? "Filing print. The company card had no value." : "Structured provider. Market multiple, not a filing line.",
			period: fromFiling ? extra.finPeriod || null : base.finPeriod || null
		});
	}
	for (const key of ACCOUNTING) {
		const b = finite(base[key]);
		const e = finite(extra[key]);
		const picked = reconcileCandidates([...b == null ? [] : [{
			value: b,
			source: cardName,
			rank: "structured-provider",
			period: base.finPeriod
		}], ...e == null ? [] : [{
			value: e,
			source: filingName,
			rank: "exchange-filing",
			period: extra.finPeriod || extra.shPeriod
		}]]);
		out[key] = picked.value;
		if (picked.value == null && b == null && e == null) continue;
		setField(fields, key, {
			status: picked.status,
			source: picked.source,
			rank: picked.rank,
			method: picked.method,
			period: picked.period,
			alt: picked.alt,
			altSource: picked.altSource,
			reason: picked.reason
		});
	}
	for (const k of [
		"industry",
		"ceo",
		"founded",
		"summary",
		"website"
	]) if (!out[k] && extra[k]) out[k] = extra[k];
	if (!out.finPeriod && extra.finPeriod) out.finPeriod = extra.finPeriod;
	if (extra.finPeriod && extra.sales?.length) out.finPeriod = extra.finPeriod;
	if (!out.shPeriod && extra.shPeriod) out.shPeriod = extra.shPeriod;
	if (extra.shareholding?.length) out.shareholding = extra.shareholding;
	for (const spec of FACT_FIELDS) {
		if (!spec.series) continue;
		const chosen = lastOf(out[spec.series]);
		if (chosen == null) continue;
		const filingV = lastOf(extra[spec.series]);
		const cardV = lastOf(base[spec.series]);
		const fromFiling = filingV != null && close(filingV, chosen);
		const alt = fromFiling && cardV != null && !close(cardV, chosen) ? cardV : null;
		setField(fields, spec.id, {
			status: alt != null ? "conflicting" : "verified",
			source: fromFiling ? filingName : cardName,
			rank: fromFiling ? "exchange-filing" : "structured-provider",
			method: alt != null ? "Exchange filing selected. Company card differs for the latest period." : fromFiling ? "Exchange filing." : "Company card.",
			period: out[spec.series]?.at(-1)?.period || null,
			alt,
			altSource: alt != null ? cardName : null
		});
	}
	out.provenance = {
		searched: true,
		at: Date.now(),
		fields
	};
	return out;
}
function noteDerived(fund, notes) {
	const fields = { ...fund.provenance?.fields || {} };
	for (const [id, method] of Object.entries(notes)) {
		if (!method) continue;
		const prev = fields[id];
		fields[id] = {
			status: prev?.status === "conflicting" ? "conflicting" : "derived",
			source: "Kosh",
			rank: "kosh-derived",
			method,
			period: fund.finPeriod || prev?.period || null,
			alt: prev?.alt,
			altSource: prev?.altSource
		};
	}
	return {
		...fund,
		provenance: {
			searched: fund.provenance?.searched === true,
			at: Date.now(),
			fields
		}
	};
}
function stampCard(fund) {
	if (fund.provenance?.searched) return fund;
	const fields = { ...fund.provenance?.fields || {} };
	for (const spec of FACT_FIELDS) {
		if (fields[spec.id] || fields[spec.key || ""]) continue;
		const id = spec.key || spec.id;
		if ((spec.series ? lastOf(fund[spec.series]) : finite(fund[spec.key])) == null) continue;
		fields[id] = {
			status: "verified",
			source: "Company card",
			rank: "structured-provider",
			method: "Structured provider. Not yet reconciled against an exchange filing.",
			period: spec.group === "ownership" ? fund.shPeriod || null : fund.finPeriod || null
		};
	}
	return {
		...fund,
		provenance: {
			searched: false,
			at: fund.retrievedAt || null,
			fields
		}
	};
}
function lastOf(pts) {
	const hit = (pts || []).filter((p) => Number.isFinite(p.value)).at(-1);
	return hit ? hit.value : null;
}
function periodOf$1(fund, spec) {
	if (spec.series) return fund[spec.series]?.at(-1)?.period || fund.finPeriod || null;
	if (spec.group === "ownership") return fund.shPeriod || null;
	return fund.finPeriod || null;
}
function valueOf(fund, spec) {
	if (spec.series) return lastOf(fund[spec.series]);
	if (!spec.key) return null;
	return finite(fund[spec.key]);
}
function buildFieldReport(fund) {
	const counts = {
		verified: 0,
		derived: 0,
		researched: 0,
		conflicting: 0,
		unavailable: 0,
		not_applicable: 0
	};
	return {
		lines: FACT_FIELDS.map((spec) => {
			const id = spec.key || spec.id;
			const meta = fund?.provenance?.fields?.[id] || fund?.provenance?.fields?.[spec.id];
			const value = fund ? valueOf(fund, spec) : null;
			let status = value == null ? "unavailable" : meta?.status || "verified";
			if (value == null) status = "unavailable";
			counts[status] += 1;
			const missing = status === "unavailable";
			return {
				id: spec.id,
				label: spec.label,
				group: spec.group,
				status,
				value,
				unit: spec.unit,
				period: fund ? periodOf$1(fund, spec) : null,
				sourceName: missing ? "" : meta?.source || "Company card",
				methodology: missing ? meta?.reason || "Not found in supported sources." : meta?.method || spec.definition,
				reason: missing ? meta?.reason || "Not found in supported sources." : void 0,
				alt: meta?.alt,
				altSource: meta?.altSource
			};
		}),
		counts
	};
}
function missingFieldLabels(fund) {
	return buildFieldReport(fund).lines.filter((l) => l.status === "unavailable").map((l) => l.label);
}
var UNSUPPORTED = [
	{
		re: /free cash flow yield|fcf yield/i,
		metric: "Free cash flow yield",
		closest: "CFO/PAT",
		accept: /cfo\s*\/\s*pat instead/i
	},
	{
		re: /ev\s*\/\s*ebitda|enterprise value/i,
		metric: "EV/EBITDA",
		closest: "P/E",
		accept: /p\/e instead/i
	},
	{
		re: /dividend payout/i,
		metric: "Dividend payout",
		closest: "Dividend yield",
		accept: /dividend yield instead/i
	},
	{
		re: /interest coverage ratio/i,
		metric: "Interest coverage",
		closest: "Interest coverage",
		accept: /^$/
	},
	{
		re: /return on capital employed/i,
		metric: "ROCE",
		closest: "ROCE",
		accept: /^$/
	}
];
/** Interest coverage and ROCE are supported under shorter names — do not flag those phrases. */
var SUPPORTED_PHRASE = /interest coverage ratio|return on capital employed/i;
function screenMetricGap(prompt) {
	const text = String(prompt || "");
	if (!text.trim()) return null;
	for (const row of UNSUPPORTED) {
		if (SUPPORTED_PHRASE.test(row.re.source) && row.metric !== "Free cash flow yield") continue;
		if (row.metric === "Interest coverage" || row.metric === "ROCE") continue;
		if (!row.re.test(text)) continue;
		if (row.accept.test(text)) continue;
		return {
			metric: row.metric,
			closest: row.closest,
			message: `${row.metric} is not currently a supported screening field. Closest available: ${row.closest}. Use ${row.closest} instead?`
		};
	}
	return null;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DhekK0Gr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: (error instanceof Error ? error.message : "") || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 font-mono text-[13px] text-subtle tabular",
				children: "404"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-[28px] font-semibold tracking-tight",
				children: "This page is not here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: "That link does not match a portfolio, a stock, or a landing section."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Home"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						children: "Open my portfolio"
					})
				})]
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function TooltipProvider({ children, delayDuration = 200 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		children
	});
}
function Tooltip({ children, content, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root3, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		asChild: true,
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset: 6,
		className: cn("z-50 rounded-sm bg-surface px-2 py-1 text-xs text-fg shadow-[var(--shadow-border)]", className),
		children: content
	}) })] });
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadCloudState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0e91473b8a573164424c655ab7a04cc189f455395bb79dec1df8b9ee23bd960a"));
var saveCloudState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const doc = sanitizeForCloud(input?.doc || emptyCloud());
	return {
		baseRev: Number(input?.baseRev) || 0,
		doc
	};
}).handler(createSsrRpc("a0270d09cba43b3df5696c50f6cca5bb87cd3fd66e5b3037ec5b2b49cb7cea6a"));
function CloudBridge() {
	const { user, isPending } = useCurrentUserState();
	const applyCloud = useKosh((s) => s.applyCloud);
	const ready = (0, import_react.useRef)(false);
	const rev = (0, import_react.useRef)(0);
	const timer = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		ready.current = false;
		if (isPending || !user) return;
		let cancelled = false;
		loadCloudState().then(async (remote) => {
			if (cancelled) return;
			const local = sanitizeForCloud(useKosh.getState());
			const merged = mergeCloud(local, remote.doc);
			applyCloud(merged.doc);
			rev.current = remote.rev || 0;
			if (merged.dirty) {
				const saved = await saveCloudState({ data: {
					baseRev: rev.current,
					doc: merged.doc
				} });
				if (saved.ok) rev.current = saved.rev;
				else if (saved.conflict) {
					const again = mergeCloud(sanitizeForCloud(useKosh.getState()), saved.doc);
					applyCloud(again.doc);
					const retry = await saveCloudState({ data: {
						baseRev: saved.rev,
						doc: again.doc
					} });
					if (retry.ok) rev.current = retry.rev;
				}
			}
			ready.current = true;
		}).catch(() => {
			ready.current = true;
		});
		return () => {
			cancelled = true;
		};
	}, [
		user,
		isPending,
		applyCloud
	]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		return useKosh.subscribe((s) => {
			if (!ready.current) return;
			window.clearTimeout(timer.current);
			timer.current = window.setTimeout(() => {
				const doc = sanitizeForCloud(s);
				saveCloudState({ data: {
					baseRev: rev.current,
					doc
				} }).then((saved) => {
					if (saved.ok) rev.current = saved.rev;
					else if (saved.conflict) {
						const merged = mergeCloud(doc, saved.doc);
						applyCloud(merged.doc);
						rev.current = saved.rev;
					}
				}).catch(() => {});
			}, 900);
		});
	}, [user, applyCloud]);
	return null;
}
function ThemeHydrate() {
	const theme = useKosh((s) => s.theme);
	(0, import_react.useEffect)(() => {
		document.documentElement.setAttribute("data-theme", theme);
		const meta = document.querySelector("meta[name=\"theme-color\"]");
		if (meta) meta.setAttribute("content", theme === "light" ? "#f3f1ea" : "#09090b");
	}, [theme]);
	return null;
}
function ThemeToggle({ className }) {
	const theme = useKosh((s) => s.theme);
	const setTheme = useKosh((s) => s.setTheme);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const next = theme === "dark" ? "light" : "dark";
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "size-8",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: className || "grid size-8 place-items-center rounded-sm text-muted hover:bg-surface hover:text-fg",
		"aria-label": next === "light" ? "Switch to light mode" : "Switch to dark mode",
		title: next === "light" ? "Light mode" : "Dark mode",
		onClick: () => setTheme(next),
		children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
	});
}
function ThemedToaster() {
	const theme = useKosh((s) => s.theme);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme,
		position: "bottom-right",
		toastOptions: { style: {
			background: "var(--color-surface)",
			border: "1px solid var(--color-border)",
			color: "var(--color-fg)"
		} }
	});
}
function AppProviders({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 6e4
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
			delayDuration: 200,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeHydrate, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconHydrate, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudBridge, {}),
				children,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedToaster, {})
			]
		})
	});
}
var styles_default = "/assets/styles-BwoBYoY8.css";
var THEME_BOOT = `(function(){try{var t=JSON.parse(localStorage.getItem("kosh-v2")||"{}");var th=(t.state&&t.state.theme)||"dark";document.documentElement.setAttribute("data-theme",th==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
var Route$39 = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Kosh · Indian markets and portfolios" },
			{
				name: "theme-color",
				content: "#09090b"
			},
			{
				name: "description",
				content: "Indian stocks: live prices, candles, screens, and a portfolio versus Nifty. Search a name. Not a broker."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		"data-theme": "dark",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg font-sans",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$21 = () => import("./routes-FAJ351xi.mjs");
var Route$38 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./app-DhKojxE1.mjs");
var Route$37 = createFileRoute("/app")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./compare-BmLxRADw.mjs");
var Route$36 = createFileRoute("/compare")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./icons-DBN2c45B.mjs");
var Route$35 = createFileRoute("/icons")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./login-DZ-iA2A_.mjs");
var Route$34 = createFileRoute("/login")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$17, "component"),
	head: () => ({ meta: [{ title: "Sign in · Kosh" }] })
});
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		})
	});
}
function XMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
		})
	});
}
function AuthScreen({ initial = "in" }) {
	const [mode, setMode] = (0, import_react.useState)(initial);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)("");
	const navigate = useNavigate();
	async function onEmail(e) {
		e.preventDefault();
		setBusy(true);
		setMsg("");
		try {
			if (mode === "up") {
				const { error } = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0]
				});
				if (error) throw new Error(error.message || "Could not create account");
			} else {
				const { error } = await authClient.signIn.email({
					email,
					password
				});
				if (error) throw new Error(error.message || "No match");
			}
			await authClient.getSession();
			navigate({ to: "/app" });
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-dvh lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col px-5 py-6 sm:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[28px] font-semibold tracking-tight",
						children: mode === "in" ? "Sign in" : "Create account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Google, X, or email. Guest keeps the portfolio on this device only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
						className: "mt-6 grid w-full grid-cols-2",
						value: mode,
						onChange: (v) => {
							setMode(v);
							setMsg("");
						},
						options: [{
							id: "in",
							label: "Sign in"
						}, {
							id: "up",
							label: "Create account"
						}]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full",
							onClick: () => void signIn(p.providerId, {
								callbackURL: "/app",
								errorCallbackURL: "/login"
							}),
							children: [
								p.idp === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, {}),
								"Continue with ",
								p.label
							]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							"Email",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (e) => void onEmail(e),
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								autoComplete: "name"
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: email,
								onChange: (e) => setEmail(e.target.value),
								type: "email",
								autoComplete: "email",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: password,
								onChange: (e) => setPassword(e.target.value),
								type: "password",
								autoComplete: mode === "up" ? "new-password" : "current-password",
								required: true,
								minLength: 8
							})] }),
							msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-down",
								children: msg
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy || false,
								children: busy ? "Please wait…" : mode === "in" ? "Sign in with email" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: cn("mt-6 w-full"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							children: "Continue as guest"
						})
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden bg-bg-elevated lg:grid lg:place-items-center lg:p-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-[12px] tracking-[0.14em] text-subtle uppercase",
						children: "What you get"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMix, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Your stocks versus Nifty, as far back as prices go. Buy dates optional."
					})
				]
			})
		})]
	});
}
var $$splitComponentImporter$16 = () => import("./markets-CAykotyz.mjs");
var Route$33 = createFileRoute("/markets")({
	ssr: false,
	validateSearch: (s) => {
		const symbol = typeof s.symbol === "string" ? s.symbol.trim().slice(0, 32) : "";
		const name = typeof s.name === "string" ? s.name.trim().slice(0, 80) : "";
		return {
			view: s.view === "overview" ? "overview" : "terminal",
			...symbol ? { symbol } : {},
			...name ? { name } : {}
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./picks-CVg1fMsb.mjs");
var Route$32 = createFileRoute("/picks")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./privacy-wVG15KQ5.mjs");
var Route$31 = createFileRoute("/privacy")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	head: () => ({ meta: [{ title: "Privacy · Kosh" }] })
});
var $$splitComponentImporter$13 = () => import("./screen-Bc0FDsWE.mjs");
var Route$30 = createFileRoute("/screen")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./signup-ZbnA_C6y.mjs");
var Route$29 = createFileRoute("/signup")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	head: () => ({ meta: [{ title: "Create account · Kosh" }] })
});
var $$splitComponentImporter$11 = () => import("./terms-B99UWq2E.mjs");
var Route$28 = createFileRoute("/terms")({
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: () => ({ meta: [{ title: "Terms · Kosh" }] })
});
var $$splitComponentImporter$10 = () => import("./trade-Cr2bbM_L.mjs");
/** Trade scans live on Screener. Keep this path so old links do not 404. */
var Route$27 = createFileRoute("/trade")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./watch-CNDMk1Sc.mjs");
var Route$26 = createFileRoute("/watch")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var UA$5 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var qCache = /* @__PURE__ */ new Map();
var hCache = /* @__PURE__ */ new Map();
var oCache = /* @__PURE__ */ new Map();
var Q_TTL = 2500;
var H_TTL = 36e5;
var mcxCache = {
	at: 0,
	GOLD: null,
	SILVER: null
};
function chartTtl(range, interval = "1d") {
	if (interval === "1m" || interval === "2m" || interval === "5m") return 12e3;
	if (range === "1d" || range === "5d") return 2500;
	if (range === "1mo" || range === "3mo") return 3e4;
	return H_TTL;
}
async function yahoo(url) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA$5,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(35e3)
	});
	if (!res.ok) throw new Error(`Yahoo ${res.status}`);
	return res.json();
}
function chartUrl(symbol, range = "max", interval = "1d") {
	const base = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
	const common = `interval=${interval}&includePrePost=false&events=div%7Csplit`;
	if (range === "max") return `${base}?${common}&period1=315532800&period2=${Math.floor(Date.now() / 1e3)}`;
	return `${base}?${common}&range=${range}`;
}
function parseChart(data) {
	const r = data?.chart?.result?.[0];
	if (!r) return null;
	const m = r.meta || {};
	const ts = r.timestamp || [];
	const close = r.indicators?.quote?.[0]?.close || [];
	const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
	const bars = [];
	for (let i = 0; i < ts.length; i++) {
		const a = adj[i];
		const c = close[i];
		const px = a != null && a > 0 ? Number(a) : c != null && c > 0 ? Number(c) : null;
		if (px != null) bars.push({
			t: ts[i],
			c: px,
			raw: c != null && c > 0 ? Number(c) : px
		});
	}
	const price = Number(m.regularMarketPrice || 0) || bars.at(-1)?.raw || 0;
	const prev = Number(m.chartPreviousClose || m.previousClose || 0);
	let changePct = Number(m.regularMarketChangePercent || 0);
	if (!Number.isFinite(changePct)) changePct = 0;
	return {
		input: String(m.symbol || ""),
		symbol: String(m.symbol || ""),
		name: String(m.longName || m.shortName || m.symbol || ""),
		price,
		previousClose: prev,
		changePct,
		high52: Number(m.fiftyTwoWeekHigh || 0),
		low52: Number(m.fiftyTwoWeekLow || 0),
		first: bars[0]?.t || null,
		last: bars.at(-1)?.t || null,
		sessions: bars.length,
		bars,
		missing: false,
		marketCap: Number(m.marketCap || 0) || void 0,
		delayMin: delayMinutesFromMeta(m.exchangeDataDelayedBy)
	};
}
function stemVariants(raw) {
	const s = String(raw || "").trim().toUpperCase();
	if (!s) return [];
	const bare = s.replace(/\.(NS|BO)$/i, "");
	const aliased = String(YF_ALIAS[bare] || bare).replace(/\.(NS|BO)$/i, "");
	const out = [];
	const push = (x) => {
		const t = String(x || "").replace(/\.(NS|BO)$/i, "").trim();
		if (t && !out.includes(t)) out.push(t);
	};
	push(aliased);
	push(bare);
	for (const x of [...out]) {
		const stripped = x.replace(/[-_](SM|X|BE|EQ|T|XT)$/i, "");
		if (stripped) push(stripped);
		if (x.includes("-")) push(x.replace(/-/g, "_"));
		if (x.includes("_")) push(x.replace(/_/g, "-"));
	}
	return out;
}
function suffixTries(raw) {
	const s = String(raw || "").trim().toUpperCase();
	if (!s) return [];
	const metal = metalKey(s);
	if (metal) return [METALS[metal].yfInr, METALS[metal].yfUsd];
	if (s.startsWith("^") || s.includes("=") || s.includes("_FIN_SERVICE")) return [s];
	const out = [];
	if (/\.(NS|BO)$/.test(s)) out.push(s);
	for (const st of stemVariants(s)) out.push(st + ".NS", st + ".BO");
	return [...new Set(out)];
}
function searchQueries(symbol) {
	const raw = String(symbol || "").replace(/\.(NS|BO)$/i, "");
	const stripped = raw.replace(/[-_](SM|X|BE|EQ|T|XT)$/i, "");
	const name = tickerName(symbol) || tickerName(stripped);
	return [...new Set([
		raw,
		stripped,
		name
	].map((x) => String(x || "").trim()).filter((x) => x.length >= 2))];
}
async function fetchChart(symbol, range = "max") {
	const key = `${symbol}|${range}`;
	const hit = hCache.get(key);
	if (hit && Date.now() - hit.at < chartTtl(range)) return hit.data;
	const data = parseChart(await yahoo(chartUrl(symbol, range)));
	if (!data) throw new Error("no chart");
	hCache.set(key, {
		at: Date.now(),
		data
	});
	return data;
}
async function searchYahoo(q) {
	try {
		return ((await yahoo(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=16&newsCount=0`)).quotes || []).filter((x) => x.quoteType === "EQUITY" || x.quoteType === "INDEX" || x.quoteType === "CURRENCY" || x.quoteType === "FUTURE");
	} catch {
		return [];
	}
}
function scaleLinear(pack, factor, name, input) {
	if (!(factor > 0) || factor === 1) return {
		...pack,
		input,
		name,
		symbol: input
	};
	const bars = pack.bars.map((b) => ({
		...b,
		c: b.c * factor,
		raw: (b.raw || b.c) * factor
	}));
	const lastT = bars.at(-1)?.t || 0;
	const pxs = (lastT ? bars.filter((b) => b.t >= lastT - 31536e3) : bars).map((b) => b.raw || b.c).filter((x) => x > 0);
	return {
		...pack,
		input,
		name,
		symbol: input,
		price: pack.price * factor,
		previousClose: pack.previousClose * factor,
		high52: pxs.length ? Math.max(...pxs) : pack.high52 * factor,
		low52: pxs.length ? Math.min(...pxs) : pack.low52 * factor,
		bars,
		sessions: bars.length,
		first: bars[0]?.t || null,
		last: bars.at(-1)?.t || null
	};
}
function scaleOzToGram(pack, name, input) {
	return scaleLinear(pack, 1 / TROY_OZ_G, name, input);
}
function multiplySeries(a, fx, name, input) {
	const fxMap = /* @__PURE__ */ new Map();
	for (const b of fx.bars) fxMap.set(istDay(b.t), b.c);
	let lastFx = fx.bars.at(-1)?.c || 0;
	const bars = [];
	for (const b of a.bars) {
		const d = istDay(b.t);
		const f = fxMap.get(d);
		if (f && f > 0) lastFx = f;
		if (!(lastFx > 0) || !(b.c > 0)) continue;
		const px = b.c * lastFx;
		bars.push({
			t: b.t,
			c: px,
			raw: px
		});
	}
	const last = bars.at(-1)?.c || 0;
	const prev = bars.length >= 2 ? bars[bars.length - 2].c : last;
	return {
		input,
		symbol: input,
		name,
		price: last,
		previousClose: prev,
		changePct: prev ? (last / prev - 1) * 100 : 0,
		high52: last,
		low52: last,
		first: bars[0]?.t || null,
		last: bars.at(-1)?.t || null,
		sessions: bars.length,
		bars,
		missing: false
	};
}
async function growwHtml(path) {
	const res = await fetch("https://groww.in" + path, {
		headers: {
			"User-Agent": UA$5,
			Accept: "text/html"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.text();
}
function asSpot(kind, parsed) {
	const gram = mcxToGram(kind, parsed.display);
	const prevG = mcxToGram(kind, parsed.prev);
	return {
		display: parsed.display,
		prev: parsed.prev,
		changePct: prevG > 0 ? (gram / prevG - 1) * 100 : 0,
		gram
	};
}
async function fetchMcxSpots() {
	if (Date.now() - mcxCache.at < 45e3 && (mcxCache.GOLD || mcxCache.SILVER)) return {
		GOLD: mcxCache.GOLD,
		SILVER: mcxCache.SILVER
	};
	const out = {
		GOLD: null,
		SILVER: null
	};
	try {
		const [list, goldPage, silverPage] = await Promise.all([
			growwHtml("/commodities").catch(() => ""),
			growwHtml("/commodities/futures/mcx_gold").catch(() => ""),
			growwHtml("/commodities/futures/mcx_silver").catch(() => "")
		]);
		const gold = pickMcxSpot("GOLD", parseGrowwMcx(list, "Gold"), [parseGrowwLive(goldPage)]);
		const silver = pickMcxSpot("SILVER", parseGrowwMcx(list, "Silver"), [parseGrowwLive(silverPage)]);
		if (gold) out.GOLD = asSpot("GOLD", gold);
		if (silver) out.SILVER = asSpot("SILVER", silver);
	} catch {}
	if (out.GOLD || out.SILVER) mcxCache = {
		at: Date.now(),
		...out
	};
	return {
		GOLD: out.GOLD || mcxCache.GOLD,
		SILVER: out.SILVER || mcxCache.SILVER
	};
}
async function metalHistory(kind, range) {
	const spec = METALS[kind];
	for (const etf of spec.etfs) try {
		const pack = await fetchChart(etf, range);
		if (pack.bars.length >= 2 && pack.price > 0) return scaleLinear(pack, etfToGramPrice(kind, pack.price) / pack.price, spec.name, spec.symbol);
	} catch {}
	try {
		const [usd, fx] = await Promise.all([fetchChart(spec.yfUsd, range), fetchChart("INR=X", range)]);
		if (usd.bars.length >= 2 && fx.bars.length >= 2 && usd.price > 0 && fx.price > 0) {
			const mixed = multiplySeries(usd, fx, spec.name, spec.symbol);
			if (mixed.bars.length >= 2) return scaleOzToGram(mixed, spec.name, spec.symbol);
		}
	} catch {}
	try {
		const inr = await fetchChart(spec.yfInr, range);
		if (inr.bars.length >= 2 && inr.price > 0) return scaleOzToGram(inr, spec.name, spec.symbol);
	} catch {}
	return null;
}
async function resolveMetal(kind, range) {
	const spec = METALS[kind];
	const [hx, spots] = await Promise.all([metalHistory(kind, range), fetchMcxSpots()]);
	const spot = spots[kind];
	const gram = spot?.gram || hx?.price || 0;
	if (!(gram > 0) && !hx) return null;
	if (!hx) return {
		input: spec.symbol,
		symbol: spec.symbol,
		name: spec.name,
		price: gram,
		previousClose: spot ? mcxToGram(kind, spot.prev) : gram,
		changePct: spot?.changePct || 0,
		high52: gram,
		low52: gram,
		first: null,
		last: Math.floor(Date.now() / 1e3),
		sessions: 1,
		bars: [{
			t: Math.floor(Date.now() / 1e3),
			c: gram,
			raw: gram
		}],
		missing: false
	};
	const last = hx.price || hx.bars.at(-1)?.c || 0;
	const scaled = scaleLinear(hx, last > 0 && gram > 0 ? gram / last : 1, spec.name, spec.symbol);
	if (spot) {
		scaled.price = gram;
		scaled.previousClose = mcxToGram(kind, spot.prev);
		scaled.changePct = spot.changePct;
	}
	return scaled;
}
async function resolveHistory(symbol, range = "max") {
	const metal = metalKey(symbol);
	if (metal) {
		const m = await resolveMetal(metal, range);
		if (m) return m;
	}
	const tried = /* @__PURE__ */ new Set();
	const tryOne = async (y) => {
		if (!y || tried.has(y)) return null;
		tried.add(y);
		try {
			const got = await fetchChart(y, range);
			if (got?.bars?.length >= 2) return {
				...got,
				input: symbol
			};
		} catch {}
		return null;
	};
	for (const y of suffixTries(symbol)) {
		const hit = await tryOne(y);
		if (hit) return hit;
	}
	for (const q of searchQueries(symbol)) {
		const hits = await searchYahoo(q);
		for (const h of hits) {
			if (!h.symbol) continue;
			if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^") && !String(h.symbol).includes("=")) continue;
			const hit = await tryOne(h.symbol);
			if (hit) return {
				...hit,
				name: h.longname || h.shortname || hit.name
			};
		}
	}
	return null;
}
async function resolveQuote(raw) {
	const ck = "q:" + raw.toUpperCase();
	const cached = qCache.get(ck);
	if (cached && Date.now() - cached.at < Q_TTL) return cached.data;
	const metal = metalKey(raw);
	if (metal) {
		const d = await resolveMetal(metal, "max");
		if (d && d.price > 0) {
			const out = {
				input: raw,
				symbol: metal,
				name: d.name,
				price: d.price,
				previousClose: d.previousClose,
				changePct: d.changePct,
				high52: d.high52,
				low52: d.low52,
				mcapCr: null,
				retrievedAt: Date.now()
			};
			qCache.set(ck, {
				at: Date.now(),
				data: out
			});
			return out;
		}
	}
	const tried = /* @__PURE__ */ new Set();
	const tryChart = async (y) => {
		if (tried.has(y)) return null;
		tried.add(y);
		try {
			const d = await fetchChart(y, "5d");
			if (d && d.price > 0) {
				const out = {
					input: raw,
					symbol: d.symbol,
					name: d.name,
					price: d.price,
					previousClose: d.previousClose,
					changePct: d.changePct,
					high52: d.high52,
					low52: d.low52,
					mcapCr: d.marketCap && d.marketCap > 0 ? d.marketCap / 1e7 : null,
					retrievedAt: Date.now(),
					delayMin: d.delayMin ?? null
				};
				qCache.set(ck, {
					at: Date.now(),
					data: out
				});
				return out;
			}
		} catch {}
		return null;
	};
	for (const y of suffixTries(raw)) {
		const hit = await tryChart(y);
		if (hit) return hit;
	}
	for (const q of searchQueries(raw)) {
		const hits = await searchYahoo(q);
		for (const h of hits) {
			if (!h.symbol) continue;
			if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^")) continue;
			const hit = await tryChart(h.symbol);
			if (hit) return {
				...hit,
				name: h.longname || h.shortname || hit.name
			};
		}
	}
	const out = {
		input: raw,
		symbol: raw,
		name: raw,
		price: 0,
		previousClose: 0,
		changePct: 0,
		high52: 0,
		low52: 0,
		error: "unresolved",
		retrievedAt: Date.now()
	};
	qCache.set(ck, {
		at: Date.now(),
		data: out
	});
	return out;
}
async function poolMap$1(items, limit, fn) {
	const out = new Array(items.length);
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			out[idx] = await fn(items[idx]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return out;
}
async function fetchQuotes(symbols) {
	return poolMap$1([...new Set(symbols.map((s) => s.trim()).filter(Boolean))].slice(0, 80), 6, resolveQuote);
}
async function fetchHistories(symbols, range = "max") {
	return poolMap$1([...new Set(symbols.map((s) => String(s).trim()).filter(Boolean))].slice(0, 80), 6, async (s) => {
		const d = await resolveHistory(s, range);
		return d ? {
			input: s,
			symbol: d.symbol,
			name: d.name,
			price: d.price,
			previousClose: d.previousClose,
			changePct: d.changePct,
			high52: d.high52,
			low52: d.low52,
			first: d.first,
			last: d.last,
			sessions: d.sessions,
			bars: d.bars.map((b) => ({
				t: b.t,
				c: b.c,
				raw: b.raw
			})),
			missing: false
		} : {
			input: s,
			symbol: s,
			name: s,
			price: 0,
			previousClose: 0,
			changePct: 0,
			high52: 0,
			low52: 0,
			first: null,
			last: null,
			sessions: 0,
			bars: [],
			missing: true
		};
	});
}
async function fetchTape() {
	const spots = await fetchMcxSpots();
	return await poolMap$1(TAPE, 6, async (i) => {
		try {
			const metal = metalKey(i.symbol);
			if (metal) {
				const spec = METALS[metal];
				const spot = spots[metal];
				if (spot && spot.display > 0) return {
					...i,
					label: spec.name.toUpperCase(),
					price: spot.display,
					changePct: spot.changePct,
					unit: spec.displayLabel
				};
				const d = await resolveMetal(metal, "5d");
				if (d && d.price > 0) return {
					...i,
					label: spec.name.toUpperCase(),
					price: d.price * spec.displayG,
					changePct: d.changePct,
					unit: spec.displayLabel
				};
				return {
					...i,
					price: 0,
					changePct: 0,
					unit: spec.displayLabel
				};
			}
			const d = await fetchChart(i.symbol, "5d");
			return {
				...i,
				price: d.price,
				changePct: d.changePct
			};
		} catch {
			return {
				...i,
				price: 0,
				changePct: 0
			};
		}
	});
}
async function searchSymbols(q) {
	const lower = q.trim().toLowerCase();
	const extras = [];
	if (/gold|xau|bullion/.test(lower)) extras.push({
		symbol: "GOLD",
		name: "Gold (MCX ₹/10g)",
		exch: "MCX"
	});
	if (/silver|xag/.test(lower)) extras.push({
		symbol: "SILVER",
		name: "Silver (MCX ₹/kg)",
		exch: "MCX"
	});
	const rest = ((await yahoo(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=16&newsCount=0`).catch(() => ({ quotes: [] }))).quotes || []).filter((x) => x.quoteType === "EQUITY" || x.quoteType === "INDEX").map((x) => ({
		symbol: x.symbol || "",
		name: x.shortname || x.longname || x.symbol || "",
		exch: x.exchDisp || x.exchange || ""
	}));
	const indian = rest.filter((x) => /\.(NS|BO)$/i.test(x.symbol) || /NSE|BSE|India/i.test(x.exch));
	const other = rest.filter((x) => !indian.includes(x) && !/\.KL$/i.test(x.symbol));
	return [
		...extras,
		...indian,
		...other
	].slice(0, 16);
}
async function closeOnDay(symbol, day) {
	const d = await resolveHistory(symbol, "max");
	if (!d?.bars.length) return null;
	let hit = null;
	for (const b of d.bars) {
		const k = istDay(b.t);
		if (k <= day) hit = {
			t: b.t,
			c: b.c
		};
		if (k === day) break;
	}
	if (!hit) hit = d.bars[0];
	return {
		day: istDay(hit.t),
		price: hit.c,
		name: d.name
	};
}
async function fetchOhlc(symbol, range = "1y", interval = "1d") {
	const metal = metalKey(symbol);
	if (metal) {
		const d = await resolveHistory(symbol, range === "max" ? "max" : range);
		if (d && d.bars.length) {
			const spec = METALS[metal];
			const bars = d.bars.map((b) => ({
				t: b.t,
				o: b.c,
				h: b.c,
				l: b.c,
				c: b.c,
				v: 0
			}));
			return {
				input: symbol,
				symbol: metal,
				name: `${spec.name} (${spec.displayLabel})`,
				price: d.price * spec.displayG,
				previousClose: d.previousClose * spec.displayG,
				changePct: d.changePct,
				high52: d.high52 * spec.displayG,
				low52: d.low52 * spec.displayG,
				dayHigh: d.price * spec.displayG,
				dayLow: d.price * spec.displayG,
				volume: 0,
				currency: "INR",
				exchange: "MCX",
				firstTrade: d.first,
				bars: bars.map((b) => ({
					...b,
					o: b.o * spec.displayG,
					h: b.h * spec.displayG,
					l: b.l * spec.displayG,
					c: b.c * spec.displayG
				})),
				missing: false
			};
		}
	}
	const key = `o:${symbol}|${range}|${interval}`;
	const hit = oCache.get(key);
	if (hit && Date.now() - hit.at < chartTtl(range, interval)) return hit.data;
	const tried = /* @__PURE__ */ new Set();
	for (const y of suffixTries(symbol)) {
		tried.add(y);
		try {
			const pack = parseOhlc(await yahoo(chartUrl(y, range, interval)), symbol);
			if (pack && pack.bars.length >= 2) {
				oCache.set(key, {
					at: Date.now(),
					data: pack
				});
				return pack;
			}
		} catch {}
	}
	for (const q of searchQueries(symbol)) {
		const hits = await searchYahoo(q);
		for (const h of hits) {
			if (!h.symbol || tried.has(h.symbol)) continue;
			if (!/\.(NS|BO)$/i.test(h.symbol) && !String(h.symbol).startsWith("^")) continue;
			tried.add(h.symbol);
			try {
				const pack = parseOhlc(await yahoo(chartUrl(h.symbol, range, interval)), symbol);
				if (pack && pack.bars.length >= 2) {
					oCache.set(key, {
						at: Date.now(),
						data: pack
					});
					return pack;
				}
			} catch {}
		}
	}
	return {
		input: symbol,
		symbol,
		name: symbol,
		price: 0,
		previousClose: 0,
		changePct: 0,
		high52: 0,
		low52: 0,
		dayHigh: 0,
		dayLow: 0,
		volume: 0,
		currency: "INR",
		exchange: "",
		firstTrade: null,
		bars: [],
		missing: true
	};
}
function parseOhlc(data, input) {
	const r = data?.chart?.result?.[0];
	if (!r) return null;
	const m = r.meta || {};
	const ts = r.timestamp || [];
	const q = r.indicators?.quote?.[0] || {};
	const adj = r.indicators?.adjclose?.[0]?.adjclose || [];
	const bars = [];
	for (let i = 0; i < ts.length; i++) {
		const close = q.close?.[i];
		const open = q.open?.[i];
		const high = q.high?.[i];
		const low = q.low?.[i];
		const vol = q.volume?.[i];
		const a = adj[i];
		if (close == null || !(close > 0)) continue;
		const raw = Number(close);
		const adjC = a != null && a > 0 ? Number(a) : raw;
		const o = open != null && open > 0 ? Number(open) : raw;
		const h = high != null && high > 0 ? Number(high) : Math.max(o, raw);
		const l = low != null && low > 0 ? Number(low) : Math.min(o, raw);
		bars.push({
			t: ts[i],
			o,
			h,
			l,
			c: raw,
			v: vol != null && vol > 0 ? Number(vol) : 0,
			adj: adjC
		});
	}
	const price = Number(m.regularMarketPrice || 0) || bars.at(-1)?.c || 0;
	const prev = Number(m.chartPreviousClose || m.previousClose || 0);
	let changePct = Number(m.regularMarketChangePercent || 0);
	if (!Number.isFinite(changePct) && prev > 0 && price > 0) changePct = (price / prev - 1) * 100;
	if (!Number.isFinite(changePct)) changePct = 0;
	return {
		input,
		symbol: String(m.symbol || input),
		name: String(m.longName || m.shortName || m.symbol || input),
		price,
		previousClose: prev,
		changePct,
		high52: Number(m.fiftyTwoWeekHigh || 0),
		low52: Number(m.fiftyTwoWeekLow || 0),
		dayHigh: Number(m.regularMarketDayHigh || 0),
		dayLow: Number(m.regularMarketDayLow || 0),
		volume: Number(m.regularMarketVolume || 0),
		currency: String(m.currency || "INR"),
		exchange: String(m.fullExchangeName || m.exchangeName || ""),
		firstTrade: m.firstTradeDate != null ? Number(m.firstTradeDate) : bars[0]?.t || null,
		bars,
		missing: bars.length < 2,
		mcapCr: Number(m.marketCap || 0) > 0 && String(m.currency || "INR") === "INR" ? Number(m.marketCap) / 1e7 : null
	};
}
var snapCache = /* @__PURE__ */ new Map();
var SNAP_TTL = 9e5;
function nPos(v) {
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? n : null;
}
function snapFromQuote(q, bare) {
	const price = Number(q.regularMarketPrice || q.postMarketPrice || 0);
	if (!(price > 0)) return null;
	const prev = Number(q.regularMarketPreviousClose || 0);
	let changePct = Number(q.regularMarketChangePercent || 0);
	if (!Number.isFinite(changePct) && prev > 0) changePct = (price / prev - 1) * 100;
	if (!Number.isFinite(changePct)) changePct = 0;
	const mcap = Number(q.marketCap || 0);
	const vol = Number(q.regularMarketVolume || 0);
	const volAvg = Number(q.averageDailyVolume3Month || q.averageDailyVolume10Day || 0);
	const pe = nPos(q.trailingPE);
	const pb = nPos(q.priceToBook);
	const eps = Number.isFinite(Number(q.epsTrailingTwelveMonths)) ? Number(q.epsTrailingTwelveMonths) : null;
	const book = nPos(q.bookValue);
	let div = Number(q.trailingAnnualDividendYield || q.dividendYield || 0);
	if (div > 0 && div < 1) div = div * 100;
	if (!(div > 0) || div > 40) div = 0;
	return {
		symbol: bare,
		name: String(q.longName || q.shortName || q.displayName || bare),
		price,
		changePct,
		high52: Number(q.fiftyTwoWeekHigh || 0),
		low52: Number(q.fiftyTwoWeekLow || 0),
		mcapCr: mcap > 0 ? mcap / 1e7 : null,
		pe,
		pb,
		eps: eps != null && Number.isFinite(eps) ? eps : null,
		book,
		divYield: div > 0 ? div : null,
		vol: vol > 0 ? vol : 0,
		volAvg: volAvg > 0 ? volAvg : 0,
		ma50: nPos(q.fiftyDayAverage),
		ma200: nPos(q.twoHundredDayAverage)
	};
}
async function quoteBatch(tickers) {
	const out = /* @__PURE__ */ new Map();
	if (!tickers.length) return out;
	const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + tickers.map((s) => encodeURIComponent(s)).join(",");
	try {
		const data = await yahoo(url);
		for (const q of data?.quoteResponse?.result || []) {
			const bare = String(q.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
			if (!bare) continue;
			const snap = snapFromQuote(q, bare);
			if (snap) out.set(bare, snap);
		}
	} catch {}
	return out;
}
function snapFromSpark(raw, fallbackBare) {
	const o = raw || {};
	const close = Array.isArray(o.close) ? o.close.filter((x) => x != null && x > 0) : [];
	const price = Number(o.fulldayPrice || close.at(-1) || 0);
	if (!(price > 0)) return null;
	const prev = Number(o.chartPreviousClose || o.previousClose || 0);
	let changePct = Number(o.fulldayChangePercent || 0);
	if (!Number.isFinite(changePct) && prev > 0) changePct = (price / prev - 1) * 100;
	if (!Number.isFinite(changePct)) changePct = 0;
	const bare = String(o.symbol || fallbackBare).replace(/\.(NS|BO)$/i, "").toUpperCase();
	if (!bare) return null;
	return {
		symbol: bare,
		name: tickerName(bare) || bare,
		price,
		changePct,
		high52: 0,
		low52: 0,
		mcapCr: null,
		pe: null,
		pb: null,
		eps: null,
		book: null,
		divYield: null,
		vol: 0,
		volAvg: 0,
		ma50: null,
		ma200: null
	};
}
async function sparkChunk(tickers) {
	const out = /* @__PURE__ */ new Map();
	if (!tickers.length) return out;
	const url = "https://query1.finance.yahoo.com/v8/finance/spark?symbols=" + tickers.map((s) => encodeURIComponent(s)).join(",") + "&range=1d&interval=1d";
	try {
		const data = await yahoo(url);
		const rows = data && typeof data === "object" && data.spark && typeof data.spark === "object" ? data.spark.result || [] : Object.entries(data || {}).map(([sym, row]) => row && typeof row === "object" ? {
			...row,
			symbol: row.symbol || sym
		} : null);
		for (const row of rows) {
			if (!row || typeof row !== "object") continue;
			const snap = snapFromSpark(row, String(row.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase());
			if (snap) out.set(snap.symbol, snap);
		}
	} catch {}
	return out;
}
/** Live prints for many NSE names. Quote v7 when it answers; spark otherwise. */
async function fetchQuoteSnaps(symbols) {
	const uniq = [...new Set(symbols.map((s) => String(s || "").replace(/\.(NS|BO)$/i, "").toUpperCase()).filter(Boolean))];
	const now = Date.now();
	const need = [];
	const hits = [];
	for (const s of uniq) {
		const c = snapCache.get(s);
		if (c && now - c.at < SNAP_TTL) hits.push(c.data);
		else need.push(s);
	}
	const by = /* @__PURE__ */ new Map();
	for (const h of hits) by.set(h.symbol, h);
	const v7chunks = [];
	for (let i = 0; i < need.length; i += 40) v7chunks.push(need.slice(i, i + 40));
	const v7 = await poolMap$1(v7chunks, 3, async (chunk) => quoteBatch(chunk.map((s) => `${s}.NS`)));
	for (const map of v7) for (const [k, v] of map) {
		snapCache.set(k, {
			at: now,
			data: v
		});
		by.set(k, v);
	}
	const missing = need.filter((s) => !by.has(s));
	if (missing.length) {
		const sparkChunks = [];
		for (let i = 0; i < missing.length; i += 18) sparkChunks.push(missing.slice(i, i + 18));
		const sparks = await poolMap$1(sparkChunks, 6, async (chunk) => sparkChunk(chunk.map((s) => `${s}.NS`)));
		for (const map of sparks) for (const [k, v] of map) {
			snapCache.set(k, {
				at: now,
				data: v
			});
			by.set(k, v);
		}
	}
	return uniq.map((s) => by.get(s)).filter((x) => Boolean(x));
}
var Route$25 = createFileRoute("/api/close")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const symbol = url.searchParams.get("symbol") || "";
	const day = url.searchParams.get("day") || "";
	if (!symbol || !day) return Response.json({ error: "symbol and day required" }, { status: 400 });
	const hit = await closeOnDay(symbol, day);
	if (!hit) return Response.json({ error: "no price" }, { status: 404 });
	return Response.json(hit);
} } } });
/** Shared formulas. A blank input stays blank. Derived is never labeled reported. */
function monthsApart(a, b) {
	return (b.y - a.y) * 12 + (b.m - a.m);
}
/**
* CAGR over the actual span between the latest print and the print nearest the requested horizon.
* Does not drop non-positive years and then pretend the survivors are consecutive.
*/
function seriesCagr(pts, years) {
	const rows = (pts || []).map((p) => ({
		...p,
		parsed: parsePeriod(p.period)
	})).filter((p) => p.parsed && Number.isFinite(p.value)).sort((a, b) => a.parsed.t - b.parsed.t);
	const methodBase = `${years}-year CAGR from annual prints.`;
	if (rows.length < 2) return {
		value: null,
		status: "unavailable",
		methodology: `${methodBase} Not enough annual prints.`,
		missing: ["annual series"],
		period: null
	};
	const last = rows[rows.length - 1];
	const targetMonths = years * 12;
	let best = rows[0];
	let bestGap = Infinity;
	for (const row of rows) {
		if (row === last) continue;
		const gap = Math.abs(monthsApart(row.parsed, last.parsed) - targetMonths);
		if (gap < bestGap) {
			bestGap = gap;
			best = row;
		}
	}
	const spanYears = monthsApart(best.parsed, last.parsed) / 12;
	const period = `${best.period} → ${last.period}`;
	if (rows.filter((row) => row.parsed.t >= best.parsed.t && row.parsed.t <= last.parsed.t).some((row) => !(row.value > 0))) return {
		value: null,
		status: "unavailable",
		methodology: "CAGR unavailable — earnings crossed zero or a non-positive print. Those years were not dropped.",
		missing: [],
		period
	};
	if (spanYears < years * .75) return {
		value: null,
		status: "unavailable",
		methodology: `${methodBase} The prints on file span ${spanYears.toFixed(1)} years, not ${years}. Time was not compressed.`,
		missing: [`${years} years of history`],
		period
	};
	if (!(best.value > 0) || !(last.value > 0)) return {
		value: null,
		status: "unavailable",
		methodology: "CAGR unavailable — earnings crossed zero or a non-positive print.",
		missing: [],
		period
	};
	const value = (Math.pow(last.value / best.value, 1 / spanYears) - 1) * 100;
	if (!Number.isFinite(value)) return {
		value: null,
		status: "unavailable",
		methodology: `${methodBase} Result was not a finite number.`,
		missing: [],
		period
	};
	return {
		value,
		status: "derived",
		methodology: `Kosh-derived: (ending / beginning) ^ (1 / ${spanYears.toFixed(2)} years) − 1. Not a reported CAGR.`,
		missing: [],
		period
	};
}
/** Latest aligned annual CFO / PAT. */
function cfoToPat(cfo, profits) {
	const c = (cfo || []).filter((p) => Number.isFinite(p.value)).at(-1);
	const p = (profits || []).filter((x) => Number.isFinite(x.value)).at(-1);
	if (!c || !p) return {
		value: null,
		status: "unavailable",
		methodology: "CFO/PAT needs both an annual cash-flow and a profit print.",
		missing: ["CFO or PAT"],
		period: null
	};
	if (!(c.period === p.period || (parsePeriod(c.period)?.t || 0) === (parsePeriod(p.period)?.t || -1))) return {
		value: null,
		status: "unavailable",
		methodology: `CFO/PAT unavailable — periods differ (${c.period} vs ${p.period}).`,
		missing: [],
		period: null
	};
	if (p.value === 0) return {
		value: null,
		status: "unavailable",
		methodology: "CFO/PAT unavailable — profit is zero.",
		missing: [],
		period: p.period
	};
	const value = c.value / p.value;
	return {
		value: Number.isFinite(value) ? value : null,
		status: "derived",
		methodology: "Kosh-derived: latest annual CFO / PAT for the same period. Not a reported ratio.",
		missing: [],
		period: p.period
	};
}
var DERIVED_FROM_FILING = {
	roce: "Kosh-derived from the filing: EBIT / ending capital employed (equity + borrowings). Ending capital, not an average. Not a reported ROCE line.",
	interestCover: "Kosh-derived from the filing: (profit before tax + finance cost) / finance cost. Not a reported interest-coverage line."
};
/** Fill only blanks. Relabel filing-computed ratios as derived. Never overwrite a number already on the card. */
function applyFormulas(fund) {
	let out = {
		...fund,
		provenance: fund.provenance ? {
			...fund.provenance,
			fields: { ...fund.provenance.fields }
		} : fund.provenance
	};
	const fields = { ...out.provenance?.fields || {} };
	const derived = {};
	for (const key of ["roce", "interestCover"]) {
		const cur = fields[key];
		if (out[key] == null || !cur) continue;
		if (cur.rank === "exchange-filing" || cur.rank === "kosh-derived") fields[key] = {
			...cur,
			status: "derived",
			rank: "kosh-derived",
			source: "Kosh from NSE filing",
			method: DERIVED_FROM_FILING[key]
		};
	}
	const put = (key, hit) => {
		if (out[key] != null) return;
		if (hit.value == null) {
			fields[key] = {
				status: "unavailable",
				source: "Kosh formula",
				rank: "kosh-derived",
				method: hit.methodology,
				period: hit.period
			};
			return;
		}
		out[key] = hit.value;
		derived[key] = hit.methodology;
		fields[key] = {
			status: "derived",
			source: "Kosh formula",
			rank: "kosh-derived",
			method: hit.methodology,
			period: hit.period
		};
	};
	put("salesCagr3", seriesCagr(out.sales, 3));
	put("profitCagr3", seriesCagr(out.profits, 3));
	put("profitCagr5", seriesCagr(out.profits, 5));
	put("cfoPat", cfoToPat(out.cfo, out.profits));
	const yoy = (pts, label) => {
		if (!pts || pts.length < 2) return {
			value: null,
			status: "unavailable",
			methodology: `${label} needs two annual prints.`,
			missing: [label],
			period: null
		};
		const a = pts[pts.length - 2];
		const b = pts[pts.length - 1];
		if (!(a.value > 0)) return {
			value: null,
			status: "unavailable",
			methodology: `${label} unavailable — the prior year is not positive.`,
			missing: [],
			period: b.period
		};
		return {
			value: (b.value / a.value - 1) * 100,
			status: "derived",
			methodology: `Kosh-derived: ${label} from ${a.period} to ${b.period}. Not a reported growth line.`,
			missing: [],
			period: b.period
		};
	};
	put("salesYoY", yoy(out.sales, "Sales growth"));
	put("profitYoY", yoy(out.profits, "Profit growth"));
	if (out.peg == null) {
		const via5 = pegRatio(out.pe, out.profitCagr5);
		const via3 = pegRatio(out.pe, out.profitCagr3);
		const peg = via5 ?? via3;
		const via = via5 != null ? "5Y profit CAGR" : via3 != null ? "3Y profit CAGR" : "";
		if (peg != null && via) {
			out.peg = peg;
			out.pegVia = via;
			derived.peg = `Kosh-derived: P/E ÷ ${via}. Growth period is that CAGR, not a trailing-twelve-month guess.`;
			fields.peg = {
				status: "derived",
				source: "Kosh formula",
				rank: "kosh-derived",
				method: derived.peg,
				period: via
			};
		}
	}
	out = {
		...out,
		provenance: out.provenance ? {
			...out.provenance,
			fields
		} : {
			at: Date.now(),
			searched: Boolean(fund.provenance?.searched),
			fields
		}
	};
	if (Object.keys(derived).length) out = noteDerived(out, derived);
	return out;
}
var UA$4 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var idCache = /* @__PURE__ */ new Map();
var fundCache = /* @__PURE__ */ new Map();
var ID_TTL = 864e5;
var FUND_TTL = 432e5;
async function getJson$1(url) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA$4,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(18e3)
	});
	if (!res.ok) throw new Error(`Groww ${res.status}`);
	return res.json();
}
function parseNum(raw) {
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	if (typeof raw !== "string") return null;
	let t = raw.replace(/₹/g, "").replace(/,/g, "").trim();
	if (!t || t === "-" || t === "NA" || t === "n/a") return null;
	t = t.replace(/\s*cr$/i, "").replace(/%$/i, "").trim();
	const n = Number(t);
	return Number.isFinite(n) ? n : null;
}
function points(series) {
	if (!series) return [];
	return Object.entries(series).map(([period, value]) => ({
		period,
		value
	})).filter((x) => Number.isFinite(x.value));
}
function lastYear(series) {
	if (!series) return null;
	const keys = Object.keys(series).sort();
	if (!keys.length) return null;
	const v = series[keys[keys.length - 1]];
	return Number.isFinite(v) ? v : null;
}
function interestCoverFrom(cons) {
	const ebit = cons.find((x) => /operating profit|\bebit\b|\bpbit\b/i.test(x.title || "") && !/margin|ebitda/i.test(x.title || ""));
	const interest = cons.find((x) => /interest(?! coverage)|finance cost/i.test(x.title || ""));
	const e = lastYear(ebit?.yearly);
	const i = lastYear(interest?.yearly);
	if (e == null || i == null || !(Math.abs(i) > 0)) return null;
	const c = e / Math.abs(i);
	return Number.isFinite(c) && c > 0 && c < 800 ? c : null;
}
function cleanUrl(raw) {
	const s = String(raw || "").trim();
	if (!s) return null;
	try {
		const u = new URL(s.startsWith("http") ? s : "https://" + s);
		if (u.hostname && !/wikipedia\.org$/i.test(u.hostname)) return u.origin;
	} catch {
		return null;
	}
	return null;
}
async function searchGroww(q) {
	try {
		return (await getJson$1("https://groww.in/v1/api/search/v2/query/global/st_p_query?page=0&size=8&web=true&q=" + encodeURIComponent(q)))?.data?.content || [];
	} catch {
		return [];
	}
}
function exactId(rows, bare) {
	return rows.find((r) => {
		if (r.entity_type !== "Stocks" || !r.search_id) return false;
		const nse = String(r.nse_scrip_code || "").toUpperCase();
		const bse = String(r.bse_scrip_code || "").toUpperCase();
		return nse === bare || bse === bare;
	})?.search_id || null;
}
async function searchId(symbol) {
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	if (!bare || bare === "GOLD" || bare === "SILVER") return null;
	const hit = idCache.get(bare);
	if (hit && Date.now() - hit.at < ID_TTL) return hit.id;
	const fromTicker = exactId(await searchGroww(bare), bare);
	if (fromTicker) {
		idCache.set(bare, {
			at: Date.now(),
			id: fromTicker
		});
		return fromTicker;
	}
	const name = universeName(bare);
	if (name && name.toUpperCase() !== bare) {
		const fromName = exactId(await searchGroww(name), bare);
		if (fromName) {
			idCache.set(bare, {
				at: Date.now(),
				id: fromName
			});
			return fromName;
		}
	}
	idCache.set(bare, {
		at: Date.now(),
		id: null
	});
	return null;
}
function pick(list, ...names) {
	const lower = names.map((n) => n.toLowerCase());
	return parseNum(list.find((x) => lower.includes(String(x.name || "").toLowerCase()) || lower.includes(String(x.shortName || "").toLowerCase()))?.value);
}
function sharePct(node) {
	if (node == null) return null;
	if (typeof node === "number" && Number.isFinite(node)) return node;
	if (typeof node !== "object") return null;
	const o = node;
	if (typeof o.percent === "number" && Number.isFinite(o.percent)) return o.percent;
	let sum = 0;
	let found = false;
	for (const v of Object.values(o)) {
		if (!v || typeof v !== "object") continue;
		const inner = v;
		if (typeof inner.percent === "number" && Number.isFinite(inner.percent)) {
			sum += inner.percent;
			found = true;
		}
	}
	return found ? sum : null;
}
function diiPct(sh) {
	if (!sh) return null;
	const parts = [
		sharePct(sh.mutualFunds),
		sharePct(sh.otherDomesticInstitutions),
		sharePct(sh.domesticInstitutions)
	].filter((n) => n != null);
	if (!parts.length) return null;
	const s = parts.reduce((a, b) => a + b, 0);
	return s > 0 ? s : null;
}
async function fetchFundamentals(symbol) {
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const cached = fundCache.get(bare);
	if (cached && Date.now() - cached.at < FUND_TTL) return cached.data;
	const id = await searchId(bare);
	if (!id) {
		fundCache.set(bare, {
			at: Date.now(),
			data: null
		});
		return null;
	}
	try {
		const g = await getJson$1("https://groww.in/v1/api/stocks_data/v1/company/search_id/" + encodeURIComponent(id));
		const list = g.fundamentals || [];
		const cons = g.financialStatementV2?.CONSOLIDATED || [];
		const rev = cons.find((x) => /revenue/i.test(x.title || ""));
		const profit = cons.find((x) => /profit/i.test(x.title || "") && !/operating|ebit/i.test(x.title || ""));
		const worth = cons.find((x) => /net worth/i.test(x.title || "")) || (g.financialStatement || []).find((x) => /net worth/i.test(x.title || ""));
		const ebitdaLine = cons.find((x) => /ebitda/i.test(x.title || "") && !/margin/i.test(x.title || ""));
		const cfoLine = cons.find((x) => /cash from operat|operating cash|cash flow from operat|\bcfo\b/i.test(x.title || ""));
		const shareholding = sortShareholding(Object.keys(g.shareHoldingPattern || {}).map((period) => {
			const sh = g.shareHoldingPattern?.[period];
			return {
				period,
				promoters: sharePct(sh?.promoters),
				fii: sharePct(sh?.foreignInstitutions),
				dii: diiPct(sh)
			};
		}));
		const latestSh = shareholding.length ? g.shareHoldingPattern?.[shareholding[shareholding.length - 1].period] : void 0;
		const reportedCover = pick(list, "Interest Coverage", "Interest Coverage Ratio", "Interest Cover");
		const derivedCover = reportedCover == null ? interestCoverFrom(cons) : null;
		let done = applyFormulas(stampCard({
			symbol: bare,
			searchId: id,
			name: g.header?.displayName || bare,
			industry: g.header?.industryName || "",
			ceo: g.details?.ceo || "",
			founded: g.details?.foundedYear || "",
			summary: g.details?.businessSummary || "",
			mcapCr: pick(list, "Market Cap", "Mkt Cap"),
			pe: pick(list, "P/E Ratio(TTM)", "P/E Ratio", "PE"),
			pb: pick(list, "P/B Ratio", "PB"),
			roe: pick(list, "ROE"),
			de: pick(list, "Debt to Equity", "D/E", "Debt/Equity", "Debt Equity Ratio", "DE Ratio", "Debt to equity"),
			divYield: pick(list, "Dividend Yield", "Div Yield"),
			eps: pick(list, "EPS(TTM)", "EPS"),
			book: pick(list, "Book Value"),
			face: pick(list, "Face Value"),
			industryPe: pick(list, "Industry P/E"),
			salesYoY: null,
			profitYoY: null,
			sales: points(rev?.yearly),
			profits: points(profit?.yearly),
			qSales: points(rev?.quarterly),
			qProfits: points(profit?.quarterly),
			netWorth: points(worth?.yearly),
			qNetWorth: points(worth?.quarterly),
			shareholding,
			promoters: sharePct(latestSh?.promoters),
			fii: sharePct(latestSh?.foreignInstitutions),
			dii: diiPct(latestSh),
			roce: pick(list, "ROCE", "Return on Capital Employed", "ROCE %"),
			peg: pick(list, "PEG", "PEG Ratio", "PEG ratio"),
			forwardPe: pick(list, "Forward PE", "Forward P/E", "Fwd PE", "Forward P/E Ratio", "Forward PE Ratio", "Forward PE(x)"),
			forwardEps: pick(list, "Forward EPS", "Fwd EPS", "Estimated EPS", "EPS Forward"),
			forwardPeg: pick(list, "Forward PEG", "Fwd PEG", "Forward PEG Ratio"),
			opm: pick(list, "OPM", "Operating Profit Margin", "OPM %", "Operating Margin", "EBIT Margin"),
			salesCagr3: null,
			profitCagr3: null,
			profitCagr5: null,
			website: cleanUrl(g.details?.websiteUrl || g.details?.website || g.details?.companyWebsite),
			interestCover: reportedCover ?? derivedCover,
			pegVia: null,
			ebitda: points(ebitdaLine?.yearly),
			cfo: points(cfoLine?.yearly),
			qCfo: points(cfoLine?.quarterly),
			cfoPat: null,
			finPeriod: points(rev?.yearly).at(-1)?.period || points(profit?.yearly).at(-1)?.period || null,
			shPeriod: shareholding.at(-1)?.period || null,
			retrievedAt: Date.now()
		}));
		if (derivedCover != null && done.interestCover === derivedCover) done = noteDerived(done, { interestCover: "Kosh-derived: operating profit / finance cost from the company-card lines. Not a reported interest-coverage line." });
		fundCache.set(bare, {
			at: Date.now(),
			data: done
		});
		return done;
	} catch {
		fundCache.set(bare, {
			at: Date.now(),
			data: null
		});
		return null;
	}
}
function fundLines(f) {
	if (!f) return "Fundamentals: not on file for this ticker.";
	const n = (v, s) => v == null || !Number.isFinite(v) ? null : `${s} ${v}`;
	return [
		"Fundamentals on file:",
		n(f.mcapCr, "Market cap ₹") && `Market cap: ₹${f.mcapCr} Cr`,
		n(f.pe, "PE") && `Stock P/E: ${f.pe}`,
		n(f.industryPe, "Industry PE") && `Industry P/E: ${f.industryPe}`,
		n(f.pb, "PB") && `P/B: ${f.pb}`,
		n(f.book, "Book") && `Book value: ₹${f.book}`,
		n(f.eps, "EPS") && `EPS (TTM): ₹${f.eps}`,
		n(f.roe, "ROE") && `ROE: ${f.roe}%`,
		n(f.roce, "ROCE") && `ROCE: ${f.roce}%`,
		n(f.de, "D/E") && `Debt/Equity: ${f.de}`,
		n(f.opm, "OPM") && `Operating margin (TTM): ${f.opm}%`,
		n(f.peg, "PEG") && `PEG: ${f.peg}${f.pegVia ? " (" + f.pegVia + ")" : ""}`,
		n(f.interestCover, "IntCover") && `Interest coverage: ${f.interestCover}`,
		n(f.divYield, "Div") && `Dividend yield: ${f.divYield}%`,
		n(f.face, "Face") && `Face value: ₹${f.face}`,
		n(f.salesYoY, "Sales") && `Sales growth (latest year): ${f.salesYoY?.toFixed(1)}%`,
		n(f.profitYoY, "Profit") && `Profit growth (latest year): ${f.profitYoY?.toFixed(1)}%`,
		n(f.salesCagr3, "Sales3") && `Sales CAGR 3Y: ${f.salesCagr3?.toFixed(1)}%`,
		n(f.profitCagr3, "Pat3") && `Profit CAGR 3Y: ${f.profitCagr3?.toFixed(1)}%`,
		n(f.profitCagr5, "Pat5") && `Profit CAGR 5Y: ${f.profitCagr5?.toFixed(1)}%`,
		f.cfoPat != null ? `CFO / profit: ${f.cfoPat.toFixed(2)}×` : null,
		f.cfo.length ? `Cash from operations (yearly, ₹ Cr): ${f.cfo.slice(-4).map((p) => `${p.period} ${p.value}`).join("; ")}` : null,
		f.promoters != null ? `Promoters: ${f.promoters.toFixed(1)}%` : null,
		f.fii != null ? `FII: ${f.fii.toFixed(1)}%` : null,
		f.dii != null ? `DII: ${f.dii.toFixed(1)}%` : null,
		f.website ? `Company website: ${f.website}` : null,
		f.summary ? `Company summary: ${f.summary}` : null
	].filter(Boolean).join("\n");
}
/** Server-side abuse controls. Client headers are not a limit. */
var buckets = /* @__PURE__ */ new Map();
function clientKey(request) {
	return (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local").slice(0, 80);
}
function rateLimit(key, max, windowMs) {
	const now = Date.now();
	const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
	if (arr.length >= max) {
		buckets.set(key, arr);
		return false;
	}
	arr.push(now);
	buckets.set(key, arr);
	if (buckets.size > 5e3) {
		const oldest = buckets.keys().next().value;
		if (oldest) buckets.delete(oldest);
	}
	return true;
}
function tooLarge(request, maxBytes) {
	const n = Number(request.headers.get("content-length") || 0);
	return Number.isFinite(n) && n > maxBytes;
}
var FILING_HOSTS = ["nseindia.com", "bseindia.com"];
/** Filing fetches may only follow official exchange hosts. */
function allowedFilingUrl(raw) {
	try {
		const u = new URL(raw);
		if (u.protocol !== "https:") return false;
		const host = u.hostname.toLowerCase();
		return FILING_HOSTS.some((h) => host === h || host.endsWith("." + h));
	} catch {
		return false;
	}
}
var UA$3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var xmlCache = /* @__PURE__ */ new Map();
var deepCache = /* @__PURE__ */ new Map();
var XML_TTL = 864e5;
var DEEP_TTL = 432e5;
var nseCookies$1 = "";
var nseCookieAt$1 = 0;
async function nseSession$1() {
	if (nseCookies$1 && Date.now() - nseCookieAt$1 < 48e4) return nseCookies$1;
	try {
		const res = await fetch("https://www.nseindia.com/", {
			headers: {
				"User-Agent": UA$3,
				Accept: "text/html"
			},
			signal: AbortSignal.timeout(1e4),
			redirect: "follow"
		});
		nseCookies$1 = (typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [res.headers.get("set-cookie") || ""]).filter(Boolean).map((c) => c.split(";")[0]).join("; ");
		nseCookieAt$1 = Date.now();
	} catch {
		nseCookies$1 = nseCookies$1 || "";
	}
	return nseCookies$1;
}
async function nseJson$1(path) {
	const cookie = await nseSession$1();
	const res = await fetch("https://www.nseindia.com" + path, {
		headers: {
			"User-Agent": UA$3,
			Accept: "application/json,text/plain,*/*",
			Referer: "https://www.nseindia.com/",
			Cookie: cookie
		},
		signal: AbortSignal.timeout(16e3)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.json();
}
async function fetchXml(url) {
	if (!allowedFilingUrl(url)) return null;
	const hit = xmlCache.get(url);
	if (hit && Date.now() - hit.at < XML_TTL) return hit.xml;
	try {
		const cookie = await nseSession$1();
		const res = await fetch(url, {
			headers: {
				"User-Agent": UA$3,
				Accept: "application/xml,text/xml,*/*",
				Referer: "https://www.nseindia.com/",
				Cookie: cookie
			},
			signal: AbortSignal.timeout(18e3)
		});
		if (!res.ok) {
			xmlCache.set(url, {
				at: Date.now(),
				xml: null
			});
			return null;
		}
		const xml = await res.text();
		if (!xml.includes("<") || xml.length < 200) {
			xmlCache.set(url, {
				at: Date.now(),
				xml: null
			});
			return null;
		}
		xmlCache.set(url, {
			at: Date.now(),
			xml
		});
		return xml;
	} catch {
		xmlCache.set(url, {
			at: Date.now(),
			xml: null
		});
		return null;
	}
}
function localName(tag) {
	return tag.replace(/^.*:/, "");
}
function parseXbrl(xml) {
	const contexts = [];
	const ctxRe = /<([A-Za-z0-9_]+:)?context\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/\1?context>/gi;
	let m;
	while (m = ctxRe.exec(xml)) {
		const id = m[2];
		const body = m[3];
		const start = body.match(/<([A-Za-z0-9_]+:)?startDate>([^<]+)</i)?.[2];
		const end = body.match(/<([A-Za-z0-9_]+:)?endDate>([^<]+)</i)?.[2];
		const instant = body.match(/<([A-Za-z0-9_]+:)?instant>([^<]+)</i)?.[2];
		const members = [...body.matchAll(/<([A-Za-z0-9_]+:)?explicitMember[^>]*>([^<]+)</gi)].map((x) => localName(x[2].trim()));
		let days = 0;
		if (start && end) {
			const a = Date.parse(start);
			const b = Date.parse(end);
			if (Number.isFinite(a) && Number.isFinite(b) && b >= a) days = Math.round((b - a) / 864e5) + 1;
		}
		contexts.push({
			id,
			start,
			end,
			instant,
			members,
			days
		});
	}
	const facts = [];
	const factRe = /<([A-Za-z0-9_-]+:[A-Za-z0-9_-]+)\s([^>]*)>([^<]*)<\/\1>/g;
	while (m = factRe.exec(xml)) {
		const name = localName(m[1]);
		const attrs = m[2];
		const raw = m[3].replace(/,/g, "").trim();
		if (!raw || raw === "true" || raw === "false") continue;
		const n = Number(raw);
		if (!Number.isFinite(n)) continue;
		const context = attrs.match(/contextRef="([^"]+)"/)?.[1] || "";
		const unit = attrs.match(/unitRef="([^"]+)"/)?.[1] || "";
		facts.push({
			name,
			context,
			value: n,
			unit
		});
	}
	return {
		contexts,
		facts
	};
}
function ctxById(ctx) {
	const m = /* @__PURE__ */ new Map();
	for (const c of ctx) m.set(c.id, c);
	return m;
}
function pickDuration(ctx, kind) {
	const plain = ctx.filter((c) => !c.members.length && c.days > 0);
	if (kind === "year") return plain.filter((c) => c.days >= 300).sort((a, b) => b.days - a.days)[0]?.id || ctx.find((c) => /^FourD$/i.test(c.id))?.id || null;
	return plain.filter((c) => c.days >= 70 && c.days <= 120).sort((a, b) => a.days - b.days)[0]?.id || ctx.find((c) => /^OneD$/i.test(c.id))?.id || null;
}
function pickInstant(ctx) {
	const named = ctx.find((c) => /^OneI$/i.test(c.id) && !c.members.length);
	if (named) return named.id;
	return ctx.filter((c) => !c.members.length && c.instant)[0]?.id || null;
}
function factAt(facts, names, contextId) {
	if (!contextId) return null;
	for (const n of names) {
		const hit = facts.find((f) => f.name === n && f.context === contextId);
		if (hit && Number.isFinite(hit.value)) return hit.value;
	}
	return null;
}
function toCr(v, unit) {
	if (v == null || !Number.isFinite(v)) return null;
	if (/pure|shares|eps|inrPerShare/i.test(unit || "")) return v;
	if (Math.abs(v) >= 1e4) return v / 1e7;
	return v;
}
function periodLabel(end, start, days) {
	if (!end) return start || "";
	const [y, m] = end.slice(0, 10).split("-");
	const mon = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number(m) - 1] || m;
	if (days && days >= 300) return `Mar ${y}`;
	return `${mon} ${y}`;
}
var REV = [
	"RevenueFromOperations",
	"Income",
	"InterestEarned",
	"RevenueFromSaleOfProductsAndServices"
];
var PAT = [
	"ProfitOrLossAttributableToOwnersOfParent",
	"ProfitLossForPeriod",
	"ProfitLossForPeriodFromContinuingOperations"
];
var CFO = ["CashFlowsFromUsedInOperatingActivities"];
var WORTH = [
	"EquityAttributableToOwnersOfParent",
	"Equity",
	"NetWorth"
];
var DE = ["DebtEquityRatio"];
var FACE = ["FaceValueOfEquityShareCapital"];
var EPS = ["BasicEarningsLossPerShareFromContinuingAndDiscontinuedOperations", "BasicEarningsLossPerShareFromContinuingOperations"];
var OP_MARGIN = ["OperatingProfitMargin", "OperatingMargin"];
var OP_PROFIT = [
	"OperatingProfit",
	"ProfitFromOperations",
	"ProfitLossFromOperatingActivities"
];
var EBITDA = ["EarningsBeforeInterestTaxDepreciationAndAmortisation", "EBITDA"];
var FINANCE = ["FinanceCosts"];
var BORROW_C = ["BorrowingsCurrent"];
var BORROW_N = ["BorrowingsNoncurrent"];
function filingFromXbrl(xml, kind) {
	const { contexts, facts } = parseXbrl(xml);
	const id = pickDuration(contexts, kind);
	if (!id) return null;
	const ctx = contexts.find((c) => c.id === id);
	const unitOf = (names) => facts.find((f) => names.includes(f.name) && f.context === id)?.unit || "";
	const sales = toCr(factAt(facts, REV, id), unitOf(REV));
	const profits = toCr(factAt(facts, PAT, id), unitOf(PAT));
	const cfo = toCr(factAt(facts, CFO, id), unitOf(CFO));
	const netWorth = toCr(factAt(facts, WORTH, id), unitOf(WORTH));
	const ebitda = toCr(factAt(facts, EBITDA, id), unitOf(EBITDA));
	const deFiled = factAt(facts, DE, id);
	const face = factAt(facts, FACE, id);
	const eps = factAt(facts, EPS, id);
	const pbt = toCr(factAt(facts, ["ProfitBeforeExceptionalItemsAndTax", "ProfitBeforeTax"], id), unitOf(["ProfitBeforeExceptionalItemsAndTax", "ProfitBeforeTax"]));
	const finance = toCr(factAt(facts, FINANCE, id), unitOf(FINANCE));
	const marginFact = factAt(facts, OP_MARGIN, id);
	const opProfit = toCr(factAt(facts, OP_PROFIT, id), unitOf(OP_PROFIT));
	let opm = null;
	if (marginFact != null && Number.isFinite(marginFact) && marginFact > -5 && marginFact < 150) opm = marginFact <= 1.5 ? marginFact * 100 : marginFact;
	else if (opProfit != null && sales && sales !== 0) {
		const m = opProfit / sales * 100;
		opm = Number.isFinite(m) && m > -50 && m < 150 ? m : null;
	}
	const ebit = pbt != null ? pbt + (finance && finance > 0 ? finance : 0) : null;
	let interestCover = null;
	if (kind === "year" && ebit != null && finance != null && finance > .01) {
		const c = ebit / finance;
		interestCover = Number.isFinite(c) && c > 0 && c < 800 ? c : null;
	}
	const instId = kind === "year" ? pickInstant(contexts) : null;
	let roce = null;
	let de = deFiled;
	if (instId) {
		const equity = toCr(factAt(facts, WORTH, instId), facts.find((f) => WORTH.includes(f.name) && f.context === instId)?.unit || "");
		const bc = toCr(factAt(facts, BORROW_C, instId), "INR");
		const bn = toCr(factAt(facts, BORROW_N, instId), "INR");
		const debt = bc == null && bn == null ? null : (bc || 0) + (bn || 0);
		if (de == null && equity != null && equity > 0 && debt != null) de = debt / equity;
		const capital = (equity || 0) + (debt || 0);
		if (kind === "year" && ebit != null && capital > 0) {
			const r = ebit / capital * 100;
			roce = Number.isFinite(r) && r > -50 && r < 400 ? r : null;
		}
		if (netWorth == null && equity != null) {}
	}
	const worth = netWorth ?? (instId ? toCr(factAt(facts, WORTH, instId), "INR") : null);
	if (sales == null && profits == null && cfo == null && worth == null) return null;
	return {
		period: periodLabel(ctx?.end, ctx?.start, ctx?.days),
		sales,
		profits,
		cfo,
		netWorth: worth,
		ebitda,
		de,
		face,
		eps,
		opm,
		roce,
		interestCover
	};
}
function parseShpPercents(xml) {
	const { contexts, facts } = parseXbrl(xml);
	const by = ctxById(contexts);
	const pctFacts = facts.filter((f) => f.name === "ShareholdingAsAPercentageOfTotalNumberOfShares");
	const pickMember = (members) => {
		for (const mem of members) {
			const hit = pctFacts.find((f) => (by.get(f.context)?.members || []).includes(mem));
			if (!hit) continue;
			const v = hit.value;
			return v <= 1.5 ? v * 100 : v;
		}
		return null;
	};
	const promoters = pickMember(["ShareholdingOfPromoterAndPromoterGroupMember"]);
	const fii = pickMember(["InstitutionsForeignMember", "ForeignPortfolioInvestorsMember"]);
	const dii = pickMember(["InstitutionsDomesticMember"]);
	let pledge = null;
	const flag = [...xml.matchAll(/WhetherAnySharesHeldByPromotersAreEncumberedUnderPledged[^>]*>([^<]+)</gi)];
	const pledged = flag.some((x) => /true/i.test(x[1]));
	if (flag.length && !pledged) pledge = 0;
	const enc = facts.find((f) => /Pledg|EncumberedAsAPercentage/i.test(f.name));
	if (enc) {
		const v = enc.value;
		pledge = v <= 1.5 ? v * 100 : v;
	}
	const inst = contexts.find((c) => c.instant)?.instant || null;
	return {
		promoters,
		fii,
		dii,
		pledge,
		period: inst ? periodLabel(inst) : null
	};
}
function uniqPeriod(rows) {
	const m = /* @__PURE__ */ new Map();
	for (const r of rows) {
		if (!r.period) continue;
		const cur = m.get(r.period);
		if (!cur) m.set(r.period, r);
		else m.set(r.period, {
			...cur,
			sales: cur.sales ?? r.sales,
			profits: cur.profits ?? r.profits,
			cfo: cur.cfo ?? r.cfo,
			netWorth: cur.netWorth ?? r.netWorth,
			ebitda: cur.ebitda ?? r.ebitda,
			de: cur.de ?? r.de,
			face: cur.face ?? r.face,
			eps: cur.eps ?? r.eps,
			opm: cur.opm ?? r.opm,
			roce: cur.roce ?? r.roce,
			interestCover: cur.interestCover ?? r.interestCover
		});
	}
	return [...m.values()];
}
function filingStamp(r) {
	const p = parsePeriod(String(r.toDate || r.fromDate || ""));
	return p ? p.t : 0;
}
function preferCons(rows) {
	const cons = rows.filter((r) => /^cons/i.test(String(r.consolidated || "")));
	const sorted = [...cons.length ? cons : rows].sort((a, b) => filingStamp(b) - filingStamp(a));
	const byDate = /* @__PURE__ */ new Map();
	for (const r of sorted) {
		const k = String(r.toDate || r.fromDate || r.xbrl || "");
		if (!k || byDate.has(k)) continue;
		if (r.xbrl) byDate.set(k, r);
	}
	return [...byDate.values()];
}
async function poolMap(items, n, fn) {
	const out = new Array(items.length);
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			out[idx] = await fn(items[idx]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
	return out;
}
async function filingsFor(symbol, period) {
	try {
		const raw = await nseJson$1(`/api/corporates-financial-results?index=equities&symbol=${encodeURIComponent(symbol)}&period=${period}`);
		return Array.isArray(raw) ? raw : [];
	} catch {
		return [];
	}
}
async function integratedFor(symbol) {
	try {
		const raw = await nseJson$1(`/api/integrated-filing-results?index=equities&symbol=${encodeURIComponent(symbol)}&integratedType=integratedfilingfinancials`);
		return (Array.isArray(raw) ? raw : raw?.data || []).filter((r) => /INDAS/i.test(String(r.xbrl || "")) && !/GOVERNANCE/i.test(String(r.xbrl || ""))).map((r) => ({
			toDate: r.qe_Date,
			consolidated: r.consolidated,
			xbrl: r.xbrl
		}));
	} catch {
		return [];
	}
}
async function shareholdingFor(symbol) {
	try {
		const raw = await nseJson$1(`/api/corporate-share-holdings-master?index=equities&symbol=${encodeURIComponent(symbol)}`);
		const rows = Array.isArray(raw) ? raw : [];
		const xbrl = String(rows[0]?.xbrl || "");
		return {
			json: rows,
			xml: xbrl ? await fetchXml(xbrl) : null
		};
	} catch {
		return {
			json: [],
			xml: null
		};
	}
}
function emptyFund(symbol) {
	return {
		symbol,
		searchId: "",
		name: symbol,
		industry: "",
		ceo: "",
		founded: "",
		summary: "",
		mcapCr: null,
		pe: null,
		pb: null,
		roe: null,
		de: null,
		divYield: null,
		eps: null,
		book: null,
		face: null,
		industryPe: null,
		salesYoY: null,
		profitYoY: null,
		sales: [],
		profits: [],
		qSales: [],
		qProfits: [],
		netWorth: [],
		qNetWorth: [],
		shareholding: [],
		promoters: null,
		fii: null,
		dii: null,
		roce: null,
		peg: null,
		forwardPe: null,
		forwardEps: null,
		forwardPeg: null,
		opm: null,
		salesCagr3: null,
		profitCagr3: null,
		profitCagr5: null,
		website: null,
		interestCover: null,
		pegVia: null,
		ebitda: [],
		cfo: [],
		qCfo: [],
		cfoPat: null,
		finPeriod: null,
		shPeriod: null,
		retrievedAt: Date.now(),
		pledge: null
	};
}
async function fetchDeepFundamentals(symbol) {
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const cached = deepCache.get(bare);
	if (cached && Date.now() - cached.at < DEEP_TTL) return {
		fund: cached.fund,
		sources: cached.sources
	};
	const sources = [];
	let base = await fetchFundamentals(bare).catch(() => null) || emptyFund(bare);
	if (base.searchId) sources.push("company card");
	const extra = {};
	try {
		const [annual, quarterly, integrated, sh] = await Promise.all([
			filingsFor(bare, "Annual"),
			filingsFor(bare, "Quarterly"),
			integratedFor(bare),
			shareholdingFor(bare)
		]);
		const seen = /* @__PURE__ */ new Set();
		const files = [];
		for (const r of [
			...preferCons(integrated).slice(0, 8),
			...preferCons(annual).slice(0, 8),
			...preferCons(quarterly).slice(0, 6)
		]) {
			const url = String(r.xbrl || "");
			if (!url || seen.has(url)) continue;
			seen.add(url);
			files.push(r);
		}
		const xmls = await poolMap(files, 2, (r) => fetchXml(String(r.xbrl)));
		const yearSlices = [];
		const qtrSlices = [];
		for (const xml of xmls) {
			if (!xml) continue;
			const y = filingFromXbrl(xml, "year");
			const q = filingFromXbrl(xml, "quarter");
			if (y) yearSlices.push(y);
			if (q) qtrSlices.push(q);
		}
		const years = uniqPeriod(yearSlices).sort((a, b) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0));
		const qtrs = uniqPeriod(qtrSlices).sort((a, b) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0));
		if (years.length) {
			sources.push("exchange filings");
			extra.sales = years.filter((y) => y.sales != null).map((y) => ({
				period: y.period,
				value: y.sales
			}));
			extra.profits = years.filter((y) => y.profits != null).map((y) => ({
				period: y.period,
				value: y.profits
			}));
			extra.cfo = years.filter((y) => y.cfo != null).map((y) => ({
				period: y.period,
				value: y.cfo
			}));
			extra.netWorth = years.filter((y) => y.netWorth != null).map((y) => ({
				period: y.period,
				value: y.netWorth
			}));
			extra.ebitda = years.filter((y) => y.ebitda != null).map((y) => ({
				period: y.period,
				value: y.ebitda
			}));
			extra.de = years.map((y) => y.de).filter((n) => n != null).at(-1) ?? null;
			extra.face = years.map((y) => y.face).filter((n) => n != null).at(-1) ?? null;
			extra.eps = years.map((y) => y.eps).filter((n) => n != null).at(-1) ?? null;
			extra.opm = years.map((y) => y.opm).filter((n) => n != null).at(-1) ?? null;
			extra.roce = years.map((y) => y.roce).filter((n) => n != null).at(-1) ?? null;
			extra.interestCover = years.map((y) => y.interestCover).filter((n) => n != null).at(-1) ?? null;
			extra.finPeriod = extra.sales?.at(-1)?.period || extra.profits?.at(-1)?.period || null;
		}
		if (qtrs.length) {
			if (!sources.includes("exchange filings")) sources.push("exchange filings");
			extra.qSales = qtrs.filter((y) => y.sales != null).map((y) => ({
				period: y.period,
				value: y.sales
			}));
			extra.qProfits = qtrs.filter((y) => y.profits != null).map((y) => ({
				period: y.period,
				value: y.profits
			}));
			extra.qCfo = qtrs.filter((y) => y.cfo != null).map((y) => ({
				period: y.period,
				value: y.cfo
			}));
			extra.qNetWorth = qtrs.filter((y) => y.netWorth != null).map((y) => ({
				period: y.period,
				value: y.netWorth
			}));
		}
		if (sh.json.length) {
			sources.push("shareholding filing");
			const row = sh.json[0];
			const prom = Number(row.pr_and_prgrp);
			if (Number.isFinite(prom)) extra.promoters = prom;
			extra.shPeriod = String(row.date || "") || extra.shPeriod;
		}
		const shFiles = sh.json.filter((r) => r.xbrl).slice(0, 4);
		const shXmls = await poolMap(shFiles, 2, (r) => fetchXml(String(r.xbrl)));
		const points = [];
		let latestShp = null;
		for (let i = 0; i < shFiles.length; i++) {
			const r = shFiles[i];
			const xml = shXmls[i] || (i === 0 ? sh.xml : null);
			const shp = xml ? parseShpPercents(xml) : {
				promoters: null,
				fii: null,
				dii: null,
				pledge: null,
				period: null
			};
			if (i === 0) latestShp = shp;
			const period = String(r.date || shp.period || "");
			if (!period) continue;
			const promoters = Number(r.pr_and_prgrp);
			points.push({
				period,
				promoters: Number.isFinite(promoters) ? promoters : shp.promoters,
				fii: shp.fii,
				dii: shp.dii
			});
		}
		if (latestShp) {
			if (latestShp.promoters != null) extra.promoters = extra.promoters ?? latestShp.promoters;
			if (latestShp.fii != null) extra.fii = latestShp.fii;
			if (latestShp.dii != null) extra.dii = latestShp.dii;
			if (latestShp.pledge != null) extra.pledge = latestShp.pledge;
			if (latestShp.period) extra.shPeriod = extra.shPeriod || latestShp.period;
		}
		if (points.length) extra.shareholding = sortShareholding(points);
	} catch {}
	let fund = applyFormulas(reconcileFundamentals(base, extra, {
		card: base.searchId ? "Company card" : "Structured provider",
		filing: "NSE filing"
	}));
	fund.retrievedAt = Date.now();
	if (!fund.searchId && !fund.sales.length && !fund.profits.length && fund.promoters == null && !fund.cfo.length) {
		deepCache.set(bare, {
			at: Date.now(),
			fund: null,
			sources
		});
		return {
			fund: null,
			sources
		};
	}
	deepCache.set(bare, {
		at: Date.now(),
		fund,
		sources
	});
	return {
		fund,
		sources
	};
}
async function fetchDeepMany(symbols) {
	const uniq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()))].slice(0, 40);
	const funds = {};
	const sources = {};
	await poolMap(uniq, 2, async (s) => {
		const got = await fetchDeepFundamentals(s);
		if (got.fund) funds[s] = got.fund;
		sources[s] = got.sources;
	});
	return {
		funds,
		sources
	};
}
function bare(s) {
	return String(s || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
}
function parseRow(row) {
	try {
		const fund = JSON.parse(row.fund);
		if (!fund || typeof fund !== "object") return null;
		let sources = [];
		try {
			const s = JSON.parse(row.sources || "[]");
			if (Array.isArray(s)) sources = s.map(String);
		} catch {
			sources = [];
		}
		const at = typeof row.at === "string" ? row.at : row.at instanceof Date ? row.at.toISOString() : "";
		return {
			fund,
			sources,
			at
		};
	} catch {
		return null;
	}
}
/** Load cached filings for these tickers. Empty map on a quiet miss or a DB blip. */
async function loadCompanyFunds(symbols) {
	const out = /* @__PURE__ */ new Map();
	const keys = [...new Set(symbols.map(bare).filter(Boolean))];
	if (!keys.length) return out;
	try {
		const sql = await getSql();
		const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
		const rows = await sql.query(`select symbol, fund, sources, at from company_funds where symbol in (${placeholders})`, keys);
		for (const row of rows) {
			const parsed = parseRow(row);
			if (!parsed) continue;
			out.set(bare(row.symbol), parsed);
		}
	} catch {}
	return out;
}
/** Upsert one company at a time. Never a bulk wipe. Returns false when the write did not land. */
async function upsertCompanyFunds(funds, sources = {}) {
	const entries = Object.entries(funds).filter(([, f]) => f && typeof f === "object");
	if (!entries.length) return false;
	try {
		const sql = await getSql();
		for (const [sym, fund] of entries) {
			const key = bare(sym || fund.symbol);
			if (!key) continue;
			const src = sources[sym] || sources[key] || [];
			await sql.query(`insert into company_funds (symbol, fund, sources, at)
         values ($1, $2, $3, now())
         on conflict (symbol) do update set fund = excluded.fund, sources = excluded.sources, at = excluded.at`, [
				key,
				JSON.stringify(fund),
				JSON.stringify(src)
			]);
		}
		return true;
	} catch {
		return false;
	}
}
/** Multi-symbol enrichment runs one name per request so the browser is not stuck on one huge call.
* The job row is stored in Postgres (or PGLite) so a new serverless instance can resume it.
* The in-memory map is only a same-instance cache. */
var globalJobs = globalThis;
var jobs = globalJobs.__koshEnrichJobs || /* @__PURE__ */ new Map();
globalJobs.__koshEnrichJobs = jobs;
function view(job) {
	return {
		jobId: job.jobId,
		status: job.status,
		total: job.total,
		done: job.done,
		failed: job.failed,
		pending: Math.max(0, job.total - job.cursor),
		funds: job.funds,
		sources: job.sources
	};
}
async function persist(job) {
	try {
		await (await getSql()).query(`insert into enrich_jobs (id, payload, updated_at)
       values ($1, $2, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`, [job.jobId, JSON.stringify({
			...job,
			busy: false
		})]);
	} catch (err) {
		console.error("[enrich-job] persist failed", job.jobId, err instanceof Error ? err.message : err);
	}
}
async function load(id) {
	const mem = jobs.get(id);
	if (mem) return mem;
	try {
		const raw = (await (await getSql()).query(`select payload from enrich_jobs where id = $1`, [id]))[0]?.payload;
		if (!raw) return null;
		const job = JSON.parse(typeof raw === "string" ? raw : String(raw));
		if (!job || job.jobId !== id || !Array.isArray(job.symbols)) return null;
		job.busy = false;
		jobs.set(id, job);
		return job;
	} catch {
		return null;
	}
}
async function startEnrichJob(symbols) {
	const id = Math.random().toString(36).slice(2, 10);
	const uniq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter(Boolean))].slice(0, 40);
	const job = {
		jobId: id,
		status: "queued",
		total: uniq.length,
		done: 0,
		failed: [],
		pending: uniq.length,
		funds: {},
		sources: {},
		cursor: 0,
		busy: false,
		symbols: uniq
	};
	jobs.set(id, job);
	await persist(job);
	return view(job);
}
async function advanceEnrichJob(id, step = 1) {
	const job = await load(id);
	if (!job) return null;
	if (job.status === "complete" || job.status === "failed") return view(job);
	if (job.busy) return view(job);
	const symbols = job.symbols;
	const n = Math.max(1, Math.min(3, step));
	job.busy = true;
	job.status = "processing";
	try {
		for (let i = 0; i < n && job.cursor < symbols.length; i++) {
			const sym = symbols[job.cursor];
			job.cursor += 1;
			try {
				const got = await fetchDeepFundamentals(sym);
				if (got.fund) job.funds[sym] = got.fund;
				job.sources[sym] = got.sources;
				if (got.fund) job.done += 1;
				else job.failed.push(sym);
			} catch {
				job.failed.push(sym);
			}
		}
		if (Object.keys(job.funds).length) await upsertCompanyFunds(job.funds, job.sources).catch(() => {});
		if (job.cursor >= symbols.length) job.status = job.done === 0 && job.failed.length ? "failed" : "complete";
	} finally {
		job.busy = false;
	}
	await persist(job);
	return view(job);
}
var STATUSES = /* @__PURE__ */ new Set([
	"researched",
	"not_found",
	"inputs_only",
	"conflicting"
]);
/** A quoted ratio that is not the metric we asked for. */
var SUBSTITUTES = [{
	metric: /interest coverage/i,
	reject: /financial charges coverage|dscr|debt service/i
}];
function evidenceFitsMetric(metric, text) {
	const blob = text || "";
	for (const rule of SUBSTITUTES) {
		if (!rule.metric.test(metric)) continue;
		if (rule.reject.test(blob)) return false;
	}
	return true;
}
function num$1(v) {
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function validateResearch(raw, requested) {
	if (!raw || typeof raw !== "object") return {
		ok: false,
		error: "AI research unavailable"
	};
	const items = raw.items;
	if (!Array.isArray(items)) return {
		ok: false,
		error: "AI research unavailable"
	};
	const want = new Set(requested.map((s) => s.toLowerCase()));
	const out = [];
	for (const item of items) {
		if (!item || typeof item !== "object") return {
			ok: false,
			error: "AI research unavailable"
		};
		const o = item;
		const metric = String(o.metric || "").trim();
		const status = String(o.status || "");
		if (!metric || !STATUSES.has(status)) return {
			ok: false,
			error: "AI research unavailable"
		};
		if (want.size && ![...want].some((w) => metric.toLowerCase().includes(w) || w.includes(metric.toLowerCase()))) return {
			ok: false,
			error: `AI returned ${metric}, which was not requested.`
		};
		const value = num$1(o.value);
		const sourceUrl = String(o.sourceUrl || o.url || "").trim();
		const evidence = String(o.evidence || "").trim();
		const sourceName = String(o.sourceName || "").trim();
		const period = o.period == null ? null : String(o.period);
		const inputs = Array.isArray(o.inputs) ? o.inputs.map((row) => {
			const r = row;
			const v = num$1(r.value);
			if (!r.name || v == null) return null;
			return {
				name: String(r.name).slice(0, 80),
				value: v,
				unit: String(r.unit || "").slice(0, 24)
			};
		}).filter((x) => Boolean(x)) : [];
		if (status === "researched") {
			if (value == null || !sourceUrl.startsWith("http") || evidence.length < 8 || !sourceName || !period) return {
				ok: false,
				error: "AI research unavailable"
			};
		}
		const quote = `${evidence} ${String(o.methodology || "")} ${sourceName}`;
		const substituted = status === "researched" && !evidenceFitsMetric(metric, quote);
		if (status === "conflicting") {
			if (evidence.length < 8 || !sourceName) return {
				ok: false,
				error: "AI research unavailable"
			};
			if (value != null && !sourceUrl.startsWith("http")) return {
				ok: false,
				error: "AI research unavailable"
			};
		}
		if (status === "inputs_only" && !inputs.length) return {
			ok: false,
			error: "AI research unavailable"
		};
		if (status === "not_found" && value != null) return {
			ok: false,
			error: "AI research unavailable"
		};
		out.push({
			metric: metric.slice(0, 80),
			status: substituted ? "not_found" : status,
			value: status === "not_found" || substituted ? null : value,
			unit: String(o.unit || "").slice(0, 24),
			period,
			sourceName: sourceName.slice(0, 120),
			sourceUrl: sourceUrl.slice(0, 400),
			evidence: substituted ? "The source names a different ratio. It was not stored as the requested metric." : evidence.slice(0, 400),
			methodology: String(o.methodology || "").slice(0, 240),
			inputs
		});
	}
	return {
		ok: true,
		items: out
	};
}
/** NSE series that are listed ordinary equity (including illiquid T2T and GSM). */
var EQUITY_SERIES = /* @__PURE__ */ new Set([
	"EQ",
	"BE",
	"SM",
	"ST",
	"BZ"
]);
function classifySecurity(series, name) {
	const s = String(series || "").trim().toUpperCase();
	const n = String(name || "");
	if (/\b(etf|bees)\b/i.test(n)) return {
		kind: "etf",
		board: "main",
		screener: false
	};
	if (s === "IV" || /\binvit\b/i.test(n)) return {
		kind: "invit",
		board: "main",
		screener: false
	};
	if (s === "RE" || /\breit\b/i.test(n)) return {
		kind: "reit",
		board: "main",
		screener: false
	};
	if (/^W\d/.test(s) || s === "WR" || /\bwarrant/i.test(n) && !/warranty/i.test(n)) return {
		kind: "warrant",
		board: "main",
		screener: false
	};
	if (/^P\d/.test(s) || /\bpreference/i.test(n)) return {
		kind: "pref",
		board: "main",
		screener: false
	};
	let board = "main";
	if (s === "SM" || s === "ST") board = "sme";
	if (s === "BZ") board = "gsm";
	if (EQUITY_SERIES.has(s)) return {
		kind: "equity",
		board,
		screener: true
	};
	return {
		kind: "other",
		board: "main",
		screener: false
	};
}
/** Prefer EQ over BE/BZ when the same ISIN appears twice. */
function dedupeByIsin(list) {
	const rank = (s) => s.series === "EQ" ? 3 : s.series === "BE" ? 2 : s.series === "SM" ? 1 : 0;
	const byIsin = /* @__PURE__ */ new Map();
	const noIsin = [];
	for (const row of list) {
		const k = row.isin ? row.isin.toUpperCase() : "";
		if (!k) {
			noIsin.push(row);
			continue;
		}
		const have = byIsin.get(k);
		if (!have || rank(row) > rank(have)) byIsin.set(k, row);
	}
	const out = [...byIsin.values(), ...noIsin];
	const seen = /* @__PURE__ */ new Set();
	const uniq = [];
	for (const row of out) {
		const k = row.symbol.toUpperCase();
		if (seen.has(k)) continue;
		seen.add(k);
		uniq.push(row);
	}
	return uniq;
}
function parseListingDate(raw) {
	const s = String(raw || "").trim();
	if (!s) return null;
	const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	const dmy = s.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{2,4})$/);
	if (dmy) {
		const m = {
			jan: "01",
			feb: "02",
			mar: "03",
			apr: "04",
			may: "05",
			jun: "06",
			jul: "07",
			aug: "08",
			sep: "09",
			oct: "10",
			nov: "11",
			dec: "12"
		}[dmy[2].toLowerCase()];
		if (!m) return s;
		return `${dmy[3].length === 2 ? "20" + dmy[3] : dmy[3]}-${m}-${dmy[1].padStart(2, "0")}`;
	}
	return s;
}
/** NSE equity master (EQUITY_L). Cached 24h. Fallback: static NSE_EQ list. Server-only. */
var UA$2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var URLS = ["https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv", "https://archives.nseindia.com/content/equities/EQUITY_L.csv"];
var TTL$1 = 864e5;
var cache$2 = null;
var inflight = null;
function fallback() {
	return NSE_EQ.map((x) => ({
		symbol: x.symbol,
		name: x.name,
		isin: null,
		series: "EQ",
		listedOn: null,
		exchange: "NSE",
		board: "main",
		active: true,
		kind: "equity"
	}));
}
function splitCsvLine(line) {
	const out = [];
	let cur = "";
	let q = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === "\"") {
			q = !q;
			continue;
		}
		if (c === "," && !q) {
			out.push(cur);
			cur = "";
			continue;
		}
		cur += c;
	}
	out.push(cur);
	return out;
}
function parseEquityCsv(text) {
	const lines = text.replace(/^\uFEFF/, "").replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
	if (lines.length < 2) return [];
	const headers = splitCsvLine(lines[0]).map((h) => h.trim().toUpperCase().replace(/\s+/g, " "));
	const idx = (name) => headers.findIndex((h) => h === name || h.endsWith(name) || h.includes(name));
	const iSym = idx("SYMBOL");
	const iName = headers.findIndex((h) => h.includes("NAME"));
	const iSeries = headers.findIndex((h) => h.includes("SERIES"));
	const iDate = headers.findIndex((h) => h.includes("DATE OF LISTING") || h.includes("LISTING"));
	const iIsin = headers.findIndex((h) => h.includes("ISIN"));
	const iBse = headers.findIndex((h) => h === "BSE CODE" || h.includes("BSE CODE") || h === "SCRIP CODE");
	if (iSym < 0) return [];
	const rows = [];
	for (const line of lines.slice(1)) {
		const cols = splitCsvLine(line);
		const symbol = String(cols[iSym] || "").trim().toUpperCase();
		if (!symbol || !/^[A-Z0-9][A-Z0-9.&-]{0,20}$/.test(symbol)) continue;
		const name = String(iName >= 0 ? cols[iName] : symbol).trim() || symbol;
		const series = String(iSeries >= 0 ? cols[iSeries] : "EQ").trim().toUpperCase() || "EQ";
		const isinRaw = String(iIsin >= 0 ? cols[iIsin] : "").trim().toUpperCase();
		const isin = /^IN[A-Z0-9]{10}$/.test(isinRaw) ? isinRaw : null;
		const bseRaw = String(iBse >= 0 ? cols[iBse] : "").trim();
		const bseCode = /^\d{4,7}$/.test(bseRaw) ? bseRaw : null;
		const listedOn = parseListingDate(iDate >= 0 ? cols[iDate] : "");
		const cls = classifySecurity(series, name);
		if (!cls.screener) continue;
		rows.push({
			symbol,
			name,
			isin,
			series,
			listedOn,
			exchange: "NSE",
			bseCode,
			board: cls.board,
			active: true,
			kind: cls.kind
		});
	}
	return dedupeByIsin(rows);
}
async function downloadCsv(url) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA$2,
			Accept: "text/csv,text/plain,*/*",
			Referer: "https://www.nseindia.com/"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(String(res.status));
	const text = await res.text();
	if (!/symbol/i.test(text.slice(0, 200))) throw new Error("not csv");
	return text;
}
async function fetchEquityMaster() {
	if (cache$2 && Date.now() - cache$2.at < TTL$1 && cache$2.data.length) return cache$2.data;
	if (inflight) return inflight;
	inflight = (async () => {
		for (const url of URLS) try {
			const rows = parseEquityCsv(await downloadCsv(url));
			if (rows.length < 500) continue;
			const isins = {};
			for (const r of rows) if (r.isin) isins[r.isin] = r.symbol;
			registerLiveIsins(isins);
			cache$2 = {
				at: Date.now(),
				data: rows
			};
			return rows;
		} catch {}
		const fb = fallback();
		if (!cache$2) cache$2 = {
			at: Date.now(),
			data: fb
		};
		return cache$2.data.length ? cache$2.data : fb;
	})().finally(() => {
		inflight = null;
	});
	return inflight;
}
async function listedEquities() {
	return (await fetchEquityMaster()).filter((r) => r.kind === "equity").map((r) => ({
		symbol: r.symbol,
		name: r.name,
		isin: r.isin,
		series: r.series,
		listedOn: r.listedOn,
		gsm: r.board === "gsm"
	}));
}
async function searchMaster(q, cap = 12) {
	const n = q.trim().toUpperCase();
	if (n.length < 1) return [];
	const rows = await fetchEquityMaster();
	const starts = [];
	const rest = [];
	for (const x of rows) {
		const nameU = x.name.toUpperCase();
		if (x.symbol === n || x.symbol.startsWith(n) || x.isin && x.isin === n) starts.push({
			symbol: x.symbol,
			name: x.name
		});
		else if (x.symbol.includes(n) || nameU.includes(n)) rest.push({
			symbol: x.symbol,
			name: x.name
		});
		if (starts.length >= cap) break;
	}
	return [...starts, ...rest].slice(0, cap);
}
var NEWS_BUCKETS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "results",
		label: "Results"
	},
	{
		id: "deals",
		label: "Deals"
	},
	{
		id: "policy",
		label: "Policy"
	},
	{
		id: "business",
		label: "Business"
	},
	{
		id: "market",
		label: "Market"
	}
];
function newsBucket(title) {
	const t = title.toLowerCase();
	if (/\b(q[1-4]\b|fy2[0-9]|quarter|earnings|results|pat\b|profit|revenue|ebitda|eps\b|sales|margin|guidance)\b/.test(t)) return "results";
	if (/\b(acquir|acquisition|merger|stake|block deal|open offer|buyback|fpo|qip|preferential|takeover|joint venture|jv\b|deal)\b/.test(t)) return "deals";
	if (/\b(sebi|rbi|gst|tariff|policy|government|ministry|budget|regulation|ban|duty|tax|nclat|nclt|supreme court|cabinet)\b/.test(t)) return "policy";
	if (/\b(plant|capex|order win|order book|contract|product|launch|expansion|factory|refinery|jio|store|capacity|mou)\b/.test(t)) return "business";
	return "market";
}
function newsAboutCompany(title, symbol, name) {
	const raw = String(title || "").trim();
	if (!raw) return false;
	const t = ` ${raw.toLowerCase()} `;
	const bare = String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
	const nm = String(name || "").replace(/\b(limited|ltd\.?|the|india|indian|plc)\b/gi, " ").replace(/\s+/g, " ").trim();
	if (/\b(stocks? to watch|top (gainers|losers)|market wrap|closing bell|sensex today|nifty( 50)? today|most active stocks|gainers and losers)\b/i.test(raw)) return false;
	if (bare === "ITC") {
		const tax = /\b(input tax credit|gst\b|goods and services tax)\b/.test(t);
		const co = /\b(itc limited|itc ltd|itc hotels|itc stock|cigarettes?|aashirvaad|sunfeast|bingo|gold flake)\b/.test(t);
		if (tax && !co) return false;
	}
	return nameHit(t, nm, bare);
}
function nameHit(t, nm, bare) {
	const tick = bare.toLowerCase().replace(/[^a-z0-9]/g, "");
	const compact = t.replace(/[^a-z0-9 ]/g, " ");
	if (tick.length >= 3 && new RegExp(`\\b${tick}\\b`, "i").test(compact)) return true;
	const words = nm.toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
	if (words.length >= 2 && compact.includes(words[0]) && compact.includes(words[1])) return true;
	if (words.length === 1 && compact.includes(words[0])) return true;
	if (nm.length >= 5 && t.includes(nm.toLowerCase())) return true;
	return false;
}
function filterNews(items, bucket) {
	if (bucket === "all") return items;
	return items.filter((n) => newsBucket(n.title) === bucket);
}
function newsTone(title) {
	const t = title.toLowerCase();
	if (/\b(probe|fraud|sebi order|raid|pledge|default|loss widens|downgrade|layoff|fire|ban|penalty|insolvency|npa spike)\b/.test(t)) return "down";
	if (/\b(order win|wins order|record profit|beats|surge|upgrade|capacity|commission|buyback|stake hike|guidance raise|expansion)\b/.test(t)) return "up";
	return "neutral";
}
function newsToneLabel(tone) {
	if (tone === "up") return "Positive wording";
	if (tone === "down") return "Negative wording";
	return "Plain";
}
/** How much this headline could move a decision. Not a price call. */
function newsMaterial(title) {
	const t = title.toLowerCase();
	if (/\b(q[1-4]\b|fy2[0-9]|earnings|results|guidance|profit warning|sebi|raid|probe|fraud|pledge|default|open offer|acquisition|merger|insolvency|ban|penalty|downgrade|upgrade)\b/.test(t)) return "high";
	if (/\b(order win|capex|stake|buyback|block deal|insider|capacity|plant|expansion|mou|contract|dividend|bonus|split)\b/.test(t)) return "medium";
	return "low";
}
/** One line from the headline bucket. Not a price call. */
function newsWhy(title) {
	const b = newsBucket(title);
	if (b === "results") return "A results print can change earnings and the multiple.";
	if (b === "deals") return "Ownership or capital-structure news — check control, dilution, or a change in the float.";
	if (b === "policy") return "Regulation can reprice a whole line of business, not just one print.";
	if (b === "business") return "Operating news (capacity, orders, plants) matters if it changes the earnings path.";
	if (newsMaterial(title) === "high") return "Headline wording is not a conclusion; treat this as something to verify.";
	return "Background. Unlikely to change the thesis on its own.";
}
/** Mark Minervini VCP: contracting pullbacks after an uptrend, then a pivot. Daily bars. */
function avgVol(bars, fromI, toI) {
	const a = Math.max(0, Math.min(fromI, toI));
	const b = Math.min(bars.length - 1, Math.max(fromI, toI));
	if (b < a) return 0;
	let s = 0;
	let n = 0;
	for (let i = a; i <= b; i++) {
		s += bars[i].v || 0;
		n += 1;
	}
	return n ? s / n : 0;
}
function contractionsOf(bars, sw) {
	const out = [];
	for (let i = 0; i < sw.length - 1; i++) {
		const h = sw[i];
		if (h.kind !== "H") continue;
		const low = sw.slice(i + 1).find((x) => x.kind === "L" && x.i > h.i);
		if (!low || !(h.price > 0)) continue;
		const pct = (h.price - low.price) / h.price * 100;
		if (!(pct > 1.2) || pct > 45) continue;
		out.push({
			high: h,
			low,
			pct,
			vol: avgVol(bars, h.i, low.i)
		});
	}
	return out;
}
function shrinking(list) {
	if (list.length < 2) return false;
	for (let i = 1; i < list.length; i++) if (list[i].pct > list[i - 1].pct * .92) return false;
	return true;
}
function detectVcp(bars) {
	const src = (bars || []).filter((b) => b && b.h > 0 && b.l > 0 && b.c > 0);
	if (src.length < 80) return null;
	const window = src.slice(-200);
	const sw = swings(window, window.length > 140 ? 4 : 3);
	if (sw.length < 5) return null;
	const all = contractionsOf(window, sw);
	if (all.length < 2) return null;
	let best = null;
	for (let n = 4; n >= 2; n--) {
		if (all.length < n) continue;
		const slice = all.slice(all.length - n);
		if (!shrinking(slice)) continue;
		if (slice[slice.length - 1].pct > 12.5) continue;
		best = slice;
		break;
	}
	if (!best) return null;
	const first = best[0];
	const lastC = best[best.length - 1];
	const pivot = Math.max(...best.map((c) => c.high.price));
	const leftI = first.high.i;
	if (leftI < 25) return null;
	const pre = window.slice(Math.max(0, leftI - 120), leftI);
	let preLow = Infinity;
	for (const b of pre) if (b.l < preLow) preLow = b.l;
	if (!(preLow > 0) || (first.high.price / preLow - 1) * 100 < 18) return null;
	let baseLow = Infinity;
	for (let i = first.high.i; i < window.length; i++) if (window[i].l < baseLow) baseLow = window[i].l;
	const depth = (pivot - baseLow) / pivot * 100;
	if (depth < 7 || depth > 42) return null;
	const earlyVol = best.slice(0, Math.max(1, best.length - 1)).reduce((s, c) => s + c.vol, 0) / Math.max(1, best.length - 1);
	if (earlyVol > 0 && lastC.vol > earlyVol * 1.15) return null;
	const last = window[window.length - 1];
	const avg50 = volAvg(window, 50) || volAvg(window, 20);
	const volX = avg50 > 0 ? last.v / avg50 : null;
	const lastT = last.t;
	const pivotBar = window[best.reduce((a, c) => c.high.price >= a.high.price ? c : a).high.i];
	const days = Math.max(0, Math.round((lastT - pivotBar.t) / 86400));
	const near = last.c >= pivot * .92 && last.c <= pivot * 1.012;
	const broke = (() => {
		return window.slice(-12).some((b) => b.c > pivot && (avg50 <= 0 || b.v >= avg50 * 1.35));
	})();
	const forming = near && !broke && last.c <= pivot * 1.012;
	const breakout = broke && last.c >= pivot * .995;
	if (!forming && !breakout) return null;
	return {
		forming,
		breakout,
		n: best.length,
		lastPct: lastC.pct,
		days,
		volX,
		pivot
	};
}
/** Separate "no series", "too few bars", and "enough bars, not a VCP". */
function classifyVcp(bars) {
	if (!bars || bars.length === 0) return {
		state: "unavailable",
		hit: null
	};
	const src = bars.filter((b) => b && b.h > 0 && b.l > 0 && b.c > 0);
	if (!src.length) return {
		state: "unavailable",
		hit: null
	};
	if (src.length < 80) return {
		state: "insufficient",
		hit: null
	};
	const hit = detectVcp(src);
	if (!hit) return {
		state: "na",
		hit: null
	};
	return {
		state: "calculated",
		hit
	};
}
var SCREEN_PRESETS = [
	{
		id: "all",
		label: "All listed",
		hint: "Every NSE equity. A blank cell is missing, not a pass."
	},
	{
		id: "soundmb",
		label: "Quality compounder",
		hint: "Strict: every check present and pass — 3Y/5Y growth, promoter >50%, D/E ≤0.5, ROCE ≥20%, OPM ≥12%, PEG ≤2"
	},
	{
		id: "qgrowth",
		label: "Emerging compounder",
		hint: "Strict: ROE ≥15%, sales 1Y ≥12%, profit growth available, D/E ≤1"
	},
	{
		id: "turnmb",
		label: "Turnaround",
		hint: "Strict: profit turn, 1Y profit ≥100%, sales ≥15%, D/E ≤1, ROCE ≥12%, promoter ≥40%"
	},
	{
		id: "retest",
		label: "Breakout retest",
		hint: "Broke a major high, came back to the level, and still holds"
	},
	{
		id: "athretest",
		label: "ATH retest",
		hint: "All-time high broken, then retested"
	},
	{
		id: "breakout",
		label: "Breakout",
		hint: "Near 52-week high with volume ≥ 1.5×"
	},
	{
		id: "high",
		label: "Near high",
		hint: "Within 5% of the 52-week high"
	},
	{
		id: "stretch",
		label: "Off high",
		hint: "At least 15% below the 52-week high"
	},
	{
		id: "growers",
		label: "Sales growers",
		hint: "Latest-year sales growth above 15%"
	},
	{
		id: "quality",
		label: "High ROE",
		hint: "ROE above 15% and debt/equity under 1"
	},
	{
		id: "highdiv",
		label: "Dividend",
		hint: "Dividend yield above 2%"
	},
	{
		id: "stake",
		label: "FII / DII stake",
		hint: "Latest reported quarter vs the one before. Sort FII or DII."
	},
	{
		id: "vcp",
		label: "VCP",
		hint: "Volatility contraction — still inside the base"
	},
	{
		id: "vcpbo",
		label: "Breakout + VCP",
		hint: "VCP pivot broken recently on volume"
	}
];
var niftySet = null;
function niftySymbols() {
	niftySet ??= new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));
	return niftySet;
}
function passNum(v, min, max) {
	if (min != null && Number.isFinite(min)) {
		if (v == null || v < min) return false;
	}
	if (max != null && Number.isFinite(max)) {
		if (v == null || v > max) return false;
	}
	return true;
}
function numOf(r, key) {
	if (key === "name") return null;
	if (key === "vol") return r.vol;
	const v = r[key];
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function sortRows(rows, key, dir) {
	const mul = dir === "asc" ? 1 : -1;
	return [...rows].sort((a, b) => {
		if (key === "name") return mul * a.name.localeCompare(b.name);
		const av = numOf(a, key);
		const bv = numOf(b, key);
		if (av == null && bv == null) return 0;
		if (av == null) return 1;
		if (bv == null) return -1;
		return mul * (av - bv);
	});
}
var BLANK_FUND = [
	"pe",
	"pb",
	"roe",
	"de",
	"mcapCr",
	"divYield",
	"eps",
	"salesYoY",
	"profitYoY",
	"promoters",
	"roce",
	"opm",
	"salesCagr3",
	"profitCagr3",
	"profitCagr5",
	"fii",
	"dii",
	"peg",
	"book",
	"interestCover",
	"cfoPat",
	"pledge"
];
/** Fill a screener row from a cached company card. Never replace a number with a blank. */
function fillBlankScreenFund(row, fund) {
	if (!fund) return row;
	const next = { ...row };
	for (const k of BLANK_FUND) {
		const cur = next[k];
		const v = fund[k];
		if (cur == null && typeof v === "number" && Number.isFinite(v)) next[k] = v;
	}
	return next;
}
function filterSector(rows, sector) {
	if (!sector || sector === "All") return rows;
	return rows.filter((r) => r.sector === sector);
}
function applyFilter(rows, f) {
	return sortRows(rows.filter((r) => r.price > 0).filter((r) => {
		if (!passNum(r.changePct, f.changePctMin, f.changePctMax)) return false;
		if (!passNum(r.ret1m, f.ret1mMin, f.ret1mMax)) return false;
		if (!passNum(r.ret3m, f.ret3mMin, f.ret3mMax)) return false;
		if (!passNum(r.ret1y, f.ret1yMin, f.ret1yMax)) return false;
		if (!passNum(r.offHigh, f.offHighMin, f.offHighMax)) return false;
		if (!passNum(r.rsi, f.rsiMin, f.rsiMax)) return false;
		if (f.volRatioMin != null && Number.isFinite(f.volRatioMin) && (r.volRatio == null || r.volRatio < f.volRatioMin)) return false;
		if (f.above50 === true && r.above50 !== true) return false;
		if (f.above50 === false && r.above50 !== false) return false;
		if (f.above200 === true && r.above200 !== true) return false;
		if (f.above200 === false && r.above200 !== false) return false;
		if (!passNum(r.pe, f.peMin, f.peMax)) return false;
		if (!passNum(r.pb, f.pbMin, f.pbMax)) return false;
		if (!passNum(r.roe, f.roeMin, f.roeMax)) return false;
		if (!passNum(r.de, f.deMin, f.deMax)) return false;
		if (!passNum(r.mcapCr, f.mcapMin, f.mcapMax)) return false;
		if (!passNum(r.divYield, f.divMin, f.divMax)) return false;
		if (!passNum(r.salesYoY, f.salesYoYMin, f.salesYoYMax)) return false;
		if (f.macdBull === true && !(r.macdHist != null && r.macdHist > 0)) return false;
		if (f.macdBull === false && !(r.macdHist != null && r.macdHist <= 0)) return false;
		if (f.bbLow === true && !(r.bbPos != null && r.bbPos < 20)) return false;
		if (f.sectors?.length && !f.sectors.includes(r.sector)) return false;
		return true;
	}), f.sort || "changePct", f.sortDir || "desc");
}
function applyScreen(rows, id) {
	const src = id === "all" ? rows : rows.filter((r) => r.price > 0);
	if (id === "all") return sortRows(src, "mcapCr", "desc");
	if (id === "nifty") return src.filter((r) => niftySymbols().has(r.symbol.toUpperCase()));
	if (id === "up") return sortRows(src, "changePct", "desc");
	if (id === "down") return sortRows(src, "changePct", "asc");
	if (id === "hot") return sortRows(src.filter((r) => (r.volRatio ?? 0) >= 1.4), "vol", "desc");
	if (id === "high") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh >= -5), "offHigh", "desc");
	if (id === "stretch") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh <= -15), "offHigh", "asc");
	if (id === "oversold") return sortRows(src.filter((r) => r.rsi != null && r.rsi < 40), "rsi", "asc");
	if (id === "overbought") return sortRows(src.filter((r) => r.rsi != null && r.rsi > 70), "rsi", "desc");
	if (id === "above200") return src.filter((r) => r.above200 === true);
	if (id === "cheap") return sortRows(src.filter((r) => r.pe != null && r.pe > 0 && r.pe < 20), "pe", "asc");
	if (id === "quality") return sortRows(src.filter((r) => r.roe != null && r.roe >= 15 && r.de != null && r.de < 1), "roe", "desc");
	if (id === "growers") return sortRows(src.filter((r) => r.salesYoY != null && r.salesYoY >= 15), "salesYoY", "desc");
	if (id === "value") return sortRows(src.filter((r) => r.pe != null && r.pe > 0 && r.pe < 18 && r.pb != null && r.pb > 0 && r.pb < 3), "pe", "asc");
	if (id === "highdiv") return sortRows(src.filter((r) => r.divYield != null && r.divYield >= 2), "divYield", "desc");
	if (id === "lowdebt") return sortRows(src.filter((r) => r.de != null && r.de >= 0 && r.de < .5), "de", "asc");
	if (id === "macd") return sortRows(src.filter((r) => r.macdHist != null && r.macdHist > 0 && r.above50 === true), "changePct", "desc");
	if (id === "nr7") return sortRows(src.filter((r) => r.nr7 === true), "changePct", "desc");
	if (id === "gapup") return sortRows(src.filter((r) => (r.gapPct ?? 0) >= 1.5), "changePct", "desc");
	if (id === "breakout") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh >= -2 && (r.volRatio ?? 0) >= 1.5), "vol", "desc");
	if (id === "squeeze") return sortRows(src.filter((r) => r.bbPos != null && r.bbPos > 35 && r.bbPos < 65 && (r.volRatio ?? 1) < .9), "rsi", "asc");
	if (id === "retest") return sortRows(src.filter((r) => r.retest === true), "offHigh", "desc");
	if (id === "athretest") return sortRows(src.filter((r) => r.athRetest === true), "offHigh", "desc");
	if (id === "soundmb") return rankMultibagger(src, SOUND_RULES, "roe");
	if (id === "turnmb") return rankMultibagger(src, TURN_RULES, "salesYoY");
	if (id === "qgrowth") return rankMultibagger(src, GROWTH_RULES, "roe");
	if (id === "stake") return sortRows(src.filter((r) => r.fiiDelta != null && r.fiiDelta > 0 || r.diiDelta != null && r.diiDelta > 0), "fiiDelta", "desc");
	if (id === "vcp") return sortRows(src.filter((r) => r.vcp === true && r.vcpBreak !== true), "vcpLastPct", "asc");
	if (id === "vcpbo") return sortRows(src.filter((r) => r.vcpBreak === true), "vcpDays", "asc");
	return src;
}
var SOUND_RULES = [
	{
		id: "sales3",
		label: "Sales CAGR 3Y > 18%",
		has: (r) => r.salesCagr3 != null,
		ok: (r) => (r.salesCagr3 ?? 0) > 18
	},
	{
		id: "pat3",
		label: "Profit CAGR 3Y > 35%",
		has: (r) => r.profitCagr3 != null,
		ok: (r) => (r.profitCagr3 ?? 0) > 35
	},
	{
		id: "pat5",
		label: "Profit CAGR 5Y > 15%",
		has: (r) => r.profitCagr5 != null,
		ok: (r) => (r.profitCagr5 ?? 0) > 15
	},
	{
		id: "prom",
		label: "Promoter > 50%",
		has: (r) => r.promoters != null,
		ok: (r) => (r.promoters ?? 0) > 50
	},
	{
		id: "de",
		label: "D/E ≤ 0.5",
		has: (r) => r.de != null,
		ok: (r) => r.de != null && r.de <= .5
	},
	{
		id: "sales1",
		label: "Sales 1Y ≥ 8%",
		has: (r) => r.salesYoY != null,
		ok: (r) => (r.salesYoY ?? 0) >= 8
	},
	{
		id: "opm",
		label: "OPM ≥ 12%",
		has: (r) => r.opm != null,
		ok: (r) => (r.opm ?? 0) >= 12
	},
	{
		id: "peg",
		label: "PEG ≤ 2",
		has: (r) => r.peg != null,
		ok: (r) => r.peg != null && r.peg <= 2
	},
	{
		id: "roce",
		label: "ROCE ≥ 20%",
		has: (r) => r.roce != null,
		ok: (r) => (r.roce ?? 0) >= 20
	}
];
var TURN_RULES = [
	{
		id: "pat",
		label: "Latest profit ≥ 0",
		has: (r) => r.eps != null,
		ok: (r) => r.eps != null && r.eps >= 0
	},
	{
		id: "pat1",
		label: "Profit 1Y ≥ 100%",
		has: (r) => r.profitYoY != null,
		ok: (r) => (r.profitYoY ?? 0) >= 100
	},
	{
		id: "sales1",
		label: "Sales 1Y ≥ 15%",
		has: (r) => r.salesYoY != null,
		ok: (r) => (r.salesYoY ?? 0) >= 15
	},
	{
		id: "de",
		label: "D/E ≤ 1",
		has: (r) => r.de != null,
		ok: (r) => r.de != null && r.de <= 1
	},
	{
		id: "roce",
		label: "ROCE ≥ 12%",
		has: (r) => r.roce != null,
		ok: (r) => (r.roce ?? 0) >= 12
	},
	{
		id: "opm",
		label: "OPM ≥ 8%",
		has: (r) => r.opm != null,
		ok: (r) => (r.opm ?? 0) >= 8
	},
	{
		id: "prom",
		label: "Promoter ≥ 40%",
		has: (r) => r.promoters != null,
		ok: (r) => (r.promoters ?? 0) >= 40
	}
];
var GROWTH_RULES = [
	{
		id: "roe",
		label: "ROE ≥ 15%",
		has: (r) => r.roe != null,
		ok: (r) => (r.roe ?? 0) >= 15
	},
	{
		id: "sales1",
		label: "Sales 1Y ≥ 12%",
		has: (r) => r.salesYoY != null,
		ok: (r) => (r.salesYoY ?? 0) >= 12
	},
	{
		id: "de",
		label: "D/E ≤ 1",
		has: (r) => r.de != null,
		ok: (r) => r.de != null && r.de <= 1
	},
	{
		id: "pat",
		label: "Profit growth ≥ 12%",
		has: (r) => r.profitYoY != null || r.profitCagr3 != null,
		ok: (r) => (r.profitYoY ?? -999) >= 12 || (r.profitCagr3 ?? -999) >= 12
	}
];
function enoughPresent(nHave, nNeed) {
	return nHave >= Math.max(3, Math.ceil(nNeed / 2));
}
function scoreMultibagger(rows, rules) {
	return rows.map((r) => {
		const have = rules.filter((x) => x.has(r));
		const pass = have.filter((x) => x.ok(r));
		const fail = have.filter((x) => !x.ok(r));
		const miss = rules.filter((x) => !x.has(r));
		const nNeed = rules.length;
		let kind;
		if (have.length === 0 || !enoughPresent(have.length, nNeed)) kind = "unknown";
		else if (fail.length > 0) kind = "fail";
		else if (have.length === nNeed && pass.length === nNeed) kind = "strict";
		else kind = "candidate";
		return {
			r: {
				...r,
				passCount: pass.length,
				missed: fail.map((x) => x.label),
				unchecked: miss.map((x) => x.label),
				matchKind: kind
			},
			kind,
			nHave: have.length,
			nPass: pass.length,
			nNeed,
			nFail: fail.length,
			nMiss: miss.length
		};
	});
}
function sortScored(scored, sortKey) {
	scored.sort((a, b) => {
		if (b.nPass !== a.nPass) return b.nPass - a.nPass;
		if (b.nHave !== a.nHave) return b.nHave - a.nHave;
		const av = a.r[sortKey];
		const bv = b.r[sortKey];
		const an = typeof av === "number" && Number.isFinite(av) ? av : null;
		const bn = typeof bv === "number" && Number.isFinite(bv) ? bv : null;
		if (an == null && bn == null) return 0;
		if (an == null) return 1;
		if (bn == null) return -1;
		return bn - an;
	});
	return scored.map((x) => x.r);
}
/** Rank only names where every check can be scored. Missing data is not a pass. */
function rankMultibagger(rows, rules, sortKey) {
	return sortScored(scoreMultibagger(rows, rules).filter((x) => x.kind === "strict"), sortKey);
}
/** No known fail, enough present, one or more required fields still blank. */
function candidateMultibagger(rows, rules, sortKey) {
	return sortScored(scoreMultibagger(rows, rules).filter((x) => x.kind === "candidate"), sortKey);
}
function matchLabel(r) {
	const nPass = r.passCount ?? 0;
	const nFail = r.missed?.length ?? 0;
	const nMiss = r.unchecked?.length ?? 0;
	const nNeed = nPass + nFail + nMiss;
	if (!nNeed) return "";
	const bits = [`${nPass}/${nNeed} passed`];
	if (nMiss) bits.push(`${nMiss} unavailable`);
	if (nFail) bits.push(`${nFail} failed`);
	return bits.join(" · ");
}
function rulesForScreen(id) {
	if (id === "soundmb") return SOUND_RULES;
	if (id === "turnmb") return TURN_RULES;
	if (id === "qgrowth") return GROWTH_RULES;
	return null;
}
function sectorPulse(rows) {
	const map = /* @__PURE__ */ new Map();
	for (const r of rows) {
		if (!(r.price > 0)) continue;
		const cur = map.get(r.sector) || {
			change: 0,
			n: 0,
			up: 0
		};
		cur.change += r.changePct;
		cur.n += 1;
		if (r.changePct >= 0) cur.up += 1;
		map.set(r.sector, cur);
	}
	return [...map.entries()].map(([sector, s]) => {
		const avg = s.n ? s.change / s.n : 0;
		return {
			sector,
			avg,
			changePct: avg,
			up: s.up,
			n: s.n
		};
	}).sort((a, b) => b.avg - a.avg);
}
function marketTemp(rows, focus) {
	const want = new Set((focus || []).map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, "")));
	const mine = want.size ? rows.filter((r) => want.has(r.symbol.toUpperCase())) : [];
	const pool = mine.length >= 4 ? mine : rows.filter((r) => r.price > 0);
	const n = pool.length || 1;
	const green = pool.filter((r) => r.changePct >= 0).length / n;
	const rsiVals = pool.map((r) => r.rsi).filter((x) => x != null);
	const avgRsi = rsiVals.length ? rsiVals.reduce((a, b) => a + b, 0) / rsiVals.length : 50;
	const above200 = pool.filter((r) => r.above200 === true).length / n;
	const hot = pool.filter((r) => (r.volRatio ?? 0) >= 1.4).length / n;
	let tag = "Mixed";
	if (green >= .62 && avgRsi >= 58) tag = "Broad bid";
	else if (green <= .38 && avgRsi <= 42) tag = "Risk off";
	else if (hot >= .28) tag = "Hot session";
	else if (green >= .55) tag = "Selective bid";
	else if (green <= .45) tag = "Soft session";
	const whose = mine.length >= 4 ? "Your names" : "This universe";
	return {
		tag,
		whose,
		green,
		avgRsi,
		above200,
		hot,
		n: pool.length
	};
}
function skillPass(r) {
	const fund = r?.fundRating === "pass";
	const qual = r?.qualPotential === "yes";
	return {
		fund,
		qual,
		both: Boolean(fund && qual)
	};
}
function skillPeek(reads, symbol) {
	if (!reads) return void 0;
	return reads[String(symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase()] || reads[symbol];
}
function skillOf(reads, symbol) {
	const r = skillPeek(reads, symbol);
	if (!r?.fundTag || !r?.qualTag) return void 0;
	return r;
}
function skillReadFrom(input) {
	const symbol = String(input.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
	return {
		symbol,
		name: input.name || symbol,
		sector: input.sector || sectorOf(symbol),
		fundTag: input.fund.approvedVerdict || input.fund.tag,
		fundRating: input.fund.rating,
		fundVerdict: input.fund.verdict,
		qualTag: input.qual.approvedVerdict || input.qual.tag,
		qualPotential: input.qual.potential,
		qualVerdict: input.qual.verdict,
		at: Date.now(),
		fundApproved: input.fund.approvedVerdict || input.fund.tag,
		qualApproved: input.qual.approvedVerdict || input.qual.tag,
		fundScore: input.fund.score ?? null,
		fundStatus: input.fund.approvedVerdict || input.fund.tag ? "Done" : "Not started",
		qualStatus: input.qual.approvedVerdict || input.qual.tag ? "Done" : "Not started"
	};
}
function skillReadMerge(existing, patch) {
	const symbol = String(patch.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
	const fundApproved = patch.fund?.approvedVerdict || patch.fund?.tag || existing?.fundApproved || "";
	const qualApproved = patch.qual?.approvedVerdict || patch.qual?.tag || existing?.qualApproved || "";
	return {
		symbol,
		name: patch.name || existing?.name || symbol,
		sector: patch.sector || existing?.sector || sectorOf(symbol),
		fundTag: patch.fund?.approvedVerdict || patch.fund?.tag || existing?.fundTag || "",
		fundRating: patch.fund?.rating || existing?.fundRating || "fail",
		fundVerdict: patch.fund?.verdict || existing?.fundVerdict || "",
		qualTag: patch.qual?.approvedVerdict || patch.qual?.tag || existing?.qualTag || "",
		qualPotential: patch.qual?.potential || existing?.qualPotential || "no",
		qualVerdict: patch.qual?.verdict || existing?.qualVerdict || "",
		at: Date.now(),
		fundApproved: fundApproved || existing?.fundApproved,
		qualApproved: qualApproved || existing?.qualApproved,
		fundScore: patch.fund?.score !== void 0 ? patch.fund.score : existing?.fundScore ?? null,
		fundStatus: patch.fundStatus || (patch.fund ? "Done" : existing?.fundStatus) || "Not started",
		qualStatus: patch.qualStatus || (patch.qual ? "Done" : existing?.qualStatus) || "Not started"
	};
}
function screenKey(symbol) {
	return String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
}
function pickScreenRow(rows, symbol) {
	const k = screenKey(symbol);
	if (!k || !rows?.length) return void 0;
	return rows.find((r) => screenKey(r.symbol) === k && r.price > 0);
}
function mergeScreenRows(base, extra) {
	const rank = (r) => r.depth === "full" ? 3 : r.depth === "quote" && r.price > 0 ? 2 : r.price > 0 ? 1 : 0;
	const map = /* @__PURE__ */ new Map();
	for (const r of [...base, ...extra]) {
		const k = screenKey(r.symbol);
		const have = map.get(k);
		if (!have || rank(r) >= rank(have)) map.set(k, r);
	}
	return [...map.values()];
}
/** Last good Nifty 50 fundamental snapshot. Not rebuilt from a thin screener page. */
var cached = null;
function avg(vals) {
	const xs = vals.filter((v) => v != null && Number.isFinite(v));
	if (!xs.length) return null;
	return xs.reduce((s, v) => s + v, 0) / xs.length;
}
/** Build a snapshot only when at least 15 Nifty 50 names have a P/E or ROE. Otherwise keep the previous one. */
function rememberNifty(rows) {
	const n50 = rows.filter((r) => isNifty50(r.symbol));
	const covered = n50.filter((r) => r.pe != null && r.pe > 0 || r.roe != null).length;
	if (n50.length < 15 || covered < 15) return cached;
	cached = {
		at: Date.now(),
		names: n50.length,
		covered,
		pe: avg(n50.map((r) => r.pe != null && r.pe > 0 && r.pe < 400 ? r.pe : null)),
		pb: avg(n50.map((r) => r.pb != null && r.pb > 0 && r.pb < 80 ? r.pb : null)),
		roe: avg(n50.map((r) => r.roe != null && Math.abs(r.roe) < 200 ? r.roe : null)),
		roce: avg(n50.map((r) => r.roce != null && Math.abs(r.roce) < 200 ? r.roce : null)),
		opm: avg(n50.map((r) => r.opm != null && r.opm > -20 && r.opm < 80 ? r.opm : null)),
		de: avg(n50.map((r) => r.de != null && r.de >= 0 && r.de < 20 ? r.de : null)),
		divYield: avg(n50.map((r) => r.divYield != null && r.divYield >= 0 && r.divYield < 30 ? r.divYield : null))
	};
	return cached;
}
function getNiftySnapshot() {
	return cached;
}
var UA$1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
async function getText(url, timeout = 12e3) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA$1,
			Accept: "*/*"
		},
		signal: AbortSignal.timeout(timeout)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.text();
}
function decode(s) {
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#39;/g, "'").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function tag(block, name) {
	const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
	return m ? decode(m[1]) : "";
}
var newsCache = /* @__PURE__ */ new Map();
var wikiCache = /* @__PURE__ */ new Map();
var screenCache = /* @__PURE__ */ new Map();
var uniInflight = null;
var deepInflight = null;
async function fetchNews(symbol, name) {
	const q = (name || universeName(symbol) || symbol).replace(/\.(NS|BO)$/i, "");
	const key = q.toLowerCase();
	const hit = newsCache.get(key);
	if (hit && Date.now() - hit.at < 18e4) return hit.data;
	const queries = [
		q + " stock NSE",
		q + " stock site:moneycontrol.com",
		q + " stock site:economictimes.indiatimes.com",
		q + " stock site:business-standard.com"
	];
	try {
		const chunks = await Promise.all(queries.map(async (query) => {
			const xml = await getText("https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=en-IN&gl=IN&ceid=IN:en");
			const items = [];
			for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
				const block = m[1];
				const rawTitle = tag(block, "title");
				if (!rawTitle) continue;
				const dash = rawTitle.lastIndexOf(" - ");
				const title = dash > 12 ? rawTitle.slice(0, dash) : rawTitle;
				const publisher = dash > 12 ? rawTitle.slice(dash + 3) : tag(block, "source") || "News";
				const link = tag(block, "link");
				const date = tag(block, "pubDate");
				const ts = date ? Date.parse(date) / 1e3 : 0;
				items.push({
					title,
					publisher,
					link,
					ts: Number.isFinite(ts) ? ts : 0,
					material: newsMaterial(title)
				});
				if (items.length >= 8) break;
			}
			return items;
		}));
		const seen = /* @__PURE__ */ new Set();
		const items = [];
		for (const row of chunks.flat().sort((a, b) => (b.ts || 0) - (a.ts || 0))) {
			const k = row.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
			if (!k || seen.has(k)) continue;
			if (!newsAboutCompany(row.title, symbol, name || q)) continue;
			seen.add(k);
			items.push(row);
			if (items.length >= 20) break;
		}
		newsCache.set(key, {
			at: Date.now(),
			data: items
		});
		return items;
	} catch {
		newsCache.set(key, {
			at: Date.now(),
			data: []
		});
		return [];
	}
}
async function fetchWiki(name) {
	const key = name.trim().toLowerCase();
	if (!key) return null;
	const hit = wikiCache.get(key);
	if (hit && Date.now() - hit.at < 864e5) return hit.data;
	const title = name.replace(/\s+/g, "_");
	try {
		const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title), {
			headers: {
				"User-Agent": "Kosh/1.0 (Indian portfolio reader)",
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) {
			wikiCache.set(key, {
				at: Date.now(),
				data: null
			});
			return null;
		}
		const d = await res.json();
		if (d.type === "disambiguation" || !d.extract) {
			wikiCache.set(key, {
				at: Date.now(),
				data: null
			});
			return null;
		}
		const card = {
			title: d.title || name,
			extract: d.extract,
			url: d.content_urls?.desktop?.page || ""
		};
		wikiCache.set(key, {
			at: Date.now(),
			data: card
		});
		return card;
	} catch {
		wikiCache.set(key, {
			at: Date.now(),
			data: null
		});
		return null;
	}
}
function fundFields(f) {
	const sh = stakeDelta(f?.shareholding);
	return {
		pe: f?.pe ?? null,
		pb: f?.pb ?? null,
		roe: f?.roe ?? null,
		de: f?.de ?? null,
		mcapCr: f?.mcapCr ?? null,
		divYield: f?.divYield ?? null,
		eps: f?.eps ?? null,
		book: f?.book ?? null,
		salesYoY: f?.salesYoY ?? null,
		profitYoY: f?.profitYoY ?? null,
		promoters: f?.promoters ?? null,
		roce: f?.roce ?? null,
		peg: f?.peg ?? null,
		opm: f?.opm ?? null,
		salesCagr3: f?.salesCagr3 ?? null,
		profitCagr3: f?.profitCagr3 ?? null,
		profitCagr5: f?.profitCagr5 ?? null,
		fii: sh?.fii ?? f?.fii ?? null,
		fiiPrev: sh?.fiiPrev ?? null,
		fiiDelta: sh?.fiiDelta ?? null,
		dii: sh?.dii ?? f?.dii ?? null,
		diiPrev: sh?.diiPrev ?? null,
		diiDelta: sh?.diiDelta ?? null,
		shLabel: sh?.label ?? null
	};
}
function toRow(pack, input, fund) {
	const bars = pack.bars;
	const last = bars.at(-1);
	const closes = bars.map((b) => b.c);
	const ma50 = sma(closes, 50);
	const ma200 = sma(closes, 200);
	const last50 = [...ma50].reverse().find((x) => x != null) ?? null;
	const last200 = [...ma200].reverse().find((x) => x != null) ?? null;
	const px = pack.price || last?.c || 0;
	const avg = volAvg(bars, 20);
	const vol = pack.volume || last?.v || 0;
	const off = pack.high52 ? (px / pack.high52 - 1) * 100 : null;
	const bare = input.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const retest = detectRetest(bars);
	const classified = classifyVcp(bars);
	const vcp = classified.hit;
	const retBars = bars.map((b) => ({
		...b,
		c: b.adj && b.adj > 0 ? b.adj : b.c
	}));
	const thin = pack.mcapCr != null && pack.mcapCr < 500 || avg > 0 && avg < 5e4;
	return {
		symbol: bare,
		name: pack.name || TICKER_NAMES[bare] || universeName(bare),
		sector: sectorOf(bare, fund?.industry),
		price: px,
		changePct: pack.changePct,
		high52: pack.high52,
		low52: pack.low52,
		offHigh: off,
		ret1m: retFrom(retBars, 31),
		ret3m: retFrom(retBars, 93),
		ret1y: retFrom(retBars, 365),
		vol,
		volAvg: avg,
		volRatio: avg > 0 ? vol / avg : null,
		rsi: lastRsi(bars),
		above50: last50 != null && px > 0 ? px >= last50 : null,
		above200: last200 != null && px > 0 ? px >= last200 : null,
		macdHist: lastMacdHist(bars),
		bbPos: lastBbPos(bars),
		nr7: isNr7(bars),
		gapPct: last && bars.at(-2)?.c ? (last.o / bars[bars.length - 2].c - 1) * 100 : null,
		above21: (() => {
			const lastE = [...ema(closes, 21)].reverse().find((x) => x != null) ?? null;
			return lastE != null && px > 0 ? px >= lastE : null;
		})(),
		...fundFields(fund),
		mcapCr: fund?.mcapCr ?? pack.mcapCr ?? null,
		retest: retest.hit,
		retestLevel: retest.level,
		athRetest: retest.hit && retest.ath,
		vcp: vcp ? vcp.forming || vcp.breakout : null,
		vcpBreak: vcp?.breakout ?? null,
		vcpN: vcp?.n ?? null,
		vcpLastPct: vcp?.lastPct ?? null,
		vcpDays: vcp?.days ?? null,
		vcpVolX: vcp?.volX ?? null,
		vcpPivot: vcp?.pivot ?? null,
		vcpState: classified.state,
		depth: "full",
		thin
	};
}
async function pool$1(items, limit, fn) {
	const out = new Array(items.length);
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			out[idx] = await fn(items[idx]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return out;
}
function emptyRow(u) {
	return {
		symbol: u.symbol,
		name: u.name,
		sector: sectorOf(u.symbol),
		price: 0,
		changePct: 0,
		high52: 0,
		low52: 0,
		offHigh: null,
		ret1m: null,
		ret3m: null,
		ret1y: null,
		vol: 0,
		volAvg: 0,
		volRatio: null,
		rsi: null,
		above50: null,
		above200: null,
		macdHist: null,
		bbPos: null,
		nr7: null,
		gapPct: null,
		above21: null,
		...fundFields(null),
		retest: null,
		retestLevel: null,
		athRetest: null,
		vcp: null,
		vcpBreak: null,
		vcpN: null,
		vcpLastPct: null,
		vcpDays: null,
		vcpVolX: null,
		vcpPivot: null,
		vcpState: "unavailable",
		depth: "name",
		thin: null
	};
}
async function withCachedFunds(rows) {
	const cache = await loadCompanyFunds(rows.map((r) => r.symbol));
	const next = cache.size ? rows.map((r) => fillBlankScreenFund(r, cache.get(r.symbol)?.fund)) : rows;
	rememberNifty(next);
	return next;
}
async function fetchScreener() {
	const hit = screenCache.get("deep-v9");
	if (hit && Date.now() - hit.at < 9e5) {
		rememberNifty(hit.data);
		return hit.data;
	}
	if (deepInflight) return deepInflight;
	deepInflight = (async () => {
		const patched = await withCachedFunds((await pool$1(DEEP_UNIVERSE, 14, async (u) => {
			try {
				const [pack, fund] = await Promise.all([fetchOhlc(u.symbol, "2y", "1d"), fetchFundamentals(u.symbol).catch(() => null)]);
				if (pack.missing || pack.price <= 0) return emptyRow(u);
				return toRow(pack, u.symbol, fund);
			} catch {
				return emptyRow(u);
			}
		})).filter((r) => r.price > 0));
		if (patched.length) screenCache.set("deep-v9", {
			at: Date.now(),
			data: patched
		});
		return patched;
	})().finally(() => {
		deepInflight = null;
	});
	return deepInflight;
}
async function fetchScreenerUniverse() {
	const hit = screenCache.get("uni-v10");
	if (hit && Date.now() - hit.at < 9e5) {
		rememberNifty(hit.data);
		return hit.data;
	}
	if (uniInflight) return uniInflight;
	uniInflight = (async () => {
		const listed = await listedEquities().catch(() => []);
		const universe = listed.length >= 1e3 ? listed.map((u) => ({
			symbol: u.symbol,
			name: u.name,
			isin: u.isin,
			series: u.series,
			listedOn: u.listedOn,
			gsm: u.gsm
		})) : SCREEN_UNIVERSE.map((u) => ({
			symbol: u.symbol,
			name: u.name,
			isin: null,
			series: "EQ",
			listedOn: null,
			gsm: false
		}));
		const meta = new Map(universe.map((u) => [u.symbol, u]));
		const snaps = await fetchQuoteSnaps(universe.map((u) => u.symbol));
		const bySnap = new Map(snaps.map((s) => [s.symbol, s]));
		const deep = screenCache.get("deep-v9")?.data || screenCache.get("deep-v8")?.data || [];
		const byDeep = new Map(deep.map((r) => [r.symbol, r]));
		const rows = universe.map((u) => {
			const full = byDeep.get(u.symbol);
			const m = meta.get(u.symbol);
			const extra = {
				isin: m?.isin ?? null,
				series: m?.series ?? null,
				listedOn: m?.listedOn ?? null,
				gsm: m?.gsm ?? null
			};
			if (full && full.price > 0) return {
				...full,
				...extra
			};
			const s = bySnap.get(u.symbol);
			if (!s) return {
				...emptyRow(u),
				name: u.name,
				...extra
			};
			const px = s.price;
			const volRatio = s.volAvg > 0 ? s.vol / s.volAvg : null;
			const thin = s.mcapCr != null && s.mcapCr < 500 || s.volAvg > 0 && s.volAvg < 5e4 || extra.gsm === true;
			return {
				...emptyRow(u),
				name: s.name || u.name,
				price: px,
				changePct: s.changePct,
				high52: s.high52,
				low52: s.low52,
				offHigh: s.high52 && px ? (px / s.high52 - 1) * 100 : null,
				vol: s.vol,
				volAvg: s.volAvg,
				volRatio,
				pe: s.pe,
				pb: s.pb,
				eps: s.eps,
				book: s.book,
				divYield: s.divYield,
				mcapCr: s.mcapCr,
				above50: s.ma50 != null && px > 0 ? px >= s.ma50 : null,
				above200: s.ma200 != null && px > 0 ? px >= s.ma200 : null,
				depth: "quote",
				thin,
				...extra
			};
		});
		const nPriced = rows.filter((r) => r.price > 0).length;
		const patched = await withCachedFunds(rows);
		if (nPriced > 0) screenCache.set("uni-v10", {
			at: Date.now(),
			data: patched
		});
		return patched;
	})().finally(() => {
		uniInflight = null;
	});
	return uniInflight;
}
var MARKET_KEYS = [
	"ret1m",
	"ret3m",
	"ret1y",
	"offHigh",
	"rsi",
	"vol",
	"volAvg",
	"volRatio",
	"vcp",
	"vcpBreak",
	"vcpN",
	"vcpLastPct",
	"vcpDays",
	"vcpVolX",
	"vcpPivot",
	"above50",
	"above200"
];
/** Keep a freshly calculated row on the in-memory screener so the next load is not quote-only. */
function rememberScreenRow(row) {
	for (const key of ["uni-v10", "deep-v9"]) {
		const hit = screenCache.get(key);
		if (!hit) continue;
		const i = hit.data.findIndex((r) => r.symbol === row.symbol);
		if (i < 0) {
			hit.data.push(row);
			continue;
		}
		const next = { ...hit.data[i] };
		for (const k of MARKET_KEYS) {
			const v = row[k];
			if (v != null) next[k] = v;
		}
		if (row.depth === "full") next.depth = "full";
		hit.data[i] = next;
	}
}
async function fetchScreenerOne(symbol) {
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	if (!bare) return null;
	try {
		const [pack, fund] = await Promise.all([fetchOhlc(bare, "2y", "1d"), fetchFundamentals(bare).catch(() => null)]);
		if (!pack.missing && pack.price > 0) {
			const row = toRow(pack, bare, fund);
			rememberScreenRow(row);
			return row;
		}
		const q = (await fetchQuotes([bare]).catch(() => [])).find((x) => x.price > 0);
		if (!q) return null;
		return {
			...emptyRow({
				symbol: bare,
				name: q.name || universeName(bare)
			}),
			price: q.price,
			changePct: q.changePct,
			high52: q.high52,
			low52: q.low52,
			offHigh: q.high52 && q.price ? (q.price / q.high52 - 1) * 100 : null,
			...fundFields(fund),
			name: q.name || universeName(bare),
			sector: sectorOf(bare, fund?.industry),
			depth: "quote"
		};
	} catch {
		return null;
	}
}
function snapshotStats(pack) {
	const bars = pack.bars;
	const closes = bars.map((b) => b.c);
	const ma20 = sma(closes, 20);
	const ma50 = sma(closes, 50);
	const ma200 = sma(closes, 200);
	const last = (a) => [...a].reverse().find((x) => x != null) ?? null;
	const px = pack.price || bars.at(-1)?.c || 0;
	return {
		ret1w: retFrom(bars, 7),
		ret1m: retFrom(bars, 31),
		ret3m: retFrom(bars, 93),
		ret6m: retFrom(bars, 186),
		ret1y: retFrom(bars, 365),
		rsi: lastRsi(bars),
		ma20: last(ma20),
		ma50: last(ma50),
		ma200: last(ma200),
		volAvg: volAvg(bars, 20),
		offHigh: pack.high52 && px ? (px / pack.high52 - 1) * 100 : null,
		offLow: pack.low52 && px ? (px / pack.low52 - 1) * 100 : null
	};
}
var CARDS = {
	RELIANCE: {
		what: "Reliance Industries is India’s largest listed company, built by Dhirubhai Ambani and run by Mukesh Ambani. The group sits across energy, petrochemicals, retail and digital. Jio and Reliance Retail are the consumer engines; the Jamnagar refining and chemical complex still prints most of the cash. Investors treat it as a conglomerate: one ticker, several cycles.",
		products: "Fuels and petrochemicals from Jamnagar; Jio mobile, fibre and digital ads; Reliance Retail grocery, fashion and electronics; a growing new-energy book (solar, batteries, green hydrogen).",
		makes: "Refining cracks and petrochem spreads still fund the dividend. Jio earns on ARPU × subscribers. Retail earns on store throughput and private-label mix. New energy is still a capex story.",
		cycle: "Oil cracks and the rupee move the old businesses. Jio is about tariff hikes, capex and 5G payback. Retail follows urban consumption. Group capex is the long option.",
		watch: [
			"Singapore GRM / refining cracks",
			"Jio ARPU and net adds",
			"Retail like-for-like growth",
			"New-energy capex versus O2C cash"
		]
	},
	TCS: {
		what: "Tata Consultancy Services is India’s largest IT services firm and the cash engine of the Tata group. It runs software, cloud and operations for global banks, retailers and manufacturers — billed in dollars, delivered from India. A long client book and a fortress balance sheet are the franchise.",
		products: "Application development, cloud migration, consulting and operations. Banking is the largest vertical; retail and manufacturing sit next.",
		makes: "Time-and-material plus fixed-price contracts. Utilisation × rate × headcount is the P&L. Deal TCV and attrition tell you the next four quarters.",
		cycle: "US and Europe IT budgets, visa costs, and the dollar-rupee. Discretionary digital projects slow first in a US recession.",
		watch: [
			"Large-deal TCV and book-to-bill",
			"Utilisation and attrition",
			"BFSI spend in the US",
			"Constant-currency growth guidance"
		]
	},
	INFY: {
		what: "Infosys is a large-cap IT services firm, similar mix to TCS but a bit more digital and cloud in the pitch. Bangalore-based, listed in India and New York. A clean balance sheet and a buyback habit. Slightly more cyclical than TCS when US financials cut spend.",
		products: "Outsourcing, consulting and cloud transformation. Financial services is a large vertical.",
		makes: "Dollar contracts, India delivery. Large-deal TCV plus utilisation and offshoring.",
		cycle: "US financials spend, utilisation, wage inflation, and the rupee.",
		watch: [
			"Guidance and large-deal TCV",
			"Financial-services vertical",
			"Utilisation and attrition",
			"Buyback / capital return"
		]
	},
	HDFCBANK: {
		what: "HDFC Bank is India’s largest private bank by most measures — a retail deposit franchise with mortgages, cards and a huge liability book. The 2023 merger with HDFC Ltd is still being digested: loan mix, CD ratio and a hangover in the mortgage engine. It is the default quality bank name in domestic portfolios.",
		products: "Savings and current accounts, home loans, auto and personal loans, credit cards, wholesale credit, plus life, AMC and securities subsidiaries.",
		makes: "Net interest margin on loans minus deposits, plus fees on cards and third-party products. Credit costs are the swing.",
		cycle: "Credit growth versus deposit costs. NIM and slippages are what to watch. Merger integration is the 2024–26 story.",
		watch: [
			"Deposit growth vs loan growth",
			"NIM and CASA mix",
			"Slippages and credit cost",
			"Mortgage origination after the merger"
		]
	},
	ICICIBANK: {
		what: "ICICI Bank is the second large private bank. Retail plus corporate, with a cleaner book than a decade ago and a stack of listed subsidiaries (life, general, securities, AMC). The re-rating has been about asset quality, not just growth.",
		products: "Retail and corporate loans, deposits, cards, and a full insurance and asset-management stack.",
		makes: "Spread on loans, fees, and the value of subsidiaries. Credit costs used to dominate; they have been quieter this cycle.",
		cycle: "Credit cycle and deposit competition with HDFC and SBI. Asset quality is the re-rating.",
		watch: [
			"Credit cost and GNPA",
			"Deposit franchise vs HDFC",
			"NIM",
			"Subsidiary valuations"
		]
	},
	SBIN: {
		what: "State Bank of India is the public-sector giant. Every large PSU flow and a huge retail deposit base. Beta to the economy is high; the treasury book makes it a bond-yield name as well as a credit name.",
		products: "Retail and corporate loans, government business, treasury, cards, and a clutch of subsidiaries (life, cards, mutual fund).",
		makes: "Interest income on a massive loan book. Treasury and government business on the side.",
		cycle: "Bond yields (treasury), credit growth, and PSU recap politics.",
		watch: [
			"Credit growth vs PSU peers",
			"Treasury / bond yields",
			"Slippages in SME and agri",
			"Dividend"
		]
	},
	BHARTIARTL: {
		what: "Bharti Airtel is India’s second mobile operator, with home broadband and enterprise on the side, and Africa sitting in a listed subsidiary. After the Jio shock it re-rated on tariff hikes, coverage and a cleaner AGR leftover. It is the quality telco versus Vodafone Idea.",
		products: "Mobile (prepaid and postpaid), home fibre, enterprise connectivity, digital TV, and Airtel Payments Bank.",
		makes: "ARPU × subscribers. Tower and spectrum capex is the tax on growth. Homes and enterprise are the mix upgrade.",
		cycle: "Tariff hikes versus Jio. Capex intensity and AGR leftovers. A tariff cycle can re-rate the whole name.",
		watch: [
			"India mobile ARPU and tariff actions",
			"4G/5G mix",
			"Capex to sales",
			"Homes and enterprise growth"
		]
	},
	ITC: {
		what: "ITC is still a cigarette company that happens to own FMCG, hotels, paper and agri. Cigarettes print the cash; everything else is the attempt to re-rate the multiple. Hotels have been the surprise of this cycle. A defensive cash compounder with a fading government overhang.",
		products: "Cigarettes (Gold Flake, Classic), FMCG (Aashirvaad, Sunfeast, Bingo), hotels, paperboards, and agri commodities.",
		makes: "High-margin tobacco in India funds the rest. FMCG is volume × price on branded staples. Hotels follow occupancy.",
		cycle: "Excise and illicit cigarettes. Rural demand for FMCG. Occupancy for hotels. Any tax shock is the left tail.",
		watch: [
			"Cigarette volumes and net realisations",
			"FMCG EBIT margin",
			"Hotel occupancy",
			"Excise / illicit channel"
		]
	},
	HINDUNILVR: {
		what: "Hindustan Unilever is soaps, detergents, tea and ice cream — the urban and rural pantry. A Unilever subsidiary and the quality defensive of Indian FMCG. Premiumisation versus rural recovery is the perpetual debate.",
		products: "Surf, Wheel, Dove, Lifebuoy, Clinic Plus, Brooke Bond, Kwality Wall’s, and a long tail of homecare and personal care.",
		makes: "Volume × price on branded staples. Advertising is the reinvestment. Gross margin tracks palmolein and crude.",
		cycle: "Rural recovery, palmolein/crude input costs, and premiumisation. Defensive when risk is off.",
		watch: [
			"Rural versus urban volume",
			"Gross margin / palmolein",
			"Premium mix",
			"Advertising to sales"
		]
	},
	LT: {
		what: "Larsen & Toubro is engineering and construction, plus IT (LTIMindtree) and a finance arm. India’s infra proxy: order book in, revenue out, with a services overlay.",
		products: "Infra, hydrocarbons, defence, power, and heavy engineering. LTIMindtree is the IT listco; L&T Finance is the NBFC.",
		makes: "Order book converted into revenue. Services on the side. Execution and working capital are the craft.",
		cycle: "Government capex, private capex, and execution. Order inflows lead the stock by months.",
		watch: [
			"Order inflows and book-to-bill",
			"Core E&C margin",
			"Working capital",
			"LTIMindtree and finance"
		]
	},
	MARUTI: {
		what: "Maruti Suzuki is India’s volume car leader, still Suzuki-controlled. The mix is shifting up-market through Nexa, while the small-car heartland is slower. A high-quality auto franchise with a distribution moat.",
		products: "Alto to Brezza to Grand Vitara; Nexa premium; CNG mix; a large service and spare-parts annuity.",
		makes: "Small and mid cars, plus Nexa. Mix and realisations have mattered more than volume this cycle.",
		cycle: "Rural and first-time buyers, commodity costs, and pressure from Tata, Mahindra and Hyundai.",
		watch: [
			"Mix (Nexa / SUV / CNG)",
			"Wholesale vs retail",
			"Discounts",
			"Rural demand"
		]
	},
	"M&M": {
		what: "Mahindra & Mahindra is SUVs, tractors, and a farm-equipment franchise. Auto margins have been the surprise of this cycle; tractors are the monsoon business.",
		products: "XUV and Scorpio SUVs, Bolero, tractors, farm equipment, and a long list of subsidiaries.",
		makes: "XUV and Scorpio sales plus tractor volumes. Auto margins have carried the last few years.",
		cycle: "Monsoon and farm cash for tractors. SUV fashion and waitlists for auto.",
		watch: [
			"SUV waitlists and mix",
			"Tractor volumes vs monsoon",
			"Auto margin",
			"EV pipeline"
		]
	},
	TATAMOTORS: {
		what: "Tata Motors is India commercial vehicles and passenger cars, plus Jaguar Land Rover. JLR still dominates profit. India PV is the share-gain story versus Maruti; CV is cyclical.",
		products: "JLR (Range Rover, Defender, Jaguar), India Nexon/Punch/Harrier, and commercial vehicles.",
		makes: "JLR cash, India PV mix, and CV replacement cycles.",
		cycle: "Europe/China JLR demand, commodity costs, and India CV replacement.",
		watch: [
			"JLR wholesales and China",
			"India PV share",
			"CV cycle",
			"EV mix (Nexon EV, JLR)"
		]
	},
	SUNPHARMA: {
		what: "Sun Pharma is India’s largest drug maker — India branded, US generics, and specialty (Ilumya and others). India chronic is the ballast; US specialty is the upside.",
		products: "Chronic therapies in India, US specialty dermatology, and a grind of US generics.",
		makes: "India branded plus US specialty. Generics are the volume grind.",
		cycle: "US FDA, price erosion, and specialty launches.",
		watch: [
			"Specialty sales (Ilumya etc.)",
			"US FDA / plant status",
			"India chronic growth",
			"Gross margin"
		]
	},
	AXISBANK: {
		what: "Axis Bank is a private lender, historically wholesale-heavy, now more retail. A catch-up story versus HDFC and ICICI.",
		products: "Retail and corporate loans, deposits, cards, and a smaller subsidiary stack.",
		makes: "NIM on a mixed loan book, plus fees.",
		cycle: "Credit costs and the deposit franchise.",
		watch: [
			"Deposit growth",
			"Credit cost",
			"Retail mix",
			"CASA"
		]
	},
	KOTAKBANK: {
		what: "Kotak Mahindra Bank is a conservative private bank with a strong liability franchise and a large promoter. Wealth, brokerage and AMC sit around the bank.",
		products: "Loans, deposits, wealth, brokerage, AMC.",
		makes: "Spread plus the financial-services ecosystem.",
		cycle: "Growth versus conservatism. Leadership change and RBI restrictions have been stock events.",
		watch: [
			"Loan growth vs peers",
			"RBI / governance headlines",
			"CASA",
			"Wealth and AMC"
		]
	},
	BAJFINANCE: {
		what: "Bajaj Finance is the large-cap consumer NBFC — EMIs, cards, and consumer durables. High beta to risk appetite.",
		products: "Consumer durable loans, personal loans, cards, SME, and two-wheeler finance.",
		makes: "Spread on a granular loan book. Fees and cross-sell into the Bajaj ecosystem.",
		cycle: "Credit costs, funding costs, and RBI tightening on consumer credit.",
		watch: [
			"AUM growth",
			"Credit cost",
			"Funding cost / NIM",
			"RBI actions on consumer credit"
		]
	},
	BAJAJFINSV: {
		what: "Bajaj Finserv is the holding company for Bajaj Finance, Bajaj Allianz life/general, and health. Not an operating lender itself.",
		products: "A listed claim on Bajaj Finance plus insurance.",
		makes: "Value of the finance and insurance stack.",
		cycle: "Tracks Bajaj Finance plus insurance underwriting. Holding-company discount waxes and wanes.",
		watch: [
			"Bajaj Finance print",
			"Insurance VNB / combined ratio",
			"Holdco discount"
		]
	},
	NESTLEIND: {
		what: "Nestlé India is Maggi, coffee, baby food and dairy. A premium urban FMCG franchise with a Swiss parent.",
		products: "Maggi, Nescafé, Cerelac, KitKat, milk products.",
		makes: "Branded packaged food with high margins.",
		cycle: "Input costs (milk, coffee, wheat) and urban consumption. Very defensive.",
		watch: [
			"Volume growth",
			"Gross margin",
			"Rural recovery",
			"New launches"
		]
	},
	TITAN: {
		what: "Titan is jewellery (Tanishq), watches and eyewear. Tata-owned. Gold jewellery studded with design and trust.",
		products: "Tanishq jewellery, Titan watches, eyewear, and a growing international push.",
		makes: "Gold jewellery is the P&L. Watches and eyewear are smaller.",
		cycle: "Gold price, wedding season, and discretionary urban spend. Inventory is gold.",
		watch: [
			"Jewellery growth vs gold price",
			"Wedding season",
			"Studded mix",
			"Inventory days"
		]
	},
	ULTRACEMCO: {
		what: "UltraTech is India’s largest cement company, Aditya Birla group. Housing and infra in one name.",
		products: "Grey and white cement, ready-mix, building products.",
		makes: "Cement volumes × realisation minus energy and freight.",
		cycle: "Housing and infra demand, petcoke/coal, and industry utilisation.",
		watch: [
			"Realisations vs costs",
			"Capacity utilisation",
			"Energy costs",
			"Industry pricing discipline"
		]
	},
	ASIANPAINT: {
		what: "Asian Paints is the decorative paint leader, with a long distribution moat. A quality compounder that can de-rate on growth.",
		products: "Decorative paints, waterproofing, interiors, and a smaller industrial book.",
		makes: "Paint volumes in housing and repaint. Mix and tinting machines are the moat.",
		cycle: "Crude/TiO2 costs, housing, and new competition (Birla, JSW).",
		watch: [
			"Volume growth",
			"Gross margin",
			"New competitor share",
			"Repaint vs new housing"
		]
	},
	WIPRO: {
		what: "Wipro is IT services, historically more mixed than TCS/Infosys, still a top-tier outsourcer.",
		products: "IT contracts, consulting and cloud, mostly global.",
		makes: "Same services P&L — utilisation, rates, large deals.",
		cycle: "US spend, utilisation, large-deal TCV.",
		watch: [
			"Large-deal TCV",
			"Guidance",
			"Utilisation",
			"BFSI / consumer verticals"
		]
	},
	HCLTECH: {
		what: "HCLTech is IT services with a heavier infrastructure-management mix. Infra/cloud run-rate is stickier than discretionary digital.",
		products: "Outsourcing and engineering services. A bit less pure-play consulting than the others.",
		makes: "IT services with a stickier infra book.",
		cycle: "IT budget cycle. Infra is the ballast.",
		watch: [
			"Infra/cloud run-rate",
			"Deal TCV",
			"Utilisation",
			"Engineering services"
		]
	},
	TECHM: {
		what: "Tech Mahindra is IT services with a telecom-heavy heritage (Mahindra + BT roots). Turnaround has been the 2024–26 plot.",
		products: "Telecom, manufacturing and enterprise IT.",
		makes: "IT contracts. Execution on the turnaround is the story.",
		cycle: "Telco capex plus the usual IT cycle.",
		watch: [
			"Turnaround margins",
			"Telecom vertical",
			"Deal wins",
			"Attrition"
		]
	},
	NTPC: {
		what: "NTPC is India’s largest power generator — coal still, plus a renewables push. A defensive yield name.",
		products: "Thermal generation, a growing renewable book, and some trading.",
		makes: "Regulated returns on generation capacity. Merchant power on the margin.",
		cycle: "Coal availability, PLF, and CERC tariffs.",
		watch: [
			"PLF and coal stock",
			"Renewable capacity adds",
			"Regulated equity / RoE",
			"Dividend"
		]
	},
	POWERGRID: {
		what: "Power Grid is the inter-state transmission utility. The toll-road of electrons. Bond-proxy with some growth.",
		products: "Inter-state transmission assets, a regulated return.",
		makes: "Regulated return on transmission. Predictable cash.",
		cycle: "Capex pipeline and tariff orders.",
		watch: [
			"Capex / capitalisation",
			"Tariff orders",
			"Dividend",
			"Project pipeline"
		]
	},
	ONGC: {
		what: "ONGC is the national oil company. Upstream crude and gas, plus stakes in refiners. High operating leverage to oil.",
		products: "Crude and gas, plus HPCL and other downstream stakes.",
		makes: "Barrels × (realisation − cost). Subsidies and windfall taxes have clipped upside.",
		cycle: "Brent, gas prices, and government take.",
		watch: [
			"Brent",
			"Gas price formula",
			"Windfall tax",
			"Production volumes"
		]
	},
	COALINDIA: {
		what: "Coal India is the near-monopoly miner of thermal coal for Indian power. A cash-yield name.",
		products: "Thermal coal under FSA and e-auction.",
		makes: "Tonnes × e-auction/FSA realisations. Dividends are the product.",
		cycle: "Power demand, imported-coal prices, and wage boards.",
		watch: [
			"Offtake vs production",
			"E-auction premium",
			"Wage board",
			"Dividend"
		]
	},
	TATASTEEL: {
		what: "Tata Steel is India plus Europe steel. India is the cash cow; Europe is the swing. Deeply cyclical.",
		products: "Flat and long steel in India; European strip.",
		makes: "Steel spreads (HRC minus iron ore/coking coal). Europe has been a drag for years.",
		cycle: "China steel, European demand, and raw materials.",
		watch: [
			"India spreads",
			"Europe EBITDA",
			"Coking coal",
			"Net debt"
		]
	},
	JSWSTEEL: {
		what: "JSW Steel is India-focused steel, more domestic than Tata Steel. Capacity expansion has been the story.",
		products: "Flat and long steel.",
		makes: "Steel spreads into domestic construction and auto.",
		cycle: "Domestic construction and auto, iron ore, and coking coal.",
		watch: [
			"Domestic realisations",
			"Capacity utilisation",
			"Coking coal",
			"Volume growth"
		]
	},
	HINDALCO: {
		what: "Hindalco is aluminium in India plus Novelis (aluminium rolling) globally. Aditya Birla. Novelis is the quality bit.",
		products: "Aluminium and copper in India; beverage-can sheet at Novelis.",
		makes: "LME aluminium plus US can sheet.",
		cycle: "LME aluminium, US can sheet, and energy costs.",
		watch: [
			"LME aluminium",
			"Novelis shipments",
			"India energy costs",
			"US can-sheet spreads"
		]
	},
	ADANIENT: {
		what: "Adani Enterprises is the incubator for the Adani group — energy, airports, green, and new bets. Cash is lumpy; narrative is growth.",
		products: "Projects that later get listed or funded. Airports, green, and incubations.",
		makes: "Project development. Funding costs matter as much as operations.",
		cycle: "Group funding costs, project execution, and risk appetite for Adani names.",
		watch: [
			"Group credit spreads",
			"Project announcements",
			"Promoter pledge",
			"Incubation pipeline"
		]
	},
	ADANIPORTS: {
		what: "Adani Ports is the largest private port operator, plus logistics. EXIM trade in one name.",
		products: "Mundra and other ports, plus logistics parks.",
		makes: "Cargo volumes × realisation. Logistics on the side.",
		cycle: "EXIM trade, China/West Asia routes, and group sentiment.",
		watch: [
			"Cargo volumes",
			"Realisation per tonne",
			"New ports",
			"Group sentiment"
		]
	},
	BEL: {
		what: "Bharat Electronics is a defence PSU — radars, electronics, missile electronics. A multi-year capex story.",
		products: "Radars, communication, electronic warfare, missile electronics.",
		makes: "Order book from MoD and exports. High visibility once orders land.",
		cycle: "Defence budgets and order announcements.",
		watch: [
			"Order inflows",
			"Execution / revenue conversion",
			"Export orders",
			"Margin"
		]
	},
	CIPLA: {
		what: "Cipla is generics and respiratory (inhalers) — India, South Africa, US. Respiratory is the moat.",
		products: "Branded generics in emerging markets plus US respiratory.",
		makes: "US price erosion vs India chronic. Respiratory franchise is the ballast.",
		cycle: "US FDA and India chronic.",
		watch: [
			"US respiratory",
			"India branded growth",
			"US FDA",
			"South Africa"
		]
	},
	DRREDDY: {
		what: "Dr Reddy’s is generics with a US/India/Russia mix and a biologics push. Complex generics are the upside.",
		products: "US generics, India branded, API, biologics.",
		makes: "US generics plus India chronic.",
		cycle: "USFDA, gRevlimid-type cliffs, and India chronic.",
		watch: [
			"US launches",
			"India branded",
			"USFDA",
			"Biologics pipeline"
		]
	},
	APOLLOHOSP: {
		what: "Apollo Hospitals is a hospital chain plus diagnostics and a digital (24/7) layer. A compounder if execution holds.",
		products: "Hospitals, pharmacy, diagnostics, Apollo 24/7.",
		makes: "ARPOB × occupied beds. Pharmacy and diagnostics on the side.",
		cycle: "Elective surgeries, insurance mix, and new-hospital gestation.",
		watch: [
			"ARPOB and occupancy",
			"New-bed gestation",
			"Insurance mix",
			"Diagnostics"
		]
	},
	GRASIM: {
		what: "Grasim is Aditya Birla holding/operating mix — viscose, chemicals, plus UltraTech and financials stakes.",
		products: "VSF and chemicals at the opco; listed subsidiaries do the rest.",
		makes: "VSF and chemicals; a lot of value is in listed subsidiaries.",
		cycle: "VSF spreads and holding-company discount. Cement via UltraTech.",
		watch: [
			"VSF spreads",
			"Holdco discount",
			"UltraTech",
			"Chemicals"
		]
	},
	HDFCLIFE: {
		what: "HDFC Life is a private life insurer, bank-assurance with HDFC Bank as the engine. Rate-sensitive.",
		products: "Protection, savings, ULIPs.",
		makes: "VNB from new business. Float invested in bonds/equity.",
		cycle: "Bancassurance volumes, bond yields, persistency.",
		watch: [
			"VNB margin",
			"APE growth",
			"Persistency",
			"Bancassurance with HDFC Bank"
		]
	},
	SBILIFE: {
		what: "SBI Life is a life insurer with SBI’s branch machine as the distribution. A quality insurer.",
		products: "Protection, savings, ULIPs, sold through SBI branches and agency.",
		makes: "Same life-insurance economics — VNB, persistency, investment surplus.",
		cycle: "SBI branch productivity and mix (protection vs ULIP).",
		watch: [
			"VNB",
			"Protection mix",
			"SBI branch productivity",
			"Persistency"
		]
	},
	HEROMOTOCO: {
		what: "Hero MotoCorp is two-wheelers, still rural- and commuter-heavy. EV is the open question.",
		products: "100–125cc commuter motorcycles, a premium push, and EV experiments.",
		makes: "Heartland motorcycles. Mix is the upgrade path.",
		cycle: "Rural cash, monsoon, and Honda/TVS/Bajaj. EV is unresolved.",
		watch: [
			"Rural volumes",
			"Premium mix",
			"EV (Vida)",
			"Market share vs Honda"
		]
	},
	EICHERMOT: {
		what: "Eicher Motors is Royal Enfield motorcycles plus VECV (trucks with Volvo). A quality auto name.",
		products: "Royal Enfield (Classic, Hunter, Himalayan) and Volvo-Eicher commercial vehicles.",
		makes: "High-margin Enfield in India and exports. CV is cyclical.",
		cycle: "Premium two-wheeler fashion and exports.",
		watch: [
			"Enfield volumes and mix",
			"Exports",
			"VECV cycle",
			"New platforms"
		]
	},
	INDUSINDBK: {
		what: "IndusInd Bank is a private bank with a vehicle-finance heritage and a bumpier book. Higher beta than HDFC/ICICI.",
		products: "Retail, corporate, microfinance, vehicle finance.",
		makes: "NIM on a mixed book. Microfinance and CV have been swing factors.",
		cycle: "Asset quality events move this more than the large private banks.",
		watch: [
			"Asset quality headlines",
			"Deposit franchise",
			"Microfinance / CV",
			"Promoter / governance"
		]
	},
	JIOFIN: {
		what: "Jio Financial is Reliance’s financial-services listco — still being built out. Today it trades as an option on Reliance plus finance.",
		products: "Nascent lending, insurance distribution, a large cash/investment book from the demerger.",
		makes: "Not yet a real lender at scale. The option is execution.",
		cycle: "Execution on becoming a lender. Reliance group flows.",
		watch: [
			"Loan book build",
			"Insurance partnerships",
			"Cash utilisation",
			"RBI licences"
		]
	},
	TRENT: {
		what: "Trent is Tata retail — Westside, Zudio, and a fast fashion/value push. Zudio has been the rocket. High valuation, high expectations.",
		products: "Westside, Zudio, and other Tata retail formats.",
		makes: "Same-store growth and new stores. Zudio is the growth engine.",
		cycle: "Discretionary consumption and store expansion.",
		watch: [
			"Zudio store adds",
			"Westside like-for-like",
			"Valuation vs growth",
			"Inventory"
		]
	},
	TATACONSUM: {
		what: "Tata Consumer is tea, coffee, salt and packaged foods. Tata’s FMCG listco. Defensive-ish.",
		products: "Tata Tea, Tetley, Tata Salt, Sampann, and acquired foods.",
		makes: "Branded staples plus some foods. Tetley/tea is global.",
		cycle: "Tea auctions, urban FMCG, and integration of acquisitions.",
		watch: [
			"India volume",
			"Tea auction prices",
			"International Tetley",
			"Foods mix"
		]
	},
	ETERNAL: {
		what: "Eternal (ex Zomato) is food delivery, Blinkit quick-commerce, and going-out. Unit economics versus growth is the 2025–26 debate.",
		products: "Food delivery, Blinkit, dining-out, Hyperpure.",
		makes: "Delivery take-rate plus Blinkit’s dark-store economics. Ads on the side.",
		cycle: "Quick-commerce spend and food-delivery frequency.",
		watch: [
			"Blinkit GOV and contribution",
			"Food delivery order frequency",
			"Ads",
			"Burn vs growth"
		]
	},
	SHRIRAMFIN: {
		what: "Shriram Finance is CV, MSME and retail credit after the Shriram merger. A mid-cycle NBFC.",
		products: "Used-CV, small-business and other retail credit.",
		makes: "Spread on a used-CV and MSME book. Collection is the craft.",
		cycle: "CV cycle, funding costs, and credit costs.",
		watch: [
			"AUM growth",
			"Credit cost",
			"CV cycle",
			"Funding cost"
		]
	},
	BAJAJAUTO: {
		what: "Bajaj Auto is motorcycles and three-wheelers, heavy on exports. Triumph sits on the premium side.",
		products: "Pulsar/CT, three-wheelers, Triumph partnership, export markets.",
		makes: "Domestic mix plus Africa/LatAm exports. EV three-wheelers matter.",
		cycle: "Export markets and domestic mix.",
		watch: [
			"Export volumes",
			"Domestic mix",
			"Three-wheeler EV",
			"Margins"
		]
	},
	"BAJAJ-AUTO": {
		what: "Bajaj Auto is motorcycles and three-wheelers, heavy on exports. Triumph sits on the premium side.",
		products: "Pulsar/CT, three-wheelers, Triumph partnership, export markets.",
		makes: "Domestic mix plus Africa/LatAm exports.",
		cycle: "Export markets and domestic mix.",
		watch: [
			"Export volumes",
			"Domestic mix",
			"Three-wheeler EV",
			"Margins"
		]
	},
	DMART: {
		what: "Avenue Supermarts (DMart) is value retail — EDLP grocery and general merchandise. Thin margin, high turns. A quality retailer that de-rates if growth slips.",
		products: "Owned grocery and general-merchandise stores, cluster density.",
		makes: "Thin margin, high turns. Cluster fill is the craft.",
		cycle: "Same-store growth and new-store gestation.",
		watch: [
			"Like-for-like growth",
			"New-store adds",
			"Gross margin",
			"Inventory turns"
		]
	},
	PIDILITIND: {
		what: "Pidilite is Fevicol and construction chemicals. A brand moat in adhesives. A classic compounder.",
		products: "Fevicol, M-Seal, Dr. Fixit, and construction chemicals.",
		makes: "Adhesives and sealants into retail and projects.",
		cycle: "Housing/renovation and rural.",
		watch: [
			"Volume growth",
			"Gross margin",
			"Waterproofing",
			"Rural"
		]
	},
	GODREJCP: {
		what: "Godrej Consumer is soaps, hair colour, household insecticides (Goodknight), and overseas (Indonesia, Africa).",
		products: "Cinthol, Goodknight, HIT, hair colour, plus Indonesia/Africa.",
		makes: "India homecare plus international.",
		cycle: "Rural FMCG and currency in overseas. Insecticide seasonality.",
		watch: [
			"India homecare",
			"Indonesia",
			"Currency",
			"Insecticide season"
		]
	},
	BRITANNIA: {
		what: "Britannia is biscuits and dairy. A bread-and-biscuit compounder. Defensive.",
		products: "Good Day, Bourbon, Marie, bread, dairy.",
		makes: "Volume plus mix. Dairy is the stretch.",
		cycle: "Wheat/palm costs and urban snacking.",
		watch: [
			"Volume",
			"Gross margin (wheat/palm)",
			"Mix",
			"Dairy"
		]
	},
	DABUR: {
		what: "Dabur is Ayurvedic/FMCG — digestives, hair oil, juices, oral care. Rural-tilted. A slower compounder than HUL.",
		products: "Hajmola, Vatika, Real, Dabur Honey, oral care, plus international (MENA, Nepal).",
		makes: "Rural-tilted branded Ayurveda plus overseas.",
		cycle: "Rural recovery and honey/HPC inputs.",
		watch: [
			"Rural volume",
			"Healthcare vs HPC mix",
			"International",
			"Input costs"
		]
	},
	DIVISLAB: {
		what: "Divi’s Laboratories is large-scale API and custom synthesis for global pharma. Operating leverage is high. A quality chemical-pharma.",
		products: "Generic APIs plus custom manufacturing (CS).",
		makes: "API tonnes and CS contracts. Utilisation is the swing.",
		cycle: "US/EU generic API, GLP-1 adjacent talk, and utilisation.",
		watch: [
			"Utilisation",
			"CS pipeline",
			"Generic API prices",
			"US/EU demand"
		]
	},
	LUPIN: {
		what: "Lupin is generics with a US/India mix and an inhalation/complex-generics push. Turnaround has been the recent plot.",
		products: "US generics, India branded, APIs, inhalation.",
		makes: "US launches plus India chronic.",
		cycle: "USFDA and complex launches.",
		watch: [
			"US complex launches",
			"India branded",
			"USFDA",
			"Margins"
		]
	},
	AUROPHARMA: {
		what: "Aurobindo is high-volume generics and injectables, US-heavy. A workhorse generic.",
		products: "US generics, Europe, India, injectables, API.",
		makes: "US generics plus vertical integration into API.",
		cycle: "US price erosion and plant inspections.",
		watch: [
			"US price erosion",
			"Injectables",
			"Plant inspections",
			"Europe"
		]
	},
	TVSMOTOR: {
		what: "TVS Motor is two-wheelers, scooters and Norton. A strong execution story this cycle. EV (iQube) is live.",
		products: "Jupiter/Ntorq scooters, motorcycles, iQube EV, Norton.",
		makes: "Scooters plus a rising premium mix.",
		cycle: "Domestic two-wheeler and exports.",
		watch: [
			"Scooter share",
			"iQube",
			"Premium mix",
			"Exports"
		]
	},
	IRFC: {
		what: "IRFC finances Indian Railways rolling stock. A thinly-spread NBFC on sovereign-ish paper. Not an operating railroad.",
		products: "Loans to the Railways, funded by bonds.",
		makes: "Spread on Railway loans. Bond-like.",
		cycle: "Bond yields and railway capex.",
		watch: [
			"Bond yields",
			"Disbursements",
			"Spread",
			"Railway capex"
		]
	},
	PFC: {
		what: "Power Finance Corporation is a PSU lender to power projects, plus REC as a subsidiary. Yield plus growth.",
		products: "Loans to generation, transmission, and now infra.",
		makes: "Spread on a power-sector loan book.",
		cycle: "Power capex, asset quality, and PSU multiples.",
		watch: [
			"Sanctions / disbursements",
			"Asset quality",
			"NIM",
			"REC"
		]
	},
	RECLTD: {
		what: "REC is similar to PFC — power and now infra financing, PSU. Often trades as a pair with PFC.",
		products: "Power and infra loans.",
		makes: "Interest income on power/infra loans.",
		cycle: "Same as PFC.",
		watch: [
			"Disbursements",
			"Asset quality",
			"NIM",
			"Infra mix"
		]
	},
	LICI: {
		what: "Life Insurance Corporation is the giant. Agency army plus every PSU distribution. IPO overhang is fading.",
		products: "Life insurance across every Indian household segment.",
		makes: "VNB on a huge in-force book. Investment surplus on a mountain of assets.",
		cycle: "Bancassurance vs agency, equity markets (investment book), and IPO overhang fading.",
		watch: [
			"VNB",
			"Market share vs private",
			"Persistency",
			"Investment book"
		]
	},
	MAXHEALTH: {
		what: "Max Healthcare is a hospital chain, Delhi-NCR heavy, expanding. Hospital compounder set.",
		products: "Hospitals, brownfield expansion.",
		makes: "ARPOB × occupancy.",
		cycle: "Elective mix and new-bed gestation.",
		watch: [
			"ARPOB",
			"Occupancy",
			"New beds",
			"Payor mix"
		]
	},
	POLYCAB: {
		what: "Polycab is wires and cables, plus FMEG (fans, lights). A B2B + retail mix. Operating leverage on volume.",
		products: "Copper/aluminium cables, fans, lights, switches.",
		makes: "Cables into real estate, infra and industry. FMEG is the mix.",
		cycle: "Housing/infra capex and copper prices.",
		watch: [
			"Cable volume",
			"FMEG growth",
			"Copper",
			"Margins"
		]
	},
	DIXON: {
		what: "Dixon Technologies is electronics manufacturing (EMS) — mobiles, TVs, lighting for brands. PLI-led. Low margin, high growth.",
		products: "Mobile assembly, TVs, lighting, wearables — conversion for brands.",
		makes: "Conversion fees on PLI-led manufacturing. Client concentration is the risk.",
		cycle: "PLI, smartphone assembly, and client concentration.",
		watch: [
			"Mobile volumes",
			"Client mix",
			"PLI",
			"Working capital"
		]
	},
	PERSISTENT: {
		what: "Persistent Systems is mid-cap IT, product engineering and Salesforce/IBM-ish alliances. Mid-cap IT beta.",
		products: "Software services with a higher product-engineering mix.",
		makes: "IT services, US tech spend.",
		cycle: "US tech spend.",
		watch: [
			"Revenue growth",
			"Deal wins",
			"Utilisation",
			"Salesforce / IBM alliances"
		]
	},
	COFORGE: {
		what: "Coforge is mid-cap IT, travel and BFS-heavy, plus a deal engine. Large-deal TCV has been the narrative.",
		products: "IT services, travel and BFS verticals.",
		makes: "IT services. Large-deal TCV.",
		cycle: "Travel vertical and US financials.",
		watch: [
			"TCV",
			"Travel vertical",
			"Margins",
			"Organic growth"
		]
	},
	LTIM: {
		what: "LTIMindtree is L&T’s IT company after the Mindtree merger. Integration is largely done; growth vs TCS/Infosys is the debate.",
		products: "IT services with a manufacturing/BFSI mix.",
		makes: "IT services. Parent is L&T.",
		cycle: "Same IT cycle.",
		watch: [
			"Growth vs TCS/Infosys",
			"Deal TCV",
			"Utilisation",
			"Manufacturing vertical"
		]
	},
	GOLD: {
		what: "Gold on the Indian market, quoted as MCX ₹ per 10 grams. A hedge and a jewellery input. Not a company.",
		products: "Bullion. Holdings are in grams; the live print is the MCX 10g contract.",
		makes: "A hedge. Jewellery demand is seasonal.",
		cycle: "Real rates, dollar, and rupee. Wedding demand is seasonal.",
		watch: [
			"Real rates",
			"Dollar / rupee",
			"Wedding season",
			"ETF flows"
		]
	},
	SILVER: {
		what: "Silver on the Indian market, quoted as MCX ₹ per kilogram. Industrial (solar, electronics) plus jewellery. More volatile than gold.",
		products: "Bullion. Holdings are in grams; the live print is the MCX kg contract.",
		makes: "Industrial demand plus jewellery.",
		cycle: "Industrial demand and the gold ratio. High beta bullion.",
		watch: [
			"Gold-silver ratio",
			"Solar / industrial demand",
			"Dollar",
			"ETF flows"
		]
	}
};
function businessOf(symbol) {
	return CARDS[String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "")] || null;
}
function businessView(symbol, extra) {
	const c = businessOf(symbol);
	const summary = (extra?.summary || "").trim();
	const facts = {
		industry: (extra?.industry || "").trim(),
		ceo: (extra?.ceo || "").trim(),
		founded: (extra?.founded || "").trim(),
		website: (extra?.website || "").trim()
	};
	if (c) return {
		about: c.what,
		products: c.products || "",
		makes: c.makes,
		cycle: c.cycle,
		watch: c.watch || [],
		known: true,
		...facts
	};
	return {
		about: summary.length >= 40 ? summary : "",
		products: "",
		makes: "",
		cycle: "",
		watch: [],
		known: false,
		...facts
	};
}
var fund_skill_default = "---\nname: equity-fundamental-analysis\ndescription: High-signal multi-bagger oriented fundamental analysis of any listed company. Focuses on interconnected economics, expandable moat, growth runway, capital allocation, management guidance credibility, forward-looking metrics and risk asymmetry. Trigger on stock analysis, fundamental deep dive, company research, equity thesis, multi-bagger potential, buy sell verdict or similar. Especially strong for NSE BSE stocks. Always use latest verified primary sources. Never invent missing data.\n---\n\n# Equity Fundamental Analysis (Multi-Bagger Lens)\n\nAct as an independent, high-signal equity fundamental analyst for realistic 3–7 year multi-bagger opportunities, especially NSE/BSE stocks. The user handles technical analysis separately. Think like an investor, not a ratio screener.\n\nOnly job is to answer:\n\nDoes this company have a realistic path to multi-fold returns over the next 3–7 years with acceptable downside risk from today's price?\n\nUse these files as the governing framework. Apply them. Do not merely summarize them.\n\n* references/data-sources.md\n* references/key-ratios.md\n* references/indian-red-flags.md\n* references/scoring-rubric.md\n\n## Critical Rules\n\n* Never invent missing data, causes, consensus, precision or certainty. If evidence is unavailable, say “Not reliably available.”\n* Be numbers-first.\n* NEVER judge major metrics independently. Read them as an interconnected system.\n* For material issues use: metric → change → drivers → driver quality → related-metric cross-check → contradiction/reinforcement → implication.\n* The conclusion must reflect combined economics, not a mechanical average of ratios.\n* Ask clarification only when company/ticker/exchange is genuinely ambiguous; otherwise proceed.\n* Keep full analyses around 600–800 words unless asked for more.\n* Favor tables and compressed evidence. Do not repeat metrics, arguments or conclusions.\n* Do not accuse fraud or manipulation without evidence.\n\n## Core Process\n\n1. Identify exact company + ticker + exchange.\n2. Load references/data-sources.md and pull the latest primary data. For small/mid-caps, apply the small/mid-cap verification rule.\n3. Load references/key-ratios.md and extract historical + forward-looking metrics. Identify the economic model first, then select sector-appropriate metrics.\n4. For NSE/BSE names, load references/indian-red-flags.md and check only material governance risks.\n5. Analyze through the interconnected multi-bagger lens.\n6. Score and verdict using references/scoring-rubric.md.\n\n## Metric Intelligence\n\nConnect chains such as:\n\n* Revenue → volume/price/mix → margins → PAT/EPS → CFO/FCF\n* ROE → ROCE → margins → asset efficiency → leverage\n* PAT → EPS → share count\n* Debt → EBITDA/EBIT → interest → CFO → ROCE\n* Capex → capacity/revenue → utilization → incremental returns\n* Valuation → growth → duration → margins → reinvestment\n\nSurface material contradictions and positive evidence convergence. Examples:\n\n* High ROE + high leverage + mediocre ROCE\n* Strong PAT + weak CFO + rising receivables\n* Low P/E + peak-cycle margins\n* Large order book + weak cash conversion\n* High historical ROCE + poor incremental returns\n\nInvestigate before judging.\n\nTest growth through volume, price, mix, market share, capacity, utilization, products, geography, acquisitions, operating leverage, margins, working capital, capex and duration. Separate organic/acquired growth and structural/temporary margin improvement. Reconcile PAT, CFO and FCF; investigate working capital rather than mechanically penalizing divergence. Distinguish existing-business returns from incremental returns on future capital. Focus on runway × reinvestment opportunity × incremental returns.\n\nIdentify the company's economic model before selecting metrics. Use sector-appropriate measures for banks, NBFCs, insurers, IT/services, manufacturing, consumer, pharma and others.\n\n## Readability for Newcomers\n\nWhenever using a sector-specific metric, unfamiliar concept or non-obvious test, add a brief 1–2 line plain-English note explaining BOTH why it is relevant here and what it tells us.\n\nExample: “Why we use NIM & GNPA: This is a bank, so lending spread and loan quality drive economics. NIM shows earning spread; GNPA shows loan stress.”\n\nDo this selectively, not for standard metrics.\n\nUse qualitative analysis only to explain/test numbers: moat, industry structure, competition, customer concentration, capacity/utilization, pricing power, management execution, guidance credibility and capital allocation. Link material qualitative points to growth, margins, capital intensity, incremental returns, cash, duration or valuation. Avoid repeating evidence.\n\n## Data Discipline\n\nFor Indian stocks prioritize company IR, annual reports, quarterly results, investor presentations, earnings calls, exchange filings and regulators. Use reputable secondary sources for historical/comparative data and media for developments.\n\nSmall/mid-caps require deeper verification: latest annual report, quarterly result, presentation, call if available, exchange/regulatory filings, independent cross-checks, promoter/shareholding, auditor comments, related parties, contingent liabilities and cash-flow quality.\n\nResolve conflicts by checking period, consolidation and definitions and preferring primary filings.\n\nPrioritize latest management guidance and credible consensus with source/date. Label guidance as management guidance and compare it with actual outcomes over ~3–4 years. If unavailable, say “Not reliably available.” Date market-sensitive valuation data.\n\nCite source + date inline for material figures.\n\n## Governance (Indian stocks)\n\nCheck only material Indian governance risks: promoter holding/trend/pledge and insider activity; related parties; auditor changes/qualifications/internal controls; accounting quality; receivables/inventory; dilution; contingent liabilities; group structure; SEBI/regulatory history; guidance credibility; promoter remuneration; customer/government concentration; capital allocation.\n\nGovernance = Clean / Watch / Concern.\n\nMaterial risks must affect relevant scores.\n\n## Valuation Integration\n\nIntegrate valuation with fundamentals. Show relevant trailing/forward P/E, EV/EBITDA, P/B or PEG where meaningful, but never judge a multiple without growth, duration, ROCE, margins, cash quality, balance sheet, cyclicality and competitive durability. Normalize cyclical earnings.\n\nAlways state “Market is pricing:” and “What must go right:”.\n\nReverse-engineer reasonable growth, margins, reinvestment, incremental returns and multiple assumptions embedded in today's price; judge margin of safety.\n\n## Output Structure — Exactly Six Blocks\n\nMake output highly scannable using compact tables, signal markers and short phrases. Avoid long prose, duplicated explanations and giant checklists.\n\nUse exactly these major signals: 🟢 Positive, 🟡 Neutral, 🔴 Negative. Section 2 may add Strong/Mixed/Weak. No other signal colors.\n\n### 1) THESIS + KEY FUNDAMENTALS\n\n* 2–3 line thesis\n* Score / stars\n* Snapshot: Growth | Moat | Returns | Cash | Governance | Valuation | Risk\n* Biggest positive / biggest constraint\n* Compact visual dashboard of ~8–12 sector-appropriate, decision-useful metrics, with period/date and source for material figures\n* Use only metrics needed to explain the economics\n\n### 2) INTEGRATED FUNDAMENTAL ANALYSIS\n\nThis is the core section.\n\n3–5 economic factors such as Growth Quality, Profitability & Returns, Cash & Working Capital, Balance Sheet & Reinvestment, Per-Share Economics.\n\nFor EACH factor, put the final signal FIRST:\n\n* “🟢 Growth Quality — Strong”\n* “🟡 Cash Quality — Mixed”\n* “🔴 Balance Sheet — Weak”\n\nThen: Key Numbers → Collective Read → Contradiction/Reinforcement → Implication.\n\nDo not repeat dashboard figures unless needed.\n\nAdd the brief newcomer-friendly “Why we use this” note when the factor uses an unfamiliar sector metric or non-obvious test.\n\n### 3) BUSINESS + COMPOUNDING ENGINE\n\n3–5 drivers in a table:\n\nDriver | Financial Evidence | Durability/Runway | Implication\n\nKeep qualitative points tied to economics.\n\n### 4) WHAT CHANGES THE STORY + VALUATION\n\nOnly material 12–36M catalysts/inflections in:\n\nCatalyst | Timing | Earnings/Economic Impact | Confidence\n\nThen valuation, “Market is pricing:” and “What must go right:”.\n\n### 5) GOVERNANCE + RISKS\n\n* Governance state (Clean / Watch / Concern)\n* Only material findings\n* Max 3 risks in: Risk | Likelihood | Thesis Impact | Monitor\n\n### 6) SCORECARD + FINAL VERDICT\n\nWeights from references/scoring-rubric.md:\n\n* Business Quality 20%\n* Growth 25%\n* Capital Allocation 15%\n* Management 15%\n* Valuation 15%\n* Risk Asymmetry 10%\n\nWeighted score to one decimal and stars per framework.\n\nThen exactly one of:\n\n* High-Conviction Multi-Bagger Candidate\n* Quality Compounder\n* Speculative Multi-Bagger\n* Fair Value Compounder\n* Limited Asymmetry\n* Avoid\n\nAfter verdict include only: The case / The weakness / What would change my view.\n\n## Scoring Discipline\n\nScore strictly. The score measures future multi-fold return potential from today's price, not popularity or business quality alone. Do not award 8+ casually.\n\nHigh-Conviction requires score ≥8.0, clear runway and good risk asymmetry.\n\nApply the scoring rubric and risk/valuation overrides in references/scoring-rubric.md.\n\nIdeal flow: numbers → integrated diagnosis → explanation → contradictions/reinforcement → business durability → valuation/expectations → decision.\n\n## When to Load References\n\n* references/data-sources.md — at the start of every analysis\n* references/key-ratios.md — when extracting and interpreting metrics\n* references/indian-red-flags.md — for every NSE/BSE company\n* references/scoring-rubric.md — before scoring and final verdict\n";
var fund_data_sources_default = "# Verified Data Sources Priority\n\nPurpose: Ensure every equity analysis is based on the latest available, verified information, with primary sources preferred wherever possible.\n\n## 1. Indian Stocks — NSE/BSE\n\nUse this priority order:\n\n### Tier 1 — Primary Sources\n\n1. Company Investor Relations website\n2. Latest Annual Report\n3. Latest quarterly results\n4. Investor presentations\n5. Earnings-call transcripts\n6. Company exchange announcements\n7. BSE filings\n8. NSE filings\n9. SEBI/regulatory filings\n\nThese should be the foundation for:\n\n* Revenue\n* EBITDA\n* PAT\n* EPS\n* Margins\n* ROCE/ROIC\n* Debt\n* Cash flow\n* Capex\n* Management guidance\n* Business segments\n* Order book\n* Capacity expansion\n* Promoter ownership\n* Related-party transactions\n* Auditor observations\n* Capital allocation\n\n### Tier 2 — High-Quality Secondary Sources\n\nUse when useful for historical or comparative data:\n\n* Screener.in\n* Trendlyne\n* Other reputable financial-data providers\n\nUseful for:\n\n* Historical financial series\n* Historical valuation\n* Peer comparison\n* Shareholding\n* Consensus estimates\n* Historical ratios\n* Earnings trends\n\nImportant: Secondary-source numbers should be cross-checked against primary filings when material to the thesis.\n\n### Tier 3 — Reputable Financial Media\n\nExamples:\n\n* Moneycontrol\n* Economic Times\n* Business Standard\n* Reuters\n* CNBC-TV18\n* Mint\n* Financial Express\n\nUseful for:\n\n* Recent developments\n* Management comments\n* Industry developments\n* M&A\n* Regulatory developments\n* News flow\n\nMaterial claims should be verified against company filings, transcripts, or regulator sources wherever possible.\n\n## 2. Global Stocks\n\nPreferred order:\n\n### Tier 1\n\n* Company Investor Relations\n* Latest Annual Report\n* Latest 10-K\n* Latest 20-F\n* Latest 10-Q\n* Earnings presentations\n* Earnings-call transcripts\n\n### Tier 2\n\n* SEC EDGAR\n* Relevant local securities regulator\n* Reputable market-data providers\n* Reputable consensus databases\n\n### Tier 3\n\n* Reuters\n* Bloomberg\n* Financial Times\n* Wall Street Journal\n* Other reputable financial publications\n\n## 3. Small and Mid-Cap Rule\n\nSmall and mid-cap companies require deeper verification.\n\nNever rely on a single aggregator.\n\nAt minimum:\n\n1. Open the latest annual report.\n2. Open the latest quarterly result.\n3. Review the latest investor presentation.\n4. Review the latest available earnings-call transcript.\n5. Check exchange/regulatory filings.\n6. Cross-check important financial figures against another credible source.\n7. Search for at least two recent independent credible analyst/media discussions when available.\n8. Check promoter/shareholding information.\n9. Check auditor comments and qualifications.\n10. Check related-party transactions.\n11. Check contingent liabilities.\n12. Check cash-flow quality.\n\nIf information is unavailable:\n\n* Explicitly state the data gap.\n* Do not infer precision that the available evidence does not support.\n* Reduce confidence appropriately.\n\n## 4. Forward-Looking Data\n\nForward-looking information is mandatory for the multi-bagger assessment.\n\nLook for:\n\n### Management Guidance\n\nPrefer:\n\n1. Latest earnings-call transcript\n2. Latest investor presentation\n3. Latest annual report\n4. Official company announcement\n\nExtract:\n\n* Revenue guidance\n* EBITDA guidance\n* EBITDA-margin guidance\n* PAT guidance\n* Volume guidance\n* Capacity guidance\n* Capex guidance\n* New-store/unit guidance\n* Order-book execution guidance\n* Medium-term growth targets\n\nAlways record:\n\nSource + date\n\nExample:\n\nManagement guided for ~20% revenue growth in FY27 during the Q1 FY27 earnings call dated July 2026.\n\nDo not present management guidance as fact.\n\nClearly label it as:\n\nManagement guidance\n\n## 5. Guidance Credibility\n\nCompare management's historical guidance with actual outcomes.\n\nPreferably examine the previous 3–4 years.\n\nClassify:\n\n### High Credibility\n\n* Frequently met guidance\n* Frequently exceeded guidance\n* Conservative guidance\n* Transparent explanations for misses\n\n### Medium Credibility\n\n* Generally achieved targets\n* Occasional misses\n* Reasonable explanations\n\n### Low Credibility\n\n* Repeated misses\n* Frequent target changes\n* Aggressive promises without delivery\n* Guidance withdrawn repeatedly\n* Significant divergence between promised and actual performance\n\nGuidance credibility should materially affect the Management & Guidance Credibility score.\n\n## 6. Consensus Estimates\n\nWhen credible Street consensus exists, obtain:\n\n* Revenue estimate\n* EBITDA estimate\n* PAT/EPS estimate\n* Expected EPS growth\n* Forward P/E\n* Forward EV/EBITDA\n* PEG where available\n\nAlways state:\n\nSource + date\n\nIf consensus coverage is weak or unavailable:\n\n* Say so explicitly.\n* Do not manufacture a consensus estimate.\n* Rely more heavily on management guidance and independent fundamental assessment.\n* Reduce confidence in valuation precision.\n\n## 7. Current Market Data\n\nFor valuation calculations, use the latest available:\n\n* Share price\n* Market capitalization\n* Enterprise value\n* Shares outstanding\n* Net debt/cash\n* Latest EPS\n* Forward EPS\n* Consensus EPS where available\n\nAlways date market-sensitive information.\n\nDo not use stale valuation figures when newer information is available.\n\n## 8. Source Discipline\n\nEvery important numerical claim should have a source.\n\nFor example:\n\nRevenue CAGR: 24% (FY22–FY26, company annual reports).\n\nForward P/E: 31× (consensus EPS, source/date).\n\nPromoter holding: 54.2%, down from 57.1% (shareholding filings, latest quarter).\n\nAvoid unnecessary citations for obvious analytical conclusions, but cite the underlying data.\n\n## 9. Conflicting Data\n\nWhen sources disagree:\n\n1. Prefer primary company/regulatory filings.\n2. Check the reporting period.\n3. Check whether one source uses consolidated and another standalone figures.\n4. Check accounting-period differences.\n5. Explain material discrepancies.\n\nNever silently choose whichever number supports the thesis.\n\n## 10. Final Source Principle\n\nThe objective is not to collect the maximum number of sources.\n\nThe objective is:\n\nLatest + verified + relevant + preferably primary.\n\nUse sources to establish facts.\n\nUse analytical judgment to interpret those facts.\n\nNever reverse this order.\n";
var fund_key_ratios_default = "# Key Ratios & Metrics — Intelligent Multi-Bagger Analysis\n\nPurpose: identify companies capable of compounding earnings and intrinsic value over 3–7 years. Historical metrics provide context; future economics matter more.\n\n## 1. Core Interpretation Rule\n\nNever interpret a major metric in isolation.\n\nUse this sequence where relevant:\n\nMetric → Change → Drivers → Driver Quality → Related-Metric Cross-check → Contradictions → Investment Implication\n\nA metric is an observation, not a conclusion.\n\nDo not use universal rules such as:\n\n* High ROE = automatically good\n* Low P/E = automatically cheap\n* High promoter ownership = automatically positive\n* High growth = automatically high quality\n* High debt/equity = automatically dangerous\n\nInterpret metrics according to the company's business model, sector economics, capital intensity, cyclicality, competitive position, accounting structure and reinvestment needs.\n\nIf the underlying driver cannot be established reliably, retain the conventional metric analysis and state the limitation. Never invent causation.\n\n## 2. Growth\n\n### Historical\n\nAssess where available:\n\n* Revenue CAGR — 3Y and 5Y\n* PAT/EPS CAGR — 3Y and 5Y\n* EBITDA growth\n* Margin trajectory\n\n### Forward\n\nAssess:\n\n* Revenue growth\n* EPS/PAT growth\n* EBITDA growth\n* Margin trajectory\n* Organic versus acquisition-driven growth\n\nDo not judge growth by percentage alone.\n\nWhere relevant investigate:\n\n* Volume\n* Price\n* Product/service mix\n* Market share\n* Capacity\n* Utilization\n* New products\n* Geography\n* Acquisitions\n* Operating leverage\n* Addressable market\n\nThen cross-check growth against:\n\nProfit + Margins + Receivables + Inventory + CFO + Working Capital + ROCE\n\nThe key question:\n\nCan high growth persist for years while earning attractive returns on the capital required to support it?\n\n## 3. Profitability & Margins\n\nInterpret profit growth together with revenue growth.\n\nAssess whether profit is growing:\n\n* Faster than revenue\n* In line with revenue\n* Slower than revenue\n* Despite declining revenue\n\nWhere relevant determine whether margin changes are driven by:\n\n* Pricing\n* Mix\n* Input costs\n* Operating leverage\n* Efficiency\n* Utilization\n* Temporary/cyclical factors\n* One-off cost reductions\n\nDistinguish structural improvement from temporary improvement.\n\nCross-check PAT against EBITDA/EBIT, CFO and exceptional/other-income effects.\n\n## 4. ROE\n\nWhere data permits, conceptually assess:\n\nROE ≈ Profit Margin × Asset Turnover × Equity Multiplier\n\nDetermine whether high/improving ROE is primarily driven by:\n\n* Better profitability\n* Better asset efficiency\n* Greater leverage\n* Capital-base changes\n\nCross-check:\n\nROE + ROCE + Debt + Margins\n\nExamples:\n\nROE ↑ + ROCE ↑ + Debt stable/falling = stronger evidence of genuine operational improvement.\n\nROE ↑ + ROCE flat/down + Debt ↑ = weaker quality of ROE improvement.\n\n## 5. ROCE / ROIC\n\nAssess:\n\n* Absolute level\n* Trend\n* Capital intensity\n* Asset efficiency\n* Working-capital requirements\n* Utilization\n* Leverage\n* Invested-capital changes\n\nDo not rely only on historical ROCE.\n\nWhere possible assess:\n\nIncremental Operating Profit / Incremental Invested Capital\n\nfor:\n\n* New factories\n* Stores/branches\n* New capacity\n* Products\n* Acquisitions\n* Geographic expansion\n\nDistinguish:\n\nReturns on the existing business\n\nfrom\n\nReturns on future growth capital.\n\nHigh historical ROCE with poor incremental returns can indicate weakening future economics.\n\n## 6. Reinvestment Economics\n\nA potential compounding machine generally requires:\n\nLarge runway × High reinvestment opportunity × High incremental returns\n\nAssess:\n\n* Reinvestment rate\n* Capex requirements\n* Working-capital requirements\n* Acquisition requirements\n* Expected return on incremental capital\n\nA company cannot compound rapidly for long if it lacks productive opportunities to reinvest.\n\n## 7. Cash Flow & Earnings Quality\n\nCross-check:\n\nPAT ↔ CFO ↔ FCF\n\nAssess:\n\n* OCF/PAT\n* FCF/PAT\n* FCF margin\n* Cash-flow trend\n* Working-capital movements\n\nDo not mechanically treat PAT/CFO divergence as negative.\n\nInvestigate whether divergence is caused by:\n\n* Receivables\n* Inventory\n* Payables\n* Growth investment\n* Timing\n* Non-cash items\n* Temporary working-capital release\n\nPersistent unexplained divergence deserves a less favorable assessment.\n\n## 8. Working Capital\n\nTrack:\n\n* Receivable days\n* Inventory days\n* Payable days\n* Cash conversion cycle\n\nCompare changes against revenue growth.\n\nParticularly important:\n\nRevenue growth vs Receivables growth\n\nRevenue growth vs Inventory growth\n\nRapidly rising receivables/inventory alongside weak cash conversion can reduce growth-quality confidence.\n\nContext matters; do not mechanically classify every increase as negative.\n\n## 9. Balance Sheet & Leverage\n\nAssess:\n\n* Net Debt/EBITDA\n* Debt/Equity\n* Interest coverage\n* Net cash\n* Debt maturity\n* Refinancing needs\n* Foreign-currency exposure where relevant\n\nNever judge debt using a universal threshold.\n\nAsk:\n\nWhat is the company getting in return for additional leverage?\n\nCross-check:\n\nDebt + EBITDA + EBIT + Interest + CFO + ROCE + Growth\n\nDebt can be productive when it funds high-return expansion; the same debt can be dangerous when returns and cash generation deteriorate.\n\n## 10. EPS & Share Count\n\nCompare:\n\nPAT growth vs EPS growth vs Share Count\n\nAssess:\n\n* Dilution\n* Buybacks\n* ESOPs\n* Warrants\n* Convertibles\n\nDistinguish:\n\nUnderlying business earnings growth\n\nfrom\n\nPer-share earnings growth caused partly by share-count changes.\n\n## 11. Valuation\n\nAssess where meaningful:\n\nP/E\n\n* Trailing\n* Forward\n* Historical range\n* Peer comparison\n\nEV/EBITDA\n\n* Trailing\n* Forward\n\nP/B\n\nEspecially relevant for financials and asset-heavy businesses.\n\nPEG\n\nUse as a screening aid, not a standalone conclusion.\n\nShareholder Returns\n\nDividend yield and buyback yield where meaningful.\n\nNever conclude:\n\nLow multiple = cheap\n\nor\n\nHigh multiple = expensive\n\nwithout considering:\n\n* Growth\n* Duration\n* ROCE\n* Margins\n* Cash quality\n* Balance sheet\n* Cyclicality\n* Competitive durability\n\n## 12. Valuation Reverse Engineering\n\nAlways ask:\n\nWhat future performance is today's price already pricing in?\n\nWhere possible estimate:\n\n* Revenue growth required\n* EPS growth required\n* Margin assumptions\n* Reinvestment requirements\n* Return on incremental capital\n* Terminal economics\n* Multiple assumptions\n\nFor cyclical companies, use normalized economics rather than blindly using peak/trough earnings.\n\nThe key question:\n\nHow much future success is already reflected in today's price?\n\n## 13. Cross-Metric Intelligence\n\nActively connect economically related metrics.\n\nGrowth Quality\n\nRevenue + Profit + Margin + Receivables + CFO\n\nReturn Quality\n\nROE + ROCE + Debt + Margin + Asset Efficiency\n\nEPS Quality\n\nPAT + EPS + Share Count\n\nLeverage Quality\n\nDebt + EBITDA + Interest + CFO + ROCE\n\nReinvestment Quality\n\nCapex + Revenue + Incremental Returns + ROCE\n\nValuation Quality\n\nP/E + Growth + ROCE + Margin Sustainability + Cyclicality\n\nOwnership Quality\n\nPromoter Holding + Pledge + Insider Activity + Dilution\n\nDo not let one attractive ratio dominate the conclusion.\n\n## 14. Contradiction Detection\n\nActively search for situations where headline metrics conflict with supporting evidence.\n\nExamples:\n\nHigh ROE + High leverage + Mediocre ROCE\n\nStrong profit growth + Weak CFO + Rising receivables\n\nLow P/E + Peak-cycle margins\n\nStrong FCF + Temporary working-capital release\n\nStrong EPS growth + Slower PAT growth + Falling share count\n\nLarge order book + Weak revenue/cash conversion\n\nLarge capacity expansion + Weak utilization\n\nContradictions should be surfaced when material.\n\nDo not automatically classify every contradiction as negative; determine the reason and persistence.\n\n## 15. Positive Evidence Convergence\n\nAlso identify reinforcing evidence.\n\nExample:\n\nRevenue ↑ + Profit ↑ faster + Margins ↑ + ROCE ↑ + Debt ↓ + CFO ↑\n\nThis is stronger evidence than six isolated positive ratios.\n\nLikewise, multiple simultaneous deteriorations should increase concern.\n\n## 16. Accounting & Presentation Quality\n\nWhere material, cross-check:\n\n* Revenue recognition\n* Receivables\n* Inventory\n* Contract assets/liabilities\n* Capitalized costs\n* Depreciation\n* Goodwill/intangibles\n* Other income\n* Exceptional items\n* Tax effects\n* Related parties\n* Subsidiaries/associates\n* Dilution\n* Buybacks\n* Asset sales\n* Accounting-policy changes\n\nTreat management commentary as a claim to be tested against actual outcomes.\n\nDo not accuse fraud or manipulation without evidence.\n\nInstead identify:\n\n* Weak corroboration\n* Presentation risk\n* Accounting-quality concern\n* Economic mismatch\n\n## 17. Sector-Aware Metrics\n\nFirst identify how the company makes money and what economically drives value creation.\n\nThen emphasize relevant metrics.\n\nBanks\n\nROA, ROE, NIM, credit/deposit growth, GNPA/NNPA, slippages, provisions, credit cost, CASA, capital adequacy, funding.\n\nNBFCs\n\nAUM growth/quality, NIM/spreads, funding cost, leverage, liquidity, asset quality, credit cost.\n\nInsurance\n\nPremium growth, VNB, VNB margin, persistency, solvency, underwriting economics.\n\nIT/Services\n\nOrganic/constant-currency growth, client concentration, productivity, utilization, EBIT margin, pricing, deal conversion, cash conversion.\n\nManufacturing/Industrial\n\nVolume, realization, utilization, unit economics, input costs, capex productivity, working capital, ROCE, leverage.\n\nConsumer\n\nVolume vs price/mix, distribution/market expansion, margins, brand economics, ROCE.\n\nPharma\n\nProduct/geography mix, R&D, regulatory exposure, concentration, margins, working capital, cash.\n\nThese are guides, not rigid templates. Use the metrics that best test the actual company's economics.\n\n## 18. Financial Sector Rule\n\nDo not mechanically apply industrial-company metrics to banks, NBFCs, insurers or other financial businesses.\n\nUse sector-appropriate measures and interpret them together.\n\n## 19. Forward Metrics\n\nWhen reliably available, obtain:\n\n* Management revenue guidance\n* EBITDA guidance\n* PAT/EPS guidance\n* Volume/capacity guidance\n* Capex guidance\n* Street revenue estimate\n* Street EPS/PAT estimate\n* Expected EPS growth\n* Forward P/E\n* Forward EV/EBITDA where meaningful\n* PEG where meaningful\n* Expected margin trajectory\n* Valuation-implied expectations\n\nAlways provide source + date.\n\nIf unavailable:\n\nNot reliably available\n\nNever fabricate.\n\n## 20. Core Investment Test\n\nEvery important metric should ultimately help answer:\n\n1. Can earnings grow rapidly?\n2. Can growth persist for years?\n3. Can new capital earn attractive returns?\n4. Is management credible?\n5. Is governance sufficiently clean?\n6. What future success is already priced in?\n7. Is upside meaningfully larger than downside?\n\nThe final assessment should represent the combined economics, not a mechanical average of individual ratios.\n";
var fund_indian_red_flags_default = "# Indian Market Specific Red Flags — NSE/BSE\n\nApply this checklist to every Indian listed-company analysis.\n\nMaterial red flags must be explicitly mentioned and must reduce the relevant Management, Financial Quality, Growth Quality, or Risk Asymmetry assessment.\n\nDo not treat every minor issue as a thesis breaker.\n\nFocus on issues capable of causing permanent capital loss or materially impairing the multi-bagger thesis.\n\n## 1. Ownership & Promoter Alignment\n\nCheck:\n\n* Promoter holding %\n* Promoter holding trend\n* Promoter buying/selling\n* Promoter pledging %\n* Change in pledging\n* Insider transactions\n\nMajor red flags\n\n* Promoter pledge above roughly 20–25%\n* Rapidly increasing pledge\n* Large unexplained promoter selling\n* Persistent decline in promoter ownership\n* Promoters selling while simultaneously communicating aggressive growth\n* Complex ownership structures\n\nInterpretation:\n\nHigh or rising promoter pledging can materially increase downside risk.\n\nDo not automatically treat every promoter sale as negative. Determine whether there is a credible explanation such as:\n\n* Tax\n* Estate planning\n* ESOP obligations\n* Debt repayment\n* Regulatory requirement\n* Strategic transaction\n\n## 2. Related-Party Transactions\n\nCheck:\n\n* Related-party sales\n* Related-party purchases\n* Loans to related entities\n* Guarantees\n* Advances\n* Investments\n* Property transactions\n* Inter-company arrangements\n\nRed flags include:\n\n* Material transactions relative to company size\n* Persistent related-party dependence\n* Non-arm's-length pricing\n* Loans/guarantees benefiting promoter-linked entities\n* Complex transactions that obscure economic performance\n\n## 3. Auditors\n\nCheck:\n\n* Auditor changes\n* Sudden resignation\n* Qualifications\n* Emphasis of matter\n* Internal-control weaknesses\n* Delayed filings\n* Accounting disputes\n\nFrequent unexplained auditor changes are a major governance warning.\n\n## 4. Accounting Quality\n\nCheck:\n\n* Reported PAT versus operating cash flow\n* Revenue recognition\n* Receivable growth\n* Inventory growth\n* Capitalized expenses\n* Changes in accounting policies\n* One-time gains\n* Exceptional items\n* Other income dependence\n\nRed flag\n\nProfit grows substantially faster than cash generation for several years without a convincing working-capital or business explanation.\n\n## 5. Receivables\n\nTrack:\n\n* Receivable days\n* Receivables as % of revenue\n* Growth versus sales\n\nRed flags:\n\n* Receivables growing materially faster than revenue\n* Persistent deterioration\n* Large overdue balances\n* Customer concentration\n\n## 6. Inventory\n\nTrack:\n\n* Inventory days\n* Inventory growth versus revenue\n* Obsolescence risk\n\nRed flags:\n\n* Inventory accumulation without corresponding sales\n* Sudden inventory build\n* Falling inventory turnover\n* Large write-offs\n\n## 7. Dilution\n\nCheck:\n\n* Preferential allotments\n* Warrants\n* Convertible securities\n* QIPs\n* Rights issues\n* ESOP dilution\n* Promoter allotments\n\nRed flags:\n\n* Frequent dilution\n* Favorable pricing for promoters/related parties\n* Dilution without credible productive use of capital\n* Persistent shareholder dilution despite weak returns\n\n## 8. Contingent Liabilities\n\nCheck:\n\n* Guarantees\n* Legal disputes\n* Tax disputes\n* Regulatory disputes\n* Guarantees to group companies\n* Off-balance-sheet commitments\n\nLarge contingent liabilities can materially reduce downside protection.\n\n## 9. Group Structure\n\nCheck:\n\n* Parent company\n* Subsidiaries\n* Associate companies\n* Joint ventures\n* Listed/unlisted group entities\n\nRed flags:\n\n* Opaque inter-company transactions\n* Circular transactions\n* Frequent related-party funding\n* Cash moving between entities without clear economic rationale\n* Minority shareholder value leakage\n\n## 10. Regulatory / SEBI History\n\nSearch for:\n\n* SEBI orders\n* Show-cause notices\n* Exchange notices\n* Insider-trading cases\n* Market-manipulation cases\n* Forensic audits\n* Accounting investigations\n\nMaterial regulatory history should be explicitly incorporated into the management/governance score.\n\n## 11. Management Guidance\n\nCompare:\n\nGuidance → Actual\n\nover approximately 3–4 years.\n\nRed flags:\n\n* Repeated misses\n* Repeated postponement\n* Frequent changes to targets\n* Aggressive promises\n* Unexplained divergence between guidance and delivery\n\nRepeated guidance misses should materially reduce Management & Guidance Credibility.\n\n## 12. Promoter Remuneration\n\nCheck:\n\n* Promoter salary\n* Commission\n* Related benefits\n* Remuneration versus PAT\n* Remuneration versus peers\n\nRed flag:\n\nVery high promoter remuneration relative to:\n\n* Company profits\n* Company size\n* Peer companies\n\n## 13. Customer Concentration\n\nCheck:\n\n* Largest customer %\n* Top 5 customers\n* Government dependence\n* Single-contract dependence\n\nRed flags:\n\n* One customer contributes an unusually large percentage of revenue\n* Government contract dependency\n* Political/regulatory sensitivity\n* Contract renewal risk\n\n## 14. Government Dependence\n\nGovernment business is not automatically negative.\n\nAssess:\n\n* Contract duration\n* Renewal history\n* Payment cycle\n* Political sensitivity\n* Tender competitiveness\n* Customer concentration\n* Regulatory dependency\n\nA company whose growth depends heavily on continued government support should receive an appropriate risk discount.\n\n## 15. Capital Allocation\n\nCheck:\n\n* Acquisitions\n* Capex\n* Buybacks\n* Dividends\n* Debt repayment\n* Investments\n* Related-party investments\n\nRed flags:\n\n* Value-destructive acquisitions\n* Low-return capex\n* Frequent unrelated diversification\n* Excessive cash deployment into promoter-linked businesses\n* Persistent dilution\n* Poor incremental ROCE\n\n## 16. How to Apply Red Flags\n\nDo not create a giant checklist in the final answer.\n\nOnly highlight material findings.\n\nExample:\n\nGovernance\n\nPromoter holding stable at ~55%; no material pledge.\n\nReceivables have risen from 58 to 91 days over three years, outpacing revenue growth.\n\nThen explain the implication briefly.\n\n## 17. Severity\n\nMinor\n\nMonitor but do not materially alter thesis.\n\nModerate\n\nReduce relevant score and mention.\n\nMajor\n\nMaterially reduce Management / Financial Quality / Risk score.\n\nThesis-threatening\n\nCan justify:\n\n* Speculative Multi-Bagger\n* Limited Asymmetry\n* Avoid\n\ndepending on severity.\n\n## 18. Core Principle\n\nA high-growth story cannot compensate indefinitely for:\n\n* Poor governance\n* Weak cash generation\n* Excessive leverage\n* Promoter pledge\n* Accounting concerns\n* Value-destructive capital allocation\n\nThe goal is not to find reasons to reject companies.\n\nThe goal is to identify risks capable of destroying the multi-bagger thesis.\n";
var fund_scoring_rubric_default = "# Scoring Rubric — Multi-Bagger Lens\n\nScore strictly.\n\nA score of 8+ represents clear excellence that genuinely supports multi-fold return potential.\n\nDo not award high scores merely because a company is popular, profitable, or a high-quality business.\n\nThe score must reflect future multi-bagger potential from the current valuation.\n\n## 1. Business Quality & Expandable Moat — 20%\n\n9–10\n\nStrong and expandable moat.\n\nExamples:\n\n* Pricing power\n* Network effects\n* High switching costs\n* Scale-driven cost advantage\n* Powerful brand\n* Regulatory moat\n* Customer stickiness\n* Structural operating leverage\n\nThe competitive advantage should become stronger or more valuable as the company scales.\n\n7–8\n\nSolid competitive position with some expansion potential.\n\n5–6\n\nAverage business.\n\nLimited durable advantage.\n\n0–4\n\nWeak/no moat, easy to disrupt, structurally declining or poor economics.\n\n## 2. Growth Potential & Runway — 25%\n\nHighest-weight category.\n\n9–10\n\nClear multi-year runway with:\n\n* Multiple growth levers\n* High credible growth\n* Underappreciated opportunity\n* Margin expansion potential\n* Large addressable market\n* Strong reinvestment opportunities\n\n7–8\n\nSolid above-industry growth with visible drivers for at least 3 years.\n\n5–6\n\nModerate/in-line growth.\n\n0–4\n\nLow growth, cyclical peak, structural decline, or limited runway.\n\n## 3. Capital Allocation & Incremental Returns — 15%\n\n9–10\n\nExcellent capital allocation.\n\nCharacteristics:\n\n* High ROCE reinvestment\n* Strong incremental returns\n* Disciplined acquisitions\n* Productive capex\n* Intelligent shareholder returns\n* Rising incremental ROCE\n\n7–8\n\nGenerally good allocation and healthy returns on new capital.\n\n5–6\n\nAverage/mixed history.\n\n0–4\n\nValue destruction.\n\nExamples:\n\n* Poor M&A\n* Low incremental ROCE\n* Frequent dilution\n* Unproductive capex\n* Poor capital discipline\n\n## 4. Management & Guidance Credibility — 15%\n\n9–10\n\n* High skin-in-the-game\n* Strong alignment\n* Transparent communication\n* Consistent guidance delivery\n* Clean governance\n* Strong capital-allocation history\n\n7–8\n\nCompetent and mostly reliable.\n\n5–6\n\nAverage track record.\n\nOccasional misses or governance concerns.\n\n0–4\n\nExamples:\n\n* Repeated guidance misses\n* High promoter pledging\n* Related-party concerns\n* Poor alignment\n* Major governance issues\n* Questionable disclosures\n\n## 5. Valuation vs Quality of Growth — 15%\n\n9–10\n\nAttractive valuation relative to:\n\n* Growth\n* Duration\n* Quality\n* Reinvestment economics\n\nMeaningful margin of safety even under conservative assumptions.\n\n7–8\n\nReasonable valuation for the quality and growth.\n\n5–6\n\nFairly valued.\n\nLimited asymmetry.\n\n0–4\n\nExamples:\n\n* Expensive\n* Priced for perfection\n* Aggressive growth already embedded\n* Poor risk/reward\n\n## 6. Risk Asymmetry / Downside Protection — 10%\n\n9–10\n\n* Strong balance sheet\n* Low permanent-capital-loss risk\n* Clear asymmetric upside\n* Strong downside protection\n\n7–8\n\nAcceptable downside with attractive upside.\n\n5–6\n\nBalanced risk/reward.\n\n0–4\n\nExamples:\n\n* High permanent impairment risk\n* Excessive leverage\n* Governance risk\n* Fragile business economics\n* Limited upside\n\n## Overall Score\n\nCalculate:\n\nBusiness Quality × 20% + Growth × 25% + Capital Allocation × 15% + Management × 15% + Valuation × 15% + Risk Asymmetry × 10%\n\nRound to one decimal place.\n\nExample:\n\nBusiness = 8.0\nGrowth = 9.0\nCapital Allocation = 8.0\nManagement = 8.0\nValuation = 7.0\nRisk = 8.0\n\nOverall:\n\n8.0×0.20 + 9.0×0.25 + 8.0×0.15 + 8.0×0.15 + 7.0×0.15 + 8.0×0.10\n= 8.0\n\n## Star Rating\n\n8.5–10.0\n★★★★★\n\n7.0–8.4\n★★★★\n\n5.5–6.9\n★★★\n\n4.0–5.4\n★★\n\nBelow 4.0\n★\n\n## Verdict Language\n\nUse exactly one of these:\n\n### High-Conviction Multi-Bagger Candidate\n\nRequirements:\n\n* Overall score ≥ 8.0\n* Clear growth runway\n* Good risk asymmetry\n\nA high score alone is insufficient.\n\n### Quality Compounder\n\nUse when:\n\n* Business quality is strong\n* Growth is credible\n* Long-term compounding is attractive\n\nBut the opportunity may be steadier/slower rather than an obvious multi-bagger at current valuation.\n\n### Speculative Multi-Bagger\n\nUse when:\n\n* Upside can be very large\n* But execution, governance, valuation, business, or disclosure risk is materially higher\n\n### Fair Value Compounder\n\nUse when:\n\n* Business quality is good\n* Growth is credible\n* But current valuation leaves limited multi-bagger upside\n\n### Limited Asymmetry\n\nUse when:\n\n* Upside exists\n* But not enough relative to downside or execution risk\n\n### Avoid\n\nUse when:\n\n* Business is weak\n* Capital allocation is poor\n* Governance is problematic\n* Growth runway is inadequate\n* Valuation is severely stretched\n* Permanent capital-loss risk is high\n\n## Important Scoring Discipline\n\nDo not inflate scores.\n\nA company should generally require strong evidence to receive:\n\n* 8+ for Business Quality\n* 8+ for Growth\n* 8+ for Management\n* 8+ for Valuation\n\nEspecially:\n\n8+ overall is exceptional.\n\nThe score is not a popularity rating.\n\nIt is an assessment of:\n\nFuture multi-fold return potential from today's price.\n\n## Multi-Bagger Override Principles\n\nA company should not receive a High-Conviction Multi-Bagger Candidate rating merely because:\n\n* Revenue is growing rapidly\n* EPS is growing rapidly\n* ROCE is high\n* The business is excellent\n* The stock is popular\n\nThe combination must work.\n\nThe ideal profile is:\n\nHigh-quality business + Large and expanding runway + High incremental returns + Credible management + Clean governance + Strong cash generation + Reasonable valuation + Asymmetric upside\n\n## Valuation Override\n\nEven an exceptional company may receive:\n\nFair Value Compounder\n\nor\n\nLimited Asymmetry\n\nif current valuation already prices in:\n\n* Aggressive revenue growth\n* Sustained high margins\n* Large margin expansion\n* Multiple expansion\n* Near-perfect execution\n\nThe question is always:\n\nHow much future success is already reflected in today's price?\n\n## Risk Override\n\nIf governance, leverage, accounting quality, promoter pledge, or other issues create a material probability of permanent capital loss, the overall assessment must reflect that risk.\n\nDo not allow high growth to hide severe downside risk.\n\n## Final Decision Rule\n\nThe final verdict must answer:\n\n1. Can this company compound earnings for years?\n2. Is the runway large enough?\n3. Can new capital earn attractive returns?\n4. Is management credible?\n5. Is governance clean enough?\n6. Is valuation reasonable relative to growth?\n7. Is the upside meaningfully larger than the downside?\n\nOnly when the evidence supports these questions should the company qualify as a high-conviction multi-bagger candidate.\n";
var qual_skill_default = "---\nname: qualitative-multibagger-catalyst\ndescription: Analyses one or more Indian listed stocks against non-screenable qualitative catalysts that historically drive multi-bagger moves, plus a concise financial health check. Delivers a direct structured verdict on 2-5 year multi-bagger potential. Use when the user provides stock names or tickers and asks for qualitative multi-bagger analysis, catalyst check, inflection analysis, qualitative filtering after a quantitative screen, or a multi-bagger potential verdict.\n---\n\n# Qualitative Multi-Bagger Catalyst Analysis\n\nEvaluate Indian listed companies for qualitative multi-bagger potential over a 2–5 year horizon.\n\nQualitative catalysts are the primary decision layer. Financial metrics are a supporting health check and must not mechanically override a strong, well-evidenced qualitative thesis.\n\nRead `references/catalyst-framework.md` before scoring factors, applying synergies, adjusting for business model, or issuing a verdict.\n\n## When to Use\n\n- User provides one or more Indian listed stocks (name or ticker)\n- User asks for multi-bagger potential, qualitative catalyst analysis, inflection points, or a qualitative verdict\n- User wants qualitative filtering after a quantitative screen\n- User wants to compare shortlisted names on catalyst quality\n\n## Research Before Judging\n\nResearch the latest available information before forming a verdict.\n\nSource hierarchy (use the strongest available evidence):\n\n1. **Primary** — exchange filings, company announcements, annual reports, quarterly results, investor presentations, earnings-call transcripts, official company site, official regulatory documents\n2. **High-quality secondary** — reputable financial publications, established data providers, accessible broker research, industry publications\n3. **Discovery only** — general articles, forums, social media, aggregators. These may surface leads. Do not treat them as confirmed company facts.\n\nNever invent financial figures, order books, capacity plans, guidance, partnerships, timelines, or management statements. Distinguish confirmed facts from interpretation. Mark unavailable or non-applicable items explicitly.\n\nPrefer measurable evidence — capacity, commissioning dates, utilization, order-book values, order-book/revenue, customers, launches, commercialization, guidance, capex, debt actions, promoter actions, partnerships, restructuring.\n\n## Core Process\n\n1. Identify the company, ticker, and exchange.\n2. Research latest primary and high-quality sources.\n3. Produce a concise **Financial Snapshot** against the reference thresholds.\n4. Score all seven qualitative dimensions using the framework.\n5. Identify high-impact catalyst synergies. Apply judgment — do not mechanically score co-occurrence.\n6. Classify style when useful — Consistent Compounder / Turnaround-Inflection / Mixed.\n7. Issue exactly one approved verdict with a short rationale.\n8. If multiple stocks, analyse each individually in the same format, then optionally add a comparative takeaway.\n\n## Financial Snapshot\n\nReference thresholds (supporting indicators, not hard pass/fail):\n\n- Sales growth 3Y CAGR > 18%\n- Profit growth 3Y CAGR > 35%\n- Profit growth 5Y CAGR > 20%\n- Latest ROCE > 20%\n- Debt / Equity < 0.5\n- Promoter holding > 50%\n- TTM operating profit margin > 15% (above 12% may be acceptable when the qualitative setup is unusually strong)\n- Recent 1Y sales growth > 12%\n\nInterpret in context of cycles, newly commissioned capacity, acquisitions, demergers, exceptional base years, turnarounds, transformations, and financial/holding-company models.\n\nClassify as exactly one of: **Financially Strong** / **Acceptable** / **Mixed** / **Weak**.\n\nReport only the 2–5 most decision-relevant observations. Note missing data. Do not estimate missing metrics.\n\nA company with weak current financials can still have a credible Turnaround-Inflection thesis if future-improvement evidence is strong. Excellent historical financials do not make a high-potential multi-bagger if future catalysts are weak.\n\n## Qualitative Dimensions\n\nScore every dimension as exactly one of: **Strong** / **Moderate** / **Weak** / **Not Present**. Give brief evidence.\n\n1. Capacity & Expansion\n2. Product / Business Mix\n3. Order Book & Demand Visibility\n4. Structural / Thematic Tailwinds\n5. Management & Corporate Actions\n6. Operating Leverage & Inflection\n7. Market Positioning\n\nDo not force a factor where it is genuinely irrelevant. For financials, holding companies, asset-light models, and commodities, adapt using the business-model rules in the framework.\n\nEvaluate each important catalyst on evidence strength, business impact, timing/visibility, and incrementality. A theme or rumour is not a company-specific catalyst.\n\nPrioritize catalysts that are credible, material, approaching, and measurable.\n\n## High-Impact Synergies (Reference Patterns)\n\n| Combination                                                  | Reference Strength |\n| ------------------------------------------------------------ | ------------------ |\n| New Capacity + Clear Numerical Guidance                      | Very High          |\n| Large Order Book + Structural Theme                          | Very High          |\n| New High-Value Product + Operating Leverage                  | High               |\n| Turnaround + Debt Reduction + Promoter Commitment            | High               |\n| Product Mix Upgrade + Structural Theme + Guidance            | High               |\n| Capacity Expansion + Product Refresh + Strategic Partnership | High               |\n| Only one moderate factor                                     | Low–Medium         |\n\nDo not award a combination unless the underlying evidence supports the relationship.\n\n## Verdict Labels\n\nUse exactly one:\n\n- High Potential Multi-bagger\n- Moderate to High Potential\n- Moderate Potential\n- Low / Speculative Potential\n- Not Attractive on Qualitative Factors\n\nDo not equate strong company, strong theme, large order book, high growth, or low valuation with a multi-bagger. The question is what can materially change earnings power, competitive position, or market perception over 2–5 years, and how credible that change is.\n\nDo not present a multi-bagger outcome as a prediction or guarantee. Do not invent target prices or probability percentages unless the user explicitly asks.\n\n## Mandatory Output\n\n**Stock: [Name]**\n\n**Financial Snapshot:**\n**[Financially Strong / Acceptable / Mixed / Weak]**\n- 2–5 concise key points\n\n**Factor Check:**\n- **Capacity & Expansion:** [status] — brief evidence\n- **Product / Business Mix:** [status] — brief evidence\n- **Order Book & Demand Visibility:** [status] — brief evidence\n- **Structural / Thematic Tailwinds:** [status] — brief evidence\n- **Management & Corporate Actions:** [status] — brief evidence\n- **Operating Leverage & Inflection:** [status] — brief evidence\n- **Market Positioning:** [status] — brief evidence\n\n**Key Positive Factors:**\nOnly Strong and Moderate factors.\n\n**Powerful Combinations Present:**\nYes / No. If yes, name the combination(s) and why they matter.\n\n**Style Note:**\nConsistent Compounder / Turnaround-Inflection / Mixed\n\n**Verdict:**\n[one approved label]\n\n**Rationale:**\n2–4 concise lines covering financial health, catalyst quality, timing, visibility, execution credibility, and the 2–5 year setup.\n\n## Multiple Stocks\n\nAnalyse every company individually with the same structure and comparable research depth. After the individual write-ups, optionally add:\n\n**Comparative Takeaway**\n\nRank on catalyst strength, timing, earnings visibility, financial quality, execution evidence, and runway. Explain the most important difference between the top names. Do not replace individual analyses with a comparison table.\n\n## Hard Rules\n\n- Base every material claim on verified information.\n- If evidence is weak, limited, or missing, say so.\n- Never treat generic sector narratives as company-specific catalysts.\n- Do not overweight low institutional ownership by itself.\n- Do not assume announced projects complete or orders convert to revenue.\n- Do not assume historical growth continues.\n- Keep output decision-oriented. Do not dump every researched data point.\n- When browser research is used, cite or link important current evidence. Prefer primary sources.\n- The Financial Snapshot supports the thesis. Qualitative catalysts drive the conclusion.\n";
var qual_catalyst_framework_default = "# Qualitative Multi-Bagger Catalyst Framework\n\nDetailed scoring and interpretation reference. Load this when scoring factors, judging catalyst quality, applying synergies, adjusting for business model, or issuing a verdict.\n\nHorizon: 2–5 years. Market: Indian listed equities.\n\nQualitative analysis is the primary decision layer. Financial metrics are a supporting health check and should not mechanically override a strong, well-evidenced qualitative thesis.\n\n## Contents\n\n* Evidence discipline\n* Financial snapshot interpretation\n* Seven qualitative dimensions\n* Catalyst timing and quality\n* High-impact synergies\n* Business-model adjustments\n* Style classification\n* Verdict rules\n* Historical pattern recognition\n* Final principle\n\n## Evidence Discipline\n\nEvaluate every important catalyst on four dimensions:\n\n1. Evidence Strength — officially confirmed, multi-source, management commentary only, or unverified\n2. Business Impact — material effect on revenue, margins, earnings, capital efficiency, or competitive position, relative to current scale\n3. Timing and Visibility — underway, 6–18 months, multi-year roadmap, or highly uncertain\n4. Incrementality — genuinely additive versus already visible in current operations\n\nA catalyst is not powerful merely because it sounds attractive.\n\nPrefer measurable evidence:\n\n* Capacity additions and commissioning dates\n* Capacity utilization\n* Order-book values and order-book/revenue relationships\n* Customer additions\n* New product launches and commercialization milestones\n* Revenue, volume, and margin guidance\n* Capex, debt reduction, promoter actions\n* Strategic partnerships and restructuring\n\nNever treat an unverified article, social-media claim, or market rumour as confirmed company information.\n\n## Financial Snapshot Interpretation\n\nReference thresholds:\n\n| Metric | Reference Threshold |\n|---|---:|\n| Sales Growth — 3Y CAGR | >18% |\n| Profit Growth — 3Y CAGR | >35% |\n| Profit Growth — 5Y CAGR | >20% |\n| Latest ROCE | >20% |\n| Debt / Equity | <0.5 |\n| Promoter Holding | >50% |\n| TTM Operating Profit Margin | >15% |\n| Recent 1Y Sales Growth | >12% |\n\nAn operating margin above 12% may be acceptable where the qualitative setup is unusually strong.\n\nThese thresholds are reference indicators, not absolute pass/fail rules. Interpret through:\n\n* Cyclical businesses\n* Recently commissioned capacity\n* Acquisitions and demergers\n* Exceptional base years\n* Temporary commodity cycles\n* Turnaround situations\n* Major transformation\n* Financial or holding-company models\n\nClassification: Financially Strong / Acceptable / Mixed / Weak.\n\nReport only the most important 2–5 observations. If a metric is unavailable, state that briefly rather than estimating it.\n\nA company with weak current financials can still have a credible Turnaround-Inflection thesis if evidence for future improvement is strong. Excellent historical financials do not automatically make a high-potential multi-bagger if future catalysts are weak.\n\n## A. Capacity & Expansion\n\nLook for:\n\n* New plant commissioning\n* Major capacity additions\n* Commissioning expected within 6–18 months\n* Significant brownfield or greenfield expansion\n* Utilization rising from a low base\n* Debottlenecking\n* Backward or vertical integration\n* Expansion into new geographies\n* Heavy capex nearing completion\n* Existing infrastructure becoming more productive\n\nStrong signal: expansion is large relative to the existing business and has a credible commissioning timeline, customer demand, or management guidance supporting utilization.\n\n## B. Product / Business Mix\n\nLook for:\n\n* Entry into high-value products\n* New technology or R&D commercialization\n* Premium product introduction\n* Moving up the value chain\n* Higher-margin mix\n* New business segments\n* Export expansion\n* Import substitution\n* Business-model transformation\n\nStrong signal: the new product or business can materially increase addressable market, margins, or competitive positioning and has evidence of commercial traction.\n\n## C. Order Book & Demand Visibility\n\nLook for:\n\n* Large order wins\n* Rapid order-book growth\n* Order book significantly larger than current revenue\n* Multi-year or long-term contracts\n* Repeat orders\n* Customer diversification and high-quality customers\n* Strong booking momentum\n* Revenue visibility\n\nStrong signal: order visibility is substantial relative to current revenue and is supported by credible execution capacity.\n\nDo not automatically treat a large order book as positive if execution is questionable, margins are poor, customers are weak, orders are cancellable, or order quality is uncertain.\n\n## D. Structural / Thematic Tailwinds\n\nPotential themes include defence, electronics manufacturing, import substitution, renewable energy, power infrastructure, railways, infrastructure, digital payments, financial inclusion, ethanol blending, mining exploration, manufacturing localization, electric mobility, semiconductor ecosystem, healthcare, specialty chemicals, data centres, energy transition, and government industrial policy.\n\nA theme by itself is insufficient. Connect:\n\nTheme → Company Position → Addressable Market → Earnings Opportunity\n\nStrong signal: the company has a defensible position in a structurally growing industry and there is evidence the theme is translating into actual business growth.\n\n## E. Management & Corporate Actions\n\nLook for:\n\n* Clear numerical medium-term guidance (capacity, volume, margin, PAT/growth)\n* Promoter stake increase or visible promoter commitment\n* Capital infusion and debt reduction\n* Strategic partnership or joint venture\n* Demerger, restructuring, acquisition\n* New management, management transition, or a turnaround plan\n\nStrong signal: actions are specific, measurable, credible, and supported by execution.\n\nTreat vague language such as \"huge opportunity\", \"strong growth ahead\", \"very large market\", or \"excellent prospects\" as weak evidence. Specific targets and demonstrated execution count more.\n\n## F. Operating Leverage & Inflection\n\nLook for:\n\n* Heavy investment phase ending\n* Capacity becoming operational\n* Fixed costs being absorbed\n* Rising utilization\n* Margin expansion and product-mix improvement\n* Sharp structural improvement in profitability\n* Working-capital improvement\n* Debt reduction\n* Asset-productivity improvement\n* Earnings inflection\n\nStrong signal: there is a credible mechanism for earnings to grow faster than revenue because the business economics are changing.\n\n## G. Market Positioning\n\nLook for:\n\n* Low institutional ownership or low analyst coverage\n* Early institutional accumulation\n* Increasing quality-investor interest\n* Under-recognition of a business transformation\n* Potential for valuation re-rating\n* Small current market position despite a large opportunity\n\nLow institutional ownership is not automatically bullish. It becomes relevant when fundamentals or catalysts are improving and are not yet widely recognized.\n\n## Catalyst Timing\n\nClassify important catalysts when useful:\n\n* Near-Term — approximately 0–18 months\n* Medium-Term — approximately 18–36 months\n* Long-Term — beyond 36 months or dependent on multiple uncertain steps\n* Already Underway — already visible in current operating results\n* Speculative — depends on events that have not been sufficiently demonstrated\n\nPrioritize catalysts that are credible + material + approaching + measurable.\n\n## Catalyst Quality\n\nA useful catalyst should ideally satisfy:\n\nCompany-specific evidence + material business impact + visible timing + credible execution + potential earnings consequence.\n\nAvoid high ratings for generic sector narratives.\n\nWeaker: \"Defence spending is increasing.\"\n\nStronger: \"The company has secured a large defence order, is expanding production capacity, and management has provided a commissioning timeline.\"\n\n## High-Impact Catalyst Synergies\n\nUse these as pattern-recognition tools, not mechanical scores.\n\n| Combination | Reference Strength |\n|---|---|\n| New Capacity + Clear Numerical Guidance | Very High |\n| Large Order Book + Structural Theme | Very High |\n| New High-Value Product + Operating Leverage | High |\n| Turnaround + Debt Reduction + Promoter Commitment | High |\n| Product Mix Upgrade + Structural Theme + Guidance | High |\n| Capacity Expansion + Product Refresh + Strategic Partnership | High |\n| Only One Moderate Factor | Low–Medium |\n\nDo not award a rating because two factors merely appear together. The underlying evidence must support the relationship.\n\nCapacity + Guidance is especially powerful when the addition is material, commissioning is credible, demand exists, management gives numerical volume/revenue expectations, and current utilization leaves operating leverage.\n\n## Business-Model Adjustments\n\nDo not force irrelevant factors simply to complete the checklist.\n\n### Financial Companies\n\nCapacity/order-book analysis may be less relevant. Focus more on loan growth, asset quality, credit costs, capital adequacy, branch/product expansion, digital transformation, market share, operating leverage, and the regulatory environment.\n\n### Holding Companies\n\nFocus on NAV discount, asset monetization, capital allocation, simplification, corporate restructuring, subsidiary value unlocking, and promoter actions.\n\n### Asset-Light Businesses\n\nFocus more on customer acquisition, market share, product expansion, pricing power, operating leverage, recurring revenue, and distribution.\n\n### Commodity Businesses\n\nFocus on cost curve, capacity, cycle position, vertical integration, balance sheet, capital allocation, and structural supply/demand changes.\n\n## Style Classification\n\n### Consistent Compounder\n\nStrong existing business, high ROCE, strong balance sheet, consistent growth, competitive advantages, clear expansion runway, less dependent on a single binary catalyst.\n\n### Turnaround / Inflection\n\nCurrent numbers may be weak or depressed. Material transformation underway via capacity ramp, margin recovery, debt reduction, new products, management change, or structural improvement in economics.\n\n### Mixed\n\nMeaningful characteristics of both.\n\n## Verdict Rules\n\nUse exactly one approved label:\n\n* High Potential Multi-bagger — particularly strong combination of improving or strong financial economics, multiple meaningful catalysts, strong evidence, large addressable opportunity, credible execution, clear visibility, and attractive transformation or compounding runway\n* Moderate to High Potential — clearly attractive, but one or more important elements remain less certain\n* Moderate Potential — some attractive characteristics, but catalyst intensity, visibility, or scale is not exceptional\n* Low / Speculative Potential — thesis depends heavily on uncertain assumptions, weak evidence, distant catalysts, or limited financial support\n* Not Attractive on Qualitative Factors — meaningful company-specific catalysts are absent or the evidence does not support a compelling setup\n\nDo not equate:\n\n* Strong company = multi-bagger\n* Strong theme = multi-bagger\n* High order book = multi-bagger\n* High growth = multi-bagger\n* Low valuation = multi-bagger\n\nThe question is:\n\nWhat can materially change the company's earnings power, competitive position, or market perception over the next 2–5 years, and how credible is that change?\n\nHistorical financial strength should support the thesis. Future catalysts should drive the qualitative conclusion.\n\nNever fabricate numbers, guidance, order books, capacity, or customer relationships. Never present rumours as facts. Never present a multi-bagger outcome as guaranteed. Never create arbitrary probability percentages or target prices unless the user explicitly asks. Hide no uncertainty.\n\n## Research Efficiency\n\nDo not collect information merely because it exists. Research should answer:\n\n1. What can change?\n2. Why can it change?\n3. How large can the impact be?\n4. When can it happen?\n5. What evidence confirms it?\n6. What could prevent it?\n7. Is the current financial profile supportive?\n8. Is the catalyst already visible in the reported numbers?\n\nPrioritize information that changes the verdict.\n\n## Historical Pattern Recognition\n\nAttractive historical-style setups include:\n\n* Large capacity ramp + clear volume/margin guidance + structural theme\n* Novel high-value product commercialization + large addressable market + management guidance\n* Rapid order-book expansion in defence, renewables, electronics, or other structural sectors\n* Successful business transformation + new plant commissioning + policy tailwind\n* Consistently high ROCE + strong multi-year growth + long expansion runway\n* Turnaround + debt reduction + capacity utilization improvement\n* Product mix upgrade + operating leverage + structural demand\n\nThese are patterns, not guarantees. Company-specific evidence determines the conclusion.\n\n## Final Principle\n\nIdentify situations where:\n\nBusiness change → Earnings change → Market recognition\n\nis supported by credible evidence.\n\nThe strongest opportunities generally combine structural opportunity, company-specific competitive advantage, a visible catalyst, earnings inflection, credible execution, and sufficient runway.\n\nThe absence of one component does not automatically invalidate a company, but the more components that are missing, the lower the conviction should be.\n";
/** Verbatim Grok skill bodies + reference files. Do not paraphrase. */
/** Presentation only. Does not change scoring, verdict labels, or required sections. */
var SKILL_BRIEF = `
--- OUTPUT DISCIPLINE (presentation only — do not change the skill, scoring, verdict labels, or required sections) ---
- Cut descriptive padding by at least 50%. Direct: what + why. No essays.
- Keep every required heading, factor name, verdict label, and number.
- Each factor: one verdict word (Strong / Moderate / Weak, or the skill's own label) then one sentence of why.
- Any comparison, snapshot, or multi-column data MUST be a GitHub-style markdown table. Never a paragraph of pipes.
- Final verdict: 3–6 sentences. Rationale: 2–4 lines.
- Prefer silence to invention.
`;
function fundSystem() {
	return [
		fund_skill_default.trim(),
		"",
		"--- FILE: references/data-sources.md ---",
		fund_data_sources_default.trim(),
		"",
		"--- FILE: references/key-ratios.md ---",
		fund_key_ratios_default.trim(),
		"",
		"--- FILE: references/indian-red-flags.md ---",
		fund_indian_red_flags_default.trim(),
		"",
		"--- FILE: references/scoring-rubric.md ---",
		fund_scoring_rubric_default.trim(),
		SKILL_BRIEF.trim()
	].join("\n\n");
}
function qualSystem() {
	return [
		qual_skill_default.trim(),
		"",
		"--- FILE: references/catalyst-framework.md ---",
		qual_catalyst_framework_default.trim(),
		SKILL_BRIEF.trim()
	].join("\n\n");
}
var COMBINE_SKILL = `You connect two existing skill outputs on the same Indian listed company. You do not rerun either skill. You do not invent a third analysis or any number that is not already in those outputs.

The first output is equity-fundamental-analysis (six-block multi-bagger lens: score, stars, and one of High-Conviction Multi-Bagger Candidate / Quality Compounder / Speculative Multi-Bagger / Fair Value Compounder / Limited Asymmetry / Avoid).
The second is qualitative-multibagger-catalyst (factor check plus exactly one of High Potential Multi-bagger / Moderate to High Potential / Moderate Potential / Low / Speculative Potential / Not Attractive on Qualitative Factors).

Write in full prose, like Grok chat. Headings. The skill signals 🟢 🟡 🔴 may be kept. Not a buy/sell.

Cover:

1. **Where they agree** — one short section.
2. **Where they pull apart** — numbers vs catalysts. One short section.
3. **What has to go right** — from both reads.
4. **Final connecting verdict** — heading exactly titled **Final verdict**. Three to six sentences that a reader can use. Repeat the fundamental verdict label AND the qualitative verdict label, then one connecting line on 2–7 year multi-bagger potential that is consistent with BOTH reads, not a random third stamp.

Prefer silence to invention. INR. Not advice.
Cut padding by half. Tables not paragraphs.
`;
var IMPROVE_SKILL = `You synthesise a portfolio verdict from this Indian portfolio's weights, live numbers, and already-run equity-fundamental-analysis and qualitative-multibagger-catalyst labels in FACTS. You do not rerun either skill. You do not invent a third analysis, a label, or a number that is not in FACTS.

FACTS lists every holding with its weight. A 25% name dominates a 2% name. Copy skill labels when they are present. Never write Unscreened, book, or Not on file. If a name has no skill output, write Not run in the holdings table only — still judge the portfolio from weights, sectors, and live numbers. Do not make missing qualitative reads the story of the Portfolio verdict.

When BOTH skill labels are present, the verdict must use both. A name that is Avoid on fundamentals and Not Attractive on qualitative is a weak large weight. A name that both skills back is a quality bet even at large size.

Concentration is not automatically a concern. If a large weight is pass / strong on BOTH skills, that size is an opportunity — a bet on quality. Flag concentration as a risk only when the large weight is weak, speculative, Avoid, Limited Asymmetry, Not Attractive, or the two skills disagree badly.

Judge this portfolio relative to itself, not against a single-stock multi-bagger bar. Most listed Indian names will not print High-Conviction Multi-Bagger. That is not a reason to cut the whole portfolio, or to call every holding a fail. Rank names against each other and against their job in this mix. A quality compounder that is Fair Value / Moderate Potential can still be a keep if it is among the stronger weights here. A weak large weight is the actual problem. Practical and decisive: size up, size down, or leave. Do not hedge every sentence. Per-name fundamental and qualitative labels stay as written — the relative judgment lives only in the Portfolio verdict and Moves.

Practical, not textbook. Use only approved verdict labels from the two skills. Direct. Cut padding. Not advice. INR. Never write the word book — say portfolio.

Output markdown in this order:

## Portfolio verdict
One approved fundamental label for the portfolio (the weight-aware blend of the holdings — not a new third stamp). One qualitative multi-bagger potential label if the skill reads support it; otherwise judge from weights and live numbers without dwelling on Not run. 3–5 sentences: what this portfolio actually is, why the large weights deserve (or do not deserve) their size, and the 3–7 year setup. Actionable. Not a lecture.

## Holdings
A GitHub markdown table, one row per holding in FACTS:

| Name | Weight | Fundamental | Qualitative | Why |

Fundamental and Qualitative copy the skill labels from FACTS (approved verdict labels) or Not run. Why is one line. Never write Not on file.

## What is working
3–5 bullets. Largest quality weights first. A concentrated high-quality name is working, not a problem.

## What is weak
3–5 bullets. Weak / fail / speculative large weights, skill disagreements, and real gaps — not “too concentrated in a compounder”.

## Moves
3 material, weight-aware moves. Each line: action · name · why. Prefer size-up quality / size-down weakness over generic diversification.

Final verdict heading must appear. Prefer silence to invention.

The Portfolio verdict must answer these seven questions with evidence from FACTS — not generic advice:
1. What kind of portfolio is this?
2. Which large positions justify their current weight based on evidence?
3. Which large positions deserve the most scrutiny?
4. Where are sector/business overlaps?
5. Where are the strongest hidden correlations?
6. What are the three most material portfolio-level changes?
7. What should the investor monitor?
`;
/** SkillEngine — wrap fund/qual markdown, extract approved labels, validate, cache keys.
*  Does not rewrite skill-docs. Parser + contract only. */
var FUND_SKILL_ID = "2ce5b3ca20a078a93f616258e9abb21a";
var QUAL_SKILL_ID = "5c920931dd356a8f67ecfd21271fc017";
var SKILL_MODEL = "grok-4.5";
var SKILL_SOURCE_METHOD = "search1";
var FUND_VERDICTS = [
	"High-Conviction Multi-Bagger Candidate",
	"Quality Compounder",
	"Speculative Multi-Bagger",
	"Fair Value Compounder",
	"Limited Asymmetry",
	"Avoid"
];
var QUAL_POTENTIAL = [
	"High Potential Multi-bagger",
	"Moderate to High Potential",
	"Moderate Potential",
	"Low / Speculative Potential",
	"Not Attractive on Qualitative Factors"
];
var QUAL_FINANCIAL = [
	"Financially Strong",
	"Acceptable",
	"Mixed",
	"Weak"
];
var QUAL_FACTORS = [
	"Capacity & Expansion",
	"Product / Business Mix",
	"Order Book & Demand Visibility",
	"Structural / Thematic Tailwinds",
	"Management & Corporate Actions",
	"Operating Leverage & Inflection",
	"Market Positioning"
];
var QUAL_STYLES = [
	"Consistent Compounder",
	"Turnaround-Inflection",
	"Mixed"
];
var FUND_PASS = /* @__PURE__ */ new Set([
	"High-Conviction Multi-Bagger Candidate",
	"Quality Compounder",
	"Fair Value Compounder"
]);
var QUAL_YES = /* @__PURE__ */ new Set(["High Potential Multi-bagger", "Moderate to High Potential"]);
var FUND_SECTIONS = [
	{
		id: "thesis",
		re: /thesis\s*\+?\s*key fundamentals/i
	},
	{
		id: "integrated",
		re: /integrated fundamental analysis/i
	},
	{
		id: "business",
		re: /business\s*\+?\s*compounding engine/i
	},
	{
		id: "changes",
		re: /what changes the story|changes the story\s*\+?\s*valuation/i
	},
	{
		id: "governance",
		re: /governance\s*\+?\s*risks/i
	},
	{
		id: "scorecard",
		re: /scorecard\s*\+?\s*final verdict|final verdict/i
	}
];
var QUAL_SECTIONS = [
	{
		id: "snapshot",
		re: /financial snapshot/i
	},
	{
		id: "factors",
		re: /factor check/i
	},
	{
		id: "positive",
		re: /key positive factors/i
	},
	{
		id: "combos",
		re: /powerful combinations present/i
	},
	{
		id: "style",
		re: /style note/i
	},
	{
		id: "verdict",
		re: /\bverdict\b/i
	},
	{
		id: "rationale",
		re: /\brationale\b/i
	}
];
function fold(s) {
	return s.toLowerCase().replace(/[–—]/g, "-").replace(/[^a-z0-9/+ -]+/g, " ").replace(/\s+/g, " ").trim();
}
function lastIndexNorm(hay, needle) {
	const h = fold(hay);
	const n = fold(needle);
	if (!n) return -1;
	return h.lastIndexOf(n);
}
/** Pick the approved label that appears last in `text`. Prefer the scorecard/verdict slice. */
function lastApproved(text, labels, slice) {
	const body = slice && slice.length > 40 ? slice : text;
	let best = "";
	let bestAt = -1;
	for (const lab of labels) {
		const at = lastIndexNorm(body, lab);
		if (at > bestAt) {
			bestAt = at;
			best = lab;
		}
	}
	if (best) return best;
	if (slice && slice !== text) return lastApproved(text, labels);
	return "";
}
function scorecardSlice(text) {
	const m = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?(?:SCORECARD\s*\+?\s*FINAL VERDICT|Final verdict|Investment verdict)[\s\S]*$/i);
	return m ? m[0] : "";
}
function qualVerdictSlice(text) {
	const m = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?Verdict(?:\*{0,2})?\s*:?[\s\S]*?(?=\n(?:#{1,4}\s+|\*{0,2}Rationale)|\s*$)/i);
	if (m) return m[0];
	const tail = text.match(/(?:#{0,4}\s*)?(?:\*{0,2})?Rationale[\s\S]*$/i);
	const last = (tail ? text.slice(0, text.length - tail[0].length) : text).match(/(?:#{0,4}\s*)?(?:\*{0,2})?Verdict[\s\S]*$/i);
	return last ? last[0] : "";
}
var FUND_NEAR = [
	[/high[-\s]?conviction(?:\s+multi[-\s]?bagger)?/i, "High-Conviction Multi-Bagger Candidate"],
	[/quality compounder/i, "Quality Compounder"],
	[/speculative multi[-\s]?bagger/i, "Speculative Multi-Bagger"],
	[/fair value compounder/i, "Fair Value Compounder"],
	[/limited asymmetry/i, "Limited Asymmetry"],
	[/(?:^|\n|\*| )\s*avoid\b/i, "Avoid"]
];
var QUAL_NEAR = [
	[/high potential multi[-\s]?bagger/i, "High Potential Multi-bagger"],
	[/moderate to high potential/i, "Moderate to High Potential"],
	[/low\s*\/\s*speculative potential|low or speculative|speculative potential/i, "Low / Speculative Potential"],
	[/not attractive on qualitative/i, "Not Attractive on Qualitative Factors"],
	[/moderate potential/i, "Moderate Potential"]
];
function nearMap(text, pairs) {
	let best = "";
	let bestAt = -1;
	for (const [re, lab] of pairs) {
		const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
		const g = new RegExp(re.source, flags);
		let m;
		while (m = g.exec(text)) if (m.index >= bestAt) {
			bestAt = m.index;
			best = lab;
		}
	}
	return best;
}
function extractFundVerdict(text) {
	const slice = scorecardSlice(text);
	const exact = lastApproved(text, FUND_VERDICTS, slice);
	if (exact) return exact;
	return nearMap(slice || text, FUND_NEAR);
}
function extractQualPotential(text) {
	const slice = qualVerdictSlice(text);
	const exact = lastApproved(text, QUAL_POTENTIAL, slice || void 0);
	if (exact) return exact;
	return nearMap(slice || text, QUAL_NEAR);
}
function extractQualFinancial(text) {
	const m = text.match(/financial snapshot[\s\S]{0,400}/i);
	const window = m ? m[0] : text.slice(0, 1200);
	const exact = lastApproved(window, QUAL_FINANCIAL);
	if (exact) return exact;
	if (/financially strong/i.test(window)) return "Financially Strong";
	if (/\bacceptable\b/i.test(window)) return "Acceptable";
	if (/\bmixed\b/i.test(window)) return "Mixed";
	if (/\bweak\b/i.test(window)) return "Weak";
	return "";
}
function headingChunk(text, names) {
	const alt = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
	const re = new RegExp(`(?:^|\\n)(?:#{1,4}\\s*|(?:\\*\\*|__)?)(?:\\d+\\)\\s*)?(?:${alt})(?:\\*\\*|__)?\\s*[:.\\-–]?\\s*\\n+([\\s\\S]*?)(?=\\n(?:#{1,4}\\s+|\\*\\*[A-Z]|###\\s*\\d))`, "i");
	const m = text.match(re);
	if (m) return m[1].trim();
	const line = new RegExp(`(?:${alt})\\s*[:\\-–]\\s*([^\\n]+)`, "i");
	const l = text.match(line);
	return l ? l[1].trim() : "";
}
function extractFundFields(text) {
	const approvedVerdict = extractFundVerdict(text);
	const thesis = (headingChunk(text, [
		"THESIS + KEY FUNDAMENTALS",
		"Thesis + Key Fundamentals",
		"Thesis"
	]) || text).split(/\n+/).map((s) => s.replace(/^[\s*•-]+/, "").trim()).filter((s) => s && !/^#{1,4}\s/.test(s)).slice(0, 4).join(" ").slice(0, 600);
	const scoreM = text.match(/(?:weighted\s+)?score\s*[:*]+\s*(\d+(?:\.\d+)?)/i) || text.match(/(\d(?:\.\d)?)\s*\/\s*10/) || text.match(/\b(\d(?:\.\d)?)\/10\b/);
	const score = scoreM ? Number(scoreM[1]) : null;
	const starsM = text.match(/([★☆⭐]{1,5})/) || text.match(/(\d)\s*(?:\/\s*5)?\s*stars?/i);
	const stars = starsM ? starsM[1] : "";
	const keyConstraint = (text.match(/(?:biggest constraint|key constraint|the constraint)\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() || "";
	const finalCase = (text.match(/(?:the case)\s*[:\-–]\s*([^\n]+(?:\n(?![A-Z#*]).*)?)/i) || [])[1]?.trim() || headingChunk(text, ["The case"]);
	const finalWeakness = (text.match(/(?:the weakness)\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() || headingChunk(text, ["The weakness"]);
	const changeMind = headingChunk(text, [
		"What would change my view",
		"What would change this read",
		"What would change this"
	]) || (text.match(/(?:what would change (?:my view|this read|this))\s*[:\-–]\s*([^\n]+)/i) || [])[1]?.trim() || "";
	return {
		approvedVerdict,
		score: score != null && Number.isFinite(score) ? score : null,
		stars,
		thesis: thesis.slice(0, 600),
		keyConstraint: keyConstraint.slice(0, 280),
		finalCase: String(finalCase || "").slice(0, 400),
		finalWeakness: String(finalWeakness || "").slice(0, 400),
		changeMind: String(changeMind || "").slice(0, 400)
	};
}
function extractQualFields(text) {
	const potentialLabel = extractQualPotential(text);
	const financialClassification = extractQualFinancial(text);
	const factorStatuses = QUAL_FACTORS.map((name) => {
		const re = new RegExp(`\\*{0,2}\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\*{0,2}\\s*[:\\-–]\\s*\\*{0,2}\\s*(Strong|Moderate|Weak|Not Present)\\b\\s*(?:[\\-–—:]\\s*)?([^\\n]*)`, "i");
		const m = text.match(re);
		let status = "";
		if (m) {
			const raw = m[1].toLowerCase();
			status = raw === "not present" ? "Not Present" : raw.slice(0, 1).toUpperCase() + raw.slice(1);
		}
		return {
			name,
			status,
			note: m ? m[2].trim() : ""
		};
	});
	const styleM = text.match(/style note\s*[:\-–*]+\s*([^\n]+)/i);
	let style = "";
	const styleBlob = styleM ? styleM[1] : text;
	for (const s of QUAL_STYLES) if (new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(styleBlob)) {
		style = s;
		break;
	}
	const rationale = headingChunk(text, ["Rationale"]).slice(0, 800) || (text.match(/\*{0,2}Rationale\*{0,2}\s*[:\-–]?\s*\n+([\s\S]+)/i) || [])[1]?.trim().slice(0, 800) || "";
	return {
		approvedVerdict: potentialLabel,
		potentialLabel,
		financialClassification,
		factorStatuses,
		style,
		rationale
	};
}
function isStub(text) {
	const compact = text.replace(/\s+/g, " ").trim();
	if (!compact) return true;
	if (/^(researching|looking up|searching|i am researching|let me research)\b/i.test(compact)) return true;
	if (/\bfor the catalyst framework\.?\s*$/i.test(compact) && compact.length < 900) return true;
	return false;
}
function validateFund(text) {
	const t = String(text || "").trim();
	const missing = [];
	if (!t || t.replace(/\s+/g, " ").length < 400) missing.push("length");
	if (isStub(t)) missing.push("stub");
	for (const s of FUND_SECTIONS) if (!s.re.test(t)) missing.push(s.id);
	const verdict = extractFundVerdict(t);
	if (!verdict) missing.push("verdict");
	if (t.split(/\n/).filter((x) => x.trim()).length < 6) missing.push("lines");
	const ok = missing.length === 0;
	return {
		ok,
		missing,
		verdict,
		reason: ok ? "" : missing.includes("verdict") ? "No approved final verdict" : `Missing ${missing.join(", ")}`
	};
}
function validateQual(text) {
	const t = String(text || "").trim();
	const missing = [];
	if (!t || t.replace(/\s+/g, " ").length < 400) missing.push("length");
	if (isStub(t)) missing.push("stub");
	for (const s of QUAL_SECTIONS) if (!s.re.test(t)) missing.push(s.id);
	const verdict = extractQualPotential(t);
	if (!verdict) missing.push("verdict");
	if (!extractQualFinancial(t)) missing.push("financial");
	if (t.split(/\n/).filter((x) => x.trim()).length < 6) missing.push("lines");
	const ok = missing.length === 0;
	return {
		ok,
		missing,
		verdict,
		reason: ok ? "" : missing.includes("verdict") ? "No approved qualitative verdict" : `Missing ${missing.join(", ")}`
	};
}
function fundRatingOf(verdict) {
	return FUND_PASS.has(verdict) ? "pass" : "fail";
}
function qualPotentialOf(label) {
	return QUAL_YES.has(label) ? "yes" : "no";
}
function isTerminalStatus(s) {
	return s === "Failed" || s === "Invalid" || s === "Timed out" || s === "Rate limited" || s === "Done";
}
function classifySkillError(msg) {
	const m = String(msg || "");
	if (/429|Busy right now|Too many reads|rate.?limit/i.test(m)) return "Rate limited";
	if (/timeout|abort|504|Gateway|took too long/i.test(m)) return "Timed out";
	if (/did not finish|malformed|invalid|no approved/i.test(m)) return "Invalid";
	return "Failed";
}
function skillCacheKey(input) {
	const kind = input.kind;
	if (kind === "fund") return `v23:fund:${FUND_SKILL_ID}:2:xai:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${String(input.symbol || "").toUpperCase()}:${input.date}`;
	if (kind === "qual") return `v23:qual:${QUAL_SKILL_ID}:2:xai:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${String(input.symbol || "").toUpperCase()}:${input.date}`;
	if (kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") return `v23:${kind}:2:xai:${SKILL_MODEL}:${SKILL_SOURCE_METHOD}:${input.extra || input.symbol || ""}:${input.date}`;
	return `v23:${kind}:${input.extra || input.symbol || ""}:${input.date}`;
}
function correctivePrompt(kind, missing) {
	return `Write the COMPLETE analysis now. Do not describe research. Do not write a one-line status. Include every required heading and a Final verdict. ${kind === "fund" ? "THESIS + KEY FUNDAMENTALS; INTEGRATED FUNDAMENTAL ANALYSIS; BUSINESS + COMPOUNDING ENGINE; WHAT CHANGES THE STORY + VALUATION; GOVERNANCE + RISKS; SCORECARD + FINAL VERDICT. Final verdict must be exactly one of: High-Conviction Multi-Bagger Candidate / Quality Compounder / Speculative Multi-Bagger / Fair Value Compounder / Limited Asymmetry / Avoid." : "Financial Snapshot (with Financially Strong / Acceptable / Mixed / Weak); Factor Check (all seven factors); Key Positive Factors; Powerful Combinations Present; Style Note; Verdict (exactly one approved qualitative label); Rationale."}${missing.length ? ` Missing from the last reply: ${missing.join(", ")}.` : ""}`;
}
/** Structured Quality / Spark / Pulse / mix blocks. Client-safe. */
function twoWords(raw) {
	const w = raw.replace(/\btape\b/gi, "session").replace(/[.,/#!$%^&*;:{}=_`~()]/g, " ").split(/\s+/).filter(Boolean).slice(0, 6);
	if (!w.length) return "";
	if (w.length <= 2) return w.map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
	return w.join(" ").slice(0, 48);
}
function str(v) {
	return typeof v === "string" ? v.trim() : "";
}
function list(v, cap = 6) {
	if (Array.isArray(v)) return v.map((x) => str(x)).filter((x) => x.length >= 4).slice(0, cap);
	if (typeof v === "string" && v.trim()) return [v.trim()];
	return [];
}
function paras(text) {
	return text.split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}
function stripTrailingJson(text) {
	const t = String(text || "").trim();
	if (!t) return "";
	const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
	let body = t;
	if (fence) body = t.replace(fence[0], "").trim();
	const start = body.lastIndexOf("\n{");
	if (start > 80) {
		const maybe = body.slice(start + 1).trim();
		try {
			JSON.parse(maybe);
			return body.slice(0, start).trim();
		} catch {}
	}
	if (body.startsWith("{")) try {
		JSON.parse(body);
		return "";
	} catch {
		return body;
	}
	return body;
}
function headingBlock(text, names) {
	const alt = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
	const re = new RegExp(`(?:^|\\n)(?:#{1,4}\\s*|(?:\\*\\*|__)?)(?:${alt})(?:\\*\\*|__)?\\s*[:.\\-–]?\\s*\\n+([\\s\\S]*?)(?=\\n(?:#{1,4}\\s+|\\*\\*[A-Z]))`, "i");
	const m = text.match(re);
	if (m) return m[1].trim();
	const line = new RegExp(`(?:${alt})\\s*[:\\-–]\\s*([^\\n]+)`, "i");
	const l = text.match(line);
	return l ? l[1].trim() : "";
}
function potentialLabelOf(raw) {
	const m = raw.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|none|unlikely|yes|no)/i);
	if (m) {
		const s = m[1].toLowerCase();
		if (s === "medium") return "Moderate";
		if (s === "yes") return "High";
		if (s === "no" || s === "none") return "Unlikely";
		return s.slice(0, 1).toUpperCase() + s.slice(1);
	}
	const m2 = raw.match(/\b(high|moderate|low|unlikely)\s+multi-?bagger/i);
	if (m2) return m2[1].slice(0, 1).toUpperCase() + m2[1].slice(1).toLowerCase();
	return "";
}
function asQuality(v) {
	if (!v) return null;
	if (typeof v === "string") {
		const t = v.trim();
		if (!t) return null;
		const bits = paras(t);
		return {
			headline: bits[0]?.slice(0, 180) || "Quality",
			business: bits.slice(0, 2).join(" "),
			industry: bits[2] || "",
			moat: bits[3] || "",
			price: bits.slice(4, 7),
			cycle: bits[7] || "",
			changeMind: bits.slice(8, 10),
			risks: bits.slice(-2)
		};
	}
	if (typeof v !== "object") return null;
	const o = v;
	const price = list(o.price).length ? list(o.price) : list(o.onPrice);
	const block = {
		headline: str(o.headline).slice(0, 180),
		business: str(o.business),
		industry: str(o.industry),
		moat: str(o.moat) || str(o.position),
		price,
		cycle: str(o.cycle),
		changeMind: list(o.changeMind).length ? list(o.changeMind) : list(o.change_mind),
		risks: list(o.risks)
	};
	if (!block.headline && !block.business && !block.industry && !block.moat && !block.price.length && !block.cycle && !block.changeMind.length && !block.risks.length) return null;
	return block;
}
function asSpark(v) {
	if (!v) return null;
	if (typeof v === "string") {
		const t = v.trim();
		if (!t) return null;
		const bits = paras(t);
		return {
			headline: bits[0]?.slice(0, 180) || "Spark",
			today: bits.slice(0, 2).join(" "),
			headlines: bits.slice(2, 5),
			catalysts: bits.slice(5, 8),
			pricedIn: bits[8] || "",
			noise: bits.at(-1) || ""
		};
	}
	if (typeof v !== "object") return null;
	const o = v;
	const block = {
		headline: str(o.headline).slice(0, 180),
		today: str(o.today),
		headlines: list(o.headlines),
		catalysts: list(o.catalysts),
		pricedIn: str(o.pricedIn) || str(o.priced_in) || str(o.pricedin),
		noise: str(o.noise)
	};
	if (!block.headline && !block.today && !block.headlines.length && !block.catalysts.length && !block.pricedIn && !block.noise) return null;
	return block;
}
function asPulse(v) {
	if (!v || typeof v !== "object") {
		if (typeof v === "string" && v.trim()) {
			const bits = paras(v);
			return {
				headline: bits[0]?.slice(0, 180) || "Pulse",
				market: bits[1] || bits[0] || "",
				breadth: bits[2] || "",
				names: bits.slice(3, 7),
				headlines: bits.slice(7, 10),
				watch: bits.slice(-3)
			};
		}
		return null;
	}
	const o = v;
	return {
		headline: str(o.headline).slice(0, 180),
		market: str(o.market),
		breadth: str(o.breadth),
		names: list(o.names, 8),
		headlines: list(o.headlines, 6),
		watch: list(o.watch, 5)
	};
}
function asMix(v) {
	if (!v || typeof v !== "object") {
		if (typeof v === "string" && v.trim()) {
			const bits = paras(v);
			return {
				headline: bits[0]?.slice(0, 180) || "This portfolio",
				mix: bits.slice(0, 2).join(" "),
				concentration: bits.slice(2, 5),
				largeWeights: bits.slice(5, 8),
				vsIndex: bits[8] || "",
				risks: bits.slice(-2)
			};
		}
		return null;
	}
	const o = v;
	return {
		headline: str(o.headline).slice(0, 180),
		mix: str(o.mix),
		concentration: list(o.concentration),
		largeWeights: list(o.largeWeights).length ? list(o.largeWeights) : list(o.large_weights),
		vsIndex: str(o.vsIndex) || str(o.vs_index),
		risks: list(o.risks)
	};
}
function qualityText(b) {
	return [
		b.headline,
		b.business,
		b.industry,
		b.moat,
		b.price.join(" "),
		b.cycle,
		b.changeMind.join(" "),
		b.risks.join(" ")
	].filter(Boolean).join("\n");
}
function sparkText(b) {
	return [
		b.headline,
		b.today,
		b.headlines.join(" "),
		b.catalysts.join(" "),
		b.pricedIn,
		b.noise
	].filter(Boolean).join("\n");
}
function ratingOf(v) {
	const s = str(v).toLowerCase();
	if (!s) return "fail";
	if (/(not sound|structurally weak|franchise is weak|failing|avoid this)/.test(s)) return "fail";
	if (/(sound|healthy|solid|compounder|constructive|durable|strong franchise|well-capital)/.test(s)) return "pass";
	if (/(^|\b)(pass|passed)\b/.test(s) && !/(fail|failing)/.test(s)) return "pass";
	return "fail";
}
function potentialOf(v, label) {
	const lab = (label || "").toLowerCase();
	if (lab === "high" || lab === "moderate") return "yes";
	if (lab === "low" || lab === "unlikely") return "no";
	const s = str(v).toLowerCase();
	if (!s) return "no";
	if (s === "yes" || s === "pass" || s === "high" || s === "moderate") return "yes";
	if (/(multi-?bagger potential\s*[:\-–]\s*(high|moderate))/.test(s)) return "yes";
	if (/(multi-?bagger)/.test(s) && !/(no |not |fail|fading|unlikely|low potential)/.test(s)) return "yes";
	return "no";
}
function statusOf(v) {
	const s = str(v).toLowerCase();
	if (s === "positive" || s === "pos" || s === "good" || s === "up") return "positive";
	if (s === "negative" || s === "neg" || s === "bad" || s === "down") return "negative";
	if (s === "watch" || s === "caution" || s === "mixed") return "watch";
	return "neutral";
}
function asFund(v) {
	if (!v) return null;
	if (typeof v === "string") {
		const t = stripTrailingJson(v);
		if (!t) return null;
		const bits = paras(t);
		const extracted = extractFundFields(t);
		const approved = extracted.approvedVerdict;
		const verdict = headingBlock(t, [
			"Final verdict",
			"Verdict",
			"Investment verdict",
			"SCORECARD + FINAL VERDICT"
		]) || approved || bits.at(-1) || "";
		return {
			tag: approved || "Open question",
			rating: approved ? fundRatingOf(approved) : ratingOf(verdict),
			snapshot: headingBlock(t, [
				"Company",
				"Snapshot",
				"THESIS + KEY FUNDAMENTALS"
			]) || bits[0] || "",
			business: headingBlock(t, ["Business", "BUSINESS + COMPOUNDING ENGINE"]) || bits[1] || bits[0] || "",
			industry: headingBlock(t, ["Industry position", "Industry"]) || bits[2] || "",
			position: headingBlock(t, [
				"Industry position",
				"Position",
				"Moat"
			]) || bits[3] || "",
			profitability: headingBlock(t, ["Profitability"]) || bits[4] || "",
			balanceSheet: headingBlock(t, ["Balance sheet"]) || bits[5] || "",
			valuation: headingBlock(t, ["Valuation", "WHAT CHANGES THE STORY + VALUATION"]) || bits[6] || "",
			growth: headingBlock(t, ["Growth"]) || bits[7] || "",
			risks: list(headingBlock(t, ["Risks", "GOVERNANCE + RISKS"]).split(/\n+/).filter(Boolean), 4).length ? list(headingBlock(t, ["Risks", "GOVERNANCE + RISKS"]).split(/\n+/), 4) : bits.slice(8, 11),
			changeMind: extracted.changeMind ? [extracted.changeMind] : list(headingBlock(t, [
				"What would change this read",
				"What would change this",
				"What would change my view"
			]).split(/\n+/), 3),
			verdict: approved || verdict,
			prose: t,
			approvedVerdict: approved,
			score: extracted.score,
			stars: extracted.stars,
			thesis: extracted.thesis,
			keyConstraint: extracted.keyConstraint,
			finalCase: extracted.finalCase,
			finalWeakness: extracted.finalWeakness
		};
	}
	if (typeof v !== "object") return null;
	const o = v;
	const prose = str(o.prose) || "";
	const extracted = prose ? extractFundFields(prose) : null;
	const approved = str(o.approvedVerdict) || extracted?.approvedVerdict || "";
	const verdict = approved || str(o.verdict) || str(o.headline);
	const block = {
		tag: approved || twoWords(str(o.tag) || str(o.verdict) || str(o.headline) || "Open question") || "Open question",
		rating: approved ? fundRatingOf(approved) : o.rating != null ? ratingOf(o.rating ?? o.call ?? o.pass) : ratingOf(verdict),
		snapshot: str(o.snapshot) || str(o.company),
		business: str(o.business),
		industry: str(o.industry),
		position: str(o.position) || str(o.moat),
		profitability: str(o.profitability),
		balanceSheet: str(o.balanceSheet) || str(o.balance_sheet),
		valuation: str(o.valuation),
		growth: str(o.growth),
		risks: list(o.risks, 4),
		changeMind: (list(o.changeMind).length ? list(o.changeMind) : list(o.change_mind)).slice(0, 3),
		verdict,
		prose,
		approvedVerdict: approved,
		score: typeof o.score === "number" ? o.score : extracted?.score ?? null,
		stars: str(o.stars) || extracted?.stars || "",
		thesis: str(o.thesis) || extracted?.thesis || "",
		keyConstraint: str(o.keyConstraint) || extracted?.keyConstraint || "",
		finalCase: str(o.finalCase) || extracted?.finalCase || "",
		finalWeakness: str(o.finalWeakness) || extracted?.finalWeakness || ""
	};
	if (!block.snapshot && !block.business && !block.verdict && !block.valuation && !block.prose) return null;
	return block;
}
function asQual(v) {
	if (!v) return null;
	if (typeof v === "string") {
		const t = stripTrailingJson(v);
		if (!t) return null;
		const bits = paras(t);
		const extracted = extractQualFields(t);
		const label = extracted.potentialLabel || potentialLabelOf(t);
		const verdict = extracted.approvedVerdict || headingBlock(t, ["Final verdict", "Verdict"]) || bits.at(-1) || "";
		const allFactors = extracted.factorStatuses.filter((f) => f.status).map((f) => ({
			name: f.name,
			status: statusOf(f.status),
			note: f.note
		}));
		return {
			tag: extracted.approvedVerdict || "Open story",
			potential: extracted.approvedVerdict ? qualPotentialOf(extracted.approvedVerdict) : potentialOf(t, label),
			potentialLabel: extracted.approvedVerdict || label,
			headline: bits[0]?.slice(0, 220) || "Qualitative",
			allFactors,
			positive: bits.slice(1, 4),
			combinations: bits.slice(4, 6),
			catalysts: bits.slice(6, 8),
			pricedIn: headingBlock(t, ["Already in the price", "Priced in"]) || bits[8] || "",
			noise: headingBlock(t, ["Noise"]) || bits[9] || "",
			verdict,
			prose: t,
			approvedVerdict: extracted.approvedVerdict,
			financialClassification: extracted.financialClassification,
			factorStatuses: allFactors,
			style: extracted.style,
			rationale: extracted.rationale
		};
	}
	if (typeof v !== "object") return null;
	const o = v;
	const allFactors = (Array.isArray(o.allFactors) ? o.allFactors : Array.isArray(o.all_factors) ? o.all_factors : []).map((item) => {
		if (typeof item === "string") return {
			name: item.slice(0, 48),
			status: "neutral",
			note: item
		};
		if (!item || typeof item !== "object") return null;
		const f = item;
		const name = str(f.name) || str(f.factor);
		if (!name) return null;
		return {
			name: name.slice(0, 48),
			status: statusOf(f.status || f.tone),
			note: str(f.note) || str(f.why)
		};
	}).filter((x) => Boolean(x)).slice(0, 16);
	const prose = str(o.prose);
	const extracted = prose ? extractQualFields(prose) : null;
	const approved = str(o.approvedVerdict) || extracted?.potentialLabel || "";
	const label = approved || str(o.potentialLabel) || potentialLabelOf(prose || str(o.verdict) || str(o.headline) || str(o.potential));
	const block = {
		tag: approved || twoWords(str(o.tag) || str(o.headline) || str(o.verdict) || "Open story"),
		potential: approved ? qualPotentialOf(approved) : potentialOf(o.potential ?? o.multibagger ?? o.multiBagger ?? prose, label),
		potentialLabel: approved || label,
		headline: str(o.headline).slice(0, 220),
		allFactors: allFactors.length ? allFactors : extracted?.factorStatuses?.filter((f) => f.status).map((f) => ({
			name: f.name,
			status: statusOf(f.status),
			note: f.note
		})) || [],
		positive: (list(o.positive, 4).length ? list(o.positive, 4) : list(o.positiveFactors, 4)).slice(0, 4),
		combinations: list(o.combinations, 3),
		catalysts: list(o.catalysts, 3),
		pricedIn: str(o.pricedIn) || str(o.priced_in),
		noise: str(o.noise),
		verdict: approved || str(o.verdict),
		prose,
		approvedVerdict: approved,
		financialClassification: str(o.financialClassification) || extracted?.financialClassification || "",
		factorStatuses: allFactors.length ? allFactors : void 0,
		style: str(o.style) || extracted?.style || "",
		rationale: str(o.rationale) || extracted?.rationale || ""
	};
	if (!block.headline && !block.allFactors.length && !block.positive.length && !block.combinations.length && !block.verdict && !block.prose) return null;
	return block;
}
/** True only when the model actually wrote the skill — not a research stub. */
function skillOutputReady(kind, text) {
	const t = String(text || "").trim();
	if (!t) return false;
	if (kind === "fund") return validateFund(t).ok;
	if (kind === "qual") return validateQual(t).ok;
	return false;
}
function fundText(b) {
	if (b.prose && b.prose.length > 80) return b.prose;
	return [
		b.tag,
		b.verdict,
		b.snapshot,
		b.business,
		b.industry,
		b.position,
		b.profitability,
		b.balanceSheet,
		b.valuation,
		b.growth,
		b.risks.join(" "),
		b.changeMind.join(" ")
	].filter(Boolean).join("\n");
}
function qualText(b) {
	if (b.prose && b.prose.length > 80) return b.prose;
	return [
		b.tag,
		b.headline,
		b.potentialLabel ? `Multi-bagger potential: ${b.potentialLabel}` : "",
		b.verdict,
		b.positive.join(" "),
		b.combinations.join(" "),
		b.catalysts.join(" "),
		b.pricedIn,
		b.noise
	].filter(Boolean).join("\n");
}
function asStructure(v) {
	if (!v) return null;
	const biasOf = (raw) => {
		const s = raw.toLowerCase();
		if (s.includes("down") || s.includes("bear") || s.includes("weak")) return "down";
		if (s.includes("range") || s.includes("side") || s.includes("chop")) return "range";
		if (s.includes("up") || s.includes("bull") || s.includes("long")) return "up";
		return "range";
	};
	if (typeof v === "string") {
		const t = v.trim();
		if (!t) return null;
		const bits = paras(t);
		return {
			tag: twoWords(bits[0] || "Open structure"),
			bias: biasOf(bits[1] || bits[0] || ""),
			setup: bits.slice(1, 3).join(" "),
			levels: bits.slice(3, 6),
			support: [],
			resistance: [],
			swings: [],
			mtf: [],
			invalidation: bits[6] || "",
			verdict: bits.at(-1) || ""
		};
	}
	if (typeof v !== "object") return null;
	const o = v;
	const levelRows = (raw) => {
		if (!Array.isArray(raw)) return [];
		return raw.map((item) => {
			if (typeof item === "string") {
				const n = Number(item.replace(/[^\d.]/g, ""));
				return n > 0 ? {
					price: n,
					note: item
				} : null;
			}
			if (!item || typeof item !== "object") return null;
			const r = item;
			const price = Number(r.price || r.level || 0);
			const note = str(r.note) || str(r.label) || (price ? String(price) : "");
			if (!(price > 0) && !note) return null;
			return {
				price,
				note
			};
		}).filter((x) => Boolean(x)).slice(0, 6);
	};
	const swingRows = (raw) => {
		if (!Array.isArray(raw)) return [];
		return raw.map((item) => {
			if (typeof item === "string") return {
				label: item.slice(0, 8),
				price: 0
			};
			if (!item || typeof item !== "object") return null;
			const r = item;
			return {
				label: str(r.label) || str(r.kind) || "H",
				price: Number(r.price) || 0
			};
		}).filter((x) => Boolean(x)).slice(0, 10);
	};
	const block = {
		tag: twoWords(str(o.tag) || str(o.headline) || str(o.verdict) || "Open structure"),
		bias: biasOf(str(o.bias) || str(o.direction) || str(o.tag)),
		setup: str(o.setup) || str(o.read),
		levels: list(o.levels, 6),
		support: levelRows(o.support),
		resistance: levelRows(o.resistance),
		swings: swingRows(o.swings),
		mtf: list(o.mtf, 6).length ? list(o.mtf, 6) : list(o.confluence, 6),
		invalidation: str(o.invalidation) || str(o.invalid),
		verdict: str(o.verdict) || str(o.headline)
	};
	if (!block.tag && !block.setup && !block.verdict) return null;
	return block;
}
function structureText(b) {
	return [
		b.tag,
		b.bias,
		b.setup,
		b.levels.join(" "),
		b.support.map((x) => x.note || String(x.price)).join(" "),
		b.resistance.map((x) => x.note || String(x.price)).join(" "),
		b.swings.map((x) => x.label).join(" "),
		b.mtf.join(" "),
		b.invalidation,
		b.verdict
	].filter(Boolean).join("\n");
}
var cache$1 = /* @__PURE__ */ new Map();
var DAY = 216e5;
function n(v, f) {
	return v == null || !Number.isFinite(v) ? "n/a" : f(v);
}
async function stockFacts(symbol) {
	const pack = await fetchOhlc(symbol, "max", "1d");
	const name = pack.name || universeName(symbol);
	const [news, fund] = await Promise.all([fetchNews(symbol, name), fetchFundamentals(symbol)]);
	const s = snapshotStats(pack);
	const listed = pack.firstTrade ? (/* @__PURE__ */ new Date(pack.firstTrade * 1e3)).toISOString().slice(0, 10) : "n/a";
	const biz = businessOf(symbol);
	const metal = metalKey(symbol);
	const lastUnit = metal ? " " + METALS[metal].displayLabel : "";
	return [
		`Ticker: ${symbol.replace(/\.(NS|BO)$/i, "")}`,
		`Name: ${name}`,
		`Exchange: ${pack.exchange || "NSE"} ${pack.currency}`,
		`Sector (our map): ${sectorOf(symbol)} · ${capOf(symbol)}`,
		`Last: ${fmtPx(pack.price)}${lastUnit} (${fmtPct(pack.changePct)} vs prev close)`,
		`Day range: ${fmtPx(pack.dayLow)} – ${fmtPx(pack.dayHigh)}`,
		`52w: ${fmtPx(pack.low52)} – ${fmtPx(pack.high52)} · off high ${n(s.offHigh, (x) => x.toFixed(1) + "%")}`,
		`Volume: ${fmtVol(pack.volume)} vs 20d avg ${fmtVol(s.volAvg)}`,
		`Returns: 1W ${n(s.ret1w, (x) => x.toFixed(1) + "%")} · 1M ${n(s.ret1m, (x) => x.toFixed(1) + "%")} · 3M ${n(s.ret3m, (x) => x.toFixed(1) + "%")} · 1Y ${n(s.ret1y, (x) => x.toFixed(1) + "%")}`,
		`RSI14 ${n(s.rsi, (x) => x.toFixed(1))} · MA20 ${n(s.ma20, fmtPx)} · MA50 ${n(s.ma50, fmtPx)} · MA200 ${n(s.ma200, fmtPx)}`,
		pack.firstTrade ? `First listed print on file: ${listed}` : "First listed print: Not reliably available",
		biz ? `Business on file: ${biz.what} ${biz.makes} ${biz.cycle}${biz.products ? " Products: " + biz.products : ""}` : "Business on file: none — pull from primary sources",
		fundLines(fund),
		"Headlines on file:",
		...news.slice(0, 8).map((x) => `- ${x.title} (${x.publisher})`) || ["- none"]
	].join("\n");
}
async function pulseFacts() {
	const [tape, screen, news] = await Promise.all([
		fetchTape(),
		fetchScreener(),
		fetchNews("NIFTY", "Nifty Sensex Indian stock market")
	]);
	const up = [...screen].sort((a, b) => b.changePct - a.changePct).slice(0, 8);
	const down = [...screen].sort((a, b) => a.changePct - b.changePct).slice(0, 8);
	const hot = [...screen].filter((r) => (r.volRatio ?? 0) >= 1.4).sort((a, b) => (b.volRatio ?? 0) - (a.volRatio ?? 0)).slice(0, 6);
	const high = screen.filter((r) => r.offHigh != null && r.offHigh >= -5).sort((a, b) => (b.offHigh ?? 0) - (a.offHigh ?? 0)).slice(0, 6);
	const green = screen.filter((r) => r.changePct >= 0).length;
	return [
		"Indices:",
		...tape.map((t) => `- ${t.label}: ${fmtPx(t.price)}${t.unit ? " " + t.unit : ""} (${fmtPct(t.changePct)})`),
		`Breadth on these names: ${green}/${screen.length} green`,
		"Winners:",
		...up.map((r) => `- ${r.symbol} ${r.name} ${fmtPct(r.changePct)} RSI ${n(r.rsi, (x) => x.toFixed(0))}`),
		"Losers:",
		...down.map((r) => `- ${r.symbol} ${r.name} ${fmtPct(r.changePct)}`),
		"Volume spike:",
		...hot.map((r) => `- ${r.symbol} vol ${n(r.volRatio, (x) => x.toFixed(1) + "×")}`),
		"Near 52w high:",
		...high.map((r) => `- ${r.symbol} off high ${n(r.offHigh, (x) => x.toFixed(1) + "%")}`),
		"Headlines:",
		...news.slice(0, 10).map((x) => `- ${x.title} (${x.publisher})`)
	].join("\n");
}
async function bookFacts(book) {
	const screen = await fetchScreener().catch(() => []);
	const map = new Map(screen.map((r) => [r.symbol.toUpperCase(), r]));
	const byStem = new Map(screen.map((r) => [r.symbol.toUpperCase().replace(/[-_]SM$/i, ""), r]));
	const lineFor = async (h) => {
		const key = h.symbol.toUpperCase();
		const stem = key.replace(/[-_]SM$/i, "");
		const r = map.get(key) || map.get(stem) || byStem.get(stem);
		const w = `${(h.weight * 100).toFixed(1)}%`;
		const fundLabel = h.fundApproved || h.fundTag;
		const qualLabel = h.qualApproved || h.qualTag;
		const fundState = String(h.fundStatus || "");
		const qualState = String(h.qualStatus || "");
		const skills = `${fundLabel ? `Fundamental: ${fundLabel}${h.fundRating ? ` (${h.fundRating})` : ""}${h.fundVerdict ? ` — ${h.fundVerdict.replace(/\s+/g, " ").slice(0, 220)}` : ""}` : fundState && fundState !== "Not started" && fundState !== "Done" ? `Fundamental: ${fundState}` : "Fundamental: Not run"} · ${qualLabel ? `Qualitative: ${qualLabel}${h.qualPotential ? ` (${h.qualPotential})` : ""}${h.qualVerdict ? ` — ${h.qualVerdict.replace(/\s+/g, " ").slice(0, 220)}` : ""}` : qualState && qualState !== "Not started" && qualState !== "Done" ? `Qualitative: ${qualState}` : "Qualitative: Not run"}`;
		if (r) return `- ${h.symbol} ${w} · ${h.sector} · last ${fmtPx(r.price)} ${fmtPct(r.changePct)} 1M ${n(r.ret1m, (x) => x.toFixed(1) + "%")} 1Y ${n(r.ret1y, (x) => x.toFixed(1) + "%")} PE ${n(r.pe, (x) => x.toFixed(1))} ROE ${n(r.roe, (x) => x.toFixed(0) + "%")} D/E ${n(r.de, (x) => x.toFixed(2))} sales ${n(r.salesYoY, (x) => x.toFixed(0) + "%")} · ${skills}`;
		try {
			const [ohlc, fund] = await Promise.all([fetchOhlc(h.symbol, "1y", "1d").catch(() => null), fetchFundamentals(h.symbol).catch(() => null)]);
			const px = ohlc && ohlc.price > 0 ? `last ${fmtPx(ohlc.price)} ${fmtPct(ohlc.changePct)}` : "last n/a";
			const f = fund ? `PE ${n(fund.pe, (x) => x.toFixed(1))} ROE ${n(fund.roe, (x) => x.toFixed(0) + "%")} D/E ${n(fund.de, (x) => x.toFixed(2))} sales ${n(fund.salesYoY, (x) => x.toFixed(0) + "%")}` : "";
			return `- ${h.symbol} ${w} · ${h.sector} · ${px}${f ? " · " + f : ""} · ${skills}`;
		} catch {
			return `- ${h.symbol} ${w} · ${h.sector} · ${skills}`;
		}
	};
	const names = book.names;
	const body = [];
	for (let i = 0; i < names.length; i += 6) {
		const chunk = names.slice(i, i + 6);
		body.push(...await Promise.all(chunk.map(lineFor)));
	}
	return [
		`Portfolio: ${book.name}`,
		`Benchmark preference: ${book.bench}`,
		"Current portfolio (weights only — no quantities or cost).",
		"Skill labels in FACTS are already-run outputs — copy them. If a skill was not run, write Not run in the holdings table only. Never write Unscreened, book, or Not on file. Do not centre the Portfolio verdict on missing qualitative reads.",
		...body
	].join("\n");
}
var JSON_RULES = `Return STRICT JSON only. No markdown fences. Short, crisp sentences. One idea per bullet. Do not invent PE, ROE, promoter %, book value, or last-quarter sales — if a number is not in FACTS, omit it. Cite FACTS numbers when you use them. Not advice. INR. No emoji. No hedging filler. Never write the word "tape" — say last price, chart, or session. Never write the word "mix" — say portfolio or holdings.`;
var QUALITY = `You are Quality — a 30-second desk note on an Indian listed company. Simpler than the full fundamental skill.
${JSON_RULES}
{"headline":"one-line business verdict","business":"2 short sentences: what it sells and how cash is made","industry":"1 short sentence","moat":"1 short sentence, or 'No obvious moat.'","price":["1-2 bullets: last, 1M/1Y or 52w place from FACTS"],"cycle":"1 sentence","changeMind":["1-2 concrete facts that would change the read"],"risks":["2 open risks"]}
Keep it scannable. Full depth lives in Fundamental analysis.`;
var SPARK = `You are Spark — a 30-second catalyst note. Simpler than the full qualitative skill.
${JSON_RULES}
{"headline":"what is actually happening today","today":"2 short sentences on last move and volume — cite FACTS","headlines":["only headlines that fit this ticker, or one item: none that fit"],"catalysts":["1-2 things that would be a real move"],"pricedIn":"one short sentence on what the price already knows","noise":"one short sentence on what to ignore"}
Full qualitative depth lives in Qualitative analysis.`;
var ASK = `You are Kosh. Answer the question about this Indian listed name.
Use FACTS for live numbers and fundamentals. Do not invent numbers that are not in FACTS.
Write 2-5 short paragraphs. One idea per paragraph. Not advice. INR. No emoji. No JSON.`;
var PULSE = `You are Pulse, Kosh's morning desk for the Indian cash market.
${JSON_RULES}
{"headline":"one line on the session","market":"2 sentences on indices and gold/silver if in FACTS","breadth":"one sentence with the green/total number from FACTS","names":["3-6 names that actually moved, with the FACTS number"],"headlines":["headlines vs last price, or none"],"watch":["2-4 things into the next session"]}`;
var BOOK = `You are Quality reading an Indian portfolio. FACTS has today's weights only.
${JSON_RULES}
{"headline":"one line on what this portfolio is","mix":"2 sentences on the actual weights","concentration":["2-4 bullets on sector/name bets"],"largeWeights":["what the live prices are doing on the large weights, cite FACTS"],"vsIndex":"how this kind of portfolio usually behaves versus Nifty","risks":["2-4 open risks"]}`;
var DESK = `You are Quality and Spark in one pass — two short 30-second cards for an Indian listed name.
${JSON_RULES}
{"quality":{"headline":"","business":"2 short sentences","industry":"1 sentence","moat":"1 sentence","price":["1-2 FACTS bullets"],"cycle":"1 sentence","changeMind":["1 item"],"risks":["2 items"]},"spark":{"headline":"","today":"2 short sentences","headlines":[],"catalysts":["1-2 items"],"pricedIn":"1 sentence","noise":"1 sentence"}}
Quality is the business. Spark is what is moving it now. Keep each field short. No empty filler.`;
var HOLDINGS = `You are Quality and Spark for each name in an Indian portfolio. FACTS has today's weights only.
${JSON_RULES}
{"notes":[{"symbol":"TCS","quality":{"headline":"","business":"","industry":"","moat":"","price":[],"cycle":"","changeMind":[],"risks":[]},"spark":{"headline":"","today":"","headlines":[],"catalysts":[],"pricedIn":"","noise":""}}]}
One object per ticker in FACTS. Headline + short fields. Price bullets 2. Risks 2. Spark today is 1-2 sentences.`;
var FUND = fundSystem();
var QUAL = qualSystem();
var COMBINE = COMBINE_SKILL;
var IMPROVE = IMPROVE_SKILL;
var STRUCTURE = `You read the chart structure of an Indian listed name. MODE in FACTS is one of Intraday, Swing, Positional, or Chart TF. Read THAT horizon only. Think of the header as "{Mode} · {interval}". SHORT. Two-word call first. Not a buy/sell. Not advice.
${JSON_RULES}
Use the CHART FACTS: mode, interval, lookback, last, RSI, fractal swings (HH/HL/LH/LL), clustered support/resistance, and weekly confluence. Do not invent prices. Comment on the listed levels. If a level is not in FACTS, omit it. Do not mix timeframes.
{"tag":"EXACTLY two words. Capitalise each. Examples: Trend intact, Range bound, Breakout watch, Weak close, Tight coil, Support holding","bias":"up, down, or range","setup":"1-2 sentences citing FACTS last / RSI / HH-HL on this mode and timeframe","support":[{"price":0,"note":"why this level from FACTS"}],"resistance":[{"price":0,"note":"why this level from FACTS"}],"swings":[{"label":"HH","price":0}],"mtf":["one line on weekly confluence from FACTS"],"levels":["short FACTS levels"],"invalidation":"1 sentence what would kill this read","verdict":"2 sentences max. Not a buy/sell."}
tag is the first thing the reader sees. Make it the actual call. Tables not paragraphs.`;
var PICKS = `You tag Indian listed names for a quality board. Two-word fund tag and two-word qualitative tag each. SHORT.
${JSON_RULES}
{"notes":[{"symbol":"TCS","fund":"Cash compounder","qual":"Quiet compounder","why":"one sentence from FACTS"}]}
One object per ticker in FACTS. fund and qual are EXACTLY two words. Capitalise each. Do not invent PE, ROE, sales. If a number is missing, skip it. Not a buy/sell.`;
var SCREEN_BUILD = `You build a Kosh stock screener from the user's words and/or a screenshot of criteria.
Kosh can filter these live fields on a Nifty-heavy universe:
Price action: changePct, ret1m, ret3m, ret1y, offHigh (percent from 52w high, 0 = at high, -20 = 20% below), rsi (14), volRatio (today vs 20d avg), above50 (bool), above200 (bool), macdBull (bool, MACD histogram > 0), bbLow (bool, price in lower 20% of Bollinger).
Fundamentals when on file: pe, pb, peg, roe, roce, opm, de (debt/equity), interestCover, cfoPat, mcapCr (₹ Cr), divYield (%), salesYoY (%), salesCagr3, profitCagr3, profitCagr5, promoters, pledge, fii, dii.
Sectors: Financials, IT, Energy, Auto, FMCG, Healthcare, Telecom, Materials, Industrials, Consumer, Realty, Other, Commodities.
If a requested metric is not in this list, do not map it. Set "unsupported" to the metric name and "closest" to the nearest field above. Leave every filter null.
Return STRICT JSON only:
{"name":"short label","hint":"one sentence of what you built","unsupported":null,"closest":null,"changePctMin":null,"changePctMax":null,"ret1mMin":null,"ret1mMax":null,"ret3mMin":null,"ret3mMax":null,"ret1yMin":null,"ret1yMax":null,"offHighMin":null,"offHighMax":null,"rsiMin":null,"rsiMax":null,"volRatioMin":null,"above50":null,"above200":null,"peMin":null,"peMax":null,"pbMin":null,"pbMax":null,"roeMin":null,"roeMax":null,"deMin":null,"deMax":null,"mcapMin":null,"mcapMax":null,"divMin":null,"divMax":null,"salesYoYMin":null,"salesYoYMax":null,"macdBull":null,"bbLow":null,"sectors":[],"sort":"changePct","sortDir":"desc"}
Use numbers or null. above50/above200/macdBull/bbLow: true, false, or null. sort is one of name,price,changePct,ret1m,ret3m,ret1y,offHigh,rsi,vol,pe,pb,roe,de,mcapCr,divYield,salesYoY.
JSON only.`;
function systemFor(kind) {
	if (kind === "quality") return QUALITY;
	if (kind === "spark") return SPARK;
	if (kind === "pulse") return PULSE;
	if (kind === "book") return BOOK;
	if (kind === "desk") return DESK;
	if (kind === "holdings") return HOLDINGS;
	if (kind === "fund") return FUND;
	if (kind === "qual") return QUAL;
	if (kind === "combine") return COMBINE;
	if (kind === "improve") return IMPROVE;
	if (kind === "structure") return STRUCTURE;
	if (kind === "picks") return PICKS;
	return ASK;
}
function parseJson(text) {
	const trimmed = text.trim();
	const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	const raw = fence ? fence[1] : trimmed;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(raw.slice(start, end + 1));
	} catch {
		return null;
	}
}
async function chat(apiKey, system, user, maxTokens, temperature = .2, search = false) {
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${apiKey}`
	};
	const readAssistant = (json) => {
		if (typeof json.output_text === "string" && json.output_text.trim()) return json.output_text.trim();
		const output = json.output;
		if (Array.isArray(output)) {
			const chunks = [];
			for (const item of output) {
				const row = item;
				if (typeof row.text === "string") chunks.push(row.text);
				if (Array.isArray(row.content)) for (const c of row.content) {
					const part = c;
					if (typeof part.text === "string") chunks.push(part.text);
				}
			}
			if (chunks.length) return chunks.join("\n").trim();
		}
		return json.choices?.[0]?.message?.content?.trim() || "";
	};
	const post = async (url, body, ms = 9e4) => {
		const res = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(ms)
		});
		const raw = await res.text();
		return {
			ok: res.ok,
			status: res.status,
			raw
		};
	};
	const messages = [{
		role: "system",
		content: system
	}, {
		role: "user",
		content: user
	}];
	if (search) {
		let hit = await post("https://api.x.ai/v1/responses", {
			model: "grok-4.5",
			temperature,
			max_output_tokens: maxTokens,
			input: messages,
			tools: [{ type: "web_search" }]
		}, 12e4);
		if (!hit.ok && (hit.status === 400 || hit.status === 422 || hit.status === 404)) hit = await post("https://api.x.ai/v1/chat/completions", {
			model: "grok-4.5",
			temperature,
			max_tokens: maxTokens,
			messages
		});
		if (!hit.ok) throw new Error(xaiError(hit.status, hit.raw));
		let parsed = {};
		try {
			parsed = JSON.parse(hit.raw);
		} catch {
			throw new Error("The analysis returned an unreadable reply.");
		}
		return readAssistant(parsed);
	}
	let hit = await post("https://api.x.ai/v1/chat/completions", {
		model: "grok-4.5",
		temperature,
		max_tokens: maxTokens,
		messages
	});
	if (!hit.ok && (hit.status === 410 || hit.status === 404 || hit.status === 400 || hit.status === 422)) hit = await post("https://api.x.ai/v1/responses", {
		model: "grok-4.5",
		temperature,
		max_output_tokens: maxTokens,
		input: messages
	});
	if (!hit.ok) throw new Error(xaiError(hit.status, hit.raw));
	let parsed = {};
	try {
		parsed = JSON.parse(hit.raw);
	} catch {
		throw new Error("Grok returned an unreadable reply.");
	}
	return readAssistant(parsed);
}
function xaiError(status, body) {
	if (/<!DOCTYPE|Gateway time-out|Error code 504|cf-error/i.test(body)) return "The analysis took too long. Retry — a second pass is usually faster.";
	const snippet = body.replace(/\s+/g, " ").slice(0, 180);
	if (status === 504 || status === 502) return "The analysis took too long. Retry.";
	if (status === 410) return "The analysis endpoint is updating. Retry.";
	if (status === 429) return "Busy right now. Wait a minute and retry.";
	if (status === 402 || status === 403) return "Analysis credits are exhausted.";
	return snippet ? `Analysis error ${status}` : `Analysis error ${status}`;
}
function fromParsed(kind, parsed, raw) {
	let qualityBlock = null;
	let sparkBlock = null;
	let pulseBlock = null;
	let mixBlock = null;
	let fundBlock = null;
	let qualBlock = null;
	let structureBlock = null;
	let pickNotes;
	let notes;
	if (kind === "desk" && parsed) {
		qualityBlock = asQuality(parsed.quality);
		sparkBlock = asSpark(parsed.spark);
	} else if (kind === "quality") qualityBlock = asQuality(parsed || raw);
	else if (kind === "spark") sparkBlock = asSpark(parsed || raw);
	else if (kind === "pulse") pulseBlock = asPulse(parsed || raw);
	else if (kind === "book") mixBlock = asMix(parsed || raw);
	else if (kind === "fund") fundBlock = asFund(raw);
	else if (kind === "qual") qualBlock = asQual(raw);
	else if (kind === "combine" || kind === "improve") {} else if (kind === "structure") structureBlock = asStructure(parsed || raw);
	else if (kind === "picks" && parsed && Array.isArray(parsed.notes)) pickNotes = parsed.notes.map((item) => {
		const o = item;
		return {
			symbol: String(o.symbol || "").toUpperCase(),
			fund: String(o.fund || "").slice(0, 40),
			qual: String(o.qual || "").slice(0, 40),
			why: String(o.why || "").slice(0, 180)
		};
	}).filter((x) => x.symbol);
	else if (kind === "holdings" && parsed && Array.isArray(parsed.notes)) notes = parsed.notes.map((item) => {
		const o = item;
		const qb = asQuality(o.quality);
		const sb = asSpark(o.spark);
		return {
			symbol: String(o.symbol || ""),
			quality: qb ? qualityText(qb) : typeof o.quality === "string" ? o.quality : "",
			spark: sb ? sparkText(sb) : typeof o.spark === "string" ? o.spark : "",
			qualityBlock: qb,
			sparkBlock: sb
		};
	}).filter((x) => x.symbol);
	const quality = qualityBlock ? qualityText(qualityBlock) : void 0;
	const spark = sparkBlock ? sparkText(sparkBlock) : void 0;
	return {
		text: quality || spark ? [quality ? `Quality\n${quality}` : "", spark ? `Spark\n${spark}` : ""].filter(Boolean).join("\n\n") : notes?.length ? notes.map((x) => `${x.symbol}\nQuality: ${x.quality}\nSpark: ${x.spark}`).join("\n\n") : pulseBlock ? [
			pulseBlock.headline,
			pulseBlock.market,
			pulseBlock.breadth,
			...pulseBlock.names
		].filter(Boolean).join("\n") : mixBlock ? [
			mixBlock.headline,
			mixBlock.mix,
			mixBlock.vsIndex
		].filter(Boolean).join("\n") : fundBlock ? fundBlock.prose || fundText(fundBlock) : qualBlock ? qualBlock.prose || qualText(qualBlock) : structureBlock ? structureText(structureBlock) : pickNotes?.length ? pickNotes.map((x) => `${x.symbol}: ${x.fund} / ${x.qual}`).join("\n") : raw,
		quality,
		spark,
		qualityBlock,
		sparkBlock,
		pulseBlock,
		mixBlock,
		fundBlock,
		qualBlock,
		structureBlock,
		pickNotes,
		notes
	};
}
function jsonKindOk(kind, parsed) {
	if (!parsed) return false;
	const head = (v) => {
		if (!v || typeof v !== "object") return false;
		const h = v.headline;
		return typeof h === "string" && h.trim().length > 0;
	};
	if (kind === "pulse" || kind === "book" || kind === "quality" || kind === "spark") return typeof parsed.headline === "string" && parsed.headline.trim().length > 0;
	if (kind === "structure") return typeof parsed.tag === "string" && parsed.tag.trim().length > 0 && typeof parsed.verdict === "string" && parsed.verdict.trim().length > 0;
	if (kind === "desk") return head(parsed.quality) || head(parsed.spark);
	if (kind === "picks" || kind === "holdings") return Array.isArray(parsed.notes) && parsed.notes.length > 0;
	return true;
}
var JSON_KINDS = /* @__PURE__ */ new Set([
	"quality",
	"spark",
	"pulse",
	"book",
	"desk",
	"holdings",
	"structure",
	"picks"
]);
async function executeNote(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const kind = input.kind;
	const symbol = String(input.symbol || "").slice(0, 24);
	const question = String(input.question || "").slice(0, 400);
	if (kind !== "pulse" && kind !== "book" && kind !== "holdings" && kind !== "picks" && kind !== "combine" && kind !== "improve" && !symbol) return {
		ok: false,
		error: "No ticker"
	};
	if (kind === "combine" && !(input.prior?.fund && input.prior?.qual) && !symbol) return {
		ok: false,
		error: "Need both skill outputs"
	};
	if (kind === "combine") {
		const fundOk = skillOutputReady("fund", String(input.prior?.fund || ""));
		const qualOk = skillOutputReady("qual", String(input.prior?.qual || ""));
		if (!fundOk || !qualOk) return {
			ok: false,
			error: "Need both complete skill outputs"
		};
	}
	if ((kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") && !input.book?.names?.length) return {
		ok: false,
		error: "Empty portfolio"
	};
	const day = input.fresh ? "f" + String(input.fresh) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const portfolioExtra = kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve" ? (input.book?.names || []).map((h) => kind === "improve" ? `${h.symbol}:${h.weight}:${h.fundApproved || h.fundTag || ""}:${h.qualApproved || h.qualTag || ""}:${h.fundStatus || ""}:${h.qualStatus || ""}` : `${h.symbol}:${h.weight}`).join(",") : "";
	const cacheKey = kind === "fund" || kind === "qual" || kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve" ? skillCacheKey({
		kind,
		symbol: symbol.toUpperCase(),
		date: day,
		extra: portfolioExtra || void 0
	}) : `v23:` + (kind === "pulse" ? `pulse:${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}` : kind === "structure" ? `structure:${symbol.toUpperCase()}:${input.chart?.mode || ""}:${input.chart?.interval || ""}:${input.chart?.lookback || ""}:${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}` : kind === "combine" ? `combine:${symbol.toUpperCase()}:${String(input.prior?.fund || "").length}:${String(input.prior?.qual || "").length}:${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}` : `${kind}:${symbol.toUpperCase()}:${kind === "ask" ? question : day}`);
	const hit = cache$1.get(cacheKey);
	if (hit && Date.now() - hit.at < DAY) {
		if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, hit.text)) cache$1.delete(cacheKey);
		else return {
			ok: true,
			cached: true,
			...fromParsed(kind, kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? null : parseJson(hit.text), hit.text)
		};
	}
	let blob = "";
	if (kind === "combine") blob = `FUNDAMENTAL SKILL OUTPUT:\n${String(input.prior?.fund || "").slice(0, 12e3)}\n\nQUALITATIVE SKILL OUTPUT:\n${String(input.prior?.qual || "").slice(0, 12e3)}`;
	else if (kind === "pulse") blob = await pulseFacts();
	else if ((kind === "book" || kind === "holdings" || kind === "picks" || kind === "improve") && input.book) blob = await bookFacts(input.book);
	else blob = await stockFacts(symbol);
	if (input.chart) {
		const c = input.chart;
		const swingLines = (c.swings || []).slice(0, 12).map((s) => `- ${s.label} ${s.price}`).join("\n");
		const levelLines = (c.levels || []).slice(0, 8).map((l) => `- ${l.price} n=${l.n} ${l.labels.join(",")}`).join("\n");
		const mtfLines = (c.mtf || []).slice(0, 6).map((l) => `- ${l.price} ${l.labels.join(",")}`).join("\n");
		blob += `\n\nCHART (read this horizon only — MODE ${c.mode || "chart"} · ${c.interval || "n/a"}):\nMode: ${c.mode || "chart"}\nInterval: ${c.interval || "n/a"}\nLast on this chart: ${c.last ?? "n/a"}\nRSI on this chart: ${c.rsi ?? "n/a"}\nFractal swings:\n${swingLines || "- none"}\nClustered S/R:\n${levelLines || "- none"}\nWeekly confluence:\n${mtfLines || "- none"}`;
	}
	const ticker = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const name = ticker ? universeName(ticker) : "";
	const user = kind === "ask" ? `QUESTION:\n${question || "What matters on this name?"}\n\nCompany data:\n${blob}` : kind === "fund" ? `Write the full equity-fundamental-analysis of ${name} (${ticker}) listed on NSE/BSE now. Do not describe a research process. Do not write a one-line status. The snapshot below is supplementary — research NSE/BSE filings, the company IR site, annual reports and quarterly results. Cite a number only if it is in the snapshot or in a primary document you name (title, period, URL). Do not invent figures. Distinguish a reported fact, company guidance, a media interpretation, and a Kosh calculation. Do not present guidance as achieved performance. If a figure is unavailable, say “Not reliably available.” Be direct: cut descriptive padding by at least half. Keep every required section, verdict label, factor, and number. One sentence of why per factor. Markdown tables only. Final verdict 3–6 sentences. Use exactly one approved verdict from the skill.\n\n${blob}` : kind === "qual" ? `Write the full qualitative-multibagger-catalyst analysis of ${name} (${ticker}) listed on NSE/BSE now. Do not describe a research process. Do not write a one-line status such as “Researching…”. Snapshot below is a supporting financial check — research primary filings and the company IR site. Distinguish reported fact, company guidance, and your interpretation. Do not invent a financial number. If a figure is unavailable, say “Not reliably available.” Be direct: cut descriptive padding by at least half. Keep every required section, verdict label, factor, and number. One sentence of why per factor. Markdown tables only. Final verdict 3–6 sentences. Use exactly one approved qualitative label and one financial classification.\n\n${blob}` : kind === "combine" ? `Connect the two skill outputs below. Do not rerun either skill. Be direct. Cut padding by half.\n\n${blob}` : kind === "improve" ? `Synthesise this Indian portfolio from weights, live numbers, and skill labels in FACTS. Do not rerun either skill. Do not invent labels. Use BOTH fundamental and qualitative labels when they are present. Concentration in a name that both skills back is an opportunity, not automatically a risk. Never write Unscreened, book, or Not on file. Never make "Qualitative Not run" the thesis of the Portfolio verdict — judge from weights and live numbers, and from whatever labels are in FACTS. Copy labels; if a skill is absent write Not run in the table only; if a skill Failed, write Failed — never pretend it was not attempted.\n\n${blob}` : `COMPANY DATA\n${blob}`;
	const maxTokens = kind === "holdings" ? 4e3 : kind === "improve" ? 3500 : kind === "fund" || kind === "qual" ? 4500 : kind === "combine" ? 2500 : kind === "desk" || kind === "quality" || kind === "book" ? 2400 : 1400;
	const temperature = kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? .3 : .2;
	const useSearch = kind === "fund" || kind === "qual";
	const run = async (u) => chat(apiKey, systemFor(kind), u, maxTokens, temperature, useSearch);
	let text = "";
	try {
		text = await run(user);
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Analysis error";
		return {
			ok: false,
			error: msg,
			skillStatus: classifySkillError(msg)
		};
	}
	if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, text)) {
		const missing = kind === "fund" ? validateFund(text).missing : validateQual(text).missing;
		try {
			text = await run(`${correctivePrompt(kind, missing)}\n\n${user}`);
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Analysis error";
			return {
				ok: false,
				error: msg,
				skillStatus: classifySkillError(msg)
			};
		}
	}
	if (!text) return {
		ok: false,
		error: "Empty reply",
		skillStatus: "Failed"
	};
	if ((kind === "fund" || kind === "qual") && !skillOutputReady(kind, text)) return {
		ok: false,
		error: "The analysis did not finish. Retry.",
		skillStatus: "Failed"
	};
	if (JSON_KINDS.has(kind)) {
		let parsedTry = parseJson(text);
		if (!jsonKindOk(kind, parsedTry)) try {
			text = await run(`The last reply was not valid JSON for this skill. Return only the required JSON object. Do not omit required fields. Do not invent missing numbers. Do not add a buy or sell.\n\n${user}`);
			parsedTry = parseJson(text);
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Analysis error";
			return {
				ok: false,
				error: msg,
				skillStatus: classifySkillError(msg)
			};
		}
		if (!jsonKindOk(kind, parsedTry)) return {
			ok: false,
			error: "AI analysis unavailable",
			skillStatus: "Invalid"
		};
	}
	cache$1.set(cacheKey, {
		at: Date.now(),
		text
	});
	return {
		ok: true,
		cached: false,
		...fromParsed(kind, kind === "fund" || kind === "qual" || kind === "combine" || kind === "improve" ? null : parseJson(text), text)
	};
}
async function executeScreenBuild(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const prompt = String(input.prompt || "").slice(0, 1200);
	const image = String(input.image || "");
	if (!prompt && !image) return {
		ok: false,
		error: "Describe the screen, or attach a screenshot"
	};
	const gap = screenMetricGap(prompt);
	if (gap) return {
		ok: false,
		error: gap.message,
		unsupported: {
			metric: gap.metric,
			closest: gap.closest
		}
	};
	const cacheKey = `screen:v23:${prompt}:${image.slice(0, 40)}:${image.length}`;
	const hit = cache$1.get(cacheKey);
	if (hit && Date.now() - hit.at < DAY) {
		const parsed = parseJson(hit.text);
		if (parsed && !parsed.unsupported) return {
			ok: true,
			filter: asFilter(parsed),
			cached: true
		};
	}
	const userContent = image ? [{
		type: "text",
		text: prompt || "Build a Kosh screener from this screenshot of criteria. If a metric is unsupported, say so. Do not substitute it."
	}, {
		type: "image_url",
		image_url: { url: image.slice(0, 9e5) }
	}] : `USER CRITERIA:\n${prompt}`;
	let text = "";
	try {
		text = await chat(apiKey, SCREEN_BUILD, userContent, 700);
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "xAI error"
		};
	}
	const parsed = parseJson(text);
	if (!parsed) return {
		ok: false,
		error: "Could not read a screen from that. Try a shorter sentence."
	};
	if (typeof parsed.unsupported === "string" && parsed.unsupported.trim()) {
		const metric = parsed.unsupported.trim().slice(0, 80);
		const closest = String(parsed.closest || "a listed field").slice(0, 40);
		return {
			ok: false,
			error: `${metric} is not currently a supported screening field. Closest available: ${closest}. Use ${closest} instead?`,
			unsupported: {
				metric,
				closest
			}
		};
	}
	cache$1.set(cacheKey, {
		at: Date.now(),
		text
	});
	return {
		ok: true,
		filter: asFilter(parsed),
		cached: false
	};
}
function asFilter(p) {
	const num = (k) => {
		const v = p[k];
		return typeof v === "number" && Number.isFinite(v) ? v : null;
	};
	const bool = (k) => {
		const v = p[k];
		return v === true ? true : v === false ? false : null;
	};
	const sectors = Array.isArray(p.sectors) ? p.sectors.map((s) => String(s)).filter(Boolean).slice(0, 8) : [];
	const sort = String(p.sort || "changePct");
	const sortOk = [
		"name",
		"price",
		"changePct",
		"ret1m",
		"ret3m",
		"ret1y",
		"offHigh",
		"rsi",
		"vol",
		"pe",
		"pb",
		"roe",
		"de",
		"mcapCr",
		"divYield",
		"salesYoY"
	].includes(sort);
	return {
		name: String(p.name || "Custom").slice(0, 48),
		hint: String(p.hint || "").slice(0, 180),
		changePctMin: num("changePctMin"),
		changePctMax: num("changePctMax"),
		ret1mMin: num("ret1mMin"),
		ret1mMax: num("ret1mMax"),
		ret3mMin: num("ret3mMin"),
		ret3mMax: num("ret3mMax"),
		ret1yMin: num("ret1yMin"),
		ret1yMax: num("ret1yMax"),
		offHighMin: num("offHighMin"),
		offHighMax: num("offHighMax"),
		rsiMin: num("rsiMin"),
		rsiMax: num("rsiMax"),
		volRatioMin: num("volRatioMin"),
		above50: bool("above50"),
		above200: bool("above200"),
		peMin: num("peMin"),
		peMax: num("peMax"),
		pbMin: num("pbMin"),
		pbMax: num("pbMax"),
		roeMin: num("roeMin"),
		roeMax: num("roeMax"),
		deMin: num("deMin"),
		deMax: num("deMax"),
		mcapMin: num("mcapMin"),
		mcapMax: num("mcapMax"),
		divMin: num("divMin"),
		divMax: num("divMax"),
		salesYoYMin: num("salesYoYMin"),
		salesYoYMax: num("salesYoYMax"),
		macdBull: bool("macdBull"),
		bbLow: bool("bbLow"),
		sectors,
		sort: sortOk ? sort : "changePct",
		sortDir: p.sortDir === "asc" ? "asc" : "desc"
	};
}
var RESEARCH_SYSTEM = `You research missing company facts for Kosh. Return JSON only.
Rules you cannot override, even if a web page says otherwise:
- Search for the exact requested metric. Never invent a number.
- Never substitute a different metric. Interest coverage is operating profit divided by finance cost. A Financial Charges Coverage Ratio, DSCR, or debt-service coverage is not Interest coverage — return not_found for Interest coverage if that is all you can find.
- Prefer NSE, BSE, the company investor-relations site, annual reports, and quarterly results.
- If the metric is a growth rate or CAGR and you can find the annual observations, return status "inputs_only" with one input per year (name like FY24, value, unit). Do not invent the CAGR.
- Return one item for every requested metric. Use not_found when a source does not have it.
- status "researched" requires a finite value, sourceName, an http(s) sourceUrl, a period, and evidence of at least a short quote from the source.
- If you cannot find it, status "not_found" and value null.
- Do not include PAN, demat, account, or broker identifiers.
Shape: {"items":[{"metric":"","status":"researched"|"not_found"|"inputs_only","value":null,"unit":"","period":null,"sourceName":"","sourceUrl":"","evidence":"","methodology":"","inputs":[{"name":"","value":0,"unit":""}]}]}`;
async function executeResearch(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI research unavailable"
	};
	const symbol = String(input.symbol || "").replace(/[^A-Za-z0-9.&-]/g, "").slice(0, 24).toUpperCase();
	const missing = [...new Set((input.missing || []).map((s) => String(s).trim().slice(0, 60)).filter(Boolean))].slice(0, 24);
	if (!symbol || !missing.length) return {
		ok: false,
		error: "AI research unavailable"
	};
	const user = `NSE symbol ${symbol}. Missing metrics only: ${missing.join(", ")}.`;
	let last = "AI research unavailable";
	for (let attempt = 0; attempt < 2; attempt++) try {
		const checked = validateResearch(parseJson(await chat(apiKey, attempt ? `${RESEARCH_SYSTEM}\nThe previous reply was rejected: ${last}. Return corrected JSON.` : RESEARCH_SYSTEM, user, 900, .1, true)), missing);
		if (checked.ok) return {
			ok: true,
			symbol,
			items: checked.items
		};
		last = checked.error;
	} catch {
		last = "AI research unavailable";
	}
	return {
		ok: false,
		error: "AI research unavailable"
	};
}
/** One completion plan: formulas first, then source research for whatever is still blank. */
var SCALAR = {
	pe: "pe",
	"p/e": "pe",
	pb: "pb",
	"p/b": "pb",
	roe: "roe",
	roce: "roce",
	opm: "opm",
	"operating margin": "opm",
	de: "de",
	"d/e": "de",
	"debt/equity": "de",
	"div yield": "divYield",
	"dividend yield": "divYield",
	promoters: "promoters",
	"promoter holding": "promoters",
	mcap: "mcapCr",
	"market cap": "mcapCr",
	"sales 1y": "salesYoY",
	"sales growth": "salesYoY",
	"profit 1y": "profitYoY",
	"profit growth": "profitYoY",
	peg: "peg",
	eps: "eps",
	book: "book",
	"book value": "book",
	"interest coverage": "interestCover",
	"int. cover": "interestCover",
	"cfo/pat": "cfoPat",
	pledge: "pledge",
	"sales cagr 3y": "salesCagr3",
	"sales 3y": "salesCagr3",
	"profit cagr 3y": "profitCagr3",
	"profit cagr 5y": "profitCagr5",
	"profit 5y": "profitCagr5",
	fii: "fii",
	dii: "dii"
};
var SERIES_ASK = {
	sales: "annual sales history",
	profits: "annual profit history",
	cfo: "annual cash from operations"
};
var SERIES_LABEL = {
	revenue: "sales",
	"revenue from operations": "sales",
	sales: "sales",
	pat: "profits",
	profit: "profits",
	"net profit": "profits",
	cfo: "cfo",
	"cash from operations": "cfo"
};
var ASK_LABEL = {
	pe: "P/E",
	pb: "P/B",
	roe: "ROE",
	roce: "ROCE",
	opm: "OPM",
	de: "D/E",
	divYield: "Dividend yield",
	promoters: "Promoter holding",
	mcapCr: "Market cap",
	eps: "EPS",
	book: "Book value",
	interestCover: "Interest coverage",
	pledge: "Pledge",
	fii: "FII",
	dii: "DII",
	peg: "PEG"
};
/** Derived outputs. If the inputs exist, do not ask AI for the output. */
var DERIVED = {
	salesYoY: ["sales"],
	profitYoY: ["profits"],
	salesCagr3: ["sales"],
	profitCagr3: ["profits"],
	profitCagr5: ["profits"],
	cfoPat: ["cfo", "profits"],
	peg: ["pe", "profitCagr5"]
};
function blankFund(symbol) {
	const empty = null;
	return {
		symbol,
		searchId: "",
		name: symbol,
		industry: "",
		ceo: "",
		founded: "",
		summary: "",
		mcapCr: empty,
		pe: empty,
		pb: empty,
		roe: empty,
		de: empty,
		divYield: empty,
		eps: empty,
		book: empty,
		face: empty,
		industryPe: empty,
		salesYoY: empty,
		profitYoY: empty,
		sales: [],
		profits: [],
		qSales: [],
		qProfits: [],
		netWorth: [],
		qNetWorth: [],
		shareholding: [],
		promoters: empty,
		fii: empty,
		dii: empty,
		roce: empty,
		peg: empty,
		opm: empty,
		salesCagr3: empty,
		profitCagr3: empty,
		profitCagr5: empty,
		website: null,
		interestCover: empty,
		ebitda: [],
		cfo: [],
		qCfo: [],
		cfoPat: empty,
		pledge: empty,
		provenance: {
			searched: false,
			at: Date.now(),
			fields: {}
		}
	};
}
function fieldKey(label) {
	const k = label.trim().toLowerCase();
	if (SCALAR[k]) return SCALAR[k];
	for (const [name, key] of Object.entries(SCALAR)) if (k.includes(name)) return key;
	return null;
}
function seriesReady(pts, min) {
	return (pts || []).filter((p) => p && Number.isFinite(p.value)).length >= min;
}
function yoyReady(pts) {
	if (!pts || pts.length < 2) return false;
	const a = pts[pts.length - 2];
	const b = pts[pts.length - 1];
	return a.value > 0 && Number.isFinite(b.value);
}
/** True only when the formula engine can actually produce the number. A short series is not enough. */
function canDerive(fund, key) {
	if (key === "salesCagr3") return seriesCagr(fund.sales, 3).value != null;
	if (key === "profitCagr3") return seriesCagr(fund.profits, 3).value != null;
	if (key === "profitCagr5") return seriesCagr(fund.profits, 5).value != null;
	if (key === "salesYoY") return yoyReady(fund.sales);
	if (key === "profitYoY") return yoyReady(fund.profits);
	if (key === "cfoPat") return cfoToPat(fund.cfo, fund.profits).value != null;
	if (key === "peg") {
		const g = seriesCagr(fund.profits, 5).value ?? seriesCagr(fund.profits, 3).value;
		return fund.pe != null && fund.pe > 0 && g != null && g > 0;
	}
	return false;
}
function rawAsks(fund, key, ask) {
	const needs = DERIVED[key];
	if (!needs) {
		if (SERIES_ASK[key]) {
			if (!seriesReady(fund[key], 1)) ask.add(SERIES_ASK[key]);
			return;
		}
		const cur = fund[key];
		if (typeof cur === "number" && Number.isFinite(cur)) return;
		ask.add(ASK_LABEL[key] || key);
		return;
	}
	if (canDerive(fund, key)) return;
	if (needs.length === 1 && SERIES_ASK[needs[0]]) {
		ask.add(SERIES_ASK[needs[0]]);
		return;
	}
	for (const n of needs) rawAsks(fund, String(n), ask);
}
/** Labels still blank on the displayed columns. A blank is not a pass. */
function missingDisplayed(row, fields) {
	return fields.filter((f) => {
		const v = row[f.key];
		return !(typeof v === "number" && Number.isFinite(v));
	});
}
/**
* What to ask a source for. Derived metrics with inputs on file are local.
* A short series is not treated as enough for a 5-year CAGR.
* Missing CAGR asks for the annual series, not a made-up growth rate.
*/
function researchPlan(fund, missing) {
	const ask = /* @__PURE__ */ new Set();
	const local = [];
	for (const label of missing) {
		const seriesName = SERIES_LABEL[label.trim().toLowerCase()];
		if (seriesName) {
			if (!seriesReady(fund[seriesName], 1)) ask.add(SERIES_ASK[seriesName]);
			continue;
		}
		if (/^(fii|dii) change$/i.test(label.trim())) {
			local.push(label);
			continue;
		}
		if (/^(3m|1y|rsi 14|vol vs 20d avg|vs 52w high|contractions|last contraction|volume multiple|pivot)$/i.test(label.trim())) {
			local.push(label);
			continue;
		}
		const key = fieldKey(label);
		if (!key) {
			ask.add(label);
			continue;
		}
		if (DERIVED[String(key)]) {
			if (canDerive(fund, String(key))) local.push(label);
			else rawAsks(fund, String(key), ask);
			continue;
		}
		const cur = fund[key];
		if (typeof cur === "number" && Number.isFinite(cur)) continue;
		if (Array.isArray(cur) && cur.length) continue;
		ask.add(label);
	}
	return {
		ask: [...ask],
		local
	};
}
/** Every requested metric is attempted. The server cap is a batch, not a silent drop. */
function researchBatches(asks, size = 24) {
	const clean = [...new Set(asks.map((s) => s.trim()).filter(Boolean))];
	const out = [];
	const n = Math.max(1, size);
	for (let i = 0; i < clean.length; i += n) out.push(clean.slice(i, i + n));
	return out;
}
var SCALAR_KEYS = [
	"mcapCr",
	"pe",
	"pb",
	"roe",
	"de",
	"divYield",
	"eps",
	"book",
	"promoters",
	"fii",
	"dii",
	"roce",
	"peg",
	"opm",
	"interestCover",
	"pledge",
	"cfoPat",
	"salesCagr3",
	"profitCagr3",
	"profitCagr5",
	"salesYoY",
	"profitYoY"
];
/**
* Filing/card numbers win. A previously researched fact fills a blank and keeps its status.
* A researched label is never left on a number that came from the card.
*/
function seedCompletion(existing, fetched, symbol) {
	const base = fetched ? {
		...blankFund(symbol),
		...fetched,
		symbol: fetched.symbol || symbol
	} : existing ? {
		...existing,
		symbol: existing.symbol || symbol
	} : blankFund(symbol);
	if (!existing || !fetched) return applyFormulas(base);
	const merged = fillFundamentals(base, existing);
	const fields = { ...existing.provenance?.fields || {} };
	for (const [k, meta] of Object.entries(base.provenance?.fields || {})) fields[k] = meta;
	for (const key of SCALAR_KEYS) {
		const baseVal = base[key];
		if (!(typeof baseVal === "number" && Number.isFinite(baseVal))) continue;
		if (fields[key]?.rank === "ai-researched" && !base.provenance?.fields?.[key]) fields[key] = {
			status: "verified",
			source: "Company record",
			rank: "structured-provider",
			method: "Already on the company record. Research was not used for this number.",
			period: base.finPeriod || null
		};
	}
	merged.provenance = {
		searched: Boolean(existing.provenance?.searched || base.provenance?.searched),
		at: Date.now(),
		fields
	};
	return applyFormulas(merged);
}
function seriesOfMetric(metric) {
	const m = metric.toLowerCase().trim();
	if (SERIES_LABEL[m]) return SERIES_LABEL[m];
	if (/annual sales|revenue history|sales history|revenue from operations|sales cagr|revenue cagr/.test(m)) return "sales";
	if (/annual profit|profit history|pat history|net profit|profit cagr/.test(m)) return "profits";
	if (/cash from operations|operating cash|cfo history/.test(m)) return "cfo";
	return null;
}
function pointsFrom(item) {
	const pts = item.inputs.map((row) => {
		const period = periodOf(row.name);
		return period ? {
			period,
			value: row.value
		} : null;
	}).filter((x) => Boolean(x));
	if (item.status === "researched" && item.value != null && !/cagr/i.test(item.metric)) {
		const period = periodOf(item.period || "");
		if (period) pts.push({
			period,
			value: item.value
		});
	}
	return pts;
}
function periodOf(name) {
	const s = String(name || "").trim();
	if (/^FY\s*\d{2,4}$/i.test(s) || /^\d{4}$/.test(s) || /[A-Za-z]{3}.*\d{2,4}/.test(s)) return s;
	return null;
}
function stamp(fields, key, item, method) {
	fields[key] = {
		status: "researched",
		source: item.sourceName || "Source-backed research",
		rank: "ai-researched",
		method,
		period: item.period,
		reason: item.evidence,
		sourceUrl: item.sourceUrl || null
	};
}
/** Write source-backed facts onto blanks only. Never overwrite a number. Never mark them verified. */
function applyResearchToFund(fund, items) {
	const out = {
		...fund,
		sales: [...fund.sales || []],
		profits: [...fund.profits || []],
		cfo: [...fund.cfo || []],
		provenance: {
			searched: true,
			at: Date.now(),
			fields: { ...fund.provenance?.fields || {} }
		}
	};
	const fields = out.provenance.fields;
	const pushSeries = (key, pts) => {
		const have = new Set(out[key].map((p) => p.period));
		for (const p of pts) {
			if (!p.period || have.has(p.period) || !Number.isFinite(p.value)) continue;
			out[key].push(p);
			have.add(p.period);
		}
	};
	for (const item of items) {
		const seriesKey = seriesOfMetric(item.metric);
		if (seriesKey && (item.status === "inputs_only" || item.status === "researched")) {
			const pts = pointsFrom(item);
			if (pts.length) {
				pushSeries(seriesKey, pts);
				fields[seriesKey] = {
					status: "researched",
					source: item.sourceName || "Source-backed research",
					rank: "ai-researched",
					method: "Annual observations from a cited source. CAGR is calculated by Kosh, not by the model.",
					period: pts.at(-1)?.period || item.period,
					reason: item.evidence,
					sourceUrl: item.sourceUrl || null
				};
			}
			continue;
		}
		const key = fieldKey(item.metric);
		if (item.status === "conflicting") {
			if (key && !DERIVED[String(key)]) {
				const cur = out[key];
				if (!(typeof cur === "number" && Number.isFinite(cur))) fields[String(key)] = {
					status: "conflicting",
					source: item.sourceName || "Research",
					rank: "ai-researched",
					method: item.evidence,
					period: item.period,
					reason: item.evidence || "Sources disagree. Kosh did not average them.",
					alt: item.value,
					sourceUrl: item.sourceUrl || null
				};
			}
			continue;
		}
		if (item.status !== "researched" || item.value == null) {
			if (key && item.status === "not_found") fields[String(key)] = {
				status: "unavailable",
				source: item.sourceName || "Research",
				rank: "ai-researched",
				method: item.evidence || "Not found in the sources checked.",
				period: item.period,
				reason: item.evidence || "Not found in the sources checked.",
				sourceUrl: item.sourceUrl || null
			};
			continue;
		}
		if (!key || DERIVED[String(key)]) continue;
		const cur = out[key];
		if (typeof cur === "number" && Number.isFinite(cur)) continue;
		if (typeof cur === "number" || cur == null) {
			out[key] = item.value;
			stamp(fields, String(key), item, `${item.evidence} Not a reported filing ingested by Kosh.`);
		}
	}
	const byT = (a, b) => (parsePeriod(a.period)?.t || 0) - (parsePeriod(b.period)?.t || 0);
	out.sales.sort(byT);
	out.profits.sort(byT);
	out.cfo.sort(byT);
	return applyFormulas(out);
}
function explainGaps(fund, missing) {
	const gaps = [];
	for (const label of missing) {
		const seriesName = SERIES_LABEL[label.trim().toLowerCase()];
		if (seriesName) {
			if (seriesReady(fund[seriesName], 1)) continue;
			const meta = fund.provenance?.fields?.[seriesName];
			gaps.push({
				key: seriesName,
				label,
				reason: meta?.reason || meta?.method || "Unavailable — no supported source returned this field."
			});
			continue;
		}
		const key = fieldKey(label);
		if (!key) {
			gaps.push({
				key: label,
				label,
				reason: "This field is not on the company record."
			});
			continue;
		}
		const cur = fund[key];
		if (typeof cur === "number" && Number.isFinite(cur)) continue;
		if (Array.isArray(cur) && cur.length) continue;
		const meta = fund.provenance?.fields?.[String(key)];
		gaps.push({
			key: String(key),
			label,
			reason: meta?.reason || meta?.method || "Unavailable — no supported source returned this field."
		});
	}
	return gaps;
}
/** Path prices come from the market history, never from a model reply. */
function usablePathPrice(_item) {
	return null;
}
/** What a model may be asked when a Path name did not match a listed ticker. Never a price or a return. */
function pathIdentityAsk(symbol) {
	return `listed NSE or BSE symbol for ${symbol}`;
}
/**
* A listed ticker from a source-backed identity reply. Never a price.
* Requires an http source, a source name, and evidence that names the ticker.
*/
function listedSymbolFromResearch(asked, item) {
	if (!item || item.status !== "researched") return null;
	const url = String(item.sourceUrl || "");
	if (!/^https?:\/\//i.test(url)) return null;
	if (!String(item.sourceName || "").trim()) return null;
	const evidence = String(item.evidence || "").trim();
	if (evidence.length < 8) return null;
	const blob = `${item.metric || ""} ${evidence}`;
	const bare = String(asked || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
	const re = /(?:symbol|ticker|listed|NSE|BSE|nse|bse|Symbol|Ticker|Listed)[^A-Z0-9&]{0,48}([A-Z][A-Z0-9&]{1,18})/g;
	const skip = /* @__PURE__ */ new Set([
		"NSE",
		"BSE",
		"NS",
		"BO",
		"EQ",
		"SYMBOL",
		"TICKER",
		"LISTED",
		"OR",
		"THE",
		"FOR",
		"AND"
	]);
	let found = null;
	for (const m of blob.matchAll(re)) {
		const ticker = m[1].replace(/\.(NS|BO)$/, "").toUpperCase();
		if (!/^[A-Z][A-Z0-9&]{1,18}$/.test(ticker) || skip.has(ticker) || ticker === bare) continue;
		found = ticker;
	}
	return found;
}
/** Names already finished are not run again when a bulk completion is resumed. */
function remainingJobs(jobs, rows) {
	const finished = new Set(rows.filter((r) => r.phase === "done" || r.phase === "incomplete").map((r) => r.symbol));
	return jobs.filter((j) => j.symbol && !finished.has(j.symbol));
}
/**
* Server company cache. Numbers already on file win.
* Incoming researched facts fill blanks and keep AI-researched provenance.
*/
function commitFund(cached, incoming, symbol) {
	if (!cached) return applyFormulas({
		...incoming,
		symbol: incoming.symbol || symbol
	});
	return seedCompletion(incoming, cached, symbol);
}
async function pool(items, concurrency, worker) {
	const out = new Array(items.length);
	let next = 0;
	const n = Math.max(1, Math.min(concurrency, items.length || 1));
	async function run() {
		while (next < items.length) {
			const idx = next++;
			out[idx] = await worker(items[idx], idx);
		}
	}
	if (!items.length) return [];
	await Promise.all(Array.from({ length: n }, () => run()));
	return out;
}
var Route$24 = createFileRoute("/api/enrich")({ server: { handlers: {
	GET: async ({ request }) => {
		if (!rateLimit("enrich:" + clientKey(request), 80, 6e5)) return Response.json({ error: "Too many data requests. Try again in a few minutes." }, { status: 429 });
		const job = await advanceEnrichJob(new URL(request.url).searchParams.get("job") || "", 1);
		if (!job) return Response.json({ error: "That verification job is not running." }, { status: 404 });
		return Response.json(job);
	},
	POST: async ({ request }) => {
		const ip = clientKey(request);
		if (!rateLimit("enrich:" + ip, 4e3, 6e5)) return Response.json({ error: "Too many reads. Try again in a few minutes." }, { status: 429 });
		if (tooLarge(request, 4e5)) return Response.json({ error: "Request is too large." }, { status: 413 });
		const body = await request.json().catch(() => ({}));
		if (body.research) {
			if (!rateLimit("research:" + ip, 2e3, 6e5)) return Response.json({
				ok: false,
				error: "Too many reads. Try again in a few minutes."
			}, { status: 429 });
			const result = await executeResearch({
				symbol: String(body.research.symbol || ""),
				missing: Array.isArray(body.research.missing) ? body.research.missing.map((s) => String(s)) : []
			});
			return Response.json(result);
		}
		if (Array.isArray(body.market)) {
			if (!rateLimit("market:" + ip, 500, 6e5)) return Response.json({ error: "Too many reads. Try again in a few minutes." }, { status: 429 });
			const symbols = [...new Set(body.market.map((s) => String(s).trim()).filter(Boolean))].slice(0, 24);
			const rows = [];
			for (const symbol of symbols) {
				const row = await fetchScreenerOne(symbol);
				if (row) {
					rememberScreenRow(row);
					rows.push(row);
				}
			}
			return Response.json({ rows });
		}
		if (body.commit?.fund && body.commit.symbol) {
			const symbol = String(body.commit.symbol).replace(/\.(NS|BO)$/i, "").toUpperCase();
			const fund = commitFund((await loadCompanyFunds([symbol])).get(symbol)?.fund || null, body.commit.fund, symbol);
			if (!await upsertCompanyFunds({ [symbol]: fund }, { [symbol]: ["ai-researched"] })) return Response.json({
				ok: false,
				error: "Company cache did not save."
			}, { status: 503 });
			return Response.json({
				ok: true,
				symbol,
				fund
			});
		}
		const symbols = [...new Set((body.symbols || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 40);
		if (!symbols.length) return Response.json({
			funds: {},
			sources: {}
		});
		if (symbols.length > 3) {
			const job = await startEnrichJob(symbols);
			return Response.json({
				...job,
				funds: {},
				sources: {}
			});
		}
		const got = await fetchDeepMany(symbols);
		await upsertCompanyFunds(got.funds || {}, got.sources || {});
		return Response.json(got);
	}
} } });
var Route$23 = createFileRoute("/api/fundamentals")({ server: { handlers: { GET: async ({ request }) => {
	if (!rateLimit("fund:" + clientKey(request), 60, 6e5)) return Response.json({ error: "Too many data requests. Try again in a few minutes." }, { status: 429 });
	const url = new URL(request.url);
	const symbol = String(url.searchParams.get("symbol") || "").slice(0, 24);
	if (!symbol) return Response.json({ fund: null }, { status: 400 });
	if (url.searchParams.get("deep") === "1" || url.searchParams.get("deep") === "true") {
		const got = await fetchDeepFundamentals(symbol);
		return Response.json({
			fund: got.fund,
			sources: got.sources
		});
	}
	const [live, cache] = await Promise.all([fetchFundamentals(symbol).catch(() => null), loadCompanyFunds([symbol])]);
	const cached = cache.get(symbol.replace(/\.(NS|BO)$/i, "").toUpperCase());
	if (!live && !cached?.fund) return Response.json({ fund: null });
	const fund = seedCompletion(cached?.fund, live, symbol);
	return Response.json({
		fund,
		sources: cached?.sources || []
	});
} } } });
var Route$22 = createFileRoute("/api/histories")({ server: { handlers: { POST: async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const symbols = [...new Set((body.symbols || []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 80);
	const range = body.range || "max";
	const rows = await fetchHistories(symbols, range);
	return Response.json({
		rows,
		range,
		asOf: (/* @__PURE__ */ new Date()).toISOString()
	});
} } } });
var Route$21 = createFileRoute("/api/history")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const symbol = String(url.searchParams.get("symbol") || "").trim();
	const range = String(url.searchParams.get("range") || "max");
	if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });
	const d = await resolveHistory(symbol, range);
	if (!d) return Response.json({
		input: symbol,
		symbol,
		name: symbol,
		price: 0,
		previousClose: 0,
		changePct: 0,
		high52: 0,
		low52: 0,
		first: null,
		last: null,
		sessions: 0,
		bars: [],
		missing: true
	});
	return Response.json({
		...d,
		input: symbol,
		missing: false
	});
} } } });
/** Parse mixed NSE / ISO / Indian dates to an IST calendar day. Never invent a day. */
var MON = {
	jan: "01",
	feb: "02",
	mar: "03",
	apr: "04",
	may: "05",
	jun: "06",
	jul: "07",
	aug: "08",
	sep: "09",
	oct: "10",
	nov: "11",
	dec: "12"
};
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function pad$1(n) {
	return n < 10 ? "0" + n : String(n);
}
function year4(raw, asOf = /* @__PURE__ */ new Date()) {
	const s = String(raw || "").trim();
	if (/^\d{4}$/.test(s)) return s;
	if (/^\d{2}$/.test(s)) {
		const n = Number(s);
		return String(n >= 70 ? 1900 + n : 2e3 + n);
	}
	if (/^\d{3}$/.test(s)) {
		const cy = String(asOf.getFullYear());
		if (cy.startsWith(s)) return cy;
		return null;
	}
	return null;
}
function validIso(y, m, d) {
	if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
	if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
	const dt = new Date(Date.UTC(y, m - 1, d));
	if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) return null;
	return `${y}-${pad$1(m)}-${pad$1(d)}`;
}
/** Canonical YYYY-MM-DD, or null if the string cannot be read. */
function parseIstDate(raw, asOf = /* @__PURE__ */ new Date()) {
	const s = String(raw || "").trim();
	if (!s) return null;
	const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return validIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));
	const mon = s.match(/^(\d{1,2})[-/\s]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s,]+(\d{2,4})\b/i);
	if (mon) {
		const y = year4(mon[3], asOf);
		const m = MON[mon[2].slice(0, 3).toLowerCase()];
		if (y && m) return validIso(Number(y), Number(m), Number(mon[1]));
	}
	const monFirst = s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s,]+(\d{1,2})[,-\s]+(\d{2,4})\b/i);
	if (monFirst) {
		const y = year4(monFirst[3], asOf);
		const m = MON[monFirst[1].slice(0, 3).toLowerCase()];
		if (y && m) return validIso(Number(y), Number(m), Number(monFirst[2]));
	}
	const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/);
	if (dmy) {
		const y = year4(dmy[3], asOf);
		if (y) return validIso(Number(y), Number(dmy[2]), Number(dmy[1]));
	}
	return null;
}
function istDateMs(iso) {
	const d = parseIstDate(iso);
	if (!d) return null;
	const t = Date.parse(d + "T00:00:00+05:30");
	return Number.isFinite(t) ? t : null;
}
function formatIstDate(raw) {
	const d = parseIstDate(raw);
	if (!d) return String(raw || "").trim();
	const [y, m, day] = d.split("-");
	return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
}
function formatIstShort(raw) {
	const d = parseIstDate(raw);
	if (!d) return String(raw || "").trim();
	const [, m, day] = d.split("-");
	return `${Number(day)} ${MONTHS[Number(m) - 1]}`;
}
function compareIstDate(a, b) {
	const am = istDateMs(a);
	const bm = istDateMs(b);
	if (am == null && bm == null) return String(a).localeCompare(String(b));
	if (am == null) return 1;
	if (bm == null) return -1;
	return am - bm;
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var cache = /* @__PURE__ */ new Map();
var TTL = 48e4;
async function getJson(url, extra = {}) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA,
			Accept: "application/json",
			...extra
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.json();
}
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function asFiidii(row) {
	return {
		date: String(row.date || ""),
		fiiNet: num(row.fii_net ?? row.fiiNet),
		diiNet: num(row.dii_net ?? row.diiNet),
		fiiBuy: num(row.fii_buy ?? row.fiiBuy),
		fiiSell: num(row.fii_sell ?? row.fiiSell),
		diiBuy: num(row.dii_buy ?? row.diiBuy),
		diiSell: num(row.dii_sell ?? row.diiSell)
	};
}
async function fetchFiidii() {
	try {
		const raw = await getJson("https://fii-diidata.mrchartist.com/api/history");
		return (Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : []).filter((x) => x && typeof x === "object").map((x) => asFiidii(x)).filter((x) => x.date).slice(0, 24);
	} catch {
		try {
			const raw = await getJson("https://fii-diidata.mrchartist.com/api/data");
			if (raw && typeof raw === "object") return [asFiidii(raw)].filter((x) => x.date);
		} catch {}
		return [];
	}
}
function eventKind(purpose) {
	if (/financial result|earnings|result/i.test(purpose)) return "results";
	return "stock";
}
function pad(n) {
	return n < 10 ? "0" + n : String(n);
}
function iso(d) {
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function lastThursday(year, month0) {
	const d = new Date(Date.UTC(year, month0 + 1, 0));
	const diff = (d.getUTCDay() + 7 - 4) % 7;
	d.setUTCDate(d.getUTCDate() - diff);
	return d;
}
function firstFriday(year, month0) {
	const d = new Date(Date.UTC(year, month0, 1));
	const add = (5 - d.getUTCDay() + 7) % 7;
	d.setUTCDate(1 + add);
	return d;
}
function macroEvents() {
	const now = /* @__PURE__ */ new Date();
	const y = now.getUTCFullYear();
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const out = [];
	for (let m = 0; m < 12; m++) {
		const yr = m + now.getUTCMonth() > 11 ? y + 1 : y;
		const mo = (now.getUTCMonth() + m) % 12;
		const exp = lastThursday(yr, mo);
		if (exp >= start) out.push({
			symbol: "^NSEI",
			name: "Nifty F&O",
			date: iso(exp),
			purpose: "Monthly F&O expiry (last Thursday)",
			kind: "macro"
		});
		const nfp = firstFriday(yr, mo);
		if (nfp >= start) out.push({
			symbol: "^NSEI",
			name: "US payrolls",
			date: iso(nfp),
			purpose: "US non-farm payrolls (first Friday)",
			kind: "macro",
			expected: true
		});
	}
	const budget = new Date(Date.UTC(y + (now.getUTCMonth() > 1 ? 1 : 0), 1, 1));
	if (budget >= start) out.push({
		symbol: "^NSEI",
		name: "Union Budget",
		date: iso(budget),
		purpose: "Union Budget (typical 1 Feb window)",
		kind: "macro",
		expected: true
	});
	return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 18);
}
async function fetchResults() {
	const uni = new Set(SCREEN_UNIVERSE.map((x) => x.symbol.toUpperCase()));
	const board = [];
	try {
		const raw = await getJson("https://www.nseindia.com/api/event-calendar?index=equities", { Referer: "https://www.nseindia.com/" });
		const list = Array.isArray(raw) ? raw : [];
		for (const item of list) {
			if (!item || typeof item !== "object") continue;
			const o = item;
			const symbol = String(o.symbol || "").toUpperCase();
			const purpose = String(o.purpose || "");
			if (!symbol || !purpose) continue;
			const kind = eventKind(purpose);
			if (kind !== "results" && !uni.has(symbol)) continue;
			const date = parseIstDate(String(o.date || ""));
			if (!date) continue;
			board.push({
				symbol,
				name: universeName(symbol) || String(o.company || symbol),
				date,
				purpose,
				kind
			});
			if (board.length >= 48) break;
		}
	} catch {}
	return [...board, ...macroEvents()];
}
var nseCookies = "";
var nseCookieAt = 0;
async function nseSession() {
	if (nseCookies && Date.now() - nseCookieAt < 48e4) return nseCookies;
	try {
		const res = await fetch("https://www.nseindia.com/", {
			headers: {
				"User-Agent": UA,
				Accept: "text/html"
			},
			signal: AbortSignal.timeout(1e4),
			redirect: "follow"
		});
		nseCookies = (typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [res.headers.get("set-cookie") || ""]).filter(Boolean).map((c) => c.split(";")[0]).join("; ");
		nseCookieAt = Date.now();
	} catch {
		nseCookies = nseCookies || "";
	}
	return nseCookies;
}
async function nseJson(path) {
	const cookie = await nseSession();
	const res = await fetch("https://www.nseindia.com" + path, {
		headers: {
			"User-Agent": UA,
			Accept: "application/json,text/plain,*/*",
			Referer: "https://www.nseindia.com/",
			Cookie: cookie
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(String(res.status));
	return res.json();
}
function dealDate(raw) {
	return parseIstDate(String(raw || "").trim()) || "";
}
async function fetchDeals() {
	const out = [];
	try {
		const raw = await nseJson("/api/snapshot-capital-market-largedeal");
		const obj = raw && typeof raw === "object" ? raw : {};
		const bulk = obj.BULK_DEALS || obj.bulkDeals || obj.data || [];
		const list = Array.isArray(bulk) ? bulk : [];
		for (const item of list.slice(0, 40)) {
			if (!item || typeof item !== "object") continue;
			const o = item;
			const symbol = String(o.symbol || o.nseSymbol || "").toUpperCase();
			if (!symbol) continue;
			const qty = o.qty || o.quantity || "";
			const side = String(o.buySell || o.dealType || o.clientName || "");
			out.push({
				symbol,
				name: universeName(symbol) || String(o.name || symbol),
				date: dealDate(o.date || o.dealDate || o.timestamp),
				kind: /block/i.test(String(o.dealType || o.type || "")) ? "block" : "bulk",
				note: [side, qty ? String(qty) + " shares" : ""].filter(Boolean).join(" · ") || "Large deal"
			});
		}
	} catch {}
	try {
		const raw = await nseJson("/api/corporates-pit?index=equities");
		const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray(raw.data) ? raw.data : [];
		for (const item of list.slice(0, 30)) {
			if (!item || typeof item !== "object") continue;
			const o = item;
			const symbol = String(o.symbol || o.nseSymbol || "").toUpperCase();
			if (!symbol) continue;
			const who = String(o.acqName || o.personName || o.tdpTransactionType || "Insider");
			const sec = String(o.secAcq || o.secVal || "");
			out.push({
				symbol,
				name: universeName(symbol) || symbol,
				date: dealDate(o.date || o.broadcastdate || o.timestamp),
				kind: "insider",
				note: [who, sec].filter(Boolean).join(" · ") || "Insider trade"
			});
		}
	} catch {}
	const seen = /* @__PURE__ */ new Set();
	return out.filter((d) => {
		const k = d.kind + d.symbol + d.date + d.note.slice(0, 20);
		if (seen.has(k) || !d.date) return false;
		seen.add(k);
		return true;
	}).slice(0, 48);
}
async function fetchMacro() {
	const hit = cache.get("v4");
	if (hit && Date.now() - hit.at < TTL) return hit.data;
	const [fiidii, results, deals] = await Promise.all([
		fetchFiidii(),
		fetchResults(),
		fetchDeals()
	]);
	const data = {
		fiidii,
		results,
		deals,
		asOf: (/* @__PURE__ */ new Date()).toISOString()
	};
	cache.set("v4", {
		at: Date.now(),
		data
	});
	return data;
}
var Route$20 = createFileRoute("/api/macro")({ server: { handlers: { GET: async () => {
	const pack = await fetchMacro();
	return Response.json(pack);
} } } });
var Route$19 = createFileRoute("/api/news")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const symbol = String(url.searchParams.get("symbol") || "").trim();
	const name = String(url.searchParams.get("name") || "").trim();
	if (!symbol && !name) return Response.json({ items: [] });
	const items = await fetchNews(symbol || name, name || void 0);
	return Response.json({ items });
} } } });
var KINDS = /* @__PURE__ */ new Set([
	"quality",
	"spark",
	"ask",
	"pulse",
	"book",
	"desk",
	"holdings",
	"fund",
	"qual",
	"structure",
	"picks",
	"combine",
	"improve"
]);
var hits$1 = /* @__PURE__ */ new Map();
function limited$1(id, max = 80, windowMs = 6e5) {
	const now = Date.now();
	const arr = (hits$1.get(id) || []).filter((t) => now - t < windowMs);
	if (arr.length >= max) {
		hits$1.set(id, arr);
		return false;
	}
	arr.push(now);
	hits$1.set(id, arr);
	return true;
}
var Route$18 = createFileRoute("/api/note")({ server: { handlers: { POST: async ({ request }) => {
	if (!limited$1(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local")) return Response.json({
		ok: false,
		error: "Too many reads. Try again in a few minutes."
	}, { status: 429 });
	const body = await request.json().catch(() => ({}));
	const kind = body.kind || "";
	if (!KINDS.has(kind)) return Response.json({
		ok: false,
		error: "Unknown desk"
	}, { status: 400 });
	const book = body.book ? {
		name: String(body.book.name || "Portfolio").slice(0, 80),
		bench: String(body.book.bench || "nifty").slice(0, 40),
		names: (body.book.names || []).slice(0, 200).map((h) => ({
			symbol: String(h.symbol || "").slice(0, 24),
			weight: Number(h.weight) || 0,
			sector: String(h.sector || "").slice(0, 40),
			fundTag: String(h.fundApproved || h.fundTag || "").slice(0, 80) || void 0,
			fundRating: String(h.fundRating || "").slice(0, 8) || void 0,
			fundVerdict: String(h.fundVerdict || "").slice(0, 400) || void 0,
			qualTag: String(h.qualApproved || h.qualTag || "").slice(0, 80) || void 0,
			qualPotential: String(h.qualPotential || "").slice(0, 8) || void 0,
			qualVerdict: String(h.qualVerdict || "").slice(0, 400) || void 0,
			fundApproved: String(h.fundApproved || h.fundTag || "").slice(0, 80) || void 0,
			qualApproved: String(h.qualApproved || h.qualTag || "").slice(0, 80) || void 0,
			fundStatus: String(h.fundStatus || "").slice(0, 24) || void 0,
			qualStatus: String(h.qualStatus || "").slice(0, 24) || void 0
		}))
	} : void 0;
	const result = await executeNote({
		symbol: String(body.symbol || "").slice(0, 24),
		kind,
		question: String(body.question || "").slice(0, 400),
		fresh: Number(body.fresh) || void 0,
		book,
		prior: body.prior && (body.prior.fund || body.prior.qual) ? {
			fund: String(body.prior.fund || "").slice(0, 14e3),
			qual: String(body.prior.qual || "").slice(0, 14e3)
		} : void 0,
		chart: body.chart ? {
			interval: String(body.chart.interval || "").slice(0, 8),
			lookback: String(body.chart.lookback || "").slice(0, 8),
			last: Number(body.chart.last) || 0,
			rsi: body.chart.rsi == null ? null : Number(body.chart.rsi),
			mode: String(body.chart.mode || "").slice(0, 16) || void 0,
			swings: (body.chart.swings || []).slice(0, 16).map((s) => ({
				label: String(s.label || "").slice(0, 8),
				price: Number(s.price) || 0,
				t: Number(s.t) || 0
			})),
			levels: (body.chart.levels || []).slice(0, 10).map((l) => ({
				price: Number(l.price) || 0,
				n: Number(l.n) || 0,
				labels: (l.labels || []).slice(0, 6).map((x) => String(x).slice(0, 12))
			})),
			mtf: (body.chart.mtf || []).slice(0, 8).map((l) => ({
				price: Number(l.price) || 0,
				n: Number(l.n) || 0,
				labels: (l.labels || []).slice(0, 6).map((x) => String(x).slice(0, 12))
			}))
		} : void 0
	});
	return Response.json(result);
} } } });
var Route$17 = createFileRoute("/api/ohlc")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const symbol = String(url.searchParams.get("symbol") || "").trim();
	const range = String(url.searchParams.get("range") || "1y");
	const interval = String(url.searchParams.get("interval") || "1d");
	if (!symbol) return Response.json({ error: "symbol required" }, { status: 400 });
	const pack = await fetchOhlc(symbol, range, interval);
	return Response.json(pack);
} } } });
var Route$16 = createFileRoute("/api/quote")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const quotes = await fetchQuotes(String(url.searchParams.get("symbols") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 80));
	return Response.json({
		quotes,
		provider: {
			id: MARKET_PROVIDER.id,
			name: MARKET_PROVIDER.name,
			delay: MARKET_PROVIDER.delay
		}
	});
} } } });
var hits = /* @__PURE__ */ new Map();
function limited(id, max = 16, windowMs = 6e5) {
	const now = Date.now();
	const arr = (hits.get(id) || []).filter((t) => now - t < windowMs);
	if (arr.length >= max) {
		hits.set(id, arr);
		return false;
	}
	arr.push(now);
	hits.set(id, arr);
	return true;
}
var Route$15 = createFileRoute("/api/screen-build")({ server: { handlers: { POST: async ({ request }) => {
	if (!limited(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local")) return Response.json({
		ok: false,
		error: "Too many screens. Try again in a few minutes."
	}, { status: 429 });
	const body = await request.json().catch(() => ({}));
	const image = String(body.image || "");
	if (image && !image.startsWith("data:image/")) return Response.json({
		ok: false,
		error: "Image must be a screenshot from this page."
	}, { status: 400 });
	if (image.length > 12e5) return Response.json({
		ok: false,
		error: "Screenshot is too large. Crop it and try again."
	}, { status: 400 });
	const result = await executeScreenBuild({
		prompt: String(body.prompt || "").slice(0, 1200),
		image: image || void 0
	});
	return Response.json(result);
} } } });
async function hydrate(symbols) {
	const out = [];
	let i = 0;
	const n = Math.min(6, Math.max(1, symbols.length));
	await Promise.all(Array.from({ length: n }, async () => {
		while (i < symbols.length) {
			const s = symbols[i++];
			const row = await fetchScreenerOne(s);
			if (row && row.price > 0) out.push(row);
		}
	}));
	return out.filter((r) => Boolean(r));
}
var Route$14 = createFileRoute("/api/screener")({ server: { handlers: { GET: async ({ request }) => {
	if (!rateLimit("screen:" + clientKey(request), 30, 6e5)) return Response.json({ error: "Too many screener requests. Try again in a few minutes." }, { status: 429 });
	const url = new URL(request.url);
	const add = url.searchParams.get("add") || "";
	const depth = url.searchParams.get("depth") || "";
	const extras = [...new Set(add.split(",").map((s) => s.replace(/\.(NS|BO)$/i, "").trim().toUpperCase()).filter(Boolean))].slice(0, 80);
	const rows = depth === "full" ? await fetchScreener() : await fetchScreenerUniverse();
	const merged = depth === "full" ? rows : mergeScreenRows(rows, []);
	if (!extras.length) return Response.json({
		rows: merged,
		nifty: getNiftySnapshot(),
		asOf: (/* @__PURE__ */ new Date()).toISOString()
	});
	const have = new Set(merged.filter((r) => r.price > 0).map((r) => r.symbol.toUpperCase()));
	const need = extras.filter((s) => !have.has(s));
	const more = need.length ? await hydrate(need) : [];
	return Response.json({
		rows: [...merged, ...more],
		nifty: getNiftySnapshot(),
		asOf: (/* @__PURE__ */ new Date()).toISOString()
	});
} } } });
var Route$13 = createFileRoute("/api/search")({ server: { handlers: { GET: async ({ request }) => {
	const q = new URL(request.url).searchParams.get("q") || "";
	if (!q.trim()) return Response.json({ quotes: [] });
	const live = await searchMaster(q.trim(), 10).catch(() => []);
	const local = (live.length ? live : searchNse(q.trim(), 10)).map((x) => ({
		symbol: x.symbol,
		name: x.name,
		exch: "NSE"
	}));
	const seen = new Set(local.map((x) => x.symbol.toUpperCase()));
	const rest = (await searchSymbols(q.trim())).filter((x) => {
		const bare = x.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
		if (seen.has(bare) || seen.has(x.symbol.toUpperCase())) return false;
		seen.add(bare);
		return true;
	});
	return Response.json({ quotes: [...local, ...rest].slice(0, 16) });
} } } });
var reads = /* @__PURE__ */ new Map();
var status = "idle";
var error = "";
var universe = null;
function getUniverse() {
	if (universe) return universe;
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const x of [...NIFTY50, ...NIFTY500]) {
		const s = x.symbol.toUpperCase();
		if (seen.has(s)) continue;
		seen.add(s);
		out.push({
			symbol: s,
			name: x.name
		});
	}
	universe = out;
	return out;
}
function snap() {
	return {
		status,
		autoScan: "disabled",
		note: "Automatic Nifty 500 AI coverage is off. Analysis runs when you ask for a name.",
		total: getUniverse().length,
		done: reads.size,
		error,
		reads: [...reads.values()].sort((a, b) => b.at - a.at)
	};
}
function putSkillRead(r) {
	const symbol = String(r.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
	if (!symbol) return;
	reads.set(symbol, {
		...r,
		symbol
	});
}
function getSkillBoard() {
	return snap();
}
function kickSkillBoard() {
	status = "done";
	return snap();
}
var Route$12 = createFileRoute("/api/skill-board")({ server: { handlers: {
	GET: async () => {
		return Response.json(getSkillBoard());
	},
	POST: async ({ request }) => {
		const body = await request.json().catch(() => ({}));
		if (body.kick) return Response.json(kickSkillBoard());
		const symbol = String(body.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
		if (!symbol || !body.fundRating || !body.qualPotential) return Response.json(getSkillBoard());
		putSkillRead({
			symbol,
			name: String(body.name || symbol).slice(0, 80),
			sector: String(body.sector || "Other").slice(0, 40),
			fundTag: String(body.fundTag || "").slice(0, 40),
			fundRating: body.fundRating === "pass" ? "pass" : "fail",
			fundVerdict: String(body.fundVerdict || "").slice(0, 400),
			qualTag: String(body.qualTag || "").slice(0, 40),
			qualPotential: body.qualPotential === "yes" ? "yes" : "no",
			qualVerdict: String(body.qualVerdict || "").slice(0, 400),
			at: Number(body.at) || Date.now()
		});
		return Response.json(getSkillBoard());
	}
} } });
var Route$11 = createFileRoute("/api/tape")({ server: { handlers: { GET: async () => {
	const rows = await fetchTape();
	return Response.json({
		rows,
		asOf: (/* @__PURE__ */ new Date()).toISOString()
	});
} } } });
var Route$10 = createFileRoute("/api/wiki")({ server: { handlers: { GET: async ({ request }) => {
	const name = String(new URL(request.url).searchParams.get("name") || "").trim();
	if (!name) return Response.json({ card: null });
	const card = await fetchWiki(name);
	return Response.json({ card });
} } } });
var $$splitComponentImporter$8 = () => import("./p._id-BZqvgXOM.mjs");
var Route$9 = createFileRoute("/p/$id")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./s._symbol-id0C7k_T.mjs");
var Route$8 = createFileRoute("/s/$symbol")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var Route$7 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var $$splitComponentImporter$6 = () => import("./p._id.index-DWS32Z0I.mjs");
var Route$6 = createFileRoute("/p/$id/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./p._id.holdings-BhZyzffM.mjs");
var Route$5 = createFileRoute("/p/$id/holdings")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./p._id.improve-CqA3XR0X.mjs");
var Route$4 = createFileRoute("/p/$id/improve")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./p._id.path-D7MujA-3.mjs");
var Route$3 = createFileRoute("/p/$id/path")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./p._id.performance-BA2czwUl.mjs");
var Route$2 = createFileRoute("/p/$id/performance")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./p._id.risk-BdVxrUJv.mjs");
var Route$1 = createFileRoute("/p/$id/risk")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./p._id.sectors-CHp-69ri.mjs");
var Route = createFileRoute("/p/$id/sectors")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$38.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$39
});
var AppRoute = Route$37.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$39
});
var CompareRoute = Route$36.update({
	id: "/compare",
	path: "/compare",
	getParentRoute: () => Route$39
});
var IconsRoute = Route$35.update({
	id: "/icons",
	path: "/icons",
	getParentRoute: () => Route$39
});
var LoginRoute = Route$34.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$39
});
var MarketsRoute = Route$33.update({
	id: "/markets",
	path: "/markets",
	getParentRoute: () => Route$39
});
var PicksRoute = Route$32.update({
	id: "/picks",
	path: "/picks",
	getParentRoute: () => Route$39
});
var PrivacyRoute = Route$31.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$39
});
var ScreenRoute = Route$30.update({
	id: "/screen",
	path: "/screen",
	getParentRoute: () => Route$39
});
var SignupRoute = Route$29.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$39
});
var TermsRoute = Route$28.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$39
});
var TradeRoute = Route$27.update({
	id: "/trade",
	path: "/trade",
	getParentRoute: () => Route$39
});
var WatchRoute = Route$26.update({
	id: "/watch",
	path: "/watch",
	getParentRoute: () => Route$39
});
var ApiCloseRoute = Route$25.update({
	id: "/api/close",
	path: "/api/close",
	getParentRoute: () => Route$39
});
var ApiEnrichRoute = Route$24.update({
	id: "/api/enrich",
	path: "/api/enrich",
	getParentRoute: () => Route$39
});
var ApiFundamentalsRoute = Route$23.update({
	id: "/api/fundamentals",
	path: "/api/fundamentals",
	getParentRoute: () => Route$39
});
var ApiHistoriesRoute = Route$22.update({
	id: "/api/histories",
	path: "/api/histories",
	getParentRoute: () => Route$39
});
var ApiHistoryRoute = Route$21.update({
	id: "/api/history",
	path: "/api/history",
	getParentRoute: () => Route$39
});
var ApiMacroRoute = Route$20.update({
	id: "/api/macro",
	path: "/api/macro",
	getParentRoute: () => Route$39
});
var ApiNewsRoute = Route$19.update({
	id: "/api/news",
	path: "/api/news",
	getParentRoute: () => Route$39
});
var ApiNoteRoute = Route$18.update({
	id: "/api/note",
	path: "/api/note",
	getParentRoute: () => Route$39
});
var ApiOhlcRoute = Route$17.update({
	id: "/api/ohlc",
	path: "/api/ohlc",
	getParentRoute: () => Route$39
});
var ApiQuoteRoute = Route$16.update({
	id: "/api/quote",
	path: "/api/quote",
	getParentRoute: () => Route$39
});
var ApiScreenBuildRoute = Route$15.update({
	id: "/api/screen-build",
	path: "/api/screen-build",
	getParentRoute: () => Route$39
});
var ApiScreenerRoute = Route$14.update({
	id: "/api/screener",
	path: "/api/screener",
	getParentRoute: () => Route$39
});
var ApiSearchRoute = Route$13.update({
	id: "/api/search",
	path: "/api/search",
	getParentRoute: () => Route$39
});
var ApiSkillBoardRoute = Route$12.update({
	id: "/api/skill-board",
	path: "/api/skill-board",
	getParentRoute: () => Route$39
});
var ApiTapeRoute = Route$11.update({
	id: "/api/tape",
	path: "/api/tape",
	getParentRoute: () => Route$39
});
var ApiWikiRoute = Route$10.update({
	id: "/api/wiki",
	path: "/api/wiki",
	getParentRoute: () => Route$39
});
var PIdRoute = Route$9.update({
	id: "/p/$id",
	path: "/p/$id",
	getParentRoute: () => Route$39
});
var SSymbolRoute = Route$8.update({
	id: "/s/$symbol",
	path: "/s/$symbol",
	getParentRoute: () => Route$39
});
var ApiAuthSplatRoute = Route$7.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$39
});
var PIdIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => PIdRoute
});
var PIdRouteChildren = {
	PIdHoldingsRoute: Route$5.update({
		id: "/holdings",
		path: "/holdings",
		getParentRoute: () => PIdRoute
	}),
	PIdImproveRoute: Route$4.update({
		id: "/improve",
		path: "/improve",
		getParentRoute: () => PIdRoute
	}),
	PIdPathRoute: Route$3.update({
		id: "/path",
		path: "/path",
		getParentRoute: () => PIdRoute
	}),
	PIdPerformanceRoute: Route$2.update({
		id: "/performance",
		path: "/performance",
		getParentRoute: () => PIdRoute
	}),
	PIdRiskRoute: Route$1.update({
		id: "/risk",
		path: "/risk",
		getParentRoute: () => PIdRoute
	}),
	PIdSectorsRoute: Route.update({
		id: "/sectors",
		path: "/sectors",
		getParentRoute: () => PIdRoute
	}),
	PIdIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute,
	CompareRoute,
	IconsRoute,
	LoginRoute,
	MarketsRoute,
	PicksRoute,
	PrivacyRoute,
	ScreenRoute,
	SignupRoute,
	TermsRoute,
	TradeRoute,
	WatchRoute,
	ApiCloseRoute,
	ApiEnrichRoute,
	ApiFundamentalsRoute,
	ApiHistoriesRoute,
	ApiHistoryRoute,
	ApiMacroRoute,
	ApiNewsRoute,
	ApiNoteRoute,
	ApiOhlcRoute,
	ApiQuoteRoute,
	ApiScreenBuildRoute,
	ApiScreenerRoute,
	ApiSearchRoute,
	ApiSkillBoardRoute,
	ApiTapeRoute,
	ApiWikiRoute,
	PIdRoute: PIdRoute._addFileChildren(PIdRouteChildren),
	SSymbolRoute,
	ApiAuthSplatRoute
};
var routeTree = Route$39._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFound,
		scrollRestoration: true
	});
}
//#endregion
export { sectorPulse as $, getRouter as A, newsTone as B, detectVcp as C, filterSector as D, filterNews as E, matchLabel as F, pickScreenRow as G, newsWhy as H, mergeScreenRows as I, researchBatches as J, pool as K, missingDisplayed as L, istDateMs as M, listedSymbolFromResearch as N, formatIstDate as O, marketTemp as P, scoreMultibagger as Q, newsBucket as R, compareIstDate as S, fillBlankScreenFund as T, parseIstDate as U, newsToneLabel as V, pathIdentityAsk as W, router_exports as X, researchPlan as Y, rulesForScreen as Z, asSpark as _, crTicks as _t, Route$9 as a, skillReadFrom as at, candidateMultibagger as b, fullCr as bt, Tooltip as c, usablePathPrice as ct, applyScreen as d, buildFieldReport as dt, seedCompletion as et, asFund as f, formatShPeriod as ft, asQuality as g, compactCr as gt, asQual as h, buildFinRows as ht, Route$8 as i, skillPeek as it, isTerminalStatus as j, formatIstShort as k, applyFilter as l, useCurrentUser as lt, asPulse as m, stakeDelta as mt, NEWS_BUCKETS as n, skillOutputReady as nt, SCREEN_PRESETS as o, skillReadMerge as ot, asMix as p, missingFieldLabels as pt, remainingJobs as q, Route$33 as r, skillPass as rt, ThemeToggle as s, sortRows as st, AuthScreen as t, skillOf as tt, applyResearchToFund as u, useCurrentUserState as ut, asStructure as v, formatFinMonth as vt, explainGaps as w, classifySkillError as x, parsePeriod as xt, businessView as y, formatFinPeriod as yt, newsMaterial as z };
