import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { d as apiOhlc, f as apiQuotes, h as apiScreener, i as apiFundamentals, l as apiNews, x as apiTape } from "./api-BE61nRQk.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as getRouteApi, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as newsBucket, J as pickScreenRow, O as filterNews, St as formatShPeriod, V as newsMaterial, c as Tooltip, f as applyScreen, ht as treemap, i as Route$36, kt as formatFinPeriod, n as NEWS_BUCKETS, ot as sectorPulse, wt as stakeDelta } from "./router-MmE3qr5w.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { D as GripVertical, E as Layers, F as ArrowUpRight, L as ArrowDownRight, S as Maximize2, T as LayoutGrid, _ as MousePointer2, a as Trash2, b as Minimize2, c as Square, f as RotateCcw, g as MoveRight, j as Columns2, k as Crosshair, l as Spline, n as UnfoldVertical, p as Plus, r as Undo2, s as Star, y as Minus } from "../_libs/lucide-react.mjs";
import { $ as tapeFreshness, B as patchLastBar, D as fmtVol, Dn as sectorIndex, Dt as fmtPx, E as ema, En as resolveBench, Et as fmtPct, H as projectTimeToX, J as sma, K as rsi, L as macd, M as keySectorals, O as freshestPrint, S as classifyFreshness, Sn as cn, T as drawKey, U as projectXToTime, W as quoteMap, Y as snapTermHeight, _ as TERM_INTERVALS, b as bollinger, ct as vwap, et as termBars, g as TERM_HEIGHT, gn as universeName, h as NIFTY_CATALOGUE, it as useKosh, j as isWatched, k as instrumentKind, nt as termHeightName, p as INDEX_FAMILIES, rt as terminalSearch, tt as termFetchSpec, y as bareSymbol, z as newDrawId } from "./router-MmE3qr5w2.mjs";
import { i as useAppLayout } from "./layout-switch-YQtzCKX2.mjs";
import { a as isIstSession, o as istClock } from "./ledger-shell-CMHptNCL.mjs";
import { t as AppShell } from "./app-shell-_Ldezoz8.mjs";
import { t as MixNudge } from "./mix-nudge-OP1YZOpM.mjs";
import { t as useChartFullscreen } from "./use-fullscreen-DQ7DYulI.mjs";
import { C as panBy, D as zoomRightEdge, T as positionMetrics, _ as histInit, b as histUndo, c as applyDrag, d as buildSnapshot, f as buildValuationModels, g as growthEvidence, h as earningsQualityRead, l as applyHistoricalFx, m as detectPatterns, o as WordChip, p as channelOffFromThird, s as adjustOhlcToBenchmark, t as AdjustMenu, u as atLatest, v as histPush, w as patternStatusLabel, x as hitTest, y as histRedo } from "./kosh-snapshot-oVV5bCEK.mjs";
import { r as MiniBars, t as BreadthBar } from "./share-ring-Ch0LyI_f.mjs";
import { n as MacroBoard, r as MarketTempCard, t as EventCalendar } from "./macro-board-dFYtUPBd.mjs";
import { o as PulseDesk, r as NewsBoard } from "./note-desk-Di_QXthy.mjs";
import { n as sortEntities, r as sortGlyph, t as cycleSort } from "./kosh-table-CICVK_6T.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-DjP4Q-1T.js
var markets_DjP4Q_1T_exports = /* @__PURE__ */ __exportAll({
	component: () => Markets,
	t: () => TermChart$1
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UP = "var(--color-up)";
var DOWN = "var(--color-down)";
var GRID = "var(--color-chart-grid)";
var INK = "var(--color-fg)";
var MUTED = "var(--color-subtle)";
var CHART = "var(--color-chart)";
var WARN = "var(--color-warn)";
var ACCENT = "var(--color-accent)";
var PAD = {
	l: 10,
	r: 58,
	t: 10,
	b: 20
};
var VOL_H = 36;
var OSC_H = 44;
var FIBS = [
	0,
	.236,
	.382,
	.5,
	.618,
	.786,
	1
];
var TF_VIEW = {
	"1m": 180,
	"3m": 160,
	"5m": 160,
	"15m": 140,
	"30m": 140,
	"1H": 160,
	"4H": 120,
	D: 180,
	W: 130,
	M: 90
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
function fmtWhen(tSec, intra) {
	const d = /* @__PURE__ */ new Date((tSec + 19800) * 1e3);
	const day = d.getUTCDate();
	const mon = MONTHS[d.getUTCMonth()];
	const yy = d.getUTCFullYear();
	if (!intra) return `${day} ${mon} ${yy}`;
	return `${day} ${mon} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
function drawIv(id) {
	if (id === "D") return "1D";
	if (id === "W") return "1W";
	if (id === "M") return "1M";
	return id;
}
var EMPTY_SHAPES = [];
var EMPTY_PATTERNS = [];
var EMPTY_BARS = [];
var TOOLS = [
	{
		id: "pan",
		label: "Select",
		icon: MousePointer2
	},
	{
		id: "crosshair",
		label: "Crosshair",
		icon: Crosshair
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
		id: "ray",
		label: "Ray",
		icon: MoveRight
	},
	{
		id: "vline",
		label: "V-line",
		icon: UnfoldVertical
	},
	{
		id: "rect",
		label: "Rect",
		icon: Square
	},
	{
		id: "channel",
		label: "Channel",
		icon: Columns2
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
	}
];
function TermChart$1({ symbol, name, interval, quote, active, style, owned, onActivate, onInterval, onStyle, onPatterns, embed }) {
	const spec = (0, import_react.useMemo)(() => termFetchSpec(interval), [interval]);
	const session = isIstSession();
	const ohlc = useQuery({
		queryKey: [
			"ohlc",
			symbol,
			spec.range,
			spec.yahoo
		],
		queryFn: () => apiOhlc(symbol, spec.range, spec.yahoo),
		enabled: Boolean(symbol),
		staleTime: spec.intra ? 15e3 : 6e4,
		refetchInterval: () => isIstSession() ? spec.intra ? 15e3 : 6e4 : 3e5,
		placeholderData: keepPreviousData
	});
	const raw = ohlc.data?.bars || EMPTY_BARS;
	const hist = (0, import_react.useMemo)(() => termBars(raw, spec), [raw, spec]);
	const priceBars = (0, import_react.useMemo)(() => quote && quote.price > 0 ? patchLastBar(hist, quote, spec) : hist, [
		hist,
		quote,
		spec
	]);
	const chartMode = useKosh((s) => s.chartPrefs.chartMode || "price");
	const chartBench = useKosh((s) => s.chartPrefs.chartBench || "nifty");
	const benchMeta = resolveBench(chartBench);
	const benchQ = useQuery({
		queryKey: [
			"ohlc",
			benchMeta.symbol,
			spec.range,
			spec.yahoo
		],
		queryFn: () => apiOhlc(benchMeta.symbol, spec.range, spec.yahoo),
		enabled: chartMode === "bench" && Boolean(symbol),
		staleTime: 6e4
	});
	const fxQ = useQuery({
		queryKey: [
			"ohlc",
			"INR=X",
			spec.intra ? "6mo" : spec.range,
			"1d"
		],
		queryFn: () => apiOhlc("INR=X", spec.intra ? "6mo" : spec.range, "1d"),
		enabled: chartMode === "usd",
		staleTime: 6e4
	});
	const usdPack = (0, import_react.useMemo)(() => chartMode === "usd" ? applyHistoricalFx(priceBars, fxQ.data?.bars || []) : null, [
		chartMode,
		priceBars,
		fxQ.data
	]);
	const bars = (0, import_react.useMemo)(() => {
		if (chartMode === "usd" && usdPack && usdPack.bars.length >= 2) return usdPack.bars;
		return priceBars;
	}, [
		chartMode,
		priceBars,
		usdPack
	]);
	const px = quote?.price && quote.price > 0 ? quote.price : ohlc.data?.price || bars.at(-1)?.c || 0;
	const chg = quote?.changePct ?? ohlc.data?.changePct ?? 0;
	const fresh = classifyFreshness({
		session,
		price: px,
		marketTime: quote?.marketTime,
		retrievedAt: quote?.retrievedAt
	});
	const missing = Boolean(ohlc.data?.missing) || !ohlc.isPending && bars.length < 2;
	const volMissing = bars.length > 0 && bars.every((b) => !(b.v > 0));
	const exch = /BSE|Bombay/i.test(ohlc.data?.exchange || "") ? "BSE" : "NSE";
	const watch = useKosh((s) => s.watch);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const watched = isWatched(symbol, watch);
	const logScale = useKosh((s) => s.chartPrefs.logScale);
	const patternsOn = useKosh((s) => s.chartPrefs.patternsOn === true);
	const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
	const drawings = useKosh((s) => s.drawings);
	const setDrawings = useKosh((s) => s.setDrawings);
	const dKey = drawKey(symbol, drawIv(interval));
	const shapes = drawings[dKey] || EMPTY_SHAPES;
	const wrap = (0, import_react.useRef)(null);
	const hoverRaf = (0, import_react.useRef)(0);
	const vLine = (0, import_react.useRef)(null);
	const hLine = (0, import_react.useRef)(null);
	const priceTag = (0, import_react.useRef)(null);
	const dateTag = (0, import_react.useRef)(null);
	const ohlcRead = (0, import_react.useRef)(null);
	const [size, setSize] = (0, import_react.useState)({
		w: 640,
		h: 320
	});
	const [view, setView] = (0, import_react.useState)({
		start: 0,
		count: TF_VIEW[interval] || 180
	});
	const [inds, setInds] = (0, import_react.useState)({
		sma20: false,
		ema21: false,
		bb: false,
		vwap: false,
		rsi: false,
		macd: false
	});
	const [tool, setTool] = (0, import_react.useState)("pan");
	const drawOpen = useKosh((s) => s.chartPrefs.drawOpen !== false);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const drag = (0, import_react.useRef)(null);
	const move = (0, import_react.useRef)(null);
	const clicks = (0, import_react.useRef)(0);
	const histDraw = (0, import_react.useRef)(histInit([]));
	(0, import_react.useEffect)(() => {
		histDraw.current = histInit(drawings[dKey] || EMPTY_SHAPES);
	}, [dKey]);
	(0, import_react.useEffect)(() => {
		const el = wrap.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const r = el.getBoundingClientRect();
			const w = Math.max(220, r.width);
			const h = Math.max(160, r.height);
			setSize((prev) => Math.abs(prev.w - w) < .5 && Math.abs(prev.h - h) < .5 ? prev : {
				w,
				h
			});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const n = bars.length;
		const count = Math.min(n, TF_VIEW[interval] || 180);
		setView({
			start: Math.max(0, n - count),
			count: count || 1
		});
		setDraft(null);
	}, [
		symbol,
		interval,
		bars.length
	]);
	const oscOn = inds.rsi || inds.macd;
	const plotH = Math.max(80, size.h - PAD.t - PAD.b - VOL_H - (oscOn ? 52 : 0));
	const innerW = Math.max(40, size.w - PAD.l - PAD.r);
	const sliced = (0, import_react.useMemo)(() => bars.slice(view.start, view.start + view.count), [
		bars,
		view.start,
		view.count
	]);
	const benchPack = (0, import_react.useMemo)(() => chartMode === "bench" ? adjustOhlcToBenchmark(sliced, benchQ.data?.bars || [], spec.intra ? "time" : "day") : null, [
		chartMode,
		sliced,
		benchQ.data,
		spec.intra
	]);
	const shown = benchPack && benchPack.bars.length >= 2 ? benchPack.bars : sliced;
	const n = shown.length;
	const lo0 = shown.reduce((m, b) => Math.min(m, b.l), Infinity);
	const hi0 = shown.reduce((m, b) => Math.max(m, b.h), -Infinity);
	const pad = (hi0 - lo0) * .04 || 1;
	const lo = Number.isFinite(lo0) ? Math.max(1e-4, lo0 - pad) : 1e-4;
	const hi = Number.isFinite(hi0) ? hi0 + pad : 1;
	const span = hi - lo || 1;
	const useLog = logScale && lo > 0 && hi > 0 && hi > lo;
	const yPx = (p) => {
		const v = p > 0 ? p : lo;
		if (useLog) {
			const lLo = Math.log(lo);
			const lHi = Math.log(hi);
			return PAD.t + (lHi - Math.log(Math.max(v, lo))) / (lHi - lLo || 1) * plotH;
		}
		return PAD.t + (hi - p) / span * plotH;
	};
	const yInv = (y) => {
		const t = (y - PAD.t) / (plotH || 1);
		if (useLog) {
			const lLo = Math.log(lo);
			const lHi = Math.log(hi);
			return Math.exp(lHi - t * (lHi - lLo));
		}
		return hi - t * span;
	};
	const xAt = (i) => PAD.l + (n <= 1 ? innerW / 2 : (i + .5) * (innerW / n));
	const slot = n ? innerW / n : 8;
	const cw = Math.max(1, Math.min(9, slot * .62));
	const closes = shown.map((b) => b.c);
	const sma20 = inds.sma20 ? sma(closes, 20) : null;
	const ema21 = inds.ema21 ? ema(closes, 21) : null;
	const bb = inds.bb ? bollinger(closes, 20, 2) : null;
	const vw = inds.vwap && spec.intra ? vwap(shown) : null;
	const rsiArr = inds.rsi ? rsi(closes, 14) : null;
	const macdPack = inds.macd ? macd(closes) : null;
	const maxVol = Math.max(...shown.map((b) => b.v || 0), 1);
	const patterns = (0, import_react.useMemo)(() => patternsOn && shown.length >= 24 ? detectPatterns(shown) : EMPTY_PATTERNS, [shown, patternsOn]);
	(0, import_react.useEffect)(() => {
		if (!active || !onPatterns) return;
		onPatterns(patterns);
	}, [
		active,
		patterns,
		onPatterns
	]);
	const yTicks = (0, import_react.useMemo)(() => {
		const ticks = [];
		if (useLog) {
			const lLo = Math.log10(lo);
			const step = (Math.log10(hi) - lLo) / 4;
			for (let i = 0; i <= 4; i++) ticks.push(Math.pow(10, lLo + step * i));
			return ticks;
		}
		for (let i = 0; i <= 4; i++) ticks.push(lo + span * i / 4);
		return ticks;
	}, [
		lo,
		hi,
		span,
		useLog
	]);
	function idxAt(clientX) {
		const r = wrap.current?.getBoundingClientRect();
		if (!r || n < 1) return 0;
		const x = clientX - r.left;
		const i = Math.round((x - PAD.l) / (innerW / n) - .5);
		return Math.max(0, Math.min(n - 1, i));
	}
	function xyAt(clientX, clientY) {
		const r = wrap.current?.getBoundingClientRect();
		if (!r) return {
			x: 0,
			y: 0,
			i: 0,
			t: shown[0]?.t || 0,
			p: lo
		};
		const x = clientX - r.left;
		const y = clientY - r.top;
		return {
			x,
			y,
			i: idxAt(clientX),
			t: shown.length ? projectXToTime(x, shown, xAt) : 0,
			p: yInv(y)
		};
	}
	(0, import_react.useEffect)(() => {
		const el = wrap.current;
		if (!el) return;
		const onWheel = (e) => {
			const pinch = e.ctrlKey || e.metaKey;
			const absX = Math.abs(e.deltaX);
			const absY = Math.abs(e.deltaY);
			const pan = !pinch && (e.shiftKey || absX > absY && absX > 0);
			const zoom = pinch || !e.shiftKey && absY > 0 && absY >= absX;
			if (!pan && !zoom) return;
			e.preventDefault();
			if (bars.length < 20) return;
			if (pan) {
				const dir = (absX > absY ? e.deltaX : e.deltaY) > 0 ? 1 : -1;
				const step = Math.max(1, Math.round(view.count * .08)) * dir;
				setView(panBy(view, bars.length, step));
				return;
			}
			setView(zoomRightEdge(view, bars.length, e.deltaY < 0));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		let pinchDist = 0;
		let gestureScale = 1;
		const dist = (e) => {
			const a = e.touches[0];
			const b = e.touches[1];
			return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
		};
		const onTouchStart = (e) => {
			if (e.touches.length === 2) pinchDist = dist(e);
		};
		const onTouchMove = (e) => {
			if (e.touches.length !== 2 || bars.length < 20) return;
			e.preventDefault();
			const next = dist(e);
			if (!pinchDist) {
				pinchDist = next;
				return;
			}
			const ratio = next / pinchDist;
			if (ratio > 1.04 || ratio < .96) {
				setView(zoomRightEdge(view, bars.length, ratio > 1));
				pinchDist = next;
			}
		};
		const onTouchEnd = () => {
			pinchDist = 0;
		};
		const onGestureStart = (e) => {
			e.preventDefault();
			gestureScale = 1;
		};
		const onGestureChange = (e) => {
			e.preventDefault();
			if (bars.length < 20) return;
			const scale = Number(e.scale || 1);
			if (Math.abs(scale - gestureScale) < .03) return;
			const zoomIn = scale > gestureScale;
			gestureScale = scale;
			setView(zoomRightEdge(view, bars.length, zoomIn));
		};
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		el.addEventListener("touchend", onTouchEnd);
		el.addEventListener("gesturestart", onGestureStart, { passive: false });
		el.addEventListener("gesturechange", onGestureChange, { passive: false });
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchend", onTouchEnd);
			el.removeEventListener("gesturestart", onGestureStart);
			el.removeEventListener("gesturechange", onGestureChange);
		};
	}, [bars, view]);
	function fit() {
		setView({
			start: 0,
			count: Math.max(1, bars.length)
		});
	}
	function latest() {
		const count = Math.min(bars.length, TF_VIEW[interval] || 180);
		setView({
			start: Math.max(0, bars.length - count),
			count
		});
	}
	const onLatest = atLatest(view, bars.length);
	function save(next) {
		histDraw.current = histPush(histDraw.current, next);
		setDrawings(dKey, next);
	}
	function undoDraw() {
		const u = histUndo(histDraw.current);
		if (!u) return;
		histDraw.current = u.hist;
		setDrawings(dKey, u.shapes);
		setSelectedId(null);
	}
	function redoDraw() {
		const u = histRedo(histDraw.current);
		if (!u) return;
		histDraw.current = u.hist;
		setDrawings(dKey, u.shapes);
	}
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
				e.preventDefault();
				save(shapes.filter((s) => s.id !== selectedId));
				setSelectedId(null);
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				if (draft) {
					setDraft(null);
					clicks.current = 0;
					return;
				}
				if (selectedId) {
					setSelectedId(null);
					return;
				}
				setTool("pan");
				return;
			}
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
				e.preventDefault();
				if (e.shiftKey) redoDraw();
				else undoDraw();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		draft,
		selectedId,
		shapes,
		dKey
	]);
	const last = shown[n - 1];
	const lastUp = last && last.c >= last.o;
	function readText(b) {
		return `${fmtWhen(b.t, spec.intra)} · O ${fmtPx(b.o)} H ${fmtPx(b.h)} L ${fmtPx(b.l)} C ${fmtPx(b.c)}${volMissing ? " · Volume unavailable" : ` · Vol ${fmtVol(b.v)}`}`;
	}
	function paintHover(i, y) {
		const bar = shown[i];
		if (!bar) return;
		const x = xAt(i);
		const price = yInv(y);
		if (vLine.current) {
			vLine.current.style.display = "block";
			vLine.current.style.left = `${x}px`;
		}
		if (hLine.current) {
			hLine.current.style.display = "block";
			hLine.current.style.top = `${y}px`;
		}
		if (priceTag.current) {
			priceTag.current.style.display = "block";
			priceTag.current.style.top = `${y}px`;
			priceTag.current.textContent = price >= 100 ? price.toFixed(1) : price.toFixed(2);
		}
		if (dateTag.current) {
			dateTag.current.style.display = "block";
			dateTag.current.style.left = `${x}px`;
			dateTag.current.textContent = fmtWhen(bar.t, spec.intra);
		}
		if (ohlcRead.current) ohlcRead.current.textContent = readText(bar);
	}
	function hideHover() {
		if (vLine.current) vLine.current.style.display = "none";
		if (hLine.current) hLine.current.style.display = "none";
		if (priceTag.current) priceTag.current.style.display = "none";
		if (dateTag.current) dateTag.current.style.display = "none";
		if (ohlcRead.current && last) ohlcRead.current.textContent = readText(last);
	}
	(0, import_react.useEffect)(() => {
		if (ohlcRead.current && last) ohlcRead.current.textContent = `${fmtWhen(last.t, spec.intra)} · O ${fmtPx(last.o)} H ${fmtPx(last.h)} L ${fmtPx(last.l)} C ${fmtPx(last.c)}`;
	}, [last, spec.intra]);
	function poly(vals, color) {
		const pts = [];
		vals.forEach((v, i) => {
			if (v == null || !(v > 0)) return;
			pts.push(`${xAt(i).toFixed(1)},${yPx(v).toFixed(1)}`);
		});
		if (pts.length < 2) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: color,
			strokeWidth: "1.2",
			points: pts.join(" ")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-term-chart": true,
		"data-chart-right": view.start + view.count,
		"data-chart-count": view.count,
		"data-active": active ? "1" : "0",
		onClick: onActivate,
		className: cn("flex h-full min-h-0 min-w-0 flex-col bg-bg", active && "ring-1 ring-inset ring-accent/50"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: cn("flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5", !embed && "sm:flex-row sm:items-center sm:gap-2"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-baseline gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate text-[15px] font-semibold",
							children: bareSymbol(symbol)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-[10px] text-subtle sm:inline",
							children: exch
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("hidden min-w-0 truncate text-[11px] text-muted", !embed && "lg:inline"),
							children: name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[15px] tabular",
							children: fmtPx(px)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down"),
							children: fmtPct(chg)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", fresh.state === "live" ? "bg-up/15 text-up" : fresh.state === "off" ? "bg-down/15 text-down" : "bg-surface-2 text-muted"),
							title: fresh.title,
							children: fresh.state === "last" ? embed ? `Last session${quote?.marketTime ? ` · ${istClock(quote.marketTime)}` : ""}` : fresh.label : fresh.state === "live" || fresh.state === "delayed" || fresh.state === "stale" ? `● ${fresh.label} · ${istClock()}` : fresh.label
						}),
						owned && !embed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted lg:inline",
							children: owned
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: watched ? "Remove from watch" : "Add to watch",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": watched ? "Remove from watch" : "Add to watch",
								onClick: (e) => {
									e.stopPropagation();
									toggleWatch(symbol);
								},
								className: cn("grid size-7 place-items-center", watched ? "text-warn" : "text-subtle hover:text-fg"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", watched && "fill-current") })
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-0 items-center gap-0.5 overflow-x-auto",
					children: TERM_INTERVALS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-tf": t.id,
						onClick: (e) => {
							e.stopPropagation();
							onInterval(t.id);
						},
						className: cn("h-7 min-w-7 shrink-0 rounded-sm px-1.5 text-[11px] font-medium", t.id === interval ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						children: t.label
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-2 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-7 rounded-sm px-2 text-[11px] font-medium", style === "candle" ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						onClick: (e) => {
							e.stopPropagation();
							onStyle?.(style === "candle" ? "line" : "candle");
						},
						children: style === "candle" ? "Candle" : "Line"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": useLog,
						onClick: (e) => {
							e.stopPropagation();
							patchChartPrefs({ logScale: !logScale });
						},
						className: cn("h-7 rounded-sm px-2 text-[11px] font-semibold", logScale ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						children: "Log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdjustMenu, {
						compact: true,
						stop: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": patternsOn,
						"aria-label": "Pattern overlay",
						onClick: (e) => {
							e.stopPropagation();
							patchChartPrefs({ patternsOn: !patternsOn });
						},
						className: cn("h-7 rounded-sm px-2 text-[11px] font-medium", patternsOn ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						children: "Patterns"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-expanded": drawOpen,
						"aria-label": "Drawing tools",
						onClick: (e) => {
							e.stopPropagation();
							patchChartPrefs({ drawOpen: !drawOpen });
						},
						className: cn("h-7 rounded-sm px-2 text-[11px] font-medium", drawOpen || tool !== "pan" && tool !== "crosshair" ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						children: "Draw"
					}),
					drawOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-0.5",
						children: [
							TOOLS.map((t) => {
								const Icon = t.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									content: t.label,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t.label,
										onClick: (e) => {
											e.stopPropagation();
											setTool(t.id);
											setDraft(null);
											clicks.current = 0;
										},
										className: cn("grid size-7 place-items-center rounded-sm", tool === t.id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
									})
								}, t.id);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								content: "Undo drawing",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Undo drawing",
									className: "grid size-7 place-items-center text-muted hover:text-fg",
									onClick: (e) => {
										e.stopPropagation();
										undoDraw();
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3.5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								content: "Redo drawing",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Redo drawing",
									className: "grid size-7 place-items-center text-muted hover:text-fg",
									onClick: (e) => {
										e.stopPropagation();
										redoDraw();
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								content: "Delete selected drawing",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Delete selected drawing",
									className: "grid size-7 place-items-center text-muted hover:text-down",
									onClick: (e) => {
										e.stopPropagation();
										if (selectedId) {
											save(shapes.filter((s) => s.id !== selectedId));
											setSelectedId(null);
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								content: "Clear drawings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Clear drawings",
									className: "grid size-7 place-items-center text-muted hover:text-down",
									onClick: (e) => {
										e.stopPropagation();
										save([]);
										setDraft(null);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
								})
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto text-[10px] text-subtle",
						children: [chartMode === "bench" ? benchPack && benchPack.bars.length >= 2 ? `${benchMeta.name} adjusted candles · first close in view = 100 · not a second line` : benchQ.isPending ? `Loading ${benchMeta.name}…` : `${benchMeta.name} unavailable · price scale unchanged` : chartMode === "usd" ? usdPack && usdPack.bars.length >= 2 ? "USD · historical USD/INR · not today's rate on old bars" : "USD/INR history unavailable" : useLog ? "Log scale" : "Linear", chartMode === "price" ? " · RAW OHLC" : ""]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrap,
				"data-chart-surface": true,
				className: cn("relative min-h-0 flex-1", tool === "pan" || tool === "crosshair" ? "cursor-crosshair" : "cursor-cell"),
				onPointerDown: (e) => {
					onActivate();
					const pt = xyAt(e.clientX, e.clientY);
					e.currentTarget.setPointerCapture(e.pointerId);
					if (tool === "pan" || tool === "crosshair") {
						const hit = hitTest(shapes, pt.x, pt.y, shown, xAt, yPx, PAD.l, size.w - PAD.r, PAD.t, PAD.t + plotH);
						if (hit) {
							setSelectedId(hit.id);
							move.current = {
								id: hit.id,
								mode: hit.mode,
								x: pt.x,
								y: pt.y,
								t: pt.t,
								py: pt.p
							};
							return;
						}
						setSelectedId(null);
						if (tool === "pan") drag.current = {
							x: e.clientX,
							start: view.start
						};
						return;
					}
					if (!draft) {
						clicks.current = 1;
						setDraft({
							id: newDrawId(),
							kind: tool,
							t0: pt.t,
							y0: pt.p,
							t1: pt.t,
							y1: pt.p
						});
						return;
					}
					if (draft.kind === "channel" && clicks.current === 1) {
						clicks.current = 2;
						setDraft({
							...draft,
							t1: pt.t,
							y1: pt.p
						});
						return;
					}
					if (draft.kind === "channel" && clicks.current >= 2) {
						const done = {
							...draft,
							off: channelOffFromThird(draft, pt.t, pt.p)
						};
						save([...shapes, done]);
						setSelectedId(done.id);
						setDraft(null);
						clicks.current = 0;
						setTool("pan");
						return;
					}
					if ((draft.kind === "long" || draft.kind === "short") && clicks.current === 1) {
						clicks.current = 2;
						setDraft({
							...draft,
							y2: pt.p,
							t1: pt.t
						});
						return;
					}
					if ((draft.kind === "long" || draft.kind === "short") && clicks.current >= 2) {
						const done = {
							...draft,
							t1: pt.t,
							y1: pt.p
						};
						save([...shapes, done]);
						setSelectedId(done.id);
						setDraft(null);
						clicks.current = 0;
						setTool("pan");
						return;
					}
					const done = {
						...draft,
						t1: pt.t,
						y1: pt.p
					};
					save([...shapes, done]);
					setSelectedId(done.id);
					setDraft(null);
					clicks.current = 0;
					setTool("pan");
				},
				onPointerMove: (e) => {
					const pt = xyAt(e.clientX, e.clientY);
					if (hoverRaf.current) cancelAnimationFrame(hoverRaf.current);
					const ii = pt.i;
					const yy = pt.y;
					hoverRaf.current = requestAnimationFrame(() => paintHover(ii, yy));
					if (move.current) {
						const cur = shapes.find((s) => s.id === move.current.id);
						if (!cur) return;
						const next = applyDrag(cur, move.current.mode, pt.t - move.current.t, pt.p - move.current.py, pt.t, pt.p);
						save(shapes.map((s) => s.id === next.id ? next : s));
						move.current = {
							...move.current,
							t: pt.t,
							py: pt.p,
							x: pt.x,
							y: pt.y
						};
						return;
					}
					if (draft) {
						if (draft.kind === "channel" && clicks.current >= 2) {
							setDraft({
								...draft,
								off: channelOffFromThird(draft, pt.t, pt.p)
							});
							return;
						}
						if ((draft.kind === "long" || draft.kind === "short") && clicks.current >= 2) {
							setDraft({
								...draft,
								t1: pt.t,
								y1: pt.p
							});
							return;
						}
						if ((draft.kind === "long" || draft.kind === "short") && clicks.current === 1) {
							setDraft({
								...draft,
								y2: pt.p,
								t1: pt.t
							});
							return;
						}
						setDraft({
							...draft,
							t1: pt.t,
							y1: pt.p
						});
						return;
					}
					if (!drag.current) return;
					const dx = e.clientX - drag.current.x;
					const shift = Math.round(-dx / Math.max(4, slot));
					const start = Math.max(0, Math.min(bars.length - view.count, drag.current.start + shift));
					setView((v) => ({
						...v,
						start
					}));
				},
				onPointerUp: () => {
					drag.current = null;
					move.current = null;
				},
				onPointerLeave: () => hideHover(),
				children: [
					ohlc.isPending && !bars.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 animate-pulse bg-surface/40" }) : missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "absolute inset-0 grid place-items-center px-4 text-center text-[13px] text-muted",
						children: [
							"No candles for ",
							bareSymbol(symbol),
							" on ",
							interval,
							". Kosh does not invent bars."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						width: size.w,
						height: size.h,
						className: "block h-full w-full",
						children: [
							yTicks.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: PAD.l,
								x2: size.w - PAD.r,
								y1: yPx(p),
								y2: yPx(p),
								stroke: GRID,
								strokeWidth: "1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: size.w - PAD.r + 6,
								y: yPx(p) + 3,
								textAnchor: "start",
								fill: MUTED,
								fontSize: "10",
								fontFamily: "IBM Plex Mono, ui-monospace, monospace",
								children: p >= 100 ? p.toFixed(0) : p.toFixed(2)
							})] }, i)),
							bb ? [
								poly(bb.upper, "color-mix(in srgb, var(--color-chart) 55%, transparent)"),
								poly(bb.mid, CHART),
								poly(bb.lower, "color-mix(in srgb, var(--color-chart) 55%, transparent)")
							] : null,
							sma20 ? poly(sma20, CHART) : null,
							ema21 ? poly(ema21, WARN) : null,
							vw ? poly(vw, WARN) : null,
							style === "line" ? poly(closes, CHART) : shown.map((b, i) => {
								const color = b.c >= b.o ? UP : DOWN;
								const x = xAt(i);
								const y1 = yPx(Math.max(b.o, b.c));
								const y2 = yPx(Math.min(b.o, b.c));
								const body = Math.max(1, y2 - y1);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: x,
									x2: x,
									y1: yPx(b.h),
									y2: yPx(b.l),
									stroke: color,
									strokeWidth: "1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: x - cw / 2,
									y: y1,
									width: cw,
									height: body,
									fill: color
								})] }, b.t);
							}),
							shown.map((b, i) => {
								const vh = (b.v || 0) / maxVol * 32;
								const x = xAt(i);
								const y = PAD.t + plotH + 6 + (32 - vh);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: x - cw / 2,
									y,
									width: cw,
									height: Math.max(1, vh),
									fill: b.c >= b.o ? UP : DOWN,
									opacity: "0.35"
								}, "v" + b.t);
							}),
							oscOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Osc, {
								xAt,
								top: PAD.t + plotH + VOL_H + 10,
								h: OSC_H,
								rsiArr,
								macdPack
							}) : null,
							patternsOn ? patterns.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatternOverlay, {
								hit: h,
								src: shown,
								xAt,
								yPx,
								right: size.w - PAD.r
							}, h.kind + i)) : null,
							shapes.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeDraw, {
								s,
								src: shown,
								xAt,
								yPx,
								right: size.w - PAD.r,
								selected: s.id === selectedId
							}, s.id)),
							draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeDraw, {
								s: draft,
								src: shown,
								xAt,
								yPx,
								right: size.w - PAD.r
							}) : null,
							last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: xAt(n - 1),
									cy: yPx(last.c),
									r: "3",
									fill: lastUp ? UP : DOWN,
									stroke: "var(--color-bg)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: size.w - PAD.r,
									y: yPx(last.c) - 8,
									width: "52",
									height: "16",
									fill: lastUp ? UP : DOWN
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: size.w - PAD.r + 4,
									y: yPx(last.c) + 3,
									fill: "var(--color-accent-fg)",
									fontSize: "10",
									fontFamily: "IBM Plex Mono, ui-monospace, monospace",
									children: last.c >= 100 ? last.c.toFixed(0) : last.c.toFixed(2)
								})
							] }) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: ohlcRead,
						className: "pointer-events-none absolute left-3 top-2 z-[6] font-mono text-[11px] text-muted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: vLine,
						className: "kosh-cross-v",
						style: {
							display: "none",
							bottom: 0
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: hLine,
						className: "kosh-cross-h",
						style: {
							display: "none",
							left: PAD.l,
							right: PAD.r
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: priceTag,
						className: "kosh-px-tag",
						style: { display: "none" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: dateTag,
						className: "kosh-date-tag",
						style: { display: "none" }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1 border-t border-border px-2 py-1",
				"data-testid": "chart-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Zoom out",
						onClick: () => setView(zoomRightEdge(view, bars.length, false)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Zoom in",
						onClick: () => setView(zoomRightEdge(view, bars.length, true)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Go to latest",
						disabled: onLatest,
						onClick: latest,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveRight, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Reset view",
						onClick: latest,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Fit chart",
						onClick: fit,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" })
					})
				]
			}),
			patternsOn && patterns.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-t border-border px-2 py-1 text-[11px] text-muted",
				children: [patterns.map((h) => `${h.label} · ${patternStatusLabel(h.status)}`).join(" · "), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 text-subtle",
					children: "Observed on this timeframe — not a forecast."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-wrap items-center gap-1 border-t border-border px-2 py-1",
				children: [[
					{
						id: "sma20",
						label: "SMA 20"
					},
					{
						id: "ema21",
						label: "EMA 21"
					},
					{
						id: "bb",
						label: "BB"
					},
					...spec.intra ? [{
						id: "vwap",
						label: "VWAP"
					}] : [],
					{
						id: "rsi",
						label: "RSI"
					},
					{
						id: "macd",
						label: "MACD"
					}
				].map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setInds((s) => ({
						...s,
						[chip.id]: !s[chip.id]
					})),
					className: cn("h-6 rounded-sm px-1.5 text-[10px] font-medium tracking-[0.04em]", inds[chip.id] ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
					children: chip.label
				}, chip.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-[10px] text-subtle",
					children: volMissing ? "Volume unavailable" : "RAW OHLC"
				})]
			})
		]
	});
}
function tToX(t, src, xAt) {
	return projectTimeToX(t, src, xAt);
}
function PatternOverlay({ hit, src, xAt, yPx, right }) {
	const c = hit.tone === "up" ? UP : hit.tone === "down" ? DOWN : ACCENT;
	const last = hit.points[hit.points.length - 1];
	const pts = hit.points.map((p) => `${tToX(p.t, src, xAt).toFixed(1)},${yPx(p.price).toFixed(1)}`).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [hit.points.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
		points: pts,
		fill: "none",
		stroke: c,
		strokeWidth: "1.3",
		strokeDasharray: "4 3"
	}) : last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: PAD.l,
		x2: right,
		y1: yPx(last.price),
		y2: yPx(last.price),
		stroke: c,
		strokeDasharray: "5 4"
	}) : null, last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
		x: tToX(last.t, src, xAt) + 4,
		y: yPx(last.price) - 6,
		fill: c,
		fontSize: "10",
		children: [
			hit.label,
			" · ",
			patternStatusLabel(hit.status)
		]
	}) : null] });
}
function ShapeDraw({ s, src, xAt, yPx, right, selected }) {
	const x0 = tToX(s.t0, src, xAt);
	const y0 = yPx(s.y0);
	const x1 = tToX(s.t1 ?? s.t0, src, xAt);
	const y1 = yPx(s.y1 ?? s.y0);
	const stroke = selected ? INK : ACCENT;
	const w = selected ? 1.8 : 1.2;
	const handles = selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x0 - 3,
		y: y0 - 3,
		width: "6",
		height: "6",
		fill: "var(--color-bg)",
		stroke
	}), s.kind !== "hline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x1 - 3,
		y: y1 - 3,
		width: "6",
		height: "6",
		fill: "var(--color-bg)",
		stroke
	}) : null] }) : null;
	if (s.kind === "hline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			y1: y0,
			x2: right,
			y2: y0,
			stroke,
			strokeWidth: w
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: right + 4,
			y: y0 + 3,
			fill: stroke,
			fontSize: "9",
			children: fmtPx(s.y0)
		}),
		handles
	] });
	if (s.kind === "vline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x0,
		y1: PAD.t,
		x2: x0,
		y2: PAD.t + 4e3,
		stroke,
		strokeWidth: w
	}), handles] });
	if (s.kind === "long" || s.kind === "short") {
		const color = s.kind === "long" ? UP : DOWN;
		const m = positionMetrics(s);
		const yStop = yPx(m.stop);
		const yEntry = y0;
		const yTarget = y1;
		const top = Math.min(yStop, yEntry, yTarget);
		const left = Math.min(x0, x1);
		const width = Math.max(36, Math.abs(x1 - x0));
		const riskTop = Math.min(yEntry, yStop);
		const riskH = Math.abs(yEntry - yStop);
		const rewTop = Math.min(yEntry, yTarget);
		const rewH = Math.abs(yEntry - yTarget);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: left,
				y: rewTop,
				width,
				height: Math.max(2, rewH),
				fill: color,
				fillOpacity: "0.12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: left,
				y: riskTop,
				width,
				height: Math.max(2, riskH),
				fill: DOWN,
				fillOpacity: "0.18"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1: yEntry,
				y2: yEntry,
				stroke: INK,
				strokeWidth: w
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1: yStop,
				y2: yStop,
				stroke: DOWN,
				strokeWidth: w
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: left,
				x2: left + width,
				y1: yTarget,
				y2: yTarget,
				stroke: UP,
				strokeWidth: w
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + width + 4,
				y: top + 10,
				fill: color,
				fontSize: "9",
				children: [s.kind === "long" ? "Long" : "Short", " · measurement"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: left + width + 4,
				y: top + 22,
				fill: MUTED,
				fontSize: "9",
				children: m.valid ? `R:R ${m.rr != null ? m.rr.toFixed(2) : "—"} · risk ${m.riskPct.toFixed(1)}% · reward ${m.rewardPct.toFixed(1)}%` : "Invalid levels — not a measurement"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + 4,
				y: yEntry - 3,
				fill: INK,
				fontSize: "8",
				children: ["Entry ", fmtPx(m.entry)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + 4,
				y: yStop - 3,
				fill: DOWN,
				fontSize: "8",
				children: ["Stop ", fmtPx(m.stop)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: left + 4,
				y: yTarget - 3,
				fill: UP,
				fontSize: "8",
				children: ["Target ", fmtPx(m.target)]
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: left + width / 2 - 3,
					y: yEntry - 3,
					width: "6",
					height: "6",
					fill: "var(--color-bg)",
					stroke
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: left + width / 2 - 3,
					y: yTarget - 3,
					width: "6",
					height: "6",
					fill: "var(--color-bg)",
					stroke
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: left + width / 2 - 3,
					y: yStop - 3,
					width: "6",
					height: "6",
					fill: "var(--color-bg)",
					stroke
				})
			] }) : null
		] });
	}
	if (s.kind === "channel") {
		const off = s.off;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0,
				x2: x1,
				y2: y1,
				stroke,
				strokeWidth: w
			}),
			off != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: yPx(s.y0 + off),
				x2: x1,
				y2: yPx((s.y1 ?? s.y0) + off),
				stroke,
				strokeWidth: w
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: `${x0},${y0} ${x1},${y1} ${x1},${yPx((s.y1 ?? s.y0) + off)} ${x0},${yPx(s.y0 + off)}`,
				fill: ACCENT,
				fillOpacity: "0.06",
				stroke: "none"
			})] }) : null,
			handles,
			selected && off != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: (x0 + x1) / 2 - 3,
				y: (yPx(s.y0 + off) + yPx((s.y1 ?? s.y0) + off)) / 2 - 3,
				width: "6",
				height: "6",
				fill: "var(--color-bg)",
				stroke
			}) : null
		] });
	}
	if (s.kind === "ray") {
		const dx = x1 - x0 || .001;
		const m = (y1 - y0) / dx;
		const xEnd = dx >= 0 ? right : PAD.l;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: x0,
			y1: y0,
			x2: xEnd,
			y2: y0 + m * (xEnd - x0),
			stroke,
			strokeWidth: w
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
	if (s.kind === "fib") {
		const hiP = Math.max(s.y0, s.y1 ?? s.y0);
		const sp = hiP - Math.min(s.y0, s.y1 ?? s.y0) || 1;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [FIBS.map((f) => {
			const px = hiP - sp * f;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: PAD.l,
				x2: right,
				y1: yPx(px),
				y2: yPx(px),
				stroke,
				strokeOpacity: f === 0 || f === 1 ? .95 : .5
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: PAD.l + 4,
				y: yPx(px) - 2,
				fill: stroke,
				fontSize: "9",
				children: (f * 100).toFixed(1)
			})] }, f);
		}), handles] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x0,
		y1: y0,
		x2: x1,
		y2: y1,
		stroke,
		strokeWidth: w
	}), handles] });
}
function Osc({ xAt, top, h, rsiArr, macdPack }) {
	function line(vals, lo, hi, color) {
		const span = hi - lo || 1;
		const pts = [];
		vals.forEach((v, i) => {
			if (v == null) return;
			const y = top + (hi - v) / span * h;
			pts.push(`${xAt(i).toFixed(1)},${y.toFixed(1)}`);
		});
		if (pts.length < 2) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: color,
			strokeWidth: "1.1",
			points: pts.join(" ")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: PAD.l,
			x2: PAD.l + 4e3,
			y1: top,
			y2: top,
			stroke: GRID
		}),
		rsiArr ? line(rsiArr, 0, 100, CHART) : null,
		macdPack ? line(macdPack.line, -4, 4, CHART) : null,
		macdPack ? line(macdPack.signal, -4, 4, WARN) : null
	] });
}
function IconBtn({ label, onClick, children, disabled }) {
	const btn = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		disabled,
		onClick: (e) => {
			e.stopPropagation();
			if (!disabled) onClick();
		},
		className: cn("grid size-7 place-items-center rounded-sm bg-bg/80 text-muted hover:text-fg disabled:opacity-40"),
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
		content: label,
		children: disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-flex",
			children: btn
		}) : btn
	});
}
function isOtherSector(sector) {
	return /^other$/i.test(String(sector || "").trim());
}
/** Cap the Other bucket by |day move| so the page is not a wall of unnamed names. */
function heatGroups(rows, otherCap = 40) {
	const groups = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const key = r.sector || "Other";
		const g = groups.get(key) || [];
		g.push(r);
		groups.set(key, g);
	}
	return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([sector, list]) => {
		const sorted = list.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
		const other = isOtherSector(sector);
		const shown = other ? sorted.slice(0, otherCap) : sorted;
		const avg = list.length ? list.reduce((s, r) => s + r.changePct, 0) / list.length : 0;
		return {
			sector,
			rows: shown,
			total: list.length,
			hidden: Math.max(0, list.length - shown.length),
			collapseDefault: other,
			avg
		};
	});
}
function heat(v) {
	if (v >= 3) return "bg-up text-accent-fg";
	if (v >= 1) return "bg-up/70 text-accent-fg";
	if (v >= .15) return "bg-up/35 text-fg";
	if (v > -.15) return "bg-surface-2 text-muted";
	if (v > -1) return "bg-down/35 text-fg";
	if (v > -3) return "bg-down/70 text-accent-fg";
	return "bg-down text-accent-fg";
}
function MarketHeat({ rows }) {
	const groups = heatGroups(rows, 40);
	const [open, setOpen] = (0, import_react.useState)({});
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Heat fills once prices are in."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4",
		children: groups.map((g) => {
			const expanded = g.collapseDefault ? Boolean(open[g.sector]) : true;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1.5 flex items-baseline justify-between gap-2",
				children: [g.collapseDefault ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-left text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase hover:text-fg",
					onClick: () => setOpen((s) => ({
						...s,
						[g.sector]: !s[g.sector]
					})),
					"aria-expanded": expanded,
					children: [g.sector, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 font-mono font-normal normal-case tracking-normal text-muted",
						children: [
							g.total,
							" names · ",
							expanded ? "hide" : "show movers"
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: g.sector
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[11px] text-muted tabular",
					children: fmtPct(g.avg)
				})]
			}), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
				children: g.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/s/$symbol",
					params: { symbol: r.symbol },
					className: cn("rounded-sm px-2 py-2 transition-transform duration-150 hover:scale-[1.01]", heat(r.changePct)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-[12px] font-medium",
						children: r.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[11px] tabular",
						children: fmtPct(r.changePct)
					})]
				}, r.symbol))
			}), g.hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1.5 text-[11px] text-subtle",
				children: [
					"Showing the ",
					g.rows.length,
					" largest moves · ",
					g.hidden,
					" more not drawn."
				]
			}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] text-muted",
				children: "Collapsed. Names without a mapped sector — tap to see the biggest moves."
			})] }, g.sector);
		})
	});
}
function tone$1(v) {
	if (v == null || !Number.isFinite(v)) return "bg-surface-2 text-muted";
	if (v >= 1.5) return "bg-up/70 text-fg";
	if (v >= .15) return "bg-up/25 text-fg";
	if (v > -.15) return "bg-surface-2 text-fg";
	if (v > -1.5) return "bg-down/25 text-fg";
	return "bg-down/70 text-fg";
}
async function loadBasket(symbol) {
	const res = await fetch("/api/index-constituents?symbol=" + encodeURIComponent(symbol));
	const data = await res.json();
	if (!res.ok && !data.unavailable) throw new Error("Holdings feed failed");
	return data;
}
async function loadQuotes(symbols) {
	const out = [];
	for (let i = 0; i < symbols.length; i += 60) {
		const part = await apiQuotes(symbols.slice(i, i + 60));
		out.push(...part);
	}
	return out;
}
function TileButton({ row, box, pct, dim, onOpen }) {
	const wide = box.w >= 8 && box.h >= 11;
	const label = pct == null ? "—" : fmtPct(pct);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: !row.symbol,
		title: `${row.name} · ${row.weight.toFixed(2)}%${pct == null ? "" : " · " + label}`,
		className: cn("absolute overflow-hidden rounded-sm px-1.5 py-1 text-left transition-opacity", tone$1(pct), dim && "opacity-25", row.symbol && "hover:brightness-110"),
		style: {
			left: `calc(${box.x}% + 1px)`,
			top: `calc(${box.y}% + 1px)`,
			width: `calc(${box.w}% - 2px)`,
			height: `calc(${box.h}% - 2px)`
		},
		onClick: () => row.symbol && onOpen(row.symbol, row.name),
		children: wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "truncate text-[12px] font-medium leading-4",
				children: row.symbol || row.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "truncate font-mono text-[11px] tabular",
				children: [row.weight.toFixed(1), "%"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[11px] tabular",
				children: label
			})
		] }) : box.w >= 4 && box.h >= 7 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "truncate text-[10px] font-medium leading-3",
			children: row.symbol || row.name
		}) : null
	});
}
function IndexComposition({ row, onChart, onClose }) {
	const [q, setQ] = (0, import_react.useState)("");
	const basket = useQuery({
		queryKey: ["index-basket", row.symbol],
		queryFn: () => loadBasket(row.symbol),
		staleTime: 18e5
	});
	const symbols = (0, import_react.useMemo)(() => (basket.data?.rows || []).map((item) => item.symbol).filter((symbol) => Boolean(symbol)), [basket.data]);
	const quotes = useQuery({
		queryKey: [
			"index-basket-quotes",
			row.symbol,
			symbols.join(",")
		],
		queryFn: () => loadQuotes(symbols),
		enabled: symbols.length > 0,
		staleTime: 2e4,
		refetchInterval: symbols.length > 80 ? 12e4 : 3e4
	});
	const bySym = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const quote of quotes.data || []) map.set(bareSymbol(quote.symbol || quote.input), quote);
		return map;
	}, [quotes.data]);
	const rows = basket.data?.rows || [];
	const tiles = (0, import_react.useMemo)(() => treemap(rows.map((item) => item.weight), 100, 100), [rows]);
	const query = q.trim().toLowerCase();
	const open = (symbol, name) => {
		onChart(symbol, name);
		onClose();
	};
	const shown = query ? rows.filter((item) => item.name.toLowerCase().includes(query) || (item.symbol || "").toLowerCase().includes(query)) : rows;
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	const data = basket.data;
	const linked = rows.filter((item) => item.symbol).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-fg/30 sm:items-center sm:p-3",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${row.name} constituents`,
		onClick: (event) => {
			if (event.target === event.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-[100dvh] w-full flex-col bg-bg sm:h-[min(92dvh,860px)] sm:max-w-6xl sm:rounded-lg sm:shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[18px] font-semibold tracking-tight",
							children: row.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] text-muted",
							children: "Tile area is the published share in the index. Colour is the live session move."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-8 shrink-0 rounded-sm bg-surface px-2 text-[12px]",
						onClick: onClose,
						children: "Close"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (event) => setQ(event.target.value),
						placeholder: "Find a constituent",
						"aria-label": "Find a constituent",
						className: "h-8 w-48 max-w-full rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)] outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-8 rounded-sm bg-fg px-3 text-[12px] text-bg",
						onClick: () => open(row.symbol, row.name),
						children: "View index chart"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-4 pb-4",
					children: [
						basket.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] text-muted",
							children: "Loading published holdings…"
						}) : null,
						basket.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] text-down",
							children: "The holdings feed did not answer."
						}) : null,
						data?.unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] text-muted",
							children: data.unavailable
						}) : null,
						data && !data.unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 text-[12px] leading-5 text-muted",
								children: [
									data.note ? `${data.note} ` : null,
									data.source ? `Source ${data.source}. ` : null,
									data.asOf ? `Holdings dated ${data.asOf}. ` : "Latest published holdings. ",
									data.benchmark ? `Benchmark ${data.benchmark}. ` : null,
									rows.length,
									" names, weights add to ",
									data.weightSum.toFixed(2),
									"%.",
									linked < rows.length ? ` ${rows.length - linked} names have no NSE code, so they stay on the map but do not open a chart.` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-[280px] sm:h-[420px]",
								children: rows.map((item, index) => {
									const quote = item.symbol ? bySym.get(item.symbol) : void 0;
									const pct = quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
									const dim = Boolean(query) && !item.name.toLowerCase().includes(query) && !(item.symbol || "").toLowerCase().includes(query);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileButton, {
										row: item,
										box: tiles[index],
										pct,
										dim,
										onOpen: open
									}, `${item.symbol || item.name}-${index}`);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 max-h-52 overflow-auto rounded-sm shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-[12px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "sticky top-0 bg-surface text-[10px] tracking-[0.08em] text-subtle uppercase",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-1.5 font-medium",
												children: "Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-1.5 font-medium",
												children: "Share"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-2 py-1.5 font-medium",
												children: "Session"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((item) => {
										const quote = item.symbol ? bySym.get(item.symbol) : void 0;
										const pct = quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t border-border/70",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5",
													children: item.symbol ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														className: "text-left",
														onClick: () => open(item.symbol || "", item.name),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium",
															children: item.symbol
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "ml-2 text-muted",
															children: item.name
														})]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2 py-1.5 font-mono tabular",
													children: [item.weight.toFixed(2), "%"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: cn("px-2 py-1.5 font-mono tabular", pct == null ? "text-muted" : pct >= 0 ? "text-up" : "text-down"),
													children: pct == null ? "—" : fmtPct(pct)
												})
											]
										}, `${item.symbol || item.name}-row`);
									}) })]
								}), !shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-2 py-3 text-[12px] text-muted",
									children: "No constituent matches that search."
								}) : null]
							})
						] }) : null
					]
				})
			]
		})
	});
}
function tone(v) {
	if (v == null || !Number.isFinite(v)) return "bg-surface-2 text-muted";
	if (v >= 1.5) return "bg-up/70 text-fg";
	if (v >= .15) return "bg-up/25 text-fg";
	if (v > -.15) return "bg-surface-2 text-fg";
	if (v > -1.5) return "bg-down/25 text-fg";
	return "bg-down/70 text-fg";
}
function IndexTile({ row, pct, failed, onChart, onComposition }) {
	const label = pct == null ? failed ? "Quotes failed" : "No quote" : fmtPct(pct);
	const paint = row.family === "Volatility" ? "bg-surface-2 text-fg" : tone(pct);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-full rounded-sm px-2 py-2", paint),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex h-full w-full min-w-0 flex-col pr-5 text-left",
			"aria-label": `View chart, ${row.name}`,
			onClick: () => onChart(row.symbol, row.name),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "line-clamp-2 text-[11px] font-medium leading-4",
				title: row.name,
				children: row.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto pt-1 font-mono text-[15px] leading-none tabular",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute top-1 right-1 rounded-sm bg-bg/55 px-1 text-[9px] font-medium tracking-wide uppercase opacity-80 hover:opacity-100 focus-visible:opacity-100",
			"aria-label": `${row.name} constituents`,
			title: "Constituents by index share",
			onClick: () => onComposition(row),
			children: "Shares"
		})]
	});
}
function IndexHeat({ quotes, pending, failed, stamp, live, onChart }) {
	const [mode, setMode] = (0, import_react.useState)("key");
	const [q, setQ] = (0, import_react.useState)("");
	const [family, setFamily] = (0, import_react.useState)("All");
	const [composition, setComposition] = (0, import_react.useState)(null);
	const bySym = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of quotes) map.set(bareSymbol(row.symbol || row.input), row);
		return map;
	}, [quotes]);
	const list = (0, import_react.useMemo)(() => {
		const base = mode === "key" ? keySectorals() : NIFTY_CATALOGUE;
		const query = q.trim().toLowerCase();
		return base.filter((row) => {
			if (mode === "all" && family !== "All" && row.family !== family) return false;
			if (!query) return true;
			return row.name.toLowerCase().includes(query) || row.symbol.toLowerCase().includes(query);
		});
	}, [
		mode,
		q,
		family
	]);
	const grouped = mode === "all" && !q.trim() && family === "All";
	const groups = (0, import_react.useMemo)(() => {
		if (!grouped) return [{
			family: null,
			rows: list
		}];
		return INDEX_FAMILIES.filter((name) => name !== "All").map((name) => ({
			family: name,
			rows: list.filter((row) => row.family === name)
		})).filter((group) => group.rows.length);
	}, [grouped, list]);
	function pctOf(row) {
		const quote = bySym.get(bareSymbol(row.symbol));
		return quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "nifty-index-heat",
		"aria-label": "Nifty index heatmap",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-wrap items-baseline gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Nifty index heatmap"
						}),
						stamp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-subtle",
							children: [
								live ? "Session" : "Last session",
								" · ",
								stamp
							]
						}) : null,
						failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-down",
							children: "Quotes failed"
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-sm bg-surface p-0.5 shadow-[var(--shadow-border)]",
						role: "tablist",
						"aria-label": "Index set",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": mode === "key",
							className: cn("h-7 rounded-sm px-2 text-[11px]", mode === "key" ? "bg-bg text-fg" : "text-muted"),
							onClick: () => setMode("key"),
							children: "Key sectoral"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": mode === "all",
							title: "Every Nifty index this quote feed prices",
							className: cn("h-7 rounded-sm px-2 text-[11px]", mode === "all" ? "bg-bg text-fg" : "text-muted"),
							onClick: () => setMode("all"),
							children: "All indices"
						})]
					}), mode === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search index",
						"aria-label": "Search indices",
						className: "h-7 w-32 max-w-full rounded-sm bg-surface px-2 text-[11px] shadow-[var(--shadow-border)] outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Index family",
						value: family,
						onChange: (e) => setFamily(e.target.value),
						className: "h-7 max-w-full rounded-sm bg-surface px-2 text-[11px] shadow-[var(--shadow-border)]",
						children: INDEX_FAMILIES.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: name }, name))
					})] }) : null]
				})]
			}),
			pending && !quotes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-muted",
				children: "Loading index quotes…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [group.family ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: group.family
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
					children: group.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexTile, {
						row,
						pct: pctOf(row),
						failed,
						onChart,
						onComposition: setComposition
					}, row.symbol))
				})] }, group.family || "flat")), !list.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-muted",
					children: "No index matches that search."
				}) : null]
			}),
			composition ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexComposition, {
				row: composition,
				onChart,
				onClose: () => setComposition(null)
			}) : null
		]
	});
}
function indexPulse(rows) {
	const valid = [];
	for (const row of rows) {
		if (row.pct == null || !Number.isFinite(row.pct)) continue;
		valid.push({
			name: row.name,
			pct: row.pct
		});
	}
	if (!valid.length) return null;
	const sorted = valid.slice().sort((a, b) => b.pct - a.pct);
	const strongest = sorted[0];
	const weakest = sorted[sorted.length - 1];
	const advancing = valid.filter((row) => row.pct > 0).length;
	const declining = valid.filter((row) => row.pct < 0).length;
	const unchanged = valid.length - advancing - declining;
	const average = valid.reduce((sum, row) => sum + row.pct, 0) / valid.length;
	return {
		strongest,
		weakest,
		advancing,
		declining,
		unchanged,
		total: valid.length,
		average,
		gap: strongest.pct - weakest.pct
	};
}
function bareLive(symbol) {
	return String(symbol || "").replace(/\.(NS|BO)$/i, "").trim().toUpperCase();
}
/** Portfolio + watch first, then movers. Cap so the quote poll stays snappy. */
function pickLiveSymbols(port, watch, up, down, cap = 36) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (s) => {
		const k = bareLive(s);
		if (!k || seen.has(k) || out.length >= cap) return;
		seen.add(k);
		out.push(k);
	};
	for (const s of port) push(s);
	for (const s of watch) push(s);
	for (const s of up) push(s);
	for (const s of down) push(s);
	return out;
}
function overlayQuotes(rows, quotes) {
	if (!quotes?.length) return rows;
	const map = /* @__PURE__ */ new Map();
	for (const q of quotes) {
		if (!(q.price > 0) || q.error) continue;
		map.set(bareLive(q.symbol), q);
		map.set(bareLive(q.input), q);
	}
	return rows.map((r) => {
		const q = map.get(bareLive(r.symbol));
		if (!q) return r;
		return {
			...r,
			price: q.price,
			changePct: q.changePct
		};
	});
}
function boardSymbol(s) {
	return String(s || "").toUpperCase().replace(/\.(NS|BO)$/i, "").trim();
}
/** Selected portfolios' holdings, unioned with the selected watchlist. One row per symbol. */
function buildStockBoard(input) {
	const books = input.bookId === "all" ? input.portfolios : input.portfolios.filter((p) => p.id === input.bookId);
	const held = /* @__PURE__ */ new Map();
	for (const p of books) for (const h of p.holdings || []) {
		const symbol = boardSymbol(h.symbol);
		if (!symbol) continue;
		const qty = Number(h.qty) > 0 ? Number(h.qty) : 0;
		const cur = held.get(symbol);
		if (!cur) {
			held.set(symbol, {
				symbol,
				name: h.name || symbol,
				qty,
				owned: qty > 0,
				watched: false,
				portfolios: qty > 0 ? [{
					id: p.id,
					name: p.name,
					qty
				}] : [],
				last: null,
				chg: null,
				chgPct: null,
				value: null,
				source: "none"
			});
			continue;
		}
		if (qty > 0) {
			cur.qty += qty;
			cur.owned = true;
			cur.portfolios.push({
				id: p.id,
				name: p.name,
				qty
			});
		}
		if (h.name) cur.name = h.name;
	}
	const watch = new Set((input.watchSymbols || []).map(boardSymbol).filter(Boolean));
	for (const symbol of watch) {
		const cur = held.get(symbol);
		if (cur) {
			cur.watched = true;
			continue;
		}
		held.set(symbol, {
			symbol,
			name: symbol,
			qty: 0,
			owned: false,
			watched: true,
			portfolios: [],
			last: null,
			chg: null,
			chgPct: null,
			value: null,
			source: "none"
		});
	}
	const quotes = /* @__PURE__ */ new Map();
	for (const q of input.quotes || []) {
		const k = boardSymbol(q.symbol);
		if (k) quotes.set(k, q);
	}
	const screens = /* @__PURE__ */ new Map();
	for (const s of input.screens || []) {
		const k = boardSymbol(s.symbol);
		if (k && !screens.has(k)) screens.set(k, s);
	}
	const rows = [...held.values()];
	for (const row of rows) {
		const q = quotes.get(row.symbol);
		const screen = screens.get(row.symbol);
		if (q?.name && row.name === row.symbol) row.name = q.name;
		else if (screen?.name && row.name === row.symbol) row.name = screen.name;
		const qPx = q && Number(q.price) > 0 ? Number(q.price) : null;
		const sPx = screen && Number(screen.price) > 0 ? Number(screen.price) : null;
		if (qPx != null) {
			row.last = qPx;
			row.source = "quote";
			const prev = Number(q?.previousClose);
			const pct = q && Number.isFinite(Number(q.changePct)) ? Number(q.changePct) : null;
			const fromPct = pct != null ? qPx - qPx / (1 + pct / 100) : null;
			const fromPrev = prev > 0 ? qPx - prev : null;
			row.chg = fromPct != null && fromPrev != null && Math.abs(fromPrev - fromPct) <= Math.max(.05, Math.abs(fromPct) * .02) ? fromPrev : fromPct ?? fromPrev;
			row.chgPct = pct;
		} else if (sPx != null) {
			row.last = sPx;
			row.source = "screen";
			row.chg = null;
			row.chgPct = screen && Number.isFinite(Number(screen.changePct)) ? Number(screen.changePct) : null;
		}
		row.value = row.owned && row.qty > 0 && row.last != null ? row.qty * row.last : null;
	}
	rows.sort((a, b) => a.symbol.localeCompare(b.symbol));
	return rows;
}
function filterBoard(rows, opts) {
	const q = (opts.q || "").trim().toLowerCase();
	return rows.filter((r) => {
		if (opts.tab === "owned" && !r.owned) return false;
		if (opts.tab === "watch" && !r.watched) return false;
		if (q && !`${r.symbol} ${r.name}`.toLowerCase().includes(q)) return false;
		if (opts.dir === "up" && !(r.chgPct != null && r.chgPct >= 0)) return false;
		if (opts.dir === "down" && !(r.chgPct != null && r.chgPct < 0)) return false;
		if (opts.membership === "both" && !(r.owned && r.watched)) return false;
		if (opts.membership === "multi" && r.portfolios.length < 2) return false;
		if (opts.membership === "watch-only" && !(r.watched && !r.owned)) return false;
		return true;
	});
}
function boardCounts(rows) {
	return {
		all: rows.length,
		owned: rows.filter((r) => r.owned).length,
		watch: rows.filter((r) => r.watched).length
	};
}
function pageOf(rows, page, size) {
	const total = rows.length;
	const pages = Math.max(1, Math.ceil(total / size) || 1);
	const safe = Math.min(Math.max(1, page), pages);
	const start = (safe - 1) * size;
	return {
		rows: rows.slice(start, start + size),
		page: safe,
		pages,
		total,
		from: total ? start + 1 : 0,
		to: Math.min(total, start + size)
	};
}
var TermChart = (0, import_react.lazy)(() => import("./term-chart-CZLpZgJp.mjs").then((m) => ({ default: m.TermChart })));
var PAGE = 20;
function fmtChg(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	if (n === 0) return "0.00";
	return (n > 0 ? "+" : "−") + fmtPx(Math.abs(n));
}
function absFromPct(price, pct) {
	if (!(price > 0) || !Number.isFinite(pct) || pct <= -100) return null;
	return price - price / (1 + pct / 100);
}
function istStamp(ms) {
	if (!ms || ms <= 0) return null;
	const d = new Date(ms + 198e5);
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
	][d.getUTCMonth()];
	const hh = String(d.getUTCHours()).padStart(2, "0");
	const mm = String(d.getUTCMinutes()).padStart(2, "0");
	return `${d.getUTCDate()} ${mon} ${hh}:${mm} IST`;
}
function ClassicOverview() {
	const liveSession = isIstSession();
	const ports = useKosh((s) => s.portfolios);
	const watchlists = useKosh((s) => s.watchlists);
	const activeWatchId = useKosh((s) => s.activeWatchId);
	const [bookId, setBookId] = (0, import_react.useState)("all");
	const [listId, setListId] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	const [dir, setDir] = (0, import_react.useState)("any");
	const [membership, setMembership] = (0, import_react.useState)("any");
	const [filters, setFilters] = (0, import_react.useState)(false);
	const [sort, setSort] = (0, import_react.useState)({
		key: "chgPct",
		dir: "desc"
	});
	const [page, setPage] = (0, import_react.useState)(1);
	const [chartSym, setChartSym] = (0, import_react.useState)(null);
	const [interval, setInterval] = (0, import_react.useState)("D");
	const [style, setStyle] = (0, import_react.useState)("candle");
	const [wide, setWide] = (0, import_react.useState)(true);
	const [stocksView, setStocksView] = (0, import_react.useState)("table");
	const [chartLabel, setChartLabel] = (0, import_react.useState)(null);
	const [locate, setLocate] = (0, import_react.useState)(null);
	const [locateNote, setLocateNote] = (0, import_react.useState)("");
	const [moverMode, setMoverMode] = (0, import_react.useState)("gainers");
	const rowRefs = (0, import_react.useRef)({});
	const closeRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const panelRef = (0, import_react.useRef)(null);
	const { fs, fallback, toggle: toggleFs } = useChartFullscreen(panelRef);
	const fsRef = (0, import_react.useRef)(false);
	fsRef.current = fs;
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: liveSession ? 2500 : 3e4,
		refetchInterval: () => isIstSession() ? 5e3 : 6e4
	});
	const indexQuotes = useQuery({
		queryKey: ["nifty-catalogue"],
		queryFn: () => apiQuotes(NIFTY_CATALOGUE.map((s) => s.symbol)),
		staleTime: liveSession ? 2500 : 3e4,
		refetchInterval: () => isIstSession() ? 5e3 : 6e4
	});
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const screenRows = screen.data?.rows || [];
	const activeList = watchlists.find((l) => l.id === (listId || activeWatchId)) || watchlists[0];
	const membershipKey = `${bookId}|${activeList?.id || ""}|${ports.map((p) => p.id + ":" + p.holdings.map((h) => `${h.symbol}:${h.qty}`).join(",")).join(";")}|${(activeList?.symbols || []).join(",")}`;
	const universe = (0, import_react.useMemo)(() => buildStockBoard({
		portfolios: ports.map((p) => ({
			id: p.id,
			name: p.name,
			holdings: p.holdings
		})),
		bookId,
		watchSymbols: activeList?.symbols || []
	}).map((r) => r.symbol), [membershipKey]);
	const [focus, setFocus] = (0, import_react.useState)([]);
	const liveSyms = (0, import_react.useMemo)(() => pickLiveSymbols(focus.length ? focus : universe.slice(0, PAGE), universe, [], [], 40), [focus.join(","), universe.join(",")]);
	const quotes = useQuery({
		queryKey: ["live-tape", liveSyms.join(",")],
		queryFn: () => apiQuotes(liveSyms),
		enabled: liveSyms.length > 0,
		staleTime: liveSession ? 1500 : 3e4,
		refetchInterval: () => isIstSession() ? 3e3 : 6e4,
		placeholderData: (prev) => prev
	});
	const priced = (0, import_react.useMemo)(() => buildStockBoard({
		portfolios: ports.map((p) => ({
			id: p.id,
			name: p.name,
			holdings: p.holdings
		})),
		bookId,
		watchSymbols: activeList?.symbols || [],
		screens: screenRows,
		quotes: quotes.data || []
	}), [
		membershipKey,
		screenRows,
		quotes.data
	]);
	const filtered = (0, import_react.useMemo)(() => filterBoard(priced, {
		tab,
		q,
		dir,
		membership
	}), [
		priced,
		tab,
		q,
		dir,
		membership
	]);
	const sorted = (0, import_react.useMemo)(() => sortEntities(filtered, sort.key, sort.dir), [filtered, sort]);
	const view = pageOf(sorted, page, PAGE);
	const shown = view.rows;
	const pageSymbols = shown.map((r) => r.symbol);
	const pricedFiltered = sorted;
	(0, import_react.useEffect)(() => {
		const next = pageSymbols.join(",");
		setFocus((cur) => cur.join(",") === next ? cur : pageSymbols);
	}, [pageSymbols.join(",")]);
	const news = useQuery({
		queryKey: [
			"news",
			"NIFTY",
			"market"
		],
		queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
		staleTime: 6e5
	});
	const counts = boardCounts(priced);
	const fresh = tapeFreshness(tape.data, isIstSession());
	const tapeBest = freshestPrint(tape.data);
	const tapeStamp = istStamp(tapeBest?.marketTime || tapeBest?.retrievedAt || null);
	const SUMMARY = [
		{
			id: "nifty",
			label: "Nifty 50"
		},
		{
			id: "sensex",
			label: "Sensex"
		},
		{
			id: "bank",
			label: "Bank Nifty"
		}
	];
	const tapeById = new Map((tape.data || []).map((row) => [row.id, row]));
	const breadthRows = screenRows.filter((row) => Number.isFinite(row.changePct));
	const advancing = breadthRows.filter((row) => row.changePct > 0).length;
	const unchanged = breadthRows.filter((row) => row.changePct === 0).length;
	const liveRows = (0, import_react.useMemo)(() => overlayQuotes(screenRows, quotes.data), [screenRows, quotes.data]);
	const screenSectors = (0, import_react.useMemo)(() => sectorPulse(screenRows), [screenRows]);
	const quoteByBare = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of indexQuotes.data || []) map.set(bareSymbol(row.symbol || row.input), row);
		return map;
	}, [indexQuotes.data]);
	const pulse = indexPulse(keySectorals().map((row) => {
		const quote = quoteByBare.get(bareSymbol(row.symbol));
		const pct = quote && quote.price > 0 && Number.isFinite(quote.changePct) ? quote.changePct : null;
		return {
			name: row.name.replace(/^Nifty /, ""),
			pct
		};
	}));
	const movers = [...priced].filter((r) => r.chgPct != null && r.last != null).sort((a, b) => moverMode === "gainers" ? (b.chgPct || 0) - (a.chgPct || 0) : (a.chgPct || 0) - (b.chgPct || 0)).filter((r) => moverMode === "gainers" ? (r.chgPct || 0) > 0 : (r.chgPct || 0) < 0).slice(0, 5);
	const chartRow = chartSym ? priced.find((r) => r.symbol === chartSym) || null : null;
	const chartQuote = (quotes.data || []).find((q) => bareSymbol(q.symbol) === chartSym || bareSymbol(q.input) === chartSym) || (indexQuotes.data || []).find((q) => bareSymbol(q.symbol) === bareSymbol(chartSym || "") || bareSymbol(q.input) === bareSymbol(chartSym || "")) || null;
	const filterCount = (dir !== "any" ? 1 : 0) + (membership !== "any" ? 1 : 0);
	const indexStamp = istStamp(freshestPrint(indexQuotes.data)?.marketTime || freshestPrint(indexQuotes.data)?.retrievedAt || null);
	(0, import_react.useEffect)(() => {
		setPage(1);
	}, [
		tab,
		q,
		dir,
		membership,
		bookId,
		listId,
		sort.key,
		sort.dir
	]);
	(0, import_react.useEffect)(() => {
		if (!locate) return;
		const idx = pricedFiltered.findIndex((r) => r.symbol === locate);
		if (idx < 0) {
			setLocateNote(`${locate} is not in this book or watchlist.`);
			setLocate(null);
			return;
		}
		const next = Math.floor(idx / PAGE) + 1;
		if (next !== view.page) {
			setPage(next);
			return;
		}
		rowRefs.current[locate]?.scrollIntoView({
			block: "center",
			inline: "nearest"
		});
		setLocate(null);
	}, [
		locate,
		pricedFiltered,
		view.page
	]);
	(0, import_react.useEffect)(() => {
		if (!chartSym) return;
		if (window.matchMedia("(min-width: 1024px)").matches) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [chartSym]);
	(0, import_react.useEffect)(() => {
		if (!chartSym) return;
		closeRef.current?.focus();
		function onKey(e) {
			if (e.key !== "Escape") return;
			if (fsRef.current) return;
			if (e.target?.closest("[role='dialog']")) return;
			setChartSym(null);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [chartSym]);
	function cycle(key) {
		setSort((cur) => {
			if (cur.key !== key) return {
				key,
				dir: "desc"
			};
			if (cur.dir === "desc") return {
				key,
				dir: "asc"
			};
			return {
				key: "name",
				dir: "asc"
			};
		});
	}
	function openChart(symbol, name) {
		const top = scrollRef.current?.scrollTop || 0;
		setChartLabel(name || null);
		setChartSym(symbol);
		requestAnimationFrame(() => {
			if (scrollRef.current) scrollRef.current.scrollTop = top;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-w-0 max-w-[1680px] overflow-x-clip px-3 py-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[22px] font-semibold tracking-tight",
					children: "Market Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-muted",
					children: "Track your portfolio and watchlist stocks with market context."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-right text-[11px] text-subtle",
					title: fresh.title,
					children: [
						fresh.state === "last" ? "Last session" : fresh.label,
						tapeStamp ? ` · ${tapeStamp}` : "",
						quotes.isFetching ? " · Refreshing quotes" : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4",
				children: [SUMMARY.map((item) => {
					const t = tapeById.get(item.id);
					const abs = t && t.price > 0 && Number.isFinite(t.changePct) ? absFromPct(t.price, t.changePct) : null;
					const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
							children: item.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-auto pt-1 font-mono text-[16px] leading-none tabular",
							children: t?.price ? fmtPx(t.price) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-1 font-mono text-[12px] leading-tight tabular", (t?.changePct || 0) >= 0 ? "text-up" : "text-down"),
							children: abs == null ? "—" : `${fmtChg(abs)} · ${fmtPct(t?.changePct || 0)}`
						})
					] });
					const cls = "flex h-full min-h-[4.5rem] flex-col rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]";
					return t && instrumentKind(t.symbol) === "index" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/markets",
						search: terminalSearch(t.symbol, item.label),
						className: cls,
						"aria-label": `Open ${item.label} in Terminal`,
						children: body
					}, item.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cls,
						children: body
					}, item.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full min-h-[4.5rem] flex-col rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
						children: "Market breadth"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto pt-1",
						children: breadthRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadthBar, {
							green: advancing,
							n: breadthRows.length,
							unchanged
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-muted",
							children: screen.isError ? "Breadth unavailable." : "Waiting on the screen."
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndexHeat, {
					quotes: indexQuotes.data || [],
					pending: indexQuotes.isPending,
					failed: indexQuotes.isError,
					stamp: indexStamp,
					live: liveSession,
					onChart: openChart
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("mt-4 min-w-0", chartSym && wide && "lg:grid lg:grid-cols-[minmax(300px,48%)_minmax(0,52%)] lg:items-start", chartSym && !wide && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,40%)] lg:items-start"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					className: "min-w-0 rounded-lg bg-surface shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border px-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[15px] font-semibold",
									children: "Your stocks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-subtle",
									children: "One row when a name is both held and watched. The chart stays closed until you ask."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "search",
											value: q,
											onChange: (e) => setQ(e.target.value),
											placeholder: "Search symbol or name",
											"aria-label": "Search stocks",
											className: "h-8 w-44 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)] outline-none"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": "Portfolio",
											value: bookId,
											onChange: (e) => setBookId(e.target.value),
											className: "h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All portfolios"
											}), ports.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: p.id,
												children: p.name
											}, p.id))]
										}),
										watchlists.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											"aria-label": "Watchlist",
											value: activeList?.id || "",
											onChange: (e) => {
												setListId(e.target.value);
											},
											className: "h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]",
											children: watchlists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: l.id,
												children: l.name
											}, l.id))
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]",
											onClick: () => setFilters((v) => !v),
											children: ["Filters", filterCount ? ` · ${filterCount}` : ""]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
										role: "tablist",
										"aria-label": "Stock set",
										children: [
											[
												"all",
												"All stocks",
												counts.all
											],
											[
												"owned",
												"Owned",
												counts.owned
											],
											[
												"watch",
												"Watchlist",
												counts.watch
											]
										].map(([id, label, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											role: "tab",
											"aria-selected": tab === id,
											className: cn("h-8 rounded-sm px-2.5 text-[12px]", tab === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted"),
											onClick: () => setTab(id),
											children: [
												label,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-subtle",
													children: n
												})
											]
										}, id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-subtle",
										children: [stocksView === "heat" ? `${sorted.length} names in this filter` : view.total ? `${view.from}–${view.to} of ${view.total}` : "0 names", quotes.isError ? " · Quotes unavailable. Screen prices are marked." : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "ml-auto flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
										role: "tablist",
										"aria-label": "Stocks view",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											"aria-selected": stocksView === "table",
											className: cn("h-7 rounded-sm px-2 text-[11px]", stocksView === "table" ? "bg-surface text-fg" : "text-muted"),
											onClick: () => setStocksView("table"),
											children: "Table"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											"aria-selected": stocksView === "heat",
											className: cn("h-7 rounded-sm px-2 text-[11px]", stocksView === "heat" ? "bg-surface text-fg" : "text-muted"),
											onClick: () => setStocksView("heat"),
											children: "Heatmap"
										})]
									})
								]
							}),
							filters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Daily change",
									value: dir,
									onChange: (e) => setDir(e.target.value),
									className: "h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "any",
											children: "Any daily change"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "up",
											children: "Up"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "down",
											children: "Down"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Membership",
									value: membership,
									onChange: (e) => setMembership(e.target.value),
									className: "h-8 rounded-sm bg-bg px-2 text-[12px] shadow-[var(--shadow-border)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "any",
											children: "Any membership"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "both",
											children: "Owned and watched"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "multi",
											children: "Held in 2+ portfolios"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "watch-only",
											children: "Watchlist only"
										})
									]
								})]
							}) : null
						]
					}), stocksView === "heat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-3 lg:grid-cols-4",
						children: sorted.length ? sorted.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => openChart(row.symbol, row.name),
							className: cn("min-h-[72px] rounded-sm px-2 py-1.5 text-left", row.chgPct == null ? "bg-surface-2 text-muted" : row.chgPct >= 1.5 ? "bg-up/70 text-fg" : row.chgPct > 0 ? "bg-up/25 text-fg" : row.chgPct <= -1.5 ? "bg-down/70 text-fg" : row.chgPct < 0 ? "bg-down/25 text-fg" : "bg-surface-2 text-fg"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-[12px] font-medium",
									children: row.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-subtle",
									children: row.symbol
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-mono text-[14px] tabular",
									children: row.chgPct == null ? "—" : fmtPct(row.chgPct)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[10px] tabular",
									children: row.last != null ? fmtPx(row.last) : "No quote"
								})
							]
						}, row.symbol)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "col-span-full py-6 text-center text-[13px] text-muted",
							children: "Nothing matches this search."
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: cn("w-full text-left text-[12px]", chartSym ? "min-w-0" : "min-w-[520px]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-[10px] tracking-[0.06em] text-subtle uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
										label: "Stock",
										on: sort.key === "name",
										dir: sort.dir,
										onClick: () => cycle("name")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
										label: "Price",
										align: "right",
										on: sort.key === "last",
										dir: sort.dir,
										onClick: () => cycle("last")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
										label: "Change",
										align: "right",
										on: sort.key === "chg",
										dir: sort.dir,
										onClick: () => cycle("chg")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
										label: "% Change",
										align: "right",
										on: sort.key === "chgPct",
										dir: sort.dir,
										onClick: () => cycle("chgPct")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 font-medium",
										children: " "
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [shown.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								ref: (el) => {
									rowRefs.current[r.symbol] = el;
								},
								className: cn("h-7 border-t border-border/70", chartSym === r.symbol && "bg-accent/10"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "max-w-[16rem] px-2 sm:max-w-[22rem]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-baseline gap-2 whitespace-nowrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/s/$symbol",
												params: { symbol: r.symbol },
												title: r.name,
												className: "min-w-0 truncate font-medium hover:text-chart",
												children: r.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "shrink-0 text-[10px] text-subtle",
												children: r.symbol
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "whitespace-nowrap px-2 text-right font-mono tabular",
										title: r.source === "screen" ? "Screen price, not a fresh quote" : r.source === "none" ? "No quote" : void 0,
										children: [
											r.last != null ? fmtPx(r.last) : "—",
											r.source === "screen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: " Screen price"
											}) : null,
											r.source === "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: " No quote"
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: cn("whitespace-nowrap px-2 text-right font-mono tabular", (r.chg ?? 0) > 0 ? "text-up" : (r.chg ?? 0) < 0 ? "text-down" : ""),
										children: fmtChg(r.chg)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: cn("whitespace-nowrap px-2 text-right font-mono tabular", (r.chgPct ?? 0) > 0 ? "text-up" : (r.chgPct ?? 0) < 0 ? "text-down" : ""),
										children: r.chgPct == null ? "—" : fmtPct(r.chgPct)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-2 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "h-6 rounded-sm bg-bg px-2 text-[10px] font-medium shadow-[var(--shadow-border)] hover:text-fg",
											onClick: () => openChart(r.symbol),
											children: "View Chart"
										})
									})
								]
							}, r.symbol)), !shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "px-3 py-8 text-center text-[13px] text-muted",
								children: priced.length ? "Nothing matches this search." : "No holdings or watchlist symbols yet."
							}) }) : null] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [view.total, " names. Quotes cover this page first. A missing print is not zero."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-8 rounded-sm px-2 disabled:opacity-40",
									disabled: view.page <= 1,
									onClick: () => setPage((p) => Math.max(1, p - 1)),
									children: "Previous"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "px-1 py-2",
									children: [
										view.page,
										" / ",
										view.pages
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-8 rounded-sm px-2 disabled:opacity-40",
									disabled: view.page >= view.pages,
									onClick: () => setPage((p) => p + 1),
									children: "Next"
								})
							]
						})]
					})] })]
				}), chartSym ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					ref: panelRef,
					className: cn("fixed inset-0 z-40 flex flex-col bg-bg lg:static lg:z-auto lg:ml-3 lg:h-[min(78vh,820px)] lg:overflow-hidden lg:rounded-lg lg:shadow-[var(--shadow-border)] motion-reduce:transition-none", fallback && "!fixed inset-0 z-[80] h-dvh max-h-none w-screen rounded-none"),
					"aria-label": "Selected stock chart",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2 border-b border-border px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "truncate text-[16px] font-semibold",
								children: chartLabel || chartRow?.name || chartSym
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-subtle",
								children: [
									chartSym,
									chartRow?.last != null ? ` · ${fmtPx(chartRow.last)}` : chartQuote?.price ? ` · ${fmtPx(chartQuote.price)}` : " · No quote",
									chartRow?.chgPct != null ? ` · ${fmtPct(chartRow.chgPct)}` : chartQuote && Number.isFinite(chartQuote.changePct) ? ` · ${fmtPct(chartQuote.changePct)}` : "",
									chartRow?.source === "screen" ? " · Screen price, not a fresh quote" : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 flex-wrap items-center justify-end gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "hidden h-8 rounded-sm px-2 text-[11px] text-muted lg:inline",
									onClick: () => setWide((v) => !v),
									children: wide ? "Narrow" : "Wider"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-8 rounded-sm px-2 text-[11px] text-muted hover:text-fg",
									onClick: () => void toggleFs(),
									children: fs ? "Exit fullscreen" : "Fullscreen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/markets",
									search: terminalSearch(chartSym, chartLabel || chartRow?.name || chartSym),
									className: "h-8 px-2 text-[11px] text-muted hover:text-fg",
									children: "Open in Terminal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									ref: closeRef,
									type: "button",
									className: "h-8 rounded-sm bg-surface px-2 text-[12px] shadow-[var(--shadow-border)]",
									onClick: () => setChartSym(null),
									children: "Close chart"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-4 text-[13px] text-muted",
								children: "Loading the chart…"
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermChart, {
								symbol: chartSym,
								name: chartLabel || chartRow?.name || chartSym,
								interval,
								quote: chartQuote,
								active: true,
								embed: true,
								style,
								owned: chartRow?.owned ? chartRow.portfolios.map((p) => p.name).join(", ") : null,
								onActivate: () => {},
								onInterval: setInterval,
								onStyle: setStyle
							}, chartSym)
						})
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-full rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Sector pulse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-subtle",
							children: "Arithmetic average of the key sectoral indices that have a quote this session. Missing indices are left out of the count."
						}),
						pulse ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseStat, {
									label: "Strongest",
									value: pulse.strongest.name,
									detail: fmtPct(pulse.strongest.pct),
									up: pulse.strongest.pct >= 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseStat, {
									label: "Weakest",
									value: pulse.weakest.name,
									detail: fmtPct(pulse.weakest.pct),
									up: pulse.weakest.pct >= 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseStat, {
									label: "Advancing",
									value: `${pulse.advancing} / ${pulse.total}`,
									detail: `${pulse.declining} down · ${pulse.unchanged} flat`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseStat, {
									label: "Average",
									value: fmtPct(pulse.average),
									up: pulse.average >= 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseStat, {
									label: "Leadership gap",
									value: `${pulse.gap.toFixed(2)} pp`,
									detail: "Strongest minus weakest"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[13px] text-muted",
							children: indexQuotes.isError ? "Sectoral quotes failed." : "Waiting on sectoral index quotes."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-full rounded-lg bg-surface shadow-[var(--shadow-border)]",
					"aria-label": "Top movers",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 border-b border-border px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
								children: "Top movers"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-subtle",
								children: "Held names and the selected watchlist"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-sm bg-bg p-0.5",
								role: "tablist",
								"aria-label": "Top movers",
								children: ["gainers", "losers"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": moverMode === id,
									className: cn("h-7 rounded-sm px-2 text-[11px] capitalize", moverMode === id ? "bg-surface text-fg" : "text-muted"),
									onClick: () => setMoverMode(id),
									children: id
								}, id))
							})]
						}),
						movers.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { children: movers.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-b border-border last:border-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-bg",
								onClick: () => {
									setTab("all");
									setQ("");
									setDir("any");
									setMembership("any");
									setStocksView("table");
									setLocateNote("");
									setLocate(row.symbol);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-subtle",
										children: String(i + 1).padStart(2, "0")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-medium",
											children: row.symbol
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-[10px] text-subtle",
											children: row.name
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-right font-mono tabular",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block",
											children: row.last != null ? fmtPx(row.last) : "—"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("block", (row.chgPct || 0) >= 0 ? "text-up" : "text-down"),
											children: [
												fmtChg(row.chg),
												" · ",
												fmtPct(row.chgPct)
											]
										})]
									})
								]
							})
						}, row.symbol)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-3 py-4 text-[13px] text-muted",
							children: [
								"No priced ",
								moverMode,
								" in this book or watchlist."
							]
						}),
						locateNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 pb-2 text-[11px] text-warn",
							children: locateNote
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				"aria-label": "Sectors",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Sectors"
					}),
					screenSectors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6",
						children: screenSectors.slice(0, 12).map((s) => {
							const idx = sectorIndex(s.sector);
							const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-[11px] font-medium",
									children: s.sector
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down"),
									children: fmtPct(s.avg)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-[10px] text-subtle",
									children: idx ? idx.name : "No index"
								})
							] });
							return idx ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/markets",
								search: terminalSearch(idx.symbol, idx.name),
								"aria-label": `Open ${idx.name} in Terminal`,
								className: cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20"),
								children: body
							}, s.sector) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								title: "No matching sector index on file. Kosh does not substitute a different index.",
								className: cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20"),
								children: body
							}, s.sector);
						})
					}) : null,
					screen.isPending && !screenRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] text-muted",
						children: "Loading the market heat…"
					}) : screen.isError && !screenRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] text-muted",
						children: "Market heat unavailable."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketHeat, { rows: liveRows })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCalendar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDesk, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsBoard, {
						title: "Market headlines",
						items: news.data,
						loading: news.isPending,
						shareTitle: "Indian market",
						extra: "Nifty Sensex"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixNudge, { where: "markets" })
				]
			})
		]
	});
}
function PulseStat({ label, value, detail, up }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-2 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1 truncate text-[14px] font-medium", up == null ? "" : up ? "text-up" : "text-down"),
				children: value
			}),
			detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "truncate text-[10px] text-subtle",
				children: detail
			}) : null
		]
	});
}
function Th({ label, on, dir, align, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("px-2 py-2 font-medium", align === "right" && "text-right"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: cn("inline-flex items-center gap-1", align === "right" && "ml-auto"),
			onClick,
			"aria-pressed": on,
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				children: on ? dir === "asc" ? "↑" : "↓" : "↕"
			})]
		})
	});
}
function SortTh({ label, on, dir, align, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("py-1 font-medium", align === "right" && "text-right"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: cn("inline-flex w-full items-center gap-1 text-[10px] tracking-[0.06em] uppercase", align === "right" && "justify-end", on ? "text-fg" : "text-subtle"),
			onClick,
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				children: sortGlyph(on, on ? dir : null)
			})]
		})
	});
}
function MarketOverview() {
	const liveSession = isIstSession();
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: liveSession ? 2500 : 3e4,
		refetchInterval: () => isIstSession() ? 5e3 : 6e4
	});
	const ports = useKosh((s) => s.portfolios);
	const watchlists = useKosh((s) => s.watchlists);
	const activeWatchId = useKosh((s) => s.activeWatchId);
	const [bookId, setBookId] = (0, import_react.useState)("all");
	const [listId, setListId] = (0, import_react.useState)(null);
	const [moreHold, setMoreHold] = (0, import_react.useState)(false);
	const [moreWatch, setMoreWatch] = (0, import_react.useState)(false);
	const watch = useKosh((s) => s.watch);
	const holdSort = useKosh((s) => s.overviewHoldSort);
	const setOverviewHoldSort = useKosh((s) => s.setOverviewHoldSort);
	const overviewWatchSorts = useKosh((s) => s.overviewWatchSorts);
	const setOverviewWatchSort = useKosh((s) => s.setOverviewWatchSort);
	const rows = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	}).data?.rows || [];
	const upSeed = applyScreen(rows, "up").slice(0, 12);
	const downSeed = applyScreen(rows, "down").slice(0, 12);
	const sectors = sectorPulse(rows);
	const portSyms = [...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, ""))))];
	const watchSyms = watch.map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, ""));
	const liveSyms = (0, import_react.useMemo)(() => pickLiveSymbols(portSyms, watchSyms, upSeed.map((r) => r.symbol), downSeed.map((r) => r.symbol), 36), [
		portSyms.join(","),
		watchSyms.join(","),
		upSeed.map((r) => r.symbol).join(","),
		downSeed.map((r) => r.symbol).join(",")
	]);
	const quotes = useQuery({
		queryKey: ["live-tape", liveSyms.join(",")],
		queryFn: () => apiQuotes(liveSyms),
		enabled: liveSyms.length > 0,
		staleTime: liveSession ? 1500 : 3e4,
		refetchInterval: () => isIstSession() ? 3e3 : 6e4,
		placeholderData: (prev) => prev
	});
	const liveRows = overlayQuotes(rows, quotes.data);
	const qBy = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const q of quotes.data || []) {
			const k = q.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");
			m.set(k, q);
		}
		return m;
	}, [quotes.data]);
	const holdRows = (0, import_react.useMemo)(() => {
		const chosen = bookId === "all" ? ports : ports.filter((p) => p.id === bookId);
		const map = /* @__PURE__ */ new Map();
		for (const p of chosen) for (const h of p.holdings) {
			const k = h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, "");
			if (!k) continue;
			const cur = map.get(k) || {
				symbol: k,
				name: h.name || k,
				qty: 0
			};
			cur.qty += h.qty || 0;
			if (h.name) cur.name = h.name;
			map.set(k, cur);
		}
		return [...map.values()].map((r) => {
			const q = qBy.get(r.symbol);
			const screenRow = liveRows.find((x) => x.symbol === r.symbol);
			const last = q && q.price > 0 ? q.price : screenRow && screenRow.price > 0 ? screenRow.price : null;
			const chg = last != null && q && q.previousClose > 0 ? last - q.previousClose : null;
			const chgPct = q && Number.isFinite(q.changePct) ? q.changePct : screenRow?.changePct ?? null;
			return {
				...r,
				last,
				chg,
				chgPct
			};
		});
	}, [
		bookId,
		ports,
		qBy,
		liveRows
	]);
	const sortedHold = (0, import_react.useMemo)(() => {
		if (!holdSort) return sortEntities(holdRows, "chgPct", "desc");
		return sortEntities(holdRows, holdSort.key, holdSort.dir);
	}, [holdRows, holdSort]);
	const activeList = watchlists.find((l) => l.id === (listId || activeWatchId)) || watchlists[0];
	const watchSort = activeList ? overviewWatchSorts[activeList.id] : void 0;
	const embeddedWatch = (0, import_react.useMemo)(() => {
		const list = (activeList?.symbols || []).map((s) => {
			const k = s.toUpperCase().replace(/\.(NS|BO)$/i, "");
			const q = qBy.get(k);
			const screenRow = liveRows.find((x) => x.symbol === k);
			const last = q && q.price > 0 ? q.price : screenRow && screenRow.price > 0 ? screenRow.price : null;
			const prev = q && q.previousClose > 0 ? q.previousClose : null;
			const chg = last != null && prev != null ? last - prev : null;
			const chgPct = q && Number.isFinite(q.changePct) ? q.changePct : screenRow?.changePct ?? null;
			return {
				symbol: k,
				name: q?.name || screenRow?.name || k,
				last,
				chg,
				chgPct
			};
		});
		if (!watchSort) return list;
		return sortEntities(list, watchSort.key, watchSort.dir);
	}, [
		activeList,
		qBy,
		liveRows,
		watchSort
	]);
	function cycleHold(key) {
		const cur = holdSort ? {
			key: holdSort.key,
			dir: holdSort.dir
		} : {
			key: null,
			dir: null
		};
		const next = cycleSort(cur, key);
		setOverviewHoldSort(next.key && next.dir ? {
			key: next.key,
			dir: next.dir
		} : null);
	}
	function cycleWatch(key) {
		if (!activeList) return;
		const cur = watchSort ? {
			key: watchSort.key,
			dir: watchSort.dir
		} : {
			key: null,
			dir: null
		};
		const next = cycleSort(cur, key);
		setOverviewWatchSort(activeList.id, next.key && next.dir ? {
			key: next.key,
			dir: next.dir
		} : null);
	}
	const up = overlayQuotes(upSeed, quotes.data).slice().sort((a, b) => b.changePct - a.changePct).slice(0, 8);
	const down = overlayQuotes(downSeed, quotes.data).slice().sort((a, b) => a.changePct - b.changePct).slice(0, 8);
	const green = rows.filter((r) => r.changePct >= 0).length;
	const news = useQuery({
		queryKey: [
			"news",
			"NIFTY",
			"market"
		],
		queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
		staleTime: 6e5
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-6 px-3 py-5 sm:px-4 sm:py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[22px] font-semibold tracking-tight",
						children: "Indian market overview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
						children: "Indices, breadth, movers, and Pulse — what the cash market is doing today. Open Terminal to watch a name."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/markets",
					search: { view: "terminal" },
					className: "inline-flex h-10 items-center rounded-sm bg-accent px-3.5 text-[13px] font-medium text-accent-fg",
					children: "Open Terminal →"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Indices"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-2 gap-2 md:grid-cols-4",
				children: (tape.data || []).slice(0, 8).map((t) => {
					const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
							children: t.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-[18px] tabular",
							children: t.price ? fmtPx(t.price) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono text-[12px] tabular", t.changePct >= 0 ? "text-up" : "text-down"),
							children: t.changePct ? fmtPct(t.changePct) : "—"
						})
					] });
					if (instrumentKind(t.symbol) === "index") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/markets",
						search: terminalSearch(t.symbol, t.label),
						"aria-label": `Open ${t.label} in Terminal`,
						className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
						children: inner
					}, t.id);
					if (instrumentKind(t.symbol) === "stock") {
						const bare = t.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/s/$symbol",
							params: { symbol: bare },
							"aria-label": `Open ${t.label}`,
							className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
							children: inner
						}, t.id);
					}
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
						children: inner
					}, t.id);
				})
			})] }),
			ports.some((p) => p.holdings.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Your holdings today"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": "Portfolio",
						value: bookId,
						onChange: (e) => {
							setBookId(e.target.value);
							setMoreHold(false);
						},
						className: "h-8 rounded-sm border border-border bg-bg px-2 text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All"
						}), ports.filter((p) => p.holdings.length).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})]
				}), sortedHold.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-[10px] tracking-[0.06em] text-subtle uppercase",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
									label: "Name",
									on: holdSort?.key === "name",
									dir: holdSort?.dir || null,
									onClick: () => cycleHold("name")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
									label: "Last",
									align: "right",
									on: holdSort?.key === "last",
									dir: holdSort?.dir || null,
									onClick: () => cycleHold("last")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
									label: "Chg",
									align: "right",
									on: holdSort?.key === "chg",
									dir: holdSort?.dir || null,
									onClick: () => cycleHold("chg")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
									label: "Chg %",
									align: "right",
									on: holdSort?.key === "chgPct",
									dir: holdSort?.dir || null,
									onClick: () => cycleHold("chgPct")
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (moreHold ? sortedHold : sortedHold.slice(0, 8)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/s/$symbol",
										params: { symbol: r.symbol },
										className: "font-medium hover:text-chart",
										children: r.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-subtle",
										children: r.name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 text-right font-mono tabular",
									children: r.last != null ? fmtPx(r.last) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("py-1.5 text-right font-mono tabular", (r.chg ?? 0) >= 0 ? "text-up" : "text-down"),
									children: r.chg == null ? "—" : `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("py-1.5 text-right font-mono tabular", (r.chgPct ?? 0) >= 0 ? "text-up" : "text-down"),
									children: r.chgPct == null ? "—" : fmtPct(r.chgPct)
								})
							]
						}, r.symbol)) })]
					})
				}), sortedHold.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 text-[12px] text-chart",
					onClick: () => setMoreHold((v) => !v),
					children: moreHold ? "Show less" : `Show all ${sortedHold.length} names`
				}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[13px] text-muted",
					children: "Waiting on last prints for the names you hold."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Breadth"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[12px] text-subtle",
						children: "Advancing vs declining names on the screen. Blank if the screen has not loaded."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadthBar, {
							green,
							n: rows.length
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] text-muted",
							children: "Breadth fills once the screen is in."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTempCard, {
							rows: liveRows,
							focus: portSyms.length ? portSyms : watchSyms
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Winners"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: up.map((r) => ({
						name: r.symbol,
						sub: r.name,
						symbol: r.symbol,
						value: r.changePct,
						label: fmtPct(r.changePct),
						tone: "up"
					})) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Losers"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: down.map((r) => ({
						name: r.symbol,
						sub: r.name,
						symbol: r.symbol,
						value: r.changePct,
						label: fmtPct(r.changePct),
						tone: "down"
					})) })]
				})]
			}),
			watchlists.some((l) => l.symbols.length) || embeddedWatch.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Watch"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Watchlist",
						value: activeList?.id || "",
						onChange: (e) => {
							setListId(e.target.value);
							setMoreWatch(false);
						},
						className: "h-8 rounded-sm border border-border bg-bg px-2 text-[12px]",
						children: watchlists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: l.id,
							children: l.name
						}, l.id))
					})]
				}), embeddedWatch.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[420px] text-left text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
								label: "Name",
								on: watchSort?.key === "name",
								dir: watchSort?.dir || null,
								onClick: () => cycleWatch("name")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
								label: "Last",
								align: "right",
								on: watchSort?.key === "last",
								dir: watchSort?.dir || null,
								onClick: () => cycleWatch("last")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
								label: "Chg",
								align: "right",
								on: watchSort?.key === "chg",
								dir: watchSort?.dir || null,
								onClick: () => cycleWatch("chg")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortTh, {
								label: "Chg %",
								align: "right",
								on: watchSort?.key === "chgPct",
								dir: watchSort?.dir || null,
								onClick: () => cycleWatch("chgPct")
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (moreWatch ? embeddedWatch : embeddedWatch.slice(0, 8)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/s/$symbol",
										params: { symbol: r.symbol },
										className: "font-medium hover:text-chart",
										children: r.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-subtle",
										children: r.name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 text-right font-mono tabular",
									children: r.last != null ? fmtPx(r.last) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("py-1.5 text-right font-mono tabular", (r.chg ?? 0) >= 0 ? "text-up" : "text-down"),
									children: r.chg == null ? "—" : `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("py-1.5 text-right font-mono tabular", (r.chgPct ?? 0) >= 0 ? "text-up" : "text-down"),
									children: r.chgPct == null ? "—" : fmtPct(r.chgPct)
								})
							]
						}, r.symbol)) })]
					})
				}), embeddedWatch.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 text-[12px] text-chart",
					onClick: () => setMoreWatch((v) => !v),
					children: moreWatch ? "Show less" : `Show all ${embeddedWatch.length} names`
				}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[13px] text-muted",
					children: "This list is empty."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Sectors"
				}),
				sectors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6",
					children: sectors.slice(0, 12).map((s) => {
						const idx = sectorIndex(s.sector);
						const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-[11px] font-medium",
								children: s.sector
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down"),
								children: fmtPct(s.avg)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-[10px] text-subtle",
								children: idx ? idx.name : "No index"
							})
						] });
						return idx ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/markets",
							search: terminalSearch(idx.symbol, idx.name),
							"aria-label": `Open ${idx.name} in Terminal`,
							className: cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20"),
							children: body
						}, s.sector) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							title: "No matching sector index on file. Kosh does not substitute a different index.",
							className: cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20"),
							children: body
						}, s.sector);
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketHeat, { rows: liveRows })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroBoard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCalendar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDesk, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsBoard, {
				title: "Market headlines",
				items: news.data,
				loading: news.isPending,
				shareTitle: "Indian market",
				extra: "Nifty Sensex"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixNudge, { where: "markets" })
		]
	});
}
function absChange(q) {
	if (!q || !(q.price > 0) || !(q.previousClose > 0)) return null;
	return q.price - q.previousClose;
}
function WatchPane({ quotes, activeSymbol, owned, onPick }) {
	const lists = useKosh((s) => s.watchlists);
	const activeId = useKosh((s) => s.activeWatchId);
	const watch = useKosh((s) => s.watch);
	const ports = useKosh((s) => s.portfolios);
	const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
	const addWatchList = useKosh((s) => s.addWatchList);
	const renameWatchList = useKosh((s) => s.renameWatchList);
	const deleteWatchList = useKosh((s) => s.deleteWatchList);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const moveWatch = useKosh((s) => s.moveWatch);
	const watchSorts = useKosh((s) => s.watchSorts);
	const setWatchSort = useKosh((s) => s.setWatchSort);
	const recents = useKosh((s) => s.recents);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)({
		kind: "watch",
		id: activeId
	});
	const [qtext, setQtext] = (0, import_react.useState)("");
	const dragFrom = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const qmap = (0, import_react.useMemo)(() => quoteMap(quotes), [quotes]);
	const sortId = source.kind === "watch" ? source.id : "p:" + source.id;
	const saved = watchSorts[sortId];
	const sort = saved ? {
		key: saved.key,
		dir: saved.dir
	} : {
		key: null,
		dir: null
	};
	const port = source.kind === "port" ? ports.find((p) => p.id === source.id) : null;
	const decorated = (source.kind === "port" ? (port?.holdings || []).map((h) => bareSymbol(h.symbol)).filter(Boolean) : watch).map((s, i) => {
		const k = bareSymbol(s);
		const q = qmap.get(k);
		return {
			i,
			k,
			name: q?.name || universeName(k) || k,
			last: q && q.price > 0 ? q.price : null,
			chg: absChange(q),
			chgPct: q && Number.isFinite(q.changePct) ? q.changePct : null,
			q
		};
	});
	const searched = qtext.trim() ? decorated.filter((r) => (r.k + " " + r.name).toLowerCase().includes(qtext.trim().toLowerCase())) : decorated;
	const rows = sort.key && sort.dir ? sortEntities(searched, sort.key, sort.dir) : searched;
	const customOrder = !sort.key;
	function create() {
		const n = newName.trim();
		if (!n) return;
		const id = addWatchList(n);
		setNewName("");
		setCreating(false);
		setSource({
			kind: "watch",
			id
		});
	}
	function onSelectList(v) {
		if (v.startsWith("p:")) {
			setSource({
				kind: "port",
				id: v.slice(2)
			});
			return;
		}
		setActiveWatchId(v);
		setSource({
			kind: "watch",
			id: v
		});
	}
	function toggleCol(key) {
		const next = cycleSort(sort, key);
		if (!next.key || !next.dir) setWatchSort(sortId, null);
		else setWatchSort(sortId, {
			key: next.key,
			dir: next.dir
		});
	}
	const selectValue = source.kind === "port" ? "p:" + source.id : source.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"data-watch-pane": true,
		className: "kosh-watch flex h-full min-h-0 min-w-0 flex-col bg-bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-11 shrink-0 items-center gap-2 border-b border-border px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "List"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": "List",
						value: selectValue,
						onChange: (e) => onSelectList(e.target.value),
						className: "ml-auto h-7 max-w-[58%] rounded-sm border border-border bg-surface-2 px-1.5 text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "WATCHLISTS",
							children: lists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.id,
								children: l.name
							}, l.id))
						}), ports.some((p) => p.holdings.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "PORTFOLIOS",
							children: ports.filter((p) => p.holdings.length).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "p:" + p.id,
								children: p.name
							}, p.id))
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: "New list",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "New list",
							className: "grid size-7 place-items-center text-muted hover:text-fg",
							onClick: () => setCreating(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
						})
					})
				]
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1 border-b border-border px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					autoFocus: true,
					value: newName,
					onChange: (e) => setNewName(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") create();
						if (e.key === "Escape") setCreating(false);
					},
					placeholder: "List name",
					className: "h-8 min-w-0 flex-1 rounded-sm bg-bg px-2 text-[12px] outline-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-8 px-2 text-[12px] text-fg",
					onClick: create,
					children: "Add"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1 border-b border-border px-2 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: qtext,
						onChange: (e) => setQtext(e.target.value),
						placeholder: "Search",
						"aria-label": "Search list",
						className: "h-7 min-w-0 flex-1 rounded-sm bg-bg px-2 text-[11px] outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-7 shrink-0 px-1.5 text-[10px] tracking-[0.06em] uppercase", customOrder ? "text-fg" : "text-muted hover:text-fg"),
						onClick: () => setWatchSort(sortId, null),
						children: "Custom order"
					}),
					source.kind === "watch" && lists.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: "Delete list",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-7 place-items-center text-muted hover:text-down",
							"aria-label": "Delete list",
							onClick: () => {
								const active = lists.find((l) => l.id === source.id);
								if (active && window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
						})
					}) : null,
					source.kind === "watch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hidden text-[10px] text-muted hover:text-fg sm:inline",
						onClick: () => {
							const active = lists.find((l) => l.id === source.id);
							if (!active) return;
							const n = window.prompt("Rename list", active.name);
							if (n?.trim()) renameWatchList(active.id, n.trim());
						},
						children: "Rename"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "kosh-watch-head shrink-0 border-b border-border px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-subtle uppercase",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "kosh-watch-main !py-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "text-right",
								onClick: () => toggleCol("last"),
								children: ["Last ", sortGlyph(sort.key === "last", sort.dir)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "kosh-watch-wide text-right",
								onClick: () => toggleCol("chg"),
								children: ["Chg ", sortGlyph(sort.key === "chg", sort.dir)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "kosh-watch-wide text-right",
								onClick: () => toggleCol("chgPct"),
								children: ["Chg % ", sortGlyph(sort.key === "chgPct", sort.dir)]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "kosh-watch-rows min-h-0 flex-1 overflow-y-auto",
				children: !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "px-3 py-6 text-center text-[12px] text-muted",
					children: [source.kind === "port" ? "This list has no names yet." : "Search a name and pin it, or open a stock and add it to this list.", source.kind === "watch" && recents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1 text-left",
						children: recents.slice(0, 6).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "w-full rounded-sm px-2 py-1.5 text-left text-[12px] text-fg hover:bg-surface",
							onClick: () => onPick(r.symbol, r.name),
							children: [r.symbol, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-subtle",
								children: r.name
							})]
						}) }, r.symbol))
					}) : null]
				}) : rows.map((r) => {
					const on = bareSymbol(activeSymbol) === r.k;
					const badge = owned[r.k];
					const chg = r.chgPct ?? 0;
					const tone = r.chgPct == null ? "text-muted" : r.chgPct >= 0 ? "text-up" : "text-down";
					const lastTxt = r.last != null ? fmtPx(r.last) : "—";
					const absTxt = r.chg != null ? `${r.chg >= 0 ? "+" : ""}${fmtPx(Math.abs(r.chg))}` : "—";
					const pctTxt = r.chgPct != null ? fmtPct(r.chgPct) : "";
					const canDrag = source.kind === "watch" && customOrder && !qtext.trim();
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("kosh-watch-row border-b border-border/70", on && "bg-surface"),
						draggable: canDrag,
						onDragStart: () => {
							dragFrom.current = r.i;
							dragging.current = true;
						},
						onDragOver: (e) => {
							if (!canDrag) return;
							e.preventDefault();
						},
						onDrop: (e) => {
							e.preventDefault();
							const from = dragFrom.current;
							dragFrom.current = null;
							dragging.current = false;
							if (from == null || from === r.i) return;
							moveWatch(from, r.i);
						},
						onDragEnd: () => {
							dragFrom.current = null;
							window.setTimeout(() => {
								dragging.current = false;
							}, 0);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("kosh-watch-handle text-subtle", canDrag ? "cursor-grab" : "opacity-30"),
								"aria-hidden": true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-watch-row": r.k,
								onClick: () => {
									if (dragging.current) return;
									onPick(r.k, r.name);
								},
								className: "kosh-watch-main min-w-0 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "kosh-watch-name min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13px] font-semibold",
												children: r.k
											}), badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-sm bg-surface-2 px-1 py-px text-[9px] tracking-[0.04em] text-muted uppercase",
												children: badge
											}) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-[10px] text-subtle",
											children: r.name
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "kosh-watch-last text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-mono text-[13px] font-semibold tabular",
											children: lastTxt
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("kosh-watch-stack font-mono text-[11px] tabular", tone),
											children: [absTxt, pctTxt ? ` · ${pctTxt}` : ""]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("kosh-watch-wide kosh-watch-chg text-right font-mono text-[11px] tabular", tone),
										children: absTxt
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("kosh-watch-wide kosh-watch-pct text-right font-mono text-[11px] tabular", chg >= 0 ? "text-up" : "text-down"),
										children: pctTxt || "—"
									})
								]
							}),
							source.kind === "watch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "kosh-watch-ops flex items-center justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									content: `Remove ${r.k}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Remove ${r.k}`,
										className: "grid w-6 place-items-center text-subtle hover:text-down",
										onClick: () => toggleWatch(r.k),
										children: "×"
									})
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					}, r.k + r.i);
				})
			})
		]
	});
}
var INTEL_TABS = [
	{
		id: "overview",
		label: "Overview"
	},
	{
		id: "fundamentals",
		label: "Fundamentals"
	},
	{
		id: "valuation",
		label: "Valuation"
	},
	{
		id: "growth",
		label: "Growth"
	},
	{
		id: "ownership",
		label: "Ownership"
	},
	{
		id: "news",
		label: "News"
	},
	{
		id: "view",
		label: "Kosh View"
	}
];
var TABS = INTEL_TABS;
function n(v, f) {
	return v != null && Number.isFinite(v) ? f(v) : "—";
}
function IntelPanel({ symbol, name, quote, owned, tab, onTab, patterns }) {
	const skillReads = useKosh((s) => s.skillReads);
	const patternsOn = useKosh((s) => s.chartPrefs.patternsOn === true);
	const fundQ = useQuery({
		queryKey: ["fundamentals", symbol],
		queryFn: () => apiFundamentals(symbol),
		staleTime: 6e5,
		placeholderData: keepPreviousData
	});
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const news = useQuery({
		queryKey: ["news", symbol],
		queryFn: () => apiNews(symbol, name),
		staleTime: 6e5
	});
	const daily = useQuery({
		queryKey: [
			"ohlc",
			symbol,
			"2y",
			"1d"
		],
		queryFn: () => apiOhlc(symbol, "2y", "1d"),
		staleTime: 6e4,
		placeholderData: keepPreviousData
	});
	const fund = fundQ.data || null;
	const row = pickScreenRow(screen.data?.rows || [], symbol) || null;
	const skill = skillReads[bareSymbol(symbol)] || null;
	const px = quote?.price && quote.price > 0 ? quote.price : daily.data?.price || null;
	const chg = quote?.changePct ?? daily.data?.changePct ?? 0;
	const bars = daily.data?.bars?.map((b) => ({
		t: b.t,
		c: b.c
	})) || [];
	const snap = (0, import_react.useMemo)(() => buildSnapshot({
		symbol,
		name,
		price: px,
		fund,
		row,
		skill,
		bars
	}), [
		symbol,
		name,
		px,
		fund,
		row,
		skill,
		bars
	]);
	const models = (0, import_react.useMemo)(() => buildValuationModels({
		price: px,
		fund,
		bars
	}), [
		px,
		fund,
		bars
	]);
	const eq = earningsQualityRead(fund);
	const sh = stakeDelta(fund?.shareholding);
	const active = TABS.some((t) => t.id === tab) ? tab : "overview";
	const fresh = classifyFreshness({
		session: isIstSession(),
		price: px,
		marketTime: quote?.marketTime,
		retrievedAt: quote?.retrievedAt
	});
	const hits = patternsOn ? patterns || [] : [];
	const facts = [
		["P/E", n(fund?.pe, (x) => x.toFixed(1) + "x")],
		["Industry P/E", n(fund?.industryPe, (x) => x.toFixed(1) + "x")],
		["ROCE", n(fund?.roce, (x) => x.toFixed(1) + "%")],
		["D/E", n(fund?.de, (x) => x.toFixed(2) + "x")],
		["Profit 1Y", n(fund?.profitYoY, (x) => fmtPct(x))],
		["Market cap", n(fund?.mcapCr, (x) => `₹${x.toLocaleString("en-IN")} Cr`)]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-intel-panel": true,
		className: "flex flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[15px] font-semibold",
								children: bareSymbol(symbol)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-[12px] text-muted",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[15px] tabular",
								children: px ? fmtPx(px) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down"),
								children: fmtPct(chg)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", fresh.state === "live" ? "bg-up/15 text-up" : fresh.state === "off" ? "bg-down/15 text-down" : "bg-surface-2 text-muted"),
								title: fresh.title,
								children: fresh.label
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[11px] text-subtle",
						children: "Kosh intelligence — numbers on file, not a forecast."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$symbol",
					params: { symbol },
					"data-open-full-analysis": true,
					className: "inline-flex h-11 w-full shrink-0 items-center justify-center rounded-sm bg-chart/15 px-3 text-[13px] font-semibold text-chart sm:h-10 sm:w-auto",
					children: "Open Full Analysis →"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid shrink-0 grid-cols-3 gap-1.5 border-b border-border px-3 py-2 sm:grid-cols-6",
				children: facts.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] tracking-[0.06em] text-subtle uppercase",
					children: k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[13px] font-semibold tabular",
					children: v
				})] }, k))
			}),
			snap.read ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "shrink-0 border-b border-border px-3 py-2 text-[12px] leading-snug text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-1.5 text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: "Kosh observation"
				}), snap.read]
			}) : null,
			patternsOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-pattern-box": true,
				className: "shrink-0 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase",
						children: "Technical"
					}),
					hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 space-y-1",
						children: hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-[12px] leading-snug text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-fg",
									children: [
										h.label,
										" · ",
										patternStatusLabel(h.status)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1 text-subtle",
									children: "·"
								}),
								h.note
							]
						}, h.kind))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[12px] text-muted",
						children: "No pattern on this window."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] text-subtle",
						children: "Analytical aid — not a signal or prediction."
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-intel-tab": t.id,
					onClick: () => onTab(t.id),
					className: cn("h-10 shrink-0 px-2.5 text-[12px] font-medium", active === t.id ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg"),
					children: t.label
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3",
				children: [
					active === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
						fund,
						snap,
						owned
					}) : null,
					active === "fundamentals" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundamentalsTab, { fund }) : null,
					active === "valuation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValuationTab, {
						models,
						fund
					}) : null,
					active === "growth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrowthTab, { fund }) : null,
					active === "ownership" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnershipTab, {
						fund,
						sh
					}) : null,
					active === "news" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsTab, {
						items: news.data,
						loading: news.isPending
					}) : null,
					active === "view" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTab, {
						snap,
						models,
						eq,
						fund,
						owned
					}) : null
				]
			})
		]
	});
}
function Metric({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-surface px-2.5 py-2 shadow-[var(--shadow-border)]",
		title: hint,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] tracking-[0.06em] text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-0.5 font-mono text-[14px] font-semibold tabular", tone === "up" && "text-up", tone === "down" && "text-down"),
			children: value
		})]
	});
}
function Overview({ fund, snap, owned }) {
	const items = [
		["Market cap", n(fund?.mcapCr, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
		["P/E", n(fund?.pe, (x) => x.toFixed(1) + "x")],
		["Industry P/E", n(fund?.industryPe, (x) => x.toFixed(1) + "x")],
		["P/B", n(fund?.pb, (x) => x.toFixed(2))],
		["ROCE", n(fund?.roce, (x) => x.toFixed(1) + "%")],
		["ROE", n(fund?.roe, (x) => x.toFixed(1) + "%")],
		["Debt / equity", n(fund?.de, (x) => x.toFixed(2) + "x")],
		["Div yield", n(fund?.divYield, (x) => x.toFixed(2) + "%")],
		["EPS", n(fund?.eps, (x) => `₹${x.toFixed(2)}`)],
		["Sales 1Y", n(fund?.salesYoY, (x) => fmtPct(x))],
		["Profit 1Y", n(fund?.profitYoY, (x) => fmtPct(x))]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-[12px] text-muted",
			children: owned
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6",
			children: items.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: k,
				value: v
			}, k))
		}),
		fund?.finPeriod ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[11px] text-subtle",
			children: [
				"Financials ",
				formatFinPeriod(fund.finPeriod),
				"."
			]
		}) : null,
		snap.missing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-[11px] text-subtle",
			children: [
				"Blank is missing, not a guess. Missing: ",
				snap.missing.slice(0, 6).join(", "),
				"."
			]
		}) : null
	] });
}
function FundamentalsTab({ fund }) {
	if (!fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "No company numbers for this ticker — numbers are not invented."
	});
	const rows = [
		["Revenue last", n(fund.sales?.at(-1)?.value, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
		["Profit last", n(fund.profits?.at(-1)?.value, (x) => `₹${x.toLocaleString("en-IN")} Cr`)],
		["EPS", n(fund.eps, (x) => `₹${x.toFixed(2)}`)],
		["OPM", n(fund.opm, (x) => x.toFixed(1) + "%")],
		["ROCE", n(fund.roce, (x) => x.toFixed(1) + "%")],
		["ROE", n(fund.roe, (x) => x.toFixed(1) + "%")],
		["CFO / PAT", n(fund.cfoPat, (x) => x.toFixed(2) + "×")],
		["Debt / equity", n(fund.de, (x) => x.toFixed(2))],
		["Interest cover", n(fund.interestCover, (x) => x.toFixed(1) + "×")]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5",
		children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
			label: k,
			value: v
		}, k))
	}), fund.finPeriod ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 text-[11px] text-subtle",
		children: [
			"Period ",
			formatFinPeriod(fund.finPeriod),
			"."
		]
	}) : null] });
}
function ValuationTab({ models, fund }) {
	const simple = models.simple;
	const reverse = models.models.find((m) => m.id === "C");
	const ev = growthEvidence(fund);
	const pes = models.hist.map((h) => h.pe).filter((x) => x != null && x > 0);
	const med = pes.length >= 4 ? [...pes].sort((a, b) => a - b)[Math.floor(pes.length / 2)] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1.5 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "P/E",
						value: n(fund?.pe, (x) => x.toFixed(1) + "x")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Industry",
						value: n(fund?.industryPe, (x) => x.toFixed(1) + "x")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Hist median",
						value: n(med, (x) => x.toFixed(1) + "x")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Requires",
						value: reverse?.figure || "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] leading-relaxed text-muted",
				children: reverse?.body || "Not enough data for reverse valuation."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-subtle",
				children: [
					"Growth evidence: ",
					ev.tone,
					". ",
					ev.body
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: "P/E vs industry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: simple.word })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] leading-relaxed text-muted",
				children: simple.body || simple.figure
			})] })
		]
	});
}
function GrowthTab({ fund }) {
	if (!fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Insufficient data."
	});
	const ev = growthEvidence(fund);
	const sales = fund.sales?.slice(-6) || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 text-[12px] text-muted",
			children: [
				ev.tone,
				". ",
				ev.body
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-1.5 sm:grid-cols-4",
			children: ev.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: item.label,
				value: item.value ?? "Unavailable"
			}, item.label))
		}),
		sales.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-[12px] text-muted",
			children: ["Revenue print: ", sales.map((s) => `${formatFinPeriod(s.period)} ₹${s.value.toLocaleString("en-IN")} Cr`).join(" · ")]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[12px] text-subtle",
			children: "Not enough yearly points for a trend."
		})
	] });
}
function OwnershipTab({ fund, sh }) {
	if (!fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "No shareholding print on file."
	});
	const period = fund.shPeriod ? formatShPeriod(fund.shPeriod) : sh?.label || null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [period ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mb-2 text-[11px] text-subtle",
		children: [
			"Shareholding ",
			period,
			". Not a live print."
		]
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-1.5 sm:grid-cols-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Promoter",
				value: n(fund.promoters, (x) => x.toFixed(1) + "%")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Promoter Δ",
				value: sh && fund.shareholding.length >= 2 && fund.shareholding.at(-1)?.promoters != null && fund.shareholding.at(-2)?.promoters != null ? `${fund.shareholding.at(-1).promoters - fund.shareholding.at(-2).promoters >= 0 ? "+" : ""}${(fund.shareholding.at(-1).promoters - fund.shareholding.at(-2).promoters).toFixed(1)} pp` : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "FII",
				value: n(fund.fii, (x) => x.toFixed(1) + "%")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "FII Δ",
				value: sh?.fiiDelta != null ? `${sh.fiiDelta >= 0 ? "+" : ""}${sh.fiiDelta.toFixed(1)} pp` : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "DII",
				value: n(fund.dii, (x) => x.toFixed(1) + "%")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Pledge",
				value: n(fund.pledge, (x) => x.toFixed(1) + "%")
			})
		]
	})] });
}
function NewsTab({ items, loading }) {
	const [bucket, setBucket] = (0, import_react.useState)("all");
	const shown = (0, import_react.useMemo)(() => filterNews(items || [], bucket).slice(0, 8), [items, bucket]);
	if (loading && !items?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Loading headlines…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-2 flex flex-wrap gap-1",
		children: NEWS_BUCKETS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setBucket(b.id),
			className: cn("h-7 rounded-sm px-2 text-[11px]", bucket === b.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
			children: b.label
		}, b.id))
	}), !shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "No headlines in this bucket."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: shown.map((it, i) => {
			const mat = it.material || newsMaterial(it.title);
			const cat = NEWS_BUCKETS.find((b) => b.id === newsBucket(it.title))?.label || "Market";
			const when = it.ts ? new Date(it.ts < 2e10 ? it.ts * 1e3 : it.ts).toISOString().slice(0, 10) : "";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: it.link,
				target: "_blank",
				rel: "noreferrer",
				className: "block text-[13px] leading-snug hover:text-chart",
				children: it.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: it.publisher || "Headline" }),
					when ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", when] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "uppercase",
						children: cat
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mat === "high" ? "High materiality" : mat === "medium" ? "Medium materiality" : "Background" })
				]
			})] }, i);
		})
	})] });
}
function ViewTab({ snap, models, eq, fund, owned }) {
	const lines = [];
	if (fund?.roce != null) lines.push({
		label: "Quality",
		body: `ROCE ${fund.roce.toFixed(1)}% on the company card${fund.roe != null ? ` · ROE ${fund.roe.toFixed(1)}%` : ""}.`
	});
	if (fund?.profitYoY != null || fund?.profitCagr3 != null) {
		const bits = [];
		if (fund.profitYoY != null) bits.push(`1Y ${fmtPct(fund.profitYoY)}`);
		if (fund.profitCagr3 != null) bits.push(`3Y ${fmtPct(fund.profitCagr3)}`);
		lines.push({
			label: "Growth",
			body: `Profit growth on file: ${bits.join(" · ")}.`
		});
	}
	if (models.simple.word !== "Not enough data") lines.push({
		label: "Valuation",
		body: `${models.simple.word}. ${models.simple.figure}`
	});
	if (fund?.de != null) lines.push({
		label: "Balance sheet",
		body: `Debt / equity ${fund.de.toFixed(2)}${fund.de > 1.5 ? " — elevated versus a 1.5 screen." : "."}`
	});
	if (eq.cfoPat != null) lines.push({
		label: "Cash flow",
		body: `Operating cash / profit ${eq.cfoPat.toFixed(2)}× on the latest print.`
	});
	if (owned) lines.push({
		label: "Portfolio",
		body: owned
	});
	if (!lines.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Insufficient data."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
		children: [lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-l-2 border-warn pl-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold tracking-[0.06em] uppercase",
				children: l.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[12px] leading-snug text-muted",
				children: l.body
			})]
		}, l.label)), snap.read ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "sm:col-span-2 text-[12px] text-subtle",
			children: snap.read
		}) : null]
	});
}
var DESK_SPLIT = {
	main: 74,
	watch: 26
};
function ownedNotes(ports, quotes) {
	const qmap = quoteMap(quotes);
	const out = {};
	for (const p of ports) {
		let total = 0;
		const vals = [];
		for (const h of p.holdings) {
			const k = bareSymbol(h.symbol);
			if (!k) continue;
			const px = qmap.get(k)?.price || 0;
			const v = (h.qty || 0) * px;
			vals.push({
				k,
				v
			});
			if (v > 0) total += v;
		}
		for (const row of vals) if (total > 0 && row.v > 0) {
			const w = row.v / total * 100;
			out[row.k] = {
				badge: `Owned · ${w.toFixed(1)}%`,
				line: `You own this stock · ${w.toFixed(1)}% portfolio weight.`
			};
		} else if (!out[row.k]) out[row.k] = {
			badge: "Owned",
			line: "You own this stock."
		};
	}
	return out;
}
var marketsRoute = getRouteApi("/markets");
function MarketsDesk() {
	const { symbol: focusSymbol, name: focusName } = marketsRoute.useSearch();
	const desk = useKosh((s) => s.desk);
	const patchDesk = useKosh((s) => s.patchDesk);
	const setDeskPane = useKosh((s) => s.setDeskPane);
	const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
	const termHeight = snapTermHeight(useKosh((s) => s.chartPrefs.termHeight || TERM_HEIGHT.standard));
	const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
	const watch = useKosh((s) => s.watch);
	const ports = useKosh((s) => s.portfolios);
	const [wide, setWide] = (0, import_react.useState)(true);
	const [watchOpen, setWatchOpen] = (0, import_react.useState)(true);
	const [detailsOpen, setDetailsOpen] = (0, import_react.useState)(false);
	const deskRef = (0, import_react.useRef)(null);
	const { fs, fallback, toggle: toggleFs } = useChartFullscreen(deskRef);
	const [hits, setHits] = (0, import_react.useState)([]);
	const onHits = (0, import_react.useCallback)((next) => {
		setHits((prev) => {
			if (prev === next) return prev;
			if (prev.length === 0 && next.length === 0) return prev;
			if (prev.length === next.length && prev.every((h, i) => h.kind === next[i]?.kind && h.label === next[i]?.label && h.status === next[i]?.status && h.note === next[i]?.note)) return prev;
			return next;
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const m = window.matchMedia("(min-width: 1024px)");
		const fn = () => setWide(m.matches);
		fn();
		m.addEventListener("change", fn);
		return () => m.removeEventListener("change", fn);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!focusSymbol) return;
		let cancel = false;
		const apply = () => {
			if (!cancel) setDeskSymbol(focusSymbol, focusName || focusSymbol);
		};
		if (useKosh.persist.hasHydrated()) apply();
		const unsub = useKosh.persist.onFinishHydration(apply);
		return () => {
			cancel = true;
			unsub();
		};
	}, [
		focusSymbol,
		focusName,
		setDeskSymbol
	]);
	const layout = wide ? desk.layout : 1;
	const visible = desk.panes.slice(0, layout);
	const liveSyms = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		for (const p of visible) s.add(bareSymbol(p.symbol));
		for (const w of watch) s.add(bareSymbol(w));
		for (const p of ports) for (const h of p.holdings) s.add(bareSymbol(h.symbol));
		return [...s].filter(Boolean).slice(0, 48);
	}, [
		visible.map((p) => p.symbol).join(","),
		watch.join(","),
		ports.map((p) => p.holdings.map((h) => h.symbol).join(",")).join("|")
	]);
	const session = isIstSession();
	const quotesQ = useQuery({
		queryKey: ["term-quotes", liveSyms.join(",")],
		queryFn: () => apiQuotes(liveSyms),
		enabled: liveSyms.length > 0,
		staleTime: session ? 1500 : 3e4,
		refetchInterval: () => isIstSession() ? 3e3 : 6e4,
		placeholderData: (prev) => prev
	});
	const qmap = (0, import_react.useMemo)(() => quoteMap(quotesQ.data), [quotesQ.data]);
	const notes = (0, import_react.useMemo)(() => ownedNotes(ports, quotesQ.data), [ports, quotesQ.data]);
	const active = desk.panes[desk.activePane] || desk.panes[0];
	const activeQ = qmap.get(bareSymbol(active.symbol));
	const fresh = classifyFreshness({
		session,
		price: activeQ?.price || quotesQ.data?.find((q) => q.price > 0)?.price || 0,
		marketTime: activeQ?.marketTime,
		retrievedAt: activeQ?.retrievedAt
	});
	const workspace = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-0 min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid h-full min-h-0 min-w-0 flex-1 auto-rows-fr gap-px bg-border", layout === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"),
			children: visible.map((pane, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermChart$1, {
				symbol: pane.symbol,
				name: pane.name,
				interval: pane.interval,
				quote: qmap.get(bareSymbol(pane.symbol)),
				active: desk.activePane === i,
				style: desk.style,
				owned: notes[bareSymbol(pane.symbol)]?.badge || null,
				onActivate: () => patchDesk({ activePane: i }),
				onInterval: (id) => setDeskPane(i, { interval: id }),
				onStyle: (next) => patchDesk({ style: next }),
				onPatterns: desk.activePane === i ? onHits : void 0
			}, pane.symbol + "-" + i))
		})
	});
	const watchEl = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchPane, {
		quotes: quotesQ.data,
		activeSymbol: active.symbol,
		owned: Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, v.badge])),
		onPick: (symbol, name) => {
			setDeskSymbol(symbol, name);
		}
	});
	const intel = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelPanel, {
		symbol: active.symbol,
		name: active.name,
		quote: activeQ,
		owned: notes[bareSymbol(active.symbol)]?.line || null,
		tab: desk.intelTab,
		onTab: (id) => patchDesk({ intelTab: id }),
		patterns: hits
	});
	const chartBox = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("min-h-0 shrink-0", fs && "min-h-[240px] flex-1"),
		style: fs ? void 0 : {
			height: termHeight,
			maxHeight: "calc(100% - 2.75rem)"
		},
		"data-term-height": termHeight,
		children: workspace
	});
	const tabRow = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex shrink-0 items-center gap-1 overflow-x-auto border-t border-border px-2",
		"data-term-tabs": true,
		children: INTEL_TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"data-term-tab": t.id,
			"aria-pressed": detailsOpen && desk.intelTab === t.id,
			onClick: () => {
				if (detailsOpen && desk.intelTab === t.id) setDetailsOpen(false);
				else {
					patchDesk({ intelTab: t.id });
					setDetailsOpen(true);
				}
			},
			className: cn("h-10 shrink-0 px-2.5 text-[12px] font-medium", detailsOpen && desk.intelTab === t.id ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg"),
			children: t.label
		}, t.id))
	});
	const mainCol = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full min-h-0 flex-col overflow-hidden",
		"data-term-workspace": true,
		children: [
			chartBox,
			tabRow,
			detailsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-term-details": true,
				className: "absolute inset-x-0 bottom-10 z-20 max-h-[min(420px,46%)] overflow-y-auto border-t border-border bg-bg shadow-[var(--shadow-border)]",
				children: intel
			}) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: deskRef,
		"data-markets-desk": true,
		"data-term-fs": fs ? "1" : "0",
		className: cn("flex min-h-0 flex-1 flex-col bg-bg", fs && "h-dvh", fallback && "kosh-term-fs"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-2 py-1.5 sm:px-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-0.5 rounded-sm bg-bg-elevated p-0.5",
					children: [
						[
							1,
							Square,
							"1 chart"
						],
						[
							2,
							Columns2,
							"2 charts"
						],
						[
							4,
							LayoutGrid,
							"4 charts"
						]
					].map(([n, Icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-layout": n,
							disabled: !wide && n !== 1,
							"aria-label": label,
							onClick: () => patchDesk({
								layout: n,
								activePane: n === 1 ? 0 : desk.activePane < n ? desk.activePane : 0
							}),
							className: cn("grid size-8 place-items-center rounded-[6px]", layout === n ? "bg-surface text-fg" : "text-muted hover:text-fg", !wide && n !== 1 && "opacity-40"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
						})
					}, n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-0.5 rounded-sm bg-bg-elevated p-0.5",
					role: "group",
					"aria-label": "Chart height",
					children: [
						[
							"compact",
							"S",
							TERM_HEIGHT.compact
						],
						[
							"standard",
							"M",
							TERM_HEIGHT.standard
						],
						[
							"tall",
							"L",
							TERM_HEIGHT.tall
						]
					].map(([name, label, px]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `${name} chart height`,
						"aria-pressed": termHeightName(termHeight) === name,
						disabled: fs,
						onClick: () => patchChartPrefs({ termHeight: px }),
						className: cn("h-8 min-w-8 rounded-[6px] px-2 text-[11px] font-medium", termHeightName(termHeight) === name ? "bg-surface text-fg" : "text-muted hover:text-fg", fs && "opacity-40"),
						children: label
					}, name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: watchOpen ? "Close watchlist" : "Open watchlist",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": watchOpen ? "Close watchlist" : "Open watchlist",
						onClick: () => setWatchOpen((v) => !v),
						className: cn("h-8 rounded-sm px-2 text-[11px] font-medium", watchOpen ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
						children: "Watchlist"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-sync-tf": true,
					onClick: () => patchDesk({ syncTf: !desk.syncTf }),
					className: cn("h-8 rounded-sm px-2 text-[11px] font-medium", desk.syncTf ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
					children: "Sync TF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => patchDesk({ style: desk.style === "candle" ? "line" : "candle" }),
					className: "h-8 rounded-sm px-2 text-[11px] font-medium text-muted hover:text-fg",
					children: desk.style === "candle" ? "Candles" : "Line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-session-chip": true,
					className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", fresh.state === "live" ? "bg-up/15 text-up" : fresh.state === "off" ? "bg-down/15 text-down" : "bg-surface-2 text-muted"),
					title: fresh.title,
					children: fresh.state === "live" || fresh.state === "delayed" || fresh.state === "stale" ? `● ${fresh.label} · ${istClock()}` : fresh.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					content: fs ? "Exit fullscreen" : "Fullscreen",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": fs ? "Exit fullscreen" : "Fullscreen",
						"data-term-fullscreen": true,
						onClick: () => void toggleFs(),
						className: "ml-auto grid size-8 place-items-center rounded-sm text-muted hover:text-fg",
						children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" })
					})
				})
			]
		}), wide && watchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
			orientation: "horizontal",
			className: "min-h-0 flex-1",
			defaultLayout: DESK_SPLIT,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "main",
					minSize: "42%",
					className: "min-h-0 overflow-hidden",
					children: mainCol
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-px bg-border hover:bg-fg/30" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "watch",
					minSize: "18%",
					className: "min-h-0 overflow-hidden",
					children: watchEl
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col overflow-hidden",
			children: [mainCol, !wide && watchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-[280px] border-t border-border",
				children: watchEl
			}) : null]
		})]
	});
}
function MarketsSwitch({ view }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-markets-switch": true,
		className: "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Markets"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/markets",
					search: { view: "terminal" },
					"aria-current": view === "terminal" ? "page" : void 0,
					className: cn("inline-flex h-9 items-center rounded-sm px-3 text-[13px] font-semibold", view === "terminal" ? "bg-surface text-fg shadow-[var(--shadow-border)] ring-1 ring-fg/25" : "text-muted hover:text-fg"),
					children: "★ Terminal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/markets",
					search: { view: "overview" },
					"aria-current": view === "overview" ? "page" : void 0,
					className: cn("inline-flex h-9 items-center rounded-sm px-3 text-[13px] font-medium", view === "overview" ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
					children: "Overview"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "ml-auto hidden text-[11px] text-subtle md:block",
				children: view === "terminal" ? "Charts and watchlists" : "How the cash market looks today"
			})
		]
	});
}
function Markets() {
	const { view } = Route$36.useSearch();
	const layout = useAppLayout();
	const terminal = view !== "overview";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		full: terminal,
		children: terminal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsSwitch, { view: "terminal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsDesk, {})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsSwitch, { view: "overview" }), layout === "classic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassicOverview, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketOverview, {})] })
	});
}
//#endregion
export { Markets as component, markets_DjP4Q_1T_exports as n, TermChart$1 as t };
