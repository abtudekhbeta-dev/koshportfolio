# RRG calculation audit

25 October 2026. Formula unchanged: `kosh-rrg-inspired-wma-v1` (fast 10, slow 30, momentum 10, linear weighted average, newest bar has weight equal to the length). This is not the proprietary JdK formula. StockCharts coordinates are not a fitting target.

## Contract

One function computes RS-Ratio and RS-Momentum for stocks and indices.

- Relative strength at a bar is `100 * price / benchmark` on the aligned bar.
- RS-Ratio is `100 * WMA(RS, 10) / WMA(RS, 30)`.
- RS-Momentum is `100 * RS-Ratio / RS-Ratio 10 bars earlier`.
- A bar inside 1e-8 of 100 is the boundary, not a quadrant.
- Daily bars are session closes. Weekly bars are the last real close in the ISO week. Monthly bars are the last real close in the calendar month, including a month that has not finished. Missing periods are not filled.
- An as-of date drops every later session before the week or month is aggregated.
- Absolute return is the price change over 63 daily, 13 weekly, or 6 monthly bars. It is not a five-year change. Relative return subtracts the benchmark's change over those same bars.
- Cash dividends are not removed. The series is a price return, not a total return.
- Indices keep the published price index. No stock factor is applied to them.
- A split or bonus is applied once, backward, when the series is stored. The newest close does not move. Publishing an extract that is already marked adjusted is refused.
- A bonus and a face-value split named on the same action are one factor, the product of the two ratios. Using only the face-value ratio leaves about half of the gap in the price.
- A demerger is not adjusted unless the action carries a published ratio (`factorBasis: "published-ratio"`). The two session closes are not that ratio. A tax book-value split is not that ratio.
- A factor whose subject says it was derived from an unexplained price step is not applied.
- If an unresolved break of 40% or more sits inside the 30-bar average, that RS-Ratio and RS-Momentum are withheld. The price is still shown. A break outside the average does not withhold the current coordinate.

## Defects found and repaired

1. Combined bonus and face-value split. 23 stored series, including Tech Mahindra (2015-03-19), Titan (2011-06-23), Bajaj Finance (2016-09-08), ONGC (2011-02-08) and National Aluminium, had only the face-value ratio applied. The action sentence also stated a bonus. The missing bonus ratio was applied backward. Tech Mahindra's ex-date step went from about −51% to about −1.9%. The newest close was not changed. One further name, KTIL, was left as stored because the extra bonus ratio did not shrink the already small step.

2. Inferred factors. 77 series, mostly ETFs, had a split factor whose subject said no exchange action was published and the factor was the price step. Those factors were removed. Where the restored step is still 40% or larger, the break is stored as unresolved and withholds any average that contains it.

3. Allcargo. The 12 November 2025 demerger (33.87 to 11.88, Nifty 500 unchanged that session at 23836.90) had been adjusted by 11.88/33.87 because those were the two closes. That ratio was removed. The 23 October 2026 close is still 9.25. Monthly RS-Ratio against Nifty 500 is withheld, because the break sits inside the 30-month average. Daily and weekly windows start after 12 November 2025, so those coordinates are unchanged: daily 97.6922 / 102.2388 Improving, weekly 108.8116 / 111.4818 Leading. The 18 April 2023 demerger stays unadjusted and is outside the current monthly window.

## What was checked and left as it is

- The 10/30/10 weighted-average arithmetic matches a hand-worked series. It was not replaced.
- Nifty Bank, Nifty IT and Nifty Pharma, weekly against Nifty 50 on 23 October 2026, are still 101.14305203815246, 103.87453354699102 and 103.90040479754055.
- Reliance weekly against Nifty 50 is still 97.89679471470224. The same series against Sensex is a different number.
- Reliance, HDFC Bank and Infosys bonuses already closed the ex-date gap. They were not rewritten.
- Large moves of about 25% that match circuit moves were not treated as corporate actions and do not withhold a coordinate.
- No index file has a stock factor. No stored series still has an applied demerger, or an applied factor whose subject says it was derived from the price step.
- The chart, the table and the model request read the same RS-Ratio and RS-Momentum. Tail length does not enter the formula.

## StockCharts

No month of Allcargo's unadjusted monthly path is the screenshot's visual estimate of about 72 and 112. That estimate was not used as a target. The five-year −60.50% column is not the six-month price change shown on the monthly card. JdK smoothing parameters are not published. Parity is not claimed.

## Still unresolved

- Allcargo's demerger needs a published price-adjustment factor before the monthly coordinate can be shown. The book-value split of 87.94 / 12.06 was not used.
- Series with an unresolved break inside the selected 30-bar window stay blank on that timeframe until a published ratio exists.
- Illiquid names still contain day moves above 25% with no matching action. They are flagged, not rewritten.
- Dividend-adjusted total return is a different series and is not what this chart calculates.
