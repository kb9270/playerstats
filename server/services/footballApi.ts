import { db } from "../db";
import { matches, teams } from "../../shared/schema";
import { eq } from "drizzle-orm";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const BASE_URL = 'https://api.football-data.org/v4';

let matchCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 secondes de cache pour la limite API

export async function getLiveMatches() {
  const now = Date.now();
  
  if (matchCache && (now - matchCache.timestamp) < CACHE_DURATION) {
    console.log('⚡ [API] Retournant les matchs du cache (60s)...');
    return matchCache.data;
  }

  try {
    console.log('📡 [API] Récupération des matchs live sur Football-Data.org...');
    
    // Si pas de clé d'API, on mock data pour la démo
    if (!API_KEY) {
      console.warn("⚠️ Pas de clé FOOTBALL_DATA_API_KEY. Utilisation de données simulées.");
      const demoMatches = [
        {
          id: 1,
          homeTeam: { id: 86, name: "Real Madrid", logo: "https://crests.football-data.org/86.png" },
          awayTeam: { id: 81, name: "FC Barcelone", logo: "https://crests.football-data.org/81.png" },
          score: { home: 1, away: 2 },
          status: "LIVE",
          minute: 74,
          startTime: new Date().toISOString()
        },
        {
          id: 2,
          homeTeam: { id: 65, name: "Man City", logo: "https://crests.football-data.org/65.png" },
          awayTeam: { id: 57, name: "Arsenal", logo: "https://crests.football-data.org/57.png" },
          score: { home: 0, away: 0 },
          status: "SCHEDULED",
          minute: 0,
          startTime: new Date(Date.now() + 3600000).toISOString()
        }
      ];
      matchCache = { data: demoMatches, timestamp: now };
      return demoMatches;
    }

    const response = await fetch(`${BASE_URL}/matches`, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    // Mapping vers notre schéma Next.js/React attendu
    const mappedMatches = data.matches.map((match: any) => ({
      id: match.id,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.crest
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.crest
      },
      score: {
        home: match.score.fullTime.home,
        away: match.score.fullTime.away
      },
      status: match.status, // LIVE, SCHEDULED, FINISHED
      minute: match.minute || null,
      startTime: match.utcDate
    }));

    matchCache = { data: mappedMatches, timestamp: now };
    return mappedMatches;
  } catch (error) {
    console.error('❌ [API ERROR]:', error);
    
    // Fallback safe si crash de fetch
    if (matchCache) return matchCache.data;
    return [];
  }
}
