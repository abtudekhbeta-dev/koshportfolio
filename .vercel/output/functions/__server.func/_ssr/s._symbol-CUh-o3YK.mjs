import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Star } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { D as fmtPct, Dt as retFrom, Gt as Button, I as previewAdd, M as mixCagr, O as fmtPx, P as pathFromBars, Pt as volAvg, R as riskMetrics, T as dash, V as sliceNav, W as windowReturn, Zt as isWatched, an as capFromMcap, ct as metalKey, dt as resolveBench, f as businessView, it as METALS, k as fmtTapePx, ln as sectorOf, n as Route$7, on as cn, q as ytdReturn, qt as bareSymbol, rt as universeName, st as gramToMcx, tn as useKosh, xt as fmtVol } from "./router-oJX0L9_1.mjs";
import { a as apiMacro, c as apiOhlc, d as apiScreener, i as apiHistory, l as apiQuotes, n as apiFundamentals, o as apiNews, r as apiHistories, s as apiNote } from "./api-Dymx0Kns.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./dialog-BiLYCWNJ.mjs";
import { n as isIstSession, t as AppShell } from "./app-shell-DSj9C3kP.mjs";
import { t as NavChart } from "./nav-chart-DE0AKC21.mjs";
import { a as OwnershipBlock, r as FinancialSnapshot } from "./analysis-view-BGr12zyI.mjs";
import { a as ProseNote, i as NoteDesk, r as NewsBoard } from "./news-board-it1UxeTK.mjs";
import { t as BenchPicker } from "./bench-picker-0wyHfs1f.mjs";
import { t as pickPeers } from "./peers-BfRezMB0.mjs";
import { n as Kpi, r as toneOf, t as AttentionStrip } from "./attention-strip-CFJPfd6d.mjs";
import { i as fetchSpec, n as JournalDesk, r as StructureDesk, t as CandleChart } from "./structure-desk-B_8JmxjK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._symbol-CUh-o3YK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					disabled: busy || !q.trim(),
					children: busy ? "Asking…" : "Ask AI"
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
function StockPage() {
	const { symbol } = Route$7.useParams();
	const pushRecent = useKosh((s) => s.pushRecent);
	const ohlc = useQuery({
		queryKey: [
			"ohlc",
			symbol,
			"2y",
			"1d"
		],
		queryFn: () => apiOhlc(symbol, "2y", "1d"),
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
		return {
			ret1w: retFrom(bars, 7),
			ret1m: retFrom(bars, 31),
			ret3m: retFrom(bars, 93),
			ret1y: retFrom(bars, 365),
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
	const listed = pack.firstTrade ? (/* @__PURE__ */ new Date(pack.firstTrade * 1e3)).toISOString().slice(0, 4) : "—";
	const bare = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
	const sector = sectorOf(symbol);
	const mineRow = (screen.data?.rows || []).find((r) => r.symbol === bare);
	const peerPick = pickPeers(bare, screen.data?.rows || [], {
		mcapCr: fund.data?.mcapCr ?? mineRow?.mcapCr,
		pe: fund.data?.pe ?? mineRow?.pe,
		sector
	});
	const peers = peerPick.rows;
	const mine = alerts.filter((a) => a.symbol === bare);
	const cap = capFromMcap(fund.data?.mcapCr ?? mineRow?.mcapCr, symbol);
	const card = businessView(symbol, {
		summary: fund.data?.summary,
		industry: fund.data?.industry,
		ceo: fund.data?.ceo,
		founded: fund.data?.founded,
		website: fund.data?.website
	});
	const site = fund.data?.website || null;
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
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 text-[28px] font-semibold tracking-tight",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[12px] text-muted",
								children: [
									bare,
									" · ",
									pack.exchange || "NSE",
									" · ",
									cap,
									" · listed ",
									listed,
									site ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: site,
										target: "_blank",
										rel: "noreferrer",
										className: "text-chart hover:underline",
										children: host || "Company site"
									})] }) : null
								]
							})] })]
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
				title: "Next 7 days"
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnershipBlock, { fund: fund.data }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								fund: fund.data,
								bare: true,
								price: px
							})
						})
					]
				})]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("grid gap-4 lg:grid-cols-2", tab !== "chart" && "hidden"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructureDesk, { symbol }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalDesk, {
					symbol: bare,
					price: px
				})]
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
					screen.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Peers fill from the live screen once prices are in."
					}) : peers.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[520px] text-left text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: "border-b border-border",
									children: [
										"Name",
										"Price",
										"Today",
										"1M",
										"1Y"
									].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: h
									}, h))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: peers.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60 last:border-0",
								children: [
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
										className: cn("px-3 py-2 font-mono tabular", (r.ret1m ?? 0) >= 0 ? "text-up" : "text-down"),
										children: r.ret1m == null ? "—" : fmtPct(r.ret1m)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: cn("px-3 py-2 font-mono tabular", (r.ret1y ?? 0) >= 0 ? "text-up" : "text-down"),
										children: r.ret1y == null ? "—" : fmtPct(r.ret1y)
									})
								]
							}, r.symbol)) })]
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
					className: "w-full min-w-[420px] text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
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
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: deals.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60 last:border-0",
						children: [
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
						]
					}, d.kind + d.date + d.note.slice(0, 24) + i)) })]
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
