import pandas as pd
import requests
import io
import os

CSV_FILE = "players_data_2025_2026.csv"
MAPPING_URL = "https://raw.githubusercontent.com/withqwerty/reep/main/data/people.csv"

def main():
    print("🚀 Téléchargement du dictionnaire public de mapping (Reep Register)...")
    try:
        response = requests.get(MAPPING_URL, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Erreur de téléchargement : {e}")
        return
        
    mapping_df = pd.read_csv(io.StringIO(response.text), dtype=str)
    
    print(f"✅ Mapping téléchargé avec succès ({len(mapping_df)} joueurs).")
    
    # Check what the columns are
    print("Colonnes disponibles:", list(mapping_df.columns))
    
    id_map = {}
    for _, row in mapping_df.iterrows():
        # Usually it has 'name' and 'fbref_id' or 'fbref' or 'name_fbref'
        name_cols = [c for c in mapping_df.columns if 'name' in c.lower()]
        fbref_cols = [c for c in mapping_df.columns if 'fbref' in c.lower()]
        
        if not name_cols or not fbref_cols:
            continue
            
        name = str(row[name_cols[0]]).lower().strip()
        fbref_id = str(row[fbref_cols[0]])
        if pd.notna(fbref_id) and fbref_id != "nan":
            # Extract just the ID if it's a URL
            if "fbref.com" in fbref_id:
                parts = fbref_id.split('/players/')
                if len(parts) > 1:
                    fbref_id = parts[1].split('/')[0]
            id_map[name] = fbref_id

    print(f"🔍 Dictionnaire construit avec {len(id_map)} IDs uniques.")
    print("💾 Patch de votre base de données locale en cours...")
    
    if not os.path.exists(CSV_FILE):
        print(f"❌ Fichier introuvable : {CSV_FILE}")
        return
        
    df = pd.read_csv(CSV_FILE, dtype=str)
    player_col = "Player" if "Player" in df.columns else "player"
    
    if player_col not in df.columns:
        print("❌ Colonne Joueur introuvable dans votre CSV !")
        return
        
    if "fbref_id" not in df.columns:
        df["fbref_id"] = ""
        
    patched_count = 0
    for idx, row in df.iterrows():
        p_name = str(row[player_col]).strip().lower()
        if p_name in id_map:
            if pd.isna(row["fbref_id"]) or row["fbref_id"] == "":
                df.at[idx, "fbref_id"] = id_map[p_name]
                patched_count += 1
                
    df.to_csv(CSV_FILE, index=False)
    print(f"🎉 PARFAIT ! {patched_count} joueurs ont été mis à jour avec leur véritable FBref ID, en toute sécurité !")

if __name__ == "__main__":
    main()
