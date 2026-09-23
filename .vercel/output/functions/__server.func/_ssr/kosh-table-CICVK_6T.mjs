//#region node_modules/.nitro/vite/services/ssr/assets/kosh-table-CICVK_6T.js
function nextSortDir(cur) {
	if (cur === null) return "desc";
	if (cur === "desc") return "asc";
	return null;
}
function cmpMissingLast(a, b, dir) {
	const av = a == null || a === "" || typeof a === "number" && !Number.isFinite(a);
	const bv = b == null || b === "" || typeof b === "number" && !Number.isFinite(b);
	if (av && bv) return 0;
	if (av) return 1;
	if (bv) return -1;
	if (typeof a === "number" && typeof b === "number") return dir === "asc" ? a - b : b - a;
	if (a instanceof Date && b instanceof Date) {
		const d = a.getTime() - b.getTime();
		return dir === "asc" ? d : -d;
	}
	const as = String(a);
	const bs = String(b);
	const d = as.localeCompare(bs, "en", {
		numeric: true,
		sensitivity: "base"
	});
	return dir === "asc" ? d : -d;
}
function sortEntities(rows, key, dir, read) {
	if (!key || !dir) return rows;
	const get = read || ((row, k) => row[k]);
	const copy = rows.slice();
	copy.sort((a, b) => cmpMissingLast(get(a, key), get(b, key), dir));
	return copy;
}
function cycleSort(current, nextKey) {
	if (current.key !== nextKey) return {
		key: nextKey,
		dir: "desc"
	};
	const dir = nextSortDir(current.dir);
	return dir ? {
		key: nextKey,
		dir
	} : {
		key: null,
		dir: null
	};
}
function sortGlyph(active, dir) {
	if (!active || !dir) return "↕";
	return dir === "asc" ? "↑" : "↓";
}
//#endregion
export { sortEntities as n, sortGlyph as r, cycleSort as t };
