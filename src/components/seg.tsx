import { cn } from "@/lib/utils";

export function Seg<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-0.5 rounded-sm bg-bg-elevated p-0.5 shadow-[var(--shadow-border)]", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex h-8 items-center justify-center rounded-[6px] px-2.5 text-[12px] font-medium leading-none transition-colors duration-150",
            value === o.id ? "bg-surface text-fg" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
