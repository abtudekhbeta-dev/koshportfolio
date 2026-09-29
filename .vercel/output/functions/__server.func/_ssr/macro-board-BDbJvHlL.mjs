import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as formatIstDate, g as marketTemp, i as compareIstDate, ir as cn } from "./router-CAFi_xno.mjs";
import { o as apiMacro } from "./api-DNMbHhUJ.mjs";
import { n as canOpenStock } from "./stock-link-DAnwbOS3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/macro-board-BDbJvHlL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cr(n) {
	return (n >= 0 ? "" : "−") + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}
function Spark({ rows, keyName }) {
	const vals = [...rows].reverse().map((r) => r[keyName]);
	if (vals.length < 2) return null;
	const w = 160;
	const h = 36;
	const hi = Math.max(...vals.map(Math.abs), 1);
	const y = (v) => h / 2 - v / hi * (h / 2 - 2);
	const d = vals.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (vals.length - 1) * w).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
	const last = vals[vals.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "mt-2 h-9 w-40",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "0",
			y1: h / 2,
			x2: w,
			y2: h / 2,
			stroke: "var(--color-border)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: last >= 0 ? "var(--color-up)" : "var(--color-down)",
			strokeWidth: "1.6"
		})]
	});
}
function MarketTempCard({ rows, focus }) {
	if (!rows.length) return null;
	const t = marketTemp(rows, focus);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-3 gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: "14-day RSI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 font-mono text-[18px] tabular",
				children: t.avgRsi.toFixed(0)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: "Above 200-day"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 font-mono text-[18px] tabular",
				children: [Math.round(t.above200 * 100), "%"]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: t.whose
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-[15px] font-medium",
				children: t.tag
			})] })
		]
	}) });
}
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "results",
		label: "Results"
	},
	{
		id: "macro",
		label: "Macro"
	},
	{
		id: "stock",
		label: "Stock events"
	}
];
function toneOf(kind) {
	if (kind === "results") return "bg-chart/15 text-chart";
	if (kind === "macro") return "bg-warn/20 text-warn";
	return "bg-surface-2 text-muted";
}
function EventCalendar({ compact, symbols }) {
	const q = useQuery({
		queryKey: ["macro"],
		queryFn: apiMacro,
		staleTime: 12e5
	});
	const [filter, setFilter] = (0, import_react.useState)("all");
	const rows = (0, import_react.useMemo)(() => {
		const wantKey = (symbols || []).map((s) => s.toUpperCase().replace(/\.(NS|BO)$/i, "")).join(",");
		const list = q.data?.results || [];
		const want = wantKey ? wantKey.split(",") : null;
		return [...list.filter((r) => {
			if (filter !== "all" && r.kind !== filter) return false;
			if (!want || r.kind === "macro") return true;
			return want.includes(String(r.symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, ""));
		})].sort((a, b) => compareIstDate(a.date, b.date));
	}, [
		q.data,
		filter,
		symbols?.join(",")
	]);
	const shown = compact ? rows.slice(0, 12) : rows.slice(0, 24);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Calendar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12px] text-subtle",
					children: "Results, board events, and recurring macro dates."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f.id),
					className: cn("inline-flex h-7 items-center justify-center rounded-sm px-2.5 text-[11px] font-medium shadow-[var(--shadow-border)]", filter === f.id ? "bg-surface-2 text-fg" : "bg-bg text-muted"),
					children: f.label
				}, f.id))
			})]
		}), q.isPending && !shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Loading the calendar…"
		}) : shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 grid min-w-0 gap-1.5",
			children: shown.map((r, i) => {
				const kind = r.kind || "stock";
				const label = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mr-2 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase", toneOf(kind)),
						children: kind === "results" ? "Results" : kind === "macro" ? "Macro" : "Stock"
					}),
					r.expected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 rounded-sm bg-warn/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-warn uppercase",
						children: "Expected"
					}) : null,
					r.name,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] text-subtle",
						children: [" · ", r.purpose]
					})
				] });
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-w-0 items-baseline justify-between gap-3 text-[13px]",
					children: [canOpenStock(r.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$symbol",
						params: { symbol: r.symbol },
						className: "min-w-0 flex-1 truncate hover:text-chart",
						children: label
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 font-mono text-[12px] text-muted tabular",
						children: formatIstDate(r.date)
					})]
				}, r.symbol + r.date + r.purpose + String(i));
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Nothing in this filter for the next window."
		})]
	});
}
function MacroBoard() {
	const q = useQuery({
		queryKey: ["macro"],
		queryFn: apiMacro,
		staleTime: 12e5
	});
	const fiidii = q.data?.fiidii || [];
	const last = fiidii[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: "FII / DII"
		}), q.isPending && !last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Loading cash-market flows…"
		}) : last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-[12px] text-subtle",
			children: [last.date, " · cash (₹ Cr)"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: "FII net"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-1 font-mono text-lg tabular", last.fiiNet >= 0 ? "text-up" : "text-down"),
					children: cr(last.fiiNet)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
					rows: fiidii,
					keyName: "fiiNet"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: "DII net"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-1 font-mono text-lg tabular", last.diiNet >= 0 ? "text-up" : "text-down"),
					children: cr(last.diiNet)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
					rows: fiidii,
					keyName: "diiNet"
				})
			] })]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Flow file not on hand today."
		})]
	}) });
}
//#endregion
export { MacroBoard as n, MarketTempCard as r, EventCalendar as t };
