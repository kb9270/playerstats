import fs from "fs";
import csv from "papaparse";
import path from "path";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");

const vipIds = {
    "Arda Güler": "fb19c968",
    "Marc Casado": "88126e7b",
    "Alex Baena": "7d6a5953",
    "Pablo Barrios": "26079d34",
    "Waldemar Anton": "01878d06",
    "Aleksandar Pavlovic": "38724d1e",
    "Myles Lewis-Skelly": "01878d05",
    "Giuliano Simeone": "6f212239",
    "Ange-Yoan Bonny": "b28271a5",
    "Salih Özcan": "15413fa5",
    "Tyrique George": "3a79d02e",
    "Trey Nyoni": "fb1e06d9",
    "Petar Sucic": "c94b7f9e",
    "Ardon Jashari": "c9a2c38f",
    "James Trafford": "b1565196"
};

const normalize = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const content = fs.readFileSync(CSV_FILE, "utf-8");
const parsed = csv.parse(content, { header: true, skipEmptyLines: true });

let patched = 0;
parsed.data.forEach(row => {
    if (!row.fbref_id || row.fbref_id.trim() === "") {
        const pName = normalize(row.Player || row.player || "");
        
        for (const [vipName, vipId] of Object.entries(vipIds)) {
            const nVip = normalize(vipName);
            if (pName === nVip || pName.includes(nVip) || nVip.includes(pName)) {
                row.fbref_id = vipId;
                patched++;
                console.log(`✅ VIP Injecté : ${vipName} -> ${vipId}`);
                break;
            }
        }
    }
});

fs.writeFileSync(CSV_FILE, csv.unparse(parsed.data), "utf-8");
console.log(`\n🎉 Terminé ! ${patched} Super-VIPs patchés à la main.`);
