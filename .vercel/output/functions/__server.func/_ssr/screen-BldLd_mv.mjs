import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as useKosh, K as fmtPct, S as scoreMultibagger, _ as matchLabel, cn as Button, d as applyFilter, f as applyScreen, h as filterSector, ir as cn, k as sortRows, m as fillBlankScreenFund, p as candidateMultibagger, q as fmtPx, u as SCREEN_PRESETS, v as mergeScreenRows, vn as fmtVol, x as rulesForScreen, y as missingScreenFacts } from "./router-CAFi_xno.mjs";
import { f as apiScreenBuild, m as apiScreenerDeep, n as apiEnrich, p as apiScreener } from "./api-DNMbHhUJ.mjs";
import { t as AppShell } from "./app-shell-CbHysjHx.mjs";
import { t as AIButton } from "./ai-button-D8qNTvVB.mjs";
import { t as EnrichButton } from "./enrich-button-CBFdL-Cp.mjs";
import { t as ResearchMissing } from "./research-missing-BlL2b944.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screen-BldLd_mv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Deterministic filing pass for one screened name. Not an AI call. */
function RowComplete({ row }) {
	const setDeepFunds = useKosh((s) => s.setDeepFunds);
	const snap = useKosh((s) => s.deepFunds[row.symbol]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (!missingScreenFacts(row).length) return null;
	const searched = Boolean(snap?.fund?.provenance?.searched);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: busy,
		className: "mt-1 block text-left text-[11px] font-medium text-chart hover:underline disabled:opacity-50",
		onClick: async (e) => {
			e.preventDefault();
			e.stopPropagation();
			setBusy(true);
			try {
				const part = await apiEnrich([row.symbol]);
				const fund = part.funds?.[row.symbol];
				if (fund) {
					setDeepFunds({ [row.symbol]: {
						fund,
						at: Date.now(),
						sources: part.sources?.[row.symbol] || []
					} });
					const still = fund.provenance?.fields && Object.values(fund.provenance.fields).filter((f) => f.status === "unavailable").length || 0;
					toast.success(still ? "Checked supported sources" : "Fields updated", { description: still ? "Some metrics are still not in the filings we can read. They stay blank — not zero." : "This row now uses the reconciled company record." });
				} else toast.message("No additional filing data", { description: `${row.symbol}: supported sources did not add a number.` });
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Could not complete this row");
			} finally {
				setBusy(false);
			}
		},
		children: busy ? "Checking sources…" : searched ? "Check sources again" : "Complete missing data"
	});
}
var EXTRA_COLS = [
	{
		key: "peg",
		label: "PEG"
	},
	{
		key: "eps",
		label: "EPS"
	},
	{
		key: "book",
		label: "Book"
	},
	{
		key: "interestCover",
		label: "Int. cover"
	},
	{
		key: "cfoPat",
		label: "CFO/PAT"
	},
	{
		key: "pledge",
		label: "Pledge"
	},
	{
		key: "salesCagr3",
		label: "Sales 3Y"
	},
	{
		key: "profitCagr5",
		label: "Profit 5Y"
	},
	{
		key: "fii",
		label: "FII"
	},
	{
		key: "dii",
		label: "DII"
	}
];
function ScreenPage() {
	const q = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const deep = useQuery({
		queryKey: ["screener-deep"],
		queryFn: apiScreenerDeep,
		staleTime: 6e5
	});
	const [id, setId] = (0, import_react.useState)("all");
	const [custom, setCustom] = (0, import_react.useState)(null);
	const [sector, setSector] = (0, import_react.useState)("All");
	const [sort, setSort] = (0, import_react.useState)({
		key: "mcapCr",
		dir: "desc"
	});
	const [qtext, setQtext] = (0, import_react.useState)("");
	const [limit, setLimit] = (0, import_react.useState)(150);
	const [cols, setCols] = (0, import_react.useState)({});
	const saved = useKosh((s) => s.customScreens);
	const saveCustomScreen = useKosh((s) => s.saveCustomScreen);
	const removeCustomScreen = useKosh((s) => s.removeCustomScreen);
	const reads = useKosh((s) => s.skillReads);
	const deepFunds = useKosh((s) => s.deepFunds);
	const rows = (0, import_react.useMemo)(() => {
		const merged = mergeScreenRows(q.data?.rows || [], deep.data?.rows || []);
		if (!Object.keys(deepFunds).length) return merged;
		return merged.map((r) => {
			const fund = deepFunds[r.symbol]?.fund;
			return fund ? fillBlankScreenFund(r, fund) : r;
		});
	}, [
		q.data,
		deep.data,
		deepFunds
	]);
	const sectors = (0, import_react.useMemo)(() => ["All", ...[...new Set(rows.map((r) => r.sector))].sort()], [rows]);
	const needle = qtext.trim().toUpperCase();
	const searched = (0, import_react.useMemo)(() => {
		const base = filterSector(rows, sector);
		if (!needle) return base;
		return base.filter((r) => r.symbol.includes(needle) || r.name.toUpperCase().includes(needle));
	}, [
		rows,
		sector,
		needle
	]);
	const filtered = id === "custom" && custom ? applyFilter(searched, custom) : applyScreen(searched, id === "custom" ? "soundmb" : id);
	const shownAll = sortRows(filtered, sort.key, sort.dir);
	const shown = shownAll.slice(0, limit);
	const preset = id === "custom" ? custom : SCREEN_PRESETS.find((p) => p.id === id);
	const nFull = rows.filter((r) => r.depth === "full").length;
	const nPriced = rows.filter((r) => r.price > 0).length;
	const mbRules = id === "custom" ? null : rulesForScreen(id);
	const mbScored = (0, import_react.useMemo)(() => mbRules ? scoreMultibagger(searched, mbRules) : [], [mbRules, searched]);
	const candidates = (0, import_react.useMemo)(() => mbRules ? candidateMultibagger(searched, mbRules, sort.key) : [], [
		mbRules,
		searched,
		sort.key
	]);
	const nStrict = mbScored.filter((x) => x.kind === "strict").length;
	const nFail = mbScored.filter((x) => x.kind === "fail").length;
	const nUnk = mbScored.filter((x) => x.kind === "unknown").length;
	const gapSyms = shownAll.filter((r) => r.roce == null || r.opm == null).map((r) => r.symbol);
	const gapNow = gapSyms.slice(0, 36);
	const unresolved = shownAll.filter((r) => missingScreenFacts(r).length).length;
	const researchJobs = shownAll.map((r) => ({
		symbol: r.symbol,
		missing: missingScreenFacts(r).slice(0, 4)
	})).filter((j) => j.missing.length).slice(0, 3);
	function head(key, label) {
		const on = sort.key === key;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: "px-3 py-2 font-medium",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: cn("text-[11px] tracking-[0.06em] uppercase", on ? "text-fg" : "text-subtle"),
				onClick: () => setSort((s) => ({
					key,
					dir: s.key === key && s.dir === "desc" ? "asc" : "desc"
				})),
				children: [label, on ? sort.dir === "desc" ? " ↓" : " ↑" : ""]
			})
		}, key);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight",
				children: "Screener"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted",
				children: ["Every NSE equity we can list. Company numbers fill in from the company card, then from filings when you complete a row. A blank cell is missing, not a pass — and never a guess. Complete & verify data reads filings for names on this page that are still missing operating margin or return on capital, then the screen is applied again. It does not invent a number.", shownAll.length ? ` ${shownAll.length} stocks in this screen · ${unresolved} still have unresolved supported fields.` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap items-start gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrichButton, {
					symbols: gapNow,
					queued: Math.max(0, gapSyms.length - gapNow.length)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchMissing, {
					jobs: researchJobs,
					label: unresolved ? `${shownAll.length} stocks returned · ${unresolved} have unresolved supported fields. This pass researches ${researchJobs.length} of them and does not treat the reply as a screen input.` : ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomBuilder, { onBuilt: (f) => {
				setCustom(f);
				setId("custom");
				saveCustomScreen(f);
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-1 self-center text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: "Quality"
					}),
					SCREEN_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setId(p.id);
							if (p.id === "stake") setSort({
								key: "fiiDelta",
								dir: "desc"
							});
							else if (p.id === "vcp") setSort({
								key: "vcpLastPct",
								dir: "asc"
							});
							else if (p.id === "vcpbo") setSort({
								key: "vcpDays",
								dir: "asc"
							});
							else if (p.id === "all") setSort({
								key: "mcapCr",
								dir: "desc"
							});
							setLimit(150);
						},
						className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", id === p.id ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"),
						children: p.label
					}, p.id)),
					saved.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setCustom(s);
							setId("custom");
						},
						className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", id === "custom" && custom?.name === s.name ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"),
						children: s.name
					}, s.name))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-[12px] text-muted",
						children: ["Find", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "h-8 w-40 rounded-sm bg-bg-elevated px-2 text-[13px] text-fg shadow-[var(--shadow-border)] outline-none",
							placeholder: "Name or ticker",
							value: qtext,
							onChange: (e) => {
								setQtext(e.target.value);
								setLimit(150);
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-[12px] text-muted",
						children: ["Sector", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-8 rounded-sm bg-bg-elevated px-2 text-[13px] text-fg shadow-[var(--shadow-border)]",
							value: sector,
							onChange: (e) => setSector(e.target.value),
							children: sectors.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualStrip, { onApply: (f) => {
						setCustom(f);
						setId("custom");
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[12px] text-subtle",
						children: [
							shownAll.length,
							" match · ",
							nPriced,
							" priced · ",
							nFull,
							" with full history of ",
							rows.length,
							" listed",
							preset?.hint ? ` · ${preset.hint}` : ""
						]
					}),
					id === "custom" && custom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[12px] text-muted hover:text-fg",
						onClick: () => {
							removeCustomScreen(custom.name);
							setId("soundmb");
							setCustom(null);
						},
						children: "Remove this screen"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-1 self-center text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: "Columns"
				}), EXTRA_COLS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCols((s) => ({
						...s,
						[c.key]: !s[c.key]
					})),
					className: cn("h-7 rounded-sm px-2 text-[11px] shadow-[var(--shadow-border)]", cols[c.key] ? "bg-surface text-fg" : "text-muted hover:text-fg"),
					children: c.label
				}, c.key))]
			}),
			id === "soundmb" || id === "turnmb" || id === "qgrowth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border-l-[4px] border-l-chart bg-surface p-4 text-[13px] leading-relaxed text-muted shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-fg",
						children: "Strict match first — every check must be present and pass."
					}),
					" A blank field is not a pass. Names with no known fail but missing fields sit under Candidates, labelled “8/9 passed · 1 unavailable”. They are not hidden, and they are not ranked as a match.",
					mbScored.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block font-mono text-[12px] tabular text-subtle",
						children: [
							nStrict,
							" strict · ",
							candidates.length,
							" candidates · ",
							nFail,
							" failed a known check · ",
							nUnk,
							" insufficient"
						]
					}) : null
				]
			}) : null,
			q.isPending && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "Loading listed names… first pass takes a moment."
			}) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-sm text-down",
				children: ["Could not load the screener. ", q.error.message]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "kosh-table w-full text-left text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							head("name", "Name"),
							head("price", "Price"),
							head("changePct", "Today"),
							id === "stake" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								head("fii", "FII"),
								head("fiiDelta", "FII Δ"),
								head("dii", "DII"),
								head("diiDelta", "DII Δ"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
									children: "Quarters"
								}),
								head("ret1y", "1Y")
							] }) : id === "vcp" || id === "vcpbo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								head("vcpN", "Contractions"),
								head("vcpLastPct", "Last %"),
								head("vcpDays", "Days"),
								head("vcpVolX", "Vol ×"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
									children: "Pivot"
								}),
								head("offHigh", "vs 52w high"),
								head("rsi", "RSI 14")
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								head("pe", "P/E"),
								head("pb", "P/B"),
								head("roe", "ROE"),
								head("roce", "ROCE"),
								head("opm", "OPM"),
								head("de", "D/E"),
								head("promoters", "Promoters"),
								head("mcapCr", "Mcap"),
								head("salesYoY", "Sales 1Y"),
								head("profitYoY", "Profit 1Y"),
								head("divYield", "Div yield"),
								EXTRA_COLS.filter((c) => cols[c.key]).map((c) => head(c.key, c.label)),
								head("ret3m", "3M"),
								head("ret1y", "1Y"),
								head("offHigh", "vs 52w high"),
								head("rsi", "RSI 14"),
								head("vol", "Vol vs 20d avg")
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-subtle uppercase",
								children: "Fund · Qual"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((r) => {
							const read = reads[r.symbol];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/s/$symbol",
										params: { symbol: r.symbol },
										className: "hover:text-chart",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium",
											children: r.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-subtle",
											children: [
												r.symbol,
												" · ",
												r.sector,
												r.above200 ? " · >200" : "",
												r.thin ? " · thin print" : "",
												r.gsm ? " · GSM" : "",
												r.depth === "quote" ? " · price only" : r.depth === "name" ? " · no print yet" : "",
												r.passCount != null ? ` · ${matchLabel(r)}` : ""
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowComplete, { row: r })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular",
									children: fmtPx(r.price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2 font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
									children: fmtPct(r.changePct)
								}),
								id === "stake" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stake, {
										n: r.fii,
										prev: r.fiiPrev
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pp, { n: r.fiiDelta }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stake, {
										n: r.dii,
										prev: r.diiPrev
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pp, { n: r.diiDelta }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-[12px] text-muted",
										children: r.shLabel || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.ret1y })
								] }) : id === "vcp" || id === "vcpbo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.vcpN ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.vcpLastPct,
										d: 1,
										suffix: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.vcpDays != null ? r.vcpDays : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.vcpVolX,
										d: 2,
										suffix: "×"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.vcpPivot != null ? fmtPx(r.vcpPivot) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.offHigh }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.rsi != null ? r.rsi.toFixed(0) : "—"
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.pe,
										d: 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.pb,
										d: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.roe,
										d: 1,
										suffix: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.roce,
										d: 1,
										suffix: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.opm,
										d: 1,
										suffix: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.de,
										d: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.promoters,
										d: 1,
										suffix: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.mcapCr != null ? r.mcapCr.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.salesYoY }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.profitYoY }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: r.divYield,
										d: 1,
										suffix: "%"
									}),
									EXTRA_COLS.filter((c) => cols[c.key]).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
										n: typeof r[c.key] === "number" ? r[c.key] : null,
										d: 2
									}, c.key)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.ret3m }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.ret1y }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: r.offHigh }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular",
										children: r.rsi != null ? r.rsi.toFixed(0) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 font-mono text-muted tabular",
										children: [fmtVol(r.vol), r.volRatio ? ` · ${r.volRatio.toFixed(1)}× 20d avg` : ""]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-[12px] text-muted",
									children: read ? `${read.fundTag || "—"} · ${read.qualTag || "—"}` : "—"
								})
							] }, r.symbol);
						}) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2 md:hidden",
					children: shown.map((r) => {
						const read = reads[r.symbol];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/s/$symbol",
									params: { symbol: r.symbol },
									className: "hover:text-chart",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-subtle",
										children: [
											r.symbol,
											" · ",
											r.sector,
											r.thin ? " · thin print" : "",
											r.gsm ? " · GSM" : "",
											r.depth === "quote" ? " · price only" : r.depth === "name" ? " · no print yet" : "",
											r.passCount != null ? ` · ${matchLabel(r)}` : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 grid grid-cols-3 gap-2 text-[12px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-subtle",
											children: "Price"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono tabular",
											children: fmtPx(r.price)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-subtle",
											children: "Today"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("font-mono tabular", r.changePct >= 0 ? "text-up" : "text-down"),
											children: fmtPct(r.changePct)
										})] }),
										id === "stake" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "FII Δ"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: cn("font-mono tabular", (r.fiiDelta ?? 0) >= 0 ? "text-up" : "text-down"),
												children: r.fiiDelta == null ? "—" : `${r.fiiDelta >= 0 ? "+" : ""}${r.fiiDelta.toFixed(2)} pp`
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "DII Δ"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: cn("font-mono tabular", (r.diiDelta ?? 0) >= 0 ? "text-up" : "text-down"),
												children: r.diiDelta == null ? "—" : `${r.diiDelta >= 0 ? "+" : ""}${r.diiDelta.toFixed(2)} pp`
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "Quarters"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate text-[11px] text-muted",
												children: r.shLabel || "—"
											})] })
										] }) : id === "vcp" || id === "vcpbo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "Last %"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.vcpLastPct != null ? `${r.vcpLastPct.toFixed(1)}%` : "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "Days"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.vcpDays ?? "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "Pivot"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.vcpPivot != null ? fmtPx(r.vcpPivot) : "—"
											})] })
										] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "1Y"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: cn("font-mono tabular", (r.ret1y ?? 0) >= 0 ? "text-up" : "text-down"),
												children: r.ret1y != null ? fmtPct(r.ret1y) : "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "P/E"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.pe != null ? r.pe.toFixed(1) : "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "ROCE"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.roce != null ? `${r.roce.toFixed(1)}%` : "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-subtle",
												children: "OPM"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono tabular",
												children: r.opm != null ? `${r.opm.toFixed(1)}%` : "—"
											})] })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-subtle",
											children: "Fund · Qual"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-[11px] text-muted",
											children: read ? `${read.fundTag || "—"} · ${read.qualTag || "—"}` : "—"
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowComplete, { row: r })
							]
						}, r.symbol);
					})
				}),
				shownAll.length > shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-4 h-10 w-full rounded-sm bg-surface text-[13px] font-medium shadow-[var(--shadow-border)] hover:text-fg",
					onClick: () => setLimit((n) => n + 150),
					children: [
						"Show more · ",
						shown.length,
						" of ",
						shownAll.length
					]
				}) : null,
				candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Candidates · needs verification"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-[13px] text-muted",
							children: "Enough checks are on file and none of those fail. One or more required fields are still blank — so these are not a strict match. Missing data is never a pass."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 grid gap-2",
							children: candidates.slice(0, 40).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/s/$symbol",
									params: { symbol: r.symbol },
									className: "hover:text-chart",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 text-[12px] text-muted",
										children: [
											r.symbol,
											" · ",
											matchLabel(r),
											r.unchecked?.length ? ` · missing ${r.unchecked.join(", ")}` : ""
										]
									})]
								})
							}, r.symbol))
						}),
						candidates.length > 40 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[12px] text-muted",
							children: [candidates.length - 40, " more candidates not shown."]
						}) : null
					]
				}) : null
			] })
		]
	}) });
}
function CustomBuilder({ onBuilt }) {
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [image, setImage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	const [closest, setClosest] = (0, import_react.useState)("");
	async function fileToData(file) {
		if (file.size > 9e5) throw new Error("Crop the screenshot — keep it under about 0.7 MB.");
		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result || ""));
			reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file."));
			reader.readAsDataURL(file);
		});
	}
	async function build(text = prompt) {
		setBusy(true);
		setErr("");
		setClosest("");
		try {
			const r = await apiScreenBuild({
				prompt: text,
				image: image || void 0
			});
			if (!r.ok) {
				setErr(r.error);
				if (r.unsupported?.closest) setClosest(r.unsupported.closest);
			} else onBuilt(r.filter);
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Could not build that screen.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Build your own"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-[13px] leading-relaxed text-muted",
				children: "Type it in plain words — “ROE above 15, debt under 1, RSI under 40” — or attach a screenshot of the criteria. Unsupported metrics are named. They are not swapped for a nearby field unless you accept that field."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "mt-3 min-h-20 w-full rounded-sm bg-bg-elevated px-3 py-2 text-sm shadow-[var(--shadow-border)] outline-none",
				placeholder: "e.g. PE under 20, ROE above 15, volume at least 1.5× average",
				value: prompt,
				onChange: (e) => setPrompt(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-8 cursor-pointer items-center rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
						children: ["Attach screenshot", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							className: "hidden",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (!f) return;
								fileToData(f).then(setImage).catch((err) => setErr(err instanceof Error ? err.message : "Could not read image"));
							}
						})]
					}),
					image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[12px] text-muted",
						children: ["Screenshot attached", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ml-2 hover:text-fg",
							onClick: () => setImage(""),
							children: "Remove"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIButton, {
						busy,
						disabled: !prompt.trim() && !image,
						onClick: () => void build(),
						children: "Build screen"
					})
				]
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-down",
				children: err
			}) : null,
			closest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mt-2 text-[13px] font-medium text-chart hover:underline",
				onClick: () => {
					const next = `${prompt} — use ${closest} instead`;
					setPrompt(next);
					build(next);
				},
				children: [
					"Use ",
					closest,
					" instead"
				]
			}) : null
		]
	});
}
function Pp({ n }) {
	if (n == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: "px-3 py-2 font-mono text-subtle tabular",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
		className: cn("px-3 py-2 font-mono tabular", n >= 0 ? "text-up" : "text-down"),
		children: [
			n >= 0 ? "+" : "",
			n.toFixed(2),
			" pp"
		]
	});
}
function Stake({ n, prev }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
		className: "px-3 py-2 font-mono tabular",
		children: [n == null ? "—" : `${n.toFixed(1)}%`, prev != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[11px] text-subtle",
			children: [
				"was ",
				prev.toFixed(1),
				"%"
			]
		}) : null]
	});
}
function Cell({ n }) {
	if (n == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: "px-3 py-2 font-mono text-subtle tabular",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("px-3 py-2 font-mono tabular", n >= 0 ? "text-up" : "text-down"),
		children: fmtPct(n)
	});
}
function Num({ n, d = 1, suffix = "" }) {
	if (n == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: "px-3 py-2 font-mono text-subtle tabular",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
		className: "px-3 py-2 font-mono tabular",
		children: [n.toFixed(d), suffix]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center gap-1 text-[11px] text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "h-7 w-16 rounded-sm bg-bg-elevated px-1.5 font-mono text-[12px] text-fg shadow-[var(--shadow-border)] outline-none",
			inputMode: "decimal",
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function ManualStrip({ onApply }) {
	const [peMax, setPeMax] = (0, import_react.useState)("");
	const [roeMin, setRoeMin] = (0, import_react.useState)("");
	const [deMax, setDeMax] = (0, import_react.useState)("");
	const [rsiMax, setRsiMax] = (0, import_react.useState)("");
	const [mcapMin, setMcapMin] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-wrap items-center gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			const num = (s) => {
				const v = Number(s);
				return s.trim() && Number.isFinite(v) ? v : null;
			};
			onApply({
				name: "Manual",
				hint: "Typed min / max on PE, ROE, debt, RSI, market cap",
				peMax: num(peMax),
				roeMin: num(roeMin),
				deMax: num(deMax),
				rsiMax: num(rsiMax),
				mcapMin: num(mcapMin),
				sort: "changePct",
				sortDir: "desc"
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "PE ≤",
				value: peMax,
				onChange: setPeMax
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "ROE ≥",
				value: roeMin,
				onChange: setRoeMin
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "D/E ≤",
				value: deMax,
				onChange: setDeMax
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "RSI ≤",
				value: rsiMax,
				onChange: setRsiMax
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Mcap ≥",
				value: mcapMin,
				onChange: setMcapMin
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "sm",
				variant: "secondary",
				children: "Apply"
			})
		]
	});
}
//#endregion
export { ScreenPage as component };
