import axios from "axios";

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
  private axiosInstance = axios.create({
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

  async searchPlayer(name: string): Promise<any[]> {
    try {
      const resp = await this.axiosInstance.get(`/search/?q=${encodeURIComponent(name)}&type=player`);
      return resp.data.results || [];
    } catch (err) {
      console.error(`❌ [SofaScore] Erreur recherche joueur ${name}:`, err);
      return [];
    }
  }

  async getPlayerDetails(sofaId: number) {
    try {
      const resp = await this.axiosInstance.get(`/player/${sofaId}`);
      const info = resp.data.player;
      
      return {
        id: info.id,
        name: info.name,
        slug: info.slug,
        shortName: info.shortName,
        position: info.position,
        height: info.height,
        preferredFoot: info.preferredFoot,
        marketValueCurrency: info.proposedMarketValueCurrency,
        marketValue: info.proposedMarketValue,
        country: info.country?.name,
        dateOfBirth: info.dateOfBirthTimestamp ? new Date(info.dateOfBirthTimestamp * 1000).toISOString() : null,
        team: info.team?.name,
        league: info.team?.tournament?.uniqueTournament?.name
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

  async getPlayerStatistics(sofaId: number, tournamentId: number = 0, seasonId: number = 0) {
    try {
      // Default to Premier League if not specified for major stars, 
      // but usually the details give us the tournament.
      const url = seasonId && tournamentId 
        ? `/player/${sofaId}/statistics/${tournamentId}/${seasonId}`
        : `/player/${sofaId}/statistics/7/2026`; // Fallback to current PL season 26/27
      
      const resp = await this.axiosInstance.get(url);
      return resp.data.statistics || null;
    } catch {
      return null;
    }
  }
}

export const sofaScoreService = new SofaScoreService();
