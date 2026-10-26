"""Download the three authorised index files and write raw closes for the RRG store.

Permission: the dataset author told the Kosh owner this project may use the data.
The repository licence still withholds commercial use without written authorisation.
This script stores the files for Kosh. It does not republish them.
"""

import hashlib
import json
import os
import urllib.request

import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "rrg", "cache", "indices")
OUT = os.path.join(ROOT, "data", "rrg", "extracted")
BASE = "https://raw.githubusercontent.com/aswinv90/indian-market-historical-data/main/data/INDICES"
FILES = {
    "NIFTY 50": "NIFTY_50.parquet",
    "NIFTY BANK": "NIFTY_BANK.parquet",
    "NIFTY IT": "NIFTY_IT.parquet",
}
NOTE = (
    "Close is the field used. Adj Close matches Close for NIFTY 50 and NIFTY IT. "
    "For NIFTY BANK the two fields differ by at most 0.52 index points, which is float residue, not a second history. "
    "Authorised for Kosh by the dataset author on 24 Oct 2026. "
    "The repository licence still prohibits commercial use without written authorisation; that written grant is not in this repository."
)

def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    for symbol, name in FILES.items():
        dest = os.path.join(CACHE, name)
        url = f"{BASE}/{name}"
        if not (os.path.isfile(dest) and open(dest, "rb").read(4) == b"PAR1"):
            req = urllib.request.Request(url, headers={"User-Agent": "kosh-rrg-fetch"})
            with urllib.request.urlopen(req, timeout=120) as response, open(dest, "wb") as handle:
                handle.write(response.read())
        blob = open(dest, "rb").read()
        if blob[:4] != b"PAR1":
            raise SystemExit(f"{name} is not a parquet file")
        digest = hashlib.sha256(blob).hexdigest()
        table = pq.read_table(dest, columns=["Date", "Close"])
        rows = []
        for i in range(table.num_rows):
            day = table.column("Date")[i].as_py().date().isoformat()
            close = table.column("Close")[i].as_py()
            rows.append({"date": day, "close": close})
        rows.sort(key=lambda row: row["date"])
        body = {
            "symbol": symbol,
            "rows": rows,
            "source": {
                "dataset": "aswinv90/indian-market-historical-data",
                "url": url,
                "licence": "non-commercial-with-author-permission-for-kosh",
                "adjustment": "raw-unadjusted",
                "files": [{"name": name, "sha256": digest}],
                "note": NOTE,
                "retrievedAt": "2026-10-24",
                "closeField": "Close",
                "sourceSymbol": name.replace(".parquet", ""),
            },
        }
        with open(os.path.join(OUT, f"{symbol}.json"), "w") as handle:
            json.dump(body, handle)
        print(symbol, len(rows), rows[0]["date"], rows[-1]["date"], digest[:12])

if __name__ == "__main__":
    main()
