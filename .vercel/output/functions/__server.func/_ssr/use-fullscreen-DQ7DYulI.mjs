import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-fullscreen-DQ7DYulI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function fullscreenEl() {
	return document.fullscreenElement || document.webkitFullscreenElement || null;
}
/**
* Browser fullscreen is the source of truth.
* The element stays in place while the browser API is active.
* If the API is missing or rejected, the caller may cover the page itself.
* Do not move the element and then call requestFullscreen — that detaches it.
*/
function useChartFullscreen(ref) {
	const [native, setNative] = (0, import_react.useState)(false);
	const [fallback, setFallback] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const sync = () => setNative(Boolean(ref.current && fullscreenEl() === ref.current));
		document.addEventListener("fullscreenchange", sync);
		document.addEventListener("webkitfullscreenchange", sync);
		return () => {
			document.removeEventListener("fullscreenchange", sync);
			document.removeEventListener("webkitfullscreenchange", sync);
		};
	}, [ref]);
	(0, import_react.useEffect)(() => {
		if (!fallback) return;
		document.documentElement.classList.add("kosh-fs-lock");
		return () => document.documentElement.classList.remove("kosh-fs-lock");
	}, [fallback]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key !== "Escape") return;
			const el = ref.current;
			if (el && fullscreenEl() === el) {
				const exit = document.exitFullscreen?.bind(document) || document.webkitExitFullscreen?.bind(document);
				if (exit) exit().catch(() => {});
				return;
			}
			if (fallback) setFallback(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [ref, fallback]);
	async function toggle() {
		const el = ref.current;
		if (!el) return;
		if (fullscreenEl() === el) {
			const exit = document.exitFullscreen?.bind(document) || document.webkitExitFullscreen?.bind(document);
			if (exit) await exit().catch(() => {});
			setNative(false);
			return;
		}
		if (fallback) {
			setFallback(false);
			return;
		}
		const req = el.requestFullscreen?.bind(el) || el.webkitRequestFullscreen?.bind(el);
		if (!req) {
			setFallback(true);
			return;
		}
		try {
			await Promise.race([req(), new Promise((_, reject) => window.setTimeout(() => reject(/* @__PURE__ */ new Error("fullscreen-timeout")), 800))]);
			if (fullscreenEl() === el) {
				setNative(true);
				setFallback(false);
				return;
			}
			setFallback(true);
		} catch {
			if (fullscreenEl() === el) {
				setNative(true);
				return;
			}
			setFallback(true);
		}
	}
	return {
		fs: native || fallback,
		native,
		fallback,
		toggle
	};
}
//#endregion
export { useChartFullscreen as t };
