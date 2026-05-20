import fs from "fs";
import https from "https";
import path from "path";
import csv from "papaparse";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");
const MAPPING_URL = "https://raw.githubusercontent.com/withqwerty/reep/main/data/people.csv";

const normalize = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

console.log("🚀 Lancement du patch FBref Avancé (Ultra-rapide)...");

https.get(MAPPING_URL, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("✅ Dictionnaire Reep téléchargé !");
    
    csv.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let fbrefCol = results.meta.fields.find(c => c.toLowerCase().includes("fbref"));
        let nameCol = results.meta.fields.find(c => c.toLowerCase() === "name" || c.toLowerCase().includes("name"));
        let altNameCol = results.meta.fields.find(c => c.toLowerCase().includes("short") || c.toLowerCase().includes("alt"));

        const exactMap = new Map();
        const rawMap = new Map();
        
        results.data.forEach(row => {
          let fbrefId = row[fbrefCol] || "";
          if (fbrefId && fbrefId !== "nan") {
             if (fbrefId.includes("fbref.com")) {
                const parts = fbrefId.split("/players/");
                if (parts.length > 1) fbrefId = parts[1].split("/")[0];
             }
             
             const n = normalize(row[nameCol]);
             const alt = altNameCol ? normalize(row[altNameCol]) : "";
             
             if (n) exactMap.set(n, fbrefId);
             if (alt) exactMap.set(alt, fbrefId);
             
             const rawStr = JSON.stringify(row).toLowerCase();
             const slugs = rawStr.match(/[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*/g);
             if (slugs) {
                 for(const slug of slugs) {
                     if(!rawMap.has(slug)) rawMap.set(slug, fbrefId);
                 }
             }
          }
        });

        console.log(`🔍 Mapping indexé : ${exactMap.size} noms stricts, ${rawMap.size} slugs d'URL.`);
        
        const content = fs.readFileSync(CSV_FILE, "utf-8");
        const parsed = csv.parse(content, { header: true, skipEmptyLines: true });
        
        let previouslyPatched = 0;
        let newPatches = 0;
        
        parsed.data.forEach(row => {
           if (row.fbref_id && row.fbref_id.trim() !== "") {
              previouslyPatched++;
              return; 
           }
           
           const originalName = row.Player || row.player || "";
           const pName = normalize(originalName);
           const pSlug = pName.replace(/ /g, "-");
           
           if (exactMap.has(pName)) {
               row.fbref_id = exactMap.get(pName);
               newPatches++;
               return;
           }
           
           if (rawMap.has(pSlug)) {
               row.fbref_id = rawMap.get(pSlug);
               newPatches++;
               return;
           }
           
           // Recherche ultra-rapide par mot-clé fort dans les URLs
           for (const [slug, id] of rawMap.entries()) {
               if (slug.length > 5 && (slug.includes(pSlug) || pSlug.includes(slug))) {
                   row.fbref_id = id;
                   newPatches++;
                   break;
               }
           }
        });
        
        const newCsv = csv.unparse(parsed.data);
        fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
        
        console.log(`🎉 STATUT FINAL :`);
        console.log(`   - Joueurs trouvés précédemment : ${previouslyPatched}`);
        console.log(`   - Nouveaux joueurs trouvés à l'instant : ${newPatches}`);
        console.log(`   - TOTAL : ${previouslyPatched + newPatches} IDs !`);
      }
    });
  });
}).on("error", (err) => console.error(err));
