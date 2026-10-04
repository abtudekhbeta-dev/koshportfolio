import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as apiSearch } from "./api-BUW2NSIG.mjs";
import { d as Search } from "../_libs/lucide-react.mjs";
import { bn as resolveBench, dn as BENCH, gn as cn, lt as searchNse } from "./router-g4ySYeAB2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bench-picker-D9Fi5UQp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INDEX_HITS = Object.entries(BENCH).map(([key, v]) => ({
	key,
	symbol: v.symbol,
	name: v.name,
	group: "Indices"
}));
function BenchPicker({ value, onChange }) {
	const current = resolveBench(value);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [remote, setRemote] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const box = (0, import_react.useRef)(null);
	const timer = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (!box.current?.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		window.clearTimeout(timer.current);
		const v = q.trim();
		if (v.length < 1) {
			setRemote([]);
			return;
		}
		setBusy(true);
		timer.current = window.setTimeout(() => {
			apiSearch(v).then((rows) => setRemote(rows)).catch(() => setRemote([])).finally(() => setBusy(false));
		}, 160);
	}, [q, open]);
	const hits = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		const idx = needle ? INDEX_HITS.filter((h) => h.name.toLowerCase().includes(needle) || h.key.toLowerCase().includes(needle) || h.symbol.toLowerCase().includes(needle)) : INDEX_HITS;
		const nseHits = (needle ? searchNse(q, 8) : []).map((x) => ({
			key: x.symbol,
			symbol: x.symbol,
			name: x.name,
			group: "NSE"
		}));
		const seen = new Set([...idx, ...nseHits].map((h) => h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase()));
		const rest = remote.filter((r) => {
			const bare = r.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
			if (seen.has(bare)) return false;
			seen.add(bare);
			return true;
		}).map((r) => ({
			key: r.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase(),
			symbol: r.symbol,
			name: r.name,
			group: /index|\^/i.test(r.exch + r.symbol) ? "Indices" : r.exch || "NSE & BSE"
		}));
		return [
			...idx,
			...nseHits,
			...rest
		].slice(0, 16);
	}, [q, remote]);
	function pick(h) {
		onChange(h.key);
		setOpen(false);
		setQ("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: box,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((v) => !v),
			className: "flex h-8 min-w-[160px] max-w-[220px] items-center gap-2 rounded-sm bg-bg-elevated px-2.5 text-left text-[13px] text-fg shadow-[var(--shadow-border)]",
			"aria-label": "Benchmark",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 shrink-0 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: current.name
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 z-40 mt-1 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-lg bg-bg-elevated shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				autoFocus: true,
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Nifty, Sensex, TCS, a BSE name…",
				className: "h-10 w-full border-b border-border bg-transparent px-3 text-[13px] outline-none placeholder:text-subtle"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "max-h-64 overflow-y-auto p-1",
				children: [
					busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2.5 py-2 text-[12px] text-subtle",
						children: "Looking up…"
					}) : null,
					hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => pick(h),
						className: cn("flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-[13px] hover:bg-surface", (value === h.key || current.symbol === h.symbol) && "bg-surface"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: h.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-3 truncate text-[11px] text-subtle",
							children: h.group
						})]
					}) }, h.group + h.key)),
					q.trim() && !hits.length && !busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2.5 py-3 text-[13px] text-muted",
						children: "No hits. Try Nifty, Bank Nifty, or a ticker."
					}) : null
				]
			})]
		}) : null]
	});
}
//#endregion
export { BenchPicker as t };
