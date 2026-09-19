import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { It as stakeDelta, Pt as Tooltip, Ut as parsePeriod, Vt as formatFinPeriod, _t as grahamNumber, qn as cn } from "./router-CuH7ax2z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kosh-snapshot-BR3rEMfL.js
var import_jsx_runtime = require_jsx_runtime();
/** Scenario valuation — not intrinsic value. Blank when the inputs are missing. */
var DISCOUNT = .12;
var YEARS = 5;
function num(v) {
	return v != null && Number.isFinite(v) ? v : null;
}
/** What 5-year EPS CAGR would justify today's price at a stated exit multiple, discounted at 12%. */
function reverseImpliedCagr(price, eps, exitPe, years = YEARS, discount = DISCOUNT) {
	const p = num(price);
	const e = num(eps);
	const m = num(exitPe);
	if (p == null || e == null || m == null || !(p > 0) || !(e > 0) || !(m > 0)) return null;
	const rhs = p * Math.pow(1 + discount, years) / (e * m);
	if (!(rhs > 0)) return null;
	const g = Math.pow(rhs, 1 / years) - 1;
	if (!Number.isFinite(g) || g < -.9 || g > 4) return null;
	return g * 100;
}
function earningsQualityRead(f) {
	if (!f) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "No company card, so earnings quality is not scored."
	};
	const cfoPat = f.cfoPat;
	const lastCfo = f.cfo.at(-1)?.value ?? null;
	const lastPat = f.profits.at(-1)?.value ?? null;
	if (cfoPat == null && (lastCfo == null || lastPat == null)) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "Cash from operations is not on the company card. Kosh will not guess it."
	};
	const ratio = cfoPat ?? (lastPat && lastPat !== 0 && lastCfo != null ? lastCfo / lastPat : null);
	if (ratio == null || !Number.isFinite(ratio)) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "Cash from operations is not on the company card."
	};
	if (ratio >= 1) return {
		cfoPat: ratio,
		tag: "Cash backs profit",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Accruals are not doing the heavy lifting on this print.`
	};
	if (ratio >= .7) return {
		cfoPat: ratio,
		tag: "Adequate",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Usable, not lush.`
	};
	if (ratio >= .4) return {
		cfoPat: ratio,
		tag: "Soft cash",
		body: `Operating cash is only ${ratio.toFixed(2)}× reported profit. Earnings quality needs a second look — working capital or accruals may be carrying the print.`
	};
	return {
		cfoPat: ratio,
		tag: "Weak cash",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Treat the earnings print as low quality until cash catches up.`
	};
}
function wordOf(current, fair, cheaperIfLower = true) {
	if (current == null || !(current > 0) || fair == null || !(fair > 0)) return "Not enough data";
	const ratio = cheaperIfLower ? current / fair : fair / current;
	if (ratio <= .85) return "Cheaper";
	if (ratio >= 1.15) return "Expensive";
	return "About right";
}
function wordByGap(payingFor, delivered) {
	if (payingFor == null || delivered == null || !Number.isFinite(payingFor) || !Number.isFinite(delivered)) return "Not enough data";
	const gap = payingFor - delivered;
	if (gap >= 5) return "Expensive";
	if (gap <= -5) return "Cheaper";
	return "About right";
}
/** Last session on or before the IST month-end, within ~45 days. */
function yearEndClose(bars, year, month = 3) {
	if (!bars.length || !Number.isFinite(year)) return null;
	const lastDay = month === 2 ? 28 : [
		4,
		6,
		9,
		11
	].includes(month) ? 30 : 31;
	const end = Date.parse(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59+05:30`) / 1e3;
	if (!Number.isFinite(end)) return null;
	const start = end - 3888e3;
	let best = null;
	for (const b of bars) {
		const px = b.c;
		if (!(px > 0)) continue;
		if (b.t > start && b.t <= end) best = px;
	}
	return best;
}
/**
* Reconstruct year-end P/E from yearly profit and the year-end price.
* EPS_t ≈ current EPS × (PAT_t / PAT_now). Share count is assumed roughly stable.
* This is not a filing P/E series.
*/
function reconstructPeHistory(input) {
	const epsNow = num(input.currentEps);
	const bars = input.bars || [];
	const yearly = [];
	for (const p of input.profits || []) {
		if (!Number.isFinite(p.value) || p.value === 0) continue;
		const parsed = parsePeriod(p.period);
		if (!parsed) continue;
		if (!(/^\d{4}$/.test(String(p.period).trim()) || parsed.m === 3 || /^FY/i.test(String(p.period))) && parsed.m !== 3) continue;
		yearly.push({
			period: p.period,
			pat: p.value,
			y: parsed.y,
			m: parsed.m || 3
		});
	}
	yearly.sort((a, b) => a.y - b.y || a.m - b.m);
	const last = yearly.at(-1);
	if (!last || !(last.pat > 0)) return [];
	const out = [];
	for (const y of yearly) {
		const eps = epsNow != null && last.pat > 0 ? epsNow * (y.pat / last.pat) : null;
		const price = yearEndClose(bars, y.y, y.m || 3);
		const pe = eps != null && eps > 0 && price != null && price > 0 ? price / eps : null;
		out.push({
			period: y.period,
			label: formatFinPeriod(y.period, "year"),
			year: y.y,
			pat: y.pat,
			eps: eps != null && Number.isFinite(eps) ? eps : null,
			price,
			pe: pe != null && Number.isFinite(pe) && pe > 0 && pe < 400 ? pe : null
		});
	}
	return out;
}
/** Residual-income P/B. g is capped below both ROE and the 12% discount. */
function justifiedPb(roePct, gPct, rPct = 12) {
	const roe = num(roePct);
	const r = num(rPct);
	if (roe == null || r == null || !(r > 0)) return null;
	const roeU = roe / 100;
	const rU = r / 100;
	const cap = Math.min(roeU, rU) - .01;
	if (!(cap > 0)) return null;
	let gU = num(gPct) != null ? gPct / 100 : 0;
	gU = Math.min(Math.max(gU, -.05), cap);
	if (!(rU > gU)) return null;
	const pb = (roeU - gU) / (rU - gU);
	if (!Number.isFinite(pb) || pb <= 0 || pb > 50) return null;
	return pb;
}
function modelA(input) {
	const word = wordOf(input.pe, input.industryPe, true);
	const rows = [];
	if (input.pe != null) rows.push({
		label: "P/E today",
		value: `${input.pe.toFixed(1)}×`
	});
	if (input.industryPe != null) rows.push({
		label: "Industry P/E",
		value: `${input.industryPe.toFixed(1)}×`
	});
	if (input.eps != null && input.eps > 0) rows.push({
		label: "EPS today",
		value: `₹${input.eps.toFixed(1)}`
	});
	const currentPe = input.pe;
	const higher = [...input.hist].filter((p) => p.pe != null && (currentPe == null || p.pe > currentPe + .4)).sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
	const peak = [...input.hist].filter((p) => p.pe != null).sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
	const then = higher || (peak && currentPe != null && peak.pe != null && peak.pe > currentPe ? peak : null);
	if (then && then.pe != null) {
		rows.push({
			label: `P/E ${then.label}`,
			value: `${then.pe.toFixed(1)}×`
		});
		if (then.eps != null) rows.push({
			label: `EPS ${then.label}`,
			value: `₹${then.eps.toFixed(1)}`
		});
	}
	const bits = [];
	if (input.pe != null && input.industryPe != null) {
		const gap = (input.pe / input.industryPe - 1) * 100;
		if (Math.abs(gap) < 10) bits.push(`P/E is in line with the reported industry (${input.pe.toFixed(0)} vs ${input.industryPe.toFixed(0)}).`);
		else if (gap > 0) bits.push(`P/E is ${gap.toFixed(0)}% above the reported industry multiple.`);
		else bits.push(`P/E is ${Math.abs(gap).toFixed(0)}% below the reported industry multiple.`);
	} else bits.push("Industry P/E is not on the card, so there is no relative call.");
	if (then && then.pe != null && then.eps != null && input.eps != null) {
		const epsMove = input.eps - then.eps;
		bits.push(`When P/E was ${then.pe.toFixed(0)}× (${then.label}), EPS was ₹${then.eps.toFixed(1)}. Today EPS is ₹${input.eps.toFixed(1)}${epsMove > 0 ? " — earnings have grown since that richer multiple" : epsMove < 0 ? " — earnings are lower than at that richer multiple" : ""}.`);
	} else if (input.hist.some((p) => p.pe != null)) bits.push("No earlier reconstructed year had a higher P/E than today.");
	else bits.push("A reconstructed P/E history needs yearly profit and year-end prices. Share count is assumed roughly stable — this is not a filing P/E.");
	return {
		id: "A+",
		title: "P/E vs industry, EPS then vs now",
		word,
		figure: input.pe != null && input.industryPe != null ? `${input.pe.toFixed(0)}× vs ${input.industryPe.toFixed(0)}× industry` : input.pe != null ? `${input.pe.toFixed(1)}× P/E` : "No P/E",
		body: bits.join(" "),
		rows,
		note: "Reconstructed P/E uses yearly profit and the year-end price. Share count is assumed roughly stable. Not a filing series and not a buy call."
	};
}
function modelC(input) {
	const paying = reverseImpliedCagr(input.price, input.eps, input.industryPe);
	const word = wordByGap(paying, input.delivered);
	const rows = [];
	if (paying != null) rows.push({
		label: "Growth the price is paying for",
		value: `${paying.toFixed(0)}% a year`
	});
	if (input.delivered != null) rows.push({
		label: "Growth delivered",
		value: `${input.delivered.toFixed(0)}% a year`
	});
	if (input.industryPe != null) rows.push({
		label: "Exit multiple used",
		value: `${input.industryPe.toFixed(0)}× industry`
	});
	let body;
	if (paying == null) body = "Need last price, positive EPS, and a reported industry multiple to say what growth the price is already paying for.";
	else if (input.delivered == null) body = `The price is already paying for about ${paying.toFixed(0)}% annual earnings growth over 5 years (industry exit, 12% discount as a modelling assumption). Delivered profit CAGR is not on the card, so there is nothing to compare it with.`;
	else body = `The price is already paying for about ${paying.toFixed(0)}% annual earnings growth over 5 years. The company has delivered ${input.delivered.toFixed(0)}% profit CAGR. That is a comparison under those assumptions — not a forecast.`;
	return {
		id: "C",
		title: "Growth the price is paying for",
		word: paying == null ? "Not enough data" : input.delivered == null ? "Not enough data" : word,
		figure: paying != null && input.delivered != null ? `Paying for ${paying.toFixed(0)}% · delivered ${input.delivered.toFixed(0)}%` : paying != null ? `Paying for ${paying.toFixed(0)}%` : "No figure",
		body,
		rows,
		note: "5-year exit at the reported industry multiple, discounted at 12% as a modelling assumption. Not a forecast."
	};
}
function modelD(input) {
	const gKnown = input.growth != null;
	const g = gKnown ? input.growth : 0;
	const just = justifiedPb(input.roe, g, 12);
	const word = wordOf(input.pb, just, true);
	const rows = [];
	if (input.pb != null) rows.push({
		label: "P/B today",
		value: `${input.pb.toFixed(2)}×`
	});
	if (just != null) rows.push({
		label: "Justified P/B",
		value: `${just.toFixed(2)}×`
	});
	if (input.roe != null) rows.push({
		label: "ROE",
		value: `${input.roe.toFixed(1)}%`
	});
	rows.push({
		label: "Discount (r)",
		value: "12%"
	});
	rows.push({
		label: "Growth used (g)",
		value: gKnown ? `${g.toFixed(0)}%` : "0% (no CAGR on card)"
	});
	let body;
	if (input.roe == null) body = "Need ROE to justify a P/B. The card does not have it.";
	else if (just == null) body = "ROE is not high enough versus the 12% discount to justify a P/B on this model.";
	else if (input.pb == null) body = `Justified P/B is ${just.toFixed(2)}× from ROE ${input.roe.toFixed(0)}% and g ${gKnown ? g.toFixed(0) + "%" : "0% (no profit CAGR on the card)"}. Today's P/B is not on the card.`;
	else body = `Justified P/B is ${just.toFixed(2)}× from ROE ${input.roe.toFixed(0)}% (r = 12% labelled). Today's P/B is ${input.pb.toFixed(2)}×. g is ${gKnown ? g.toFixed(0) + "% from recorded profit CAGR" : "set to 0% because a profit CAGR is not on the card"}.`;
	return {
		id: "D",
		title: "Justified P/B from ROE",
		word: just == null || input.pb == null ? "Not enough data" : word,
		figure: just != null && input.pb != null ? `${input.pb.toFixed(2)}× vs ${just.toFixed(2)}× justified` : just != null ? `${just.toFixed(2)}× justified` : "No figure",
		body,
		rows,
		note: "P/B = (ROE − g) / (r − g) with r = 12%. g is capped below ROE and r. Not a buy call."
	};
}
function buildValuationModels(input) {
	const f = input.fund || null;
	const price = num(input.price);
	const eps = num(f?.eps);
	const pe = num(f?.pe) ?? (price != null && eps != null && eps > 0 ? price / eps : null);
	const industryPe = num(f?.industryPe);
	const pb = num(f?.pb);
	const roe = num(f?.roe);
	const delivered = num(f?.profitCagr5) ?? num(f?.profitCagr3);
	const hist = reconstructPeHistory({
		profits: f?.profits,
		currentEps: eps,
		bars: input.bars
	});
	const a = modelA({
		pe,
		industryPe,
		eps,
		hist
	});
	const c = modelC({
		price,
		eps,
		industryPe,
		delivered
	});
	const d = modelD({
		pb,
		roe,
		growth: delivered
	});
	const graham = grahamNumber(eps, f?.book);
	const grahamGap = graham != null && price != null && graham > 0 ? (price / graham - 1) * 100 : null;
	return {
		models: [
			a,
			c,
			d
		],
		simple: a,
		hist,
		graham,
		grahamGap
	};
}
function cr(n) {
	return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}
function buildSnapshot(input) {
	const f = input.fund || null;
	const row = input.row || null;
	const skill = input.skill || null;
	const models = buildValuationModels({
		price: input.price ?? row?.price ?? null,
		fund: f,
		bars: input.bars
	});
	const eq = earningsQualityRead(f);
	const sh = stakeDelta(f?.shareholding);
	const missing = [];
	const lines = [];
	const pe = f?.pe ?? row?.pe ?? null;
	const ind = f?.industryPe ?? null;
	if (pe != null) lines.push({
		label: "P/E",
		value: ind != null ? `${pe.toFixed(1)} vs ${ind.toFixed(0)}` : pe.toFixed(1),
		tone: ind != null ? pe <= ind ? "up" : pe > ind * 1.25 ? "down" : void 0 : void 0,
		hint: "Trailing P/E versus the reported industry multiple."
	});
	else missing.push("P/E");
	const pb = f?.pb ?? row?.pb ?? null;
	if (pb != null) lines.push({
		label: "P/B",
		value: pb.toFixed(2),
		hint: "Price ÷ book value per share on the company card."
	});
	else missing.push("P/B");
	const roe = f?.roe ?? row?.roe ?? null;
	const roce = f?.roce ?? row?.roce ?? null;
	if (roe != null) lines.push({
		label: "ROE",
		value: `${roe.toFixed(1)}%`,
		tone: roe >= 15 ? "up" : roe < 8 ? "down" : void 0,
		hint: "Return on equity from the company card."
	});
	else if (roce != null) lines.push({
		label: "ROCE",
		value: `${roce.toFixed(1)}%`,
		tone: roce >= 20 ? "up" : roce < 10 ? "down" : void 0,
		hint: "Return on capital employed from the company card."
	});
	else missing.push("ROE");
	const de = f?.de ?? row?.de ?? null;
	if (de != null) lines.push({
		label: "D/E",
		value: de.toFixed(2),
		tone: de <= .5 ? "up" : de > 1.5 ? "down" : void 0,
		hint: "Total debt ÷ equity. Banks often skip this print."
	});
	else missing.push("Debt/equity");
	const sales = f?.salesYoY ?? row?.salesYoY ?? null;
	if (sales != null) lines.push({
		label: "Sales 1Y",
		value: `${sales.toFixed(0)}%`,
		tone: sales >= 12 ? "up" : sales < 0 ? "down" : void 0,
		hint: "Latest yearly sales growth on the company card."
	});
	else missing.push("sales growth");
	const pat1 = f?.profitYoY ?? row?.profitYoY ?? null;
	const pat3 = f?.profitCagr3 ?? row?.profitCagr3 ?? null;
	if (pat1 != null || pat3 != null) {
		const bits = [];
		if (pat1 != null) bits.push(`1Y ${pat1.toFixed(0)}%`);
		if (pat3 != null) bits.push(`3Y ${pat3.toFixed(0)}%`);
		lines.push({
			label: "Profit",
			value: bits.join(" · "),
			tone: (pat3 ?? pat1 ?? 0) >= 12 ? "up" : (pat3 ?? pat1 ?? 0) < 0 ? "down" : void 0,
			hint: "Recorded profit growth from the company card."
		});
	} else missing.push("profit growth");
	const prom = f?.promoters ?? row?.promoters ?? null;
	if (prom != null) {
		const dFii = sh?.fiiDelta ?? row?.fiiDelta ?? null;
		lines.push({
			label: "Promoter",
			value: dFii != null ? `${prom.toFixed(1)}% · FII ${dFii >= 0 ? "+" : ""}${dFii.toFixed(1)} pp` : `${prom.toFixed(1)}%`,
			tone: prom >= 50 ? "up" : prom < 25 ? "down" : void 0,
			hint: "Latest promoter holding. FII change is the last reported quarter versus the one before."
		});
	} else missing.push("promoter holding");
	const mcap = f?.mcapCr ?? row?.mcapCr ?? null;
	if (mcap != null && mcap > 0) lines.push({
		label: "Mcap",
		value: cr(mcap),
		hint: "Shares outstanding × last price, in ₹ crore."
	});
	if (eq.cfoPat != null) lines.push({
		label: "Cash / profit",
		value: `${eq.cfoPat.toFixed(2)}×`,
		tone: eq.cfoPat >= .8 ? "up" : eq.cfoPat < .5 ? "down" : void 0,
		hint: "Latest operating cash ÷ latest reported profit. Missing cash flow stays blank."
	});
	const fundTag = skill?.fundTag || null;
	const qualTag = skill?.qualTag || null;
	const fundPass = skill?.fundRating ? skill.fundRating === "pass" : null;
	const qualYes = skill?.qualPotential ? skill.qualPotential === "yes" : null;
	const bits = [];
	if (fundTag && qualTag) bits.push(`Skills: ${fundTag} · ${qualTag}.`);
	else if (fundTag) bits.push(`Fundamental skill: ${fundTag}.`);
	else if (qualTag) bits.push(`Qualitative skill: ${qualTag}.`);
	bits.push(`${models.simple.word}. ${models.simple.figure}.`);
	return {
		symbol: input.symbol,
		name: input.name || f?.name || input.symbol,
		fundTag,
		qualTag,
		fundPass,
		qualYes,
		lines,
		read: bits.filter(Boolean).join(" "),
		missing
	};
}
function CoverageLine({ cov }) {
	const missing = cov.buckets.filter((b) => !b.ok);
	if (!missing.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-[12px] text-muted",
		children: [
			"Still missing: ",
			missing.map((b) => b.label).join(", "),
			". Blank is missing, not a pass."
		]
	});
}
function wordClass(word) {
	if (word === "Cheaper") return "bg-up/15 text-up";
	if (word === "Expensive") return "bg-down/15 text-down";
	if (word === "About right") return "bg-chart/15 text-chart";
	return "bg-surface-2 text-muted";
}
function WordChip({ word }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em]", wordClass(word)),
		children: word
	});
}
function SnapshotCard({ snap, simple }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Snapshot"
				}), simple ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: simple.word }) : null]
			}),
			snap.fundTag || snap.qualTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2 text-[12px]",
				children: [snap.fundTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-2 py-0.5", snap.fundPass ? "bg-up/15 text-up" : "bg-surface-2 text-muted"),
					children: snap.fundTag
				}) : null, snap.qualTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-2 py-0.5", snap.qualYes ? "bg-up/15 text-up" : "bg-surface-2 text-muted"),
					children: snap.qualTag
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4",
				children: snap.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-2 border-b border-border/50 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[12px] text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: l.hint,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-left text-[12px] text-muted hover:text-fg",
								children: l.label
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: cn("font-mono text-[13px] tabular", l.tone === "up" && "text-up", l.tone === "down" && "text-down"),
						children: l.value
					})]
				}, l.label))
			}),
			simple ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: simple.figure
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] leading-relaxed text-fg",
					children: simple.body
				})]
			}) : null,
			snap.missing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-muted",
				children: [
					"Still unavailable: ",
					snap.missing.join(", "),
					"."
				]
			}) : null
		]
	});
}
function ModelBlock({ model }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[13px] font-semibold",
					children: model.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: model.word })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[13px] tabular text-muted",
				children: model.figure
			}),
			model.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid gap-1",
				children: model.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3 text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular",
						children: r.value
					})]
				}, r.label))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] leading-relaxed text-fg",
				children: model.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] text-subtle",
				children: model.note
			})
		]
	});
}
function ValuationModels({ pack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Valuation models"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-subtle",
				children: "One word is a comparison of the prints we have — Cheaper, About right, Expensive, or Not enough data. Not a buy call."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 lg:grid-cols-3",
				children: pack.models.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelBlock, { model: m }, m.id))
			}),
			pack.graham != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-muted",
				children: [
					"Traditional Graham check (optional): ₹",
					pack.graham.toFixed(0),
					pack.grahamGap != null ? ` · last ${pack.grahamGap >= 0 ? "+" : ""}${pack.grahamGap.toFixed(0)}% versus that filter.` : ".",
					" ",
					"Not a buy call."
				]
			}) : null
		]
	});
}
//#endregion
export { buildSnapshot as a, WordChip as i, SnapshotCard as n, buildValuationModels as o, ValuationModels as r, earningsQualityRead as s, CoverageLine as t };
