import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as apiResearch, n as apiEnrich } from "./api-DNMbHhUJ.mjs";
import { J as cfoToPat, Jn as useKosh, Y as seriesCagr, pt as parsePeriod, q as applyFormulas, rt as fillFundamentals } from "./router-DRDyE1N8.mjs";
import { t as AIButton } from "./ai-button-D8qNTvVB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/complete-missing-DO7V5Bpt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var SCREEN_FUND_FIELDS = [
	{
		key: "pe",
		label: "P/E"
	},
	{
		key: "pb",
		label: "P/B"
	},
	{
		key: "roe",
		label: "ROE"
	},
	{
		key: "roce",
		label: "ROCE"
	},
	{
		key: "opm",
		label: "OPM"
	},
	{
		key: "de",
		label: "D/E"
	},
	{
		key: "promoters",
		label: "Promoter holding"
	},
	{
		key: "mcapCr",
		label: "Market cap"
	},
	{
		key: "salesYoY",
		label: "Sales growth"
	},
	{
		key: "profitYoY",
		label: "Profit growth"
	},
	{
		key: "divYield",
		label: "Dividend yield"
	}
];
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
	if (/annual sales|revenue history|sales history|revenue from operations/.test(m)) return "sales";
	if (/annual profit|profit history|pat history|net profit/.test(m)) return "profits";
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
	if (item.status === "researched" && item.value != null) {
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
		reason: item.evidence
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
					reason: item.evidence
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
					alt: item.value
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
				reason: item.evidence || "Not found in the sources checked."
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
/**
* One completion action for every incomplete name in the current result.
* Filings first, formulas next, source research only for what is still blank.
* Results are written into the company record and the screen reads them again.
*/
function CompleteMissing({ jobs, noun = "stocks" }) {
	const setDeepFunds = useKosh((s) => s.setDeepFunds);
	const queue = jobs.filter((j) => j.symbol && j.missing.length);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [batch, setBatch] = (0, import_react.useState)([]);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!queue.length && !rows.length) return null;
	async function finishOne(job, mark) {
		mark({
			symbol: job.symbol,
			phase: "filings",
			gaps: []
		});
		const prev = useKosh.getState().deepFunds[job.symbol]?.fund || null;
		let fetched = null;
		try {
			fetched = (await apiEnrich([job.symbol])).funds?.[job.symbol] || null;
		} catch {}
		let fund = seedCompletion(prev, fetched, job.symbol);
		const plan = researchPlan(fund, job.missing);
		let error = "";
		if (plan.ask.length) {
			mark({
				symbol: job.symbol,
				phase: "researching",
				gaps: []
			});
			const items = [];
			for (const ask of researchBatches(plan.ask)) try {
				const res = await apiResearch(job.symbol, ask);
				if (res.ok && res.items?.length) items.push(...res.items);
				else error = res.error || "AI research unavailable";
			} catch {
				error = "AI research unavailable";
			}
			if (items.length) fund = applyResearchToFund(fund, items);
		}
		const latest = useKosh.getState().deepFunds[job.symbol]?.fund || null;
		fund = seedCompletion(fund, latest, job.symbol);
		const gaps = explainGaps(fund, job.missing);
		setDeepFunds({ [job.symbol]: {
			fund,
			at: Date.now(),
			sources: ["complete"]
		} });
		return {
			symbol: job.symbol,
			phase: gaps.length ? "incomplete" : "done",
			gaps,
			error
		};
	}
	async function run() {
		const jobsNow = queue;
		setBatch(jobsNow);
		setBusy(true);
		setRows(jobsNow.map((j) => ({
			symbol: j.symbol,
			phase: "queued",
			gaps: []
		})));
		setOpen(false);
		await pool(jobsNow, 2, async (job) => {
			const row = await finishOne(job, (next) => {
				setRows((cur) => cur.map((r) => r.symbol === next.symbol ? {
					...r,
					...next
				} : r));
			});
			setRows((cur) => cur.map((r) => r.symbol === row.symbol ? row : r));
			return row;
		});
		setBusy(false);
		setOpen(true);
	}
	const shown = rows.length ? rows : [];
	const total = batch.length || queue.length;
	const done = shown.filter((r) => r.phase === "done" || r.phase === "incomplete").length;
	const pending = shown.filter((r) => r.phase === "incomplete");
	const finished = shown.filter((r) => r.phase === "done").length;
	const current = shown.find((r) => r.phase === "researching" || r.phase === "filings");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-fg",
				children: [
					queue.length,
					" ",
					queue.length === 1 ? noun.replace(/s$/, "") : noun,
					" ",
					queue.length === 1 ? "has" : "have",
					" incomplete displayed data"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-[12px] text-muted",
				children: "Filings and formulas run first. Source research fills only what is still blank, with a citation. Every name in this result is included."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
				busy,
				busyLabel: busy ? `Completing ${done} of ${total}…` : void 0,
				onClick: () => void run(),
				children: `Complete missing data for ${queue.length}`
			})]
		}), busy || shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1 overflow-hidden rounded-full bg-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-chart",
						style: { width: `${total ? Math.round(done / total * 100) : 0}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[12px] text-muted",
					children: busy ? `Completing ${done} of ${total}${current ? ` · ${current.symbol} ${current.phase === "researching" ? "researching" : "checking filings"}` : ""}` : `${finished} completed${pending.length ? ` · ${pending.length} still unavailable` : ""}`
				}),
				shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-1 text-[12px] text-muted",
					children: shown.slice(0, busy ? 8 : shown.length).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: r.symbol
						}),
						r.phase === "done" ? " · done" : r.phase === "researching" ? " · researching" : r.phase === "filings" ? " · filings" : r.phase === "queued" ? " · queued" : "",
						r.error ? ` · ${r.error}` : "",
						open && r.gaps.length ? ` · ${r.gaps.map((g) => `${g.label}: ${g.reason}`).join("; ")}` : ""
					] }, r.symbol))
				}) : null
			]
		}) : null]
	});
}
//#endregion
export { seedCompletion as i, SCREEN_FUND_FIELDS as n, missingDisplayed as r, CompleteMissing as t };
