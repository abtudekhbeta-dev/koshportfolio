/** Deterministic cash-flow reading. The model may explain these figures. It does not create them. */

export type FlowBriefRow = {
  date: string;
  fiiNet: number;
  diiNet: number;
  indexReturn?: number | null;
};

export type FlowWindowBrief = {
  asked: 5 | 20;
  have: number;
  complete: boolean;
  fii: number | null;
  dii: number | null;
  fiiPositive: number;
  diiPositive: number;
  from: string | null;
  to: string | null;
  priorComplete: boolean;
  priorFii: number | null;
  priorDii: number | null;
  priorFrom: string | null;
  priorTo: string | null;
};

export type FlowFact = { id: string; text: string };

export type FlowBrief = {
  sessions: number;
  dates: string[];
  latestDate: string | null;
  previousDate: string | null;
  latest: { fii: number; dii: number; indexReturn: number | null } | null;
  previous: { fii: number; dii: number; indexReturn: number | null } | null;
  deltaFii: number | null;
  deltaDii: number | null;
  windows: FlowWindowBrief[];
  fiiStreak: { sign: "positive" | "negative" | "flat"; count: number };
  diiStreak: { sign: "positive" | "negative" | "flat"; count: number };
  aligned: "same-positive" | "same-negative" | "offsetting" | "flat" | "unknown";
  facts: FlowFact[];
  signals: FlowFact[];
  risks: string[];
  watch: string[];
  reading: string;
  materialKey: string;
  allowedNumbers: number[];
  /** Index returns only. A percent in model prose must match one of these, not a crore figure. */
  returnNumbers: number[];
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function sign(n: number): "positive" | "negative" | "flat" {
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "flat";
}

export function crore(n: number) {
  const abs = Math.abs(n);
  const body =
    Math.abs(abs - Math.round(abs)) < 0.005
      ? Math.round(abs).toLocaleString("en-IN")
      : abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n > 0) return `+₹${body} Cr`;
  if (n < 0) return `−₹${body} Cr`;
  return "₹0 Cr";
}

export function flowDate(iso: string | null) {
  if (!iso || !ISO.test(iso)) return "—";
  const [year, month, day] = iso.split("-").map(Number);
  const name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1] || "";
  return `${day} ${name} ${year}`;
}

function pct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function allow(bag: Set<number>, n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return;
  bag.add(n);
  bag.add(Math.round(n));
  bag.add(Math.round(n * 10) / 10);
  bag.add(Math.round(n * 100) / 100);
}

function streak(values: number[]) {
  if (!values.length) return { sign: "flat" as const, count: 0 };
  const latest = sign(values[values.length - 1]);
  let count = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if (sign(values[i]) !== latest) break;
    count += 1;
  }
  return { sign: latest, count };
}

function windowOf(rows: FlowBriefRow[], asked: 5 | 20, endExclusive: number): FlowWindowBrief {
  const slice = rows.slice(Math.max(0, endExclusive - asked), endExclusive);
  const prior = rows.slice(Math.max(0, endExclusive - asked * 2), Math.max(0, endExclusive - asked));
  const complete = slice.length === asked;
  const priorComplete = prior.length === asked;
  const sum = (list: FlowBriefRow[]) => ({
    fii: list.reduce((total, row) => total + row.fiiNet, 0),
    dii: list.reduce((total, row) => total + row.diiNet, 0),
  });
  const totals = slice.length ? sum(slice) : null;
  const priorTotals = priorComplete ? sum(prior) : null;
  return {
    asked,
    have: slice.length,
    complete,
    fii: complete && totals ? totals.fii : null,
    dii: complete && totals ? totals.dii : null,
    fiiPositive: slice.filter((row) => row.fiiNet > 0).length,
    diiPositive: slice.filter((row) => row.diiNet > 0).length,
    from: slice[0]?.date || null,
    to: slice[slice.length - 1]?.date || null,
    priorComplete,
    priorFii: priorTotals ? priorTotals.fii : null,
    priorDii: priorTotals ? priorTotals.dii : null,
    priorFrom: priorComplete ? prior[0].date : null,
    priorTo: priorComplete ? prior[prior.length - 1].date : null,
  };
}

export function flowBrief(input: FlowBriefRow[]): FlowBrief {
  const seen = new Set<string>();
  const rows: FlowBriefRow[] = [];
  for (const row of input) {
    if (!ISO.test(row.date) || seen.has(row.date)) continue;
    if (!Number.isFinite(row.fiiNet) || !Number.isFinite(row.diiNet)) continue;
    seen.add(row.date);
    const indexReturn = row.indexReturn != null && Number.isFinite(row.indexReturn) ? row.indexReturn : null;
    rows.push({ date: row.date, fiiNet: row.fiiNet, diiNet: row.diiNet, indexReturn });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  const bag = new Set<number>([0, 5, 10, 20, 60]);
  const returns: number[] = [];
  const approvedDates: string[] = [];
  allow(bag, rows.length);

  function allowDate(iso: string | null) {
    if (!iso || !ISO.test(iso) || approvedDates.includes(iso)) return;
    approvedDates.push(iso);
    const [year, month, day] = iso.split("-").map(Number);
    allow(bag, year);
    allow(bag, month);
    allow(bag, day);
  }
  function allowReturn(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return;
    const tenth = Math.round(value * 10) / 10;
    const hundredth = Math.round(value * 100) / 100;
    allow(bag, value);
    allow(bag, tenth);
    allow(bag, hundredth);
    returns.push(value, tenth, hundredth);
  }
  function allowPair(fii: number | null | undefined, dii: number | null | undefined) {
    allow(bag, fii);
    allow(bag, dii);
    if (fii != null && dii != null && Number.isFinite(fii) && Number.isFinite(dii)) allow(bag, fii + dii);
  }

  const latest = rows[rows.length - 1] || null;
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  const deltaFii = latest && previous ? latest.fiiNet - previous.fiiNet : null;
  const deltaDii = latest && previous ? latest.diiNet - previous.diiNet : null;
  allowPair(latest?.fiiNet, latest?.diiNet);
  allowPair(previous?.fiiNet, previous?.diiNet);
  allowPair(deltaFii, deltaDii);
  allowDate(latest?.date || null);
  allowDate(previous?.date || null);
  allowReturn(latest?.indexReturn);
  allowReturn(previous?.indexReturn);
  const windows = [windowOf(rows, 5, rows.length), windowOf(rows, 20, rows.length)];
  for (const item of windows) {
    allow(bag, item.have);
    allowPair(item.fii, item.dii);
    allow(bag, item.fiiPositive);
    allow(bag, item.diiPositive);
    allowPair(item.priorFii, item.priorDii);
    allow(bag, item.asked - item.have);
    allowDate(item.from);
    allowDate(item.to);
    allowDate(item.priorFrom);
    allowDate(item.priorTo);
  }
  const fiiStreak = streak(rows.map((row) => row.fiiNet));
  const diiStreak = streak(rows.map((row) => row.diiNet));
  allow(bag, fiiStreak.count);
  allow(bag, diiStreak.count);

  let aligned: FlowBrief["aligned"] = "unknown";
  if (latest) {
    const fii = sign(latest.fiiNet);
    const dii = sign(latest.diiNet);
    if (fii === "flat" || dii === "flat") aligned = "flat";
    else if (fii === dii && fii === "positive") aligned = "same-positive";
    else if (fii === dii) aligned = "same-negative";
    else aligned = "offsetting";
  }

  const facts: FlowFact[] = [];
  const signals: FlowFact[] = [];
  const risks: string[] = [];
  const watch: string[] = [];

  if (!latest) {
    facts.push({ id: "empty", text: "No cash-flow sessions are stored." });
    risks.push("There is no published session to read.");
  } else {
    facts.push({
      id: "latest",
      text: `Latest published session ${flowDate(latest.date)}: FII net ${crore(latest.fiiNet)}, DII net ${crore(latest.diiNet)}.`,
    });
    if (previous && deltaFii != null && deltaDii != null) {
      facts.push({
        id: "delta",
        text: `From ${flowDate(previous.date)} to ${flowDate(latest.date)}, FII net changed by ${crore(deltaFii)} and DII net changed by ${crore(deltaDii)}.`,
      });
      if (sign(latest.fiiNet) !== sign(previous.fiiNet) && sign(latest.fiiNet) !== "flat" && sign(previous.fiiNet) !== "flat") {
        facts.push({
          id: "fii-flip",
          text: `FII net changed sign: ${crore(previous.fiiNet)} on ${flowDate(previous.date)} and ${crore(latest.fiiNet)} on ${flowDate(latest.date)}.`,
        });
        signals.push({
          id: "fii-flip-signal",
          text: `The latest FII print reversed the previous session (${flowDate(previous.date)} ${crore(previous.fiiNet)} to ${flowDate(latest.date)} ${crore(latest.fiiNet)}).`,
        });
        risks.push("The latest FII session reversed the one before it, so a one-day sign is not a settled trend.");
        watch.push(`Whether the next published FII net stays ${sign(latest.fiiNet)} after ${flowDate(latest.date)}.`);
      }
    }
    if (aligned === "offsetting") {
      facts.push({
        id: "offset",
        text: `On ${flowDate(latest.date)} the two nets have opposite signs.`,
      });
      signals.push({
        id: "offset-signal",
        text: `FII ${crore(latest.fiiNet)} and DII ${crore(latest.diiNet)} offset each other on ${flowDate(latest.date)}.`,
      });
    } else if (aligned === "same-positive" || aligned === "same-negative") {
      signals.push({
        id: "aligned-signal",
        text: `FII and DII nets were both ${aligned === "same-positive" ? "positive" : "negative"} on ${flowDate(latest.date)}.`,
      });
    }
    if (diiStreak.count >= 3 && diiStreak.sign !== "flat") {
      const sentence = `DII net was ${diiStreak.sign} in ${diiStreak.count} consecutive published sessions through ${flowDate(latest.date)}.`;
      facts.push({ id: "dii-streak", text: sentence });
      signals.push({ id: "dii-streak-signal", text: sentence });
    }
    if (fiiStreak.count >= 3 && fiiStreak.sign !== "flat") {
      signals.push({
        id: "fii-streak-signal",
        text: `FII net was ${fiiStreak.sign} in ${fiiStreak.count} consecutive published sessions through ${flowDate(latest.date)}.`,
      });
    }
    if (latest.indexReturn == null) {
      risks.push(`No index return is stored for ${flowDate(latest.date)}, so this reading does not use price action.`);
    } else if (previous?.indexReturn != null) {
      facts.push({
        id: "index",
        text: `Nifty return on the flow dates was ${pct(latest.indexReturn)} on ${flowDate(latest.date)} and ${pct(previous.indexReturn)} on ${flowDate(previous.date)}. A matching sign is not proof that flows caused the move.`,
      });
    }
    for (const item of windows) {
      if (!item.complete || item.fii == null || item.dii == null) {
        facts.push({
          id: `window-${item.asked}-short`,
          text: `${item.have} of ${item.asked} sessions are stored. The ${item.asked}-session total is withheld.`,
        });
        continue;
      }
      let text = `Last ${item.asked} sessions (${flowDate(item.from)} to ${flowDate(item.to)}): FII ${crore(item.fii)}, DII ${crore(item.dii)}. FII was positive in ${item.fiiPositive} of ${item.asked}; DII was positive in ${item.diiPositive} of ${item.asked}.`;
      if (item.priorComplete && item.priorFii != null && item.priorDii != null) {
        text += ` The previous ${item.asked} (${flowDate(item.priorFrom)} to ${flowDate(item.priorTo)}) were FII ${crore(item.priorFii)} and DII ${crore(item.priorDii)}.`;
        if (sign(item.fii) !== sign(item.priorFii) && sign(item.fii) !== "flat" && sign(item.priorFii) !== "flat") {
          signals.push({
            id: `window-${item.asked}-shift`,
            text: `The ${item.asked}-session FII sum changed sign versus the previous ${item.asked} sessions (${crore(item.priorFii)} then ${crore(item.fii)}).`,
          });
        }
      }
      facts.push({ id: `window-${item.asked}`, text });
      signals.push({
        id: `window-${item.asked}-count`,
        text: `DII net was positive in ${item.diiPositive} of the last ${item.asked} sessions. FII net was positive in ${item.fiiPositive} of those sessions.`,
      });
    }
    const five = windows[0];
    const twenty = windows[1];
    if (five.complete && twenty.complete && five.fii != null && twenty.fii != null && sign(five.fii) !== sign(twenty.fii) && sign(five.fii) !== "flat" && sign(twenty.fii) !== "flat") {
      watch.push("Whether the next sessions move the 5-session FII sum toward the 20-session sum, or further away.");
    }
    if (aligned === "offsetting") {
      watch.push(`Whether DII stays ${sign(latest.diiNet)} if the next FII print keeps the ${flowDate(latest.date)} sign.`);
    }
    if (fiiStreak.count <= 2) {
      risks.push(`The current FII sign covers ${fiiStreak.count} session${fiiStreak.count === 1 ? "" : "s"}. That is too short to call a durable trend.`);
    }
    if (rows.length < 20) risks.push("The stored file has fewer than 20 sessions in this reading, so the longer window is not compared.");
    watch.push("Whether a later published session changes the latest net, or the file simply has not been updated yet.");
  }

  const unique = (items: string[]) => [...new Set(items)].slice(0, 4);
  const reading = !latest
    ? "There is not enough recorded flow data for a reading."
    : aligned === "offsetting"
      ? `On ${flowDate(latest.date)} foreign and domestic cash nets point in opposite directions. That describes the prints. It does not say which one will dominate the next session, and it is not a forecast of the index.`
      : aligned === "same-positive" || aligned === "same-negative"
        ? `On ${flowDate(latest.date)} both nets are ${aligned === "same-positive" ? "positive" : "negative"}. Agreement on one session is not evidence that the move will continue.`
        : `The ${flowDate(latest.date)} print does not give a clean agreement between the two nets. Nothing here is a forecast.`;

  const materialKey = latest ? `${latest.date}|${latest.fiiNet}|${latest.diiNet}|${rows.length}` : "empty";
  return {
    sessions: rows.length,
    dates: approvedDates,
    latestDate: latest?.date || null,
    previousDate: previous?.date || null,
    latest: latest ? { fii: latest.fiiNet, dii: latest.diiNet, indexReturn: latest.indexReturn ?? null } : null,
    previous: previous ? { fii: previous.fiiNet, dii: previous.diiNet, indexReturn: previous.indexReturn ?? null } : null,
    deltaFii,
    deltaDii,
    windows,
    fiiStreak,
    diiStreak,
    aligned,
    facts,
    signals: signals.slice(0, 6),
    risks: unique(risks),
    watch: unique(watch),
    reading,
    materialKey,
    allowedNumbers: [...bag],
    returnNumbers: returns,
  };
}

function closeEnough(allowed: number, value: number) {
  const scale = Math.max(Math.abs(allowed), Math.abs(value));
  if (scale < 20) return Math.abs(allowed - value) <= 0.06;
  if (Math.abs(allowed - value) <= 1) return true;
  if (scale >= 50 && Math.abs(allowed - value) / scale <= 0.015) return true;
  return false;
}

function sameFigure(allowed: number, value: number) {
  return closeEnough(allowed, value) || closeEnough(Math.abs(allowed), Math.abs(value));
}

/** Returns the first number or date in the prose that is not an approved figure. Null means it stayed inside the brief. */
export function foreignClaim(text: string, brief: Pick<FlowBrief, "allowedNumbers" | "dates" | "returnNumbers">): string | null {
  const known = new Set(brief.dates);
  const normalized = text.replace(/[−–—]/g, "-");
  const dates = normalized.match(/\d{4}-\d{2}-\d{2}/g) || [];
  for (const date of dates) {
    if (!known.has(date)) return date;
  }
  const stripped = normalized.replace(/\d{4}-\d{2}-\d{2}/g, " ");
  const matches = stripped.match(/-?\d{1,3}(?:,\d{2,3})+(?:\.\d+)?|-?\d+(?:\.\d+)?/g) || [];
  for (const token of matches) {
    const percent = new RegExp(`(?:^|[^\\d])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*%`).test(stripped);
    const value = Number(token.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    const pool = percent ? brief.returnNumbers : brief.allowedNumbers;
    const ok = pool.some((item) => sameFigure(item, value));
    if (!ok) return percent ? `${token}%` : token;
  }
  return null;
}

/** Drops sentences that cite an unapproved figure. Keeps the sentence when nothing verifiable remains. */
export function withoutForeignSentences(text: string, brief: Pick<FlowBrief, "allowedNumbers" | "dates" | "returnNumbers">): { text: string; stray: string | null } {
  const stray = foreignClaim(text, brief);
  if (!stray) return { text: text.trim(), stray: null };
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const kept = sentences.filter((sentence) => !foreignClaim(sentence, brief));
  const next = kept.join(" ").trim();
  if (next.length < 40) return { text: text.trim(), stray };
  return { text: next, stray };
}

/** Figures the model is allowed to cite. No other arithmetic is approved. */
export function approvedBrief(brief: FlowBrief): string[] {
  const lines: string[] = [];
  if (!brief.latest || !brief.latestDate) {
    lines.push("No cash-flow session is stored. Do not cite a rupee amount or a percent.");
    return lines;
  }
  const combined = brief.latest.fii + brief.latest.dii;
  lines.push(`Latest session ${brief.latestDate}: FII ${crore(brief.latest.fii)}, DII ${crore(brief.latest.dii)}, combined FII+DII ${crore(combined)}.`);
  if (brief.previous && brief.previousDate && brief.deltaFii != null && brief.deltaDii != null) {
    lines.push(`Previous session ${brief.previousDate}: FII ${crore(brief.previous.fii)}, DII ${crore(brief.previous.dii)}, combined ${crore(brief.previous.fii + brief.previous.dii)}.`);
    lines.push(`Change versus the previous session: FII ${crore(brief.deltaFii)}, DII ${crore(brief.deltaDii)}, combined ${crore(brief.deltaFii + brief.deltaDii)}.`);
  }
  if (brief.latest.indexReturn == null) lines.push(`No index return is stored for ${brief.latestDate}. Do not cite a percent.`);
  else lines.push(`Nifty return on ${brief.latestDate}: ${brief.latest.indexReturn >= 0 ? "+" : ""}${brief.latest.indexReturn.toFixed(1)}%.`);
  if (brief.previous?.indexReturn != null && brief.previousDate) {
    lines.push(`Nifty return on ${brief.previousDate}: ${brief.previous.indexReturn >= 0 ? "+" : ""}${brief.previous.indexReturn.toFixed(1)}%.`);
  }
  for (const item of brief.windows) {
    if (!item.complete || item.fii == null || item.dii == null) {
      lines.push(`${item.have} of ${item.asked} sessions are stored. The ${item.asked}-session total is not available.`);
      continue;
    }
    lines.push(`Last ${item.asked} sessions (${item.from} to ${item.to}): FII ${crore(item.fii)}, DII ${crore(item.dii)}, combined ${crore(item.fii + item.dii)}. FII positive in ${item.fiiPositive} of ${item.asked}. DII positive in ${item.diiPositive} of ${item.asked}.`);
    if (item.priorComplete && item.priorFii != null && item.priorDii != null) {
      lines.push(`Previous ${item.asked} sessions (${item.priorFrom} to ${item.priorTo}): FII ${crore(item.priorFii)}, DII ${crore(item.priorDii)}.`);
    }
  }
  lines.push(`FII sign is ${brief.fiiStreak.sign} for ${brief.fiiStreak.count} consecutive published sessions. DII sign is ${brief.diiStreak.sign} for ${brief.diiStreak.count}.`);
  lines.push(`${brief.sessions} published sessions are stored. Do not cite any other number, date, percent, ratio, index level, or gross buy or sell.`);
  return lines;
}
