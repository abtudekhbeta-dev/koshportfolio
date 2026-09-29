/** Auto Fundamental + Qualitative board. Same executeNote as a stock page. */

import { executeNote } from "./ai.server";
import { NIFTY50, NIFTY500, universeName } from "./universe.ts";
import { sectorOf } from "./sectors.ts";
import { skillReadFrom, type SkillRead } from "./screens.ts";

export type SkillBoardSnap = {
  status: "idle" | "running" | "done" | "error";
  /** Continuous Nifty 500 AI coverage is not running. */
  autoScan: "disabled";
  note: string;
  total: number;
  done: number;
  error: string;
  reads: SkillRead[];
};

const reads = new Map<string, SkillRead>();
let status: SkillBoardSnap["status"] = "idle";
let error = "";
let looping = false;

let universe: { symbol: string; name: string }[] | null = null;
function getUniverse() {
  if (universe) return universe;
  const seen = new Set<string>();
  const out: { symbol: string; name: string }[] = [];
  for (const x of [...NIFTY50, ...NIFTY500]) {
    const s = x.symbol.toUpperCase();
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ symbol: s, name: x.name });
  }
  universe = out;
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function snap(): SkillBoardSnap {
  return {
    status,
    autoScan: "disabled",
    note: "Automatic Nifty 500 AI coverage is off. Analysis runs when you ask for a name.",
    total: getUniverse().length,
    done: reads.size,
    error,
    reads: [...reads.values()].sort((a, b) => b.at - a.at),
  };
}

export function putSkillRead(r: SkillRead) {
  const symbol = String(r.symbol || "")
    .replace(/\.(NS|BO)$/i, "")
    .toUpperCase();
  if (!symbol) return;
  reads.set(symbol, { ...r, symbol });
}

export function getSkillBoard(): SkillBoardSnap {
  return snap();
}

export function kickSkillBoard(): SkillBoardSnap {
  /* Auto-scan of the Nifty 500 is retired — it cannot finish and burns quota. */
  status = "done";
  looping = false;
  return snap();
}

async function readOne(u: { symbol: string; name: string }): Promise<SkillRead | null> {
  const [fund, qual] = await Promise.all([
    executeNote({ kind: "fund", symbol: u.symbol }),
    executeNote({ kind: "qual", symbol: u.symbol }),
  ]);
  if (!fund.ok) throw new Error(fund.error);
  if (!qual.ok) throw new Error(qual.error);
  const fb = fund.fundBlock;
  const qb = qual.qualBlock;
  if (!fb || !qb) return null;
  return skillReadFrom({
    symbol: u.symbol,
    name: u.name || universeName(u.symbol),
    sector: sectorOf(u.symbol),
    fund: fb,
    qual: qb,
  });
}

async function runLoop() {
  status = "running";
  error = "";
  for (const u of getUniverse()) {
    if (reads.has(u.symbol)) continue;
    try {
      const got = await readOne(u);
      if (got) reads.set(u.symbol, got);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not read";
      if (/not available/i.test(msg)) {
        error = msg;
        status = "error";
        return;
      }
      if (/429|Too many|xAI 429/i.test(msg)) {
        await sleep(12_000);
        try {
          const got = await readOne(u);
          if (got) reads.set(u.symbol, got);
        } catch {
          /* skip this name */
        }
      }
    }
    await sleep(250);
  }
  status = reads.size ? "done" : "error";
  if (!reads.size && !error) error = "No names could be read.";
}
