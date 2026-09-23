import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { R as ArrowRight } from "../_libs/lucide-react.mjs";
import { In as useKosh, sn as Button } from "./router-BWv3yT6z.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-GOer22pj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mix-nudge-BMr-bIcM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	stock: {
		kicker: "Your portfolio versus Nifty",
		title: "One stock is a story. The portfolio is the score.",
		body: "Most people read a stock and never check whether the whole holding is beating the index. Thirty seconds."
	},
	markets: {
		kicker: "Have a portfolio?",
		title: "Winners today. Did your holdings beat Nifty?",
		body: "Green names feel like winning. The index is the default alternative. See the gap, don’t ignore it."
	},
	landing: {
		kicker: "Already hold stocks?",
		title: "See your portfolio versus Nifty.",
		body: "Drop a broker file — or open the sample. One line against the index. Optional. Markets is the daily stop."
	},
	app: {
		kicker: "Versus the index",
		title: "Pick a portfolio. Put it next to Nifty.",
		body: "Growth, drawdown, and a gap versus the index — that’s the read."
	}
};
function MixNudge({ where = "landing" }) {
	const ports = useKosh((s) => s.portfolios);
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const filled = ports.filter((p) => p.holdings.length > 0);
	const c = COPY[where];
	function go(id) {
		setOpen(false);
		navigate({
			to: "/p/$id",
			params: { id }
		});
	}
	function onSee() {
		if (filled.length === 1) go(filled[0].id);
		else if (filled.length > 1) setOpen(true);
		else navigate({ to: "/app" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-lg border-l-[4px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
				children: c.kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-1.5 text-[18px] font-semibold tracking-tight",
				children: c.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-xl text-[13px] leading-snug text-muted",
				children: c.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: onSee,
					children: ["See vs Nifty", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/compare",
						children: "Compare"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					title: "Which portfolio?",
					className: "max-w-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-1",
						children: filled.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go(p.id),
							className: "rounded-sm px-3 py-2 text-left text-[13px] hover:bg-surface-2",
							children: [p.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-[11px] text-subtle",
								children: [p.holdings.length, " names"]
							})]
						}, p.id))
					})
				})
			})
		]
	});
}
//#endregion
export { MixNudge as t };
