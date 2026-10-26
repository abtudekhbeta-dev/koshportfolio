# Kosh RRG — Two-Stage Grok Implementation Pack
Version 2.0 — public/downloadable data sources first; no paid API integration

## Important operating rule

Do this in exactly two implementation stages:
1. Historical data foundation + RRG calculation engine, with tests and a written audit.
2. RRG user interface + historical analysis and interpretation, only after Stage 1 passes.

Do not integrate paid APIs, require API keys, or use broker APIs. Prefer public, downloadable historical files and official web-based historical-data reports. Publicly viewable does not automatically mean unrestricted: verify the site's terms, access limits, and commercial/redistribution rights. Do not bypass login, anti-bot controls, rate limits, or access restrictions. If a public source cannot supply enough history legally and reliably, state the limitation and stop rather than fabricate or silently switch sources.

---

# STAGE 1 PROMPT — Public historical data, validation, and RRG engine

You are working on my existing Kosh investment-analysis website. I want to add a robust Relative Rotation Graph (RRG) feature. Historical data quality and long-history coverage are the highest priorities.

I do NOT want paid data APIs, broker API connectivity, API-key dependencies, or a design based on a paid subscription. Prefer public websites and downloadable CSV/ZIP files from official sources. Do not treat a public website as permission to scrape it in a prohibited way.

Do not build the full RRG UI in this stage. First inspect the actual repository and trace the current data flow, then deliver a tested data foundation and calculation engine.

## A. Inspect Kosh before changing it

- Identify the current framework, storage, data providers, server routes, ingestion jobs, cache, symbol mapping, chart library, and relevant files/functions.
- Test actual behaviour; do not infer functionality from provider names or comments.
- Avoid unrelated refactors and preserve existing architecture.
- Do not put credentials, secrets, or tokens in source code.

## B. Public/downloadable data sources to investigate first

1. **NSE official historical reports:** https://www.nseindia.com/static/resources/historical-reports-capital-market-daily-monthly-archives
   - Investigate Security-wise Price Volume Archives, Archives of Daily/Monthly Reports (Equities), historical index data, archives of index reports, and any publicly downloadable daily bhavcopy files.
2. **NSE All Reports:** https://www.nseindia.com/all-reports
   - Check historical report filters and actual downloadable files. Note that some historical/EOD products are subscription products; do not assume all data on the site is free.
3. **Nifty Indices historical reports:** https://www.niftyindices.com/reports
   - Test historical index OHLC/close data and Total Return Index (TRI) availability for Nifty 50 and sector indices. Check date-range limits and actual download behaviour.
4. **SEBI's official equity cash-market data source directory:** https://www.sebi.gov.in/curation/equity_cash_market.html
   - Use this to discover official exchange archives where relevant.
5. Optional secondary source only for cross-checking: publicly viewable Yahoo Finance history. Do not require Yahoo paid download, undocumented endpoints, scraping that violates terms, or treat it as the canonical source.
6. Do not integrate Upstox, Zerodha, broker APIs, paid market-data APIs, or paid feeds in this stage.

Important: source pages and archive formats change. Verify what is actually accessible now. A page showing historical-data controls does not prove the entire requested period is downloadable. Public downloads may have limitations or licensing conditions. Report these honestly.

## C. Test real long-history coverage

Test a representative set:
- Nifty 50
- Nifty Bank
- Nifty IT
- at least five liquid NSE stocks across different sectors
- at least two old listings and two newer listings
- a renamed/discontinued instrument if the public source supports it

Aim for ten years of daily observations where publicly available. Measure actual coverage for every instrument. Report:
- earliest date, latest date, row count
- duplicate and out-of-order dates
- missing expected trading sessions, distinguished from weekends/exchange holidays
- null, zero, negative, or implausible closes
- extreme price jumps that may be corporate actions or bad records
- source file/page and retrieval date
- raw versus adjusted price convention
- whether index history and equity history use different workflows
- retrieval failures, date-range limits, and any manual steps required

Do not claim ten years because a date selector accepts ten years. Verify that the actual downloaded rows cover the requested period. If daily stock data requires downloading daily archive files, estimate the archive volume and test a practical repeatable batch process on a representative range before attempting the full universe.

## D. Choose a realistic public-data architecture

Prefer:
- official downloadable NSE daily equity bhavcopy/security-wise archives for individual stock raw close data where available and permitted;
- official NSE/Nifty Indices downloadable historical index data for benchmarks and sector indices;
- a local, reproducible ingestion process that downloads and parses allowed public CSV/ZIP files, records provenance, and caches processed data;
- manual/batch file import as an explicit fallback if official downloads cannot be automated reliably within the site's rules.

Do not assume raw bhavcopy data is corporate-action adjusted. Do not combine adjusted and unadjusted series. Do not silently stitch different providers. If a reliable adjusted series is unavailable, disclose the limitation and flag large discontinuities for review. Do not invent adjustment factors.

Check public-site terms, commercial use, retention, redistribution, and automated retrieval rules. No bypassing authentication, anti-bot measures, or rate limits. If public sources do not permit the needed use, report this and offer a compliant manual import workflow rather than recommending circumvention.

## E. Data integrity rules — mandatory

- Canonical input is daily close with exchange-local trading date, source and adjustment metadata.
- Target ten years where available; full-history view requires at least five years of valid daily observations. Shorter history must display `Limited history`.
- Retrieve warm-up observations before the visible chart start for all rolling calculations.
- Keep an instrument registry with exchange, stable identifier if available, symbol/name, sector, active status, listing date if known, and known symbol-change history.
- Align instrument and benchmark on valid common trading dates. Never forward-fill, interpolate, or manufacture missing closes.
- Distinguish exchange holidays from missing expected sessions.
- Make ingestion repeatable and idempotent. Log every downloaded file, source URL, retrieval timestamp, parser version, date range, row count, checksum where practical, errors, and failed chunks.
- Preserve source files or reproducible copies where permitted by source terms.
- Show data source, as-of date, history start/end, coverage, adjustment basis and warnings.
- If data is unavailable or fails validation, show an explicit error/limited state. Never use fake demo values in production.
- Do not imply point-in-time historical sector membership unless actual historical membership is available. If current constituents are used over past dates, label this survivorship limitation.

## F. Implement the RRG calculation engine in Stage 1

Original JdK RS-Ratio and RS-Momentum formulas are proprietary. Do not claim exact JdK/Bloomberg equivalence. Label the calculation `Kosh RRG-inspired methodology` unless we have an authorized licensed implementation.

Proposed transparent approximation (document and confirm before coding):
- `RS_t = 100 * instrument_close_t / benchmark_close_t`
- `RSRatio_t = 100 * WMA(RS, fast)_t / WMA(RS, slow)_t`
- `RSMomentum_t = 100 * RSRatio_t / RSRatio_(t-momentum)_t`

Define WMA, lookbacks, warm-up, parameters, and missing-data behaviour. No future observations may enter any calculation, including historical as-of views. Daily data is canonical; weekly/monthly aggregation will be handled consistently in Stage 2.

## G. Required tests and deliverables

Create `docs/rrg-stage-1-data-and-engine-report.md` (or equivalent). Include:
- current data architecture and exact files/functions changed
- each public source investigated, exact workflow and terms/limitations
- actual coverage table for each sample instrument/index
- data quality findings and adjustment convention
- repeatable ingestion instructions
- formula and parameters
- test fixtures, expected and actual values, pass/fail
- commands run and actual outputs
- tests not run and reasons
- unresolved risks and any manual steps needed

Automated tests must cover:
1. duplicate/out-of-order dates
2. holidays versus missing sessions
3. invalid close values
4. large jumps/corporate actions
5. benchmark alignment
6. insufficient history/warm-up
7. benchmark equal to instrument
8. steady relative outperformance and underperformance
9. rising stock underperforming a faster-rising benchmark
10. falling stock outperforming a faster-falling benchmark
11. quadrant boundaries around 100
12. deterministic outputs
13. no forward-fill/interpolation
14. no look-ahead/future leakage in historical replay
15. failed/incomplete downloads and repeatable ingestion

Do not claim tests passed unless actually run. Do not build the full RRG UI in this stage. If the public data foundation cannot meet the requirements, stop and report the blocker; do not fabricate data or use a paid API as a workaround.

---

# STAGE 2 PROMPT — Complete RRG feature using only the approved Stage 1 foundation

Proceed only after I approve the Stage 1 report and the data/calculation tests pass.

Build the RRG feature in my existing Kosh app using only the validated Stage 1 data layer and calculation engine. Do not add paid APIs, broker APIs, API keys, or unapproved data providers. Preserve Kosh's existing design system, navigation, colours, spacing, and responsive patterns.

## Feature requirements

1. **Sector Rotation:** compare available NSE/Nifty sector indices against Nifty 50; allow benchmark selection only for benchmarks supported by validated data.
2. **Stock Rotation:** drill down from a selected sector or compare a watchlist/custom universe. Show the source universe and disclose if current constituents are used historically.
3. **Timeframes:** daily, weekly and monthly. Derive weekly/monthly from canonical daily observations using documented exchange-calendar/week-ending conventions; calculate each timeframe independently and consistently.
4. **RRG chart:** RS-Ratio x-axis, RS-Momentum y-axis, both centred at 100; four named quadrants; tails with dated points and direction arrows; latest labels; tooltips; zoom/pan; show/hide symbols; adjustable tail length; readable responsive/mobile behaviour.
5. **Quadrants:**
   - Leading: RS-Ratio > 100 and RS-Momentum > 100
   - Weakening: RS-Ratio > 100 and RS-Momentum < 100
   - Lagging: both < 100
   - Improving: RS-Ratio < 100 and RS-Momentum > 100
   - Exactly 100 should be handled consistently and documented as a boundary, not arbitrarily assigned without a defined rule.
6. **Ranking table:** symbol/name, latest close and as-of date, absolute return, relative return, RS-Ratio, RS-Momentum, quadrant, previous quadrant, direction, distance from centre, history coverage, source, adjustment basis and warnings. Sorting and filtering must use actual calculated values.
7. **Historical replay:** select an as-of date and display only data and universe information available at that date. If point-in-time constituent membership is unavailable, disclose the limitation and do not call it a point-in-time backtest.
8. **Rotation Intelligence:** derive factual labels and flags from calculated values. AI may explain those values but must not invent metrics, rankings, catalysts, forecasts or recommendations. Show a compact evidence trail with the underlying values.
9. **Data-quality UI:** display source, as-of date, history start/end, coverage, missing-session count, adjustment basis, formula version, parameters and limitations.
10. **Error states:** loading, stale, failed source, invalid series, insufficient history, and limited history. No fabricated production demo data.
11. **Interpretation safeguards:** rotations are not guaranteed to be clockwise; a relative leader can still fall in absolute price; quadrant position is not an automatic buy/sell signal; timeframe disagreements must be shown rather than hidden.
12. Preserve Kosh's existing architecture and avoid unrelated refactors or feature bloat.

## Stage 2 acceptance

Run and report actual unit tests, integration tests, build, lint/type checks where available, chart interaction tests, sorting/filtering tests, responsive checks, and historical replay/no-lookahead tests. List changed files, source files used, formula version, limitations, and any failed/unrun tests. Do not claim completion if a data-quality or acceptance gate remains unresolved.

---

# PDFs to attach to Grok

## Attach these five first (recommended)
1. `Relative Rotation Graphs (RRG Charts) | ChartSchool | StockCharts.com.pdf`
2. `Unveiling the Building Blocks for RRG.pdf`
3. `Relative-Rotation-Graph-Thomson-Reuters-Guide.pdf`
4. `How to Create a Customizable Relative Rotation Graph (RRG) Using Python.pdf`
5. `Reading the Market’s Rotation: A Practical Guide to RRG.pdf`

## Optional secondary PDFs
6. `Scripting Guide for Relative Rotation Graphs® - Updated — Optuma Blog.pdf`
7. `RRG-Chart Guide | Hiddenmetrix.pdf` — supplementary only; verify quantitative claims independently.
8. `new-frontiers-in-technical-analysis-effective-tools-and-strategies-for-trading-and-investing_compress.pdf` — only if Grok can inspect relevant chapters without context/file limits.
9. Any extra `RRG.pdf` only if it contains distinct material.

The Python tutorial is a reference for a public approximation, not proof of the proprietary JdK formula. If references conflict with this pack's data-integrity requirements, the data-integrity requirements win.

## Public source links to include
- NSE historical reports: https://www.nseindia.com/static/resources/historical-reports-capital-market-daily-monthly-archives
- NSE All Reports: https://www.nseindia.com/all-reports
- Nifty Indices historical reports: https://www.niftyindices.com/reports
- SEBI equity cash market source directory: https://www.sebi.gov.in/curation/equity_cash_market.html
- StockCharts RRG explanation: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-types/relative-rotation-graphs-rrg-charts

These are investigation starting points. Grok must verify present-day access, actual history depth, data quality, and applicable terms. No paid APIs or broker API integration.
