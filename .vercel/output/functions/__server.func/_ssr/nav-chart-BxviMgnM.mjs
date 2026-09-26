import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Maximize2, b as Minimize2 } from "../_libs/lucide-react.mjs";
import { $ as rollingSeries, $t as Seg, In as useKosh, at as withDrawdown, er as cn, nt as toIndexed, q as monthBuckets, rt as weekBuckets, tt as sliceNav } from "./router-Dc7pTO-v.mjs";
import { t as useChartFullscreen } from "./use-fullscreen-C8E3zAaB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nav-chart-BxviMgnM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MIX_STROKE = "#7aa2ff";
var BENCH_STROKE = "#9a9aa4";
var PATH_STROKE = "#e0a45a";
var SAME_STROKE = "#7d9570";
var DOWN_STROKE = "#ef6e6e";
var GRID_STROKE = "#26262b";
var TICK_FILL = "#6e6e76";
var ZERO_STROKE = "#34343b";
var SMA_STROKE = "#c4b08a";
var UP_FILL = "#3dcf8e";
var PAD = {
	l: 54,
	r: 16,
	t: 16,
	b: 28
};
function thin(rows, cap = 360) {
	if (rows.length <= cap) return rows;
	const step = (rows.length - 1) / (cap - 1);
	const out = [];
	let last = -1;
	for (let i = 0; i < cap - 1; i++) {
		const idx = Math.round(i * step);
		if (idx === last) continue;
		out.push(rows[idx]);
		last = idx;
	}
	const tail = rows[rows.length - 1];
	if (out[out.length - 1] !== tail) out.push(tail);
	return out;
}
function indexExtra(rows) {
	const p0 = rows.find((r) => r.path != null && r.path > 0)?.path || null;
	const s0 = rows.find((r) => r.sameCash != null && r.sameCash > 0)?.sameCash || null;
	return rows.map((r) => ({
		path: p0 && r.path != null && r.path > 0 ? r.path / p0 * 100 : null,
		sameCash: s0 && r.sameCash != null && r.sameCash > 0 ? r.sameCash / s0 * 100 : null
	}));
}
/** Growth / drawdown / rolling use cash-flow-stripped units when present. Rupees keep wealth. */
function withUnits(nav, mode) {
	if (mode === "inr") return nav;
	return nav.map((p) => ({
		...p,
		port: p.portUnit != null && p.portUnit > 0 ? p.portUnit : p.port,
		bench: p.benchUnit != null && p.benchUnit > 0 ? p.benchUnit : p.bench,
		path: p.pathUnit != null && p.pathUnit > 0 ? p.pathUnit : p.path
	}));
}
function buildRows(nav, mode, range, nowValue) {
	const sliced = withUnits(sliceNav(nav, range), mode);
	const full = withUnits(nav, mode);
	if (mode === "dd") {
		const idx = withDrawdown(toIndexed(sliced));
		let bPeak = 0;
		return {
			rows: thin(idx.map((p) => {
				let bench = null;
				if (p.benchIdx != null && p.benchIdx > 0) {
					bPeak = Math.max(bPeak, p.benchIdx);
					bench = bPeak ? (p.benchIdx - bPeak) / bPeak * 100 : 0;
				}
				return {
					day: p.day,
					port: p.dd,
					bench
				};
			})),
			yTitle: "Drawdown %",
			bar: false
		};
	}
	if (mode === "gap") return {
		rows: thin(toIndexed(sliced).map((p) => ({
			day: p.day,
			port: p.benchIdx != null ? p.portIdx - p.benchIdx : null,
			bench: 0
		}))),
		yTitle: "Gap vs index pp",
		bar: false
	};
	if (mode === "roll1y" || mode === "roll3m") {
		const days = mode === "roll3m" ? 93 : 365;
		const src = sliced.length > 20 ? sliced : full;
		return {
			rows: thin(rollingSeries(src, days).map((p) => ({
				day: p.day,
				port: p.port,
				bench: p.bench
			}))),
			yTitle: mode === "roll3m" ? "Rolling 3M %" : "Rolling 1Y %",
			bar: false
		};
	}
	if (mode === "m") {
		const src = sliced.length > 10 ? sliced : full;
		return {
			rows: monthBuckets(src).map((p) => ({
				day: p.key,
				port: p.port,
				bench: p.bench
			})),
			yTitle: "Month %",
			bar: true
		};
	}
	if (mode === "w") {
		const src = sliced.length > 10 ? sliced : full;
		return {
			rows: weekBuckets(src).map((p) => ({
				day: p.key,
				port: p.port,
				bench: p.bench
			})),
			yTitle: "Week %",
			bar: true
		};
	}
	const idx = toIndexed(sliced);
	if (mode === "inr" && nowValue && nowValue > 0) {
		const last = [...idx].reverse().find((p) => p.portIdx > 0);
		const scale = last && last.portIdx ? nowValue / last.portIdx : nowValue / 100;
		return {
			rows: thin(idx.map((p) => ({
				day: p.day,
				port: p.portIdx * scale,
				bench: p.benchIdx != null ? p.benchIdx * scale : null,
				path: p.path != null && p.path > 0 ? p.path : null,
				sameCash: p.sameCash != null && p.sameCash > 0 ? p.sameCash : null
			}))),
			yTitle: "₹ portfolio",
			bar: false
		};
	}
	const extra = indexExtra(idx);
	return {
		rows: thin(idx.map((p, i) => ({
			day: p.day,
			port: p.portIdx,
			bench: p.benchIdx,
			path: extra[i]?.path ?? null,
			sameCash: extra[i]?.sameCash ?? null
		}))),
		yTitle: "Indexed 100",
		bar: false
	};
}
function domain(rows, keys) {
	const want = keys?.length ? keys : [
		"port",
		"bench",
		"path",
		"sameCash"
	];
	const vals = [];
	for (const r of rows) for (const k of want) {
		const v = r[k];
		if (v != null && Number.isFinite(v)) vals.push(v);
	}
	if (!vals.length) return {
		lo: 0,
		hi: 1
	};
	let lo = Math.min(...vals);
	let hi = Math.max(...vals);
	if (lo === hi) {
		const pad = Math.max(Math.abs(lo) * .08, 1);
		return {
			lo: lo - pad,
			hi: hi + pad
		};
	}
	const span = hi - lo || 1;
	lo -= span * .1;
	hi += span * .1;
	return {
		lo,
		hi
	};
}
function xOf(i, n) {
	const plotW = 800 - PAD.l - PAD.r;
	return PAD.l + (n <= 1 ? plotW / 2 : i / (n - 1) * plotW);
}
function yOf(v, lo, hi) {
	const plotH = 300 - PAD.t - PAD.b;
	return PAD.t + (hi - v) / (hi - lo || 1) * plotH;
}
function ptsOf(rows, key, lo, hi) {
	const n = rows.length;
	return rows.map((r, i) => {
		const v = r[key];
		if (v == null || !Number.isFinite(v)) return null;
		return {
			x: xOf(i, n),
			y: yOf(v, lo, hi)
		};
	});
}
function segsOf(pts) {
	const segs = [];
	let cur = [];
	for (const p of pts) if (!p) {
		if (cur.length) segs.push(cur);
		cur = [];
	} else cur.push(p);
	if (cur.length) segs.push(cur);
	return segs;
}
function seriesPath(rows, key, lo, hi) {
	const n = rows.length;
	const parts = [];
	let drawing = false;
	for (let i = 0; i < n; i++) {
		const v = rows[i][key];
		if (v == null || !Number.isFinite(v)) {
			drawing = false;
			continue;
		}
		const x = xOf(i, n);
		const y = yOf(v, lo, hi);
		parts.push(`${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
		drawing = true;
	}
	return parts.join(" ");
}
function catmull(seg) {
	if (!seg.length) return "";
	if (seg.length === 1) return `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
	if (seg.length === 2) return `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)} L${seg[1].x.toFixed(2)} ${seg[1].y.toFixed(2)}`;
	const t = .2;
	let d = `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
	for (let i = 0; i < seg.length - 1; i++) {
		const p0 = seg[i - 1] || seg[i];
		const p1 = seg[i];
		const p2 = seg[i + 1];
		const p3 = seg[i + 2] || p2;
		const c1x = p1.x + (p2.x - p0.x) * t;
		const c1y = p1.y + (p2.y - p0.y) * t;
		const c2x = p2.x - (p3.x - p1.x) * t;
		const c2y = p2.y - (p3.y - p1.y) * t;
		d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
	}
	return d;
}
function smoothPath(rows, key, lo, hi) {
	return segsOf(ptsOf(rows, key, lo, hi)).map(catmull).join(" ");
}
function stepPath(rows, key, lo, hi) {
	return segsOf(ptsOf(rows, key, lo, hi)).map((seg) => {
		if (!seg.length) return "";
		let d = `M${seg[0].x.toFixed(2)} ${seg[0].y.toFixed(2)}`;
		for (let i = 1; i < seg.length; i++) d += ` H${seg[i].x.toFixed(2)} V${seg[i].y.toFixed(2)}`;
		return d;
	}).join(" ");
}
function closeArea(line, first, last, baseY) {
	if (!line.startsWith("M") || !first || !last) return "";
	return `${line} L${last.x.toFixed(2)} ${baseY.toFixed(2)} L${first.x.toFixed(2)} ${baseY.toFixed(2)} Z`;
}
function smoothAreaPath(rows, lo, hi) {
	const line = smoothPath(rows, "port", lo, hi);
	const pts = ptsOf(rows, "port", lo, hi).filter((p) => Boolean(p));
	const base = yOf(lo, lo, hi);
	return closeArea(line, pts[0] || null, pts.at(-1) || null, base);
}
function fmtTick(day) {
	if (/^\d{4}-\d{2}$/.test(day)) return day.slice(2);
	if (day.length >= 10) return day.slice(2);
	return day;
}
function niceY(v, rupee) {
	if (!Number.isFinite(v)) return "—";
	if (rupee) {
		const a = Math.abs(v);
		const s = v < 0 ? "−" : "";
		if (a >= 1e7) return s + "₹" + (a / 1e7).toFixed(2) + " Cr";
		if (a >= 1e5) return s + "₹" + (a / 1e5).toFixed(2) + " L";
		if (a >= 1e3) return s + "₹" + Math.round(a).toLocaleString("en-IN");
		return s + "₹" + a.toFixed(0);
	}
	const a = Math.abs(v);
	if (a >= 100) return v.toFixed(0);
	if (a >= 10) return v.toFixed(1);
	return v.toFixed(2);
}
function yTicks(lo, hi, n = 5) {
	const out = [];
	for (let i = 0; i < n; i++) out.push(lo + (hi - lo) * i / (n - 1));
	return out;
}
function countable(rows, key) {
	return rows.filter((r) => r[key] != null && Number.isFinite(r[key])).length;
}
function smaRows(rows, win = 21) {
	const out = [];
	const q = [];
	let sum = 0;
	for (const r of rows) {
		const v = r.port;
		if (v == null || !Number.isFinite(v)) {
			out.push({
				day: r.day,
				port: null,
				bench: null
			});
			continue;
		}
		q.push(v);
		sum += v;
		if (q.length > win) sum -= q.shift();
		out.push({
			day: r.day,
			port: q.length >= Math.min(8, win) ? sum / q.length : null,
			bench: null
		});
	}
	return out;
}
function extremes(rows, key = "port") {
	const empty = {
		i: -1,
		v: 0,
		ch: 0,
		day: ""
	};
	let peak = {
		...empty,
		v: -Infinity
	};
	let trough = {
		...empty,
		v: Infinity
	};
	let best = {
		...empty,
		ch: -Infinity
	};
	let worst = {
		...empty,
		ch: Infinity
	};
	let prev = null;
	for (let i = 0; i < rows.length; i++) {
		const v = rows[i][key];
		if (v == null || !Number.isFinite(v)) continue;
		if (v > peak.v) peak = {
			i,
			v,
			ch: 0,
			day: rows[i].day
		};
		if (v < trough.v) trough = {
			i,
			v,
			ch: 0,
			day: rows[i].day
		};
		if (prev != null && prev !== 0) {
			const ch = (v / prev - 1) * 100;
			if (ch > best.ch) best = {
				i,
				v,
				ch,
				day: rows[i].day
			};
			if (ch < worst.ch) worst = {
				i,
				v,
				ch,
				day: rows[i].day
			};
		}
		prev = v;
	}
	return {
		peak,
		trough,
		best,
		worst
	};
}
function yearMarks(rows) {
	const out = [];
	let last = "";
	for (let i = 0; i < rows.length; i++) {
		const y = String(rows[i].day || "").slice(0, 4);
		if (y && y !== last) {
			if (last) out.push({
				i,
				year: y
			});
			last = y;
		}
	}
	return out;
}
function xmlEsc(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function paintBars(p, rows, lo, hi, mixStroke, kind) {
	const n = rows.length;
	const bw = Math.max(1.4, (800 - PAD.l - PAD.r) / Math.max(1, n) * (kind === "change" ? .72 : .58));
	const zero = yOf(Math.min(hi, Math.max(lo, 0)), lo, hi);
	const floor = yOf(lo, lo, hi);
	rows.forEach((r, i) => {
		if (r.port == null || !Number.isFinite(r.port)) return;
		if (kind === "change") {
			const prev = i > 0 ? rows[i - 1].port : r.port;
			if (prev == null || !Number.isFinite(prev)) return;
			const ch = r.port - prev;
			const y1 = yOf(prev, lo, hi);
			const y2 = yOf(r.port, lo, hi);
			const top = Math.min(y1, y2);
			const h = Math.max(1.4, Math.abs(y2 - y1));
			const fill = ch >= 0 ? UP_FILL : DOWN_STROKE;
			p.push(`<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}" fill-opacity="0.88" rx="0.6"/>`);
			return;
		}
		if (kind === "level") {
			const y1 = yOf(r.port, lo, hi);
			const h = Math.max(1.4, floor - y1);
			p.push(`<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${y1.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${mixStroke}" fill-opacity="0.78" rx="0.6"/>`);
			return;
		}
		const y1 = yOf(r.port, lo, hi);
		const top = Math.min(zero, y1);
		const h = Math.max(1.8, Math.abs(zero - y1));
		const fill = r.port >= 0 ? mixStroke : DOWN_STROKE;
		p.push(`<rect x="${(xOf(i, n) - bw / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"/>`);
	});
}
function buildSvgDoc(args) {
	const { rows, bar, rupee, mixStroke } = args;
	const n = rows.length;
	const style = args.style || (args.fill === false ? "line" : "area");
	const extra = args.showSma && args.sma ? args.sma : [];
	const wantBench = args.showBench !== false;
	const useBars = bar || style === "bar" || style === "columns";
	const showBench = wantBench && countable(rows, "bench") >= 2;
	const showMix = (useBars || args.showMix !== false) && countable(rows, "port") >= 2;
	const showPath = Boolean(args.showPath) && countable(rows, "path") >= 2 && !useBars;
	const showSame = Boolean(args.showSame) && countable(rows, "sameCash") >= 2 && !useBars;
	const keys = [];
	if (showMix) keys.push("port");
	if (showBench) keys.push("bench");
	if (showPath) keys.push("path");
	if (showSame) keys.push("sameCash");
	const { lo, hi } = domain(rows.concat(extra), keys.length ? keys : ["port"]);
	const ticks = yTicks(lo, hi);
	const pathFn = style === "step" ? stepPath : smoothPath;
	const portD = useBars || !showMix ? "" : pathFn(rows, "port", lo, hi);
	const benchD = useBars || !showBench ? "" : pathFn(rows, "bench", lo, hi);
	const pathD = showPath ? pathFn(rows, "path", lo, hi) : "";
	const sameD = showSame ? pathFn(rows, "sameCash", lo, hi) : "";
	const fillOn = showMix && !useBars && (style === "area" || args.fill !== false && style !== "line" && style !== "step");
	const fillD = fillOn ? smoothAreaPath(rows, lo, hi) : "";
	const smaD = !useBars && args.showSma && args.sma ? pathFn(args.sma, "port", lo, hi) : "";
	const xCount = Math.min(6, n);
	const xIdx = n ? Array.from({ length: xCount }, (_, i) => Math.round(i * (n - 1) / Math.max(1, xCount - 1))) : [];
	const benchStroke = args.benchStroke || "#9a9aa4";
	const lastStroke = args.pathPrimary ? PATH_STROKE : mixStroke;
	const p = [];
	p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300" preserveAspectRatio="none" data-kosh="plot">`);
	if (fillOn) {
		p.push(`<defs>`);
		p.push(`<linearGradient id="koshFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${mixStroke}" stop-opacity="0.32"/><stop offset="100%" stop-color="${mixStroke}" stop-opacity="0"/></linearGradient>`);
		p.push(`</defs>`);
	}
	for (const v of ticks) {
		const y = yOf(v, lo, hi);
		p.push(`<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${800 - PAD.r}" y2="${y.toFixed(2)}" stroke="${GRID_STROKE}" stroke-width="1"/>`);
		p.push(`<text x="${PAD.l - 6}" y="${y.toFixed(2)}" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="end" dominant-baseline="middle">${xmlEsc(niceY(v, rupee))}</text>`);
	}
	if (lo < 0 && hi > 0) {
		const y = yOf(0, lo, hi);
		p.push(`<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${800 - PAD.r}" y2="${y.toFixed(2)}" stroke="${ZERO_STROKE}" stroke-width="1"/>`);
	}
	for (const y of args.years || []) {
		const x = xOf(y.i, n);
		p.push(`<text x="${x.toFixed(2)}" y="${PAD.t + 11}" fill="${TICK_FILL}" font-size="9" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${xmlEsc(y.year)}</text>`);
	}
	for (const i of xIdx) {
		if (!rows[i]) continue;
		p.push(`<text x="${xOf(i, n).toFixed(2)}" y="292" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${xmlEsc(fmtTick(rows[i].day))}</text>`);
	}
	if (useBars) paintBars(p, rows, lo, hi, mixStroke, bar ? "period" : style === "bar" ? "change" : "level");
	else {
		if (fillD) p.push(`<path d="${fillD}" fill="url(#koshFill)" stroke="none"/>`);
		if (smaD.startsWith("M")) p.push(`<path d="${smaD}" fill="none" stroke="${SMA_STROKE}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`);
		if (sameD.startsWith("M")) p.push(`<path d="${sameD}" fill="none" stroke="${SAME_STROKE}" stroke-width="1.5" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round"/>`);
		if (benchD.startsWith("M")) p.push(`<path d="${benchD}" fill="none" stroke="${benchStroke}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>`);
		if (args.pathPrimary) {
			if (portD.startsWith("M")) p.push(`<path d="${portD}" fill="none" stroke="${mixStroke}" stroke-width="1.35" stroke-opacity="0.45" stroke-linejoin="round" stroke-linecap="round"/>`);
			if (pathD.startsWith("M")) p.push(`<path d="${pathD}" fill="none" stroke="${PATH_STROKE}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`);
		} else {
			if (pathD.startsWith("M")) p.push(`<path d="${pathD}" fill="none" stroke="${PATH_STROKE}" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>`);
			if (portD.startsWith("M")) p.push(`<path d="${portD}" fill="none" stroke="${mixStroke}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>`);
		}
		const lastKey = args.pathPrimary && showPath ? "path" : showMix ? "port" : showSame ? "sameCash" : showBench ? "bench" : "port";
		const lastI = [...rows.keys()].reverse().find((i) => rows[i][lastKey] != null && Number.isFinite(rows[i][lastKey]));
		if (lastI != null && rows[lastI][lastKey] != null) {
			const x = xOf(lastI, n);
			const y = yOf(rows[lastI][lastKey], lo, hi);
			p.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.6" fill="${lastStroke}" stroke="#09090b" stroke-width="1.4"/>`);
		}
	}
	p.push(`</svg>`);
	return p.join("");
}
var MODES = [
	{
		id: "cum",
		label: "Growth"
	},
	{
		id: "inr",
		label: "Rupees"
	},
	{
		id: "roll1y",
		label: "Rolling 1Y"
	},
	{
		id: "roll3m",
		label: "Rolling 3M"
	},
	{
		id: "m",
		label: "Monthly"
	},
	{
		id: "w",
		label: "Weekly"
	},
	{
		id: "dd",
		label: "Drawdown"
	},
	{
		id: "gap",
		label: "Gap"
	}
];
var RANGES = [
	{
		id: "1M",
		label: "1M"
	},
	{
		id: "3M",
		label: "3M"
	},
	{
		id: "6M",
		label: "6M"
	},
	{
		id: "YTD",
		label: "YTD"
	},
	{
		id: "1Y",
		label: "1Y"
	},
	{
		id: "MAX",
		label: "MAX"
	},
	{
		id: "CUSTOM",
		label: "Custom"
	}
];
var STYLES = [
	{
		id: "area",
		label: "Area"
	},
	{
		id: "line",
		label: "Line"
	},
	{
		id: "step",
		label: "Step"
	},
	{
		id: "bar",
		label: "Bars"
	},
	{
		id: "columns",
		label: "Columns"
	}
];
function asStyle(s) {
	if (s === "line" || s === "step" || s === "bar" || s === "columns" || s === "area") return s;
	return "area";
}
function seriesRet(rows, key) {
	const first = rows.find((r) => {
		const v = r[key];
		return v != null && Number.isFinite(v) && v !== 0;
	});
	const last = [...rows].reverse().find((r) => {
		const v = r[key];
		return v != null && Number.isFinite(v);
	});
	if (!first || !last) return null;
	const a = first[key];
	const b = last[key];
	if (a == null || b == null || !a) return null;
	return (b / a - 1) * 100;
}
function fmtRet(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function lastOf(rows, key) {
	return [...rows].reverse().find((r) => r[key] != null && Number.isFinite(r[key]))?.[key] || 0;
}
function rangeStats(rows, rupee, yTitle) {
	const first = rows.find((r) => r.port != null && Number.isFinite(r.port));
	const last = [...rows].reverse().find((r) => r.port != null && Number.isFinite(r.port));
	if (!first || !last || first.port == null || last.port == null) return null;
	if (/%|pp/.test(yTitle)) return {
		port: last.port,
		bench: last.bench,
		kind: "last"
	};
	if (rupee || yTitle.startsWith("Indexed") || yTitle.startsWith("₹")) return {
		port: first.port ? (last.port / first.port - 1) * 100 : null,
		bench: first.bench && last.bench && first.bench !== 0 ? (last.bench / first.bench - 1) * 100 : null,
		kind: "ret"
	};
	return {
		port: last.port,
		bench: last.bench,
		kind: "last"
	};
}
function fmtChip(n, kind, rupee) {
	if (!Number.isFinite(n)) return "—";
	if (rupee && kind === "num") return niceY(n, true);
	const sign = n >= 0 ? "+" : "";
	if (kind === "pp") return `${sign}${n.toFixed(1)} pp`;
	return `${sign}${n.toFixed(1)}%`;
}
function fmtBuyDay(d) {
	const [y, m, day] = d.split("-");
	if (!y || !m || !day) return d;
	const mo = [
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
	][Number(m) - 1];
	if (!mo) return d;
	return `${Number(day)} ${mo} '${y.slice(2)}`;
}
function NavChart({ nav, portLabel = "Portfolio", benchLabel = "Benchmark", coverage, nowValue, metals, range: rangeProp, onRange, fromBuy, pathLabel, sameLabel, pathPrimary, hideBench, modes }) {
	const prefs = useKosh((s) => s.navPrefs);
	const patchNavPrefs = useKosh((s) => s.patchNavPrefs);
	const [mode, setMode] = (0, import_react.useState)(modes?.[0] || "cum");
	const [rangeLocal, setRangeLocal] = (0, import_react.useState)(rangeProp || (pathPrimary ? "MAX" : "1Y"));
	const range = rangeProp || rangeLocal;
	const [customFrom, setCustomFrom] = (0, import_react.useState)("");
	const [customTo, setCustomTo] = (0, import_react.useState)("");
	function setRange(next) {
		setRangeLocal(next);
		onRange?.(next);
	}
	const [hover, setHover] = (0, import_react.useState)(null);
	const cardRef = (0, import_react.useRef)(null);
	const { fs, fallback, toggle } = useChartFullscreen(cardRef);
	const [mixOn, setMixOn] = (0, import_react.useState)(true);
	const [pathOn, setPathOn] = (0, import_react.useState)(true);
	const [sameOn, setSameOn] = (0, import_react.useState)(true);
	const [benchOn, setBenchOn] = (0, import_react.useState)(pathPrimary ? !hideBench : !hideBench && prefs.showBench);
	const smaOn = prefs.smaOn;
	const style = asStyle(prefs.style);
	const windowed = (0, import_react.useMemo)(() => sliceNav(nav || [], range, range === "CUSTOM" ? {
		from: customFrom,
		to: customTo
	} : void 0), [
		nav,
		range,
		customFrom,
		customTo
	]);
	const { rows, yTitle, bar } = (0, import_react.useMemo)(() => buildRows(windowed, mode, range === "CUSTOM" ? "MAX" : range, nowValue), [
		windowed,
		mode,
		range,
		nowValue
	]);
	const n = rows.length;
	const mixN = countable(rows, "port");
	const pathN = countable(rows, "path");
	const sameN = countable(rows, "sameCash");
	const benchN = countable(rows, "bench");
	const lineMode = !bar && style !== "bar" && style !== "columns";
	const showMix = (bar || mixOn) && mixN >= 2;
	const showBench = !hideBench && benchOn && benchN >= 2 && lineMode;
	const showPath = Boolean(pathLabel) && pathOn && pathN >= 2 && lineMode && (mode === "cum" || mode === "inr");
	const showSame = Boolean(sameLabel) && sameOn && sameN >= 2 && lineMode && (mode === "cum" || mode === "inr");
	const visKeys = [];
	if (showMix) visKeys.push("port");
	if (showBench) visKeys.push("bench");
	if (showPath) visKeys.push("path");
	if (showSame) visKeys.push("sameCash");
	const drawnN = visKeys.reduce((s, k) => Math.max(s, countable(rows, k)), 0);
	const mixStroke = pathPrimary ? PATH_STROKE : mode === "dd" ? DOWN_STROKE : MIX_STROKE;
	const benchStroke = pathPrimary ? SAME_STROKE : BENCH_STROKE;
	const rupee = mode === "inr";
	const fillOn = !bar && style === "area";
	const wantSma = smaOn && !bar && style !== "bar" && style !== "columns" && (mode === "cum" || mode === "inr" || mode === "gap");
	const sma = (0, import_react.useMemo)(() => wantSma ? smaRows(rows, 21) : [], [wantSma, rows]);
	const marks = (0, import_react.useMemo)(() => yearMarks(rows), [rows]);
	const ext = (0, import_react.useMemo)(() => extremes(rows, pathPrimary && showPath ? "path" : showMix ? "port" : visKeys[0] || "port"), [
		rows,
		pathPrimary,
		showPath,
		showMix,
		visKeys[0]
	]);
	const stats = rangeStats(rows, rupee, yTitle);
	const pathRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "path") : null;
	const sameRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "sameCash") : null;
	const mixRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "port") : null;
	const vsSame = pathRet != null && sameRet != null ? pathRet - sameRet : null;
	const svg = (0, import_react.useMemo)(() => buildSvgDoc({
		rows,
		bar,
		rupee,
		mixStroke,
		sma,
		years: marks,
		peak: ext.peak,
		showSma: wantSma && showMix,
		fill: fillOn && showMix,
		showBench,
		style: bar ? "bar" : style,
		showPath,
		showSame,
		showMix,
		pathPrimary,
		benchStroke
	}), [
		rows,
		bar,
		rupee,
		mixStroke,
		sma,
		marks,
		ext.peak,
		wantSma,
		fillOn,
		showBench,
		style,
		showPath,
		showSame,
		showMix,
		pathPrimary,
		benchStroke
	]);
	const img = (0, import_react.useMemo)(() => svgDataUrlSafe(svg), [svg]);
	const hiRow = hover != null ? rows[hover] : rows[n - 1];
	const { lo, hi } = domain(rows, visKeys.length ? visKeys : ["port"]);
	function onMove(e) {
		if (n < 2) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const t = (e.clientX - rect.left) / (rect.width || 1);
		const i = Math.round(Math.min(1, Math.max(0, t)) * (n - 1));
		setHover(i);
	}
	function saveChart() {
		const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `kosh-${mode}-${range}.svg`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
	function flip(which) {
		const nextMix = which === "mix" ? !mixOn : mixOn;
		const nextPath = which === "path" ? !pathOn : pathOn;
		const nextSame = which === "same" ? !sameOn : sameOn;
		const nextBench = which === "bench" ? !benchOn : benchOn;
		if (!(nextMix && mixN >= 2 || nextPath && Boolean(pathLabel) && pathN >= 2 || nextSame && Boolean(sameLabel) && sameN >= 2 || nextBench && !hideBench && benchN >= 2)) return;
		if (which === "mix") setMixOn(nextMix);
		if (which === "path") setPathOn(nextPath);
		if (which === "same") setSameOn(nextSame);
		if (which === "bench") {
			setBenchOn(nextBench);
			if (!hideBench && !pathPrimary) patchNavPrefs({ showBench: nextBench });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: cardRef,
		className: cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", fallback && "kosh-chart-fs", fs && "kosh-fs-live"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
					value: mode,
					onChange: setMode,
					options: modes?.length ? modes.map((id) => MODES.find((m) => m.id === id)).filter((m) => Boolean(m)) : MODES
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
					value: range,
					onChange: setRange,
					options: RANGES
				})]
			}),
			fromBuy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setCustomFrom(fromBuy);
						setCustomTo("");
						setRange("CUSTOM");
					},
					className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", range === "CUSTOM" && customFrom === fromBuy ? "bg-surface-2 text-fg" : "bg-bg text-muted hover:text-fg"),
					children: ["From buy ", fmtBuyDay(fromBuy)]
				})
			}) : null,
			range === "CUSTOM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5",
					children: ["From", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]",
						value: customFrom,
						onChange: (e) => setCustomFrom(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5",
					children: ["To", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]",
						value: customTo,
						onChange: (e) => setCustomTo(e.target.value)
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					metals?.present ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-8 rounded-[6px] px-3 text-[12px] font-medium", !metals.included ? "bg-surface text-fg" : "text-muted"),
							onClick: () => metals.onChange(false),
							children: "Equity only"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-8 rounded-[6px] px-3 text-[12px] font-medium", metals.included ? "bg-surface text-fg" : "text-muted"),
							onClick: () => metals.onChange(true),
							children: "With gold & silver"
						})]
					}) : null,
					!bar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
						value: style,
						onChange: (id) => patchNavPrefs({
							style: id,
							fill: id === "area"
						}),
						options: STYLES
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", wantSma ? "bg-bg-elevated text-fg" : "text-muted"),
						onClick: () => patchNavPrefs({ smaOn: !smaOn }),
						children: ["21-session average ", wantSma ? "on" : "off"]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none text-muted shadow-[var(--shadow-border)] hover:text-fg",
						onClick: saveChart,
						children: "Save chart"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: fs ? "Exit fullscreen" : "Fullscreen",
						onClick: () => void toggle(),
						className: cn("inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", fs ? "bg-bg-elevated text-fg" : "text-muted hover:text-fg"),
						children: [fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" }), fs ? "Exit" : "Full"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					coverage ? `${coverage} · ${yTitle}` : yTitle,
					` · ${drawnN} points drawn`,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-muted",
						children: "Hover a day · tap a name to show or hide"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: portLabel,
							color: mixStroke,
							on: showMix,
							onClick: () => flip("mix")
						}),
						hideBench ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: benchLabel,
							color: benchStroke,
							on: showBench,
							dashed: pathPrimary,
							onClick: () => flip("bench")
						}),
						pathLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: pathLabel,
							color: PATH_STROKE,
							on: showPath,
							muted: true,
							onClick: () => flip("path")
						}) : null,
						sameLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: sameLabel,
							color: SAME_STROKE,
							on: showSame,
							dashed: true,
							onClick: () => flip("same")
						}) : null,
						wantSma ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 px-1 text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-block h-[3px] w-3.5 rounded-full",
								style: { background: SMA_STROKE }
							}), "21d avg"]
						}) : null
					]
				})]
			}),
			stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-3 font-mono text-[13px] tabular",
				children: pathPrimary && rupee && !pathLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: mixStroke },
					children: [
						portLabel,
						" ",
						niceY(lastOf(rows, "port"), true)
					]
				}) : null, showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: benchStroke },
					children: [
						benchLabel,
						" ",
						niceY(lastOf(rows, "bench"), true)
					]
				}) : null] }) : pathPrimary && pathLabel && (mode === "cum" || mode === "inr") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					showPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: PATH_STROKE },
						children: [
							pathLabel,
							" ",
							rupee ? niceY(lastOf(rows, "path"), true) : fmtRet(pathRet)
						]
					}) : null,
					showSame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: SAME_STROKE },
						children: [
							sameLabel,
							" ",
							rupee ? niceY(lastOf(rows, "sameCash"), true) : fmtRet(sameRet)
						]
					}) : null,
					showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "opacity-60",
						style: { color: mixStroke },
						children: [
							portLabel,
							" ",
							rupee ? niceY(lastOf(rows, "port"), true) : fmtRet(mixRet)
						]
					}) : null,
					vsSame != null && showPath && showSame && !rupee ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: vsSame >= 0 ? "text-up" : "text-down",
						children: [
							"Vs same money ",
							vsSame >= 0 ? "+" : "",
							vsSame.toFixed(1),
							" pp"
						]
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: mixStroke },
						children: [
							portLabel,
							" ",
							stats.kind === "ret" ? stats.port == null ? "—" : `${stats.port >= 0 ? "+" : ""}${stats.port.toFixed(1)}%` : stats.port == null ? "—" : niceY(stats.port, rupee)
						]
					}) : null,
					showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							benchLabel,
							" ",
							stats.kind === "ret" ? stats.bench == null ? "—" : `${stats.bench >= 0 ? "+" : ""}${stats.bench.toFixed(1)}%` : stats.bench == null ? "—" : niceY(stats.bench, rupee)
						]
					}) : null,
					showMix && showBench && stats.kind === "ret" && stats.port != null && stats.bench != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: stats.port - stats.bench >= 0 ? "text-up" : "text-down",
						children: [
							"Gap ",
							stats.port - stats.bench >= 0 ? "+" : "",
							(stats.port - stats.bench).toFixed(1),
							" pp"
						]
					}) : null
				] })
			}) : null,
			yTitle.startsWith("Indexed") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-[12px] leading-relaxed text-muted",
				children: pathPrimary ? `Growth is how the names you actually held did — extra money you added later is taken out. Switch to Rupees for the rupees you held. The dashed line is the same rupees in the index on the same days.` : `Both lines start at 100 on ${rows.find((r) => r.port != null && r.bench != null)?.day || "the first overlapping day"} of this ${range} window — not rupee prices. If the index sits lower, this name beat it over the window. It is not a scale error. Switch 1Y / 5Y / MAX to change the window; alpha and beta use the same slice, daily Jensen vs this index, Rf 6.5%.`
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "kosh-plot relative mt-3 w-full",
				"data-testid": "kosh-nav",
				"data-points": drawnN,
				"data-dlen": bar ? String(n) : seriesPath(rows, visKeys[0] || "port", lo, hi).length,
				onMouseMove: onMove,
				onMouseLeave: () => setHover(null),
				children: [drawnN < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-full place-items-center px-6 text-center text-sm text-muted",
					children: "Not enough daily prices to draw a line yet. Check Holdings if a ticker is still unresolved."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: img,
					alt: `${portLabel} versus ${benchLabel}`,
					width: 800,
					height: 300,
					className: "kosh-plot-img",
					"data-testid": "kosh-nav-img",
					decoding: "sync",
					loading: "eager"
				}), hover != null && rows[hover] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "kosh-plot-cross",
					style: { left: `${hover / Math.max(1, n - 1) * 100}%` }
				}) : null] }), hiRow && drawnN >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute top-2 right-2 z-10 rounded-sm bg-bg-elevated/90 px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-subtle",
							children: hiRow.day
						}),
						showPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-0.5 font-mono tabular",
							style: { color: PATH_STROKE },
							children: [
								pathLabel,
								" ",
								hiRow.path == null ? "—" : niceY(hiRow.path, rupee)
							]
						}) : null,
						showSame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono tabular",
							style: { color: SAME_STROKE },
							children: [
								sameLabel,
								" ",
								hiRow.sameCash == null ? "—" : niceY(hiRow.sameCash, rupee)
							]
						}) : null,
						showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("font-mono tabular", pathPrimary ? "mt-0.5 opacity-60" : "mt-0.5"),
							style: { color: mixStroke },
							children: [
								portLabel,
								" ",
								hiRow.port == null ? "—" : niceY(hiRow.port, rupee)
							]
						}) : null,
						showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono tabular text-muted",
							children: [
								benchLabel,
								" ",
								hiRow.bench == null ? "—" : niceY(hiRow.bench, rupee)
							]
						}) : null,
						showMix && showBench && hiRow.port != null && hiRow.bench != null && !rupee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: hiRow.port - hiRow.bench >= 0 ? "text-up" : "text-down",
							children: fmtChip(hiRow.port - hiRow.bench, "pp", false)
						}) : null
					]
				}) : null]
			}),
			drawnN >= 2 && ext.peak.i >= 0 ? rupee && pathPrimary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 text-[12px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					label: "Highest",
					value: niceY(ext.peak.v, rupee),
					hint: ext.peak.day
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					label: "Lowest",
					value: niceY(ext.trough.v, rupee),
					hint: ext.trough.day
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Peak",
						value: niceY(ext.peak.v, rupee),
						hint: ext.peak.day
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Trough",
						value: niceY(ext.trough.v, rupee),
						hint: ext.trough.day
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Best session",
						value: fmtChip(ext.best.ch, "pct", false),
						hint: ext.best.day,
						tone: ext.best.ch >= 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Worst session",
						value: fmtChip(ext.worst.ch, "pct", false),
						hint: ext.worst.day,
						tone: ext.worst.ch >= 0 ? "up" : "down"
					})
				]
			}) : null
		]
	});
}
function svgDataUrlSafe(svg) {
	return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function Highlight({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-3 py-2 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-0.5 font-mono text-[13px] tabular", tone === "up" && "text-up", tone === "down" && "text-down"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted",
				children: hint
			})
		]
	});
}
function SeriesChip({ label, color, on, muted, dashed, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": on,
		title: on ? `Hide ${label}` : `Show ${label}`,
		onClick,
		className: cn("inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] leading-none shadow-[var(--shadow-border)]", on ? "bg-bg-elevated text-fg" : "text-subtle line-through decoration-subtle", muted && on && "opacity-70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-block h-[3px] w-3.5 shrink-0 rounded-full",
			style: dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${on ? color : "#6e6e76"} 0 3px, transparent 3px 5px)` } : { background: on ? color : "#6e6e76" }
		}), label]
	});
}
//#endregion
export { niceY as a, yTicks as c, TICK_FILL as i, NavChart as n, xOf as o, PAD as r, yOf as s, GRID_STROKE as t };
