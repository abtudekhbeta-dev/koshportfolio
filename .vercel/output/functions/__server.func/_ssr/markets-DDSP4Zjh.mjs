import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Nn as useKosh, Rn as cn, ct as fmtTapePx, h as sectorPulse, o as applyScreen, ot as fmtPct, st as fmtPx } from "./router-COGOfPBd.mjs";
import { f as apiScreener, g as apiTape, s as apiNews, u as apiQuotes } from "./api-DtVFWAsH.mjs";
import { n as canOpenStock } from "./stock-link-ClZslyKN.mjs";
import { n as isIstSession, t as AppShell } from "./app-shell-DwmipUmn.mjs";
import { t as MixNudge } from "./mix-nudge-Bbe3XYN6.mjs";
import { o as PulseDesk, r as NewsBoard } from "./news-board-CYvX8OUZ.mjs";
import { n as MacroBoard, r as MarketTempCard, t as EventCalendar } from "./macro-board-B06NioQw.mjs";
import { r as MiniBars, t as BreadthBar } from "./share-ring-Di5XIyOX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-DDSP4Zjh.js
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
function Markets() {
	const qc = useQueryClient();
	const liveSession = isIstSession();
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: liveSession ? 2500 : 3e4,
		refetchInterval: () => isIstSession() ? 5e3 : 6e4
	});
	const ports = useKosh((s) => s.portfolios);
	const watch = useKosh((s) => s.watch);
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const rows = screen.data?.rows || [];
	const upSeed = applyScreen(rows, "up").slice(0, 12);
	const downSeed = applyScreen(rows, "down").slice(0, 12);
	const hot = applyScreen(rows, "hot").slice(0, 6);
	const high = applyScreen(rows, "high").slice(0, 6);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight",
				children: "Markets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "Indices, breadth, movers, and headlines. Search any listed name from the bar."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
				children: (tape.data || []).slice(0, 8).map((t) => {
					const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: t.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-xl tabular",
							children: t.price ? fmtTapePx(t.price) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("font-mono text-[13px] tabular", t.changePct >= 0 ? "text-up" : "text-down"),
							children: [t.unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-1 text-[11px] text-subtle",
								children: t.unit
							}) : null, t.changePct ? fmtPct(t.changePct) : "—"]
						})
					] });
					return canOpenStock(t.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$symbol",
						params: { symbol: t.symbol },
						className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
						children: inner
					}, t.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
						children: inner
					}, t.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCalendar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Breadth"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[13px] text-muted",
							children: [
								green,
								"/",
								rows.length || "—",
								" advancing on this universe."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadthBar, {
								green,
								n: rows.length || 1
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTempCard, {
								rows,
								focus: [...watch, ...portSyms]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Sectors today"
					}), sectors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: sectors.slice(0, 8).map((s) => ({
						name: s.sector,
						value: s.changePct,
						label: fmtPct(s.changePct),
						tone: s.changePct >= 0 ? "up" : "down"
					})) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Waiting on prices."
					})]
				})]
			}),
			portRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-3 flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: ["In your portfolios", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveHint, { live: liveSession })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, { rows: portRows })] }) : null,
			watchRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-3 flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: ["Watch", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveHint, { live: liveSession })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, { rows: watchRows })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: ["Winners", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveHint, { live: liveSession })]
					}), screen.isPending && !up.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Loading prices…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: up.map((r) => ({
							name: r.symbol,
							sub: r.name,
							symbol: r.symbol,
							value: r.changePct,
							label: fmtPct(r.changePct),
							tone: "up"
						})) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex flex-wrap items-baseline gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: ["Losers", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveHint, { live: liveSession })]
					}), screen.isPending && !down.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Loading prices…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: down.map((r) => ({
							name: r.symbol,
							sub: r.name,
							symbol: r.symbol,
							value: r.changePct,
							label: fmtPct(r.changePct),
							tone: "down"
						})) })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
					title: "Volume spike",
					rows: hot,
					loading: screen.isPending
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
					title: "Near 52-week high",
					rows: high,
					loading: screen.isPending
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Heat"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[12px] text-muted hover:text-fg",
						onClick: () => qc.invalidateQueries({ queryKey: ["screener"] }),
						children: "Refresh heat"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/screen",
						className: "text-[12px] text-muted hover:text-fg",
						children: "Open the screen"
					})]
				})]
			}), screen.isPending && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Loading prices… first pass takes a moment."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketHeat, { rows })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsBoard, {
						title: "Headlines",
						items: news.data,
						loading: news.isPending,
						shareTitle: "Indian market headlines",
						extra: "From Markets",
						alertScope: "markets"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDesk, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixNudge, { where: "markets" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroBoard, {})
		]
	}) });
}
function LiveHint({ live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase", live ? "bg-up/15 text-up" : "bg-surface-2 text-subtle"),
		children: live ? "Live" : "Close"
	});
}
function Board({ title, rows, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: title
		}), loading && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Loading prices… first pass takes a moment."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, { rows })]
	});
}
function NameList({ rows }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: "Nothing here yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 grid",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "kosh-row kosh-row-stack",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$symbol",
				params: { symbol: r.symbol },
				className: "min-w-0 hover:text-chart",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: r.symbol
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 text-[12px] text-muted",
					children: r.name
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex shrink-0 items-baseline gap-3 font-mono text-[13px] tabular",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: fmtPx(r.price)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: r.changePct >= 0 ? "text-up" : "text-down",
					children: fmtPct(r.changePct)
				})]
			})]
		}, r.symbol))
	});
}
//#endregion
export { Markets as component };
