export interface PlayerStats {
  goals: number;
  assists: number;
  tacklesWon: number;
  passesCompleted: number;
  yellowCards: number;
  bigChancesMissed: number;
}

export function calculatePlayerRating(stats: PlayerStats | undefined | null): number {
  let rating = 6.0; // Base score

  if (!stats) return rating;

  // Calculs ultra-précis selon demande
  rating += (stats.goals || 0) * 0.5;
  rating += (stats.assists || 0) * 0.3;
  rating += (stats.tacklesWon || 0) * 0.1;
  rating += (stats.passesCompleted || 0) * 0.05;
  
  rating -= (stats.yellowCards || 0) * 0.2;
  rating -= (stats.bigChancesMissed || 0) * 0.1;

  // Capping
  if (rating > 10.0) rating = 10.0;
  if (rating < 1.0) rating = 1.0;

  // Arrondir à 1 décimale
  return Math.round(rating * 10) / 10;
}
