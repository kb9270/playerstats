import os
import sys
import json
import sqlite3
import pandas as pd
import time
import random
from curl_cffi import requests

# Force UTF-8 encoding for Windows terminals to prevent UnicodeEncodeError
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = 'offline_matches.sqlite'
CSV_PATH = 'players_data_2025_2026.csv'
BATCH_SIZE = 100

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS player_data (
            sofa_id INTEGER PRIMARY KEY,
            recent_matches JSON,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    return conn

def get_session():
    return requests.Session(impersonate="chrome110")

def fetch_player_data(sofa_id):
    session = get_session()
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
    }

    recent_matches = []

    try:
        # 1. Fetch last events
        events_url = f"https://api.sofascore.com/api/v1/player/{sofa_id}/events/last/0"
        resp = session.get(events_url, headers=headers)
        
        if resp.status_code == 200:
            events = resp.json().get('events', [])
            
            recent = events[-20:]
            recent.reverse()
            
            count = 0
            for e in recent:
                if count >= 5: break
                event_id = e.get('id')
                
                # Fetch match stats for player
                stat_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{sofa_id}/statistics"
                s_resp = session.get(stat_url, headers=headers)
                
                # Fetch heatmap for player in this match
                heatmap = []
                heat_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{sofa_id}/heatmap"
                h_resp = session.get(heat_url, headers=headers)
                if h_resp.status_code == 200:
                    heatmap = h_resp.json().get('points', [])
                
                if s_resp.status_code == 200:
                    stats = s_resp.json().get('statistics', {})
                    rating = stats.get('rating')
                    
                    if rating:
                        home_team = e.get('homeTeam', {})
                        away_team = e.get('awayTeam', {})
                        player_team_id = s_resp.json().get('team', {}).get('id')
                        is_home = (home_team.get('id') == player_team_id)
                        opponent = away_team if is_home else home_team
                        
                        recent_matches.append({
                            'eventId': event_id,
                            'rating': float(rating),
                            'date': e.get('startTimestamp'),
                            'opponent': {
                                'name': opponent.get('shortName') or opponent.get('name'),
                                'id': opponent.get('id')
                            },
                            'isHome': is_home,
                            'homeScore': e.get('homeScore', {}).get('current'),
                            'awayScore': e.get('awayScore', {}).get('current'),
                            'heatmap': heatmap,
                            'stats': stats
                        })
                        count += 1
    except Exception as e:
        print(f"Error fetching matches for {sofa_id}: {e}")
    finally:
        session.close()

    return recent_matches

import concurrent.futures

def process_batch(conn, df, offset, limit):
    c = conn.cursor()
    
    batch = df.iloc[offset:offset+limit]
    
    print(f"\n--- Traitement du lot en PARALLELE : {offset} a {offset+len(batch)} ---")
    
    players_to_fetch = []
    for idx, row in batch.iterrows():
        sofa_id = row.get('sofascore_id')
        name = row.get('Player')
        
        if pd.isna(sofa_id) or sofa_id == "" or sofa_id == 0:
            continue
            
        sofa_id = int(sofa_id)
        
        # Check if already in DB
        c.execute('SELECT 1 FROM player_data WHERE sofa_id = ?', (sofa_id,))
        if not c.fetchone():
            players_to_fetch.append((sofa_id, name))
            
    if not players_to_fetch:
        print("Aucun joueur a traiter dans ce lot.")
        return

    print(f"{len(players_to_fetch)} joueurs a extraire simultanement...")
    success = 0
    
    def fetch_task(item):
        sofa_id, name = item
        recent = fetch_player_data(sofa_id)
        return sofa_id, name, recent

    # Run 100 concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        results = list(executor.map(fetch_task, players_to_fetch))
        
    for sofa_id, name, recent in results:
        if recent:
            try:
                c.execute('''
                    INSERT OR IGNORE INTO player_data (sofa_id, recent_matches) 
                    VALUES (?, ?)
                ''', (sofa_id, json.dumps(recent)))
                conn.commit()
                success += 1
                print(f"  -> OK pour {name} ({len(recent)} matchs trouves)")
            except Exception as e:
                print(f"  -> Erreur BD pour {name}: {e}")
        else:
            print(f"  -> Echec pour {name}")
            
    if success == 0 and len(players_to_fetch) > 5:
        print("BLOCAGE IP DETECTE (0 succes sur bcp de joueurs). Arret du script pour changement d'IP.")
        import sys
        sys.exit(403)
    elif success == 0:
        print(f"Aucun match trouve pour ces {len(players_to_fetch)} joueurs, mais le lot est trop petit pour etre un blocage IP certifie.")

if __name__ == "__main__":
    print("Demarrage du script de creation de la BDD hors-ligne...")
    if not os.path.exists(CSV_PATH):
        print(f"Fichier {CSV_PATH} introuvable.")
        sys.exit(1)
        
    df = pd.read_csv(CSV_PATH)
    conn = init_db()
    
    total = len(df)
    
    # Process 100 by 100
    for i in range(0, total, BATCH_SIZE):
        process_batch(conn, df, i, BATCH_SIZE)
        print("Pause de 10 secondes avant le prochain lot...")
        time.sleep(10)
        
    conn.close()
    print("Termine !")
