import https from "https";

async function getFBrefFromWiki(playerName) {
    const title = encodeURIComponent(playerName.replace(/ /g, "_"));
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extlinks&titles=${title}&ellimit=500&format=json`;
    
    return new Promise((resolve) => {
        https.get(url, { headers: { "User-Agent": "PlayerStatsBot/1.0" } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    for (const pageId in pages) {
                        const page = pages[pageId];
                        if (page.extlinks) {
                            for (const linkObj of page.extlinks) {
                                const url = linkObj["*"];
                                const match = url.match(/fbref\.com\/en\/players\/([a-zA-Z0-9]+)/);
                                if (match) return resolve(match[1]);
                            }
                        }
                    }
                    resolve(null);
                } catch(e) { resolve(null); }
            });
        }).on("error", () => resolve(null));
    });
}

async function main() {
    console.log("🔍 Interrogation de l'API de Wikipedia pour Karim Adeyemi...");
    const id = await getFBrefFromWiki("Karim Adeyemi");
    if (id) {
        console.log(`✅ BINGO ! Wikipedia a renvoyé l'ID : ${id}`);
    } else {
        console.log(`❌ Wikipedia n'a pas renvoyé le lien.`);
    }
}

main();
