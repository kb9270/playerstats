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

// Vérifie si un nom correspond (ex: "gabriel magalhaes" et "gabriel")
const fuzzyMatch = (nameA, nameB) => {
  if (!nameA || !nameB) return false;
  if (nameA === nameB) return true;
  
  const partsA = nameA.split(" ");
  const partsB = nameB.split(" ");
  
  // Si tous les mots de l'un sont dans l'autre (ex: "vinicius junior" dans "vinicius jose paixao de oliveira junior")
  const aInB = partsA.every(p => nameB.includes(p));
  const bInA = partsB.every(p => nameA.includes(p));
  
  return aInB || bInA;
};

console.log("🚀 Lancement du patch FBref Avancé (Fuzzy Matching)...");

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

        const dict = [];
        
        results.data.forEach(row => {
          let fbrefId = row[fbrefCol] || "";
          if (fbrefId && fbrefId !== "nan") {
             if (fbrefId.includes("fbref.com")) {
                const parts = fbrefId.split("/players/");
                if (parts.length > 1) fbrefId = parts[1].split("/")[0];
             }
             
             const n = normalize(row[nameCol]);
             const alt = altNameCol ? normalize(row[altNameCol]) : "";
             
             if (n) dict.push({ name: n, alt: alt, id: fbrefId, raw: JSON.stringify(row).toLowerCase() });
          }
        });

        console.log(`🔍 Mapping nettoyé : ${dict.length} références prêtes.`);
        
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
           const pSlug2 = pName.replace(/ /g, "");
           
           // Recherche dans le dict étendu
           let found = dict.find(d => {
              if (d.name === pName || (d.alt && d.alt === pName)) return true;
              if (d.raw.includes(pSlug) || d.raw.includes(pSlug2)) return true;
              return fuzzyMatch(d.name, pName) || (d.alt && fuzzyMatch(d.alt, pName));
           });
           
           if (found) {
              row.fbref_id = found.id;
              newPatches++;
           }
        });
        
        const newCsv = csv.unparse(parsed.data);
        fs.writeFileSync(CSV_FILE, newCsv, "utf-8");
        
        console.log(`🎉 STATUT FINAL :`);
        console.log(`   - Joueurs déjà trouvés (Passe 1) : ${previouslyPatched}`);
        console.log(`   - Nouveaux joueurs trouvés (Fuzzy) : ${newPatches}`);
        console.log(`   - TOTAL : ${previouslyPatched + newPatches} IDs !`);
      }
    });
  });
}).on("error", (err) => console.error(err));
