/** Compact Kosh snapshot — numbers + a short read. Never invents missing fields. */

import type { Fundamentals, ScreenRow } from "./types.ts";
import type { SkillRead } from "./screens.ts";
import { buildValuationModels, earningsQualityRead } from "./valuation.ts";
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

function cr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " Cr";
}

export function buildSnapshot(input: {
  symbol: string;
  name?: string;
  price?: number | null;
  fund?: Fundamentals | null;
  row?: ScreenRow | null;
  skill?: SkillRead | null;
  bars?: { t: number; c: number }[] | null;
}): KoshSnapshot {
  const f = input.fund || null;
  const row = input.row || null;
  const skill = input.skill || null;
  const price = input.price ?? row?.price ?? null;
  const models = buildValuationModels({ price, fund: f, bars: input.bars });
  const eq = earningsQualityRead(f);
  const sh = stakeDelta(f?.shareholding);
  const missing: string[] = [];

  const lines: SnapshotLine[] = [];
  const pe = f?.pe ?? row?.pe ?? null;
  const ind = f?.industryPe ?? null;
  if (pe != null) {
    lines.push({
      label: "P/E",
      value: ind != null ? `${pe.toFixed(1)} vs ${ind.toFixed(0)}` : pe.toFixed(1),
      tone: ind != null ? (pe <= ind ? "up" : pe > ind * 1.25 ? "down" : undefined) : undefined,
      hint: "Trailing P/E versus the reported industry multiple.",
    });
  } else missing.push("P/E");

  const pb = f?.pb ?? row?.pb ?? null;
  if (pb != null) {
    lines.push({
      label: "P/B",
      value: pb.toFixed(2),
      hint: "Price ÷ book value per share on the company card.",
    });
  } else missing.push("P/B");

  const roe = f?.roe ?? row?.roe ?? null;
  const roce = f?.roce ?? row?.roce ?? null;
  if (roe != null) {
    lines.push({
      label: "ROE",
      value: `${roe.toFixed(1)}%`,
      tone: roe >= 15 ? "up" : roe < 8 ? "down" : undefined,
      hint: "Return on equity from the company card.",
    });
  } else if (roce != null) {
    lines.push({
      label: "ROCE",
      value: `${roce.toFixed(1)}%`,
      tone: roce >= 20 ? "up" : roce < 10 ? "down" : undefined,
      hint: "Return on capital employed from the company card.",
    });
  } else missing.push("ROE");

  const de = f?.de ?? row?.de ?? null;
  if (de != null) {
    lines.push({
      label: "D/E",
      value: de.toFixed(2),
      tone: de <= 0.5 ? "up" : de > 1.5 ? "down" : undefined,
      hint: "Total debt ÷ equity. Banks often skip this print.",
    });
  } else missing.push("Debt/equity");

  const sales = f?.salesYoY ?? row?.salesYoY ?? null;
  if (sales != null) {
    lines.push({
      label: "Sales 1Y",
      value: `${sales.toFixed(0)}%`,
      tone: sales >= 12 ? "up" : sales < 0 ? "down" : undefined,
      hint: "Latest yearly sales growth on the company card.",
    });
  } else missing.push("sales growth");

  const pat1 = f?.profitYoY ?? row?.profitYoY ?? null;
  const pat3 = f?.profitCagr3 ?? row?.profitCagr3 ?? null;
  if (pat1 != null || pat3 != null) {
    const bits = [];
    if (pat1 != null) bits.push(`1Y ${pat1.toFixed(0)}%`);
    if (pat3 != null) bits.push(`3Y ${pat3.toFixed(0)}%`);
    lines.push({
      label: "Profit",
      value: bits.join(" · "),
      tone: (pat3 ?? pat1 ?? 0) >= 12 ? "up" : (pat3 ?? pat1 ?? 0) < 0 ? "down" : undefined,
      hint: "Recorded profit growth from the company card.",
    });
  } else missing.push("profit growth");

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

  const mcap = f?.mcapCr ?? row?.mcapCr ?? null;
  if (mcap != null && mcap > 0) {
    lines.push({
      label: "Mcap",
      value: cr(mcap),
      hint: "Shares outstanding × last price, in ₹ crore.",
    });
  }

  if (eq.cfoPat != null) {
    lines.push({
      label: "Cash / profit",
      value: `${eq.cfoPat.toFixed(2)}×`,
      tone: eq.cfoPat >= 0.8 ? "up" : eq.cfoPat < 0.5 ? "down" : undefined,
      hint: "Latest operating cash ÷ latest reported profit. Missing cash flow stays blank.",
    });
  }

  const fundTag = skill?.fundTag || null;
  const qualTag = skill?.qualTag || null;
  const fundPass = skill?.fundRating ? skill.fundRating === "pass" : null;
  const qualYes = skill?.qualPotential ? skill.qualPotential === "yes" : null;

  const bits: string[] = [];
  if (fundTag && qualTag) bits.push(`Skills: ${fundTag} · ${qualTag}.`);
  else if (fundTag) bits.push(`Fundamental skill: ${fundTag}.`);
  else if (qualTag) bits.push(`Qualitative skill: ${qualTag}.`);
  bits.push(`${models.simple.word}. ${models.simple.figure}.`);

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
