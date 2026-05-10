import urllib.request, json
resp = urllib.request.urlopen('http://localhost:5002/api/sofa/player/581310/matches', timeout=10)
data = json.loads(resp.read())
matches = data.get('matches', [])
print(f'Total matchs Raya 2025/26: {len(matches)}')
from datetime import datetime
for m in matches[:10]:
    dt = datetime.fromtimestamp(m['date']).strftime('%d/%m/%Y')
    ht = m['homeTeam']['name']
    at = m['awayTeam']['name']
    hs = m.get('homeScore', '?')
    as_ = m.get('awayScore', '?')
    comp = m.get('tournament', '')
    print(f"  {dt}: {ht} {hs}-{as_} {at} [{comp}]")
