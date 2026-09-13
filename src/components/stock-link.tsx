import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { isListedSymbol } from "@/lib/kosh/universe";
import { cn } from "@/lib/utils";

export function stockBare(symbol: string) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
}

export function canOpenStock(symbol: string) {
  const b = stockBare(symbol);
  if (!b || b.startsWith("^") || b === "GOLD" || b === "SILVER") return false;
  return isListedSymbol(b) || /^[A-Z][A-Z0-9-]{1,14}$/.test(b);
}

export function StockLink({
  symbol,
  name,
  className,
  children,
}: {
  symbol: string;
  name?: string;
  className?: string;
  children?: ReactNode;
}) {
  const b = stockBare(symbol);
  const label = children ?? name ?? b;
  if (!canOpenStock(b)) {
    return <span className={className}>{label}</span>;
  }
  return (
    <Link to="/s/$symbol" params={{ symbol: b }} className={cn("hover:text-chart", className)}>
      {label}
    </Link>
  );
}

export function TickerText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\b[A-Z][A-Z0-9-]{1,14}\b)/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        canOpenStock(p) ? (
          <StockLink key={i} symbol={p} className="font-medium text-chart" />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
