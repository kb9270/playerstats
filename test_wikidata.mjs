import https from "https";

async function getWikidataFBref(playerName) {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(playerName)}&language=en&format=json`;
    
    return new Promise((resolve) => {
        https.get(searchUrl, { headers: { "User-Agent": "FootballAnalyticsBot/1.0 (contact@example.com)" } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.search && json.search.length > 0) {
                        const entityId = json.search[0].id;
                        
                        // Step 2: Get FBref property P8642
                        const claimsUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P8642&format=json`;
                        https.get(claimsUrl, { headers: { "User-Agent": "FootballAnalyticsBot/1.0 (contact@example.com)" } }, (res2) => {
                            let data2 = "";
                            res2.on("data", chunk => data2 += chunk);
                            res2.on("end", () => {
                                try {
                                    const json2 = JSON.parse(data2);
                                    if (json2.claims && json2.claims.P8642) {
                                        const fbref = json2.claims.P8642[0].mainsnak.datavalue.value;
                                        resolve(fbref);
                                    } else {
                                        resolve(null);
                                    }
                                } catch(e) { resolve(null); }
                            });
                        });
                    } else {
                        resolve(null);
                    }
                } catch(e) { resolve(null); }
            });
        }).on("error", () => resolve(null));
    });
}

async function main() {
    console.log("🔍 Recherche de Karim Adeyemi dans le coffre-fort Wikidata (P8642)...");
    const id = await getWikidataFBref("Karim Adeyemi");
    if (id) {
        console.log(`✅ BINGO TOTAL ! Wikidata a renvoyé l'ID : ${id}`);
    } else {
        console.log(`❌ Échec.`);
    }
}

main();
