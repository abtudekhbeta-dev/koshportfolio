import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as apiResearch } from "./api-DNMbHhUJ.mjs";
import { t as AIButton } from "./ai-button-D8qNTvVB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-missing-BlL2b944.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** User-initiated research. Results stay labeled researched — they are not written back as verified facts. */
function ResearchMissing({ jobs, label }) {
	const queue = jobs.filter((j) => j.symbol && j.missing.length).slice(0, 3);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [rows, setRows] = (0, import_react.useState)([]);
	if (!queue.length) return null;
	const nFields = queue.reduce((s, j) => s + j.missing.length, 0);
	async function run() {
		setBusy(true);
		const next = [];
		for (const job of queue) try {
			const res = await apiResearch(job.symbol, job.missing);
			if (!res.ok) next.push({
				symbol: job.symbol,
				items: [],
				error: res.error || "AI research unavailable"
			});
			else next.push({
				symbol: job.symbol,
				items: res.items || []
			});
		} catch {
			next.push({
				symbol: job.symbol,
				items: [],
				error: "AI research unavailable"
			});
		}
		setRows(next);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xl text-[13px] text-muted",
				children: label || `${queue.length} ${queue.length === 1 ? "name has" : "names have"} unresolved fields. Research looks for evidence. It does not fill the screen and it is not verified.`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
				busy,
				busyLabel: `Researching ${nFields} missing fields…`,
				onClick: () => void run(),
				children: queue.length > 1 ? `Research missing data for ${queue.length}` : "Research missing data"
			})]
		}), rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 grid gap-2",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "text-[13px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: row.symbol
					}),
					row.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: row.error
					}) : null,
					row.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: item.metric
							}),
							item.status === "researched" && item.value != null ? ` · ${item.value}${item.unit ? " " + item.unit : ""} · AI-researched` : item.status === "inputs_only" ? " · inputs only — not calculated here" : " · not found",
							item.period ? ` · ${item.period}` : "",
							item.sourceName ? ` · ${item.sourceName}` : "",
							item.sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" ",
								"·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: item.sourceUrl,
									className: "text-chart hover:underline",
									target: "_blank",
									rel: "noreferrer",
									children: "source"
								})
							] }) : null,
							item.evidence ? ` · ${item.evidence}` : ""
						]
					}, item.metric))
				]
			}, row.symbol))
		}) : null]
	});
}
//#endregion
export { ResearchMissing as t };
