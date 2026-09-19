import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Rn as cn, dn as isListedSymbol } from "./router-COGOfPBd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stock-link-ClZslyKN.js
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
