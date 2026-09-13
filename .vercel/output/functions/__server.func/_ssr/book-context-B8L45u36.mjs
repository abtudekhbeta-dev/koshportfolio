import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-context-B8L45u36.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BookCtx = (0, import_react.createContext)(null);
function BookProvider({ portfolio, query, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCtx.Provider, {
		value: {
			portfolio,
			query
		},
		children
	});
}
function useBookCtx() {
	const v = (0, import_react.useContext)(BookCtx);
	if (!v) throw new Error("BookProvider missing");
	return v;
}
//#endregion
export { useBookCtx as n, BookProvider as t };
