//#region node_modules/.nitro/vite/services/ssr/assets/api-DO8P1YVB.js
function friendlyHttp(status, t) {
	if (/<!DOCTYPE|Gateway time-out|Error code 504|cf-error/i.test(t) || status === 504 || status === 502) return "The analysis took too long. Retry — a second pass is usually faster.";
	const s = t.replace(/\s+/g, " ").trim().slice(0, 180);
	if (status === 429) return "Too many reads. Try again in a few minutes.";
	return s || `Request failed (${status})`;
}
async function json(path, init) {
	const r = await fetch(path, init);
	const t = await r.text().catch(() => "");
	if (/<!DOCTYPE|Gateway time-out|cf-error/i.test(t)) throw new Error(friendlyHttp(r.status || 504, t));
	if (!r.ok) throw new Error(friendlyHttp(r.status, t));
	try {
		return JSON.parse(t);
	} catch {
		throw new Error(friendlyHttp(r.status, t));
	}
}
async function apiTape() {
	return (await json("/api/tape")).rows || [];
}
async function apiQuotes(symbols) {
	if (!symbols.length) return [];
	return (await json("/api/quote?symbols=" + encodeURIComponent(symbols.join(",")))).quotes || [];
}
async function apiHistories(symbols, range = "max") {
	if (!symbols.length) return [];
	return (await json("/api/histories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			symbols,
			range
		})
	})).rows || [];
}
async function apiHistory(symbol, range = "max") {
	return json("/api/history?symbol=" + encodeURIComponent(symbol) + "&range=" + encodeURIComponent(range));
}
async function apiSearch(q) {
	return (await json("/api/search?q=" + encodeURIComponent(q))).quotes || [];
}
async function apiCloseOn(symbol, day) {
	return json("/api/close?symbol=" + encodeURIComponent(symbol) + "&day=" + encodeURIComponent(day));
}
async function apiOhlc(symbol, range = "1y", interval = "1d") {
	return json("/api/ohlc?symbol=" + encodeURIComponent(symbol) + "&range=" + encodeURIComponent(range) + "&interval=" + encodeURIComponent(interval));
}
async function apiNews(symbol, name) {
	return (await json("/api/news?symbol=" + encodeURIComponent(symbol) + (name ? "&name=" + encodeURIComponent(name) : ""))).items || [];
}
async function apiScreener() {
	return await json("/api/screener");
}
async function apiScreenerDeep() {
	return await json("/api/screener?depth=full");
}
async function apiSkillPut(read) {
	return json("/api/skill-board", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(read)
	});
}
async function apiFundamentals(symbol) {
	return (await json("/api/fundamentals?symbol=" + encodeURIComponent(symbol))).fund;
}
async function apiMacro() {
	return json("/api/macro");
}
async function apiNote(body) {
	return json("/api/note", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body)
	});
}
async function apiScreenBuild(body) {
	return json("/api/screen-build", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body)
	});
}
//#endregion
export { apiMacro as a, apiOhlc as c, apiScreener as d, apiScreenerDeep as f, apiTape as h, apiHistory as i, apiQuotes as l, apiSkillPut as m, apiFundamentals as n, apiNews as o, apiSearch as p, apiHistories as r, apiNote as s, apiCloseOn as t, apiScreenBuild as u };
