import asyncio
import json
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Avoid webdriver flag
        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Test team search matching Real Madrid
        await page.goto("https://www.sofascore.com/api/v1/search/all?q=Real%20Madrid", wait_until="domcontentloaded")
        
        # CF Wait bypass
        for _ in range(10):
            t = await page.title()
            if "Just a moment" not in t and "Un instant" not in t:
                break
            await asyncio.sleep(2)
            
        data = json.loads(await page.inner_text("body"))
        team = next((r.get("entity") for r in data.get("results", []) if r.get("type") == "team"), None)
        print("Team Found:", team)
        
        if team:
            # test team players API
            team_id = team.get("id")
            await page.goto(f"https://www.sofascore.com/api/v1/team/{team_id}/players", wait_until="domcontentloaded")
            players_data = json.loads(await page.inner_text("body"))
            players = players_data.get("players", [])
            print(f"Number of players found: {len(players)}")
            print("First few players:", [p.get("player", {}).get("name") for p in players[:5]])
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
