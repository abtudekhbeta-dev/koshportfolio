//#region node_modules/.nitro/vite/services/ssr/assets/metrics-CHa60zg7.js
var METRICS = {
	value: {
		id: "value",
		label: "Current value",
		short: "What these holdings are worth at the last live price.",
		hover: "Quantity × last price, added up. Updates with the market.",
		deep: "This is a snapshot, not a ledger. It uses the last Yahoo price for each stock. It does not subtract cash, loans, or pending orders. If a ticker cannot be priced, that line is skipped.",
		better: 1
	},
	invested: {
		id: "invested",
		label: "Invested",
		short: "What you paid, if average price is filled in.",
		hover: "Average buy price × quantity. If average price is blank, we use today’s value so the line is not zero.",
		deep: "Unrealised profit only works when the broker file has an average cost. Buy dates are optional and do not change this number. Corporate actions can make broker average cost differ from Yahoo’s adjusted series — that is expected.",
		better: 0
	},
	day: {
		id: "day",
		label: "Today",
		short: "Move since the previous close, in rupees and percent.",
		hover: "A single-stock jump above 25% is ignored so a split or bad tick does not fake a huge day.",
		deep: "Day P&L is last price versus previous close, times quantity. Splits, bonus issues, and bad Yahoo ticks can print a 30–100% gap for one session. Kosh drops any one-name move above 25% so the day figure stays usable.",
		better: 1
	},
	unreal: {
		id: "unreal",
		label: "Unrealised P&L",
		short: "Current value minus what you paid.",
		hover: "Needs average price on the holding. Blank average → this line stays 0.",
		deep: "Unrealised means you have not sold. It is not tax P&L, and it is not the chart. The chart uses today’s holdings going back in time; this number uses the prices you actually paid, if the file included them.",
		better: 1
	},
	w1: {
		id: "w1",
		label: "1 week",
		short: "Return over the last 7 calendar days.",
		hover: "How much the portfolio moved in a week, versus the index on the same days.",
		deep: "Taken from today’s holdings: today’s weights on each stock’s own daily adjusted close. A stock that did not trade is carried at last close. Days covering under 60% of the portfolio are skipped.",
		better: 1
	},
	m1: {
		id: "m1",
		label: "1 month",
		short: "Return over the last 31 days.",
		hover: "Short window — one event can dominate. Compare with the index next to it.",
		deep: "Useful for “what just happened”. Not a verdict on the portfolio. A 1-month gap versus Nifty can reverse the next month. Read it with 1 year and max drawdown.",
		better: 1
	},
	m3: {
		id: "m3",
		label: "3 months",
		short: "Return over the last quarter.",
		hover: "A cleaner read than 1 month. Still noisy around results season.",
		deep: "Three months is the shortest window most investors treat as a ‘stretch’. Still too short for CAGR or Sharpe. Use it to see if a recent run is the portfolio or the whole market.",
		better: 1
	},
	m6: {
		id: "m6",
		label: "6 months",
		short: "Return over the last half year.",
		hover: "Halfway between a quarter and a year. Good for catching a regime change.",
		deep: "If 6-month and 1-year disagree, the portfolio’s character changed recently. Check the monthly heatmap for the months that did the work.",
		better: 1
	},
	y1: {
		id: "y1",
		label: "1 year",
		short: "Return over the last 365 days.",
		hover: "The headline window versus the index. Green gap means the portfolio beat the index.",
		deep: "One year is the default investor question: did this portfolio beat Nifty? It still includes one market mood. Pair it with max drawdown (how rough the ride was) and 3-year / CAGR when the history is long enough.",
		better: 1
	},
	ytd: {
		id: "ytd",
		label: "Year to date",
		short: "Return since 1 January this year.",
		hover: "Resets every calendar year. Do not compare a January YTD with a December YTD.",
		deep: "YTD is a calendar cut, not a holding period. Early in the year it is almost noise. Use 1 year if you want a fair window.",
		better: 1
	},
	cagr: {
		id: "cagr",
		label: "CAGR",
		short: "Annualised growth of this portfolio, using today’s weights.",
		hover: "Compound annual growth on the portfolio path. Not the return of cash you actually put in over time.",
		deep: "CAGR here answers: if you had held today’s stocks, in today’s sizes, for this whole history, what yearly rate would that path have compounded at? It ignores deposits, withdrawals, and the dates you really bought. That is intentional — a holdings snapshot cannot reconstruct old cashflows.",
		better: 1
	},
	sharpe: {
		id: "sharpe",
		label: "Sharpe",
		short: "Extra return per unit of total volatility. Higher is better.",
		hover: "Uses a 6.5% risk-free rate. A dash means the history is too short to trust.",
		deep: "Sharpe = (annualised portfolio return − 6.5%) / annualised volatility. It punishes both upside and downside swings. Two portfolios with the same return: the calmer one scores higher. Above ~1 is solid in Indian equities; below 0 means you earned less than a 6.5% deposit for the risk taken. Never a fake 0.00 — too little data prints a dash.",
		better: 1
	},
	sortino: {
		id: "sortino",
		label: "Sortino",
		short: "Like Sharpe, but only penalises falling days.",
		hover: "Upside volatility is allowed. Downside deviation is the risk.",
		deep: "Investors care more about losses than about the portfolio running up. Sortino uses only negative daily returns in the denominator. A high Sortino with a middling Sharpe means the portfolio was jumpy on the way up — usually acceptable. A low Sortino means the bad days were violent.",
		better: 1
	},
	alpha: {
		id: "alpha",
		label: "Alpha",
		short: "Return beyond what the portfolio’s beta versus the index would imply.",
		hover: "Jensen’s alpha, annualised, versus the chosen index. Last 1 year of overlap on the risk page; the selected chart window on a stock page.",
		deep: "Alpha is computed on overlapping sessions where both the portfolio (or stock) and the index have a print. Daily returns are aligned. Jensen’s alpha = Rp − Rf − β(Rb − Rf), annualised, Rf = 6.5%. On the risk page this defaults to the last 1 year of overlap (about 250 sessions). On a stock versus-index chart it uses the window you selected (1Y / 5Y / MAX). Positive alpha means the path did better than a levered index. Sector bets create alpha too.",
		better: 1
	},
	beta: {
		id: "beta",
		label: "Beta",
		short: "How hard the portfolio moves when the index moves.",
		hover: "1.0 ≈ the index. Above 1 is more aggressive. Below 1 is more defensive. Last 1 year of overlap unless the chart window says otherwise.",
		deep: "Beta = covariance(daily return, index daily return) / variance(index), on overlapping sessions only. Both series are rebased to 100 on the first day they both print in that window, so the chart lines start together. A 1% index day at beta 1.3 tends to be a 1.3% portfolio day. The risk page uses the last 1 year (about 250 sessions). On a stock versus-index chart, switch 1Y / 5Y / MAX to recompute. High beta is not ‘better’ — it is more market.",
		better: 0
	},
	corr: {
		id: "corr",
		label: "Correlation",
		short: "How tightly the portfolio tracks the index, from −1 to 1.",
		hover: "Near 1 = the portfolio is almost the index. Lower = more independent.",
		deep: "A diversified Indian equity portfolio often sits at 0.85–0.95 versus Nifty. Very high correlation plus lagging 1-year return means you took index risk and lost the race. Lower correlation can be concentrated sector bets — check the Sectors tab.",
		better: 0
	},
	vol: {
		id: "vol",
		label: "Volatility",
		short: "How jumpy the portfolio is, annualised.",
		hover: "Lower means a smoother ride. Nifty is often around 12–18%.",
		deep: "Annualised standard deviation of daily portfolio returns (× √252). It does not say whether the jumps were up or down. Pair with max drawdown. A high-vol portfolio can still have a high Sharpe if the drift is strong.",
		better: -1
	},
	maxDd: {
		id: "maxDd",
		label: "Max drawdown",
		short: "Worst peak-to-trough fall on this portfolio.",
		hover: "The deepest loss from a high. Closer to 0 is better (less painful).",
		deep: "If the portfolio ran 100 → 140 → 98, max drawdown is about −30%. It is the number that tells you whether you would have held. It uses today’s holdings path, not your personal high-water mark. Recovery time is not shown — look at the Drawdown chart mode.",
		better: 1
	},
	upCap: {
		id: "upCap",
		label: "Up capture",
		short: "Share of the index’s up days that the portfolio captured.",
		hover: "100% = kept pace on green days. Above 100% = ran hotter than the index.",
		deep: "Up capture = average portfolio return on index-up days / average index return on those days. 80% with 60% down capture is a defensive portfolio that still participates. 120% up with 130% down is a high-beta portfolio.",
		better: 1
	},
	downCap: {
		id: "downCap",
		label: "Down capture",
		short: "How much of the index’s down days the portfolio took.",
		hover: "Below 100% means it fell less than the index. Lower is better.",
		deep: "The most practical risk number for many investors. 70% down capture means when Nifty had a bad day, the portfolio typically lost about 70% as much. Combined with up capture it describes the ride without needing Greek letters.",
		better: -1
	},
	info: {
		id: "info",
		label: "Information ratio",
		short: "Extra return versus the index, per unit of tracking error.",
		hover: "How cleanly the portfolio beat (or lagged) the index, after noise.",
		deep: "Information ratio = annualised excess return / tracking error. A high IR means the gap versus the index is consistent, not one lucky month. Below 0 means you lagged. Needs a long enough overlapping series; otherwise a dash.",
		better: 1
	},
	calmar: {
		id: "calmar",
		label: "Calmar",
		short: "CAGR divided by the depth of the worst fall.",
		hover: "Return per unit of max drawdown. Higher is a kinder ride for the growth you got.",
		deep: "Calmar = CAGR / |max drawdown|. Two portfolios at 14% CAGR: the one that never fell more than 18% beats the one that fell 40%. Sensitive to a single crash in the sample — read with the drawdown chart.",
		better: 1
	},
	weight: {
		id: "weight",
		label: "Weight",
		short: "This line as a share of the portfolio.",
		hover: "Value of the holding ÷ total value. Used as today’s weights for the 10-year chart.",
		deep: "Weights are live. They change with prices. The history chart always uses the weights you have now, not the weights you had in 2018. That is how the chart is built: today’s weights, taken back through each stock’s daily prices.",
		better: 0
	},
	coverage: {
		id: "coverage",
		label: "Coverage",
		short: "How many names and days actually made the chart.",
		hover: "Names Yahoo could price, and days where at least 60% of the portfolio had a price.",
		deep: "A late listing does not delete earlier days. Missing names are skipped, not fatal. If coverage is thin, the path is still drawn from whatever Yahoo has — check skipped tickers on Performance.",
		better: 0
	}
};
function metric(id) {
	return METRICS[id] || {
		id,
		label: id,
		short: "",
		hover: "",
		deep: "",
		better: 0
	};
}
//#endregion
export { metric as n, METRICS as t };
