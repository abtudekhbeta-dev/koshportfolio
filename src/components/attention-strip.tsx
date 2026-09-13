import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Mail, MessageCircle, Send } from "lucide-react";
import { apiMacro, apiNews } from "@/lib/kosh/api";
import { attentionWeight, buildAttention, type AttentionItem } from "@/lib/kosh/attention";
import { StockLink } from "@/components/stock-link";
import { Button } from "@/components/ui/button";
import { buildDigest } from "@/components/news-share";
import { cn } from "@/lib/utils";

function openShare(kind: "whatsapp" | "telegram" | "gmail", subject: string, body: string) {
  const page = typeof window !== "undefined" ? window.location.href : "";
  if (kind === "whatsapp") {
    window.open("https://wa.me/?text=" + encodeURIComponent((body + "\n" + page).slice(0, 1600)), "_blank", "noopener,noreferrer");
    return;
  }
  if (kind === "telegram") {
    window.open(
      "https://t.me/share/url?url=" + encodeURIComponent(page || "https://grok.com") + "&text=" + encodeURIComponent(body.slice(0, 1200)),
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }
  window.location.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

function kindLabel(k: AttentionItem["kind"]) {
  if (k === "results") return "Results";
  if (k === "stake") return "Stake";
  if (k === "deal") return "Deal";
  if (k === "insider") return "Insider";
  return "News";
}

export function AttentionStrip({
  symbols,
  title = "Next 7 days",
}: {
  symbols: { symbol: string; name: string; weight?: number }[];
  title?: string;
}) {
  const key = symbols.map((s) => s.symbol).join(",");
  const macro = useQuery({ queryKey: ["macro"], queryFn: apiMacro, staleTime: 8 * 60 * 1000 });
  const news = useQuery({
    queryKey: ["attention-news", key],
    queryFn: async () => {
      const top = symbols.slice(0, 8);
      const lists = await Promise.all(top.map((s) => apiNews(s.symbol, s.name).catch(() => [])));
      return top.map((s, i) => ({ symbol: s.symbol, items: lists[i] || [] }));
    },
    staleTime: 5 * 60 * 1000,
    enabled: symbols.length > 0,
  });

  const items = useMemo(
    () =>
      buildAttention({
        symbols,
        results: macro.data?.results,
        deals: macro.data?.deals,
        news: news.data,
        days: 7,
      }),
    [symbols, macro.data, news.data],
  );

  const results = attentionWeight(items, "results");
  const digest = buildDigest(
    title,
    items.map((it) => ({ title: `${it.name || it.symbol || ""} · ${it.title}` })),
  );

  if (!symbols.length) return null;
  if (!items.length && (macro.isPending || news.isPending)) {
    return (
      <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
        <div className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</div>
        <p className="mt-2 text-[13px] text-muted">Checking results, deals and moving headlines…</p>
      </section>
    );
  }
  if (!items.length) return null;

  return (
    <section className="rounded-lg border-l-[4px] border-l-warn bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-warn uppercase">
            <Bell className="size-3.5" />
            {title}
          </div>
          <p className="mt-1 max-w-xl text-[13px] text-muted">
            {results.n
              ? `${results.n} name${results.n === 1 ? "" : "s"} reporting · ${(results.weight * 100).toFixed(0)}% of the portfolio`
              : "Headlines and deals that can move a name you hold."}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="secondary" onClick={() => openShare("whatsapp", title, digest)}>
            <MessageCircle className="size-3.5" />
            WhatsApp
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openShare("telegram", title, digest)}>
            <Send className="size-3.5" />
            Telegram
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openShare("gmail", title, digest)}>
            <Mail className="size-3.5" />
            Mail
          </Button>
        </div>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] leading-snug">
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase",
                it.kind === "results" ? "bg-chart/15 text-chart" : it.kind === "stake" ? "bg-warn/20 text-warn" : "bg-surface-2 text-muted",
              )}
            >
              {kindLabel(it.kind)}
            </span>
            {it.symbol ? (
              <StockLink symbol={it.symbol} name={it.name} className="font-medium" />
            ) : (
              <span className="font-medium">{it.name}</span>
            )}
            {it.weight != null ? (
              <span className="font-mono tabular text-subtle">{(it.weight * 100).toFixed(0)}%</span>
            ) : null}
            {it.href ? (
              <a href={it.href} target="_blank" rel="noreferrer" className="min-w-0 text-muted hover:text-fg">
                {it.title}
              </a>
            ) : (
              <span className="text-muted">{it.title}</span>
            )}
            {it.date ? <span className="font-mono tabular text-subtle">{it.date.slice(5)}</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-subtle">Send opens WhatsApp or Telegram with this list. Not a silent text to your phone.</p>
    </section>
  );
}
