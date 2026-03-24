import type { Express } from "express";
import { db } from "./db";
import { players, playerStats, news, ballonDorRankings } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerN8nWebhooks(app: Express) {
  // 1. Webhook - Extraction et mise à jour des statistiques joueurs (Scraping Statistiques)
  app.post("/api/webhooks/n8n/stats", async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: "Database not available" });
      const { player_name, goals, assists, matches, rating, season = "2025-2026", team } = req.body;

      if (!player_name) {
        return res.status(400).json({ error: "player_name is required" });
      }

      // Check if player exists
      let player = await db.query.players.findFirst({
        where: eq(players.name, player_name)
      });

      // Insert if not
      if (!player) {
         const [newPlayer] = await db.insert(players).values({
            name: player_name,
            team: team || "Unknown"
         }).returning();
         player = newPlayer;
      }

      // Upsert stats for this season
      const existingStat = await db.query.playerStats.findFirst({
         where: (ps) => eq(ps.playerId, player.id!) && eq(ps.season, season)
      });

      if (existingStat) {
          await db.update(playerStats).set({
             goals: goals || existingStat.goals,
             assists: assists || existingStat.assists,
             matches: matches || existingStat.matches,
             rating: rating || existingStat.rating,
             lastUpdated: new Date()
          }).where(eq(playerStats.id, existingStat.id));
      } else {
          await db.insert(playerStats).values({
             playerId: player.id,
             season,
             goals: goals || 0,
             assists: assists || 0,
             matches: matches || 0,
             rating: rating || 0
          });
      }

      res.status(200).json({ success: true, message: `Stats updated for ${player_name}` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to process n8n stats payload" });
    }
  });

  // 2. Webhook - Extraction et insertion d'actualités (Veille Actualités)
  app.post("/api/webhooks/n8n/news", async (req, res) => {
     try {
       if (!db) return res.status(500).json({ error: "Database not available" });
       const { title, summary, url, source, publishedAt } = req.body;

       if (!title || !url) {
         return res.status(400).json({ error: "title and url are required" });
       }

       // Upsert mechanism based on URL
       const existingNews = await db.query.news.findFirst({
         where: eq(news.url, url)
       });

       if (!existingNews) {
          await db.insert(news).values({
             title,
             summary,
             url,
             source,
             publishedAt: publishedAt ? new Date(publishedAt) : new Date()
          });
       }

       res.status(200).json({ success: true, message: `News indexed: ${title}` });
     } catch (e: any) {
       console.error(e);
       res.status(500).json({ error: "Failed to process n8n news payload" });
     }
  });

  // 3. Webhook - Mise à jour du classement Ballon d'Or
  app.post("/api/webhooks/n8n/ballon-dor", async (req, res) => {
     try {
        if (!db) return res.status(500).json({ error: "Database not available" });
        const { rankings, season, week } = req.body; // Expects an array: { player_name: "X", rank: 1, points: 95.5, metrics: {} }

        if (!rankings || !Array.isArray(rankings)) {
           return res.status(400).json({ error: "rankings payload array is required" });
        }

        // We clean up the old week's rankings safely
        // In this implementation, we simply append or upsert. Let's do a simple loop.
        for (const item of rankings) {
            let player = await db.query.players.findFirst({
               where: eq(players.name, item.player_name)
            });

            if (player) {
               await db.insert(ballonDorRankings).values({
                  playerId: player.id,
                  rank: item.rank,
                  points: item.points,
                  season: season || "2025-2026",
                  week: week || null,
                  metrics: item.metrics || {}
               });
            }
        }

        res.status(200).json({ success: true, message: "Ballon d'Or Ladder updated successfully" });
     } catch (e: any) {
       console.error(e);
       res.status(500).json({ error: "Failed to process n8n ballon-dor payload" });
     }
  });
}
