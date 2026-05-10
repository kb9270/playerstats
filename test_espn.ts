import { espnScoreService } from "./server/services/espnScoreService";

async function test() {
  console.log("Fetching today's matches...");
  const matches = await espnScoreService.getTodayMatches();
  console.log(`Found ${matches.length} matches.`);
  if (matches.length > 0) {
    console.log("First match:", JSON.stringify(matches[0], null, 2));
  }
}

test().catch(console.error);
