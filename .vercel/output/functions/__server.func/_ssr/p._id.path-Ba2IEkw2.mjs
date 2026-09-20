import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Hn as parseHoldingsFiles, Pn as useKosh, R as fmtInr, Xn as cn, Zn as displayName, an as Button, z as fmtPct, zn as auditTradeLines } from "./router-CreVHe0E.mjs";
import { i as apiHistories } from "./api-DtVFWAsH.mjs";
import { t as enrichHoldings } from "./enrich-ChwNMbZN.mjs";
import { a as niceY, c as yTicks, i as TICK_FILL, n as NavChart, o as xOf, r as PAD, s as yOf, t as GRID_STROKE } from "./nav-chart-Ki6KU-h6.mjs";
import { a as pathToChartNav, n as fillTradePrices, r as mixVsPathGaps } from "./path-CDQnJaaE.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { n as WindowsGrid, t as MonthHeatmap } from "./windows-grid-bw73jrzr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.path-Ba2IEkw2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PALETTE = [
	"#e0a45a",
	"#7aa2ff",
	"#7d9570",
	"#c4b08a",
	"#ef6e6e",
	"#8aa0b8",
	"#b08d6a",
	"#3dcf8e",
	"#9a9aa4"
];
function pickNames(slices, cap = 8) {
	const peak = /* @__PURE__ */ new Map();
	for (const s of slices) for (const p of s.parts) {
		const cur = peak.get(p.symbol);
		if (!cur || p.value > cur.v) peak.set(p.symbol, {
			name: p.name,
			v: p.value
		});
	}
	return [...peak.entries()].sort((a, b) => b[1].v - a[1].v).slice(0, cap).map(([k]) => k);
}
function linesOf(slices) {
	const top = pickNames(slices);
	const topSet = new Set(top);
	const names = /* @__PURE__ */ new Map();
	for (const s of slices) for (const p of s.parts) names.set(p.symbol, p.name);
	const keys = [...top];
	if (slices.some((s) => s.parts.some((p) => !topSet.has(p.symbol)))) keys.push("OTHER");
	return keys.map((key, i) => ({
		key,
		name: key === "OTHER" ? "Other" : names.get(key) || key,
		color: PALETTE[i % PALETTE.length],
		values: slices.map((s) => {
			if (key === "OTHER") {
				const v = s.parts.filter((p) => !topSet.has(p.symbol)).reduce((a, p) => a + p.value, 0);
				return v > 0 ? v : null;
			}
			const hit = s.parts.find((p) => p.symbol === key);
			return hit && hit.value > 0 ? hit.value : null;
		})
	}));
}
function PathStack({ slices }) {
	const all = (0, import_react.useMemo)(() => linesOf(slices), [slices]);
	const [off, setOff] = (0, import_react.useState)({});
	const visible = all.filter((l) => !off[l.key]);
	const n = slices.length;
	const vals = [];
	for (const l of visible) for (const v of l.values) if (v != null && Number.isFinite(v)) vals.push(v);
	let yLo = vals.length ? Math.min(...vals) : 0;
	let yHi = vals.length ? Math.max(...vals) : 1;
	if (yLo === yHi) {
		const pad = Math.max(Math.abs(yLo) * .08, 1);
		yLo -= pad;
		yHi += pad;
	} else {
		const span = yHi - yLo || 1;
		yLo -= span * .1;
		yHi += span * .1;
	}
	const ticks = yTicks(yLo, yHi);
	function dOf(line) {
		const parts = [];
		let drawing = false;
		for (let i = 0; i < n; i++) {
			const v = line.values[i];
			if (v == null || !Number.isFinite(v)) {
				drawing = false;
				continue;
			}
			const x = xOf(i, n);
			const y = yOf(v, yLo, yHi);
			parts.push(`${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
			drawing = true;
		}
		return parts.join(" ");
	}
	function flip(key) {
		const next = {
			...off,
			[key]: !off[key]
		};
		if (all.every((l) => next[l.key])) return;
		setOff(next);
	}
	if (n < 2 || all.length < 1) return null;
	const xCount = Math.min(6, n);
	const xIdx = Array.from({ length: xCount }, (_, i) => Math.round(i * (n - 1) / Math.max(1, xCount - 1)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "What you held"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-3 text-[13px] leading-relaxed text-muted",
				children: "Each line is the rupees in that name after buys and sells. Tap a name to hide it — the scale follows what is on."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex flex-wrap items-center gap-1.5",
				children: all.map((l) => {
					const on = !off[l.key];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": on,
						title: on ? `Hide ${l.name}` : `Show ${l.name}`,
						onClick: () => flip(l.key),
						className: cn("inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] leading-none shadow-[var(--shadow-border)]", on ? "bg-bg-elevated text-fg" : "text-subtle line-through decoration-subtle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-block h-[3px] w-3.5 shrink-0 rounded-full",
							style: { background: on ? l.color : "#6e6e76" }
						}), l.name]
					}, l.key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "kosh-plot relative mt-2 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					alt: "Rupees held in each name",
					width: 800,
					height: 300,
					className: "kosh-plot-img",
					src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300" preserveAspectRatio="none">` + ticks.map((v) => {
						const y = yOf(v, yLo, yHi);
						return `<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${800 - PAD.r}" y2="${y.toFixed(2)}" stroke="${GRID_STROKE}" stroke-width="1"/><text x="${PAD.l - 6}" y="${y.toFixed(2)}" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="end" dominant-baseline="middle">${esc(niceY(v, true))}</text>`;
					}).join("") + xIdx.map((i) => {
						if (!slices[i]) return "";
						return `<text x="${xOf(i, n).toFixed(2)}" y="292" fill="${TICK_FILL}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${esc(slices[i].day.slice(2))}</text>`;
					}).join("") + visible.map((l) => {
						const d = dOf(l);
						if (!d.startsWith("M")) return "";
						return `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="${l.key === visible[0]?.key ? 2.2 : 1.7}" stroke-linejoin="round" stroke-linecap="round"/>`;
					}).join("") + `</svg>`)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[11px] text-subtle",
				children: [
					visible.length,
					" line",
					visible.length === 1 ? "" : "s",
					" · ",
					n,
					" month-ends"
				]
			})
		]
	});
}
function esc(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function dayLabel(d) {
	const [y, m, day] = (d || "").split("-");
	if (!y || !m || !day) return d || "—";
	const mo = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number(m) - 1];
	return mo ? `${Number(day)} ${mo} ${y}` : d;
}
function monthLabel(key) {
	const [y, m] = (key || "").split("-");
	const mo = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number(m) - 1];
	return mo ? `${mo} ${y}` : key;
}
function tone(n) {
	if (n == null || !Number.isFinite(n)) return "text-muted";
	if (n > 0) return "text-up";
	if (n < 0) return "text-down";
	return "text-muted";
}
function PathDesk({ path, benchName, portfolioId, mixRows, mixValue }) {
	if (!path.nTrades) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: "Your path"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[13px] leading-relaxed text-muted",
			children: [
				"Mix above is today’s remaining names, taken back through each stock’s history. Your path needs a buy/sell file with dates.",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/p/$id/path",
					params: { id: portfolioId },
					className: "text-chart hover:underline",
					children: "Open Path"
				})
			]
		})]
	});
	if (!path.nav.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: "Your path"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] leading-relaxed text-muted",
			children: path.nUndated ? `${path.nUndated} line${path.nUndated === 1 ? "" : "s"} in the trade file have no date. Path needs a date on each buy and sell.` : "No daily prices for the names in the trade file yet."
		})]
	});
	const nifty = path.benchTwr;
	const vsNifty = path.twr != null && nifty != null ? path.twr - nifty : null;
	const gaps = mixRows?.length ? mixVsPathGaps(mixRows, path.stillHeld) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Performance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: [
						"How the names you actually held did, after taking out extra money you added later. ",
						benchName,
						" is the same stretch, same method — not every stock sale treated as cash leaving the market.",
						path.nUndated ? ` ${path.nUndated} line${path.nUndated === 1 ? "" : "s"} had no date and were skipped.` : "",
						mixValue != null && mixValue > 0 ? ` This mix today is ${fmtInr(mixValue)}.` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "How the holdings did",
							value: path.twr == null ? "—" : fmtPct(path.twr),
							hint: "Time-weighted. Extra cash you put in later is taken out.",
							className: tone(path.twr)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Per year",
							value: path.twrCagr == null ? "—" : fmtPct(path.twrCagr),
							hint: "Same figure, expressed as a yearly rate",
							className: tone(path.twrCagr)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: `${benchName} same days`,
							value: nifty == null ? "—" : fmtPct(nifty),
							hint: "Index over the same first-to-last stretch",
							className: tone(nifty)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Difference",
							value: vsNifty == null ? "—" : fmtPct(vsNifty),
							hint: "Holdings minus the index, same method",
							className: tone(vsNifty)
						})
					]
				}),
				path.windows && Object.keys(path.windows).length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-[12px] text-muted",
						children: "Each window uses the same method. Extra money added later is taken out of these percentages."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowsGrid, {
						windows: path.windows,
						portLabel: "Your path",
						benchLabel: benchName
					})]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Journey"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: ["How bumpy the actual holdings were — not this mix taken back.", path.splitNote ? " A corporate action may affect historical share quantities. Verify the trade file if a reconstructed holding looks wrong." : ""]
				}),
				path.risk && (path.risk.maxDd != null || path.risk.vol != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Max drop",
							value: path.risk.maxDd == null ? "—" : fmtPct(path.risk.maxDd),
							hint: "Largest fall from a previous peak of the holdings you actually had",
							className: tone(path.risk.maxDd)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Swing",
							value: path.risk.vol == null ? "—" : fmtPct(path.risk.vol),
							hint: "How bumpy the path was, yearly"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Sharpe",
							value: path.risk.sharpe == null ? "—" : path.risk.sharpe.toFixed(2),
							hint: "Return earned relative to the bump taken. Rf 6.5%.",
							className: tone(path.risk.sharpe)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "If I had held",
							value: path.neverSoldLast == null ? "—" : fmtInr(path.neverSoldLast),
							hint: path.wealthNow ? `Hypothetical. Path today ${fmtInr(path.wealthNow)}` : "Hypothetical — purchased shares kept invested after each recorded sale"
						})
					]
				}) : path.neverSoldLast != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "If I had held",
						value: fmtInr(path.neverSoldLast),
						hint: "Hypothetical. Purchased shares stay invested after the recorded sale."
					})
				}) : null,
				path.snapshots?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathStack, { slices: path.snapshots }) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Decisions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: "Which names created or destroyed value. Expand a row to see the underlying buys and sells. Post-sale movement is what the stock did after you sold — not a verdict."
				}),
				path.byName?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ByName, {
					rows: path.byName,
					events: path.events,
					closed: path.closed
				}) : null,
				path.closed.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClosedTable, { rows: path.closed }) : null,
				path.neverSoldLast != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-[12px] leading-relaxed text-muted",
					children: [
						"If I had held (",
						fmtInr(path.neverSoldLast),
						") keeps purchased shares invested after the recorded sale. It is a hypothetical, to help weigh sell decisions — not a forecast, and not after tax."
					]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "History"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: [
						"Month by month versus ",
						benchName,
						", then each year, then what you actually held at year-end."
					]
				}),
				path.months?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthTable, {
					months: path.months,
					benchName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthHeatmap, { months: path.months })
				})] }) : null,
				path.years.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearTable, {
					years: path.years,
					benchName
				}) : null,
				path.snapshots?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeldThen, { slices: path.snapshots }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: path.events }),
				gaps.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GapTable, { gaps }) : null,
				path.missing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[12px] text-subtle",
					children: [
						"No price history for ",
						path.missing.join(", "),
						" — those names sit out of the line."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[12px] text-subtle",
					children: path.coverage
				})
			] })
		]
	});
}
function MonthTable({ months, benchName }) {
	const rows = [...months].slice(-36).reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "kosh-table w-full text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "Month"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Path"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: benchName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Diff"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((m) => {
				const diff = m.bench != null ? m.port - m.bench : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: monthLabel(m.key)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(m.port)),
						children: fmtPct(m.port)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(m.bench)),
						children: m.bench == null ? "—" : fmtPct(m.bench)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(diff)),
						children: diff == null ? "—" : fmtPct(diff)
					})
				] }, m.key);
			}) })]
		})
	});
}
function YearTable({ years, benchName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "By year"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: "Return is chained from the daily path, not an assumption that cash arrived mid-year. Put-in and took-out are the buys and sells that year — not the return."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Year"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Path"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: benchName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Diff"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Start"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "End"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Put in"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Took out"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: years.map((y) => {
						const diff = y.ret != null && y.bench != null ? y.ret - y.bench : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: y.year
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(y.ret)),
								children: y.ret == null ? "—" : fmtPct(y.ret)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(y.bench)),
								children: y.bench == null ? "—" : fmtPct(y.bench)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(diff)),
								children: diff == null ? "—" : fmtPct(diff)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: fmtInr(y.start)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: fmtInr(y.end)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: y.buyIn ? fmtInr(y.buyIn) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: y.sellOut ? fmtInr(y.sellOut) : "—"
							})
						] }, y.year);
					}) })]
				})
			})
		]
	});
}
function ClosedTable({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "After selling"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: "First-in, first-out from the file. Post-sale is the stock’s later print — shown only when we have a price near that later date."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Sold"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "P&L"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "1M after"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "3M after"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "1Y after"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.slice(0, 24).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-fg",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[11px] text-subtle",
								children: c.symbol
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: c.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2 text-muted",
							children: [
								dayLabel(c.sellDate),
								" · ₹",
								c.sellPx.toLocaleString("en-IN")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: cn("px-3 py-2 text-right font-mono tabular", tone(c.pnl)),
							children: [fmtInr(c.pnl), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px]",
								children: fmtPct(c.pnlPct)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-2 text-right font-mono tabular", tone(c.post1m)),
							children: c.post1m == null ? "—" : fmtPct(c.post1m)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-2 text-right font-mono tabular", tone(c.post3m)),
							children: c.post3m == null ? "—" : fmtPct(c.post3m)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-2 text-right font-mono tabular", tone(c.post1y)),
							children: c.post1y == null ? "—" : fmtPct(c.post1y)
						})
					] }, c.symbol + c.buyDate + c.sellDate + i)) })]
				})
			})
		]
	});
}
function GapTable({ gaps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "This mix vs your path"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: "Mix is the holdings list. Path is what the trade file still holds after sells. A gap usually means a line was edited by hand, or the file is incomplete."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "This mix"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Path"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Note"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: gaps.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2",
							children: [g.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[11px] text-subtle",
								children: g.symbol
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: g.mixQty || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: g.pathQty || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-muted",
							children: g.note
						})
					] }, g.symbol)) })]
				})
			})
		]
	});
}
function HeldThen({ slices }) {
	const years = (0, import_react.useMemo)(() => {
		const last = /* @__PURE__ */ new Map();
		for (const s of slices) last.set(s.day.slice(0, 4), s);
		return [...last.values()].sort((a, b) => a.day.localeCompare(b.day));
	}, [slices]);
	const [year, setYear] = (0, import_react.useState)(years.at(-1)?.day.slice(0, 4) || "");
	const slice = years.find((s) => s.day.startsWith(year)) || years.at(-1);
	if (!slice) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Held that year"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: "Names you actually had at year-end — not leftover names today. Pick a year."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-1.5",
				children: years.map((s) => {
					const y = s.day.slice(0, 4);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setYear(y),
						className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", year === y ? "bg-surface-2 text-fg" : "bg-bg text-muted hover:text-fg"),
						children: y
					}, y);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-[12px] text-muted",
				children: [
					dayLabel(slice.day),
					" · ",
					fmtInr(slice.wealth),
					" · ",
					slice.parts.length,
					" name",
					slice.parts.length === 1 ? "" : "s"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Share"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: slice.parts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2",
							children: [p.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[11px] text-subtle",
								children: p.symbol
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: p.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: fmtInr(p.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-right font-mono tabular",
							children: slice.wealth ? (p.value / slice.wealth * 100).toFixed(1) + "%" : "—"
						})
					] }, p.symbol)) })]
				})
			})
		]
	});
}
function ByName({ rows, events, closed }) {
	const [open, setOpen] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "kosh-table w-full text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: "Stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Bought"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Sold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Still held"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Realized"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Open"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium text-right",
						children: "Total P&L"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => {
				const expanded = open === r.symbol;
				const lines = events.filter((e) => e.symbol === r.symbol);
				const sold = closed.filter((c) => c.symbol === r.symbol);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "text-left",
							"aria-expanded": expanded,
							onClick: () => setOpen(expanded ? null : r.symbol),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block font-mono text-[11px] text-subtle",
								children: [r.symbol, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-muted",
									children: expanded ? "Hide trades" : "Show trades"
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-right font-mono tabular",
						children: r.bought ? fmtInr(r.bought) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-right font-mono tabular",
						children: r.sold ? fmtInr(r.sold) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 text-right font-mono tabular",
						children: r.stillQty ? `${r.stillQty} · ${fmtInr(r.stillValue)}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(r.realized)),
						children: r.realized ? fmtInr(r.realized) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(r.unrealized)),
						children: r.unrealized ? fmtInr(r.unrealized) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 text-right font-mono tabular", tone(r.total)),
						children: fmtInr(r.total)
					})
				] }), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					colSpan: 7,
					className: "bg-surface-2 px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid gap-1.5",
						children: lines.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-28 shrink-0 font-mono text-[12px] text-subtle tabular",
									children: dayLabel(e.date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("w-10 shrink-0 text-[11px] font-medium tracking-[0.06em] uppercase", e.side > 0 ? "text-up" : "text-down"),
									children: e.side > 0 ? "Buy" : "Sell"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[12px] text-muted tabular",
									children: [
										e.qty,
										" · ₹",
										e.price.toLocaleString("en-IN"),
										e.priceFilled ? " · day’s close" : ""
									]
								})
							]
						}, e.date + e.side + e.qty + i))
					}), sold.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-[12px] text-muted",
						children: [
							"After selling:",
							" ",
							sold.slice(0, 4).map((c) => {
								const bits = [
									c.post1m != null ? `1M ${fmtPct(c.post1m)}` : null,
									c.post3m != null ? `3M ${fmtPct(c.post3m)}` : null,
									c.post1y != null ? `1Y ${fmtPct(c.post1y)}` : null
								].filter(Boolean);
								return bits.length ? `${c.sellDate} ${bits.join(" · ")}` : null;
							}).filter(Boolean).join(" · ") || "no later print on file"
						]
					}) : null]
				}) }) : null] }, r.symbol);
			}) })]
		})
	});
}
function Stat({ label, value, hint, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1 font-mono text-xl font-medium tabular", className),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] leading-snug text-muted",
				children: hint
			})
		]
	});
}
function Timeline({ events }) {
	if (!events.length) return null;
	const years = [...new Set(events.map((e) => e.date.slice(0, 4)))].sort();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Buys and sells"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: "Each mark is a line from the trade file, in execution order."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface px-4 py-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex flex-wrap gap-4 text-[11px] text-subtle",
						children: years.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular",
							children: y
						}, y))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid gap-1.5",
						children: events.slice(0, 40).map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-28 shrink-0 font-mono text-[12px] text-subtle tabular",
									children: dayLabel(e.date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("w-10 shrink-0 text-[11px] font-medium tracking-[0.06em] uppercase", e.side > 0 ? "text-up" : "text-down"),
									children: e.side > 0 ? "Buy" : "Sell"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate text-fg",
									children: e.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[12px] text-muted tabular",
									children: [
										e.qty,
										" · ₹",
										e.price.toLocaleString("en-IN"),
										e.priceFilled ? " · close" : ""
									]
								})
							]
						}, e.date + e.symbol + e.side + i))
					}),
					events.length > 40 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-[12px] text-subtle",
						children: [events.length - 40, " more lines in the file."]
					}) : null
				]
			})
		]
	});
}
function PathUpload({ portfolioId }) {
	const mergeTrades = useKosh((s) => s.mergeTrades);
	const setTrades = useKosh((s) => s.setTrades);
	const existing = useKosh((s) => s.portfolios.find((p) => p.id === portfolioId)?.trades) || [];
	const [msg, setMsg] = (0, import_react.useState)("CSV or Excel with dated buys and sells. This does not change This mix.");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [errors, setErrors] = (0, import_react.useState)([]);
	const [notes, setNotes] = (0, import_react.useState)([]);
	async function ingest(files) {
		const list = [...files];
		if (!list.length) return;
		setBusy(true);
		setMsg("Reading " + list.length + " file(s)…");
		setErrors([]);
		setNotes([]);
		try {
			const { holdings, trades, errors: fails } = await parseHoldingsFiles(list);
			const issues = [...fails];
			if (!trades?.length) {
				setPreview(null);
				if (holdings.length) issues.push("This file looks like a holdings snapshot, not a buy/sell book. Path needs a date, a side (buy or sell), and a quantity on each line.");
				else if (!issues.length) issues.push("No dated buy/sell lines found. Need a ticker, quantity, buy or sell, and a date.");
				setErrors([...issues, ...auditTradeLines(trades || [])]);
				setMsg("Nothing to add to your path.");
				return;
			}
			setMsg("Matching stock names…");
			let resolved = trades;
			try {
				const stub = trades.map((t) => ({
					symbol: t.symbol,
					name: t.name,
					qty: t.qty,
					avg: t.price || null,
					date: t.date
				}));
				const named = await enrichHoldings(stub);
				const by = new Map(named.map((h) => [h.symbol.toUpperCase(), h.name]));
				resolved = trades.map((t) => ({
					...t,
					name: by.get(t.symbol.toUpperCase()) || displayName(t) || t.name
				}));
			} catch {
				resolved = trades;
			}
			const needPx = [...new Set(resolved.filter((t) => t.date && !(t.price > 0)).map((t) => t.symbol))];
			const hints = [];
			if (needPx.length) {
				setMsg("Looking up that day’s close for lines with no price…");
				try {
					const rows = await apiHistories(needPx, "max");
					const hx = {};
					for (const r of rows) {
						hx[r.input] = r.bars || [];
						hx[r.symbol] = r.bars || [];
					}
					const got = fillTradePrices(resolved, hx);
					resolved = got.trades;
					if (got.filled.length) hints.push(`${got.filled.length} execution price${got.filled.length === 1 ? "" : "s"} unavailable; historical closing price used. Add prices in the file if you want the exact cash you paid.`);
				} catch {
					hints.push("Could not look up closes for missing prices. Those lines will use the close when the path is drawn, or stay out if we have no history.");
				}
			}
			const audited = auditTradeLines(resolved);
			setPreview(resolved);
			setErrors([...issues, ...audited.filter((n) => !/day’s close|day's close/i.test(n))]);
			setNotes([...hints, ...audited.filter((n) => /day’s close|day's close/i.test(n))]);
			const undated = resolved.filter((t) => !t.date).length;
			const filledN = resolved.filter((t) => t.priceFilled).length;
			setMsg(`Ready · ${resolved.length} buy/sell line${resolved.length === 1 ? "" : "s"}` + (filledN ? ` · ${filledN} used that day’s close` : "") + (undated ? ` · ${undated} without a date will sit out of the line` : "") + " · This mix is not updated");
		} finally {
			setBusy(false);
		}
	}
	function add() {
		if (!preview?.length) return;
		mergeTrades(portfolioId, preview);
		toast.success(`Added ${preview.length} line${preview.length === 1 ? "" : "s"} to your path. This mix is unchanged.`);
		setPreview(null);
		setMsg("Added to your path.");
	}
	function replace() {
		if (!preview?.length) return;
		if (existing.length && !confirm("Replace every buy/sell on your path with this file? This mix stays as it is.")) return;
		setTrades(portfolioId, preview);
		toast.success(`Your path now has ${preview.length} line${preview.length === 1 ? "" : "s"} from this file. This mix is unchanged.`);
		setPreview(null);
		setMsg("Path replaced.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Upload buys and sells"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-[13px] leading-relaxed text-muted",
				children: "Adds to your path only. If a line has a date but no price, we fill that day’s close and tell you. Names already in This mix still flow into Path. Add keeps every execution. Use Replace if you are loading the same file again."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				onDragOver: (e) => e.preventDefault(),
				onDrop: (e) => {
					e.preventDefault();
					ingest(e.dataTransfer.files);
				},
				className: "mt-3 block cursor-pointer rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept: ".csv,.xlsx,.xls,.xlsm,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv",
						className: "sr-only",
						onChange: (e) => {
							if (e.target.files) ingest(e.target.files);
							e.target.value = "";
						}
					}),
					"Drop a buy/sell file",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-[12px] text-subtle",
						children: "Click to pick · CSV or Excel. Does not change quantities on This mix."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[12px] text-subtle",
				children: busy ? "Reading…" : msg
			}),
			errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid gap-1 text-[12px] text-down",
				children: errors.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e }, e))
			}) : null,
			notes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid gap-1 text-[12px] text-muted",
				children: notes.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e }, e))
			}) : null,
			preview?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_40px_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_48px_72px_88px_88px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stock" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Side" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-right sm:block",
								children: "Date"
							})
						]
					}), preview.slice(0, 80).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_40px_56px_72px] gap-2 border-t border-border/60 py-1.5 sm:grid-cols-[1fr_48px_72px_88px_88px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-fg",
									children: t.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[11px] text-subtle tabular",
									children: [t.symbol, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "sm:hidden",
										children: [" · ", t.date || "no date"]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[11px] font-medium uppercase", t.side > 0 ? "text-up" : "text-down"),
								children: t.side > 0 ? "Buy" : "Sell"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right font-mono tabular",
								children: t.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("text-right font-mono tabular", t.price > 0 ? "text-fg" : "text-warn"),
								children: [t.price > 0 ? `₹${t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "missing", t.priceFilled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[10px] text-subtle",
									children: "day’s close"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-right font-mono text-muted tabular sm:block",
								children: t.date || "no date"
							})
						]
					}, t.symbol + t.date + t.side + t.qty + i))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1 min-w-[9rem]",
						onClick: add,
						children: "Add to path"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "flex-1 min-w-[9rem]",
						onClick: replace,
						children: "Replace path"
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/sample-trades.csv",
				download: true,
				className: "mt-3 inline-block text-[12px] text-muted underline-offset-2 hover:text-fg hover:underline",
				children: "Sample buy/sell file"
			})
		]
	});
}
function PathPage() {
	const { query, portfolio } = useBookCtx();
	const book = query.data;
	const trades = portfolio.trades || [];
	const path = book.path;
	const hasPath = Boolean(path?.nav?.length);
	const filled = path?.filledPrices || [];
	const mixValue = book.value;
	const pathNow = path?.wealthNow || 0;
	const close = mixValue > 0 && pathNow > 0 ? Math.abs(pathNow - mixValue) / Math.max(mixValue, pathNow) < .015 : false;
	const chartNav = hasPath && path ? pathToChartNav(path) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Your path"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 max-w-2xl text-[13px] leading-relaxed text-muted",
					children: [
						"What you actually owned after each buy and sell, marked at that day’s price. Growth is how those names did — extra money you added later is taken out. ",
						book.benchName,
						" is the same stretch, same method. This mix is leftover names today; if the file is complete, today’s path and today’s mix are the same rupees.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/p/$id",
							params: { id: portfolio.id },
							className: "text-chart hover:underline",
							children: "Back to Overview"
						})
					]
				}),
				hasPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px]",
					children: [
						"Today · your path ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular",
							children: fmtInr(pathNow)
						}),
						" · ",
						"this mix ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular",
							children: fmtInr(mixValue)
						}),
						close ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-up",
							children: " They match."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-muted",
							children: " If the file is missing a buy or sell, these will differ."
						})
					]
				}) : null,
				filled.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 rounded-sm bg-surface px-3 py-2 text-[13px] text-muted shadow-[var(--shadow-border)]",
					children: [
						filled.length,
						" buy/sell price",
						filled.length === 1 ? "" : "s",
						" taken from that day’s close",
						filled.some((f) => f.hadTime) ? " (no time-of-day print — the close was used)" : "",
						". Execution price unavailable; historical closing price used. Add prices in the file if you want the exact cash you paid."
					]
				}) : null,
				hasPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: chartNav,
					portLabel: "Your path",
					benchLabel: `${book.benchName} same stretch`,
					coverage: path?.coverage,
					nowValue: pathNow,
					pathPrimary: true,
					modes: [
						"inr",
						"cum",
						"dd",
						"roll1y",
						"roll3m",
						"m",
						"w",
						"gap"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-surface p-4 text-[13px] text-muted shadow-[var(--shadow-border)]",
					children: "Upload a dated buy/sell file below. Each line is plotted as the rupees you held that day."
				})
			] }),
			trades.length && path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathDesk, {
				path,
				benchName: book.benchName,
				portfolioId: portfolio.id,
				mixRows: book.rows.map((r) => ({
					symbol: r.symbol,
					name: r.name,
					qty: r.qty
				})),
				mixValue
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "What will show here"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-muted",
					children: [
						"How the holdings did versus ",
						book.benchName,
						", the journey (drops and mix over time), which names created or destroyed value — including what the stock did after you sold — and month-by-month history. All from the buys and sells you actually did."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathUpload, { portfolioId: portfolio.id })
		]
	});
}
//#endregion
export { PathPage as component };
