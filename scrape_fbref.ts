/**
 * scrape_fbref.ts  v3 — stealth Puppeteer + dynamic table detection
 * Lance via :  npm run scrape
 */
import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_FILE = path.join(process.cwd(), "players_data_2025_2026.csv");
const BACKUP_FILE = path.join(process.cwd(), "players_data_2025_2026_backup.csv");
const DEBUG_DIR   = path.join(process.cwd(), "scrape_debug");
const BLOCK_SIZE  = 100;

type Row = Record<string, string>;

// ── Ligues ─────────────────────────────────────────────────────
const LEAGUES = [
  { name: "Premier League", id: 9  },
  { name: "La Liga",        id: 12 },
  { name: "Bundesliga",     id: 20 },
  { name: "Serie A",        id: 11 },
  { name: "Ligue 1",        id: 13 },
];

const STAT_TYPES = [
  { slug: "stats",      label: "Standard"   },
  { slug: "shooting",   label: "Shooting"   },
  { slug: "passing",    label: "Passing"    },
  { slug: "possession", label: "Possession" },
  { slug: "defense",    label: "Defense"    },
];

// ── Helpers ─────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const rand  = (a: number, b: number) => Math.floor(Math.random() * (b - a) + a);

function urlFor(leagueId: number, slug: string) {
  const names: Record<number, string> = {
    9: "Premier-League", 12: "La-Liga",
    20: "Bundesliga", 11: "Serie-A", 13: "Ligue-1",
  };
  return `https://fbref.com/en/comps/${leagueId}/${slug}/${names[leagueId]}-Stats`;
}

/** Extrait le tableau HTML → tableau de Row via page.evaluate */
async function extractTable(page: puppeteer.Page, leagueId: number, slug: string): Promise<Row[]> {
  return page.evaluate((lid: number, s: string) => {
    // Cherche TOUS les tableaux qui contiennent des stats
    const allTables = Array.from(document.querySelectorAll("table[id]"));
    const target = allTables.find(t => {
      const id = t.id;
      return id.startsWith("stats_") && id.includes(String(lid));
    }) || allTables.find(t => t.id.startsWith("stats_") && t.querySelectorAll("tbody tr").length > 10);

    if (!target) return [];

    // Récupère les headers (dernier tr du thead)
    const headRows = Array.from(target.querySelectorAll("thead tr"));
    const lastHead = headRows[headRows.length - 1];
    if (!lastHead) return [];

    const headers = Array.from(lastHead.querySelectorAll("th,td")).map(
      th => (th as HTMLElement).dataset.stat || th.textContent?.trim() || ""
    );

    const rows: Record<string, string>[] = [];
    target.querySelectorAll("tbody tr").forEach(tr => {
      if (tr.classList.contains("spacer") || tr.classList.contains("thead") || tr.classList.contains("partial_table")) return;
      const cells = Array.from(tr.querySelectorAll("th,td"));
      const row: Record<string, string> = {};
      cells.forEach((td, i) => {
        if (headers[i]) row[headers[i]] = (td as HTMLElement).textContent?.trim() || "";
      });
      if (row["player"] && row["player"] !== "Player") rows.push(row);
    });
    return rows;
  }, leagueId, slug);
}

/** Scrape une URL avec 3 tentatives + screenshot debug */
async function scrapePage(page: puppeteer.Page, url: string, leagueId: number, slug: string, label: string): Promise<Row[]> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`    📥 ${label} (tentative ${attempt})...`);

      await page.goto(url, { waitUntil: "networkidle0", timeout: 90_000 });
      await sleep(rand(3000, 6000));

      // Vérifier si on est bloqué (CAPTCHA / 429 / redirect)
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || "");
      if (title.toLowerCase().includes("captcha") || bodyText.includes("429") || bodyText.includes("Too Many Requests")) {
        console.log(`    ⚠ FBref bloqué (${title}) — attente longue...`);
        await sleep(rand(60_000, 90_000));
        continue;
      }

      // Screenshot debug
      if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR);
      await page.screenshot({ path: path.join(DEBUG_DIR, `${leagueId}_${slug}_a${attempt}.png`), fullPage: false });

      const rows = await extractTable(page, leagueId, slug);
      if (rows.length > 5) {
        console.log(`    ✅ ${rows.length} joueurs`);
        return rows;
      }

      console.log(`    ⚠ Tableau vide (${rows.length} lignes) — voir scrape_debug/`);
      await sleep(rand(15_000, 25_000));

    } catch (e: any) {
      console.log(`    ✗ ${e.message?.slice(0, 80)}`);
      if (attempt < 3) await sleep(rand(15_000, 25_000));
    }
  }
  return [];
}

// ── Merge deux tableaux sur player+team ─────────────────────────
function merge(base: Row[], extra: Row[]): Row[] {
  const key = (r: Row) => `${(r.player || r.Player || "").toLowerCase()}_${(r.team || r.Squad || r.squad || "").toLowerCase()}`;
  const map = new Map(extra.map(r => [key(r), r]));
  return base.map(r => ({ ...map.get(key(r)), ...r }));
}

// ── CSV ──────────────────────────────────────────────────────────
function toCSV(rows: Row[]): string {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = (v: string) => (v.includes(",") || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
  return [keys.join(","), ...rows.map(r => keys.map(k => esc(r[k] || "")).join(","))].join("\n");
}

function logBlock(rows: Row[], b: number) {
  const block = rows.slice(b * BLOCK_SIZE, (b + 1) * BLOCK_SIZE);
  console.log(`\n  📦 Bloc ${b + 1} (${b * BLOCK_SIZE + 1}–${Math.min((b + 1) * BLOCK_SIZE, rows.length)}):`);
  block.forEach(r => {
    const n = (r.player || r.Player || "?").padEnd(26);
    const t = (r.team  || r.Squad  || "?").padEnd(20);
    console.log(`     ${n} | ${t} | G:${r.goals||r.Gls||"?"} A:${r.assists||r.Ast||"?"} xG:${r.xg||r.xG||"?"}`);
  });
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  🚀 PlayerStats — FBref Scraper v3 (Stealth Puppeteer)");
  console.log(`  📅 ${new Date().toLocaleString("fr-FR")}`);
  console.log("=".repeat(60));

  if (fs.existsSync(OUTPUT_FILE)) {
    fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
    console.log(`\n💾 Backup : ${BACKUP_FILE}`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox", "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-web-security", "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
  });

  // Masquer webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
  });

  // Visiter d'abord la page d'accueil pour avoir les cookies
  console.log("\n🌐 Initialisation (chargement page d'accueil FBref)...");
  await page.goto("https://fbref.com/en/", { waitUntil: "networkidle0", timeout: 60_000 });
  await sleep(rand(4000, 7000));
  console.log("   ✅ Cookies initialisés\n");

  const allRows: Row[] = [];

  for (const league of LEAGUES) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🏆 ${league.name} (id=${league.id})`);
    console.log("=".repeat(60));

    // Standard (obligatoire)
    const stdUrl = urlFor(league.id, "stats");
    let base = await scrapePage(page, stdUrl, league.id, "stats", "Standard");

    if (!base.length) {
      console.log(`  ✗ Standard introuvable — ${league.name} ignorée`);
      await sleep(rand(20_000, 35_000));
      continue;
    }
    base = base.map(r => ({ ...r, League: league.name }));

    // Tables supplémentaires
    for (const { slug, label } of STAT_TYPES.slice(1)) {
      const url = urlFor(league.id, slug);
      const extra = await scrapePage(page, url, league.id, slug, label);
      if (extra.length) base = merge(base, extra);
      await sleep(rand(10_000, 18_000));
    }

    // Log par blocs
    const nBlocks = Math.ceil(base.length / BLOCK_SIZE);
    for (let b = 0; b < nBlocks; b++) logBlock(base, b);

    allRows.push(...base);

    const pause = rand(25_000, 40_000);
    console.log(`\n⏳ Pause inter-ligue : ${pause / 1000}s...`);
    await sleep(pause);
  }

  await browser.close();

  if (!allRows.length) {
    console.log("\n❌ Aucune donnée. Regarde les screenshots dans scrape_debug/");
    process.exit(1);
  }

  // Déduplication
  const seen = new Set<string>();
  const deduped = allRows.filter(r => {
    const k = `${r.player||r.Player}_${r.team||r.Squad}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });

  fs.writeFileSync(OUTPUT_FILE, toCSV(deduped), "utf-8");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ ${deduped.length} joueurs sauvegardés → ${OUTPUT_FILE}`);

  // Top buteurs
  const top = [...deduped]
    .map(r => ({ n: r.player||r.Player||"?", g: Number(r.goals||r.Gls||0), l: r.League||"" }))
    .filter(r => r.g > 0)
    .sort((a, b) => b.g - a.g)
    .slice(0, 10);

  console.log("\n🏅 Top 10 buteurs :");
  top.forEach((r, i) => console.log(`  ${i+1}. ${r.n.padEnd(28)} ${r.l.padEnd(16)} Gls:${r.g}`));
  console.log("\n🎉 Redémarre le serveur : npm run dev\n");
}

main().catch(e => { console.error("❌", e); process.exit(1); });
