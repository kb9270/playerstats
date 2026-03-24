import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name"),
  age: integer("age"),
  nationality: text("nationality"),
  position: text("position"),
  team: text("team"),
  league: text("league"),
  marketValue: real("market_value"),
  contractEnd: text("contract_end"),
  height: real("height"),
  foot: text("foot"),
  photoUrl: text("photo_url"),
  fbrefId: text("fbref_id").unique(),
  transfermarktId: text("transfermarkt_id").unique(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  season: text("season").notNull(),
  competition: text("competition"),
  matches: integer("matches").default(0),
  starts: integer("starts").default(0),
  minutes: integer("minutes").default(0),
  goals: real("goals").default(0),
  assists: real("assists").default(0),
  goalsNonPenalty: real("goals_non_penalty").default(0),
  penaltyGoals: real("penalty_goals").default(0),
  penaltyAttempts: real("penalty_attempts").default(0),
  yellowCards: integer("yellow_cards").default(0),
  redCards: integer("red_cards").default(0),
  xG: real("xg").default(0),
  xA: real("xa").default(0),
  progressivePasses: real("progressive_passes").default(0),
  progressiveCarries: real("progressive_carries").default(0),
  progressivePassesReceived: real("progressive_passes_received").default(0),
  passesCompleted: real("passes_completed").default(0),
  passesAttempted: real("passes_attempted").default(0),
  passCompletionRate: real("pass_completion_rate").default(0),
  keyPasses: real("key_passes").default(0),
  finalThirdPasses: real("final_third_passes").default(0),
  penaltyAreaPasses: real("penalty_area_passes").default(0),
  crosses: real("crosses").default(0),
  tacklesWon: real("tackles_won").default(0),
  tacklesAttempted: real("tackles_attempted").default(0),
  interceptions: real("interceptions").default(0),
  blocks: real("blocks").default(0),
  clearances: real("clearances").default(0),
  aerialsWon: real("aerials_won").default(0),
  aerialsAttempted: real("aerials_attempted").default(0),
  dribblesCompleted: real("dribbles_completed").default(0),
  dribblesAttempted: real("dribbles_attempted").default(0),
  touches: real("touches").default(0),
  touchesPenaltyArea: real("touches_penalty_area").default(0),
  dispossessed: real("dispossessed").default(0),
  miscontrols: real("miscontrols").default(0),
  rating: real("rating"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const comparisons = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  playerIds: jsonb("player_ids").notNull(), // Array of player IDs
  season: text("season").notNull(),
  competition: text("competition"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoutingReports = pgTable("scouting_reports", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  season: text("season").notNull(),
  competition: text("competition"),
  position: text("position"),
  percentiles: jsonb("percentiles").notNull(), // Object with stat percentiles
  strengths: jsonb("strengths"), // Array of strength areas
  weaknesses: jsonb("weaknesses"), // Array of weakness areas
  overallRating: real("overall_rating"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  lastUpdated: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  lastUpdated: true,
});

export const insertComparisonSchema = createInsertSchema(comparisons).omit({
  id: true,
  createdAt: true,
});

export const insertScoutingReportSchema = createInsertSchema(scoutingReports).omit({
  id: true,
  lastUpdated: true,
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  publishedAt: timestamp("published_at"),
  url: text("url").notNull().unique(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ballonDorRankings = pgTable("ballon_dor_rankings", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  rank: integer("rank").notNull(),
  points: real("points").notNull(),
  season: text("season").notNull(),
  week: integer("week"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});

export const insertBallonDorSchema = createInsertSchema(ballonDorRankings).omit({
  id: true,
  createdAt: true,
});

// NOUVELLES TABLES SOFASCORE LIVE (Ajoutées pour la Saison 2026/2027)

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  country: text("country"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  leagueId: integer("league_id").references(() => leagues.id),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  status: text("status"), // SCHEDULED, LIVE, FINISHED
  scoreHome: integer("score_home").default(0),
  scoreAway: integer("score_away").default(0),
  startTime: timestamp("start_time"),
  momentumData: jsonb("momentum_data"), // Graphes de possession dynamiques
});

export const matchEvents = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  type: text("type"), // GOAL, CARD, SUB
  minute: integer("minute"),
  playerId: integer("player_id").references(() => players.id),
  description: text("description"),
});

export const insertLeagueSchema = createInsertSchema(leagues).omit({ id: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export const insertMatchEventSchema = createInsertSchema(matchEvents).omit({ id: true });

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type Comparison = typeof comparisons.$inferSelect;
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type ScoutingReport = typeof scoutingReports.$inferSelect;
export type InsertScoutingReport = z.infer<typeof insertScoutingReportSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type BallonDorRanking = typeof ballonDorRankings.$inferSelect;
export type InsertBallonDor = z.infer<typeof insertBallonDorSchema>;

export type League = typeof leagues.$inferSelect;
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type MatchEvent = typeof matchEvents.$inferSelect;
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;

