import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const CSV_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");

const LEAGUES = [
  { name: "Premier League", id: 9  },
  { name: "La Liga",        id: 12 },
  { name: "Bundesliga",     id: 20 },
  { name: "Serie A",        id: 11 },
  { name: "Ligue 1",        id: 13 },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const rand  = (a: number, b: number) => Math.floor(Math.random() * (b - a) + a);

function urlFor(leagueId: number) {
  const names: Record<number, string> = {
    9: "Premier-League", 12: "La-Liga",
    20: "Bundesliga", 11: "Serie-A", 13: "Ligue-1",
  };
  return `https://fbref.com/en/comps/${leagueId}/stats/${names[leagueId]}-Stats`;
}

async function extractIds(page: puppeteer.Page, leagueId: number): Promise<Record<string, string>> {
  return page.evaluate((lid: number) => {
    const allTables = Array.from(document.querySelectorAll("table[id]"));
    const target = allTables.find(t => {
      const id = t.id;
      return id.startsWith("stats_") && id.includes(String(lid));
    }) || allTables.find(t => t.id.startsWith("stats_") && t.querySelectorAll("tbody tr").length > 10);

    if (!target) return {};

    const idMap: Record<string, string> = {};
    target.querySelectorAll("tbody tr").forEach(tr => {
      if (tr.classList.contains("spacer") || tr.classList.contains("thead") || tr.classList.contains("partial_table")) return;
      const playerCell = Array.from(tr.querySelectorAll("th,td")).find(c => (c as HTMLElement).dataset.stat === "player");
      if (playerCell) {
         const a = playerCell.querySelector("a");
         if (a && a.href) {
            const match = a.href.match(/\/players\/([a-zA-Z0-9]+)\//);
            if (match) {
               const playerName = playerCell.textContent?.trim() || "";
               if (playerName) {
                  idMap[playerName.toLowerCase()] = match[1];
               }
            }
         }
      }
    });
    return idMap;
  }, leagueId);
}

async function main() {
  console.log("🚀 Lancement de l'extraction sécurisée des FBref IDs...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox", "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  console.log("🌐 Visite de la page d'accueil FBref (Cookies)...");
  await page.goto("https://fbref.com/en/", { waitUntil: "networkidle0", timeout: 60_000 });
  await sleep(rand(3000, 5000));

  let globalIdMap: Record<string, string> = {};

  for (const league of LEAGUES) {
    console.log(`📥 Récupération des IDs pour la ${league.name}...`);
    const url = urlFor(league.id);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
    await sleep(rand(4000, 7000));
    
    const ids = await extractIds(page, league.id);
    const count = Object.keys(ids).length;
    console.log(`   ✅ Trouvé ${count} joueurs avec ID !`);
    globalIdMap = { ...globalIdMap, ...ids };
    
    await sleep(rand(10000, 15000)); // Pause anti-ban
  }

  await browser.close();
  
  console.log(`\n📊 Total de ${Object.keys(globalIdMap).length} IDs uniques récupérés.`);
  console.log("💾 Patch de la base de données CSV en cours...");

  if (!fs.existsSync(CSV_FILE)) {
     console.error("Fichier CSV introuvable !");
     return;
  }

  const content = fs.readFileSync(CSV_FILE, "utf-8");
  const lines = content.split("\n");
  if (lines.length < 2) return;
  
  const headers = lines[0].split(",");
  let fbrefIdIndex = headers.indexOf("fbref_id");
  let hasFbrefId = true;
  
  if (fbrefIdIndex === -1) {
     hasFbrefId = false;
     headers.push("fbref_id");
  }

  let patchedCount = 0;
  const newLines = [headers.join(",")];

  for (let i = 1; i < lines.length; i++) {
     const line = lines[i];
     if (!line.trim()) continue;
     
     // Quick parse
     let parts: string[] = [];
     let inQuotes = false;
     let curr = "";
     for(let char of line) {
        if(char === '"') inQuotes = !inQuotes;
        else if(char === ',' && !inQuotes) { parts.push(curr); curr = ""; }
        else curr += char;
     }
     parts.push(curr);
     
     const playerIndex = headers.indexOf("Player");
     if (playerIndex >= 0 && parts[playerIndex]) {
        const pName = parts[playerIndex].replace(/"/g, "").trim().toLowerCase();
        const foundId = globalIdMap[pName];
        
        if (!hasFbrefId) {
           parts.push(foundId || "");
        } else {
           // si la colonne existe déjà mais est vide
           if (!parts[fbrefIdIndex]) parts[fbrefIdIndex] = foundId || "";
        }
        if (foundId) patchedCount++;
     }
     newLines.push(parts.join(","));
  }

  fs.writeFileSync(CSV_FILE, newLines.join("\n"), "utf-8");
  console.log(`🎉 Succès ! ${patchedCount} joueurs mis à jour avec leur FBref ID !`);
}

main().catch(console.error);
