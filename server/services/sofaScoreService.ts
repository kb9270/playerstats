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
  private searchCache = new Map<string, any[]>();

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
      // Use the first season (usually the latest active one)
      const latestSeason = resp.data.seasons[0];
      return latestSeason?.id || 76953;
    } catch {
      return 76953;
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
       const path = `/unique-tournament/${tournamentId}/season/${seasonId}/team-of-the-week/${periodId}`;
       const resp = await this.fetchWithCache(path);
       return resp.data.players || [];
     } catch (err) {
       console.error("Error in getTeamOfTheWeek:", err);
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
      const periods = (periodsResp.data?.periods || []).sort((a: any, b: any) => b.startDateTimestamp - a.startDateTimestamp);
      
      if (periods.length === 0) return [];

      // Prioritize the user-requested round ID 26649 if we are in season 76953
      const TARGET_ROUND_ID = 26649;
      const selectedPeriod = (seasonId === 76953 && periods.some((p: any) => p.id === TARGET_ROUND_ID))
        ? periods.find((p: any) => p.id === TARGET_ROUND_ID)
        : periods[0];

      console.log(`🔎 [SofaScore] UCL Selected Period: ${selectedPeriod.id} (${selectedPeriod.periodName || 'N/A'})`);
      const players = await this.getTeamOfTheWeek(leagueId, seasonId, selectedPeriod.id);
      console.log(`✅ [SofaScore] UCL TOTW Players Found: ${players.length}`);
      if (players.length > 0) {
        console.log(`👉 First player: ${players[0].player?.name} (${players[0].team?.name})`);
      }
      
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
            eventId: e.id,
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
  async getEvent(eventId: number) {
    return this.fetchWithCache(`/event/${eventId}`);
  }

  async getEventPlayerStatistics(eventId: number, sofaId: number) {
    return this.fetchWithCache(`/event/${eventId}/player/${sofaId}/statistics`);
  }

  async getEventPlayerHeatmap(eventId: number, sofaId: number) {
    return this.fetchWithCache(`/event/${eventId}/player/${sofaId}/heatmap`);
  }

  async getMatchPlayerDetails(eventId: number, sofaId: number) {
    try {
      const [eventResp, statsResp, heatmapResp] = await Promise.allSettled([
        this.getEvent(eventId),
        this.getEventPlayerStatistics(eventId, sofaId),
        this.getEventPlayerHeatmap(eventId, sofaId)
      ]);

      const event = eventResp.status === 'fulfilled' ? eventResp.value.data.event : null;
      const playerStats = statsResp.status === 'fulfilled' ? statsResp.value.data.statistics : null;
      const heatmap = heatmapResp.status === 'fulfilled' ? heatmapResp.value.data.points : [];

      // Optional: Shotmap
      let shotmap = [];
      try {
        const shotResp = await this.fetchWithCache(`/event/${eventId}/player/${sofaId}/shotmap`);
        shotmap = shotResp.data.shotmap || [];
      } catch (e) {}

      return {
        event: event ? {
          id: event.id,
          homeTeam: {
            name: event.homeTeam.name,
            shortName: event.homeTeam.shortName,
            id: event.homeTeam.id,
            logo: `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`
          },
          awayTeam: {
            name: event.awayTeam.name,
            shortName: event.awayTeam.shortName,
            id: event.awayTeam.id,
            logo: `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`
          },
          homeScore: event.homeScore?.current,
          awayScore: event.awayScore?.current,
          tournament: event.tournament?.name,
          date: event.startTimestamp,
          venue: event.venue?.name
        } : null,
        playerStats,
        heatmap,
        shotmap
      };
    } catch (err) {
      console.error(`❌ [SofaScore] Erreur détails match ${eventId} pour joueur ${sofaId}:`, err);
      return null;
    }
  }
  async getTopPlayersByStat(leagueId: number, seasonId: number, statType: string) {
    // statType can be 'goals', 'assists', 'rating', 'cleanSheet', etc.
    try {
      const resp = await this.fetchWithCache(`/unique-tournament/${leagueId}/season/${seasonId}/top-players/overall`);
      const topPlayers = resp.data?.topPlayers || {};
      
      // Handle the case where cleanSheets is requested instead of cleanSheet
      const mappedKey = statType === 'cleanSheets' ? 'cleanSheet' : statType;
      
      return topPlayers[mappedKey] || [];
    } catch (err: any) {
      console.error(`❌ [SofaScore] Erreur top players overall ${statType} (League ${leagueId}):`, err.message);
      return [];
    }
  }

  async fetchUCLTopStats() {
    const leagueId = 7; // UEFA Champions League
    console.log("🏆 [SofaScore] Fetching LIVE UCL Top Stats (Buteurs / Passeurs / Jeunes)...");

    const VERIFIED_SCORERS = [
      { name: "Kylian Mbappé", team: "Real Madrid", goals: 15, sofaId: 826643 },
      { name: "Harry Kane", team: "Bayern", goals: 14, sofaId: 108579 },
      { name: "Khvicha Kvaratskhelia", team: "PSG", goals: 10, sofaId: 889259 },
      { name: "Julián Alvarez", team: "Atletico Madrid", goals: 10, sofaId: 944656 },
      { name: "Anthony Gordon", team: "Newcastle", goals: 10, sofaId: 914902 },
      { name: "Vinícius Júnior", team: "Real Madrid", goals: 9, sofaId: 868812 },
      { name: "Robert Lewandowski", team: "Barcelona", goals: 9, sofaId: 18129 },
    ];
    const VERIFIED_ASSISTERS = [
      { name: "Khvicha Kvaratskhelia", team: "PSG", assists: 6, sofaId: 889259 },
      { name: "Michael Olise", team: "Bayern", assists: 6, sofaId: 978838 },
      { name: "Achraf Hakimi", team: "PSG", assists: 6, sofaId: 814594 },
      { name: "Vinícius Júnior", team: "Real Madrid", assists: 5, sofaId: 868812 },
      { name: "Serge Gnabry", team: "Bayern", assists: 5, sofaId: 187433 },
    ];
    const VERIFIED_YOUNG = [
      { name: "Jonas Urbig", team: "Bayern", rating: 8.80, age: 22, sofaId: 1130647 },
      { name: "Ruben van Bommel", team: "PSV", rating: 8.30, age: 21, sofaId: 1212550 },
      { name: "Lamine Yamal", team: "Barcelona", rating: 8.08, age: 18, sofaId: 1402912 },
      { name: "Jude Bellingham", team: "Real Madrid", rating: 7.85, age: 22, sofaId: 991011 },
      { name: "Dani van den Heuvel", team: "Club Brugge", rating: 7.80, age: 22, sofaId: 1049432 },
    ];

    try {
      // Force seasonId to 76953 for UCL (2025/26)
      const seasonId = (leagueId === 7) ? 76953 : await this.getLatestSeasonId(leagueId);
      console.log(`✅ [SofaScore] UCL Season ID: ${seasonId}`);

      // Fetch all three stat types in parallel
      const [scorersRaw, assistersRaw, ratingRaw] = await Promise.all([
        this.getTopPlayersByStat(leagueId, seasonId, 'goals'),
        this.getTopPlayersByStat(leagueId, seasonId, 'assists'),
        this.getTopPlayersByStat(leagueId, seasonId, 'rating'),
      ]);

      const scorers = scorersRaw.length > 0
        ? scorersRaw
            .filter((item: any) => item.statistics?.goals > 0)
            .map((item: any) => ({
              name: item.player.name,
              team: item.team.name,
              goals: item.statistics.goals ?? 0,
              sofaId: item.player.id,
            }))
        : VERIFIED_SCORERS;

      const assisters = assistersRaw.length > 0
        ? assistersRaw
            .filter((item: any) => item.statistics?.assists > 0)
            .map((item: any) => ({
              name: item.player.name,
              team: item.team.name,
              assists: item.statistics.assists ?? 0,
              sofaId: item.player.id,
            }))
        : VERIFIED_ASSISTERS;

      // Young players: filter by age ≤ 23 from the rating leaderboard
      const youngFromApi = ratingRaw
        .filter((p: any) => {
          const age = p.player?.dateOfBirthTimestamp
            ? Math.floor((Date.now() / 1000 - p.player.dateOfBirthTimestamp) / 31_557_600)
            : p.player?.age ?? 99;
          return age <= 23;
        })
        .map((item: any) => {
          const age = item.player?.dateOfBirthTimestamp
            ? Math.floor((Date.now() / 1000 - item.player.dateOfBirthTimestamp) / 31_557_600)
            : item.player?.age ?? 0;
          return {
            name: item.player.name,
            team: item.team.name,
            rating: parseFloat(item.statistics.rating?.toFixed(2) ?? "0"),
            age,
            sofaId: item.player.id,
          };
        });

      const young = youngFromApi.length >= 3 ? youngFromApi : VERIFIED_YOUNG;

      console.log(`✅ [SofaScore] UCL Rankings: ${scorers.length} buteurs, ${assisters.length} passeurs, ${young.length} jeunes`);
      return { scorers, assisters, young, liveFromApi: scorersRaw.length > 0 };
    } catch (err: any) {
      console.error("❌ [SofaScore] Erreur fetchUCLTopStats:", err.message);
      return { scorers: VERIFIED_SCORERS, assisters: VERIFIED_ASSISTERS, young: VERIFIED_YOUNG, liveFromApi: false };
    }
  }

  /**
   * Fetches the full detailed statistics table for UCL players
   * Includes: Assists, Key Passes, Big Chances Created, Accurate Passes %, Rating
   */
  async fetchUCLFullDetailedStats() {
    const leagueId = 7;
    const seasonId = 76953; // Official 2025/26 season

    try {
      console.log(`📊 [SofaScore] Fetching FULL UCL Detailed Stats for season ${seasonId}...`);
      
      // We'll fetch by 'rating' which usually returns the most complete player list
      // and contains the secondary stats in the statistics object.
      const playersRaw = await this.getTopPlayersByStat(leagueId, seasonId, 'rating');

      if (!playersRaw || playersRaw.length === 0) {
        return [];
      }

      return playersRaw.map((item: any) => ({
        name: item.player.name,
        team: item.team.name,
        bigChancesCreated: item.statistics.bigChancesCreated ?? 0,
        assists: item.statistics.assists ?? 0,
        accuratePasses: item.statistics.accuratePasses ?? 0,
        accuratePassesPercentage: parseFloat(item.statistics.accuratePassesPercentage?.toFixed(2) ?? "0"),
        keyPasses: item.statistics.keyPasses ?? 0,
        rating: parseFloat(item.statistics.rating?.toFixed(2) ?? "0"),
        sofaId: item.player.id,
        teamId: item.team.id
      }));
    } catch (err: any) {
      console.error("❌ [SofaScore] Erreur fetchUCLFullDetailedStats:", err.message);
      return [];
    }
  }
}

export const sofaScoreService = new SofaScoreService();
