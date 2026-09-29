import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { U as assembleBook, ft as withSleeveIndex, nr as baseSym, sr as resolveBench, tr as allSectorBenchSymbols } from "./router-CAFi_xno.mjs";
import { i as apiHistories, u as apiQuotes } from "./api-DNMbHhUJ.mjs";
import { t as buildPath } from "./path-BjSP5sm6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-book-Biv9Dixn.js
function indexPacks(rows) {
	const packs = {};
	for (const d of rows) {
		packs[d.input] = d;
		packs[d.symbol] = d;
	}
	return packs;
}
function pickPack(packs, symbol) {
	const stem = symbol.replace(/[-_]SM$/i, "");
	return packs[symbol] || packs[baseSym(symbol)] || packs[stem] || Object.values(packs).find((p) => {
		const a = baseSym(p.input);
		const b = baseSym(p.symbol);
		const want = baseSym(symbol);
		const alt = baseSym(stem);
		return a === want || b === want || a === alt || b === alt;
	});
}
async function loadBook(portfolio, opts) {
	const include = portfolio.includeCommodities !== false;
	const holdings = portfolio.holdings;
	const trades = portfolio.trades || [];
	const bench = resolveBench(portfolio.bench);
	const symbols = holdings.map((h) => h.symbol);
	const tradeSyms = trades.map((t) => t.symbol);
	const extra = opts?.sleeves === false ? [] : allSectorBenchSymbols();
	const need = [.../* @__PURE__ */ new Set([
		...symbols,
		...tradeSyms,
		bench.symbol,
		...extra
	])];
	const quoteSyms = [.../* @__PURE__ */ new Set([...symbols, ...tradeSyms])];
	const [quotes, histRows] = await Promise.all([quoteSyms.length ? apiQuotes(quoteSyms) : Promise.resolve([]), need.length ? apiHistories(need, "max") : Promise.resolve([])]);
	const quoteMap = {};
	for (const q of quotes) {
		quoteMap[baseSym(q.input)] = q;
		quoteMap[q.input] = q;
		quoteMap[q.symbol] = q;
	}
	const packs = indexPacks(histRows);
	const histories = {};
	for (const h of holdings) {
		const pack = pickPack(packs, h.symbol);
		histories[h.symbol] = pack?.bars || [];
		if (pack?.price && !quoteMap[baseSym(h.symbol)]?.price) quoteMap[baseSym(h.symbol)] = {
			input: h.symbol,
			symbol: pack.symbol,
			name: pack.name,
			price: pack.price,
			previousClose: pack.previousClose,
			changePct: pack.changePct,
			high52: pack.high52,
			low52: pack.low52
		};
	}
	const tradeHx = { ...histories };
	for (const s of [...new Set(tradeSyms)]) {
		tradeHx[s] = pickPack(packs, s)?.bars || tradeHx[s] || [];
		tradeHx[baseSym(s)] = tradeHx[s];
	}
	const benchPack = pickPack(packs, bench.symbol);
	const book = assembleBook({
		holdings,
		quotes: quoteMap,
		histories,
		packs,
		benchSymbol: bench.symbol,
		benchName: bench.name,
		asOf: (/* @__PURE__ */ new Date()).toISOString(),
		hxRange: "max",
		includeCommodities: include
	});
	if (trades.length) {
		const livePx = {};
		for (const [k, q] of Object.entries(quoteMap)) if (q?.price > 0) livePx[baseSym(k)] = q.price;
		book.path = buildPath(trades, tradeHx, benchPack?.bars || [], Date.now(), livePx);
	}
	return book;
}
function useBook(portfolio) {
	return useQuery({
		queryKey: [
			"book",
			"v13",
			portfolio?.id,
			portfolio?.bench,
			portfolio?.includeCommodities,
			portfolio?.holdings,
			portfolio?.trades
		],
		queryFn: () => loadBook(portfolio, { sleeves: false }),
		enabled: Boolean(portfolio && portfolio.holdings.length),
		staleTime: 2e4,
		refetchInterval: 2e4,
		refetchOnWindowFocus: false
	});
}
function useSleeveBook(book, enabled) {
	const q = useQuery({
		queryKey: ["sleeve-hx"],
		queryFn: () => apiHistories(allSectorBenchSymbols(), "max"),
		enabled: Boolean(enabled && book),
		staleTime: 36e5
	});
	if (!book) return {
		book: void 0,
		pending: q.isPending
	};
	if (!q.data) return {
		book,
		pending: q.isPending
	};
	return {
		book: withSleeveIndex(book, q.data),
		pending: false
	};
}
//#endregion
export { useBook as n, useSleeveBook as r, loadBook as t };
