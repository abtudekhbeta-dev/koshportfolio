# RRG manual import

No instrument has verified history. The commands below only read files you download yourself. They do not connect to NSE, Nifty Indices, or any paid feed, and they do not fill a missing close.

Checked on 24 October 2026. Automated requests to the three official pages still return 403 from this host, so the date-range behaviour below is **not** confirmed by a download.

## What the importer accepts

Checked in [src/lib/kosh/rrg-import.ts](src/lib/kosh/rrg-import.ts).

| Layout | Required columns | Identifier | Series filter |
|---|---|---|---|
| `nifty-indices-historical` | `Date`, `Close`. Optional `Open`, `High`, `Low` | None inside the file. You must name it in `manifest.json` | — |
| `nifty-indices-historical` | `Index Name`, `Date`, `Close` | The `Index Name` cell, kept exactly | — |
| `nse-security-wise` | `Symbol`, `Series`, `Date`, `Close Price` | `Symbol`, exact | `EQ` only. `Prev Close` is ignored |
| `nse-cm-bhavcopy` | `SYMBOL`, `SERIES`, `CLOSE`, `TIMESTAMP` | `SYMBOL` | `EQ` only |
| `nse-udiff-bhavcopy` | `TckrSymb`, `SctySrs`, `ClsPric`, `TradDt` | `TckrSymb` | `EQ` only |

Dates that parse: `YYYY-MM-DD`, `DD-MM-YYYY`, `DD/MM/YYYY`, `DD-MMM-YYYY`, `DD MMM YYYY`. A title line before the header is skipped if the next line is one of these headers. Anything else is rejected.

A blank close, a zero, or a negative is dropped and counted. A later close is never copied backwards. Two files with the same symbol and date are kept once if the closes match, and the symbol is rejected if they differ.

## Download these first

Request **24 Oct 2016 through 24 Oct 2026** in one export. If the form will not accept that, take the longest single range it allows and download the next chunk with no overlap you have not checked. Do not download one file per day.

| Instrument | Page | What to select | File to save | Importer |
|---|---|---|---|---|
| Nifty 50 | [Nifty Indices historical reports](https://www.niftyindices.com/reports) | Historical Index Data. Equity. The Nifty 50 price index, not the Total Return index | `NIFTY_50.csv` | Reads `Date,Close` directly. The file usually has no index name, so the manifest below is required |
| Nifty Bank | Same page | Nifty Bank price index | `NIFTY_BANK.csv` | Same |
| Nifty IT | Same page | Nifty IT price index | `NIFTY_IT.csv` | Same |
| Reliance Industries | [NSE security-wise price volume](https://www.nseindia.com/report-detail/eq_security) | Symbol `RELIANCE`, series `EQ` | `RELIANCE.csv` | Reads `Close Price` directly |
| HDFC Bank | Same page | `HDFCBANK`, `EQ` | `HDFCBANK.csv` | Same |
| ICICI Bank | Same page | `ICICIBANK`, `EQ` | `ICICIBANK.csv` | Same |
| Infosys | Same page | `INFY`, `EQ` | `INFY.csv` | Same |
| Tata Motors | Same page | Whichever symbol the page shows | The symbol as the filename | See below |

The public form on the Nifty Indices page is a from-and-to period with a CSV control. A 2024 description of that form used a multi-year range in one request. This was **not** repeated here. NSE’s data-sharing list of 28 July 2025 puts bulk historical bhavcopy (the daily archive, often one zip per session) in a chargeable “voluminous data” basket: [NSE data-sharing policy PDF](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/Data%20list%20under%20NSE%20Data%20Sharing%20Policy%20for%20Research%20and%20Analysis_20250728.pdf). That is not the route. Ten years of daily bhavcopies would be about 2,500 files, and this import does not make that acceptable.

The security-wise page shows one symbol, a date period, and `Download (.csv)`, with columns `Symbol`, `Date`, `Series`, `Close Price`. The longest period that form will actually return was **not** tested.

Tata Motors is not one series in the local NSE list dated 31 Aug 2026. That list has `TMCV` (Tata Motors Limited) and `TMPV` (Tata Motors Passenger Vehicles Limited), and it has no `TATAMOTORS`. Download the symbol the official page offers. Do not rename it and do not join it to another symbol. A pre-demerger file, if you still have one, stays under the symbol printed in that file.

Use the price index, not the Total Return index. These files are raw closes. Splits and demergers are not adjusted. A jump above 25% is reported and left as it is.

## Manifest

Create `data/rrg/inbox/manifest.json`:

```json
{
  "files": [
    { "file": "NIFTY_50.csv", "symbol": "NIFTY 50", "sourceUrl": "https://www.niftyindices.com/reports", "retrievedAt": "2026-10-24" },
    { "file": "NIFTY_BANK.csv", "symbol": "NIFTY BANK", "sourceUrl": "https://www.niftyindices.com/reports", "retrievedAt": "2026-10-24" },
    { "file": "NIFTY_IT.csv", "symbol": "NIFTY IT", "sourceUrl": "https://www.niftyindices.com/reports", "retrievedAt": "2026-10-24" }
  ]
}
```

Put the eight CSV files in `data/rrg/inbox/`. Stock files name themselves from the `Symbol` column, so they do not need a manifest line. If an index file already has an `Index Name` column, that cell is kept and a different manifest symbol will not rename it.

A `.csv` inside a `.zip`, or a `.csv.gz`, is read as well. A zip is only for a file you already downloaded. It is not a way to fetch one.

## Command

```bash
mkdir -p data/rrg/inbox
node --experimental-strip-types scripts/rrg-import.ts --inbox data/rrg/inbox --out data/rrg/store
```

This writes one JSON file per symbol and `data/rrg/store/coverage.json`. The coverage file lists row count, first date, last date, span, weekday gaps, invalid closes, jumps, and the source file names. `limitedHistory` is true when the span is under five years or the file has fewer than 1,200 closes. Exit code 1 means at least one file failed. Read the `failures` array. Do not treat a successful run as verified history until you open the JSON and check the first and last rows against the CSV.

Running the same command again overwrites the store from the inbox. It does not invent dates that were not in the files.

## Still unresolved

- No official file was imported in this step. Coverage of the pilot universe is zero.
- Whether Nifty Indices or the security-wise page will return ten years in one CSV is untested.
- Terms of redistribution were not readable from this host. Keep the downloads local.
- Stage 2 has not been started.
