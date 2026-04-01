
import { CSVDirectAnalyzer } from './server/services/csvDirectAnalyzer.ts';

const analyzer = new CSVDirectAnalyzer();
analyzer.getAllPlayers().then(players => {
    console.log(`Found ${players.length} players total in memory`);
    if (players.length > 0) {
        console.log(`First player: ${players[0].Player}`);
    }
    analyzer.searchPlayers('Tay').then(results => {
        console.log(`Search for 'Tay' returned ${results.length} results`);
        if (results.length > 0) {
            console.log(`First result: ${results[0].Player}`);
        }
    });
}).catch(err => {
    console.error('Error:', err);
});
