import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { p as apiResearch, v as apiSeasonalityAll, y as apiSeasonalityRecover } from "./api-BE61nRQk.mjs";
import { S as canonSymbol, X as portfolioSeason, Z as recoveryTargets, at as seasonView, it as seasonCloseAsk, l as acceptSourcedClose, vt as windowBounds } from "./router-B40wiopi.mjs";
import { i as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Qt as useKosh, b as fmtPct, gn as cn } from "./router-B40wiopi2.mjs";
import { p as plotChrome, t as BENCH_STROKE } from "./plot-BzhEnD2T.mjs";
import { t as AIButton } from "./ai-button-DQ_DAML1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seasonality-desk-CIoD_FyH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LOOKBACKS = [
	2,
	3,
	5,
	10
];
var DISCLAIMER = "Seasonality reflects historical tendencies and is not a forecast or guarantee of future returns.";
function cellsOf(s, kind) {
	return kind === "monthly" ? s.monthly : s.quarterly;
}
function coverage(cells) {
	const expected = cells.filter((c) => c.status !== "partial").length;
	const observed = cells.filter((c) => c.status === "calculated").length;
	return {
		expected,
		observed,
		missing: cells.filter((c) => c.status === "missing").length,
		pct: expected > 0 ? observed / expected * 100 : null
	};
}
function inWindow(c, start, end, includeCurrent, asOfYear) {
	if (c.status !== "calculated") return false;
	if (c.year < start || c.year > end) return false;
	if (!includeCurrent && c.year >= asOfYear) return false;
	return true;
}
function SeasonalityDesk({ mode, names }) {
	const [kind, setKind] = (0, import_react.useState)("monthly");
	const [lookback, setLookback] = (0, import_react.useState)(5);
	const [includeCurrent, setIncludeCurrent] = (0, import_react.useState)(false);
	const [compare, setCompare] = (0, import_react.useState)(false);
	const [windowEnd, setWindowEnd] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const qc = useQueryClient();
	const symbols = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Set();
		const rows = [...names].sort((a, b) => (b.weight || 0) - (a.weight || 0));
		const out = [];
		for (const n of rows) {
			const key = canonSymbol(n.symbol);
			if (!key || seen.has(key)) continue;
			seen.add(key);
			out.push(n);
		}
		return out;
	}, [names]);
	const key = symbols.map((s) => canonSymbol(s.symbol)).join("|");
	const q = useQuery({
		queryKey: ["seasonality", key],
		queryFn: () => apiSeasonalityAll(symbols.map((s) => s.symbol), { benchmark: true }),
		enabled: symbols.length > 0,
		staleTime: 216e5
	});
	const bounds = (0, import_react.useMemo)(() => {
		if (!q.data) return null;
		const cells = q.data.series.flatMap((s) => cellsOf(s, kind));
		return windowBounds(cells, lookback, q.data.asOf, includeCurrent);
	}, [
		q.data,
		kind,
		lookback,
		includeCurrent
	]);
	const view = (0, import_react.useMemo)(() => {
		if (!q.data || !bounds) return null;
		const end = Math.min(bounds.maxEnd, Math.max(bounds.minEnd, windowEnd ?? bounds.defaultEnd));
		const bench = compare ? q.data.benchmark ? cellsOf(q.data.benchmark, kind) : void 0 : void 0;
		if (mode === "stock") {
			const s = q.data.series[0];
			if (!s) return null;
			return seasonView(cellsOf(s, kind), {
				kind,
				lookback,
				windowEnd: end,
				includeCurrent,
				asOfDay: q.data.asOf,
				firstDay: s.firstDay,
				lastDay: s.lastDay,
				bench
			});
		}
		return portfolioSeason(q.data.series.map((s) => ({
			symbol: s.symbol,
			cells: cellsOf(s, kind),
			firstDay: s.firstDay,
			lastDay: s.lastDay
		})), symbols.map((n) => ({
			symbol: n.symbol,
			name: n.name,
			weight: n.weight || 0
		})), {
			kind,
			lookback,
			windowEnd: end,
			includeCurrent,
			asOfDay: q.data.asOf,
			bench
		});
	}, [
		q.data,
		bounds,
		windowEnd,
		compare,
		mode,
		kind,
		lookback,
		includeCurrent,
		symbols
	]);
	const asOfYear = Number(q.data?.asOf?.slice(0, 4) || 0);
	const coveredNames = mode === "portfolio" && view && q.data ? q.data.series.filter((s) => cellsOf(s, kind).some((c) => inWindow(c, view.windowStart, view.windowEnd, includeCurrent, asOfYear))).length : 0;
	const targets = view && q.data ? recoveryTargets(q.data.series.map((s) => ({
		symbol: s.symbol,
		monthly: s.monthly
	})), view.windowStart, view.windowEnd, 6) : [];
	const pick = view ? Math.min(selected, Math.max(0, view.buckets.length - 1)) : 0;
	const bucket = view?.buckets[pick];
	async function refresh() {
		setBusy("refresh");
		setNote("");
		try {
			const data = await apiSeasonalityAll(symbols.map((s) => s.symbol), {
				benchmark: true,
				refresh: true
			});
			qc.setQueryData(["seasonality", key], data);
			setNote("Stored history refreshed from the market source. Nothing was estimated.");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Could not refresh history.");
		} finally {
			setBusy(null);
		}
	}
	async function recover() {
		if (!targets.length) {
			setNote("No specific missing month to look up. A history was not invented.");
			return;
		}
		setBusy("ai");
		setNote("");
		const lines = [];
		for (const t of targets) try {
			const item = (await apiResearch(t.symbol, [seasonCloseAsk(t.symbol, t.year, t.month)])).items?.[0];
			const accepted = acceptSourcedClose({
				sourceUrl: item?.sourceUrl,
				sourceName: item?.sourceName,
				evidence: item?.evidence,
				methodology: item?.methodology,
				value: item?.value,
				year: t.year,
				month: t.month
			});
			if (!accepted || !item?.sourceUrl || !item.sourceName) {
				lines.push(`${t.symbol} ${t.year}-${String(t.month).padStart(2, "0")}: no sourced close. Left missing.`);
				continue;
			}
			const saved = await apiSeasonalityRecover({
				symbol: t.symbol,
				year: t.year,
				month: t.month,
				value: accepted.price,
				sourceUrl: item.sourceUrl,
				sourceName: item.sourceName,
				evidence: item.evidence || ""
			});
			lines.push(saved.ok ? `${t.symbol} ${accepted.day}: stored from ${item.sourceName}. A market print still outranks it.` : `${t.symbol}: ${saved.reason}`);
		} catch (err) {
			lines.push(`${t.symbol}: ${err instanceof Error ? err.message : "AI research unavailable"}`);
		}
		setNote(lines.join(" "));
		await qc.invalidateQueries({ queryKey: ["seasonality", key] });
		setBusy(null);
	}
	if (!symbols.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: "Seasonality"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] text-muted",
			children: "Add holdings to see how this portfolio has tended to behave by month and quarter."
		})]
	});
	const portView = mode === "portfolio" && view ? view : null;
	const end = view?.windowEnd ?? bounds?.defaultEnd ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Seasonality"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-[13px] leading-relaxed text-muted",
				children: mode === "portfolio" ? "Based on current portfolio holdings and current weights. This is not a reconstruction of what the portfolio held in past years." : "Average historical return by calendar period, from adjusted closes. Not a forecast."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					role: "group",
					"aria-label": "Period",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						on: kind === "monthly",
						onClick: () => setKind("monthly"),
						children: "Monthly"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						on: kind === "quarterly",
						onClick: () => setKind("quarterly"),
						children: "Quarterly"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					role: "group",
					"aria-label": "Lookback",
					children: LOOKBACKS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
						on: lookback === n,
						onClick: () => setLookback(n),
						"aria-pressed": lookback === n,
						children: [n, "Y"]
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-baseline justify-between gap-3 text-[12px] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Historical window" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular text-fg",
						children: view ? `${view.windowStart}–${view.windowEnd}` : "—"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: bounds?.minEnd ?? 0,
					max: bounds?.maxEnd ?? 0,
					step: 1,
					value: end,
					disabled: !bounds || bounds.minEnd >= bounds.maxEnd,
					"aria-label": "Historical window end year",
					"aria-valuetext": view ? `${view.windowStart} to ${view.windowEnd}` : "Loading",
					onChange: (e) => setWindowEnd(Number(e.target.value)),
					className: "h-8 w-full cursor-pointer accent-chart disabled:cursor-default disabled:opacity-50"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: includeCurrent,
						onChange: (e) => setIncludeCurrent(e.target.checked)
					}), "Include current year"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: compare,
						onChange: (e) => setCompare(e.target.checked)
					}), "Compare with Nifty 50"]
				})]
			}),
			q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-muted",
				children: "Reading stored history. The window slider will not download it again."
			}) : null,
			q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-down",
				children: [
					q.error instanceof Error ? q.error.message : "History could not be read.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-chart underline",
						onClick: () => void q.refetch(),
						children: "Retry"
					})
				]
			}) : null,
			view ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonChart, {
					buckets: view.buckets,
					selected: pick,
					onSelect: setSelected,
					compare
				}),
				bucket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BucketRead, {
					bucket,
					compare,
					kind
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-[13px] leading-relaxed text-muted",
					children: view.note
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-fg",
					children: DISCLAIMER
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Coverage",
							value: view.coveragePct == null ? "—" : `${view.coveragePct.toFixed(0)}%`,
							hint: `${view.observed} of ${view.expected} periods`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "First close",
							value: view.firstDay || "—",
							hint: view.lastDay ? `through ${view.lastDay}` : "No series"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Years in store",
							value: String(view.yearsAvailable),
							hint: `${lookback}Y selected`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Method",
							value: `v1`,
							hint: "Adjusted month-end and quarter-end"
						})
					]
				}),
				portView ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "max-w-2xl text-[13px] leading-relaxed text-muted",
					children: [
						coveredNames,
						"/",
						q.data?.series.length || 0,
						" holdings have a return inside ",
						view.windowStart,
						"–",
						view.windowEnd,
						". ",
						portView.method
					]
				}) : null,
				compare && !q.data?.benchmark?.monthly.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-muted",
					children: "Nifty 50 history was not available. The comparison was not invented."
				}) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "inline-flex h-8 items-center rounded-sm px-2.5 text-[13px] text-muted shadow-[var(--shadow-border)] hover:text-fg disabled:opacity-40",
						disabled: busy != null,
						onClick: () => void refresh(),
						children: busy === "refresh" ? "Refreshing…" : "Refresh stored history"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
						busy: busy === "ai",
						busyLabel: "Checking sources…",
						disabled: !targets.length || busy != null,
						onClick: () => void recover(),
						children: "· Look up missing closes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-[12px] leading-relaxed text-muted",
						children: !view ? "History is still loading. AI is not asked until you request a specific missing month." : targets.length ? `Up to ${targets.length} missing month-end close${targets.length === 1 ? "" : "s"} can be checked. A price is kept only with a source.` : "No specific missing month in this window. A 10-year history is not invented."
					})
				]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] leading-relaxed text-muted",
				children: note
			}) : null,
			q.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataHealth, {
				rows: q.data.series,
				version: q.data.version
			}) : null
		]
	});
}
function Chip({ on, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": on,
		className: cn("inline-flex h-9 items-center justify-center rounded-sm px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart", on ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
		...props,
		children
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-[15px] tabular",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-[11px] text-muted",
				children: hint
			}) : null
		]
	});
}
function BucketRead({ bucket, compare, kind }) {
	const n = bucket.observations;
	const pos = n && bucket.positivePct != null ? Math.round(bucket.positivePct / 100 * n) : 0;
	const unit = kind === "monthly" ? bucket.label : bucket.label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: unit
			}),
			n === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: "No completed observations in this window. A missing period is not shown as zero."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] text-subtle uppercase",
						children: "Average"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: cn("font-mono text-lg tabular", (bucket.avg || 0) >= 0 ? "text-up" : "text-down"),
						children: fmtPct(bucket.avg)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] text-subtle uppercase",
						children: "Median"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: cn("font-mono text-lg tabular", (bucket.median || 0) >= 0 ? "text-up" : "text-down"),
						children: fmtPct(bucket.median)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] text-subtle uppercase",
						children: "Positive periods"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-mono text-lg tabular",
						children: [
							pos,
							" of ",
							n,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-[13px] text-muted",
								children: bucket.positivePct == null ? "" : `(${bucket.positivePct.toFixed(0)}%)`
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[11px] text-subtle uppercase",
						children: "Observations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono text-lg tabular",
						children: n
					})] })
				]
			}),
			compare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[12px] text-muted",
				children: [
					"Nifty 50 average ",
					bucket.benchAvg == null ? "not available for this period" : fmtPct(bucket.benchAvg),
					". Secondary. Same method."
				]
			}) : null
		]
	});
}
function SeasonChart({ buckets, selected, onSelect, compare }) {
	const theme = useKosh((s) => s.theme);
	const chrome = plotChrome(theme);
	const W = 720;
	const H = 232;
	const PL = 46;
	const PR = 10;
	const PT = 12;
	const PB = 28;
	const vals = buckets.flatMap((b) => [b.avg, compare ? b.benchAvg : null].filter((n) => n != null && Number.isFinite(n)));
	let lo = Math.min(0, ...vals);
	let hi = Math.max(0, ...vals);
	if (!(hi > lo)) {
		lo = -1;
		hi = 1;
	}
	const pad = (hi - lo) * .14;
	lo -= pad;
	hi += pad;
	const yOf = (v) => PT + (hi - v) / (hi - lo) * 192;
	const zero = yOf(0);
	const n = buckets.length || 1;
	const slot = 664 / n;
	const bw = Math.max(6, slot * .62);
	const step = hi - lo > 40 ? 10 : hi - lo > 16 ? 5 : hi - lo > 8 ? 2 : 1;
	const marks = [];
	for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-6 && marks.length < 6; v += step) marks.push(Math.round(v * 100) / 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between gap-3 text-[11px] text-subtle",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Average return" }), compare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-block h-[2px] w-3.5",
					style: { background: BENCH_STROKE }
				}), "Nifty 50"]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${W} ${H}`,
				className: "h-[220px] w-full",
				role: "img",
				"aria-label": "Seasonality averages",
				children: [
					marks.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: PL,
						x2: 710,
						y1: yOf(v),
						y2: yOf(v),
						stroke: v === 0 ? chrome.zeroStroke : chrome.gridStroke,
						strokeWidth: v === 0 ? 1.25 : 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						x: 40,
						y: yOf(v),
						fill: chrome.tickFill,
						fontSize: "10",
						fontFamily: "IBM Plex Mono, ui-monospace, monospace",
						textAnchor: "end",
						dominantBaseline: "middle",
						children: [v > 0 ? `+${v}` : v, "%"]
					})] }, v)),
					buckets.map((b, i) => {
						const cx = PL + slot * i + slot / 2;
						if (b.avg == null) return null;
						const y = yOf(b.avg);
						const top = Math.min(y, zero);
						const h = Math.max(1.5, Math.abs(zero - y));
						const up = b.avg >= 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: cx - bw / 2,
							y: top,
							width: bw,
							height: h,
							rx: 1,
							fill: up ? "var(--k-up)" : "var(--k-down)",
							fillOpacity: selected === i ? 1 : .82,
							stroke: selected === i ? "var(--k-fg)" : "none",
							strokeWidth: selected === i ? 1.25 : 0
						}, b.label);
					}),
					compare ? buckets.map((b, i) => {
						if (b.benchAvg == null) return null;
						const cx = PL + slot * i + slot / 2;
						const y = yOf(b.benchAvg);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: cx - bw / 2,
							x2: cx + bw / 2,
							y1: y,
							y2: y,
							stroke: BENCH_STROKE,
							strokeWidth: 2
						}, `b-${b.label}`);
					}) : null,
					buckets.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: PL + slot * i + slot / 2,
						y: 224,
						fill: chrome.tickFill,
						fontSize: "10",
						fontFamily: "IBM Plex Mono, ui-monospace, monospace",
						textAnchor: "middle",
						children: b.label
					}, `l-${b.label}`))
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: {
					left: `${PL / W * 100}%`,
					right: `${PR / W * 100}%`,
					top: `${PT / H * 100}%`,
					bottom: `${PB / H * 100}%`
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-full",
					style: { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` },
					children: buckets.map((b, i) => {
						const pos = b.observations && b.positivePct != null ? Math.round(b.positivePct / 100 * b.observations) : 0;
						const label = b.avg == null ? `${b.label}, no observations. Not shown as zero.` : `${b.label}, average ${fmtPct(b.avg)}, median ${fmtPct(b.median)}, positive ${pos} of ${b.observations}`;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": selected === i,
							"aria-label": label,
							onMouseEnter: () => onSelect(i),
							onFocus: () => onSelect(i),
							onClick: () => onSelect(i),
							className: "h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-chart"
						}, b.label);
					})
				})
			})]
		})]
	});
}
function DataHealth({ rows, version }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "cursor-pointer text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Data health"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[12px] leading-relaxed text-muted",
				children: [
					"Daily adjusted closes stored in Kosh. Method v",
					version,
					". A direct market print outranks an AI-researched close. Conflicts stay on record and are not averaged away."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "kosh-table w-full text-left text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Symbol"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "First"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Last"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium text-right",
								children: "Sessions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium text-right",
								children: "Months"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium text-right",
								children: "AI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium text-right",
								children: "Conflicts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Source"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => {
						const m = coverage(r.monthly);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 font-mono",
								children: r.symbol
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 font-mono",
								children: r.firstDay || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 font-mono",
								children: r.lastDay || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-right font-mono tabular",
								children: r.sessions
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-2 py-1.5 text-right font-mono tabular",
								children: [
									m.observed,
									"/",
									m.expected,
									m.missing ? ` · ${m.missing} missing` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-right font-mono tabular",
								children: r.aiDays || 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-right font-mono tabular",
								children: r.conflicts || 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-muted",
								children: r.source
							})
						] }, r.symbol);
					}) })]
				})
			}),
			rows.some((r) => r.note) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-1 text-[12px] text-muted",
				children: rows.filter((r) => r.note).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: r.symbol
					}),
					" — ",
					r.note
				] }, r.symbol))
			}) : null
		]
	});
}
//#endregion
export { SeasonalityDesk as t };
