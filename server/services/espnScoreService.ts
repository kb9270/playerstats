import { log } from "../vite";

export interface LiveMatch {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: {
    type: {
      name: string;
      description: string;
      state: "pre" | "in" | "post";
      completed: boolean;
    };
    displayClock: string;
    period: number;
  };
  competitions: Array<{
    id: string;
    date: string;
    venue?: {
      fullName: string;
      address: {
        city: string;
      };
    };
    competitors: Array<{
      id: string;
      uid: string;
      type: string;
      order: number;
      homeAway: "home" | "away";
      team: {
        id: string;
        location: string;
        name: string;
        abbreviation: string;
        displayName: string;
        shortDisplayName: string;
        color?: string;
        alternateColor?: string;
        logo: string;
      };
      score: string;
      winner?: boolean;
    }>;
  }>;
  league: {
    name: string;
    abbreviation: string;
  };
}

export class ESPNScoreService {
  private cache: { data: any; ts: number } | null = null;
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds for live data

  async getTodayMatches(): Promise<any[]> {
    if (this.cache && Date.now() - this.cache.ts < this.CACHE_TTL) {
      return this.cache.data;
    }

    try {
      // Fetching from 'all' gives a good overview of major leagues
      const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/score-board";
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 PlayerStats/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data: any = await response.json();
      const events = data.events || [];

      const matches = events.map((event: any) => {
        const competition = event.competitions?.[0];
        const league = data.leagues?.[0] || { name: "Soccer", abbreviation: "SOC" };

        return {
          id: event.id,
          date: event.date,
          status: event.status,
          homeTeam: {
            name: competition?.competitors.find((c: any) => c.homeAway === "home")?.team?.displayName,
            logo: competition?.competitors.find((c: any) => c.homeAway === "home")?.team?.logo,
            score: competition?.competitors.find((c: any) => c.homeAway === "home")?.score,
            winner: competition?.competitors.find((c: any) => c.homeAway === "home")?.winner,
          },
          awayTeam: {
            name: competition?.competitors.find((c: any) => c.homeAway === "away")?.team?.displayName,
            logo: competition?.competitors.find((c: any) => c.homeAway === "away")?.team?.logo,
            score: competition?.competitors.find((c: any) => c.homeAway === "away")?.score,
            winner: competition?.competitors.find((c: any) => c.homeAway === "away")?.winner,
          },
          league: league.name,
          venue: competition?.venue?.fullName,
        };
      });

      this.cache = { data: matches, ts: Date.now() };
      return matches;
    } catch (error) {
      log(`[ESPN Score Service] Error fetching matches: ${error}`);
      return this.cache ? this.cache.data : [];
    }
  }
}

export const espnScoreService = new ESPNScoreService();
