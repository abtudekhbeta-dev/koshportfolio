/** Server-side abuse controls. Client headers are not a limit. */

const buckets = new Map<string, number[]>();

export function clientKey(request: Request) {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || request.headers.get("x-real-ip") || "local").slice(0, 80);
}

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 5000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return true;
}

export function tooLarge(request: Request, maxBytes: number) {
  const n = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(n) && n > maxBytes;
}

const FILING_HOSTS = ["nseindia.com", "bseindia.com"];

/** Filing fetches may only follow official exchange hosts. */
export function allowedFilingUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return FILING_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}
