import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    console.log("Testing SofaScore direct fetch for Premier League (17) 2025/26 (76986)...");
    const goals = await sofaScoreService.getTopPlayersByStat(17, 76986, 'goals');
    console.log("Goals list size:", goals.length);
    if (goals.length > 0) {
      console.log("First player goals stat:", JSON.stringify(goals[0], null, 2));
    }
    
    const assists = await sofaScoreService.getTopPlayersByStat(17, 76986, 'assists');
    console.log("Assists list size:", assists.length);
    if (assists.length > 0) {
      console.log("First player assists stat:", JSON.stringify(assists[0], null, 2));
    }
  } catch (err: any) {
    console.error("Error during direct SofaScore test:", err.message);
  }
}

test();
