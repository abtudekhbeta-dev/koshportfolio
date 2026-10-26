import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { buildPack, type RegistryRow, type RrgLibrary, type RrgQuery, type StoredRrg } from "./rrg-pack.ts";
import { RRG_BENCHMARKS, RRG_UNIVERSE } from "./rrg-universe.ts";

const cache = new Map<string, StoredRrg>();

let registryCache: { at: number; root: string; items: RegistryRow[]; summary: Record<string, unknown> | null } | null = null;

const MISSING_STORE = "The server could not find data/rrg/registry.json. The histories were not readable in this runtime.";

function readJsonFile(path: string) {
  const compressed = `${path}.gz`;
  if (existsSync(compressed)) return JSON.parse(gunzipSync(readFileSync(compressed)).toString("utf8"));
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  return undefined;
}

/** First directory that actually contains the registry. A forced test directory is never replaced by another tree. */
export function rrgDataDir() {
  if (process.env.RRG_DATA_DIR) return process.env.RRG_DATA_DIR;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(process.cwd(), "data", "rrg"),
    join(process.cwd(), ".vercel/output/functions/__server.func/data/rrg"),
    join(here, "data", "rrg"),
    join(here, "..", "data", "rrg"),
    join(here, "..", "..", "data", "rrg"),
    join(here, "..", "..", "..", "data", "rrg"),
    join(here, "..", "..", "..", "..", "data", "rrg"),
  ];
  return candidates.find((dir) => existsSync(join(dir, "registry.json"))) || join(process.cwd(), "data", "rrg");
}

export function loadRegistry(): RegistryRow[] {
  const root = rrgDataDir();
  if (registryCache && registryCache.root === root && Date.now() - registryCache.at < 60_000) return registryCache.items;
  cache.clear();
  const path = join(root, "registry.json");
  if (!existsSync(path)) {
    const items = RRG_UNIVERSE.map((item) => ({
      symbol: item.symbol,
      name: item.name,
      category: item.kind === "sector" ? "sector" : item.kind === "stock" ? "stock" : "broad",
      sector: null,
      kind: item.kind,
      benchmark: (RRG_BENCHMARKS as readonly string[]).includes(item.symbol),
      limited: item.limited,
      status: "unavailable",
      from: null,
      to: null,
      rows: 0,
      notes: [MISSING_STORE],
    }));
    registryCache = { at: Date.now(), root, items, summary: null };
    return items;
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { items: RegistryRow[]; summary?: Record<string, unknown> };
  registryCache = { at: Date.now(), root, items: parsed.items, summary: parsed.summary || null };
  return parsed.items;
}

export function registrySummary() {
  loadRegistry();
  return registryCache?.summary || null;
}

export function searchRegistry(query: string, filters: { exchange?: string; category?: string; status?: string }) {
  const text = query.trim().toLowerCase();
  if (text.length < 1) return [];
  return loadRegistry().filter((item) => {
    if (filters.exchange && item.exchange !== filters.exchange) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    return item.symbol.toLowerCase().includes(text) || item.name.toLowerCase().includes(text) || (item.sector || "").toLowerCase().includes(text);
  }).slice(0, 20);
}

export function loadSeries(symbol: string) {
  const root = rrgDataDir();
  if (registryCache && registryCache.root !== root) loadRegistry();
  const hit = cache.get(symbol);
  if (hit) return hit;
  const path = join(root, "store", `${symbol}.json`);
  const parsed = readJsonFile(path) as StoredRrg | undefined;
  if (!parsed) return undefined;
  if (parsed.symbol !== symbol) return undefined;
  if (parsed.basis === "price-return-split-bonus" && parsed.quality) {
    parsed.quality = { ...parsed.quality, adjustment: "price-return-split-bonus" };
  }
  cache.set(symbol, parsed);
  return parsed;
}

export function loadRrgLibrary(): RrgLibrary {
  const registry = loadRegistry();
  return { registry, get: loadSeries };
}

export function loadRrgPack(query: RrgQuery) {
  return buildPack(loadRrgLibrary(), query);
}
