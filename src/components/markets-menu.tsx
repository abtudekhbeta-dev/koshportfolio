import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, ChevronDown, PieChart, RefreshCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    id: "terminal",
    title: "Market Terminal",
    detail: "Live charts and market data",
    search: { view: "terminal" as const },
    icon: BarChart3,
  },
  {
    id: "rotation",
    title: "Sector Rotation",
    detail: "Compare sector performance",
    search: undefined,
    icon: RefreshCw,
  },
  {
    id: "overview",
    title: "Market Overview",
    detail: "Indices, breadth and market stats",
    search: { view: "overview" as const },
    icon: PieChart,
  },
];

export function MarketsMenu({
  placement = "down",
  tone = "chip",
}: {
  placement?: "down" | "up";
  tone?: "chip" | "plain" | "tab" | "compact";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const overview = pathname === "/markets" && searchStr.includes("view=overview");
  const rotation = pathname.startsWith("/markets/rotation");
  const terminal = pathname === "/markets" && !overview;
  const active = pathname.startsWith("/markets");

  function current(id: string) {
    if (id === "rotation") return rotation;
    if (id === "overview") return overview;
    return terminal;
  }

  useEffect(() => {
    if (!open) return;
    const nodes = root.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
    nodes?.[focus]?.focus();
  }, [open, focus]);

  useEffect(() => {
    if (!open) return;
    function outside(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocus((n) => (n + 1) % ITEMS.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocus((n) => (n - 1 + ITEMS.length) % ITEMS.length);
      }
    }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", tone === "tab" && "min-w-0 flex-1")}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          tone === "chip" && "grid h-12 place-items-center rounded-sm bg-surface px-4 text-[16px] font-semibold shadow-[var(--shadow-border)] lg:px-5",
          tone === "plain" && "inline-flex items-center border-b pb-2 text-[14px]",
          tone === "tab" && "grid min-h-14 w-full place-items-center px-0.5 text-[12px] font-semibold",
          tone === "compact" && "inline-flex h-8 items-center rounded-sm px-2 text-[13px] font-semibold",
          active ? "text-fg" : "text-muted hover:text-fg",
          tone === "chip" && active && "ring-1 ring-fg/25",
          tone === "chip" && !active && "text-fg/80",
          tone === "plain" && (active ? "border-accent" : "border-transparent"),
          tone === "tab" && active && "bg-surface",
        )}
        onClick={() => {
          setOpen((on) => {
            if (!on) {
              const idx = ITEMS.findIndex((item) => current(item.id));
              setFocus(idx >= 0 ? idx : 0);
            }
            return !on;
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setFocus(0);
            setOpen(true);
          }
        }}
      >
        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none">
          Markets
          <ChevronDown className={cn("size-3.5 shrink-0 opacity-70", tone === "tab" && "size-3", open && "rotate-180")} aria-hidden />
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Markets"
          className={cn(
            "absolute z-50 w-[min(18rem,calc(100vw-1.25rem))] rounded-xl border border-border bg-surface p-1.5 shadow-lg",
            placement === "up" ? "bottom-full left-0 mb-2" : "top-full left-0 mt-1.5",
          )}
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const on = current(item.id);
            const className = cn(
              "flex items-start gap-2.5 rounded-lg px-2.5 py-2 outline-none hover:bg-bg focus-visible:ring-2 focus-visible:ring-ring",
              on && "bg-bg",
            );
            const body = (
              <>
                <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", on ? "bg-accent text-accent-fg" : "bg-bg text-chart")}>
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-fg">{item.title}</span>
                  <span className="block text-[11px] text-muted">{item.detail}</span>
                </span>
              </>
            );
            if (item.id === "rotation") {
              return (
                <Link
                  key={item.id}
                  role="menuitem"
                  to="/markets/rotation"
                  aria-current={on ? "page" : undefined}
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {body}
                </Link>
              );
            }
            return (
              <Link
                key={item.id}
                role="menuitem"
                to="/markets"
                search={item.id === "overview" ? { view: "overview" } : { view: "terminal" }}
                aria-current={on ? "page" : undefined}
                className={className}
                onClick={() => setOpen(false)}
              >
                {body}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
