#!/usr/bin/env python3
"""
================================================================================
  ENRICHMENT PIPELINE — FBref Stats + SofaScore Heatmap URLs
  Season 2025-2026 — 5 grands championnats européens
================================================================================

  Rôle :
    1. Charge le CSV players_data_2025_2026.csv (liste d'entrée)
    2. Scrape FBref "Squad Standard Stats" via Playwright Chromium (batch ≤600/ligue)
    3. Fuzzy-match (thefuzz) entre noms FBref ↔ SofaScore API  (seuil >90 %)
    4. Construit les URLs heatmap SofaScore (lazy loading, pas de téléchargement)
    5. Enrichit le CSV d'origine avec stats FBref + colonne Heatmap_URL
    6. Logs structurés dans enrichment.log + unmatched_players.log

  Anti-ban :
    • Pauses aléatoires 10-20 s entre requêtes critiques
    • Rotation User-Agent par ligue
    • Playwright Chromium headless (contourne JS / Cloudflare)

  Dépendances :
    pip install playwright pandas thefuzz[speedup] tqdm requests
    playwright install chromium

  Usage :
    python enrich_players_pipeline.py
================================================================================
"""

import asyncio
import csv
import json
import logging
import os
import random
import re
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd
import requests
from tqdm import tqdm

# ─── Lazy imports (installed at runtime if needed) ────────────────────────────

try:
    from thefuzz import fuzz, process as fuzz_process
except ImportError:
    print("⚙️  Installation de thefuzz…")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "thefuzz[speedup]", "-q"])
    from thefuzz import fuzz, process as fuzz_process

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("⚙️  Installation de playwright…")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright", "-q"])
    subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
    from playwright.async_api import async_playwright


# ══════════════════════════════════════════════════════════════════════════════
#  CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

ROOT_DIR = Path(__file__).parent
INPUT_CSV = ROOT_DIR / "players_data_2025_2026.csv"
OUTPUT_CSV = ROOT_DIR / "players_data_2025_2026_enriched.csv"
HEATMAPS_DIR = ROOT_DIR / "assets" / "heatmaps"
LOG_FILE = ROOT_DIR / "enrichment.log"
UNMATCHED_LOG = ROOT_DIR / "unmatched_players.log"

FUZZY_THRESHOLD = 90  # score >90 pour valider un match

# Pauses anti-ban (secondes)
MIN_DELAY = 10
MAX_DELAY = 20

# FBref Standard Stats URLs par ligue
FBREF_LEAGUES = {
    "eng Premier League": {
        "url": "https://fbref.com/en/comps/9/stats/Premier-League-Stats",
        "comp_prefix": "eng",
    },
    "es La Liga": {
        "url": "https://fbref.com/en/comps/12/stats/La-Liga-Stats",
        "comp_prefix": "es",
    },
    "de Bundesliga": {
        "url": "https://fbref.com/en/comps/20/stats/Bundesliga-Stats",
        "comp_prefix": "de",
    },
    "it Serie A": {
        "url": "https://fbref.com/en/comps/11/stats/Serie-A-Stats",
        "comp_prefix": "it",
    },
    "fr Ligue 1": {
        "url": "https://fbref.com/en/comps/13/stats/Ligue-1-Stats",
        "comp_prefix": "fr",
    },
}

# FBref: additional stat tables to scrape (keeper stats, shooting, etc.)
FBREF_EXTRA_TABLES = {
    "shooting": {
        "eng Premier League": "https://fbref.com/en/comps/9/shooting/Premier-League-Stats",
        "es La Liga":         "https://fbref.com/en/comps/12/shooting/La-Liga-Stats",
        "de Bundesliga":      "https://fbref.com/en/comps/20/shooting/Bundesliga-Stats",
        "it Serie A":         "https://fbref.com/en/comps/11/shooting/Serie-A-Stats",
        "fr Ligue 1":         "https://fbref.com/en/comps/13/shooting/Ligue-1-Stats",
    },
    "keeper": {
        "eng Premier League": "https://fbref.com/en/comps/9/keepers/Premier-League-Stats",
        "es La Liga":         "https://fbref.com/en/comps/12/keepers/La-Liga-Stats",
        "de Bundesliga":      "https://fbref.com/en/comps/20/keepers/Bundesliga-Stats",
        "it Serie A":         "https://fbref.com/en/comps/11/keepers/Serie-A-Stats",
        "fr Ligue 1":         "https://fbref.com/en/comps/13/keepers/Ligue-1-Stats",
    },
    "misc": {
        "eng Premier League": "https://fbref.com/en/comps/9/misc/Premier-League-Stats",
        "es La Liga":         "https://fbref.com/en/comps/12/misc/La-Liga-Stats",
        "de Bundesliga":      "https://fbref.com/en/comps/20/misc/Bundesliga-Stats",
        "it Serie A":         "https://fbref.com/en/comps/11/misc/Serie-A-Stats",
        "fr Ligue 1":         "https://fbref.com/en/comps/13/misc/Ligue-1-Stats",
    },
}

# User-Agent rotation per league (anti-fingerprint)
USER_AGENTS = {
    "eng Premier League": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "es La Liga": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/17.3 Safari/605.1.15"
    ),
    "de Bundesliga": (
        "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0"
    ),
    "it Serie A": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
    ),
    "fr Ligue 1": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/109.0.0.0"
    ),
}

# SofaScore
SOFASCORE_SEARCH_API = "https://www.sofascore.com/api/v1/search/all"
SOFASCORE_HEATMAP_TPL = "https://api.sofascore.app/api/v1/player/{player_id}/heatmap/overall"
SOFASCORE_HEADERS = {
    "Accept": "application/json",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Origin": "https://www.sofascore.com",
    "Referer": "https://www.sofascore.com/",
    "Cache-Control": "no-cache"
}


# ══════════════════════════════════════════════════════════════════════════════
#  LOGGING SETUP
# ══════════════════════════════════════════════════════════════════════════════

def setup_logging():
    """Configure dual logging: console + file."""
    logger = logging.getLogger("enrichment")
    logger.setLevel(logging.DEBUG)

    # File handler (detailed)
    fh = logging.FileHandler(LOG_FILE, mode="w", encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(
        "%(asctime)s │ %(levelname)-8s │ %(message)s", datefmt="%H:%M:%S"
    ))
    logger.addHandler(fh)

    # Console handler (info+)
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(ch)

    return logger


log = setup_logging()

# Unmatched logger
unmatched_logger = logging.getLogger("unmatched")
uh = logging.FileHandler(UNMATCHED_LOG, mode="w", encoding="utf-8")
uh.setFormatter(logging.Formatter("%(asctime)s │ %(message)s", datefmt="%H:%M:%S"))
unmatched_logger.addHandler(uh)
unmatched_logger.setLevel(logging.DEBUG)


# ══════════════════════════════════════════════════════════════════════════════
#  UTILITY FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def normalize_name(name: str) -> str:
    """Normalize a player name: remove diacritics, lowercase, strip punctuation."""
    if not isinstance(name, str):
        return ""
    # NFD decompose → remove combining chars
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_only = "".join(c for c in nfkd if not unicodedata.combining(c))
    # Lowercase, remove non-alnum except spaces
    cleaned = re.sub(r"[^a-zA-Z0-9 ]", "", ascii_only.lower())
    return " ".join(cleaned.split())


def anti_ban_pause(label: str = ""):
    """Random pause between MIN_DELAY and MAX_DELAY seconds."""
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    log.debug(f"⏳ Pause anti-ban {delay:.1f}s {label}")
    time.sleep(delay)


def build_heatmap_filename(player_id: int | str) -> str:
    """Standard filename for deferred image download."""
    return f"{player_id}.png"


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 1 — LOAD INPUT CSV
# ══════════════════════════════════════════════════════════════════════════════

def load_input_csv() -> pd.DataFrame:
    """Load and validate the input CSV."""
    log.info(f"\n{'═'*70}")
    log.info(f"  📂 CHARGEMENT CSV : {INPUT_CSV.name}")
    log.info(f"{'═'*70}")

    if not INPUT_CSV.exists():
        log.error(f"❌ Fichier introuvable : {INPUT_CSV}")
        sys.exit(1)

    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig")
    log.info(f"  ✅ {len(df)} joueurs chargés — {len(df.columns)} colonnes")
    log.info(f"  📋 Colonnes : {', '.join(df.columns[:10])}…")

    # Extract unique player names
    players = df["Player"].dropna().unique().tolist()
    log.info(f"  👥 {len(players)} joueurs uniques")

    return df


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 2 — SCRAPE FBREF VIA PLAYWRIGHT CHROMIUM
# ══════════════════════════════════════════════════════════════════════════════

async def scrape_fbref_league(browser, league_name: str, url: str) -> pd.DataFrame:
    """
    Scrape a single FBref Standard Stats page using Playwright Chromium.
    Returns a cleaned DataFrame of player stats.
    """
    ua = USER_AGENTS.get(league_name, USER_AGENTS["eng Premier League"])
    context = await browser.new_context(user_agent=ua)
    page = await context.new_page()

    try:
        log.info(f"  🌐 Navigation → {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=90000)

        # Wait for the stats table to render
        await page.wait_for_selector(
            "table[id^='stats_standard']",
            timeout=45000
        )
        log.debug(f"  ✅ Table stats_standard détectée pour {league_name}")

        # Give extra time for lazy-loaded elements
        await asyncio.sleep(3)

        # Extract HTML content
        content = await page.content()

        # Parse with pandas
        dfs = pd.read_html(content, flavor="lxml")

        # Find the standard stats table
        target_df = None
        for candidate in dfs:
            cols_str = " ".join(str(c) for c in candidate.columns)
            if "Player" in cols_str and ("Gls" in cols_str or "Goals" in cols_str):
                target_df = candidate
                break

        if target_df is None:
            # Fallback: try the largest table
            target_df = max(dfs, key=len) if dfs else None

        if target_df is None:
            log.warning(f"  ⚠️  Aucune table trouvée pour {league_name}")
            return pd.DataFrame()

        # Flatten MultiIndex columns
        if isinstance(target_df.columns, pd.MultiIndex):
            new_cols = []
            for col in target_df.columns:
                parts = [str(c) for c in col if "Unnamed" not in str(c)]
                new_cols.append("_".join(parts) if parts else str(col))
            target_df.columns = new_cols

        # Remove repeated header rows (FBref quirk)
        if "Player" in target_df.columns:
            target_df = target_df[target_df["Player"] != "Player"]
        elif any("Player" in str(c) for c in target_df.columns):
            player_col = [c for c in target_df.columns if "Player" in str(c)][0]
            target_df = target_df[target_df[player_col] != "Player"]

        target_df = target_df.reset_index(drop=True)
        log.info(f"  ✅ {league_name} : {len(target_df)} joueurs extraits")

        return target_df

    except Exception as e:
        log.error(f"  ❌ Erreur scraping {league_name}: {e}")
        return pd.DataFrame()

    finally:
        await page.close()
        await context.close()


async def scrape_all_fbref(browser) -> dict[str, pd.DataFrame]:
    """
    Scrape all 5 leagues from FBref using Playwright Chromium.
    Returns dict { league_name: DataFrame }.
    """
    log.info(f"\n{'═'*70}")
    log.info(f"  📊 ÉTAPE 2 — SCRAPING FBREF (Playwright Chromium)")
    log.info(f"{'═'*70}")

    results = {}

    league_items = list(FBREF_LEAGUES.items())
    pbar = tqdm(league_items, desc="🏆 Scraping FBref", unit="ligue")

    for league_name, config in pbar:
        pbar.set_postfix_str(league_name)
        log.info(f"\n🏆 {league_name}")

        df = await scrape_fbref_league(browser, league_name, config["url"])
        if not df.empty:
            df["_league"] = league_name
            results[league_name] = df

        # Anti-ban delay between leagues
        if league_name != league_items[-1][0]:
            delay = random.uniform(MIN_DELAY, MAX_DELAY)
            pbar.set_description(f"⏳ Pause {delay:.0f}s")
            await asyncio.sleep(delay)
            pbar.set_description("🏆 Scraping FBref")

    total = sum(len(df) for df in results.values())
    log.info(f"\n  📊 FBref total : {total} entrées joueurs across {len(results)} ligues")

    return results


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 3 — SOFASCORE SEARCH + FUZZY MATCHING
# ══════════════════════════════════════════════════════════════════════════════

async def fetch_team_roster(page, team_name: str) -> list[dict]:
    """
    1. Search SofaScore for the Team ID
    2. Fetch the Team's full player roster
    Returns list of SofaScore player items.
    """
    try:
        # Search Team
        url = f"{SOFASCORE_SEARCH_API}?q={team_name.replace(' ', '%20')}"
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        
        content = await page.inner_text("body")
        if "Just a moment" in content or "Un instant" in content:
            log.warning(f"  ⚠️  Cloudflare sur {team_name}, pause...")
            await asyncio.sleep(8)
            content = await page.inner_text("body")
            
        data = json.loads(content)
        results = data.get("results", [])
        
        # Find the team ID
        team_entity = next((r.get("entity") for r in results if r.get("type") == "team"), None)
        if not team_entity:
            log.warning(f"  ❌ Club non trouvé sur SofaScore : '{team_name}'")
            return []
            
        team_id = team_entity.get("id")
        
        # Fetch Roster
        roster_url = f"https://www.sofascore.com/api/v1/team/{team_id}/players"
        await page.goto(roster_url, wait_until="domcontentloaded", timeout=20000)
        
        roster_data = json.loads(await page.inner_text("body"))
        return roster_data.get("players", [])
        
    except Exception as e:
        log.error(f"  Failed fetching roster for {team_name}: {e}")
        return []


def fuzzy_match_sofascore(
    fbref_name: str,
    sofascore_candidates: list[dict],
) -> tuple[dict | None, int]:
    """
    Find best fuzzy match between FBref name and SofaScore candidates.
    """
    if not sofascore_candidates:
        return None, 0

    best_match = None
    best_score = 0

    fbref_norm = normalize_name(fbref_name)

    for candidate in sofascore_candidates:
        sofa_name = candidate.get("name", "")
        if not sofa_name:
            sofa_name = candidate.get("shortName", "")
        sofa_norm = normalize_name(sofa_name)

        score_ratio = fuzz.ratio(fbref_norm, sofa_norm)
        score_partial = fuzz.partial_ratio(fbref_norm, sofa_norm)
        score_sort = fuzz.token_sort_ratio(fbref_norm, sofa_norm)
        score_set = fuzz.token_set_ratio(fbref_norm, sofa_norm)

        score = max(score_ratio, score_partial, score_sort, score_set)

        if score > best_score:
            best_score = score
            best_match = candidate

    if best_score > FUZZY_THRESHOLD:
        return best_match, best_score
    else:
        return None, best_score


async def enrich_with_sofascore(browser, original_df: pd.DataFrame) -> dict[str, dict]:
    """
    (OPTIMIZED) Fetch complete team rosters first, then match offline.
    Returns dict { player_name: { sofascore_id, heatmap_url, match_score } }
    """
    log.info(f"\n{'═'*70}")
    log.info(f"  ⚡ ÉTAPE 3 — RECHERCHE SOFASCORE PAR ÉQUIPES (Hyper Rapide)")
    log.info(f"{'═'*70}")
    
    # Extract unique valid teams
    teams = original_df["Squad"].dropna().unique().tolist()
    log.info(f"  🏟️  Extraction de {len(teams)} effectifs complets au lieu de {len(original_df)} joueurs !")
    
    # ── 1. Fetch all rosters
    context = await browser.new_context(user_agent=SOFASCORE_HEADERS["User-Agent"])
    page = await context.new_page()
    await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    global_roster = []
    
    pbar_teams = tqdm(teams, desc="🏟️ Scraping Effectifs", unit="club")
    for idx, team_name in enumerate(pbar_teams):
        pbar_teams.set_postfix_str(team_name[:15])
        
        roster = await fetch_team_roster(page, team_name)
        # Add FBRef team mapping info to avoid cross-team mismatches
        for p in roster:
            player_info = p.get("player", {})
            player_info["_fbref_squad"] = team_name
            global_roster.append(player_info)
            
        if idx % 10 == 0 and idx != 0:
            delay = random.uniform(2, 4)
            pbar_teams.set_description(f"⏳ Pause {delay:.1f}s")
            await asyncio.sleep(delay)
            pbar_teams.set_description("🏟️ Scraping Effectifs")
        else:
            await asyncio.sleep(random.uniform(0.5, 1.5))

    await page.close()
    await context.close()
    
    log.info(f"  ✅ {len(global_roster)} joueurs chargés en mémoire pour le matching hors-ligne.")

    # ── 2. Offline Fuzzy Matching
    log.info(f"\n  🔍 MATCHING HORS-LIGNE (Seuil : > {FUZZY_THRESHOLD}%)")
    results = {}
    matched = 0
    unmatched = 0

    records = original_df.to_dict("records")
    pbar_match = tqdm(records, desc="⚡ Appariement Rapide", unit="joueur")
    
    for row in pbar_match:
        player_name = row.get("Player")
        team_name = row.get("Squad")
        
        if pd.isna(player_name):
            continue
            
        # Filter candidates strictly by same team to completely eliminate errors
        team_candidates = [p for p in global_roster if p.get("_fbref_squad") == team_name]
        
        # Fuzzy match inside that specific team 
        best_match, score = fuzzy_match_sofascore(player_name, team_candidates)

        if best_match and score > FUZZY_THRESHOLD:
            player_id = best_match.get("id")
            sofa_name = best_match.get("name", best_match.get("shortName", "?"))
            heatmap_url = SOFASCORE_HEATMAP_TPL.format(player_id=player_id)
            heatmap_file = build_heatmap_filename(player_id)

            results[player_name] = {
                "sofascore_id": player_id,
                "sofascore_name": sofa_name,
                "heatmap_url": heatmap_url,
                "heatmap_file": f"assets/heatmaps/{heatmap_file}",
                "match_score": score,
                "status": "matched",
            }
            matched += 1
        else:
            sofa_name = best_match.get("name", "?") if best_match else "N/A"
            results[player_name] = {
                "sofascore_id": None,
                "heatmap_url": None,
                "match_score": score,
                "status": "below_threshold",
            }
            unmatched += 1
            unmatched_logger.info(
                f"LOW_SCORE │ '{player_name} ({team_name})' ↔ '{sofa_name}' │ score={score}"
            )

    log.info(f"\n  📊 Résultats SofaScore :")
    log.info(f"     ✅ Matchés   : {matched} ({matched/max(len(records),1)*100:.1f}%)")
    log.info(f"     ❌ Non-matchés: {unmatched}")
    
    return results


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 4 — MERGE & ENRICH CSV
# ══════════════════════════════════════════════════════════════════════════════

def merge_fbref_data(
    original_df: pd.DataFrame,
    fbref_data: dict[str, pd.DataFrame],
) -> pd.DataFrame:
    """
    Match FBref scraped data back to the original CSV using Player+Squad+Comp
    as composite key. Add any new stats columns not in the original.
    """
    log.info(f"\n{'═'*70}")
    log.info(f"  🔗 ÉTAPE 4a — FUSION DES STATS FBREF")
    log.info(f"{'═'*70}")

    if not fbref_data:
        log.warning("  ⚠️  Aucune donnée FBref à fusionner")
        return original_df

    # Combine all league dataframes
    all_fbref = pd.concat(fbref_data.values(), ignore_index=True)
    log.info(f"  📊 FBref combiné : {len(all_fbref)} lignes × {len(all_fbref.columns)} colonnes")

    # Identify matching columns between original and scraped
    original_cols = set(original_df.columns)
    fbref_cols = set(all_fbref.columns)
    new_cols = fbref_cols - original_cols - {"_league"}

    if new_cols:
        log.info(f"  🆕 {len(new_cols)} nouvelles colonnes: {', '.join(sorted(new_cols)[:10])}…")

    # Normalize player names for matching
    original_df["_match_key"] = (
        original_df["Player"].apply(normalize_name) + "|" +
        original_df["Squad"].fillna("").apply(normalize_name)
    )

    if "Player" in all_fbref.columns:
        all_fbref["_match_key"] = (
            all_fbref["Player"].apply(normalize_name) + "|" +
            all_fbref.get("Squad", pd.Series([""] * len(all_fbref))).fillna("").apply(normalize_name)
        )
    else:
        # Try to find player name column
        name_col = next(
            (c for c in all_fbref.columns if "player" in c.lower()),
            None
        )
        if name_col:
            all_fbref["_match_key"] = all_fbref[name_col].apply(normalize_name) + "|"
        else:
            log.error("  ❌ Impossible de trouver la colonne Player dans FBref")
            return original_df

    # Merge only new columns
    if new_cols:
        merge_cols = ["_match_key"] + list(new_cols)
        merge_data = all_fbref[[c for c in merge_cols if c in all_fbref.columns]]
        merge_data = merge_data.drop_duplicates(subset=["_match_key"], keep="first")

        original_df = original_df.merge(
            merge_data,
            on="_match_key",
            how="left",
            suffixes=("", "_fbref_new"),
        )

    original_df.drop(columns=["_match_key"], errors="ignore", inplace=True)
    log.info(f"  ✅ CSV enrichi : {len(original_df)} lignes × {len(original_df.columns)} colonnes")

    return original_df


def add_sofascore_columns(
    df: pd.DataFrame,
    sofascore_results: dict[str, dict],
) -> pd.DataFrame:
    """Add Heatmap_URL and SofaScore_ID columns to the DataFrame."""
    log.info(f"\n{'═'*70}")
    log.info(f"  🔗 ÉTAPE 4b — AJOUT COLONNES SOFASCORE")
    log.info(f"{'═'*70}")

    df["SofaScore_ID"] = df["Player"].map(
        lambda p: sofascore_results.get(p, {}).get("sofascore_id")
    )
    df["Heatmap_URL"] = df["Player"].map(
        lambda p: sofascore_results.get(p, {}).get("heatmap_url")
    )
    df["Heatmap_File"] = df["Player"].map(
        lambda p: sofascore_results.get(p, {}).get("heatmap_file")
    )
    df["SofaScore_Match_Score"] = df["Player"].map(
        lambda p: sofascore_results.get(p, {}).get("match_score")
    )

    n_with_url = df["Heatmap_URL"].notna().sum()
    log.info(f"  ✅ {n_with_url} joueurs avec Heatmap_URL ({n_with_url/len(df)*100:.1f}%)")

    return df


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 5 — FINALIZE & EXPORT
# ══════════════════════════════════════════════════════════════════════════════

def finalize_and_export(df: pd.DataFrame):
    """Clean up, reorder columns, and export to CSV."""
    log.info(f"\n{'═'*70}")
    log.info(f"  💾 ÉTAPE 5 — EXPORT FINAL")
    log.info(f"{'═'*70}")

    # Ensure heatmaps directory exists (for future lazy downloads)
    HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)
    log.info(f"  📁 Répertoire heatmaps : {HEATMAPS_DIR}")

    # Add metadata
    df["Enriched_At"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    df["Enrichment_Source"] = "FBref + SofaScore"

    # Drop internal columns
    internal_cols = [c for c in df.columns if c.startswith("_")]
    df.drop(columns=internal_cols, errors="ignore", inplace=True)

    # Priority column order: keep original columns first, then new ones
    original_cols = [
        "Rk", "Player", "Nation", "Pos", "Squad", "Comp", "Age", "Born",
        "MP", "Starts", "Min", "90s", "Gls", "Ast", "G+A", "G-PK",
        "PK", "PKatt", "CrdY", "CrdR",
    ]
    sofascore_cols = [
        "SofaScore_ID", "Heatmap_URL", "Heatmap_File", "SofaScore_Match_Score",
    ]
    metadata_cols = ["Enriched_At", "Enrichment_Source"]

    # Build final column order
    existing_priority = [c for c in original_cols if c in df.columns]
    sofa_existing = [c for c in sofascore_cols if c in df.columns]
    meta_existing = [c for c in metadata_cols if c in df.columns]
    remaining = [
        c for c in df.columns
        if c not in existing_priority + sofa_existing + meta_existing
    ]

    final_order = existing_priority + remaining + sofa_existing + meta_existing
    df = df[[c for c in final_order if c in df.columns]]

    # Export
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    log.info(f"  ✅ Fichier exporté : {OUTPUT_CSV.name}")
    log.info(f"     📊 {len(df)} joueurs × {len(df.columns)} colonnes")
    log.info(f"     💾 Taille : {OUTPUT_CSV.stat().st_size / 1024:.0f} KB")

    # Also overwrite original CSV as a convenience (backup first)
    backup = INPUT_CSV.with_suffix(".csv.bak")
    if INPUT_CSV.exists():
        import shutil
        shutil.copy2(INPUT_CSV, backup)
        log.info(f"  📦 Backup original → {backup.name}")

    return df


# ══════════════════════════════════════════════════════════════════════════════
#  STEP 6 — LAZY DOWNLOAD STUB
# ══════════════════════════════════════════════════════════════════════════════

def generate_lazy_download_script(sofascore_results: dict[str, dict]):
    """
    Generate a standalone script that can be run later to download
    all heatmap images. This follows the lazy-loading requirement.
    """
    script_path = ROOT_DIR / "download_heatmaps.py"

    entries = []
    for player_name, data in sofascore_results.items():
        if data.get("sofascore_id") and data.get("heatmap_url"):
            entries.append({
                "player": player_name,
                "id": data["sofascore_id"],
                "url": data["heatmap_url"],
                "file": data.get("heatmap_file", f"assets/heatmaps/{data['sofascore_id']}.png"),
            })

    script_content = f'''#!/usr/bin/env python3
"""
Lazy Heatmap Downloader — Generated {datetime.now().strftime("%Y-%m-%d %H:%M")}
Downloads SofaScore heatmap images for {len(entries)} matched players.
Run: python download_heatmaps.py
"""
import os, time, random, requests
from pathlib import Path
from tqdm import tqdm

ROOT = Path(__file__).parent
HEATMAPS_DIR = ROOT / "assets" / "heatmaps"
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {{
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    "Accept": "image/png,image/*",
}}

PLAYERS = {json.dumps(entries, indent=2, ensure_ascii=False)}

def download():
    ok, fail = 0, 0
    for p in tqdm(PLAYERS, desc="Downloading heatmaps"):
        filepath = ROOT / p["file"]
        if filepath.exists():
            ok += 1
            continue
        try:
            r = requests.get(p["url"], headers=HEADERS, timeout=30)
            if r.status_code == 200:
                filepath.parent.mkdir(parents=True, exist_ok=True)
                filepath.write_bytes(r.content)
                ok += 1
            else:
                print(f"  HTTP {{r.status_code}} for {{p['player']}}")
                fail += 1
        except Exception as e:
            print(f"  Error {{p['player']}}: {{e}}")
            fail += 1
        time.sleep(random.uniform(2, 5))
    print(f"\\nDone: {{ok}} downloaded, {{fail}} failed")

if __name__ == "__main__":
    download()
'''

    script_path.write_text(script_content, encoding="utf-8")
    log.info(f"  📝 Script lazy-download généré : {script_path.name} ({len(entries)} heatmaps)")


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

async def run_pipeline():
    """Main orchestration of the enrichment pipeline."""
    t0 = datetime.now()

    log.info(f"\n{'═'*70}")
    log.info(f"  🚀 PIPELINE D'ENRICHISSEMENT — SAISON 2025-2026")
    log.info(f"  ⏰ Démarrage : {t0.strftime('%Y-%m-%d %H:%M:%S')}")
    log.info(f"  📋 Sources : FBref (stats) + SofaScore (heatmaps)")
    log.info(f"  🎯 Fuzzy threshold : > {FUZZY_THRESHOLD}%")
    log.info(f"  ⏳ Délai anti-ban : {MIN_DELAY}-{MAX_DELAY}s")
    log.info(f"{'═'*70}")

    # ── Step 1: Load CSV
    original_df = load_input_csv()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ]
        )

        # ── Step 2: Scrape FBref
        fbref_data = await scrape_all_fbref(browser)

        # ── Step 3: SofaScore matching par équipes
        sofascore_results = await enrich_with_sofascore(browser, original_df)
        
        await browser.close()

    # ── Step 4: Merge & Enrich
    enriched_df = merge_fbref_data(original_df, fbref_data)
    enriched_df = add_sofascore_columns(enriched_df, sofascore_results)

    # ── Step 5: Export
    final_df = finalize_and_export(enriched_df)

    # ── Step 6: Generate lazy download script
    generate_lazy_download_script(sofascore_results)

    # ── Summary
    elapsed = datetime.now() - t0

    log.info(f"\n{'═'*70}")
    log.info(f"  ✅ PIPELINE TERMINÉ EN {elapsed}")
    log.info(f"{'═'*70}")
    log.info(f"  📁 CSV enrichi       : {OUTPUT_CSV.name}")
    log.info(f"  👥 Total joueurs     : {len(final_df)}")
    log.info(f"  🏠 Heatmaps URLs     : {final_df['Heatmap_URL'].notna().sum()}")
    log.info(f"  📝 Logs              : {LOG_FILE.name}")
    log.info(f"  ⚠️  Non-matchés       : {UNMATCHED_LOG.name}")
    log.info(f"  📥 Lazy downloader   : download_heatmaps.py")
    log.info(f"{'═'*70}")

    # Print fuzzy matching examples
    log.info(f"\n  📋 Exemples de matching :")
    examples = [
        (name, data)
        for name, data in list(sofascore_results.items())[:5]
        if data.get("match_score", 0) > 0
    ]
    for name, data in examples:
        status = "✅" if data.get("status") == "matched" else "❌"
        sofa_name = data.get("sofascore_name", "N/A")
        score = data.get("match_score", 0)
        log.info(f"     {status} '{name}' ↔ '{sofa_name}' — score={score}")


def main():
    """Entry point."""
    # Playwright requires ProactorEventLoop on Windows (default in Python 3.8+)
    # Do NOT set WindowsSelectorEventLoopPolicy — it breaks Playwright subprocess transport
    asyncio.run(run_pipeline())


if __name__ == "__main__":
    main()
