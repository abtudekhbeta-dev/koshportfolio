import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as apiSearch } from "./api-BE61nRQk.mjs";
import { c as Tooltip } from "./router-B40wiopi.mjs";
import { Qt as useKosh, Y as taxClock, b as fmtPct, d as METALS, dt as Button, gn as cn, o as Input, y as fmtInr } from "./router-B40wiopi2.mjs";
import { t as AddHoldings } from "./add-holdings-DjK-4NK5.mjs";
import { t as StockLink } from "./stock-link-HaO5mNxc.mjs";
import { n as sortEntities } from "./kosh-table-CICVK_6T.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { t as Pct } from "./pct-D5PayNNr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.holdings-W-79OeiZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Holdings() {
	const { query, portfolio } = useBookCtx();
	const book = query.data;
	const removeHolding = useKosh((s) => s.removeHolding);
	const updateHolding = useKosh((s) => s.updateHolding);
	const addHoldings = useKosh((s) => s.addHoldings);
	const [q, setQ] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("weight");
	const rows = (0, import_react.useMemo)(() => {
		const qq = q.trim().toUpperCase();
		const list = book.rows.filter((r) => !qq || r.symbol.includes(qq) || r.name.toUpperCase().includes(qq));
		return sortEntities(list, sort, "desc", (r, k) => {
			if (k === "m1") return r.periods.m1;
			if (k === "y1") return r.periods.y1;
			if (k === "xirr") return r.xirr;
			if (k === "contrib") return r.contrib;
			if (k === "daysHeld") return r.daysHeld;
			return r[k];
		});
	}, [
		book.rows,
		q,
		sort
	]);
	function patch(symbol, next) {
		updateHolding(portfolio.id, symbol, next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "min-w-0 flex-1 sm:max-w-xs",
						placeholder: "Search name or ticker",
						value: q,
						onChange: (e) => setQ(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[12px] text-subtle",
						children: [rows.length, " lines"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, {
						portfolioId: portfolio.id,
						trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							children: "Upload file"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-muted",
				children: "Edit quantity, average cost and buy date in place. Upload a buy/sell file and remaining lots stay on the line (still one row per name) so Your XIRR is money-weighted from those remaining lots. Sold lines and dividends are not in that figure. Editing the line replaces those lots. Sold names are not added. Returns from buy date need both a date and an average cost — otherwise the cell stays blank, not zero."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right",
								children: "Avg cost"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2",
								children: "Buy date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
									onClick: () => setSort("value"),
									children: "Value"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
									onClick: () => setSort("changePct"),
									children: "1D"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								label: "P&L ₹",
								tip: "Rupees up or down versus average cost. Needs buy date and average. Use this for how much money is on the line.",
								onClick: () => setSort("unrealPct")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								label: "Simple %",
								tip: "Same P&L as a percent of what you paid. A quick look — not annualised.",
								onClick: () => setSort("unrealPct")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								label: "XIRR",
								tip: "Annualised return from dated buys to today. Remaining lots from a trade-file import are used when present. Use this when names were bought on different dates.",
								onClick: () => setSort("xirr")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "hidden px-3 py-2 text-right xl:table-cell",
								children: "1Y"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								className: "hidden xl:table-cell",
								label: "Days",
								tip: "Calendar days since the buy date. Use this to see how long the position has been on.",
								onClick: () => setSort("daysHeld")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								className: "hidden xl:table-cell",
								label: "vs Nifty",
								tip: "Your simple % minus Nifty over the same dates. Did you beat the index since you bought?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								className: "hidden xl:table-cell",
								label: "vs sector",
								tip: "Your simple % minus the sector index over the same dates. Did you beat the industry since you bought?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadTip, {
								className: "hidden xl:table-cell",
								label: "Contrib",
								tip: "Share of the portfolio’s total unrealised rupees. A small name with a huge % can still be a small rupee contribution.",
								onClick: () => setSort("contrib")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-2" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => {
						const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
									symbol: r.symbol,
									name: r.name,
									className: "font-medium"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-subtle",
									children: [
										r.symbol,
										" · ",
										r.sector,
										h?.lots && h.lots.length > 1 ? ` · ${h.lots.length} lots` : "",
										r.kind === "commodity" && !book.includeCommodities ? " · excluded from totals" : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "ml-auto h-8 w-20 text-right",
									defaultValue: String(r.qty),
									onBlur: (e) => {
										const n = Number(e.target.value);
										if (n > 0 && n !== r.qty) patch(r.symbol, { qty: n });
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "ml-auto h-8 w-24 text-right",
									defaultValue: r.avg ? String(r.avg) : "",
									placeholder: "₹",
									onBlur: (e) => {
										const n = Number(e.target.value);
										patch(r.symbol, { avg: n > 0 ? n : null });
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "h-8 w-36",
									type: "date",
									defaultValue: h?.date || "",
									onChange: (e) => {
										const d = e.target.value || null;
										patch(r.symbol, {
											date: d,
											boughtAt: d ? d + "T00:00:00.000Z" : null
										});
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxNote, { date: h?.date })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: fmtInr(r.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.changePct })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: !r.avg ? "Cost unavailable" : haveRet(r) ? fmtInr(r.unreal) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: !r.avg ? "Cost unavailable" : haveRet(r) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.unrealPct }) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: r.xirr == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.xirr })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "hidden px-3 py-2 text-right xl:table-cell",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.periods.y1 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "hidden px-3 py-2 text-right font-mono tabular xl:table-cell",
								children: r.daysHeld == null ? "—" : `${r.daysHeld}d`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "hidden px-3 py-2 text-right xl:table-cell",
								children: r.vsNiftyHold == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.vsNiftyHold })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "hidden px-3 py-2 text-right xl:table-cell",
								children: [r.vsSectorHold == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.vsSectorHold }), r.sectorIndexName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: r.sectorIndexName
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "hidden px-3 py-2 text-right font-mono tabular xl:table-cell",
								children: r.contrib == null ? "—" : fmtPct(r.contrib, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => removeHolding(portfolio.id, r.symbol),
									children: "Remove"
								})
							})
						] }, r.symbol + String(h?.date) + String(r.qty) + String(r.avg));
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 md:hidden",
				children: rows.map((r) => {
					const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
									symbol: r.symbol,
									name: r.name,
									className: "font-medium"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-subtle",
									children: [
										r.symbol,
										" · ",
										fmtInr(r.value),
										" · ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.unrealPct }),
										h?.lots && h.lots.length > 1 ? ` · ${h.lots.length} lots` : ""
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => removeHolding(portfolio.id, r.symbol),
								children: "Remove"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-[11px] text-subtle",
									children: ["Qty", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1 h-9",
										defaultValue: String(r.qty),
										onBlur: (e) => {
											const n = Number(e.target.value);
											if (n > 0 && n !== r.qty) patch(r.symbol, { qty: n });
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-[11px] text-subtle",
									children: ["Avg cost", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1 h-9",
										defaultValue: r.avg ? String(r.avg) : "",
										onBlur: (e) => {
											const n = Number(e.target.value);
											patch(r.symbol, { avg: n > 0 ? n : null });
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "col-span-2 text-[11px] text-subtle",
									children: [
										"Buy date",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-1 h-9",
											type: "date",
											defaultValue: h?.date || "",
											onChange: (e) => {
												const d = e.target.value || null;
												patch(r.symbol, {
													date: d,
													boughtAt: d ? d + "T00:00:00.000Z" : null
												});
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxNote, { date: h?.date })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["1Y ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.periods.y1 })] }), haveRet(r) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["P&L ", fmtInr(r.unreal)] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Simple ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.unrealPct })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["XIRR ", r.xirr == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.xirr })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.daysHeld == null ? "—" : `${r.daysHeld}d` }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["vs Nifty ", r.vsNiftyHold == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.vsNiftyHold })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["vs sector ", r.vsSectorHold == null ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { n: r.vsSectorHold })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Contrib ", r.contrib == null ? "—" : fmtPct(r.contrib, 0)] })
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: "Returns need a buy date and average cost."
									})]
								})
							]
						})]
					}, r.symbol + String(h?.date) + String(r.qty) + String(r.avg));
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRow, { onAdd: (h) => addHoldings(portfolio.id, [h]) })
		]
	});
}
function haveRet(r) {
	return Boolean(r.date && r.avg && r.avg > 0);
}
function HeadTip({ label, tip, onClick, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("px-3 py-2 text-right", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block max-w-[16rem] text-left leading-snug",
				children: tip
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
				onClick,
				children: label
			})
		})
	});
}
function TaxNote({ date }) {
	const t = taxClock(date);
	if (!t) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5 text-[11px] text-subtle",
		children: t.longTerm ? `Held ${t.days}d · 12-month LTCG` : `Held ${t.days}d · ${t.toLtcg}d to 12-month LTCG`
	});
}
function AddRow({ onAdd }) {
	const [mode, setMode] = (0, import_react.useState)("stock");
	const [symbol, setSymbol] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("");
	const [avg, setAvg] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	async function onSym(v) {
		setSymbol(v);
		if (v.trim().length < 2) {
			setHits([]);
			return;
		}
		try {
			setHits(await apiSearch(v.trim()));
		} catch {
			setHits([]);
		}
	}
	function save() {
		const n = Number(qty);
		if (!(n > 0)) return;
		if (mode === "stock") {
			const s = symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
			if (!s) return;
			onAdd({
				symbol: s,
				name: s,
				qty: n,
				avg: Number(avg) || null,
				date: date || null,
				boughtAt: date ? date + "T00:00:00.000Z" : null
			});
		} else onAdd({
			symbol: mode,
			name: METALS[mode].name,
			qty: n,
			avg: Number(avg) || null,
			date: date || null,
			boughtAt: date ? date + "T00:00:00.000Z" : null,
			kind: "commodity",
			unit: "g"
		});
		setSymbol("");
		setQty("");
		setAvg("");
		setDate("");
		setHits([]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Add a line"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: [
					"stock",
					"GOLD",
					"SILVER"
				].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode(m),
					className: cn("inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] font-medium", mode === m ? "bg-bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted"),
					children: m === "stock" ? "Stock" : m === "GOLD" ? "Gold" : "Silver"
				}, m))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					mode === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-[12px] text-muted",
						children: [
							"Ticker",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1",
								value: symbol,
								onChange: (e) => void onSym(e.target.value),
								placeholder: "Search"
							}),
							hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-1 max-h-36 overflow-auto rounded-sm bg-bg text-[12px] shadow-[var(--shadow-border)]",
								children: hits.slice(0, 6).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "block w-full px-2 py-1.5 text-left hover:bg-surface-2",
									onClick: () => {
										setSymbol(h.symbol.replace(/\.(NS|BO)$/i, ""));
										setHits([]);
									},
									children: [
										h.symbol.replace(/\.(NS|BO)$/i, ""),
										" · ",
										h.name
									]
								}) }, h.symbol))
							}) : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[13px] text-muted self-end",
						children: ["Quantity in grams. Avg is ₹/g.", mode === "GOLD" ? " Live gold is ₹/10g on the tape." : " Live silver is ₹/kg on the tape."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-[12px] text-muted",
						children: [mode === "stock" ? "Quantity" : "Grams", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: qty,
							onChange: (e) => setQty(e.target.value),
							inputMode: "decimal"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-[12px] text-muted",
						children: ["Average cost", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: avg,
							onChange: (e) => setAvg(e.target.value),
							inputMode: "decimal"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-[12px] text-muted",
						children: ["Buy date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3",
				size: "sm",
				onClick: save,
				children: "Add to portfolio"
			})
		]
	});
}
//#endregion
export { Holdings as component };
