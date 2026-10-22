import { o as __toESM } from "../_runtime.mjs";
import { x as apiTape } from "./api-BE61nRQk.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as ThemeToggle, yt as useSyncStatus } from "./router-MmE3qr5w.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { $ as tapeFreshness, Et as fmtPct, Ot as fmtTapePx, Sn as cn, Tt as fmtInr, it as useKosh } from "./router-MmE3qr5w2.mjs";
import { n as LayoutSwitch, r as SearchBar, t as AuthSlot } from "./layout-switch-YQtzCKX2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ledger-shell-CMHptNCL.js
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
function useLedgerInspector() {
	return (0, import_react.useContext)(InspectorContext);
}
var NAV = [
	{
		to: "/",
		label: "Brief",
		on: (p) => p === "/"
	},
	{
		to: "/markets",
		label: "Markets",
		on: (p) => p.startsWith("/markets")
	},
	{
		to: "/screen",
		label: "Screener",
		on: (p) => p.startsWith("/screen")
	},
	{
		to: "/app",
		label: "Books",
		on: (p) => p === "/app" || p.startsWith("/p/") && !p.includes("/path")
	},
	{
		to: "/watch",
		label: "Watch",
		on: (p) => p.startsWith("/watch")
	}
];
function LedgerShell({ children, full }) {
	const tape = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		refetchInterval: isIstSession() ? 5e3 : 6e4,
		staleTime: 2500
	});
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const ports = useKosh((s) => s.portfolios);
	const book = ports.find((p) => p.id !== "sample") || ports[0];
	const fresh = tapeFreshness(tape.data, isIstSession());
	const [inspector, setInspector] = (0, import_react.useState)(null);
	const set = (0, import_react.useMemo)(() => (node) => setInspector(node), []);
	const today = new Intl.DateTimeFormat("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: "Asia/Kolkata"
	}).format(/* @__PURE__ */ new Date());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorContext.Provider, {
		value: set,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("ledger-shell min-h-dvh bg-bg text-fg", full && "flex h-dvh flex-col overflow-hidden"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3 px-5 pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "ledger-word text-[34px] leading-none tracking-tight",
							children: "Kosh"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[12px] tracking-[0.14em] text-subtle uppercase",
							children: ["The ledger · ", today]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3 pb-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
									title: fresh.title,
									children: fresh.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncChip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "mx-auto mt-4 hidden max-w-5xl gap-6 px-5 pb-3 md:flex",
						"aria-label": "Ledger",
						children: [
							NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: cn("border-b pb-2 text-[14px]", item.on(pathname) ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"),
								children: item.label
							}, item.label)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: book ? "/p/$id/path" : "/app",
								params: book ? { id: book.id } : void 0,
								className: cn("border-b pb-2 text-[14px]", pathname.includes("/path") ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"),
								children: "Path"
							}),
							book ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto pb-2 text-[13px] text-subtle",
								children: book.name
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn(full ? "flex min-h-0 w-full flex-1 flex-col" : "mx-auto w-full max-w-5xl px-5 py-8", !full && inspector && "lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: full ? "min-h-0 flex-1" : "min-w-0 pb-16 md:pb-0",
						children
					}), inspector ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "fixed inset-x-0 bottom-14 z-30 max-h-[46vh] overflow-y-auto border-t border-border bg-bg px-5 py-4 lg:static lg:bottom-auto lg:max-h-none lg:overflow-visible lg:border-t-0 lg:border-l lg:px-0 lg:py-0",
						children: inspector
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/",
							label: "Brief",
							on: pathname === "/"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/markets",
							label: "Markets",
							on: pathname.startsWith("/markets")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/app",
							label: "Books",
							on: pathname === "/app" || pathname.startsWith("/p/")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: book ? "/p/$id/path" : "/app",
							params: book ? { id: book.id } : void 0,
							label: "Path",
							on: pathname.includes("/path")
						})
					]
				})
			]
		})
	});
}
function Tab({ to, label, on, params }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		params,
		className: cn("flex-1 py-3 text-center text-[12px]", on ? "text-fg" : "text-muted"),
		children: label
	});
}
function LedgerLanding() {
	const rows = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		refetchInterval: isIstSession() ? 5e3 : 6e4,
		staleTime: 2500
	}).data || [];
	const fresh = tapeFreshness(rows, isIstSession());
	const focus = rows.find((r) => r.price > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[12px] tracking-[0.18em] text-subtle uppercase",
			children: "Investor’s brief"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "ledger-word mt-3 max-w-[18ch] text-[44px] leading-[1.08] font-medium",
			children: "A journal of the book, not another terminal."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 max-w-xl text-[17px] leading-relaxed text-muted",
			children: [
				focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					focus.label,
					" is ",
					fmtTapePx(focus.price),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: focus.changePct >= 0 ? "text-up" : "text-down",
						children: [" ", fmtPct(focus.changePct)]
					}),
					".",
					" "
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: fresh.title,
					children: [fresh.label, "."]
				}),
				" Figures are what the feed returned. Nothing here is a forecast or a target price."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-8 border-border" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-10 md:grid-cols-[1.4fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "ledger-word text-[26px]",
					children: "The market, in one column"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4",
					children: rows.slice(0, 8).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-4 border-b border-border py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/markets",
							className: "text-[15px]",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[14px] tabular",
							children: [t.price ? fmtTapePx(t.price, t.unit) : "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("ml-3", (t.changePct || 0) >= 0 ? "text-up" : "text-down"),
								children: t.changePct ? fmtPct(t.changePct) : ""
							})]
						})]
					}, t.id))
				}),
				!rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[14px] text-muted",
					children: "Waiting on prices."
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md:border-l md:border-border md:pl-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "ledger-word text-[26px]",
					children: "Open the book"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-4 space-y-4 text-[15px] leading-relaxed",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "underline decoration-accent underline-offset-4",
							children: "Portfolios"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " — value, what changed, and the holdings as a table, not a grid of cards."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/p/$id/path",
							params: { id: "sample" },
							className: "underline decoration-accent underline-offset-4",
							children: "Sample path"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " — pick a session. Quantities come from the trade file. A missing close is not zero."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/screen",
							className: "underline decoration-accent underline-offset-4",
							children: "Screener"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " — numbers already on file."
						})] })
					]
				})]
			})]
		})
	] }) });
}
function LedgerOverview({ name, value, dayAbs, dayPct, rows }) {
	const ranked = [...rows].filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
	const top = ranked[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[12px] tracking-[0.16em] text-subtle uppercase",
			children: name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "ledger-word mt-2 text-[40px] leading-none",
			children: fmtInr(value)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: cn("mt-2 text-[15px]", dayAbs >= 0 ? "text-up" : "text-down"),
			children: [
				fmtInr(dayAbs),
				" today · ",
				fmtPct(dayPct)
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 max-w-xl text-[14px] leading-relaxed text-muted",
			children: ["Securities only. Untracked cash is not in this figure.", top ? ` ${top.name} is the largest line, ${(top.value / value * 100).toFixed(1)}% of what is priced.` : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "ledger-word mt-8 text-[26px]",
			children: "What is held"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "mt-3 w-full text-left text-[14px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 font-medium",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 text-right font-medium",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 text-right font-medium",
						children: "Value"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 text-right font-medium",
						children: "Weight"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ranked.slice(0, 12).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/s/$symbol",
							params: { symbol: r.symbol },
							className: "hover:underline",
							children: r.name
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 text-right font-mono tabular",
						children: r.qty
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 text-right font-mono tabular",
						children: fmtInr(r.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "py-2 text-right font-mono tabular",
						children: [value > 0 ? (r.value / value * 100).toFixed(1) : "—", "%"]
					})
				]
			}, r.symbol)) })]
		}),
		ranked.length > 12 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[12px] text-subtle",
			children: [
				"Showing 12 of ",
				ranked.length,
				" priced lines."
			]
		}) : null
	] });
}
//#endregion
export { isIstSession as a, SyncChip as i, LedgerOverview as n, istClock as o, LedgerShell as r, useLedgerInspector as s, LedgerLanding as t };
