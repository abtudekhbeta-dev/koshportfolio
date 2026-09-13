import { et as NIFTY50, ln as sectorOf } from "./router-oJX0L9_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screens-BehhQ_HG.js
var SCREEN_PRESETS = [
	{
		id: "soundmb",
		label: "Sound multibagger",
		hint: "3Y/5Y growth, promoter >50%, DE ≤0.5, ROCE ≥20%, OPM ≥12%, PEG ≤2"
	},
	{
		id: "turnmb",
		label: "Turnaround multibagger",
		hint: "Profit turn, 1Y profit ≥100%, sales ≥15%, DE ≤1, ROCE ≥12%, promoter ≥40%"
	},
	{
		id: "qgrowth",
		label: "Quality growth",
		hint: "ROE ≥15%, sales 1Y ≥12%, profit growth available, debt/equity ≤1"
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
var TRADE_SCANS = [
	{
		id: "breakout",
		label: "Breakout",
		hint: "Near high + volume"
	},
	{
		id: "hot",
		label: "Volume",
		hint: "≥ 1.4× 20-day volume"
	},
	{
		id: "high",
		label: "Near high",
		hint: "Within 5% of 52-week high"
	},
	{
		id: "nr7",
		label: "NR7",
		hint: "Tightest range in 7 days"
	},
	{
		id: "oversold",
		label: "RSI < 40",
		hint: "Oversold"
	},
	{
		id: "macd",
		label: "MACD up",
		hint: "Histogram flip with 50-day"
	},
	{
		id: "gapup",
		label: "Gap up",
		hint: "Open ≥ 1.5% above prior close"
	},
	{
		id: "squeeze",
		label: "Squeeze",
		hint: "Quiet Bollinger, waiting"
	}
];
var NIFTY = new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));
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
	const src = rows.filter((r) => r.price > 0);
	if (id === "nifty") return src.filter((r) => NIFTY.has(r.symbol.toUpperCase()));
	if (id === "up") return sortRows(src, "changePct", "desc");
	if (id === "down") return sortRows(src, "changePct", "asc");
	if (id === "hot") return sortRows(src.filter((r) => (r.volRatio ?? 0) >= 1.4), "vol", "desc");
	if (id === "high") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh >= -5), "offHigh", "desc");
	if (id === "stretch") return sortRows(src.filter((r) => r.offHigh != null && r.offHigh <= -15), "offHigh", "asc");
	if (id === "oversold") return sortRows(src.filter((r) => r.rsi != null && r.rsi < 40), "rsi", "asc");
	if (id === "overbought") return sortRows(src.filter((r) => r.rsi != null && r.rsi > 70), "rsi", "desc");
	if (id === "above200") return src.filter((r) => r.above200 === true);
	if (id === "cheap") return sortRows(src.filter((r) => r.pe != null && r.pe > 0 && r.pe < 20), "pe", "asc");
	if (id === "quality") return sortRows(src.filter((r) => r.roe != null && r.roe >= 15 && (r.de == null || r.de < 1)), "roe", "desc");
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
	if (id === "qgrowth") return sortRows(src.filter((r) => r.roe != null && r.roe >= 15 && r.salesYoY != null && r.salesYoY >= 12 && (r.de == null || r.de <= 1) && (r.profitYoY != null && r.profitYoY >= 12 || r.profitCagr3 != null && r.profitCagr3 >= 12)), "roe", "desc");
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
/** Rank on the numbers we have. Missing fields are extra checks, not a fail. */
function rankMultibagger(rows, rules, sortKey) {
	const scored = rows.map((r) => {
		const have = rules.filter((x) => x.has(r));
		const pass = have.filter((x) => x.ok(r));
		const fail = have.filter((x) => !x.ok(r));
		const unchecked = rules.filter((x) => !x.has(r)).map((x) => x.label);
		const missed = fail.map((x) => x.label);
		return {
			r: {
				...r,
				passCount: pass.length,
				missed,
				unchecked
			},
			nHave: have.length,
			nPass: pass.length,
			ratio: have.length ? pass.length / have.length : 0
		};
	}).filter((x) => x.nHave >= 3 && x.ratio === 1);
	scored.sort((a, b) => {
		if (b.ratio !== a.ratio) return b.ratio - a.ratio;
		if (b.nPass !== a.nPass) return b.nPass - a.nPass;
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
		fundTag: input.fund.tag,
		fundRating: input.fund.rating,
		fundVerdict: input.fund.verdict,
		qualTag: input.qual.tag,
		qualPotential: input.qual.potential,
		qualVerdict: input.qual.verdict,
		at: Date.now()
	};
}
function skillReadMerge(existing, patch) {
	const symbol = String(patch.symbol || "").replace(/\.(NS|BO)$/i, "").toUpperCase();
	return {
		symbol,
		name: patch.name || existing?.name || symbol,
		sector: patch.sector || existing?.sector || sectorOf(symbol),
		fundTag: patch.fund?.tag || existing?.fundTag || "",
		fundRating: patch.fund?.rating || existing?.fundRating || "fail",
		fundVerdict: patch.fund?.verdict || existing?.fundVerdict || "",
		qualTag: patch.qual?.tag || existing?.qualTag || "",
		qualPotential: patch.qual?.potential || existing?.qualPotential || "no",
		qualVerdict: patch.qual?.verdict || existing?.qualVerdict || "",
		at: Date.now()
	};
}
//#endregion
export { filterSector as a, skillOf as c, skillReadFrom as d, skillReadMerge as f, applyScreen as i, skillPass as l, TRADE_SCANS as n, marketTemp as o, sortRows as p, applyFilter as r, sectorPulse as s, SCREEN_PRESETS as t, skillPeek as u };
