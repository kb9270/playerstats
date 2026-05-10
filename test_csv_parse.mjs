import fs from 'fs';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

const content = fs.readFileSync('players_data_2025_2026.csv', 'utf-8');
const lines = content.split('\n');
const headers = parseCSVLine(lines[0]);

console.log('Total headers:', headers.length);
console.log('sofascore_id index:', headers.indexOf('sofascore_id'));

// Find Saliba
let nullIdCount = 0;
let validIdCount = 0;
let sampleBroken = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const values = parseCSVLine(lines[i]);
  const player = {};
  headers.forEach((h, idx) => {
    let value = values[idx] || '';
    if (typeof value === 'string') value = value.trim();
    if (!isNaN(Number(value)) && value !== '' && value !== null) {
      value = Number(value);
    } else if (value === '' || value === 'null' || value === 'undefined') {
      value = null;
    }
    player[h.trim()] = value;
  });
  
  if (player.sofascore_id && player.sofascore_id > 1000) {
    validIdCount++;
  } else {
    nullIdCount++;
    if (sampleBroken.length < 10) {
      sampleBroken.push(`${player.Player} (${player.Squad}) -> sofascore_id=${player.sofascore_id}, line fields=${values.length}`);
    }
  }

  // Specifically check Saliba
  if (player.Player && player.Player.includes('Saliba')) {
    console.log('\n=== SALIBA DEBUG ===');
    console.log('Player:', player.Player);
    console.log('Squad:', player.Squad);
    console.log('sofascore_id:', player.sofascore_id);
    console.log('typeof:', typeof player.sofascore_id);
    console.log('Values length:', values.length);
    console.log('Last 5 values:', values.slice(-5));
    console.log('Raw value at index 53:', JSON.stringify(values[53]));
  }
}

console.log('\n=== SUMMARY ===');
console.log('Valid IDs:', validIdCount);
console.log('Null IDs:', nullIdCount);
console.log('\nSample players without ID:');
sampleBroken.forEach(s => console.log(' ', s));
