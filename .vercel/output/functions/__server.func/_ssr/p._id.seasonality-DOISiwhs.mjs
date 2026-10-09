import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as SeasonalityDesk } from "./seasonality-desk-DAalVEPT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.seasonality-DOISiwhs.js
var import_jsx_runtime = require_jsx_runtime();
function SeasonalityPage() {
	const { query } = useBookCtx();
	const book = query.data;
	const rows = book.rows.filter((r) => book.includeCommodities || r.kind !== "commodity");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "kosh-page grid gap-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonalityDesk, {
			mode: "portfolio",
			names: rows.map((r) => ({
				symbol: r.symbol,
				name: r.name,
				weight: r.weight * 100
			}))
		})
	});
}
//#endregion
export { SeasonalityPage as component };
