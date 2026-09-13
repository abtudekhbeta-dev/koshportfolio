import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { K as withSleeveIndex, dt as resolveBench, in as baseSym, ut as allSectorBenchSymbols, w as assembleBook } from "./router-oJX0L9_1.mjs";
import { l as apiQuotes, r as apiHistories } from "./api-Dymx0Kns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-book-CMJYkiEf.js
function indexPacks(rows) {
	const packs = {};
	for (const d of rows) {
		packs[d.input] = d;
		packs[d.symbol] = d;
	}
	return packs;
}
async function loadBook(portfolio, opts) {
	const include = portfolio.includeCommodities !== false;
	const holdings = portfolio.holdings;
	const bench = resolveBench(portfolio.bench);
	const symbols = holdings.map((h) => h.symbol);
	const extra = opts?.sleeves === false ? [] : allSectorBenchSymbols();
	const need = [.../* @__PURE__ */ new Set([
		...symbols,
		bench.symbol,
		...extra
	])];
	const [quotes, histRows] = await Promise.all([symbols.length ? apiQuotes(symbols) : Promise.resolve([]), need.length ? apiHistories(need, "max") : Promise.resolve([])]);
	const quoteMap = {};
	for (const q of quotes) {
		quoteMap[baseSym(q.input)] = q;
		quoteMap[q.input] = q;
		quoteMap[q.symbol] = q;
	}
	const packs = indexPacks(histRows);
	const histories = {};
	for (const h of holdings) {
		const stem = h.symbol.replace(/[-_]SM$/i, "");
		const pack = packs[h.symbol] || packs[baseSym(h.symbol)] || packs[stem] || Object.values(packs).find((p) => {
			const a = baseSym(p.input);
			const b = baseSym(p.symbol);
			const want = baseSym(h.symbol);
			const alt = baseSym(stem);
			return a === want || b === want || a === alt || b === alt;
		});
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
	return assembleBook({
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
}
function useBook(portfolio) {
	return useQuery({
		queryKey: [
			"book",
			"v9",
			portfolio?.id,
			portfolio?.bench,
			portfolio?.includeCommodities,
			portfolio?.holdings
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
