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
      const today = new Date();
      const yyyymmdd = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
      
      let activeLeagueSlugs: string[] = [];
      try {
        const headerUrl = `http://site.api.espn.com/apis/v2/scoreboard/header?sport=soccer&dates=${yyyymmdd}`;
        const headerRes = await fetch(headerUrl, { signal: AbortSignal.timeout(5000) });
        if (headerRes.ok) {
          const headerData: any = await headerRes.json();
          const soccerSports = headerData.sports?.find((s: any) => s.slug === 'soccer' || s.name === 'Soccer');
          if (soccerSports && soccerSports.leagues) {
            activeLeagueSlugs = soccerSports.leagues.map((l: any) => l.slug).filter(Boolean);
          }
        }
      } catch (err) {
        log(`[ESPN Score Service] Failed to fetch header leagues: ${err}`);
      }

      // Fallback leagues if header API fails or returns nothing
      if (activeLeagueSlugs.length === 0) {
        activeLeagueSlugs = [
          "eng.1", "esp.1", "fra.1", "ita.1", "ger.1", // Top 5 Europe
          "uefa.champions", "uefa.europa", "uefa.europa.conf", // European cups
          "fifa.friendly", "fifa.worldq.uefa", "fifa.worldq.conmebol", // International break matches
          "uefa.nations", "conmebol.libertadores" // Other prominent ones
        ];
      }
      
      const fetchLeagueMatches = async (leagueCode: string) => {
        try {
          const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueCode}/scoreboard?dates=${yyyymmdd}`;
          const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 PlayerStats/1.0" },
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) return [];

          const data: any = await response.json();
          const events = data.events || [];
          const leagueData = data.leagues?.[0] || { name: "Soccer", abbreviation: "SOC" };

          return events.map((event: any) => {
            const competition = event.competitions?.[0];
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
              league: leagueData.name,
              venue: competition?.venue?.fullName,
            };
          });
        } catch (e) {
          log(`[ESPN Score Service] Failed to fetch league ${leagueCode}: ${e}`);
          return [];
        }
      };

      const results = await Promise.all(activeLeagueSlugs.map(fetchLeagueMatches));
      const matches = results.flat();
      
      // Sort matches by relevance (status, league prestige, and team prestige), then by date
      const getRelevance = (match: any) => {
        let score = 0;
        
        // 1. Status prioritization (Live > Upcoming > Finished)
        const state = match.status?.type?.state;
        if (state === 'in') score += 100000;
        else if (state === 'pre') score += 50000;
        
        // 2. League prioritization
        const leagueName = (match.league || '').toLowerCase();
        const topLeagues = [
          'premier league', 'laliga', 'champions league', 'europa league', 
          'ligue 1', 'serie a', 'bundesliga', 'world cup', 'euro', 'copa america'
        ];
        
        if (topLeagues.some(l => leagueName.includes(l))) {
          score += 10000;
        } else if (leagueName.includes('nations league') || leagueName.includes('qualifying') || leagueName.includes('libertadores') || leagueName.includes('friendly')) {
          score += 5000;
        }

        // 3. Team prioritization (Top Nations & Clubs)
        const topTeams = [
          // National Teams
          'france', 'brazil', 'brésil', 'argentina', 'argentine', 'spain', 'espagne',
          'england', 'angleterre', 'germany', 'allemagne', 'portugal', 'italy', 'italie',
          'netherlands', 'pays-bas', 'croatia', 'croatie', 'belgium', 'belgique', 'uruguay',
          'colombia', 'colombie', 'morocco', 'maroc', 'senegal', 'ivory coast', 'cote d\'ivoire',
          // Clubs
          'real madrid', 'barcelona', 'bayern munich', 'manchester city', 'arsenal',
          'liverpool', 'paris saint-germain', 'psg', 'juventus', 'inter', 'ac milan', 'dortmund', 'atletico'
        ];

        const homeTeamName = (match.homeTeam?.name || '').toLowerCase();
        const awayTeamName = (match.awayTeam?.name || '').toLowerCase();

        const hasTopHome = topTeams.some(t => homeTeamName.includes(t));
        const hasTopAway = topTeams.some(t => awayTeamName.includes(t));

        if (hasTopHome) score += 40000;
        if (hasTopAway) score += 40000;
        
        // 4. Penalize youth teams (U21, U20, U19 etc.) so senior Pros always show first
        const isYouth = 
          homeTeamName.match(/\bU\d+\b/i) || 
          awayTeamName.match(/\bU\d+\b/i) ||
          homeTeamName.includes('under') || awayTeamName.includes('under') ||
          leagueName.includes('u21') || leagueName.includes('u-21') ||
          leagueName.match(/under-\d+/i) ||
          leagueName.includes('youth');

        if (isYouth) {
          score -= 1000000; // Nuclear penalty
        }
        
        return score;
      };

      matches.sort((a, b) => {
        const scoreA = getRelevance(a);
        const scoreB = getRelevance(b);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Descending relevance score
        }
        
        return new Date(a.date).getTime() - new Date(b.date).getTime();
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
