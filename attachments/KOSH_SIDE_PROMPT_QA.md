# Kosh — Side Prompt / Implementation QA

Use this AFTER the main implementation pass.

Do a second independent audit of the current repository against the master prompt. Assume some requirements may have been partially implemented or accidentally regressed.

## Do not give a generic summary.

For EVERY item below, inspect the actual code and classify it as:

- PASS — implemented correctly
- PARTIAL — implemented but incomplete/incorrect
- FAIL — not implemented
- BLOCKED — genuinely impossible because of an external/data limitation

Then fix every PARTIAL/FAIL item that is within the repository's control.

### Checklist

1. NSE+BSE canonical security master
2. Reverse valuation is primary; no arbitrary 12% core assumption
3. No silent growth = 0 fallback
4. Growth evidence stack is separate from forecast
5. "Load data" remains the user-facing wording
6. Load data actually attempts missing-field/financial-series enrichment
7. Screener exposes normal metrics including ROCE/OPM when available
8. Benchmark-adjusted chart mode in stock chart
9. Benchmark-adjusted chart mode in Terminal
10. Indexed-to-100 relative performance
11. USD-adjusted chart mode in stock chart
12. USD-adjusted chart mode in Terminal
13. Historical USDINR conversion where possible
14. Sector click opens correct sector index chart
15. Market Overview holdings has All/individual portfolio selector
16. Market Overview holdings stays embedded; no unnecessary Holdings-page navigation
17. Market Overview watch stays embedded; no unnecessary Watch-page navigation
18. Terminal has drag ordering, no up/down arrows
19. Terminal row has only rightmost × remove control
20. Header columns align exactly with rows
21. Terminal sort key/direction persists per list
22. Chart wheel zoom is cursor-anchored
23. Zoom out expands around current viewport
24. Horizontal pan/navigation preserves position
25. Go-to-latest control exists
26. Reset View resets viewport/autoscale without wiping configuration
27. Bottom chart navigation strip exists
28. Chart height control restored
29. Default chart height is materially taller than current 420px
30. Fullscreen uses actual browser fullscreen where possible
31. Crosshair is smooth and does not trigger expensive React rerenders per pointermove
32. Hover shows historical date + OHLC + right-axis price
33. Gridlines are extremely subtle
34. Long/Short validates directional geometry
35. Drawing undo/redo is real state history
36. Existing patterns remain optional and non-predictive
37. Nifty 50 benchmark numbers populate reliably in Companies vs Nifty 50
38. Broker files are parsed locally and original files are not uploaded for parsing
39. Cloud portfolio data is explicitly user-scoped
40. AI payloads minimize sensitive portfolio information
41. No unsupported privacy/encryption claims
42. Mobile/responsive behavior remains intact
43. Existing functionality has not been unnecessarily removed
44. Tests added/updated for changed logic
45. Typecheck/lint/build/test status is honestly reported

## Then run a regression pass

Specifically test these user journeys:

### Journey A — Stock chart
Open a stock → zoom → pan → zoom around cursor → scroll historically → hover candle → click Go to latest → Reset View → change height → fullscreen → exit fullscreen.

### Journey B — Relative performance
Open stock → Benchmark mode → Nifty 50 indexed to 100 → change timeframe → verify both series remain aligned → switch back to Price.

### Journey C — USD
Open stock → USD mode → verify historical FX handling → switch back to Price.

### Journey D — Terminal
Open Terminal → sort by Chg % → leave page → reopen → confirm sort restored → drag row → remove with × → verify header alignment.

### Journey E — Market Overview
Open Holdings → All → individual portfolio → open stock → return → Watch list selector → sector click → sector index chart.

### Journey F — Company data
Open a company with missing metrics → Load data → verify additional supported fields/financial history are attempted → verify existing values are not overwritten by null.

### Journey G — Screener
Open Screener → add ROCE/OPM-related filters → verify available stocks do not unnecessarily show unavailable.

### Journey H — Privacy
Upload a broker CSV/XLSX → verify parsing works without uploading the original file → verify cloud/local disclosure → verify AI requests do not contain unnecessary sensitive fields.

Finally, output a concise table of all 45 checklist items and their final status, plus the files changed during the QA fixes.
