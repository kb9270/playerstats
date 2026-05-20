import requests
import re
import csv

players = [
    "Arda Güler", "Thiago Pinar", "Diego Aguado", "Marc Casado", "Tomas Marques", 
    "James Trafford", "Divine Mukasa", "Max Alleyne", "Myles Lewis-Skelly", "Trey Nyoni", 
    "Aleksandar Pavlovic", "Lennart Karl", "Felipe Chávez", "Maycon Cardozo", "Wisdom Mike", 
    "Waldemar Anton", "Salih Özcan", "Samuele Inácio", "Filippo Mane", "Luca Reggiani", 
    "Ange-Yoan Bonny", "Petar Sucic", "Matteo Lavelli", "Ardon Jashari", "Zachary Athekame", 
    "Cheveyo Muy", "Alex Baena", "Pablo Barrios", "Giuliano Simeone", "Tyrique George", 
    "Shea Lacey", "Ayden Heaven", "Jack Fletcher", "Tyler Fletcher", "George Hemmings", 
    "Jamaldeen Jimoh", "Bradley Burrowes", "Alysson Edward"
]

results = {}

for p in players:
    try:
        # Search wikipedia
        res = requests.get(f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={p}&utf8=&format=json").json()
        if res['query']['search']:
            title = res['query']['search'][0]['title']
            
            # Get page text
            page = requests.get(f"https://en.wikipedia.org/w/api.php?action=parse&page={title}&prop=externallinks|text&format=json").json()
            text_data = str(page)
            
            match = re.search(r'fbref\.com(?:%2Fen%2F|/en/)players(?:%2F|/)([a-zA-Z0-9]{8})', text_data)
            if match:
                results[p] = match.group(1)
                print(f"✅ {p}: {results[p]}")
            else:
                # Try wikidata
                wk = requests.get(f"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={p}&language=en&format=json", headers={"User-Agent": "Bot/1.0 (a@b.com)"}).json()
                if wk.get('search'):
                    eid = wk['search'][0]['id']
                    cl = requests.get(f"https://www.wikidata.org/w/api.php?action=wbgetclaims&entity={eid}&property=P8642&format=json", headers={"User-Agent": "Bot/1.0 (a@b.com)"}).json()
                    if 'P8642' in cl.get('claims', {}):
                        results[p] = cl['claims']['P8642'][0]['mainsnak']['datavalue']['value']
                        print(f"✅ {p}: {results[p]} (Wikidata)")
                    else:
                        print(f"❌ {p}: Introuvable")
                else:
                    print(f"❌ {p}: Introuvable")
        else:
            print(f"❌ {p}: Introuvable")
    except Exception as e:
        print(f"❌ {p}: Error")

# Update CSV
with open('players_data_2025_2026.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

patched = 0
for r in rows:
    if not r.get('fbref_id'):
        name = r.get('Player') or r.get('player') or ''
        # check exact or partial
        for p_name, p_id in results.items():
            if p_name.lower() in name.lower() or name.lower() in p_name.lower():
                r['fbref_id'] = p_id
                patched += 1
                break

with open('players_data_2025_2026.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"🎉 Terminé. {patched} VIPs mis à jour dans le CSV.")
