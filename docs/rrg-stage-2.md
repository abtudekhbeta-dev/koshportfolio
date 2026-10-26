# Kosh RRG — Stage 2

The page is `/markets/rotation`. It reads `data/rrg/registry.json` and the analytical series in `data/rrg/store/`.

The plotted universe is the verified one from the remediation pass: Nifty Bank, IT, and Pharma as sectors; Nifty 50, 100, 200, 500, and Sensex as broad benchmarks; Nifty Midcap 50 as a size index; and 501 stored stocks from the August 2026 Nifty 500 list. India VIX is stored and is not a price benchmark. Thirteen other sector indices are searchable as unavailable. See [rrg-full-audit-and-remediation.md](rrg-full-audit-and-remediation.md).

## Calculation

`kosh-rrg-inspired-wma-v1`, lengths 10, 30, and 10. Not the proprietary JdK formula.

Stock closes used on the chart are price-return closes: verified splits and bonuses are adjusted backward, and the newest close is the traded close. Cash dividends are not adjusted. The indices are price indices, so the comparison is price against price.

A week is the last daily close in that ISO week. A month is the last daily close in that calendar month. A missing period is skipped. An as-of date drops later closes before the bar is formed.

## Licence

Index files are used because the author agreed with the Kosh owner on 24 October 2026. The repository licence still asks for written commercial authorisation, and that writing is not in the repo.
