/** Multi-symbol enrichment runs one name per request so the browser is not stuck on one huge call. */

import { fetchDeepFundamentals } from "./deep.server.ts";
import { upsertCompanyFunds } from "./company-cache.server.ts";
import type { Fundamentals } from "./types.ts";

export type EnrichJobView = {
  jobId: string;
  status: "queued" | "processing" | "complete" | "failed";
  total: number;
  done: number;
  failed: string[];
  pending: number;
  funds: Record<string, Fundamentals>;
  sources: Record<string, string[]>;
};

type Job = EnrichJobView & { cursor: number; busy: boolean; symbols: string[] };

const jobs = new Map<string, Job>();

function view(job: Job): EnrichJobView {
  return {
    jobId: job.jobId,
    status: job.status,
    total: job.total,
    done: job.done,
    failed: job.failed,
    pending: Math.max(0, job.total - job.cursor),
    funds: job.funds,
    sources: job.sources,
  };
}

export function startEnrichJob(symbols: string[]): EnrichJobView {
  const id = Math.random().toString(36).slice(2, 10);
  const uniq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter(Boolean))].slice(0, 40);
  const job: Job = {
    jobId: id,
    status: "queued",
    total: uniq.length,
    done: 0,
    failed: [],
    pending: uniq.length,
    funds: {},
    sources: {},
    cursor: 0,
    busy: false,
    symbols: uniq,
  };
  jobs.set(id, job);
  return view(job);
}

export async function advanceEnrichJob(id: string, step = 1): Promise<EnrichJobView | null> {
  const job = jobs.get(id);
  if (!job) return null;
  if (job.status === "complete" || job.status === "failed") return view(job);
  if (job.busy) return view(job);
  const symbols = job.symbols;
  const n = Math.max(1, Math.min(3, step));
  job.busy = true;
  job.status = "processing";
  try {
    for (let i = 0; i < n && job.cursor < symbols.length; i++) {
      const sym = symbols[job.cursor];
      job.cursor += 1;
      try {
        const got = await fetchDeepFundamentals(sym);
        if (got.fund) job.funds[sym] = got.fund;
        job.sources[sym] = got.sources;
        if (got.fund) job.done += 1;
        else job.failed.push(sym);
      } catch {
        job.failed.push(sym);
      }
    }
    if (Object.keys(job.funds).length) {
      await upsertCompanyFunds(job.funds, job.sources).catch(() => {});
    }
    if (job.cursor >= symbols.length) {
      job.status = job.done === 0 && job.failed.length ? "failed" : "complete";
    }
  } finally {
    job.busy = false;
  }
  return view(job);
}
