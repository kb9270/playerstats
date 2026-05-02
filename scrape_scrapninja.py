import os
import time
import datetime
import pandas as pd
import requests
from io import StringIO
from dotenv import load_dotenv
from bs4 import BeautifulSoup, Comment

# Charger les clés API depuis le .env
load_dotenv()

OUTPUT_FILE = "players_data_2025_2026.csv"
BACKUP_FILE = "players_data_2025_2026_backup.csv"

# Gestion des clés ScrapNinja (Rotation)
SCRAPNINJA_API_KEY = os.getenv("SCRAPNINJA_API_KEY", "")
SCRAPNINJA_API_KEY_2 = os.getenv("SCRAPNINJA_API_KEY_2", "")
SCRAPNINJA_API_KEY_3 = os.getenv("SCRAPNINJA_API_KEY_3", "")

API_KEYS = [k for k in [SCRAPNINJA_API_KEY, SCRAPNINJA_API_KEY_2, SCRAPNINJA_API_KEY_3] if k and len(k) > 10]
CURRENT_KEY_INDEX = 0

# URLs combinées "Big 5" pour économiser les jetons
LEAGUES_BIG5 = {
    "stats": "https://fbref.com/en/comps/Big5/stats/players/Big-5-European-Leagues-Stats",
    "shooting": "https://fbref.com/en/comps/Big5/shooting/players/Big-5-European-Leagues-Stats",
    "passing": "https://fbref.com/en/comps/Big5/passing/players/Big-5-European-Leagues-Stats",
    "possession": "https://fbref.com/en/comps/Big5/possession/players/Big-5-European-Leagues-Stats",
    "defense": "https://fbref.com/en/comps/Big5/defense/players/Big-5-European-Leagues-Stats",
}

def fetch_html_scrapninja(target_url):
    """
    Utilise la configuration suggérée par l'utilisateur (render: True, geo: fr).
    """
    global CURRENT_KEY_INDEX
    if not API_KEYS:
        print("❌ Aucune clé API ScrapeNinja trouvée dans .env")
        return None

    # L'URL suggérée par l'utilisateur (on garde apiroad par sécurité si scrapninja.net ne répond pas)
    # mais on utilise le payload exact demandé.
    api_url = "https://scrapeninja.apiroad.net/v2/scrape-js"
    
    payload = {
        "url": target_url,
        "method": "GET",
        "retryNum": 2,
        "geo": "fr",
        "waitSelector": "#stats_standard", # Attendre le tableau
        "timeout": 40
    }
    
    for attempt in range(len(API_KEYS)):
        current_key = API_KEYS[CURRENT_KEY_INDEX]
        headers = {
            "content-type": "application/json",
            "x-apiroad-key": current_key
        }
        
        try:
            print(f"     📡 Appel via Clé {CURRENT_KEY_INDEX + 1} (JS Render)...")
            response = requests.post(api_url, json=payload, headers=headers, timeout=60)
            
            if response.status_code in [401, 403, 429]:
                print(f"     ⚠ Clé {CURRENT_KEY_INDEX + 1} épuisée ou invalide ({response.status_code}).")
                CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(API_KEYS)
                continue
                
            response.raise_for_status()
            data = response.json()
            return data.get("body", "")
            
        except Exception as e:
            print(f"     ✗ Erreur : {e}")
            CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(API_KEYS)
            
    return None

def parse_fbref_html(html, stat_type):
    """
    Extrait les tableaux FBref, même s'ils sont cachés dans les commentaires.
    """
    if not html: return None
    
    # Mapping des IDs de tableaux FBref
    id_map = {
        "stats": "stats_standard",
        "shooting": "stats_shooting",
        "passing": "stats_passing",
        "possession": "stats_possession",
        "defense": "stats_defense"
    }
    target_id = id_map.get(stat_type, "stats_standard")

    # 1. Tenter la lecture directe
    try:
        tables = pd.read_html(StringIO(html))
        for df in tables:
            # Vérifier si c'est le bon tableau via les colonnes ou l'index
            if len(df) > 50:
                return df
    except:
        pass
        
    # 2. Chercher dans les commentaires (FBref cache souvent les stats avancées)
    soup = BeautifulSoup(html, 'html.parser')
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    
    for comment in comments:
        if "<table" in comment and target_id in comment:
            try:
                table_df = pd.read_html(StringIO(str(comment)))[0]
                if len(table_df) > 50:
                    return table_df
            except:
                continue
                
    return None

def clean_fbref_df(df):
    """Nettoie le DataFrame multi-colonnes de FBref."""
    if df is None: return None
    
    # Gérer les colonnes multi-index
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = ['_'.join(col).strip() if 'Unnamed' not in col[0] else col[1] for col in df.columns.values]
    
    # Supprimer les lignes de sous-entête répétées
    col_player = [c for c in df.columns if 'player' in str(c).lower()][0]
    df = df[df[col_player] != 'Player'].copy()
    
    # Normalisation du club
    col_squad = [c for c in df.columns if 'squad' in str(c).lower()][0]
    df['nom_club'] = df[col_squad].str.normalize('NFKD').encode('ascii', errors='ignore').decode('utf-8').lower()
    
    return df

def main():
    print("============================================================")
    print("  🚀 PlayerStats — Veille Quotidienne Big 5 (Optimisée)")
    print("============================================================")
    
    if os.path.exists(OUTPUT_FILE):
        pd.read_csv(OUTPUT_FILE).to_csv(BACKUP_FILE, index=False)
        print(f"💾 Backup créé : {BACKUP_FILE}")

    final_df = None
    
    for stat_type, url in LEAGUES_BIG5.items():
        print(f"\n📊 Extraction : {stat_type.upper()}")
        html = fetch_html_scrapninja(url)
        
        if not html:
            continue
            
        df = parse_fbref_html(html, stat_type)
        if df is None:
            print(f"     ✗ Aucun tableau trouvé pour {stat_type}")
            continue
            
        df = clean_fbref_df(df)
        print(f"     ✅ {len(df)} joueurs trouvés.")

        if final_df is None:
            final_df = df
        else:
            col_player = [c for c in df.columns if 'player' in str(c).lower()][0]
            cols_to_use = [c for c in df.columns if c not in final_df.columns or c in [col_player, 'nom_club']]
            final_df = pd.merge(final_df, df[cols_to_use], on=[col_player, 'nom_club'], how='left', suffixes=('', '_dup'))
            final_df = final_df.loc[:, ~final_df.columns.str.endswith('_dup')]

    if final_df is not None:
        # Extraire la ligue proprement
        if 'Comp' in final_df.columns:
             final_df['League'] = final_df['Comp'].apply(lambda x: str(x).split(" ", 1)[1] if len(str(x).split(" ", 1)) > 1 else x)
        
        final_df.to_csv(OUTPUT_FILE, index=False)
        print("\n============================================================")
        print(f"  ✨ SUCCÈS : {len(final_df)} joueurs mis à jour.")
        print("============================================================")
    else:
        print("\n❌ Échec : Vérifiez vos clés API ou la connexion.")

if __name__ == "__main__":
    main()
