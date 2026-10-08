import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as apiHistory } from "./api-BE61nRQk.mjs";
import { G as riskMetrics, N as mixCagr, Q as windowReturn, Qt as useKosh, a as Label, b as fmtPct, bn as resolveBench, dn as BENCH, dt as Button, g as dash, gn as cn, j as mergeNav, nt as ytdReturn, o as Input, y as fmtInr, z as pathFromBars } from "./router-B40wiopi2.mjs";
import { t as AppShell } from "./app-shell-CZbb_-mJ.mjs";
import { t as NavChart } from "./nav-chart-h7HS7Nib.mjs";
import { n as metric } from "./metrics-DqAzqqFn.mjs";
import { r as MetricLabel, t as ChartSkeleton } from "./metric-D7oqxDaT.mjs";
import { t as loadBook } from "./use-book-BHFGcNpU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compare-BciIQcYT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function loadLeg(type, opts, ports) {
	if (type === "port") {
		const p = ports.find((x) => x.id === opts.portId);
		if (!p) return null;
		const book = await loadBook(p, { sleeves: false });
		return {
			name: p.name,
			value: book.value,
			windows: book.windows,
			cagr: book.cagr,
			mix: book.mix,
			risk: book.risk
		};
	}
	const spec = type === "stock" ? {
		symbol: opts.stock.trim(),
		name: opts.stock.trim()
	} : resolveBench(opts.bench);
	if (!spec.symbol) return null;
	const d = await apiHistory(spec.symbol, "max");
	const mix = pathFromBars(d.bars || [], []);
	return {
		name: type === "stock" ? d.name || spec.name : spec.name,
		value: type === "stock" ? d.price : void 0,
		windows: {
			w1: windowReturn(mix.nav, 7),
			m1: windowReturn(mix.nav, 31),
			m3: windowReturn(mix.nav, 93),
			m6: windowReturn(mix.nav, 186),
			y1: windowReturn(mix.nav, 365),
			ytd: ytdReturn(mix.nav)
		},
		cagr: mixCagr(mix.nav),
		mix,
		risk: riskMetrics(mix.nav)
	};
}
var RETURN_ROWS = [
	{
		id: "w1",
		pick: (l) => l.windows.w1.port
	},
	{
		id: "m1",
		pick: (l) => l.windows.m1.port
	},
	{
		id: "m3",
		pick: (l) => l.windows.m3.port
	},
	{
		id: "m6",
		pick: (l) => l.windows.m6.port
	},
	{
		id: "y1",
		pick: (l) => l.windows.y1.port
	},
	{
		id: "ytd",
		pick: (l) => l.windows.ytd.port
	},
	{
		id: "cagr",
		pick: (l) => l.cagr
	}
];
var RISK_ROWS = [
	{
		id: "sharpe",
		pick: (l) => l.risk.sharpe,
		fmt: (n) => n.toFixed(2)
	},
	{
		id: "sortino",
		pick: (l) => l.risk.sortino,
		fmt: (n) => n.toFixed(2)
	},
	{
		id: "alpha",
		pick: (l) => l.risk.alpha,
		fmt: (n) => fmtPct(n)
	},
	{
		id: "beta",
		pick: (l) => l.risk.beta,
		fmt: (n) => n.toFixed(2)
	},
	{
		id: "corr",
		pick: (l) => l.risk.corr,
		fmt: (n) => n.toFixed(2)
	},
	{
		id: "vol",
		pick: (l) => l.risk.vol,
		fmt: (n) => n.toFixed(1) + "%"
	},
	{
		id: "maxDd",
		pick: (l) => l.risk.maxDd,
		fmt: (n) => n.toFixed(1) + "%"
	},
	{
		id: "upCap",
		pick: (l) => l.risk.upCap,
		fmt: (n) => (n * 100).toFixed(0) + "%"
	},
	{
		id: "downCap",
		pick: (l) => l.risk.downCap,
		fmt: (n) => (n * 100).toFixed(0) + "%"
	},
	{
		id: "info",
		pick: (l) => l.risk.info,
		fmt: (n) => n.toFixed(2)
	},
	{
		id: "calmar",
		pick: (l) => l.risk.calmar,
		fmt: (n) => n.toFixed(2)
	}
];
function winnerOf(a, b, better) {
	if (better === 0) return null;
	if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return null;
	if (Math.abs(a - b) < 1e-6) return "tie";
	if (better === 1) return a > b ? "a" : "b";
	return a < b ? "a" : "b";
}
function ToneCell({ n, fmt, win, side }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("px-3 py-2.5 text-right font-mono tabular", win === side && "text-up", win && win !== "tie" && win !== side && "text-down/80"),
		children: dash(n, fmt)
	});
}
function ComparePage() {
	const ports = useKosh((s) => s.portfolios);
	const [aType, setAType] = (0, import_react.useState)("port");
	const [bType, setBType] = (0, import_react.useState)(ports[1] ? "port" : "bench");
	const [aPort, setAPort] = (0, import_react.useState)(ports[0]?.id || "");
	const [bPort, setBPort] = (0, import_react.useState)(ports[1]?.id || ports[0]?.id || "");
	const [aStock, setAStock] = (0, import_react.useState)("RELIANCE");
	const [bStock, setBStock] = (0, import_react.useState)("TCS");
	const [bBench, setBBench] = (0, import_react.useState)("nifty");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	const [A, setA] = (0, import_react.useState)(null);
	const [B, setB] = (0, import_react.useState)(null);
	const merged = (0, import_react.useMemo)(() => A && B ? mergeNav(A.mix.nav, B.mix.nav) : [], [A, B]);
	const score = (0, import_react.useMemo)(() => {
		if (!A || !B) return null;
		let a = 0;
		let b = 0;
		let n = 0;
		for (const row of [...RETURN_ROWS, ...RISK_ROWS]) {
			const d = metric(row.id);
			const win = winnerOf(row.pick(A), row.pick(B), d.better);
			if (win === "a") {
				a += 1;
				n += 1;
			} else if (win === "b") {
				b += 1;
				n += 1;
			} else if (win === "tie") n += 1;
		}
		return {
			a,
			b,
			n
		};
	}, [A, B]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight",
				children: "Compare"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-5 max-w-2xl text-sm leading-relaxed text-muted",
				children: "Put two portfolios, a stock, or an index side by side. Every return window and risk number is scored. Green is ahead, red is behind. Hover a metric, or tap ? to read what it means."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "px-1 text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: "Left"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]",
							value: aType,
							onChange: (e) => setAType(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "port",
								children: "Portfolio"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "stock",
								children: "Stock"
							})]
						})] }),
						aType === "port" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "mt-3",
							children: ["Portfolio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]",
								value: aPort,
								onChange: (e) => setAPort(e.target.value),
								children: ports.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "mt-3",
							children: ["Ticker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: aStock,
								onChange: (e) => setAStock(e.target.value)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "px-1 text-[11px] tracking-[0.08em] text-subtle uppercase",
							children: "Right"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]",
							value: bType,
							onChange: (e) => setBType(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "port",
									children: "Portfolio"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "stock",
									children: "Stock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "bench",
									children: "Index"
								})
							]
						})] }),
						bType === "port" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "mt-3",
							children: ["Portfolio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]",
								value: bPort,
								onChange: (e) => setBPort(e.target.value),
								children: ports.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))
							})]
						}) : bType === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "mt-3",
							children: ["Ticker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: bStock,
								onChange: (e) => setBStock(e.target.value)
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "mt-3",
							children: ["Index", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 rounded-sm bg-bg-elevated px-2 shadow-[var(--shadow-border)]",
								value: bBench,
								onChange: (e) => setBBench(e.target.value),
								children: Object.entries(BENCH).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: v.name
								}, k))
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				disabled: busy,
				onClick: async () => {
					setBusy(true);
					setErr("");
					try {
						const [left, right] = await Promise.all([loadLeg(aType, {
							portId: aPort,
							stock: aStock,
							bench: "nifty"
						}, ports), loadLeg(bType, {
							portId: bPort,
							stock: bStock,
							bench: bBench
						}, ports)]);
						if (!left || !right) {
							setErr("Could not load both sides.");
							setA(null);
							setB(null);
						} else {
							setA(left);
							setB(right);
						}
					} catch (e) {
						setErr(e instanceof Error ? e.message : "Failed");
					} finally {
						setBusy(false);
					}
				},
				children: busy ? "Loading history…" : "Compare"
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: err
			}) : null,
			busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, { label: "Aligning both histories…" })
			}) : null,
			A && B && !busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6",
				children: [
					score ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
								children: "Verdict"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[15px] leading-relaxed",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: A.name }),
									" is ahead on",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										className: cn("font-mono tabular", score.a >= score.b ? "text-up" : "text-muted"),
										children: score.a
									}),
									" checks ·",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: B.name }),
									" is ahead on",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										className: cn("font-mono tabular", score.b > score.a ? "text-up" : "text-muted"),
										children: score.b
									}),
									score.n ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [
											" · of ",
											score.n,
											" scored metrics"
										]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[12px] text-muted",
								children: "Returns, Sharpe, Sortino, alpha, Calmar, information ratio, and up-capture prefer higher. Volatility and down-capture prefer lower. Beta and correlation are shown, not scored."
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
									children: A.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-mono text-[22px] font-medium tabular",
									children: A.value ? fmtInr(A.value) : fmtPct(A.windows.y1.port)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-[12px] text-muted",
									children: [
										"1Y ",
										fmtPct(A.windows.y1.port),
										" · CAGR ",
										fmtPct(A.cagr)
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
									children: B.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-mono text-[22px] font-medium tabular",
									children: B.value ? fmtInr(B.value) : fmtPct(B.windows.y1.port)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-[12px] text-muted",
									children: [
										"1Y ",
										fmtPct(B.windows.y1.port),
										" · CAGR ",
										fmtPct(B.cagr)
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavChart, {
						nav: merged,
						portLabel: A.name,
						benchLabel: B.name,
						coverage: "Aligned on the same days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareTable, {
						title: "Returns",
						aName: A.name,
						bName: B.name,
						rows: RETURN_ROWS.map((r) => ({
							...r,
							fmt: (n) => fmtPct(n)
						})),
						A,
						B
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareTable, {
						title: "Risk",
						aName: A.name,
						bName: B.name,
						rows: RISK_ROWS,
						A,
						B
					})
				]
			}) : null
		]
	}) });
}
function CompareTable({ title, aName, bName, rows, A, B }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "kosh-table w-full text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: "Metric"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: aName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: bName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-right text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: "Gap"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
						children: "Ahead"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
				const d = metric(row.id);
				const av = row.pick(A);
				const bv = row.pick(B);
				const win = winnerOf(av, bv, d.better);
				const gap = av != null && bv != null ? av - bv : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricLabel, { id: row.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 max-w-xs text-[11px] leading-snug text-muted",
							children: d.short
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
						n: av,
						fmt: row.fmt,
						win,
						side: "a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
						n: bv,
						fmt: row.fmt,
						win,
						side: "b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2.5 text-right font-mono tabular text-muted",
						children: gap == null ? "—" : (gap > 0 ? "+" : "") + (Math.abs(gap) >= 10 ? gap.toFixed(1) : gap.toFixed(2))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-2.5",
						children: win === "a" || win === "b" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] text-up",
							children: win === "a" ? aName : bName
						}) : win === "tie" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] text-subtle",
							children: "Level"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] text-subtle",
							children: "—"
						})
					})
				] }, row.id);
			}) })]
		})
	})] });
}
//#endregion
export { ComparePage as component };
