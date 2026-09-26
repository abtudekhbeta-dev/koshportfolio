import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as fmtPct, er as cn } from "./router-Dc7pTO-v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pct-BMpUgixe.js
var import_jsx_runtime = require_jsx_runtime();
function Pct({ n, digits = 2, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular font-mono", n == null || !Number.isFinite(n) ? "" : n > 0 ? "text-up" : n < 0 ? "text-down" : "text-muted", className),
		children: fmtPct(n, digits)
	});
}
//#endregion
export { Pct as t };
