# Kosh — Master Implementation Prompt

You are working on the latest Kosh repository. Kosh is an Indian-equity investment intelligence application with market data, fundamentals, screening, portfolios, AI-assisted research, and a TradingView-style chart/terminal.

## NON-NEGOTIABLE WORKFLOW

### Phase 1 — Inspect first
Before changing code, inspect the repository end-to-end enough to understand the existing architecture and identify what is already implemented.

Inspect at minimum:
- `AGENTS.md`
- package/config/build/test scripts
- `src/lib/store.ts`
- chart components and chart utilities
- terminal components
- Market Overview
- screener and fundamental-data pipeline
- benchmark/sector code
- company enrichment/load-data flow
- valuation engine
- auth/privacy/cloud-portfolio flow
- relevant tests

Do NOT rebuild working functionality from scratch.
Do NOT remove an existing implementation merely because it differs from your first instinct.
Reuse existing types, stores, APIs, utilities, tests, and components wherever sensible.

After inspection, create an internal implementation checklist mapping every requirement below to the exact files/functions that will be changed. Then implement the checklist in one coherent pass. Do not stop after merely describing what should be done.

If an existing implementation already satisfies a requirement, verify it and leave it intact unless a correctness or UX issue remains.

### Phase 2 — Implement
Implement all applicable requirements below. Treat each numbered item as an acceptance criterion. Do not silently skip any item.

### Phase 3 — Verify
Run the strongest available validation:
- targeted tests for changed modules
- full test suite if feasible
- typecheck
- lint/build where feasible
- browser/visual inspection for chart and Terminal behavior

If the environment prevents a check, state exactly which check could not run and why. Never claim a build/test passed unless it actually ran.

At the end, report:
1. files changed
2. features implemented
3. tests/checks run and results
4. anything genuinely blocked
5. any intentional deviation from this prompt

---

# PRODUCT PRINCIPLES

Kosh should feel like a serious investment workspace, not a feature-heavy dashboard.

Priorities:
1. reliable data
2. correct calculations
3. useful relationships/comparisons
4. evidence-backed AI interpretation
5. familiar, learnable interaction patterns
6. clean visual hierarchy
7. no false precision

Do not add arbitrary metrics, scores, probabilities, target prices, confidence percentages, or forecasts merely to fill empty UI.
Missing data must remain explicitly missing or unavailable.

TradingView should be used as the behavioral reference for chart interactions because users already understand those conventions. Do NOT copy proprietary assets, branding, source code, or visual identity. Reproduce familiar interaction semantics using Kosh's own design system.

---

# A. SECURITY MASTER / NSE + BSE

Create/complete a canonical security master rather than keeping Kosh fundamentally NSE-only.

The canonical entity should support, where available:
- canonical company/entity ID
- ISIN
- company name
- NSE symbol
- BSE code
- exchange/listing
- series
- board/mainboard/SME status where available
- security status
- listing date where available
- historical/old symbols where available
- primary exchange

Architecture should allow:

Company / issuer
  ├── NSE listing
  └── BSE listing

Use the canonical entity for search, company pages, charts, screening, portfolios, and enrichment wherever possible.

Do not fake BSE coverage. If a BSE field is unavailable, mark it unavailable.

---

# B. VALUATION — REMOVE ARBITRARY GROWTH/DISCOUNT LOGIC FROM THE CORE

The current implementation uses hard-coded assumptions such as 12% discount rate and arbitrary bear/bull growth adjustments. Do not present these as company-specific truths.

Use **Option A**:

## Primary valuation experience: reverse valuation / required-growth analysis

The central question should be:

> What future earnings performance does today's price require?

For example:
- current price
- current EPS
- current P/E
- chosen/observed exit multiple
- holding period
- implied EPS CAGR required by today's valuation

The output must be explicitly labelled as a mathematical scenario/requirement, NOT a forecast.

## Growth evidence stack
Do not invent one arbitrary "growth" number.

Show available evidence separately:
- revenue CAGR 3Y
- revenue CAGR 5Y
- profit CAGR 3Y
- profit CAGR 5Y
- EPS CAGR 3Y/5Y where defensible
- latest YoY revenue/profit growth
- recent quarterly trend
- operating-margin trend
- ROCE/ROE
- CFO vs PAT / cash conversion
- debt trend
- management guidance where available
- capacity/order-book/store/subscriber/volume drivers where relevant
- credible consensus estimates if available and clearly attributed

Then explain whether the evidence is supportive, mixed, or limited. Do not convert these into a fake precise forecast.

If growth evidence is insufficient, say so.

## DCF/scenario model
If retained, it must:
- expose assumptions
- not silently default missing growth to 0%
- not silently manufacture a company-specific growth rate
- clearly label discount rate and other assumptions as model assumptions
- avoid presenting scenario output as intrinsic truth

If required inputs are unavailable, show "Insufficient data" rather than calculating a misleading number.

Keep the UI simple: reverse valuation should be the main experience; scenario valuation is secondary.

---

# C. COMPANY DATA / "LOAD DATA" EXPERIENCE

Keep the user-facing wording **"Load data"** because it is easier for users to understand.

However, make the feature actually useful.

Current behavior is essentially an enrichment attempt using existing company data + filings/XBRL. Improve it into a genuine coverage-aware refresh.

When the user clicks Load data:
1. inspect the company's currently available fields
2. identify missing/aged fundamental fields
3. query the available structured sources and filing/XBRL sources that Kosh already supports
4. parse additional supported fields
5. merge only validated values
6. preserve already-good values
7. never overwrite good data with null/invalid values
8. update the company snapshot/cache
9. refresh the UI

The purpose should be clear to the user:

"Load data" = attempt to fetch/refresh additional company financial data and fill supported missing fields.

Do NOT imply it can magically obtain every possible metric.

Add a compact coverage state if useful, e.g.:
- Available
- Refreshed
- Still unavailable
- Source unavailable

For financial series, if sales/profit history is missing, the refresh should actively attempt the relevant supported filing/XBRL paths instead of merely returning the same company card.

If a field remains unavailable after all supported sources were checked, show it as unavailable rather than guessing.

---

# D. SCREENER FUNDAMENTALS — ROCE / OPERATING PROFIT / NORMAL METRICS

The Screener must not frequently show ordinary metrics as unavailable when Kosh can already obtain them elsewhere.

Ensure the normal screener data pipeline can populate, where available:
- market cap
- P/E
- P/B
- EPS
- ROE
- ROCE
- operating margin / OPM
- operating profit where supported
- debt/equity
- dividend yield
- sales growth
- profit growth
- sales CAGR
- profit CAGR
- promoter holding
- other currently supported normal fundamental fields

Do not require the user to manually load a company page before Screener can see normal metrics.

Reuse the existing fundamental/deep-data parsing layer rather than creating a second incompatible source of truth.

Missing data must remain missing; do not convert unavailable into zero or pass.

---

# E. BENCHMARK-ADJUSTED / RELATIVE PERFORMANCE CHARTS

Add a chart performance mode available in BOTH:
- normal stock/company charts
- Terminal charts

Modes:
- Price
- Benchmark adjusted
- USD adjusted

## Benchmark adjusted

For Indian equities, default benchmark should be Nifty 50 unless another benchmark is explicitly selected.

Use an indexed-to-100 comparison methodology similar to TradingView Compare/Indexed to 100:

At the beginning of the visible comparison range:
- stock = 100
- benchmark = 100

Then plot relative performance through time.

Example:
Stock 100 → 124
Nifty 100 → 112

Display optional contextual text such as:
"+12.0% vs Nifty 50"
for the selected visible range.

Do not present relative performance as a buy/sell signal.

The benchmark system must be reusable, not hard-coded independently in multiple components.

Create/extend a benchmark definition layer supporting, where data exists:
- NIFTY50
- NIFTYBANK
- NIFTYIT
- NIFTYPHARMA
- NIFTYAUTO
- other supported sector indices
- USDINR

Do not substitute Nifty 500 and label it as a sector index.
If the correct sector benchmark is unavailable, explicitly say benchmark unavailable.

---

# F. USD-ADJUSTED CHARTS

Add USD-adjusted chart mode in both normal charts and Terminal.

For historical data, use the corresponding historical USD/INR rate for each candle where available.

Conceptually:

USD-adjusted price(t) = INR price(t) / USDINR(t)

Do not multiply all historical prices by today's FX rate unless that is explicitly the fallback and clearly labelled.

For live data:
- use current stock price and current USDINR when available
- if only current conversion is possible, clearly label the mode accordingly

The user should be able to switch among:
- Price
- Benchmark
- USD
without losing timeframe, indicators, drawings, or general chart state.

---

# G. MARKET OVERVIEW — SECTORS

Sector cards/rows and the top-moving sector headline should be clickable.

Clicking a sector should open the relevant sector index chart, not a generic Nifty 500 chart.

Examples:
- IT → Nifty IT
- Bank/Financials → appropriate Nifty bank/financial index where supported
- Pharma → Nifty Pharma
- Auto → Nifty Auto

Preserve familiar chart controls and allow benchmark/USD modes where applicable.

If no proper sector index exists or data is unavailable, do not silently substitute a generic index.

---

# H. MARKET OVERVIEW — HOLDINGS

Redesign the Holdings section so it is useful directly on Market Overview.

Do NOT navigate to the Holdings page from this section.

Provide:

Portfolio selector:
- All
- individual portfolios

"All" should aggregate holdings across portfolios by canonical symbol.

Show a useful compact table/card with fields such as:
- Name
- Last
- Change
- Change %
- Current value
- Portfolio weight

Use sensible responsive behavior.

Clicking an individual security may open its stock page.

Do not truncate to an arbitrary first 8 holdings without a clear "view more" mechanism inside the same section.

---

# I. MARKET OVERVIEW — WATCH

Apply the same embedded treatment to Watch.

Use:
- watchlist selector
- selected list displayed directly on Market Overview
- no unnecessary navigation to a separate Watch page

Clicking a stock can open the stock page.

---

# J. TERMINAL WATCHLIST

Remove the old up/down reorder buttons.

Drag-and-drop is now the ordering mechanism.

At the far right of every stock row, keep only:

×

for removal.

Use one shared CSS grid for header and rows so headers line up exactly with the corresponding columns.

Columns should align as:

handle | name | last | chg | chg % | remove

Responsive narrow mode should preserve the intended information hierarchy.

---

# K. TERMINAL SORT PERSISTENCE

If the user sorts the Terminal watchlist by:
- Last
- Change
- Change %

and direction ascending/descending, persist that state per watchlist/list.

When the user returns to the Terminal, restore the same sort.

Sorting persistence must be separate from drag/custom order.

Do not persist temporary search text unless the existing UX already intentionally does so.

---

# L. CHART ENGINE — TRADINGVIEW-LIKE NAVIGATION

This is a major priority.

Do not merely add buttons. Correct the underlying viewport/navigation model.

## 1. Cursor-anchored zoom

Mouse-wheel zoom must preserve the candle under/near the cursor.

Zooming in around a point should keep that point visually anchored rather than shifting the user unpredictably.

## 2. Zoom both directions

Add clear:
- zoom in
- zoom out

controls.

When zooming out, expand the visible range around the user's current viewport.

If the latest candle is at the right edge, expanding should naturally add historical bars to the left rather than repeatedly behaving as if the viewport is permanently anchored to the left.

If the user is looking at historical data, preserve that historical position.

## 3. Horizontal navigation

Support smooth horizontal pan/scroll through history.

Use familiar interaction semantics such as:
- drag to pan
- Shift + wheel for horizontal movement where appropriate
- wheel zoom around cursor

Do not make navigation feel like the entire chart is being recreated on every wheel event.

## 4. Latest-bar navigation

Add a small bottom chart control to return directly to the latest/current candle.

Example:

"Go to latest"

When already at latest, it can be disabled/subtle.

## 5. Reset View

Add a TradingView-like "Reset view" action.

Reset view should:
- restore sensible default visible range
- restore sensible bar spacing
- place latest data at the right edge
- autoscale the Y axis
- preserve timeframe
- preserve indicators
- preserve drawings
- preserve benchmark/USD mode

It must reset the viewport, not wipe the user's chart configuration.

## 6. Autoscale

Y-axis should autoscale to the currently visible data.

Log/linear setting remains independent.

## 7. Bottom chart navigation strip

Add a compact bottom control strip in the same visual language as TradingView:
- zoom out
- zoom in
- latest
- optionally go-to-date
- optionally navigation arrows if useful

Keep it unobtrusive.

## 8. Date navigation

If practical, support a go-to-date interaction so users can jump to a historical date.

Do not add it if it compromises the core chart engine; it is secondary to correct pan/zoom.

---

# M. CHART HEIGHT

Restore chart-height control.

Default desktop chart height should be materially taller than the current ~420px; target roughly 560–600px for the normal stock chart unless the available viewport makes a different height more appropriate.

Provide:
- decrease height
- increase height

or an equivalent clear control.

Terminal charts should have sensible height as well.

Persist the user's preferred chart height if the existing settings architecture supports it.

---

# N. FULLSCREEN

Fix the current fullscreen behavior.

The button should use the browser Fullscreen API where supported, with a fallback overlay if necessary.

Requirements:
- chart truly fills the screen
- Esc exits
- resize recalculates chart dimensions
- no page scroll while fullscreen
- drawing toolbar remains usable
- bottom controls remain usable
- crosshair remains usable

Do not confuse "maximize card" with actual fullscreen.

---

# O. CROSSHAIR / HOVER / SMOOTHNESS

Crosshair interaction must feel smooth and professional.

Do not cause a full React render on every pointermove if avoidable.

Prefer:
- pointer position in refs
- requestAnimationFrame-driven visual updates
- direct lightweight DOM/SVG positioning where appropriate
- memoized chart calculations

Target smooth 60fps-class interaction on normal hardware.

Crosshair should show:
- vertical line
- horizontal line
- hovered candle/date
- price at crosshair
- OHLC information for hovered candle

The price label should appear on the right price axis.

The date label should appear on the bottom time axis in the familiar charting style.

Make date/price/hover information significantly more visible than it is now.

Hovering historical candles must show the historical candle's values, not the latest candle's values.

---

# P. GRIDLINES

Current horizontal gridlines are still too visible.

Make the chart grid extremely subtle, close to TradingView's understated appearance.

Requirements:
- fewer/less prominent horizontal lines
- very low opacity
- vertical grid equally subtle
- grid must not visually resemble support/resistance levels
- drawings/levels must remain visually distinguishable from grid

Do not remove the grid entirely unless necessary; it should be present but barely noticeable.

---

# Q. CHART DRAWING / POSITION TOOL

Keep drawing toolbar open by default.

Keep:
- trend line
- horizontal/vertical line
- ray
- rectangle
- Fibonacci if already implemented
- parallel channel
- long/short position tool
- other existing useful drawing tools

Keyboard:
- Delete/Backspace removes selected drawing
- Escape cancels/deselects

## Long/Short geometry

Validate direction:

Long:
Stop < Entry < Target

Short:
Target < Entry < Stop

If invalid, do not show a misleading R:R. Show a compact invalid-geometry state.

Keep:
- Entry
- Stop
- Target
- risk
- reward
- R:R

This is a measurement/planning tool, not a signal or recommendation.

Do not pursue the previous log-aware parallel-channel enhancement; leave the existing channel approach unless required for correctness.

## Undo/redo

Implement actual drawing-state undo/redo, not "remove last drawing".

State changes such as:
- add
- move
- resize
- delete
- edit

should be undoable in order.

---

# R. PATTERNS

Keep the existing pattern-recognition layer.

Patterns are observations, not forecasts.

Do not add:
- confidence percentages
- BUY/SELL labels
- predicted prices
- guaranteed outcomes

Keep the existing optional pattern toggle and make sure it does not clutter the chart.

---

# S. COMPANY VS NIFTY 50

The "Your companies vs Nifty 50" section must always have usable Nifty 50 benchmark values where data exists.

Do not depend on opportunistic screener hydration of the Nifty constituents.

Create/use a dedicated cached Nifty 50 benchmark/fundamental snapshot for metrics such as:
- P/E
- ROE
- D/E
- dividend yield
- other supported benchmark metrics

Refresh it through the same data architecture used by Kosh.

If a benchmark metric truly cannot be computed, show unavailable rather than a blank that looks like a bug.

---

# T. PRIVACY / BROKER FILE SECURITY

Kosh must make users comfortable uploading broker statements/sheets.

## Raw broker files

Broker CSV/XLS/XLSX files should be processed in the browser whenever possible.

Do NOT upload the original broker file to Kosh servers merely to parse it.

## Guest/device-only mode

Prefer a local-only portfolio mode where normalized portfolio data stays on the user's device.

## Cloud mode

If the user explicitly chooses cloud sync, clearly explain that normalized portfolio data is stored server-side so it can sync across devices.

Never imply cloud sync is local-only.

## AI privacy

Do not send unnecessary sensitive portfolio information to AI providers.

For AI portfolio analysis, send only the minimum necessary data. Prefer symbols/weights/aggregates over raw broker records, quantities, account identifiers, or original files unless a feature genuinely requires them.

## User-facing disclosure

On broker-file upload, provide a compact privacy message such as:

"Processed locally — your original broker file is not uploaded to Kosh."

For cloud sync:

"Cloud sync enabled — Kosh stores your normalized portfolio data so it can be available across devices."

Do not claim encryption or zero-storage unless it is actually implemented and verified.

## Security architecture

Review:
- auth boundaries
- user_id scoping
- portfolio reads/writes
- API endpoints
- AI request payloads
- logs
- browser storage
- cloud persistence

Avoid destructive delete-and-reinsert saves where safe upserts can be used.

Do not expose one user's portfolio to another user.

---

# U. PERSISTENCE / STATE

Persist where appropriate:
- chart timeframe
- log/linear
- benchmark/USD mode
- chart height
- indicator preferences
- Terminal watchlist selection
- watchlist custom order
- watchlist sort key/direction
- drawing state
- sensible chart viewport preferences if robust

Do not persist transient interaction state unnecessarily.

---

# V. RESPONSIVE / MOBILE

All changes must work on:
- desktop
- tablet
- mobile

Terminal should preserve the chart-first experience on smaller screens.

Watchlist should remain readable.

Controls should not overflow or become inaccessible.

---

# W. PERFORMANCE

Avoid unnecessary re-renders.

Especially optimize:
- crosshair
- wheel zoom
- pan
- chart resize
- large watchlists
- benchmark overlays
- multiple Terminal panes

Use memoization, refs, requestAnimationFrame, and derived-data caching where appropriate.

Do not sacrifice correctness for micro-optimizations.

---

# X. TESTS / ACCEPTANCE CHECKLIST

Add or update tests for important logic changes.

At minimum test:

### Benchmark
- indexed-to-100 normalization
- visible-range normalization
- benchmark unavailable state
- sector benchmark mapping

### USD
- historical FX conversion
- missing FX fallback state

### Valuation
- reverse valuation math
- missing growth evidence
- no silent g=0
- transparent assumptions

### Company data
- missing-field enrichment
- no overwrite with null
- financial-series enrichment

### Screener
- ROCE availability
- OPM/operating profit availability
- missing metrics remain unknown

### Watchlist
- sort persistence
- drag order
- remove
- header/row column alignment structure

### Chart
- cursor-anchored zoom
- zoom out expansion
- pan
- reset view
- latest navigation
- fullscreen state
- chart height
- crosshair values
- long/short geometry
- undo/redo

### Privacy
- raw broker file is not sent to server during client-side parsing
- cloud data is user-scoped
- AI payload excludes unnecessary sensitive portfolio details

---

# Y. UI QUALITY BAR

The UI should be:
- premium
- restrained
- information-dense without feeling crowded
- dark-terminal friendly
- subtle borders
- subtle grid
- consistent typography
- keyboard accessible
- responsive

Do not introduce a new design language.
Use existing Kosh tokens/components.

TradingView is the interaction reference; Kosh remains visually distinct.

---

# FINAL IMPLEMENTATION RULE

Do not treat this as a list of suggestions.
Treat every section above as a concrete implementation checklist.

Inspect first → map requirements to code → implement → test → visually verify → report completion against every section.

If something is genuinely impossible with the current data provider/API, implement the best correct fallback and explicitly mark the limitation. Never fake data.
