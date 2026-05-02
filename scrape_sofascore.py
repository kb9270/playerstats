import os
import time
import random
import pandas as pd
from curl_cffi import requests
from thefuzz import fuzz
from thefuzz import process

# ── Configuration ────────────────────────────────────────────────────────
INPUT_CSV = "players_data_2025_2026.csv"
OUTPUT_CSV = "players_data_2025_2026_enriched.csv"
HEATMAPS_DIR = "client/public/assets/heatmaps"  # Dossier accessible par le front-end React

# Headers simulant l'application mobile ou un navigateur légitime
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.sofascore.com",
    "Referer": "https://www.sofascore.com/",
    "Cache-Control": "no-cache",
}

# ── Dossier ──────────────────────────────────────────────────────────────
if not os.path.exists(HEATMAPS_DIR):
    os.makedirs(HEATMAPS_DIR)

# ── Helpers API SofaScore ─────────────────────────────────────────────────
def search_player(player_name, squad_name):
    """Cherche le joueur sur SofaScore et utilise thefuzz pour trouver le bon ID."""
    url = f"https://api.sofascore.com/api/v1/search/all?q={player_name}"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10, impersonate="chrome110")
        if resp.status_code != 200:
            return None
            
        data = resp.json()
        if "results" not in data:
            return None
            
        # Filtrer uniquement les joueurs (type = 'player')
        players = [item for item in data["results"] if item.get("type") == "player"]
        if not players:
            return None

        # 1. Essayer de trouver une correspondance exacte ou très proche avec l'équipe
        best_match = None
        best_score = 0
        
        for p in players:
            entity = p.get("entity", {})
            name = entity.get("name", "")
            team = entity.get("team", {}).get("name", "")
            
            # Score de similarité sur le nom
            name_score = fuzz.token_sort_ratio(player_name, name)
            
            # Score de similarité sur l'équipe (si l'équipe est fournie)
            team_score = fuzz.partial_ratio(squad_name, team) if squad_name and team else 50
            
            # Si le nom correspond bien (> 80) et l'équipe aussi, on valide
            total_score = (name_score * 0.7) + (team_score * 0.3)
            
            if total_score > best_score:
                best_score = total_score
                best_match = entity

        # Seuil de tolérance (75/100)
        if best_score > 75 and best_match:
            return best_match.get("id")
            
        print(f"  [Not Found] Aucun match satisfaisant (meilleur score: {best_score})")
        return None
        
    except Exception as e:
        print(f"  [API Error] {e}")
        return None

def fetch_and_plot_heatmap(player_id, player_name):
    """
    Récupère les données de la heatmap et génère l'image.
    """
    try:
        # 1. Fetch player's seasons to get the current uniqueTournament and season ID
        seasons_url = f"https://api.sofascore.com/api/v1/player/{player_id}/statistics/seasons"
        seasons_resp = requests.get(seasons_url, headers=HEADERS, timeout=10, impersonate="chrome110")
        
        tournament_id = None
        season_id = None
        
        if seasons_resp.status_code == 200:
            seasons_data = seasons_resp.json()
            if "uniqueTournamentSeasons" in seasons_data and len(seasons_data["uniqueTournamentSeasons"]) > 0:
                # Prend le tournoi principal (le premier de la liste)
                first_tournament = seasons_data["uniqueTournamentSeasons"][0]
                tournament_id = first_tournament.get("uniqueTournament", {}).get("id")
                
                if "seasons" in first_tournament and len(first_tournament["seasons"]) > 0:
                    season_id = first_tournament["seasons"][0].get("id")
        
        if not tournament_id or not season_id:
            # Fallback si on ne trouve pas de saison: on essaie de trouver le dernier match
            last_event_url = f"https://api.sofascore.com/api/v1/player/{player_id}/events/last/0"
            last_event_resp = requests.get(last_event_url, headers=HEADERS, timeout=10, impersonate="chrome110")
            if last_event_resp.status_code == 200:
                last_event_data = last_event_resp.json()
                if "events" in last_event_data and len(last_event_data["events"]) > 0:
                    event_id = last_event_data["events"][0].get("id")
                    url = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/heatmap"
                else:
                    return None
            else:
                return None
        else:
            # Construction de l'URL pour la saison complète
            url = f"https://api.sofascore.com/api/v1/player/{player_id}/unique-tournament/{tournament_id}/season/{season_id}/heatmap"
            
        resp = requests.get(url, headers=HEADERS, timeout=10, impersonate="chrome110")
        
        if resp.status_code != 200 and tournament_id and season_id:
            # Si le heatmap de la saison échoue, on fallback sur le dernier match
            last_event_url = f"https://api.sofascore.com/api/v1/player/{player_id}/events/last/0"
            last_event_resp = requests.get(last_event_url, headers=HEADERS, timeout=10, impersonate="chrome110")
            if last_event_resp.status_code == 200:
                last_event_data = last_event_resp.json()
                if "events" in last_event_data and len(last_event_data["events"]) > 0:
                    event_id = last_event_data["events"][0].get("id")
                    url_fallback = f"https://api.sofascore.com/api/v1/event/{event_id}/player/{player_id}/heatmap"
                    resp = requests.get(url_fallback, headers=HEADERS, timeout=10, impersonate="chrome110")
                    if resp.status_code != 200:
                        return None
                else:
                    return None
            else:
                return None

        # Si l'API renvoie directement une image (PNG/JPEG)
        if "image" in resp.headers.get("Content-Type", ""):
            filename = f"{player_id}_{player_name.replace(' ', '_')}.png"
            filepath = os.path.join(HEATMAPS_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return f"/assets/heatmaps/{filename}"
            
        # Si l'API renvoie du JSON (Coordonnées de la heatmap)
        data = resp.json()
        
        import matplotlib.pyplot as plt
        import numpy as np
        from matplotlib.colors import LinearSegmentedColormap
        
        # Générer l'image depuis les points JSON
        if "points" in data:
            # Heatmap saison
            points_data = data["points"]
            x = []
            y = []
            for p in points_data:
                count = p.get("count", 1)
                # On duplique le point selon son 'count' pour donner plus de poids au kdeplot
                x.extend([p.get("x")] * count)
                y.extend([p.get("y")] * count)
        elif "heatmap" in data:
            # Heatmap match unique
            points_data = data["heatmap"]
            x = [p.get("x") for p in points_data]
            y = [p.get("y") for p in points_data]
        else:
            return None
            
        if not x or not y:
            return None

        # Création du design de la heatmap
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.set_facecolor('#1a1a1a')
        fig.patch.set_facecolor('#1a1a1a')
        
        # Terrain de foot simplifié
        ax.plot([0, 100, 100, 0, 0], [0, 0, 100, 100, 0], color='white', linewidth=2)
        ax.axvline(50, color='white', linewidth=2) # Ligne médiane
        ax.plot([50], [50], 'wo', markersize=4) # Centre
        
        # KDE Plot (Heatmap 2D)
        try:
            import seaborn as sns
            cmap = LinearSegmentedColormap.from_list("custom_heat", ["#1a1a1a", "#00ff85", "#ff003c"])
            sns.kdeplot(x=x, y=y, cmap=cmap, fill=True, alpha=0.7, thresh=0.05, ax=ax, bw_adjust=0.5)
        except ImportError:
            # Fallback simple scatter si seaborn n'est pas installé
            ax.scatter(x, y, c='red', alpha=0.3, s=50)

        ax.set_xlim(0, 100)
        ax.set_ylim(0, 100)
        ax.axis('off')
        
        filename = f"{player_id}_{player_name.replace(' ', '_')}.png"
        filepath = os.path.join(HEATMAPS_DIR, filename)
        
        plt.tight_layout()
        plt.savefig(filepath, format='png', dpi=150, bbox_inches='tight', transparent=True)
        plt.close(fig)
        
        return f"/assets/heatmaps/{filename}"
        
    except Exception as e:
        print(f"  [Heatmap Error] {e}")
        return None

# ── Main Script ──────────────────────────────────────────────────────────
def main():
    print("============================================================")
    print("  🔥 SofaScore Heatmap Scraper (No-Selenium / TheFuzz)")
    print("============================================================")
    
    if not os.path.exists(INPUT_CSV):
        print(f"❌ Fichier {INPUT_CSV} introuvable.")
        return
        
    df = pd.read_csv(INPUT_CSV)
    
    # Ajouter la colonne si elle n'existe pas
    if "Heatmap_Path" not in df.columns:
        df["Heatmap_Path"] = None
        df["SofaScore_ID"] = None

    total = len(df)
    print(f"📊 {total} joueurs à traiter...\n")

    # On peut limiter à 100 pour tester
    for index, row in df.iterrows():
        player_name = str(row.get("Player", ""))
        squad_name = str(row.get("Squad", ""))
        
        # Ignorer si déjà traité
        if pd.notna(row.get("Heatmap_Path")):
            continue
            
        print(f"[{index+1}/{total}] 🔍 Recherche : {player_name} ({squad_name})")
        
        # 1. Mapping ID
        player_id = search_player(player_name, squad_name)
        
        if not player_id:
            print(f"  ❌ Joueur introuvable sur SofaScore.")
            df.at[index, "Heatmap_Path"] = "NOT_FOUND"
        else:
            print(f"  ✅ ID SofaScore : {player_id}")
            df.at[index, "SofaScore_ID"] = player_id
            
            # 2. Récupération Heatmap
            heatmap_path = fetch_and_plot_heatmap(player_id, player_name)
            
            if heatmap_path:
                print(f"  🔥 Heatmap sauvegardée : {heatmap_path}")
                df.at[index, "Heatmap_Path"] = heatmap_path
            else:
                print(f"  ⚠ Pas de heatmap disponible pour cette saison.")
                df.at[index, "Heatmap_Path"] = "NO_HEATMAP"
        
        # 3. Politesse Anti-Ban (2 à 5 secondes)
        delay = random.uniform(2.0, 5.0)
        time.sleep(delay)
        
        # Sauvegarde intermédiaire toutes les 10 lignes
        if index % 10 == 0:
            df.to_csv(OUTPUT_CSV, index=False)

    # Sauvegarde Finale
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\n✅ Scraping terminé. Fichier généré : {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
