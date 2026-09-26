# KOSH — MASTER IMPLEMENTATION PROMPT
## Next Upgrade Pass: Chart Engine + Adjusted Charts + Market Overview + Screener Data + UX/Performance

You are working on the latest Kosh repository.

IMPORTANT:
This is an implementation task, not a greenfield redesign.

You MUST inspect the repository first, understand the current architecture, reuse existing abstractions where sound, and then implement the requirements below. Do not blindly rewrite working systems.

The goal is to make Kosh feel like a polished, professional investment terminal with TradingView-familiar chart interactions while preserving Kosh's own product identity.

---

# PHASE 0 — INSPECT FIRST

Before changing code:

1. Inspect the complete repository structure.
2. Identify the current implementations for:
   - stock chart
   - Terminal chart
   - chart viewport / pan / zoom
   - crosshair
   - fullscreen
   - chart toolbar
   - chart height
   - drawings
   - benchmark picker
   - USD conversion
   - Market Overview
   - Holdings section
   - Watchlist section
   - Terminal watchlist
   - Screener
   - fundamentals pipeline
   - deep company-data loading
   - NSE/BSE security master
   - Nifty benchmark data
   - Zustand/local persistence
   - auth/cloud portfolio storage
3. Search for all existing implementations before creating new ones.
4. Reuse shared components/utilities wherever possible.
5. Do not create duplicate chart logic for Stock Page and Terminal.
6. Do not create duplicate benchmark-adjustment logic for Stock Page and Terminal.
7. Do not remove existing working functionality merely to simplify implementation.

Create an internal implementation checklist mapping every requirement in this prompt to the exact file/component/function that will implement it.

DO NOT start coding until this inspection is complete.

---

# PRODUCT PRINCIPLES

Kosh should follow familiar TradingView-style interaction conventions because users already understand them.

Borrow:
- interaction semantics
- chart navigation behavior
- familiar control placement
- familiar terminology where appropriate

Do NOT copy proprietary TradingView assets, code, branding, or exact visual identity.

Kosh should remain visually distinct:
- restrained
- professional
- information-dense without clutter
- dark/light theme support
- subtle borders
- subtle chart grid
- blue accent
- green/red reserved primarily for market direction
- no excessive cards
- no decorative noise

Never fabricate financial data.

Missing data must remain:
- unavailable
- unknown
- needs verification

Never turn missing data into a zero or guessed value.

---

# PRIORITY ORDER

P0:
1. Correct fullscreen
2. True benchmark-adjusted chart
3. Adjusted chart UI
4. Fix Screener ROCE/OPM
5. Fix incorrect OPM calculation
6. Make deep financial data actually feed Screener
7. Market Overview Holdings sorting
8. Market Overview Watchlist sorting
9. Chart navigation/zoom/crosshair robustness
10. Nifty benchmark snapshot

P1:
11. NSE+BSE canonical security master
12. Chart performance / 60fps interaction
13. Chart UI polish
14. Data-load coverage feedback
15. Privacy/security polish

P2:
16. Minor cleanup, responsive polish, tests, documentation

---

# 1. TRUE BENCHMARK-ADJUSTED CHARTS

THIS REQUIREMENT IS CRITICAL.

The existing "vs Nifty" / indexed comparison behavior is NOT what is wanted.

Do NOT implement this as:

Stock = 100
Nifty = 100

with two separate lines.

That is only a comparison chart.

## Required behavior

When the user chooses:

Adjusted → Benchmark → Nifty 50

the stock itself must be transformed into a benchmark-relative OHLC series.

For every matched candle:

relativeOpen  = stockOpen / benchmarkOpen
relativeHigh  = stockHigh / benchmarkHigh
relativeLow   = stockLow / benchmarkLow
relativeClose = stockClose / benchmarkClose

Then rebase the relative series to 100 at the beginning of the selected visible/history range.

Conceptually:

Stock:
100 → 105 → 110

Benchmark:
100 → 103 → 108

Adjusted:
100
105 / 103 * 100
110 / 108 * 100

The chart must display normal candlesticks whose OHLC values are benchmark-adjusted.

The user should therefore see:

- relative candlesticks
- relative price axis
- movement representing stock performance after removing benchmark movement

NOT two independent indexed lines.

## Important

The benchmark bars must be time-aligned with the stock bars.

Handle:
- different trading sessions
- missing benchmark candles
- weekends/holidays
- intraday alignment
- daily alignment

Do not silently use an unrelated candle.

For unmatched bars:
- use the closest valid aligned benchmark bar only if the methodology is defensible
- otherwise mark unavailable rather than fabricating

Document the alignment method in code.

---

# 2. ADJUSTED CHART UI

Do not use separate top-level buttons named:

- vs Nifty
- USD

Instead create one clear control:

Adjusted ▾

Options:

Price
Benchmark-adjusted
USD-adjusted

When Benchmark-adjusted is selected:

Benchmark: [ Nifty 50 ▾ ]

The benchmark selector must use the existing benchmark/index picker infrastructure where possible.

Possible benchmarks can include, where data exists:
- Nifty 50
- Sensex
- Nifty Bank
- Nifty IT
- Nifty Pharma
- Nifty Auto
- Nifty FMCG
- Nifty Energy
- Nifty Metal
- Nifty Realty
- Nifty 500
- other supported indices

Do not show a benchmark that has no reliable underlying data.

When USD-adjusted is selected:
- use historical USD/INR for historical candles where available
- use current FX for live/current conversion where appropriate
- explicitly label any fallback methodology

The same adjustment engine MUST be used in:
- Stock page chart
- Terminal chart

Persist the selected adjustment mode and benchmark per chart/list where appropriate.

---

# 3. USD-ADJUSTED CHART

For historical data:

USD-adjusted price = INR price / corresponding historical USDINR rate

Do not divide the entire historical series by today's USDINR unless there is no alternative.

Apply the conversion consistently to OHLC:

USD Open
USD High
USD Low
USD Close

where historical FX data is available.

Do not mix historical and current FX silently.

For live/current charts, use the appropriate current FX rate and clearly indicate the methodology if needed.

---

# 4. FULLSCREEN — FIX PROPERLY

The current fullscreen implementation is broken.

Do NOT combine:
- requestFullscreen()
- setFs()
- portal relocation

in a way that moves/removes the exact element after requesting fullscreen.

Implement a robust fullscreen utility/state model shared by:
- Stock page chart
- Terminal chart

Required behavior:

1. Click Fullscreen.
2. The actual chart container enters browser fullscreen where supported.
3. Chart resizes to the real fullscreen viewport.
4. Esc exits fullscreen.
5. Browser fullscreen exit updates React/Kosh state.
6. No duplicate chart DOM.
7. No disappearing chart.
8. No broken overlay state.
9. If browser Fullscreen API is unavailable/rejected, provide a CSS fallback.
10. Fullscreen must preserve:
   - drawings
   - indicators
   - crosshair
   - chart controls
   - adjusted mode
   - benchmark selection
   - timeframe
11. Terminal fullscreen should not break the rest of the Terminal after exiting.

Use fullscreenchange as the source of truth for actual browser fullscreen state.

---

# 5. CHART NAVIGATION — TRADINGVIEW-LIKE BEHAVIOR

The chart must behave like a mature charting terminal, not simply change the number of visible bars.

## Zoom

Mouse-wheel zoom should be anchored around the actual cursor position.

If the cursor is over candle 70% across the visible chart:
- zoom in
- the candle under the cursor should remain approximately at that same screen location

Do NOT zoom by merely changing visible bar count and resetting the viewport from one side.

## Zoom out

When zooming out:
- expand the visible range around the cursor
- preserve both left and right context where possible

If the user is anchored at the latest/current candle:
- zooming out should reveal progressively more historical candles to the left

If the user is in historical data:
- zoom around their actual focus point

## Pan

Dragging the chart should move historical/current data smoothly.

Do not cause the user to lose track of the prior position.

## Controls

Provide:
- Zoom in
- Zoom out
- Reset View
- Go to Latest
- chart height controls
- fullscreen

Where practical:
- Shift + wheel = horizontal navigation
- familiar keyboard navigation
- mouse drag = horizontal pan

Do not break drawing interactions.

---

# 6. RESET VIEW

Reset View must restore the chart VIEW, not wipe the user's chart configuration.

It should:
- restore default visible range
- restore default bar spacing
- return latest/current bar to the right edge
- autoscale Y axis
- preserve:
  - timeframe
  - indicators
  - drawings
  - benchmark/adjusted mode
  - selected benchmark
  - chart style
  - log/linear preference

Do not reset the entire chart settings object.

---

# 7. GO TO LATEST

Add a clear TradingView-like bottom navigation button.

When user has scrolled into historical data:
- show a "Go to latest" / latest-bar control
- clicking it returns the latest available bar to the right edge

If already at latest:
- button may be disabled/subtle

This must work in:
- Stock chart
- Terminal chart

---

# 8. BOTTOM CHART NAVIGATION BAR

Add a compact bottom control area in the same visual language as the chart.

Include, where space permits:
- zoom out
- zoom in
- Go to latest
- Reset View
- optional date navigation if already supported

Keep it subtle.

Do not clutter the chart.

The bottom time axis must remain visually clear.

---

# 9. CHART HEIGHT

Restore chart height controls.

Requirements:
- default desktop chart should be materially taller than the old 420px feel
- target default around 560–600px where layout permits
- user can increase/decrease chart height
- preserve the user's selected height
- sensible minimum and maximum
- Terminal charts must have sensible minimum height

Do not have conflicting CSS height values fighting React/JS height state.

There must be one clear source of truth.

---

# 10. CROSSHAIR / HOVER PERFORMANCE

Crosshair should feel smooth at approximately 60fps+.

Do NOT trigger expensive React re-renders on every pointer movement.

Prefer:
pointer event
→ mutable ref/state
→ requestAnimationFrame
→ direct SVG/DOM transform/update

The crosshair should include:
- vertical line
- horizontal line
- right-side price label
- bottom date label
- hovered candle OHLC information

The hovered values must correspond to the actual hovered candle.

Do not show latest OHLC while hovering historical candles.

The date and price should be substantially more visible than in the current implementation.

---

# 11. CHART GRID

Horizontal and vertical gridlines must be extremely subtle.

The grid should be:
- visible enough to orient the eye
- not mistaken for support/resistance
- substantially lighter than chart borders
- closer to TradingView's restrained appearance

Do not remove the grid completely.

Avoid heavy horizontal stripes.

---

# 12. MARKET OVERVIEW — HOLDINGS TABLE SORTING

The embedded Holdings section on Market Overview should NOT redirect to a separate Holdings page.

It should remain directly on Market Overview.

Existing portfolio selector:

All
Portfolio A
Portfolio B
...

must remain.

Holdings should aggregate correctly when All is selected.

## Add sorting

The Holdings table must support sorting on:

- Name
- Last
- Chg
- Chg %
- Value
- Weight

Use the same familiar sorting semantics as the Terminal:
- click header → ascending
- click again → descending
- clear/third state if the existing global table convention supports it

Show a clear sort indicator.

The header must align exactly with the row columns.

Persist the selected Holdings table sort state for the user.

Example:

Market Overview Holdings:
sort = Weight descending

When user returns to Market Overview:
- restore Weight descending

Do not use a temporary component-local state only.

---

# 13. MARKET OVERVIEW — WATCHLIST SORTING

IMPORTANT: apply the SAME sorting behavior to the embedded Watchlist section.

The user explicitly wants the Watchlist section to behave consistently with Holdings.

The embedded Watchlist should support sorting on:
- Name
- Last
- Chg
- Chg %

Use the same:
- click-to-sort
- direction indicator
- persistent sort state
- aligned header
- missing-value behavior

Persist the Watchlist sort independently.

For example:

Market Overview Holdings:
Weight descending

Market Overview Watch:
Chg % descending

These must not overwrite each other.

Use a stable persistence key/state structure.

If the user changes the selected watchlist:
- each watchlist may have its own sorting state
- if no state exists, use a sensible default

Do NOT add filtering unless an existing requirement already supports it.

This requirement is sorting only.

---

# 14. TERMINAL WATCHLIST

Keep the existing drag-and-drop ordering.

At the rightmost side of every row:
- ONLY show × remove

Remove:
- up arrow
- down arrow
- any old reorder buttons

Drag handle is enough for ordering.

Header and rows must share the exact same grid definition.

Suggested structure:

handle | NAME | LAST | CHG | CHG % | remove

Do not let headers drift relative to rows.

---

# 15. TERMINAL SORTING PERSISTENCE

The Terminal already has persistent sorting.

Preserve/fix it.

Sort state must persist by watchlist/list.

Example:

Main:
Chg % descending

Long-term:
Last ascending

When Terminal is reopened:
- restore each list's previous sort state

Do not reset to default every mount.

---

# 16. RESPONSIVE WATCHLIST ROW

Narrow:

NAME                         LAST
ABS CHG                      CHG %

Wide:

NAME             LAST        CHG        CHG %

Use the same underlying data model.

Avoid:
Company       Last
              +12.3 · +1.2%

where both changes are squeezed into one lower-right element.

---

# 17. SCREENER — ROCE / OPM URGENT FIX

This is a data correctness issue, not just a UI issue.

ROCE and OPM are normal fundamental metrics and must be available in the Screener wherever reliable source data exists.

The current architecture has deeper financial data that can contain these metrics, but the Screener does not consistently consume it.

Fix the underlying data pipeline.

The target Screener fields include:
- P/E
- P/B
- EPS
- ROE
- ROCE
- OPM
- D/E
- Market Cap
- Dividend Yield
- Sales growth
- Profit growth
- Sales CAGR
- Profit CAGR
- Promoter holding
- FII
- DII

Do not solve this by hardcoding values.

---

# 18. OPM — CRITICAL DATA CORRECTNESS

DO NOT calculate Operating Profit Margin using PBT / Sales.

PBT is NOT operating profit.

The current implementation has a path that can derive OPM from profit-before-tax.

That must be removed/fixed.

OPM hierarchy:

1. Explicit company-reported operating margin, if reliable.
2. Operating profit / revenue where operating profit is explicitly available.
3. Equivalent unambiguous operating-profit line from filings.
4. Otherwise unavailable.

If unavailable:
- show unavailable
- do not substitute PBT
- do not guess
- do not use a proxy silently

Because OPM is used in screening thresholds, an incorrect OPM can produce incorrect screen results.

---

# 19. ROCE

Use:

1. reliable reported ROCE if available
2. reliable derived ROCE if methodology is defensible
3. otherwise unavailable

The data layer should internally know whether a metric is:
- reported
- derived
- unavailable

Do not silently treat an arbitrary formula as company-reported ROCE.

---

# 20. MAKE DEEP COMPANY DATA ACTUALLY FEED SCREENER

"Load data" should remain the user-facing wording.

Do NOT rename it.

But make it useful.

Current deep enrichment fetches additional:
- filings
- XBRL
- financial history
- shareholding
- other supported metrics

The resulting data must be stored/available through the same normalized fundamentals layer consumed by:
- Company page
- Screener
- AI skills
- relevant portfolio analysis

Do not have:

Company page = deep data
Screener = shallow data

for the same company.

Use a shared cached fundamental record.

Avoid making every Screener request perform a full deep crawl.

Prefer:
- normal cached fundamentals
- background/deep enrichment
- TTLs
- explicit refresh

---

# 21. "LOAD DATA" USER EXPERIENCE

Keep the button named:

**Load data**

After execution, show what happened.

Example:

Load data
↓
Loading additional company data...
↓
Completed

Then display coverage:

Added:
✓ Revenue history
✓ Profit history
✓ CFO
✓ Shareholding
✓ ROCE

Still unavailable:
— Operating profit
— Quarterly CFO

This makes the action understandable.

Do not imply that every company metric will necessarily exist.

---

# 22. NIFTY 50 SNAPSHOT

Do not make "Companies vs Nifty 50" depend on whether individual Nifty constituents happen to be hydrated in the current Screener request.

Create a dedicated cached Nifty 50 benchmark/fundamental snapshot.

Where reliable data exists, maintain:
- constituents
- weights if available
- P/E
- P/B
- ROE
- ROCE
- OPM
- D/E
- dividend yield

with:
- timestamp
- data period

The comparison section should consistently show Nifty benchmark numbers when data exists.

Never show a fabricated aggregate.

---

# 23. NSE + BSE SECURITY MASTER

Continue toward a canonical security master:

ISIN
Company name
NSE symbol
BSE code
Exchange/listing
Series
Board
Security status
Listing date
Old symbols where available

Canonical identity should be company/security based, not simply an NSE symbol.

Example:

ISIN
→ company/security
→ NSE listing
→ BSE listing

Use this identity throughout:
- search
- portfolio
- charts
- fundamentals
- screener
- benchmarks

Do not duplicate the same company because NSE/BSE identifiers differ.

---

# 24. SECTOR CLICK → SECTOR INDEX

Market Overview sector cards/headlines must be clickable.

Clicking a sector should open the corresponding sector index chart.

Examples:
- IT → Nifty IT
- Pharma → Nifty Pharma
- Auto → Nifty Auto
- FMCG → Nifty FMCG
- Energy → Nifty Energy
- Metal → Nifty Metal
- Realty → Nifty Realty
- Infra → Nifty Infrastructure where reliable data exists

Do NOT silently map unsupported sectors to Nifty 500 and call it a sector benchmark.

If no reliable sector index exists:
- say unavailable
- or use the existing clearly labeled fallback only if the product explicitly defines it as a broad benchmark

---

# 25. MARKET OVERVIEW — EMBEDDED HOLDINGS AND WATCH

Do not redirect users to separate Holdings/Watch pages merely to see the data.

Market Overview should function as a useful command center.

Holdings:
- All / individual portfolio selector
- aggregated holdings
- sorting
- value
- weight
- price/change

Watch:
- watchlist selector
- sorting
- price/change
- percentage change

Clicking a stock may open that stock's detail page.

---

# 26. PRIVACY / BROKER FILE SECURITY

Preserve the current good behavior:

The original broker XLSX/CSV should be parsed locally in the browser.

Do not upload the raw broker file to the Kosh server.

For guest users:
- keep portfolio data local where possible.

For signed-in users:
- clearly distinguish local-only vs cloud sync.

Do not send unnecessary:
- quantities
- cost basis
- broker identifiers
- raw files

to AI providers.

Only send the minimum portfolio information required for an AI task.

If cloud sync is used, store only normalized portfolio data needed for the feature, not the original broker document.

Add/retain clear UX messaging:

"Your broker file is processed locally in your browser. The original file is not uploaded to Kosh."

For cloud sync:
"Portfolio sync stores normalized holdings so they can be used across devices."

Do not claim end-to-end encryption unless it is actually implemented.

---

# 27. CHART TOOLBAR INFORMATION ARCHITECTURE

Avoid a crowded toolbar like:

Price | vs Nifty | USD | ...

Use:

Price
Adjusted ▾

Adjusted menu:
- Benchmark-adjusted
  - Benchmark [Nifty 50 ▾]
- USD-adjusted

Keep:
- Indicators
- Log/Linear
- Draw
- Measure
- Reset View
- Fullscreen
- Height controls

Use compact familiar icons where appropriate.

---

# 28. PERFORMANCE

Optimize for smooth chart interaction.

Avoid:
- React state updates on every pointer pixel
- unnecessary chart recomputation
- repeated benchmark fetches
- repeated USDINR fetches
- repeated deep company-data fetches
- rebuilding all Terminal charts when one chart changes

Use:
- requestAnimationFrame
- memoization
- stable callbacks
- cached data
- shared benchmark data
- lazy loading
- ResizeObserver
- efficient SVG/canvas updates as appropriate

Test Terminal with 4 charts open.

Crosshair movement must remain smooth.

---

# 29. ERROR HANDLING

Never silently fail.

For:
- benchmark data unavailable
- USDINR unavailable
- company data unavailable
- deep enrichment timeout
- invalid financial data
- fullscreen failure

show an appropriate user-facing state.

Do not fabricate a fallback number.

---

# 30. TESTING REQUIREMENTS

Add/maintain tests for:

### Adjusted chart
- benchmark-adjusted OHLC
- rebase to 100
- correct candle-by-candle adjustment
- benchmark alignment
- missing benchmark bars
- no division by zero
- USD historical conversion
- benchmark selection

### Viewport
- cursor-anchored zoom
- zoom out both sides
- latest-edge behavior
- pan
- reset
- go-to-latest

### Fullscreen
- enter
- exit
- fullscreenchange
- fallback

### Screener
- ROCE available
- OPM available
- OPM never derived from PBT
- missing OPM remains unavailable
- deep data reaches Screener

### Sorting
- Holdings sorting
- Watch sorting
- Terminal sorting
- persistence
- independent state per list/table

### Market Overview
- All portfolios aggregation
- individual portfolio
- sector click
- benchmark chart

### Privacy
- raw broker file not sent to backend
- normalized cloud sync behavior
- AI payload excludes unnecessary sensitive portfolio fields

Run:
- targeted tests
- full tests
- typecheck
- build

Do not report success if any of these fail.

If the environment prevents a command, explicitly report it as blocked rather than claiming it passed.

---

# 31. VISUAL QA

After implementation, inspect the actual rendered UI.

Check:
- dark theme
- light theme
- desktop
- tablet
- mobile
- 1-chart Terminal
- 2-chart Terminal
- 4-chart Terminal
- fullscreen
- Market Overview
- Screener
- stock page

Specifically inspect:
- chart height
- grid subtlety
- price-axis alignment
- time-axis alignment
- crosshair
- date/price labels
- toolbar spacing
- bottom controls
- watchlist header alignment
- Holdings header alignment
- Watch header alignment
- sorting indicators
- responsive rows
- no horizontal overflow
- no nested unnecessary scrolling
- no clipped chart
- no clipped fullscreen
- no broken light-mode contrast

---

# 32. DO NOT ADD THESE

Do not add:
- portfolio allocation simulator
- unnecessary provenance UI
- fake confidence percentages
- target prices without defensible methodology
- probability forecasts
- "AI predicts"
- fabricated growth rates
- PBT-as-OPM
- unsupported sector benchmarks
- generic feature bloat
- separate pages where the user explicitly wants embedded Market Overview sections

---

# 33. IMPLEMENTATION DISCIPLINE

Work in this order:

1. Inspect.
2. Build/repair shared chart engine.
3. Implement benchmark-adjusted OHLC.
4. Implement Adjusted UI.
5. Fix fullscreen.
6. Fix Screener fundamental data.
7. Fix OPM correctness.
8. Connect deep data to shared fundamentals.
9. Add Holdings sorting.
10. Add Watch sorting.
11. Fix Nifty snapshot.
12. Finish sector navigation.
13. Security/privacy checks.
14. Performance optimization.
15. Tests.
16. Visual QA.
17. Final audit against every requirement.

Do not stop after making the UI look correct.

Verify that the underlying calculations/data are correct.

---

# 34. FINAL SELF-AUDIT

Before declaring completion, produce a table:

| Requirement | Status | Files changed | Test/verification |
|---|---|---|---|
| Fullscreen | PASS/PARTIAL/FAIL | ... | ... |
| Benchmark-adjusted OHLC | ... | ... | ... |
| USD-adjusted | ... | ... | ... |
| Adjusted UI | ... | ... | ... |
| Chart zoom/pan | ... | ... | ... |
| Crosshair | ... | ... | ... |
| Reset/latest | ... | ... | ... |
| Chart height | ... | ... | ... |
| Holdings sorting | ... | ... | ... |
| Watch sorting | ... | ... | ... |
| Terminal sorting | ... | ... | ... |
| ROCE | ... | ... | ... |
| OPM | ... | ... | ... |
| Deep data → Screener | ... | ... | ... |
| Nifty snapshot | ... | ... | ... |
| Sector navigation | ... | ... | ... |
| NSE+BSE master | ... | ... | ... |
| Privacy | ... | ... | ... |
| Performance | ... | ... | ... |
| Tests/build | ... | ... | ... |

A requirement is not PASS merely because the UI exists.

It is PASS only when:
- UI exists,
- underlying logic works,
- data is correct,
- persistence works where required,
- responsive behavior works,
- tests/verification support it.

If something cannot be completed because of an external dependency, state exactly what is blocked and why.

Do not silently omit requirements.

# END
