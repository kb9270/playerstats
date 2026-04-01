import axios from "axios";
import fs from "fs";
import path from "path";

export interface SofaPlayer {
  player: {
    name: string;
    slug: string;
    id: number;
    position: string;
  };
  team: {
    name: string;
    id: number;
  };
  statistics: {
    rating: number;
    goals?: number;
    assists?: number;
  };
}

class SofaScoreService {
  private cacheFilePath = path.join(process.cwd(), 'sofascore_cache.json');
  private searchCache = new Map<string, any[]>();

  constructor() {
    this.loadCacheFromDisk();
  }

  private loadCacheFromDisk() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        for (const [key, value] of Object.entries(parsed)) {
          this.searchCache.set(key, value as any[]);
        }
        console.log(`✅ [SofaScore] Loaded ${this.searchCache.size} search cache entries from disk.`);
      }
    } catch (e) {
      console.error('Failed to load sofascore_cache.json:', e);
    }
  }

  private saveCacheToDisk() {
    try {
      const obj = Object.fromEntries(this.searchCache);
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write sofascore_cache.json:', e);
    }
  }

  public axiosInstance = axios.create({
    baseURL: "https://www.sofascore.com/api/v1",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Origin": "https://www.sofascore.com",
      "Referer": "https://www.sofascore.com/"
    }
  });

  private leagues = [
    { id: 17, name: "Premier League", weight: 1.1 },
    { id: 8, name: "La Liga", weight: 1.1 },
    { id: 35, name: "Bundesliga", weight: 1.05 },
    { id: 23, name: "Serie A", weight: 1.05 },
    { id: 34, name: "Ligue 1", weight: 1.0 },
    { id: 7, name: "Champions League", weight: 1.4 },
    { id: 67, name: "Europa League", weight: 1.2 }
  ];

  // Super Elite: Massive priority
  private superElite = [
    "Real Madrid", "Manchester City", "FC Barcelone", "Barcelona", "Bayern München", 
    "Paris Saint-Germain", "Arsenal", "Liverpool", "Inter"
  ];
  
  // Elite: Significant boost
  private eliteClubs = [
    "AC Milan", "Juventus", "Atlético Madrid", "Borussia Dortmund", 
    "Bayer 04 Leverkusen", "Chelsea", "Manchester United", "Napoli", "Tottenham Hotspur"
  ];

  async getLatestSeasonId(tournamentId: number): Promise<number> {
    try {
      const resp = await this.axiosInstance.get(`/unique-tournament/${tournamentId}/seasons`);
      return resp.data.seasons[0]?.id || 61627;
    } catch {
      return 61627;
    }
  }

  async getLatestRound(tournamentId: number, seasonId: number) {
    try {
      const resp = await this.axiosInstance.get(`/unique-tournament/${tournamentId}/season/${seasonId}/team-of-the-week/periods`);
      return resp.data.periods[0]; // { id: 25013, ... }
    } catch {
      return null;
    }
  }

  async getTeamOfTheWeek(tournamentId: number, seasonId: number, periodId: number) {
     try {
       const resp = await this.axiosInstance.get(`/unique-tournament/${tournamentId}/season/${seasonId}/team-of-the-week/${periodId}`);
       return resp.data.players || [];
     } catch {
       return [];
     }
  }

  async fetchCollectiveTeamOfTheWeek() {
    console.log("🚀 [SofaScore] Construction TOTW (Moteur de recherche par round)...");
    const allCandidates: any[] = [];

    // Focus on major leagues for the "Ultimate Team of the Week"
    for (const league of this.leagues) {
      try {
        const seasonId = await this.getLatestSeasonId(league.id);
        
        // Get periods (rounds) - we only want the most recent one to avoid "season" feeling
        const periodsResp = await this.axiosInstance.get(`/unique-tournament/${league.id}/season/${seasonId}/team-of-the-week/periods`);
        const periods = periodsResp.data?.periods || [];
        
        if (periods.length === 0) {
          console.log(`⚠️ [SofaScore] Aucune période TOTW pour ${league.name}`);
          continue;
        }

        // We take the VERY LATEST round only to ensure it's "of the week"
        const latestPeriod = periods[0];
        console.log(`🔎 [SofaScore] Fetching ${league.name} - Round ${latestPeriod.round?.round || 'Latest'}`);
        
        const players = await this.getTeamOfTheWeek(league.id, seasonId, latestPeriod.id);
        
        const normalized = players.map((p: any) => {
          const baseRating = parseFloat(p.rating) || 0.0;
          let prestigeRating = baseRating * (league.weight || 1.0);

          const teamName = p.team?.name || "Club";
          const playerName = p.player?.name || "Joueur";

          // --- DURCISSEMENT DU BAREME (Moteur Elite) ---
          
          // 1. Club Prestige Boost (DURCI)
          // We add massive points to force the big names to the top
          if (this.superElite.some(club => teamName.includes(club) || club.includes(teamName))) {
            prestigeRating += 4.5; // Massive push for Real, Barca, City, etc.
          } else if (this.eliteClubs.some(club => teamName.includes(club) || club.includes(teamName))) {
            prestigeRating += 2.0;
          }

          // 2. Performance Boost (DURCI)
          const goals = p.statistics?.goals || 0;
          const assists = p.statistics?.assists || 0;
          
          if (goals > 0) prestigeRating += (goals * 1.5);
          if (assists > 0) prestigeRating += (assists * 0.8);

          // 3. Superstars Names Boost
          const superstars = ["Kylian Mbappé", "Lamine Yamal", "Vinícius Júnior", "Erling Haaland", "Jude Bellingham", "Harry Kane", "Mohamed Salah"];
          if (superstars.some(s => playerName.includes(s))) {
            prestigeRating += 3.0;
          }

          // 4. Competition specific bonus
          if (league.name === "Champions League") prestigeRating += 2.5;

          return {
            Player: playerName,
            Squad: teamName,
            Gls: goals,
            Ast: assists,
            Pos: p.player?.position || "M",
            rating: prestigeRating, // Used for sorting
            displayRating: baseRating, // Shown on UI
            league: league.name,
            sofaId: p.player?.id
          };
        });

        allCandidates.push(...normalized);
      } catch (err: any) {
        console.error(`❌ [SofaScore] Erreur pour ${league.name}:`, err.message);
      }
    }

    // Deduplicate by player name
    const unique = Array.from(new Map(allCandidates.map(p => [p.Player, p])).values());
    
    // Sort by prestige-weighted rating
    return unique.sort((a, b) => b.rating - a.rating);
  }

  private normalizeName(name: string): string {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  async searchPlayer(name: string, team?: string): Promise<any[]> {
    const cacheKey = `${name}_${team || ''}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    const normalized = this.normalizeName(name);
    const searchAttempts = [
      normalized, // Normalized full name
      name,       // Original name (with accents)
      `${normalized} ${this.normalizeName(team || '')}`, // Name + Team
      normalized.split(' ').slice(-1)[0], // Only last name
    ];

    for (const query of searchAttempts) {
      if (!query || query.length < 3) continue;
      
      try {
        console.log(`🔍 [SofaScore] Searching for "${query}"...`);
        const resp = await this.axiosInstance.get(`/search/all?q=${encodeURIComponent(query)}`);
        const results = (resp.data.results || []).filter((r: any) => r.type === 'player');
        
        if (results.length > 0) {
          console.log(`✅ [SofaScore] Found ${results.length} matches for "${query}"`);
          this.searchCache.set(cacheKey, results);
          this.saveCacheToDisk();
          return results;
        }
      } catch (err: any) {
        console.error(`❌ [SofaScore] Search error for "${query}":`, err.message);
      }
    }
    
    this.searchCache.set(cacheKey, []);
    this.saveCacheToDisk();
    return [];
  }

  async getPlayerDetails(sofaId: number) {
    try {
      const resp = await this.axiosInstance.get(`/player/${sofaId}`);
      const info = resp.data.player;
      
      const team = info.team;
      const tournament = team?.tournament?.uniqueTournament || team?.category?.uniqueTournament;

      return {
        id: info.id,
        name: info.name,
        slug: info.slug,
        shortName: info.shortName,
        position: info.position,
        height: info.height,
        preferredFoot: info.preferredFoot,
        marketValueCurrency: info.proposedMarketValueCurrency,
        marketValue: info.proposedMarketValue || info.marketValue || 0,
        country: info.country?.name,
        dateOfBirth: info.dateOfBirthTimestamp ? new Date(info.dateOfBirthTimestamp * 1000).toISOString() : null,
        team: team?.name,
        league: tournament?.name,
        tournamentId: tournament?.id,
        // Calculate seasonId: for 2025/26 it's often around 61627, 
        // but we can try to guess from the year if tournamentId is known
      };
    } catch (err) {
      console.error(`❌ [SofaScore] Erreur détails joueur ${sofaId}:`, err);
      return null;
    }
  }

  async getPlayerLastEvents(sofaId: number) {
     try {
       const resp = await this.axiosInstance.get(`/player/${sofaId}/events/last/0`);
       return resp.data.events || [];
     } catch {
       return [];
     }
  }

  async getPlayerMatchRatings(sofaId: number, playerTeamName?: string) {
    try {
      const events = await this.getPlayerLastEvents(sofaId);
      if (!events || events.length === 0) return [];
      
      const ratings: any[] = [];
      // Take 7 most recent to guarantee we get 5 with valid ratings 
      const recentMatches = events.slice(-7).reverse();
      for (const e of recentMatches) {
        if (ratings.length >= 5) break;
        try {
          const resp = await this.axiosInstance.get(`/event/${e.id}/player/${sofaId}/statistics`);
          const rating = resp.data.statistics?.rating;
          if (rating) {
            // Determine opponent
            const homeTeam = e.homeTeam;
            const awayTeam = e.awayTeam;
            const isHome = playerTeamName ? homeTeam?.name?.includes(playerTeamName) : true;
            const opponent = isHome ? awayTeam : homeTeam;
            
            ratings.push({
              rating: parseFloat(rating),
              date: e.startTimestamp,
              tournament: e.tournament?.name || 'Match',
              match: `${homeTeam?.shortName || '?'} ${e.homeScore?.current ?? ''}-${e.awayScore?.current ?? ''} ${awayTeam?.shortName || '?'}`,
              opponentName: opponent?.shortName || opponent?.name || '?',
              opponentLogo: `https://api.sofascore.app/api/v1/team/${opponent?.id}/image`,
              opponentId: opponent?.id
            });
          }
        } catch {}
      }
      console.log(`⭐ [SofaScore] Got ${ratings.length} real match ratings for player ${sofaId}`);
      return ratings;
    } catch {
      return [];
    }
  }

  async getPlayerHeatmap(sofaId: number, tournamentId?: number) {
    try {
      // SEASON HEATMAP: /player/{id}/unique-tournament/{tid}/season/{sid}/heatmap/overall
      const tid = tournamentId || 35;
      const sid = await this.getLatestSeasonId(tid);
      const resp = await this.axiosInstance.get(`/player/${sofaId}/unique-tournament/${tid}/season/${sid}/heatmap/overall`);
      const points = resp.data.points || [];
      console.log(`🗺️ [SofaScore] Season heatmap: ${points.length} points`);
      return { points, type: 'season' };
    } catch {
      // Fallback: try last match heatmap
      try {
        const events = await this.getPlayerLastEvents(sofaId);
        if (events.length > 0) {
          const lastEvent = events[events.length - 1];
          const resp = await this.axiosInstance.get(`/event/${lastEvent.id}/player/${sofaId}/heatmap`);
          return { points: resp.data.heatmap || [], type: 'match', match: `${lastEvent.homeTeam?.name} vs ${lastEvent.awayTeam?.name}` };
        }
      } catch {}
      return null;
    }
  }

  async getPlayerStatistics(sofaId: number, tournamentId?: number, seasonId?: number) {
    try {
      // If tournamentId is not provided, we try to fetch it if we don't have it
      // but usually the caller should provide it from getPlayerDetails
      let tid = tournamentId || 7; // Default PL
      let sid = seasonId;
      
      if (!sid) {
        // Fetch latest season for this tournament if not provided
        sid = await this.getLatestSeasonId(tid);
      }

      console.log(`📊 [SofaScore] Fetching stats for player ${sofaId} (T:${tid} S:${sid})`);
      const url = `/player/${sofaId}/unique-tournament/${tid}/season/${sid}/statistics/overall`;
      const resp = await this.axiosInstance.get(url);
      
      const stats = resp.data.statistics || null;
      if (stats) {
        // Map the new API's variable 'appearances' to 'matches' which the frontend expects
        stats.matches = stats.appearances;
      }
      return stats;
    } catch (err) {
      console.warn(`[SofaScore] Failed to fetch stats for ${sofaId}`);
      return null;
    }
  }

  async getFullSeasonStatistics(sofaId: number) {
    try {
      // 1. Get all seasons/competitions for this player
      const seasonsResp = await this.axiosInstance.get(`/player/${sofaId}/statistics-seasons`);
      const allSeasons = seasonsResp.data.uniqueTournamentSeasons || [];
      
      // 2. Filter for 25/26 competitions
      const currentSeasons = allSeasons.filter((s: any) => s.season.year === "25/26");
      
      if (currentSeasons.length === 0) return null;

      console.log(`🌐 [SofaScore] Aggregating ${currentSeasons.length} competitions for player ${sofaId}`);
      
      let totalStats: any = {
        goals: 0,
        assists: 0,
        appearances: 0,
        expectedGoals: 0,
        expectedAssists: 0,
        shots: 0,
        keyPasses: 0,
        successfulDribbles: 0,
        interceptions: 0,
        tackles: 0,
        ratingSum: 0,
        totalPasses: 0,
        accuratePasses: 0
      };

      let count = 0;

      for (const s of currentSeasons) {
        const tid = s.uniqueTournament.id;
        const sid = s.season.id;
        
        try {
          const stats = await this.getPlayerStatistics(sofaId, tid, sid);
          if (stats) {
             totalStats.goals += (stats.goals || 0);
             totalStats.assists += (stats.assists || 0);
             totalStats.appearances += (stats.appearances || 0);
             totalStats.expectedGoals += (stats.expectedGoals || 0);
             totalStats.expectedAssists += (stats.expectedAssists || 0);
             totalStats.shots += (stats.shots || 0);
             totalStats.keyPasses += (stats.keyPasses || 0);
             totalStats.successfulDribbles += (stats.successfulDribbles || 0);
             totalStats.interceptions += (stats.interceptions || 0);
             totalStats.tackles += (stats.tackles || 0);
             totalStats.totalPasses += (stats.totalPasses || 0);
             totalStats.accuratePasses += (stats.accuratePasses || 0);
             
             if (stats.rating) {
               totalStats.ratingSum += stats.rating;
               count++;
             }
          }
        } catch (e) {}
      }

      // Cleanup and Averaging
      return {
        ...totalStats,
        matches: totalStats.appearances,
        rating: count > 0 ? (totalStats.ratingSum / count) : 7.0,
        accuratePassesPercentage: totalStats.totalPasses > 0 ? (totalStats.accuratePasses / totalStats.totalPasses * 100) : 0,
        isAggregated: true,
        competitionsCount: currentSeasons.length
      };

    } catch (err) {
      console.warn(`[SofaScore] Global aggregation failed for ${sofaId}`);
      return null;
    }
  }
}

export const sofaScoreService = new SofaScoreService();
