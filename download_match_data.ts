import { sofaScoreService } from "./server/services/sofaScoreService.ts";
import fs from "fs";

async function main() {
  const eventId = 14081789;
  const sofaId = 1402912;

  console.log("Fetching statistics...");
  const statsResp = await sofaScoreService.fetchWithCache(`/event/${eventId}/player/${sofaId}/statistics`);
  
  console.log("Fetching heatmap...");
  const heatmapResp = await sofaScoreService.fetchWithCache(`/event/${eventId}/player/${sofaId}/heatmap`);
  
  console.log("Fetching event details...");
  const eventResp = await sofaScoreService.fetchWithCache(`/event/${eventId}`);
  
  console.log("Fetching shotmap...");
  const shotmapResp = await sofaScoreService.fetchWithCache(`/event/${eventId}/shotmap`);
  
  console.log("Fetching passes...");
  const passesResp = await sofaScoreService.fetchWithCache(`/event/${eventId}/player/${sofaId}/passes`).catch(() => ({ data: { passes: [] } }));
  
  console.log("Fetching actions...");
  const actionsResp = await sofaScoreService.fetchWithCache(`/event/${eventId}/player/${sofaId}/actions`).catch(() => ({ data: { actions: [] } }));

  const data = {
    event: eventResp.data,
    statistics: statsResp.data,
    heatmap: heatmapResp.data,
    shotmap: shotmapResp.data,
    passes: passesResp.data,
    actions: actionsResp.data
  };

  fs.writeFileSync("yamal_villarreal_data.json", JSON.stringify(data, null, 2));
  console.log("Successfully saved all match details to yamal_villarreal_data.json!");
}

main().catch(console.error);
