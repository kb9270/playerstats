import urllib.request, json

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Referer': 'https://www.sofascore.com/',
    'Origin': 'https://www.sofascore.com',
}

SOFA_ID = 581310

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except Exception as e:
        print(f"ERROR {url}: {e}")
        return None

# 1. Get seasons
print("=== SEASONS ===")
data = fetch(f"https://api.sofascore.com/api/v1/player/{SOFA_ID}/statistics/seasons")
if data:
    for ut in data.get('uniqueTournamentSeasons', [])[:15]:
        tn = ut.get('uniqueTournament', {}).get('name', '?')
        tid = ut.get('uniqueTournament', {}).get('id', '?')
        seasons = [s.get('year') for s in ut.get('seasons', [])[:5]]
        print(f"  {tn} (ID={tid}): {seasons}")
    
    # Try to find PL 25/26
    target_tournament = None
    target_season = None
    for ut in data.get('uniqueTournamentSeasons', []):
        s2526 = next((s for s in ut.get('seasons', []) if s.get('year') == '25/26'), None)
        if s2526 and ut.get('uniqueTournament', {}).get('id') == 17:
            target_tournament = ut['uniqueTournament']
            target_season = s2526
            break
    
    if target_tournament:
        tid = target_tournament['id']
        sid = target_season['id']
        print(f"\nTarget: {target_tournament['name']} Season {target_season['year']} TID={tid} SID={sid}")
        
        # 2. Get stats
        print("\n=== STATS ===")
        stats = fetch(f"https://api.sofascore.com/api/v1/player/{SOFA_ID}/unique-tournament/{tid}/season/{sid}/statistics/overall")
        if stats:
            s = stats.get('statistics', {})
            print(f"Rating: {s.get('rating')}")
            print(f"Saves: {s.get('saves')}, SoTA: {s.get('goalKeeperSaves')}")
            print(f"CS: {s.get('cleanSheets')}")
            print(f"Matches: {s.get('matchesPlayed')}")
        
        # 3. Get heatmap
        print("\n=== HEATMAP ===")
        hm = fetch(f"https://api.sofascore.com/api/v1/player/{SOFA_ID}/unique-tournament/{tid}/season/{sid}/heatmap/overall")
        if hm:
            pts = hm.get('points', [])
            print(f"Heatmap points: {len(pts)}")
            if pts:
                print(f"First few: {pts[:3]}")
        else:
            print("No heatmap data")
    else:
        print("Could not find PL 25/26 season")
else:
    print("No seasons data")

# 4. Get last events
print("\n=== LAST EVENTS (2025/26) ===")
events = fetch(f"https://api.sofascore.com/api/v1/player/{SOFA_ID}/events/last/0")
if events:
    evs = events.get('events', [])
    season_start = 1751328000  # July 1, 2025
    filtered = [e for e in evs if e.get('startTimestamp', 0) >= season_start]
    print(f"Total events returned: {len(evs)}, Season 25/26 filtered: {len(filtered)}")
    for e in filtered[:5]:
        ts = e.get('startTimestamp', 0)
        from datetime import datetime
        dt = datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        ht = e.get('homeTeam', {}).get('shortName', '?')
        at = e.get('awayTeam', {}).get('shortName', '?')
        hs = e.get('homeScore', {}).get('current', '?')
        as_ = e.get('awayScore', {}).get('current', '?')
        print(f"  {dt}: {ht} {hs}-{as_} {at}")
