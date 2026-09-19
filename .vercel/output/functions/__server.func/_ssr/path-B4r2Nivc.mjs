import { $ as monthBuckets, Gn as baseSym, Hn as tradeHasClock, Un as tradeMs, Vn as sortTrades, X as istDay, ht as xirrFromFlows, it as riskMetrics, pt as ytdReturn, ut as windowReturn } from "./router-CuH7ax2z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/path-B4r2Nivc.js
/** Your path: point-in-time holdings from the trade file, marked to market each session.
* Mix is today's remaining names replayed. This is what you actually held. */
function pxOf(b, raw) {
	if (raw && b.raw != null && b.raw > 0) return b.raw;
	return b.c;
}
function toDayMap(bars, raw) {
	const m = /* @__PURE__ */ new Map();
	for (const b of bars || []) {
		const px = pxOf(b, raw);
		if (!(px > 0)) continue;
		m.set(istDay(b.t), {
			t: b.t,
			c: px
		});
	}
	return m;
}
function yearFrac(from, to) {
	const a = Date.parse(from + "T00:00:00Z");
	const b = Date.parse(to + "T00:00:00Z");
	if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
	return (b - a) / 315576e5;
}
function emptyPath(partial = {}) {
	return {
		nav: [],
		xirr: null,
		twr: null,
		twrCagr: null,
		benchTwr: null,
		sameCashLast: null,
		sameCashXirr: null,
		wealthNow: 0,
		from: null,
		to: null,
		closed: [],
		stillHeld: [],
		neverSoldLast: null,
		contrib: [],
		years: [],
		events: [],
		missing: [],
		used: [],
		coverage: "0 trades",
		nTrades: 0,
		nBuys: 0,
		nSells: 0,
		nUndated: 0,
		splitNote: false,
		filledPrices: [],
		snapshots: [],
		byName: [],
		windows: {},
		months: [],
		risk: null,
		...partial
	};
}
function markLots(lots, lastPx) {
	let wealth = 0;
	let names = 0;
	for (const [sym, list] of lots) {
		const qty = list.reduce((s, l) => s + l.qty, 0);
		const px = lastPx[sym];
		if (!(qty > 1e-8) || !(px > 0)) continue;
		wealth += qty * px;
		names += 1;
	}
	return {
		wealth,
		names
	};
}
function pxOnOrNear(map, day) {
	const hit = map.get(day);
	if (hit && hit.c > 0) return {
		px: hit.c,
		sessionDay: day
	};
	const days = [...map.keys()].sort();
	const after = days.find((d) => d >= day);
	if (after) {
		const h = map.get(after);
		if (h && h.c > 0) return {
			px: h.c,
			sessionDay: after
		};
	}
	for (let i = days.length - 1; i >= 0; i--) if (days[i] < day) {
		const h = map.get(days[i]);
		if (h && h.c > 0) return {
			px: h.c,
			sessionDay: days[i]
		};
	}
	return null;
}
function addCalendarDays(day, n) {
	const [y, m, d] = (day || "").split("-").map(Number);
	if (!y || !m || !d) return day;
	return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function postSaleMove(map, sellDay, sellPx, days) {
	if (!map || !(sellPx > 0) || !sellDay) return null;
	const target = addCalendarDays(sellDay, days);
	const hit = pxOnOrNear(map, target);
	if (!hit || !(hit.px > 0) || hit.sessionDay <= sellDay) return null;
	if (Math.abs(Date.parse(hit.sessionDay + "T00:00:00Z") - Date.parse(target + "T00:00:00Z")) > 10368e5) return null;
	return (hit.px / sellPx - 1) * 100;
}
/**
* When a buy/sell has a date but no price, use that day’s close (raw when we have it).
* No minute print — even if the file has a time, we say so.
*/
function fillTradePrices(trades, histories) {
	const maps = {};
	const filled = [];
	const out = [];
	for (const t of trades || []) {
		if (t.price > 0 || !t.date || !(t.qty > 0)) {
			out.push(t);
			continue;
		}
		const sym = baseSym(t.symbol);
		if (!maps[sym]) {
			const bars = histories[sym] || histories[t.symbol] || histories[baseSym(sym)] || [];
			maps[sym] = toDayMap(bars, true);
			if (![...maps[sym].values()].some((v) => v.c > 0)) maps[sym] = toDayMap(bars, false);
		}
		const hit = pxOnOrNear(maps[sym], t.date);
		if (!hit) {
			out.push(t);
			continue;
		}
		filled.push({
			symbol: sym,
			name: t.name || sym,
			date: t.date,
			price: hit.px,
			sessionDay: hit.sessionDay,
			method: "day-close",
			hadTime: tradeHasClock(t)
		});
		out.push({
			...t,
			price: hit.px,
			priceFilled: true
		});
	}
	return {
		trades: out,
		filled
	};
}
/**
* Replay buys and sells in date order. Wealth is remaining quantity × that day's print.
* Same-money index buys/sells rupees on the same days. TWR compounds market moves between cash flows.
* livePx restamps the last day so today's path rupees can match this mix when quantities match.
*/
function buildPath(trades, histories, benchBars, asOf = Date.now(), livePx) {
	const all = trades || [];
	const datedRaw = all.filter((t) => t.date && t.qty > 0 && (t.side === 1 || t.side === -1));
	const nUndated = all.length - datedRaw.length;
	if (!datedRaw.length) return emptyPath({
		nTrades: all.length,
		nUndated,
		coverage: nUndated ? `${nUndated} trade${nUndated === 1 ? "" : "s"} with no date` : "0 trades"
	});
	const { trades: dated, filled: filledPrices } = fillTradePrices(datedRaw, histories);
	const sorted = sortTrades(dated);
	const byDay = /* @__PURE__ */ new Map();
	for (const t of sorted) {
		const d = t.date;
		const list = byDay.get(d) || [];
		list.push(t);
		byDay.set(d, list);
	}
	const symbols = [...new Set(sorted.map((t) => baseSym(t.symbol)))];
	const maps = {};
	const missing = [];
	const used = [];
	let splitNote = false;
	for (const s of symbols) {
		const bars = histories[s] || histories[baseSym(s)] || [];
		if (bars.length >= 2) {
			used.push(s);
			maps[s] = toDayMap(bars, true);
			const adj = toDayMap(bars, false);
			let seen = 0;
			for (const [day, raw] of maps[s]) {
				const a = adj.get(day);
				if (a && raw.c > 0 && a.c > 0 && Math.abs(raw.c / a.c - 1) > .04) seen += 1;
			}
			if (seen > 8) splitNote = true;
		} else missing.push(s);
	}
	const benchMap = toDayMap(benchBars, false);
	const days = /* @__PURE__ */ new Set();
	for (const m of Object.values(maps)) for (const d of m.keys()) days.add(d);
	for (const d of byDay.keys()) days.add(d);
	const ordered = [...days].sort();
	const firstTradeDay = sorted[0].date;
	const startIdx = ordered.findIndex((d) => d >= firstTradeDay);
	const slice = startIdx >= 0 ? ordered.slice(startIdx) : ordered;
	if (!slice.length) return emptyPath({
		nTrades: sorted.length,
		nBuys: sorted.filter((t) => t.side > 0).length,
		nSells: sorted.filter((t) => t.side < 0).length,
		nUndated,
		missing,
		used,
		splitNote,
		coverage: `0 days · ${missing.length} names with no price`
	});
	const lots = /* @__PURE__ */ new Map();
	const closed = [];
	const lastPx = {};
	const events = [];
	const buyLots = [];
	let buyId = 0;
	const nav = [];
	const flows = [];
	const sameFlows = [];
	let niftyUnits = 0;
	let twr = 1;
	let sameTwr = 1;
	let prevWealth = 0;
	let prevSame = 0;
	let lastT = 0;
	const neverLots = /* @__PURE__ */ new Map();
	const neverPx = {};
	const yearAcc = {};
	const snapshots = [];
	function applySide(store, t, close) {
		const sym = baseSym(t.symbol);
		const list = store.get(sym) || [];
		if (t.side > 0) {
			const lot = {
				qty: t.qty,
				px: t.price,
				date: t.date || "",
				name: t.name,
				symbol: sym
			};
			list.push(lot);
			store.set(sym, list);
			if (close) buyLots.push({
				...lot,
				remaining: t.qty,
				id: buyId++
			});
			return;
		}
		let left = t.qty;
		while (left > 1e-8 && list.length) {
			const lot = list[0];
			const take = Math.min(lot.qty, left);
			if (close) {
				const daysHeld = t.date && lot.date ? Math.max(0, Math.round((Date.parse(t.date) - Date.parse(lot.date)) / 864e5)) : 0;
				closed.push({
					symbol: sym,
					name: t.name || lot.name,
					qty: take,
					buyDate: lot.date,
					sellDate: t.date || "",
					buyPx: lot.px,
					sellPx: t.price,
					pnl: (t.price - lot.px) * take,
					pnlPct: lot.px > 0 ? (t.price / lot.px - 1) * 100 : 0,
					days: daysHeld
				});
				let rest = take;
				for (const b of buyLots) {
					if (b.symbol !== sym || !(b.remaining > 1e-8) || !(rest > 1e-8)) continue;
					const u = Math.min(b.remaining, rest);
					b.remaining -= u;
					rest -= u;
				}
			}
			lot.qty -= take;
			left -= take;
			if (lot.qty <= 1e-8) list.shift();
		}
		store.set(sym, list.filter((l) => l.qty > 1e-8));
	}
	for (const day of slice) {
		let t = lastT;
		let printed = 0;
		for (const s of used) {
			const hit = maps[s]?.get(day);
			if (!hit) continue;
			printed += 1;
			t = hit.t;
			lastPx[s] = hit.c;
			neverPx[s] = hit.c;
		}
		const bHit = benchMap.get(day);
		if (bHit) t = t || bHit.t;
		if (printed === 0 && !byDay.has(day)) continue;
		lastT = t || lastT;
		const pre = markLots(lots, lastPx);
		if (prevWealth > 1e-6 && pre.wealth > 0) twr *= pre.wealth / prevWealth;
		const samePre = bHit && bHit.c > 0 && niftyUnits > 0 ? niftyUnits * bHit.c : prevSame;
		if (prevSame > 1e-6 && samePre > 0) sameTwr *= samePre / prevSame;
		const dayTrades = byDay.get(day) || [];
		let dayBuy = 0;
		let daySell = 0;
		for (const tr of dayTrades) {
			const sym = baseSym(tr.symbol);
			const amount = tr.qty * (tr.price > 0 ? tr.price : lastPx[sym] || 0);
			const ms = tradeMs(tr) || (t ? t * 1e3 : Date.parse(day + "T00:00:00Z"));
			if (tr.side > 0) {
				dayBuy += amount;
				if (amount > 0) flows.push({
					t: ms,
					v: -amount
				});
			} else {
				daySell += amount;
				if (amount > 0) flows.push({
					t: ms,
					v: amount
				});
			}
			events.push({
				date: day,
				side: tr.side,
				symbol: sym,
				name: tr.name,
				qty: tr.qty,
				price: tr.price,
				amount,
				priceFilled: tr.priceFilled || void 0
			});
			applySide(lots, tr, true);
			if (tr.side > 0) applySide(neverLots, tr, false);
		}
		const net = dayBuy - daySell;
		if (bHit && bHit.c > 0 && Math.abs(net) > 1e-6) {
			niftyUnits += net / bHit.c;
			if (niftyUnits < 0) niftyUnits = 0;
			const msNet = t ? t * 1e3 : Date.parse(day + "T00:00:00Z");
			sameFlows.push({
				t: msNet,
				v: -net
			});
		}
		const marked = markLots(lots, lastPx);
		const sameCash = bHit && bHit.c > 0 ? niftyUnits * bHit.c : nav.at(-1)?.sameCash ?? null;
		if (t || marked.wealth > 0 || dayTrades.length) nav.push({
			t: t || lastT,
			day,
			wealth: marked.wealth,
			sameCash,
			unit: twr * 100,
			sameUnit: sameTwr * 100,
			covered: marked.names,
			names: marked.names
		});
		prevWealth = marked.wealth;
		prevSame = sameCash != null && sameCash > 0 ? sameCash : prevSame;
		const y = day.slice(0, 4);
		if (!yearAcc[y]) yearAcc[y] = {
			start: pre.wealth,
			end: marked.wealth,
			buyIn: 0,
			sellOut: 0,
			buys: 0,
			sells: 0
		};
		yearAcc[y].end = marked.wealth;
		yearAcc[y].buyIn += dayBuy;
		yearAcc[y].sellOut += daySell;
		yearAcc[y].buys += dayTrades.filter((x) => x.side > 0).length;
		yearAcc[y].sells += dayTrades.filter((x) => x.side < 0).length;
		const next = slice[slice.indexOf(day) + 1];
		if ((!next || next.slice(0, 7) !== day.slice(0, 7)) && (marked.wealth > 0 || marked.names > 0)) {
			const parts = [];
			for (const [sym, list] of lots) {
				const qty = list.reduce((s, l) => s + l.qty, 0);
				const px = lastPx[sym] || 0;
				if (!(qty > 1e-8) || !(px > 0)) continue;
				parts.push({
					symbol: sym,
					name: list[0]?.name || sym,
					qty,
					value: qty * px
				});
			}
			parts.sort((a, b) => b.value - a.value);
			snapshots.push({
				day,
				wealth: marked.wealth,
				parts
			});
		}
	}
	const neverMark = markLots(neverLots, neverPx);
	if (livePx) for (const [k, px] of Object.entries(livePx)) {
		const s = baseSym(k);
		if (px > 0) {
			lastPx[s] = px;
			neverPx[s] = px;
		}
	}
	const markedNow = markLots(lots, lastPx);
	const neverNow = markLots(neverLots, neverPx);
	const wealthNow = markedNow.wealth || nav.at(-1)?.wealth || 0;
	if (nav.length && markedNow.wealth > 0) {
		const last = nav[nav.length - 1];
		const prev = last.wealth;
		if (prev > 1e-6) twr *= markedNow.wealth / prev;
		nav[nav.length - 1] = {
			...last,
			wealth: markedNow.wealth,
			unit: twr * 100,
			names: markedNow.names,
			covered: markedNow.names
		};
		if (snapshots.length) {
			const parts = [];
			for (const [sym, list] of lots) {
				const qty = list.reduce((s, l) => s + l.qty, 0);
				const px = lastPx[sym] || 0;
				if (!(qty > 1e-8) || !(px > 0)) continue;
				parts.push({
					symbol: sym,
					name: list[0]?.name || sym,
					qty,
					value: qty * px
				});
			}
			parts.sort((a, b) => b.value - a.value);
			snapshots[snapshots.length - 1] = {
				day: last.day,
				wealth: markedNow.wealth,
				parts
			};
		}
	}
	const sameCashLast = nav.at(-1)?.sameCash ?? null;
	if (wealthNow > 0) flows.push({
		t: asOf,
		v: wealthNow
	});
	if (sameCashLast != null && sameCashLast > 0) sameFlows.push({
		t: asOf,
		v: sameCashLast
	});
	const from = nav[0]?.day || firstTradeDay;
	const to = nav.at(-1)?.day || null;
	const twrPct = nav.length >= 2 ? (twr - 1) * 100 : null;
	const yf = from && to ? yearFrac(from, to) : 0;
	const twrCagr = twrPct != null && yf > .15 && twr > 0 ? (Math.pow(twr, 1 / yf) - 1) * 100 : twrPct;
	let benchTwr = null;
	if (from && to) {
		const bDays = [...benchMap.keys()].filter((d) => d >= from && d <= to).sort();
		if (bDays.length >= 2) {
			const a = benchMap.get(bDays[0]).c;
			const b = benchMap.get(bDays[bDays.length - 1]).c;
			if (a > 0 && b > 0) benchTwr = (b / a - 1) * 100;
		}
	}
	for (const c of closed) {
		const m = maps[c.symbol];
		c.post1m = postSaleMove(m, c.sellDate, c.sellPx, 30);
		c.post3m = postSaleMove(m, c.sellDate, c.sellPx, 90);
		c.post1y = postSaleMove(m, c.sellDate, c.sellPx, 365);
	}
	const stillHeld = [];
	for (const [sym, list] of lots) {
		const qty = list.reduce((s, l) => s + l.qty, 0);
		if (!(qty > 1e-8)) continue;
		const withPx = list.filter((l) => l.px > 0);
		const avg = withPx.length ? withPx.reduce((s, l) => s + l.qty * l.px, 0) / withPx.reduce((s, l) => s + l.qty, 0) : 0;
		const px = lastPx[sym] || 0;
		stillHeld.push({
			symbol: sym,
			name: list[0]?.name || sym,
			qty,
			avg,
			value: qty * px
		});
	}
	stillHeld.sort((a, b) => b.value - a.value);
	const lastPxNow = lastPx;
	const contrib = buyLots.filter((b) => b.remaining > 1e-8).map((b) => {
		const px = lastPxNow[b.symbol] || 0;
		const valueNow = b.remaining * px;
		const invested = b.remaining * b.px;
		return {
			symbol: b.symbol,
			name: b.name,
			qty: b.qty,
			date: b.date,
			price: b.px,
			invested,
			remainingQty: b.remaining,
			valueNow,
			pnl: valueNow - invested
		};
	}).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
	const years = Object.keys(yearAcc).sort().map((year) => {
		const y = yearAcc[year];
		const idx = nav.findIndex((p) => p.day.slice(0, 4) === year);
		const last = idx >= 0 ? [...nav].filter((p) => p.day.slice(0, 4) === year).at(-1) : void 0;
		const startPt = idx > 0 ? nav[idx - 1] : nav[idx];
		const ret = startPt && last && startPt.unit > 1e-8 ? (last.unit / startPt.unit - 1) * 100 : null;
		const bench = startPt && last && startPt.sameUnit != null && last.sameUnit != null && startPt.sameUnit > 1e-8 ? (last.sameUnit / startPt.sameUnit - 1) * 100 : null;
		return {
			year,
			start: y.start,
			end: y.end,
			ret,
			bench,
			buys: y.buys,
			sells: y.sells,
			buyIn: y.buyIn,
			sellOut: y.sellOut
		};
	});
	const byName = summariseNames(events, closed, stillHeld);
	const unitNav = toUnitNav(nav);
	const windows = unitNav.length ? {
		w1: windowReturn(unitNav, 7),
		m1: windowReturn(unitNav, 31),
		m3: windowReturn(unitNav, 93),
		m6: windowReturn(unitNav, 186),
		y1: windowReturn(unitNav, 365),
		ytd: ytdReturn(unitNav)
	} : {};
	const months = unitNav.length ? monthBuckets(unitNav) : [];
	const risk = unitNav.length >= 10 ? riskMetrics(unitNav) : null;
	return {
		nav,
		xirr: xirrFromFlows(flows),
		twr: twrPct,
		twrCagr: twrCagr != null && Number.isFinite(twrCagr) ? twrCagr : null,
		benchTwr,
		sameCashLast,
		sameCashXirr: xirrFromFlows(sameFlows),
		wealthNow,
		from,
		to,
		closed,
		stillHeld,
		neverSoldLast: neverNow.wealth || neverMark.wealth || null,
		contrib,
		years,
		events,
		missing,
		used,
		coverage: `${used.length}/${symbols.length} names · ${nav.length} days`,
		nTrades: sorted.length,
		nBuys: sorted.filter((t) => t.side > 0).length,
		nSells: sorted.filter((t) => t.side < 0).length,
		nUndated,
		splitNote,
		filledPrices,
		snapshots: thinSlices(snapshots),
		byName,
		windows,
		months,
		risk
	};
}
function thinSlices(rows, cap = 96) {
	if (rows.length <= cap) return rows;
	const step = (rows.length - 1) / (cap - 1);
	const out = [];
	let last = -1;
	for (let i = 0; i < cap - 1; i++) {
		const idx = Math.round(i * step);
		if (idx === last) continue;
		out.push(rows[idx]);
		last = idx;
	}
	const tail = rows[rows.length - 1];
	if (out[out.length - 1] !== tail) out.push(tail);
	return out;
}
function toUnitNav(nav) {
	return nav.filter((p) => p.unit > 0).map((p) => ({
		t: p.t,
		day: p.day,
		port: p.unit,
		bench: p.sameUnit,
		covered: p.covered,
		names: p.names,
		wAvail: 1
	}));
}
function summariseNames(events, closed, still) {
	const m = /* @__PURE__ */ new Map();
	function row(symbol, name) {
		const k = baseSym(symbol);
		let r = m.get(k);
		if (!r) {
			r = {
				symbol: k,
				name: name || k,
				bought: 0,
				sold: 0,
				realized: 0,
				stillQty: 0,
				stillValue: 0,
				unrealized: 0,
				total: 0
			};
			m.set(k, r);
		}
		if (name && r.name === r.symbol) r.name = name;
		return r;
	}
	for (const e of events) {
		const r = row(e.symbol, e.name);
		if (e.side > 0) r.bought += e.amount;
		else r.sold += e.amount;
	}
	for (const c of closed) {
		const r = row(c.symbol, c.name);
		r.realized += c.pnl;
	}
	for (const h of still) {
		const r = row(h.symbol, h.name);
		r.stillQty = h.qty;
		r.stillValue = h.value;
		r.unrealized = h.avg > 0 ? h.value - h.qty * h.avg : 0;
	}
	for (const r of m.values()) r.total = r.realized + r.unrealized;
	return [...m.values()].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}
/** Chart series: rupees in port/bench, cash-flow-stripped units in portUnit/benchUnit. */
function pathToChartNav(path) {
	return (path.nav || []).map((p) => ({
		t: p.t,
		day: p.day,
		port: p.wealth,
		bench: p.sameCash,
		covered: p.covered,
		names: p.names,
		wAvail: 1,
		portUnit: p.unit,
		benchUnit: p.sameUnit
	}));
}
/** Put Your path onto the Mix day axis so both lines share one chart. */
function overlayOnMix(mix, path) {
	if (!path?.length) return mix;
	const mixMap = new Map(mix.map((n) => [n.day, n]));
	const pathMap = new Map(path.map((p) => [p.day, p]));
	const days = [.../* @__PURE__ */ new Set([...mixMap.keys(), ...pathMap.keys()])].sort();
	let lastMix = null;
	let lastPath = null;
	const out = [];
	for (const day of days) {
		const m = mixMap.get(day);
		const p = pathMap.get(day);
		if (m) lastMix = m;
		if (p) lastPath = p;
		const src = m || lastMix;
		out.push({
			t: m?.t || p?.t || src?.t || 0,
			day,
			port: m?.port ?? lastMix?.port ?? 0,
			bench: m?.bench ?? lastMix?.bench ?? null,
			covered: m?.covered ?? lastMix?.covered ?? 0,
			names: m?.names ?? lastMix?.names ?? 0,
			wAvail: m?.wAvail ?? lastMix?.wAvail ?? 0,
			path: lastPath ? lastPath.wealth : null,
			sameCash: lastPath ? lastPath.sameCash : null,
			pathUnit: lastPath ? lastPath.unit : null
		});
	}
	return out;
}
/** Names whose Mix quantity and Path still-held quantity do not match. */
function mixVsPathGaps(mix, held) {
	const a = new Map(mix.map((m) => [baseSym(m.symbol), m]));
	const b = new Map(held.map((h) => [baseSym(h.symbol), h]));
	const keys = [.../* @__PURE__ */ new Set([...a.keys(), ...b.keys()])];
	const out = [];
	for (const k of keys) {
		const m = a.get(k);
		const p = b.get(k);
		const mixQty = m?.qty ?? 0;
		const pathQty = p?.qty ?? 0;
		if (Math.abs(mixQty - pathQty) < 1e-6) continue;
		let note = "Qty differs";
		if (!m) note = "In path, not in this mix";
		else if (!p) note = "In this mix, not in the path";
		out.push({
			symbol: k,
			name: m?.name || p?.name || k,
			mixQty,
			pathQty,
			note
		});
	}
	return out.sort((x, y) => Math.abs(y.mixQty - y.pathQty) - Math.abs(x.mixQty - x.pathQty));
}
//#endregion
export { pathToChartNav as a, overlayOnMix as i, fillTradePrices as n, mixVsPathGaps as r, buildPath as t };
