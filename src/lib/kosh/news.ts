/** Client-safe headline buckets. */

import type { NewsItem } from "./types";

export type NewsBucket = "all" | "results" | "deals" | "policy" | "business" | "market";

export const NEWS_BUCKETS: { id: NewsBucket; label: string }[] = [
  { id: "all", label: "All" },
  { id: "results", label: "Results" },
  { id: "deals", label: "Deals" },
  { id: "policy", label: "Policy" },
  { id: "business", label: "Business" },
  { id: "market", label: "Market" },
];

export function newsBucket(title: string): Exclude<NewsBucket, "all"> {
  const t = title.toLowerCase();
  if (
    /\b(q[1-4]\b|fy2[0-9]|quarter|earnings|results|pat\b|profit|revenue|ebitda|eps\b|sales|margin|guidance)\b/.test(t)
  )
    return "results";
  if (
    /\b(acquir|acquisition|merger|stake|block deal|open offer|buyback|fpo|qip|preferential|takeover|joint venture|jv\b|deal)\b/.test(
      t,
    )
  )
    return "deals";
  if (
    /\b(sebi|rbi|gst|tariff|policy|government|ministry|budget|regulation|ban|duty|tax|nclat|nclt|supreme court|cabinet)\b/.test(
      t,
    )
  )
    return "policy";
  if (
    /\b(plant|capex|order win|order book|contract|product|launch|expansion|factory|refinery|jio|store|capacity|mou)\b/.test(
      t,
    )
  )
    return "business";
  return "market";
}

export function newsAboutCompany(title: string, symbol: string, name?: string): boolean {
  const raw = String(title || "").trim();
  if (!raw) return false;
  const t = ` ${raw.toLowerCase()} `;
  const bare = String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  const nm = String(name || "")
    .replace(/\b(limited|ltd\.?|the|india|indian|plc)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/\b(stocks? to watch|top (gainers|losers)|market wrap|closing bell|sensex today|nifty( 50)? today|most active stocks|gainers and losers)\b/i.test(raw)) {
    return false;
  }

  if (bare === "ITC") {
    const tax = /\b(input tax credit|gst\b|goods and services tax)\b/.test(t);
    const co = /\b(itc limited|itc ltd|itc hotels|itc stock|cigarettes?|aashirvaad|sunfeast|bingo|gold flake)\b/.test(t);
    if (tax && !co) return false;
  }

  return nameHit(t, nm, bare);
}

function nameHit(t: string, nm: string, bare: string) {
  const tick = bare.toLowerCase().replace(/[^a-z0-9]/g, "");
  const compact = t.replace(/[^a-z0-9 ]/g, " ");
  if (tick.length >= 3 && new RegExp(`\\b${tick}\\b`, "i").test(compact)) return true;
  const words = nm
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (words.length >= 2 && compact.includes(words[0]) && compact.includes(words[1])) return true;
  if (words.length === 1 && compact.includes(words[0])) return true;
  if (nm.length >= 5 && t.includes(nm.toLowerCase())) return true;
  return false;
}

export function filterNews(items: NewsItem[], bucket: NewsBucket) {
  if (bucket === "all") return items;
  return items.filter((n) => newsBucket(n.title) === bucket);
}

export function newsTone(title: string): "up" | "down" | "neutral" {
  const t = title.toLowerCase();
  if (
    /\b(probe|fraud|sebi order|raid|pledge|default|loss widens|downgrade|layoff|fire|ban|penalty|insolvency|npa spike)\b/.test(
      t,
    )
  )
    return "down";
  if (
    /\b(order win|wins order|record profit|beats|surge|upgrade|capacity|commission|buyback|stake hike|guidance raise|expansion)\b/.test(
      t,
    )
  )
    return "up";
  return "neutral";
}

export function newsToneLabel(tone: "up" | "down" | "neutral") {
  if (tone === "up") return "Positive wording";
  if (tone === "down") return "Negative wording";
  return "Plain";
}

/** How much this headline could move a decision. Not a price call. */
export function newsMaterial(title: string): "high" | "medium" | "low" {
  const t = title.toLowerCase();
  if (
    /\b(q[1-4]\b|fy2[0-9]|earnings|results|guidance|profit warning|sebi|raid|probe|fraud|pledge|default|open offer|acquisition|merger|insolvency|ban|penalty|downgrade|upgrade)\b/.test(
      t,
    )
  )
    return "high";
  if (
    /\b(order win|capex|stake|buyback|block deal|insider|capacity|plant|expansion|mou|contract|dividend|bonus|split)\b/.test(
      t,
    )
  )
    return "medium";
  return "low";
}

/** One line from the headline bucket. Not a price call. */
export function newsWhy(title: string): string {
  const b = newsBucket(title);
  if (b === "results") return "A results print can change earnings and the multiple.";
  if (b === "deals") return "Ownership or capital-structure news — check control, dilution, or a change in the float.";
  if (b === "policy") return "Regulation can reprice a whole line of business, not just one print.";
  if (b === "business") return "Operating news (capacity, orders, plants) matters if it changes the earnings path.";
  const mat = newsMaterial(title);
  if (mat === "high") return "Headline wording is not a conclusion; treat this as something to verify.";
  return "Background. Unlikely to change the thesis on its own.";
}
