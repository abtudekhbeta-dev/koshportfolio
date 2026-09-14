import { useMemo, useState } from "react";
import type { NewsItem } from "@/lib/kosh/types";
import { NEWS_BUCKETS, filterNews, newsTone, newsToneLabel, newsMaterial, type NewsBucket } from "@/lib/kosh/news";
import { NewsAlertSetup, NewsShare } from "@/components/news-share";
import { cn } from "@/lib/utils";

export function NewsBoard({
  title,
  items,
  loading,
  shareTitle,
  extra,
  alertScope,
}: {
  title?: string;
  items: NewsItem[] | undefined;
  loading?: boolean;
  shareTitle: string;
  extra?: string;
  alertScope?: string;
}) {
  const [bucket, setBucket] = useState<NewsBucket>("all");
  const shown = useMemo(() => filterNews(items || [], bucket), [items, bucket]);
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items?.length || 0 };
    for (const b of NEWS_BUCKETS) {
      if (b.id === "all") continue;
      map[b.id] = filterNews(items || [], b.id).length;
    }
    return map;
  }, [items]);

  return (
    <div>
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{title || "News"}</h2>
      <p className="mt-1 text-[12px] text-subtle">
        Wording on the headline is not a conclusion. Material marks results, regulation, deals — not a price call.
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {NEWS_BUCKETS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={cn(
              "inline-flex h-7 items-center justify-center rounded-sm px-2 text-[11px] font-medium",
              bucket === b.id ? "bg-surface-2 text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            {b.label}
            {counts[b.id] ? <span className="ml-1 text-subtle">{counts[b.id]}</span> : null}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-muted">Fetching headlines…</p>
      ) : shown.length ? (
        <>
          <ul className="mt-3 grid gap-2.5">
            {shown.slice(0, 10).map((n) => {
              const tone = newsTone(n.title);
              const mat = n.material || newsMaterial(n.title);
              return (
              <li key={n.link + n.title}>
                <a href={n.link} target="_blank" rel="noreferrer" className="block text-[13px] leading-snug hover:text-chart">
                  {n.title}
                </a>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-subtle">
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 font-medium",
                      tone === "up" && "bg-up/15 text-up",
                      tone === "down" && "bg-down/15 text-down",
                      tone === "neutral" && "bg-surface-2 text-muted",
                    )}
                  >
                    {newsToneLabel(tone)}
                  </span>
                  {mat === "high" ? (
                    <span className="rounded-sm bg-warn/15 px-1.5 py-0.5 font-medium text-warn">Material</span>
                  ) : mat === "medium" ? (
                    <span className="rounded-sm bg-surface-2 px-1.5 py-0.5">Worth a look</span>
                  ) : (
                    <span className="rounded-sm bg-surface-2 px-1.5 py-0.5">Background</span>
                  )}
                  {n.publisher}
                  {n.ts ? ` · ${new Date(n.ts * 1000).toISOString().slice(0, 10)}` : ""}
                </div>
              </li>
            );
            })}
          </ul>
          {alertScope ? <NewsAlertSetup scope={alertScope} label={shareTitle} items={shown} /> : <NewsShare title={shareTitle} items={shown} extra={extra} />}
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {items?.length ? "Nothing in this category." : "No headlines matched this name."}
        </p>
      )}
    </div>
  );
}
