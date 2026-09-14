/** Compact Kosh snapshot — numbers + a short read. Never invents missing fields. */

import type { Fundamentals, ScreenRow } from "./types.ts";
import type { SkillRead } from "./screens.ts";
import { buildValuation, earningsQualityRead } from "./valuation.ts";
import { stakeDelta } from "./shareholding.ts";

export type SnapshotLine = {
  label: string;
  value: string;
  tone?: "up" | "down" | "muted";
  hint: string;
};

export type KoshSnapshot = {
  symbol: string;
  name: string;
  fundTag: string | null;
  qualTag: string | null;
  fundPass: boolean | null;
  qualYes: boolean | null;
  lines: SnapshotLine[];
  read: string;
  missing: string[];
};

export function buildSnapshot(input: {
  symbol: string;
  name?: string;
  price?: number | null;
  fund?: Fundamentals | null;
  row?: ScreenRow | null;
  skill?: SkillRead | null;
}): KoshSnapshot {
  const f = input.fund || null;
  const row = input.row || null;
  const skill = input.skill || null;
  const price = input.price ?? row?.price ?? null;
  const val = buildValuation({ price, fund: f });
  const eq = earningsQualityRead(f);
  const sh = stakeDelta(f?.shareholding);
  const missing: string[] = [];

  const lines: SnapshotLine[] = [];
  const pe = f?.pe ?? row?.pe ?? val.pe;
  const ind = f?.industryPe ?? null;
  if (pe != null) {
    lines.push({
      label: "P/E",
      value: ind != null ? `${pe.toFixed(1)} vs ind ${ind.toFixed(0)}` : pe.toFixed(1),
      tone: ind != null ? (pe <= ind ? "up" : pe > ind * 1.25 ? "down" : undefined) : undefined,
      hint: "Trailing P/E versus the reported industry multiple. Blank industry means we do not invent a peer set.",
    });
  } else missing.push("P/E");

  if (val.graham != null) {
    const gap = val.grahamGap;
    lines.push({
      label: "Graham",
      value: gap != null ? `₹${val.graham.toFixed(0)} · ${gap >= 0 ? "+" : ""}${gap.toFixed(0)}%` : `₹${val.graham.toFixed(0)}`,
      tone: gap != null ? (gap < -10 ? "up" : gap > 25 ? "down" : undefined) : undefined,
      hint: "√(22.5 × EPS × book). A textbook ceiling, not a target.",
    });
  } else missing.push("Graham (needs EPS and book)");

  const roce = f?.roce ?? row?.roce ?? null;
  if (roce != null) {
    lines.push({
      label: "ROCE",
      value: `${roce.toFixed(1)}%`,
      tone: roce >= 20 ? "up" : roce < 10 ? "down" : undefined,
      hint: "Return on capital employed from the company card.",
    });
  } else missing.push("ROCE");

  const de = f?.de ?? row?.de ?? null;
  if (de != null) {
    lines.push({
      label: "D/E",
      value: de.toFixed(2),
      tone: de <= 0.5 ? "up" : de > 1.5 ? "down" : undefined,
      hint: "Debt ÷ equity. Banks often skip this print.",
    });
  } else missing.push("Debt/equity");

  if (eq.cfoPat != null) {
    lines.push({
      label: "Cash / profit",
      value: `${eq.cfoPat.toFixed(2)}× · ${eq.tag}`,
      tone: eq.cfoPat >= 0.8 ? "up" : eq.cfoPat < 0.5 ? "down" : undefined,
      hint: "Latest operating cash ÷ latest reported profit. Missing cash flow stays blank.",
    });
  } else missing.push("operating cash flow");

  const prom = f?.promoters ?? row?.promoters ?? null;
  if (prom != null) {
    const dFii = sh?.fiiDelta ?? row?.fiiDelta ?? null;
    lines.push({
      label: "Promoter",
      value: dFii != null ? `${prom.toFixed(1)}% · FII ${dFii >= 0 ? "+" : ""}${dFii.toFixed(1)} pp` : `${prom.toFixed(1)}%`,
      tone: prom >= 50 ? "up" : prom < 25 ? "down" : undefined,
      hint: "Latest promoter holding. FII change is the last reported quarter versus the one before.",
    });
  } else missing.push("promoter holding");

  const fundTag = skill?.fundTag || null;
  const qualTag = skill?.qualTag || null;
  const fundPass = skill?.fundRating ? skill.fundRating === "pass" : null;
  const qualYes = skill?.qualPotential ? skill.qualPotential === "yes" : null;

  const bits: string[] = [];
  if (fundTag && qualTag) {
    bits.push(`Skills: ${fundTag} · ${qualTag}.`);
  } else if (fundTag) {
    bits.push(`Fundamental skill: ${fundTag}. Qualitative not run.`);
  } else if (qualTag) {
    bits.push(`Qualitative skill: ${qualTag}. Fundamental not run.`);
  } else {
    bits.push("No skill read yet — tags stay blank rather than guessed.");
  }
  bits.push(val.read);
  bits.push(eq.body);

  return {
    symbol: input.symbol,
    name: input.name || f?.name || input.symbol,
    fundTag,
    qualTag,
    fundPass,
    qualYes,
    lines,
    read: bits.filter(Boolean).join(" "),
    missing,
  };
}
