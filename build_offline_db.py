import os
import sys
import json
import sqlite3
import pandas as pd
import time
import random
from curl_cffi import requests

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
    # Impersonate a common browser to bypass basic Cloudflare checks
    return requests.Session(impersonate="chrome110")

def fetch_player_data(session, sofa_id):
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
            
            # Get up to 5 recent matches
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
                time.sleep(0.5) # Be polite between match requests
    except Exception as e:
        print(f"Error fetching matches for {sofa_id}: {e}")

    return recent_matches

def process_batch(conn, df, offset, limit):
    session = get_session()
    c = conn.cursor()
    
    batch = df.iloc[offset:offset+limit]
    
    print(f"\n--- Traitement du lot : {offset} a {offset+len(batch)} ---")
    
    success = 0
    for idx, row in batch.iterrows():
        sofa_id = row.get('sofascore_id')
        name = row.get('Player')
        
        if pd.isna(sofa_id) or sofa_id == "" or sofa_id == 0:
            continue
            
        sofa_id = int(sofa_id)
        
        # Check if already in DB
        c.execute('SELECT 1 FROM player_data WHERE sofa_id = ?', (sofa_id,))
        if c.fetchone():
            continue
            
        print(f"[{offset+success+1}] Extraction pour {name} ({sofa_id})...")
        recent = fetch_player_data(session, sofa_id)
        
        if recent:
            c.execute('''
                INSERT INTO player_data (sofa_id, recent_matches) 
                VALUES (?, ?)
            ''', (sofa_id, json.dumps(recent)))
            conn.commit()
            success += 1
            print(f"  -> OK ({len(recent)} matchs trouves avec rating et heatmap)")
        else:
            print(f"  -> Echec / Aucun match trouve")
            
        time.sleep(random.uniform(1.0, 2.0))
        
    session.close()
    print(f"Lot termine. {success} joueurs mis a jour.")

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
