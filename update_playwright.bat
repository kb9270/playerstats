@echo off
chcp 65001 > nul
echo ============================================================
echo   PlayerStats - FBref Scraper (Playwright Python)
echo ============================================================
echo.

py --version 2>NUL
if errorlevel 1 (
    echo ERREUR: Python introuvable.
    pause
    exit /b 1
)

echo [1/3] Installation des dependances...
py -m pip install playwright pandas lxml html5lib beautifulsoup4 --quiet
echo     OK!

echo.
echo [2/3] Installation de Chromium pour Playwright...
py -m playwright install chromium
echo     OK!

echo.
echo [3/3] Lancement du scraping (5 ligues)...
echo     Duree estimee: 15-25 minutes.
echo.

cd /d "%~dp0"
py scrape_playwright.py

echo.
echo ============================================================
echo   TERMINE - Redemarrez le serveur Node.js (npm run dev)
echo ============================================================
pause
