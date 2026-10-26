# RRG coverage expansion — 24 October 2026

The stock universe is no longer the Nifty 500 list. It is every symbol with at least 60 closes in the TejHQ bhavcopy. The formula is still `kosh-rrg-inspired-wma-v1`.

## Measured stock coverage

| | Count |
|---|---|
| Discoverable names in the registry | 7,657 |
| Series with stored closes | 6,647 |
| Long enough for a rotation (80 or more closes) | 6,554 |
| Closes updated through September 2026 or later | 5,304 |
| NSE symbols seen in the bhavcopy | 4,398 |
| BSE symbols seen in the bhavcopy | 3,031 |
| Written, then marked limited because the span is under five years | 3,742 |
| Stale: the stored close ends before September 2026 | 1,343 |
| Fewer than 60 closes, not stored | 792 |
| Conflicting-close quarantines | 0 |

NSE history in this import runs from 2010 through 23 October 2026. BSE files on the dataset exist only for 2024, 2025, and 2026, so those series are labelled limited. BSE names are stored as `BSE:SYMBOL` and are not merged with the NSE name, even when the ticker matches.

The bhavcopy series codes are EQ, BE, and BZ on NSE, and A, B, and T on BSE. There is no SME series in these files. SME is not a separate universe here.

A symbol that stopped printing before September 2026 is marked stale. That includes names that were delisted or suspended, but the file does not carry an official delisted flag. Symbol-history rows that had no bhavcopy close: none. ISINs are kept. If one symbol shows more than one ISIN, the series is not merged with another symbol.

These are not point-in-time index members.

## Index coverage

Imported and fresh through 23 October 2026, from the authorised aswinv90 files: Nifty 50, 100, 200, 500, Bank, IT, Pharma, Midcap 50, Sensex, and India VIX. India VIX is not a price benchmark. Sector, size, and broad rankings stay separate.

Not imported:

| Source | What was checked | Result |
|---|---|---|
| aswinv90 `data/INDICES` | The directory listing and `index_list.csv` | Only the ten indices above. No Auto, FMCG, Metal, or the rest. |
| tejhq/indian-markets | Dataset file tree | Equity and actions only. No index histories. |
| xxparthparekhxx day parquet, 118 MB, MIT | 159 names that look like indices. Nifty IT was compared with the authorised series on 4,054 overlapping days. | 1,186 days differed by more than 0.2%. The file ends 21 January 2026. Rejected. No index was copied from it. |
| ancap97/NSEDATA4ME data branch | 231 index parquet filenames, including Auto, FMCG, Metal, Financial Services, and the other sector files | The repository is GPL-3 and the data branch has no separate data licence. The files were not copied. They are searchable as licence-blocked. |
| NSE and Nifty Indices report pages | Earlier requests | 403. Not retried. |

217 index names are in the registry as licence-blocked. Searching “Nifty Auto” shows that status and does not plot a substitute.

## What still is not true

The universe is not “all NSE listings from 1991” and not “every current Nifty sector index.” The authorised repository does have older per-symbol NSE and BSE files, one parquet per symbol. Those were not bulk-downloaded. The automatic route is the TejHQ yearly files.

Dividends are still not in the price-return series. Demergers are flagged, not given an invented factor. Tata Motors still stops before 14 October 2025.

## Checks

RRG tests: 34 passed, 0 failed. `tsc --noEmit` passed. `npm run build` passed.
