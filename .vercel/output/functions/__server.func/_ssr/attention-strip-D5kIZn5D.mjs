import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as Bell, L as ArrowRight, S as Mail, b as MessageCircle, k as Copy, l as Send } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as NEWS_BUCKETS, B as istDateMs, C as asQual, D as skillOutputReady, F as newsToneLabel, I as newsWhy, M as newsBucket, N as newsMaterial, P as newsTone, Qt as Input, S as asPulse, T as asSpark, V as parseIstDate, Xn as sectorOf, _ as skillReadFrom, b as asFund, gt as bareSym, j as filterNews, jn as useKosh, nn as Button, qn as cn, qt as universeName, w as asQuality, x as asMix, z as formatIstShort } from "./router-CuH7ax2z.mjs";
import { c as apiNote, h as apiSkillPut, o as apiMacro, s as apiNews } from "./api-DtVFWAsH.mjs";
import { t as StockLink } from "./stock-link-ClZslyKN.mjs";
import { n as MetricCard } from "./metric-D8n1hR7q.mjs";
import { i as FundamentalView, n as CombinedView, o as QualitativeView, t as AnalysisSkeleton } from "./analysis-view-XwMpjBot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/attention-strip-D5kIZn5D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ children, tone = "chart" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("text-[11px] font-semibold tracking-[0.12em] uppercase", tone === "down" ? "text-down" : tone === "warn" ? "text-warn" : tone === "up" ? "text-up" : tone === "muted" ? "text-subtle" : "text-chart"),
		children
	});
}
function Bullets({ items, tone }) {
	if (!items.length) return null;
	const mark = tone === "down" ? "bg-down" : tone === "warn" ? "bg-warn" : tone === "muted" ? "bg-subtle" : "bg-chart";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: cn("mt-2 grid gap-2 border-l-2 pl-3", tone === "down" ? "border-down/40" : tone === "warn" ? "border-warn/40" : "border-chart/35"),
		children: items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2 text-[13px] leading-snug text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5 shrink-0 rounded-full", mark) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x })]
		}, i))
	});
}
function P({ children }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1.5 text-[13px] leading-snug text-fg",
		children
	});
}
function Block({ children, label, tone }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			tone,
			children: label
		}), children]
	});
}
function Frame({ children, tone, bare, kicker }) {
	const bar = tone === "warn" ? "bg-warn" : "bg-chart";
	const kickerColor = tone === "warn" ? "text-warn" : "text-chart";
	const edge = tone === "warn" ? "border-l-warn" : "border-l-chart";
	if (bare) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-skill": kicker.toLowerCase(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("mb-2 h-0.5 w-10 rounded-full", bar) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("text-[11px] font-semibold tracking-[0.14em] uppercase", kickerColor),
				children: kicker
			}),
			children
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-skill": kicker.toLowerCase(),
		className: cn("rounded-lg border-l-[3px] bg-surface p-4 shadow-[var(--shadow-border)]", edge),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("text-[11px] font-semibold tracking-[0.14em] uppercase", kickerColor),
			children: kicker
		}), children]
	});
}
function QualityView({ block, bare }) {
	if (!block.headline && !block.business && !block.industry && !block.moat && !block.price.length && !block.cycle && !block.risks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Frame, {
		tone: "chart",
		bare,
		kicker: "Quality",
		children: [
			block.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-[17px] font-semibold leading-snug tracking-tight",
				children: block.headline
			}) : null,
			block.business ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Business",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.business })
			}) : null,
			block.price.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Price",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.price })
			}) : null,
			block.risks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Watch",
				tone: "down",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.risks,
					tone: "down"
				})
			}) : null
		]
	});
}
function SparkView({ block, bare }) {
	if (!block.headline && !block.today && !block.headlines.length && !block.catalysts.length && !block.noise && !block.pricedIn) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Frame, {
		tone: "warn",
		bare,
		kicker: "Spark",
		children: [
			block.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-[17px] font-semibold leading-snug tracking-tight",
				children: block.headline
			}) : null,
			block.today ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Today",
				tone: "warn",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.today })
			}) : null,
			block.catalysts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Catalysts",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.catalysts,
					tone: "warn"
				})
			}) : null,
			block.pricedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Already in the price",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.pricedIn })
			}) : null,
			block.headlines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Headlines versus the move",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.headlines })
			}) : null,
			block.noise ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Noise",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.noise })
			}) : null
		]
	});
}
function PulseView({ block }) {
	if (!block.headline && !block.market && !block.names.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pulse" }),
			block.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-[17px] font-semibold leading-snug tracking-tight",
				children: block.headline
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Market",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.market })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Breadth",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.breadth })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Names that matter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.names })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Headlines vs the price",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.headlines,
					tone: "muted"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Watch next",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.watch })
			})
		]
	});
}
function MixView({ block }) {
	if (!block.headline && !block.mix && !block.risks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "This portfolio" }),
			block.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-[17px] font-semibold leading-snug tracking-tight",
				children: block.headline
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Holdings",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.mix })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Concentration",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.concentration })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Large weights",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, { items: block.largeWeights })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Versus the index",
				tone: "muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: block.vsIndex })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: "Open risks",
				tone: "down",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: block.risks,
					tone: "down"
				})
			})
		]
	});
}
function ProseNote({ text }) {
	const parts = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
	if (!parts.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 grid gap-3",
		children: parts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[13px] leading-relaxed text-fg",
			children: p
		}, i))
	});
}
function useDesk() {
	const [kind, setKind] = (0, import_react.useState)("quality");
	const [q, setQ] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function run(k, extra) {
		setKind(k);
		setBusy(true);
		setErr("");
		try {
			const r = await apiNote({
				kind: k,
				...extra,
				question: extra?.question ?? (k === "ask" ? q : void 0)
			});
			if (!r.ok) {
				setErr(r.error);
				setResult(null);
			} else setResult(r);
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Could not run. Try again in a moment.");
			setResult(null);
		} finally {
			setBusy(false);
		}
	}
	return {
		kind,
		q,
		setQ,
		result,
		err,
		busy,
		run,
		setResult,
		setKind
	};
}
function NoteResultView({ result, kind }) {
	const q = result.qualityBlock || asQuality(result.quality);
	const s = result.sparkBlock || asSpark(result.spark);
	const pulse = result.pulseBlock || (kind === "pulse" ? asPulse(result.text) : null);
	const mix = result.mixBlock || (kind === "book" ? asMix(result.text) : null);
	const fund = result.fundBlock || (kind === "fund" ? asFund(result.text) : null);
	const qual = result.qualBlock || (kind === "qual" ? asQual(result.text) : null);
	if (kind === "ask") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProseNote, { text: result.text });
	if (kind === "quality" && q) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualityView, { block: q })
	});
	if (kind === "spark" && s) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkView, { block: s })
	});
	if (kind === "pulse" && pulse) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseView, { block: pulse });
	if (kind === "book" && mix) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixView, { block: mix });
	if (kind === "fund" && fund) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundamentalView, { block: fund })
	});
	if (kind === "qual" && qual) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualitativeView, { block: qual })
	});
	if (q || s) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid gap-4 lg:grid-cols-2",
		children: [q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualityView, { block: q }) : null, s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparkView, { block: s }) : null]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProseNote, { text: result.text });
}
function NoteDesk({ symbol, compact }) {
	const [open, setOpen] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)("");
	const [fundRes, setFundRes] = (0, import_react.useState)(null);
	const [qualRes, setQualRes] = (0, import_react.useState)(null);
	const [combineRes, setCombineRes] = (0, import_react.useState)(null);
	const [combineBusy, setCombineBusy] = (0, import_react.useState)(false);
	const [pinned, setPinned] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFundRes(null);
		setQualRes(null);
		setCombineRes(null);
		setCombineBusy(false);
		setOpen(null);
		setPinned(false);
		setErr("");
	}, [symbol]);
	(0, import_react.useEffect)(() => {
		if (compact) {
			setPinned(false);
			setOpen(null);
		}
	}, [compact]);
	async function runFull(kind) {
		setOpen(kind);
		setBusy(kind);
		setErr("");
		if (!compact) setPinned(true);
		let lastErr = "The analysis did not finish. Retry.";
		try {
			for (let i = 0; i < 3; i++) {
				if (i) await new Promise((r) => setTimeout(r, 2800 * i));
				try {
					const r = await apiNote({
						kind,
						symbol,
						fresh: i ? Date.now() : void 0
					});
					if (r.ok && skillOutputReady(kind, r.text)) {
						if (kind === "fund") setFundRes(r);
						else setQualRes(r);
						setCombineRes(null);
						setErr("");
						return;
					}
					lastErr = r.ok ? "The analysis did not finish. Retry." : r.error;
					if (/Too many reads|429/i.test(lastErr)) await new Promise((r) => setTimeout(r, 16e3));
				} catch (e) {
					lastErr = e instanceof Error ? e.message : "Could not run. Try again in a moment.";
					if (/Busy|Too many|429|took too long|Retry|Gateway|504/i.test(lastErr)) await new Promise((r) => setTimeout(r, 4e3 * (i + 1)));
				}
			}
			if (kind === "fund") setFundRes(null);
			else setQualRes(null);
			setErr(lastErr);
		} finally {
			setBusy(null);
		}
	}
	function toggle(kind) {
		if (!compact) setPinned(true);
		if (open === kind) setOpen(null);
		else if (kind === "fund" && fundRes && fundRes.ok && skillOutputReady("fund", fundRes.text)) setOpen("fund");
		else if (kind === "qual" && qualRes && qualRes.ok && skillOutputReady("qual", qualRes.text)) setOpen("qual");
		else runFull(kind);
	}
	const fundBlock = fundRes && fundRes.ok ? fundRes.fundBlock || asFund(fundRes.text) : null;
	const qualBlock = qualRes && qualRes.ok ? qualRes.qualBlock || asQual(qualRes.text) : null;
	const setSkillRead = useKosh((s) => s.setSkillRead);
	(0, import_react.useEffect)(() => {
		if (!fundRes || !fundRes.ok || !qualRes || !qualRes.ok) return;
		if (!skillOutputReady("fund", fundRes.text) || !skillOutputReady("qual", qualRes.text)) return;
		const fb = fundRes.fundBlock || asFund(fundRes.text);
		const qb = qualRes.qualBlock || asQual(qualRes.text);
		if (!fb || !qb) return;
		const read = skillReadFrom({
			symbol,
			name: universeName(symbol),
			sector: sectorOf(symbol),
			fund: fb,
			qual: qb
		});
		setSkillRead(read);
		apiSkillPut(read).catch(() => {});
	}, [
		fundRes,
		qualRes,
		symbol,
		setSkillRead
	]);
	async function runCombine() {
		if (!fundRes || !fundRes.ok || !qualRes || !qualRes.ok) return;
		if (!skillOutputReady("fund", fundRes.text) || !skillOutputReady("qual", qualRes.text)) {
			setErr("Need both complete analyses before connecting them.");
			return;
		}
		setCombineBusy(true);
		setErr("");
		try {
			const r = await apiNote({
				kind: "combine",
				symbol,
				prior: {
					fund: fundRes.text,
					qual: qualRes.text
				}
			});
			setCombineRes(r);
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Could not connect the two skills.");
		} finally {
			setCombineBusy(false);
		}
	}
	if (Boolean(compact) && !pinned) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 rounded-lg bg-surface px-3 py-2 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => toggle("fund"),
					className: "inline-flex h-9 items-center rounded-sm bg-bg px-3 text-[13px] font-medium hover:text-chart",
					children: ["Fundamental", fundBlock?.tag ? ` · ${fundBlock.tag}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => toggle("qual"),
					className: "inline-flex h-9 items-center rounded-sm bg-bg px-3 text-[13px] font-medium hover:text-warn",
					children: ["Qualitative", qualBlock?.tag ? ` · ${qualBlock.tag}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ml-auto text-[12px] text-muted hover:text-fg",
					onClick: () => setPinned(true),
					children: "Expand"
				})
			]
		}),
		err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] text-down",
			children: err
		}) : null,
		busy && open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisSkeleton, { kicker: open === "fund" ? "fundamental analysis" : "qualitative analysis" })
		}) : null,
		open === "fund" && fundBlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundamentalView, { block: fundBlock })
		}) : null,
		open === "qual" && qualBlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualitativeView, { block: qualBlock })
		}) : null
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.14em] text-chart uppercase",
				children: "Read this name"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
				children: "Same analysis as the full fundamental and qualitative read — full prose, native final verdict, multi-bagger potential."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => toggle("fund"),
				disabled: busy === "fund",
				className: cn("group rounded-lg border-l-[4px] border-l-chart bg-surface p-5 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]", open === "fund" && "ring-1 ring-chart/40"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
						children: "Fundamental analysis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 text-[22px] font-semibold tracking-tight",
						children: "Is the company sound?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 max-w-md text-[13px] leading-snug text-muted",
						children: "Profitability, balance sheet, growth, valuation, ownership. The full fundamental read."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-accent px-4 text-[13px] font-medium text-accent-fg group-hover:opacity-90",
						children: [busy === "fund" ? "Reading…" : open === "fund" ? "Hide" : "Read the business", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => toggle("qual"),
				disabled: busy === "qual",
				className: cn("group rounded-lg border-l-[4px] border-l-warn bg-surface p-5 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]", open === "qual" && "ring-1 ring-warn/40"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold tracking-[0.14em] text-warn uppercase",
						children: "Qualitative analysis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 text-[22px] font-semibold tracking-tight",
						children: "Can it be a multi-bagger?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 max-w-md text-[13px] leading-snug text-muted",
						children: "Management, industry, brand, and an explicit multi-bagger potential — High, Moderate, Low, or Unlikely."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-accent px-4 text-[13px] font-medium text-accent-fg group-hover:opacity-90",
						children: [busy === "qual" ? "Reading…" : open === "qual" ? "Hide" : "Read the story", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
					})
				]
			})]
		}),
		err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[13px] text-down",
			children: err
		}) : null,
		busy && open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisSkeleton, { kicker: open === "fund" ? "fundamental analysis" : "qualitative analysis" })
		}) : null,
		open === "fund" && fundRes && !fundRes.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[13px] text-down",
			children: fundRes.error
		}) : null,
		open === "qual" && qualRes && !qualRes.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[13px] text-down",
			children: qualRes.error
		}) : null,
		open === "fund" && fundBlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy === "fund",
					onClick: () => void runFull("fund"),
					children: "Refresh analysis"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundamentalView, { block: fundBlock })]
		}) : null,
		open === "qual" && qualBlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy === "qual",
					onClick: () => void runFull("qual"),
					children: "Refresh analysis"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualitativeView, { block: qualBlock })]
		}) : null,
		fundBlock && qualBlock && fundRes && fundRes.ok && qualRes && qualRes.ok && skillOutputReady("fund", fundRes.text) && skillOutputReady("qual", qualRes.text) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [combineRes && combineRes.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombinedView, { text: combineRes.text }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold tracking-[0.14em] text-muted uppercase",
						children: "Connect both skills"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 text-[20px] font-semibold tracking-tight",
						children: "Combined verdict"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
						children: "Uses the two analyses above — where they agree, where they pull apart, and one final verdict. Not a third independent read."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						disabled: combineBusy,
						onClick: () => void runCombine(),
						children: combineBusy ? "Connecting…" : "Combined verdict"
					})
				]
			}), combineRes && !combineRes.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[13px] text-down",
				children: combineRes.error
			}) : null]
		}) : null
	] });
}
function PortfolioDesk({ brief }) {
	const d = useDesk();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Quality on this portfolio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
				children: "Sends today’s weights and the public prices — not quantities or cost."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				disabled: d.busy,
				onClick: () => void d.run("book", { book: brief }),
				children: d.busy ? "Reading…" : "Read this portfolio"
			})]
		}), d.err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[13px] text-down",
			children: d.err
		}) : null]
	}), d.result?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteResultView, {
		result: d.result,
		kind: "book"
	}) : null] });
}
/** @deprecated use PortfolioDesk */
var BookDesk = PortfolioDesk;
function HoldingDesk({ brief }) {
	const top = [...brief.names].sort((a, b) => b.weight - a.weight).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: "Largest holdings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-xl text-[13px] leading-relaxed text-muted",
			children: "Open a name for Fundamental and Qualitative. Public weights only — not quantities or cost."
		})]
	}), top.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2 sm:grid-cols-2",
		children: top.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/s/$symbol",
			params: { symbol: n.symbol },
			className: "flex items-center justify-between rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] hover:text-chart",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: n.symbol
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-[13px] text-muted tabular",
				children: [(n.weight * 100).toFixed(1), "%"]
			})]
		}) }, n.symbol))
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Add holdings to see them here."
	})] });
}
function clip(s, n) {
	return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
function buildDigest(title, items, extra) {
	return [
		title,
		extra || "",
		...items.slice(0, 8).map((x, i) => `${i + 1}. ${x.title}${x.publisher ? " — " + x.publisher : ""}`),
		"",
		"From Kosh"
	].filter((x, i, a) => x || i > 0 && a[i - 1]).join("\n");
}
function openShare$1(kind, subject, body, url) {
	const page = url || (typeof window !== "undefined" ? window.location.href : "");
	if (kind === "copy") {
		const text = body + (page ? `\n\n${page}` : "");
		navigator.clipboard.writeText(text).then(() => toast.success("Copied the headlines"), () => toast.error("Could not copy"));
		return;
	}
	if (kind === "whatsapp") {
		const text = clip(body + (page ? `\n${page}` : ""), 1600);
		window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer");
		return;
	}
	if (kind === "telegram") {
		const share = "https://t.me/share/url?url=" + encodeURIComponent(page || "https://grok.com") + "&text=" + encodeURIComponent(clip(body, 1200));
		window.open(share, "_blank", "noopener,noreferrer");
		return;
	}
	const mail = "mailto:?subject=" + encodeURIComponent(clip(subject, 80)) + "&body=" + encodeURIComponent(clip(body + (page ? `\n\n${page}` : ""), 1800));
	window.location.href = mail;
}
function NewsShare({ title, items, extra }) {
	if (!items.length) return null;
	const body = buildDigest(title, items, extra);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-wrap items-center gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mr-1 text-[11px] tracking-[0.06em] text-subtle uppercase",
				children: "Send latest"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
				onClick: () => openShare$1("whatsapp", title, body),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), "WhatsApp"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
				onClick: () => openShare$1("telegram", title, body),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Telegram"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
				onClick: () => openShare$1("gmail", title, body),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), "Gmail"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg",
				onClick: () => openShare$1("copy", title, body),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "Copy"]
			})
		]
	});
}
function loadSubs() {
	try {
		const raw = localStorage.getItem("kosh-news-subs");
		const v = raw ? JSON.parse(raw) : [];
		return Array.isArray(v) ? v : [];
	} catch {
		return [];
	}
}
function saveSubs(rows) {
	localStorage.setItem("kosh-news-subs", JSON.stringify(rows.slice(0, 40)));
}
function NewsAlertSetup({ scope, label, items }) {
	const [subs, setSubs] = (0, import_react.useState)([]);
	const [channel, setChannel] = (0, import_react.useState)("whatsapp");
	const [dest, setDest] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setSubs(loadSubs());
	}, []);
	const mine = subs.find((s) => s.scope === scope);
	(0, import_react.useEffect)(() => {
		if (!mine || !items.length) return;
		const newest = Math.max(...items.map((x) => x.ts || 0));
		if (!(newest > (mine.seen || 0))) return;
		const next = subs.map((s) => s.scope === scope ? {
			...s,
			seen: newest
		} : s);
		saveSubs(next);
		setSubs(next);
		const fresh = items.filter((x) => (x.ts || 0) >= newest).slice(0, 3);
		const body = buildDigest(`News · ${label}`, fresh);
		if (typeof Notification !== "undefined") {
			if (Notification.permission === "granted") new Notification(`News · ${label}`, { body: fresh[0]?.title || "New headline" });
			else if (Notification.permission === "default") Notification.requestPermission();
		}
		toast.message(`New headline on ${label}`, {
			description: fresh[0]?.title,
			action: {
				label: mine.channel === "email" ? "Mail" : mine.channel === "telegram" ? "Telegram" : "WhatsApp",
				onClick: () => openShare$1(mine.channel === "browser" ? "copy" : mine.channel === "email" ? "gmail" : mine.channel, `News · ${label}`, body)
			}
		});
	}, [
		items,
		mine?.scope,
		label
	]);
	function subscribe() {
		const next = [{
			scope,
			channel,
			dest: dest.trim(),
			seen: Math.max(0, ...items.map((x) => x.ts || 0))
		}, ...subs.filter((s) => s.scope !== scope)];
		saveSubs(next);
		setSubs(next);
		if (channel === "browser" && typeof Notification !== "undefined" && Notification.permission !== "granted") Notification.requestPermission();
		toast.success("Alerts on for " + label);
	}
	function drop() {
		const next = subs.filter((s) => s.scope !== scope);
		saveSubs(next);
		setSubs(next);
	}
	const body = buildDigest(`News · ${label}`, items);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-md bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), "News alerts"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] leading-relaxed text-muted",
				children: "When a new headline lands while you have the app open, we notify you here and you can send that alert on WhatsApp, Telegram or mail. This is not a silent carrier push."
			}),
			mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[13px]",
						children: [
							"On · ",
							mine.channel,
							mine.dest ? ` · ${mine.dest}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => openShare$1(mine.channel === "browser" ? "copy" : mine.channel === "email" ? "gmail" : mine.channel, `News · ${label}`, body),
						children: "Send latest"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: drop,
						children: "Stop"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid gap-2 sm:grid-cols-[auto_1fr_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]",
						value: channel,
						onChange: (e) => setChannel(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "whatsapp",
								children: "WhatsApp"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "telegram",
								children: "Telegram"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "email",
								children: "Email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "browser",
								children: "In-app / browser"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: channel === "email" ? "you@email" : channel === "browser" ? "Optional note" : "Number or @handle",
						value: dest,
						onChange: (e) => setDest(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: subscribe,
						children: "Alert me"
					})
				]
			})
		]
	});
}
function NewsBoard({ title, items, loading, shareTitle, extra, alertScope }) {
	const [bucket, setBucket] = (0, import_react.useState)("all");
	const shown = (0, import_react.useMemo)(() => filterNews(items || [], bucket), [items, bucket]);
	const counts = (0, import_react.useMemo)(() => {
		const map = { all: items?.length || 0 };
		for (const b of NEWS_BUCKETS) {
			if (b.id === "all") continue;
			map[b.id] = filterNews(items || [], b.id).length;
		}
		return map;
	}, [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: title || "News"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[12px] text-subtle",
			children: "Wording on the headline is not a conclusion. Material marks results, regulation, deals — not a price call."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-wrap gap-1",
			children: NEWS_BUCKETS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setBucket(b.id),
				className: cn("inline-flex h-7 items-center justify-center rounded-sm px-2 text-[11px] font-medium", bucket === b.id ? "bg-surface-2 text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
				children: [b.label, counts[b.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1 text-subtle",
					children: counts[b.id]
				}) : null]
			}, b.id))
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Fetching headlines…"
		}) : shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 grid gap-2.5",
			children: shown.slice(0, 10).map((n) => {
				const tone = newsTone(n.title);
				const mat = n.material || newsMaterial(n.title);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: n.link,
						target: "_blank",
						rel: "noreferrer",
						className: "block text-[13px] leading-snug hover:text-chart",
						children: n.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-sm px-1.5 py-0.5 font-medium", tone === "up" && "bg-up/15 text-up", tone === "down" && "bg-down/15 text-down", tone === "neutral" && "bg-surface-2 text-muted"),
								children: newsToneLabel(tone)
							}),
							mat === "high" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-warn/15 px-1.5 py-0.5 font-medium text-warn",
								children: "Material"
							}) : mat === "medium" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-surface-2 px-1.5 py-0.5",
								children: "Worth a look"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-surface-2 px-1.5 py-0.5",
								children: "Background"
							}),
							n.publisher,
							n.ts ? ` · ${(/* @__PURE__ */ new Date(n.ts * 1e3)).toISOString().slice(0, 10)}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[11px] text-muted",
						children: newsWhy(n.title)
					})
				] }, n.link + n.title);
			})
		}), alertScope ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsAlertSetup, {
			scope: alertScope,
			label: shareTitle,
			items: shown
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsShare, {
			title: shareTitle,
			items: shown,
			extra
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: items?.length ? "Nothing in this category." : "No headlines matched this name."
		})
	] });
}
function Kpi({ label, value, hint, tone, metricId }) {
	if (metricId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
		id: metricId,
		value,
		hint,
		tone
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-card rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1.5 font-mono text-[22px] font-medium tabular tracking-tight", tone === "up" && "text-up", tone === "down" && "text-down", tone === "warn" && "text-warn"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1 text-[12px] text-muted", tone === "up" && "text-up", tone === "down" && "text-down"),
				children: hint
			}) : null
		]
	});
}
function toneOf(n) {
	if (n == null || !Number.isFinite(n)) return "neutral";
	if (n > 0) return "up";
	if (n < 0) return "down";
	return "neutral";
}
var DAY = 864e5;
function isStakeNews(title) {
	const t = title.toLowerCase();
	const who = /\b(fii|diis?|foreign institutional|domestic institutional|promoters?)\b/.test(t);
	const move = /\b(stake|holding|bought|buy|sold|sell|hike|cut|increase|decrease|raised|reduced|acquired|offload|picked up|trimmed|pledge|unpledge)\b/.test(t);
	return who && move;
}
function isMovingNews(item) {
	if (isStakeNews(item.title)) return true;
	const bucket = newsBucket(item.title);
	if (bucket === "results" || bucket === "deals" || bucket === "policy") return true;
	return newsTone(item.title) !== "neutral";
}
function withinDays(iso, days, asOf = Date.now()) {
	const day = parseIstDate(iso);
	const t = day ? istDateMs(day) : Date.parse(iso.length <= 10 ? iso + "T00:00:00+05:30" : iso);
	if (t == null || !Number.isFinite(t)) return false;
	const diff = t - asOf;
	return diff >= -864e5 && diff <= days * DAY;
}
function recentTs(ts, days, asOf = Date.now()) {
	if (!ts) return false;
	const ms = ts > 0xe8d4a51000 ? ts : ts * 1e3;
	return asOf - ms <= days * DAY && asOf - ms >= -864e5;
}
function kindRank(k) {
	if (k === "results") return 0;
	if (k === "stake") return 1;
	if (k === "deal" || k === "insider") return 2;
	return 3;
}
function buildAttention(input) {
	const days = input.days ?? 7;
	const want = new Map(input.symbols.map((s) => [bareSym(s.symbol), s]));
	const out = [];
	for (const ev of input.results || []) {
		if (ev.kind === "macro") continue;
		const row = want.get(bareSym(ev.symbol));
		if (!row) continue;
		const date = parseIstDate(ev.date) || ev.date;
		if (!withinDays(date, days)) continue;
		out.push({
			id: "r:" + ev.symbol + date,
			kind: "results",
			date,
			title: ev.purpose || "Results",
			symbol: row.symbol,
			name: row.name,
			weight: row.weight,
			expected: ev.expected || void 0
		});
	}
	for (const d of input.deals || []) {
		const row = want.get(bareSym(d.symbol));
		if (!row) continue;
		const date = parseIstDate(d.date) || d.date;
		if (!withinDays(date, days)) continue;
		out.push({
			id: "d:" + d.kind + d.symbol + date + d.note.slice(0, 24),
			kind: d.kind === "insider" ? "insider" : "deal",
			date,
			title: d.note,
			symbol: row.symbol,
			name: row.name,
			weight: row.weight
		});
	}
	for (const pack of input.news || []) {
		const row = want.get(bareSym(pack.symbol)) || input.symbols.find((s) => bareSym(s.symbol) === bareSym(pack.symbol));
		if (!row) continue;
		for (const n of pack.items || []) {
			if (!recentTs(n.ts, days) && n.ts) continue;
			if (!isMovingNews(n) && !isStakeNews(n.title)) continue;
			const stake = isStakeNews(n.title);
			out.push({
				id: "n:" + (n.link || n.title).slice(0, 80),
				kind: stake ? "stake" : "news",
				date: n.ts ? new Date(n.ts > 0xe8d4a51000 ? n.ts : n.ts * 1e3).toISOString().slice(0, 10) : "",
				title: n.title,
				symbol: row.symbol,
				name: row.name,
				weight: row.weight,
				href: n.link
			});
		}
	}
	const seen = /* @__PURE__ */ new Set();
	const uniq = [];
	for (const it of out.sort((a, b) => kindRank(a.kind) - kindRank(b.kind) || (b.weight || 0) - (a.weight || 0))) {
		const k = it.kind + bareSym(it.symbol || "") + it.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").slice(0, 48);
		if (seen.has(k)) continue;
		seen.add(k);
		uniq.push(it);
		if (uniq.length >= 12) break;
	}
	return uniq;
}
function attentionWeight(items, kind = "results") {
	const set = /* @__PURE__ */ new Set();
	let w = 0;
	for (const it of items) {
		if (it.kind !== kind) continue;
		const k = bareSym(it.symbol || "");
		if (!k || set.has(k)) continue;
		set.add(k);
		w += it.weight || 0;
	}
	return {
		n: set.size,
		weight: w
	};
}
function openShare(kind, subject, body) {
	const page = typeof window !== "undefined" ? window.location.href : "";
	if (kind === "whatsapp") {
		window.open("https://wa.me/?text=" + encodeURIComponent((body + "\n" + page).slice(0, 1600)), "_blank", "noopener,noreferrer");
		return;
	}
	if (kind === "telegram") {
		window.open("https://t.me/share/url?url=" + encodeURIComponent(page || "https://grok.com") + "&text=" + encodeURIComponent(body.slice(0, 1200)), "_blank", "noopener,noreferrer");
		return;
	}
	window.location.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}
function kindLabel(k) {
	if (k === "results") return "Results";
	if (k === "stake") return "Stake";
	if (k === "deal") return "Deal";
	if (k === "insider") return "Insider";
	return "News";
}
function AttentionStrip({ symbols, title = "Near-term triggers" }) {
	const key = symbols.map((s) => s.symbol).join(",");
	const macro = useQuery({
		queryKey: ["macro"],
		queryFn: apiMacro,
		staleTime: 48e4
	});
	const news = useQuery({
		queryKey: ["attention-news", key],
		queryFn: async () => {
			const top = symbols.slice(0, 8);
			const lists = await Promise.all(top.map((s) => apiNews(s.symbol, s.name).catch(() => [])));
			return top.map((s, i) => ({
				symbol: s.symbol,
				items: lists[i] || []
			}));
		},
		staleTime: 3e5,
		enabled: symbols.length > 0
	});
	const items = (0, import_react.useMemo)(() => buildAttention({
		symbols,
		results: macro.data?.results,
		deals: macro.data?.deals,
		news: news.data,
		days: 7
	}), [
		symbols,
		macro.data,
		news.data
	]);
	const results = attentionWeight(items, "results");
	const digest = buildDigest(title, items.map((it) => ({ title: `${it.name || it.symbol || ""} · ${it.title}` })));
	if (!symbols.length) return null;
	if (!items.length && (macro.isPending || news.isPending)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] text-muted",
			children: "Checking results, deals and moving headlines…"
		})]
	});
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border-l-[4px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-warn uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-[13px] text-muted",
					children: results.n ? `${results.n} name${results.n === 1 ? "" : "s"} reporting · ${(results.weight * 100).toFixed(0)}% of the portfolio` : "Headlines and deals that can move a name you hold."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => openShare("whatsapp", title, digest),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), "WhatsApp"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => openShare("telegram", title, digest),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Telegram"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => openShare("gmail", title, digest),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), "Mail"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2",
				children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] leading-snug",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase", it.kind === "results" ? "bg-chart/15 text-chart" : it.kind === "stake" ? "bg-warn/20 text-warn" : "bg-surface-2 text-muted"),
							children: kindLabel(it.kind)
						}),
						it.symbol ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
							symbol: it.symbol,
							name: it.name,
							className: "font-medium"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: it.name
						}),
						it.weight != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular text-subtle",
							children: [(it.weight * 100).toFixed(0), "%"]
						}) : null,
						it.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: it.href,
							target: "_blank",
							rel: "noreferrer",
							className: "min-w-0 text-muted hover:text-fg",
							children: it.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: it.title
						}),
						it.expected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-warn/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-warn uppercase",
							children: "Expected"
						}) : null,
						it.date ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular text-subtle",
							children: formatIstShort(it.date)
						}) : null
					]
				}, it.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11px] text-subtle",
				children: "Send opens WhatsApp or Telegram with this list. Not a silent text to your phone."
			})
		]
	});
}
//#endregion
export { NewsBoard as a, toneOf as c, Kpi as i, BookDesk as n, NoteDesk as o, HoldingDesk as r, ProseNote as s, AttentionStrip as t };
