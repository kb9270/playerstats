import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scraper } from "./services/scraper";
import { pdfReportGenerator } from "./services/pdfReportGenerator";
import { soccerDataService } from "./services/soccerDataService";
import { enhancedSoccerDataService } from "./services/enhancedSoccerDataService";
import { enhancedReportService } from "./services/enhancedReportService";
import { aiService } from "./services/aiService";
import { csvPlayerAnalyzer } from "./services/csvPlayerAnalyzer";
import { csvDirectAnalyzer } from "./services/csvDirectAnalyzer";
import { csvMatchAnalyzer } from "./services/csvMatchAnalyzer";
import { pdfPlayerCard } from "./services/pdfPlayerCard";
import { heatmapService } from "./services/heatmapService";
import { comparisonService } from "./services/comparisonService";
import { insertPlayerSchema, insertComparisonSchema } from "@shared/schema";
import { z } from "zod";
import { espnImageService } from "./services/espnImageService";
import { espnScoreService } from "./services/espnScoreService";
import { fbRefService } from "./services/fbRefService";
import { registerN8nWebhooks } from "./n8nWebhooks";
import { memoryTeamOfTheWeek } from "./services/automationWorkflows";
import { sofaScoreService } from "./services/sofaScoreService";
import { optimizedTransfermarktApi } from "./services/optimizedTransfermarktApi";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register n8n Webhooks
  registerN8nWebhooks(app);

  // Initialize ESPN Image Service
  espnImageService.init().catch(err => console.error("ESPN init error:", err));

  // ── Live Matches via ESPN ───────────────────────────────────────────
  app.get("/api/live/matches", async (req, res) => {
    try {
      const matches = await espnScoreService.getTodayMatches();
      return res.json({ success: true, matches });
    } catch (error) {
      console.error("Live matches error:", error);
      res.status(500).json({ error: "Failed to fetch live matches" });
    }
  });

  // Search players endpoint
  app.get("/api/players/search", async (req, res) => {
    try {
      const q = req.query.q as string;

      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.json([]);
      }

      const query = q.trim();
      console.log(`[Search] Query: "${query}"`);

      // Use csvDirectAnalyzer - reads CSV directly in TypeScript (instant, no Python)
      const csvPlayers = await csvDirectAnalyzer.searchPlayers(query);
      console.log(`[Search] CSV Direct found: ${csvPlayers.length}`);

      // Map to the format expected by the frontend
      const players = csvPlayers
        .sort((a: any, b: any) => (b.Min || 0) - (a.Min || 0))
        .map((player: any) => ({
        id: player.Rk || Math.random(),
        name: player.Player,
        team: player.Squad,
        position: player.Pos,
        nationality: player.Nation,
        age: player.Age,
        league: player.Comp,
        fbrefId: player.Rk ? `csv-${player.Rk}` : undefined,
        logo: espnImageService.getTeamLogo(player.Squad),
        headshot: null // Instant search - don't blocks for headshot. Profile will load it.
      }));

      // Also search local storage (DB) to merge results
      const localPlayers = await storage.searchPlayers(query);
      console.log(`[Search] Local DB count: ${localPlayers?.length || 0}`);

      // Merge results avoiding exact duplicates by name
      localPlayers.forEach(p => {
        if (!players.find((m: any) => m.name?.toLowerCase() === p.name?.toLowerCase())) {
          players.push({
            ...p,
            logo: espnImageService.getTeamLogo(p.team || ''),
            headshot: null,
          });
        }
      });

      console.log(`[Search] Returning ${players.length} total results`);
      return res.json(players);

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get full player data by name from CSV + SofaScore Live + Transfermarkt
  app.get("/api/csv-direct/player/:name/full", async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name).trim();
      const allMatches = await csvDirectAnalyzer.searchPlayers(name);
      
      // Prioritize exact name match then player with most minutes played
      let csvPlayer = allMatches.find(p => p.Player.toLowerCase() === name.toLowerCase());
      if (!csvPlayer && allMatches.length > 0) {
        // Fuzzy search fallback: check for partial matches or reversed names
        csvPlayer = allMatches.sort((a, b) => (b.Min || 0) - (a.Min || 0))[0];
      }

      if (!csvPlayer) {
        // Last resort: search in the full database case-insensitively
        const fullDB = await csvDirectAnalyzer.getAllPlayers();
        csvPlayer = fullDB.find(p => p.Player.toLowerCase().includes(name.toLowerCase()));
      }

      if (!csvPlayer) {
        return res.status(404).json({ error: `Joueur "${name}" introuvable dans la base CSV` });
      }
      
      const team = (csvPlayer as any).Squad;
      
      // 1. Fetch from SofaScore (Live Rating & Recent Form)
      let sofaId = null;
      let sofaStats = null;
      let lastEvents = [];
      let sofaValue = 0;
      let physicalStats: any = {};

      try {
        const sofaResults = await sofaScoreService.searchPlayer(name);
        if (sofaResults.length > 0) {
          let sofaPlayer = sofaResults[0].entity;
          const match = sofaResults.find(r => 
             r.entity?.team?.name?.toLowerCase().includes(team.toLowerCase()) ||
             team.toLowerCase().includes(r.entity?.team?.name?.toLowerCase() || '---')
          );
          if (match) sofaPlayer = match.entity;
          sofaId = sofaPlayer.id;

          const details = await sofaScoreService.getPlayerDetails(sofaId);
          if (details) {
            physicalStats.height = details.height;
            physicalStats.foot = details.preferredFoot;
            if (details.marketValue) sofaValue = details.marketValue;
          }
          sofaStats = await (sofaScoreService as any).getPlayerStatistics(sofaId);
          lastEvents = await sofaScoreService.getPlayerLastEvents(sofaId);
        }
      } catch (err) { console.warn(`[Sofa] skip ${name}`); }

      // 2. Fetch from Transfermarkt (Fallback for Value)
      let tmValue = 0;
      if (sofaValue === 0) {
        try {
          const tmResults = await optimizedTransfermarktApi.searchByMultipleCriteria(name, team);
          if (tmResults.length > 0) {
            tmValue = tmResults[0].marketValue || 0;
            physicalStats.tmId = tmResults[0].id;
            physicalStats.height = physicalStats.height || tmResults[0].height;
            physicalStats.foot = physicalStats.foot || tmResults[0].foot;
          }
        } catch (err) { console.warn(`[TM] skip ${name}`); }
      }

      const finalValue = sofaValue || tmValue || 0;

      // 3. Similar Players
      const pos = (csvPlayer as any).Pos || '';
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const similar = allPlayers
        .filter((p: any) => {
          const pPos = String(p.Pos).replace(/\"/g, '');
          const targetPos = String(pos).replace(/\"/g, '');
          return pPos === targetPos && p.Player !== (csvPlayer as any).Player;
        })
        .sort((a: any, b: any) => (b.Gls || 0) - (a.Gls || 0))
        .slice(0, 6);

      // Final Aggregated Object
      const enrichedPlayer = {
        ...csvPlayer,
        marketValue: finalValue,
        sofaId,
        sofaStats,
        height: physicalStats.height,
        foot: physicalStats.foot,
        logo: espnImageService.getTeamLogo(team),
        headshot: await espnImageService.getPlayerHeadshot((csvPlayer as any).Player, team),
        recentForm: lastEvents.slice(0, 5).map((e: any) => ({
          rating: e.rating,
          date: e.startTimestamp,
          tournament: e.tournament?.name
        })),
        advancedStats: {
          progressiveCarries: Number((csvPlayer as any).PrgC) || 0,
          progressivePasses: Number((csvPlayer as any).PrgP) || 0,
          progressiveReceptions: Number((csvPlayer as any).PrgR) || 0,
          passCompletion: Number((csvPlayer as any)['Cmp%']) || 0,
          tackles: Number((csvPlayer as any).Tkl) || 0
        },
        scoutingRadar: (() => {
           const rp = String((csvPlayer as any).Pos || 'M').toUpperCase().replace(/\"/g, '');
           const s: any[] = [];
           const g = Number((csvPlayer as any).Gls)||0;
           const a = Number((csvPlayer as any).Ast)||0;
           const sh = Number((csvPlayer as any).Sh)||0;
           const xg = Number((csvPlayer as any).xG)||0;
           const xa = Number((csvPlayer as any).xAG)||0;

           if (rp.includes('FW') || rp.includes('A') || rp.includes('F') || rp.includes('W')) {
             s.push({ label: 'BUTS SANS PÉNALITÉ', percentile: Math.min(99, 65 + g*5) });
             s.push({ label: 'BUTS ATTENDUS (xG)', percentile: Math.min(99, 50 + xg*100) });
             s.push({ label: 'TOTAL TIRS', percentile: Math.min(99, 70 + sh*2) });
             s.push({ label: 'TIRS CADRÉS', percentile: Math.min(99, 75 + (Number((csvPlayer as any).SoT)||0)*3) });
             s.push({ label: 'BUTS PAR TIR', percentile: Math.min(99, 60 + (g/(sh||1))*100) });
             s.push({ label: 'PASSES DÉCISIVES', percentile: Math.min(99, 50 + a*10) });
             s.push({ label: 'PASSES DÉCISIVES ATT. (xA)', percentile: Math.min(99, 45 + xa*120) });
             s.push({ label: 'ACTIONS CRÉATION TIRS', percentile: Math.min(99, 42 + g*8 + a*12) });
             s.push({ label: 'ACTIONS CRÉATION BUTS', percentile: Math.min(99, 38 + g*12 + a*18) });
             s.push({ label: 'RÉCEPTIONS PROGRESSIVES', percentile: 86 });
             s.push({ label: 'DRIBBLES RÉUSSIS', percentile: 74 });
             s.push({ label: 'BALLONS (SURFACE ADVERSA.)', percentile: 91 });
             s.push({ label: 'DUELS AÉRIENS GAGNÉS', percentile: 68 });
           } else if (rp.includes('M')) {
             s.push({ label: 'PASSES PROGRESSIVES', percentile: 88 });
             s.push({ label: 'PORTÉES DE BALLE PROG.', percentile: 82 });
             s.push({ label: 'PRÉCISION DRIBLES', percentile: 76 });
             s.push({ label: 'INTERCEPTIONS', percentile: 71 });
             s.push({ label: 'TACLES RÉUSSIS', percentile: 65 });
             s.push({ label: 'BLOCS DÉFENSIFS', percentile: 74 });
             s.push({ label: 'PASSES DÉCISIVES', percentile: 78 });
             s.push({ label: 'PASSES CLÉS', percentile: 89 });
             s.push({ label: 'PASSES VERS TIERS FINAL', percentile: 94 });
             s.push({ label: 'BALLONS RÉCUPÉRÉS', percentile: 83 });
             s.push({ label: 'RÉUSSITE PASSES (%)', percentile: 89 });
             s.push({ label: 'PASSES EN PROFONDEUR', percentile: 81 });
             s.push({ label: 'COSMOS POSITIONNEL', percentile: 79 });
           } else {
             s.push({ label: 'TACLES', percentile: 88 });
             s.push({ label: 'INTERCEPTIONS', percentile: 92 });
             s.push({ label: 'DUELS AÉRIENS GAGNÉS (%)', percentile: 96 });
             s.push({ label: 'DÉGAGEMENTS', percentile: 89 });
             s.push({ label: 'BLOCS DE TIRS', percentile: 84 });
             s.push({ label: 'BALLONS RÉCUPÉRÉS', percentile: 81 });
             s.push({ label: 'PASSES PROGRESSIVES', percentile: 72 });
             s.push({ label: 'PRÉCISION PASSES LONGUES', percentile: 78 });
             s.push({ label: 'DUELS DÉFENSIFS GAGNÉS', percentile: 91 });
             s.push({ label: 'RECOUVREMENT POSITIONNEL', percentile: 86 });
             s.push({ label: 'FAUTES COMMISES (MIN)', percentile: 74 });
             s.push({ label: 'PROGRESSION DE BALLE', percentile: 65 });
             s.push({ label: 'ANTICIPATION TACTIQUE', percentile: 93 });
           }
           return s;
        })()
      };

      const enrichedSimilar = await Promise.all(similar.map(async (p: any) => ({
        ...p,
        logo: espnImageService.getTeamLogo(p.Squad),
        headshot: await espnImageService.getPlayerHeadshot(p.Player, p.Squad)
      })));

      return res.json({ player: enrichedPlayer, similar: enrichedSimilar });
    } catch (error) {
      console.error('Full player data error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── Live Standings via ESPN public API ────────────────────────────────
  const ESPNLEAGUES: Record<string, string> = {
    "eng Premier League": "eng.1",
    "es La Liga":         "esp.1",
    "fr Ligue 1":        "fra.1",
    "it Serie A":        "ita.1",
    "de Bundesliga":     "ger.1",
    "nl Eredivisie":     "ned.1",
    "pt Primeira Liga":  "por.1",
  };

  // Simple in-process cache: { key -> { data, ts } }
  const standingsCache: Record<string, { data: any; ts: number }> = {};
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  app.get("/api/standings/:league", async (req, res) => {
    try {
      const leagueName = decodeURIComponent(req.params.league);
      const espnCode = ESPNLEAGUES[leagueName];
      if (!espnCode) {
        return res.status(404).json({ error: `No standings available for "${leagueName}"` });
      }

      const cached = standingsCache[espnCode];
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return res.json(cached.data);
      }

      const url = `https://site.api.espn.com/apis/v2/sports/soccer/${espnCode}/standings`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 PlayerStats/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return res.status(502).json({ error: `ESPN API error: ${response.status}` });
      }

      const espnData = await response.json();

      // Parse ESPN standings format
      const standings: any[] = [];
      const groups = espnData?.children?.[0]?.standings?.entries || espnData?.standings?.entries || [];

      for (const entry of groups) {
        const team = entry.team;
        const stats: Record<string, any> = {};
        for (const s of (entry.stats || [])) {
          stats[s.name] = s.value;
        }
        standings.push({
          rank:         stats.rank        ?? standings.length + 1,
          team:         team?.displayName ?? team?.name ?? "?",
          abbr:         team?.abbreviation ?? "",
          logo:         team?.logos?.[0]?.href ?? null,
          played:       stats.gamesPlayed  ?? 0,
          wins:         stats.wins         ?? 0,
          draws:        stats.ties         ?? stats.draws ?? 0,
          losses:       stats.losses       ?? 0,
          goalsFor:     stats.pointsFor    ?? 0,
          goalsAgainst: stats.pointsAgainst ?? 0,
          goalDiff:     stats.pointDifferential ?? 0,
          points:       stats.points       ?? 0,
          form:         (entry.note?.description ?? "").trim(),
        });
      }

      standings.sort((a, b) => a.rank - b.rank);
      const result = { leagueName, espnCode, standings };
      standingsCache[espnCode] = { data: result, ts: Date.now() };
      return res.json(result);
    } catch (error: any) {
      console.error("Standings fetch error:", error.message);
      res.status(500).json({ error: "Could not fetch standings" });
    }
  });

  // ── CSV Leagues ────────────────────────────────────────────────────────
  app.get("/api/csv/leagues", async (req, res) => {
    try {
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const leagueMap: Record<string, { players: any[] }> = {};

      for (const p of allPlayers) {
        const comp = (p as any).Comp || "Unknown";
        if (!leagueMap[comp]) leagueMap[comp] = { players: [] };
        leagueMap[comp].players.push(p);
      }

      const leagues = Object.entries(leagueMap).map(([comp, { players }]) => {
        const teams = [...new Set(players.map((p: any) => p.Squad).filter(Boolean))];
        const ages = players.map((p: any) => Number(p.Age)).filter(a => !isNaN(a) && a > 0);
        const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
        const topScorer = players.reduce((best: any, p: any) => 
          (Number(p.Gls) || 0) > (Number(best?.Gls) || 0) ? p : best, players[0]);
        const topAssist = players.reduce((best: any, p: any) => 
          (Number(p.Ast) || 0) > (Number(best?.Ast) || 0) ? p : best, players[0]);
        const totalGoals = players.reduce((s, p: any) => s + (Number(p.Gls) || 0), 0);
        return {
          name: comp,
          totalPlayers: players.length,
          totalTeams: teams.length,
          avgAge: Math.round(avgAge * 10) / 10,
          totalGoals,
          topScorer: topScorer ? { name: (topScorer as any).Player, goals: Number((topScorer as any).Gls) || 0, team: (topScorer as any).Squad } : null,
          topAssist: topAssist ? { name: (topAssist as any).Player, assists: Number((topAssist as any).Ast) || 0, team: (topAssist as any).Squad } : null,
        };
      });

      // Enrich leagues with top scorer/assist logos (fast because logos are cached at init)
      const enrichedLeagues = leagues.map((l: any) => {
        if (l.topScorer) {
          l.topScorer.logo = espnImageService.getTeamLogo(l.topScorer.team);
          // Don't wait for headshots here to keep it fast
        }
        if (l.topAssist) {
          l.topAssist.logo = espnImageService.getTeamLogo(l.topAssist.team);
        }
        return l;
      });

      return res.json(enrichedLeagues);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── CSV League Players ─────────────────────────────────────────────────
  app.get("/api/csv/leagues/:name/players", async (req, res) => {
    try {
      const leagueName = decodeURIComponent(req.params.name);
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const players = allPlayers.filter((p: any) => p.Comp === leagueName);
      
      const enrichedPlayers = await Promise.all(players.map(async (p: any) => ({
        ...p,
        logo: espnImageService.getTeamLogo(p.Squad),
        headshot: await espnImageService.getPlayerHeadshot(p.Player, p.Squad)
      })));

      return res.json(enrichedPlayers);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── CSV Teams ──────────────────────────────────────────────────────────
  app.get("/api/csv/teams", async (req, res) => {
    try {
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const league = req.query.league as string | undefined;
      const filtered = league ? allPlayers.filter((p: any) => p.Comp === league) : allPlayers;

      const teamMap: Record<string, { players: any[]; comp: string }> = {};
      for (const p of filtered) {
        const squad = (p as any).Squad || "Unknown";
        const comp = (p as any).Comp || "";
        if (!teamMap[squad]) teamMap[squad] = { players: [], comp };
        teamMap[squad].players.push(p);
      }

      const teams = Object.entries(teamMap).map(([squad, { players, comp }]) => {
        const ages = players.map((p: any) => Number(p.Age)).filter(a => !isNaN(a) && a > 0);
        const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
        const totalGoals = players.reduce((s, p: any) => s + (Number(p.Gls) || 0), 0);
        const totalAssists = players.reduce((s, p: any) => s + (Number(p.Ast) || 0), 0);
        const topScorer = players.reduce((best: any, p: any) =>
          (Number(p.Gls) || 0) > (Number(best?.Gls) || 0) ? p : best, players[0]);
        return {
          name: squad,
          league: comp,
          playerCount: players.length,
          avgAge: Math.round(avgAge * 10) / 10,
          totalGoals,
          totalAssists,
          topScorer: topScorer ? { name: (topScorer as any).Player, goals: Number((topScorer as any).Gls) || 0 } : null,
        };
      });

      const enrichedTeams = teams.map((t: any) => ({
        ...t,
        logo: espnImageService.getTeamLogo(t.name)
      }));

      enrichedTeams.sort((a, b) => b.totalGoals - a.totalGoals);
      return res.json(enrichedTeams);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── CSV Team Players ───────────────────────────────────────────────────
  app.get("/api/csv/teams/:name/players", async (req, res) => {
    try {
      const teamName = decodeURIComponent(req.params.name);
      const players = await csvDirectAnalyzer.getPlayersByTeam(teamName);
      
      const enrichedPlayers = await Promise.all(players.map(async (p: any) => ({
        ...p,
        logo: espnImageService.getTeamLogo(p.Squad),
        headshot: await espnImageService.getPlayerHeadshot(p.Player, p.Squad)
      })));

      return res.json(enrichedPlayers);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get News
  app.get("/api/news", async (req, res) => {
    try {
      const { memoryNews } = await import("./services/automationWorkflows");
      
      if (!process.env.DATABASE_URL) {
        return res.json({ success: true, news: memoryNews });
      }
      
      const { db } = await import("./db");
      if (!db) {
        return res.json({ success: true, news: memoryNews });
      }
      
      const schema = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      
      const recentNews = await db.query.news.findMany({
        orderBy: [desc(schema.news.publishedAt)],
        limit: 10
      });
      
      // Merge: Live Memory News + DB News (deduplicated by title)
      const allNewsMap = new Map();
      recentNews.forEach((n: any) => allNewsMap.set(n.title, n));
      memoryNews.forEach((n: any) => allNewsMap.set(n.title, n));
      
      const combinedNews = Array.from(allNewsMap.values())
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 15);

      res.json({ success: true, news: combinedNews });
    } catch (error) {
      console.error('Error getting news:', error);
      res.status(500).json({ error: "Failed to get news" });
    }
  });

  // Get Ballon d'Or Rankings
  app.get("/api/ballon-dor", async (req, res) => {
    try {
      const { memoryBallonDor } = await import("./services/automationWorkflows");
      
      // Force direct live data for Season 2026 (Unlinked from potentially old DB)
      if (memoryBallonDor.length > 0) {
        return res.json({ success: true, rankings: memoryBallonDor });
      }

      const { db } = await import("./db");
      if (!db) return res.json({ success: true, rankings: memoryBallonDor });

      const { ballonDorRankings, players } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const rankings = await db.select({
        rank: ballonDorRankings.rank,
        points: ballonDorRankings.points,
        season: ballonDorRankings.season,
        metrics: ballonDorRankings.metrics,
        playerName: players.name,
        team: players.team,
      })
      .from(ballonDorRankings)
      .innerJoin(players, eq(ballonDorRankings.playerId, players.id))
      .orderBy(ballonDorRankings.rank)
      .limit(10);

      res.json({ success: true, rankings });
    } catch (error) {
       res.status(500).json({ error: "Failed to get rankings" });
    }
  });

  // Get Live Top Players (Saison 2026) - Team of the Week (11 players)
  app.get("/api/live/top-players", async (req, res) => {
    res.json({ success: true, players: memoryTeamOfTheWeek || [] });
  });

  // Debug Route to trigger TOTW
  app.get("/api/dev/trigger-totw", async (req, res) => {
    try {
      const { automationWorkflows } = await import("./services/automationWorkflows");
      await (automationWorkflows as any).workflowTeamOfTheWeek();
      res.json({ success: true, message: "TOTW triggered with SofaScore" });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as any).message });
    }
  });

  // Debug Route to trigger Ballon d'Or
  app.get("/api/dev/trigger-ballondor", async (req, res) => {
    try {
      const { automationWorkflows } = await import("./services/automationWorkflows");
      await (automationWorkflows as any).workflowBallonDorLadder();
      res.json({ success: true, message: "Ballon d'Or ladder triggered" });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as any).message });
    }
  });

  // Get player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      res.json(player);
    } catch (error) {
      console.error('Get player error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get player stats
  app.get("/api/players/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { season } = req.query;

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const stats = await storage.getPlayerStats(id, season as string);
      res.json(stats);
    } catch (error) {
      console.error('Get player stats error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get scouting report
  app.get("/api/players/:id/scouting", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { season = '2024-2025' } = req.query;

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const report = await storage.getScoutingReport(id, season as string);

      if (!report) {
        // Try to generate scouting report by updating player data
        try {
          await scraper.updatePlayerData(id);
          const newReport = await storage.getScoutingReport(id, season as string);
          return res.json(newReport);
        } catch (updateError) {
          return res.status(404).json({ error: "Scouting report not available" });
        }
      }

      res.json(report);
    } catch (error) {
      console.error('Get scouting report error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create comparison
  app.post("/api/comparisons", async (req, res) => {
    try {
      const validatedData = insertComparisonSchema.parse(req.body);
      const comparison = await storage.createComparison(validatedData);
      res.json(comparison);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Create comparison error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get comparison data
  app.get("/api/comparisons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid comparison ID" });
      }

      const comparison = await storage.getComparison(id);
      if (!comparison) {
        return res.status(404).json({ error: "Comparison not found" });
      }

      // Get player data for comparison
      const playerIds = comparison.playerIds as number[];
      const players = await Promise.all(
        playerIds.map(async (playerId) => {
          const player = await storage.getPlayer(playerId);
          const stats = await storage.getPlayerStatsBySeason(playerId, comparison.season, comparison.competition || undefined);
          return { player, stats };
        })
      );

      res.json({
        ...comparison,
        players: players.filter(p => p.player) // Filter out null players
      });
    } catch (error) {
      console.error('Get comparison error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update player data (refresh from external sources)
  app.post("/api/players/:id/update", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      console.log(`Updating player data for ID: ${id}`);
      await scraper.updatePlayerData(id);

      const updatedPlayer = await storage.getPlayer(id);
      res.json(updatedPlayer);
    } catch (error) {
      console.error('Update player error:', error);
      res.status(500).json({ error: error.message || "Failed to update player data" });
    }
  });

  // Force comprehensive analysis refresh using enhanced soccerdata
  app.post("/api/players/:id/refresh-precise", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      console.log(`Force refreshing comprehensive data for: ${player.name}`);

      // Ensure Python scripts exist
      await enhancedSoccerDataService.ensurePythonScriptExists();

      // Get comprehensive analysis
      const comprehensiveAnalysis = await enhancedSoccerDataService.getComprehensivePlayerAnalysis(
        player.name,
        player.team,
        player.league
      );

      let hasStats = false;
      let hasReport = false;

      if (comprehensiveAnalysis && comprehensiveAnalysis.success) {
        console.log(`✓ Got comprehensive analysis for ${player.name}`);

        // Store comprehensive stats
        const keyStats = comprehensiveAnalysis.key_stats;
        if (keyStats) {
          await storage.createPlayerStats({
            playerId: id,
            season: '2024-2025',
            competition: 'Comprehensive Analysis',
            goals: keyStats.goals,
            assists: keyStats.assists,
            shots: keyStats.shots,
            shotsOnTarget: keyStats.shots_on_target,
            passes: keyStats.pass_completion,
            tackles: keyStats.tackles,
            interceptions: keyStats.interceptions,
            rating: comprehensiveAnalysis.current_form?.rating || 7.0,
            source: 'enhanced_soccerdata'
          });
          hasStats = true;
        }

        // Create enhanced scouting report
        if (comprehensiveAnalysis.percentiles && player.position) {
          await storage.createScoutingReport({
            playerId: id,
            season: '2024-2025',
            competition: 'Comprehensive Analysis',
            position: player.position,
            percentiles: comprehensiveAnalysis.percentiles,
            strengths: comprehensiveAnalysis.strengths || [],
            weaknesses: comprehensiveAnalysis.weaknesses || [],
            overallRating: Math.round(Object.values(comprehensiveAnalysis.percentiles).reduce((a: number, b: number) => a + b, 0) / Object.keys(comprehensiveAnalysis.percentiles).length)
          });
          hasReport = true;
        }

        res.json({ 
          success: true, 
          hasStats, 
          hasReport,
          source: 'enhanced_soccerdata',
          analysis: comprehensiveAnalysis,
          message: `Successfully refreshed comprehensive data for ${player.name}`
        });
      } else {
        res.status(404).json({ error: "Could not find comprehensive data for this player" });
      }
    } catch (error) {
      console.error('Refresh comprehensive data error:', error);
      res.status(500).json({ error: error.message || "Failed to refresh comprehensive data" });
    }
  });

  // Generate PDF scouting report
  app.get("/api/players/:id/report/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      console.log(`Generating PDF report for: ${player.name}`);

      // Get player stats and scouting report
      const stats = await storage.getPlayerStats(id);
      const scoutingReport = await storage.getScoutingReport(id, '2024-2025');

      if (!scoutingReport) {
        console.log(`No scouting report found for ${player.name}, creating basic report`);

        // Create basic scouting report if none exists
        const basicReport = {
          position: player.position || 'Unknown',
          season: '2024-2025',
          percentiles: {
            overall_performance: 70,
            technical_skills: 65,
            physical_attributes: 75,
            mental_strength: 80
          },
          strengths: ['Consistent Performance', 'Good Work Rate'],
          weaknesses: ['Needs More Data'],
          overallRating: 70
        };

        const pdfBuffer = await pdfReportGenerator.generateScoutingReport(player, stats, basicReport);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-${player.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');

        res.send(pdfBuffer);
        return;
      }

      // Generate PDF with full data
      const pdfBuffer = await pdfReportGenerator.generateScoutingReport(player, stats, scoutingReport);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="rapport-${player.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      console.log(`PDF sent successfully for ${player.name}`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate PDF report",
        details: error.message 
      });
    }
  });

  // Get comprehensive player analysis
  app.get("/api/players/:id/comprehensive-analysis", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      console.log(`Getting comprehensive analysis for: ${player.name}`);

      await enhancedSoccerDataService.ensurePythonScriptExists();

      const analysis = await enhancedSoccerDataService.getComprehensivePlayerAnalysis(
        player.name,
        player.team,
        player.league
      );

      if (analysis && analysis.success) {
        res.json(analysis);
      } else {
        res.status(404).json({ error: "Comprehensive analysis not available" });
      }
    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      res.status(500).json({ error: "Failed to get comprehensive analysis" });
    }
  });

  // Get team analysis
  app.get("/api/teams/:teamName/analysis", async (req, res) => {
    try {
      const teamName = req.params.teamName;
      const league = req.query.league as string;

      console.log(`Getting team analysis for: ${teamName}`);

      await enhancedSoccerDataService.ensurePythonScriptExists();

      const analysis = await enhancedSoccerDataService.getTeamAnalysis(teamName, league);

      if (analysis && analysis.success) {
        res.json(analysis);
      } else {
        res.status(404).json({ error: "Team analysis not available" });
      }
    } catch (error) {
      console.error('Error getting team analysis:', error);
      res.status(500).json({ error: "Failed to get team analysis" });
    }
  });

  // Get position comparison
  app.get("/api/players/:id/position-comparison", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player || !player.position) {
        return res.status(404).json({ error: "Player or position not found" });
      }

      console.log(`Getting position comparison for: ${player.name} (${player.position})`);

      await enhancedSoccerDataService.ensurePythonScriptExists();

      const comparison = await enhancedSoccerDataService.getPlayerComparison(
        player.name,
        player.position,
        player.league
      );

      if (comparison && comparison.success) {
        res.json(comparison);
      } else {
        res.status(404).json({ error: "Position comparison not available" });
      }
    } catch (error) {
      console.error('Error getting position comparison:', error);
      res.status(500).json({ error: "Failed to get position comparison" });
    }
  });

  // Enhanced player report with rate limiting
  app.get("/api/players/:id/enhanced-report", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      console.log(`Generating enhanced report for: ${player.name} with rate limiting protection`);

      // Generate complete report with enhanced rate limiting
      const report = await enhancedReportService.generateCompletePlayerReport(
        player.name,
        player.team,
        2024
      );

      if (report && report.success) {
        res.json(report);
      } else {
        res.status(500).json({ 
          error: "Failed to generate enhanced report",
          details: report?.error || "Unknown error"
        });
      }
    } catch (error) {
      console.error('Error generating enhanced report:', error);
      res.status(500).json({ error: "Failed to generate enhanced report" });
    }
  });

  // Generate enhanced PDF with Flask-style endpoint
  app.post("/api/joueur/rapport", async (req, res) => {
    try {
      const { nom } = req.body;

      if (!nom) {
        return res.status(400).json({ 
          status: "error", 
          message: "Nom du joueur requis" 
        });
      }

      console.log(`Generating Flask-style report for: ${nom}`);

      // Search for player first
      const players = await storage.searchPlayers(nom);
      let player = players.length > 0 ? players[0] : null;

      if (!player) {
        // Try to create player if not found
        try {
          await scraper.scrapeAndStorePlayer(nom);
          const newPlayers = await storage.searchPlayers(nom);
          player = newPlayers.length > 0 ? newPlayers[0] : null;
        } catch (error) {
          console.log('Could not create player:', error);
        }
      }

      if (!player) {
        return res.status(404).json({
          status: "error",
          message: `Aucune donnée trouvée pour ${nom}`
        });
      }

      // Generate enhanced report
      const report = await enhancedReportService.generateCompletePlayerReport(
        player.name,
        player.team
      );

      if (report && report.success) {
        // Generate PDF with enhanced data
        const stats = await storage.getPlayerStats(player.id);
        const scoutingReport = await storage.getScoutingReport(player.id, '2024-2025');

        const pdfBuffer = await pdfReportGenerator.generateScoutingReport(
          player, 
          stats, 
          scoutingReport || report
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-${player.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
        res.send(pdfBuffer);
      } else {
        res.status(404).json({
          status: "error",
          message: "Impossible de générer le rapport"
        });
      }
    } catch (error) {
      console.error('Error in Flask-style report generation:', error);
      res.status(500).json({
        status: "error",
        message: error.message || "Erreur lors de la génération du rapport"
      });
    }
  });

  // === NOUVELLES ROUTES POUR L'ANALYSE CSV ===

  // Rechercher un joueur dans la base CSV
  app.get("/api/csv/players/search", async (req, res) => {
    try {
      const { q, team } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      console.log(`Searching CSV player: ${q}${team ? ` in team ${team}` : ''}`);

      const result = await csvPlayerAnalyzer.searchPlayer(q, team as string);

      if (result.found) {
        res.json({ success: true, player: result.player });
      } else {
        res.status(404).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('CSV search error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Obtenir le profil complet d'un joueur CSV
  app.get("/api/csv/players/profile/:playerName", async (req, res) => {
    try {
      const playerName = decodeURIComponent(req.params.playerName);
      const team = req.query.team as string;

      console.log(`Getting CSV player profile: ${playerName}${team ? ` in team ${team}` : ''}`);

      const profile = await csvPlayerAnalyzer.getCompletePlayerProfile(playerName, team);

      if (profile.error) {
        res.status(404).json({ error: profile.error });
      } else {
        res.json({ success: true, profile });
      }
    } catch (error) {
      console.error('CSV profile error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Générer la heatmap d'un joueur
  app.get("/api/csv/players/:playerName/heatmap", async (req, res) => {
    try {
      const playerName = decodeURIComponent(req.params.playerName);

      console.log(`Generating heatmap for CSV player: ${playerName}`);

      const heatmapData = await csvPlayerAnalyzer.generateHeatmap(playerName);

      if (heatmapData.error) {
        res.status(404).json({ error: heatmapData.error });
      } else {
        res.json({ success: true, heatmap: heatmapData.heatmap });
      }
    } catch (error) {
      console.error('CSV heatmap error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Obtenir la liste des joueurs disponibles
  app.get("/api/csv/players/list", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;

      console.log(`Getting CSV players list (limit: ${limit})`);

      const players = await csvPlayerAnalyzer.getAvailablePlayersList(limit);

      res.json({ success: true, players, count: players.length });
    } catch (error) {
      console.error('CSV players list error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Obtenir les joueurs d'une équipe
  app.get("/api/csv/teams/:teamName/players", async (req, res) => {
    try {
      const teamName = decodeURIComponent(req.params.teamName);

      console.log(`Getting CSV team players: ${teamName}`);

      const players = await csvPlayerAnalyzer.getPlayersByTeam(teamName);

      res.json({ success: true, team: teamName, players, count: players.length });
    } catch (error) {
      console.error('CSV team players error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Obtenir les statistiques des ligues
  app.get("/api/csv/leagues/stats", async (req, res) => {
    try {
      console.log('Getting CSV league stats');

      const leagueStats = await csvPlayerAnalyzer.getLeagueStats();

      res.json({ success: true, leagues: leagueStats });
    } catch (error) {
      console.error('CSV league stats error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint Flask-style pour génération de rapport complet CSV
  app.post("/api/csv/joueur/rapport-complet", async (req, res) => {
    try {
      const { nom, equipe } = req.body;

      if (!nom) {
        return res.status(400).json({ 
          status: "error", 
          message: "Nom du joueur requis" 
        });
      }

      console.log(`Generating complete CSV report for: ${nom}${equipe ? ` in team ${equipe}` : ''}`);

      const profile = await csvPlayerAnalyzer.getCompletePlayerProfile(nom, equipe);

      if (profile.error) {
        res.status(404).json({
          status: "error",
          message: profile.error
        });
      } else {
        res.json({
          status: "success",
          joueur: profile.informations_personnelles,
          statistiques: {
            base: profile.statistiques_base,
            avancees: profile.statistiques_avancees
          },
          analyse: profile.analyse_performance,
          percentiles: profile.percentiles,
          zones_activite: profile.zones_activite,
          note_globale: profile.note_globale,
          style_jeu: profile.style_jeu,
          forces: profile.forces,
          faiblesses: profile.faiblesses
        });
      }
    } catch (error) {
      console.error('Error in CSV complete report generation:', error);
      res.status(500).json({
        status: "error",
        message: error.message || "Erreur lors de la génération du rapport"
      });
    }
  });

  // ====== NOUVELLES ROUTES CSV DIRECTES ======

  // Route pour chercher des joueurs directement dans le CSV
  app.get("/api/csv-direct/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).json({ error: 'Query parameter required and must not be empty' });
      }

      const players = await csvDirectAnalyzer.searchPlayers(q.trim());
      res.json({ success: true, players });
    } catch (error) {
      console.error('Error searching players:', error);
      res.status(500).json({ error: 'Error searching players' });
    }
  });

  // Route pour obtenir l'analyse complète d'un joueur
  app.get("/api/csv-direct/player/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      const analysis = csvDirectAnalyzer.generatePlayerAnalysis(player);
      res.json({ success: true, player, analysis });
    } catch (error) {
      console.error('Error getting player analysis:', error);
      res.status(500).json({ error: 'Error getting player analysis' });
    }
  });

  // Route pour l'analyse d'un joueur (endpoint spécifique)
  app.get("/api/csv-direct/player/:name/analysis", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }

      const analysis = csvDirectAnalyzer.generatePlayerAnalysis(player);
      res.json({ success: true, player, analysis });
    } catch (error) {
      console.error('Error getting player analysis:', error);
      res.status(500).json({ success: false, error: 'Error getting player analysis' });
    }
  });

  // Route pour la heatmap d'un joueur
  app.get("/api/csv-direct/player/:name/heatmap", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }

      const heatmap = heatmapService.generateHeatmap(player);
      const defensiveZones = heatmapService.generateDefensiveZones(player);
      const offensiveZones = heatmapService.generateOffensiveZones(player);

      res.json({ 
        success: true, 
        player: { name: player.Player, position: player.Pos },
        heatmap: {
          general: heatmap,
          defensive: defensiveZones,
          offensive: offensiveZones
        }
      });
    } catch (error) {
      console.error('Error generating heatmap:', error);
      res.status(500).json({ success: false, error: 'Error generating heatmap' });
    }
  });

  // Route pour la pass map d'un joueur
  app.get("/api/csv-direct/player/:name/passmap", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }

      const passMap = heatmapService.generatePassMap(player);

      res.json({ 
        success: true, 
        player: { name: player.Player, position: player.Pos },
        passMap,
        stats: {
          totalPasses: player.Att || 0,
          completedPasses: player.Cmp || 0,
          successRate: player['Cmp%'] || 0,
          progressivePasses: player.PrgP || 0
        }
      });
    } catch (error) {
      console.error('Error generating pass map:', error);
      res.status(500).json({ success: false, error: 'Error generating pass map' });
    }
  });

  // Route pour la valeur marchande d'un joueur
  app.get("/api/csv-direct/player/:name/market-value", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }

      const marketValue = comparisonService.calculateMarketValue(player);
      const formattedValue = comparisonService.formatMarketValue(marketValue);

      res.json({ 
        success: true, 
        player: { 
          name: player.Player, 
          age: player.Age, 
          position: player.Pos, 
          team: player.Squad,
          league: player.Comp 
        },
        marketValue: {
          ...marketValue,
          formatted: formattedValue
        }
      });
    } catch (error) {
      console.error('Error calculating market value:', error);
      res.status(500).json({ success: false, error: 'Error calculating market value' });
    }
  });

  // Route pour comparer deux joueurs
  app.get("/api/csv-direct/compare/:player1Name/:player2Name", async (req, res) => {
    try {
      const { player1Name, player2Name } = req.params;

      const player1 = await csvDirectAnalyzer.getPlayerByName(player1Name);
      const player2 = await csvDirectAnalyzer.getPlayerByName(player2Name);

      if (!player1) {
        return res.status(404).json({ success: false, error: `Player "${player1Name}" not found` });
      }

      if (!player2) {
        return res.status(404).json({ success: false, error: `Player "${player2Name}" not found` });
      }

      const comparison = comparisonService.comparePlayer(player1, player2);

      // Ajouter les valeurs marchandes
      const player1MarketValue = comparisonService.calculateMarketValue(player1);
      const player2MarketValue = comparisonService.calculateMarketValue(player2);

      res.json({ 
        success: true,
        comparison: {
          ...comparison,
          marketValues: {
            player1: {
              ...player1MarketValue,
              formatted: comparisonService.formatMarketValue(player1MarketValue)
            },
            player2: {
              ...player2MarketValue,
              formatted: comparisonService.formatMarketValue(player2MarketValue)
            }
          }
        }
      });
    } catch (error) {
      console.error('Error comparing players:', error);
      res.status(500).json({ success: false, error: 'Error comparing players' });
    }
  });

  // CSV Direct routes
  app.get('/api/csv-direct/leagues', async (req, res) => {
    try {
      const stats = await csvDirectAnalyzer.getLeagueStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting league stats:', error);
      res.status(500).json({ success: false, error: 'Failed to get league stats' });
    }
  });

  app.get('/api/csv-direct/similar/:name', async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name).toLowerCase();
      const k = parseInt(req.query.k as string) || 3;
      const target = await csvDirectAnalyzer.getPlayerByName(name);

      if (!target) {
        return res.status(404).json({ success: false, error: 'Joueur introuvable' });
      }

      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const { PlayerSimilarityService } = await import('./services/playerSimilarityService');
      const similar = PlayerSimilarityService.getSimilarPlayersV2(target, allPlayers, k);

      res.json({ 
        success: true, 
        target, 
        similar,
        count: similar.length 
      });
    } catch (error) {
      console.error('Error finding similar players:', error);
      res.status(500).json({ success: false, error: 'Failed to find similar players' });
    }
  });

  // Route pour la comparaison automatique avec les 3 joueurs les plus similaires
  app.get('/api/csv-direct/player/:name/auto-compare', async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name);
      const targetPlayer = await csvDirectAnalyzer.getPlayerByName(name);

      if (!targetPlayer) {
        return res.status(404).json({ success: false, error: 'Joueur introuvable' });
      }

      // Trouver les 3 joueurs les plus similaires
      const allPlayers = await csvDirectAnalyzer.getAllPlayers();
      const { PlayerSimilarityService } = await import('./services/playerSimilarityService');
      const similarPlayers = PlayerSimilarityService.getSimilarPlayersV2(targetPlayer, allPlayers, 3);
      
      if (similarPlayers.length === 0) {
        return res.json({ 
          success: true, 
          targetPlayer: {
            name: targetPlayer.Player,
            age: targetPlayer.Age,
            position: targetPlayer.Pos,
            team: targetPlayer.Squad,
            league: targetPlayer.Comp
          },
          comparisons: [],
          message: 'Aucun joueur similaire trouvé'
        });
      }

      // Comparer avec chaque joueur similaire
      const comparisons = similarPlayers.map(similarPlayer => {
        const comparison = comparisonService.comparePlayer(targetPlayer, similarPlayer);
        const targetMarketValue = comparisonService.calculateMarketValue(targetPlayer);
        const similarMarketValue = comparisonService.calculateMarketValue(similarPlayer);
        
        return {
          targetPlayer: {
            name: targetPlayer.Player,
            age: targetPlayer.Age,
            position: targetPlayer.Pos,
            team: targetPlayer.Squad,
            league: targetPlayer.Comp,
            marketValue: comparisonService.formatMarketValue(targetMarketValue)
          },
          similarPlayer: {
            name: similarPlayer.Player,
            age: similarPlayer.Age,
            position: similarPlayer.Pos,
            team: similarPlayer.Squad,
            league: similarPlayer.Comp,
            marketValue: comparisonService.formatMarketValue(similarMarketValue),
            similarity: (similarPlayer as any).similarity || 0.5
          },
          metrics: comparison.metrics,
          summary: comparison.summary,
          marketValues: {
            target: {
              ...targetMarketValue,
              formatted: comparisonService.formatMarketValue(targetMarketValue)
            },
            similar: {
              ...similarMarketValue,
              formatted: comparisonService.formatMarketValue(similarMarketValue)
            }
          }
        };
      });

      res.json({ 
        success: true,
        targetPlayer: {
          name: targetPlayer.Player,
          age: targetPlayer.Age,
          position: targetPlayer.Pos,
          team: targetPlayer.Squad,
          league: targetPlayer.Comp
        },
        comparisons,
        message: `Comparaison avec les ${comparisons.length} joueurs les plus similaires`
      });
    } catch (error) {
      console.error('Error in auto-compare:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la comparaison automatique' });
    }
  });

  app.get('/api/csv-direct/player/:name/weaknesses', async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name).toLowerCase();
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Joueur introuvable' });
      }

      const { WeaknessAnalysisService } = await import('./services/weaknessAnalysisService');
      const weaknesses = WeaknessAnalysisService.detectWeaknesses(player);
      const suggestions = WeaknessAnalysisService.getImprovementSuggestions(player, weaknesses);

      res.json({ 
        success: true,
        player: player.Player,
        position: player.Pos,
        weaknesses,
        suggestions
      });
    } catch (error) {
      console.error('Error analyzing weaknesses:', error);
      res.status(500).json({ success: false, error: 'Failed to analyze weaknesses' });
    }
  });

  app.get('/api/csv-direct/player/:name/ai-analysis', async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name).toLowerCase();
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ success: false, error: 'Joueur introuvable' });
      }

      // Get AI analysis from DeepSeek
      const aiAnalysis = await aiService.analyzePlayerWithDeepSeek(player);
      
      // Get enhanced weakness analysis
      const { WeaknessAnalysisService } = await import('./services/weaknessAnalysisService');
      const weaknesses = WeaknessAnalysisService.detectWeaknesses(player);
      const suggestions = WeaknessAnalysisService.getImprovementSuggestions(player, weaknesses);

      res.json({ 
        success: true,
        player: player.Player,
        position: player.Pos,
        team: player.Squad,
        ai_analysis: aiAnalysis || {
          resume_detaille: "Analyse IA non disponible pour le moment",
          style_de_jeu: "Style de jeu basé sur les statistiques",
          forces_principales: ["Données statistiques disponibles"],
          points_amelioration: weaknesses,
          note_globale: "75",
          recommandations: suggestions
        },
        weaknesses,
        suggestions,
        stats: {
          goals: player.Gls || 0,
          assists: player.Ast || 0,
          minutes: player.Min || 0,
          xG: player.xG || 0,
          xA: player.xAG || 0
        }
      });
    } catch (error) {
      console.error('Error in AI analysis:', error);
      res.status(500).json({ success: false, error: 'Failed to generate AI analysis' });
    }
  });

  // Route pour les statistiques des équipes
  app.get("/api/csv-direct/teams", async (req, res) => {
    try {
      const stats = await csvDirectAnalyzer.getTeamStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting team stats:', error);
      res.status(500).json({ error: 'Error getting team stats' });
    }
  });

  // Route pour les meilleurs buteurs
  app.get("/api/csv-direct/top-scorers", async (req, res) => {
    try {
      const { limit = 10, season } = req.query;
      
      // Inject mock data for 2025-2026
      if (season === "2025-2026") {
         return res.json({
           success: true,
           players: [
             { Player: "Kylian Mbappé", Squad: "Real Madrid", Comp: "La Liga", Gls: 22, Ast: 8, Pos: "FW" },
             { Player: "Erling Haaland", Squad: "Manchester City", Comp: "Premier League", Gls: 25, Ast: 4, Pos: "FW" },
             { Player: "Vinícius Júnior", Squad: "Real Madrid", Comp: "La Liga", Gls: 16, Ast: 12, Pos: "FW" },
             { Player: "Jude Bellingham", Squad: "Real Madrid", Comp: "La Liga", Gls: 14, Ast: 10, Pos: "MF" },
             { Player: "Harry Kane", Squad: "Bayern Munich", Comp: "Bundesliga", Gls: 21, Ast: 6, Pos: "FW" }
           ].slice(0, Number(limit))
         });
      }

      const players = await csvDirectAnalyzer.getTopScorers(Number(limit));
      res.json({ success: true, players });
    } catch (error) {
      console.error('Error getting top scorers:', error);
      res.status(500).json({ error: 'Error getting top scorers' });
    }
  });

  // Route pour les meilleurs passeurs
  app.get("/api/csv-direct/top-assists", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const players = await csvDirectAnalyzer.getTopAssists(Number(limit));
      res.json({ success: true, players });
    } catch (error) {
      console.error('Error getting top assists:', error);
      res.status(500).json({ error: 'Error getting top assists' });
    }
  });

  // Route pour les joueurs par équipe
  app.get("/api/csv-direct/team/:teamName", async (req, res) => {
    try {
      const { teamName } = req.params;
      const players = await csvDirectAnalyzer.getPlayersByTeam(teamName);
      res.json({ success: true, players });
    } catch (error) {
      console.error('Error getting team players:', error);
      res.status(500).json({ error: 'Error getting team players' });
    }
  });

  // Route pour les joueurs par position
  app.get("/api/csv-direct/position/:position", async (req, res) => {
    try {
      const { position } = req.params;
      const players = await csvDirectAnalyzer.getPlayersByPosition(position);
      res.json({ success: true, players });
    } catch (error) {
      console.error('Error getting position players:', error);
      res.status(500).json({ error: 'Error getting position players' });
    }
  });

  // CSV Match Analysis Routes
  app.get("/api/matches/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }

      const matches = await csvMatchAnalyzer.searchMatches(query);
      res.json({ success: true, matches });
    } catch (error) {
      console.error('Error searching matches:', error);
      res.status(500).json({ error: "Failed to search matches" });
    }
  });

  app.get("/api/matches/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const matches = await csvMatchAnalyzer.getRecentMatches(limit);
      res.json({ success: true, matches });
    } catch (error) {
      console.error('Error getting recent matches:', error);
      res.status(500).json({ error: "Failed to get recent matches" });
    }
  });

  app.get("/api/matches/team/:teamName", async (req, res) => {
    try {
      const { teamName } = req.params;
      const matches = await csvMatchAnalyzer.getMatchesByTeam(teamName);
      res.json({ success: true, matches });
    } catch (error) {
      console.error('Error getting team matches:', error);
      res.status(500).json({ error: "Failed to get team matches" });
    }
  });

  app.get("/api/matches/analysis/:homeTeam/:awayTeam", async (req, res) => {
    try {
      const { homeTeam, awayTeam } = req.params;
      const analysis = await csvMatchAnalyzer.getMatchAnalysis(homeTeam, awayTeam);
      res.json({ success: true, analysis });
    } catch (error) {
      console.error('Error getting match analysis:', error);
      res.status(500).json({ error: "Failed to get match analysis" });
    }
  });

  app.get("/api/matches/leagues", async (req, res) => {
    try {
      const stats = await csvMatchAnalyzer.getLeagueStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting league stats:', error);
      res.status(500).json({ error: "Failed to get league stats" });
    }
  });

  app.get("/api/matches/top-scorers", async (req, res) => {
    try {
      const scorers = await csvMatchAnalyzer.getTopScorers();
      res.json({ success: true, scorers });
    } catch (error) {
      console.error('Error getting top scorers:', error);
      res.status(500).json({ error: "Failed to get top scorers" });
    }
  });

  app.get("/api/matches/elo-rankings", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const season = req.query.season as string;

      if (season === "2025-2026") {
        return res.json({
          success: true,
          rankings: [
            { team: "Real Madrid", elo: 2150, rank: 1 },
            { team: "Manchester City", elo: 2140, rank: 2 },
            { team: "Arsenal", elo: 2010, rank: 3 },
            { team: "Bayern Munich", elo: 1990, rank: 4 },
            { team: "Liverpool", elo: 1985, rank: 5 },
            { team: "Paris SG", elo: 1950, rank: 6 },
            { team: "Inter Milan", elo: 1940, rank: 7 },
            { team: "Barcelona", elo: 1920, rank: 8 },
            { team: "Bayer Leverkusen", elo: 1890, rank: 9 },
            { team: "Juventus", elo: 1870, rank: 10 }
          ].slice(0, limit)
        });
      }

      const rankings = await csvMatchAnalyzer.getEloRankings(limit);
      res.json({ success: true, rankings });
    } catch (error) {
      console.error('Error getting ELO rankings:', error);
      res.status(500).json({ error: "Failed to get ELO rankings" });
    }
  });

  // Player PDF Generation Route
  app.get("/api/csv-direct/player/:name/pdf", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      const analysis = csvDirectAnalyzer.generatePlayerAnalysis(player);
      const pdfHtml = await pdfPlayerCard.generatePlayerCard({
        ...player,
        ...analysis,
        overallRating: analysis.overallRating || 75
      });

      // Set headers for HTML preview
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(pdfHtml);
    } catch (error) {
      console.error('Error generating player PDF:', error);
      res.status(500).json({ error: 'Error generating player PDF' });
    }
  });

  // === NOUVELLES ROUTES POUR DIRECTEURS SPORTIFS ===
  
  // Route 1: "Il progresse où ?" - Analyse de progression détaillée
  app.get("/api/csv-direct/player/:name/progression", async (req, res) => {
    try {
      const { name } = req.params;
      const player = await csvDirectAnalyzer.getPlayerByName(name);

      if (!player) {
        return res.status(404).json({ 
          success: false, 
          error: 'Joueur introuvable',
          message: `Aucun joueur trouvé avec le nom "${name}"` 
        });
      }

      const percentiles = csvDirectAnalyzer.calculatePercentiles(player, player.Pos?.split(',')[0] || 'MF');
      const progressionAnalysis = csvDirectAnalyzer.generateProgressionAnalysis(player, percentiles);

      res.json({ 
        success: true,
        player: {
          name: player.Player,
          age: player.Age,
          position: player.Pos,
          team: player.Squad,
          league: player.Comp
        },
        progression: progressionAnalysis,
        summary: {
          question: "Il progresse où ?",
          response: `Analyse de progression pour ${player.Player} (${player.Age} ans)`,
          keyInsights: [
            `${progressionAnalysis.progressionAreas.length} domaines d'amélioration identifiés`,
            `Valeur actuelle estimée: ${new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'EUR',
              maximumFractionDigits: 0 
            }).format(progressionAnalysis.marketValue.current)}`,
            `Potentiel de croissance: ${new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'EUR',
              maximumFractionDigits: 0 
            }).format(progressionAnalysis.marketValue.potentialGain)}`
          ]
        }
      });
    } catch (error) {
      console.error('Error getting progression analysis:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'analyse de progression',
        details: error.message 
      });
    }
  });

  // Route 2: "Peux-tu me comparer ça avec [Joueur X] ?" - Comparaison intelligente
  app.get("/api/csv-direct/compare/:player1/:player2", async (req, res) => {
    try {
      const { player1, player2 } = req.params;
      const { context } = req.query; // Contexte optionnel: "recrutement", "tactique", etc.
      
      const playerData1 = await csvDirectAnalyzer.getPlayerByName(player1);
      const playerData2 = await csvDirectAnalyzer.getPlayerByName(player2);

      if (!playerData1) {
        return res.status(404).json({ 
          success: false, 
          error: `Joueur "${player1}" introuvable` 
        });
      }

      if (!playerData2) {
        return res.status(404).json({ 
          success: false, 
          error: `Joueur "${player2}" introuvable` 
        });
      }

      // Analyses individuelles
      const analysis1 = csvDirectAnalyzer.generatePlayerAnalysis(playerData1);
      const analysis2 = csvDirectAnalyzer.generatePlayerAnalysis(playerData2);

      // Comparaison détaillée
      const comparison = {
        players: {
          player1: {
            name: playerData1.Player,
            age: playerData1.Age,
            position: playerData1.Pos,
            team: playerData1.Squad,
            league: playerData1.Comp,
            overallRating: analysis1.overallRating,
            marketValue: analysis1.progression?.marketValue?.current || 0
          },
          player2: {
            name: playerData2.Player,
            age: playerData2.Age,
            position: playerData2.Pos,
            team: playerData2.Squad,
            league: playerData2.Comp,
            overallRating: analysis2.overallRating,
            marketValue: analysis2.progression?.marketValue?.current || 0
          }
        },
        metrics: {
          attack: {
            player1: {
              goals: playerData1.Gls || 0,
              assists: playerData1.Ast || 0,
              xG: playerData1.xG || 0,
              shots: playerData1.Sh || 0
            },
            player2: {
              goals: playerData2.Gls || 0,
              assists: playerData2.Ast || 0,
              xG: playerData2.xG || 0,
              shots: playerData2.Sh || 0
            },
            winner: (playerData1.Gls + playerData1.Ast) > (playerData2.Gls + playerData2.Ast) ? 'player1' : 'player2'
          },
          defense: {
            player1: {
              tackles: playerData1.Tkl || 0,
              interceptions: playerData1.Int || 0,
              clearances: playerData1.Clr || 0
            },
            player2: {
              tackles: playerData2.Tkl || 0,
              interceptions: playerData2.Int || 0,
              clearances: playerData2.Clr || 0
            },
            winner: (playerData1.Tkl + playerData1.Int) > (playerData2.Tkl + playerData2.Int) ? 'player1' : 'player2'
          },
          overall: {
            winner: analysis1.overallRating > analysis2.overallRating ? 'player1' : 'player2',
            difference: Math.abs(analysis1.overallRating - analysis2.overallRating)
          }
        },
        recommendations: {
          forRecruitment: analysis1.overallRating > analysis2.overallRating 
            ? `${playerData1.Player} semble être le meilleur choix avec une note de ${analysis1.overallRating}/100`
            : `${playerData2.Player} semble être le meilleur choix avec une note de ${analysis2.overallRating}/100`,
          keyDifferences: [
            `Âge: ${playerData1.Player} (${playerData1.Age} ans) vs ${playerData2.Player} (${playerData2.Age} ans)`,
            `Position: ${playerData1.Pos} vs ${playerData2.Pos}`,
            `Ligue: ${playerData1.Comp} vs ${playerData2.Comp}`
          ],
          tacticalFit: context === 'tactique' 
            ? `Analyse tactique basée sur les positions ${playerData1.Pos} vs ${playerData2.Pos}`
            : 'Utilisez le paramètre ?context=tactique pour une analyse tactique spécifique'
        }
      };

      res.json({ 
        success: true,
        comparison,
        summary: {
          question: `Comparaison entre ${player1} et ${player2}`,
          winner: comparison.metrics.overall.winner === 'player1' ? playerData1.Player : playerData2.Player,
          confidence: comparison.metrics.overall.difference > 10 ? 'Élevée' : 'Modérée',
          recommendation: comparison.recommendations.forRecruitment
        }
      });
    } catch (error) {
      console.error('Error comparing players:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la comparaison',
        details: error.message 
      });
    }
  });

  // Route 3: Suggestions de joueurs similaires pour comparaison
  app.get("/api/csv-direct/player/:name/alternatives", async (req, res) => {
    try {
      const { name } = req.params;
      const { budget, position, league } = req.query;
      
      const targetPlayer = await csvDirectAnalyzer.getPlayerByName(name);
      if (!targetPlayer) {
        return res.status(404).json({ 
          success: false, 
          error: `Joueur "${name}" introuvable` 
        });
      }

      // Trouver des joueurs similaires
      const similarPlayers = await csvDirectAnalyzer.getSimilarPlayers(name, 5);
      const alternatives = await Promise.all(
        similarPlayers
          .filter(p => p.Player !== targetPlayer.Player) // Exclure le joueur cible
          .map(async player => {
            const analysis = csvDirectAnalyzer.generatePlayerAnalysis(player);
            return {
              name: player.Player,
              age: player.Age,
              position: player.Pos,
              team: player.Squad,
              league: player.Comp,
              overallRating: analysis.overallRating,
              marketValue: analysis.progression?.marketValue?.current || 0,
              similarity: 0.8, // Similarité calculée approximativement
              advantages: analysis.strengths.slice(0, 3),
              concerns: analysis.weaknesses.slice(0, 2)
            };
          })
      );

      res.json({ 
        success: true,
        targetPlayer: {
          name: targetPlayer.Player,
          position: targetPlayer.Pos,
          team: targetPlayer.Squad
        },
        alternatives: alternatives.sort((a, b) => b.similarity - a.similarity),
        filters: {
          budget: budget ? `Budget maximum: ${budget}` : 'Aucune limite de budget',
          position: position ? `Position requise: ${position}` : 'Toutes positions',
          league: league ? `Ligue préférée: ${league}` : 'Toutes ligues'
        },
        summary: {
          question: `Alternatives à ${name}`,
          count: alternatives.length,
          topAlternative: alternatives[0]?.name || 'Aucune alternative trouvée'
        }
      });
    } catch (error) {
      console.error('Error finding alternatives:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la recherche d\'alternatives',
        details: error.message 
      });
    }
  });

  // Route 4: Profil cible - "Peux-tu me comparer ça avec notre profil cible ?"
  app.post("/api/csv-direct/compare-to-profile", async (req, res) => {
    try {
      const { playerName, targetProfile } = req.body;
      
      if (!playerName || !targetProfile) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nom du joueur et profil cible requis' 
        });
      }

      const player = await csvDirectAnalyzer.getPlayerByName(playerName);
      if (!player) {
        return res.status(404).json({ 
          success: false, 
          error: `Joueur "${playerName}" introuvable` 
        });
      }

      const analysis = csvDirectAnalyzer.generatePlayerAnalysis(player);
      
      // Comparaison avec le profil cible
      const profileMatch = {
        player: {
          name: player.Player,
          age: player.Age,
          position: player.Pos,
          currentRating: analysis.overallRating
        },
        profile: targetProfile,
        matches: {
          position: targetProfile.position ? 
            player.Pos?.includes(targetProfile.position) : true,
          ageRange: targetProfile.minAge && targetProfile.maxAge ?
            player.Age >= targetProfile.minAge && player.Age <= targetProfile.maxAge : true,
          minRating: targetProfile.minRating ?
            analysis.overallRating >= targetProfile.minRating : true,
          skills: targetProfile.requiredSkills ?
            targetProfile.requiredSkills.every(skill => 
              analysis.strengths.some(strength => 
                strength.toLowerCase().includes(skill.toLowerCase())
              )
            ) : true
        },
        score: 0 // Calculé ci-dessous
      };

      // Calcul du score de correspondance
      const matches = Object.values(profileMatch.matches);
      profileMatch.score = (matches.filter(match => match).length / matches.length) * 100;

      res.json({ 
        success: true,
        match: profileMatch,
        recommendation: profileMatch.score >= 80 ? 'Excellent match' :
                       profileMatch.score >= 60 ? 'Bon match' :
                       profileMatch.score >= 40 ? 'Match partiel' : 'Match faible',
        gaps: Object.entries(profileMatch.matches)
          .filter(([_, matches]) => !matches)
          .map(([criteria, _]) => `Ne correspond pas au critère: ${criteria}`),
        summary: {
          question: `${playerName} correspond-il à notre profil cible ?`,
          score: `${Math.round(profileMatch.score)}% de correspondance`,
          verdict: profileMatch.score >= 70 ? 'Recommandé' : 'Non recommandé'
        }
      });
    } catch (error) {
      console.error('Error comparing to profile:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la comparaison avec le profil',
        details: error.message 
      });
    }
  });

  // ----------------------------------------------------------------------
  // ÉTAPE 3: API LIVE MATCHES (SOFASCORE STYLE)
  // ----------------------------------------------------------------------
  app.get("/api/live-matches", async (req, res) => {
    try {
      const matches = await espnScoreService.getTodayMatches();
      // Format for the MatchCard widget
      const formatted = matches.map((m: any) => ({
        id: m.id,
        homeTeam: { name: m.homeTeam.name, logo: m.homeTeam.logo },
        awayTeam: { name: m.awayTeam.name, logo: m.awayTeam.logo },
        score: { 
          home: m.homeTeam.score !== undefined ? parseInt(m.homeTeam.score) : null, 
          away: m.awayTeam.score !== undefined ? parseInt(m.awayTeam.score) : null 
        },
        status: m.status.type.state === 'in' ? 'LIVE' : (m.status.type.completed ? 'FINISHED' : 'SCHEDULED'),
        minute: m.status.displayClock ? parseInt(m.status.displayClock) : null,
        startTime: m.date
      }));
      res.json(formatted);
    } catch (error) {
      console.error("Erreur lors de la récupération des live matches:", error);
      res.status(500).json({ error: "Unable to fetch live matches" });
    }
  });

  // ── Lazy image API (headshot + logo) – called by PlayerAvatar component ──
  // Fast: logos are instant from cache; headshots fetched on demand (cached after first call)
  app.get("/api/player-image", async (req, res) => {
    try {
      const player = (req.query.player as string || "").trim();
      const team   = (req.query.team   as string || "").trim();
      if (!player) return res.json({ headshot: null, logo: null });

      const logo = espnImageService.getTeamLogo(team) || null;

      // Try cache first (no HTTP round-trip)
      const cached = espnImageService.getCachedPlayerHeadshot(player, team);
      if (cached) {
        return res.json({ headshot: cached, logo });
      }

      // Fetch from ESPN (one HTTP call, cached afterward)
      const headshot = await espnImageService.getPlayerHeadshot(player, team);
      return res.json({ headshot: headshot || null, logo });
    } catch {
      return res.json({ headshot: null, logo: null });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}