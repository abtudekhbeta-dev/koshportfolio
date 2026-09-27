import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { KoshSnapshot } from "@/lib/kosh/snapshot";
import { growthEvidence, type ValModel, type ValueWord, type ValuationModelsPack } from "@/lib/kosh/valuation";
import type { Fundamentals } from "@/lib/kosh/types";
import { coverageLabel, type CoverageCard as CoverageModel } from "@/lib/kosh/coverage";
import { buildFieldReport, type FieldLine } from "@/lib/kosh/evidence";

export function CoverageCard({ cov }: { cov: CoverageModel }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Data coverage</div>
        <div className="font-mono text-[13px] tabular">
          {coverageLabel(cov.level)} · {cov.nOk}/{cov.nAll} sections
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        {cov.buckets.map((b) => (
          <li key={b.id} className="flex items-baseline justify-between gap-2 border-b border-border/50 py-1 text-[12px]">
            <Tooltip content={b.hint}>
              <button type="button" className="text-left text-muted hover:text-fg">
                {b.label}
              </button>
            </Tooltip>
            <span className={cn("font-medium", b.ok ? "text-up" : "text-muted")}>{b.ok ? "On file" : "Missing"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CoverageLine({ cov }: { cov: CoverageModel }) {
  const missing = cov.buckets.filter((b) => !b.ok);
  if (!missing.length) return null;
  return (
    <p className="text-[12px] text-muted">
      Still missing: {missing.map((b) => b.label).join(", ")}. Blank is missing, not a pass.
    </p>
  );
}

const STATUS_WORD: Record<FieldLine["status"], string> = {
  verified: "Verified",
  derived: "Derived",
  conflicting: "Conflict",
  unavailable: "Not found",
  not_applicable: "N/A",
};

export function FieldCoverage({ fund }: { fund: Fundamentals | null | undefined }) {
  const report = buildFieldReport(fund);
  const groups = ["financials", "quality", "valuation", "ownership"] as const;
  return (
    <details className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <summary className="cursor-pointer text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
        Data coverage
        <span className="ml-2 font-mono text-[11px] font-normal normal-case tracking-normal text-subtle">
          {report.counts.verified} verified · {report.counts.derived} derived · {report.counts.conflicting} conflicting ·{" "}
          {report.counts.unavailable} not found
        </span>
      </summary>
      <p className="mt-2 text-[12px] text-subtle">
        Each line is a status, not a score. Verified means a source was selected. Derived means Kosh calculated it.
        Not found means the supported sources did not have it.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{g}</div>
            <ul className="mt-1">
              {report.lines
                .filter((l) => l.group === g)
                .map((l) => (
                  <li key={l.id} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1 text-[12px]">
                    <span className="text-muted">
                      {l.status === "verified" ? "✓" : l.status === "derived" ? "◇" : l.status === "conflicting" ? "⚠" : "✗"} {l.label}
                    </span>
                    <span className="text-right">
                      <span className="font-medium">{STATUS_WORD[l.status]}</span>
                      {l.value != null ? (
                        <span className="ml-2 font-mono tabular text-subtle">
                          {l.value.toFixed(l.unit === "x" || l.unit === "₹" ? 2 : 1)}
                          {l.unit === "%" ? "%" : ""}
                        </span>
                      ) : null}
                      {l.sourceName ? <span className="mt-0.5 block text-[10px] text-subtle">{l.sourceName}{l.period ? ` · ${l.period}` : ""}</span> : null}
                      {l.alt != null ? (
                        <span className="block text-[10px] text-subtle">
                          Also {l.altSource}: {l.alt}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

function wordClass(word: ValueWord) {
  if (word === "Cheaper") return "bg-up/15 text-up";
  if (word === "Expensive") return "bg-down/15 text-down";
  if (word === "About right") return "bg-chart/15 text-chart";
  return "bg-surface-2 text-muted";
}

export function WordChip({ word }: { word: ValueWord }) {
  return (
    <span className={cn("rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em]", wordClass(word))}>
      {word}
    </span>
  );
}

export function SnapshotCard({ snap, simple }: { snap: KoshSnapshot; simple?: ValModel | null }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Snapshot</div>
        {simple ? <WordChip word={simple.word} /> : null}
      </div>
      {(snap.fundTag || snap.qualTag) ? (
        <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
          {snap.fundTag ? (
            <span className={cn("rounded-sm px-2 py-0.5", snap.fundPass ? "bg-up/15 text-up" : "bg-surface-2 text-muted")}>
              {snap.fundTag}
            </span>
          ) : null}
          {snap.qualTag ? (
            <span className={cn("rounded-sm px-2 py-0.5", snap.qualYes ? "bg-up/15 text-up" : "bg-surface-2 text-muted")}>
              {snap.qualTag}
            </span>
          ) : null}
        </div>
      ) : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
        {snap.lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-2 border-b border-border/50 py-1.5">
            <dt className="text-[12px] text-muted">
              <Tooltip content={l.hint}>
                <button type="button" className="text-left text-[12px] text-muted hover:text-fg">
                  {l.label}
                </button>
              </Tooltip>
            </dt>
            <dd className={cn("font-mono text-[13px] tabular", l.tone === "up" && "text-up", l.tone === "down" && "text-down")}>
              {l.value}
            </dd>
          </div>
        ))}
      </dl>
      {simple ? (
        <div className="mt-3 rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{simple.figure}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-fg">{simple.body}</p>
        </div>
      ) : null}
      {snap.missing.length ? (
        <p className="mt-3 text-[12px] text-muted">Still unavailable: {snap.missing.join(", ")}.</p>
      ) : null}
    </section>
  );
}

function ModelBlock({ model }: { model: ValModel }) {
  return (
    <div className="rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold">{model.title}</h3>
        <WordChip word={model.word} />
      </div>
      <p className="mt-1 font-mono text-[13px] tabular text-muted">{model.figure}</p>
      {model.rows.length ? (
        <dl className="mt-2 grid gap-1">
          {model.rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 text-[12px]">
              <dt className="text-muted">{r.label}</dt>
              <dd className="font-mono tabular">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-2 text-[13px] leading-relaxed text-fg">{model.body}</p>
      <p className="mt-2 text-[11px] text-subtle">{model.note}</p>
    </div>
  );
}

export function ValuationModels({ pack, fund }: { pack: ValuationModelsPack; fund?: Fundamentals | null }) {
  const ev = growthEvidence(fund);
  const reverse = pack.models.find((m) => m.id === "C");
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">What the price requires</div>
      <p className="mt-1 text-[12px] text-subtle">
        Reverse valuation is the main read: the earnings growth today's price requires if the exit multiple is the
        reported industry multiple in five years. No discount rate is applied. Not a forecast.
      </p>
      {reverse ? (
        <div className="mt-3 rounded-sm bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[13px] font-semibold">{reverse.title}</h3>
            <WordChip word={reverse.word} />
          </div>
          <p className="mt-1 font-mono text-[13px] tabular text-muted">{reverse.figure}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-fg">{reverse.body}</p>
          <p className="mt-2 text-[11px] text-subtle">{reverse.note}</p>
        </div>
      ) : null}

      <div className="mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Growth evidence</div>
      <p className="mt-1 text-[12px] text-subtle">
        {ev.tone}. {ev.body} Sales CAGR over five years and management guidance are not on the card, so they stay
        unavailable.
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {ev.items.map((item) => (
          <li key={item.label} className="flex items-baseline justify-between gap-2 border-b border-border/50 py-1 text-[12px]">
            <span className="text-muted">{item.label}</span>
            <span className="font-mono tabular">{item.value ?? "Unavailable"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Other comparisons</div>
      <p className="mt-1 text-[12px] text-subtle">
        One word is a comparison of the prints we have — Cheaper, About right, Expensive, or Not enough data. The
        optional scenario still labels a 12% discount as a model assumption, not a company fact. Not a buy call.
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {pack.models
          .filter((m) => m.id !== "C")
          .map((m) => (
            <ModelBlock key={m.id} model={m} />
          ))}
      </div>
      {pack.graham != null ? (
        <p className="mt-3 text-[12px] text-muted">
          Traditional Graham check (optional): ₹{pack.graham.toFixed(0)}
          {pack.grahamGap != null
            ? ` · last ${pack.grahamGap >= 0 ? "+" : ""}${pack.grahamGap.toFixed(0)}% versus that filter.`
            : "."}{" "}
          Not a buy call.
        </p>
      ) : null}
    </section>
  );
}
