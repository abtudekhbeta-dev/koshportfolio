import { o as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as sectorOf, r as capFromMcap } from "./cloud-state-Cn-qMj7l.mjs";
import { a as apiHistories, d as apiOhlc, f as apiQuotes, h as apiScreener, i as apiFundamentals, l as apiNews, o as apiHistory, r as apiEnrich, s as apiMacro, u as apiNote } from "./api-BTUsg1u1.mjs";
import { G as pickScreenRow, c as Tooltip, et as seedCompletion, i as Route$8, pt as missingFieldLabels, tt as skillOf, v as asStructure, y as businessView } from "./router-DhekK0Gr.mjs";
import { E as Layers, F as ArrowUpRight, I as ArrowRight, L as ArrowDownRight, O as Download, S as Maximize2, _ as MousePointer2, a as Trash2, b as Minimize2, c as Square, g as MoveRight, h as Pause, j as Columns2, k as Crosshair, l as Spline, m as Play, n as UnfoldVertical, p as Plus, r as Undo2, s as Star, w as Magnet, y as Minus } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { At as lastNum, Bt as retFrom, Ct as ema, D as isCommodity, Dt as isWatched, G as riskMetrics, Gt as stoch, Ht as sessionOpeningRange, It as priorDayRange, J as sliceNav, Kt as supertrend, M as metalKey, Mt as macd, N as mixCagr, Pt as newDrawId, Q as windowReturn, Qt as useKosh, S as fmtTapePx, St as drawKey, T as gramToMcx, U as previewAdd, Ut as sma, Vt as rsi, _t as bareSymbol, b as fmtPct, bn as resolveBench, d as METALS, dt as Button, en as volAvg, g as dash, gn as cn, gt as atr, i as Seg, nn as vwap, nt as ytdReturn, tn as volumeProfile, ut as universeName, vt as bollinger, wt as fmtVol, x as fmtPx, yt as chartStructure, z as pathFromBars } from "./router-DhekK0Gr2.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./dialog-B66N--Ky.mjs";
import { n as isIstSession, t as AppShell } from "./app-shell-SqIyvoiQ.mjs";
import { t as useChartFullscreen } from "./use-fullscreen-DQ7DYulI.mjs";
import { n as NavChart } from "./nav-chart-DCx_ZXZT.mjs";
import { a as OwnershipBlock, c as StructureView, r as FinancialSnapshot, t as AnalysisSkeleton } from "./analysis-view-DRZIDGcg.mjs";
import { t as AIButton } from "./ai-button-DQ_DAML1.mjs";
import { a as ProseNote, i as NoteDesk, r as NewsBoard } from "./note-desk-GUD__rQ1.mjs";
import { C as panBy, D as zoomRightEdge, E as resetView, S as magnetPrice, T as positionMetrics, _ as histInit, a as ValuationModels, b as histUndo, c as applyDrag, d as buildSnapshot, f as buildValuationModels, h as earningsQualityRead, i as SnapshotCard, l as applyHistoricalFx, m as detectPatterns, n as CoverageLine, p as channelOffFromThird, r as FieldCoverage, s as adjustOhlcToBenchmark, t as AdjustMenu, u as atLatest, v as histPush, w as patternStatusLabel, x as hitTest, y as histRedo } from "./kosh-snapshot-1vlj6Ein.mjs";
import { t as BenchPicker } from "./bench-picker-DdGGsKCU.mjs";
import { n as pickPeers, t as peerInsight } from "./peers-BIapKWzZ.mjs";
import { n as Kpi, r as toneOf, t as AttentionStrip } from "./attention-strip-BA7ZD-5w.mjs";
import { t as CompleteMissing } from "./complete-missing-BkcFdu2a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._symbol-id0C7k_T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function hasNum(v) {
	return v != null && Number.isFinite(v);
}
function hasSeries(pts, n = 2) {
	return (pts || []).filter((p) => Number.isFinite(p.value)).length >= n;
}
function buildCoverage(input) {
	const f = input.fund || null;
	const row = input.row || null;
	const px = input.price ?? row?.price ?? null;
	const buckets = [
		{
			id: "price",
			label: "Price",
			ok: px != null && px > 0,
			hint: "Last exchange print. Blank means we could not price this name."
		},
		{
			id: "financials",
			label: "Financials",
			ok: hasSeries(f?.sales) || hasNum(f?.salesYoY) || hasNum(row?.salesYoY),
			hint: "Revenue and profit from the company card. Blank is missing, not zero."
		},
		{
			id: "ownership",
			label: "Ownership",
			ok: hasNum(f?.promoters) || hasNum(row?.promoters),
			hint: "Latest promoter / FII / DII print. Promoter pledge is filled from the shareholding filing when present."
		},
		{
			id: "valuation",
			label: "Valuation",
			ok: hasNum(f?.pe) || hasNum(row?.pe),
			hint: "Trailing P/E on the company card. Industry P/E is separate."
		},
		{
			id: "quality",
			label: "Quality",
			ok: hasNum(f?.roce) || hasNum(row?.roce) || hasNum(f?.roe || row?.roe) && hasNum(f?.de ?? row?.de),
			hint: "ROCE, or ROE plus debt/equity, from the company card."
		},
		{
			id: "peers",
			label: "Peer data",
			ok: (input.peerCount ?? 0) >= 2,
			hint: "Curated business-line peers with a live print. Sector padding is not used."
		}
	];
	const nOk = buckets.filter((b) => b.ok).length;
	const nAll = buckets.length;
	const pct = Math.round(nOk / nAll * 100);
	return {
		level: pct >= 75 ? "covered" : pct >= 40 ? "partial" : "insufficient",
		pct,
		nOk,
		nAll,
		buckets
	};
}
/** Material P/E disagreement between the company card and the market print. */
function peDiscrepancy(card, market) {
	const a = card != null && Number.isFinite(card) && card > 0 ? card : null;
	const b = market != null && Number.isFinite(market) && market > 0 ? market : null;
	if (a == null || b == null) return null;
	if (Math.abs(a - b) / Math.min(a, b) < .2 || Math.abs(a - b) < 5) return null;
	return {
		metric: "P/E",
		card: a,
		market: b,
		note: "P/E differs between the company card and the market print. The card is used for screens."
	};
}
function AskAi({ symbol }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [text, setText] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function run() {
		const question = q.trim();
		if (!question) return;
		setBusy(true);
		setErr("");
		try {
			const r = await apiNote({
				kind: "ask",
				symbol,
				question
			});
			if (!r.ok) {
				setErr(r.error);
				setText("");
			} else setText(r.text);
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Could not ask right now.");
			setText("");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					run();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"aria-label": "Ask AI",
					className: "h-10 flex-1 rounded-sm bg-bg-elevated px-3 text-sm shadow-[var(--shadow-border)] outline-none",
					placeholder: "Ask AI — e.g. why is volume heavy today?",
					value: q,
					onChange: (e) => setQ(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
					type: "submit",
					busy,
					disabled: !q.trim(),
					children: "Ask"
				})]
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-down",
				children: err
			}) : null,
			text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProseNote, { text }) : null
		]
	});
}
var UP = "var(--color-up)";
var DOWN = "var(--color-down)";
var GRID = "var(--color-chart-grid)";
var TICK = "var(--color-subtle)";
var MA20 = "var(--color-chart)";
var MA50 = "var(--color-warn)";
var MA200 = "var(--color-chart-bench)";
var CMP = "var(--color-warn)";
var INK = "var(--color-fg)";
var ACCENT = "var(--color-accent)";
var VW = 900;
var PAD = {
	l: 12,
	r: 58,
	t: 12,
	b: 22
};
var VOL_H = 64;
/** Visible bars by timeframe — pan/zoom for more, like TradingView. */
var TF_VIEW = {
	"1m": 375,
	"5m": 375,
	"15m": 260,
	"30m": 260,
	"1H": 250,
	"1D": 252,
	"1W": 156,
	"1M": 120
};
var OSC_H = 52;
var FIBS = [
	0,
	.236,
	.382,
	.5,
	.618,
	.786,
	1
];
var EMPTY_BARS = [];
function nice(v) {
	if (!Number.isFinite(v)) return "—";
	const a = Math.abs(v);
	if (a >= 1e3) return v.toFixed(0);
	if (a >= 100) return v.toFixed(1);
	if (a >= 1) return v.toFixed(2);
	return v.toFixed(3);
}
function fmtT(t, intra) {
	const d = /* @__PURE__ */ new Date((t + 19800) * 1e3);
	const y = String(d.getUTCFullYear()).slice(2);
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	if (!intra) return `${y}-${m}-${day}`;
	return `${day}-${m} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
function alignCompare(src, cmp) {
	if (!cmp.length) return src.map(() => null);
	let j = 0;
	let last = null;
	return src.map((b) => {
		while (j < cmp.length && cmp[j].t <= b.t) {
			last = cmp[j].c;
			j += 1;
		}
		return last;
	});
}
function tToX(t, src, xOf) {
	if (!src.length) return xOf(0);
	if (t <= src[0].t) return xOf(0);
	const last = src.length - 1;
	if (t >= src[last].t) return xOf(last);
	let lo = 0;
	let hi = last;
	while (lo < hi) {
		const mid = lo + hi >> 1;
		if (src[mid].t < t) lo = mid + 1;
		else hi = mid;
	}
	const i = lo;
	if (i <= 0) return xOf(0);
	const a = src[i - 1];
	const b = src[i];
	const f = (t - a.t) / (b.t - a.t || 1);
	return xOf(i - 1) + f * (xOf(i) - xOf(i - 1));
}
function PlotSvg({ src, style, inds, intra, logScale, compare, indexScale = false, measure, vh, volOn, levels, showLevels, sessionLevels }) {
	const n = src.length;
	const closes = src.map((b) => b.c);
	const ma20 = sma(closes, 20);
	const ma50 = sma(closes, 50);
	const ma200 = sma(closes, 200);
	const e21 = ema(closes, 21);
	const bb = bollinger(closes, 20, 2);
	const vw = vwap(src);
	const rsis = rsi(closes, 14);
	const mac = macd(closes);
	const sto = stoch(src);
	const showRsi = inds.rsi;
	const showMacd = inds.macd;
	const showSto = inds.stoch;
	const showAtr = Boolean(inds.atr);
	const oscN = (showRsi ? 1 : 0) + (showMacd ? 1 : 0) + (showSto ? 1 : 0) + (showAtr ? 1 : 0);
	const volH = volOn ? VOL_H : 0;
	const plotH = vh - PAD.t - PAD.b - volH - oscN * OSC_H;
	const volTop = PAD.t + plotH;
	let oscTop = volTop + VOL_H;
	const rsiTop = showRsi ? oscTop : 0;
	if (showRsi) oscTop += OSC_H;
	const macdTop = showMacd ? oscTop : 0;
	if (showMacd) oscTop += OSC_H;
	const stoTop = showSto ? oscTop : 0;
	if (showSto) oscTop += OSC_H;
	const atrTop = showAtr ? oscTop : 0;
	const atrVals = showAtr ? atr(src) : [];
	const st = inds.supertrend ? supertrend(src) : null;
	const vpBins = inds.vp ? volumeProfile(src, 22) : [];
	const maxVp = Math.max(...vpBins.map((x) => x.vol), 1);
	const rel = !indexScale && compare.some((x) => x != null);
	const showCmp = compare.some((x) => x != null);
	const base = src[0]?.c || 1;
	const cmpBase = compare.find((x) => x != null && x > 0) || 1;
	const yVal = (v) => rel ? (v / base - 1) * 100 : v;
	let hi = -Infinity;
	let lo = Infinity;
	const consider = (v) => {
		if (v == null || !Number.isFinite(v) || v <= 0 && logScale && !rel) return;
		const y = rel ? yVal(v) : v;
		if (y > hi) hi = y;
		if (y < lo) lo = y;
	};
	for (const b of src) {
		consider(b.h);
		consider(b.l);
		consider(b.c);
	}
	if (inds.ma20) ma20.forEach((v) => consider(v ?? void 0));
	if (inds.ma50) ma50.forEach((v) => consider(v ?? void 0));
	if (inds.ma200) ma200.forEach((v) => consider(v ?? void 0));
	if (rel) compare.forEach((v) => v != null && v > 0 && consider(base * (v / cmpBase)));
	if (indexScale) compare.forEach((v) => v != null && v > 0 && consider(v));
	if (!Number.isFinite(hi) || !Number.isFinite(lo) || hi === lo) {
		hi = rel ? 2 : src[n - 1]?.c || 1;
		lo = rel ? -2 : hi * .98;
	}
	const pad = (hi - lo || 1) * .06;
	const yHi = hi + pad;
	const yLo = lo - pad;
	const maxV = Math.max(...src.map((b) => b.v), 1);
	const useLog = logScale && !rel && yLo > 0;
	const ly = (v) => useLog ? Math.log(Math.max(v, 1e-9)) : v;
	const yTop = ly(yHi);
	const yBot = ly(yLo);
	function xOf(i) {
		const w = VW - PAD.l - PAD.r;
		return PAD.l + (n <= 1 ? w / 2 : i / (n - 1) * w);
	}
	function yOf(v) {
		const lv = ly(rel ? yVal(v) : v);
		return PAD.t + (yTop - lv) / (yTop - yBot || 1) * plotH;
	}
	function linePath(vals, map = (v) => v) {
		const parts = [];
		let drawing = false;
		for (let i = 0; i < n; i++) {
			const v = vals[i];
			if (v == null || !Number.isFinite(v)) {
				drawing = false;
				continue;
			}
			parts.push(`${drawing ? "L" : "M"}${xOf(i).toFixed(1)} ${yOf(map(v)).toFixed(1)}`);
			drawing = true;
		}
		return parts.join(" ");
	}
	const closePath = linePath(closes);
	const areaPath = closePath ? `${closePath} L${xOf(n - 1).toFixed(1)} ${yOf(rel ? base * (1 + yLo / 100) : yLo).toFixed(1)} L${xOf(0).toFixed(1)} ${yOf(rel ? base * (1 + yLo / 100) : yLo).toFixed(1)} Z` : "";
	const yTicks = [
		0,
		1,
		2,
		3,
		4
	].map((i) => {
		const raw = yLo + (yHi - yLo) * i / 4;
		return rel ? base * (1 + raw / 100) : raw;
	});
	const xCount = Math.min(6, n);
	const xIdx = n ? Array.from({ length: xCount }, (_, i) => Math.round(i * (n - 1) / Math.max(1, xCount - 1))) : [];
	const bw = Math.max(1.2, (VW - PAD.l - PAD.r) / Math.max(1, n) * .7);
	const last = src[n - 1];
	const upLast = last && last.c >= last.o;
	function oscPath(vals, top, loB, hiB) {
		const parts = [];
		let drawing = false;
		for (let i = 0; i < n; i++) {
			const v = vals[i];
			if (v == null) {
				drawing = false;
				continue;
			}
			const y = top + (hiB - v) / (hiB - loB || 1) * 44;
			parts.push(`${drawing ? "L" : "M"}${xOf(i).toFixed(1)} ${y.toFixed(1)}`);
			drawing = true;
		}
		return parts.join(" ");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${VW} ${vh}`,
		width: "100%",
		height: vh,
		preserveAspectRatio: "none",
		className: "kosh-candle-svg",
		"data-points": n,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "0",
				y: "0",
				width: VW,
				height: vh,
				fill: "var(--color-surface)"
			}),
			yTicks.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: PAD.l,
				y1: yOf(v),
				x2: VW - PAD.r,
				y2: yOf(v),
				stroke: GRID,
				strokeWidth: "1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: VW - PAD.r + 6,
				y: yOf(v),
				fill: TICK,
				fontSize: "10",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				textAnchor: "start",
				dominantBaseline: "middle",
				children: rel ? (yVal(v) >= 0 ? "+" : "") + yVal(v).toFixed(1) + "%" : nice(v)
			})] }, v)),
			xIdx.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: xOf(i),
				y: vh - 6,
				fill: TICK,
				fontSize: "10",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				textAnchor: "middle",
				children: fmtT(src[i].t, intra)
			}, src[i].t)),
			style === "area" && areaPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: areaPath,
				fill: upLast ? UP : DOWN,
				fillOpacity: "0.14",
				stroke: "none"
			}) : null,
			style === "line" || style === "area" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: closePath,
				fill: "none",
				stroke: upLast ? UP : DOWN,
				strokeWidth: "2.2",
				strokeLinejoin: "round",
				strokeLinecap: "round",
				vectorEffect: "nonScalingStroke"
			}) : null,
			style === "candle" || style === "bar" ? src.map((b, i) => {
				const color = b.c >= b.o ? UP : DOWN;
				const x = xOf(i);
				const yH = yOf(b.h);
				const yL = yOf(b.l);
				const yO = yOf(b.o);
				const yC = yOf(b.c);
				const top = Math.min(yO, yC);
				const h = Math.max(1.2, Math.abs(yC - yO));
				if (style === "bar") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: x,
						y1: yH,
						x2: x,
						y2: yL,
						stroke: color,
						strokeWidth: "1.4",
						vectorEffect: "nonScalingStroke"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: x - bw / 2,
						y1: yO,
						x2: x,
						y2: yO,
						stroke: color,
						strokeWidth: "1.4",
						vectorEffect: "nonScalingStroke"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: x,
						y1: yC,
						x2: x + bw / 2,
						y2: yC,
						stroke: color,
						strokeWidth: "1.4",
						vectorEffect: "nonScalingStroke"
					})
				] }, b.t);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: x,
					y1: yH,
					x2: x,
					y2: yL,
					stroke: color,
					strokeWidth: "1.2",
					vectorEffect: "nonScalingStroke"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: x - bw / 2,
					y: top,
					width: bw,
					height: h,
					fill: color
				})] }, b.t);
			}) : null,
			volOn ? src.map((b, i) => {
				const h = Math.max(1, b.v / maxV * 54);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: xOf(i) - bw / 2,
					y: volTop + 54 - h,
					width: bw,
					height: h,
					fill: b.c >= b.o ? UP : DOWN,
					opacity: "0.35"
				}, "v" + b.t);
			}) : null,
			inds.bb && bb.upper.some((x) => x != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(bb.upper),
				fill: "none",
				stroke: MA20,
				strokeOpacity: "0.35",
				strokeWidth: "1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(bb.lower),
				fill: "none",
				stroke: MA20,
				strokeOpacity: "0.35",
				strokeWidth: "1"
			})] }) : null,
			inds.ma20 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(ma20),
				fill: "none",
				stroke: MA20,
				strokeWidth: "1.4",
				vectorEffect: "nonScalingStroke"
			}) : null,
			inds.ma50 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(ma50),
				fill: "none",
				stroke: MA50,
				strokeWidth: "1.4",
				vectorEffect: "nonScalingStroke"
			}) : null,
			inds.ma200 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(ma200),
				fill: "none",
				stroke: MA200,
				strokeWidth: "1.6",
				vectorEffect: "nonScalingStroke"
			}) : null,
			inds.ema21 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(e21),
				fill: "none",
				stroke: DOWN,
				strokeWidth: "1.3",
				strokeDasharray: "4 3",
				vectorEffect: "nonScalingStroke"
			}) : null,
			inds.vwap ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(vw),
				fill: "none",
				stroke: MA50,
				strokeWidth: "1.3",
				vectorEffect: "nonScalingStroke"
			}) : null,
			showCmp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(compare, rel ? (v) => base * (v / cmpBase) : (v) => v),
				fill: "none",
				stroke: CMP,
				strokeWidth: "1.6",
				vectorEffect: "nonScalingStroke"
			}) : null,
			measure ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: xOf(measure[0]),
					y1: yOf(src[measure[0]].c),
					x2: xOf(measure[1]),
					y2: yOf(src[measure[1]].c),
					stroke: INK,
					strokeWidth: "1.2",
					strokeDasharray: "4 3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: xOf(measure[0]),
					cy: yOf(src[measure[0]].c),
					r: "3",
					fill: INK
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: xOf(measure[1]),
					cy: yOf(src[measure[1]].c),
					r: "3",
					fill: INK
				})
			] }) : null,
			showRsi ? [
				30,
				50,
				70
			].map((lv) => {
				const y = rsiTop + (100 - lv) / 100 * 44;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: PAD.l,
					y1: y,
					x2: VW - PAD.r,
					y2: y,
					stroke: GRID,
					strokeWidth: "1"
				}, lv);
			}) : null,
			showRsi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: oscPath(rsis, rsiTop, 0, 100),
				fill: "none",
				stroke: MA20,
				strokeWidth: "1.4",
				vectorEffect: "nonScalingStroke"
			}) : null,
			showMacd ? src.map((_, i) => {
				const h = mac.hist[i];
				if (h == null) return null;
				const mag = Math.max(...mac.hist.map((x) => Math.abs(x || 0)), .01);
				const mid = macdTop + 22;
				const hh = h / mag * 20;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: xOf(i) - bw / 2,
					y: hh >= 0 ? mid - hh : mid,
					width: bw,
					height: Math.max(1, Math.abs(hh)),
					fill: h >= 0 ? UP : DOWN,
					opacity: "0.45"
				}, "mh" + i);
			}) : null,
			showMacd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: oscPath(mac.line, macdTop, -(lastNum(mac.line.map((x) => Math.abs(x || 0))) || 1), lastNum(mac.line.map((x) => Math.abs(x || 0))) || 1),
				fill: "none",
				stroke: MA20,
				strokeWidth: "1.2"
			}) : null,
			showSto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: oscPath(sto.k, stoTop, 0, 100),
				fill: "none",
				stroke: MA20,
				strokeWidth: "1.3"
			}) : null,
			showSto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: oscPath(sto.d, stoTop, 0, 100),
				fill: "none",
				stroke: MA50,
				strokeWidth: "1.2"
			}) : null,
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: xOf(n - 1),
				cy: yOf(last.c),
				r: "3.2",
				fill: upLast ? UP : DOWN,
				stroke: "var(--color-bg)",
				strokeWidth: "1.2"
			}), !rel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: VW - PAD.r,
				y: yOf(last.c) - 8,
				width: "52",
				height: "16",
				fill: upLast ? UP : DOWN
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: VW - PAD.r + 4,
				y: yOf(last.c) + 3,
				fill: "var(--color-accent-fg)",
				fontSize: "10",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				children: nice(last.c)
			})] }) : null] }) : null,
			!rel && showLevels ? [
				{
					v: levels?.high52,
					label: "52w H",
					color: DOWN
				},
				{
					v: levels?.low52,
					label: "52w L",
					color: UP
				},
				{
					v: levels?.prev,
					label: "Prev",
					color: TICK
				}
			].filter((x) => x.v != null && x.v > 0).filter((x) => x.v <= yHi * 1.04 && x.v >= yLo * .96).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: PAD.l,
				y1: yOf(x.v),
				x2: VW - PAD.r,
				y2: yOf(x.v),
				stroke: x.color,
				strokeWidth: "1",
				strokeDasharray: "5 4",
				strokeOpacity: "0.75",
				vectorEffect: "nonScalingStroke"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: VW - PAD.r + 4,
				y: yOf(x.v),
				fill: x.color,
				fontSize: "9",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				dominantBaseline: "middle",
				children: x.label
			})] }, x.label)) : null,
			st ? src.map((b, i) => {
				if (i === 0 || st.line[i] == null || st.line[i - 1] == null) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: xOf(i - 1),
					y1: yOf(st.line[i - 1]),
					x2: xOf(i),
					y2: yOf(st.line[i]),
					stroke: st.dir[i] === 1 ? UP : DOWN,
					strokeWidth: "1.4",
					vectorEffect: "nonScalingStroke"
				}, "st" + b.t);
			}) : null,
			vpBins.map((bin) => {
				const w = bin.vol / maxVp * 64;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: VW - PAD.r - w,
					y: yOf(bin.price) - 2,
					width: w,
					height: "4",
					fill: MA20,
					opacity: "0.28"
				}, "vp" + bin.price);
			}),
			showAtr ? (() => {
				const hiA = Math.max(...atrVals.map((x) => x || 0), .01);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: oscPath(atrVals, atrTop, 0, hiA),
					fill: "none",
					stroke: MA50,
					strokeWidth: "1.3",
					vectorEffect: "nonScalingStroke"
				});
			})() : null,
			!rel && sessionLevels ? [
				{
					v: sessionLevels.orH,
					label: "ORH",
					color: ACCENT
				},
				{
					v: sessionLevels.orL,
					label: "ORL",
					color: ACCENT
				},
				{
					v: sessionLevels.pdh,
					label: "PDH",
					color: MA50
				},
				{
					v: sessionLevels.pdl,
					label: "PDL",
					color: MA50
				}
			].filter((x) => x.v != null && x.v > 0).filter((x) => x.v <= yHi * 1.04 && x.v >= yLo * .96).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: PAD.l,
				y1: yOf(x.v),
				x2: VW - PAD.r,
				y2: yOf(x.v),
				stroke: x.color,
				strokeWidth: "1",
				strokeDasharray: "2 4",
				strokeOpacity: "0.8",
				vectorEffect: "nonScalingStroke"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: VW - PAD.r + 4,
				y: yOf(x.v),
				fill: x.color,
				fontSize: "9",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				dominantBaseline: "middle",
				children: x.label
			})] }, x.label)) : null
		]
	});
}
var MemoPlot = (0, import_react.memo)(PlotSvg);
function ShapeSvg({ s, src, xOf, yOf, right, selected }) {
	const x0 = tToX(s.t0, src, xOf);
	const y0 = yOf(s.y0);
	const x1 = tToX(s.t1 ?? s.t0, src, xOf);
	const y1 = yOf(s.y1 ?? s.y0);
	const stroke = selected ? "var(--color-fg)" : ACCENT;
	const w = selected ? 1.8 : 1.2;
	const handles = selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x0 - 4,
		y: y0 - 4,
		width: "8",
		height: "8",
		fill: "var(--color-bg)",
		stroke,
		strokeWidth: "1.2"
	}), s.kind !== "hline" && s.kind !== "vline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x1 - 4,
		y: y1 - 4,
		width: "8",
		height: "8",
		fill: "var(--color-bg)",
		stroke,
		strokeWidth: "1.2"
	}) : null] }) : null;
	if (s.kind === "hline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			y1: y0,
			x2: right,
			y2: y0,
			stroke,
			strokeWidth: w,
			vectorEffect: "nonScalingStroke"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: right + 4,
			y: y0,
			fill: stroke,
			fontSize: "9",
			fontFamily: "IBM Plex Mono, ui-monospace, monospace",
			dominantBaseline: "middle",
			children: nice(s.y0)
		}),
		selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: PAD.l - 4,
			y: y0 - 4,
			width: "8",
			height: "8",
			fill: "var(--color-bg)",
			stroke,
			strokeWidth: "1.2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: right - 4,
			y: y0 - 4,
			width: "8",
			height: "8",
			fill: "var(--color-bg)",
			stroke,
			strokeWidth: "1.2"
		})] }) : null
	] });
	if (s.kind === "vline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x0,
		y1: 0,
		x2: x0,
		y2: 2e3,
		stroke,
		strokeWidth: w,
		vectorEffect: "nonScalingStroke"
	}), handles] });
	if (s.kind === "long" || s.kind === "short") {
		const color = s.kind === "long" ? UP : DOWN;
		const m = positionMetrics(s);
		const yStop = yOf(m.stop);
		const left = Math.min(x0, x1);
		const width = Math.max(36, Math.abs(x1 - x0));
		const riskTop = Math.min(y0, yStop);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: left,
				y: Math.min(y0, y1),
				width,
				height: Math.max(2, Math.abs(y1 - y0)),
				fill: color,
				fillOpacity: "0.12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: left,
				y: riskTop,
				width,
				height: Math.max(2, Math.abs(yStop - y0)),
				fill: DOWN,
				fillOpacity: "0.18"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1: y0,
				y2: y0,
				stroke: INK,
				strokeWidth: selected ? 1.6 : 1.2,
				vectorEffect: "nonScalingStroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1: yStop,
				y2: yStop,
				stroke: DOWN,
				strokeWidth: 1.2,
				vectorEffect: "nonScalingStroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1,
				y2: y1,
				stroke: UP,
				strokeWidth: 1.2,
				vectorEffect: "nonScalingStroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + width + 4,
				y: Math.min(y0, y1, yStop) + 10,
				fill: color,
				fontSize: "9",
				fontFamily: "IBM Plex Sans, system-ui, sans-serif",
				children: [
					s.kind === "long" ? "Long" : "Short",
					" · measurement · R:R ",
					m.rr ? m.rr.toFixed(2) : "—"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + width + 4,
				y: Math.min(y0, y1, yStop) + 22,
				fill: TICK,
				fontSize: "9",
				children: [
					"risk ",
					m.riskPct.toFixed(1),
					"% · reward ",
					m.rewardPct.toFixed(1),
					"%"
				]
			}),
			handles
		] });
	}
	if (s.kind === "channel") {
		const off = s.off;
		const y0b = off != null ? yOf(s.y0 + off) : y0;
		const y1b = off != null ? yOf((s.y1 ?? s.y0) + off) : y1;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0,
				x2: x1,
				y2: y1,
				stroke,
				strokeWidth: w,
				vectorEffect: "nonScalingStroke"
			}),
			off != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0b,
				x2: x1,
				y2: y1b,
				stroke,
				strokeWidth: w,
				vectorEffect: "nonScalingStroke"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: `${x0},${y0} ${x1},${y1} ${x1},${y1b} ${x0},${y0b}`,
				fill: ACCENT,
				fillOpacity: "0.08",
				stroke: "none"
			})] }) : null,
			handles,
			selected && off != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: (x0 + x1) / 2 - 4,
				y: (y0b + y1b) / 2 - 4,
				width: "8",
				height: "8",
				fill: "var(--color-bg)",
				stroke,
				strokeWidth: "1.2"
			}) : null
		] });
	}
	if (s.kind === "trend") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x0,
		y1: y0,
		x2: x1,
		y2: y1,
		stroke,
		strokeWidth: selected ? 1.7 : 1.3,
		vectorEffect: "nonScalingStroke"
	}), handles] });
	if (s.kind === "ray") {
		const dx = x1 - x0 || .001;
		const m = (y1 - y0) / dx;
		const xEnd = dx >= 0 ? right : PAD.l;
		const yEnd = y0 + m * (xEnd - x0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: x0,
			y1: y0,
			x2: xEnd,
			y2: yEnd,
			stroke,
			strokeWidth: selected ? 1.7 : 1.3,
			vectorEffect: "nonScalingStroke"
		}), handles] });
	}
	if (s.kind === "rect") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: Math.min(x0, x1),
		y: Math.min(y0, y1),
		width: Math.max(2, Math.abs(x1 - x0)),
		height: Math.max(2, Math.abs(y1 - y0)),
		fill: ACCENT,
		fillOpacity: "0.08",
		stroke,
		strokeWidth: w
	}), handles] });
	const hi = Math.max(s.y0, s.y1 ?? s.y0);
	const span = hi - Math.min(s.y0, s.y1 ?? s.y0) || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [FIBS.map((f) => {
		const px = hi - span * f;
		const y = yOf(px);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			y1: y,
			x2: right,
			y2: y,
			stroke,
			strokeOpacity: f === 0 || f === 1 ? .95 : .55,
			strokeWidth: "1"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			x: PAD.l + 4,
			y: y - 3,
			fill: stroke,
			fontSize: "9",
			fontFamily: "IBM Plex Mono, ui-monospace, monospace",
			children: [
				(f * 100).toFixed(1),
				" ",
				nice(px)
			]
		})] }, f);
	}), handles] });
}
function MarksSvg({ marks, src, xOf, yOf, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: marks.map((m) => {
		const y = yOf(m.price);
		const color = m.tone === "up" ? UP : m.tone === "down" ? DOWN : m.tone === "muted" ? TICK : ACCENT;
		if (m.kind === "sr") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			y1: y,
			x2: right,
			y2: y,
			stroke: color,
			strokeWidth: "1",
			strokeDasharray: "3 5",
			strokeOpacity: "0.7",
			vectorEffect: "nonScalingStroke"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			x: PAD.l + 4,
			y: y - 3,
			fill: color,
			fontSize: "9",
			fontFamily: "IBM Plex Mono, ui-monospace, monospace",
			children: [
				m.label,
				" ",
				nice(m.price)
			]
		})] }, m.id);
		const x = m.t != null ? tToX(m.t, src, xOf) : PAD.l;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x,
			cy: y,
			r: "3",
			fill: color,
			fillOpacity: "0.9"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: x + 5,
			y: y - 5,
			fill: color,
			fontSize: "9",
			fontFamily: "IBM Plex Sans, system-ui, sans-serif",
			children: m.label
		})] }, m.id);
	}) });
}
function PatternSvg({ hits, src, xOf, yOf, intervalId }) {
	const color = (t) => t === "up" ? UP : t === "down" ? DOWN : ACCENT;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: PAD.l + 4,
		y: PAD.t + 12,
		fill: TICK,
		fontSize: "10",
		fontFamily: "IBM Plex Sans, system-ui, sans-serif",
		children: `Patterns on ${intervalId} · last ${src.length} bars`
	}), hits.map((h, i) => {
		const pts = h.points.map((p) => `${tToX(p.t, src, xOf).toFixed(1)},${yOf(p.price).toFixed(1)}`).join(" ");
		const last = h.points[h.points.length - 1];
		const x = last ? tToX(last.t, src, xOf) : PAD.l;
		const y = last ? yOf(last.price) : PAD.t;
		const c = color(h.tone);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [h.points.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points: pts,
			fill: "none",
			stroke: c,
			strokeWidth: "1.4",
			strokeDasharray: "4 3",
			vectorEffect: "nonScalingStroke"
		}) : last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			y1: yOf(last.price),
			x2: VW - PAD.r,
			y2: yOf(last.price),
			stroke: c,
			strokeWidth: "1",
			strokeDasharray: "5 4",
			strokeOpacity: "0.8",
			vectorEffect: "nonScalingStroke"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			x: x + 6,
			y: y - 6,
			fill: c,
			fontSize: "10",
			fontFamily: "IBM Plex Sans, system-ui, sans-serif",
			children: [
				h.label,
				" · ",
				patternStatusLabel(h.status)
			]
		})] }, h.kind + String(i));
	})] });
}
function CandleChart({ bars, intra = false, compareBars, compareLabel, symbol, high52, low52, prevClose }) {
	const prefs = useKosh((s) => s.chartPrefs);
	const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
	const setDrawings = useKosh((s) => s.setDrawings);
	const style = prefs.style;
	const inds = prefs.inds;
	const logScale = prefs.logScale;
	const volOn = prefs.volOn;
	const showLevels = prefs.showLevels === true;
	const sessionOn = prefs.sessionOn !== false;
	const intervalId = prefs.interval;
	const lookback = clampLookback(intervalId, prefs.lookback);
	const spec = fetchSpec(intervalId);
	const queryClient = useQueryClient();
	const live = useQuery({
		queryKey: [
			"ohlc",
			symbol || "",
			spec.range,
			spec.interval
		],
		queryFn: () => apiOhlc(symbol || "", spec.range, spec.interval),
		enabled: Boolean(symbol),
		staleTime: 3e4,
		placeholderData: keepPreviousData
	});
	(0, import_react.useEffect)(() => {
		if (!symbol) return;
		for (const id of {
			"1m": ["5m"],
			"5m": ["1m", "15m"],
			"15m": [
				"5m",
				"30m",
				"1H"
			],
			"30m": ["15m", "1H"],
			"1H": ["15m", "1D"],
			"1D": ["1H", "1W"],
			"1W": ["1D", "1M"],
			"1M": ["1W", "1D"]
		}[intervalId] || []) {
			const s = fetchSpec(id);
			queryClient.prefetchQuery({
				queryKey: [
					"ohlc",
					symbol,
					s.range,
					s.interval
				],
				queryFn: () => apiOhlc(symbol, s.range, s.interval),
				staleTime: 6e4
			});
		}
	}, [
		symbol,
		intervalId,
		queryClient
	]);
	const specRef = (0, import_react.useRef)(spec);
	if (!live.isPlaceholderData) specRef.current = spec;
	const activeSpec = specRef.current;
	const horizon = (live.data && !live.data.missing && live.data.bars?.length ? live.data.bars : bars) || EMPTY_BARS;
	const chartMode = prefs.chartMode || "price";
	const chartBench = prefs.chartBench || "nifty";
	const benchMeta = resolveBench(chartBench);
	const chartHeight = prefs.chartHeight || 580;
	const benchQ = useQuery({
		queryKey: [
			"ohlc",
			benchMeta.symbol,
			"5y",
			"1d"
		],
		queryFn: () => apiOhlc(benchMeta.symbol, "5y", "1d"),
		enabled: chartMode === "bench",
		staleTime: 6e4
	});
	const fxQ = useQuery({
		queryKey: [
			"ohlc",
			"INR=X",
			"5y",
			"1d"
		],
		queryFn: () => apiOhlc("INR=X", "5y", "1d"),
		enabled: chartMode === "usd",
		staleTime: 6e4
	});
	const priceHorizon = (0, import_react.useMemo)(() => {
		if (chartMode !== "usd") return horizon;
		const adj = applyHistoricalFx(horizon, fxQ.data?.bars || []);
		return adj.bars.length >= 2 ? adj.bars : horizon;
	}, [
		chartMode,
		horizon,
		fxQ.data
	]);
	const cmpSource = chartMode === "bench" ? benchQ.data?.bars || [] : compareBars || EMPTY_BARS;
	const chartIntra = live.data && !live.data.missing && live.data.bars?.length ? activeSpec.intra : intra;
	const updating = Boolean(symbol) && live.isFetching;
	const [measureOn, setMeasureOn] = (0, import_react.useState)(false);
	const [measure, setMeasure] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)({
		start: 0,
		count: 0
	});
	const [tool, setTool] = (0, import_react.useState)("pan");
	const [toolLock, setToolLock] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const drawClicks = (0, import_react.useRef)(0);
	const cardRef = (0, import_react.useRef)(null);
	const { fs, fallback, toggle: toggleFs } = useChartFullscreen(cardRef);
	const [replayOn, setReplayOn] = (0, import_react.useState)(false);
	const [replayEnd, setReplayEnd] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [replayPick, setReplayPick] = (0, import_react.useState)(false);
	const magnet = prefs.magnet === true;
	const structOn = prefs.structOn === true;
	const patternsOn = prefs.patternsOn === true;
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [narrow, setNarrow] = (0, import_react.useState)(false);
	const [layoutGen, setLayoutGen] = (0, import_react.useState)(0);
	const [openMenu, setOpenMenu] = (0, import_react.useState)(null);
	const menuRef = (0, import_react.useRef)(null);
	const key = symbol ? drawKey(symbol, intervalId) : "";
	const [shapes, setShapes] = (0, import_react.useState)(() => key ? useKosh.getState().drawings[key] || [] : []);
	const drawHist = (0, import_react.useRef)(histInit([]));
	const wrapRef = (0, import_react.useRef)(null);
	const overlayRef = (0, import_react.useRef)(null);
	const vLine = (0, import_react.useRef)(null);
	const hLine = (0, import_react.useRef)(null);
	const tag = (0, import_react.useRef)(null);
	const dateTag = (0, import_react.useRef)(null);
	const read = (0, import_react.useRef)(null);
	const hoverRaf = (0, import_react.useRef)(0);
	const layout = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	const shapeDrag = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)(view);
	viewRef.current = view;
	const cmpHorizon = cmpSource;
	const full = priceHorizon;
	const nAll = full.length;
	const count = view.count > 0 ? Math.min(view.count, nAll) : nAll;
	const start = Math.max(0, Math.min(Math.max(0, nAll - count), view.start));
	const sliceEnd = replayOn ? Math.max(8, Math.min(nAll, replayEnd || nAll)) : start + count;
	const sliceStart = replayOn ? 0 : start;
	const windowBars = (0, import_react.useMemo)(() => full.slice(sliceStart, sliceEnd), [
		full,
		sliceStart,
		sliceEnd
	]);
	const benchPack = (0, import_react.useMemo)(() => chartMode === "bench" ? adjustOhlcToBenchmark(windowBars, benchQ.data?.bars || [], chartIntra ? "time" : "day") : null, [
		chartMode,
		windowBars,
		benchQ.data,
		chartIntra
	]);
	const src = benchPack && benchPack.bars.length >= 2 ? benchPack.bars : windowBars;
	const indexScale = false;
	const compare = (0, import_react.useMemo)(() => {
		if (chartMode === "bench") return src.map(() => null);
		return alignCompare(windowBars, cmpHorizon);
	}, [
		chartMode,
		src,
		windowBars,
		cmpHorizon
	]);
	const oscN = (inds.rsi ? 1 : 0) + (inds.macd ? 1 : 0) + (inds.stoch ? 1 : 0) + (inds.atr ? 1 : 0);
	const volH = volOn ? VOL_H : 0;
	const vh = (fs ? Math.max(520, (typeof window !== "undefined" ? window.innerHeight : 800) - 180) : narrow ? 300 : chartHeight) + oscN * OSC_H;
	const last = src[src.length - 1];
	const atrLast = lastNum(atr(src));
	const viewRet = src[0]?.c && last?.c ? (last.c / src[0].c - 1) * 100 : null;
	const barSig = full.length ? `${full[0]?.t}:${full[full.length - 1]?.t}:${full.length}` : "0";
	const structure = (0, import_react.useMemo)(() => structOn && src.length >= 20 ? chartStructure(src) : null, [src, structOn]);
	const patterns = (0, import_react.useMemo)(() => patternsOn && src.length >= 24 ? detectPatterns(src) : [], [src, patternsOn]);
	(0, import_react.useEffect)(() => {
		const go = () => setNarrow(window.innerWidth < 640);
		go();
		window.addEventListener("resize", go);
		return () => window.removeEventListener("resize", go);
	}, []);
	(0, import_react.useEffect)(() => {
		const vis = Math.min(TF_VIEW[intervalId] || 252, nAll || 0);
		setView({
			start: Math.max(0, (nAll || 0) - vis),
			count: vis
		});
		setMeasure(null);
		setPending(null);
		setDraft(null);
		setReplayOn(false);
		setPlaying(false);
		setReplayEnd(nAll);
	}, [
		barSig,
		nAll,
		intervalId
	]);
	(0, import_react.useEffect)(() => {
		if (!playing || !replayOn) return;
		const id = window.setInterval(() => {
			setReplayEnd((i) => {
				const next = i + Math.max(1, Math.round(nAll / 180));
				if (next >= nAll) {
					setPlaying(false);
					return nAll;
				}
				return next;
			});
		}, 160);
		return () => window.clearInterval(id);
	}, [
		playing,
		replayOn,
		nAll
	]);
	(0, import_react.useEffect)(() => {
		setShapes(key ? useKosh.getState().drawings[key] || [] : []);
		setDraft(null);
	}, [key]);
	function saveChart() {
		const svg = wrapRef.current?.querySelector("svg");
		if (!svg) return;
		const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `${bareSymbol(symbol || "chart")}.svg`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
	function finishTool() {
		if (!toolLock) {
			setTool("pan");
			setToolLock(false);
		}
	}
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const tagName = e.target?.tagName;
			if (tagName === "INPUT" || tagName === "TEXTAREA") return;
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
				e.preventDefault();
				const step = e.shiftKey ? histRedo(drawHist.current) : histUndo(drawHist.current);
				if (!step) return;
				drawHist.current = step.hist;
				setShapes(step.shapes);
				if (key) setDrawings(key, step.shapes);
				setSelectedId(null);
				return;
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				if (selectedId) {
					e.preventDefault();
					commit(shapes.filter((s) => s.id !== selectedId));
					setSelectedId(null);
				}
				return;
			}
			if (e.key !== "Escape") return;
			if (draft) {
				setDraft(null);
				drawClicks.current = 0;
				return;
			}
			if (selectedId) {
				setSelectedId(null);
				return;
			}
			if (tool !== "pan") {
				setTool("pan");
				setToolLock(false);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		draft,
		fs,
		tool,
		selectedId,
		shapes
	]);
	function commit(next) {
		drawHist.current = histPush(drawHist.current, next);
		setShapes(next);
		if (key) setDrawings(key, next);
	}
	(0, import_react.useEffect)(() => {
		const n = src.length;
		const plotH = vh - PAD.t - PAD.b - volH - oscN * OSC_H;
		const rel = compare.some((x) => x != null);
		const base = src[0]?.c || 1;
		let hi = -Infinity;
		let lo = Infinity;
		for (const b of src) {
			if (b.h > hi) hi = b.h;
			if (b.l < lo) lo = b.l;
		}
		if (!Number.isFinite(hi)) {
			hi = last?.c || 1;
			lo = hi * .98;
		}
		const yHi = hi + (hi - lo) * .06;
		const yLo = lo - (hi - lo) * .06;
		const useLog = logScale && !rel && yLo > 0;
		const ly = (v) => useLog ? Math.log(Math.max(v, 1e-9)) : v;
		const yTop = ly(rel ? (yHi / base - 1) * 100 : yHi);
		const yBot = ly(rel ? (yLo / base - 1) * 100 : yLo);
		layout.current = {
			n,
			src,
			rel,
			base,
			vw: VW,
			vh,
			left: PAD.l,
			right: VW - PAD.r,
			plotTop: PAD.t,
			plotBot: PAD.t + plotH,
			xOf: (i) => PAD.l + (n <= 1 ? (VW - PAD.l - PAD.r) / 2 : i / (n - 1) * (VW - PAD.l - PAD.r)),
			yOf: (v) => {
				const mapped = rel ? (v / base - 1) * 100 : v;
				const lv = ly(mapped);
				return PAD.t + (yTop - lv) / (yTop - yBot || 1) * plotH;
			},
			vOf: (y) => {
				const t = (y - PAD.t) / (plotH || 1);
				const lv = yTop - t * (yTop - yBot);
				const raw = useLog ? Math.exp(lv) : lv;
				return rel ? base * (1 + raw / 100) : raw;
			},
			iOf: (x) => {
				const t = (x - PAD.l) / (VW - PAD.l - PAD.r);
				return Math.round(Math.min(1, Math.max(0, t)) * Math.max(0, n - 1));
			}
		};
		setLayoutGen((g) => g + 1);
	}, [
		src,
		vh,
		oscN,
		logScale,
		compare,
		last,
		volH,
		indexScale
	]);
	function svgXY(e) {
		const el = wrapRef.current;
		if (!el) return {
			x: 0,
			y: 0
		};
		const r = el.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / (r.width || 1) * VW,
			y: (e.clientY - r.top) / (r.height || 1) * vh
		};
	}
	function paint(i, yPx) {
		const L = layout.current;
		const b = src[i];
		if (!L || !b) return;
		const xPct = L.xOf(i) / VW * 100;
		const yPct = Math.min(L.plotBot, Math.max(L.plotTop, yPx)) / vh * 100;
		if (vLine.current) vLine.current.style.left = xPct + "%";
		if (hLine.current) hLine.current.style.top = yPct + "%";
		if (tag.current) {
			tag.current.style.top = yPct + "%";
			tag.current.textContent = nice(L.vOf(yPx));
		}
		if (dateTag.current) {
			dateTag.current.style.left = xPct + "%";
			dateTag.current.style.display = "block";
			dateTag.current.textContent = fmtT(b.t, chartIntra);
		}
		if (read.current) {
			const ch = b.o ? ((b.c - b.o) / b.o * 100).toFixed(2) + "%" : "";
			read.current.textContent = `${fmtT(b.t, chartIntra)}   O ${nice(b.o)}  H ${nice(b.h)}  L ${nice(b.l)}  C ${nice(b.c)}  ${ch}  Vol ${fmtVol(b.v)}`;
		}
	}
	function snapY(i, y) {
		const L = layout.current;
		if (!L) return y;
		const raw = L.vOf(y);
		return magnetPrice(src[i], raw, magnet);
	}
	function onMove(e) {
		const L = layout.current;
		if (!L) return;
		const { x, y } = svgXY(e);
		const i = L.iOf(x);
		const price = snapY(i, y);
		if (shapeDrag.current) {
			const d = shapeDrag.current;
			const dt = (src[i]?.t || d.t) - d.t;
			const dy = price - d.y;
			setShapes((list) => list.map((s) => s.id === d.id ? applyDrag(d.orig, d.mode, dt, dy, src[i]?.t || d.orig.t0, price) : s));
			return;
		}
		if (draft && src[i]) {
			if (draft.kind === "channel" && drawClicks.current >= 2) setDraft({
				...draft,
				off: channelOffFromThird(draft, src[i].t, price)
			});
			else if ((draft.kind === "long" || draft.kind === "short") && drawClicks.current >= 2) setDraft({
				...draft,
				t1: src[i].t,
				y1: price
			});
			else if ((draft.kind === "long" || draft.kind === "short") && drawClicks.current === 1) setDraft({
				...draft,
				y2: price,
				t1: src[i].t
			});
			else setDraft({
				...draft,
				t1: src[i].t,
				y1: price
			});
		}
		if (drag.current && e.buttons && tool === "pan") {
			const dx = e.clientX - drag.current.x;
			const barW = (wrapRef.current?.getBoundingClientRect().width || 900) / Math.max(1, L.n);
			const shift = Math.round(-dx / Math.max(4, barW));
			if (shift) {
				drag.current.moved = true;
				const next = Math.max(0, Math.min(nAll - count, drag.current.start + shift));
				if (next !== viewRef.current.start) setView({
					start: next,
					count
				});
			}
			return;
		}
		if (tool === "pan" && !shapeDrag.current) {
			const hit = hitTest(shapes, x, y, src, L.xOf, L.yOf, L.left, L.right, L.plotTop, L.plotBot);
			e.currentTarget.style.cursor = hit ? hit.mode === "body" ? "move" : "grab" : "crosshair";
		}
		if (hoverRaf.current) cancelAnimationFrame(hoverRaf.current);
		const ii = i;
		const yy = y;
		hoverRaf.current = requestAnimationFrame(() => paint(ii, yy));
	}
	function onDown(e) {
		e.currentTarget.setPointerCapture(e.pointerId);
		const L = layout.current;
		if (!L) return;
		const { x, y } = svgXY(e);
		if (tool === "pan" && !replayPick) {
			const hit = hitTest(shapes, x, y, src, L.xOf, L.yOf, L.left, L.right, L.plotTop, L.plotBot);
			if (hit) {
				const orig = shapes.find((s) => s.id === hit.id);
				if (orig) {
					const i = L.iOf(x);
					shapeDrag.current = {
						id: hit.id,
						mode: hit.mode,
						t: src[i]?.t || orig.t0,
						y: snapY(i, y),
						orig
					};
					setSelectedId(hit.id);
					drag.current = {
						x: e.clientX,
						start,
						moved: false
					};
					return;
				}
			}
			setSelectedId(null);
			drag.current = {
				x: e.clientX,
				start,
				moved: false
			};
		}
	}
	function onUp(e) {
		const L = layout.current;
		const d = drag.current;
		const sd = shapeDrag.current;
		drag.current = null;
		shapeDrag.current = null;
		if (!L) return;
		const { x, y } = svgXY(e);
		const i = L.iOf(x);
		const bar = src[i];
		const price = snapY(i, y);
		if (sd) {
			const t = bar?.t || sd.t;
			const p = Number.isFinite(price) ? price : sd.y;
			commit(shapes.map((s) => s.id === sd.id ? applyDrag(sd.orig, sd.mode, t - sd.t, p - sd.y, t, p) : s));
			return;
		}
		if (!bar) return;
		if (replayOn && (replayPick || !playing)) {
			if (!d || !d.moved) {
				setReplayEnd(Math.max(8, i + 1));
				setReplayPick(false);
				setPlaying(false);
			}
			return;
		}
		if (tool !== "pan") {
			if (tool === "hline" || tool === "vline") {
				const id = newDrawId();
				setShapes((s) => {
					const next = [...s, {
						id,
						kind: tool,
						t0: bar.t,
						y0: price
					}];
					if (key) setDrawings(key, next);
					return next;
				});
				setSelectedId(id);
				finishTool();
				return;
			}
			if (!draft) {
				drawClicks.current = 1;
				setDraft({
					id: newDrawId(),
					kind: tool,
					t0: bar.t,
					y0: price,
					t1: bar.t,
					y1: price
				});
				return;
			}
			if (draft.kind === "channel" && drawClicks.current === 1) {
				drawClicks.current = 2;
				setDraft({
					...draft,
					t1: bar.t,
					y1: price
				});
				return;
			}
			if (draft.kind === "channel" && drawClicks.current >= 2) {
				const done = {
					...draft,
					off: channelOffFromThird(draft, bar.t, price)
				};
				setShapes((s) => {
					const next = [...s, done];
					if (key) setDrawings(key, next);
					return next;
				});
				setSelectedId(done.id);
				setDraft(null);
				drawClicks.current = 0;
				finishTool();
				return;
			}
			if ((draft.kind === "long" || draft.kind === "short") && drawClicks.current === 1) {
				drawClicks.current = 2;
				setDraft({
					...draft,
					y2: price,
					t1: bar.t
				});
				return;
			}
			if ((draft.kind === "long" || draft.kind === "short") && drawClicks.current >= 2) {
				const done = {
					...draft,
					t1: bar.t,
					y1: price
				};
				setShapes((s) => {
					const next = [...s, done];
					if (key) setDrawings(key, next);
					return next;
				});
				setSelectedId(done.id);
				setDraft(null);
				drawClicks.current = 0;
				finishTool();
				return;
			}
			setShapes((s) => {
				const next = [...s, {
					...draft,
					t1: bar.t,
					y1: price
				}];
				if (key) setDrawings(key, next);
				return next;
			});
			setSelectedId(draft.id);
			setDraft(null);
			drawClicks.current = 0;
			finishTool();
			return;
		}
		if (!d || d.moved || !measureOn) return;
		if (pending == null) {
			setPending(i);
			setMeasure(null);
		} else {
			setMeasure([pending, i]);
			setPending(null);
		}
	}
	(0, import_react.useEffect)(() => {
		const el = overlayRef.current;
		if (!el) return;
		const onWheel = (e) => {
			const pinch = e.ctrlKey || e.metaKey;
			const absX = Math.abs(e.deltaX);
			const absY = Math.abs(e.deltaY);
			const pan = !pinch && (e.shiftKey || absX > absY && absX > 0);
			const zoom = pinch || !e.shiftKey && absY > 0 && absY >= absX;
			if (!pan && !zoom) return;
			e.preventDefault();
			if (nAll < 30) return;
			const cur = count || nAll;
			if (pan) {
				const dir = (absX > absY ? e.deltaX : e.deltaY) > 0 ? 1 : -1;
				const step = Math.max(1, Math.round(cur * .08)) * dir;
				setView(panBy({
					start,
					count: cur
				}, nAll, step));
				return;
			}
			setView(zoomRightEdge({
				start,
				count: cur
			}, nAll, e.deltaY < 0));
		};
		let gestureScale = 1;
		const onGestureStart = (e) => {
			e.preventDefault();
			gestureScale = 1;
		};
		const onGestureChange = (e) => {
			e.preventDefault();
			if (nAll < 30) return;
			const scale = Number(e.scale || 1);
			if (Math.abs(scale - gestureScale) < .03) return;
			const zoomIn = scale > gestureScale;
			gestureScale = scale;
			setView(zoomRightEdge({
				start,
				count: count || nAll
			}, nAll, zoomIn));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		el.addEventListener("gesturestart", onGestureStart, { passive: false });
		el.addEventListener("gesturechange", onGestureChange, { passive: false });
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("gesturestart", onGestureStart);
			el.removeEventListener("gesturechange", onGestureChange);
		};
	}, [
		nAll,
		count,
		start,
		vh
	]);
	(0, import_react.useEffect)(() => {
		if (!openMenu) return;
		const on = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
		};
		document.addEventListener("mousedown", on);
		return () => document.removeEventListener("mousedown", on);
	}, [openMenu]);
	function toggle(id) {
		patchChartPrefs({ inds: { [id]: !inds[id] } });
	}
	const L = layout.current;
	if (src.length < 2) {
		const loading = Boolean(symbol) && (live.isPending || live.isFetching);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg bg-surface p-3 sm:p-4 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
						title: "Bar size — 1 minute to 1 month",
						children: "Timeframe"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntervalBar, {
						value: intervalId,
						onChange: (id) => patchChartPrefs({
							interval: id,
							lookback: clampLookback(id, lookback)
						})
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid h-[300px] place-items-center text-sm text-muted sm:h-[420px]",
				"data-testid": "kosh-candle",
				"data-lookback": lookback,
				"data-interval": intervalId,
				"data-points": "0",
				children: loading ? "Updating candles…" : "Not enough prints to draw this range."
			})]
		});
	}
	const measTxt = measure && src[measure[0]] && src[measure[1]] ? (() => {
		const a = src[measure[0]];
		const b = src[measure[1]];
		const pct = a.c ? ((b.c / a.c - 1) * 100).toFixed(2) : "—";
		return `${fmtPx(a.c)} → ${fmtPx(b.c)}  ${pct}%`;
	})() : null;
	const tools = [
		{
			id: "pan",
			label: "Select",
			icon: MousePointer2
		},
		{
			id: "trend",
			label: "Trend",
			icon: Spline
		},
		{
			id: "hline",
			label: "H-line",
			icon: Minus
		},
		{
			id: "vline",
			label: "V-line",
			icon: UnfoldVertical
		},
		{
			id: "ray",
			label: "Ray",
			icon: MoveRight
		},
		{
			id: "rect",
			label: "Rect",
			icon: Square
		},
		{
			id: "fib",
			label: "Fib",
			icon: Layers
		},
		{
			id: "long",
			label: "Long",
			icon: ArrowUpRight
		},
		{
			id: "short",
			label: "Short",
			icon: ArrowDownRight
		},
		{
			id: "channel",
			label: "Channel",
			icon: Columns2
		}
	];
	const onLatest = !replayOn && atLatest({
		start,
		count
	}, nAll);
	const card = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: cardRef,
		className: cn("rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4", fallback && "kosh-chart-fs", fs && "kosh-fs-live"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-x-4 gap-y-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
							title: "Bar size — 1 minute to 1 month",
							children: "Timeframe"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntervalBar, {
							value: intervalId,
							onChange: (id) => patchChartPrefs({
								interval: id,
								lookback: clampLookback(id, lookback)
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
					value: style,
					onChange: (id) => patchChartPrefs({ style: id }),
					options: [
						{
							id: "candle",
							label: "Candles"
						},
						{
							id: "bar",
							label: "Bars"
						},
						{
							id: "line",
							label: "Line"
						},
						{
							id: "area",
							label: "Area"
						}
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center justify-between gap-2 overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					ref: menuRef,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOpenMenu((m) => m === "ind" ? null : "ind"),
								className: cn("h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]", openMenu === "ind" || Object.values(inds).some(Boolean) ? "bg-chart/15 text-fg" : "bg-bg text-muted"),
								children: "Indicators"
							}), openMenu === "ind" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute z-20 mt-1 flex max-w-[min(100vw,28rem)] flex-wrap gap-1 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]",
								children: [
									["ma20", "MA20"],
									["ma50", "MA50"],
									["ma200", "MA200"],
									["ema21", "EMA21"],
									["bb", "BB"],
									["vwap", "VWAP"],
									["rsi", "RSI"],
									["macd", "MACD"],
									["stoch", "Stoch"],
									["atr", "ATR"],
									["supertrend", "ST"],
									["vp", "VP"]
								].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => toggle(id),
									className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", inds[id] ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
									children: label
								}, id))
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": logScale,
							"aria-label": logScale ? "Log scale on" : "Switch to log scale",
							onClick: () => patchChartPrefs({ logScale: !logScale }),
							className: cn("h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]", logScale ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: "Log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdjustMenu, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOpenMenu((m) => m === "ov" ? null : "ov"),
								className: cn("h-8 rounded-sm px-2.5 text-[11px] font-semibold shadow-[var(--shadow-border)]", openMenu === "ov" ? "bg-chart/15 text-fg" : "bg-bg text-muted"),
								children: "Overlays"
							}), openMenu === "ov" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute z-20 mt-1 flex flex-wrap gap-1 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ volOn: !volOn }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", volOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "Volume"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ logScale: !logScale }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", logScale ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "Log scale"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ showLevels: !showLevels }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", showLevels ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "52-week high/low"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ sessionOn: !sessionOn }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", sessionOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "Session"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ structOn: !structOn }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", structOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "HH/HL"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchChartPrefs({ patternsOn: !patternsOn }),
										className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", patternsOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: "Patterns"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										title: "Magnet to open / high / low / close",
										onClick: () => patchChartPrefs({ magnet: !magnet }),
										className: cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", magnet ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Magnet, { className: "size-3.5" }), "Magnet"]
									})
								]
							}) : null]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setMeasureOn((s) => !s);
								setMeasure(null);
								setPending(null);
								setTool("pan");
								setToolLock(false);
							},
							className: cn("h-8 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", measureOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: "Measure"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setView({
									start: 0,
									count: 0
								});
								setReplayOn(false);
								setPlaying(false);
								setReplayEnd(nAll);
							},
							className: "h-8 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
							children: "Reset"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								if (!replayOn) {
									setReplayOn(true);
									setReplayPick(true);
									setPlaying(false);
									setReplayEnd(nAll);
								} else {
									setReplayOn(false);
									setReplayPick(false);
									setPlaying(false);
									setReplayEnd(nAll);
								}
							},
							className: cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", replayOn ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3.5" }), "Replay"]
						}),
						replayOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								if (playing) setPlaying(false);
								else {
									if (replayEnd >= nAll) setReplayEnd(Math.max(8, Math.round(nAll * .25)));
									setReplayPick(false);
									setPlaying(true);
								}
							},
							className: cn("inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", playing ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), playing ? "Pause" : "Play"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: "Save chart",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Save chart",
								onClick: saveChart,
								className: "inline-flex h-8 items-center rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: "Decrease chart height",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Decrease chart height",
								onClick: () => patchChartPrefs({ chartHeight: Math.max(360, chartHeight - 40) }),
								className: "inline-flex h-8 items-center rounded-sm bg-bg px-2 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
								children: "−"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: "Increase chart height",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Increase chart height",
								onClick: () => patchChartPrefs({ chartHeight: Math.min(900, chartHeight + 40) }),
								className: "inline-flex h-8 items-center rounded-sm bg-bg px-2 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
								children: "+"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: fs ? "Exit fullscreen" : "Fullscreen",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": fs ? "Exit fullscreen" : "Fullscreen",
								onClick: () => void toggleFs(),
								className: cn("inline-flex h-8 items-center rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", fs ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
								children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" })
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-1",
				children: [
					tools.map((t) => {
						const Icon = t.icon;
						const on = tool === t.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							title: t.id === "pan" ? "Pan" : on && toolLock ? "Locked — stays after each draw" : "Click once to draw · double-click to keep",
							onClick: () => {
								setTool(t.id);
								setDraft(null);
								setToolLock(false);
								if (t.id !== "pan") setMeasureOn(false);
							},
							onDoubleClick: () => {
								setTool(t.id);
								setToolLock(t.id !== "pan");
								setDraft(null);
								if (t.id !== "pan") setMeasureOn(false);
							},
							className: cn("inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", on ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
								t.label,
								on && toolLock && t.id !== "pan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-chart" }) : null
							]
						}, t.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: "Undo last drawing",
						disabled: !shapes.length && !draft,
						onClick: () => {
							if (draft) setDraft(null);
							else commit(shapes.slice(0, -1));
						},
						className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3.5" }), "Undo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: "Clear drawings",
						disabled: !shapes.length,
						onClick: () => {
							commit([]);
							setDraft(null);
						},
						className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Clear"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: "Delete selected drawing",
						disabled: !selectedId,
						onClick: () => {
							if (!selectedId) return;
							commit(shapes.filter((s) => s.id !== selectedId));
							setSelectedId(null);
						},
						className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Delete"]
					}),
					selectedId && shapes.find((s) => s.id === selectedId)?.kind === "hline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2 text-[11px] text-muted shadow-[var(--shadow-border)]",
						children: ["Price", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							inputMode: "decimal",
							defaultValue: nice(shapes.find((s) => s.id === selectedId).y0),
							className: "h-7 w-[4.5rem] bg-transparent font-mono text-[12px] text-fg tabular outline-none",
							onBlur: (e) => {
								const v = Number(e.target.value);
								if (!Number.isFinite(v)) return;
								commit(shapes.map((s) => s.id === selectedId ? {
									...s,
									y0: v
								} : s));
							},
							onKeyDown: (e) => {
								if (e.key === "Enter") e.target.blur();
							}
						}, selectedId + String(shapes.find((s) => s.id === selectedId)?.y0))]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-subtle",
						children: replayOn && (replayPick || !playing) ? "Click a candle to set the start, then Play." : tool === "pan" ? selectedId ? "Drag the drawing or a handle. Delete to remove." : "Click a drawing to edit · scroll to zoom · drag to pan" : toolLock ? "Stays selected. Esc or Pan to leave." : tool === "hline" ? "Click once to pin a price" : "Two clicks, then back to pan. Double-click the tool to keep it."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: read,
				className: "mt-2 min-h-4 font-mono text-[11px] text-muted tabular",
				children: last ? `${fmtT(last.t, chartIntra)}   O ${nice(last.o)}  H ${nice(last.h)}  L ${nice(last.l)}  C ${nice(last.c)}  Vol ${fmtVol(last.v)}` : ""
			}),
			updating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[11px] text-muted",
				children: "Updating candles…"
			}) : null,
			measTxt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-[11px] text-fg tabular",
				children: measTxt
			}) : null,
			compareLabel && compare.some((x) => x != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 text-[11px] text-warn",
				children: [
					"Overlaid vs ",
					compareLabel,
					" (both as % from the first print in view)"
				]
			}) : chartMode === "bench" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[11px] text-muted",
				children: benchPack && benchPack.bars.length >= 2 ? `${benchMeta.name} adjusted candles. First close in view is 100. The index is taken out of the stock, not drawn beside it.${benchPack.dropped ? ` ${benchPack.dropped} bars had no matching index print.` : ""} Not a signal.` : benchQ.isPending ? `Loading ${benchMeta.name}…` : `${benchMeta.name} history unavailable for this window. Price scale unchanged.`
			}) : chartMode === "usd" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[11px] text-muted",
				children: fxQ.data?.bars?.length ? "USD using each bar’s historical USD/INR. Not today’s rate on old bars." : "USD/INR history unavailable — price scale unchanged."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: "kosh-candle relative mt-2 w-full",
				style: { height: vh },
				"data-testid": "kosh-candle",
				"data-lookback": lookback,
				"data-interval": intervalId,
				"data-points": String(src.length),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoPlot, {
						src,
						style,
						inds,
						intra: chartIntra,
						logScale,
						compare,
						indexScale,
						measure,
						vh,
						volOn,
						levels: {
							high52,
							low52,
							prev: prevClose
						},
						showLevels,
						sessionLevels: sessionOn ? (() => {
							const or = chartIntra ? sessionOpeningRange(src, 15) : null;
							const pd = chartIntra ? priorDayRange(src) : src.length >= 2 ? {
								high: src[src.length - 2].h,
								low: src[src.length - 2].l
							} : null;
							return {
								orH: or?.high,
								orL: or?.low,
								pdh: pd?.high,
								pdl: pd?.low
							};
						})() : void 0
					}),
					L && (shapes.length || draft || structure?.marks.length || patternsOn) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: `0 0 ${VW} ${vh}`,
						width: "100%",
						height: vh,
						preserveAspectRatio: "none",
						className: "pointer-events-none absolute inset-0 z-[3]",
						children: [
							structure?.marks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarksSvg, {
								marks: structure.marks,
								src,
								xOf: L.xOf,
								yOf: L.yOf,
								right: L.right
							}) : null,
							patternsOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatternSvg, {
								hits: patterns,
								src,
								xOf: L.xOf,
								yOf: L.yOf,
								intervalId
							}) : null,
							shapes.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeSvg, {
								s,
								src,
								xOf: L.xOf,
								yOf: L.yOf,
								right: L.right,
								selected: s.id === selectedId
							}, s.id)),
							draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeSvg, {
								s: draft,
								src,
								xOf: L.xOf,
								yOf: L.yOf,
								right: L.right
							}) : null
						]
					}) : null,
					replayOn && (replayPick || !playing) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute top-2 left-1/2 z-[6] -translate-x-1/2 rounded-sm bg-bg-elevated px-2 py-1 text-[11px] text-fg shadow-[var(--shadow-border)]",
						children: "Click the chart where replay should start"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: vLine,
						className: "kosh-cross-v"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: hLine,
						className: "kosh-cross-h"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: tag,
						className: "kosh-px-tag"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: dateTag,
						className: "kosh-date-tag",
						style: { display: "none" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: overlayRef,
						className: "absolute inset-0 z-10 touch-none",
						style: { cursor: tool === "pan" ? selectedId ? "move" : "crosshair" : "cell" },
						onPointerMove: onMove,
						onPointerDown: onDown,
						onPointerUp: onUp,
						onPointerCancel: onUp,
						onPointerLeave: () => {
							if (vLine.current) vLine.current.style.left = "-9px";
							if (hLine.current) hLine.current.style.top = "-9px";
							if (dateTag.current) dateTag.current.style.display = "none";
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-1",
				"data-testid": "chart-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const cur = viewRef.current.count > 0 ? viewRef.current.count : nAll;
							const startNow = viewRef.current.count > 0 ? viewRef.current.start : 0;
							setView(zoomRightEdge({
								start: startNow,
								count: cur
							}, nAll, false));
						},
						className: "h-8 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
						children: "Zoom out"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							const cur = viewRef.current.count > 0 ? viewRef.current.count : nAll;
							const startNow = viewRef.current.count > 0 ? viewRef.current.start : 0;
							setView(zoomRightEdge({
								start: startNow,
								count: cur
							}, nAll, true));
						},
						className: "inline-flex h-8 items-center gap-1 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Zoom in"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: onLatest,
						onClick: () => {
							const vis = Math.min(TF_VIEW[intervalId] || 252, nAll || 0);
							setView(resetView(nAll || 0, vis || 1));
							setReplayOn(false);
							setPlaying(false);
						},
						className: "inline-flex h-8 items-center gap-1 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)] disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveRight, { className: "size-3.5" }), "Go to latest"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const vis = Math.min(TF_VIEW[intervalId] || 252, nAll || 0);
							setView(resetView(nAll || 0, vis || 1));
							setReplayOn(false);
							setPlaying(false);
							setReplayEnd(nAll);
						},
						className: "h-8 rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
						children: "Reset view"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-3 text-[11px] text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular",
						children: [
							src.length,
							" prints",
							count && count < nAll ? ` · window of ${nAll}` : ""
						]
					}),
					last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular text-fg",
						children: fmtPx(last.c)
					}) : null,
					viewRet != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("font-mono tabular", viewRet >= 0 ? "text-up" : "text-down"),
						children: [fmtPct(viewRet), " in view"]
					}) : null,
					atrLast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular",
						children: ["ATR14 ", nice(atrLast)]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IST" }),
					fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Esc to exit" }) : null,
					shapes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						shapes.length,
						" drawing",
						shapes.length === 1 ? "" : "s",
						" saved"
					] }) : null,
					selectedId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Selected · Delete to remove" }) : null,
					structure?.clusters.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex flex-wrap gap-1.5",
						children: structure.clusters.slice(0, 4).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-sm bg-bg px-1.5 py-0.5 font-mono tabular shadow-[var(--shadow-border)]",
							children: [
								c.price >= (last?.c || 0) ? "R" : "S",
								" ",
								nice(c.price)
							]
						}, c.price))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular",
						children: intervalId
					})
				]
			})
		]
	});
	if (fallback && typeof document !== "undefined") return (0, import_react_dom.createPortal)(card, document.body);
	return card;
}
var INTERVALS = [
	{
		id: "1m",
		yahoo: "1m",
		intra: true,
		label: "1m"
	},
	{
		id: "5m",
		yahoo: "5m",
		intra: true,
		label: "5m"
	},
	{
		id: "15m",
		yahoo: "15m",
		intra: true,
		label: "15m"
	},
	{
		id: "30m",
		yahoo: "30m",
		intra: true,
		label: "30m"
	},
	{
		id: "1H",
		yahoo: "60m",
		intra: true,
		label: "1H"
	},
	{
		id: "1D",
		yahoo: "1d",
		intra: false,
		label: "1D"
	},
	{
		id: "1W",
		yahoo: "1wk",
		intra: false,
		label: "1W"
	},
	{
		id: "1M",
		yahoo: "1mo",
		intra: false,
		label: "1M"
	}
];
var LOOKBACKS = [
	{
		id: "1D",
		range: "1d",
		label: "1D"
	},
	{
		id: "5D",
		range: "5d",
		label: "5D"
	},
	{
		id: "1M",
		range: "1mo",
		label: "1M"
	},
	{
		id: "3M",
		range: "3mo",
		label: "3M"
	},
	{
		id: "6M",
		range: "6mo",
		label: "6M"
	},
	{
		id: "YTD",
		range: "ytd",
		label: "YTD"
	},
	{
		id: "1Y",
		range: "1y",
		label: "1Y"
	},
	{
		id: "2Y",
		range: "2y",
		label: "2Y"
	},
	{
		id: "3Y",
		range: "5y",
		label: "3Y"
	},
	{
		id: "5Y",
		range: "5y",
		label: "5Y"
	},
	{
		id: "10Y",
		range: "10y",
		label: "10Y"
	},
	{
		id: "MAX",
		range: "max",
		label: "MAX"
	}
];
var ALLOWED = {
	"1m": ["1D", "5D"],
	"5m": [
		"1D",
		"5D",
		"1M"
	],
	"15m": [
		"1D",
		"5D",
		"1M"
	],
	"30m": [
		"1D",
		"5D",
		"1M"
	],
	"1H": [
		"1D",
		"5D",
		"1M",
		"3M",
		"6M",
		"YTD",
		"1Y"
	],
	"1D": [
		"1D",
		"5D",
		"1M",
		"3M",
		"6M",
		"YTD",
		"1Y",
		"2Y",
		"3Y",
		"5Y",
		"10Y",
		"MAX"
	],
	"1W": [
		"1M",
		"3M",
		"6M",
		"YTD",
		"1Y",
		"2Y",
		"3Y",
		"5Y",
		"10Y",
		"MAX"
	],
	"1M": [
		"1Y",
		"2Y",
		"3Y",
		"5Y",
		"10Y",
		"MAX"
	]
};
function clampLookback(interval, lookback) {
	const allowed = ALLOWED[interval] || ALLOWED["1D"];
	if (allowed.includes(lookback)) return lookback;
	return allowed[allowed.length - 1];
}
function fetchSpec(interval) {
	const iv = INTERVALS.find((x) => x.id === interval) || INTERVALS[5];
	const allowed = ALLOWED[interval] || ALLOWED["1D"];
	const maxLb = allowed[allowed.length - 1];
	return {
		range: (LOOKBACKS.find((x) => x.id === maxLb) || LOOKBACKS[5]).range,
		interval: iv.yahoo,
		intra: iv.intra,
		intervalId: iv.id
	};
}
function IntervalBar({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
		value,
		onChange,
		options: INTERVALS.map((x) => ({
			id: x.id,
			label: x.label
		}))
	});
}
var SLICES = [
	.02,
	.05,
	.1
];
function Chip({ n, label }) {
	if (n == null || !Number.isFinite(n)) return null;
	const nicer = label === "Max fall" ? n > 0 : n >= 0;
	const num = label === "Sharpe" ? (n >= 0 ? "+" : "") + n.toFixed(2) : (n >= 0 ? "+" : "") + n.toFixed(1) + " pp";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("rounded-sm px-2 py-0.5 font-mono text-[12px] tabular", nicer ? "bg-up/15 text-up" : "bg-down/15 text-down"),
		children: [
			label,
			" ",
			num
		]
	});
}
function AddToPortfolio({ symbol, name, px, bars, sector }) {
	const ports = useKosh((s) => s.portfolios);
	const addHoldings = useKosh((s) => s.addHoldings);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [pid, setPid] = (0, import_react.useState)(ports[0]?.id || "");
	const [slice, setSlice] = (0, import_react.useState)(.05);
	const port = ports.find((p) => p.id === pid) || ports[0];
	const already = port?.holdings.find((h) => h.symbol.replace(/\.(NS|BO)$/i, "") === symbol.replace(/\.(NS|BO)$/i, ""));
	const sectorNames = (port?.holdings || []).filter((h) => (h.sector || sectorOf(h.symbol)) === sector);
	const hx = useQuery({
		queryKey: [
			"add-hx",
			port?.id,
			symbol
		],
		queryFn: () => {
			const bench = resolveBench(port.bench);
			const need = [.../* @__PURE__ */ new Set([
				...port.holdings.map((h) => h.symbol),
				symbol,
				bench.symbol
			])];
			return apiHistories(need, "max");
		},
		enabled: open && Boolean(port),
		staleTime: 6e5
	});
	const deltas = (0, import_react.useMemo)(() => {
		if (!port || !(px > 0) || !hx.data?.length) return null;
		const histories = {};
		let benchBars = [];
		const bench = resolveBench(port.bench).symbol;
		for (const pack of hx.data) {
			histories[pack.input] = pack.bars;
			histories[pack.symbol] = pack.bars;
			if (pack.symbol === bench || pack.input === bench) benchBars = pack.bars;
		}
		histories[symbol] = bars.length ? bars : histories[symbol] || [];
		return previewAdd(port.holdings, histories, benchBars, {
			symbol,
			name,
			qty: 1,
			avg: px,
			date: null
		}, bars, slice, px);
	}, [
		port,
		px,
		hx.data,
		bars,
		symbol,
		name,
		slice
	]);
	const qty = Math.max(1, px > 0 ? Math.round(slice / Math.max(.05, 1 - slice) * 5e4 / px) : 1);
	const liveQty = (0, import_react.useMemo)(() => {
		if (!port || !(px > 0) || !hx.data?.length) return qty;
		let v = 0;
		for (const h of port.holdings) {
			const pack = hx.data.find((p) => p.input === h.symbol || p.symbol === h.symbol);
			const last = pack?.price || pack?.bars.at(-1)?.c || 0;
			v += h.qty * last;
		}
		if (!(v > 0)) return qty;
		return Math.max(1, Math.round(slice * v / ((1 - slice) * px)));
	}, [
		port,
		px,
		hx.data,
		slice,
		qty
	]);
	if (!ports.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				children: "Add to portfolio"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "Add to a portfolio",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 text-[13px] leading-relaxed",
				children: [
					ports.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: "Portfolio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-9 rounded-sm bg-bg px-2 shadow-[var(--shadow-border)]",
							value: pid || ports[0].id,
							onChange: (e) => setPid(e.target.value),
							children: ports.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: ports[0].name
					}),
					already ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"You already hold this name (",
						already.qty.toLocaleString("en-IN"),
						" shares). Adding more size."
					] }) : null,
					sectorNames.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"You already have ",
						sectorNames.length,
						" ",
						sector,
						" name",
						sectorNames.length === 1 ? "" : "s",
						" in this portfolio",
						sectorNames[0]?.name ? ` (including ${sectorNames[0].name})` : "",
						". This would add to that sleeve."
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							"No ",
							sector,
							" names in this portfolio yet."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: SLICES.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSlice(w),
							className: cn("h-9 rounded-sm px-3 text-[13px]", slice === w ? "bg-chart text-accent-fg" : "bg-bg shadow-[var(--shadow-border)]"),
							children: [(w * 100).toFixed(0), "%"]
						}, w))
					}),
					deltas ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[12px] text-muted",
							children: [
								"If this became ",
								(slice * 100).toFixed(0),
								"% of the portfolio, last 1 year would have looked like:"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									n: deltas.dSharpe,
									label: "Sharpe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									n: deltas.dMaxDd,
									label: "Max fall"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									n: deltas.dVol,
									label: "Vol"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									n: deltas.dCagr,
									label: "1Y"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[11px] text-subtle",
							children: "How last year would have looked with that mix — not a forecast."
						})
					] }) : open && hx.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "Comparing against this portfolio…"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							if (!port) return;
							addHoldings(port.id, [{
								symbol,
								name,
								qty: liveQty,
								avg: px,
								date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
							}]);
							setOpen(false);
						},
						children: [
							"Add ",
							liveQty.toLocaleString("en-IN"),
							" share",
							liveQty === 1 ? "" : "s",
							" at ",
							(slice * 100).toFixed(0),
							"%"
						]
					})
				]
			})
		})]
	});
}
function LivePrice({ symbol, initial }) {
	const live = isIstSession();
	const metal = metalKey(symbol);
	const q = useQuery({
		queryKey: ["live-quote", symbol],
		queryFn: async () => {
			return (await apiQuotes([symbol]))[0] || null;
		},
		refetchInterval: live ? 3e3 : 6e4,
		staleTime: live ? 1500 : 3e4,
		placeholderData: (prev) => prev
	});
	const quotePx = q.data?.price && q.data.price > 0 ? q.data.price : null;
	const price = metal ? quotePx ? gramToMcx(metal, quotePx) : initial.price : quotePx ?? initial.price;
	const changePct = q.data?.changePct ?? initial.changePct;
	const [flash, setFlash] = (0, import_react.useState)(null);
	const prev = (0, import_react.useRef)(price);
	(0, import_react.useEffect)(() => {
		if (!(price > 0) || prev.current <= 0) {
			prev.current = price;
			return;
		}
		if (price === prev.current) return;
		setFlash(price > prev.current ? "up" : "down");
		prev.current = price;
		const t = window.setTimeout(() => setFlash(null), 700);
		return () => window.clearTimeout(t);
	}, [price]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("inline-flex items-baseline gap-2 rounded-sm px-1.5 py-0.5 font-mono text-[28px] font-medium tabular", flash === "up" && "kosh-tick-up", flash === "down" && "kosh-tick-down"),
			children: metal ? fmtTapePx(price) : fmtPx(price)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-end gap-2",
			children: [
				metal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-subtle",
					children: METALS[metal].displayLabel
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("font-mono text-[15px] tabular", changePct >= 0 ? "text-up" : "text-down"),
					children: fmtPct(changePct)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase", live ? "bg-up/15 text-up" : "bg-surface-2 text-subtle"),
					children: live ? "Live" : "Close"
				})
			]
		})]
	});
}
var MODES = [
	{
		id: "intraday",
		label: "Intraday",
		hint: "15m"
	},
	{
		id: "swing",
		label: "Swing",
		hint: "1D"
	},
	{
		id: "positional",
		label: "Positional",
		hint: "1W"
	},
	{
		id: "chart",
		label: "Chart TF",
		hint: "Matches the chart"
	}
];
var MODE_TF = {
	intraday: "15m",
	swing: "1D",
	positional: "1W"
};
function modeTitle(mode, tf) {
	return `${MODES.find((m) => m.id === mode)?.label || "Chart TF"} · ${tf}`;
}
function StructureDesk({ symbol }) {
	const chartTf = useKosh((s) => s.chartPrefs.interval);
	const [mode, setMode] = (0, import_react.useState)("chart");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [res, setRes] = (0, import_react.useState)(null);
	const tf = mode === "chart" ? chartTf || "1D" : MODE_TF[mode];
	const spec = fetchSpec(tf);
	const ohlc = useQuery({
		queryKey: [
			"ohlc",
			symbol,
			spec.range,
			spec.interval
		],
		queryFn: () => apiOhlc(symbol, spec.range, spec.interval),
		staleTime: 3e4,
		placeholderData: keepPreviousData
	});
	const chart = (0, import_react.useMemo)(() => {
		const bars = ohlc.data && !ohlc.data.missing ? ohlc.data.bars : [];
		if (bars.length < 20) return {
			interval: tf,
			lookback: tf,
			mode,
			last: ohlc.data?.price
		};
		const sliced = bars.slice(-320);
		const st = chartStructure(sliced.length >= 20 ? sliced : bars);
		return {
			interval: tf,
			lookback: tf,
			last: ohlc.data?.price,
			rsi: st.rsi,
			swings: st.named.map((s) => ({
				label: s.label,
				price: s.price,
				t: s.t
			})),
			levels: st.clusters.slice(0, 8),
			mtf: st.mtf.slice(0, 6),
			mode
		};
	}, [
		ohlc.data,
		tf,
		mode
	]);
	async function run() {
		setOpen(true);
		setBusy(true);
		try {
			const r = await apiNote({
				kind: "structure",
				symbol,
				chart
			});
			setRes(r);
		} catch (e) {
			setRes({
				ok: false,
				error: e instanceof Error ? e.message : "Could not run."
			});
		} finally {
			setBusy(false);
		}
	}
	const block = res && res.ok ? res.structureBlock || asStructure(res.text) : null;
	const header = modeTitle(mode, tf);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => {
				if (open && block) setOpen(false);
				else run();
			},
			disabled: busy,
			className: cn("w-full rounded-lg border-l-[4px] border-l-chart bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]", open && "ring-1 ring-chart/40"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
					children: "Structure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-1.5 text-[20px] font-semibold tracking-tight",
					children: "What is the chart doing?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-md text-[13px] leading-snug text-muted",
					children: "Pick a horizon. Two-word call, S/R table, HH/HL. Not a paragraph."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-4 inline-flex h-9 items-center gap-2 rounded-sm bg-accent px-3 text-[13px] font-medium text-accent-fg",
					children: [busy ? "Reading…" : open ? "Hide" : "Read structure", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-1",
			children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: m.hint,
				onClick: () => setMode(m.id),
				className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", mode === m.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"),
				children: m.label
			}, m.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-[12px] text-muted",
			children: header
		}),
		busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisSkeleton, { kicker: "structure" })
		}) : null,
		open && res && !res.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[13px] text-down",
			children: res.error
		}) : null,
		open && block ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: header
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy,
					onClick: () => void run(),
					children: "Refresh"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructureView, { block })]
		}) : null
	] });
}
function StockPage() {
	const { symbol } = Route$8.useParams();
	const pushRecent = useKosh((s) => s.pushRecent);
	const ohlc = useQuery({
		queryKey: [
			"ohlc",
			symbol,
			"5y",
			"1d"
		],
		queryFn: () => apiOhlc(symbol, "5y", "1d"),
		staleTime: 3e4,
		placeholderData: keepPreviousData
	});
	(0, import_react.useEffect)(() => {
		const name = ohlc.data?.name || universeName(symbol);
		pushRecent({
			symbol,
			name
		});
	}, [
		symbol,
		ohlc.data?.name,
		pushRecent
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: ohlc.data?.missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"No price series for ",
			symbol,
			"."
		]
	}) : ohlc.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockBody, {
		symbol,
		pack: ohlc.data
	}) : ohlc.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"No prices for ",
			symbol,
			". ",
			ohlc.error.message
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 animate-pulse rounded-lg bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[420px] animate-pulse rounded-lg bg-surface" })]
	}) });
}
function StockBody({ symbol, pack }) {
	const watch = useKosh((s) => s.watch);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const watchlists = useKosh((s) => s.watchlists);
	const activeWatchId = useKosh((s) => s.activeWatchId);
	const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
	const addAlert = useKosh((s) => s.addAlert);
	const alerts = useKosh((s) => s.alerts);
	const removeAlert = useKosh((s) => s.removeAlert);
	const watched = isWatched(symbol, watch);
	const name = pack.name || universeName(symbol);
	const bars = pack.bars;
	const px = pack.price;
	const off = pack.high52 && px ? (px / pack.high52 - 1) * 100 : null;
	const pos52 = pack.high52 && pack.low52 && pack.high52 > pack.low52 ? (px - pack.low52) / (pack.high52 - pack.low52) * 100 : 50;
	const [cmp, setCmp] = (0, import_react.useState)("");
	const [cmpGo, setCmpGo] = (0, import_react.useState)("");
	const [alertPx, setAlertPx] = (0, import_react.useState)("");
	const [alertDir, setAlertDir] = (0, import_react.useState)("above");
	const [alertKind, setAlertKind] = (0, import_react.useState)("price");
	const [tab, setTab] = (0, import_react.useState)("chart");
	const interval = useKosh((s) => s.chartPrefs.interval);
	const stats = (0, import_react.useMemo)(() => {
		const retBars = bars.map((b) => ({
			...b,
			c: b.adj && b.adj > 0 ? b.adj : b.c
		}));
		return {
			ret1w: retFrom(retBars, 7),
			ret1m: retFrom(retBars, 31),
			ret3m: retFrom(retBars, 93),
			ret1y: retFrom(retBars, 365),
			volAvg: volAvg(bars, 20)
		};
	}, [bars]);
	const news = useQuery({
		queryKey: [
			"news",
			symbol,
			name
		],
		queryFn: () => apiNews(symbol, name),
		staleTime: 6e5
	});
	const fund = useQuery({
		queryKey: ["fundamentals", symbol],
		queryFn: () => apiFundamentals(symbol),
		staleTime: 432e5
	});
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const qy = fetchSpec(interval);
	const cmpQ = useQuery({
		queryKey: [
			"ohlc",
			cmpGo,
			qy.range,
			qy.interval
		],
		queryFn: () => apiOhlc(cmpGo, qy.range, qy.interval),
		enabled: Boolean(cmpGo),
		staleTime: 3e4,
		placeholderData: keepPreviousData
	});
	const reads = useKosh((s) => s.skillReads);
	const listed = pack.firstTrade ? (/* @__PURE__ */ new Date(pack.firstTrade * 1e3)).toISOString().slice(0, 4) : "—";
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const setDeepFunds = useKosh((s) => s.setDeepFunds);
	const deepSnap = useKosh((s) => s.deepFunds[bare]);
	const [updating, setUpdating] = (0, import_react.useState)(false);
	const [updateNote, setUpdateNote] = (0, import_react.useState)("");
	const started = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		if (!bare || isCommodity(bare)) return;
		if (started.current === bare) return;
		const snap = useKosh.getState().deepFunds[bare];
		if (Boolean(snap && Date.now() - snap.at < 432e5 && snap.fund?.provenance?.searched)) return;
		started.current = bare;
		let cancel = false;
		setUpdating(true);
		setUpdateNote("");
		apiEnrich([bare]).then((part) => {
			if (cancel) return;
			const prev = useKosh.getState().deepFunds[bare]?.fund || null;
			const got = part.funds?.[bare] || null;
			if (!got && !prev) {
				setUpdateNote("No additional filing data for this name.");
				return;
			}
			const fund = seedCompletion(prev, got, bare);
			setDeepFunds({ [bare]: {
				fund,
				at: Date.now(),
				sources: part.sources?.[bare] || ["complete"]
			} });
		}).catch(() => {
			if (!cancel) setUpdateNote("Background verify did not finish. Use Complete & verify data to retry.");
		}).finally(() => {
			if (!cancel) setUpdating(false);
		});
		return () => {
			cancel = true;
		};
	}, [bare, setDeepFunds]);
	const fundData = (0, import_react.useMemo)(() => {
		const card = fund.data || null;
		const saved = deepSnap?.fund || null;
		if (!card && !saved) return null;
		return seedCompletion(saved, card, bare);
	}, [
		fund.data,
		deepSnap,
		bare
	]);
	const sector = sectorOf(symbol);
	const mineRow = pickScreenRow(screen.data?.rows, bare) || (screen.data?.rows || []).find((r) => r.symbol === bare);
	const snap = (0, import_react.useMemo)(() => buildSnapshot({
		symbol: bare,
		name,
		price: px,
		fund: fundData,
		row: mineRow,
		skill: skillOf(reads, bare),
		bars: bars.map((b) => ({
			t: b.t,
			c: b.c
		}))
	}), [
		bare,
		name,
		px,
		fundData,
		mineRow,
		reads,
		bars
	]);
	const models = (0, import_react.useMemo)(() => buildValuationModels({
		price: px,
		fund: fundData,
		bars: bars.map((b) => ({
			t: b.t,
			c: b.c
		}))
	}), [
		px,
		fundData,
		bars
	]);
	const eq = (0, import_react.useMemo)(() => earningsQualityRead(fundData), [fundData]);
	const peerPick = pickPeers(bare, screen.data?.rows || [], {
		mcapCr: fundData?.mcapCr ?? mineRow?.mcapCr,
		pe: fundData?.pe ?? mineRow?.pe,
		sector
	});
	const peers = peerPick.rows;
	const insight = peerInsight({
		pe: fundData?.pe ?? mineRow?.pe,
		roce: fundData?.roce ?? mineRow?.roce,
		salesYoY: fundData?.salesYoY ?? mineRow?.salesYoY,
		profitCagr3: fundData?.profitCagr3 ?? mineRow?.profitCagr3,
		profitYoY: fundData?.profitYoY ?? mineRow?.profitYoY
	}, peers);
	const cov = (0, import_react.useMemo)(() => buildCoverage({
		fund: fundData,
		row: mineRow,
		price: px,
		peerCount: peers.length
	}), [
		fundData,
		mineRow,
		px,
		peers.length
	]);
	const peGap = peDiscrepancy(fundData?.pe, mineRow?.pe);
	const priceAsOf = bars.at(-1)?.t ? (/* @__PURE__ */ new Date(bars[bars.length - 1].t * 1e3)).toISOString().slice(0, 10) : null;
	const finPeriod = fundData?.finPeriod || fundData?.sales?.at(-1)?.period || null;
	const shPeriod = fundData?.shPeriod || fundData?.shareholding?.at(-1)?.period || null;
	const mine = alerts.filter((a) => a.symbol === bare);
	const cap = capFromMcap(fundData?.mcapCr ?? mineRow?.mcapCr, symbol);
	const card = businessView(symbol, {
		summary: fundData?.summary,
		industry: fundData?.industry,
		ceo: fundData?.ceo,
		founded: fundData?.founded,
		website: fundData?.website
	});
	const site = fundData?.website || null;
	const host = site ? (() => {
		try {
			return new URL(site).hostname.replace(/^www\./, "");
		} catch {
			return null;
		}
	})() : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[12px] text-subtle",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/markets",
									className: "hover:text-muted",
									children: "Markets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5",
									children: "/"
								}),
								sector
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [host ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`,
								alt: "",
								width: 40,
								height: 40,
								className: "mt-1 size-10 rounded-md bg-surface-2 object-contain"
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-[28px] font-semibold tracking-tight",
									children: name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[12px] text-muted",
									children: [
										bare,
										" · ",
										pack.exchange || "NSE",
										" · ",
										cap,
										" · listed ",
										listed,
										mineRow?.series ? ` · ${mineRow.series}` : "",
										mineRow?.gsm ? " · GSM" : "",
										site ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: site,
											target: "_blank",
											rel: "noreferrer",
											className: "text-chart hover:underline",
											children: host || "Company site"
										})] }) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: [
										"Price ",
										priceAsOf || "—",
										finPeriod ? ` · Financials ${finPeriod}` : " · Financials period unavailable",
										shPeriod ? ` · Shareholding ${shPeriod}` : " · Shareholding period unavailable",
										fundData?.retrievedAt ? ` · Retrieved ${new Date(fundData.retrievedAt).toISOString().slice(0, 10)}` : "",
										updating ? " · Updating data…" : "",
										updateNote ? ` · ${updateNote}` : ""
									]
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskAi, { symbol })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePrice, {
					symbol,
					initial: {
						price: px,
						changePct: pack.changePct
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap justify-end gap-2",
					children: [
						watchlists.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-8 rounded-sm bg-bg-elevated px-2 text-[12px] shadow-[var(--shadow-border)]",
							value: activeWatchId,
							onChange: (e) => setActiveWatchId(e.target.value),
							"aria-label": "Watch list",
							children: watchlists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.id,
								children: l.name
							}, l.id))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: watched ? "default" : "secondary",
							onClick: () => toggleWatch(symbol),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", watched && "fill-current") }), watched ? "Watching" : "Watch"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToPortfolio, {
							symbol: bare,
							name,
							px,
							bars,
							sector
						})
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttentionStrip, {
				symbols: [{
					symbol: bare,
					name
				}],
				title: "Near-term triggers"
			}),
			peGap ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-lg bg-surface px-4 py-3 text-[13px] text-muted shadow-[var(--shadow-border)]",
				children: [
					peGap.note,
					" Card ",
					peGap.card.toFixed(1),
					" vs market print ",
					peGap.market.toFixed(1),
					"."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotCard, {
				snap,
				simple: models.simple
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageLine, { cov }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldCoverage, { fund: fundData }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompleteMissing, { jobs: fundData ? [{
				symbol: bare,
				missing: missingFieldLabels(fundData)
			}] : [] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValuationModels, {
				pack: models,
				fund: fundData
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-wrap gap-1",
				role: "tablist",
				"aria-label": "Stock sections",
				children: [
					["chart", "Chart"],
					["business", "Business"],
					["financials", "Financials"],
					["news", "News"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": tab === id,
					onClick: () => {
						setTab(id);
					},
					className: cn("inline-flex h-10 items-center justify-center rounded-sm px-3.5 text-[14px] font-medium leading-none", tab === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "desk",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteDesk, {
					symbol,
					compact: tab !== "chart"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("grid grid-cols-2 gap-2 lg:grid-cols-4", tab !== "chart" && "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Day",
						value: `${fmtPx(pack.dayLow)} – ${fmtPx(pack.dayHigh)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "52-week high",
						value: fmtPx(pack.high52),
						hint: off == null ? void 0 : off >= -.15 ? "At the 52-week high" : `${fmtPct(Math.abs(off)).replace("+", "")} below the 52-week high`,
						tone: toneOf(off ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "52-week low",
						value: fmtPx(pack.low52)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Volume",
						value: fmtVol(pack.volume),
						hint: stats.volAvg ? "20-day average " + fmtVol(stats.volAvg) : void 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn(tab !== "chart" && "hidden"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 h-2 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-full w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-y-0 bg-chart/40",
							style: { width: `${Math.min(100, Math.max(0, pos52))}%` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg",
							style: { left: `${Math.min(100, Math.max(0, pos52))}%` }
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between font-mono text-[11px] text-subtle tabular",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmtPx(pack.low52) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "52-week range" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmtPx(pack.high52) })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "snapshot",
				className: cn("grid gap-4", tab !== "financials" && "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnershipBlock, { fund: fundData }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
								children: "Earnings quality"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[12px] text-subtle",
								children: "Operating cash versus reported profit. Missing cash flow stays blank."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-[15px] font-semibold",
								children: eq.tag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] leading-relaxed text-muted",
								children: eq.body
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
								children: "Financials"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[12px] text-subtle",
								children: "Company numbers we have. Blank means missing, not a guess."
							}),
							fund.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "Loading company numbers…"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinancialSnapshot, {
									fund: fundData,
									bare: true,
									price: px
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "tape",
				className: cn(tab !== "chart" && "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Chart"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex items-center gap-1",
								onSubmit: (e) => {
									e.preventDefault();
									setCmpGo(cmp.trim().toUpperCase().replace(/\.(NS|BO)$/i, ""));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "h-8 w-28 rounded-sm bg-bg-elevated px-2 text-[12px] shadow-[var(--shadow-border)] outline-none",
										placeholder: "Compare TCS",
										value: cmp,
										onChange: (e) => setCmp(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										size: "sm",
										variant: "secondary",
										children: "Overlay"
									}),
									cmpGo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-[11px] text-muted",
										onClick: () => {
											setCmpGo("");
											setCmp("");
										},
										children: "Clear"
									}) : null
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
						symbol,
						bars,
						intra: false,
						compareBars: cmpQ.data && !cmpQ.data.missing ? cmpQ.data.bars : null,
						compareLabel: cmpQ.data?.name,
						high52: pack.high52,
						low52: pack.low52,
						prevClose: pack.previousClose
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[12px] text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `https://www.tradingview.com/chart/?symbol=NSE:${encodeURIComponent(bare)}`,
							target: "_blank",
							rel: "noreferrer",
							className: "text-chart hover:underline",
							children: "Open in TradingView"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn(tab !== "chart" && "hidden"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Recent returns"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: [
						["1W", stats.ret1w],
						["1M", stats.ret1m],
						["3M", stats.ret3m],
						["1Y", stats.ret1y]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-1 font-mono text-lg tabular", v >= 0 ? "text-up" : "text-down"),
							children: dash(v, (x) => fmtPct(x))
						})]
					}, k))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "business",
				className: cn(tab !== "business" && "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Business"
						}),
						card.known ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-4 text-[14px] leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-chart uppercase",
									children: "About"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 whitespace-pre-line",
									children: card.about
								})] }),
								card.products ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "Products"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.products
								})] }) : null,
								card.makes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "How it makes money"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.makes
								})] }) : null,
								card.cycle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "Cycle"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.cycle
								})] }) : null,
								card.watch.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "Watch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1.5 grid gap-1.5 border-l-2 border-chart/40 pl-3",
									children: card.watch.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "text-[13.5px] leading-relaxed",
										children: w
									}, w))
								})] }) : null
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-4 text-[14px] leading-relaxed",
							children: [
								card.about ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-chart uppercase",
									children: "Official summary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 whitespace-pre-line",
									children: card.about
								})] }) : null,
								card.industry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "Industry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.industry
								})] }) : null,
								card.ceo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "CEO"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.ceo
								})] }) : null,
								card.founded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
									children: "Founded"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5",
									children: card.founded
								})] }) : null,
								!card.about && !card.industry && !card.ceo && !card.founded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: "No official company summary, industry, CEO or founded date. We do not invent a description of the business."
								}) : null
							]
						}),
						card.known && (card.industry || card.ceo || card.founded) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[13px] text-muted",
							children: [
								card.industry,
								card.ceo ? `CEO ${card.ceo}` : "",
								card.founded ? `Founded ${card.founded}` : ""
							].filter(Boolean).join(" · ")
						}) : null,
						site ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[13px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: site,
								target: "_blank",
								rel: "noreferrer",
								className: "text-chart hover:underline",
								children: "Official company website"
							})
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "news",
				className: cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", tab !== "news" && "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsBoard, {
					title: "News",
					items: news.data,
					loading: news.isPending,
					shareTitle: `${name} headlines`,
					extra: `${bare} · ${fmtPx(px)} ${fmtPct(pack.changePct)}`,
					alertScope: "s:" + bare
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", tab !== "chart" && "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Alert"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted",
						children: "Stored in this browser. Price, day move, RSI, volume, or 52-week."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const p = Number(alertPx);
							if (alertKind === "high52" || alertKind === "low52") {
								addAlert({
									symbol: bare,
									name,
									price: alertKind === "high52" ? pack.high52 : pack.low52,
									dir: alertKind === "high52" ? "above" : "below",
									kind: alertKind
								});
								return;
							}
							if (!(p > 0)) return;
							addAlert({
								symbol: bare,
								name,
								price: p,
								dir: alertDir,
								kind: alertKind
							});
							setAlertPx("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]",
								value: alertKind,
								onChange: (e) => setAlertKind(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "price",
										children: "Price"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "pct",
										children: "Day %"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "rsi",
										children: "RSI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "volume",
										children: "Volume ×"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "high52",
										children: "52w high"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "low52",
										children: "52w low"
									})
								]
							}),
							alertKind !== "high52" && alertKind !== "low52" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]",
								value: alertDir,
								onChange: (e) => setAlertDir(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "above",
									children: "Above"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "below",
									children: "Below"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-8 w-28 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none",
								placeholder: alertKind === "price" ? String(Math.round(px)) : alertKind === "pct" ? "3" : alertKind === "rsi" ? "70" : "1.5",
								value: alertPx,
								onChange: (e) => setAlertPx(e.target.value)
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								variant: "secondary",
								children: "Pin"
							})
						]
					}),
					mine.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-1 text-[13px]",
						children: mine.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								a.kind || "price",
								" · ",
								a.dir,
								" ",
								a.kind === "price" || !a.kind ? fmtPx(a.price) : a.price
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-[12px] hover:text-fg",
								onClick: () => removeAlert(a.id),
								children: "Remove"
							})]
						}, a.id))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(tab !== "chart" && "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructureDesk, { symbol })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(tab !== "chart" && "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealsBlock, {
					symbol: bare,
					name
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "peers",
				className: cn(tab !== "financials" && "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: ["Peers · ", peerPick.line]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 mb-3 text-[12px] text-subtle",
						children: "Closest listed names in the same business, ranked by size — not the rest of the sector."
					}),
					insight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-[13px] leading-relaxed text-fg",
						children: insight
					}) : null,
					screen.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Peers fill from the live screen once prices are in."
					}) : peers.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "kosh-table w-full text-left text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
									"Name",
									"Price",
									"Today",
									"P/E",
									"ROCE",
									"1Y"
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: h
								}, h)) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: peers.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/s/$symbol",
										params: { symbol: r.symbol },
										className: "hover:text-chart",
										children: r.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular",
									children: fmtPx(r.price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
									children: fmtPct(r.changePct)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular",
									children: r.pe != null ? r.pe.toFixed(1) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular",
									children: r.roce != null ? `${r.roce.toFixed(1)}%` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2 font-mono tabular", (r.ret1y ?? 0) >= 0 ? "text-up" : "text-down"),
									children: r.ret1y == null ? "—" : fmtPct(r.ret1y)
								})
							] }, r.symbol)) })]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"No other listed ",
							peerPick.line,
							" names on the current screen."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "versus",
				className: cn(tab !== "chart" && "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Versus, {
					symbol,
					name
				})
			})
		]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-lg tabular",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted",
				children: hint
			}) : null
		]
	});
}
function Versus({ symbol, name }) {
	const [benchKey, setBenchKey] = (0, import_react.useState)("nifty");
	const [range, setRange] = (0, import_react.useState)("1Y");
	const bare = bareSymbol(symbol);
	const buyDate = useKosh((s) => {
		let best = null;
		for (const p of s.portfolios) for (const h of p.holdings) {
			if (bareSymbol(h.symbol) !== bare) continue;
			const d = String(h.date || h.boughtAt || "").slice(0, 10);
			if (d && (!best || d < best)) best = d;
		}
		return best;
	});
	const bench = resolveBench(benchKey);
	const q = useQuery({
		queryKey: [
			"vs",
			symbol,
			bench.symbol
		],
		queryFn: async () => {
			const [d, n] = await Promise.all([apiHistory(symbol, "max"), apiHistory(bench.symbol, "max")]);
			return {
				d,
				mix: pathFromBars(d.bars || [], n.bars || [])
			};
		},
		staleTime: 3e5
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"Loading versus ",
			bench.name,
			"…"
		]
	});
	if (!q.data) return null;
	const mix = q.data.mix;
	const sliced = sliceNav(mix.nav, range);
	const risk = riskMetrics(sliced.length >= 20 ? sliced : mix.nav);
	const windows = {
		y1: windowReturn(mix.nav, 365),
		ytd: ytdReturn(mix.nav)
	};
	const cagr = mixCagr(sliced.length >= 20 ? sliced : mix.nav);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-end justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: [
					name,
					" vs ",
					bench.name
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: [
					"Both lines start at 100 on the first day they both print in the selected window. Window CAGR",
					" ",
					dash(cagr, (x) => fmtPct(x)),
					"."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 text-[12px] text-muted",
				children: ["Benchmark", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BenchPicker, {
					value: benchKey,
					onChange: setBenchKey
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
			nav: mix.nav,
			portLabel: symbol,
			benchLabel: bench.name,
			coverage: mix.coverage,
			range,
			onRange: setRange,
			fromBuy: buyDate
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[12px] leading-relaxed text-muted",
			children: [
				"Beta and alpha are Jensen’s, daily overlapping returns vs this index, Rf 6.5%, on the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
					className: "font-medium text-fg",
					children: range
				}),
				" window",
				risk.windowLabel ? ` — ${risk.windowLabel}` : "",
				". Switch 1Y / 5Y / MAX on the chart to recompute."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "1Y vs index",
					value: dash(windows.y1.port, (x) => fmtPct(x)),
					hint: dash(windows.y1.bench, (x) => fmtPct(x) + " index")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "YTD",
					value: dash(windows.ytd.port, (x) => fmtPct(x))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: `Beta (${range})`,
					value: dash(risk.beta),
					hint: risk.sessions ? `${risk.sessions} sessions from ${risk.since}` : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: `Alpha (${range})`,
					value: dash(risk.alpha, (x) => fmtPct(x)),
					hint: "Jensen, Rf 6.5%"
				})
			]
		})
	] });
}
function dealKind(k) {
	if (k === "block") return "Block";
	if (k === "insider") return "Insider";
	return "Bulk";
}
function DealsBlock({ symbol, name }) {
	const q = useQuery({
		queryKey: ["macro"],
		queryFn: apiMacro,
		staleTime: 48e4
	});
	const bare = bareSymbol(symbol);
	const deals = (q.data?.deals || []).filter((d) => bareSymbol(d.symbol) === bare).slice(0, 16);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Bulk / block / insider"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: [
					"Recent large trades in ",
					name,
					". Blank here means none in the latest tape, not a guess."
				]
			}),
			q.isPending && !deals.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading deals…"
			}) : deals.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Kind"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Note"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: deals.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono tabular",
							children: d.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: dealKind(d.kind)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-muted",
							children: d.note
						})
					] }, d.kind + d.date + d.note.slice(0, 24) + i)) })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No bulk, block or insider prints for this name recently."
			})
		]
	});
}
//#endregion
export { StockPage as component };
