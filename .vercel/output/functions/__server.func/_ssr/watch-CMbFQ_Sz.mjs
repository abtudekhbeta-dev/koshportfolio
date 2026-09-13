import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as fmtPct, Gt as Button, O as fmtPx, on as cn, rt as universeName, tn as useKosh } from "./router-oJX0L9_1.mjs";
import { d as apiScreener } from "./api-Dymx0Kns.mjs";
import { t as AppShell } from "./app-shell-DSj9C3kP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-CMbFQ_Sz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function flag(r) {
	const bits = [];
	if (r.nr7) bits.push("NR7");
	if ((r.gapPct ?? 0) >= 1.5) bits.push("Gap");
	if (r.offHigh != null && r.offHigh >= -2) bits.push("High");
	if (r.rsi != null && r.rsi < 40) bits.push("Oversold");
	if (r.rsi != null && r.rsi > 70) bits.push("Stretched");
	if ((r.volRatio ?? 0) >= 1.5) bits.push("Volume");
	return bits.slice(0, 3);
}
function WatchBoard({ symbols, rows, loading }) {
	const map = new Map(rows.map((r) => [r.symbol.toUpperCase(), r]));
	const list = symbols.map((s) => {
		const k = s.toUpperCase().replace(/\.(NS|BO)$/i, "");
		return {
			symbol: k,
			row: map.get(k)
		};
	});
	if (!symbols.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg bg-surface px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]",
		children: "Pin names from a stock page. Morning board shows last, day, RSI, volume and 52-week."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)] md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border",
					children: [
						"Name",
						"Last",
						"Day",
						"RSI 14",
						"Vol vs 20d avg",
						"vs 52w high",
						"Flags"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2 font-medium",
						children: h
					}, h))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: list.map(({ symbol, row }) => {
				const flags = row ? flag(row) : [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/s/$symbol",
								params: { symbol },
								className: "hover:text-chart",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: row?.name || universeName(symbol)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-subtle",
									children: symbol
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono tabular",
							children: row ? fmtPx(row.price) : loading ? "…" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-2 font-mono tabular", (row?.changePct ?? 0) >= 0 ? "text-up" : "text-down"),
							children: row ? fmtPct(row.changePct) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono tabular",
							children: row?.rsi != null ? row.rsi.toFixed(0) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono tabular",
							children: row?.volRatio != null ? row.volRatio.toFixed(1) + "× 20d avg" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-3 py-2 font-mono tabular", (row?.offHigh ?? 0) >= -5 ? "text-up" : "text-muted"),
							children: row?.offHigh != null ? fmtPct(row.offHigh) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: flags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex flex-wrap gap-1",
								children: flags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] tracking-[0.04em] text-muted uppercase",
									children: f
								}, f))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "—"
							})
						})
					]
				}, symbol);
			}) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2 md:hidden",
		children: list.map(({ symbol, row }) => {
			const flags = row ? flag(row) : [];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/s/$symbol",
					params: { symbol },
					className: "hover:text-chart",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: row?.name || universeName(symbol)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-subtle",
						children: symbol
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-3 gap-2 text-[12px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Last"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: row ? fmtPx(row.price) : loading ? "…" : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono tabular", (row?.changePct ?? 0) >= 0 ? "text-up" : "text-down"),
							children: row ? fmtPct(row.changePct) : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "RSI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: row?.rsi != null ? row.rsi.toFixed(0) : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Vol"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: row?.volRatio != null ? row.volRatio.toFixed(1) + "×" : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "vs 52w"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular",
							children: row?.offHigh != null ? fmtPct(row.offHigh) : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-subtle",
							children: "Flags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-[11px] text-muted",
							children: flags.length ? flags.join(" · ") : "—"
						})] })
					]
				})]
			}, symbol);
		})
	})] });
}
function WatchPage() {
	const watchlists = useKosh((s) => s.watchlists);
	const activeWatchId = useKosh((s) => s.activeWatchId);
	const toggle = useKosh((s) => s.toggleWatch);
	const addWatchList = useKosh((s) => s.addWatchList);
	const renameWatchList = useKosh((s) => s.renameWatchList);
	const deleteWatchList = useKosh((s) => s.deleteWatchList);
	const setActiveWatchId = useKosh((s) => s.setActiveWatchId);
	const recents = useKosh((s) => s.recents);
	const alerts = useKosh((s) => s.alerts);
	const removeAlert = useKosh((s) => s.removeAlert);
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const [newName, setNewName] = (0, import_react.useState)("");
	const active = watchlists.find((l) => l.id === activeWatchId) || watchlists[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[28px] font-semibold tracking-tight",
				children: "Watch"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted",
				children: "Several lists — Main, Trade, Long-term, or ones you add. Star a name on a stock page to pin it to the list that is open. Guest lists stay in this browser."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [watchlists.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActiveWatchId(l.id),
					className: cn("inline-flex h-10 items-center justify-center rounded-sm px-3.5 text-[13px] font-medium leading-none shadow-[var(--shadow-border)]", l.id === activeWatchId ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"),
					children: [l.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-mono text-[11px] text-subtle",
						children: l.symbols.length
					})]
				}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex items-center gap-1",
					onSubmit: (e) => {
						e.preventDefault();
						const n = newName.trim();
						if (!n) return;
						addWatchList(n);
						setNewName("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: newName,
						onChange: (e) => setNewName(e.target.value),
						placeholder: "New list",
						className: "h-10 w-32 rounded-sm bg-bg-elevated px-2.5 text-[13px] shadow-[var(--shadow-border)] outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						variant: "secondary",
						children: "Add list"
					})]
				})]
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					defaultValue: active.name,
					onBlur: (e) => {
						const n = e.target.value.trim();
						if (n && n !== active.name) renameWatchList(active.id, n);
					},
					className: "h-9 w-40 rounded-sm bg-bg-elevated px-2.5 text-[13px] shadow-[var(--shadow-border)] outline-none",
					"aria-label": "Rename list"
				}, active.id), watchlists.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => deleteWatchList(active.id),
					children: "Delete list"
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchBoard, {
				symbols: active?.symbols || [],
				rows: screen.data?.rows || [],
				loading: screen.isPending
			}),
			active?.symbols.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: active.symbols.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => toggle(s),
					children: ["Remove ", s]
				}, s))
			}) : null,
			alerts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Alerts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-1",
				children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-[13px] shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/s/$symbol",
						params: { symbol: a.symbol },
						className: "hover:text-chart",
						children: [
							a.symbol,
							" · ",
							a.kind || "price",
							" ",
							a.dir,
							" ",
							a.kind === "price" || !a.kind ? fmtPx(a.price) : a.price
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => removeAlert(a.id),
						children: "Remove"
					})]
				}, a.id))
			})] }) : null,
			recents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Recent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: recents.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$symbol",
					params: { symbol: r.symbol },
					className: "h-8 rounded-sm bg-surface px-2.5 text-[12px] leading-8 shadow-[var(--shadow-border)] hover:text-chart",
					children: r.symbol
				}, r.symbol))
			})] }) : null
		]
	}) });
}
//#endregion
export { WatchPage as component };
