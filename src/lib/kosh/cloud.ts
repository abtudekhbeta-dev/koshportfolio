import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Holding, Portfolio } from "./types";
import { emptyCloud, sanitizeForCloud, type CloudDoc } from "./cloud-state";

type StateRow = { rev: number | string; payload: string };
type PortRow = { id: string; name: string; bench: string; holdings: string };

async function ensure(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists kosh_state (
      user_id text primary key,
      rev bigint not null default 0,
      payload text not null default '{}',
      updated_at timestamptz not null default now()
    )
  `;
}

function legacyDoc(rows: PortRow[]): CloudDoc {
  const doc = emptyCloud();
  doc.portfolios = rows.map((r) => {
    let holdings: Holding[] = [];
    try {
      const raw = JSON.parse(r.holdings || "[]");
      if (Array.isArray(raw)) holdings = raw;
    } catch {
      holdings = [];
    }
    return { id: r.id, name: r.name, bench: r.bench || "nifty", holdings, trades: [] };
  });
  return doc;
}

export const loadCloudState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { knownRev?: number } | undefined) => ({
    knownRev: Number(input?.knownRev) || 0,
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensure(sql);
    const rows = await sql<StateRow>`
      select rev, payload from kosh_state where user_id = ${context.userId}
    `;
    if (rows.length) {
      const rev = Number(rows[0].rev) || 0;
      if (data.knownRev > 0 && data.knownRev === rev) {
        return { rev, doc: emptyCloud(), unchanged: true as const };
      }
      let doc = emptyCloud();
      try {
        doc = { ...emptyCloud(), ...JSON.parse(rows[0].payload || "{}") };
      } catch {
        doc = emptyCloud();
      }
      return { rev, doc, unchanged: false as const };
    }
    const old = await sql<PortRow>`
      select id, name, bench, holdings from portfolios
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return { rev: 0, doc: old.length ? legacyDoc(old) : emptyCloud(), unchanged: false as const };
  });

export const saveCloudState = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { baseRev?: number; doc?: CloudDoc }) => {
    const doc = sanitizeForCloud(input?.doc || emptyCloud());
    return { baseRev: Number(input?.baseRev) || 0, doc };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensure(sql);
    const rows = await sql<StateRow>`
      select rev, payload from kosh_state where user_id = ${context.userId}
    `;
    const serverRev = rows.length ? Number(rows[0].rev) || 0 : 0;
    if (rows.length && serverRev !== data.baseRev) {
      let doc = emptyCloud();
      try {
        doc = { ...emptyCloud(), ...JSON.parse(rows[0].payload || "{}") };
      } catch {
        doc = emptyCloud();
      }
      return { ok: false as const, conflict: true as const, rev: serverRev, doc };
    }
    const next = serverRev + 1;
    const payload = JSON.stringify(data.doc);
    if (!rows.length) {
      await sql`
        insert into kosh_state (user_id, rev, payload, updated_at)
        values (${context.userId}, ${next}, ${payload}, now())
      `;
      return { ok: true as const, conflict: false as const, rev: next };
    }
    const updated = await sql<{ rev: number }>`
      update kosh_state
      set rev = ${next}, payload = ${payload}, updated_at = now()
      where user_id = ${context.userId} and rev = ${data.baseRev}
      returning rev
    `;
    if (!updated.length) {
      const again = await sql<StateRow>`select rev, payload from kosh_state where user_id = ${context.userId}`;
      let doc = emptyCloud();
      try {
        doc = { ...emptyCloud(), ...JSON.parse(again[0]?.payload || "{}") };
      } catch {
        doc = emptyCloud();
      }
      return { ok: false as const, conflict: true as const, rev: Number(again[0]?.rev) || serverRev, doc };
    }
    return { ok: true as const, conflict: false as const, rev: next };
  });
