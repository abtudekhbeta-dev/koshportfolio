import { access, cp, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, ".vercel/output/functions/__server.func/data/rrg");
const source = join(root, "data/rrg");

await mkdir(dest, { recursive: true });
await cp(join(source, "registry.json"), join(dest, "registry.json"));
await cp(join(source, "constituents.json"), join(dest, "constituents.json"));
await cp(join(source, "store"), join(dest, "store"), { recursive: true });
const probe = join(dest, "store", "NIFTY BANK.json.gz");
await access(probe);
const size = (await stat(probe)).size;
if (size < 1000) throw new Error(`[rrg] NIFTY BANK history was not copied (${size} bytes)`);
const reliance = await stat(join(dest, "store", "RELIANCE.json.gz"));
if (reliance.size < 1000) throw new Error("[rrg] RELIANCE history was not copied");
const auto = await stat(join(dest, "store", "NIFTY AUTO.json.gz"));
if (auto.size < 1000) throw new Error("[rrg] NIFTY AUTO history was not copied");
await access(join(dest, "constituents.json"));
console.log(`[rrg] copied compressed histories into the server function (${size} byte Nifty Bank file)`);
