import { useEffect, useState } from "react";
import { Bell, Copy, Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import type { NewsItem } from "@/lib/kosh/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function clip(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

export function buildDigest(title: string, items: { title: string; publisher?: string; link?: string }[], extra?: string) {
  const lines = [
    title,
    extra || "",
    ...items.slice(0, 8).map((x, i) => `${i + 1}. ${x.title}${x.publisher ? " — " + x.publisher : ""}`),
    "",
    "From Kosh",
  ].filter((x, i, a) => x || (i > 0 && a[i - 1]));
  return lines.join("\n");
}

function openShare(kind: "whatsapp" | "telegram" | "gmail" | "copy", subject: string, body: string, url?: string) {
  const page = url || (typeof window !== "undefined" ? window.location.href : "");
  if (kind === "copy") {
    const text = body + (page ? `\n\n${page}` : "");
    void navigator.clipboard.writeText(text).then(
      () => toast.success("Copied the headlines"),
      () => toast.error("Could not copy"),
    );
    return;
  }
  if (kind === "whatsapp") {
    const text = clip(body + (page ? `\n${page}` : ""), 1600);
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer");
    return;
  }
  if (kind === "telegram") {
    const share =
      "https://t.me/share/url?url=" +
      encodeURIComponent(page || "https://grok.com") +
      "&text=" +
      encodeURIComponent(clip(body, 1200));
    window.open(share, "_blank", "noopener,noreferrer");
    return;
  }
  const mail =
    "mailto:?subject=" +
    encodeURIComponent(clip(subject, 80)) +
    "&body=" +
    encodeURIComponent(clip(body + (page ? `\n\n${page}` : ""), 1800));
  window.location.href = mail;
}

export function NewsShare({
  title,
  items,
  extra,
}: {
  title: string;
  items: NewsItem[] | { title: string; publisher?: string; link?: string }[];
  extra?: string;
}) {
  if (!items.length) return null;
  const body = buildDigest(title, items, extra);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] tracking-[0.06em] text-subtle uppercase">Send latest</span>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg"
        onClick={() => openShare("whatsapp", title, body)}
      >
        <MessageCircle className="size-3.5" />
        WhatsApp
      </button>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg"
        onClick={() => openShare("telegram", title, body)}
      >
        <Send className="size-3.5" />
        Telegram
      </button>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg"
        onClick={() => openShare("gmail", title, body)}
      >
        <Mail className="size-3.5" />
        Gmail
      </button>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-bg px-2.5 text-[12px] text-muted shadow-[var(--shadow-border)] hover:text-fg"
        onClick={() => openShare("copy", title, body)}
      >
        <Copy className="size-3.5" />
        Copy
      </button>
    </div>
  );
}

type Sub = { scope: string; channel: "whatsapp" | "telegram" | "email" | "browser"; dest: string; seen: number };

function loadSubs(): Sub[] {
  try {
    const raw = localStorage.getItem("kosh-news-subs");
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveSubs(rows: Sub[]) {
  localStorage.setItem("kosh-news-subs", JSON.stringify(rows.slice(0, 40)));
}

export function NewsAlertSetup({
  scope,
  label,
  items,
}: {
  scope: string;
  label: string;
  items: { title: string; publisher?: string; link?: string; ts?: number }[];
}) {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [channel, setChannel] = useState<Sub["channel"]>("whatsapp");
  const [dest, setDest] = useState("");
  useEffect(() => {
    setSubs(loadSubs());
  }, []);
  const mine = subs.find((s) => s.scope === scope);

  useEffect(() => {
    if (!mine || !items.length) return;
    const newest = Math.max(...items.map((x) => x.ts || 0));
    if (!(newest > (mine.seen || 0))) return;
    const next = subs.map((s) => (s.scope === scope ? { ...s, seen: newest } : s));
    saveSubs(next);
    setSubs(next);
    const fresh = items.filter((x) => (x.ts || 0) >= newest).slice(0, 3);
    const body = buildDigest(`News · ${label}`, fresh);
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") new Notification(`News · ${label}`, { body: fresh[0]?.title || "New headline" });
      else if (Notification.permission === "default") void Notification.requestPermission();
    }
    toast.message(`New headline on ${label}`, {
      description: fresh[0]?.title,
      action: {
        label: mine.channel === "email" ? "Mail" : mine.channel === "telegram" ? "Telegram" : "WhatsApp",
        onClick: () =>
          openShare(
            mine.channel === "browser" ? "copy" : mine.channel === "email" ? "gmail" : mine.channel,
            `News · ${label}`,
            body,
          ),
      },
    });
  }, [items, mine?.scope, label]);

  function subscribe() {
    const row: Sub = { scope, channel, dest: dest.trim(), seen: Math.max(0, ...items.map((x) => x.ts || 0)) };
    const next = [row, ...subs.filter((s) => s.scope !== scope)];
    saveSubs(next);
    setSubs(next);
    if (channel === "browser" && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      void Notification.requestPermission();
    }
    toast.success("Alerts on for " + label);
  }

  function drop() {
    const next = subs.filter((s) => s.scope !== scope);
    saveSubs(next);
    setSubs(next);
  }

  const body = buildDigest(`News · ${label}`, items);

  return (
    <div className="mt-4 rounded-md bg-bg px-3 py-3 shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
        <Bell className="size-3.5" />
        News alerts
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        When a new headline lands while you have the app open, we notify you here and you can send that alert on
        WhatsApp, Telegram or mail. This is not a silent carrier push.
      </p>
      {mine ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px]">On · {mine.channel}{mine.dest ? ` · ${mine.dest}` : ""}</span>
          <Button size="sm" variant="secondary" onClick={() => openShare(mine.channel === "browser" ? "copy" : mine.channel === "email" ? "gmail" : mine.channel, `News · ${label}`, body)}>
            Send latest
          </Button>
          <Button size="sm" variant="ghost" onClick={drop}>
            Stop
          </Button>
        </div>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
          <select
            className="h-9 rounded-sm bg-bg-elevated px-2 text-[13px] shadow-[var(--shadow-border)]"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Sub["channel"])}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
            <option value="browser">In-app / browser</option>
          </select>
          <Input
            placeholder={channel === "email" ? "you@email" : channel === "browser" ? "Optional note" : "Number or @handle"}
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
          <Button size="sm" onClick={subscribe}>
            Alert me
          </Button>
        </div>
      )}
    </div>
  );
}
