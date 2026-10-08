import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as useNavigate, g as Outlet, p as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as apiSearch } from "./api-BE61nRQk.mjs";
import { r as Route$10 } from "./router-B40wiopi.mjs";
import { O as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as usePortfolio, Qt as useKosh, _n as displayName, b as fmtPct, bn as resolveBench, dt as Button, gn as cn, y as fmtInr } from "./router-B40wiopi2.mjs";
import { n as downloadBookExcel, r as downloadHoldingsExcel, t as AddHoldings } from "./add-holdings-DjK-4NK5.mjs";
import { t as useAppLayout } from "./layout-mode-D5Kaq7vr.mjs";
import { t as AppShell } from "./app-shell-CZbb_-mJ.mjs";
import { n as useBook } from "./use-book-BHFGcNpU.mjs";
import { t as BookProvider } from "./book-context-B8L45u36.mjs";
import { t as EnrichButton } from "./enrich-button-BC0g9W9Q.mjs";
import { t as BenchPicker } from "./bench-picker-LJSmAp5F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id-CRV-Gq7d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExportButton({ name, book, portfolio, holdings }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "secondary",
		onClick: () => {
			try {
				if (book) downloadBookExcel(name, book, portfolio);
				else downloadHoldingsExcel(name, holdings || portfolio?.holdings || []);
				toast.success("Excel downloaded");
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Could not export");
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Excel"]
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-md bg-surface-2", className) });
}
function UnresolvedHoldings({ portfolioId, missing, holdings }) {
	const confirmSymbol = useKosh((s) => s.confirmSymbol);
	const skipSymbol = useKosh((s) => s.skipSymbol);
	const skips = useKosh((s) => s.symbolSkips);
	const [picks, setPicks] = (0, import_react.useState)({});
	const names = (0, import_react.useMemo)(() => {
		const map = new Map(holdings.map((h) => [h.symbol, h]));
		return missing.filter((s) => {
			return map.get(s)?.kind !== "commodity" && !skips.includes(s) && !skips.includes(s.replace(/&/g, "_").replace(/-/g, "_"));
		});
	}, [
		missing,
		holdings,
		skips
	]);
	(0, import_react.useEffect)(() => {
		let on = true;
		(async () => {
			const next = {};
			for (const s of names) {
				const h = holdings.find((x) => x.symbol === s);
				const stem = s.replace(/[-_]SM$/i, "");
				const queries = [...new Set([
					stem,
					s,
					h?.name || ""
				].filter((q) => q && q.length >= 2))];
				const seen = /* @__PURE__ */ new Set();
				const rows = [];
				for (const q of queries) {
					try {
						const quotes = await apiSearch(q);
						for (const x of quotes) {
							const sym = String(x.symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
							if (!sym || seen.has(sym)) continue;
							seen.add(sym);
							rows.push({
								symbol: sym,
								name: x.name || sym
							});
							if (rows.length >= 5) break;
						}
					} catch {}
					if (rows.length >= 5) break;
				}
				next[s] = rows;
			}
			if (on) setPicks((cur) => ({
				...cur,
				...next
			}));
		})();
		return () => {
			on = false;
		};
	}, [names.join("|"), holdings]);
	if (!names.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-5 rounded-lg border-l-[4px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]",
		"data-portfolio": portfolioId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold tracking-[0.14em] text-warn uppercase",
				children: "Couldn’t match these names"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-muted",
				children: "They load when you open them alone, but the portfolio used a different ticker. Pick the listed name so they are included in performance, or skip."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-3",
				children: names.map((s) => {
					const h = holdings.find((x) => x.symbol === s);
					const label = h ? displayName(h) : s;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-sm bg-bg px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium",
							children: [
								label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[12px] text-muted",
									children: s
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: [(picks[s] || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => confirmSymbol(s, p.symbol, p.name || h?.name),
								children: [
									"Use ",
									p.symbol,
									p.name && p.name !== p.symbol ? ` — ${p.name}` : ""
								]
							}, p.symbol)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => skipSymbol(s),
								children: "Skip"
							})]
						})]
					}, s);
				})
			})
		]
	});
}
var TABS = [
	{
		to: "/p/$id",
		label: "Overview",
		exact: true
	},
	{
		to: "/p/$id/path",
		label: "Path"
	},
	{
		to: "/p/$id/performance",
		label: "Performance"
	},
	{
		to: "/p/$id/seasonality",
		label: "Seasonality"
	},
	{
		to: "/p/$id/holdings",
		label: "Holdings"
	},
	{
		to: "/p/$id/improve",
		label: "Improve Portfolio"
	},
	{
		to: "/p/$id/sectors",
		label: "Sectors"
	},
	{
		to: "/p/$id/risk",
		label: "Risk"
	}
];
function PortfolioLayout() {
	const { id } = Route$10.useParams();
	const portfolio = usePortfolio(id);
	const query = useBook(portfolio);
	const setBench = useKosh((s) => s.setBench);
	const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
	const renamePortfolio = useKosh((s) => s.renamePortfolio);
	const deletePortfolio = useKosh((s) => s.deletePortfolio);
	const duplicatePortfolio = useKosh((s) => s.duplicatePortfolio);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const intel = useAppLayout() === "intelligence";
	if (!portfolio) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Portfolio not found."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: "mt-3 inline-block text-sm text-muted underline",
		children: "Back"
	})] });
	const book = query.data;
	const bench = resolveBench(portfolio.bench);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						className: "text-[12px] text-subtle hover:text-muted",
						children: "Portfolios"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "mt-1 block w-full bg-transparent text-[26px] font-semibold tracking-tight outline-none",
						defaultValue: portfolio.name,
						"aria-label": "Portfolio name",
						onBlur: (e) => {
							const v = e.target.value.trim();
							if (v && v !== portfolio.name) renamePortfolio(id, v);
						}
					}),
					book ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-sm text-muted tabular",
						children: [fmtInr(book.value), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("ml-2", book.dayAbs >= 0 ? "text-up" : "text-down"),
							children: [fmtPct(book.dayPct), " today"]
						})]
					}) : query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-40" }) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "switch",
						"aria-checked": portfolio.includeCommodities !== false,
						onClick: () => setIncludeCommodities(id, portfolio.includeCommodities === false),
						className: cn("inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-[12px] shadow-[var(--shadow-border)]", portfolio.includeCommodities === false ? "bg-bg-elevated text-muted" : "bg-surface text-fg"),
						title: "When off, gold and silver stay on Holdings but drop out of totals, risk and the chart.",
						children: ["Gold & silver ", portfolio.includeCommodities === false ? "excluded from totals" : "included in totals"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-[12px] text-muted",
						children: ["Benchmark", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BenchPicker, {
							value: portfolio.bench,
							onChange: (v) => setBench(id, v)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, {
						portfolioId: id,
						trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							children: "Add holdings"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrichButton, { symbols: [...portfolio.holdings.map((h) => h.symbol), ...(portfolio.trades || []).map((t) => t.symbol)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							const nid = duplicatePortfolio(id);
							if (nid) navigate({
								to: "/p/$id",
								params: { id: nid }
							});
						},
						children: "Duplicate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButton, {
						name: portfolio.name,
						book,
						portfolio
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							if (confirm("Delete this portfolio?")) {
								deletePortfolio(id);
								navigate({ to: "/" });
							}
						},
						children: "Delete"
					})
				]
			})]
		}),
		intel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelPortfolioNav, {
			id,
			pathname
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "-mx-3 mb-5 flex gap-1 overflow-x-auto px-3 sm:-mx-4 sm:px-4",
			children: TABS.map((t) => {
				const href = t.to.replace("$id", id);
				const active = t.exact ? pathname === `/p/${id}` || pathname === `/p/${id}/` : pathname.startsWith(href);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: t.to,
					params: { id },
					className: cn("inline-flex h-9 shrink-0 items-center justify-center rounded-sm px-3 text-[13px] font-medium leading-none", active ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
					children: t.label
				}, t.to);
			})
		}),
		book?.missing?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnresolvedHoldings, {
			portfolioId: id,
			missing: book.missing,
			holdings: portfolio.holdings
		}) : null,
		query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]",
			children: [
				"Could not load market data. ",
				query.error.message,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void query.refetch(),
						children: "Retry"
					})
				})
			]
		}) : query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "kosh-page grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-lg" }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[320px] rounded-lg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[12px] text-subtle",
					children: [
						"Loading live prices and full history vs ",
						bench.name,
						"…"
					]
				})
			]
		}) : book ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookProvider, {
			portfolio,
			query,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Add stocks to this portfolio to draw the chart."
		})
	] });
}
var GROUPS = [
	{
		id: "overview",
		label: "Overview",
		links: [{
			to: "/p/$id",
			label: "Overview",
			exact: true
		}]
	},
	{
		id: "performance",
		label: "Performance",
		links: [
			{
				to: "/p/$id/performance",
				label: "Performance"
			},
			{
				to: "/p/$id/risk",
				label: "Risk"
			},
			{
				to: "/p/$id/sectors",
				label: "Sectors"
			},
			{
				to: "/p/$id/seasonality",
				label: "Seasonality"
			}
		]
	},
	{
		id: "decisions",
		label: "Decisions",
		links: [{
			to: "/p/$id/improve",
			label: "Improve"
		}, {
			to: "/p/$id/path",
			label: "Path"
		}]
	},
	{
		id: "holdings",
		label: "Holdings",
		links: [{
			to: "/p/$id/holdings",
			label: "Holdings"
		}]
	}
];
function groupOf(pathname, id) {
	const base = `/p/${id}`;
	if (pathname === base || pathname === `${base}/`) return "overview";
	if (pathname.startsWith(`${base}/performance`) || pathname.startsWith(`${base}/risk`) || pathname.startsWith(`${base}/sectors`) || pathname.startsWith(`${base}/seasonality`)) return "performance";
	if (pathname.startsWith(`${base}/improve`) || pathname.startsWith(`${base}/path`)) return "decisions";
	if (pathname.startsWith(`${base}/holdings`)) return "holdings";
	return "overview";
}
function IntelPortfolioNav({ id, pathname }) {
	const current = groupOf(pathname, id);
	const group = GROUPS.find((g) => g.id === current) || GROUPS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "mb-5 border-b border-border",
		"aria-label": "Portfolio",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-3 flex gap-1 overflow-x-auto px-3",
			children: GROUPS.map((g) => {
				const on = g.id === current;
				const first = g.links[0];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: first.to,
					params: { id },
					className: cn("inline-flex h-9 shrink-0 items-center border-b-2 px-2.5 text-[13px] font-medium", on ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"),
					children: g.label
				}, g.id);
			})
		}), group.links.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-3 flex gap-1 overflow-x-auto px-3 pb-2",
			children: group.links.map((t) => {
				const href = t.to.replace("$id", id);
				const active = "exact" in t && t.exact ? pathname === `/p/${id}` || pathname === `/p/${id}/` : pathname.startsWith(href);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: t.to,
					params: { id },
					className: cn("inline-flex h-8 shrink-0 items-center px-2 text-[12px]", active ? "text-fg" : "text-muted hover:text-fg"),
					children: t.label
				}, t.to);
			})
		}) : null]
	});
}
//#endregion
export { PortfolioLayout as component };
