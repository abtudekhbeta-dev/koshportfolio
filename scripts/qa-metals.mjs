import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--disable-dev-shm-usage", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(60000);

await page.goto("http://127.0.0.1:8080/app", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.removeItem("kosh-v2"));
await page.reload({ waitUntil: "domcontentloaded" });
await page.getByRole("link", { name: /Sample/i }).first().click();
await page.locator('[data-testid="kosh-nav"]').waitFor({ timeout: 90000 });

await page.getByRole("button", { name: "Add holdings" }).click();
await page.getByRole("button", { name: "Gold & silver", exact: true }).click();
await page.locator('[data-testid="metal-qty"]').waitFor({ timeout: 10000 });
await page.screenshot({ path: "/workspace/screenshots/add-metals.png" });

await page.locator('[data-testid="metal-qty"]').fill("10");
await page.locator('input[type="date"]').fill("2024-01-15");
await page.waitForTimeout(2500);
await page.screenshot({ path: "/workspace/screenshots/add-metals-filled.png" });

const body = await page.locator('[role="dialog"]').innerText();
console.log("DIALOG", body.slice(0, 800));
await page.getByRole("button", { name: /Add Gold/ }).click();
await page.waitForTimeout(6000);

await page.screenshot({ path: "/workspace/screenshots/after-gold-add.png", fullPage: false });
const mixBtn = page.getByRole("button", { name: "With gold & silver", exact: true });
console.log("CHART_METALS_TOGGLE", await mixBtn.count());

await page.getByRole("button", { name: "Equity only", exact: true }).click();
await page.waitForTimeout(2000);
await page.locator('[data-testid="kosh-nav"]').screenshot({ path: "/workspace/screenshots/chart-equity-only.png" });
await mixBtn.click();
await page.waitForTimeout(2000);
await page.locator('[data-testid="kosh-nav"]').screenshot({ path: "/workspace/screenshots/chart-with-metals.png" });

await page.goto("http://127.0.0.1:8080/icons", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/icons-page.png", fullPage: true });
console.log("ICON_TILES", await page.locator("img[alt]").count());

await browser.close();
console.log("OK");
