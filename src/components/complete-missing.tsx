import { useState } from "react";
import { AIButton } from "@/components/ui/ai-button";
import { apiCommitFund, apiEnrich, apiMarketRows, apiResearch } from "@/lib/kosh/api";
import {
  applyResearchToFund,
  explainGaps,
  pool,
  remainingJobs,
  researchBatches,
  researchPlan,
  seedCompletion,
  type Gap,
} from "@/lib/kosh/complete";
import type { ScreenField } from "@/lib/kosh/screen-contract";
import type { Fundamentals, ScreenRow } from "@/lib/kosh/types";
import { useKosh } from "@/lib/store";

type Job = { symbol: string; missing: string[]; fields?: ScreenField[] };
type RowState = { symbol: string; phase: "queued" | "market" | "filings" | "researching" | "done" | "incomplete" | "stopped" | "paused"; gaps: Gap[]; error?: string };

function isRateLimit(message: string) {
  return /too many/i.test(message);
}

function vcpGapReason(row: ScreenRow | null): string {
  const state = row?.vcpState;
  if (state === "insufficient") return "Insufficient history — fewer than 80 daily bars.";
  if (state === "na") return "Not applicable — the price history is not a VCP.";
  if (state === "calculated") return "Calculated — this VCP figure was not produced from the pattern.";
  if (state === "unavailable") return "Unavailable — no price history for a VCP check.";
  return "Unavailable — VCP was not classified.";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * One completion action for every incomplete name in the current result.
 * Market math is calculated. Filings and formulas run next. AI is only asked for what is still blank.
 */
export function CompleteMissing({
  jobs,
  noun = "stocks",
  onMarket,
  onMarketChecked,
}: {
  jobs: Job[];
  noun?: string;
  onMarket?: (rows: ScreenRow[]) => void;
  onMarketChecked?: (symbol: string, keys: string[]) => void;
}) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const queue = jobs.filter((j) => j.symbol && j.missing.length);
  const [busy, setBusy] = useState(false);
  const [batch, setBatch] = useState<Job[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [open, setOpen] = useState(false);
  const [stopped, setStopped] = useState("");
  if (!queue.length && !rows.length) return null;

  function marketFields(job: Job) {
    const fields = job.fields || [];
    return fields.filter((f) => f.kind === "market" && job.missing.includes(f.label));
  }

  function marketGaps(job: Job, row: ScreenRow | null): Gap[] {
    const gaps: Gap[] = [];
    for (const field of marketFields(job)) {
      const v = row ? (row as unknown as Record<string, unknown>)[field.key] : null;
      if (typeof v === "number" && Number.isFinite(v)) continue;
      const vcp = field.key.startsWith("vcp");
      const stake = field.key === "fiiDelta" || field.key === "diiDelta";
      gaps.push({
        key: field.key,
        label: field.label,
        reason: vcp
          ? vcpGapReason(row)
          : stake
            ? "Unavailable — two reported shareholding periods are required. This is not asked of AI."
            : "Unavailable — price history did not produce this number.",
      });
    }
    return gaps;
  }

  async function finishOne(
    job: Job,
    mark: (row: RowState) => void,
    halt: { reason: string; phase: "" | "market" | "fund" },
    marketRow: ScreenRow | null,
    marketReady: boolean,
  ): Promise<RowState> {
    const fields = job.fields || [];
    const needsMarket = marketFields(job).length > 0;
    if (halt.phase === "market" && needsMarket && !marketReady) {
      return {
        symbol: job.symbol,
        phase: isRateLimit(halt.reason) ? "paused" : "stopped",
        gaps: [],
        error: halt.reason,
      };
    }
    const mGaps = needsMarket && marketReady ? marketGaps(job, marketRow) : [];
    if (halt.phase === "fund") {
      return {
        symbol: job.symbol,
        phase: isRateLimit(halt.reason) ? "paused" : "stopped",
        gaps: mGaps,
        error: halt.reason,
      };
    }
    const fundLabels = fields.length
      ? job.missing.filter((label) => fields.some((f) => f.label === label && f.kind === "fund"))
      : job.missing;
    if (!fundLabels.length) {
      return { symbol: job.symbol, phase: mGaps.length ? "incomplete" : "done", gaps: mGaps };
    }
    mark({ symbol: job.symbol, phase: "filings", gaps: [] });
    const prev = useKosh.getState().deepFunds[job.symbol]?.fund || null;
    let fetched: Fundamentals | null = null;
    try {
      const det = await apiEnrich([job.symbol]);
      fetched = det.funds?.[job.symbol] || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (isRateLimit(message)) {
        halt.reason = message;
        halt.phase = "fund";
      }
    }
    if (halt.phase === "fund") {
      return {
        symbol: job.symbol,
        phase: isRateLimit(halt.reason) ? "paused" : "stopped",
        gaps: mGaps,
        error: halt.reason,
      };
    }
    let fund = seedCompletion(prev, fetched, job.symbol);
    const plan = researchPlan(fund, fundLabels);
    let error = "";
    let hitLimit = false;
    if (plan.ask.length) {
      mark({ symbol: job.symbol, phase: "researching", gaps: [] });
      const items = [];
      for (const ask of researchBatches(plan.ask)) {
        if (halt.phase === "fund") {
          hitLimit = true;
          break;
        }
        const pull = async () => {
          const res = await apiResearch(job.symbol, ask);
          if (res.ok && res.items?.length) return { items: res.items, error: "" };
          return { items: [], error: res.error || "AI research unavailable" };
        };
        try {
          let got = await pull();
          if (isRateLimit(got.error)) {
            await sleep(1500);
            got = await pull();
          }
          if (got.items.length) items.push(...got.items);
          else error = got.error;
          if (isRateLimit(got.error)) {
            halt.reason = got.error;
            halt.phase = "fund";
            hitLimit = true;
            break;
          }
        } catch (err) {
          error = err instanceof Error ? err.message : "AI research unavailable";
          if (isRateLimit(error)) {
            await sleep(1500);
            try {
              const again = await pull();
              if (again.items.length) {
                items.push(...again.items);
                error = again.error;
              } else error = again.error || error;
              if (!isRateLimit(error)) continue;
            } catch (err2) {
              error = err2 instanceof Error ? err2.message : error;
            }
            halt.reason = error;
            halt.phase = "fund";
            hitLimit = true;
            break;
          }
        }
      }
      if (items.length) fund = applyResearchToFund(fund, items);
    }
    const latest = useKosh.getState().deepFunds[job.symbol]?.fund || null;
    fund = seedCompletion(fund, latest, job.symbol);
    setDeepFunds({ [job.symbol]: { fund, at: Date.now(), sources: ["complete"] } });
    try {
      const saved = await apiCommitFund(job.symbol, fund);
      if (!saved.ok) error = error || saved.error || "Company cache did not save.";
    } catch (err) {
      error = error || (err instanceof Error ? err.message : "Company cache did not save.");
    }
    const gaps = [...mGaps, ...explainGaps(fund, fundLabels)];
    if (hitLimit || (halt.phase === "fund" && isRateLimit(halt.reason))) {
      return { symbol: job.symbol, phase: "paused", gaps, error: halt.reason || error };
    }
    if (halt.reason && halt.phase === "fund") return { symbol: job.symbol, phase: "stopped", gaps, error: halt.reason };
    return { symbol: job.symbol, phase: gaps.length ? "incomplete" : "done", gaps, error };
  }

  async function run(resume = false) {
    const jobsNow = resume ? remainingJobs(queue, rows) : queue;
    if (!resume && !jobsNow.length) return;
    if (resume && !jobsNow.length) return;
    const kept = resume ? rows.filter((r) => r.phase === "done" || r.phase === "incomplete") : [];
    const halt = { reason: "", phase: "" as "" | "market" | "fund" };
    setBatch(resume ? queue : jobsNow);
    setBusy(true);
    setStopped("");
    setRows([...kept, ...jobsNow.map((j) => ({ symbol: j.symbol, phase: "queued" as const, gaps: [] }))]);
    setOpen(false);
    const marketRows = new Map<string, ScreenRow | null>();
    const marketReady = new Set<string>();
    const marketJobs = jobsNow.filter((job) => marketFields(job).length);
    for (let i = 0; i < marketJobs.length && halt.phase !== "market"; i += 24) {
      const chunk = marketJobs.slice(i, i + 24);
      setRows((cur) => cur.map((r) => (chunk.some((j) => j.symbol === r.symbol) ? { ...r, phase: "market" } : r)));
      try {
        const got = await apiMarketRows(chunk.map((j) => j.symbol));
        if (got.rows?.length) onMarket?.(got.rows);
        for (const job of chunk) {
          const row = (got.rows || []).find((r) => r.symbol === job.symbol) || null;
          marketRows.set(job.symbol, row);
          marketReady.add(job.symbol);
          onMarketChecked?.(
            job.symbol,
            marketFields(job).map((f) => f.key),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Market history unavailable";
        if (isRateLimit(message)) {
          halt.reason = message;
          halt.phase = "market";
        } else {
          for (const job of chunk) {
            marketRows.set(job.symbol, null);
            marketReady.add(job.symbol);
            onMarketChecked?.(
              job.symbol,
              marketFields(job).map((f) => f.key),
            );
          }
        }
      }
    }
    await pool(jobsNow, 2, async (job) => {
      const row = await finishOne(job, (next) => {
        setRows((cur) => cur.map((r) => (r.symbol === next.symbol ? { ...r, ...next } : r)));
      }, halt, marketRows.get(job.symbol) || null, marketReady.has(job.symbol));
      setRows((cur) => cur.map((r) => (r.symbol === row.symbol ? row : r)));
      return row;
    });
    if (halt.reason) setStopped(halt.reason);
    setBusy(false);
    setOpen(true);
  }

  const shown = rows.length ? rows : [];
  const total = batch.length || queue.length;
  const done = shown.filter((r) => r.phase === "done" || r.phase === "incomplete" || r.phase === "stopped").length;
  const pending = shown.filter((r) => r.phase === "incomplete");
  const finished = shown.filter((r) => r.phase === "done").length;
  const halted = shown.filter((r) => r.phase === "stopped").length;
  const pausedN = shown.filter((r) => r.phase === "paused").length;
  const current = shown.find((r) => r.phase === "researching" || r.phase === "filings" || r.phase === "market");
  const phaseLabel =
    current?.phase === "researching" ? "researching" : current?.phase === "market" ? "calculating market data" : current?.phase === "filings" ? "checking filings" : "";

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-fg">
            {queue.length} {queue.length === 1 ? noun.replace(/s$/, "") : noun} {queue.length === 1 ? "has" : "have"} incomplete displayed data
          </p>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted">
            Every name in this result is queued. Returns, RSI, volume, and VCP are calculated from price history. Filings and formulas run next. AI is asked only for a fact that is still blank, and only with a source.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AIButton busy={busy} busyLabel={busy ? `${done} / ${total}` : undefined} onClick={() => void run(false)}>
            {`Complete missing data for ${queue.length}`}
          </AIButton>
          {pausedN > 0 && !busy ? (
            <button
              type="button"
              onClick={() => void run(true)}
              className="h-9 rounded-sm bg-bg px-3 text-[13px] font-medium text-fg shadow-[var(--shadow-border)]"
            >
              Continue remaining ({pausedN})
            </button>
          ) : null}
        </div>
      </div>
      {busy || shown.length ? (
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-bg">
            <div className="h-full bg-chart transition-[width] duration-200" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
          </div>
          <p className="mt-2 font-mono text-[12px] tabular text-muted">
            {busy
              ? `${done} / ${total}${current ? ` · ${current.symbol} ${phaseLabel}` : ""}`
              : `${finished} completed${pending.length ? ` · ${pending.length} still unavailable` : ""}${pausedN ? ` · ${pausedN} paused` : ""}${halted ? ` · ${halted} not run` : ""}`}
          </p>
          {stopped ? <p className="mt-1 text-[12px] text-down">{stopped} The rest of this result was not marked done.</p> : null}
          {shown.length > 24 ? (
            <p className="mt-1 text-[11px] text-subtle">Showing the latest 24 names. The count above is the full result, not a cap.</p>
          ) : null}
            <ul className="mt-2 grid max-h-40 gap-1 overflow-y-auto text-[12px] text-muted">
              {shown.filter((r) => r.phase !== "queued" || busy).slice(-24).map((r) => (
                <li key={r.symbol}>
                  <span className="text-fg">{r.symbol}</span>
                  {r.phase === "done" ? " · done" : r.phase === "researching" ? " · researching" : r.phase === "market" ? " · market" : r.phase === "filings" ? " · filings" : r.phase === "queued" ? " · queued" : r.phase === "paused" ? " · paused" : r.phase === "stopped" ? " · not run" : ""}
                  {r.error ? ` · ${r.error}` : ""}
                  {open && r.gaps.length ? ` · ${r.gaps.map((g) => `${g.label}: ${g.reason}`).join("; ")}` : ""}
                </li>
              ))}
            </ul>
        </div>
      ) : null}
    </section>
  );
}
