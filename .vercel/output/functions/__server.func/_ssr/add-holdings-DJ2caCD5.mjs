import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as apiSearch, f as apiQuotes, t as apiCloseOn } from "./api-BTUsg1u1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as formatGrams, _ as deriveMetal, a as Label, bn as isIsin, cn as parseHoldingsFiles, d as METALS, en as useKosh, ln as parseVoice, mt as Button, o as Input, on as classifyIncoming, vn as cn, yn as displayName } from "./router-D75dEx_h2.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./dialog-B66N--Ky.mjs";
import { t as enrichHoldings } from "./enrich-D_sHlZWr.mjs";
import { n as writeFileSync, t as utils } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-holdings-DJ2caCD5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function stamp() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function slug(name) {
	return name.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "portfolio";
}
function sheet(wb, name, rows) {
	const ws = utils.json_to_sheet(rows.length ? rows : [{ Note: "No rows" }]);
	utils.book_append_sheet(wb, ws, name.slice(0, 31));
}
function downloadHoldingsExcel(name, holdings) {
	const wb = utils.book_new();
	sheet(wb, "Holdings", holdings.map((h) => ({
		Ticker: h.symbol,
		Name: h.name,
		ISIN: h.isin || "",
		Qty: h.qty,
		"Avg cost": h.avg ?? "",
		Invested: h.avg ? +(h.qty * h.avg).toFixed(2) : "",
		Sector: h.sector || ""
	})));
	writeFileSync(wb, `kosh-${slug(name)}-holdings-${stamp()}.xlsx`);
}
function downloadBookExcel(name, book, portfolio) {
	const wb = utils.book_new();
	sheet(wb, "Summary", [{
		Portfolio: name,
		Benchmark: book.benchName,
		"Current value": book.value,
		Invested: book.invested,
		Unrealised: book.unreal,
		"Day P&L": book.dayAbs,
		"Day %": book.dayPct,
		CAGR: book.cagr,
		Coverage: book.coverage,
		From: book.firstDay || "",
		To: book.lastDay || "",
		"Price history": book.hxRange,
		AsOf: book.asOf || ""
	}]);
	sheet(wb, "Holdings", book.rows.map((r) => ({
		Ticker: r.symbol,
		Name: r.name,
		ISIN: r.isin || "",
		Qty: r.qty,
		"Avg cost": r.avg ?? "",
		Price: r.px,
		Value: r.value,
		Invested: r.invested,
		Unrealised: r.unreal,
		"Unreal %": r.unrealPct,
		"Weight %": +(r.weight * 100).toFixed(2),
		Sector: r.sector,
		Cap: r.cap,
		"1D %": r.changePct,
		"1M %": r.periods.m1,
		"1Y %": r.periods.y1,
		CAGR: r.periods.cagr
	})));
	sheet(wb, "Windows", [
		{
			Window: "1W",
			"Portfolio %": book.windows.w1.port,
			"Index %": book.windows.w1.bench
		},
		{
			Window: "1M",
			"Portfolio %": book.windows.m1.port,
			"Index %": book.windows.m1.bench
		},
		{
			Window: "3M",
			"Portfolio %": book.windows.m3.port,
			"Index %": book.windows.m3.bench
		},
		{
			Window: "6M",
			"Portfolio %": book.windows.m6.port,
			"Index %": book.windows.m6.bench
		},
		{
			Window: "1Y",
			"Portfolio %": book.windows.y1.port,
			"Index %": book.windows.y1.bench
		},
		{
			Window: "YTD",
			"Portfolio %": book.windows.ytd.port,
			"Index %": book.windows.ytd.bench
		}
	]);
	sheet(wb, "Risk", [
		{
			Metric: "CAGR %",
			Value: book.cagr
		},
		{
			Metric: "Sharpe",
			Value: book.risk.sharpe
		},
		{
			Metric: "Sortino",
			Value: book.risk.sortino
		},
		{
			Metric: "Alpha %",
			Value: book.risk.alpha
		},
		{
			Metric: "Beta",
			Value: book.risk.beta
		},
		{
			Metric: "Correlation",
			Value: book.risk.corr
		},
		{
			Metric: "Ann. vol %",
			Value: book.risk.vol
		},
		{
			Metric: "Max drawdown %",
			Value: book.risk.maxDd
		},
		{
			Metric: "Up capture",
			Value: book.risk.upCap
		},
		{
			Metric: "Down capture",
			Value: book.risk.downCap
		},
		{
			Metric: "Info ratio",
			Value: book.risk.info
		},
		{
			Metric: "Calmar",
			Value: book.risk.calmar
		}
	]);
	sheet(wb, "Sectors", book.sleeves.map((s) => ({
		Sector: s.sector,
		Names: s.names,
		Value: s.value,
		"Weight %": book.value ? +(s.value / book.value * 100).toFixed(2) : "",
		"1M sleeve %": s.windows.m1,
		"1M index %": s.index.m1,
		"1Y sleeve %": s.windows.y1,
		"1Y index %": s.index.y1,
		Index: s.indexName,
		Stocks: s.symbols.join(", ")
	})));
	sheet(wb, "Monthly", book.months.map((m) => ({
		Month: m.key,
		"Portfolio %": m.port,
		"Index %": m.bench
	})));
	sheet(wb, "This mix", book.mix.nav.map((p) => ({
		Day: p.day,
		Mix: p.port,
		Benchmark: p.bench,
		Coverage: p.wAvail,
		"Your path": p.path ?? "",
		"Same money in index": p.sameCash ?? ""
	})));
	if (book.path?.nav?.length) {
		sheet(wb, "Your path", book.path.nav.map((p) => ({
			Day: p.day,
			Wealth: p.wealth,
			"Same money in index": p.sameCash ?? "",
			Names: p.names
		})));
		sheet(wb, "Closed trades", book.path.closed.map((c) => ({
			Ticker: c.symbol,
			Name: c.name,
			Qty: c.qty,
			Bought: c.buyDate,
			"Buy price": c.buyPx,
			Sold: c.sellDate,
			"Sell price": c.sellPx,
			PnL: c.pnl,
			"PnL %": c.pnlPct,
			Days: c.days
		})));
	}
	if (portfolio) {
		sheet(wb, "Raw lots", portfolio.holdings.map((h) => ({
			Ticker: h.symbol,
			Name: h.name,
			ISIN: h.isin || "",
			Qty: h.qty,
			"Avg cost": h.avg ?? "",
			Sector: h.sector || "",
			"Buy date": h.date || ""
		})));
		if (portfolio.trades?.length) sheet(wb, "Trades", portfolio.trades.map((t) => ({
			Ticker: t.symbol,
			Name: t.name,
			Side: t.side > 0 ? "BUY" : "SELL",
			Qty: t.qty,
			Price: t.price,
			Date: t.date || ""
		})));
	}
	writeFileSync(wb, `kosh-${slug(name)}-${stamp()}.xlsx`);
}
var NONE = [];
function AddHoldings({ portfolioId, trigger }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: trigger
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: portfolioId ? "Add holdings" : "New portfolio",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddForm, {
				portfolioId,
				onDone: () => setOpen(false)
			})
		})]
	});
}
function AddForm({ portfolioId, onDone }) {
	const [tab, setTab] = (0, import_react.useState)("file");
	const [name, setName] = (0, import_react.useState)("Main");
	const addPortfolio = useKosh((s) => s.addPortfolio);
	const addHoldings = useKosh((s) => s.addHoldings);
	const fillHoldingsStore = useKosh((s) => s.fillHoldings);
	const upsertHoldingsStore = useKosh((s) => s.upsertHoldings);
	const mergeTradesStore = useKosh((s) => s.mergeTrades);
	const existing = useKosh((s) => portfolioId ? s.portfolios.find((p) => p.id === portfolioId)?.holdings : void 0) ?? NONE;
	const navigate = useNavigate();
	function commit(incoming, pname, mode = "add", opts, trades) {
		if (!incoming.length) {
			toast.error("No holdings found");
			return;
		}
		if (portfolioId) {
			if (mode === "fill") {
				const { matched, fresh } = classifyIncoming(existing, incoming);
				fillHoldingsStore(portfolioId, incoming, opts || {
					dates: true,
					prices: true,
					addNew: false
				});
				const bits = [];
				if (opts?.dates !== false) bits.push("dates");
				if (opts?.prices !== false) bits.push("prices");
				toast.success(opts?.addNew ? `Added ${fresh.length} new name${fresh.length === 1 ? "" : "s"}` : `Filled ${bits.join(" & ") || "data"} on ${matched.length} matching name${matched.length === 1 ? "" : "s"} — nothing new added`);
			} else if (mode === "upsert") {
				upsertHoldingsStore(portfolioId, incoming);
				toast.success(`Updated ${incoming.length} line${incoming.length === 1 ? "" : "s"} from the file`);
			} else {
				addHoldings(portfolioId, incoming);
				toast.success(`Added ${incoming.length} line${incoming.length === 1 ? "" : "s"}`);
			}
			if (trades?.length) {
				mergeTradesStore(portfolioId, trades);
				toast.message(`Kept ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path`);
			}
		} else {
			const id = addPortfolio(pname || name || "Main", incoming, "nifty", trades);
			toast.success("Portfolio created");
			navigate({
				to: "/p/$id",
				params: { id }
			});
		}
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		!portfolioId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
			className: "mb-3",
			children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: name,
				onChange: (e) => setName(e.target.value)
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex flex-wrap rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
			children: [
				"file",
				"manual",
				"metals",
				"voice"
			].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(t),
				className: cn("inline-flex h-8 items-center justify-center rounded-[6px] px-3 text-[12px] font-medium capitalize leading-none", tab === t ? "bg-surface text-fg" : "text-muted"),
				children: t === "file" ? "Files" : t === "manual" ? "Stocks" : t === "metals" ? "Gold & silver" : "Voice"
			}, t))
		}),
		tab === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePane, {
			existing: portfolioId ? existing : void 0,
			onCommit: (h, trades) => commit(h, "Imported", "add", void 0, trades),
			onFill: portfolioId ? (h, opts, trades) => commit(h, void 0, "fill", opts, trades) : void 0,
			onUpsert: portfolioId ? (h, trades) => commit(h, void 0, "upsert", void 0, trades) : void 0
		}) : null,
		tab === "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualPane, { onCommit: (h) => commit(h) }) : null,
		tab === "metals" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetalsPane, { onCommit: (h) => commit(h) }) : null,
		tab === "voice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoicePane, { onCommit: (h) => commit(h, "Voice") }) : null
	] });
}
function FilePane({ onCommit, onFill, onUpsert, existing }) {
	const [msg, setMsg] = (0, import_react.useState)("CSV or Excel from your broker. Broker files can contain sensitive identifiers. The raw file stays in the browser and is not sent to AI.");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [previewTrades, setPreviewTrades] = (0, import_react.useState)([]);
	const [errors, setErrors] = (0, import_react.useState)([]);
	async function ingest(files) {
		const list = [...files];
		if (!list.length) return;
		setBusy(true);
		setMsg("Reading " + list.length + " file(s)…");
		setErrors([]);
		try {
			const { holdings: all, trades, errors: fails } = await parseHoldingsFiles(list);
			setErrors(fails);
			if (!all.length) {
				setPreview(null);
				setPreviewTrades([]);
				setMsg("No holdings found. Need a ticker (or company name) and a quantity column. Title rows are fine.");
				return;
			}
			setMsg("Matching stock names…");
			let resolved = all;
			try {
				resolved = await enrichHoldings(all);
			} catch {
				resolved = all.map((h) => ({
					...h,
					name: displayName(h)
				}));
			}
			setPreview(resolved);
			setPreviewTrades(trades || []);
			const isins = resolved.filter((h) => isIsin(h.symbol)).length;
			setMsg(`Ready · ${resolved.length} stock${resolved.length === 1 ? "" : "s"}` + (trades?.length ? ` · ${trades.length} buy/sell line${trades.length === 1 ? "" : "s"} for your path` : "") + (isins ? ` · ${isins} still need a name match` : ""));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				e.preventDefault();
				ingest(e.dataTransfer.files);
			},
			className: "block cursor-pointer rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					multiple: true,
					accept: ".csv,.xlsx,.xls,.xlsm,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv",
					className: "sr-only",
					onPointerDown: (e) => e.stopPropagation(),
					onClick: (e) => e.stopPropagation(),
					onChange: (e) => {
						if (e.target.files) ingest(e.target.files);
						e.target.value = "";
					}
				}),
				"Drop a holdings export or a buy/sell trade book",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-[12px] text-subtle",
					children: "Click to pick · CSV or Excel. Read on this device — your original broker file is not uploaded to Kosh. Trade books are netted (partial exits kept, sold names dropped). Dated buy/sell lines stay on Path only. This overview chart is the current mix and does not draw that path. Fill never adds extras. Update from file sets quantity on matches without doubling."
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
		preview?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[40dvh] overflow-y-auto rounded-sm bg-bg px-3 py-2 text-[12px] shadow-[var(--shadow-border)] sm:max-h-56",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_56px_72px] gap-2 pb-1.5 font-medium tracking-[0.06em] text-subtle uppercase sm:grid-cols-[1fr_72px_88px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stock" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right",
								children: "Avg cost"
							})
						]
					}), preview.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_56px_72px] gap-2 border-t border-border/60 py-1.5 sm:grid-cols-[1fr_72px_88px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-fg",
									children: h.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[11px] text-subtle tabular",
									children: [h.symbol, h.sector ? ` · ${h.sector}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right font-mono text-muted tabular",
								children: h.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-right font-mono tabular", h.avg ? "text-fg" : "text-warn"),
								children: h.avg ? `₹${h.avg.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "missing"
							})
						]
					}, h.symbol + h.name))]
				}),
				preview.some((h) => !h.avg) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[12px] text-warn",
					children: "Some rows have no buy price — unrealised P&L for those will stay blank until you edit them."
				}) : null,
				previewTrades.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[12px] text-muted",
					children: [
						previewTrades.length,
						" buy/sell line",
						previewTrades.length === 1 ? "" : "s",
						" in this file — kept for Path only. This mix is unchanged."
					]
				}) : null,
				existing?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[12px] text-muted",
					children: [
						classifyIncoming(existing, preview).matched.length,
						" match this portfolio",
						classifyIncoming(existing, preview).fresh.length ? ` · ${classifyIncoming(existing, preview).fresh.length} not in this portfolio (sold or new)` : "",
						". Fill never adds those extras."
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky bottom-0 mt-3 flex flex-wrap gap-2 bg-bg-elevated pt-2",
					children: [
						onFill && existing?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1 min-w-[9rem]",
								variant: "secondary",
								onClick: () => onFill(preview, {
									dates: true,
									prices: false,
									addNew: false
								}, previewTrades),
								children: "Fill dates"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1 min-w-[9rem]",
								variant: "secondary",
								onClick: () => onFill(preview, {
									dates: false,
									prices: true,
									addNew: false
								}, previewTrades),
								children: "Fill prices"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1 min-w-[9rem]",
								onClick: () => onFill(preview, {
									dates: true,
									prices: true,
									addNew: false
								}, previewTrades),
								children: "Fill dates & prices"
							}),
							classifyIncoming(existing, preview).fresh.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								className: "flex-1 min-w-[9rem]",
								onClick: () => onFill(preview, {
									dates: false,
									prices: false,
									addNew: true
								}, previewTrades),
								children: [
									"Add ",
									classifyIncoming(existing, preview).fresh.length,
									" new"
								]
							}) : null
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: () => onCommit(preview, previewTrades),
							children: [
								"Add ",
								preview.length,
								" stock",
								preview.length === 1 ? "" : "s"
							]
						}),
						!onFill ? null : existing?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "flex-1 min-w-[9rem]",
							onClick: () => onUpsert ? onUpsert(preview, previewTrades) : onCommit(preview, previewTrades),
							children: "Update from file"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								try {
									downloadHoldingsExcel("preview", preview);
								} catch {}
							},
							children: "Excel"
						})
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-3 text-[12px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/sample-holdings.csv",
					download: true,
					className: "text-muted underline-offset-2 hover:text-fg hover:underline",
					children: "Sample CSV"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/sample-holdings.xlsx",
					download: true,
					className: "text-muted underline-offset-2 hover:text-fg hover:underline",
					children: "Sample Excel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/sample-trades.csv",
					download: true,
					className: "text-muted underline-offset-2 hover:text-fg hover:underline",
					children: "Sample buy/sell file"
				})
			]
		})
	] });
}
function ManualPane({ onCommit }) {
	const [symbol, setSymbol] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("");
	const [avg, setAvg] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [pending, setPending] = (0, import_react.useState)([]);
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
	function pushCurrent() {
		const q = Number(qty);
		if (!symbol.trim() || !(q > 0)) {
			toast.error("Ticker and qty required");
			return false;
		}
		setPending((cur) => [...cur, {
			symbol: symbol.trim().toUpperCase(),
			name: symbol.trim().toUpperCase(),
			qty: q,
			avg: Number(avg) || null,
			date: date || null
		}]);
		setSymbol("");
		setQty("");
		setAvg("");
		setDate("");
		setHits([]);
		return true;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
				"Ticker",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: symbol,
					onChange: (e) => void onSym(e.target.value),
					placeholder: "RELIANCE",
					autoComplete: "off"
				}),
				hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 max-h-40 overflow-y-auto rounded-sm bg-surface shadow-[var(--shadow-border)]",
					children: hits.slice(0, 6).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-surface-2",
						onClick: () => {
							setSymbol(h.symbol.replace(/\.(NS|BO)$/i, ""));
							setHits([]);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: h.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: h.name
						})]
					}) }, h.symbol))
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Qty", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: qty,
					onChange: (e) => setQty(e.target.value),
					type: "number"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Avg price", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: avg,
					onChange: (e) => setAvg(e.target.value),
					type: "number",
					placeholder: "optional"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Buy date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: date,
				onChange: (e) => setDate(e.target.value),
				type: "date"
			})] }),
			pending.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-1 text-[13px] text-muted",
				children: pending.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						h.symbol,
						" × ",
						h.qty
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-subtle hover:text-fg",
						onClick: () => setPending((p) => p.filter((_, j) => j !== i)),
						children: "Remove"
					})]
				}, h.symbol + i))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => pushCurrent(),
					children: "Add to list"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						const extra = [];
						if (symbol.trim() && Number(qty) > 0) extra.push({
							symbol: symbol.trim().toUpperCase(),
							name: symbol.trim().toUpperCase(),
							qty: Number(qty),
							avg: Number(avg) || null,
							date: date || null
						});
						const all = [...pending, ...extra];
						if (!all.length) {
							toast.error("Add at least one stock");
							return;
						}
						onCommit(all);
					},
					children: "Save stocks"
				})]
			})
		]
	});
}
function MetalsPane({ onCommit }) {
	const [metal, setMetal] = (0, import_react.useState)("GOLD");
	const [qty, setQty] = (0, import_react.useState)("");
	const [avg, setAvg] = (0, import_react.useState)("");
	const [invested, setInvested] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [live, setLive] = (0, import_react.useState)(null);
	const [close, setClose] = (0, import_react.useState)(null);
	const [closeDay, setCloseDay] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("Fill grams, a buy date, ₹/g, or total rupees — we fill the rest.");
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			try {
				const px = (await apiQuotes([metal]))[0]?.price || 0;
				if (alive) setLive(px > 0 ? px : null);
			} catch {
				if (alive) setLive(null);
			}
		})();
		return () => {
			alive = false;
		};
	}, [metal]);
	function onPick(id) {
		setMetal(id);
		setClose(null);
		setCloseDay(null);
		setLive(null);
		if (date) (async () => {
			try {
				const hit = await apiCloseOn(id, date);
				if (hit?.price > 0) {
					setClose(hit.price);
					setCloseDay(hit.day);
				}
			} catch {}
		})();
	}
	async function onDate(v) {
		setDate(v);
		if (!v) {
			setClose(null);
			setCloseDay(null);
			return;
		}
		setBusy(true);
		try {
			const hit = await apiCloseOn(metal, v);
			if (hit?.price > 0) {
				setClose(hit.price);
				setCloseDay(hit.day);
				if (!avg) setAvg(String(Math.round(hit.price * 100) / 100));
				setHint(`Close on ${hit.day}: ₹${hit.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })} / g`);
			} else setHint("No close for that date — live spot will be used.");
		} catch {
			setHint("Could not fetch that day’s close — live spot will be used.");
		} finally {
			setBusy(false);
		}
	}
	const draft = deriveMetal({
		qty: Number(qty) || null,
		avg: Number(avg) || null,
		invested: Number(invested) || null,
		close,
		live
	});
	function save() {
		const got = deriveMetal({
			qty: Number(qty) || null,
			avg: Number(avg) || null,
			invested: Number(invested) || null,
			close,
			live
		});
		if (!got.ok) {
			toast.error(got.error);
			return;
		}
		onCommit([{
			symbol: metal,
			name: METALS[metal].name,
			qty: got.qty,
			avg: got.avg,
			date: date || closeDay || null,
			kind: "commodity",
			unit: "g",
			sector: "Commodities"
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-muted",
				children: "Spot from MCX — gold as ₹/10g, silver as ₹/kg. Holdings stay in grams; value is MCX. Fill any of grams, date, ₹/g or total rupees."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "inline-flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
				children: ["GOLD", "SILVER"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onPick(id),
					className: cn("h-8 rounded-[6px] px-3 text-[12px] font-medium", metal === id ? "bg-surface text-fg" : "text-muted"),
					children: METALS[id].name
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[12px] text-subtle tabular",
				children: busy ? "Fetching close…" : live ? `Live ${METALS[metal].name} · ${live.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ₹/g (MCX)` : "Fetching live MCX…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Grams", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: qty,
					onChange: (e) => setQty(e.target.value),
					type: "number",
					step: "any",
					placeholder: "10",
					"data-testid": "metal-qty"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["₹ / g", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: avg,
					onChange: (e) => setAvg(e.target.value),
					type: "number",
					step: "any",
					placeholder: "optional"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Buy date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: date,
					onChange: (e) => void onDate(e.target.value),
					type: "date"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Total rupees", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: invested,
					onChange: (e) => setInvested(e.target.value),
					type: "number",
					step: "any",
					placeholder: "optional"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] text-subtle",
				children: hint
			}),
			draft.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-sm bg-bg px-3 py-2 text-[13px] shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-medium",
					children: [
						formatGrams(draft.qty),
						" ",
						METALS[metal].name
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-0.5 font-mono text-[12px] text-muted tabular",
					children: [
						"₹",
						draft.avg.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
						" / g · invested ₹",
						draft.invested.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
						" · ",
						draft.filledFrom
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] text-muted",
				children: draft.error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: save,
				disabled: !draft.ok,
				children: ["Add ", METALS[metal].name]
			})
		]
	});
}
function VoicePane({ onCommit }) {
	const [txt, setTxt] = (0, import_react.useState)("Say tickers and quantities. Example: Reliance 20, TCS 8.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-3 text-sm text-muted",
		children: txt
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		onClick: () => {
			const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
			if (!SR) {
				setTxt("Voice not supported here. Use manual add.");
				return;
			}
			const rec = new SR();
			rec.lang = "en-IN";
			rec.onresult = (ev) => {
				const text = ev.results[0][0].transcript;
				setTxt(text);
				const parsed = parseVoice(text);
				if (parsed.length) onCommit(parsed);
			};
			rec.start();
		},
		children: "Start listening"
	})] });
}
//#endregion
export { downloadBookExcel as n, downloadHoldingsExcel as r, AddHoldings as t };
