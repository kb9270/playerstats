import os
import re
import pandas as pd
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup, Comment
import csv

# Charger les clés API depuis le .env
load_dotenv()

CSV_FILE = "players_data_2025_2026.csv"
SCRAPNINJA_API_KEY = os.getenv("SCRAPNINJA_API_KEY", "")
SCRAPNINJA_API_KEY_2 = os.getenv("SCRAPNINJA_API_KEY_2", "")
SCRAPNINJA_API_KEY_3 = os.getenv("SCRAPNINJA_API_KEY_3", "")

API_KEYS = [k for k in [SCRAPNINJA_API_KEY, SCRAPNINJA_API_KEY_2, SCRAPNINJA_API_KEY_3] if k and len(k) > 10]
BIG5_URL = "https://fbref.com/en/comps/Big5/stats/players/Big-5-European-Leagues-Stats"

def fetch_html_scrapninja(target_url):
    if not API_KEYS:
        print("❌ Aucune clé API ScrapeNinja trouvée dans .env")
        return None

    api_url = "https://scrapeninja.apiroad.net/v2/scrape-js"
    payload = {
        "url": target_url,
        "method": "GET",
        "retryNum": 2,
        "geo": "fr",
        "waitSelector": "#stats_standard",
        "timeout": 40
    }
    
    for current_key in API_KEYS:
        headers = {
            "content-type": "application/json",
            "x-apiroad-key": current_key
        }
        try:
            print(f"📡 Appel via ScrapNinja...")
            response = requests.post(api_url, json=payload, headers=headers, timeout=60)
            if response.status_code in [401, 403, 429]:
                continue
            response.raise_for_status()
            return response.json().get("body", "")
        except Exception as e:
            print(f"✗ Erreur : {e}")
    return None

def extract_ids_from_html(html):
    if not html: return {}
    
    soup = BeautifulSoup(html, 'html.parser')
    id_map = {}
    
    def process_soup(target_soup):
        rows = target_soup.find_all("tr")
        for row in rows:
            player_cell = row.find("td", {"data-stat": "player"})
            if player_cell:
                a_tag = player_cell.find("a")
                if a_tag and a_tag.has_attr("href"):
                    match = re.search(r'/players/([a-zA-Z0-9]+)/', a_tag["href"])
                    if match:
                        name = player_cell.get_text(strip=True).lower()
                        id_map[name] = match.group(1)

    # 1. Parse directly
    process_soup(soup)
    
    # 2. Parse from comments (FBref hides tables)
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    for comment in comments:
        if "<table" in comment and "stats_standard" in comment:
            process_soup(BeautifulSoup(str(comment), 'html.parser'))
            
    return id_map

def patch_csv(id_map):
    if not os.path.exists(CSV_FILE):
        print(f"❌ Le fichier {CSV_FILE} n'existe pas.")
        return

    print("💾 Patch de la base de données CSV en cours...")
    
    df = pd.read_csv(CSV_FILE, dtype=str)
    
    # Identifier la colonne Player
    player_col = "Player" if "Player" in df.columns else "player"
    if player_col not in df.columns:
        print("❌ Colonne Joueur introuvable !")
        return

    if "fbref_id" not in df.columns:
        df["fbref_id"] = ""

    patched_count = 0
    for idx, row in df.iterrows():
        p_name = str(row[player_col]).strip().lower()
        if p_name in id_map:
            # Ne mettre à jour que si c'est vide ou nouveau
            if pd.isna(row["fbref_id"]) or row["fbref_id"] == "":
                df.at[idx, "fbref_id"] = id_map[p_name]
                patched_count += 1
            elif df.at[idx, "fbref_id"] != id_map[p_name]:
                df.at[idx, "fbref_id"] = id_map[p_name]
                patched_count += 1

    df.to_csv(CSV_FILE, index=False)
    print(f"🎉 Succès ! {patched_count} joueurs mis à jour avec leur FBref ID !")

def main():
    print("🚀 Extraction des FBref IDs via ScrapNinja (1 requête)...")
    html = fetch_html_scrapninja(BIG5_URL)
    if not html:
        print("❌ Échec de la récupération de la page.")
        return
        
    print("🔎 Analyse HTML...")
    id_map = extract_ids_from_html(html)
    print(f"   ✅ Trouvé {len(id_map)} joueurs avec ID sur FBref.")
    
    patch_csv(id_map)

if __name__ == "__main__":
    main()
