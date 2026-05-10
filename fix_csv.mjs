import fs from 'fs';

const csvPath = 'players_data_2025_2026.csv';
const content = fs.readFileSync(csvPath, 'utf-8');
const rawLines = content.split('\n');

console.log(`📄 Lignes brutes: ${rawLines.length}`);

const header = rawLines[0].replace(/\r$/, '');

// A valid data line starts with: NUMBER,PLAYER_NAME_WITH_LETTERS,
// A continuation line starts with something else (a partial number, or data without a proper name)
const validLineStart = /^\d{1,4},[A-ZÀ-ÿa-z]/;

const fixedLines = [header];
let buffer = '';
let mergeCount = 0;

for (let i = 1; i < rawLines.length; i++) {
  const line = rawLines[i].replace(/\r$/, '');
  if (!line.trim()) continue;
  
  if (validLineStart.test(line)) {
    // This looks like a new valid line
    if (buffer) {
      fixedLines.push(buffer);
    }
    buffer = line;
  } else {
    // This is a continuation of the previous line
    buffer += line;
    mergeCount++;
  }
}

if (buffer.trim()) {
  fixedLines.push(buffer);
}

console.log(`🔧 Fragments fusionnés: ${mergeCount}`);
console.log(`✅ Lignes finales: ${fixedLines.length} (header + ${fixedLines.length - 1} joueurs)`);

// Verify with proper CSV parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'; i += 2;
      } else { inQuotes = !inQuotes; i++; }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = ''; i++;
    } else { current += char; i++; }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

let withId = 0, noId = 0, wrongFields = 0;
for (let i = 1; i < fixedLines.length; i++) {
  const fields = parseCSVLine(fixedLines[i]);
  if (fields.length !== 54) {
    wrongFields++;
    if (wrongFields <= 3) {
      console.log(`  ⚠️ Champs incorrects (${fields.length}): ${fields[1]} (${fields[4]})`);
    }
    continue;
  }
  const sofaId = fields[53]?.trim();
  if (sofaId && !isNaN(Number(sofaId)) && Number(sofaId) > 100) {
    withId++;
  } else {
    noId++;
  }
}

console.log(`\n📈 Avec sofascore_id: ${withId}`);
console.log(`📉 Sans sofascore_id: ${noId}`);
console.log(`❌ Lignes malformées: ${wrongFields}`);

// Write
const output = fixedLines.join('\n') + '\n';
fs.writeFileSync(csvPath, output, 'utf-8');
console.log(`\n✅ CSV corrigé sauvegardé !`);

// Spot check
const recheck = fs.readFileSync(csvPath, 'utf-8').split('\n');
for (const line of recheck) {
  if (!line.trim()) continue;
  const f = parseCSVLine(line);
  if (f[1]?.includes('Saliba') || f[1]?.includes('Aaronson') || f[1]?.includes('Saka') || f[1]?.includes('Mbappé')) {
    console.log(`  ✅ ${f[1]} -> fields=${f.length}, sofascore_id=${f[53]}`);
  }
}
