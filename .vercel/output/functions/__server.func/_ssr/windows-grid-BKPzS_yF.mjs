import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { qn as cn } from "./router-CuH7ax2z.mjs";
import { r as MetricLabel } from "./metric-D8n1hR7q.mjs";
import { t as Pct } from "./pct-C9s6acMO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/windows-grid-BKPzS_yF.js
var import_jsx_runtime = require_jsx_runtime();
var MONTHS = [
	"J",
	"F",
	"M",
	"A",
	"M",
	"J",
	"J",
	"A",
	"S",
	"O",
	"N",
	"D"
];
function heatClass(v) {
	if (v >= 8) return "bg-up text-accent-fg";
	if (v >= 3) return "bg-up/70 text-accent-fg";
	if (v >= 0) return "bg-up/30 text-fg";
	if (v >= -3) return "bg-down/30 text-fg";
	if (v >= -8) return "bg-down/70 text-accent-fg";
	return "bg-down text-accent-fg";
}
function MonthHeatmap({ months }) {
	if (!months.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]",
		children: "Need a few months of prices."
	});
	const years = [...new Set(months.map((m) => m.key.slice(0, 4)))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-w-[520px] gap-1",
			style: { gridTemplateColumns: "44px repeat(12, 1fr)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
				MONTHS.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center text-[10px] text-subtle",
					children: m
				}, i)),
				years.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearRow, {
					year: y,
					months
				}, y))
			]
		})
	});
}
function YearRow({ year, months }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center font-mono text-[11px] text-subtle",
		children: year
	}), Array.from({ length: 12 }, (_, i) => {
		const k = year + "-" + String(i + 1).padStart(2, "0");
		const row = months.find((m) => m.key === k);
		if (!row) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 rounded-xs bg-surface-2" }, k);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			title: `${k}  ${row.port.toFixed(1)}%`,
			className: cn("grid h-7 place-items-center rounded-xs font-mono text-[10px] font-medium", heatClass(row.port)),
			children: row.port.toFixed(0)
		}, k);
	})] });
}
var LABELS = [
	{
		lab: "1W",
		k: "w1",
		id: "w1"
	},
	{
		lab: "1M",
		k: "m1",
		id: "m1"
	},
	{
		lab: "3M",
		k: "m3",
		id: "m3"
	},
	{
		lab: "6M",
		k: "m6",
		id: "m6"
	},
	{
		lab: "1Y",
		k: "y1",
		id: "y1"
	},
	{
		lab: "YTD",
		k: "ytd",
		id: "ytd"
	}
];
function WindowsGrid({ windows, portLabel = "Portfolio", benchLabel = "Index" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
		children: LABELS.map(({ lab, k, id }) => {
			const w = windows[k];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricLabel, { id }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-[12px] text-muted",
						children: [
							portLabel,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: w?.port }) })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-0.5 text-[12px] text-muted",
						children: [
							benchLabel,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: w?.bench }) })
						]
					})
				]
			}, lab);
		})
	});
}
//#endregion
export { WindowsGrid as n, MonthHeatmap as t };
