# Sector coverage, stock calculation, and the Allcargo case

Updated 25 October 2026. Formula unchanged: `kosh-rrg-inspired-wma-v1` (fast 10, slow 30, momentum 10). This is not the proprietary JdK formula. The calculation repair is in `docs/rrg-calculation-audit.md`.

## Official sectoral indices

The board lists the 34 names on the NSE Indices sectoral menu: the benchmark-code list as of 30 September 2026, plus the 11 sector indices launched on 15 June 2026. Nine have a daily history through 23 October 2026.

| Index | History |
|---|---|
| Nifty Bank, Nifty IT, Nifty Pharma | Authorised index files. Unchanged. |
| Nifty Auto, FMCG, Metal, Financial Services, PSU Bank, Realty | Yahoo daily chart, after that endpoint reproduced the authorised Bank, IT, Pharma, and Nifty 50 closes with no day off by more than 0.1% on the sampled years. |

The other 25 sectoral names are listed and not plotted. Yahoo had no daily history, NSE index files returned 403, and the GPL dataset was not used as a substitute. Nifty Energy has a stored history and is thematic, not one of the 34. Infrastructure, Commodities, CPSE, India Consumption, and India Defence are thematic.

Sixteen current baskets were saved on 24 October 2026 from tracking-fund holdings or a published weight file. They are not the historical index and not the official NSE constituent file. Weights are not an input to the rotation. Every named constituent in those baskets had a stored stock history.

## One calculation

Stocks and sector indices use the same function. The same closes produce the same RS-Ratio and RS-Momentum. Weekly Bank, IT, and Pharma against Nifty 50 on 23 October 2026 remain:

| Series | RS-Ratio | RS-Momentum | Quadrant |
|---|---|---|---|
| Nifty Bank | 101.14305203815246 | 100.11138635665971 | Leading |
| Nifty IT | 103.87453354699102 | 103.84187177873572 | Leading |
| Nifty Pharma | 103.90040479754055 | 99.4806014754173 | Weakening |

Nifty Bank against Sensex on that date is 100.87511382779299. A different benchmark is recalculated.

## Allcargo versus StockCharts, 23 October 2026

Controlled case: ALLCARGO against Nifty 500. The screenshot values near 72 and 112 are a visual estimate. They were not used as a target.

What matched: Nifty 500 close 21427.60, end date 23 October 2026, monthly sampling as the last real close of the month, tail length not entering the formula. The latest close is 9.25 against the screenshot's $9.31. The −4.4% on the card is six monthly closes from 30 April 2026, not the five-year −60.50% column.

The unadjusted monthly reading is RS-Ratio 47.0768 and RS-Momentum 82.0123, Lagging. That was the Kosh screenshot. Daily stays Improving (97.6922 / 102.2388) and weekly stays Leading (108.8116 / 111.4818), because those 30-bar windows start after 12 November 2025.

On 11 November 2025 the close is 33.87 and on 12 November it is 11.88. Nifty 500 was 23836.90 that day. A ratio of those two closes was tried and then removed. It is not a published adjustment factor, and the 87.94/12.06 book-value split is not one either. The monthly coordinate is withheld while that break sits inside the 30-month average. The daily and weekly coordinates are still shown.

Nifty Bank, IT and Pharma weekly against Nifty 50 are unchanged. ALLCARGO is not a Nifty PSU Bank constituent.
