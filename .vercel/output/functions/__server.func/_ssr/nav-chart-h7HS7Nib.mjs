import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Maximize2, b as Minimize2 } from "../_libs/lucide-react.mjs";
import { J as sliceNav, Qt as useKosh, gn as cn, i as Seg } from "./router-g4ySYeAB2.mjs";
import { a as SAME_STROKE, c as buildSvgDoc, d as extremes, f as niceY, g as yearMarks, h as smaRows, i as PATH_STROKE, l as countable, m as seriesPath, n as DOWN_STROKE, o as SMA_STROKE, p as plotChrome, r as MIX_STROKE, s as buildRows, t as BENCH_STROKE, u as domain } from "./plot-BzhEnD2T.mjs";
import { t as useChartFullscreen } from "./use-fullscreen-DQ7DYulI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nav-chart-h7HS7Nib.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MODES = [
	{
		id: "cum",
		label: "Growth"
	},
	{
		id: "inr",
		label: "Rupees"
	},
	{
		id: "roll1y",
		label: "Rolling 1Y"
	},
	{
		id: "roll3m",
		label: "Rolling 3M"
	},
	{
		id: "m",
		label: "Monthly"
	},
	{
		id: "w",
		label: "Weekly"
	},
	{
		id: "dd",
		label: "Drawdown"
	},
	{
		id: "gap",
		label: "Gap"
	}
];
var RANGES = [
	{
		id: "1M",
		label: "1M"
	},
	{
		id: "3M",
		label: "3M"
	},
	{
		id: "6M",
		label: "6M"
	},
	{
		id: "YTD",
		label: "YTD"
	},
	{
		id: "1Y",
		label: "1Y"
	},
	{
		id: "MAX",
		label: "MAX"
	},
	{
		id: "CUSTOM",
		label: "Custom"
	}
];
var STYLES = [
	{
		id: "area",
		label: "Area"
	},
	{
		id: "line",
		label: "Line"
	},
	{
		id: "step",
		label: "Step"
	},
	{
		id: "bar",
		label: "Bars"
	},
	{
		id: "columns",
		label: "Columns"
	}
];
function asStyle(s) {
	if (s === "line" || s === "step" || s === "bar" || s === "columns" || s === "area") return s;
	return "area";
}
function seriesRet(rows, key) {
	const first = rows.find((r) => {
		const v = r[key];
		return v != null && Number.isFinite(v) && v !== 0;
	});
	const last = [...rows].reverse().find((r) => {
		const v = r[key];
		return v != null && Number.isFinite(v);
	});
	if (!first || !last) return null;
	const a = first[key];
	const b = last[key];
	if (a == null || b == null || !a) return null;
	return (b / a - 1) * 100;
}
function fmtRet(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function lastOf(rows, key) {
	return [...rows].reverse().find((r) => r[key] != null && Number.isFinite(r[key]))?.[key] || 0;
}
function rangeStats(rows, rupee, yTitle) {
	const first = rows.find((r) => r.port != null && Number.isFinite(r.port));
	const last = [...rows].reverse().find((r) => r.port != null && Number.isFinite(r.port));
	if (!first || !last || first.port == null || last.port == null) return null;
	if (/%|pp/.test(yTitle)) return {
		port: last.port,
		bench: last.bench,
		kind: "last"
	};
	if (rupee || yTitle.startsWith("Indexed") || yTitle.startsWith("₹")) return {
		port: first.port ? (last.port / first.port - 1) * 100 : null,
		bench: first.bench && last.bench && first.bench !== 0 ? (last.bench / first.bench - 1) * 100 : null,
		kind: "ret"
	};
	return {
		port: last.port,
		bench: last.bench,
		kind: "last"
	};
}
function fmtChip(n, kind, rupee) {
	if (!Number.isFinite(n)) return "—";
	if (rupee && kind === "num") return niceY(n, true);
	const sign = n >= 0 ? "+" : "";
	if (kind === "pp") return `${sign}${n.toFixed(1)} pp`;
	return `${sign}${n.toFixed(1)}%`;
}
function fmtBuyDay(d) {
	const [y, m, day] = d.split("-");
	if (!y || !m || !day) return d;
	const mo = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number(m) - 1];
	if (!mo) return d;
	return `${Number(day)} ${mo} '${y.slice(2)}`;
}
function NavChart({ nav, portLabel = "Portfolio", benchLabel = "Benchmark", coverage, nowValue, metals, range: rangeProp, onRange, fromBuy, pathLabel, sameLabel, pathPrimary, hideBench, modes }) {
	const prefs = useKosh((s) => s.navPrefs);
	const theme = useKosh((s) => s.theme);
	const patchNavPrefs = useKosh((s) => s.patchNavPrefs);
	const [mode, setMode] = (0, import_react.useState)(modes?.[0] || "cum");
	const [rangeLocal, setRangeLocal] = (0, import_react.useState)(rangeProp || (pathPrimary ? "MAX" : "1Y"));
	const range = rangeProp || rangeLocal;
	const [customFrom, setCustomFrom] = (0, import_react.useState)("");
	const [customTo, setCustomTo] = (0, import_react.useState)("");
	function setRange(next) {
		setRangeLocal(next);
		onRange?.(next);
	}
	const [hover, setHover] = (0, import_react.useState)(null);
	const cardRef = (0, import_react.useRef)(null);
	const { fs, fallback, toggle } = useChartFullscreen(cardRef);
	const [mixOn, setMixOn] = (0, import_react.useState)(true);
	const [pathOn, setPathOn] = (0, import_react.useState)(true);
	const [sameOn, setSameOn] = (0, import_react.useState)(true);
	const [benchOn, setBenchOn] = (0, import_react.useState)(pathPrimary ? !hideBench : !hideBench && prefs.showBench);
	const smaOn = prefs.smaOn;
	const style = asStyle(prefs.style);
	const windowed = (0, import_react.useMemo)(() => sliceNav(nav || [], range, range === "CUSTOM" ? {
		from: customFrom,
		to: customTo
	} : void 0), [
		nav,
		range,
		customFrom,
		customTo
	]);
	const { rows, yTitle, bar } = (0, import_react.useMemo)(() => buildRows(windowed, mode, range === "CUSTOM" ? "MAX" : range, nowValue), [
		windowed,
		mode,
		range,
		nowValue
	]);
	const n = rows.length;
	const mixN = countable(rows, "port");
	const pathN = countable(rows, "path");
	const sameN = countable(rows, "sameCash");
	const benchN = countable(rows, "bench");
	const lineMode = !bar && style !== "bar" && style !== "columns";
	const showMix = (bar || mixOn) && mixN >= 2;
	const showBench = !hideBench && benchOn && benchN >= 2 && lineMode;
	const showPath = Boolean(pathLabel) && pathOn && pathN >= 2 && lineMode && (mode === "cum" || mode === "inr");
	const showSame = Boolean(sameLabel) && sameOn && sameN >= 2 && lineMode && (mode === "cum" || mode === "inr");
	const visKeys = [];
	if (showMix) visKeys.push("port");
	if (showBench) visKeys.push("bench");
	if (showPath) visKeys.push("path");
	if (showSame) visKeys.push("sameCash");
	const drawnN = visKeys.reduce((s, k) => Math.max(s, countable(rows, k)), 0);
	const mixStroke = pathPrimary ? PATH_STROKE : mode === "dd" ? DOWN_STROKE : MIX_STROKE;
	const benchStroke = pathPrimary ? SAME_STROKE : BENCH_STROKE;
	const rupee = mode === "inr";
	const fillOn = !bar && style === "area";
	const wantSma = smaOn && !bar && style !== "bar" && style !== "columns" && (mode === "cum" || mode === "inr" || mode === "gap");
	const sma = (0, import_react.useMemo)(() => wantSma ? smaRows(rows, 21) : [], [wantSma, rows]);
	const marks = (0, import_react.useMemo)(() => yearMarks(rows), [rows]);
	const ext = (0, import_react.useMemo)(() => extremes(rows, pathPrimary && showPath ? "path" : showMix ? "port" : visKeys[0] || "port"), [
		rows,
		pathPrimary,
		showPath,
		showMix,
		visKeys[0]
	]);
	const stats = rangeStats(rows, rupee, yTitle);
	const pathRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "path") : null;
	const sameRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "sameCash") : null;
	const mixRet = pathPrimary && stats?.kind === "ret" ? seriesRet(rows, "port") : null;
	const vsSame = pathRet != null && sameRet != null ? pathRet - sameRet : null;
	const svg = (0, import_react.useMemo)(() => buildSvgDoc({
		rows,
		bar,
		rupee,
		mixStroke,
		sma,
		years: marks,
		peak: ext.peak,
		showSma: wantSma && showMix,
		fill: fillOn && showMix,
		showBench,
		style: bar ? "bar" : style,
		showPath,
		showSame,
		showMix,
		pathPrimary,
		benchStroke,
		...plotChrome(theme)
	}), [
		rows,
		bar,
		rupee,
		mixStroke,
		sma,
		marks,
		ext.peak,
		wantSma,
		fillOn,
		showBench,
		style,
		showPath,
		showSame,
		showMix,
		pathPrimary,
		benchStroke,
		theme
	]);
	const img = (0, import_react.useMemo)(() => svgDataUrlSafe(svg), [svg]);
	const hiRow = hover != null ? rows[hover] : rows[n - 1];
	const { lo, hi } = domain(rows, visKeys.length ? visKeys : ["port"]);
	function onMove(e) {
		if (n < 2) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const t = (e.clientX - rect.left) / (rect.width || 1);
		const i = Math.round(Math.min(1, Math.max(0, t)) * (n - 1));
		setHover(i);
	}
	function saveChart() {
		const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `kosh-${mode}-${range}.svg`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
	function flip(which) {
		const nextMix = which === "mix" ? !mixOn : mixOn;
		const nextPath = which === "path" ? !pathOn : pathOn;
		const nextSame = which === "same" ? !sameOn : sameOn;
		const nextBench = which === "bench" ? !benchOn : benchOn;
		if (!(nextMix && mixN >= 2 || nextPath && Boolean(pathLabel) && pathN >= 2 || nextSame && Boolean(sameLabel) && sameN >= 2 || nextBench && !hideBench && benchN >= 2)) return;
		if (which === "mix") setMixOn(nextMix);
		if (which === "path") setPathOn(nextPath);
		if (which === "same") setSameOn(nextSame);
		if (which === "bench") {
			setBenchOn(nextBench);
			if (!hideBench && !pathPrimary) patchNavPrefs({ showBench: nextBench });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: cardRef,
		className: cn("rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]", fallback && "kosh-chart-fs", fs && "kosh-fs-live"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
					value: mode,
					onChange: setMode,
					options: modes?.length ? modes.map((id) => MODES.find((m) => m.id === id)).filter((m) => Boolean(m)) : MODES
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
					value: range,
					onChange: setRange,
					options: RANGES
				})]
			}),
			fromBuy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setCustomFrom(fromBuy);
						setCustomTo("");
						setRange("CUSTOM");
					},
					className: cn("h-8 rounded-sm px-2.5 text-[12px] font-medium shadow-[var(--shadow-border)]", range === "CUSTOM" && customFrom === fromBuy ? "bg-surface-2 text-fg" : "bg-bg text-muted hover:text-fg"),
					children: ["From buy ", fmtBuyDay(fromBuy)]
				})
			}) : null,
			range === "CUSTOM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5",
					children: ["From", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]",
						value: customFrom,
						onChange: (e) => setCustomFrom(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-1.5",
					children: ["To", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: "h-8 rounded-sm bg-bg px-2 text-[12px] text-fg shadow-[var(--shadow-border)]",
						value: customTo,
						onChange: (e) => setCustomTo(e.target.value)
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					metals?.present ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex rounded-sm bg-bg p-0.5 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-8 rounded-[6px] px-3 text-[12px] font-medium", !metals.included ? "bg-surface text-fg" : "text-muted"),
							onClick: () => metals.onChange(false),
							children: "Equity only"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-8 rounded-[6px] px-3 text-[12px] font-medium", metals.included ? "bg-surface text-fg" : "text-muted"),
							onClick: () => metals.onChange(true),
							children: "With gold & silver"
						})]
					}) : null,
					!bar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
						value: style,
						onChange: (id) => patchNavPrefs({
							style: id,
							fill: id === "area"
						}),
						options: STYLES
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", wantSma ? "bg-bg-elevated text-fg" : "text-muted"),
						onClick: () => patchNavPrefs({ smaOn: !smaOn }),
						children: ["21-session average ", wantSma ? "on" : "off"]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "inline-flex h-8 items-center justify-center rounded-sm px-3 text-[12px] leading-none text-muted shadow-[var(--shadow-border)] hover:text-fg",
						onClick: saveChart,
						children: "Save chart"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: fs ? "Exit fullscreen" : "Fullscreen",
						onClick: () => void toggle(),
						className: cn("inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-[12px] leading-none shadow-[var(--shadow-border)]", fs ? "bg-bg-elevated text-fg" : "text-muted hover:text-fg"),
						children: [fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" }), fs ? "Exit" : "Full"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					coverage ? `${coverage} · ${yTitle}` : yTitle,
					` · ${drawnN} points drawn`,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-muted",
						children: "Hover a day · tap a name to show or hide"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: portLabel,
							color: mixStroke,
							on: showMix,
							onClick: () => flip("mix")
						}),
						hideBench ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: benchLabel,
							color: benchStroke,
							on: showBench,
							dashed: pathPrimary,
							onClick: () => flip("bench")
						}),
						pathLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: pathLabel,
							color: PATH_STROKE,
							on: showPath,
							muted: true,
							onClick: () => flip("path")
						}) : null,
						sameLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesChip, {
							label: sameLabel,
							color: SAME_STROKE,
							on: showSame,
							dashed: true,
							onClick: () => flip("same")
						}) : null,
						wantSma ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 px-1 text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-block h-[3px] w-3.5 rounded-full",
								style: { background: SMA_STROKE }
							}), "21d avg"]
						}) : null
					]
				})]
			}),
			stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-3 font-mono text-[13px] tabular",
				children: pathPrimary && rupee && !pathLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: mixStroke },
					children: [
						portLabel,
						" ",
						niceY(lastOf(rows, "port"), true)
					]
				}) : null, showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: { color: benchStroke },
					children: [
						benchLabel,
						" ",
						niceY(lastOf(rows, "bench"), true)
					]
				}) : null] }) : pathPrimary && pathLabel && (mode === "cum" || mode === "inr") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					showPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: PATH_STROKE },
						children: [
							pathLabel,
							" ",
							rupee ? niceY(lastOf(rows, "path"), true) : fmtRet(pathRet)
						]
					}) : null,
					showSame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: SAME_STROKE },
						children: [
							sameLabel,
							" ",
							rupee ? niceY(lastOf(rows, "sameCash"), true) : fmtRet(sameRet)
						]
					}) : null,
					showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "opacity-60",
						style: { color: mixStroke },
						children: [
							portLabel,
							" ",
							rupee ? niceY(lastOf(rows, "port"), true) : fmtRet(mixRet)
						]
					}) : null,
					vsSame != null && showPath && showSame && !rupee ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: vsSame >= 0 ? "text-up" : "text-down",
						children: [
							"Vs same money ",
							vsSame >= 0 ? "+" : "",
							vsSame.toFixed(1),
							" pp"
						]
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: { color: mixStroke },
						children: [
							portLabel,
							" ",
							stats.kind === "ret" ? stats.port == null ? "—" : `${stats.port >= 0 ? "+" : ""}${stats.port.toFixed(1)}%` : stats.port == null ? "—" : niceY(stats.port, rupee)
						]
					}) : null,
					showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							benchLabel,
							" ",
							stats.kind === "ret" ? stats.bench == null ? "—" : `${stats.bench >= 0 ? "+" : ""}${stats.bench.toFixed(1)}%` : stats.bench == null ? "—" : niceY(stats.bench, rupee)
						]
					}) : null,
					showMix && showBench && stats.kind === "ret" && stats.port != null && stats.bench != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: stats.port - stats.bench >= 0 ? "text-up" : "text-down",
						children: [
							"Gap ",
							stats.port - stats.bench >= 0 ? "+" : "",
							(stats.port - stats.bench).toFixed(1),
							" pp"
						]
					}) : null
				] })
			}) : null,
			yTitle.startsWith("Indexed") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-[12px] leading-relaxed text-muted",
				children: pathPrimary ? `Growth is how the names you actually held did — extra money you added later is taken out. Switch to Rupees for the rupees you held. The dashed line is the same rupees in the index on the same days.` : `Both lines start at 100 on ${rows.find((r) => r.port != null && r.bench != null)?.day || "the first overlapping day"} of this ${range} window — not rupee prices. If the index sits lower, this name beat it over the window. It is not a scale error. Switch 1Y / 5Y / MAX to change the window; alpha and beta use the same slice, daily Jensen vs this index, Rf 6.5%.`
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "kosh-plot relative mt-3 w-full",
				"data-testid": "kosh-nav",
				"data-points": drawnN,
				"data-dlen": bar ? String(n) : seriesPath(rows, visKeys[0] || "port", lo, hi).length,
				onMouseMove: onMove,
				onMouseLeave: () => setHover(null),
				children: [drawnN < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-full place-items-center px-6 text-center text-sm text-muted",
					children: "Not enough daily prices to draw a line yet. Check Holdings if a ticker is still unresolved."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: img,
					alt: `${portLabel} versus ${benchLabel}`,
					width: 800,
					height: 300,
					className: "kosh-plot-img",
					"data-testid": "kosh-nav-img",
					decoding: "sync",
					loading: "eager"
				}), hover != null && rows[hover] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "kosh-plot-cross",
					style: { left: `${hover / Math.max(1, n - 1) * 100}%` }
				}) : null] }), hiRow && drawnN >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute top-2 right-2 z-10 rounded-sm bg-bg-elevated/90 px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-subtle",
							children: hiRow.day
						}),
						showPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-0.5 font-mono tabular",
							style: { color: PATH_STROKE },
							children: [
								pathLabel,
								" ",
								hiRow.path == null ? "—" : niceY(hiRow.path, rupee)
							]
						}) : null,
						showSame ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono tabular",
							style: { color: SAME_STROKE },
							children: [
								sameLabel,
								" ",
								hiRow.sameCash == null ? "—" : niceY(hiRow.sameCash, rupee)
							]
						}) : null,
						showMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("font-mono tabular", pathPrimary ? "mt-0.5 opacity-60" : "mt-0.5"),
							style: { color: mixStroke },
							children: [
								portLabel,
								" ",
								hiRow.port == null ? "—" : niceY(hiRow.port, rupee)
							]
						}) : null,
						showBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono tabular text-muted",
							children: [
								benchLabel,
								" ",
								hiRow.bench == null ? "—" : niceY(hiRow.bench, rupee)
							]
						}) : null,
						showMix && showBench && hiRow.port != null && hiRow.bench != null && !rupee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: hiRow.port - hiRow.bench >= 0 ? "text-up" : "text-down",
							children: fmtChip(hiRow.port - hiRow.bench, "pp", false)
						}) : null
					]
				}) : null]
			}),
			drawnN >= 2 && ext.peak.i >= 0 ? rupee && pathPrimary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 text-[12px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					label: "Highest",
					value: niceY(ext.peak.v, rupee),
					hint: ext.peak.day
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
					label: "Lowest",
					value: niceY(ext.trough.v, rupee),
					hint: ext.trough.day
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Peak",
						value: niceY(ext.peak.v, rupee),
						hint: ext.peak.day
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Trough",
						value: niceY(ext.trough.v, rupee),
						hint: ext.trough.day
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Best session",
						value: fmtChip(ext.best.ch, "pct", false),
						hint: ext.best.day,
						tone: ext.best.ch >= 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						label: "Worst session",
						value: fmtChip(ext.worst.ch, "pct", false),
						hint: ext.worst.day,
						tone: ext.worst.ch >= 0 ? "up" : "down"
					})
				]
			}) : null
		]
	});
}
function svgDataUrlSafe(svg) {
	return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function Highlight({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-3 py-2 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] tracking-[0.08em] text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-0.5 font-mono text-[13px] tabular", tone === "up" && "text-up", tone === "down" && "text-down"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted",
				children: hint
			})
		]
	});
}
function SeriesChip({ label, color, on, muted, dashed, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": on,
		title: on ? `Hide ${label}` : `Show ${label}`,
		onClick,
		className: cn("inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] leading-none shadow-[var(--shadow-border)]", on ? "bg-bg-elevated text-fg" : "text-subtle line-through decoration-subtle", muted && on && "opacity-70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-block h-[3px] w-3.5 shrink-0 rounded-full",
			style: dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${on ? color : "#6e6e76"} 0 3px, transparent 3px 5px)` } : { background: on ? color : "#6e6e76" }
		}), label]
	});
}
//#endregion
export { NavChart as t };
