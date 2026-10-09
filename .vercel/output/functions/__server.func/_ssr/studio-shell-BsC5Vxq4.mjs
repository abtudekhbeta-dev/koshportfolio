import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as apiQuotes, h as apiScreener, x as apiTape } from "./api-BE61nRQk.mjs";
import { s as ThemeToggle, vt as useSyncStatus } from "./router-CP-LXn6m.mjs";
import { p as Plus } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Qt as useKosh, Rt as quoteStatus, S as fmtTapePx, b as fmtPct, dt as Button, gn as cn, x as fmtPx, zt as quoteStatusLabel } from "./router-CP-LXn6m2.mjs";
import { t as AddHoldings } from "./add-holdings-BxUmES2U.mjs";
import { n as LayoutSwitch, r as SearchBar, t as AuthSlot } from "./layout-switch-gWDY3DjE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/studio-shell-BsC5Vxq4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** IST cash session. Client-safe. */
var IST = 19800;
function isIstSession(now = Date.now()) {
	const d = new Date(now + IST * 1e3);
	const wd = d.getUTCDay();
	if (wd === 0 || wd === 6) return false;
	const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
	return mins >= 540 && mins <= 950;
}
function istClock(now = Date.now()) {
	const d = new Date(now + IST * 1e3);
	return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}
function fired(a, quote, row) {
	const kind = a.kind || "price";
	const px = quote?.price ?? 0;
	if (kind === "price") {
		if (!(px > 0)) return false;
		return a.dir === "above" ? px >= a.price : px <= a.price;
	}
	if (kind === "pct") {
		const ch = quote?.changePct;
		if (ch == null) return false;
		return a.dir === "above" ? ch >= a.price : ch <= -Math.abs(a.price);
	}
	if (kind === "rsi") {
		const r = row?.rsi;
		if (r == null) return false;
		return a.dir === "above" ? r >= a.price : r <= a.price;
	}
	if (kind === "volume") {
		const v = row?.volRatio;
		if (v == null) return false;
		return v >= a.price;
	}
	if (kind === "high52") return px > 0 && (quote?.high52 ?? 0) > 0 && px >= quote.high52 * .995;
	if (kind === "low52") return px > 0 && (quote?.low52 ?? 0) > 0 && px <= quote.low52 * 1.005;
	return false;
}
function label(a) {
	const kind = a.kind || "price";
	if (kind === "price") return `${a.dir} ${fmtPx(a.price)}`;
	if (kind === "pct") return a.dir === "above" ? `day ≥ ${fmtPct(a.price)}` : `day ≤ −${Math.abs(a.price).toFixed(1)}%`;
	if (kind === "rsi") return `RSI ${a.dir} ${a.price}`;
	if (kind === "volume") return `volume ≥ ${a.price}×`;
	if (kind === "high52") return "at 52-week high";
	if (kind === "low52") return "at 52-week low";
	return "";
}
function AlertBanner() {
	const alerts = useKosh((s) => s.alerts);
	const remove = useKosh((s) => s.removeAlert);
	const symbols = [...new Set(alerts.map((a) => a.symbol))];
	const needScreen = alerts.some((a) => a.kind === "rsi" || a.kind === "volume");
	const q = useQuery({
		queryKey: ["alert-quotes", symbols],
		queryFn: () => apiQuotes(symbols),
		enabled: symbols.length > 0,
		staleTime: 3e4,
		refetchInterval: 6e4
	});
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		enabled: needScreen,
		staleTime: 6e5
	});
	const map = new Map((q.data || []).map((x) => [x.input.toUpperCase().replace(/\.(NS|BO)$/i, ""), x]));
	const rows = new Map((screen.data?.rows || []).map((r) => [r.symbol.toUpperCase(), r]));
	const hit = alerts.filter((a) => fired(a, map.get(a.symbol), rows.get(a.symbol)));
	if (!hit.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-surface-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-[13px]",
			children: hit.map((a) => {
				const px = map.get(a.symbol)?.price;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/s/$symbol",
						params: { symbol: a.symbol },
						className: "text-fg hover:text-chart",
						children: [
							a.symbol,
							" is ",
							fmtPx(px || 0),
							" — ",
							label(a)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[12px] text-muted hover:text-fg",
						onClick: () => remove(a.id),
						children: "Dismiss"
					})]
				}, a.id);
			})
		})
	});
}
function SyncChip() {
	const status = useSyncStatus();
	if (status.state === "local") return null;
	const when = status.state === "synced" && status.at ? rel(status.at) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		title: status.detail,
		className: cn("hidden shrink-0 text-[11px] sm:inline", status.state === "attention" || status.state === "offline" ? "text-warn" : "text-subtle"),
		children: [status.state === "syncing" ? "Syncing" : status.state === "offline" ? "Offline" : status.state === "attention" ? "Needs attention" : "Synced", when ? ` ${when}` : ""]
	});
}
function rel(at) {
	const s = Math.max(0, Math.round((Date.now() - at) / 1e3));
	if (s < 10) return "just now";
	if (s < 60) return `${s}s ago`;
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m ago`;
	return `${Math.round(m / 60)}h ago`;
}
var InspectorContext = (0, import_react.createContext)(null);
function useStudioInspector() {
	return (0, import_react.useContext)(InspectorContext);
}
function sectionOf(pathname) {
	if (pathname.startsWith("/markets")) return "Markets";
	if (pathname.startsWith("/screen") || pathname.startsWith("/compare") || pathname.startsWith("/watch")) return "Research";
	if (pathname.includes("/path") || pathname.includes("/improve")) return "Decisions";
	if (pathname.startsWith("/p/") || pathname.startsWith("/app")) return "Portfolios";
	if (pathname.startsWith("/s/")) return "Stock";
	return "Studio";
}
function StudioShell({ children, full }) {
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		refetchInterval: isIstSession() ? 15e3 : 6e4,
		staleTime: 1e4
	});
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const searchStr = useRouterState({ select: (s) => s.location.searchStr });
	const port = pathname.match(/^\/p\/([^/]+)/)?.[1] || null;
	const ports = useKosh((s) => s.portfolios);
	const book = ports.find((p) => p.id === port) || ports.find((p) => p.id !== "sample") || ports[0];
	const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
	const tapeLabel = quoteStatusLabel(quoteStatus({
		session: isIstSession(),
		price: tapeOn ? 1 : (tape.data || [])[0]?.price
	}), null);
	const overview = pathname.startsWith("/markets") && /(?:^|[?&])view=overview(?:&|$)/.test(searchStr);
	const [inspector, setInspector] = (0, import_react.useState)(null);
	const set = (0, import_react.useMemo)(() => (node) => setInspector(node), []);
	const section = sectionOf(pathname);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorContext.Provider, {
		value: set,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("studio-shell min-h-dvh bg-bg text-fg lg:grid lg:grid-cols-[232px_minmax(0,1fr)]", full && "flex h-dvh flex-col overflow-hidden lg:grid"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sticky top-0 hidden h-dvh flex-col border-r border-border px-4 py-5 lg:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "studio-word text-[22px] tracking-tight",
							children: "Kosh"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-subtle",
							children: ["Studio · ", tapeLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
							n: "01",
							label: "Markets",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: "/markets",
								search: { view: "terminal" },
								on: pathname.startsWith("/markets") && !overview,
								children: "Terminal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: "/markets",
								search: { view: "overview" },
								on: overview,
								children: "Overview"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
							n: "02",
							label: "Research",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
									to: "/watch",
									on: pathname.startsWith("/watch"),
									children: "Watchlists"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
									to: "/screen",
									on: pathname.startsWith("/screen"),
									children: "Screener"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
									to: "/compare",
									on: pathname.startsWith("/compare"),
									children: "Compare"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
							n: "03",
							label: "Portfolios",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: "/app",
								on: pathname === "/app",
								children: "All books"
							}), book ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: "/p/$id",
								params: { id: book.id },
								on: Boolean(port) && !pathname.includes("/path") && !pathname.includes("/improve"),
								children: book.name
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
							n: "04",
							label: "Decisions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: book ? "/p/$id/improve" : "/app",
								params: book ? { id: book.id } : void 0,
								on: pathname.includes("/improve"),
								children: "Improve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(A, {
								to: book ? "/p/$id/path" : "/app",
								params: book ? { id: book.id } : void 0,
								on: pathname.includes("/path"),
								children: "Path"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto grid gap-3 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncChip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex min-w-0 flex-col", full && "min-h-0 flex-1"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: cn("z-30 border-b border-border", full ? "shrink-0" : "sticky top-0 bg-bg/95"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-12 items-center gap-3 px-3 sm:px-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hidden min-w-0 sm:block",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] tracking-[0.16em] text-subtle uppercase",
											children: section
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "min-w-0 flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
											hint: "⌘K",
											dense: true,
											placeholder: "Search a stock, index, portfolio, or page"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-tape-status": true,
										className: "hidden text-[11px] text-subtle xl:inline",
										children: tapeLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncChip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, { trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": "Add holdings",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "lg:hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertBanner, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("min-w-0", inspector && !full && "lg:grid lg:grid-cols-[minmax(0,1fr)_320px]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
								className: cn(full ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-w-0 px-3 py-5 pb-24 sm:px-5 lg:pb-10"),
								children
							}), inspector && !full ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
								className: "hidden border-l border-border px-4 py-5 lg:block",
								children: inspector
							}) : null]
						}),
						inspector && !full ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "fixed inset-x-0 bottom-14 z-30 max-h-[46vh] overflow-y-auto border-t border-border bg-bg px-3 py-3 lg:hidden",
							children: inspector
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
								to: "/markets",
								label: "Markets",
								on: pathname.startsWith("/markets")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
								to: "/screen",
								label: "Screen",
								on: pathname.startsWith("/screen")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
								to: "/app",
								label: "Books",
								on: pathname === "/app" || pathname.startsWith("/p/") && !pathname.includes("/path")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
								to: book ? "/p/$id/path" : "/app",
								params: book ? { id: book.id } : void 0,
								label: "Path",
								on: pathname.includes("/path")
							})
						]
					})
				})
			]
		})
	});
}
function StudioLanding() {
	const rows = (useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: 6e4
	}).data || []).slice(0, 6);
	const tapeOn = isIstSession() && rows.some((t) => t.price > 0);
	const tapeLabel = quoteStatusLabel(quoteStatus({
		session: isIstSession(),
		price: tapeOn ? 1 : rows[0]?.price
	}), null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StudioShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] tracking-[0.16em] text-subtle uppercase",
			children: "01 · Today"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "studio-word mt-2 max-w-[16ch] text-[40px] leading-[1.05] font-medium tracking-tight",
			children: "The book, the market, and the path."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 max-w-xl text-[15px] leading-relaxed text-muted",
			children: [
				"Studio is a different workspace on the same calculations. ",
				tapeLabel,
				". Nothing here is a live feed."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mt-8 divide-y divide-border border-y border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/markets",
					search: { view: "terminal" },
					className: "flex items-baseline justify-between gap-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-3 text-[12px] text-subtle",
						children: "01"
					}), "Market terminal"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[12px] text-muted",
						children: "Charts"
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/screen",
					className: "flex items-baseline justify-between gap-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-3 text-[12px] text-subtle",
						children: "02"
					}), "Screener"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[12px] text-muted",
						children: "Numbers on file"
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/app",
					className: "flex items-baseline justify-between gap-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-3 text-[12px] text-subtle",
						children: "03"
					}), "Portfolios"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[12px] text-muted",
						children: "The sample book is already here"
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/p/$id/path",
					params: { id: "sample" },
					className: "flex items-baseline justify-between gap-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-3 text-[12px] text-subtle",
						children: "04"
					}), "Path timeline"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[12px] text-muted",
						children: "Pick a session"
					})]
				}) })
			]
		}),
		rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-8 grid gap-x-8 sm:grid-cols-2",
			children: rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-baseline justify-between border-b border-border py-2 text-[13px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono tabular",
					children: [t.price ? fmtTapePx(t.price, t.unit) : "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("ml-3", (t.changePct || 0) >= 0 ? "text-up" : "text-down"),
						children: t.changePct ? fmtPct(t.changePct) : ""
					})]
				})]
			}, t.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-[13px] text-muted",
			children: "Waiting on the market tape."
		})
	] });
}
function Rail({ n, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[10px] tracking-[0.14em] text-subtle uppercase",
			children: [
				n,
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 grid",
			children
		})]
	});
}
function A({ to, params, search, on, children }) {
	const className = item(on);
	if (to === "/p/$id" && params) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/p/$id",
		params,
		className,
		children
	});
	if (to === "/p/$id/path" && params) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/p/$id/path",
		params,
		className,
		children
	});
	if (to === "/p/$id/improve" && params) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/p/$id/improve",
		params,
		className,
		children
	});
	if (to === "/markets") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/markets",
		search: search || { view: "terminal" },
		className,
		children
	});
	if (to === "/watch") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/watch",
		className,
		children
	});
	if (to === "/screen") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/screen",
		className,
		children
	});
	if (to === "/compare") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/compare",
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/app",
		className,
		children
	});
}
function item(on) {
	return cn("border-l px-2 py-1.5 text-[14px]", on ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg");
}
function Tab({ to, params, label, on }) {
	const className = cn("grid min-h-14 flex-1 place-items-center text-[12px]", on ? "text-fg" : "text-muted");
	if (to === "/p/$id/path" && params) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/p/$id/path",
		params,
		className,
		children: label
	});
	if (to === "/markets") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/markets",
		className,
		children: label
	});
	if (to === "/screen") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/screen",
		className,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/app",
		className,
		children: label
	});
}
//#endregion
export { isIstSession as a, SyncChip as i, StudioLanding as n, istClock as o, StudioShell as r, useStudioInspector as s, AlertBanner as t };
