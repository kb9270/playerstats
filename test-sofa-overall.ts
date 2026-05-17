import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    console.log("Testing SofaScore top-players/overall for Premier League 2025/26...");
    const path = '/unique-tournament/17/season/76986/top-players/overall';
    const resp = await sofaScoreService.fetchWithCache(path);
    console.log("SUCCESS!");
    console.log("Keys in overall data:", Object.keys(resp.data));
    
    // Print the first category's players to see what they look like
    const categories = Object.keys(resp.data);
    if (categories.length > 0) {
      console.log(`\n--- First Category (${categories[0]}) ---`);
      console.log(JSON.stringify(resp.data[categories[0]], null, 2).slice(0, 1000));
    }
  } catch (err: any) {
    console.error("FAILED!", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

test();
