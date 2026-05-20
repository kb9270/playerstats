import fs from "fs";
import https from "https";
import path from "path";
import csv from "papaparse";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchIdFromFBrefSearch(playerName) {
    // FBref autocomplete API
    const url = `https://fbref.com/search/search.fcgi?search=${encodeURIComponent(playerName)}`;
    
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": "https://fbref.com/en/"
            }
        }, (res) => {
            if (res.statusCode === 429) {
                console.log(`[Rate Limit] Pause sur ${playerName}...`);
                return resolve("RATE_LIMIT");
            }
            
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    // C'est souvent du texte ou JSON
                    // Parfois ça retourne des suggestions
                    if (data.includes("players/")) {
                        const match = data.match(/\/players\/([a-zA-Z0-9]+)\//);
                        if (match) return resolve(match[1]);
                    }
                    resolve(null);
                } catch(e) {
                    resolve(null);
                }
            });
        }).on("error", () => resolve(null));
    });
}

async function main() {
    console.log("🚀 Lancement de l'extraction de précision (API de recherche FBref)...");
    
    if (!fs.existsSync(CSV_FILE)) {
        console.error("❌ Fichier introuvable.");
        return;
    }
    
    const content = fs.readFileSync(CSV_FILE, "utf-8");
    const parsed = csv.parse(content, { header: true, skipEmptyLines: true });
    
    const missingPlayers = parsed.data.filter(row => !row.fbref_id || row.fbref_id.trim() === "");
    console.log(`🎯 ${missingPlayers.length} joueurs manquants à récupérer !`);
    
    if (missingPlayers.length === 0) {
        console.log("🎉 Tous les joueurs ont déjà leur ID !");
        return;
    }

    let patchedCount = 0;
    
    for (let i = 0; i < missingPlayers.length; i++) {
        const row = missingPlayers[i];
        const pName = row.Player || row.player || "";
        
        if (!pName) continue;
        
        // Print progress
        process.stdout.write(`⏳ Recherche [${i+1}/${missingPlayers.length}] : ${pName.padEnd(25)}`);
        
        let fbrefId = await fetchIdFromFBrefSearch(pName);
        
        if (fbrefId === "RATE_LIMIT") {
            // Anti-ban
            console.log("\n⚠️ Bloqué par FBref (Trop de requêtes). On sauvegarde et on arrête pour le moment !");
            break; 
        }
        
        if (fbrefId) {
            row.fbref_id = fbrefId;
            patchedCount++;
            process.stdout.write(` -> ✅ ID: ${fbrefId}\n`);
        } else {
            process.stdout.write(` -> ❌ Introuvable\n`);
        }
        
        // Pause importante pour éviter le 429
        await sleep(1500); 
    }
    
    // Save CSV
    const newCsv = csv.unparse(parsed.data);
    fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
    
    console.log(`\n🎉 TERMINÉ ! ${patchedCount} nouveaux IDs récupérés et sauvegardés.`);
    console.log(`Total manquant restant : ${missingPlayers.length - patchedCount}`);
}

main();
