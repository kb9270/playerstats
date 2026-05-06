@echo off
chcp 65001 > nul
echo ============================================================
echo   PlayerStats - Mise a jour FBref 2025/26 (Puppeteer)
echo ============================================================
echo.
echo  Aucune installation necessaire - Puppeteer est deja present!
echo  Duree estimee : 20-35 minutes (pauses anti-ban incluses)
echo.

cd /d "%~dp0"
npx tsx scrape_fbref.ts

echo.
if exist "players_data_2025_2026.csv" (
    echo  CSV mis a jour avec succes!
) else (
    echo  ATTENTION: fichier CSV non trouve!
)
echo.
echo  Redemarrez le serveur Node pour recharger les donnees.
pause
