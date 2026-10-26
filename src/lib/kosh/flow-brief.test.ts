import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { flowBrief, foreignClaim, withoutForeignSentences } from "./flow-brief.ts";

const rows = [
  { date: "2026-10-17", fiiNet: 100, diiNet: 50, indexReturn: 0.2 },
  { date: "2026-10-20", fiiNet: -80, diiNet: 40, indexReturn: -0.1 },
  { date: "2026-10-21", fiiNet: -40, diiNet: 30, indexReturn: null },
  { date: "2026-10-22", fiiNet: -200, diiNet: 90, indexReturn: -0.4 },
  { date: "2026-10-23", fiiNet: 50, diiNet: 70, indexReturn: 0.3 },
];

describe("flow brief", () => {
  it("sums a complete 5-session window and withholds a short 20-session window", () => {
    const brief = flowBrief(rows);
    assert.equal(brief.latestDate, "2026-10-23");
    assert.equal(brief.latest?.fii, 50);
    assert.equal(brief.latest?.dii, 70);
    assert.equal(brief.deltaFii, 250);
    assert.equal(brief.deltaDii, -20);
    const five = brief.windows.find((item) => item.asked === 5);
    const twenty = brief.windows.find((item) => item.asked === 20);
    assert.equal(five?.complete, true);
    assert.equal(five?.fii, -170);
    assert.equal(five?.dii, 280);
    assert.equal(five?.fiiPositive, 2);
    assert.equal(five?.diiPositive, 5);
    assert.equal(twenty?.complete, false);
    assert.equal(twenty?.fii, null);
    assert.ok(brief.facts.some((fact) => fact.id === "window-20-short"));
    assert.ok(brief.facts.some((fact) => fact.id === "fii-flip"));
  });

  it("does not invent a session or a gross figure", () => {
    const brief = flowBrief([
      { date: "2026-10-22", fiiNet: -10, diiNet: 4, indexReturn: null },
      { date: "bad", fiiNet: 1, diiNet: 1 },
      { date: "2026-10-22", fiiNet: 999, diiNet: 999 },
    ]);
    assert.equal(brief.sessions, 1);
    assert.equal(brief.previous, null);
    assert.equal(brief.deltaFii, null);
    assert.equal(brief.latest?.indexReturn, null);
    assert.ok(brief.risks.some((line) => line.includes("No index return")));
  });

  it("rejects a figure the file does not contain", () => {
    const brief = flowBrief(rows);
    assert.equal(foreignClaim("FII net was +₹50 Cr on 2026-10-23.", brief), null);
    assert.equal(foreignClaim("The previous FII print was −₹200 Cr.", brief), null);
    assert.equal(foreignClaim("FII changed by ₹250 Cr.", brief), null);
    assert.equal(foreignClaim("Nifty was +0.3% on the flow date.", brief), null);
    assert.equal(foreignClaim("FII was 50% of something.", brief), "50%");
    assert.equal(foreignClaim("The index rose 12% after the print.", brief), "12%");
    assert.equal(foreignClaim("Gross buying was ₹9,642 Cr.", brief), "9,642");
    assert.equal(foreignClaim("A similar episode was 2024-01-02.", brief), "2024-01-02");
    const settled = withoutForeignSentences(
      "The latest FII print is +₹50 Cr. Gross buying was ₹9,642 Cr. Cash nets do not prove the next index move.",
      brief,
    );
    assert.match(settled.text, /50/);
    assert.doesNotMatch(settled.text, /9,642/);
    assert.equal(settled.stray, "9,642");
  });
});
