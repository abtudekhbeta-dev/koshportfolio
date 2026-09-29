import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as apiHistories, f as apiQuotes, o as apiHistory } from "./api-BTUsg1u1.mjs";
import { N as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { X as saneDayPnl, b as fmtPct, en as useKosh, mt as Button, q as retFromBars, vn as cn, y as fmtInr } from "./router-D75dEx_h2.mjs";
import { t as AddHoldings } from "./add-holdings-DJ2caCD5.mjs";
import { n as isIstSession, t as AppShell } from "./app-shell-BcNM3_AI.mjs";
import { t as MixNudge } from "./mix-nudge-BEabIkJ1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-BwIythfW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function quoteKey(s) {
	return s.toUpperCase().replace(/\.(NS|BO)$/i, "");
}
function portSnap(holdings, quotes) {
	const map = /* @__PURE__ */ new Map();
	for (const q of quotes) {
		map.set(quoteKey(q.input), q);
		map.set(quoteKey(q.symbol), q);
	}
	let value = 0;
	let invested = 0;
	let knownValue = 0;
	let dayAbs = 0;
	let dayWarn = null;
	for (const h of holdings) {
		const q = map.get(quoteKey(h.symbol));
		const px = q?.price || h.avg || 0;
		const val = h.qty * px;
		value += val;
		if (h.avg != null && h.avg > 0 && Number.isFinite(h.avg)) {
			invested += h.qty * h.avg;
			knownValue += val;
		}
		const day = saneDayPnl(val, q?.changePct || 0);
		dayAbs += day.abs;
		if (day.warn) dayWarn = day.warn;
	}
	return {
		value,
		invested,
		unreal: knownValue - invested,
		dayAbs,
		dayPct: value ? dayAbs / value * 100 : 0,
		dayWarn
	};
}
function port1y(holdings, packs, quotes) {
	const map = /* @__PURE__ */ new Map();
	for (const p of packs) {
		map.set(quoteKey(p.input), p);
		map.set(quoteKey(p.symbol), p);
	}
	const qmap = /* @__PURE__ */ new Map();
	for (const q of quotes) {
		qmap.set(quoteKey(q.input), q);
		qmap.set(quoteKey(q.symbol), q);
	}
	let w = 0;
	let r = 0;
	for (const h of holdings) {
		const pack = map.get(quoteKey(h.symbol));
		const ret = retFromBars(pack?.bars, 180);
		if (ret == null) continue;
		const px = qmap.get(quoteKey(h.symbol))?.price || pack?.price || h.avg || 0;
		const val = h.qty * px;
		if (!(val > 0)) continue;
		w += val;
		r += val * ret;
	}
	return w ? r / w : null;
}
function Home() {
	const ports = useKosh((s) => s.portfolios);
	const renamePortfolio = useKosh((s) => s.renamePortfolio);
	const duplicatePortfolio = useKosh((s) => s.duplicatePortfolio);
	const deletePortfolio = useKosh((s) => s.deletePortfolio);
	const navigate = useNavigate();
	const [renameId, setRenameId] = (0, import_react.useState)(null);
	const symbols = [...new Set(ports.flatMap((p) => p.holdings.map((h) => h.symbol)))];
	const quotes = useQuery({
		queryKey: ["home-quotes", symbols],
		queryFn: () => apiQuotes(symbols),
		enabled: symbols.length > 0,
		staleTime: 15e3,
		refetchInterval: isIstSession() ? 2e4 : 12e4
	});
	const hx = useQuery({
		queryKey: ["home-hx", symbols],
		queryFn: () => apiHistories(symbols.slice(0, 80), "1y"),
		enabled: symbols.length > 0,
		staleTime: 18e5
	});
	const nifty = useQuery({
		queryKey: [
			"hx",
			"^NSEI",
			"1y"
		],
		queryFn: () => apiHistory("^NSEI", "1y"),
		staleTime: 18e5
	});
	const nifty1y = nifty.data?.bars && nifty.data.bars.length > 2 ? (nifty.data.bars.at(-1).c / nifty.data.bars[0].c - 1) * 100 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight",
				children: "Portfolios"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "Open a portfolio to see it versus Nifty. Add gold and silver the same way as stocks."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, { trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "New portfolio" }) })]
		}),
		ports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
			children: ports.map((p) => {
				const snap = quotes.data ? portSnap(p.holdings, quotes.data) : null;
				const port1yN = hx.data ? port1y(p.holdings, hx.data, quotes.data || []) : null;
				const gap = port1yN != null && nifty1y != null ? port1yN - nifty1y : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold tracking-[0.12em] text-subtle uppercase",
							children: "Vs Nifty · 1Y"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/p/$id",
							params: { id: p.id },
							className: "mt-1 block font-medium hover:text-chart",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-1 font-mono text-[18px] tabular", gap == null ? "text-muted" : gap >= 0 ? "text-up" : "text-down"),
							children: gap == null ? "—" : fmtPct(gap)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-subtle",
							children: [port1yN != null ? `Portfolio ${fmtPct(port1yN)}` : "Need 1 year of prices", nifty1y != null ? ` · Nifty ${fmtPct(nifty1y)}` : ""]
						}),
						snap ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-[12px] text-muted tabular",
							children: fmtInr(snap.value)
						}) : null
					]
				}, p.id);
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixNudge, { where: "app" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: ports.length ? ports.map((p) => {
				const snap = quotes.data ? portSnap(p.holdings, quotes.data) : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/p/$id",
						params: { id: p.id },
						className: "min-w-0 flex-1",
						children: [renameId === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							className: "w-full bg-transparent text-[16px] font-medium outline-none",
							defaultValue: p.name,
							onClick: (e) => e.preventDefault(),
							onBlur: (e) => {
								const v = e.target.value.trim();
								if (v) renamePortfolio(p.id, v);
								setRenameId(null);
							},
							onKeyDown: (e) => {
								if (e.key === "Enter") e.target.blur();
							}
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium hover:text-chart",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] text-muted",
							children: [p.holdings.length, " names"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							snap ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[15px] font-medium tabular",
									children: fmtInr(snap.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("font-mono text-[12px] tabular", snap.dayAbs >= 0 ? "text-up" : "text-down"),
									children: [fmtPct(snap.dayPct), " today"]
								})]
							}) : quotes.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-24 animate-pulse rounded-sm bg-surface-2" }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, {
								portfolioId: p.id,
								trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									children: "Add"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setRenameId(p.id),
								children: "Rename"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									const id = duplicatePortfolio(p.id);
									if (id) navigate({
										to: "/p/$id",
										params: { id }
									});
								},
								children: "Duplicate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									if (confirm("Delete this portfolio?")) deletePortfolio(p.id);
								},
								children: "Delete"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/p/$id",
								params: { id: p.id },
								"aria-label": "Open",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-subtle" })
							})
						]
					})]
				}, p.id);
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-surface px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-border)]",
				children: "No portfolios yet. Create one from a broker file or add names by hand."
			})
		})
	] });
}
//#endregion
export { Home as component };
