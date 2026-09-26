import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiEnrich } from "@/lib/kosh/api";
import { isCommodity } from "@/lib/kosh/commodities";
import type { Fundamentals } from "@/lib/kosh/types";
import { useKosh } from "@/lib/store";

const COVERAGE: { label: string; has: (f: Fundamentals | null | undefined) => boolean }[] = [
  { label: "Revenue history", has: (f) => (f?.sales?.length || 0) > 0 },
  { label: "Profit history", has: (f) => (f?.profits?.length || 0) > 0 },
  { label: "CFO", has: (f) => (f?.cfo?.length || 0) > 0 },
  { label: "Shareholding", has: (f) => (f?.shareholding?.length || 0) > 0 || f?.promoters != null },
  { label: "ROCE", has: (f) => f?.roce != null },
  { label: "OPM", has: (f) => f?.opm != null },
  { label: "P/E", has: (f) => f?.pe != null },
  { label: "ROE", has: (f) => f?.roe != null },
];

const FRESH_MS = 7 * 24 * 60 * 60 * 1000;

function covered(fund: Fundamentals | null | undefined) {
  return COVERAGE.every((field) => field.has(fund));
}

export function EnrichButton({ symbols, queued = 0 }: { symbols: string[]; queued?: number }) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const deepFunds = useKosh((s) => s.deepFunds);
  const [busy, setBusy] = useState(false);
  const eq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter((s) => s && !isCommodity(s)))];
  if (!eq.length && !queued) return null;
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={busy || !eq.length}
      onClick={async () => {
        setBusy(true);
        try {
          const before = deepFunds;
          const now = Date.now();
          const todo = eq.filter((s) => {
            const snap = before[s];
            return !(snap?.fund && covered(snap.fund) && now - snap.at < FRESH_MS);
          });
          const already = eq.length - todo.length;
          if (!todo.length) {
            toast.success("All supported data is already covered.");
            return;
          }
          const rows: Record<string, { fund: Fundamentals; at: number; sources: string[] }> = {};
          const sourceSet = new Set<string>();
          let failed = 0;
          for (let i = 0; i < todo.length; i += 8) {
            const slice = todo.slice(i, i + 8);
            try {
              const part = await apiEnrich(slice);
              for (const [sym, fund] of Object.entries(part.funds || {})) {
                rows[sym] = { fund, at: Date.now(), sources: part.sources?.[sym] || [] };
              }
              for (const list of Object.values(part.sources || {})) {
                for (const src of list || []) sourceSet.add(src);
              }
            } catch {
              failed += slice.length;
            }
          }
          if (Object.keys(rows).length) setDeepFunds(rows);
          const added: string[] = [];
          const still: string[] = [];
          const had: string[] = [];
          for (const field of COVERAGE) {
            let gained = 0;
            let present = 0;
            let missing = 0;
            for (const s of eq) {
              const was = field.has(before[s]?.fund);
              const isNow = field.has(rows[s]?.fund) || was;
              if (!was && field.has(rows[s]?.fund)) gained += 1;
              if (was) present += 1;
              if (!isNow) missing += 1;
            }
            if (gained) added.push(`${field.label} (${gained})`);
            else if (present) had.push(field.label);
            if (missing) still.push(`${field.label} on ${missing}`);
          }
          const bits = [
            added.length ? `Added: ${added.join(", ")}.` : "No new fields on this pass.",
            had.length ? `Already available: ${had.join(", ")}.` : "",
            still.length ? `Still unavailable: ${still.join(", ")}.` : "",
            sourceSet.size ? `Sources checked: ${[...sourceSet].join(", ")}.` : "",
            already ? `${already} already complete, left as they were.` : "",
            failed ? `${failed} names could not be read this pass.` : "",
            queued ? `${queued} more names are still queued. Run again to continue.` : "",
          ].filter(Boolean);
          toast.success(`Loaded ${Object.keys(rows).length} of ${todo.length}`, { description: bits.join(" ") });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not load filings");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Loading more data…" : "Load more data"}
    </Button>
  );
}
