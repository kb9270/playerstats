/**
 * collect_sofascore_ids.mjs
 * ─────────────────────────────────────────────────────────────
 * Collecte les IDs SofaScore pour TOUS les joueurs du CSV.
 * - Reprend là où il s'est arrêté (sofascore_id_progress.json)
 * - Met à jour le CSV toutes les 25 requêtes
 * - Rate-limiting adaptatif (ralentit si 403)
 * - Utilise api.sofascore.com (endpoint valide)
 * ─────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, 'players_data_2025_2026.csv');
const PROGRESS_PATH = path.join(__dirname, 'sofascore_id_progress.json');

// ── Helpers ──────────────────────────────────────────────────

function normalizeName(name) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ')
    .trim().toLowerCase();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── HTTP avec décompression automatique ──────────────────────

import http from 'http';

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, port: u.port, path: u.pathname + u.search, method: 'GET', headers, timeout: 5000 };
    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// Headers Chrome standard (fonctionne sur api.sofascore.com)
const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];
let uaIdx = 0;
function getHeaders() {
  return {
    'User-Agent': UA_LIST[uaIdx++ % UA_LIST.length],
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Referer': 'https://www.sofascore.com/',
    'Origin': 'https://www.sofascore.com',
  };
}

let consecutiveErrors = 0;

async function searchSofaScoreId(playerName, squadName) {
  const normTarget = normalizeName(playerName);
  const normSquad  = normalizeName(squadName || '');
  const lastName = normTarget.split(' ').pop();

  const searchAttempts = [
    playerName,
    lastName, // Try only last name if full name fails
  ];

  for (const query of searchAttempts) {
    if (!query || query.length < 3) continue;

    const q = encodeURIComponent(query);
    const targetUrl = `https://www.sofascore.com/api/v1/search/all?q=${q}`;
    const url = `http://localhost:8001/?url=${encodeURIComponent(targetUrl)}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { status, buf } = await httpGet(url, { 'Accept': 'application/json' });

        if (status === 429 || status === 403 || status === 500) {
          consecutiveErrors++;
          const wait = Math.min(5000 * consecutiveErrors, 15000);
          process.stdout.write(`  ⏳ Proxy ${status} → pause ${wait}ms\n`);
          await sleep(wait);
          continue;
        }

        if (status !== 200 || buf.length === 0) break; // Next search attempt

        consecutiveErrors = 0;

        const data = JSON.parse(buf.toString());
        const players = (data.results || []).filter(r => r.type === 'player');
        if (!players.length) break; // Next search attempt

        // Priorité 1 : nom complet (ou last name) + équipe
        for (const r of players) {
          const n = normalizeName(r.entity?.name || '');
          const t = normalizeName(r.entity?.team?.name || '');
          if ((n.includes(lastName) || n === normTarget) && normSquad && t && t.includes(normSquad.split(' ')[0])) {
            return r.entity.id;
          }
        }

        // Priorité 2 : nom exact (si la requête est le nom complet)
        if (query === playerName) {
          for (const r of players) {
            if (normalizeName(r.entity?.name || '') === normTarget) return r.entity.id;
          }
        }

        // Priorité 3 : nom se termine par last name AND équipe correspond (déjà couvert par prio 1)
        
        // If we reach here, we didn't find a high confidence match. We continue to next query.
        break; 
      } catch (e) {
        consecutiveErrors++;
        if (attempt < 1) { await sleep(2000); continue; }
        break;
      }
    }
  }
  return null;
}

// ── CSV ───────────────────────────────────────────────────────

function parseCSV(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    rows.push(row);
  }
  return { headers, rows };
}

function writeCSV(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map(h => row[h] ?? '').join(','));
  fs.writeFileSync(CSV_PATH, lines.join('\n'), 'utf-8');
}

function applyToCSV(rows, progress) {
  for (const row of rows) {
    const id = progress[row.Player];
    if (id != null) row.sofascore_id = String(id);
  }
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('🚀 [SofaScore ID Collector] Démarrage...\n');

  const { headers, rows } = parseCSV(fs.readFileSync(CSV_PATH, 'utf-8'));
  if (!headers.includes('sofascore_id')) {
    headers.push('sofascore_id');
    rows.forEach(r => { r.sofascore_id = ''; });
  }

  // Chargement de la progression
  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    try { progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8')); } catch {}
  }

  // Réinitialiser les null (échecs précédents) pour les réessayer
  const prevFailed = Object.keys(progress).filter(k => progress[k] === null || progress[k] === 'null');
  prevFailed.forEach(k => delete progress[k]);

  const alreadyDone = Object.keys(progress).filter(k => progress[k] !== null).length;

  // Construire la liste à traiter
  const seen = new Set();
  const toProcess = [];
  for (const row of rows) {
    if (!row.Player || seen.has(row.Player)) continue;
    seen.add(row.Player);
    if (!progress.hasOwnProperty(row.Player)) {
      toProcess.push({ name: row.Player, squad: row.Squad });
    }
  }

  const uniqueTotal = seen.size;
  console.log(`📊 Joueurs uniques dans le CSV : ${uniqueTotal}`);
  console.log(`   Déjà résolus              : ${alreadyDone}`);
  console.log(`   Echecs réinitialisés      : ${prevFailed.length}`);
  console.log(`   À traiter                 : ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log('✅ Déjà complet ! Application au CSV...');
  } else {
    let found = 0, notFound = 0;

    for (let i = 0; i < toProcess.length; i++) {
      const { name, squad } = toProcess[i];
      const pct = (((i + 1) / toProcess.length) * 100).toFixed(1);

      const sofaId = await searchSofaScoreId(name, squad);
      progress[name] = sofaId;

      const icon = sofaId ? '✅' : '❌';
      process.stdout.write(`[${i+1}/${toProcess.length}] ${pct}% ${icon} ${name} → ${sofaId || 'non trouvé'}\n`);

      if (sofaId) found++; else notFound++;

      // Sauvegarde toutes les 25 requêtes
      if ((i + 1) % 25 === 0 || i === toProcess.length - 1) {
        fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
        applyToCSV(rows, progress);
        writeCSV(headers, rows);
        const pctTotal = (((alreadyDone + found) / uniqueTotal) * 100).toFixed(1);
        console.log(`\n💾 Sauvegarde : ${alreadyDone + found}/${uniqueTotal} (${pctTotal}%) résolus\n`);
      }

      // Délai adaptatif
      const delay = 3000 + (consecutiveErrors > 1 ? 5000 * consecutiveErrors : 0); // Much higher base delay
      await sleep(delay);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ COLLECTE TERMINÉE`);
    console.log(`   Nouveaux trouvés  : ${found}`);
    console.log(`   Non trouvés       : ${notFound}`);
    console.log(`   Total résolu      : ${alreadyDone + found} / ${uniqueTotal}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  // Mise à jour finale du CSV
  applyToCSV(rows, progress);
  writeCSV(headers, rows);
  const withId = rows.filter(r => r.sofascore_id && r.sofascore_id !== '').length;
  console.log(`📁 CSV final : ${withId}/${rows.length} lignes avec sofascore_id`);
  console.log('✅ Terminé !');
}

main().catch(e => { console.error('❌ Erreur fatale:', e); process.exit(1); });
