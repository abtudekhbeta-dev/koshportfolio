import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { on as cn } from "./router-oJX0L9_1.mjs";
import { n as canOpenStock } from "./stock-link-BKmL1OMh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-ring-DyC4skAT.js
var import_jsx_runtime = require_jsx_runtime();
var PALETTE = [
	"var(--color-chart)",
	"var(--color-warn)",
	"var(--color-up)",
	"var(--color-down)",
	"var(--color-muted)",
	"var(--color-subtle)"
];
function ShareRing({ items, size = 132, legend = true }) {
	const clean = items.filter((x) => x.pct > .4).slice(0, 8);
	const total = clean.reduce((s, x) => s + x.pct, 0) || 1;
	const r = 42;
	const c = 2 * Math.PI * r;
	let acc = 0;
	if (!clean.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Nothing to split yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-stretch gap-4 sm:flex-row sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: "0 0 120 120",
			className: "shrink-0",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "60",
				cy: "60",
				r,
				fill: "none",
				stroke: "var(--color-surface-2)",
				strokeWidth: "16"
			}), clean.map((it, i) => {
				const dash = it.pct / total * c;
				const gap = c - dash;
				const rot = acc / total * 360 - 90;
				acc += it.pct;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "60",
					cy: "60",
					r,
					fill: "none",
					stroke: PALETTE[i % PALETTE.length],
					strokeWidth: "16",
					strokeDasharray: `${dash} ${gap}`,
					transform: `rotate(${rot} 60 60)`,
					strokeLinecap: "butt"
				}, it.name);
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: cn("min-w-0 flex-1 grid gap-1.5", !legend && "hidden"),
			children: clean.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid grid-cols-[auto_1fr_auto] items-center gap-2 text-[12px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 shrink-0 rounded-full",
							style: { background: PALETTE[i % PALETTE.length] }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: it.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-1.5 overflow-hidden rounded-full bg-bg-elevated",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block h-full rounded-full",
							style: {
								width: `${Math.min(100, Math.max(2, it.pct))}%`,
								background: PALETTE[i % PALETTE.length]
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular text-muted",
						children: [it.pct.toFixed(0), "%"]
					})
				]
			}, it.name))
		})]
	});
}
function CapSplit({ items }) {
	const clean = items.filter((x) => x.pct > .2);
	if (!clean.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-muted",
		children: "Nothing to split yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareRing, {
			items: clean,
			size: 108,
			legend: false
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid min-w-[11rem] grid-cols-2 gap-2",
			children: clean.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md bg-bg px-3 py-2 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-subtle uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-1.5 rounded-full",
						style: { background: PALETTE[i % PALETTE.length] }
					}), it.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 font-mono text-[18px] tabular",
					children: [it.pct.toFixed(0), "%"]
				})]
			}, it.name))
		})]
	});
}
function MiniBars({ items }) {
	const max = Math.max(...items.map((x) => Math.abs(x.value)), 1);
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2",
		children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,6.5rem)_1fr_4.5rem] items-center gap-2 text-[12px] sm:grid-cols-[minmax(0,7.5rem)_1fr_4.5rem]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate font-medium",
						children: it.symbol && canOpenStock(it.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/s/$symbol",
							params: { symbol: it.symbol },
							className: "hover:text-chart",
							children: it.name
						}) : it.name
					}), it.sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-[11px] text-subtle",
						children: it.sub
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("h-full", it.tone === "down" ? "bg-down" : it.tone === "muted" ? "bg-subtle" : "bg-up"),
						style: { width: `${Math.min(100, Math.abs(it.value) / max * 100)}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("text-right font-mono tabular", it.tone === "down" ? "text-down" : it.tone === "up" ? "text-up" : "text-muted"),
					children: it.label
				})
			]
		}, it.name))
	});
}
function BreadthBar({ green, n }) {
	const pct = n > 0 ? green / n * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between font-mono text-[12px] tabular text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-up",
				children: [green, " advancing"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [pct.toFixed(0), "%"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-down",
				children: [Math.max(0, n - green), " declining"]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 h-2 overflow-hidden rounded-full bg-down/25",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-up",
			style: { width: `${Math.min(100, pct)}%` }
		})
	})] });
}
//#endregion
export { ShareRing as i, CapSplit as n, MiniBars as r, BreadthBar as t };
