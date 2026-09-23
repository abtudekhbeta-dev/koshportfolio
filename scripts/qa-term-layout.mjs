import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);
page.on("pageerror", (e) => {
  errors.push("PAGEERROR " + e.message);
  console.log("PAGEERROR", e.message);
});
page.on("console", (m) => {
  if (m.type() === "error") {
    errors.push("CON " + m.text());
    console.log("CON", m.text());
  }
});

await page.goto("http://127.0.0.1:8080/markets", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const desk = page.locator("[data-markets-desk]");
const watch = page.locator("[data-watch-pane]");
const intel = page.locator("[data-intel-panel]");
console.log("desk", await desk.count(), "watch", await watch.count(), "intel", await intel.count());
const boxes = await page.evaluate(() => {
  const d = document.querySelector("[data-markets-desk]");
  const w = document.querySelector("[data-watch-pane]");
  const i = document.querySelector("[data-intel-panel]");
  const c = document.querySelector("svg");
  const br = (el) => el ? (() => { const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top), l: Math.round(b.left) }; })() : null;
  return {
    desk: br(d),
    watch: br(w),
    intel: br(i),
    svg: br(c),
    text: (document.body.innerText || "").slice(0, 400),
    draw: [...document.querySelectorAll("button")].map(b => b.getAttribute("aria-label") || b.textContent).filter(x => /draw|trend|channel|select|crosshair|v-line|long|short|undo|delete/i.test(x || "")).slice(0, 24),
    list: document.querySelector("[data-watch-pane] select") ? document.querySelector("[data-watch-pane] select").innerText.slice(0, 200) : "no-select",
  };
});
console.log(JSON.stringify(boxes, null, 2));
await page.screenshot({ path: "/workspace/screenshots/qa-markets.png" });
if (await watch.count()) await watch.screenshot({ path: "/workspace/screenshots/qa-watch.png" }).catch(() => {});

await page.goto("http://127.0.0.1:8080/markets?view=overview", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
const ov = await page.evaluate(() => ({
  text: (document.body.innerText || "").slice(0, 500),
  viewAll: /View all holdings/i.test(document.body.innerText || ""),
}));
console.log("OVERVIEW", JSON.stringify(ov));
await page.screenshot({ path: "/workspace/screenshots/qa-overview.png" });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const home = await page.evaluate(() => ({
  log: /LOG/.test(document.body.innerText || ""),
  open: /Open Terminal/.test(document.body.innerText || ""),
  draw: /Draw/.test(document.body.innerText || ""),
}));
console.log("HOME", home);

await browser.close();
const loop = errors.filter((e) => /Maximum update depth|Too many re-renders|Minified React error/i.test(e));
console.log("ERROR_COUNT", errors.length, "LOOP_COUNT", loop.length);
if (loop.length) {
  console.error("FAIL loop", loop);
  process.exit(1);
}
if (!boxes.desk || !boxes.watch || boxes.watch.h < 400) {
  console.error("FAIL layout", boxes.desk, boxes.watch);
  process.exit(1);
}
console.log("OK");
