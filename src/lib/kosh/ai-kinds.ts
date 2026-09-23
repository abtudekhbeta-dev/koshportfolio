/** Client-safe note types. Server implementation lives in ai.server.ts. */

import type {
  FundBlock,
  MixBlock,
  PulseBlock,
  QualBlock,
  QualityBlock,
  SparkBlock,
  StructureBlock,
} from "./note-shape";

export type NoteKind = "quality" | "spark" | "ask" | "pulse" | "book" | "desk" | "holdings" | "fund" | "qual" | "structure" | "picks" | "combine" | "improve";

export type BookName = {
  symbol: string;
  weight: number;
  sector: string;
  fundTag?: string;
  fundRating?: string;
  fundVerdict?: string;
  qualTag?: string;
  qualPotential?: string;
  qualVerdict?: string;
  fundApproved?: string;
  qualApproved?: string;
  fundStatus?: string;
  qualStatus?: string;
};

export type BookBrief = {
  name: string;
  bench: string;
  names: BookName[];
};

export type StructureMode = "intraday" | "swing" | "positional" | "chart";

export type ChartFactsIn = {
  interval?: string;
  lookback?: string;
  last?: number;
  rsi?: number | null;
  swings?: { label: string; price: number; t?: number }[];
  levels?: { price: number; n: number; labels: string[] }[];
  mtf?: { price: number; n: number; labels: string[] }[];
  mode?: StructureMode;
};

export type PickNote = { symbol: string; fund: string; qual: string; why: string };

export type HoldingNote = {
  symbol: string;
  quality: string;
  spark: string;
  qualityBlock?: QualityBlock | null;
  sparkBlock?: SparkBlock | null;
};

export type { FundBlock, MixBlock, PulseBlock, QualBlock, QualityBlock, SparkBlock, StructureBlock };
