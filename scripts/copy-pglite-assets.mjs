import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules/@electric-sql/pglite/dist");
const to = join(root, ".vercel/output/functions/__server.func/_libs");
const files = ["pglite.wasm", "pglite.data", "initdb.wasm"];

await mkdir(to, { recursive: true });
for (const name of files) {
  await copyFile(join(from, name), join(to, name));
}
console.log("[pglite] copied wasm and data next to the server bundle");
