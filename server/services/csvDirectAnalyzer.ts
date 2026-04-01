import fs from 'fs';
import path from 'path';

export interface PlayerData {
  Rk: number;
  Player: string;
  Nation: string;
  Pos: string;
  Squad: string;
  Comp: string;
  Age: number;
  Born: number;
  MP: number;
  Starts: number;
  Min: number;
  '90s': number;
  Gls: number;
  Ast: number;
  'G+A': number;
  'G-PK': number;
  PK: number;
  PKatt: number;
  CrdY: number;
  CrdR: number;
  xG: number;
  npxG: number;
  xAG: number;
  'npxG+xAG': number;
  'G+A-PK': number;
  'xG+xAG': number;
  PrgC: number;
  PrgP: number;
  PrgR: number;
  Sh: number;
  SoT: number;
  'SoT%': number;
  'Sh/90': number;
  'SoT/90': number;
  'G/Sh': number;
  'G/SoT': number;
  Dist: number;
  FK: number;
  Tkl: number;
  Int: number;
  Clr: number;
  'Cmp%': number;
  Cmp: number;
  Att: number;
  TotDist: number;
  PrgDist: number;
  Touches: number;
  'Succ%': number;
  Succ: number;
  'Tkld%': number;
  Tkld: number;
  Carries: number;
  Won: number;
  Lost_stats_misc: number;
  'Won%': number;
  [key: string]: any;
}

export class CSVDirectAnalyzer {
  private currentCsvPath = path.join(process.cwd(), 'players_data_2025_2026.csv');
  private historicalCsvPath = path.join(process.cwd(), 'players_data-2024_2025_1751387048911.csv');
  private playersData: PlayerData[] = [];
  private historicalData: PlayerData[] = [];
  private loaded = false;

  constructor() {
    console.log(`[CSV] Initializing CSVDirectAnalyzer...`);
    console.log(`[CSV] CWD: ${process.cwd()}`);
    console.log(`[CSV] Current CSV path: ${this.currentCsvPath}`);
    console.log(`[CSV] Historical CSV path: ${this.historicalCsvPath}`);
  }

  private async loadData(): Promise<void> {
    if (this.loaded && this.playersData.length > 0) return;

    try {
      // 1. Charger les données actuelles
      const currentData = await this.readAndParseCsv(this.currentCsvPath);
      console.log(`[CSV] readAndParseCsv for current path returned ${currentData.length} players`);
      console.log(`Loaded ${currentData.length} players from current dataset (2025/26)`);

      // 2. Charger les données historiques si disponibles
      let historicalData: PlayerData[] = [];
      if (fs.existsSync(this.historicalCsvPath)) {
        historicalData = await this.readAndParseCsv(this.historicalCsvPath);
        console.log(`Loaded ${historicalData.length} players from historical dataset (2024/25)`);
      }

      // 3. Fusionner les données pour compléter les stats manquantes
      this.playersData = this.mergeDatasets(currentData, historicalData);
      this.historicalData = historicalData;
      
      this.loaded = true;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      throw error;
    }
  }

  public async reloadData(): Promise<void> {
    console.log("🔄 [CSV] Demande de rechargement des données FBref...");
    this.loaded = false;
    this.playersData = [];
    this.historicalData = [];
    await this.loadData();
    console.log(`✅ [CSV] Rechargement terminé. Nouvelles données en mémoire.`);
  }

  private async readAndParseCsv(csvPath: string): Promise<PlayerData[]> {
    if (!fs.existsSync(csvPath)) return [];
    
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');
    console.error(`[CSV DEBUG] Parsing ${csvPath}: ${lines.length} lines found`);
    const headers = this.parseCSVLine(lines[0]);
    console.error(`[CSV DEBUG] Parsed headers (count ${headers.length}): ${headers.join('|')}`);

    if (lines.length <= 1) {
      console.error(`[CSV DEBUG] File ${csvPath} appears to have only headers or be empty.`);
      return [];
    }

    return lines.slice(1).filter(line => line.trim()).map((line, idx) => {
      const values = this.parseCSVLine(line);
      const player: any = {};

      headers.forEach((header, index) => {
        let value: any = values[index] || '';
        if (typeof value === 'string') value = value.trim();
        
        if (!isNaN(Number(value)) && value !== '' && value !== null) {
          value = Number(value);
        } else if (value === '' || value === 'null' || value === 'undefined') {
          value = null;
        }
        player[header.trim()] = value;
      });
      return player as PlayerData;
    });
  }

  private mergeDatasets(current: PlayerData[], historical: PlayerData[]): PlayerData[] {
    if (historical.length === 0) return current;

    const normalize = (n: string) => n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const historicalMap = new Map<string, PlayerData>();
    historical.forEach(p => {
      if (p.Player) historicalMap.set(normalize(p.Player), p);
    });

    return current.map(p => {
      if (!p.Player) return p;
      const cpName = normalize(p.Player);
      let hMatch = historicalMap.get(cpName);

      if (!hMatch) {
        const cpLastName = cpName.split(' ').pop() || '';
        hMatch = historical.find(h => {
          const hNameNorm = normalize(h.Player || '');
          if (hNameNorm.includes(cpName) || cpName.includes(hNameNorm)) return true;
          const hLastName = hNameNorm.split(' ').pop() || '';
          if (cpLastName.length > 3 && cpLastName === hLastName) return true;
          return false;
        });
      }
      if (!hMatch) return p;

      // Stats à récupérer si absentes (0 ou null) dans le fichier light 2025/26
      const advancedStats = [
        'Cmp%', 'PrgP', 'PrgC', 'Succ%', 'Int', 'Blocks', 'Tkl',
        'xG', 'xAG', 'Height', 'Weight', 'Foot'
      ];

      const merged = { ...p };
      advancedStats.forEach(stat => {
        const val = merged[stat];
        if (val === undefined || val === null || val === 0 || val === '') {
          // Chercher dans l'historique avec les noms possibles (avec suffixes)
          const fallbackVal = hMatch[stat] ?? 
                             hMatch[`${stat}_stats_passing`] ?? 
                             hMatch[`${stat}_stats_possession`] ?? 
                             hMatch[`${stat}_stats_defense`];
          
          if (fallbackVal !== undefined && fallbackVal !== null) {
            (merged as any)[stat] = fallbackVal;
          }
        }
      });

      return merged;
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quote escape
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }

  async getAllPlayers(): Promise<PlayerData[]> {
    await this.loadData();
    return this.playersData;
  }

  async searchPlayers(query: string): Promise<PlayerData[]> {
    await this.loadData();
    const searchTerm = query.toLowerCase();

    return this.playersData.filter(player => 
      player.Player?.toLowerCase().includes(searchTerm) ||
      player.Squad?.toLowerCase().includes(searchTerm)
    ).slice(0, 20);
  }

  async getPlayerByName(name: string): Promise<PlayerData | null> {
    await this.loadData();
    const searchName = decodeURIComponent(name).trim().toLowerCase();
    
    // Recherche exacte d'abord
    let player = this.playersData.find(player => 
      player.Player?.trim().toLowerCase() === searchName
    );
    
    // Si pas trouvé, recherche partielle
    if (!player) {
      player = this.playersData.find(player => 
        player.Player?.trim().toLowerCase().includes(searchName) ||
        searchName.includes(player.Player?.trim().toLowerCase() || '')
      );
    }
    
    // Si toujours pas trouvé, recherche par mots-clés
    if (!player) {
      const searchWords = searchName.split(' ').filter(word => word.length > 2);
      player = this.playersData.find(player => {
        const playerName = player.Player?.trim().toLowerCase() || '';
        return searchWords.every(word => playerName.includes(word));
      });
    }
    
    return player || null;
  }

  async getPlayersByTeam(team: string): Promise<PlayerData[]> {
    await this.loadData();
    return this.playersData.filter(player => 
      player.Squad?.toLowerCase().includes(team.toLowerCase())
    );
  }

  async getPlayersByPosition(position: string): Promise<PlayerData[]> {
    await this.loadData();
    return this.playersData.filter(player => 
      player.Pos?.includes(position)
    );
  }

  async getTopScorers(limit: number = 10): Promise<PlayerData[]> {
    await this.loadData();
    return this.playersData
      .filter(player => player.Gls > 0)
      .sort((a, b) => (b.Gls || 0) - (a.Gls || 0))
      .slice(0, limit);
  }

  async getTopAssists(limit: number = 10): Promise<PlayerData[]> {
    await this.loadData();
    return this.playersData
      .filter(player => player.Ast > 0)
      .sort((a, b) => (b.Ast || 0) - (a.Ast || 0))
      .slice(0, limit);
  }

  async getLeagueStats(): Promise<any> {
    await this.loadData();
    const leagues: Record<string, number> = {};

    this.playersData.forEach(player => {
      if (player.Comp) {
        leagues[player.Comp] = (leagues[player.Comp] || 0) + 1;
      }
    });

    return {
      totalPlayers: this.playersData.length,
      leagues,
      topLeagues: Object.entries(leagues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  async getTeamStats(): Promise<any> {
    await this.loadData();
    const teams: Record<string, number> = {};

    this.playersData.forEach(player => {
      if (player.Squad) {
        teams[player.Squad] = (teams[player.Squad] || 0) + 1;
      }
    });

    return {
      totalTeams: Object.keys(teams).length,
      teams,
      topTeams: Object.entries(teams)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }

  calculatePercentiles(player: PlayerData, position: string): Record<string, number> {
    // Si le joueur n'a pas de stats techniques, on utilise le dataset historique comme base de comparaison
    // pour garantir des percentiles réalistes et non nuls.
    const hasTechnicalStats = (player['Cmp%'] || 0) > 0 || (player.PrgP || 0) > 0;
    const referenceData = (hasTechnicalStats || this.historicalData.length === 0) 
      ? this.playersData 
      : this.historicalData;

    const positionPlayers = referenceData.filter(p => 
      p.Pos?.includes(position) && (p.Min || 0) >= 90
    );

    if (positionPlayers.length < 2) return {
      goals: 50, assists: 50, xG: 50, xAG: 50, shots: 50,
      passCompletion: 50, tackles: 50, interceptions: 50,
      progressivePasses: 50, dribbleSuccess: 50
    };

    const calculatePercentile = (value: number, column: string): number => {
      const allValues = positionPlayers
        .map(p => {
          // Essayer les noms de colonnes alternatifs si nécessaire
          const v = p[column] ?? p[`${column}_stats_passing`] ?? p[`${column}_stats_possession`] ?? p[`${column}_stats_defense`];
          return v;
        })
        .filter(v => v !== null && v !== undefined && !isNaN(Number(v))) as number[];
      
      if (allValues.length === 0) return 0;

      const sorted = allValues.sort((a, b) => a - b);
      const rank = sorted.filter(v => v < value).length;
      return Math.round((rank / sorted.length) * 100);
    };

    return {
      goals: calculatePercentile(player.Gls || 0, 'Gls'),
      assists: calculatePercentile(player.Ast || 0, 'Ast'),
      xG: calculatePercentile(player.xG || 0, 'xG'),
      xAG: calculatePercentile(player.xAG || 0, 'xAG'),
      shots: calculatePercentile(player.Sh || 0, 'Sh'),
      passCompletion: calculatePercentile(player['Cmp%'] || 0, 'Cmp%'),
      tackles: calculatePercentile(player.Tkl || 0, 'Tkl'),
      interceptions: calculatePercentile(player.Int || 0, 'Int'),
      progressivePasses: calculatePercentile(player.PrgP || 0, 'PrgP'),
      dribbleSuccess: calculatePercentile(player['Succ%'] || 0, 'Succ%'),
    };
  }

  generatePlayerAnalysis(player: PlayerData): any {
    const percentiles = this.calculatePercentiles(player, player.Pos?.split(',')[0] || 'MF');

    // Analyse des forces et faiblesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(percentiles).forEach(([stat, percentile]) => {
      if (percentile >= 80) {
        strengths.push(this.getStatDisplayName(stat));
      } else if (percentile <= 20) {
        weaknesses.push(this.getStatDisplayName(stat));
      }
    });

    // Style de jeu
    let playingStyle = 'Joueur polyvalent';
    if (percentiles.goals > 80 && percentiles.shots > 70) {
      playingStyle = 'Finisseur élite';
    } else if (percentiles.assists > 80 && percentiles.progressivePasses > 70) {
      playingStyle = 'Créateur de jeu';
    } else if (percentiles.tackles > 80 && percentiles.interceptions > 70) {
      playingStyle = 'Défenseur solide';
    } else if (percentiles.dribbleSuccess > 80) {
      playingStyle = 'Dribbleur technique';
    }

    // Note globale
    const avgPercentile = Object.values(percentiles).reduce((a, b) => a + b, 0) / Object.values(percentiles).length;
    const overallRating = Math.round(50 + (avgPercentile - 50) * 0.8); // Note sur 100

    // Analyse de progression et tendances
    const progressionAnalysis = this.generateProgressionAnalysis(player, percentiles);
    
    return {
      player,
      percentiles,
      strengths,
      weaknesses,
      playingStyle,
      overallRating,
      progression: progressionAnalysis,
      stats: {
        goalsPerGame: player.Min > 0 ? ((player.Gls || 0) / (player.Min / 90)).toFixed(2) : '0.00',
        assistsPerGame: player.Min > 0 ? ((player.Ast || 0) / (player.Min / 90)).toFixed(2) : '0.00',
        minutesPlayed: player.Min || 0,
        appearances: player.MP || 0,
        yellowCards: player.CrdY || 0,
        redCards: player.CrdR || 0,
      }
    };
  }

  async getSimilarPlayers(targetName: string, k: number = 3): Promise<PlayerData[]> {
    await this.loadData();
    const target = await this.getPlayerByName(targetName);
    if (!target) return [];

    const { PlayerSimilarityService } = await import('./playerSimilarityService');
    return PlayerSimilarityService.getSimilarPlayers(target, this.playersData, k);
  }

  async getPlayerWeaknesses(playerName: string): Promise<{ weaknesses: string[], suggestions: string[] }> {
    await this.loadData();
    const player = await this.getPlayerByName(playerName);
    if (!player) return { weaknesses: [], suggestions: [] };

    const { WeaknessAnalysisService } = await import('./weaknessAnalysisService');
    const weaknesses = WeaknessAnalysisService.detectWeaknesses(player);
    const suggestions = WeaknessAnalysisService.getImprovementSuggestions(player, weaknesses);

    return { weaknesses, suggestions };
  }

  public generateProgressionAnalysis(player: PlayerData, percentiles: Record<string, number>): any {
    const progressionAreas: any[] = [];
    const age = player.Age || 25;
    const goals = player.Gls || 0;
    const assists = player.Ast || 0;
    const matches = player.MP || 0;
    const minutes = player.Min || 0;
    const position = player.Pos?.split(',')[0] || 'MF';

    // Finition
    if (position.includes('FW') || position.includes('MF')) {
      const goalsPerGame = matches > 0 ? goals / matches : 0;
      if (goalsPerGame < 0.3 && percentiles.xG > 60) {
        progressionAreas.push({
          domain: 'Finition et efficacité',
          currentLevel: `${goalsPerGame.toFixed(2)} but/match (peut mieux faire)`,
          potential: 'Très élevé',
          timeline: '3-6 mois',
          recommendation: 'Travail spécifique de finition, exercices devant le but, analyse vidéo des occasions manquées'
        });
      }
    }

    // Création de jeu
    if (position.includes('MF') || position.includes('FW')) {
      const assistsPerGame = matches > 0 ? assists / matches : 0;
      if (assistsPerGame < 0.25 && (percentiles.progressivePasses < 70 || percentiles.assists < 50)) {
        progressionAreas.push({
          domain: 'Création et passes décisives',
          currentLevel: `${assistsPerGame.toFixed(2)} passe/match`,
          potential: 'Élevé',
          timeline: '6-12 mois',
          recommendation: 'Améliorer la vision de jeu, travail sur les centres et passes dans la surface'
        });
      }
    }

    // Régularité de temps de jeu
    if (minutes < 2000 && age < 26) {
      progressionAreas.push({
        domain: 'Temps de jeu et titularisation',
        currentLevel: `${minutes} minutes cette saison`,
        potential: 'Élevé',
        timeline: '6-18 mois',
        recommendation: 'Améliorer la condition physique, montrer plus de polyvalence tactique'
      });
    }

    // Développement physique pour les jeunes
    if (age < 24) {
      progressionAreas.push({
        domain: 'Développement physique et maturité',
        currentLevel: `${age} ans - En développement`,
        potential: 'Très élevé',
        timeline: '12-24 mois',
        recommendation: 'Programme physique adapté, gain en puissance et endurance'
      });
    }

    // Expérience internationale/Européenne
    const bigClubs = ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea', 'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG'];
    if (!bigClubs.some(club => player.Squad?.includes(club)) && age < 27) {
      progressionAreas.push({
        domain: 'Progression vers un club de top niveau',
        currentLevel: `Actuellement à ${player.Squad}`,
        potential: 'Élevé',
        timeline: '12-36 mois',
        recommendation: 'Maintenir le niveau, viser les compétitions européennes'
      });
    }

    // Statistiques défensives pour tous les postes
    if ((percentiles.tackles < 40 || percentiles.interceptions < 40) && !position.includes('GK')) {
      progressionAreas.push({
        domain: 'Contribution défensive',
        currentLevel: 'Faible implication défensive',
        potential: 'Moyen',
        timeline: '6-12 mois',
        recommendation: 'Améliorer le pressing et le repli défensif'
      });
    }

    // Projection de valeur marchande
    const currentValue = this.estimateMarketValue(player);
    const projectedValue = this.projectMarketValue(player, progressionAreas);

    // Calculs avancés pour une analyse plus précise
    const performanceRating = this.calculatePerformanceRating(player);
    const PotentialCeiling = this.calculatePotentialCeiling(player, progressionAreas); // Correction camelCase potentialCeiling
    const transferProbability = this.calculateTransferProbability(player);
    
    return {
      progressionAreas,
      timeline: {
        shortTerm: progressionAreas.filter(area => area.timeline.includes('3-6')),
        mediumTerm: progressionAreas.filter(area => area.timeline.includes('6-12') || area.timeline.includes('6-18')),
        longTerm: progressionAreas.filter(area => area.timeline.includes('12-24') || area.timeline.includes('12-36'))
      },
      marketValue: {
        current: currentValue,
        projected: projectedValue,
        potentialGain: projectedValue - currentValue,
        projectedIn2Years: Math.round(projectedValue * 1.2 / 500000) * 500000,
        confidence: this.calculateMarketValueConfidence(player)
      },
      performance: {
        currentRating: performanceRating,
        potentialCeiling: PotentialCeiling,
        consistencyScore: this.calculateConsistency(player),
        improvementAreas: progressionAreas.length
      },
      transferMarket: {
        probability: transferProbability,
        bestFitLeagues: this.suggestBestFitLeagues(player),
        estimatedTransferFee: Math.round(currentValue * 1.1 / 500000) * 500000
      },
      riskFactors: this.identifyRiskFactors(player),
      recommendation: this.generateProgressionRecommendation(player, progressionAreas),
      keyMetrics: {
        goalsPerGame: player.MP > 0 ? (player.Gls / player.MP).toFixed(2) : '0.00',
        assistsPerGame: player.MP > 0 ? (player.Ast / player.MP).toFixed(2) : '0.00',
        minutesPerMatch: player.MP > 0 ? Math.round(player.Min / player.MP) : 0,
        contributionPerGame: player.MP > 0 ? ((player.Gls + player.Ast) / player.MP).toFixed(2) : '0.00'
      }
    };
  }

  private calculateConsistency(player: PlayerData): number {
    // Basé sur le ratio entre performances attendues et réelles
    const xGOverPerformance = Math.abs((player.Gls || 0) - (player.xG || 0));
    const xAOverPerformance = Math.abs((player.Ast || 0) - (player.xAG || 0));
    
    // Plus l'écart est petit, plus le joueur est régulier
    const consistencyScore = 100 - (xGOverPerformance + xAOverPerformance) * 10;
    return Math.max(0, Math.min(100, consistencyScore));
  }

  public estimateMarketValue(player: PlayerData): number {
    const age = player.Age || 25;
    const percentiles = this.calculatePercentiles(player, player.Pos?.split(',')[0] || 'MF');
    const avgPercentile = Object.values(percentiles).reduce((a, b) => a + b, 0) / Object.values(percentiles).length;

    // Base value calculation - Plus réaliste
    let baseValue = 5000000; // 5M base pour les joueurs pros
    
    // Performance factor (plus important)
    const performanceMultiplier = Math.max(0.3, (avgPercentile / 50));
    baseValue *= performanceMultiplier;
    
    // Statistiques spécifiques importantes
    const goals = player.Gls || 0;
    const assists = player.Ast || 0;
    const minutes = player.Min || 0;
    const matches = player.MP || 0;
    
    // Bonus pour les performances exceptionnelles
    if (goals >= 15) baseValue *= 1.8; // Buteur prolifique
    else if (goals >= 10) baseValue *= 1.4;
    else if (goals >= 5) baseValue *= 1.2;
    
    if (assists >= 10) baseValue *= 1.6; // Excellent passeur
    else if (assists >= 5) baseValue *= 1.3;
    
    if (minutes >= 2500) baseValue *= 1.3; // Joueur titulaire indiscutable
    else if (minutes >= 1800) baseValue *= 1.1;
    
    // Age factor (plus nuancé)
    if (age < 20) baseValue *= 2.0; // Très grand potentiel
    else if (age < 23) baseValue *= 1.7; // Potentiel élevé  
    else if (age < 26) baseValue *= 1.3; // Dans la force de l'âge
    else if (age < 30) baseValue *= 1.0; // Pic de carrière
    else if (age < 33) baseValue *= 0.7; // Début de déclin
    else baseValue *= 0.4; // Fin de carrière
    
    // League factor (plus réaliste)
    const league = player.Comp;
    if (league?.includes('Premier League')) {
      baseValue *= 3.5; // Premier League = prix premium
    } else if (league?.includes('La Liga') || league?.includes('Serie A') || league?.includes('Bundesliga')) {
      baseValue *= 2.8; // Autres top 4 ligues
    } else if (league?.includes('Ligue 1')) {
      baseValue *= 2.2; // Ligue 1
    } else if (league?.includes('Primeira Liga') || league?.includes('Eredivisie')) {
      baseValue *= 1.8; // Ligues secondaires fortes
    } else {
      baseValue *= 1.2; // Autres ligues
    }

    // Position factor
    const position = player.Pos?.split(',')[0] || 'MF';
    if (position.includes('FW') || position.includes('CF')) {
      baseValue *= 1.4; // Attaquants plus chers
    } else if (position.includes('MF') && (goals >= 8 || assists >= 8)) {
      baseValue *= 1.3; // Milieux créatifs
    } else if (position.includes('DF') && percentiles.tackles > 70) {
      baseValue *= 1.1; // Défenseurs solides
    }

    // Bonus pour les clubs prestigieux
    const prestigiousClubs = ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea', 'Tottenham', 
                             'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Bayern Munich', 
                             'PSG', 'Manchester United', 'Juventus', 'AC Milan', 'Inter Milan'];
    if (prestigiousClubs.some(club => player.Squad?.includes(club))) {
      baseValue *= 1.5;
    }

    return Math.round(baseValue / 500000) * 500000; // Round to nearest 500k pour plus de réalisme
  }

  public projectMarketValue(player: PlayerData, progressionAreas: any[]): number {
    const currentValue = this.estimateMarketValue(player);
    const age = player.Age || 25;
    
    let multiplier = 1;
    
    // High potential areas increase value projection
    const highPotentialAreas = progressionAreas.filter(area => area.potential === 'Très élevé' || area.potential === 'Élevé');
    multiplier += highPotentialAreas.length * 0.3;
    
    // Age factor for projection
    if (age < 23) multiplier += 0.5;
    else if (age < 26) multiplier += 0.2;
    else if (age > 29) multiplier -= 0.1;
    
    return Math.round(currentValue * multiplier / 100000) * 100000;
  }

  private identifyRiskFactors(player: PlayerData): string[] {
    const risks: string[] = [];
    const age = player.Age || 25;
    
    if (age > 29) risks.push('Âge - Déclin physique potentiel');
    if ((player.CrdY || 0) > 8) risks.push('Discipline - Cartons jaunes fréquents');
    if ((player.CrdR || 0) > 1) risks.push('Discipline - Cartons rouges');
    if ((player.Min || 0) < 1000) risks.push('Temps de jeu limité cette saison');
    
    const injuryRisk = this.calculateInjuryRisk(player);
    if (injuryRisk > 0.3) risks.push('Risque de blessure modéré');
    
    return risks;
  }

  private calculateInjuryRisk(player: PlayerData): number {
    // Estimation basée sur l'âge et l'intensité de jeu
    const age = player.Age || 25;
    const minutesPlayed = player.Min || 0;
    
    let risk = 0;
    if (age > 30) risk += 0.2;
    if (minutesPlayed > 2500) risk += 0.1; // Surcharge
    if (minutesPlayed < 500) risk += 0.1; // Manque de rythme
    
    return Math.min(1, risk);
  }

  private generateProgressionRecommendation(player: PlayerData, progressionAreas: any[]): string {
    const age = player.Age || 25;
    const position = player.Pos?.split(',')[0] || 'MF';
    const goals = player.Gls || 0;
    const assists = player.Ast || 0;
    const minutes = player.Min || 0;
    
    // Recommandation basée sur le profil réel du joueur
    let recommendation = `Analyse pour ${player.Player} (${age} ans, ${position}) - `;
    
    if (age < 21) {
      recommendation += "Joueur en plein développement. ";
      if (minutes > 1500) {
        recommendation += "Bon temps de jeu pour son âge, continuer à accumuler l'expérience. ";
      }
      recommendation += "Focus sur: technique individuelle, compréhension tactique, développement physique.";
    } else if (age < 25) {
      recommendation += "Période décisive de la carrière. ";
      if (goals + assists > 10) {
        recommendation += "Statistiques prometteuses, viser la régularité. ";
      }
      if (minutes < 2000) {
        recommendation += "Améliorer le temps de jeu pour franchir un palier. ";
      }
      recommendation += "Priorités: consolidation des acquis, spécialisation dans son poste, leadership naissant.";
    } else if (age < 29) {
      recommendation += "Pic de carrière attendu. ";
      if (progressionAreas.length > 2) {
        recommendation += "Plusieurs axes d'amélioration identifiés pour maximiser le potentiel. ";
      }
      recommendation += "Objectifs: excellence dans sa spécialité, influence sur l'équipe, ambitions européennes.";
    } else {
      recommendation += "Joueur mature et expérimenté. ";
      recommendation += "Focus: transmission d'expérience, adaptation tactique, gestion intelligente de l'effort.";
    }
    
    return recommendation;
  }

  private calculatePerformanceRating(player: PlayerData): number {
    const percentiles = this.calculatePercentiles(player, player.Pos?.split(',')[0] || 'MF');
    const avgPercentile = Object.values(percentiles).reduce((a, b) => a + b, 0) / Object.values(percentiles).length;
    return Math.round(avgPercentile);
  }

  private calculatePotentialCeiling(player: PlayerData, progressionAreas: any[]): number {
    const currentRating = this.calculatePerformanceRating(player);
    const age = player.Age || 25;
    
    let ceiling = currentRating;
    
    // Bonus d'âge
    if (age < 21) ceiling += 25;
    else if (age < 24) ceiling += 15;
    else if (age < 27) ceiling += 8;
    else if (age < 30) ceiling += 3;
    
    // Bonus selon les domaines d'amélioration
    ceiling += progressionAreas.length * 5;
    
    return Math.min(95, ceiling); // Plafond réaliste
  }

  private calculateTransferProbability(player: PlayerData): number {
    const age = player.Age || 25;
    const goals = player.Gls || 0;
    const assists = player.Ast || 0;
    const minutes = player.Min || 0;
    
    let probability = 0.1; // Base 10%
    
    // Facteurs augmentant la probabilité
    if (goals + assists > 15) probability += 0.3;
    else if (goals + assists > 10) probability += 0.2;
    else if (goals + assists > 5) probability += 0.1;
    
    if (age < 26) probability += 0.2;
    if (minutes > 2000) probability += 0.15;
    
    // Clubs attractifs
    const bigClubs = ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea'];
    if (bigClubs.some(club => player.Squad?.includes(club))) {
      probability -= 0.1; // Moins de chance de partir
    }
    
    return Math.min(0.8, Math.max(0.05, probability));
  }

  private calculateMarketValueConfidence(player: PlayerData): string {
    const minutes = player.Min || 0;
    const matches = player.MP || 0;
    
    if (minutes < 500) return 'Faible';
    if (minutes > 2000 && matches > 20) return 'Élevée';
    return 'Moyenne';
  }

  private suggestBestFitLeagues(player: PlayerData): string[] {
    const currentLeague = player.Comp || '';
    const goals = player.Gls || 0;
    const assists = player.Ast || 0;
    const age = player.Age || 25;
    
    const suggestions: string[] = [];
    
    if (currentLeague.includes('Premier League')) {
      if (goals + assists > 10) {
        suggestions.push('La Liga', 'Serie A', 'Bundesliga');
      } else {
        suggestions.push('Championship', 'Ligue 1');
      }
    } else if (currentLeague.includes('Ligue 1')) {
      if (goals + assists > 8 && age < 26) {
        suggestions.push('Premier League', 'Serie A');
      } else {
        suggestions.push('Bundesliga', 'Eredivisie');
      }
    } else {
      suggestions.push('Premier League', 'Ligue 1', 'Serie A');
    }
    
    return suggestions.slice(0, 3);
  }

  private getStatDisplayName(stat: string): string {
    const displayNames: Record<string, string> = {
      goals: 'Buts',
      assists: 'Passes décisives',
      xG: 'Expected Goals',
      xAG: 'Expected Assists',
      shots: 'Tirs',
      passCompletion: 'Précision des passes',
      tackles: 'Tacles',
      interceptions: 'Interceptions',
      progressivePasses: 'Passes progressives',
      dribbleSuccess: 'Dribbles réussis'
    };
    return displayNames[stat] || stat;
  }
}

export const csvDirectAnalyzer = new CSVDirectAnalyzer();