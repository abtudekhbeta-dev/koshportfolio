import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/kosh/engine";

export function Pct({
  n,
  digits = 2,
  className,
}: {
  n: number | null | undefined;
  digits?: number;
  className?: string;
}) {
  const tone = n == null || !Number.isFinite(n) ? "" : n > 0 ? "text-up" : n < 0 ? "text-down" : "text-muted";
  return <span className={cn("tabular font-mono", tone, className)}>{fmtPct(n, digits)}</span>;
}
