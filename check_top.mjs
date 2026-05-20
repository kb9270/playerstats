import fs from "fs";
import csv from "papaparse";

const file = fs.readFileSync('players_data_2025_2026.csv', 'utf8');
const p = csv.parse(file, {header:true, skipEmptyLines:true});

const topClubs = ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal', 'Liverpool', 'Bayern Munich', 'Paris S-G', 'Dortmund', 'Juventus', 'Inter', 'Milan', 'Atlético Madrid', 'Bayer Leverkusen', 'Chelsea', 'Manchester Utd', 'Aston Villa'];

const missing = p.data.filter(r => !r.fbref_id || r.fbref_id.trim() === '');
const missingTop = missing.filter(r => topClubs.some(c => (r.Squad || '').includes(c)));

console.log(`Nombre de joueurs manquants du TOP Europe : ${missingTop.length}`);
missingTop.forEach(r => console.log(`- ${r.Player} (${r.Squad})`));
