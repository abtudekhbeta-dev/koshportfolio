/** Scan both skills to completion (retries + second pass), then one portfolio verdict. */

import { apiNote, apiSkillPut } from "./api";
import { asFund, asQual, skillOutputReady } from "./note-shape";
import { skillOf, skillPeek, skillReadMerge } from "./screens";
import { useKosh } from "@/lib/store";

export type ImproveTarget = { symbol: string; name: string; weight: number; sector: string };

let looping = false;
let loopId = "";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function namesWithReads(targets: ImproveTarget[]) {
  const reads = useKosh.getState().skillReads;
  return targets.map((r) => {
    const s = skillPeek(reads, r.symbol);
    return {
      symbol: r.symbol,
      weight: r.weight,
      sector: r.sector || "Other",
      fundTag: s?.fundTag,
      fundRating: s?.fundRating,
      fundVerdict: s?.fundVerdict,
      qualTag: s?.qualTag,
      qualPotential: s?.qualPotential,
      qualVerdict: s?.qualVerdict,
    };
  });
}

function coverage(targets: ImproveTarget[]) {
  const reads = useKosh.getState().skillReads;
  return {
    nRead: targets.filter((r) => skillOf(reads, r.symbol)).length,
    nTotal: targets.length,
  };
}

function missingSides(r: ImproveTarget) {
  const s = skillPeek(useKosh.getState().skillReads, r.symbol);
  const sides: ("fund" | "qual")[] = [];
  if (!s?.fundTag) sides.push("fund");
  if (!s?.qualTag) sides.push("qual");
  return sides;
}

async function writeVerdict(input: {
  portfolioId: string;
  name: string;
  bench: string;
  targets: ImproveTarget[];
  fresh?: number;
}) {
  const r = await apiNote({
    kind: "improve",
    book: { name: input.name, bench: input.bench, names: namesWithReads(input.targets) },
    fresh: input.fresh,
  });
  if (!r.ok) return r;
  const { nRead, nTotal } = coverage(input.targets);
  useKosh.getState().setBookNote(input.portfolioId, { text: r.text, at: Date.now(), nRead, nTotal });
  return r;
}

async function persistSide(
  r: ImproveTarget,
  side: "fund" | "qual",
  pack: { ok: boolean; text?: string; error?: string; fundBlock?: ReturnType<typeof asFund>; qualBlock?: ReturnType<typeof asQual> },
) {
  if (!pack.ok || !pack.text || !skillOutputReady(side, pack.text)) return false;
  const fund = side === "fund" ? pack.fundBlock || asFund(pack.text) : null;
  const qual = side === "qual" ? pack.qualBlock || asQual(pack.text) : null;
  if (side === "fund" && !fund) return false;
  if (side === "qual" && !qual) return false;
  const existing = skillPeek(useKosh.getState().skillReads, r.symbol);
  const read = skillReadMerge(existing, { symbol: r.symbol, name: r.name, sector: r.sector, fund, qual });
  useKosh.getState().setSkillRead(read);
  if (read.fundTag && read.qualTag) void apiSkillPut(read).catch(() => {});
  return true;
}

async function runSide(r: ImproveTarget, kind: "fund" | "qual", fresh?: number) {
  const delays = [0, 2800, 6500];
  for (let i = 0; i < delays.length; i++) {
    if (delays[i]) await sleep(delays[i]);
    try {
      const pack = await apiNote({ kind, symbol: r.symbol, fresh });
      if (await persistSide(r, kind, pack)) return true;
      if (!pack.ok && /Too many reads|429/i.test(pack.error || "")) await sleep(18000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/Busy|Too many|429|took too long|Retry|Gateway|504/i.test(msg)) {
        await sleep(i === 0 ? 4000 : 9000);
      }
    }
  }
  return false;
}

async function runPair(r: ImproveTarget, fresh?: number, force?: boolean) {
  const need = force ? (["fund", "qual"] as ("fund" | "qual")[]) : missingSides(r);
  if (!need.length) return;
  if (need.length === 2) {
    await Promise.all([runSide(r, "fund", fresh), runSide(r, "qual", fresh)]);
  } else {
    await runSide(r, need[0], fresh);
  }
  const still = missingSides(r);
  for (const side of still) {
    await sleep(2500);
    await runSide(r, side, fresh);
  }
}

export function isImproveLooping(portfolioId?: string) {
  if (!looping) return false;
  if (!useKosh.getState().improveRun) {
    looping = false;
    loopId = "";
    return false;
  }
  if (!portfolioId) return looping;
  return loopId === portfolioId;
}

async function mapPool<T>(items: T[], n: number, fn: (item: T, i: number) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, n), items.length || 1) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

export async function startImprove(input: {
  portfolioId: string;
  name: string;
  bench: string;
  targets: ImproveTarget[];
  force?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (looping && loopId === input.portfolioId && !input.force) return { ok: true };
  if (looping && loopId === input.portfolioId && input.force) {
    looping = false;
  }
  looping = true;
  loopId = input.portfolioId;
  const setRun = useKosh.getState().setImproveRun;
  const fresh = input.force ? Date.now() : undefined;

  try {
    const first = input.force
      ? input.targets
      : input.targets.filter((r) => !skillOf(useKosh.getState().skillReads, r.symbol));

    async function scan(list: ImproveTarget[], passLabel: string, force?: boolean) {
      if (!list.length) return;
      setRun({
        portfolioId: input.portfolioId,
        done: 0,
        total: list.length,
        name: list[0].name,
        stage: "scan",
        skill: "both",
      });
      let done = 0;
      await mapPool(list, 3, async (r) => {
        setRun({
          portfolioId: input.portfolioId,
          done,
          total: list.length,
          name: `${r.name}${passLabel}`,
          stage: "scan",
          skill: "both",
        });
        try {
          await runPair(r, fresh, force);
        } catch {
          /* keep going — remaining names still get both skills */
        }
        done += 1;
        setRun({
          portfolioId: input.portfolioId,
          done,
          total: list.length,
          name: r.name,
          stage: "scan",
          skill: "both",
        });
      });
    }

    await scan(first, "", input.force);

    const incomplete = input.targets.filter((r) => missingSides(r).length);
    if (incomplete.length) await scan(incomplete, " — finishing both skills", false);

    setRun({
      portfolioId: input.portfolioId,
      done: input.targets.length,
      total: Math.max(input.targets.length, 1),
      name: input.name,
      stage: "verdict",
    });
    const verdict = await writeVerdict({ ...input, fresh: fresh || Date.now() });
    if (!verdict.ok && !useKosh.getState().bookNotes[input.portfolioId]) {
      return { ok: false, error: verdict.error };
    }
    if (!verdict.ok) {
      setRun({
        portfolioId: input.portfolioId,
        done: input.targets.length,
        total: Math.max(input.targets.length, 1),
        name: input.name,
        stage: "verdict",
        error: verdict.error,
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not run. Try again." };
  } finally {
    looping = false;
    loopId = "";
    useKosh.getState().setImproveRun(null);
  }
}
