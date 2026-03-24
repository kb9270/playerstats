import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Loading /comparison...');
    await page.goto('http://localhost:5002/comparison', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: 'page_comparison.png' });
    console.log('Screenshot saved to page_comparison.png');
    
  } catch (err) {
    console.log('Failed:', err.message);
  } finally {
    await browser.close();
  }
})();
