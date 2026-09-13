/** Next-7-days attention: results, moving headlines, stake-change news, deals. */

import type { DealEvent, NewsItem, ResultEvent } from "./types";
import { newsBucket, newsTone } from "./news";
import { bareSym } from "./portfolio-stats";

const DAY = 86400000;

export function isStakeNews(title: string): boolean {
  const t = title.toLowerCase();
  const who = /\b(fii|diis?|foreign institutional|domestic institutional|promoters?)\b/.test(t);
  const move =
    /\b(stake|holding|bought|buy|sold|sell|hike|cut|increase|decrease|raised|reduced|acquired|offload|picked up|trimmed|pledge|unpledge)\b/.test(
      t,
    );
  return who && move;
}

export function isMovingNews(item: NewsItem): boolean {
  if (isStakeNews(item.title)) return true;
  const bucket = newsBucket(item.title);
  if (bucket === "results" || bucket === "deals" || bucket === "policy") return true;
  return newsTone(item.title) !== "neutral";
}

export function withinDays(iso: string, days: number, asOf = Date.now()): boolean {
  const t = Date.parse(iso.length <= 10 ? iso + "T00:00:00+05:30" : iso);
  if (!Number.isFinite(t)) return false;
  const diff = t - asOf;
  return diff >= -DAY && diff <= days * DAY;
}

export function recentTs(ts: number, days: number, asOf = Date.now()): boolean {
  if (!ts) return false;
  const ms = ts > 1e12 ? ts : ts * 1000;
  return asOf - ms <= days * DAY && asOf - ms >= -DAY;
}

export type AttentionKind = "results" | "news" | "stake" | "deal" | "insider";

export type AttentionItem = {
  id: string;
  kind: AttentionKind;
  date: string;
  title: string;
  symbol?: string;
  name?: string;
  weight?: number;
  href?: string;
  note?: string;
};

function kindRank(k: AttentionKind) {
  if (k === "results") return 0;
  if (k === "stake") return 1;
  if (k === "deal" || k === "insider") return 2;
  return 3;
}

export function buildAttention(input: {
  symbols: { symbol: string; name: string; weight?: number }[];
  results?: ResultEvent[];
  deals?: DealEvent[];
  news?: { symbol: string; items: NewsItem[] }[];
  days?: number;
}): AttentionItem[] {
  const days = input.days ?? 7;
  const want = new Map(input.symbols.map((s) => [bareSym(s.symbol), s]));
  const out: AttentionItem[] = [];

  for (const ev of input.results || []) {
    if (ev.kind === "macro") continue;
    const row = want.get(bareSym(ev.symbol));
    if (!row) continue;
    if (!withinDays(ev.date, days)) continue;
    out.push({
      id: "r:" + ev.symbol + ev.date,
      kind: "results",
      date: ev.date,
      title: ev.purpose || "Results",
      symbol: row.symbol,
      name: row.name,
      weight: row.weight,
    });
  }

  for (const d of input.deals || []) {
    const row = want.get(bareSym(d.symbol));
    if (!row) continue;
    if (!withinDays(d.date, days)) continue;
    out.push({
      id: "d:" + d.kind + d.symbol + d.date + d.note.slice(0, 24),
      kind: d.kind === "insider" ? "insider" : "deal",
      date: d.date,
      title: d.note,
      symbol: row.symbol,
      name: row.name,
      weight: row.weight,
    });
  }

  for (const pack of input.news || []) {
    const row = want.get(bareSym(pack.symbol)) || input.symbols.find((s) => bareSym(s.symbol) === bareSym(pack.symbol));
    if (!row) continue;
    for (const n of pack.items || []) {
      if (!recentTs(n.ts, days) && n.ts) continue;
      if (!isMovingNews(n) && !isStakeNews(n.title)) continue;
      const stake = isStakeNews(n.title);
      out.push({
        id: "n:" + (n.link || n.title).slice(0, 80),
        kind: stake ? "stake" : "news",
        date: n.ts ? new Date((n.ts > 1e12 ? n.ts : n.ts * 1000)).toISOString().slice(0, 10) : "",
        title: n.title,
        symbol: row.symbol,
        name: row.name,
        weight: row.weight,
        href: n.link,
      });
    }
  }

  const seen = new Set<string>();
  const uniq: AttentionItem[] = [];
  for (const it of out.sort((a, b) => kindRank(a.kind) - kindRank(b.kind) || (b.weight || 0) - (a.weight || 0))) {
    const k = it.kind + bareSym(it.symbol || "") + it.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").slice(0, 48);
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(it);
    if (uniq.length >= 12) break;
  }
  return uniq;
}

export function attentionWeight(items: AttentionItem[], kind: AttentionKind = "results") {
  const set = new Set<string>();
  let w = 0;
  for (const it of items) {
    if (it.kind !== kind) continue;
    const k = bareSym(it.symbol || "");
    if (!k || set.has(k)) continue;
    set.add(k);
    w += it.weight || 0;
  }
  return { n: set.size, weight: w };
}
