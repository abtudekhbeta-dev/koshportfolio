import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useKosh, type IconId } from "@/lib/store";

const TILE = "#09090b";
const INK = "#f2f2f4";
const LINE = "#7aa2ff";

export const ICON_META: { id: IconId; title: string; blurb: string }[] = [
  { id: "k-path", title: "K-path", blurb: "A K with the portfolio line underneath. Closest to the current mark." },
  { id: "bowl", title: "Kosh", blurb: "A simple vessel — kosh as a place you keep the portfolio." },
  { id: "twin", title: "Two lines", blurb: "Portfolio vs the index. The whole product in one glyph." },
  { id: "ledger", title: "Ledger", blurb: "Three bars and a tick. A holdings snapshot, not a trade blotter." },
  { id: "coin", title: "Coin K", blurb: "A round stamp with K. Reads at 16px and on a home screen." },
  { id: "fold", title: "Fold", blurb: "A page corner and a rising path. The chart is the document." },
];

export function IconMark({ id, className }: { id: IconId; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden suppressHydrationWarning>
      <rect width="32" height="32" rx="8" fill={TILE} />
      {id === "k-path" ? (
        <>
          <path d="M9 7h3.15v8.15L19.7 7H23l-8.15 9.25L23.2 25h-3.45l-7.6-8.7V25H9V7z" fill={INK} />
          <path d="M7 24.5c4.2-3.2 7.8-2.1 12.4-6.4 2.6-2.4 5.2-5.8 7.1-8.6" fill="none" stroke={LINE} strokeWidth="1.35" strokeLinecap="round" />
        </>
      ) : null}
      {id === "bowl" ? (
        <>
          <path
            d="M8 12.5c0 6.2 3.4 11 8 11s8-4.8 8-11"
            fill="none"
            stroke={INK}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path d="M8 12.5h16" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 18c2.2 3.4 4.1 4.6 6 4.6 1.9 0 3.8-1.2 6-4.6" fill="none" stroke={LINE} strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : null}
      {id === "twin" ? (
        <>
          <path d="M6 22 11 16 15 18 21 10 26 12" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 24 12 20 16 21 22 15 26 17" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {id === "ledger" ? (
        <>
          <path d="M8 10h16" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 16h11" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 22h8" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path d="M19 20.5 21.2 23 26 16" fill="none" stroke={LINE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {id === "coin" ? (
        <>
          <circle cx="16" cy="16" r="9.2" fill="none" stroke={INK} strokeWidth="1.8" />
          <path d="M12.2 10.4h2.4v5.2L20 10.4h2.4l-6.1 6.9 6.3 7.3h-2.55l-5.45-6.3v6.3h-2.4V10.4z" fill={LINE} />
        </>
      ) : null}
      {id === "fold" ? (
        <>
          <path d="M9 8h10l5 5v11H9V8z" fill="none" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M19 8v5h5" fill="none" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M11 22 15 16 18 18 22 12" fill="none" stroke={LINE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  );
}

export function Mark({ className }: { className?: string }) {
  const id = useKosh((s) => s.iconId) || "k-path";
  return <IconMark id={id} className={className} />;
}

export function IconHydrate() {
  const id = useKosh((s) => s.iconId) || "k-path";
  useEffect(() => {
    const href = `/icon-options/${id}.svg`;
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((el) => {
      el.href = href;
    });
  }, [id]);
  return null;
}

export function BrandLink({ to = "/", className }: { to?: "/app" | "/" | "/markets"; className?: string }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="size-7" />
      <span className="text-[15px] font-semibold tracking-[0.04em]">Kosh</span>
    </Link>
  );
}
