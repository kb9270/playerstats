import https from "https";

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
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                const match = data.match(/fbref\.com\/en\/players\/([a-zA-Z0-9]+)\//);
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
    console.log("🔍 Test de l'astuce de contournement via moteur de recherche...");
    const id = await searchDDG("Karim Adeyemi");
    if (id) {
        console.log(`✅ SUCCÈS ! ID trouvé pour Karim Adeyemi : ${id}`);
    } else {
        console.log(`❌ Échec de la méthode...`);
    }
}

main();
