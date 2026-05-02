@echo off
chcp 65001 > nul
echo ============================================================
echo   PlayerStats - SofaScore Heatmap Scraper
echo ============================================================
echo.

py --version 2>NUL
if errorlevel 1 (
    echo ERREUR: Python introuvable.
    pause
    exit /b 1
)

echo [1/3] Installation des dependances...
py -m pip install requests pandas thefuzz python-Levenshtein matplotlib seaborn --quiet
echo     OK!

echo.
echo [2/3] Verification des dossiers...
if not exist "client\public\assets\heatmaps" (
    mkdir "client\public\assets\heatmaps"
)
echo     OK!

echo.
echo [3/3] Lancement du scraping (2-5s par joueur par politesse)...
echo     Attention: Peut prendre plusieurs heures pour 3000 joueurs.
echo     Le script sauvegarde toutes les 10 lignes. Vous pouvez 
echo     fermer et relancer plus tard (il reprendra ou il s'est arrete).
echo.

cd /d "%~dp0"
py scrape_sofascore.py

echo.
echo ============================================================
echo   TERMINE - N'oubliez pas d'utiliser le nouveau fichier
echo   players_data_2025_2026_enriched.csv !
echo ============================================================
pause
