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
  private dailyCacheFilePath = path.join(process.cwd(), 'sofascore_daily_cache.json');
  private dailyCache = new Map<string, { timestamp: number, data: any }>();

  constructor() {
    this.loadCacheFromDisk();
  }

  private loadCacheFromDisk() {
    try {
      if (fs.existsSync(this.dailyCacheFilePath)) {
        const data = fs.readFileSync(this.dailyCacheFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        const now = Date.now();
        for (const [key, value] of Object.entries(parsed) as [string, any][]) {
          // Keep cache valid for 24 hours (86400000 ms)
          if (now - value.timestamp < 86400000) {
            this.dailyCache.set(key, value);
          }
        }
        console.log(`✅ [SofaScore] Loaded ${this.dailyCache.size} fresh daily cache entries from disk.`);
      }
    } catch (e) {
      console.error('Failed to load sofascore_daily_cache.json:', e);
    }
  }

  private saveCacheToDisk() {
    try {
      const obj = Object.fromEntries(this.dailyCache);
      fs.writeFileSync(this.dailyCacheFilePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write sofascore_daily_cache.json:', e);
    }
  }

  public axiosInstance = axios.create({
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "max-age=0",
      "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Origin": "https://www.sofascore.com",
      "Referer": "https://www.sofascore.com/",
      "Connection": "keep-alive"
    },
    timeout: 4000 // 4 seconds max to avoid hanging the UI
  });

  public async fetchWithCache(path: string) {
    if (this.dailyCache.has(path)) {
      const cached = this.dailyCache.get(path);
      if (cached && (Date.now() - cached.timestamp < 86400000)) {
        console.log(`⚡ [SofaScore Cache] HIT: ${path}`);
        return { data: cached.data };
      }
    }
    
    // Cache miss or expired
    console.log(`🌐 [SofaScore Net] FETCH via Proxy: ${path}`);
    const fullUrl = `https://api.sofascore.com/api/v1${path}`;
    const proxyUrl = `http://localhost:8001/?url=${encodeURIComponent(fullUrl)}`;
    
    const response = await this.axiosInstance.get(proxyUrl);
    this.dailyCache.set(path, { timestamp: Date.now(), data: response.data });
    this.saveCacheToDisk();
    return response;
  }

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
      const resp = await this.fetchWithCache(`/unique-tournament/${tournamentId}/seasons`);
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

  async fetchUCLTeamOfTheWeek() {
    console.log("🚀 [SofaScore] Fetching UCL Specific TOTW...");
    try {
      const leagueId = 7; // Champions League
      const seasonId = await this.getLatestSeasonId(leagueId);
      
      const periodsResp = await this.fetchWithCache(`/unique-tournament/${leagueId}/season/${seasonId}/team-of-the-week/periods`);
      const periods = periodsResp.data?.periods || [];
      
      if (periods.length === 0) return [];

      const latestPeriod = periods[0];
      const players = await this.getTeamOfTheWeek(leagueId, seasonId, latestPeriod.id);
      
      return players.map((p: any) => ({
        Player: p.player?.name,
        Squad: p.team?.name,
        Gls: p.statistics?.goals || 0,
        Ast: p.statistics?.assists || 0,
        Pos: p.player?.position || "M",
        rating: parseFloat(p.rating) || 0,
        displayRating: parseFloat(p.rating) || 0,
        sofaId: p.player?.id,
        teamId: p.team?.id
      })).sort((a: any, b: any) => b.rating - a.rating);
    } catch (err) {
      console.error("❌ [SofaScore] UCL Fetch Error:", err);
      return [];
    }
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
        const resp = await this.fetchWithCache(`/search/all?q=${encodeURIComponent(query)}`);
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
      const resp = await this.fetchWithCache(`/player/${sofaId}`);
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
        teamId: team?.id,
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
       const resp = await this.fetchWithCache(`/player/${sofaId}/events/last/0`);
       return resp.data.events || [];
     } catch {
       return [];
     }
  }

  async getPlayerMatchRatings(sofaId: number, playerTeamId?: number) {
    try {
      const events = await this.getPlayerLastEvents(sofaId);
      if (!events || events.length === 0) return [];
      
      // Look back at 20 matches to find 5 with valid ratings
      const recentMatches = events.slice(-20).reverse();
      
      const ratingPromises = recentMatches.map(async (e) => {
        try {
          const resp = await this.fetchWithCache(`/event/${e.id}/player/${sofaId}/statistics`);
          if (!resp || !resp.data || !resp.data.statistics?.rating) return null;
          
          const rating = resp.data.statistics.rating;
          const homeTeam = e.homeTeam;
          const awayTeam = e.awayTeam;
          const playerMatchTeamId = resp.data.team?.id;
          
          // Absolute precision: compare the team the player played for in this match
          const isHome = (homeTeam?.id === playerMatchTeamId);
          const opponent = isHome ? awayTeam : homeTeam;
          
          return {
            rating: parseFloat(rating),
            date: e.startTimestamp,
            tournament: e.tournament?.name || 'Match',
            match: `${homeTeam?.shortName || '?'} ${e.homeScore?.current ?? ''}-${e.awayScore?.current ?? ''} ${awayTeam?.shortName || '?'}`,
            opponentName: opponent?.shortName || opponent?.name || '?',
            opponentLogo: `https://api.sofascore.app/api/v1/team/${opponent?.id}/image`,
            opponentId: opponent?.id
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(ratingPromises);
      const ratings = results.filter(r => r !== null).slice(0, 5);
      console.log(`⭐ [SofaScore] Got ${ratings.length} real match ratings for player ${sofaId}`);
      return ratings;
    } catch {
      return [];
    }
  }

  async getPlayerHeatmap(sofaId: number, tournamentId: number, seasonId: number) {
    try {
      // Try multiple variants for the heatmap endpoint
      const variants = [
        `/player/${sofaId}/unique-tournament/${tournamentId}/season/${seasonId}/heatmap`,
        `/player/${sofaId}/unique-tournament/${tournamentId}/season/${seasonId}/heatmap/overall`
      ];

      for (const url of variants) {
        try {
          const resp = await this.fetchWithCache(url);
          const points = resp.data.points || [];
          if (points.length > 0) {
            console.log(`🗺️ [SofaScore] Real Season heatmap: ${points.length} points (via ${url})`);
            return { points, type: 'season' };
          }
        } catch (e) {}
      }
      return null;
    } catch (err: any) {
      console.warn(`[SofaScore] Heatmap fetch failed for ${sofaId}: ${err.message}`);
      return null;
    }
  }

  async getPlayerStatistics(sofaId: number, tournamentId: number, seasonId: number) {
    try {
      console.log(`📊 [SofaScore] Fetching stats for player ${sofaId} (T:${tournamentId} S:${seasonId})`);
      const url = `/player/${sofaId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;
      const resp = await this.fetchWithCache(url);
      
      const stats = resp.data.statistics || null;
      if (stats) {
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
      const seasonsResp = await this.fetchWithCache(`/player/${sofaId}/statistics-seasons`);
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
