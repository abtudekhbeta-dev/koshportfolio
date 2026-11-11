import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildResearch } from "./flow-research.ts";
import { spanPhrase, writeFlowStory } from "./flow-story.ts";

describe("flow story", () => {
  it("turns a long monthly count into years and months", () => {
    assert.equal(spanPhrase(229, "month"), "229 monthly observations, about 19 years and 1 month");
    assert.equal(spanPhrase(12, "month"), "12 monthly observations, about 1 year");
    assert.equal(spanPhrase(1, "month"), "1 monthly observation, about 1 month");
  });

  it("does not treat a short file as a finished comparison or a zero outcome", () => {
    const brief = buildResearch({ index: [], days: [], daily: [], weekly: [], monthly: [] });
    const story = writeFlowStory(brief, { months: 0, from: null, to: null, partial: false });
    assert.match(story.context.join(" "), /0 monthly observations/);
    assert.equal(brief.history.usable, false);
    assert.equal(brief.comparisons.length, 3);
    assert.deepEqual(brief.comparisons.map((frame) => frame.id), ["daily", "weekly", "yearly"]);
    assert.equal(brief.comparisons.every((frame) => frame.history.usable === false), true);
    assert.doesNotMatch(story.interpretation, /strong resemblance|Pattern ranked|Still going/i);
    assert.match(story.relative.join(" "), /no second benchmark/);
  });

  it("keeps the latest month out of its own precedents and states the sample", () => {
    const index = Array.from({ length: 1400 }, (_, i) => {
      const date = new Date(Date.UTC(2016, 0, 1 + i));
      return { date: date.toISOString().slice(0, 10), close: 8000 + i };
    });
    const monthly = Array.from({ length: 48 }, (_, i) => {
      const end = index[250 + i * 20].date;
      return {
        key: end.slice(0, 7),
        label: end,
        start: end,
        end,
        sessions: 20,
        partial: false,
        fiiNet: i === 47 ? -50000 : -1000 + (i % 5) * 200,
        diiNet: i === 47 ? 48000 : 800,
        indexStart: 100,
        indexEnd: 110,
        indexReturn: i === 47 ? 0.4 : 0.6,
      };
    });
    const brief = buildResearch({ index, days: [], daily: [], weekly: [], monthly });
    assert.equal(brief.history.examples.some((example) => example.end === monthly[47].end), false);
    const four = brief.history.similar.find((item) => item.label === "4 weeks");
    assert.ok(four);
    assert.equal(four?.average == null, false);
    assert.equal(four && four.n > 0, true);
    const story = writeFlowStory(brief, { months: 48, from: monthly[0].end, to: monthly[47].end, partial: false });
    assert.match(story.context.join(" "), /48 monthly observations/);
    assert.match(story.afterwards.join(" "), /completed paths/);
    assert.match(story.interpretation, /not a forecast/);
    assert.match(story.interpretation, /too small/);
  });
});
