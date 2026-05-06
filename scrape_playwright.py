import asyncio
from playwright.async_api import async_playwright
import pandas as pd
from io import StringIO
import random
import os

OUTPUT_FILE = "players_data_2025_2026.csv"
BACKUP_FILE = "players_data_2025_2026_backup.csv"

LEAGUES = {
    "Premier League": {
        "stats": "https://fbref.com/en/comps/9/stats/Premier-League-Stats",
        "shooting": "https://fbref.com/en/comps/9/shooting/Premier-League-Stats",
        "passing": "https://fbref.com/en/comps/9/passing/Premier-League-Stats",
        "possession": "https://fbref.com/en/comps/9/possession/Premier-League-Stats",
        "defense": "https://fbref.com/en/comps/9/defense/Premier-League-Stats",
    },
    "La Liga": {
        "stats": "https://fbref.com/en/comps/12/stats/La-Liga-Stats",
        "shooting": "https://fbref.com/en/comps/12/shooting/La-Liga-Stats",
        "passing": "https://fbref.com/en/comps/12/passing/La-Liga-Stats",
        "possession": "https://fbref.com/en/comps/12/possession/La-Liga-Stats",
        "defense": "https://fbref.com/en/comps/12/defense/La-Liga-Stats",
    },
    "Bundesliga": {
        "stats": "https://fbref.com/en/comps/20/stats/Bundesliga-Stats",
        "shooting": "https://fbref.com/en/comps/20/shooting/Bundesliga-Stats",
        "passing": "https://fbref.com/en/comps/20/passing/Bundesliga-Stats",
        "possession": "https://fbref.com/en/comps/20/possession/Bundesliga-Stats",
        "defense": "https://fbref.com/en/comps/20/defense/Bundesliga-Stats",
    },
    "Serie A": {
        "stats": "https://fbref.com/en/comps/11/stats/Serie-A-Stats",
        "shooting": "https://fbref.com/en/comps/11/shooting/Serie-A-Stats",
        "passing": "https://fbref.com/en/comps/11/passing/Serie-A-Stats",
        "possession": "https://fbref.com/en/comps/11/possession/Serie-A-Stats",
        "defense": "https://fbref.com/en/comps/11/defense/Serie-A-Stats",
    },
    "Ligue 1": {
        "stats": "https://fbref.com/en/comps/13/stats/Ligue-1-Stats",
        "shooting": "https://fbref.com/en/comps/13/shooting/Ligue-1-Stats",
        "passing": "https://fbref.com/en/comps/13/passing/Ligue-1-Stats",
        "possession": "https://fbref.com/en/comps/13/possession/Ligue-1-Stats",
        "defense": "https://fbref.com/en/comps/13/defense/Ligue-1-Stats",
    }
}

async def scrape_table_with_page(page, url, page_type="stats"):
    """
    Scrape en réutilisant LA MÊME PAGE (garde les cookies Cloudflare intacts)
    """
    try:
        print(f"  📥 Accès à : {url}")
        await page.goto(url, wait_until="networkidle", timeout=60000)
        
        selector = f'table[id^="stats_{page_type}"]'
        try:
            await page.wait_for_selector(selector, timeout=30000)
        except Exception:
            await page.wait_for_selector('table', timeout=30000)
        
        await page.mouse.wheel(0, 1000)
        await page.wait_for_timeout(3000)

        content = await page.content()
        tables = pd.read_html(StringIO(content))
        
        for df in tables:
            if len(df) > 10: 
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = [col[1] if col[1] and not col[1].startswith('Unnamed') else col[0] for col in df.columns]
                
                if len(df.columns) > 1:
                    df = df[df.iloc[:, 0] != df.columns[0]].copy()
                    df = df.dropna(subset=[df.columns[1]])
                
                print(f"     ✅ {len(df)} lignes récupérées")
                return df
                
        print("     ⚠ Aucun tableau valide trouvé.")
                
    except Exception as e:
        print(f"     ✗ Erreur détaillée: {e}")
    
    return None

def normalize_key(player, squad):
    p = str(player).lower().strip()
    s = str(squad).lower().strip()
    return f"{p}_{s}"

async def main():
    print("============================================================")
    print("  🚀 PlayerStats — Scraping FBref (1 seul navigateur)")
    print("============================================================")
    
    if os.path.exists(OUTPUT_FILE):
        import shutil
        shutil.copy2(OUTPUT_FILE, BACKUP_FILE)

    all_data = []

    async with async_playwright() as p:
        # ON LANCE LE NAVIGATEUR UNE SEULE FOIS ICI
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        # Visite d'initialisation pour passer le Cloudflare une bonne fois pour toutes
        print("\n🌐 Initialisation de la session (passe le Captcha une seule fois si demandé)...")
        await page.goto("https://fbref.com/en/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(5000)

        for league, urls in LEAGUES.items():
            print(f"\n🏆 {league}")
            
            df_std = await scrape_table_with_page(page, urls["stats"], "standard")
            if df_std is None or df_std.empty:
                print(f"  ✗ Impossible de lire {league}, on passe.")
                continue
                
            df_std["League"] = league
            
            col_player = [c for c in df_std.columns if 'player' in str(c).lower()][0]
            col_squad = [c for c in df_std.columns if 'squad' in str(c).lower()][0]
            df_std["_key"] = df_std.apply(lambda r: normalize_key(r[col_player], r[col_squad]), axis=1)
            
            merged = df_std.copy()
            
            for stat_type in ["shooting", "passing", "possession", "defense"]:
                import time
                pause = random.randint(3, 7)
                print(f"   ⏳ Attente anti-bot : {pause}s...")
                time.sleep(pause)
                
                df_extra = await scrape_table_with_page(page, urls[stat_type], stat_type)
                
                if df_extra is not None and not df_extra.empty:
                    try:
                        p_col = [c for c in df_extra.columns if 'player' in str(c).lower()][0]
                        s_col = [c for c in df_extra.columns if 'squad' in str(c).lower()][0]
                        df_extra["_key"] = df_extra.apply(lambda r: normalize_key(r[p_col], r[s_col]), axis=1)
                        
                        base_cols = ["Player", "Nation", "Pos", "Squad", "Comp", "Age", "Born", "90s", "_key"]
                        extra_cols = [c for c in df_extra.columns if c not in base_cols and str(c).lower() not in [b.lower() for b in base_cols]]
                        
                        df_extra_slim = df_extra[["_key"] + extra_cols].copy()
                        merged = merged.merge(df_extra_slim, on="_key", how="left", suffixes=("", f"_{stat_type}"))
                    except Exception as e:
                        pass
            
            merged = merged.drop(columns=["_key"], errors="ignore")
            all_data.append(merged)
            
            pause_ligue = random.randint(8, 15)
            print(f"\n⏳ Pause inter-ligue : {pause_ligue}s...")
            await page.wait_for_timeout(pause_ligue * 1000)

        await browser.close()

    if all_data:
        print("\n📊 Fusion de toutes les ligues...")
        final_df = pd.concat(all_data, ignore_index=True)
        final_df = final_df.rename(columns=lambda x: str(x).strip())
        final_df.to_csv(OUTPUT_FILE, index=False)
        print(f"\n✅ Terminé ! {len(final_df)} joueurs sauvegardés dans {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
