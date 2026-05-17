import fs from "fs";

const raw = fs.readFileSync("yamal_villarreal_data.json", "utf-8");
const data = JSON.parse(raw);

console.log("=== MATCH OVERVIEW ===");
const event = data.event.event;
console.log(`${event.homeTeam.name} ${event.homeScore.current}-${event.awayScore.current} ${event.awayTeam.name}`);
console.log(`Tournament: ${event.tournament.name}`);

console.log("\n=== LAMINE YAMAL STATISTICS ===");
const stats = data.statistics.statistics;
console.log(`Rating: ${stats.rating}`);
console.log(`Goals: ${stats.goals || 0}`);
console.log(`Assists: ${stats.goalAssist || 0}`);
console.log(`Minutes: ${stats.minutesPlayed}`);
console.log(`Shots: ${stats.onTargetScoringAttempt || 0} on target / ${stats.totalScoringAttempt || 0} total`);
console.log(`Passes: ${stats.accuratePass || 0}/${stats.totalPass || 0}`);
console.log(`Dribbles: ${stats.successfulDribbles || 0}/${(stats.successfulDribbles||0) + (stats.failedDribbles||0)}`);

console.log("\n=== HEATMAP POINTS ===");
const heatmap = data.heatmap.heatmap || [];
console.log(`Total heatmap points: ${heatmap.length}`);
if (heatmap.length > 0) {
  console.log("Sample point:", heatmap[0]);
}

console.log("\n=== SHOTMAP ===");
const shotmap = data.shotmap.shotmap || [];
const playerShots = shotmap.filter((s: any) => s.player?.id === 1402912);
console.log(`Total shots by Lamine Yamal: ${playerShots.length}`);
if (playerShots.length > 0) {
  console.log("Sample shot:", playerShots[0]);
}

console.log("\n=== PASSES ===");
const passes = data.passes.passes || [];
console.log(`Total passes: ${passes.length}`);
if (passes.length > 0) {
  console.log("Sample pass:", passes[0]);
}

console.log("\n=== ACTIONS ===");
const actions = data.actions.actions || [];
console.log(`Total actions: ${actions.length}`);
if (actions.length > 0) {
  console.log("Sample action:", actions[0]);
}
