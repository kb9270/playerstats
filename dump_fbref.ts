import puppeteer from "puppeteer";
import * as fs from "fs";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
  
  console.log("Loading page...");
  const response = await page.goto('https://fbref.com/en/comps/9/stats/Premier-League-Stats', { waitUntil: 'networkidle0', timeout: 60000 });
  console.log("Status:", response?.status());
  
  const html = await page.content();
  fs.writeFileSync("fbref_debug.html", html);
  console.log("Saved to fbref_debug.html");
  
  await browser.close();
})();
