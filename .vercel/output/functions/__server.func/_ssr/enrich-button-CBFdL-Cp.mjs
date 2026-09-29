import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as useKosh, Tt as isCommodity, cn as Button } from "./router-CAFi_xno.mjs";
import { n as apiEnrich } from "./api-DNMbHhUJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enrich-button-CBFdL-Cp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COVERAGE = [
	{
		label: "Revenue history",
		has: (f) => (f?.sales?.length || 0) > 0
	},
	{
		label: "Profit history",
		has: (f) => (f?.profits?.length || 0) > 0
	},
	{
		label: "CFO",
		has: (f) => (f?.cfo?.length || 0) > 0
	},
	{
		label: "Shareholding",
		has: (f) => (f?.shareholding?.length || 0) > 0 || f?.promoters != null
	},
	{
		label: "ROCE",
		has: (f) => f?.roce != null
	},
	{
		label: "OPM",
		has: (f) => f?.opm != null
	},
	{
		label: "P/E",
		has: (f) => f?.pe != null
	},
	{
		label: "ROE",
		has: (f) => f?.roe != null
	}
];
var FRESH_MS = 6048e5;
function covered(fund) {
	return COVERAGE.every((field) => field.has(fund));
}
function EnrichButton({ symbols, queued = 0 }) {
	const setDeepFunds = useKosh((s) => s.setDeepFunds);
	const deepFunds = useKosh((s) => s.deepFunds);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const eq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter((s) => s && !isCommodity(s)))];
	if (!eq.length && !queued) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "secondary",
		disabled: busy || !eq.length,
		onClick: async () => {
			setBusy(true);
			try {
				const before = deepFunds;
				const now = Date.now();
				const todo = eq.filter((s) => {
					const snap = before[s];
					return !(snap?.fund && covered(snap.fund) && now - snap.at < FRESH_MS);
				});
				const already = eq.length - todo.length;
				if (!todo.length) {
					toast.success("Supported fields already have a status.");
					return;
				}
				const rows = {};
				const sourceSet = /* @__PURE__ */ new Set();
				let failed = 0;
				for (let i = 0; i < todo.length; i += 8) {
					const slice = todo.slice(i, i + 8);
					try {
						const part = await apiEnrich(slice);
						for (const [sym, fund] of Object.entries(part.funds || {})) rows[sym] = {
							fund,
							at: Date.now(),
							sources: part.sources?.[sym] || []
						};
						for (const list of Object.values(part.sources || {})) for (const src of list || []) sourceSet.add(src);
					} catch {
						failed += slice.length;
					}
				}
				if (Object.keys(rows).length) setDeepFunds(rows);
				const added = [];
				const still = [];
				const had = [];
				for (const field of COVERAGE) {
					let gained = 0;
					let present = 0;
					let missing = 0;
					for (const s of eq) {
						const was = field.has(before[s]?.fund);
						const isNow = field.has(rows[s]?.fund) || was;
						if (!was && field.has(rows[s]?.fund)) gained += 1;
						if (was) present += 1;
						if (!isNow) missing += 1;
					}
					if (gained) added.push(`${field.label} (${gained})`);
					else if (present) had.push(field.label);
					if (missing) still.push(`${field.label} on ${missing}`);
				}
				const bits = [
					added.length ? `Added: ${added.join(", ")}.` : "No new fields on this pass.",
					had.length ? `Already available: ${had.join(", ")}.` : "",
					still.length ? `Still unavailable: ${still.join(", ")}.` : "",
					sourceSet.size ? `Sources checked: ${[...sourceSet].join(", ")}.` : "",
					already ? `${already} already complete, left as they were.` : "",
					failed ? `${failed} names could not be read this pass.` : "",
					queued ? `${queued} more names are still queued. Run again to continue.` : ""
				].filter(Boolean);
				toast.success(`Verified ${Object.keys(rows).length} of ${todo.length}`, { description: bits.join(" ") });
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Could not load filings");
			} finally {
				setBusy(false);
			}
		},
		children: busy ? "Verifying…" : "Complete & verify data"
	});
}
//#endregion
export { EnrichButton as t };
