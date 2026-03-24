import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:5002/comparison', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Check if vite error overlay exists
    const errorHTML = await page.evaluate(() => {
      const viteOverlay = document.querySelector('vite-error-overlay');
      if (viteOverlay) return viteOverlay.shadowRoot?.innerHTML || viteOverlay.innerHTML;
      
      const reactError = document.querySelector('.replit-dev-banner-container ~ *');
      return document.body.innerHTML;
    });

    console.log('HTML DUMP:');
    console.log(errorHTML.substring(0, 3000));
    
  } catch (err) {
    console.log('Failed:', err.message);
  } finally {
    await browser.close();
  }
})();
