import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as Plus } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { $t as HeroMix, G as fmtPct, en as HeroSleeves, q as fmtTapePx, rr as cn, s as applyScreen, sn as Button } from "./router-BGlqc6-G.mjs";
import { f as apiScreener, g as apiTape, s as apiNews } from "./api-DLVfETZc.mjs";
import { t as MixNudge } from "./mix-nudge-Cy8H1SXJ.mjs";
import { i as SkipToMain, r as SiteFooter, t as LandingHeader } from "./site-chrome-C4f5Imyu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DWI07ZJb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useInView(once = true) {
	const ref = (0, import_react.useRef)(null);
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
			setOn(true);
			return;
		}
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return;
			setOn(true);
			if (once) io.disconnect();
		}, {
			threshold: .22,
			rootMargin: "0px 0px -8% 0px"
		});
		io.observe(el);
		return () => io.disconnect();
	}, [once]);
	return {
		ref,
		on
	};
}
function Reveal({ children, className, delay = 0 }) {
	const { ref, on } = useInView();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: cn(on ? "kosh-in" : "kosh-pre", className),
		style: { animationDelay: `${delay}ms` },
		children
	});
}
var WINDOWS = [
	{
		k: "1W",
		mix: "+1.4%",
		nifty: "+0.9%",
		up: true
	},
	{
		k: "1M",
		mix: "+3.8%",
		nifty: "+2.1%",
		up: true
	},
	{
		k: "3M",
		mix: "+8.2%",
		nifty: "+5.4%",
		up: true
	},
	{
		k: "6M",
		mix: "+12.1%",
		nifty: "+8.6%",
		up: true
	},
	{
		k: "1Y",
		mix: "+18.4%",
		nifty: "+10.3%",
		up: true
	},
	{
		k: "YTD",
		mix: "+9.1%",
		nifty: "+6.0%",
		up: true
	}
];
function WindowsPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
		children: WINDOWS.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "kosh-rise rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
			style: { animationDelay: `${i * 70}ms` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: w.k
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 text-[12px] text-muted",
					children: ["You ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-up",
						children: w.mix
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-0.5 text-[12px] text-muted",
					children: ["Nifty ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-fg",
						children: w.nifty
					})]
				})
			]
		}, w.k))
	});
}
var FEATURES = [
	{
		k: "Improve Portfolio",
		t: "A recommendation at the top",
		d: "Concentration, dated XIRR, sector bets, and analysis on large weights — one page that says what to do next.",
		to: "/app"
	},
	{
		k: "Multibagger analysis",
		t: "Fundamental · Qualitative",
		d: "On every stock: a six-block fundamental, and a qualitative catalyst verdict with multi-bagger potential. You start them.",
		to: "/s/$symbol",
		symbol: "RELIANCE"
	},
	{
		k: "Find names",
		t: "Not another PE sort",
		d: "Quality compounder. Emerging compounder. Turnaround. Built for names that can actually change earnings power — missing data is never a pass.",
		to: "/screen"
	},
	{
		k: "Markets",
		t: "Terminal and Overview",
		d: "Watch a chart, or read what the cash market is doing today. One click between them.",
		to: "/markets"
	},
	{
		k: "Your portfolio vs Nifty",
		t: "When you have holdings",
		d: "Drop a broker file. One line versus the index. Gold and silver sit next to equity.",
		to: "/app"
	},
	{
		k: "Chart that stays put",
		t: "Timeframe is the bar",
		d: "Switch 1D to 1W without wiping analysis, drawings, or the rest of the page.",
		to: "/s/$symbol",
		symbol: "RELIANCE"
	}
];
var STEPS = [
	{
		n: "01",
		t: "Add your portfolio",
		d: "Drop a broker file. Quantity, average cost, and buy date when the sheet has them. Or type tickers."
	},
	{
		n: "02",
		t: "Pick an index",
		d: "Nifty 50, Sensex, Bank Nifty, IT, Pharma, Midcap — or paste any listed ticker."
	},
	{
		n: "03",
		t: "Read it — or Improve Portfolio",
		d: "Growth, rupees, rolling returns, XIRR when dates exist, and a recommendation at the top of Improve Portfolio."
	}
];
var FAQ = [
	{
		q: "What is Fundamental and Qualitative?",
		a: "On every stock page. Fundamental is the multi-bagger lens: interconnected economics, score, stars, and one of six verdicts. Qualitative is catalyst quality over 2–5 years with an explicit multi-bagger potential label. Not a pass/fail stamp."
	},
	{
		q: "How does the portfolio chart work without buy dates?",
		a: "Kosh takes the stocks you hold today, in today’s sizes, and asks: how would this portfolio have moved on each stock’s own daily prices? It is not a reconstruction of what you held in 2018. It is a read of the portfolio in front of you. XIRR needs buy dates — add them on Holdings."
	},
	{
		q: "Do I need buy dates or average prices?",
		a: "Average cost helps unrealised P&L. Buy dates unlock XIRR. The chart versus the index does not need them."
	},
	{
		q: "Where do prices come from?",
		a: "Live market data vendors, IST calendar. Some Nifty sector indices only print a stub — we then use the ETF that actually has a series."
	},
	{
		q: "Can I add gold and silver?",
		a: "Yes. Under Add holdings → Gold & silver. Live MCX: gold as ₹/10g, silver as ₹/kg. You still type grams; average cost is ₹/g. A switch on every portfolio includes or excludes metals from the chart."
	},
	{
		q: "Guest or account?",
		a: "Guest keeps the portfolio in this browser. Sign in with Google, X, or email and it follows you. Kosh is not a broker, not advice, not SEBI-registered."
	}
];
function Tape() {
	const rows = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: 6e4
	}).data || [];
	if (!rows.length) return null;
	const items = [...rows, ...rows];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden border-b border-border bg-bg-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kosh-tape-track inline-flex w-max gap-8 px-4 py-2 text-[12px] text-muted",
			children: items.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap",
				children: [
					t.label,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "font-mono font-medium text-fg tabular",
						children: t.price ? fmtTapePx(t.price) : "—"
					}),
					t.unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-subtle",
						children: t.unit
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-mono tabular", t.changePct >= 0 ? "text-up" : "text-down"),
						children: t.changePct ? fmtPct(t.changePct) : ""
					})
				]
			}, t.id + "-" + i))
		})
	});
}
function HeroBoard() {
	const rows = useQuery({
		queryKey: ["tape"],
		queryFn: apiTape,
		staleTime: 6e4
	}).data || [];
	const focus = rows[0];
	const last = focus?.price || 0;
	const pct = focus?.changePct ?? 0;
	const prev = last && Number.isFinite(pct) ? last / (1 + pct / 100) : 0;
	const abs = last && prev ? last - prev : null;
	const up = pct >= 0;
	const mini = rows.slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-[28px] bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium tracking-[0.08em] text-subtle uppercase",
					children: "Markets Terminal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-[13px] font-semibold",
					children: focus?.label || "Nifty 50"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-fg",
							children: "LOG"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm px-1.5 py-0.5 text-[10px] text-muted",
							children: "1D"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm px-1.5 py-0.5 text-[10px] text-muted",
							children: "W"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm px-1.5 py-0.5 text-[10px] text-muted",
							children: "M"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-[200px] overflow-hidden rounded-lg bg-bg sm:h-[220px]",
				children: [
					[
						18,
						38,
						58,
						78
					].map((top) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute right-14 left-3 border-t",
						style: {
							top: `${top}%`,
							borderColor: "var(--color-chart-grid)"
						}
					}, top)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-3 right-2 bottom-3 flex w-11 flex-col justify-between font-mono text-[9px] text-subtle tabular",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: last ? fmtTapePx(last * 1.04) : "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: last ? fmtTapePx(last) : "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: last ? fmtTapePx(last * .96) : "—" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-6 right-16 bottom-8 left-6 flex items-stretch gap-2",
						children: [
							.22,
							.38,
							.18,
							.42,
							.3,
							.26,
							.34,
							.2
						].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "absolute top-[8%] bottom-[10%] left-1/2 w-px -translate-x-1/2",
								style: { background: i % 3 === 1 ? "var(--color-down)" : "var(--color-up)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "absolute left-[28%] right-[28%] rounded-[1px]",
								style: {
									top: `${18 + i % 4 * 8}%`,
									height: `${h * 100}%`,
									background: i % 3 === 1 ? "var(--color-down)" : "var(--color-up)"
								}
							})]
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-2 left-2 flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-surface px-1.5 py-0.5 text-[9px] text-muted shadow-[var(--shadow-border)]",
							children: "Draw"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-surface px-1.5 py-0.5 text-[9px] text-muted shadow-[var(--shadow-border)]",
							children: "Pattern"
						})]
					}),
					last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-12 rounded-sm px-1 py-0.5 font-mono text-[9px] tabular",
						style: {
							top: "42%",
							background: up ? "var(--color-up)" : "var(--color-down)",
							color: "var(--color-bg)"
						},
						children: fmtTapePx(last)
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-mono text-[13px] tabular",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: last ? fmtTapePx(last) : "—"
					}), abs != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("ml-2", up ? "text-up" : "text-down"),
						children: [
							abs >= 0 ? "+" : "",
							fmtTapePx(Math.abs(abs)),
							" · ",
							fmtPct(pct)
						]
					}) : pct ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("ml-2", up ? "text-up" : "text-down"),
						children: fmtPct(pct)
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/markets",
					search: { view: "terminal" },
					className: "text-[12px] font-semibold text-chart hover:underline",
					children: "Open Terminal →"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-1.5",
				children: (mini.length ? mini : Array.from({ length: 4 }, () => null)).map((t, i) => t ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-md bg-bg-elevated px-2 py-1.5 font-mono text-[11px] tabular",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[11px] font-semibold",
						children: t.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: t.changePct >= 0 ? "text-up" : "text-down",
						children: t.changePct ? fmtPct(t.changePct) : "—"
					})]
				}, t.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 animate-pulse rounded-md bg-bg-elevated" }, i))
			})
		]
	});
}
function Morning() {
	const screen = useQuery({
		queryKey: ["screener"],
		queryFn: apiScreener,
		staleTime: 6e5
	});
	const news = useQuery({
		queryKey: [
			"news",
			"NIFTY",
			"market"
		],
		queryFn: () => apiNews("NIFTY", "Nifty Sensex Indian stock market"),
		staleTime: 6e5
	});
	const rows = screen.data?.rows || [];
	const up = applyScreen(rows, "up").slice(0, 5);
	const down = applyScreen(rows, "down").slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "today",
		className: "scroll-mt-16 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
						children: "Today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 max-w-[18ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight",
						children: "What moved. Then open any name."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-[15px] leading-relaxed text-muted",
						children: "Overview for breadth, movers, and Pulse. Terminal to watch a chart. A stock page for the full write-up."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-6 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
							title: "Winners",
							rows: up,
							loading: screen.isPending
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
							title: "Losers",
							rows: down,
							loading: screen.isPending
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
								children: "Headlines"
							}), news.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "Fetching headlines…"
							}) : news.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 grid gap-2.5",
								children: news.data.slice(0, 5).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: n.link,
									target: "_blank",
									rel: "noreferrer",
									className: "block text-[13px] leading-snug hover:text-chart",
									children: n.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-[11px] text-subtle",
									children: n.publisher
								})] }, n.link + n.title))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "No market headlines right now."
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/markets",
								search: { view: "terminal" },
								children: "Open Markets Terminal →"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/markets",
								search: { view: "overview" },
								children: "View market overview"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/s/$symbol",
								params: { symbol: "RELIANCE" },
								children: "Sample: Reliance"
							})
						})
					]
				})
			]
		})
	});
}
function Board({ title, rows, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-[12px] font-semibold tracking-[0.08em] text-muted uppercase",
			children: title
		}), loading && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Loading prices…"
		}) : rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 grid gap-0.5",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$symbol",
				params: { symbol: r.symbol },
				className: "flex items-center justify-between rounded-sm px-1 py-1.5 hover:bg-bg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-[13px]",
					children: r.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("ml-3 shrink-0 font-mono text-[13px] tabular", r.changePct >= 0 ? "text-up" : "text-down"),
					children: fmtPct(r.changePct)
				})]
			}) }, r.symbol))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Waiting on live prices."
		})]
	});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipToMain, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				id: "main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kosh-rise text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
									children: "Indian stocks · Markets Terminal · Improve Portfolio"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "kosh-rise mt-3 max-w-[18ch] text-[clamp(2.15rem,1.2rem+3vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.035em]",
									style: { animationDelay: "70ms" },
									children: ["Watch the market. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-chart",
										children: "Understand the stock."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kosh-rise mt-4 max-w-md text-[16px] leading-relaxed text-muted",
									style: { animationDelay: "140ms" },
									children: "A charting workspace, a morning overview, and a full read of any name you hold — without pretending a pattern is a forecast."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "kosh-rise mt-7 flex flex-wrap items-center gap-3",
									style: { animationDelay: "210ms" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/markets",
												search: { view: "terminal" },
												children: "Open Markets Terminal →"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "secondary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/markets",
												search: { view: "overview" },
												children: "View market overview"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "ghost",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/app",
												children: "Improve Portfolio"
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kosh-rise mt-3 text-[12px] text-subtle",
									style: { animationDelay: "280ms" },
									children: "Guest stays on this device. An account keeps a portfolio with you."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "kosh-rise",
							style: { animationDelay: "120ms" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroBoard, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mx-auto grid max-w-6xl gap-3 px-4 pb-12 md:grid-cols-3",
						children: [
							{
								k: "Improve Portfolio",
								t: "See what to change",
								d: "Concentration, XIRR, and analysis on large weights — a recommendation at the top.",
								to: "/app"
							},
							{
								k: "Multibagger analysis",
								t: "Run it on any stock",
								d: "Fundamental + qualitative, with a native verdict and multi-bagger potential.",
								href: "/s/RELIANCE"
							},
							{
								k: "Find names",
								t: "Sound and turnaround screens",
								d: "Not another PE sort. Ranked on the numbers we have, with leftover checks listed.",
								to: "/screen"
							}
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: c.to || "/s/$symbol",
							params: c.href ? { symbol: "RELIANCE" } : void 0,
							className: "group rounded-xl border-l-[4px] border-l-chart bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
									children: c.k
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 text-[18px] font-semibold tracking-tight group-hover:text-chart",
									children: c.t
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-[13px] leading-snug text-muted",
									children: c.d
								})
							]
						}, c.k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Morning, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto max-w-6xl px-4 py-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixNudge, { where: "landing" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						id: "quality",
						className: "scroll-mt-16 border-t border-border bg-bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
									children: "Fundamental · Qualitative"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 max-w-[16ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight",
									children: "Multibagger analysis. On the stock."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 max-w-md text-[15px] leading-relaxed text-muted",
									children: "Fundamental analysis is the numbers and the company. Qualitative analysis is management, industry, brand, and whether that stack can compound. They sit at the top of a stock page and fold away when you open the chart."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/s/$symbol",
											params: { symbol: "RELIANCE" },
											children: "Read Reliance"
										})
									})
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] font-semibold tracking-[0.14em] text-chart uppercase",
											children: "Fundamental"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 text-[16px] font-semibold tracking-tight",
											children: "Is the company sound?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[13px] leading-relaxed text-muted",
											children: "Profitability, balance sheet, growth, valuation, ownership. The numbers we have, then the argument. Not a pass/fail stamp."
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-lg border-l-[3px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] font-semibold tracking-[0.14em] text-warn uppercase",
											children: "Qualitative"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 text-[16px] font-semibold tracking-tight",
											children: "Can it compound from here?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[13px] leading-relaxed text-muted",
											children: "Management, industry, brand, how the factors stack. The multi-bagger argument — not a yes/no badge."
										})
									]
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-6 sm:grid-cols-2",
								children: FEATURES.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
									delay: i * 60,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: f.to,
										params: "symbol" in f && f.symbol ? { symbol: f.symbol } : void 0,
										className: "block rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] font-medium tracking-[0.08em] text-chart uppercase",
												children: f.k
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "mt-2 text-[17px] font-semibold tracking-tight",
												children: f.t
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-[13px] leading-relaxed text-muted",
												children: f.d
											})
										]
									})
								}, f.k))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
								delay: 80,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroSleeves, {})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						id: "read",
						className: "scroll-mt-16 border-t border-border bg-bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-6xl px-4 py-16",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
									children: "When you have a portfolio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 max-w-xl text-[15px] leading-relaxed text-muted",
									children: "Upload what you hold today. See it versus the index — growth, drawdown, rolling windows."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-8 grid gap-8 md:grid-cols-3",
									children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
										delay: i * 90,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-mono text-[13px] text-chart tabular",
												children: s.n
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-2 text-lg font-semibold tracking-tight",
												children: s.t
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-[13px] leading-relaxed text-muted",
												children: s.d
											})
										]
									}, s.n))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-12",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-4 text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
											children: "Then every window versus the index"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mb-6",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMix, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowsPreview, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-[12px] text-subtle",
											children: "Sample illustration · open a portfolio for live numbers."
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						id: "faq",
						className: "scroll-mt-16 border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-6xl px-4 py-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[12px] font-medium tracking-[0.16em] text-chart uppercase",
								children: "FAQ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-[18ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight",
								children: "What the numbers are — and are not."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 max-w-3xl",
								children: FAQ.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "group border-b border-border py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
										className: "flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium tracking-tight [&::-webkit-details-marker]:hidden",
										children: [f.q, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 shrink-0 text-subtle transition-transform duration-150 group-open:rotate-45" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-2xl pb-1 text-[14px] leading-relaxed text-muted",
										children: f.a
									})]
								}, f.q))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "max-w-[16ch] text-[clamp(1.6rem,1.1rem+1.8vw,2.35rem)] font-semibold tracking-tight",
								children: "Start on Markets. Add a portfolio when you want."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-md text-sm text-muted",
								children: "Live prices and any stock page work as a guest. Eight NSE names in the sample if you want holdings versus Nifty 50. An account keeps it with you."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/markets",
										children: "Open markets"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/app",
										children: "My portfolio"
									})
								})]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Landing as component };
