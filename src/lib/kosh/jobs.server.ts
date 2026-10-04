/** Multi-symbol enrichment runs one name per request so the browser is not stuck on one huge call.
 * The job row is stored in Postgres (or PGLite) so a new serverless instance can resume it.
 * The in-memory map is only a same-instance cache. */

import { getSql } from "@/lib/db";
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

const globalJobs = globalThis as typeof globalThis & { __koshEnrichJobs?: Map<string, Job> };
const jobs = globalJobs.__koshEnrichJobs || new Map<string, Job>();
globalJobs.__koshEnrichJobs = jobs;

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

async function persist(job: Job) {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into enrich_jobs (id, payload, updated_at)
       values ($1, $2, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [job.jobId, JSON.stringify({ ...job, busy: false })],
    );
  } catch (err) {
    console.error("[enrich-job] persist failed", job.jobId, err instanceof Error ? err.message : err);
  }
}

async function load(id: string): Promise<Job | null> {
  const mem = jobs.get(id);
  if (mem) return mem;
  try {
    const sql = await getSql();
    const rows = await sql.query<{ payload: string }>(`select payload from enrich_jobs where id = $1`, [id]);
    const raw = rows[0]?.payload;
    if (!raw) return null;
    const job = JSON.parse(typeof raw === "string" ? raw : String(raw)) as Job;
    if (!job || job.jobId !== id || !Array.isArray(job.symbols)) return null;
    job.busy = false;
    jobs.set(id, job);
    return job;
  } catch {
    return null;
  }
}

export async function startEnrichJob(symbols: string[]): Promise<EnrichJobView> {
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
  await persist(job);
  return view(job);
}

/** Read a job back after the in-memory map is gone. Does not advance it. */
export async function recallEnrichJob(id: string): Promise<EnrichJobView | null> {
  const job = await load(id);
  return job ? view(job) : null;
}

export async function advanceEnrichJob(id: string, step = 1): Promise<EnrichJobView | null> {
  const job = await load(id);
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
  await persist(job);
  return view(job);
}
