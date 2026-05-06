"""
Script d'enrichissement SofaScore ID
- Parcourt tous les joueurs (triés par minutes jouées)
- Recherche chaque ID via l'API SofaScore
- Met à jour players_data.sqlite ET players_data_2025_2026.csv
- Reprend là où il s'est arrêté (résistant aux interruptions)
"""

import sys
import sqlite3
import pandas as pd
import requests
import time
import json
import os

# Fix encoding Windows
sys.stdout.reconfigure(encoding='utf-8')

SQLITE_PATH = 'players_data.sqlite'
CSV_PATH = 'players_data_2025_2026.csv'
PROGRESS_FILE = 'sofascore_id_progress.json'

# Headers identiques a un vrai Chrome pour eviter le blocage
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.sofascore.com/',
    'Origin': 'https://www.sofascore.com',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Connection': 'keep-alive',
}

def search_sofascore_id(player_name: str, squad: str):
    """Cherche l'ID SofaScore d'un joueur par son nom."""
    try:
        # Suppression du slash avant le '?' car ca peut poser probleme
        url = f"https://api.sofascore.com/api/v1/search/all?q={requests.utils.quote(player_name)}&page=0"
        resp = requests.get(url, headers=HEADERS, timeout=8)
        if resp.status_code != 200:
            print(f"⚠️ Erreur API {resp.status_code} pour {player_name}")
            return None
        data = resp.json()
        results = data.get('results', [])
        players = [r for r in results if r.get('type') == 'player']
        if players:
            return players[0]['entity']['id']
    except Exception as e:
        print(f"⚠️ Exception pour {player_name}: {e}")
    return None

def main():
    # 1. Connexion SQLite
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()

    # 2. Ajouter la colonne sofascore_id si elle n'existe pas
    existing_cols = [r[1] for r in cursor.execute("PRAGMA table_info(players)").fetchall()]
    if 'sofascore_id' not in existing_cols:
        cursor.execute("ALTER TABLE players ADD COLUMN sofascore_id INTEGER")
        conn.commit()
        print("[OK] Colonne 'sofascore_id' ajoutee a la table 'players'")
    else:
        print("[INFO] Colonne 'sofascore_id' existe deja")

    # 3. Charger la progression précédente
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            progress = json.load(f)
        print(f"[RESUME] {len(progress)} joueurs deja traites")

    # 4. Récupérer les joueurs à traiter (triés par minutes jouées DESC)
    df = pd.read_sql("SELECT Player, Squad, Min, sofascore_id FROM players ORDER BY CAST(Min AS INTEGER) DESC", conn)
    df = df.drop_duplicates(subset='Player', keep='first')
    total = len(df)

    # 5. Boucle principale
    found = 0
    not_found = 0
    skipped = 0
    
    for idx, row in df.iterrows():
        name = row['Player']
        squad = row['Squad'] or ''
        
        # Déjà traité
        if name in progress:
            skipped += 1
            continue
        if pd.notna(row['sofascore_id']) and row['sofascore_id']:
            progress[name] = int(row['sofascore_id'])
            skipped += 1
            continue

        # Recherche
        sofa_id = search_sofascore_id(name, squad)
        progress[name] = sofa_id

        # Mise à jour SQLite
        if sofa_id:
            cursor.execute(
                "UPDATE players SET sofascore_id = ? WHERE Player = ?",
                (sofa_id, name)
            )
            found += 1
            status = f"[OK]  {name} ({squad}) -> ID {sofa_id}"
        else:
            not_found += 1
            status = f"[--]  {name} ({squad}) -> non trouve"
        
        print(f"[{found+not_found+skipped}/{total}] {status}")
        sys.stdout.flush()

        # Sauvegarde intermédiaire toutes les 10 requêtes
        if (found + not_found) % 10 == 0:
            conn.commit()
            with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
                json.dump(progress, f, ensure_ascii=False)

        time.sleep(0.6)

    # 6. Sauvegarde finale SQLite
    conn.commit()
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"TERMINE : {found} trouves | {not_found} non trouves | {skipped} passes")

    # 7. Mise à jour du CSV
    print("\nMise a jour du CSV...")
    csv_df = pd.read_csv(CSV_PATH)
    csv_df['sofascore_id'] = csv_df['Player'].map(progress)
    csv_df.to_csv(CSV_PATH, index=False)
    print(f"[OK] CSV mis a jour : {CSV_PATH}")

    conn.close()
    print("\n[DONE] Base de donnees enrichie avec les IDs SofaScore !")

if __name__ == '__main__':
    main()

