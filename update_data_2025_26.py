#!/usr/bin/env python3
"""
====================================================================
  PLAYER ANALYSER - Mise à jour données 2025-2026
  Sources: soccerdata/FBref (stats) + Transfermarkt (valeurs)
====================================================================
"""

import sys
import time
import re
import json
import warnings
import traceback
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup

warnings.filterwarnings('ignore')

# ─── CONFIG ──────────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).parent
OUTPUT_CSV = ROOT_DIR / "players_data_2025_2026.csv"
SEASON = "2025-26"        # format soccerdata

LEAGUES_MAP = {
    # nom soccerdata : infos TM
    "ENG-Premier League": {"tm_code": "GB1", "comp": "eng Premier League", "flag": "eng"},
    "ESP-La Liga":        {"tm_code": "ES1", "comp": "es La Liga",          "flag": "es"},
    "GER-Bundesliga":     {"tm_code": "L1",  "comp": "de Bundesliga",       "flag": "de"},
    "ITA-Serie A":        {"tm_code": "IT1", "comp": "it Serie A",          "flag": "it"},
    "FRA-Ligue 1":        {"tm_code": "FR1", "comp": "fr Ligue 1",          "flag": "fr"},
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Referer": "https://www.transfermarkt.com",
}

TM_BASE = "https://www.transfermarkt.com"
TM_DELAY = 3.5   # secondes entre requêtes TM


# ─── UTILITAIRES ─────────────────────────────────────────────────────────────

def safe_get(url: str, retries=3, delay=TM_DELAY):
    for i in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                return r
            elif r.status_code == 429:
                wait = delay * (i + 3)
                print(f"  ⏳ Rate-limit 429 → attente {wait:.0f}s")
                time.sleep(wait)
            else:
                print(f"  ⚠️  HTTP {r.status_code}")
                time.sleep(delay)
        except Exception as e:
            print(f"  ❌ Réseau ({i+1}/{retries}): {e}")
            time.sleep(delay * (i + 1))
    return None


def normalize(name: str) -> str:
    if not isinstance(name, str):
        return ""
    t = {
        'á':'a','à':'a','â':'a','ä':'a','ã':'a',
        'é':'e','è':'e','ê':'e','ë':'e',
        'í':'i','ì':'i','î':'i','ï':'i',
        'ó':'o','ò':'o','ô':'o','ö':'o','õ':'o',
        'ú':'u','ù':'u','û':'u','ü':'u',
        'ý':'y','ñ':'n','ç':'c','ß':'ss',
        'ø':'o','å':'a','æ':'ae',
    }
    s = name.lower().strip()
    for k, v in t.items():
        s = s.replace(k, v)
    s = re.sub(r"[^a-z0-9 ]", "", s)
    return " ".join(s.split())


# ─── ÉTAPE 1 : SOCCERDATA / FBREF ────────────────────────────────────────────

def collect_fbref_soccerdata() -> pd.DataFrame:
    """
    Utilise la bibliothèque soccerdata (déjà installée) pour récupérer
    les stats joueurs des 5 ligues - saison 2025-26.
    """
    print("\n" + "="*60)
    print("  📊 COLLECTE FBREF via soccerdata")
    print("="*60)

    try:
        import soccerdata as sd
    except ImportError:
        print("❌ soccerdata non installé. Installation…")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "soccerdata", "-q"])
        import soccerdata as sd

    league_keys = list(LEAGUES_MAP.keys())
    all_dfs = []

    # Tables de stats à récupérer
    stat_types = [
        "standard",
        "shooting",
        "passing",
        "possession",
        "defense",
        "misc",
    ]

    for league in league_keys:
        print(f"\n🏆 {league}")
        info = LEAGUES_MAP[league]

        try:
            fbref = sd.FBref(leagues=league, seasons=SEASON)
            league_merged = None

            for stat in stat_types:
                try:
                    print(f"  📥 stats_{stat}…", end=" ", flush=True)
                    df = fbref.read_player_season_stats(stat_type=stat)

                    if df is None or df.empty:
                        print("vide")
                        continue

                    # Aplatir colonnes multi-index si besoin
                    if isinstance(df.columns, pd.MultiIndex):
                        df.columns = [
                            "_".join([str(x) for x in col if not str(x).startswith("Unnamed")]).strip("_")
                            for col in df.columns
                        ]

                    # Suffixer colonnes (sauf clés communes)
                    key_cols = ["player", "team", "league", "season", "nation", "pos", "age", "born", "minutes_90s", "games"]
                    key_cols_found = [c for c in df.columns if c.lower() in key_cols]

                    if stat != "standard" and league_merged is not None:
                        suffix_cols = {c: f"{c}_{stat}" for c in df.columns if c not in key_cols_found}
                        df = df.rename(columns=suffix_cols)

                    df = df.reset_index(drop=True)
                    print(f"{len(df)} joueurs ✅")

                    if league_merged is None:
                        league_merged = df
                    else:
                        # Clé de jointure
                        join_on = [c for c in df.columns if c in (league_merged.columns.tolist()) and c in key_cols_found]
                        if join_on:
                            league_merged = league_merged.merge(df, on=join_on, how="outer", suffixes=("", f"_{stat}"))
                        else:
                            league_merged = pd.concat([league_merged, df], axis=0, ignore_index=True)

                    time.sleep(2)  # respect FBref rate limit

                except Exception as e:
                    print(f"⚠️  {e}")
                    time.sleep(3)

            if league_merged is not None and not league_merged.empty:
                league_merged["_comp"] = info["comp"]
                league_merged["_flag"] = info["flag"]
                league_merged["_league_name"] = league

                # Normaliser colonne nom
                for name_col in ["player", "Player"]:
                    if name_col in league_merged.columns:
                        league_merged["_name_normalized"] = league_merged[name_col].apply(normalize)
                        break

                all_dfs.append(league_merged)
                print(f"  ✅ {league}: {len(league_merged)} entrées")
            else:
                print(f"  ⚠️  Aucune donnée pour {league}")

        except Exception as e:
            print(f"  ❌ Erreur pour {league}: {e}")
            traceback.print_exc()

        time.sleep(5)  # pause entre ligues

    if not all_dfs:
        print("❌ Aucune donnée FBref collectée")
        return pd.DataFrame()

    combined = pd.concat(all_dfs, ignore_index=True)
    print(f"\n✅ FBref total : {len(combined)} entrées joueurs")
    return combined


# ─── ÉTAPE 2 : TRANSFERMARKT ─────────────────────────────────────────────────

def scrape_tm_league(tm_code: str, league_name: str, max_pages=15) -> list[dict]:
    """Scrape les joueurs d'une ligue sur Transfermarkt."""
    players = []
    base_url = f"{TM_BASE}/wettbewerb/startseite/wettbewerb/{tm_code}/saison_id/2025/plus/1"

    for page in range(1, max_pages + 1):
        url = f"{base_url}?page={page}" if page > 1 else base_url
        print(f"  📥 {league_name} – page {page}/{max_pages}…", end=" ", flush=True)

        resp = safe_get(url)
        if resp is None:
            print("échec")
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        # Trouver la table des joueurs
        table = (
            soup.find("table", class_="items") or
            soup.find("table", id=re.compile("yw1"))
        )
        if table is None:
            print(f"table non trouvée")
            break

        rows = table.find_all("tr", class_=["odd", "even"])
        if not rows:
            print("fin des pages")
            break

        page_count = 0
        for row in rows:
            try:
                # Nom + lien
                name_td = row.find("td", class_=re.compile("hauptlink"))
                if not name_td:
                    continue
                a = name_td.find("a")
                if not a:
                    continue
                player_name = a.get_text(strip=True)
                href = a.get("href", "")
                player_id_match = re.search(r"/spieler/(\d+)", href)
                player_id = player_id_match.group(1) if player_id_match else ""
                player_url = TM_BASE + href if href.startswith("/") else href

                # Nationalité (img dans la ligne)
                nat_imgs = row.find_all("img", class_=re.compile("flagge|flaggenrahmen"))
                nationality = nat_imgs[0].get("title", "") if nat_imgs else ""

                # Âge
                age = ""
                # Position
                position = ""
                tds = row.find_all("td")
                for td in tds:
                    cls = " ".join(td.get("class", []))
                    txt = td.get_text(strip=True)
                    if not position and "posrela" in cls:
                        position = txt
                    if not age and re.match(r"^\d{2}$", txt):
                        age = txt

                # Valeur marchande (dans span ou td avec classe)
                mv = ""
                mv_td = row.find("td", class_=re.compile("rechts hauptlink"))
                if mv_td:
                    mv = mv_td.get_text(strip=True)
                else:
                    # Chercher le dernier td avec "€"
                    for td in reversed(tds):
                        t = td.get_text(strip=True)
                        if "€" in t:
                            mv = t
                            break

                # Club actuel
                club = ""
                club_td = row.find("td", class_=re.compile("no-border-links"))
                if club_td:
                    club_a = club_td.find("a")
                    if club_a:
                        club = club_a.get_text(strip=True)

                players.append({
                    "tm_name":         player_name,
                    "tm_id":           player_id,
                    "tm_url":          player_url,
                    "tm_nationality":  nationality,
                    "tm_age":          age,
                    "tm_position":     position,
                    "tm_market_value": mv,
                    "tm_club":         club,
                    "tm_league":       league_name,
                })
                page_count += 1

            except Exception:
                continue

        print(f"{page_count} joueurs")

        if page_count == 0:
            break

        time.sleep(TM_DELAY)

    return players


def parse_market_value(mv_str: str) -> float | None:
    """Convertit '€45.00m' → 45_000_000.0"""
    if not mv_str or mv_str == "-":
        return None
    s = mv_str.lower().replace("€", "").replace(",", ".").strip()
    try:
        if "m" in s:
            return float(s.replace("m", "")) * 1_000_000
        elif "k" in s:
            return float(s.replace("k", "")) * 1_000
        else:
            return float(s)
    except Exception:
        return None


def collect_transfermarkt() -> pd.DataFrame:
    print("\n" + "="*60)
    print("  💰 COLLECTE TRANSFERMARKT - Valeurs marchandes 2025-26")
    print("="*60)

    all_players = []

    for league_key, info in LEAGUES_MAP.items():
        league_name = league_key.split("-", 1)[1]
        tm_code = info["tm_code"]
        print(f"\n🏆 {league_name} ({tm_code})")
        players = scrape_tm_league(tm_code, league_name)
        all_players.extend(players)
        print(f"  ✅ Total {league_name}: {len(players)} joueurs")
        time.sleep(TM_DELAY * 2)

    if not all_players:
        print("⚠️  Aucune donnée Transfermarkt (site peut être protégé)")
        return pd.DataFrame()

    df = pd.DataFrame(all_players)
    df["tm_market_value_eur"] = df["tm_market_value"].apply(parse_market_value)
    df["_name_normalized"] = df["tm_name"].apply(normalize)

    # Dédupliquer (garder la valeur la plus haute si doublon)
    df = df.sort_values("tm_market_value_eur", ascending=False, na_position="last")
    df = df.drop_duplicates(subset=["_name_normalized"], keep="first")

    print(f"\n✅ Transfermarkt total : {len(df)} joueurs uniques")
    print(f"   Avec valeur marchande : {df['tm_market_value_eur'].notna().sum()}")
    return df


# ─── ÉTAPE 3 : FUSION ────────────────────────────────────────────────────────

def merge_data(fbref_df: pd.DataFrame, tm_df: pd.DataFrame) -> pd.DataFrame:
    print("\n" + "="*60)
    print("  🔗 FUSION FBref + Transfermarkt")
    print("="*60)

    # Identifier la colonne nom dans fbref
    player_col = None
    for c in ["player", "Player", "Joueur", "nom"]:
        if c in fbref_df.columns:
            player_col = c
            break

    if player_col and "_name_normalized" not in fbref_df.columns:
        fbref_df["_name_normalized"] = fbref_df[player_col].apply(normalize)

    if tm_df.empty or "_name_normalized" not in tm_df.columns:
        print("⚠️  Pas de données TM à fusionner")
        return fbref_df

    tm_cols = ["_name_normalized", "tm_market_value", "tm_market_value_eur",
               "tm_nationality", "tm_position", "tm_club", "tm_id", "tm_url"]
    tm_cols = [c for c in tm_cols if c in tm_df.columns]

    merged = fbref_df.merge(
        tm_df[tm_cols],
        on="_name_normalized",
        how="left"
    )

    n_matched = merged["tm_market_value"].notna().sum() if "tm_market_value" in merged.columns else 0
    print(f"  ✅ Fusion : {len(merged)} lignes")
    print(f"  💰 Joueurs avec valeur TM : {n_matched}")

    merged.drop(columns=["_name_normalized"], errors="ignore", inplace=True)
    return merged


# ─── ÉTAPE 4 : NETTOYAGE & EXPORT ────────────────────────────────────────────

def finalize(df: pd.DataFrame) -> pd.DataFrame:
    print("\n🧹 Nettoyage final…")

    # Supprimer colonnes 100% vides
    df = df.dropna(axis=1, how="all")

    # Renommer colonnes internes
    df.rename(columns={
        "_comp":        "Comp",
        "_flag":        "Flag",
        "_league_name": "LeagueName",
    }, inplace=True, errors="ignore")

    # Ajouter saison
    df["Season"] = SEASON
    df["DataSource"] = "FBref + Transfermarkt"
    df["UpdatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Reset index
    df = df.reset_index(drop=True)
    df.insert(0, "Rk", range(1, len(df) + 1))

    print(f"  ✅ Dataset : {len(df)} joueurs × {len(df.columns)} colonnes")
    return df


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    t0 = datetime.now()
    print("\n" + "="*60)
    print(f"  🚀 MISE À JOUR PLAYER ANALYSER - {SEASON}")
    print(f"  ⏰ {t0.strftime('%H:%M:%S')}")
    print("="*60)

    # 1 ── FBref via soccerdata
    fbref_df = collect_fbref_soccerdata()

    if fbref_df.empty:
        print("\n❌ Aucune donnée FBref. Abandon.")
        sys.exit(1)

    # 2 ── Transfermarkt
    tm_df = collect_transfermarkt()

    # 3 ── Fusion
    merged = merge_data(fbref_df, tm_df)

    # 4 ── Nettoyage
    final = finalize(merged)

    # 5 ── Sauvegarde
    final.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    elapsed = datetime.now() - t0
    print("\n" + "="*60)
    print(f"  ✅ TERMINÉ EN {elapsed}")
    print(f"  📁 {OUTPUT_CSV}")
    print(f"  👥 {len(final)} joueurs")
    print("="*60)

    # Aperçu colonnes clés
    key_cols = ["player","team","pos","age","goals","assists",
                "tm_market_value","tm_nationality","Comp","Season"]
    show = [c for c in key_cols if c in final.columns]
    if show:
        print("\n📋 Aperçu :")
        print(final[show].head(8).to_string(index=False))


if __name__ == "__main__":
    main()
