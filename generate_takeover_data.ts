import fs from "fs";

const raw = fs.readFileSync("yamal_villarreal_data.json", "utf-8");
const data = JSON.parse(raw);

const heatmap = data.heatmap.heatmap || [];
const rawShots = data.shotmap.shotmap || [];
const playerShots = rawShots.filter((s: any) => s.player?.id === 1402912);

const formattedShots = playerShots.map((s: any) => ({
  x: s.playerCoordinates.x,
  y: s.playerCoordinates.y,
  result: s.shotType, // 'goal', 'miss', 'save', 'block'
  time: `${s.time}'` + (s.addedTime ? `+${s.addedTime}` : ''),
  xg: parseFloat(s.xg.toFixed(2)),
  bodyPart: s.bodyPart,
  situation: s.situation
}));

console.log("=== HEATMAP POINTS ===");
console.log(JSON.stringify(heatmap));

console.log("\n=== SHOTS ===");
console.log(JSON.stringify(formattedShots));
