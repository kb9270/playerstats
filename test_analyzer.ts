import { csvDirectAnalyzer } from './server/services/csvDirectAnalyzer';
import fs from 'fs';
import path from 'path';

async function test() {
  console.log(`CWD: ${process.cwd()}`);
  const players = await csvDirectAnalyzer.getAllPlayers();
  console.log(`Players count: ${players.length}`);
}

test();
