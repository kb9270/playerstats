/**
 * collect_spatial_data.mjs
 * ─────────────────────────────────────────────────────────────────────
 * Pipeline Data Engineer : Collecte des heatmaps match-par-match
 * pour alimenter une base SQLite de coordonnées spatiales.
 *
 * Étape 1 : Récupérer les events (matchs) de chaque joueur
 * Étape 2 : Pour chaque match, aspirer la heatmap du joueur
 * Étape 3 : Stocker les coordonnées (x, y) dans spatial_data
 *
 * Utilise le proxy local (port 8001) pour contourner Cloudflare.
 * Rate-limiting : 1s entre chaque appel API.
 * ─────────────────────────────────────────────────────────────────────
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'spatial_heatmaps.sqlite');
const CSV_PATH = path.join(__dirname, 'players_data_2025_2026.csv');
const PROXY = 'http://localhost:8001';
const BATCH_SIZE = 300; // Premier lot de test
const API_DELAY_MS = 1000; // 1 seconde entre chaque appel

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    };
    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function sofaGet(apiPath) {
  const fullUrl = `https://api.sofascore.com/api/v1${apiPath}`;
  const proxyUrl = `${PROXY}/?url=${encodeURIComponent(fullUrl)}`;
  const { status, body } = await httpGet(proxyUrl);
  if (status === 403 || status === 429) throw new Error(`API_BLOCKED_${status}`);
  if (status !== 200) throw new Error(`HTTP_${status}`);
  return JSON.parse(body);
}

// ── CSV Parser (robust, handles quoted fields) ───────────────────────

function parseCSVPlayers() {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const idxPlayer = headers.indexOf('Player');
  const idxSquad = headers.indexOf('Squad');
  const idxSofaId = headers.indexOf('sofascore_id');

  if (idxSofaId === -1) throw new Error('Colonne sofascore_id introuvable dans le CSV');

  const players = [];
  const seen = new Set();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(',');
    const name = (cols[idxPlayer] || '').trim();
    
    // Robust sofascore_id extraction: try normal index, then last non-empty column
    let sofaId = (cols[idxSofaId] || '').trim();
    if (!sofaId || isNaN(Number(sofaId))) {
      // Fallback: last numeric column (for rows with quoted fields like "MF,FW")
      for (let j = cols.length - 1; j >= 0; j--) {
        const v = cols[j].trim();
        if (v && !isNaN(Number(v)) && Number(v) > 10000) {
          sofaId = v;
          break;
        }
      }
    }

    if (!name || !sofaId || isNaN(Number(sofaId)) || seen.has(name)) continue;
    seen.add(name);

    players.push({
      name,
      squad: (cols[idxSquad] || '').trim(),
      sofaId: Number(sofaId)
    });
  }

  return players;
}

// ── Database Setup ───────────────────────────────────────────────────

function initDB() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      sofascore_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      squad TEXT,
      matches_fetched INTEGER DEFAULT 0,
      heatmaps_fetched INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS player_matches (
      player_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      match_date INTEGER,
      tournament TEXT,
      home_team TEXT,
      away_team TEXT,
      home_score INTEGER,
      away_score INTEGER,
      heatmap_done INTEGER DEFAULT 0,
      PRIMARY KEY (player_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS spatial_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_spatial_player ON spatial_data(player_id);
    CREATE INDEX IF NOT EXISTS idx_spatial_event ON spatial_data(player_id, event_id);
    CREATE INDEX IF NOT EXISTS idx_matches_heatmap ON player_matches(heatmap_done);
  `);

  return db;
}

// ── ÉTAPE 1 : Récupérer les matchs de chaque joueur ─────────────────

async function fetchPlayerMatches(db, player) {
  const { sofaId, name } = player;

  // Check if already done
  const existing = db.prepare('SELECT matches_fetched FROM players WHERE sofascore_id = ?').get(sofaId);
  if (existing?.matches_fetched) {
    return db.prepare('SELECT COUNT(*) as cnt FROM player_matches WHERE player_id = ?').get(sofaId).cnt;
  }

  let allEvents = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      await sleep(API_DELAY_MS);
      const data = await sofaGet(`/player/${sofaId}/events/last/${page}`);
      const events = data.events || [];

      if (events.length === 0) {
        hasMore = false;
        break;
      }

      // Filter: only 25/26 season (after Aug 2025)
      const seasonStart = new Date('2025-08-01').getTime() / 1000;
      const seasonEvents = events.filter(e => e.startTimestamp >= seasonStart);

      allEvents.push(...seasonEvents);

      // If we got events before the season start, stop paging
      const oldestEvent = events[events.length - 1];
      if (oldestEvent.startTimestamp < seasonStart) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (e) {
      if (e.message.includes('API_BLOCKED')) {
        console.log(`  ⏳ API bloquée pour ${name}, pause 5s...`);
        await sleep(5000);
        continue;
      }
      console.warn(`  ⚠️ Erreur matchs ${name}: ${e.message}`);
      hasMore = false;
    }
  }

  // Insert matches into DB
  const insertMatch = db.prepare(`
    INSERT OR IGNORE INTO player_matches (player_id, event_id, match_date, tournament, home_team, away_team, home_score, away_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (sofascore_id, name, squad, matches_fetched) VALUES (?, ?, ?, 1)
  `);

  const tx = db.transaction(() => {
    insertPlayer.run(sofaId, name, player.squad);
    for (const e of allEvents) {
      insertMatch.run(
        sofaId, e.id, e.startTimestamp,
        e.tournament?.name || '',
        e.homeTeam?.name || '', e.awayTeam?.name || '',
        e.homeScore?.current ?? null, e.awayScore?.current ?? null
      );
    }
  });
  tx();

  return allEvents.length;
}

// ── ÉTAPE 2 & 3 : Aspirer les heatmaps et stocker les coordonnées ───

async function fetchHeatmaps(db) {
  const pendingMatches = db.prepare(`
    SELECT pm.player_id, pm.event_id, p.name
    FROM player_matches pm
    JOIN players p ON p.sofascore_id = pm.player_id
    WHERE pm.heatmap_done = 0
    ORDER BY pm.player_id, pm.match_date DESC
  `).all();

  if (pendingMatches.length === 0) {
    console.log('✅ Toutes les heatmaps ont déjà été collectées.');
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🗺️  ÉTAPE 2+3 : Aspiration des heatmaps`);
  console.log(`   ${pendingMatches.length} matchs à traiter`);
  console.log(`${'═'.repeat(60)}\n`);

  const insertPoint = db.prepare(`
    INSERT INTO spatial_data (player_id, event_id, x, y) VALUES (?, ?, ?, ?)
  `);
  const markDone = db.prepare(`
    UPDATE player_matches SET heatmap_done = 1 WHERE player_id = ? AND event_id = ?
  `);
  const updateHeatmapCount = db.prepare(`
    UPDATE players SET heatmaps_fetched = (
      SELECT COUNT(*) FROM player_matches WHERE player_id = ? AND heatmap_done = 1
    ) WHERE sofascore_id = ?
  `);

  let success = 0, empty = 0, errors = 0;
  let consecutiveErrors = 0;

  for (let i = 0; i < pendingMatches.length; i++) {
    const { player_id, event_id, name } = pendingMatches[i];
    const pct = ((i + 1) / pendingMatches.length * 100).toFixed(1);

    try {
      await sleep(API_DELAY_MS);
      const data = await sofaGet(`/event/${event_id}/player/${player_id}/heatmap`);
      const points = data.heatmap || data.points || [];

      if (points.length > 0) {
        const tx = db.transaction(() => {
          for (const pt of points) {
            insertPoint.run(player_id, event_id, pt.x, pt.y);
          }
          markDone.run(player_id, event_id);
          updateHeatmapCount.run(player_id, player_id);
        });
        tx();
        success++;
        consecutiveErrors = 0;
        process.stdout.write(`[${i+1}/${pendingMatches.length}] ${pct}% ✅ ${name} | Event ${event_id} → ${points.length} points\n`);
      } else {
        markDone.run(player_id, event_id);
        empty++;
        consecutiveErrors = 0;
        process.stdout.write(`[${i+1}/${pendingMatches.length}] ${pct}% ⚪ ${name} | Event ${event_id} → vide\n`);
      }
    } catch (e) {
      errors++;
      consecutiveErrors++;

      if (e.message.includes('API_BLOCKED')) {
        const wait = Math.min(3000 * consecutiveErrors, 15000);
        process.stdout.write(`[${i+1}/${pendingMatches.length}] ${pct}% 🚫 ${name} | Event ${event_id} → bloqué (pause ${wait}ms)\n`);
        await sleep(wait);
      } else {
        process.stdout.write(`[${i+1}/${pendingMatches.length}] ${pct}% ❌ ${name} | Event ${event_id} → ${e.message}\n`);
      }

      // Safety: if too many consecutive errors, bail
      if (consecutiveErrors >= 10) {
        console.log(`\n🛑 10 erreurs consécutives, arrêt de sécurité.`);
        break;
      }
    }

    // Progress save every 50 matches
    if ((i + 1) % 50 === 0) {
      const totalPoints = db.prepare('SELECT COUNT(*) as cnt FROM spatial_data').get().cnt;
      console.log(`\n💾 Progression : ${success} heatmaps, ${totalPoints} points en base\n`);
    }
  }

  // Final stats
  const totalPoints = db.prepare('SELECT COUNT(*) as cnt FROM spatial_data').get().cnt;
  const totalPlayers = db.prepare('SELECT COUNT(DISTINCT player_id) FROM spatial_data').get()['COUNT(DISTINCT player_id)'];
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 BILAN HEATMAPS`);
  console.log(`   Succès      : ${success}`);
  console.log(`   Vides       : ${empty}`);
  console.log(`   Erreurs     : ${errors}`);
  console.log(`   Total pts   : ${totalPoints}`);
  console.log(`   Joueurs     : ${totalPlayers}`);
  console.log(`${'═'.repeat(60)}\n`);
}

// ── MAIN ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🚀 PIPELINE SPATIAL DATA · SOFASCORE HEATMAPS`);
  console.log(`   Base SQLite : ${DB_PATH}`);
  console.log(`   Proxy       : ${PROXY}`);
  console.log(`   Batch       : ${BATCH_SIZE} premiers joueurs`);
  console.log(`   Délai API   : ${API_DELAY_MS}ms`);
  console.log(`${'═'.repeat(60)}\n`);

  // 1. Parse CSV
  const allPlayers = parseCSVPlayers();
  console.log(`📊 ${allPlayers.length} joueurs avec sofascore_id dans le CSV`);

  // Limit to first batch
  const batch = allPlayers.slice(0, BATCH_SIZE);
  console.log(`🎯 Traitement du lot : ${batch.length} joueurs\n`);

  // 2. Init DB
  const db = initDB();

  // ── ÉTAPE 1 : Récupération des matchs ──────────────────────────────
  console.log(`${'═'.repeat(60)}`);
  console.log(`📋 ÉTAPE 1 : Récupération des matchs (events)`);
  console.log(`${'═'.repeat(60)}\n`);

  let totalMatches = 0;

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    const pct = ((i + 1) / batch.length * 100).toFixed(1);

    try {
      const count = await fetchPlayerMatches(db, p);
      totalMatches += count;
      process.stdout.write(`[${i+1}/${batch.length}] ${pct}% ✅ ${p.name} (${p.squad}) → ${count} matchs\n`);
    } catch (e) {
      process.stdout.write(`[${i+1}/${batch.length}] ${pct}% ❌ ${p.name} → ${e.message}\n`);
    }

    // Progress every 25
    if ((i + 1) % 25 === 0) {
      const dbMatches = db.prepare('SELECT COUNT(*) as cnt FROM player_matches').get().cnt;
      console.log(`\n💾 ${dbMatches} matchs en base (${i+1} joueurs traités)\n`);
    }
  }

  const dbMatchesTotal = db.prepare('SELECT COUNT(*) as cnt FROM player_matches').get().cnt;
  console.log(`\n✅ ÉTAPE 1 TERMINÉE : ${dbMatchesTotal} matchs en base pour ${batch.length} joueurs\n`);

  // ── ÉTAPES 2+3 : Heatmaps ─────────────────────────────────────────
  await fetchHeatmaps(db);

  // ── Résumé final ──────────────────────────────────────────────────
  const stats = {
    players: db.prepare('SELECT COUNT(*) as cnt FROM players').get().cnt,
    matches: db.prepare('SELECT COUNT(*) as cnt FROM player_matches').get().cnt,
    points: db.prepare('SELECT COUNT(*) as cnt FROM spatial_data').get().cnt,
    playersWithData: db.prepare('SELECT COUNT(DISTINCT player_id) as cnt FROM spatial_data').get().cnt,
  };

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏁 PIPELINE TERMINÉ`);
  console.log(`   Joueurs traités  : ${stats.players}`);
  console.log(`   Matchs en base   : ${stats.matches}`);
  console.log(`   Points spatiaux  : ${stats.points}`);
  console.log(`   Joueurs avec data: ${stats.playersWithData}`);
  console.log(`   Fichier DB       : ${DB_PATH}`);
  console.log(`${'═'.repeat(60)}\n`);

  db.close();
}

main().catch(e => { console.error('❌ Erreur fatale:', e); process.exit(1); });
