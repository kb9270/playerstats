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
    const topClubs = ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal', 'Liverpool', 'Bayern Munich', 'Paris S-G', 'Dortmund', 'Juventus', 'Inter', 'Milan', 'Atlético Madrid', 'Bayer Leverkusen', 'Chelsea', 'Manchester Utd', 'Aston Villa'];
    
    const content = fs.readFileSync(CSV_FILE, "utf-8");
    const parsed = csv.parse(content, { header: true, skipEmptyLines: true });
    
    const missingTop = parsed.data.filter(r => (!r.fbref_id || r.fbref_id.trim() === '') && topClubs.some(c => (r.Squad || '').includes(c)));
    
    console.log(`🎯 Récupération prioritaire de ${missingTop.length} VIPs !`);
    
    let patchedCount = 0;
    for (let i = 0; i < missingTop.length; i++) {
        const row = missingTop[i];
        const pName = row.Player || row.player || "";
        
        process.stdout.write(`⏳ Recherche : ${pName.padEnd(25)}`);
        const result = await searchDDG(pName);
        
        if (result === "RATE_LIMIT") {
            console.log("⚠️ Blocage anti-robot DDG.");
            break;
        }
        
        if (result) {
            row.fbref_id = result;
            patchedCount++;
            process.stdout.write(` -> ✅ ID: ${result}\n`);
        } else {
            process.stdout.write(` -> ❌ Introuvable\n`);
        }
        
        await sleep(Math.floor(Math.random() * 2000) + 3000);
    }
    
    fs.writeFileSync(CSV_FILE, csv.unparse(parsed.data), "utf-8");
    console.log(`\n🎉 TERMINÉ ! ${patchedCount} joueurs VIP sécurisés.`);
}

main();
