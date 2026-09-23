# KOSH --- FINAL END-TO-END IMPLEMENTATION PROMPT

## Current-code audit → correctness → AI skill parity → Terminal → global tables → responsive UX → testing

You are working on the current Kosh repository that I have
provided/uploaded. This is NOT a request to build a new app. Modify the
existing app carefully.

The goal is to make Kosh feel like a coherent, premium
investment-intelligence platform for Indian investors: reliable data →
calculations → relationships → evidence → useful AI interpretation →
decision support.

Do not optimize for the number of features. Optimize for correctness,
clarity, speed, robustness and investor usefulness.

------------------------------------------------------------------------

# 0. ABSOLUTE RULE: INSPECT FIRST, THEN IMPLEMENT

Before modifying code:

1.  Inspect the entire current implementation relevant to these
    requirements.
2.  Identify which requested features are already correctly implemented.
3.  Reuse existing components, state, APIs and utilities wherever they
    are correct.
4.  Do NOT rebuild working functionality unnecessarily.
5.  Do NOT remove existing Kosh features unless explicitly instructed
    here.
6.  Do NOT create duplicate components when a reusable component can be
    extended.
7.  Keep the existing Kosh visual language: premium, restrained,
    analytical, clean.
8.  Do not turn the app into an over-designed trading terminal.
9.  Do not invent data.
10. Do not silently substitute missing data with zero, estimates or
    guesses.
11. After implementation, run the actual project's tests, typecheck and
    production build. Fix failures caused by your changes.
12. Report exactly what was changed, what tests passed/failed, and any
    remaining limitation.

------------------------------------------------------------------------

# 1. PRODUCT HIERARCHY

Preserve the existing Kosh architecture.

Core destinations remain:

-   Markets
-   Screener
-   Portfolios
-   Watch / relevant existing watch functionality
-   Stock analysis / full analysis where already present

Do NOT create new top-level pages just to implement the changes below.

Markets should have two clear modes:

-   Terminal
-   Overview

Terminal is the TradingView-like workspace.

Overview is the market snapshot/intelligence layer.

------------------------------------------------------------------------

# 2. LANDING PAGE --- MAKE TERMINAL VISUALLY OBVIOUS

The landing page already promotes Markets/Terminal, but the current
treatment is too close to a generic market-tile card.

Improve it so a visitor immediately understands:

> Kosh has a live market terminal where I can watch stocks, charts and
> market information.

Create a compact Terminal preview on the landing page.

It should visually include:

-   mini candlestick chart
-   right-side price axis
-   very subtle chart grid
-   Log indicator / scale indication
-   timeframe chips
-   mini watchlist
-   symbol
-   last price
-   absolute change
-   change %
-   small Draw / Pattern affordances
-   "Open Terminal →" CTA

This is a preview, not a second Terminal implementation.

Do not make the landing page fetch an unnecessary duplicate live chart
data stream just to render the preview.

Desktop: - elegant split hero/preview composition.

Mobile: - compact stacked preview - no horizontal overflow - no
oversized chart.

------------------------------------------------------------------------

# 3. GLOBAL TABLE SYSTEM --- SORTING EVERYWHERE IT MAKES SENSE

Audit EVERY page and component that contains entity/data tables.

Examples include:

-   Portfolio holdings
-   My Holdings
-   Watchlists
-   Terminal watchlist
-   Screener
-   Compare
-   Peer tables
-   Sector tables
-   Improve Portfolio
-   Risk tables
-   Path tables
-   any other table discovered in the repository

For every entity/data table:

## Sorting

Every meaningful sortable column should support:

-   click → sort
-   second click → reverse
-   optional third click → reset/default

Use appropriate data types:

-   number → numeric
-   percentage → numeric
-   date → chronological
-   text → alphabetical
-   market cap → numeric
-   valuation multiples → numeric

Missing values: - never convert to zero - sort consistently - remain
visibly unavailable

Show a small consistent sort indicator.

## Filtering

Where filtering is actually useful, support:

-   search
-   dropdown filter
-   numeric/range filter
-   categorical filter

Do NOT force filters onto every table.

A financial statement matrix such as:

Revenue \| FY23 \| FY24 \| FY25

is an analytical matrix, not an entity table. Do not add meaningless
column filters to it.

## Reusable implementation

Create or reuse a single table abstraction, preferably:

`KoshTable` / `DataTable`

with column definitions supporting:

-   accessor
-   label
-   formatter
-   sortable
-   filterable
-   filter type
-   optional filter options
-   missing-data behavior
-   responsive behavior

Use TanStack Table if appropriate and already available.

Do not implement bespoke sorting logic repeatedly.

------------------------------------------------------------------------

# 4. TABLE RESPONSIVE BEHAVIOR

No page should develop horizontal overflow because of a table.

Desktop: - full table.

Tablet: - compact columns / internal table scroll where appropriate.

Mobile: - either an internally scrollable table - or a carefully
designed responsive row/card representation.

Never make the entire page horizontally scroll.

------------------------------------------------------------------------

# 5. TERMINAL --- WATCHLIST MUST USE THE AVAILABLE PAGE HEIGHT

Current behavior makes the watchlist roughly the same height as the
chart.

Change the Terminal desktop layout.

Desired architecture:

LEFT: - Terminal toolbar - chart workspace - Kosh intelligence /
Overview / Fundamentals / Valuation / Growth / Ownership / News / Kosh
View - normal vertical document flow

RIGHT: - watchlist - starts near the top of the Terminal workspace -
extends to the bottom of the available viewport/page area -
independently scrollable

The right watchlist should NOT stop when the chart ends.

The left side should NOT be trapped inside a small scroll container.

Use a robust CSS grid/flex architecture.

Avoid unnecessary nested scrollbars.

------------------------------------------------------------------------

# 6. TERMINAL WATCHLIST --- ONE LIST SELECTOR

Current Terminal has watchlists and then a separate portfolio section.

Remove that visual duplication.

Use one selector:

`List: [ Main ▼ ]`

Dropdown groups:

WATCHLISTS - Main - Trade - Long-term - other user-created watchlists

PORTFOLIOS - user's portfolios

When selected: - display that list's stocks directly in the same
watchlist area.

Do NOT show a second Portfolio block underneath.

Do not delete portfolio-source functionality. Consolidate its
presentation.

Preserve: - create list - rename - delete - select - persistence

------------------------------------------------------------------------

# 7. TERMINAL WATCHLIST --- RESPONSIVE PRICE LAYOUT

This requirement is important.

The watchlist row must adapt to available width.

## Narrow/default watchlist

When the right watchlist is relatively narrow:

LEFT: - company/symbol

RIGHT: - last price on top - absolute change + change % below

Example:

RELIANCE 1,412.30 Reliance Industries +17.30 · +1.24%

## Wider watchlist

When the user widens the watchlist enough, intelligently switch to:

LEFT: - symbol/company

CENTER: - last price

RIGHT: - absolute change - change %

Example:

RELIANCE 1,412.30 +17.30 +1.24% Reliance Industries

Do not use a fixed breakpoint based only on viewport width.

Prefer CSS container queries if the architecture allows them, because
the relevant variable is the WATCHLIST WIDTH, not the browser width.

If container queries are not practical, use a robust responsive CSS
strategy.

## Column identification

Add very subtle micro-labels in the watchlist header so users understand
the columns:

-   NAME
-   LAST
-   CHG
-   CHG %

Keep these labels small and understated.

Do not repeat "Price", "Change", etc. inside every row.

## Data correctness

Last price: - actual latest price.

Absolute change: - latest price − previous close.

Change %: - actual quote change percentage.

Never fabricate the absolute change.

------------------------------------------------------------------------

# 8. TERMINAL WATCHLIST --- SORTING AND FILTERING

The Terminal watchlist itself is a table-like data list.

Therefore: - sortable by Last - sortable by Change - sortable by Change
% - searchable/filterable where useful

Keep manual drag ordering separate from data sorting.

If the user manually reorders: - persist the manual order.

If the user chooses a sort: - do not destroy the saved manual order. -
treat sorting as a view state.

Provide an easy way to return to: `Custom order`

------------------------------------------------------------------------

# 9. TERMINAL WATCHLIST --- DRAG AND DROP

Rows must be draggable.

Requirements:

-   visible subtle drag handle
-   drag row up/down
-   reorder only inside current list
-   persist order through existing store
-   persist after refresh
-   do not accidentally open/select a stock while dragging
-   maintain accessibility fallback using existing move-up/move-down
    behavior if available
-   avoid excessive animation

Do not add a new backend just for ordering if existing local/persistent
state is sufficient.

------------------------------------------------------------------------

# 10. TERMINAL WATCHLIST --- FULL LIST

Do not artificially cap visible rows.

The list can have many stocks.

The right pane should scroll independently.

The user should be able to see as many rows as fit and scroll through
all remaining rows.

------------------------------------------------------------------------

# 11. TERMINAL CHART --- RIGHT PRICE AXIS

Every price chart must have:

-   price axis on RIGHT
-   right-side labels
-   price tags on right where applicable

Do not place the primary price axis on the left.

Non-price portfolio charts do not need a price axis.

------------------------------------------------------------------------

# 12. TERMINAL CHART --- LOG SCALE DEFAULT

Preserve the current correct behavior:

-   Log scale = DEFAULT ON.
-   Linear/Log toggle remains available.

The same y-transform must be used by:

-   candles
-   indicators
-   drawings
-   patterns
-   horizontal levels
-   position tools
-   channels
-   crosshair

Do not mix linear and logarithmic coordinate systems.

Log scale tick placement must be mathematically/logically correct.

------------------------------------------------------------------------

# 13. CHART GRID --- VERY SUBTLE

The current chart grid is too visually strong in light mode.

Create a dedicated chart-grid visual token.

Grid: - extremely subtle - never resembles support/resistance - never
resembles user drawings

Light theme: - particularly light.

Dark theme: - subtle.

Grid positions must follow the active scale.

For Log scale: - price grid/ticks should correspond to logarithmic price
positions.

Actual: - support - resistance - drawing - horizontal line

must remain visually distinguishable from grid lines.

Apply this consistently across all price charts.

------------------------------------------------------------------------

# 14. TERMINAL DRAW TOOLS --- OPEN BY DEFAULT

When the user enters the Terminal chart:

Draw toolbar should be visible by default.

The user should immediately see available tools.

Do not make the toolbar huge.

A compact horizontal tool strip is preferred.

Preserve a button to collapse it.

If practical, remember the user's preference.

------------------------------------------------------------------------

# 15. DRAW TOOLS --- USE TRADINGVIEW-LIKE SEMANTICS

Use TradingView as the UX reference for familiar charting behavior.

Do NOT copy proprietary artwork/assets.

Use Kosh's existing icon library to provide recognizable equivalents.

Tools should include, where supported:

-   Select / Cursor
-   Crosshair
-   Trend Line
-   Horizontal Line
-   Ray
-   Vertical Line
-   Rectangle
-   Parallel Channel
-   Fibonacci Retracement
-   Long Position
-   Short Position
-   Delete
-   Undo

Icons must communicate their purpose clearly.

Do not use unrelated custom symbols when a conventional chart icon
exists.

------------------------------------------------------------------------

# 16. DRAW TOOLS --- REAL PARALLEL CHANNEL

Replace any fixed percentage-offset implementation.

Correct workflow:

1.  First anchor.
2.  Second anchor defines the first line and slope.
3.  Third anchor defines the offset of the parallel line.

The second line must remain geometrically parallel to the first.

Requirements: - draggable anchors - selectable object - editable after
creation - correct hit testing - works under log scale - persists -
undoable - deletable

Do not implement the second line as "first line ± 1.2%" or another fixed
percentage.

------------------------------------------------------------------------

# 17. DRAW TOOLS --- REAL LONG POSITION

Implement a proper long-position planning object.

It is NOT a trading signal.

It contains:

-   Entry
-   Stop Loss
-   Target

Calculations: - risk distance - reward distance - R:R - % risk - %
reward

All three levels should be draggable.

Display a clear visual risk/reward structure.

------------------------------------------------------------------------

# 18. DRAW TOOLS --- REAL SHORT POSITION

Same functionality inverted:

-   Entry
-   Stop Loss ABOVE entry
-   Target BELOW entry

Same calculations.

Again: - planning tool - measurement tool - NOT a recommendation - NOT a
BUY/SELL signal

------------------------------------------------------------------------

# 19. DRAW OBJECT SELECTION + KEYBOARD CONTROL

Every drawing object must be selectable.

Selected object: - visible selection state - draggable handles where
applicable

Keyboard:

-   Delete / Backspace → delete selected object
-   Escape → cancel current draft / deselect
-   Undo → restore
-   Redo if already supported

Delete must not trigger browser/page deletion.

Test the complete lifecycle: draw → select → move → delete → undo →
reload.

------------------------------------------------------------------------

# 20. TERMINAL INTELLIGENCE --- NORMAL PAGE FLOW

Current intelligence content can become a nested scroll box.

Remove the narrow internal scrolling behavior.

Desktop: - chart at top - intelligence tabs/content below - normal
vertical page scrolling

Selecting: - Overview - Fundamentals - Valuation - Growth - Ownership -
News - Kosh View

should expand/show content in the normal left-column document flow.

Right watchlist remains independently scrollable.

Mobile: - everything becomes one normal vertical page flow.

------------------------------------------------------------------------

# 21. MARKETS OVERVIEW --- HOLDINGS PREVIEW + FULL VIEW

Keep the compact:

`Your Holdings Today`

preview.

It may show the first \~8 names.

Add:

`View all holdings →`

This must open the complete holdings view.

Do not duplicate the entire holdings table on the Overview page.

------------------------------------------------------------------------

# 22. LANDING / OVERVIEW PREVIEW PATTERN

Whenever a section intentionally shows only a top-N preview, provide a
clear full-view action where useful.

Examples: - Full watch - Full holdings

Do not apply this mechanically to every card.

------------------------------------------------------------------------

# 23. PATTERN RECOGNITION --- KEEP AND IMPROVE, DO NOT OVERSELL

The current Pattern Recognition implementation is useful enough to
retain.

Keep it in Terminal.

Default: - OFF

When enabled: - draw pattern overlay - name the pattern - status:
Detected / Forming where supported - concise evidence -
timeframe/context

Display a small disclaimer:

`Analytical aid — not a signal or prediction.`

Never show: - fake confidence % - probability % - guaranteed breakout -
guaranteed target - BUY/SELL - unsupported historical accuracy

Do not make pattern recognition a trading recommendation engine.

Add tests for all current detectors: - VCP - VCP breakout - Bull flag -
Bear flag - Double top - Double bottom - Triangle - Ascending triangle -
Descending triangle - Range

Also test: - insufficient history - false-positive guards - max-result
cap - deterministic output.

------------------------------------------------------------------------

# 24. FUNDAMENTAL + QUALITATIVE --- CRITICAL CORRECTNESS WORK

This is the most important backend requirement.

Kosh currently contains Fundamental and Qualitative skill frameworks,
but their execution does not guarantee the same result as the user's
ChatGPT Custom GPTs.

The user has ALSO recreated the same skill frameworks in Grok, including
their reference knowledge.

Use those Grok skill/reference instructions as an additional source of
truth when available.

However:

DO NOT claim "exactly identical to ChatGPT" merely because the markdown
instructions are identical.

Different runtimes/models/tools can produce different results.

The goal is:

-   same analytical framework
-   same section structure
-   same verdict taxonomy
-   same evidence standards
-   same data definitions
-   same source priority
-   reproducible execution
-   validated output

------------------------------------------------------------------------

# 25. CREATE A PROPER SKILL ENGINE

Do not scatter Fundamental/Qualitative behavior across API routes and UI
components.

Create/reuse a SkillEngine abstraction containing:

-   skill ID
-   skill version
-   provider
-   model
-   system instructions
-   reference bundle
-   source bundle
-   data facts
-   web research configuration
-   output contract
-   parser
-   validator
-   retry policy
-   provenance

Suggested conceptual interface:

SkillRequest → research → model execution → raw output → schema
validation → structured SkillResult

------------------------------------------------------------------------

# 26. FUNDAMENTAL + QUALITATIVE --- REAL RESEARCH

The skill framework says it should use current verified primary sources.

The execution pipeline must actually support that.

When the provider supports web research:

ENABLE IT.

Prioritize:

1.  NSE/BSE exchange filings
2.  Company investor-relations website
3.  Annual reports
4.  Quarterly results
5.  Investor presentations
6.  Earnings-call transcripts
7.  SEBI/regulatory disclosures
8.  Reputable secondary sources

Do not rely only on: - Groww - Yahoo - generic news - cached snapshots

for a skill that claims primary-source research.

Retain source: - title - URL - source type - publication date -
retrieval date - data period

Internally.

------------------------------------------------------------------------

# 27. SOURCE DISCREPANCIES

If two sources disagree:

1.  Check period.
2.  Check definition.
3.  Prefer primary source.
4.  Flag material discrepancy.
5.  Never silently choose an arbitrary number.

Never fabricate missing values.

------------------------------------------------------------------------

# 28. FUNDAMENTAL OUTPUT CONTRACT

Preserve the user's existing Fundamental skill framework.

Required sections:

1.  Thesis + Key Fundamentals
2.  Integrated Fundamental Analysis
3.  Business + Compounding Engine
4.  What Changes the Story + Valuation
5.  Governance + Risks
6.  Scorecard + Final Verdict

Required structured fields:

-   approvedVerdict
-   score
-   stars if the existing framework uses them
-   thesis
-   keyConstraint
-   finalCase
-   finalWeakness
-   changeMind

------------------------------------------------------------------------

# 29. FUNDAMENTAL APPROVED VERDICTS

Only these exact labels are valid:

-   High-Conviction Multi-Bagger Candidate
-   Quality Compounder
-   Speculative Multi-Bagger
-   Fair Value Compounder
-   Limited Asymmetry
-   Avoid

Do not invent alternative verdict labels.

If the model outputs a near-match, normalize only through an explicit
deterministic mapping.

Do NOT use the first paragraph or first heading as the verdict.

Extract the actual final verdict.

------------------------------------------------------------------------

# 30. QUALITATIVE OUTPUT CONTRACT

Preserve the user's existing Qualitative skill framework.

Required sections:

1.  Financial Snapshot
2.  Factor Check
3.  Key Positive Factors
4.  Powerful Combinations Present
5.  Style Note
6.  Verdict
7.  Rationale

Required structured fields:

-   approvedVerdict
-   potentialLabel
-   financialClassification
-   factorStatuses
-   style
-   rationale

------------------------------------------------------------------------

# 31. QUALITATIVE APPROVED LABELS

Potential/verdict labels:

-   High Potential Multi-bagger
-   Moderate to High Potential
-   Moderate Potential
-   Low / Speculative Potential
-   Not Attractive on Qualitative Factors

Financial classification:

-   Financially Strong
-   Acceptable
-   Mixed
-   Weak

Do NOT confuse: - potential label with - financial classification.

------------------------------------------------------------------------

# 32. VALIDATE AI OUTPUT BEFORE ACCEPTING IT

Never silently accept malformed output.

Validation must check:

-   required sections
-   valid verdict
-   required factors
-   no invented numbers
-   final verdict exists
-   minimum useful content

If invalid: 1. retry once with a corrective instruction. 2. validate
again. 3. if still invalid → status = Failed.

Do not convert malformed output into a seemingly valid result.

------------------------------------------------------------------------

# 33. EXPLICIT SKILL EXECUTION STATUS

For each holding and each skill, store:

-   Not started
-   Running
-   Done
-   Invalid
-   Failed
-   Timed out
-   Rate limited

Example:

| Name \| Fundamental \| Qualitative \|
| TCS \| Done \| Done \|
| ABC \| Failed --- retry exhausted \| Done \|
| XYZ \| Running \| Not started \|

Never represent all failures as "Not run".

This is essential for trustworthy portfolio analysis.

------------------------------------------------------------------------

# 34. PORTFOLIO IMPROVE --- RUN BOTH SKILLS

The Improve Portfolio flow must actually execute:

-   Fundamental
-   Qualitative

for every relevant holding.

Do not silently skip Qualitative.

Do not stop after Fundamental.

Do not let one failed name terminate the entire portfolio run.

Use batching/concurrency appropriate to provider rate limits.

Persist completed results.

------------------------------------------------------------------------

# 35. REMOVE THE 20-NAME ARTIFICIAL LIMIT

A "whole portfolio" analysis must actually cover the whole relevant
portfolio.

Do NOT silently do:

`.slice(0, 20)`

Instead:

-   analyze all relevant holdings
-   batch into manageable groups
-   persist each completed result
-   show progress
-   synthesize only after required coverage is available

If the portfolio has 35 holdings, all 35 should be eligible.

If 3 fail: - show 32/35 complete - identify the 3 failures - do not
pretend coverage is 100%.

------------------------------------------------------------------------

# 36. PORTFOLIO SYNTHESIS --- USE REAL SKILL RESULTS

The portfolio verdict should be derived from:

-   actual holding weights
-   Fundamental verdicts
-   Qualitative verdicts
-   sector concentration
-   statistical/hidden concentration
-   portfolio return/risk metrics
-   valuation/growth context where available

Do not use weak heuristic pass/fail flags.

Examples of useful reasoning:

-   Large weight + supportive Fundamental + supportive Qualitative →
    explain why the concentration may be intentional.
-   Large weight + weak Fundamental → material portfolio-level concern.
-   Large weight + disagreement between skills → surface disagreement.
-   Small weight + weak stock → lower portfolio-level impact.

Do not automatically treat concentration as bad.

------------------------------------------------------------------------

# 37. PORTFOLIO SYNTHESIS MUST ANSWER

The final Improve Portfolio output should clearly answer:

1.  What kind of portfolio is this?
2.  Which large positions justify their current weight based on
    evidence?
3.  Which large positions deserve the most scrutiny?
4.  Where are sector/business overlaps?
5.  Where are the strongest hidden correlations?
6.  What are the three most material portfolio-level changes?
7.  What should the investor monitor?

Avoid generic: - "diversify" - "do your own research" - "maintain
discipline"

unless tied to specific portfolio evidence.

------------------------------------------------------------------------

# 38. AI CACHE INVALIDATION

AI results must not remain valid after framework changes.

Cache key should include at minimum:

-   skill version
-   provider
-   model
-   source methodology/version
-   symbol
-   relevant date/data version

Portfolio cache should include: - portfolio holdings - weights -
relevant skill-result versions - synthesis version

When instructions/parser/source methodology changes: - old result must
be invalidated or visibly marked stale.

------------------------------------------------------------------------

# 39. DATA PROVENANCE

For important AI-derived conclusions, retain the evidence chain:

-   raw source
-   period
-   source tier
-   retrieval date
-   derived calculation
-   AI interpretation

UI can expose this through a compact: `Sources` or `Evidence` section.

Do not clutter every paragraph with citations.

------------------------------------------------------------------------

# 40. NO FALSE PRECISION

Do NOT introduce:

-   fake confidence percentages
-   fake probabilities
-   unsupported target prices
-   unsupported forecasts
-   arbitrary "market implied growth"
-   arbitrary AI scores

Use ranges/scenarios only where the methodology actually supports them.

------------------------------------------------------------------------

# 41. GLOBAL MICRO-UX AUDIT

While implementing the above, audit the current app for small efficiency
problems.

Fix obvious issues that materially improve usability, including:

-   inconsistent column labels
-   inconsistent abbreviations
-   buttons that do not look interactive
-   controls without tooltips where the icon is ambiguous
-   unclear active states
-   unnecessary duplicate headings
-   excessive whitespace
-   inconsistent row heights
-   inconsistent numeric alignment
-   inconsistent positive/negative formatting
-   unclear loading states
-   unclear empty states
-   unclear error states
-   controls that disappear without explanation
-   mobile overflow
-   tiny click targets

Do NOT turn this into an unlimited redesign.

Only fix issues that improve clarity, speed or consistency.

------------------------------------------------------------------------

# 42. TERMINAL NUMERIC ALIGNMENT

For numeric fields:

-   use tabular/monospace numerals where appropriate
-   right-align numeric columns
-   keep decimals consistent
-   preserve actual precision
-   avoid unnecessary decimal places

Last price should visually dominate change numbers.

------------------------------------------------------------------------

# 43. TERMINAL WATCHLIST COLUMN LABELS

Use compact labels:

`NAME` `LAST` `CHG` `CHG %`

In narrow mode, CHG and CHG % can remain visually grouped under the Last
column.

In wide mode they become separate right-side columns.

Labels should be subtle: - small - muted - uppercase if appropriate -
not visually competing with stock names.

------------------------------------------------------------------------

# 44. ACCESSIBILITY

Ensure:

-   keyboard focus
-   accessible button labels
-   drag handle semantics
-   keyboard deletion
-   sufficient contrast
-   not relying on color alone
-   tooltips/aria-labels for unfamiliar icons

------------------------------------------------------------------------

# 45. PERFORMANCE

Do not: - create duplicate live market subscriptions - repeatedly fetch
the same quote - re-render the entire watchlist on every drag frame -
run pattern detection unnecessarily - rerun AI skills because a visual
tab changed - rerun portfolio analysis when only a UI preference changed

Memoize/virtualize where appropriate.

------------------------------------------------------------------------

# 46. TESTING --- TABLES

Add tests for:

-   numeric sort
-   text sort
-   date sort
-   missing data
-   filter
-   combined filter + sort
-   reset
-   custom/manual order
-   responsive column configuration where feasible

------------------------------------------------------------------------

# 47. TESTING --- TERMINAL WATCHLIST

Test:

-   list selector
-   watchlist source
-   portfolio source
-   price
-   previous close
-   absolute change
-   change %
-   narrow layout
-   wide layout
-   drag reorder
-   persistence
-   custom-order reset
-   sorting

------------------------------------------------------------------------

# 48. TESTING --- DRAWING TOOLS

Test:

-   select
-   move
-   delete by keyboard
-   undo
-   parallel channel geometry
-   long position
-   short position
-   log-scale coordinates
-   persistence

------------------------------------------------------------------------

# 49. TESTING --- AI SKILLS

Test:

-   Fundamental required sections
-   Fundamental verdict extraction
-   Qualitative required sections
-   Qualitative verdict extraction
-   malformed response rejection
-   retry
-   failed state
-   success state
-   source metadata
-   cache invalidation
-   all portfolio holdings
-   portfolio synthesis using real skill results

------------------------------------------------------------------------

# 50. TESTING --- PATTERN RECOGNITION

Keep existing tests.

Add representative tests for:

-   every supported pattern
-   insufficient history
-   false-positive guards
-   result cap
-   deterministic output

------------------------------------------------------------------------

# 51. VISUAL QA

Test at:

-   1440px
-   1280px
-   tablet
-   390px mobile

And:

-   light theme
-   dark theme

Specifically inspect:

### Terminal

-   right price axis
-   log scale
-   subtle grid
-   draw toolbar open
-   long/short
-   parallel channel
-   keyboard delete
-   full-height watchlist
-   independent watchlist scroll
-   normal intelligence/page scroll
-   narrow watchlist row
-   wide watchlist row
-   column labels

### Landing

-   Terminal preview
-   responsive layout
-   CTA

### Tables

-   sort indicators
-   filters
-   missing data
-   no page-level horizontal overflow

### Improve Portfolio

-   progress
-   Fundamental status
-   Qualitative status
-   failures
-   all holdings
-   final synthesis

------------------------------------------------------------------------

# 52. IMPORTANT: DO NOT CLAIM SUCCESS WITHOUT VERIFICATION

At the end provide a concise implementation report:

1.  Files/components changed.
2.  Features implemented.
3.  Features already correct and therefore preserved.
4.  Tests run + results.
5.  Typecheck result.
6.  Production build result.
7.  Any unresolved limitation.
8.  Any feature that could not be verified due to missing API
    credentials/data.

Do not say "everything works" if you did not run it.

------------------------------------------------------------------------

# 53. FINAL PRIORITY ORDER

If implementation must be staged, use this order:

## P0 --- correctness

1.  Fundamental/Qualitative SkillEngine
2.  Real research/search
3.  Structured output validation
4.  Correct verdict extraction
5.  Explicit skill execution status
6.  Full portfolio coverage
7.  Portfolio synthesis correctness

## P1 --- Terminal usability

8.  Full-height watchlist
9.  Unified Watchlist/Portfolio selector
10. Responsive Last / Change / Change% layout
11. Drag-and-drop ordering
12. Normal intelligence/page scroll

## P2 --- Chart robustness

13. Subtle chart grid
14. Draw toolbar default open
15. TradingView-like tool semantics
16. True parallel channel
17. True Long Position
18. True Short Position
19. Keyboard Delete

## P3 --- Global UX

20. Reusable sortable/filterable table system
21. Full Holdings action
22. Landing Terminal preview
23. Micro-UX consistency audit

## P4 --- Verification

24. Unit tests
25. Integration tests
26. Typecheck
27. Production build
28. Desktop/mobile/light/dark visual QA

------------------------------------------------------------------------

# 54. FINAL DESIGN PRINCIPLE

Kosh should not look like:

"Yahoo Finance + an AI chatbot + a chart."

It should feel like:

DATA → CALCULATIONS → RELATIONSHIPS → EVIDENCE → INTERPRETATION →
DECISION SUPPORT

The AI should interpret verified information.

The charts should help users understand price and structure.

The tables should help users compare and sort.

The Terminal should help users observe markets efficiently.

The Portfolio tools should help users understand what actually matters
across their holdings.

Every feature should earn its place.

Do not add complexity for the sake of complexity.

Build the above into the EXISTING Kosh application, preserving what
already works and correcting what does not.
