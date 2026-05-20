import fs from "fs";
import https from "https";
import path from "path";
import csv from "papaparse"; // we know it's in package.json!

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");
const MAPPING_URL = "https://raw.githubusercontent.com/withqwerty/reep/main/data/people.csv";

console.log("🚀 Lancement du patch FBref (Node.js via Reep)...");

https.get(MAPPING_URL, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("✅ Fichier Reep téléchargé ! Parsage en cours...");
    
    csv.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const idMap = {};
        let fbrefCol = results.meta.fields.find(c => c.toLowerCase().includes("fbref"));
        let nameCol = results.meta.fields.find(c => c.toLowerCase() === "name" || c.toLowerCase().includes("name"));
        
        if (!fbrefCol || !nameCol) {
          console.error("❌ Colonnes introuvables :", results.meta.fields);
          return;
        }

        results.data.forEach(row => {
          const name = (row[nameCol] || "").toLowerCase().trim();
          let fbrefId = row[fbrefCol] || "";
          if (name && fbrefId && fbrefId !== "nan") {
             if (fbrefId.includes("fbref.com")) {
                const parts = fbrefId.split("/players/");
                if (parts.length > 1) fbrefId = parts[1].split("/")[0];
             }
             idMap[name] = fbrefId;
          }
        });

        console.log(`🔍 Mapping construit : ${Object.keys(idMap).length} IDs.`);
        
        // Load original CSV
        if (!fs.existsSync(CSV_FILE)) {
          console.error("❌ Fichier CSV local introuvable !");
          return;
        }
        
        const content = fs.readFileSync(CSV_FILE, "utf-8");
        const parsed = csv.parse(content, { header: true, skipEmptyLines: true });
        
        let patched = 0;
        parsed.data.forEach(row => {
           const pName = (row.Player || row.player || "").toLowerCase().trim();
           if (idMap[pName]) {
              if (!row.fbref_id) {
                 row.fbref_id = idMap[pName];
                 patched++;
              }
           }
        });
        
        const newCsv = csv.unparse(parsed.data);
        fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
        
        console.log(`🎉 SUCCÈS ! ${patched} joueurs mis à jour avec leur FBref ID en toute sécurité !`);
      }
    });
  });
}).on("error", (err) => {
  console.error("❌ Erreur:", err.message);
});
