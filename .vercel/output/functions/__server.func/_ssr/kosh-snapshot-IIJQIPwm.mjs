import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { $n as BENCH, A as detectVcp, Bn as useKosh, Cn as nameSwings, Gt as formatFinPeriod, H as stakeDelta, In as swings, Jt as parsePeriod, Mt as Tooltip, R as buildFieldReport, _t as grahamNumber, ir as cn } from "./router-CAFi_xno.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kosh-snapshot-IIJQIPwm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function zoomAround(view, nAll, anchorIndex, zoomIn, minCount = 20) {
	if (nAll < 1) return {
		start: 0,
		count: 1
	};
	const factor = zoomIn ? .82 : 1.18;
	const nextCount = Math.max(Math.min(minCount, nAll), Math.min(nAll, Math.round(Math.max(1, view.count) * factor)));
	const anchor = Math.max(0, Math.min(view.count, anchorIndex));
	const frac = view.count <= 1 ? 0 : anchor / view.count;
	const center = view.start + anchor;
	return {
		start: Math.max(0, Math.min(nAll - nextCount, Math.round(center - frac * nextCount))),
		count: nextCount
	};
}
/**
* Button zoom. The rightmost visible bar stays put.
* Wheel zoom uses zoomAround so the candle under the cursor stays put.
*/
function zoomRightEdge(view, nAll, zoomIn, minCount = 20) {
	if (nAll < 1) return {
		start: 0,
		count: 1
	};
	const factor = zoomIn ? .82 : 1.18;
	const nextCount = Math.max(Math.min(minCount, nAll), Math.min(nAll, Math.round(Math.max(1, view.count) * factor)));
	const right = Math.min(nAll, view.start + view.count);
	return {
		start: Math.max(0, Math.min(nAll - nextCount, right - nextCount)),
		count: nextCount
	};
}
function panBy(view, nAll, deltaBars) {
	const count = Math.max(1, Math.min(view.count, nAll || 1));
	return {
		start: Math.max(0, Math.min(Math.max(0, nAll - count), view.start + deltaBars)),
		count
	};
}
/** Default window: latest bars at the right edge. Does not wipe drawings or indicators. */
function resetView(nAll, preferred) {
	const count = Math.min(Math.max(1, nAll), Math.max(1, preferred));
	return {
		start: Math.max(0, nAll - count),
		count
	};
}
function atLatest(view, nAll) {
	if (nAll <= 0) return true;
	return view.start + view.count >= nAll;
}
function istDay(tSec) {
	return Math.floor((tSec + 19800) / 86400);
}
/**
* Divide each OHLC by the USD/INR print on or before that day.
* Does not stamp today's rate onto history. Bars with no prior FX are dropped.
*/
function applyHistoricalFx(bars, fx) {
	const sorted = fx.filter((f) => f.c > 0).map((f) => [istDay(f.t), f.c]).sort((a, b) => a[0] - b[0]);
	function rate(day) {
		let hit = null;
		for (const [d, c] of sorted) if (d <= day) hit = c;
		else break;
		return hit;
	}
	const out = [];
	let missing = 0;
	for (const b of bars) {
		const r = rate(istDay(b.t));
		if (!r) {
			missing += 1;
			continue;
		}
		out.push({
			...b,
			o: b.o / r,
			h: b.h / r,
			l: b.l / r,
			c: b.c / r
		});
	}
	return {
		bars: out,
		missing
	};
}
/**
* Benchmark-adjusted OHLC. One candle series, not two indexed lines.
*
* Alignment:
* - "day": same IST calendar day. No print that day means the stock bar is dropped.
* - "time": same clock minute, for intraday. A bar from another session is not borrowed.
*
* relative OHLC = stock component / benchmark component.
* The slice is then rebased so the first relative close is 100.
* If high and low invert, the wick uses the min and max of the four ratios.
* Open and close stay on the formula. A zero benchmark component drops the bar.
*/
function adjustOhlcToBenchmark(stock, bench, mode = "day") {
	const keyOf = (t) => mode === "day" ? istDay(t) : Math.floor(t / 60);
	const bmap = /* @__PURE__ */ new Map();
	for (const b of bench) if (b.o > 0 && b.h > 0 && b.l > 0 && b.c > 0) bmap.set(keyOf(b.t), b);
	const raw = [];
	let dropped = 0;
	for (const s of stock) {
		const b = bmap.get(keyOf(s.t));
		if (!b || !(s.o > 0) || !(s.h > 0) || !(s.l > 0) || !(s.c > 0)) {
			dropped += 1;
			continue;
		}
		raw.push({
			bar: s,
			ro: s.o / b.o,
			rh: s.h / b.h,
			rl: s.l / b.l,
			rc: s.c / b.c
		});
	}
	const base = raw.find((r) => r.rc > 0)?.rc;
	if (!base) return {
		bars: [],
		dropped: dropped + raw.length
	};
	return {
		bars: raw.map((r) => {
			const o = r.ro / base * 100;
			const c = r.rc / base * 100;
			const h = r.rh / base * 100;
			const l = r.rl / base * 100;
			return {
				...r.bar,
				o,
				c,
				h: Math.max(o, c, h, l),
				l: Math.min(o, c, h, l)
			};
		}),
		dropped
	};
}
function clone(rows) {
	return rows.map((r) => ({ ...r }));
}
function histInit(shapes) {
	return {
		past: [clone(shapes)],
		future: []
	};
}
function histPush(h, next) {
	const cur = h.past[h.past.length - 1] || [];
	if (JSON.stringify(cur) === JSON.stringify(next)) return h;
	return {
		past: [...h.past, clone(next)].slice(-40),
		future: []
	};
}
function histUndo(h) {
	if (h.past.length < 2) return null;
	const current = h.past[h.past.length - 1];
	const past = h.past.slice(0, -1);
	return {
		hist: {
			past,
			future: [current, ...h.future].slice(0, 40)
		},
		shapes: clone(past[past.length - 1])
	};
}
function histRedo(h) {
	if (!h.future.length) return null;
	const [next, ...rest] = h.future;
	return {
		hist: {
			past: [...h.past, next].slice(-40),
			future: rest
		},
		shapes: clone(next)
	};
}
var BENCH_IDS = Object.keys(BENCH);
/** One control for price, benchmark-adjusted OHLC, and USD. Not three peer buttons. */
function AdjustMenu({ compact = false, stop = false }) {
	const mode = useKosh((s) => s.chartPrefs.chartMode || "price");
	const bench = useKosh((s) => s.chartPrefs.chartBench || "nifty");
	const patch = useKosh((s) => s.patchChartPrefs);
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	const name = BENCH[bench]?.name || "Nifty 50";
	const label = mode === "usd" ? "USD-adjusted" : mode === "bench" ? `Adjusted · ${name}` : "Price";
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			"aria-haspopup": "menu",
			onClick: (e) => {
				if (stop) e.stopPropagation();
				setOpen((v) => !v);
			},
			className: cn("rounded-sm font-semibold shadow-[var(--shadow-border)]", compact ? "h-7 px-2 text-[11px]" : "h-8 px-2.5 text-[11px]", mode === "price" ? "bg-bg text-muted" : "bg-surface-2 text-fg"),
			children: [label, " ▾"]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "menu",
			className: "absolute left-0 z-30 mt-1 w-56 rounded-md bg-bg-elevated p-2 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "menuitem",
					className: cn("block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "price" ? "bg-surface-2" : "hover:bg-surface"),
					onClick: (e) => {
						if (stop) e.stopPropagation();
						patch({ chartMode: "price" });
						setOpen(false);
					},
					children: "Price"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "menuitem",
					className: cn("mt-1 block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "bench" ? "bg-surface-2" : "hover:bg-surface"),
					onClick: (e) => {
						if (stop) e.stopPropagation();
						patch({ chartMode: "bench" });
					},
					children: "Benchmark-adjusted"
				}),
				mode === "bench" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-1 block px-2 pb-1 text-[11px] text-muted",
					children: ["Benchmark", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Benchmark",
						value: BENCH[bench] ? bench : "nifty",
						className: "mt-1 h-8 w-full rounded-sm border border-border bg-bg px-2 text-[12px] text-fg",
						onClick: (e) => e.stopPropagation(),
						onChange: (e) => patch({ chartBench: e.target.value }),
						children: BENCH_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: id,
							children: BENCH[id].name
						}, id))
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "menuitem",
					className: cn("mt-1 block h-8 w-full rounded-sm px-2 text-left text-[12px]", mode === "usd" ? "bg-surface-2" : "hover:bg-surface"),
					onClick: (e) => {
						if (stop) e.stopPropagation();
						patch({ chartMode: "usd" });
						setOpen(false);
					},
					children: "USD-adjusted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 px-2 text-[10px] leading-snug text-subtle",
					children: "Benchmark-adjusted redraws the stock’s own candles after the index. It is not a second line."
				})
			]
		}) : null]
	});
}
var HANDLE = 12;
var LINE = 16;
function dist(ax, ay, bx, by) {
	return Math.hypot(ax - bx, ay - by);
}
function distSeg(px, py, x0, y0, x1, y1) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len2 = dx * dx + dy * dy || 1;
	let t = ((px - x0) * dx + (py - y0) * dy) / len2;
	t = Math.max(0, Math.min(1, t));
	return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
}
/** Price offset of the parallel line from a third click. Not a % of y0. */
function channelOffFromThird(s, t, y) {
	const t1 = s.t1 ?? s.t0;
	const y1 = s.y1 ?? s.y0;
	const span = t1 - s.t0;
	const f = span === 0 ? 0 : (t - s.t0) / span;
	return y - (s.y0 + f * (y1 - s.y0));
}
function positionMetrics(s) {
	const entry = s.y0;
	const target = s.y1 ?? s.y0;
	const stop = s.y2 ?? s.y0;
	const risk = Math.abs(entry - stop);
	const reward = Math.abs(target - entry);
	const longOk = s.kind === "long" && stop < entry && entry < target;
	const shortOk = s.kind === "short" && target < entry && entry < stop;
	const valid = longOk || shortOk;
	return {
		entry,
		target,
		stop,
		risk,
		reward,
		rr: valid && risk > 0 ? reward / risk : null,
		riskPct: entry ? (stop - entry) / entry * 100 : 0,
		rewardPct: entry ? (target - entry) / entry * 100 : 0,
		valid
	};
}
function shapePoints(s, src, xOf, yOf, left, right, plotTop, plotBot) {
	const tToX = (t) => {
		if (!src.length) return xOf(0);
		if (t <= src[0].t) return xOf(0);
		const last = src.length - 1;
		if (t >= src[last].t) return xOf(last);
		let lo = 0;
		let hi = last;
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (src[mid].t < t) lo = mid + 1;
			else hi = mid;
		}
		const i = lo;
		if (i <= 0) return xOf(0);
		const a = src[i - 1];
		const b = src[i];
		const f = (t - a.t) / (b.t - a.t || 1);
		return xOf(i - 1) + f * (xOf(i) - xOf(i - 1));
	};
	const x0 = tToX(s.t0);
	const y0 = yOf(s.y0);
	const x1 = tToX(s.t1 ?? s.t0);
	const y1 = yOf(s.y1 ?? s.y0);
	if (s.kind === "hline") return {
		x0: left,
		y0,
		x1: right,
		y1: y0
	};
	if (s.kind === "vline") return {
		x0,
		y0: plotTop,
		x1: x0,
		y1: plotBot
	};
	return {
		x0,
		y0,
		x1,
		y1
	};
}
function hitTest(shapes, x, y, src, xOf, yOf, left, right, plotTop, plotBot) {
	for (let i = shapes.length - 1; i >= 0; i--) {
		const s = shapes[i];
		const p = shapePoints(s, src, xOf, yOf, left, right, plotTop, plotBot);
		if (dist(x, y, p.x0, p.y0) <= HANDLE) return {
			id: s.id,
			mode: "p0"
		};
		if (s.kind !== "hline" && s.kind !== "vline" && dist(x, y, p.x1, p.y1) <= HANDLE) return {
			id: s.id,
			mode: "p1"
		};
		if (s.kind === "hline" && dist(x, y, p.x1, p.y1) <= HANDLE) return {
			id: s.id,
			mode: "p0"
		};
		if (s.kind === "channel" && s.off != null) {
			if (dist(x, y, (p.x0 + p.x1) / 2, (yOf(s.y0 + s.off) + yOf((s.y1 ?? s.y0) + s.off)) / 2) <= HANDLE) return {
				id: s.id,
				mode: "off"
			};
		}
		if (s.kind === "long" || s.kind === "short") {
			const midX = (p.x0 + p.x1) / 2;
			const yStop = yOf(s.y2 ?? s.y0);
			if (dist(x, y, midX, p.y0) <= HANDLE) return {
				id: s.id,
				mode: "p0"
			};
			if (dist(x, y, midX, p.y1) <= HANDLE) return {
				id: s.id,
				mode: "p1"
			};
			if (dist(x, y, midX, yStop) <= HANDLE) return {
				id: s.id,
				mode: "p2"
			};
			const ys = [
				p.y0,
				p.y1,
				yStop
			];
			const top = Math.min(...ys);
			const bot = Math.max(...ys);
			const rx = Math.min(p.x0, p.x1);
			const rw = Math.abs(p.x1 - p.x0) || 24;
			if (x >= rx - 4 && x <= rx + rw + 4 && y >= top - 4 && y <= bot + 4) return {
				id: s.id,
				mode: "body"
			};
		}
		if (s.kind === "rect") {
			const rx = Math.min(p.x0, p.x1);
			const ry = Math.min(p.y0, p.y1);
			const rw = Math.abs(p.x1 - p.x0);
			const rh = Math.abs(p.y1 - p.y0);
			const inside = x >= rx - 2 && x <= rx + rw + 2 && y >= ry - 2 && y <= ry + rh + 2;
			const nearEdge = Math.abs(x - rx) <= LINE || Math.abs(x - (rx + rw)) <= LINE || Math.abs(y - ry) <= LINE || Math.abs(y - (ry + rh)) <= LINE;
			if (inside && (nearEdge || rw > 8 && rh > 8 && x > rx + 4 && x < rx + rw - 4 && y > ry + 4 && y < ry + rh - 4)) return {
				id: s.id,
				mode: "body"
			};
		} else if (s.kind !== "long" && s.kind !== "short" && distSeg(x, y, p.x0, p.y0, p.x1, p.y1) <= LINE) return {
			id: s.id,
			mode: "body"
		};
	}
	return null;
}
function magnetPrice(bar, price, on) {
	if (!on || !bar) return price;
	const pts = [
		bar.o,
		bar.h,
		bar.l,
		bar.c
	];
	let best = price;
	let d = Infinity;
	for (const p of pts) {
		const dd = Math.abs(p - price);
		if (dd < d) {
			d = dd;
			best = p;
		}
	}
	return best;
}
function applyDrag(s, mode, dt, dy, t, y) {
	if (mode === "p0") {
		if (s.kind === "hline") return {
			...s,
			y0: y
		};
		if (s.kind === "vline") return {
			...s,
			t0: t
		};
		if (s.kind === "long" || s.kind === "short") return {
			...s,
			y0: y
		};
		return {
			...s,
			t0: t,
			y0: y
		};
	}
	if (mode === "p1") {
		if (s.kind === "long" || s.kind === "short") return {
			...s,
			y1: y
		};
		return {
			...s,
			t1: t,
			y1: y
		};
	}
	if (mode === "p2") return {
		...s,
		y2: y
	};
	if (mode === "off") {
		if (s.kind === "channel") return {
			...s,
			off: channelOffFromThird(s, t, y)
		};
		return {
			...s,
			off: (s.off ?? 0) + dy
		};
	}
	if (s.kind === "hline") return {
		...s,
		y0: s.y0 + dy
	};
	if (s.kind === "vline") return {
		...s,
		t0: s.t0 + dt,
		t1: (s.t1 ?? s.t0) + dt
	};
	if (s.kind === "long" || s.kind === "short") return {
		...s,
		t0: s.t0 + dt,
		t1: (s.t1 ?? s.t0) + dt,
		y0: s.y0 + dy,
		y1: (s.y1 ?? s.y0) + dy,
		y2: (s.y2 ?? s.y0) + dy
	};
	return {
		...s,
		t0: s.t0 + dt,
		y0: s.y0 + dy,
		t1: (s.t1 ?? s.t0) + dt,
		y1: (s.y1 ?? s.y0) + dy,
		off: s.off,
		y2: s.y2 != null ? s.y2 + dy : s.y2
	};
}
/** Conservative pattern hits on the bars of the selected timeframe. */
var MAX = 3;
function kOf(n) {
	return n > 180 ? 5 : n > 80 ? 3 : 2;
}
function inside(c, lo, hi) {
	if (!(c > 0) || !(lo > 0) || !(hi > 0) || hi < lo) return false;
	return c >= lo * .99 && c <= hi * 1.01;
}
function detectFlag(bars) {
	if (bars.length < 30) return null;
	const last = bars[bars.length - 1];
	for (const pole of [
		8,
		10,
		12,
		15
	]) {
		if (bars.length < pole + 8) continue;
		const start = bars[bars.length - pole - 12];
		const endPole = bars[bars.length - 12];
		if (!start?.c || !endPole?.c) continue;
		const move = (endPole.c / start.c - 1) * 100;
		if (Math.abs(move) < 12) continue;
		const rest = bars.slice(-12);
		const hi = Math.max(...rest.map((b) => b.h));
		const lo = Math.min(...rest.map((b) => b.l));
		const range = (hi - lo) / (endPole.c || 1) * 100;
		if (range > Math.abs(move) * .45 || range < 2) continue;
		if (last.c > hi * 1.01 || last.c < lo * .99) continue;
		const up = move > 0;
		return {
			kind: "flag",
			label: up ? "Bull flag" : "Bear flag",
			note: `Pole ${move.toFixed(0)}%, then a tight ${range.toFixed(1)}% coil.`,
			points: [
				{
					t: start.t,
					price: start.c
				},
				{
					t: endPole.t,
					price: endPole.c
				},
				{
					t: rest[0].t,
					price: hi
				},
				{
					t: last.t,
					price: lo
				}
			],
			tone: up ? "up" : "down",
			status: "forming"
		};
	}
	return null;
}
function detectDouble(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length)));
	const highs = named.filter((s) => s.kind === "H").slice(-5);
	const lows = named.filter((s) => s.kind === "L").slice(-5);
	const last = bars[bars.length - 1];
	if (highs.length >= 2) {
		const a = highs[highs.length - 2];
		const b = highs[highs.length - 1];
		if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= .015) {
			const trough = lows.find((l) => l.i > a.i && l.i < b.i);
			if (trough && (a.price - trough.price) / a.price >= .04) {
				const broken = last.c < trough.price * .995;
				return {
					kind: "double-top",
					label: "Double top",
					note: `Two highs near ${a.price.toFixed(0)}, trough ${trough.price.toFixed(0)}.`,
					points: [
						{
							t: a.t,
							price: a.price
						},
						{
							t: trough.t,
							price: trough.price
						},
						{
							t: b.t,
							price: b.price
						}
					],
					tone: "down",
					status: broken ? "reached" : "forming"
				};
			}
		}
	}
	if (lows.length >= 2) {
		const a = lows[lows.length - 2];
		const b = lows[lows.length - 1];
		if (b.i - a.i >= 8 && Math.abs(b.price / a.price - 1) <= .015) {
			const peak = highs.find((h) => h.i > a.i && h.i < b.i);
			if (peak && (peak.price - a.price) / a.price >= .04) {
				const broken = last.c > peak.price * 1.005;
				return {
					kind: "double-bottom",
					label: "Double bottom",
					note: `Two lows near ${a.price.toFixed(0)}, peak ${peak.price.toFixed(0)}.`,
					points: [
						{
							t: a.t,
							price: a.price
						},
						{
							t: peak.t,
							price: peak.price
						},
						{
							t: b.t,
							price: b.price
						}
					],
					tone: "up",
					status: broken ? "reached" : "forming"
				};
			}
		}
	}
	return null;
}
function detectTriangle(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
	const hs = named.filter((s) => s.kind === "H");
	const ls = named.filter((s) => s.kind === "L");
	if (hs.length < 3 || ls.length < 3) return null;
	const h1 = hs[hs.length - 3].price;
	const h2 = hs[hs.length - 2].price;
	const h3 = hs[hs.length - 1].price;
	const l1 = ls[ls.length - 3].price;
	const l2 = ls[ls.length - 2].price;
	const l3 = ls[ls.length - 1].price;
	const highsDown = h1 > h2 && h2 > h3;
	const lowsUp = l1 < l2 && l2 < l3;
	const highsUp = h1 < h2 && h2 < h3;
	const lowsDown = l1 > l2 && l2 > l3;
	if (!(highsDown && lowsUp) && !(highsDown && lowsDown) && !(highsUp && lowsUp)) return null;
	const label = highsDown && lowsUp ? "Triangle" : highsDown && lowsDown ? "Descending triangle" : "Ascending triangle";
	const last = bars[bars.length - 1];
	const bandLo = Math.min(l1, l2, l3);
	const bandHi = Math.max(h1, h2, h3);
	return {
		kind: "triangle",
		label,
		note: "Swing highs and lows are converging on this timeframe.",
		points: [
			{
				t: hs[hs.length - 3].t,
				price: h1
			},
			{
				t: hs[hs.length - 1].t,
				price: h3
			},
			{
				t: ls[ls.length - 3].t,
				price: l1
			},
			{
				t: ls[ls.length - 1].t,
				price: l3
			}
		],
		tone: "chart",
		status: inside(last.c, bandLo, bandHi) ? "forming" : "reached"
	};
}
function detectRange(bars) {
	const named = nameSwings(swings(bars, kOf(bars.length))).slice(-8);
	const hs = named.filter((s) => s.kind === "H").slice(-3);
	const ls = named.filter((s) => s.kind === "L").slice(-3);
	if (hs.length < 2 || ls.length < 2) return null;
	const hAvg = hs.reduce((s, x) => s + x.price, 0) / hs.length;
	const lAvg = ls.reduce((s, x) => s + x.price, 0) / ls.length;
	if (!(hAvg > 0) || !(lAvg > 0) || hAvg <= lAvg) return null;
	const hTight = hs.every((h) => Math.abs(h.price / hAvg - 1) <= .012);
	const lTight = ls.every((l) => Math.abs(l.price / lAvg - 1) <= .012);
	const span = (hAvg - lAvg) / hAvg * 100;
	if (!hTight || !lTight || span < 5 || span > 18) return null;
	const last = bars[bars.length - 1];
	return {
		kind: "range",
		label: "Range",
		note: `${span.toFixed(1)}% between ${lAvg.toFixed(0)} and ${hAvg.toFixed(0)}.`,
		points: [{
			t: hs[0].t,
			price: hAvg
		}, {
			t: ls[0].t,
			price: lAvg
		}],
		tone: "chart",
		status: inside(last.c, lAvg, hAvg) ? "forming" : "reached"
	};
}
function detectPatterns(bars) {
	const src = (bars || []).filter((b) => b && b.c > 0);
	if (src.length < 24) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (hit) => {
		if (!hit || out.length >= MAX || seen.has(hit.kind)) return;
		seen.add(hit.kind);
		out.push(hit);
	};
	const vcp = detectVcp(src);
	if (vcp?.breakout) push({
		kind: "vcp-break",
		label: "VCP breakout",
		note: `${vcp.n} contractions, pivot ${vcp.pivot.toFixed(0)}. Last print is through the pivot — observed, not a forecast.`,
		points: [{
			t: src[src.length - 1].t,
			price: vcp.pivot
		}],
		tone: "up",
		status: "reached"
	});
	else if (vcp?.forming) push({
		kind: "vcp",
		label: "VCP",
		note: `${vcp.n} contractions, last ${vcp.lastPct.toFixed(1)}%, pivot ${vcp.pivot.toFixed(0)}.`,
		points: [{
			t: src[src.length - 1].t,
			price: vcp.pivot
		}],
		tone: "chart",
		status: "forming"
	});
	push(detectFlag(src));
	push(detectDouble(src));
	if (out.length < MAX) push(detectTriangle(src));
	if (out.length < MAX) push(detectRange(src));
	return out.slice(0, MAX);
}
function patternStatusLabel(s) {
	return s === "reached" ? "Reached" : "Forming";
}
/** Scenario valuation — not intrinsic value. Blank when the inputs are missing. */
var YEARS = 5;
function num(v) {
	return v != null && Number.isFinite(v) ? v : null;
}
/** What 5-year EPS CAGR today's price requires at a stated exit multiple.
*  Discount defaults to 0 — the primary figure is undiscounted algebra.
*  Pass a discount only for an explicitly labelled scenario. */
function reverseImpliedCagr(price, eps, exitPe, years = YEARS, discount = 0) {
	const p = num(price);
	const e = num(eps);
	const m = num(exitPe);
	if (p == null || e == null || m == null || !(p > 0) || !(e > 0) || !(m > 0)) return null;
	const rhs = p * Math.pow(1 + discount, years) / (e * m);
	if (!(rhs > 0)) return null;
	const g = Math.pow(rhs, 1 / years) - 1;
	if (!Number.isFinite(g) || g < -.9 || g > 4) return null;
	return g * 100;
}
function earningsQualityRead(f) {
	if (!f) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "No company card, so earnings quality is not scored."
	};
	const cfoPat = f.cfoPat;
	const lastCfo = f.cfo.at(-1)?.value ?? null;
	const lastPat = f.profits.at(-1)?.value ?? null;
	if (cfoPat == null && (lastCfo == null || lastPat == null)) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "Cash from operations is not on the company card. Kosh will not guess it."
	};
	const ratio = cfoPat ?? (lastPat && lastPat !== 0 && lastCfo != null ? lastCfo / lastPat : null);
	if (ratio == null || !Number.isFinite(ratio)) return {
		cfoPat: null,
		tag: "Unavailable",
		body: "Cash from operations is not on the company card."
	};
	if (ratio >= 1) return {
		cfoPat: ratio,
		tag: "Cash backs profit",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Accruals are not doing the heavy lifting on this print.`
	};
	if (ratio >= .7) return {
		cfoPat: ratio,
		tag: "Adequate",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Usable, not lush.`
	};
	if (ratio >= .4) return {
		cfoPat: ratio,
		tag: "Soft cash",
		body: `Operating cash is only ${ratio.toFixed(2)}× reported profit. Earnings quality needs a second look — working capital or accruals may be carrying the print.`
	};
	return {
		cfoPat: ratio,
		tag: "Weak cash",
		body: `Operating cash is ${ratio.toFixed(2)}× reported profit. Treat the earnings print as low quality until cash catches up.`
	};
}
function wordOf(current, fair, cheaperIfLower = true) {
	if (current == null || !(current > 0) || fair == null || !(fair > 0)) return "Not enough data";
	const ratio = cheaperIfLower ? current / fair : fair / current;
	if (ratio <= .85) return "Cheaper";
	if (ratio >= 1.15) return "Expensive";
	return "About right";
}
function wordByGap(payingFor, delivered) {
	if (payingFor == null || delivered == null || !Number.isFinite(payingFor) || !Number.isFinite(delivered)) return "Not enough data";
	const gap = payingFor - delivered;
	if (gap >= 5) return "Expensive";
	if (gap <= -5) return "Cheaper";
	return "About right";
}
/** Last session on or before the IST month-end, within ~45 days. */
function yearEndClose(bars, year, month = 3) {
	if (!bars.length || !Number.isFinite(year)) return null;
	const lastDay = month === 2 ? 28 : [
		4,
		6,
		9,
		11
	].includes(month) ? 30 : 31;
	const end = Date.parse(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59+05:30`) / 1e3;
	if (!Number.isFinite(end)) return null;
	const start = end - 3888e3;
	let best = null;
	for (const b of bars) {
		const px = b.c;
		if (!(px > 0)) continue;
		if (b.t > start && b.t <= end) best = px;
	}
	return best;
}
/**
* Reconstruct year-end P/E from yearly profit and the year-end price.
* EPS_t ≈ current EPS × (PAT_t / PAT_now). Share count is assumed roughly stable.
* This is not a filing P/E series.
*/
function reconstructPeHistory(input) {
	const epsNow = num(input.currentEps);
	const bars = input.bars || [];
	const yearly = [];
	for (const p of input.profits || []) {
		if (!Number.isFinite(p.value) || p.value === 0) continue;
		const parsed = parsePeriod(p.period);
		if (!parsed) continue;
		if (!(/^\d{4}$/.test(String(p.period).trim()) || parsed.m === 3 || /^FY/i.test(String(p.period))) && parsed.m !== 3) continue;
		yearly.push({
			period: p.period,
			pat: p.value,
			y: parsed.y,
			m: parsed.m || 3
		});
	}
	yearly.sort((a, b) => a.y - b.y || a.m - b.m);
	const last = yearly.at(-1);
	if (!last || !(last.pat > 0)) return [];
	const out = [];
	for (const y of yearly) {
		const eps = epsNow != null && last.pat > 0 ? epsNow * (y.pat / last.pat) : null;
		const price = yearEndClose(bars, y.y, y.m || 3);
		const pe = eps != null && eps > 0 && price != null && price > 0 ? price / eps : null;
		out.push({
			period: y.period,
			label: formatFinPeriod(y.period, "year"),
			year: y.y,
			pat: y.pat,
			eps: eps != null && Number.isFinite(eps) ? eps : null,
			price,
			pe: pe != null && Number.isFinite(pe) && pe > 0 && pe < 400 ? pe : null
		});
	}
	return out;
}
/** Residual-income P/B. g is capped below both ROE and the 12% discount. */
function justifiedPb(roePct, gPct, rPct = 12) {
	const roe = num(roePct);
	const r = num(rPct);
	if (roe == null || r == null || !(r > 0)) return null;
	const roeU = roe / 100;
	const rU = r / 100;
	const cap = Math.min(roeU, rU) - .01;
	if (!(cap > 0)) return null;
	let gU = num(gPct) != null ? gPct / 100 : 0;
	gU = Math.min(Math.max(gU, -.05), cap);
	if (!(rU > gU)) return null;
	const pb = (roeU - gU) / (rU - gU);
	if (!Number.isFinite(pb) || pb <= 0 || pb > 50) return null;
	return pb;
}
function modelA(input) {
	const word = wordOf(input.pe, input.industryPe, true);
	const rows = [];
	if (input.pe != null) rows.push({
		label: "P/E today",
		value: `${input.pe.toFixed(1)}×`
	});
	if (input.industryPe != null) rows.push({
		label: "Industry P/E",
		value: `${input.industryPe.toFixed(1)}×`
	});
	if (input.eps != null && input.eps > 0) rows.push({
		label: "EPS today",
		value: `₹${input.eps.toFixed(1)}`
	});
	const currentPe = input.pe;
	const higher = [...input.hist].filter((p) => p.pe != null && (currentPe == null || p.pe > currentPe + .4)).sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
	const peak = [...input.hist].filter((p) => p.pe != null).sort((a, b) => (b.pe || 0) - (a.pe || 0))[0];
	const then = higher || (peak && currentPe != null && peak.pe != null && peak.pe > currentPe ? peak : null);
	if (then && then.pe != null) {
		rows.push({
			label: `P/E ${then.label}`,
			value: `${then.pe.toFixed(1)}×`
		});
		if (then.eps != null) rows.push({
			label: `EPS ${then.label}`,
			value: `₹${then.eps.toFixed(1)}`
		});
	}
	const bits = [];
	if (input.pe != null && input.industryPe != null) {
		const gap = (input.pe / input.industryPe - 1) * 100;
		if (Math.abs(gap) < 10) bits.push(`P/E is in line with the reported industry (${input.pe.toFixed(0)} vs ${input.industryPe.toFixed(0)}).`);
		else if (gap > 0) bits.push(`P/E is ${gap.toFixed(0)}% above the reported industry multiple.`);
		else bits.push(`P/E is ${Math.abs(gap).toFixed(0)}% below the reported industry multiple.`);
	} else bits.push("Industry P/E is not on the card, so there is no relative call.");
	if (then && then.pe != null && then.eps != null && input.eps != null) {
		const epsMove = input.eps - then.eps;
		bits.push(`When P/E was ${then.pe.toFixed(0)}× (${then.label}), EPS was ₹${then.eps.toFixed(1)}. Today EPS is ₹${input.eps.toFixed(1)}${epsMove > 0 ? " — earnings have grown since that richer multiple" : epsMove < 0 ? " — earnings are lower than at that richer multiple" : ""}.`);
	} else if (input.hist.some((p) => p.pe != null)) bits.push("No earlier reconstructed year had a higher P/E than today.");
	else bits.push("A reconstructed P/E history needs yearly profit and year-end prices. Share count is assumed roughly stable — this is not a filing P/E.");
	return {
		id: "A+",
		title: "P/E vs industry, EPS then vs now",
		word,
		figure: input.pe != null && input.industryPe != null ? `${input.pe.toFixed(0)}× vs ${input.industryPe.toFixed(0)}× industry` : input.pe != null ? `${input.pe.toFixed(1)}× P/E` : "No P/E",
		body: bits.join(" "),
		rows,
		note: "Reconstructed P/E uses yearly profit and the year-end price. Share count is assumed roughly stable. Not a filing series and not a buy call."
	};
}
function modelC(input) {
	const paying = reverseImpliedCagr(input.price, input.eps, input.industryPe);
	const word = wordByGap(paying, input.delivered);
	const rows = [];
	if (paying != null) rows.push({
		label: "Growth the price requires",
		value: `${paying.toFixed(0)}% a year`
	});
	if (input.delivered != null) rows.push({
		label: "Growth delivered",
		value: `${input.delivered.toFixed(0)}% a year`
	});
	if (input.industryPe != null) rows.push({
		label: "Exit multiple used",
		value: `${input.industryPe.toFixed(0)}× industry`
	});
	let body;
	if (paying == null) body = "Need last price, positive EPS, and a reported industry multiple to say what growth the price is already paying for.";
	else if (input.delivered == null) body = `The price requires about ${paying.toFixed(0)}% annual earnings growth over 5 years if the exit is the industry multiple and no discount rate is applied. Delivered profit CAGR is not on the card, so there is nothing to compare it with.`;
	else body = `The price requires about ${paying.toFixed(0)}% annual earnings growth over 5 years if the exit is the industry multiple. No discount rate is applied. The company has delivered ${input.delivered.toFixed(0)}% profit CAGR. That comparison is a requirement, not a forecast.`;
	return {
		id: "C",
		title: "Growth the price requires",
		word: paying == null ? "Not enough data" : input.delivered == null ? "Not enough data" : word,
		figure: paying != null && input.delivered != null ? `Requires ${paying.toFixed(0)}% · delivered ${input.delivered.toFixed(0)}%` : paying != null ? `Requires ${paying.toFixed(0)}%` : "No figure",
		body,
		rows,
		note: "5-year exit at the reported industry multiple. No discount rate. Not a forecast."
	};
}
function modelD(input) {
	if (input.growth == null) return {
		id: "D",
		title: "Justified P/B from ROE",
		word: "Not enough data",
		figure: "No figure",
		body: "Profit CAGR is not on the card, so this model does not assume growth is 0%.",
		rows: [
			...input.roe != null ? [{
				label: "ROE",
				value: `${input.roe.toFixed(1)}%`
			}] : [],
			{
				label: "Discount (r)",
				value: "12% (modelling assumption)"
			},
			{
				label: "Growth used (g)",
				value: "Unavailable"
			}
		],
		note: "Missing growth is not treated as 0%. The 12% discount is a labelled assumption, not a company fact."
	};
	const g = input.growth;
	const just = justifiedPb(input.roe, g, 12);
	const word = wordOf(input.pb, just, true);
	const rows = [];
	if (input.pb != null) rows.push({
		label: "P/B today",
		value: `${input.pb.toFixed(2)}×`
	});
	if (just != null) rows.push({
		label: "Justified P/B",
		value: `${just.toFixed(2)}×`
	});
	if (input.roe != null) rows.push({
		label: "ROE",
		value: `${input.roe.toFixed(1)}%`
	});
	rows.push({
		label: "Discount (r)",
		value: "12% (modelling assumption)"
	});
	rows.push({
		label: "Growth used (g)",
		value: `${g.toFixed(0)}% from recorded profit CAGR`
	});
	let body;
	if (input.roe == null) body = "Need ROE to justify a P/B. The card does not have it.";
	else if (just == null) body = "ROE is not high enough versus the 12% discount to justify a P/B on this model.";
	else if (input.pb == null) body = `Justified P/B is ${just.toFixed(2)}× from ROE ${input.roe.toFixed(0)}% and g ${g.toFixed(0)}% from the recorded profit CAGR. Today's P/B is not on the card.`;
	else body = `Justified P/B is ${just.toFixed(2)}× from ROE ${input.roe.toFixed(0)}% (r = 12% is a modelling assumption, not a company fact). Today's P/B is ${input.pb.toFixed(2)}×. g is ${g.toFixed(0)}% from the recorded profit CAGR.`;
	return {
		id: "D",
		title: "Justified P/B from ROE",
		word: just == null || input.pb == null ? "Not enough data" : word,
		figure: just != null && input.pb != null ? `${input.pb.toFixed(2)}× vs ${just.toFixed(2)}× justified` : just != null ? `${just.toFixed(2)}× justified` : "No figure",
		body,
		rows,
		note: "P/B = (ROE − g) / (r − g) with r = 12%. g is capped below ROE and r. Not a buy call."
	};
}
function buildValuationModels(input) {
	const f = input.fund || null;
	const price = num(input.price);
	const eps = num(f?.eps);
	const pe = num(f?.pe) ?? (price != null && eps != null && eps > 0 ? price / eps : null);
	const industryPe = num(f?.industryPe);
	const pb = num(f?.pb);
	const roe = num(f?.roe);
	const delivered = num(f?.profitCagr5) ?? num(f?.profitCagr3);
	const hist = reconstructPeHistory({
		profits: f?.profits,
		currentEps: eps,
		bars: input.bars
	});
	const a = modelA({
		pe,
		industryPe,
		eps,
		hist
	});
	const c = modelC({
		price,
		eps,
		industryPe,
		delivered
	});
	const d = modelD({
		pb,
		roe,
		growth: delivered
	});
	const graham = grahamNumber(eps, f?.book);
	const grahamGap = graham != null && price != null && graham > 0 ? (price / graham - 1) * 100 : null;
	return {
		models: [
			a,
			c,
			d
		],
		simple: a,
		hist,
		graham,
		grahamGap
	};
}
function pctTxt(v, digits = 1) {
	if (v == null || !Number.isFinite(v)) return null;
	return `${v.toFixed(digits)}%`;
}
/** Separate growth evidence from any required-growth figure. Missing stays unavailable. */
function growthEvidence(f) {
	const q = f?.qProfits || [];
	let quarter = null;
	if (q.length >= 2) {
		const prev = q[q.length - 2]?.value;
		const last = q[q.length - 1]?.value;
		if (prev != null && last != null && prev !== 0 && Number.isFinite(prev) && Number.isFinite(last)) quarter = `${((last - prev) / Math.abs(prev) * 100).toFixed(1)}% latest quarter vs the one before`;
	}
	const items = [
		{
			label: "Sales CAGR 3Y",
			value: pctTxt(f?.salesCagr3)
		},
		{
			label: "Sales CAGR 5Y",
			value: null
		},
		{
			label: "Profit CAGR 3Y",
			value: pctTxt(f?.profitCagr3)
		},
		{
			label: "Profit CAGR 5Y",
			value: pctTxt(f?.profitCagr5)
		},
		{
			label: "Sales 1Y",
			value: pctTxt(f?.salesYoY)
		},
		{
			label: "Profit 1Y",
			value: pctTxt(f?.profitYoY)
		},
		{
			label: "Latest quarter profit",
			value: quarter
		},
		{
			label: "OPM",
			value: pctTxt(f?.opm)
		},
		{
			label: "ROCE",
			value: pctTxt(f?.roce)
		},
		{
			label: "ROE",
			value: pctTxt(f?.roe)
		},
		{
			label: "CFO / PAT",
			value: f?.cfoPat != null && Number.isFinite(f.cfoPat) ? `${f.cfoPat.toFixed(2)}×` : null
		},
		{
			label: "Debt / equity",
			value: f?.de != null && Number.isFinite(f.de) ? f.de.toFixed(2) : null
		},
		{
			label: "Management guidance",
			value: null
		}
	];
	const growth = [
		f?.salesCagr3,
		f?.profitCagr3,
		f?.profitCagr5,
		f?.salesYoY,
		f?.profitYoY
	].filter((n) => n != null && Number.isFinite(n));
	const pos = growth.filter((n) => n > 0).length;
	const neg = growth.filter((n) => n < 0).length;
	const cashWeak = f?.cfoPat != null && f.cfoPat < .5;
	let tone = "Insufficient";
	if (growth.length < 2) tone = "Insufficient";
	else if (pos > 0 && neg > 0 || cashWeak && pos > 0) tone = "Mixed";
	else if (pos === growth.length && growth.length >= 3) tone = "Supportive";
	else tone = "Limited";
	return {
		tone,
		body: tone === "Insufficient" ? "Fewer than two growth prints are on the card. Missing growth is not treated as 0%. This is not a forecast." : tone === "Supportive" ? "The growth prints on file point the same way. Evidence only — not a forecast and not the growth the price requires." : tone === "Mixed" ? "The prints on file do not agree, or cash conversion is weak beside the growth. Evidence only — not a forecast." : "Only a few growth prints are on file. Not enough to call the evidence supportive. Not a forecast.",
		items
	};
}
function cr(n) {
	return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}
function buildSnapshot(input) {
	const f = input.fund || null;
	const row = input.row || null;
	const skill = input.skill || null;
	const models = buildValuationModels({
		price: input.price ?? row?.price ?? null,
		fund: f,
		bars: input.bars
	});
	const eq = earningsQualityRead(f);
	const sh = stakeDelta(f?.shareholding);
	const missing = [];
	const lines = [];
	const pe = f?.pe ?? row?.pe ?? null;
	const ind = f?.industryPe ?? null;
	if (pe != null) lines.push({
		label: "P/E",
		value: ind != null ? `${pe.toFixed(1)} vs ${ind.toFixed(0)}` : pe.toFixed(1),
		tone: ind != null ? pe <= ind ? "up" : pe > ind * 1.25 ? "down" : void 0 : void 0,
		hint: "Trailing P/E versus the reported industry multiple."
	});
	else missing.push("P/E");
	const pb = f?.pb ?? row?.pb ?? null;
	if (pb != null) lines.push({
		label: "P/B",
		value: pb.toFixed(2),
		hint: "Price ÷ book value per share on the company card."
	});
	else missing.push("P/B");
	const roe = f?.roe ?? row?.roe ?? null;
	const roce = f?.roce ?? row?.roce ?? null;
	if (roe != null) lines.push({
		label: "ROE",
		value: `${roe.toFixed(1)}%`,
		tone: roe >= 15 ? "up" : roe < 8 ? "down" : void 0,
		hint: "Return on equity from the company card."
	});
	else if (roce != null) lines.push({
		label: "ROCE",
		value: `${roce.toFixed(1)}%`,
		tone: roce >= 20 ? "up" : roce < 10 ? "down" : void 0,
		hint: "Return on capital employed from the company card."
	});
	else missing.push("ROE");
	const de = f?.de ?? row?.de ?? null;
	if (de != null) lines.push({
		label: "D/E",
		value: de.toFixed(2),
		tone: de <= .5 ? "up" : de > 1.5 ? "down" : void 0,
		hint: "Total debt ÷ equity. Banks often skip this print."
	});
	else missing.push("Debt/equity");
	const sales = f?.salesYoY ?? row?.salesYoY ?? null;
	if (sales != null) lines.push({
		label: "Sales 1Y",
		value: `${sales.toFixed(0)}%`,
		tone: sales >= 12 ? "up" : sales < 0 ? "down" : void 0,
		hint: "Latest yearly sales growth on the company card."
	});
	else missing.push("sales growth");
	const pat1 = f?.profitYoY ?? row?.profitYoY ?? null;
	const pat3 = f?.profitCagr3 ?? row?.profitCagr3 ?? null;
	if (pat1 != null || pat3 != null) {
		const bits = [];
		if (pat1 != null) bits.push(`1Y ${pat1.toFixed(0)}%`);
		if (pat3 != null) bits.push(`3Y ${pat3.toFixed(0)}%`);
		lines.push({
			label: "Profit",
			value: bits.join(" · "),
			tone: (pat3 ?? pat1 ?? 0) >= 12 ? "up" : (pat3 ?? pat1 ?? 0) < 0 ? "down" : void 0,
			hint: "Recorded profit growth from the company card."
		});
	} else missing.push("profit growth");
	const prom = f?.promoters ?? row?.promoters ?? null;
	if (prom != null) {
		const dFii = sh?.fiiDelta ?? row?.fiiDelta ?? null;
		lines.push({
			label: "Promoter",
			value: dFii != null ? `${prom.toFixed(1)}% · FII ${dFii >= 0 ? "+" : ""}${dFii.toFixed(1)} pp` : `${prom.toFixed(1)}%`,
			tone: prom >= 50 ? "up" : prom < 25 ? "down" : void 0,
			hint: "Latest promoter holding. FII change is the last reported quarter versus the one before."
		});
	} else missing.push("promoter holding");
	const mcap = f?.mcapCr ?? row?.mcapCr ?? null;
	if (mcap != null && mcap > 0) lines.push({
		label: "Mcap",
		value: cr(mcap),
		hint: "Shares outstanding × last price, in ₹ crore."
	});
	if (eq.cfoPat != null) lines.push({
		label: "Cash / profit",
		value: `${eq.cfoPat.toFixed(2)}×`,
		tone: eq.cfoPat >= .8 ? "up" : eq.cfoPat < .5 ? "down" : void 0,
		hint: "Latest operating cash ÷ latest reported profit. Missing cash flow stays blank."
	});
	const fundTag = skill?.fundTag || null;
	const qualTag = skill?.qualTag || null;
	const fundPass = skill?.fundRating ? skill.fundRating === "pass" : null;
	const qualYes = skill?.qualPotential ? skill.qualPotential === "yes" : null;
	const bits = [];
	if (fundTag && qualTag) bits.push(`Skills: ${fundTag} · ${qualTag}.`);
	else if (fundTag) bits.push(`Fundamental skill: ${fundTag}.`);
	else if (qualTag) bits.push(`Qualitative skill: ${qualTag}.`);
	bits.push(`${models.simple.word}. ${models.simple.figure}.`);
	return {
		symbol: input.symbol,
		name: input.name || f?.name || input.symbol,
		fundTag,
		qualTag,
		fundPass,
		qualYes,
		lines,
		read: bits.filter(Boolean).join(" "),
		missing
	};
}
function CoverageLine({ cov }) {
	const missing = cov.buckets.filter((b) => !b.ok);
	if (!missing.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-[12px] text-muted",
		children: [
			"Still missing: ",
			missing.map((b) => b.label).join(", "),
			". Blank is missing, not a pass."
		]
	});
}
var STATUS_WORD = {
	verified: "Verified",
	derived: "Derived",
	researched: "AI-researched",
	conflicting: "Conflict",
	unavailable: "Not found",
	not_applicable: "N/A"
};
function FieldCoverage({ fund }) {
	const report = buildFieldReport(fund);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "cursor-pointer text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: ["Data coverage", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 font-mono text-[11px] font-normal normal-case tracking-normal text-subtle",
					children: [
						report.counts.verified,
						" verified · ",
						report.counts.derived,
						" derived",
						report.counts.researched ? ` · ${report.counts.researched} AI-researched` : "",
						" · ",
						report.counts.conflicting,
						" ",
						"conflicting · ",
						report.counts.unavailable,
						" not found"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[12px] text-subtle",
				children: "Each line is a status, not a score. Verified means a source was selected. Derived means Kosh calculated it. Not found means the supported sources did not have it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2",
				children: [
					"financials",
					"quality",
					"valuation",
					"ownership"
				].map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase",
					children: g
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1",
					children: report.lines.filter((l) => l.group === g).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-3 border-b border-border/50 py-1 text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								l.status === "verified" ? "✓" : l.status === "derived" ? "◇" : l.status === "conflicting" ? "⚠" : "✗",
								" ",
								l.label
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: STATUS_WORD[l.status]
								}),
								l.value != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 font-mono tabular text-subtle",
									children: [l.value.toFixed(l.unit === "x" || l.unit === "₹" ? 2 : 1), l.unit === "%" ? "%" : ""]
								}) : null,
								l.sourceName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block text-[10px] text-subtle",
									children: [l.sourceName, l.period ? ` · ${l.period}` : ""]
								}) : null,
								l.alt != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-[10px] text-subtle",
									children: [
										"Also ",
										l.altSource,
										": ",
										l.alt
									]
								}) : null
							]
						})]
					}, l.id))
				})] }, g))
			})
		]
	});
}
function wordClass(word) {
	if (word === "Cheaper") return "bg-up/15 text-up";
	if (word === "Expensive") return "bg-down/15 text-down";
	if (word === "About right") return "bg-chart/15 text-chart";
	return "bg-surface-2 text-muted";
}
function WordChip({ word }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em]", wordClass(word)),
		children: word
	});
}
function SnapshotCard({ snap, simple }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: "Snapshot"
				}), simple ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: simple.word }) : null]
			}),
			snap.fundTag || snap.qualTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2 text-[12px]",
				children: [snap.fundTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-2 py-0.5", snap.fundPass ? "bg-up/15 text-up" : "bg-surface-2 text-muted"),
					children: snap.fundTag
				}) : null, snap.qualTag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-sm px-2 py-0.5", snap.qualYes ? "bg-up/15 text-up" : "bg-surface-2 text-muted"),
					children: snap.qualTag
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4",
				children: snap.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-2 border-b border-border/50 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[12px] text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: l.hint,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-left text-[12px] text-muted hover:text-fg",
								children: l.label
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: cn("font-mono text-[13px] tabular", l.tone === "up" && "text-up", l.tone === "down" && "text-down"),
						children: l.value
					})]
				}, l.label))
			}),
			simple ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-semibold tracking-[0.08em] text-muted uppercase",
					children: simple.figure
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] leading-relaxed text-fg",
					children: simple.body
				})]
			}) : null,
			snap.missing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-muted",
				children: [
					"Still unavailable: ",
					snap.missing.join(", "),
					"."
				]
			}) : null
		]
	});
}
function ModelBlock({ model }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-[13px] font-semibold",
					children: model.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: model.word })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[13px] tabular text-muted",
				children: model.figure
			}),
			model.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid gap-1",
				children: model.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3 text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular",
						children: r.value
					})]
				}, r.label))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] leading-relaxed text-fg",
				children: model.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] text-subtle",
				children: model.note
			})
		]
	});
}
function ValuationModels({ pack, fund }) {
	const ev = growthEvidence(fund);
	const reverse = pack.models.find((m) => m.id === "C");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "What the price requires"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-subtle",
				children: "Reverse valuation is the main read: the earnings growth today's price requires if the exit multiple is the reported industry multiple in five years. No discount rate is applied. Not a forecast."
			}),
			reverse ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[13px] font-semibold",
							children: reverse.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordChip, { word: reverse.word })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-[13px] tabular text-muted",
						children: reverse.figure
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[13px] leading-relaxed text-fg",
						children: reverse.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-subtle",
						children: reverse.note
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Growth evidence"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[12px] text-subtle",
				children: [
					ev.tone,
					". ",
					ev.body,
					" Sales CAGR over five years and management guidance are not on the card, so they stay unavailable."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3",
				children: ev.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-2 border-b border-border/50 py-1 text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular",
						children: item.value ?? "Unavailable"
					})]
				}, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
				children: "Other comparisons"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[12px] text-subtle",
				children: "One word is a comparison of the prints we have — Cheaper, About right, Expensive, or Not enough data. The optional scenario still labels a 12% discount as a model assumption, not a company fact. Not a buy call."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 lg:grid-cols-2",
				children: pack.models.filter((m) => m.id !== "C").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelBlock, { model: m }, m.id))
			}),
			pack.graham != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[12px] text-muted",
				children: [
					"Traditional Graham check (optional): ₹",
					pack.graham.toFixed(0),
					pack.grahamGap != null ? ` · last ${pack.grahamGap >= 0 ? "+" : ""}${pack.grahamGap.toFixed(0)}% versus that filter.` : ".",
					" ",
					"Not a buy call."
				]
			}) : null
		]
	});
}
//#endregion
export { panBy as C, zoomAround as D, resetView as E, zoomRightEdge as O, magnetPrice as S, positionMetrics as T, histInit as _, ValuationModels as a, histUndo as b, applyDrag as c, buildSnapshot as d, buildValuationModels as f, growthEvidence as g, earningsQualityRead as h, SnapshotCard as i, applyHistoricalFx as l, detectPatterns as m, CoverageLine as n, WordChip as o, channelOffFromThird as p, FieldCoverage as r, adjustOhlcToBenchmark as s, AdjustMenu as t, atLatest as u, histPush as v, patternStatusLabel as w, hitTest as x, histRedo as y };
