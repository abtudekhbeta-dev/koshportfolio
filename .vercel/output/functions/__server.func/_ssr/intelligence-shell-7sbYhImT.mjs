import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as apiQuotes, h as apiScreener, x as apiTape } from "./api-BE61nRQk.mjs";
import { s as ThemeToggle } from "./router-B40wiopi.mjs";
import { p as Plus } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Qt as useKosh, Rt as quoteStatus, b as fmtPct, dt as Button, gn as cn, x as fmtPx, zt as quoteStatusLabel } from "./router-B40wiopi2.mjs";
import { t as AddHoldings } from "./add-holdings-DjK-4NK5.mjs";
import { n as LayoutSwitch, r as SearchBar, t as AuthSlot } from "./layout-switch-Bt2Oie66.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/intelligence-shell-7sbYhImT.js
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
function navOn(to, pathname) {
	if (to === "/app") return pathname === "/app" || pathname.startsWith("/p/");
	return pathname === to || pathname.startsWith(to + "/");
}
function IntelligenceShell({ children, full }) {
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		refetchInterval: isIstSession() ? 5e3 : 6e4,
		staleTime: isIstSession() ? 2500 : 3e4
	});
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const searchStr = useRouterState({ select: (s) => s.location.searchStr });
	const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
	const tapeLabel = quoteStatusLabel(quoteStatus({
		session: isIstSession(),
		price: tapeOn ? 1 : (tape.data || [])[0]?.price
	}), null);
	const port = pathname.match(/^\/p\/([^/]+)/)?.[1] || null;
	const marketsOverview = pathname.startsWith("/markets") && /(?:^|[?&])view=overview(?:&|$)/.test(searchStr);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("iq-shell min-h-dvh md:grid md:grid-cols-[200px_minmax(0,1fr)]", full && "flex h-dvh flex-col overflow-hidden md:grid"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-dvh flex-col border-r border-border bg-bg px-3 py-4 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "px-2 text-[15px] font-semibold tracking-tight",
						children: "Kosh"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
						label: "Markets",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
							to: "/markets",
							search: { view: "terminal" },
							on: pathname.startsWith("/markets") && !marketsOverview,
							children: "Terminal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
							to: "/markets",
							search: { view: "overview" },
							on: marketsOverview,
							children: "Overview"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
						label: "Research",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
								to: "/watch",
								on: navOn("/watch", pathname),
								children: "Watch"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
								to: "/screen",
								on: navOn("/screen", pathname),
								children: "Screener"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
								to: "/compare",
								on: navOn("/compare", pathname),
								children: "Compare"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Rail, {
						label: "Portfolios",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
							to: "/app",
							on: pathname === "/app",
							children: "Portfolios"
						}), port ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailLink, {
							to: "/p/$id",
							params: { id: port },
							on: pathname.startsWith("/p/"),
							children: "This portfolio"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto grid gap-2 border-t border-border pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-w-0 flex-col", full && "min-h-0 flex-1"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: cn("z-30 border-b border-border bg-bg/90 backdrop-blur-md", full ? "shrink-0" : "sticky top-0"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-12 items-center gap-2 px-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-[14px] font-semibold md:hidden",
								children: "Kosh"
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
								className: "hidden shrink-0 text-[11px] text-subtle lg:inline",
								children: tapeLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertMenu, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, { trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								"aria-label": "Add holdings",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Add"
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "md:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "md:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertBanner, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: cn(full ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-w-0 px-3 py-4 pb-24 sm:px-5 md:pb-8"),
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/markets",
							label: "Markets",
							on: navOn("/markets", pathname)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/watch",
							label: "Watch",
							on: navOn("/watch", pathname)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/screen",
							label: "Screen",
							on: navOn("/screen", pathname)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/app",
							label: "Portfolio",
							on: navOn("/app", pathname)
						})
					]
				})
			})
		]
	});
}
function Rail({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-2 text-[10px] font-medium tracking-[0.14em] text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 grid",
			children
		})]
	});
}
function RailLink({ to, params, search, on, children }) {
	const className = cn("rounded-sm px-2 py-1.5 text-[13px]", on ? "bg-surface text-fg" : "text-muted hover:text-fg");
	if (to === "/p/$id" && params) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/p/$id",
		params,
		className,
		children
	});
	if (to === "/markets") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/markets",
		search: search ?? { view: "terminal" },
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
function Tab({ to, label, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: cn("grid min-h-14 flex-1 place-items-center text-[12px] font-medium", on ? "text-fg" : "text-muted"),
		children: label
	});
}
function AlertMenu() {
	const alerts = useKosh((s) => s.alerts);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			"aria-label": alerts.length ? `${alerts.length} alerts` : "Alerts",
			onClick: () => setOpen((v) => !v),
			className: "h-8 rounded-sm px-2 text-[12px] text-muted hover:text-fg",
			children: ["Alerts", alerts.length ? ` ${alerts.length}` : ""]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-0 z-50 mt-1 w-64 rounded-sm border border-border bg-surface p-2",
			children: alerts.length ? alerts.slice(0, 12).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$symbol",
				params: { symbol: a.symbol },
				className: "block rounded-sm px-2 py-1.5 text-[13px] hover:bg-bg",
				onClick: () => setOpen(false),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: a.symbol
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [
						" ",
						"· ",
						a.kind || "price",
						" ",
						a.dir,
						" ",
						a.price
					]
				})]
			}, a.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-2 py-2 text-[12px] leading-relaxed text-muted",
				children: "No alerts yet. Set a price, move, or 52-week alert on a stock."
			})
		}) : null]
	});
}
//#endregion
export { istClock as i, IntelligenceShell as n, isIstSession as r, AlertBanner as t };
