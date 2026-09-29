import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateResearch } from "./research-validate.ts";

describe("AI research validation", () => {
  it("rejects a number with no source", () => {
    const out = validateResearch(
      { items: [{ metric: "ROCE", status: "researched", value: 22, unit: "%", period: "FY26", sourceName: "", sourceUrl: "", evidence: "" }] },
      ["ROCE"],
    );
    assert.equal(out.ok, false);
  });

  it("accepts a sourced figure and rejects a substituted metric", () => {
    const good = validateResearch(
      {
        items: [
          {
            metric: "ROCE",
            status: "researched",
            value: 22.4,
            unit: "%",
            period: "FY26",
            sourceName: "Annual report",
            sourceUrl: "https://example.com/ar.pdf",
            evidence: "ROCE for the year was 22.4 percent.",
            methodology: "Reported line",
          },
        ],
      },
      ["ROCE"],
    );
    assert.equal(good.ok, true);
    const swapped = validateResearch(
      {
        items: [
          {
            metric: "ROE",
            status: "researched",
            value: 18,
            unit: "%",
            period: "FY26",
            sourceName: "Annual report",
            sourceUrl: "https://example.com/ar.pdf",
            evidence: "ROE for the year was 18 percent.",
          },
        ],
      },
      ["Interest coverage"],
    );
    assert.equal(swapped.ok, false);
  });

  it("rejects a not-found row that still carries a value", () => {
    const out = validateResearch(
      { items: [{ metric: "PEG", status: "not_found", value: 1.2, unit: "", period: null, sourceName: "", sourceUrl: "", evidence: "" }] },
      ["PEG"],
    );
    assert.equal(out.ok, false);
  });
});
