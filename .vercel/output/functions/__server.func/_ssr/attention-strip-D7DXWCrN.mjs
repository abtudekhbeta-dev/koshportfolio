import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as Mail, I as Bell, u as Send, x as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as newsTone, M as formatIstShort, N as istDateMs, P as parseIstDate, Qn as cn, T as newsBucket, lt as bareSym, sn as Button } from "./router-BWv3yT6z.mjs";
import { o as apiMacro, s as apiNews } from "./api-DtVFWAsH.mjs";
import { t as StockLink } from "./stock-link-ClZslyKN.mjs";
import { n as MetricCard } from "./metric-Cca2X1Z3.mjs";
import { s as buildDigest } from "./note-desk-DNFp9vkL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/attention-strip-D7DXWCrN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
export { Kpi as n, toneOf as r, AttentionStrip as t };
