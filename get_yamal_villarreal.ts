import { sofaScoreService } from "./server/services/sofaScoreService.ts";

async function main() {
  const sofaId = 1402912;
  console.log("Fetching events for Lamine Yamal (sofaId: 1402912)...");
  
  const events = await sofaScoreService.getPlayerLastEvents(sofaId);
  console.log(`Found ${events.length} events.`);

  const villarrealEvents = events.filter((e: any) => {
    const home = e.homeTeam?.name || "";
    const away = e.awayTeam?.name || "";
    return home.toLowerCase().includes("villarreal") || away.toLowerCase().includes("villarreal");
  });

  console.log("\nMatches against Villarreal:");
  for (const e of villarrealEvents) {
    const date = new Date(e.startTimestamp * 1000).toLocaleString();
    console.log(`Event ID: ${e.id} | ${e.homeTeam?.name} ${e.homeScore?.current}-${e.awayScore?.current} ${e.awayTeam?.name} | Date: ${date}`);
  }
}

main().catch(console.error);
