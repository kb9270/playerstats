import os
import sys
import json
import sqlite3
import pandas as pd
import time
import random
import threading
from concurrent.futures import ThreadPoolExecutor
from curl_cffi import requests

# Force UTF-8 encoding for Windows terminals to prevent UnicodeEncodeError
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = 'offline_matches.sqlite'
CSV_PATH = 'players_data_2025_2026.csv'
SEASON_START_TS = 1754006400  # August 1st, 2025 00:00:00 UTC
BATCH_LIMIT = 1000
MAX_WORKERS = 10

db_lock = threading.Lock()

class BlockCoordinator:
    def __init__(self):
        self.lock = threading.Lock()
        self.is_blocked = False
        self.resume_event = threading.Event()
        self.resume_event.set()  # Set means threads can run

coordinator = BlockCoordinator()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Match details
    c.execute('''
        CREATE TABLE IF NOT EXISTS player_match_details (
            player_id INTEGER,
            event_id INTEGER,
            stats JSON,
            heatmap JSON,
            shotmap JSON,
            passes JSON,
            actions JSON,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (player_id, event_id)
        )
    ''')
    
    # 2. Progress tracker
    c.execute('''
        CREATE TABLE IF NOT EXISTS player_collection_progress (
            sofa_id INTEGER PRIMARY KEY,
            status TEXT,
            matches_count INTEGER DEFAULT 0,
            details_fetched_count INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 3. Cached shotmaps
    c.execute('''
        CREATE TABLE IF NOT EXISTS cached_shotmaps (
            event_id INTEGER PRIMARY KEY,
            shotmap JSON,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 4. Old player data fallback structure
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

def make_request(session, url, retries=5):
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    }
    
    other_attempts = 0
    while True:
        # Wait if another thread is handling a block
        coordinator.resume_event.wait()
        
        try:
            resp = session.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                return resp
            elif resp.status_code in (403, 429, 503):
                with coordinator.lock:
                    if not coordinator.is_blocked:
                        coordinator.is_blocked = True
                        coordinator.resume_event.clear()  # Pause all other threads
                        print(f"\n🚨 🚨 🚨 [API Blocked {resp.status_code}] Cloudflare block detected on URL: {url}")
                        print("👉 PLEASE ROTATE YOUR IP (toggle mobile hotspot / VPN) on your machine.")
                        print("Waiting for IP rotation to resume...")
                        
                        while True:
                            time.sleep(10)
                            try:
                                test_resp = session.get(url, headers=headers, timeout=10)
                                if test_resp.status_code == 200:
                                    print("🎉 [Success 200] IP rotation detected! Resuming collection...")
                                    coordinator.is_blocked = False
                                    coordinator.resume_event.set()
                                    return test_resp
                                elif test_resp.status_code == 404:
                                    print("🎉 [Success 404] IP rotation detected! Resuming...")
                                    coordinator.is_blocked = False
                                    coordinator.resume_event.set()
                                    return test_resp
                                else:
                                    print(f"    ... still blocked (status {test_resp.status_code}). Please rotate IP.")
                            except Exception as test_err:
                                print(f"    ... waiting for network reconnection ({test_err}). Please ensure IP is rotated.")
                    else:
                        # We are blocked but another thread is already coordination-waiting
                        pass
                continue  # Loop back to wait and retry
            elif resp.status_code == 404:
                return resp
            else:
                print(f"    [HTTP Error {resp.status_code}] for {url}.")
                other_attempts += 1
                if other_attempts >= retries:
                    return resp
                time.sleep(5)
        except Exception as e:
            print(f"    [Connection Error / Exception] {e} for {url}. (Network might be reconnecting). Retrying in 5s...")
            time.sleep(5)

def get_pending_players(conn):
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        sys.exit(1)
        
    df = pd.read_csv(CSV_PATH)
    
    players = []
    for idx, row in df.iterrows():
        sofa_id = row.get('sofascore_id')
        name = row.get('Player')
        squad = row.get('Squad')
        if pd.isna(sofa_id) or sofa_id == "" or sofa_id == 0:
            continue
        try:
            sofa_id = int(float(sofa_id))
        except ValueError:
            continue
            
        # Extract minutes to prioritize key/popular players who play the most minutes
        try:
            minutes = float(row.get('Min')) if not pd.isna(row.get('Min')) else 0.0
        except ValueError:
            minutes = 0.0
            
        players.append({'sofa_id': sofa_id, 'name': name, 'squad': squad, 'minutes': minutes})
        
    # Deduplicate keeping the one with max minutes
    player_map = {}
    for p in players:
        sid = p['sofa_id']
        if sid not in player_map or p['minutes'] > player_map[sid]['minutes']:
            player_map[sid] = p
    unique_players = list(player_map.values())
            
    # Define top clubs to prioritize
    TOP_CLUBS = {
        "Arsenal", "Aston Villa", "Atalanta", "Athletic Club", "Atltico Madrid", "Atlético Madrid", "Barcelona", "Bayern Munich", 
        "Chelsea", "Dortmund", "Girona", "Inter", "Juventus", "Lazio", "Lille", "Liverpool", "Lyon", "Manchester City", 
        "Manchester Utd", "Marseille", "Milan", "Monaco", "Napoli", "Newcastle United", "Nice", "Paris Saint-Germain", 
        "RB Leipzig", "Real Madrid", "Real Sociedad", "Roma", "Sevilla", "Stuttgart", "Tottenham Hotspur", "Villarreal"
    }
    
    def get_priority_key(p):
        is_top = 1 if p['squad'] in TOP_CLUBS else 0
        return (is_top, p['minutes'])
        
    # Sort: Top squads first, and higher minutes played first within categories
    unique_players.sort(key=get_priority_key, reverse=True)
            
    pending = []
    c = conn.cursor()
    for p in unique_players:
        c.execute('SELECT status FROM player_collection_progress WHERE sofa_id = ?', (p['sofa_id'],))
        row = c.fetchone()
        if not row or row[0] not in ('completed', 'skipped'):
            pending.append(p)
            
    print(f"CSV Total Players: {len(unique_players)} | Remaining: {len(pending)}")
    return pending

def get_cached_player_shotmap(session, conn, event_id, player_id):
    with db_lock:
        c = conn.cursor()
        c.execute('SELECT shotmap FROM cached_shotmaps WHERE event_id = ?', (event_id,))
        row = c.fetchone()
    
    if row:
        shotmap = json.loads(row[0])
    else:
        url = f"https://api.sofascore.com/api/v1/event/{event_id}/shotmap"
        resp = make_request(session, url)
        shotmap = resp.json().get('shotmap', []) if (resp and resp.status_code == 200) else []
        with db_lock:
            c = conn.cursor()
            c.execute('INSERT OR REPLACE INTO cached_shotmaps (event_id, shotmap) VALUES (?, ?)', (event_id, json.dumps(shotmap)))
            conn.commit()
        time.sleep(random.uniform(0.3, 0.7))
        
    player_shots = [s for s in shotmap if s.get('player', {}).get('id') == player_id]
    return player_shots

def fetch_player_season_matches(session, sofa_id):
    matches = []
    page = 0
    has_more = True
    
    while has_more:
        url = f"https://api.sofascore.com/api/v1/player/{sofa_id}/events/last/{page}"
        print(f"  Paging events page {page} for player {sofa_id}...")
        resp = make_request(session, url)
        if not resp or resp.status_code != 200:
            break
            
        data = resp.json()
        events = data.get('events', [])
        if not events:
            break
            
        for e in events:
            start_ts = e.get('startTimestamp')
            if not start_ts:
                continue
            if start_ts >= SEASON_START_TS:
                matches.append(e)
            else:
                has_more = False
                
        if len(events) < 10 or events[-1].get('startTimestamp', 0) < SEASON_START_TS:
            has_more = False
        else:
            page += 1
            time.sleep(random.uniform(0.3, 0.7))
            
    return matches

def fetch_and_save_match_details(session, conn, player_id, event_id):
    # 1. Statistics
    stats_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/statistics"
    s_resp = make_request(session, stats_url)
    if not s_resp or s_resp.status_code != 200:
        return None
    
    stats_data = s_resp.json().get('statistics', {})
    if not stats_data or not stats_data.get('rating'):
        # Empty stats mean player did not participate (bench)
        with db_lock:
            c = conn.cursor()
            c.execute('''
                INSERT OR REPLACE INTO player_match_details (player_id, event_id, stats, heatmap, shotmap, passes, actions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (player_id, event_id, json.dumps({}), json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])))
            conn.commit()
        return {}
        
    time.sleep(random.uniform(0.3, 0.7))
    
    # 2. Heatmap
    heatmap_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/heatmap"
    h_resp = make_request(session, heatmap_url)
    heatmap_points = h_resp.json().get('heatmap', []) if (h_resp and h_resp.status_code == 200) else []
    time.sleep(random.uniform(0.3, 0.7))
    
    # 3. Passes
    passes_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/passes"
    p_resp = make_request(session, passes_url)
    passes_points = p_resp.json().get('passes', []) if (p_resp and p_resp.status_code == 200) else []
    time.sleep(random.uniform(0.3, 0.7))
    
    # 4. Actions (Defensive Actions)
    actions_url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/actions"
    a_resp = make_request(session, actions_url)
    actions_points = a_resp.json().get('actions', []) if (a_resp and a_resp.status_code == 200) else []
    time.sleep(random.uniform(0.3, 0.7))
    
    # 5. Shotmap
    shotmap_points = get_cached_player_shotmap(session, conn, event_id, player_id)
    
    # Save to SQLite
    with db_lock:
        c = conn.cursor()
        c.execute('''
            INSERT OR REPLACE INTO player_match_details (player_id, event_id, stats, heatmap, shotmap, passes, actions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            player_id, event_id,
            json.dumps(stats_data),
            json.dumps(heatmap_points),
            json.dumps(shotmap_points),
            json.dumps(passes_points),
            json.dumps(actions_points)
        ))
        conn.commit()
    
    return stats_data

def process_player(session, conn, player):
    sofa_id = player['sofa_id']
    name = player['name']
    
    print(f"\n🚀 Processing player: {name} (ID: {sofa_id}, Squad: {player['squad']})")
    
    with db_lock:
        c = conn.cursor()
        c.execute('INSERT OR REPLACE INTO player_collection_progress (sofa_id, status) VALUES (?, ?)', (sofa_id, 'in_progress'))
        conn.commit()
    
    matches = fetch_player_season_matches(session, sofa_id)
    print(f"  [{name}] Found {len(matches)} matches in 2025/2026 season.")
    
    if not matches:
        with db_lock:
            c = conn.cursor()
            c.execute('INSERT OR REPLACE INTO player_collection_progress (sofa_id, status, matches_count) VALUES (?, ?, ?)', (sofa_id, 'skipped', 0))
            conn.commit()
        return
        
    recent_matches_list = []
    fetched_count = 0
    
    for idx, e in enumerate(matches):
        event_id = e.get('id')
        
        # Check if details are already in SQLite
        with db_lock:
            c = conn.cursor()
            c.execute('SELECT stats FROM player_match_details WHERE player_id = ? AND event_id = ?', (sofa_id, event_id))
            row = c.fetchone()
        
        stats_data = None
        if row:
            stats_data = json.loads(row[0])
        else:
            print(f"  [{name}] [{idx+1}/{len(matches)}] Fetching Match {event_id} ({e.get('homeTeam', {}).get('name')} vs {e.get('awayTeam', {}).get('name')})")
            stats_data = fetch_and_save_match_details(session, conn, sofa_id, event_id)
            if stats_data is not None:
                fetched_count += 1
                
        if stats_data and stats_data.get('rating'):
            home_team = e.get('homeTeam', {})
            away_team = e.get('awayTeam', {})
            
            recent_matches_list.append({
                'eventId': event_id,
                'rating': float(stats_data.get('rating')),
                'date': e.get('startTimestamp'),
                'homeTeam': home_team,
                'awayTeam': away_team,
                'tournament': e.get('tournament', {}).get('name'),
                'status': e.get('status', {}).get('type'),
                'homeScore': e.get('homeScore', {}).get('current'),
                'awayScore': e.get('awayScore', {}).get('current'),
                'heatmap': stats_data.get('heatmap', []),
                'stats': stats_data
            })
            
    with db_lock:
        c = conn.cursor()
        c.execute('INSERT OR REPLACE INTO player_data (sofa_id, recent_matches) VALUES (?, ?)', (sofa_id, json.dumps(recent_matches_list)))
        c.execute('INSERT OR REPLACE INTO player_collection_progress (sofa_id, status, matches_count, details_fetched_count) VALUES (?, ?, ?, ?)', 
                  (sofa_id, 'completed', len(matches), fetched_count))
        conn.commit()
    print(f"✅ Completed {name}. Registered {len(recent_matches_list)} active matches.")

def worker(player):
    # Introduce random jitter to stagger start times and prevent Cloudflare block on simultaneous connections
    time.sleep(random.uniform(0.1, 6.0))
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    session = get_session()
    try:
        process_player(session, conn, player)
        # Small cooldown between players
        cooldown = random.uniform(1.0, 3.0)
        time.sleep(cooldown)
    except Exception as e:
        print(f"❌ Error processing player {player['name']}: {e}")
    finally:
        session.close()
        conn.close()

def main():
    print("="*60)
    print(f"SOFASCORE DATA BULK SCRAPER - STARTING BATCH RUN (THREADS: {MAX_WORKERS}, FAST MODE)")
    print("="*60)
    
    conn = init_db()
    pending = get_pending_players(conn)
    conn.close()
    
    if not pending:
        print("🎉 No pending players left to collect!")
        return
        
    batch = pending[:BATCH_LIMIT]
    print(f"Targeting batch of {len(batch)} players for this run with {MAX_WORKERS} concurrent threads.")
    
    try:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            executor.map(worker, batch)
    except KeyboardInterrupt:
        print("\n🛑 Execution interrupted by user.")
    
    print("\nBatch execution ended.")

if __name__ == "__main__":
    main()
