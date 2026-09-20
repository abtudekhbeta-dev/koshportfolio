import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Crosshair, F as ArrowUpRight, L as ArrowDownRight, N as ChevronDown, T as Layers, c as Spline, d as RotateCcw, f as Plus, g as MousePointer2, h as MoveRight, i as Trash2, j as ChevronUp, k as Columns2, n as Undo2, o as Star, s as Square, v as Minus, w as LayoutGrid, x as Maximize2, y as Minimize2 } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { At as formatShPeriod, B as fmtPx, C as NEWS_BUCKETS, Cn as quoteStatus, Ct as Route$33, E as newsMaterial, En as rsi, Mn as termBars, Nn as termFetchSpec, On as sma, Pn as useKosh, Rn as vwap, Sn as quoteMap, T as newsBucket, Ut as formatFinPeriod, Xn as cn, Xt as universeName, _n as macd, bn as patchLastBar, f as pickScreenRow, fn as drawKey, h as sectorPulse, hn as isWatched, jt as stakeDelta, ln as bareSymbol, mn as fmtVol, o as applyScreen, pn as ema, sn as TERM_INTERVALS, un as bollinger, w as filterNews, wn as quoteStatusLabel, yn as newDrawId, z as fmtPct } from "./router-CreVHe0E.mjs";
import { f as apiScreener, g as apiTape, l as apiOhlc, r as apiFundamentals, s as apiNews, u as apiQuotes } from "./api-DtVFWAsH.mjs";
import { n as canOpenStock } from "./stock-link-ClZslyKN.mjs";
import { n as isIstSession, r as istClock, t as AppShell } from "./app-shell-BLNoA_bO.mjs";
import { t as MixNudge } from "./mix-nudge-C56dcAsh.mjs";
import { r as MiniBars, t as BreadthBar } from "./share-ring-Di5XIyOX.mjs";
import { n as MacroBoard, r as MarketTempCard, t as EventCalendar } from "./macro-board-BLKgogpb.mjs";
import { o as PulseDesk, r as NewsBoard } from "./note-desk-Br64EQoe.mjs";
import { a as applyDrag, c as detectPatterns, f as patternStatusLabel, i as WordChip, l as earningsQualityRead, o as buildSnapshot, s as buildValuationModels, u as hitTest } from "./kosh-snapshot-ZYphxZ2v.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-C6WiFqsf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function MarketOverview() {
	const liveSession = isIstSession();
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: liveSession ? 2500 : 3e4,
		refetchInterval: () => isIstSession() ? 5e3 : 6e4
	});
	const ports = useKosh((s) => s.portfolios);
	const watch = useKosh((s) => s.watch);
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
	const portRows = overlayQuotes(liveRows.filter((r) => portSyms.includes(r.symbol)), quotes.data).sort((a, b) => b.changePct - a.changePct);
	const watchRows = overlayQuotes(liveRows.filter((r) => watchSyms.includes(r.symbol)), quotes.data).sort((a, b) => b.changePct - a.changePct);
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
		className: "mx-auto grid max-w-6xl gap-6 px-3 py-5 sm:px-4 sm:py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[22px] font-semibold tracking-tight",
					children: "Indian market overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
					children: "Indices, breadth, movers, and Pulse — what the cash market is doing today. Open Terminal to watch a name."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
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
					return canOpenStock(t.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$symbol",
						params: { symbol: t.symbol },
						className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
						children: inner
					}, t.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
						children: inner
					}, t.id);
				})
			})] }),
			ports.some((p) => p.holdings.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Your holdings today"
				}), portRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-1 sm:grid-cols-2",
					children: portRows.slice(0, 8).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/s/$symbol",
						params: { symbol: r.symbol },
						className: "flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-[13px]",
							children: r.name || r.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("ml-3 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down"),
							children: fmtPct(r.changePct)
						})]
					}) }, r.symbol))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
			watchRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Watch"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/watch",
						className: "text-[12px] text-chart hover:underline",
						children: "Full watch"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-1 sm:grid-cols-2",
					children: watchRows.slice(0, 8).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/s/$symbol",
						params: { symbol: r.symbol },
						className: "flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-[13px]",
							children: r.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("ml-3 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down"),
							children: fmtPct(r.changePct)
						})]
					}) }, r.symbol))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Sectors"
				}),
				sectors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6",
					children: sectors.slice(0, 12).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-sm px-2 py-2 text-center", s.avg >= 0 ? "bg-up/20" : "bg-down/20"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-[11px] font-medium",
							children: s.sector
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono text-[12px] tabular", s.avg >= 0 ? "text-up" : "text-down"),
							children: fmtPct(s.avg)
						})]
					}, s.sector))
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
var UP = "var(--color-up)";
var DOWN = "var(--color-down)";
var GRID = "var(--color-border)";
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
var TOOLS = [
	{
		id: "crosshair",
		label: "Crosshair",
		icon: Crosshair
	},
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
function TermChart({ symbol, name, interval, quote, active, style, owned, onActivate, onInterval, onStyle, onPatterns }) {
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
	const logScale = useKosh((s) => s.chartPrefs.logScale);
	const patternsOn = useKosh((s) => s.chartPrefs.patternsOn === true);
	const patchChartPrefs = useKosh((s) => s.patchChartPrefs);
	const drawings = useKosh((s) => s.drawings);
	const setDrawings = useKosh((s) => s.setDrawings);
	const dKey = drawKey(symbol, drawIv(interval));
	const shapes = drawings[dKey] || [];
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
	const [tool, setTool] = (0, import_react.useState)("pan");
	const [drawOpen, setDrawOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const drag = (0, import_react.useRef)(null);
	const move = (0, import_react.useRef)(null);
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
		setDraft(null);
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
	const patterns = (0, import_react.useMemo)(() => patternsOn && shown.length >= 24 ? detectPatterns(shown) : [], [shown, patternsOn]);
	(0, import_react.useEffect)(() => {
		if (active) onPatterns?.(patterns);
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
		const i = idxAt(clientX);
		return {
			x,
			y,
			i,
			t: shown[i]?.t || 0,
			p: yInv(y)
		};
	}
	function onWheel(e) {
		e.preventDefault();
		if (bars.length < 20) return;
		const i = idxAt(e.clientX);
		const nextCount = Math.max(20, Math.min(bars.length, Math.round(view.count * (e.deltaY > 0 ? 1.18 : .82))));
		const center = view.start + i;
		const nextStart = Math.max(0, Math.min(bars.length - nextCount, Math.round(center - i / Math.max(1, view.count) * nextCount)));
		setView({
			start: nextStart,
			count: nextCount
		});
	}
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
	function save(next) {
		setDrawings(dKey, next);
	}
	const cur = (hover != null ? shown[hover] : shown[n - 1]) || shown[n - 1];
	const last = shown[n - 1];
	const lastUp = last && last.c >= last.o;
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
		"data-active": active ? "1" : "0",
		onClick: onActivate,
		className: cn("flex h-full min-h-0 min-w-0 flex-col bg-bg", active && "ring-1 ring-inset ring-accent/50"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 flex-col gap-1 border-b border-border px-2 py-1.5 sm:flex-row sm:items-center sm:gap-2",
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
							className: "hidden min-w-0 truncate text-[11px] text-muted lg:inline",
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
							className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down"),
							title: "Latest print Kosh has. Refreshes during the cash session.",
							children: status === "session" ? `● ${quoteStatusLabel(status)} · ${istClock()}` : quoteStatusLabel(status)
						}),
						owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted lg:inline",
							children: owned
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": watched ? "Remove from watch" : "Add to watch",
							onClick: (e) => {
								e.stopPropagation();
								toggleWatch(symbol);
							},
							className: cn("grid size-7 place-items-center", watched ? "text-warn" : "text-subtle hover:text-fg"),
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
							setDrawOpen((v) => !v);
						},
						className: cn("h-7 rounded-sm px-2 text-[11px] font-medium", drawOpen || tool !== "pan" && tool !== "crosshair" ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
						children: "Draw"
					}),
					drawOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-0.5",
						children: [
							TOOLS.map((t) => {
								const Icon = t.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t.label,
									title: t.label,
									onClick: (e) => {
										e.stopPropagation();
										setTool(t.id);
										setDraft(null);
									},
									className: cn("grid size-7 place-items-center rounded-sm", tool === t.id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
								}, t.id);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Undo drawing",
								className: "grid size-7 place-items-center text-muted hover:text-fg",
								onClick: (e) => {
									e.stopPropagation();
									save(shapes.slice(0, -1));
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto text-[10px] text-subtle",
						children: [useLog ? "Log scale" : "Linear", " · RAW OHLC"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrap,
				className: cn("relative min-h-0 flex-1", tool === "pan" || tool === "crosshair" ? "cursor-crosshair" : "cursor-cell"),
				onWheel,
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
					const done = {
						...draft,
						t1: pt.t,
						y1: pt.p
					};
					save([...shapes, done]);
					setSelectedId(done.id);
					setDraft(null);
					setTool("pan");
				},
				onPointerMove: (e) => {
					const pt = xyAt(e.clientX, e.clientY);
					setHover(pt.i);
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
							})] }) : null,
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
					cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute left-3 top-2 font-mono text-[11px] text-muted",
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
						className: "absolute right-14 top-2 flex gap-1",
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
	if (!src.length) return xAt(0);
	if (t <= src[0].t) return xAt(0);
	const last = src.length - 1;
	if (t >= src[last].t) return xAt(last);
	let lo = 0;
	let hi = last;
	while (lo < hi) {
		const mid = lo + hi >> 1;
		if (src[mid].t < t) lo = mid + 1;
		else hi = mid;
	}
	const i = lo;
	if (i <= 0) return xAt(0);
	const a = src[i - 1];
	const b = src[i];
	const f = (t - a.t) / (b.t - a.t || 1);
	return xAt(i - 1) + f * (xAt(i) - xAt(i - 1));
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
	if (s.kind === "long" || s.kind === "short") {
		const color = s.kind === "long" ? UP : DOWN;
		const entry = s.y0;
		const other = s.y1 ?? s.y0;
		const pct = entry > 0 ? (other / entry - 1) * 100 : 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0,
				x2: x1,
				y2: y1,
				stroke: color,
				strokeWidth: w
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: x1 + 4,
				y: y1 - 4,
				fill: color,
				fontSize: "10",
				children: [
					s.kind === "long" ? "Long" : "Short",
					" ",
					fmtPx(entry),
					" → ",
					fmtPx(other),
					" ",
					pct >= 0 ? "+" : "",
					pct.toFixed(1),
					"% · measurement"
				]
			}),
			handles
		] });
	}
	if (s.kind === "channel") {
		const off = s.off ?? Math.abs(s.y0) * .012;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: y0,
				x2: x1,
				y2: y1,
				stroke,
				strokeWidth: w
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x0,
				y1: yPx(s.y0 + off),
				x2: x1,
				y2: yPx((s.y1 ?? s.y0) + off),
				stroke,
				strokeWidth: w
			}),
			handles
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
	const ports = useKosh((s) => s.portfolios);
	const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
	const addWatchList = useKosh((s) => s.addWatchList);
	const renameWatchList = useKosh((s) => s.renameWatchList);
	const deleteWatchList = useKosh((s) => s.deleteWatchList);
	const toggleWatch = useKosh((s) => s.toggleWatch);
	const moveWatch = useKosh((s) => s.moveWatch);
	const recents = useKosh((s) => s.recents);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)({
		kind: "watch",
		id: activeId
	});
	const qmap = (0, import_react.useMemo)(() => quoteMap(quotes), [quotes]);
	const port = source.kind === "port" ? ports.find((p) => p.id === source.id) : null;
	const rows = source.kind === "port" ? (port?.holdings || []).map((h) => bareSymbol(h.symbol)).filter(Boolean) : watch;
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
	function portDay(id) {
		const p = ports.find((x) => x.id === id);
		if (!p) return null;
		let total = 0;
		let weighted = 0;
		let n = 0;
		for (const h of p.holdings) {
			const q = qmap.get(bareSymbol(h.symbol));
			if (!q || !(q.price > 0)) continue;
			const v = (h.qty || 0) * q.price;
			total += v;
			weighted += v * (q.changePct || 0);
			n += 1;
		}
		if (!n || !(total > 0)) return null;
		return {
			pct: weighted / total,
			value: total
		};
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
					onClick: () => {
						setActiveWatchId(l.id);
						setSource({
							kind: "watch",
							id: l.id
						});
					},
					onDoubleClick: () => {
						const n = window.prompt("Rename list", l.name);
						if (n?.trim()) renameWatchList(l.id, n.trim());
					},
					className: cn("h-7 shrink-0 rounded-sm px-2 text-[12px] font-medium", source.kind === "watch" && l.id === source.id ? "bg-surface text-fg" : "text-muted hover:text-fg"),
					children: l.name
				}, l.id))
			}),
			ports.some((p) => p.holdings.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 border-b border-border px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-1 text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: "Portfolios"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex flex-col gap-0.5",
					children: ports.filter((p) => p.holdings.length).map((p) => {
						const day = portDay(p.id);
						const on = source.kind === "port" && source.id === p.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSource({
								kind: "port",
								id: p.id
							}),
							className: cn("flex h-8 items-center justify-between rounded-sm px-2 text-left text-[12px]", on ? "bg-surface text-fg" : "text-muted hover:text-fg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: p.name
							}), day ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("ml-2 font-mono tabular", day.pct >= 0 ? "text-up" : "text-down"),
								children: fmtPct(day.pct)
							}) : null]
						}, p.id);
					})
				})]
			}) : null,
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
			source.kind === "watch" && lists.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-end px-2 pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-7 items-center gap-1 px-1.5 text-[11px] text-muted hover:text-down",
					onClick: () => {
						const active = lists.find((l) => l.id === source.id);
						if (active && window.confirm(`Delete ${active.name}?`)) deleteWatchList(active.id);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), "Delete list"]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "px-3 py-6 text-center text-[12px] text-muted",
					children: [source.kind === "port" ? "This mix has no names yet." : "Search a name and pin it, or open a stock and add it to this list.", source.kind === "watch" && recents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
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
				}) : rows.map((s, i) => {
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
							}), source.kind === "watch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
									disabled: i === rows.length - 1,
									onClick: () => moveWatch(i, i + 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${k}`,
								className: "grid w-7 place-items-center text-subtle hover:text-down",
								onClick: () => toggleWatch(k),
								children: "×"
							})] }) : null]
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
	const status = quoteStatus({
		session: isIstSession(),
		price: px
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
		className: "flex h-full min-h-0 flex-col bg-bg",
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
								className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em]", status === "session" ? "bg-up/15 text-up" : status === "last" ? "bg-surface-2 text-muted" : "bg-down/15 text-down"),
								children: quoteStatusLabel(status)
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
			hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-pattern-box": true,
				className: "shrink-0 border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: "Technical"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
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
							h.note,
							" Observed on this timeframe — not a signal or prediction."
						]
					}, h.kind))
				})]
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
	const [hits, setHits] = (0, import_react.useState)([]);
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
				onInterval: (id) => setDeskPane(i, { interval: id }),
				onStyle: (next) => patchDesk({ style: next }),
				onPatterns: desk.activePane === i ? setHits : void 0
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-markets-desk": true,
		className: "flex min-h-0 flex-1 flex-col bg-bg",
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
				})
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
					children: intel
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[min(42vh,320px)] min-h-[220px] shrink-0",
					children: workspace
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[200px] shrink-0 border-t border-border",
					children: watchEl
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-[280px] flex-1 border-t border-border",
					children: intel
				})
			]
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
	const { view } = Route$33.useSearch();
	const terminal = view !== "overview";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		full: terminal,
		children: terminal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsSwitch, { view: "terminal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsDesk, {})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketsSwitch, { view: "overview" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketOverview, {})] })
	});
}
//#endregion
export { Markets as component };
