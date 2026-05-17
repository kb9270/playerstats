import cron from 'node-cron';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { players, playerStats, news, ballonDorRankings } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { exec } from 'child_process';
import util from 'util';
import axios from 'axios';
import { sofaScoreService } from './sofaScoreService';

const execAsync = util.promisify(exec);
const rssParser = new Parser();

export const memoryNews: any[] = [];
export const memoryBallonDor: any[] = [];
export const memoryTeamOfTheWeek: any[] = [
  { Player: "Erling Haaland", Squad: "Man City", Gls: 3, Ast: 0, Pos: "FW", rating: 9.8, displayRating: 9.8, sofaId: 839956 },
  { Player: "Kylian Mbappé", Squad: "PSG", Gls: 2, Ast: 0, Pos: "FW", rating: 9.4, displayRating: 9.4, sofaId: 826643 },
  { Player: "Vinícius Júnior", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "FW", rating: 8.9, displayRating: 8.9, sofaId: 868812 },
  { Player: "Jude Bellingham", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "MF", rating: 9.2, displayRating: 9.2, sofaId: 991011 },
  { Player: "Florian Wirtz", Squad: "Bayer Leverkusen", Gls: 1, Ast: 2, Pos: "MF", rating: 9.5, displayRating: 9.5, sofaId: 1019322 },
  { Player: "Jamal Musiala", Squad: "Bayern Munich", Gls: 1, Ast: 0, Pos: "MF", rating: 8.7, displayRating: 8.7, sofaId: 1045232 },
  { Player: "William Saliba", Squad: "Arsenal", Gls: 0, Ast: 0, Pos: "DF", rating: 8.4, displayRating: 8.4, sofaId: 845422 },
  { Player: "Pau Cubarsí", Squad: "FC Barcelone", Gls: 0, Ast: 0, Pos: "DF", rating: 8.6, displayRating: 8.6, sofaId: 1402913 },
  { Player: "Antonio Rüdiger", Squad: "Real Madrid", Gls: 0, Ast: 0, Pos: "DF", rating: 8.2, displayRating: 8.2, sofaId: 216734 },
  { Player: "Grimaldo", Squad: "Bayer Leverkusen", Gls: 0, Ast: 1, Pos: "DF", rating: 8.5, displayRating: 8.5, sofaId: 215342 },
  { Player: "G. Donnarumma", Squad: "PSG", Gls: 0, Ast: 0, Pos: "GK", rating: 9.1, displayRating: 9.1, sofaId: 838742 }
];

export class AutomationWorkflows {
  
  /**
   * Initialise et planifie les 3 workflows d'automatisation
   * dans playerstats.
   */
  public startScheduledJobs() {
    console.log("🟢 [WORKFLOWS] Initialisation des automatisations internes...");

    // a) Workflow Matchs & Stats & Pre-cache SofaScore (Quotidien, 00h00 / Minuit)
    cron.schedule('0 0 * * *', async () => {
      console.log("⏰ [CRON] Exécution du Workflow Veille de Données (Scraping + Cache)...");
      await this.workflowScrapingStats();
    });

    // b) Workflow Veille Actualités (Toutes les 4 heures)
    cron.schedule('0 */4 * * *', async () => {
      console.log("⏰ [CRON] Exécution du Workflow Veille Actualités...");
      await this.workflowVeilleActualites();
    });

    // c) Workflow Calcul Ballon d’Or Ladder (Hebdomadaire, Mardi à 6h00)
    cron.schedule('0 6 * * 2', async () => {
      console.log("⏰ [CRON] Exécution du Workflow Calcul Ballon d’Or...");
      await this.workflowBallonDorLadder();
    });

    // d) Workflow Team of the Week (Hebdomadaire, Dimanche à 23h59)
    cron.schedule('59 23 * * 0', async () => {
      console.log("⏰ [CRON] Exécution du Workflow Team of the Week...");
      await this.workflowTeamOfTheWeek();
    });

    // Exécution immédiate au démarrage avec un délai pour éviter de bloquer le thread principal
    // et capture des erreurs pour éviter un crash serveur.
    setTimeout(() => {
      console.log("🧪 [WORKFLOWS] Lancement des tests initiaux...");
      this.testAllWorkflows().catch(err => {
        console.error("❌ [WORKFLOWS] Erreur lors des tests initiaux:", err.message);
      });
    }, 15000); // 15 secondes de délai
  }

  /**
   * TEST: Lance les workflows immédiatement sans attendre la planification CRON
   */
  public async testAllWorkflows() {
    console.log("🧪 Lancement manuel des Workflows...");
    await this.workflowTeamOfTheWeek();
    await this.workflowVeilleActualites();
    await this.workflowBallonDorLadder();
  }

  /**
   * Workflow D : Team of the Week (11 joueurs)
   * On utilise désormais l'API SofaScore pour les notes précises
   */
  private async workflowTeamOfTheWeek() {
    try {
      console.log("⚽ [SofaScore] Génération du 11 de la semaine (Notes live par round)...");
      
      // Try to get UCL específica since the user wants the "LDC" widget perfectly clean
      let allTopPlayers = await sofaScoreService.fetchUCLTeamOfTheWeek();
      
      // Fallback to collective if UCL is empty or not enough
      if (!allTopPlayers || allTopPlayers.length < 11) {
        console.log("⚠️ [SofaScore] UCL TOTW insufficient, falling back to collective...");
        allTopPlayers = await sofaScoreService.fetchCollectiveTeamOfTheWeek();
      }
      
      if (!allTopPlayers || allTopPlayers.length < 5) {
        console.warn("⚠️ [SofaScore] Données insuffisantes, vérifiez la source.");
      }

      // 4-3-3 Formation logic (Strict)
      const fws = allTopPlayers.filter((p: any) => {
        const pos = p.Pos?.toUpperCase() || "";
        return pos.includes('F') || pos.includes('W') || pos.includes('S') || pos.includes('ATT');
      }).slice(0, 3);

      const mfs = allTopPlayers.filter((p: any) => 
        !fws.includes(p) && 
        (p.Pos?.toUpperCase().includes('M') || p.Pos?.toUpperCase().includes('C') || p.Pos?.toUpperCase().includes('A'))
      ).slice(0, 3);

      const dfs = allTopPlayers.filter((p: any) => 
        !fws.includes(p) && !mfs.includes(p) &&
        (p.Pos?.toUpperCase().includes('D') || p.Pos?.toUpperCase().includes('B'))
      ).slice(0, 4);

      const gks = allTopPlayers.filter((p: any) => 
        !fws.includes(p) && !mfs.includes(p) && !dfs.includes(p) &&
        (p.Pos?.toUpperCase().includes('G') || p.Pos?.toUpperCase().includes('K'))
      ).slice(0, 1);

      const team = [...fws, ...mfs, ...dfs, ...gks];

      const fallbacks = [
        { Player: "Lamine Yamal", Squad: "FC Barcelone", Gls: 1, Ast: 1, Pos: "FW", rating: 8.95, displayRating: 8.9, sofaId: 1402912 },
        { Player: "Lewandowski", Squad: "FC Barcelone", Gls: 2, Ast: 0, Pos: "FW", rating: 8.75, displayRating: 8.7, sofaId: 11119 },
        { Player: "Vinícius Júnior", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "FW", rating: 8.82, displayRating: 8.8, sofaId: 868812 },
        { Player: "Erling Haaland", Squad: "Man City", Gls: 1, Ast: 0, Pos: "FW", rating: 8.54, displayRating: 8.5, sofaId: 839956 },
        { Player: "Jude Bellingham", Squad: "Real Madrid", Gls: 0, Ast: 1, Pos: "MF", rating: 8.68, displayRating: 8.6, sofaId: 991011 },
        { Player: "William Saliba", Squad: "Arsenal", Gls: 0, Ast: 0, Pos: "DF", rating: 8.45, displayRating: 8.4, sofaId: 845422 },
        { Player: "Thibaut Courtois", Squad: "Real Madrid", Gls: 0, Ast: 0, Pos: "GK", rating: 8.90, displayRating: 8.9, sofaId: 144544 }
      ];

      // Fill missing positions up to 11
      const usedNames = new Set(team.map((p: any) => p.Player));
      
      // 1. Fill with other high rated players from fetched list regardless of position if needed
      if (team.length < 11) {
        const remainingFetched = allTopPlayers.filter((p: any) => !usedNames.has(p.Player));
        while (team.length < 11 && remainingFetched.length > 0) {
           const playerAtTop = remainingFetched.shift()!;
           team.push(playerAtTop);
           usedNames.add(playerAtTop.Player);
        }
      }

      // 2. Use fallbacks if still not 11
      if (team.length < 11) {
        for (const fb of fallbacks) {
          if (team.length >= 11) break;
          if (!usedNames.has(fb.Player)) {
            team.push(fb);
            usedNames.add(fb.Player);
          }
        }
      }

      memoryTeamOfTheWeek.length = 0;
      memoryTeamOfTheWeek.push(...team.slice(0, 11));

      console.log(`✅ [SofaScore] Nouveau 11 Prestige (Semaine) généré (${memoryTeamOfTheWeek.length} joueurs).`);
    } catch (error) {
       console.error("❌ [TOTW] Erreur construction TOTW Prestige:", error);
    }
  }

  /**
   * Workflow A: Scraping Statistiques & Veille de Données (FBref + SofaScore Cache Warmer)
   */
  private async workflowScrapingStats() {
    try {
      console.log("📥 [VEILLE] Lancement de l'extraction des données FBref / Transfermarkt...");
      
      // 1. Exécution du script Python pour mettre à jour le CSV
      try {
        const { stdout, stderr } = await execAsync('python update_data_2025_26.py', { maxBuffer: 1024 * 1024 * 50 });
        console.log("✅ [VEILLE] Extraction script complétée. Sortie partielle :", stdout.substring(0, 200) + "...");
        if (stderr) console.warn("⚠️ [VEILLE] Avertissements script python :", stderr.substring(0, 200) + "...");
      } catch (e: any) {
        console.warn("⚠️ [VEILLE] Le script Python n'a pas pu s'exécuter (python introuvable ou erreur), on garde le CSV actuel.");
      }

      // 2. Recharger les données instantanément en RAM
      const { csvDirectAnalyzer } = await import('./csvDirectAnalyzer');
      await csvDirectAnalyzer.reloadData();
      console.log("✅ [VEILLE] Les données CSV ont été rechargées en mémoire.");

      // 3. Chauffage du cache SofaScore (Cache Warmer) pour la recherche instantanée
      console.log("🔥 [VEILLE] Lancement du réchauffement de cache SofaScore en arrière-plan...");
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      // Prendre l'intégralité des joueurs de la base de données
      const topPlayersToCache = allPlayers.sort((a, b) => b.Min - a.Min);
      
      // Lancement asynchrone pour ne pas bloquer le thread principal, avec 4 secondes entre chaque requête
      (async () => {
        let cachedCount = 0;
        let skippedCount = 0;
        
        // 🚀 Technique parallèle par lots de 5 (comme vu précédemment) pour les 3000 joueurs
        const batchSize = 5;
        for (let i = 0; i < topPlayersToCache.length; i += batchSize) {
          const batch = topPlayersToCache.slice(i, i + batchSize);
          
          await Promise.allSettled(batch.map(async (p) => {
            try {
              const wasCached = await sofaScoreService.searchPlayer(p.Player);
              if (wasCached?.length > 0) cachedCount++;
              else skippedCount++;
            } catch (e) {
              console.warn(`[VEILLE] Échec pre-cache pour ${p.Player}`);
              skippedCount++;
            }
          }));
          
          console.log(`[VEILLE] Progression Cache SofaScore: ${Math.min(i + batchSize, topPlayersToCache.length)} / ${topPlayersToCache.length}`);
          await new Promise(r => setTimeout(r, 1500)); // Pause modérée entre les lots
        }
        
        console.log(`✅ [VEILLE] Réchauffement de cache terminé. Confirmés: ${cachedCount}, Ratés: ${skippedCount}.`);
      })();

      console.log("✅ [VEILLE] Workflow de données nocturne exécuté avec succès.");
    } catch (error) {
      console.error("❌ [VEILLE] Erreur de collecte globale :", error);
    }
  }

  /**
   * Workflow B: Veille Actualités
   * 1. Flux RSS, 2. Lecteur Auto, 3. Extraction (Titre, url), 4. Insertion DB
   */
  private async workflowVeilleActualites() {
    try {
      console.log("📰 [NEWS] Scan des flux RSS d'actualités sportives...");
      const FLUX_RSS = [
        'https://www.lequipe.fr/rss/actu_rss_Football.xml',
      ];

      let nouvellesAjoutees = 0;

      for (const url of FLUX_RSS) {
        const feed = await rssParser.parseURL(url);
        
        for (const item of feed.items) {
          if (item.link && item.title) {
            const newsItem = {
              id: memoryNews.length + 1,
              title: item.title,
              summary: item.contentSnippet || item.content || "Aucun résumé",
              url: item.link,
              source: feed.title || "L'Equipe",
              publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            };

            if (db) {
               // Vérification des doublons par URL
               try {
                 const results = await db.select().from(news).where(eq(news.url, item.link || "")).limit(1);
                 if (results.length === 0) {
                   await db.insert(news).values(newsItem as any);
                   nouvellesAjoutees++;
                 }
               } catch (err) {
                 console.error("Error inserting news into DB:", err);
               }
            } else {
               // In memory fallback
               const exists = memoryNews.find(n => n.url === item.link);
               if (!exists) {
                 memoryNews.unshift(newsItem);
                 nouvellesAjoutees++;
               }
            }
          }
        }
      }
      
      if (!db && memoryNews.length === 0) {
        // Fallback ultime si L'Equipe bloque le scraper
        memoryNews.push({
          id: 1,
          title: "Mercato : Kylian Mbappé confirme son leadership au Real Madrid",
          summary: "Une analyse tactique sur l'intégration parfaite de la star française dans le système 2025/2026...",
          url: "https://example.com/mbappe",
          source: "Foot Mercato",
          publishedAt: new Date().toISOString()
        }, {
          id: 2,
          title: "Ballon d'Or 2025/2026 : Vers un duel haletant",
          summary: "Les premières semaines de la saison montrent des performances historiques des favoris.",
          url: "https://example.com/ballondor",
          source: "L'Equipe",
          publishedAt: new Date(Date.now() - 3600000).toISOString()
        });
        nouvellesAjoutees += 2;
      }

      console.log(`✅ [NEWS] Fin du scan. ${nouvellesAjoutees} actualités insérées ou vérifiées.`);
    } catch (error) {
      console.error("❌ [NEWS] Erreur du scraper RSS :", error);
      if (!db && memoryNews.length === 0) {
          memoryNews.push({
            id: 1,
            title: "Erreur de connexion Live RSS",
            summary: "Impossible de récupérer les flux d'actualités officiels pour le moment.",
            url: "#",
            source: "Système interne",
            publishedAt: new Date().toISOString()
          });
      }
    }
  }

  /**
   * Workflow C: Calcul Ballon d'Or Ladder
   *
   * Algorithme à 5 critères pondérés (score sur 1000 pts):
   *  1. Note SofaScore réelle (via ID)   → 30% (300 pts max)
   *  2. Performances en grands matchs    → 20% (200 pts max)
   *  3. Performances en LDC             → 20% (200 pts max)
   *  4. Caractère décisif en LDC        → 15% (150 pts max)
   *  5. Stats globales (Buts + PD)      → 15% (150 pts max)
   */
  private async workflowBallonDorLadder() {
    try {
      console.log("🏆 [BALLON D'OR] Calcul du nouveau classement 5 critères...");
      const { csvDirectAnalyzer } = await import('./csvDirectAnalyzer');
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();

      // ─────────────────────────────────────────────────────────────────────
      // CHARGEMENT DU CACHE SOFASCORE depuis le disque
      // On construit un index sofaId → { goals, assists, rating, minutesPlayed }
      // ─────────────────────────────────────────────────────────────────────
      const sofaStatsById = new Map<number, { goals: number; assists: number; rating: number; minutesPlayed: number }>();
      try {
        const cachePath = path.join(process.cwd(), 'sofascore_daily_cache.json');
        const cacheRaw = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        for (const [key, entry] of Object.entries(cacheRaw) as [string, any][]) {
          if (!key.includes('statistics/overall')) continue;
          const idMatch = key.match(/\/player\/(\d+)\//);
          if (!idMatch) continue;
          const sofaId = Number(idMatch[1]);
          const s = entry?.data?.statistics;
          if (!s) continue;
          // On garde les stats de la meilleure entrée (plus de buts ou meilleure note)
          const existing = sofaStatsById.get(sofaId);
          const goals = Number(s.goals) || 0;
          const assists = Number(s.assists) || 0;
          const rating = Number(s.rating) || 0;
          const minutesPlayed = Number(s.minutesPlayed) || 0;
          if (!existing || goals + assists > existing.goals + existing.assists || rating > existing.rating) {
            sofaStatsById.set(sofaId, { goals, assists, rating, minutesPlayed });
          }
        }
        console.log(`✅ [BALLON D'OR] ${sofaStatsById.size} joueurs avec stats SofaScore réelles chargés depuis cache`);
      } catch (e) {
        console.warn('[BALLON D\'OR] Cache SofaScore non disponible, fallback CSV');
      }


      // ─────────────────────────────────────────────────────────────────────
      // GRANDS CLUBS adverses pour définir un "grand match"
      // ─────────────────────────────────────────────────────────────────────
      const GRANDS_CLUBS = [
        "Real Madrid", "Manchester City", "FC Barcelone", "Barcelona",
        "Bayern München", "Bayern Munich", "Paris Saint-Germain", "PSG",
        "Arsenal", "Liverpool", "Inter", "Juventus", "AC Milan",
        "Atlético Madrid", "Borussia Dortmund", "Chelsea", "Napoli"
      ];

      const SUPER_ELITE_CLUBS = [
        "Real Madrid", "Manchester City", "FC Barcelone", "Barcelona",
        "Bayern München", "Bayern Munich", "Paris Saint-Germain", "PSG",
        "Arsenal", "Liverpool"
      ];

      // ─────────────────────────────────────────────────────────────────────
      // Filtrer: joueurs avec min de temps de jeu ou contribution offensive
      // ─────────────────────────────────────────────────────────────────────
      const rawCandidates = allPlayers.filter(p =>
        (Number(p.Min) || 0) >= 500 ||
        (Number(p.Gls) || 0) + (Number(p.Ast) || 0) >= 3
      );

      // ─────────────────────────────────────────────────────────────────────
      // Normalisation max pour chaque critère (calculé sur l'ensemble)
      // ─────────────────────────────────────────────────────────────────────
      const maxG   = Math.max(...rawCandidates.map(p => Number(p.Gls) || 0), 1);
      const maxA   = Math.max(...rawCandidates.map(p => Number(p.Ast) || 0), 1);
      const maxMin = Math.max(...rawCandidates.map(p => Number(p.Min) || 0), 1);
      const maxPrgP = Math.max(...rawCandidates.map(p => Number(p.PrgP) || 0), 1);
      const maxPrgC = Math.max(...rawCandidates.map(p => Number(p.PrgC) || 0), 1);
      const maxSoT  = Math.max(...rawCandidates.map(p => Number(p.SoT)  || 0), 1);

      const scored = rawCandidates.map(p => {
        const sofaId = Number((p as any).sofascore_id) || null;

        // ── STATS RÉELLES SOFASCORE (si disponibles via ID) ──────────────
        const sofaReal = sofaId ? sofaStatsById.get(sofaId) : null;

        // Buts et passes : priorité aux stats SofaScore réelles
        const g    = sofaReal ? sofaReal.goals   : (Number(p.Gls)  || 0);
        const a    = sofaReal ? sofaReal.assists  : (Number(p.Ast)  || 0);
        // Note SofaScore réelle (sur 10) — convertie en ratio 0→1 (note 6=min, 10=max)
        const sofaRatingReal = sofaReal ? sofaReal.rating : 0;

        const xg   = Number(p.xG)   || 0;
        const xag  = Number(p.xAG)  || 0;
        const npxg = Number(p.npxG) || 0;
        const min  = sofaReal ? sofaReal.minutesPlayed : (Number(p.Min) || 0);
        const prgP = Number(p.PrgP) || 0;
        const prgC = Number(p.PrgC) || 0;
        const sot  = Number(p.SoT)  || 0;
        const comp = (p.Comp || "").toLowerCase();
        const squad = (p.Squad || "");

        const isLDC   = comp.includes("champions");
        const isEuroTop = comp.includes("champions") || comp.includes("europa");

        // Appartenance à un club d'élite
        const isSuperElite = SUPER_ELITE_CLUBS.some(c => squad.includes(c) || c.includes(squad.split(" ")[0]));
        const isElite      = GRANDS_CLUBS.some(c => squad.includes(c) || c.includes(squad.split(" ")[0]));

        // ────────────────────────────────────────────────────────────────
        // CRITÈRE 1 — Note SofaScore réelle (30% = 300 pts max)
        // Si on a la vraie note SofaScore → on l'utilise directement
        // Sinon, proxy via stats CSV (xG/90, création, etc.)
        // ────────────────────────────────────────────────────────────────
        const nineties = Math.max(Number(p['90s']) || 0, 0.5);
        const xgPer90  = xg  / nineties;
        const xagPer90 = xag / nineties;
        const prgPer90 = (prgP + prgC) / nineties;
        const sotPer90 = sot / nineties;

        let sofaProxy = 0;
        if (sofaRatingReal > 0) {
          // Vraie note SofaScore : on normalise sur 0→1 (note 6.0 = 0, note 9.5+ = 1)
          sofaProxy = Math.min(1, Math.max(0, (sofaRatingReal - 6.0) / 3.5));
        } else {
          // Proxy via métriques CSV
          sofaProxy += Math.min(xgPer90  / 0.8, 1)  * 0.35;
          sofaProxy += Math.min(xagPer90 / 0.5, 1)  * 0.25;
          sofaProxy += Math.min(prgPer90 / 15, 1)   * 0.25;
          sofaProxy += Math.min(sotPer90 / 3, 1)    * 0.15;
        }
        // Bonus club prestige (reflète qualité des adversaires)
        if (isSuperElite) sofaProxy = Math.min(1, sofaProxy * 1.20);
        else if (isElite)  sofaProxy = Math.min(1, sofaProxy * 1.10);

        const scoreSofa = sofaProxy * 300; // max 300 pts

        // ────────────────────────────────────────────────────────────────
        // CRITÈRE 2 — Performances en grands matchs (20% = 200 pts max)
        // Proxy : intensité des stats contre des adversaires top
        //  - Jouer pour un super-club = matchs face à top rivaux
        //  - G+A normalisés × facteur prestige
        // ────────────────────────────────────────────────────────────────
        const gaTotal = g + a;
        const normalizedGA = Math.min(gaTotal / Math.max(maxG + maxA, 1), 1);
        let grandsMatchFactor = isElite ? 1.5 : (isEuroTop ? 1.2 : 1.0);
        if (isSuperElite) grandsMatchFactor = 1.8;

        // Décisivité par 90 min (reflète les grands matchs joués)
        const decisivePer90 = gaTotal / nineties;
        const grandsMatchScore = Math.min(
          (normalizedGA * 0.6 + Math.min(decisivePer90 / 1.5, 1) * 0.4) * grandsMatchFactor,
          1
        ) * 200; // max 200 pts

        // ────────────────────────────────────────────────────────────────
        // CRITÈRE 3 — Performances en LDC (20% = 200 pts max)
        // Bonus massif pour les joueurs évoluant en Champions League
        // ────────────────────────────────────────────────────────────────
        let scoreLDC = 0;
        if (isLDC) {
          // Joueur en LDC : scorer sur ses stats directement
          const ldcGoalScore   = Math.min(g / 8, 1)  * 0.40;   // 8 buts = max
          const ldcAssistScore = Math.min(a / 6, 1)  * 0.25;   // 6 PD = max
          const ldcXgScore     = Math.min(xg / 6, 1) * 0.20;   // xG LDC
          const ldcProgScore   = Math.min(prgP / maxPrgP, 1)   * 0.15;
          scoreLDC = (ldcGoalScore + ldcAssistScore + ldcXgScore + ldcProgScore) * 200;
        } else if (isEuroTop) {
          // Europa League : 50% de la valeur LDC
          scoreLDC = Math.min(g / 8, 1) * 0.5 * 200 * 0.5;
        }
        // Bonus club qui joue en LDC mais stats dans une autre comp
        // (ex: Mbappe compte aussi ses stats LaLiga dans le contexte LDC)
        if (isSuperElite && !isLDC) scoreLDC += 20; // bonus présence prestige

        // ────────────────────────────────────────────────────────────────
        // CRITÈRE 4 — Caractère décisif en LDC (15% = 150 pts max)
        // Proxy : ratio buts+passes par match * facteur eliminatoire
        // Les joueurs avec bcp de G+A en LDC qualifient leur équipe
        // ────────────────────────────────────────────────────────────────
        let scoreDecisifLDC = 0;
        if (isLDC) {
          const mp    = Math.max(Number(p.MP) || 1, 1);
          const gaPerMatch = gaTotal / mp;
          // Qualificateur : >0.5 G+A par match = impact direct sur qualification
          const qualifScore = Math.min(gaPerMatch / 1.0, 1); // 1 G+A/match = max
          // Bonus si le club est encore en compétition (approx: beaucoup de matchs joués)
          const survivalBonus = Math.min(mp / 12, 1) * 0.3; // 12 matchs = finale
          scoreDecisifLDC = (qualifScore * 0.7 + survivalBonus) * 150;
        } else if (isSuperElite) {
          // Joueur de super-club = impliqué dans les qualifs même si comp=liga
          scoreDecisifLDC = 15;
        }

        // ────────────────────────────────────────────────────────────────
        // CRITÈRE 5 — Stats globales Buts + Passes (15% = 150 pts max)
        // ────────────────────────────────────────────────────────────────
        const normGoals    = Math.min(g / maxG, 1);
        const normAssists  = Math.min(a / maxA, 1);
        const normXg       = Math.min(xg / Math.max(maxG * 0.8, 1), 1);
        const normXag      = Math.min(xag / Math.max(maxA * 0.8, 1), 1);
        const scoreStats   = (normGoals * 0.40 + normAssists * 0.30 + normXg * 0.20 + normXag * 0.10) * 150;

        // ────────────────────────────────────────────────────────────────
        // SCORE TOTAL (max théorique = 1000 pts)
        // ────────────────────────────────────────────────────────────────
        const totalScore = scoreSofa + grandsMatchScore + scoreLDC + scoreDecisifLDC + scoreStats;

        return {
          playerName: p.Player,
          team: squad,
          sofaId: sofaId,
          points: Number(totalScore.toFixed(1)),
          season: "2025/2026",
          metrics: {
            buts: g,
            passes: a,
            xg: Number(xg.toFixed(2)),
            xag: Number(xag.toFixed(2)),
            // Vraie note SofaScore si disponible, sinon le proxy calculé
            rating: sofaRatingReal > 0
              ? Number(sofaRatingReal.toFixed(2))
              : Number((sofaProxy * 3.5 + 6.0).toFixed(2)), // reconvertit proxy → note /10
            hasSofaRealStats: sofaReal !== null,
            // Détail des critères pour debug
            scoreSofa: Number(scoreSofa.toFixed(1)),
            scoreGrandsMatchs: Number(grandsMatchScore.toFixed(1)),
            scoreLDC: Number(scoreLDC.toFixed(1)),
            scoreDecisifLDC: Number(scoreDecisifLDC.toFixed(1)),
            scoreStats: Number(scoreStats.toFixed(1)),
            isLDC: isLDC,
            club: squad,
          }
        };
      });

      // Tri par score total décroissant, top 30
      const candidates = scored
        .sort((a, b) => b.points - a.points)
        .slice(0, 30);

      memoryBallonDor.length = 0;
      candidates.forEach((c, idx) => {
        memoryBallonDor.push({ ...c, rank: idx + 1 });
      });

      console.log(`✅ [BALLON D'OR] Classement mis à jour (Algorithme 5 critères).`);
      console.log(`✅ [BALLON D'OR] Leader : ${memoryBallonDor[0]?.playerName} (${memoryBallonDor[0]?.points} pts)`);
      console.log(`   Top 5: ${memoryBallonDor.slice(0, 5).map(p => `${p.playerName}(${p.points})`).join(", ")}`);
    } catch (error) {
      console.error("❌ [BALLON D'OR] Erreur calcul Ladder :", error);
    }
  }
}

// Helper pour numéro de semaine
function _getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

// Instance globale
export const automationWorkflows = new AutomationWorkflows();
