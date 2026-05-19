"""
merge_fbref_json.py — Fusionne les fichiers fbref_*.json téléchargés depuis Chrome
et met à jour le fichier players_data_2025_2026.csv en préservant TOUTES les colonnes existantes.

Usage : py merge_fbref_json.py
Les fichiers JSON doivent être dans le dossier Downloads ou dans le dossier courant.
"""
import sys
import os
import json
import glob
import pandas as pd
from pathlib import Path
from datetime import datetime

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_CSV = "players_data_2025_2026.csv"
BACKUP_CSV = "players_data_2025_2026_backup.csv"

# Chercher les fichiers JSON dans le dossier courant ET dans Downloads
SEARCH_DIRS = [
    ".",
    os.path.expanduser("~/Downloads"),
]

def find_json_files():
    """Trouve tous les fichiers fbref_*.json"""
    files = {}
    for d in SEARCH_DIRS:
        for f in glob.glob(os.path.join(d, "fbref_*.json")):
            slug = Path(f).stem.replace("fbref_", "")
            # Garder le plus récent si doublon
            if slug not in files or os.path.getmtime(f) > os.path.getmtime(files[slug]):
                files[slug] = f
    return files

def main():
    print("=" * 60)
    print("  🔄 Fusion des fichiers FBref JSON → CSV")
    print(f"  ⏰ {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 60)

    json_files = find_json_files()
    
    if not json_files:
        print("\n❌ Aucun fichier fbref_*.json trouvé !")
        print("   Vérifiez que vous avez bien téléchargé les fichiers depuis Chrome.")
        print("   Fichiers attendus : fbref_stats.json, fbref_shooting.json, etc.")
        return

    print(f"\n📁 {len(json_files)} fichiers trouvés :")
    for slug, path in sorted(json_files.items()):
        print(f"   • {slug}: {path}")

    # Charger et fusionner les données
    base_df = None
    
    for slug in ["stats", "shooting", "passing", "possession", "defense", "misc", "playingtime", "keepers"]:
        if slug not in json_files:
            print(f"\n⚠️  {slug} manquant — ignoré")
            continue
            
        print(f"\n📊 Chargement : {slug}")
        with open(json_files[slug], 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        df = pd.DataFrame(data)
        print(f"   ✅ {len(df)} joueurs")
        
        if base_df is None:
            base_df = df
        else:
            # Clé de jointure : player + team/squad
            key_cols = [c for c in df.columns if c.lower() in ['player', 'team', 'squad', 'nation', 'pos', 'age', 'born']]
            merge_on = [c for c in key_cols if c in base_df.columns]
            
            if merge_on:
                # Colonnes déjà présentes dans base_df (hors clés)
                existing = set(base_df.columns) - set(merge_on)
                new_cols = [c for c in df.columns if c not in existing or c in merge_on]
                df_to_merge = df[new_cols] if new_cols else df
                
                base_df = base_df.merge(df_to_merge, on=merge_on, how='outer', suffixes=('', f'_{slug}'))
                # Supprimer les colonnes dupliquées
                base_df = base_df.loc[:, ~base_df.columns.str.endswith(f'_{slug}')]
            else:
                print(f"   ⚠️  Pas de clé commune, concaténation brute")
                base_df = pd.concat([base_df, df], axis=0, ignore_index=True)

    if base_df is None or base_df.empty:
        print("\n❌ Aucune donnée extraite.")
        return

    # ─── Préservation des anciennes colonnes ───
    if os.path.exists(OUTPUT_CSV):
        # Backup
        pd.read_csv(OUTPUT_CSV).to_csv(BACKUP_CSV, index=False)
        print(f"\n💾 Backup créé : {BACKUP_CSV}")
        
        try:
            print("  🔍 Récupération des anciennes colonnes...")
            old_df = pd.read_csv(OUTPUT_CSV)
            
            # Trouver la colonne Player dans les deux DataFrames
            old_player_col = "Player" if "Player" in old_df.columns else "player"
            new_player_col = "player" if "player" in base_df.columns else "Player"
            
            if old_player_col in old_df.columns:
                # Colonnes à préserver (celles de l'ancien fichier qui ne sont pas dans le nouveau)
                cols_to_keep = [old_player_col] + [c for c in old_df.columns if c not in base_df.columns]
                
                if len(cols_to_keep) > 1:
                    old_data = old_df[cols_to_keep].drop_duplicates(subset=[old_player_col])
                    
                    # Renommer si nécessaire pour le merge
                    if old_player_col != new_player_col:
                        old_data = old_data.rename(columns={old_player_col: new_player_col})
                    
                    base_df = base_df.merge(old_data, on=new_player_col, how="left")
                    print(f"  ✅ {len(cols_to_keep)-1} anciennes colonnes préservées (fbref_id, sofascore_id, etc.)")
        except Exception as e:
            print(f"  ⚠️ Erreur : {e}")

    # Ajouter métadonnées
    base_df["Season"] = "2025-26"
    base_df["UpdatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Sauvegarder
    base_df.to_csv(OUTPUT_CSV, index=False)

    print(f"\n{'=' * 60}")
    print(f"  ✨ SUCCÈS : {len(base_df)} joueurs × {len(base_df.columns)} colonnes")
    print(f"  📄 Fichier : {OUTPUT_CSV}")
    print(f"{'=' * 60}")

    # Nettoyage optionnel des JSON
    print("\n🗑️  Vous pouvez supprimer les fichiers fbref_*.json de vos Téléchargements.")

if __name__ == "__main__":
    main()
