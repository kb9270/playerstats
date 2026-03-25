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
    console.log("🚀 [SofaScore] Construction TOTW (Juste Milieu Fixed)...");
    const allCandidates: any[] = [];

    for (const league of this.leagues) {
      try {
        const seasonId = await this.getLatestSeasonId(league.id);
        const latestPeriod = await this.getLatestRound(league.id, seasonId);
        
        if (!latestPeriod) continue;

        console.log(`🔎 [SofaScore] Fetching ${league.name} Round ${latestPeriod.round?.round || 'Current'}...`);
        const players = await this.getTeamOfTheWeek(league.id, seasonId, latestPeriod.id);
        
        const normalized = players.map((p: any) => {
          let baseRating = parseFloat(p.rating) || 0.0;
          let prestigeRating = baseRating * league.weight;

          const teamName = p.team?.name;

          // 1. Super Elite & Elite Bonus
          if (this.superElite.includes(teamName)) {
            prestigeRating += 2.0; // Huge boost for superstars
          } else if (this.eliteClubs.includes(teamName)) {
            prestigeRating += 1.0; 
          }

          // 2. Goal Scored Bonus
          if ((p.statistics?.goals || 0) > 0) prestigeRating += 0.5;

          return {
            Player: p.player.name,
            Squad: teamName || "Club",
            Gls: p.statistics?.goals || 0,
            Ast: p.statistics?.assists || 0,
            Pos: p.player.position,
            rating: prestigeRating,
            displayRating: baseRating,
            league: league.name,
            sofaId: p.player.id
          };
        });

        allCandidates.push(...normalized);
      } catch (err: any) {
        console.error(`❌ [SofaScore] Erreur critique pour ${league.name}:`, err.response?.status || err.message);
        if (err.response?.status === 403) {
          console.error("⚠️ [SofaScore] Accès refusé (403). Possible blocage Cloudflare/Bot.");
        }
      }
    }

    const unique = Array.from(new Map(allCandidates.map(p => [p.Player, p])).values());
    console.log(`📊 [SofaScore] Candidates Found: ${unique.length}`);
    
    return unique.sort((a, b) => b.rating - a.rating);
  }
}

export const sofaScoreService = new SofaScoreService();
