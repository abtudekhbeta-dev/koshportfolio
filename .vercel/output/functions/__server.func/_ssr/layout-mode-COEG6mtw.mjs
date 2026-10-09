import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/layout-mode-COEG6mtw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "kosh-layout";
function normalizeLayout(v) {
	if (v === "intelligence" || v === "studio") return v;
	return "classic";
}
function readLayout() {
	if (typeof localStorage === "undefined") return "classic";
	try {
		const v = localStorage.getItem(KEY);
		const next = normalizeLayout(v);
		if (v && v !== next) try {
			localStorage.setItem(KEY, "classic");
		} catch {}
		return next;
	} catch {
		return "classic";
	}
}
function applyLayout(layout) {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("data-layout", layout);
}
function writeLayout(layout) {
	applyLayout(layout);
	try {
		localStorage.setItem(KEY, layout);
	} catch {}
	if (typeof window !== "undefined") window.dispatchEvent(new Event("kosh-layout"));
}
function useAppLayout() {
	const [layout, setLayout] = (0, import_react.useState)("classic");
	(0, import_react.useEffect)(() => {
		const sync = () => {
			const next = readLayout();
			applyLayout(next);
			setLayout(next);
		};
		sync();
		window.addEventListener("kosh-layout", sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener("kosh-layout", sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return layout;
}
//#endregion
export { writeLayout as n, useAppLayout as t };
