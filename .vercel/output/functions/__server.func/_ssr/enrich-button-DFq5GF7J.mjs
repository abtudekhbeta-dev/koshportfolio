import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { In as useKosh, sn as Button, vt as isCommodity } from "./router-BWv3yT6z.mjs";
import { n as apiEnrich } from "./api-DtVFWAsH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enrich-button-DFq5GF7J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EnrichButton({ symbols }) {
	const setDeepFunds = useKosh((s) => s.setDeepFunds);
	const deepFunds = useKosh((s) => s.deepFunds);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const eq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter((s) => s && !isCommodity(s)))];
	if (!eq.length) return null;
	const nHave = eq.filter((s) => deepFunds[s]?.fund).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "secondary",
		disabled: busy,
		onClick: async () => {
			setBusy(true);
			try {
				const got = await apiEnrich(eq);
				const rows = {};
				for (const [sym, fund] of Object.entries(got.funds || {})) rows[sym] = {
					fund,
					at: Date.now(),
					sources: got.sources?.[sym] || []
				};
				if (Object.keys(rows).length) setDeepFunds(rows);
				const n = Object.keys(rows).length;
				toast.success(n ? `Loaded full company data for ${n} of ${eq.length} name${eq.length === 1 ? "" : "s"}. Filings stay for everyone who opens a company page.` : "No extra filings found for these names. Existing numbers were left as they are.");
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Could not load filings");
			} finally {
				setBusy(false);
			}
		},
		children: busy ? "Loading filings…" : nHave ? `Refresh company data · ${nHave}/${eq.length}` : "Load full company data"
	});
}
//#endregion
export { EnrichButton as t };
