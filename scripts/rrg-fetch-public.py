"""Download public TejHQ NSE bhavcopy parquet and write one raw close file per symbol.

Does not fill missing dates and does not join TATAMOTORS, TMPV, or TMCV.
"""

import hashlib
import json
import os
import urllib.request

import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "rrg", "cache", "tejhq")
OUT = os.path.join(ROOT, "data", "rrg", "extracted")
YEARS = list(range(2016, 2027))
SYMBOLS = ["RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TATAMOTORS", "TMPV", "TMCV"]
DATASET = "https://huggingface.co/datasets/tejhq/indian-markets"

def download(url, dest):
    if os.path.isfile(dest) and os.path.getsize(dest) > 1000:
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    tmp = dest + ".part"
    req = urllib.request.Request(url, headers={"User-Agent": "kosh-rrg-fetch"})
    with urllib.request.urlopen(req, timeout=180) as response, open(tmp, "wb") as handle:
        handle.write(response.read())
    os.replace(tmp, dest)

def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()

def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    files = []
    buckets = {symbol: [] for symbol in SYMBOLS}
    conflicts = []
    for year in YEARS:
        name = f"nse_{year}.parquet"
        dest = os.path.join(CACHE, name)
        url = f"{DATASET}/resolve/main/nse/year={year}/{name}"
        download(url, dest)
        digest = sha256(dest)
        files.append({"name": name, "sha256": digest, "url": url})
        table = pq.read_table(dest, columns=["date", "symbol", "series", "close"])
        picked = table.filter(pc.is_in(table.column("symbol"), value_set=pa.array(SYMBOLS)))
        by_key = {}
        for i in range(picked.num_rows):
            symbol = picked.column("symbol")[i].as_py()
            day = picked.column("date")[i].as_py().isoformat()
            series = picked.column("series")[i].as_py()
            close = picked.column("close")[i].as_py()
            key = (symbol, day)
            current = by_key.get(key)
            if current and current[0] == "EQ" and series != "EQ":
                continue
            if current and current[0] == series and abs(current[1] - close) > 1e-6:
                conflicts.append({"symbol": symbol, "date": day, "close": [current[1], close]})
            if current is None or series == "EQ" or current[0] != "EQ":
                by_key[key] = (series, close)
        for (symbol, day), (series, close) in by_key.items():
            buckets[symbol].append({"date": day, "close": close, "series": series})
    source = {
        "dataset": "tejhq/indian-markets",
        "url": DATASET,
        "licence": "MIT",
        "adjustment": "raw-unadjusted",
        "files": files,
        "note": "Raw NSE bhavcopy close. EQ is used. A BE print is kept only when that symbol has no EQ row that day. Adjusted prices were not applied. TATAMOTORS, TMPV and TMCV are separate series.",
    }
    for symbol, rows in buckets.items():
        rows.sort(key=lambda row: row["date"])
        non_eq = [{"date": row["date"], "series": row["series"]} for row in rows if row["series"] != "EQ"]
        body = {"symbol": symbol, "rows": [{"date": row["date"], "close": row["close"]} for row in rows], "source": {**source, "nonEqDates": non_eq}}
        with open(os.path.join(OUT, f"{symbol}.json"), "w") as handle:
            json.dump(body, handle)
        print(symbol, len(rows), rows[0]["date"] if rows else None, rows[-1]["date"] if rows else None, "non-eq", len(non_eq))
    if conflicts:
        print("CONFLICTS", len(conflicts))
        raise SystemExit(1)

if __name__ == "__main__":
    main()
