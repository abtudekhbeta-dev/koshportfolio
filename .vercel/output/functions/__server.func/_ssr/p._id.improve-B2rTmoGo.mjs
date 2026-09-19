import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Jt as Tooltip, Nn as useKosh, Ot as bookXirr, Qt as asQual, Rn as cn, Sn as Button, Yt as asFund, _ as skillPass, at as fmtInr, b as skillReadMerge, g as skillOf, ht as pickMaterialLevers, ln as skillOutputReady, ot as fmtPct, v as skillPeek } from "./router-COGOfPBd.mjs";
import { c as apiNote, h as apiSkillPut } from "./api-DtVFWAsH.mjs";
import { t as StockLink } from "./stock-link-ClZslyKN.mjs";
import { t as METRICS } from "./metrics-C9sJUj_k.mjs";
import { s as SkillMarkdown } from "./analysis-view-DXQzR6WJ.mjs";
import { i as ShareRing, r as MiniBars } from "./share-ring-Di5XIyOX.mjs";
import { n as useBookCtx } from "./book-context-B8L45u36.mjs";
import { r as sameBusinessPiles } from "./peers-W1QrnXEK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id.improve-B2rTmoGo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Scan both skills to completion (retries + second pass), then one portfolio verdict. */
var looping = false;
var loopId = "";
function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
function namesWithReads(targets) {
	const reads = useKosh.getState().skillReads;
	return targets.map((r) => {
		const s = skillPeek(reads, r.symbol);
		return {
			symbol: r.symbol,
			weight: r.weight,
			sector: r.sector || "Other",
			fundTag: s?.fundTag,
			fundRating: s?.fundRating,
			fundVerdict: s?.fundVerdict,
			qualTag: s?.qualTag,
			qualPotential: s?.qualPotential,
			qualVerdict: s?.qualVerdict
		};
	});
}
function coverage(targets) {
	const reads = useKosh.getState().skillReads;
	return {
		nRead: targets.filter((r) => skillOf(reads, r.symbol)).length,
		nTotal: targets.length
	};
}
function missingSides(r) {
	const s = skillPeek(useKosh.getState().skillReads, r.symbol);
	const sides = [];
	if (!s?.fundTag) sides.push("fund");
	if (!s?.qualTag) sides.push("qual");
	return sides;
}
async function writeVerdict(input) {
	const r = await apiNote({
		kind: "improve",
		book: {
			name: input.name,
			bench: input.bench,
			names: namesWithReads(input.targets)
		},
		fresh: input.fresh
	});
	if (!r.ok) return r;
	const { nRead, nTotal } = coverage(input.targets);
	useKosh.getState().setBookNote(input.portfolioId, {
		text: r.text,
		at: Date.now(),
		nRead,
		nTotal
	});
	return r;
}
async function persistSide(r, side, pack) {
	if (!pack.ok || !pack.text || !skillOutputReady(side, pack.text)) return false;
	const fund = side === "fund" ? pack.fundBlock || asFund(pack.text) : null;
	const qual = side === "qual" ? pack.qualBlock || asQual(pack.text) : null;
	if (side === "fund" && !fund) return false;
	if (side === "qual" && !qual) return false;
	const existing = skillPeek(useKosh.getState().skillReads, r.symbol);
	const read = skillReadMerge(existing, {
		symbol: r.symbol,
		name: r.name,
		sector: r.sector,
		fund,
		qual
	});
	useKosh.getState().setSkillRead(read);
	if (read.fundTag && read.qualTag) apiSkillPut(read).catch(() => {});
	return true;
}
async function runSide(r, kind, fresh) {
	const delays = [
		0,
		2800,
		6500
	];
	for (let i = 0; i < delays.length; i++) {
		if (delays[i]) await sleep(delays[i]);
		try {
			const pack = await apiNote({
				kind,
				symbol: r.symbol,
				fresh
			});
			if (await persistSide(r, kind, pack)) return true;
			if (!pack.ok && /Too many reads|429/i.test(pack.error || "")) await sleep(18e3);
		} catch (e) {
			const msg = e instanceof Error ? e.message : "";
			if (/Busy|Too many|429|took too long|Retry|Gateway|504/i.test(msg)) await sleep(i === 0 ? 4e3 : 9e3);
		}
	}
	return false;
}
async function runPair(r, fresh, force) {
	const need = force ? ["fund", "qual"] : missingSides(r);
	if (!need.length) return;
	if (need.length === 2) await Promise.all([runSide(r, "fund", fresh), runSide(r, "qual", fresh)]);
	else await runSide(r, need[0], fresh);
	const still = missingSides(r);
	for (const side of still) {
		await sleep(2500);
		await runSide(r, side, fresh);
	}
}
function isImproveLooping(portfolioId) {
	if (!looping) return false;
	if (!useKosh.getState().improveRun) {
		looping = false;
		loopId = "";
		return false;
	}
	if (!portfolioId) return looping;
	return loopId === portfolioId;
}
async function mapPool(items, n, fn) {
	let i = 0;
	const workers = Array.from({ length: Math.min(Math.max(1, n), items.length || 1) }, async () => {
		while (i < items.length) {
			const idx = i++;
			await fn(items[idx], idx);
		}
	});
	await Promise.all(workers);
}
async function startImprove(input) {
	if (looping && loopId === input.portfolioId && !input.force) return { ok: true };
	if (looping && loopId === input.portfolioId && input.force) looping = false;
	looping = true;
	loopId = input.portfolioId;
	const setRun = useKosh.getState().setImproveRun;
	const fresh = input.force ? Date.now() : void 0;
	try {
		const first = input.force ? input.targets : input.targets.filter((r) => !skillOf(useKosh.getState().skillReads, r.symbol));
		async function scan(list, passLabel, force) {
			if (!list.length) return;
			setRun({
				portfolioId: input.portfolioId,
				done: 0,
				total: list.length,
				name: list[0].name,
				stage: "scan",
				skill: "both"
			});
			let done = 0;
			await mapPool(list, 3, async (r) => {
				setRun({
					portfolioId: input.portfolioId,
					done,
					total: list.length,
					name: `${r.name}${passLabel}`,
					stage: "scan",
					skill: "both"
				});
				try {
					await runPair(r, fresh, force);
				} catch {}
				done += 1;
				setRun({
					portfolioId: input.portfolioId,
					done,
					total: list.length,
					name: r.name,
					stage: "scan",
					skill: "both"
				});
			});
		}
		await scan(first, "", input.force);
		const incomplete = input.targets.filter((r) => missingSides(r).length);
		if (incomplete.length) await scan(incomplete, " — finishing both skills", false);
		setRun({
			portfolioId: input.portfolioId,
			done: input.targets.length,
			total: Math.max(input.targets.length, 1),
			name: input.name,
			stage: "verdict"
		});
		const verdict = await writeVerdict({
			...input,
			fresh: fresh || Date.now()
		});
		if (!verdict.ok && !useKosh.getState().bookNotes[input.portfolioId]) return {
			ok: false,
			error: verdict.error
		};
		if (!verdict.ok) setRun({
			portfolioId: input.portfolioId,
			done: input.targets.length,
			total: Math.max(input.targets.length, 1),
			name: input.name,
			stage: "verdict",
			error: verdict.error
		});
		return { ok: true };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Could not run. Try again."
		};
	} finally {
		looping = false;
		loopId = "";
		useKosh.getState().setImproveRun(null);
	}
}
var MONTH_MS = 3024e6;
function fmtWhen(at) {
	return new Date(at).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function Improve() {
	const { query, portfolio } = useBookCtx();
	const book = query.data;
	const reads = useKosh((s) => s.skillReads);
	const stored = useKosh((s) => s.bookNotes[portfolio.id]);
	const run = useKosh((s) => s.improveRun);
	const mine = run?.portfolioId === portfolio.id ? run : null;
	const rows = book.rows.filter((r) => book.includeCommodities || r.kind !== "commodity");
	const x = (0, import_react.useMemo)(() => bookXirr(rows.map((r) => {
		const h = portfolio.holdings.find((z) => z.symbol === r.symbol);
		return {
			date: h?.date || null,
			boughtAt: h?.boughtAt || null,
			qty: r.qty,
			avg: r.avg,
			px: r.px,
			value: r.value,
			lots: h?.lots
		};
	}), true), [rows, portfolio.holdings]);
	const top = [...rows].sort((a, b) => b.weight - a.weight);
	const heavy = top.filter((r) => r.weight >= .18);
	const targets = top.filter((r) => r.kind !== "commodity").slice(0, 20);
	const sectorHits = Object.entries(book.sectors).map(([k, v]) => ({
		k,
		w: v.value / (book.value || 1)
	})).filter((s) => s.w >= .35).sort((a, b) => b.w - a.w);
	const passOf = (symbol) => skillPass(skillOf(reads, symbol));
	const strongHeavy = heavy.filter((r) => passOf(r.symbol).both);
	const weakHeavy = heavy.filter((r) => {
		const s = skillOf(reads, r.symbol);
		return s ? !skillPass(s).both : false;
	});
	const unreadHeavy = heavy.filter((r) => r.kind !== "commodity" && !skillOf(reads, r.symbol));
	const weakSkills = top.slice(0, 12).flatMap((r) => {
		const s = skillOf(reads, r.symbol);
		if (!s) return [];
		if (skillPass(s).both) return [];
		return [{
			symbol: r.symbol,
			name: r.name,
			why: s.fundVerdict || s.qualVerdict || s.fundTag
		}];
	});
	const missingSkills = targets.filter((r) => !skillOf(reads, r.symbol));
	const readCount = targets.filter((r) => skillOf(reads, r.symbol)).length;
	const strongWeight = targets.filter((r) => passOf(r.symbol).both).reduce((s, r) => s + r.weight, 0);
	const weakWeight = targets.filter((r) => {
		const s = skillOf(reads, r.symbol);
		return s && !skillPass(s).both;
	}).reduce((s, r) => s + r.weight, 0);
	const niftyOverlap = top.filter((r) => r.weight < .04).length >= Math.max(6, Math.round(top.length * .6));
	const themes = /* @__PURE__ */ new Map();
	for (const r of top) {
		const k = r.sector || "Other";
		const cur = themes.get(k) || [];
		cur.push(r);
		themes.set(k, cur);
	}
	const overlapTheme = [...themes.entries()].find(([, list]) => list.length >= 3 && list.reduce((s, x) => s + x.weight, 0) >= .28);
	const material = pickMaterialLevers(book.levers || [], 5);
	const piles = (0, import_react.useMemo)(() => sameBusinessPiles(top, book.corr), [top, book.corr]);
	const bullets = [];
	if (strongHeavy.length) bullets.push({
		tone: "up",
		t: `${strongHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — both skills pass. Size here is the bet, not a defect.`
	});
	if (weakHeavy.length) bullets.push({
		tone: "down",
		t: `${weakHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — large, and the skills do not back them.`
	});
	if (unreadHeavy.length) bullets.push({
		tone: "muted",
		t: `${unreadHeavy.map((h) => `${h.name} (${(h.weight * 100).toFixed(0)}%)`).join(", ")} — no skill read yet.`
	});
	if (!heavy.length) bullets.push({
		tone: "up",
		t: "No single name is above 18%. Size is spread."
	});
	if (sectorHits.length) {
		const hit = sectorHits[0];
		const names = (themes.get(hit.k) || []).slice(0, 6);
		const qualityCluster = names.length > 0 && names.filter((r) => passOf(r.symbol).both).length >= Math.ceil(names.length * .6);
		bullets.push({
			tone: qualityCluster ? "up" : names.some((r) => skillOf(reads, r.symbol) && !passOf(r.symbol).both) ? "down" : "muted",
			t: qualityCluster ? `${hit.k} is ${(hit.w * 100).toFixed(0)}% — a cluster of names both skills back, not a random pile.` : `${hit.k} is ${(hit.w * 100).toFixed(0)}% of value${names.some((r) => skillOf(reads, r.symbol) && !passOf(r.symbol).both) ? " and some of those names fail the skills." : "."}`
		});
	}
	if (overlapTheme && !sectorHits.some((s) => s.k === overlapTheme[0])) {
		const list = overlapTheme[1];
		const qualityCluster = list.filter((r) => passOf(r.symbol).both).length >= Math.ceil(list.length * .6);
		bullets.push({
			tone: qualityCluster ? "up" : "down",
			t: qualityCluster ? `${overlapTheme[0]} has ${list.length} names doing similar work — and they pass. That is a theme, not an accident.` : `${overlapTheme[0]} has ${list.length} names doing similar work. One shock hits all of them.`
		});
	}
	if (piles.length) bullets.push({
		tone: "muted",
		t: piles.map((p) => `${p.line}: ${p.names.map((n) => n.symbol).join(", ")} (min corr ${(p.minCorr * 100).toFixed(0)}%)`).join(" · ") + " — same business, moving together. Not a skill call."
	});
	if (niftyOverlap) bullets.push({
		tone: "muted",
		t: "Many small weights — this can look like the index with extra cost. The large names are the actual bet."
	});
	if (x.xirr != null) bullets.push({
		tone: x.xirr >= 12 ? "up" : "muted",
		t: `Your XIRR ${x.xirr.toFixed(1)}% from ${x.from || "first buy"} — money-weighted, not the mix chart.`
	});
	else if (x.nMissing) bullets.push({
		tone: "muted",
		t: `${x.nMissing} lines have no buy date — XIRR is waiting on dates.`
	});
	if (weakSkills.length && !weakHeavy.length) bullets.push({
		tone: "down",
		t: `Skills do not back: ${weakSkills.map((w) => w.symbol).join(", ")}.`
	});
	if (missingSkills.length > unreadHeavy.length) bullets.push({
		tone: "muted",
		t: `${missingSkills.length} names have no stock-page read yet. Run analysis — leftover names scan in the background.`
	});
	const rec = !stored && !readCount ? "Run analysis for a verdict on this portfolio as a whole — not a loop of stock essays." : weakHeavy.length ? `Size is sitting on names the skills do not back (${weakHeavy.map((h) => h.symbol).join(", ")}). Cut or wait — don’t add more of the same.` : strongWeight >= .45 && weakWeight < .12 ? strongHeavy.length ? `${strongHeavy[0].name} and the other large lines are names both skills back. Concentration here is the opportunity, not a defect.` : "The portfolio is quality-led. Keep feeding the names that already pass both skills." : weakWeight >= .18 ? `Capital is sitting in names the skills do not back. Size those down before adding anything new.` : missingSkills.length && stored ? "Verdict is saved. Remaining names are scanning in the background." : missingSkills.length ? "Some weights still have no skill read. Run analysis — the first pass is the whole portfolio." : material.length ? `The structure is workable. Size follows quality — the material lever is ${material[0].label.toLowerCase()} ${material[0].name}.` : "The structure is workable. Size follows quality: add to names that pass both skills, don’t trim a compounder just because it is large. Not advice.";
	const [runErr, setRunErr] = (0, import_react.useState)("");
	const busy = Boolean(mine) && isImproveLooping(portfolio.id);
	const scanning = mine?.stage === "scan";
	const stale = Boolean(stored && Date.now() - stored.at > MONTH_MS);
	async function onRun() {
		setRunErr("");
		const r = await startImprove({
			portfolioId: portfolio.id,
			name: portfolio.name,
			bench: book.benchName,
			force: Boolean(stored),
			targets: targets.map((t) => ({
				symbol: t.symbol,
				name: t.name,
				weight: t.weight,
				sector: t.sector || "Other"
			}))
		});
		if (!r.ok) setRunErr(r.error);
	}
	const sectorList = Object.entries(book.sectors).map(([name, s]) => ({
		name,
		pct: book.value ? s.value / book.value * 100 : 0
	})).sort((a, b) => b.pct - a.pct);
	const scanTotal = mine?.total || 0;
	const scanDone = mine?.done || 0;
	const pctDone = scanTotal ? Math.round(scanDone / scanTotal * 100) : mine?.stage === "verdict" ? 8 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "kosh-page grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border-l-[4px] border-l-chart bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
						children: "Recommendation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-[22px] font-semibold tracking-tight",
						children: rec
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-muted",
						children: "From this portfolio’s weights, dated XIRR, same-business pile-up, and the skills as one input — not the only one. Size on a name both skills back is an opportunity. Not a buy list."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-2",
						children: bullets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2 text-[14px] leading-snug",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5 shrink-0 rounded-full", b.tone === "up" && "bg-up", b.tone === "down" && "bg-down", b.tone === "muted" && "bg-subtle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.t })]
						}, b.t))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 lg:grid-cols-3",
				children: [
					x.xirr != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
								children: "Your XIRR"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-[22px] tabular",
								children: [x.xirr.toFixed(1), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[12px] text-muted",
								children: [
									x.nDated,
									" dated lines · from ",
									x.from
								]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
							children: "Your XIRR"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[13px] text-muted",
							children: [
								"Add buy dates to unlock this.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/p/$id/holdings",
									params: { id: portfolio.id },
									className: "text-chart hover:underline",
									children: "Holdings"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
								children: "Largest name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[18px] font-semibold",
								children: top[0]?.name || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-[12px] text-muted",
								children: [top[0] ? fmtPct(top[0].weight * 100) : "", top[0] && skillOf(reads, top[0].symbol) ? ` · ${skillOf(reads, top[0].symbol).fundTag} / ${skillOf(reads, top[0].symbol).qualTag}` : ""]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
								children: "Portfolio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 font-mono text-[22px] tabular",
								children: fmtInr(book.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[12px] text-muted",
								children: [
									rows.length,
									" lines vs ",
									book.benchName,
									targets.length ? ` · ${readCount}/${targets.length} skill reads` : ""
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Sectors"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareRing, { items: sectorList })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Largest weights"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBars, { items: top.slice(0, 6).map((r) => ({
							name: r.name,
							sub: r.symbol,
							symbol: r.symbol,
							value: r.weight * 100,
							label: (r.weight * 100).toFixed(1) + "%",
							tone: passOf(r.symbol).both ? "up" : r.weight >= .18 && skillOf(reads, r.symbol) ? "down" : "muted"
						})) })
					})]
				})]
			}),
			piles.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
						children: "Same-business pile-up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-[13px] text-muted",
						children: "Same line of business and they moved together at least 50% over the last year. Skills do not decide this — it is a structure fact. A quality cluster is not automatically a cut."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-3",
						children: piles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] font-semibold tracking-[0.06em] text-subtle uppercase",
							children: [
								p.line,
								" · min corr ",
								(p.minCorr * 100).toFixed(0),
								"%"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]",
							children: p.names.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-baseline gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockLink, {
									symbol: n.symbol,
									name: n.name,
									className: "font-medium"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular text-muted",
									children: [(n.weight * 100).toFixed(1), "%"]
								})]
							}, n.symbol))
						})] }, p.line + p.names.map((n) => n.symbol).join(",")))
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
							children: "Portfolio analysis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xl text-[13px] text-muted",
							children: "One pass on the whole portfolio. Both skills run on each name, then one verdict. Names already read on a stock page are reused. Keep this tab open. Prefer once a month."
						}),
						stored ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("mt-1 text-[12px]", stale ? "text-warn" : "text-subtle"),
							children: [
								"Last run ",
								fmtWhen(stored.at),
								stale ? " — a monthly refresh is due." : ". Prefer once a month.",
								` · ${stored.nRead}/${stored.nTotal} names with both skills.`
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] text-subtle",
							children: "Prefer once a month. The verdict is stored so you don’t rerun it."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: busy || !targets.length,
						onClick: () => void onRun(),
						children: mine?.stage === "verdict" ? "Writing verdict…" : scanning ? "Scanning both skills…" : stored ? "Refresh analysis" : "Run analysis on the portfolio"
					})]
				}),
				mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2 text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [mine.stage === "verdict" ? "Writing verdict…" : `${mine.name} — both skills`, scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " · you can leave this page"
						}) : null] }), scanning || mine.stage === "refresh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular text-muted",
							children: [
								scanDone,
								" / ",
								scanTotal
							]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-chart transition-[width] duration-300",
							style: { width: `${Math.min(100, pctDone)}%` }
						})
					})]
				}) : null,
				runErr || mine?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-[13px] text-down",
					children: runErr || mine?.error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-lg bg-surface shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "kosh-table w-full text-left text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-semibold",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-semibold",
									children: "Weight"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-semibold",
									children: "Fundamental"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-semibold",
									children: "Qualitative"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: targets.map((r) => {
							const s = skillPeek(reads, r.symbol);
							const running = Boolean(mine && mine.stage === "scan" && mine.name === r.name);
							const fundTone = s?.fundTag ? s.fundRating === "pass" ? "text-up" : "text-down" : "text-muted";
							const qualTone = s?.qualTag ? s.qualPotential === "yes" ? "text-up" : "text-down" : "text-muted";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/s/$symbol",
										params: { symbol: r.symbol },
										className: "font-medium hover:text-chart",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-subtle",
										children: r.symbol
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 font-mono tabular",
									children: [(r.weight * 100).toFixed(1), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2", fundTone),
									children: s?.fundTag || (running ? "Scanning…" : "Not run")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2", qualTone),
									children: s?.qualTag || (running ? "Scanning…" : "Not run")
								})
							] }, r.symbol);
						}) })]
					})
				}),
				stored?.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: "mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillMarkdown, {
						text: stored.text,
						color: true
					})
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Moves that change the scores"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-3 max-w-2xl text-[13px] text-muted",
					children: "Same 1-year path as Risk. One action per name, improving moves first. Green = the score improves, red = it worsens. These are historical scores — future returns and metrics can differ."
				}),
				material.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: material.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeverCard, { l }, l.symbol + l.action))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-muted",
					children: "No single name moves the scores enough to list. That is a good sign."
				})
			] })
		]
	});
}
function LeverCard({ l }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "grid gap-3 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)] sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] tracking-[0.08em] text-subtle uppercase",
					children: l.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 truncate font-medium",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$symbol",
						params: { symbol: l.symbol },
						className: "hover:text-chart",
						children: l.name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-mono text-[12px] text-muted tabular",
					children: [(l.weight * 100).toFixed(1), "%"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-1 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
					metricId: "sharpe",
					n: l.dSharpe,
					digits: 2,
					better: 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
					metricId: "maxDd",
					n: l.dMaxDd,
					digits: 1,
					better: 1,
					suffix: "pp"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
					metricId: "vol",
					n: l.dVol,
					digits: 1,
					better: -1,
					suffix: "pp"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
					metricId: "cagr",
					n: l.dCagr,
					digits: 1,
					better: 1,
					suffix: "pp"
				})
			]
		})]
	});
}
function Delta({ metricId, n, digits, better, suffix }) {
	const m = METRICS[metricId];
	if (n == null || !Number.isFinite(n)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {});
	const good = better === 1 ? n > .005 : n < -.005;
	const bad = better === 1 ? n < -.005 : n > .005;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
		content: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-xs p-0.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: m.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12px] leading-snug text-muted",
					children: m.hover
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[12px] leading-snug text-muted",
					children: m.short
				})
			]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: cn("w-full rounded-sm px-1 py-1.5 text-center", good && "bg-up/15 text-up", bad && "bg-down/15 text-down", !good && !bad && "text-muted"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] tracking-[0.06em] text-subtle uppercase",
				children: m.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 font-mono text-[13px] tabular",
				children: [
					n >= 0 ? "+" : "",
					n.toFixed(digits),
					suffix ? suffix : ""
				]
			})]
		})
	});
}
//#endregion
export { Improve as component };
