import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ICON_META, IconMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { ICON_IDS, useKosh, type IconId } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/icons")({ ssr: false, component: IconsPage });

const PREVIEWS: Record<IconId, string> = {
  "k-path": "/icon-options/preview-k-path.jpg",
  bowl: "/icon-options/preview-bowl.jpg",
  twin: "/icon-options/preview-twin.jpg",
  ledger: "/icon-options/preview-ledger.jpg",
  coin: "/icon-options/preview-coin.jpg",
  fold: "/icon-options/preview-fold.jpg",
};

function IconsPage() {
  const current = useKosh((s) => s.iconId) || "k-path";
  const setIconId = useKosh((s) => s.setIconId);

  function pick(id: IconId) {
    setIconId(id);
    toast.success("App icon updated — look at the top-left mark");
  }

  return (
    <AppShell>
      <div className="kosh-page mx-auto max-w-4xl">
        <p className="text-[12px] text-subtle">
          <Link to="/app" className="hover:text-muted">
            Portfolios
          </Link>
          <span className="mx-1.5">/</span>
          App icon
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Pick the mark</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Six actual marks. The large tile is the idea; the small square is the live glyph that sits in the header.
          Tap a card to use it.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ICON_META.map((m) => {
            const on = current === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m.id)}
                className={cn(
                  "overflow-hidden rounded-lg bg-surface text-left shadow-[var(--shadow-border)] transition-shadow duration-150 hover:shadow-[var(--shadow-border-hover)]",
                  on && "ring-1 ring-chart",
                )}
              >
                <img
                  src={PREVIEWS[m.id]}
                  alt={m.title}
                  width={640}
                  height={640}
                  className="aspect-square w-full bg-bg object-cover"
                />
                <span className="flex items-start gap-3 p-4">
                  <IconMark id={m.id} className="size-12 shrink-0" />
                  <span className="min-w-0 pt-0.5">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{m.title}</span>
                      {on ? <span className="text-[11px] tracking-[0.06em] text-chart uppercase">Using</span> : null}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-muted">{m.blurb}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-8 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">At 16px · tab size</div>
          <div className="mt-3 flex flex-wrap items-end gap-5">
            {ICON_IDS.map((id) => (
              <div key={id} className="grid justify-items-center gap-1.5">
                <IconMark id={id} className="size-4" />
                <span className="text-[10px] text-subtle">{id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link to="/app">Back to portfolios</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
