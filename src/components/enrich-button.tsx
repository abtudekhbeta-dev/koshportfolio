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
];

export function EnrichButton({ symbols }: { symbols: string[] }) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const deepFunds = useKosh((s) => s.deepFunds);
  const [busy, setBusy] = useState(false);
  const eq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter((s) => s && !isCommodity(s)))];
  if (!eq.length) return null;
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const before = deepFunds;
          const got = await apiEnrich(eq);
          const rows: Record<string, { fund: NonNullable<(typeof got.funds)[string]>; at: number; sources: string[] }> = {};
          for (const [sym, fund] of Object.entries(got.funds || {})) {
            rows[sym] = { fund, at: Date.now(), sources: got.sources?.[sym] || [] };
          }
          if (Object.keys(rows).length) setDeepFunds(rows);
          const added: string[] = [];
          const missing: string[] = [];
          for (const field of COVERAGE) {
            let gained = 0;
            let still = 0;
            for (const s of eq) {
              const had = field.has(before[s]?.fund);
              const now = field.has(rows[s]?.fund) || had;
              if (!had && field.has(rows[s]?.fund)) gained += 1;
              if (!now) still += 1;
            }
            if (gained) added.push(`${field.label} (${gained})`);
            if (still) missing.push(`${field.label} on ${still}`);
          }
          const n = Object.keys(rows).length;
          toast.success(n ? `Loaded ${n} of ${eq.length}` : "No extra filings for these names", {
            description: [added.length ? `Added: ${added.join(", ")}` : "No new fields on this pass.", missing.length ? `Still unavailable: ${missing.join(", ")}.` : ""]
              .filter(Boolean)
              .join(" "),
          });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not load filings");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Loading additional company data…" : "Load data"}
    </Button>
  );
}