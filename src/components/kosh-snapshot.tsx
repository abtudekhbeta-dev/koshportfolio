import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { KoshSnapshot } from "@/lib/kosh/snapshot";
import type { Valuation } from "@/lib/kosh/valuation";

export function SnapshotCard({ snap }: { snap: KoshSnapshot }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Kosh snapshot</div>
      <p className="mt-1 text-[12px] text-subtle">A short read of numbers we have. Blank is missing, not a guess.</p>
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
      ) : (
        <p className="mt-2 text-[12px] text-muted">No skill read yet.</p>
      )}
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
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
      <p className="mt-3 text-[13px] leading-relaxed text-fg">{snap.read}</p>
    </section>
  );
}

export function ValuationCard({ val }: { val: Valuation }) {
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">Valuation cases</div>
      <p className="mt-1 text-[12px] text-subtle">
        5-year exit multiple, discounted at {val.discount.toFixed(0)}%. Not a price target. Change the growth and the number
        moves.
      </p>
      {val.cases.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.06em] text-subtle uppercase">
                <th className="py-2 pr-3 font-medium">Case</th>
                <th className="py-2 pr-3 font-medium">Growth</th>
                <th className="py-2 pr-3 font-medium">Exit P/E</th>
                <th className="py-2 pr-3 font-medium">Implied</th>
                <th className="py-2 font-medium">vs last</th>
              </tr>
            </thead>
            <tbody>
              {val.cases.map((c) => (
                <tr key={c.label} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 font-medium">{c.label}</td>
                  <td className="py-2 pr-3 font-mono tabular">{c.growth.toFixed(0)}%</td>
                  <td className="py-2 pr-3 font-mono tabular">{c.exitPe.toFixed(0)}×</td>
                  <td className="py-2 pr-3 font-mono tabular">
                    ₹{c.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={cn(
                      "py-2 font-mono tabular",
                      c.vsPrice == null ? "text-muted" : c.vsPrice >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {c.vsPrice == null ? "—" : `${c.vsPrice >= 0 ? "+" : ""}${c.vsPrice.toFixed(0)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">
          {val.missing.length ? `Unavailable: ${val.missing.join(", ")}.` : "Not enough published numbers."}
        </p>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-muted">{val.read}</p>
    </section>
  );
}
