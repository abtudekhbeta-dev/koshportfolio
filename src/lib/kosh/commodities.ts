/** Physical gold / silver.
 *  Holdings quantity is grams. Live value comes from MCX:
 *  Gold displayed ₹/10g, Silver displayed ₹/kg.
 *  Internal quote used for value is always ₹/g. */

export const TROY_OZ_G = 31.1034768;

export type MetalId = "GOLD" | "SILVER";

export const METALS: Record<
  MetalId,
  {
    symbol: MetalId;
    name: string;
    unit: "g";
    displayG: number;
    displayLabel: string;
    yfInr: string;
    yfUsd: string;
    etfs: string[];
    growwName: "Gold" | "Silver";
    growwFut: string;
    growwMini?: string;
  }
> = {
  GOLD: {
    symbol: "GOLD",
    name: "Gold",
    unit: "g",
    displayG: 10,
    displayLabel: "₹/10g",
    yfInr: "XAUINR=X",
    yfUsd: "GC=F",
    etfs: ["GOLDBEES.NS", "SETFGOLD.NS", "GOLD1.NS"],
    growwName: "Gold",
    growwFut: "mcx_gold",
    growwMini: "mcx_goldm",
  },
  SILVER: {
    symbol: "SILVER",
    name: "Silver",
    unit: "g",
    displayG: 1000,
    displayLabel: "₹/kg",
    yfInr: "XAGINR=X",
    yfUsd: "SI=F",
    etfs: ["SILVERBEES.NS", "SBISILVER.NS", "SILVERIETF.NS"],
    growwName: "Silver",
    growwFut: "mcx_silver",
    growwMini: "mcx_silverm",
  },
};

export function metalKey(symbol: string | null | undefined): MetalId | null {
  const b = String(symbol || "")
    .trim()
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "");
  if (b === "GOLD" || b === "XAU" || b === "XAUINR" || b === "XAUINR=X" || b === "GOLDBEES") return "GOLD";
  if (b === "SILVER" || b === "XAG" || b === "XAGINR" || b === "XAGINR=X" || b === "SILVERBEES") return "SILVER";
  return null;
}

export function isCommodity(symbol: string | null | undefined): boolean {
  return metalKey(symbol) != null;
}

export function metalName(symbol: string): string {
  const k = metalKey(symbol);
  return k ? METALS[k].name : symbol;
}

export function ozToGram(n: number): number {
  return n / TROY_OZ_G;
}

/** Indian gold ETFs are 0.01 g units (~₹100–₹400). Silver ETFs are ~1 g. Fallback only. */
export function etfToGramPrice(kind: MetalId, px: number): number {
  if (!(px > 0)) return 0;
  if (kind === "GOLD") {
    if (px >= 2000) return px;
    return px * 100;
  }
  return px;
}

/** MCX display: gold ₹/10g, silver ₹/kg. */
export function gramToMcx(kind: MetalId, gram: number): number {
  if (!(gram > 0)) return 0;
  return gram * METALS[kind].displayG;
}

export function mcxToGram(kind: MetalId, display: number): number {
  if (!(display > 0)) return 0;
  return display / METALS[kind].displayG;
}

export type McxPrint = {
  display: number;
  prev: number;
  volume: number;
  oi: number;
  expiry: string;
  name: string;
};

export function parseGrowwMcx(html: string, name: "Gold" | "Silver"): { display: number; prev: number } | null {
  const re = new RegExp(
    `"spotPrice":(\\d+(?:\\.\\d+)?),"displayName":"${name}"[^\\}]{0,160}"lastDayClosePrice":(\\d+(?:\\.\\d+)?)`,
  );
  const m = html.match(re);
  if (!m) return null;
  const display = Number(m[1]);
  const prev = Number(m[2]);
  if (!(display > 1000)) return null;
  return { display, prev: prev > 0 ? prev : display };
}

/** Groww futures contract page: `"ltp":234725` / `"close":236704`. */
export function parseGrowwLtp(html: string): { display: number; prev: number } | null {
  const live = parseGrowwLive(html);
  if (live) return { display: live.display, prev: live.prev };
  const ltp = html.match(/"ltp":(\d+(?:\.\d+)?)/);
  const close = html.match(/"close":(\d+(?:\.\d+)?)/);
  const display = ltp ? Number(ltp[1]) : 0;
  const prev = close ? Number(close[1]) : 0;
  if (!(display > 1000)) return null;
  return { display, prev: prev > 0 ? prev : display };
}

/** Live print on a Groww MCX futures page, including volume so we can pick the active month. */
export function parseGrowwLive(html: string): McxPrint | null {
  const block = html.match(/"livePriceDetails":\{[^}]+\}/);
  const src = block ? block[0] : html;
  const ltp = Number(src.match(/"ltp":(\d+(?:\.\d+)?)/)?.[1] || 0);
  const close = Number(src.match(/"close":(\d+(?:\.\d+)?)/)?.[1] || 0);
  if (!(ltp > 1000)) return null;
  const volume = Number(src.match(/"volume":(\d+)/)?.[1] || 0);
  const oi = Number(src.match(/"openInterest":(\d+)/)?.[1] || 0);
  const expiry = html.match(/"expiryDate":"(\d{4}-\d{2}-\d{2})"/)?.[1] || "";
  const name =
    html.match(/"companyShortName":"([^"]+)"/)?.[1] || html.match(/"displayName":"([^"]+Fut)"/)?.[1] || "";
  return { display: ltp, prev: close > 0 ? close : ltp, volume, oi, expiry, name };
}

/** Other MCX months listed on a Groww futures page. */
export function parseGrowwExpiryPaths(html: string, kind: MetalId): string[] {
  const fut = METALS[kind].growwFut;
  const re = new RegExp(`href="(/commodities/futures/${fut}/${fut}[a-z0-9]+)"`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  const json = new RegExp(`"searchId":"(${fut}[a-z0-9]+)"`, "gi");
  while ((m = json.exec(html))) {
    const path = `/commodities/futures/${fut}/${m[1]}`;
    if (!out.includes(path)) out.push(path);
  }
  return out.filter((p) => isMainContractPath(p, kind));
}

export function isMainContractPath(path: string, kind: MetalId): boolean {
  const p = path.toLowerCase();
  if (kind === "GOLD") {
    return /\/mcx_gold(\/|$)/.test(p) && !/goldm|guinea|petal|ten/.test(p);
  }
  return /\/mcx_silver(\/|$)/.test(p) && !/silverm|silvermic|silver100|silverg/.test(p);
}

/** Highest-volume live MCX month — near-month is often rolling off. */
export function pickMostActive(prints: Array<McxPrint | null | undefined>): McxPrint | null {
  const ok = prints.filter((x): x is McxPrint => Boolean(x && x.display > 1000));
  if (!ok.length) return null;
  ok.sort((a, b) => b.volume - a.volume || b.oi - a.oi);
  return ok[0];
}

export function isMiniName(name: string, kind: MetalId): boolean {
  const n = String(name || "").toLowerCase();
  if (kind === "GOLD") return /goldm|mini|guinea|petal|\bten\b/.test(n);
  return /silverm|mini|mic|silver100|silverg/.test(n);
}

/** Headline MCX print: Groww list Gold / Silver (matches ET / Moneycontrol), never Mini, never a far month when the list is present. */
export function pickMcxSpot(
  kind: MetalId,
  list: { display: number; prev: number } | null,
  futures: Array<McxPrint | null | undefined>,
): { display: number; prev: number } | null {
  if (list && list.display > 1000) return { display: list.display, prev: list.prev };
  const main = futures.filter((x): x is McxPrint => Boolean(x && x.display > 1000 && !isMiniName(x.name, kind)));
  main.sort((a, b) => (a.expiry || "9999").localeCompare(b.expiry || "9999"));
  const hit = main[0];
  return hit ? { display: hit.display, prev: hit.prev } : null;
}

/** Futures LTP first (the MCX contract), then the commodities list, then Mini. */
export function pickMcxPrint(
  fut: { display: number; prev: number } | null,
  list: { display: number; prev: number } | null,
  mini: { display: number; prev: number } | null,
): { display: number; prev: number } | null {
  for (const x of [fut, list, mini]) {
    if (x && x.display > 1000) return x;
  }
  return null;
}

export function formatGrams(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1000) return (n / 1000).toFixed(3) + " kg";
  const d = n >= 100 ? 1 : n >= 10 ? 2 : 3;
  return n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: 0 }) + " g";
}

export function formatMcx(kind: MetalId, gram: number): string {
  const px = gramToMcx(kind, gram);
  if (!(px > 0)) return "—";
  return (
    px.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " " + METALS[kind].displayLabel
  );
}

export type MetalDeriveOk = { ok: true; qty: number; avg: number; invested: number; filledFrom: string };
export type MetalDeriveErr = { ok: false; error: string };

/** Fill the missing of grams / ₹/g / total from live or that day's close. Avg is always ₹/g. */
export function deriveMetal(input: {
  qty?: number | null;
  avg?: number | null;
  invested?: number | null;
  close?: number | null;
  live?: number | null;
}): MetalDeriveOk | MetalDeriveErr {
  const qIn = input.qty && input.qty > 0 ? input.qty : 0;
  const aIn = input.avg && input.avg > 0 ? input.avg : 0;
  const iIn = input.invested && input.invested > 0 ? input.invested : 0;
  const close = input.close && input.close > 0 ? input.close : 0;
  const live = input.live && input.live > 0 ? input.live : 0;

  let avg = aIn;
  let src = aIn ? "typed ₹/g" : "";
  if (!avg && close) {
    avg = close;
    src = "close on buy date";
  }
  if (!avg && qIn && iIn) {
    avg = iIn / qIn;
    src = "invested ÷ grams";
  }
  if (!avg && live) {
    avg = live;
    src = "live MCX";
  }
  if (!avg) return { ok: false, error: "Need a price — type ₹/g or pick a buy date" };

  let qty = qIn;
  if (!qty && iIn) qty = iIn / avg;
  if (!qty) return { ok: false, error: "Need grams or total rupees" };

  return { ok: true, qty, avg, invested: qty * avg, filledFrom: src };
}
