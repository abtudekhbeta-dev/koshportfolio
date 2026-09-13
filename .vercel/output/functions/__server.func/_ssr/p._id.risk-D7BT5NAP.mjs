import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as fmtPct, T as dash, on as cn } from "./router-oJX0L9_1.mjs";
import { t as StockLink } from "./stock-link-BKmL1OMh.mjs";
import { n as MetricCard } from "./metric-C05IK4h-.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.risk-D7BT5NAP.js
var import_jsx_runtime = require_jsx_runtime();
function Risk() {
	const { query, portfolio } = useBookCtx();
	const { risk, cagr, corr } = query.data;
	const items = [
		{
			id: "cagr",
			v: dash(cagr, (x) => fmtPct(x))
		},
		{
			id: "sharpe",
			v: dash(risk.sharpe)
		},
		{
			id: "sortino",
			v: dash(risk.sortino)
		},
		{
			id: "alpha",
			v: dash(risk.alpha, (x) => fmtPct(x))
		},
		{
			id: "beta",
			v: dash(risk.beta)
		},
		{
			id: "corr",
			v: dash(risk.corr)
		},
		{
			id: "vol",
			v: dash(risk.vol, (x) => x.toFixed(1) + "%")
		},
		{
			id: "maxDd",
			v: dash(risk.maxDd, (x) => x.toFixed(1) + "%")
		},
		{
			id: "upCap",
			v: dash(risk.upCap, (x) => (x * 100).toFixed(0) + "%")
		},
		{
			id: "downCap",
			v: dash(risk.downCap, (x) => (x * 100).toFixed(0) + "%")
		},
		{
			id: "info",
			v: dash(risk.info)
		},
		{
			id: "calmar",
			v: dash(risk.calmar)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: [
					"These numbers describe the ride of today’s portfolio over the last 1 year of overlapping sessions versus the index — not a promise. A dash means the history is too short to trust; we never print a fake 0.00. Risk-free rate is 6.5%. Alpha and beta are Jensen’s, on daily returns",
					risk.windowLabel ? ` — ${risk.windowLabel}` : "",
					". Hover a name, or tap ? for a longer explanation."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					id: it.id,
					value: it.v
				}, it.id))
			}),
			corr?.clusters?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Names that move together"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-2xl text-[13px] text-muted",
						children: [
							"Last 1 year of daily moves. ",
							corr.clusters.filter((c) => !c.alone).length || 0,
							" group",
							corr.clusters.filter((c) => !c.alone).length === 1 ? "" : "s",
							" plus names that go their own way. Not a promise they always will."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-3",
						children: corr.clusters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase",
							children: [
								c.alone ? "On their own" : "Move together",
								" · ",
								(c.weight * 100).toFixed(0),
								"%"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]",
							children: c.symbols.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
								symbol: s,
								name: c.names[i],
								className: "font-medium"
							}, s))
						})] }, c.id))
					}),
					corr.symbols.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CorrMatrix, { pack: corr }) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Moves that change these scores"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-[13px] text-muted",
						children: "The two or three material levers live on Improve Portfolio — not a dump of every name."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/p/$id/improve",
						params: { id: portfolio.id },
						className: "mt-3 inline-flex text-[13px] text-chart hover:underline",
						children: "Open Improve Portfolio"
					})
				]
			})
		]
	});
}
function corrStep(v, offDiag) {
	if (v == null) return {
		bg: "transparent",
		fg: "var(--color-subtle)",
		ring: false
	};
	const a = Math.abs(v);
	const ring = offDiag && a >= .5;
	if (v >= 0) {
		if (a >= .85) return {
			bg: "color-mix(in srgb, var(--color-chart) 88%, transparent)",
			fg: "var(--color-fg)",
			ring
		};
		if (a >= .7) return {
			bg: "color-mix(in srgb, var(--color-chart) 66%, transparent)",
			fg: "var(--color-fg)",
			ring
		};
		if (a >= .5) return {
			bg: "color-mix(in srgb, var(--color-chart) 44%, transparent)",
			fg: "var(--color-fg)",
			ring
		};
		if (a >= .3) return {
			bg: "color-mix(in srgb, var(--color-chart) 24%, transparent)",
			fg: "var(--color-muted)",
			ring
		};
		if (a >= .15) return {
			bg: "color-mix(in srgb, var(--color-chart) 10%, transparent)",
			fg: "var(--color-muted)",
			ring
		};
		return {
			bg: "transparent",
			fg: "var(--color-subtle)",
			ring
		};
	}
	if (a >= .7) return {
		bg: "color-mix(in srgb, var(--color-down) 78%, transparent)",
		fg: "var(--color-fg)",
		ring
	};
	if (a >= .5) return {
		bg: "color-mix(in srgb, var(--color-down) 56%, transparent)",
		fg: "var(--color-fg)",
		ring
	};
	if (a >= .3) return {
		bg: "color-mix(in srgb, var(--color-down) 32%, transparent)",
		fg: "var(--color-fg)",
		ring
	};
	return {
		bg: "color-mix(in srgb, var(--color-down) 14%, transparent)",
		fg: "var(--color-muted)",
		ring
	};
}
function CorrMatrix({ pack }) {
	const nifty = pack.vsNifty || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 overflow-x-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-[12px] text-muted",
				children: "Stepped colour — not a wash. A ring means they moved together (or opposite) at least 50%. Last column is each name versus Nifty 50, same year."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex flex-wrap items-center gap-2 text-[10px] text-muted",
				children: [[
					[.15, "15%"],
					[.3, "30%"],
					[.5, "50%"],
					[.7, "70%"],
					[.85, "85%"]
				].map(([v, lab]) => {
					const c = corrStep(v, false);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-block size-3 rounded-sm",
							style: { background: c.bg }
						}), lab]
					}, lab);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block size-3 rounded-sm",
						style: { boxShadow: "inset 0 0 0 1.5px var(--color-fg)" }
					}), "≥ 50%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "border-collapse text-[10px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-1" }),
					pack.symbols.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "max-w-10 truncate p-1 text-left font-medium text-subtle",
						title: s,
						children: s.slice(0, 6)
					}, s)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "p-1 text-left font-medium text-subtle",
						title: "Correlation versus Nifty 50",
						children: "Nifty"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pack.symbols.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "sticky left-0 bg-surface p-1 text-left font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
							symbol: s,
							name: pack.names[i]
						})
					}),
					pack.matrix[i].map((v, j) => {
						const c = corrStep(v, i !== j);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("min-w-8 p-1 text-center font-mono tabular"),
							style: {
								background: c.bg,
								color: c.fg,
								boxShadow: c.ring ? "inset 0 0 0 1.5px var(--color-fg)" : void 0
							},
							title: `${pack.symbols[i]} / ${pack.symbols[j]}: ${v == null ? "—" : v.toFixed(2)}`,
							children: v == null ? "—" : v.toFixed(2).replace("0.", ".")
						}, j);
					}),
					(() => {
						const v = nifty[i] ?? null;
						const c = corrStep(v, v != null);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "min-w-9 p-1 text-center font-mono tabular",
							style: {
								background: c.bg,
								color: c.fg,
								boxShadow: c.ring ? "inset 0 0 0 1.5px var(--color-fg)" : void 0
							},
							title: `${s} / Nifty 50: ${v == null ? "—" : v.toFixed(2)}`,
							children: v == null ? "—" : v.toFixed(2).replace("0.", ".")
						});
					})()
				] }, s)) })]
			})
		]
	});
}
//#endregion
export { Risk as component };
