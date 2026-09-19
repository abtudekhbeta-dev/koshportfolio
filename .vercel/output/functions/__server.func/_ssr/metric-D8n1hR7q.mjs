import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { j as CircleHelp } from "../_libs/lucide-react.mjs";
import { Pt as Tooltip, qn as cn } from "./router-CuH7ax2z.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-GOer22pj.mjs";
import { n as metric } from "./metrics-C9sJUj_k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/metric-D8n1hR7q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MetricLabel({ id, className }) {
	const m = metric(id);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-1", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
				content: m.hover || m.short,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-left text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: m.label
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-5 place-items-center rounded-sm text-subtle transition-colors duration-150 hover:text-fg",
				"aria-label": `What ${m.label} means`,
				onClick: () => setOpen(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					title: m.label,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[15px] leading-relaxed text-fg",
						children: m.short
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[14px] leading-relaxed text-muted",
						children: m.deep
					})]
				})
			})
		]
	});
}
function MetricCard({ id, value, hint, tone, children }) {
	const m = metric(id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricLabel, { id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1.5 font-mono text-[22px] font-medium tabular tracking-tight", tone === "up" && "text-up", tone === "down" && "text-down", tone === "warn" && "text-warn"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1 text-[12px] font-mono tabular", tone === "up" && "text-up", tone === "down" && "text-down", !tone && "text-muted"),
				children: hint
			}) : null,
			m.short ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-[12px] leading-snug text-muted",
				children: m.short
			}) : null,
			children
		]
	});
}
function ChartSkeleton({ label = "Loading the chart…" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 animate-pulse rounded-sm bg-surface-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ml-auto h-8 w-48 animate-pulse rounded-sm bg-surface-2" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-3 h-[280px] w-full overflow-hidden sm:h-[320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 640 280",
				className: "h-full w-full",
				"aria-hidden": true,
				children: [
					[
						40,
						90,
						140,
						190,
						240
					].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						y1: y,
						x2: "640",
						y2: y,
						stroke: "currentColor",
						className: "text-border"
					}, y)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 190 C 80 186, 120 160, 180 155 S 280 170, 340 120 S 460 90, 520 70 S 600 88, 640 60",
						fill: "none",
						stroke: "var(--color-chart)",
						strokeWidth: "2.2",
						className: "kosh-draw"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 200 C 90 194, 140 180, 200 175 S 300 188, 360 150 S 470 130, 640 110",
						fill: "none",
						stroke: "var(--color-chart-bench)",
						strokeWidth: "1.6",
						strokeDasharray: "5 4",
						className: "kosh-draw kosh-draw-bench"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 grid place-items-center bg-surface/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-sm bg-bg-elevated px-3 py-1.5 text-[12px] text-muted shadow-[var(--shadow-border)]",
					children: label
				})
			})]
		})]
	});
}
//#endregion
export { MetricCard as n, MetricLabel as r, ChartSkeleton as t };
