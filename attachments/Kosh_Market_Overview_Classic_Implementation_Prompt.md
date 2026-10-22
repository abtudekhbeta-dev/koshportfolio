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
- Compact sparkline charts within rows.
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
12. Do not remove current Market Overview features (indices, breadth, winners/losers, sectors/heatmap, macro, event calendar, Pulse, market headlines, MixNudge or other current sections). Reorder or compact them thoughtfully; retain their functionality.
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
- On desktop, Top Movers may sit to the right of the market summary or directly above the tracker depending on available width. It must remain compact.
- On narrower widths, place it in a compact row/section above the tracker or behind a collapsible disclosure. Never squeeze the table to unusable width.

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
6. Optional market value/position value if existing quote + holding data can support it correctly; this is position value only when quantity is known. Do not show portfolio market value for watchlist-only symbols.
7. Portfolio membership: compact portfolio chips/count; show `Owned` and/or `Watchlist` tags as appropriate. Multiple portfolio names must be discoverable through a tooltip/popover/expand affordance, not crammed into an unreadable row.
8. Sparkline: compact line for a consistent period, using existing historical-price source only if available. If no reliable history is available, show a neutral placeholder/dash, not invented movement.
9. Actions: `View Chart` plus an overflow menu only if current app patterns support it.

If the viewport is too narrow, hide optional columns before sacrificing ticker/name, price, change, status and View Chart. Keep precise values in aligned tabular numerals. Right-align numeric values.

### Sparklines
- They are intentionally small context, not a full chart.
- Use the same defined lookback and sampling method for all stocks in the current view.
- Use the existing price history/API/cache if possible.
- Do not fetch a separate long history for every visible row simply to decorate the table.
- Lazy-load sparklines for visible rows, batch where supported, cache results, and handle missing history gracefully.
- Green/red may encode direction, but also expose a neutral accessible tooltip/title and do not rely on colour alone.
- No axes or labels in the tiny sparkline; exact chart values live in the full chart panel.

### Sorting
- Preserve existing sort cycling if already used.
- Support name, last price, absolute change and percent change at minimum.
- If position value/market value exists, support it only where semantically correct.
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
- The panel should initially be around 36–42% of available content width, with a sensible min/max width; use a resizable split panel if compatible with the project. Preserve enough width for essential table columns.
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
- Existing timeframe buttons in a compact row (use the actual supported intervals from the existing chart component).
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
- Do not confuse aggregate quantity with portfolio market value. For position value, use quantity × valid current price, with correct currency/format. Do not show this field for a watchlist-only row.
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
- Sparkline history is missing.
- Chart history is loading.
- Chart history unavailable/error.
- Market summary data stale/unavailable.
- Quote endpoint/rate limit failure.

Keep the rest of the screen usable if one module fails. A chart failure must not break the stock tracker. A market breadth/news failure must not hide holdings/watchlists.

# 13. Performance requirements

- Keep the closed chart panel unmounted or otherwise prevent expensive chart rendering/history fetch while closed.
- Lazy-load chart module if appropriate for the current build.
- Avoid fetching full history for every row.
- Batch/cache sparklines if history is already supported.
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
- Portfolio selector correctly changes ownership membership/position value.
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

The task is complete only when Market Overview is a cleaner, more useful stock-monitoring workspace; every portfolio holding and applicable watchlist symbol remains accessible; the chart is hidden until the user clicks View Chart; the chart opens smoothly on the right without a full-page navigation; stock selection updates the same panel; closing it restores the original list state; existing market modules and the top navigation remain intact; and responsive, functional and regression checks have been run and reported.
