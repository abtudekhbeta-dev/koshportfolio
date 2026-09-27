import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { rr as cn } from "./router-BGlqc6-G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-button-z4Bx0fyu.js
var import_jsx_runtime = require_jsx_runtime();
/** Every model call uses this. Deterministic fetches do not. */
function AIButton({ children, busy, className, disabled, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type,
		title: "Uses AI. It interprets evidence. It does not invent numbers.",
		className: cn("kosh-ai-btn inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-medium disabled:opacity-40", className),
		...props,
		disabled: disabled || busy,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "kosh-ai-mark",
			children: "✦ AI"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: busy ? "Working…" : children })]
	});
}
//#endregion
export { AIButton as t };
