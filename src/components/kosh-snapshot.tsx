import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { KoshSnapshot } from "@/lib/kosh/snapshot";
import type { ValModel, ValueWord, ValuationModelsPack } from "@/lib/kosh/valuation";
import { coverageLabel, type CoverageCard as CoverageModel } from "@/lib/kosh/coverage";

export function CoverageCard({ cov }: { cov: CoverageModel }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Data coverage</div>
        <div className="font-mono text-[13px] tabular">
          {coverageLabel(cov.level)} · {cov.pct}% · {cov.nOk}/{cov.nAll}
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

export function ValuationModels({ pack }: { pack: ValuationModelsPack }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Valuation models</div>
      <p className="mt-1 text-[12px] text-subtle">
        One word is a comparison of the prints we have — Cheaper, About right, Expensive, or Not enough data. Not a buy
        call.
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {pack.models.map((m) => (
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
