import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as ThemeToggle } from "./router-CP-LXn6m.mjs";
import { s as BrandLink } from "./router-CP-LXn6m2.mjs";
import { n as LayoutSwitch, r as SearchBar, t as AuthSlot } from "./layout-switch-gWDY3DjE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-chrome-CnZO20IC.js
var import_jsx_runtime = require_jsx_runtime();
function SkipToMain() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: "#main",
		className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-fg",
		children: "Skip to content"
	});
}
function LandingHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "kosh-topbar mx-auto grid h-16 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "hidden items-center gap-1 md:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/markets",
								className: "grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-fg shadow-[var(--shadow-border)]",
								children: "Markets"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/screen",
								className: "grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg",
								children: "Screener"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app",
								className: "grid h-11 place-items-center rounded-sm bg-surface px-4 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg",
								children: "Portfolios"
							})
						]
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
					className: "flex items-center gap-1 sm:gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-1 md:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/watch",
								className: "grid h-11 place-items-center rounded-sm bg-surface px-3.5 text-[15px] font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg",
								children: "Watch"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSwitch, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
					]
				})
			]
		})
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-[13px] leading-relaxed text-muted",
					children: "Indian prices, stock pages, screens, and a portfolio versus Nifty. Quality over clutter. Not a broker, not advice."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: "Product"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 text-[13px] text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hover:text-fg",
							children: "Home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/markets",
							className: "hover:text-fg",
							children: "Markets"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/screen",
							className: "hover:text-fg",
							children: "Screener"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/watch",
							className: "hover:text-fg",
							children: "Watch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "hover:text-fg",
							children: "Portfolios"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/compare",
							className: "hover:text-fg",
							children: "Compare"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/icons",
							className: "hover:text-fg",
							children: "App icon"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "hover:text-fg",
							children: "Sign in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/signup",
							className: "hover:text-fg",
							children: "Create account"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: "Legal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 text-[13px] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "hover:text-fg",
						children: "Privacy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/terms",
						className: "hover:text-fg",
						children: "Terms"
					})]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[12px] text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kosh · Indian prices · IST calendar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Not investment advice." })]
			})
		})]
	});
}
function LegalPage({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipToMain, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				id: "main",
				className: "mx-auto max-w-2xl px-4 py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[clamp(1.8rem,1.2rem+2vw,2.4rem)] font-semibold tracking-tight",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "legal-prose mt-8 grid gap-5 text-[15px] leading-relaxed text-muted",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { SkipToMain as i, LegalPage as n, SiteFooter as r, LandingHeader as t };
