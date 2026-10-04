import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { ct as isListedSymbol, gn as cn } from "./router-g4ySYeAB2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stock-link-HaO5mNxc.js
var import_jsx_runtime = require_jsx_runtime();
function stockBare(symbol) {
	return String(symbol || "").toUpperCase().replace(/\.(NS|BO)$/i, "");
}
function canOpenStock(symbol) {
	const b = stockBare(symbol);
	if (!b || b.startsWith("^") || b === "GOLD" || b === "SILVER") return false;
	return isListedSymbol(b) || /^[A-Z][A-Z0-9-]{1,14}$/.test(b);
}
function StockLink({ symbol, name, className, children }) {
	const b = stockBare(symbol);
	const label = children ?? name ?? b;
	if (!canOpenStock(b)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/s/$symbol",
		params: { symbol: b },
		className: cn("hover:text-chart", className),
		children: label
	});
}
//#endregion
export { canOpenStock as n, StockLink as t };
