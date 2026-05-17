import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    console.log("Testing UCL top players fetch (7, 76953)...");
    const goals = await sofaScoreService.getTopPlayersByStat(7, 76953, 'goals');
    console.log("UCL Goals list size:", goals.length);
    if (goals.length > 0) {
      console.log("First UCL player:", JSON.stringify(goals[0], null, 2));
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

test();
