import fs from "fs";
import https from "https";
import path from "path";
import csv from "papaparse";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchDDG(playerName) {
    const query = encodeURIComponent(`site:fbref.com/en/players/ "${playerName}"`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            }
        }, (res) => {
            if (res.statusCode === 403 || res.statusCode === 429) {
                return resolve("RATE_LIMIT");
            }
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                const match = data.match(/fbref\.com(?:%2Fen%2F|\/en\/)players(?:%2F|\/)([a-zA-Z0-9]+)(?:%2F|\/)/);
                if (match) {
                    resolve(match[1]);
                } else {
                    resolve(null);
                }
            });
        }).on("error", () => resolve(null));
    });
}

async function main() {
    console.log("🚀 Lancement de la récupération ultime (Anti-Cloudflare via DuckDuckGo)...");
    
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
        
        process.stdout.write(`⏳ Recherche [${i+1}/${missingPlayers.length}] : ${pName.padEnd(25)}`);
        
        try {
            const result = await searchDDG(pName);
            
            if (result === "RATE_LIMIT") {
                console.log("\n⚠️ Bloqué par DuckDuckGo (429). Pause forcée de 2 minutes...");
                await sleep(120000); 
                i--; // Réessayer le même
                continue;
            }
            
            if (result) {
                row.fbref_id = result;
                patchedCount++;
                process.stdout.write(` -> ✅ ID: ${result}\n`);
            } else {
                process.stdout.write(` -> ❌ Introuvable\n`);
            }
        } catch(e) {
            process.stdout.write(` -> ❌ Erreur technique\n`);
        }
        
        // Pause humaine 
        await sleep(Math.floor(Math.random() * 2000) + 2000);
        
        // Sauvegarde tous les 5 joueurs
        if ((i + 1) % 5 === 0) {
            fs.writeFileSync(CSV_FILE, csv.unparse(parsed.data), "utf-8");
        }
    }
    
    fs.writeFileSync(CSV_FILE, csv.unparse(parsed.data), "utf-8");
    console.log(`\n🎉 TERMINÉ ! ${patchedCount} nouveaux IDs récupérés en contournant Cloudflare.`);
}

main();
