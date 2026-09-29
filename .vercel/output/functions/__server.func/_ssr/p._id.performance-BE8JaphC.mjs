import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Bn as useKosh } from "./router-CAFi_xno.mjs";
import { n as NavChart } from "./nav-chart-BsEO2xUr.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { n as WindowsGrid, t as MonthHeatmap } from "./windows-grid-Hv1WdBAI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.performance-BE8JaphC.js
var import_jsx_runtime = require_jsx_runtime();
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
