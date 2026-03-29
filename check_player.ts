import { csvDirectAnalyzer } from './server/services/csvDirectAnalyzer';
import { sofaScoreService } from './server/services/sofaScoreService';
import { optimizedTransfermarktApi } from './server/services/optimizedTransfermarktApi';

async function check(name) {
  const allMatches = await csvDirectAnalyzer.searchPlayers(name);
  let p = allMatches.find(p => p.Player.toLowerCase() === name.toLowerCase());
  if (!p) p = allMatches[0];
  
  if (!p) {
    console.log("NOT FOUND IN CSV");
    return;
  }
  
  console.log("CSV PLAYER:", p);
  
  const sofa = await sofaScoreService.searchPlayer(name);
  if (sofa.length > 0) {
    const details = await sofaScoreService.getPlayerDetails(sofa[0].entity.id);
    console.log("SOFASCORE DETAILS:", details);
  }
  
  const tm = await optimizedTransfermarktApi.searchByMultipleCriteria(name, p.Squad);
  console.log("TM RESULTS:", tm);
}

const name = process.argv[2] || "Francesco Acerbi";
check(name).catch(console.error);
