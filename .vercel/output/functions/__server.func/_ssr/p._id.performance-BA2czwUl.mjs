import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Qt as useKosh } from "./router-DhekK0Gr2.mjs";
import { n as NavChart } from "./nav-chart-DCx_ZXZT.mjs";
import { r as MetricLabel } from "./metric-CoO2DV96.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as Pct } from "./pct-C0xcOs8J.mjs";
import { t as MonthHeatmap } from "./heatmap-CwJQ0V_T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.performance-BA2czwUl.js
var import_jsx_runtime = require_jsx_runtime();
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
					children: ["This mix vs ", book.benchName]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: "Blue is this portfolio as it is today, taken back through each stock’s adjusted daily prices. It is not your XIRR. Stocks that listed later join in when they appear — they do not erase earlier years. Growth, rupees, rolling returns, monthly bars, drawdown, or the gap versus the index. Buys and sells live on Path."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: book.mix.nav,
					portLabel: "This mix",
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
					children: "Each card is the same mix over a different length of time. Hover the name, or tap the ? for a plain-English read."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowsGrid, {
					windows: book.windows,
					portLabel: "This mix",
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
