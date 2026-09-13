import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(90000);

await page.goto("http://127.0.0.1:8080/s/RELIANCE", { waitUntil: "domcontentloaded" });
const candle = page.locator('[data-testid="kosh-candle"]');
await candle.waitFor({ timeout: 60000 });
const info = await candle.evaluate((el) => {
  const box = el.getBoundingClientRect();
  const rects = el.querySelectorAll("rect").length;
  const paths = el.querySelectorAll("path").length;
  return { w: box.width, h: box.height, rects, paths, points: el.getAttribute("data-points") };
});
console.log("CANDLE", JSON.stringify(info));
await page.screenshot({ path: "/workspace/screenshots/stock-reliance.png", fullPage: false });
await page.locator(".kosh-candle").screenshot({ path: "/workspace/screenshots/stock-candle.png" });
console.log("H1", await page.locator("h1").innerText());

await page.goto("http://127.0.0.1:8080/markets", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Markets" }).waitFor();
await page.waitForTimeout(2500);
await page.screenshot({ path: "/workspace/screenshots/markets.png", fullPage: false });
await page.screenshot({ path: "/workspace/screenshots/markets-full.png", fullPage: true });

await page.getByRole("button", { name: /Search stocks/i }).click();
await page.keyboard.type("TCS");
await page.waitForTimeout(900);
await page.screenshot({ path: "/workspace/screenshots/search.png", fullPage: false });
const item = page.locator("[cmdk-item]").first();
await item.waitFor({ state: "visible", timeout: 8000 });
const box = await item.boundingBox();
console.log("SEARCH_ITEM", JSON.stringify(box));
if (box && box.y > 0 && box.y < 800) {
  await item.click({ force: true });
  await page.waitForTimeout(2000);
  console.log("AFTER_SEARCH", page.url());
  await page.screenshot({ path: "/workspace/screenshots/search-tcs.png", fullPage: false });
} else {
  console.error("SEARCH_OFFSCREEN", box);
  process.exit(1);
}

if (info.h < 200 || info.w < 300 || Number(info.points || 0) < 5) {
  console.error("CANDLE_FAIL", info);
  process.exit(1);
}
console.log("OK");
await browser.close();
