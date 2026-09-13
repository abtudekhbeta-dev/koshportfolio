import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(90000);
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errs.push("console " + m.text());
});

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
const land = await page.locator("body").innerText();
assert(!/\bBooks\b/.test(land), "landing still says Books");
assert(/portfolio/i.test(land), "landing missing portfolio");
assert(!/Signed-in/i.test(land), "landing still says Signed-in");
assert(!/Open app/i.test(land), "landing still says Open app");
assert(/Open markets/i.test(land), "landing missing markets CTA");
assert(!/\bmix\b/i.test(land), "landing still says mix");
assert(/\bHome\b/.test(land), "landing missing Home");
assert(!/\bSpark\b/.test(land), "landing still says Spark");
await page.screenshot({ path: "/workspace/screenshots/landing.png", fullPage: false });

const themeBtn = page.getByRole("button", { name: /Switch to light mode/i });
await themeBtn.click();
await page.waitForTimeout(400);
const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
assert(theme === "light", "theme did not switch to light, got " + theme);
await page.screenshot({ path: "/workspace/screenshots/landing-light.png", fullPage: false });
await page.getByRole("button", { name: /Switch to dark mode/i }).click();
await page.waitForTimeout(200);

await page.goto("http://127.0.0.1:8080/s/RELIANCE", { waitUntil: "domcontentloaded" });
await page.locator('[data-testid="kosh-candle"]').waitFor({ timeout: 60000 });
const desk = page.locator("#desk");
await desk.scrollIntoViewIfNeeded();
const deskText = await desk.innerText();
assert(!/Sign in to run/i.test(deskText), "desk still gated");
assert(!/\bSpark\b/i.test(deskText), "desk still has Spark");
assert(/Fundamental analysis/i.test(deskText), "desk missing Fundamental analysis CTA");
assert(/Qualitative analysis/i.test(deskText), "desk missing Qualitative analysis CTA");
assert(/Is the company sound/i.test(deskText), "fund CTA not standing out");
assert(/multi-bagger/i.test(deskText), "qual CTA missing multi-bagger");
assert(!/Connecting both skills/i.test(deskText), "combine should be a button, not auto");
await page.screenshot({ path: "/workspace/screenshots/stock-desk.png", fullPage: false });

await page.getByRole("tab", { name: "Business" }).click();
const biz = page.locator("#business");
await biz.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const bizText = await biz.innerText();
assert(/How it makes money/i.test(bizText), "business missing how it makes money: " + bizText.slice(0, 200));
assert(/Jio|petro|Energy/i.test(bizText), "business card not the Reliance one: " + bizText.slice(0, 240));
await page.screenshot({ path: "/workspace/screenshots/stock-business.png", fullPage: false });

await page.getByRole("tab", { name: "Financials" }).click();
await page.waitForTimeout(300);
const fin = page.locator("#snapshot");
await fin.scrollIntoViewIfNeeded();
const finText = await fin.innerText();
assert(/Ownership|Promoters/i.test(finText), "financials missing ownership: " + finText.slice(0, 240));
assert(/Shareholding|Net worth|Sales/i.test(finText), "financials missing tables: " + finText.slice(0, 240));
const deskAfter = await page.locator("#desk").innerText();
assert(/Expand|Fundamental/i.test(deskAfter), "desk should collapse after tab click");
await page.screenshot({ path: "/workspace/screenshots/stock-fund.png", fullPage: false });

await page.getByRole("tab", { name: "Chart" }).click();
await page.locator("#tape").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "5m", exact: true }).click();
await page.waitForTimeout(3500);
const candle = page.locator('[data-testid="kosh-candle"]');
const pts = await candle.getAttribute("data-points");
console.log("INTRADAY_POINTS", pts);

await page.getByRole("button", { name: "H-line" }).click();
const box = await page.locator(".kosh-candle").boundingBox();
assert(box, "no candle box");
await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.4);
await page.waitForTimeout(400);
const parentTxt = await page.locator(".kosh-candle").evaluate((el) => el.parentElement?.innerText || "");
console.log("DRAWING_FOOTER", parentTxt.slice(-200));
assert(/drawing/i.test(parentTxt), "hline did not save");
assert(/Selected/i.test(parentTxt), "drawing was not selectable");
await page.getByRole("button", { name: "Pan", exact: true }).click();
await page.screenshot({ path: "/workspace/screenshots/stock-draw.png", fullPage: false });

await page.getByRole("button", { name: "1D", exact: true }).first().click();
await page.waitForTimeout(4500);
const tape = page.locator("#tape");
assert(await tape.getByText("Timeframe", { exact: true }).count(), "Timeframe label missing");
assert(!(await tape.getByText("Horizon", { exact: true }).count()), "Horizon should be gone");
await page.screenshot({ path: "/workspace/screenshots/stock-candle.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/screen", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Screen" }).waitFor();
await page.getByRole("button", { name: "Promoters" }).waitFor({ timeout: 60000 });
const screenTxt = await page.locator("body").innerText();
assert(/Build your own/i.test(screenTxt), "custom builder missing");
assert(/Attach screenshot/i.test(screenTxt), "screenshot attach missing");
assert(/Promoters/i.test(screenTxt), "screen missing Promoters column");
assert(/Nifty 500/i.test(screenTxt), "screen missing Nifty 500 coverage");
assert(!/Open Analysis/i.test(screenTxt), "screen still has Open Analysis");
assert(!/Add any NSE or BSE name/i.test(screenTxt), "screen still has add-any-name");
assert(!/Both skills/i.test(screenTxt), "screen still says Both skills");
assert(!/Pass both skills/i.test(screenTxt), "screen still has both-skills card");
await page.screenshot({ path: "/workspace/screenshots/screen.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/markets", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Markets" }).waitFor();
await page.getByText("₹/10g").first().waitFor({ timeout: 30000 });
const mtxt = await page.locator("body").innerText();
assert(/Portfolios/.test(mtxt), "nav missing Portfolios");
assert(!/\bAnalysis\b/.test(mtxt), "nav still has Analysis");
assert(/\bWatch\b/.test(mtxt), "nav missing Watch");
assert(!/Open app/i.test(mtxt), "app chrome still says Open app");
assert(!/Sign in to run Pulse/i.test(mtxt), "pulse still gated");
assert(/Run Pulse/i.test(mtxt), "Run Pulse missing");
assert(/\bTrade\b/.test(mtxt), "nav missing Trade");
assert(/FII|DII|Your market/i.test(mtxt), "markets missing FII/DII or temperature");
assert(/₹\/10g/.test(mtxt), "markets missing gold MCX unit ₹/10g");
assert(/₹\/kg/.test(mtxt), "markets missing silver MCX unit ₹/kg");
assert(!/Rate the company, then the business/i.test(mtxt), "Analysis feature card still on markets");
assert((await page.getByRole("button", { name: "More" }).count()) === 0, "More menu should be gone");
await page.screenshot({ path: "/workspace/screenshots/markets.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/trade", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Trade" }).waitFor();
const tradeTxt = await page.locator("body").innerText();
assert(/Breakout|NR7|Gap up/i.test(tradeTxt), "trade missing setups");
assert(/Structure/i.test(tradeTxt), "trade missing structure");
assert(!/\bmix\b/i.test(tradeTxt), "trade still says mix");
const tradeH1Box = await page.getByRole("heading", { name: "Trade" }).boundingBox();
const tradeChartBox = await page.locator('[data-testid="kosh-candle"]').boundingBox();
assert(tradeH1Box && tradeChartBox, "trade chart missing");
assert(tradeChartBox.y > tradeH1Box.y, "trade chart should sit below the heading");
const setupsY = await page.getByRole("heading", { name: "Setups" }).boundingBox();
assert(setupsY && setupsY.y > tradeChartBox.y, "setups should sit below the chart");
await page.screenshot({ path: "/workspace/screenshots/trade.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/picks", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
assert(page.url().includes("/screen"), "picks should redirect to screen, got " + page.url());

await page.goto("http://127.0.0.1:8080/watch", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Watch" }).waitFor();
const watchTxt = await page.locator("body").innerText();
assert(/Morning board|RSI|52-week/i.test(watchTxt), "watch missing morning board");
assert(/New list|Long-term|Trade/i.test(watchTxt), "watch missing multiple lists");
await page.screenshot({ path: "/workspace/screenshots/watch.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/app", { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "Portfolios" }).waitFor();
const appTxt = await page.locator("body").innerText();
assert(!/\bBooks\b/.test(appTxt), "app still says Books");
await page.screenshot({ path: "/workspace/screenshots/app-home.png", fullPage: false });
await page.locator("a[href^='/p/']").first().click();
await page.getByRole("heading", { name: /Market cap/i }).waitFor({ timeout: 25000 });
const ov = await page.locator("body").innerText();
assert(/Largest holdings/i.test(ov), "holdings desk missing: " + ov.slice(0, 400));
assert(/Overnight|Disposition/i.test(ov), "overview missing overnight/disposition");
assert(/Large/i.test(ov) && /Mid/i.test(ov) && /Small/i.test(ov) && /Micro/i.test(ov), "overview missing cap buckets");
await page.screenshot({ path: "/workspace/screenshots/overview.png", fullPage: true });
await page.getByRole("link", { name: "Risk", exact: true }).click();
await page.waitForTimeout(1500);
const riskTxt = await page.locator("body").innerText();
assert(/Improve the scores/i.test(riskTxt), "risk missing levers: " + riskTxt.slice(0, 300));
await page.screenshot({ path: "/workspace/screenshots/risk.png", fullPage: false });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
mobile.setDefaultTimeout(40000);
await mobile.goto("http://127.0.0.1:8080/markets", { waitUntil: "domcontentloaded" });
await mobile.getByRole("heading", { name: "Markets" }).waitFor();
const dismiss = mobile.getByRole("button", { name: "Dismiss" });
if (await dismiss.count()) await dismiss.click();
await mobile.getByLabel("Add holdings").click();
await mobile.waitForTimeout(400);
const sheet = mobile.locator(".kosh-dialog");
await sheet.waitFor();
const sheetBox = await sheet.boundingBox();
assert(sheetBox, "mobile add sheet missing");
assert(sheetBox.y > 80, "mobile add should be a bottom sheet, not centered");
assert(await sheet.getByText(/Drop a holdings export/i).count(), "excel drop missing on mobile");
await mobile.screenshot({ path: "/workspace/screenshots/add-dialog.png", fullPage: false });
await mobile.close();

console.log("FEATURE_OK", { theme, pts, deskGated: /Sign in to run/.test(deskText), errs: errs.slice(0, 8) });
if (errs.length) console.log("ERRS", errs.slice(0, 10));
await browser.close();
