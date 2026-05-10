import fs from 'fs';

const content = fs.readFileSync('players_data_2025_2026.csv', 'utf-8');
const lines = content.split('\n');

// Check raw comma counts for first few lines
for (let i = 0; i < 5; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const rawCommas = (line.match(/,/g) || []).length;
  const hasQuotes = line.includes('"');
  const stripped = line.replace(/\r$/, '');
  // Count bytes
  const endsWithR = line.endsWith('\r');
  console.log(`Line ${i}: rawCommas=${rawCommas}, hasQuotes=${hasQuotes}, endsWithCR=${endsWithR}, len=${stripped.length}`);
  if (i > 0) {
    // Show the Pos field area (fields 3)
    const simpleFields = stripped.split(',');
    console.log(`  simpleFields[3]="${simpleFields[3]}", simpleFields count=${simpleFields.length}`);
  }
}

// Now check: how many lines have \r in the MIDDLE (not at the end)?
let midCR = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Remove trailing \r, then check if there's still a \r
  const stripped = line.replace(/\r$/, '');
  if (stripped.includes('\r')) {
    midCR++;
    if (midCR <= 3) {
      const pos = stripped.indexOf('\r');
      console.log(`\nLine ${i} has MID \\r at position ${pos}/${stripped.length}:`);
      console.log(`  Before: "${stripped.substring(Math.max(0,pos-20), pos)}"`);
      console.log(`  After:  "${stripped.substring(pos+1, pos+21)}"`);
    }
  }
}
console.log(`\nLines with mid-\\r: ${midCR}`);

// Check specifically: lines with 53 simple comma-separated fields
let count53 = 0;
let count54 = 0;
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const stripped = lines[i].replace(/\r$/, '');
  const rawCommas = (stripped.match(/,/g) || []).length;
  if (rawCommas === 53) count54++;
  else if (rawCommas === 52) count53++;
}
console.log(`\nLines with 53 raw commas (→54 fields): ${count54}`);
console.log(`Lines with 52 raw commas (→53 fields): ${count53}`);
console.log(`Lines with 54 raw commas (quoted with extra comma): check below`);

// Now the key question: for lines with quoted Pos like "MF,FW", how many raw commas?
let quoted54 = 0, quoted53 = 0;
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const stripped = lines[i].replace(/\r$/, '');
  if (!stripped.includes('"')) continue;
  const rawCommas = (stripped.match(/,/g) || []).length;
  if (rawCommas === 54) quoted54++;
  else if (rawCommas === 53) quoted53++;
  if (quoted53 + quoted54 <= 2) {
    console.log(`\nQuoted line ${i}: rawCommas=${rawCommas}`);
    console.log(`  Line start: ${stripped.substring(0, 100)}`);
  }
}
console.log(`\nQuoted lines with 54 raw commas: ${quoted54}`);
console.log(`Quoted lines with 53 raw commas: ${quoted53}`);
