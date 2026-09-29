import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Holding, Portfolio } from "./types";
import { sanitizeHolding } from "./sanitize";

type Row = { id: string; name: string; bench: string; holdings: string };

function parseRow(r: Row): Portfolio {
  let holdings: Holding[] = [];
  try {
    const raw = JSON.parse(r.holdings || "[]");
    if (Array.isArray(raw)) holdings = raw;
  } catch {
    holdings = [];
  }
  return { id: r.id, name: r.name, bench: r.bench || "nifty", holdings };
}

export const listCloudPortfolios = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, name, bench, holdings from portfolios
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(parseRow);
  });

export const saveCloudPortfolios = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ports: Portfolio[]) =>
    (ports || []).map((p) => ({
      id: String(p.id || "").slice(0, 40),
      name: String(p.name || "Main").slice(0, 80),
      bench: String(p.bench || "nifty").slice(0, 40),
      holdings: Array.isArray(p.holdings) ? p.holdings.map((h) => sanitizeHolding(h as Holding)) : [],
    })),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from portfolios where user_id = ${context.userId}`;
    for (const p of data) {
      if (!p.id) continue;
      await sql`
        insert into portfolios (id, user_id, name, bench, holdings, updated_at)
        values (${p.id}, ${context.userId}, ${p.name}, ${p.bench}, ${JSON.stringify(p.holdings)}, now())
      `;
    }
    return { ok: true as const, n: data.length };
  });
