import { useAppLayout, writeLayout, type AppLayout } from "@/lib/layout-mode";

const OPTIONS: { id: AppLayout; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "terminal", label: "Terminal Focus" },
  { id: "research", label: "Research" },
  { id: "compact", label: "Compact" },
];

/** Presentation only. Does not touch portfolios, trades, or research. */
export function LayoutSwitch() {
  const layout = useAppLayout();
  return (
    <label className="flex items-center gap-1.5">
      <span className="hidden text-[10px] font-medium tracking-[0.08em] text-subtle uppercase sm:inline">Layout</span>
      <select
        aria-label="Layout"
        value={layout}
        onChange={(e) => writeLayout(e.target.value as AppLayout)}
        className="h-8 max-w-[6.5rem] rounded-sm bg-surface px-1.5 text-[12px] text-fg shadow-[var(--shadow-border)] sm:max-w-[9.5rem] sm:px-2"
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
