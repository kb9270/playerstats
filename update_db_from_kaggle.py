"""
Script Data Engineer : ETL Kaggle -> SQLite
1. Telechargement via Kaggle API
2. Nettoyage et enrichissement (last_updated)
3. Schema dynamique (250+ colonnes)
4. Chargement dans football_stats.db
"""

import os
import pandas as pd
import sqlite3
from datetime import datetime
from kaggle.api.kaggle_api_extended import KaggleApi

# Configuration
DATASET_SLUG = "vivovinco/football-players-stats-2025-2026"
FILE_NAME = "players_data-2025_2026.csv"
DB_NAME = "football_stats.db"
TABLE_NAME = "players"

def run_etl():
    print(f"🚀 Demarrage du processus ETL pour {FILE_NAME}...")

    # 1. Authentification Kaggle
    # Note : Necessite le fichier kaggle.json dans ~/.kaggle/
    try:
        api = KaggleApi()
        api.authenticate()
        print("✅ Authentification Kaggle reussie.")
    except Exception as e:
        print(f"❌ Erreur d'authentification Kaggle : {e}")
        print("Assurez-vous d'avoir place votre 'kaggle.json' dans C:\\Users\\<Nom>\\.kaggle\\")
        return

    # 2. Telechargement du fichier
    print(f"📥 Telechargement de {FILE_NAME} depuis {DATASET_SLUG}...")
    api.dataset_download_file(DATASET_SLUG, FILE_NAME, path=".")
    
    # Kaggle telecharge souvent en .zip si on ne precise pas
    if os.path.exists(f"{FILE_NAME}.zip"):
        import zipfile
        with zipfile.ZipFile(f"{FILE_NAME}.zip", 'r') as zip_ref:
            zip_ref.extractall(".")
        os.remove(f"{FILE_NAME}.zip")
        print("📦 Fichier dezippe avec succes.")

    # 3. Traitement des donnees avec Pandas
    print(f"📊 Lecture des donnees ({FILE_NAME})...")
    df = pd.read_csv(FILE_NAME)
    
    # Ajout de la colonne last_updated
    df['last_updated'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"✨ Donnees traitees : {len(df)} joueurs, {len(df.columns)} colonnes detectees.")

    # 4. Connexion et Mise a jour SQLite
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        # Suppression de l'ancienne table
        print(f"🗑️  Suppression de l'ancienne table '{TABLE_NAME}'...")
        cursor.execute(f"DROP TABLE IF EXISTS {TABLE_NAME}")
        
        # Creation et Importation automatique
        # to_sql gere le schema dynamique pour les 250+ colonnes
        print(f"💾 Chargement dans {DB_NAME} (Table: {TABLE_NAME})...")
        df.to_sql(TABLE_NAME, conn, index=False, if_exists='replace')
        
        # Verification
        cursor.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}")
        count = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        print(f"🏁 ETL Termine avec succes ! {count} lignes inserees.")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'operation sur la base de donnes : {e}")

if __name__ == "__main__":
    run_etl()
