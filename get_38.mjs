import fs from "fs";
import https from "https";
import path from "path";
import csv from "papaparse";

const players = [
    "Arda Güler", "Thiago Pinar", "Diego Aguado", "Marc Casado", "Tomas Marques", 
    "James Trafford", "Divine Mukasa", "Max Alleyne", "Myles Lewis-Skelly", "Trey Nyoni", 
    "Aleksandar Pavlovic", "Lennart Karl", "Felipe Chávez", "Maycon Cardozo", "Wisdom Mike", 
    "Waldemar Anton", "Salih Özcan", "Samuele Inácio", "Filippo Mane", "Luca Reggiani", 
    "Ange-Yoan Bonny", "Petar Sucic", "Matteo Lavelli", "Ardon Jashari", "Zachary Athekame", 
    "Cheveyo Muy", "Alex Baena", "Pablo Barrios", "Giuliano Simeone", "Tyrique George", 
    "Shea Lacey", "Ayden Heaven", "Jack Fletcher", "Tyler Fletcher", "George Hemmings", 
    "Jamaldeen Jimoh", "Bradley Burrowes", "Alysson Edward"
];

const getJson = (url) => new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Bot/1.0 (a@b.com)" } }, res => {
        let d = "";
        res.on("data", c => d+=c);
        res.on("end", () => {
            try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
        });
    }).on("error", () => resolve(null));
});

async function main() {
    const results = {};
    for (const p of players) {
        try {
            const res = await getJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(p)}&utf8=&format=json`);
            if (res && res.query && res.query.search.length > 0) {
                const title = res.query.search[0].title;
                const page = await getJson(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=externallinks|text&format=json`);
                const text = JSON.stringify(page);
                const match = text.match(/fbref\.com(?:%2Fen%2F|\/en\/)players(?:%2F|\/)([a-zA-Z0-9]{8})/);
                if (match) {
                    results[p] = match[1];
                    console.log(`✅ ${p}: ${results[p]}`);
                } else {
                    const wk = await getJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(p)}&language=en&format=json`);
                    if (wk && wk.search && wk.search.length > 0) {
                        const eid = wk.search[0].id;
                        const cl = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${eid}&property=P8642&format=json`);
                        if (cl && cl.claims && cl.claims.P8642) {
                            results[p] = cl.claims.P8642[0].mainsnak.datavalue.value;
                            console.log(`✅ ${p}: ${results[p]} (Wikidata)`);
                        } else {
                            console.log(`❌ ${p}: Introuvable`);
                        }
                    } else {
                        console.log(`❌ ${p}: Introuvable`);
                    }
                }
            } else {
                console.log(`❌ ${p}: Introuvable`);
            }
        } catch(e) { console.log(`❌ ${p}: Error`); }
    }

    const file = fs.readFileSync('players_data_2025_2026.csv', 'utf8');
    const parsed = csv.parse(file, {header:true, skipEmptyLines:true});
    
    let patched = 0;
    parsed.data.forEach(r => {
        if (!r.fbref_id) {
            const name = r.Player || r.player || '';
            for (const [pName, pId] of Object.entries(results)) {
                if (name.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(name.toLowerCase())) {
                    r.fbref_id = pId;
                    patched++;
                    break;
                }
            }
        }
    });

    fs.writeFileSync('players_data_2025_2026.csv', csv.unparse(parsed.data), 'utf8');
    console.log(`🎉 Terminé. ${patched} VIPs mis à jour dans le CSV.`);
}

main();
