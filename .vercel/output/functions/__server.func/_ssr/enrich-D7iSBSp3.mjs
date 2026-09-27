import { $n as TICKER_NAMES, Kn as guessTicker, ar as isIsin, ir as displayName } from "./router-BGlqc6-G.mjs";
import { m as apiSearch } from "./api-DLVfETZc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enrich-D7iSBSp3.js
function nseTicker(symbol) {
	return symbol.replace(/\.(NS|BO)$/i, "").replace(/-/g, "_").toUpperCase();
}
function knownTicker(symbol) {
	const b = nseTicker(symbol);
	return Boolean(TICKER_NAMES[b]) || b.length <= 15 && /^[A-Z][A-Z0-9_]{0,14}$/.test(b) && !isIsin(b);
}
async function lookup(q) {
	const hits = await apiSearch(q);
	const best = hits.find((x) => /\.NS$/i.test(x.symbol)) || hits.find((x) => /\.BO$/i.test(x.symbol)) || hits[0];
	if (!best?.symbol) return null;
	return {
		symbol: nseTicker(best.symbol),
		name: best.name || ""
	};
}
/** Turn ISINs / company-only rows into NSE tickers and real names. Never drop avg cost. */
async function enrichHoldings(holdings) {
	return Promise.all(holdings.map(async (h) => {
		const named = {
			...h,
			name: displayName(h)
		};
		const long = h.symbol.length > 15 || /LTD|LIMITED|FLUORO|INDUSTRIES/.test(h.symbol);
		if (!(isIsin(h.symbol) || isIsin(h.name) || long || !knownTicker(h.symbol) && Boolean(h.isin || h.name))) return named;
		const queries = [
			h.isin,
			isIsin(h.symbol) ? h.symbol : "",
			h.name,
			named.name,
			long ? h.symbol : ""
		].filter((x, i, arr) => x && arr.indexOf(x) === i);
		for (const q of queries) try {
			const hit = await lookup(q);
			if (!hit) continue;
			const symbol = guessTicker(hit.symbol, hit.name, h.isin || void 0);
			if (isIsin(symbol) || symbol.length > 15) continue;
			return {
				...named,
				symbol,
				name: hit.name || displayName({
					symbol,
					name: h.name
				}),
				isin: h.isin || (isIsin(h.symbol) ? h.symbol : h.isin),
				avg: h.avg,
				qty: h.qty
			};
		} catch {}
		return named;
	}));
}
//#endregion
export { enrichHoldings as t };
