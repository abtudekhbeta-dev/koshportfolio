import { baseSym, storedSymbol } from "./sectors.ts";

export type SymbolBook = { aliases: Record<string, string>; skips: string[] };

export function emptySymbolBook(): SymbolBook {
  return { aliases: {}, skips: [] };
}

/** Confirmed mapping wins. Otherwise the stored spelling is kept, including `&`. */
export function resolveSymbol(raw: string, book?: SymbolBook | null): string {
  const stored = storedSymbol(raw);
  if (!book) return stored;
  const alias = book.aliases[stored] || book.aliases[baseSym(stored)];
  return alias ? storedSymbol(alias) : stored;
}

export function isSkippedSymbol(raw: string, book?: SymbolBook | null): boolean {
  if (!book?.skips?.length) return false;
  const stored = storedSymbol(raw);
  return book.skips.includes(stored) || book.skips.includes(baseSym(stored));
}
