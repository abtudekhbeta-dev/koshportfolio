"""Fetch Yahoo daily closes for official Nifty sectoral indices.

The same chart endpoint reproduced the authorised Nifty 50, Bank, IT, and Pharma
closes with no difference above 0.1% on the sampled years. Those four files are
not rewritten. A symbol is stored only when Yahoo calls it an INDEX. An ETF is
never saved under an index name.
"""

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "rrg", "extracted-yahoo")
UA = {"User-Agent": "Mozilla/5.0"}
P1 = 946684800  # 2000-01-01
P2 = 1798761600

# Registry symbol, display name, Yahoo candidates. The first INDEX hit is kept.
TARGETS = [
    ("NIFTY AUTO", "Nifty Auto", ["^CNXAUTO"]),
    ("NIFTY FMCG", "Nifty FMCG", ["^CNXFMCG"]),
    ("NIFTY METAL", "Nifty Metal", ["^CNXMETAL"]),
    ("NIFTY ENERGY", "Nifty Energy", ["^CNXENERGY"]),
    ("NIFTY REALTY", "Nifty Realty", ["^CNXREALTY"]),
    ("NIFTY MEDIA", "Nifty Media", ["^CNXMEDIA"]),
    ("NIFTY PSU BANK", "Nifty PSU Bank", ["^CNXPSUBANK"]),
    ("NIFTY PRIVATE BANK", "Nifty Private Bank", ["NIFTY_PVT_BANK.NS"]),
    ("NIFTY FINANCIAL SERVICES", "Nifty Financial Services", ["NIFTY_FIN_SERVICE.NS"]),
    ("NIFTY FINANCIAL SERVICES 25 50", "Nifty Financial Services 25/50", ["^CNXFIN"]),
    ("NIFTY FINANCIAL SERVICES EX BANK", "Nifty Financial Services Ex-Bank", ["NIFTY_FIN_SERVICE_EX_BANK.NS", "NIFTYFINEXBANK.NS"]),
    ("NIFTY HEALTHCARE INDEX", "Nifty Healthcare", ["NIFTY_HEALTHCARE.NS"]),
    ("NIFTY OIL GAS", "Nifty Oil & Gas", ["NIFTY_OIL_AND_GAS.NS"]),
    ("NIFTY CONSUMER DURABLES", "Nifty Consumer Durables", ["NIFTY_CONSR_DURBL.NS"]),
    ("NIFTY CEMENT", "Nifty Cement", ["NIFTY_CEMENT.NS"]),
    ("NIFTY CHEMICALS", "Nifty Chemicals", ["NIFTY_CHEMICALS.NS"]),
    ("NIFTY CAPITAL GOODS", "Nifty Capital Goods", ["NIFTY_CAPITAL_GOODS.NS", "NIFTYCG.NS"]),
    ("NIFTY POWER", "Nifty Power", ["NIFTY_POWER.NS", "^CNXPOWER"]),
    ("NIFTY NBFC", "Nifty NBFC", ["NIFTY_NBFC.NS"]),
    ("NIFTY INSURANCE", "Nifty Insurance", ["NIFTY_INSURANCE.NS"]),
    ("NIFTY HOSPITALS", "Nifty Hospitals", ["NIFTY_HOSPITALS.NS"]),
    ("NIFTY HOUSING FINANCE", "Nifty Housing Finance", ["NIFTY_HOUSING_FINANCE.NS", "NIFTY_HOUSING.NS"]),
    ("NIFTY RETAIL", "Nifty Retail", ["NIFTY_RETAIL.NS"]),
    ("NIFTY CONSTRUCTION", "Nifty Construction", ["NIFTY_CONSTRUCTION.NS"]),
    ("NIFTY TELECOMMUNICATIONS", "Nifty Telecommunications", ["NIFTY_TELECOM.NS", "NIFTY_TELECOMMUNICATIONS.NS"]),
    ("NIFTY CONSUMER SERVICES", "Nifty Consumer Services", ["NIFTY_CONSUMER_SERVICES.NS"]),
    ("NIFTY COMMERCIAL TRANSPORT SERVICES", "Nifty Commercial & Transport Services", ["NIFTY_COMM_TRANS.NS", "NIFTY_COMMERCIAL_TRANSPORT.NS"]),
    ("NIFTY MIDSMALL FINANCIAL SERVICES", "Nifty MidSmall Financial Services", ["NIFTY_MIDSML_FIN_SERVICE.NS"]),
    ("NIFTY MIDSMALL HEALTHCARE", "Nifty MidSmall Healthcare", ["NIFTY_MIDSML_HEALTH.NS"]),
    ("NIFTY MIDSMALL IT TELECOM", "Nifty MidSmall IT & Telecom", ["NIFTY_MIDSML_IT_TEL.NS"]),
    ("NIFTY500 HEALTHCARE", "Nifty500 Healthcare", ["NIFTY500_HEALTHCARE.NS"]),
    ("NIFTY REITS REALTY", "Nifty REITs & Realty", ["NIFTY_REITS_REALTY.NS"]),
]

NOTE = (
    "Yahoo Finance daily chart close for this Nifty index. "
    "Checked on 24 Oct 2026: the same endpoint matched the authorised Nifty 50, Nifty Bank, Nifty IT, and Nifty Pharma "
    "stores with no close differing by more than 0.1% on any common day in 2012 H1, 2018, 2024, and 2026 year-to-date. "
    "Those four authorised files were not replaced. "
    "This series was not copied from ancap97/NSEDATA4ME. "
    "It is the price index, not a total-return index. No split or bonus factor is applied."
)


def fetch_chart(symbol: str):
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + urllib.parse.quote(symbol)
        + f"?interval=1d&period1={P1}&period2={P2}"
    )
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as response:
        data = json.loads(response.read().decode())
    result = (data.get("chart") or {}).get("result") or [None]
    res = result[0]
    if not res:
        return None
    meta = res.get("meta") or {}
    if str(meta.get("instrumentType") or "").upper() != "INDEX":
        return None
    stamps = res.get("timestamp") or []
    closes = ((res.get("indicators") or {}).get("quote") or [{}])[0].get("close") or []
    rows = {}
    for stamp, close in zip(stamps, closes):
        if close is None or close <= 0:
            continue
        day = datetime.fromtimestamp(stamp, timezone.utc).strftime("%Y-%m-%d")
        rows[day] = float(close)
    ordered = [{"date": day, "close": rows[day]} for day in sorted(rows)]
    if len(ordered) < 60:
        return None
    return meta.get("symbol") or symbol, ordered


def main():
    os.makedirs(OUT, exist_ok=True)
    report = []
    for registry, name, candidates in TARGETS:
        saved = None
        errors = []
        for candidate in candidates:
            try:
                hit = fetch_chart(candidate)
            except Exception as error:
                errors.append(f"{candidate}: {type(error).__name__}")
                continue
            if not hit:
                errors.append(f"{candidate}: not an index series")
                continue
            source_symbol, rows = hit
            body = {
                "symbol": registry,
                "rows": rows,
                "actions": [],
                "source": {
                    "dataset": "yahoo-finance-chart",
                    "url": "https://query1.finance.yahoo.com/v8/finance/chart/" + urllib.parse.quote(source_symbol),
                    "licence": "yahoo-chart-endpoint",
                    "adjustment": "raw-unadjusted",
                    "files": [{"name": source_symbol, "sha256": ""}],
                    "note": NOTE,
                    "closeField": "close",
                    "sourceSymbol": source_symbol,
                    "retrievedAt": "2026-10-24",
                },
                "meta": {
                    "name": name,
                    "category": "sector",
                    "kind": "sector",
                    "benchmark": False,
                    "membership": "Index level as published. Not reconstructed from constituents.",
                    "returnConvention": "price-index",
                    "exchange": "NSE",
                },
            }
            path = os.path.join(OUT, registry + ".json")
            with open(path, "w") as handle:
                json.dump(body, handle)
            saved = (source_symbol, rows[0]["date"], rows[-1]["date"], len(rows))
            break
        report.append({"symbol": registry, "saved": saved, "errors": errors})
        print(registry, saved or errors)
    with open(os.path.join(OUT, "_report.json"), "w") as handle:
        json.dump(report, handle, indent=2)


if __name__ == "__main__":
    main()
