/** Deterministic institutional-flow desk. Every figure here is calculated in code. The model may only explain it. */

import { crore, flowDate } from "./flow-brief.ts";

export type DeskRow = {
  date: string;
  fiiNet: number;
  diiNet: number;
  indexReturn?: number | null;
  indexStart?: number | null;
  indexEnd?: number | null;
};

export const DESK_WINDOWS = [5, 10, 20, 60] as const;
export type DeskWindowSize = (typeof DESK_WINDOWS)[number];

export type DeskWindow = {
  asked: DeskWindowSize;
  have: number;
  complete: boolean;
  from: string | null;
  to: string | null;
  fii: number | null;
  dii: number | null;
  combined: number | null;
  fiiPositive: number | null;
  fiiNegative: number | null;
  diiPositive: number | null;
  diiNegative: number | null;
  /** Percent from the first session's prior close to the last close. Null if either print is missing. Not a sum of daily percents. */
  indexReturn: number | null;
};

export type DeskPoint = {
  date: string;
  fii: number;
  dii: number;
  combined: number;
  /** Running sum inside the full stored file, not inside a chart window. */
  cumFii: number;
  cumDii: number;
  /** Mean of the N published sessions ending this day. Null until N sessions exist. */
  roll5Fii: number | null;
  roll5Dii: number | null;
  roll20Fii: number | null;
  roll20Dii: number | null;
  indexEnd: number | null;
};

export type FlowEvidence = {
  changed: { id: string; fact: string; why: string }[];
  alignment: { label: string; text: string };
  history: string[];
  price: string;
  watch: string[];
  risks: string[];
};

export type FlowDesk = {
  sessions: number;
  latestDate: string | null;
  previousDate: string | null;
  latest: { fii: number; dii: number; combined: number; indexReturn: number | null } | null;
  previous: { fii: number; dii: number; combined: number } | null;
  deltaFii: number | null;
  deltaDii: number | null;
  windows: Record<DeskWindowSize, DeskWindow>;
  points: DeskPoint[];
  /** Midpoint rank of the latest print among every stored session. Null below 40 sessions. */
  percentile: { fii: number | null; dii: number | null; n: number; method: string };
  /** (latest − mean) / sample standard deviation. Null below 40 sessions or when the deviation is 0. */
  zscore: { fii: number | null; dii: number | null; n: number; method: string };
  evidence: FlowEvidence;
  materialKey: string;
  allowedNumbers: number[];
  returnNumbers: number[];
  dates: string[];
  lines: string[];
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MIN_RANK = 40;
const PERCENTILE_METHOD = "Midpoint rank among every stored daily session: (count below + half the ties) / n. Not calculated when fewer than 40 sessions are stored.";
const Z_METHOD = "Sample standard deviation of every stored daily session (divisor n−1). Not calculated when fewer than 40 sessions are stored.";

function sign(n: number) {
  if (n > 0) return "positive" as const;
  if (n < 0) return "negative" as const;
  return "flat" as const;
}

function allow(bag: Set<number>, n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return;
  bag.add(n);
  bag.add(Math.round(n));
  bag.add(Math.round(n * 10) / 10);
  bag.add(Math.round(n * 100) / 100);
}

function mean(values: number[], end: number, size: number) {
  if (end + 1 < size) return null;
  let sum = 0;
  for (let i = end - size + 1; i <= end; i++) sum += values[i];
  return sum / size;
}

function rank(values: number[], latest: number) {
  if (values.length < MIN_RANK) return null;
  const below = values.filter((value) => value < latest).length;
  const ties = values.filter((value) => value === latest).length;
  return ((below + ties / 2) / values.length) * 100;
}

function zOf(values: number[], latest: number) {
  if (values.length < MIN_RANK) return null;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  const sd = Math.sqrt(variance);
  if (!(sd > 0)) return null;
  return (latest - avg) / sd;
}

function spanReturn(rows: DeskRow[]) {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return null;
  if (!(first.indexStart != null && first.indexStart > 0 && last.indexEnd != null && last.indexEnd > 0)) return null;
  return (last.indexEnd / first.indexStart - 1) * 100;
}

function windowOf(rows: DeskRow[], asked: DeskWindowSize): DeskWindow {
  const slice = rows.slice(-asked);
  const complete = slice.length === asked;
  const fii = complete ? slice.reduce((sum, row) => sum + row.fiiNet, 0) : null;
  const dii = complete ? slice.reduce((sum, row) => sum + row.diiNet, 0) : null;
  return {
    asked,
    have: slice.length,
    complete,
    from: slice[0]?.date || null,
    to: slice[slice.length - 1]?.date || null,
    fii,
    dii,
    combined: fii != null && dii != null ? fii + dii : null,
    fiiPositive: complete ? slice.filter((row) => row.fiiNet > 0).length : null,
    fiiNegative: complete ? slice.filter((row) => row.fiiNet < 0).length : null,
    diiPositive: complete ? slice.filter((row) => row.diiNet > 0).length : null,
    diiNegative: complete ? slice.filter((row) => row.diiNet < 0).length : null,
    indexReturn: complete ? spanReturn(slice) : null,
  };
}

function clean(input: DeskRow[]) {
  const seen = new Set<string>();
  const rows: DeskRow[] = [];
  for (const row of input) {
    if (!ISO.test(row.date) || seen.has(row.date)) continue;
    if (!Number.isFinite(row.fiiNet) || !Number.isFinite(row.diiNet)) continue;
    seen.add(row.date);
    rows.push({
      date: row.date,
      fiiNet: row.fiiNet,
      diiNet: row.diiNet,
      indexReturn: row.indexReturn != null && Number.isFinite(row.indexReturn) ? row.indexReturn : null,
      indexStart: row.indexStart != null && row.indexStart > 0 ? row.indexStart : null,
      indexEnd: row.indexEnd != null && row.indexEnd > 0 ? row.indexEnd : null,
    });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function buildEvidence(rows: DeskRow[], windows: Record<DeskWindowSize, DeskWindow>, percentile: FlowDesk["percentile"], zscore: FlowDesk["zscore"]): FlowEvidence {
  const latest = rows[rows.length - 1];
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  const changed: FlowEvidence["changed"] = [];
  const history: string[] = [];
  const watch: string[] = [];
  const risks: string[] = [
    "Cash-market net flow is not the whole institutional book. Equity derivatives and other markets are not in this file.",
    "A published session can reverse on the next print. A short run of one sign is not a durable trend.",
    "These nets are released after the session. The file date is the trading session, not the time the page was opened.",
    "Flow data alone cannot establish the next index move.",
  ];
  if (!latest) {
    return {
      changed: [],
      alignment: { label: "No session", text: "No cash-flow session is stored." },
      history: [],
      price: "There is no session, so price confirmation is not assessed.",
      watch: [],
      risks,
    };
  }
  const five = windows[5];
  const twenty = windows[20];
  if (previous && sign(latest.fiiNet) !== sign(previous.fiiNet) && sign(latest.fiiNet) !== "flat" && sign(previous.fiiNet) !== "flat") {
    changed.push({
      id: "fii-flip",
      fact: `FII net changed sign: ${crore(previous.fiiNet)} on ${flowDate(previous.date)} and ${crore(latest.fiiNet)} on ${flowDate(latest.date)}.`,
      why: "A one-session reversal is a change in the print. It is not, by itself, a change in trend.",
    });
  }
  if (zscore.fii != null && Math.abs(zscore.fii) >= 2) {
    changed.push({
      id: "fii-z",
      fact: `The latest FII net is ${zscore.fii.toFixed(2)} sample standard deviations from the mean of ${zscore.n} stored sessions.`,
      why: "That is outside the usual range of this file. The reference window is every stored daily session, not a selected month.",
    });
  } else if (percentile.fii != null && (percentile.fii <= 10 || percentile.fii >= 90)) {
    changed.push({
      id: "fii-rank",
      fact: `The latest FII net sits at the ${percentile.fii.toFixed(0)} percentile of ${percentile.n} stored sessions (midpoint rank).`,
      why: "A reading near the edge of this file is unusual relative to the stored history. It is not a forecast.",
    });
  }
  if (five.complete && twenty.complete && five.fii != null && twenty.fii != null && sign(five.fii) !== sign(twenty.fii) && sign(five.fii) !== "flat" && sign(twenty.fii) !== "flat") {
    changed.push({
      id: "horizon",
      fact: `The 5-session FII sum is ${crore(five.fii)} (${flowDate(five.from)} to ${flowDate(five.to)}). The 20-session FII sum is ${crore(twenty.fii)} (${flowDate(twenty.from)} to ${flowDate(twenty.to)}).`,
      why: "The short window and the longer window have opposite signs, so the latest burst does not match the 20-session accumulation.",
    });
  }
  if (!changed.length) {
    changed.push({
      id: "quiet",
      fact: previous
        ? `FII stayed ${sign(latest.fiiNet)} from ${flowDate(previous.date)} (${crore(previous.fiiNet)}) to ${flowDate(latest.date)} (${crore(latest.fiiNet)}).`
        : `Only ${flowDate(latest.date)} is stored: FII ${crore(latest.fiiNet)}, DII ${crore(latest.diiNet)}.`,
      why: "Nothing in the latest comparison is a sign change or an extreme reading versus the stored history. No extra insight is being forced.",
    });
  }

  let alignment: FlowEvidence["alignment"];
  if (five.complete && five.fiiPositive != null && five.diiPositive != null && five.fiiNegative != null && five.diiNegative != null) {
    const slice = rows.slice(-5);
    const bothBuy = slice.filter((row) => row.fiiNet > 0 && row.diiNet > 0).length;
    const bothSell = slice.filter((row) => row.fiiNet < 0 && row.diiNet < 0).length;
    const offset = slice.filter((row) => row.fiiNet * row.diiNet < 0).length;
    const label = bothBuy >= 3 ? "Buying together" : bothSell >= 3 ? "Selling together" : offset >= 3 ? "Moving apart" : "Mixed";
    alignment = {
      label,
      text: `Over the last 5 published sessions (${flowDate(five.from)} to ${flowDate(five.to)}), both nets were positive in ${bothBuy} sessions, both were negative in ${bothSell}, and they had opposite signs in ${offset}. FII was positive in ${five.fiiPositive} of 5 and negative in ${five.fiiNegative}. DII was positive in ${five.diiPositive} of 5 and negative in ${five.diiNegative}. One session's sign is not a bullish or bearish label.`,
    };
  } else {
    alignment = {
      label: "Not enough sessions",
      text: `${rows.length} published sessions are stored. A 5-session alignment count needs 5 sessions, so it is withheld rather than filled with zeros.`,
    };
  }

  for (const size of DESK_WINDOWS) {
    const item = windows[size];
    if (!item.complete || item.fii == null || item.dii == null) {
      history.push(`${item.have} of ${size} sessions are stored. The ${size}-session total is withheld.`);
      continue;
    }
    history.push(
      `Last ${size} published sessions (${flowDate(item.from)} to ${flowDate(item.to)}): FII ${crore(item.fii)}, DII ${crore(item.dii)}, combined ${crore(item.combined || 0)}. FII positive in ${item.fiiPositive} and negative in ${item.fiiNegative}. DII positive in ${item.diiPositive} and negative in ${item.diiNegative}.`,
    );
  }
  if (percentile.fii != null) history.push(`Latest FII percentile: ${percentile.fii.toFixed(1)} of ${percentile.n} sessions. ${PERCENTILE_METHOD}`);
  else history.push(`FII percentile is not calculated. ${percentile.n} sessions are stored and ${MIN_RANK} are required. ${PERCENTILE_METHOD}`);
  if (zscore.fii != null) history.push(`Latest FII z-score: ${zscore.fii.toFixed(2)}. ${Z_METHOD}`);
  else history.push(`FII z-score is not calculated. ${Z_METHOD}`);

  let price: string;
  if (five.complete && five.combined != null && five.indexReturn != null) {
    const same = sign(five.combined) === sign(five.indexReturn) && sign(five.combined) !== "flat";
    const apart = sign(five.combined) !== "flat" && sign(five.indexReturn) !== "flat" && sign(five.combined) !== sign(five.indexReturn);
    price = same
      ? `Over ${flowDate(five.from)} to ${flowDate(five.to)}, combined FII+DII was ${crore(five.combined)} and Nifty returned ${pct(five.indexReturn)} from the first prior close to the last close. The signs match. That is not evidence that the flows caused the move.`
      : apart
        ? `Over ${flowDate(five.from)} to ${flowDate(five.to)}, combined FII+DII was ${crore(five.combined)} and Nifty returned ${pct(five.indexReturn)}. The signs differ, so price action does not confirm the flow direction. This is not a causal claim.`
        : `Over ${flowDate(five.from)} to ${flowDate(five.to)}, combined flow was ${crore(five.combined)} and Nifty returned ${pct(five.indexReturn)}. One of the two is flat, so confirmation is not assessed.`;
  } else if (five.complete && five.indexReturn == null) {
    price = `The 5-session index return is unavailable because a prior close or a last close is missing between ${flowDate(five.from)} and ${flowDate(five.to)}. Price confirmation is not assessed. Missing closes are not treated as zero.`;
  } else {
    price = "Fewer than 5 sessions are stored, so the flow-versus-price check is withheld.";
  }

  if (five.complete && five.fii != null) watch.push(`Whether the next published FII nets stay ${sign(latest.fiiNet)} long enough to move the 5-session sum (${crore(five.fii)}).`);
  if (five.complete && twenty.complete && five.fii != null && twenty.fii != null) {
    watch.push(`Whether the 5-session FII sum (${crore(five.fii)}) starts to agree with the 20-session sum (${crore(twenty.fii)}).`);
  }
  watch.push(`Whether DII's latest print (${crore(latest.diiNet)} on ${flowDate(latest.date)}) keeps the same sign on the next published session.`);
  if (five.indexReturn != null) watch.push(`Whether the next Nifty sessions keep the ${pct(five.indexReturn)} 5-session direction or diverge from the combined cash net.`);
  return { changed: changed.slice(0, 4), alignment, history, price, watch: watch.slice(0, 4), risks };
}

export function buildFlowDesk(input: DeskRow[]): FlowDesk {
  const rows = clean(input);
  const bag = new Set<number>([0, 5, 10, 20, 40, 60]);
  const returns: number[] = [];
  const dates: string[] = [];
  const windows = {
    5: windowOf(rows, 5),
    10: windowOf(rows, 10),
    20: windowOf(rows, 20),
    60: windowOf(rows, 60),
  } satisfies Record<DeskWindowSize, DeskWindow>;
  const fiiSeries = rows.map((row) => row.fiiNet);
  const diiSeries = rows.map((row) => row.diiNet);
  let cumFii = 0;
  let cumDii = 0;
  const points: DeskPoint[] = rows.map((row, index) => {
    cumFii += row.fiiNet;
    cumDii += row.diiNet;
    return {
      date: row.date,
      fii: row.fiiNet,
      dii: row.diiNet,
      combined: row.fiiNet + row.diiNet,
      cumFii,
      cumDii,
      roll5Fii: mean(fiiSeries, index, 5),
      roll5Dii: mean(diiSeries, index, 5),
      roll20Fii: mean(fiiSeries, index, 20),
      roll20Dii: mean(diiSeries, index, 20),
      indexEnd: row.indexEnd ?? null,
    };
  });
  const latest = rows[rows.length - 1] || null;
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  const percentile = {
    fii: latest ? rank(fiiSeries, latest.fiiNet) : null,
    dii: latest ? rank(diiSeries, latest.diiNet) : null,
    n: rows.length,
    method: PERCENTILE_METHOD,
  };
  const zscore = {
    fii: latest ? zOf(fiiSeries, latest.fiiNet) : null,
    dii: latest ? zOf(diiSeries, latest.diiNet) : null,
    n: rows.length,
    method: Z_METHOD,
  };
  const recent = rows.slice(-60);
  for (const row of recent) {
    dates.push(row.date);
    allow(bag, row.fiiNet);
    allow(bag, row.diiNet);
    allow(bag, row.fiiNet + row.diiNet);
    if (row.indexReturn != null) {
      const tenth = Math.round(row.indexReturn * 10) / 10;
      const hundredth = Math.round(row.indexReturn * 100) / 100;
      returns.push(row.indexReturn, tenth, hundredth);
    }
  }
  allow(bag, rows.length);
  if (latest && previous) {
    allow(bag, latest.fiiNet - previous.fiiNet);
    allow(bag, latest.diiNet - previous.diiNet);
    allow(bag, latest.fiiNet + latest.diiNet - (previous.fiiNet + previous.diiNet));
  }
  for (const item of Object.values(windows)) {
    allow(bag, item.have);
    allow(bag, item.fii);
    allow(bag, item.dii);
    allow(bag, item.combined);
    allow(bag, item.fiiPositive);
    allow(bag, item.fiiNegative);
    allow(bag, item.diiPositive);
    allow(bag, item.diiNegative);
    if (item.indexReturn != null) {
      const tenth = Math.round(item.indexReturn * 10) / 10;
      const hundredth = Math.round(item.indexReturn * 100) / 100;
      returns.push(item.indexReturn, tenth, hundredth);
      allow(bag, item.indexReturn);
    }
    if (item.from) dates.push(item.from);
    if (item.to) dates.push(item.to);
  }
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    allow(bag, lastPoint.roll5Fii);
    allow(bag, lastPoint.roll5Dii);
    allow(bag, lastPoint.roll20Fii);
    allow(bag, lastPoint.roll20Dii);
  }
  allow(bag, percentile.fii);
  allow(bag, percentile.dii);
  allow(bag, zscore.fii);
  allow(bag, zscore.dii);
  const evidence = buildEvidence(rows, windows, percentile, zscore);
  const lines = approveLines({
    latest,
    previous,
    windows,
    lastPoint,
    percentile,
    zscore,
    sessions: rows.length,
  });
  return {
    sessions: rows.length,
    latestDate: latest?.date || null,
    previousDate: previous?.date || null,
    latest: latest ? { fii: latest.fiiNet, dii: latest.diiNet, combined: latest.fiiNet + latest.diiNet, indexReturn: latest.indexReturn ?? null } : null,
    previous: previous ? { fii: previous.fiiNet, dii: previous.diiNet, combined: previous.fiiNet + previous.diiNet } : null,
    deltaFii: latest && previous ? latest.fiiNet - previous.fiiNet : null,
    deltaDii: latest && previous ? latest.diiNet - previous.diiNet : null,
    windows,
    points,
    percentile,
    zscore,
    evidence,
    materialKey: latest ? `${latest.date}|${latest.fiiNet}|${latest.diiNet}|${rows.length}` : "empty",
    allowedNumbers: [...bag],
    returnNumbers: returns,
    dates: [...new Set(dates)],
    lines,
  };
}

function approveLines(input: {
  latest: DeskRow | null;
  previous: DeskRow | null;
  windows: Record<DeskWindowSize, DeskWindow>;
  lastPoint: DeskPoint | undefined;
  percentile: FlowDesk["percentile"];
  zscore: FlowDesk["zscore"];
  sessions: number;
}) {
  const lines: string[] = [];
  if (!input.latest) {
    lines.push("No cash-flow session is stored. Do not cite a rupee amount, a percent, or a date.");
    return lines;
  }
  lines.push(`Latest session ${input.latest.date}: FII ${crore(input.latest.fiiNet)}, DII ${crore(input.latest.diiNet)}, combined ${crore(input.latest.fiiNet + input.latest.diiNet)}.`);
  if (input.previous) {
    const dFii = input.latest.fiiNet - input.previous.fiiNet;
    const dDii = input.latest.diiNet - input.previous.diiNet;
    lines.push(`Previous session ${input.previous.date}: FII ${crore(input.previous.fiiNet)}, DII ${crore(input.previous.diiNet)}, combined ${crore(input.previous.fiiNet + input.previous.diiNet)}.`);
    lines.push(`Change versus the previous session: FII ${crore(dFii)}, DII ${crore(dDii)}, combined ${crore(dFii + dDii)}.`);
  }
  if (input.latest.indexReturn == null) lines.push(`No daily index return is stored for ${input.latest.date}.`);
  else lines.push(`Nifty daily return on ${input.latest.date}: ${input.latest.indexReturn >= 0 ? "+" : ""}${input.latest.indexReturn.toFixed(1)}%. This is the session return, not a multi-session return.`);
  for (const item of Object.values(input.windows)) {
    if (!item.complete || item.fii == null || item.dii == null) {
      lines.push(`${item.have} of ${item.asked} sessions are stored. The ${item.asked}-session total is not available. Do not invent it.`);
      continue;
    }
    lines.push(`Last ${item.asked} sessions (${item.from} to ${item.to}): FII ${crore(item.fii)}, DII ${crore(item.dii)}, combined ${crore(item.combined || 0)}. FII positive ${item.fiiPositive}, negative ${item.fiiNegative}. DII positive ${item.diiPositive}, negative ${item.diiNegative}.`);
    if (item.indexReturn == null) lines.push(`The ${item.asked}-session Nifty return is not available. Do not cite one.`);
    else lines.push(`Nifty return over the last ${item.asked} sessions, from the first prior close to the last close: ${item.indexReturn >= 0 ? "+" : ""}${item.indexReturn.toFixed(1)}%.`);
  }
  if (input.lastPoint?.roll5Fii != null && input.lastPoint.roll5Dii != null) {
    lines.push(`5-session rolling average ending ${input.latest.date}: FII ${crore(input.lastPoint.roll5Fii)}, DII ${crore(input.lastPoint.roll5Dii)}. This is the mean of 5 published sessions, not a calendar week.`);
  }
  if (input.lastPoint?.roll20Fii != null && input.lastPoint.roll20Dii != null) {
    lines.push(`20-session rolling average ending ${input.latest.date}: FII ${crore(input.lastPoint.roll20Fii)}, DII ${crore(input.lastPoint.roll20Dii)}.`);
  } else lines.push("The 20-session rolling average is not available.");
  if (input.percentile.fii != null) lines.push(`Latest FII percentile ${input.percentile.fii.toFixed(1)} of ${input.percentile.n} sessions. ${input.percentile.method}`);
  else lines.push(`FII percentile is not calculated (${input.percentile.n} stored sessions).`);
  if (input.zscore.fii != null) lines.push(`Latest FII z-score ${input.zscore.fii.toFixed(2)}. ${input.zscore.method}`);
  else lines.push("FII z-score is not calculated.");
  lines.push(`${input.sessions} published sessions are stored. Do not cite gross buy or sell, a probability, an index level, or any number that is not written above.`);
  return lines;
}

/** Last `size` points. Null when the file is shorter than the window — nothing is padded with zero. */
export function deskWindowPoints(desk: FlowDesk, size: DeskWindowSize) {
  if (desk.points.length < size) return null;
  return desk.points.slice(-size);
}
