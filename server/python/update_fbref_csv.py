import asyncio
import pandas as pd
import random
import time
from tqdm import tqdm
from playwright.async_api import async_playwright
import os

# Configuration des URLs (Standard Stats)
LEAGUES = {
    "Premier League": "https://fbref.com/en/comps/9/stats/Premier-League-Stats",
    "La Liga": "https://fbref.com/en/comps/12/stats/La-Liga-Stats",
    "Bundesliga": "https://fbref.com/en/comps/20/stats/Bundesliga-Stats",
    "Serie A": "https://fbref.com/en/comps/11/stats/Serie-A-Stats",
    "Ligue 1": "https://fbref.com/en/comps/13/stats/Ligue-1-Stats"
}

OUTPUT_FILE = "players_data_2025_2026.csv"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

async def scrape_league(browser, name, url):
    page = await browser.new_page(user_agent=USER_AGENT)
    try:
        print(f"\n[Scraping] {name}...")
        await page.goto(url, wait_until="networkidle", timeout=60000)
        
        # Attendre que le tableau soit chargé
        await page.wait_for_selector("table[id^='stats_standard']", timeout=30000)
        
        # Récupérer le contenu HTML
        content = await page.content()
        
        # Extraire avec Pandas
        dfs = pd.read_html(content)
        # FBref a souvent plusieurs tableaux, on cherche celui qui contient 'Player'
        df = None
        for temp_df in dfs:
            if 'Player' in temp_df.columns.get_level_values(0) or any('Player' in str(c) for c in temp_df.columns):
                df = temp_df
                break
        
        if df is None:
            raise Exception("Tableau introuvable")

        # Nettoyage des MultiIndex si présents
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [f"{col[1]}" if "Unnamed" in col[0] else col[1] for col in df.columns]

        # Supprimer les lignes de sous-entêtes (FBref répète les headers tous les 25 joueurs)
        df = df[df['Player'] != 'Player']
        
        # Ajouter la colonne Ligue pour info (optionnel)
        df['League'] = name
        
        return df

    finally:
        await page.close()

async def main():
    all_data = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        pbar = tqdm(LEAGUES.items(), desc="Mise à jour FBref")
        for name, url in pbar:
            try:
                df = await scrape_league(browser, name, url)
                all_data.append(df)
                
                # Furtivité : Pause entre les ligues
                wait_time = random.uniform(15, 25)
                pbar.set_description(f"Attente {wait_time:.1f}s...")
                await asyncio.sleep(wait_time)
                
            except Exception as e:
                print(f"\n[Erreur] {name}: {str(e)}")
        
        await browser.close()

    if all_data:
        final_df = pd.concat(all_data, ignore_index=True)
        
        # Nettoyage et alignement des colonnes (basique)
        # On garde les colonnes numériques et textuelles standards
        # Note: FBref peut changer légèrement les noms, on s'assure de l'ordre
        
        print(f"\n[Terminé] {len(final_df)} joueurs récupérés.")
        
        # Sauvegarde (Écrase l'ancien)
        final_df.to_csv(OUTPUT_FILE, index=False)
        print(f"Fichier {OUTPUT_FILE} mis à jour avec succès.")
    else:
        print("\nAucune donnée n'a pu être récupérée.")

if __name__ == "__main__":
    asyncio.run(main())
