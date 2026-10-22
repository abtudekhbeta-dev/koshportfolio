# KOSH — MARKET OVERVIEW STOCK WORKSPACE
## Classic layout only · implementation prompt for Grok

**Production reference:** https://koshportfolio.grok.me/  
**Target route:** `/markets?view=overview` (confirm exact current route and query behaviour in source before changing it)  
**Primary source reference for this handoff:** the latest source archive provided with this task. Inspect its actual code before editing. The current source inspection found `src/routes/markets.tsx`, `src/components/terminal/market-overview.tsx`, `src/components/terminal/markets-desk.tsx`, `src/components/terminal/term-chart.tsx` (verify exact path/name), and existing market-data/API/store modules.  
**Visual reference:** open `Kosh_Market_Overview_Classic_Visual_Guide.html` in a browser. It is a self-contained, interactive visual prototype with illustrative sample data, not a data source.

---

# 1. Mission

Improve Kosh's **Market Overview stock-tracking experience in the existing Classic layout only**. This is a targeted product feature, not a full application redesign and not a new layout.

The user's most frequent workflow is to track **all stocks held across every portfolio** and their **watchlist stocks**. The screen should become a polished, efficient stock-monitoring workspace, not just two ordinary tables.

The agreed direction combines:
- A compact market-context band at the top.
- A small Top Movers panel.
- A central, complete stock tracker with All Stocks / Owned / Watchlist views.
- A compact, single-line-per-stock table. **Do not show sparklines or invested/position amount columns**; these were intentionally removed.
- A **View Chart** action for each stock.
- An on-demand chart panel that opens from the right, only after the user explicitly clicks View Chart.
- Existing top navigation, with **no persistent left sidebar** added.
- Existing market features retained below or around the primary workspace where appropriate.

The default state must give the stock tracker as much useful horizontal space as possible. The large chart must not be visible or reserve a blank column until requested.

# 2. Non-negotiable constraints

1. **Classic layout only.** Do not redesign Intelligence, Studio, or any other layout. Do not change the layout selector.
2. Preserve the current top navigation and its destinations. Do not introduce a left navigation rail/sidebar for Markets, Screener, Portfolios, Watchlist, Compare, Alerts, Notes, Settings, etc.
3. Preserve all current business logic, calculations, API contracts, persistence, watchlist behaviour, portfolio calculations and market-data logic unless a verified bug must be fixed separately with a regression test.
4. Reuse the existing chart implementation and data source wherever technically sound. Do not build a second independent chart engine.
5. The chart panel is **closed by default**. No chart-sized blank area, hidden mounted chart, or chart data request for every row when closed.
6. Clicking **View Chart** opens the panel in-place. It must not navigate to a separate page, trigger a full-page reload, reset table filters/sort, or jump the user back to the top.
7. Selecting another stock while the panel is open updates the same panel. It must not create a stack of panels or require closing/reopening.
8. Closing the panel returns the stock tracker to its full-width state and preserves search, filters, selected portfolio, tab, sort, and scroll position.
9. Do not silently truncate the user's held stocks or watchlist stocks. Any pagination/virtualisation must make the complete set accessible and show the total count.
10. Do not imply real-time/live market data unless the actual feed and freshness justify that label. Preserve truthful provider/delay labels and timestamps.
11. No fake market values, fabricated movers, invented fundamentals, invented data freshness, or synthetic claims in production. Use existing APIs and source data. The HTML guide's numbers are illustrative only.
12. Preserve current Market Overview features (indices, breadth, Top Movers, the official Nifty Sectoral Indices Heatmap, macro, event calendar, Pulse, market headlines, MixNudge and other useful modules), except **remove the separate “My Stocks by Sector” section entirely** as explicitly requested. Do not remove the official Nifty sectoral-index heatmap. Reorder or compact retained modules thoughtfully.
13. Avoid adding heavy permanent cards, giant hero headers, excessive shadows, oversized rounded containers, or excessive vertical spacing. The stock tracker is the main event.
14. No broad refactor, dependency changes, layout migration, or unrelated features as part of this task.

# 3. Required first step: baseline audit

Before editing:

- Inspect the current source and production screen for `/markets?view=overview` in Classic.
- Identify the exact source for index tiles, market breadth, gainers/losers, portfolio holdings, watchlists, quote refresh, market heatmap, macro, events, Pulse and news.
- Inspect `src/components/terminal/market-overview.tsx`, `src/routes/markets.tsx`, the existing `TermChart`/chart modules, market-data provider status helpers, API quote methods, store types/actions, and CSS tokens.
- Determine how the current Classic top navigation is composed and ensure no left sidebar is introduced.
- Identify the exact way portfolio symbols, watchlists, quotes, and instrument names are normalized and joined. Reuse existing helpers.
- Inspect how `TermChart` obtains quote/history data and whether it can be safely embedded inside a side panel. If it depends on MarketsDesk-only store assumptions, create a thin adapter or extract a reusable wrapper around the same chart engine; do not duplicate chart rendering logic.
- Capture baseline screenshots and note existing working behaviour before changing code.
- Report the component/data-flow map briefly before implementation, then continue to implement. Do not stop after producing a plan.

# 4. Information architecture and default screen

## 4.1 Existing top navigation

Keep the current Classic navigation exactly where it is. The new Market Overview content starts below it. Do not add a left rail.

## 4.2 Page heading

Use a compact header:
- Title: `Market Overview`
- Short subtitle: `Track your portfolio and watchlist stocks with market context.`
- Optional compact refresh/freshness status aligned to the right.
- Do not make an `Open Terminal` CTA the primary action. Existing navigation may remain if it is already present and useful, but the stock tracker must not be hidden behind a terminal link.

## 4.3 Market-context band

A compact row/grid of market summary tiles above the stock tracker. At minimum reuse available data for:
- Nifty 50
- Sensex
- Bank Nifty
- Market breadth (advancers vs decliners, if existing source supports it)
- FII/DII activity only if the current source reliably provides it; otherwise do not fabricate a tile or use stale/unknown values without a clear status.

Each tile should show:
- Label
- Latest available value
- Absolute and/or percentage change as supported by current data
- Appropriate positive/negative/neutral visual state
- A truthful freshness/provider indicator where useful, especially if delayed/stale.

Responsive behaviour:
- Desktop: one compact row or grid; avoid excessive height.
- Tablet: wrap naturally into fewer columns.
- Mobile: horizontally scrollable summary strip or compact two-column layout without forcing the whole page to overflow horizontally.

Keep the visual hierarchy subtle. These are context, not the dominant content.

## 4.4 Top Movers

Provide a compact Top Movers area that does not crowd out the stock tracker.

- Tabs or segmented control: `Gainers`, `Losers`, optionally `Active` only if supported by reliable current data.
- Show a small number of rows (for example 4–6 visible) with symbol/name and percentage change.
- Use existing screener/quote data and current sorting helpers. Do not create a new market-data provider.
- Clearly indicate when data is unavailable or stale.
- Clicking a mover selects/highlights that stock in the stock tracker and scrolls it into view when possible. **It must not automatically open the full chart**; chart opens only when View Chart is clicked.
- **Avoid the current large dead zone below the Nifty 50/Sensex/Bank Nifty/Breadth tiles and above Your stocks.** Do not put a tall Top Movers card beside short index cards if the shared grid row forces the page content below to start at the tall card’s bottom.
- Preferred desktop layout: a compact, content-height index/breadth row first, then a very compact horizontal Top Movers strip (Gainers/Losers switch with a handful of ticker + percentage items) directly above Your stocks. An equally compact alternative is acceptable if it removes dead space and preserves scanability. Do not push Top Movers below the entire stock table unless that is the only way to preserve a clean hierarchy.
- Use content-driven heights and top alignment; do not set a tall fixed/minimum height to align unrelated cards. On narrower widths, wrap the movers strip or make it collapsible. Never squeeze the table to unusable width.

# 5. Main stock tracker

## 5.1 Views and semantics

Use a compact segmented switch:
- `All Stocks`
- `Owned`
- `Watchlist`

Counts should be accurate and should not count the same stock twice in All Stocks. A stock that is both owned and watched should appear once in All Stocks, with both status tags.

Definitions:
- **All Stocks:** deduplicated union of all portfolio holdings and the applicable watchlist symbols. If the current data model has multiple watchlists, use a clearly defined behaviour: by default include the active watchlist in the union, with a selector to choose a particular watchlist; do not silently mix all watchlists unless the user can understand/control it.
- **Owned:** deduplicated symbols across all portfolios, or within the selected portfolio when a portfolio filter is active.
- **Watchlist:** symbols from the selected watchlist. Add a watchlist selector when multiple watchlists exist.
- Portfolio selector: `All Portfolios` plus each current portfolio. Changing it filters ownership context and must not corrupt or mutate portfolio data.
- Preserve existing watchlist selection and sorting behaviour where possible.

Make it obvious which context is active. Do not rely on colour alone.

## 5.2 Search and controls

Place controls above the rows in one compact toolbar:
- Search by symbol or company name.
- Portfolio selector.
- Watchlist selector when relevant.
- Filter button with active-filter count when applicable.
- Sort/column controls if needed.
- Optional Heatmap view toggle only if it can reuse the existing heatmap and doesn't compete with the main list. Heatmap is secondary, not the default.
- Optional `Columns` control for optional metrics, if feasible without overengineering.

Search/filter should be client-side over the already-loaded symbol set wherever possible. Do not issue an API request on every keystroke unless the existing API requires it; debounce if remote search is required.

## 5.3 Stock row visual design

Rows should be visually richer than a plain table, but still dense enough for dozens/hundreds of stocks. Prefer a refined, table-like stock board rather than large cards.

Recommended columns/order:
1. Optional row number only if useful; avoid wasting width.
2. Stock identity: company name, ticker and exchange in secondary text; small logo/initial avatar only if a reliable existing asset exists. Do not make external logo calls for every row.
3. Price.
4. Absolute daily change.
5. Percentage daily change.
6. Actions: `View Chart`. Keep additional controls outside the row or only if they do not increase row height.

If the viewport is too narrow, hide optional columns before sacrificing ticker/name, price, change, status and View Chart. Keep precise values in aligned tabular numerals. Right-align numeric values.

### Compact single-line rows
- Each stock must occupy exactly one compact table row at normal desktop widths.
- Keep the company name and ticker on one line where practical; use truncation with a tooltip/title for long company names rather than wrapping the row to two lines.
- Keep the row height close to the previous compact version of the live page. Align price, absolute change, percent change and `View Chart` horizontally.
- Do not reintroduce sparklines, invested amount, position value or other removed columns. Do not put membership chips, secondary metadata or stacked labels into the row if they force a second line.
- On narrower screens, preserve readability and use deliberate responsive behaviour; do not allow accidental text wrapping to double every row height.

### Sorting
- Preserve existing sort cycling if already used.
- Support name, last price, absolute change and percent change at minimum.
- Do not add sorting for invested amount or position value because those columns are intentionally absent.
- Sort null/unavailable values consistently and visibly.
- Keep sort state while opening/closing the chart panel.
- Use stable ordering for ties.

### Completeness and performance
- No `slice(0, N)` that silently hides holdings/watchlist items.
- Show total count and filtered count.
- For large lists, use pagination or virtualization with accessible controls and no data loss.
- If the existing data model caps quote requests (e.g. live symbol batching), do not confuse quote-coverage limits with the complete stock universe. Display all symbols and show per-symbol quote status as unavailable/stale where required. Never silently omit stocks because a quote batch is capped.

# 6. On-demand right-side chart panel — core interaction

This is the most important new behaviour.

## 6.1 Default state

- Closed by default.
- No large chart visible.
- No blank column or reserved panel width.
- No full historical chart data loaded for every row while closed.
- The stock list uses the full available width.

## 6.2 Opening

When the user clicks `View Chart` for a stock:
- Set that stock as the selected chart symbol.
- Open a right-side panel in the same page.
- Use a smooth, restrained slide/resize transition (roughly 180–260 ms; respect `prefers-reduced-motion`).
- At desktop widths, the stock tracker remains visible and narrows to make room for the panel.
- The chart should open in the **wide chart layout by default**, not a narrow drawer. Target approximately 50–60% of the available content width on desktop, while retaining enough table width to identify/select stocks. If a split view cannot satisfy both, use a wide overlay that does not distort the chart. Offer a compact/wide control only if it adds value; wide is the default.
- The layout should animate without flashing, jumping, or remounting the entire page.
- No route navigation and no `window.location` change required to open the panel.
- The currently selected row is visibly highlighted.
- Move keyboard focus sensibly into the panel heading or chart controls without making keyboard navigation awkward.

## 6.3 Panel header

Show:
- Company name and ticker/exchange.
- Latest available price and daily change when quote data is available.
- Data status/freshness from the existing market-data system.
- Close button with accessible name `Close chart`.
- Optional `Open full chart/Terminal` action only as a secondary escape hatch, reusing the current terminal route. Do not make this the default chart interaction.
- Existing stock actions such as Compare/Add Note only if they can be safely reused and do not clutter the panel.

## 6.4 Chart controls and content

Reuse the existing chart engine and data. Preserve supported capabilities such as timeframe selection, crosshair/tooltip, price axis, chart type/style and existing indicators/drawings only to the extent the current chart component supports them. Do not invent chart capabilities that do not exist.

The panel should include:
- Chart area with responsive resizing.
- Existing timeframe buttons in a compact, single-line toolbar (use the actual supported intervals from the existing chart component).
- **Fix the current timeframe-toolbar overlap/misalignment.** Timeframe controls must not overlap the chart title, quote header, chart plot, or each other. Give the toolbar its own layout row, allow horizontal scrolling/wrapping only as a deliberate responsive state, and verify at the target desktop/tablet/mobile widths. Do not position timeframe buttons with fragile absolute positioning.
- Provide a clearly visible **Fullscreen** action in the panel, expanding the chart to a true viewport-filling workspace; provide an obvious exit-fullscreen/restore action.
- Keep a separate **Open in Terminal** action that navigates to the existing Terminal route for the selected symbol, using the app's existing route/deep-link conventions. This is an explicit user choice, not the default chart-opening behaviour.
- Appropriate loading skeleton while the selected symbol's history loads.
- Clear empty/error state if historical prices are unavailable.
- Quote freshness and provider status consistent with the rest of Kosh.
- A compact lower tab area only if existing reusable content supports it (for example Overview / Key Metrics / News). Do not build a second stock-analysis application inside the panel.

When the chart is open, only the selected symbol's full chart history should be requested unless the existing chart cache already has it.

## 6.5 Switching stocks

- Clicking View Chart on another row updates the selected symbol inside the same panel.
- Keep the panel open and preserve the user's selected timeframe when it makes sense for the new symbol.
- Do not create a new panel instance on every click if it can be updated in place.
- Update title, price, freshness, chart and accessible labels atomically so old data is not briefly presented as the new symbol's data.
- Handle a slow request or a failed request without leaving the prior stock's chart incorrectly labelled as the new one.
- Clicking a row itself may open the existing stock detail route only if that is current behaviour; do not make row click accidentally open the chart. The explicit `View Chart` action is the sole chart-opening trigger.

## 6.6 Closing and persistence

- Close restores full stock-board width.
- Preserve scroll position, active All/Owned/Watchlist tab, selected portfolio/watchlist, search, filters, sort and column settings.
- Escape may close the panel when focus is inside it, unless doing so would conflict with a nested dialog.
- Do not reset data queries or the entire Market Overview component when closing.
- Panel open/closed state need not persist across page reload unless there is already an established preference pattern. If URL deep linking is implemented, it must remain compatible and not force the panel open unexpectedly in Classic.

## 6.7 Resizing

- Provide a subtle drag handle on desktop if the existing `react-resizable-panels` dependency can be reused.
- Enforce min widths for the table and panel; never let either become unusable.
- Add a simple restore/default width affordance if feasible.
- Do not add resize complexity if it causes unstable chart redraws or layout bugs; a well-designed fixed-width panel with a user-selectable compact/wide toggle is an acceptable fallback.

# 7. Responsive behaviour

## Desktop (1280, 1440, 1920 px)
- Existing top nav only; no left sidebar.
- Summary tiles compact.
- Top movers visible but secondary.
- Stock tracker gets most of the viewport.
- On chart open, use a split layout with a readable table and chart panel.

## Tablet (768 px)
- Summary cards wrap or become horizontally scrollable.
- Top movers may collapse or move above the stock list.
- Chart panel may become a wider overlay/sheet if a split would make the stock list too narrow.

## Mobile (390 and 412 px)
- Do not force a 2-column desktop split.
- `View Chart` opens a full-height drawer/sheet/overlay with a visible close control and a chart that fits the viewport.
- Closing returns to the exact stock list state and scroll position.
- The top nav must follow the current Classic mobile behaviour; do not introduce a new navigation system.
- Avoid page-level horizontal overflow. Table horizontal scrolling is allowed only inside the table region, with key columns/action kept usable where practical.
- Respect safe areas and browser viewport height.

# 8. Preserve and reposition the rest of Market Overview

The current Market Overview contains other useful modules, including (verify actual current contents):
- Index tiles
- Holdings today
- Market breadth / market temperature
- Winners and losers
- Watchlist
- Sector overview and market heatmap
- Macro board
- Event calendar
- Pulse / notes-related module
- Market headlines/news
- MixNudge or other existing contextual section

Do not delete them. The primary first-screen order should be:
1. Compact page header.
2. Market context summary + compact Top Movers.
3. Main stock tracker (highest priority).
4. Remaining market intelligence modules in a clear lower-page sequence, or behind non-destructive collapsible sections if that improves density.

The user's held stocks and watchlist should not be buried below multiple unrelated market widgets. Existing modules must remain reachable and functional. Do not collapse a module by default if that would make an important existing capability effectively disappear; choose the order based on baseline inspection.

# 9. Visual design — STRICT THEME PRESERVATION

**The redesigned Market Overview must look and feel like it belongs to the existing Kosh Classic application. This is a targeted layout/interaction improvement, not a new visual theme.**

Before styling anything, inspect the actual Classic application and identify its current theme tokens, CSS variables, typography, page/background surfaces, navigation active states, buttons, borders, card surfaces, table headers/rows, selected-row treatment, semantic gain/loss colours, radii, and spacing. Reuse those exact tokens and established components. Do not guess or invent a new palette.

**Do not copy the blue-heavy palette in the standalone HTML or generated concept image as a requirement.** Those files demonstrate composition, density, hierarchy, and interaction only. Their sample colours are placeholders. Replace/adapt every colour to the real Classic theme in the production implementation. If Kosh Classic uses blue as its established accent, use that existing blue consistently; if it uses another accent, retain that instead. Do not introduce a competing accent colour.

The Market Overview must visually align with other Classic tabs and sections: same overall background, surface tones, accent colour, active tab/button styling, typography, semantic green/red, border treatment, corner radius, spacing, icon style, and hover/focus states. It must not look like a separate blue mini-app embedded inside Kosh. No global theme changes, no changes to other routes, no new theme selector, and no changes to Intelligence/Studio.

Where a component already exists in Classic (button, segmented tabs, table, input, card, tooltip, chart shell), prefer reusing it over creating a visually similar but inconsistent duplicate. Add new styling only for genuinely new structure, and express it using existing tokens. Verify the result side-by-side against at least one existing Classic page and correct any mismatch before declaring done.


Direction:
- Premium, calm, precise, information-dense.
- Clear visual hierarchy; table remains readable at high row counts.
- Compact market tiles, restrained borders, subtle surfaces.
- Use existing semantic colours for positive/negative changes.
- Stock identity is readable; ticker/exchange are secondary.
- Tabular numerals for price/change columns.
- Consistent row heights, alignment and hover/selected states.
- The selected row is visibly connected to the open chart panel.
- Avoid excessive shadows, large card radius, large headings, oversized whitespace and rainbow colours.
- Keep motion purposeful and subtle; support reduced motion.
- Use accessible contrast and keyboard focus indicators.

The attached HTML guide is a **visual/interaction reference**, not production code. Adapt it to the actual app's tokens, typography, component primitives and live data. Do not copy sample values as production data.

# 10. Data and semantics

- Reuse existing APIs such as tape/quotes/screener and existing query cache keys where appropriate.
- Avoid duplicate quote polling. Do not create a second timer or duplicate API call for the same symbol just because the chart panel is open.
- Respect current market session polling/stale-time logic and existing market provider status.
- Keep quote fallback semantics explicit: if live quote is unavailable, distinguish a screener/historical fallback from a current quote.
- Do not compute daily change from mismatched current/previous-close fields. Reuse existing quote helper logic.
- Normalize symbols using existing helpers (`bareSymbol` or equivalent) to prevent `.NS`/`.BO` duplicates.
- For portfolio membership, preserve each portfolio's actual holdings and quantities. A stock held in two portfolios appears once in All Stocks, but its membership and aggregate quantity/value must be handled accurately.
- Do not reintroduce position value, invested amount or sparkline fields into the Market Overview table; these columns were intentionally removed. This instruction does not require changing calculations or fields used elsewhere in Kosh.
- Null/missing prices should render as an em dash plus a suitable status; do not render zero as if it were a valid quote.
- If quote data is delayed, stale, or missing, reflect that honestly in the row/panel.
- Never silently imply all rows have fresh quotes when API batching or rate limits leave some without current data.

# 11. Accessibility and interaction details

- All buttons have accessible names and visible keyboard focus.
- View Chart is a real button, not a clickable decorative icon.
- Sort headers are keyboard accessible and announce current direction.
- Segmented controls expose selected state.
- Panel close button is reachable by keyboard.
- Use appropriate dialog semantics on mobile overlay. On desktop side panel, use an accessible complementary region/labelled section, not an unnecessary modal dialog.
- Reduced motion preference disables/slows the slide animation.
- Tooltips must be keyboard accessible or have equivalent accessible labels.
- Colour is never the sole indicator of positive/negative state.

# 12. Loading, empty, and error states

Provide designed states for:
- Initial market data load.
- Quote refresh in progress while keeping last good values visible.
- No portfolios/holdings configured.
- No watchlist symbols.
- Search/filter returns no rows.
- A stock has no current quote.
- Chart history is loading.
- Chart history unavailable/error.
- Market summary data stale/unavailable.
- Quote endpoint/rate limit failure.

Keep the rest of the screen usable if one module fails. A chart failure must not break the stock tracker. A market breadth/news failure must not hide holdings/watchlists.

# 13. Performance requirements

- Keep the closed chart panel unmounted or otherwise prevent expensive chart rendering/history fetch while closed.
- Lazy-load chart module if appropriate for the current build.
- Avoid fetching full history for every row.
- Memoize derived union/deduplication, membership, sorting and filtering with stable dependencies.
- Avoid O(number-of-rows × screener-row-count) repeated `.find()` loops; build symbol maps once.
- Keep table state local and stable when the chart opens/closes.
- Use virtualization only if necessary; test focus, row action and scroll behaviour if used.
- Do not add a large new charting dependency.

# 14. Required acceptance tests

## Stock universe and filters
- All Stocks equals the deduplicated union according to the documented active-watchlist rule.
- Owned includes every holding in every selected portfolio; no silent 8/24/36-row cap.
- Watchlist contains all symbols in the selected watchlist.
- A stock that is owned and watched appears once in All Stocks and has both labels.
- Portfolio selector correctly changes ownership membership and the relevant stock counts.
- Multiple watchlists can be selected if supported by the existing data model.
- Search matches ticker and company name.
- Sort toggles correctly for name, price, change and change percent.
- Missing values sort consistently.
- Counts update when filtering.

## Chart panel
- Initially closed on a fresh Market Overview visit.
- No full chart-history query is issued while closed solely for the panel.
- Clicking View Chart opens the right panel with no route change/page reload.
- Panel open does not reset filters, sort, selected tab, portfolio, or scroll position.
- Clicking View Chart for another stock updates the existing panel correctly.
- Chart title/price/series never mismatch after fast repeated symbol changes.
- Close restores full-width view and preserves state.
- Loading/error/no-history states are clear and non-breaking.
- Resize works if implemented; minimum widths are respected.
- Keyboard close and reduced-motion behaviour work.
- Mobile opens a sheet/overlay and close restores prior scroll position.

## Existing modules and regressions
- Index tiles still link/open instruments as before.
- The official Nifty sectoral-index heatmap defaults to 1D and displays that trading day's performance when the market is live.
- Stock rows remain one line and compact, with no sparklines or invested/position amount columns.
- Chart timeframe controls do not overlap; chart opens wide by default and supports both Fullscreen and Open in Terminal.
- Market breadth, winners/losers, sector heatmap, macro, events, Pulse and news still work.
- Existing stock detail and Terminal routes/deep links still work.
- Top navigation unchanged.
- No change to portfolio calculations or data persistence.
- No duplicate polling/timers.
- No console errors.

## QA sizes
- Desktop: 1280 × 800, 1440 × 900, 1920 × 1080.
- Tablet: 768 px wide.
- Mobile: 390 × 844 and 412 × 915.
- Check Classic layout only; confirm other layout source files and styles have not been modified unnecessarily.

# 15. Verification and final report

Run the project's relevant tests, typecheck, lint (if configured), and production build. Use the actual package scripts in the provided source; do not claim a check passed unless it ran successfully.

Capture before/after screenshots for:
1. Market Overview default state.
2. Chart panel open.
3. Switching selected stock while panel remains open.
4. Chart panel closed after interaction.
5. Filtered/search state.
6. Mobile chart overlay.
7. Lower Market Overview modules.

Inspect console/network for errors and duplicate requests. Verify actual production behaviour only if you have access to the deployment; otherwise clearly state that production deployment was not verified.

Final response must include:
- Files changed.
- Components reused vs created.
- Exact chart panel behaviour.
- Existing modules preserved.
- Quote/history source and freshness behaviour.
- Test commands and real results.
- Screenshots or preview link if available.
- Known gaps and any failed checks.
- Explicit statement that the work changed Classic Market Overview only.

Do not stop after creating a mockup. Implement the feature, test it, and report truthfully.

---

# Definition of done

The task is complete only when Market Overview is a cleaner, more useful stock-monitoring workspace; every portfolio holding and applicable watchlist symbol remains accessible; the table uses compact single-line rows without sparklines or invested/position amount columns; the official Nifty sectoral-index heatmap defaults to 1D live-session performance with supported historical periods correctly populated; the separate “My Stocks by Sector” section is removed; market cards have no dead vertical space and Top Movers is compactly repositioned; the table is dense and single-line; the chart is hidden until View Chart, opens wide, has correctly aligned timeframe controls, supports Fullscreen and Open in Terminal, and closing it restores the original list state; and every chart drawing is durably persisted in canonical timestamp/price coordinates and remains identical across timeframes for the same instrument. Existing unrelated modules and top navigation remain intact; responsive, functional and regression checks must be run and reported.


# 16. Final user clarifications — mandatory, supersedes any conflicting earlier wording

These requirements are the latest explicit user decisions. Where an earlier section of this prompt conflicts with this section, **this section wins**.

## 16.1 Official Nifty sectoral-index heatmap (not the app's stock-sector heatmap)

- The section must represent **official NSE/Nifty sectoral indices**, not sectors inferred by grouping the user's owned/watchlist stocks.
- Use official sectoral index instruments available from the project's verified market-data source (examples may include Nifty Auto, Nifty Bank, Nifty Financial Services, Nifty FMCG, Nifty IT, Nifty Media, Nifty Metal, Nifty Pharma, Nifty Realty, Nifty PSU Bank, Nifty Private Bank and Nifty Oil & Gas, but confirm which are supported by the feed and do not fabricate values).
- Label the section **Nifty Sectoral Indices Heatmap**. Do not call it “Nifty 50 sector heatmap”.
- Default period is **1D**, selected on first render and after a fresh page visit unless an established preference-persistence convention says otherwise. Other periods can be selected explicitly for analysis, e.g. 1W, 1M, 3M, 6M and 1Y, only where the underlying data supports them.
- When the market is live, 1D must reflect each sectoral index's performance for the **current trading session/day**, with updates consistent with the existing quote refresh mechanism. Do not substitute previous-day performance while presenting it as live.
- Outside market hours, show the latest completed session's daily change and identify it as the latest session/last available data. Do not freeze stale intraday data under a “live” label.
- Use the same verified definition of daily change as the rest of Kosh. Show source/provider and last-updated time. If a symbol is unavailable or stale, show an honest unavailable/stale state instead of a guessed tile or fabricated colour.
- Tiles should be compact, equal-height, and clickable to open the existing chart/details for that official index if supported. Use a consistent, legible colour scale and show the numeric 1D percentage on each tile.
- The app's own stock-sector heatmap must **not** appear on this Market Overview page. Remove the “My Stocks by Sector” section entirely; retain only the official-index heatmap here.

## 16.2 Market cards and breadth

- Fix the index-card row's excess blank space. Index tiles must size to their own compact content and must not stretch vertically just because Top Movers is taller. Use appropriate grid alignment (`align-items: start` or equivalent), consistent card padding, and a compact Top Movers list; do not use a fixed height that creates dead space.
- Fix the Market Breadth overlap/alignment issue. Advancing and declining counts, percentages, labels and any breadth bar must have distinct layout slots and must never collide. Counts and percentages must refer to the same instrument universe and data timestamp.
- Replace vague freshness labels such as “LAST AVAILABLE” with the actual last-updated time plus a truthful status/provider indicator wherever the existing data permits it.

## 16.3 Stock table: compact and one line per stock

- The live table must show **one compact line/row per stock** on desktop, as in the previous compact version.
- Keep only the intentional core columns: Stock, Price, Change, % Change and View Chart, plus any currently necessary non-height-increasing control. Do not restore invested amount/position value or sparklines.
- Keep company name on one line where possible and ticker as compact secondary text only if it does not make each row excessively tall. Truncate long names with an accessible title/tooltip rather than allowing a second line. Do not stack multiple tags/metadata inside a stock row.
- Check actual CSS constraints, line-height, cell padding, avatar sizing, flex `min-width`, `white-space`, and wrapping. Fix the cause rather than simply hiding overflow in a way that clips important data.
- Search, All Stocks/Owned/Watchlist tabs, portfolio/watchlist selectors, sorting, filters, row actions, counts and pagination must continue to work. Do not regress the user's ability to inspect every stock.

## 16.4 Chart panel: wide by default, no overlap, Fullscreen and Terminal

- Clicking View Chart continues to open the chart in-place without a page reload and with the table state preserved.
- The chart opens in a **wide layout by default** (target around 50–60% of desktop content width where practical), with the stock list still accessible. Do not default to the narrowest drawer size. On narrower viewports, use a deliberate wide overlay/sheet appropriate to the screen.
- Fix the timeframe selector overlap currently visible in the live app. The timeframe controls get their own normal-flow toolbar row and must not overlap the chart heading, price/quote, chart plot, tabs or other controls. Test resizing and different viewport widths. Avoid brittle absolute positioning.
- Add a visible **Fullscreen** control that expands the chart workspace to the viewport. In fullscreen, provide a clear **Exit Fullscreen/Restore** control and keep Escape behaviour sensible. Preserve selected symbol and timeframe when entering/exiting.
- Add an **Open in Terminal** control to navigate to the existing Terminal experience for the currently selected symbol. Reuse existing routes and deep-link behaviour; do not invent a new route or create a second chart engine.
- Fullscreen and Terminal are distinct: Fullscreen enlarges the current in-page chart; Open in Terminal navigates to the existing Terminal. Keep both available without making either happen automatically.
- Switching View Chart to another stock updates the same panel. Close, fullscreen/restore and symbol changes must not accidentally reset table filters, sort, active tab, portfolio/watchlist selection or scroll position.
- Test chart layout after opening, switching symbol, changing timeframe, entering/exiting fullscreen, resizing, closing and reopening. Verify no clipped or overlapping controls, and verify keyboard focus and mobile behaviour.

## 16.5 Remove the redundant stock-sector section and reclaim vertical space

- Remove **“My Stocks by Sector”** and its tiles/cards from Market Overview. Remove its local section heading, grid, empty spacing and any layout wrapper used only by that section. Remove dead code only when clearly unused; do not remove shared stock-sector utilities if other screens still use them.
- Retain **Nifty Sectoral Indices Heatmap**. These are two different concepts: official index performance stays; the app's own sector classification of the user's stocks goes away from this page.
- Fix the blank vertical area visible below Nifty 50, Sensex, Bank Nifty and Market Breadth cards and above Your stocks. Diagnose the actual layout cause (e.g. CSS Grid row stretching, `align-items: stretch`, fixed/min-height, card height or parent wrapper). Do not merely hide overflow or apply a negative margin.
- Prefer this compact vertical order: page heading/freshness → compact Nifty 50/Sensex/Bank Nifty/Breadth row → compact horizontal Top Movers strip → Your stocks. Keep the stock table high on the page so the maximum number of rows is visible on initial load.
- Top Movers must still support Gainers/Losers and truthful values. A horizontal strip can show a small number of symbols and percentage changes; ensure keyboard access, responsive overflow handling, and a clear selected state. If this design is not feasible, use another compact placement that avoids the current large empty region.
- Ensure there is no large reserved whitespace when the chart is closed, no empty section gap after removing My Stocks by Sector, and no card stretching driven by a taller unrelated component.

## 16.6 Sector heatmap: correct missing-period handling and data provenance

The current screenshot shows a mix of numeric returns and “Unavailable” tiles when 6M is selected. Do not assume this is valid merely because a provider returns missing values. Diagnose the actual cause per index and period before deciding what the UI should show.

- First inspect the existing quote/history adapter, canonical instrument/symbol map, supported intervals, endpoint responses, caches, error handling and return-calculation logic. Establish whether the failure is due to unsupported provider coverage, incorrect index identifiers, insufficient history, parsing/date/timezone bugs, rate limits, or swallowed API errors.
- Use canonical official index identifiers and aliases for the actual configured provider. Avoid treating a symbol-mapping failure as genuine absence of index history.
- For 1W/1M/3M/6M/1Y, calculate returns from verified historical index closes when available: compare the latest valid index level with the valid close at or immediately before the defined lookback boundary, using one consistent trading-calendar rule. Do not use stock constituent returns as a proxy for index returns.
- For 1D during market hours, use the current session's latest index level versus the prior official close. Outside market hours, use the latest completed session and label it accordingly. Respect the app's actual feed delay and refresh status.
- Ensure every official sectoral index that the chosen verified provider supports is populated across each timeframe for which sufficient history exists. Do not hardcode a few indices/timeframes or silently restrict the heatmap to a subset. If an index truly lacks sufficient history or the provider genuinely does not support it, show a specific, honest reason/state where feasible.
- Distinguish `not supported`, `insufficient history`, `temporarily failed`, `stale`, and `no data` internally; avoid rendering all cases as a generic `Unavailable` when the cause can be determined. Log useful diagnostic context without exposing secrets.
- Add tests for the period boundary, holidays/non-trading days, first available history point, missing candles, timezone/session boundaries, current session vs previous close, invalid response, rate limit and symbol aliases.
- Keep **1D selected by default**. Switching timeframes should refresh/recompute returns without changing the index universe or silently dropping tiles. Keep tiles in a stable order across timeframes.
- Official index list and index naming should align with NSE/Nifty Indices sources; use the configured provider for values and do not scrape or hardcode display values as a shortcut.

## 16.7 Terminal drawings: one canonical drawing set across every timeframe

This is a required chart-engine/data-model fix, not just a UI toggle. Every user-created drawing, pattern, annotation or tool object must remain visible at the same price/time location when changing timeframe for the **same canonical instrument**. It must not be re-created, re-snapped, translated to a different candle, or disappear merely because the interval changed.

### Canonical identity and persistence
- Inspect the existing chart library and drawing storage first. Reuse the current chart engine; do not introduce a second drawing system or dependency unless the current engine cannot support the requirement and the limitation is demonstrated.
- Key drawings to the canonical instrument identity (exchange + instrument ID/symbol as appropriate) and user/workspace scope, **not the selected timeframe**. NSE and BSE instruments must not accidentally share drawings unless they are intentionally the same canonical instrument.
- Persist drawings through the existing durable backend/user workspace mechanism if one exists. If the application currently supports only local persistence, implement a versioned, validated local fallback and document its scope; do not claim cross-device persistence without a durable synced store.
- Autosave create/edit/move/resize/delete and style changes with debouncing where appropriate, flush pending saves on navigation/unmount, surface save errors, and prevent stale responses from overwriting newer edits. Include stable IDs, schema version, updated-at/revision metadata, and safe migrations.
- Drawings must survive chart close/reopen, timeframe changes, symbol switch away and back, Terminal route navigation, and page reload. Reopening the same canonical instrument restores the same drawing set.

### Coordinate model — critical
- Store geometry in **data coordinates**, never screen pixels, chart logical indices, array offsets, or timeframe-specific candle indices.
- Every anchor point must use an absolute timestamp (UTC epoch in a single documented unit, preferably milliseconds or seconds consistently) plus the actual price value, with drawing-specific fields for tools such as horizontal/vertical lines, trendlines, rays, rectangles, channels, Fibonacci tools, text/labels and pattern annotations.
- On every timeframe change, project the stored timestamp/price anchors through the chart library's time/price coordinate conversion APIs. Never re-anchor a drawing to the nearest candle index just because the active interval changed. If the library requires timestamps that exist in the loaded series, implement a verified adapter that preserves the actual absolute-time coordinate instead of silently substituting the next bar; document any unavoidable library limitation.
- A drawing made on a 1m/3m/5m/15m/hourly/daily/weekly chart must use the timestamp corresponding to the actual user-selected chart coordinate. Keep all anchor prices exact at stored precision. Do not recompute anchors from a new timeframe's candle OHLC.
- Keep drawing geometry independent from visible range and zoom. Zoom/pan may change screen pixels but must not change saved time/price anchors. Drawings must not drift when data is prepended, history depth changes, bars are backfilled, or timeframe changes.
- Render the same drawing IDs, anchor timestamps, prices, geometry, style, text, extension settings and visibility on every timeframe for that instrument. Tool-specific geometry should remain identical in data space even if the visual intersection with candles differs naturally at different granularities.

### UX and conflict safety
- Provide clear save state (saved/saving/error) if the app has drawing persistence; do not silently lose drawings.
- Maintain selection/editability after interval changes; selection handles should be projected from canonical anchors.
- Preserve style, line thickness, colour, text, lock/visibility, extend-left/right and tool-specific properties.
- Support existing create, select, drag, edit, delete and undo/redo behaviour. Keyboard Delete/Backspace should delete only the selected drawing and must not delete when focus is inside an input/text editor; ask for confirmation only for destructive bulk-delete if such an action exists.
- Changing timeframe must not duplicate drawings, change their IDs, alter saved anchor coordinates, reset the active tool unexpectedly, or trigger autosave loops.
- Handle rapid timeframe changes and async history loads without briefly rendering drawings against the wrong symbol/time scale. Cancel/ignore stale render jobs; load the correct instrument's drawings before presenting the chart as ready.
- If the current library cannot support absolute-time projection robustly, stop and report the specific limitation and proposed minimal architecture change rather than implementing a fragile bar-index workaround.

### Drawing acceptance tests
- Draw a trendline, horizontal line, rectangle, parallel channel, Fibonacci tool and text/pattern annotation (all tool types supported by the current app) on 1m, 5m, 15m and 1D charts.
- Switch repeatedly through 1m, 3m, 5m, 15m, 1h, 1D and 1W. Assert every drawing keeps the same ID and exact saved anchor timestamps/prices, and is rendered at the same data-coordinate location.
- Pan/zoom, resize the chart, change visible history depth, close/reopen the panel, navigate to/from Terminal, reload the page and return to the same symbol. Assert no drift, loss, duplication or wrong-symbol leakage.
- Change to another instrument and back. The first instrument's drawings must not appear on the other symbol; returning restores them.
- Edit/move/delete a drawing on one timeframe and verify the change appears on all other timeframes after save. Test undo/redo, keyboard deletion, autosave races, failed saves, and rapid timeframe switching.
- Add a test that verifies saved anchor data is unchanged before and after switching intervals. A screenshot-only visual check is not sufficient.

## 16.8 Acceptance screenshots and checks

Add screenshots/tests for:
1. Compact market cards with no excessive blank space and correctly aligned breadth.
2. Compact horizontal Top Movers plus Your stocks starting immediately below it.
3. Nifty Sectoral Indices Heatmap at default 1D during live-market state where testable, plus latest-session state outside market hours.
4. Every supported timeframe populated from verified index history, with honest states for genuinely missing data.
5. Dense table showing multiple single-line stock rows at a glance, without sparklines or invested/position amount.
6. Confirmation that the “My Stocks by Sector” section is gone and the official Nifty Sectoral Indices Heatmap remains.
7. Chart panel in its wide default state with correctly placed timeframe controls.
8. Chart in fullscreen and restored to panel mode.
9. Open in Terminal navigation for the selected symbol.
10. Drawings preserved at identical timestamp/price anchors across all tested timeframes, plus persistence after close/reopen/reload.
11. Narrow viewport/mobile chart layout.

Do not claim live-session behaviour was verified unless it was tested against a real current-session feed or a faithful test fixture. Report any data-provider limitations honestly.
