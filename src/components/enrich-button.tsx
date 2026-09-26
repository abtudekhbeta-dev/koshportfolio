import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiEnrich } from "@/lib/kosh/api";
import { isCommodity } from "@/lib/kosh/commodities";
import { useKosh } from "@/lib/store";

export function EnrichButton({ symbols }: { symbols: string[] }) {
  const setDeepFunds = useKosh((s) => s.setDeepFunds);
  const deepFunds = useKosh((s) => s.deepFunds);
  const [busy, setBusy] = useState(false);
  const eq = [...new Set(symbols.map((s) => s.replace(/\.(NS|BO)$/i, "").toUpperCase()).filter((s) => s && !isCommodity(s)))];
  if (!eq.length) return null;
  const nHave = eq.filter((s) => deepFunds[s]?.fund).length;
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const got = await apiEnrich(eq);
          const rows: Record<string, { fund: NonNullable<(typeof got.funds)[string]>; at: number; sources: string[] }> = {};
          for (const [sym, fund] of Object.entries(got.funds || {})) {
            rows[sym] = { fund, at: Date.now(), sources: got.sources?.[sym] || [] };
          }
          if (Object.keys(rows).length) setDeepFunds(rows);
          const n = Object.keys(rows).length;
          const missed = eq.length - n;
          toast.success(
            n
              ? `Refreshed ${n} of ${eq.length}. Available fields were filled where a filing had them. Existing numbers were not replaced with blanks.${missed ? ` ${missed} still unavailable.` : ""}`
              : "Still unavailable — no extra filings for these names. Existing numbers were left as they are.",
          );
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not load filings");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Loading data…" : nHave ? `Refresh data · ${nHave}/${eq.length}` : "Load data"}
    </Button>
  );
}
