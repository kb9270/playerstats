import { sofaScoreService } from './server/services/sofaScoreService';
import { csvDirectAnalyzer } from './server/services/csvDirectAnalyzer';
import { espnImageService } from './server/services/espnImageService';

function normalizeName(name: string): string {
  return (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function resolveSofaId(
  playerName: string,
  apiSofaId: number,
  allCsvPlayers: any[]
): Promise<number> {
  const normalized = normalizeName(playerName);
  const match = allCsvPlayers.find((p) => {
    const pNorm = normalizeName(p.Player || "");
    return (
      pNorm === normalized ||
      (pNorm.includes(normalized) && normalized.length > 5) ||
      (normalized.includes(pNorm) && pNorm.length > 5)
    );
  });

  const csvId = match?.sofascore_id;
  if (csvId && Number(csvId) > 1000) {
    return Number(csvId);
  }
  return apiSofaId;
}

async function run() {
  const leagueName = "eng Premier League";
  console.log(`Executing exact logic for: "${leagueName}"`);
  
  try {
    const allPlayers = await csvDirectAnalyzer.getAllPlayers();
    const csvPlayers = allPlayers.filter((p: any) => p.Comp === leagueName);

    const SOFA_LEAGUE_MAP: Record<string, { tournamentId: number; seasonId: number }> = {
      "eng Premier League": { tournamentId: 17, seasonId: 76986 },
      "es La Liga":         { tournamentId: 8,  seasonId: 77559 },
      "fr Ligue 1":        { tournamentId: 34, seasonId: 77356 },
      "it Serie A":        { tournamentId: 23, seasonId: 76457 },
      "de Bundesliga":     { tournamentId: 35, seasonId: 77333 }
    };

    const mapping = SOFA_LEAGUE_MAP[leagueName];
    if (!mapping) {
      console.log("No mapping found!");
      return;
    }

    const { tournamentId, seasonId } = mapping;
    console.log(`Fetching from SofaScore: tournamentId=${tournamentId}, seasonId=${seasonId}`);
    
    const [scorersRaw, assistersRaw, ratingRaw] = await Promise.all([
      sofaScoreService.getTopPlayersByStat(tournamentId, seasonId, 'goals'),
      sofaScoreService.getTopPlayersByStat(tournamentId, seasonId, 'assists'),
      sofaScoreService.getTopPlayersByStat(tournamentId, seasonId, 'rating')
    ]);

    console.log(`Raw lengths: scorers=${scorersRaw.length}, assists=${assistersRaw.length}, ratings=${ratingRaw.length}`);

    // Let's test the scorers mapping
    const liveScorers = scorersRaw.length > 0 ? await Promise.all(
      scorersRaw
        .filter((item: any) => item.statistics?.goals > 0)
        .slice(0, 10)
        .map(async (item: any) => {
          const resolvedId = await resolveSofaId(item.player.name, item.player.id, allPlayers);
          return {
            name: item.player.name,
            team: item.team.name,
            value: item.statistics.goals || 0,
            sofaId: resolvedId,
            logo: espnImageService.getTeamLogo(item.team.name),
            headshot: null
          };
        })
    ) : null;

    console.log("Mapped scorers count:", liveScorers?.length);
    if (liveScorers && liveScorers.length > 0) {
      console.log("Top live scorer:", liveScorers[0]);
    }

  } catch (error: any) {
    console.error("CRITICAL RUNTIME ERROR:", error.stack || error.message);
  }
}

run();
