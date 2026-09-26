# KOSH — MASTER IMPLEMENTATION PROMPT V4 (FINAL AFTER LATEST REPOSITORY AUDIT)
## Inspect First → Fix Root Causes → Implement → Test → Visual QA → Requirement Audit

You are working on the latest Kosh repository supplied with this prompt.

IMPORTANT:
This repository has already gone through multiple implementation rounds. Do NOT assume that a feature is complete merely because related code exists.

I have audited the current repository and found that several previously requested items are STILL only partially implemented or not implemented correctly.

Your job is to:
1. inspect the current implementation,
2. identify the root cause,
3. fix the underlying architecture/logic,
4. preserve already-working features,
5. test the actual behavior,
6. perform visual QA,
7. report every requirement as PASS / PARTIAL / FAIL / BLOCKED.

Do not simply add UI that looks correct while the underlying data/state/navigation remains wrong.

---

# AUDIT FINDINGS YOU MUST TREAT AS FACTS

The current repository still has these confirmed problems:

### NOT COMPLETE / INCORRECT

1. Market Overview index cards are still not reliably clickable into the corresponding Terminal index chart.
2. The top moving ticker strip still does not route index items into Terminal.
3. Market Overview Holdings STILL shows Value and Weight even though the requirement was to remove them.
4. Terminal vertical chart height controls are still missing.
5. Icon-only Terminal controls have aria-labels but do NOT consistently show a visible tooltip/name on hover. A proper tooltip system exists in the repository but is not consistently used by these controls.
6. "Load data" is STILL the visible label. It must become "Load more data".
7. "Load more data" is still only a limited deep-enrichment pass, not the robust missing-field/source-recovery workflow requested.
8. Screener still has inadequate coverage of normal fundamental metrics. ROCE/OPM can exist in deeper/company data but are not reliably available throughout the Screener universe.
9. The current Screener "deep" path does NOT actually perform a full deep filing crawl. It relies heavily on the existing deep screen cache plus normal `fetchFundamentals()`. Therefore it cannot be considered comprehensive.
10. Fullscreen code has been improved, but the user still reports that fullscreen does not work. Treat this as an unresolved functional bug and verify it in a real browser interaction, not merely by reading the hook.
11. The new benchmark-adjusted chart calculation exists and is conceptually correct, but it must be verified end-to-end in both Stock page and Terminal and must not regress.
12. Market Overview Watchlist sorting is present and persisted, but it must remain correct and independent from Holdings sorting.
13. Market Overview Holdings sorting exists, but must be updated to the new movement-only columns.
14. The Terminal chart-height state exists in global chart preferences for the stock chart, but Terminal charts do not actually expose vertical height controls.
15. The repository has a reusable Radix tooltip component, but icon-only Terminal controls currently rely mainly on aria-label and do not consistently expose visible hover names.

Everything else from previous rounds must also be audited rather than assumed.

---

# NON-NEGOTIABLE PRODUCT PRINCIPLE

Kosh is a serious investment-intelligence application.

Correctness > feature count.

Never:
- fabricate financial values,
- silently substitute bad metrics,
- use PBT as operating profit,
- turn unavailable into zero,
- silently mix periods,
- silently mix consolidated and standalone financials,
- silently use today's FX rate for old USD candles,
- claim a source was checked when it was not,
- claim a feature works without testing it.

Missing data must remain:
`Unavailable`

unless it can be reliably sourced or defensibly derived.

---

# PHASE 0 — INSPECT FIRST

Before coding:

1. Inspect repository structure.
2. Inspect:
   - Market Overview
   - Markets route
   - MarketsDesk
   - market ticker/tape
   - index cards
   - sector cards
   - chart engine
   - Terminal chart
   - Stock chart
   - fullscreen
   - chart viewport
   - chart height
   - chart toolbar
   - tooltips
   - Screener
   - fundamentals
   - deep fundamentals
   - company cache
   - Load data/enrichment
   - benchmark system
   - USD conversion
   - NSE/BSE master
   - Zustand persistence
3. Search for existing helpers before creating anything.
4. Reuse existing components/utilities where correct.
5. Do not create duplicate navigation logic.
6. Do not create duplicate chart adjustment logic.
7. Do not create duplicate fundamentals models.
8. Build an internal requirement-to-code checklist before implementation.

---

# 1. MARKET OVERVIEW INDEX CARDS → TERMINAL

This is currently broken.

The current index-card logic uses stock-page navigation logic and treats many indices as non-openable.

Fix this properly.

## Required behavior

Click:

Nifty 50
→ Markets Terminal
→ active chart = Nifty 50

Nifty Bank
→ Terminal
→ active chart = Nifty Bank

Nifty IT
→ Terminal
→ active chart = Nifty IT

etc.

Do NOT route an index through `/s/$symbol`.

---

# 2. CENTRALIZED MARKET-INSTRUMENT NAVIGATION

Create/reuse ONE navigation helper.

Example conceptual API:

`openMarketInstrument({ symbol, name, type })`

Types:
- stock
- index
- sector-index

For index/sector-index:
- update requested Terminal instrument
- navigate to `/markets?view=terminal`
- Terminal must consume the requested symbol reliably

Preferred robust approach:

Use URL state:

`/markets?view=terminal&symbol=NIFTY50`

or the repository's canonical equivalent.

The important requirement is that navigation cannot race with Zustand initialization.

Terminal startup must:
1. read requested symbol,
2. set active pane,
3. display requested symbol,
4. not overwrite it with stale default state.

If the existing desk state is retained, URL state must still win for an explicit navigation request.

---

# 3. SECTOR CARDS → CORRECT SECTOR INDEX

Clicking:
- IT
- Pharma
- Auto
- FMCG
- Energy
- Metal
- Realty
- Financials
- Infrastructure
etc.

must open the actual mapped sector index in Terminal.

Examples:
IT → Nifty IT
Pharma → Nifty Pharma
Auto → Nifty Auto
FMCG → Nifty FMCG
Energy → Nifty Energy
Metal → Nifty Metal
Realty → Nifty Realty

Do not substitute Nifty 500.

If there is no reliable mapped index:
- do not pretend it is supported,
- show No index / unavailable,
- make it non-clickable.

---

# 4. TOP MOVING TICKER STRIP MUST BE CLICKABLE

Every supported instrument in the moving strip must be clickable.

For indices:
→ Terminal

For stocks:
→ established stock destination, preferably stock page unless product conventions specify Terminal.

The ticker must:
- remain smoothly animated,
- retain marquee behavior,
- expose pointer cursor,
- have hover/focus state,
- have keyboard accessibility,
- have aria-label,
- use the same centralized navigation helper.

Do NOT rely on `canOpenStock()` for index navigation.

The visible ticker item itself must be the click target.

---

# 5. MARKET OVERVIEW HOLDINGS — MOVEMENT TRACKER ONLY

The section is:

**Your holdings today**

It should primarily answer:
"How are my holdings moving today?"

REMOVE:
- Value
- Weight

Keep ONLY:

| Name | Last | Chg | Chg % |

Do not calculate portfolio weight just to display it here.

Portfolio allocation remains elsewhere.

---

# 6. MARKET OVERVIEW HOLDINGS SORTING

Sorting must remain after removing Value/Weight.

Allowed:
- Name
- Last
- Chg
- Chg %

Remove Value/Weight from:
- visible columns
- sort keys for this table
- UI
- dead state where appropriate

Default sort should be movement-oriented, e.g. Chg % or Name, not Value.

Persist the sort state.

---

# 7. MARKET OVERVIEW WATCHLIST SORTING

The embedded Watch section must behave exactly like Holdings.

Allowed:
- Name
- Last
- Chg
- Chg %

Click header:
- ascending
- descending
- existing clear/reset behavior if supported

Show a sort indicator.

Persist independently.

Example:

Holdings:
Chg % descending

Main Watch:
Chg descending

Long-term:
Last ascending

These must not overwrite each other.

If the user changes watchlist, preserve per-watchlist sort state.

Do not add unnecessary filtering.

---

# 8. TERMINAL VERTICAL CHART HEIGHT CONTROL

This requirement is still missing.

Add an obvious vertical chart height control to Terminal.

For example:

[−]  [↕ chart height]  [+]

or compact icon buttons.

Required:
- decrease height
- increase height
- sensible min
- sensible max
- actual rendered chart changes
- persisted preference if appropriate
- works in 1/2/4 chart layouts
- does not break watchlist height or Terminal scrolling

Do not confuse chart width/layout controls with chart height.

The user explicitly wants to vertically make the chart bigger.

The current Stock chart `chartHeight` preference is NOT sufficient if Terminal does not expose/use a corresponding control.

Implement a Terminal-specific or shared chart-height mechanism.

---

# 9. ICON-ONLY CONTROLS MUST SHOW THEIR NAME ON HOVER

The repository already has a Radix Tooltip component.

Use it.

Audit ALL icon-only interactive controls in:
- Terminal
- Stock chart
- drawing toolbar
- chart bottom bar
- layout controls
- fullscreen
- zoom
- reset
- latest
- height
- watchlist
- drawing controls

Each must have:
- visible tooltip on hover
- visible tooltip on keyboard focus
- aria-label
- understandable label

Examples:

+ → Increase chart height
− → Decrease chart height
⤢ → Fullscreen
↺ → Reset view
→| → Go to latest
× → Remove from watchlist
1 chart → One chart
2 charts → Two charts
4 charts → Four charts

Do not rely only on aria-label.

Use one shared tooltip implementation.

---

# 10. FULLSCREEN — VERIFY REAL BROWSER BEHAVIOR

The fullscreen hook has been improved, but the user still reports it does not work.

Treat it as unresolved until verified.

Use the browser Fullscreen API correctly.

Requirements:
- requestFullscreen on the actual chart container
- no portal relocation after requestFullscreen
- fullscreenchange is source of truth
- Esc exits
- browser exit updates state
- fallback CSS mode if API fails
- correct resize after entering fullscreen
- correct resize after exiting
- Stock chart works
- Terminal chart works
- no duplicate DOM
- no disappearing chart
- drawings preserved
- toolbar preserved
- adjusted mode preserved
- timeframe preserved

Test the actual interaction in a browser.

Do not mark PASS based on code inspection.

---

# 11. BENCHMARK-ADJUSTED CHART — DO NOT REGRESS

The current repository now contains `adjustOhlcToBenchmark()` and an Adjust menu.

Verify that this is actually what the user wanted.

It MUST NOT be a two-line indexed comparison.

Required:

For every aligned candle:

relativeOpen = stockOpen / benchmarkOpen
relativeHigh = stockHigh / benchmarkHigh
relativeLow = stockLow / benchmarkLow
relativeClose = stockClose / benchmarkClose

Then rebase the resulting series to 100 using the first relative close in the displayed/history slice according to the existing intended behavior.

The chart must display:
- adjusted candlesticks
- adjusted price scale

NOT:
- stock line + benchmark line
- two indexed series
- percentage gap only

---

# 12. BENCHMARK ALIGNMENT

For daily:
- same IST calendar day

For intraday:
- same timestamp/clock interval according to the documented alignment methodology

Do not borrow unrelated sessions.

If benchmark bar is missing:
- drop that adjusted candle or use only a defensible documented alignment
- never fabricate a benchmark print

Show a clear informational note if bars were dropped.

---

# 13. ADJUSTED UI

Use:

`Adjusted ▾`

Options:
- Price
- Benchmark-adjusted
- USD-adjusted

When Benchmark-adjusted:
`Benchmark: [ Nifty 50 ▾ ]`

The selector should use the existing benchmark registry/picker.

Do not expose:
- `vs Nifty`
- separate cluttered peer buttons

as the primary UI.

The same adjustment engine must work in:
- Stock page
- Terminal

Persist:
- chart mode
- selected benchmark

---

# 14. USD-ADJUSTED CHART

Historical:

USD price = INR price / historical USDINR for corresponding date/bar

Apply to OHLC.

Do not stamp today's USDINR onto historical data.

If historical FX is unavailable:
- clearly indicate unavailable/fallback
- do not silently misrepresent the result

Verify Stock page and Terminal.

---

# 15. CHART NAVIGATION

Preserve and verify:

- cursor-anchored zoom
- zoom out expands context correctly
- pan
- latest
- reset
- bottom controls
- crosshair
- date label
- price label
- OHLC hover
- chart height

Zoom should preserve the candle under the cursor approximately at the same screen location.

If the user is at the right/latest edge:
- zoom out should reveal more bars to the left.

If user is in history:
- zoom around their focus point.

Do not simply modify visible count from one side.

---

# 16. RESET VIEW

Reset View should:
- restore default visible range
- restore sensible bar spacing
- return latest bar to right edge
- autoscale Y
- preserve:
  - timeframe
  - indicators
  - drawings
  - adjustment mode
  - benchmark
  - style
  - log/linear

It resets view, not configuration.

---

# 17. GO TO LATEST

Provide bottom control.

When historical:
- visible and clickable

When already latest:
- disabled/subtle

Works in:
- Stock chart
- Terminal

---

# 18. CROSSHAIR PERFORMANCE

Use requestAnimationFrame/direct DOM/SVG updates where possible.

Avoid React state updates per pointer pixel.

Need:
- vertical line
- horizontal line
- right price label
- bottom date label
- hovered OHLC

Hovered values must correspond to hovered candle.

Optimize for smooth 60fps+ interaction.

---

# 19. TERMINAL GRID / VISUALS

Keep chart grid extremely subtle.

No heavy horizontal stripes.

The grid should not resemble support/resistance.

Maintain:
- professional dark/light themes
- restrained borders
- blue accent
- green/red for market direction
- no unnecessary visual clutter

---

# 20. SCREENER — THIS IS A DATA ARCHITECTURE PROBLEM

The Screener currently still has too many unavailable normal metrics.

Do NOT just change the UI.

Fix the source/data pipeline.

Required normal fields where reliably available:
- P/E
- P/B
- EPS
- ROE
- ROCE
- OPM
- D/E
- Market cap
- Dividend yield
- Sales growth
- Profit growth
- Sales CAGR
- Profit CAGR
- Promoter
- FII
- DII
- CFO
- EBITDA
- Interest coverage
- relevant financial series

---

# 21. CRITICAL: CURRENT "FULL SCREENER" IS NOT ACTUALLY DEEP ENRICHMENT

The current `/api/screener?depth=full` path primarily calls the Screener's normal `fetchFundamentals()` flow across the universe and then patches from cached company funds.

That does NOT mean every company is freshly deep-enriched.

Do not call this comprehensive deep data.

Fix this architecture.

---

# 22. SHARED FUNDAMENTALS LAYER

Company page, Screener, AI and portfolio analysis must consume the same validated normalized fundamentals.

Do not have:
Company page = deep
Screener = shallow

for the same stock.

Create/reuse a shared normalized fundamental record.

Data source order can be:

1. existing validated cache
2. company financial card
3. exchange filings/XBRL
4. BSE filings/XBRL
5. company IR / annual report / quarterly result where a supported adapter can safely parse it
6. other reputable secondary source only when primary source does not expose the metric

Every source must be explicitly known.

Do not scrape random websites.

---

# 23. LOAD MORE DATA — RENAME EVERYWHERE

User-facing text must be:

**Load more data**

Loading:
**Loading more data…**

Do not leave visible "Load data" in:
- button
- tooltip
- company page
- portfolio page
- watchlist
- documentation
- empty state

---

# 24. LOAD MORE DATA — ROBUST MISSING-FIELD ENGINE

This is one of the highest-priority requirements.

It must NOT simply:
"call deep endpoint again."

It must:

### Step A — audit coverage
For each selected company, identify:
- present
- missing
- stale
- invalid

for every supported field.

### Step B — choose source per missing field

Example:

Revenue:
- financial statement
- exchange/XBRL
- annual report

Profit:
- same

Operating profit:
- explicit operating profit
- annual report / filing

ROCE:
- reported ROCE
- defensible EBIT/capital employed derivation

OPM:
- reported OPM
- operating profit / revenue

CFO:
- cash-flow statement
- XBRL

Shareholding:
- exchange shareholding filing

etc.

### Step C — fetch
Use controlled concurrency.

### Step D — validate
Check:
- company identity
- period
- units
- consolidated/standalone
- numeric validity
- plausible ranges

### Step E — merge
Only validated fields.

### Step F — derive
Only when required inputs are reliable and period-consistent.

### Step G — retry/fallback
If a source fails, try the next appropriate source.

### Step H — report
Tell the user:
- what was added
- what was already present
- what remains unavailable
- sources actually checked

---

# 25. LOAD MORE DATA — MULTIPLE STOCKS

Support:
- one stock
- multiple selected stocks
- watchlist
- portfolio

Do not cap the operation so aggressively that many selected names silently never process.

Use:
- batches
- queue
- controlled concurrency
- retries
- per-symbol status
- partial success
- no full-batch failure because one company failed

If an internal API limit exists, transparently process the queue in batches.

---

# 26. LOAD MORE DATA — IDEMPOTENT

If a stock is already complete and fresh:

Do not refetch everything.

Say:
"All supported data is already covered."

If only a few fields are missing:
target those missing fields.

---

# 27. LOAD MORE DATA — COVERAGE RESULT

Example:

Load more data
↓
Completed

Added:
✓ Revenue history
✓ Profit history
✓ CFO
✓ ROCE

Already available:
✓ P/E
✓ ROE

Still unavailable:
— Operating profit
— Quarterly CFO

Sources checked:
- Groww company financials
- NSE filings/XBRL
- BSE filings/XBRL
- company disclosures

Only list sources actually queried.

---

# 28. OPM CORRECTNESS

NEVER:

OPM = PBT / Revenue

PBT is not operating profit.

Hierarchy:
1. reported OPM
2. operating profit / revenue
3. unambiguous operating-profit line
4. unavailable

If unavailable:
`—`

This rule must be enforced in:
- company page
- Screener
- Load more data
- AI inputs
- derived calculations

---

# 29. ROCE CORRECTNESS

Hierarchy:
1. reliable reported ROCE
2. defensible derived ROCE
3. unavailable

If derived:
- EBIT must be valid
- capital employed must be valid
- periods must be consistent

Never fabricate.

---

# 30. NIFTY 50 SNAPSHOT

Maintain a dedicated cached Nifty 50 fundamental snapshot.

Where reliable:
- PE
- PB
- ROE
- ROCE
- OPM
- D/E
- dividend yield
- constituents
- weights if available
- period
- timestamp

"Companies vs Nifty 50" must not depend on a thin temporary Screener response.

---

# 31. NSE + BSE SECURITY MASTER

Continue the canonical identity architecture:

ISIN
→ company/security
→ NSE listing
→ BSE listing

Include:
- NSE symbol
- BSE code
- ISIN
- company name
- exchange
- series
- board
- security status
- listing date
- old symbols if available

Do not duplicate companies.

---

# 32. PRIVACY

Preserve:
- broker file parsed locally
- raw broker file not uploaded
- guest/local storage
- explicit cloud-sync behavior
- AI receives minimum required portfolio data

Do not claim encryption unless implemented.

Add clear UI wording where appropriate.

---

# 33. TERMINAL WATCHLIST

Preserve:
- drag/drop
- persistent sorting
- per-list sorting
- only × at far right
- aligned columns

Do not reintroduce Up/Down buttons.

---

# 34. TABLE SORTING

Use consistent sorting semantics.

Market Overview:
- Holdings
- Watch

Terminal:
- Watchlist

Screener:
- existing sorting

Persist where previously requested.

Do not introduce unnecessary filtering where the requirement is only sorting.

---

# 35. ICON TOOLTIP AUDIT

Search the repository for icon-only buttons.

Every icon-only button must have:
- Tooltip
- aria-label
- keyboard accessibility

Use the existing Tooltip component.

---

# 36. PERFORMANCE

Optimize:
- chart pointer interaction
- benchmark adjustment
- USD adjustment
- Terminal 4-chart mode
- Screener data hydration
- Load more data queue
- duplicate network requests

Use:
- caching
- deduplication
- memoization
- requestAnimationFrame
- controlled concurrency

Do not perform expensive deep enrichment every time Screener renders.

---

# 37. TESTING

Add/maintain tests for:

### Navigation
- index card → Terminal
- sector card → Terminal
- top ticker index → Terminal
- requested symbol survives Terminal initialization

### Holdings
- movement-only columns
- sorting
- persistence

### Watch
- sorting
- persistence
- independent per watchlist

### Tooltip
- icon label
- hover/focus

### Height
- Terminal height changes actual rendered height
- min/max

### Fullscreen
- enter
- exit
- fullscreenchange
- fallback
- actual browser behavior

### Adjusted chart
- benchmark OHLC
- rebase
- alignment
- missing benchmark
- USD OHLC
- historical FX

### Screener
- ROCE
- OPM
- OPM not PBT
- deep/cached data reaches Screener

### Load more data
- one symbol
- multiple symbols
- missing fields
- already-complete
- fallback source
- validation
- partial failure
- retry
- no fabrication

### Nifty
- snapshot
- comparisons

---

# 38. ACTUAL BROWSER VISUAL QA

Do not rely only on unit tests.

Use the actual app/browser.

Test these user journeys:

## Journey A
Market Overview
→ click Nifty 50
→ Terminal
→ Nifty 50 visible

## Journey B
Market Overview
→ click IT
→ Terminal
→ Nifty IT visible

## Journey C
Top ticker
→ click Nifty Bank
→ Terminal
→ Nifty Bank visible

## Journey D
Terminal
→ increase chart height
→ chart visibly becomes taller

## Journey E
Hover fullscreen icon
→ tooltip says Fullscreen

## Journey F
Click fullscreen
→ browser fullscreen
→ Esc
→ returns correctly

## Journey G
Holdings
→ remove Value/Weight
→ sort Chg %
→ leave page
→ return
→ sorting persists

## Journey H
Watch
→ sort Chg
→ change watchlist
→ return to previous watchlist
→ previous sort restored

## Journey I
Stock
→ Adjusted
→ Benchmark-adjusted
→ Nifty 50
→ chart becomes relative OHLC candles

## Journey J
Stock
→ Adjusted
→ USD-adjusted
→ chart uses historical FX

## Journey K
Screener
→ inspect ROCE/OPM
→ verify values are populated where source data exists

## Journey L
Company
→ Load more data
→ observe actual source recovery
→ verify new fields
→ verify Screener can consume them

---

# 39. VISUAL QA

Check:
- dark theme
- light theme
- desktop
- mobile
- 1/2/4 Terminal charts
- Market Overview
- Screener
- Stock page

Look for:
- clipped controls
- misaligned headers
- excessive borders
- heavy grid
- tooltip overlap
- broken responsive layout
- nested scroll problems
- broken fullscreen
- wrong chart height
- toolbar crowding
- inaccessible icons
- inconsistent colors
- inconsistent typography

---

# 40. FINAL AUDIT TABLE

Before declaring completion, produce:

| Requirement | PASS / PARTIAL / FAIL / BLOCKED | Evidence |
|---|---|---|
| Index card → Terminal | | |
| Sector card → Terminal | | |
| Top ticker → correct destination | | |
| Centralized navigation | | |
| Holdings movement-only | | |
| Holdings sorting | | |
| Watch sorting | | |
| Sorting persistence | | |
| Terminal chart height | | |
| Icon tooltips | | |
| Fullscreen | | |
| Benchmark-adjusted OHLC | | |
| USD-adjusted OHLC | | |
| Chart navigation | | |
| Crosshair | | |
| Screener ROCE | | |
| Screener OPM | | |
| OPM correctness | | |
| Shared fundamentals | | |
| Load more data naming | | |
| Load more data source cascade | | |
| Load more data validation | | |
| Load more data multi-stock | | |
| Load more data persistence/cache | | |
| Nifty snapshot | | |
| Sector benchmark | | |
| NSE+BSE identity | | |
| Privacy | | |
| Performance | | |
| Unit tests | | |
| Typecheck | | |
| Build | | |
| Browser QA | | |

A requirement is PASS only if:
- implementation exists,
- underlying logic is correct,
- actual behavior was verified,
- persistence works where required,
- responsive behavior works,
- tests support it.

If something cannot be verified because of environment limitations:
mark BLOCKED and explain why.

Do not claim PASS based only on source-code presence.

---

# 41. FINAL RULE

Do not stop once the obvious UI bugs are fixed.

The most important unresolved area is the financial data pipeline.

The goal is NOT:

"make more cells non-empty."

The goal is:

**make more cells correctly populated from reliable sources, with correct periods/units/methodology, and keep them unavailable when no reliable value exists.**

Likewise, the goal for navigation is not:

"make the card clickable."

It is:

**click card → requested instrument reliably opens in the correct Terminal pane.**

Likewise, the goal for charts is not:

"add an Adjusted button."

It is:

**Adjusted → Benchmark → selected index → stock OHLC is transformed candle-by-candle relative to the benchmark.**

Implement the underlying behavior, not just the visible control.

# END OF PROMPT
