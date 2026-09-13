import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as fmtPct, O as fmtPx, k as fmtTapePx, on as cn, tn as useKosh } from "./router-oJX0L9_1.mjs";
import { d as apiScreener, m as apiTape, o as apiNews } from "./api-Dymx0Kns.mjs";
import { n as canOpenStock } from "./stock-link-BKmL1OMh.mjs";
import { n as isIstSession, t as AppShell } from "./app-shell-DSj9C3kP.mjs";
import { t as MixNudge } from "./mix-nudge-L9_xJsmW.mjs";
import { i as applyScreen, s as sectorPulse } from "./screens-BehhQ_HG.mjs";
import { o as PulseDesk, r as NewsBoard } from "./news-board-it1UxeTK.mjs";
import { n as MacroBoard, r as MarketTempCard, t as EventCalendar } from "./macro-board-JKpKCt4E.mjs";
import { r as MiniBars, t as BreadthBar } from "./share-ring-DyC4skAT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-CLShZZ2_.js
var import_jsx_runtime = require_jsx_runtime();
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
	const groups = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const g = groups.get(r.sector) || [];
		g.push(r);
		groups.set(r.sector, g);
	}
	const sectors = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Heat fills once prices are in."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4",
		children: sectors.map(([sector, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1.5 flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
				children: sector
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] text-muted tabular",
				children: fmtPct(list.reduce((s, r) => s + r.changePct, 0) / list.length)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
			children: list.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
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
		})] }, sector))
	});
}
function Markets() {
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: isIstSession() ? 2500 : 3e4,
		refetchInterval: isIstSession() ? 5e3 : 6e4
	});
	const ports = useKosh((s) => s.portfolios);
	const watch = useKosh((s) => s.watch);
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const rows = screen.data?.rows || [];
	const up = applyScreen(rows, "up").slice(0, 8);
	const down = applyScreen(rows, "down").slice(0, 8);
	const hot = applyScreen(rows, "hot").slice(0, 6);
	const high = applyScreen(rows, "high").slice(0, 6);
	const sectors = sectorPulse(rows);
	const portSyms = [...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol.toUpperCase().replace(/\.(NS|BO)$/i, ""))))];
	const portRows = rows.filter((r) => portSyms.includes(r.symbol)).sort((a, b) => b.changePct - a.changePct);
	const watchRows = rows.filter((r) => watch.includes(r.symbol)).sort((a, b) => b.changePct - a.changePct);
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
			portRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "In your portfolios"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, { rows: portRows })] }) : null,
			watchRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Watch"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, { rows: watchRows })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Winners"
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Losers"
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/screen",
					className: "text-[12px] text-muted hover:text-fg",
					children: "Open the screen"
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
		className: "mt-2 grid gap-0.5",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/s/$symbol",
			params: { symbol: r.symbol },
			className: "flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: r.symbol
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 truncate text-[12px] text-muted",
					children: r.name
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline gap-3 font-mono text-[13px] tabular",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: fmtPx(r.price)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: r.changePct >= 0 ? "text-up" : "text-down",
					children: fmtPct(r.changePct)
				})]
			})]
		}) }, r.symbol))
	});
}
//#endregion
export { Markets as component };
