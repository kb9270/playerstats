import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    console.log("Fetching seasons for unique tournament 17 (Premier League)...");
    const resp = await sofaScoreService.fetchWithCache('/unique-tournament/17/seasons');
    console.log("SUCCESS!");
    console.log("Seasons:", JSON.stringify(resp.data.seasons.slice(0, 5), null, 2));
  } catch (err: any) {
    console.error("FAILED!", err.message);
  }
}

test();
