import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    console.log("Testing SofaScore direct fetch for Premier League 24/25 (61627)...");
    const goals = await sofaScoreService.getTopPlayersByStat(17, 61627, 'goals');
    console.log("Goals list size (24/25):", goals.length);
    if (goals.length > 0) {
      console.log("First player goals stat:", JSON.stringify(goals[0], null, 2));
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

test();
