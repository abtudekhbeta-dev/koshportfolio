import { useState } from "react";
import { toast } from "sonner";
import { apiEnrich } from "@/lib/kosh/api";
import { missingScreenFacts } from "@/lib/kosh/screens";
import type { ScreenRow } from "@/lib/kosh/types";
import { useKosh } from "@/lib/store";

/** Deterministic filing pass for one screened name. Not an AI call. */
export function RowComplete({ row }: { row: ScreenRow }) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const snap = useKosh((s) => s.deepFunds[row.symbol]);
  const [busy, setBusy] = useState(false);
  const missing = missingScreenFacts(row);
  if (!missing.length) return null;
  const searched = Boolean(snap?.fund?.provenance?.searched);
  return (
    <button
      type="button"
      disabled={busy}
      className="mt-1 block text-left text-[11px] font-medium text-chart hover:underline disabled:opacity-50"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setBusy(true);
        try {
          const part = await apiEnrich([row.symbol]);
          const fund = part.funds?.[row.symbol];
          if (fund) {
            setDeepFunds({ [row.symbol]: { fund, at: Date.now(), sources: part.sources?.[row.symbol] || [] } });
            const still = (fund.provenance?.fields &&
              Object.values(fund.provenance.fields).filter((f) => f.status === "unavailable").length) || 0;
            toast.success(still ? "Checked supported sources" : "Fields updated", {
              description: still
                ? "Some metrics are still not in the filings we can read. They stay blank — not zero."
                : "This row now uses the reconciled company record.",
            });
          } else {
            toast.message("No additional filing data", {
              description: `${row.symbol}: supported sources did not add a number.`,
            });
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not complete this row");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Checking sources…" : searched ? "Check sources again" : "Complete missing data"}
    </button>
  );
}
