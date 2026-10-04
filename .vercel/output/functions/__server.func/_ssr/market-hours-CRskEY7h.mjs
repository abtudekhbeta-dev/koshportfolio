//#region node_modules/.nitro/vite/services/ssr/assets/market-hours-CRskEY7h.js
/** IST cash session. Client-safe. */
var IST = 19800;
function isIstSession(now = Date.now()) {
	const d = new Date(now + IST * 1e3);
	const wd = d.getUTCDay();
	if (wd === 0 || wd === 6) return false;
	const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
	return mins >= 540 && mins <= 950;
}
function istClock(now = Date.now()) {
	const d = new Date(now + IST * 1e3);
	return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}
//#endregion
export { istClock as n, isIstSession as t };
