import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import csv from "papaparse";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("🚀 Lancement de l'extraction ultime via Puppeteer Stealth...");
    
    if (!fs.existsSync(CSV_FILE)) {
        console.error("❌ Fichier introuvable.");
        return;
    }
    
    const content = fs.readFileSync(CSV_FILE, "utf-8");
    const parsed = csv.parse(content, { header: true, skipEmptyLines: true });
    
    const missingPlayers = parsed.data.filter(row => !row.fbref_id || row.fbref_id.trim() === "");
    console.log(`🎯 ${missingPlayers.length} joueurs manquants à récupérer !`);
    
    if (missingPlayers.length === 0) return;

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox", "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled"
        ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    console.log("🌐 Initialisation FBref...");
    await page.goto("https://fbref.com/en/", { waitUntil: "networkidle0" });
    await sleep(3000);

    let patchedCount = 0;
    
    for (let i = 0; i < missingPlayers.length; i++) {
        const row = missingPlayers[i];
        const pName = row.Player || row.player || "";
        
        process.stdout.write(`⏳ Recherche [${i+1}/${missingPlayers.length}] : ${pName.padEnd(25)}`);
        
        try {
            // Utiliser l'API JSON interne de FBref
            const searchUrl = `https://fbref.com/search/search.fcgi?search=${encodeURIComponent(pName)}`;
            
            // On navigue réellement
            await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
            
            const currentUrl = page.url();
            let result = null;
            
            if (currentUrl.includes("/players/")) {
                // Correspondance exacte, FBref a redirigé !
                const match = currentUrl.match(/\/players\/([a-zA-Z0-9]+)\//);
                if (match) result = match[1];
            } else {
                // Page de résultats (plusieurs correspondances)
                result = await page.evaluate(() => {
                    const firstResult = document.querySelector(".search-item-name a");
                    if (firstResult && firstResult.href) {
                        const m = firstResult.href.match(/\/players\/([a-zA-Z0-9]+)\//);
                        return m ? m[1] : null;
                    }
                    return null;
                });
            }
            
            const title = await page.title();
            if (title.toLowerCase().includes("captcha") || title.includes("429")) {
                console.log("\n⚠️ Bloqué par FBref (Captcha/429). Pause forcée de 3 minutes...");
                await sleep(180000); // 3 min pause
                i--; // réessayer ce joueur
                continue;
            }
            
            if (result) {
                row.fbref_id = result;
                patchedCount++;
                process.stdout.write(` -> ✅ ID: ${result}\n`);
            } else {
                process.stdout.write(` -> ❌ Introuvable (${currentUrl})\n`);
            }
            
        } catch(e) {
            process.stdout.write(` -> ❌ Erreur technique (${e.message})\n`);
        }
        
        // Pause humaine pour ne pas déclencher le ban (3-5 secondes)
        await sleep(Math.floor(Math.random() * 2000) + 3000);
        
        // Sauvegarde tous les 20 joueurs pour ne pas perdre la progression
        if ((i + 1) % 20 === 0) {
            const newCsv = csv.unparse(parsed.data);
            fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
        }
    }
    
    // Sauvegarde Finale
    const newCsv = csv.unparse(parsed.data);
    fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
    
    await browser.close();
    console.log(`\n🎉 TERMINÉ ! ${patchedCount} nouveaux IDs récupérés et sauvegardés.`);
}

main().catch(console.error);
