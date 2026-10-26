import type { FlowBar, FlowDay } from "./market-flows.ts";

export type OutcomeSet = {
  label: string;
  n: number;
  median: number | null;
  positiveShare: number | null;
  worst: number | null;
};

export type FlowExample = {
  end: string;
  fiiNet: number;
  diiNet: number;
  indexReturn: number;
  why: string;
  difference: string;
  forward: { label: string; returnPct: number | null; adversePct: number | null }[];
  failed: boolean;
};

export type ResearchBrief = {
  headline: string;
  reasons: string[];
  why: string[];
  synthesis: string;
  frames: { id: string; text: string }[];
  regime: { label: string; evidence: string; alternative: string };
  history: {
    usable: boolean;
    note: string;
    months: number;
    similarCount: number;
    separated: boolean;
    baseline: OutcomeSet[];
    similar: OutcomeSet[];
    examples: FlowExample[];
    association: string;
  };
  scenarios: { name: string; support: string; against: string; strengthen: string; invalidate: string }[];
  watch: { variable: string; now: string; change: string; effect: string }[];
  method: string[];
};

type Print = { date: string; close: number };
type Point = { end: string; fii: number; dii: number; ret1: number; ret3: number | null; dd: number | null; partial: boolean };

const HORIZONS = [
  { sessions: 5, label: "1 week" },
  { sessions: 20, label: "4 weeks" },
  { sessions: 60, label: "12 weeks" },
  { sessions: 120, label: "24 weeks" },
];

function cr(n: number) {
  const body = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (n > 0) return `+₹${body} Cr`;
  if (n < 0) return `−₹${body} Cr`;
  return "₹0 Cr";
}

function pct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function rankOf(value: number, sample: number[]) {
  if (sample.length < 24) return null;
  return sample.filter((item) => item < value).length / sample.length;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function madScale(values: number[]) {
  const mid = median(values) || 0;
  const abs = values.map((value) => Math.abs(value - mid)).sort((a, b) => a - b);
  return { mid, mad: abs[Math.floor(abs.length / 2)] || 1 };
}

function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 24) return null;
  const x = xs.slice(0, n);
  const y = ys.slice(0, n);
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

function locate(index: Print[], date: string) {
  let pos = -1;
  for (let i = 0; i < index.length; i++) {
    if (index[i].date <= date) pos = i;
    else break;
  }
  return pos;
}

function backReturn(index: Print[], date: string, sessions: number) {
  const pos = locate(index, date);
  const prev = pos - sessions;
  if (pos < 0 || prev < 0 || !(index[prev].close > 0)) return null;
  return (index[pos].close / index[prev].close - 1) * 100;
}

function drawdown(index: Print[], date: string, sessions: number) {
  const pos = locate(index, date);
  if (pos < 1) return null;
  const start = Math.max(0, pos - sessions);
  let high = index[start].close;
  for (let i = start; i <= pos; i++) if (index[i].close > high) high = index[i].close;
  if (!(high > 0)) return null;
  return (index[pos].close / high - 1) * 100;
}

function forwardPath(index: Print[], date: string, sessions: number) {
  const pos = locate(index, date);
  const end = pos + sessions;
  if (pos < 0 || end >= index.length || !(index[pos].close > 0)) return { ret: null, adverse: null };
  let low = index[pos].close;
  for (let i = pos + 1; i <= end; i++) if (index[i].close < low) low = index[i].close;
  return {
    ret: (index[end].close / index[pos].close - 1) * 100,
    adverse: (low / index[pos].close - 1) * 100,
  };
}

function outcome(index: Print[], rows: Point[], horizon: (typeof HORIZONS)[number]): OutcomeSet {
  const values = rows
    .map((row) => forwardPath(index, row.end, horizon.sessions).ret)
    .filter((value): value is number => value != null);
  const positive = values.filter((value) => value > 0).length;
  return {
    label: horizon.label,
    n: values.length,
    median: median(values),
    positiveShare: values.length ? positive / values.length : null,
    worst: values.length ? Math.min(...values) : null,
  };
}

function streak(rows: Point[], key: "fii" | "dii", negative: boolean) {
  let count = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const value = rows[i][key];
    if (negative ? value < 0 : value > 0) count += 1;
    else break;
  }
  return count;
}

function frameLine(bar: FlowBar | undefined, name: string) {
  if (!bar) return `${name}: no window in the file.`;
  const open = bar.partial ? " This window is still open." : "";
  return `${name} ${bar.label}: FII ${cr(bar.fiiNet)}, DII ${cr(bar.diiNet)}, Nifty ${pct(bar.indexReturn)}.${open}`;
}

export function buildResearch(input: {
  index: Print[];
  days: FlowDay[];
  daily: FlowBar[];
  weekly: FlowBar[];
  monthly: FlowBar[];
}): ResearchBrief {
  const index = input.index.filter((row) => row.close > 0).slice().sort((a, b) => a.date.localeCompare(b.date));
  const monthly = input.monthly.filter((bar) => bar.indexReturn != null && Number.isFinite(bar.fiiNet) && Number.isFinite(bar.diiNet));
  const points: Point[] = monthly.map((bar) => ({
    end: bar.end,
    fii: bar.fiiNet,
    dii: bar.diiNet,
    ret1: bar.indexReturn as number,
    ret3: backReturn(index, bar.end, 63),
    dd: drawdown(index, bar.end, 252),
    partial: bar.partial,
  }));
  const current = points[points.length - 1];
  const prior = current ? points.slice(0, -1).filter((row) => !row.partial) : [];
  const fiiRank = current ? rankOf(current.fii, prior.map((row) => row.fii)) : null;
  const diiRank = current ? rankOf(current.dii, prior.map((row) => row.dii)) : null;
  const retRank = current ? rankOf(current.ret1, prior.map((row) => row.ret1)) : null;
  const fiiSellStreak = streak(points, "fii", true);
  const diiBuyStreak = streak(points, "dii", false);
  const ret3 = current ? current.ret3 : null;
  const ret6 = current ? backReturn(index, current.end, 126) : null;
  const ret12 = current ? backReturn(index, current.end, 252) : null;
  const dd = current ? current.dd : null;
  const cover = current && current.fii < 0 && current.dii > 0 ? current.dii / Math.abs(current.fii) : null;
  const heavyForeignSelling = fiiRank != null && fiiRank <= 0.2;
  const heavyDomesticBuying = diiRank != null && diiRank >= 0.8;
  const indexDown = current != null && current.ret1 <= -1.5;
  const indexUp = current != null && current.ret1 >= 1.5;
  const absorbed = cover != null && cover >= 0.8 && !indexDown;

  let headline = "The flows and the index do not yet make one case.";
  if (!current) headline = "There is not a complete enough month to judge.";
  else if (heavyForeignSelling && absorbed && dd != null && dd <= -8) headline = `Foreign selling is among the heaviest in this file. Domestic buying is covering it this month, but Nifty is still ${pct(dd)} from its high of the past year.`;
  else if (heavyForeignSelling && absorbed) headline = "Foreign selling is heavy. Domestic buying is covering it, and the index has not fallen with the selling.";
  else if (heavyForeignSelling && indexDown) headline = "Foreign selling is heavy, and the index is falling with it.";
  else if (cover != null && cover >= 0.8 && indexDown) headline = "Domestic buying is large, but it has not stopped the index from falling.";
  else if (heavyDomesticBuying && indexUp && (fiiRank == null || fiiRank < 0.5)) headline = "The index is rising with domestic buying while foreign flow is not leading it.";
  else if (indexUp && current.fii > 0 && current.dii > 0) headline = "Both sets of institutions are buying, and the index is up with them.";
  else if (current.fii < 0 && current.dii < 0 && indexDown) headline = "Both sets of institutions are selling, and the index is down with them.";

  const reasons: string[] = [];
  if (current && fiiRank != null) {
    const side = fiiRank <= 0.5 ? `more negative than ${Math.round((1 - fiiRank) * 100)}%` : `more positive than ${Math.round(fiiRank * 100)}%`;
    reasons.push(`Foreign net this month is ${cr(current.fii)}, ${side} of the ${prior.length} earlier months.`);
  }
  if (current && diiRank != null) reasons.push(`Domestic net is ${cr(current.dii)}, above ${Math.round((diiRank || 0) * 100)}% of those earlier months.`);
  if (cover != null) reasons.push(`Domestic buying is ${cover.toFixed(2)} times the foreign selling. The month's Nifty move is ${pct(current?.ret1 ?? null)}.`);
  else if (current) reasons.push(`The month's Nifty move is ${pct(current.ret1)}${retRank != null ? `, a ${Math.round(retRank * 100)}th percentile month` : ""}.`);
  if (dd != null) reasons.push(`Nifty is ${pct(dd)} from its high of the last 252 sessions.`);

  const why = reasons.slice(0, 3);
  const daily = input.daily[input.daily.length - 1];
  const week = input.weekly[input.weekly.length - 1];
  const month = input.monthly[input.monthly.length - 1];
  const synthesis = !current
    ? "The monthly file is too short to set the daily print in a longer context."
    : `The month is the evidence that can be ranked. ${month?.partial ? "It is still open, so the rank can change before the month ends. " : ""}The latest day and week say whether that month is still intact: ${daily ? `the latest day was FII ${cr(daily.fiiNet)} and DII ${cr(daily.diiNet)}` : "the latest day is missing"}${week ? `, and the latest week was FII ${cr(week.fiiNet)} and DII ${cr(week.diiNet)}` : ""}.`;

  const longerDown = ret6 != null && ret6 < 0;
  const longerUp = ret12 != null && ret12 > 0 && (ret6 == null || ret6 > -3);
  let regime = "Unresolved";
  let evidence = "The month and the longer returns do not point the same way.";
  let alternative = "A single month of flows can be inventory, not a change of view.";
  if (absorbed && longerDown) {
    regime = "Longer decline, with this month's selling absorbed";
    evidence = `Nifty is ${pct(dd)} from its high of the past year, so the larger trend is still damaged. This month, domestic buying has covered the foreign selling and the index is ${pct(current?.ret1 ?? null)}.`;
    alternative = "One month of absorption does not end a longer decline. The domestic buying can also be fund inflow rather than a judgement that the fall is over.";
  } else if (absorbed && !longerDown) {
    regime = "Uptrend under supply, with absorption";
    evidence = "Foreign selling is being met by domestic buying and the index is not confirming the selling.";
    alternative = "Domestic buying can be mechanical fund inflow. That is support, not proof that prices are cheap.";
  } else if (heavyForeignSelling && (indexDown || longerDown)) {
    regime = "Downtrend with selling that price is confirming";
    evidence = "The index is weak over the stretch that lines up with the foreign selling.";
    alternative = "The decline can be larger than the flow if other sellers, who are not in this cash file, are also active.";
  } else if (longerUp && indexDown) {
    regime = "Longer uptrend, latest month weak";
    evidence = `The 12-month Nifty move is ${pct(ret12)} and the latest month is ${pct(current?.ret1 ?? null)}.`;
    alternative = "The latest month may be noise inside the longer rise, or the start of a larger break.";
  } else if (longerDown && indexUp) {
    regime = "Longer decline, latest month attempting to turn";
    evidence = `The six-month Nifty move is ${pct(ret6)} and the latest month is ${pct(current?.ret1 ?? null)}.`;
    alternative = "A one-month bounce inside a decline is common and often fails.";
  }

  const history = matchHistory(index, points);
  const scenarios = scenariosFor({ absorbed, heavyForeignSelling, indexDown, indexUp, cover, dd, current });
  const watch = watchFor({ current, fiiRank, cover, dd, fiiSellStreak, diiBuyStreak });
  return {
    headline,
    reasons: reasons.slice(0, 4),
    why,
    synthesis,
    frames: [
      { id: "Daily", text: frameLine(daily, "Day") },
      { id: "Weekly", text: frameLine(week, "Week") },
      { id: "Monthly", text: frameLine(month, "Month") },
    ],
    regime: { label: regime, evidence, alternative },
    history,
    scenarios,
    watch,
    method: [
      "Ranks use only earlier months. The latest month is not included in its own comparison set.",
      "Similar months are the 8 closest on foreign flow, domestic flow, that month's Nifty return, the prior-three-month return and the drawdown from the prior-year high. Scales use only months before the latest one.",
      "What happened next is the Nifty path after that month, over about 1, 4, 12 and 24 weeks. The later path is not used to decide the match.",
      "The ordinary-month row is every earlier month with a completed path, not only the similar ones. If the two rows are close, the match is not treated as predictive.",
      "Breadth, volatility, the rupee, crude and a size or sentiment cross-section are not in this calculation. They are omitted, not assumed neutral.",
      `Daily cash prints in this file: ${input.days.length}. Monthly cash totals used for the rank: ${prior.length} completed months before the latest one.`,
    ],
  };
}

function matchHistory(index: Print[], points: Point[]): ResearchBrief["history"] {
  const current = points[points.length - 1];
  if (!current || points.length < 36) {
    return { usable: false, note: "Fewer than 36 months have both a flow and a Nifty return. No historical comparison is shown.", months: points.length, similarCount: 0, separated: false, baseline: [], similar: [], examples: [], association: "" };
  }
  const history = points.slice(0, -1).filter((row) => !row.partial && row.end < current.end);
  const usable = history.filter((row) => forwardPath(index, row.end, 20).ret != null);
  if (usable.length < 24) {
    return { usable: false, note: "Too few earlier months have a completed four-week path. No comparison is shown.", months: history.length, similarCount: 0, separated: false, baseline: [], similar: [], examples: [], association: "" };
  }
  const fiiS = madScale(usable.map((row) => row.fii));
  const diiS = madScale(usable.map((row) => row.dii));
  const retS = madScale(usable.map((row) => row.ret1));
  const ret3S = madScale(usable.map((row) => row.ret3).filter((value): value is number => value != null));
  const ddS = madScale(usable.map((row) => row.dd).filter((value): value is number => value != null));
  const z = (value: number | null, scale: { mid: number; mad: number }) => (value == null ? null : (value - scale.mid) / scale.mad);
  const q = [z(current.fii, fiiS), z(current.dii, diiS), z(current.ret1, retS), z(current.ret3, ret3S), z(current.dd, ddS)].filter((value): value is number => value != null);
  const scored = usable.map((row) => {
    const item = [z(row.fii, fiiS), z(row.dii, diiS), z(row.ret1, retS), z(row.ret3, ret3S), z(row.dd, ddS)].filter((value): value is number => value != null);
    const n = Math.min(q.length, item.length);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += (q[i] - item[i]) ** 2;
    return { row, distance: Math.sqrt(sum) };
  });
  scored.sort((a, b) => a.distance - b.distance);
  const take = Math.min(8, scored.length);
  const similarRows = scored.slice(0, take).map((item) => item.row);
  const baseline = HORIZONS.map((horizon) => outcome(index, usable, horizon));
  const similar = HORIZONS.map((horizon) => outcome(index, similarRows, horizon));
  const base4 = baseline.find((item) => item.label === "4 weeks");
  const sim4 = similar.find((item) => item.label === "4 weeks");
  const later = similar.find((item) => item.label === "24 weeks");
  const baseLater = baseline.find((item) => item.label === "24 weeks");
  const fades = later?.median != null && baseLater?.median != null && Math.abs(later.median - baseLater.median) < 1;
  const separated = base4?.median != null && sim4?.median != null && Math.abs(sim4.median - base4.median) >= 1;
  const picked = scored.slice(0, 3);
  const failed = scored.slice(0, take).find((item) => {
    const path = forwardPath(index, item.row.end, 20);
    return path.ret != null && path.ret < 0 && !picked.some((chosen) => chosen.row.end === item.row.end);
  });
  if (failed) picked.push(failed);
  const examples: FlowExample[] = picked.map((item) => {
    const path20 = forwardPath(index, item.row.end, 20);
    const failedPath = path20.ret != null && path20.ret < 0;
    return {
      end: item.row.end,
      fiiNet: item.row.fii,
      diiNet: item.row.dii,
      indexReturn: item.row.ret1,
      why: "Foreign flow, domestic flow, the month's return and the drawdown were near the latest month.",
      difference: difference(current, item.row),
      forward: HORIZONS.map((horizon) => {
        const path = forwardPath(index, item.row.end, horizon.sessions);
        return { label: horizon.label, returnPct: path.ret, adversePct: path.adverse };
      }),
      failed: failedPath,
    };
  });
  const pairs = association(history);
  return {
    usable: true,
    note: !separated
      ? `The 8 closest months were followed by roughly the same four-week result as an ordinary month. The resemblance is not evidence of a different outcome.`
      : fades
        ? `Over the next 4 weeks, the 8 closest months had a median Nifty move of ${sim4?.median?.toFixed(1)}% against ${base4?.median?.toFixed(1)}% for an ordinary month. By 24 weeks the two groups are close again. That describes those months. It is not a forecast.`
        : `The 8 closest months were followed by a different result from an ordinary month in this file. That is a description of those months, not a forecast.`,
    months: usable.length,
    similarCount: take,
    separated,
    baseline,
    similar,
    examples,
    association: pairs,
  };
}

function difference(current: Point, prior: Point) {
  const gaps: string[] = [];
  if (Math.abs(current.fii - prior.fii) > 15000) gaps.push("the foreign total was materially different");
  if (current.dd != null && prior.dd != null && Math.abs(current.dd - prior.dd) > 8) gaps.push("the drawdown was different");
  if (Math.sign(current.dii) !== Math.sign(prior.dii)) gaps.push("domestic flow was on the other side");
  return gaps.length ? gaps.join("; ") + "." : "No single input was far from the latest month.";
}

function association(rows: Point[]) {
  const complete = rows.filter((row) => !row.partial);
  const fii: number[] = [];
  const dii: number[] = [];
  const ret: number[] = [];
  const prev: number[] = [];
  for (let i = 1; i < complete.length; i++) {
    fii.push(complete[i].fii);
    dii.push(complete[i].dii);
    ret.push(complete[i].ret1);
    prev.push(complete[i - 1].ret1);
  }
  const a = pearson(fii, ret);
  const b = pearson(fii, prev);
  const c = pearson(dii, ret);
  const d = pearson(dii, prev);
  if (a == null || b == null || c == null || d == null) return "Not enough paired months to describe how flows line up with returns.";
  return `Across ${fii.length} completed months, foreign flow lines up with the same month's Nifty return at ${a.toFixed(2)} and with the previous month's return at ${b.toFixed(2)}. Domestic flow lines up at ${c.toFixed(2)} and ${d.toFixed(2)}. This describes the file. It is not a significance test.`;
}

function scenariosFor(input: { absorbed: boolean; heavyForeignSelling: boolean; indexDown: boolean; indexUp: boolean; cover: number | null; dd: number | null; current: Point | undefined }): ResearchBrief["scenarios"] {
  if (input.absorbed || (input.heavyForeignSelling && !input.indexDown)) {
    return [
      {
        name: "The selling stays absorbed",
        support: input.cover != null ? `Domestic buying is already ${input.cover.toFixed(2)} times foreign selling, and the index has not confirmed the selling.` : "Domestic buying is offsetting foreign selling.",
        against: "Absorption can stop in a single week if domestic buying shrinks while foreign selling continues.",
        strengthen: "Foreign selling eases and the index holds above the low of this month.",
        invalidate: "Foreign selling stays in the weakest fifth and Nifty closes under this month's low.",
      },
      {
        name: "The selling starts to show in the price",
        support: "Heavy foreign selling has, in other months, been followed by further weakness when domestic buying did not keep up.",
        against: "This month's price has not confirmed that path yet.",
        strengthen: "The cover ratio falls under 0.5 and the four-week return turns down.",
        invalidate: "Foreign flow turns positive while the index is still holding.",
      },
    ];
  }
  if (input.indexDown && input.current && input.current.fii < 0) {
    return [
      {
        name: "The decline continues",
        support: "The index is already down with foreign selling, so price is not contradicting the flow.",
        against: "Domestic buying can still appear and slow the fall, as it has in other weak months.",
        strengthen: "The next month's foreign selling stays negative and the index makes a lower low.",
        invalidate: "Nifty reclaims this month's open and foreign selling stops.",
      },
    ];
  }
  return [
    {
      name: "The current mix continues",
      support: "There is no strong disagreement between the latest month's flow and the index.",
      against: "One month is a short sample, and the next print can reverse the mix.",
      strengthen: "The next two weeks keep the same flow signs and the index holds its direction.",
      invalidate: "Either flow changes sign and the index moves the other way.",
    },
  ];
}

function watchFor(input: { current: Point | undefined; fiiRank: number | null; cover: number | null; dd: number | null; fiiSellStreak: number; diiBuyStreak: number }): ResearchBrief["watch"] {
  const items: ResearchBrief["watch"] = [];
  if (input.current && input.fiiRank != null) {
    items.push({
      variable: "Foreign monthly net",
      now: `${cr(input.current.fii)}, ${input.fiiRank <= 0.5 ? `more negative than ${Math.round((1 - input.fiiRank) * 100)}%` : `more positive than ${Math.round(input.fiiRank * 100)}%`} of earlier months. Selling months in a row: ${input.fiiSellStreak}.`,
      change: "A finished month with foreign net above zero.",
      effect: "The heavy-selling description would no longer fit.",
    });
  }
  if (input.cover != null) {
    items.push({
      variable: "Domestic cover of foreign selling",
      now: `${input.cover.toFixed(2)} times. Domestic buying months in a row: ${input.diiBuyStreak}.`,
      change: "Cover falling below 0.5, or domestic flow turning negative.",
      effect: "The absorption description would fail.",
    });
  }
  if (input.dd != null) {
    items.push({
      variable: "Distance from the 252-session high",
      now: pct(input.dd),
      change: "A close back within 3% of that high, or a drawdown beyond 15%.",
      effect: "The first would put the index back in an uptrend. The second would mark a deeper decline than a normal dip.",
    });
  }
  return items.slice(0, 3);
}
