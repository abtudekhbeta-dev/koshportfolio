import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogueCoverage, heatGroups, heatSpot, heatTone } from "./index-boards.ts";
import { NIFTY_CATALOGUE } from "./nifty-catalogue.ts";

describe("index heatmap boards", () => {
  it("places every priced index once and adds none", () => {
    const { missing, extra } = catalogueCoverage();
    assert.deepEqual(missing, []);
    assert.deepEqual(extra, []);
    const seen = new Set<string>();
    for (const row of NIFTY_CATALOGUE) {
      const spot = heatSpot(row.symbol);
      assert.ok(spot, row.symbol);
      assert.equal(seen.has(row.symbol), false);
      seen.add(row.symbol);
    }
    assert.equal(seen.size, NIFTY_CATALOGUE.length);
  });

  it("keeps size indices on the broad board and sectors in the requested groups", () => {
    assert.equal(heatSpot("^NSEI")?.board, "broad");
    assert.equal(heatSpot("^BSESN")?.board, "broad");
    assert.equal(heatSpot("^NSEMDCP50")?.board, "broad");
    assert.equal(heatSpot("NIFTYSMLCAP250.NS")?.board, "broad");
    assert.equal(heatSpot("^NSEBANK")?.group, "Banking");
    assert.equal(heatSpot("^CNXIT")?.group, "Information technology");
    assert.equal(heatSpot("^CNXPHARMA")?.group, "Pharma and healthcare");
    assert.equal(heatSpot("NIFTY_HEALTHCARE.NS")?.group, "Pharma and healthcare");
    assert.equal(heatSpot("^CNXENERGY")?.board, "sector");
    assert.equal(heatSpot("^CNXENERGY")?.group, "Energy");
    assert.equal(heatSpot("NIFTY_OIL_AND_GAS.NS")?.group, "Energy");
    assert.equal(heatSpot("^CNXINFRA")?.group, "Infrastructure");
    assert.equal(heatSpot("NIFTY_IND_DEFENCE.NS")?.board, "thematic");
    assert.equal(heatSpot("^CNXPSE")?.group, "PSU");
    assert.equal(heatSpot("^INDIAVIX")?.board, "strategy");
    assert.equal(heatSpot("^INDIAVIX")?.group, "Volatility");
    assert.equal(heatSpot("NIFTYGS10YR.NS")?.group, "Government securities");
    assert.equal(NIFTY_CATALOGUE.find((row) => row.symbol === "^CNXENERGY")?.family, "Thematic");
  });

  it("drops empty groups and does not repeat a symbol across boards", () => {
    const groups = heatGroups(NIFTY_CATALOGUE);
    assert.ok(groups.every((group) => group.rows.length > 0));
    const flat = groups.flatMap((group) => group.rows.map((row) => row.symbol));
    assert.equal(new Set(flat).size, flat.length);
    assert.equal(flat.length, NIFTY_CATALOGUE.length);
    assert.deepEqual(
      groups.filter((group) => group.board === "broad").map((group) => group.group),
      ["Benchmarks", "Large and broad", "Mid-cap", "Small-cap", "Micro-cap", "Cross-cap"],
    );
    const sectorNames = groups.filter((group) => group.board === "sector").map((group) => group.group);
    assert.deepEqual(sectorNames[0], "Banking");
    assert.equal(heatSpot("NIFTY_MICROCAP250.NS")?.group, "Micro-cap");
    assert.equal(heatSpot("NIFTYMIDSML400.NS")?.group, "Cross-cap");
    assert.equal(heatSpot("NIFTY_LARGEMID250.NS")?.group, "Large and broad");
    assert.equal(heatSpot("^NSEMDCP50")?.group, "Mid-cap");
    assert.equal(sectorNames.includes("Capital goods"), false);
    assert.ok(heatGroups(NIFTY_CATALOGUE, "thematic").every((group) => group.board === "thematic"));
  });

  it("washes cards from the session percentage and stays neutral when the move is missing", () => {
    assert.equal(heatTone(2.4), "up-strong");
    assert.equal(heatTone(0.6), "up");
    assert.equal(heatTone(0.1), "up-soft");
    assert.equal(heatTone(0.01), "flat");
    assert.equal(heatTone(0), "flat");
    assert.equal(heatTone(null), "flat");
    assert.equal(heatTone(undefined), "flat");
    assert.equal(heatTone(-0.2), "down-soft");
    assert.equal(heatTone(-0.8), "down");
    assert.equal(heatTone(-3), "down-strong");
  });
});
