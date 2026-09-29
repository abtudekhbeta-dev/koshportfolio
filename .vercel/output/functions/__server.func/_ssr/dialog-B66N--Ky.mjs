import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent$1, s as DialogTrigger$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { vn as cn } from "./router-D75dEx_h2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-B66N--Ky.js
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
function DialogContent({ children, className, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "kosh-overlay fixed inset-0 z-50 bg-black/55" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("kosh-dialog fixed z-50 overflow-y-auto bg-bg-elevated shadow-[var(--shadow-border)] focus:outline-none", "inset-x-0 bottom-0 max-h-[min(92dvh,840px)] rounded-t-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(520px,calc(100vw-24px))] sm:max-h-[min(88dvh,720px)] sm:rounded-xl sm:p-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden",
				"aria-hidden": true
			}),
			title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "mb-3 text-lg font-semibold tracking-tight",
				children: title
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: "Dialog"
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				className: "absolute top-3.5 right-3.5 rounded-sm p-1 text-muted hover:text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})
		]
	})] });
}
//#endregion
export { DialogContent as n, DialogTrigger as r, Dialog as t };
