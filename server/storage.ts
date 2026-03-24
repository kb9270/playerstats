import {
  players,
  playerStats,
  comparisons,
  scoutingReports,
  type Player,
  type InsertPlayer,
  type PlayerStats,
  type InsertPlayerStats,
  type Comparison,
  type InsertComparison,
  type ScoutingReport,
  type InsertScoutingReport
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  searchPlayers(query: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>): Promise<Player | undefined>;

  // Player stats methods
  getPlayerStats(playerId: number, season?: string): Promise<PlayerStats[]>;
  getPlayerStatsBySeason(playerId: number, season: string, competition?: string): Promise<PlayerStats | undefined>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  updatePlayerStats(id: number, stats: Partial<InsertPlayerStats>): Promise<PlayerStats | undefined>;

  // Comparison methods
  createComparison(comparison: InsertComparison): Promise<Comparison>;
  getComparison(id: number): Promise<Comparison | undefined>;

  // Scouting report methods
  getScoutingReport(playerId: number, season: string): Promise<ScoutingReport | undefined>;
  createScoutingReport(report: InsertScoutingReport): Promise<ScoutingReport>;
  updateScoutingReport(id: number, report: Partial<InsertScoutingReport>): Promise<ScoutingReport | undefined>;
}

// ====== IN-MEMORY STORAGE (used when no DATABASE_URL is set) ======
class MemoryStorage implements IStorage {
  private players: Map<number, Player> = new Map();
  private playerStats: Map<number, PlayerStats> = new Map();
  private comparisons: Map<number, Comparison> = new Map();
  private scoutingReports: Map<number, ScoutingReport> = new Map();
  private nextPlayerId = 1;
  private nextStatsId = 1;
  private nextComparisonId = 1;
  private nextReportId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();

    const seedPlayers: Omit<Player, 'id'>[] = [
      { name: "Moses Simon", fullName: "Moses Daddy-Ajala Simon", age: 29, nationality: "Nigerian", position: "AILIER GAUCHE", team: "FC NANTES", league: "Ligue 1", marketValue: 12000000, contractEnd: "JUIN 2026", height: 1.68, foot: "DROIT", photoUrl: null, fbrefId: "moses-simon", transfermarktId: null, lastUpdated: now },
      { name: "Kylian Mbappé", fullName: "Kylian Mbappé Lottin", age: 26, nationality: "French", position: "ATTAQUANT", team: "Real Madrid", league: "La Liga", marketValue: 180000000, contractEnd: "JUIN 2029", height: 1.78, foot: "DROIT", photoUrl: null, fbrefId: "kylian-mbappe", transfermarktId: null, lastUpdated: now },
      { name: "Mohamed-Ali Cho", fullName: "Mohamed-Ali Cho", age: 21, nationality: "French", position: "AILIER DROIT", team: "OGC Nice", league: "Ligue 1", marketValue: 25000000, contractEnd: "JUIN 2027", height: 1.75, foot: "GAUCHE", photoUrl: null, fbrefId: "mohamed-ali-cho", transfermarktId: null, lastUpdated: now },
      { name: "Zuriko Davitashvili", fullName: "Zuriko Davitashvili", age: 24, nationality: "Georgian", position: "AILIER GAUCHE", team: "AS Saint-Étienne", league: "Ligue 1", marketValue: 8000000, contractEnd: "JUIN 2027", height: 1.73, foot: "GAUCHE", photoUrl: null, fbrefId: "zuriko-davitashvili", transfermarktId: null, lastUpdated: now },
      { name: "Dilane Bakwa", fullName: "Dilane Bakwa", age: 22, nationality: "French", position: "AILIER DROIT", team: "RC Strasbourg", league: "Ligue 1", marketValue: 15000000, contractEnd: "JUIN 2026", height: 1.80, foot: "GAUCHE", photoUrl: null, fbrefId: "dilane-bakwa", transfermarktId: null, lastUpdated: now },
    ];

    const statsBase = { starts: null, goalsNonPenalty: null, penaltyGoals: null, penaltyAttempts: null, yellowCards: 0, redCards: 0, xG: null, xA: null, progressiveCarries: null, progressivePassesReceived: null, passesCompleted: null, passesAttempted: null, passCompletionRate: null, finalThirdPasses: null, penaltyAreaPasses: null, tacklesWon: null, tacklesAttempted: null, interceptions: null, blocks: null, clearances: null, aerialsWon: null, aerialsAttempted: null, dribblesAttempted: null, touches: null, touchesPenaltyArea: null, dispossessed: null, miscontrols: null, lastUpdated: now };

    const seedStats: Omit<PlayerStats, 'id' | 'playerId'>[] = [
      { season: "2026-2027", competition: "Ligue 1", matches: 33, minutes: 2677, goals: 8, assists: 10, progressivePasses: 5.07, keyPasses: 10, crosses: 7.66, dribblesCompleted: 2.24, rating: 7.24, shots: null, shotsOnTarget: null, passes: null, tackles: null, ...statsBase },
      { season: "2026-2027", competition: "La Liga", matches: 28, minutes: 2456, goals: 18, assists: 5, progressivePasses: 2.1, keyPasses: 2.8, crosses: 1.2, dribblesCompleted: 3.4, rating: 8.2, shots: null, shotsOnTarget: null, passes: null, tackles: null, ...statsBase },
      { season: "2026-2027", competition: "Ligue 1", matches: 25, minutes: 1890, goals: 5, assists: 3, progressivePasses: 4.50, keyPasses: 2.83, crosses: 2.83, dribblesCompleted: 1.11, rating: 6.8, shots: null, shotsOnTarget: null, passes: null, tackles: null, ...statsBase },
      { season: "2026-2027", competition: "Ligue 1", matches: 28, minutes: 2145, goals: 6, assists: 4, progressivePasses: 3.18, keyPasses: 2.81, crosses: 2.81, dribblesCompleted: 1.54, rating: 6.9, shots: null, shotsOnTarget: null, passes: null, tackles: null, ...statsBase },
      { season: "2026-2027", competition: "Ligue 1", matches: 31, minutes: 2387, goals: 7, assists: 8, progressivePasses: 3.86, keyPasses: 5.51, crosses: 5.51, dribblesCompleted: 1.80, rating: 7.1, shots: null, shotsOnTarget: null, passes: null, tackles: null, ...statsBase },
    ];

    const seedReports: { percentiles: any; strengths: string[]; weaknesses: string[]; overallRating: number; }[] = [
      { percentiles: { goals: 26, assists: 88, keyPasses: 66, progressivePasses: 93, dribblesCompleted: 93, crosses: 94, passCompletionRate: 91, tacklesWon: 32, interceptions: 24 }, strengths: ["Passes décisives", "Dribbles réussis", "Centres", "Possessions progressives"], weaknesses: ["Actions défensives", "Limiter le déchet"], overallRating: 73 },
      { percentiles: { goals: 95, assists: 78, keyPasses: 85, progressivePasses: 72, dribblesCompleted: 88, crosses: 45, passCompletionRate: 82, tacklesWon: 15, interceptions: 12 }, strengths: ["Buts", "Vitesse", "Dribbles", "Finition"], weaknesses: ["Jeu défensif", "Jeu aérien"], overallRating: 92 },
      { percentiles: { goals: 59, assists: 22, keyPasses: 59, progressivePasses: 66, dribblesCompleted: 71, crosses: 47, passCompletionRate: 65, tacklesWon: 35, interceptions: 30 }, strengths: ["Vitesse", "Dribbles", "Progression"], weaknesses: ["Passes décisives", "Régularité"], overallRating: 65 },
      { percentiles: { goals: 66, assists: 23, keyPasses: 60, progressivePasses: 60, dribblesCompleted: 59, crosses: 40, passCompletionRate: 61, tacklesWon: 34, interceptions: 42 }, strengths: ["Buts", "Technique", "Créativité"], weaknesses: ["Passes décisives", "Défense"], overallRating: 68 },
      { percentiles: { goals: 74, assists: 29, keyPasses: 74, progressivePasses: 74, dribblesCompleted: 77, crosses: 66, passCompletionRate: 78, tacklesWon: 41, interceptions: 53 }, strengths: ["Buts", "Centres", "Dribbles", "Polyvalence"], weaknesses: ["Défense", "Constance"], overallRating: 75 },
    ];

    seedPlayers.forEach((p, i) => {
      const id = this.nextPlayerId++;
      this.players.set(id, { ...p, id });

      const sId = this.nextStatsId++;
      this.playerStats.set(sId, { ...seedStats[i], id: sId, playerId: id, shots: null, shotsOnTarget: null, passes: null, tackles: null });

      const rId = this.nextReportId++;
      this.scoutingReports.set(rId, { id: rId, playerId: id, season: "2026-2027", competition: seedStats[i].competition, position: p.position || "Inconnu", lastUpdated: now, ...seedReports[i] });
    });
  }

  async getPlayer(id: number) { return this.players.get(id); }

  async getPlayerByName(name: string) {
    return [...this.players.values()].find(p => p.name.toLowerCase().includes(name.toLowerCase()));
  }

  async searchPlayers(query: string) {
    const q = query.toLowerCase();
    return [...this.players.values()].filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.team && p.team.toLowerCase().includes(q)) ||
      (p.position && p.position.toLowerCase().includes(q))
    );
  }

  async createPlayer(insertPlayer: InsertPlayer) {
    const id = this.nextPlayerId++;
    const player: Player = { ...insertPlayer, id, lastUpdated: new Date() } as Player;
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>) {
    const player = this.players.get(id);
    if (!player) return undefined;
    const updated = { ...player, ...updateData, lastUpdated: new Date() };
    this.players.set(id, updated);
    return updated;
  }

  async getPlayerStats(playerId: number, season?: string) {
    return [...this.playerStats.values()].filter(s =>
      s.playerId === playerId && (!season || s.season === season)
    );
  }

  async getPlayerStatsBySeason(playerId: number, season: string, competition?: string) {
    return [...this.playerStats.values()].find(s =>
      s.playerId === playerId && s.season === season && (!competition || s.competition === competition)
    );
  }

  async createPlayerStats(insertStats: InsertPlayerStats) {
    const id = this.nextStatsId++;
    const stats: PlayerStats = { ...insertStats, id, lastUpdated: new Date() } as PlayerStats;
    this.playerStats.set(id, stats);
    return stats;
  }

  async updatePlayerStats(id: number, updateData: Partial<InsertPlayerStats>) {
    const stats = this.playerStats.get(id);
    if (!stats) return undefined;
    const updated = { ...stats, ...updateData, lastUpdated: new Date() };
    this.playerStats.set(id, updated);
    return updated;
  }

  async createComparison(insertComparison: InsertComparison) {
    const id = this.nextComparisonId++;
    const comparison: Comparison = { ...insertComparison, id, createdAt: new Date() } as Comparison;
    this.comparisons.set(id, comparison);
    return comparison;
  }

  async getComparison(id: number) { return this.comparisons.get(id); }

  async getScoutingReport(playerId: number, season: string) {
    return [...this.scoutingReports.values()].find(r => r.playerId === playerId && r.season === season);
  }

  async createScoutingReport(insertReport: InsertScoutingReport) {
    const id = this.nextReportId++;
    const report: ScoutingReport = { ...insertReport, id, lastUpdated: new Date() } as ScoutingReport;
    this.scoutingReports.set(id, report);
    return report;
  }

  async updateScoutingReport(id: number, updateData: Partial<InsertScoutingReport>) {
    const report = this.scoutingReports.get(id);
    if (!report) return undefined;
    const updated = { ...report, ...updateData, lastUpdated: new Date() };
    this.scoutingReports.set(id, updated);
    return updated;
  }
}

// ====== DATABASE STORAGE (used when DATABASE_URL is set) ======
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeRealData();
  }

  private async initializeRealData() {
    if (!db) return;
    try {
      const existingPlayers = await db.select().from(players).limit(1);
      if (existingPlayers.length > 0) return;
    } catch (error) {
      console.log('Initializing database with real player data...');
    }
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    if (!db) return undefined;
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    if (!db) return undefined;
    const [player] = await db.select().from(players).where(ilike(players.name, `%${name}%`));
    return player || undefined;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    if (!db) return [];
    const searchTerm = `%${query}%`;
    return await db.select().from(players).where(
      or(ilike(players.name, searchTerm), ilike(players.team, searchTerm), ilike(players.position, searchTerm))
    );
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    if (!db) throw new Error('No database connection');
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>): Promise<Player | undefined> {
    if (!db) return undefined;
    const [player] = await db.update(players).set({ ...updateData, lastUpdated: new Date() }).where(eq(players.id, id)).returning();
    return player || undefined;
  }

  async getPlayerStats(playerId: number, season?: string): Promise<PlayerStats[]> {
    if (!db) return [];
    if (season) return await db.select().from(playerStats).where(and(eq(playerStats.playerId, playerId), eq(playerStats.season, season)));
    return await db.select().from(playerStats).where(eq(playerStats.playerId, playerId));
  }

  async getPlayerStatsBySeason(playerId: number, season: string, competition?: string): Promise<PlayerStats | undefined> {
    if (!db) return undefined;
    let conditions: any[] = [eq(playerStats.playerId, playerId), eq(playerStats.season, season)];
    if (competition) conditions.push(eq(playerStats.competition, competition));
    const [stats] = await db.select().from(playerStats).where(and(...conditions));
    return stats || undefined;
  }

  async createPlayerStats(insertStats: InsertPlayerStats): Promise<PlayerStats> {
    if (!db) throw new Error('No database connection');
    const [stats] = await db.insert(playerStats).values(insertStats).returning();
    return stats;
  }

  async updatePlayerStats(id: number, updateData: Partial<InsertPlayerStats>): Promise<PlayerStats | undefined> {
    if (!db) return undefined;
    const [stats] = await db.update(playerStats).set({ ...updateData, lastUpdated: new Date() }).where(eq(playerStats.id, id)).returning();
    return stats || undefined;
  }

  async createComparison(insertComparison: InsertComparison): Promise<Comparison> {
    if (!db) throw new Error('No database connection');
    const [comparison] = await db.insert(comparisons).values(insertComparison).returning();
    return comparison;
  }

  async getComparison(id: number): Promise<Comparison | undefined> {
    if (!db) return undefined;
    const [comparison] = await db.select().from(comparisons).where(eq(comparisons.id, id));
    return comparison || undefined;
  }

  async getScoutingReport(playerId: number, season: string): Promise<ScoutingReport | undefined> {
    if (!db) return undefined;
    const [report] = await db.select().from(scoutingReports).where(and(eq(scoutingReports.playerId, playerId), eq(scoutingReports.season, season)));
    return report || undefined;
  }

  async createScoutingReport(insertReport: InsertScoutingReport): Promise<ScoutingReport> {
    if (!db) throw new Error('No database connection');
    const [report] = await db.insert(scoutingReports).values(insertReport).returning();
    return report;
  }

  async updateScoutingReport(id: number, updateData: Partial<InsertScoutingReport>): Promise<ScoutingReport | undefined> {
    if (!db) return undefined;
    const [report] = await db.update(scoutingReports).set({ ...updateData, lastUpdated: new Date() }).where(eq(scoutingReports.id, id)).returning();
    return report || undefined;
  }
}

// Export the appropriate storage based on whether a DB is available
export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemoryStorage();
