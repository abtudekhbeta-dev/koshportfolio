/** Plain-language reading of the cash-flow research. Every figure comes from the brief. Nothing here is a forecast. */

import type { ResearchBrief } from "./flow-research.ts";

export type FlowStory = {
  asOf: string | null;
  now: string[];
  context: string[];
  afterwards: string[];
  relative: string[];
  risk: string[];
  interpretation: string;
};

type History = ResearchBrief["history"];

export function spanPhrase(count: number, unit: "session" | "week" | "month" | "year"): string {
  const n = Math.max(0, Math.floor(count));
  if (unit === "month") {
    const years = Math.floor(n / 12);
    const months = n % 12;
    const parts: string[] = [];
    if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
    if (months) parts.push(`${months} month${months === 1 ? "" : "s"}`);
    const body = parts.length ? parts.join(" and ") : "0 months";
    const noun = n === 1 ? "observation" : "observations";
    return `${n} monthly ${noun}, about ${body}`;
  }
  if (unit === "week") {
    const years = Math.floor(n / 52);
    const weeks = n % 52;
    const parts: string[] = [];
    if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
    if (weeks) parts.push(`${weeks} week${weeks === 1 ? "" : "s"}`);
    return `${n} weekly observations, about ${parts.join(" and ") || "0 weeks"}`;
  }
  if (unit === "year") return `${n} yearly observation${n === 1 ? "" : "s"}`;
  return `${n} daily session${n === 1 ? "" : "s"}`;
}

function pct1(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function rate(share: number | null, sample: number): string | null {
  if (share == null || sample <= 0) return null;
  const pct = Math.round(share * 1000) / 10;
  const hits = Math.round(share * sample);
  return `${hits} of ${sample} (${pct.toFixed(1)}%)`;
}

export function describeHistory(history: History, horizonLabel = "4 weeks"): string[] {
  if (!history.usable) return [history.note || "No comparison is shown."];
  const lines: string[] = [];
  lines.push(`${history.similarCount} earlier periods were the closest on foreign flow, domestic flow, the period's own Nifty move, the prior stretch, and the drawdown. Closeness is not a successful outcome.`);
  const row = history.similar.find((item) => item.label === horizonLabel) || history.similar[0];
  const base = history.baseline.find((item) => item.label === row?.label);
  if (row && row.n > 0 && row.positiveShare != null) {
    const up = rate(row.positiveShare, row.n);
    lines.push(`Over the following ${row.label}, ${up} of those closest periods closed higher. That is the share of completed paths only.`);
    if (row.negativeShare != null) {
      const down = rate(row.negativeShare, row.n);
      lines.push(`${down} closed lower. A flat result is in neither count.`);
    }
    if (row.median != null) lines.push(`The median Nifty move was ${pct1(row.median)}. The average was ${pct1(row.average)}.`);
    if (base?.median != null && row.median != null) {
      lines.push(`An ordinary period in the same file had a median of ${pct1(base.median)} over that same horizon (${base.n} completed paths).`);
    }
  } else {
    lines.push("No completed forward path is available for that horizon. The missing paths are left out. They are not counted as losses.");
  }
  return lines;
}

export function writeFlowStory(brief: ResearchBrief, coverage: { months: number; from: string | null; to: string | null; partial: boolean }): FlowStory {
  const history = brief.history;
  const weekly = brief.comparisons.find((frame) => frame.id === "weekly");
  const yearly = brief.comparisons.find((frame) => frame.id === "yearly");
  const daily = brief.comparisons.find((frame) => frame.id === "daily");
  const four = history.similar.find((item) => item.label === "4 weeks");
  const now: string[] = [brief.headline];
  if (coverage.partial) now.push("The latest month is still open, so its rank can change when the month finishes. It is not used as one of its own precedents.");
  else if (coverage.to) now.push(`The latest completed month in this comparison ends ${coverage.to}.`);
  now.push("The day, week, and month lines are the current cash windows. They are not the historical sample.");
  for (const frame of brief.frames) now.push(`${frame.id}: ${frame.text}`);
  if (brief.synthesis) now.push(brief.synthesis);

  const context: string[] = [];
  context.push(`Historical coverage: ${spanPhrase(coverage.months, "month")}${coverage.from && coverage.to ? `, from ${coverage.from} to ${coverage.to}` : ""}.`);
  context.push("That count is monthly prints with both a cash flow and a Nifty return. It is not the number of comparable situations, and it is not a forward-return sample.");
  if (!history.usable) context.push(history.note);
  else {
    context.push(`${history.months} earlier months have a completed path of about four weeks (20 sessions). ${history.similarCount} of them are the closest to the latest month.`);
    context.push("A daily or weekly window is a different observation. It is not treated as a monthly forward return.");
  }
  if (daily) context.push(daily.history.usable ? `Daily comparison: ${daily.history.months} earlier days have a completed later path. ${daily.history.similarCount} are shown as the closest. Those days are not one-day forward returns.` : `Daily comparison: ${daily.history.note}`);
  if (weekly) context.push(weekly.history.usable ? `Weekly comparison: ${weekly.history.months} earlier weeks have a completed later path. ${weekly.history.similarCount} are shown as the closest.` : `Weekly comparison: ${weekly.history.note}`);
  if (yearly) context.push(yearly.history.usable ? `Yearly comparison: ${spanPhrase(yearly.history.months, "year")} have a completed later path. The sample is small, so the yearly table is a description, not a reliable rate.` : `Yearly comparison: ${yearly.history.note}`);

  const afterwards = history.usable ? describeHistory(history) : [history.note || "No forward comparison is shown."];
  if (history.usable) {
    const ranked = history.similar.filter((item) => item.n >= 8 && item.median != null);
    if (ranked.length) {
      const best = ranked.reduce((a, b) => ((a.median || 0) >= (b.median || 0) ? a : b));
      afterwards.push(`Among horizons with at least 8 completed paths, the highest median was ${pct1(best.median)} over ${best.label} (${best.n} paths).`);
    }
    const skewed = history.similar.find((item) => item.n >= 8 && item.average != null && item.median != null && Math.abs(item.average - item.median) >= 2);
    if (skewed) afterwards.push(`Over ${skewed.label}, the average (${pct1(skewed.average)}) and the median (${pct1(skewed.median)}) differ by at least 2 percentage points. A few large paths are pulling the average.`);
  }

  const relative = [
    "These moves are Nifty's own later path. This file has no second benchmark, so a separate outperformance count is not shown.",
  ];
  if (history.association) relative.push(history.association);

  const risk: string[] = [];
  if (!history.usable) risk.push("Without a large enough set of completed paths, there is no consistency claim to make.");
  else if (four) {
    if (four.n < 20) risk.push(`The four-week sample is ${four.n} paths. A high share of up paths in a small sample is not a reliable prediction.`);
    if (four.worst != null) risk.push(`The weakest completed four-week path in the closest months was ${pct1(four.worst)}.`);
    if (four.adverse != null) risk.push(`The median of the worst point along those four-week paths was ${pct1(four.adverse)}. That is the dip after the month, not the month itself.`);
    if (four.dispersion == null) risk.push("A spread is not shown for a horizon until at least 8 paths exist.");
    else risk.push(`The four-week paths vary by about ${pct1(four.dispersion).replace("+", "")} around their average (sample standard deviation).`);
  }
  risk.push("Breadth, volatility, the rupee, and crude are not in this calculation. They are omitted, not treated as neutral.");

  let interpretation = "There is not enough completed history to describe what similar months did next.";
  if (history.usable && four?.positiveShare != null && four.median != null) {
    const up = Math.round(four.positiveShare * 1000) / 10;
    const ordinary = history.baseline.find((item) => item.label === "4 weeks");
    const lean = four.median > 0 ? "a positive tendency" : four.median < 0 ? "a negative tendency" : "no clear direction";
    const versus = ordinary?.median != null ? ` An ordinary month's median over the same horizon was ${pct1(ordinary.median)}.` : "";
    const caution = four.n < 20
      ? "The sample is too small to treat the share as a probability."
      : "Even with more paths, the share describes those paths. It is not the probability of the next one.";
    interpretation = `The closest earlier months showed ${lean} over the next 20 sessions: the median was ${pct1(four.median)} and ${up.toFixed(1)}% of the ${four.n} completed paths closed higher.${versus} That describes this file. It is not a forecast. ${caution}`;
  }

  return {
    asOf: coverage.to,
    now,
    context,
    afterwards,
    relative,
    risk,
    interpretation,
  };
}
