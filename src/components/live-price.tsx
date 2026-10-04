import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiQuotes } from "@/lib/kosh/api";
import { fmtPct, fmtPx, fmtTapePx } from "@/lib/kosh/engine";
import { gramToMcx, metalKey, METALS } from "@/lib/kosh/commodities";
import { isIstSession } from "@/lib/kosh/market-hours";
import { quoteStatus, quoteStatusLabel } from "@/lib/kosh/market-data";
import { cn } from "@/lib/utils";

export function LivePrice({
  symbol,
  initial,
}: {
  symbol: string;
  initial: { price: number; changePct: number };
}) {
  const session = isIstSession();
  const metal = metalKey(symbol);
  const q = useQuery({
    queryKey: ["live-quote", symbol],
    queryFn: async () => {
      const rows = await apiQuotes([symbol]);
      return rows[0] || null;
    },
    refetchInterval: session ? 3_000 : 60_000,
    staleTime: session ? 1_500 : 30_000,
    placeholderData: (prev) => prev,
  });
  const quotePx = q.data?.price && q.data.price > 0 ? q.data.price : null;
  const price = metal ? (quotePx ? gramToMcx(metal, quotePx) : initial.price) : (quotePx ?? initial.price);
  const changePct = q.data?.changePct ?? initial.changePct;
  const statusLabel = quoteStatusLabel(quoteStatus({ session, price }), q.data?.delayMin);
  const genuinelyLive = statusLabel.endsWith("LIVE");
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(price);

  useEffect(() => {
    if (!(price > 0) || prev.current <= 0) {
      prev.current = price;
      return;
    }
    if (price === prev.current) return;
    setFlash(price > prev.current ? "up" : "down");
    prev.current = price;
    const t = window.setTimeout(() => setFlash(null), 700);
    return () => window.clearTimeout(t);
  }, [price]);

  return (
    <div className="text-right">
      <div
        className={cn(
          "inline-flex items-baseline gap-2 rounded-sm px-1.5 py-0.5 font-mono text-[28px] font-medium tabular",
          flash === "up" && "kosh-tick-up",
          flash === "down" && "kosh-tick-down",
        )}
      >
        {metal ? fmtTapePx(price) : fmtPx(price)}
      </div>
      <div className="flex items-center justify-end gap-2">
        {metal ? <span className="text-[11px] text-subtle">{METALS[metal].displayLabel}</span> : null}
        <div className={cn("font-mono text-[15px] tabular", changePct >= 0 ? "text-up" : "text-down")}>
          {fmtPct(changePct)}
        </div>
        <span
          data-quote-status
          className={cn(
            "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase",
            genuinelyLive ? "bg-up/15 text-up" : "bg-surface-2 text-subtle",
          )}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}