import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StockLink } from "./stock-link-_eTEBrnv.mjs";
import { r as useSleeveBook } from "./use-book-Xav57S73.mjs";
import { i as ShareRing, r as MiniBars } from "./share-ring-Da2Wa3dn.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as Pct } from "./pct-BEJI7-uG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.sectors-CF30pFb3.js
var import_jsx_runtime = require_jsx_runtime();
function Sectors() {
	const { query } = useBookCtx();
	const core = query.data;
	const { book, pending } = useSleeveBook(core, true);
	const { sleeves, value } = book || core;
	const ring = sleeves.map((s) => ({
		name: s.sector,
		pct: value ? s.value / value * 100 : 0
	}));
	const gaps = [...sleeves].map((s) => {
		return {
			s,
			gap: s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null
		};
	}).filter((x) => x.gap != null).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: ["Each sleeve is the stocks you hold in that sector, versus the matching Nifty series (or the ETF that actually has a history).", pending ? " Loading index history…" : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Weight by sector"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareRing, { items: ring })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "1-year vs sector index"
					}), gaps.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: gaps.slice(0, 8).map(({ s, gap }) => ({
						name: s.sector,
						value: gap || 0,
						label: (gap >= 0 ? "+" : "") + gap.toFixed(1) + "pp",
						tone: (gap || 0) >= 0 ? "up" : "down"
					})) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Need a year of overlap versus the sector index."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[760px] text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "Sector"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "Weight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "1M you"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "1M index"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "1Y you"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "1Y index"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "1Y gap"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "Index"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sleeves.map((s) => {
						const w = value ? s.value / value * 100 : 0;
						const gap = s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: s.sector
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-subtle",
										children: [
											s.names,
											" ",
											s.names === 1 ? "stock" : "stocks",
											" · ",
											s.symbols.map((sym, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [i ? ", " : "", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, { symbol: sym })] }, sym))
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2.5 text-right font-mono tabular",
									children: [w.toFixed(0), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.windows.m1 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.index.m1 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.windows.y1 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.index.y1 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, {
										n: gap,
										digits: 1
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-muted",
									children: s.indexName
								})
							]
						}, s.sector);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 md:hidden",
				children: sleeves.map((s) => {
					const w = value ? s.value / value * 100 : 0;
					const gap = s.windows.y1 != null && s.index.y1 != null ? s.windows.y1 - s.index.y1 : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: s.sector
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "truncate text-[11px] text-subtle",
									children: [
										s.names,
										" ",
										s.names === 1 ? "stock" : "stocks",
										" · ",
										s.indexName
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[13px] tabular",
								children: [w.toFixed(0), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-2 gap-2 text-[12px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: "1Y you"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.windows.y1 })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: "1Y index"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.index.y1 })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: "1M you"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: s.windows.m1 })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: "1Y gap"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, {
									n: gap,
									digits: 1
								})] })
							]
						})]
					}, s.sector);
				})
			})
		]
	});
}
//#endregion
export { Sectors as component };
