import { useState } from "react";
import { cn } from "@/lib/utils";

const FAILED = new Set<string>();

function bare(symbol: string) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/\.(NS|BO)$/i, "")
    .trim();
}

function initials(name: string, symbol: string) {
  const words = (name || "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !/^(ltd|limited|inc|co|company|the|of|and)$/i.test(word));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const src = bare(symbol) || words[0] || "?";
  return src.slice(0, 2).toUpperCase();
}

function ink(symbol: string) {
  const tones = ["#1c4538", "#6d2c3a", "#1e3a5f", "#6a4712", "#3a3834", "#2d4a3e"];
  let n = 0;
  for (const ch of bare(symbol) || symbol) n = (n * 33 + ch.charCodeAt(0)) >>> 0;
  return tones[n % tones.length];
}

/** One logo for a listed company. Image from api.dharun.dev; monogram if it is missing. */
export function CompanyLogo({
  symbol,
  name,
  size = 28,
  className,
}: {
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const ticker = bare(symbol);
  const usable = /^[A-Z][A-Z0-9-]{0,20}$/.test(ticker) && !ticker.startsWith("^");
  const [broken, setBroken] = useState(() => !usable || FAILED.has(ticker));
  const px = Math.max(14, Math.round(size));
  if (broken || !usable) {
    return (
      <span
        aria-hidden
        className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold text-white", className)}
        style={{ width: px, height: px, background: ink(ticker || name || "?"), fontSize: px < 22 ? 8 : 10 }}
      >
        {initials(name || "", ticker)}
      </span>
    );
  }
  const request = px <= 32 ? 64 : 128;
  return (
    <img
      src={`https://api.dharun.dev/v1/logos/${encodeURIComponent(ticker)}?format=png&size=${request}`}
      alt=""
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn("inline-block shrink-0 rounded-full bg-white object-contain", className)}
      style={{ width: px, height: px }}
      onError={() => {
        FAILED.add(ticker);
        setBroken(true);
      }}
    />
  );
}

export const LOGO_ATTRIBUTION = "Company marks from api.dharun.dev. Logos are trademarks of the companies they identify.";
