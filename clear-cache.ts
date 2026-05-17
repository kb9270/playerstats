import fs from 'fs';
import path from 'path';

function clear() {
  const files = [
    'sofascore_daily_cache.json',
    'sofascore_cache.json',
    'sofascore_daily_cache.json.backup',
    'sofascore_cache.json.backup'
  ];

  files.forEach(file => {
    const p = path.join(process.cwd(), file);
    if (fs.existsSync(p)) {
      console.log(`Deleting cache file: ${file}`);
      fs.unlinkSync(p);
    } else {
      console.log(`Cache file does not exist: ${file}`);
    }
  });
  console.log("Cache cleared successfully!");
}

clear();
