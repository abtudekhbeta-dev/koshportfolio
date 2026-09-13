import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as fmtPct, Et as resample, Gt as Button, O as fmtPx, on as cn, rt as universeName, tn as useKosh, xt as fmtVol } from "./router-oJX0L9_1.mjs";
import { c as apiOhlc, d as apiScreener } from "./api-Dymx0Kns.mjs";
import { t as AppShell } from "./app-shell-DSj9C3kP.mjs";
import { i as applyScreen, n as TRADE_SCANS } from "./screens-BehhQ_HG.mjs";
import { n as JournalDesk, r as StructureDesk, t as CandleChart } from "./structure-desk-B_8JmxjK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-CTQIWSi9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TradePage() {
	const watch = useKosh((s) => s.watch);
	const recents = useKosh((s) => s.recents);
	const [scan, setScan] = (0, import_react.useState)("breakout");
	const [pick, setPick] = (0, import_react.useState)("");
	const seed = pick || watch[0] || recents[0]?.symbol || "RELIANCE";
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const ohlc = useQuery({
		queryKey: [
			"ohlc",
			seed,
			"2y",
			"1d"
		],
		queryFn: () => apiOhlc(seed, "2y", "1d"),
		staleTime: 3e4
	});
	const daily = useQuery({
		queryKey: [
			"ohlc",
			seed,
			"1y",
			"1d"
		],
		queryFn: () => apiOhlc(seed, "1y", "1d"),
		staleTime: 6e5
	});
	const rows = screen.data?.rows || [];
	const hits = applyScreen(rows, scan).slice(0, 12);
	const pack = ohlc.data && !ohlc.data.missing ? ohlc.data : null;
	const name = pack?.name || universeName(seed);
	const row = rows.find((r) => r.symbol === seed.toUpperCase().replace(/\.(NS|BO)$/i, ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "kosh-page grid gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[28px] font-semibold tracking-tight",
					children: "Trade"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Chart first. Timeframe is the bar size (1m to 1M). The view opens on the last stretch of bars — scroll to zoom, drag to pan, like TradingView. Draw on the chart. Click a candle to start replay. Structure, scans, and a journal for the name you pick."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/s/$symbol",
								params: { symbol: seed },
								className: "text-[18px] font-semibold tracking-tight hover:text-chart",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-[12px] text-subtle",
								children: seed.toUpperCase()
							})] }), pack ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[15px] tabular",
								children: [
									fmtPx(pack.price),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: pack.changePct >= 0 ? "text-up" : "text-down",
										children: fmtPct(pack.changePct)
									})
								]
							}) : null]
						}),
						ohlc.isPending && !pack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[300px] animate-pulse rounded-lg bg-surface sm:h-[420px]" }) : pack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
							symbol: seed,
							bars: pack.bars,
							intra: false,
							high52: pack.high52,
							low52: pack.low52,
							prevClose: pack.previousClose
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"No series for ",
								seed,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MtfStrip, {
							bars: daily.data && !daily.data.missing ? daily.data.bars : [],
							row,
							volume: pack?.volume || 0
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 self-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructureDesk, { symbol: seed }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchStrip, {
							symbols: watch,
							rows,
							onPick: setPick
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Setups"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: TRADE_SCANS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							title: s.hint,
							onClick: () => setScan(s.id),
							className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", scan === s.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"),
							children: s.label
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanTable, {
						rows: hits,
						loading: screen.isPending,
						active: seed,
						onPick: setPick
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalDesk, {
					symbol: seed,
					price: pack?.price || 0
				})
			]
		})
	});
}
function ScanTable({ rows, loading, active, onPick }) {
	const bare = active.toUpperCase().replace(/\.(NS|BO)$/i, "");
	if (loading && !rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: "Running the scan…"
	});
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: "Nothing matches this setup right now."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border",
					children: [
						"Name",
						"Last",
						"Day",
						"RSI",
						"Vol",
						"52w"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: h
					}, h))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: cn("border-b border-border/60 last:border-0", r.symbol === bare && "bg-bg-elevated"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "text-left hover:text-chart",
							onClick: () => onPick(r.symbol),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-subtle",
								children: r.symbol
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-mono tabular",
						children: fmtPx(r.price)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
						children: fmtPct(r.changePct)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-mono tabular",
						children: r.rsi != null ? r.rsi.toFixed(0) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-mono tabular",
						children: r.volRatio != null ? r.volRatio.toFixed(1) + "×" : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2 font-mono tabular",
						children: r.offHigh != null ? fmtPct(r.offHigh) : "—"
					})
				]
			}, r.symbol)) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid gap-2 md:hidden",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onPick(r.symbol),
			className: cn("rounded-lg bg-surface p-3 text-left shadow-[var(--shadow-border)]", r.symbol === bare && "ring-1 ring-fg/25"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: r.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] text-subtle",
					children: r.symbol
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-3 gap-2 text-[12px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Last"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: fmtPx(r.price)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
							children: fmtPct(r.changePct)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "RSI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: r.rsi != null ? r.rsi.toFixed(0) : "—"
						})] })
					]
				})
			]
		}, r.symbol))
	})] });
}
function MtfStrip({ bars, row, volume }) {
	const week = (0, import_react.useMemo)(() => resample(bars, 604800), [bars]);
	const month = (0, import_react.useMemo)(() => resample(bars, 2592e3), [bars]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkCard, {
				label: "Daily",
				bars: bars.slice(-40)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkCard, {
				label: "Weekly",
				bars: week.slice(-40)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkCard, {
				label: "Monthly",
				bars: month.slice(-24)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: "Volume"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-[15px] tabular",
						children: fmtVol(volume)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted",
						children: [row?.volRatio != null ? row.volRatio.toFixed(1) + "× 20-day avg" : "—", row?.rsi != null ? ` · RSI ${row.rsi.toFixed(0)}` : ""]
					})
				]
			})
		]
	});
}
function SparkCard({ label, bars }) {
	const last = bars.at(-1);
	const first = bars[0];
	const ret = first?.c && last?.c ? (last.c / first.c - 1) * 100 : null;
	const w = 140;
	const h = 36;
	let d = "";
	if (bars.length > 1) {
		const lo = Math.min(...bars.map((b) => b.l));
		const span = Math.max(...bars.map((b) => b.h)) - lo || 1;
		d = bars.map((b, i) => {
			const x = i / (bars.length - 1) * w;
			const y = h - (b.c - lo) / span * 34 - 1;
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
		}).join(" ");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("font-mono text-[12px] tabular", (ret ?? 0) >= 0 ? "text-up" : "text-down"),
				children: ret != null ? fmtPct(ret) : "—"
			})]
		}), d ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: `0 0 ${w} ${h}`,
			className: "mt-1 h-8 w-full",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				fill: "none",
				stroke: "var(--color-chart)",
				strokeWidth: "1.4"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1 h-8" })]
	});
}
function WatchStrip({ symbols, rows, onPick }) {
	const map = new Map(rows.map((r) => [r.symbol, r]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Watch"
			}),
			symbols.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid gap-1",
				children: symbols.slice(0, 8).map((s) => {
					const r = map.get(s.toUpperCase());
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center justify-between py-1 text-left hover:text-chart",
						onClick: () => onPick(s),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px]",
							children: r?.name || universeName(s)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-mono text-[12px] tabular", (r?.changePct ?? 0) >= 0 ? "text-up" : "text-down"),
							children: r ? fmtPct(r.changePct) : ""
						})]
					}) }, s);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: "Pin names from a stock page."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "ghost",
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/watch",
					children: "Morning board"
				})
			})
		]
	});
}
//#endregion
export { TradePage as component };
