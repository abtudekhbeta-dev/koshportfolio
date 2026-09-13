import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { on as cn, tn as useKosh } from "./router-oJX0L9_1.mjs";
import { t as NavChart } from "./nav-chart-DE0AKC21.mjs";
import { r as MetricLabel } from "./metric-C05IK4h-.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as Pct } from "./pct-29Upff__.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.performance-CA535X0C.js
var import_jsx_runtime = require_jsx_runtime();
var MONTHS = [
	"J",
	"F",
	"M",
	"A",
	"M",
	"J",
	"J",
	"A",
	"S",
	"O",
	"N",
	"D"
];
function heatClass(v) {
	if (v >= 8) return "bg-up text-accent-fg";
	if (v >= 3) return "bg-up/70 text-accent-fg";
	if (v >= 0) return "bg-up/30 text-fg";
	if (v >= -3) return "bg-down/30 text-fg";
	if (v >= -8) return "bg-down/70 text-accent-fg";
	return "bg-down text-accent-fg";
}
function MonthHeatmap({ months }) {
	if (!months.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]",
		children: "Need a few months of prices."
	});
	const years = [...new Set(months.map((m) => m.key.slice(0, 4)))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-[520px] gap-1",
			style: { gridTemplateColumns: "44px repeat(12, 1fr)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
				MONTHS.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center text-[10px] text-subtle",
					children: m
				}, i)),
				years.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearRow, {
					year: y,
					months
				}, y))
			]
		})
	});
}
function YearRow({ year, months }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center font-mono text-[11px] text-subtle",
		children: year
	}), Array.from({ length: 12 }, (_, i) => {
		const k = year + "-" + String(i + 1).padStart(2, "0");
		const row = months.find((m) => m.key === k);
		if (!row) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 rounded-xs bg-surface-2" }, k);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			title: `${k}  ${row.port.toFixed(1)}%`,
			className: cn("grid h-7 place-items-center rounded-xs font-mono text-[10px] font-medium", heatClass(row.port)),
			children: row.port.toFixed(0)
		}, k);
	})] });
}
var LABELS = [
	{
		lab: "1W",
		k: "w1",
		id: "w1"
	},
	{
		lab: "1M",
		k: "m1",
		id: "m1"
	},
	{
		lab: "3M",
		k: "m3",
		id: "m3"
	},
	{
		lab: "6M",
		k: "m6",
		id: "m6"
	},
	{
		lab: "1Y",
		k: "y1",
		id: "y1"
	},
	{
		lab: "YTD",
		k: "ytd",
		id: "ytd"
	}
];
function WindowsGrid({ windows, portLabel = "Portfolio", benchLabel = "Index" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
		children: LABELS.map(({ lab, k, id }) => {
			const w = windows[k];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricLabel, { id }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-[12px] text-muted",
						children: [
							portLabel,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: w?.port }) })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-0.5 text-[12px] text-muted",
						children: [
							benchLabel,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: w?.bench }) })
						]
					})
				]
			}, lab);
		})
	});
}
function Performance() {
	const { query, portfolio } = useBookCtx();
	const book = query.data;
	const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: ["Portfolio vs ", book.benchName]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: "The line is this portfolio as it is today, taken back through each stock’s daily prices. Stocks that listed later join in when they appear — they do not erase earlier years. Growth, rupees, rolling returns, monthly bars, drawdown, or the gap versus the index."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: book.mix.nav,
					portLabel: "Portfolio",
					benchLabel: book.benchName,
					coverage: `${book.coverage}${book.mix.missing.length ? " · skipped " + book.mix.missing.join(", ") : ""}`,
					nowValue: book.value,
					metals: book.commodityValue > 0 ? {
						present: true,
						included: book.includeCommodities,
						onChange: (on) => setIncludeCommodities(portfolio.id, on)
					} : void 0
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Windows versus the index"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] text-muted",
					children: "Each card is the same portfolio over a different length of time. Hover the name, or tap the ? for a plain-English read."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowsGrid, {
					windows: book.windows,
					portLabel: "Portfolio",
					benchLabel: book.benchName
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Month by month"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] text-muted",
					children: "Green months beat zero. Compare the tone across years, not one cell."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthHeatmap, { months: book.months })
			] })
		]
	});
}
//#endregion
export { Performance as component };
