import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Cn as cn, Gt as compactCr, It as Tooltip, Jt as fullCr, Kt as crTicks, Wt as buildFinRows, X as fmtPct, Z as fmtPx, qt as formatFinMonth, yt as grahamNumber } from "./router-B_ZlT9BI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analysis-view-BQ5PL6-K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ children, tone = "chart" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("text-[11px] font-semibold tracking-[0.12em] uppercase", tone === "down" ? "text-down" : tone === "warn" ? "text-warn" : tone === "up" ? "text-up" : tone === "muted" ? "text-subtle" : "text-chart"),
		children
	});
}
function P({ children }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1.5 text-[13.5px] leading-relaxed text-fg",
		children
	});
}
function Block({ children, label, tone }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			tone,
			children: label
		}), children]
	});
}
function Bullets({ items, tone }) {
	if (!items.length) return null;
	const mark = tone === "down" ? "bg-down" : tone === "warn" ? "bg-warn" : "bg-chart";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: cn("mt-2 grid gap-2 border-l-2 pl-3", tone === "down" ? "border-down/40" : tone === "warn" ? "border-warn/40" : "border-chart/35"),
		children: items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2 text-[13.5px] leading-snug text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5 shrink-0 rounded-full", mark) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x })]
		}, i))
	});
}
function n(v, fmt = (x) => String(x)) {
	if (v == null || !Number.isFinite(v)) return "—";
	return fmt(v);
}
var VW = 640;
var VH = 168;
var PAD = {
	l: 40,
	r: 8,
	t: 14,
	b: 28
};
function FinChart({ title, kind, sales, profits }) {
	const rows = buildFinRows(sales, profits, kind, 6);
	const [hi, setHi] = (0, import_react.useState)(null);
	if (!rows.length) return null;
	const focus = hi == null ? rows.length - 1 : hi;
	const cur = rows[focus];
	const nums = rows.flatMap((r) => [r.sales, r.profit]).filter((v) => v != null);
	const lo = Math.min(0, ...nums);
	const hiV = Math.max(...nums, 1);
	const pad = (hiV - lo) * .16 || 1;
	const yLo = lo < 0 ? lo - pad * .4 : 0;
	const yHi = hiV + pad;
	const ticks = crTicks(yLo, yHi, 4);
	const innerW = VW - PAD.l - PAD.r;
	const innerH = VH - PAD.t - PAD.b;
	const yOf = (v) => PAD.t + (yHi - v) / (yHi - yLo) * innerH;
	const zero = yOf(0);
	const slot = innerW / rows.length;
	const barW = Math.min(22, Math.max(7, slot * .32));
	const gap = 2;
	const margin = cur && cur.sales && cur.sales > 0 && cur.profit != null ? cur.profit / cur.sales * 100 : null;
	function groupX(i) {
		const cx = PAD.l + slot * i + slot / 2;
		return {
			sales: cx - barW - gap / 2,
			profit: cx + gap / 2,
			cx
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[13px] font-semibold tracking-[0.06em] text-fg uppercase",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-muted",
				children: "₹ crore. Blue = sales, green = profit. Same scale."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-sm bg-chart",
							"aria-hidden": true
						}), "Sales"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-sm bg-up",
							"aria-hidden": true
						}), "Profit"]
					}),
					hiV >= 1e5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "L = lakh crore"
					}) : null
				]
			}),
			cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-bg px-3 py-1.5 font-mono text-[12px] tabular shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[12px] font-semibold text-fg",
						children: cur.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "Sales "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-chart",
						children: cur.sales == null ? "—" : `₹ ${fullCr(cur.sales)} Cr`
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "Profit "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cur.profit != null && cur.profit < 0 ? "text-down" : "text-up",
						children: cur.profit == null ? "—" : `₹ ${fullCr(cur.profit)} Cr`
					})] }),
					margin != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "Margin "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: margin >= 0 ? "text-up" : "text-down",
						children: fmtPct(margin)
					})] }) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid items-start gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: `0 0 ${VW} ${VH}`,
						className: "h-auto w-full",
						role: "img",
						"aria-label": `${title}. Blue bars are sales, green bars are profit, in rupee crore.`,
						children: [
							ticks.map((t) => {
								const y = yOf(t);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: PAD.l,
									x2: VW - PAD.r,
									y1: y,
									y2: y,
									stroke: "var(--color-border)",
									strokeWidth: "1"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: PAD.l - 6,
									y,
									textAnchor: "end",
									dominantBaseline: "middle",
									fill: "var(--color-subtle)",
									fontSize: "10",
									fontFamily: "IBM Plex Mono, ui-monospace, monospace",
									children: compactCr(t)
								})] }, t);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: PAD.l,
								x2: VW - PAD.r,
								y1: zero,
								y2: zero,
								stroke: "var(--color-border-strong)",
								strokeWidth: "1.25"
							}),
							rows.map((r, i) => {
								const x = groupX(i);
								const active = i === focus;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
									onMouseEnter: () => setHi(i),
									onMouseLeave: () => setHi(null),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
											x: PAD.l + slot * i,
											y: PAD.t,
											width: slot,
											height: innerH + PAD.b,
											fill: "var(--color-surface-2)",
											fillOpacity: active ? .55 : 0
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinBar, {
											x: x.sales,
											zero,
											yOf,
											value: r.sales,
											width: barW,
											fill: "var(--color-chart)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinBar, {
											x: x.profit,
											zero,
											yOf,
											value: r.profit,
											width: barW,
											fill: r.profit != null && r.profit < 0 ? "var(--color-down)" : "var(--color-up)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: x.cx,
											y: 158,
											textAnchor: "middle",
											fill: active ? "var(--color-fg)" : "var(--color-subtle)",
											fontSize: "10",
											fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
											children: kind === "quarter" ? r.label.replace(" FY", "’") : r.label
										})
									]
								}, r.period);
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinTable, {
					rows,
					kind
				})]
			})
		]
	});
}
function FinBar({ x, zero, yOf, value, width, fill }) {
	if (value == null || !Number.isFinite(value)) return null;
	const y = yOf(value);
	const top = Math.min(y, zero);
	const h = Math.max(2, Math.abs(zero - y));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x,
		y: top,
		width,
		height: h,
		fill,
		rx: "2"
	}) });
}
function FinTable({ rows, kind }) {
	const yoy = (key, i) => {
		if (i < 1) return null;
		const a = rows[i - 1][key];
		const b = rows[i][key];
		if (a == null || b == null || !(a > 0)) return null;
		return (b / a - 1) * 100;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-x-auto rounded-md shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[280px] border-collapse text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border bg-bg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "sticky left-0 z-10 min-w-[4.5rem] border-r border-border bg-bg-elevated px-2 py-2 text-[12px] font-semibold text-fg",
					children: "₹ Cr"
				}), rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-2 py-2 text-right text-[12px] font-semibold text-fg",
					children: r.label
				}, r.period))]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: [[
				"Sales",
				"sales",
				"text-chart"
			], [
				"Profit",
				"profit",
				"text-up"
			]].map(([name, key, tone], ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: ri ? "bg-bg/40" : "border-b border-border/70",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "sticky left-0 z-10 border-r border-border bg-bg-elevated px-2 py-2 text-[13px] font-semibold text-fg",
					children: name
				}), rows.map((r, i) => {
					const v = r[key];
					const ch = yoy(key, i);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-2 py-2 text-right font-mono tabular",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("text-[13px] font-medium", v != null && v < 0 ? "text-down" : tone),
							children: n(v, fullCr)
						}), ch != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("text-[11px] font-medium", ch >= 0 ? "text-up" : "text-down"),
							children: fmtPct(ch)
						}) : null]
					}, r.period);
				})]
			}, key)) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "sr-only",
			children: [kind === "year" ? "Yearly" : "Quarterly", " sales and profit in rupee crore, with year-on-year change under each figure."]
		})]
	});
}
function OwnershipBlock({ fund }) {
	const p = fund?.promoters ?? null;
	const fii = fund?.fii ?? null;
	const dii = fund?.dii ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ownership" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-subtle",
				children: "Promoter, FII and DII from the latest shareholding print. Blank means missing."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					["Promoters", p],
					["FII", fii],
					["DII", dii]
				].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-[22px] tabular",
						children: v != null ? `${v.toFixed(1)}%` : "—"
					})]
				}, k))
			})
		]
	});
}
function FinancialSnapshot({ fund, bare, price }) {
	if (!fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: bare ? "" : "mt-5",
		children: [!bare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			tone: "muted",
			children: "Financial snapshot"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-[13px] text-muted",
			children: "No company numbers for this ticker — numbers are not invented."
		})]
	});
	const peTone = fund.pe != null && fund.industryPe != null ? fund.pe <= fund.industryPe ? "up" : fund.pe > fund.industryPe * 1.2 ? "down" : void 0 : void 0;
	const rows = [
		[
			"Market cap",
			fund.mcapCr != null ? `₹${fund.mcapCr.toLocaleString("en-IN")} Cr` : "—",
			void 0,
			"Shares outstanding × last price, in ₹ crore."
		],
		[
			"Stock P/E",
			n(fund.pe, (x) => x.toFixed(1)),
			peTone,
			"Price ÷ trailing twelve-month earnings. Blank if earnings are missing or negative."
		],
		[
			"Industry P/E",
			n(fund.industryPe, (x) => x.toFixed(1)),
			void 0,
			"Median P/E of the reported industry, not a peer you picked."
		],
		[
			"P/B",
			n(fund.pb, (x) => x.toFixed(2)),
			fund.pb != null ? fund.pb <= 3 ? "up" : fund.pb >= 8 ? "down" : void 0 : void 0,
			"Price ÷ book value per share."
		],
		[
			"Book value",
			fund.book != null ? fmtPx(fund.book) : "—",
			void 0,
			"Net worth per share on the company card."
		],
		[
			"EPS (TTM)",
			fund.eps != null ? `₹${fund.eps.toFixed(2)}` : "—",
			fund.eps != null ? fund.eps >= 0 ? "up" : "down" : void 0,
			"Trailing twelve-month earnings per share."
		],
		[
			"ROE",
			fund.roe != null ? `${fund.roe.toFixed(1)}%` : "—",
			fund.roe != null ? fund.roe >= 15 ? "up" : fund.roe < 10 ? "down" : void 0 : void 0,
			"Return on equity. Profit against shareholder funds."
		],
		[
			"ROCE",
			fund.roce != null ? `${fund.roce.toFixed(1)}%` : "—",
			fund.roce != null ? fund.roce >= 20 ? "up" : fund.roce < 10 ? "down" : void 0 : void 0,
			"Return on capital employed from the company card."
		],
		[
			"OPM",
			fund.opm != null ? `${fund.opm.toFixed(1)}%` : "—",
			fund.opm != null ? fund.opm >= 12 ? "up" : fund.opm < 6 ? "down" : void 0 : void 0,
			"Operating profit margin. Blank if the card does not print it."
		],
		[
			"Cash / profit",
			fund.cfoPat != null ? `${fund.cfoPat.toFixed(2)}×` : "—",
			fund.cfoPat != null ? fund.cfoPat >= .8 ? "up" : fund.cfoPat < .5 ? "down" : void 0 : void 0,
			"Latest operating cash ÷ latest reported profit. Unavailable when cash flow is missing."
		],
		[
			"Debt / equity",
			n(fund.de, (x) => x.toFixed(2)),
			fund.de != null ? fund.de <= .5 ? "up" : fund.de > 1 ? "down" : void 0 : void 0,
			"Total debt ÷ net worth. Banks often skip this print."
		],
		[
			"Dividend yield",
			fund.divYield != null ? `${fund.divYield.toFixed(2)}%` : "—",
			fund.divYield != null && fund.divYield >= 2 ? "up" : void 0,
			"Trailing dividend ÷ last price."
		],
		[
			"Face value",
			fund.face != null ? `₹${fund.face}` : "—",
			void 0,
			"Face value of one share."
		],
		[
			"Sales growth (yr)",
			fund.salesYoY != null ? fmtPct(fund.salesYoY) : "—",
			fund.salesYoY != null ? fund.salesYoY >= 0 ? "up" : "down" : void 0,
			"Latest yearly sales versus the year before."
		],
		[
			"Profit growth (yr)",
			fund.profitYoY != null ? fmtPct(fund.profitYoY) : "—",
			fund.profitYoY != null ? fund.profitYoY >= 0 ? "up" : "down" : void 0,
			"Latest yearly profit versus the year before."
		],
		[
			"PEG",
			fund.peg != null ? fund.peg.toFixed(2) + (fund.pegVia ? " · " + fund.pegVia : "") : "—",
			fund.peg != null ? fund.peg <= 1.5 ? "up" : fund.peg >= 3 ? "down" : void 0 : void 0,
			"P/E ÷ profit CAGR. Only when growth is positive."
		],
		[
			"Graham number",
			(() => {
				const g = grahamNumber(fund.eps, fund.book);
				if (g == null) return "—";
				if (price && price > 0) {
					const gap = (price / g - 1) * 100;
					return `₹${g.toFixed(0)} · last ${gap >= 0 ? "+" : ""}${gap.toFixed(0)}%`;
				}
				return `₹${g.toFixed(0)}`;
			})(),
			void 0,
			"√(22.5 × EPS × book value). A textbook ceiling, not a target."
		],
		[
			"Interest cover",
			fund.interestCover != null ? fund.interestCover.toFixed(1) + "×" : "—",
			fund.interestCover != null ? fund.interestCover >= 4 ? "up" : fund.interestCover < 1.5 ? "down" : void 0 : void 0,
			"Operating profit ÷ interest. How many times interest is earned."
		],
		[
			"Promoters",
			fund.promoters != null ? `${fund.promoters.toFixed(1)}%` : "—",
			fund.promoters != null ? fund.promoters >= 50 ? "up" : fund.promoters < 25 ? "down" : void 0 : void 0,
			"Promoter holding on the latest shareholding print."
		],
		[
			"FII",
			fund.fii != null ? `${fund.fii.toFixed(1)}%` : "—",
			void 0,
			"Foreign institutional holding on the latest print."
		],
		[
			"DII",
			fund.dii != null ? `${fund.dii.toFixed(1)}%` : "—",
			void 0,
			"Domestic institutional holding on the latest print."
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: bare ? "" : "mt-5",
		children: [
			!bare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Financial snapshot" }) : null,
			!bare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-subtle",
				children: "Company card — blank means missing, not a guess. Hover a label."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2",
				children: rows.map(([k, v, tone, help]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[13px] text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: help,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-left text-[13px] text-muted hover:text-fg",
								children: k
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: cn("font-mono text-[16px] font-semibold tabular", tone === "up" && "text-up", tone === "down" && "text-down"),
						children: v
					})]
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinChart, {
				title: "Yearly sales and profit",
				kind: "year",
				sales: fund.sales,
				profits: fund.profits
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinChart, {
				title: "Quarterly sales and profit",
				kind: "quarter",
				sales: fund.qSales,
				profits: fund.qProfits
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorthTable, {
				title: "Net worth yearly (₹ Cr)",
				points: fund.netWorth
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorthTable, {
				title: "Net worth quarterly (₹ Cr)",
				points: fund.qNetWorth
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareTable, { rows: fund.shareholding })
		]
	});
}
function WorthTable({ title, points }) {
	if (!points.length) return null;
	const show = [...points].sort((a, b) => a.period.localeCompare(b.period)).slice(-6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[13px] font-semibold tracking-[0.06em] text-fg uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 overflow-x-auto rounded-md shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[520px] border-collapse text-left text-[14px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border bg-bg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "sticky left-0 z-10 min-w-[10rem] border-r border-border bg-bg-elevated px-4 py-3 text-[14px] font-semibold text-fg",
						children: "₹ Crore"
					}), show.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2.5 text-right text-[13px] font-semibold text-fg",
						children: formatFinMonth(p.period)
					}, p.period))]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "sticky left-0 z-10 border-r border-border bg-bg-elevated px-3 py-3 text-[15px] font-semibold text-fg",
					children: "Net worth"
				}), show.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-3 py-3 text-right font-mono text-[14px] tabular",
					children: n(p.value, fullCr)
				}, p.period))] }) })]
			})
		})]
	});
}
function ShareTable({ rows }) {
	if (!rows.length) return null;
	const show = rows.slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[13px] font-semibold tracking-[0.06em] text-fg uppercase",
			children: "Shareholding"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 overflow-x-auto rounded-md shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[520px] border-collapse text-left text-[14px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border bg-bg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "sticky left-0 z-10 min-w-[8.5rem] border-r border-border bg-bg-elevated px-3 py-2.5 text-[13px] font-semibold text-fg",
							children: "Period"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2.5 text-right text-[13px] font-semibold text-fg",
							children: "Promoters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2.5 text-right text-[13px] font-semibold text-fg",
							children: "FII"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2.5 text-right text-[13px] font-semibold text-fg",
							children: "DII"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: show.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "sticky left-0 z-10 border-r border-border bg-bg-elevated px-3 py-3 text-[15px] font-semibold text-fg",
							children: formatFinMonth(r.period)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-3 text-right font-mono tabular", (r.promoters ?? 0) >= 50 ? "text-up" : (r.promoters ?? 50) < 25 ? "text-down" : ""),
							children: n(r.promoters, (x) => x.toFixed(1) + "%")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 text-right font-mono tabular",
							children: n(r.fii, (x) => x.toFixed(1) + "%")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 text-right font-mono tabular",
							children: n(r.dii, (x) => x.toFixed(1) + "%")
						})
					]
				}, r.period)) })]
			})
		})]
	});
}
function TagLine({ tag, tone }) {
	if (!tag) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-wrap items-end gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: cn("text-[28px] font-semibold leading-none tracking-tight", tone === "warn" ? "text-warn" : "text-chart"),
			children: tag
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-0.5 text-[11px] tracking-[0.08em] text-subtle uppercase",
			children: "Verdict"
		})]
	});
}
function numberTone(sentence, token) {
	const s = sentence.toLowerCase();
	const num = Number(token.replace(/[,₹%]/g, ""));
	if (!Number.isFinite(num)) return void 0;
	const negative = token.startsWith("-") || num < 0;
	if (/(debt\/equity|d\/e|leverage|pledge|drawdown|loss|decline|erosion|stretched|demanding|expensive|overvalued)/.test(s)) {
		if (/(cheap|conservative|manageable|low debt)/.test(s)) return "up";
		return negative ? "up" : num > 1 && /(d\/e|debt)/.test(s) ? "down" : "down";
	}
	if (/(roe|roce|margin|growth|profit|sales|promoter|compound)/.test(s)) return negative ? "down" : "up";
	if (/%/.test(token) || /%/.test(s)) return negative ? "down" : "up";
}
var GOOD_WORD = /^(healthy|cheap|conservative|sound|strong|durable|solid|constructive|reasonable|fair|positive)$/i;
var BAD_WORD = /^(weak|stretched|demanding|expensive|deteriorating|decline|loss|erosion|pledged|overvalued|negative|fragile)$/i;
function ColorLine({ text }) {
	const parts = text.split(/(\-?₹?[\d,]+\.?\d*%?)/g);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: parts.map((p, i) => {
		if (/^[\-₹]?[\d,]+\.?\d*%?$/.test(p) && /\d/.test(p)) {
			const tone = numberTone(text, p);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-mono tabular", tone === "up" && "text-up", tone === "down" && "text-down"),
				children: p
			}, i);
		}
		const words = p.split(/(\s+)/);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: words.map((w, j) => {
			if (GOOD_WORD.test(w)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-up",
				children: w
			}, j);
			if (BAD_WORD.test(w)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-down",
				children: w
			}, j);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: w }, j);
		}) }, i);
	}) });
}
function SkillMarkdown({ text, color }) {
	const body = stripMarks(text.replace(/\btape\b/gi, "session").replace(/\bmix\b/gi, "portfolio").replace(/\bthe book\b/gi, "the portfolio").replace(/\bthis book\b/gi, "this portfolio")).trim();
	if (!body) return null;
	const pin = extractPin(body);
	const lines = pin.body.split("\n");
	const nodes = [];
	let list = [];
	let table = null;
	function flush() {
		if (!list.length) return;
		const items = list;
		list = [];
		nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "my-2 grid gap-1.5 border-l-2 border-chart/30 pl-3",
			children: items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-[14px] leading-relaxed text-fg",
				children: color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorLine, { text: x }) : x
			}, i))
		}, "l" + nodes.length));
	}
	function flushTable() {
		if (!table?.length) {
			table = null;
			return;
		}
		const rows = table;
		table = null;
		const head = rows[0];
		const bodyRows = rows.slice(1);
		nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "my-3 overflow-x-auto rounded-md bg-bg-elevated shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[420px] text-[13px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border text-left",
					children: head.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: c
					}, i))
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: bodyRows.map((row, ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: row.map((c, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 align-top",
						children: color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorLine, { text: c }) : c
					}, ci))
				}, ri)) })]
			})
		}, "t" + nodes.length));
	}
	for (const raw of lines) {
		const t = raw.trimEnd().trim();
		if (!t) {
			flush();
			flushTable();
			continue;
		}
		const cells = parseMdRow(t);
		if (cells) {
			flush();
			if (!cells.length) continue;
			if (!table) table = [cells];
			else table.push(cells);
			continue;
		}
		flushTable();
		if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
			list.push(t.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
			continue;
		}
		flush();
		const h = t.match(/^(#{1,4})\s+(.*)$/);
		const boldH = t.match(/^([A-Z][A-Za-z0-9 /&+\-]{2,48})$/);
		const labeled = t.match(/^([A-Za-z][A-Za-z0-9 /&+\-]{2,40})\s*[:：]\s*(.+)$/);
		if (h || boldH && t.length < 48 && !/[.!?]$/.test(t)) {
			const title = (h ? h[2] : boldH[1]).trim();
			if (/final verdict|multi-?bagger potential/i.test(title)) continue;
			const cls = h && h[1].length <= 2 ? "mt-5 text-[15px] font-semibold tracking-tight text-fg" : "mt-4 text-[13px] font-semibold tracking-[0.06em] text-chart uppercase";
			nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: cls,
				children: title
			}, "h" + nodes.length));
			continue;
		}
		if (labeled && labeled[2].length < 160 && !/[.!?]$/.test(labeled[1])) {
			const tone = noteTone(labeled[2]);
			nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 flex flex-wrap items-baseline gap-2 text-[14px] leading-relaxed text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-1.5 py-0.5 text-[11px] font-medium", tone === "up" && "bg-up/15 text-up", tone === "down" && "bg-down/15 text-down", tone === "muted" && "bg-surface-2 text-muted"),
					children: labeled[1]
				}), color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorLine, { text: labeled[2] }) : labeled[2]]
			}, "p" + nodes.length));
			continue;
		}
		nodes.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[14px] leading-relaxed text-fg",
			children: color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorLine, { text: t }) : t
		}, "p" + nodes.length));
	}
	flush();
	flushTable();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2",
		children: [pin.potential || pin.verdict || pin.factors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 rounded-md bg-bg-elevated px-3 py-3 shadow-[var(--shadow-border)]",
			children: [
				pin.potential ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PotentialChip, { label: pin.potential })
				}) : null,
				pin.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[15px] font-medium leading-relaxed text-fg",
					children: color ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorLine, { text: pin.verdict }) : pin.verdict
				}) : null,
				pin.factors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-wrap gap-1.5",
					children: pin.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("rounded-sm px-2 py-0.5 text-[11px] font-medium", f.tone === "up" && "bg-up/15 text-up", f.tone === "down" && "bg-down/15 text-down", f.tone === "muted" && "bg-surface-2 text-muted"),
						title: f.note,
						children: f.name
					}, f.name))
				}) : null
			]
		}) : null, nodes]
	});
}
function parseMdRow(t) {
	const s = t.trim();
	if (!s.includes("|")) return null;
	if (!s.startsWith("|") && (s.match(/\|/g) || []).length < 2) return null;
	const cells = s.split("|").map((x) => x.trim());
	if (s.startsWith("|")) cells.shift();
	if (s.endsWith("|") || cells[cells.length - 1] === "") cells.pop();
	if (cells.length < 2) return null;
	if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return [];
	return cells;
}
function noteTone(note) {
	const s = note.toLowerCase();
	if (/weak|stretched|expensive|high debt|pledge|decline|fragile|poor|deteriorat|overvalued|risky|avoid|low\b/.test(s)) return "down";
	if (/strong|healthy|cheap|durable|sound|conservative|solid|reasonable|fair|robust|clean|high\b/.test(s)) return "up";
	return "muted";
}
function stripMarks(s) {
	return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/(^|\s)\*(\S)/g, "$1$2").replace(/(\S)\*(?=\s|$)/g, "$1").replace(/_{2,}/g, "");
}
function extractPin(text) {
	const lines = text.split("\n");
	let verdict = "";
	let potential = "";
	const keep = [];
	let grabbing = null;
	const verdictBuf = [];
	const factors = [];
	const seen = /* @__PURE__ */ new Set();
	function pushFactor(name, note) {
		const key = name.toLowerCase();
		if (seen.has(key) || note.length < 4) return;
		seen.add(key);
		const s = note.toLowerCase();
		const tone = /weak|stretched|expensive|high debt|pledge|decline|fragile|poor|deteriorat|overvalued|risky/.test(s) ? "down" : /strong|healthy|cheap|durable|sound|conservative|solid|reasonable|fair|robust|clean/.test(s) ? "up" : "muted";
		factors.push({
			name,
			tone,
			note: note.slice(0, 160)
		});
	}
	for (const raw of lines) {
		const t = raw.trim();
		if (/^#{1,4}\s*final verdict\b/i.test(t) || /^final verdict\b/i.test(t)) {
			grabbing = "verdict";
			continue;
		}
		if (/multi-?bagger potential/i.test(t) && t.length < 80) {
			const m = t.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|unlikely)/i);
			if (m) {
				const rawL = m[1].toLowerCase();
				potential = rawL === "medium" ? "Moderate" : rawL.slice(0, 1).toUpperCase() + rawL.slice(1);
			}
			grabbing = grabbing === "verdict" ? "verdict" : "potential";
			continue;
		}
		if (/^#{1,4}\s+/.test(t) || /^[A-Z][A-Za-z0-9 /&+\-]{2,40}$/.test(t) && t.length < 48) grabbing = null;
		if (grabbing === "verdict" && t) verdictBuf.push(t);
		const factorHit = t.match(/^(?:#{1,4}\s+)?(Profitability|Balance sheet|Leverage|Growth|Valuation|Ownership|Promoter(?:s)?|Management|Industry|Brand|Moat|Capital allocation)\s*[:.]?\s*(.*)$/i);
		if (factorHit) pushFactor(factorHit[1].replace(/^./, (c) => c.toUpperCase()), factorHit[2] || factorHit[1]);
		keep.push(raw);
	}
	verdict = verdictBuf.filter((p) => !/^#{1,4}/.test(p)).join(" ").trim();
	if (!potential) {
		const m = text.match(/multi-?bagger potential\s*[:\-–]\s*(high|moderate|medium|low|unlikely)/i);
		if (m) {
			const rawL = m[1].toLowerCase();
			potential = rawL === "medium" ? "Moderate" : rawL.slice(0, 1).toUpperCase() + rawL.slice(1);
		}
	}
	const body = keep.filter((ln) => {
		const t = ln.trim();
		if (/^#{1,4}\s*final verdict\b/i.test(t) || /^final verdict\b/i.test(t)) return false;
		return true;
	}).join("\n");
	return {
		verdict,
		potential,
		factors: factors.slice(0, 8),
		body
	};
}
function PotentialChip({ label }) {
	if (!label) return null;
	const s = label.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("rounded-sm px-2 py-0.5 text-[12px] font-medium", s === "high" ? "text-up bg-up/15" : s === "moderate" ? "text-warn bg-warn/15" : "text-down bg-down/15"),
		children: ["Multi-bagger potential: ", label]
	});
}
function FundamentalView({ block }) {
	const prose = block.prose && block.prose.length > 40 ? block.prose : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		"data-skill": "fundamental",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fundamental analysis" }), prose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMarkdown, {
			text: prose,
			color: true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			block.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-[15px] leading-relaxed text-fg",
				children: block.verdict
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2",
				children: [
					block.business ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Business" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.business })] }) : null,
					block.industry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Industry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.industry })] }) : null,
					block.position ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Position" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.position })] }) : null,
					block.profitability ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Profitability" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.profitability })] }) : null,
					block.valuation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Valuation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.valuation })] }) : null,
					block.balanceSheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						tone: "muted",
						children: "Balance sheet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.balanceSheet })] }) : null,
					block.growth ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Growth" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.growth })] }) : null
				]
			}),
			block.snapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Company",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.snapshot })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Risks",
				tone: "down",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.risks.slice(0, 3),
					tone: "down"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "What would change this",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.changeMind.slice(0, 2) })
			})
		] })]
	});
}
function factorTone(s) {
	if (s === "positive") return {
		chip: "bg-up/15 text-up",
		bar: "bg-up"
	};
	if (s === "negative") return {
		chip: "bg-down/15 text-down",
		bar: "bg-down"
	};
	if (s === "watch") return {
		chip: "bg-warn/20 text-warn",
		bar: "bg-warn"
	};
	return {
		chip: "bg-surface-2 text-muted",
		bar: "bg-subtle"
	};
}
function QualitativeView({ block }) {
	const prose = block.prose && block.prose.length > 40 ? block.prose : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border-l-[3px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]",
		"data-skill": "qualitative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				tone: "warn",
				children: "Qualitative analysis"
			}),
			block.potentialLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PotentialChip, { label: block.potentialLabel })
			}) : null,
			prose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMarkdown, {
				text: prose,
				color: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				block.headline && block.headline !== block.tag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-[15px] leading-relaxed text-fg",
					children: block.headline
				}) : null,
				block.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-[15px] leading-relaxed text-fg",
					children: block.verdict
				}) : null,
				block.allFactors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					label: "All-factor check",
					tone: "muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-2.5",
						children: block.allFactors.slice(0, 8).map((f) => {
							const t = factorTone(f.status);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.bar) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[13.5px] font-medium",
											children: f.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("rounded-sm px-1.5 py-0.5 text-[11px]", t.chip),
											children: f.status
										})]
									}), f.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[13px] leading-snug text-muted",
										children: f.note
									}) : null]
								})]
							}, f.name);
						})
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						label: "Positive",
						tone: "up",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.positive.slice(0, 3) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						label: "Combinations",
						tone: "warn",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
							items: block.combinations.slice(0, 2),
							tone: "warn"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					label: "Catalysts",
					tone: "warn",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
						items: block.catalysts.slice(0, 2),
						tone: "warn"
					})
				}),
				block.pricedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					label: "Already in the price",
					tone: "muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.pricedIn })
				}) : null,
				block.noise ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					label: "Noise",
					tone: "muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.noise })
				}) : null
			] })
		]
	});
}
function CombinedView({ text }) {
	if (!text.trim()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border-l-[3px] border-l-fg bg-surface p-4 shadow-[var(--shadow-border)]",
		"data-skill": "combined",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				tone: "muted",
				children: "Combined verdict"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-[22px] font-semibold tracking-tight",
				children: "One read from both"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-muted",
				children: "Uses the two analyses above. Not a third independent read."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMarkdown, {
				text,
				color: true
			})
		]
	});
}
function AnalysisSkeleton({ kicker }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-32 rounded-sm bg-chart/70" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-5 w-4/5 animate-pulse rounded-sm bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-24 animate-pulse rounded-sm bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-24 animate-pulse rounded-sm bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-muted",
				children: [
					"Reading ",
					kicker,
					"…"
				]
			})
		]
	});
}
function StructureView({ block }) {
	const tone = block.bias === "up" ? "up" : block.bias === "down" ? "down" : "muted";
	const fmt = (n) => n > 0 ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		"data-skill": "structure",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Structure" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagLine, {
				tag: block.tag,
				tone: "chart"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: ["Bias ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-medium", tone === "up" && "text-up", tone === "down" && "text-down"),
					children: block.bias
				})]
			}),
			block.setup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.setup }) : null,
			block.support.length || block.resistance.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[280px] text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1.5 pr-3 font-medium",
									children: "Side"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1.5 pr-3 font-medium",
									children: "Level"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1.5 font-medium",
									children: "Why"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [block.support.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 text-up",
								children: "Support"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 font-mono tabular",
								children: fmt(r.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 text-muted",
								children: r.note
							})
						]
					}, "s" + i)), block.resistance.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 text-down",
								children: "Resistance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 font-mono tabular",
								children: fmt(r.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 text-muted",
								children: r.note
							})
						]
					}, "r" + i))] })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Levels",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.levels.slice(0, 6) })
			}),
			block.swings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					tone: "muted",
					children: "HH / HL"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: block.swings.slice(0, 10).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-sm bg-bg px-2 py-1 font-mono text-[12px] tabular shadow-[var(--shadow-border)]",
						children: [
							s.label,
							" ",
							s.price ? fmt(s.price) : ""
						]
					}, s.label + i))
				})]
			}) : null,
			block.mtf.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Multi-timeframe",
				tone: "warn",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.mtf.slice(0, 4),
					tone: "warn"
				})
			}) : null,
			block.invalidation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Invalidation",
				tone: "down",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.invalidation })
			}) : null,
			block.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Read",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.verdict })
			}) : null
		]
	});
}
//#endregion
export { OwnershipBlock as a, StructureView as c, FundamentalView as i, CombinedView as n, QualitativeView as o, FinancialSnapshot as r, SkillMarkdown as s, AnalysisSkeleton as t };
