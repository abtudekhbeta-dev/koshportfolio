/** Field-level evidence. Status is explicit — never a fake confidence score. */

export type FactStatus = "verified" | "derived" | "conflicting" | "unavailable" | "not_applicable";

export type SourceRank =
  | "company-filing"
  | "exchange-filing"
  | "annual-report"
  | "presentation"
  | "structured-provider"
  | "secondary"
  | "kosh-derived"
  | "unknown";

export type FactProvenance = {
  status: FactStatus;
  source: string;
  rank: SourceRank;
  method: string;
  period?: string | null;
  alt?: number | null;
  altSource?: string | null;
  reason?: string;
};

export type Provenance = {
  /** Set after a completion pass so the page does not retry the same name forever. */
  searched?: boolean;
  at?: number | null;
  fields: Record<string, FactProvenance>;
};
