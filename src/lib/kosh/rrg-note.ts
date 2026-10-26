export const NOTE_KEYS = ["overview", "leading", "improving", "fading", "lagging", "transitions", "timeframes", "shortlist"] as const;
export type NoteKey = (typeof NOTE_KEYS)[number];
export type RotationNote = Partial<Record<NoteKey, string>>;

export type RotationFact = {
  symbol: string;
  name: string;
  date: string | null;
  quadrant: string | null;
  previous: string | null;
  rsRatio: number | null;
  rsMomentum: number | null;
  ratioChange: number | null;
  momentumChange: number | null;
  relativeReturn: number | null;
  absoluteReturn: number | null;
  direction: string;
  tail: { date: string; rsRatio: number; rsMomentum: number; quadrant: string | null }[];
  daily?: string | null;
  weekly?: string | null;
  monthly?: string | null;
};

export type RotationRequest = {
  benchmark: string;
  timeframe: string;
  asOf: string | null;
  historical: boolean;
  readings: RotationFact[];
};

const NOTE_TITLES: Record<NoteKey, string> = {
  overview: "Market rotation",
  leading: "Leading and improving",
  improving: "Leading and improving",
  fading: "Fading leaders and lagging",
  lagging: "Fading leaders and lagging",
  transitions: "Transitions",
  timeframes: "Multi-timeframe confirmation",
  shortlist: "Risks and conflicting evidence",
};

export function noteTitle(key: NoteKey) {
  return NOTE_TITLES[key];
}

export function rotationRequest(input: {
  benchmark: string;
  timeframe: string;
  asOf: string;
  readings: Array<{
    symbol: string;
    name: string;
    asOf: string | null;
    quadrant: string | null;
    previousQuadrant: string | null;
    rsRatio: number | null;
    rsMomentum: number | null;
    relativeReturn: number | null;
    absoluteReturn: number | null;
    direction: string;
    tail: { date: string; rsRatio: number; rsMomentum: number; quadrant: string | null }[];
  }>;
  cross: Array<{ symbol: string; daily: string | null; weekly: string | null; monthly: string | null }>;
}): RotationRequest | { error: string } {
  const readings = input.readings.filter((row) => row.rsRatio != null && row.rsMomentum != null).slice(0, 24);
  if (!readings.length) return { error: "Nothing on this date has both an RS-Ratio and RS-Momentum." };
  return {
    benchmark: input.benchmark,
    timeframe: input.timeframe,
    asOf: input.asOf || readings[0]?.asOf || null,
    historical: Boolean(input.asOf),
    readings: readings.map((row) => {
      const cross = input.cross.find((item) => item.symbol === row.symbol);
      const prev = row.tail.at(-2);
      const last = row.tail.at(-1);
      const fact: RotationFact = {
        symbol: row.symbol,
        name: row.name,
        date: row.asOf,
        quadrant: row.quadrant,
        previous: row.previousQuadrant,
        rsRatio: row.rsRatio,
        rsMomentum: row.rsMomentum,
        ratioChange: prev && last ? last.rsRatio - prev.rsRatio : null,
        momentumChange: prev && last ? last.rsMomentum - prev.rsMomentum : null,
        relativeReturn: row.relativeReturn,
        absoluteReturn: row.absoluteReturn,
        direction: row.direction,
        tail: row.tail.slice(-8),
      };
      if (cross && (cross.daily || cross.weekly || cross.monthly)) {
        fact.daily = cross.daily;
        fact.weekly = cross.weekly;
        fact.monthly = cross.monthly;
      }
      return fact;
    }),
  };
}

export function parseRotationNote(text: string): { ok: true; note: RotationNote } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The model did not return a readable note." };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, error: "The model did not return a readable note." };
  const note: RotationNote = {};
  let filled = 0;
  for (const key of NOTE_KEYS) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value !== "string") continue;
    const clean = value.trim();
    if (!clean) continue;
    note[key] = clean;
    filled += 1;
  }
  if (!filled) return { ok: false, error: "The model returned an empty note." };
  return { ok: true, note };
}

export function upstreamFailure(status: number) {
  if (status === 401 || status === 403) return { status: 502, error: "The model rejected the request." };
  if (status === 429) return { status: 429, error: "The model is busy. Try again in a moment." };
  if (status === 408 || status === 504) return { status: 504, error: "The model took too long." };
  return { status: 502, error: "The model did not answer." };
}

/** Keep the previous chart only while the benchmark is unchanged. */
export function keepIfSameBenchmark(previousKey: readonly unknown[] | undefined, benchmark: string) {
  return previousKey?.[3] === benchmark;
}

export type VerdictClass = "good" | "bad" | "mixed";
export type VerdictConfidence = "high" | "moderate" | "low";

export type StockVerdict = {
  symbol: string;
  name: string;
  verdict: VerdictClass;
  confidence: VerdictConfidence;
  quadrant: string | null;
  rsRatio: number;
  rsMomentum: number;
  ratioChange: number | null;
  momentumChange: number | null;
  relativeReturn: number | null;
  absoluteReturn: number | null;
  trail: string;
  daily: string | null;
  weekly: string | null;
  monthly: string | null;
  why: string;
  risk: string;
  asOf: string | null;
};

type VerdictInput = {
  symbol: string;
  name: string;
  quadrant: string | null;
  rsRatio: number | null;
  rsMomentum: number | null;
  relativeReturn: number | null;
  absoluteReturn: number | null;
  asOf: string | null;
  tail: { quadrant: string | null; rsRatio: number; rsMomentum: number }[];
};

/** Classifies the selected snapshot. Leading is not automatically good, and lagging is not automatically bad. */
export function classifyVerdicts(
  rows: VerdictInput[],
  cross: { symbol: string; daily: string | null; weekly: string | null; monthly: string | null }[],
): StockVerdict[] {
  return rows.flatMap((row) => {
    if (row.rsRatio == null || row.rsMomentum == null || !row.quadrant) return [];
    const previous = row.tail.at(-2);
    const latest = row.tail.at(-1);
    const ratioChange = previous && latest ? latest.rsRatio - previous.rsRatio : null;
    const momentumChange = previous && latest ? latest.rsMomentum - previous.rsMomentum : null;
    const momUp = (momentumChange ?? 0) > 0.05;
    const momDown = (momentumChange ?? 0) < -0.05;
    const ratioDown = (ratioChange ?? 0) < -0.05;
    const frame = cross.find((item) => item.symbol === row.symbol);
    const frames = [frame?.daily ?? null, frame?.weekly ?? null, frame?.monthly ?? null];
    const known = frames.filter((item): item is string => Boolean(item));
    const supportive = known.filter((item) => item === "leading" || item === "improving").length;
    const weak = known.filter((item) => item === "lagging" || item === "weakening").length;
    let verdict: VerdictClass = "mixed";
    let why = "The latest point does not support a stronger or weaker reading on its own.";
    let risk = "Another period could move it without a change in the price trend.";
    if (row.quadrant === "leading" && !momDown) {
      verdict = "good";
      why = "Relative strength is above 100 and momentum is not fading.";
      risk = momUp ? "A drop in momentum would weaken the lead." : "Momentum is not rising, so the lead is not getting stronger.";
    } else if (row.quadrant === "leading" && momDown) {
      why = "Relative strength is still above 100, but momentum is falling.";
      risk = "Further loss of momentum would take it out of Leading.";
    } else if (row.quadrant === "improving" && momUp && row.rsMomentum > 100) {
      verdict = "good";
      why = "Momentum is above 100 and still rising. Relative strength has not reached Leading.";
      risk = "RS-Ratio is still below 100, so this is not established leadership.";
    } else if (row.quadrant === "improving") {
      why = "The name is Improving, but momentum is not clearly strengthening.";
      risk = "Without a rise in both measures it can stall below 100.";
    } else if (row.quadrant === "lagging" && !momUp) {
      verdict = "bad";
      why = "Relative strength and momentum are both below 100, and momentum is not turning up.";
      risk = "A rise in momentum would make this an early recovery rather than a continued lag.";
    } else if (row.quadrant === "lagging" && momUp) {
      why = "The name is still Lagging, but momentum has turned up.";
      risk = "Relative strength is still below 100. One upturn is not a recovery.";
    } else if (row.quadrant === "weakening" && momDown && ratioDown) {
      verdict = "bad";
      why = "Relative strength is still above 100, but both the ratio and momentum are falling.";
      risk = "It has not crossed into Lagging yet.";
    } else if (row.quadrant === "weakening") {
      why = "Relative strength remains above 100 while momentum is below 100.";
      risk = "Momentum can turn back up, or the ratio can follow it lower.";
    }
    const aligned = verdict === "good" ? supportive >= 2 && weak === 0 : verdict === "bad" ? weak >= 2 && supportive === 0 : false;
    const confidence: VerdictConfidence = row.tail.length < 4 || known.length < 2 ? "low" : aligned && row.relativeReturn != null ? "high" : "moderate";
    const stops: string[] = [];
    for (const point of row.tail) {
      if (point.quadrant && stops[stops.length - 1] !== point.quadrant) stops.push(point.quadrant);
    }
    return [{
      symbol: row.symbol,
      name: row.name,
      verdict,
      confidence,
      quadrant: row.quadrant,
      rsRatio: row.rsRatio,
      rsMomentum: row.rsMomentum,
      ratioChange,
      momentumChange,
      relativeReturn: row.relativeReturn,
      absoluteReturn: row.absoluteReturn,
      trail: stops.slice(-4).join(" → ") || "No trail",
      daily: frame?.daily ?? null,
      weekly: frame?.weekly ?? null,
      monthly: frame?.monthly ?? null,
      why,
      risk,
      asOf: row.asOf,
    }];
  });
}
