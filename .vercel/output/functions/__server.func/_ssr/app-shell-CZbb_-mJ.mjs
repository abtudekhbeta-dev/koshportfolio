import { p as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { x as apiTape } from "./api-BE61nRQk.mjs";
import { s as ThemeToggle } from "./router-B40wiopi.mjs";
import { p as Plus, t as X } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Qt as useKosh, Rt as quoteStatus, Tt as instrumentKind, Zt as terminalSearch, b as fmtPct, dt as Button, gn as cn, s as BrandLink, zt as quoteStatusLabel } from "./router-B40wiopi2.mjs";
import { t as AddHoldings } from "./add-holdings-DjK-4NK5.mjs";
import { t as useAppLayout } from "./layout-mode-D5Kaq7vr.mjs";
import { n as LayoutSwitch, r as SearchBar, t as AuthSlot } from "./layout-switch-Bt2Oie66.mjs";
import { n as IntelligenceShell, r as isIstSession, t as AlertBanner } from "./intelligence-shell-7sbYhImT.mjs";
import { n as canOpenStock } from "./stock-link-HaO5mNxc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CZbb_-mJ.js
var import_jsx_runtime = require_jsx_runtime();
function fmtTape(n) {
	if (!(n > 0)) return "—";
	const digits = n >= 1e3 ? 0 : 2;
	return n.toLocaleString("en-IN", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
function tapeInner(t) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold tracking-[0.04em] text-fg",
			children: t.label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: "font-mono font-medium text-fg tabular",
			children: t.price ? fmtTape(t.price) : "—"
		}),
		t.unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-subtle",
			children: t.unit
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-mono tabular", t.changePct >= 0 ? "text-up" : "text-down"),
			children: t.changePct ? fmtPct(t.changePct) : ""
		})
	] });
}
/** The moving strip. Indices open Terminal. Stocks open the stock page. Gold and silver stay prices. */
function TapeQuote({ t }) {
	const kind = instrumentKind(t.symbol);
	const cls = "flex shrink-0 cursor-pointer items-baseline gap-2 whitespace-nowrap rounded-sm hover:text-chart focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart";
	if (kind === "index") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/markets",
		search: terminalSearch(t.symbol, t.label),
		"aria-label": `Open ${t.label} in Terminal`,
		className: cls,
		children: tapeInner(t)
	});
	if (kind === "stock" && canOpenStock(t.symbol)) {
		const bare = t.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/s/$symbol",
			params: { symbol: bare },
			"aria-label": `Open ${t.label}`,
			className: cls,
			children: tapeInner(t)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex shrink-0 items-baseline gap-2 whitespace-nowrap",
		"aria-label": `${t.label} price`,
		children: tapeInner(t)
	});
}
var MAIN = [
	{
		to: "/markets",
		label: "Markets"
	},
	{
		to: "/screen",
		label: "Screener"
	},
	{
		to: "/app",
		label: "Portfolios"
	}
];
var SIDE = [{
	to: "/watch",
	label: "Watch"
}];
var PRIMARY = [...MAIN, ...SIDE];
function navOn(to, pathname) {
	if (to === "/") return pathname === "/";
	if (to === "/app") return pathname === "/app" || pathname.startsWith("/p/");
	return pathname === to || pathname.startsWith(to + "/");
}
function AppShell({ children, wide, full }) {
	if (useAppLayout() === "intelligence") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelligenceShell, {
		wide,
		full,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassicShell, {
		wide,
		full,
		children
	});
}
function ClassicShell({ children, wide, full }) {
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		refetchInterval: isIstSession() ? 5e3 : 6e4,
		staleTime: isIstSession() ? 2500 : 3e4,
		enabled: !full
	});
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const tapeOn = isIstSession() && (tape.data || []).some((t) => t.price > 0);
	const tapeLabel = quoteStatusLabel(quoteStatus({
		session: isIstSession(),
		price: tapeOn ? 1 : (tape.data || [])[0]?.price
	}), null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(full ? "flex h-dvh min-h-0 flex-col overflow-hidden" : "min-h-dvh"),
		children: [
			!full ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border bg-bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "kosh-marquee-wrap overflow-hidden px-3 py-2 sm:px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 flex items-center gap-2 px-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-tape-status": true,
							className: "text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase",
							children: tapeLabel
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "kosh-tape-track flex w-max items-center",
						children: [0, 1].map((copy) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex min-w-[100vw] shrink-0 items-center gap-8 pr-8",
							children: (tape.data || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapeQuote, { t }, t.id + "-" + copy))
						}, copy))
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: cn("z-30 border-b border-border bg-bg/85 backdrop-blur-md", full ? "shrink-0" : "sticky top-0"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("kosh-app-header mx-auto grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:grid-cols-[1fr_minmax(0,36rem)_1fr] sm:gap-3 sm:px-4", full ? "max-w-none" : wide ? "max-w-[1400px]" : "max-w-6xl"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
									className: "hidden items-center gap-1 md:flex",
									children: MAIN.map((n) => {
										const on = navOn(n.to, pathname);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: n.to,
											className: cn("grid h-12 place-items-center rounded-sm bg-surface px-4 text-[16px] font-semibold shadow-[var(--shadow-border)] lg:px-5", on ? "text-fg ring-1 ring-fg/25" : "text-fg/80 hover:text-fg"),
											children: n.label
										}, n.to);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center px-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full max-w-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-1 sm:gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
										className: "hidden items-center gap-1 md:flex",
										children: SIDE.map((n) => {
											const on = navOn(n.to, pathname);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: n.to,
												className: cn("grid h-9 place-items-center rounded-sm px-3 text-[13px] font-medium", on ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
												children: n.label
											}, n.to);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, { trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "default",
										"aria-label": "Add holdings",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: "Add"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
								]
							})
						]
					}),
					full ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirstStrip, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertBanner, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn(full ? "kosh-main flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-14 pt-0 md:pb-0" : cn("kosh-main mx-auto px-3 pb-24 pt-5 sm:px-4 sm:pb-20 sm:pt-6", wide ? "max-w-[1400px]" : "max-w-6xl")),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-stretch",
					children: PRIMARY.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: cn("grid min-h-14 flex-1 place-items-center px-0.5 text-center text-[12px] font-medium leading-tight", navOn(n.to, pathname) ? "bg-surface text-fg" : "text-muted", (n.to === "/markets" || n.to === "/screen" || n.to === "/app") && "font-semibold"),
						children: n.label
					}, n.to))
				})
			})
		]
	});
}
function FirstStrip() {
	const done = useKosh((s) => s.tourDone);
	const setTourDone = useKosh((s) => s.setTourDone);
	if (done) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-t border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 sm:px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1 text-[14px] leading-snug text-fg",
				children: "Search a stock → Screener numbers → Add holdings."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/markets",
						className: "inline-flex h-10 items-center rounded-sm bg-accent px-3.5 text-[13px] font-medium text-accent-fg",
						children: "Search"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/screen",
						className: "inline-flex h-10 items-center rounded-sm bg-bg-elevated px-3.5 text-[13px] font-medium shadow-[var(--shadow-border)]",
						children: "Screener"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddHoldings, { trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "default",
						children: "Add holdings"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Dismiss",
						className: "grid size-10 place-items-center text-muted hover:text-fg",
						onClick: () => setTourDone(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			})]
		})
	});
}
//#endregion
export { AppShell as t };
