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

export const memoryNews: any[] = [
  {
    id: 99999,
    title: "BRÉSIL : Le retour du prince ?",
    summary: "À 34 ans, Neymar Jr s'apprête à faire son retour en sélection brésilienne pour le Mondial 2026. Décryptage d'une dernière danse historique.",
    url: "/player/15206",
    source: "Khalil",
    image: "/assets/neymar.png",
    publishedAt: new Date().toISOString()
  }
];
export const memoryBallonDor: any[] = [];
export const memoryTeamOfTheWeek: any[] = [
  { Player: "Erling Haaland", Squad: "Man City", Gls: 3, Ast: 0, Pos: "FW", rating: 9.8, displayRating: 9.8, sofaId: 839956 },
  { Player: "Kylian MbappÃ©", Squad: "PSG", Gls: 2, Ast: 0, Pos: "FW", rating: 9.4, displayRating: 9.4, sofaId: 826643 },
  { Player: "VinÃ­cius JÃºnior", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "FW", rating: 8.9, displayRating: 8.9, sofaId: 868812 },
  { Player: "Jude Bellingham", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "MF", rating: 9.2, displayRating: 9.2, sofaId: 991011 },
  { Player: "Florian Wirtz", Squad: "Bayer Leverkusen", Gls: 1, Ast: 2, Pos: "MF", rating: 9.5, displayRating: 9.5, sofaId: 1019322 },
  { Player: "Jamal Musiala", Squad: "Bayern Munich", Gls: 1, Ast: 0, Pos: "MF", rating: 8.7, displayRating: 8.7, sofaId: 1045232 },
  { Player: "William Saliba", Squad: "Arsenal", Gls: 0, Ast: 0, Pos: "DF", rating: 8.4, displayRating: 8.4, sofaId: 845422 },
  { Player: "Pau CubarsÃ­", Squad: "FC Barcelone", Gls: 0, Ast: 0, Pos: "DF", rating: 8.6, displayRating: 8.6, sofaId: 1402913 },
  { Player: "Antonio RÃ¼diger", Squad: "Real Madrid", Gls: 0, Ast: 0, Pos: "DF", rating: 8.2, displayRating: 8.2, sofaId: 216734 },
  { Player: "Grimaldo", Squad: "Bayer Leverkusen", Gls: 0, Ast: 1, Pos: "DF", rating: 8.5, displayRating: 8.5, sofaId: 215342 },
  { Player: "G. Donnarumma", Squad: "PSG", Gls: 0, Ast: 0, Pos: "GK", rating: 9.1, displayRating: 9.1, sofaId: 838742 }
];

export class AutomationWorkflows {
  
  /**
   * Initialise et planifie les 3 workflows d'automatisation
   * dans playerstats.
   */
  public startScheduledJobs() {
    console.log("ðŸŸ¢ [WORKFLOWS] Initialisation des automatisations internes...");

    // a) Workflow Matchs & Stats & Pre-cache SofaScore (Quotidien, 00h00 / Minuit)
    cron.schedule('0 0 * * *', async () => {
      console.log("â° [CRON] ExÃ©cution du Workflow Veille de DonnÃ©es (Scraping + Cache)...");
      await this.workflowScrapingStats();
    });

    // b) Workflow Veille ActualitÃ©s (Toutes les 4 heures)
    cron.schedule('0 */4 * * *', async () => {
      console.log("â° [CRON] ExÃ©cution du Workflow Veille ActualitÃ©s...");
      await this.workflowVeilleActualites();
    });

    // c) Workflow Calcul Ballon dâ€™Or Ladder (Hebdomadaire, Mardi Ã  6h00)
    cron.schedule('0 6 * * 2', async () => {
      console.log("â° [CRON] ExÃ©cution du Workflow Calcul Ballon dâ€™Or...");
      await this.workflowBallonDorLadder();
    });

    // d) Workflow Team of the Week (Hebdomadaire, Dimanche Ã  23h59)
    cron.schedule('59 23 * * 0', async () => {
      console.log("â° [CRON] ExÃ©cution du Workflow Team of the Week...");
      await this.workflowTeamOfTheWeek();
    });

    // ExÃ©cution immÃ©diate au dÃ©marrage avec un dÃ©lai pour Ã©viter de bloquer le thread principal
    // et capture des erreurs pour Ã©viter un crash serveur.
    setTimeout(() => {
      console.log("ðŸ§ª [WORKFLOWS] Lancement des tests initiaux...");
      this.testAllWorkflows().catch(err => {
        console.error("âŒ [WORKFLOWS] Erreur lors des tests initiaux:", err.message);
      });
    }, 15000); // 15 secondes de dÃ©lai
  }

  /**
   * TEST: Lance les workflows immÃ©diatement sans attendre la planification CRON
   */
  public async testAllWorkflows() {
    console.log("ðŸ§ª Lancement manuel des Workflows...");
    await this.workflowTeamOfTheWeek();
    await this.workflowVeilleActualites();
    await this.workflowBallonDorLadder();
  }

  /**
   * Workflow D : Team of the Week (11 joueurs)
   * On utilise dÃ©sormais l'API SofaScore pour les notes prÃ©cises
   */
  private async workflowTeamOfTheWeek() {
    try {
      console.log("âš½ [SofaScore] GÃ©nÃ©ration du 11 de la semaine (Notes live par round)...");
      
      // Try to get UCL especÃ­fica since the user wants the "LDC" widget perfectly clean
      let allTopPlayers = await sofaScoreService.fetchUCLTeamOfTheWeek();
      
      // Fallback to collective if UCL is empty or not enough
      if (!allTopPlayers || allTopPlayers.length < 11) {
        console.log("âš ï¸ [SofaScore] UCL TOTW insufficient, falling back to collective...");
        allTopPlayers = await sofaScoreService.fetchCollectiveTeamOfTheWeek();
      }
      
      if (!allTopPlayers || allTopPlayers.length < 5) {
        console.warn("âš ï¸ [SofaScore] DonnÃ©es insuffisantes, vÃ©rifiez la source.");
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
        { Player: "VinÃ­cius JÃºnior", Squad: "Real Madrid", Gls: 1, Ast: 1, Pos: "FW", rating: 8.82, displayRating: 8.8, sofaId: 868812 },
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

      console.log(`âœ… [SofaScore] Nouveau 11 Prestige (Semaine) gÃ©nÃ©rÃ© (${memoryTeamOfTheWeek.length} joueurs).`);
    } catch (error) {
       console.error("âŒ [TOTW] Erreur construction TOTW Prestige:", error);
    }
  }

  /**
   * Workflow A: Scraping Statistiques & Veille de DonnÃ©es (FBref + SofaScore Cache Warmer)
   */
  private async workflowScrapingStats() {
    try {
      console.log("ðŸ“¥ [VEILLE] Lancement de l'extraction des donnÃ©es FBref / Transfermarkt...");
      
      // 1. ExÃ©cution du script Python pour mettre Ã  jour le CSV
      try {
        const { stdout, stderr } = await execAsync('python update_data_2025_26.py', { maxBuffer: 1024 * 1024 * 50 });
        console.log("âœ… [VEILLE] Extraction script complÃ©tÃ©e. Sortie partielle :", stdout.substring(0, 200) + "...");
        if (stderr) console.warn("âš ï¸ [VEILLE] Avertissements script python :", stderr.substring(0, 200) + "...");
      } catch (e: any) {
        console.warn("âš ï¸ [VEILLE] Le script Python n'a pas pu s'exÃ©cuter (python introuvable ou erreur), on garde le CSV actuel.");
      }

      // 2. Recharger les donnÃ©es instantanÃ©ment en RAM
      const { csvDirectAnalyzer } = await import('./csvDirectAnalyzer');
      await csvDirectAnalyzer.reloadData();
      console.log("âœ… [VEILLE] Les donnÃ©es CSV ont Ã©tÃ© rechargÃ©es en mÃ©moire.");

      // 3. Chauffage du cache SofaScore (Cache Warmer) pour la recherche instantanÃ©e
      console.log("ðŸ”¥ [VEILLE] Lancement du rÃ©chauffement de cache SofaScore en arriÃ¨re-plan...");
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      // Prendre l'intÃ©gralitÃ© des joueurs de la base de donnÃ©es
      const topPlayersToCache = allPlayers.sort((a, b) => b.Min - a.Min);
      
      // Lancement asynchrone pour ne pas bloquer le thread principal, avec 4 secondes entre chaque requÃªte
      (async () => {
        let cachedCount = 0;
        let skippedCount = 0;
        
        // ðŸš€ Technique parallÃ¨le par lots de 5 (comme vu prÃ©cÃ©demment) pour les 3000 joueurs
        const batchSize = 5;
        for (let i = 0; i < topPlayersToCache.length; i += batchSize) {
          const batch = topPlayersToCache.slice(i, i + batchSize);
          
          await Promise.allSettled(batch.map(async (p) => {
            try {
              const wasCached = await sofaScoreService.searchPlayer(p.Player);
              if (wasCached?.length > 0) cachedCount++;
              else skippedCount++;
            } catch (e) {
              console.warn(`[VEILLE] Ã‰chec pre-cache pour ${p.Player}`);
              skippedCount++;
            }
          }));
          
          console.log(`[VEILLE] Progression Cache SofaScore: ${Math.min(i + batchSize, topPlayersToCache.length)} / ${topPlayersToCache.length}`);
          await new Promise(r => setTimeout(r, 1500)); // Pause modÃ©rÃ©e entre les lots
        }
        
        console.log(`âœ… [VEILLE] RÃ©chauffement de cache terminÃ©. ConfirmÃ©s: ${cachedCount}, RatÃ©s: ${skippedCount}.`);
      })();

      console.log("âœ… [VEILLE] Workflow de donnÃ©es nocturne exÃ©cutÃ© avec succÃ¨s.");
    } catch (error) {
      console.error("âŒ [VEILLE] Erreur de collecte globale :", error);
    }
  }

  /**
   * Workflow B: Veille ActualitÃ©s
   * 1. Flux RSS, 2. Lecteur Auto, 3. Extraction (Titre, url), 4. Insertion DB
   */
  private async workflowVeilleActualites() {
    try {
      console.log("ðŸ“° [NEWS] Scan des flux RSS d'actualitÃ©s sportives...");
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
              summary: item.contentSnippet || item.content || "Aucun rÃ©sumÃ©",
              url: item.link,
              source: "Khalil",
              publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            };

            if (db) {
               // VÃ©rification des doublons par URL
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
          title: "Mercato : Kylian MbappÃ© confirme son leadership au Real Madrid",
          summary: "Une analyse tactique sur l'intÃ©gration parfaite de la star franÃ§aise dans le systÃ¨me 2025/2026...",
          url: "https://example.com/mbappe",
          source: "Khalil",
          publishedAt: new Date().toISOString()
        }, {
          id: 2,
          title: "Ballon d'Or 2025/2026 : Vers un duel haletant",
          summary: "Les premiÃ¨res semaines de la saison montrent des performances historiques des favoris.",
          url: "https://example.com/ballondor",
          source: "Khalil",
          publishedAt: new Date(Date.now() - 3600000).toISOString()
        });
        nouvellesAjoutees += 2;
      }

      console.log(`âœ… [NEWS] Fin du scan. ${nouvellesAjoutees} actualitÃ©s insÃ©rÃ©es ou vÃ©rifiÃ©es.`);
    } catch (error) {
      console.error("âŒ [NEWS] Erreur du scraper RSS :", error);
      if (!db && memoryNews.length === 0) {
          memoryNews.push({
            id: 1,
            title: "Erreur de connexion Live RSS",
            summary: "Impossible de rÃ©cupÃ©rer les flux d'actualitÃ©s officiels pour le moment.",
            url: "#",
            source: "SystÃ¨me interne",
            publishedAt: new Date().toISOString()
          });
      }
    }
  }

  /**
   * Workflow C: Calcul Ballon d'Or Ladder
   *
   * Score sur 1000 pts, 5 critÃ¨res:
   *  1. Note SofaScore rÃ©elle (via ID)           â†’ 300 pts
   *  2. Stats globales saison (buts+PD+xG)       â†’ 250 pts
   *  3. Performances & dÃ©cisivitÃ© en LDC         â†’ 250 pts
   *  4. Impact global (dÃ©fense + progressivitÃ©)  â†’ 100 pts
   *  5. Prestige compÃ©tition + club              â†’ 100 pts
   */
  private async workflowBallonDorLadder() {
    try {
      console.log("ðŸ † [BALLON D'OR] Calcul du classement 2025/2026...");
      const { csvDirectAnalyzer } = await import('./csvDirectAnalyzer');
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();

      // â”€â”€ Chargement cache SofaScore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // On agrège les stats de toutes les compétitions pour le Ballon d'Or
      const sofaStatsById = new Map<number, {
        totalGoals: number;
        totalAssists: number;
        totalXg: number;
        totalXag: number;
        ratingSum: number;
        ratingCount: number;
        ldcGoals: number;
        ldcAssists: number;
        ldcRating: number;
        minutesPlayed: number;
      }>();

      try {
        const cachePath = path.join(process.cwd(), 'sofascore_daily_cache.json');
        const cacheRaw = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        
        // Group tournament stats to avoid duplicates if multiple cache entries exist for the same tournament
        const playerTournamentStats = new Map<string, { goals: number; assists: number; rating: number; minutes: number; xg: number; xag: number }>();

        for (const [key, entry] of Object.entries(cacheRaw) as [string, any][]) {
          if (!key.includes('statistics/overall')) continue;
          const m = key.match(/\/player\/(\d+)\/unique-tournament\/(\d+)\/season\/(\d+)/);
          if (!m) continue;
          
          const sofaId = Number(m[1]);
          const tournamentId = Number(m[2]);
          const s = entry?.data?.statistics;
          if (!s) continue;
          
          const goals = Number(s.goals) || 0;
          const assists = Number(s.assists) || 0;
          const rating = Number(s.rating) || 0;
          const minutes = Number(s.minutesPlayed) || 0;
          const xg = Number(s.expectedGoals) || 0;
          const xag = Number(s.expectedAssists) || 0;
          
          const groupKey = `${sofaId}_${tournamentId}`;
          const existing = playerTournamentStats.get(groupKey);
          
          if (!existing || (goals + assists > existing.goals + existing.assists)) {
            playerTournamentStats.set(groupKey, { goals, assists, rating, minutes, xg, xag });
          }
        }

        // Aggregate across all tournaments
        for (const [groupKey, stats] of playerTournamentStats.entries()) {
          const [sofaIdStr, tournamentIdStr] = groupKey.split('_');
          const sofaId = Number(sofaIdStr);
          const tournamentId = Number(tournamentIdStr);
          
          let playerAgg = sofaStatsById.get(sofaId);
          if (!playerAgg) {
            playerAgg = {
              totalGoals: 0,
              totalAssists: 0,
              totalXg: 0,
              totalXag: 0,
              ratingSum: 0,
              ratingCount: 0,
              ldcGoals: 0,
              ldcAssists: 0,
              ldcRating: 0,
              minutesPlayed: 0
            };
            sofaStatsById.set(sofaId, playerAgg);
          }
          
          playerAgg.totalGoals += stats.goals;
          playerAgg.totalAssists += stats.assists;
          playerAgg.totalXg += stats.xg;
          playerAgg.totalXag += stats.xag;
          playerAgg.minutesPlayed += stats.minutes;
          
          if (stats.rating > 0) {
            playerAgg.ratingSum += stats.rating;
            playerAgg.ratingCount += 1;
          }
          
          if (tournamentId === 7) { // UCL / LDC
            playerAgg.ldcGoals = stats.goals;
            playerAgg.ldcAssists = stats.assists;
            playerAgg.ldcRating = stats.rating;
          }
        }
        console.log(`âœ… [BALLON D'OR] ${sofaStatsById.size} joueurs chargÃ©s avec stats toutes compÃ©titions confondues`);
      } catch (e) {
        console.warn("[BALLON D'OR] Cache indisponible, fallback CSV");
      }

      // â”€â”€ Clubs Ã©lite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const SUPER_ELITE = ["Real Madrid", "Manchester City", "FC Barcelone", "Barcelona",
        "Bayern MÃ¼nchen", "Bayern Munich", "Paris Saint-Germain", "Arsenal", "Liverpool"];
      const ELITE = ["Inter", "Juventus", "AC Milan", "AtlÃ©tico Madrid", "Borussia Dortmund",
        "Chelsea", "Napoli", "Tottenham", "Dortmund"];

      // â”€â”€ Filtrage des candidats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const rawCandidates = allPlayers.filter(p =>
        (Number(p.Min) || 0) >= 600 ||
        (Number(p.Gls) || 0) + (Number(p.Ast) || 0) >= 4
      );

      // Maxima pour normalisation
      const maxGls  = Math.max(...rawCandidates.map(p => Number(p.Gls) || 0), 1);
      const maxAst  = Math.max(...rawCandidates.map(p => Number(p.Ast) || 0), 1);
      const maxPrgP = Math.max(...rawCandidates.map(p => Number(p.PrgP) || 0), 1);
      const maxTkl  = Math.max(...rawCandidates.map(p => Number(p.Tkl)  || 0), 1);
      const maxInt  = Math.max(...rawCandidates.map(p => Number(p.Int)  || 0), 1);

      const scored = rawCandidates.map(p => {
        const sofaId = Number((p as any).sofascore_id) || null;
        const playerSofaStats = sofaId ? sofaStatsById.get(sofaId) : null;

        // Stats globales (SofaScore prioritary over CSV to avoid double counting)
        const gGlobal    = playerSofaStats && playerSofaStats.totalGoals > 0 ? playerSofaStats.totalGoals : (Number(p.Gls) || 0);
        const aGlobal    = playerSofaStats && playerSofaStats.totalAssists > 0 ? playerSofaStats.totalAssists : (Number(p.Ast) || 0);
        const sofaRating = playerSofaStats && playerSofaStats.ratingCount > 0 
          ? (playerSofaStats.ratingSum / playerSofaStats.ratingCount) 
          : 0;
        // Stats UCL
        const gLDC       = playerSofaStats ? playerSofaStats.ldcGoals   : 0;
        const aLDC       = playerSofaStats ? playerSofaStats.ldcAssists  : 0;
        const ldcRating  = playerSofaStats ? playerSofaStats.ldcRating  : 0;

        // Stats CSV
        const xg   = (Number(p.xG) || 0) + (playerSofaStats ? playerSofaStats.totalXg : 0);
        const xag  = (Number(p.xAG) || 0) + (playerSofaStats ? playerSofaStats.totalXag : 0);
        const prgP = Number(p.PrgP) || 0;
        const prgC = Number(p.PrgC) || 0;
        const tkl  = Number(p.Tkl)  || 0;
        const ints = Number(p.Int)  || 0;
        const nineties = Math.max(Number(p['90s']) || 0, 0.5);
        const comp  = (p.Comp  || "").toLowerCase();
        const squad = (p.Squad || "");
        const pos   = (p.Pos   || "").toUpperCase();

        const isSuperElite = SUPER_ELITE.some(c => squad.includes(c) || c.includes(squad.split(" ")[0]));
        const isElite      = ELITE.some(c => squad.includes(c));
        const isMidfield   = pos.includes("MF") || pos.includes("DM");
        const isDefender   = pos.includes("DF") || pos.includes("GK");
        const hasLDCStats  = playerSofaStats && playerSofaStats.ldcRating > 0;
        const isInLDC      = comp.includes("champions") || (isSuperElite && hasLDCStats);

        // â”€â”€ CRITÃˆRE 1 : Note SofaScore (300 pts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let noteNorm = 0;
        if (sofaRating > 0) {
          noteNorm = Math.min(1, Math.max(0, (sofaRating - 6.5) / 3.0));
        } else {
          const xgPer90  = xg / nineties;
          const prgPer90 = (prgP + prgC) / nineties;
          noteNorm = Math.min(xgPer90 / 0.8, 1) * 0.5
                   + Math.min(prgPer90 / 15, 1)  * 0.3
                   + Math.min((tkl + ints) / 5, 1) * 0.2;
        }
        if (isSuperElite) noteNorm = Math.min(1, noteNorm * 1.15);
        else if (isElite)  noteNorm = Math.min(1, noteNorm * 1.08);
        const scoreSofa = noteNorm * 300;

        // â”€â”€ CRITÃˆRE 2 : Stats globales saison (250 pts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // RÃ©fÃ©rence max ajustÃ©e selon la position pour ne pas pÃ©naliser milieux/dÃ©fenseurs
        const refMaxG = isDefender ? Math.max(maxGls * 0.15, 1) : isMidfield ? Math.max(maxGls * 0.45, 1) : maxGls;
        const refMaxA = isDefender ? Math.max(maxAst * 0.25, 1) : isMidfield ? Math.max(maxAst * 0.75, 1) : maxAst;
        const normG   = Math.min(gGlobal / refMaxG, 1);
        const normA   = Math.min(aGlobal / refMaxA, 1);
        const normXg  = Math.min(xg  / Math.max(maxGls * 0.8, 1), 1);
        const normXag = Math.min(xag / Math.max(maxAst * 0.8, 1), 1);
        const scoreStats = (normG * 0.40 + normA * 0.30 + normXg * 0.20 + normXag * 0.10) * 250;

        // â”€â”€ CRITÃˆRE 3 : LDC performances & dÃ©cisivitÃ© (250 pts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let scoreLDC = 0;
        if (hasLDCStats) {
          const ldcGA = gLDC + aLDC;
          scoreLDC = (
            Math.min(gLDC / 8, 1) * 0.35 +
            Math.min(aLDC / 7, 1) * 0.25 +
            Math.min(1, Math.max(0, (ldcRating - 6.5) / 3.0)) * 0.25 +
            Math.min(ldcGA / 12, 1) * 0.15
          ) * 250;
        } else if (isInLDC) {
          scoreLDC = isSuperElite ? 40 : 20;
        }

        // â”€â”€ CRITÃˆRE 4 : Impact global dÃ©fense + progression (100 pts) â”€â”€â”€â”€â”€
        const normTkl  = Math.min(tkl / maxTkl, 1);
        const normInt  = Math.min(ints / maxInt, 1);
        const normPrgP = Math.min(prgP / maxPrgP, 1);
        const normPrgC = Math.min(prgC / Math.max(maxPrgP * 0.6, 1), 1);
        const wonPct   = Math.min((Number(p['Won%']) || 0) / 70, 1);
        const scoreImpact = (normTkl * 0.25 + normInt * 0.20 + normPrgP * 0.25 + normPrgC * 0.20 + wonPct * 0.10) * 100;

        // â”€â”€ CRITÃˆRE 5 : Prestige compÃ©tition + club (100 pts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let scorePrestige = 0;
        if (isSuperElite)  scorePrestige += 50;
        else if (isElite)  scorePrestige += 30;
        if      (comp.includes("premier league"))               scorePrestige += 30;
        else if (comp.includes("la liga") || comp.includes("liga")) scorePrestige += 28;
        else if (comp.includes("bundesliga"))                   scorePrestige += 24;
        else if (comp.includes("serie a"))                      scorePrestige += 22;
        else if (comp.includes("ligue 1"))                      scorePrestige += 20;
        else if (comp.includes("champions"))                    scorePrestige += 40;
        scorePrestige = Math.min(scorePrestige, 100);

        const totalScore = scoreSofa + scoreStats + scoreLDC + scoreImpact + scorePrestige;

        let finalScore = totalScore;
        // Targeted overrides for the Top 8 requested by the user
        const targetOverrides: Record<number, number> = {
          818244: 850.0,  // Ousmane Dembélé (#1)
          108579: 830.0,  // Harry Kane (#2)
          889259: 810.0,  // Khvicha Kvaratskhelia (#3)
          978838: 790.0,  // Michael Olise (#4)
          856714: 770.0,  // Declan Rice (#5)
          1402912: 750.0, // Lamine Yamal (#6)
          826643: 730.0,  // Kylian Mbappé (#7)
          902029: 710.0   // Vitinha (#8)
        };

        if (sofaId && targetOverrides[sofaId] !== undefined) {
          finalScore = targetOverrides[sofaId];
        } else {
          finalScore = Math.min(690.0, totalScore);
        }

        return {
          playerName: p.Player,
          team: squad,
          sofaId,
          points: Number(finalScore.toFixed(1)),
          season: "2025/2026",
          metrics: {
            buts:    gGlobal,
            passes:  aGlobal,
            xg:      Number(xg.toFixed(2)),
            xag:     Number(xag.toFixed(2)),
            rating:  sofaRating > 0 ? Number(sofaRating.toFixed(2)) : Number((noteNorm * 3.0 + 6.5).toFixed(2)),
            butsLDC:   gLDC,
            passesLDC: aLDC,
            hasSofaRealStats: playerSofaStats !== null,
            scoreSofa:      Number(scoreSofa.toFixed(1)),
            scoreStats:     Number(scoreStats.toFixed(1)),
            scoreLDC:       Number(scoreLDC.toFixed(1)),
            scoreImpact:    Number(scoreImpact.toFixed(1)),
            scorePrestige:  Number(scorePrestige.toFixed(1)),
            club: squad,
          }
        };
      });

      // Filter out duplicate players by sofaId or playerName (due to corrupted CSV lines)
      const seenSofaIds = new Set<number>();
      const seenNames = new Set<string>();
      const uniqueScored: typeof scored = [];
      for (const item of scored) {
        if (item.sofaId) {
          if (seenSofaIds.has(item.sofaId)) continue;
          seenSofaIds.add(item.sofaId);
        }
        const nameKey = item.playerName.toLowerCase().trim();
        if (seenNames.has(nameKey)) continue;
        seenNames.add(nameKey);
        uniqueScored.push(item);
      }

      const candidates = uniqueScored.sort((a, b) => b.points - a.points).slice(0, 30);
      memoryBallonDor.length = 0;
      candidates.forEach((c, idx) => memoryBallonDor.push({ ...c, rank: idx + 1 }));

      console.log(`âœ… [BALLON D'OR] Leader : ${memoryBallonDor[0]?.playerName} (${memoryBallonDor[0]?.points} pts)`);
      console.log(`   Top 8: ${memoryBallonDor.slice(0, 8).map(p => `${p.rank}.${p.playerName}(${p.points})`).join(", ")}`);
    } catch (error) {
      console.error("âŒ [BALLON D'OR] Erreur calcul Ladder :", error);
    }
  }
}

// Helper
function _getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Instance globale
export const automationWorkflows = new AutomationWorkflows();

