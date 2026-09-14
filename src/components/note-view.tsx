import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MixBlock, PulseBlock, QualityBlock, SparkBlock } from "@/lib/kosh/note-shape";

type Tone = "chart" | "warn" | "down" | "up" | "muted";

function Label({ children, tone = "chart" }: { children: string; tone?: Tone }) {
  const color =
    tone === "down"
      ? "text-down"
      : tone === "warn"
        ? "text-warn"
        : tone === "up"
          ? "text-up"
          : tone === "muted"
            ? "text-subtle"
            : "text-chart";
  return <div className={cn("text-[11px] font-semibold tracking-[0.12em] uppercase", color)}>{children}</div>;
}

function Bullets({ items, tone }: { items: string[]; tone?: "down" | "warn" | "chart" | "muted" }) {
  if (!items.length) return null;
  const mark =
    tone === "down" ? "bg-down" : tone === "warn" ? "bg-warn" : tone === "muted" ? "bg-subtle" : "bg-chart";
  const border = tone === "down" ? "border-down/40" : tone === "warn" ? "border-warn/40" : "border-chart/35";
  return (
    <ul className={cn("mt-2 grid gap-2 border-l-2 pl-3", border)}>
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-[13px] leading-snug text-fg">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", mark)} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

function P({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13px] leading-snug text-fg">{children}</p>;
}

function Block({ children, label, tone }: { children?: ReactNode; label: string; tone?: Tone }) {
  if (!children) return null;
  return (
    <div className="mt-3.5">
      <Label tone={tone}>{label}</Label>
      {children}
    </div>
  );
}

function Frame({
  children,
  tone,
  bare,
  kicker,
}: {
  children: ReactNode;
  tone: "chart" | "warn";
  bare?: boolean;
  kicker: string;
}) {
  const bar = tone === "warn" ? "bg-warn" : "bg-chart";
  const kickerColor = tone === "warn" ? "text-warn" : "text-chart";
  const edge = tone === "warn" ? "border-l-warn" : "border-l-chart";
  if (bare) {
    return (
      <div data-skill={kicker.toLowerCase()}>
        <div className={cn("mb-2 h-0.5 w-10 rounded-full", bar)} />
        <div className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", kickerColor)}>{kicker}</div>
        {children}
      </div>
    );
  }
  return (
    <article
      data-skill={kicker.toLowerCase()}
      className={cn("rounded-lg border-l-[3px] bg-surface p-4 shadow-[var(--shadow-border)]", edge)}
    >
      <div className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", kickerColor)}>{kicker}</div>
      {children}
    </article>
  );
}

export function QualityView({ block, bare }: { block: QualityBlock; bare?: boolean }) {
  if (
    !block.headline &&
    !block.business &&
    !block.industry &&
    !block.moat &&
    !block.price.length &&
    !block.cycle &&
    !block.risks.length
  )
    return null;
  return (
    <Frame tone="chart" bare={bare} kicker="Quality">
      {block.headline ? (
        <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">{block.headline}</h3>
      ) : null}
      {block.business ? (
        <Block label="Business">
          <P>{block.business}</P>
        </Block>
      ) : null}
      {block.price.length ? (
        <Block label="Price">
          <Bullets items={block.price} />
        </Block>
      ) : null}
      {block.risks.length ? (
        <Block label="Watch" tone="down">
          <Bullets items={block.risks} tone="down" />
        </Block>
      ) : null}
    </Frame>
  );
}

export function SparkView({ block, bare }: { block: SparkBlock; bare?: boolean }) {
  if (!block.headline && !block.today && !block.headlines.length && !block.catalysts.length && !block.noise && !block.pricedIn) return null;
  return (
    <Frame tone="warn" bare={bare} kicker="Spark">
      {block.headline ? (
        <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">{block.headline}</h3>
      ) : null}
      {block.today ? (
        <Block label="Today" tone="warn">
          <P>{block.today}</P>
        </Block>
      ) : null}
      {block.catalysts.length ? (
        <Block label="Catalysts">
          <Bullets items={block.catalysts} tone="warn" />
        </Block>
      ) : null}
      {block.pricedIn ? (
        <Block label="Already in the price" tone="muted">
          <P>{block.pricedIn}</P>
        </Block>
      ) : null}
      {block.headlines.length ? (
        <Block label="Headlines versus the move">
          <Bullets items={block.headlines} />
        </Block>
      ) : null}
      {block.noise ? (
        <Block label="Noise" tone="muted">
          <P>{block.noise}</P>
        </Block>
      ) : null}
    </Frame>
  );
}

export function PulseView({ block }: { block: PulseBlock }) {
  if (!block.headline && !block.market && !block.names.length) return null;
  return (
    <article className="mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
      <Label>Pulse</Label>
      {block.headline ? <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">{block.headline}</h3> : null}
      <Block label="Market">
        <P>{block.market}</P>
      </Block>
      <Block label="Breadth">
        <P>{block.breadth}</P>
      </Block>
      <Block label="Names that matter">
        <Bullets items={block.names} />
      </Block>
      <Block label="Headlines vs the price" tone="muted">
        <Bullets items={block.headlines} tone="muted" />
      </Block>
      <Block label="Watch next">
        <Bullets items={block.watch} />
      </Block>
    </article>
  );
}

export function MixView({ block }: { block: MixBlock }) {
  if (!block.headline && !block.mix && !block.risks.length) return null;
  return (
    <article className="mt-4 rounded-lg border-l-[3px] border-l-chart bg-surface p-4 shadow-[var(--shadow-border)]">
      <Label>This portfolio</Label>
      {block.headline ? <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight">{block.headline}</h3> : null}
      <Block label="Holdings">
        <P>{block.mix}</P>
      </Block>
      <Block label="Concentration">
        <Bullets items={block.concentration} />
      </Block>
      <Block label="Large weights">
        <Bullets items={block.largeWeights} />
      </Block>
      <Block label="Versus the index" tone="muted">
        <P>{block.vsIndex}</P>
      </Block>
      <Block label="Open risks" tone="down">
        <Bullets items={block.risks} tone="down" />
      </Block>
    </article>
  );
}

export function ProseNote({ text }: { text: string }) {
  const parts = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  return (
    <div className="mt-4 grid gap-3">
      {parts.map((p, i) => (
        <p key={i} className="text-[13px] leading-relaxed text-fg">
          {p}
        </p>
      ))}
    </div>
  );
}

export function SkillSkeleton({ kicker }: { kicker: "Quality" | "Spark" }) {
  const tone = kicker === "Spark" ? "bg-warn" : "bg-chart";
  const edge = kicker === "Spark" ? "border-l-warn" : "border-l-chart";
  return (
    <article className={cn("rounded-lg border-l-[3px] bg-surface p-4 shadow-[var(--shadow-border)]", edge)}>
      <div className={cn("h-3 w-16 rounded-sm", tone, "opacity-70")} />
      <div className="mt-3 h-5 w-4/5 animate-pulse rounded-sm bg-surface-2" />
      <div className="mt-4 h-3 w-24 rounded-sm bg-surface-2" />
      <div className="mt-2 h-12 animate-pulse rounded-sm bg-surface-2" />
      <div className="mt-3 h-3 w-20 rounded-sm bg-surface-2" />
      <div className="mt-2 h-16 animate-pulse rounded-sm bg-surface-2" />
    </article>
  );
}
