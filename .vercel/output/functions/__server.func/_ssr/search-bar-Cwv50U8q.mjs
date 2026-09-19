import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate, d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { u as Search } from "../_libs/lucide-react.mjs";
import { Kt as searchNse, Mt as useCurrentUser, Nt as useCurrentUserState, Wt as NIFTY50, jn as useKosh, nn as Button, qn as cn } from "./router-CuH7ax2z.mjs";
import { m as apiSearch } from "./api-DtVFWAsH.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-bar-Cwv50U8q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function AuthSlot() {
	const { isPending } = useCurrentUserState();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted || isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-8 w-[9.5rem] animate-pulse rounded-sm bg-surface-2",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedOut, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "grid h-8 place-items-center rounded-sm px-2.5 text-[13px] text-muted hover:text-fg",
		children: "Sign in"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		size: "sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/signup",
			children: "Create account"
		})
	})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}) })] });
}
function SearchBar() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const nav = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const recents = useKosh((s) => s.recents);
	const watch = useKosh((s) => s.watch);
	const pushRecent = useKosh((s) => s.pushRecent);
	const setDeskSymbol = useKosh((s) => s.setDeskSymbol);
	const timer = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const t = e.target;
			const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
			if (e.key === "k" && (e.metaKey || e.ctrlKey) || e.key === "/" && !typing) {
				e.preventDefault();
				setOpen(true);
			}
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		window.clearTimeout(timer.current);
		const v = q.trim();
		if (v.length < 1) {
			setHits([]);
			return;
		}
		setBusy(true);
		timer.current = window.setTimeout(() => {
			apiSearch(v).then((rows) => setHits(rows)).catch(() => setHits([])).finally(() => setBusy(false));
		}, 160);
	}, [q, open]);
	function go(symbol, name) {
		const s = symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
		pushRecent({
			symbol: s,
			name: name || s
		});
		setOpen(false);
		setQ("");
		if (pathname === "/markets" || pathname.startsWith("/markets/")) {
			setDeskSymbol(s, name || s);
			return;
		}
		nav({
			to: "/s/$symbol",
			params: { symbol: s }
		});
	}
	const needle = q.trim().toUpperCase();
	const nseHits = needle ? searchNse(q, 10) : [];
	const nifty = !needle ? NIFTY50.slice(0, 8) : [];
	const nseSyms = new Set(nseHits.map((x) => x.symbol.toUpperCase()));
	const indianHits = hits.filter((h) => {
		const bare = h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
		if (nseSyms.has(bare)) return false;
		return /\.(NS|BO)$/i.test(h.symbol) || /NSE|BSE|India/i.test(h.exch || "");
	});
	const shownHits = indianHits.length ? indianHits : hits.filter((h) => {
		const bare = h.symbol.replace(/\.(NS|BO)$/i, "").toUpperCase();
		return !nseSyms.has(bare) && !/\.KL$/i.test(h.symbol);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "flex h-11 min-w-0 w-full items-center gap-2 rounded-sm bg-bg-elevated px-3 text-left text-[14px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: "Search any NSE or BSE name…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
				className: "hidden rounded-[4px] bg-bg px-1.5 font-mono text-[10px] text-subtle sm:inline",
				children: "/"
			})
		]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "kosh-overlay absolute inset-0 bg-black/55",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kosh-search-dialog absolute left-1/2 top-[12vh] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e, {
				label: "Search",
				shouldFilter: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
						value: q,
						onValueChange: setQ,
						placeholder: "Ticker or company — RELIANCE, Infosys, a BSE name, gold",
						className: "h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle",
						autoFocus: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.List, {
					className: "max-h-[min(60vh,420px)] overflow-y-auto p-2",
					children: [
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2 py-2 text-[12px] text-subtle",
							children: "Looking up…"
						}) : null,
						nseHits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "NSE",
							children: nseHits.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								symbol: x.symbol,
								name: x.name,
								exch: "NSE",
								onPick: go
							}, x.symbol))
						}) : null,
						nifty.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "Nifty 50",
							children: nifty.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								symbol: x.symbol,
								name: x.name,
								onPick: go
							}, x.symbol))
						}) : null,
						shownHits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "NSE & BSE",
							children: shownHits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								symbol: h.symbol,
								name: h.name,
								exch: h.exch,
								onPick: go
							}, "y" + h.symbol))
						}) : null,
						q.trim() && !shownHits.length && !nseHits.length && !busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2 py-3 text-[13px] text-muted",
							children: "No hits. Try a ticker like RELIANCE, INFY, or a BSE code."
						}) : null,
						recents.length && !q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "Recent",
							children: recents.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								symbol: r.symbol,
								name: r.name,
								onPick: go
							}, "r" + r.symbol))
						}) : null,
						watch.length && !q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "Watch",
							children: watch.slice(0, 8).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								symbol: s,
								name: s,
								onPick: go
							}, "w" + s))
						}) : null
					]
				})]
			})
		})]
	}) : null] });
}
function Row({ symbol, name, exch, onPick }) {
	const s = symbol.replace(/\.(NS|BO)$/i, "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Item, {
		value: s + " " + name,
		onSelect: () => onPick(s, name),
		className: cn("flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-[13px]", "data-[selected=true]:bg-surface"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: s
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ml-3 min-w-0 truncate text-muted",
			children: [name, exch ? ` · ${exch}` : ""]
		})]
	});
}
//#endregion
export { SearchBar as n, AuthSlot as t };
