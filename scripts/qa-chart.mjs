import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--disable-dev-shm-usage", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(120000);

await page.goto("http://127.0.0.1:8080/app", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.removeItem("kosh-v2"));
await page.reload({ waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: /Sample/i }).first().click();

const plot = page.locator('[data-testid="kosh-nav"]');
await plot.waitFor({ timeout: 90000 });
await page.waitForTimeout(800);

const info = await plot.evaluate((el) => {
  const img = el.querySelector('[data-testid="kosh-nav-img"]');
  const src = img?.getAttribute("src") || "";
  const box = el.getBoundingClientRect();
  return {
    points: el.getAttribute("data-points"),
    dlen: el.getAttribute("data-dlen"),
    w: Math.round(box.width),
    h: Math.round(box.height),
    imgW: img ? img.getBoundingClientRect().width : 0,
    imgH: img ? img.getBoundingClientRect().height : 0,
    srcKind: src.startsWith("data:image/svg+xml") ? "svg-data" : src.slice(0, 24),
    srcLen: src.length,
    hasHash: src.includes("%237aa2ff") || src.includes("#7aa2ff"),
  };
});
console.log("PLOT", JSON.stringify(info));
await page.screenshot({ path: "/workspace/screenshots/chart-sample.png", fullPage: false });
await plot.screenshot({ path: "/workspace/screenshots/chart-plot.png" });

await page.getByRole("button", { name: /^5Y$/ }).click();
await page.waitForTimeout(200);
await plot.screenshot({ path: "/workspace/screenshots/chart-5y.png" });

await page.getByRole("button", { name: /^Rupees$/ }).click();
await page.waitForTimeout(200);
await plot.screenshot({ path: "/workspace/screenshots/chart-rupees.png" });

await page.getByRole("button", { name: /^Drawdown$/ }).click();
await page.waitForTimeout(200);
await plot.screenshot({ path: "/workspace/screenshots/chart-drawdown.png" });

await page.goto("http://127.0.0.1:8080/icons", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
await page.screenshot({ path: "/workspace/screenshots/icons-page.png", fullPage: true });

const ok =
  info.srcKind === "svg-data" &&
  info.srcLen > 400 &&
  info.h >= 280 &&
  info.w >= 300 &&
  info.imgH >= 280 &&
  Number(info.points) >= 20 &&
  info.hasHash &&
  Number(info.dlen) > 40;
if (!ok) {
  console.error("CHART_FAIL", info);
  process.exit(1);
}
console.log("OK");
await browser.close();
