import { Button } from "@/components/ui/button";
import { aiStatusLabel, type Proposal } from "@/lib/kosh/ingest-review";
import type { AiFailureClass, ImportAiStatus } from "@/lib/kosh/types";

export function IngestSuggestions({
  busy,
  status,
  aiClass,
  proposals,
  onAccept,
}: {
  busy: boolean;
  status: ImportAiStatus;
  aiClass?: AiFailureClass;
  proposals: Proposal[];
  onAccept: (p: Proposal) => void;
}) {
  return (
    <div className="mt-2 text-[12px] leading-relaxed text-muted">
      <p>
        {busy
          ? "AI interpretation in progress"
          : status === "ok" && proposals.length === 0
            ? "No additional suggestions"
            : aiStatusLabel(status, aiClass, proposals.length)}
      </p>
      {proposals.length ? (
        <ul className="mt-2 grid gap-1.5">
          {proposals.map((p, i) => (
            <li key={`${p.kind}-${p.row}-${p.to}-${i}`} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0">
                {p.kind === "header" || p.kind === "classify"
                  ? `${p.kind}: ${p.from || "column"} → ${p.to}`
                  : `Row ${p.row + 1}: ${p.from || p.field} → ${p.to}`}
                {p.reason ? ` · ${p.reason}` : ""}
              </span>
              {p.kind === "symbol" || p.kind === "date" || p.kind === "side" ? (
                <Button type="button" size="sm" variant="secondary" className="min-h-11" onClick={() => onAccept(p)}>
                  Use {p.to}
                </Button>
              ) : (
                <span className="text-subtle">Note only</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
