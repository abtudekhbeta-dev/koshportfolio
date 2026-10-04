import { useMemo, useState } from "react";
import { PAD, VH, VW, niceY, plotChrome, xOf, yOf, yTicks } from "@/lib/kosh/plot";
import { useKosh } from "@/lib/store";
import type { PathSlice } from "@/lib/kosh/types";
import { cn } from "@/lib/utils";

const PALETTE = ["#e0a45a", "#7aa2ff", "#7d9570", "#c4b08a", "#ef6e6e", "#8aa0b8", "#b08d6a", "#3dcf8e", "#9a9aa4"];

type Line = { key: string; name: string; color: string; values: (number | null)[] };

function pickNames(slices: PathSlice[], cap = 8): string[] {
  const peak = new Map<string, { name: string; v: number }>();
  for (const s of slices) {
    for (const p of s.parts) {
      const cur = peak.get(p.symbol);
      if (!cur || p.value > cur.v) peak.set(p.symbol, { name: p.name, v: p.value });
    }
  }
  return [...peak.entries()]
    .sort((a, b) => b[1].v - a[1].v)
    .slice(0, cap)
    .map(([k]) => k);
}

function linesOf(slices: PathSlice[]): Line[] {
  const top = pickNames(slices);
  const topSet = new Set(top);
  const names = new Map<string, string>();
  for (const s of slices) for (const p of s.parts) names.set(p.symbol, p.name);
  const keys = [...top];
  const hasOther = slices.some((s) => s.parts.some((p) => !topSet.has(p.symbol)));
  if (hasOther) keys.push("OTHER");
  return keys.map((key, i) => ({
    key,
    name: key === "OTHER" ? "Other" : names.get(key) || key,
    color: PALETTE[i % PALETTE.length],
    values: slices.map((s) => {
      if (key === "OTHER") {
        const v = s.parts.filter((p) => !topSet.has(p.symbol)).reduce((a, p) => a + p.value, 0);
        return v > 0 ? v : null;
      }
      const hit = s.parts.find((p) => p.symbol === key);
      return hit && hit.value > 0 ? hit.value : null;
    }),
  }));
}

export function PathStack({ slices }: { slices: PathSlice[] }) {
  const chrome = plotChrome(useKosh((s) => s.theme));
  const all = useMemo(() => linesOf(slices), [slices]);
  const [off, setOff] = useState<Record<string, boolean>>({});
  const visible = all.filter((l) => !off[l.key]);
  const n = slices.length;
  const vals: number[] = [];
  for (const l of visible) for (const v of l.values) if (v != null && Number.isFinite(v)) vals.push(v);
  let yLo = vals.length ? Math.min(...vals) : 0;
  let yHi = vals.length ? Math.max(...vals) : 1;
  if (yLo === yHi) {
    const pad = Math.max(Math.abs(yLo) * 0.08, 1);
    yLo -= pad;
    yHi += pad;
  } else {
    const span = yHi - yLo || 1;
    yLo -= span * 0.1;
    yHi += span * 0.1;
  }
  const ticks = yTicks(yLo, yHi);

  function dOf(line: Line): string {
    const parts: string[] = [];
    let drawing = false;
    for (let i = 0; i < n; i++) {
      const v = line.values[i];
      if (v == null || !Number.isFinite(v)) {
        drawing = false;
        continue;
      }
      const x = xOf(i, n);
      const y = yOf(v, yLo, yHi);
      parts.push(`${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
      drawing = true;
    }
    return parts.join(" ");
  }

  function flip(key: string) {
    const next = { ...off, [key]: !off[key] };
    if (all.every((l) => next[l.key])) return;
    setOff(next);
  }

  if (n < 2 || all.length < 1) return null;

  const xCount = Math.min(6, n);
  const xIdx = Array.from({ length: xCount }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, xCount - 1)));

  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h2 className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">What you held</h2>
      <p className="mt-1 mb-3 text-[13px] leading-relaxed text-muted">
        Each line is the rupees in that name after buys and sells. Tap a name to hide it — the scale follows what is on.
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {all.map((l) => {
          const on = !off[l.key];
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={on}
              title={on ? `Hide ${l.name}` : `Show ${l.name}`}
              onClick={() => flip(l.key)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] leading-none shadow-[var(--shadow-border)]",
                on ? "bg-bg-elevated text-fg" : "text-subtle line-through decoration-subtle",
              )}
            >
              <span className="inline-block h-[3px] w-3.5 shrink-0 rounded-full" style={{ background: on ? l.color : "#6e6e76" }} />
              {l.name}
            </button>
          );
        })}
      </div>
      <div className="kosh-plot relative mt-2 w-full">
        <img
          alt="Rupees held in each name"
          width={VW}
          height={VH}
          className="kosh-plot-img"
          src={
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" preserveAspectRatio="none">` +
                ticks
                  .map((v) => {
                    const y = yOf(v, yLo, yHi);
                    return `<line x1="${PAD.l}" y1="${y.toFixed(2)}" x2="${VW - PAD.r}" y2="${y.toFixed(2)}" stroke="${chrome.gridStroke}" stroke-width="1"/>` +
                      `<text x="${PAD.l - 6}" y="${y.toFixed(2)}" fill="${chrome.tickFill}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="end" dominant-baseline="middle">${esc(niceY(v, true))}</text>`;
                  })
                  .join("") +
                xIdx
                  .map((i) => {
                    if (!slices[i]) return "";
                    return `<text x="${xOf(i, n).toFixed(2)}" y="${VH - 8}" fill="${chrome.tickFill}" font-size="10" font-family="IBM Plex Mono,ui-monospace,monospace" text-anchor="middle">${esc(slices[i].day.slice(2))}</text>`;
                  })
                  .join("") +
                visible
                  .map((l) => {
                    const d = dOf(l);
                    if (!d.startsWith("M")) return "";
                    return `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="${l.key === visible[0]?.key ? 2.2 : 1.7}" stroke-linejoin="round" stroke-linecap="round"/>`;
                  })
                  .join("") +
                `</svg>`,
            )
          }
        />
      </div>
      <p className="mt-2 text-[11px] text-subtle">
        {visible.length} line{visible.length === 1 ? "" : "s"} · {n} month-ends
      </p>
    </section>
  );
}

function esc(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}