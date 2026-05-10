import sqlite3
import pandas as pd

IDs = {
    "David Raya": 581310,
    "Martin Dubravka": 42209,
    "Bernd Leno": 103335,
    "Nikola Milenkovic": 836168,
    "Djordje Petrovic": 882604,
    "Jordan Pickford": 138530,
    "Virgil van Dijk": 151545,
    "Bart Verbruggen": 994363,
    "Guglielmo Vicario": 553606,
    "James Garner": 927361
}

# 1. Update SQLite
print("Updating SQLite...")
conn = sqlite3.connect('players_data.sqlite')
cursor = conn.cursor()

# Ensure column exists
cols = [r[1] for r in cursor.execute("PRAGMA table_info(players)").fetchall()]
if 'sofascore_id' not in cols:
    print("Adding sofascore_id column...")
    cursor.execute("ALTER TABLE players ADD COLUMN sofascore_id INTEGER")

for name, sid in IDs.items():
    cursor.execute("UPDATE players SET sofascore_id = ? WHERE Player = ?", (sid, name))
    print(f"Updated {name} with ID {sid}")

conn.commit()
conn.close()

# 2. Update CSV
print("\nUpdating CSV...")
csv_path = 'players_data_2025_2026.csv'
df = pd.read_csv(csv_path)

if 'sofascore_id' not in df.columns:
    df['sofascore_id'] = None

for name, sid in IDs.items():
    df.loc[df['Player'] == name, 'sofascore_id'] = sid

df.to_csv(csv_path, index=False)
print("CSV Updated.")
