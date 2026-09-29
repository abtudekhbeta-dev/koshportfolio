# V8 forensic verification

No application code was changed. The notes below are from this pass: the current source, a re-run of the completion and tradebook tests, and interaction with the running app. An earlier write-up of this file was not treated as evidence.

An actual model call was made once, on HDFC Bank, by clicking **Complete missing data for 1** on the stock page. The screener button that says it will complete 2,301 names was not clicked.

| Requirement | PASS | PARTIAL | FAIL | UNVERIFIED | BLOCKED | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Screener one bulk action, no per-row buttons | Y |  |  |  |  | Live screener: “2301 stocks have incomplete displayed data” and one button, “✦ AI Complete missing data for 2301”. The table body had no completion buttons. 150 rows were on the page; the count was 2301. |
| Bulk action processes every incomplete row |  | Y |  |  |  | `completionJobs` is built from `shownAll`, not the 150-row page. `pool` has no stock cap. The 2,301 click was not run. Server limits are 120 enrich and 80 research calls per 10 minutes, so that run cannot finish. While busy, the on-screen list is cut to 8 rows. |
| Actual AI call |  | Y |  |  |  | One real call, HDFC Bank, from the stock button. Provider xAI, model `grok-4.5`, Responses API with `web_search`. Not the 2,301-name action. |
| Every displayed screener metric is in that call |  |  | Y |  |  | Live columns include 3M, 1Y, vs 52w high, RSI, and volume. Those are not in the completion list. VCP sends an empty list. The client then keeps only `missing.slice(0, 8)`. |
| CAGR from annual observations, not a model rate |  | Y |  |  |  | The planner asks for annual history. This pass’s model call did not ask for a CAGR. SUZLON, already on this browser, still has 5Y profit CAGR unavailable because the series is not a clean positive span. |
| Researched facts survive navigation and refresh |  | Y |  |  |  | HDFC facts were still in `localStorage` and on the stock page after leaving and reopening. They are not written to the server company cache. This browser was not signed in. |
| Screener row updates after completion | Y |  |  |  |  | After the HDFC call, the screener row showed ROCE 6.3%, OPM 39.0%, D/E 0.53. |
| Path survives on this device |  | Y |  |  |  | A 2-trade book was still there after navigation and refresh, with the same window numbers. A ~60k-row book cannot be stored. |
| Path on a second signed-in device |  |  |  | Y |  | Not signed in. No second device. |
| Path action is real AI |  |  | Y |  |  | The control is a plain button, “Complete missing Path data”. The line under it says a model is not asked. |
| Path windows are date-based |  | Y |  |  |  | 1W through CAGR showed target and observed dates on the live page. No source is stored on the window. |
| Ticker choice is remembered |  |  | Y |  |  | “Use GMRP&UI” cleared the prompt. After later navigation the stored symbol was `GMRP_UI` and the prompt was back. |
| Two-finger trackpad zoom |  |  |  | Y |  | No physical trackpad. A Chrome pinch-style ctrl+wheel did zoom. A plain wheel did not. |
| Chart stays put while secondary data is elsewhere |  |  | Y |  |  | Overview through Kosh View exist, and they sit in the scrolling column under the chart. |
| Fixed Compact / Standard / Tall | Y |  |  |  |  | Clicked. Tall 720px, compact 420px, standard 560px. |
| Broader terminal visual refresh |  |  | Y |  |  | Not done. |
| Full sync classification and conflict behavior |  | Y |  |  |  | The policy list misses several saved preferences. A holding quantity keeps the remote number with no time check. Not run on two devices. |
| 10k / 50k / 100k tradebook parse | Y |  |  |  |  | Re-run this pass. 301 ms, 1.08 s, 2.30 s. CSV. A sheet that has trades but no holdings is skipped. |
| Mapping survives a second import |  |  | Y |  |  | No saved alias. See the GMRP test. |
| Production runtime |  |  |  |  | Y | `.vercel/output/functions/__server.func/_libs/pglite.data` is missing. Preview was not treated as a running production app. |

## Actual AI test

Stock: HDFC Bank. Control: “✦ AI Complete missing data for 1” on the stock page. The screener’s 2,301 button was not used.

Sequence observed:

1. `POST /api/enrich` with `{"symbols":["HDFCBANK"]}`. Status 200. This is the filing/card pass, not the model.
2. `POST /api/enrich` with:

```json
{"research":{"symbol":"HDFCBANK","missing":["annual cash from operations","EBITDA","OPM","ROCE","D/E","Interest coverage","Pledge"]}}
```

Status 200. `ok: true`. Seven items.

| Metric | Status | Value | Source | What was checked |
| --- | --- | --- | --- | --- |
| annual cash from operations | researched | 113506.38 | HDFC Bank / SEC filing, FY26 | http URL, evidence, period, source name |
| EBITDA | not_found | null | empty | Allowed through with no evidence and no source name |
| OPM | researched | 39.05 | CNBCTV18 | Secondary page, not a filing |
| ROCE | researched | 6.27 | ET Now | Secondary page |
| D/E | researched | 0.53 | Directors’ report via Economic Times | Quote matches the ratio |
| Interest coverage | researched | 1.68 | Goodreturns | Evidence text is “Financial Charges Coverage Ratio”, not interest coverage. The checker did not reject that |
| Pledge | researched | 0 | BSE pledge disclosure | http URL and a pledge quote |

Provider: xAI. Endpoint: `https://api.x.ai/v1/responses`. Model: `grok-4.5`. Tool: `web_search`. Fallback in code is chat completions if that endpoint returns 400, 422, or 404. This call succeeded on the search path (a sourced reply came back).

Validation is `validateResearch` in [src/lib/kosh/research-validate.ts](src/lib/kosh/research-validate.ts). A researched item must have a number, an http(s) URL, evidence of at least 8 characters, a source name, and a period. `not_found` may carry none of those. Nothing compares the evidence sentence to the metric name, so the interest-coverage substitution was stored.

Persistence: `applyResearchToFund` wrote the blanks onto `deepFunds.HDFCBANK` with rank `ai-researched`. EBITDA was not stored. The cash-flow period was stored as the whole phrase “FY26 (year ended 31 Mar 2026)”, and CFO/PAT stayed unavailable. The stock page, after leaving and coming back, said “AI-researched · 0 conflicting · 2 not found”. The screener row then showed ROCE 6.3%, OPM 39.0%, D/E 0.53.

The research branch of `POST /api/enrich` returns the JSON and does not call `upsertCompanyFunds`. The server company cache was not updated. Sign-in was not used, so nothing was synced.

This request had 7 names, so `missing.slice(0, 8)` in [src/lib/kosh/api.ts](src/lib/kosh/api.ts) did not drop one this time. The cut is still there. The stock page asks for every unavailable fact label, not for the columns on the screener. The live screener header was:

Name, Price, Today, P/E, P/B, ROE, ROCE, OPM, D/E, Promoters, Mcap, Sales 1Y, Profit 1Y, Div yield, 3M, 1Y, vs 52w high, RSI 14, Vol vs 20d avg.

3M, 1Y, the 52-week gap, RSI, and volume are drawn and are not in `SCREEN_FUND_FIELDS`. Extra columns (PEG, EPS, book, interest cover, CFO/PAT, pledge, sales 3Y, profit 5Y, FII, DII) are off unless toggled. VCP and breakout set the completion list to `[]`, so the button does not appear. Stake asks only for FII and DII, not the delta columns.

`researchBatches` will split a long ask list, and the unit test checks that helper. `apiResearch` then sends only the first 8 names of each batch. One batch of 24 therefore becomes 8 on the wire. The test never calls `apiResearch`.

## CAGR

`researchPlan` asks for “annual profit history” or “annual sales history” when a growth rate cannot be calculated. It does not ask “what is the 5Y CAGR?”. `applyResearchToFund` stores series points and ignores a model CAGR, then `applyFormulas` runs. A short series, a non-positive print, or mixed periods stays unavailable.

This pass did not ask the model for a CAGR. HDFC’s cash-flow point used a sentence as the period, so the formula did not produce CFO/PAT. SUZLON was already in this browser from an earlier session: profit CAGR 5Y is null, status unavailable, rank `kosh-derived`, with both FY labels and calendar-year points in the profit series, including a negative FY20 print. That is the formula refusing a bad span, not a new model call.

## Path persistence test

A book named Forensic book was already in this browser: TCS and INFY trades, and a GMR holding. After navigation to the screener, HDFC Bank, and back to Path, and after reloads:

- 2 trades still in `kosh-v2`
- Path value still about ₹7,215
- 1W −2.82% through CAGR −15.25%, with the same target and observed dates as before the detour

The small book was not lost on this device. Path NAV is not stored. `loadBook` rebuilds it from trades plus price history. A failed history fetch can look empty even when the trades are still saved.

Large-book limit, measured in this browser with a copy of the saved state, not by replacing the real key:

| Trades | Bytes | Result |
| --- | --- | --- |
| 25,000 | 2,876,281 | stored |
| 40,000 | 4,601,281 | stored |
| 60,000 | 6,901,281 | QuotaExceededError |
| 80,000 | 9,201,281 | QuotaExceededError |

Zustand persist writes the whole `kosh-v2` blob on every update and has no quota handler. If that write throws, the new book stays in memory and the last successful blob is what comes back on refresh. That is a real way for a large Path to disappear. It is not what happened to the 2-trade book.

## Security mapping test

Storage was set to symbol `GMRP&UI` with the name GMR Power and Urban Infra Limited. After load, the page said:

Couldn’t match these names. GMR Power and Urban Infra Limited **GMRP_UI**. Use GMRP&UI.

Clicking Use cleared the prompt. Storage at that moment still said `GMRP&UI`. Zustand only writes storage on rehydrate when a version migration ran ([node_modules/zustand/esm/middleware.mjs](node_modules/zustand/esm/middleware.mjs) writes back only if `migrated`). The in-memory book is still passed through `sanitizeHoldings` → `mergeHoldings` → `baseSym`.

`baseSym` in [src/lib/kosh/sectors.ts](src/lib/kosh/sectors.ts) replaces `&` and `-` with `_`. So every load turns `GMRP&UI` into `GMRP_UI` in memory. The quote lookup then misses, and the prompt offers `GMRP&UI` again. A later store write persisted `GMRP_UI`. After the Path reopen, storage was `["TCS","GMRP_UI"]` and the prompt was back.

Skip is component state only. There is no alias map anywhere in `src`. A genuinely new unmatched name would still ask, because nothing is remembered either way.

Smallest fix: stop `baseSym` from rewriting `&` when a holding is loaded; save imported-name → `GMRP&UI` once, and apply that map at parse time.

## Path AI button

[src/routes/p.$id.path.tsx](src/routes/p.$id.path.tsx) renders a normal button, “Complete missing Path data”. The click only invalidates the book query. The caption is “Refetches market history. A model is not asked for prices or returns.” `usablePathPrice` always returns null, so a model price cannot be applied. That is not an AI completion step.

If the product requires “✦ AI · Complete Path data”, the button has to be the AI control and it still must not invent prices.

## Path windows

Live Path page:

| Window | Return | Target | Observed |
| --- | --- | --- | --- |
| 1W | −2.82% | 2026-09-21 | 2026-09-21 |
| 1M | −11.69% | 2026-08-28 | 2026-08-28 |
| 3M | −1.50% | 2026-06-27 | 2026-06-26 |
| 6M | −14.22% | 2026-03-26 | 2026-03-25 |
| 1Y | −28.89% | 2025-09-28 | 2025-09-26 |
| YTD | −36.22% | 2026-01-01 | 2026-01-01 |
| CAGR | −15.25% | 2024-01-02 | 2026-09-28 |

`WindowObs` has pct, target, observed, status, and reason. It has no source field. `observeWindow` uses the last session at or before the target and does not borrow a later start. A gap of more than 12 days is unavailable.

## Touchpad test

No physical trackpad in this environment. Do not read this as a pass.

On the terminal chart surface (`div.relative.min-h-0`):

- Plain wheel: `defaultPrevented` false. Candle rects stayed 243.
- Wheel with `ctrlKey` (what Chrome sends for a pinch): `defaultPrevented` true. Rects went from 297 to 243. Axis labels had already moved on an earlier pinch-style event (361 rects down to 297).

Shift+wheel is a pan in code. It was not used as a stand-in for two fingers.

Firefox and Safari were not opened. A gesture that does not arrive as ctrl+wheel is still untested.

## Terminal scroll test

Not a visual pass.

- Chart height box is `shrink-0` at the preset height. Intel (Overview, Fundamentals, Valuation, Growth, Ownership, News, Kosh View) is the next block in the same column.
- That column is `overflow-y-auto`. Measured scroll height 934px inside a 553px pane. Scrolling it moves the chart.
- The document itself was not taller than the viewport in this window (720px), so the outer page did not scroll.
- Drag-to-resize is gone. S / M / L set 420, 560, and 720. Symbol stayed on screen. Tall read 720px, compact 420px, standard 560px.

The chart and watchlist are still the main controls. Secondary data was not moved into a drawer. A broader visual refresh was not done.

## Cross-device sync test

Not signed in. Sign in was on the page. No second session was opened. Cross-device Path is unverified.

From [src/lib/kosh/cloud-state.ts](src/lib/kosh/cloud-state.ts), not from a live sync:

| State | Class | Notes |
| --- | --- | --- |
| Portfolios, holdings, trades, benchmark | CLOUD_SYNC | Sample portfolio is left out. Legacy cloud rows are read with `trades: []`. |
| Watchlists and saved screens | CLOUD_SYNC | |
| Chart prefs that are sent (height, interval, log, mode, bench) | CLOUD_SYNC | |
| Desk layout | CLOUD_SYNC | |
| Alerts, journal, book notes | CLOUD_SYNC | |
| AI-researched company facts (`deepFunds`) | CLOUD_SYNC | Only after sign-in. This pass never uploaded them. |
| Drawings, skill reads, recents | LOCAL_ONLY | |
| Raw broker files | NEVER_SYNC | |
| Watchlist sort, overview sort, nav chart prefs, theme | not in the policy | They stay on the device because they are not in the payload. |
| Security mappings | absent | Nothing to sync. |
| Path NAV, windows, CAGR | not stored | Recomputed from trades and prices. |

Conflict rule in code: trades are the union of both devices, matched on symbol, date, side, qty, price, boughtAt, and source. Identical trades are not doubled. Holdings keep the remote quantity when the symbol already exists, and append local-only symbols. There is no timestamp, so a newer quantity on this device can lose to an older saved quantity. Other portfolio fields on the syncing device overwrite the saved copy. A device with no real portfolios, no custom screens, and no researched facts takes the saved prefs and path. That merge was not executed between two signed-in sessions. The unit test covers the trade union only.

## Tradebook

Command:

`npx tsx --test src/lib/kosh/complete.test.ts src/lib/kosh/tradebook-scale.test.ts`

23 passed, 0 failed.

| Case | Time |
| --- | --- |
| 10,000 CSV rows | 301 ms |
| 50,000 | 1.08 s |
| 100,000 | 2.30 s |
| 10,000 as a `File` | 301 ms |

The same file checks repeated headers, `02/01/2024` and `02-Jan-2024` and `2024-01-02`, a blank side, duplicate trade ids, and that a PAN-like preamble is not copied onto the trades.

Spreadsheet code walks every sheet and merges trades, but a sheet is ignored when it produced no holdings. A trades-only sheet can disappear. That path was not run against an Excel file in this pass. Mapping persistence failed, as above.

## Commands

- `npx tsx --test src/lib/kosh/complete.test.ts src/lib/kosh/tradebook-scale.test.ts` — 23 passed.
- App was already serving on port 8080. It was not restarted.
- `ls` of `pglite.data` under the Vercel function output — no such file.

## What the next correction should touch

1. [src/lib/kosh/api.ts](src/lib/kosh/api.ts) — stop `missing.slice(0, 8)` from dropping the rest of a plan. Continue until every requested field has been sent, and say so if a rate limit stops the run.
2. [src/routes/screen.tsx](src/routes/screen.tsx) — build the completion list from the columns actually on screen, including the market columns, VCP, and stake deltas.
3. [src/lib/kosh/sectors.ts](src/lib/kosh/sectors.ts) and `sanitizeHoldings` — stop turning `GMRP&UI` into `GMRP_UI` on load. Persist the confirmed mapping and apply it when a file is parsed.
4. Path completion is not AI. If that action must be AI, it has to call research and it still cannot invent prices.
5. The portfolio persist path needs a quota failure that does not drop a large trade book on refresh.
6. [src/components/terminal/markets-desk.tsx](src/components/terminal/markets-desk.tsx) — the intel tabs are still in the scrolling column under the chart. Wheel handling does not fix that.
