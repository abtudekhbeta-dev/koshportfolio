import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as emptyCloud, c as getSql, d as sanitizeForCloud, t as authMiddleware } from "./cloud-state-Cn-qMj7l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cloud-CFXQXikj.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function ensure(sql) {
	await sql`
    create table if not exists kosh_state (
      user_id text primary key,
      rev bigint not null default 0,
      payload text not null default '{}',
      updated_at timestamptz not null default now()
    )
  `;
}
function legacyDoc(rows) {
	const doc = emptyCloud();
	doc.portfolios = rows.map((r) => {
		let holdings = [];
		try {
			const raw = JSON.parse(r.holdings || "[]");
			if (Array.isArray(raw)) holdings = raw;
		} catch {
			holdings = [];
		}
		return {
			id: r.id,
			name: r.name,
			bench: r.bench || "nifty",
			holdings,
			trades: []
		};
	});
	return doc;
}
var loadCloudState_createServerFn_handler = createServerRpc({
	id: "0e91473b8a573164424c655ab7a04cc189f455395bb79dec1df8b9ee23bd960a",
	name: "loadCloudState",
	filename: "src/lib/kosh/cloud.ts"
}, (opts) => loadCloudState.__executeServer(opts));
var loadCloudState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadCloudState_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensure(sql);
	const rows = await sql`
      select rev, payload from kosh_state where user_id = ${context.userId}
    `;
	if (rows.length) {
		let doc = emptyCloud();
		try {
			doc = {
				...emptyCloud(),
				...JSON.parse(rows[0].payload || "{}")
			};
		} catch {
			doc = emptyCloud();
		}
		return {
			rev: Number(rows[0].rev) || 0,
			doc
		};
	}
	const old = await sql`
      select id, name, bench, holdings from portfolios
      where user_id = ${context.userId}
      order by updated_at desc
    `;
	return {
		rev: 0,
		doc: old.length ? legacyDoc(old) : emptyCloud()
	};
});
var saveCloudState_createServerFn_handler = createServerRpc({
	id: "a0270d09cba43b3df5696c50f6cca5bb87cd3fd66e5b3037ec5b2b49cb7cea6a",
	name: "saveCloudState",
	filename: "src/lib/kosh/cloud.ts"
}, (opts) => saveCloudState.__executeServer(opts));
var saveCloudState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const doc = sanitizeForCloud(input?.doc || emptyCloud());
	return {
		baseRev: Number(input?.baseRev) || 0,
		doc
	};
}).handler(saveCloudState_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensure(sql);
	const rows = await sql`
      select rev, payload from kosh_state where user_id = ${context.userId}
    `;
	const serverRev = rows.length ? Number(rows[0].rev) || 0 : 0;
	if (rows.length && serverRev !== data.baseRev) {
		let doc = emptyCloud();
		try {
			doc = {
				...emptyCloud(),
				...JSON.parse(rows[0].payload || "{}")
			};
		} catch {
			doc = emptyCloud();
		}
		return {
			ok: false,
			conflict: true,
			rev: serverRev,
			doc
		};
	}
	const next = serverRev + 1;
	const payload = JSON.stringify(data.doc);
	if (!rows.length) {
		await sql`
        insert into kosh_state (user_id, rev, payload, updated_at)
        values (${context.userId}, ${next}, ${payload}, now())
      `;
		return {
			ok: true,
			conflict: false,
			rev: next
		};
	}
	if (!(await sql`
      update kosh_state
      set rev = ${next}, payload = ${payload}, updated_at = now()
      where user_id = ${context.userId} and rev = ${data.baseRev}
      returning rev
    `).length) {
		const again = await sql`select rev, payload from kosh_state where user_id = ${context.userId}`;
		let doc = emptyCloud();
		try {
			doc = {
				...emptyCloud(),
				...JSON.parse(again[0]?.payload || "{}")
			};
		} catch {
			doc = emptyCloud();
		}
		return {
			ok: false,
			conflict: true,
			rev: Number(again[0]?.rev) || serverRev,
			doc
		};
	}
	return {
		ok: true,
		conflict: false,
		rev: next
	};
});
//#endregion
export { loadCloudState_createServerFn_handler, saveCloudState_createServerFn_handler };
