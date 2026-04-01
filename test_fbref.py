import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        page = await browser.new_page(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
        
        # Bypassing Webdriver fingerprints
        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        await page.goto('https://fbref.com/en/comps/9/stats/Premier-League-Stats', wait_until='domcontentloaded')
        
        # Give CF time to solve Turnstile
        for _ in range(10):
            title = await page.title()
            if "Just a moment" not in title and "Un instant" not in title:
                break
            await asyncio.sleep(2)

        print(await page.title())
        content = await page.content()
        print("Length:", len(content))
        if "stats_standard" in content:
            print("Table stat_standard is IN HTML!")
        else:
            print("Table missing from HTML.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
