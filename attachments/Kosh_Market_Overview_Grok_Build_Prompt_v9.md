# Grok Build Prompt — Kosh Market Overview (Final UI + Data Integrity)

Use the attached `Kosh_Market_Overview_Interactive_Mockup_v9.html` as the visual and layout baseline. Inspect the whole file before changing anything. Implement the Market Overview in the existing Kosh application, not as a disconnected demo page. Preserve the Kosh Classic design language in the HTML: warm off-white background, restrained neutral borders, current typography, green/red performance colours, compact top navigation, no left sidebar, and no blue redesign.

## Primary objective
Turn Market Overview into a complete, reliable Indian-market dashboard. Every displayed market metric must come from a verified source, be timestamped, have a clear definition, and show a graceful unavailable/error state if the data cannot be retrieved. Do not fill gaps with fabricated numbers, hard-coded example returns, invented index constituents, or fake weights. The attached HTML contains illustrative data in several areas and is a UI reference only; replace demo arrays and demo labels with real data adapters before calling the page production-ready.

## Exact page order and layout
1. Keep the top summary row: Nifty 50, Sensex, Bank Nifty and Market Breadth. Use current or latest completed session values with explicit timestamp and delayed/live status.
2. Show the Nifty Index Heatmap above the Your stocks table.
3. Show Your stocks immediately after the Nifty Index Heatmap.
4. Show Sector Pulse and Top Movers below the Your stocks table, side by side at desktop widths and stacked responsively on narrow screens.
5. Keep FII/FPI & DII institutional flows in a compact secondary card in the lower Market Overview area, after Sector Pulse/Top Movers and before the bottom sector-wise stock heatmap. Do NOT promote it to a large hero card or move it to the top of the page. Preserve the established page hierarchy.
6. Restore and retain the separate Sector-wise Stock Heatmap at the bottom of the page, as it appeared in the other Kosh Studio and Ledger layouts. This heatmap is for individual stocks grouped by sector and is NOT the official Nifty index heatmap.
7. Preserve the current top navigation and Classic theme. No left sidebar.

## Your stocks table
- Make each row denser than the current version while keeping all values readable on one line. Target approximately 26–28 px row height on desktop.
- The absolute Change and % Change columns must always be calculated from the same quote snapshot and prior close. For a current price P and percentage return r expressed as a decimal, absolute change must equal P × r / (1 + r), or be directly computed as current price minus prior close. Never independently hard-code the two columns. Check the displayed sign and rounding are consistent. Use the same normalized quote object for table, movers, and stock heatmaps.
- Keep only these columns: Stock, Price, Change, % Change, View Chart. Do not add invested amount or sparklines.
- Retain the Table / Heatmap view toggle inside the Your stocks card.
- Search must work by company name and symbol. The Owned, Watchlist and All stocks tabs must filter both table and personal-stock heatmap consistently.
- Make portfolio and watchlist selectors actually filter the data; don't leave decorative/inert controls.
- Make sorting and filters functional. Sort numeric prices and returns numerically, not lexicographically.
- Counts must reflect actual filtered records, not hard-coded labels.
- Use real quote timestamps and a source/delay badge. If a stock has no valid quote, show “—” and its data status instead of a fake number.
- Keep chart opening on demand; do not auto-open a chart.

## Nifty Index Heatmap
- This is a heatmap of official Nifty indices, not individual constituent stocks.
- Do not add timeframe selector controls to this section. Show the latest available session by default, with the date/time stated in the subtitle. If historical periods are later supported, keep the control outside the tile area and don't make it look like an intraday timeframe switch.
- Include a “Key sectoral” view and an “All indices” view.
- “All indices” must catalogue all currently available official Nifty indices that the data source can support, including broad-market, large-cap, mid-cap, small-cap, micro-cap, sectoral, thematic, strategy and factor indices. Fetch the catalogue dynamically from a maintained source where possible; otherwise maintain a clearly versioned catalogue and validation process. Do not claim “all” if the catalogue is partial.
- Search by index name and filter by family.
- Tile colour and return must reflect the same session and use verified index closing values. Explain whether the return is absolute points or percentage (use percentage consistently here).
- On hover, keyboard focus and touch, expose “View Chart” and “View Composition”. Make these actions accessible on keyboard and mobile; do not rely only on hover.
- “View Chart” opens the chosen index's chart with a sensible default range and clearly labelled price/return series.
- “View Composition” opens a constituent treemap for that index. Tile area must be proportional to the official constituent weight, and colour must reflect that stock's return over the selected/latest session. Fetch official constituents and weights. Validate that weights add up to approximately 100% (allow documented rounding/coverage differences). If reliable composition/weight data is unavailable, show a clear unavailable state; never create equal weights or guess weights. The treemap must be proportional, not the schematic geometry used in a mockup.
- Show index data timestamp, source and any delay/provisional label.

## Institutional Flows card — FII/FPI and DII (required; this was missing)
Provide a visible, functional FII/FPI & DII card. It must not be omitted from the overview. Include:
- Period selector: Daily, Monthly and Yearly.
- FII/FPI net equity flow and DII net equity flow in ₹ crore, plus combined net flow.
- For daily view, show gross buy, gross sell and net buy/sell for both FII/FPI and DII; use exchange cash-market data and clearly label provisional vs confirmed/final.
- Monthly and yearly views should show net equity flow and the selected period's totals. Keep equity flows separate from debt, hybrid, mutual fund and other categories; don't silently add different asset classes.
- A chart of FII/FPI and DII net equity flows over time. Include a useful 5-year history when the source supports it, with a date range and units; a second comparison chart may overlay Nifty performance on a separately scaled axis or use a clearly labelled normalized return chart. Never mix ₹ crore and index points on the same axis.
- Show reporting date, last updated time, source, data status and methodology notes. Distinguish exchange provisional trade activity from confirmed depository-reported FPI data.
- Include loading, no-data, stale-data, rate-limit and source-error states. If the provider is unavailable, preserve the card and show “Data temporarily unavailable” with last successful timestamp, if known.
- Do not show “Live” unless the source and licensing genuinely provide real-time data. Use “latest reported” or “delayed” where appropriate.

## Sector Pulse — remove unclear 52-week high/low metric
- Do not show the previous 52-week highs/lows row.
- Derive pulse values from the same verified sectoral-index dataset used in the Nifty Index Heatmap, for the exact same session:
  1. Strongest sector/index and its return.
  2. Weakest sector/index and its return.
  3. Number of advancing sectoral indices / total valid sectoral indices.
  4. Average return across valid sectoral indices (define as simple arithmetic average unless explicitly changed).
  5. Leadership gap = strongest return minus weakest return, in percentage points.
- Label these as sectoral indices rather than implying all Indian market sectors are covered. Exclude missing/stale records from calculations and show the denominator. The demo values in the HTML must not be presented as current market facts.
- Any additional market-wide metric (e.g., India VIX) must come from a real, timestamped source and have a clear definition; otherwise omit it.

## Top Movers
- Keep the compact card below the Your stocks table.
- Provide Gainers and Losers tabs, based on the same valid quote snapshot and a clear universe (e.g. Nifty 500 or configured watchlist). Label the universe and session.
- Include stock symbol, price, absolute change and percentage change where space allows. Sorting must be numeric.
- Exclude stale/invalid quotes or clearly mark them.

## Sector-wise Stock Heatmap (restore the bottom heatmap)
- Keep this separate from the official Nifty Index Heatmap and keep it at the bottom of the Market Overview.
- Group individual stocks by sector using a verified sector classification source. Include sector filter and sorting options. Match the grouped multi-stock panel style already used by Kosh Studio and Ledger: each sector is a clear group/container with a compact grid/treemap of all its constituent stocks, not a long single row per sector or isolated one-stock cards. Support sectors with many constituents using responsive multi-column tile grids.
- Use each stock's verified latest-session percentage return for tile colour. If possible, size tiles equally for this stock-performance view unless there is a meaningful, explicitly labelled alternative; do not confuse it with the index-composition treemap where area must equal constituent weight.
- Tiles should show symbol, company name, price and daily % change, and open the stock chart on selection.
- Use the same session, quote cache and source-status rules as the table and Top Movers.
- Make it behave and look consistently with the sector stock heatmaps in Kosh Studio and Ledger. Reuse existing shared components/styles rather than creating a third inconsistent design.
- Search/filter states and empty states must be clear.

## Market Breadth and index summary cards
- Use a defined market universe and source for advances/declines/unchanged; show counts and percentage with the denominator. Ensure advances + declines + unchanged equals the number of valid instruments.
- Nifty 50, Sensex and Bank Nifty cards must use actual official/latest data and include absolute change and percentage change if room permits.
- Do not mix index data from different sessions.

## Data architecture and source requirements
Use server-side/provider adapters where needed; do not scrape fragile pages from browser-side JavaScript or expose API keys in the client. Keep provider credentials in server-side environment variables. Use caching, retries, timeouts, rate limits and schema validation. Provide a single normalized quote/index/flow model to keep cards, tables, heatmaps and movers consistent.
Preferred official source hierarchy:
1. NSE reports for provisional daily FII/FPI and DII cash-market activity: https://www.nseindia.com/reports/fii-dii
2. NSDL FPI reports for confirmed/depository-reported foreign portfolio investment: https://www.fpi.nsdl.co.in/web/Reports/Latest.aspx and official report listings at https://pilot.fpi.nsdl.co.in/Reports/ReportsListing.aspx
3. CDSL FPI/FII daily and monthly publications: https://www.cdslindia.com/Publications/FIIDailyData.aspx and https://www.cdslindia.com/Publications/FIIMonthlyData.aspx
4. Official exchange/index data for Nifty index values and constituents/weights; verify licensing and redistribution terms before production use.
5. If a source cannot legally or technically provide a required feed, document the limitation and propose a licensed provider. Never pretend a blocked source is connected.
NSE explains that its daily FII/FPI figures are provisional and can change after custodial confirmation; the UI must communicate this distinction. Use the appropriate final depository source for confirmed figures.

## Accuracy and validation requirements
- Delete/replace hard-coded demo arrays in the production implementation.
- Never fabricate current prices, index values, returns, FII/DII values, constituent weights, timestamps, source status or data freshness.
- Never silently use stale data. Show “Last updated”, the timestamp and stale/delayed status.
- Validate signs, units, currency, decimal precision, date boundaries, trading holidays and time zone (Asia/Kolkata).
- For net flow, verify net = gross buy − gross sell, subject to provider definitions/rounding.
- Add automated tests for calculations, source parsing, missing data, stale data, zero values, negative flows, holidays, and API failures.
- Add an on-page data-source/methodology disclosure and a source-health indicator. Do not label a static mockup or cached close as live.
- If an API is unavailable, build the real integration boundary and clear unavailable state; do not substitute fake values.

## Responsive and accessibility requirements
- Keep desktop layout dense and glanceable; avoid large empty gaps.
- On small screens, stack cards cleanly, keep table horizontally usable, and allow heatmap tiles to remain tappable.
- All controls must work, with keyboard focus states, accessible labels and touch-friendly actions.
- Preserve the existing Classic visual style.

## Acceptance checklist before finishing
1. Nifty Index Heatmap is above Your stocks.
2. Your stocks rows are approximately 26–28 px tall, one line per stock, with no invested amount or sparklines; Change and % Change reconcile mathematically from the same quote snapshot.
3. Top Movers is below Your stocks.
4. No timeframe selector controls in Nifty Index Heatmap.
5. “All indices” supports the full validated official Nifty index catalogue and filters/search.
6. Index tiles offer View Chart and View Composition on hover/focus/touch.
7. Composition treemap areas match official weights and tile colours match verified stock returns.
8. Compact FII/FPI and DII card remains in the lower dashboard area (not at the top) and includes daily/monthly/yearly views, gross buy/sell/net, a history chart, source and provisional/final status.
9. Sector Pulse metrics are derived from the same sector-index snapshot; no confusing 52-week highs/lows.
10. Sector-wise individual-stock heatmap is restored at the bottom and is separate from the Nifty index heatmap.
11. Top Movers, breadth, cards, table and heatmaps share consistent timestamps and underlying quote data.
12. No fake values are presented as real; missing integrations are visibly identified.
13. Search, filters, sorting, toggles, chart actions and responsive layouts are tested.
14. Summarize which real providers are connected, which require credentials/licensing, and which remain unavailable. Do not claim completion for any data feed that has not actually been tested.
