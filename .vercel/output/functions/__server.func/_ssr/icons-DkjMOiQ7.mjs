import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as useKosh, cn as Button, ir as cn, ln as ICON_IDS, on as ICON_META, sn as IconMark } from "./router-CAFi_xno.mjs";
import { t as AppShell } from "./app-shell-CbHysjHx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/icons-DkjMOiQ7.js
var import_jsx_runtime = require_jsx_runtime();
var PREVIEWS = {
	"k-path": "/icon-options/preview-k-path.jpg",
	bowl: "/icon-options/preview-bowl.jpg",
	twin: "/icon-options/preview-twin.jpg",
	ledger: "/icon-options/preview-ledger.jpg",
	coin: "/icon-options/preview-coin.jpg",
	fold: "/icon-options/preview-fold.jpg"
};
function IconsPage() {
	const current = useKosh((s) => s.iconId) || "k-path";
	const setIconId = useKosh((s) => s.setIconId);
	function pick(id) {
		setIconId(id);
		toast.success("App icon updated — look at the top-left mark");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page mx-auto max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[12px] text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						className: "hover:text-muted",
						children: "Portfolios"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1.5",
						children: "/"
					}),
					"App icon"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-[28px] font-semibold tracking-tight",
				children: "Pick the mark"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted",
				children: "Six actual marks. The large tile is the idea; the small square is the live glyph that sits in the header. Tap a card to use it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: ICON_META.map((m) => {
					const on = current === m.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => pick(m.id),
						className: cn("overflow-hidden rounded-lg bg-surface text-left shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]", on && "ring-1 ring-chart"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: PREVIEWS[m.id],
							alt: m.title,
							width: 640,
							height: 640,
							className: "aspect-square w-full bg-bg object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-start gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMark, {
								id: m.id,
								className: "size-12 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 pt-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: m.title
									}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] tracking-[0.06em] text-chart uppercase",
										children: "Using"
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-[13px] leading-snug text-muted",
									children: m.blurb
								})]
							})]
						})]
					}, m.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: "At 16px · tab size"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap items-end gap-5",
					children: ICON_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid justify-items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMark, {
							id,
							className: "size-4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-subtle",
							children: id
						})]
					}, id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						children: "Back to portfolios"
					})
				})
			})
		]
	}) });
}
//#endregion
export { IconsPage as component };
