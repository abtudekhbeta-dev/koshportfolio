# Kosh RRG — Stage 1 report

Updated 24 October 2026. Formula: `kosh-rrg-inspired-wma-v1` (not the proprietary JdK formula). The page is described in [rrg-stage-2.md](rrg-stage-2.md). A later pass, recorded in [rrg-full-audit-and-remediation.md](rrg-full-audit-and-remediation.md), keeps these raw extracts and publishes a separate price-return series with verified splits and bonuses removed. The formula did not change.

The three index histories and the seven stock histories are in `data/rrg/store/`. Coverage is `data/rrg/store/coverage.json`.

## Permission

Index files come from [aswinv90/indian-market-historical-data](https://github.com/aswinv90/indian-market-historical-data). The repository licence forbids commercial use, SaaS, and proprietary products without written authorisation. The Kosh owner said, on 24 October 2026, that the author agreed this project may use the data. That statement is the basis for this import. It is not a written licence in the repository, and it is not treated as an unrestricted right to redistribute the files.

Stocks remain the MIT TejHQ parquet already imported. TejHQ still says to verify exchange terms before commercial use.

## What was retrieved

| Series | File | Bytes | SHA-256 |
|---|---|---:|---|
| NIFTY 50 | `data/INDICES/NIFTY_50.parquet` | 232,077 | `6da37a6ab6d8195e…` |
| NIFTY BANK | `data/INDICES/NIFTY_BANK.parquet` | 232,077 | `8cea903bd9f437bd…` |
| NIFTY IT | `data/INDICES/NIFTY_IT.parquet` | 224,834 | `def0eac605996361…` |

The two files of equal size are not the same file. Each begins with the Parquet magic `PAR1`. Columns read from the files, not the README: `Date`, `Open`, `High`, `Low`, `Close`, `Adj Close`, `Volume`. The RRG close is `Close`.

`Adj Close` equals `Close` on Nifty 50 and Nifty IT. On Nifty Bank, 3,763 rows differ by at most 0.52 index points (median 0.20). That is float residue, not a second adjusted history. Nothing was replaced with `Adj Close`.

Command:

```bash
python3 scripts/rrg-fetch-indices.py
node --experimental-strip-types scripts/rrg-publish-store.ts
```

A second publish left `NIFTY 50.json` on the same SHA-256 prefix `2affbc261714`.

## Index validation

| Series | Rows | From | To | Duplicate dates | Invalid closes | Weekday gaps | Dates the other two indices have and this one does not | Day move over 25% |
|---|---:|---|---|---:|---:|---:|---:|---:|
| NIFTY 50 | 4,686 | 2007-09-17 | 2026-10-23 | 0 | 0 | 300 | 16 | 0 |
| NIFTY BANK | 4,701 | 2007-09-17 | 2026-10-23 | 0 | 0 | 284 | 1 | 0 |
| NIFTY IT | 4,701 | 2007-09-17 | 2026-10-23 | 0 | 0 | 284 | 1 | 0 |

All three cover October 2016 through 23 October 2026, so the ten-year window is present. Dates were already in order. No close was filled.

Differences that were kept as published:

- Nifty 50 includes Saturday 1 February 2025 (close 23482.15), the budget session. Bank and IT do not. That day is dropped from a Bank or IT comparison. It is not copied in.
- Bank and IT include 2016-01-01, 2016-08-12, 2018-01-01, and 2019-01-01. Nifty 50 does not. Those days are dropped when Nifty 50 is the benchmark.
- Moves larger than 8% are crash and rebound days (October 2008, 18 May 2009, March 2020). None exceeds 25%.

An older daily file that had already been rejected, because some dates had two prices, overlaps Nifty 50 on 1,889 days from 2016. The median absolute gap is about 0.47%. A few crash days differ by as much as 9%, and 21 January 2026 is 25157.5 here against 25289.9 there. That file is not an official close, so it was not used to overwrite anything. It is also not a confirmation.

## Stocks, confirmed from the store

The stored stock counts match the previous report. They were not edited.

| Symbol | Rows | From | To | Limited |
|---|---:|---|---|---|
| RELIANCE | 2,660 | 2016-01-01 | 2026-10-23 | no |
| HDFCBANK | 2,660 | 2016-01-01 | 2026-10-23 | no |
| ICICIBANK | 2,660 | 2016-01-01 | 2026-10-23 | no |
| INFY | 2,660 | 2016-01-01 | 2026-10-23 | no |
| TATAMOTORS | 2,418 | 2016-01-01 | 2025-10-23 | no |
| TMPV | 242 | 2025-10-24 | 2026-10-23 | yes |
| TMCV | 230 | 2025-11-12 | 2026-10-23 | yes |

`TATAMOTORS` and `TMPV` share no date. `TMCV` remains a separate ISIN. The first ten `TMCV` rows are series `BE`.

Raw jumps over 25% were kept. TejHQ’s action files classify six of them. One does not match an action row:

| Symbol | Date | Move | Action file |
|---|---|---:|---|
| RELIANCE | 2017-09-07 | −50.3% | Bonus 1:1 |
| RELIANCE | 2024-10-28 | −49.8% | Bonus 1:1 |
| HDFCBANK | 2019-09-19 | −49.7% | Face-value split from Rs 2 to Rs 1 |
| HDFCBANK | 2025-08-26 | −50.4% | Bonus 1:1 |
| INFY | 2018-09-04 | −48.6% | Bonus 1:1 |
| TATAMOTORS | 2019-10-29 | +36.0% | No row in the 2019 action file |
| TATAMOTORS | 2025-10-14 | −40.2% | A demerger is recorded that day under `TMPV`, not under `TATAMOTORS` |

The closes were not adjusted.

## Engine check on the stored rows

Against Nifty 50, using the 10/30 weighted-average formula. The first 29 aligned sessions have no RS-Ratio, which is the slow window, not a missing close.

| Series | Aligned sessions | Sessions with a ratio | Last date | Last quadrant |
|---|---:|---:|---|---|
| NIFTY BANK | 4,685 | 4,656 | 2026-10-23 | lagging |
| NIFTY IT | 4,685 | 4,656 | 2026-10-23 | leading |
| RELIANCE | 2,653 | 2,624 | 2026-10-23 | improving |
| HDFCBANK | 2,653 | 2,624 | 2026-10-23 | lagging |
| ICICIBANK | 2,653 | 2,624 | 2026-10-23 | leading |
| INFY | 2,653 | 2,624 | 2026-10-23 | leading |
| TATAMOTORS | 2,411 | 2,382 | 2025-10-23 | lagging |
| TMPV | 242 | 213 | 2026-10-23 | lagging |
| TMCV | 230 | 201 | 2026-10-23 | lagging |

An as-of date of 2020-03-23 stops Reliance before the latest close. `TMPV` and `TMCV` stay marked limited history.

## Tests

```bash
node --experimental-strip-types --test src/lib/kosh/rrg.test.ts src/lib/kosh/rrg-store.test.ts src/lib/kosh/rrg-readiness.test.ts
```

22 tests, 22 passed, 0 failed.

## Still open

- The author’s permission is a statement to the owner, not a written commercial licence in the repo. Do not republish these index files as if the GitHub licence had been waived in general.
- TejHQ’s exchange-terms warning is unchanged.
- Nifty 50 is missing four dates that Bank and IT include, and Bank and IT are missing the 1 February 2025 special session.
- The 29 October 2019 Tata Motors jump has no matching action row.
- The series are raw. Bonus and split jumps are still in the stock closes.
- Quadrant labels above are a reading of this formula on this date. They are not a recommendation.
