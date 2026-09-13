import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureTo = "/picks" | "/screen" | "/trade" | "/compare" | "/watch" | "/app";

export function FeatureCard({
  to,
  kicker,
  title,
  body,
  cta,
  tone = "chart",
}: {
  to: FeatureTo;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  tone?: "chart" | "warn";
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group rounded-lg border-l-[4px] bg-surface p-5 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
        tone === "warn" ? "border-l-warn" : "border-l-chart",
      )}
    >
      <div className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", tone === "warn" ? "text-warn" : "text-chart")}>
        {kicker}
      </div>
      <h3 className="mt-2 text-[20px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-[13px] leading-snug text-muted">{body}</p>
      <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-sm bg-accent px-3 text-[13px] font-medium text-accent-fg group-hover:opacity-90">
        {cta}
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
