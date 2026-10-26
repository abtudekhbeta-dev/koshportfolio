"""Import every TejHQ bhavcopy symbol that has a usable close history.

NSE and BSE series stay separate. A later symbol that reuses a ticker is not merged.
Conflicting closes on one date are dropped, and a symbol with many of them is quarantined.
Index levels are not taken from the xxparth file: its Nifty IT closes do not match the
authorised series. The NSEDATA4ME index files are listed and not copied, because that
repository is GPL-3 and has no separate data licence.
"""

import json
import os
import re
import sqlite3
from collections import defaultdict

import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "rrg", "cache", "tejhq")
OUT = os.path.join(ROOT, "data", "rrg", "extracted")
DB = os.path.join(ROOT, "data", "rrg", "cache", "universe.sqlite")
MIN_ROWS = 60
CONFLICT_LIMIT = 25

KEEP_INDEXES = {
    "NIFTY 50", "NIFTY 100", "NIFTY 200", "NIFTY 500", "SENSEX",
    "NIFTY MIDCAP 50", "NIFTY BANK", "NIFTY IT", "NIFTY PHARMA", "INDIA VIX",
}


def sectors():
    text = open(os.path.join(ROOT, "src/lib/kosh/nse-sectors.ts"), encoding="utf-8").read()
    return dict(re.findall(r'"([^"]+)": "([^"]+)"', text))


def connect():
    if os.path.exists(DB):
        os.remove(DB)
    db = sqlite3.connect(DB)
    db.execute("PRAGMA journal_mode=OFF")
    db.execute("PRAGMA synchronous=OFF")
    db.execute("""CREATE TABLE px (
        exchange TEXT, symbol TEXT, date TEXT, close REAL, series TEXT, isin TEXT, name TEXT,
        PRIMARY KEY (exchange, symbol, date))""")
    db.execute("CREATE TABLE bad (exchange TEXT, symbol TEXT, date TEXT, PRIMARY KEY (exchange, symbol, date))")
    return db


def load_prices(db, path, exchange):
    table = pq.read_table(path, columns=["date", "symbol", "series", "isin", "name", "close"])
    stage = {}
    n = table.num_rows
    dates = table.column("date")
    symbols = table.column("symbol")
    series = table.column("series")
    isins = table.column("isin")
    names = table.column("name")
    closes = table.column("close")
    for i in range(n):
        close = closes[i].as_py()
        symbol = symbols[i].as_py()
        day = dates[i].as_py()
        if not symbol or day is None or close is None or close <= 0:
            continue
        key = (symbol, day.isoformat())
        row = (float(close), series[i].as_py() or "", isins[i].as_py() or "", names[i].as_py() or "")
        prior = stage.get(key)
        if prior is None:
            stage[key] = row
        elif prior[1] != "EQ" and row[1] == "EQ":
            stage[key] = row
        elif abs(prior[0] - row[0]) > 0.01 and (prior[1] == row[1] or prior[1] == "EQ"):
            stage.pop(key, None)
            db.execute("INSERT OR IGNORE INTO bad VALUES (?,?,?)", (exchange, symbol, key[1]))
    rows = [(exchange, symbol, day, close, ser, isin, name) for (symbol, day), (close, ser, isin, name) in stage.items()]
    db.executemany("INSERT OR IGNORE INTO px VALUES (?,?,?,?,?,?,?)", rows)
    print(exchange, os.path.basename(path), "kept", len(rows))


def load_actions(db):
    db.execute("CREATE TABLE actions (exchange TEXT, symbol TEXT, date TEXT, type TEXT, ratio_num REAL, ratio_den REAL, face_from REAL, face_to REAL, subject TEXT)")
    for name in sorted(os.listdir(CACHE)):
        if not name.startswith("actions_"):
            continue
        exchange = "BSE" if name.startswith("actions_bse_") else "NSE"
        table = pq.read_table(os.path.join(CACHE, name))
        rows = []
        for i in range(table.num_rows):
            day = table.column("ex_date")[i].as_py()
            symbol = table.column("symbol")[i].as_py()
            if day is None or not symbol:
                continue
            rows.append((
                exchange, symbol, day.isoformat(), table.column("type")[i].as_py() or "",
                table.column("ratio_num")[i].as_py(), table.column("ratio_den")[i].as_py(),
                table.column("face_value_from")[i].as_py(), table.column("face_value_to")[i].as_py(),
                table.column("raw_subject")[i].as_py() or "",
            ))
        db.executemany("INSERT INTO actions VALUES (?,?,?,?,?,?,?,?,?)", rows)
    db.execute("CREATE INDEX actions_i ON actions(exchange, symbol)")


def breaks(symbol):
    if symbol == "TATAMOTORS":
        return [{"date": "2025-10-14", "reason": "A demerger is recorded on TMPV on 2025-10-14. No factor is applied. Tata Motors closes on and after that date are left out of its analytical series."}]
    return []


def write_symbol(db, exchange, symbol, sector, bad_count):
    key = symbol if exchange == "NSE" else f"BSE:{symbol}"
    if key in KEEP_INDEXES:
        return "kept-index"
    rows = db.execute("SELECT date, close, series, isin, name FROM px WHERE exchange=? AND symbol=? ORDER BY date", (exchange, symbol)).fetchall()
    if len(rows) < MIN_ROWS:
        return "short"
    if bad_count > CONFLICT_LIMIT:
        return "quarantine"
    isins = sorted({row[3] for row in rows if row[3]})
    name = next((row[4] for row in reversed(rows) if row[4]), symbol)
    series_counts = defaultdict(int)
    for row in rows:
        series_counts[row[2]] += 1
    board = "main" if series_counts.get("EQ") else "trade-for-trade" if series_counts.get("BE") else "other"
    actions = [
        {"date": a[0], "type": a[1], "ratioNum": a[2], "ratioDen": a[3], "faceFrom": a[4], "faceTo": a[5], "subject": a[6]}
        for a in db.execute("SELECT date, type, ratio_num, ratio_den, face_from, face_to, subject FROM actions WHERE exchange=? AND symbol=? ORDER BY date", (exchange, symbol))
    ]
    body = {
        "symbol": key,
        "rows": [{"date": row[0], "close": row[1]} for row in rows],
        "actions": actions,
        "breaks": breaks(symbol if exchange == "NSE" else ""),
        "meta": {
            "name": name.replace(" Ltd.", ""),
            "category": "stock",
            "sector": sector.get(symbol) if exchange == "NSE" else None,
            "kind": "stock",
            "benchmark": False,
            "limited": False,
            "exchange": exchange,
            "board": board,
            "isin": isins[-1] if len(isins) == 1 else isins,
            "membership": "Symbol as printed in the exchange bhavcopy. Not a point-in-time index member. A reused ticker is not merged with another company.",
            "returnConvention": "raw-bhavcopy-close",
            "nonEqDates": sum(count for code, count in series_counts.items() if code != "EQ"),
            "conflictDatesDropped": bad_count,
            "source": {
                "dataset": "tejhq/indian-markets",
                "url": "https://huggingface.co/datasets/tejhq/indian-markets",
                "licence": "MIT pipeline. Exchange bhavcopy. Verify exchange terms before commercial use.",
                "adjustment": "raw-unadjusted",
                "files": [{"name": f"{exchange.lower()}_yearly.parquet", "sha256": ""}],
                "note": "EQ close is kept when another series exists on the same day. No close was filled.",
                "closeField": "close",
            },
        },
    }
    with open(os.path.join(OUT, f"{key}.json"), "w") as handle:
        json.dump(body, handle)
    return "written"


def index_inventory():
    listing = json.load(open(os.path.join(ROOT, "data", "rrg", "cache", "nsedata4me-index-list.json")))
    imported = {
        "nifty_50": "NIFTY 50", "nifty_100": "NIFTY 100", "nifty_200": "NIFTY 200", "nifty_500": "NIFTY 500",
        "nifty_bank": "NIFTY BANK", "nifty_it": "NIFTY IT", "nifty_pharma": "NIFTY PHARMA",
        "nifty_midcap_50": "NIFTY MIDCAP 50", "india_vix": "INDIA VIX",
    }
    items = []
    for entry in listing:
        filename = entry["name"]
        stem = filename.replace(".parquet", "")
        if stem in imported or stem in {"cnx_nifty", "cnx_bank", "cnx_it", "cnx_pharma", "s_p_cnx_nifty"}:
            continue
        label = stem.replace("_", " ")
        family = "bonds" if "gsec" in stem or "g_sec" in stem or stem.startswith("gsec") else "volatility" if "vix" in stem else "strategy" if any(k in stem for k in ("alpha", "value", "quality", "momentum", "low_vol", "equal", "beta", "shariah", "esg")) else "size" if any(k in stem for k in ("midcap", "smallcap", "microcap", "largemid")) else "thematic" if any(k in stem for k in ("defence", "digital", "tourism", "manufacturing", "internet", "ev_", "ipo", "rural")) else "sector"
        items.append({
            "symbol": label.upper(),
            "name": label.title(),
            "category": family,
            "status": "licence-blocked",
            "reason": f"A file named {filename} is in ancap97/NSEDATA4ME on the data branch. That repository is GPL-3 and has no separate data licence, so the file was not copied into Kosh.",
        })
    items.append({
        "symbol": "XXPARTH DAY FILE",
        "name": "xxparth daily file",
        "category": "source",
        "status": "rejected",
        "reason": "huggingface xxparthparekhxx/indian-stock-market-minute-data day split ends 2026-01-21. Nifty IT disagreed with the authorised series on 1186 of 4054 overlapping days. No index from that file was imported.",
    })
    return items


def main():
    os.makedirs(OUT, exist_ok=True)
    for name in os.listdir(OUT):
        if name.endswith(".json") and name[:-5] not in KEEP_INDEXES:
            os.remove(os.path.join(OUT, name))
    db = connect()
    for year in range(2010, 2027):
        path = os.path.join(CACHE, f"nse_{year}.parquet")
        if os.path.isfile(path):
            load_prices(db, path, "NSE")
            db.commit()
    for year in (2024, 2025, 2026):
        path = os.path.join(CACHE, f"bse_{year}.parquet")
        if os.path.isfile(path):
            load_prices(db, path, "BSE")
            db.commit()
    load_actions(db)
    db.commit()
    sector = sectors()
    bad = dict(db.execute("SELECT exchange||':'||symbol, COUNT(*) FROM bad GROUP BY 1"))
    counts = defaultdict(int)
    quarantine = []
    for exchange, symbol in db.execute("SELECT DISTINCT exchange, symbol FROM px"):
        result = write_symbol(db, exchange, symbol, sector, bad.get(f"{exchange}:{symbol}", 0))
        counts[result] += 1
        if result == "quarantine":
            quarantine.append({"symbol": symbol if exchange == "NSE" else f"BSE:{symbol}", "name": symbol, "category": "stock", "status": "quarantine", "reason": f"More than {CONFLICT_LIMIT} dates had two different closes."})
    identities = []
    for name, exchange in (("symbol_history_nse.parquet", "NSE"), ("symbol_history_bse.parquet", "BSE")):
        path = os.path.join(CACHE, name)
        if not os.path.isfile(path):
            continue
        table = pq.read_table(path)
        seen = set(row[0] for row in db.execute("SELECT symbol FROM px WHERE exchange=?", (exchange,)))
        emitted = set()
        for i in range(table.num_rows):
            symbol = table.column("symbol")[i].as_py()
            if not symbol or symbol in seen or symbol in emitted:
                continue
            emitted.add(symbol)
            identities.append({
                "symbol": symbol if exchange == "NSE" else f"BSE:{symbol}",
                "name": symbol,
                "category": "stock",
                "exchange": exchange,
                "status": "unavailable",
                "reason": f"The {exchange} symbol history records this identity. The cached bhavcopy has no usable close.",
            })
    with open(os.path.join(ROOT, "data", "rrg", "quarantine.json"), "w") as handle:
        json.dump({"quarantine": quarantine, "unavailable": identities, "blocked": index_inventory()}, handle)
    print(dict(counts), "identities-without-prices", len(identities), "quarantine", len(quarantine))


if __name__ == "__main__":
    main()
