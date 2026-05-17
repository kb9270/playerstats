/**
 * Batch Pre-Cacher for SofaScore Match Data
 * Uses Bottleneck rate limiter to avoid API bans.
 * Pre-fetches: heatmaps, shotmaps, passes, actions for each player match.
 */
import Bottleneck from "bottleneck";
import { sofaScoreService } from "./sofaScoreService";

// ── Rate limiter: max 1 request per 2.5 seconds, max 2 concurrent ──
const limiter = new Bottleneck({
  maxConcurrent: 1,        // Only 1 request at a time
  minTime: 2500,           // 2.5 seconds between requests
  reservoir: 60,           // Max 60 requests per cycle
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 5 * 60 * 1000, // Refill every 5 minutes
});

limiter.on("failed", async (error, jobInfo) => {
  const wait = jobInfo.retryCount < 3 ? 10000 + jobInfo.retryCount * 5000 : null;
  if (wait) {
    console.warn(`⏳ [BatchCache] Request failed, retrying in ${wait / 1000}s... (attempt ${jobInfo.retryCount + 1})`);
  }
  return wait;
});

limiter.on("retry", (error, jobInfo) => {
  console.log(`🔄 [BatchCache] Retrying job (attempt ${jobInfo.retryCount})...`);
});

// ── Types ──
interface CacheJob {
  type: "heatmap" | "shotmap" | "passes" | "actions" | "stats";
  eventId: number;
  sofaId: number;
  path: string;
}

interface PreCacheProgress {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  skippedJobs: number; // Already cached
  currentJob: string;
  isRunning: boolean;
  startedAt: number;
  estimatedTimeRemaining: string;
  errors: string[];
}

// ── Singleton progress tracker ──
let progress: PreCacheProgress = {
  totalJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
  skippedJobs: 0,
  currentJob: "",
  isRunning: false,
  startedAt: 0,
  estimatedTimeRemaining: "—",
  errors: [],
};

export function getPreCacheProgress(): PreCacheProgress {
  return { ...progress };
}

/**
 * Pre-cache all match data for a given player.
 * Fetches the player's last N events, then for each event, 
 * downloads heatmap, shotmap, passes, and actions data.
 */
export async function preCachePlayerMatches(sofaId: number, maxMatches = 20): Promise<void> {
  console.log(`\n🚀 [BatchCache] Starting pre-cache for player ${sofaId} (max ${maxMatches} matches)...`);

  // Step 1: Get player events (this is usually already cached)
  let events: any[] = [];
  try {
    events = await sofaScoreService.getPlayerLastEvents(sofaId);
  } catch (err: any) {
    console.error(`❌ [BatchCache] Could not fetch events for player ${sofaId}: ${err.message}`);
    return;
  }

  if (!events || events.length === 0) {
    console.log(`⚠️ [BatchCache] No events found for player ${sofaId}`);
    return;
  }

  // Take the most recent N matches
  const recentEvents = events.slice(-maxMatches).reverse();
  console.log(`📋 [BatchCache] Found ${recentEvents.length} events for player ${sofaId}`);

  // Step 2: Build job queue
  const jobs: CacheJob[] = [];
  for (const event of recentEvents) {
    const eid = event.id;
    jobs.push(
      { type: "stats",   eventId: eid, sofaId, path: `/event/${eid}/player/${sofaId}/statistics` },
      { type: "heatmap", eventId: eid, sofaId, path: `/event/${eid}/player/${sofaId}/heatmap` },
      { type: "shotmap", eventId: eid, sofaId, path: `/event/${eid}/shotmap` },
      { type: "passes",  eventId: eid, sofaId, path: `/event/${eid}/player/${sofaId}/passes` },
      { type: "actions",  eventId: eid, sofaId, path: `/event/${eid}/player/${sofaId}/actions` },
    );
  }

  // Also add the event details (match info)
  for (const event of recentEvents) {
    jobs.push({ type: "stats", eventId: event.id, sofaId, path: `/event/${event.id}` });
  }

  console.log(`📦 [BatchCache] ${jobs.length} total cache jobs queued`);

  // Step 3: Execute jobs through rate limiter
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs) {
    await limiter.schedule(async () => {
      try {
        // fetchWithCache already checks the cache internally
        // If already cached, it will return instantly (cache HIT)
        const result = await sofaScoreService.fetchWithCache(job.path);
        
        // Check if it was a cache hit (logged internally)
        completed++;
        
        if (completed % 10 === 0) {
          console.log(`📊 [BatchCache] Progress: ${completed}/${jobs.length} done (${failed} failed, ${skipped} skipped)`);
        }
      } catch (err: any) {
        failed++;
        if (err.response?.status === 403) {
          console.warn(`🚫 [BatchCache] 403 Blocked: ${job.path}`);
        } else if (err.response?.status === 404) {
          // 404 is normal for some endpoints (e.g., no passes data for GKs)
          skipped++;
        } else {
          console.error(`❌ [BatchCache] Error on ${job.path}: ${err.message}`);
        }
      }
    });
  }

  console.log(`\n✅ [BatchCache] Player ${sofaId} complete: ${completed} cached, ${failed} failed, ${skipped} skipped`);
}

/**
 * Pre-cache match data for MULTIPLE players in sequence.
 * This is the main entry point used by the API route.
 */
export async function preCacheMultiplePlayers(sofaIds: number[], maxMatchesPerPlayer = 15): Promise<void> {
  if (progress.isRunning) {
    console.log("⚠️ [BatchCache] Already running, skipping...");
    return;
  }

  const totalEstimatedJobs = sofaIds.length * maxMatchesPerPlayer * 6; // 6 endpoints per match
  progress = {
    totalJobs: totalEstimatedJobs,
    completedJobs: 0,
    failedJobs: 0,
    skippedJobs: 0,
    currentJob: "",
    isRunning: true,
    startedAt: Date.now(),
    estimatedTimeRemaining: "Calcul en cours...",
    errors: [],
  };

  console.log(`\n🏁 [BatchCache] Starting batch pre-cache for ${sofaIds.length} players...`);
  console.log(`    Estimated ${totalEstimatedJobs} API calls at ~2.5s each = ~${Math.round(totalEstimatedJobs * 2.5 / 60)} minutes`);
  console.log(`    (Cache hits will be instant, reducing total time significantly)\n`);

  for (let i = 0; i < sofaIds.length; i++) {
    const sid = sofaIds[i];
    progress.currentJob = `Joueur ${i + 1}/${sofaIds.length} (sofaId: ${sid})`;
    
    try {
      // Get events for this player
      let events: any[] = [];
      try {
        events = await sofaScoreService.getPlayerLastEvents(sid);
      } catch (err: any) {
        progress.errors.push(`Player ${sid}: ${err.message}`);
        continue;
      }

      const recentEvents = (events || []).slice(-maxMatchesPerPlayer).reverse();
      
      // Update total based on actual events found
      const actualJobs = recentEvents.length * 6;
      
      for (const event of recentEvents) {
        const eid = event.id;
        const endpoints = [
          `/event/${eid}`,
          `/event/${eid}/player/${sid}/statistics`,
          `/event/${eid}/player/${sid}/heatmap`,
          `/event/${eid}/shotmap`,
          `/event/${eid}/player/${sid}/passes`,
          `/event/${eid}/player/${sid}/actions`,
        ];

        for (const path of endpoints) {
          await limiter.schedule(async () => {
            try {
              await sofaScoreService.fetchWithCache(path);
              progress.completedJobs++;
            } catch (err: any) {
              if (err.response?.status === 404) {
                progress.skippedJobs++;
              } else {
                progress.failedJobs++;
                if (err.response?.status === 403) {
                  console.warn(`🚫 [BatchCache] 403: ${path}`);
                }
              }
            }

            // Update estimated time
            const elapsed = Date.now() - progress.startedAt;
            const done = progress.completedJobs + progress.failedJobs + progress.skippedJobs;
            if (done > 5) {
              const avgTimePerJob = elapsed / done;
              const remaining = (progress.totalJobs - done) * avgTimePerJob;
              const mins = Math.round(remaining / 60000);
              progress.estimatedTimeRemaining = mins > 0 ? `~${mins} min` : "< 1 min";
            }
          });
        }
      }

      console.log(`✅ [BatchCache] Player ${sid} done (${i + 1}/${sofaIds.length})`);
      
    } catch (err: any) {
      progress.errors.push(`Player ${sid}: ${err.message}`);
      console.error(`❌ [BatchCache] Error processing player ${sid}:`, err.message);
    }
  }

  progress.isRunning = false;
  progress.currentJob = "Terminé";
  progress.estimatedTimeRemaining = "0";
  
  console.log(`\n🏁 [BatchCache] ALL DONE: ${progress.completedJobs} cached, ${progress.failedJobs} failed, ${progress.skippedJobs} skipped`);
}
