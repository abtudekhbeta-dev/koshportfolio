# KOSH V6 — COMPREHENSIVE CORRECTION, DATA-TRUST & UX IMPLEMENTATION PROMPT

You are modifying the existing Kosh repository. This is NOT a request to add another batch of superficial features.

Your job is to perform a comprehensive corrective implementation based on the existing codebase, with the primary objective:

> Make Kosh's data, AI, provenance, screener, stock page, Terminal, and UX architecture internally consistent, reliable, auditable, and production-ready.

Do NOT assume that a feature is complete because a button/component/function exists. Trace the complete flow:
UI → client API → server route → data source → parsing → reconciliation → persistence/cache → AI input → validation → rendered output.

Do NOT rewrite working functionality unnecessarily. Preserve existing good implementations, especially:
- benchmark-adjusted OHLC candles
- historical USD-adjusted OHLC
- valuation scenario transparency
- existing chart drawing tools
- existing watchlist sorting/persistence
- index/sector/ticker navigation work
- Holdings movement-only columns
- existing AI skill structure where it is sound
- existing responsive Kosh visual language

Before changing code, inspect the entire repository and produce an internal implementation map. Then implement the changes below. Do not ask for confirmation between sections.

============================================================
0. NON-NEGOTIABLE ENGINEERING RULES
============================================================

1. Inspect first, modify second.
2. Reuse existing abstractions where possible.
3. Do not create duplicate data-fetching pipelines for the same metric.
4. Do not make AI responsible for inventing or calculating raw financial facts that can be deterministically sourced.
5. Never silently treat missing data as zero, pass, healthy, or verified.
6. Never silently substitute an approximate metric for a requested metric.
7. Every important financial fact must have provenance:
   value, period, source, URL/document, retrieval time, methodology/definition, consolidation basis where applicable.
8. Distinguish:
   - reported/source value
   - Kosh-derived value
   - AI-researched qualitative fact
   - calculated metric
9. If sources disagree, reconcile explicitly. Do not blindly use first-source-wins or fill-blanks-only logic.
10. If a metric cannot be verified, show "Unavailable / Not found" with reason rather than fabricating it.
11. All AI outputs must be schema-validated before display.
12. AI buttons must be visually identifiable.
13. All expensive endpoints must have server-side abuse/rate controls.
14. Do not claim "live", "verified", "complete", or "full" unless the implementation actually satisfies that claim.
15. Do not introduce prediction, BUY/SELL signals, fake confidence percentages, or unsupported target prices.
16. Preserve Kosh's educational/investment-intelligence nature; this is not an execution/trading recommendation engine.
17. Avoid feature bloat. Fix architecture before adding features.

============================================================
1. MASTER DATA ARCHITECTURE — BUILD ONE VERIFIED FACT LAYER
============================================================

CURRENT ISSUE
-------------
Kosh currently has several partially independent data layers:
- Yahoo for market/OHLC/technical data
- Groww for many fundamentals
- NSE XBRL/filings/shareholding for deep enrichment
- news providers
- xAI web search for qualitative research
- AI analysis over a mixture of these

The problem is that these sources are not unified into a field-level evidence model. Existing enrichment largely fills blanks rather than reconciling conflicting values.

WHY IT HAPPENS
--------------
The current Fundamental model primarily stores values and broad source labels. A field such as ROCE or OPM does not reliably retain:
- exact source
- document
- reporting period
- retrieval time
- calculation methodology
- consolidated vs standalone
- reported vs derived status

As a result, the UI and AI can make data appear more authoritative/complete than it actually is.

RESOLUTION
----------
Create a centralized, reusable Verified Fact / Evidence model.

Suggested conceptual shape:

VerifiedFact<T>:
- value
- unit
- periodStart
- periodEnd
- fiscalYear / quarter where applicable
- asOfDate
- sourceName
- sourceType
- sourceUrl
- documentTitle
- documentDate
- retrievedAt
- consolidation: standalone | consolidated | unknown
- status: verified | derived | conflicting | unavailable
- methodology
- definition
- confidence must NOT be a fake numeric confidence score; use explicit status instead
- raw/source reference where practical

Source priority must be explicit and configurable.

For accounting/financial facts prefer:
1. Company regulatory filing / official investor-relations document
2. NSE/BSE filing
3. official annual/quarterly report
4. official presentation / results document
5. reliable structured provider
6. other secondary source

For market prices, use a properly supported/licensed source architecture. Keep the current provider as an adapter if necessary, but do not hard-code Kosh's product claims around an unsuitable source.

Build a source-adapter interface so providers can be swapped without rewriting the application.

DO NOT duplicate every existing Fundamental field immediately if that would create unnecessary churn. Instead:
- introduce the evidence/provenance layer
- map current Fundamental fields into it
- migrate the highest-value fields first
- make future sources feed the same layer

Highest priority fields:
Revenue, EBITDA, EBIT/Operating Profit, PAT, CFO, EPS, ROE, ROCE, OPM, D/E, interest coverage, PE, PB, PEG, book value, dividend yield, promoter holding, FII, DII, pledge, sales/profit CAGR.

============================================================
2. AUTOMATIC STOCK PAGE LOADING
============================================================

CURRENT ISSUE
-------------
Opening a stock loads basic price/fundamental information, but deep filing enrichment requires manually pressing "Load more data".

WHY
---
The stock page calls the basic fundamentals endpoint automatically, while deep enrichment is a separate explicit operation.

RESOLUTION
----------
When a stock page opens:

A. Immediately load all deterministic/cached data already available.
B. Do NOT make the user wait for deep enrichment before seeing the stock.
C. Start a background enrichment/reconciliation job automatically for the stock if:
   - important supported fields are missing, or
   - cached evidence is stale.
D. Render available data immediately.
E. Show a subtle "Updating data…" state for missing sections.
F. When background enrichment finishes, update the page without requiring refresh.
G. If no additional source can provide a field, mark it unavailable rather than repeatedly retrying forever.

The manual action must remain, but it becomes:
"Complete & verify data"
rather than the only way to discover data.

Do not block the initial stock render on slow filing retrieval.

Implement stale-while-revalidate behavior:
cache → render → refresh in background → reconcile → update UI.

============================================================
3. REPLACE "FILL BLANKS" WITH REAL DATA RECONCILIATION
============================================================

CURRENT ISSUE
-------------
Deep enrichment uses existing values and often fills only missing fields.

WHY
---
The current merger is effectively fill-blanks-first.

RESOLUTION
----------
For every important metric:
1. collect all available candidate values
2. normalize units
3. normalize period
4. normalize standalone/consolidated basis
5. determine metric definition
6. compare sources
7. choose according to source hierarchy and recency
8. retain the alternatives/evidence
9. expose the selected value and provenance

Example:

ROCE:
- Groww: 22.4%
- NSE-derived: 23.1%
- company reported: 22.8%

Do not simply keep the first value.

Instead:
Selected: 22.8%
Status: verified
Method: company-reported
Evidence: ...
Alternative calculations: ...

For derived metrics:
explicitly mark:
"Kosh-derived"
and show methodology.

============================================================
4. BUILD A REAL "COMPLETE & VERIFY DATA" ENGINE
============================================================

CURRENT ISSUE
-------------
"Load more data" currently performs a limited deep enrichment pass. It is not a comprehensive source search and does not guarantee that every supported field has been investigated.

WHY
---
fetchDeepMany/fetchDeepFundamentals are bounded and primarily combine existing structured data with NSE filings/shareholding. There is no field-level completion engine.

RESOLUTION
----------
Create a dedicated data-completion pipeline.

For a symbol:

PHASE 1 — Structured deterministic sources
- NSE
- BSE
- company IR
- annual reports
- quarterly results
- official filings
- shareholding
- existing structured provider(s)

PHASE 2 — Normalize
- units
- dates
- fiscal periods
- consolidated/standalone
- metric definitions

PHASE 3 — Reconcile
- source hierarchy
- period matching
- definition matching
- conflict detection

PHASE 4 — Derive only where mathematically valid
Examples:
- CAGR
- CFO/PAT
- OPM
- ROCE
Do not derive a metric when required inputs are missing or definitions do not match.

PHASE 5 — Research fallback
For fields that cannot be deterministically found, optionally use AI/web research to locate the official source/document. AI must return evidence, not an invented number.

PHASE 6 — Final status
Each requested field must end in one of:
- Verified
- Derived
- Conflicting — needs review
- Not found
- Not applicable

The completion engine should return a field-level report.

Example:
ROCE ✓ Verified — NSE annual filing
OPM ✓ Derived — operating profit/revenue
PEG ✓ Verified — source...
Interest coverage ✗ Not found
Pledge ✓ Verified — shareholding filing

The goal is not to promise zero missing fields. The goal is to guarantee that every supported field has been searched and its final status is known.

============================================================
5. STOCK PAGE COVERAGE MUST BECOME FIELD-LEVEL
============================================================

CURRENT ISSUE
-------------
Coverage is bucket-based and can say a stock is broadly covered even when many important metrics are missing.

WHY
---
The current coverage groups fields into broad buckets.

RESOLUTION
----------
Add a detailed "Data coverage" drawer/panel.

Show:
- Available
- Verified
- Derived
- Missing
- Conflicting
- Not applicable

For every important metric.

Example:

Financials
✓ Revenue
✓ PAT
✓ CFO
✓ ROCE
✓ OPM
⚠ Interest coverage
✗ PEG

Ownership
✓ Promoter
✓ FII
✓ DII
✓ Pledge

Do not expose a fake percentage as the sole coverage signal.

============================================================
6. SCREENER — EXPAND DATA COVERAGE
============================================================

CURRENT ISSUE
-------------
The ScreenRow data model contains more metrics than the screener reliably populates/exposes. "depth=full" does not mean a full deep filing crawl.

WHY
---
The full screener path combines OHLC + basic fundamentals + cached deep data rather than systematically enriching the entire universe.

RESOLUTION
----------
Separate:

A. SCREENABLE BASE DATA
Fast, deterministic metrics suitable for large-universe filtering.

B. DEEP DATA
Expensive, per-company data retrieved only when needed.

The screener must expose substantially more useful fields, including where data is reliably available:
- PE
- PB
- PEG
- EPS
- book value
- ROE
- ROCE
- OPM
- D/E
- interest coverage
- dividend yield
- sales CAGR 3Y/5Y where available
- profit CAGR 3Y/5Y
- CFO/PAT
- promoter holding
- pledge
- FII/DII
- FII/DII change
- market cap
- returns
- technical fields already supported
- valuation/quality fields already present in the codebase

Do not add columns just for quantity. Every column must have a source and useful meaning.

Make columns configurable so users can choose visible fields.

============================================================
7. SCREENER — PER-STOCK "COMPLETE MISSING DATA"
============================================================

CURRENT ISSUE
-------------
The screener has no clear per-row mechanism for a user to retrieve missing metrics for an individual screened stock.

WHY
---
Enrichment is currently global/batched and the missing-data logic is limited.

RESOLUTION
----------
For every screened row with relevant missing data, add an action:

"Complete missing data"

If AI/web research is required:
"✦ AI · Complete missing data"

Do not show it when all relevant fields are already verified.

Clicking it must:
1. identify exactly which fields are missing
2. retrieve deterministic sources first
3. search official sources
4. reconcile results
5. update only that stock row
6. show a field-level completion result

Example:
ABC LTD
ROCE — | OPM 18.2% | PEG — | Interest Coverage —

[✦ Complete missing data]

After:
ROCE 21.4% ✓
OPM 18.2% ✓
PEG 0.91 ✓
Interest Coverage 5.8x ✓

If unavailable:
PEG — Not found after checking supported sources

Never silently replace missing with zero or approximate values.

============================================================
8. SCREENER — DO NOT SILENTLY MAP UNSUPPORTED METRICS
============================================================

CURRENT ISSUE
-------------
The AI screener builder may map a requested metric to the closest supported field.

WHY
---
The screen builder's field vocabulary is limited.

RESOLUTION
----------
If a requested metric is unsupported:
- explicitly tell the user it is unsupported
- offer the closest supported metric as an explicit alternative
- never silently substitute it

Example:
User asks:
"Free cash flow yield"

If unavailable:
"Free cash flow yield is not currently a supported screening field.
Closest available: CFO/PAT.
Use CFO/PAT instead?"

If user accepts, then build the screen.

============================================================
9. TERMINAL FULLSCREEN — FIX AT WORKSPACE LEVEL
============================================================

CURRENT ISSUE
-------------
Fullscreen is attached to the individual TermChart. The watchlist is a sibling component and therefore cannot participate in the same fullscreen workspace.

WHY
---
The fullscreen ref points to TermChart rather than the complete MarketsDesk/terminal shell.

RESOLUTION
----------
Implement true Terminal fullscreen.

Fullscreen target:
Terminal workspace container, not individual chart.

Fullscreen layout:

┌────────────────────────────────────────────────────┐
│ Symbol / controls              Watchlist   [Exit]  │
├───────────────────────────────────────┬────────────┤
│                                       │            │
│               CHART                   │ WATCHLIST  │
│                                       │            │
│                                       │            │
├───────────────────────────────────────┴────────────┤
│ chart tools / navigation                            │
└────────────────────────────────────────────────────┘

Requirements:
- native requestFullscreen where supported
- CSS fallback where required
- Esc exits
- fullscreenchange listener is source of truth
- browser-safe event handling
- no duplicate fullscreen state
- chart resizes via ResizeObserver
- no page scroll behind fullscreen
- keyboard shortcuts continue working
- watchlist can be opened/closed inside fullscreen
- watchlist width adjustable or responsive
- watchlist scroll independent from chart
- current watchlist selection remains active
- chart controls remain accessible
- exit control remains visible

Add explicit browser QA for:
Chrome desktop
Firefox desktop
Safari where practical
Esc
resize
orientation if relevant
multiple panes if supported

Do not mark this feature complete based on source code alone. Test the actual runtime.

============================================================
10. TERMINAL VERTICAL RESIZE
============================================================

CURRENT ISSUE
-------------
A terminal height preference exists, but it behaves more like workspace height than a polished chart-resize interaction.

RESOLUTION
----------
Implement a clear terminal chart-height control:
- visible height control near chart controls
- − / +
- tooltip names
- optional drag handle if practical
- Fit/Reset height
- persisted preference
- min/max bounds
- responsive behaviour
- fullscreen-aware
- does not break watchlist or Intel panel

Do not introduce nested scrollbars unnecessarily.

============================================================
11. AI BUTTON VISUAL LANGUAGE
============================================================

CURRENT ISSUE
-------------
Some AI buttons look like normal UI actions.

WHY
---
AI functionality was added incrementally and does not have one global visual identity.

RESOLUTION
----------
Create one reusable AIButton / AIAction component.

Every action that:
- calls xAI/Grok
- performs AI research
- runs an AI skill
- generates an AI interpretation
must visibly indicate this.

Use a consistent:
- "✦ AI" label or equivalent icon
- subtle unique accent
- hover state
- loading state
- tooltip
- optional "uses AI" text on wider layouts

Examples:
✦ AI · Read this stock
✦ AI · Complete missing data
✦ AI · Run Pulse
✦ AI · Build screen
✦ AI · Combined verdict
✦ AI · Research risk

Do NOT label deterministic data retrieval as AI.

Differentiate:
"Fetch verified data"
vs
"✦ AI · Research missing information"

Do not use flashy/gimmicky animation. Keep the visual identity premium and subtle.

============================================================
12. AI + DATA MUST BE SEPARATED CORRECTLY
============================================================

CURRENT ISSUE
-------------
AI sometimes receives a mixture of structured data and is also asked to research financial facts itself.

WHY
---
The current AI layer uses xAI web_search directly for research without a complete structured evidence bundle.

RESOLUTION
----------
Use this pipeline:

VERIFIED DATA
→ structured facts
→ source/provenance

AI RESEARCH
→ primary-source web research
→ evidence records

AI INTERPRETATION
→ receives both

AI must not be the authoritative source of raw financial numbers when Kosh can retrieve them deterministically.

If AI finds a number on the web:
- identify source
- identify document
- identify period
- distinguish it from verified structured data
- reconcile before treating it as a financial fact

============================================================
13. AI EVIDENCE / CITATION MODEL
============================================================

CURRENT ISSUE
-------------
AI output does not retain durable field-level evidence for material numerical claims.

WHY
---
The final result is primarily stored/rendered as text.

RESOLUTION
----------
Create an evidence object:

Evidence:
- claim
- value if applicable
- source
- sourceType
- title
- URL
- publication date
- retrieval date
- period
- excerpt/locator where legally/practically possible
- relevance

AI result should contain:
- analysis
- evidence[]
- unresolvedQuestions[]
- dataLimitations[]

Important numerical claims must be traceable to evidence or Kosh-calculated facts.

If an AI claim cannot be supported:
- qualify it
- omit it
- or label it as an interpretation rather than fact

============================================================
14. AI OUTPUT VALIDATION
============================================================

CURRENT ISSUE
-------------
Some AI paths parse JSON permissively and accept partial structures.

RESOLUTION
----------
Every AI skill must have:
- version
- provider/model
- input schema
- output schema
- required fields
- allowed enums
- numeric validation
- evidence requirements
- parser
- validator
- retry policy
- explicit failure state

Flow:

AI response
→ parse
→ schema validate
→ semantic validate
→ evidence validate
→ accept

If invalid:
→ retry with correction instruction
→ if still invalid, show "AI analysis unavailable"
→ never display malformed/partial content as complete analysis

Do not invent missing fields during parsing.

============================================================
15. AI SKILL VERSIONING / CACHE CORRECTNESS
============================================================

Ensure AI cache keys include:
- skill ID
- skill version
- model/provider
- relevant source/data methodology version
- symbol
- date/as-of where relevant
- portfolio holdings/weights for portfolio skills

Changing a skill definition must invalidate old results.

Do not let an old AI answer appear as if it were generated under a new methodology.

============================================================
16. PRIMARY-SOURCE RESEARCH FOR AI
============================================================

For qualitative research, prioritize:
1. NSE/BSE official filings
2. Company investor-relations site
3. Annual reports
4. Quarterly results
5. Investor presentations
6. earnings-call transcripts where legitimately accessible
7. reputable secondary reporting

The AI must distinguish:
- reported fact
- company guidance
- analyst/media interpretation
- Kosh calculation
- AI interpretation

Do not present company guidance as achieved performance.

Do not present management claims as independent facts without attribution.

============================================================
17. REMOVE / CORRECT THE "AUTO NIFTY 500 AI BOARD" ILLUSION
============================================================

CURRENT ISSUE
-------------
The skill-board auto-scan is effectively disabled/retired due quota/time constraints, while parts of the architecture can imply a broader automatic AI scan.

RESOLUTION
----------
Be explicit:
- do not claim continuous Nifty 500 AI coverage unless it actually exists
- if auto-scan is disabled, expose that state honestly
- provide on-demand/batched analysis
- build a proper background job architecture if broad-universe AI analysis is later required

Do not fake completion.

============================================================
18. RATE LIMITING / COST CONTROL
============================================================

CURRENT ISSUE
-------------
Expensive data endpoints such as enrichment/fundamentals/screener are not protected as consistently as AI calls.

RESOLUTION
----------
Add server-side limits for:
- enrichment
- fundamentals
- screener
- AI
- research
- bulk operations

Use:
- IP/session/user limits where available
- request size limits
- symbol-count limits
- concurrency limits
- caching
- deduplication
- cooldowns
- background jobs for large workloads

Never trust only client-provided rate-limit headers.

Avoid a situation where one user or external caller can trigger hundreds of NSE/Groww/xAI calls.

============================================================
19. DEEP ENRICHMENT MUST SCALE AS A JOB
============================================================

CURRENT ISSUE
-------------
Large enrichment requests are synchronous and bounded by low concurrency.

RESOLUTION
----------
For single-stock:
- synchronous or near-real-time is fine.

For multi-stock:
- create a job
- return job ID
- process in background/queued batches
- expose progress
- persist results
- support retry per symbol
- support partial success

Example:
36 stocks
→ 36 queued
→ 14 complete
→ 3 failed
→ 19 processing

Never make the browser wait for an enormous synchronous request.

============================================================
20. MARKET-DATA PROVIDER ARCHITECTURE
============================================================

CURRENT ISSUE
-------------
Yahoo is currently a major market-data foundation, while Kosh's UI language implies live market data.

RESOLUTION
----------
Abstract market data behind an adapter:

MarketDataProvider:
- quote
- OHLC
- volume
- corporate actions if supported
- exchange
- timestamp
- delayed/live status

Store:
- provider
- exchange
- timestamp
- delay status

Do not claim "live" when the provider is delayed.

Design the adapter so a properly licensed Indian provider can replace the current provider without rewriting charts/screeners.

Do not expose provider limitations as hidden implementation details.

============================================================
21. DATA TIMING / AS-OF CONSISTENCY
============================================================

Every important data block should make clear:
- current market timestamp
- financial reporting period
- shareholding period
- source retrieval time

Avoid combining:
current price
+ old fundamentals
+ older shareholding
+ current news
without showing their periods.

Create an "as of" convention throughout Kosh.

============================================================
22. METRIC METHODOLOGY
============================================================

For important derived metrics, store methodology.

Examples:

OPM:
- reported operating margin, OR
- Kosh-derived operating profit / revenue

ROCE:
- reported company ROCE, OR
- Kosh-derived EBIT / capital employed

CFO/PAT:
- latest comparable period
- explicitly state whether annual/TTM/quarterly

PEG:
- source methodology
- growth period used

Never use ambiguous metric names for derived values.

============================================================
23. AI / DATA FAILURE STATES
============================================================

Every major data/AI operation must have explicit UI states:

Idle
Loading
Partial
Complete
Stale
Failed
Unavailable
Conflicting
Queued

Do not leave blank areas that make users think the app is broken.

For example:

"Interest coverage
Not available from supported sources"

is better than:

"Interest coverage
—"

when the user has requested completeness.

============================================================
24. UX INFORMATION ARCHITECTURE
============================================================

Keep Kosh focused around four jobs:

1. Discover
   Markets + Screener

2. Understand
   Stock page + verified data + AI research

3. Monitor
   Watchlists + Terminal

4. Improve
   Portfolio analytics

Do not keep adding standalone top-level concepts.

Legacy redirects may remain for compatibility, but navigation should not imply redundant products.

============================================================
25. TOOLTIP / ICON RULE
============================================================

Every icon-only control must use the shared tooltip component.

Tooltip must state the actual action:
- Zoom in
- Zoom out
- Go to latest
- Reset view
- Fit chart
- Toggle log scale
- Fullscreen
- Open watchlist
- Increase chart height
- Decrease chart height
- Exit fullscreen
etc.

Do not rely only on aria-label or browser title.

Maintain keyboard accessibility.

============================================================
26. TERMINAL FULLSCREEN QA REQUIREMENTS
============================================================

Before marking complete, actually test:

1. Open Markets → Terminal.
2. Open fullscreen.
3. Verify the entire Terminal workspace enters fullscreen.
4. Open watchlist inside fullscreen.
5. Close watchlist.
6. Resize chart.
7. Change symbol.
8. Switch layout if supported.
9. Use chart navigation.
10. Press Escape.
11. Verify page returns to normal layout.
12. Repeat with a second symbol.
13. Verify no stale overlay remains.
14. Verify no background page scrolling.
15. Verify chart dimensions update correctly.

If browser automation is unavailable, explicitly report runtime verification as BLOCKED rather than claiming PASS.

============================================================
27. STOCK PAGE QA
============================================================

Test with multiple stock types:
- large cap
- mid cap
- small cap
- recently listed stock
- stock with rich filings
- stock with sparse filings
- BSE-oriented symbol
- company with standalone/consolidated differences

Verify:
- initial data appears without manual click
- background enrichment starts
- values update
- provenance is correct
- missing fields are explicit
- no fake zeros
- no infinite retries
- AI can consume the verified evidence bundle

============================================================
28. SCREENER QA
============================================================

Test:
- basic screen
- complex screen
- missing OPM
- missing ROCE
- missing PEG
- missing interest coverage
- multiple missing metrics
- one-row completion
- batch completion
- unsupported metric request
- conflicting source values

Verify:
- missing != pass
- unsupported != silently substituted
- per-row completion works
- completed row updates without refresh
- provenance is available
- screen criteria are not changed silently

============================================================
29. AI QA
============================================================

Test every AI skill for:
- valid output
- malformed JSON
- missing required fields
- unsupported enum
- missing evidence
- timeout
- 429
- provider error
- stale cache
- retry
- repeated request

Verify no malformed/unsupported result reaches the UI as a completed answer.

============================================================
30. DATA-SOURCE QA
============================================================

For every metric family create tests for:
- source available
- source unavailable
- source conflict
- stale source
- different periods
- standalone vs consolidated
- unit mismatch

Example:
Revenue:
₹10,000 crore vs ₹100 billion
must normalize to the same unit.

Do not compare values before normalization.

============================================================
31. SECURITY / ROBUSTNESS
============================================================

Audit:
- all server routes
- request body size
- symbol limits
- URL validation
- SSRF risk in any source URL fetching
- AI prompt injection from retrieved documents/pages
- untrusted web content
- client-supplied AI results
- client-supplied skill results
- rate limiting
- cache poisoning
- malformed JSON
- oversized arrays

Retrieved web text is untrusted input.

Never allow a web page to override Kosh's system rules or source hierarchy.

============================================================
32. PERFORMANCE
============================================================

Do not solve data completeness by blocking page render.

Use:
- caching
- stale-while-revalidate
- deduplication
- batching
- background jobs
- bounded concurrency
- incremental UI updates

Initial stock page should feel instant with cached/basic data.

Deep enrichment should continue independently.

============================================================
33. TESTING
============================================================

Add/update:
- unit tests
- integration tests
- route tests
- data normalization tests
- reconciliation tests
- AI schema tests
- provenance tests
- enrichment tests
- screener tests
- fullscreen/browser tests where supported

At minimum test:
- OPM
- ROCE
- CFO/PAT
- CAGR
- PEG
- shareholding
- source conflicts
- source periods
- consolidated/standalone
- missing metrics
- AI malformed output
- AI retry
- rate limiting
- fullscreen
- terminal watchlist fullscreen
- stock auto-enrichment

Do not hide failing tests or weaken assertions merely to get green.

============================================================
34. NO REGRESSION
============================================================

Preserve and re-test:
- benchmark-adjusted candles
- historical USD adjustment
- chart right-side price axis
- log/linear
- drawing tools
- delete/backspace drawing deletion
- chart navigation
- watchlist sorting
- watchlist persistence
- drag/drop
- Holdings movement-only table
- index/sector/ticker Terminal navigation
- valuation scenario transparency
- portfolio analytics
- existing AI verdict labels and constraints

============================================================
35. UI LANGUAGE
============================================================

Use precise labels.

Replace:
"Load more data"
where appropriate with:
"Complete & verify data"

For screener rows:
"Complete missing data"

For AI:
"✦ AI · Research missing information"

For deterministic retrieval:
"Fetch verified data"

Do not use:
"Full data"
"100% coverage"
"Verified"
unless the implementation actually supports that statement.

============================================================
36. FINAL ACCEPTANCE CRITERIA
============================================================

The implementation is NOT complete merely because code compiles.

Before reporting completion, produce an internal audit table with:

Feature | Previous issue | Root cause | Files changed | Implementation | Test | Browser QA | Status

Status must be one of:
PASS
PARTIAL
FAIL
BLOCKED

A feature may only be PASS if:
- source code is implemented
- data flow is complete
- tests cover it
- runtime/browser behavior has been verified where relevant

If something cannot be verified, say BLOCKED.

Final response must also include:
1. files changed
2. architecture changes
3. data sources used
4. source hierarchy
5. AI skills changed
6. tests run
7. browser QA run
8. known limitations
9. remaining missing data classes
10. exact commands used

Do not claim success simply because the build succeeds.

============================================================
37. MOST IMPORTANT PRODUCT PRINCIPLE
============================================================

Kosh must behave like:

"Everything available appears immediately.
Everything missing is actively and intelligently searched.
Every important number has a source and period.
Every conflict is reconciled or exposed.
AI interprets evidence; it does not invent evidence.
The user can see what Kosh knows, what it calculated, what it researched, and what remains unavailable."

Do not turn Kosh into a slow "click Load Data and wait" application.

The ideal experience is:

OPEN STOCK
→ immediate cached/basic data
→ background verification
→ fields progressively fill
→ user sees provenance
→ missing fields become explicit
→ one-click Complete & Verify
→ deterministic sources first
→ AI research only where necessary
→ final field-by-field status

SCREENER
→ fast universe screen
→ rich available metrics
→ missing fields clearly marked
→ per-stock Complete Missing Data
→ row updates immediately
→ provenance available

TERMINAL
→ true workspace fullscreen
→ optional watchlist drawer inside fullscreen
→ reliable chart resizing
→ all controls named

AI
→ visually recognizable
→ evidence-backed
→ schema-validated
→ source-aware
→ never presented as fact when it is only interpretation

THIS IS AN ARCHITECTURE-CORRECTION TASK, NOT A COSMETIC FEATURE TASK.

Inspect the current code before implementation, reuse working code, fix root causes, and verify the final runtime behavior.
