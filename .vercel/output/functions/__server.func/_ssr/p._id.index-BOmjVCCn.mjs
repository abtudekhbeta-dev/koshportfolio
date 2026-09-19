import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQueries, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { At as bareSym, Mt as mixVsNifty, Nn as useKosh, Nt as niftyOverlap, Ot as bookXirr, Rn as cn, at as fmtInr, lt as insights, ot as fmtPct } from "./router-COGOfPBd.mjs";
import { f as apiScreener, r as apiFundamentals, s as apiNews } from "./api-DtVFWAsH.mjs";
import { n as NavChart } from "./nav-chart-DPW1x0p7.mjs";
import { i as overlayOnMix } from "./path-DHZ8xc8v.mjs";
import { n as HoldingDesk, r as NewsBoard, t as BookDesk } from "./news-board-CYvX8OUZ.mjs";
import { t as EventCalendar } from "./macro-board-B06NioQw.mjs";
import { i as ShareRing, n as CapSplit, r as MiniBars } from "./share-ring-Di5XIyOX.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { n as Kpi, r as toneOf, t as AttentionStrip } from "./attention-strip-C_-MNEZg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.index-BOmjVCCn.js
var import_jsx_runtime = require_jsx_runtime();
function OvernightCard({ rows, screen }) {
	const map = new Map((screen || []).map((r) => [r.symbol.toUpperCase(), r]));
	const list = [...rows].filter((r) => r.kind !== "commodity").sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 8);
	if (!list.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Overnight moves"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: "Versus previous close."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid",
				children: list.map((r) => {
					const s = map.get(r.symbol.toUpperCase());
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "kosh-row kosh-row-stack text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/s/$symbol",
							params: { symbol: r.symbol },
							className: "min-w-0 hover:text-chart",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-medium",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-subtle",
								children: [r.symbol, s?.gapPct != null ? ` · gap ${fmtPct(s.gapPct)}` : ""]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("shrink-0 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
							children: fmtPct(r.changePct)
						})]
					}, r.symbol);
				})
			})
		]
	});
}
function DispositionList({ rows }) {
	const eq = rows.filter((r) => r.kind !== "commodity" && r.invested > 0);
	const winners = eq.filter((r) => r.unrealPct >= 25).sort((a, b) => b.unrealPct - a.unrealPct).slice(0, 4);
	const losers = eq.filter((r) => r.unrealPct <= -15).sort((a, b) => a.unrealPct - b.unrealPct).slice(0, 4);
	const large = eq.filter((r) => r.weight >= .12).sort((a, b) => b.weight - a.weight).slice(0, 4);
	if (!winners.length && !losers.length && !large.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Disposition"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] text-muted",
				children: "Easy to sell winners, easy to hold losers. A list — not a rule."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Col, {
						title: "Winners",
						hint: "Protect the lead",
						items: winners,
						kind: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Col, {
						title: "Losers",
						hint: "Revisit the thesis",
						items: losers,
						kind: "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Col, {
						title: "Large bets",
						hint: "Weight ≥ 12%",
						items: large,
						kind: "muted"
					})
				]
			})
		]
	});
}
function Col({ title, hint, items, kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
			children: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted",
			children: hint
		}),
		items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 grid gap-1.5",
			children: items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "kosh-row kosh-row-stack",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$symbol",
					params: { symbol: r.symbol },
					className: "min-w-0 hover:text-chart",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-[13px] font-medium",
						children: r.name
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("shrink-0 font-mono text-[13px] tabular", kind === "up" && "text-up", kind === "down" && "text-down"),
					children: [
						fmtPct(r.unrealPct),
						" · ",
						fmtInr(r.unreal)
					]
				})]
			}, r.symbol))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] text-muted",
			children: "None."
		})
	] });
}
function Overview() {
	const { query, portfolio } = useBookCtx();
	const setIncludeCommodities = useKosh((s) => s.setIncludeCommodities);
	const book = query.data;
	const { rows, value, invested, unreal, dayAbs, dayPct, sectors, caps } = book;
	const unrealPct = invested ? unreal / invested * 100 : 0;
	const pts = insights(book);
	const xirr = bookXirr(rows.map((r) => {
		const h = portfolio.holdings.find((x) => x.symbol === r.symbol);
		return {
			date: h?.date || null,
			boughtAt: h?.boughtAt,
			qty: r.qty,
			avg: r.avg,
			px: r.px,
			value: r.value,
			lots: h?.lots || r.lots
		};
	}), true);
	const sectorList = Object.entries(sectors).sort((a, b) => b[1].value - a[1].value);
	const contrib = [...rows].filter((r) => book.includeCommodities || r.kind !== "commodity").sort((a, b) => Math.abs(b.unreal) - Math.abs(a.unreal)).slice(0, 8);
	const metalsOn = book.includeCommodities;
	const hasMetals = book.commodityValue > 0;
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const trades = portfolio.trades || [];
	const path = book.path;
	const chartNav = path?.nav?.length ? overlayOnMix(book.mix.nav, path.nav) : book.mix.nav;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "kosh-stagger grid grid-cols-2 gap-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						metricId: "value",
						label: "Current value",
						value: fmtInr(value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						metricId: "invested",
						label: "Invested",
						value: fmtInr(invested)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						metricId: "day",
						label: "Today",
						value: fmtInr(dayAbs),
						hint: fmtPct(dayPct),
						tone: toneOf(dayAbs)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						metricId: "unreal",
						label: "Unrealised P&L",
						value: fmtInr(unreal),
						hint: unrealPct.toFixed(2) + "%",
						tone: toneOf(unreal)
					})
				]
			}),
			xirr.xirr != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-muted",
				children: [
					"Your XIRR",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("font-mono tabular", xirr.xirr >= 0 ? "text-up" : "text-down"),
						children: [xirr.xirr.toFixed(1), "%"]
					}),
					xirr.from ? ` from ${xirr.from}` : "",
					xirr.nMissing ? ` · ${fmtInr(xirr.missingValue)} has no date` : "",
					". Money-weighted from dated remaining lots — sold lines and dividends are not in this figure. The chart below is the current mix, not your XIRR."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-muted",
				children: [
					"Add buy dates for your XIRR.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/p/$id/holdings",
						params: { id: portfolio.id },
						className: "text-chart hover:underline",
						children: "Holdings"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/p/$id/improve",
						params: { id: portfolio.id },
						className: "text-chart hover:underline",
						children: "Improve Portfolio"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttentionStrip, {
				symbols: rows.filter((r) => r.kind !== "commodity").map((r) => ({
					symbol: r.symbol,
					name: r.name,
					weight: r.weight
				})),
				title: "Near-term triggers"
			}),
			hasMetals ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Equity",
						value: fmtInr(book.equityValue)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Gold & silver",
						value: fmtInr(book.commodityValue),
						hint: metalsOn ? "included in totals" : "excluded from totals"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Chart",
						value: metalsOn ? "Equity + metals" : "Equity only",
						hint: "Toggle below the chart, or in the header"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixFacts, {
				rows,
				screen: screen.data?.rows || [],
				ready: !screen.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: [
						"This mix vs ",
						book.benchName,
						path?.nav?.length ? " — and your path" : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-[12px] text-muted",
					children: [
						"Blue is today’s remaining names, taken back through each stock’s adjusted daily prices. It is not your XIRR and not a reconstruction of what you held in 2018.",
						path?.nav?.length ? " The warm line is your path: the rupees you actually held after each buy and sell. Tap a name on the chart to hide it." : " Upload a buy/sell file on Path to add that line here.",
						" ",
						hasMetals && !metalsOn ? " Gold and silver sit on Holdings but are out of this line and the totals." : "",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/p/$id/path",
							params: { id: portfolio.id },
							className: "text-chart hover:underline",
							children: "Open Path"
						}),
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/compare",
							className: "text-chart hover:underline",
							children: "Compare this portfolio"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
					nav: chartNav,
					portLabel: "This mix",
					benchLabel: book.benchName,
					pathLabel: path?.nav?.length ? "Your path" : void 0,
					sameLabel: path?.nav?.length ? `Same money in ${book.benchName}` : void 0,
					coverage: `${book.coverage}${book.mix.missing.length ? " · skipped " + book.mix.missing.join(", ") : ""}`,
					nowValue: book.value,
					metals: hasMetals ? {
						present: true,
						included: metalsOn,
						onChange: (on) => setIncludeCommodities(portfolio.id, on)
					} : void 0
				})
			] }),
			trades.length && path ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-muted",
				children: [
					"This mix is today’s remaining names. Your path needs a dated buy/sell file — it does not change Mix.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/p/$id/path",
						params: { id: portfolio.id },
						className: "text-chart hover:underline",
						children: "Open Path"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OvernightCard, {
				rows,
				screen: screen.data?.rows
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DispositionList, { rows }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldingDesk, { brief: {
				name: portfolio.name,
				bench: book.benchName,
				names: rows.filter((r) => book.includeCommodities || r.kind !== "commodity").map((r) => ({
					symbol: r.symbol,
					weight: r.weight,
					sector: r.sector
				}))
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioNews, {
				name: portfolio.name,
				id: portfolio.id,
				symbols: rows.filter((r) => r.kind !== "commodity").slice(0, 8).map((r) => ({
					symbol: r.symbol,
					name: r.name
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCalendar, {
				compact: true,
				symbols: rows.map((r) => r.symbol)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookDesk, { brief: {
				name: portfolio.name,
				bench: book.benchName,
				names: rows.filter((r) => book.includeCommodities || r.kind !== "commodity").map((r) => ({
					symbol: r.symbol,
					weight: r.weight,
					sector: r.sector
				}))
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "At a glance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 md:grid-cols-2",
				children: pts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: p.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("mt-1 font-mono text-xl font-medium tabular", p.tone === "good" && "text-up", p.tone === "bad" && "text-down", p.tone === "warn" && "text-warn"),
							children: p.figure
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] leading-snug text-muted",
							children: p.body
						})
					]
				}, p.title))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Market cap"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[12px] text-muted",
					children: "Live Indian buckets from market cap — not the spreadsheet’s label. Large ≥ ₹20,000 Cr, mid ≥ ₹5,000 Cr, small ≥ ₹500 Cr, else micro."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-xl rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CapSplit, { items: [
						"Large",
						"Mid",
						"Small",
						"Micro"
					].map((name) => ({
						name,
						pct: value ? (caps[name] || 0) / value * 100 : 0
					})) })
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Sectors"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareRing, { items: sectorList.map(([name, s]) => ({
							name,
							pct: value ? s.value / value * 100 : 0
						})) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "P&L drivers"
					}), contrib.length && contrib.every((r) => !r.unreal) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No P&L yet — add average cost on Holdings."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: contrib.map((r) => ({
						name: r.name,
						sub: r.symbol,
						symbol: r.symbol,
						value: r.unreal,
						label: fmtInr(r.unreal),
						tone: r.unreal >= 0 ? "up" : "down"
					})) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[12px] text-subtle",
				children: [
					book.coverage,
					book.firstDay ? ` · ${book.firstDay} → ${book.lastDay}` : "",
					" · ",
					portfolio.holdings.length,
					" lines",
					hasMetals ? ` · metals ${metalsOn ? "included in totals" : "excluded from totals"}` : ""
				]
			})
		]
	});
}
function PortfolioNews({ name, id, symbols }) {
	const q = useQuery({
		queryKey: [
			"p-news",
			id,
			symbols.map((s) => s.symbol).join(",")
		],
		queryFn: async () => {
			const lists = await Promise.all(symbols.map((s) => apiNews(s.symbol, s.name).catch(() => [])));
			const seen = /* @__PURE__ */ new Set();
			const items = [];
			for (const list of lists) for (const it of list) {
				const k = (it.link || "") + it.title;
				if (seen.has(k)) continue;
				seen.add(k);
				items.push(it);
			}
			return items.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 16);
		},
		enabled: symbols.length > 0,
		staleTime: 3e5
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsBoard, {
			title: "Portfolio news",
			items: q.data,
			loading: q.isPending,
			shareTitle: `${name} news`,
			alertScope: "p:" + id
		})
	});
}
function MixFacts({ rows, screen, ready }) {
	const eq = rows.filter((r) => r.kind !== "commodity");
	const map = new Map(screen.map((r) => [bareSym(r.symbol), {
		pe: r.pe,
		roe: r.roe,
		de: r.de,
		divYield: r.divYield
	}]));
	const missing = ready ? eq.filter((r) => {
		const x = map.get(bareSym(r.symbol));
		return !x || x.pe == null && x.roe == null;
	}).slice(0, 16) : [];
	useQueries({ queries: missing.map((r) => ({
		queryKey: ["fund", r.symbol],
		queryFn: () => apiFundamentals(r.symbol),
		staleTime: 18e5
	})) }).forEach((q, i) => {
		const f = q.data;
		if (!f) return;
		const key = bareSym(missing[i].symbol);
		const prev = map.get(key);
		map.set(key, {
			pe: f.pe ?? prev?.pe,
			roe: f.roe ?? prev?.roe,
			de: f.de ?? prev?.de,
			divYield: f.divYield ?? prev?.divYield
		});
	});
	if (!eq.length) return null;
	const vs = mixVsNifty(eq, map, screen);
	const ov = niftyOverlap(eq);
	const line = (label, a, b, fmt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-row kosh-row-stack py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[13px] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
			className: "font-mono text-[14px] tabular",
			children: [a == null ? "—" : fmt(a), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-subtle",
				children: [" · Nifty ", b == null ? "—" : fmt(b)]
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Your companies vs Nifty 50"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-muted",
				children: "Your weights next to the 50 names. Each holding uses its own company numbers — a blank is missing, not zero."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-2 max-w-xl",
				children: [
					line("You pay for earnings", vs.pe, vs.niftyPe, (x) => x.toFixed(1) + "×"),
					line("Profitability (ROE)", vs.roe, vs.niftyRoe, (x) => x.toFixed(0) + "%"),
					line("Debt / equity", vs.de, vs.niftyDe, (x) => x.toFixed(2)),
					line("Dividend", vs.divYield, vs.niftyDiv, (x) => x.toFixed(1) + "%")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-subtle",
				children: [
					vs.covered,
					" of ",
					eq.length,
					" names have numbers",
					ov.satellites.length ? ` · ${ov.satellites.length} sit outside the 50` : "",
					"."
				]
			})
		]
	});
}
//#endregion
export { Overview as component };
