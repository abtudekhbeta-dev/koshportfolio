import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as baseSym } from "./cloud-state-D4x-c1e5.mjs";
import { a as apiHistories, p as apiResearch } from "./api-BE61nRQk.mjs";
import { F as listedSymbolFromResearch, K as pathIdentityAsk, ht as usablePathPrice, q as pathPriceAsk } from "./router-CP-LXn6m.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Qt as useKosh, _n as displayName, b as fmtPct, cn as sortTrades, dt as Button, gn as cn, on as parseHoldingsFiles, rn as auditTradeLines, y as fmtInr } from "./router-CP-LXn6m2.mjs";
import { i as enrichHoldings } from "./add-holdings-BxUmES2U.mjs";
import { s as useStudioInspector } from "./studio-shell-BsC5Vxq4.mjs";
import { t as NavChart } from "./nav-chart-bvOLyKNw.mjs";
import { i as pathToChartNav, n as fillTradePrices, r as mixVsPathGaps } from "./path-C6yzM3Du.mjs";
import { t as AIButton } from "./ai-button-DQ_DAML1.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as MonthHeatmap } from "./heatmap-CwJQ0V_T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.path-DXFJ_bM-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
						"How the names you actually held did, marked at each session’s close — not the clock time on the trade. The holdings figure is a daily-close time-weighted path. XIRR, when shown, is money-weighted. ",
						benchName,
						" uses the same cash-flow dates where a same-money ledger exists.",
						path.nUndated ? ` ${path.nUndated} line${path.nUndated === 1 ? "" : "s"} had no date and were skipped.` : "",
						mixValue != null && mixValue > 0 ? ` This mix today is ${fmtInr(mixValue)}.` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "How the holdings did",
							value: path.twr == null ? "—" : fmtPct(path.twr),
							hint: "Time-weighted. Extra cash you put in later is taken out.",
							className: tone(path.twr)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "Per year",
							value: path.twrCagr == null ? "—" : fmtPct(path.twrCagr),
							hint: "Same figure, expressed as a yearly rate",
							className: tone(path.twrCagr)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: `${benchName} same days`,
							value: nifty == null ? "—" : fmtPct(nifty),
							hint: "Index over the same first-to-last stretch",
							className: tone(nifty)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "Difference",
							value: vsNifty == null ? "—" : fmtPct(vsNifty),
							hint: "Holdings minus the index, same method",
							className: tone(vsNifty)
						})
					]
				})
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "Max drop",
							value: path.risk.maxDd == null ? "—" : fmtPct(path.risk.maxDd),
							hint: "Largest fall from a previous peak of the holdings you actually had",
							className: tone(path.risk.maxDd)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "Swing",
							value: path.risk.vol == null ? "—" : fmtPct(path.risk.vol),
							hint: "How bumpy the path was, yearly"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "Sharpe",
							value: path.risk.sharpe == null ? "—" : path.risk.sharpe.toFixed(2),
							hint: "Return earned relative to the bump taken. Rf 6.5%.",
							className: tone(path.risk.sharpe)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
							label: "If I had held",
							value: path.neverSoldLast == null ? "—" : fmtInr(path.neverSoldLast),
							hint: path.wealthNow ? `Hypothetical. Path today ${fmtInr(path.wealthNow)}` : "Hypothetical — purchased shares kept invested after each recorded sale"
						})
					]
				}) : path.neverSoldLast != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "If I had held",
						value: fmtInr(path.neverSoldLast),
						hint: "Hypothetical. Purchased shares stay invested after the recorded sale."
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Your path"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px] leading-relaxed text-muted",
					children: [
						"The holdings marked at each session’s close, against the same money in ",
						benchName,
						". Not this mix taken back."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: pathToChartNav(path),
					portLabel: "Your path",
					benchLabel: `Same money in ${benchName}`,
					coverage: path.coverage,
					nowValue: path.wealthNow,
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
				})
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
						", then each year, then the year-end book."
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
function saleLabel(status) {
	if (status === "calculated") return "Calculated";
	if (status === "insufficient") return "Insufficient history";
	if (status === "ai") return "AI-researched · source-backed";
	if (status === "na") return "Not applicable";
	return "Unavailable";
}
function AfterCell({ cell, pct }) {
	const value = cell?.pct ?? pct;
	if ((cell?.status === "calculated" || cell?.status === "ai") && value != null && Number.isFinite(value)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		title: cell?.status === "ai" ? "AI-researched · source-backed" : saleLabel("calculated"),
		children: fmtPct(value)
	});
	const why = cell ? `${cell.code || saleLabel(cell.status)}. ${cell.reason}` : "Unavailable";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-subtle",
		title: why,
		children: "—"
	});
}
function SaleDetail({ cell, label }) {
	if (!cell) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-[9rem]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold tracking-[0.06em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[13px] text-fg",
				children: saleLabel(cell.status)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-1 grid gap-0.5 text-[12px] text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Target ", cell.targetDate ? dayLabel(cell.targetDate) : "—"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Observed ", cell.observedDate ? dayLabel(cell.observedDate) : "—"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"Price",
						" ",
						cell.observedPx != null ? `₹${cell.observedPx.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"Basis ",
						cell.basis || "—",
						cell.code ? ` · ${cell.code}` : ""
					] }),
					cell.sourceName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"Source",
						" ",
						cell.sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: cell.sourceUrl,
							className: "text-chart hover:underline",
							target: "_blank",
							rel: "noreferrer",
							children: cell.sourceName
						}) : cell.sourceName
					] }) : null
				]
			})
		]
	});
}
var SALE_PAGE = 50;
function ClosedTable({ rows }) {
	const pages = Math.max(1, Math.ceil(rows.length / SALE_PAGE));
	const [page, setPage] = (0, import_react.useState)(pages);
	const [open, setOpen] = (0, import_react.useState)(null);
	const safe = Math.min(pages, Math.max(1, page));
	const start = (safe - 1) * SALE_PAGE;
	const shown = rows.slice(start, start + SALE_PAGE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "After selling"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-[12px] text-muted",
				children: ["How the stock moved from your sell price. 1M, 3M, 6M and 1Y use the first session on or after that later date.", rows.length ? ` Showing ${start + 1}–${start + shown.length} of ${rows.length}.` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full min-w-[720px] text-left text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Sell date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "Sell price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "P&L"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "1M"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "3M"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "6M"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium text-right",
								children: "1Y"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-2 font-medium" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((c, i) => {
						const key = c.symbol + c.buyDate + c.sellDate + (start + i);
						const on = open === key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-fg",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-[11px] text-subtle",
									children: [c.symbol, c.qty ? ` · ${c.qty}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-muted",
								children: dayLabel(c.sellDate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: ["₹", c.sellPx.toLocaleString("en-IN")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(c.pnl)),
								children: fmtPct(c.pnlPct)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(c.after1m?.pct ?? c.post1m)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AfterCell, {
									cell: c.after1m,
									pct: c.post1m
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(c.after3m?.pct ?? c.post3m)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AfterCell, {
									cell: c.after3m,
									pct: c.post3m
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(c.after6m?.pct ?? c.post6m)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AfterCell, {
									cell: c.after6m,
									pct: c.post6m
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-3 py-2 text-right font-mono tabular", tone(c.after1y?.pct ?? c.post1y)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AfterCell, {
									cell: c.after1y,
									pct: c.post1y
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-[12px] text-muted hover:text-fg",
									"aria-expanded": on,
									onClick: () => setOpen(on ? null : key),
									children: on ? "Hide" : "Details"
								})
							})
						] }), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 9,
							className: "bg-bg/40 px-3 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleDetail, {
										cell: c.after1m,
										label: "1M"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleDetail, {
										cell: c.after3m,
										label: "3M"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleDetail, {
										cell: c.after6m,
										label: "6M"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleDetail, {
										cell: c.after1y,
										label: "1Y"
									})
								]
							})
						}) }) : null] }, key);
					}) })]
				})
			}),
			pages > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-end gap-2 text-[12px] text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-sm px-2 py-1 hover:text-fg disabled:opacity-40",
						disabled: safe <= 1,
						onClick: () => setPage(safe - 1),
						children: "Older"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						safe,
						" / ",
						pages
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-sm px-2 py-1 hover:text-fg disabled:opacity-40",
						disabled: safe >= pages,
						onClick: () => setPage(safe + 1),
						children: "Newer"
					})
				]
			}) : null
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
function Stat$1({ label, value, hint, className }) {
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
/** End-of-day quantities from the trade file. FIFO. No prices and no guessed corporate actions. */
function eodPositions(trades, day) {
	const warnings = [];
	const sorted = sortTrades((trades || []).filter((t) => t.date && t.date <= day && t.qty > 0 && (t.side === 1 || t.side === -1)));
	const lots = /* @__PURE__ */ new Map();
	const oversell = /* @__PURE__ */ new Map();
	for (const t of sorted) {
		const sym = baseSym(t.symbol);
		const list = lots.get(sym) || [];
		if (t.side > 0) {
			list.push({
				qty: t.qty,
				cost: t.price > 0 ? t.price : 0,
				name: t.name || sym
			});
			lots.set(sym, list);
			continue;
		}
		let left = t.qty;
		while (left > 1e-8 && list.length) {
			const lot = list[0];
			const take = Math.min(lot.qty, left);
			lot.qty -= take;
			left -= take;
			if (lot.qty <= 1e-8) list.shift();
		}
		if (left > 1e-6) {
			const prev = oversell.get(sym) || {
				qty: 0,
				name: t.name || sym
			};
			prev.qty += left;
			prev.name = t.name || prev.name;
			oversell.set(sym, prev);
		}
		lots.set(sym, list.filter((l) => l.qty > 1e-8));
	}
	const lines = [];
	for (const [sym, list] of lots) {
		const qty = list.reduce((s, l) => s + l.qty, 0);
		if (!(qty > 1e-8)) continue;
		const costQty = list.reduce((s, l) => s + l.qty * (l.cost > 0 ? l.cost : 0), 0);
		const priced = list.reduce((s, l) => s + (l.cost > 0 ? l.qty : 0), 0);
		lines.push({
			symbol: sym,
			name: list[0]?.name || sym,
			qty,
			cost: priced > 0 ? costQty / priced : 0,
			oversell: 0
		});
	}
	for (const [sym, o] of oversell) {
		warnings.push(`${o.name}: sold ${trimQty(o.qty)} more than the file had bought by ${day}. Those shares were not invented.`);
		const line = lines.find((l) => l.symbol === sym);
		if (line) line.oversell = o.qty;
		else lines.push({
			symbol: sym,
			name: o.name,
			qty: 0,
			cost: 0,
			oversell: o.qty
		});
	}
	lines.sort((a, b) => b.qty - a.qty || a.symbol.localeCompare(b.symbol));
	if (!sorted.length) warnings.push(`No dated trade on or before ${day}.`);
	return {
		day,
		lines: lines.filter((l) => l.qty > 1e-8 || l.oversell > 0),
		warnings
	};
}
function trimQty(n) {
	return Number(n.toFixed(4)).toString();
}
var SPAN = {
	"1M": 31,
	"3M": 93,
	"6M": 186,
	"1Y": 365,
	"3Y": 1095,
	"5Y": 1825
};
function addDays(day, n) {
	const t = Date.parse(day + "T00:00:00Z");
	if (!Number.isFinite(t)) return day;
	return new Date(t + n * 864e5).toISOString().slice(0, 10);
}
/** First session on/after start, last session on/before end. Indexed figures are not rupees. */
function slicePath(nav, preset, custom) {
	const rows = [...nav || []].filter((p) => p.day).sort((a, b) => a.day.localeCompare(b.day));
	if (!rows.length) return {
		rows: [],
		start: null,
		end: null,
		rule: "No sessions."
	};
	const last = rows[rows.length - 1].day;
	const first = rows[0].day;
	let wantStart = first;
	let wantEnd = last;
	if (preset === "CUSTOM") {
		wantStart = custom?.start && custom.start > first ? custom.start : first;
		wantEnd = custom?.end && custom.end < last ? custom.end : last;
		if (wantStart > wantEnd) {
			const s = wantStart;
			wantStart = wantEnd;
			wantEnd = s;
		}
	} else if (preset !== "ALL") wantStart = addDays(last, -(SPAN[preset] || 365));
	const window = rows.filter((p) => p.day >= wantStart && p.day <= wantEnd);
	const used = window.length ? window : rows.filter((p) => p.day <= wantEnd).slice(-1);
	const start = used[0]?.day || null;
	const end = used[used.length - 1]?.day || null;
	return {
		rows: used,
		start,
		end,
		rule: start && end ? `Sessions from ${start} through ${end}. Start is the first session on or after the request. End is the last session on or before it.` : "No sessions in that window."
	};
}
function rangeStats(rows) {
	if (rows.length < 2) return {
		twr: null,
		bench: null,
		excess: null,
		maxDd: null
	};
	const a = rows[0];
	const b = rows[rows.length - 1];
	const twr = a.unit > 1e-8 ? (b.unit / a.unit - 1) * 100 : null;
	const bench = a.sameUnit != null && b.sameUnit != null && a.sameUnit > 1e-8 ? (b.sameUnit / a.sameUnit - 1) * 100 : null;
	const excess = twr != null && bench != null ? twr - bench : null;
	let peak = rows[0].unit;
	let dd = 0;
	for (const p of rows) {
		if (p.unit > peak) peak = p.unit;
		if (peak > 1e-8) dd = Math.min(dd, p.unit / peak - 1);
	}
	return {
		twr,
		bench,
		excess,
		maxDd: dd * 100
	};
}
function dayChange(rows, events, day) {
	const idx = rows.findIndex((p) => p.day === day);
	const point = idx >= 0 ? rows[idx] : null;
	const prev = idx > 0 ? rows[idx - 1] : null;
	const today = (events || []).filter((e) => e.date === day);
	const bought = today.filter((e) => e.side > 0).reduce((s, e) => s + (e.amount || 0), 0);
	const sold = today.filter((e) => e.side < 0).reduce((s, e) => s + (e.amount || 0), 0);
	const delta = point && prev ? point.wealth - prev.wealth : null;
	return {
		point,
		prev,
		today,
		bought,
		sold,
		delta,
		priceDriven: delta == null ? null : delta - bought + sold
	};
}
var PRESETS = [
	"1M",
	"3M",
	"6M",
	"1Y",
	"3Y",
	"5Y",
	"ALL",
	"CUSTOM"
];
function PathTimeline({ nav, trades, events, benchName, splitNote }) {
	const [preset, setPreset] = (0, import_react.useState)("ALL");
	const [custom, setCustom] = (0, import_react.useState)({
		start: "",
		end: ""
	});
	const [pick, setPick] = (0, import_react.useState)(-1);
	const [indexed, setIndexed] = (0, import_react.useState)(false);
	const setInspector = useStudioInspector();
	const sliced = (0, import_react.useMemo)(() => slicePath(nav, preset, custom), [
		nav,
		preset,
		custom
	]);
	const i = pick < 0 || pick >= sliced.rows.length ? Math.max(0, sliced.rows.length - 1) : pick;
	const day = sliced.rows[i]?.day || "";
	const book = (0, import_react.useMemo)(() => day ? eodPositions(trades, day) : null, [trades, day]);
	const stats = (0, import_react.useMemo)(() => rangeStats(sliced.rows), [sliced.rows]);
	const change = (0, import_react.useMemo)(() => day ? dayChange(sliced.rows, events, day) : null, [
		sliced.rows,
		events,
		day
	]);
	const chart = (0, import_react.useMemo)(() => sliced.rows.map((p) => ({
		t: p.t,
		day: p.day,
		port: indexed ? p.unit : p.wealth,
		bench: indexed ? p.sameUnit : p.sameCash,
		covered: p.covered,
		names: p.names,
		wAvail: 1
	})), [sliced.rows, indexed]);
	const snapshot = (0, import_react.useMemo)(() => book && day ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snapshot, {
		day,
		benchName,
		book,
		change,
		point: sliced.rows[i],
		splitNote,
		indexed
	}) : null, [
		book,
		day,
		benchName,
		change,
		sliced.rows,
		i,
		splitNote,
		indexed
	]);
	(0, import_react.useEffect)(() => {
		if (!setInspector) return;
		setInspector(snapshot);
	}, [setInspector, snapshot]);
	(0, import_react.useEffect)(() => {
		if (!setInspector) return;
		return () => setInspector(null);
	}, [setInspector]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "border-b border-border pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.16em] text-subtle uppercase",
					children: "Portfolio timeline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "studio-word mt-1 text-[28px] font-medium tracking-tight",
					children: "What the book was worth"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-[12px] leading-relaxed text-muted",
					children: sliced.rule
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-1",
				children: [PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPreset(p);
						setPick(-1);
					},
					className: cn("h-8 px-2 text-[12px]", preset === p ? "text-fg underline decoration-accent" : "text-muted"),
					children: p === "ALL" ? "All" : p === "CUSTOM" ? "Custom" : p
				}, p)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("ml-auto h-8 px-2 text-[12px]", indexed ? "text-fg" : "text-muted"),
					onClick: () => setIndexed((v) => !v),
					children: indexed ? "Indexed to 100" : "Rupees"
				})]
			}),
			preset === "CUSTOM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-3 text-[12px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Start", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					value: custom.start,
					onChange: (e) => {
						setCustom((c) => ({
							...c,
							start: e.target.value
						}));
						setPick(-1);
					},
					className: "ml-2 bg-transparent text-fg"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["End", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					value: custom.end,
					onChange: (e) => {
						setCustom((c) => ({
							...c,
							end: e.target.value
						}));
						setPick(-1);
					},
					className: "ml-2 bg-transparent text-fg"
				})] })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-4 border-y border-border py-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: indexed ? "Indexed path" : "Time-weighted",
						v: stats.twr == null ? "—" : fmtPct(stats.twr),
						note: "Not XIRR. Deposits are not counted as return."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: benchName,
						v: stats.bench == null ? "—" : fmtPct(stats.bench),
						note: "Same sessions, indexed. Not index points."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Difference",
						v: stats.excess == null ? "—" : fmtPct(stats.excess),
						note: "Path minus the index, same method."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Max drop",
						v: stats.maxDd == null ? "—" : fmtPct(stats.maxDd),
						note: "Inside this window, from the indexed path."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[12px] text-subtle",
				children: "The line is securities value from recorded buys and sells. Untracked cash is not included. XIRR stays on the full trade book below — it is not recomputed for this window."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: chart,
					portLabel: indexed ? "Indexed path" : "Securities value",
					benchLabel: indexed ? `${benchName} indexed` : `Same money in ${benchName}`,
					coverage: sliced.start && sliced.end ? `${sliced.start} – ${sliced.end}` : "",
					nowValue: indexed ? void 0 : sliced.rows[i]?.wealth,
					pathPrimary: true,
					modes: indexed ? ["cum", "dd"] : [
						"inr",
						"cum",
						"dd"
					]
				})
			}),
			sliced.rows.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 text-[12px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-muted hover:text-fg",
							onClick: () => setPick(Math.max(0, i - 1)),
							children: "Previous session"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular",
							children: day || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-muted hover:text-fg",
							onClick: () => setPick(Math.min(sliced.rows.length - 1, i + 1)),
							children: "Next session"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: sliced.rows.length - 1,
					step: 1,
					value: i,
					"aria-label": "Selected session",
					"aria-valuetext": day,
					onChange: (e) => setPick(Number(e.target.value)),
					className: "mt-2 h-8 w-full cursor-pointer accent-chart"
				})]
			}) : null,
			change?.today.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: change.today.slice(0, 8).map((e, n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-[12px] text-muted",
					onClick: () => setPick(i),
					children: [
						e.side > 0 ? "Buy" : "Sell",
						" ",
						e.symbol,
						" ",
						e.qty
					]
				}, e.symbol + e.side + n))
			}) : null,
			setInspector ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: snapshot
			})
		]
	});
}
function Stat({ k, v, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[11px] text-subtle",
			children: k
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-mono text-[18px] tabular",
			children: v
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] leading-snug text-muted",
			children: note
		})
	] });
}
function Snapshot({ day, benchName, book, change, point, splitNote, indexed }) {
	const total = point?.wealth || 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-[11px] tracking-[0.14em] text-subtle uppercase",
			children: ["Snapshot · ", day]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "studio-word mt-1 text-[22px] tracking-tight",
			children: total ? fmtInr(total) : "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-[12px] leading-relaxed text-muted",
			children: [
				"Securities value at the close, excluding untracked cash. ",
				indexed ? "The chart above is indexed, not rupees." : "The chart is rupees.",
				" A name with no print keeps its previous close inside this total. Missing is not zero.",
				splitNote ? " A corporate action may change share counts. This ledger uses the trade file as written and does not guess a split." : ""
			]
		}),
		change?.delta != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[12px] text-muted",
			children: [
				"Versus the previous session ",
				fmtInr(change.delta),
				". Buys ",
				fmtInr(change.bought),
				", sells ",
				fmtInr(change.sold),
				change.priceDriven != null ? `, price move about ${fmtInr(change.priceDriven)}` : "",
				". ",
				benchName,
				" is not drawn on this rupee figure."
			]
		}) : null,
		book.warnings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[12px] text-warn",
			children: book.warnings[0]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "mt-3 w-full text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-1 font-medium",
					children: "Held at the close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-1 text-right font-medium",
					children: "Quantity"
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: book.lines.filter((l) => l.qty > 0).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					className: "py-1.5",
					children: [l.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-[11px] text-subtle",
						children: l.symbol
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "py-1.5 text-right font-mono tabular",
					children: Number(l.qty.toFixed(4))
				})]
			}, l.symbol)) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[11px] leading-relaxed text-subtle",
			children: "Per-line closes are not stored for every session, so this list is quantity, not a guessed weight. The total above is the path’s securities value for the day."
		})
	] });
}
function PathUpload({ portfolioId }) {
	const mergeTrades = useKosh((s) => s.mergeTrades);
	const setTrades = useKosh((s) => s.setTrades);
	const existing = useKosh((s) => s.portfolios.find((p) => p.id === portfolioId)?.trades) || [];
	const [msg, setMsg] = (0, import_react.useState)("CSV or Excel with dated buys and sells. Broker files can contain sensitive identifiers. Kosh reads the file in the browser and does not send the raw file to AI. This does not change This mix.");
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
			const { holdings, trades, errors: fails, audit } = await parseHoldingsFiles(list);
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
			const needs = (audit?.ambiguous || 0) + (audit?.unresolved || 0);
			setMsg(audit?.rowsRead ? `Read ${audit.rowsRead.toLocaleString("en-IN")} rows · Kept ${audit.accepted.toLocaleString("en-IN")} · Needs review ${needs.toLocaleString("en-IN")}` + (audit.ignored ? ` · Ignored ${audit.ignored.toLocaleString("en-IN")}` : "") + (filledN ? ` · ${filledN} used that day’s close` : "") + (undated ? ` · ${undated} without a date` : "") + " · This mix is not updated" : `Ready · ${resolved.length} buy/sell line${resolved.length === 1 ? "" : "s"}`);
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
				children: "Adds to your path only. CSV, TSV, or Excel. Headers can sit below a title, and a repeated header is skipped. Buy, Sell, Purchased, and Sold are recognized. A side that is not one of those is left for review, not guessed. This mix is not changed."
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
	const qc = useQueryClient();
	const tradeError = useKosh((s) => s.tradeError);
	const tradesReady = useKosh((s) => s.tradesReady);
	const tradeCount = useKosh((s) => s.tradeCounts[portfolio.id] || 0);
	const confirmSymbol = useKosh((s) => s.confirmSymbol);
	const rememberPathFacts = useKosh((s) => s.rememberPathFacts);
	const [checking, setChecking] = (0, import_react.useState)(false);
	const [checkNote, setCheckNote] = (0, import_react.useState)("");
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
						"What happened after you sold. Each sale is measured from your sell price to the first session one month, three months, six months, and one year later.",
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
				tradeError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] text-down",
					children: tradeError
				}) : null,
				!tradesReady && tradeCount > trades.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[13px] text-muted",
					children: [
						"Loading the saved trade book… ",
						tradeCount.toLocaleString("en-IN"),
						" lines."
					]
				}) : null,
				trades.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
							busy: checking,
							busyLabel: "Checking Path…",
							onClick: () => {
								setChecking(true);
								setCheckNote("");
								const missing = (book.missing || []).filter(Boolean);
								(async () => {
									await qc.invalidateQueries({ queryKey: ["book"] });
									const notes = [];
									for (const symbol of missing) try {
										const item = (await apiResearch(symbol, [pathIdentityAsk(symbol)])).items?.[0];
										const shaped = item ? {
											...item,
											inputs: item.inputs || []
										} : null;
										if (usablePathPrice(shaped) != null) {
											notes.push(`${symbol}: a price in the reply was ignored.`);
											continue;
										}
										const listed = listedSymbolFromResearch(symbol, shaped);
										const asked = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
										if (listed && listed !== asked) {
											confirmSymbol(symbol, listed);
											notes.push(`${symbol}: listed symbol ${listed} saved from ${item?.sourceName || "a source"}. AI-researched · source-backed. No price was stored.`);
											continue;
										}
										if (item?.status === "researched") notes.push(`${symbol}: ${item.sourceName}. ${item.evidence} Confirm the listed name in the prompt. No price was stored from the model.`);
										else notes.push(`${symbol}: still unresolved. ${item?.evidence || "No listed symbol with a source."}`);
									} catch (err) {
										notes.push(`${symbol}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
									}
									const asks = [];
									const seen = new Set((portfolio.pathFacts || []).map((f) => `${f.symbol}|${f.date}`));
									for (const c of path?.closed || []) {
										for (const cell of [
											c.after1m,
											c.after3m,
											c.after6m,
											c.after1y
										]) {
											if (cell?.code !== "NO_HISTORICAL_DATA" || !cell.targetDate) continue;
											const key = `${c.symbol}|${cell.targetDate}`;
											if (seen.has(key)) continue;
											seen.add(key);
											asks.push({
												symbol: c.symbol,
												date: cell.targetDate
											});
											if (asks.length >= 6) break;
										}
										if (asks.length >= 6) break;
									}
									const saved = [];
									for (const ask of asks) try {
										const item = (await apiResearch(ask.symbol, [pathPriceAsk(ask.symbol, ask.date)])).items?.[0];
										const shaped = item ? {
											...item,
											inputs: item.inputs || []
										} : null;
										const px = usablePathPrice(shaped, ask.date);
										if (px == null || !shaped?.sourceUrl || !shaped.sourceName) {
											notes.push(`${ask.symbol} ${ask.date}: no sourced close. Left unavailable.`);
											continue;
										}
										saved.push({
											symbol: ask.symbol,
											date: ask.date,
											price: px,
											sourceName: shaped.sourceName,
											sourceUrl: shaped.sourceUrl,
											retrievedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
											evidence: shaped.evidence
										});
										notes.push(`${ask.symbol} ${ask.date}: AI-researched · source-backed (${shaped.sourceName}).`);
									} catch (err) {
										notes.push(`${ask.symbol} ${ask.date}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
									}
									if (saved.length) rememberPathFacts(portfolio.id, saved);
									setCheckNote(notes.length ? notes.join(" ") : "Price history checked again. Nothing needed a model. Prices were not guessed.");
									setChecking(false);
								})();
							},
							children: "· Complete Path data"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-xl text-[12px] leading-relaxed text-muted",
							children: "Market history is used first. AI is only asked for an unresolved listed symbol, or for a close when that name has no price series. A price is kept only with a source. Nothing is estimated."
						}),
						checkNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-muted",
							children: checkNote
						}) : null
					]
				}) : null,
				!trades.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-muted",
					children: "Upload a dated buy/sell file. The table below shows what the stock did after each sale."
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathUpload, { portfolioId: portfolio.id }),
			path?.nav?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathTimeline, {
				nav: path.nav,
				trades,
				events: path.events || [],
				benchName: book.benchName,
				splitNote: path.splitNote
			}) : null,
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-muted",
					children: "One row per sale: your sell date, sell price, and how the stock did one month, three months, six months, and one year later. Open Details if you need the observed date, price, and source."
				})]
			})
		]
	});
}
//#endregion
export { PathPage as component };
