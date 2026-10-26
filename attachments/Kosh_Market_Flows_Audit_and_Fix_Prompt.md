# Kosh Market Flows — Code Audit & Remediation Prompt
## Source inspected
This prompt is based on the uploaded `FzFDJH3wJIJOlp7u-grok-workspace.zip`, specifically:
- `src/components/terminal/market-flows.tsx`
- `src/lib/kosh/market-flows.server.ts`
- `src/lib/kosh/market-flows.ts`
- `src/routes/api/market-flows.ts`
- `src/components/terminal/market-overview.tsx`

Implement this in the existing Kosh codebase. Do not rebuild the app or alter unrelated routes, the existing Classic design system, top navigation, global colours, typography, or page structure.

# 1. Highest-priority defects found

1. **The flow history is source-limited, not UI-limited.** `market-flows.server.ts` merges `https://strota.in/fii-dii-data.csv` with `https://raw.githubusercontent.com/MrChartist/fii-dii-data/main/data/history.json`. The response currently has only about 172 sessions. The app does not have 10–20 years of FII/DII data merely because the range selector includes `3Y`, `5Y`, and `Max`.
2. **The source note itself admits the limitation.** It says NSE's report endpoint is blocked from this server, and it uses a republished provisional series plus a GitHub history file. This is not a resilient primary-data architecture.
3. **Index history is requested from Yahoo only from the first available flow date.** `niftyCloses(from)` starts at `flows[0].date`, so index history is also artificially truncated to the short flow dataset. Fetch/maintain index history independently of flow coverage.
4. **The current chart rebases Nifty to 100.** In `FlowChart`, `indexed` is computed as `indexEnd / base * 100`; the chart labels say `Index = 100`. The user now explicitly wants the actual Nifty index value on the chart, not a rebased line. Use the real Nifty close on the left axis and net cash flow in ₹ crore on the right axis. Explicitly label both axes; do not imply the units are comparable.
5. **The UI says “FII/FPI” throughout.** The user explicitly wants the interface to say “FII”. However, NSE currently reports the category as “FII/FPI”. Do not merely rename a field and claim it is a pure legacy-FII series. Display “FII” in the requested UI, and in the data/methodology drawer transparently disclose the official source category and whether a historical legacy-FII-only series is genuinely available. Do not misrepresent FPI transactions as a separate or identical series.
6. **The AI endpoint has a very narrow prompt.** `/api/market-flows` POST sends source metadata, verdicts, the last 15 daily bars, and all weekly/monthly bars. It has no verified multi-factor market context, no proper historical-analogue evidence bundle, and no structured output contract. It explicitly tells Grok not to invent probabilities, but the result is only a short note—not a comprehensive research analysis.
7. **The analogue engine is too simplistic.** `findAnalogues` uses non-overlapping 20-session windows and a distance over FII, DII and index return only. It uses an arbitrary scale (`500 * sessions`), allows missing returns to be substituted with zero in distance calculation, and has no regime/volatility/breadth/macro context. It also requires 250 sessions but that is insufficient for robust 20-year-cycle or multi-regime research.
8. **The flow verdict uses hard-coded thresholds** of ₹250 crore per session and ±0.15% index return. These are not calibrated to the distribution or market regime, and should be labelled provisional until tested. Prefer adaptive, historical percentile/z-score context, with minimum sample sizes and explicit threshold documentation.
9. **Chart legend is not a real visual key.** The current footer labels are plain text and don't consistently show the line/bar symbol used. Provide legend swatches that match the actual mark: blue solid line for Nifty close, red negative/positive bars (or a single red series) for FII net, green bars for DII net. Use consistent colours in hover labels, table, legend and chart.
10. **Chart scale and usability need improvement.** The dual-axis chart should use aligned plot regions, readable ticks, a clear zero baseline for flows, a visible actual Nifty axis, a responsive chart height, hover/crosshair tooltip with date and exact values, and range/frame selection that never offers unsupported history as if it exists.
11. **Current AI note isn't a full analysis experience.** Improve its layout into structured sections: executive verdict, timeframe synthesis, broader market regime, historical analogues, scenario outlook, invalidation signals, limitations, and data sources. Keep the deterministic Kosh analysis independently available without an AI call.
12. **Coverage/status presentation is too weak.** Show requested range versus actual available range, count of usable flow sessions, missing Nifty sessions, missing auxiliary series, source timestamps, provisional/final status, and whether a historical range is unavailable. Do not report “Max” as long-term history when only eight months are present.

# 2. Historical data: solve the real problem, don't fake it

## Source reality
- NSE's current FII/FPI and DII trading-activity page is a reliable official source for current daily cash-market net values, but the reported FII/FPI data is provisional and subject to custodial confirmation. The category definition is official FII/FPI, not a guaranteed legacy-FII-only history.
- NSE/Nifty Indices provide historical index data, with Nifty 50 history extending much further back than the current flow feed. The current implementation truncates index history by asking Yahoo for data only from the first flow date.
- Publicly and easily retrievable daily institutional cash-flow history for 10–20 years is not guaranteed to exist as one complete, stable, free, official CSV. Do not claim that it does unless the actual source has been verified.
- Third-party CSVs and GitHub archives may be useful secondary sources but must be provenance-labelled and cross-checked, not silently treated as the official primary series.

## Required robust architecture
Implement a provider-and-archive architecture:
1. `official-current provider`: fetch the current NSE combined-exchange daily FII/FPI and DII report. Respect site rules, source availability and rate limits; do not rely on browser-only scraping as the sole source.
2. `verified historical archive`: use an independently stored, versioned, dated dataset for historical flow observations. This may be an authorized vendor history, a checked-in/bootstrap CSV obtained under appropriate rights, or a database populated from validated daily records. Record its provenance and coverage.
3. `daily append pipeline`: after each trading session, ingest the official report, validate schema/units/date, store raw response plus normalized rows, and preserve previous values when a later confirmation revises a provisional observation.
4. `index history provider`: independently load long Nifty 50 daily OHLC/close and, where permitted, Nifty 50 TRI. Do not key its start date to the first flow observation.
5. `cross-validation`: compare the third-party historical flow archive to official data over overlapping dates. Log differences, do not silently blend mismatched definitions or revisions.
6. `coverage-aware UI`: range options are enabled only when required series have adequate coverage. If flow history is 172 sessions, say so and disable 3Y/5Y/Max for joint flow analysis. It is acceptable for the Nifty-only chart to have a longer history, but label that separately.
7. `database/cache`: do not depend on an ephemeral in-memory 20-minute cache as the only history store. Persist raw and normalized observations so a temporary upstream outage does not erase historical coverage.
8. `gap policy`: never fill missing flow values with zero. Show gaps, missing dates and quality flags. Missing index values remain null.
9. `source metadata per observation`: source provider, source URL/reference, report date, market date, retrieved timestamp, provisional/final status, revision timestamp and definition/category.
10. `licensing`: confirm rights for storing, transforming and redisplaying bulk historical exchange data before shipping.

### Backfill policy
- Do not invent or synthetically generate missing history.
- If an authorized source supplies 10–20 years, import it and verify counts, dates, units, duplicates, missing trading sessions, outliers and overlap consistency.
- If no complete source can be obtained, launch with the verified available range and accumulate a reliable archive from today forward. State that long historical flow coverage is unavailable until the data is acquired.
- Keep the historical index chart's coverage separate from the joint flow-analysis coverage.

# 3. Chart redesign: actual Nifty plus flow values

The chart is central to both the Market Overview glance and the full analysis page.

## Main chart
- Left axis: actual Nifty 50 close, e.g. 24,500, not “index = 100”.
- Right axis: net cash flow in ₹ crore.
- Nifty: a clean blue line, slightly thicker than gridlines, with subtle hover point.
- FII: red bars, negative below zero and positive above zero.
- DII: green bars, negative below zero and positive above zero.
- Draw a clear flow zero baseline; do not use the chart's visual midpoint as zero unless the flow scale explicitly maps zero there.
- Align x-coordinates, plot area, ticks and hover cursor exactly.
- Proper legend keys must match marks: blue line + “Nifty 50 close (index points)”; red square/bar + “FII net (₹ Cr)”; green square/bar + “DII net (₹ Cr)”.
- Use actual values in the tooltip: date, Nifty close, daily/weekly/monthly Nifty return, FII net, DII net, sessions included, provisional/confirmed status.
- Use a dual axis with clearly named units; never imply that index points and rupee flows are directly comparable.
- In Combined view show line plus bars; Line view shows selected lines with explicit series identity; Bar view should show flow bars only or clearly describe what it displays. Do not draw the index as a nearly invisible 1-pixel bar.
- For weekly/monthly aggregation, calculate index return from the last close before the bucket to the final close in the bucket. Do not sum index prices or average daily percentage returns.
- For partial current week/month, visibly mark it “Partial” and do not compare it as if it were a complete period.
- Add a visible x-axis date range and chart title/subtitle.
- Support keyboard-accessible range controls, legend toggles and chart tooltip alternatives (data table).
- The compact Overview chart should be visually calm, readable and not try to show every daily label. The full page can expose more detailed hover and table rows.

## Overview module
`MarketFlowsGlance` is already rendered at `src/components/terminal/market-overview.tsx` immediately after the Winners and Losers tables (around the current `<MarketFlowsGlance />` call). Keep it there.
- Keep the module compact and consistent with Kosh Classic design.
- Show timeframe controls Daily / Weekly / Monthly.
- Show actual Nifty close on the chart and current selected-window return in the KPI.
- Show FII net, DII net, combined FII+DII net (clearly labelled derived, not total market flow).
- Display a useful deterministic insight, plus an explicit data-coverage note.
- Primary CTA: “Open full analysis”.
- No long table or dense diagnostics in the Overview module; reserve those for the full page.
- The Overview chart must never display fabricated placeholder values when the API is unavailable.

# 4. Multi-factor analysis data bundle

Use only data that is reliable, available for the stated dates, and legally storable/displayable. Make each auxiliary series optional, with a visible coverage state. Never make AI output depend on an unverified series.

## Core daily series
- FII/FPI official cash-market net (UI label requested as FII, but explain source definition).
- DII official cash-market net.
- Nifty 50 OHLC/close and preferably Nifty 50 TRI where available.
- Session calendar and source status.

## High-value context to add only when verified
Prioritise in this order:
1. India VIX: volatility/risk regime.
2. Market breadth: advances/declines and percentage of Nifty 50 constituents above 20/50/200-day moving averages, using point-in-time constituent membership where possible.
3. Broader index performance: Nifty Next 50, Nifty Midcap 100, Nifty Smallcap indices, Sensex; use the same date frequency and explicit source.
4. Sector relative performance and index concentration: whether a market move is broad or dominated by a few heavyweight stocks.
5. Nifty 50 TRI / dividend-adjusted performance where appropriate.
6. USD/INR, crude oil, US Treasury yields or other macro series only if reliable historical coverage and timestamps are available. Clearly separate Indian-market observations from global context.
7. Optional derivatives positioning only in an advanced panel and with explicit definitions. Do not treat client category as synonymous with retail, or derivatives OI as cash flow.
8. Monthly AMFI equity-fund net flows and SIP data can enrich monthly context, but must be shown at monthly frequency and must not be added to DII flows.

Do not overload the simple Overview. Auxiliary data is primarily for full AI analysis and the historical analogue engine. The deterministic analysis can reuse only verified values and should disclose which variables were actually available.

# 5. Historical analogue engine — replace current simplistic method

Current `findAnalogues()` compares 20-session windows using only FII, DII and Nifty return, with a fixed scale. Replace it with a point-in-time, multi-factor approach.

## Feature set
For each trailing window (e.g. 20 sessions, with optional 60-session regime):
- FII net flow total and average per session, scaled relative to market turnover if reliable turnover is available.
- DII net flow total and average per session.
- Flow persistence: number/share of sessions net buying or selling; cumulative flow path and flow acceleration.
- Nifty 1/5/20/60-session returns and drawdown from rolling peak.
- Realised volatility and India VIX level/change, where available.
- Market breadth and broader-index relative performance, where available.
- Sector leadership / concentration, where reliable.
- Optional macro context with point-in-time values, not revised or future information.
- Missingness flags and feature-coverage ratio.

## Matching rules
- Standardise features using training/history data available up to the historical comparison date, not future full-sample means/standard deviations.
- Use robust scaling/winsorisation for extreme flows; don't let one crash week dominate every distance calculation.
- Apply explicit feature weights and expose them in methodology. Do not let the LLM invent similarity scores.
- Compare both similar conditions and similar market regimes; penalise matches with missing critical variables.
- Avoid overlapping analogue windows when calculating independent outcome statistics.
- Avoid look-ahead bias: the match vector for an old date must use only observations available by that date.
- Separate “similarity match” from “forecast”. A nearest analogue is not a probability.
- Return at least 5–10 matches only when adequate history exists; otherwise show “insufficient history” rather than force a result.
- Add outcome horizons: 1, 4, 12 and 24 weeks, as data permits. Report forward return, maximum adverse excursion/drawdown, time-to-recovery where calculable.
- Include negative/failed analogues and all-match distributions, not only the best successful cases.
- Show actual date ranges and a small snapshot of the matching features for every analogue.
- Backtest the analogue model with walk-forward/out-of-sample validation before presenting hit rates or probabilities.
- Report sample count, date coverage, excluded periods, feature coverage, median outcome, dispersion/quantiles and base-rate comparison.
- If results do not beat a simple baseline, state that no incremental predictive value has been established.

# 6. AI Deep Analysis — structured and substantially better

The current POST prompt says “use only JSON facts” but supplies too little evidence. Build a typed `analysisBundle` server-side from verified stored data and calculate features in deterministic code first. Send Grok this compact, evidence-rich bundle, not raw 20-year daily history.

## AI report sections
1. **Executive verdict** — concise current read; distinguish supportive, opposing and mixed evidence.
2. **Daily / weekly / monthly synthesis** — what agrees, what diverges, whether the signal is persistent or a single-session outlier.
3. **Broader market regime** — trend, volatility, breadth, relative performance, concentration and macro context where data exists.
4. **Flow interpretation** — FII and DII behaviour, scale relative to normal historical distribution, persistence, absorption/divergence. Do not say flows caused price moves.
5. **Historical analogues** — actual date ranges, similarity score computed outside AI, matched features, what happened over 1/4/12/24 weeks, unsuccessful examples and differences from today.
6. **Conditional scenarios** — base/positive/negative or recovery/continued weakness/range-bound cases. For each: evidence for, evidence against, observable confirmation conditions, invalidation conditions and time horizon.
7. **What to watch next** — a small number of measurable indicators, not a generic list.
8. **Limitations and confidence in evidence** — coverage, missing inputs, provisional source, sample size and whether historical evidence is predictive or merely descriptive.
9. **Sources** — source label, URL, dates covered, retrieved time, provisional/final status.

## AI rules
- Grok may reason over verified broader-market data and the computed analogue bundle, but may not invent data, historical dates, events, source links, probabilities or returns.
- The AI must use web research only as a separately cited contextual layer, not to overwrite Kosh's stored numerical facts.
- Separate fact, interpretation and forecast in the UI.
- If a series is unavailable, say so and lower the scope of the conclusion.
- Never claim “retail panic”, “HNI buying” or investor motivation from FII/DII aggregates.
- Avoid price targets. If probability estimates are displayed, they must come from a calibrated backtested model, not the LLM's intuition.
- Show which broader-market factors were actually considered. Do not imply all factors were analysed when some were missing.
- The AI must be explicit when current conditions have no strong historical analogue.
- AI output should use structured JSON (schema validated server-side) instead of one long unformatted string. Render it in readable sections with badges only for meaningful status and small evidence tables/cards.
- Cache analyses by input data version and prompt/model version. Re-run only when the data materially changes or user requests refresh.
- Keep Kosh Analysis usable without XAI_API_KEY; AI failure must not hide deterministic analysis.

# 7. Deterministic Kosh Analysis
Improve current fixed-threshold verdicts:
- Use transparent formulas with configurable and documented thresholds.
- Prefer percentile/rank or robust z-score versus rolling historical distributions, with a minimum history gate.
- If there is not enough history to estimate a distribution, fall back to simple directional labels and explicitly say the classification is provisional.
- Include flow persistence and market return context, not just period net.
- Never interpret missing index return as zero.
- Do not call FII+DII net “total market flow”; label it “combined FII + DII net (derived)”.
- Provide evidence lines: exact window, net flows, Nifty return, trend context and coverage.
- Use the same calculations for the Overview insight and full page so labels never disagree.

# 8. Data model / API
Add typed, versioned data structures for:
- `sourceRegistry`
- `flowObservation`
- `indexObservation`
- `marketContextObservation`
- `coverageReport`
- `analogueMatch`
- `analogueOutcome`
- `deterministicAnalysis`
- `aiAnalysisReport`

The API should return:
- actual observations for selected range/timeframe;
- coverage and quality metadata;
- chart series and unit metadata;
- deterministic verdict;
- computed analogue candidates and forward outcomes;
- verified context features with per-series provenance;
- cached AI report if available.

Use schema validation for all external data. Add tests for date parsing, duplicates, provisional revisions, missing values, timezone/date boundaries, weekly/monthly aggregation, partial periods, actual index-axis values, analogue leakage and API failures.

# 9. FII label requirement
In visible interface use `FII`, `FII net`, `FII cash flow`, and `FII + DII combined net`.
In the methodology/source panel clearly say whether the source row is official `FII/FPI` combined category. Do not pretend that the current official combined category is a pure legacy FII-only dataset. If a genuine FII-only historical series is not available, explain that the display label is a user-facing shorthand for the available official foreign-institutional category, or ask the user to choose whether to use the combined official category. Do not mix NSDL FPI investment data into the cash-trading series.

# 10. Acceptance criteria
- [ ] The chart shows actual Nifty 50 close values on the left axis, not index rebased to 100.
- [ ] FII and DII net flows show as ₹ crore with a clear zero line and right-axis units.
- [ ] Legend line/bar samples exactly match rendered marks.
- [ ] Daily/weekly/monthly charts and tables agree numerically.
- [ ] Partial current week/month is marked and never compared as a full period.
- [ ] `3Y`, `5Y`, `Max` are disabled for joint flow analysis if the flow source does not cover them; no fake long history.
- [ ] Nifty history can be longer than flow history and coverage is disclosed separately.
- [ ] Backfill provenance and data rights are documented; no synthetic observations.
- [ ] Temporary upstream outage does not erase stored historical records.
- [ ] FII/FPI definition is transparent even though UI labels say FII.
- [ ] AI uses the broader verified context and computed analogues; it reports failed analogues and outcomes.
- [ ] AI output is structured and readable, with sources and uncertainty.
- [ ] Deterministic analysis works without Grok.
- [ ] No unsupported forecast probability, investor-motive claim or causal attribution.
- [ ] Existing Classic theme and placement below Winners/Losers are preserved.
- [ ] Tests and typecheck pass; no unrelated regression.

# 11. Authoritative starting references
- NSE FII/FPI & DII activity: https://www.nseindia.com/reports/fii-dii
- NSE historical market reports: https://www.nseindia.com/static/resources/historical-reports-capital-market-daily-monthly-archives
- Nifty Indices historical data: https://www.niftyindices.com/reports/historical-data
- NSE index FAQ (Nifty 50 historical series): https://www.nse.in/static/products-services/indices-faqs

The key rule: **do not claim 10–20 years of reliable flow history until that dataset has actually been acquired, validated, and stored.** If a licensed source is needed, surface that as a data dependency rather than concealing it behind a longer range selector.
