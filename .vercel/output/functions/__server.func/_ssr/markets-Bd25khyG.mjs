import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Columns2, M as ChevronUp, P as ChevronDown, T as LayoutGrid, d as RotateCcw, f as Plus, i as Trash2, o as Star, s as Square, w as List, x as Maximize2, y as Minimize2 } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { A as NEWS_BUCKETS, An as termFetchSpec, Cn as rsi, Fn as vwap, Ft as formatShPeriod, It as stakeDelta, K as fmtPct, N as newsMaterial, Tn as sma, Vt as formatFinPeriod, _n as patchLastBar, bn as quoteStatus, d as pickScreenRow, dn as fmtVol, fn as isWatched, in as TERM_INTERVALS, j as filterNews, jn as useKosh, kn as termBars, mn as macd, on as bareSymbol, q as fmtPx, qn as cn, qt as universeName, sn as bollinger, un as ema, xn as quoteStatusLabel, yn as quoteMap } from "./router-CuH7ax2z.mjs";
import { f as apiScreener, l as apiOhlc, r as apiFundamentals, s as apiNews, u as apiQuotes } from "./api-DtVFWAsH.mjs";
import { n as isIstSession, r as istClock, t as AppShell } from "./app-shell-Bi7zeCef.mjs";
import { a as buildSnapshot, i as WordChip, o as buildValuationModels, s as earningsQualityRead } from "./kosh-snapshot-BR3rEMfL.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-Bd25khyG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UP = "var(--color-up)";
var DOWN = "var(--color-down)";
var GRID = "var(--color-border)";
var MUTED = "var(--color-subtle)";
var CHART = "var(--color-chart)";
var WARN = "var(--color-warn)";
var PAD = {
	l: 52,
	r: 12,
	t: 10,
	b: 20
};
var VOL_H = 36;
var OSC_H = 44;
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
function TermChart({ symbol, name, interval, quote, active, style, owned, onActivate, onInterval }) {
	const spec = termFetchSpec(interval);
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
	const raw = ohlc.data?.bars || [];
	const hist = (0, import_react.useMemo)(() => termBars(raw, spec), [raw, spec]);
	const bars = (0, import_react.useMemo)(() => quote && quote.price > 0 ? patchLastBar(hist, quote, spec) : hist, [
		hist,
		quote,
		spec
	]);
	const px = quote?.price && quote.price > 0 ? quote.price : ohlc.data?.price || bars.at(-1)?.c || 0;
	const chg = quote?.changePct ?? ohlc.data?.changePct ?? 0;
	const status = quoteStatus({
		session,
		price: px,
		retrievedAt: quote?.retrievedAt
	});
	const missing = Boolean(ohlc.data?.missing) || !ohlc.isPending && bars.length < 2;
	const volMissing = bars.length > 0 && bars.every((b) => !(b.v > 0));
	const exch = /BSE|Bombay/i.test(ohlc.data?.exchange || "") ? "BSE" : "NSE";
	const watch = useKosh((s) => s.watch);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const watched = isWatched(symbol, watch);
	const wrap = (0, import_react.useRef)(null);
	const [size, setSize] = (0, import_react.useState)({
		w: 640,
		h: 320
	});
	const [view, setView] = (0, import_react.useState)({
		start: 0,
		count: TF_VIEW[interval] || 180
	});
	const [hover, setHover] = (0, import_react.useState)(null);
	const [fs, setFs] = (0, import_react.useState)(false);
	const [inds, setInds] = (0, import_react.useState)({
		sma20: false,
		ema21: false,
		bb: false,
		vwap: false,
		rsi: false,
		macd: false
	});
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = wrap.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const r = el.getBoundingClientRect();
			setSize({
				w: Math.max(220, r.width),
				h: Math.max(160, r.height)
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
		setHover(null);
	}, [
		symbol,
		interval,
		bars.length
	]);
	const oscOn = inds.rsi || inds.macd;
	const plotH = Math.max(80, size.h - PAD.t - PAD.b - VOL_H - (oscOn ? 52 : 0));
	const innerW = Math.max(40, size.w - PAD.l - PAD.r);
	const shown = bars.slice(view.start, view.start + view.count);
	const n = shown.length;
	const lo0 = shown.reduce((m, b) => Math.min(m, b.l), Infinity);
	const hi0 = shown.reduce((m, b) => Math.max(m, b.h), -Infinity);
	const pad = (hi0 - lo0) * .04 || 1;
	const lo = Number.isFinite(lo0) ? lo0 - pad : 0;
	const hi = Number.isFinite(hi0) ? hi0 + pad : 1;
	const span = hi - lo || 1;
	const yPx = (p) => PAD.t + (hi - p) / span * plotH;
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
	const maxVol = shown.reduce((m, b) => Math.max(m, b.v || 0), 0) || 1;
	const cur = shown[hover != null && shown[hover] ? hover : n - 1];
	function fit() {
		setView({
			start: 0,
			count: Math.max(2, bars.length)
		});
	}
	function latest() {
		const count = Math.min(bars.length, TF_VIEW[interval] || 180);
		setView({
			start: Math.max(0, bars.length - count),
			count
		});
	}
	function onWheel(e) {
		e.preventDefault();
		const dir = e.deltaY > 0 ? 1.18 : .85;
		const nextCount = Math.max(20, Math.min(bars.length, Math.round(view.count * dir)));
		const rect = wrap.current?.getBoundingClientRect();
		const frac = rect ? Math.min(1, Math.max(0, (e.clientX - rect.left - PAD.l) / innerW)) : .5;
		const anchor = view.start + frac * view.count;
		const start = Math.max(0, Math.min(bars.length - nextCount, Math.round(anchor - frac * nextCount)));
		setView({
			start,
			count: nextCount
		});
	}
	function idxAt(clientX) {
		const rect = wrap.current?.getBoundingClientRect();
		if (!rect || n < 1) return 0;
		const x = clientX - rect.left - PAD.l;
		const i = Math.floor(x / innerW * n);
		return Math.max(0, Math.min(n - 1, i));
	}
	function poly(vals, color) {
		const pts = [];
		vals.forEach((v, i) => {
			if (v == null || !Number.isFinite(v)) return;
			pts.push(`${xAt(i).toFixed(1)},${yPx(v).toFixed(1)}`);
		});
		if (pts.length < 2) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: color,
			strokeWidth: "1.2",
			points: pts.join(" "),
			vectorEffect: "nonScalingStroke"
		});
	}
	const ticks = 4;
	const yTicks = Array.from({ length: 5 }, (_, i) => hi - span * i / ticks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-term-chart": symbol,
		onClick: onActivate,
		className: cn("flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-bg", active ? "ring-1 ring-fg/25" : "ring-1 ring-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5 sm:px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "truncate text-[14px] font-semibold leading-tight",
									children: bareSymbol(symbol)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-[10px] tracking-[0.06em] text-subtle uppercase sm:inline",
									children: exch
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "hidden max-w-[220px] truncate text-[11px] text-muted sm:block",
								children: name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[15px] font-semibold tabular sm:text-[16px]",
							children: fmtPx(px)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono text-[12px] tabular", chg >= 0 ? "text-up" : "text-down"),
							children: fmtPct(chg)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-status": status,
							title: "Latest print Kosh has. Refreshes during the cash session. Not a guaranteed live tick.",
							className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down"),
							children: status === "session" ? `● ${quoteStatusLabel(status)} · ${istClock()}` : quoteStatusLabel(status)
						}),
						owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted",
							children: owned
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": watched ? "Remove from watch" : "Add to watch",
							className: cn("ml-auto grid size-7 place-items-center sm:ml-0", watched ? "text-warn" : "text-muted hover:text-fg"),
							onClick: (e) => {
								e.stopPropagation();
								toggleWatch(symbol);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", watched && "fill-current") })
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
				ref: wrap,
				className: "relative min-h-0 flex-1 cursor-crosshair",
				onWheel,
				onPointerDown: (e) => {
					onActivate();
					drag.current = {
						x: e.clientX,
						start: view.start
					};
					e.currentTarget.setPointerCapture(e.pointerId);
				},
				onPointerMove: (e) => {
					setHover(idxAt(e.clientX));
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
				},
				onPointerLeave: () => setHover(null),
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
								x: PAD.l - 6,
								y: yPx(p) + 3,
								textAnchor: "end",
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
							cur && hover != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: xAt(hover),
								x2: xAt(hover),
								y1: PAD.t,
								y2: PAD.t + plotH + VOL_H,
								stroke: MUTED,
								strokeDasharray: "3 3"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: PAD.l,
								x2: size.w - PAD.r,
								y1: yPx(cur.c),
								y2: yPx(cur.c),
								stroke: MUTED,
								strokeDasharray: "3 3"
							})] }) : null
						]
					}),
					cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute left-14 top-2 font-mono text-[11px] text-muted",
						children: [
							fmtWhen(cur.t, spec.intra),
							" · O ",
							fmtPx(cur.o),
							" H ",
							fmtPx(cur.h),
							" L ",
							fmtPx(cur.l),
							" C ",
							fmtPx(cur.c),
							volMissing ? " · Volume unavailable" : ` · Vol ${fmtVol(cur.v)}`
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-2 top-2 flex gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Fit",
								onClick: fit,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Latest",
								onClick: latest,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Fullscreen",
								onClick: () => {
									const el = wrap.current?.parentElement;
									if (!el) return;
									if (document.fullscreenElement) {
										document.exitFullscreen();
										setFs(false);
									} else {
										el.requestFullscreen();
										setFs(true);
									}
								},
								children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" })
							})
						]
					})
				]
			}),
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
function IconBtn({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick: (e) => {
			e.stopPropagation();
			onClick();
		},
		className: "grid size-7 place-items-center rounded-sm bg-bg/80 text-muted hover:text-fg",
		children
	});
}
function WatchPane({ quotes, activeSymbol, owned, onPick }) {
	const lists = useKosh((s) => s.watchlists);
	const activeId = useKosh((s) => s.activeWatchId);
	const watch = useKosh((s) => s.watch);
	const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
	const addWatchList = useKosh((s) => s.addWatchList);
	const renameWatchList = useKosh((s) => s.renameWatchList);
	const deleteWatchList = useKosh((s) => s.deleteWatchList);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const moveWatch = useKosh((s) => s.moveWatch);
	const recents = useKosh((s) => s.recents);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)("");
	const qmap = (0, import_react.useMemo)(() => quoteMap(quotes), [quotes]);
	const active = lists.find((l) => l.id === activeId) || lists[0];
	function create() {
		const n = newName.trim();
		if (!n) return;
		addWatchList(n);
		setNewName("");
		setCreating(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"data-watch-pane": true,
		className: "flex h-full min-h-0 min-w-0 flex-col bg-bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-11 shrink-0 items-center gap-2 border-b border-border px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Watchlists"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "New list",
					className: "ml-auto grid size-7 place-items-center text-muted hover:text-fg",
					onClick: () => setCreating(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-1.5",
				children: lists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveWatchId(l.id),
					onDoubleClick: () => {
						const n = window.prompt("Rename list", l.name);
						if (n?.trim()) renameWatchList(l.id, n.trim());
					},
					className: cn("h-7 shrink-0 rounded-sm px-2 text-[12px] font-medium", l.id === activeId ? "bg-surface text-fg" : "text-muted hover:text-fg"),
					children: l.name
				}, l.id))
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
			active && lists.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-end px-2 pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-7 items-center gap-1 px-1.5 text-[11px] text-muted hover:text-down",
					onClick: () => {
						if (window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), "Delete list"]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: !watch.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "px-3 py-6 text-center text-[12px] text-muted",
					children: ["Search a name and pin it, or open a stock and add it to this list.", recents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
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
				}) : watch.map((s, i) => {
					const k = bareSymbol(s);
					const q = qmap.get(k);
					const name = q?.name || universeName(k) || k;
					const on = bareSymbol(activeSymbol) === k;
					const chg = q?.changePct ?? 0;
					const badge = owned[k];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("border-b border-border/70", on && "bg-surface"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-stretch",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-watch-row": k,
									onClick: () => onPick(k, name),
									className: "grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13px] font-semibold",
												children: k
											}), badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-sm bg-surface-2 px-1 py-px text-[9px] tracking-[0.04em] text-muted uppercase",
												children: badge
											}) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-[10px] text-subtle",
											children: name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-mono text-[13px] tabular",
											children: q ? fmtPx(q.price) : "—"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("block font-mono text-[11px] tabular", chg >= 0 ? "text-up" : "text-down"),
											children: q ? fmtPct(chg) : ""
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col justify-center pr-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": "Move up",
										className: "grid size-6 place-items-center text-subtle hover:text-fg disabled:opacity-30",
										disabled: i === 0,
										onClick: () => moveWatch(i, i - 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": "Move down",
										className: "grid size-6 place-items-center text-subtle hover:text-fg disabled:opacity-30",
										disabled: i === watch.length - 1,
										onClick: () => moveWatch(i, i + 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `Remove ${k}`,
									className: "grid w-7 place-items-center text-subtle hover:text-down",
									onClick: () => toggleWatch(k),
									children: "×"
								})
							]
						})
					}, k + i);
				})
			})
		]
	});
}
var TABS = [
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
function n(v, f) {
	return v != null && Number.isFinite(v) ? f(v) : "—";
}
function IntelPanel({ symbol, name, quote, owned, tab, onTab }) {
	const skillReads = useKosh((s) => s.skillReads);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-intel-panel": true,
		className: "flex h-full min-h-0 flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2",
			children: [TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-intel-tab": t.id,
				onClick: () => onTab(t.id),
				className: cn("h-10 shrink-0 px-2.5 text-[12px] font-medium", active === t.id ? "border-b-2 border-fg text-fg" : "text-muted hover:text-fg"),
				children: t.label
			}, t.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/s/$symbol",
				params: { symbol },
				className: "ml-auto h-10 shrink-0 px-3 text-[12px] font-medium text-chart hover:text-fg",
				children: "Open full analysis →"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto p-3",
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
		})]
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
	const pes = models.hist.map((h) => h.pe).filter((x) => x != null && x > 0);
	const med = pes.length >= 4 ? [...pes].sort((a, b) => a - b)[Math.floor(pes.length / 2)] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 lg:grid-cols-[1.2fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					label: "P/B",
					value: n(fund?.pb, (x) => x.toFixed(2))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "PEG",
					value: n(fund?.peg, (x) => x.toFixed(2))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
					label: "Reverse",
					value: reverse?.figure || "—"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: "Kosh valuation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: simple.word })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] leading-relaxed text-muted",
				children: simple.body || simple.figure
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-subtle",
				children: simple.note
			})
		] })]
	});
}
function GrowthTab({ fund }) {
	if (!fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Insufficient data."
	});
	const sales = fund.sales?.slice(-6) || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-1.5 sm:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Sales 1Y",
				value: n(fund.salesYoY, (x) => fmtPct(x)),
				tone: fund.salesYoY != null ? fund.salesYoY >= 0 ? "up" : "down" : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Profit 1Y",
				value: n(fund.profitYoY, (x) => fmtPct(x)),
				tone: fund.profitYoY != null ? fund.profitYoY >= 0 ? "up" : "down" : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Sales 3Y",
				value: n(fund.salesCagr3, (x) => fmtPct(x))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "Profit 3Y",
				value: n(fund.profitCagr3, (x) => fmtPct(x))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "OPM",
				value: n(fund.opm, (x) => x.toFixed(1) + "%")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
				label: "ROCE",
				value: n(fund.roce, (x) => x.toFixed(1) + "%")
			})
		]
	}), sales.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-3 text-[12px] text-muted",
		children: ["Revenue print: ", sales.map((s) => `${formatFinPeriod(s.period)} ₹${s.value.toLocaleString("en-IN")} Cr`).join(" · ")]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-[12px] text-subtle",
		children: "Not enough yearly points for a trend."
	})] });
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
		className: "space-y-1.5",
		children: shown.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: it.link,
			target: "_blank",
			rel: "noreferrer",
			className: "block text-[13px] leading-snug hover:text-chart",
			children: [it.title, newsMaterial(it.title) === "high" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 text-[10px] text-warn",
				children: "Material"
			}) : null]
		}) }, i))
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
function MarketsDesk() {
	const desk = useKosh((s) => s.desk);
	const patchDesk = useKosh((s) => s.patchDesk);
	const setDeskPane = useKosh((s) => s.setDeskPane);
	const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
	const watch = useKosh((s) => s.watch);
	const ports = useKosh((s) => s.portfolios);
	const [wide, setWide] = (0, import_react.useState)(true);
	const [watchOpen, setWatchOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const m = window.matchMedia("(min-width: 1024px)");
		const fn = () => setWide(m.matches);
		fn();
		m.addEventListener("change", fn);
		return () => m.removeEventListener("change", fn);
	}, []);
	const layout = wide ? desk.layout : 1;
	const visible = desk.panes.slice(0, layout);
	const liveSyms = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		for (const p of visible) s.add(bareSymbol(p.symbol));
		for (const w of watch) s.add(bareSymbol(w));
		return [...s].filter(Boolean).slice(0, 48);
	}, [visible.map((p) => p.symbol).join(","), watch.join(",")]);
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
	const tapeStatus = quoteStatus({
		session,
		price: activeQ?.price || quotesQ.data?.find((q) => q.price > 0)?.price || 0
	});
	const workspace = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-0 min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid h-full min-h-0 min-w-0 flex-1 auto-rows-fr gap-px bg-border", layout === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"),
			children: visible.map((pane, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermChart, {
				symbol: pane.symbol,
				name: pane.name,
				interval: pane.interval,
				quote: qmap.get(bareSymbol(pane.symbol)),
				active: desk.activePane === i,
				style: desk.style,
				owned: notes[bareSymbol(pane.symbol)]?.badge || null,
				onActivate: () => patchDesk({ activePane: i }),
				onInterval: (id) => setDeskPane(i, { interval: id })
			}, pane.symbol + "-" + i))
		})
	});
	const watchEl = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchPane, {
		quotes: quotesQ.data,
		activeSymbol: active.symbol,
		owned: Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, v.badge])),
		onPick: (symbol, name) => {
			setDeskSymbol(symbol, name);
			setWatchOpen(false);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-markets-desk": true,
		className: "flex min-h-0 flex-1 flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-2 py-1.5 sm:px-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Markets"
				}),
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
					].map(([n, Icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
					}, n))
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
					className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", tapeStatus === "session" ? "bg-up/15 text-up" : tapeStatus === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down"),
					title: "Latest print Kosh has. Refreshes during the cash session.",
					children: tapeStatus === "session" ? `● ${quoteStatusLabel(tapeStatus)} · ${istClock()}` : quoteStatusLabel(tapeStatus)
				}),
				!wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ml-auto inline-flex h-8 items-center gap-1 rounded-sm bg-surface px-2 text-[12px]",
					onClick: () => setWatchOpen((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" }), "Watch"]
				}) : null
			]
		}), wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
			orientation: "vertical",
			className: "min-h-0 flex-1",
			defaultLayout: {
				work: 70,
				intel: 30
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "work",
					minSize: "28%",
					className: "min-h-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
						orientation: "horizontal",
						className: "h-full min-h-0",
						defaultLayout: {
							chart: 76,
							watch: 24
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								id: "chart",
								minSize: "40%",
								className: "min-h-0",
								children: workspace
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-px bg-border hover:bg-fg/30" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								id: "watch",
								minSize: "16%",
								className: "min-h-0",
								children: watchEl
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "h-px bg-border hover:bg-fg/30" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
					id: "intel",
					minSize: "16%",
					className: "min-h-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelPanel, {
						symbol: active.symbol,
						name: active.name,
						quote: activeQ,
						owned: notes[bareSymbol(active.symbol)]?.line || null,
						tab: desk.intelTab,
						onTab: (id) => patchDesk({ intelTab: id })
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1",
					children: workspace
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[210px] shrink-0 border-t border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelPanel, {
						symbol: active.symbol,
						name: active.name,
						quote: activeQ,
						owned: notes[bareSymbol(active.symbol)]?.line || null,
						tab: desk.intelTab,
						onTab: (id) => patchDesk({ intelTab: id })
					})
				}),
				watchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-y-0 right-0 z-20 w-[min(100%,280px)] border-l border-border bg-bg-elevated shadow-[var(--shadow-border)]",
					children: watchEl
				}) : null
			]
		})]
	});
}
function Markets() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		full: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsDesk, {})
	});
}
//#endregion
export { Markets as component };
