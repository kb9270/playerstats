import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    const path = '/unique-tournament/17/season/76986/top-players/overall';
    const resp = await sofaScoreService.fetchWithCache(path);
    const topPlayers = resp.data.topPlayers;
    console.log("Categories inside topPlayers:", Object.keys(topPlayers));
    
    // Check key stats
    for (const key of ['goals', 'assists', 'rating', 'cleanSheet']) {
      if (topPlayers[key]) {
        console.log(`\nCategory: ${key} (count: ${topPlayers[key].length})`);
        console.log("Top player:", topPlayers[key][0].player.name, "from", topPlayers[key][0].team.name, "value:", topPlayers[key][0].statistics[key]);
      } else {
        console.log(`\nCategory: ${key} DOES NOT EXIST`);
      }
    }
  } catch (err: any) {
    console.error("FAILED!", err.message);
  }
}

test();
