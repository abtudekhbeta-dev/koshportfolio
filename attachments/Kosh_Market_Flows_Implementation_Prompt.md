# Kosh Market Overview — Market Flows & Historical Pattern Intelligence
## Complete implementation prompt for Grok Build / coding agent

You are modifying the existing Kosh investment-intelligence application. Implement a production-quality **Market Flows & Historical Pattern Intelligence** module integrated into the existing **Market Overview** page. This specification is the source of truth. Inspect the current repository and existing app architecture first; preserve current business logic and visual identity unless this prompt explicitly changes something.

## 1. Product objective

Build a focused, evidence-led feature that helps an Indian equity investor understand:
1. What the market and institutional flows are doing now.
2. Whether flow behaviour supports, opposes or diverges from market performance.
3. How the current situation compares with previous historical periods.
4. What actually happened after those historical periods.
5. What conditional future scenarios are supported by the evidence, what could invalidate them, and how strong the evidence is.

This is not a generic market dashboard and must not become a crowded wall of indicators. It must remain simple in Market Overview, with a clear route to a full-fledged analysis workspace.

## 2. Required placement in Market Overview

On the existing Market Overview page, add a compact module **directly below the existing Winners & Losers table**. Do not move, remove, or redesign the Winners & Losers table. Do not change the overall page layout, top navigation, app shell, existing theme, colour palette, typography, card language, spacing system, or other Market Overview features.

The Market Overview module is a concise summary, not the full analysis page. It should contain:
- Heading: **Market Flows & Pattern Intelligence**.
- One-line explanation: “See whether institutional flows are supporting the market—and how similar historical setups evolved.”
- Compact daily/weekly/monthly timeframe switch.
- A polished mini-chart showing Nifty 50 performance and FII/FPI + DII net cash flows, with sensible visual separation of index and rupee units.
- Small summary metrics for selected timeframe: index return, FII/FPI net flow, DII net flow, and a derived flow-balance metric only if clearly defined.
- One concise deterministic Kosh verdict, e.g. “Domestic institutional buying is offsetting foreign selling; the index trend has not confirmed a recovery.” Verdict must be generated from actual current data and transparent rules, not hardcoded text.
- A small “Historical context” insight showing either a valid computed analogue or a clear “Not enough comparable history” state. Do not invent an analogue.
- Clear button/link: **Open full analysis**. This opens a dedicated full-page analysis view (route or existing app navigation pattern) with all controls and advanced analysis.

The compact module must load quickly and not request full chart history for all securities. It should fetch the minimum data needed for the summary and load detailed history only after opening the full analysis view.

## 3. Full analysis workspace

Create a dedicated full-page view using Kosh's existing Classic visual language. Do not introduce a new theme or permanent left sidebar. The page should feel native to Kosh, professional, aligned, restrained and data-dense without clutter.

### Page hierarchy
1. Breadcrumb: Market Overview / Market Flows.
2. Title and concise explanatory subtitle.
3. Data freshness, source status and methodology access.
4. KPI strip: index return, FII/FPI net flow, DII net flow, combined FII+DII net flow (clearly labelled as a derived sum, not “total market flow”).
5. Main interactive chart as the visual centrepiece.
6. Kosh Analysis (no AI) and AI Deep Analysis modes.
7. Historical analogues and forward outcome evidence.
8. Conditional scenarios, risks and invalidation conditions.
9. Data quality, source methodology and limitations.

## 4. Data principles and source reliability

Prioritise public, official, stable, backend-accessible data. Before implementation, inspect current available data providers and repository patterns. Verify the source's actual download/API mechanism, historical coverage, update frequency, terms and redistribution rights. Do not assume that a page being public means it has an easy or permitted machine-readable endpoint.

### Core data for MVP
- Official daily FII/FPI and DII cash-market activity, preferably combined-exchange figures where clearly defined and consistently available.
- Nifty 50 historical index values/returns. Add Sensex only if reliable history is accessible without making the ingestion layer brittle.
- Official trading calendar/holiday handling if available.
- Source publication/observation date, retrieved timestamp, provisional/final status, data period, and revision history when possible.

### Potential contextual data (add only after quality and access validation)
Use broader market context to improve analysis where it is reliable, accessible and has adequate history:
- Broad index performance: Nifty 50, Nifty 500, Nifty Midcap and Smallcap indices; Sensex if useful.
- Market breadth: advances/declines, percentage of constituents above selected moving averages, new highs/lows, and sector participation.
- Sector returns and concentration: identify whether index moves were broad-based or driven by a few heavyweight sectors/stocks.
- Volatility: India VIX and realised index volatility.
- Global market regime: S&P 500/Nasdaq, relevant Asian indices, US Treasury yields and US dollar index where historical quality and timestamps are clear.
- INR, crude oil and other macro variables only when a documented rationale exists and reliable history is accessible.
- Derivatives positioning only as a separately labelled contextual layer, not as cash-market net flows. Do not equate “Client” with retail or HNI, and do not treat options activity alone as directional conviction.
- Monthly AMFI equity-fund flows and SIP contributions, displayed at monthly frequency and not added to daily DII flows.

Do not use hard-to-fetch, undocumented or fragile sources merely to increase the number of variables. If a reliable source is unavailable, omit the metric or mark the limitation; never fabricate, silently interpolate, or turn missing data into zero.

### Data ingestion requirements
- Build a source adapter/provider layer rather than embedding scraping assumptions throughout the UI.
- Prefer stable official downloads/APIs. If a source requires HTML scraping, validate stability, add tests, logging, retries, caching and graceful failure; do not make it a single point of failure.
- Store raw observations separately from derived calculations.
- Persist source name, source URL, retrieval timestamp, observation date, units, currency, data frequency, status (provisional/final), and any revision/version metadata.
- Validate date continuity, numeric types, units, duplicates, outliers and reconciliation between gross buy/sell/net when the source provides those fields.
- Do not merge differently defined series without an explicit transformation and explanation.
- Distinguish “not yet published”, “source unavailable”, “missing historical observation”, “not applicable” and numeric zero.
- Handle exchange holidays, partial weeks/months, delayed updates and revised provisional values.
- Cache data and avoid repeated requests on every UI render.
- Show last successful refresh and latest source observation date, separately.
- Do not label delayed or provisional data as live/final.

## 5. Timeframes and historical coverage

All applicable data and analysis must support **Daily, Weekly and Monthly** views and enough historical depth to inspect earlier regimes.

- Preserve the longest reliable daily history available from the selected official source. Do not promise a fixed number of years until coverage is verified.
- Derive weekly and monthly institutional-flow aggregates from daily data consistently; preserve the exact date boundaries and number of observed sessions.
- Calculate index performance for the same period boundaries as the flow aggregation.
- Keep source-reported monthly AMFI measures separate from derived monthly sums of daily flows.
- Use calendar-aware periods, holidays and partial periods. Label incomplete current week/month.
- Add selectable history ranges: 1M, 3M, 6M, 1Y, 3Y, 5Y and Max, but disable or qualify ranges unsupported by actual source history.
- Keep selected timeframe, date range and toggles stable while users switch chart views or inspect historical matches where feasible.

## 6. Chart requirements — exceptionally important

The chart must be visually polished, correctly aligned, legible and professional. It should make trend and divergence easy to see at a glance. Do not use an illustrative or misleading shared axis for index values and rupee flows.

### Visual construction
- Use the charting library already present in the app if it meets the requirements; otherwise choose a maintained charting library compatible with the existing stack. Avoid adding a large dependency for a trivial need.
- Align all series to the same trading-date/timeframe buckets.
- Use an index performance line on its own clearly labelled scale or normalize the index to 100 at the beginning of the selected range. Label it “Indexed performance (start = 100)” if normalized.
- Display FII/FPI and DII net cash flows as bars around a clearly visible zero baseline, with distinct but Kosh-consistent positive/negative colours. Ensure negative values extend below the baseline and positive values above it.
- Use aligned plot areas, shared x-axis dates, consistent chart padding, tidy gridlines and no clipped labels.
- Avoid label collisions, misleading smoothing, excessive gradients, overdecorated tooltips or visually noisy event markers.
- Make the selected trend easy to follow on desktop and mobile; preserve legibility on smaller screens.
- Add a responsive hover/crosshair tooltip showing date, timeframe, index value/return, FII/FPI net flow, DII net flow, units, source status and data freshness where relevant.
- Show zero line for flow bars and clear axis labels. Use separate axis/plot regions if overlay makes comparisons visually confusing.
- Add optional event markers only for events with a verified source and a meaningful date; clicking a marker opens its sourced context. Never invent historical events.
- Add toggles for Index, FII/FPI flow, DII flow and verified events. Hide/show should preserve layout and update legend/axis correctly.
- Include keyboard and screen-reader accessible controls and a non-hover alternative for chart data.
- If there are too many points, use efficient rendering/downsampling for display while preserving exact values in tooltips and calculations.
- Chart empty/loading/error states must look intentional and explain why data is unavailable.

### Chart modes
- Daily: session-by-session net flows and index performance.
- Weekly: weekly net-flow sums with matching weekly index return.
- Monthly: monthly net-flow sums with matching monthly index return; source-reported AMFI series can be added as a separate monthly marker/series only when valid.
- Provide cumulative flow view as a secondary chart/view, not by silently mixing cumulative and daily units on the same axis.
- Optionally provide 5/20/60-session rolling flow summaries and return/flow comparisons in the full analysis view, only if clearly labelled and helpful.

## 7. Two distinct analysis modes

Both modes must use the same verified canonical dataset, shared calculation definitions and data timestamps. The modes must not silently disagree because they use different raw inputs.

### Mode A — Kosh Analysis (no Grok/API call)
This mode must run entirely from deterministic calculations, transparent rules and locally available data. It must be useful even when AI is disabled or unavailable.

Required outputs:
- Current timeframe and index trend.
- FII/FPI net flow direction, magnitude, persistence and historical percentile/extremeness where sufficient history exists.
- DII net flow direction, magnitude and persistence.
- Flow divergence: whether FII/FPI and DII flows are aligned or offsetting each other.
- Market direction versus flow direction: supportive, opposing or mixed; define rules explicitly.
- Market breadth / cross-index context only if source quality and coverage are sufficient.
- Recent trend versus longer timeframe context (e.g., daily versus weekly/monthly), with no unsupported claims.
- A concise verdict, supporting evidence, counter-evidence and what to watch next.
- Source coverage/data-quality warnings.
- Historical descriptive statistics, such as what followed comparable flow regimes, only if the calculation is implemented and validated.

Rules and thresholds must be documented and testable. Avoid arbitrary scores that imply scientific precision. No unsupported “panic”, “smart money”, “accumulation”, “distribution”, price target or guaranteed bottom/top language. Do not call combined FII+DII flow “total market flow”.

### Mode B — AI Deep Analysis (Grok)
Use AI for synthesis, research and reasoning—not to fabricate missing observations or replace deterministic calculations.

Inputs must include structured, sourced data facts rather than only a prompt summary:
- Current daily/weekly/monthly values and calculations.
- Relevant longer historical series or compact statistics derived from it.
- Current market regime features and reliable cross-market/contextual variables.
- Computed historical analogue candidates and their feature vectors.
- Actual subsequent outcomes for each historical candidate, calculated independently by code.
- Data source, units, dates, status, limitations and freshness.

AI must produce:
1. Executive verdict in plain language.
2. Multi-timeframe analysis: daily, weekly, monthly and cross-timeframe agreement/divergence.
3. Broader-market regime context: large-cap vs mid/small-cap, breadth, sector participation, volatility, global risk appetite, currency, rates/commodities only where reliable and relevant.
4. Historical analogues: exact start/end dates, why each matched, key differences, similarity metric and source-backed evidence.
5. Historical forward outcomes: actual returns and drawdowns after 1, 4, 12 and 24 weeks (or the closest supported session windows), distribution of outcomes, percentage positive/negative, median and range. Calculate these outside the model and provide them as facts. Clearly disclose sample size and missing cases.
6. Conditional forward scenarios (e.g., stabilisation/recovery, continued weakness, range/whipsaw) with evidence supporting and contradicting each, key triggers, invalidation conditions and uncertainty.
7. What would change the assessment, what to monitor next and what is not knowable from the data.
8. Citations/links for web-researched facts and source metadata for internal data.

AI must examine broader market performance during each historical analogue, not just FII/DII flows. It should consider other factors that materially improve comparability, but only when reliable, accessible, historically available and relevant. Potential factors include breadth, sector leadership, mid/small-cap relative performance, volatility, global indices, US yields, USD/INR, crude oil, India VIX and macro/policy shocks. Do not blindly add every factor; explain why each included variable matters and handle missing data explicitly.

Historical analogue rules:
- Match conditions using only data available at the historical match date (avoid look-ahead bias).
- Normalize features so scales are comparable; document weights/algorithm.
- Distinguish similarity of conditions from similarity of outcomes.
- Do not pick analogues solely because their subsequent outcome matches the current thesis.
- Show multiple analogues including contradictory or failed cases, not only favourable examples.
- Show sample size and distribution, not just the best-looking example.
- Avoid survivorship bias and overlapping windows that inflate sample counts; account for dependence between nearby periods.
- Do not claim that an analogue predicts the future. Phrase findings as conditional evidence.
- If no sufficiently similar historical cases exist, say so.
- Do not show numerical probabilities/confidence bars unless generated by a defined, calibrated and out-of-sample validated model. LLM self-assessed confidence is not a probability.

## 8. Broader-market context and prediction quality

The aim is to make the analysis more accurate without making the user interface more confusing.

Use a tiered architecture:
- **Core visible layer:** Nifty 50 performance, FII/FPI flows, DII flows and a concise verdict.
- **Analysis context layer:** broader index performance, breadth, sector participation and volatility, surfaced in the full analysis when they materially change interpretation.
- **Advanced/research layer:** global macro variables and derivatives positioning, only after source/coverage validation; explain each variable's role and keep it separate from cash flows.

Select variables based on plausible mechanisms, data quality, historical coverage and out-of-sample incremental value—not because they are available. Track data coverage per feature. Compare a baseline flow-only model against richer variants to see whether extra variables improve out-of-sample performance. If a variable does not improve robust performance, remove it from the core analysis.

## 9. Historical research / backtesting framework

Implement a reproducible research layer, not an AI-only memory search.
- Define regime features and feature windows (daily, weekly, monthly) without using future data.
- Identify candidate historical windows using a transparent distance/similarity method.
- For each window, compute future index performance over predefined horizons and maximum drawdown.
- Separate in-sample exploration from out-of-sample evaluation; use rolling/expanding walk-forward tests where practical.
- Include transaction-independent index outcomes initially; do not imply a tradable strategy unless trading costs, slippage, timing and execution are modelled.
- Compare baseline rules/flow-only approaches with broader-market feature sets.
- Report hit rate, return distributions, drawdowns, calibration and sample size where appropriate.
- Guard against look-ahead bias, data leakage, multiple-testing/p-hacking, overlapping periods and regime changes.
- Treat results as research evidence, not financial advice or a guaranteed forecast.

## 10. Source, freshness and methodology UX

Every chart and analysis must let the user inspect:
- Source/provider and link.
- Observation period and latest observation date.
- Retrieval/refresh time.
- Provisional/final status where applicable.
- Units and transformation/aggregation logic.
- Missing data or source outages.
- How derived metrics are calculated.

Use clear statuses such as Verified/Reported, Derived, AI-researched · source-backed, Conflicting, Not found and Not applicable where they fit existing Kosh conventions. Do not claim “verified” unless the source and value have actually been checked.

## 11. Visual design direction

- Follow existing Kosh Classic layout, palette, typography, component styles, borders, radius, buttons, tabs and spacing.
- Do not create a new theme, permanent sidebar or separate design language.
- Use a calm, professional financial terminal aesthetic: clear hierarchy, strong alignment, restrained colour, readable units and adequate whitespace.
- The chart must dominate the full analysis page; KPI cards and narrative should support it.
- On Market Overview, the summary should be compact and visually subordinate to the existing Winners & Losers table.
- Avoid large decorative badges, redundant metadata, excessive cards, noisy gradients and unvalidated numerical “scores”.
- Responsive behaviour must preserve chart readability and keep the Open full analysis action easy to find.

## 12. Engineering requirements

- Inspect the actual current codebase, routes, data provider architecture, existing charting library, styles/tokens, tests and current Market Overview implementation before coding.
- Reuse existing components and conventions wherever possible.
- Keep the summary and full analysis as views over shared data/calculation services.
- Separate ingestion, normalization, aggregation, metrics, analogue search, scenario statistics and AI narrative into testable modules.
- Use server-side/provider caching where suitable; avoid exposing secrets or scraping credentials in the client.
- AI must not run automatically on every render. Use an explicit user action or controlled cache/refresh policy.
- Add loading, partial-data, stale-data, source-failure and empty-history states.
- Do not break existing Market Overview, winners/losers, watchlists, portfolios, chart routes or other features.
- No silent caps/truncation in historical data. Use pagination/virtualization/downsampling where needed.
- Add unit tests for aggregation boundaries, holidays/partial periods, sign conventions, revision handling, missing data, chart series alignment, analogue windows, forward-outcome windows and leakage prevention.
- Add integration tests for data source failure and graceful UI fallback.
- Provide a clear implementation summary, files changed, sources used, limitations, tests run and any source/access blockers. Do not claim tests passed unless they were run.

## 13. Acceptance criteria

1. The new compact module appears directly below the existing Winners & Losers table on Market Overview.
2. Existing Market Overview layout, style and behaviour remain intact outside the requested addition.
3. The compact module has daily/weekly/monthly control, a clear mini-chart, concise deterministic verdict and an Open full analysis action.
4. Full analysis includes historical data, timeframe/range controls, polished aligned chart, marker toggles, source freshness and methodology.
5. Chart series are aligned by period and units are unambiguous; index and rupee flows are not misleadingly plotted on an unlabelled common scale.
6. Both analysis modes use the same canonical data and definitions.
7. Kosh Analysis works without an AI call and is reproducible from code/data.
8. AI analysis uses broader-market context where reliable and compares multiple historical analogues, including contradictory cases.
9. Historical forward outcomes are computed by code, not invented by the model; each match includes dates, sample size and actual outcomes.
10. Future scenarios are conditional, transparent and appropriately uncertain; no unsupported probabilities or price targets.
11. Data sources are public/easily ingestible or blockers are explicitly documented. Fragile sources are not silently assumed to work.
12. Missing data, provisional values, delayed updates and source failures are handled truthfully.
13. Responsive layout, accessibility and tests are included.
14. All example/mock data is clearly labelled and is never shown as real production data.

## 14. Implementation sequence

Phase 1 — Repository and source audit. Map current Market Overview insertion point, design tokens, routes, chart library, existing data APIs and official source accessibility. Report blockers before relying on fragile endpoints.

Phase 2 — Canonical data layer. Implement and test official daily FII/FPI + DII flows and index history, provenance, caching, revisions and quality checks.

Phase 3 — Timeframe aggregation and deterministic analysis. Implement daily/weekly/monthly views, core metrics, rules and tests.

Phase 4 — Chart and Market Overview summary. Build the compact below-Winners-&-Losers module and polished full analysis chart using existing Kosh design language.

Phase 5 — Historical analogue engine. Add leakage-safe matching, verified market context, independent forward-outcome calculations and contradictory examples.

Phase 6 — AI Deep Analysis. Feed structured facts and computed outcomes to Grok; implement source-backed narrative, conditional scenarios, invalidation criteria and graceful AI-unavailable fallback.

Phase 7 — Validation and delivery. Backtest the historical approach, run UI/data tests, document limitations and provide a concise implementation report.

**Do not skip Phase 1. Do not fill gaps with mock data in production. Prioritize source reliability and correctness over breadth.**
