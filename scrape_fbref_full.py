"""
scrape_fbref_full.py  (v2 — via soccerdata)
============================================
Mise à jour du CSV players_data_2025_2026.csv depuis FBref.
Utilise la lib `soccerdata` qui gère le bypass anti-bot FBref.

Installation (1 seule fois) :
    pip install soccerdata pandas tqdm

Puis :
    py scrape_fbref_full.py
"""

import os, sys, time, random, shutil
import pandas as pd
from tqdm import tqdm

OUTPUT_FILE  = "players_data_2025_2026.csv"
BACKUP_FILE  = "players_data_2025_2026_backup.csv"
BLOCK_SIZE   = 100  # joueurs par bloc dans les logs

# Mapping soccerdata → nom affiché
LEAGUES = {
    "ENG-Premier League": "Premier League",
    "ESP-La Liga":        "La Liga",
    "GER-Bundesliga":     "Bundesliga",
    "ITA-Serie A":        "Serie A",
    "FRA-Ligue 1":        "Ligue 1",
}

# Types de stats à récupérer
STAT_TYPES = [
    "standard",
    "shooting",
    "passing",
    "possession",
    "defense",
    "misc",
]

# ── Vérification des dépendances ────────────────────────────────
def check_deps():
    missing = []
    try:
        import soccerdata  # noqa
    except ImportError:
        missing.append("soccerdata")
    try:
        import pandas  # noqa
    except ImportError:
        missing.append("pandas")
    try:
        import tqdm  # noqa
    except ImportError:
        missing.append("tqdm")

    if missing:
        print(f"\n❌ Dépendances manquantes : {', '.join(missing)}")
        print("   Lance cette commande puis relance le script :")
        print(f"   pip install {' '.join(missing)}\n")
        sys.exit(1)


# ── Log par blocs ───────────────────────────────────────────────
def log_block(df: pd.DataFrame, block_num: int):
    start = block_num * BLOCK_SIZE
    end   = min(start + BLOCK_SIZE, len(df))
    block = df.iloc[start:end]
    print(f"\n  📦 Bloc {block_num + 1} ({start+1}–{end}) :")
    for _, row in block.iterrows():
        try:
            # Les colonnes peuvent être MultiIndex ou simples
            player = str(row.get("player", row.get("Player", "?")))
            team   = str(row.get("team",   row.get("Squad",  "?")))
            gls    = row.get("goals",  row.get("Gls", "?"))
            ast    = row.get("assists",row.get("Ast", "?"))
            xg     = row.get("xg",     row.get("xG",  "?"))
            print(f"     {player:<30} | {team:<22} | G:{gls}  A:{ast}  xG:{xg}")
        except Exception:
            print(f"     (ligne illisible)")


# ── Scraping principal ──────────────────────────────────────────
def scrape_all() -> pd.DataFrame | None:
    import soccerdata as sd

    league_keys  = list(LEAGUES.keys())
    season       = "2425"          # soccerdata encode 2024-25 → "2425"
    all_frames   = []

    print(f"\n{'='*62}")
    print(f"  🚀 PlayerStats — Scraping FBref via soccerdata")
    print(f"  📅 Saison 2025/26 · 5 ligues · {len(STAT_TYPES)} types de stats")
    print(f"{'='*62}\n")

    fbref = sd.FBref(
        leagues=league_keys,
        seasons=[season],
        # soccerdata utilise un cache local dans ~/soccerdata
        # pour éviter de re-télécharger si relancé le même jour
    )

    for stat_type in tqdm(STAT_TYPES, desc="Types de stats"):
        print(f"\n\n📥 Récupération : {stat_type.upper()} ...")
        try:
            df = fbref.read_player_season_stats(stat_type=stat_type)

            # Aplatir le MultiIndex de colonnes si présent
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = ["_".join(filter(None, map(str, c))).strip("_")
                               for c in df.columns]

            # Reset index pour avoir player/team comme colonnes
            df = df.reset_index()

            # Normaliser les noms de colonnes (minuscules)
            df.columns = [c.lower() for c in df.columns]

            print(f"   ✅ {len(df)} lignes · {len(df.columns)} colonnes")

            # Log par blocs
            n_blocks = (len(df) // BLOCK_SIZE) + (1 if len(df) % BLOCK_SIZE else 0)
            for b in range(n_blocks):
                log_block(df, b)

            all_frames.append((stat_type, df))

            # Pause polie entre les types (même si soccerdata en a déjà une)
            pause = random.uniform(8, 15)
            print(f"\n  ⏳ Pause {pause:.0f}s...")
            time.sleep(pause)

        except Exception as e:
            print(f"   ⚠ Échec {stat_type} : {e}")
            continue

    if not all_frames:
        print("\n❌ Aucune donnée récupérée.")
        return None

    # ── Fusion de tous les types sur (player, team, league, season) ──
    print(f"\n\n{'='*62}")
    print("📊 Fusion des tables...")

    KEY_COLS = ["player", "team", "league", "season", "pos", "age", "born",
                "mp", "starts", "min"]

    base_stat, base_df = all_frames[0]
    # Garder uniquement les colonnes de base + stats
    merged = base_df.copy()

    for stat_type, df in all_frames[1:]:
        # Colonnes clés communes
        key = [c for c in ["player", "team", "league"] if c in df.columns]
        # Colonnes extra (pas déjà dans merged)
        extra = [c for c in df.columns
                 if c not in merged.columns and c not in key]
        if not extra:
            continue
        try:
            merged = merged.merge(
                df[key + extra],
                on=key,
                how="left",
                suffixes=("", f"_{stat_type}")
            )
        except Exception as e:
            print(f"  ⚠ Merge {stat_type} ignoré : {e}")

    # ── Renommage en majuscules (compatibilité avec le serveur Node) ──
    rename_map = {
        "player": "Player", "team": "Squad", "league": "League",
        "season": "Season", "pos": "Pos", "age": "Age", "born": "Born",
        "mp": "MP", "starts": "Starts", "min": "Min",
        "goals": "Gls", "assists": "Ast",
        "xg": "xG", "xg_xa": "xAG",
        "progressive_carries": "PrgC", "progressive_passes": "PrgP",
        "tackles_won": "TklW", "interceptions": "Int",
        "shots_total": "Sh", "passes_pct": "Cmp%",
        "npxg": "npxG",
    }
    merged = merged.rename(columns={k: v for k, v in rename_map.items()
                                     if k in merged.columns})

    # ── Déduplications ──────────────────────────────────────────
    key_dedup = [c for c in ["Player", "Squad"] if c in merged.columns]
    if key_dedup:
        merged = merged.drop_duplicates(subset=key_dedup, keep="first")

    print(f"   ✅ {len(merged)} joueurs · {len(merged.columns)} colonnes")
    return merged


# ── Main ────────────────────────────────────────────────────────
def main():
    check_deps()

    # Backup
    if os.path.exists(OUTPUT_FILE):
        shutil.copy2(OUTPUT_FILE, BACKUP_FILE)
        old = pd.read_csv(OUTPUT_FILE)
        print(f"💾 Backup : {BACKUP_FILE} ({len(old)} joueurs)")

    result = scrape_all()

    if result is None or result.empty:
        print("\n❌ Rien à sauvegarder.")
        return

    result.to_csv(OUTPUT_FILE, index=False)
    print(f"\n\n{'='*62}")
    print(f"✅ CSV sauvegardé : {OUTPUT_FILE}")
    print(f"   {len(result)} joueurs · {len(result.columns)} colonnes")

    # Top 10 buteurs
    if "Gls" in result.columns:
        result["Gls"] = pd.to_numeric(result["Gls"], errors="coerce")
        top = result.nlargest(10, "Gls")[
            [c for c in ["Player", "Squad", "League", "Gls", "Ast", "xG"]
             if c in result.columns]
        ]
        print("\n🏅 Top 10 buteurs :")
        print(top.to_string(index=False))

    print("\n🎉 Mise à jour terminée ! Redémarre le serveur Node.js pour recharger.")
    print("   → npm run dev  (port 5002)\n")


if __name__ == "__main__":
    main()
