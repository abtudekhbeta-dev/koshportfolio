import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as sanitizeHolding, i as getSql, t as authMiddleware } from "./sanitize-vhr9xYgk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cloud-CEaBM-1W.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function parseRow(r) {
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
		holdings
	};
}
var listCloudPortfolios_createServerFn_handler = createServerRpc({
	id: "d79017ea9366253cc00c3865cb3b19c82c41673182e3330a18ad7370ee83578a",
	name: "listCloudPortfolios",
	filename: "src/lib/kosh/cloud.ts"
}, (opts) => listCloudPortfolios.__executeServer(opts));
var listCloudPortfolios = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCloudPortfolios_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, name, bench, holdings from portfolios
      where user_id = ${context.userId}
      order by updated_at desc
    `).map(parseRow);
});
var saveCloudPortfolios_createServerFn_handler = createServerRpc({
	id: "c2edfefd9878cccfdb8fee5146881eb46dec708d4ea8491bbb3d2a50215aa12e",
	name: "saveCloudPortfolios",
	filename: "src/lib/kosh/cloud.ts"
}, (opts) => saveCloudPortfolios.__executeServer(opts));
var saveCloudPortfolios = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((ports) => (ports || []).map((p) => ({
	id: String(p.id || "").slice(0, 40),
	name: String(p.name || "Main").slice(0, 80),
	bench: String(p.bench || "nifty").slice(0, 40),
	holdings: Array.isArray(p.holdings) ? p.holdings.map((h) => sanitizeHolding(h)) : []
}))).handler(saveCloudPortfolios_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await sql`delete from portfolios where user_id = ${context.userId}`;
	for (const p of data) {
		if (!p.id) continue;
		await sql`
        insert into portfolios (id, user_id, name, bench, holdings, updated_at)
        values (${p.id}, ${context.userId}, ${p.name}, ${p.bench}, ${JSON.stringify(p.holdings)}, now())
      `;
	}
	return {
		ok: true,
		n: data.length
	};
});
//#endregion
export { listCloudPortfolios_createServerFn_handler, saveCloudPortfolios_createServerFn_handler };
