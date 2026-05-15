import { sofaScoreService } from './server/services/sofaScoreService';

async function test() {
  try {
    const res = await sofaScoreService.fetchWithCache('/unique-tournament/7/season/76953/statistics?accumulation=total&group=player&fields=goals,assists,rating');
    console.log('API Response Sample (First 2 results):');
    console.log(JSON.stringify(res.data.results.slice(0, 2), null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
