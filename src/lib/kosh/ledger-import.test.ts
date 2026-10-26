import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ledgerChrome, placeMenu } from "./ledger-chrome.ts";
import { sanitizeLayout } from "./ledger-layout.ts";
import {
  applyImport,
  classifyTvUrl,
  importCounts,
  parseSharedChart,
  parseSharedWatchlist,
  parseSymbolToken,
  previewImport,
} from "./ledger-import.ts";

describe("terminal chrome", () => {
  it("uses a different light chart background without inventing a second theme store", () => {
    const dark = ledgerChrome("dark");
    const light = ledgerChrome("light");
    assert.notEqual(light.background, dark.background);
    assert.notEqual(light.text, dark.text);
    assert.equal(light.background.startsWith("#"), true);
  });

  it("keeps a menu inside the viewport and flips it above a low trigger", () => {
    const shifted = placeMenu({ left: 900, right: 980, top: 40, bottom: 70 }, { width: 1000, height: 800 }, { width: 280, height: 200 });
    assert.equal(shifted.left, 712);
    assert.equal(shifted.flipped, false);
    const flipped = placeMenu({ left: 20, right: 80, top: 700, bottom: 730 }, { width: 1000, height: 760 }, { width: 280, height: 200 });
    assert.equal(flipped.flipped, true);
    assert.ok(flipped.top < 700);
  });
});

describe("saved terminal layout", () => {
  it("loads an older layout that has no watchlist width", () => {
    const { layout, recovered } = sanitizeLayout({
      v: 1,
      symbol: "TCS",
      interval: "1D",
      range: "5Y",
      chartType: "line",
      indicators: [{ id: "volume", kind: "volume", period: 0, hidden: false, color: "#7f8ea3" }],
      drawings: { "TCS|1D": [{ id: "a", kind: "hline", t0: 1_700_000_000, p0: 10, color: "#4c8dff", locked: false, hidden: false }] },
    });
    assert.equal(recovered, false);
    assert.equal(layout.watchWidth, 286);
    assert.equal(layout.symbol, "TCS");
    assert.equal(layout.range, "5Y");
    assert.equal(layout.drawings["TCS|1D"]?.[0].p0, 10);
  });
});

describe("drawing import", () => {
  it("rejects hosts other than the public TradingView pages", () => {
    assert.equal("error" in classifyTvUrl("https://example.com/watchlists/1/"), true);
    assert.equal("error" in classifyTvUrl("http://www.tradingview.com/watchlists/1/"), true);
    const ok = classifyTvUrl("https://www.tradingview.com/watchlists/155671037/?evil=1");
    assert.equal("kind" in ok && ok.kind, "watchlist");
    assert.equal("href" in ok && ok.href.includes("?"), false);
  });

  it("reads a shared watchlist and skips section labels", () => {
    const html = `<script type="application/prs.init-data+json">{"sharedWatchlist":{"list":{"name":"Invest","symbols":["NSE:RELIANCE","###SECTION","NSE:GMRP&UI","BSE:TCS"]}}}</script>`;
    const parsed = parseSharedWatchlist(html);
    assert.deepEqual(parsed?.symbols, ["NSE:RELIANCE", "NSE:GMRP&UI", "BSE:TCS"]);
    assert.equal(parseSymbolToken("NSE:RELIANCE").symbol, "RELIANCE");
    assert.equal(parseSymbolToken("NSE:GMRP&UI").status, "needs-review");
  });

  it("does not treat a public chart shell as a drawing export", () => {
    const chart = parseSharedChart(`<div>"symbol":"NSE:RADHIKAJWE"</div>`);
    assert.equal(chart.drawingObjects, 0);
    assert.match(chart.note, /did not include drawing objects/);
  });

  it("copies unix anchors and refuses a missing price", () => {
    const preview = previewImport({
      schema: "kosh-drawings",
      version: 1,
      objects: [
        { kind: "trend", symbol: "NSE:RELIANCE", interval: "1D", anchors: [{ t: 1_700_000_000, p: 1000 }, { t: 1_700_086_400, p: 1100 }] },
        { kind: "hline", symbol: "NSE:TCS", anchors: [{ t: 1_700_000_000 }] },
        { kind: "brush", symbol: "NSE:INFY", anchors: [{ t: 1_700_000_000, p: 10 }] },
      ],
    });
    const counts = importCounts(preview);
    assert.equal(counts.exact, 1);
    assert.equal(counts.review, 1);
    assert.equal(counts.unsupported, 1);
    assert.equal(preview.objects[0].draw?.t0, 1_700_000_000);
    assert.equal(preview.objects[0].draw?.p1, 1100);
    assert.equal(preview.objects[1].draw, undefined);
  });

  it("converts millisecond timestamps without moving the day", () => {
    const preview = previewImport({
      sources: [
        {
          type: "LineToolHorzLine",
          id: "abc",
          state: { symbol: "NSE:INFY", interval: "1D" },
          points: [{ time_t: 1_700_000_000_000, price: 1500 }],
        },
      ],
    });
    assert.equal(preview.objects[0].status, "converted");
    assert.equal(preview.objects[0].draw?.t0, 1_700_000_000);
    assert.equal(preview.objects[0].draw?.p0, 1500);
  });

  it("adds without deleting existing drawings and skips a duplicate", () => {
    const preview = previewImport({
      schema: "kosh-drawings",
      version: 1,
      objects: [{ kind: "hline", symbol: "RELIANCE", anchors: [{ t: 1_700_000_000, p: 10 }] }],
    });
    const current = {
      "RELIANCE|1D": [{ id: "old", kind: "hline" as const, t0: 1_700_000_000, p0: 10, color: "#4c8dff", locked: false, hidden: false }],
      "TCS|1D": [{ id: "keep", kind: "hline" as const, t0: 1_800_000_000, p0: 20, color: "#4c8dff", locked: false, hidden: false }],
    };
    const added = applyImport({ current, objects: preview.objects, mode: "add" });
    assert.equal(added.duplicates, 1);
    assert.equal(added.added, 0);
    assert.equal(added.next["TCS|1D"]?.[0].id, "keep");
    const fresh = previewImport({
      schema: "kosh-drawings",
      version: 1,
      objects: [{ kind: "hline", symbol: "RELIANCE", anchors: [{ t: 1_700_000_100, p: 12 }] }],
    });
    const replaced = applyImport({ current, objects: fresh.objects, mode: "replace", replaceScopes: ["RELIANCE|1D"] });
    assert.equal(replaced.next["RELIANCE|1D"]?.length, 1);
    assert.equal(replaced.next["RELIANCE|1D"]?.[0].p0, 12);
    assert.equal(replaced.next["TCS|1D"]?.[0].id, "keep");
  });

  it("does not assign a drawing that has no symbol unless the user names the chart", () => {
    const hidden = previewImport({
      schema: "kosh-drawings",
      version: 1,
      objects: [{ kind: "hline", anchors: [{ t: 1_700_000_000, p: 10 }] }],
    });
    assert.equal(hidden.objects[0].status, "needs-review");
    assert.equal(hidden.objects[0].draw, undefined);
    const assigned = previewImport(
      { schema: "kosh-drawings", version: 1, objects: [{ kind: "hline", anchors: [{ t: 1_700_000_000, p: 10 }] }] },
      "RELIANCE",
    );
    assert.equal(assigned.objects[0].status, "converted");
    assert.equal(assigned.objects[0].symbol, "RELIANCE");
  });
});
