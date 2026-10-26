"""Expand the RRG store from the cached TejHQ equity files and the authorised index files.

Raw closes are written to data/rrg/extracted. Adjustment happens in the TypeScript publisher.
No missing close is filled. A symbol with two different closes on one date is quarantined.
"""

import hashlib
import json
import os
import re
from collections import defaultdict
from datetime import datetime

import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "rrg", "cache")
OUT = os.path.join(ROOT, "data", "rrg", "extracted")
INDEX_NOTE = (
    "Close is the price index. Authorised for Kosh by the dataset author on 24 Oct 2026. "
    "The repository licence still prohibits commercial use without written authorisation; that written grant is not in this repository."
)

INDICES = [
    ("NIFTY 50", "NIFTY_50.parquet", "Nifty 50", "broad", None, True),
    ("NIFTY 100", "NIFTY_100.parquet", "Nifty 100", "broad", None, True),
    ("NIFTY 200", "NIFTY_200.parquet", "Nifty 200", "broad", None, True),
    ("NIFTY 500", "NIFTY_500.parquet", "Nifty 500", "broad", None, True),
    ("SENSEX", "SENSEX.parquet", "S&P BSE Sensex", "broad", None, True),
    ("NIFTY MIDCAP 50", "NIFTY_MIDCAP_50.parquet", "Nifty Midcap 50", "size", None, True),
    ("NIFTY BANK", "NIFTY_BANK.parquet", "Nifty Bank", "sector", "Financials", True),
    ("NIFTY IT", "NIFTY_IT.parquet", "Nifty IT", "sector", "IT", True),
    ("NIFTY PHARMA", "NIFTY_PHARMA.parquet", "Nifty Pharma", "sector", "Healthcare", True),
    ("INDIA VIX", "INDIA_VIX.parquet", "India VIX", "volatility", None, False),
]

BLOCKED = [
    {
        "symbol": name,
        "name": name,
        "category": "sector",
        "status": "unavailable",
        "reason": "Not in the authorised index files. The NSE report pages returned 403. NSEDATA4ME is GPL-3 and was not copied into Kosh.",
    }
    for name in [
        "Nifty Auto",
        "Nifty Financial Services",
        "Nifty FMCG",
        "Nifty Healthcare",
        "Nifty Media",
        "Nifty Metal",
        "Nifty PSU Bank",
        "Nifty Private Bank",
        "Nifty Realty",
        "Nifty Consumer Durables",
        "Nifty Oil & Gas",
        "Nifty Chemicals",
        "Nifty Capital Markets",
    ]
]


def read_universe():
    text = open(os.path.join(ROOT, "src/lib/kosh/nifty500.ts"), encoding="utf-8").read()
    names = dict(re.findall(r'symbol: "([^"]+)", name: "([^"]+)"', text))
    sectors = dict(re.findall(r'"([^"]+)": "([^"]+)"', open(os.path.join(ROOT, "src/lib/kosh/nse-sectors.ts"), encoding="utf-8").read()))
    for symbol, name in [("TATAMOTORS", "Tata Motors"), ("TMPV", "Tata Motors Passenger Vehicles"), ("TMCV", "Tata Motors Commercial Vehicles")]:
        names.setdefault(symbol, name)
    return names, sectors


def load_actions(symbols):
    out = defaultdict(list)
    folder = os.path.join(CACHE, "tejhq")
    for name in sorted(os.listdir(folder)):
        if not name.startswith("actions_nse_"):
            continue
        table = pq.read_table(os.path.join(folder, name))
        wanted = pc.is_in(table.column("symbol"), value_set=pa.array(list(symbols)))
        sub = table.filter(wanted)
        for i in range(sub.num_rows):
            day = sub.column("ex_date")[i].as_py()
            if day is None:
                continue
            out[sub.column("symbol")[i].as_py()].append(
                {
                    "date": day.isoformat(),
                    "type": sub.column("type")[i].as_py() or "",
                    "ratioNum": sub.column("ratio_num")[i].as_py(),
                    "ratioDen": sub.column("ratio_den")[i].as_py(),
                    "faceFrom": sub.column("face_value_from")[i].as_py(),
                    "faceTo": sub.column("face_value_to")[i].as_py(),
                    "subject": sub.column("raw_subject")[i].as_py() or "",
                }
            )
    return out


def breaks_for(symbol):
    if symbol == "TATAMOTORS":
        return [
            {
                "date": "2025-10-14",
                "reason": "A demerger is recorded on TMPV on 2025-10-14. No factor is applied. Tata Motors closes on and after that date are left out of its analytical series.",
            }
        ]
    return []


def write_index(symbol, filename, title, category, sector, benchmark):
    path = os.path.join(CACHE, "indices", filename)
    blob = open(path, "rb").read()
    if blob[:4] != b"PAR1":
        return {"symbol": symbol, "status": "unavailable", "reason": f"{filename} is not parquet"}
    table = pq.read_table(path, columns=["Date", "Close", "Adj Close"])
    seen = {}
    conflict = None
    ordered = True
    last = ""
    differ = 0
    for i in range(table.num_rows):
        day = table.column("Date")[i].as_py().date().isoformat()
        close = table.column("Close")[i].as_py()
        adj = table.column("Adj Close")[i].as_py()
        if adj is not None and close is not None and abs(adj - close) > 1:
            differ += 1
        if last and day < last:
            ordered = False
        last = day
        if day in seen and abs(seen[day] - close) > 1e-6:
            conflict = day
        else:
            seen[day] = close
    if conflict or not ordered:
        return {"symbol": symbol, "status": "quarantine", "reason": f"conflicting or unordered close at {conflict}"}
    rows = [{"date": day, "close": seen[day]} for day in sorted(seen)]
    body = {
        "symbol": symbol,
        "rows": rows,
        "actions": [],
        "breaks": [],
        "meta": {
            "name": title,
            "category": category,
            "sector": sector,
            "kind": "stock" if category == "stock" else category if category != "broad" else "index",
            "benchmark": benchmark,
            "limited": False,
            "membership": "Index level as published. Not reconstructed from constituents.",
            "returnConvention": "price-index",
            "source": {
                "dataset": "aswinv90/indian-market-historical-data",
                "url": f"https://raw.githubusercontent.com/aswinv90/indian-market-historical-data/main/data/INDICES/{filename}",
                "licence": "non-commercial-with-author-permission-for-kosh",
                "adjustment": "raw-unadjusted",
                "files": [{"name": filename, "sha256": hashlib.sha256(blob).hexdigest()}],
                "note": INDEX_NOTE,
                "closeField": "Close",
                "sourceSymbol": filename.replace(".parquet", ""),
            },
        },
    }
    # kind cleanup
    body["meta"]["kind"] = {"sector": "sector", "size": "size", "volatility": "volatility", "broad": "index"}.get(category, category)
    with open(os.path.join(OUT, f"{symbol}.json"), "w") as handle:
        json.dump(body, handle)
    print(symbol, len(rows), rows[0]["date"], rows[-1]["date"], "adj-gap", differ)
    return {"symbol": symbol, "status": "imported", "rows": len(rows), "from": rows[0]["date"], "to": rows[-1]["date"]}


def main():
    os.makedirs(OUT, exist_ok=True)
    names, sectors = read_universe()
    symbols = set(names)
    actions = load_actions(symbols)
    buckets = {symbol: {} for symbol in symbols}
    non_eq = defaultdict(int)
    conflicts = {}
    folder = os.path.join(CACHE, "tejhq")
    for year in range(2016, 2027):
        path = os.path.join(folder, f"nse_{year}.parquet")
        if not os.path.isfile(path):
            print("missing year", year)
            continue
        table = pq.read_table(path, columns=["date", "symbol", "series", "close"])
        sub = table.filter(pc.is_in(table.column("symbol"), value_set=pa.array(list(symbols))))
        print("year", year, "rows", sub.num_rows)
        for i in range(sub.num_rows):
            symbol = sub.column("symbol")[i].as_py()
            if symbol in conflicts:
                continue
            day = sub.column("date")[i].as_py().isoformat()
            close = sub.column("close")[i].as_py()
            series = sub.column("series")[i].as_py() or ""
            if close is None or close <= 0:
                continue
            slot = buckets[symbol]
            prior = slot.get(day)
            if prior is None:
                slot[day] = (close, series)
            elif prior[1] != "EQ" and series == "EQ":
                slot[day] = (close, series)
            elif prior[1] == series and abs(prior[0] - close) > 1e-6:
                conflicts[symbol] = day
                buckets[symbol] = {}
            elif prior[1] == "EQ" and series != "EQ":
                continue
            elif abs(prior[0] - close) > 1e-6:
                conflicts[symbol] = day
                buckets[symbol] = {}
        del table, sub
    quarantine = []
    imported = []
    missing = []
    for symbol, title in sorted(names.items()):
        if symbol in conflicts:
            quarantine.append({"symbol": symbol, "name": title, "category": "stock", "status": "quarantine", "reason": f"Two closes on {conflicts[symbol]}."})
            continue
        slot = buckets.get(symbol) or {}
        if len(slot) < 60:
            missing.append({"symbol": symbol, "name": title, "category": "stock", "sector": sectors.get(symbol), "status": "unavailable", "reason": f"{len(slot)} usable closes in the cached bhavcopy. Not invented."})
            continue
        rows = [{"date": day, "close": slot[day][0]} for day in sorted(slot)]
        for day in slot:
            if slot[day][1] != "EQ":
                non_eq[symbol] += 1
        first, last = rows[0]["date"], rows[-1]["date"]
        span = (datetime.fromisoformat(last) - datetime.fromisoformat(first)).days / 365.25
        body = {
            "symbol": symbol,
            "rows": rows,
            "actions": actions.get(symbol, []),
            "breaks": breaks_for(symbol),
            "meta": {
                "name": title.replace(" Ltd.", ""),
                "category": "stock",
                "sector": sectors.get(symbol),
                "kind": "stock",
                "benchmark": False,
                "limited": span < 5,
                "membership": "Current Nifty 500 names as of 2026-08-31, applied to historical prices. Not point-in-time index membership.",
                "returnConvention": "raw-bhavcopy-close",
                "nonEqDates": non_eq[symbol],
                "source": {
                    "dataset": "tejhq/indian-markets",
                    "url": "https://huggingface.co/datasets/tejhq/indian-markets",
                    "licence": "MIT pipeline. Exchange bhavcopy. Verify exchange terms before commercial use.",
                    "adjustment": "raw-unadjusted",
                    "files": [{"name": f"nse_{year}.parquet", "sha256": ""} for year in range(2016, 2027)],
                    "note": "EQ close when both EQ and another series exist. No close was filled.",
                    "closeField": "close",
                },
            },
        }
        with open(os.path.join(OUT, f"{symbol}.json"), "w") as handle:
            json.dump(body, handle)
        imported.append(symbol)
    for spec in INDICES:
        result = write_index(*spec)
        if result["status"] != "imported":
            quarantine.append({"symbol": spec[0], "name": spec[2], "category": spec[3], "status": result["status"], "reason": result["reason"]})
    with open(os.path.join(ROOT, "data", "rrg", "quarantine.json"), "w") as handle:
        json.dump({"quarantine": quarantine, "unavailable": missing, "blocked": BLOCKED}, handle)
    print("imported stocks", len(imported), "missing", len(missing), "quarantine", len(quarantine))


if __name__ == "__main__":
    main()
