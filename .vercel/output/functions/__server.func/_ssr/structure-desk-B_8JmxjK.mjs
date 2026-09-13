import { o as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Layers, D as Columns2, M as ArrowRight, N as ArrowDownRight, S as Magnet, T as Crosshair, _ as Minus, b as Maximize2, c as Spline, f as Play, h as MousePointer2, i as Trash2, j as ArrowUpRight, m as MoveRight, n as Undo2, p as Pause, s as Square, v as Minimize2, w as Download } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { At as sma, Ct as macd, D as fmtPct, Ft as volumeProfile, Gt as Button, It as vwap, Mt as supertrend, Nt as swings, O as fmtPx, Ot as rsi, Qt as newDrawId, St as lastNum, Tt as priorDayRange, Yt as drawKey, _t as atr, bt as ema, jt as stoch, kt as sessionOpeningRange, on as cn, p as detectVcp, qt as bareSymbol, tn as useKosh, u as asStructure, vt as bollinger, wt as nameSwings, xt as fmtVol, yt as chartStructure, zt as Seg } from "./router-oJX0L9_1.mjs";
import { c as apiOhlc, s as apiNote } from "./api-Dymx0Kns.mjs";
import { c as StructureView, t as AnalysisSkeleton } from "./analysis-view-BGr12zyI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/structure-desk-B_8JmxjK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
/** Conservative pattern hits on the bars of the selected timeframe. */
var MAX = 3;
function kOf(n) {
	return n > 180 ? 5 : n > 80 ? 3 : 2;
}
function flag(bars) {
	if (bars.length < 30) return null;
	const last = bars[bars.length - 1];
	for (const pole of [
		8,
		10,
		12,
		15
	]) {
		if (bars.length < pole + 8) continue;
		const start = bars[bars.length - pole - 12];
		const endPole = bars[bars.length - 12];
		if (!start?.c || !endPole?.c) continue;
		const move = (endPole.c / start.c - 1) * 100;
		if (Math.abs(move) < 12) continue;
		const rest = bars.slice(-12);
		const hi = Math.max(...rest.map((b) => b.h));
		const lo = Math.min(...rest.map((b) => b.l));
		const range = (hi - lo) / (endPole.c || 1) * 100;
		if (range > Math.abs(move) * .45 || range < 2) continue;
		if (last.c > hi * 1.01 || last.c < lo * .99) continue;
		const up = move > 0;
		return {
			kind: "flag",
			label: up ? "Bull flag" : "Bear flag",
			note: `Pole ${move.toFixed(0)}%, then a tight ${range.toFixed(1)}% coil.`,
			points: [
				{
					t: start.t,
					price: start.c
				},
				{
					t: endPole.t,
					price: endPole.c
				},
				{
					t: rest[0].t,
					price: hi
				},
				{
					t: last.t,
					price: lo
				}
			],
			tone: up ? "up" : "down"
		};
	}
	return null;
}
function doubleTurn(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length)));
	const highs = named.filter((s) => s.kind === "H").slice(-5);
	const lows = named.filter((s) => s.kind === "L").slice(-5);
	if (highs.length >= 2) {
		const a = highs[highs.length - 2];
		const b = highs[highs.length - 1];
		if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= .015) {
			const trough = lows.find((l) => l.i > a.i && l.i < b.i);
			if (trough && (a.price - trough.price) / a.price >= .04) return {
				kind: "double-top",
				label: "Double top",
				note: `Two highs near ${a.price.toFixed(0)}, trough ${trough.price.toFixed(0)}.`,
				points: [
					{
						t: a.t,
						price: a.price
					},
					{
						t: trough.t,
						price: trough.price
					},
					{
						t: b.t,
						price: b.price
					}
				],
				tone: "down"
			};
		}
	}
	if (lows.length >= 2) {
		const a = lows[lows.length - 2];
		const b = lows[lows.length - 1];
		if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= .015) {
			const peak = highs.find((h) => h.i > a.i && h.i < b.i);
			if (peak && (peak.price - a.price) / a.price >= .04) return {
				kind: "double-bottom",
				label: "Double bottom",
				note: `Two lows near ${a.price.toFixed(0)}, peak ${peak.price.toFixed(0)}.`,
				points: [
					{
						t: a.t,
						price: a.price
					},
					{
						t: peak.t,
						price: peak.price
					},
					{
						t: b.t,
						price: b.price
					}
				],
				tone: "up"
			};
		}
	}
	return null;
}
function triangle(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
	const hs = named.filter((s) => s.kind === "H");
	const ls = named.filter((s) => s.kind === "L");
	if (hs.length < 3 || ls.length < 3) return null;
	const h1 = hs[hs.length - 3].price;
	const h2 = hs[hs.length - 2].price;
	const h3 = hs[hs.length - 1].price;
	const l1 = ls[ls.length - 3].price;
	const l2 = ls[ls.length - 2].price;
	const l3 = ls[ls.length - 1].price;
	const highsDown = h1 > h2 && h2 > h3;
	const lowsUp = l1 < l2 && l2 < l3;
	const highsUp = h1 < h2 && h2 < h3;
	const lowsDown = l1 > l2 && l2 > l3;
	if (!(highsDown && lowsUp) && !(highsDown && lowsDown) && !(highsUp && lowsUp)) return null;
	return {
		kind: "triangle",
		label: highsDown && lowsUp ? "Triangle" : highsDown && lowsDown ? "Descending triangle" : "Ascending triangle",
		note: "Swing highs and lows are converging on this timeframe.",
		points: [
			{
				t: hs[hs.length - 3].t,
				price: h1
			},
			{
				t: hs[hs.length - 1].t,
				price: h3
			},
			{
				t: ls[ls.length - 3].t,
				price: l1
			},
			{
				t: ls[ls.length - 1].t,
				price: l3
			}
		],
		tone: "chart"
	};
}
function rangeHit(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
	const hs = named.filter((s) => s.kind === "H").slice(-3);
	const ls = named.filter((s) => s.kind === "L").slice(-3);
	if (hs.length < 2 || ls.length < 2) return null;
	const hAvg = hs.reduce((s, x) => s + x.price, 0) / hs.length;
	const lAvg = ls.reduce((s, x) => s + x.price, 0) / ls.length;
	if (!(hAvg > 0) || !(lAvg > 0) || hAvg <= lAvg) return null;
	const hTight = hs.every((h) => Math.abs(h.price / hAvg - 1) <= .012);
	const lTight = ls.every((l) => Math.abs(l.price / lAvg - 1) <= .012);
	const span = (hAvg - lAvg) / hAvg * 100;
	if (!hTight || !lTight || span < 5 || span > 18) return null;
	return {
		kind: "range",
		label: "Range",
		note: `${span.toFixed(1)}% between ${lAvg.toFixed(0)} and ${hAvg.toFixed(0)}.`,
		points: [{
			t: hs[0].t,
			price: hAvg
		}, {
			t: ls[0].t,
			price: lAvg
		}],
		tone: "chart"
	};
}
function detectPatterns(bars) {
	const src = (bars || []).filter((b) => b && b.c > 0);
	if (src.length < 24) return [];
	const out = [];
	const vcp = detectVcp(src);
	if (vcp?.breakout) out.push({
		kind: "vcp-break",
		label: "VCP breakout",
		note: `${vcp.n} contractions, pivot ${vcp.pivot.toFixed(0)}.`,
		points: [{
			t: src[src.length - 1].t,
			price: vcp.pivot
		}],
		tone: "up"
	});
	else if (vcp?.forming) out.push({
		kind: "vcp",
		label: "VCP",
		note: `${vcp.n} contractions, last ${vcp.lastPct.toFixed(1)}%, pivot ${vcp.pivot.toFixed(0)}.`,
		points: [{
			t: src[src.length - 1].t,
			price: vcp.pivot
		}],
		tone: "chart"
	});
	const f = flag(src);
	if (f) out.push(f);
	const d = doubleTurn(src);
	if (d) out.push(d);
	if (out.length < MAX) {
		const t = triangle(src);
		if (t) out.push(t);
	}
	if (out.length < MAX) {
		const r = rangeHit(src);
		if (r) out.push(r);
	}
	return out.slice(0, MAX);
}
var HANDLE = 12;
var LINE = 16;
function dist(ax, ay, bx, by) {
	return Math.hypot(ax - bx, ay - by);
}
function distSeg(px, py, x0, y0, x1, y1) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len2 = dx * dx + dy * dy || 1;
	let t = ((px - x0) * dx + (py - y0) * dy) / len2;
	t = Math.max(0, Math.min(1, t));
	return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
}
function shapePoints(s, src, xOf, yOf, left, right, plotTop, plotBot) {
	const tToX = (t) => {
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
	};
	const x0 = tToX(s.t0);
	const y0 = yOf(s.y0);
	const x1 = tToX(s.t1 ?? s.t0);
	const y1 = yOf(s.y1 ?? s.y0);
	if (s.kind === "hline") return {
		x0: left,
		y0,
		x1: right,
		y1: y0
	};
	if (s.kind === "vline") return {
		x0,
		y0: plotTop,
		x1: x0,
		y1: plotBot
	};
	return {
		x0,
		y0,
		x1,
		y1
	};
}
function hitTest(shapes, x, y, src, xOf, yOf, left, right, plotTop, plotBot) {
	for (let i = shapes.length - 1; i >= 0; i--) {
		const s = shapes[i];
		const p = shapePoints(s, src, xOf, yOf, left, right, plotTop, plotBot);
		if (dist(x, y, p.x0, p.y0) <= HANDLE) return {
			id: s.id,
			mode: "p0"
		};
		if (s.kind !== "hline" && s.kind !== "vline" && dist(x, y, p.x1, p.y1) <= HANDLE) return {
			id: s.id,
			mode: "p1"
		};
		if (s.kind === "hline" && dist(x, y, p.x1, p.y1) <= HANDLE) return {
			id: s.id,
			mode: "p0"
		};
		if (s.kind === "channel") {
			const off = s.off ?? Math.abs(s.y0) * .012;
			if (dist(x, y, (p.x0 + p.x1) / 2, (yOf(s.y0 + off) + yOf((s.y1 ?? s.y0) + off)) / 2) <= HANDLE) return {
				id: s.id,
				mode: "off"
			};
		}
		if (s.kind === "rect") {
			const rx = Math.min(p.x0, p.x1);
			const ry = Math.min(p.y0, p.y1);
			const rw = Math.abs(p.x1 - p.x0);
			const rh = Math.abs(p.y1 - p.y0);
			const inside = x >= rx - 2 && x <= rx + rw + 2 && y >= ry - 2 && y <= ry + rh + 2;
			const nearEdge = Math.abs(x - rx) <= LINE || Math.abs(x - (rx + rw)) <= LINE || Math.abs(y - ry) <= LINE || Math.abs(y - (ry + rh)) <= LINE;
			if (inside && (nearEdge || rw > 8 && rh > 8 && x > rx + 4 && x < rx + rw - 4 && y > ry + 4 && y < ry + rh - 4)) return {
				id: s.id,
				mode: "body"
			};
		} else if (distSeg(x, y, p.x0, p.y0, p.x1, p.y1) <= LINE) return {
			id: s.id,
			mode: "body"
		};
	}
	return null;
}
function magnetPrice(bar, price, on) {
	if (!on || !bar) return price;
	const pts = [
		bar.o,
		bar.h,
		bar.l,
		bar.c
	];
	let best = price;
	let d = Infinity;
	for (const p of pts) {
		const dd = Math.abs(p - price);
		if (dd < d) {
			d = dd;
			best = p;
		}
	}
	return best;
}
function applyDrag(s, mode, dt, dy, t, y) {
	if (mode === "p0") {
		if (s.kind === "hline") return {
			...s,
			y0: y
		};
		if (s.kind === "vline") return {
			...s,
			t0: t
		};
		return {
			...s,
			t0: t,
			y0: y
		};
	}
	if (mode === "p1") return {
		...s,
		t1: t,
		y1: y
	};
	if (mode === "off") return {
		...s,
		off: (s.off ?? 0) + dy
	};
	if (s.kind === "hline") return {
		...s,
		y0: s.y0 + dy
	};
	if (s.kind === "vline") return {
		...s,
		t0: s.t0 + dt,
		t1: (s.t1 ?? s.t0) + dt
	};
	return {
		...s,
		t0: s.t0 + dt,
		y0: s.y0 + dy,
		t1: (s.t1 ?? s.t0) + dt,
		y1: (s.y1 ?? s.y0) + dy
	};
}
var UP = "var(--color-up)";
var DOWN = "var(--color-down)";
var GRID = "var(--color-border)";
var TICK = "var(--color-subtle)";
var MA20 = "var(--color-chart)";
var MA50 = "var(--color-warn)";
var MA200 = "var(--color-chart-bench)";
var CMP = "var(--color-warn)";
var INK = "var(--color-fg)";
var ACCENT = "var(--color-accent)";
var VW = 900;
var PAD = {
	l: 58,
	r: 52,
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
function PlotSvg({ src, style, inds, intra, logScale, compare, measure, vh, volOn, levels, showLevels, sessionLevels }) {
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
	const rel = compare.some((x) => x != null);
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
				x: PAD.l - 6,
				y: yOf(v),
				fill: TICK,
				fontSize: "10",
				fontFamily: "IBM Plex Mono, ui-monospace, monospace",
				textAnchor: "end",
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
			rel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: linePath(compare, (v) => base * (v / cmpBase)),
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
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: xOf(n - 1),
				cy: yOf(last.c),
				r: "3.2",
				fill: upLast ? UP : DOWN,
				stroke: "var(--color-bg)",
				strokeWidth: "1.2"
			}) : null,
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
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0,
				x2: x1,
				y2: y1,
				stroke: color,
				strokeWidth: selected ? 1.8 : 1.5,
				vectorEffect: "nonScalingStroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x0,
				cy: y0,
				r: "3",
				fill: color
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x1,
				cy: y1,
				r: "3",
				fill: color
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: x1 + 4,
				y: y1 - 4,
				fill: color,
				fontSize: "10",
				fontFamily: "IBM Plex Sans, system-ui, sans-serif",
				children: [
					s.kind === "long" ? "Long" : "Short",
					" ",
					nice(s.y0),
					" → ",
					nice(s.y1 ?? s.y0)
				]
			}),
			handles
		] });
	}
	if (s.kind === "channel") {
		const off = s.off ?? Math.abs(s.y0) * .012;
		const y0b = yOf(s.y0 + off);
		const y1b = yOf((s.y1 ?? s.y0) + off);
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0b,
				x2: x1,
				y2: y1b,
				stroke,
				strokeWidth: w,
				vectorEffect: "nonScalingStroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: `${x0},${y0} ${x1},${y1} ${x1},${y1b} ${x0},${y0b}`,
				fill: ACCENT,
				fillOpacity: "0.08",
				stroke: "none"
			}),
			handles,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
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
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: x + 6,
			y: y - 6,
			fill: c,
			fontSize: "10",
			fontFamily: "IBM Plex Sans, system-ui, sans-serif",
			children: h.label
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
	const [fs, setFs] = (0, import_react.useState)(false);
	const [fsH, setFsH] = (0, import_react.useState)(640);
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
	const wrapRef = (0, import_react.useRef)(null);
	const overlayRef = (0, import_react.useRef)(null);
	const vLine = (0, import_react.useRef)(null);
	const hLine = (0, import_react.useRef)(null);
	const tag = (0, import_react.useRef)(null);
	const read = (0, import_react.useRef)(null);
	const layout = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	const shapeDrag = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)(view);
	viewRef.current = view;
	const cmpHorizon = compareBars || EMPTY_BARS;
	const full = horizon;
	const nAll = full.length;
	const count = view.count > 0 ? Math.min(view.count, nAll) : nAll;
	const start = Math.max(0, Math.min(Math.max(0, nAll - count), view.start));
	const sliceEnd = replayOn ? Math.max(8, Math.min(nAll, replayEnd || nAll)) : start + count;
	const sliceStart = replayOn ? 0 : start;
	const src = (0, import_react.useMemo)(() => full.slice(sliceStart, sliceEnd), [
		full,
		sliceStart,
		sliceEnd
	]);
	const compare = (0, import_react.useMemo)(() => alignCompare(src, cmpHorizon), [src, cmpHorizon]);
	const oscN = (inds.rsi ? 1 : 0) + (inds.macd ? 1 : 0) + (inds.stoch ? 1 : 0) + (inds.atr ? 1 : 0);
	const volH = volOn ? VOL_H : 0;
	const vh = (fs ? fsH : narrow ? 300 : 420) + oscN * OSC_H;
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
	(0, import_react.useEffect)(() => {
		if (!fs) return;
		const go = () => setFsH(Math.max(480, window.innerHeight - 170));
		go();
		window.addEventListener("resize", go);
		document.documentElement.classList.add("kosh-fs-lock");
		return () => {
			window.removeEventListener("resize", go);
			document.documentElement.classList.remove("kosh-fs-lock");
		};
	}, [fs]);
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
				return;
			}
			if (selectedId) {
				setSelectedId(null);
				return;
			}
			if (fs) {
				setFs(false);
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
		volH
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
		if (!L || !src[i]) return;
		const xPct = L.xOf(i) / VW * 100;
		const yPct = Math.min(L.plotBot, Math.max(L.plotTop, yPx)) / vh * 100;
		if (vLine.current) vLine.current.style.left = xPct + "%";
		if (hLine.current) hLine.current.style.top = yPct + "%";
		if (tag.current) {
			tag.current.style.top = yPct + "%";
			tag.current.textContent = nice(L.vOf(yPx));
		}
		const b = src[i];
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
		if (draft && src[i]) setDraft({
			...draft,
			t1: src[i].t,
			y1: price
		});
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
		paint(i, y);
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
			e.preventDefault();
			if (nAll < 30) return;
			const { x } = svgXY(e);
			const t = layout.current ? (x - PAD.l) / (VW - PAD.l - PAD.r) : .5;
			const cur = count || nAll;
			const nextCount = Math.max(20, Math.min(nAll, Math.round(cur * (e.deltaY > 0 ? 1.18 : .82))));
			const center = start + t * cur;
			const nextStart = Math.max(0, Math.min(nAll - nextCount, Math.round(center - t * nextCount)));
			setView({
				start: nextStart,
				count: nextCount
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
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
			label: "Pan",
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
			icon: Minus
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
	const card = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg bg-surface p-3 sm:p-4 shadow-[var(--shadow-border)]", fs && "kosh-chart-fs"),
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					})]
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							title: "Save chart",
							onClick: saveChart,
							className: "inline-flex h-8 items-center rounded-sm bg-bg px-2.5 text-[11px] font-medium text-muted shadow-[var(--shadow-border)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							title: fs ? "Exit fullscreen" : "Fullscreen",
							onClick: () => setFs((s) => !s),
							className: cn("inline-flex h-8 items-center rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", fs ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
							children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" })
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
						}
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
	if (fs && typeof document !== "undefined") return (0, import_react_dom.createPortal)(card, document.body);
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
function JournalDesk({ symbol, price = 0 }) {
	const journal = useKosh((s) => s.journal);
	const add = useKosh((s) => s.addJournal);
	const remove = useKosh((s) => s.removeJournal);
	const [note, setNote] = (0, import_react.useState)("");
	const [setup, setSetup] = (0, import_react.useState)("");
	const mine = symbol ? journal.filter((j) => j.symbol === symbol.toUpperCase().replace(/\.(NS|BO)$/i, "")) : journal;
	const bare = symbol ? symbol.toUpperCase().replace(/\.(NS|BO)$/i, "") : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Journal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: "Your notes on this browser. Not a trade log sent anywhere."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 grid gap-2 sm:grid-cols-[140px_1fr_auto]",
				onSubmit: (e) => {
					e.preventDefault();
					const sym = bare || setup.toUpperCase().replace(/\.(NS|BO)$/i, "");
					if (!sym || !note.trim()) return;
					add({
						symbol: sym,
						note: note.trim(),
						setup: setup.trim() || "Note",
						price
					});
					setNote("");
					if (!symbol) setSetup("");
				},
				children: [
					symbol ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none",
						placeholder: "Setup",
						value: setup,
						onChange: (e) => setSetup(e.target.value)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none",
						placeholder: "Symbol",
						value: setup,
						onChange: (e) => setSetup(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)] outline-none",
						placeholder: "What you see",
						value: note,
						onChange: (e) => setNote(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						variant: "secondary",
						children: "Save"
					})
				]
			}),
			mine.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2",
				children: mine.slice(0, 12).map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/s/$symbol",
									params: { symbol: j.symbol },
									className: "hover:text-chart",
									children: j.symbol
								}),
								j.setup ? ` · ${j.setup}` : "",
								j.price ? ` · ${fmtPx(j.price)}` : "",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-subtle",
									children: [" · ", new Date(j.at).toLocaleDateString("en-IN")]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 leading-snug",
							children: j.note
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "shrink-0 text-[12px] text-muted hover:text-fg",
						onClick: () => remove(j.id),
						children: "Remove"
					})]
				}, j.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[13px] text-muted",
				children: "Empty."
			})
		]
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
//#endregion
export { fetchSpec as i, JournalDesk as n, StructureDesk as r, CandleChart as t };
