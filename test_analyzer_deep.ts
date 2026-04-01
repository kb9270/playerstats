import fs from 'fs';
import path from 'path';
import { csvDirectAnalyzer } from './server/services/csvDirectAnalyzer';

async function test() {
  console.log('--- Analyzer Debug ---');
  const players = await csvDirectAnalyzer.getAllPlayers();
  console.log(`Players count: ${players.length}`);
  
  if (players.length === 0) {
    console.log('CRITICAL: Analyzer loaded 0 players');
    const csvPath = (csvDirectAnalyzer as any).currentCsvPath;
    console.log(`Current CSV Path: ${csvPath}`);
    console.log(`Exists: ${fs.existsSync(csvPath)}`);
    if (fs.existsSync(csvPath)) {
        const content = fs.readFileSync(csvPath, 'utf-8');
        console.log(`Content length: ${content.length}`);
        const lines = content.split('\n');
        console.log(`Lines length: ${lines.length}`);
        
        // Manual parse attempt
        const headers = (csvDirectAnalyzer as any).parseCSVLine(lines[0]);
        console.log(`Headers: ${headers.join('|')}`);
        const firstRow = (csvDirectAnalyzer as any).parseCSVLine(lines[1]);
        console.log(`First Row: ${firstRow.join('|')}`);
        
        const player: any = {};
        headers.forEach((h: string, i: number) => player[h.trim()] = firstRow[i]);
        console.log(`Mapped Player: ${JSON.stringify(player)}`);
        console.log(`Player Name: ${player.Player}`);
    }
  }
}

test();
